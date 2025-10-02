import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Users, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router-dom";

const SobreNos = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="font-montserrat text-5xl md:text-6xl font-bold">
              Sobre o Brighter Risk Pro
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nossa missão é ajudar traders a operarem com segurança e consistência através de gestão de risco inteligente
            </p>
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-6 text-lg">
            <p>
              O Brighter Risk Pro nasceu da necessidade real de traders que buscavam uma forma mais profissional e automatizada de gerenciar seus riscos no mercado financeiro brasileiro.
            </p>
            <p>
              Após anos operando day trade em Índice e Dólar, percebemos que a maior diferença entre traders consistentes e aqueles que fracassavam não estava nas estratégias de entrada e saída, mas sim na disciplina e gestão de risco.
            </p>
            <p>
              Foi assim que decidimos criar uma plataforma completa, focada exclusivamente em ajudar traders a protegerem seu capital, calcularem stops automaticamente e acompanharem sua evolução com métricas precisas.
            </p>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-montserrat text-4xl font-bold text-center mb-16">
            Nossos Valores
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <Target className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-montserrat text-2xl font-bold mb-3">Foco no Cliente</h3>
              <p className="text-muted-foreground">
                Cada funcionalidade é pensada para resolver problemas reais enfrentados por traders no dia a dia.
              </p>
            </Card>

            <Card className="p-8">
              <Users className="w-12 h-12 text-success mb-4" />
              <h3 className="font-montserrat text-2xl font-bold mb-3">Transparência</h3>
              <p className="text-muted-foreground">
                Acreditamos em comunicação clara, preços justos e métricas honestas sobre performance.
              </p>
            </Card>

            <Card className="p-8">
              <TrendingUp className="w-12 h-12 text-danger mb-4" />
              <h3 className="font-montserrat text-2xl font-bold mb-3">Inovação Contínua</h3>
              <p className="text-muted-foreground">
                Estamos sempre evoluindo a plataforma com base no feedback dos usuários e nas melhores práticas do mercado.
              </p>
            </Card>

            <Card className="p-8">
              <Award className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-montserrat text-2xl font-bold mb-3">Excelência</h3>
              <p className="text-muted-foreground">
                Buscamos a perfeição em cada detalhe, desde a experiência do usuário até a precisão dos cálculos.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Números */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-montserrat text-4xl font-bold text-center mb-16">
            Números que Falam por Si
          </h2>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-montserrat font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Traders Ativos</p>
            </div>
            <div>
              <div className="text-5xl font-montserrat font-bold text-success mb-2">50k+</div>
              <p className="text-muted-foreground">Trades Registrados</p>
            </div>
            <div>
              <div className="text-5xl font-montserrat font-bold text-danger mb-2">45%</div>
              <p className="text-muted-foreground">Redução em Drawdown</p>
            </div>
            <div>
              <div className="text-5xl font-montserrat font-bold text-primary mb-2">4.9/5</div>
              <p className="text-muted-foreground">Satisfação dos Usuários</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-montserrat text-4xl font-bold mb-6">
            Junte-se a Nós
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Faça parte da comunidade de traders que levam gestão de risco a sério
          </p>
          <Link to="/checkout">
            <Button size="lg" className="text-lg px-12 py-6">
              Criar Conta Agora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SobreNos;