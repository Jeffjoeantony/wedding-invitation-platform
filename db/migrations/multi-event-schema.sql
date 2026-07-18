-- Multi-event invitations: project events + per-guest invite scope & RSVP
-- Run this in the Supabase SQL editor once.

-- Project: list of enabled events with date/venue details
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS events jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN projects.events IS
  'Array of { id, type, label, date, time, venue, location, maps_url }. Empty = use legacy single date/venue.';

-- Guest: which optional project events they are invited to (primary is always implied)
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS invited_to jsonb DEFAULT NULL;

COMMENT ON COLUMN guests.invited_to IS
  'Array of optional extra event ids. NULL/empty = primary event only.';

-- Guest: RSVP status per event id
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS rsvp_by_event jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN guests.rsvp_by_event IS
  'Map of eventId -> { status: pending|yes|no, pax?: number }.';

-- Guest: per-invite personalization
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS rsvp_headline text DEFAULT NULL;

ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS greeting_line text DEFAULT NULL;

ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS hide_greeting boolean DEFAULT false;

COMMENT ON COLUMN guests.rsvp_headline IS
  'Custom RSVP question, e.g. Will you be my maid of honor? Empty = default join us.';

COMMENT ON COLUMN guests.greeting_line IS
  'Custom hero greeting, e.g. Dear Aunt Priya. Empty = Dear {name}.';

COMMENT ON COLUMN guests.hide_greeting IS
  'When true, hide the Dear … line on the invite.';
