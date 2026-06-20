-- LocalKart production hardening and compatibility migration.
-- Safe to run after 001_initial_schema.sql, 002_add_food_business_type.sql, and 003_food_section.sql.
-- This migration is additive where possible and avoids destructive table rewrites.

create extension if not exists "pgcrypto";
create extension if not exists "postgis";

alter type public.business_type add value if not exists 'food';
alter type public.lead_status add value if not exists 'sent';
alter type public.lead_status add value if not exists 'seen';
alter type public.lead_status add value if not exists 'responded';
alter type public.lead_status add value if not exists 'converted';

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.profiles
  add column if not exists status text not null default 'active',
  add constraint profiles_status_check check (status in ('active', 'blocked')) not valid;

update public.profiles
set status = case when is_blocked then 'blocked' else 'active' end
where status is null or status not in ('active', 'blocked');

alter table public.addresses
  add column if not exists user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists full_address text,
  add column if not exists state_contract text;

update public.addresses
set
  user_id = coalesce(user_id, profile_id),
  full_address = coalesce(
    full_address,
    concat_ws(', ', address_line1, address_line2, landmark, area, city, state, pincode)
  )
where user_id is null or full_address is null;

alter table public.businesses
  add column if not exists email text,
  add column if not exists weekly_closed_day text,
  add column if not exists pickup_available boolean not null default true,
  add column if not exists meta_title text,
  add column if not exists meta_description text;

alter table public.business_photos
  add column if not exists image_url text;

update public.business_photos
set image_url = photo_url
where image_url is null and photo_url is not null;

alter table public.business_hours
  add column if not exists is_open boolean not null default true,
  add column if not exists open_time time,
  add column if not exists close_time time;

update public.business_hours
set
  is_open = not is_closed,
  open_time = coalesce(open_time, opens_at),
  close_time = coalesce(close_time, closes_at);

alter table public.categories
  add column if not exists type public.business_type,
  add column if not exists icon text;

update public.categories
set
  type = coalesce(type, business_type),
  icon = coalesce(icon, icon_name);

create unique index if not exists categories_type_slug_unique_idx on public.categories (type, slug);

alter table public.salon_services
  add column if not exists gender text not null default 'unisex',
  add column if not exists sort_order integer not null default 0,
  add constraint salon_services_gender_check check (gender in ('male', 'female', 'unisex')) not valid;

alter table public.products
  add column if not exists brand text,
  add column if not exists selling_price numeric(10,2),
  add column if not exists stock_status text not null default 'in_stock',
  add constraint products_stock_status_check check (stock_status in ('in_stock', 'out_of_stock', 'limited')) not valid;

update public.products
set
  selling_price = coalesce(selling_price, price),
  stock_status = case when in_stock then 'in_stock' else 'out_of_stock' end
where selling_price is null or stock_status is null;

alter table public.reviews
  add column if not exists user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists status text not null default 'published',
  add constraint reviews_status_check check (status in ('published', 'hidden', 'reported')) not valid;

update public.reviews
set
  user_id = coalesce(user_id, customer_id),
  status = case when is_approved then 'published' else 'hidden' end
where user_id is null or status is null;

alter table public.favorites
  add column if not exists user_id uuid references public.profiles(id) on delete cascade;

update public.favorites
set user_id = coalesce(user_id, profile_id)
where user_id is null;

create unique index if not exists favorites_user_business_unique_idx on public.favorites (user_id, business_id);

alter table public.banners
  add column if not exists area text;

alter table public.ad_units
  add column if not exists ad_unit_id text,
  add column if not exists script_code text;

update public.ad_units
set ad_unit_id = coalesce(ad_unit_id, google_ad_unit_id)
where ad_unit_id is null;

alter table public.pages
  add column if not exists keywords text,
  add column if not exists canonical_url text,
  add column if not exists og_title text,
  add column if not exists og_description text,
  add column if not exists og_image text,
  add column if not exists structured_data jsonb not null default '{}'::jsonb,
  add column if not exists robots_index boolean not null default true;

alter table public.faqs
  add column if not exists page text;

update public.faqs
set page = coalesce(page, category);

