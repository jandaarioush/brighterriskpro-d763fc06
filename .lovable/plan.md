
## Plano: Implementar Lógica Matemática do Mercado Internacional com NinjaTrader

### Objetivo

Criar toda a infraestrutura do dashboard de Mercado Internacional usando NinjaTrader como corretora parceira, seguindo a mesma estrutura e lógica do mercado de ações (BTG).

---

### Componentes a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/lib/ninjatraderAssets.ts` | **CRIAR** - Lista de ativos NinjaTrader com margens |
| `src/lib/internationalRiskCalculations.ts` | **CRIAR** - Cálculos de risco para futuros internacionais |
| `src/components/international/BrokerSelectionDialog.tsx` | **CRIAR** - Dialog de seleção (NinjaTrader como principal) |
| `src/components/international/InternationalRiskCalculator.tsx` | **CRIAR** - Calculadora de posição para futuros |
| `src/components/international/InternationalTradeForm.tsx` | **CRIAR** - Formulário de trades internacionais |
| `src/components/international/InternationalMonthHeatmap.tsx` | **CRIAR** - Heatmap mensal |
| `src/components/international/InternationalPnLEvolutionChart.tsx` | **CRIAR** - Gráfico de evolução P&L |
| `src/pages/InternationalDashboard.tsx` | **CRIAR** - Dashboard principal |
| `src/App.tsx` | **MODIFICAR** - Adicionar rota do dashboard internacional |

---

### 1. Lista de Ativos NinjaTrader

**Arquivo:** `src/lib/ninjatraderAssets.ts`

Estrutura baseada nos dados coletados do site:

```typescript
export interface NinjaTraderAsset {
  symbol: string;           // Ex: "MES", "NQ", "CL"
  name: string;             // Ex: "Micro E-mini S&P 500"
  exchange: string;         // Ex: "CME", "NYMEX", "COMEX"
  group: string;            // Ex: "Micro Indices", "E-Mini Indices", "Crypto"
  dayMargin: number;        // Margem intradiária em USD
  initialMargin: number;    // Margem inicial (overnight) em USD
  tickSize: number;         // Tamanho do tick
  tickValue: number;        // Valor por tick em USD
  pointValue: number;       // Valor por ponto em USD
  currency: 'USD' | 'EUR';  // Moeda base
}
```

**Ativos Principais a Incluir:**

| Símbolo | Mercado | Day Margin | Initial | Tick Size | Tick Value |
|---------|---------|------------|---------|-----------|------------|
| MES | Micro E-mini S&P 500 | $50 | $2,498.60 | 0.25 | $1.25 |
| MNQ | Micro E-mini NASDAQ-100 | $100 | $3,686.57 | 0.25 | $0.50 |
| M2K | Micro E-mini Russell 2000 | $50 | $1,045.02 | 0.10 | $0.50 |
| MYM | Micro E-mini Dow | $50 | $1,567.71 | 1.00 | $0.50 |
| ES | E-Mini S&P 500 | $500 | $24,985.95 | 0.25 | $12.50 |
| NQ | E-Mini NASDAQ 100 | $1,000 | $36,865.75 | 0.25 | $5.00 |
| RTY | E-Mini Russell 2000 | $500 | $10,450.22 | 0.10 | $5.00 |
| MCL | Micro Crude Oil | $100 | $470.99 | 0.01 | $1.00 |
| CL | Crude Oil | $1,000 | $4,687.83 | 0.01 | $10.00 |
| GC | Gold | $2,000 | $29,169.80 | 0.10 | $10.00 |
| MGC | E-Micro Gold | $200 | $2,917.20 | 0.10 | $1.00 |
| SI | Silver | $4,000 | $68,464.00 | 0.005 | $25.00 |
| MBT | Micro Bitcoin | $100 | $2,351.80 | 5.00 | $0.50 |
| 6E | Euro FX | $500 | $3,190.00 | 0.00005 | $6.25 |
| 6B | British Pound | $500 | $2,200.00 | 0.0001 | $6.25 |
| NG | Natural Gas | $1,000 | $12,697.00 | 0.001 | $10.00 |

---

### 2. Cálculos de Risco Internacional

**Arquivo:** `src/lib/internationalRiskCalculations.ts`

