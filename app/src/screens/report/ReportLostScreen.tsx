import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as ImagePickerLib from 'expo-image-picker'
import { ReportStackParams } from '../../navigation/types'
import { useAuth } from '../../hooks/useAuth'
import { usePets } from '../../hooks/usePets'
import { useLocation } from '../../hooks/useLocation'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { LoadingOverlay } from '../../components/common/LoadingOverlay'
import { ImagePickerSheet } from '../../components/pet/ImagePickerSheet'
import { Colors, FontSize, FontWeight, Radius, Spacing, SPECIES_OPTIONS, COLOR_OPTIONS, MAX_IMAGES_PER_PET } from '../../lib/constants'
import { pickFromCamera, pickFromLibrary } from '../../utils/image'
import { Species } from '../../types'

type Props = NativeStackScreenProps<ReportStackParams, 'ReportLost'>

export function ReportLostScreen({ navigation }: Props) {
  const { user } = useAuth()
  const { createPet, loading } = usePets()
  const location = useLocation()

  const [images, setImages] = useState<ImagePickerLib.ImagePickerAsset[]>([])
  const [pickerVisible, setPickerVisible] = useState(false)
  const [species, setSpecies] = useState<Species>('dog')
  const [name, setName] = useState('')
  const [breed, setBreed] = useState('')
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [dateLost, setDateLost] = useState(new Date().toISOString().split('T')[0])
  const [locationLoaded, setLocationLoaded] = useState(false)

  async function handleGetLocation() {
    await location.fetch()
    setLocationLoaded(true)
  }

  async function handleCamera() {
    const asset = await pickFromCamera()
    if (asset) setImages(prev => [...prev, asset].slice(0, MAX_IMAGES_PER_PET))
  }

  async function handleLibrary() {
    const asset = await pickFromLibrary()
    if (asset) setImages(prev => [...prev, asset].slice(0, MAX_IMAGES_PER_PET))
  }

  function toggleColor(color: string) {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color],
    )
  }

  async function handleSubmit() {
    if (images.length === 0) { Alert.alert('Φωτογραφία', 'Προσθέσε τουλάχιστον μία φωτογραφία'); return }
    if (!location.coords) { Alert.alert('Τοποθεσία', 'Παρακαλώ εντόπισε την τοποθεσία σου'); return }
    if (!user) return

    const result = await createPet(user.id, {
      type: 'lost',
      species,
      breed: breed.trim() || undefined,
      colors: selectedColors,
      description: description.trim() || undefined,
      name: name.trim() || undefined,
      location_lat: location.coords.latitude,
      location_lng: location.coords.longitude,
      location_description: location.description,
      date_occurred: dateLost,
      images,
    })

    if (typeof result === 'string') {
      Alert.alert('Σφάλμα', result)
    } else {
      Alert.alert('Επιτυχία!', 'Η αγγελία δημοσιεύτηκε. Θα σε ειδοποιήσουμε αν βρεθεί ταίριασμα!', [
        { text: 'OK', onPress: () => navigation.getParent()?.navigate('HomeTab') },
      ])
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Χάθηκε ζωάκι</Text>
          </View>

          <Section title="Φωτογραφίες *">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
              {images.map((img, i) => (
                <View key={i} style={styles.imageThumb}>
                  <Image source={{ uri: img.uri }} style={styles.thumbImage} />
                  <TouchableOpacity
                    style={styles.removeImg}
                    onPress={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                  >
                    <Ionicons name="close-circle" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < MAX_IMAGES_PER_PET && (
                <TouchableOpacity style={styles.addImageBtn} onPress={() => setPickerVisible(true)}>
                  <Ionicons name="camera-outline" size={28} color={Colors.textMuted} />
                  <Text style={styles.addImageText}>{images.length === 0 ? 'Προσθήκη' : 'Άλλη'}</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </Section>

          <Section title="Είδος ζώου *">
            <View style={styles.speciesRow}>
              {SPECIES_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s.value}
                  style={[styles.speciesBtn, species === s.value && styles.speciesBtnActive]}
                  onPress={() => setSpecies(s.value)}
                >
                  <Text style={styles.speciesEmoji}>{s.icon}</Text>
                  <Text style={[styles.speciesLabel, species === s.value && styles.speciesLabelActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

          <Section title="Στοιχεία">
            <Input label="Όνομα ζωάκι" value={name} onChangeText={setName} placeholder="π.χ. Μπάκης" autoCapitalize="words" />
            <Input label="Ράτσα (προαιρετικό)" value={breed} onChangeText={setBreed} placeholder="π.χ. Labrador" autoCapitalize="words" />
          </Section>

          <Section title="Χρώματα">
            <View style={styles.colorGrid}>
              {COLOR_OPTIONS.map(c => (
                <TouchableOpacity
                  key={c.value}
                  style={[styles.colorChip, selectedColors.includes(c.value) && styles.colorChipActive]}
                  onPress={() => toggleColor(c.value)}
                >
                  <Text style={[styles.colorChipText, selectedColors.includes(c.value) && styles.colorChipTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

          <Section title="Περιγραφή (προαιρετικό)">
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder="Διακριτικά χαρακτηριστικά, συμπεριφορά, κολάρο..."
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />
          </Section>

          <Section title="Τοποθεσία & Ημερομηνία *">
            <TouchableOpacity style={styles.locationBtn} onPress={handleGetLocation}>
              <Ionicons
                name={locationLoaded ? 'checkmark-circle' : 'location-outline'}
                size={20}
                color={locationLoaded ? Colors.success : Colors.primary}
              />
              <Text style={styles.locationBtnText}>
                {location.loading ? 'Εντοπισμός...' :
                  locationLoaded ? location.description :
                    'Εντοπισμός τρέχουσας τοποθεσίας'}
              </Text>
            </TouchableOpacity>

            <Input
              label="Ημερομηνία που χάθηκε"
              value={dateLost}
              onChangeText={setDateLost}
              placeholder="ΕΕΕΕ-ΜΜ-ΗΗ"
              keyboardType="numeric"
            />
          </Section>

          <Button
            label="Δημοσίευση αγγελίας"
            onPress={handleSubmit}
            size="lg"
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <ImagePickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onCamera={handleCamera}
        onLibrary={handleLibrary}
      />
      <LoadingOverlay visible={loading} message="Δημοσίευση αγγελίας..." />
    </SafeAreaView>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      {children}
    </View>
  )
}

const sectionStyles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  title: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: Spacing.sm },
})

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  container: { padding: Spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  imageRow: { flexDirection: 'row' },
  imageThumb: { position: 'relative', marginRight: Spacing.sm },
  thumbImage: { width: 96, height: 96, borderRadius: Radius.md },
  removeImg: { position: 'absolute', top: -8, right: -8 },
  addImageBtn: {
    width: 96, height: 96, borderRadius: Radius.md,
    backgroundColor: Colors.surfaceElevated, borderWidth: 2,
    borderColor: Colors.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  addImageText: { fontSize: FontSize.xs, color: Colors.textMuted },
  speciesRow: { flexDirection: 'row', gap: Spacing.sm },
  speciesBtn: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.md,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface, gap: 4,
  },
  speciesBtnActive: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}10` },
  speciesEmoji: { fontSize: 28 },
  speciesLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  speciesLabelActive: { color: Colors.primary },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  colorChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  colorChipActive: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}10` },
  colorChipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  colorChipTextActive: { color: Colors.primary, fontWeight: FontWeight.medium },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  locationBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: Radius.md,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  locationBtnText: { fontSize: FontSize.md, color: Colors.textPrimary, flex: 1 },
  submitBtn: { marginTop: Spacing.md, marginBottom: Spacing.xl, borderRadius: 14 },
})
