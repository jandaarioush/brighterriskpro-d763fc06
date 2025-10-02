import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface MonthlyRiskDialogProps {
  open: boolean;
  onClose: () => void;
}

export function MonthlyRiskDialog({ open, onClose }: MonthlyRiskDialogProps) {
  const [monthlyRisk, setMonthlyRisk] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ monthly_risk: parseFloat(monthlyRisk) })
        .eq('id', user?.id);

      if (error) throw error;

      toast.success('Risco mensal configurado com sucesso!');
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar risco mensal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-montserrat text-2xl">Configurar Risco Mensal</DialogTitle>
          <DialogDescription>
            Quanto você pode perder no mês? Este valor será usado para calcular seu risco diário.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="monthlyRisk" className="text-sm font-medium">
              Valor em R$
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
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
