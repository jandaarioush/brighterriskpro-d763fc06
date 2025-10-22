-- Allow unauthenticated users to check if email exists in profiles
-- This is necessary for the first access flow where users verify their purchase email
CREATE POLICY "Allow email lookup for first access"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);