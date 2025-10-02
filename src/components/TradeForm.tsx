import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload } from "lucide-react";

export function TradeForm({ onTradeAdded }: { onTradeAdded?: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    asset: "indice",
    operation: "buy",
    contracts: "1",
    entry: "",
    exit: "",
    observations: "",
    setupUtilizado: "",
    tag: "",
    notaDisciplina: 5
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar logado para registrar trades");
      return;
    }

    setUploading(true);

    try {
      const points = parseFloat(formData.exit) - parseFloat(formData.entry);
      const pointValue = formData.asset === "indice" ? 0.2 : 10;
      const result = points * pointValue * parseInt(formData.contracts);

      // Upload screenshot if provided
      let screenshotUrl = null;
      if (screenshot) {
        const fileExt = screenshot.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('trade-screenshots')
          .upload(fileName, screenshot);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('trade-screenshots')
          .getPublicUrl(fileName);

        screenshotUrl = publicUrl;
      }

      // Save trade to database
      const { error } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          trade_date: new Date().toISOString().split('T')[0],
          asset_type: formData.asset,
          result_points: points,
          result_reais: result,
          notes: formData.observations,
          setup_utilizado: formData.setupUtilizado || null,
          tag: formData.tag || null,
          nota_disciplina: formData.notaDisciplina,
          screenshot_url: screenshotUrl
        });

      if (error) throw error;

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
        observations: "",
        setupUtilizado: "",
        tag: "",
        notaDisciplina: 5
      });
      setScreenshot(null);

      onTradeAdded?.();
    } catch (error) {
      console.error("Error registering trade:", error);
      toast.error("Erro ao registrar trade");
    } finally {
      setUploading(false);
    }
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Setup Utilizado</Label>
            <Select value={formData.setupUtilizado} onValueChange={(v) => setFormData({...formData, setupUtilizado: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um setup" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rompimento">Rompimento</SelectItem>
                <SelectItem value="reversao">Reversão</SelectItem>
                <SelectItem value="tendencia">Tendência</SelectItem>
                <SelectItem value="suporte-resistencia">Suporte/Resistência</SelectItem>
                <SelectItem value="medias-moveis">Médias Móveis</SelectItem>
                <SelectItem value="divergencia">Divergência</SelectItem>
                <SelectItem value="padrao-candlestick">Padrão Candlestick</SelectItem>
                <SelectItem value="breakout">Breakout</SelectItem>
                <SelectItem value="pull-back">Pull Back</SelectItem>
                <SelectItem value="scalping">Scalping</SelectItem>
                <SelectItem value="swing-trade">Swing Trade</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tag</Label>
            <Select value={formData.tag} onValueChange={(v) => setFormData({...formData, tag: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disciplinado">Disciplinado</SelectItem>
                <SelectItem value="emocional">Emocional</SelectItem>
                <SelectItem value="fora-setup">Fora de Setup</SelectItem>
                <SelectItem value="overtrading">Overtrading</SelectItem>
                <SelectItem value="fomo">FOMO</SelectItem>
                <SelectItem value="revenge-trading">Revenge Trading</SelectItem>
                <SelectItem value="perfeito">Perfeito</SelectItem>
                <SelectItem value="experimental">Experimental</SelectItem>
                <SelectItem value="conservador">Conservador</SelectItem>
                <SelectItem value="agressivo">Agressivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Nota de Disciplina (1-10)</Label>
          <div className="space-y-2">
            <Slider
              value={[formData.notaDisciplina]}
              onValueChange={(v) => setFormData({...formData, notaDisciplina: v[0]})}
              min={0}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-muted-foreground">
              {formData.notaDisciplina}
            </div>
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

        <div className="space-y-2">
          <Label>Screenshot (Opcional)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              className="flex-1"
            />
            {screenshot && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setScreenshot(null)}
              >
                Remover
              </Button>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={uploading}>
          {uploading ? "Registrando..." : "Registrar Trade"}
        </Button>
      </form>
    </Card>
  );
}
