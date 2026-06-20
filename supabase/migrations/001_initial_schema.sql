-- LocalKart Supabase/PostgreSQL foundation
-- MVP model: discovery + WhatsApp leads. No payment or checkout workflow tables.

create extension if not exists "pgcrypto";
create extension if not exists "postgis";

do $$
begin
  create type public.app_role as enum ('customer', 'owner', 'admin');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.business_type as enum ('salon', 'kirana');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.business_status as enum ('draft', 'pending', 'approved', 'rejected', 'blocked');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.lead_status as enum ('new', 'sent_to_whatsapp', 'confirmed', 'cancelled', 'closed');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.support_ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.report_status as enum ('pending', 'reviewing', 'resolved', 'dismissed');
exception when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'customer',
  full_name text,
  phone text unique,
  whatsapp_number text,
  avatar_url text,
  area text,
  city text,
  state text default 'Karnataka',
  is_blocked boolean not null default false,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  recipient_name text,
  phone text,
  address_line1 text not null,
  address_line2 text,
  landmark text,
  area text not null,
  city text not null,
  state text not null default 'Karnataka',
  pincode text not null,
  lat double precision,
  lng double precision,
  geog geography(Point, 4326) generated always as (
    case
      when lat is null or lng is null then null
      else st_setsrid(st_makepoint(lng, lat), 4326)::geography
    end
  ) stored,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  type public.business_type not null,
  name text not null,
  slug text not null unique,
  description text,
  phone text,
  whatsapp_number text not null,
  address text not null,
  area text not null,
  city text not null,
  state text not null default 'Karnataka',
  pincode text not null,
  lat double precision not null,
  lng double precision not null,
  geog geography(Point, 4326) generated always as (
    st_setsrid(st_makepoint(lng, lat), 4326)::geography
  ) stored,
  opening_time time,
  closing_time time,
  home_delivery_available boolean not null default false,
  delivery_radius_km numeric(6,2),
  min_order_amount numeric(10,2),
  delivery_fee_note text,
  status public.business_status not null default 'draft',
  rejection_reason text,
  blocked_reason text,
  whatsapp_verified boolean not null default false,
  admin_notes text,
  is_featured boolean not null default false,
  rating_avg numeric(3,2) not null default 0 check (rating_avg between 0 and 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  cover_image_url text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint businesses_delivery_radius_check check (
    delivery_radius_km is null or delivery_radius_km >= 0
  ),
  constraint businesses_min_order_amount_check check (
    min_order_amount is null or min_order_amount >= 0
  )
);

create table if not exists public.business_photos (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  photo_url text not null,
  storage_path text,
  alt_text text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, day_of_week)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon_name text,
  business_type public.business_type not null default 'salon',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.salon_services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists product_categories_global_slug_idx
  on public.product_categories (slug)
  where business_id is null;

