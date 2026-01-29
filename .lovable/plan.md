

## Plano: Reestruturar Simulador de Acoes com Modalidade Day Trade/Swing e Multi-Ativos

### Objetivo
Transformar o Simulador de Acoes para seguir o novo fluxo:
1. Perguntar se eh Day Trade ou Swing Trade
2. Se Day Trade: mostrar seletor com ativos BTG e suas alavancagens
3. Se Swing Trade: usar alavancagem fixa de 5x
4. Permitir adicionar multiplos ativos com calculos independentes
5. Mostrar quantidade de acoes permitida baseada no stop financeiro maximo

---

### Mudancas na Interface

#### Layout Atual vs Novo

**ANTES:**
```
+------------------+------------------+------------------+
|   Simulacao de   |   Analise de     |   Parametros     |
|    Operacao      |     Risco        |    Atuais        |
|  (inputs gerais) | (risco calculado)|  (capital, etc)  |
+------------------+------------------+------------------+
```

**DEPOIS:**
```
+------------------------+------------------+------------------+
|   Simulacao de         |   Analise de     |   Parametros     |
|    Operacao            |     Risco        |    Atuais        |
| - Modalidade (DT/SW)   | - Lista ativos   |  (capital, etc)  |
| - Stop Financeiro Max  |   adicionados    |                  |
| - Seletor de Ativos    | - Quantidade     |                  |
| - [+ Adicionar Ativo]  | - Perda por ativo|                  |
|                        | - Resumo total   |                  |
+------------------------+------------------+------------------+
```

---

### Fluxo do Usuario

```
1. Seleciona Modalidade
   |
   +---> Day Trade: Lista de ativos BTG com alavancagem automatica
   |
   +---> Swing Trade: Alavancagem fixa de 5x para todos os ativos
   |
   v
2. Define Stop Financeiro Maximo (R$)
   (ex: R$ 500)
   |
   v
3. Clica em "+ Adicionar Ativo"
   |
   v
4. Para cada ativo:
   - Seleciona Ticker (autocomplete com BTG se Day Trade)
   - Informa Preco da Acao (R$)
   - Sistema calcula automaticamente:
     - Alavancagem (BTG se DT, 5x se Swing)
     - Quantidade maxima de acoes
     - Perda maxima daquele ativo
   |
   v
5. Pode adicionar mais ativos
   |
   v
6. Ve resumo com:
   - Total de risco distribuido
   - Barra de progresso do stop usado
   - Clareza de quantas acoes entrar em cada trade
```

---

### Logica de Calculo

#### Day Trade (com BTG)
```
alavancagem = btgAssets[ticker].leverage  // Ex: 98x para PETR4
stopPorAcao = precoAcao * (stopPercentual / 100)
quantidade = stopFinanceiroMax / stopPorAcao
perdaMaxima = quantidade * stopPorAcao
```

#### Swing Trade
```
alavancagem = 5  // Fixo
stopPorAcao = precoAcao * (stopPercentual / 100)
quantidade = stopFinanceiroMax / stopPorAcao
perdaMaxima = quantidade * stopPorAcao
```

**Nota:** A alavancagem BTG eh usada para calcular a margem necessaria, nao o risco. O risco eh baseado no preco real da acao e no stop percentual.

---

### Estrutura dos Dados

```typescript
interface StockSimulatorPosition {
  id: string;
  ticker: string;
  precoAtivo: number;
  stopPercentual: number;
  alavancagem: number;      // BTG ou 5x
  quantidade: number;       // Calculado
  perdaMaxima: number;      // Calculado
  margemNecessaria: number; // Se BTG
}

type Modalidade = 'daytrade' | 'swing';
```

---

### Alteracoes no Arquivo

**Arquivo:** `src/pages/StockSimulator.tsx`

#### 1. Novos States
```typescript
// Adicionar
const [modalidadeAtiva, setModalidadeAtiva] = useState<'daytrade' | 'swing'>('daytrade');
const [stopFinanceiroMax, setStopFinanceiroMax] = useState(500);
const [positions, setPositions] = useState<StockSimulatorPosition[]>([]);

// Remover/simplificar
// - capitalOperacao (sera calculado por ativo)
// - alavancagem (sera automatico por modalidade)
// - stopLoss (sera por ativo)
// - autoStop
```

#### 2. Novo Card "Simulacao de Operacao"

Substituir o card atual por:

1. **Selector de Modalidade**
   - Radio ou Select com "Day Trade" e "Swing Trade"
   - Ao mudar, limpar as posicoes

2. **Input de Stop Financeiro Maximo**
   - Valor em R$ que o usuario aceita perder no total
   - Distribui entre os ativos adicionados

3. **Lista de Ativos Adicionados**
   - Cada ativo mostra: ticker, preco, alavancagem, quantidade, perda
   - Botao de remover para cada

4. **Botao "+ Adicionar Ativo"**
   - Abre seletor com:
     - Ticker (autocomplete se Day Trade com lista BTG)
     - Preco da acao (R$)
   - Slider de Stop % (0.1% a 10%)

#### 3. Novo Card "Analise de Risco"

Mostrar:
- Lista resumida de cada ativo com sua quantidade e perda
- Barra de progresso do stop usado vs maximo
- Status: "Dentro do Limite" ou "Acima do Limite"

#### 4. Card "Parametros Atuais"

Manter como esta, mostrando:
- Capital Total
- Risco Mensal Base
- Risco Diario Atual
- Perda Acumulada

---

### Componentes Reutilizados

Vou reaproveitar a logica do `StockRiskCalculator.tsx`:
- Interface `StockPosition`
- Funcao `PositionCard` (com adaptacoes)
- Logica de calculo de quantidade
- Progress bar de uso do stop

---

### Secao Tecnica

#### Arquivos Modificados
| Arquivo | Acao |
|---------|------|
| `src/pages/StockSimulator.tsx` | Reescrever logica e UI |

#### Dependencias Usadas
- `@/lib/btgAssets` - Lista de ativos BTG com alavancagem
- `@/components/ui/select` - Seletor de modalidade
- `@/components/ui/slider` - Stop percentual
- `@/components/ui/progress` - Barra de uso do stop
- `@/components/ui/command` - Autocomplete de tickers

#### Formula Principal

Para Day Trade (BTG):
```
Se ticker na lista BTG:
  alavancagem = btgAsset.leverage
  margemPorAcao = btgAsset.marginPerShare
Senao:
  alavancagem = 1
  margemPorAcao = precoAtivo
```

Para Swing Trade:
```
alavancagem = 5 (fixo)
margemPorAcao = precoAtivo / 5
```

Calculo da quantidade:
```
stopPorAcao = precoAtivo * (stopPercentual / 100)
quantidade = Math.floor(stopFinanceiroDisponivelParaEsteAtivo / stopPorAcao)
perdaMaxima = quantidade * stopPorAcao
```

---

### Resultado Final

O usuario tera CLAREZA total sobre:
1. Quantas acoes pode comprar de cada ativo
2. Qual o loss maximo de cada posicao
3. Se esta dentro ou fora do limite de risco definido
4. Como distribuir o risco entre multiplos ativos

