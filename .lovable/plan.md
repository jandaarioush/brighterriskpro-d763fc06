

## Plano: Atualizar Termos de Uso e Política de Privacidade

### Objetivo

Substituir o conteúdo placeholder das páginas existentes pelo conteúdo oficial dos documentos PDFs fornecidos pela Brighter Inc.

---

### 1. Atualização: `src/pages/TermosDeUso.tsx`

**Conteúdo do PDF: TERMOS DE USO - BRIGHTER INC**

| Seção | Título |
|-------|--------|
| Introdução | Bem-vindo à Brighter Inc |
| 1 | Sobre a Brighter Inc |
| 2 | Objeto dos Serviços |
| 3 | Perfil do Usuário |
| 4 | Não Existe Promessa de Resultado |
| 5 | Responsabilidade do Usuário |
| 6 | Propriedade Intelectual |
| 7 | Uso Indevido e Penalidades |
| 8 | Pagamentos, Acessos e Cancelamentos |
| 9 | Alterações dos Termos |
| 10 | Foro |

**Data de atualização:** 28/01/2026

---

### 2. Atualização: `src/pages/PoliticaPrivacidade.tsx`

**Conteúdo do PDF: POLÍTICA DE PRIVACIDADE - BRIGHTER INC & BRIGHTER SPHERE**

| Seção | Título |
|-------|--------|
| 1 | Quem Somos |
| 2 | Quais Dados Coletamos |
| 3 | Como Coletamos os Dados |
| 4 | Finalidade do Uso dos Dados |
| 5 | Base Legal para o Tratamento |
| 6 | Compartilhamento de Dados |
| 7 | Armazenamento e Segurança |
| 8 | Direitos do Titular |
| 9 | Cookies |
| 10 | Alterações nesta Política |
| 11 | Contato |

**Data de atualização:** 29/01/2026

---

### Alterações nos Arquivos

| Arquivo | Ação |
|---------|------|
| `src/pages/TermosDeUso.tsx` | Substituir conteúdo completo com 10 seções do PDF oficial |
| `src/pages/PoliticaPrivacidade.tsx` | Substituir conteúdo completo com 11 seções do PDF oficial |

---

### Estrutura Visual Mantida

- Layout atual do Card com gradiente no hero
- Tipografia com `font-montserrat` para títulos
- Classes `text-muted-foreground` para parágrafos
- Listas com `list-disc` e espaçamento adequado
- Estrutura responsiva existente

---

### Destaques do Novo Conteúdo

**Termos de Uso:**
- Esclarece que a Brighter é empresa de educação financeira
- Define claramente que não há promessa de resultados
- Detalha propriedade intelectual e proibições
- Foro: São Paulo

**Política de Privacidade:**
- Referência direta à LGPD (Lei 13.709/2018)
- Lista detalhada de dados coletados
- Bases legais para tratamento
- Direitos do titular bem definidos

