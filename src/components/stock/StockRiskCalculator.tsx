import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';

interface StockRiskCalculatorProps {
  capitalTotal: number;
  onCapitalChange: (capital: number) => void;
}

export function StockRiskCalculator({ capitalTotal, onCapitalChange }: StockRiskCalculatorProps) {
  const [precoEntrada, setPrecoEntrada] = useState('');
  const [precoStop, setPrecoStop] = useState('');
  const [riscoPercentual, setRiscoPercentual] = useState('2');
  const [alavancagem, setAlavancagem] = useState('1');

  const calcularPosicao = () => {
    const entrada = parseFloat(precoEntrada);
    const stop = parseFloat(precoStop);
    const risco = parseFloat(riscoPercentual);
    const alav = parseFloat(alavancagem) || 1;

    if (!entrada || !stop || !risco) return null;

    const riscoEmReais = (risco / 100) * capitalTotal;
    const diferencaPorAcao = Math.abs(entrada - stop);
    const quantidadeBase = riscoEmReais / diferencaPorAcao;
    const quantidadeAlavancada = quantidadeBase / alav;
    const capitalNecessario = entrada * quantidadeAlavancada;

    return {
      quantidade: Math.floor(quantidadeAlavancada),
      riscoEmReais,
      capitalNecessario,
      diferencaPorAcao,
    };
  };

  const resultado = calcularPosicao();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Calculadora de Posição
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="capital">Capital Total</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">R$</span>
            <Input
              id="capital"
              type="number"
              value={capitalTotal}
              onChange={(e) => onCapitalChange(parseFloat(e.target.value) || 0)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="precoEntrada">Preço Entrada</Label>
            <Input
              id="precoEntrada"
              type="number"
              step="0.01"
              value={precoEntrada}
              onChange={(e) => setPrecoEntrada(e.target.value)}
              placeholder="25.50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="precoStop">Preço Stop</Label>
            <Input
              id="precoStop"
              type="number"
              step="0.01"
              value={precoStop}
              onChange={(e) => setPrecoStop(e.target.value)}
              placeholder="25.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="riscoPercentual">Risco (%)</Label>
            <Input
              id="riscoPercentual"
              type="number"
              step="0.1"
              value={riscoPercentual}
              onChange={(e) => setRiscoPercentual(e.target.value)}
              placeholder="2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alavancagem">Alavancagem</Label>
            <Input
              id="alavancagem"
              type="number"
              step="0.1"
              value={alavancagem}
              onChange={(e) => setAlavancagem(e.target.value)}
              placeholder="1"
            />
          </div>
        </div>

        {resultado && (
          <Card className="p-4 bg-primary/10 border-primary/30">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Quantidade Máxima</span>
                <span className="text-2xl font-bold text-primary">{resultado.quantidade} ações</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Risco em R$</span>
                <span>R$ {resultado.riscoEmReais.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Capital Necessário</span>
                <span>R$ {resultado.capitalNecessario.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stop por ação</span>
                <span>R$ {resultado.diferencaPorAcao.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        )}

        {!resultado && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Preencha os campos para calcular o tamanho da posição
          </p>
        )}
      </CardContent>
    </Card>
  );
}
