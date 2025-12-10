/*
# Blog and Gallery Migration Script

Execute this SQL in your Supabase SQL Editor to create the necessary tables for blog and gallery management.

Steps to run:
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/jqekzavaerbxjzyeihvv/editor
2. Click "SQL Editor"
3. Copy and paste this entire file
4. Click "Run" button
*/

-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE blog_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gallery_media_type AS ENUM ('image', 'video');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image_url TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status blog_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create gallery_items table
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  media_type gallery_media_type DEFAULT 'image',
  category TEXT,
  position INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON gallery_items(category);
CREATE INDEX IF NOT EXISTS idx_gallery_items_featured ON gallery_items(is_featured);

-- Add trigger for updated_at on blog_posts
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_posts
DROP POLICY IF EXISTS "Published blog posts are viewable by everyone" ON blog_posts;
CREATE POLICY "Published blog posts are viewable by everyone"
ON blog_posts FOR SELECT
USING (status = 'published');

DROP POLICY IF EXISTS "Admins and staff can manage blog posts" ON blog_posts;
CREATE POLICY "Admins and staff can manage blog posts"
ON blog_posts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' IN ('admin', 'staff')
  )
);

-- RLS Policies for gallery_items
DROP POLICY IF EXISTS "Gallery items are viewable by everyone" ON gallery_items;
CREATE POLICY "Gallery items are viewable by everyone"
ON gallery_items FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins and staff can manage gallery items" ON gallery_items;
CREATE POLICY "Admins and staff can manage gallery items"
ON gallery_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' IN ('admin', 'staff')
  )
);

-- Success message
SELECT 'Blog and Gallery tables created successfully!' as result;