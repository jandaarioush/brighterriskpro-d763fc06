

## Plano: Simulador com Barra de Pesquisa e Fluxo em Etapas

### Objetivo

Transformar o simulador atual em um fluxo guiado em 3 etapas:
1. Pesquisar e selecionar as acoes
2. Configurar os precos de cada acao
3. Definir parametros globais (stop, objetivo, modalidade, valor alocado)

---

### Fluxo Proposto

```
+----------------------------------------------------------+
|  ETAPA 1: Selecionar Ativos                               |
+----------------------------------------------------------+
|  [ Pesquisar acoes... ]                                   |
|                                                          |
|  +-------+ +-------+ +-------+ +-------+                  |
|  | PETR4 | | VALE3 | | ITUB4 | | BBAS3 |  (chips)         |
|  +-------+ +-------+ +-------+ +-------+                  |
|                                                          |
|  Clique para adicionar. Ativos selecionados aparecem     |
|  como badges que podem ser removidos.                    |
|                                                          |
|  Selecionados: [PETR4 x] [VALE3 x] [ITUB4 x]              |
|                                                          |
|            [ Proximo >> ]                                 |
+----------------------------------------------------------+

+----------------------------------------------------------+
|  ETAPA 2: Configurar Precos                               |
+----------------------------------------------------------+
|  PETR4                                                   |
|  [ R$ 35.50 ]  Alavancagem: 98x | Margem: R$ 0.37/acao   |
|                                                          |
|  VALE3                                                   |
|  [ R$ 52.80 ]  Alavancagem: 98x | Margem: R$ 0.87/acao   |
|                                                          |
|  ITUB4                                                   |
|  [ R$ 28.90 ]  Alavancagem: 99x | Margem: R$ 0.46/acao   |
|                                                          |
|    [ << Voltar ]            [ Proximo >> ]               |
+----------------------------------------------------------+

+----------------------------------------------------------+
|  ETAPA 3: Parametros da Operacao                          |
+----------------------------------------------------------+
|  Modalidade:    [Day Trade (BTG) v]                      |
|  Valor Alocado: [ R$ 1.000 ]                             |
|  Stop Maximo:   [ R$ 500 ]                               |
|                                                          |
|  Stop Loss (%): [====O=====] 2.0%                        |
|  Objetivo (%):  [======O===] 4.0%                        |
|                                                          |
|    [ << Voltar ]        [ Calcular Posicoes ]            |
+----------------------------------------------------------+
```

---

### Mudancas no StockSimulator.tsx

#### Nova Estrutura de Estado

```typescript
// Estados do Wizard
type WizardStep = 'select' | 'prices' | 'params';
const [currentStep, setCurrentStep] = useState<WizardStep>('select');

// Ativos selecionados (antes de ter precos)
interface SelectedAsset {
  ticker: string;
  preco: number;
}
const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([]);

// Campo de busca
const [searchQuery, setSearchQuery] = useState('');
```

#### Etapa 1: Selecao de Ativos

Componente com:
- Input de pesquisa com filtragem em tempo real
- Lista de resultados clicaveis (Command/Autocomplete)
- Badges dos ativos selecionados com botao X para remover
- Botao "Proximo" habilitado quando >= 1 ativo selecionado

```tsx
// Exemplo de UI
<div className="space-y-4">
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Pesquisar acoes (ex: PETR4, VALE3)..."
      className="pl-10"
    />
  </div>
  
  {/* Resultados da busca */}
  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-auto">
    {filteredTickers.map((ticker) => (
      <Button
        key={ticker}
        variant="outline"
        size="sm"
        onClick={() => addAsset(ticker)}
        disabled={isSelected(ticker)}
      >
        {ticker}
      </Button>
    ))}
  </div>
  
  {/* Ativos selecionados */}
  <div className="flex flex-wrap gap-2">
    {selectedAssets.map((asset) => (
      <Badge key={asset.ticker} className="flex items-center gap-1">
        {asset.ticker}
        <X className="h-3 w-3 cursor-pointer" onClick={() => removeAsset(asset.ticker)} />
      </Badge>
    ))}
  </div>
</div>
```

#### Etapa 2: Configuracao de Precos

```tsx
<div className="space-y-4">
  {selectedAssets.map((asset, index) => {
    const btgInfo = getBTGAsset(asset.ticker);
    return (
      <div key={asset.ticker} className="p-4 rounded-lg border">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-lg">{asset.ticker}</span>
          {btgInfo && (
            <span className="text-xs text-muted-foreground">
              {btgInfo.leverage}x | R$ {btgInfo.marginPerShare.toFixed(2)}/acao
            </span>
          )}
        </div>
        <div>
          <Label>Preco de Entrada (R$)</Label>
          <Input
            type="number"
            value={asset.preco || ''}
            onChange={(e) => updateAssetPrice(index, parseFloat(e.target.value) || 0)}
            placeholder="Ex: 35.50"
          />
        </div>
      </div>
    );
  })}
</div>
```

#### Etapa 3: Parametros Globais

Reutiliza os campos existentes:
- Modalidade (Day Trade / Swing)
- Valor Alocado
- Stop Financeiro Maximo
- Stop Loss %
- Objetivo / Gain %

Botao "Calcular Posicoes" executa toda a logica de calculo e mostra os resultados.

---

### Navegacao entre Etapas

```tsx
const canProceed = {
  select: selectedAssets.length > 0,
  prices: selectedAssets.every(a => a.preco > 0),
  params: true,
};

const handleNext = () => {
  if (currentStep === 'select') setCurrentStep('prices');
  else if (currentStep === 'prices') setCurrentStep('params');
  else if (currentStep === 'params') calculatePositions();
};

const handleBack = () => {
  if (currentStep === 'prices') setCurrentStep('select');
  else if (currentStep === 'params') setCurrentStep('prices');
};
```

---

### Indicador de Progresso

```tsx
<div className="flex items-center justify-center gap-4 mb-8">
  <StepIndicator step={1} current={currentStep === 'select'} label="Selecionar" />
  <div className="h-px w-8 bg-border" />
  <StepIndicator step={2} current={currentStep === 'prices'} label="Precos" />
  <div className="h-px w-8 bg-border" />
  <StepIndicator step={3} current={currentStep === 'params'} label="Parametros" />
</div>
```

---

### Arquivos Modificados

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/StockSimulator.tsx` | Implementar wizard de 3 etapas com barra de pesquisa |

---

### Secao Tecnica

#### Componentes Utilizados
- `Input` com icone de pesquisa (Search)
- `Badge` para ativos selecionados
- `Button` para itens da lista de pesquisa
- `Command/CommandInput` para autocomplete (alternativa)
- `Slider` para stop e objetivo
- `Select` para modalidade

#### Logica de Filtragem

```typescript
const filteredTickers = useMemo(() => {
  if (!searchQuery) return tickerList.slice(0, 20);
  return tickerList.filter(ticker => 
    ticker.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 20);
}, [searchQuery, tickerList]);
```

#### Funcao de Calculo Final

Quando o usuario clica "Calcular Posicoes", a logica existente de `handleAddPosition` sera adaptada para processar todos os ativos de uma vez, distribuindo o stop proporcionalmente entre eles.

---

### Resultado Final

Um fluxo intuitivo em 3 passos:
1. Pesquisar e selecionar multiplas acoes facilmente
2. Preencher os precos de entrada de cada uma
3. Configurar parametros globais e calcular

Os cards de "Analise de Risco" e "Parametros Atuais" continuam aparecendo apos o calculo, com os sliders de redistribuicao funcionando normalmente.

