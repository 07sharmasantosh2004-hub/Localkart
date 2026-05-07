# LocalKart Frontend (PWA)

## Tech Stack
- React + Vite + TypeScript
- Tailwind CSS v4
- shadcn/ui
- React Router
- TanStack Query
- Supabase JS

## Running locally

```bash
npm install
npm run dev
```

Make sure to create a `.env.local` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment to Cloudflare Pages

1. **Push your code to GitHub/GitLab.**
2. Go to the **Cloudflare Dashboard** -> **Pages** -> **Create a project** -> **Connect to Git**.
3. Select your repository.
4. In the **Build settings**, configure the following:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Expand **Environment variables (advanced)** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Save and Deploy**. Cloudflare Pages will automatically build and deploy your PWA to its global edge network!
