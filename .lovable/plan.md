

## Plano: Atualizar Preços no Checkout

O arquivo `src/pages/Checkout.tsx` ainda contém os valores antigos. Atualizar:

### Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Checkout.tsx` | Atualizar objeto `plans` com novos valores |

### Detalhes

No objeto `plans` (linhas 16-42):

- **mensal**: `price: 97` -> `147`, `priceDisplay: "R$ 97"` -> `"R$ 147"`
- **anual**: `price: 497` -> `997`, `priceDisplay: "R$ 497"` -> `"R$ 997"`, `description: "Economize R$ 667 (43% off)"` -> `"Economize R$ 767 (43% off)"`

Apenas valores de texto exibidos, sem alteracao de logica.

