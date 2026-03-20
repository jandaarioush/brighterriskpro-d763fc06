

## Plano: Tour Guiado Interativo na Seção "Como Funciona"

Criar um mini-dashboard visual com dados mock dentro da seção "Como Funciona", onde o usuário clica "Próximo" para navegar pelos 4 passos. A cada passo, o dashboard destaca a funcionalidade correspondente com tooltips/overlays explicativos.

### Componente Novo

| Arquivo | Descrição |
|---------|-----------|
| `src/components/landing/InteractiveTour.tsx` | Tour guiado com mini-dashboard e 4 steps |

### Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/landing/HowItWorks.tsx` | Integrar o InteractiveTour abaixo dos steps |

### Como Funciona

**Layout**: Abaixo dos 4 cards numerados atuais, aparece um bloco visual representando um mini-dashboard com dados fictícios. O usuário navega entre os 4 passos com botões "Anterior" / "Próximo".

**Cada step destaca uma área diferente do mini-dashboard:**

1. **Configure seu Risco** — Formulário mock com campos "Capital" (R$ 50.000) e "Risco Mensal" (R$ 3.000) com um botão "Calcular". Tooltip: "Defina seu capital e quanto aceita perder por mês."

2. **Defina Limites** — Cards de Risco Diário (R$ 136,36), Stop Índice (682 pts) e Stop Dólar (13,6 pts) aparecem calculados. Tooltip: "O sistema distribui o risco automaticamente pelos dias úteis."

3. **Opere com Proteção** — Mini formulário de registro de trade com resultado preenchido. O card de Risco Diário recalcula mostrando o ajuste. Tooltip: "Cada trade registrado ajusta seu risco em tempo real."

4. **Acompanhe Resultados** — Mini gráfico de barras (dados mock) + heatmap simplificado com cores verde/vermelho. Tooltip: "Visualize sua performance com gráficos e heatmaps."

**Visual**:
- Container com `bg-[#1b1c1e] border border-white/10 rounded-2xl` (glass style)
- Overlay/tooltip dourado com seta apontando para o elemento destacado
- Área não-ativa com opacity reduzida (0.3) para guiar o foco
- Transição suave entre steps (fade-in)
- Step indicators (dots dourados) + botões Anterior/Próximo
- Responsivo: em mobile, o dashboard fica empilhado verticalmente

**Dados mock hardcoded** (sem Supabase, sem auth):
- Capital: R$ 50.000
- Risco mensal: R$ 3.000
- 22 dias úteis
- Trades fictícios com mix de ganhos e perdas

