

## Plano: Configurar NinjaTrader como Corretora Exclusiva do Mercado Internacional

### Problema Identificado

1. **Badge "BTG Pactual" errada**: A screenshot mostra "BTG Pactual" no header do Mercado Internacional, quando deveria mostrar "NinjaTrader"
2. **Rota incorreta**: O usuário está acessando `/dashboard/7c5d7724-...` (que é o StockDashboard para ações) ao invés de `/international-dashboard/:dashboardId`
3. **Lista de ativos incompleta**: O arquivo `ninjatraderAssets.ts` tem apenas 24 ativos, mas a NinjaTrader oferece 100+ produtos

---

### Componentes a Modificar

| Arquivo | Ação |
|---------|------|
| `src/lib/ninjatraderAssets.ts` | **EXPANDIR** - Adicionar todos os 100+ ativos da NinjaTrader |
| `src/pages/InternationalDashboard.tsx` | **VERIFICAR** - Garantir que mostra "NinjaTrader" corretamente |
| `src/components/international/InternationalRiskCalculator.tsx` | **MELHORAR** - Mostrar alavancagem específica por ativo |

---

### 1. Expansão Completa da Lista de Ativos NinjaTrader

Adicionar todos os ativos do site oficial, organizados por grupo:

**Micro Indices (8 ativos)**
| Symbol | Market | Day Margin | Initial |
|--------|--------|------------|---------|
| MES | Micro E-mini S&P 500 | $50 | $2,498.60 |
| MNQ | Micro E-mini NASDAQ-100 | $100 | $3,686.57 |
| M2K | Micro E-mini Russell 2000 | $50 | $1,045.02 |
| MYM | Micro E-mini Dow | $50 | $1,567.71 |
| MMC | Micro E-mini S&P MidCap 400 | $50 | $2,523.08 |
| MSC | Micro E-mini S&P SmallCap 600 | $50 | $1,294.95 |
| MNK | Micro Nikkei Stock Average | $50 | $1,974.06 |

**E-Mini Indices (4 ativos)**
| Symbol | Market | Day Margin | Initial |
|--------|--------|------------|---------|
| ES | E-Mini S&P 500 | $500 | $24,985.95 |
| NQ | E-Mini NASDAQ 100 | $1,000 | $36,865.75 |
| RTY | E-Mini Russell 2000 | $500 | $10,450.22 |
| YM | E-Mini Dow | $500 | $15,677.13 |

**Currencies (15 ativos)**
| Symbol | Market | Day Margin | Initial |
|--------|--------|------------|---------|
| 6A | Australian Dollar | $500 | $2,420 |
| 6B | British Pound | $500 | $2,200 |
| 6C | Canadian Dollar | $500 | $1,210 |
| 6E | Euro FX | $500 | $3,190 |
| 6J | Japanese Yen | $500 | $3,410 |
| 6L | Brazilian Real | $500 | $1,210 |
| 6M | Mexican Peso | $500 | $1,430 |
| 6N | New Zealand Dollar | $500 | $1,540 |
| 6S | Swiss Franc | $500 | $4,950 |
| M6A | E-Micro Australian Dollar | $50 | $209 |
| M6B | E-Micro British Pound | $50 | $220 |
| M6E | E-Micro Euro | $50 | $297 |
| MJY | E-Micro Japanese Yen | $50 | $308 |
| MCD | E-Micro Canadian Dollar | $50 | $110 |
| MSF | E-Micro Swiss Franc | $50 | $495 |

**Energies (10 ativos)**
| Symbol | Market | Day Margin | Initial |
|--------|--------|------------|---------|
| CL | Crude Oil | $1,000 | $4,687.83 |
| MCL | Micro Crude Oil | $100 | $470.99 |
| NG | Natural Gas | $1,000 | $12,697 |
| MNG | Micro Henry Hub Natural Gas | $100 | $457.12 |
| HO | Heating Oil | $1,000 | $7,050.18 |
| RB | RBOB Gasoline | $1,000 | $5,009.33 |
| BZ | Brent Crude Last Day | $1,000 | $4,679.82 |
| QM | E-Mini Crude Oil | $500 | $2,354.91 |
| QG | E-Mini Natural Gas | $500 | $1,142.78 |
| QH | E-Mini Heating Oil | $500 | $3,529.71 |

