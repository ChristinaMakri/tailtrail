import { useState, useCallback } from 'react'
import { LocationCoords } from '../types'
import { getCurrentLocation, reverseGeocode } from '../utils/location'

interface LocationState {
  coords: LocationCoords | null
  description: string
  loading: boolean
  error: string | null
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    coords: null,
    description: '',
    loading: false,
    error: null,
  })

  const fetch = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    const coords = await getCurrentLocation()
    if (!coords) {
      setState(s => ({
        ...s,
        loading: false,
        error: 'Δεν επετράπη η πρόσβαση στη τοποθεσία',
      }))
      return
    }
    const description = await reverseGeocode(coords)
    setState({ coords, description, loading: false, error: null })
  }, [])

  return { ...state, fetch }
}
