

## Plano: Manter a Estética 100% nas Cores da Brighter

### Resumo

O simulador e outros componentes estão usando cores como `purple-500`, `blue-500`, `orange-500` que não fazem parte da identidade visual da Brighter. Vou substituir todas essas cores pela paleta oficial:

| Uso | Cor Atual | Cor Brighter |
|-----|-----------|--------------|
| Destaque principal | `purple-500` | `primary` (gold HSL 43 96% 56%) |
| Informação secundária | `blue-500` | `primary` ou `muted-foreground` |
| Alertas/Margem | `orange-500` | `primary` (variação mais escura) |
| Sucesso/Ganhos | `green-500` | `success` (HSL 142 76% 36%) |
| Perda/Stop | `red-500` | `destructive` (HSL 0 84% 60%) |

---

### Mudanças no StockSimulator.tsx

#### Card 1: Simulação de Operação
**Antes:**
```tsx
<Card className="... from-purple-500/10 to-purple-600/5 border-purple-500/20">
  <div className="... bg-purple-500/20">
    <Calculator className="... text-purple-500" />
```

**Depois:**
```tsx
<Card className="... from-primary/10 to-primary/5 border-primary/20">
  <div className="... bg-primary/20">
    <Calculator className="... text-primary" />
```

#### Card 2: Análise de Risco
**Antes:**
```tsx
<Card className="... from-blue-500/10 to-blue-600/5 border-blue-500/20">
  <div className="... bg-blue-500/20">
    <AlertTriangle className="... text-blue-500" />
```

**Depois:**
```tsx
<Card className="... from-muted to-muted/50 border-border">
  <div className="... bg-muted">
    <AlertTriangle className="... text-primary" />
```

#### Card 3: Parâmetros Atuais
**Antes:**
```tsx
<Card className="... from-green-500/10 to-green-600/5 border-green-500/20">
  <div className="... bg-green-500/20">
    <CheckCircle2 className="... text-green-500" />
```

**Depois:**
```tsx
<Card className="... from-success/10 to-success/5 border-success/20">
  <div className="... bg-success/20">
    <CheckCircle2 className="... text-success" />
```

#### Indicadores de Limite (margem/stop)
**Antes:**
```tsx
pos.limiteFator === 'margem' 
  ? 'bg-orange-500/20 text-orange-500' 
  : 'bg-blue-500/20 text-blue-500'
```

**Depois:**
```tsx
pos.limiteFator === 'margem' 
  ? 'bg-primary/20 text-primary' 
  : 'bg-muted text-muted-foreground'
```

#### Cores de Ganho/Perda
**Antes:**
```tsx
<span className="text-green-500">Ganho: R$ {value}</span>
<span className="text-red-500">Perda: R$ {value}</span>
```

**Depois:**
```tsx
<span className="text-success">Ganho: R$ {value}</span>
<span className="text-destructive">Perda: R$ {value}</span>
```

#### Bordas Laterais em Parâmetros
**Antes:**
```tsx
<div className="... border-l-4 border-purple-500">
<div className="... border-l-4 border-orange-500">
<div className="... border-l-4 border-green-500">
```

**Depois:**
```tsx
<div className="... border-l-4 border-primary">
<div className="... border-l-4 border-primary/70">
<div className="... border-l-4 border-success">
```

---

### Resumo de Todas as Substituições

| Padrão Original | Substituição |
|-----------------|--------------|
| `purple-500` | `primary` |
| `purple-600` | `primary` |
| `blue-500` | `muted-foreground` ou `primary` |
| `blue-600` | `muted` |
| `orange-500` | `primary` (para margem) |
| `green-500` | `success` |
| `red-500` | `destructive` |

---

### Arquivos a Modificar

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/StockSimulator.tsx` | Aplicar todas as substituições de cores nos 3 cards e elementos internos |

---

### Seção Técnica

#### Paleta Oficial Brighter (index.css)

```css
/* Dark Mode */
--primary: 43 96% 56%;     /* Gold/Dourado */
--success: 142 76% 36%;    /* Verde */
--destructive: 0 84% 60%;  /* Vermelho */
--muted: 220 13% 15%;      /* Cinza escuro */
--muted-foreground: 0 0% 65%; /* Texto secundário */
```

#### Classes Tailwind Disponíveis
- `text-primary`, `bg-primary`, `border-primary`
- `text-success`, `bg-success`, `border-success`
- `text-destructive`, `bg-destructive`, `border-destructive`
- `text-muted-foreground`, `bg-muted`, `border-muted`

---

### Resultado Final

Após as mudanças, o simulador terá uma aparência 100% consistente com a identidade visual da Brighter:

- **Card Simulação:** Gradiente dourado (primary)
- **Card Análise:** Tons neutros com acentos dourados
- **Card Parâmetros:** Gradiente verde (success)
- **Ganhos:** Sempre em verde (`text-success`)
- **Perdas:** Sempre em vermelho (`text-destructive`)
- **Destaques:** Dourado (`text-primary`)

