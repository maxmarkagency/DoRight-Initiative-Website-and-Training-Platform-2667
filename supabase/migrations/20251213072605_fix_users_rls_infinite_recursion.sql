/*
  # Fix Users Table RLS Infinite Recursion

  1. Problem
    - The current RLS policies on the users table cause infinite recursion
    - Admin policies query the users table to check admin status, which triggers RLS again
    - This prevents users from fetching their own profile data

  2. Solution
    - Create a SECURITY DEFINER function to safely check admin status without triggering RLS
    - Replace problematic policies with simpler, non-recursive versions
    - Users can always read their own profile
    - Admins can read all profiles (checked via secure function)

  3. Changes
    - Drop all existing users policies
    - Create is_admin() helper function with SECURITY DEFINER
    - Create new simplified policies that don't cause recursion
*/

-- Create a secure function to check if current user is admin
-- SECURITY DEFINER runs with the privileges of the function owner, bypassing RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.users;

-- Create new non-recursive policies

-- SELECT: Users can read their own profile OR admins can read all
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- INSERT: Users can only insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- UPDATE: Admins can update any profile
CREATE POLICY "Admins can update all profiles"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE: Only admins can delete profiles (not their own)
CREATE POLICY "Admins can delete profiles"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (public.is_admin() AND auth.uid() != id);