-- Add payment status fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status_pagamento text DEFAULT 'pending' CHECK (status_pagamento IN ('pending', 'approved', 'revoked')),
ADD COLUMN IF NOT EXISTS plano text,
ADD COLUMN IF NOT EXISTS kiwify_order_id text,
ADD COLUMN IF NOT EXISTS kiwify_customer_id text,
ADD COLUMN IF NOT EXISTS last_paid_at timestamp with time zone;

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_status_pagamento ON public.profiles(status_pagamento);
CREATE INDEX IF NOT EXISTS idx_profiles_kiwify_order_id ON public.profiles(kiwify_order_id);

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'kiwify',
  event text NOT NULL,
  order_id text,
  email text,
  raw_payload jsonb NOT NULL,
  processed_at timestamp with time zone,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'skipped', 'failed')),
  error text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for webhook_events
CREATE INDEX IF NOT EXISTS idx_webhook_events_order_id ON public.webhook_events(order_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_email ON public.webhook_events(email);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON public.webhook_events(created_at DESC);

-- Enable RLS on webhook_events (admin only access)
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor text NOT NULL,
  action text NOT NULL,
  meta jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor);

-- Enable RLS on audit_logs (admin only access)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create function to check if webhook was already processed
CREATE OR REPLACE FUNCTION public.check_webhook_processed(p_order_id text, p_event text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit(p_actor text, p_action text, p_meta jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
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