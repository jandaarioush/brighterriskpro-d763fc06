

## Plano: Configurar Stop/Gain Individual por Ativo e Remover Modalidade

### O que será feito

1. **Remover seleção de Modalidade** - O dropdown "Day Trade / Swing Trade" será removido da Etapa 3
2. **Forçar Day Trade** - A modalidade será fixada como `daytrade` para que ativos BTG tenham alavancagem automática
3. **Stop/Gain Individual por Ativo** - Quando houver múltiplos ativos selecionados, cada um terá seus próprios sliders de Stop Loss % e Objetivo %

---

### Interface Atualizada

**Antes (Etapa 3):**
```text
┌──────────────────────────────────────────────────────────────┐
│  Modalidade: [Day Trade ▾]                                   │
│  Valor Alocado: [1000]                                       │
│  Stop Financeiro: [500]                                      │
│                                                              │
│  Stop Loss (%): ──────●──────── 2.0%  (global)               │
│  Objetivo (%):  ──────●──────── 4.0%  (global)               │
└──────────────────────────────────────────────────────────────┘
```

**Depois (Etapa 3 com múltiplos ativos):**
```text
┌──────────────────────────────────────────────────────────────┐
│  ❌ Modalidade removido (forçado Day Trade)                  │
│                                                              │
│  Valor Alocado: [1000]                                       │
│  Stop Financeiro: [500]                                      │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  PETR4 (3x) - R$ 38.50                                  │ │
│  │  Stop: ───●───── 2.0%    Objetivo: ───●───── 4.0%       │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  VALE3 (3x) - R$ 62.30                                  │ │
│  │  Stop: ───●───── 3.0%    Objetivo: ───●───── 6.0%       │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  ITUB4 (5x) - R$ 28.10                                  │ │
│  │  Stop: ───●───── 1.5%    Objetivo: ───●───── 3.0%       │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

### Mudanças no Código

#### 1. Atualizar Interface `SelectedAsset`

Adicionar campos para stop e objetivo individuais:

```typescript
interface SelectedAsset {
  ticker: string;
  preco: number;
  isManual?: boolean;
  stopPercentual: number;    // NOVO
  objetivoPercentual: number; // NOVO
}
```

#### 2. Remover estado `modalidade`

```typescript
// REMOVER esta linha:
const [modalidade, setModalidade] = useState<Modalidade>('daytrade');

// REMOVER o tipo Modalidade
type Modalidade = 'daytrade' | 'swing';
```

#### 3. Atualizar função `addAsset`

Inicializar com valores padrão de stop/objetivo:

```typescript
const addAsset = (ticker: string, isManual: boolean = false) => {
  if (!isSelected(ticker)) {
    setSelectedAssets(prev => [...prev, { 
      ticker, 
      preco: 0, 
      isManual,
      stopPercentual: 2.0,      // valor padrão
      objetivoPercentual: 4.0   // valor padrão
    }]);
  }
};
```

#### 4. Adicionar funções de atualização individual

```typescript
const updateAssetStopPercentual = (ticker: string, value: number) => {
  setSelectedAssets(prev => prev.map(a => 
    a.ticker === ticker ? { ...a, stopPercentual: value } : a
  ));
};

const updateAssetObjetivoPercentual = (ticker: string, value: number) => {
  setSelectedAssets(prev => prev.map(a => 
    a.ticker === ticker ? { ...a, objetivoPercentual: value } : a
  ));
};
```

#### 5. Simplificar funções de alavancagem (sem modalidade)

```typescript
const getMargemPorAcao = (ticker: string, preco: number, isManual?: boolean): number => {
  if (isManual) return preco;
  const btgAsset = getBTGAsset(ticker);
  if (btgAsset) return btgAsset.marginPerShare;
  return preco;
};

const getAlavancagem = (ticker: string, isManual?: boolean): number => {
  if (isManual) return 1;
  const btgAsset = getBTGAsset(ticker);
  return btgAsset?.leverage || 1;
};
```

#### 6. Atualizar Etapa 3 (Parâmetros)

Remover dropdown de Modalidade e adicionar sliders individuais:

```tsx
{/* Step 3: Global Parameters */}
{currentStep === 'params' && (
  <Card className="p-6 max-w-4xl mx-auto">
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left Column - Valor Alocado e Stop Máximo */}
      <div className="space-y-5">
        {/* Valor Alocado */}
        <div>...</div>
        
        {/* Stop Financeiro Máximo */}
        <div>...</div>
      </div>

      {/* Right Column - Sliders individuais por ativo */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Stop e Objetivo por Ativo</Label>
        <ScrollArea className="h-[300px] pr-2">
          {selectedAssets.map((asset) => (
            <div key={asset.ticker} className="p-4 rounded-lg border bg-card mb-3">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold">{asset.ticker}</span>
                <span className="text-xs text-muted-foreground">
                  {getAlavancagem(asset.ticker, asset.isManual)}x | R$ {asset.preco.toFixed(2)}
                </span>
              </div>
              
              {/* Stop Loss Individual */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">Stop Loss</span>
                  <span className="text-sm font-bold text-destructive">{asset.stopPercentual.toFixed(1)}%</span>
                </div>
                <Slider
                  value={[asset.stopPercentual]}
                  onValueChange={(v) => updateAssetStopPercentual(asset.ticker, v[0])}
                  min={0.1}
                  max={20}
                  step={0.1}
                />
              </div>
              
              {/* Objetivo Individual */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">Objetivo</span>
                  <span className="text-sm font-bold text-success">{asset.objetivoPercentual.toFixed(1)}%</span>
                </div>
                <Slider
                  value={[asset.objetivoPercentual]}
                  onValueChange={(v) => updateAssetObjetivoPercentual(asset.ticker, v[0])}
                  min={0.1}
                  max={20}
                  step={0.1}
                />
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  </Card>
)}
```

#### 7. Atualizar `calculateAllPositions`

Usar valores individuais de cada ativo:

```typescript
const calculateAllPositions = () => {
  const newPositions: SimulatorPosition[] = selectedAssets.map(asset => {
    const alavancagem = getAlavancagem(asset.ticker, asset.isManual);
    const margemPorAcao = getMargemPorAcao(asset.ticker, asset.preco, asset.isManual);
    const stopPorAcao = asset.preco * (asset.stopPercentual / 100);  // Usar valor individual
    const ganhoPorAcao = asset.preco * (asset.objetivoPercentual / 100);  // Usar valor individual
    
    // ... resto do cálculo
    
    return {
      // ...
      stopPercentual: asset.stopPercentual,        // Do ativo
      objetivoPercentual: asset.objetivoPercentual, // Do ativo
      // ...
    };
  });
};
```

---

### Resumo das Alterações

| Componente | Mudança |
|------------|---------|
| Interface `SelectedAsset` | Adicionar `stopPercentual` e `objetivoPercentual` |
| Estado `modalidade` | Remover (forçar Day Trade) |
| Funções `getMargemPorAcao` e `getAlavancagem` | Remover lógica de swing trade |
| Etapa 3 | Remover dropdown Modalidade; adicionar sliders individuais por ativo |
| `calculateAllPositions` | Usar valores individuais de stop/objetivo de cada ativo |
| Estados globais `stopLossPercent` e `objetivoPercent` | Remover (substituídos pelos individuais) |

---

### Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/StockSimulator.tsx` | Implementar todas as mudanças acima |

