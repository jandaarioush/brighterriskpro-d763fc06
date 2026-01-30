

## Plano: Criar Tabela Orders e Edge Function Proxy para Leads

### Objetivo

1. Criar uma nova tabela `orders` para armazenar leads convertidos (clientes que pagaram)
2. Criar uma Edge Function `send-lead` que funciona como proxy seguro para enviar dados ao webhook externo, protegendo a API Key

---

### 1. Nova Tabela: `orders` (Leads Convertidos / Clientes)

| Campo | Tipo | Descrição | Nullable |
|-------|------|-----------|----------|
| `id` | uuid | Chave primária | Não |
| `customer_name` | text | Nome do cliente | Não |
| `customer_email` | text | Email do cliente | Não |
| `customer_phone` | text | Telefone do cliente | Sim |
| `product_id` | text | ID do produto comprado | Não |
| `product_name` | text | Nome do produto | Não |
| `status` | text | Status (pending, paid, failed) | Não |
| `paid_at` | timestamp | Data do pagamento | Sim |
| `created_at` | timestamp | Data de criação | Não |

```sql
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  product_id text NOT NULL,
  product_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Admins podem ver todos os pedidos
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
```

---

### 2. Edge Function Proxy: `send-lead`

Esta função protege a API Key do webhook externo, recebendo dados do frontend e encaminhando para o CRM/webhook externo de forma segura.

```text
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                             │
├─────────────────────────────────────────────────────────────────┤
│  Blog.tsx      Contato.tsx      Suporte.tsx                     │
│       │             │                 │                         │
│       └─────────────┼─────────────────┘                         │
│                     ▼                                           │
│       supabase.functions.invoke('send-lead', { body: {...} })   │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│            EDGE FUNCTION: send-lead/index.ts                    │
├─────────────────────────────────────────────────────────────────┤
│  1. Recebe dados do formulário (source, email, nome, etc)       │
│  2. Valida inputs                                               │
│  3. Busca API Key do secret: LEAD_WEBHOOK_API_KEY               │
│  4. Envia POST para webhook externo com Authorization header    │
│  5. Retorna status de sucesso/erro ao frontend                  │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  WEBHOOK EXTERNO (CRM)                                          │
│  https://wsvafihzxxlbgfxbqqmh.supabase.co/.../lead-capture      │
└─────────────────────────────────────────────────────────────────┘
```

**Código da Edge Function:**

```typescript
// supabase/functions/send-lead/index.ts

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { source, full_name, email, phone, message, subject, plan_type } = await req.json();

    // Validação básica
    if (!email || !source) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email e source são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // API Key protegida no backend
    const webhookUrl = 'https://wsvafihzxxlbgfxbqqmh.supabase.co/functions/v1/lead-capture-webhook';
    const apiKey = Deno.env.get('LEAD_WEBHOOK_API_KEY');

    if (!apiKey) {
      console.error('LEAD_WEBHOOK_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuração inválida' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Payload para o webhook externo
    const payload = {
      source,
      full_name: full_name?.trim().substring(0, 100) || '',
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      message: message?.trim().substring(0, 1000) || '',
      subject: subject?.trim().substring(0, 200) || '',
      plan_type: plan_type || null,
      created_at: new Date().toISOString(),
    };

    console.log('Sending lead to webhook:', { source, email: payload.email });

    // Enviar para webhook externo com API Key
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('Webhook error:', response.status, responseText);
      throw new Error(`Webhook retornou ${response.status}`);
    }

    console.log('Lead sent successfully:', { source, email: payload.email });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao enviar lead:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erro ao processar' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

### 3. Atualização dos Formulários

#### Blog.tsx (Newsletter)

```tsx
const [email, setEmail] = useState('');
const [loading, setLoading] = useState(false);

const handleNewsletterSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email.trim()) return;
  
  setLoading(true);
  try {
    const { error } = await supabase.functions.invoke('send-lead', {
      body: { source: 'newsletter', email: email.trim() }
    });
    
    if (error) throw error;
    
    toast({ title: 'Inscrito com sucesso!', description: 'Você receberá nossas novidades.' });
    setEmail('');
  } catch (err) {
    toast({ title: 'Erro ao inscrever', description: 'Tente novamente.', variant: 'destructive' });
  } finally {
    setLoading(false);
  }
};
```

#### Contato.tsx

```tsx
const [loading, setLoading] = useState(false);

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
    
    toast({ title: 'Mensagem enviada!', description: 'Entraremos em contato em breve.' });
    setFormData({ name: '', email: '', phone: '', message: '' });
  } catch (err) {
    toast({ title: 'Erro ao enviar', description: 'Tente novamente.', variant: 'destructive' });
  } finally {
    setLoading(false);
  }
};
```

#### Suporte.tsx

```tsx
const [loading, setLoading] = useState(false);

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
    
    toast({ title: 'Mensagem enviada!', description: 'Entraremos em contato em breve.' });
    setFormData({ name: '', email: '', subject: '', message: '' });
  } catch (err) {
    toast({ title: 'Erro ao enviar', description: 'Tente novamente.', variant: 'destructive' });
  } finally {
    setLoading(false);
  }
};
```

---

### 4. Secret Necessário

Será necessário adicionar o secret `LEAD_WEBHOOK_API_KEY` com o valor:
```
1da7fdeabeba44e3bd9b6852fcd12c40715b999186ae1c1fb0c6c1cc2fec14f9
```

---

### Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| Migração SQL | Criar tabela `orders` |
| `supabase/functions/send-lead/index.ts` | Criar Edge Function proxy |
| `supabase/config.toml` | Adicionar config da função `send-lead` |
| `src/pages/Blog.tsx` | Integrar newsletter com edge function |
| `src/pages/Contato.tsx` | Integrar formulário com edge function |
| `src/pages/Suporte.tsx` | Integrar formulário com edge function |

---

### Segurança

| Aspecto | Implementação |
|---------|---------------|
| **API Key Protegida** | Armazenada como secret, nunca exposta no frontend |
| **Validação de Inputs** | Email validado com regex; campos sanitizados e truncados |
| **CORS Configurado** | Headers permitem chamadas do frontend |
| **RLS na tabela orders** | Apenas admins podem visualizar pedidos |
| **Formulários Públicos** | Não requerem autenticação (leads anônimos) |

