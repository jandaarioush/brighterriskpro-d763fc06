
## Plano: Calculadora de Posicao com Selecao de Corretora e Multi-Ativos

### Resumo
Quando o usuario acessar o dashboard de Acoes pela primeira vez (sem corretora configurada), sera exibido um dialog perguntando qual corretora ele usa. Se escolher BTG, a calculadora usara a lista de ativos com alavancagem da BTG. A calculadora permitira adicionar multiplos ativos e calcular automaticamente a quantidade de acoes baseada no stop financeiro maximo.

---

### Parte 1: Selecao de Corretora (Primeiro Acesso)

#### 1.1 Criar Dialog de Selecao de Corretora
**Novo arquivo:** `src/components/stock/BrokerSelectionDialog.tsx`

Componente com:
- Radio buttons para BTG, XP, Clear, Warren, Outra
- Botao "Confirmar" para salvar a escolha
- Design consistente com o resto do app

#### 1.2 Detectar Primeiro Acesso
**Modificar:** `src/pages/StockDashboard.tsx`

- Verificar se o campo `config.broker` do dashboard esta vazio
- Se vazio, exibir o `BrokerSelectionDialog`
- Apos selecao, salvar no campo `config` do dashboard: `{ broker: 'btg' | 'xp' | 'clear' | 'warren' | 'outra' }`

---

### Parte 2: Lista de Ativos BTG com Alavancagem

#### 2.1 Criar Arquivo de Dados
**Novo arquivo:** `src/lib/btgAssets.ts`

Array com ~120 ativos extraidos da pagina do BTG:
```typescript
export interface BTGAsset {
  ticker: string;
  marginPerShare: number; // Margem em R$ por acao
  leverage: number; // Alavancagem (ex: 105, 98, 20, 5, 1)
}

export const btgAssets: BTGAsset[] = [
  { ticker: 'CPLE3', marginPerShare: 0.13, leverage: 105 },
  { ticker: 'PETR4', marginPerShare: 0.37, leverage: 98 },
  { ticker: 'VALE3', marginPerShare: 0.87, leverage: 98 },
  // ... todos os ativos
];
```

---

### Parte 3: Nova Calculadora de Posicao Multi-Ativos

#### 3.1 Substituir StockRiskCalculator
**Reescrever:** `src/components/stock/StockRiskCalculator.tsx`

Novo fluxo da calculadora:

```text
+----------------------------------------------------------+
|   Calculadora de Posicao                                  |
+----------------------------------------------------------+
|  Stop Financeiro Maximo: [R$ ____________]                |
+----------------------------------------------------------+
|  Ativo 1:                                                 |
|  [Ticker: PETR4 v]  Stop %: [====O========] 2.5%         |
|  Qtd: 150 acoes  |  Perda Max: R$ 250.00                 |
+----------------------------------------------------------+
|  Ativo 2:                                                 |
|  [Ticker: VALE3 v]  Stop %: [====O========] 3.0%         |
|  Qtd: 80 acoes   |  Perda Max: R$ 300.00                 |
+----------------------------------------------------------+
|  [+ Adicionar Ativo]                                      |
+----------------------------------------------------------+
|  RESUMO                                                   |
|  Perda Total Possivel: R$ 550.00 / R$ 1000.00            |
|  [====================--------] 55% do stop usado        |
+----------------------------------------------------------+
```

#### 3.2 Logica de Calculo

Para cada ativo adicionado:

1. Usuario seleciona o ticker (autocomplete com lista BTG se corretora = BTG)
2. Usuario move slider de Stop % (0.1% ate 10%)
3. Sistema calcula automaticamente:
   - Se BTG: `alavancagem = btgAssets[ticker].leverage`
   - Se outra corretora: `alavancagem = 1` (sem alavancagem)
   - `quantidade = stopFinanceiroMax / (precoAtivo * stopPercentual / 100 * alavancagem)`
   - `perdaMaxima = quantidade * precoAtivo * stopPercentual / 100`

#### 3.3 Interface do Componente

```typescript
interface StockPosition {
  id: string;
  ticker: string;
  stopPercentual: number;
  quantidade: number;
  perdaMaxima: number;
}

interface StockRiskCalculatorProps {
  broker: 'btg' | 'xp' | 'clear' | 'warren' | 'outra';
  capitalTotal: number;
}
```

---

### Parte 4: Integracao com Precos de Mercado (Futuro)

Para calculos precisos, seria ideal ter precos em tempo real. Por enquanto, o usuario podera:
- Informar o preco manualmente do ativo
- Ou usar um preco estimado

---

### Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/lib/btgAssets.ts` | Criar | Lista de ~120 ativos BTG com alavancagem |
| `src/components/stock/BrokerSelectionDialog.tsx` | Criar | Dialog de selecao de corretora |
| `src/components/stock/StockRiskCalculator.tsx` | Reescrever | Nova calculadora com multi-ativos e slider |
| `src/pages/StockDashboard.tsx` | Modificar | Adicionar logica de primeiro acesso e passar broker |

---

### Fluxo do Usuario

```text
1. Usuario acessa "Acoes" pela primeira vez
          |
          v
2. Dialog aparece: "Qual corretora voce usa?"
   [ ] BTG Pactual
   [ ] XP Investimentos
   [ ] Clear
   [ ] Warren
   [ ] Outra
          |
          v
3. Usuario seleciona (ex: BTG) e clica "Confirmar"
          |
          v
4. Salvamos config.broker = 'btg' no dashboard
          |
          v
5. Na calculadora, usuario informa Stop Financeiro Max (ex: R$ 500)
          |
          v
6. Usuario adiciona ativo (ex: PETR4)
   - Autocomplete mostra ativos BTG
   - Sistema busca alavancagem (98x para PETR4)
          |
          v
7. Usuario ajusta slider de Stop % (ex: 2%)
          |
          v
8. Sistema calcula:
   - Com preco PETR4 = R$ 35.00
   - Stop 2% = R$ 0.70 por acao
   - Quantidade = R$ 500 / R$ 0.70 = 714 acoes
   - Perda Max = 714 * R$ 0.70 = R$ 500
          |
          v
9. Usuario pode adicionar mais ativos e ver o resumo
```

---

### Secao Tecnica

#### Estrutura de Dados no Dashboard
```json
{
  "config": {
    "broker": "btg",
    "capital_total": 100000
  }
}
```

#### Formula de Calculo
```
quantidade = stopFinanceiroMax / (precoAcao * stopPercentual/100)
perdaMaxima = quantidade * precoAcao * stopPercentual/100
```

Se corretora BTG e ativo na lista:
```
quantidadeAjustada = quantidade (alavancagem ja inclusa na margem BTG)
```

#### Componentes UI Utilizados
- `Dialog` - para selecao de corretora
- `RadioGroup` / `RadioGroupItem` - para opcoes de corretora
- `Slider` - para stop percentual
- `Select` / `Combobox` - para selecao de ticker com autocomplete
- `Input` - para stop financeiro maximo e preco do ativo
- `Card` - para cada posicao adicionada

---

### Proximos Passos Apos Implementacao

1. Adicionar busca de precos em tempo real (API ou input manual)
2. Permitir salvar posicoes como templates
3. Exportar calculo como imagem/PDF
