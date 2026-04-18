

## Objetivo

Atualizar a URL de destino do forward externo para:
`https://rvbpzyermweutfzaucmq.supabase.co/functions/v1/sales-webhook?source=infinitepay&origin=riskpro`

## Como aplicar

A URL vive no secret `EXTERNAL_FORWARD_URL` (lido em runtime pela edge `infinitepay-webhook`). Não há nada para mudar no código — basta sobrescrever o valor do secret.

### Passos

1. Atualizar o secret `EXTERNAL_FORWARD_URL` para a nova URL completa (com query params `?source=infinitepay&origin=riskpro` inclusos).
2. Confirmar que `EXTERNAL_FORWARD_TOKEN` continua válido para o novo destino (`sales-webhook` precisa esperar o header `X-Forward-Token` com esse mesmo valor — se o outro projeto usar token diferente, também atualizamos).
3. Como o secret é lido a cada invocação via `Deno.env.get(...)`, o efeito é imediato — sem redeploy necessário.

## Validação

1. Disparar um pagamento de teste (ou curl no `infinitepay-webhook`) e conferir em `webhook_events` uma linha `provider='external_forward'` com `status='forwarded'` e `http_status=200`.
2. Verificar do lado do `sales-webhook` no projeto `rvbpzyermweutfzaucmq` que o POST chegou com os query params e o header `X-Forward-Token`.

## O que preciso confirmar antes de executar

- O `EXTERNAL_FORWARD_TOKEN` atual deve ser aceito pelo `sales-webhook`? Se não, me diga o token correto que devo configurar.

