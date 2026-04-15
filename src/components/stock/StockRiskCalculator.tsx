import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Plus, Trash2, TrendingDown, ExternalLink } from 'lucide-react';
import { xpAssets, findXPAsset, getXPTickers, getXPLeverage, getDesagio, type Modalidade } from '@/lib/xpAssets';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';

interface StockPosition {
  id: string;
  ticker: string;
  precoAtivo: number;
  stopPercentual: number;
  quantidade: number;
  perdaMaxima: number;
}

interface StockRiskCalculatorProps {
  capitalTotal: number;
  onCapitalChange: (capital: number) => void;
}

export function StockRiskCalculator({ capitalTotal, onCapitalChange }: StockRiskCalculatorProps) {
  const [stopFinanceiroMax, setStopFinanceiroMax] = useState<number>(500);
  const [positions, setPositions] = useState<StockPosition[]>([]);
  const [modalidade, setModalidade] = useState<Modalidade>('daytrade');

  const xpTickers = useMemo(() => getXPTickers(), []);

  const addPosition = () => {
    const newPosition: StockPosition = {
      id: crypto.randomUUID(),
      ticker: '',
      precoAtivo: 0,
      stopPercentual: 2,
      quantidade: 0,
      perdaMaxima: 0,
    };
    setPositions([...positions, newPosition]);
  };

  const removePosition = (id: string) => {
    setPositions(positions.filter((p) => p.id !== id));
  };

  const updatePosition = (id: string, updates: Partial<StockPosition>) => {
    setPositions(
      positions.map((p) => {
        if (p.id !== id) return p;

        const updated = { ...p, ...updates };

        if (updated.precoAtivo > 0 && updated.stopPercentual > 0) {
          const stopPorAcao = updated.precoAtivo * (updated.stopPercentual / 100);
          
          const otherPositionsLoss = positions
            .filter(pos => pos.id !== id)
            .reduce((sum, pos) => sum + pos.perdaMaxima, 0);
          
          const availableStop = Math.max(0, stopFinanceiroMax - otherPositionsLoss);
          
          updated.quantidade = Math.floor(availableStop / stopPorAcao);
          updated.perdaMaxima = updated.quantidade * stopPorAcao;
        }

        return updated;
      })
    );
  };

  const recalculateAllPositions = (newStopMax: number) => {
    if (positions.length === 0) return;

    const stopPerPosition = newStopMax / positions.length;

    setPositions(
      positions.map((p) => {
        if (p.precoAtivo <= 0 || p.stopPercentual <= 0) return p;

        const stopPorAcao = p.precoAtivo * (p.stopPercentual / 100);
        const quantidade = Math.floor(stopPerPosition / stopPorAcao);
        const perdaMaxima = quantidade * stopPorAcao;

        return { ...p, quantidade, perdaMaxima };
      })
    );
  };

  const totalPerdaPossivel = positions.reduce((sum, p) => sum + p.perdaMaxima, 0);
  const percentualUsado = stopFinanceiroMax > 0 ? (totalPerdaPossivel / stopFinanceiroMax) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Calculadora de Posição
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Alavancagem B3 — {modalidade === 'daytrade' ? 'Day Trade' : 'Swing Trade'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Modalidade */}
        <div className="space-y-2">
          <Label>Modalidade</Label>
          <Select value={modalidade} onValueChange={(v) => setModalidade(v as Modalidade)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daytrade">Day Trade</SelectItem>
              <SelectItem value="swing">Swing Trade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Capital Total */}
        <div className="space-y-2">
          <Label htmlFor="capital">Capital Total</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
              R$
            </span>
            <Input
              id="capital"
              type="number"
              value={capitalTotal}
              onChange={(e) => onCapitalChange(parseFloat(e.target.value) || 0)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Stop Financeiro Máximo */}
        <div className="space-y-2">
          <Label htmlFor="stopMax">Stop Financeiro Máximo</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
              R$
            </span>
            <Input
              id="stopMax"
              type="number"
              value={stopFinanceiroMax}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setStopFinanceiroMax(value);
                recalculateAllPositions(value);
              }}
              className="pl-9"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Valor máximo que você aceita perder nesta operação
          </p>
        </div>

        {/* Positions List */}
        <div className="space-y-3">
          {positions.map((position, index) => (
            <PositionCard
              key={position.id}
              position={position}
              index={index}
              modalidade={modalidade}
              xpTickers={xpTickers}
              onUpdate={(updates) => updatePosition(position.id, updates)}
              onRemove={() => removePosition(position.id)}
            />
          ))}
        </div>

        {/* Add Position Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={addPosition}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Ativo
        </Button>

        {/* Summary */}
        {positions.length > 0 && (
          <Card className="p-4 bg-muted/50 border-primary/30">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingDown className="w-4 h-4 text-destructive" />
                Resumo do Risco
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Perda Total Possível</span>
                  <span className="font-medium">
                    R$ {totalPerdaPossivel.toFixed(2)} / R$ {stopFinanceiroMax.toFixed(2)}
                  </span>
                </div>
                
                <Progress 
                  value={Math.min(percentualUsado, 100)} 
                  className="h-2"
                />
                
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {percentualUsado.toFixed(1)}% do stop usado
                  </span>
                  <span className={percentualUsado > 100 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                    {percentualUsado > 100 ? 'Excede o limite!' : `R$ ${(stopFinanceiroMax - totalPerdaPossivel).toFixed(2)} restante`}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {positions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Clique em "Adicionar Ativo" para calcular o tamanho da posição
          </p>
        )}

        {/* Disclaimer */}
        <div className="pt-4 border-t border-border/50 space-y-1">
          <p className="text-[10px] text-muted-foreground italic">
            *Os valores podem ser alterados sem aviso prévio
          </p>
          <p className="text-[10px] text-muted-foreground italic">
            *As informações são de atualização da B3, podendo haver mudanças ao longo do pregão
          </p>
          <p className="text-[10px] text-muted-foreground italic">
            *Caso não tenha o ativo procurado, consultar em{' '}
            <a
              href="https://simulador.b3.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-0.5"
            >
              simulador.b3.com.br
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface PositionCardProps {
  position: StockPosition;
  index: number;
  modalidade: Modalidade;
  xpTickers: string[];
  onUpdate: (updates: Partial<StockPosition>) => void;
  onRemove: () => void;
}

function PositionCard({ position, index, modalidade, xpTickers, onUpdate, onRemove }: PositionCardProps) {
  const [tickerOpen, setTickerOpen] = useState(false);
  const [tickerSearch, setTickerSearch] = useState('');

  const xpAsset = findXPAsset(position.ticker);
  const leverage = xpAsset ? getXPLeverage(position.ticker, modalidade) : null;
  const desagio = leverage ? getDesagio(leverage) : null;
  const margemPorAcao = leverage && position.precoAtivo > 0 ? position.precoAtivo / leverage : null;

  const handleTickerSelect = (ticker: string) => {
    onUpdate({ ticker });
    setTickerOpen(false);
    setTickerSearch('');
  };

  const filteredTickers = xpTickers.filter(t => 
    t.toLowerCase().includes(tickerSearch.toLowerCase())
  );

  return (
    <Card className="p-4 border-border/50">
      <div className="space-y-3">
        {/* Header with index and remove */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Ativo {index + 1}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Ticker Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Ticker</Label>
            <Popover open={tickerOpen} onOpenChange={setTickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start font-normal"
                >
                  {position.ticker || 'Selecionar...'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Buscar ativo..." 
                    value={tickerSearch}
                    onValueChange={setTickerSearch}
                  />
                  <CommandList>
                    <CommandEmpty>Nenhum ativo encontrado</CommandEmpty>
                    <CommandGroup>
                      {filteredTickers.slice(0, 20).map((ticker) => (
                        <CommandItem
                          key={ticker}
                          value={ticker}
                          onSelect={() => handleTickerSelect(ticker)}
                        >
                          {ticker}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Preço (R$)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="35.00"
              value={position.precoAtivo || ''}
              onChange={(e) => onUpdate({ precoAtivo: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Asset Info */}
        {xpAsset && leverage && (
          <div className="flex flex-wrap items-center gap-2 text-xs bg-primary/10 rounded px-2 py-1.5">
            <span className="text-muted-foreground">Alavancagem B3:</span>
            <span className="font-medium text-primary">{leverage}x</span>
            {desagio !== null && (
              <>
                <span className="text-muted-foreground">| Deságio:</span>
                <span className="font-medium">{desagio.toFixed(2)}%</span>
              </>
            )}
            {margemPorAcao !== null && (
              <>
                <span className="text-muted-foreground">| Margem:</span>
                <span className="font-medium">R$ {margemPorAcao.toFixed(2)}/ação</span>
              </>
            )}
          </div>
        )}

        {/* Stop Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Stop %</Label>
            <span className="text-sm font-medium">{position.stopPercentual.toFixed(1)}%</span>
          </div>
          <Slider
            value={[position.stopPercentual]}
            onValueChange={([value]) => onUpdate({ stopPercentual: value })}
            min={0.1}
            max={10}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.1%</span>
            <span>10%</span>
          </div>
        </div>

        {/* Results */}
        {position.quantidade > 0 && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
            <div className="text-center p-2 bg-muted/50 rounded">
              <p className="text-xs text-muted-foreground">Quantidade</p>
              <p className="text-lg font-bold text-primary">{position.quantidade}</p>
              <p className="text-xs text-muted-foreground">ações</p>
            </div>
            <div className="text-center p-2 bg-destructive/10 rounded">
              <p className="text-xs text-muted-foreground">Perda Máx</p>
              <p className="text-lg font-bold text-destructive">R$ {position.perdaMaxima.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">se bater stop</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
