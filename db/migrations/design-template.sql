-- Visual invitation design, separate from event_template (event type).
-- Run in the Supabase SQL editor.

alter table projects
  add column if not exists design_template text not null default 'eternal-vows';

comment on column projects.design_template is
  'Visual invite skin id (eternal-vows, blush-garden, midnight-formal, royal-maroon). Distinct from event_template.';
