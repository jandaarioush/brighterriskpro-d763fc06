import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeLogo } from '@/components/ThemeLogo';
import { toast } from 'sonner';
import { Users, Webhook, BarChart3, TrendingUp, Shield, ArrowLeft, LogOut } from 'lucide-react';

export default function Admin() {
  const { user, loading, isAdmin, checkingRole, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Estado de carregamento
  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-lg text-foreground">Verificando credenciais...</p>
      </div>
    );
  }

  // Formulário de login para usuários não autenticados
  if (!user) {
    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginLoading(true);
      
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message);
      }
      // Se login OK, o estado será atualizado e a página re-renderiza
      
      setLoginLoading(false);
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ThemeLogo className="h-10 mx-auto mb-4" />
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5" />
              Área Administrativa
            </CardTitle>
            <CardDescription>
              Acesso restrito a administradores do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@exemplo.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? 'Entrando...' : 'Acessar Painel Admin'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Usuário autenticado mas não é admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md text-center p-8">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Acesso Negado
          </h1>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão para acessar a área administrativa.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Ir para Dashboard
            </Button>
            <Button variant="ghost" onClick={signOut}>
              Sair
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Painel admin - usuário autenticado E é admin
  const adminLinks = [
    { to: '/admin/users', icon: Users, title: 'Usuários', description: 'Gerenciar contas e permissões' },
    { to: '/admin/webhooks', icon: Webhook, title: 'Webhooks', description: 'Monitorar eventos de pagamento' },
    { to: '/admin/reports', icon: BarChart3, title: 'Relatórios', description: 'Visualizar métricas do sistema' },
    { to: '/admin/engagement', icon: TrendingUp, title: 'Engajamento', description: 'Analisar uso da plataforma' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground mt-1">
              Bem-vindo, {user.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Admin Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminLinks.map(({ to, icon: Icon, title, description }) => (
            <Link key={to} to={to}>
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader>
                  <Icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
