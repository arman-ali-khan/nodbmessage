/*
  # Fix room creation RLS policies

  1. Security Changes
    - Drop existing policies that rely on auth.uid() (which doesn't work with custom auth)
    - Create new policies that allow authenticated users to create and manage rooms
    - Grant necessary permissions to anon role for room operations

  2. Notes
    - This fixes room creation for applications using custom authentication
    - Policies are updated to work with direct database operations
*/

-- Grant necessary permissions to anonymous users for room operations
GRANT INSERT, SELECT, UPDATE ON public.chat_rooms TO anon;
GRANT INSERT, SELECT, DELETE ON public.room_participants TO anon;

-- Drop existing conflicting policies for chat_rooms
DROP POLICY IF EXISTS "Users can read rooms they participate in" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Room creators can update their rooms" ON chat_rooms;

-- Drop existing conflicting policies for room_participants
DROP POLICY IF EXISTS "Users can read room participants for rooms they're in" ON room_participants;
DROP POLICY IF EXISTS "Users can join rooms" ON room_participants;
DROP POLICY IF EXISTS "Users can leave rooms" ON room_participants;

-- Create new policies for chat_rooms that work with custom auth
CREATE POLICY "Allow room creation"
  ON chat_rooms
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow room reading"
  ON chat_rooms
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow room updates"
  ON chat_rooms
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Create new policies for room_participants that work with custom auth
CREATE POLICY "Allow participant insertion"
  ON room_participants
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow participant reading"
  ON room_participants
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow participant deletion"
  ON room_participants
  FOR DELETE
  TO anon, authenticated
  USING (true);