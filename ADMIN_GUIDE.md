# Admin Guide

## Access

Admins sign in at `/admin-login` using Supabase Auth. The user must have:

```sql
profiles.role = 'admin'
profiles.status = 'active'
profiles.is_blocked = false
```

## Daily Workflow

1. Open `/admin`.
2. Review dashboard metrics for pending businesses, leads, support tickets, reports, ads, and featured shops.
3. Open business approvals and approve, reject with reason, or block shops.
4. Mark good shops as featured when needed.
5. Review WhatsApp leads and update status to `seen`, `responded`, `converted`, or `cancelled`.

## Business Management

Use the salon, kirana, and food management sections to search businesses, edit shop data, inspect services/products/menu, view leads, and moderate reviews.

Every approval/status/featured action should create an `admin_audit_logs` row.

## CMS

Manage:

- Categories for salon, kirana, and food.
- Banners by placement, business type, city, area, dates, and active state.
- Ads through `ad_slots` and `ad_units`.
- SEO metadata in pages/SEO sections.
- Static pages such as about, contact, privacy policy, terms, FAQ, cancellation policy, and how-it-works.
- FAQs by page/category and sort order.
- App config such as support phone, support WhatsApp, default city, radius, ads, maintenance mode, and lead capture.

## Leads Export

Use the admin leads table export action where available. If needed, export directly from Supabase table views for:

- `whatsapp_booking_leads`
- `whatsapp_order_leads`
- `whatsapp_food_order_leads`

## Safety Rules

- Do not create admins from the frontend.
- Do not paste service role keys into Vite env files.
- Keep rejected/blocked reasons clear because shop owners may see them.
- Keep production ad IDs inside admin-managed data or server-side config, not source code.
