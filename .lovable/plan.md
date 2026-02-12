

## Plano: Atualizar Preços dos Planos

Alterar os valores exibidos em duas páginas:

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Index.tsx` | R$ 97 -> R$ 147, R$ 497 -> R$ 997 |
| `src/pages/Precos.tsx` | R$ 97 -> R$ 147, R$ 497 -> R$ 997, atualizar economia |

### Detalhes

**Index.tsx** - 2 locais com preço:
- Seção "Plano Premium": R$ 97/mês -> R$ 147/mês e R$ 497 -> R$ 997

**Precos.tsx** - Planos:
- Premium Mensal: R$ 97 -> R$ 147
- Premium Anual: R$ 497 -> R$ 997
- Economia: R$ 667 -> R$ 767 (12 x 147 = 1764 - 997 = 767)

Nenhuma lógica ou cálculo será alterado, apenas os valores de texto exibidos.

