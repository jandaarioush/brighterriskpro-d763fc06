import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, DollarSign, TrendingDown, Layers } from 'lucide-react';
import {
  NINJATRADER_ASSETS,
  NINJATRADER_ASSET_GROUPS,
  getAssetsByGroup,
  DEFAULT_EXCHANGE_RATE,
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

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Calculadora de Posição</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          <Label>Taxa de Câmbio (USD/BRL)</Label>
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
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um ativo" />
            </SelectTrigger>
            <SelectContent>
              {NINJATRADER_ASSET_GROUPS.map((group) => (
                <div key={group}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                    {group}
                  </div>
                  {getAssetsByGroup(group).map((asset) => (
                    <SelectItem key={asset.symbol} value={asset.symbol}>
                      {asset.symbol} - {asset.name}
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
      </div>

      {/* Asset Info & Stop Loss */}
      {selectedAsset && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Margem Intradiária</p>
            <p className="font-semibold">{formatUSD(selectedAsset.dayMargin)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tick Size / Valor</p>
            <p className="font-semibold">
              {selectedAsset.tickSize} / {formatUSD(selectedAsset.tickValue)}
            </p>
          </div>
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
      )}

      {/* Results */}
      {positionSizing && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Contratos Máximos</p>
            <p className="text-2xl font-bold text-primary">{positionSizing.maxContracts}</p>
            <p className="text-xs text-muted-foreground">
              (Margem: {positionSizing.contractsByMargin} | Risco: {positionSizing.contractsByRisk})
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
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Alavancagem</p>
            <p className="text-lg font-semibold">
              {positionSizing.effectiveLeverage.toFixed(1)}x
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
