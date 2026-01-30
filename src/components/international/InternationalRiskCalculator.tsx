import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, DollarSign, TrendingDown, Layers, TrendingUp } from 'lucide-react';
import {
  NINJATRADER_ASSETS,
  NINJATRADER_ASSET_GROUPS,
  getAssetsByGroup,
  DEFAULT_EXCHANGE_RATE,
  calculateEffectiveLeverage,
  type NinjaTraderAsset,
} from '@/lib/ninjatraderAssets';
import { calculatePositionSizing, formatUSD, formatBRL } from '@/lib/internationalRiskCalculations';

interface InternationalRiskCalculatorProps {
  className?: string;
}

export function InternationalRiskCalculator({ className }: InternationalRiskCalculatorProps) {
  const [capitalUSD, setCapitalUSD] = useState('1000');
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE.toString());
  const [selectedSymbol, setSelectedSymbol] = useState('MES');
  const [stopLossTicks, setStopLossTicks] = useState('8');
  const [maxRiskPercent, setMaxRiskPercent] = useState('2');
  const [estimatedPrice, setEstimatedPrice] = useState('5900');

  const selectedAsset = useMemo(() => {
    return NINJATRADER_ASSETS.find((a) => a.symbol === selectedSymbol);
  }, [selectedSymbol]);

  const positionSizing = useMemo(() => {
    if (!selectedAsset) return null;

    const capital = parseFloat(capitalUSD) || 0;
    const stopTicks = parseFloat(stopLossTicks) || 0;
    const riskPercent = parseFloat(maxRiskPercent) || 0;
    const exchRate = parseFloat(exchangeRate) || DEFAULT_EXCHANGE_RATE;

    return calculatePositionSizing(capital, selectedAsset, stopTicks, riskPercent, exchRate);
  }, [capitalUSD, selectedAsset, stopLossTicks, maxRiskPercent, exchangeRate]);

  const capitalBRL = useMemo(() => {
    const capital = parseFloat(capitalUSD) || 0;
    const exchRate = parseFloat(exchangeRate) || DEFAULT_EXCHANGE_RATE;
    return capital * exchRate;
  }, [capitalUSD, exchangeRate]);

  const effectiveLeverage = useMemo(() => {
    if (!selectedAsset) return 0;
    const price = parseFloat(estimatedPrice) || 0;
    return calculateEffectiveLeverage(selectedAsset, price);
  }, [selectedAsset, estimatedPrice]);

  // Update estimated price when asset changes
  const handleAssetChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    // Set reasonable default prices based on asset
    const defaultPrices: Record<string, string> = {
      MES: '5900',
      MNQ: '21000',
      ES: '5900',
      NQ: '21000',
      CL: '75',
      MCL: '75',
      GC: '2950',
      MGC: '2950',
      BTC: '105000',
      MBT: '105000',
      '6E': '1.0850',
      FDAX: '22000',
    };
    setEstimatedPrice(defaultPrices[symbol] || '100');
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Calculadora de Posição NinjaTrader</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Capital USD */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            Capital (USD)
          </Label>
          <Input
            type="number"
            placeholder="1000"
            value={capitalUSD}
            onChange={(e) => setCapitalUSD(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            ≈ {formatBRL(capitalBRL)}
          </p>
        </div>

        {/* Exchange Rate */}
        <div className="space-y-2">
          <Label>Câmbio (USD/BRL)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="5.50"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
          />
        </div>

        {/* Asset Selection */}
        <div className="space-y-2">
          <Label>Ativo</Label>
          <Select value={selectedSymbol} onValueChange={handleAssetChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um ativo" />
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              {NINJATRADER_ASSET_GROUPS.map((group) => (
                <div key={group}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                    {group}
                  </div>
                  {getAssetsByGroup(group).map((asset) => (
                    <SelectItem key={asset.symbol} value={asset.symbol}>
                      <span className="font-medium">{asset.symbol}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{asset.name}</span>
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Risk Percent */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            <TrendingDown className="w-4 h-4" />
            Risco Máximo (%)
          </Label>
          <Input
            type="number"
            step="0.5"
            min="0.5"
            max="10"
            placeholder="2"
            value={maxRiskPercent}
            onChange={(e) => setMaxRiskPercent(e.target.value)}
          />
        </div>

        {/* Stop Loss Ticks */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            <Layers className="w-4 h-4" />
            Stop Loss (Ticks)
          </Label>
          <Input
            type="number"
            min="1"
            placeholder="8"
            value={stopLossTicks}
            onChange={(e) => setStopLossTicks(e.target.value)}
          />
        </div>
      </div>

      {/* Asset Info & Leverage */}
      {selectedAsset && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Margem Day Trade</p>
            <p className="font-semibold text-primary">
              {selectedAsset.currency === 'EUR' ? '€' : '$'}{selectedAsset.dayMargin.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Margem Overnight</p>
            <p className="font-semibold">
              {selectedAsset.currency === 'EUR' ? '€' : '$'}{selectedAsset.initialMargin.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tick Size / Valor</p>
            <p className="font-semibold">
              {selectedAsset.tickSize} / ${selectedAsset.tickValue}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Preço Estimado</p>
            <Input
              type="number"
              step="0.01"
              className="h-8 text-sm"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Alavancagem Day Trade
            </p>
            <p className="font-bold text-lg text-primary">
              {effectiveLeverage > 0 ? `${effectiveLeverage.toFixed(0)}x` : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {positionSizing && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-border">
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Contratos Máximos</p>
            <p className="text-2xl font-bold text-primary">{positionSizing.maxContracts}</p>
            <p className="text-xs text-muted-foreground">
              Margem: {positionSizing.contractsByMargin} | Risco: {positionSizing.contractsByRisk}
            </p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Margem Necessária</p>
            <p className="text-lg font-semibold">{formatUSD(positionSizing.marginRequired)}</p>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Perda Máxima</p>
            <p className="text-lg font-semibold text-destructive">
              {formatUSD(positionSizing.maxLossUSD)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatBRL(positionSizing.maxLossBRL)}
            </p>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Valor do Stop</p>
            <p className="text-lg font-semibold text-success">
              {formatUSD(positionSizing.stopValuePerContract)}
            </p>
            <p className="text-xs text-muted-foreground">por contrato</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Alavancagem Efetiva</p>
            <p className="text-lg font-semibold">
              {positionSizing.effectiveLeverage.toFixed(1)}x
            </p>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-muted/20 rounded-lg text-xs text-muted-foreground">
        <p className="font-medium mb-2">💡 Como funciona o cálculo:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li><strong>Contratos por Margem:</strong> Capital ÷ Margem Day Trade</li>
          <li><strong>Contratos por Risco:</strong> (Capital × %Risco) ÷ (Ticks × Valor do Tick)</li>
          <li><strong>Máximo:</strong> O menor entre os dois valores acima</li>
          <li><strong>Alavancagem:</strong> (Preço × Point Value) ÷ Margem Day Trade</li>
        </ul>
      </div>
    </Card>
  );
}
