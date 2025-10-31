-- Criar tabela para códigos de recuperação de senha
CREATE TABLE IF NOT EXISTS public.password_reset_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  code text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false NOT NULL
);

-- Índice para busca rápida por email e código
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email_code 
ON public.password_reset_codes(email, code) 
WHERE used = false;

-- Índice para limpeza de códigos expirados
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_expires_at 
ON public.password_reset_codes(expires_at);

-- Habilitar RLS (sem policies públicas - apenas para edge functions com service role)
ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Função para limpar códigos expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_codes()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.password_reset_codes 
  WHERE expires_at < now() OR used = true;
END;
$$;