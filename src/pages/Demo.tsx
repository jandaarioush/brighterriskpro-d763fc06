import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { VideoModal } from "@/components/VideoModal";
import { usePhoneMask } from "@/hooks/usePhoneMask";
import { 
  Calculator, 
  Shield, 
  TrendingUp, 
  Bell, 
  FileText, 
  Headphones, 
  Target, 
  Upload, 
  Activity,
  Lock,
  CheckCircle,
  MessageCircle,
  Star,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  whatsapp: z.string().regex(/^\+55\s\(\d{2}\)\s\d{5}-\d{4}$/, "WhatsApp no formato +55 (11) 97048-1021"),
  lgpd: z.boolean().refine(val => val === true, "Você precisa aceitar os termos")
});

type FormData = z.infer<typeof formSchema>;

const features = [
  {
    icon: Calculator,
    title: "Cálculo Dinâmico",
    description: "Risco diário e mensal calculado automaticamente baseado nos seus parâmetros"
  },
  {
    icon: Shield,
    title: "Stops Automáticos",
    description: "Metas e travas consistentes com sua gestão de risco"
  },
  {
    icon: TrendingUp,
    title: "Gráficos de Evolução",
    description: "Acompanhe seu desempenho diário, semanal e mensal"
  },
  {
    icon: Bell,
    title: "Alertas Visuais",
    description: "Notificações de excesso de risco e travas acionadas"
  },
  {
    icon: FileText,
    title: "Import/Export CSV",
    description: "Integração com planilhas para importar e exportar dados"
  },
  {
    icon: Headphones,
    title: "Suporte Humano",
    description: "Atendimento personalizado quando você precisar"
  }
];

const steps = [
  {
    icon: Target,
    number: "01",
    title: "Defina seu risco",
    description: "Configure seu risco mensal e perfil operacional"
  },
  {
    icon: Upload,
    number: "02",
    title: "Registre operações",
    description: "Lance suas operações ou conecte sua planilha"
  },
  {
    icon: Activity,
    number: "03",
    title: "Opere com disciplina",
    description: "Deixe o sistema ajustar o risco e avisar sobre desvios"
  }
];

const testimonials = [
  {
    name: "Carlos Silva",
    role: "Day Trader - Mini-índice",
    text: "Desde que comecei a usar o Brighter Risk Pro, minha disciplina melhorou 100%. Não opero mais no escuro.",
    rating: 5
  },
  {
    name: "Marina Costa",
    role: "Swing Trader - Mini-dólar",
    text: "A gestão de risco automática me economiza horas por semana. Recomendo para qualquer trader sério.",
    rating: 5
  },
  {
    name: "Roberto Almeida",
    role: "Trader Profissional",
    text: "Ferramenta indispensável. Os alertas visuais me salvaram de vários drawdowns desnecessários.",
    rating: 5
  }
];

