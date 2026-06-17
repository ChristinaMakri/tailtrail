import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { supabase, STORAGE_BUCKET } from '../lib/supabase'

export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync()
  return status === 'granted'
}

export async function requestMediaPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  return status === 'granted'
}

export async function pickFromCamera(): Promise<ImagePicker.ImagePickerAsset | null> {
  const granted = await requestCameraPermission()
  if (!granted) return null

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.75,
    allowsEditing: true,
    aspect: [4, 3],
  })

  return result.canceled ? null : result.assets[0]
}

export async function pickFromLibrary(): Promise<ImagePicker.ImagePickerAsset | null> {
  const granted = await requestMediaPermission()
  if (!granted) return null

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.75,
    allowsEditing: true,
    aspect: [4, 3],
  })

  return result.canceled ? null : result.assets[0]
}

export async function uploadPetImage(
  localUri: string,
  petId: string,
  index: number,
): Promise<string | null> {
  try {
    const ext = localUri.split('.').pop() ?? 'jpg'
    const path = `pets/${petId}/${index}.${ext}`

    const fileInfo = await FileSystem.getInfoAsync(localUri)
    if (!fileInfo.exists) return null

    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    })

    const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0))

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, byteArray, {
        contentType: `image/${ext}`,
        upsert: true,
      })

    if (error) throw error
    return path
  } catch (err) {
    console.error('Image upload failed:', err)
    return null
  }
}

export async function deletePetImages(petId: string): Promise<void> {
  const { data: files } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(`pets/${petId}`)

  if (!files?.length) return

  const paths = files.map(f => `pets/${petId}/${f.name}`)
  await supabase.storage.from(STORAGE_BUCKET).remove(paths)
}
