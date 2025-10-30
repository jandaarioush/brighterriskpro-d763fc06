import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import logoHorizontal from '@/assets/logo-brighter.png';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const redefinirSenhaSchema = z.object({
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(100, 'Senha muito longa'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

export default function RedefinirSenha() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔄 [RedefinirSenha] Página carregada');
    
    // Check if user came from password reset email
    const checkSession = async () => {
      try {
        console.log('🔍 [RedefinirSenha] Verificando URL fragments...');
        
        // Check for tokens in URL hash (format: #access_token=...&type=recovery)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const tokenType = hashParams.get('type');
        
        console.log('🔑 [RedefinirSenha] URL params:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken,
          type: tokenType 
        });
        
        // If tokens are in URL, set session with them
        if (accessToken && tokenType === 'recovery') {
          console.log('✅ [RedefinirSenha] Tokens encontrados na URL, trocando sessão...');
          
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (sessionError) {
            console.error('❌ [RedefinirSenha] Erro ao definir sessão:', sessionError);
            toast.error('Link inválido ou expirado. Solicite um novo link.');
            setTimeout(() => navigate('/recuperar-senha'), 3000);
            return;
          }
          
          console.log('✅ [RedefinirSenha] Sessão criada com sucesso:', {
            userId: sessionData.session?.user?.id,
            email: sessionData.session?.user?.email,
          });
          
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          setValidToken(true);
          setCheckingToken(false);
          return;
        }
        
        // Check existing session
        console.log('🔍 [RedefinirSenha] Verificando sessão existente...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('📊 [RedefinirSenha] Estado da sessão:', {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          error: sessionError?.message,
        });
        
        if (session) {
          console.log('✅ [RedefinirSenha] Sessão válida encontrada');
          setValidToken(true);
        } else {
          console.log('❌ [RedefinirSenha] Nenhuma sessão válida encontrada');
          toast.error('Link inválido ou expirado. Solicite um novo link de recuperação.');
          setTimeout(() => navigate('/recuperar-senha'), 3000);
        }
      } catch (error) {
        console.error('❌ [RedefinirSenha] Erro ao verificar sessão:', error);
        toast.error('Erro ao validar link. Tente solicitar um novo.');
        setTimeout(() => navigate('/recuperar-senha'), 3000);
      } finally {
        setCheckingToken(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate passwords
      const validationResult = redefinirSenhaSchema.safeParse({
        password,
        confirmPassword,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        setLoading(false);
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast.error('Erro ao redefinir senha. Tente novamente.');
        setLoading(false);
        return;
      }

      toast.success('Senha redefinida com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      toast.error('Erro ao processar solicitação. Tente novamente.');
      setLoading(false);
    }
  };

  if (checkingToken || !validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center space-y-4">
            <img src={logoHorizontal} alt="Brighter" className="h-10" />
            {checkingToken ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground text-center">
                  Verificando link de recuperação...
                </p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground text-center">
                  Redirecionando...
                </p>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <img src={logoHorizontal} alt="Brighter" className="h-10 mb-4" />
          <h1 className="font-montserrat text-3xl font-bold">
            Redefinir Senha
          </h1>
          <p className="text-muted-foreground mt-2 text-center">
            Digite sua nova senha
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              minLength={6}
            />
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
