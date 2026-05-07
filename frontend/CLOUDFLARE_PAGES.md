# LocalKart Cloudflare Pages Deployment

## Build Settings

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `frontend`
- Node version: 20+

## Required Environment Variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SITE_URL=https://localkart.in
VITE_APP_NAME=LocalKart
```

Never add a Supabase service role key to Cloudflare Pages frontend variables.

## SPA Redirects

`public/_redirects` sends all app routes to `index.html`:

```txt
/* /index.html 200
```

## Supabase Auth Redirect URLs

In Supabase Dashboard, add:

- `https://localkart.in`
- `https://localkart.in/login`
- Cloudflare preview URL, if preview auth testing is needed

## Custom Domain

After connecting the Cloudflare Pages project:

1. Add `localkart.in` or your chosen domain in Pages custom domains.
2. Set `VITE_SITE_URL` to the final HTTPS URL.
3. Regenerate sitemap before deploy with `npm run sitemap`.
4. Submit `/sitemap.xml` in Google Search Console.

## Ad Files

`ads.txt` and `app-ads.txt` are placeholders. Replace publisher IDs only after AdSense/AdMob approval.
