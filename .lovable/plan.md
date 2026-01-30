

## Plano: Adicionar Menu "Painel Administrativo" para Admins na Sidebar

### O que será feito

Adicionar um item de menu chamado **"Painel Administrativo"** na sidebar (`HubSidebar.tsx`) que só aparece quando o usuário logado possui a role de `admin`. Usuários comuns não verão este menu.

---

### Implementação

#### Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/HubSidebar.tsx` | Adicionar seção "Administração" com link para `/admin`, visível apenas para admins |

---

### Mudanças no Código

#### 1. Importar ícone Shield e usar isAdmin do hook

```typescript
import { Shield } from 'lucide-react';
const { user, signOut, isAdmin } = useAuth();
```

#### 2. Adicionar seção "Administração" (apenas para admins)

A nova seção será inserida entre "Meus Dashboards" e o bloco de Theme Toggle/Configurações/Sair:

```tsx
{/* Painel Administrativo - Apenas para Admins */}
{isAdmin && (
  <div className="px-3 mt-4">
    {!collapsed && (
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
        Administração
      </p>
    )}
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className={`w-full justify-start gap-3 ${
            location.pathname.startsWith('/admin')
              ? 'bg-amber-500/20 text-amber-500 border-l-2 border-amber-500'
              : 'text-muted-foreground hover:text-foreground hover:bg-amber-500/10'
          } ${collapsed ? 'px-3' : ''}`}
          onClick={() => navigate('/admin')}
        >
          <Shield className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Painel Administrativo</span>}
        </Button>
      </TooltipTrigger>
      {collapsed && <TooltipContent side="right">Painel Administrativo</TooltipContent>}
    </Tooltip>
  </div>
)}
```

---

### Visualização na Sidebar

```text
VISÃO GERAL
  ▢ Dashboard Principal

MEUS DASHBOARDS
  ● Futuros
  ● Ações
  ● Mercado Internacional

ADMINISTRAÇÃO            ← Nova seção (só para admins)
  🛡 Painel Administrativo

  ☀️ (Theme Toggle)
  ⚙ Configurações
  → Sair
```

---

### Segurança

A verificação de admin é feita de forma segura:

1. O hook `useAuth` chama a função `has_role` via RPC no Supabase
2. Esta função é `SECURITY DEFINER` e consulta a tabela `user_roles`
3. Não há verificação via localStorage ou client-side - tudo é validado no servidor
4. As páginas `/admin/*` também têm proteção via `AdminRoute` que verifica a role

---

### Comportamento

- **Admin logado**: Vê a seção "Administração" com o link "Painel Administrativo"
- **Usuário comum**: Não vê nada - a seção está completamente oculta
- **Estado ativo**: Quando em qualquer rota `/admin/*`, o botão fica destacado em amarelo/âmbar
- **Sidebar colapsada**: Mostra apenas o ícone com tooltip

