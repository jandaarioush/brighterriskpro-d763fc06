<final-text>Objetivo

Corrigir a tela branca publicada atacando o culpado mais provável que ainda sobrou: o grafo de dependências usado no build.

Do I know what the issue is?

Sim — o código já não usa mais `react-helmet-async`, mas o repositório ainda está inconsistente:
- `package.json` e `package-lock.json` já estão limpos
- `src/main.tsx` e `src/pages/Demo.tsx` já não usam Helmet
- porém `bun.lock` ainda referencia `react-helmet-async`

Como existem lockfiles de npm e Bun ao mesmo tempo, o build publicado pode estar instalando uma árvore antiga mesmo depois das mudanças no código. Isso combina com o sintoma: hash do bundle mudou, mas o erro `Cannot read properties of null (reading 'useState')` continua.

Plano

1. Normalizar o gerenciador de pacotes
- usar `npm` como fonte única de verdade, porque o projeto já tem `package-lock.json` e o README aponta para `npm`
- remover `bun.lock` e `bun.lockb` do repositório
- manter `package-lock.json` sincronizado com o `package.json`

2. Preservar os fixes já feitos
- manter `vite.config.ts` com `dedupe: ["react", "react-dom", "react/jsx-runtime"]`
- manter a remoção de `react-helmet-async` do código

3. Republicar
- gerar novo publish após a limpeza dos lockfiles
- fazer hard refresh no domínio

4. Validação
- confirmar que o bundle publicado mudou
- validar que a home monta sem tela branca
- checar se o erro de `useState` desapareceu no console

Fallback se ainda falhar
- fazer um bisect no topo do app em `src/App.tsx`
- montar temporariamente uma versão mínima e reintroduzir providers nesta ordem:
  1. `BrowserRouter`
  2. `ThemeProvider`
  3. `QueryClientProvider`
  4. `TooltipProvider`
  5. `Toaster` / `Sonner`
  6. `AuthProvider`
- isso isola rapidamente se o problema restante vem de algum provider/lib e não mais do lockfile

Arquivos envolvidos
- `bun.lock`
- `bun.lockb`
- `package-lock.json`
- `package.json`
- `vite.config.ts`
- `src/main.tsx`
- `src/pages/Demo.tsx`
- `src/App.tsx` (somente se o fallback for necessário)

Impacto esperado
- sem mudança de regra de negócio
- sem mudança de banco/auth
- risco baixo
- maior chance de resolver de forma definitiva porque elimina a inconsistência de instalação do build publicado</final-text>