import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp, Globe, ArrowRight, Loader2, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';
import MarketSessionsClock from '@/components/MarketSessionsClock';

interface Dashboard {
  id: string;
  name: string;
  type: 'futuros' | 'acoes' | 'internacional';
  icon: string;
  monthly_risk: number | null;
  created_at: string;
}

const dashboardTypeInfo = {
  futuros: {
    label: 'Futuros',
    description: 'Mini Índice e Mini Dólar',
    icon: BarChart3,
    gradient: 'from-blue-500/10 to-blue-600/5 dark:from-blue-500/15 dark:to-blue-600/5',
    borderGlow: 'hover:border-blue-500/30 hover:shadow-[0_0_20px_hsl(220_80%_60%/0.1)]',
    iconColor: 'text-blue-500',
    dotColor: 'bg-blue-500',
  },
  acoes: {
    label: 'Ações',
    description: 'Daytrade e Swing Trade de Ações',
    icon: TrendingUp,
    gradient: 'from-success/10 to-success/5 dark:from-success/15 dark:to-success/5',
    borderGlow: 'hover:border-success/30 hover:shadow-[0_0_20px_hsl(152_82%_45%/0.1)]',
    iconColor: 'text-success',
    dotColor: 'bg-success',
  },
  internacional: {
    label: 'Mercado Internacional',
    description: 'Forex, Cripto e outros ativos',
    icon: Globe,
    gradient: 'from-primary/10 to-primary/5 dark:from-primary/15 dark:to-primary/5',
    borderGlow: 'hover:border-primary/30 hover:shadow-[0_0_20px_hsl(43_85%_52%/0.1)]',
    iconColor: 'text-primary',
    dotColor: 'bg-primary',
  },
};

// Daily insight based on time of day
function getDailyInsight(): string {
  const hour = new Date().getHours();
  if (hour >= 9 && hour < 12) return 'Mercados abertos — foco e disciplina no operacional.';
  if (hour >= 12 && hour < 14) return 'Horário de almoço — liquidez reduzida, cuidado com slippage.';
  if (hour >= 14 && hour < 17) return 'Sessão da tarde ativa — oportunidades em sobreposição de mercados.';
  if (hour >= 17 && hour < 20) return 'B3 encerrada — acompanhe mercados internacionais.';
  return 'Mercados fechados — hora de revisão e planejamento.';
}

