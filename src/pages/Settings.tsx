import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { BarChart3, TrendingUp, Globe } from 'lucide-react';
import { PhoneInputWithCountry } from '@/components/PhoneInputWithCountry';

const settingsSchema = z.object({
  name: z.string().trim().max(100, 'Nome muito longo').optional(),
  phone: z.string().trim().max(20, 'Telefone inválido').optional(),
  city: z.string().trim().max(100, 'Cidade muito longa').optional(),
  state: z.string().trim().max(2, 'UF deve ter 2 caracteres').optional(),
});

interface Dashboard {
  id: string;
  name: string;
  type: 'futuros' | 'acoes' | 'internacional';
  monthly_risk: number;
  monthly_goal: number | null;
}

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [dashboardRisks, setDashboardRisks] = useState<Record<string, string>>({});
  const [dashboardGoals, setDashboardGoals] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfile();
    loadDashboards();
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('name, phone, city, state')
      .eq('id', user?.id)
      .single();

    if (data) {
      setName(data.name || '');
      setPhone(data.phone || '');
      setCity(data.city || '');
      setState(data.state || '');
    }
  };

  const loadDashboards = async () => {
    const { data } = await supabase
      .from('dashboards')
      .select('id, name, type, monthly_risk, monthly_goal')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: true });

    if (data) {
      setDashboards(data.map(d => ({ ...d, monthly_goal: (d as any).monthly_goal ?? null })) as Dashboard[]);
      const risks: Record<string, string> = {};
      const goals: Record<string, string> = {};
      data.forEach(d => {
        risks[d.id] = d.monthly_risk?.toString() || '';
        goals[d.id] = (d as any).monthly_goal?.toString() || '';
      });
      setDashboardRisks(risks);
      setDashboardGoals(goals);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validationResult = settingsSchema.safeParse({ name, phone, city, state });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          name: name.trim() || null,
          phone: phone.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
        })
        .eq('id', user?.id);

      if (error) throw error;
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDashboardRisk = async (dashboardId: string) => {
    const riskValue = dashboardRisks[dashboardId];
    const numValue = parseFloat(riskValue);
    const dashboard = dashboards.find(d => d.id === dashboardId);

    if (isNaN(numValue) || numValue < 0) {
      toast.error('Valor inválido');
      return;
    }

    try {
      const updateData: any = { monthly_risk: numValue };
      
      // Save goal for futuros dashboards
      if (dashboard?.type === 'futuros') {
        const goalValue = dashboardGoals[dashboardId];
        const numGoal = goalValue ? parseFloat(goalValue) : null;
        if (numGoal !== null && (isNaN(numGoal) || numGoal < 0)) {
          toast.error('Valor de objetivo inválido');
          return;
        }
        updateData.monthly_goal = numGoal;
      }

      const { error } = await supabase
        .from('dashboards')
        .update(updateData)
        .eq('id', dashboardId);

      if (error) throw error;
      toast.success('Configurações atualizadas!');
    } catch (error) {
      toast.error('Erro ao salvar');
    }
  };

  const getDashboardIcon = (type: string) => {
    switch (type) {
      case 'futuros': return BarChart3;
      case 'acoes': return TrendingUp;
      case 'internacional': return Globe;
      default: return BarChart3;
    }
  };

  const getDashboardColor = (type: string) => {
    switch (type) {
      case 'futuros': return 'border-blue-500/30 bg-blue-500/5';
      case 'acoes': return 'border-green-500/30 bg-green-500/5';
      case 'internacional': return 'border-orange-500/30 bg-orange-500/5';
      default: return 'border-border';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 font-montserrat">Configurações</h1>

        <form onSubmit={handleSave} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Configurações da Conta</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ''} disabled className="bg-muted" />
                <p className="text-sm text-muted-foreground mt-1">O email não pode ser alterado</p>
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <PhoneInputWithCountry value={phone} onChange={setPhone} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Sua cidade" />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input id="state" type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="UF" maxLength={2} />
                </div>
              </div>
            </div>
          </Card>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </form>

        {/* Risk Management per Dashboard */}
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold">Gestão de Risco por Dashboard</h2>
          
          {dashboards.map((dashboard) => {
            const Icon = getDashboardIcon(dashboard.type);
            const colorClass = getDashboardColor(dashboard.type);
            const isFuturos = dashboard.type === 'futuros';
            
            return (
              <Card key={dashboard.id} className={`p-6 ${colorClass}`}>
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">{dashboard.name}</h3>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label htmlFor={`risk-${dashboard.id}`}>
                        {isFuturos ? 'Risco Mensal (R$)' : 'Capital Total (R$)'}
                      </Label>
                      <Input
                        id={`risk-${dashboard.id}`}
                        type="number"
                        step="0.01"
                        value={dashboardRisks[dashboard.id] || ''}
                        onChange={(e) => setDashboardRisks(prev => ({ ...prev, [dashboard.id]: e.target.value }))}
                        placeholder={isFuturos ? '5000.00' : '100000.00'}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {isFuturos 
                          ? 'Valor máximo que você pode perder no mês' 
                          : 'Capital total para cálculo de % de risco'}
                      </p>
                    </div>
                    {!isFuturos && (
                      <Button onClick={() => handleSaveDashboardRisk(dashboard.id)} variant="outline">
                        Salvar
                      </Button>
                    )}
                  </div>
                  
                  {isFuturos && (
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`goal-${dashboard.id}`}>
                          Objetivo Mensal (R$)
                        </Label>
                        <Input
                          id={`goal-${dashboard.id}`}
                          type="number"
                          step="0.01"
                          value={dashboardGoals[dashboard.id] || ''}
                          onChange={(e) => setDashboardGoals(prev => ({ ...prev, [dashboard.id]: e.target.value }))}
                          placeholder="3000.00"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Meta de ganho que você deseja atingir no mês
                        </p>
                      </div>
                      <Button onClick={() => handleSaveDashboardRisk(dashboard.id)} variant="outline">
                        Salvar
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
