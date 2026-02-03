
## Plano: Adicionar Logos Light/Dark do Brighter Risk Pro

### Objetivo

Substituir o sistema atual (que usa filtros CSS) por logos oficiais específicos para cada tema, proporcionando melhor qualidade visual e identidade profissional.

---

### Arquivos Envolvidos

| Arquivo | Acao |
|---------|------|
| `src/assets/logo-brighter-light.png` | **CRIAR** - Copiar logo para tema claro |
| `src/assets/logo-brighter-dark.png` | **CRIAR** - Copiar logo para tema escuro |
| `src/components/ThemeLogo.tsx` | **MODIFICAR** - Alternar entre logos por tema |
| `src/pages/Index.tsx` | **MODIFICAR** - Remover texto "Risk Pro" duplicado |

---

### 1. Copiar Logos para o Projeto

Copiar as duas versoes enviadas anteriormente:

```text
user-uploads://Design_sem_nome_5.png 
  -> src/assets/logo-brighter-light.png

user-uploads://Golden_shield_with_modern_typography.png 
  -> src/assets/logo-brighter-dark.png
```

---

### 2. Atualizar Componente ThemeLogo

**Antes (atual):**
```typescript
import logoBrighter from '@/assets/logo-brighter.png';

// Usa filtro CSS para modo claro
className={`${resolvedTheme === 'light' ? 'brightness-0' : ''}`}
```

**Depois:**
```typescript
import logoDark from '@/assets/logo-brighter-dark.png';
import logoLight from '@/assets/logo-brighter-light.png';

export function ThemeLogo({ className = "h-8", alt = "Brighter Risk Pro" }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fallback para evitar hydration mismatch
  if (!mounted) {
    return <img src={logoDark} alt={alt} className={className} />;
  }

  // Seleciona logo baseado no tema
  const logoSrc = resolvedTheme === 'light' ? logoLight : logoDark;

  return (
    <img 
      src={logoSrc}
      alt={alt}
      className={`${className} transition-all duration-200`}
    />
  );
}
```

---

### 3. Ajustar Index.tsx (Header)

O header atual mostra o logo + texto "Risk Pro" separado. Como o novo logo já inclui o texto completo "BRIGHTER RISK PRO", o texto extra deve ser removido.

**Antes:**
```tsx
<Link to="/" className="absolute left-0 flex items-center">
  <ThemeLogo className="h-8" />
  <span className="ml-3 font-montserrat font-bold text-xl">Risk Pro</span>
</Link>
```

**Depois:**
```tsx
<Link to="/" className="absolute left-0 flex items-center">
  <ThemeLogo className="h-10" />
</Link>
```

---

### 4. Resultado Visual

```text
TEMA ESCURO (dark):
+----------------------------------------+
| [escudo dourado] BRIGHTER RISK PRO     |  <- logo-brighter-dark.png
| (fundo escuro, texto claro)            |
+----------------------------------------+

TEMA CLARO (light):
+----------------------------------------+
| [escudo dourado] BRIGHTER RISK PRO     |  <- logo-brighter-light.png
| (fundo claro, texto escuro)            |
+----------------------------------------+
```

---

### Beneficios

1. Logos oficiais de alta qualidade sem filtros CSS
2. Texto "BRIGHTER" com cor correta para cada tema
3. Transicao suave entre temas (200ms)
4. Identidade visual consistente em toda a aplicacao
5. Remocao do texto duplicado "Risk Pro" no header
