/*
# Seed Default Users

This migration creates default user accounts for testing and initial setup.

1. Default Accounts Created:
   - Admin: admin@doright.ng
   - Instructor: instructor@doright.ng  
   - Student: student@doright.ng

2. Security:
   - Passwords are set via Supabase Auth
   - User profiles are created in the users table
   - All accounts are active and email verified

Note: In production, change these passwords immediately!
*/

-- Insert default users into users table
-- These will be linked to Supabase Auth users created separately

-- Note: The actual user creation with passwords must be done through Supabase Auth
-- This migration only ensures the users table has the correct profile data

-- First, let's create a function to safely insert user profiles
CREATE OR REPLACE FUNCTION create_user_profile(
  p_id UUID,
  p_email TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_role user_role
) RETURNS VOID AS $$
BEGIN
  INSERT INTO users (id, email, first_name, last_name, role, is_active, is_email_verified, created_at, updated_at)
  VALUES (p_id, p_email, p_first_name, p_last_name, p_role, true, true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    is_email_verified = EXCLUDED.is_email_verified,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The actual Supabase Auth users must be created through the Supabase Dashboard or Admin API
-- with these credentials:
-- 
-- Admin User:
--   Email: admin@doright.ng
--   Password: AdminPassword123!
--
-- Instructor User:
--   Email: instructor@doright.ng
--   Password: InstructorPassword123!
--
-- Student User:
--   Email: student@doright.ng
--   Password: StudentPassword123!

-- This SQL file serves as documentation for the default accounts
-- The actual user creation is handled by the backend seed script