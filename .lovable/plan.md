

## Plano: Redesign Completo UI — Estilo Trading Terminal Premium

### Visao Geral

Transformar o dashboard de "SaaS generico" para "cockpit financeiro premium" com estetica Brighter (preto profundo, dourado, glow, tipografia mono para numeros, microinteracoes). O redesign toca 10+ arquivos e sera dividido em blocos logicos.

---

### Bloco 1 — Design System (Fundacao)

**`src/index.css`**
- Dark mode background mais profundo: `220 20% 4%` (quase #050505)
- Cards com gradiente sutil: `from-[hsl(220,14%,8%)] to-[hsl(220,14%,6%)]`
- Novas utility classes:
  - `.card-glow` — border glow dourado sutil + hover elevacao
  - `.card-glow-success` / `.card-glow-danger` — variantes verde/vermelho
  - `.font-mono-trading` — font-family monospace para numeros
  - `.counting-up` — animacao CSS para numeros aparecendo
  - `.progress-glow` — barra de progresso com glow

**`tailwind.config.ts`**
- Adicionar keyframes: `count-up`, `glow-pulse`, `slide-up-fade`
- Adicionar font-family `mono-trading`: `['JetBrains Mono', 'Fira Code', 'monospace']`

---

### Bloco 2 — StatCard Premium

**`src/components/StatCard.tsx`** — Reescrita completa
- Background: gradiente escuro com borda glow colorida (variant-based)
- Hover: `translateY(-2px)` + intensifica glow
- Numeros: fonte mono, tamanho maior (`text-4xl`), animacao counting-up ao montar
- Icone: menor, discreto, no canto com opacity 0.6
- Sparkline mini opcional (prop `sparklineData?: number[]`) usando SVG inline simples
- Subtitulo com tipografia menor e mais respiro

---

### Bloco 3 — Dashboard Principal

**`src/pages/Dashboard.tsx`** — Reestruturacao do layout

Novo layout de cima para baixo:

1. **Greeting Banner** atualizado → "PAINEL DE CONTROLE" com insight:
   - "Voce precisa fazer X pts/dia para bater sua meta"
   - Barra de progresso da meta horizontal no topo com % e quanto falta

2. **Cards principais** (3 cols) — usando StatCard premium:
   - Resultado Acumulado (com sparkline)
   - Risco Diario Atual
   - Taxa de Acerto

3. **Status do Mes** — Card com insight automatico:
   - Calcula ritmo atual vs meta
   - Frases como "Acima da media", "Precisa acelerar", "Meta praticamente batida"

4. **Graficos** (2 cols) — PnL Evolution + Risk Calculator

5. **Heatmap + TradeForm** (2 cols)

**`src/components/GreetingBanner.tsx`**
- Titulo: "PAINEL DE CONTROLE" com tracking wider
- Subtitulo: meta diaria em pontos ("320 pts/dia para bater a meta")
- Barra de progresso horizontal com glow dourado
- Dados vindos do dashboard (monthly_goal, trades acumulados)

---

### Bloco 4 — Calendario Trading Journal

**`src/pages/Calendar.tsx`** — Upgrade visual

- **Stat cards no topo**: aplicar estilo StatCard premium com glow
- **Calendario**:
  - Cada dia vira bloco interativo com cores semanticas:
    - Verde (#00FF88/20): meta batida (resultado > dailyGoal)
    - Vermelho (#FF4D4D/20): prejuizo
    - Amarelo/dourado: abaixo da meta mas positivo
    - Cinza escuro: nao operou
  - Hover: tooltip/popover mostrando pontos, resultado R$, nr trades
  - Numeros do dia em fonte mono
  - Border glow sutil na cor do resultado
- **Barra de progresso da meta**: horizontal acima do calendario

---

### Bloco 5 — Graficos Premium

**`src/components/PnLEvolutionChart.tsx`** e **`src/components/DailyWeeklyCharts.tsx`**
- Linha com `filter: drop-shadow(0 0 6px color)` para efeito glow
- Area preenchida com gradiente (cor → transparente)
- Animacao de entrada: `animationBegin={200}` no Recharts
- Tooltip com estilo glassmorphism
- Adicionar linha de referencia "meta ideal" (tracejada dourada) quando `monthlyGoal` existir

---

### Bloco 6 — Sidebar Premium

**`src/components/HubSidebar.tsx`**
- Background mais escuro (`hsl(220 14% 5%)`)
- Item ativo: barra lateral iluminada (3px dourada com glow)
- Hover: glow dourado sutil no texto e icone
- Icones: manter lucide (ja sao finos), adicionar `opacity-70` e `group-hover:opacity-100`
- Logo com glow sutil

---

### Bloco 7 — Microinteracoes Globais

**`src/index.css`** — Adicionar:
- `.animate-count-up` para numeros (opacity 0→1 + translateY)
- Transicoes em todos os cards (ja parcialmente existe com `glass-card-hover`)
- Focus states com glow dourado nos inputs

---

### Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/index.css` | Novas variaveis, utilities, keyframes |
| `tailwind.config.ts` | Font mono, keyframes, animacoes |
| `src/components/StatCard.tsx` | Reescrita com glow, mono, sparkline |
| `src/pages/Dashboard.tsx` | Novo layout, progress bar, insights |
| `src/components/GreetingBanner.tsx` | "Painel de Controle" + meta diaria |
| `src/pages/Calendar.tsx` | Calendario trading journal premium |
| `src/components/PnLEvolutionChart.tsx` | Glow lines, gradient fill, meta line |
| `src/components/DailyWeeklyCharts.tsx` | Mesmas melhorias de graficos |
| `src/components/HubSidebar.tsx` | Glow hover, barra ativa iluminada |
| `src/components/MonthHeatmap.tsx` | Cores semanticas + glow borders |

### Notas

- Todas as mudancas respeitam light/dark mode (variaveis CSS)
- Nenhuma mudanca de banco de dados necessaria
- Font mono sera carregada via Google Fonts no `index.html`
- As cores #00FF88 e #FF4D4D serao mapeadas para HSL nas variaveis CSS

