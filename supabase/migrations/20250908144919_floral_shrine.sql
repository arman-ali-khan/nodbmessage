/*
  # Fix user registration RLS policy

  1. Security Changes
    - Drop existing registration policy if it exists
    - Create a new policy that properly allows anonymous user registration
    - Ensure the policy allows INSERT operations for anonymous users

  2. Notes
    - This fixes the "new row violates row-level security policy" error
    - Anonymous users need INSERT permission to register new accounts
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow user registration" ON users;

-- Create a new policy that allows anonymous users to register
CREATE POLICY "Allow user registration"
  ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);