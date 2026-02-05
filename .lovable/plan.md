

## Plano: Corrigir Cálculo de Margem para Não Ultrapassar Valor Alocado

### Problema Identificado

O cálculo de margem no Simulador de Ações está incorreto. Cada posição calcula a quantidade máxima usando o **valorAlocado inteiro** em vez de uma fração proporcional.

**Código atual (linha 257):**
```typescript
const qtdMaxMargem = Math.floor(valorAlocado / pos.margemPorAcao);
```

**Exemplo do problema:**
- Valor Alocado: R$ 1.000
- 2 posições, cada uma com margem R$ 0.50/ação
- Cada posição calcula: 1000 / 0.50 = 2000 ações
- Margem por posição: 2000 × 0.50 = R$ 1.000
- **Margem Total: R$ 2.000 (200% do valor alocado!)**

---

### Solução Proposta

Implementar alocação proporcional de margem, similar ao que já existe para o stop financeiro. Cada posição terá um percentual de margem alocada que não pode exceder 100% do total quando somadas.

---

### Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/StockSimulator.tsx` | Limitar quantidade de ações para não exceder margem alocada por posição |

---

### Mudanças Detalhadas

#### 1. Modificar o cálculo em `recalculatePosition` (linha 252-277)

**Lógica corrigida:**
```typescript
const recalculatePosition = (pos: SimulatorPosition): SimulatorPosition => {
  const stopAlocado = stopFinanceiroMax * (pos.stopAlocadoPercent / 100);
  const stopPorAcao = pos.precoAtivo * (pos.stopPercentual / 100);
  const ganhoPorAcao = pos.precoAtivo * (pos.objetivoPercentual / 100);
  
  // CORREÇÃO: Usar a mesma proporção do stop para margem
  // Margem alocada para esta posição = valorAlocado × (stopAlocadoPercent / 100)
  const margemAlocada = valorAlocado * (pos.stopAlocadoPercent / 100);
  
  // Quantidade máxima permitida pela margem alocada
  const qtdMaxMargem = pos.margemPorAcao > 0 
    ? Math.floor(margemAlocada / pos.margemPorAcao) 
    : 0;
  
  // Quantidade máxima permitida pelo stop
  const qtdMaxStop = stopPorAcao > 0 
    ? Math.floor(stopAlocado / stopPorAcao) 
    : 0;
  
  // Quantidade final: menor entre os dois limites
  const quantidade = Math.min(qtdMaxMargem, qtdMaxStop);
  
  const perdaMaxima = quantidade * stopPorAcao;
  const ganhoObjetivo = quantidade * ganhoPorAcao;
  const margemNecessaria = quantidade * pos.margemPorAcao;
  const limiteFator: 'margem' | 'stop' = qtdMaxMargem <= qtdMaxStop ? 'margem' : 'stop';
  
  return {
    ...pos,
    stopAlocado,
    qtdMaxMargem,
    qtdMaxStop,
    quantidade,
    perdaMaxima,
    ganhoObjetivo,
    margemNecessaria,
    limiteFator,
  };
};
```

---

#### 2. Modificar `calculateAllPositions` (linhas 306-350)

Aplicar a mesma lógica na criação inicial das posições:

```typescript
const calculateAllPositions = () => {
  if (selectedAssets.length === 0) return;

  const numPositions = selectedAssets.length;
  const stopPercentEach = 100 / numPositions;

  const newPositions: SimulatorPosition[] = selectedAssets.map(asset => {
    const alavancagem = getAlavancagem(asset.ticker, asset.isManual);
    const margemPorAcao = getMargemPorAcao(asset.ticker, asset.preco, asset.isManual);
    
    // Alocação proporcional
    const stopAlocado = stopFinanceiroMax * (stopPercentEach / 100);
    const margemAlocada = valorAlocado * (stopPercentEach / 100); // CORREÇÃO
    
    const stopPorAcao = asset.preco * (asset.stopPercentual / 100);
    const ganhoPorAcao = asset.preco * (asset.objetivoPercentual / 100);
    
    // Limitar pela margem alocada proporcional
    const qtdMaxMargem = margemPorAcao > 0 
      ? Math.floor(margemAlocada / margemPorAcao) 
      : 0;
    const qtdMaxStop = stopPorAcao > 0 
      ? Math.floor(stopAlocado / stopPorAcao) 
      : 0;
    
    const quantidade = Math.min(qtdMaxMargem, qtdMaxStop);
    // ... resto igual
  });
  // ...
};
```

---

### Resultado Esperado

```text
ANTES (INCORRETO):
+---------------------------+
| Valor Alocado: R$ 1.000   |
| Margem Utilizada: R$ 1999 | <- Excede!
| Margem Disponível: -R$ 999|
+---------------------------+

DEPOIS (CORRETO):
+---------------------------+
| Valor Alocado: R$ 1.000   |
| Margem Utilizada: R$ 800  | <- Dentro do limite
| Margem Disponível: R$ 200 |
+---------------------------+
```

A margem nunca ultrapassará o valor alocado pois cada posição usa apenas sua fração proporcional.

---

### Lógica Matemática Preservada

- Fórmulas de perda/ganho permanecem inalteradas
- Cálculo de alavancagem BTG permanece inalterado
- Apenas a **restrição de margem por posição** é corrigida

---

### Benefícios

1. Margem total nunca excede o valor alocado
2. Distribuição proporcional automática entre posições
3. Usuário pode redistribuir via sliders (como já funciona para stop)
4. Operação sempre será possível de executar na corretora

