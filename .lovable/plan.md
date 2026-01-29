

## Plano: Mostrar Todos os Ativos BTG + Adicao Manual

### Problema Atual

O simulador tem as seguintes limitacoes:
- Lista BTG possui **142 ativos**, mas apenas **24 sao exibidos** inicialmente
- Limite de 24 tambem na busca: `.slice(0, 24)` nas linhas 98-101
- Nao ha feedback quando um ativo nao e encontrado na lista
- Nao e possivel adicionar manualmente ativos que nao estao na lista BTG

---

### Solucao Proposta

#### 1. Exibir Todos os Ativos da Lista BTG

Remover ou aumentar significativamente o limite de ativos exibidos:

```text
// ANTES (limitado a 24)
return tickerList.slice(0, 24);
...
.slice(0, 24);

// DEPOIS (todos os 142 ativos)
return tickerList;  // Sem limite - mostra todos
```

A ScrollArea ja existe com altura fixa de 200px, entao os ativos terao scroll adequado.

#### 2. Feedback de "Nao Encontrado" + Botao de Adicao Manual

Quando a busca nao retornar resultados da lista BTG:

```text
+-------------------------------------------------------+
|  Pesquisar acoes (ex: PETR4, VALE3)...                |
|  [ XPTO3                                          ]   |
+-------------------------------------------------------+
|                                                       |
|  ⚠️ O ativo "XPTO3" nao esta na lista BTG.            |
|                                                       |
|  [+ Adicionar "XPTO3" Manualmente]                    |
|                                                       |
|  Nota: Ativos manuais usarao alavancagem 1x e         |
|  margem igual ao preco da acao.                       |
+-------------------------------------------------------+
```

#### 3. Interface para Ativo Manual

Quando o usuario adiciona manualmente, o ativo e inserido com valores padrao:

```typescript
// Ativo manual (nao esta na lista BTG)
{
  ticker: 'XPTO3',
  preco: 0, // Sera preenchido na Etapa 2
  isManual: true // Flag para identificar
}
```

Na etapa de precos e calculos, ativos manuais usam:
- **Alavancagem:** 1x (sem alavancagem)
- **Margem por acao:** igual ao preco de entrada

---

### Mudancas no Codigo

#### 1. Estado para Ativos Manuais

```typescript
interface SelectedAsset {
  ticker: string;
  preco: number;
  isManual?: boolean; // Novo campo
}
```

#### 2. Logica de Filtragem Atualizada

```typescript
// Mostrar todos os ativos da lista
const filteredTickers = useMemo(() => {
  if (!searchQuery.trim()) return tickerList; // Todos
  return tickerList.filter(ticker => 
    ticker.toLowerCase().includes(searchQuery.toLowerCase())
  ); // Todos os filtrados, sem limite
}, [searchQuery, tickerList]);

// Verificar se busca nao encontrou nada
const searchNotFound = useMemo(() => {
  if (!searchQuery.trim()) return false;
  const normalizedQuery = searchQuery.trim().toUpperCase();
  return !tickerList.some(t => t.toUpperCase().includes(normalizedQuery));
}, [searchQuery, tickerList]);
```

#### 3. UI de "Nao Encontrado"

```tsx
{/* Quando busca nao encontra na lista BTG */}
{searchNotFound && searchQuery.trim() && (
  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
    <div className="flex items-center gap-2 text-amber-500 mb-2">
      <AlertTriangle className="h-4 w-4" />
      <span className="font-medium">
        O ativo "{searchQuery.toUpperCase()}" nao esta na lista BTG
      </span>
    </div>
    <Button 
      variant="outline" 
      size="sm"
      className="mt-2"
      onClick={() => addManualAsset(searchQuery.toUpperCase())}
    >
      <Plus className="h-4 w-4 mr-1" />
      Adicionar "{searchQuery.toUpperCase()}" Manualmente
    </Button>
    <p className="text-xs text-muted-foreground mt-2">
      Ativos manuais usarao alavancagem 1x e margem igual ao preco.
    </p>
  </div>
)}
```

#### 4. Funcao de Adicao Manual