alter table public.support_tickets
  add column if not exists user_id uuid references public.profiles(id) on delete set null;

update public.support_tickets
set user_id = coalesce(user_id, profile_id)
where user_id is null;

alter table public.reports
  add column if not exists business_id uuid references public.businesses(id) on delete set null,
  add column if not exists review_id uuid references public.reviews(id) on delete set null;

alter table public.admin_audit_logs
  add column if not exists entity_type text,
  add column if not exists entity_id uuid,
  add column if not exists old_data jsonb,
  add column if not exists new_data jsonb;

update public.admin_audit_logs
set
  entity_type = coalesce(entity_type, target_table),
  old_data = coalesce(old_data, old_values),
  new_data = coalesce(new_data, new_values)
where entity_type is null or old_data is null or new_data is null;

alter table public.whatsapp_booking_leads
  add column if not exists selected_items jsonb,
  alter column preferred_date drop not null,
  alter column preferred_time type text using preferred_time::text,
  alter column preferred_time drop not null;

alter table public.whatsapp_booking_leads
  alter column status drop default;

alter table public.whatsapp_order_leads
  add column if not exists customer_address text,
  add column if not exists selected_items jsonb,
  add column if not exists custom_order_text text;

update public.whatsapp_order_leads
set
  customer_address = coalesce(customer_address, delivery_address),
  selected_items = coalesce(selected_items, selected_products),
  custom_order_text = coalesce(custom_order_text, grocery_list);

alter table public.whatsapp_order_leads
  alter column delivery_address drop not null,
  alter column grocery_list drop not null,
  alter column status drop default;

do $$
begin
  if to_regclass('public.whatsapp_food_order_leads') is not null
    and not exists (
      select 1
      from pg_constraint
      where conname = 'whatsapp_food_order_leads_status_check'
        and conrelid = 'public.whatsapp_food_order_leads'::regclass
    )
  then
    alter table public.whatsapp_food_order_leads
      add constraint whatsapp_food_order_leads_status_check
      check (status in ('sent', 'seen', 'responded', 'converted', 'cancelled')) not valid;
  end if;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, phone, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'phone',
    'customer',
    'active'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

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
      and coalesce(status, 'active') = 'active'
      and coalesce(is_blocked, false) = false
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
    from public.businesses b
    join public.profiles p on p.id = b.owner_id
    where b.id = business_id
      and b.owner_id = auth.uid()
      and coalesce(p.status, 'active') = 'active'
      and coalesce(p.is_blocked, false) = false
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

create or replace function public.prevent_profile_privilege_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if auth.uid() = old.id and (
    new.role is distinct from old.role
    or new.status is distinct from old.status
    or new.is_blocked is distinct from old.is_blocked
  ) then
    raise exception 'Role and status can only be changed by an admin';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profile_privilege_self_update on public.profiles;
create trigger prevent_profile_privilege_self_update
before update on public.profiles
for each row execute function public.prevent_profile_privilege_self_update();

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
    and (business_type is null or b.type::text = business_type)
    and st_dwithin(
      b.geog,
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography,
      greatest(radius_km, 0) * 1000
    )
  order by distance_km asc, b.is_featured desc, b.rating_avg desc;
$$;

grant execute on function public.nearby_businesses(double precision, double precision, numeric, text) to anon, authenticated;

create or replace function public.update_business_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_business_id uuid;
begin
  target_business_id = coalesce(new.business_id, old.business_id);

  update public.businesses b
  set
    rating_avg = coalesce(r.avg_rating, 0),
    rating_count = coalesce(r.rating_count, 0)
  from (
    select
      business_id,
      round(avg(rating)::numeric, 2) as avg_rating,
      count(*)::integer as rating_count
    from public.reviews
    where business_id = target_business_id
      and coalesce(status, case when is_approved then 'published' else 'hidden' end) = 'published'
    group by business_id
  ) r
  where b.id = target_business_id
    and r.business_id = b.id;

  update public.businesses
  set rating_avg = 0, rating_count = 0
  where id = target_business_id
    and not exists (
      select 1 from public.reviews
      where business_id = target_business_id
        and coalesce(status, case when is_approved then 'published' else 'hidden' end) = 'published'
    );

  return null;
