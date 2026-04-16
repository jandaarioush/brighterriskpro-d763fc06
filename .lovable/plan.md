
## Causa raiz (confirmada)

`src/pages/StockSimulator.tsx` linha 64 tem um `useState` **fora de qualquer componente**, no escopo do módulo:

```ts
type WizardStep = 'select' | 'prices' | 'params' | 'results';

  const [simulatorModalidade, setSimulatorModalidade] = useState<Modalidade>('daytrade');  // ← BUG

export default function StockSimulator() {
  ...
```

Quando `App.tsx` importa `StockSimulator`, o módulo é avaliado e chama `useState` imediatamente. Como nenhum componente está renderizando, o dispatcher do React é `null` → erro `Cannot read properties of null (reading 'useState')`. É exatamente o erro do console.

Isso casa perfeitamente com o histórico:
- Step 0–2: rota `/` (Index) funcionou porque `StockSimulator` ainda não era importado
- Step 3 (rotas reais): tela branca volta porque o `import StockSimulator from "./pages/StockSimulator"` em `App.tsx` dispara a avaliação do módulo

Provavelmente entrou na refatoração XP de 15/abr — bate com a janela que identificamos antes.

## Correção

Mover a linha 64 para **dentro** do componente, junto dos outros `useState`. É uma mudança de uma linha.

**Antes (linhas 62–70):**
```ts
type WizardStep = 'select' | 'prices' | 'params' | 'results';

  const [simulatorModalidade, setSimulatorModalidade] = useState<Modalidade>('daytrade');

export default function StockSimulator() {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
```

**Depois:**
```ts
type WizardStep = 'select' | 'prices' | 'params' | 'results';

export default function StockSimulator() {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const { user } = useAuth();
  const [simulatorModalidade, setSimulatorModalidade] = useState<Modalidade>('daytrade');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
```

## Validação

1. publicar
2. abrir `riskpro.brighter.com.br` — deve carregar a landing normalmente, sem tela branca, sem erro no console
3. acessar `/dashboard` e clicar no Simulador de Ações para garantir que a página inteira ainda funciona com a state movida pra dentro

## Arquivos

- `src/App.tsx` (já restaurado, fica como está)
- `src/pages/StockSimulator.tsx` (mover linha 64 para dentro do componente)
- depois desta correção dá pra deletar `src/App.full.tsx.bak`

## Risco

Mínimo. É um bug de escopo trivial, fora do componente. A correção é semanticamente equivalente ao que o autor pretendia — nenhuma mudança de regra de negócio, banco, autenticação ou layout.
