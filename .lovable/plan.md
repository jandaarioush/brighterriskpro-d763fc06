

## Plano: Redesign Completo da Landing Page (Estilo Signals)

Reescrita total do `src/pages/Index.tsx` para replicar a estética premium do Brighter Signals, adaptando o conteúdo para gestão de risco.

### Estrutura da Nova Página

```text
┌─────────────────────────────────────────────┐
│ HEADER (sticky, minimal, dark)              │
│ Logo | Sobre · Recursos · Planos | Entrar   │
├─────────────────────────────────────────────┤
│ HERO (fullscreen, centered)                 │
│ Logo grande + headline gold gradient        │
│ "Proteja seu capital. Sobreviva no mercado."│
│ Subheadline + CTA dourado + outline CTA     │
│ Scroll indicator (chevron down)             │
├─────────────────────────────────────────────┤
│ VALUE PROPOSITION (4 cards, grid)           │
│ Controle automatizado · Proteção contra     │
│ perdas · Disciplina operacional · Gestão    │
│ profissional — ícones + hover glow          │
├─────────────────────────────────────────────┤
│ HOW IT WORKS (4 numbered steps)             │
│ 01 Configure · 02 Defina limites            │
│ 03 Opere · 04 Acompanhe                     │
├─────────────────────────────────────────────┤
│ FEATURES (4 cards with hover effects)       │
│ Limite diário · Bloqueio automático         │
│ Gestão por operação · Relatórios            │
├─────────────────────────────────────────────┤
│ DIFFERENTIATION (2-column comparison)       │
│ "Trader comum" vs "Com RiskPro"             │
├─────────────────────────────────────────────┤
│ PRICING (2 cards: Mensal / Anual)           │
├─────────────────────────────────────────────┤
│ FINAL CTA                                   │
│ "Sem controle de risco, não existe          │
│  consistência." + CTA dourado               │
├─────────────────────────────────────────────┤
│ FOOTER (minimal, dark)                      │
└─────────────────────────────────────────────┘
```

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Index.tsx` | Reescrita completa com todas as seções acima |
| `src/index.css` | Adicionar animações fade-in-up, classes utilitárias para glow e glass effects |

### Detalhes Técnicos

**Design System (alinhado ao Signals)**
- Background: `bg-[#0a0b0d]` (deep black, hardcoded para landing)
- Cards: `bg-[#1b1c1e]` com `border-white/5`
- Accent gold: usa `primary` existente (HSL 43 96%)
- Tipografia: Montserrat bold para headings, Inter para body
- Headings com gradiente dourado (já existe `text-gradient-animated`)

**Hero**
- Fullscreen height (`min-h-screen`), centered content
- Logo hero existente com classes atuais
- Headline: "Proteja seu capital. Sobreviva no mercado." com gradiente dourado
- CTA principal: botão com bg dourado, CTA secundário: outline com borda dourada
- Chevron down animado (bounce) como scroll indicator

**Value Proposition (4 cards)**
- Grid 2x2 em desktop, 1 coluna mobile
- Cards com `bg-white/5 backdrop-blur border-white/10`
- Hover: `border-primary/50` + subtle glow
- Ícones: Shield, AlertTriangle, Target, Briefcase

**How It Works (4 steps)**
- Layout horizontal em desktop, vertical mobile
- Números grandes dourados (01, 02, 03, 04) com linha conectora
- Texto mínimo abaixo de cada step

**Features (4 cards)**
- Grid similar ao value prop
- Hover effect: scale + glow dourado
- Ícones relevantes de lucide-react

**Differentiation**
- 2 colunas: esquerda "Trader Comum" (com X vermelho), direita "Com RiskPro" (com check dourado)
- 4-5 itens comparativos
- Cards com backgrounds contrastantes

**Pricing**
- 2 cards lado a lado (Mensal R$147, Anual R$997)
- Card anual com badge "MELHOR VALOR"
- Botões dourados, lista de features com checks

**Final CTA**
- Fundo com gradiente sutil dourado
- Headline impactante centralizada
- Botão CTA grande dourado

**Animações CSS a adicionar**
- `fade-in-up`: translateY(20px) → 0 com opacity
- `bounce-subtle`: para o chevron do hero
- Intersection Observer via classes CSS (`animate-on-scroll`)

**Removido da versão atual**
- Seção de depoimentos (não existe no Signals)
- Gradientes azuis do hero
- Cores success/danger nos cards de benefícios

