-- Add new columns to trades table
ALTER TABLE public.trades
ADD COLUMN setup_utilizado TEXT,
ADD COLUMN tag TEXT,
ADD COLUMN nota_disciplina INTEGER CHECK (nota_disciplina >= 0 AND nota_disciplina <= 10),
ADD COLUMN screenshot_url TEXT;