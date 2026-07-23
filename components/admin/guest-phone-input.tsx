'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DEFAULT_GUEST_PHONE_COUNTRY,
  GUEST_PHONE_COUNTRIES,
  formatNationalAsYouType,
  formatNationalForInput,
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
  return parsed ? formatNationalForInput(parsed) : ''
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
    national: formatNationalForInput(p, country),
  }
}

/** Normalize search so "+968", "968", "oman" all work. */
function normalizeCountryQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, ' ')
}

function countryMatchesQuery(
  dial: string,
  code: string,
  label: string,
  query: string,
): boolean {
  const q = normalizeCountryQuery(query)
  if (!q) return true
  const dialDigits = dial.replace(/\D/g, '')
  const qDigits = q.replace(/\D/g, '')
  const hay = `${dial} ${dialDigits} ${code} ${label}`.toLowerCase()
  if (hay.includes(q)) return true
  if (qDigits && (dialDigits.startsWith(qDigits) || dialDigits.includes(qDigits))) return true
  if (q.startsWith('+') && dial.startsWith(q)) return true
  return false
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
  const [countryOpen, setCountryOpen] = useState(false)
  const [countryQuery, setCountryQuery] = useState('')
  const lastEmitted = useRef(value)

  const onValidityChangeRef = useRef(onValidityChange)
  onValidityChangeRef.current = onValidityChange

  // Sync from parent when value changes externally (edit dialog open / reset)
  useEffect(() => {
    if (value === lastEmitted.current) return
    lastEmitted.current = value
    if (!value) {
      setNational('')
      setCountry(defaultCountry)
      onValidityChangeRef.current?.(true)
      return
    }
    const e164 = legacyPhoneToE164(value) || (value.startsWith('+') ? value : '')
    if (!e164) return
    setCountry(countryFromE164(e164))
    setNational(nationalFromE164(e164))
    onValidityChangeRef.current?.(true)
  }, [value, defaultCountry])

  const filteredCountries = useMemo(() => {
    return GUEST_PHONE_COUNTRIES.filter((c) =>
      countryMatchesQuery(c.dial, c.code, c.label, countryQuery),
    )
  }, [countryQuery])

  const selectedCountry = GUEST_PHONE_COUNTRIES.find((c) => c.code === country)

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
    const nextNational = formatNationalForInput(p, nextCountry)
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
    setCountryOpen(false)
    setCountryQuery('')
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
  const dial = selectedCountry?.dial || country
  const errorMessage =
    externalError || (showError ? `Enter a valid phone number for ${dial}` : '')

  return (
    <div className={cn(className)}>
      {label ? <Label htmlFor={fieldId}>{label}</Label> : null}
      <div className={cn('flex gap-2', label ? 'mt-2' : '')}>
        <Popover
          open={countryOpen}
          onOpenChange={(open) => {
            setCountryOpen(open)
            if (!open) setCountryQuery('')
          }}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={countryOpen}
              aria-label="Country code"
              className="h-9 w-[9.5rem] shrink-0 justify-between rounded-xl px-3 font-mono text-sm font-normal"
            >
              <span className="truncate">{selectedCountry?.dial ?? '+91'}</span>
              <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[min(100vw-2rem,20rem)] p-0"
            align="start"
            sideOffset={4}
          >
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search +968 or Oman…"
                value={countryQuery}
                onValueChange={setCountryQuery}
              />
              <CommandList className="max-h-72">
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {filteredCountries.map((c) => (
                    <CommandItem
                      key={c.code}
                      value={`${c.dial} ${c.code} ${c.label}`}
                      onSelect={() => handleCountryChange(c.code)}
                      className="gap-2"
                    >
                      <Check
                        className={cn(
                          'h-3.5 w-3.5 shrink-0',
                          country === c.code ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="font-mono tabular-nums text-sm">{c.dial}</span>
                      <span className="truncate text-sm text-muted-foreground">{c.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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
