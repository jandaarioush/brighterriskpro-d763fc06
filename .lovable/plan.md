

## Plano: Adicionar Distribuicao Proporcional de Risco e Objetivo de Trade

### Resumo
Expandir o simulador para permitir:
1. Ajustar a distribuicao do stop financeiro entre multiplas acoes via sliders
2. Adicionar campo de "Objetivo" (gain) em percentual com calculo do valor em R$

---

### Parte 1: Distribuicao Proporcional de Risco

#### Conceito
Quando o usuario adiciona multiplas acoes, cada uma recebe uma "fatia" do stop financeiro maximo. O usuario podera ajustar essas fatias via slider para colocar mais risco em uma acao e menos em outra.

#### Fluxo
```
Usuario define Stop Financeiro Max = R$ 500
    |
    v
Adiciona PETR4 -> Sistema aloca R$ 500 (100%)
    |
    v
Adiciona VALE3 -> Sistema redistribui:
    PETR4: R$ 250 (50%)
    VALE3: R$ 250 (50%)
    |
    v
Usuario arrasta slider de PETR4 para 70%
    -> PETR4: R$ 350
    -> VALE3: R$ 150
    |
    v
Recalcula quantidade de acoes para cada uma
```

#### Nova Interface SimulatorPosition
```typescript
interface SimulatorPosition {
  id: string;
  ticker: string;
  precoAtivo: number;
  stopPercentual: number;        // % de stop loss (ex: 2%)
  objetivoPercentual: number;    // NOVO: % de gain (ex: 4%)
  alavancagem: number;
  margemPorAcao: number;
  stopAlocado: number;           // NOVO: Quanto do stop total esta alocado
  stopAlocadoPercent: number;    // NOVO: % do stop total (0-100)
  qtdMaxMargem: number;
  qtdMaxStop: number;
  quantidade: number;
  perdaMaxima: number;
  ganhoObjetivo: number;         // NOVO: Valor em R$ do objetivo
  margemNecessaria: number;
  limiteFator: 'margem' | 'stop';
}
```

---

### Parte 2: Slider de Distribuicao

#### Implementacao
Cada posicao tera um slider que controla `stopAlocadoPercent`. A soma de todos os sliders sempre sera 100%.

```
+-----------------------------------------------+
|  PETR4 - R$ 35,00 - 2% stop                   |
|  Alocacao: [==========70%=========]  R$ 350   |
|  -> 500 acoes | Perda max: R$ 350,00          |
|  -> Objetivo 4%: Ganho R$ 700,00              |
+-----------------------------------------------+
|  VALE3 - R$ 60,00 - 1.5% stop                 |
|  Alocacao: [====30%====]  R$ 150              |
|  -> 166 acoes | Perda max: R$ 149,40          |
|  -> Objetivo 3%: Ganho R$ 298,80              |
+-----------------------------------------------+
|  TOTAL                                         |
|  [==================100%==================]    |
|  Perda max total: R$ 499,40 / R$ 500,00       |
+-----------------------------------------------+
```

#### Logica de Redistribuicao
Quando o usuario ajusta um slider:
1. Calcula a diferenca
2. Distribui proporcionalmente entre os outros
3. Garante que nenhum fique abaixo de 5%
4. Recalcula quantidade de acoes para cada posicao

---

### Parte 3: Objetivo do Trade

#### Novo Campo
Adicionar input de "Objetivo (%)" ao lado do Stop Loss (%) no formulario de adicionar ativo.

```
+------------------------------------------+
|  Stop Loss (%): [===2%===]               |
|  Objetivo (%):  [====4%====]             |
+------------------------------------------+
```

#### Calculo
```typescript
const ganhoObjetivo = quantidade * precoAtivo * (objetivoPercentual / 100);
```

#### Exemplo
- Preco: R$ 35,00
- Quantidade: 500 acoes
- Objetivo: 4%
- Ganho potencial: 500 × R$ 35 × 4% = R$ 700,00

---

### Alteracoes no Codigo

**Arquivo:** `src/pages/StockSimulator.tsx`

#### 1. Novos States
```typescript
const [newObjetivoPercentual, setNewObjetivoPercentual] = useState(4);
```

#### 2. Atualizar Interface SimulatorPosition
Adicionar campos: `objetivoPercentual`, `ganhoObjetivo`, `stopAlocado`, `stopAlocadoPercent`

