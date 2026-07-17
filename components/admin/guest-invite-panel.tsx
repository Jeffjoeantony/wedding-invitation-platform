'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  effectiveInvitedTo,
  eventLabel,
  parseInvitedTo,
  parseRsvpByEvent,
  primaryEventIdFromTemplate,
  resolveProjectEvents,
  type ProjectEvent,
  type RsvpByEvent,
} from '@/lib/project-events'
import { useEffect, useState } from 'react'

type GuestLike = {
  id: string
  name: string
  phone?: string
  invited_to?: unknown
  rsvp_by_event?: unknown
  rsvp_status: 'pending' | 'yes' | 'no'
  pax_count: number
  rsvp_headline?: string | null
  greeting_line?: string | null
  hide_greeting?: boolean | null
}

const DEFAULT_RSVP_HEADLINE = 'Will you join us?'

type ProjectLike = {
  events?: unknown
  date?: string
  time?: string
  venue?: string
  location?: string
  maps_url?: string
  event_template?: string | null
}

export function GuestInvitePanel({
  guest,
  project,
  projectId,
  open,
  onClose,
  onSaved,
}: {
  guest: GuestLike | null
  project: ProjectLike
  projectId: string
  open: boolean
  onClose: () => void
  onSaved: (guest: GuestLike) => void
}) {
  const projectEvents = resolveProjectEvents(project)
  const primaryId = primaryEventIdFromTemplate(project.event_template)
  const extraEventIds = projectEvents.map((e) => e.id).filter((id) => id !== primaryId)

  // invitedTo state stores ONLY optional extras (not primary)
  const [extras, setExtras] = useState<string[]>([])
  const [rsvpByEvent, setRsvpByEvent] = useState<RsvpByEvent>({})
  const [rsvpHeadline, setRsvpHeadline] = useState('')
  const [greetingLine, setGreetingLine] = useState('')
  const [hideGreeting, setHideGreeting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!guest) return
    const parsed = parseInvitedTo(guest.invited_to, projectEvents.map((e) => e.id))
    setExtras(parsed.filter((id) => id !== primaryId && extraEventIds.includes(id)))
    setRsvpByEvent(parseRsvpByEvent(guest.rsvp_by_event))
    setRsvpHeadline(guest.rsvp_headline?.trim() ?? '')
    setGreetingLine(guest.greeting_line?.trim() ?? '')
    setHideGreeting(Boolean(guest.hide_greeting))
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guest?.id, primaryId, extraEventIds.join('|')])

  if (!open || !guest) return null

  function toggleExtra(eventId: string) {
    if (eventId === primaryId) return
    setExtras((prev) => {
      if (prev.includes(eventId)) return prev.filter((id) => id !== eventId)
      return [...prev, eventId]
    })
  }

  async function save() {
    if (!guest) return
    setSaving(true)
    setError(null)
    try {
      // Persist extras only; primary is always implied
      const invited_to = extras.filter((id) => id !== primaryId)
      const res = await fetch(`/api/projects/${projectId}/guests`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: guest.id,
          invited_to,
          rsvp_by_event: rsvpByEvent,
          rsvp_headline: rsvpHeadline.trim() || null,
          greeting_line: hideGreeting ? null : greetingLine.trim() || null,
          hide_greeting: hideGreeting,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      onSaved({
        ...guest,
        ...data,
        id: guest.id,
        invited_to: Array.isArray(data.invited_to) ? data.invited_to : invited_to,
        rsvp_by_event:
          data.rsvp_by_event && typeof data.rsvp_by_event === 'object'
            ? data.rsvp_by_event
            : rsvpByEvent,
        rsvp_status: data.rsvp_status ?? guest.rsvp_status,
        pax_count: typeof data.pax_count === 'number' ? data.pax_count : guest.pax_count,
        rsvp_headline: data.rsvp_headline ?? (rsvpHeadline.trim() || null),
        greeting_line: data.greeting_line ?? (hideGreeting ? null : greetingLine.trim() || null),
        hide_greeting: data.hide_greeting ?? hideGreeting,
      })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const effective = effectiveInvitedTo(project, extras)
  const defaultGreeting = guest.name?.trim() ? `Dear ${guest.name.trim()}` : 'Dear Guest'

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[1px]">
      <button type="button" className="flex-1 cursor-default" aria-label="Close" onClick={onClose} />
      <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Guest</p>
          <h3 className="mt-1 text-lg font-semibold text-gray-900">{guest.name}</h3>
          {guest.phone ? <p className="text-sm text-gray-500 font-mono">{guest.phone}</p> : null}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <div>
            <p className="text-sm font-semibold text-gray-800">Invited to</p>
            <p className="mt-1 text-xs text-gray-500">
              The Event Type is always included. Mark only extra celebrations for this guest, then
              Save.
            </p>
            <div className="mt-3 space-y-2">
              {projectEvents.map((ev: ProjectEvent) => {
                const isPrimary = ev.id === primaryId
                const checked = isPrimary || extras.includes(ev.id)
                return (
                  <label
                    key={ev.id}
                    className={`flex items-start gap-3 rounded-xl border px-3 py-3 transition-colors ${
                      checked ? 'border-rose-200 bg-rose-50/60' : 'border-gray-150 bg-white'
                    } ${isPrimary ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked}
                      disabled={isPrimary}
                      onChange={() => toggleExtra(ev.id)}
                    />
                    <span>
                      <span className="block text-sm font-medium text-gray-900">
                        {eventLabel(ev)}
                        {isPrimary ? (
                          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-rose-600">
                            Required
                          </span>
                        ) : null}
                      </span>
                      {ev.date ? (
                        <span className="text-xs text-gray-500">
                          {ev.date}
                          {ev.venue ? ` · ${ev.venue}` : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600">Date not set yet</span>
                      )}
                    </span>
                  </label>
                )
              })}
            </div>
            {extraEventIds.length === 0 ? (
              <p className="mt-3 text-xs text-gray-400">
                No optional events yet. Add Wedding (or others) under Event Details → Events included.
              </p>
            ) : null}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">Personalization</p>
            <p className="mt-1 text-xs text-gray-500">
              Customize how this guest is greeted and asked to RSVP on their invite link.
            </p>
            <div className="mt-3 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="guest-rsvp-headline" className="text-xs font-medium text-gray-700">
                  RSVP headline
                </Label>
                <Input
                  id="guest-rsvp-headline"
                  value={rsvpHeadline}
                  onChange={(e) => setRsvpHeadline(e.target.value)}
                  placeholder={DEFAULT_RSVP_HEADLINE}
                  className="rounded-xl text-sm"
                />
                <p className="text-[11px] text-gray-400">
                  Leave blank for “{DEFAULT_RSVP_HEADLINE}”. Example: Will you be my maid of honor?
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="guest-greeting-line" className="text-xs font-medium text-gray-700">
                  Hero greeting
                </Label>
                <Input
                  id="guest-greeting-line"
                  value={greetingLine}
                  onChange={(e) => setGreetingLine(e.target.value)}
                  placeholder={defaultGreeting}
                  disabled={hideGreeting}
                  className="rounded-xl text-sm disabled:bg-gray-50"
                />
                <p className="text-[11px] text-gray-400">
                  Leave blank for “{defaultGreeting}”. Example: Dear Aunt Priya, Dearest Amma.
                </p>
                <label className="flex cursor-pointer items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    checked={hideGreeting}
                    onChange={(e) => setHideGreeting(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-xs text-gray-600">Hide greeting on invite</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">RSVP by event</p>
            <div className="mt-3 space-y-2">
              {projectEvents
                .filter((ev) => effective.includes(ev.id))
                .map((ev) => {
                  const status = rsvpByEvent[ev.id]?.status ?? 'pending'
                  return (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2.5"
                    >
                      <span className="text-sm text-gray-700">{eventLabel(ev)}</span>
                      <select
                        className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium"
                        value={status}
                        onChange={(e) => {
                          const next = e.target.value as 'pending' | 'yes' | 'no'
                          setRsvpByEvent((prev) => ({
                            ...prev,
                            [ev.id]: {
                              status: next,
                              pax: next === 'yes' ? prev[ev.id]?.pax || guest.pax_count || 1 : 0,
                            },
                          }))
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="yes">Going</option>
                        <option value="no">Declined</option>
                      </select>
                    </div>
                  )
                })}
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="flex gap-2 border-t border-gray-100 px-5 py-4">
          <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700"
            disabled={saving}
            onClick={save}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </aside>
    </div>
  )
}
