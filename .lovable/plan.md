

## Plano: Dashboard Admin Completo com Gestao de Usuarios

### Analise da Situacao Atual

O sistema ja possui uma estrutura robusta de administracao:

| Funcionalidade | Status | Localizacao |
|----------------|--------|-------------|
| Portal admin com login | Implementado | `/admin` |
| Listagem de usuarios | Implementado | `/admin/users` |
| Criar usuario | Implementado | Via edge function |
| Importar CSV | Implementado | Via edge function |
| Ativar/Revogar status | Implementado | Update direto no `profiles` |
| **Atualizar plano** | Faltando | - |
| **Editar perfil completo** | Faltando | - |
| **Deletar usuario** | Faltando | - |
| Logs de webhooks | Implementado | `/admin/webhooks` |

---

### Mudancas Propostas

#### 1. Expandir Edge Function `admin-manage-users`

A edge function atual so suporta criacao de usuarios. Precisamos adicionar:

```text
+------------------------------------------+
|  Operacoes Suportadas                     |
+------------------------------------------+
|  CREATE - Criar usuario (ja existe)      |
|  UPDATE - Atualizar nome, plano, status  |
|  DELETE - Remover usuario do sistema     |
+------------------------------------------+
```

**Nova estrutura de request:**
```typescript
interface AdminRequest {
  action: 'create' | 'update' | 'delete';
  
  // Para CREATE (existente)
  users?: Array<{ email: string; name?: string; plano?: string }>;
  
  // Para UPDATE
  userId?: string;
  updates?: {
    name?: string;
    plano?: string;
    status_pagamento?: 'pending' | 'approved' | 'revoked';
    phone?: string;
  };
  
  // Para DELETE
  userIdToDelete?: string;
}
```

#### 2. Dialog de Edicao na Pagina AdminUsers

Adicionar um dialog para editar usuario com campos:

```text
+-----------------------------------------------+
|           Editar Usuario                       |
+-----------------------------------------------+
|  Email: usuario@exemplo.com (somente leitura) |
|                                               |
|  Nome:          [ Joao Silva           ]     |
|  Telefone:      [ (11) 99999-9999      ]     |
|  Plano:         [ Premium          v ]       |
|  Status:        [ Aprovado         v ]       |
|                                               |
|  [Cancelar]           [Salvar Alteracoes]    |
|                                               |
|  ⚠️ Alterar manualmente pode conflitar com   |
|     webhooks de pagamento.                    |
+-----------------------------------------------+
```

#### 3. Confirmacao de Exclusao

```text
+-----------------------------------------------+
|        Excluir Usuario                        |
+-----------------------------------------------+
|  Tem certeza que deseja excluir?              |
|                                               |
|  Email: usuario@exemplo.com                   |
|                                               |
|  ⚠️ Esta acao e IRREVERSIVEL!                 |
|                                               |
|  Isso ira:                                    |
|  • Remover acesso ao sistema                  |
|  • Manter historico de webhooks               |
|  • Manter registros de subscriptions          |
|                                               |
|  [Cancelar]           [Excluir Permanente]   |
+-----------------------------------------------+
```

---

### Fluxo de Seguranca

```text
Admin clica "Editar" ou "Excluir"
        |
        v
  Abre Dialog de confirmacao
        |
        v
  Chama Edge Function
        |
        v
  Edge Function verifica:
  1. Token JWT valido?
  2. Usuario tem role 'admin'?
  3. Operacao permitida?
        |
        v
  Executa com Service Role Key
        |
        v
  Registra log de auditoria
        |
        v
  Retorna resultado
```

---

### Preservacao de Webhooks

**Importante:** As alteracoes manuais de plano/status NAO afetam os webhooks existentes porque:

1. Tabela `webhook_events` - Permanece inalterada (somente leitura pelo admin)
2. Tabela `subscriptions` - Permanece inalterada (registro historico)
3. Tabela `pending_orders` - Permanece inalterada
4. Apenas `profiles` e `auth.users` sao modificados

Quando um novo pagamento chegar via webhook, ele atualizara o perfil normalmente, sobrescrevendo qualquer alteracao manual.

---

### Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `supabase/functions/admin-manage-users/index.ts` | Adicionar acoes UPDATE e DELETE |
| `src/pages/AdminUsers.tsx` | Adicionar dialog de edicao e botao de exclusao |

---

### Secao Tecnica

#### Edge Function - Nova Estrutura

```typescript
// Verificar acao
const { action, users, userId, updates, userIdToDelete } = await req.json();

switch (action) {
  case 'create':
    // Logica existente de criacao
    break;
    
  case 'update':
    // Atualizar profile com os campos fornecidos
    const { error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        plano: updates.plano,
        status_pagamento: updates.status_pagamento,
        phone: updates.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    
    // Log de auditoria
    await supabase.rpc('log_audit', {
      p_actor: adminEmail,
      p_action: 'admin_update_user',
      p_meta: { userId, changes: updates },
    });
    break;
    
  case 'delete':
    // Deletar usuario do auth (cascade remove profile)
    await supabase.auth.admin.deleteUser(userIdToDelete);
    
    // Log de auditoria
    await supabase.rpc('log_audit', {
      p_actor: adminEmail,
      p_action: 'admin_delete_user',
      p_meta: { userId: userIdToDelete },
    });
    break;
}
```

#### Componente EditDialog

```tsx
interface EditUserData {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  plano: string | null;
  status_pagamento: string;
}

// State para edicao
const [editingUser, setEditingUser] = useState<EditUserData | null>(null);
const [showEditDialog, setShowEditDialog] = useState(false);

// Funcao de update
const handleUpdateUser = async () => {
  const { error } = await supabase.functions.invoke('admin-manage-users', {
    body: {
      action: 'update',
      userId: editingUser.id,
      updates: {
        name: editingUser.name,
        plano: editingUser.plano,
        phone: editingUser.phone,
        status_pagamento: editingUser.status_pagamento,
      },
    },
  });
  // ...
};
```

---

### Opcoes de Plano no Select

```tsx
const planoOptions = [
  { value: '', label: 'Sem Plano' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
];
```

---

### Resultado Final

Apos implementacao, o admin podera:

1. **Visualizar** todos os usuarios em tabela
2. **Buscar** por email
3. **Criar** usuario individual ou via CSV
4. **Editar** nome, telefone, plano e status de qualquer usuario
5. **Excluir** usuarios permanentemente (com confirmacao)
6. **Revogar** em massa (funcionalidade existente)

Tudo isso **sem afetar** os registros de webhooks, subscriptions e pending_orders, que sao apenas para auditoria e historico.

