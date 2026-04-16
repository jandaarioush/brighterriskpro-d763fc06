
Step 2 OK. Agora step 3: adicionar `AuthProvider` + `HelmetProvider` + as rotas reais do app (todas as páginas), restaurando o `App.tsx` ao estado funcional completo. Se quebrar, o culpado está no `AuthProvider` ou em alguma página importada lazily/diretamente no topo.

## Plano

Restaurar `src/App.tsx` a partir do backup `src/App.full.tsx.bak` (que tem o app completo pré-quebra).

## Validação

1. publicar
2. abrir o domínio
3. se carregar normalmente → problema era ordem/composição de providers (já resolvido pela limpeza)
4. se voltar tela branca → o culpado está no `AuthProvider` ou numa das páginas importadas
