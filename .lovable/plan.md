

## Plano: Redesign Completo — Trading Terminal Premium

### Resumo

Redesign profundo do Hub e Dashboard para parecer um cockpit de trader profissional. Atualiza tipografia global (Plus Jakarta Sans), refina tema light/dark, transforma o ThemeToggle em pill, redesenha o Hero/Hub com painel de controle, melhora cards de dashboards com dados de risco, e adiciona background com textura sutil.

---

### Bloco 1 — Tipografia e Design System

**`index.html`**
- Substituir JetBrains Mono + Montserrat + Inter por **Plus Jakarta Sans** (pesos 400-700) + manter **JetBrains Mono** para numeros

**`tailwind.config.ts`**
- Substituir `font-montserrat` e `font-inter` por `font-sans: ['Plus Jakarta Sans', ...]`
- Manter `font-mono-trading` para numeros

**`src/index.css`**
- Light mode: background `0 0% 98%` (~#FAFAFA), cards brancos com sombra suave
- Dark mode: manter #050505 atual
- `.card-glow` light mode: background branco, sombra leve em vez de gradiente escuro
- Adicionar `.bg-grain` — textura noise sutil via SVG data URI + gradiente radial
- Body: aplicar `font-sans` (Plus Jakarta Sans) em tudo

---

### Bloco 2 — ThemeToggle Pill

**`src/components/ThemeToggle.tsx`** — Reescrever
- Botao estilo pill (arredondado, px-3 py-1.5)
- Dark: fundo cinza escuro com backdrop-blur, icone lua
- Light: fundo branco com sombra leve, icone sol
- Click alterna entre dark/light (sem dropdown, sem system)
- Transicao 250ms

**`src/components/HubSidebar.tsx`**
- Remover ThemeToggle da sidebar
- Mover para o header do layout (canto superior direito)

**`src/components/DashboardLayoutWrapper.tsx`**
- Adicionar header fino com ThemeToggle pill + relogio no canto superior direito

---

### Bloco 3 — Hero / Hub Redesign

**`src/pages/Hub.tsx`** — Reescrever WelcomeSection
- Titulo: **"Controle total do seu risco."** (sem emoji, bold, tracking leve)
- Subtexto dinamico baseado nos dados:
  - "Voce ainda tem R$ X disponiveis hoje" ou "Voce ja utilizou X% do risco mensal"
- Barra de progresso da meta mensal com % e status textual:
  - "Ritmo saudavel" / "Abaixo da meta" / "Acelerado"
- Relogio trading terminal: glass card com hora em mono bold + "(BRT)"

**Cards de Dashboards** — Upgrade visual
- Cada card mostra:
  - Icone outline + nome + descricao
  - Bloco de risco: "Risco Mensal: R$ X / Disponivel: R$ X / Usado: X%"
- Gradientes por tipo: Internacional→dourado, Acoes→verde, Futuros→azul
- Glass effect (backdrop-blur) + glow sutil
- Hover: scale 1.02 + glow aumenta
- Carregar `monthly_risk` e trades acumulados para calcular "disponivel" e "%"

---

### Bloco 4 — Market Sessions Premium

**`src/components/MarketSessionsClock.tsx`**
- Timeline: barras com gradiente + glow leve + fade em sessoes inativas
- Linha "Agora": dourada com glow + label "Agora" + pulsacao CSS
- Sessao ativa: badge "Mercado Aberto" com glow verde

**Status dos mercados** — Adicionar bloco de insights:
- "EUA aberto — alta volatilidade"
- "Europa fechando — baixa liquidez"
- "Asia fechada"

---

### Bloco 5 — Sidebar Premium (refinamento)

**`src/components/HubSidebar.tsx`**
- Persistir estado collapsed no localStorage
- Mais padding/espacamento entre items
- Labels de grupo: menor opacity, mais tracking
- Hover: leve slide lateral (translateX 2px)
- Light mode: fundo branco com sombra lateral

---

### Bloco 6 — Dashboard Principal (refinamento)

**`src/pages/Dashboard.tsx`**
- GreetingBanner: titulo "Controle total do seu risco." em vez de saudacao
- Subtexto: "Voce ainda tem R$ X disponiveis hoje"
- Mais padding nos cards (p-8)
- Mais gap entre secoes (gap-8)

**`src/components/GreetingBanner.tsx`**
- Receber `monthlyRisk` e `riskUsed` como props adicionais
- Mostrar "Voce ja utilizou X% do seu risco mensal" como subtexto secundario
- Status: "Ritmo saudavel" / "Abaixo da meta" / "Acelerado" baseado no uso do risco

---

### Bloco 7 — "Leitura do Dia"

**`src/pages/Hub.tsx`** ou **`src/pages/Dashboard.tsx`**
- Novo componente `DailyInsight`
- Card com icone de fogo + frase contextual:
  - Baseado em hora do dia + resultado acumulado + volatilidade
  - Ex: "Dia alinhado com sua meta — mantenha consistencia"
- Posicionar abaixo dos cards de dashboard

---

### Bloco 8 — Background

**`src/index.css`**
- Body dark: gradiente radial sutil (centro levemente mais claro)
- Textura grain via pseudo-elemento `::after` com SVG noise pattern a ~3% opacity

---

### Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `index.html` | Font Plus Jakarta Sans |
| `tailwind.config.ts` | font-sans atualizado |
| `src/index.css` | Light mode refinado, grain background, card-glow light |
| `src/components/ThemeToggle.tsx` | Pill toggle dark/light |
| `src/components/DashboardLayoutWrapper.tsx` | Header com ThemeToggle + clock |
| `src/components/HubSidebar.tsx` | localStorage persist, mais espacamento, remover ThemeToggle |
| `src/pages/Hub.tsx` | Hero redesign, cards com risco, DailyInsight |
| `src/components/GreetingBanner.tsx` | Props de risco, subtexto dinamico |
| `src/pages/Dashboard.tsx` | Passar risco para GreetingBanner, mais espacamento |
| `src/components/MarketSessionsClock.tsx` | Glow, pulsacao, insights de mercado |

