-- Admin-controlled "Registrations Opening Soon" teaser page on the event portal.
-- When true and registration_open is false, users see an
-- "Opening Soon, please be patient" page instead of the registration form.

alter table public.events
  add column if not exists show_opening_soon boolean not null default false;