# DoRight Foundation LMS

A Learning Management System and organizational website built with React and Supabase.

## Architecture

This is a **frontend-only application**. There is no custom backend server — the React app
talks directly to Supabase for everything:

- **Database**: Postgres, managed by Supabase
- **Auth**: Supabase Auth (`supabase.auth.*`), used in `src/context/AuthContext.jsx`
- **Data access**: Direct `supabase.from(...)` queries from pages and context providers
  (e.g. `src/pages/admin/BlogManagement.jsx`, `src/pages/admin/GalleryManagement.jsx`,
  `src/context/TrainingContext.jsx`)
- **File storage**: Supabase Storage, bucket `media-library`, used directly by
  `src/components/admin/MediaUpload.jsx` and `src/pages/admin/MediaManagement.jsx`
- **Access control**: Row Level Security (RLS) policies on every table — there is no
  application-level authorization layer, RLS is the authorization layer

There used to be an Express backend (`backend/`) and a cPanel deployment pipeline. Both have
been deleted; the frontend already called Supabase directly for every live feature, so removing
them changed nothing at runtime.

The app is a single Vite-built static site deployed to **Vercel**. Routing uses `HashRouter`
(URLs look like `/#/courses`), so no server-side rewrite rules are needed for client-side routes.

## Prerequisites

- Node.js 18+ and npm
- A Supabase project (free tier works)
- (Optional) the [Supabase CLI](https://supabase.com/docs/guides/cli), for applying migrations from the command line

## Local Development

```bash
git clone <repository-url>
cd doright-lms
npm install
```

Create a `.env` file in the project root (copy `.env.example` and fill in your own project's
values):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Then start the dev server:

```bash
npm run dev
```

Open `http://localhost:5173`.

For setting up a fresh Supabase project and database, see **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**
and **[DATABASE_SETUP.md](./DATABASE_SETUP.md)**.

## Database Schema Changes

The schema lives in `supabase/migrations/` and is tracked by the Supabase CLI — there is no
in-app migration runner or setup script. To apply schema changes:

- **Preferred**: `supabase db push` (after `supabase link`-ing to your project), or
- **Manual**: paste each migration file's contents into the Supabase Studio SQL Editor, in
  filename (timestamp) order

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for the full walkthrough.

## Available Scripts

```bash
npm run dev       # Start the Vite dev server
npm run build     # Production build to dist/
npm run preview   # Preview the production build locally
```

## Project Structure

```text
doright-lms/
├── supabase/
│   └── migrations/      # CLI-tracked schema (the source of truth for the database)
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components (incl. src/pages/admin/*)
│   ├── context/         # React context (auth, training data)
│   ├── lib/supabase.js  # Supabase client
│   └── services/        # Frontend service helpers
├── README.md
├── SETUP_GUIDE.md
├── DATABASE_SETUP.md
├── TROUBLESHOOTING.md
├── UPLOAD_SYSTEM.md
└── CMS_DOCUMENTATION.md
```

## Deployment

The site deploys to Vercel as a static Vite build (`npm run build` → `dist/`). Set
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in the Vercel project
settings (for both Production and Preview). See `.env.production.example` for the full set of
variables the built app expects at runtime.

## Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** — local dev setup, step by step
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** — applying the schema to a Supabase project
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** — common Supabase/RLS issues
- **[UPLOAD_SYSTEM.md](./UPLOAD_SYSTEM.md)** — media upload via Supabase Storage
- **[CMS_DOCUMENTATION.md](./CMS_DOCUMENTATION.md)** — content tables and admin CRUD

## Note on Test Coverage

This repository does not currently have an automated test suite (no Jest/Vitest/Playwright
configured). Verification is manual: run `npm run dev` and exercise the flow you changed in the
browser.

## License

MIT License — see LICENSE file for details.
