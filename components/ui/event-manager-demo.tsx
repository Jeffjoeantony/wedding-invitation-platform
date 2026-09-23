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

/** Wedding-invitation themed demo events around September 2026 (month index 8). */
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
  {
    id: '9',
    title: 'Sangeet choreography review',
    description: 'Final run-through of family dance numbers before the sangeet night.',
    startTime: new Date(2026, 8, 24, 19, 0),
    endTime: new Date(2026, 8, 24, 20, 30),
    color: 'purple',
    category: 'Reception',
    tags: ['Important', 'Team'],
  },
  {
    id: '10',
    title: 'Florist delivery — ceremony arch',
    description: 'Confirm centerpiece palette and arch installation timing.',
    startTime: new Date(2026, 8, 28, 8, 0),
    endTime: new Date(2026, 8, 28, 9, 0),
    color: 'pink',
    category: 'Ceremony',
    tags: ['Venue', 'Urgent'],
  },
]

export default function EventManagerDemo() {
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <EventManager
        events={DEMO_EVENTS}
        categories={WEDDING_CATEGORIES}
        availableTags={WEDDING_TAGS}
        defaultView="month"
        onEventCreate={(event) => console.log('Created:', event)}
        onEventUpdate={(id, event) => console.log('Updated:', id, event)}
        onEventDelete={(id) => console.log('Deleted:', id)}
      />
    </div>
  )
}
