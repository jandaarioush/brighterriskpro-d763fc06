
Objetivo

Executar o Plano B removendo `react-helmet-async` por completo. Pela leitura do código, ele só é usado em `src/main.tsx` e `src/pages/Demo.tsx`, então a superfície de mudança é pequena e é a forma mais limpa de eliminar a fonte mais provável da duplicação de React no build publicado.

Implementação

1. `src/main.tsx`
   - remover o import de `HelmetProvider`
   - remover o wrapper `<HelmetProvider>`
   - renderizar `<App />` diretamente

2. `src/pages/Demo.tsx`
   - remover `Helmet` do import
   - remover o bloco `<Helmet>...</Helmet>`
   - manter toda a página e a lógica do formulário intactas

3. Dependências
   - remover `react-helmet-async` do `package.json`
   - sincronizar o lockfile usado no projeto para o build não instalar a dependência antiga por engano

4. Meta tags
   - manter `vite.config.ts` como está, com `dedupe`, como proteção extra
   - revisar `index.html`: ele já tem `<title>` e meta tags estáticas, então pode assumir esse papel global após a remoção
   - só ajustar o texto do `index.html` se quisermos preservar exatamente a copy que hoje está no `/demo`

Validação

1. gerar novo build/publicação
2. fazer hard refresh no domínio
3. confirmar que o bundle publicado mudou
4. validar que o erro `Cannot read properties of null (reading 'useState')` desapareceu

Impacto esperado

- sem mudanças em backend, banco, auth ou regras de negócio
- risco baixo
- a única perda potencial é o SEO/meta dinâmico específico do `/demo`, mas isso pode ficar coberto pelas tags estáticas do `index.html`
