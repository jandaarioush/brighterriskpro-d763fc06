import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const settingsSchema = z.object({
  name: z.string().trim().max(100, 'Nome muito longo').optional(),
  phone: z.string().trim().max(20, 'Telefone inválido').optional(),
  city: z.string().trim().max(100, 'Cidade muito longa').optional(),
  state: z.string().trim().max(2, 'UF deve ter 2 caracteres').optional(),
  monthlyRisk: z.string().optional().refine((val) => {
    if (!val) return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, 'Risco mensal deve ser um número positivo'),
});

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [monthlyRisk, setMonthlyRisk] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('name, phone, city, state, monthly_risk')
      .eq('id', user?.id)
      .single();

    if (data) {
      setName(data.name || '');
      setPhone(data.phone || '');
      setCity(data.city || '');
      setState(data.state || '');
      setMonthlyRisk(data.monthly_risk?.toString() || '');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      const validationResult = settingsSchema.safeParse({
        name,
        phone,
        city,
        state,
        monthlyRisk,
      });

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
          monthly_risk: monthlyRisk ? parseFloat(monthlyRisk) : null
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 font-montserrat">Configurações</h1>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Configurações da Conta */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Configurações da Conta</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  O email não pode ser alterado
                </p>
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Sua cidade"
                  />
                </div>

                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Gestão de Risco */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Gestão de Risco</h2>
            
            <div>
              <Label htmlFor="monthlyRisk">Risco Mensal (R$)</Label>
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
          </Card>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </form>
      </div>
    </div>
  );
}
