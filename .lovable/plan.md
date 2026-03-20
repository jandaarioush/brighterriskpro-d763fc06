

## Plano: Simuladores Interativos com Input Real — Futuros e Ações

Transformar a seção "Como Funciona" em duas seções separadas com simuladores interativos onde o usuário insere dados reais e vê os cálculos em tempo real, incluindo um calendário mensal.

### Estrutura Final

```text
┌─────────────────────────────────────────┐
│ COMO FUNCIONA — ÍNDICE E DÓLAR         │
│ 4 steps numerados                       │
│ Simulador Interativo (inputs reais)     │
│ ├─ Capital + Risco Mensal (editáveis)   │
│ ├─ Limites calculados em tempo real     │
│ ├─ Registro de trade simulado           │
│ └─ Calendário mensal com risco/dia      │
├─────────────────────────────────────────┤
│ COMO FUNCIONA — AÇÕES                   │
│ 4 steps numerados (lógica de ações)     │
│ Simulador Interativo (inputs reais)     │
│ ├─ Capital + Risco % Mensal (editáveis) │
│ ├─ Limites calculados (% e R$)          │
│ ├─ Registro de trade (ticker, preços)   │
│ └─ Calendário mensal com risco/dia      │
└─────────────────────────────────────────┘
```

### Arquivos

| Arquivo | Mudança |
|---------|---------|
| `src/components/landing/InteractiveTour.tsx` | Reescrita completa — inputs editáveis, cálculos reais via `riskCalculations.ts`, calendário mensal interativo |
| `src/components/landing/StockInteractiveTour.tsx` | **Novo** — Simulador para Ações com lógica de `stockRiskCalculations.ts` |
| `src/components/landing/HowItWorks.tsx` | Separar em duas seções (Futuros + Ações), cada uma com seu simulador |

### Detalhes Técnicos

**InteractiveTour.tsx (Futuros — Índice e Dólar)**

- Step 1: Inputs editáveis para Capital (R$) e Risco Mensal (R$) com formatação monetária
- Step 2: Cálculos em tempo real usando `calculateDailyRisk()` e `calculateStopPoints()` do `riskCalculations.ts`. Mostra Risco Diário, Stop Índice, Stop Dólar baseados nos dias úteis do mês atual
- Step 3: Usuário adiciona trades simulados (seleciona ativo índice/dólar, insere resultado). Os valores de risco recalculam automaticamente
- Step 4: **Calendário mensal** — grid de dias do mês atual mostrando risco diário calculado para cada dia útil. Dias com trades simulados mostram resultado (verde/vermelho). O calendário reflete os trades adicionados no step 3, recalculando o risco restante

**StockInteractiveTour.tsx (Ações)**

- Step 1: Inputs para Capital Total (R$) e Risco Mensal (%) — usa `calculateDailyStockRisk()`
- Step 2: Mostra Risco Diário (%), Risco Diário (R$), baseados no capital e % definidos
- Step 3: Registro de trade com Ticker, Preço Entrada, Preço Saída, Quantidade — calcula resultado usando `calculateTradeResult()`
- Step 4: Calendário mensal idêntico ao de futuros mas com valores em % e R$

**Calendário (ambos)**

- Grid mostrando todos os dias do mês atual
- Dias úteis com valor de risco diário calculado
- Fins de semana em cinza/desabilitados
- Dias com trades adicionados mostram cor verde (lucro) ou vermelho (perda)
- Ao adicionar trades no step 3, o calendário recalcula automaticamente a distribuição de risco nos dias restantes

**Estado compartilhado dentro de cada tour:**

```typescript
const [capital, setCapital] = useState(50000);
const [monthlyRisk, setMonthlyRisk] = useState(3000);
const [simulatedTrades, setSimulatedTrades] = useState<Trade[]>([]);
// Cálculos derivados via useMemo usando as funções existentes
```

### Seção HowItWorks

Dividida em dois blocos visuais:
- **"Índice e Dólar"** — com steps adaptados e `<InteractiveTour />`
- **"Ações"** — com steps adaptados (capital %, ticker, etc.) e `<StockInteractiveTour />`

Separados por um divisor visual sutil.

