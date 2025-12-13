/*
  # Fix Users RLS Policies
  
  1. Security Changes
    - Drop existing recursive admin policy
    - Create new admin policy using JWT metadata instead of table query
    - This avoids circular dependency when checking admin status
    
  2. Notes
    - Uses auth.jwt() to check app_metadata.role for admin access
    - This is more efficient and avoids the recursive query issue
*/

-- Drop all existing policies to recreate them properly
DROP POLICY IF EXISTS "Admins can read all profiles" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admins can delete profiles" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;

-- Create new admin policy using JWT metadata
CREATE POLICY "Admins can read all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Add insert policy for new user registration
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add delete policy for admins
CREATE POLICY "Admins can delete profiles"
  ON users FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Add update policy for admins to update any profile
CREATE POLICY "Admins can update all profiles"
  ON users FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
