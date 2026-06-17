export type Species = 'dog' | 'cat' | 'other'
export type PetType = 'lost' | 'found'
export type PetStatus = 'active' | 'pending_delete' | 'closed'
export type MatchStatus = 'pending' | 'confirmed' | 'rejected'

export interface Profile {
  id: string
  display_name: string | null
  phone: string | null
  avatar_url: string | null
  search_radius_km: number
  created_at: string
}

export interface PetImage {
  id: string
  pet_id: string
  storage_path: string
  url?: string
  is_primary: boolean
  created_at: string
}

export interface Pet {
  id: string
  user_id: string
  type: PetType
  species: Species
  breed: string | null
  colors: string[]
  description: string | null
  name: string | null
  location_lat: number
  location_lng: number
  location_description: string
  date_occurred: string
  status: PetStatus
  embedding_ready: boolean
  created_at: string
  updated_at: string
  images?: PetImage[]
  profile?: Pick<Profile, 'display_name' | 'phone'>
  distance_km?: number
}

export interface Match {
  id: string
  lost_pet_id: string
  found_pet_id: string
  similarity_score: number
  distance_km: number
  status: MatchStatus
  created_at: string
  lost_pet?: Pet
  found_pet?: Pet
}

export interface Report {
  id: string
  reporter_id: string
  pet_id: string
  reason: string
  created_at: string
}

export interface LocationCoords {
  latitude: number
  longitude: number
}

export interface AppStats {
  reunions_count: number
}

// Navigation param types (defined in navigation/types.ts)
export type RadiusOption = 10 | 30 | 50 | 100
