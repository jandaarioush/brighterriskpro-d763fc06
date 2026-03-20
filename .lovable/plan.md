

## Plano: Adicionar Logo Centralizado no Hero

### Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Index.tsx` | Copiar logo uploaded para assets, adicionar imagem acima do título no hero |

### Mudanças

1. **Copiar a imagem** `Design_sem_nome_5-3.png` para `src/assets/logo-hero.png`

2. **Modificar o hero** (linhas 55-59): Adicionar o logo centralizado antes do h1, com o título abaixo

```tsx
<div className="text-center space-y-8 animate-fade-in">
  {/* Logo centralizado */}
  <img 
    src={logoHero} 
    alt="Brighter Risk Pro" 
    className="h-32 md:h-40 mx-auto drop-shadow-lg"
  />
  <h1 className="font-montserrat text-5xl md:text-7xl font-bold tracking-tight">
    Domine seus Trades com
    <span className="block mt-2">Gestão de Risco Inteligente</span>
  </h1>
  ...
```

3. **Adicionar import** no topo: `import logoHero from '@/assets/logo-hero.png';`

