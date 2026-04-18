

## Objetivo

Espelhar os eventos pós-venda do Infinite Pay para um segundo site (webhook externo) **em paralelo**, sem afetar a confirmação de pagamento aqui.

## Como funciona hoje

A edge function `infinitepay-webhook` recebe o POST da Infinite Pay, valida token, grava `pending_orders → paid`, cria `subscription`, atualiza `profile` e responde 200. Tudo síncrono.

## Solução: forward não-bloqueante

Adicionar um **fan-out** dentro da `infinitepay-webhook` que dispara um POST para `EXTERNAL_FORWARD_URL` em paralelo, sem `await` na resposta principal — usando `EdgeRuntime.waitUntil()` (mantém o processo vivo até terminar, mas a Infinite Pay já recebeu seu 200).

### Por que assim e não outra abordagem

| Opção | Prós | Contras |
|---|---|---|
| **Fan-out na própria função (escolhida)** | Simples, 1 deploy, sem nova infra | Acoplamento leve no código |
| Segunda função chamada por trigger no DB | Desacoplado | Precisa pg_net + cron, mais peças |
| Webhook duplo configurado na Infinite Pay | Zero código | Infinite Pay normalmente só aceita 1 URL |

Fan-out é o padrão certo aqui.

### Garantias

- **Não bloqueia**: usa `waitUntil`, então erro/lentidão no site externo **não** afeta o 200 devolvido à Infinite Pay
- **Sem conflito de dados**: o site externo recebe uma cópia read-only do payload, nada escreve no banco daqui
- **Idempotência**: payload inclui `order_nsu` para o destino deduplicar
- **Auditável**: cada tentativa loga em `webhook_events` com `provider='external_forward'` e status `forwarded` / `forward_failed` + status HTTP
- **Retry simples**: 1 retry após 2s em caso de falha de rede / 5xx (não retry em 4xx)
- **Segurança**: header `X-Forward-Token` com secret compartilhado para o destino validar

## Implementação

### 1. Secrets novos (vou pedir via add_secret após aprovação)
- `EXTERNAL_FORWARD_URL` — URL completa do endpoint do outro site
- `EXTERNAL_FORWARD_TOKEN` — token compartilhado para autenticar o forward

### 2. Edição em `supabase/functions/infinitepay-webhook/index.ts`

Adicionar, **logo antes do `return 200` final**:

```ts
const forwardUrl = Deno.env.get("EXTERNAL_FORWARD_URL");
const forwardToken = Deno.env.get("EXTERNAL_FORWARD_TOKEN");

if (forwardUrl) {
  const forwardPayload = {
    source: "brighter-riskpro",
    event: "payment_approved",
    order_nsu,
    transaction_nsu,
    invoice_slug,
    amount,
    paid_amount,
    plano: pendingOrder?.plano,
    email: pendingOrder?.email,
    name: pendingOrder?.name,
    phone: pendingOrder?.phone,
    receipt_url,
    occurred_at: new Date().toISOString(),
  };

  // não bloqueia a resposta à Infinite Pay
  EdgeRuntime.waitUntil(
    forwardToExternal(supabase, forwardUrl, forwardToken, order_nsu, forwardPayload)
  );
}
```

E uma helper `forwardToExternal()` com:
- `fetch` com timeout 10s
- 1 retry após 2s se erro de rede ou 5xx
- log em `webhook_events` (status `forwarded` ou `forward_failed`, com http status no `raw_payload`)

### 3. Sem mudanças em
- Schema do banco (reusa `webhook_events`)
- `supabase/config.toml` (função já existe com `verify_jwt = false`)
- Frontend
- Outras funções

## Validação

1. Curl no `infinitepay-webhook` simulando um pagamento → confirmar 200 imediato + log no `webhook_events` mostrando linha `external_forward` com status `forwarded`
2. Apontar `EXTERNAL_FORWARD_URL` para um endpoint inválido → confirmar que o pagamento ainda é processado normalmente e fica `forward_failed` no log
3. Conferir que o site externo recebeu o payload com header `X-Forward-Token` correto

## O que preciso de você antes de implementar

1. Confirmar a URL do site externo que receberá o forward (você define agora ou prefere configurar depois via secret?)
2. Confirmar que o site externo aceita um POST JSON com o shape descrito acima — ou se você prefere outro formato (ex.: query string, form-urlencoded, campos com nomes diferentes)
3. Confirmar se quer apenas o evento `payment_approved` ou também outros futuros (refund, chargeback) — hoje só temos approved

