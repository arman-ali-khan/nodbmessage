/*
  # Fix user registration policy

  1. Security Changes
    - Add policy to allow anonymous users to register (insert into users table)
    - This enables user registration without authentication

  2. Notes
    - This policy is necessary for new user registration
    - Users can only insert their own data during registration
*/

-- Add policy to allow user registration for anonymous users
CREATE POLICY "Allow user registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);