```typescript
const addManualAsset = (ticker: string) => {
  const normalizedTicker = ticker.toUpperCase().trim();
  if (!isSelected(normalizedTicker) && normalizedTicker.length > 0) {
    setSelectedAssets(prev => [...prev, { 
      ticker: normalizedTicker, 
      preco: 0, 
      isManual: true 
    }]);
    setSearchQuery(''); // Limpar busca
  }
};
```

#### 5. Identificacao Visual de Ativos Manuais

Na lista de selecionados, ativos manuais terao badge diferente:

```tsx
{selectedAssets.map((asset) => (
  <Badge 
    key={asset.ticker} 
    variant={asset.isManual ? "outline" : "default"}
    className="flex items-center gap-1 px-3 py-1.5 text-sm"
  >
    {asset.ticker}
    {asset.isManual && (
      <span className="text-xs text-amber-500 ml-1">(manual)</span>
    )}
    <button ...>
      <X className="h-3 w-3" />
    </button>
  </Badge>
))}
```

#### 6. Tratamento na Etapa de Precos

Mostrar aviso para ativos manuais:

```tsx
{selectedAssets.map((asset) => {
  const btgInfo = getBTGAsset(asset.ticker);
  return (
    <div key={asset.ticker} className="p-4 rounded-lg border">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-lg">{asset.ticker}</span>
        {btgInfo ? (
          <span className="text-xs text-muted-foreground">
            {btgInfo.leverage}x | R$ {btgInfo.marginPerShare.toFixed(2)}/acao
          </span>
        ) : (
          <span className="text-xs text-amber-500">
            Manual - 1x | Margem = Preco
          </span>
        )}
      </div>
      {/* Input de preco */}
    </div>
  );
})}
```

---

### Arquivo a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/StockSimulator.tsx` | Exibir todos os ativos, adicionar busca manual, feedback visual |

---

### Secao Tecnica

#### Interface Atualizada

```typescript
interface SelectedAsset {
  ticker: string;
  preco: number;
  isManual?: boolean;
}
```

#### Novas Funcoes

```typescript
// Verificar se busca nao encontrou na lista
const searchNotFound = useMemo(() => {
  if (!searchQuery.trim()) return false;
  const normalizedQuery = searchQuery.trim().toUpperCase();
  // Verifica se nao existe exatamente e se nao ha match parcial
  return filteredTickers.length === 0;
}, [searchQuery, filteredTickers]);

// Adicionar ativo manual
const addManualAsset = (ticker: string) => {
  const normalized = ticker.toUpperCase().trim();
  // Validar formato basico (letras + numeros, 4-6 caracteres)
  if (normalized.length >= 4 && normalized.length <= 6 && !isSelected(normalized)) {
    setSelectedAssets(prev => [...prev, { ticker: normalized, preco: 0, isManual: true }]);
    setSearchQuery('');
    toast.info(`"${normalized}" adicionado como ativo manual (1x alavancagem)`);
  }
};
```

#### Logica de Margem para Manuais

```typescript
const getMargemPorAcao = (ticker: string, preco: number, isManual?: boolean): number => {
  // Ativos manuais: margem = preco (sem alavancagem)
  if (isManual) {
    return preco;
  }
  if (modalidade === 'swing') {
    return preco / 5;
  }
  const btgAsset = getBTGAsset(ticker);
  if (btgAsset) {
    return btgAsset.marginPerShare;
  }
  return preco; // Fallback
};

const getAlavancagem = (ticker: string, isManual?: boolean): number => {
  if (isManual) return 1;
  if (modalidade === 'swing') return 5;
  return getBTGAsset(ticker)?.leverage || 1;
};
```

---

### Resultado Final

1. **Todos os 142 ativos BTG** visiveis na grid (com scroll)
2. **Busca sem limite** - mostra todos os matches
3. **Feedback claro** quando ativo nao esta na lista
4. **Botao para adicionar manualmente** qualquer ticker
5. **Ativos manuais identificados** visualmente com badge "(manual)"
6. **Alavancagem 1x** para ativos manuais (conservador)
7. **Margem = Preco** para ativos manuais

