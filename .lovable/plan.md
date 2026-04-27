## Objetivo

Permitir que o trader **importe relatórios de performance do Profit (Nelogica)** em **PDF** e **Excel** no dashboard de Futuros, e gerar uma **análise padrão (regras determinísticas, sem IA)** seguindo a estrutura Brighter Risk Pro — Raio-X, Comportamento, Execução, Gestão de Risco, Padrões Ocultos, Alertas e Plano de Ação.

Sem consumo de créditos de IA. Tudo calculado em código a partir das métricas extraídas.

---

## Decisões aplicadas (defaults das perguntas puladas)

- **Tipo de relatório**: detecta automaticamente — Histórico de Operações **e** Performance consolidada.
- **Dashboard alvo**: Futuros (`/dashboard`) nesta primeira entrega.
- **Sem arquivo de exemplo**: parser baseado no layout padrão Profit Nelogica; ajustamos depois com arquivo real se houver divergência.
- **Ativos não-WIN/WDO**: ignorados nesta versão, com aviso no preview.

---

## Fluxo do usuário

1. Em `/trades` (Futuros), novo botão **"Importar do Profit"** ao lado do botão "Importar" atual (CSV).
2. Modal abre com drop-zone aceitando `.pdf`, `.xlsx`, `.xls` (máx 10 MB).
3. Frontend envia o arquivo (base64) para edge function `parse-profit-report`.
4. A função:
   - Detecta PDF vs Excel.
   - **Excel**: parseia com `xlsx` (esm.sh), localiza cabeçalho `Data | Ativo | C/V | Qtde | Preço | Resultado`.
   - **PDF**: extrai texto com `unpdf`, agrupa por linhas, identifica blocos por data `dd/MM/yyyy`.
   - Agrega boletas por **(data, ativo)** somando resultado em R$ e pontos.
   - Mapeia `WIN*` → `indice`, `WDO*` → `dolar`. Demais ignorados.
   - Retorna `{ trades, skipped, totals }`.
5. Modal mostra **preview**: tabela de trades extraídos + lista de linhas ignoradas com motivo.
6. Botão "Confirmar e importar" → `INSERT` em massa em `trades` (mesmo path do CSV atual).
7. Após importar, atalho **"Ver Análise de Performance"** leva para `/dashboard?tab=analise`.

---

## Análise Padrão (determinística, sem IA)

Nova aba/seção em `/dashboard`: **"Análise de Performance"**.

### Métricas calculadas (puro TypeScript, sem chamada externa)

A partir dos `trades` do usuário no período (30d / 90d / 365d / todos):

| Métrica | Cálculo |
|---|---|
| Saldo líquido | `Σ result_reais` |
| Lucro bruto | `Σ result_reais > 0` |
| Prejuízo bruto | `Σ result_reais < 0` |
| Fator de lucro | `lucro_bruto / |prejuízo_bruto|` |
| Win rate | `wins / total` |
| Média gain / loss | médias separadas |
| RR médio | `média_gain / |média_loss|` |
| Sequência max W / L | varredura sequencial |
| Drawdown máx (R$ e %) | curva acumulada → pico-vale |
| Lote médio / máximo | a partir dos contratos extraídos |
| Trades pós-loss / pós-win | win rate condicional |
| Concentração por ativo | % do resultado em WIN vs WDO |
| Dias com loss > 2× média | flag overtrade emocional |

### Geração da análise (regras condicionais)

Cada seção do output é montada por **regras `if/then`** sobre as métricas, retornando frases prontas em português. Exemplos das regras:

**Raio-X (2-4 frases):**
- `winRate ≥ 0.6 && rr < 1` → "Trader com alta taxa de acerto, dependente de assertividade para gerar resultado."
- `rr ≥ 1.5 && winRate < 0.5` → "Perfil assimétrico saudável: ganha menos vezes, mas com retorno superior."
- `profitFactor ≥ 1.5 && drawdownPct < 15` → "Execução consistente com gestão de risco controlada."
- `profitFactor < 1` → "Resultado líquido negativo no período — base para diagnóstico, não para escala."

