import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { Colors, Radius, Shadow, Spacing } from '../../lib/constants'

interface Props {
  children: React.ReactNode
  style?: ViewStyle
  elevated?: boolean
  padding?: boolean
}

export function Card({ children, style, elevated = false, padding = true }: Props) {
  return (
    <View style={[
      styles.card,
      elevated && Shadow.md,
      padding && styles.padding,
      style,
    ]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  padding: {
    padding: Spacing.md,
  },
})
