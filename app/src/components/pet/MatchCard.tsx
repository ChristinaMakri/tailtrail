import React from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Match } from '../../types'
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../lib/constants'
import { formatDistance } from '../../utils/location'
import { Button } from '../common/Button'

interface Props {
  match: Match
  currentUserId: string
  onConfirm: (match: Match) => void
  onReject: (match: Match) => void
  onViewDetail: (match: Match) => void
}

export function MatchCard({ match, currentUserId, onConfirm, onReject, onViewDetail }: Props) {
  const myPet = match.lost_pet?.user_id === currentUserId ? match.lost_pet : match.found_pet
  const otherPet = match.lost_pet?.user_id === currentUserId ? match.found_pet : match.lost_pet

  const myImage = myPet?.images?.find(i => i.is_primary) ?? myPet?.images?.[0]
  const otherImage = otherPet?.images?.find(i => i.is_primary) ?? otherPet?.images?.[0]

  const similarityPct = Math.round(match.similarity_score * 100)

  return (
    <TouchableOpacity onPress={() => onViewDetail(match)} activeOpacity={0.9} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.scoreWrapper}>
          <Text style={styles.scoreLabel}>Ομοιότητα</Text>
          <Text style={styles.scoreValue}>{similarityPct}%</Text>
        </View>
        <View style={styles.distanceWrapper}>
          <Ionicons name="navigate-circle-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.distanceText}>{formatDistance(match.distance_km)}</Text>
        </View>
      </View>

      <View style={styles.comparison}>
        <View style={styles.petSide}>
          <View style={styles.imageContainer}>
            {myImage?.url ? (
              <Image source={{ uri: myImage.url }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>🐾</Text>
              </View>
            )}
            <View style={styles.myLabel}>
              <Text style={styles.myLabelText}>ΔΙΚΟμου</Text>
            </View>
          </View>
          <Text style={styles.petName} numberOfLines={1}>
            {myPet?.name ?? (myPet?.type === 'lost' ? 'Χαμένο' : 'Βρέθηκε')}
          </Text>
        </View>

        <View style={styles.middleSection}>
          <View style={styles.scoreCircle}>
            <Ionicons name="swap-horizontal" size={20} color={Colors.primary} />
          </View>
        </View>

        <View style={styles.petSide}>
          <View style={styles.imageContainer}>
            {otherImage?.url ? (
              <Image source={{ uri: otherImage.url }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>🐾</Text>
              </View>
            )}
            <View style={[styles.myLabel, styles.otherLabel]}>
              <Text style={styles.myLabelText}>ΑΛΛΟ</Text>
            </View>
          </View>
          <Text style={styles.petName} numberOfLines={1}>
            {otherPet?.name ?? (otherPet?.type === 'found' ? 'Βρέθηκε' : 'Χαμένο')}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          label="Δεν ταιριάζει"
          onPress={() => onReject(match)}
          variant="outline"
          size="sm"
          style={styles.actionBtn}
        />
        <Button
          label="Είναι αυτό!"
          onPress={() => onConfirm(match)}
          variant="primary"
          size="sm"
          style={styles.actionBtn}
        />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  scoreWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  scoreLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  scoreValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  distanceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  comparison: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  petSide: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
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
  placeholderText: {
    fontSize: 32,
  },
  myLabel: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  otherLabel: {
    backgroundColor: Colors.secondary,
  },
  myLabelText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
    letterSpacing: 0.3,
  },
  petName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  middleSection: {
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
})
