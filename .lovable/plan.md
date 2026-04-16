

## Resposta: quando o site parou de funcionar

Analisando o histórico de commits, identifiquei a janela exata da quebra.

### Linha do tempo

```text
31/Mar  7d951c1  Premium KPI typography                  ← último commit "estável" conhecido
        ...
15/Abr  2116888..04922fb  Substituição BTG → XP assets   ← grandes mudanças funcionais
        (8 arquivos, +488/-365 linhas, novo lib/xpAssets.ts)

16/Abr  286a4af  Save plan in Lovable                    ← já investigando o erro
16/Abr  c198437  Save plan in Lovable
16/Abr  664a28f  Changes
16/Abr  f6216aa  Added React dedupe in Vite              ← tentativa de fix #1
16/Abr  a9e3c70  Removed helmet-async from build         ← tentativa de fix #2
16/Abr  78e592e  Removed bun lock files                  ← tentativa de fix #3
```

### Conclusão

O site **parou de funcionar no build publicado entre 31/Mar e 16/Abr**, e o ponto de virada mais provável é o conjunto de commits do **dia 15/Abr (`2116888` → `04922fb`)** — a refatoração que substituiu BTG por XP. Esse foi o último bloco de mudanças funcionais antes do dia 16/Abr, quando você abriu o erro pela primeira vez e começamos a tentar corrigir.

Importante notar: **o erro `Cannot read properties of null (reading 'useState')` é um sintoma de build, não necessariamente causado por aqueles arquivos**. O que provavelmente aconteceu:

1. Até 31/Mar o site funcionava publicado.
2. Entre 31/Mar e 15/Abr **nenhum publish foi feito** (o publish é manual).
3. No dia 16/Abr você clicou em Publish pela primeira vez depois de semanas, e o build novo veio quebrado.
4. Como o build não é refeito a cada commit, o "ponto de quebra real" pode ser qualquer coisa nesse intervalo — não dá para saber só pelo git, porque o último build saudável foi gerado com código de **antes de 31/Mar**.

### O que isso muda no diagnóstico

A causa não é uma "regressão pontual" identificável por commit. É uma incompatibilidade do **grafo de dependências atual** com o build de produção, que só apareceu agora porque o build não rodava há semanas. Por isso `dedupe`, remoção de `react-helmet-async` e limpeza de lockfiles fazem sentido — todos são fontes plausíveis num app que ficou muito tempo sem ser republicado.

### Próximo passo recomendado

Para confirmar e desbloquear, eu sugiro o **bisect de providers no `App.tsx`** que já estava aprovado: simplificar para um `<App>` mínimo, publicar, e ir reintroduzindo provider por provider até identificar o que quebra no bundle de produção. É o caminho mais rápido para sair do loop, já que o git por si só não consegue apontar o commit culpado.

