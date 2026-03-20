

## Plano: Reduzir espaço entre logo e título no Hero

O problema não é a imagem em si — é o `space-y-8` (32px) entre os elementos do hero. Em vez de cortar a imagem (o que perderia qualidade), basta reduzir o gap CSS.

### Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Index.tsx` | Reduzir espaçamento vertical entre logo e título |

### Mudanças

1. **Linha 56**: Trocar `space-y-8` por `space-y-4` no container do hero (reduz gap de 32px para 16px)
2. **Linha 57-61**: Adicionar margem negativa no logo `mb-0` ou reduzir padding interno caso necessário

```tsx
// De:
<div className="text-center space-y-8 animate-fade-in">

// Para:
<div className="text-center space-y-4 animate-fade-in">
```

Se ainda precisar de mais proximidade, pode-se também reduzir o `py-20 md:py-32` da section para `py-12 md:py-20`.

