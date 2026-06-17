import React from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Pet } from '../../types'
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../lib/constants'
import { formatDistance } from '../../utils/location'
import { SPECIES_OPTIONS } from '../../lib/constants'

interface Props {
  pet: Pet
  onPress: (pet: Pet) => void
}

export function PetCard({ pet, onPress }: Props) {
  const primaryImage = pet.images?.find(i => i.is_primary) ?? pet.images?.[0]
  const isLost = pet.type === 'lost'
  const speciesInfo = SPECIES_OPTIONS.find(s => s.value === pet.species)

  const daysAgo = Math.floor(
    (Date.now() - new Date(pet.created_at).getTime()) / (1000 * 60 * 60 * 24),
  )

  return (
    <TouchableOpacity
      onPress={() => onPress(pet)}
      activeOpacity={0.85}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        {primaryImage?.url ? (
          <Image source={{ uri: primaryImage.url }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>{speciesInfo?.icon ?? '🐾'}</Text>
          </View>
        )}
        <View style={[styles.badge, isLost ? styles.lostBadge : styles.foundBadge]}>
          <Text style={styles.badgeText}>{isLost ? 'ΧΑΘΗΚΕ' : 'ΒΡΕΘΗΚΕ'}</Text>
        </View>
        {pet.images && pet.images.length > 1 && (
          <View style={styles.multiplePhotos}>
            <Ionicons name="images-outline" size={12} color={Colors.textInverse} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {pet.name ?? speciesInfo?.label ?? 'Ζώο'}
          </Text>
          <Text style={styles.species}>{speciesInfo?.icon}</Text>
        </View>

        {pet.breed && (
          <Text style={styles.breed} numberOfLines={1}>{pet.breed}</Text>
        )}

        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.footerText} numberOfLines={1}>
              {pet.distance_km != null
                ? formatDistance(pet.distance_km)
                : pet.location_description}
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.footerText}>
              {daysAgo === 0 ? 'Σήμερα' : `${daysAgo}η`}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 56,
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  lostBadge: {
    backgroundColor: Colors.lostBadge,
  },
  foundBadge: {
    backgroundColor: Colors.foundBadge,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },
  multiplePhotos: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 4,
    borderRadius: Radius.sm,
  },
  info: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    flex: 1,
  },
  species: {
    fontSize: 20,
    marginLeft: Spacing.xs,
  },
  breed: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    flex: 1,
  },
})
