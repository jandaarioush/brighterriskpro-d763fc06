

## Plano: Ajustar classes do logo no Hero

### Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Index.tsx` | Trocar classes do logo de `h-48 md:h-64` para `w-80 md:w-[26rem] lg:w-[32rem] h-auto object-contain mix-blend-lighten` + drop-shadow gold |

### Mudança (linha 60)

```tsx
// De:
className="h-48 md:h-64 mx-auto drop-shadow-lg"

// Para:
className="w-80 md:w-[26rem] lg:w-[32rem] h-auto object-contain mix-blend-lighten mx-auto drop-shadow-[0_0_30px_rgba(217,149,22,0.3)]"
```

