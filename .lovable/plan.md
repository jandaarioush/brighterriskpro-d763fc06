

## Plano: Criar GoldenParticles.tsx

### Arquivo Novo

| Arquivo | Descrição |
|---------|-----------|
| `src/components/landing/GoldenParticles.tsx` | Canvas fullscreen com partículas douradas animadas |

### Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Index.tsx` | Adicionar `<GoldenParticles />` como `fixed inset-0` antes de todo o conteúdo |

### Detalhes do Componente

**GoldenParticles.tsx** — Canvas HTML5 com `requestAnimationFrame`:

- **Posicionamento**: `fixed inset-0 pointer-events-none z-0` cobrindo todo o site
- **3 camadas de partículas**:
  - Small (60%): raio 0.5–1.5px, opacidade 15–30%, sem glow
  - Medium (30%): raio 1.5–3px, opacidade 30–60%, blur 8px
  - Highlight (10%): raio 3–5px, opacidade 60–90%, blur 20px
- **Cores**: `#d99516`, `#f4b942`, `#ffd166`

**Comportamentos animados**:
- Orbital: cada partícula orbita em torno do ponto base com ângulo e raio individuais
- Drift: movimento linear lento com wrap-around nas bordas do canvas
- Fade pulsante: opacidade varia com `sin(time * fadeSpeed + offset)`
- Scroll boost: `window scroll delta` aumenta velocidade temporariamente, decai com `*= 0.95`
- Center beam (desktop only, `width > 768`): faixa vertical pulsante no centro com gradiente `transparent → gold → transparent`

**Performance**:
- ~150 partículas em desktop, ~80 em mobile
- Canvas resize via `ResizeObserver`
- Cleanup no unmount (cancelAnimationFrame + disconnect observer)

**Integração no Index.tsx**:
```tsx
<GoldenParticles />
<LandingHeader />
<LandingHero />
...
```
Conteúdo existente recebe `relative z-10` para ficar acima das partículas.

