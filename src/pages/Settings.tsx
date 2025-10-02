import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Settings() {
  const { user } = useAuth();
  const [monthlyRisk, setMonthlyRisk] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('monthly_risk')
      .eq('id', user?.id)
      .single();

    if (data?.monthly_risk) {
      setMonthlyRisk(data.monthly_risk.toString());
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ monthly_risk: parseFloat(monthlyRisk) })
        .eq('id', user?.id);

      if (error) throw error;
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 font-montserrat">Configurações</h1>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Gestão de Risco</h2>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label htmlFor="monthlyRisk" className="text-sm font-medium mb-2 block">
                Risco Mensal (R$)
              </label>
              <Input
                id="monthlyRisk"
                type="number"
                step="0.01"
                value={monthlyRisk}
                onChange={(e) => setMonthlyRisk(e.target.value)}
                placeholder="5000.00"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Valor máximo que você pode perder no mês
              </p>
            </div>

            <div className="pt-4">
              <h3 className="font-semibold mb-2">Informações da Conta</h3>
              <p className="text-sm text-muted-foreground">
                Email: {user?.email}
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
