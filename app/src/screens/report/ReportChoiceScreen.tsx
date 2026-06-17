import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as Haptics from 'expo-haptics'
import { ReportStackParams } from '../../navigation/types'
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../lib/constants'

type Props = NativeStackScreenProps<ReportStackParams, 'ReportChoice'>

export function ReportChoiceScreen({ navigation }: Props) {
  async function handleLost() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    navigation.navigate('ReportLost')
  }

  async function handleFound() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    navigation.navigate('ReportFound')
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Νέα Αγγελία</Text>
          <Text style={styles.subtitle}>Τι συνέβη με το ζωάκι;</Text>
        </View>

        <TouchableOpacity onPress={handleLost} activeOpacity={0.85} style={styles.card}>
          <LinearGradient
            colors={['#FF6B6B', Colors.error]}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardEmoji}>😢</Text>
            </View>
            <Text style={styles.cardTitle}>Έχασα το ζωάκι μου</Text>
            <Text style={styles.cardSubtitle}>
              Ανέβασε φωτογραφία και θα σε ειδοποιούμε αν κάποιος το βρει κοντά σου
            </Text>
            <View style={styles.cardArrow}>
              <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.8)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleFound} activeOpacity={0.85} style={styles.card}>
          <LinearGradient
            colors={['#4ECDC4', Colors.secondary]}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardEmoji}>🤝</Text>
            </View>
            <Text style={styles.cardTitle}>Βρήκα ένα ζωάκι</Text>
            <Text style={styles.cardSubtitle}>
              Ανέβασε φωτογραφία και θα εντοπίσουμε τον ιδιοκτήτη κοντά σου
            </Text>
            <View style={styles.cardArrow}>
              <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.8)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.footerText}>
            Τα δεδομένα σου προστατεύονται — δεν εμφανίζεται ακριβής τοποθεσία
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  header: {
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  card: {
    flex: 1,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.md,
  },
  cardGradient: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'flex-end',
  },
  cardIcon: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.xl,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 36,
  },
  cardTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
    marginBottom: Spacing.sm,
  },
  cardSubtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  cardArrow: {
    alignSelf: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    flex: 1,
  },
})
