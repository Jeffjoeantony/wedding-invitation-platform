'use client'

import { EventManager, type Event } from '@/components/ui/event-manager'

const WEDDING_CATEGORIES = [
  'Ceremony',
  'Reception',
  'Mehendi',
  'Meeting',
  'Reminder',
  'Personal',
]

const WEDDING_TAGS = [
  'Important',
  'Urgent',
  'Client',
  'Venue',
  'Team',
  'Personal',
]

/** Sample calendar events for the admin Events workspace (Sep 2026). */
const DEMO_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Venue walkthrough — Arjun & Priya',
    description: 'Confirm stage layout, seating, and power for the reception hall.',
    startTime: new Date(2026, 8, 12, 10, 0),
    endTime: new Date(2026, 8, 12, 11, 30),
    color: 'blue',
    category: 'Meeting',
    tags: ['Client', 'Venue'],
  },
  {
    id: '2',
    title: 'Mehendi schedule finalization',
    description: 'Lock artist timing and guest seating for the outdoor mehendi.',
    startTime: new Date(2026, 8, 14, 15, 0),
    endTime: new Date(2026, 8, 14, 16, 0),
    color: 'green',
    category: 'Mehendi',
    tags: ['Client', 'Team'],
  },
  {
    id: '3',
    title: 'Invitation design review',
    description: 'Review digital invite copy, RSVP flow, and hero imagery.',
    startTime: new Date(2026, 8, 15, 11, 0),
    endTime: new Date(2026, 8, 15, 12, 0),
    color: 'purple',
    category: 'Meeting',
    tags: ['Important', 'Team'],
  },
  {
    id: '4',
    title: 'Ceremony rehearsal call',
    description: 'Walk through processional order with the couple and planners.',
    startTime: new Date(2026, 8, 18, 17, 0),
    endTime: new Date(2026, 8, 18, 18, 0),
    color: 'orange',
    category: 'Ceremony',
    tags: ['Important', 'Client'],
  },
  {
    id: '5',
    title: 'Catering tasting — reception',
    description: 'Finalize menu and service style with the catering partner.',
    startTime: new Date(2026, 8, 19, 13, 0),
    endTime: new Date(2026, 8, 19, 14, 30),
    color: 'pink',
    category: 'Reception',
    tags: ['Venue', 'Client'],
  },
  {
    id: '6',
    title: 'RSVP reminder blast',
    description: 'Send reminder WhatsApp/email to pending guests.',
    startTime: new Date(2026, 8, 20, 9, 0),
    endTime: new Date(2026, 8, 20, 9, 30),
    color: 'red',
    category: 'Reminder',
    tags: ['Urgent', 'Team'],
  },
  {
    id: '7',
    title: 'Engagement shoot coordination',
    description: 'Confirm photographer slot and location for Rita & Alan.',
    startTime: new Date(2026, 8, 22, 16, 0),
    endTime: new Date(2026, 8, 22, 17, 0),
    color: 'blue',
    category: 'Meeting',
    tags: ['Client', 'Personal'],
  },
  {
    id: '8',
    title: 'Reception DJ soundcheck',
    description: 'On-site AV check and playlist handoff.',
    startTime: new Date(2026, 8, 25, 18, 0),
    endTime: new Date(2026, 8, 25, 19, 0),
    color: 'green',
    category: 'Reception',
    tags: ['Venue', 'Team'],
  },
]

export function EventsSection() {
  return (
    <div>
      <div className="mb-5">
        <p className="text-[12px] font-medium text-[#94A3B8]">Manage › Events</p>
        <h1 className="mt-1 text-[26px] font-bold tracking-tight text-[#17233F]">Events</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#64748B]">
          Plan ceremonies, receptions, and client meetings across your invitation projects.
        </p>
      </div>

      <EventManager
        events={DEMO_EVENTS}
        categories={WEDDING_CATEGORIES}
        availableTags={WEDDING_TAGS}
        defaultView="month"
        className="text-[#17233F]"
        onEventCreate={(event) => console.log('Created event:', event)}
        onEventUpdate={(id, event) => console.log('Updated event:', id, event)}
        onEventDelete={(id) => console.log('Deleted event:', id)}
      />
    </div>
  )
}
