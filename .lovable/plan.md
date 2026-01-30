

## Plano: Atualizar Tipografia, Gradiente Animado nos Títulos e Centralizar Header

### O que será feito

1. **Atualizar fontes do Google Fonts** - Adicionar pesos adicionais para Inter (700) e Montserrat (600)
2. **Criar classe de gradiente animado** - Nova classe `.text-gradient-animated` com as cores da identidade Brighter
3. **Aplicar gradiente em todos os títulos** - Atualizar h1-h6 para usar o gradiente animado automaticamente
4. **Centralizar o header** - Ajustar a navegação para ficar centralizada na página

---

### Detalhes da Implementação

#### 1. Atualizar Google Fonts (index.html)

Expandir os pesos das fontes para incluir todos os necessários:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
```

#### 2. Nova Classe de Gradiente Animado (src/index.css)

Adicionar a animação `gradient-flow` com as cores da paleta Brighter:

| Cor | Hex | Descrição |
|-----|-----|-----------|
| Dourado | #e5a74c | Destaque principal |
| Branco | #ffffff | Transição suave |
| Azul Corporativo | #0c2238 | Contraste elegante |

```css
.text-gradient-animated {
  background: linear-gradient(
    90deg,
    #e5a74c 0%,
    #ffffff 25%,
    #e5a74c 50%,
    #0c2238 75%,
    #e5a74c 100%
  );
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-flow 6s ease infinite;
}

@keyframes gradient-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

#### 3. Aplicar Gradiente Automaticamente em Títulos

Atualizar o estilo base dos títulos:

```css
h1, h2, h3, h4, h5, h6 {
  @apply font-montserrat text-gradient-animated;
}
```

> **Nota:** Isso aplicará o gradiente em TODOS os títulos do sistema. Para títulos específicos que não devem ter gradiente (ex: dentro de cards), pode-se usar a classe `text-foreground` para sobrescrever.

#### 4. Centralizar o Header (src/pages/Index.tsx)

Alterar a estrutura do header para centralizar a navegação:

```text
ANTES:
┌──────────────────────────────────────────────────────────┐
│  [Logo Risk Pro]                     Recursos | Benefícios | Planos | [1º acesso] [Entrar]  │
└──────────────────────────────────────────────────────────┘

DEPOIS:
┌──────────────────────────────────────────────────────────┐
│  [Logo]      Recursos   Benefícios   Planos      [1º acesso] [Entrar]  │
│              ←────────── centralizado ──────────→                      │
└──────────────────────────────────────────────────────────┘
```

---

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `index.html` | Atualizar link do Google Fonts com pesos adicionais |
| `src/index.css` | Adicionar `.text-gradient-animated` e keyframes; aplicar em h1-h6 |
| `src/pages/Index.tsx` | Reestruturar header para centralizar navegação |

---

### Seção Técnica

#### CSS Completo (src/index.css)

```css
/* Adicionar na @layer utilities */
.text-gradient-animated {
  background: linear-gradient(
    90deg,
    #e5a74c 0%,
    #ffffff 25%,
    #e5a74c 50%,
    #0c2238 75%,
    #e5a74c 100%
  );
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-flow 6s ease infinite;
}

@keyframes gradient-flow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
```

#### Header Centralizado (src/pages/Index.tsx)

```tsx
<header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-center h-16 gap-8">
      {/* Logo à esquerda com posição absoluta ou flex-grow */}
      <Link to="/" className="flex items-center absolute left-4 md:relative md:left-0">
        <ThemeLogo className="h-8" />
        <span className="ml-3 font-montserrat font-bold text-xl">Risk Pro</span>
      </Link>
      
      {/* Navegação centralizada */}
      <nav className="hidden md:flex items-center gap-8">
        <a href="#recursos">Recursos</a>
        <a href="#beneficios">Benefícios</a>
        <a href="#planos">Planos</a>
      </nav>
      
      {/* Botões à direita */}
      <div className="flex items-center gap-3 absolute right-4 md:relative md:right-0">
        <Link to="/primeiro-acesso">
          <Button variant="outline">1º acesso</Button>
        </Link>
        <Link to="/auth">
          <Button variant="ghost">Entrar</Button>
        </Link>
      </div>
    </div>
  </div>
</header>
```

---

### Considerações

1. **Compatibilidade** - O gradiente animado funciona em todos os navegadores modernos
2. **Performance** - A animação CSS é leve e usa GPU
3. **Títulos em Cards** - Para títulos dentro de cards que não devem ter gradiente, adicionar classe `text-foreground` ou criar exceção
4. **Responsividade** - O header centralizado mantém o design em mobile com menu mobile

