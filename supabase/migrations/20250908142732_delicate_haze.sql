@@ .. @@
 -- Users policies
 CREATE POLICY "Users can read own data"
   ON users
   FOR SELECT
   TO authenticated
   USING (auth.uid() = id);
 
+CREATE POLICY "Allow user registration"
+  ON users
+  FOR INSERT
+  TO anon
+  WITH CHECK (true);
+
 CREATE POLICY "Users can update own data"