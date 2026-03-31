

## Plano: Tipografia Premium para Numeros

### Resumo

Upgrade da tipografia de numeros em todo o app para estilo "terminal financeiro": separar valor de unidade, formatar no padrao BR, adicionar count-up animado, e aplicar efeito visual premium.

---

### 1. Utility classes CSS (`src/index.css`)

Adicionar classes reutilizaveis:

- `.kpi-number` — `text-4xl font-bold tabular-nums tracking-[0.02em] leading-none` + text-shadow sutil (0 0 10px rgba branco 5%)
- `.kpi-unit` — `text-base font-medium opacity-70 ml-1.5`
- `.kpi-profit` — cor verde success
- `.kpi-loss` — cor vermelha danger
- `.kpi-gradient` — gradiente metalizado (branco → cinza) com background-clip text (versao ultra premium, dark mode only)

### 2. Formatacao BR (`src/lib/formatting.ts`)

Adicionar funcoes:

- `formatNumberBR(value: number, decimals?: number)` → "5.000" / "100,0"
- `formatCurrencyBR(value: number)` → "R$ 2.500,00" (ja existe `formatCurrency`, padronizar uso)
- `splitValueUnit(formatted: string)` → `{ number: string, unit: string }` — separa "5000 pts" em `{ number: "5.000", unit: "pts" }`

### 3. Componente KpiValue (`src/components/KpiValue.tsx`)

Novo componente reutilizavel:

```
<KpiValue value={5000} unit="pts" variant="success" animated />
```

Props:
- `value: number` — valor numerico
- `unit?: string` — "pts", "R$" (prefixo), "%"
- `prefix?: string` — "R$" aparece antes do numero
- `variant?: "default" | "success" | "danger" | "primary"`
- `animated?: boolean` — count-up de 0 ate valor em ~1s
- `size?: "lg" | "xl"` — tamanho do numero
- `gradient?: boolean` — ativa efeito metalizado

Renderiza numero + unidade com baseline alignment, tabular-nums, formatacao BR automatica.

Count-up: usar `useEffect` + `requestAnimationFrame` para animar de 0 ao valor em ~800ms com easing.

### 4. Atualizar StatCard (`src/components/StatCard.tsx`)

- Substituir `<p>{value}</p>` por `<KpiValue>` component
- Aceitar props estruturadas: `numericValue`, `unit`, `prefix` alem do `value` string existente (backward compatible)

### 5. Atualizar Dashboard (`src/pages/Dashboard.tsx`)

Substituir formatacao inline nos StatCards:
- `R$ ${monthlyRisk.toLocaleString()}` → usar `KpiValue` com `prefix="R$"` e `value={monthlyRisk}`
- `${stopIndice.toFixed(0)} pts` → `KpiValue` com `unit="pts"` e `value={stopIndice}`
- Aplicar `variant` baseado no contexto (success/danger)

### 6. Atualizar GreetingBanner (`src/components/GreetingBanner.tsx`)

- Numeros de meta diaria e risco disponivel: usar `KpiValue` ou classes `.kpi-number`
- Formatacao BR em `riskAvailable` e `goalRemaining`

### 7. Atualizar Calendar (`src/pages/Calendar.tsx`)

- Numeros de pontos e R$ nos cards do calendario: aplicar classes `.kpi-number` e `.kpi-unit`
- Formatacao BR nos valores financeiros

---

### Arquivos

| Arquivo | Mudanca |
|---------|---------|
| `src/index.css` | Classes `.kpi-*` |
| `src/lib/formatting.ts` | `formatNumberBR`, `splitValueUnit` |
| `src/components/KpiValue.tsx` | Novo componente com count-up |
| `src/components/StatCard.tsx` | Usar KpiValue |
| `src/pages/Dashboard.tsx` | Passar dados estruturados aos StatCards |
| `src/components/GreetingBanner.tsx` | Tipografia premium nos numeros |
| `src/pages/Calendar.tsx` | Formatacao BR + classes kpi |

