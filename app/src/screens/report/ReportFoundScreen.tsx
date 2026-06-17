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
import {
  Colors, FontSize, FontWeight, Radius, Spacing,
  SPECIES_OPTIONS, COLOR_OPTIONS, MAX_IMAGES_PER_PET,
} from '../../lib/constants'
import { pickFromCamera, pickFromLibrary } from '../../utils/image'
import { Species } from '../../types'

type Props = NativeStackScreenProps<ReportStackParams, 'ReportFound'>

export function ReportFoundScreen({ navigation }: Props) {
  const { user } = useAuth()
  const { createPet, loading } = usePets()
  const location = useLocation()

  const [images, setImages] = useState<ImagePickerLib.ImagePickerAsset[]>([])
  const [pickerVisible, setPickerVisible] = useState(false)
  const [species, setSpecies] = useState<Species>('dog')
  const [breed, setBreed] = useState('')
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [dateFound, setDateFound] = useState(new Date().toISOString().split('T')[0])
  const [locationLoaded, setLocationLoaded] = useState(false)

  async function handleGetLocation() {
    await location.fetch()
    setLocationLoaded(true)
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
      type: 'found',
      species,
      breed: breed.trim() || undefined,
      colors: selectedColors,
      description: description.trim() || undefined,
      location_lat: location.coords.latitude,
      location_lng: location.coords.longitude,
      location_description: location.description,
      date_occurred: dateFound,
      images,
    })

    if (typeof result === 'string') {
      Alert.alert('Σφάλμα', result)
    } else {
      Alert.alert(
        'Ευχαριστούμε! 🐾',
        'Η αγγελία δημοσιεύτηκε. Αν ο ιδιοκτήτης είναι κοντά θα τον ειδοποιήσουμε!',
        [{ text: 'OK', onPress: () => navigation.getParent()?.navigate('HomeTab') }],
      )
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
            <Text style={styles.title}>Βρέθηκε ζωάκι</Text>
          </View>

          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={18} color={Colors.secondary} />
            <Text style={styles.infoText}>
              Μόνο η γενική περιοχή θα φαίνεται στους άλλους χρήστες
            </Text>
          </View>

          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={styles.sectionTitle}>Φωτογραφίες *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
          </View>

          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={styles.sectionTitle}>Είδος ζώου *</Text>
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
          </View>

          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={styles.sectionTitle}>Στοιχεία (προαιρετικό)</Text>
            <Input label="Ράτσα" value={breed} onChangeText={setBreed} placeholder="π.χ. Γάτα Ταρτλάς" autoCapitalize="words" />
          </View>

          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={styles.sectionTitle}>Χρώματα</Text>
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
          </View>

          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={styles.sectionTitle}>Περιγραφή</Text>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder="Συμπεριφορά ζώου, τραύματα, κολάρο, διακριτικά..."
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />
          </View>

          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={styles.sectionTitle}>Τοποθεσία & Ημερομηνία *</Text>
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
              label="Ημερομηνία που βρέθηκε"
              value={dateFound}
              onChangeText={setDateFound}
              placeholder="ΕΕΕΕ-ΜΜ-ΗΗ"
              keyboardType="numeric"
            />
          </View>

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
        onCamera={async () => { const a = await pickFromCamera(); if (a) setImages(p => [...p, a].slice(0, MAX_IMAGES_PER_PET)) }}
        onLibrary={async () => { const a = await pickFromLibrary(); if (a) setImages(p => [...p, a].slice(0, MAX_IMAGES_PER_PET)) }}
      />
      <LoadingOverlay visible={loading} message="Δημοσίευση αγγελίας..." />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  container: { padding: Spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: `${Colors.secondary}15`, padding: Spacing.md,
    borderRadius: Radius.md, marginBottom: Spacing.lg,
  },
  infoText: { fontSize: FontSize.sm, color: Colors.secondary, flex: 1 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: Spacing.sm },
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
  speciesBtnActive: { borderColor: Colors.secondary, backgroundColor: `${Colors.secondary}10` },
  speciesEmoji: { fontSize: 28 },
  speciesLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  speciesLabelActive: { color: Colors.secondary },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  colorChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  colorChipActive: { borderColor: Colors.secondary, backgroundColor: `${Colors.secondary}10` },
  colorChipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  colorChipTextActive: { color: Colors.secondary, fontWeight: FontWeight.medium },
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
