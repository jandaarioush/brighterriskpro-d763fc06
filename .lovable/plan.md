

## Plano: Adicionar Novos Logos do Brighter Risk Pro

### Objetivo

Substituir o logo atual por duas versões do novo logo oficial, configurando o sistema para usar automaticamente a versão correta baseada no tema (claro/escuro).

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/assets/logo-brighter-light.png` | **CRIAR** - Copiar o logo para fundo claro |
| `src/assets/logo-brighter-dark.png` | **CRIAR** - Copiar o logo para fundo escuro |
| `src/components/ThemeLogo.tsx` | **MODIFICAR** - Usar logos diferentes por tema |
| `src/pages/Index.tsx` | **VERIFICAR** - Ajustar uso do logo se necessário |

---

### 1. Copiar os Logos para o Projeto

Copiar as duas versões dos logos enviados:

- `user-uploads://Design_sem_nome_5.png` (fundo branco) para `src/assets/logo-brighter-light.png`
- `user-uploads://Golden_shield_with_modern_typography.png` (fundo escuro) para `src/assets/logo-brighter-dark.png`

---

### 2. Atualizar Componente ThemeLogo

Modificar o componente para usar a imagem correta baseada no tema:

```typescript
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import logoDark from '@/assets/logo-brighter-dark.png';
import logoLight from '@/assets/logo-brighter-light.png';

export function ThemeLogo({ className = "h-8", alt = "Brighter Risk Pro" }: ThemeLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <img src={logoDark} alt={alt} className={className} />;
  }

  // Usa logo diferente baseado no tema
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

### 3. Remover Texto Duplicado do Header

O header atual mostra `ThemeLogo + "Risk Pro"` como texto separado. Como o novo logo já inclui o texto "BRIGHTER RISK PRO", devemos remover o texto extra ou ajustar o layout.

**Opção A** - Usar apenas o logo completo (recomendado):
```tsx
<Link to="/" className="absolute left-0 flex items-center">
  <ThemeLogo className="h-10" />
</Link>
```

**Opção B** - Manter apenas o ícone do escudo e texto separado:
- Criar versão do logo somente com o ícone (sem texto)

---

### 4. Atualizar Footer

Adicionar logo no footer também:

```tsx
<div>
  <ThemeLogo className="h-12 mb-4" />
  <p className="text-muted-foreground text-sm">
    Gestão de risco inteligente para traders profissionais
  </p>
</div>
```

---

### Resumo Visual

```text
+---------------------------+
|  ANTES                    |
|  [logo-antigo] Risk Pro   |  <-- Logo + texto separado
+---------------------------+

+---------------------------+
|  DEPOIS                   |
|  [BRIGHTER RISK PRO]      |  <-- Logo completo com texto integrado
+---------------------------+

Tema Claro: usa logo-brighter-light.png (fundo transparente)
Tema Escuro: usa logo-brighter-dark.png (fundo transparente)
```

---

### Benefícios

1. Logo oficial integrado com texto "BRIGHTER RISK PRO"
2. Transição suave entre temas
3. Identidade visual mais profissional e consistente
4. Sem necessidade de filtros CSS artificiais

