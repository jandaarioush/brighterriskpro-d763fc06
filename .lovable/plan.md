

## Plano: Verificar Layout Horizontal do Simulador de Acoes

### Analise da Situacao Atual

Ao analisar o codigo do `StockSimulator.tsx` e comparar com a imagem de referencia enviada, identifiquei que:

**O layout JA ESTA HORIZONTAL!**

O codigo atual na linha 409 usa:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
```

Isso faz com que:
- Em telas pequenas (mobile): Cards empilhados verticalmente (`grid-cols-1`)
- Em telas grandes (desktop): Cards lado a lado horizontalmente (`lg:grid-cols-3`)

### Comparacao com a Imagem de Referencia

A imagem enviada mostra exatamente o comportamento atual:
- Card 1: **Simulacao de Operacao** (esquerda)
- Card 2: **Analise de Risco** (centro)
- Card 3: **Parametros Atuais** (direita)

Todos os 3 cards estao alinhados horizontalmente, que e exatamente como o codigo esta implementado.

### Possivel Causa da Confusao

Se voce esta vendo os cards empilhados verticalmente, pode ser por um destes motivos:

1. **Tamanho da tela**: Em telas menores que 1024px (breakpoint `lg`), os cards ficam empilhados por design responsivo
2. **Zoom do navegador**: Se o zoom estiver muito alto, a tela pode ser interpretada como "pequena"
3. **Janela de preview pequena**: A janela de preview do Lovable pode estar estreita

### Opcoes de Ajuste

Se deseja que os cards fiquem horizontais em telas MENORES, posso ajustar o breakpoint:

| Opcao | Codigo | Tamanho Minimo |
|-------|--------|----------------|
| Atual | `lg:grid-cols-3` | 1024px |
| Alternativa 1 | `md:grid-cols-3` | 768px |
| Alternativa 2 | `sm:grid-cols-3` | 640px |

### Proximos Passos

1. **Se o layout ja esta correto**: Nenhuma acao necessaria - o codigo ja implementa exatamente o que a imagem mostra

2. **Se quer horizontal em telas menores**: Posso alterar `lg:grid-cols-3` para `md:grid-cols-3`

3. **Se ha outro elemento que deveria ser horizontal**: Por favor indique qual secao especifica dentro dos cards voce gostaria de ver em layout horizontal

### Secao Tecnica

**Arquivo:** `src/pages/StockSimulator.tsx`
**Linha:** 409
**Codigo Atual:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
```

Este codigo ja cria o layout horizontal de 3 colunas para os cards principais do simulador.

