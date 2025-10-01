import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

const INDICE_POINT_VALUE = 0.2;
const DOLAR_POINT_VALUE = 10;

export function RiskCalculator() {
  const [asset, setAsset] = useState<"indice" | "dolar">("indice");
  const [points, setPoints] = useState("");
  const [contracts, setContracts] = useState("1");

  const pointValue = asset === "indice" ? INDICE_POINT_VALUE : DOLAR_POINT_VALUE;
  const result = parseFloat(points || "0") * pointValue * parseInt(contracts || "1");

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Simulador de Risco</h3>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={asset === "indice" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setAsset("indice")}
          >
            Índice
          </Button>
          <Button
            variant={asset === "dolar" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setAsset("dolar")}
          >
            Dólar
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Pontos</Label>
          <Input
            type="number"
            placeholder="Ex: 100"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Nº de Contratos</Label>
          <Input
            type="number"
            placeholder="Ex: 1"
            value={contracts}
            onChange={(e) => setContracts(e.target.value)}
          />
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Resultado</span>
            <span className="text-2xl font-bold text-primary">
              R$ {result.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {asset === "indice" 
              ? "1 ponto = R$ 0,20 por contrato" 
              : "1 ponto = R$ 10,00 por contrato"}
          </p>
        </div>
      </div>
    </Card>
  );
}
