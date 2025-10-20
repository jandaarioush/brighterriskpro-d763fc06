import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import logoHorizontal from '@/assets/logo-brighter.png';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(isLogin ? 'Login realizado com sucesso!' : 'Conta criada com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao processar sua solicitação');
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
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? 'Acesse sua conta' : 'Comece a gerenciar seus trades'}
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar Conta'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Não tem uma conta?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://pay.cakto.com.br/3pcxxff_615030" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Criar Conta Mensal
              </Button>
            </a>
            <a href="https://loja.infinitepay.io/brighterinc/tyo8170-brighter-risk-pro---anual" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Criar Conta Anual
              </Button>
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
