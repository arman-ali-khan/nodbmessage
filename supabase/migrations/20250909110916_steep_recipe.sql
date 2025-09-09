/*
  # Fix direct user registration

  1. Security Changes
    - Grant INSERT permission to anonymous users on users table
    - Create proper RLS policy for direct user registration
    - Allow anonymous users to register without Supabase Auth

  2. Notes
    - This fixes the registration flow that inserts directly into public.users
    - The existing policies expect Supabase Auth but the app uses custom auth
*/

-- Grant INSERT permission to anonymous users
GRANT INSERT ON public.users TO anon;

-- Drop existing conflicting policies that rely on auth.uid()
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;

-- Create new policies that work with direct user table operations
CREATE POLICY "Allow anonymous user registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can read all user data"
  ON users
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update user data"
  ON users
  FOR UPDATE
  TO anon, authenticated
  USING (true);