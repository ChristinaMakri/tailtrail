import { useState, useCallback } from 'react'
import { supabase, getPetImageUrl } from '../lib/supabase'
import { uploadPetImage, deletePetImages } from '../utils/image'
import { Pet, PetType, Species } from '../types'
import * as ImagePicker from 'expo-image-picker'

interface CreatePetInput {
  type: PetType
  species: Species
  breed?: string
  colors: string[]
  description?: string
  name?: string
  location_lat: number
  location_lng: number
  location_description: string
  date_occurred: string
  images: ImagePicker.ImagePickerAsset[]
}

export function usePets() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFeed = useCallback(async (
    lat: number,
    lng: number,
    radiusKm: number,
    type?: PetType,
    page = 0,
  ): Promise<Pet[]> => {
    const pageSize = 20
    let query = supabase
      .rpc('get_pets_in_radius', {
        center_lat: lat,
        center_lng: lng,
        radius_km: radiusKm,
      })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (type) query = query.eq('type', type)

    const { data, error } = await query
    if (error) return []

    return (data ?? []).map(hydratePet)
  }, [])

  const fetchMyPets = useCallback(async (userId: string): Promise<Pet[]> => {
    const { data, error } = await supabase
      .from('pets')
      .select('*, images:pet_images(*)')
      .eq('user_id', userId)
      .neq('status', 'pending_delete')
      .order('created_at', { ascending: false })

    if (error) return []
    return (data ?? []).map(hydratePet)
  }, [])

  const fetchPetById = useCallback(async (id: string): Promise<Pet | null> => {
    const { data, error } = await supabase
      .from('pets')
      .select('*, images:pet_images(*), profile:profiles(display_name, phone)')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return hydratePet(data)
  }, [])

  const createPet = useCallback(async (
    userId: string,
    input: CreatePetInput,
  ): Promise<{ id: string } | string> => {
    setLoading(true)
    setError(null)

    const { data: pet, error: petError } = await supabase
      .from('pets')
      .insert({
        user_id: userId,
        type: input.type,
        species: input.species,
        breed: input.breed ?? null,
        colors: input.colors,
        description: input.description ?? null,
        name: input.name ?? null,
        location_lat: input.location_lat,
        location_lng: input.location_lng,
        location_description: input.location_description,
        date_occurred: input.date_occurred,
        status: 'active',
        embedding_ready: false,
      })
      .select('id')
      .single()

    if (petError || !pet) {
      setLoading(false)
      return petError?.message ?? 'Σφάλμα κατά τη δημιουργία αγγελίας'
    }

    const uploadedPaths: string[] = []
    for (let i = 0; i < input.images.length; i++) {
      const path = await uploadPetImage(input.images[i].uri, pet.id, i)
      if (path) uploadedPaths.push(path)
    }

    if (uploadedPaths.length > 0) {
      await supabase.from('pet_images').insert(
        uploadedPaths.map((path, i) => ({
          pet_id: pet.id,
          storage_path: path,
          is_primary: i === 0,
        })),
      )
    }

    await supabase.functions.invoke('generate-embedding', {
      body: { petId: pet.id },
    })

    setLoading(false)
    return { id: pet.id }
  }, [])

  const closePet = useCallback(async (petId: string): Promise<string | null> => {
    const { error } = await supabase
      .from('pets')
      .update({ status: 'pending_delete' })
      .eq('id', petId)
    return error?.message ?? null
  }, [])

  const reportPet = useCallback(async (
    petId: string,
    reporterId: string,
    reason: string,
  ): Promise<string | null> => {
    const { error } = await supabase
      .from('reports')
      .insert({ pet_id: petId, reporter_id: reporterId, reason })
    return error?.message ?? null
  }, [])

  return { loading, error, fetchFeed, fetchMyPets, fetchPetById, createPet, closePet, reportPet }
}

function hydratePet(raw: any): Pet {
  const images = (raw.images ?? []).map((img: any) => ({
    ...img,
    url: getPetImageUrl(img.storage_path),
  }))
  return { ...raw, images }
}
