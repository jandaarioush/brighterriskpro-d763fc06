# Configuração de Webhook Kiwify - Brighter Risk Pro

## Visão Geral
Este documento descreve como configurar webhooks da Kiwify para automatizar o controle de acesso baseado em pagamentos.

## Fluxo de Funcionamento

1. **Pagamento Aprovado** → Usuário ganha acesso automaticamente
2. **Pagamento Pendente** → Login bloqueado com mensagem informativa
3. **Reembolso/Cancelamento** → Acesso revogado automaticamente

## Configuração na Kiwify

### 1. Acessar Webhooks
1. Entre no painel da Kiwify: https://dashboard.kiwify.com.br
2. Navegue até: **Configurações** → **Webhooks** → **Criar Webhook**

### 2. Configurar URL do Webhook
Cole a URL do webhook com o token de segurança:

```
https://ruicvcblxasrvocwepkl.supabase.co/functions/v1/kiwify-webhook?token=SEU_WEBHOOK_SHARED_TOKEN
```

**IMPORTANTE**: Substitua `SEU_WEBHOOK_SHARED_TOKEN` pelo valor que você configurou no secret `WEBHOOK_SHARED_TOKEN`.

### 3. Selecionar Eventos
Marque os seguintes eventos:
- ✅ `purchase_created` - Quando uma compra é criada
- ✅ `purchase_approved` - Quando o pagamento é aprovado
- ✅ `purchase_refunded` - Quando um reembolso é processado
- ✅ `subscription_canceled` - Quando uma assinatura é cancelada

### 4. Testar Webhook
1. Após salvar, use a função de "Testar Webhook" no painel da Kiwify
2. Verifique os logs em `/admin/webhooks` no aplicativo
3. Confirme que o evento foi recebido e processado

## Estrutura do Payload

A Kiwify envia webhooks no seguinte formato:

```json
{
  "event": "purchase_approved",
  "data": {
    "order_id": "12345",
    "status": "approved",
    "email": "cliente@exemplo.com",
    "name": "Nome do Cliente",
    "product": "Brighter Risk Pro",
    "product_id": "98765",
    "price": 49.90,
    "payment_method": "pix",
    "transaction_date": "2025-10-21T14:32:00Z",
    "customer_id": "kiwify_cus_abc"
  }
}
```

## Processamento de Eventos

### purchase_created
- Cria perfil de usuário com status `pending`
- Usuário não pode fazer login ainda

### purchase_approved
- Atualiza status para `approved`
- Libera acesso ao sistema
- Registra data do pagamento

### purchase_refunded / subscription_canceled
- Muda status para `revoked`
- Bloqueia acesso imediatamente
- Login exibe mensagem de reembolso/cancelamento

## Mensagens ao Usuário

### Pagamento Pendente
> "Seu pagamento ainda não foi confirmado. Assim que for aprovado, seu acesso será liberado automaticamente."

### Acesso Revogado
> "Detectamos um reembolso ou cancelamento da sua assinatura. Se isso foi um engano, entre em contato com o suporte."

### Login Bem-Sucedido
Usuário é redirecionado para `/dashboard`

## Segurança

### Token de Autenticação
- O webhook requer um token de segurança na URL
- Token configurado via secret `WEBHOOK_SHARED_TOKEN`
- Requisições sem token válido são rejeitadas com HTTP 401

### Idempotência
- Sistema impede processamento duplicado do mesmo pedido
- Usa `order_id` como chave de idempotência
- Eventos duplicados são marcados como "skipped"

### RLS (Row Level Security)
- Tabelas `webhook_events` e `audit_logs` sem RLS
- Acesso apenas via edge functions (server-side)
- Sem acesso direto do cliente

## Administração

### Logs de Webhooks
Acesse `/admin/webhooks` para:
- Ver últimos 100 eventos recebidos
- Testar processamento manual de payloads
- Visualizar detalhes de erros
- Status: received, processed, skipped, failed

### Gerenciamento de Usuários
Acesse `/admin/users` para:
- Buscar usuários por email
- Ver status de pagamento de cada usuário
- Ativar/revogar acesso manualmente
- Ver histórico de pagamentos

## Testes

### 1. Teste Manual via Admin
1. Acesse `/admin/webhooks`
2. Cole um payload JSON na área de teste
3. Clique em "Processar"
4. Verifique o resultado na tabela de eventos

### 2. Teste com Pagamento Real
1. Faça uma compra teste no ambiente Kiwify
2. Use Pix para aprovação imediata
3. Verifique logs em `/admin/webhooks`
4. Tente fazer login com o email usado na compra
5. Deve ter acesso liberado

### 3. Teste de Reembolso
1. Processe um reembolso no painel Kiwify
2. Verifique webhook `purchase_refunded` recebido
3. Status do usuário deve mudar para "revoked"
4. Tentativa de login deve ser bloqueada

## Troubleshooting

### Webhook não está chegando
- Verifique URL configurada na Kiwify
- Confirme que o token está correto
- Verifique logs da Kiwify para erros HTTP
- Teste manualmente com RequestBin ou Webhook.site

### Usuário não consegue logar após pagamento
- Verifique se webhook `purchase_approved` foi recebido
- Confirme status em `/admin/users`
- Ative manualmente se necessário
- Verifique audit logs para detalhes

### Eventos duplicados
- Sistema já trata idempotência automaticamente
- Eventos duplicados são marcados como "skipped"
- Não causa problemas no banco de dados

## Contatos de Suporte

Se precisar de ajuda:
1. Verifique logs em `/admin/webhooks`
2. Consulte audit logs para histórico de mudanças
3. Entre em contato com suporte técnico com prints dos logs

---

**Última atualização**: 21/10/2025
