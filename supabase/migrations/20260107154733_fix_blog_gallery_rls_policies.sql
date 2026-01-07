/*
  # Fix Blog and Gallery RLS Policies

  1. Changes
    - Drop existing policies on blog_posts and gallery_items that check auth.users.raw_user_meta_data
    - Create new policies that properly check public.users table for admin role
    - Ensure admins can manage all blog posts and gallery items
    - Public users can view published blog posts and all gallery items

  2. Security
    - Policies properly check the public.users table instead of auth metadata
    - Use the existing is_admin() function for consistency
    - Maintain separation between public read access and admin write access
*/

-- Drop existing policies on blog_posts
DROP POLICY IF EXISTS "Admins and staff can manage blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Published blog posts are viewable by everyone" ON blog_posts;

-- Create new policies for blog_posts
CREATE POLICY "Public can view published blog posts"
  ON blog_posts FOR SELECT
  TO anon
  USING (status = 'published');

CREATE POLICY "Authenticated users can view all blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update blog posts"
  ON blog_posts FOR UPDATE
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

CREATE POLICY "Admins can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Drop existing policies on gallery_items
DROP POLICY IF EXISTS "Admins and staff can manage gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Gallery items are viewable by everyone" ON gallery_items;

-- Create new policies for gallery_items
CREATE POLICY "Public can view all gallery items"
  ON gallery_items FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can view all gallery items"
  ON gallery_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert gallery items"
  ON gallery_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update gallery items"
  ON gallery_items FOR UPDATE
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

CREATE POLICY "Admins can delete gallery items"
  ON gallery_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
