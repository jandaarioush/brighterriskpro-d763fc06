
Step 1 funcionou (Router + ThemeProvider OK). Agora avanço para step 2 adicionando a próxima camada de providers de UI/data: `QueryClientProvider`, `TooltipProvider`, `Toaster` (shadcn) e `Sonner`. Se step 2 quebrar, o culpado está nesse grupo. Se passar, próximo step adiciona `AuthProvider` e depois as rotas reais.

## Plano

Editar `src/App.tsx` para:
- manter `BrowserRouter` + `ThemeProvider`
- adicionar `QueryClientProvider` (com `new QueryClient()`)
- adicionar `TooltipProvider`
- montar `<Toaster />` (shadcn) e `<Sonner />`
- manter rota `*` apontando para um componente `Home` simples com texto "Bisect step 2"

Não tocar em mais nada (sem `AuthProvider`, sem rotas reais, sem Helmet).

## Validação

1. publicar
2. hard refresh em `riskpro.brighter.com.br`
3. se aparecer "Bisect step 2" → seguimos para step 3 (AuthProvider)
4. se voltar tela branca → o culpado está em um destes 4: QueryClient, TooltipProvider, Toaster shadcn ou Sonner — aí faço sub-bisect
