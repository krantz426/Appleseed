-- Appleseed V1 Schema
-- Group Gift MVP for Teacher Appreciation

create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

create table schools (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  city text,
  state text,
  created_at timestamptz not null default now()
);

create table teachers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  school_id uuid references schools(id),
  email text,
  preferred_stores text[] default '{}',
  created_at timestamptz not null default now()
);

create table parents (
  id uuid primary key default uuid_generate_v4(),
  auth_id uuid unique references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create table pools (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  room_parent_id uuid not null references parents(id),
  teacher_id uuid not null references teachers(id),
  classroom_name text not null,
  grade text,
  school_id uuid references schools(id),
  target_amount_cents integer not null,
  suggested_amount_cents integer not null default 1500,
  deadline timestamptz not null,
  occasion text not null,
  status text not null default 'active'
    check (status in ('active','extended','closed','delivered','refunded')),
  extended_at timestamptz,
  message text,
  teacher_email text,
  teacher_preferred_store text default 'amazon',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_pools_slug on pools(slug);
create index idx_pools_status on pools(status);
create index idx_pools_deadline on pools(deadline);

create table contributions (
  id uuid primary key default uuid_generate_v4(),
  pool_id uuid not null references pools(id),
  parent_email text not null,
  parent_name text,
  child_name text,
  amount_cents integer not null,
  fee_cents integer not null,
  total_cents integer not null,
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  status text not null default 'pending'
    check (status in ('pending','completed','failed','refunded')),
  message text,
  created_at timestamptz not null default now()
);

create index idx_contributions_pool on contributions(pool_id);
create index idx_contributions_status on contributions(status);
create index idx_contributions_stripe on contributions(stripe_checkout_session_id);

create table deliveries (
  id uuid primary key default uuid_generate_v4(),
  pool_id uuid not null references pools(id),
  scheduled_date timestamptz not null default now(),
  status text not null default 'pending'
    check (status in ('pending','processing','sent','claimed','failed')),
  gift_card_provider text default 'tremendous',
  gift_card_order_id text,
  gift_card_code text,
  gift_card_amount_cents integer,
  gift_card_brand text default 'amazon',
  card_image_url text,
  teacher_claim_token text unique default encode(gen_random_bytes(32), 'hex'),
  claimed_at timestamptz,
  reminder_sent_at timestamptz,
  retry_count integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_deliveries_pool on deliveries(pool_id);
create index idx_deliveries_status on deliveries(status);
create index idx_deliveries_claim_token on deliveries(teacher_claim_token);

create table waitlist (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  source text default 'landing',
  created_at timestamptz not null default now()
);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

create or replace function pool_collected_cents(pool_row pools)
returns integer as $$
  select coalesce(sum(amount_cents), 0)::integer
  from contributions
  where pool_id = pool_row.id and status = 'completed';
$$ language sql stable;

create or replace function pool_contributor_count(pool_row pools)
returns integer as $$
  select count(*)::integer
  from contributions
  where pool_id = pool_row.id and status = 'completed';
$$ language sql stable;

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger pools_updated_at before update on pools
  for each row execute function update_updated_at();
create trigger deliveries_updated_at before update on deliveries
  for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table schools enable row level security;
alter table teachers enable row level security;
alter table parents enable row level security;
alter table pools enable row level security;
alter table contributions enable row level security;
alter table deliveries enable row level security;
alter table waitlist enable row level security;

-- Schools: public read
create policy "schools_read" on schools for select using (true);

-- Teachers: public read, authenticated can insert
create policy "teachers_read" on teachers for select using (true);
create policy "teachers_insert" on teachers for insert with check (auth.uid() is not null);

-- Parents: own record only
create policy "parents_read_own" on parents for select using (auth_id = auth.uid());
create policy "parents_insert_own" on parents for insert with check (auth_id = auth.uid());
create policy "parents_update_own" on parents for update using (auth_id = auth.uid());

-- Pools: public read, room parent can write
create policy "pools_read" on pools for select using (true);
create policy "pools_insert" on pools for insert
  with check (room_parent_id in (select id from parents where auth_id = auth.uid()));
create policy "pools_update" on pools for update
  using (room_parent_id in (select id from parents where auth_id = auth.uid()));

-- Contributions: anyone can insert (no auth for contributors), limited read
create policy "contributions_insert" on contributions for insert with check (true);
create policy "contributions_read_pool_owner" on contributions for select
  using (pool_id in (select id from pools where room_parent_id in (select id from parents where auth_id = auth.uid())));

-- Deliveries: room parent can read
create policy "deliveries_read" on deliveries for select
  using (pool_id in (select id from pools where room_parent_id in (select id from parents where auth_id = auth.uid())));

-- Waitlist: anyone can insert
create policy "waitlist_insert" on waitlist for insert with check (true);
