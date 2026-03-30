

## Plano: Adicionar Objetivo Financeiro Mensal ao Dashboard de Futuros

### Contexto

Atualmente o calendário de Futuros distribui apenas o **risco mensal** (prejuízo máximo aceitável) pelos dias úteis. O usuário quer adicionar um **objetivo financeiro mensal** (meta de ganho) com a mesma lógica de distribuição — mostrando no calendário quanto precisa ganhar por dia para atingir a meta.

### Mudanças

#### 1. Migration — Adicionar coluna `monthly_goal` na tabela `dashboards`

```sql
ALTER TABLE public.dashboards ADD COLUMN monthly_goal numeric DEFAULT null;
```

#### 2. Settings.tsx — Input de Objetivo Mensal

Para dashboards do tipo `futuros`, adicionar um segundo campo abaixo do Risco Mensal:
- Label: **"Objetivo Mensal (R$)"**
- Placeholder: "3000.00"
- Descrição: "Meta de ganho que você deseja atingir no mês"
- Salva na coluna `monthly_goal` junto com o `monthly_risk`

#### 3. riskCalculations.ts — Funções de objetivo

Adicionar função `calculateDailyGoal()`:
- Mesma lógica do risco: distribui o objetivo restante pelos dias úteis restantes
- `goalRemaining = monthlyGoal - accumulatedProfit`
- `dailyGoal = goalRemaining / workingDaysRemaining`
- Converter para pontos: `goalIndice = dailyGoal / 0.2`, `goalDolar = dailyGoal / 10`

Atualizar `DayRiskData` para incluir `goalIndice` e `goalDolar`.
Atualizar `calculateMonthData()` para receber `monthlyGoal` e calcular os objetivos por dia, acumulando os lucros realizados para ajustar o objetivo restante.
Atualizar `calculateMonthlyStats()` para retornar `goalUsed`, `goalUsedPercent`, `goalRemaining`.

#### 4. Calendar.tsx — Exibir objetivo no calendário

- Carregar `monthly_goal` do dashboard junto com `monthly_risk`
- Passar `monthlyGoal` para `calculateMonthData()`
- No card de cada dia útil, adicionar abaixo dos stops:
  - **"Meta Índ: X pts/contrato"** (em dourado/amarelo)
  - **"Meta Dól: X pts/contrato"** (em dourado/amarelo)
- Adicionar stat card no topo: "Objetivo Mensal" com progresso (quanto já atingiu da meta)
- No resumo lateral, adicionar barra de progresso do objetivo

#### 5. MonthlyRiskDialog.tsx — Incluir campo de objetivo

Verificar se o dialog de risco mensal precisa de campo para objetivo também, para manter consistência.

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| Migration SQL | Adicionar coluna `monthly_goal` |
| `src/lib/riskCalculations.ts` | Funções de objetivo diário + atualizar interfaces |
| `src/pages/Settings.tsx` | Input de Objetivo Mensal para futuros |
| `src/pages/Calendar.tsx` | Exibir meta em pts no calendário + stat cards |
| `src/components/MonthlyRiskDialog.tsx` | Campo opcional de objetivo |