**Comportamento:**
- `winRateAfterWin < winRate - 10pp` → "Sua performance cai após sequências positivas (excesso de confiança)."
- `winRateAfterLoss < winRate - 10pp` → "Você não lida bem com perdas isoladas — busca recuperação imediata."
- `lossSequence ≥ 4` → "Sequência máxima de N losses indica falha em pausar após sinal claro de mercado contrário."

**Execução:**
- `avgGain < |avgLoss|` → "Você corta ganhos rápido e segura perdas — relação invertida ao saudável."
- `concentracaoAtivo ≥ 80%` → "85% do resultado vem de WIN — sem diversificação, sem hedge natural."

**Gestão de Risco:**
- `rr < 1` → "RR médio abaixo de 1: modelo só funciona com win rate alto. Pequena queda quebra o sistema."
- `drawdownPct ≥ 20` → "Drawdown de N% indica falha pontual de controle — provável aumento de lote em momento errado."
- `maxLote > 2 × avgLote` → "Lote máximo é Nx o lote médio: escala emocional, não planejada."

**Padrões Ocultos:**
- `winRate ≥ 0.55 && profitFactor < 1.3` → "Mesmo com alta assertividade, crescimento limitado pelo baixo retorno médio."
- `lotePosWin > loteMedio * 1.3` → "Risco aumenta após ganhos consecutivos."

**Alertas (top 4 por severidade):**
- Dependência de acerto, RR baixo, overtrade, escala inconsistente, drawdown excessivo.

**Plano de Ação (4-6 itens):**
- Gerados a partir dos alertas: "Busque RR mínimo 1.5", "Pare após 2 losses no dia", "Padronize lote em N contratos", etc.

### Renderização

- Componente `<PerformanceAnalysis />` em `src/components/PerformanceAnalysis.tsx`.
- Layout em cards verticais, ícones por seção (cérebro, gráfico, engrenagem, escudo, lupa, alerta, foguete).
- Seletor de período no topo (30d / 90d / 365d / Todos).
- Botão "Exportar análise" → gera PDF simples com `jspdf` (já compatível, sem dependência nova pesada).
- Sem persistência: análise é recalculada a cada visualização (rápido, sob 100ms para milhares de trades).

---

## Mudanças técnicas

### Backend

1. **Edge function `parse-profit-report`** (`verify_jwt = true`)
   - Deps: `xlsx` e `unpdf` via esm.sh.
   - Heurísticas de cabeçalho Profit (case-insensitive, acentos normalizados).
   - Agrega por dia/ativo (mantém padrão atual de 1 linha por dia/ativo na tabela `trades`).
   - Output: `{ trades: [...], skipped: [{linha, motivo}], totals: {...} }`.

2. **Sem migração SQL** — análise é client-side; importação reutiliza tabela `trades` existente.

### Frontend

- `src/lib/performanceAnalysis.ts` — funções puras: `computeMetrics(trades)` e `buildAnalysis(metrics)` retornando `{ raioX, comportamento, execucao, risco, padroes, alertas, planoAcao }`.
- `src/components/ProfitImportDialog.tsx` — modal de upload + preview + confirmação.
- `src/components/PerformanceAnalysis.tsx` — render da análise estruturada.
- `src/pages/Trades.tsx` — adicionar botão "Importar do Profit".
- `src/pages/Dashboard.tsx` — adicionar aba/seção "Análise de Performance".

### Memória

- `mem://features/profit-report-import` — layout esperado, agregação por dia/ativo, ativos suportados.
- `mem://features/performance-analysis-rules` — tabela de regras condicionais que geram cada frase.

---

## Fora do escopo

- Profit em `/stock-dashboard` e `/international-dashboard` (próxima iteração).
- OCR para PDFs escaneados (Profit exporta texto nativo).
- Edição manual dos trades no preview (cancelar e reexportar).
- Análise via IA (descartado: sem consumo de créditos).

---

## O que preciso confirmar antes de implementar

1. **Agregação por dia + ativo está OK?** Várias boletas viram 1 linha em `trades`, somando resultado e pontos — mantém padrão atual do app.
2. **Anexar arquivo de exemplo do Profit (PDF ou XLSX)** se possível — calibra o parser de primeira e evita retrabalho.
3. **Período padrão da análise**: 90 dias ou todos os trades?
