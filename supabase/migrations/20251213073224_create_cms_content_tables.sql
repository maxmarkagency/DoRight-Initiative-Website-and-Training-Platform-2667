/*
  # Create CMS Content Tables

  1. New Tables
    - `page_sections`
      - `id` (uuid, primary key)
      - `page_key` (text: home, about, programs, events, contact, trustees)
      - `section_key` (text: hero, stats, about, programs, etc.)
      - `section_type` (text: hero, grid, text, cta, etc.)
      - `title` (text)
      - `subtitle` (text)
      - `content` (text - main body text)
      - `content_data` (jsonb - structured data like arrays, stats)
      - `image_url` (text)
      - `position` (integer - ordering)
      - `is_visible` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `programs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `subtitle` (text)
      - `description` (text)
      - `icon` (text - icon name)
      - `image_url` (text)
      - `features` (text[] - array of features)
      - `position` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `team_members`
      - `id` (uuid, primary key)
      - `name` (text)
      - `role` (text)
      - `bio` (text)
      - `image_url` (text)
      - `email` (text)
      - `social_links` (jsonb)
      - `position` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `event_date` (timestamptz)
      - `end_date` (timestamptz)
      - `location` (text)
      - `image_url` (text)
      - `event_type` (text: webinar, workshop, conference)
      - `registration_url` (text)
      - `is_featured` (boolean)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `site_settings`
      - `id` (uuid, primary key)
      - `setting_key` (text, unique)
      - `setting_value` (jsonb)
      - `setting_type` (text: text, image, json, number)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public can read visible/active content
    - Admins can manage all content
*/

-- Create page_sections table
CREATE TABLE IF NOT EXISTS public.page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  section_key text NOT NULL,
  section_type text NOT NULL DEFAULT 'text',
  title text,
  subtitle text,
  content text,
  content_data jsonb DEFAULT '{}',
  image_url text,
  position integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page_key, section_key)
);

-- Create programs table
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

-- Create team_members table
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

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date timestamptz,
  end_date timestamptz,
  location text,
  image_url text,
  event_type text DEFAULT 'event',
  registration_url text,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb DEFAULT '{}',
  setting_type text DEFAULT 'text',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Page Sections Policies
CREATE POLICY "Anyone can read visible page sections"
  ON public.page_sections FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

CREATE POLICY "Admins can read all page sections"
  ON public.page_sections FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert page sections"
  ON public.page_sections FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update page sections"
  ON public.page_sections FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete page sections"
  ON public.page_sections FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Programs Policies
CREATE POLICY "Anyone can read active programs"
  ON public.programs FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can read all programs"
  ON public.programs FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert programs"
  ON public.programs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update programs"
  ON public.programs FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete programs"
  ON public.programs FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Team Members Policies
CREATE POLICY "Anyone can read active team members"
  ON public.team_members FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can read all team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert team members"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update team members"
  ON public.team_members FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete team members"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Events Policies
CREATE POLICY "Anyone can read active events"
  ON public.events FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can read all events"
  ON public.events FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Site Settings Policies
CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete site settings"
  ON public.site_settings FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_sections_page ON public.page_sections(page_key);
CREATE INDEX IF NOT EXISTS idx_page_sections_visible ON public.page_sections(is_visible);
CREATE INDEX IF NOT EXISTS idx_programs_active ON public.programs(is_active);
CREATE INDEX IF NOT EXISTS idx_team_members_active ON public.team_members(is_active);
CREATE INDEX IF NOT EXISTS idx_events_active ON public.events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(setting_key);