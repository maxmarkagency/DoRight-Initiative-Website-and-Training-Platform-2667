/*
  # Enhance Events and Create Webinars Tables

  1. New Tables
    - `webinars`
      - `id` (uuid, primary key) - Unique identifier
      - `title` (text) - Webinar title
      - `description` (text) - Detailed description
      - `presenter` (text) - Name of the presenter/speaker
      - `date` (timestamptz) - Scheduled date and time
      - `duration_minutes` (integer) - Duration in minutes
      - `meeting_link` (text) - URL for joining the webinar
      - `registration_link` (text) - URL for registration
      - `image_url` (text) - Featured image URL
      - `max_participants` (integer) - Maximum participants
      - `is_published` (boolean) - Whether visible to users
      - `tags` (text[]) - Array of tags
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
  2. Enhanced Tables
    - `events` - Add new columns:
      - `start_date` (timestamptz) - Event start date and time
      - `end_date` (timestamptz) - Event end date and time
      - `event_type` (text) - Type of event
      - `organizer` (text) - Event organizer name
      - `registration_link` (text) - Registration URL
      - `image_url` (text) - Featured image URL
      - `max_attendees` (integer) - Maximum attendees
      - `is_published` (boolean) - Visibility status
      - `tags` (text[]) - Array of tags

  3. Security
    - Enable RLS on webinars table
    - Add policies for public read access to published items
    - Add policies for admin full access
*/

-- Create webinars table
CREATE TABLE IF NOT EXISTS webinars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  presenter text NOT NULL,
  date timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  meeting_link text,
  registration_link text,
  image_url text,
  max_participants integer,
  is_published boolean NOT NULL DEFAULT false,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhance events table with new columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE events ADD COLUMN start_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE events ADD COLUMN end_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'event_type'
  ) THEN
    ALTER TABLE events ADD COLUMN event_type text DEFAULT 'workshop';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'organizer'
  ) THEN
    ALTER TABLE events ADD COLUMN organizer text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'registration_link'
  ) THEN
    ALTER TABLE events ADD COLUMN registration_link text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE events ADD COLUMN image_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'max_attendees'
  ) THEN
    ALTER TABLE events ADD COLUMN max_attendees integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE events ADD COLUMN is_published boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'tags'
  ) THEN
    ALTER TABLE events ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;

-- Enable RLS on webinars
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view published webinars" ON webinars;
DROP POLICY IF EXISTS "Authenticated users can view all webinars" ON webinars;
DROP POLICY IF EXISTS "Admins can insert webinars" ON webinars;
DROP POLICY IF EXISTS "Admins can update webinars" ON webinars;
DROP POLICY IF EXISTS "Admins can delete webinars" ON webinars;

DROP POLICY IF EXISTS "Public can view published events" ON events;
DROP POLICY IF EXISTS "Authenticated users can view all events" ON events;
DROP POLICY IF EXISTS "Admins can insert events" ON events;
DROP POLICY IF EXISTS "Admins can update events" ON events;
DROP POLICY IF EXISTS "Admins can delete events" ON events;

-- Webinar Policies
CREATE POLICY "Public can view published webinars"
  ON webinars FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY "Authenticated users can view all webinars"
  ON webinars FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert webinars"
  ON webinars FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update webinars"
  ON webinars FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete webinars"
  ON webinars FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Event Policies
CREATE POLICY "Public can view published events"
  ON events FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY "Authenticated users can view all events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_webinars_updated_at ON webinars;
CREATE TRIGGER update_webinars_updated_at
  BEFORE UPDATE ON webinars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
