

## Causa

O `StockSimulator` já suporta `Modalidade` ('daytrade' | 'swingtrade') via `xpAssets` (a alavancagem muda por modalidade), mas o estado `simulatorModalidade` está fixo em `'daytrade'` — sem UI para escolha. Isso distorce o cálculo de margem/quantidade para quem opera swing.

## Solução

Adicionar uma **nova Etapa 1: Modalidade** no wizard, empurrando as outras etapas adiante. Fluxo final:

1. **Modalidade** (novo) — Day Trade vs Swing Trade
2. Selecionar Ativos
3. Preços
4. Parâmetros → Resultados

Escolhi nova etapa (em vez de embutir na seleção de ativos) porque a modalidade afeta diretamente a lista de alavancagens mostradas/calculadas — o usuário precisa decidir antes para entender o impacto na seleção.

## Mudanças em `src/pages/StockSimulator.tsx`

1. **`WizardStep`** — adicionar `'modalidade'` como primeiro valor:
   ```ts
   type WizardStep = 'modalidade' | 'select' | 'prices' | 'params' | 'results';
   ```
2. **Estado inicial** — `useState<WizardStep>('modalidade')`.
3. **StepIndicator** — passar de 3 para 4 passos: Modalidade → Ativos → Preços → Parâmetros.
4. **Novo bloco JSX** para `currentStep === 'modalidade'`: Card com dois botões grandes (Day Trade / Swing Trade) usando o mesmo padrão visual dos cards existentes, com descrição curta ("Operações intradiárias com alavancagem maior" / "Posições mantidas overnight, alavancagem reduzida"), botão "Próximo".
5. **`handleNext` / `handleBack`** — incluir transição `modalidade ↔ select`.
6. **`handleReset`** — voltar para `'modalidade'`.
7. **Recalcular posições** quando `simulatorModalidade` mudar (nada a fazer se ainda não houver posições, mas resetar `selectedAssets` ao trocar modalidade depois de já ter selecionado evita inconsistência — alternativa: limpar `selectedAssets` quando muda modalidade no step 1, sem prompt).
8. **Remover** o filtro `currentStep !== 'results'` do StepIndicator se quiser exibi-lo também na nova etapa (ou manter oculto — vou manter o indicador visível em todas as etapas exceto `results`, igual hoje).

Sem mudanças em `xpAssets.ts`, banco, ou outros arquivos. A função `getXPLeverage`/`getXPMargemPorAcao` já recebe `modalidade` corretamente.

## Validação

1. Abrir `/stock-dashboard/:id/simulator` → deve aparecer Etapa 1 "Modalidade" com 2 cards.
2. Escolher Swing Trade → avançar → confirmar que ao chegar em Resultados a alavancagem usada nos cálculos corresponde aos valores swing do `xpAssets`.
3. Voltar para Modalidade, trocar para Day Trade e refazer — quantidades devem mudar.

