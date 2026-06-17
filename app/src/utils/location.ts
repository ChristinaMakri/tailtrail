import * as Location from 'expo-location'
import { LocationCoords } from '../types'

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync()
  return status === 'granted'
}

export async function getCurrentLocation(): Promise<LocationCoords | null> {
  const granted = await requestLocationPermission()
  if (!granted) return null

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  })

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  }
}

export async function reverseGeocode(coords: LocationCoords): Promise<string> {
  try {
    const [result] = await Location.reverseGeocodeAsync(coords)
    const parts = [result.street, result.district, result.city, result.region]
      .filter(Boolean)
    return parts.slice(0, 2).join(', ')
  } catch {
    return `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
  }
}

export function distanceKm(a: LocationCoords, b: LocationCoords): number {
  const R = 6371
  const dLat = deg2rad(b.latitude - a.latitude)
  const dLon = deg2rad(b.longitude - a.longitude)
  const sin2 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(a.latitude)) * Math.cos(deg2rad(b.latitude)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(sin2))
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}μ`
  if (km < 10) return `${km.toFixed(1)}χλμ`
  return `${Math.round(km)}χλμ`
}
