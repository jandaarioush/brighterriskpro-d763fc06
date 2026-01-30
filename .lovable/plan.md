

## Plano: Aplicar Gradiente Dinâmico ao Título Hero

### Problema Identificado

O título "Domine seus Trades com Gestão de Risco Inteligente" na página inicial está usando a classe `text-shimmer`, que aplica um gradiente apenas em tons de dourado.

De acordo com o padrão do projeto, todos os títulos (h1-h6) devem usar a classe `text-gradient-animated` que já é aplicada automaticamente via CSS global e inclui as cores da marca Brighter: **dourado, branco e azul corporativo**.

### Código Atual (Linha 57-60 de Index.tsx)

```tsx
<h1 className="font-montserrat text-5xl md:text-7xl font-bold tracking-tight">
  <span className="text-shimmer">Domine seus Trades com</span>
  <span className="block text-shimmer mt-2">Gestão de Risco Inteligente</span>
</h1>
```

### Solução

Remover a classe `text-shimmer` dos elementos `<span>`, permitindo que o `h1` herde automaticamente o `text-gradient-animated` definido no CSS base.

### Código Corrigido

```tsx
<h1 className="font-montserrat text-5xl md:text-7xl font-bold tracking-tight">
  Domine seus Trades com
  <span className="block mt-2">Gestão de Risco Inteligente</span>
</h1>
```

### Alteração

| Arquivo | Ação |
|---------|------|
| `src/pages/Index.tsx` | Remover `text-shimmer` dos spans e simplificar estrutura do h1 |

### Resultado Visual

O título exibirá o gradiente animado dinâmico com as cores da paleta Brighter:
- Dourado (HSL 43 96% 56%)
- Branco (#ffffff)
- Azul corporativo (#0c2238)

Com animação fluida de 6 segundos (`gradient-flow`) que percorre as cores horizontalmente.

