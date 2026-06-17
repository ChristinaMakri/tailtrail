import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const HF_TOKEN = Deno.env.get('HUGGINGFACE_TOKEN')!
const CLIP_API = 'https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32'
const MODERATION_API = 'https://api-inference.huggingface.co/models/google/vit-base-patch16-224'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

serve(async (req) => {
  try {
    const { petId } = await req.json()
    if (!petId) return error('Missing petId', 400)

    const { data: pet } = await supabase
      .from('pets')
      .select('*, images:pet_images(storage_path, is_primary)')
      .eq('id', petId)
      .single()

    if (!pet) return error('Pet not found', 404)

    const primaryImg = pet.images?.find((i: any) => i.is_primary) ?? pet.images?.[0]
    if (!primaryImg) return error('No images found', 422)

    const { data: fileData } = await supabase.storage
      .from('pet-images')
      .download(primaryImg.storage_path)

    if (!fileData) return error('Could not download image', 500)

    const imageBytes = new Uint8Array(await fileData.arrayBuffer())

    // Moderation: verify the image contains an animal
    const moderationRes = await fetch(MODERATION_API, {
      method: 'POST',
      headers: { Authorization: `Bearer ${HF_TOKEN}` },
      body: imageBytes,
    })

    if (moderationRes.ok) {
      const labels: { label: string; score: number }[] = await moderationRes.json()
      const animalKeywords = ['cat', 'dog', 'animal', 'pet', 'canine', 'feline', 'kitten', 'puppy', 'bird']
      const isAnimal = labels.some(
        l => animalKeywords.some(k => l.label.toLowerCase().includes(k)) && l.score > 0.15,
      )
      if (!isAnimal) {
        await supabase
          .from('pets')
          .update({ status: 'closed' })
          .eq('id', petId)
        return ok({ success: false, reason: 'Image does not appear to contain an animal' })
      }
    }

    // Generate CLIP embedding
    const embeddingRes = await fetch(CLIP_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/octet-stream',
      },
      body: imageBytes,
    })

    if (!embeddingRes.ok) {
      const txt = await embeddingRes.text()
      return error(`HuggingFace error: ${txt}`, 502)
    }

    const embedding: number[] = await embeddingRes.json()

    await supabase
      .from('pets')
      .update({ embedding, embedding_ready: true })
      .eq('id', petId)

    // Find matches immediately after embedding is ready
    await supabase.functions.invoke('find-matches', { body: { petId } })

    return ok({ success: true })
  } catch (e) {
    return error(String(e), 500)
  }
})

function ok(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
}

function error(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })
}
