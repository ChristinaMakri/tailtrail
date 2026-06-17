import { useState, useCallback } from 'react'
import { supabase, getPetImageUrl } from '../lib/supabase'
import { Match } from '../types'

export function useMatches() {
  const [loading, setLoading] = useState(false)

  const fetchMatches = useCallback(async (userId: string): Promise<Match[]> => {
    setLoading(true)
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        lost_pet:pets!matches_lost_pet_id_fkey(*, images:pet_images(*)),
        found_pet:pets!matches_found_pet_id_fkey(*, images:pet_images(*))
      `)
      .or(`lost_pet.user_id.eq.${userId},found_pet.user_id.eq.${userId}`)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    setLoading(false)
    if (error || !data) return []

    return data.map(m => ({
      ...m,
      lost_pet: m.lost_pet ? hydratePetImages(m.lost_pet) : undefined,
      found_pet: m.found_pet ? hydratePetImages(m.found_pet) : undefined,
    }))
  }, [])

  const updateMatchStatus = useCallback(async (
    matchId: string,
    status: 'confirmed' | 'rejected',
  ): Promise<string | null> => {
    const { error } = await supabase
      .from('matches')
      .update({ status })
      .eq('id', matchId)
    return error?.message ?? null
  }, [])

  return { loading, fetchMatches, updateMatchStatus }
}

function hydratePetImages(pet: any) {
  return {
    ...pet,
    images: (pet.images ?? []).map((img: any) => ({
      ...img,
      url: getPetImageUrl(img.storage_path),
    })),
  }
}
