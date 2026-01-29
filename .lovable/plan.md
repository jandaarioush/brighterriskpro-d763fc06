

## Plano: Adicionar Valor Alocado e Calculo de Margem com Alavancagem

### Resumo
Reestruturar o simulador para incluir o campo "Valor Alocado" e calcular a quantidade maxima de acoes considerando DOIS limites:
1. **Limite de Margem:** Quanto capital o usuario tem disponivel para alocar
2. **Limite de Stop:** Quanto o usuario aceita perder (maximo 70% do valor alocado)

A quantidade final de acoes sera o MENOR valor entre os dois limites.

---

### Nova Estrutura de Inputs

```
+------------------------------------------+
|   Simulacao de Operacao                   |
+------------------------------------------+
|   Modalidade: [Day Trade v] ou Swing      |
+------------------------------------------+
|   Valor Alocado (R$): [___________]       |
|   (Capital que voce vai usar como margem) |
+------------------------------------------+
|   Stop Financeiro Maximo (R$): [_______]  |
|   (Max 70% do Valor Alocado)              |
|   Limite: R$ XXX.XX                       |
+------------------------------------------+
```

---

### Nova Logica de Calculo

#### Passo 1: Quantidade Maxima pela Margem (Alavancagem)
```
Se Day Trade (BTG):
  alavancagem = btgAsset.leverage  (ex: 98x)
  margemPorAcao = btgAsset.marginPerShare
  qtdMaxMargem = valorAlocado / margemPorAcao

Se Swing Trade:
  alavancagem = 5
  margemPorAcao = precoAcao / 5
  qtdMaxMargem = valorAlocado / margemPorAcao
```

#### Passo 2: Quantidade Maxima pelo Stop Financeiro
```
stopPorAcao = precoAcao * (stopPercentual / 100)
qtdMaxStop = stopFinanceiroDisponivel / stopPorAcao
```

#### Passo 3: Quantidade Final
```
quantidadeFinal = Math.floor(Math.min(qtdMaxMargem, qtdMaxStop))
```

A quantidade final respeita AMBOS os limites.

---

### Validacao: Stop Maximo de 70%

```
stopFinanceiroMax <= valorAlocado * 0.70
```

Se o usuario tentar colocar um stop maior que 70% do valor alocado, mostrar um aviso e limitar automaticamente.

---

### Novas Informacoes Mostradas por Ativo

Para cada ativo adicionado, mostrar:

| Campo | Descricao |
|-------|-----------|
| Ticker | Codigo do ativo |
| Alavancagem | BTG (ex: 98x) ou 5x se Swing |
| Preco | Preco da acao informado |
| Stop % | Percentual de stop |
| Margem Necessaria | margemPorAcao × quantidade |
| Qtd Max (Margem) | valorAlocado / margemPorAcao |
| Qtd Max (Stop) | stopDisponivel / stopPorAcao |
| **Quantidade Final** | Menor dos dois acima |
| Perda Maxima | quantidade × stopPorAcao |

---

### Exemplo Pratico

**Inputs do Usuario:**
- Modalidade: Day Trade
- Valor Alocado: R$ 1.000,00
- Stop Financeiro Max: R$ 500,00 (50% do alocado - OK)

**Adiciona PETR4:**
- Preco: R$ 35,00
- Stop: 2%
- Alavancagem BTG: 98x
- Margem por Acao BTG: R$ 0,37

**Calculos:**
```
Qtd Max pela Margem = R$ 1.000 / R$ 0,37 = 2.702 acoes
Qtd Max pelo Stop = R$ 500 / (R$ 35 × 2%) = 714 acoes
Quantidade Final = min(2.702, 714) = 714 acoes
Perda Maxima = 714 × R$ 0,70 = R$ 499,80
Margem Usada = 714 × R$ 0,37 = R$ 264,18
```

O limite foi o STOP, nao a margem.

---

### Alteracoes no Codigo

**Arquivo:** `src/pages/StockSimulator.tsx`

