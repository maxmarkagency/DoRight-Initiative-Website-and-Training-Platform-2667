/*
  # Create Admin User

  This migration creates the default admin user account with email verification enabled.

  1. Creates admin user in auth.users
    - Email: admin@doright.ng
    - Password: AdminPassword123!
    - Email confirmed: true
    - Role: admin (stored in user_metadata)

  2. Creates corresponding profile in public.users table
    - Links to auth.users via foreign key
    - Sets role to 'admin'
    - Marks as active and email verified

  Note: This uses Supabase's auth.users table and the extensions for UUID generation.
*/

-- First, check if the user already exists before attempting to create
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@doright.ng';

  -- Only proceed if user doesn't exist
  IF admin_user_id IS NULL THEN
    -- Generate a new UUID for the admin user
    admin_user_id := gen_random_uuid();

    -- Insert into auth.users (Supabase auth table)
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@doright.ng',
      crypt('AdminPassword123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"],"role":"admin"}',
      '{"first_name":"Admin","last_name":"User","role":"admin"}',
      'authenticated',
      'authenticated',
      now(),
      now(),
      '',
      '',
      ''
    );

    -- Insert into public.users (profile table)
    INSERT INTO public.users (
      id,
      email,
      first_name,
      last_name,
      role,
      is_active,
      is_email_verified,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'admin@doright.ng',
      'Admin',
      'User',
      'admin',
      true,
      true,
      now(),
      now()
    );

    RAISE NOTICE 'Admin user created successfully with email: admin@doright.ng';
  ELSE
    RAISE NOTICE 'Admin user already exists, skipping creation';
  END IF;
END $$;