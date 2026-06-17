import { Species, RadiusOption } from '../types'

export const Colors = {
  primary: '#E8603C',
  primaryLight: '#FF8A5C',
  primaryDark: '#C94E2C',
  secondary: '#4A90A4',
  secondaryLight: '#6AAFC3',

  background: '#F8F7F4',
  surface: '#FFFFFF',
  surfaceElevated: '#F2F1EE',

  textPrimary: '#1C1C1E',
  textSecondary: '#6C6C70',
  textMuted: '#AEAEB2',
  textInverse: '#FFFFFF',

  border: '#E5E5EA',
  borderLight: '#F2F2F7',

  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',

  lostBadge: '#FF3B30',
  foundBadge: '#34C759',

  overlay: 'rgba(0,0,0,0.5)',
  shimmer: '#E8E8E8',
} as const

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
} as const

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
}

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
} as const

export const RADIUS_OPTIONS: RadiusOption[] = [10, 30, 50, 100]

export const SPECIES_OPTIONS: { value: Species; label: string; icon: string }[] = [
  { value: 'dog', label: 'Σκύλος', icon: '🐕' },
  { value: 'cat', label: 'Γάτα', icon: '🐈' },
  { value: 'other', label: 'Άλλο', icon: '🐾' },
]

export const COLOR_OPTIONS = [
  { value: 'white', label: 'Λευκό' },
  { value: 'black', label: 'Μαύρο' },
  { value: 'brown', label: 'Καφέ' },
  { value: 'golden', label: 'Χρυσό' },
  { value: 'gray', label: 'Γκρι' },
  { value: 'orange', label: 'Πορτοκαλί' },
  { value: 'spotted', label: 'Παρδαλό' },
  { value: 'mixed', label: 'Μιγάς' },
]

export const SIMILARITY_THRESHOLD = 0.55
export const MAX_MATCHES = 20
export const POST_EXPIRY_DAYS = 90
export const SOFT_DELETE_DAYS = 7
export const MAX_IMAGES_PER_PET = 4
