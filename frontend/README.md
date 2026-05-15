# LocalKart Frontend

LocalKart is a Vite + React + TypeScript marketplace for nearby tiffin services, cloud kitchens, home food providers, kirana shops and local food shops. Customers discover providers by GPS or manual location and send simple WhatsApp enquiries or orders.

## Local Setup

```bash
npm install
npm run dev
```

Create `frontend/.env.local` from `.env.example`.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SITE_URL=https://localkart-nine.vercel.app
VITE_APP_NAME=LocalKart
VITE_REVERSE_GEOCODING_PROVIDER=nominatim
```

Do not put Supabase service-role keys or other secrets in frontend env files.

## Location

The app uses `navigator.geolocation` on HTTPS, including Vercel. If permission is granted, lat/lng are stored and used for nearby search. If reverse geocoding is enabled with `VITE_REVERSE_GEOCODING_PROVIDER=nominatim`, the header also shows area, city, state and pincode when available. If GPS is denied, customers can enter city, area or pincode manually; the selected location is persisted in `localStorage`.

Set `VITE_REVERSE_GEOCODING_PROVIDER=none` to skip address lookup while keeping GPS coordinates.

## Supabase

Run the SQL migrations in order from `database/`. The tiffin/location migration is:

```text
database/006_tiffin_services_location.sql
```

It adds the `tiffin` business type, location indexes, meal-plan metadata and a compatible `nearby_businesses` RPC. Existing legacy `salon` rows remain readable as tiffin providers during migration.

Required public tables include `businesses`, `food_items`, `products`, `whatsapp_booking_leads`, `whatsapp_order_leads` and `whatsapp_food_order_leads`.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

## Deploy To Vercel

Use:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: the `VITE_*` values above

No payment gateway is required. Tiffin enquiries and food/kirana orders are sent directly through WhatsApp, with Supabase lead capture used when configured.
