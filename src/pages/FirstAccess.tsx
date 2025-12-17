import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeLogo } from '@/components/ThemeLogo';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const firstAccessSchema = z.object({
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(100, 'Senha muito longa'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

export default function FirstAccess() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs with Zod
      const validationResult = firstAccessSchema.safeParse({
        email,
        password,
        confirmPassword,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        setLoading(false);
        return;
      }

      const trimmedEmail = email.trim().toLowerCase();

      // Check if email exists via secure edge function
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-email-exists', {
        body: { email: trimmedEmail }
      });

      if (verifyError) {
        toast.error('Erro ao verificar email. Tente novamente.');
        setLoading(false);
        return;
      }

      if (!verifyData?.exists) {
        toast.error('Email não encontrado. Por favor, use o email que você forneceu na compra.');
        setLoading(false);
        return;
      }

      // Check if user already has auth credentials
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: 'test-if-exists-dummy-password'
      });

      if (existingUser?.user) {
        toast.error('Este email já possui uma senha cadastrada. Use o botão "Entrar".');
        setLoading(false);
        return;
      }

      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este email já possui uma senha cadastrada. Use o botão "Entrar".');
        } else {
          toast.error(error.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        toast.success('Senha cadastrada com sucesso! Redirecionando...');
        // User will be automatically logged in by Supabase
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      toast.error('Erro ao cadastrar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <ThemeLogo className="h-10 mb-4" />
          <h1 className="font-montserrat text-3xl font-bold">
            Primeiro Acesso
          </h1>
          <p className="text-muted-foreground mt-2 text-center">
            Configure sua senha usando o email da compra
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
              placeholder="Email usado na compra"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmar Senha
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processando...' : 'Cadastrar Senha'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Já cadastrou sua senha?{' '}
            <Link to="/auth" className="text-primary hover:underline">
              Fazer login
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Esqueceu sua senha?{' '}
            <Link to="/recuperar-senha" className="text-primary hover:underline">
              Recuperar senha
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Ainda não comprou?{' '}
            <Link to="/" className="text-primary hover:underline">
              Ver planos
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
