

## Plano: Aumentar Logo do Hero

### Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Index.tsx` | Aumentar classes de altura do logo de `h-32 md:h-40` para `h-48 md:h-64` |

### Mudança (linha 60)

```tsx
// De:
className="h-32 md:h-40 mx-auto drop-shadow-lg"

// Para:
className="h-48 md:h-64 mx-auto drop-shadow-lg"
```

Isso dobra aproximadamente o tamanho do logo (de 128/160px para 192/256px).

