

## Plano: Igualar Limite Máximo dos Sliders Stop e Gain para 20%

### Situação Atual

Os sliders de Stop Loss e Objetivo/Gain têm limites diferentes:

| Slider | Mínimo | Máximo Atual | Máximo Desejado |
|--------|--------|--------------|-----------------|
| Stop Loss (%) | 0.1% | **10%** | **20%** |
| Objetivo/Gain (%) | 0.1% | 20% | 20% (manter) |

### Mudança Necessária

Alterar o slider de **Stop Loss** para ter máximo de **20%**, igualando ao slider de Objetivo/Gain.

### Código a Modificar

**Arquivo:** `src/pages/StockSimulator.tsx`

**Linhas 798-809:**

```tsx
// ANTES
<Slider
  value={[stopLossPercent]}
  onValueChange={(v) => setStopLossPercent(v[0])}
  min={0.1}
  max={10}  // <- Limite atual de 10%
  step={0.1}
  className="w-full"
/>
<div className="flex justify-between text-xs text-muted-foreground mt-1">
  <span>0.1%</span>
  <span>10%</span>  // <- Label mostra 10%
</div>

// DEPOIS
<Slider
  value={[stopLossPercent]}
  onValueChange={(v) => setStopLossPercent(v[0])}
  min={0.1}
  max={20}  // <- Novo limite de 20%
  step={0.1}
  className="w-full"
/>
<div className="flex justify-between text-xs text-muted-foreground mt-1">
  <span>0.1%</span>
  <span>20%</span>  // <- Label atualizado para 20%
</div>
```

### Resultado Visual

```text
+----------------------------------------+
|  Stop Loss (%)                   3.0%  |
|  [=======---------------]              |
|  0.1%                           20%    |
+----------------------------------------+
|  Objetivo / Gain (%)             3.0%  |
|  [=======---------------]              |
|  0.1%                           20%    |
+----------------------------------------+
```

Ambos os sliders terão o mesmo range (0.1% a 20%), permitindo configurações simétricas de risco/retorno.

### Arquivo a Modificar

| Arquivo | Linhas | Mudança |
|---------|--------|---------|
| `src/pages/StockSimulator.tsx` | 802, 808 | Alterar max de 10 para 20 e label de "10%" para "20%" |

