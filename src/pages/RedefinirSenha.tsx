import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ThemeLogo } from '@/components/ThemeLogo';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { strongPasswordSchema, passwordRequirements } from '@/lib/passwordValidation';

const redefinirSenhaSchema = z.object({
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
  code: z.string().trim().length(6, 'Código deve ter 6 dígitos').regex(/^\d+$/, 'Código deve conter apenas números'),
  password: strongPasswordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

export default function RedefinirSenha() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate all fields
      const validationResult = redefinirSenhaSchema.safeParse({
        email,
        code,
        password,
        confirmPassword,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        setLoading(false);
        return;
      }

      console.log('🔄 [RedefinirSenha] Validando código...');

      // Call edge function to validate code and update password
      const { data, error } = await supabase.functions.invoke('validate-reset-code', {
        body: {
          email: email.trim().toLowerCase(),
          code: code.trim(),
          newPassword: password,
        },
      });

      if (error) {
        console.error('❌ [RedefinirSenha] Erro:', error);
        const errorMessage = error.message || 'Erro ao redefinir senha';
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      if (!data?.success) {
        toast.error(data?.error?.message || 'Erro ao redefinir senha');
        setLoading(false);
        return;
      }

      console.log('✅ [RedefinirSenha] Senha redefinida com sucesso');
      toast.success('Senha redefinida com sucesso! Redirecionando...');
      
      setTimeout(() => {
        navigate('/auth');
      }, 1500);
    } catch (error) {
      console.error('❌ [RedefinirSenha] Erro:', error);
      toast.error('Erro ao processar solicitação. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <ThemeLogo className="h-10 mb-4" />
          <h1 className="font-montserrat text-3xl font-bold">
            Redefinir Senha
          </h1>
          <p className="text-muted-foreground mt-2 text-center">
            Digite o código recebido por email
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

          <div>
            <label htmlFor="code" className="text-sm font-medium">
              Código de Verificação
            </label>
            <Input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="000000"
              maxLength={6}
              pattern="\d{6}"
              className="text-center text-2xl tracking-widest font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Digite o código de 6 dígitos enviado para seu email
            </p>
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium">
              Nova Senha
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
              {passwordRequirements.map((req, i) => (
                <li key={i}>• {req}</li>
              ))}
            </ul>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmar Nova Senha
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
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
