/*
  # Fix Users Schema and Add Helper Functions

  1. Schema Changes
    - Add `full_name` generated column to users table (combines first_name and last_name)
    - Ensure all necessary columns exist

  2. Helper Functions
    - Create `is_admin()` function to check if current user is an admin
    - This is used in RLS policies for blog_posts and gallery_items

  3. Notes
    - Generated column automatically updates when first_name or last_name changes
    - is_admin() function works with Supabase auth context
*/

-- Add full_name as a generated column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.users
    ADD COLUMN full_name text GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED;
  END IF;
END $$;

-- Create is_admin helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- Create helper function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role::text = required_role
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.has_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(text) TO anon;

-- Create helper function to get current user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role::text FROM public.users
    WHERE id = auth.uid()
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;

-- Add index on full_name for search performance
CREATE INDEX IF NOT EXISTS idx_users_full_name ON public.users USING gin(to_tsvector('english', full_name));
