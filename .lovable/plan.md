

## Plano: Integrar Formulários de Lead com Webhook Externo

### Objetivo

Atualizar a tabela `pending_orders` e conectar os formulários de captura (Blog Newsletter, Contato, Suporte) ao webhook externo para envio de leads.

---

### Mapeamento de Dados

#### Tabela `pending_orders` (já existente)

A tabela já possui a maioria dos campos necessários:

| Campo Atual | Campo Solicitado | Status |
|-------------|------------------|--------|
| `name` | `full_name` | Renomear |
| `email` | `email` | OK |
| `phone` | `phone` | OK |
| - | `cpf` | Adicionar |
| `plano` | `plan_type` | OK (usar valores: private, group, legacy) |
| `status` | `status` | OK (pending, completed, expired) |
| `created_at` | `created_at` | OK |

---

### Alterações no Banco de Dados

```sql
-- Renomear 'name' para 'full_name'
ALTER TABLE public.pending_orders RENAME COLUMN name TO full_name;

-- Adicionar coluna CPF (opcional)
ALTER TABLE public.pending_orders ADD COLUMN cpf text;
```

---

### Formulários a Integrar

| Formulário | Arquivo | Campos Capturados |
|------------|---------|-------------------|
| Newsletter (Blog) | `src/pages/Blog.tsx` | email |
| Contato | `src/pages/Contato.tsx` | nome, email, telefone, mensagem |
| Suporte | `src/pages/Suporte.tsx` | nome, email, assunto, mensagem |

---

### Configuração do Webhook

**URL do Webhook Externo:**
```
https://wsvafihzxxlbgfxbqqmh.supabase.co/functions/v1/lead-capture-webhook
```

**API Key:** Será armazenada como secret no backend

**Payload Esperado:**
```json
{
  "source": "newsletter" | "contato" | "suporte",
  "full_name": "Nome do Lead",
  "email": "email@exemplo.com",
  "phone": "+5511999999999",
  "message": "Mensagem (opcional)",
  "subject": "Assunto (opcional)",
  "plan_type": "private" | "group" | "legacy",
  "created_at": "2026-01-30T10:00:00Z"
}
```

---

### Arquitetura da Solução

```text
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                             │
├─────────────────────────────────────────────────────────────────┤
│  Blog.tsx (Newsletter)    Contato.tsx      Suporte.tsx          │
│       │                       │                 │               │
│       └───────────────────────┼─────────────────┘               │
│                               ▼                                 │
│              supabase.functions.invoke('send-lead')             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│            EDGE FUNCTION: send-lead/index.ts                    │
├─────────────────────────────────────────────────────────────────┤
│  1. Recebe dados do formulário                                  │
│  2. Valida inputs (zod)                                         │
│  3. Envia POST para webhook externo com API Key                 │
│  4. Retorna status de sucesso/erro                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  WEBHOOK EXTERNO (CRM do Cliente)                               │
│  https://wsvafihzxxlbgfxbqqmh.supabase.co/.../lead-capture      │
└─────────────────────────────────────────────────────────────────┘
```

---

### Implementação

#### 1. Armazenar API Key como Secret

Adicionar o secret `LEAD_WEBHOOK_API_KEY` com valor:
```
1da7fdeabeba44e3bd9b6852fcd12c40715b999186ae1c1fb0c6c1cc2fec14f9
```

#### 2. Criar Edge Function `send-lead`

```typescript
// supabase/functions/send-lead/index.ts

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { source, full_name, email, phone, message, subject } = await req.json();

    // Validação básica
    if (!email || !source) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email e source são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enviar para webhook externo
    const webhookUrl = 'https://wsvafihzxxlbgfxbqqmh.supabase.co/functions/v1/lead-capture-webhook';
    const apiKey = Deno.env.get('LEAD_WEBHOOK_API_KEY');

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        source,
        full_name: full_name || '',
        email,
        phone: phone || '',
        message: message || '',
        subject: subject || '',
        created_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook retornou ${response.status}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao enviar lead:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

#### 3. Atualizar Formulário Newsletter (Blog.tsx)

```tsx
const [email, setEmail] = useState('');
const [loading, setLoading] = useState(false);

const handleNewsletterSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const { error } = await supabase.functions.invoke('send-lead', {
      body: { source: 'newsletter', email }
    });
    
    if (error) throw error;
    
    toast({ title: 'Inscrito com sucesso!' });
    setEmail('');
  } catch (err) {
    toast({ title: 'Erro ao inscrever', variant: 'destructive' });
  } finally {
    setLoading(false);
  }
};
```

#### 4. Atualizar Formulário Contato (Contato.tsx)

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const { error } = await supabase.functions.invoke('send-lead', {
      body: { 
        source: 'contato',
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      }
    });
    
    if (error) throw error;
    
    toast({ title: 'Mensagem enviada!' });
    setFormData({ name: '', email: '', phone: '', message: '' });
  } catch (err) {
    toast({ title: 'Erro ao enviar', variant: 'destructive' });
  } finally {
    setLoading(false);
  }
};
```

#### 5. Atualizar Formulário Suporte (Suporte.tsx)

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const { error } = await supabase.functions.invoke('send-lead', {
      body: { 
        source: 'suporte',
        full_name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      }
    });
    
    if (error) throw error;
    
    toast({ title: 'Mensagem enviada!' });
    setFormData({ name: '', email: '', subject: '', message: '' });
  } catch (err) {
    toast({ title: 'Erro ao enviar', variant: 'destructive' });
  } finally {
    setLoading(false);
  }
};
```

---

### Arquivos a Modificar/Criar

| Arquivo | Ação |
|---------|------|
| Migração SQL | Renomear `name` para `full_name` e adicionar `cpf` na tabela `pending_orders` |
| `supabase/functions/send-lead/index.ts` | Criar edge function para envio ao webhook |
| `supabase/config.toml` | Adicionar configuração da nova function |
| `src/pages/Blog.tsx` | Integrar newsletter com edge function |
| `src/pages/Contato.tsx` | Integrar formulário com edge function |
| `src/pages/Suporte.tsx` | Integrar formulário com edge function |

---

### Segurança

1. **API Key como Secret** - A chave de API será armazenada como secret no backend, nunca exposta no frontend
2. **Validação de Inputs** - Todos os dados serão validados antes do envio
3. **CORS** - Headers configurados corretamente para acesso do frontend
4. **Sem Autenticação** - Os formulários são públicos, não requerem login

