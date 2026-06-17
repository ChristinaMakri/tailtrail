import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { HomeStackParams } from '../../navigation/types'
import { useAuth } from '../../hooks/useAuth'
import { usePets } from '../../hooks/usePets'
import { useLocation } from '../../hooks/useLocation'
import { PetCard } from '../../components/pet/PetCard'
import { EmptyState } from '../../components/common/EmptyState'
import { Colors, FontSize, FontWeight, Spacing, Radius, RADIUS_OPTIONS } from '../../lib/constants'
import { Pet, PetType, RadiusOption } from '../../types'

type Props = NativeStackScreenProps<HomeStackParams, 'Feed'>

const TABS: { key: PetType | 'all'; label: string }[] = [
  { key: 'all', label: 'Όλα' },
  { key: 'lost', label: 'Χαμένα' },
  { key: 'found', label: 'Βρέθηκαν' },
]

export function HomeScreen({ navigation }: Props) {
  const { profile } = useAuth()
  const { fetchFeed } = usePets()
  const location = useLocation()

  const [activeTab, setActiveTab] = useState<PetType | 'all'>('all')
  const [radius, setRadius] = useState<RadiusOption>(profile?.search_radius_km as RadiusOption ?? 30)
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    location.fetch()
  }, [])

  useEffect(() => {
    if (location.coords) loadPets(true)
  }, [location.coords, activeTab, radius])

  async function loadPets(reset = false) {
    if (!location.coords) return
    const currentPage = reset ? 0 : page
    if (reset) { setLoading(true); setPets([]) }
    const results = await fetchFeed(
      location.coords.latitude,
      location.coords.longitude,
      radius,
      activeTab === 'all' ? undefined : activeTab,
      currentPage,
    )
    if (reset) {
      setPets(results)
      setPage(1)
    } else {
      setPets(prev => [...prev, ...results])
      setPage(p => p + 1)
    }
    setHasMore(results.length === 20)
    setLoading(false)
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await location.fetch()
    await loadPets(true)
    setRefreshing(false)
  }, [location.coords, activeTab, radius])

  function handlePetPress(pet: Pet) {
    navigation.navigate('PetDetail', { petId: pet.id })
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Γεια σου{profile?.display_name ? `, ${profile.display_name.split(' ')[0]}` : ''}!
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={Colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {location.description || 'Εντοπισμός τοποθεσίας...'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.radiusBtn}>
          <Ionicons name="funnel-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.radiusBtnText}>{radius}χλμ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={pets}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PetCard pet={item} onPress={handlePetPress} />}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        onEndReached={() => hasMore && !loading && loadPets()}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="paw-outline"
              title="Κανένα αποτέλεσμα"
              description={`Δεν υπάρχουν αγγελίες σε ακτίνα ${radius}χλμ`}
            />
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    maxWidth: 180,
  },
  radiusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  radiusBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
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
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  row: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
})
