
## Diagnostico

A captura mostra `riskpro.brighter.com.br` (dominio publicado) com tela em branco. Investiguei:

- **Codigo do app esta saudavel**: `src/lib/xpAssets.ts` exporta corretamente todas as funcoes usadas (`xpAssets`, `findXPAsset`, `getXPAsset`, `getXPTickers`, `getXPLeverage`, `getDesagio`, `getMargemPorAcao`, tipo `Modalidade`).
- **Imports nos 4 consumidores batem** (`StockRiskCalculator.tsx`, `StockTradeForm.tsx`, `StockSimulator.tsx`, `StockInteractiveTour.tsx`).
- **Sem referencias residuais a `btgAssets`** em todo o `src/`.
- **Console do preview sem erros de runtime** (apenas mensagem benigna do `lovable.js`).

## Causa provavel

A URL na captura e o **dominio publicado** (`riskpro.brighter.com.br`), nao o preview. O dominio publicado serve a **versao publicada anteriormente**, que ficou com HTML em cache apontando para assets antigos (hashes `.js` que nao existem mais no servidor depois das ultimas edicoes), resultando em tela branca.

## Acao recomendada (sem mudanca de codigo)

1. **Republicar o projeto** (botao "Publish" no canto superior direito do Lovable) para que `riskpro.brighter.com.br` sirva o build atual com a refatoracao XP.
2. Apos publicar, dar um hard refresh (Ctrl+Shift+R) na aba do navegador.
3. Se quiser confirmar que o codigo atual roda sem republicar, abrir o **Preview URL** (`id-preview--e91fbb14...lovable.app`) — esse sempre reflete o estado mais recente.

Como o codigo nao tem bugs detectaveis, **nao proponho mudancas de arquivo**. Caso o problema persista mesmo apos republicar, eu precisaria de uma nova captura ja com o DevTools aberto na aba **Console** mostrando os erros reais do dominio publicado para diagnosticar mais a fundo.
