/*
  # Create Programs, Team Members, and Site Settings Tables

  These tables were referenced by `src/pages/admin/ContentManagement.jsx` and
  `src/pages/admin/Settings.jsx` but never actually created on the live database
  (confirmed via direct query: PGRST205 "table not found" for all three). Unlike
  `pages`/`page_sections`, these tables have no relationship to the page registry,
  so they're unaffected by the schema-drift reconciliation done in the previous
  migration and can be created fresh here.

  1. New Tables
    - `programs` — the four program cards shown on the Programs page
    - `team_members` — About page team roster
    - `site_settings` — key/value site configuration (site name, contact info, social links)

  2. Security
    - Public can read active/all rows; only admins (`public.is_admin()`) can write
*/

CREATE TABLE IF NOT EXISTS public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  description text,
  icon text DEFAULT 'FiTarget',
  image_url text,
  features text[] DEFAULT '{}',
  position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active programs" ON public.programs;
CREATE POLICY "Anyone can view active programs"
  ON public.programs FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage programs" ON public.programs;
CREATE POLICY "Admins can manage programs"
  ON public.programs FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  bio text,
  image_url text,
  email text,
  social_links jsonb DEFAULT '{}',
  position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active team members" ON public.team_members;
CREATE POLICY "Anyone can view active team members"
  ON public.team_members FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;
CREATE POLICY "Admins can manage team members"
  ON public.team_members FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb DEFAULT '{}',
  setting_type text DEFAULT 'text',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;
CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description) VALUES
  ('site_name', '"Doing Right Awareness Initiative"', 'text', 'The name of the organization'),
  ('site_tagline', '"Building a Nigeria That Does Right"', 'text', 'Site tagline/slogan'),
  ('contact_email', '"info@doright.ng"', 'text', 'Primary contact email'),
  ('contact_phone', '""', 'text', 'Primary contact phone'),
  ('contact_address', '"Lagos, Nigeria"', 'text', 'Organization address'),
  ('social_links', '{"facebook": "", "twitter": "", "instagram": "", "linkedin": "", "youtube": ""}', 'json', 'Social media links'),
  ('footer_text', '"Empowering citizens for a more accountable Nigeria"', 'text', 'Footer description text'),
  ('allow_registration', 'true', 'boolean', 'Whether new user registration is open'),
  ('maintenance_mode', 'false', 'boolean', 'Whether the site is in maintenance mode')
ON CONFLICT (setting_key) DO NOTHING;
