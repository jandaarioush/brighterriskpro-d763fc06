
-- 1. Admin-only SELECT policies for sensitive server-managed tables
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view webhook events"
ON public.webhook_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view password reset codes"
ON public.password_reset_codes FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view pending orders"
ON public.pending_orders FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Allow admins to manage orders and subscriptions (defense-in-depth, no client paths today)
CREATE POLICY "Admins can manage orders"
ON public.orders FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage subscriptions"
ON public.subscriptions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Let users read their own roles (avoids privilege-escalation ambiguity)
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 4. Tighten demo_leads insert: basic validation instead of always-true
DROP POLICY IF EXISTS "Anyone can insert demo leads" ON public.demo_leads;
CREATE POLICY "Anyone can insert demo leads"
ON public.demo_leads FOR INSERT TO anon, authenticated
WITH CHECK (
  email IS NOT NULL AND length(email) BETWEEN 3 AND 255
  AND name IS NOT NULL AND length(name) BETWEEN 1 AND 200
  AND whatsapp IS NOT NULL AND length(whatsapp) BETWEEN 5 AND 50
);

-- 5. Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated (they're only used internally / via service role)
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_reset_codes() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.log_audit(text, text, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.check_webhook_processed(text, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.assign_default_role() FROM anon, authenticated, public;
-- has_role is used by RLS policies; keep it executable for authenticated users (called via RLS context)

-- 6. Storage: harden videos bucket
DROP POLICY IF EXISTS "Temporary public upload for videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete videos" ON storage.objects;

-- Only admins can upload/delete videos
CREATE POLICY "Admins can upload videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update videos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete videos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can read individual video files (direct path), not list bucket
CREATE POLICY "Authenticated can read videos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'videos');

-- Clean up duplicate trade-screenshot policies
DROP POLICY IF EXISTS "Users can delete their own screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own screenshots" ON storage.objects;
