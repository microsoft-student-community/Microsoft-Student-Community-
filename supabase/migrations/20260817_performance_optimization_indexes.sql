-- =============================================================================
-- Comprehensive Performance & Concurrency Optimization Indexes
-- =============================================================================

-- 1. Events: Fast sorting and filtering for public list & admin dashboard
CREATE INDEX IF NOT EXISTS idx_events_date_start ON public.events(date_start DESC);
CREATE INDEX IF NOT EXISTS idx_events_status_date ON public.events(status, date_start DESC);

-- 2. Registrations: Fast event tables, sorting, and pagination
CREATE INDEX IF NOT EXISTS idx_registrations_event_created ON public.registrations(event_id, created_at DESC);

-- 3. Registrations: High-concurrency duplicate prevention lookups
CREATE INDEX IF NOT EXISTS idx_registrations_event_email ON public.registrations(event_id, lead_email);
CREATE INDEX IF NOT EXISTS idx_registrations_event_user ON public.registrations(event_id, user_id);

-- 4. Registrations: Fast capacity check & reservation expiration queries
CREATE INDEX IF NOT EXISTS idx_registrations_capacity_check 
  ON public.registrations(event_id, status, reservation_expires_at);

-- 5. Teams: High-speed matchmaking queries (looking for members)
CREATE INDEX IF NOT EXISTS idx_teams_event_matchmaking 
  ON public.teams(event_id, looking_for_members);

-- 6. Member Profiles: High-frequency auth and role verification in middleware
CREATE INDEX IF NOT EXISTS idx_member_profiles_role ON public.member_profiles(role);
CREATE INDEX IF NOT EXISTS idx_member_profiles_email ON public.member_profiles(email);

-- 7. Payments: Webhook lookup and order reconciliation
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_id ON public.payment_orders(razorpay_order_id);

-- 8. Gallery Items: Fast reverse chronological archive rendering
CREATE INDEX IF NOT EXISTS idx_gallery_items_created_at ON public.gallery_items(created_at DESC);

-- 9. Team Members: Sorted tier and created_at rendering
CREATE INDEX IF NOT EXISTS idx_team_members_tier_created ON public.team_members(tier, created_at DESC);
