'use client'

import {
  emptyProjectEvent,
  primaryEventIdFromTemplate,
  PROJECT_EVENT_OPTIONS,
  resolveProjectEvents,
  type ProjectEvent,
} from '@/lib/project-events'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ProjectLike = {
  events?: unknown
  date?: string
  time?: string
  venue?: string
  location?: string
  maps_url?: string
  event_template?: string | null
}

export function EventsIncludedEditor({
  project,
  onChange,
}: {
  project: ProjectLike
  onChange: (events: ProjectEvent[]) => void
}) {
  const events = resolveProjectEvents(project)
  const primaryId = primaryEventIdFromTemplate(project.event_template)
  const enabledIds = new Set(events.map((e) => e.id))

  function toggle(optionId: string, enabled: boolean) {
    // Primary Event Type cannot be turned off
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
    <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
      <div>
        <Label className="text-sm font-semibold text-gray-800">Events included</Label>
        <p className="mt-1 text-xs text-gray-500">
          The Event Type (<strong className="text-gray-700">{events.find((e) => e.id === primaryId)?.label ?? 'primary'}</strong>) is
          always included and shown for every guest. Add extra celebrations here — those are optional
          per guest.
        </p>
      </div>

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
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                on
                  ? isPrimary
                    ? 'bg-rose-700 text-white shadow-sm cursor-default'
                    : 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {on ? '✓ ' : ''}
              {opt.label}
              {isPrimary ? ' · required' : ''}
            </button>
          )
        })}
      </div>

      <div className="space-y-4">
        {events.map((ev) => {
          const isPrimary = ev.id === primaryId
          return (
            <div key={ev.id} className="rounded-xl border border-white bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  {ev.label || ev.type}
                  {isPrimary ? (
                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-rose-600">
                      Required
                    </span>
                  ) : (
                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Optional extra
                    </span>
                  )}
                </p>
                {!isPrimary ? (
                  <button
                    type="button"
                    onClick={() => toggle(ev.id, false)}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-gray-500">Date</Label>
                  <Input
                    type="date"
                    value={ev.date}
                    onChange={(e) => updateEvent(ev.id, { date: e.target.value })}
                    className="mt-1.5 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Time</Label>
                  <Input
                    type="time"
                    value={ev.time}
                    onChange={(e) => updateEvent(ev.id, { time: e.target.value })}
                    className="mt-1.5 rounded-xl"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs text-gray-500">Venue</Label>
                  <Input
                    value={ev.venue}
                    onChange={(e) => updateEvent(ev.id, { venue: e.target.value })}
                    className="mt-1.5 rounded-xl"
                    placeholder="Venue name"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Location / City</Label>
                  <Input
                    value={ev.location}
                    onChange={(e) => updateEvent(ev.id, { location: e.target.value })}
                    className="mt-1.5 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Maps link or address</Label>
                  <Input
                    value={ev.maps_url}
                    onChange={(e) => updateEvent(ev.id, { maps_url: e.target.value })}
                    className="mt-1.5 rounded-xl"
                    placeholder="Google Maps URL or address"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
