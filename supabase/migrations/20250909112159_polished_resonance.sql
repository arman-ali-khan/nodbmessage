@@ .. @@
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
 
+-- Grant schema usage permissions to anon role
+GRANT USAGE ON SCHEMA public TO anon;
+
 -- Grant necessary permissions to anonymous users for room operations