-- 1. Create B-Tree index on slug for fast event lookups
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);

-- 2. Create B-Tree index on hash_payload for fast offline-sync / QR scans
CREATE INDEX IF NOT EXISTS idx_registrations_hash_payload ON public.registrations(hash_payload);
