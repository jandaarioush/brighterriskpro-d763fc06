import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import logoHorizontal from '@/assets/logo-brighter.png';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const recuperarSenhaSchema = z.object({
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
});

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email format
      const validationResult = recuperarSenhaSchema.safeParse({ email });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        setLoading(false);
        return;
      }

      const trimmedEmail = email.trim().toLowerCase();

      // Check if email exists in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, status_pagamento')
        .eq('email', trimmedEmail)
        .maybeSingle();

      if (profileError) {
        toast.error('Erro ao verificar email. Tente novamente.');
        setLoading(false);
        return;
      }

      if (!profile) {
        toast.error('Email não encontrado. Verifique se você já realizou a compra.');
        setLoading(false);
        return;
      }

      // Check payment status
      if (profile.status_pagamento === 'revoked') {
        toast.error('Sua assinatura foi cancelada. Entre em contato com o suporte.');
        setLoading(false);
        return;
      }

      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (error) {
        toast.error('Erro ao enviar email. Tente novamente.');
        setLoading(false);
        return;
      }

      toast.success('Email enviado! Verifique sua caixa de entrada e spam.');
      setEmail('');
    } catch (error) {
      toast.error('Erro ao processar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <img src={logoHorizontal} alt="Brighter" className="h-10 mb-4" />
          <h1 className="font-montserrat text-3xl font-bold">
            Recuperar Senha
          </h1>
          <p className="text-muted-foreground mt-2 text-center">
            Enviaremos um link para redefinir sua senha
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Lembrou sua senha?{' '}
            <Link to="/auth" className="text-primary hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
