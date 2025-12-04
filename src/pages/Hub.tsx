import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, TrendingUp, Globe, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import logoHorizontal from "@/assets/logo-brighter.png";

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [newDashboardType, setNewDashboardType] = useState<'futuros' | 'acoes' | 'internacional'>('futuros');
  const [creating, setCreating] = useState(false);
  const { user, profile, signOut } = useAuth();
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

      // If user has no dashboards, create default Futuros dashboard
      if (!data || data.length === 0) {
        await createDefaultDashboard();
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

  const createDefaultDashboard = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('monthly_risk')
        .eq('id', user?.id)
        .single();

      const { data, error } = await supabase
        .from('dashboards')
        .insert({
          user_id: user?.id,
          name: 'Futuros',
          type: 'futuros',
          icon: 'BarChart3',
          monthly_risk: profileData?.monthly_risk || 0,
        })
        .select()
        .single();

      if (error) throw error;
      setDashboards([data as Dashboard]);
    } catch (error) {
      console.error('Error creating default dashboard:', error);
    }
  };

  const createDashboard = async () => {
    if (!newDashboardName.trim()) {
      toast.error('Digite um nome para o dashboard');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('dashboards')
        .insert({
          user_id: user?.id,
          name: newDashboardName,
          type: newDashboardType,
          icon: dashboardTypeInfo[newDashboardType].icon.name || 'BarChart3',
        })
        .select()
        .single();

      if (error) throw error;

      setDashboards([...dashboards, data as Dashboard]);
      setShowCreateDialog(false);
      setNewDashboardName('');
      toast.success('Dashboard criado com sucesso!');
    } catch (error) {
      console.error('Error creating dashboard:', error);
      toast.error('Erro ao criar dashboard');
    } finally {
      setCreating(false);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img src={logoHorizontal} alt="Brighter" className="h-8" />
              <span className="ml-3 font-montserrat font-bold text-xl">Risk Pro</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {profile?.name || user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold font-montserrat">Meus Dashboards</h2>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Dashboard
            </Button>
          </div>

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

            {/* Create New Dashboard Card */}
            <Card
              className="p-6 border-dashed border-2 hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px] group"
              onClick={() => setShowCreateDialog(true)}
            >
              <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors mb-3">
                <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                Criar Novo Dashboard
              </p>
            </Card>
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

      {/* Create Dashboard Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Dashboard</DialogTitle>
            <DialogDescription>
              Escolha o tipo de dashboard e dê um nome para ele.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Dashboard Type Selection */}
            <div className="space-y-3">
              <Label>Tipo de Dashboard</Label>
              <div className="grid grid-cols-1 gap-3">
                {(Object.entries(dashboardTypeInfo) as [keyof typeof dashboardTypeInfo, typeof dashboardTypeInfo.futuros][]).map(([type, info]) => {
                  const IconComponent = info.icon;
                  return (
                    <Card
                      key={type}
                      className={`p-4 cursor-pointer transition-all ${
                        newDashboardType === type
                          ? `bg-gradient-to-br ${info.color} ring-2 ring-primary`
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => {
                        setNewDashboardType(type);
                        if (!newDashboardName) {
                          setNewDashboardName(info.label);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-5 h-5 ${info.iconColor}`} />
                        <div>
                          <p className="font-medium">{info.label}</p>
                          <p className="text-xs text-muted-foreground">{info.description}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Dashboard Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Dashboard</Label>
              <Input
                id="name"
                value={newDashboardName}
                onChange={(e) => setNewDashboardName(e.target.value)}
                placeholder="Ex: Minha Carteira de Ações"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={createDashboard} disabled={creating}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Criar Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
