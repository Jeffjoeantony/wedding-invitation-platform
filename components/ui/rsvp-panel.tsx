'use client'

import { submitRsvp } from '@/app/actions/rsvp'
import type { InvitationConfig } from '@/lib/invitation-config'
import { rsvpHeadlineParts } from '@/lib/invitation-config'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Minus, Phone, Plus } from 'lucide-react'
import { useMemo, useState, useTransition } from 'react'
import { Reveal, RevealStagger } from './reveal'

type Step = 'idle' | 'accept' | 'decline' | 'per-event' | 'confirmed-accept' | 'confirmed-decline'
type EventChoice = 'yes' | 'no' | 'pending'

const transition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }

export function RsvpPanel({ config }: { config: InvitationConfig }) {
  const events = config.events?.length ? config.events : []
  const multi = events.length > 1

  const [step, setStep] = useState<Step>('idle')
  const [pax, setPax] = useState(2)
  const [message, setMessage] = useState('')
  const [name, setName] = useState(
    config.guestName && config.guestName !== 'Guest' ? config.guestName : '',
  )
  const [choices, setChoices] = useState<Record<string, EventChoice>>(() => {
    const init: Record<string, EventChoice> = {}
    for (const ev of events) {
      init[ev.id] =
        ev.rsvpStatus === 'yes' || ev.rsvpStatus === 'no' ? ev.rsvpStatus : 'pending'
    }
    return init
  })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const needsName = !config.guestToken

  const choiceSummary = useMemo(() => {
    const values = Object.values(choices)
    if (values.length === 0) return null
    if (values.every((v) => v === 'yes')) return 'all-yes'
    if (values.every((v) => v === 'no')) return 'all-no'
    if (values.some((v) => v === 'pending')) return 'incomplete'
    return 'mixed'
  }, [choices])

  function guestNameOrError() {
    const guestName = (needsName ? name : config.guestName).trim()
    if (needsName && !guestName) {
      setError('Please enter your name.')
      return null
    }
    if (!config.guestToken && !config.projectId) {
      setError('This invitation link cannot submit an RSVP.')
      return null
    }
    return guestName
  }

  function confirmAccept() {
    setError(null)
    const guestName = guestNameOrError()
    if (!guestName) return
    startTransition(async () => {
      try {
        await submitRsvp({
          guestName,
          status: 'accepted',
          pax,
          message,
          token: config.guestToken,
          projectId: config.projectId,
        })
        setStep('confirmed-accept')
      } catch {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  function confirmDecline() {
    setError(null)
    const guestName = guestNameOrError()
    if (!guestName) return
    startTransition(async () => {
      try {
        await submitRsvp({
          guestName,
          status: 'declined',
          message,
          token: config.guestToken,
          projectId: config.projectId,
        })
        setStep('confirmed-decline')
      } catch {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  function confirmPerEvent() {
    setError(null)
    if (choiceSummary === 'incomplete' || Object.values(choices).some((c) => c === 'pending')) {
      setError('Please respond for each celebration.')
      return
    }
    const guestName = guestNameOrError()
    if (!guestName) return

    const responses: Record<string, { status: 'accepted' | 'declined'; pax?: number }> = {}
    for (const [eventId, choice] of Object.entries(choices)) {
      if (choice === 'pending') continue
      responses[eventId] = {
        status: choice === 'yes' ? 'accepted' : 'declined',
        pax: choice === 'yes' ? pax : 0,
      }
    }

    startTransition(async () => {
      try {
        await submitRsvp({
          guestName,
          status: choiceSummary === 'all-no' ? 'declined' : 'accepted',
          pax,
          message,
          token: config.guestToken,
          projectId: config.projectId,
          responses,
        })
        setStep(choiceSummary === 'all-no' ? 'confirmed-decline' : 'confirmed-accept')
      } catch {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  const headline = rsvpHeadlineParts(config.rsvpHeadline)

  return (
    <section id="rsvp" className="invite-section relative overflow-hidden px-6 py-16 sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,color-mix(in_oklab,var(--gold-soft)_20%,transparent),transparent_55%)]"
      />
      <RevealStagger className="relative text-center" stagger={0.1}>
        <p className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-gold">R.S.V.P</p>
        <h2 className="mt-3 font-serif text-3xl font-light text-foreground sm:text-4xl">
          {headline.mode === 'full' ? (
            <span className="italic text-gilded">{headline.full}</span>
          ) : headline.mode === 'will-you' ? (
            <>
              {headline.prefix}{' '}
              <span className="italic text-gilded">{headline.emphasis}</span>
            </>
          ) : (
            <>
              Will you <span className="italic text-gilded">join us?</span>
            </>
          )}
        </h2>
        <p className="mx-auto mt-4 max-w-sm font-sans text-sm leading-relaxed text-muted-foreground">
          Kindly let us know by responding below. We would be honoured to celebrate with you.
        </p>
      </RevealStagger>

      <Reveal direction="up" delay={0.12} className="mx-auto mt-10 max-w-sm">
        <AnimatePresence mode="wait">
          {step === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={transition}
              className="flex flex-col gap-3"
            >
              <button
                type="button"
                onClick={() => setStep('accept')}
                className="animate-shimmer relative overflow-hidden rounded-full border border-gold/60 bg-primary px-8 py-4 font-sans text-sm font-medium tracking-wide text-primary-foreground transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {multi ? 'Accept all celebrations' : 'Accept with Pleasure'}
              </button>
              {multi ? (
                <button
                  type="button"
                  onClick={() => setStep('per-event')}
                  className="rounded-full border border-gold/40 bg-transparent px-8 py-4 font-sans text-sm font-medium tracking-wide text-foreground transition-colors hover:border-gold hover:bg-gold/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Choose per celebration
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setStep('decline')}
                className="rounded-full border border-border bg-transparent px-8 py-4 font-sans text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {multi ? 'Decline all' : 'Regretfully Decline'}
              </button>
            </motion.div>
          )}

          {step === 'accept' && (
            <motion.div
              key="accept"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={transition}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <p className="text-center font-serif text-xl font-light text-foreground">
                Wonderful! How many will attend?
              </p>

              {needsName && (
                <label className="mt-5 block">
                  <span className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
                    Your name
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 font-sans text-sm text-foreground outline-none transition-shadow focus:border-gold focus:ring-2 focus:ring-gold/25"
                    placeholder="Full name"
                    autoComplete="name"
                  />
                </label>
              )}

              <div className="mt-6 flex items-center justify-center gap-6">
                <button
                  type="button"
                  aria-label="Decrease guests"
                  onClick={() => setPax((p) => Math.max(1, p - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-serif text-4xl font-light tabular-nums text-foreground">
                  {pax}
                </span>
                <button
                  type="button"
                  aria-label="Increase guests"
                  onClick={() => setPax((p) => Math.min(20, p + 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-center font-sans text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
                {pax === 1 ? 'Guest' : 'Guests'}
              </p>

              <label className="mt-6 block">
                <span className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
                  A note for the couple (optional)
                </span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  maxLength={500}
                  className="mt-2 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 font-sans text-sm text-foreground outline-none transition-shadow focus:border-gold focus:ring-2 focus:ring-gold/25"
                  placeholder="With love and warm wishes…"
                />
              </label>

              {error && <p className="mt-3 text-center font-sans text-xs text-destructive">{error}</p>}

              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={confirmAccept}
                  disabled={isPending}
                  className="rounded-full bg-primary px-6 py-3.5 font-sans text-sm font-medium tracking-wide text-primary-foreground transition-transform duration-300 hover:scale-[1.02] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {isPending ? 'Sending…' : 'Confirm Attendance'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('idle')}
                  className="font-sans text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                >
                  Back
                </button>
              </div>
            </motion.div>
          )}

          {step === 'per-event' && multi && (
            <motion.div
              key="per-event"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={transition}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <p className="text-center font-serif text-xl font-light text-foreground">
                Respond for each celebration
              </p>

              {needsName && (
                <label className="mt-5 block">
                  <span className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
                    Your name
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 font-sans text-sm text-foreground outline-none transition-shadow focus:border-gold focus:ring-2 focus:ring-gold/25"
                    placeholder="Full name"
                    autoComplete="name"
                  />
                </label>
              )}

              <div className="mt-5 space-y-4">
                {events.map((ev) => (
                  <div key={ev.id} className="rounded-xl border border-border/80 p-4">
                    <p className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-gold">
                      {ev.label}
                    </p>
                    {ev.dateLabel ? (
                      <p className="mt-1 font-serif text-sm text-muted-foreground">{ev.dateLabel}</p>
                    ) : null}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setChoices((c) => ({ ...c, [ev.id]: 'yes' }))}
                        className={`rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${
                          choices[ev.id] === 'yes'
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border text-muted-foreground hover:border-gold'
                        }`}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => setChoices((c) => ({ ...c, [ev.id]: 'no' }))}
                        className={`rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${
                          choices[ev.id] === 'no'
                            ? 'border border-foreground/40 bg-muted text-foreground'
                            : 'border border-border text-muted-foreground hover:border-foreground/40'
                        }`}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {Object.values(choices).some((c) => c === 'yes') ? (
                <div className="mt-6">
                  <p className="text-center font-sans text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
                    Guests attending
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-6">
                    <button
                      type="button"
                      aria-label="Decrease guests"
                      onClick={() => setPax((p) => Math.max(1, p - 1))}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-border"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-serif text-4xl font-light tabular-nums">
                      {pax}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase guests"
                      onClick={() => setPax((p) => Math.min(20, p + 1))}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-border"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : null}

              {error && <p className="mt-3 text-center font-sans text-xs text-destructive">{error}</p>}

              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={confirmPerEvent}
                  disabled={isPending}
                  className="rounded-full bg-primary px-6 py-3.5 font-sans text-sm font-medium tracking-wide text-primary-foreground disabled:opacity-60"
                >
                  {isPending ? 'Sending…' : 'Submit response'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('idle')}
                  className="font-sans text-xs tracking-wide text-muted-foreground"
                >
                  Back
                </button>
              </div>
            </motion.div>
          )}

          {step === 'decline' && (
            <motion.div
              key="decline"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={transition}
              className="rounded-2xl border border-border bg-card p-6 text-center"
            >
              <p className="font-serif text-xl font-light text-foreground">
                We&apos;ll miss you dearly
              </p>
              <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">
                If you&apos;d like, leave a note for {config.couple1} &amp; {config.couple2}.
              </p>
              {needsName && (
                <label className="mt-4 block text-left">
                  <span className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
                    Your name
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 font-sans text-sm text-foreground outline-none transition-shadow focus:border-gold focus:ring-2 focus:ring-gold/25"
                    placeholder="Full name"
                    autoComplete="name"
                  />
                </label>
              )}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                maxLength={500}
                className="mt-4 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 font-sans text-sm text-foreground outline-none transition-shadow focus:border-gold focus:ring-2 focus:ring-gold/25"
                placeholder="Sending my love from afar…"
              />
              {error && <p className="mt-3 font-sans text-xs text-destructive">{error}</p>}
              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={confirmDecline}
                  disabled={isPending}
                  className="rounded-full border border-border bg-transparent px-6 py-3.5 font-sans text-sm font-medium tracking-wide text-foreground transition-colors hover:border-foreground/40 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {isPending ? 'Sending…' : 'Send Regrets'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('idle')}
                  className="font-sans text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                >
                  Back
                </button>
              </div>
            </motion.div>
          )}

          {(step === 'confirmed-accept' || step === 'confirmed-decline') && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={transition}
              className="rounded-2xl border border-gold/40 bg-card p-8 text-center"
            >
              <motion.span
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 bg-[color-mix(in_oklab,var(--gold-soft)_25%,white)]"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 14 }}
              >
                <Check className="h-6 w-6 text-gold" strokeWidth={2} />
              </motion.span>
              <p className="mt-5 font-serif text-2xl font-light text-foreground">
                {step === 'confirmed-accept' ? 'Thank you' : 'Noted with love'}
              </p>
              <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">
                {step === 'confirmed-accept'
                  ? `Your response has been received. We can't wait to celebrate with you${name || config.guestName ? `, ${name || config.guestName}` : ''}.`
                  : `Thank you for letting us know. You will be missed${name || config.guestName ? `, ${name || config.guestName}` : ''}.`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {config.contact ? (
          <div className="mt-10 text-center">
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
              Questions?
            </p>
            <a
              href={`tel:${config.contact.replace(/\s/g, '')}`}
              aria-label={`Contact us at ${config.contact}`}
              title={config.contact}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 font-serif text-sm font-light tracking-wide text-foreground transition-all duration-300 hover:border-gold hover:bg-gold/10 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Phone className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} aria-hidden="true" />
              Contact us
            </a>
          </div>
        ) : null}
      </Reveal>
    </section>
  )
}
