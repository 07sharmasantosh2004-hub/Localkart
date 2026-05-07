# LocalKart Launch Checklist

## Customer Flow Testing

- Open `/` on mobile and desktop.
- Allow browser location and verify salon/kirana listings still render.
- Deny browser location and verify manual city/area fallback works.
- Check home CTAs: Find Salon, Order Kirana, Register Shop.
- Confirm no copy promises guaranteed lowest price, free delivery, or instant delivery.

## Salon WhatsApp Booking Testing

- Open `/salons`.
- Search by salon name and service.
- Filter by distance, open now, and service category.
- Open `/salons/:slug`.
- Submit booking with missing fields and verify validation.
- Submit valid booking and verify:
  - `whatsapp_booking_leads` insert is attempted.
  - WhatsApp opens with the correct prefilled message.
  - If Supabase insert fails, non-blocking warning is shown and WhatsApp still opens.

## Kirana WhatsApp Order Testing

- Open `/kirana`.
- Search by shop name or grocery item.
- Filter by distance, delivery available, and open now.
- Open `/kirana/:slug`.
- Select listed products and quantities.
- Test manual grocery list option.
- Submit valid order and verify:
  - `whatsapp_order_leads` insert is attempted.
  - WhatsApp opens with the correct prefilled message.
  - Copy says shopkeeper will confirm on WhatsApp.
  - Copy says delivery depends on shop availability.

## Shop Registration Testing

- Open `/register-shop`.
- Try submission while logged out and verify login/ownership message.
- Login as an owner/customer.
- Use browser GPS and manual lat/lng.
- Upload logo and cover image.
- Submit listing and verify:
  - Profile is updated to owner.
  - Business is created with `status = pending`.
  - Public listing does not appear until admin approval.

## Admin Approval Testing

- Login as `profile.role = admin`.
- Open `/admin`.
- Verify dashboard metrics load.
- Approve, reject, block, edit, feature/unfeature a test business.
- Verify each admin action writes to `admin_audit_logs`.
- Verify only approved businesses appear publicly.

## SEO Testing

- Check every public page has title, meta description, canonical, Open Graph tags, and Twitter card tags.
- Validate JSON-LD for LocalBusiness, BeautySalon, GroceryStore, FAQPage, and BreadcrumbList.
- Open `/sitemap.xml`.
- Open `/robots.txt`.
- Test city and area pages:
  - `/salon-booking/bengaluru`
  - `/kirana-delivery/bengaluru`
  - `/salon-booking/bengaluru/indiranagar`
  - `/kirana-delivery/bengaluru/indiranagar`

## PWA Testing

- Open Chrome DevTools Lighthouse PWA checks.
- Verify manifest loads at `/manifest.json`.
- Verify service worker registration.
- Verify offline fallback page.
- Test Android install prompt.
- Test iOS Safari Add to Home Screen tags.

## Mobile Responsive Testing

- Test 360px, 390px, 430px, tablet, and desktop widths.
- Verify sticky bottom CTAs do not cover form fields.
- Verify admin tables scroll horizontally on mobile.
- Verify no text overflows buttons/cards.

## RLS/Security Testing

- Confirm frontend uses only `VITE_SUPABASE_ANON_KEY`.
- Confirm no service role key is present in frontend env.
- Confirm public can read only approved public content.
- Confirm owners can edit only their own businesses.
- Confirm admin routes require `profile.role = admin`.
- Confirm admin actions still rely on Supabase RLS.

## Ad Placeholder Testing

- Open pages with `DynamicAdSlot`.
- Confirm ads do not break layout when disabled.
- Confirm development placeholder appears in local dev.
- Replace `ads.txt` and `app-ads.txt` only after ad network approval.
- Confirm production ad IDs are not hardcoded in source code.

## Deployment Checklist

- Set Cloudflare Pages root directory to `frontend`.
- Build command: `npm run build`.
- Output directory: `dist`.
- Add env vars:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_SITE_URL`
  - `VITE_APP_NAME`
- Add Supabase auth redirect URLs.
- Configure custom domain.
- Submit sitemap to Google Search Console.
- Run final:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - `npm run build`
