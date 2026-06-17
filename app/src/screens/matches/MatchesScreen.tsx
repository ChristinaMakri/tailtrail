import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  SafeAreaView,
  RefreshControl,
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { MatchesStackParams } from '../../navigation/types'
import { useAuth } from '../../hooks/useAuth'
import { useMatches } from '../../hooks/useMatches'
import { MatchCard } from '../../components/pet/MatchCard'
import { EmptyState } from '../../components/common/EmptyState'
import { Colors, FontSize, FontWeight, Spacing } from '../../lib/constants'
import { Match } from '../../types'

type Props = NativeStackScreenProps<MatchesStackParams, 'MatchesList'>

export function MatchesScreen({ navigation }: Props) {
  const { user } = useAuth()
  const { loading, fetchMatches, updateMatchStatus } = useMatches()
  const [matches, setMatches] = useState<Match[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user) load()
  }, [user])

  async function load() {
    if (!user) return
    const data = await fetchMatches(user.id)
    setMatches(data)
  }

  async function onRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  async function handleConfirm(match: Match) {
    Alert.alert(
      'Επιβεβαίωση ταιριάσματος',
      'Είσαι σίγουρος/η ότι αυτό είναι το ζωάκι σου; Θα ειδοποιηθεί ο ανευρέτης.',
      [
        {
          text: 'Ναι, το βρήκα!',
          onPress: async () => {
            await updateMatchStatus(match.id, 'confirmed')
            setMatches(prev => prev.filter(m => m.id !== match.id))
            Alert.alert('🎉 Συγχαρητήρια!', 'Χαρούμενοι που το ζωάκι σου βρέθηκε! Επικοινώνησε με τον ανευρέτη.')
          },
        },
        { text: 'Άκυρο', style: 'cancel' },
      ],
    )
  }

  async function handleReject(match: Match) {
    await updateMatchStatus(match.id, 'rejected')
    setMatches(prev => prev.filter(m => m.id !== match.id))
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Ταιριάσματα</Text>
        <Text style={styles.subtitle}>
          {matches.length > 0
            ? `${matches.length} πιθανά ταιριάσματα`
            : 'Θα σε ειδοποιούμε άμεσα'}
        </Text>
      </View>

      <FlatList
        data={matches}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            currentUserId={user?.id ?? ''}
            onConfirm={handleConfirm}
            onReject={handleReject}
            onViewDetail={() => {}}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="heart-outline"
              title="Κανένα ταίριασμα ακόμα"
              description="Μόλις το AI βρει πιθανή αντιστοιχία, θα εμφανιστεί εδώ και θα λάβεις ειδοποίηση"
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  list: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  separator: {
    height: Spacing.md,
  },
})
