-- Fix security issues from previous migration

-- Update functions to have proper search_path
CREATE OR REPLACE FUNCTION public.check_webhook_processed(p_order_id text, p_event text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.webhook_events
    WHERE order_id = p_order_id 
    AND event = p_event 
    AND status = 'processed'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.log_audit(p_actor text, p_action text, p_meta jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (actor, action, meta)
  VALUES (p_actor, p_action, p_meta)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Note: webhook_events and audit_logs are intentionally left without RLS policies
-- They will only be accessible via edge functions (server-side) and admin pages
-- No direct client access is allowed