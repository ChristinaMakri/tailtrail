import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const HF_TOKEN = Deno.env.get('HUGGINGFACE_TOKEN')!

const ANIMAL_CLASSIFIER = 'https://api-inference.huggingface.co/models/google/vit-base-patch16-224'
const NSFW_CLASSIFIER = 'https://api-inference.huggingface.co/models/Falconsai/nsfw_image_detection'
const ANIMAL_KEYWORDS = ['cat', 'dog', 'animal', 'pet', 'canine', 'feline', 'kitten', 'puppy', 'bird', 'rabbit']

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

serve(async (req) => {
  try {
    const { storagePath } = await req.json()
    if (!storagePath) return error('Missing storagePath', 400)

    const { data: fileData } = await supabase.storage
      .from('pet-images')
      .download(storagePath)

    if (!fileData) return error('Could not download image', 500)

    const imageBytes = new Uint8Array(await fileData.arrayBuffer())
    const headers = { Authorization: `Bearer ${HF_TOKEN}` }

    const [classifyRes, nsfwRes] = await Promise.all([
      fetch(ANIMAL_CLASSIFIER, { method: 'POST', headers, body: imageBytes }),
      fetch(NSFW_CLASSIFIER,   { method: 'POST', headers, body: imageBytes }),
    ])

    let isAnimal = false
    let isNsfw = false

    if (classifyRes.ok) {
      const labels: { label: string; score: number }[] = await classifyRes.json()
      isAnimal = labels.some(
        l => ANIMAL_KEYWORDS.some(k => l.label.toLowerCase().includes(k)) && l.score > 0.1,
      )
    }

    if (nsfwRes.ok) {
      const nsfwLabels: { label: string; score: number }[] = await nsfwRes.json()
      const nsfwScore = nsfwLabels.find(l => l.label.toLowerCase() === 'nsfw')?.score ?? 0
      isNsfw = nsfwScore > 0.85
    }

    return ok({ isAnimal, isNsfw, approved: isAnimal && !isNsfw })
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
