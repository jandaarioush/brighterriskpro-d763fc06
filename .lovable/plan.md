

## Plano: Criar Pagina Principal /admin

### Situacao Atual

O projeto ja possui:
- Sistema completo de autenticacao (`useAuth`, `signIn`, `signUp`)
- Verificacao de role admin via `has_role` no banco de dados
- Componente `AdminRoute` que protege rotas admin
- Paginas admin existentes: `/admin/users`, `/admin/webhooks`, `/admin/reports`, `/admin/engagement`

**Problema:** A rota `/admin` nao existe - apenas as sub-rotas. Quando o usuario acessa `/admin`, ve a pagina NotFound.

### Solucao Proposta

Criar uma pagina `/admin` que funciona como **portal central** para administradores, com dois cenarios:

1. **Usuario nao autenticado:** Mostra formulario de login
2. **Usuario autenticado como admin:** Mostra painel com links para as areas admin

---

### Fluxo de Acesso

```
Usuario acessa /admin
        |
        v
    Autenticado?
     /        \
   Nao        Sim
    |          |
    v          v
 Login      Admin?
  Form      /    \
           Nao    Sim
            |      |
            v      v
       "Acesso    Painel
        Negado"   Admin
```

---

### Nova Pagina: src/pages/Admin.tsx

```tsx
// Estados
const { user, loading, isAdmin, checkingRole, signIn } = useAuth();
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loginLoading, setLoginLoading] = useState(false);

// Cenario 1: Nao autenticado - Mostrar formulario de login
// Cenario 2: Autenticado mas nao admin - Mostrar acesso negado
// Cenario 3: Autenticado e admin - Mostrar painel
```

#### Layout do Login Admin

```
+-----------------------------------------------+
|           RISK PRO - AREA ADMIN               |
|                   [Logo]                       |
+-----------------------------------------------+
|                                               |
|   +---------------------------------------+   |
|   |  Email                                |   |
|   |  [admin@exemplo.com               ]   |   |
|   |                                       |   |
|   |  Senha                                |   |
|   |  [**********                      ]   |   |
|   |                                       |   |
|   |  [       Acessar Painel Admin     ]   |   |
|   +---------------------------------------+   |
|                                               |
|   Acesso restrito a administradores           |
+-----------------------------------------------+
```

#### Layout do Painel Admin

```
+-----------------------------------------------+
|           PAINEL ADMINISTRATIVO               |
|   Bem-vindo, admin@exemplo.com                |
+-----------------------------------------------+
|                                               |
|  +----------+  +----------+  +------------+   |
|  | USUARIOS |  | WEBHOOKS |  | RELATORIOS |   |
|  |   👥     |  |   ⚡     |  |     📊     |   |
|  +----------+  +----------+  +------------+   |
|                                               |
|  +------------+                               |
|  | ENGAJAMENTO|                               |
|  |    📈      |                               |
|  +------------+                               |
|                                               |
|  [Voltar ao Dashboard]   [Sair]               |
+-----------------------------------------------+
```

---

### Codigo da Pagina Admin

```tsx
// src/pages/Admin.tsx
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Verificando credenciais...</p>
      </div>
    );
  }

  // Formulario de login para usuarios nao autenticados
  if (!user) {
    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginLoading(true);
      
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message);
      }
      // Se login OK, o estado sera atualizado e a pagina re-renderiza
      
      setLoginLoading(false);
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ThemeLogo className="h-10 mx-auto mb-4" />
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5" />
              Area Administrativa
            </CardTitle>
            <CardDescription>
              Acesso restrito a administradores do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@exemplo.com"
                  required
                />
              </div>
              <div>
                <Label>Senha</Label>
                <Input
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

  // Usuario autenticado mas nao e admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Acesso Negado
          </h1>
          <p className="text-muted-foreground mb-6">
            Voce nao tem permissao para acessar a area administrativa.
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

  // Painel admin - usuario autenticado E e admin
  const adminLinks = [
    { to: '/admin/users', icon: Users, title: 'Usuarios', description: 'Gerenciar contas e permissoes' },
    { to: '/admin/webhooks', icon: Webhook, title: 'Webhooks', description: 'Monitorar eventos de pagamento' },
    { to: '/admin/reports', icon: BarChart3, title: 'Relatorios', description: 'Visualizar metricas do sistema' },
    { to: '/admin/engagement', icon: TrendingUp, title: 'Engajamento', description: 'Analisar uso da plataforma' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
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
```

---

### Mudancas Necessarias

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Admin.tsx` | **Criar** - Nova pagina portal admin |
| `src/App.tsx` | Adicionar rota `/admin` |

---

### Rota no App.tsx

```tsx
// Adicionar import
import Admin from "./pages/Admin";

// Adicionar rota (antes das rotas admin/*)
<Route path="/admin" element={<Admin />} />
```

**Nota:** A rota `/admin` NAO precisa de `ProtectedRoute` ou `AdminRoute` porque a propria pagina gerencia os 3 cenarios internamente (nao logado, logado sem permissao, admin).

---

### Secao Tecnica

#### Seguranca

- Login usa o mesmo `signIn` do hook `useAuth`
- Verificacao de admin e feita via `has_role` no banco (server-side)
- Nenhum dado sensivel armazenado no localStorage
- Compativel com o sistema de autenticacao existente

#### Responsividade

- Grid de cards: 1 coluna mobile, 2 tablet, 4 desktop
- Formulario de login centralizado e responsivo
- Botoes adaptados para mobile

---

### Resultado Final

1. **Usuario nao logado** acessando `/admin`:
   - Ve formulario de login estilizado
   - Apos login, automaticamente ve o painel (se admin) ou "Acesso Negado"

2. **Usuario comum** acessando `/admin`:
   - Ve mensagem "Acesso Negado" com opcao de ir ao Dashboard

3. **Admin** acessando `/admin`:
   - Ve painel com 4 cards para cada area administrativa
   - Pode navegar para qualquer sub-pagina

