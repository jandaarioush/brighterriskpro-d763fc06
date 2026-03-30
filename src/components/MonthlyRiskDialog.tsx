import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

const monthlyRiskSchema = z.object({
  monthlyRisk: z.string()
    .trim()
    .min(1, 'Valor é obrigatório')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Valor deve ser maior que zero')
    .refine((val) => {
      const num = parseFloat(val);
      return num <= 1000000;
    }, 'Valor muito alto'),
});

interface MonthlyRiskDialogProps {
  open: boolean;
  onClose: () => void;
  dashboardId?: string;
}

export function MonthlyRiskDialog({ open, onClose, dashboardId }: MonthlyRiskDialogProps) {
  const [monthlyRisk, setMonthlyRisk] = useState('');
  const [monthlyGoal, setMonthlyGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validationResult = monthlyRiskSchema.safeParse({ monthlyRisk });
      if (!validationResult.success) {
        toast.error(validationResult.error.errors[0].message);
        setLoading(false);
        return;
      }

      const riskValue = parseFloat(monthlyRisk.trim());
      const goalValue = monthlyGoal.trim() ? parseFloat(monthlyGoal.trim()) : null;

      if (goalValue !== null && (isNaN(goalValue) || goalValue < 0)) {
        toast.error('Valor de objetivo inválido');
        setLoading(false);
        return;
      }

      const updateData: any = { monthly_risk: riskValue, monthly_goal: goalValue };

      if (dashboardId) {
        const { error } = await supabase
          .from('dashboards')
          .update(updateData)
          .eq('id', dashboardId);
        if (error) throw error;
      } else {
        const { data: futurosDash } = await supabase
          .from('dashboards')
          .select('id')
          .eq('user_id', user?.id)
          .eq('type', 'futuros')
          .maybeSingle();
          
        if (futurosDash) {
          const { error } = await supabase
            .from('dashboards')
            .update(updateData)
            .eq('id', futurosDash.id);
          if (error) throw error;
        }
      }

      toast.success('Configurações salvas com sucesso!');
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-montserrat text-2xl">Configurar Risco e Objetivo</DialogTitle>
          <DialogDescription>
            Configure seu risco mensal e objetivo financeiro para o mês.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="monthlyRisk" className="text-sm font-medium">
              Risco Mensal (R$)
            </label>
            <Input
              id="monthlyRisk"
              type="number"
              step="0.01"
              value={monthlyRisk}
              onChange={(e) => setMonthlyRisk(e.target.value)}
              required
              placeholder="5000.00"
            />
            <p className="text-xs text-muted-foreground mt-1">Quanto você pode perder no mês</p>
          </div>

          <div>
            <label htmlFor="monthlyGoal" className="text-sm font-medium">
              Objetivo Mensal (R$) <span className="text-muted-foreground">(opcional)</span>
            </label>
            <Input
              id="monthlyGoal"
              type="number"
              step="0.01"
              value={monthlyGoal}
              onChange={(e) => setMonthlyGoal(e.target.value)}
              placeholder="3000.00"
            />
            <p className="text-xs text-muted-foreground mt-1">Meta de ganho que deseja atingir</p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
