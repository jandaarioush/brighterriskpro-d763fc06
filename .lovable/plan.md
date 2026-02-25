

## Plano: Sincronizar Stop Loss do Simulador com o Dashboard

### Problema

O Simulador busca `monthly_risk` da tabela `profiles`, enquanto o Dashboard busca da tabela `dashboards` (tipo futuros). Isso gera valores diferentes de stop. Além disso, o valor auto do stop loss mostra decimais longos (4133,333...) em vez de valores inteiros como no dashboard (3300 pts).

### Arquivo a Modificar

| Arquivo | Mudança |
|---------|------|
| `src/pages/Simulator.tsx` | Buscar monthly_risk da tabela dashboards (futuros) e arredondar valores |

### Mudanças

1. **Alterar a query** (linhas 33-37): Buscar de `dashboards` com `type = 'futuros'` em vez de `profiles.monthly_risk`
2. **Arredondar o stop auto** (linha 80): Aplicar `Math.round()` ao valor calculado para eliminar decimais longos
3. **Usar stopIndice/stopDolar como teto**: O stop máximo no simulador será exatamente o mesmo valor exibido no dashboard

### Código Proposto

```typescript
// Substituir query de profiles por dashboards (como faz o Dashboard.tsx)
const { data: futurosDashboard } = await supabase
  .from('dashboards')
  .select('monthly_risk')
  .eq('user_id', user.id)
  .eq('type', 'futuros')
  .maybeSingle();

const userMonthlyRisk = futurosDashboard?.monthly_risk || 0;
```

```typescript
// Auto stop arredondado e limitado ao stop do dashboard
const calculatedStop = Math.round(dailyRisk / (contracts * pointValue));
const finalStop = Math.min(calculatedStop, maxStop);
```

### Resultado

- Stop Loss máximo no simulador = Stop Índice/Dólar do dashboard (valores inteiros)
- Sem mais decimais longos como "4133,333333333333"
- Mesma fonte de dados (tabela dashboards) para ambas as telas

