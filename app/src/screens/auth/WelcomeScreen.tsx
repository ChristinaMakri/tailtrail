import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AuthStackParams } from '../../navigation/types'
import { Button } from '../../components/common/Button'
import { Colors, FontSize, FontWeight, Spacing } from '../../lib/constants'

type Props = NativeStackScreenProps<AuthStackParams, 'Welcome'>

export function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.hero}
      >
        <SafeAreaView style={styles.heroContent}>
          <View style={styles.logoWrapper}>
            <Text style={styles.logoEmoji}>🐾</Text>
          </View>
          <Text style={styles.appName}>TailTrail</Text>
          <Text style={styles.tagline}>
            Ανέβασε φωτογραφία και{'\n'}η AI θα βρει το ζωάκι σου
          </Text>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.bottom}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>🐕</Text>
            <Text style={styles.statLabel}>Σκύλοι</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>🐈</Text>
            <Text style={styles.statLabel}>Γάτες</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>🐾</Text>
            <Text style={styles.statLabel}>Άλλα</Text>
          </View>
        </View>

        <Text style={styles.headline}>
          Ανέβασε φωτογραφία και η AI θα βρει πιθανές αντιστοιχίσεις κοντά σου
        </Text>

        <View style={styles.actions}>
          <Button
            label="Σύνδεση"
            onPress={() => navigation.navigate('Login')}
            size="lg"
            style={styles.btn}
          />
          <Button
            label="Δημιουργία λογαριασμού"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
            size="lg"
            style={styles.btn}
          />
        </View>

        <Text style={styles.legal}>
          Συνεχίζοντας αποδέχεσαι τους{' '}
          <Text style={styles.legalLink}>Όρους Χρήσης</Text>
          {' '}και την{' '}
          <Text style={styles.legalLink}>Πολιτική Απορρήτου</Text>
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  hero: {
    flex: 1,
    maxHeight: '55%',
  },
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  logoEmoji: {
    fontSize: 52,
  },
  appName: {
    fontSize: 38,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: FontSize.lg,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 26,
  },
  bottom: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    justifyContent: 'space-between',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 28,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  headline: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: Spacing.sm,
  },
  btn: {
    borderRadius: 14,
  },
  legal: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
})
