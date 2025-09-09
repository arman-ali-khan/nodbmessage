/*
  # Fix user registration permissions

  1. Security Changes
    - Grant INSERT permission to anonymous users on users table
    - Ensure RLS policy allows user registration
    - This fixes the "new row violates row-level security policy" error

  2. Notes
    - Anonymous users need both GRANT permissions and RLS policy to register
    - This migration ensures both are properly configured
*/

-- Grant INSERT permission to anonymous users
GRANT INSERT ON public.users TO anon;

-- Drop and recreate the registration policy to ensure it's properly configured
DROP POLICY IF EXISTS "Allow user registration" ON users;

CREATE POLICY "Allow user registration"
  ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);