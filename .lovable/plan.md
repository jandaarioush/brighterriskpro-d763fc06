

## Plano: Substituir Logo pelo Novo Design

### Objetivo

Trocar o logo atual pelo novo logo anexado (`Design_sem_nome_5-2.png`) que mostra o escudo dourado com gráfico de barras e texto "BRIGHTER RISK PRO".

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/assets/logo-brighter-light.png` | **SUBSTITUIR** - Copiar novo logo para tema claro |
| `src/assets/logo-brighter-dark.png` | **SUBSTITUIR** - Copiar novo logo para tema escuro |

---

### Ação

Copiar o novo logo para ambas as versões:

```text
user-uploads://Design_sem_nome_5-2.png 
  -> src/assets/logo-brighter-light.png (para tema claro)
  -> src/assets/logo-brighter-dark.png (para tema escuro)
```

---

### Resultado

O logo com o escudo dourado + gráfico + texto "BRIGHTER RISK PRO" será exibido:
- No header da página inicial
- Na barra de navegação (Navbar)
- Em todas as outras páginas que usam o componente `ThemeLogo`

O componente `ThemeLogo.tsx` já está configurado para alternar automaticamente entre os logos, então nenhuma mudança de código é necessária - apenas a substituição dos arquivos de imagem.

