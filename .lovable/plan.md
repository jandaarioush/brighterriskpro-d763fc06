

## Plano: Corrigir Erro de Autorização ao Criar Usuário na Admin

### Diagnóstico do Problema

O erro "Não autorizado" está ocorrendo na Edge Function `admin-manage-users` porque o header `Authorization` está chegando vazio (null).

**Causa raiz identificada:**
- A Edge Function verifica se `authHeader` existe na linha 59-61
- Quando o `supabase.functions.invoke` é chamado, ele deveria automaticamente enviar o token de sessão
- Se o token não está sendo enviado, significa que a sessão do cliente não está ativa/válida

**Possíveis cenários:**
1. Token de sessão expirado e não foi renovado automaticamente
2. Problema de sincronização entre a sessão e a chamada da função
3. Usuário acessou a página admin sem estar logado (improvável, pois AdminRoute protege)

---

### Solução Proposta

#### 1. Melhorar Logging na Edge Function para Debug

Adicionar logs mais detalhados para entender exatamente o que está acontecendo:

```typescript
console.log('Headers recebidos:', {
  authorization: authHeader ? 'presente' : 'ausente',
  contentType: req.headers.get('Content-Type'),
});
```

#### 2. Melhorar Tratamento no Frontend (AdminUsers.tsx)

Verificar a sessão antes de chamar a Edge Function e fornecer feedback mais claro:

```typescript
const handleCreateSingle = async () => {
  // Verificar sessão antes de chamar
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    toast.error('Sessão expirada. Por favor, faça login novamente.');
    return;
  }
  
  // Resto do código...
};
```

#### 3. Adicionar Refresh de Token Antes de Chamadas Críticas

```typescript
// Forçar refresh do token antes de chamar a função
const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

if (refreshError || !session) {
  toast.error('Não foi possível verificar sua sessão. Faça login novamente.');
  return;
}
```

---

### Mudanças no Código

#### Arquivo 1: `supabase/functions/admin-manage-users/index.ts`

Melhorar logging para debug:

```typescript
// Adicionar logging detalhado
console.log('Request received:', {
  method: req.method,
  hasAuth: !!req.headers.get('Authorization'),
});

// Verificar autenticação
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  console.log('Missing Authorization header');
  throw new Error('Não autorizado - token não fornecido');
}
```

#### Arquivo 2: `src/pages/AdminUsers.tsx`

Adicionar verificação de sessão antes das chamadas:

```typescript
// Função auxiliar para verificar sessão
const ensureSession = async (): Promise<boolean> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    // Tentar refresh
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError || !refreshData.session) {
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      return false;
    }
  }
  
  return true;
};

// Usar antes de cada chamada à Edge Function
const handleCreateSingle = async () => {
  if (!newUserEmail) {
    toast.error('Preencha o email');
    return;
  }

  if (!await ensureSession()) {
    return;
  }

  setBulkLoading(true);
  // ... resto do código
};
```

---

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/admin-manage-users/index.ts` | Adicionar logging detalhado para debug |
| `src/pages/AdminUsers.tsx` | Adicionar verificação de sessão antes de chamar Edge Functions |

---

### Seção Técnica

#### Nova Função de Verificação de Sessão

```typescript
const ensureSession = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erro ao verificar sessão:', error);
      toast.error('Erro ao verificar sessão. Tente novamente.');
      return false;
    }
    
    if (!session) {
      // Tentar refresh
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        return false;
      }
    }
    
    return true;
  } catch (err) {
    console.error('Erro inesperado ao verificar sessão:', err);
    toast.error('Erro ao verificar sessão.');
    return false;
  }
};
```

#### Melhorias na Edge Function

```typescript
const handler = async (req: Request): Promise<Response> => {
  console.log('=== admin-manage-users called ===');
  console.log('Method:', req.method);
  console.log('Has Authorization:', !!req.headers.get('Authorization'));
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ... código existente
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Authorization header missing');
      return new Response(
        JSON.stringify({ 
          error: 'Não autorizado - token não fornecido',
          hint: 'Verifique se você está logado e tente novamente'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // ... resto do código
  }
};
```

---

### Resultado Esperado

1. **Mensagens de erro claras** - O usuário saberá se a sessão expirou
2. **Refresh automático** - Tentativa de renovar token antes de falhar
3. **Logging detalhado** - Facilita debug em caso de problemas futuros
4. **Status HTTP correto** - Retorna 401 para erros de autenticação (não 400)

