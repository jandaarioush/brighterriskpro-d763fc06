import { useState } from "react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award,
  Download,
  Filter
} from "lucide-react";

interface Trade {
  id: string;
  date: string;
  time: string;
  asset: string;
  operation: string;
  contracts: number;
  entry: number;
  exit: number;
  points: number;
  result: number;
  riskPercent: number;
  duration: string;
  observations: string;
}

export default function Trades() {
  const [filterAsset, setFilterAsset] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const mockTrades: Trade[] = [
    {
      id: "1",
      date: "2025-01-15",
      time: "10:30",
      asset: "Índice",
      operation: "Compra",
      contracts: 1,
      entry: 125000,
      exit: 125500,
      points: 500,
      result: 100,
      riskPercent: 73.3,
      duration: "45min",
      observations: "Setup Rompimento"
    },
    {
      id: "2",
      date: "2025-01-15",
      time: "14:15",
      asset: "Dólar",
      operation: "Venda",
      contracts: 2,
      entry: 5050,
      exit: 5040,
      points: -10,
      result: -200,
      riskPercent: -146.5,
      duration: "1h 20min",
      observations: "Stop Loss atingido"
    },
    {
      id: "3",
      date: "2025-01-14",
      time: "11:00",
      asset: "Índice",
      operation: "Venda",
      contracts: 1,
      entry: 124800,
      exit: 124300,
      points: 500,
      result: 100,
      riskPercent: 73.3,
      duration: "30min",
      observations: "Tendência de baixa"
    }
  ];

  const totalTrades = mockTrades.length;
  const profitTrades = mockTrades.filter(t => t.result > 0).length;
  const totalProfit = mockTrades.filter(t => t.result > 0).reduce((acc, t) => acc + t.result, 0);
  const totalLoss = mockTrades.filter(t => t.result < 0).reduce((acc, t) => acc + t.result, 0);
  const winRate = (profitTrades / totalTrades) * 100;
  const bestTrade = Math.max(...mockTrades.map(t => t.result));
  const worstTrade = Math.min(...mockTrades.map(t => t.result));

  const filteredTrades = mockTrades.filter(trade => {
    const matchesAsset = filterAsset === "all" || trade.asset.toLowerCase().includes(filterAsset);
    const matchesSearch = trade.observations.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAsset && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Trades</h1>
          <p className="text-muted-foreground">
            Histórico completo e análise de performance
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Trades"
            value={totalTrades.toString()}
            subtitle={`Win Rate: ${winRate.toFixed(1)}%`}
            icon={Target}
            variant="default"
          />
          
          <StatCard
            title="Lucro Total"
            value={`R$ ${totalProfit.toFixed(2)}`}
            subtitle={`${profitTrades} trades positivos`}
            icon={TrendingUp}
            variant="success"
          />
          
          <StatCard
            title="Perda Total"
            value={`R$ ${Math.abs(totalLoss).toFixed(2)}`}
            subtitle={`${totalTrades - profitTrades} trades negativos`}
            icon={TrendingDown}
            variant="danger"
          />
          
          <StatCard
            title="Melhor Trade"
            value={`R$ ${bestTrade.toFixed(2)}`}
            subtitle={`Pior: R$ ${worstTrade.toFixed(2)}`}
            icon={Award}
            variant="success"
          />
        </div>

        {/* Filters and Actions */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por observações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={filterAsset} onValueChange={setFilterAsset}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar ativo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os ativos</SelectItem>
                <SelectItem value="indice">Índice</SelectItem>
                <SelectItem value="dólar">Dólar</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </Card>

        {/* Trades Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Operação</TableHead>
                  <TableHead className="text-right">Contratos</TableHead>
                  <TableHead className="text-right">Entrada</TableHead>
                  <TableHead className="text-right">Saída</TableHead>
                  <TableHead className="text-right">Pontos</TableHead>
                  <TableHead className="text-right">Resultado</TableHead>
                  <TableHead className="text-right">% Risco</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">
                      {trade.date}<br/>
                      <span className="text-xs text-muted-foreground">{trade.time}</span>
                    </TableCell>
                    <TableCell>{trade.asset}</TableCell>
                    <TableCell>
                      <span className={trade.operation === "Compra" ? "text-success" : "text-danger"}>
                        {trade.operation}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{trade.contracts}</TableCell>
                    <TableCell className="text-right">{trade.entry.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{trade.exit.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span className={trade.points > 0 ? "text-success" : "text-danger"}>
                        {trade.points > 0 ? "+" : ""}{trade.points}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold ${trade.result > 0 ? "text-success" : "text-danger"}`}>
                        R$ {trade.result > 0 ? "+" : ""}{trade.result.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={trade.riskPercent > 0 ? "text-success" : "text-danger"}>
                        {trade.riskPercent.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>{trade.duration}</TableCell>
                    <TableCell className="max-w-xs truncate" title={trade.observations}>
                      {trade.observations}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Distribuição de Resultados</h3>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Gráfico de distribuição</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance por Ativo</h3>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Gráfico comparativo</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
