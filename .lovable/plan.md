

## Diagnóstico

Erro no console do domínio publicado:
```
Uncaught TypeError: Cannot read properties of null (reading 'useState')
  at at.useState (index-DKJTTv-e.js:9:6397)
```

Isso é o sintoma clássico de **duas cópias do React** no bundle de produção. O preview funciona (Vite dev resolve módulos sob demanda) mas o build falha. O culpado mais provável neste projeto é `react-helmet-async`, que historicamente força bundlers a empacotar uma segunda instância de React quando não há `dedupe` configurado.

## Fix (1 arquivo)

**`vite.config.ts`** — adicionar `resolve.dedupe` para garantir uma única instância de React/ReactDOM no bundle:

```ts
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
  dedupe: ["react", "react-dom", "react/jsx-runtime"],
},
```

Isso resolve o erro sem mudar nenhum código de aplicação. Depois é só republicar.

## Plano B (se o dedupe não bastar)

Remover `react-helmet-async` (usado apenas em `main.tsx` como `<HelmetProvider>` wrapper, sem `<Helmet>` ativos no projeto até onde vimos). Dropar o provider e o pacote elimina a fonte de duplicação. Aplico só se o A não resolver.

## Próximos passos

1. Aplicar o `dedupe` no `vite.config.ts`.
2. Você clica em **Publish → Update**.
3. Hard refresh em `riskpro.brighter.com.br`.

