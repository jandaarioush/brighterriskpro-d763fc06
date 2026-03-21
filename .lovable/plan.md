

## Plano: Animação Slide entre Steps dos Simuladores

### Abordagem

Adicionar transição de slide horizontal entre os steps, rastreando a direção (esquerda/direita) para animar corretamente. Usar `useState` para controlar `direction` e CSS `transform` + `transition` para o efeito.

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/landing/InteractiveTour.tsx` | Trocar layout grid com opacity para container com slide horizontal entre steps |
| `src/components/landing/StockInteractiveTour.tsx` | Trocar block/hidden por slide horizontal entre steps |

### Detalhes

**Mecânica (ambos componentes):**

- Adicionar estado `direction` (`"left" | "right"`) atualizado nos botões prev/next
- Wrapper `overflow-hidden` contendo os step panels
- Cada step usa `absolute inset-0` quando inativo, com `translate-x` para posicionar fora da tela
- Step ativo: `translate-x-0 opacity-100`
- Step saindo para esquerda: `-translate-x-full opacity-0`
- Step saindo para direita: `translate-x-full opacity-0`
- Transição: `transition-all duration-500 ease-in-out`
- Container com `relative` e `min-height` calculado para evitar colapso

**InteractiveTour.tsx:**
- Mudar de grid com 4 paineis simultâneos (opacity 0.2) para exibir apenas o step ativo com slide
- Cada step vira um painel independente ocupando 100% do container

**StockInteractiveTour.tsx:**
- Substituir `block/hidden` por posicionamento absoluto com translate

