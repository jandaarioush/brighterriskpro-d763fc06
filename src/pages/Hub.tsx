import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp, Globe, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';

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
    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    iconColor: 'text-blue-500',
  },
  acoes: {
    label: 'Ações',
    description: 'Daytrade e Swing Trade de Ações',
    icon: TrendingUp,
    color: 'from-green-500/20 to-green-600/10 border-green-500/30',
    iconColor: 'text-green-500',
  },
  internacional: {
    label: 'Mercado Internacional',
    description: 'Forex, Cripto e outros ativos',
    icon: Globe,
    color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
    iconColor: 'text-orange-500',
  },
};

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-montserrat">
            Olá, {profile?.name?.split(' ')[0] || 'Trader'}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Escolha um dashboard para começar a gestão de risco
          </p>
        </div>

        {/* Dashboards Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold font-montserrat mb-6">Meus Dashboards</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((dashboard) => {
              const typeInfo = dashboardTypeInfo[dashboard.type];
              const IconComponent = typeInfo.icon;

              return (
                <Card
                  key={dashboard.id}
                  className={`p-6 bg-gradient-to-br ${typeInfo.color} hover:shadow-lg transition-all cursor-pointer group`}
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
