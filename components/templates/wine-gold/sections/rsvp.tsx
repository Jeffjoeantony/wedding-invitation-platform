'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { WineGoldData } from '../sample-data'
import { WG } from '../tokens'

const SERIF = 'var(--font-invite-serif), Georgia, serif'
const SANS = 'var(--font-invite-sans), system-ui, sans-serif'
const RSVP_BG = '/landing/templates/wine-gold-events.png'

type FormState = {
  names: string
  attendance: 'yes' | 'no' | ''
  overnight: 'yes' | 'no' | ''
  other: string
}

type Step = keyof FormState

const STEPS: Step[] = ['names', 'attendance', 'overnight', 'other']

const STEP_LABELS: Record<Step, string> = {
  names: 'Your names',
  attendance: 'Will you be able to attend?',
  overnight: 'Planning to stay overnight?',
  other: 'Other',
}

function isFilled(form: FormState, step: Step) {
  const value = form[step]
  return typeof value === 'string' ? value.trim().length > 0 : false
}

function allFilled(form: FormState) {
  return STEPS.every((step) => isFilled(form, step))
}

function canOpenStep(form: FormState, step: Step) {
  const index = STEPS.indexOf(step)
  return STEPS.slice(0, index).every((s) => isFilled(form, s))
}

export function RsvpSection({
  data,
  preview = true,
}: {
  data: WineGoldData
  preview?: boolean
}) {
  const { rsvp } = data
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormState>({
    names: '',
    attendance: '',
    overnight: '',
    other: '',
  })
  const [active, setActive] = useState<Step>('names')
  const namesRef = useRef<HTMLInputElement>(null)
  const otherRef = useRef<HTMLInputElement>(null)
  const allowFocusRef = useRef(false)

  useEffect(() => {
    // Only focus after the guest interacts — never on first load (avoids jump-to-RSVP)
    if (!allowFocusRef.current) return
    if (active === 'names') namesRef.current?.focus({ preventScroll: true })
    if (active === 'other') otherRef.current?.focus({ preventScroll: true })
  }, [active])

  const goNext = (from: Step) => {
    const index = STEPS.indexOf(from)
    const next = STEPS[index + 1]
    if (next) {
      allowFocusRef.current = true
      setActive(next)
      setError('')
    }
  }

  const openStep = (step: Step) => {
    if (!canOpenStep(form, step)) {
      setError('Please complete the previous questions first.')
      return
    }
    setError('')
    allowFocusRef.current = true
    setActive(step)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!allFilled(form)) {
      const firstEmpty = STEPS.find((step) => !isFilled(form, step))
      if (firstEmpty) {
        setActive(firstEmpty)
        setError('Please fill in all required fields.')
      }
      return
    }
    setError('')
    if (preview) {
      setSent(true)
    }
  }

  const inputStyle = {
    borderColor: 'rgba(255,249,240,0.28)',
    color: WG.onDark,
    fontFamily: SANS,
    marginLeft: '1.75rem',
    width: 'calc(100% - 1.75rem)',
  } as const

  return (
    <section className="relative z-0 flex min-h-[100svh] w-full flex-col overflow-hidden">
      <Image
        src={RSVP_BG}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 560px, 680px"
        className="object-cover object-center"
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgba(45,9,14,0.55) 0%, rgba(45,9,14,0.28) 45%, rgba(45,9,14,0.12) 100%)',
        }}
        aria-hidden
      />

      <div className="relative z-[1] flex flex-1 flex-col justify-center px-7 py-16 sm:px-10 sm:py-20">
        <p
          className="text-center text-[0.72rem] font-semibold uppercase tracking-[0.28em]"
          style={{ color: WG.goldSoft, fontFamily: SANS }}
        >
          {rsvp.deadline}
        </p>

        <h3
          className="mt-4 text-center text-[clamp(2.45rem,9.5vw,3.15rem)] font-light leading-[1.12]"
          style={{ color: WG.onDark, fontFamily: SERIF }}
        >
          <span className="block">{rsvp.titleLine1}</span>
          <span className="block">{rsvp.titleLine2}</span>
        </h3>

        <p
          className="mx-auto mt-4 max-w-[34ch] text-center text-[0.98rem] font-light leading-relaxed"
          style={{ color: 'rgba(255,249,240,0.72)', fontFamily: SANS }}
        >
          {rsvp.body}
        </p>

        {sent ? (
          <p
            className="mt-10 text-center text-[1.1rem] font-light"
            style={{ color: WG.goldSoft, fontFamily: SERIF }}
          >
            Thank you — your response has been noted.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mx-auto mt-9 w-full max-w-md" noValidate>
            <ul className="space-y-0">
              {STEPS.map((step, index) => {
                const unlocked = canOpenStep(form, step)
                const filled = isFilled(form, step)
                const isActive = active === step

                return (
                  <li
                    key={step}
                    className={
                      index === STEPS.length - 1
                        ? 'py-3.5'
                        : 'border-b border-white/10 py-3.5'
                    }
                  >
                    <button
                      type="button"
                      onClick={() => openStep(step)}
                      className="flex w-full items-start gap-3 text-left"
                      aria-expanded={isActive}
                    >
                      <RadioDot filled={filled} />
                      <span
                        className="pt-0.5 text-[1.08rem] font-light"
                        style={{
                          color: unlocked ? WG.onDark : 'rgba(255,249,240,0.4)',
                          fontFamily: SANS,
                        }}
                      >
                        {STEP_LABELS[step]}
                        <span className="text-[0.85rem]" style={{ color: WG.goldSoft }}>
                          {' '}
                          *
                        </span>
                      </span>
                    </button>

                    {isActive && step === 'names' ? (
                      <input
                        ref={namesRef}
                        value={form.names}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, names: e.target.value }))
                          setError('')
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (form.names.trim()) goNext('names')
                            else setError('Please enter your name(s).')
                          }
                        }}
                        onBlur={() => {
                          if (form.names.trim()) goNext('names')
                        }}
                        required
                        placeholder="Full name(s)"
                        className="mt-2.5 rounded-lg border bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-white/35 focus:border-[#C5A16A]"
                        style={inputStyle}
                      />
                    ) : null}

                    {isActive && step === 'attendance' ? (
                      <ChoiceRow
                        value={form.attendance}
                        options={[
                          { id: 'yes', label: 'With pleasure' },
                          { id: 'no', label: 'Cannot attend' },
                        ]}
                        onSelect={(id) => {
                          setForm((f) => ({ ...f, attendance: id }))
                          setError('')
                          setTimeout(() => goNext('attendance'), 120)
                        }}
                      />
                    ) : null}

                    {isActive && step === 'overnight' ? (
                      <ChoiceRow
                        value={form.overnight}
                        options={[
                          { id: 'yes', label: 'Yes' },
                          { id: 'no', label: 'No' },
                        ]}
                        onSelect={(id) => {
                          setForm((f) => ({ ...f, overnight: id }))
                          setError('')
                          setTimeout(() => goNext('overnight'), 120)
                        }}
                      />
                    ) : null}

                    {isActive && step === 'other' ? (
                      <input
                        ref={otherRef}
                        value={form.other}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, other: e.target.value }))
                          setError('')
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (!form.other.trim()) {
                              setError('Please complete this field.')
                            }
                          }
                        }}
                        required
                        placeholder="Your note"
                        className="mt-2.5 rounded-lg border bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-white/35 focus:border-[#C5A16A]"
                        style={inputStyle}
                      />
                    ) : null}
                  </li>
                )
              })}
            </ul>

            {error ? (
              <p
                className="mt-4 text-center text-[0.85rem] font-medium"
                style={{ color: '#E8B4B8', fontFamily: SANS }}
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!allFilled(form)}
              className="mt-8 w-full rounded-xl px-4 py-4 text-[0.82rem] font-semibold uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-45"
              style={{
                background: WG.ivory,
                color: WG.burgundy,
                fontFamily: SANS,
              }}
            >
              {rsvp.cta}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

function ChoiceRow({
  value,
  options,
  onSelect,
}: {
  value: 'yes' | 'no' | ''
  options: Array<{ id: 'yes' | 'no'; label: string }>
  onSelect: (id: 'yes' | 'no') => void
}) {
  return (
    <div className="ml-7 mt-2.5 flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt.id)}
          className="flex-1 rounded-lg border px-3 py-2.5 text-[0.82rem] font-medium transition"
          style={{
            borderColor: value === opt.id ? WG.gold : 'rgba(255,249,240,0.28)',
            background: value === opt.id ? 'rgba(197,161,106,0.18)' : 'transparent',
            color: WG.onDark,
            fontFamily: SANS,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function RadioDot({ filled }: { filled: boolean }) {
  return (
    <span
      className="mt-1 flex h-[1.05rem] w-[1.05rem] shrink-0 items-center justify-center rounded-full border"
      style={{ borderColor: filled ? WG.goldSoft : 'rgba(255,249,240,0.55)' }}
      aria-hidden
    >
      {filled ? (
        <span className="block h-2 w-2 rounded-full" style={{ background: WG.goldSoft }} />
      ) : null}
    </span>
  )
}
