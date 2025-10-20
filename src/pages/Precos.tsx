import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";

const Precos = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="font-montserrat text-5xl md:text-6xl font-bold">
              Planos e Preços
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Escolha o plano ideal para suas necessidades de gestão de risco
            </p>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plano Mensal */}
            <Card className="p-8 border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                Mais Popular
              </div>
              <div className="text-center mb-8">
                <h3 className="font-montserrat text-2xl font-bold mb-2">Premium Mensal</h3>
                <div className="mb-4">
                  <span className="text-5xl font-montserrat font-bold">R$ 97</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <p className="text-muted-foreground">Cancele quando quiser</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="font-semibold">Trades ilimitados</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Métricas avançadas de performance</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Relatórios exportáveis (PDF/Excel)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Integração com APIs de corretoras</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Heatmaps e gráficos personalizados</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Suporte prioritário 24/7</span>
                </li>
              </ul>

              <Link to="/checkout?plan=monthly">
                <Button size="lg" className="w-full">
                  Assinar Agora
                </Button>
              </Link>
            </Card>

            {/* Plano Anual */}
            <Card className="p-8 border-2 border-success">
              <div className="text-center mb-8">
                <h3 className="font-montserrat text-2xl font-bold mb-2">Premium Anual</h3>
                <div className="mb-2">
                  <span className="text-5xl font-montserrat font-bold">R$ 497</span>
                </div>
                <p className="text-xs text-success font-semibold mb-2">Economize R$ 667</p>
                <p className="text-muted-foreground text-sm">acesso por 1 ano</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="font-semibold">Tudo do plano mensal</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Backup automático em nuvem</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Sistema de gamificação</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Modo noturno/claro automático</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="font-semibold">43% de desconto</span>
                </li>
              </ul>

              <Link to="/checkout?plan=annual">
                <Button size="lg" className="w-full" variant="outline">
                  Pagamento à Vista
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-montserrat text-4xl font-bold text-center mb-12">
            Perguntas Frequentes
          </h2>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-muted-foreground">
                Sim! No plano mensal, você pode cancelar quando quiser sem taxas adicionais.
              </p>
            </Card>


            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2">Qual a diferença entre mensal e anual?</h3>
              <p className="text-muted-foreground">
                O plano anual oferece 43% de desconto e recursos exclusivos de backup e gamificação.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2">Os dados ficam seguros?</h3>
              <p className="text-muted-foreground">
                Sim! Utilizamos criptografia de ponta e backup automático para garantir a segurança total dos seus dados.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Precos;