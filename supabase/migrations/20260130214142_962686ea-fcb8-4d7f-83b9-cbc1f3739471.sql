-- Create international_trades table for international market trading
CREATE TABLE IF NOT EXISTS public.international_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dashboard_id UUID NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
  trade_date DATE NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  trade_type VARCHAR(10) NOT NULL DEFAULT 'long',
  contracts INTEGER NOT NULL DEFAULT 1,
  entry_price DECIMAL(18,6) NOT NULL,
  exit_price DECIMAL(18,6) NOT NULL,
  tick_size DECIMAL(18,6) NOT NULL,
  tick_value DECIMAL(18,4) NOT NULL,
  commission DECIMAL(10,2) DEFAULT 0,
  exchange_rate DECIMAL(10,4) NOT NULL,
  resultado_usd DECIMAL(18,2) NOT NULL,
  resultado_brl DECIMAL(18,2) NOT NULL,
  resultado_percentual DECIMAL(10,4) NOT NULL,
  margin_used DECIMAL(18,2) NOT NULL,
  risco_percentual DECIMAL(5,2) NOT NULL DEFAULT 8,
  setup_utilizado VARCHAR(50),
  tag VARCHAR(50),
  nota_disciplina INTEGER,
  notes TEXT,
  screenshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.international_trades ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own international trades"
  ON public.international_trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own international trades"
  ON public.international_trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own international trades"
  ON public.international_trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own international trades"
  ON public.international_trades FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_international_trades_updated_at
  BEFORE UPDATE ON public.international_trades
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_international_trades_user_id ON public.international_trades(user_id);
CREATE INDEX idx_international_trades_dashboard_id ON public.international_trades(dashboard_id);
CREATE INDEX idx_international_trades_trade_date ON public.international_trades(trade_date);