export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-()]{10,}$/.test(phone.trim())
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('30')) return `+${digits}`
  if (digits.startsWith('0')) return `+30${digits.slice(1)}`
  if (digits.length === 10) return `+30${digits}`
  return phone
}