export default function Demo() {
  const [showModal, setShowModal] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const phoneInput = usePhoneMask("+55 ");
  const playerRef = useRef<any>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lgpd: false
    }
  });

  // Capturar UTM parameters
  const getUTMParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content: params.get('utm_content'),
      utm_term: params.get('utm_term')
    };
  };

  // Analytics events
  useEffect(() => {
    console.log('Analytics: view_demo', getUTMParams());
  }, []);

  const trackEvent = (eventName: string, data?: any) => {
    console.log(`Analytics: ${eventName}`, { ...data, ...getUTMParams() });
  };

  // YouTube IFrame API
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      playerRef.current = new (window as any).YT.Player('youtube-player', {
        events: {
          onStateChange: (event: any) => {
            if (event.data === 0) { // Video ended
              setShowModal(true);
              trackEvent('video_completed');
            }
          }
        }
      });
    };
  }, []);

  // Sticky CTA on scroll (mobile)
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) {
        setShowStickyCTA(window.scrollY > 600);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', { ...data, ...getUTMParams() });
    trackEvent('form_submit', data);
    toast.success("Cadastro recebido! Em breve entraremos em contato.");
    // TODO: Integrar com backend/CRM
  };

  const handleCTAClick = (source: string, url: string) => {
    trackEvent(`cta_test_${source}`);
    window.open(url, '_blank');
  };

  const handleWhatsAppClick = () => {
    trackEvent('cta_whatsapp');
    window.open('https://wa.me/5511970481021?text=Quero%20testar%20o%20Brighter%20Risk%20Pro', '_blank');
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>Brighter Risk Pro — Gestão de Risco para Traders</title>
        <meta name="description" content="Gestão de risco dinâmica, metas e travas inteligentes. Disciplina operacional com o Brighter Risk Pro." />
        <meta property="og:title" content="Brighter Risk Pro — Gestão de Risco para Traders" />
        <meta property="og:description" content="Gestão de risco dinâmica, metas e travas inteligentes." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src="/src/assets/logo-brighter.png" alt="Brighter Risk Pro" className="h-8" />
              <span className="font-bold text-lg hidden sm:inline">Brighter Risk Pro</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCTAClick('navbar_monthly', 'https://pay.kiwify.com.br/mRJhvxj')}
                className="hidden sm:inline-flex"
              >
                Conta Mensal
              </Button>
              <Button 
                size="sm"
                onClick={() => handleCTAClick('navbar_annual', 'https://pay.kiwify.com.br/dPyrB1E')}
              >
                Conta Anual
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 lg:py-20">
          <div className="grid lg:grid-cols-[1.2fr,1fr] gap-8 lg:gap-12 items-start">
            {/* Left Column - Video */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Brighter Risk Pro — Gestão de Risco em tempo real, do jeito certo.
                </h1>
                <p className="text-lg text-muted-foreground">
                  Pare de operar no escuro: transforme risco em direção, todos os dias. 
                  Latência zero visual • Cálculo dinâmico • Disciplina operacional.
                </p>
              </div>

              {/* YouTube Video */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted shadow-lg">
                <iframe
                  id="youtube-player"
                  src="https://www.youtube.com/embed/Q6EzShwpwXw?enablejsapi=1"
                  title="Vídeo de demonstração do Brighter Risk Pro"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right Column - Conversion Card */}
            <div ref={formRef}>
              <Card className="sticky top-24 shadow-xl bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-2xl">Comece Agora</CardTitle>
                  <CardDescription>
                    Preencha os dados e crie sua conta em segundos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input 
                        id="name" 
                        placeholder="Seu nome"
                        {...register("name")}
                      />
                      {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input 
                        id="email" 
                        type="email"
                        placeholder="seu@email.com"
                        {...register("email")}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input 
                        id="whatsapp"
                        value={phoneInput.value}
                        onChange={(e) => {
                          const masked = phoneInput.handleChange(e.target.value);
                          setValue("whatsapp", masked, { shouldValidate: true });
                        }}
                        placeholder="+55 (11) 97048-1021"
                      />
                      {errors.whatsapp && <p className="text-sm text-destructive">{errors.whatsapp.message}</p>}
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="lgpd"
                        onCheckedChange={(checked) => setValue("lgpd", checked === true)}
                      />
                      <label htmlFor="lgpd" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                        Autorizo o contato e concordo com os <Link to="/termos-de-uso" className="text-primary hover:underline">Termos de Uso</Link> e <Link to="/politica-privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
                      </label>
                    </div>
                    {errors.lgpd && <p className="text-sm text-destructive">{errors.lgpd.message}</p>}

                    <Button type="submit" size="lg" className="w-full">
                      Criar Conta Agora
                    </Button>

                    <Button 
                      type="button"
                      variant="outline" 
                      size="lg" 
                      className="w-full"
                      onClick={handleWhatsAppClick}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Falar no WhatsApp
                    </Button>

                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
                      <div className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Dados criptografados
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Sem spam
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Tudo que você precisa para operar com disciplina
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Recursos profissionais que transformam a gestão de risco em vantagem competitiva
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="w-10 h-10 text-primary mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Como funciona
            </h2>
            <p className="text-muted-foreground text-lg">
              3 passos simples para começar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="bg-card border-border h-full">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 relative">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <step.icon className="w-8 h-8 text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {step.number}
                      </div>
                    </div>
                    <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                </Card>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-primary w-8 h-8" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Social Proof */}
        <section className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-primary text-primary" />
              ))}
              <span className="text-2xl font-bold ml-2">4.9</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              +1.000 traders confiam no Brighter Risk Pro
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card border-border">
                <CardHeader>
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardDescription className="text-base text-foreground mb-4">
                    "{testimonial.text}"
                  </CardDescription>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Perguntas Frequentes
            </h2>
          </div>

          <Accordion type="single" collapsible className="max-w-3xl mx-auto">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                Funciona para mini-índice e mini-dólar?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Sim, o Brighter Risk Pro é totalmente parametrizável e funciona para qualquer ativo. 
                Você pode configurar seus parâmetros específicos para mini-índice, mini-dólar ou qualquer outro mercado.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Consigo exportar meus resultados?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Sim! Você pode exportar todos os seus dados em formato CSV/planilha a qualquer momento. 
                Também é possível importar operações de planilhas externas.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Posso cancelar o plano mensal quando quiser?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Sim, você pode cancelar a qualquer momento. Ao cancelar, não haverá nova cobrança no mês seguinte. 
                Seu acesso permanece ativo até o fim do período já pago.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Qual a política de cancelamento e reembolso?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Você tem 7 dias de garantia total após a compra, válido tanto para o plano mensal quanto anual. 
                Dentro desse período, oferecemos reembolso integral. Após 7 dias, não há devoluções ou reembolsos, 
                mas você pode cancelar para não renovar automaticamente.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-y border-border">
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Pronto para operar com disciplina e clareza?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se a mais de 1.000 traders que já transformaram sua gestão de risco
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="text-lg px-8 py-6"
                onClick={() => handleCTAClick('final_monthly', 'https://pay.kiwify.com.br/mRJhvxj')}
              >
                Criar minha conta mensal agora!
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => handleCTAClick('final_annual', 'https://pay.kiwify.com.br/dPyrB1E')}
              >
                Criar minha conta anual agora!
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-muted/50 border-t border-border">
          <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-bold mb-4">Contato</h3>
                <p className="text-sm text-muted-foreground mb-2">contato@brighter.com.br</p>
                <p className="text-sm text-muted-foreground">+55 11 97048-1021</p>
              </div>
              <div>
                <h3 className="font-bold mb-4">Links Rápidos</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/termos-de-uso" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
                  <li><Link to="/politica-privacidade" className="hover:text-primary transition-colors">Política de Privacidade</Link></li>
                  <li><Link to="/suporte" className="hover:text-primary transition-colors">Suporte</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4">Horário de Atendimento</h3>
                <p className="text-sm text-muted-foreground">Segunda a sexta: 09:00 as 18:00</p>
              </div>
            </div>
            <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
              <p>© 2025 Brighter. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>

        {/* Sticky Mobile CTA */}
        {showStickyCTA && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur border-t border-border shadow-lg">
            <Button 
              size="lg" 
              className="w-full"
              onClick={scrollToForm}
            >
              Testar Agora
            </Button>
          </div>
        )}

        {/* Video End Modal */}
        <VideoModal 
          open={showModal}
          onOpenChange={setShowModal}
          onCreateAccount={() => {
            trackEvent('cta_test_modal');
            window.open('https://pay.kiwify.com.br/mRJhvxj', '_blank');
          }}
          onWhatsApp={handleWhatsAppClick}
        />
      </div>
    </>
  );
}
