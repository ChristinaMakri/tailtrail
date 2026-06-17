import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SIMILARITY_THRESHOLD = 0.55
const MAX_MATCHES = 20

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

serve(async (req) => {
  try {
    const { petId } = await req.json()
    if (!petId) return error('Missing petId', 400)

    const { data: pet } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .eq('embedding_ready', true)
      .single()

    if (!pet?.embedding) return error('Pet has no embedding', 422)

    const oppositeType = pet.type === 'lost' ? 'found' : 'lost'

    // Vector similarity + distance ranking query
    const { data: candidates, error: qErr } = await supabase.rpc('find_similar_pets', {
      query_embedding: pet.embedding,
      query_lat: pet.location_lat,
      query_lng: pet.location_lng,
      pet_type: oppositeType,
      similarity_threshold: SIMILARITY_THRESHOLD,
      radius_km: 100,
      max_results: MAX_MATCHES,
    })

    if (qErr) return error(qErr.message, 500)
    if (!candidates?.length) return ok({ matched: 0 })

    const lostPetId  = pet.type === 'lost' ? pet.id : null
    const foundPetId = pet.type === 'found' ? pet.id : null

    const rows = candidates.map((c: any) => ({
      lost_pet_id:      lostPetId  ?? c.id,
      found_pet_id:     foundPetId ?? c.id,
      similarity_score: c.similarity,
      distance_km:      c.distance_km,
      status:           'pending',
    }))

    const { error: insertErr } = await supabase
      .from('matches')
      .upsert(rows, { onConflict: 'lost_pet_id,found_pet_id', ignoreDuplicates: true })

    if (insertErr) return error(insertErr.message, 500)

    // Push notifications for new matches
    for (const candidate of candidates) {
      await supabase.functions.invoke('send-notification', {
        body: {
          petId: candidate.id,
          matchedPetId: pet.id,
          similarity: candidate.similarity,
        },
      }).catch(() => {}) // non-blocking
    }

    return ok({ matched: rows.length })
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
