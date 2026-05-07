-- LocalKart Local Cafe / Food Shops foundation.
-- Depends on database/002_add_food_business_type.sql.

create table if not exists public.food_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.businesses
  add column if not exists food_category_id uuid references public.food_categories(id) on delete set null,
  add column if not exists pickup_available boolean not null default true;

create table if not exists public.food_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid references public.food_categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) check (price is null or price >= 0),
  image_url text,
  storage_path text,
  is_veg boolean not null default true,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_food_order_leads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  order_type text not null check (order_type in ('delivery', 'pickup')),
  customer_address text,
  selected_items jsonb,
  custom_order_text text,
  note text,
  whatsapp_message text not null,
  status text not null default 'sent',
  created_at timestamptz not null default now()
);

create index if not exists businesses_food_category_id_idx on public.businesses (food_category_id);
create index if not exists food_categories_active_idx on public.food_categories (is_active, sort_order);
create index if not exists food_items_business_id_idx on public.food_items (business_id);
create index if not exists food_items_category_id_idx on public.food_items (category_id);
create index if not exists whatsapp_food_order_leads_business_id_idx on public.whatsapp_food_order_leads (business_id);
create index if not exists whatsapp_food_order_leads_created_at_idx on public.whatsapp_food_order_leads (created_at desc);

drop trigger if exists set_food_categories_updated_at on public.food_categories;
create trigger set_food_categories_updated_at before update on public.food_categories
for each row execute function public.set_updated_at();

drop trigger if exists set_food_items_updated_at on public.food_items;
create trigger set_food_items_updated_at before update on public.food_items
for each row execute function public.set_updated_at();

alter table public.food_categories enable row level security;
alter table public.food_items enable row level security;
alter table public.whatsapp_food_order_leads enable row level security;

drop policy if exists "food_categories_public_read_active" on public.food_categories;
create policy "food_categories_public_read_active" on public.food_categories
for select using (is_active);

drop policy if exists "food_categories_admin_manage" on public.food_categories;
create policy "food_categories_admin_manage" on public.food_categories
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "food_items_public_read_available" on public.food_items;
create policy "food_items_public_read_available" on public.food_items
for select using (is_available and public.business_is_approved(business_id));

drop policy if exists "food_items_owner_manage" on public.food_items;
create policy "food_items_owner_manage" on public.food_items
for all using (public.owns_business(business_id) or public.is_admin())
with check (public.owns_business(business_id) or public.is_admin());

drop policy if exists "whatsapp_food_order_leads_insert_public" on public.whatsapp_food_order_leads;
create policy "whatsapp_food_order_leads_insert_public" on public.whatsapp_food_order_leads
for insert with check (
  public.business_is_approved(business_id)
  and (customer_id is null or customer_id = auth.uid())
);

drop policy if exists "whatsapp_food_order_leads_select_owner_customer_admin" on public.whatsapp_food_order_leads;
create policy "whatsapp_food_order_leads_select_owner_customer_admin" on public.whatsapp_food_order_leads
for select using (
  public.is_admin() or public.owns_business(business_id) or customer_id = auth.uid()
);

drop policy if exists "whatsapp_food_order_leads_update_owner_admin" on public.whatsapp_food_order_leads;
create policy "whatsapp_food_order_leads_update_owner_admin" on public.whatsapp_food_order_leads
for update using (public.is_admin() or public.owns_business(business_id))
with check (public.is_admin() or public.owns_business(business_id));

insert into public.food_categories (name, slug, icon, sort_order)
values
  ('Cafe', 'cafe', 'coffee', 10),
  ('Chinese Food', 'chinese-food', 'utensils', 20),
  ('Fast Food', 'fast-food', 'burger', 30),
  ('Tea & Snacks', 'tea-snacks', 'cup-soda', 40),
  ('Bakery', 'bakery', 'cake-slice', 50),
  ('Juice & Shake', 'juice-shake', 'glass-water', 60),
  ('Momos', 'momos', 'circle-dot', 70),
  ('Street Food', 'street-food', 'store', 80),
  ('Sweets', 'sweets', 'candy', 90),
  ('South Indian', 'south-indian', 'utensils', 100),
  ('North Indian', 'north-indian', 'utensils', 110),
  ('Rolls & Sandwiches', 'rolls-sandwiches', 'sandwich', 120),
  ('Pizza & Burger', 'pizza-burger', 'pizza', 130),
  ('Local Food', 'local-food', 'map-pin', 140)
on conflict (slug) do update set
  name = excluded.name,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.categories (name, slug, description, icon_name, business_type, sort_order)
values
  ('Cafe', 'food-cafe', 'Local cafes and coffee shops', 'coffee', 'food', 10),
  ('Chinese Food', 'food-chinese-food', 'Chinese corners and local noodles counters', 'utensils', 'food', 20),
  ('Momos', 'food-momos', 'Momo shops and snack counters', 'circle-dot', 'food', 30),
  ('Bakery', 'food-bakery', 'Bakery and cake shops', 'cake-slice', 'food', 40),
  ('Local Food', 'food-local-food', 'Nearby local food shops', 'store', 'food', 50)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon_name = excluded.icon_name,
  business_type = excluded.business_type,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.ad_slots (key, name, page, placement, business_type, width, height)
