import { useState, useEffect } from "react";
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
import { Plus } from "lucide-react";

export function TradeForm({ onTradeAdded }: { onTradeAdded?: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    asset: "indice",
    operation: "buy",
    contracts: "1",
    entry: "",
    exit: "",
    points: "",
    observations: "",
    setupUtilizado: "",
    tag: "",
    notaDisciplina: 5
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Custom setup and tag management
  const [customSetups, setCustomSetups] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [showNewSetupInput, setShowNewSetupInput] = useState(false);
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [newSetupValue, setNewSetupValue] = useState("");
  const [newTagValue, setNewTagValue] = useState("");

  // Default options
  const defaultSetups = [
    "Rompimento",
    "Reversão",
    "Tendência",
    "Suporte/Resistência",
    "Médias Móveis",
    "Divergência",
    "Padrão Candlestick",
    "Breakout",
    "Pull Back",
    "Scalping",
    "Swing Trade"
  ];

  const defaultTags = [
    "Disciplinado",
    "Emocional",
    "Fora de Setup",
    "Overtrading",
    "FOMO",
    "Revenge Trading",
    "Perfeito",
    "Experimental",
    "Conservador",
    "Agressivo"
  ];

  // Load user's custom setups and tags from their previous trades
  useEffect(() => {
    if (!user) return;

    const loadCustomOptions = async () => {
      const { data: trades } = await supabase
        .from('trades')
        .select('setup_utilizado, tag')
        .eq('user_id', user.id)
        .not('setup_utilizado', 'is', null)
        .not('tag', 'is', null);

      if (trades) {
        const setups = new Set<string>();
        const tags = new Set<string>();

        trades.forEach(trade => {
          if (trade.setup_utilizado && !defaultSetups.includes(trade.setup_utilizado)) {
            setups.add(trade.setup_utilizado);
          }
          if (trade.tag && !defaultTags.includes(trade.tag)) {
            tags.add(trade.tag);
          }
        });

        setCustomSetups(Array.from(setups));
        setCustomTags(Array.from(tags));
      }
    };

    loadCustomOptions();
  }, [user]);

  const handleAddNewSetup = () => {
    if (newSetupValue.trim()) {
      const trimmed = newSetupValue.trim();
      if (!customSetups.includes(trimmed) && !defaultSetups.includes(trimmed)) {
        setCustomSetups([...customSetups, trimmed]);
      }
      setFormData({...formData, setupUtilizado: trimmed});
      setNewSetupValue("");
      setShowNewSetupInput(false);
    }
  };

  const handleAddNewTag = () => {
    if (newTagValue.trim()) {
      const trimmed = newTagValue.trim();
      if (!customTags.includes(trimmed) && !defaultTags.includes(trimmed)) {
        setCustomTags([...customTags, trimmed]);
      }
      setFormData({...formData, tag: trimmed});
      setNewTagValue("");
      setShowNewTagInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar logado para registrar trades");
      return;
    }

    setUploading(true);

    try {
      // Calculate points: use direct points input or calculate from entry/exit
      let points = 0;
      if (formData.points) {
        points = parseFloat(formData.points);
      } else if (formData.entry && formData.exit) {
        points = parseFloat(formData.exit) - parseFloat(formData.entry);
      } else {
        toast.error("Preencha a pontuação ou entrada/saída");
        setUploading(false);
        return;
      }
      
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

        // Store the file path instead of public URL (bucket is now private)
        screenshotUrl = fileName;
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
        points: "",
        observations: "",
        setupUtilizado: "",
        tag: "",
        notaDisciplina: 5
      });
      setScreenshot(null);

      onTradeAdded?.();
    } catch (error) {
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

        <div className="grid grid-cols-4 gap-4">
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
            <Label>Pontuação</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="Ex: 100 ou -50"
              value={formData.points}
              onChange={(e) => setFormData({...formData, points: e.target.value, entry: "", exit: ""})}
            />
          </div>

          <div className="space-y-2">
            <Label>Entrada (Opcional)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="Pontos"
              value={formData.entry}
              onChange={(e) => setFormData({...formData, entry: e.target.value, points: ""})}
            />
          </div>

          <div className="space-y-2">
            <Label>Saída (Opcional)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="Pontos"
              value={formData.exit}
              onChange={(e) => setFormData({...formData, exit: e.target.value, points: ""})}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Setup Utilizado</Label>
            {showNewSetupInput ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o nome do setup..."
                  value={newSetupValue}
                  onChange={(e) => setNewSetupValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewSetup();
                    }
                    if (e.key === 'Escape') {
                      setShowNewSetupInput(false);
                      setNewSetupValue("");
                    }
                  }}
                  autoFocus
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddNewSetup}
                >
                  OK
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowNewSetupInput(false);
                    setNewSetupValue("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Select 
                value={formData.setupUtilizado} 
                onValueChange={(v) => {
                  if (v === "_new_") {
                    setShowNewSetupInput(true);
                  } else {
                    setFormData({...formData, setupUtilizado: v});
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um setup" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="_new_" className="text-primary font-medium">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Criar novo setup...
                    </div>
                  </SelectItem>
                  {defaultSetups.map(setup => (
                    <SelectItem key={setup} value={setup}>
                      {setup}
                    </SelectItem>
                  ))}
                  {customSetups.length > 0 && (
                    <>
                      <SelectItem value="_divider_" disabled className="text-xs text-muted-foreground">
                        — Setups Personalizados —
                      </SelectItem>
                      {customSetups.map(setup => (
                        <SelectItem key={setup} value={setup}>
                          {setup}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tag</Label>
            {showNewTagInput ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o nome da tag..."
                  value={newTagValue}
                  onChange={(e) => setNewTagValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewTag();
                    }
                    if (e.key === 'Escape') {
                      setShowNewTagInput(false);
                      setNewTagValue("");
                    }
                  }}
                  autoFocus
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddNewTag}
                >
                  OK
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowNewTagInput(false);
                    setNewTagValue("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Select 
                value={formData.tag} 
                onValueChange={(v) => {
                  if (v === "_new_") {
                    setShowNewTagInput(true);
                  } else {
                    setFormData({...formData, tag: v});
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma tag" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="_new_" className="text-primary font-medium">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Criar nova tag...
                    </div>
                  </SelectItem>
                  {defaultTags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                  {customTags.length > 0 && (
                    <>
                      <SelectItem value="_divider_" disabled className="text-xs text-muted-foreground">
                        — Tags Personalizadas —
                      </SelectItem>
                      {customTags.map(tag => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            )}
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
