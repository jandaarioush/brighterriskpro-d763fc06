
-- Restrictive policy on user_roles: only admins can write
CREATE POLICY "Only admins can write roles (restrictive)"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Ensure the admin manage policy has a WITH CHECK clause
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Restrictive policy on subscriptions: only admins can write (service_role bypasses RLS)
CREATE POLICY "Only admins can write subscriptions (restrictive)"
ON public.subscriptions
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
