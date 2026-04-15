import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { calculateTradeResult } from '@/lib/stockRiskCalculations';
import { getXPAsset, xpAssets, getXPLeverage, type Modalidade } from '@/lib/xpAssets';
import { Plus, Loader2, Check, ChevronsUpDown, Info } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';

interface StockTradeFormProps {
  dashboardId: string;
  capitalTotal: number;
  onTradeAdded?: () => void;
}

export function StockTradeForm({ dashboardId, capitalTotal, onTradeAdded }: StockTradeFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tickerOpen, setTickerOpen] = useState(false);
  const [formData, setFormData] = useState({
    trade_date: new Date().toISOString().split('T')[0],
    ticker: '',
    modalidade: 'daytrade' as Modalidade,
    preco_entrada: '',
    preco_saida: '',
    quantidade: '',
    alavancagem: '1',
    corretagem: '0',
    risco_percentual: '8',
    setup_utilizado: '',
    tag: '',
    nota_disciplina: '',
    notes: '',
  });

  const xpTickers = useMemo(() => xpAssets.map(a => a.ticker), []);

  const selectedXPAsset = useMemo(() => {
    if (!formData.ticker) return null;
    return getXPAsset(formData.ticker);
  }, [formData.ticker]);

  const handleTickerSelect = (ticker: string) => {
    const leverage = getXPLeverage(ticker, formData.modalidade);
    setFormData({ 
      ...formData, 
      ticker, 
      alavancagem: leverage.toString() 
    });
    setTickerOpen(false);
  };

  const handleModalidadeChange = (modalidade: Modalidade) => {
    const leverage = formData.ticker ? getXPLeverage(formData.ticker, modalidade) : 1;
    setFormData({ ...formData, modalidade, alavancagem: leverage.toString() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const precoEntrada = parseFloat(formData.preco_entrada);
    const precoSaida = parseFloat(formData.preco_saida);
    const quantidade = parseInt(formData.quantidade);
    const alavancagem = parseFloat(formData.alavancagem) || 1;
    const corretagem = parseFloat(formData.corretagem) || 0;
    const riscoPercentual = parseFloat(formData.risco_percentual) || 8;

    if (!formData.ticker || !precoEntrada || !precoSaida || !quantidade) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    const { resultadoReais, resultadoPercentual } = calculateTradeResult(
      precoEntrada, precoSaida, quantidade, alavancagem, corretagem
    );

    const capitalUtilizado = precoEntrada * quantidade;

    try {
      const { error } = await supabase.from('stock_trades').insert({
        user_id: user.id,
        dashboard_id: dashboardId,
        trade_date: formData.trade_date,
        ticker: formData.ticker.toUpperCase(),
        modalidade: formData.modalidade,
        preco_entrada: precoEntrada,
        preco_saida: precoSaida,
        quantidade,
        alavancagem,
        resultado_reais: resultadoReais,
        resultado_percentual: resultadoPercentual,
        corretagem,
        capital_utilizado: capitalUtilizado,
        risco_percentual: riscoPercentual,
        setup_utilizado: formData.setup_utilizado || null,
        tag: formData.tag || null,
        nota_disciplina: formData.nota_disciplina ? parseInt(formData.nota_disciplina) : null,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast.success('Trade registrado com sucesso!');
      
      setFormData({
        trade_date: new Date().toISOString().split('T')[0],
        ticker: '',
        modalidade: 'daytrade',
        preco_entrada: '',
        preco_saida: '',
        quantidade: '',
        alavancagem: '1',
        corretagem: '0',
        risco_percentual: formData.risco_percentual,
        setup_utilizado: '',
        tag: '',
        nota_disciplina: '',
        notes: '',
      });

      onTradeAdded?.();
    } catch (error) {
      console.error('Error adding trade:', error);
      toast.error('Erro ao registrar trade');
    } finally {
      setLoading(false);
    }
  };

  const previewResult = () => {
    const precoEntrada = parseFloat(formData.preco_entrada);
    const precoSaida = parseFloat(formData.preco_saida);
    const quantidade = parseInt(formData.quantidade);
    const alavancagem = parseFloat(formData.alavancagem) || 1;
    const corretagem = parseFloat(formData.corretagem) || 0;

    if (!precoEntrada || !precoSaida || !quantidade) return null;

    return calculateTradeResult(precoEntrada, precoSaida, quantidade, alavancagem, corretagem);
  };

  const preview = previewResult();
  const currentLeverage = selectedXPAsset ? getXPLeverage(formData.ticker, formData.modalidade) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Trade de Ação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trade_date">Data</Label>
              <Input
                id="trade_date"
                type="date"
                value={formData.trade_date}
                onChange={(e) => setFormData({ ...formData, trade_date: e.target.value })}
              />
            </div>
            
            {/* Ticker com Autocomplete */}
            <div className="space-y-2">
              <Label htmlFor="ticker">Ticker *</Label>
              <Popover open={tickerOpen} onOpenChange={setTickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={tickerOpen}
                    className="w-full justify-between font-normal"
                  >
                    {formData.ticker || "Selecione ou digite..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Buscar ticker..." 
                      onValueChange={(value) => {
                        if (value && !xpTickers.includes(value.toUpperCase())) {
                          setFormData({ ...formData, ticker: value.toUpperCase() });
                        }
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>
                        <div className="py-2 text-center">
                          <p className="text-sm text-muted-foreground">Ticker não encontrado na lista</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setTickerOpen(false);
                            }}
                          >
                            Usar ticker digitado
                          </Button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup heading="Ativos B3">
                        {xpTickers.map((ticker) => {
                          const asset = getXPAsset(ticker);
                          const lev = asset ? getXPLeverage(ticker, formData.modalidade) : 1;
                          return (
                            <CommandItem
                              key={ticker}
                              value={ticker}
                              onSelect={() => handleTickerSelect(ticker)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.ticker === ticker ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <span className="font-medium">{ticker}</span>
                              {asset && (
                                <span className="ml-auto text-xs text-muted-foreground">
                                  {lev}x
                                </span>
                              )}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Info do ativo selecionado */}
              {selectedXPAsset && currentLeverage && (
                <div className="flex items-center gap-1 text-xs text-primary">
                  <Info className="h-3 w-3" />
                  <span>B3: {currentLeverage}x alavancagem ({formData.modalidade === 'daytrade' ? 'Day Trade' : 'Swing Trade'})</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modalidade">Modalidade</Label>
              <Select 
                value={formData.modalidade} 
                onValueChange={(v) => handleModalidadeChange(v as Modalidade)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daytrade">Day Trade</SelectItem>
                  <SelectItem value="swing">Swing Trade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="risco_percentual">Risco (%)</Label>
              <Input
                id="risco_percentual"
                type="number"
                step="0.1"
                value={formData.risco_percentual}
                onChange={(e) => setFormData({ ...formData, risco_percentual: e.target.value })}
                placeholder="8"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preco_entrada">Preço Entrada *</Label>
              <Input
                id="preco_entrada"
                type="number"
                step="0.01"
                value={formData.preco_entrada}
                onChange={(e) => setFormData({ ...formData, preco_entrada: e.target.value })}
                placeholder="25.50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preco_saida">Preço Saída *</Label>
              <Input
                id="preco_saida"
                type="number"
                step="0.01"
                value={formData.preco_saida}
                onChange={(e) => setFormData({ ...formData, preco_saida: e.target.value })}
                placeholder="26.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                placeholder="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alavancagem">Alavancagem</Label>
              <Input
                id="alavancagem"
                type="number"
                step="0.1"
                value={formData.alavancagem}
                onChange={(e) => setFormData({ ...formData, alavancagem: e.target.value })}
                placeholder="1"
                className={selectedXPAsset ? 'border-primary/50' : ''}
              />
              {selectedXPAsset && currentLeverage && (
                <p className="text-xs text-primary">Automático: B3 {currentLeverage}x</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="corretagem">Corretagem</Label>
              <Input
                id="corretagem"
                type="number"
                step="0.01"
                value={formData.corretagem}
                onChange={(e) => setFormData({ ...formData, corretagem: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <Card className={`p-4 ${preview.resultadoReais >= 0 ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30'}`}>
              <p className="text-sm text-muted-foreground mb-1">Resultado Estimado</p>
              <p className={`text-2xl font-bold ${preview.resultadoReais >= 0 ? 'text-success' : 'text-destructive'}`}>
                R$ {preview.resultadoReais.toFixed(2)} ({preview.resultadoPercentual.toFixed(2)}%)
              </p>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="setup_utilizado">Setup</Label>
              <Select 
                value={formData.setup_utilizado} 
                onValueChange={(v) => setFormData({ ...formData, setup_utilizado: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rompimento">Rompimento</SelectItem>
                  <SelectItem value="pullback">Pullback</SelectItem>
                  <SelectItem value="reversao">Reversão</SelectItem>
                  <SelectItem value="tendencia">Tendência</SelectItem>
                  <SelectItem value="scalp">Scalp</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag">Tag</Label>
              <Select 
                value={formData.tag} 
                onValueChange={(v) => setFormData({ ...formData, tag: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seguiu_plano">Seguiu Plano</SelectItem>
                  <SelectItem value="fora_plano">Fora do Plano</SelectItem>
                  <SelectItem value="emocional">Emocional</SelectItem>
                  <SelectItem value="teste">Teste</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nota_disciplina">Nota Disciplina (1-5)</Label>
            <Select 
              value={formData.nota_disciplina} 
              onValueChange={(v) => setFormData({ ...formData, nota_disciplina: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Péssimo</SelectItem>
                <SelectItem value="2">2 - Ruim</SelectItem>
                <SelectItem value="3">3 - Regular</SelectItem>
                <SelectItem value="4">4 - Bom</SelectItem>
                <SelectItem value="5">5 - Excelente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Anotações sobre o trade..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Registrar Trade'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
