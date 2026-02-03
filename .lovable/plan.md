

## Plano: Sincronizar Risco Mensal entre MonthlyRiskDialog, Dashboard e Configurações

### Problema Identificado

Há duas fontes de dados diferentes para o risco mensal de Futuros:

| Componente | Tabela Usada | Operação |
|------------|--------------|----------|
| `MonthlyRiskDialog` | `profiles.monthly_risk` | Escrita |
| `Calendar.tsx` | `profiles.monthly_risk` | Leitura |
| `Dashboard.tsx` | `profiles.monthly_risk` | Leitura |
| `Settings.tsx` | `dashboards.monthly_risk` | Leitura/Escrita |

Quando o usuario altera o risco no dialog (ex: R$ 5.000), ele salva em `profiles`. Mas a pagina de Configuracoes mostra/edita o valor de `dashboards`, criando inconsistencia.

---

### Solucao Proposta

Manter `dashboards.monthly_risk` como **unica fonte de verdade** para cada tipo de dashboard, e atualizar todos os componentes para usar essa tabela.

---

### Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| `src/components/MonthlyRiskDialog.tsx` | Receber `dashboardId` e salvar em `dashboards` |
| `src/pages/Dashboard.tsx` | Buscar `monthly_risk` da tabela `dashboards` (type='futuros') |
| `src/pages/Calendar.tsx` | Buscar `monthly_risk` da tabela `dashboards` (type='futuros') |

---

### Mudancas Detalhadas

#### 1. MonthlyRiskDialog.tsx

Adicionar prop `dashboardId` para salvar no dashboard correto:

```typescript
// Antes
interface MonthlyRiskDialogProps {
  open: boolean;
  onClose: () => void;
}

// Depois
interface MonthlyRiskDialogProps {
  open: boolean;
  onClose: () => void;
  dashboardId?: string; // ID do dashboard de futuros
}
```

Modificar a funcao de submit para salvar em `dashboards`:

```typescript
// Antes - linha 51-54
const { error } = await supabase
  .from('profiles')
  .update({ monthly_risk: parseFloat(monthlyRisk.trim()) })
  .eq('id', user?.id);

// Depois
if (dashboardId) {
  // Salvar no dashboard especifico
  const { error } = await supabase
    .from('dashboards')
    .update({ monthly_risk: parseFloat(monthlyRisk.trim()) })
    .eq('id', dashboardId);
  if (error) throw error;
} else {
  // Fallback: buscar dashboard de futuros e atualizar
  const { data: futurosDash } = await supabase
    .from('dashboards')
    .select('id')
    .eq('user_id', user?.id)
    .eq('type', 'futuros')
    .maybeSingle();
    
  if (futurosDash) {
    const { error } = await supabase
      .from('dashboards')
      .update({ monthly_risk: parseFloat(monthlyRisk.trim()) })
      .eq('id', futurosDash.id);
    if (error) throw error;
  }
}
```

---

#### 2. Dashboard.tsx

Alterar leitura de `profiles` para `dashboards`:

```typescript
// Antes - linha 49-56
const { data: profile } = await supabase
  .from('profiles')
  .select('monthly_risk')
  .eq('id', user.id)
  .single();
const userMonthlyRisk = profile?.monthly_risk || 0;

// Depois
const { data: futurosDashboard } = await supabase
  .from('dashboards')
  .select('monthly_risk')
  .eq('user_id', user.id)
  .eq('type', 'futuros')
  .maybeSingle();
const userMonthlyRisk = futurosDashboard?.monthly_risk || 0;
```

---

#### 3. Calendar.tsx

Modificar `loadProfile` para buscar do dashboard:

```typescript
// Antes - linha 54-67
const loadProfile = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('monthly_risk')
    .eq('id', user?.id)
    .single();

  if (data) {
    setMonthlyRisk(data.monthly_risk);
    if (!data.monthly_risk) {
      setShowRiskDialog(true);
    }
  }
};

// Depois
const [futurosDashboardId, setFuturosDashboardId] = useState<string | null>(null);

const loadFuturosDashboard = async () => {
  const { data } = await supabase
    .from('dashboards')
    .select('id, monthly_risk')
    .eq('user_id', user?.id)
    .eq('type', 'futuros')
    .maybeSingle();

  if (data) {
    setFuturosDashboardId(data.id);
    setMonthlyRisk(data.monthly_risk);
    if (!data.monthly_risk || data.monthly_risk === 0) {
      setShowRiskDialog(true);
    }
  }
};
```

Passar o `dashboardId` para o dialog:

```tsx
<MonthlyRiskDialog
  open={showRiskDialog}
  dashboardId={futurosDashboardId}
  onClose={() => {
    setShowRiskDialog(false);
    loadFuturosDashboard();
  }}
/>
```

---

### Fluxo de Dados Apos Mudanca

```text
USUARIO ALTERA RISCO NO DIALOG:
+---------------------------+
| MonthlyRiskDialog         |
| Valor: R$ 2.000           |
| [Salvar]                  |
+---------------------------+
        |
        v
+---------------------------+
| dashboards                |
| type: 'futuros'           |
| monthly_risk: 2000        | <- UNICA FONTE
+---------------------------+
        |
        +--------+--------+
        |        |        |
        v        v        v
   Dashboard  Calendar  Settings
   (le 2000)  (le 2000) (le 2000)
```

---

### Logica Matematica Preservada

Todas as funcoes de calculo em `src/lib/riskCalculations.ts` permanecem **inalteradas**:
- `calculateMonthData()`
- `calculateMonthlyStats()`
- `getWorkingDaysInMonth()`
- `getWorkingDaysRemaining()`

A unica mudanca e a **origem do valor** de `monthly_risk`, nao como ele e usado nos calculos.

---

### Beneficios

1. Valor de risco sincronizado em todas as paginas
2. Cada dashboard mantem seu proprio risco independente
3. Configuracoes refletem o mesmo valor do dialog
4. Arquitetura consistente com o sistema multi-dashboard

