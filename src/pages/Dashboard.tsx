import { StatCard } from "@/components/StatCard";
import { RiskCalculator } from "@/components/RiskCalculator";
import { TradeForm } from "@/components/TradeForm";
import { MonthHeatmap } from "@/components/MonthHeatmap";
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  Shield,
  Activity
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  // Mock data - replace with real calculations
  const monthlyRisk = 3000;
  const workingDaysInMonth = 22;
  const workingDaysRemaining = 15;
  const accumulatedResult = 450;
  const accumulatedDrawdown = -150;
  
  const dailyRisk = monthlyRisk / workingDaysRemaining;
  const stopIndice = dailyRisk / 0.2;
  const stopDolar = dailyRisk / 10;
  const monthlyResultPercent = (accumulatedResult / monthlyRisk) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Gestão de risco e performance em tempo real
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Risco Mensal"
            value={`R$ ${monthlyRisk.toLocaleString()}`}
            subtitle={`${workingDaysInMonth} dias úteis no mês`}
            icon={Shield}
            variant="default"
          />
          
          <StatCard
            title="Risco Diário Atual"
            value={`R$ ${dailyRisk.toFixed(2)}`}
            subtitle={`${workingDaysRemaining} dias úteis restantes`}
            icon={AlertTriangle}
            variant="warning"
          />
          
          <StatCard
            title="Resultado Acumulado"
            value={`R$ ${accumulatedResult.toFixed(2)}`}
            subtitle={`${monthlyResultPercent.toFixed(1)}% do risco mensal`}
            icon={TrendingUp}
            variant={accumulatedResult >= 0 ? "success" : "danger"}
            trend={{
              value: `${monthlyResultPercent.toFixed(1)}%`,
              isPositive: accumulatedResult >= 0
            }}
          />
        </div>

        {/* Stops and Drawdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Stop Índice"
            value={`${stopIndice.toFixed(0)} pts`}
            subtitle="1 ponto = R$ 0,20"
            icon={Target}
            variant="default"
          />
          
          <StatCard
            title="Stop Dólar"
            value={`${stopDolar.toFixed(1)} pts`}
            subtitle="1 ponto = R$ 10,00"
            icon={Target}
            variant="default"
          />
          
          <StatCard
            title="Drawdown Acumulado"
            value={`R$ ${Math.abs(accumulatedDrawdown).toFixed(2)}`}
            subtitle={`${((Math.abs(accumulatedDrawdown) / monthlyRisk) * 100).toFixed(1)}% do risco mensal`}
            icon={Activity}
            variant="danger"
          />
        </div>

        {/* Charts and Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="p-6 h-full">
              <h3 className="text-lg font-semibold mb-4">Evolução do PnL Diário</h3>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                {/* Chart component would go here */}
                <p>Gráfico de evolução do PnL</p>
              </div>
            </Card>
          </div>
          
          <RiskCalculator />
        </div>

        {/* Heatmap and Trade Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthHeatmap />
          <TradeForm />
        </div>
      </div>
    </div>
  );
}
