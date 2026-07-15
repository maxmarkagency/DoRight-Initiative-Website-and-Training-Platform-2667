# Local Development Setup Guide

This is a frontend-only React + Vite app that talks directly to Supabase. There is no backend
server to install or run.

## Prerequisites

- **Node.js 18+** and npm ([Download](https://nodejs.org/))
- A **Supabase account** ([Sign up free](https://supabase.com))
- A code editor (VS Code recommended)

## Step 1: Create a Supabase Project

1. Go to the [Supabase Dashboard](https://app.supabase.com)
2. Click **New Project**
3. Fill in a name, a database password (save it somewhere — you likely won't need it directly,
   but it's your project's Postgres superuser password), and a region
4. Click **Create new project** and wait for it to finish provisioning (~2 minutes)

## Step 2: Get Your Supabase Credentials

In your project dashboard, go to **Settings → API**. You need two values:

- **Project URL** — `https://xxxxxxxxxxxxx.supabase.co`
- **anon public key** — under "Project API keys" → "anon public"

You do **not** need the `service_role` key for this app — the frontend only ever uses the anon
key, and Row Level Security (RLS) is what protects your data. Never put the `service_role` key in
frontend code or commit it anywhere.

## Step 3: Clone and Install

```bash
git clone <repository-url>
cd doright-lms
npm install
```

## Step 4: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

## Step 5: Apply the Database Schema

Follow **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** to apply the migrations in
`supabase/migrations/` to your new project (via `supabase db push` or the Studio SQL Editor).

## Step 6: Create an Account and Grant Admin Access

There's no seed script. Sign up through the app's normal registration flow, then follow
[DATABASE_SETUP.md's "Creating Admin / Staff Accounts"](./DATABASE_SETUP.md#creating-admin--staff-accounts)
to give that account the `admin` role in the `public.users` table.

## Step 7: Start the Application

```bash
npm run dev
```

Open `http://localhost:5173`.

## Step 8: Verify

- The app loads and public pages render.
- You can log in with the account you created in Step 6.
- If you granted it the admin role, the Admin Dashboard is reachable and its pages (Blog
  Management, Gallery Management, Media Management, Content Management, etc.) load data.
- In Supabase Dashboard → **Database** → **Tables**, you should see tables like `users`,
  `courses`, `enrollments`, `blog_posts`, `gallery_items`, `pages`, `page_sections`.

## Troubleshooting

- **"Could not find the table..."** — migrations haven't been applied yet. See
  [DATABASE_SETUP.md](./DATABASE_SETUP.md).
- **"Invalid login credentials"** — the account doesn't exist yet, or (if email confirmation is
  enabled in Authentication → Providers → Email) hasn't confirmed its email.
- **Data loads for admin but not for a regular user, or vice versa** — check RLS policies for the
  table in Supabase Dashboard → Database → Tables → *table* → Policies.

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more.

## Next Steps

- Read [README.md](./README.md) for the overall architecture
- Read [CMS_DOCUMENTATION.md](./CMS_DOCUMENTATION.md) for the content tables
- Read [UPLOAD_SYSTEM.md](./UPLOAD_SYSTEM.md) for how media uploads work
