## Objetivo

Adicionar em `/trades` um botão **"Importar do Profit"** que abre um diálogo para upload de arquivo PDF/Excel da Nelogica, mostra preview das linhas detectadas e confirma a inserção em massa na tabela `trades`.

Esta é a primeira fatia do plano maior já aprovado — foca apenas em **upload + parsing + preview + confirmação**. A análise de performance (`PerformanceAnalysis`) fica para a próxima iteração.

---

## Fluxo

1. Em `/trades`, ao lado do botão "Importar" (CSV) atual, adicionar **"Importar do Profit"** (ícone `FileSpreadsheet`).
2. Modal abre com drop-zone aceitando `.pdf`, `.xlsx`, `.xls` (máx 10 MB).
3. Ao selecionar arquivo → envia base64 para edge function `parse-profit-report`.
4. Estado **"Analisando arquivo..."** com spinner.
5. Resposta exibe:
   - **Cards de totais**: nº de trades detectados, resultado total R$, período (data inicial → final), nº de linhas ignoradas.
   - **Tabela de preview** (scroll, máx altura 400px): Data | Ativo | Resultado (R$) | Pontos | Contratos.
   - **Lista de avisos** (collapse): linhas ignoradas com motivo (ex.: "Ativo BOVA11 não suportado", "Linha sem data válida").
6. Botões: **Cancelar** | **Confirmar e importar N trades**.
7. Confirmar → `INSERT` em massa em `trades` (mesmo path do CSV existente em `Trades.tsx`), toast de sucesso, fecha modal e recarrega lista.

---

## Backend

### Edge function `parse-profit-report`

- Path: `supabase/functions/parse-profit-report/index.ts`
- Auth: validação de JWT em código (default Lovable).
- Input: `{ filename: string, contentBase64: string }`.
- Validação Zod: filename string, contentBase64 ≤ ~14MB base64.
- Detecta tipo por extensão e/ou magic bytes.
- **Excel** (`xlsx` via esm.sh):
  - Lê primeira sheet com dados, normaliza headers (lowercase, sem acento).
  - Localiza colunas: `data`, `ativo`/`papel`, `resultado`/`resultado liquido`/`liquido`, `pontos` (opcional), `qtde`/`quantidade` (opcional), `c/v`/`lado` (opcional).
  - Parseia datas (Excel serial ou string `dd/MM/yyyy`).
  - Parseia valores BR (`1.234,56` → `1234.56`).
- **PDF** (`unpdf` via esm.sh):
  - `extractText` por página, junta linhas.
  - Heurística: linhas que começam com `dd/MM/yyyy`, separa por whitespace, identifica ativo (`WIN*`/`WDO*`/outros) e valor numérico final como resultado em R$.
- Mapeia ativo:
  - `WIN*` → `indice`
  - `WDO*` → `dolar`
  - Outros → ignorado, vai para `skipped` com motivo.
- Agrega por `(trade_date, asset_type)` somando `result_reais`, `result_points`, `contracts`.
- Output:
  ```ts
  {
    trades: Array<{
      trade_date: string;        // YYYY-MM-DD
      asset_type: 'indice' | 'dolar';
      result_reais: number;
      result_points: number;
      contracts: number;
    }>,
    skipped: Array<{ raw: string; reason: string }>,
    totals: { count: number; sumReais: number; firstDate: string; lastDate: string; }
  }
  ```
- CORS headers em todas as respostas.
- Sem persistência — quem grava é o frontend após confirmação.

### Sem migração SQL

Reutiliza tabela `trades` existente (mesmas colunas usadas no CSV import).

---

## Frontend

### Novo componente `src/components/ProfitImportDialog.tsx`

- `Dialog` controlado por prop `open` / `onOpenChange`.
- Estados: `idle` → `parsing` → `preview` → `importing` → `done`.
- Drop-zone: input `type="file"` estilizado + drag-and-drop nativo, validação de tamanho/extensão.
- Conversão para base64 via `FileReader.readAsDataURL`.
- Chama `supabase.functions.invoke('parse-profit-report', { body: { filename, contentBase64 } })`.
- Renderiza preview com `Table`, `Card`, `Badge` (shadcn) seguindo design system (mono `JetBrains Mono` para números em pt-BR via `formatBRL` de `src/lib/formatting.ts`).
- Confirmação: `supabase.from('trades').insert(...)` em batch, com `user_id` do `useAuth`.
- Toasts via `sonner` para sucesso/erro.

### Edição em `src/pages/Trades.tsx`

- Importar `ProfitImportDialog` e ícone `FileSpreadsheet`.
- Adicionar estado `profitOpen` e botão ao lado do "Importar" CSV.
- Após import, chamar o mesmo `fetchTrades` (ou equivalente) já existente.

---

## Datas e formatação

- Datas armazenadas como string `YYYY-MM-DD` (regra do projeto, evita shift de timezone BRT).
- Parsing de `dd/MM/yyyy` → split + reverse + join.
- Valores R$ exibidos com `JetBrains Mono` em `5.000,00`.

---

## Validação e segurança

- Zod no edge function (filename, base64, limite de tamanho).
- Frontend valida extensão e tamanho antes de enviar.
- `user_id` setado server-side no client autenticado (via RLS já existente em `trades`).
- Nenhum dado sensível logado.

---

## Fora do escopo desta fatia

- Componente `PerformanceAnalysis` e regras determinísticas → próxima entrega.
- Aba "Análise" em `/dashboard` → próxima entrega.
- Stocks/International dashboards → futuro.
- OCR de PDFs escaneados (Profit exporta texto nativo).

---

## Memória a salvar após implementação

- `mem://features/profit-report-import` — formato esperado, mapeamento de ativos, agregação por dia/ativo, edge function envolvida.
