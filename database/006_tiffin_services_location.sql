-- LocalKart tiffin service conversion and location hardening.
-- Keeps legacy salon rows readable while new listings use business_type = 'tiffin'.

create extension if not exists "postgis";

alter type public.business_type add value if not exists 'tiffin';

alter table public.businesses
  add column if not exists pickup_available boolean not null default true,
  add column if not exists meal_types text[] not null default '{}'::text[],
  add column if not exists cuisines text[] not null default '{}'::text[],
  add column if not exists veg_available boolean not null default true,
  add column if not exists non_veg_available boolean not null default false,
  add column if not exists monthly_plan_available boolean not null default false,
  add column if not exists trial_meal_available boolean not null default false;

create index if not exists businesses_type_status_city_idx on public.businesses (type, status, city);
create index if not exists businesses_pincode_idx on public.businesses (pincode);
create index if not exists businesses_city_pincode_idx on public.businesses (city, pincode);
create index if not exists businesses_geog_idx on public.businesses using gist (geog);

create or replace function public.nearby_businesses(
  user_lat double precision,
  user_lng double precision,
  radius_km numeric default 10,
  business_type text default null
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
  pickup_available boolean,
  delivery_radius_km numeric,
  min_order_amount numeric,
  delivery_fee_note text,
  is_featured boolean,
  rating_avg numeric,
  rating_count integer,
  cover_image_url text,
  logo_url text,
  distance_meters double precision,
  distance_km double precision
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
    b.pickup_available,
    b.delivery_radius_km,
    b.min_order_amount,
    b.delivery_fee_note,
    b.is_featured,
    b.rating_avg,
    b.rating_count,
    b.cover_image_url,
    b.logo_url,
    st_distance(b.geog, st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography) as distance_meters,
    st_distance(b.geog, st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography) / 1000.0 as distance_km
  from public.businesses b
  where b.status = 'approved'
    and (
      business_type is null
      or b.type::text = business_type
      or (business_type = 'tiffin' and b.type::text = 'salon')
    )
    and st_dwithin(
      b.geog,
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography,
      greatest(radius_km, 0) * 1000
    )
  order by distance_km asc, b.is_featured desc, b.rating_avg desc;
$$;

grant execute on function public.nearby_businesses(double precision, double precision, numeric, text) to anon, authenticated;

insert into public.categories (name, slug, description, icon_name, business_type, type, icon, sort_order)
values
  ('Trial Meal', 'tiffin-trial-meal', 'One-time tasting meal for first-time customers', 'soup', 'tiffin', 'tiffin', 'soup', 10),
  ('Daily Meal', 'tiffin-daily-meal', 'Daily lunch or dinner tiffin plans', 'utensils', 'tiffin', 'tiffin', 'utensils', 20),
  ('Weekly Plan', 'tiffin-weekly-plan', 'Weekly subscription meal plans', 'calendar-clock', 'tiffin', 'tiffin', 'calendar-clock', 30),
  ('Monthly Plan', 'tiffin-monthly-plan', 'Monthly tiffin subscriptions', 'badge-indian-rupee', 'tiffin', 'tiffin', 'badge-indian-rupee', 40),
  ('Veg Meals', 'tiffin-veg', 'Vegetarian tiffin options', 'leaf', 'tiffin', 'tiffin', 'leaf', 50),
  ('Non-veg Meals', 'tiffin-non-veg', 'Non-vegetarian tiffin options', 'drumstick', 'tiffin', 'tiffin', 'drumstick', 60)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon_name = excluded.icon_name,
  business_type = excluded.business_type,
  type = excluded.type,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.ad_slots (key, name, page, placement, business_type, width, height, provider, test_mode)
values
  ('tiffin_list_after_5_cards', 'Tiffin List After 5 Cards', 'tiffin_services', 'tiffin_list_after_5_cards', 'tiffin', 390, 100, 'placeholder', true),
  ('tiffin_detail_bottom', 'Tiffin Detail Bottom', 'tiffin_detail', 'tiffin_detail_bottom', 'tiffin', 390, 100, 'placeholder', true)
on conflict (key) do update set
  name = excluded.name,
  page = excluded.page,
  placement = excluded.placement,
  business_type = excluded.business_type,
  width = excluded.width,
  height = excluded.height,
  provider = excluded.provider,
  test_mode = excluded.test_mode,
  is_active = true;

insert into public.seo_pages (page_key, title, meta_description, keywords, canonical_url, og_title, og_description, robots_index, structured_data)
values
  (
    'tiffin-page',
    'Nearby Tiffin Services & Cloud Kitchens | Direct WhatsApp Ordering',
    'Find home food, tiffin services and cloud kitchens near you. Compare meal plans, veg and non-veg options, trial meals and monthly plans, then enquire on WhatsApp.',
    'tiffin service near me, home food near me, cloud kitchen near me, monthly tiffin plan, lunch tiffin, dinner tiffin, homemade food delivery',
    '/tiffin-services',
    'Nearby Tiffin Services & Cloud Kitchens',
    'Find home food and monthly tiffin providers near you.',
    true,
    '{}'::jsonb
  )
on conflict (page_key) do update set
  title = excluded.title,
  meta_description = excluded.meta_description,
  keywords = excluded.keywords,
  canonical_url = excluded.canonical_url,
  og_title = excluded.og_title,
  og_description = excluded.og_description,
  robots_index = excluded.robots_index,
  structured_data = excluded.structured_data;