create unique index if not exists product_categories_business_slug_idx
  on public.product_categories (business_id, slug)
  where business_id is not null;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid references public.product_categories(id) on delete set null,
  name text not null,
  description text,
  unit text,
  price numeric(10,2) check (price is null or price >= 0),
  mrp numeric(10,2) check (mrp is null or mrp >= 0),
  image_url text,
  storage_path text,
  in_stock boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text,
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_approved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, business_id)
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text not null,
  link_url text,
  placement text not null default 'home',
  business_type public.business_type,
  city text,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ad_slots (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  page text,
  placement text not null,
  platform text not null default 'web',
  provider text not null default 'internal',
  test_mode boolean not null default true,
  frequency integer not null default 1,
  notes text,
  business_type public.business_type,
  width integer,
  height integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ad_units (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.ad_slots(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  title text,
  body text,
  image_url text,
  link_url text,
  google_ad_unit_id text,
  platform text not null default 'web',
  provider text not null default 'internal',
  test_mode boolean not null default true,
  frequency integer not null default 1,
  notes text,
  starts_at timestamptz,
  ends_at timestamptz,
  priority integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  meta_title text,
  meta_description text,
  content text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_pages (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique,
  title text not null,
  meta_description text not null,
  keywords text,
  canonical_url text,
  og_title text,
  og_description text,
  robots_index boolean not null default true,
  structured_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'general',
  business_type public.business_type,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text,
  phone text,
  email text,
  subject text not null,
  message text not null,
  status public.support_ticket_status not null default 'open',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_type text not null,
  target_id uuid,
  reason text not null,
  details text,
  status public.report_status not null default 'pending',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_config (
  key text primary key,
  value jsonb not null,
  description text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text,
  target_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.whatsapp_booking_leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  service_id uuid references public.salon_services(id) on delete set null,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  preferred_date date not null,
  preferred_time time not null,
  note text,
  whatsapp_message text not null,
  status public.lead_status not null default 'sent_to_whatsapp',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_order_leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  delivery_address text not null,
  grocery_list text not null,
  selected_products jsonb not null default '[]'::jsonb,
  note text,
  whatsapp_message text not null,
  status public.lead_status not null default 'sent_to_whatsapp',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.owns_business(business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.businesses
    where id = business_id
      and owner_id = auth.uid()
  );
$$;

create or replace function public.business_is_approved(business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.businesses
    where id = business_id
      and status = 'approved'
  );
$$;

create or replace function public.prevent_business_status_self_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' and new.status not in ('draft', 'pending') then
    raise exception 'Business status can only be set by an admin';
  end if;

  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    raise exception 'Business status can only be changed by an admin';
  end if;

  return new;
end;
$$;

create or replace function public.nearby_businesses(
  lat double precision,
  lng double precision,
  radius_km double precision default 5,
  business_type public.business_type default null
)
returns table (
  id uuid,
  owner_id uuid,
  type public.business_type,
  name text,
  slug text,
  description text,
  phone text,
  whatsapp_number text,
  address text,
  area text,
  city text,
  state text,
  pincode text,
  lat double precision,
  lng double precision,
  opening_time time,
  closing_time time,
  home_delivery_available boolean,
  delivery_radius_km numeric,
  min_order_amount numeric,
  delivery_fee_note text,
  is_featured boolean,
  rating_avg numeric,
  rating_count integer,
  cover_image_url text,
  logo_url text,
  distance_meters double precision
)
language sql
stable
security definer
set search_path = public
as $$
  select
    b.id,
    b.owner_id,
    b.type,
    b.name,
    b.slug,
    b.description,
    b.phone,
    b.whatsapp_number,
    b.address,
    b.area,
    b.city,
    b.state,
    b.pincode,
    b.lat,
    b.lng,
    b.opening_time,
    b.closing_time,
    b.home_delivery_available,
    b.delivery_radius_km,
    b.min_order_amount,
    b.delivery_fee_note,
    b.is_featured,
    b.rating_avg,
    b.rating_count,
    b.cover_image_url,
    b.logo_url,
    st_distance(b.geog, st_setsrid(st_makepoint($2, $1), 4326)::geography) as distance_meters
  from public.businesses b
  where b.status = 'approved'
    and ($4 is null or b.type = $4)
    and st_dwithin(
      b.geog,
      st_setsrid(st_makepoint($2, $1), 4326)::geography,
      greatest($3, 0) * 1000
    )
  order by b.is_featured desc, distance_meters asc, b.rating_avg desc;
$$;

grant execute on function public.nearby_businesses(double precision, double precision, double precision, public.business_type) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.owns_business(uuid) to authenticated;

create index if not exists addresses_profile_id_idx on public.addresses (profile_id);
create index if not exists addresses_geog_idx on public.addresses using gist (geog);
create index if not exists businesses_owner_id_idx on public.businesses (owner_id);
create index if not exists businesses_type_status_idx on public.businesses (type, status);
create index if not exists businesses_city_area_idx on public.businesses (city, area);
create index if not exists businesses_geog_idx on public.businesses using gist (geog);
create index if not exists businesses_status_idx on public.businesses (status);
create index if not exists business_photos_business_id_idx on public.business_photos (business_id);
create index if not exists business_hours_business_id_idx on public.business_hours (business_id);
create index if not exists salon_services_business_id_idx on public.salon_services (business_id);
create index if not exists products_business_id_idx on public.products (business_id);
create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists reviews_business_id_idx on public.reviews (business_id);
create index if not exists favorites_profile_id_idx on public.favorites (profile_id);
create index if not exists banners_active_idx on public.banners (placement, is_active);
create index if not exists ad_units_active_idx on public.ad_units (slot_id, is_active);
create index if not exists whatsapp_booking_leads_business_id_idx on public.whatsapp_booking_leads (business_id);
create index if not exists whatsapp_order_leads_business_id_idx on public.whatsapp_order_leads (business_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_addresses_updated_at on public.addresses;
create trigger set_addresses_updated_at before update on public.addresses
for each row execute function public.set_updated_at();

drop trigger if exists set_businesses_updated_at on public.businesses;
create trigger set_businesses_updated_at before update on public.businesses
for each row execute function public.set_updated_at();

drop trigger if exists prevent_business_status_self_moderation on public.businesses;
create trigger prevent_business_status_self_moderation before insert or update on public.businesses
for each row execute function public.prevent_business_status_self_moderation();

drop trigger if exists set_business_photos_updated_at on public.business_photos;
create trigger set_business_photos_updated_at before update on public.business_photos
for each row execute function public.set_updated_at();

drop trigger if exists set_business_hours_updated_at on public.business_hours;
create trigger set_business_hours_updated_at before update on public.business_hours
for each row execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists set_salon_services_updated_at on public.salon_services;
create trigger set_salon_services_updated_at before update on public.salon_services
for each row execute function public.set_updated_at();

drop trigger if exists set_product_categories_updated_at on public.product_categories;
create trigger set_product_categories_updated_at before update on public.product_categories
for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_reviews_updated_at on public.reviews;
create trigger set_reviews_updated_at before update on public.reviews
for each row execute function public.set_updated_at();

drop trigger if exists set_banners_updated_at on public.banners;
create trigger set_banners_updated_at before update on public.banners
for each row execute function public.set_updated_at();

drop trigger if exists set_ad_slots_updated_at on public.ad_slots;
create trigger set_ad_slots_updated_at before update on public.ad_slots
for each row execute function public.set_updated_at();

drop trigger if exists set_ad_units_updated_at on public.ad_units;
create trigger set_ad_units_updated_at before update on public.ad_units
for each row execute function public.set_updated_at();

drop trigger if exists set_pages_updated_at on public.pages;
create trigger set_pages_updated_at before update on public.pages
for each row execute function public.set_updated_at();

drop trigger if exists set_seo_pages_updated_at on public.seo_pages;
create trigger set_seo_pages_updated_at before update on public.seo_pages
for each row execute function public.set_updated_at();

drop trigger if exists set_faqs_updated_at on public.faqs;
create trigger set_faqs_updated_at before update on public.faqs
for each row execute function public.set_updated_at();

drop trigger if exists set_support_tickets_updated_at on public.support_tickets;
create trigger set_support_tickets_updated_at before update on public.support_tickets
for each row execute function public.set_updated_at();

drop trigger if exists set_reports_updated_at on public.reports;
create trigger set_reports_updated_at before update on public.reports
for each row execute function public.set_updated_at();

drop trigger if exists set_app_config_updated_at on public.app_config;
create trigger set_app_config_updated_at before update on public.app_config
for each row execute function public.set_updated_at();

drop trigger if exists set_whatsapp_booking_leads_updated_at on public.whatsapp_booking_leads;
create trigger set_whatsapp_booking_leads_updated_at before update on public.whatsapp_booking_leads
for each row execute function public.set_updated_at();

drop trigger if exists set_whatsapp_order_leads_updated_at on public.whatsapp_order_leads;
create trigger set_whatsapp_order_leads_updated_at before update on public.whatsapp_order_leads
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.businesses enable row level security;
alter table public.business_photos enable row level security;
alter table public.business_hours enable row level security;
alter table public.categories enable row level security;
alter table public.salon_services enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.banners enable row level security;
alter table public.ad_slots enable row level security;
alter table public.ad_units enable row level security;
alter table public.pages enable row level security;
alter table public.seo_pages enable row level security;
alter table public.faqs enable row level security;
alter table public.support_tickets enable row level security;
alter table public.reports enable row level security;
alter table public.app_config enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.whatsapp_booking_leads enable row level security;
alter table public.whatsapp_order_leads enable row level security;

create policy "profiles_select_self_or_admin" on public.profiles
for select using (id = auth.uid() or public.is_admin());
create policy "profiles_insert_self" on public.profiles
for insert with check (id = auth.uid());
create policy "profiles_update_self_or_admin" on public.profiles
for update using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "addresses_manage_self_or_admin" on public.addresses
for all using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

create policy "businesses_public_read_approved" on public.businesses
for select using (status = 'approved');
create policy "businesses_owner_read_own" on public.businesses
for select using (owner_id = auth.uid());
create policy "businesses_admin_manage" on public.businesses
for all using (public.is_admin()) with check (public.is_admin());
create policy "businesses_owner_insert" on public.businesses
for insert with check (owner_id = auth.uid());
create policy "businesses_owner_update_own" on public.businesses
for update using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "business_photos_public_read" on public.business_photos
for select using (is_active and public.business_is_approved(business_id));
create policy "business_photos_owner_manage" on public.business_photos
for all using (public.owns_business(business_id) or public.is_admin())
with check (public.owns_business(business_id) or public.is_admin());

create policy "business_hours_public_read" on public.business_hours
for select using (public.business_is_approved(business_id));
create policy "business_hours_owner_manage" on public.business_hours
for all using (public.owns_business(business_id) or public.is_admin())
with check (public.owns_business(business_id) or public.is_admin());

create policy "categories_public_read_active" on public.categories
for select using (is_active);
create policy "categories_admin_manage" on public.categories
for all using (public.is_admin()) with check (public.is_admin());

create policy "salon_services_public_read_active" on public.salon_services
for select using (is_active and public.business_is_approved(business_id));
create policy "salon_services_owner_manage" on public.salon_services
for all using (public.owns_business(business_id) or public.is_admin())
with check (public.owns_business(business_id) or public.is_admin());

create policy "product_categories_public_read_active" on public.product_categories
for select using (
  is_active and (business_id is null or public.business_is_approved(business_id))
);
create policy "product_categories_owner_manage" on public.product_categories
for all using (
  public.is_admin() or (business_id is not null and public.owns_business(business_id))
) with check (
  public.is_admin() or (business_id is not null and public.owns_business(business_id))
);

create policy "products_public_read_active" on public.products
for select using (is_active and public.business_is_approved(business_id));
create policy "products_owner_manage" on public.products
for all using (public.owns_business(business_id) or public.is_admin())
with check (public.owns_business(business_id) or public.is_admin());

create policy "reviews_public_read_approved" on public.reviews
for select using (is_approved and public.business_is_approved(business_id));
create policy "reviews_customer_insert" on public.reviews
for insert with check (customer_id = auth.uid() or customer_id is null);
create policy "reviews_customer_update_own" on public.reviews
for update using (customer_id = auth.uid() or public.is_admin())
with check (customer_id = auth.uid() or public.is_admin());
create policy "reviews_admin_delete" on public.reviews
for delete using (public.is_admin());

create policy "favorites_manage_self" on public.favorites
for all using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

create policy "banners_public_read_active" on public.banners
for select using (
  is_active
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);
create policy "banners_admin_manage" on public.banners
for all using (public.is_admin()) with check (public.is_admin());

create policy "ad_slots_public_read_active" on public.ad_slots
for select using (is_active);
create policy "ad_slots_admin_manage" on public.ad_slots
for all using (public.is_admin()) with check (public.is_admin());

create policy "ad_units_public_read_active" on public.ad_units
for select using (
  is_active
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);
create policy "ad_units_admin_manage" on public.ad_units
for all using (public.is_admin()) with check (public.is_admin());

create policy "pages_public_read_published" on public.pages
for select using (is_published);
create policy "pages_admin_manage" on public.pages
for all using (public.is_admin()) with check (public.is_admin());

create policy "seo_pages_public_read_indexed" on public.seo_pages
for select using (robots_index);
create policy "seo_pages_admin_manage" on public.seo_pages
for all using (public.is_admin()) with check (public.is_admin());

create policy "faqs_public_read_active" on public.faqs
for select using (is_active);
create policy "faqs_admin_manage" on public.faqs
for all using (public.is_admin()) with check (public.is_admin());

create policy "support_tickets_insert_public" on public.support_tickets
for insert with check (profile_id is null or profile_id = auth.uid());
create policy "support_tickets_select_owner_or_admin" on public.support_tickets
for select using (profile_id = auth.uid() or public.is_admin());
create policy "support_tickets_update_owner_or_admin" on public.support_tickets
for update using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

create policy "reports_insert_public" on public.reports
for insert with check (reporter_id is null or reporter_id = auth.uid());
create policy "reports_admin_manage" on public.reports
for all using (public.is_admin()) with check (public.is_admin());

create policy "app_config_public_read" on public.app_config
for select using (is_public);
create policy "app_config_admin_manage" on public.app_config
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin_audit_logs_admin_manage" on public.admin_audit_logs
for all using (public.is_admin()) with check (public.is_admin());

create policy "whatsapp_booking_leads_insert_public" on public.whatsapp_booking_leads
for insert with check (
  public.business_is_approved(business_id)
  and (customer_id is null or customer_id = auth.uid())
);
create policy "whatsapp_booking_leads_select_owner_customer_admin" on public.whatsapp_booking_leads
for select using (
  public.is_admin() or public.owns_business(business_id) or customer_id = auth.uid()
);
create policy "whatsapp_booking_leads_update_owner_admin" on public.whatsapp_booking_leads
for update using (public.is_admin() or public.owns_business(business_id))
with check (public.is_admin() or public.owns_business(business_id));

create policy "whatsapp_order_leads_insert_public" on public.whatsapp_order_leads
for insert with check (
  public.business_is_approved(business_id)
  and (customer_id is null or customer_id = auth.uid())
);
create policy "whatsapp_order_leads_select_owner_customer_admin" on public.whatsapp_order_leads
for select using (
  public.is_admin() or public.owns_business(business_id) or customer_id = auth.uid()
);
create policy "whatsapp_order_leads_update_owner_admin" on public.whatsapp_order_leads
for update using (public.is_admin() or public.owns_business(business_id))
with check (public.is_admin() or public.owns_business(business_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('business-photos', 'business-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('banners', 'banners', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "storage_avatars_public_read" on storage.objects
for select using (bucket_id = 'avatars');
create policy "storage_avatars_owner_insert" on storage.objects
for insert with check (
  bucket_id = 'avatars'
  and auth.role() = 'authenticated'
  and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "storage_avatars_owner_update" on storage.objects
for update using (
  bucket_id = 'avatars'
  and (public.is_admin() or auth.uid()::text = (storage.foldername(name))[1])
) with check (
  bucket_id = 'avatars'
  and (public.is_admin() or auth.uid()::text = (storage.foldername(name))[1])
);
create policy "storage_avatars_owner_delete" on storage.objects
for delete using (
  bucket_id = 'avatars'
  and (public.is_admin() or auth.uid()::text = (storage.foldername(name))[1])
);

create policy "storage_business_photos_public_read" on storage.objects
for select using (bucket_id = 'business-photos');
create policy "storage_business_photos_authenticated_insert" on storage.objects
for insert with check (bucket_id = 'business-photos' and auth.role() = 'authenticated');
create policy "storage_business_photos_authenticated_update" on storage.objects
for update using (bucket_id = 'business-photos' and auth.role() = 'authenticated')
with check (bucket_id = 'business-photos' and auth.role() = 'authenticated');
create policy "storage_business_photos_authenticated_delete" on storage.objects
for delete using (bucket_id = 'business-photos' and auth.role() = 'authenticated');

create policy "storage_product_images_public_read" on storage.objects
for select using (bucket_id = 'product-images');
create policy "storage_product_images_authenticated_insert" on storage.objects
for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
create policy "storage_product_images_authenticated_update" on storage.objects
for update using (bucket_id = 'product-images' and auth.role() = 'authenticated')
with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
create policy "storage_product_images_authenticated_delete" on storage.objects
for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "storage_banners_public_read" on storage.objects
for select using (bucket_id = 'banners');
create policy "storage_banners_admin_insert" on storage.objects
for insert with check (bucket_id = 'banners' and public.is_admin());
create policy "storage_banners_admin_update" on storage.objects
for update using (bucket_id = 'banners' and public.is_admin())
with check (bucket_id = 'banners' and public.is_admin());
create policy "storage_banners_admin_delete" on storage.objects
for delete using (bucket_id = 'banners' and public.is_admin());

insert into public.categories (name, slug, description, icon_name, business_type, sort_order)
values
  ('Haircut', 'haircut', 'Men, women and kids haircut services', 'scissors', 'salon', 10),
  ('Shave & Beard', 'shave-beard', 'Shave, beard trim and styling', 'razor', 'salon', 20),
  ('Facial & Cleanup', 'facial-cleanup', 'Facial, cleanup and skin care', 'sparkles', 'salon', 30),
  ('Hair Color', 'hair-color', 'Color, highlights and touch-up', 'palette', 'salon', 40),
  ('Massage & Spa', 'massage-spa', 'Head massage, body massage and spa services', 'hand', 'salon', 50),
  ('Bridal & Makeup', 'bridal-makeup', 'Makeup, party styling and bridal packages', 'gem', 'salon', 60)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon_name = excluded.icon_name,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.product_categories (business_id, name, slug, description, sort_order)
values
  (null, 'Atta, Rice & Dal', 'atta-rice-dal', 'Daily staples for Indian households', 10),
  (null, 'Oil & Ghee', 'oil-ghee', 'Cooking oil, ghee and vanaspati', 20),
  (null, 'Masala & Spices', 'masala-spices', 'Masala, whole spices and mixes', 30),
  (null, 'Tea, Coffee & Sugar', 'tea-coffee-sugar', 'Tea, coffee, sugar and sweeteners', 40),
  (null, 'Snacks & Biscuits', 'snacks-biscuits', 'Namkeen, biscuits and packaged snacks', 50),
  (null, 'Personal Care', 'personal-care', 'Soap, shampoo, toothpaste and hygiene', 60),
  (null, 'Home Cleaning', 'home-cleaning', 'Detergent, phenyl and cleaning supplies', 70),
  (null, 'Dairy & Bread', 'dairy-bread', 'Milk, curd, paneer, bread and eggs', 80)
on conflict (slug) where business_id is null do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.ad_slots (key, name, placement, business_type, width, height)
values
  ('home_top_banner', 'Home Top Banner', 'home_top', null, 390, 120),
  ('salon_list_inline', 'Salon List Inline Ad', 'salon_list', 'salon', 390, 100),
  ('kirana_list_inline', 'Kirana List Inline Ad', 'kirana_list', 'kirana', 390, 100),
  ('business_detail_footer', 'Business Detail Footer Ad', 'business_detail_footer', null, 390, 100)
on conflict (key) do update set
  name = excluded.name,
  placement = excluded.placement,
  business_type = excluded.business_type,
  width = excluded.width,
  height = excluded.height,
  is_active = true;

insert into public.seo_pages (page_key, title, meta_description, keywords, canonical_url, og_title, og_description, robots_index, structured_data)
values
  ('homepage', 'Nearby Salons & Kirana Shops on WhatsApp | Free Local Booking & Ordering', 'Find nearby salons and kirana shops, book appointments or order groceries directly on WhatsApp without extra platform charges. Support trusted local businesses near you.', 'nearby salons,kirana shops,whatsapp booking,local marketplace', '/', 'Nearby Salons & Kirana Shops on WhatsApp', 'Book salons and order groceries directly from local shops on WhatsApp.', true, '{}'::jsonb),
  ('salon-page', 'Nearby Salon Booking on WhatsApp | Save Time, Skip the Queue', 'Find trusted salons near you, choose your service, and connect directly on WhatsApp to save time.', 'salon booking,haircut near me,beauty salon', '/salons', 'Nearby Salon Booking on WhatsApp', 'Skip the queue and send booking details directly to salons.', true, '{}'::jsonb),
  ('kirana-page', 'Nearby Kirana Home Delivery on WhatsApp | No Extra App Charges', 'Order groceries directly from your nearest kirana shop on WhatsApp without unnecessary platform charges.', 'kirana near me,grocery delivery,whatsapp grocery order', '/kirana', 'Nearby Kirana Home Delivery on WhatsApp', 'Connect with your trusted dukandaar directly on WhatsApp.', true, '{}'::jsonb),
  ('register-shop', 'Register Your Salon or Kirana Shop Free | Get Customers on WhatsApp', 'List your shop for free and receive customer bookings or orders directly on WhatsApp.', 'free shop listing,register salon,register kirana', '/register-shop', 'Register Your Shop Free', 'Get local customers directly on WhatsApp.', true, '{}'::jsonb),
  ('city-landing', 'LocalKart City Landing Pages', 'Discover nearby salons and kirana shops by city and area.', 'city salon booking,city kirana delivery', null, 'LocalKart City Pages', 'Find local shops by city and area.', true, '{}'::jsonb),
  ('privacy-policy', 'Privacy Policy - LocalKart', 'How LocalKart handles customer, shop and lead information.', null, '/privacy-policy', 'Privacy Policy', 'LocalKart privacy policy.', true, '{}'::jsonb),
  ('terms', 'Terms and Conditions - LocalKart', 'Terms for customers and shopkeepers using LocalKart.', null, '/terms', 'Terms and Conditions', 'LocalKart terms and conditions.', true, '{}'::jsonb),
  ('faq', 'LocalKart FAQ', 'Common questions about WhatsApp booking and kirana ordering.', null, '/faq', 'LocalKart FAQ', 'Answers for customers and shopkeepers.', true, '{}'::jsonb)
on conflict (page_key) do update set
  title = excluded.title,
  meta_description = excluded.meta_description,
  keywords = excluded.keywords,
  canonical_url = excluded.canonical_url,
  og_title = excluded.og_title,
  og_description = excluded.og_description,
  robots_index = excluded.robots_index,
  structured_data = excluded.structured_data;

insert into public.faqs (question, answer, category, business_type, sort_order)
values
  ('Does LocalKart charge customers extra?', 'No. In the MVP, customers contact the local shop directly on WhatsApp. Any price or delivery charge is confirmed by the shopkeeper.', 'customer', null, 10),
  ('Can I pay inside LocalKart?', 'No. LocalKart does not collect payments in the MVP. Payment and confirmation happen directly between customer and shop owner.', 'customer', null, 20),
  ('How does salon booking work?', 'Select a nearby salon, choose service, date and time, then send the details on WhatsApp. The salon confirms manually.', 'salon', 'salon', 30),
  ('How does kirana ordering work?', 'Select products or write your grocery list, add delivery details, then send it to the nearby kirana shop on WhatsApp.', 'kirana', 'kirana', 40),
  ('Is shop registration free?', 'Yes. Salon owners and kirana shopkeepers can register for free during the MVP phase.', 'owner', null, 50),
  ('How will promoted listings work?', 'Featured shops, promoted listings and ad placements can be enabled later from the admin panel.', 'owner', null, 60)
on conflict do nothing;

insert into public.pages (slug, title, meta_title, meta_description, content, is_published)
values
  ('about', 'About LocalKart', 'About LocalKart - Hyperlocal WhatsApp Marketplace', 'LocalKart helps customers discover nearby salons and kirana shops, then connect directly on WhatsApp.', 'LocalKart is a hyperlocal Indian marketplace for nearby salons and kirana shops. Customers discover local businesses and send booking or grocery order details directly on WhatsApp.', true),
  ('privacy-policy', 'Privacy Policy', 'Privacy Policy - LocalKart', 'How LocalKart handles customer, shop and lead information.', 'LocalKart stores basic profile, shop and WhatsApp lead details required to run the marketplace experience. Payments are not collected in the MVP.', true),
  ('terms', 'Terms and Conditions', 'Terms and Conditions - LocalKart', 'Terms for customers, salon owners and kirana shopkeepers using LocalKart.', 'LocalKart connects customers with local businesses. Final service, pricing, delivery and confirmation are handled directly between customer and shop owner.', true),
  ('salon-booking', 'Nearby Salon Booking', 'Book Nearby Salons on WhatsApp - LocalKart', 'Find nearby salons and send appointment details directly on WhatsApp.', 'Salon mein line lagana ab khatam. Apne nearby salon se WhatsApp par booking karein aur time bachaiye.', true),
  ('kirana-delivery', 'Nearby Kirana Delivery', 'Order from Nearby Kirana Shops on WhatsApp - LocalKart', 'Order groceries directly from nearby kirana shops on WhatsApp without extra platform checkout.', 'Extra charge kyun dena? Seedha apne najdeeki dukandaar se WhatsApp par order karein.', true)
on conflict (slug) do update set
  title = excluded.title,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  content = excluded.content,
  is_published = excluded.is_published;

insert into public.app_config (key, value, description, is_public)
values
  ('app_name', '"LocalKart"', 'Public app name', true),
  ('support_whatsapp', '"+919999999999"', 'Default support WhatsApp number', true),
  ('default_city', '"Bengaluru"', 'Default launch city', true),
  ('max_nearby_radius_km', '10', 'Maximum search radius exposed to users', true),
  ('ads_enabled', 'true', 'Enable admin-controlled ad slots and placeholders', true),
  ('shop_registration_enabled', 'true', 'Allow shopkeepers to submit free listings', true),
  ('maintenance_mode', 'false', 'Temporarily pause public app features during maintenance', true),
  ('minimum_app_version', '"1.0.0"', 'Minimum supported PWA version', true),
  ('kirana_tagline', '"Extra charge kyun dena? Seedha apne najdeeki dukandaar se WhatsApp par order karein."', 'Kirana landing tagline', true),
  ('salon_tagline', '"Salon mein line lagana ab khatam. Apne nearby salon se WhatsApp par booking karein aur time bachaiye."', 'Salon landing tagline', true),
  ('mvp_payments_enabled', 'false', 'Payments are intentionally disabled for MVP', true),
  ('monetization_channels', '["google_ads", "promoted_listings", "featured_shops"]', 'Future platform earning channels', true)
on conflict (key) do update set
  value = excluded.value,
  description = excluded.description,
  is_public = excluded.is_public;