#### 1. Novos States
```typescript
const [valorAlocado, setValorAlocado] = useState(1000);
```

#### 2. Calculo do Limite de Stop
```typescript
const stopMaximoPermitido = valorAlocado * 0.70;
const stopValido = stopFinanceiroMax <= stopMaximoPermitido;
```

#### 3. Nova Interface SimulatorPosition
```typescript
interface SimulatorPosition {
  id: string;
  ticker: string;
  precoAtivo: number;
  stopPercentual: number;
  alavancagem: number;
  margemPorAcao: number;
  qtdMaxMargem: number;      // NOVO
  qtdMaxStop: number;        // NOVO
  quantidade: number;        // Min dos dois acima
  perdaMaxima: number;
  margemNecessaria: number;
}
```

#### 4. Atualizar UI do Card "Simulacao de Operacao"

Adicionar input de Valor Alocado ANTES do Stop Financeiro Maximo.
Mostrar validacao de 70% em tempo real.

#### 5. Atualizar Card "Analise de Risco"

Para cada ativo, mostrar:
- Quantidade (destacado)
- Limite que definiu a quantidade (margem ou stop)
- Margem utilizada vs disponivel

#### 6. Adicionar ao Card "Parametros Atuais"

- Valor Alocado Total
- Margem Total Utilizada
- Margem Disponivel

---

### Fluxo Visual Atualizado

```
1. Usuario seleciona Modalidade (Day Trade / Swing)
          |
          v
2. Usuario informa Valor Alocado (ex: R$ 1.000)
          |
          v
3. Sistema calcula: Stop Max = 70% × R$ 1.000 = R$ 700
          |
          v
4. Usuario informa Stop Financeiro Max (ate R$ 700)
          |
          v
5. Clica em "+ Adicionar Ativo"
          |
          v
6. Seleciona Ticker (PETR4), Preco (R$ 35), Stop % (2%)
          |
          v
7. Sistema calcula:
   - Margem/acao (BTG): R$ 0,37
   - Qtd Max Margem: 2.702 acoes
   - Qtd Max Stop: 714 acoes
   - Quantidade FINAL: 714 acoes (menor)
   - Perda Max: R$ 499,80
   - Margem Usada: R$ 264,18
          |
          v
8. Usuario ve claramente:
   - Quantas acoes pode entrar
   - Por que esse numero (limite de margem ou stop)
   - Quanto vai gastar de margem
   - Quanto pode perder no maximo
```

---

### Secao Tecnica

#### Formula Completa

```typescript
// Para Day Trade com BTG
const btgAsset = getBTGAsset(ticker);
const alavancagem = btgAsset?.leverage || 1;
const margemPorAcao = btgAsset?.marginPerShare || precoAtivo;

// Para Swing Trade
const alavancagem = 5;
const margemPorAcao = precoAtivo / 5;

// Calculos
const qtdMaxMargem = Math.floor(valorAlocadoDisponivel / margemPorAcao);
const stopPorAcao = precoAtivo * (stopPercentual / 100);
const qtdMaxStop = Math.floor(stopFinanceiroDisponivel / stopPorAcao);
const quantidade = Math.min(qtdMaxMargem, qtdMaxStop);

const perdaMaxima = quantidade * stopPorAcao;
const margemNecessaria = quantidade * margemPorAcao;
```

#### Validacao de 70%

```typescript
const stopMaximoPermitido = valorAlocado * 0.70;
const isStopValido = stopFinanceiroMax <= stopMaximoPermitido;

// Se nao for valido, mostrar warning e sugerir o valor maximo
```

---

### Resultado Final

O usuario tera clareza total sobre:
1. Quanto capital esta alocando (margem)
2. Quanto aceita perder (stop) - limitado a 70% do alocado
3. Quantas acoes pode operar de cada ativo
4. QUAL limite definiu a quantidade (margem ou stop)
5. Quanto de margem esta utilizando por ativo
6. Quanto pode perder por ativo

