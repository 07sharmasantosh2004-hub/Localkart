# Production Checklist

## Environment

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_URL`
- `VITE_APP_NAME`
- Edge secrets: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SITE_URL`

## Supabase

- Run migrations `001` through `005`.
- Confirm PostGIS is enabled.
- Confirm RLS is enabled on all public tables.
- Confirm storage buckets exist and public write is disabled.
- Confirm Auth redirect URLs include production domain and local dev URL.
- Create first admin with SQL after signup.

## App Checks

- Public pages show only approved businesses.
- Pending/rejected/blocked shops do not appear publicly.
- Owner dashboard shows only owned business data.
- Admin dashboard rejects non-admin users.
- Salon, kirana, and food leads save before WhatsApp opens.
- Dynamic ad slots read from Supabase.
- CMS pages and FAQs render from database where configured.

## SEO/Ads

- Update `frontend/public/sitemap.xml`.
- Verify `robots.txt`.
- Verify `ads.txt` and `app-ads.txt` before enabling production ad providers.
- Set canonical URLs in CMS pages.

## Operations

- Enable Supabase backups.
- Monitor Edge Function logs.
- Monitor auth errors and RLS-denied requests.
- Keep a documented rollback point before schema migrations.
- Test restore from backup before launch.
