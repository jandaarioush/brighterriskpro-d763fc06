

## Plano: Melhorias no Simulador, Trades e Dashboard de Acoes

### Resumo das Solicitacoes

O usuario pediu 4 melhorias:
1. **Simulador - Edicao na Analise de Risco:** Permitir ajustar quantidade de acoes diretamente no card de Analise de Risco com sliders para redistribuir risco entre ativos
2. **Simulador - Layout Horizontal:** Manter os 3 cards lado a lado (Simulacao de Operacao, Analise de Risco, Parametros Atuais)
3. **Trades - Integrar BTG:** Atualizar o formulario de trades para usar autocomplete de tickers BTG com alavancagem automatica
4. **Dashboard - Simulacao Rapida:** Adicionar calculadora/simulador rapido no inicio do dashboard de Acoes

---

### Mudanca 1: Edicao na Analise de Risco (Sliders)

#### Situacao Atual
O card "Analise de Risco" mostra apenas informacoes estaticas (quantidade, alocacao, perda, ganho). A edicao de sliders so esta disponivel no card "Simulacao de Operacao".

#### Proposta
Adicionar sliders no card "Analise de Risco" para que o usuario possa ajustar a distribuicao de risco diretamente ali, sem precisar voltar ao primeiro card.

```
+--------------------------------------------------+
|  PETR4 98x                    [Limitado por Stop] |
|  Quantidade: 331    Alocacao: [====50%====] 50%   |
|  ^ R$ 249.57        @ R$ 249.57                   |
|  Valor posicao: R$ 12478.70                       |
+--------------------------------------------------+
```

#### Implementacao
- Reaproveitar o componente `Slider` existente
- Chamar a mesma funcao `handleStopAllocationChange` quando o slider for ajustado
- Mostrar feedback visual instantaneo (quantidade recalculada)

---

### Mudanca 2: Layout Horizontal (Ja Implementado)

#### Situacao Atual
Os 3 cards JA estao lado a lado em desktop (`lg:grid-cols-3`). O layout atual ja segue a ordem correta:
1. Simulacao de Operacao
2. Analise de Risco  
3. Parametros Atuais

#### Acao
Manter o layout atual. Se necessario, apenas ajustar responsividade para telas menores.

---

### Mudanca 3: Trades - Integrar BTG (Alavancagem Automatica)

#### Situacao Atual
O formulario `StockTradeForm` tem:
- Input de ticker manual (sem autocomplete BTG)
- Campo de alavancagem manual (usuario digita 1, 98, etc)
- Nenhuma referencia a lista de ativos BTG

#### Proposta
Atualizar o `StockTradeForm` para:
1. Usar `Popover + Command` para autocomplete de tickers BTG (igual ao Simulador)
2. Ao selecionar ticker BTG, preencher alavancagem automaticamente
3. Mostrar info de alavancagem BTG quando Day Trade selecionado

```
+------------------------------------------+
|  Ticker *                                 |
|  [PETR4 v]                                |
|  Alavancagem BTG: 98x | Margem: R$ 0.37   |
+------------------------------------------+
```

#### Arquivos
- **Modificar:** `src/components/stock/StockTradeForm.tsx`

#### Logica
```typescript
// Quando selecionar ticker BTG + modalidade daytrade
const btgAsset = getBTGAsset(ticker);
if (formData.modalidade === 'daytrade' && btgAsset) {
  setFormData({ ...formData, ticker, alavancagem: btgAsset.leverage.toString() });
}
```

---

### Mudanca 4: Dashboard - Simulacao Rapida

#### Situacao Atual
O dashboard de Acoes (`StockDashboard.tsx`) mostra:
- Stats (Risco Mensal, Risco Diario, Resultado)
- Grafico de Evolucao do P&L
- Calculadora de Posicao (StockRiskCalculator)
- Heatmap e Form de Trade

O `StockRiskCalculator` ja existe, mas esta posicionado ao lado do grafico.

