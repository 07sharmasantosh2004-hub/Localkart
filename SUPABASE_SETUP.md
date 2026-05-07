# Supabase Setup

## 1. Create Project And Env

Create a Supabase project, then set frontend variables in `frontend/.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=https://localkart.in
VITE_APP_NAME=LocalKart
```

Set Edge Function secrets:

```bash
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set SITE_URL=https://localkart.in
```

Never put `SUPABASE_SERVICE_ROLE_KEY` in the frontend.

## 2. Run SQL

Run these in order in the Supabase SQL editor or with the CLI:

```bash
database/001_initial_schema.sql
database/002_add_food_business_type.sql
database/003_food_section.sql
database/004_production_hardening.sql
database/005_lead_status_defaults.sql
```

The migrations enable `pgcrypto` and `postgis`, create tables, RLS policies, storage buckets, seed categories, ads, pages, FAQs, and app config.

## 3. Storage Buckets

Buckets created by SQL:

- `avatars`
- `business-photos`
- `product-images`
- `food-images`
- `banners`
- `page-assets`

All buckets are public-read image buckets. Writes require authenticated users or admin policies depending on bucket.

## 4. Deploy Edge Functions

```bash
supabase functions deploy create-whatsapp-booking-lead
supabase functions deploy create-whatsapp-order-lead
supabase functions deploy create-whatsapp-food-lead
supabase functions deploy admin-approve-business
supabase functions deploy admin-update-featured
supabase functions deploy ad-config
```

## 5. Create First Admin

Sign up normally once, copy the user UUID from `auth.users`, then run:

```sql
update public.profiles
set role = 'admin', status = 'active', is_blocked = false
where id = 'USER_UUID';
```

There is no public admin registration route.

## 6. Verify

Check:

- RLS is enabled on public tables.
- Pending and blocked businesses are hidden from public pages.
- Owners can only see their own business data and leads.
- Admin routes require a real Supabase admin profile.
- Leads are saved before WhatsApp redirect.