end;
$$;

drop trigger if exists update_business_rating_after_review on public.reviews;
create trigger update_business_rating_after_review
after insert or update or delete on public.reviews
for each row execute function public.update_business_rating();

create or replace function public.slugify(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, 'shop')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.generate_unique_business_slug(input_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  base_slug text := public.slugify(input_name);
  candidate text := base_slug;
  counter integer := 1;
begin
  while exists (select 1 from public.businesses where slug = candidate) loop
    counter := counter + 1;
    candidate := base_slug || '-' || counter::text;
  end loop;
  return candidate;
end;
$$;

create index if not exists businesses_type_idx on public.businesses (type);
create index if not exists businesses_city_idx on public.businesses (city);
create index if not exists businesses_area_idx on public.businesses (area);
create index if not exists businesses_is_featured_idx on public.businesses (is_featured);
create index if not exists food_items_business_id_idx on public.food_items (business_id);
create index if not exists whatsapp_food_order_leads_business_id_idx on public.whatsapp_food_order_leads (business_id);
create index if not exists reviews_business_id_idx on public.reviews (business_id);
create index if not exists banners_placement_active_idx on public.banners (placement, is_active);
create index if not exists categories_type_active_idx on public.categories (type, is_active);

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin" on public.profiles
for update using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "businesses_owner_update_own" on public.businesses;
create policy "businesses_owner_update_own" on public.businesses
for update using (owner_id = auth.uid() and public.owns_business(id))
with check (owner_id = auth.uid() and public.owns_business(id));

drop policy if exists "reviews_public_read_approved" on public.reviews;
create policy "reviews_public_read_approved" on public.reviews
for select using (
  coalesce(status, case when is_approved then 'published' else 'hidden' end) = 'published'
  and public.business_is_approved(business_id)
);

drop policy if exists "reviews_customer_insert" on public.reviews;
create policy "reviews_customer_insert" on public.reviews
for insert with check (
  auth.role() = 'authenticated'
  and coalesce(user_id, customer_id) = auth.uid()
);

drop policy if exists "favorites_manage_self" on public.favorites;
create policy "favorites_manage_self" on public.favorites
for all using (coalesce(user_id, profile_id) = auth.uid() or public.is_admin())
with check (coalesce(user_id, profile_id) = auth.uid() or public.is_admin());

drop policy if exists "support_tickets_select_owner_or_admin" on public.support_tickets;
create policy "support_tickets_select_owner_or_admin" on public.support_tickets
for select using (coalesce(user_id, profile_id) = auth.uid() or public.is_admin());

drop policy if exists "support_tickets_update_owner_or_admin" on public.support_tickets;
create policy "support_tickets_update_owner_or_admin" on public.support_tickets
for update using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('business-photos', 'business-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('food-images', 'food-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('banners', 'banners', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('page-assets', 'page-assets', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "storage_food_images_public_read" on storage.objects;
create policy "storage_food_images_public_read" on storage.objects
for select using (bucket_id = 'food-images');

drop policy if exists "storage_food_images_owner_insert" on storage.objects;
create policy "storage_food_images_owner_insert" on storage.objects
for insert with check (bucket_id = 'food-images' and auth.role() = 'authenticated');

drop policy if exists "storage_food_images_owner_update" on storage.objects;
create policy "storage_food_images_owner_update" on storage.objects
for update using (bucket_id = 'food-images' and auth.role() = 'authenticated')
with check (bucket_id = 'food-images' and auth.role() = 'authenticated');

drop policy if exists "storage_page_assets_public_read" on storage.objects;
create policy "storage_page_assets_public_read" on storage.objects
for select using (bucket_id = 'page-assets');

drop policy if exists "storage_page_assets_admin_write" on storage.objects;
create policy "storage_page_assets_admin_write" on storage.objects
for all using (bucket_id = 'page-assets' and public.is_admin())
with check (bucket_id = 'page-assets' and public.is_admin());

insert into public.categories (name, slug, description, icon_name, business_type, type, icon, sort_order)
values
  ('Haircut', 'haircut', 'Haircut services', 'scissors', 'salon', 'salon', 'scissors', 10),
  ('Shave', 'shave', 'Shave and beard services', 'razor', 'salon', 'salon', 'razor', 20),
  ('Facial', 'facial', 'Facial and cleanup services', 'sparkles', 'salon', 'salon', 'sparkles', 30),
  ('Hair Color', 'hair-color', 'Hair color and highlights', 'palette', 'salon', 'salon', 'palette', 40),
  ('Grooming', 'grooming', 'Personal grooming services', 'scissors', 'salon', 'salon', 'scissors', 50),
  ('Massage', 'massage', 'Massage services', 'hand', 'salon', 'salon', 'hand', 60),
  ('Bridal', 'bridal', 'Bridal makeup and styling', 'gem', 'salon', 'salon', 'gem', 70),
  ('Beauty Care', 'beauty-care', 'Beauty care services', 'sparkles', 'salon', 'salon', 'sparkles', 80),
  ('Atta & Rice', 'atta-rice', 'Daily staples', 'wheat', 'kirana', 'kirana', 'wheat', 10),
  ('Dal & Pulses', 'dal-pulses', 'Dal and pulses', 'bean', 'kirana', 'kirana', 'bean', 20),
  ('Oil & Ghee', 'oil-ghee', 'Cooking oil and ghee', 'droplet', 'kirana', 'kirana', 'droplet', 30),
  ('Dairy', 'dairy', 'Milk and dairy', 'milk', 'kirana', 'kirana', 'milk', 40),
  ('Snacks', 'snacks', 'Snacks and namkeen', 'cookie', 'kirana', 'kirana', 'cookie', 50),
  ('Beverages', 'beverages', 'Cold drinks and beverages', 'cup-soda', 'kirana', 'kirana', 'cup-soda', 60),
  ('Personal Care', 'personal-care', 'Personal care items', 'heart', 'kirana', 'kirana', 'heart', 70),
  ('Household', 'household', 'Household supplies', 'home', 'kirana', 'kirana', 'home', 80),
  ('Daily Essentials', 'daily-essentials', 'Daily essentials', 'shopping-basket', 'kirana', 'kirana', 'shopping-basket', 90),
  ('Cafe', 'food-cafe', 'Local cafes and coffee shops', 'coffee', 'food', 'food', 'coffee', 10),
  ('Chinese Food', 'food-chinese-food', 'Chinese counters', 'utensils', 'food', 'food', 'utensils', 20),
  ('Fast Food', 'food-fast-food', 'Fast food shops', 'burger', 'food', 'food', 'burger', 30),
  ('Tea & Snacks', 'food-tea-snacks', 'Tea and snack points', 'cup-soda', 'food', 'food', 'cup-soda', 40),
  ('Bakery', 'food-bakery', 'Bakery and cake shops', 'cake-slice', 'food', 'food', 'cake-slice', 50),
  ('Juice & Shake', 'food-juice-shake', 'Juice and shake shops', 'glass-water', 'food', 'food', 'glass-water', 60),
  ('Momos', 'food-momos', 'Momo shops', 'circle-dot', 'food', 'food', 'circle-dot', 70),
  ('Street Food', 'food-street-food', 'Street food shops', 'store', 'food', 'food', 'store', 80),
  ('Sweets', 'food-sweets', 'Sweet shops', 'candy', 'food', 'food', 'candy', 90),
  ('South Indian', 'food-south-indian', 'South Indian food', 'utensils', 'food', 'food', 'utensils', 100),
  ('North Indian', 'food-north-indian', 'North Indian food', 'utensils', 'food', 'food', 'utensils', 110),
  ('Rolls & Sandwiches', 'food-rolls-sandwiches', 'Rolls and sandwiches', 'sandwich', 'food', 'food', 'sandwich', 120),
  ('Pizza & Burger', 'food-pizza-burger', 'Pizza and burger shops', 'pizza', 'food', 'food', 'pizza', 130),
  ('Local Food', 'food-local-food', 'Nearby local food shops', 'map-pin', 'food', 'food', 'map-pin', 140)
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
  ('home_top', 'Home Top', 'home', 'home_top', null, 390, 120, 'placeholder', true),
  ('home_after_categories', 'Home After Categories', 'home', 'home_after_categories', null, 390, 100, 'placeholder', true),
  ('salon_list_after_5_cards', 'Salon List After 5 Cards', 'salons', 'salon_list_after_5_cards', 'salon', 390, 100, 'placeholder', true),
  ('salon_detail_bottom', 'Salon Detail Bottom', 'salon_detail', 'salon_detail_bottom', 'salon', 390, 100, 'placeholder', true),
  ('kirana_list_after_5_cards', 'Kirana List After 5 Cards', 'kirana', 'kirana_list_after_5_cards', 'kirana', 390, 100, 'placeholder', true),
  ('kirana_detail_bottom', 'Kirana Detail Bottom', 'kirana_detail', 'kirana_detail_bottom', 'kirana', 390, 100, 'placeholder', true),
  ('food_list_after_5_cards', 'Food List After 5 Cards', 'food', 'food_list_after_5_cards', 'food', 390, 100, 'placeholder', true),
  ('food_detail_bottom', 'Food Detail Bottom', 'food_detail', 'food_detail_bottom', 'food', 390, 100, 'placeholder', true),
  ('register_shop_bottom', 'Register Shop Bottom', 'register_shop', 'register_shop_bottom', null, 390, 100, 'placeholder', true),
  ('admin_placeholder', 'Admin Placeholder', 'admin', 'admin_placeholder', null, 390, 100, 'placeholder', true)
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

insert into public.app_config (key, value, description, is_public)
values
  ('site_name', '"LocalKart"', 'Public site name', true),
  ('support_phone', '"+919999999999"', 'Support phone number', true),
  ('support_whatsapp', '"+919999999999"', 'Support WhatsApp number', true),
  ('default_city', '"Bengaluru"', 'Default launch city', true),
  ('default_radius_km', '10', 'Default nearby radius', true),
  ('ads_enabled', 'true', 'Enable dynamic ads', true),
  ('shop_registration_enabled', 'true', 'Allow shop registrations', true),
  ('maintenance_mode', 'false', 'Maintenance mode', true),
  ('lead_capture_enabled', 'true', 'Save leads before WhatsApp redirect', true)
on conflict (key) do update set
  value = excluded.value,
  description = excluded.description,
  is_public = excluded.is_public;

insert into public.pages (slug, title, meta_title, meta_description, content, is_published)
values
  ('about', 'About LocalKart', 'About LocalKart', 'About LocalKart hyperlocal WhatsApp marketplace.', 'LocalKart connects customers with nearby local shops on WhatsApp.', true),
  ('contact', 'Contact LocalKart', 'Contact LocalKart', 'Contact LocalKart support.', 'Contact LocalKart for customer support, shop listing help, and admin approval questions.', true),
  ('privacy-policy', 'Privacy Policy', 'Privacy Policy - LocalKart', 'How LocalKart handles data.', 'LocalKart stores basic profile, shop, and WhatsApp lead information required for the MVP.', true),
  ('terms', 'Terms and Conditions', 'Terms - LocalKart', 'Terms for LocalKart users.', 'LocalKart is a discovery and WhatsApp lead platform. Final confirmation and payment happen directly with the shopkeeper.', true),
  ('faq', 'FAQ', 'LocalKart FAQ', 'Common LocalKart questions.', 'Common questions about WhatsApp booking, ordering, and shop registration.', true),
  ('cancellation-policy', 'Cancellation Policy', 'Cancellation Policy - LocalKart', 'Cancellation policy for WhatsApp-first MVP.', 'Cancellations are handled directly between customer and shopkeeper on WhatsApp.', true),
  ('how-it-works', 'How It Works', 'How LocalKart Works', 'How LocalKart WhatsApp flows work.', 'Find a nearby shop, fill details, send on WhatsApp, and wait for shopkeeper confirmation.', true)
on conflict (slug) do update set
  title = excluded.title,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  content = excluded.content,
  is_published = excluded.is_published;
