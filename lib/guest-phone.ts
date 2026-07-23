import {
  AsYouType,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js'

export type GuestPhoneCountry = CountryCode

export type ParsedGuestPhone = {
  e164: string | null
  country: GuestPhoneCountry
  national: string
  valid: boolean
  error?: string
}

/** Countries shown in the guest phone country selector (IN default). */
export const GUEST_PHONE_COUNTRIES: Array<{
  code: GuestPhoneCountry
  dial: string
  label: string
}> = [
  { code: 'IN', dial: '+91', label: 'India' },
  { code: 'ES', dial: '+34', label: 'Spain' },
  { code: 'AE', dial: '+971', label: 'UAE' },
  { code: 'US', dial: '+1', label: 'USA' },
  { code: 'GB', dial: '+44', label: 'UK' },
  { code: 'AU', dial: '+61', label: 'Australia' },
  { code: 'SG', dial: '+65', label: 'Singapore' },
  { code: 'CA', dial: '+1', label: 'Canada' },
  { code: 'DE', dial: '+49', label: 'Germany' },
  { code: 'FR', dial: '+33', label: 'France' },
]

export const DEFAULT_GUEST_PHONE_COUNTRY: GuestPhoneCountry = 'IN'

/**
 * Parse a pasted or typed phone into E.164.
 * Accepts spaces, dashes, parentheses, and leading +.
 */
export function parseGuestPhone(
  input: string | null | undefined,
  defaultCountry: GuestPhoneCountry = DEFAULT_GUEST_PHONE_COUNTRY,
): ParsedGuestPhone {
  const raw = String(input ?? '').trim()
  if (!raw) {
    return { e164: null, country: defaultCountry, national: '', valid: true }
  }

  const parsed = parsePhoneNumberFromString(raw, defaultCountry)
  if (parsed && parsed.isValid()) {
    return {
      e164: parsed.format('E.164'),
      country: (parsed.country || defaultCountry) as GuestPhoneCountry,
      national: parsed.formatNational(),
      valid: true,
    }
  }

  // Partial / invalid — still return as-you-type national for the UI
  const formatter = new AsYouType(defaultCountry)
  const national = formatter.input(raw.replace(/[^\d+]/g, '').startsWith('+') ? raw : raw)
  return {
    e164: null,
    country: (formatter.getCountry() || defaultCountry) as GuestPhoneCountry,
    national: national || raw,
    valid: false,
    error: `Enter a valid phone number for +${formatter.getCallingCode() || '??'}`,
  }
}

/** Format stored E.164 (or legacy) for display in lists. */
export function formatGuestPhoneDisplay(phone: string | null | undefined): string {
  const e164 = legacyPhoneToE164(phone)
  if (!e164) return ''
  const parsed = parsePhoneNumberFromString(e164)
  if (!parsed) return phone?.trim() || ''
  return parsed.formatInternational()
}

/** Digits only for WhatsApp / SMS APIs (no leading +). */
export function toWhatsAppDigits(phone: string | null | undefined): string {
  const e164 = legacyPhoneToE164(phone)
  if (!e164) return ''
  return e164.replace(/\D/g, '')
}

/**
 * Convert stored phone to E.164.
 * Bare 10-digit Indian numbers become +91…
 */
export function legacyPhoneToE164(phone: string | null | undefined): string | null {
  const raw = String(phone ?? '').trim()
  if (!raw) return null

  if (raw.startsWith('+')) {
    const parsed = parsePhoneNumberFromString(raw)
    return parsed?.isValid() ? parsed.format('E.164') : raw
  }

  const digits = raw.replace(/\D/g, '')
  if (!digits) return null

  // Legacy India: exactly 10 digits, no country code stored
  if (digits.length === 10) {
    const parsed = parsePhoneNumberFromString(digits, 'IN')
    if (parsed?.isValid()) return parsed.format('E.164')
  }

  // Already includes country code without +
  const withPlus = parsePhoneNumberFromString(`+${digits}`)
  if (withPlus?.isValid()) return withPlus.format('E.164')

  const asIn = parsePhoneNumberFromString(digits, 'IN')
  if (asIn?.isValid()) return asIn.format('E.164')

  return null
}

/** Live national formatting while typing (no country dial code in the field). */
export function formatNationalAsYouType(
  nationalInput: string,
  country: GuestPhoneCountry,
): string {
  const digits = nationalInput.replace(/\D/g, '')
  if (!digits) return ''
  const formatter = new AsYouType(country)
  return formatter.input(digits)
}

/**
 * Normalize phone for API persistence.
 * Empty → null. Invalid → error string.
 */
export function normalizeGuestPhoneForStorage(
  phone: string | null | undefined,
  defaultCountry: GuestPhoneCountry = DEFAULT_GUEST_PHONE_COUNTRY,
): { phone: string | null; error?: string } {
  const raw = String(phone ?? '').trim()
  if (!raw) return { phone: null }

  const fromLegacy = legacyPhoneToE164(raw)
  if (fromLegacy) return { phone: fromLegacy }

  const parsed = parseGuestPhone(raw, defaultCountry)
  if (parsed.valid && parsed.e164) return { phone: parsed.e164 }

  return { phone: null, error: parsed.error || 'Invalid phone number' }
}
