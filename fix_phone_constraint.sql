-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: Replace the global phone unique constraint with a per-project one
-- This allows the same phone number to be invited across different projects
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Drop the old global unique constraint
ALTER TABLE guests DROP CONSTRAINT IF EXISTS guests_phone_unique;

-- 2. Add a new composite unique constraint: phone must be unique per project
--    (allows the same phone in different projects)
ALTER TABLE guests
  ADD CONSTRAINT guests_project_phone_unique UNIQUE (project_id, phone);
