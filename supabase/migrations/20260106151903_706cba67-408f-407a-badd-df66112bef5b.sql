-- Add explicit RESTRICTIVE policy to deny all anonymous access as defense-in-depth
-- This is an additional security layer on top of the existing owner-only policy

CREATE POLICY "Block all anonymous access"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- Also add admin read access for admin panel functionality
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));