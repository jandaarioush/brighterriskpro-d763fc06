

## Plano: Substituir BTG por XP + Desagio + Swing Trade

### Resumo

Remover toda referencia ao BTG, criar `xpAssets.ts` com ~250 ativos extraidos do Excel (com alavancagem Day Trade e Swing Trade), integrar logica de desagio (margem = preco / alavancagem) na calculadora e simulador, adicionar seletor Day Trade / Swing Trade, e disclaimer legal.

---

### Logica do Desagio

O desagio XP define quanta margem a corretora exige por acao:

```text
margemPorAcao = precoAtivo / alavancagem
```

Exemplo: PETR4 a R$35, alavancagem 312x → margem = R$0.11/acao
Em Swing Trade (14x) → margem = R$2.50/acao

Isso substitui o campo `marginPerShare` fixo do BTG por calculo dinamico baseado no preco digitado pelo usuario.

---

### 1. Criar `src/lib/xpAssets.ts`

- Interface `XPAsset`: `{ ticker, dayTradeLeverage, swingTradeLeverage }`
- ~250 ativos do Excel (ABCB4 ate YDUQ3)
- Funcoes: `findXPAsset()`, `getXPAsset()`, `getXPTickers()`, `getXPLeverage(ticker, modalidade)`
- `getMargemPorAcao(ticker, preco, modalidade)` → `preco / leverage`

### 2. Deletar `src/lib/btgAssets.ts`

### 3. Atualizar `src/components/stock/StockRiskCalculator.tsx`

- Remover prop `broker` e logica `isBTG`
- Sempre mostrar autocomplete com lista XP
- Adicionar toggle **Day Trade** / **Swing Trade** (estado global do componente)
- Info do ativo: "Alavancagem B3: Xx | Desagio: Y% | Margem: R$ Z/acao"
- Desagio calculado como `(1 / alavancagem) * 100`
- Margem = `preco / alavancagem`
- Logica matematica do stop permanece identica
- Adicionar disclaimer no rodape

### 4. Atualizar `src/components/stock/BrokerSelectionDialog.tsx`

- Remover opcao BTG
- Atualizar XP: "Alavancagem B3 — Day Trade e Swing Trade"
- Simplificar ou remover dialog se so resta XP como corretora com dados

### 5. Atualizar `src/components/stock/StockTradeForm.tsx`

- Substituir imports btgAssets → xpAssets
- `handleTickerSelect`: preencher alavancagem com `getXPLeverage(ticker, modalidade)`
- `handleModalidadeChange`: Swing → usar swingTradeLeverage do XP (nao valor fixo 5)

### 6. Atualizar `src/pages/StockSimulator.tsx`

- Substituir imports btgAssets → xpAssets
- Adicionar seletor Day Trade / Swing Trade no Step 1
- `getMargemPorAcao` usa `preco / leverage` dinamico
- `getAlavancagem` usa modalidade selecionada
- Remover textos "BTG"

### 7. Atualizar `src/pages/StockDashboard.tsx`

- Remover referencia "BTG Pactual" de badges

### 8. Atualizar `src/components/landing/StockInteractiveTour.tsx`

- Substituir imports btgAssets → xpAssets

### 9. Disclaimer (StockRiskCalculator + StockSimulator)

```
*Os valores podem ser alterados sem aviso previo*
*As informacoes sao de atualizacao da B3, podendo haver mudancas ao longo do pregao*
*Caso nao tenha o ativo procurado, consultar em https://simulador.b3.com.br/*
```

---

### Arquivos

| Arquivo | Mudanca |
|---------|---------|
| `src/lib/xpAssets.ts` | **Novo** — ~250 ativos com DT/ST leverage |
| `src/lib/btgAssets.ts` | **Deletar** |
| `src/components/stock/StockRiskCalculator.tsx` | Toggle modalidade, desagio, disclaimer |
| `src/components/stock/BrokerSelectionDialog.tsx` | Remover BTG |
| `src/components/stock/StockTradeForm.tsx` | Imports XP, leverage por modalidade |
| `src/pages/StockSimulator.tsx` | Imports XP, seletor modalidade |
| `src/pages/StockDashboard.tsx` | Remover texto BTG |
| `src/components/landing/StockInteractiveTour.tsx` | Imports XP |

