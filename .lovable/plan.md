## Objetivo

Trazer a **tipografia** e a **paleta de cores** do projeto **Brighter Core Hub** para o **Brighter Risk Pro**, mantendo a identidade do ecossistema Brighter consistente entre os dois apps.

---

## O que muda

### Tipografia

| Onde | Hoje (Risk Pro) | Depois (Hub) |
|---|---|---|
| Body / sans | Plus Jakarta Sans | **Inter** |
| Títulos / display | Plus Jakarta Sans | **Montserrat** |
| Números (mono) | JetBrains Mono | JetBrains Mono (mantido — regra do projeto) |

Carregamento via Google Fonts em `index.html`:  
`Montserrat (400/500/600/700/800)` + `Inter (300/400/500/600/700)` + `JetBrains Mono` (mantido).

### Paleta de cores (HSL)

Os tokens semânticos continuam os mesmos (`--background`, `--primary`, `--card`, etc.) — **só os valores HSL mudam** para casar com o Hub. Tokens específicos do Risk Pro (`--success`, `--danger`, gradientes, `--shadow-glow`, charts) são preservados.

**Light mode:**

| Token | Hoje | Hub |
|---|---|---|
| `--background` | 0 0% 98% | 40 10% 96% (off-white quente) |
| `--foreground` | 222 47% 11% | 220 18% 12% |
| `--primary` (gold) | 43 96% 46% | 39 82% 47% |
| `--card` | 0 0% 100% | 0 0% 100% (igual) |
| `--border` | 220 13% 91% | 40 8% 85% |
| `--muted` | 220 14% 96% | 40 8% 90% |
| `--radius` | 0.5rem | 0.75rem |

**Dark mode:**

| Token | Hoje | Hub |
|---|---|---|
| `--background` | 220 20% 2% (Deep Black) | 228 16% 4% (Deep Navy-Black) |
| `--card` | 220 14% 6% | 224 16% 10% |
| `--primary` | 43 85% 52% | 39 82% 47% |
| `--border` | 220 14% 12% | 224 12% 18% |

**Novos tokens** (do Hub): `--gold`, `--gold-light`, `--graphite` + sidebar tokens (`--sidebar-*`).

### Tailwind

`tailwind.config.ts`:
- `fontFamily.sans` → Inter, `fontFamily.display` → Montserrat (apelidos `montserrat`/`inter` apontando para os reais).
- Adicionar `colors.gold` (DEFAULT + light), `colors.graphite`, `colors.sidebar.*`.

### Utilitários CSS

Trazer do Hub (em `@layer utilities` no `src/index.css`, **adicionando** sem remover os atuais):
- `.text-gradient-gold` (substitui o atual com o gradient mais quente do Hub)
- `.glow-gold`, `.glow-gold-sm`, `.glow-gold-hover`
- `.border-gradient-gold`
- `.bg-grid-pattern`
- `.card-premium`
- Animação `pulse-glow` no Tailwind keyframes.

---

## Arquivos editados

1. `index.html` — troca `<link>` do Google Fonts.
2. `tailwind.config.ts` — fontes + tokens `gold`, `graphite`, `sidebar`.
3. `src/index.css` — atualização dos blocos `:root` e `.dark` (HSL Hub) + utilitários gold; mantém todos os utilitários atuais (`card-glow`, `kpi-number`, `glass-card`, animações etc.).

Sem mudanças em componentes — todos já consomem tokens semânticos (`bg-background`, `text-foreground`, `bg-primary`...), então a aparência se atualiza automaticamente para o look do Hub.

---

## Memória

Atualizar `mem://style/design-system` e a linha Core do `mem://index.md`:
- Trocar "Plus Jakarta Sans" por "Montserrat (display) + Inter (body); JetBrains Mono para números".
- Trocar "Deep Black (#050505)" pela paleta navy-black do Hub (`hsl(228 16% 4%)`) e gold `hsl(39 82% 47%)`.

---

## Fora do escopo

- Não troca componentes individualmente; mudança é via tokens.
- Não mexe em `src/integrations/supabase/*` nem em lógica de negócio.
- Não altera o modo padrão (dark continua sendo o default do app).
