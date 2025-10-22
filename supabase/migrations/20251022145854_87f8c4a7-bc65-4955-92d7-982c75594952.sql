-- Remove foreign key constraint to allow profiles before auth users exist
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
    END IF;
END $$;

-- Add unique constraint on email to prevent duplicates
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- Now insert the missing profile
INSERT INTO public.profiles (id, email, name, phone, plano, status_pagamento, kiwify_order_id, last_paid_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'fapperes2025@gmail.com',
  'FATIMA PERES',
  '+5511976761241',
  'Brighter Risk Pro Mensal',
  'approved',
  'dfbac38e-1ed5-4789-b547-88fdd2be2fe4',
  '2025-10-22 11:14:00',
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE 
SET 
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  plano = EXCLUDED.plano,
  status_pagamento = EXCLUDED.status_pagamento,
  kiwify_order_id = EXCLUDED.kiwify_order_id,
  last_paid_at = EXCLUDED.last_paid_at,
  updated_at = now();