#### 3. Funcao de Redistribuicao
```typescript
const handleStopAllocationChange = (id: string, newPercent: number) => {
  setPositions(prev => {
    const others = prev.filter(p => p.id !== id);
    const totalOthers = others.reduce((sum, p) => sum + p.stopAlocadoPercent, 0);
    const remaining = 100 - newPercent;
    
    return prev.map(p => {
      if (p.id === id) {
        return recalculatePosition({ ...p, stopAlocadoPercent: newPercent });
      }
      // Redistribui proporcionalmente
      const ratio = totalOthers > 0 ? p.stopAlocadoPercent / totalOthers : 1 / others.length;
      return recalculatePosition({ ...p, stopAlocadoPercent: remaining * ratio });
    });
  });
};
```

#### 4. Funcao de Recalculo
```typescript
const recalculatePosition = (pos: SimulatorPosition): SimulatorPosition => {
  const stopAlocado = stopFinanceiroMax * (pos.stopAlocadoPercent / 100);
  const stopPorAcao = pos.precoAtivo * (pos.stopPercentual / 100);
  const ganhoPorAcao = pos.precoAtivo * (pos.objetivoPercentual / 100);
  
  const qtdMaxMargem = Math.floor(margemDisponivel / pos.margemPorAcao);
  const qtdMaxStop = Math.floor(stopAlocado / stopPorAcao);
  const quantidade = Math.min(qtdMaxMargem, qtdMaxStop);
  
  return {
    ...pos,
    stopAlocado,
    qtdMaxStop,
    quantidade,
    perdaMaxima: quantidade * stopPorAcao,
    ganhoObjetivo: quantidade * ganhoPorAcao,
    limiteFator: qtdMaxMargem <= qtdMaxStop ? 'margem' : 'stop',
  };
};
```

#### 5. Atualizar UI das Posicoes

Para cada posicao, mostrar:
- Slider de alocacao (0-100%)
- Valor alocado em R$
- Quantidade de acoes
- Perda maxima
- Objetivo com valor em R$

#### 6. ScrollArea para Lista de Posicoes

Usar `ScrollArea` do Radix para permitir rolagem quando houver muitas posicoes:

```tsx
import { ScrollArea } from '@/components/ui/scroll-area';

<ScrollArea className="h-[400px] pr-4">
  {positions.map(pos => (
    <PositionCard key={pos.id} position={pos} ... />
  ))}
</ScrollArea>
```

---

### Resultado Visual

```
+------------------------------------------+
|  Simulacao de Operacao                    |
+------------------------------------------+
|  Modalidade: [Day Trade v]                |
|  Valor Alocado: R$ 1.000,00               |
|  Stop Financeiro Max: R$ 500,00           |
+------------------------------------------+
|  DISTRIBUICAO DE RISCO           (scroll)|
| +--------------------------------------+ |
| | PETR4 - R$ 35 - Alav: 98x           | |
| | Stop: 2% | Objetivo: 4%             | |
| | Alocacao: [======70%======] R$ 350  | |
| | -> 500 acoes                        | |
| | Perda: R$ 350 | Ganho: R$ 700       | |
| +--------------------------------------+ |
| | VALE3 - R$ 60 - Alav: 47x           | |
| | Stop: 1.5% | Objetivo: 3%           | |
| | Alocacao: [===30%===] R$ 150        | |
| | -> 166 acoes                        | |
| | Perda: R$ 149 | Ganho: R$ 299       | |
| +--------------------------------------+ |
+------------------------------------------+
|  [+ Adicionar Ativo]                      |
+------------------------------------------+
```

---

### Secao Tecnica

#### Arquivos Modificados
| Arquivo | Acao |
|---------|------|
| `src/pages/StockSimulator.tsx` | Adicionar sliders, objetivo e scroll |

#### Componentes Utilizados
- `@/components/ui/slider` - Slider de alocacao
- `@/components/ui/scroll-area` - Area de rolagem para posicoes
- Estados existentes serao expandidos

#### Logica de Alocacao
```
Ao adicionar nova posicao:
  - Nova posicao recebe fatia igual dos outros
  - Todos redistribuidos proporcionalmente
  - Minimo de 5% por posicao

Ao remover posicao:
  - Redistribui % liberado entre os restantes

Ao ajustar slider:
  - Outros ajustam proporcionalmente
  - Soma sempre = 100%
```

#### Formulas
```typescript
// Stop alocado para cada posicao
stopAlocado = stopFinanceiroMax * (stopAlocadoPercent / 100)

// Quantidade baseada no stop alocado
qtdMaxStop = Math.floor(stopAlocado / (precoAtivo * stopPercentual / 100))

// Ganho objetivo
ganhoObjetivo = quantidade * precoAtivo * (objetivoPercentual / 100)
```

---

### Resultado Final

O usuario tera:
1. Clareza de como distribuir o risco entre multiplas acoes
2. Controle total via sliders arrastando mais para uma ou outra
3. Visualizacao do objetivo de cada trade em R$
4. Scroll para gerenciar muitas posicoes
5. Recalculo automatico ao ajustar qualquer slider

