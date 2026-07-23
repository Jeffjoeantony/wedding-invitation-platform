'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DEFAULT_GUEST_PHONE_COUNTRY,
  GUEST_PHONE_COUNTRIES,
  formatNationalAsYouType,
  legacyPhoneToE164,
  type GuestPhoneCountry,
} from '@/lib/guest-phone'
import { cn } from '@/lib/utils'

type GuestPhoneInputProps = {
  id?: string
  label?: string
  /** E.164 (`+916282645916`) or empty string. */
  value: string
  onChange: (e164: string) => void
  /** true when empty or a valid complete number. */
  onValidityChange?: (valid: boolean) => void
  defaultCountry?: GuestPhoneCountry
  className?: string
  error?: string
}

function countryFromE164(e164: string | null | undefined): GuestPhoneCountry {
  if (!e164) return DEFAULT_GUEST_PHONE_COUNTRY
  const parsed = parsePhoneNumberFromString(e164)
  return (parsed?.country as GuestPhoneCountry) || DEFAULT_GUEST_PHONE_COUNTRY
}

function nationalFromE164(e164: string | null | undefined): string {
  if (!e164) return ''
  const parsed = parsePhoneNumberFromString(e164)
  return parsed ? parsed.formatNational() : ''
}

function tryParse(
  national: string,
  country: GuestPhoneCountry,
): { e164: string; country: GuestPhoneCountry; national: string } | null {
  const trimmed = national.trim()
  if (!trimmed) return null
  const p = parsePhoneNumberFromString(trimmed, country)
  if (!p?.isValid()) return null
  return {
    e164: p.format('E.164'),
    country: (p.country as GuestPhoneCountry) || country,
    national: p.formatNational(),
  }
}

/**
 * Country + national phone field with paste-friendly international parsing.
 * Emits E.164 via `onChange` only when empty or fully valid.
 */
export function GuestPhoneInput({
  id,
  label = 'Phone',
  value,
  onChange,
  onValidityChange,
  defaultCountry = DEFAULT_GUEST_PHONE_COUNTRY,
  className,
  error: externalError,
}: GuestPhoneInputProps) {
  const autoId = useId()
  const fieldId = id || autoId
  const [country, setCountry] = useState<GuestPhoneCountry>(() =>
    value ? countryFromE164(legacyPhoneToE164(value) || value) : defaultCountry,
  )
  const [national, setNational] = useState(() =>
    nationalFromE164(legacyPhoneToE164(value) || value),
  )
  const [touched, setTouched] = useState(false)
  const lastEmitted = useRef(value)

  // Sync from parent when value changes externally (edit dialog open / reset)
  useEffect(() => {
    if (value === lastEmitted.current) return
    lastEmitted.current = value
    if (!value) {
      setNational('')
      setCountry(defaultCountry)
      onValidityChange?.(true)
      return
    }
    const e164 = legacyPhoneToE164(value) || (value.startsWith('+') ? value : '')
    if (!e164) return
    setCountry(countryFromE164(e164))
    setNational(nationalFromE164(e164))
    onValidityChange?.(true)
  }, [value, defaultCountry, onValidityChange])

  const report = (nextCountry: GuestPhoneCountry, nextNational: string) => {
    const cleaned = nextNational.trim()
    if (!cleaned) {
      lastEmitted.current = ''
      onChange('')
      onValidityChange?.(true)
      return
    }
    const ok = tryParse(cleaned, nextCountry)
    if (ok) {
      lastEmitted.current = ok.e164
      onChange(ok.e164)
      onValidityChange?.(true)
    } else {
      onValidityChange?.(false)
    }
  }

  const applyInternational = (raw: string): boolean => {
    const p = parsePhoneNumberFromString(raw, country)
    if (!p?.isValid()) return false
    const nextCountry = (p.country as GuestPhoneCountry) || country
    const nextNational = p.formatNational()
    const e164 = p.format('E.164')
    setCountry(nextCountry)
    setNational(nextNational)
    lastEmitted.current = e164
    onChange(e164)
    onValidityChange?.(true)
    return true
  }

  const handleNationalChange = (raw: string) => {
    setTouched(true)
    if (raw.includes('+') && applyInternational(raw)) return

    const formatted = formatNationalAsYouType(raw, country)
    setNational(formatted)
    report(country, formatted)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text')?.trim()
    if (!text) return
    if (applyInternational(text)) {
      e.preventDefault()
      setTouched(true)
    }
  }

  const handleCountryChange = (code: string) => {
    const next = code as GuestPhoneCountry
    setCountry(next)
    setTouched(true)
    if (!national.trim()) {
      lastEmitted.current = ''
      onChange('')
      onValidityChange?.(true)
      return
    }
    const formatted = formatNationalAsYouType(national, next)
    setNational(formatted)
    report(next, formatted)
  }

  const isComplete = !national.trim() || Boolean(tryParse(national, country))
  const showError =
    Boolean(externalError) || (touched && national.trim().length > 0 && !isComplete)
  const dial = GUEST_PHONE_COUNTRIES.find((c) => c.code === country)?.dial || country
  const errorMessage =
    externalError || (showError ? `Enter a valid phone number for ${dial}` : '')

  return (
    <div className={cn(className)}>
      {label ? <Label htmlFor={fieldId}>{label}</Label> : null}
      <div className={cn('flex gap-2', label ? 'mt-2' : '')}>
        <Select value={country} onValueChange={handleCountryChange}>
          <SelectTrigger
            aria-label="Country code"
            className="w-[7.5rem] shrink-0 rounded-xl font-mono text-sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GUEST_PHONE_COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code} className="font-mono text-sm">
                {c.dial} {c.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          id={fieldId}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={national}
          onChange={(e) => handleNationalChange(e.target.value)}
          onPaste={handlePaste}
          onBlur={() => setTouched(true)}
          placeholder="Paste or type number"
          className={cn(
            'rounded-xl font-mono',
            showError ? 'border-red-400 focus-visible:ring-red-300' : '',
          )}
        />
      </div>
      {showError && errorMessage ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
          <span>⚠</span> {errorMessage}
        </p>
      ) : null}
      {!showError && isComplete && national.trim() ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
          <span>✓</span> Valid mobile number
        </p>
      ) : null}
    </div>
  )
}
