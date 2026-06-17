import { useState, useEffect, createContext, useContext } from 'react'
import { Session, User } from '@supabase/supabase-js'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { supabase } from '../lib/supabase'
import { Profile } from '../types'

WebBrowser.maybeCompleteAuthSession()

interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, displayName: string, phone?: string) => Promise<string | null>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<string | null>
  signInWithApple: () => Promise<string | null>
  updateProfile: (updates: Partial<Profile>) => Promise<string | null>
  deleteAccount: () => Promise<string | null>
}

export type AuthContextType = AuthState & AuthActions

export const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useAuthState(): AuthState & AuthActions {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) loadProfile(data.session.user.id)
      else setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession) loadProfile(newSession.user.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  async function signIn(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }

  async function signUp(
    email: string,
    password: string,
    displayName: string,
    phone?: string,
  ): Promise<string | null> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, phone } },
    })
    return error?.message ?? null
  }

  async function signOut(): Promise<void> {
    await supabase.auth.signOut()
  }

  async function signInWithGoogle(): Promise<string | null> {
    const redirectTo = AuthSession.makeRedirectUri({ scheme: 'tailtrail' })
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    })
    if (error) return error.message
    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
      if (result.type === 'success') {
        const url = new URL(result.url)
        const accessToken = url.searchParams.get('access_token')
        const refreshToken = url.searchParams.get('refresh_token')
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        }
      }
    }
    return null
  }

  async function signInWithApple(): Promise<string | null> {
    const redirectTo = AuthSession.makeRedirectUri({ scheme: 'tailtrail' })
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo, skipBrowserRedirect: true },
    })
    if (error) return error.message
    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
      if (result.type === 'success') {
        const url = new URL(result.url)
        const accessToken = url.searchParams.get('access_token')
        const refreshToken = url.searchParams.get('refresh_token')
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        }
      }
    }
    return null
  }

  async function updateProfile(updates: Partial<Profile>): Promise<string | null> {
    if (!session) return 'Δεν έχετε συνδεθεί'
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id)
    if (error) return error.message
    setProfile(prev => prev ? { ...prev, ...updates } : null)
    return null
  }

  async function deleteAccount(): Promise<string | null> {
    if (!session) return 'Δεν έχετε συνδεθεί'
    const { error } = await supabase.rpc('delete_account')
    if (error) return error.message
    await supabase.auth.signOut()
    return null
  }

  return {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithApple,
    updateProfile,
    deleteAccount,
  }
}