**Metals (12 ativos)**
| Symbol | Market | Day Margin | Initial |
|--------|--------|------------|---------|
| GC | Gold | $2,000 | $29,169.80 |
| MGC | E-Micro Gold | $200 | $2,917.20 |
| SI | Silver | $4,000 | $68,464 |
| SIL | Micro Silver | $1,000 | $13,692.80 |
| HG | Copper | $1,000 | $11,000 |
| MHG | Micro Copper | $200 | $1,100 |
| PL | Platinum | $2,000 | $17,208.40 |
| PA | Palladium | $2,000 | $31,222.40 |
| QC | E-Mini Copper | $500 | $5,500 |
| QO | E-Mini Gold | $500 | $14,686.10 |
| QI | miNY Silver | $1,000 | $34,344.20 |
| 1OZ | 1-Ounce Gold | $50 | $294.80 |

**Crypto Indices (15 ativos)**
| Symbol | Market | Day Margin | Initial |
|--------|--------|------------|---------|
| BTC | CME Bitcoin | $20,000 | $117,585.60 |
| MBT | Micro Bitcoin | $100 | $2,351.80 |
| ETH | Ether | $2,500 | $52,993.60 |
| MET | Micro Ether | $50 | $106.70 |
| GSOL | CME Solana | $500 | $28,944.30 |
| MSL | Micro Solana | $50 | $1,447.60 |
| MXP | CME Micro XRP | $50 | $2,321 |
| GXRP | CME XRP | $1,000 | $46,415.60 |
| BIT | Coinbase Nano Bitcoin | $25 | $379.50 |
| ET | Coinbase Nano Ether | $25 | $162.80 |
| SOL | Nano Solana (Coinbase) | $500 | $605 |
| BTI | Coinbase Bitcoin Futures | $10,000 | $38,427.40 |
| BCH | Bitcoin Cash | $50 | $356.40 |
| DOG | Dogecoin | $50 | $1,307.90 |
| LC | Litecoin | $50 | $302.50 |

**Financials (15 ativos)**
| Symbol | Market | Day Margin | Initial |
|--------|--------|------------|---------|
| ZB | US Treasury Bond | $500 | $4,070 |
| ZN | 10-Year T-Note | $500 | $2,062.50 |
| ZF | 5-Year T-Note | $500 | $1,375 |
| ZT | 2-Year T-Note | $500 | $1,320 |
| TN | Ultra 10-Year T-Note | $500 | $2,805 |
| UB | Ultra US Treasury Bond | $1,000 | $5,665 |
| TWE | 20yr US Treasury Bond | $500 | $4,730 |
| 10Y | Micro 10-Year Yield | $50 | $330 |
| 2YY | Micro 2-Year Yield | $50 | $363 |
| 5YY | Micro 5-Year Yield | $50 | $341 |
| 30Y | Micro 30-Year Yield | $50 | $297 |
| MTN | Micro Ultra 10yr Note | $140.25 | $280.50 |
| MWN | Micro Ultra T-Bond | $50 | $566.50 |
| GE | Eurodollar | $478.50 | $957 |
| Z3N | 3 Year US Treasury Notes | $1,000 | $2,000 |

**Grains (12 ativos)**
| Symbol | Market | Day Margin | Initial |
|--------|--------|------------|---------|
| ZC | Corn | $500 | $1,072.50 |
| ZS | Soybeans | $1,000 | $2,200 |
| ZW | Wheat | $500 | $1,815 |
| ZL | Soybean Oil | $500 | $2,310 |
| ZM | Soybean Meal | $1,000 | $1,705 |
| ZO | Oats | $1,000 | $1,375 |
| ZR | Rough Rice | $1,000 | $1,375 |
| MZC | Micro Corn | $50 | $107.80 |
| MZS | Micro Soybean | $50 | $220 |
| MZW | Micro Wheat | $50 | $181.50 |
| MZL | Micro Soybean Oil | $50 | $231 |
| MZM | Micro Soybean Meal | $50 | $170.50 |

