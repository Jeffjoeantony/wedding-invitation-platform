'use client'

import {
  emptyProjectEvent,
  formatEventDateLabel,
  formatEventTime,
  primaryEventIdFromTemplate,
  PROJECT_EVENT_OPTIONS,
  resolveProjectEvents,
  type ProjectEvent,
} from '@/lib/project-events'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CalendarDays,
  Clock,
  ExternalLink,
  Flower2,
  Leaf,
  Lock,
  MapPin,
  Trash2,
  type LucideIcon,
} from 'lucide-react'

type ProjectLike = {
  events?: unknown
  date?: string
  time?: string
  venue?: string
  location?: string
  maps_url?: string
  event_template?: string | null
}

const EVENT_ICONS: Record<string, LucideIcon> = {
  engagement: CalendarDays,
  wedding: CalendarDays,
  reception: CalendarDays,
  mehendi: Leaf,
  haldi: Flower2,
}

export function EventsIncludedEditor({
  project,
  onChange,
  showSectionHeader = true,
}: {
  project: ProjectLike
  onChange: (events: ProjectEvent[]) => void
  showSectionHeader?: boolean
}) {
  const events = resolveProjectEvents(project)
  const primaryId = primaryEventIdFromTemplate(project.event_template)
  const enabledIds = new Set(events.map((e) => e.id))

  function toggle(optionId: string, enabled: boolean) {
    if (optionId === primaryId && !enabled) return

    if (enabled) {
      if (enabledIds.has(optionId)) return
      const opt = PROJECT_EVENT_OPTIONS.find((o) => o.id === optionId)
      if (!opt) return
      const seed = events.find((e) => e.id === primaryId) || events[0]
      onChange([
        ...events,
        emptyProjectEvent(opt.id, opt.type, opt.label, {
          date: seed?.date || project.date,
          time: seed?.time || project.time,
          venue: seed?.venue || project.venue,
          location: seed?.location || project.location,
          maps_url: seed?.maps_url || project.maps_url,
        }),
      ])
      return
    }

    onChange(events.filter((e) => e.id !== optionId))
  }

  function updateEvent(id: string, patch: Partial<ProjectEvent>) {
    onChange(events.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        {showSectionHeader ? (
          <div>
            <p className="text-lg font-semibold tracking-tight text-gray-900">
              <span className="mr-2 text-rose-700">1.</span>
              Events included
            </p>
            <p className="mt-1 text-xs text-gray-500">
              The Event Type (
              <strong className="text-gray-700">
                {events.find((e) => e.id === primaryId)?.label ?? 'primary'}
              </strong>
              ) is always included. Add optional celebrations guests can be invited to.
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {PROJECT_EVENT_OPTIONS.map((opt) => {
            const on = enabledIds.has(opt.id)
            const isPrimary = opt.id === primaryId
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  if (isPrimary) return
                  toggle(opt.id, !on)
                }}
                title={isPrimary ? 'Required by Event Type — cannot remove' : undefined}
                aria-pressed={on}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 ${
                  on
                    ? isPrimary
                      ? 'cursor-default bg-[#9D022C] text-white shadow-sm'
                      : 'bg-rose-600 text-white shadow-sm hover:bg-rose-700'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-rose-200 hover:bg-rose-50/40'
                }`}
              >
                {isPrimary ? <Lock className="h-3.5 w-3.5 opacity-80" aria-hidden /> : null}
                {opt.label}
                {isPrimary ? (
                  <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    Required
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        {showSectionHeader ? (
          <div>
            <p className="text-lg font-semibold tracking-tight text-gray-900">
              <span className="mr-2 text-rose-700">2.</span>
              Event details
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Date, venue, and maps for each celebration on the invite.
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {events.map((ev) => {
            const isPrimary = ev.id === primaryId
            const Icon = EVENT_ICONS[ev.id] || CalendarDays
            const mapsHref =
              ev.maps_url?.trim() ||
              [ev.venue, ev.location].filter(Boolean).join(', ') ||
              ''
            return (
              <div
                key={ev.id}
                className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_8px_28px_rgba(31,41,55,0.06)] sm:p-5"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{ev.label || ev.type}</p>
                      <span
                        className={`mt-0.5 inline-flex text-[10px] font-bold uppercase tracking-wider ${
                          isPrimary ? 'text-rose-700' : 'text-gray-400'
                        }`}
                      >
                        {isPrimary ? 'Required' : 'Optional'}
                      </span>
                    </div>
                  </div>
                  {!isPrimary ? (
                    <button
                      type="button"
                      onClick={() => toggle(ev.id, false)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 transition hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Remove
                    </button>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="flex items-center gap-1.5 text-xs text-gray-500">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                        Date
                      </Label>
                      <Input
                        type="date"
                        value={ev.date}
                        onChange={(e) => updateEvent(ev.id, { date: e.target.value })}
                        className="mt-1.5 h-10 rounded-xl border-gray-200"
                      />
                      {ev.date ? (
                        <p className="mt-1 text-[11px] text-gray-400">
                          {formatEventDateLabel(ev.date)}
                          {ev.time ? ` · ${formatEventTime(ev.time)}` : ''}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <Label className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                        Time
                      </Label>
                      <Input
                        type="time"
                        value={ev.time}
                        onChange={(e) => updateEvent(ev.id, { time: e.target.value })}
                        className="mt-1.5 h-10 rounded-xl border-gray-200"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      Venue
                    </Label>
                    <Input
                      value={ev.venue}
                      onChange={(e) => updateEvent(ev.id, { venue: e.target.value })}
                      className="mt-1.5 h-10 rounded-xl border-gray-200"
                      placeholder="Venue name"
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500">Location / City</Label>
                      <Input
                        value={ev.location}
                        onChange={(e) => updateEvent(ev.id, { location: e.target.value })}
                        className="mt-1.5 h-10 rounded-xl border-gray-200"
                        placeholder="City or locality"
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-1.5 text-xs text-gray-500">
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                        Maps link
                      </Label>
                      <Input
                        value={ev.maps_url}
                        onChange={(e) => updateEvent(ev.id, { maps_url: e.target.value })}
                        className="mt-1.5 h-10 rounded-xl border-gray-200"
                        placeholder="Google Maps URL or address"
                      />
                    </div>
                  </div>

                  {mapsHref ? (
                    <a
                      href={
                        /^https?:\/\//i.test(mapsHref)
                          ? mapsHref
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsHref)}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:underline"
                    >
                      Open in Maps
                      <ExternalLink className="h-3 w-3" aria-hidden />
                    </a>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
