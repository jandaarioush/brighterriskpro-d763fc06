import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function TradeForm({ onTradeAdded }: { onTradeAdded?: () => void }) {
  const [formData, setFormData] = useState({
    asset: "indice",
    operation: "buy",
    contracts: "1",
    entry: "",
    exit: "",
    observations: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const points = parseFloat(formData.exit) - parseFloat(formData.entry);
    const pointValue = formData.asset === "indice" ? 0.2 : 10;
    const result = points * pointValue * parseInt(formData.contracts);
    
    // Here you would save to your backend/state management
    console.log("Trade registered:", { ...formData, points, result });
    
    toast.success("Trade registrado com sucesso!", {
      description: `Resultado: R$ ${result.toFixed(2)}`
    });

    // Reset form
    setFormData({
      asset: "indice",
      operation: "buy",
      contracts: "1",
      entry: "",
      exit: "",
      observations: ""
    });

    onTradeAdded?.();
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Registrar Trade</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ativo</Label>
            <Select value={formData.asset} onValueChange={(v) => setFormData({...formData, asset: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indice">Índice</SelectItem>
                <SelectItem value="dolar">Dólar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Operação</Label>
            <Select value={formData.operation} onValueChange={(v) => setFormData({...formData, operation: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Compra</SelectItem>
                <SelectItem value="sell">Venda</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Contratos</Label>
            <Input
              type="number"
              value={formData.contracts}
              onChange={(e) => setFormData({...formData, contracts: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Entrada</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="Pontos"
              value={formData.entry}
              onChange={(e) => setFormData({...formData, entry: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Saída</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="Pontos"
              value={formData.exit}
              onChange={(e) => setFormData({...formData, exit: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Observações</Label>
          <Textarea
            placeholder="Setup usado, condições de mercado, etc."
            value={formData.observations}
            onChange={(e) => setFormData({...formData, observations: e.target.value})}
            rows={3}
          />
        </div>

        <Button type="submit" className="w-full">
          Registrar Trade
        </Button>
      </form>
    </Card>
  );
}