// Hero Section
function HeroSection({
  totalMonthlyRisk,
  totalRiskUsed,
}: {
  totalMonthlyRisk: number;
  totalRiskUsed: number;
}) {
  const riskAvailable = Math.max(0, totalMonthlyRisk - totalRiskUsed);
  const riskPercent = totalMonthlyRisk > 0 ? (totalRiskUsed / totalMonthlyRisk) * 100 : 0;

  const getStatus = () => {
    if (riskPercent >= 90) return { label: 'Limite crítico', color: 'text-danger' };
    if (riskPercent >= 60) return { label: 'Acelerado', color: 'text-primary' };
    if (riskPercent >= 30) return { label: 'Ritmo saudável', color: 'text-success' };
    return { label: 'Início do mês', color: 'text-muted-foreground' };
  };

  const status = getStatus();

  return (
    <section className="mb-8 hero-enter">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
        Controle total do seu risco.
      </h1>
      {totalMonthlyRisk > 0 ? (
        <div className="space-y-3 hero-enter-delay-1">
          <p className="text-muted-foreground text-lg">
            Você ainda tem{' '}
            <span className="font-mono-trading font-semibold text-primary">
              R$ {riskAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>{' '}
            disponíveis este mês
          </p>
          <div className="max-w-lg">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-muted-foreground">
                Risco utilizado:{' '}
                <span className="font-mono-trading font-medium text-foreground">
                  {riskPercent.toFixed(1)}%
                </span>
              </span>
              <span className={`font-medium ${status.color}`}>{status.label}</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary progress-glow transition-all duration-700"
                style={{ width: `${Math.min(riskPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-lg hero-enter-delay-1">
          Configure seu risco mensal para começar a gestão
        </p>
      )}
    </section>
  );
}

export default function Hub() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRiskUsed, setTotalRiskUsed] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadDashboards();
    }
  }, [user]);

  const loadDashboards = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        await createDefaultDashboards();
      } else {
        setDashboards(data as Dashboard[]);
        // Load accumulated risk used from trades this month
        loadTotalRiskUsed();
      }
    } catch (error) {
      console.error('Error loading dashboards:', error);
      toast.error('Erro ao carregar dashboards');
    } finally {
      setLoading(false);
    }
  };

  const loadTotalRiskUsed = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const { data: trades } = await supabase
        .from('trades')
        .select('result_reais')
        .eq('user_id', user?.id)
        .gte('trade_date', startOfMonth)
        .lte('trade_date', endOfMonth);

      const totalLoss = (trades || [])
        .filter(t => t.result_reais < 0)
        .reduce((sum, t) => sum + Math.abs(t.result_reais), 0);
      setTotalRiskUsed(totalLoss);
    } catch (e) {
      console.error('Error loading risk used:', e);
    }
  };

  const createDefaultDashboards = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('monthly_risk')
        .eq('id', user?.id)
        .single();

      const defaultDashboards = [
        { name: 'Futuros', type: 'futuros', icon: 'BarChart3' },
        { name: 'Ações', type: 'acoes', icon: 'TrendingUp' },
        { name: 'Mercado Internacional', type: 'internacional', icon: 'Globe' },
      ];

      const { data, error } = await supabase
        .from('dashboards')
        .insert(
          defaultDashboards.map(d => ({
            user_id: user?.id,
            name: d.name,
            type: d.type,
            icon: d.icon,
            monthly_risk: profileData?.monthly_risk || 0,
          }))
        )
        .select();

      if (error) throw error;
      setDashboards(data as Dashboard[]);
    } catch (error) {
      console.error('Error creating default dashboards:', error);
    }
  };

  const handleDashboardClick = (dashboard: Dashboard) => {
    if (dashboard.type === 'futuros') {
      navigate('/dashboard');
    } else if (dashboard.type === 'internacional') {
      navigate(`/international-dashboard/${dashboard.id}`);
    } else {
      navigate(`/dashboard/${dashboard.id}`);
    }
  };

  const totalMonthlyRisk = dashboards.reduce((sum, d) => sum + (d.monthly_risk || 0), 0);

  if (loading) {
    return (
      <DashboardLayoutWrapper>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayoutWrapper>
    );
  }

  return (
    <DashboardLayoutWrapper>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Hero */}
        <HeroSection totalMonthlyRisk={totalMonthlyRisk} totalRiskUsed={totalRiskUsed} />

        {/* Dashboard Cards */}
        <div className="mb-8 hero-enter-delay-2">
          <h2 className="text-xl font-semibold mb-5 tracking-tight">Meus Dashboards</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {dashboards.map((dashboard) => {
              const typeInfo = dashboardTypeInfo[dashboard.type];
              const IconComponent = typeInfo.icon;
              const riskValue = dashboard.monthly_risk || 0;

              return (
                <Card
                  key={dashboard.id}
                  className={`relative overflow-hidden p-6 bg-gradient-to-br ${typeInfo.gradient}
                    border border-border/50 backdrop-blur-sm
                    hover:scale-[1.02] ${typeInfo.borderGlow}
                    transition-all duration-200 cursor-pointer group`}
                  onClick={() => handleDashboardClick(dashboard)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-lg bg-background/60 ${typeInfo.iconColor}`}>
                      <IconComponent className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{dashboard.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{typeInfo.description}</p>

                  {riskValue > 0 && (
                    <div className="space-y-1 pt-3 border-t border-border/30">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Risco Mensal</span>
                        <span className="font-mono-trading font-semibold text-foreground">
                          R$ {riskValue.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Daily Insight */}
        <div className="mb-8 hero-enter-delay-3">
          <Card className="card-glow card-glow-primary p-5 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-0.5">
                Leitura do Dia
              </p>
              <p className="text-sm font-medium text-foreground">{getDailyInsight()}</p>
            </div>
          </Card>
        </div>

        {/* Market Sessions Clock */}
        <div className="mb-8 hero-enter-delay-4">
          <MarketSessionsClock />
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
