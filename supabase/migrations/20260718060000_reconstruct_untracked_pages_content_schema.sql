/*
  # Reconstruct Untracked Pages/Content Schema

  Between 2025-12-30 and 2026-01-07, five migrations were applied directly against
  the live database (likely via the Supabase Dashboard SQL editor) that were never
  saved as files in this repo. `supabase migration list` showed them as remote-only
  versions (20260107094627, 20260107102615, 20260107125230, 20260107125430,
  20260107155817) with no local counterpart, and their tracking entries have been
  reverted via `supabase migration repair` since their real content was unknown.

  This file is a **best-effort reconstruction** of the tables they created, written
  by directly inspecting the live schema (sample rows via the anon key, since Docker
  was unavailable for `supabase db pull`/`db dump` and no service_role key was used).
  Column types, nullability, and defaults are inferred from observed data and are
  not guaranteed byte-for-byte identical to the original DDL. RLS write policies
  follow this codebase's established `public.is_admin()` pattern (see
  `20260107101011_fix_users_schema_and_helpers.sql`) since they could not be observed
  via anon-key reads.

  All statements are idempotent (`IF NOT EXISTS` / `ON CONFLICT DO NOTHING`) and are
  no-ops against the current live database where these objects already exist. This
  migration exists to bring the drift into version control, not to modify production.

  Row-level CMS content (the actual text in `page_sections`/`content_blocks`/
  `content_versions`/`content_permissions`) is NOT reproduced here — only the 12
  `pages` registry rows are seeded, since those are small and structural. Take a
  full logical backup via the Supabase Dashboard before relying on this file to
  rebuild an environment from scratch.

  Tables (as observed live):
    - `pages` — page registry (slug, title, SEO meta)
    - `page_sections` — content blocks per page (page_id FK, content_data jsonb)
    - `content_blocks` — finer-grained editable blocks within a section
    - `content_versions` — revision history for content_blocks
    - `content_permissions` — per-user, per-page write/publish/delete grants
*/

-- ============================================================================
-- pages
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text,
  description text,
  meta_title text,
  meta_description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active pages" ON public.pages;
CREATE POLICY "Anyone can view active pages"
  ON public.pages FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage pages" ON public.pages;
CREATE POLICY "Admins can manage pages"
  ON public.pages FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- page_sections
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES public.pages(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  section_name text,
  section_type text NOT NULL DEFAULT 'content',
  position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  title text,
  subtitle text,
  content text,
  content_data jsonb DEFAULT '{}',
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (page_id, section_key)
);

ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active sections" ON public.page_sections;
CREATE POLICY "Anyone can view active sections"
  ON public.page_sections FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage sections" ON public.page_sections;
CREATE POLICY "Admins can manage sections"
  ON public.page_sections FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- content_blocks
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES public.page_sections(id) ON DELETE CASCADE,
  block_key text NOT NULL,
  block_type text NOT NULL DEFAULT 'text',
  content jsonb DEFAULT '{}',
  position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active blocks" ON public.content_blocks;
CREATE POLICY "Anyone can view active blocks"
  ON public.content_blocks FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage blocks" ON public.content_blocks;
CREATE POLICY "Admins can manage blocks"
  ON public.content_blocks FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- content_versions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid REFERENCES public.content_blocks(id) ON DELETE CASCADE,
  content jsonb,
  version_number integer NOT NULL DEFAULT 1,
  change_description text,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view content versions" ON public.content_versions;
DROP POLICY IF EXISTS "Admins view content versions" ON public.content_versions;
CREATE POLICY "Admins view content versions"
  ON public.content_versions FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage content versions" ON public.content_versions;
CREATE POLICY "Admins can manage content versions"
  ON public.content_versions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- content_permissions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.content_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  page_id uuid REFERENCES public.pages(id) ON DELETE CASCADE,
  permission_type text NOT NULL CHECK (permission_type IN ('write', 'publish', 'delete')),
  granted_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.content_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view content permissions" ON public.content_permissions;
DROP POLICY IF EXISTS "Users see own permissions, admins see all" ON public.content_permissions;
CREATE POLICY "Users see own permissions, admins see all"
  ON public.content_permissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage content permissions" ON public.content_permissions;
CREATE POLICY "Admins can manage content permissions"
  ON public.content_permissions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- Seed: the 12 page registry rows observed live (structural only)
-- ============================================================================

INSERT INTO public.pages (id, slug, title, description) VALUES
  ('c127b5c8-d9d1-4da6-a421-26a94df60653', 'home', 'Home', 'Main landing page'),
  ('b824f5ec-d1ca-4461-85cc-1239ba12d958', 'about', 'About Us', 'About Doing Right Awareness Initiative'),
  ('6a665d0c-a09a-40e3-8210-7958a9d7bc37', 'programs', 'Programs', 'Our programs and initiatives'),
  ('ec32137c-7c27-4018-ac1e-ddfcb16daa8f', 'training', 'Training', 'Online training courses'),
  ('41b28e50-440f-4fec-90ae-913d27b09685', 'contact', 'Contact', 'Contact information'),
  ('e64ad4a7-74c2-427d-a4f8-a76ce86a7452', 'blog', 'Blog', 'News and articles'),
  ('ea904a6a-285b-42ad-a405-ae430cbc4008', 'gallery', 'Gallery', 'Photo gallery'),
  ('6abd83bc-344f-4e10-b147-8191228d6a22', 'events', 'Events', 'Upcoming events'),
  ('cf603b10-4128-4e95-b751-edccebf76048', 'join', 'Join Us', 'Get involved'),
  ('636cd250-aed5-443f-abc7-4ae80d52e666', 'donate', 'Donate', 'Support our cause'),
  ('d9032afe-b8d4-46fe-88fc-11dd24c187ef', 'webinars', 'Webinars', 'Join our live events and access recorded sessions'),
  ('76ece7fe-c1e8-4676-84b2-f68af99e2885', 'trustees', 'Trustees', 'Meet our Board of Trustees')
ON CONFLICT (id) DO NOTHING;
