# Atualização dos Endpoints da Infinite Pay

A Infinite Pay migrou os endpoints da API de checkout para um novo domínio. Os payloads e webhooks permanecem inalterados.

## Mudança necessária

Apenas **um ponto** no código usa a API antiga: a função edge `create-infinitepay-link`.

O endpoint de `payment_check` não é usado atualmente no projeto (verificado via busca).

## Alteração

**Arquivo:** `supabase/functions/create-infinitepay-link/index.ts` (linha 124)

- **Antes:** `https://api.infinitepay.io/invoices/public/checkout/links`
- **Depois:** `https://api.checkout.infinitepay.io/links`

Nenhuma alteração no payload, headers ou tratamento de resposta. Webhook URL e demais configurações permanecem iguais.

## Validação

Após o deploy automático da edge function, testar a criação de um link de pagamento via página `/checkout` para confirmar que o novo endpoint retorna `url`/`checkout_url` no mesmo formato.
