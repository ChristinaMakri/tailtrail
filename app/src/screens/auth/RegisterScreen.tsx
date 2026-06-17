import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AuthStackParams } from '../../navigation/types'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Colors, FontSize, FontWeight, Spacing } from '../../lib/constants'
import { isValidEmail, isValidPassword, isValidPhone } from '../../utils/validation'

type Props = NativeStackScreenProps<AuthStackParams, 'Register'>

export function RegisterScreen({ navigation }: Props) {
  const { signUp, signInWithGoogle, signInWithApple } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!displayName.trim()) e.displayName = 'Υποχρεωτικό πεδίο'
    if (!isValidEmail(email)) e.email = 'Μη έγκυρο email'
    if (phone && !isValidPhone(phone)) e.phone = 'Μη έγκυρος αριθμός'
    if (!isValidPassword(password)) e.password = 'Τουλάχιστον 8 χαρακτήρες'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleRegister() {
    if (!validate()) return
    setLoading(true)
    const err = await signUp(email.trim(), password, displayName.trim(), phone.trim() || undefined)
    if (err) {
      setErrors({ general: err.includes('already') ? 'Το email χρησιμοποιείται ήδη' : err })
    }
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.title}>Δημιουργία{'\n'}λογαριασμού</Text>
          <Text style={styles.subtitle}>Εγγραφή στο TailTrail</Text>

          {errors.general && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          <Input
            label="Όνομα"
            value={displayName}
            onChangeText={setDisplayName}
            autoComplete="name"
            autoCapitalize="words"
            leftIcon="person-outline"
            placeholder="Το όνομά σου"
            error={errors.displayName}
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            leftIcon="mail-outline"
            placeholder="your@email.com"
            error={errors.email}
          />
          <Input
            label="Τηλέφωνο (προαιρετικό)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
            leftIcon="call-outline"
            placeholder="+30 6900000000"
            error={errors.phone}
            hint="Για επικοινωνία σε περίπτωση εύρεσης"
          />
          <Input
            label="Κωδικός"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon="lock-closed-outline"
            placeholder="Τουλάχιστον 8 χαρακτήρες"
            error={errors.password}
          />

          <Button
            label="Εγγραφή"
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={styles.mainBtn}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ή εγγραφή με</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={signInWithGoogle}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialLabel}>Google</Text>
            </TouchableOpacity>
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.socialBtn} onPress={signInWithApple}>
                <Ionicons name="logo-apple" size={20} color={Colors.textPrimary} />
                <Text style={styles.socialLabel}>Apple</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              Έχεις ήδη λογαριασμό;{' '}
              <Text style={styles.loginHighlight}>Σύνδεση</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  container: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
    flexGrow: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    marginLeft: -Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: `${Colors.error}15`,
    borderRadius: 10,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    flex: 1,
  },
  mainBtn: {
    marginTop: Spacing.sm,
    borderRadius: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  socialIcon: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#4285F4',
  },
  socialLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  loginText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  loginHighlight: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
})