**Softs (8 ativos)**
| Symbol | Market | Day Margin | Initial |
|--------|--------|------------|---------|
| CC | Cocoa | $1,000 | $7,084 |
| KC | Coffee | $1,000 | $9,610 |
| CT | Cotton | $1,000 | $1,254 |
| SB | Sugar No. 11 | $1,000 | $837 |
| OJ | Orange Juice | $1,000 | $4,775 |
| LBR | Lumber | $1,000 | $1,210 |
| LBS | Random Length Lumber | $1,000 | $5,940 |

**Meats (3 ativos)**
| Symbol | Market | Day Margin | Initial |
|--------|--------|------------|---------|
| LE | Live Cattle | $500 | $3,410 |
| HE | Lean Hogs | $1,000 | $1,870 |
| GF | Feeder Cattle | $500 | $5,830 |

**EUREX (EUR) (10 ativos)**
| Symbol | Market | Day Margin | Initial |
|--------|--------|------------|---------|
| FDAX | DAX Index | 2000 EUR | 45030 EUR |
| FDXM | Mini-DAX | 500 EUR | 9005 EUR |
| FDXS | Micro DAX Index | 100 EUR | 1801 EUR |
| FESX | Euro Stoxx 50 | 1000 EUR | 4122 EUR |
| FSXE | Micro EURO STOXX 50 | 206 EUR | 412 EUR |
| FGBL | Euro-Bund | 1000 EUR | 1952 EUR |
| FGBM | Euro-Bobl | 1000 EUR | 1064 EUR |
| FGBS | Euro-Schatz | 500 EUR | 388 EUR |
| FGBX | Euro-Buxl | 1000 EUR | 3786 EUR |
| FVS | VSTOXX | 1000 EUR | 284 EUR |

---

### 2. Estrutura Expandida do Arquivo

```typescript
export interface NinjaTraderAsset {
  symbol: string;
  name: string;
  exchange: string;
  group: string;
  dayMargin: number;
  initialMargin: number;
  tickSize: number;
  tickValue: number;
  pointValue: number;
  currency: 'USD' | 'EUR';
}

// ~100 ativos organizados por grupo
export const NINJATRADER_ASSETS: NinjaTraderAsset[] = [
  // Todos os ativos listados acima com tick sizes e values corretos
];

export const NINJATRADER_ASSET_GROUPS = [
  'Micro Indices',
  'E-Mini Indices', 
  'Currencies',
  'Energies',
  'Metals',
  'Crypto Indices',
  'Financials',
  'Grains',
  'Softs',
  'Meats',
  'EUREX',
  'Other Indices',
] as const;
```

---

### 3. Melhorias na Calculadora de Posição

Adicionar exibição de alavancagem efetiva:

```typescript
// Calcular alavancagem com base na margem
const calculateLeverage = (asset: NinjaTraderAsset, currentPrice: number) => {
  const contractValue = currentPrice * asset.pointValue;
  return Math.round(contractValue / asset.dayMargin);
};

// Exemplo: MES a $5,950
// Contract Value = 5950 * 5 = $29,750
// Day Margin = $50
// Leverage = 29750 / 50 = 595x (alavancagem efetiva intradiária)
```

Exibir no card do ativo:
- Margem Intradiária: $50
- Margem Overnight: $2,498.60
- Alavancagem Day Trade: ~595x

---

### 4. Correção do Header do Dashboard Internacional

O `InternationalDashboard.tsx` já está correto (linha 184):
```tsx
{dashboard?.config?.broker === 'ninjatrader' ? 'NinjaTrader' : 'Futuros Internacionais'}
```

O problema é que o usuário está acessando a rota errada (`/dashboard/:id` = StockDashboard com BTG).

**Solução**: Garantir que dashboards do tipo "internacional" sempre redirecionem corretamente pelo Hub.

---

### Resumo das Mudanças

1. **Expandir `ninjatraderAssets.ts`** de 24 para ~100 ativos com margens atualizadas
2. **Adicionar novos grupos**: Financials, Grains, Softs, Meats, EUREX
3. **Incluir tick sizes e values** corretos para cada contrato
4. **Melhorar calculadora** com exibição de alavancagem efetiva
5. **Verificar navegação** para garantir que dashboards internacionais vão para a rota correta