Lógica específica para futuros internacionais:

```typescript
// Calcular resultado de trade
export function calculateInternationalTradeResult(
  ticksGained: number,      // Quantidade de ticks ganhos/perdidos
  tickValue: number,        // Valor por tick em USD
  contracts: number,        // Número de contratos
  commission: number = 0    // Comissão por contrato
): { resultUSD: number; resultBRL: number } {
  const resultUSD = (ticksGained * tickValue * contracts) - (commission * contracts);
  // resultBRL será calculado com taxa de câmbio
  return { resultUSD, resultBRL: resultUSD * exchangeRate };
}

// Calcular quantidade máxima de contratos baseado no risco
export function calculateMaxContracts(
  capitalUSD: number,          // Capital disponível em USD
  dayMargin: number,           // Margem intradiária por contrato
  stopLossValue: number,       // Valor do stop loss em USD por contrato
  maxRiskPercent: number       // Percentual máximo de risco
): number {
  const maxRiskValue = capitalUSD * (maxRiskPercent / 100);
  const contractsByMargin = Math.floor(capitalUSD / dayMargin);
  const contractsByRisk = Math.floor(maxRiskValue / stopLossValue);
  return Math.min(contractsByMargin, contractsByRisk);
}
```

---

### 3. Dialog de Seleção de Broker

**Arquivo:** `src/components/international/BrokerSelectionDialog.tsx`

```typescript
export type InternationalBrokerType = 'ninjatrader' | 'interactive_brokers' | 'tradestation' | 'outra';

const brokerOptions = [
  { 
    value: 'ninjatrader', 
    label: 'NinjaTrader', 
    description: 'Margens intradiárias a partir de $50 para Micros' 
  },
  { 
    value: 'interactive_brokers', 
    label: 'Interactive Brokers', 
    description: 'Corretora global com múltiplos mercados' 
  },
  { 
    value: 'tradestation', 
    label: 'TradeStation', 
    description: 'Plataforma americana tradicional' 
  },
  { 
    value: 'outra', 
    label: 'Outra', 
    description: 'Configuração manual de margens' 
  },
];
```

---

### 4. Calculadora de Posição Internacional

**Arquivo:** `src/components/international/InternationalRiskCalculator.tsx`

Similar ao `StockRiskCalculator.tsx` mas com campos específicos:

- **Capital em USD**: Capital total disponível
- **Taxa de Câmbio**: USD/BRL (campo editável com valor sugerido)
- **Stop Financeiro Máximo**: Em USD
- **Seleção de Ativo**: Dropdown com ativos NinjaTrader
- **Stop em Ticks**: Quantos ticks de stop
- **Cálculo Automático**:
  - Número máximo de contratos
  - Margem necessária
  - Perda máxima em USD e BRL
  - Alavancagem efetiva

---

### 5. Formulário de Trades Internacionais

**Arquivo:** `src/components/international/InternationalTradeForm.tsx`

Campos do formulário:

```typescript
interface InternationalTradeFormData {
  trade_date: string;
  symbol: string;              // MES, NQ, CL, etc.
  trade_type: 'long' | 'short';
  contracts: number;
  entry_price: number;
  exit_price: number;
  commission: number;          // Por contrato
  exchange_rate: number;       // USD/BRL no momento
  resultado_usd: number;       // Calculado
  resultado_brl: number;       // Calculado
  risco_percentual: number;
  setup_utilizado?: string;
  tag?: string;
  nota_disciplina?: number;
  notes?: string;
}
```

**Cálculo do Resultado:**
```
Ticks = (Exit Price - Entry Price) / Tick Size
Resultado USD = Ticks × Tick Value × Contracts - Commission
Resultado BRL = Resultado USD × Exchange Rate
```

---

### 6. Migração de Banco de Dados

Criar tabela `international_trades`:

