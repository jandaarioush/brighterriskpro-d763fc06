-- Create dashboards table to store user dashboards
CREATE TABLE public.dashboards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('futuros', 'acoes', 'internacional')),
  icon text DEFAULT 'LayoutDashboard',
  config jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own dashboards" ON public.dashboards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own dashboards" ON public.dashboards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dashboards" ON public.dashboards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own dashboards" ON public.dashboards FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON public.dashboards FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create stock_trades table for Ações/Internacional
CREATE TABLE public.stock_trades (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dashboard_id uuid NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
  trade_date date NOT NULL,
  ticker text NOT NULL,
  modalidade text NOT NULL CHECK (modalidade IN ('daytrade', 'swing')),
  preco_entrada numeric NOT NULL,
  preco_saida numeric NOT NULL,
  quantidade integer NOT NULL,
  alavancagem numeric NOT NULL DEFAULT 1,
  resultado_reais numeric NOT NULL,
  resultado_percentual numeric NOT NULL,
  corretagem numeric DEFAULT 0,
  capital_utilizado numeric NOT NULL,
  risco_percentual numeric NOT NULL,
  setup_utilizado text,
  tag text,
  nota_disciplina integer CHECK (nota_disciplina >= 1 AND nota_disciplina <= 5),
  notes text,
  screenshot_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stock_trades ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own stock_trades" ON public.stock_trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own stock_trades" ON public.stock_trades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stock_trades" ON public.stock_trades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stock_trades" ON public.stock_trades FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_stock_trades_updated_at BEFORE UPDATE ON public.stock_trades FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create portfolios table
CREATE TABLE public.portfolios (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dashboard_id uuid NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
  name text NOT NULL,
  capital_inicial numeric NOT NULL DEFAULT 0,
  capital_atual numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own portfolios" ON public.portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own portfolios" ON public.portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolios" ON public.portfolios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own portfolios" ON public.portfolios FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON public.portfolios FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create portfolio_entries table
CREATE TABLE public.portfolio_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id uuid NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  ticker text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('compra', 'venda')),
  quantidade integer NOT NULL,
  preco numeric NOT NULL,
  valor_total numeric NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own portfolio_entries" ON public.portfolio_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own portfolio_entries" ON public.portfolio_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolio_entries" ON public.portfolio_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own portfolio_entries" ON public.portfolio_entries FOR DELETE USING (auth.uid() = user_id);

-- Add monthly_risk column to dashboards for dashboard-specific risk
ALTER TABLE public.dashboards ADD COLUMN monthly_risk numeric DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX idx_dashboards_user_id ON public.dashboards(user_id);
CREATE INDEX idx_stock_trades_user_id ON public.stock_trades(user_id);
CREATE INDEX idx_stock_trades_dashboard_id ON public.stock_trades(dashboard_id);
CREATE INDEX idx_stock_trades_trade_date ON public.stock_trades(trade_date);
CREATE INDEX idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX idx_portfolios_dashboard_id ON public.portfolios(dashboard_id);
CREATE INDEX idx_portfolio_entries_portfolio_id ON public.portfolio_entries(portfolio_id);
CREATE INDEX idx_portfolio_entries_entry_date ON public.portfolio_entries(entry_date);