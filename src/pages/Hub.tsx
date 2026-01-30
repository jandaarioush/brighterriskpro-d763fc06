import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp, Globe, ArrowRight, Loader2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';
import { useLocalClock } from '@/hooks/useLocalClock';
import { getGreeting, formatDigitalClock, firstNameFrom } from '@/lib/formatting';
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
    color: 'from-muted to-muted/50 border-border',
    iconColor: 'text-primary',
  },
  acoes: {
    label: 'Ações',
    description: 'Daytrade e Swing Trade de Ações',
    icon: TrendingUp,
    color: 'from-success/10 to-success/5 border-success/30',
    iconColor: 'text-success',
  },
  internacional: {
    label: 'Mercado Internacional',
    description: 'Forex, Cripto e outros ativos',
    icon: Globe,
    color: 'from-primary/10 to-primary/5 border-primary/30',
    iconColor: 'text-primary',
  },
};

// Welcome Section Component
function WelcomeSection({ profile }: { profile: { name?: string | null } | null }) {
  const now = useLocalClock(1000);
  const greeting = getGreeting(now);
  const firstName = firstNameFrom(profile) || 'Trader';
  const clockTime = formatDigitalClock(now);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-4xl font-bold font-montserrat">
          {greeting}, {firstName}! 👋
        </h1>
        <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-border">
          <Clock className="w-5 h-5 text-primary" />
          <span className="text-2xl font-mono font-bold tabular-nums tracking-wide text-foreground">
            {clockTime}
          </span>
        </div>
      </div>
      <p className="text-muted-foreground text-lg">
        Escolha um dashboard para começar a gestão de risco
      </p>
    </div>
  );
}

export default function Hub() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
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
      }
    } catch (error) {
      console.error('Error loading dashboards:', error);
      toast.error('Erro ao carregar dashboards');
    } finally {
      setLoading(false);
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
      <div className="p-8">
        {/* Welcome Section */}
        <WelcomeSection profile={profile} />

        {/* Dashboards Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold font-montserrat mb-6">Meus Dashboards</h2>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {dashboards.map((dashboard) => {
              const typeInfo = dashboardTypeInfo[dashboard.type];
              const IconComponent = typeInfo.icon;

              return (
                <Card
                  key={dashboard.id}
                  className={`flex-1 min-w-0 p-5 bg-gradient-to-br ${typeInfo.color} hover:shadow-lg transition-all cursor-pointer group`}
                  onClick={() => handleDashboardClick(dashboard)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-background/50 ${typeInfo.iconColor}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{dashboard.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{typeInfo.description}</p>
                  {dashboard.monthly_risk && dashboard.monthly_risk > 0 && (
                    <p className="text-sm">
                      Risco Mensal: <span className="font-medium text-primary">R$ {dashboard.monthly_risk.toLocaleString()}</span>
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Market Sessions Clock */}
        <div className="mb-8">
          <MarketSessionsClock />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-sm text-muted-foreground mb-2">Total de Dashboards</h3>
            <p className="text-3xl font-bold">{dashboards.length}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm text-muted-foreground mb-2">Tipos Ativos</h3>
            <p className="text-3xl font-bold">
              {new Set(dashboards.map(d => d.type)).size}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm text-muted-foreground mb-2">Status</h3>
            <p className="text-lg font-medium text-green-500">Ativo</p>
          </Card>
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
