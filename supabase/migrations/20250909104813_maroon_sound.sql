@@ .. @@
 -- Drop existing policy if it exists
 DROP POLICY IF EXISTS "Allow user registration" ON users;
 
+-- Grant INSERT permission to anonymous users
+GRANT INSERT ON public.users TO anon;
+
 -- Create a new policy that allows anonymous users to register
 CREATE POLICY "Allow user registration"