```sql
CREATE TABLE IF NOT EXISTS public.international_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  dashboard_id UUID NOT NULL REFERENCES public.dashboards(id),
  trade_date DATE NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  trade_type VARCHAR(10) NOT NULL DEFAULT 'long',
  contracts INTEGER NOT NULL DEFAULT 1,
  entry_price DECIMAL(18,6) NOT NULL,
  exit_price DECIMAL(18,6) NOT NULL,
  tick_size DECIMAL(18,6) NOT NULL,
  tick_value DECIMAL(18,4) NOT NULL,
  commission DECIMAL(10,2) DEFAULT 0,
  exchange_rate DECIMAL(10,4) NOT NULL,
  resultado_usd DECIMAL(18,2) NOT NULL,
  resultado_brl DECIMAL(18,2) NOT NULL,
  resultado_percentual DECIMAL(10,4) NOT NULL,
  margin_used DECIMAL(18,2) NOT NULL,
  risco_percentual DECIMAL(5,2) NOT NULL DEFAULT 8,
  setup_utilizado VARCHAR(50),
  tag VARCHAR(50),
  nota_disciplina INTEGER,
  notes TEXT,
  screenshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.international_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own international trades"
  ON public.international_trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own international trades"
  ON public.international_trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own international trades"
  ON public.international_trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own international trades"
  ON public.international_trades FOR DELETE
  USING (auth.uid() = user_id);
```

---

### 7. Dashboard Internacional

**Arquivo:** `src/pages/InternationalDashboard.tsx`

Layout similar ao `StockDashboard.tsx`:

1. **Dialog de seleção de broker** (primeiro acesso)
2. **Simulação Rápida** (Calculadora de Posição em destaque)
3. **Stats Cards**:
   - Capital Total (USD e BRL)
   - Risco Diário Atual
   - Resultado Acumulado (USD e BRL)
   - Taxa de Câmbio Atual
4. **Gráfico de Evolução P&L**
5. **Heatmap Mensal**
6. **Formulário de Novo Trade**

---

### 8. Atualização de Rotas

**Arquivo:** `src/App.tsx`

```tsx
import InternationalDashboard from '@/pages/InternationalDashboard';

// Adicionar rota
<Route path="/international-dashboard/:dashboardId" element={<InternationalDashboard />} />
```

---

### 9. Atualização do Hub

Modificar `src/pages/Hub.tsx` para redirecionar corretamente:

```typescript
const handleDashboardClick = (dashboard: Dashboard) => {
  if (dashboard.type === 'futuros') {
    navigate('/dashboard');
  } else if (dashboard.type === 'internacional') {
    navigate(`/international-dashboard/${dashboard.id}`);
  } else {
    navigate(`/stock-dashboard/${dashboard.id}`);
  }
};
```

---

### Resumo Visual

```text
+---------------------+
|    Hub (seleção)    |
+----------+----------+
           |
           v
+---------------------+
| Broker Selection    |  <-- NinjaTrader como primeira opção
| Dialog              |
+----------+----------+
           |
           v
+---------------------+
| International       |
| Dashboard           |
|                     |
| +----------------+  |
| | Risk Calculator|  |  <-- Em USD, com conversão BRL
| +----------------+  |
|                     |
| +----------------+  |
| | Stats Cards    |  |  <-- Resultado em USD/BRL
| +----------------+  |
|                     |
| +----------------+  |
| | Trade Form     |  |  <-- Campos específicos para futuros
| +----------------+  |
+---------------------+
```

---

### Detalhes Técnicos

**Fórmulas de Cálculo:**

1. **Resultado por Trade:**
```
Ticks = (Preço Saída - Preço Entrada) / Tick Size
P&L (USD) = Ticks × Tick Value × Contratos - Comissão
P&L (BRL) = P&L (USD) × Taxa Câmbio
```

2. **Contratos Máximos por Risco:**
```
Risco Máximo = Capital × (% Risco / 100)
Stop em USD = Stop em Ticks × Tick Value
Contratos = Min(
  Floor(Capital / Margem Intradiária),
  Floor(Risco Máximo / Stop em USD)
)
```

3. **Alavancagem Efetiva:**
```
Valor Nocional = Preço × Point Value × Contratos
Alavancagem = Valor Nocional / Margem Usada
```

---

### Próximos Passos Após Implementação

1. Integrar API de câmbio em tempo real (opcional)
2. Adicionar mais ativos NinjaTrader
3. Criar relatórios específicos para mercado internacional
4. Adicionar conversão automática de timezone para horários de mercado
