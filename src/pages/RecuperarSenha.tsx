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
  const [emailSent, setEmailSent] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);

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

      // Send password reset email via edge function
      console.log('🔄 Chamando edge function para:', trimmedEmail);
      
      const { data: responseData, error } = await supabase.functions.invoke('send-auth-email', {
        body: {
          email: trimmedEmail,
          type: 'recovery',
          redirectTo: `${window.location.origin}/redefinir-senha`,
        },
      });

      console.log('📬 Resposta da edge function:', { responseData, error });

      if (error) {
        console.error('❌ Erro na edge function:', error);
        
        // Mensagens específicas baseadas no erro
        const errorMessage = error.message || 'Erro desconhecido';
        
        if (errorMessage.includes('domain')) {
          toast.error('❌ Erro de configuração: Domínio não verificado. Contate o suporte.');
        } else if (errorMessage.includes('API key') || errorMessage.includes('RESEND_API_KEY')) {
          toast.error('❌ Erro de configuração: API Key inválida. Contate o suporte.');
        } else if (errorMessage.includes('User with this email not found')) {
          toast.error('Email não encontrado no sistema de autenticação.');
        } else {
          toast.error(`Erro ao enviar email: ${errorMessage}`);
        }
        
        setLoading(false);
        return;
      }

      console.log('✅ Email enviado com sucesso!');
      toast.success('✅ Email enviado! Verifique sua caixa de entrada e spam.');
      
      // Set email sent state and start resend timer
      setEmailSent(true);
      setCanResend(false);
      setResendTimer(60);
      
      // Start countdown timer
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro ao processar:', error);
      toast.error('Erro ao processar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResend = () => {
    setEmailSent(false);
    setEmail('');
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
            Enviaremos um código para redefinir sua senha
          </p>
        </div>

        {!emailSent ? (
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
              {loading ? 'Enviando...' : 'Enviar Código de Recuperação'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                ✅ Código enviado com sucesso!
              </p>
              <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                Verifique sua caixa de entrada e pasta de spam. O código expira em 15 minutos.
              </p>
              <p className="text-green-700 dark:text-green-300 text-sm mt-2">
                Acesse <a href="/redefinir-senha" className="font-bold underline">/redefinir-senha</a> para usar o código.
              </p>
            </div>
            
            <Button 
              onClick={handleResend} 
              variant="outline" 
              className="w-full"
              disabled={!canResend}
            >
              {canResend 
                ? 'Enviar para outro email' 
                : `Reenviar disponível em ${resendTimer}s`
              }
            </Button>
          </div>
        )}

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
