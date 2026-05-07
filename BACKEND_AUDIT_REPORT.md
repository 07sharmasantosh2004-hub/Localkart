# Backend Audit Report

## Tables Created Or Hardened

Existing foundation tables are in `database/001_initial_schema.sql` and food additions are in `database/003_food_section.sql`.

`database/004_production_hardening.sql` adds compatibility and production hardening. `database/005_lead_status_defaults.sql` applies lead defaults after the new enum value is committed.

- Profiles status and admin safety.
- Address compatibility fields.
- Business pickup, SEO, weekly closed day, and email fields.
- Business photo/hour compatibility fields.
- Unified category `type`/`icon` fields.
- Salon service gender/sort order.
- Product selling price and stock status.
- Review status/user compatibility.
- Favorite user compatibility.
- Pages, FAQs, reports, support tickets, audit log compatibility.
- Lead status and lead payload compatibility.
- Storage buckets for avatars, business photos, product images, food images, banners, and page assets.

## Functions

Added or updated:

- `handle_new_user()`
- `update_updated_at_column()`
- `set_updated_at()`
- `is_admin()`
- `owns_business(uuid)`
- `business_is_approved(uuid)`
- `nearby_businesses(user_lat, user_lng, radius_km, business_type)`
- `update_business_rating()`
- `slugify(text)`
- `generate_unique_business_slug(text)`
- `prevent_profile_privilege_self_update()`

## RLS Summary

RLS is enabled in the foundation migration for public tables. The hardening migration tightens:

- Active, unblocked admins only.
- Active, unblocked owners only.
- Profile role/status self-edit prevention.
- Review published/hidden compatibility.
- Favorites and support ticket ownership compatibility.

## Edge Functions

Created:

- `create-whatsapp-booking-lead`
- `create-whatsapp-order-lead`
- `create-whatsapp-food-lead`
- `admin-approve-business`
- `admin-update-featured`
- `ad-config`

These functions use `SUPABASE_SERVICE_ROLE_KEY` only server-side.

## Frontend Security Notes

Removed the local Vite-env admin bypass. `/admin-login` now requires a real Supabase Auth session and an active admin profile.

## Commands Run

- Repository/source inspection with PowerShell and `rg`.
- File patches for SQL, Edge Functions, Supabase auth, business hooks, detail pages, and docs.

Validation commands and results:

```bash
cd frontend
npm run typecheck # passed
npm run lint      # passed
npm test          # passed, 1 file / 3 tests
npm run build     # passed, sitemap generated with 85 URLs
```

## Remaining Limitations

- Supabase SQL must be run against the real project to fully validate RLS behavior.
- Edge Functions need deployment and secret configuration before frontend can call them.
- Some admin UI sections reuse existing tables and design, but deeper UX polish should remain separate from backend hardening.
