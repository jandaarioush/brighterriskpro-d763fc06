import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  NINJATRADER_ASSETS,
  NINJATRADER_ASSET_GROUPS,
  getAssetsByGroup,
  getAssetBySymbol,
  DEFAULT_EXCHANGE_RATE,
} from '@/lib/ninjatraderAssets';
import { calculateInternationalTradeResult, formatUSD, formatBRL } from '@/lib/internationalRiskCalculations';

interface InternationalTradeFormProps {
  dashboardId: string;
  onTradeAdded?: () => void;
}

export function InternationalTradeForm({ dashboardId, onTradeAdded }: InternationalTradeFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [tradeDate, setTradeDate] = useState<Date>(new Date());
  const [symbol, setSymbol] = useState('MES');
  const [tradeType, setTradeType] = useState<'long' | 'short'>('long');
  const [contracts, setContracts] = useState('1');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [commission, setCommission] = useState('0.59');
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE.toString());
  const [riskPercent, setRiskPercent] = useState('8');
  const [setupUtilizado, setSetupUtilizado] = useState('');
  const [tag, setTag] = useState('');
  const [notaDisciplina, setNotaDisciplina] = useState('');
  const [notes, setNotes] = useState('');

  const selectedAsset = useMemo(() => getAssetBySymbol(symbol), [symbol]);

  // Calculate result
  const tradeResult = useMemo(() => {
    if (!selectedAsset || !entryPrice || !exitPrice) return null;

    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const qty = parseInt(contracts) || 1;
    const comm = parseFloat(commission) || 0;
    const exchRate = parseFloat(exchangeRate) || DEFAULT_EXCHANGE_RATE;

    if (isNaN(entry) || isNaN(exit)) return null;

    return calculateInternationalTradeResult(
      entry,
      exit,
      selectedAsset.tickSize,
      selectedAsset.tickValue,
      qty,
      comm,
      exchRate,
      tradeType
    );
  }, [selectedAsset, entryPrice, exitPrice, contracts, commission, exchangeRate, tradeType]);

  // Calculate margin used
  const marginUsed = useMemo(() => {
    if (!selectedAsset) return 0;
    const qty = parseInt(contracts) || 1;
    return selectedAsset.dayMargin * qty;
  }, [selectedAsset, contracts]);

  // Calculate percentage result
  const resultPercentual = useMemo(() => {
    if (!tradeResult || marginUsed <= 0) return 0;
    return (tradeResult.resultUSD / marginUsed) * 100;
  }, [tradeResult, marginUsed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedAsset || !tradeResult) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('international_trades').insert({
        user_id: user.id,
        dashboard_id: dashboardId,
        trade_date: format(tradeDate, 'yyyy-MM-dd'),
        symbol,
        trade_type: tradeType,
        contracts: parseInt(contracts) || 1,
        entry_price: parseFloat(entryPrice),
        exit_price: parseFloat(exitPrice),
        tick_size: selectedAsset.tickSize,
        tick_value: selectedAsset.tickValue,
        commission: parseFloat(commission) || 0,
        exchange_rate: parseFloat(exchangeRate) || DEFAULT_EXCHANGE_RATE,
        resultado_usd: tradeResult.resultUSD,
        resultado_brl: tradeResult.resultBRL,
        resultado_percentual: resultPercentual,
        margin_used: marginUsed,
        risco_percentual: parseFloat(riskPercent) || 8,
        setup_utilizado: setupUtilizado || null,
        tag: tag || null,
        nota_disciplina: notaDisciplina ? parseInt(notaDisciplina) : null,
        notes: notes || null,
      });

      if (error) throw error;

      toast.success('Trade registrado com sucesso!');
      
      // Reset form
      setEntryPrice('');
      setExitPrice('');
      setContracts('1');
      setSetupUtilizado('');
      setTag('');
      setNotaDisciplina('');
      setNotes('');
      
      onTradeAdded?.();
    } catch (error: any) {
      console.error('Error adding trade:', error);
      toast.error('Erro ao registrar trade: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Plus className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Novo Trade</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Date, Symbol, Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !tradeDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tradeDate ? format(tradeDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={tradeDate}
                  onSelect={(date) => date && setTradeDate(date)}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Ativo</Label>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger>
                <SelectValue />
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

          <div className="space-y-2">
            <Label>Tipo</Label>
            <RadioGroup
              value={tradeType}
              onValueChange={(v) => setTradeType(v as 'long' | 'short')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="long" id="long" />
                <Label htmlFor="long" className="cursor-pointer">Long (Compra)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="short" id="short" />
                <Label htmlFor="short" className="cursor-pointer">Short (Venda)</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Row 2: Contracts, Entry, Exit, Commission */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Contratos</Label>
            <Input
              type="number"
              min="1"
              value={contracts}
              onChange={(e) => setContracts(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Preço Entrada</Label>
            <Input
              type="number"
              step="any"
              placeholder="0.00"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Preço Saída</Label>
            <Input
              type="number"
              step="any"
              placeholder="0.00"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Comissão (por contrato)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.59"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
            />
          </div>
        </div>

        {/* Row 3: Exchange Rate, Risk */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Taxa de Câmbio (USD/BRL)</Label>
            <Input
              type="number"
              step="0.01"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Risco (%)</Label>
            <Input
              type="number"
              step="0.5"
              value={riskPercent}
              onChange={(e) => setRiskPercent(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Setup Utilizado</Label>
            <Input
              placeholder="Ex: Breakout"
              value={setupUtilizado}
              onChange={(e) => setSetupUtilizado(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Tag</Label>
            <Input
              placeholder="Ex: Scalp"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>
        </div>

        {/* Result Preview */}
        {tradeResult && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Ticks</p>
              <p className={`font-semibold ${tradeResult.ticks >= 0 ? 'text-success' : 'text-destructive'}`}>
                {tradeResult.ticks.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Resultado (USD)</p>
              <p className={`font-semibold ${tradeResult.resultUSD >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatUSD(tradeResult.resultUSD)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Resultado (BRL)</p>
              <p className={`font-semibold ${tradeResult.resultBRL >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatBRL(tradeResult.resultBRL)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Retorno (%)</p>
              <p className={`font-semibold ${resultPercentual >= 0 ? 'text-success' : 'text-destructive'}`}>
                {resultPercentual.toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        {/* Row 4: Discipline Note, Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nota de Disciplina (1-10)</Label>
            <Input
              type="number"
              min="1"
              max="10"
              placeholder="1-10"
              value={notaDisciplina}
              onChange={(e) => setNotaDisciplina(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Anotações sobre o trade..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading || !tradeResult}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Registrar Trade
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
