-- Remove the overly permissive SELECT policy that exposes all user data publicly
-- The existing policy "Users can view own profile" provides secure access for authenticated users
DROP POLICY IF EXISTS "Allow email lookup for first access" ON public.profiles;