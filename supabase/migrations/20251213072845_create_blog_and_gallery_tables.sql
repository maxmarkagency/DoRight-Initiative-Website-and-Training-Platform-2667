/*
  # Create Blog Posts and Gallery Tables

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `slug` (text, unique)
      - `content` (text)
      - `excerpt` (text)
      - `featured_image_url` (text)
      - `author_id` (uuid, references users)
      - `status` (text: draft, published, archived)
      - `tags` (text array)
      - `published_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `gallery_items`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text)
      - `media_url` (text, required)
      - `thumbnail_url` (text)
      - `media_type` (text: image, video)
      - `category` (text)
      - `is_featured` (boolean)
      - `position_order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public can read published blog posts and all gallery items
    - Admins can manage all content
*/

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  excerpt text,
  featured_image_url text,
  author_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  tags text[] DEFAULT '{}',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gallery_items table
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  media_url text NOT NULL,
  thumbnail_url text,
  media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  category text,
  is_featured boolean DEFAULT false,
  position_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Blog Posts Policies

-- Anyone can read published posts
CREATE POLICY "Anyone can read published blog posts"
  ON public.blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Admins can read all posts
CREATE POLICY "Admins can read all blog posts"
  ON public.blog_posts
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can insert posts
CREATE POLICY "Admins can create blog posts"
  ON public.blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update posts
CREATE POLICY "Admins can update blog posts"
  ON public.blog_posts
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete posts
CREATE POLICY "Admins can delete blog posts"
  ON public.blog_posts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Gallery Items Policies

-- Anyone can read gallery items
CREATE POLICY "Anyone can read gallery items"
  ON public.gallery_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admins can insert gallery items
CREATE POLICY "Admins can create gallery items"
  ON public.gallery_items
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update gallery items
CREATE POLICY "Admins can update gallery items"
  ON public.gallery_items
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete gallery items
CREATE POLICY "Admins can delete gallery items"
  ON public.gallery_items
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON public.gallery_items(category);
CREATE INDEX IF NOT EXISTS idx_gallery_items_position ON public.gallery_items(position_order);