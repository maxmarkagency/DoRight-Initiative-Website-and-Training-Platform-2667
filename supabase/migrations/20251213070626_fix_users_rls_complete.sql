/*
  # Complete Fix for Users RLS Policies
  
  1. Problem
    - Previous migration removed "Users can read own profile" policy
    - Users cannot read their own profile data
    - Admin check only uses JWT metadata, not users table role
    
  2. Security Changes
    - Add policy for users to read their own profile
    - Add policy for users to update their own profile  
    - Update admin policies to also check users.role column
    
  3. Notes
    - Self-read/update policies use auth.uid() = id check
    - Admin policies check BOTH JWT metadata AND users.role column
    - This provides fallback if app_metadata is not set
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Admins can read all profiles" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admins can delete profiles" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admins can read all profiles (check JWT metadata OR users.role column)
CREATE POLICY "Admins can read all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
      AND u.id != users.id
    )
  );

-- Users can insert own profile during registration
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON users FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
      AND u.id != users.id
    )
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
      AND u.id != users.id
    )
  );

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON users FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  );
