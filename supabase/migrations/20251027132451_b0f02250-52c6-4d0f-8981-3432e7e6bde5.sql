-- Create demo_leads table to store form submissions
CREATE TABLE public.demo_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.demo_leads ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (anyone can submit the form)
CREATE POLICY "Anyone can insert demo leads"
ON public.demo_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view leads
CREATE POLICY "Admins can view all leads"
ON public.demo_leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for better performance
CREATE INDEX idx_demo_leads_created_at ON public.demo_leads(created_at DESC);
CREATE INDEX idx_demo_leads_email ON public.demo_leads(email);