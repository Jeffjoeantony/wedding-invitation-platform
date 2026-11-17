'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import type { ClassicRomanceData } from '../sample-data'
import { HeartRule } from '../heart-rule'
import { CR } from '../tokens'

const SANS = 'var(--font-invite-sans), system-ui, sans-serif'
const SCRIPT = 'var(--font-invite-script), "Segoe Script", cursive'
const SERIF = 'var(--font-invite-serif), Georgia, serif'

export function RsvpSection({
  data,
  preview = true,
}: {
  data: ClassicRomanceData
  preview?: boolean
}) {
  const { rsvp, couple, footer } = data
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [attendance, setAttendance] = useState<'yes' | 'no' | ''>('')
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !attendance) return
    if (preview) setSent(true)
  }

  return (
    <section
      className="relative overflow-hidden px-7 pb-16 pt-12 text-center sm:px-10 sm:pb-20 sm:pt-14"
      style={{ background: CR.cream, color: CR.ink }}
    >
      <h2
        className="text-[clamp(1.55rem,6.5vw,1.95rem)] font-semibold uppercase tracking-[0.16em]"
        style={{ color: CR.burgundy, fontFamily: SANS }}
      >
        {rsvp.title}
      </h2>
      <div className="mt-4">
        <HeartRule />
      </div>

      <div
        className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: CR.burgundy }}
        aria-hidden
      >
        <Heart className="h-6 w-6" style={{ color: CR.onDark }} fill="currentColor" strokeWidth={0} />
      </div>

      <p
        className="mx-auto mt-6 max-w-[32ch] text-[0.92rem] font-light leading-relaxed"
        style={{ color: CR.burgundySoft, fontFamily: SANS }}
      >
        {rsvp.body}
      </p>

      {!open && !sent ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-8 inline-flex rounded-full px-10 py-3.5 text-[0.72rem] font-semibold uppercase tracking-[0.2em] transition hover:opacity-90"
          style={{ background: CR.burgundy, color: CR.onDark, fontFamily: SANS }}
        >
          {rsvp.cta}
        </button>
      ) : null}

      {open && !sent ? (
        <form onSubmit={onSubmit} className="mx-auto mt-8 w-full max-w-sm space-y-4 text-left" noValidate>
          <p
            className="text-center text-[0.62rem] font-semibold uppercase tracking-[0.24em]"
            style={{ color: CR.burgundySoft, fontFamily: SANS }}
          >
            {rsvp.deadline}
          </p>
          <label className="block">
            <span className="mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.16em]" style={{ color: CR.burgundy, fontFamily: SANS }}>
              Your name *
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Full name"
              className="w-full rounded-xl border bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-[#5C1018]"
              style={{ borderColor: 'rgba(92,16,24,0.25)', color: CR.ink, fontFamily: SANS }}
            />
          </label>
          <fieldset>
            <legend className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em]" style={{ color: CR.burgundy, fontFamily: SANS }}>
              Will you attend? *
            </legend>
            <div className="flex gap-2">
              {(
                [
                  { id: 'yes', label: 'With pleasure' },
                  { id: 'no', label: 'Cannot attend' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAttendance(opt.id)}
                  className="flex-1 rounded-xl border px-3 py-2.5 text-[0.75rem] font-medium transition"
                  style={{
                    borderColor: attendance === opt.id ? CR.burgundy : 'rgba(92,16,24,0.25)',
                    background: attendance === opt.id ? 'rgba(92,16,24,0.08)' : 'transparent',
                    color: CR.burgundy,
                    fontFamily: SANS,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.16em]" style={{ color: CR.burgundy, fontFamily: SANS }}>
              Other
            </span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note"
              className="w-full rounded-xl border bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-[#5C1018]"
              style={{ borderColor: 'rgba(92,16,24,0.25)', color: CR.ink, fontFamily: SANS }}
            />
          </label>
          <button
            type="submit"
            disabled={!name.trim() || !attendance}
            className="mt-2 w-full rounded-full px-4 py-3.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-45"
            style={{ background: CR.burgundy, color: CR.onDark, fontFamily: SANS }}
          >
            Send response
          </button>
        </form>
      ) : null}

      {sent ? (
        <p className="mt-8 text-[1.05rem] font-light" style={{ color: CR.burgundy, fontFamily: SERIF }}>
          Thank you — your response has been noted.
        </p>
      ) : null}

      <div className="mt-14">
        <HeartRule />
      </div>
      <p
        className="mt-5 text-[0.72rem] font-semibold uppercase tracking-[0.22em]"
        style={{ color: CR.burgundy, fontFamily: SANS }}
      >
        {footer.line}
      </p>
      <p
        className="mt-4 text-[clamp(2.4rem,10vw,3.2rem)] leading-[1.1]"
        style={{ color: CR.burgundy, fontFamily: SCRIPT }}
      >
        <span className="block">{couple.first}</span>
        <span className="block">{couple.second}</span>
      </p>

      <div
        className="pointer-events-none absolute bottom-6 left-1/2 -z-0 -translate-x-1/2 text-[7rem] font-light opacity-[0.06] sm:text-[9rem]"
        style={{ color: CR.burgundy, fontFamily: SERIF }}
        aria-hidden
      >
        {couple.first.charAt(0)}&{couple.second.charAt(0)}
      </div>
    </section>
  )
}