values
  ('food_home_section', 'Food Home Section Ad', 'home', 'food_home_section', 'food', 390, 120),
  ('food_list_after_5_cards', 'Food List After 5 Cards', 'food', 'food_list_after_5_cards', 'food', 390, 100),
  ('food_detail_bottom', 'Food Detail Bottom Ad', 'food_detail', 'food_detail_bottom', 'food', 390, 100),
  ('food_order_form_bottom', 'Food Order Form Bottom Ad', 'food_detail', 'food_order_form_bottom', 'food', 390, 100)
on conflict (key) do update set
  name = excluded.name,
  page = excluded.page,
  placement = excluded.placement,
  business_type = excluded.business_type,
  width = excluded.width,
  height = excluded.height,
  is_active = true;

insert into public.seo_pages (page_key, title, meta_description, keywords, canonical_url, og_title, og_description, robots_index, structured_data)
values
  (
    'food-page',
    'Nearby Cafe & Food Shops on WhatsApp | Local Food Ordering',
    'Find nearby cafes, Chinese food shops, momo stalls, bakeries, juice shops and local food places. Send your order directly on WhatsApp and confirm with the shopkeeper.',
    'nearby cafe, food shop near me, Chinese food near me, momo shop near me, order food on WhatsApp, local food shops, cafe near me, snacks shop near me, bakery near me, juice shop near me, local food delivery, food pickup near me',
    '/food',
    'Nearby Cafe & Food Shops on WhatsApp',
    'Order from nearby cafes, Chinese corners, momo shops and local food shops directly on WhatsApp.',
    true,
    '{}'::jsonb
  ),
  (
    'food-city-page',
    'Order from Nearby Cafe & Food Shops in [City] on WhatsApp',
    'Discover nearby cafes, Chinese corners, momo shops, bakeries, juice shops and snack points, then send your order directly on WhatsApp.',
    'order food on WhatsApp, local food shops, cafe near me',
    '/food-delivery/[city]',
    'Order Local Food on WhatsApp',
    'Shopkeeper confirms availability, price and timing directly with you.',
    true,
    '{}'::jsonb
  ),
  (
    'food-area-page',
    'Nearby Food Shops in [Area], [City] | Direct WhatsApp Order',
    'Find nearby food shops in your area and send orders directly to the shopkeeper on WhatsApp.',
    'nearby food shops, food pickup near me, local food delivery',
    '/food-delivery/[city]/[area]',
    'Nearby Food Shops',
    'Direct WhatsApp order for nearby food shops.',
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

insert into public.faqs (question, answer, category, business_type, sort_order)
values
  ('Can I order from cafes on WhatsApp?', 'Yes. Open a nearby cafe or food shop on LocalKart, add menu items or write your custom order, and send it directly to the shopkeeper WhatsApp.', 'food', 'food', 100),
  ('Are delivery charges fixed?', 'No. Delivery charges are not fixed by LocalKart in the MVP. The shopkeeper confirms availability, total amount, delivery charge and timing on WhatsApp.', 'food', 'food', 110),
  ('Who confirms the food order?', 'The food order goes directly to the shopkeeper WhatsApp. The shopkeeper confirms availability, total amount and timing directly with you.', 'food', 'food', 120),
  ('Can I choose pickup instead of delivery?', 'Yes. You can choose pickup where available. Delivery or pickup depends on shop availability, and the shopkeeper will confirm on WhatsApp.', 'food', 'food', 130),
  ('Can local food shops register for free?', 'Yes. Local cafes, Chinese corners, momo shops, bakeries, juice shops, snack shops and small food businesses can register for free in the MVP.', 'food', 'food', 140),
  ('Is online payment required?', 'No. LocalKart does not force online payment in the MVP. Payment and confirmation happen directly between customer and shopkeeper.', 'food', 'food', 150)
on conflict do nothing;

insert into public.pages (slug, title, meta_title, meta_description, content, is_published)
values
  ('food', 'Nearby Cafe & Food Shops', 'Nearby Cafe & Food Shops on WhatsApp | Local Food Ordering', 'Find nearby cafes, Chinese shops, momo stalls, bakeries, juice shops and local food places. Send your order directly on WhatsApp.', 'Nearby cafe, Chinese corner aur local food shops se direct WhatsApp par order karein. Delivery or pickup depends on shop availability. Shopkeeper will confirm on WhatsApp.', true)
on conflict (slug) do update set
  title = excluded.title,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  content = excluded.content,
  is_published = excluded.is_published;

insert into public.app_config (key, value, description, is_public)
values
  ('food_tagline', '"Nearby cafe, Chinese corner aur local food shops se direct WhatsApp par order karein."', 'Food landing tagline', true),
  ('food_disclaimer', '"Delivery or pickup depends on shop availability. Shopkeeper will confirm on WhatsApp."', 'Food order disclaimer', true)
on conflict (key) do update set
  value = excluded.value,
  description = excluded.description,
  is_public = excluded.is_public;
