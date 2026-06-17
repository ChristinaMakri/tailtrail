import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../hooks/useAuth'
import { usePets } from '../../hooks/usePets'
import { PetCard } from '../../components/pet/PetCard'
import { Button } from '../../components/common/Button'
import { Colors, FontSize, FontWeight, Radius, Spacing, RADIUS_OPTIONS } from '../../lib/constants'
import { Pet, RadiusOption } from '../../types'

export function ProfileScreen({ navigation }: any) {
  const { user, profile, signOut, updateProfile, deleteAccount } = useAuth()
  const { fetchMyPets, closePet } = usePets()
  const [pets, setPets] = useState<Pet[]>([])
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost')

  useEffect(() => {
    if (user) fetchMyPets(user.id).then(setPets)
  }, [user])

  const myPets = pets.filter(p => p.type === activeTab)

  async function handleRadiusChange(r: RadiusOption) {
    await updateProfile({ search_radius_km: r })
  }

  async function handleClosePet(pet: Pet) {
    Alert.alert('Κλείσιμο αγγελίας', 'Βρέθηκε το ζωάκι;', [
      { text: 'Ναι! 🎉', onPress: async () => {
        await closePet(pet.id)
        setPets(prev => prev.filter(p => p.id !== pet.id))
      }},
      { text: 'Άκυρο', style: 'cancel' },
    ])
  }

  async function handleSignOut() {
    Alert.alert('Αποσύνδεση', 'Θέλεις να αποσυνδεθείς;', [
      { text: 'Αποσύνδεση', style: 'destructive', onPress: signOut },
      { text: 'Άκυρο', style: 'cancel' },
    ])
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Διαγραφή λογαριασμού',
      'Αυτή η ενέργεια είναι μόνιμη. Όλα τα δεδομένα σου θα διαγραφούν.',
      [
        { text: 'Διαγραφή', style: 'destructive', onPress: async () => {
          const err = await deleteAccount()
          if (err) Alert.alert('Σφάλμα', err)
        }},
        { text: 'Άκυρο', style: 'cancel' },
      ],
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {profile?.display_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.display_name ?? 'Χρήστης'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ακτίνα αναζήτησης</Text>
          <View style={styles.radiusRow}>
            {RADIUS_OPTIONS.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.radiusChip, profile?.search_radius_km === r && styles.radiusChipActive]}
                onPress={() => handleRadiusChange(r)}
              >
                <Text style={[styles.radiusText, profile?.search_radius_km === r && styles.radiusTextActive]}>
                  {r}χλμ
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Οι αγγελίες μου</Text>
          <View style={styles.tabRow}>
            {(['lost', 'found'] as const).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'lost' ? 'Χαμένα' : 'Βρέθηκαν'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {myPets.length === 0 ? (
            <View style={styles.emptyPets}>
              <Text style={styles.emptyText}>Δεν έχεις αγγελίες</Text>
            </View>
          ) : (
            myPets.map(pet => (
              <View key={pet.id} style={styles.petItem}>
                <PetCard pet={pet} onPress={() => {}} />
                <Button
                  label="Βρέθηκε - Κλείσιμο"
                  onPress={() => handleClosePet(pet)}
                  variant="outline"
                  size="sm"
                  style={styles.closeBtn}
                />
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.menuLabel}>Αποσύνδεση</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
            <Text style={[styles.menuLabel, { color: Colors.error }]}>Διαγραφή λογαριασμού</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>TailTrail v1.0.0 · Open Source · MIT License</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  email: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  radiusRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  radiusChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  radiusChipActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  radiusText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  radiusTextActive: {
    color: Colors.primary,
  },
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textInverse,
  },
  emptyPets: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  petItem: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  closeBtn: {
    borderRadius: Radius.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuLabel: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  version: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    paddingBottom: Spacing.xl,
  },
})
