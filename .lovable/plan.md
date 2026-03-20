

## Plano: Simuladores Mock + Calendário em Pontos + Simulador de Ações Completo

### Resumo

Três mudanças principais:
1. **InteractiveTour.tsx** — Reverter para dados mock (sem inputs editáveis) e mostrar risco em **pontos** no calendário (Stop Índice / Stop Dólar)
2. **StockInteractiveTour.tsx** — Substituir pelo simulador completo de ações em 3 etapas (Selecionar Ativos → Preços → Parâmetros) com dados mock, usando a lista BTG existente
3. **HowItWorks.tsx** — Ajustar steps descritivos para refletir as mudanças

### Arquivos

| Arquivo | Mudança |
|---------|---------|
| `src/components/landing/InteractiveTour.tsx` | Mock data fixo, calendário mostra pontos (Índice/Dólar) em vez de R$ |
| `src/components/landing/StockInteractiveTour.tsx` | Reescrita completa — wizard 3 etapas com ativos BTG mock |
| `src/components/landing/HowItWorks.tsx` | Atualizar steps do bloco Ações para refletir as 3 etapas do wizard |

### Detalhes

**InteractiveTour.tsx (Futuros — Mock)**
- Capital fixo R$ 50.000, Risco Mensal R$ 3.000 (não editáveis, apenas exibidos)
- Trades mock pré-definidos (ex: dia 5 = +R$200, dia 10 = -R$150, dia 15 = +R$350)
- Calendário mostra risco em **pontos**: cada dia útil exibe `Stop Índ: Xpts` ou `Stop Dól: Xpts` usando `calculateStopPoints()`
- Dias com trades mock mostram resultado em R$ (verde/vermelho)
- 4 steps com navegação Anterior/Próximo como hoje

**StockInteractiveTour.tsx (Ações — Wizard 3 etapas)**

Replica visualmente o simulador real (`StockSimulator.tsx`) com dados mock:

- **Etapa 1 — Selecionar Ativos**: Grid de badges com tickers BTG (usando `btgAssets` existente), barra de busca/filtro, área "Ativos Selecionados" abaixo. Pré-seleciona 3 ativos mock (PETR4, VALE3, ITUB4). Não permite edição — apenas visualização
- **Etapa 2 — Preços**: Tabela com os ativos selecionados mostrando preço mock, Stop Loss (%) e Objetivo/Gain (%) com valores fixos. Inputs desabilitados
- **Etapa 3 — Parâmetros**: Valor Alocado (R$ 5.000) e Stop Financeiro Máximo (R$ 2.500) fixos. Tabela de resultado com: Margem, Quantidade, Perda Máxima, Ganho Objetivo por ativo. Valores calculados com as funções reais mas inputs mock

Wizard step indicator no topo (1 → 2 → 3) com linha conectora dourada, navegação Anterior/Próximo.

**HowItWorks.tsx**
- Bloco Ações: ajustar de 4 steps para 3 steps (Selecionar Ativos, Definir Preços, Configurar Risco)
- Bloco Futuros: manter 4 steps, ajustar descrição do calendário para mencionar "pontos"

