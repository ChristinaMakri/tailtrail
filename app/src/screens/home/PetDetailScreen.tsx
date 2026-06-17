import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Share,
  SafeAreaView,
  Dimensions,
  FlatList,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { HomeStackParams } from '../../navigation/types'
import { useAuth } from '../../hooks/useAuth'
import { usePets } from '../../hooks/usePets'
import { Button } from '../../components/common/Button'
import { Colors, FontSize, FontWeight, Radius, Spacing, SPECIES_OPTIONS } from '../../lib/constants'
import { Pet } from '../../types'
import { formatDistance } from '../../utils/location'

type Props = NativeStackScreenProps<HomeStackParams, 'PetDetail'>

const { width } = Dimensions.get('window')

export function PetDetailScreen({ route, navigation }: Props) {
  const { petId } = route.params
  const { user } = useAuth()
  const { fetchPetById, closePet, reportPet } = usePets()
  const [pet, setPet] = useState<Pet | null>(null)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    fetchPetById(petId).then(setPet)
  }, [petId])

  function handleReport() {
    if (!user || !pet) return
    Alert.alert('Αναφορά', 'Γιατί θέλεις να αναφέρεις αυτή την αγγελία;', [
      { text: 'Ακατάλληλο περιεχόμενο', onPress: () => reportPet(pet.id, user.id, 'inappropriate') },
      { text: 'Ψευδής αγγελία', onPress: () => reportPet(pet.id, user.id, 'fake') },
      { text: 'Ανεπιθύμητο', onPress: () => reportPet(pet.id, user.id, 'spam') },
      { text: 'Άκυρο', style: 'cancel' },
    ])
  }

  function handleShare() {
    if (!pet) return
    Share.share({
      message: `Βοήθησε να βρεθεί! ${pet.type === 'lost' ? 'Χάθηκε' : 'Βρέθηκε'} ${pet.species === 'dog' ? 'σκύλος' : 'γάτα'} - ${pet.location_description}. TailTrail app`,
    })
  }

  function handleClose() {
    Alert.alert(
      'Κλείσιμο αγγελίας',
      'Βρέθηκε το ζωάκι σου; Η αγγελία θα διαγραφεί μόνιμα σε 7 ημέρες.',
      [
        { text: 'Ναι, βρέθηκε! 🎉', onPress: async () => {
          if (pet) { await closePet(pet.id); navigation.goBack() }
        }},
        { text: 'Άκυρο', style: 'cancel' },
      ],
    )
  }

  if (!pet) return null

  const isOwner = user?.id === pet.user_id
  const speciesInfo = SPECIES_OPTIONS.find(s => s.value === pet.species)
  const images = pet.images ?? []

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {images.length > 0 ? (
          <View>
            <FlatList
              data={images}
              keyExtractor={i => i.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={e => setActiveImage(
                Math.round(e.nativeEvent.contentOffset.x / width),
              )}
              renderItem={({ item }) => (
                <Image source={{ uri: item.url }} style={styles.image} />
              )}
            />
            {images.length > 1 && (
              <View style={styles.dots}>
                {images.map((_, i) => (
                  <View key={i} style={[styles.dot, i === activeImage && styles.dotActive]} />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={{ fontSize: 72 }}>{speciesInfo?.icon}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.typeRow}>
            <View style={[styles.typeBadge, pet.type === 'lost' ? styles.lostBadge : styles.foundBadge]}>
              <Text style={styles.typeBadgeText}>
                {pet.type === 'lost' ? '🔍 ΧΑΘΗΚΕ' : '✅ ΒΡΕΘΗΚΕ'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
                <Ionicons name="share-outline" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              {!isOwner && (
                <TouchableOpacity onPress={handleReport} style={styles.iconBtn}>
                  <Ionicons name="flag-outline" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text style={styles.name}>{pet.name ?? speciesInfo?.label}</Text>

          <View style={styles.infoGrid}>
            <InfoRow icon="paw-outline" label="Είδος" value={speciesInfo?.label ?? pet.species} />
            {pet.breed && <InfoRow icon="information-circle-outline" label="Ράτσα" value={pet.breed} />}
            {pet.colors?.length > 0 && (
              <InfoRow icon="color-palette-outline" label="Χρώμα" value={pet.colors.join(', ')} />
            )}
            <InfoRow icon="calendar-outline" label={pet.type === 'lost' ? 'Χάθηκε' : 'Βρέθηκε'} value={new Date(pet.date_occurred).toLocaleDateString('el-GR')} />
            <InfoRow icon="location-outline" label="Περιοχή" value={pet.location_description} />
            {pet.distance_km != null && (
              <InfoRow icon="navigate-outline" label="Απόσταση" value={formatDistance(pet.distance_km)} />
            )}
          </View>

          {pet.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Περιγραφή</Text>
              <Text style={styles.description}>{pet.description}</Text>
            </View>
          )}

          {pet.profile && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Στοιχεία επικοινωνίας</Text>
              {pet.profile.display_name && (
                <InfoRow icon="person-outline" label="Όνομα" value={pet.profile.display_name} />
              )}
              {pet.profile.phone && (
                <InfoRow icon="call-outline" label="Τηλέφωνο" value={pet.profile.phone} />
              )}
            </View>
          )}

          <View style={styles.actions}>
            {isOwner ? (
              <Button
                label="Το βρήκα! Κλείσιμο αγγελίας 🎉"
                onPress={handleClose}
                variant="primary"
                size="lg"
              />
            ) : (
              <Button
                label={pet.type === 'lost' ? 'Μοιάζει με κάτι που βρήκα!' : 'Αυτό είναι το ζωάκι μου!'}
                onPress={() => {}}
                variant="primary"
                size="lg"
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon as any} size={16} color={Colors.primary} />
      <Text style={infoStyles.label}>{label}:</Text>
      <Text style={infoStyles.value} numberOfLines={2}>{value}</Text>
    </View>
  )
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    minWidth: 70,
  },
  value: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
})

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  image: {
    width,
    height: 320,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    height: 280,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    position: 'absolute',
    bottom: Spacing.md,
    left: 0,
    right: 0,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: Colors.textInverse,
    width: 18,
  },
  backBtn: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  lostBadge: { backgroundColor: `${Colors.error}20` },
  foundBadge: { backgroundColor: `${Colors.success}20` },
  typeBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  infoGrid: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 24,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  actions: {
    marginTop: Spacing.md,
  },
})
