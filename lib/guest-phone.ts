import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
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

export type GuestPhoneCountryOption = {
  code: GuestPhoneCountry
  dial: string
  label: string
}

/** Prefer these near the top of the country selector. */
const PINNED_COUNTRIES: GuestPhoneCountry[] = [
  'IN',
  'ES',
  'AE',
  'US',
  'GB',
  'AU',
  'SG',
  'CA',
  'DE',
  'FR',
]

function countryDisplayName(code: GuestPhoneCountry): string {
  try {
    const name = new Intl.DisplayNames(['en'], { type: 'region' }).of(code)
    return name || code
  } catch {
    return code
  }
}

function buildGuestPhoneCountries(): GuestPhoneCountryOption[] {
  const all = getCountries().map((code) => ({
    code,
    dial: `+${getCountryCallingCode(code)}`,
    label: countryDisplayName(code),
  }))

  const pinnedSet = new Set(PINNED_COUNTRIES)
  const pinned = PINNED_COUNTRIES.map(
    (code) => all.find((c) => c.code === code)!,
  ).filter(Boolean)
  const rest = all
    .filter((c) => !pinnedSet.has(c.code))
    .sort((a, b) => a.label.localeCompare(b.label))

  return [...pinned, ...rest]
}

/** All libphonenumber countries (pinned commons first, then A–Z). */
export const GUEST_PHONE_COUNTRIES: GuestPhoneCountryOption[] =
  buildGuestPhoneCountries()

export const DEFAULT_GUEST_PHONE_COUNTRY: GuestPhoneCountry = 'IN'

/**
 * National number for the input field — no trunk prefix (India's leading 0).
 * Uses nationalNumber + AsYouType so paste of +91 94473… shows 94473 90669.
 */
export function formatNationalForInput(
  phone: { nationalNumber: string; country?: string } | null | undefined,
  fallbackCountry: GuestPhoneCountry = DEFAULT_GUEST_PHONE_COUNTRY,
): string {
  if (!phone?.nationalNumber) return ''
  const country = (phone.country as GuestPhoneCountry) || fallbackCountry
  const formatter = new AsYouType(country)
  return formatter.input(phone.nationalNumber)
}

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
      national: formatNationalForInput(parsed, defaultCountry),
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
