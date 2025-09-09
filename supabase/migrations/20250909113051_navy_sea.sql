@@ .. @@
-- Create new comprehensive policies for chat_rooms
CREATE POLICY "Enable all operations for chat_rooms"
  ON chat_rooms
  FOR ALL
-  TO anon, authenticated
+  TO public
  USING (true)
  WITH CHECK (true);

-- Create new comprehensive policies for room_participants
CREATE POLICY "Enable all operations for room_participants"
  ON room_participants
  FOR ALL
-  TO anon, authenticated
+  TO public
  USING (true)
  WITH CHECK (true);

@@ .. @@
CREATE POLICY "Enable all operations for users"
  ON users
  FOR ALL
-  TO anon, authenticated
+  TO public
  USING (true)
  WITH CHECK (true);