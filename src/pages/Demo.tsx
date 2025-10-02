import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BarChart3, Calendar, Settings, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import logoHorizontal from "@/assets/logo-brighter.png";

const Demo = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <img src={logoHorizontal} alt="Brighter" className="h-8" />
              <span className="ml-3 font-montserrat font-bold text-xl">Risk Pro</span>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-montserrat text-4xl md:text-5xl font-bold mb-4">
              Demonstração do Sistema
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Conheça as principais funcionalidades do Brighter Risk Pro
            </p>
          </div>

          <div className="grid gap-8 mb-12">
            {/* Dashboard Demo */}
            <Card className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-montserrat text-2xl font-bold mb-3">Dashboard Completo</h2>
                  <p className="text-muted-foreground mb-4">
                    Visualize suas métricas de performance em tempo real. Acompanhe seu capital, 
                    resultado mensal, risco diário disponível e muito mais em um painel intuitivo.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-card p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Capital Total</p>
                      <p className="text-2xl font-bold text-success">R$ 50.000,00</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Resultado Mensal</p>
                      <p className="text-2xl font-bold text-primary">+R$ 3.450,00</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
                      <p className="text-2xl font-bold">67%</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Calendar Demo */}
            <Card className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-8 h-8 text-success" />
                </div>
                <div className="flex-1">
                  <h2 className="font-montserrat text-2xl font-bold mb-3">Calendário de Trades</h2>
                  <p className="text-muted-foreground mb-4">
                    Heatmap visual dos seus resultados diários. Identifique padrões, melhores dias 
                    da semana e acompanhe sua evolução ao longo do tempo.
                  </p>
                  <div className="bg-card p-6 rounded-lg border">
                    <div className="grid grid-cols-7 gap-2">
                      {[...Array(28)].map((_, i) => {
                        const colors = ["bg-success/80", "bg-danger/80", "bg-muted", "bg-success/50"];
                        const color = colors[Math.floor(Math.random() * colors.length)];
                        return (
                          <div key={i} className={`aspect-square rounded ${color}`} />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Risk Management Demo */}
            <Card className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-danger/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Settings className="w-8 h-8 text-danger" />
                </div>
                <div className="flex-1">
                  <h2 className="font-montserrat text-2xl font-bold mb-3">Gestão de Risco Automática</h2>
                  <p className="text-muted-foreground mb-4">
                    Defina seu risco mensal e o sistema calcula automaticamente o stop diário ideal 
                    para Índice e Dólar, ajustando conforme seus resultados.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-card p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-2">Stop Diário - Índice</p>
                      <p className="text-xl font-bold">150 pontos</p>
                      <p className="text-sm text-muted-foreground mt-1">R$ 30,00 / contrato</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-2">Stop Diário - Dólar</p>
                      <p className="text-xl font-bold">15 pontos</p>
                      <p className="text-sm text-muted-foreground mt-1">R$ 150,00 / contrato</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Analytics Demo */}
            <Card className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-montserrat text-2xl font-bold mb-3">Análise Avançada</h2>
                  <p className="text-muted-foreground mb-4">
                    Gráficos de evolução de capital, análise de setups, tags personalizadas e 
                    relatórios exportáveis para tomar decisões baseadas em dados reais.
                  </p>
                  <div className="bg-card p-6 rounded-lg border">
                    <div className="h-40 flex items-end gap-2">
                      {[...Array(12)].map((_, i) => {
                        const height = Math.random() * 100 + 30;
                        const isPositive = Math.random() > 0.4;
                        return (
                          <div key={i} className="flex-1 flex flex-col justify-end">
                            <div 
                              className={`w-full rounded-t ${isPositive ? 'bg-success' : 'bg-danger'}`}
                              style={{ height: `${height}%` }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      Evolução mensal de resultados
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <Link to="/checkout">
              <Button size="lg" className="text-lg px-12 py-6">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
