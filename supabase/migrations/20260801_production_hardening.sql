-- Production hardening for registration and Razorpay payments.
-- Apply through the Supabase CLI/SQL editor before enabling paid registrations.

create extension if not exists pgcrypto;

alter table public.registrations add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.registrations add column if not exists status text not null default 'confirmed';
alter table public.registrations add column if not exists idempotency_key uuid;
alter table public.registrations add column if not exists reservation_expires_at timestamptz;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete set null,
  razorpay_order_id text,
  razorpay_payment_id text unique,
  amount integer not null,
  charge_type text,
  payer_email text,
  status text not null default 'pending',
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.payments add column if not exists registration_id uuid references public.registrations(id) on delete set null;
alter table public.payments add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.payments add column if not exists gateway_payload jsonb;

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete restrict,
  registration_id uuid not null references public.registrations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  idempotency_key uuid not null,
  razorpay_order_id text unique,
  amount integer not null check (amount > 0 and amount <= 10000000),
  currency text not null default 'INR' check (currency = 'INR'),
  status text not null default 'creating' check (status in ('creating', 'created', 'paid', 'failed', 'cancelled')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, event_id, idempotency_key)
);

create unique index if not exists registrations_event_user_unique on public.registrations(event_id, user_id) where user_id is not null;
create unique index if not exists registrations_event_idempotency_unique on public.registrations(event_id, user_id, idempotency_key) where user_id is not null and idempotency_key is not null;
create unique index if not exists payments_razorpay_payment_id_unique on public.payments(razorpay_payment_id) where razorpay_payment_id is not null;
create unique index if not exists payments_razorpay_order_id_unique on public.payments(razorpay_order_id) where razorpay_order_id is not null;
create index if not exists registrations_event_status_created_idx on public.registrations(event_id, status, created_at desc);
create index if not exists registrations_hash_payload_idx on public.registrations(hash_payload);
create index if not exists payment_orders_order_id_idx on public.payment_orders(razorpay_order_id);
create index if not exists payment_orders_expiry_idx on public.payment_orders(status, expires_at);

alter table public.registrations drop constraint if exists registrations_status_valid;
alter table public.registrations add constraint registrations_status_valid check (status in ('pending_payment', 'confirmed', 'waitlisted', 'cancelled')) not valid;
alter table public.registrations validate constraint registrations_status_valid;

alter table public.payment_orders enable row level security;
revoke all on public.payment_orders from anon, authenticated;
alter table public.payments enable row level security;
revoke all on public.payments from anon, authenticated;

-- Serializes capacity checks with the event row lock, preventing overselling under load.
create or replace function public.register_for_event(
  p_event_id uuid,
  p_idempotency_key uuid,
  p_form_data jsonb,
  p_team_data jsonb,
  p_hash_payload uuid
) returns table (registration_id uuid, registration_status text, payment_required boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events%rowtype;
  v_existing public.registrations%rowtype;
  v_registered_count integer;
  v_pricing text;
  v_status text;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  select * into v_event from public.events where id = p_event_id for update;
  if not found or not coalesce(v_event.registration_open, false) or v_event.status = 'completed' then
    raise exception 'registration is closed or this event is not available';
  end if;

  select * into v_existing from public.registrations where event_id = p_event_id and user_id = auth.uid() limit 1;
  if found then
    if v_existing.idempotency_key = p_idempotency_key then
      return query select v_existing.id, v_existing.status, (v_existing.status = 'pending_payment');
      return;
    end if;
    raise exception 'already registered for this event';
  end if;

  select count(*) into v_registered_count from public.registrations
    where event_id = p_event_id and status in ('confirmed', 'pending_payment')
      and (status <> 'pending_payment' or reservation_expires_at > now());
  if v_event.max_capacity is not null and v_registered_count >= v_event.max_capacity then
    v_status := 'waitlisted';
  else
    v_pricing := coalesce(v_event.form_requirements->>'event_pricing', 'free');
    v_status := case when v_pricing = 'paid' then 'pending_payment' else 'confirmed' end;
  end if;

  insert into public.registrations (event_id, user_id, lead_email, form_data, team_data, hash_payload, status, idempotency_key, reservation_expires_at)
  values (
    p_event_id, auth.uid(), coalesce(auth.jwt()->>'email', ''), p_form_data, p_team_data, p_hash_payload, v_status, p_idempotency_key,
    case when v_status = 'pending_payment' then now() + interval '15 minutes' else null end
  ) returning id into registration_id;
  registration_status := v_status;
  payment_required := v_status = 'pending_payment';
  return next;
end;
$$;

revoke all on function public.register_for_event(uuid, uuid, jsonb, jsonb, uuid) from public;
grant execute on function public.register_for_event(uuid, uuid, jsonb, jsonb, uuid) to authenticated;

-- Idempotent confirmation used by both the verified client callback and Razorpay webhook.
create or replace function public.confirm_captured_payment(
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_amount integer
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.payment_orders%rowtype;
begin
  select * into v_order from public.payment_orders where razorpay_order_id = p_razorpay_order_id for update;
  if not found then raise exception 'payment order not found'; end if;
  if v_order.amount <> p_amount or v_order.currency <> 'INR' then raise exception 'payment amount mismatch'; end if;
  if v_order.status = 'paid' then return; end if;
  if v_order.status not in ('created', 'creating') then raise exception 'payment order is not payable'; end if;

  insert into public.payments (event_id, registration_id, user_id, razorpay_order_id, razorpay_payment_id, amount, charge_type, payer_email, status, verified_at)
  select v_order.event_id, v_order.registration_id, v_order.user_id, p_razorpay_order_id, p_razorpay_payment_id, v_order.amount, 'registration', u.email, 'paid', now()
  from auth.users u where u.id = v_order.user_id
  on conflict (razorpay_payment_id) do nothing;

  update public.payment_orders set status = 'paid', updated_at = now() where id = v_order.id;
  update public.registrations set status = 'confirmed', reservation_expires_at = null
    where id = v_order.registration_id and status = 'pending_payment';
end;
$$;

revoke all on function public.confirm_captured_payment(text, text, integer) from public;
-- Only server routes using the service-role client invoke this function.
grant execute on function public.confirm_captured_payment(text, text, integer) to service_role;

create or replace function public.expire_payment_reservations() returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_count integer;
begin
  update public.registrations set status = 'cancelled'
    where status = 'pending_payment' and reservation_expires_at <= now();
  get diagnostics v_count = row_count;
  update public.payment_orders set status = 'cancelled', updated_at = now()
    where status in ('creating', 'created') and expires_at <= now();
  return v_count;
end;
$$;

revoke all on function public.expire_payment_reservations() from public;
