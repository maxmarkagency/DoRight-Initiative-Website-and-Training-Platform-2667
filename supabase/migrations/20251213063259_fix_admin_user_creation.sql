/*
  # Fix Admin User Creation

  This migration properly recreates the admin user with correct authentication setup.

  1. Removes existing admin user if present
  2. Creates admin user using Supabase's proper auth setup
  3. Ensures all required tables are properly linked

  Note: After this migration, use these credentials:
  - Email: admin@doright.ng
  - Password: AdminPassword123!
*/

-- First, clean up any existing admin user
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the admin user ID if it exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@doright.ng';

  IF admin_user_id IS NOT NULL THEN
    -- Delete from public.users first (due to foreign key)
    DELETE FROM public.users WHERE id = admin_user_id;
    
    -- Delete from auth.identities
    DELETE FROM auth.identities WHERE user_id = admin_user_id;
    
    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = admin_user_id;
    
    RAISE NOTICE 'Existing admin user removed';
  END IF;
END $$;

-- Now create the admin user properly
-- We'll create it using the email/password provider with proper password hashing
DO $$
DECLARE
  admin_user_id uuid;
  hashed_password text;
BEGIN
  -- Generate UUID for admin user
  admin_user_id := gen_random_uuid();
  
  -- Hash the password using crypt with bcrypt
  -- Supabase uses bcrypt for password hashing
  hashed_password := crypt('AdminPassword123!', gen_salt('bf'));

  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    recovery_sent_at,
    email_change_sent_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    last_sign_in_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_user_id,
    'authenticated',
    'authenticated',
    'admin@doright.ng',
    hashed_password,
    now(),
    now(),
    now(),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'role', 'admin'),
    jsonb_build_object('first_name', 'Admin', 'last_name', 'User', 'role', 'admin'),
    false,
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- Insert into auth.identities (required for email/password auth)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    admin_user_id,
    jsonb_build_object(
      'sub', admin_user_id::text,
      'email', 'admin@doright.ng',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    admin_user_id::text,
    now(),
    now(),
    now()
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

  RAISE NOTICE 'Admin user created successfully!';
  RAISE NOTICE 'Email: admin@doright.ng';
  RAISE NOTICE 'Password: AdminPassword123!';
END $$;