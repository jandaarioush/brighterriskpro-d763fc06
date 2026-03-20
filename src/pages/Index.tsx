import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield, BarChart3, FileText, Star, TrendingUp, Target, Zap, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeLogo } from "@/components/ThemeLogo";
import logoHero from "@/assets/logo-hero.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="relative flex items-center justify-center h-16">
            {/* Logo à esquerda */}
            <Link to="/" className="absolute left-0 flex items-center">
              <ThemeLogo className="h-10" />
            </Link>
            
            {/* Navegação centralizada */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#recursos" className="text-muted-foreground hover:text-foreground transition-colors">
                Recursos
              </a>
              <a href="#beneficios" className="text-muted-foreground hover:text-foreground transition-colors">
                Benefícios
              </a>
              <a href="#planos" className="text-muted-foreground hover:text-foreground transition-colors">
                Planos
              </a>
            </nav>
            
            {/* Botões à direita */}
            <div className="absolute right-0 flex items-center gap-3">
              <Link to="/primeiro-acesso">
                <Button variant="outline">
                  1º acesso
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(217_91%_60%/0.1),transparent)]" />
        
        <div className="container relative mx-auto max-w-6xl">
          <div className="text-center space-y-8 animate-fade-in">
            <img 
              src={logoHero} 
              alt="Brighter Risk Pro" 
              className="h-32 md:h-40 mx-auto drop-shadow-lg"
            />
            <h1 className="font-montserrat text-5xl md:text-7xl font-bold tracking-tight">
              Domine seus Trades com
              <span className="block mt-2">Gestão de Risco Inteligente</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Controle total sobre suas operações de Índice e Dólar com cálculos automáticos de stop, risco diário e performance em tempo real
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/checkout?plano=mensal">
                <Button size="lg" className="text-lg px-8 py-6 group">
                  Criar Conta Mensal
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/checkout?plano=anual">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6 group">
                  Criar Conta Anual
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Ver Demonstração
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="recursos" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-montserrat text-4xl md:text-5xl font-bold mb-4">Como Funciona</h2>
            <p className="text-xl text-muted-foreground">Simples, automatizado e eficiente em 3 passos</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-glow transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-montserrat text-2xl font-bold mb-4">1. Defina seu Risco</h3>
              <p className="text-muted-foreground">
                Informe seu capital e risco mensal. O sistema calcula automaticamente o stop diário ideal para Índice e Dólar
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-glow transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-montserrat text-2xl font-bold mb-4">2. Registre Trades</h3>
              <p className="text-muted-foreground">
                Adicione suas operações e o sistema ajusta automaticamente o risco para os próximos dias.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-glow transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-danger" />
              </div>
              <h3 className="font-montserrat text-2xl font-bold mb-4">3. Acompanhe Resultados</h3>
              <p className="text-muted-foreground">
                Dashboard completo com gráficos, heatmaps e métricas de performance. Exporte relatórios e tome decisões informadas
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-montserrat text-4xl md:text-5xl font-bold mb-4">Por que Brighter Risk Pro?</h2>
            <p className="text-xl text-muted-foreground">Proteção e controle total sobre seu capital</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-success/30 bg-success/5">
              <Shield className="w-12 h-12 text-success mb-4" />
              <h3 className="font-montserrat text-2xl font-bold mb-3">Segurança Financeira</h3>
              <p className="text-muted-foreground">
                Cálculos automáticos de stop loss garantem que você nunca ultrapasse seu limite de risco diário ou mensal
              </p>
            </Card>

            <Card className="p-8 border-primary/30 bg-primary/5">
              <Zap className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-montserrat text-2xl font-bold mb-3">Controle Total</h3>
              <p className="text-muted-foreground">
                Visualize em tempo real seu desempenho, drawdown e ajustes automáticos de risco para cada dia útil
              </p>
            </Card>

            <Card className="p-8 border-danger/30 bg-danger/5">
              <FileText className="w-12 h-12 text-danger mb-4" />
              <h3 className="font-montserrat text-2xl font-bold mb-3">Relatórios Automáticos</h3>
              <p className="text-muted-foreground">
                Exporte seus dados em PDF/Excel, analise padrões e melhore sua consistência operacional
              </p>
            </Card>

            <Card className="p-8 border-primary/30 bg-primary/5">
              <BarChart3 className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-montserrat text-2xl font-bold mb-3">Dashboard Inteligente</h3>
              <p className="text-muted-foreground">
                Heatmaps, gráficos de evolução e métricas avançadas para decisões baseadas em dados
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-montserrat text-4xl md:text-5xl font-bold mb-4">O que dizem nossos usuários</h2>
            <p className="text-xl text-muted-foreground">Traders que transformaram sua gestão de risco</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Carlos Silva",
                role: "Day Trader - Índice",
                text: "Reduzi meu drawdown em 45% no primeiro mês. O cálculo automático de stop me salvou várias vezes.",
                rating: 5
              },
              {
                name: "Marina Costa",
                role: "Swing Trader - Dólar",
                text: "Finalmente consigo dormir tranquila sabendo que meu risco está controlado. Dashboard excelente!",
                rating: 5
              },
              {
                name: "Roberto Almeida",
                role: "Trader Profissional",
                text: "A melhor ferramenta de gestão que já usei. Vale cada centavo do plano premium.",
                rating: 5
              }
            ].map((testimonial, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-all">
                <div className="flex mb-4">
                  {Array(testimonial.rating).fill(0).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>
                <div className="border-t pt-4">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Plano Premium */}
      <section id="planos" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-montserrat text-4xl md:text-5xl font-bold mb-4">Plano Premium</h2>
            <p className="text-xl text-muted-foreground">Desbloqueie todo o potencial da plataforma</p>
          </div>

          <Card className="p-8 md:p-12 border-primary bg-gradient-to-br from-primary/10 to-background">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {[
            "Métricas avançadas de performance",
            "Relatórios exportáveis (PDF/Excel)",
            "Heatmaps e gráficos personalizados",
                "Sistema de gamificação e conquistas",
                "Suporte prioritário 24/7",
                "Backup automático em nuvem",
                "Modo noturno/claro automático"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-success-foreground" />
                  </div>
                  <span className="text-sm md:text-base">{feature}</span>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="p-8 bg-background/50 border-2 hover:border-primary transition-colors">
                <div className="text-center space-y-6">
                  <div>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl md:text-6xl font-montserrat font-bold">R$ 147</span>
                      <span className="text-muted-foreground text-lg">/mês</span>
                    </div>
                  </div>
                  <Link to="/checkout?plano=mensal" className="block">
                    <Button size="lg" className="text-lg px-12 py-6 w-full">
                      Conta Mensal
                    </Button>
                  </Link>
                </div>
              </Card>
              
              <Card className="p-8 bg-background/50 border-2 hover:border-primary transition-colors">
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl md:text-6xl font-montserrat font-bold">R$ 997</span>
                    </div>
                    <p className="text-xs text-muted-foreground">acesso por 1 ano</p>
                  </div>
                  <Link to="/checkout?plano=anual" className="block">
                    <Button size="lg" className="text-lg px-12 py-6 w-full">
                      Conta Anual
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-montserrat font-bold text-xl mb-4">Brighter Risk Pro</h3>
              <p className="text-muted-foreground text-sm">
                Gestão de risco inteligente para traders profissionais
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                <li><Link to="/trades" className="hover:text-primary transition-colors">Trades</Link></li>
                <li><Link to="/recursos" className="hover:text-primary transition-colors">Recursos</Link></li>
                <li><Link to="/precos" className="hover:text-primary transition-colors">Preços</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/suporte" className="hover:text-primary transition-colors">Suporte</Link></li>
                <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link to="/sobre-nos" className="hover:text-primary transition-colors">Sobre Nós</Link></li>
                <li><Link to="/contato" className="hover:text-primary transition-colors">Contato</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/termos-de-uso" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
                <li><Link to="/politica-privacidade" className="hover:text-primary transition-colors">Política de Privacidade</Link></li>
                <li><Link to="/cookies" className="hover:text-primary transition-colors">Cookies</Link></li>
                <li><Link to="/lgpd" className="hover:text-primary transition-colors">LGPD</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Brighter Risk Pro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;