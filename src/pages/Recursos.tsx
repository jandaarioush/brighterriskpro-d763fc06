import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, BarChart3, FileText, TrendingUp, Target, Calendar, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const Recursos = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="font-montserrat text-5xl md:text-6xl font-bold">
              Recursos Completos para
              <span className="block text-primary mt-2">Gestão de Risco</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Todas as ferramentas que você precisa para controlar e otimizar suas operações
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/checkout?plano=mensal">
                <Button size="lg" className="text-lg px-8 py-6">
                  Conta Mensal
                </Button>
              </Link>
              <Link to="/checkout?plano=anual">
                <Button size="lg" className="text-lg px-8 py-6" variant="outline">
                  Conta Anual
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos Principais */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-montserrat text-4xl font-bold mb-4">Recursos Principais</h2>
            <p className="text-xl text-muted-foreground">Ferramentas profissionais ao seu alcance</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-all">
              <Target className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-montserrat text-xl font-bold mb-3">Calculadora de Risco</h3>
              <p className="text-muted-foreground">
                Calcule automaticamente o stop loss ideal baseado no seu capital e risco mensal definido
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <BarChart3 className="w-12 h-12 text-success mb-4" />
              <h3 className="font-montserrat text-xl font-bold mb-3">Dashboard Inteligente</h3>
              <p className="text-muted-foreground">
                Visualize métricas em tempo real com gráficos interativos e heatmaps de performance
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <Calendar className="w-12 h-12 text-danger mb-4" />
              <h3 className="font-montserrat text-xl font-bold mb-3">Calendário de Trades</h3>
              <p className="text-muted-foreground">
                Acompanhe suas operações dia a dia com visualização de calendário e análise mensal
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <FileText className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-montserrat text-xl font-bold mb-3">Relatórios Exportáveis</h3>
              <p className="text-muted-foreground">
                Exporte seus dados em PDF ou Excel para análise detalhada e prestação de contas
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <Shield className="w-12 h-12 text-success mb-4" />
              <h3 className="font-montserrat text-xl font-bold mb-3">Gestão de Risco Automática</h3>
              <p className="text-muted-foreground">
                Ajuste automático do risco diário baseado no desempenho acumulado do mês
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <TrendingUp className="w-12 h-12 text-danger mb-4" />
              <h3 className="font-montserrat text-xl font-bold mb-3">Análise de Performance</h3>
              <p className="text-muted-foreground">
                Métricas avançadas incluindo win rate, payoff ratio, drawdown e expectativa matemática
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <Bell className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-montserrat text-xl font-bold mb-3">Alertas Inteligentes</h3>
              <p className="text-muted-foreground">
                Receba notificações quando atingir limites de risco ou metas de lucro
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <Shield className="w-12 h-12 text-danger mb-4" />
              <h3 className="font-montserrat text-xl font-bold mb-3">Backup em Nuvem</h3>
              <p className="text-muted-foreground">
                Seus dados sempre seguros com backup automático e sincronização em tempo real
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-montserrat text-4xl font-bold mb-6">
            Pronto para transformar sua gestão de risco?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Junte-se a centenas de traders que já estão operando com mais segurança
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/checkout?plano=mensal">
              <Button size="lg" className="text-lg px-12 py-6">
                Conta Mensal
              </Button>
            </Link>
            <Link to="/checkout?plano=anual">
              <Button size="lg" className="text-lg px-12 py-6" variant="outline">
                Conta Anual
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Recursos;