#### Proposta
Reposicionar a Calculadora de Posicao para o INICIO do dashboard, com destaque visual, permitindo simulacao rapida antes de entrar em operacao.

```
+------------------------------------------------+
|  BOA TARDE, JAN!                               |
|  Tabs: Voltar | Calendario | Trades | Simulador|
+------------------------------------------------+
|  ACOES - BTG Pactual                           |
+------------------------------------------------+
|  [======= SIMULACAO RAPIDA =========]          |
|  Calculadora de posicao compacta aqui          |
+------------------------------------------------+
|  Risco Mensal | Risco Diario | Resultado       |
+------------------------------------------------+
|  ...resto do dashboard...                      |
+------------------------------------------------+
```

#### Arquivos
- **Modificar:** `src/pages/StockDashboard.tsx`

#### Implementacao
- Mover `StockRiskCalculator` para antes dos stats cards
- Adicionar titulo destacado "Simulacao Rapida"
- Manter versao atual na posicao original opcional ou remover para evitar duplicacao

---

### Secao Tecnica

#### Arquivos Modificados

| Arquivo | Mudancas |
|---------|----------|
| `src/pages/StockSimulator.tsx` | Adicionar sliders no card Analise de Risco |
| `src/components/stock/StockTradeForm.tsx` | Integrar autocomplete BTG + alavancagem automatica |
| `src/pages/StockDashboard.tsx` | Reposicionar StockRiskCalculator para o inicio |

---

### Detalhes de Implementacao

#### 1. StockSimulator - Slider na Analise de Risco

Adicionar slider dentro de cada posicao no card "Analise de Risco":

```tsx
// No card de Analise de Risco, para cada posicao
<div className="space-y-2">
  <div className="flex justify-between items-center text-sm">
    <span className="text-muted-foreground">Alocacao:</span>
    <span className="font-bold text-primary">
      {pos.stopAlocadoPercent.toFixed(0)}%
    </span>
  </div>
  <Slider
    value={[pos.stopAlocadoPercent]}
    onValueChange={(v) => handleStopAllocationChange(pos.id, v[0])}
    min={5}
    max={positions.length === 1 ? 100 : 95}
    step={1}
  />
</div>
```

#### 2. StockTradeForm - Autocomplete BTG

Adicionar imports e logica:

```typescript
import { getBTGAsset, getBTGTickers } from '@/lib/btgAssets';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// State
const [tickerOpen, setTickerOpen] = useState(false);
const btgTickers = getBTGTickers();

// Ao selecionar ticker
const handleTickerSelect = (ticker: string) => {
  const btgAsset = getBTGAsset(ticker);
  if (formData.modalidade === 'daytrade' && btgAsset) {
    setFormData({ 
      ...formData, 
      ticker, 
      alavancagem: btgAsset.leverage.toString() 
    });
  } else {
    setFormData({ ...formData, ticker });
  }
  setTickerOpen(false);
};
```

#### 3. StockDashboard - Simulacao Rapida

Reposicionar o componente:

```tsx
// Logo apos os tabs e titulo
<div className="mb-8">
  <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
    <div className="flex items-center gap-3 mb-4">
      <Calculator className="h-6 w-6 text-primary" />
      <h2 className="text-xl font-bold">Simulacao Rapida</h2>
    </div>
    <StockRiskCalculator 
      broker={broker || 'outra'} 
      capitalTotal={capitalTotal} 
      onCapitalChange={handleCapitalChange} 
    />
  </Card>
</div>
```

---

### Resultado Final

1. **Simulador mais intuitivo:** Usuario pode ajustar distribuicao de risco diretamente na Analise de Risco sem precisar rolar para o primeiro card
2. **Trades com alavancagem BTG:** Ao registrar trade de Day Trade, sistema sugere tickers BTG e preenche alavancagem automaticamente
3. **Simulacao rapida no Dashboard:** Usuario ve calculadora de posicao logo ao abrir o dashboard, facilitando planejamento antes de operar

