import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, HelpCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Suporte = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="font-montserrat text-5xl md:text-6xl font-bold">
              Suporte ao Cliente
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Estamos aqui para ajudar você a ter sucesso
            </p>
          </div>
        </div>
      </section>

      {/* Canais de Suporte */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-center mb-16">
            <Card className="p-8 text-center hover:shadow-lg transition-all max-w-md w-full">
              <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-montserrat text-xl font-bold mb-2">Email</h3>
              <p className="text-muted-foreground mb-4">
                Resposta em até 24 horas
              </p>
              <a href="mailto:contato@brighter.com.br" className="text-primary hover:underline">
                contato@brighter.com.br
              </a>
            </Card>
          </div>

          {/* Formulário de Contato */}
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-montserrat text-3xl font-bold mb-6">
                Entre em Contato
              </h2>
              <p className="text-muted-foreground mb-8">
                Preencha o formulário e nossa equipe entrará em contato o mais breve possível.
              </p>

              <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Assunto</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Enviar Mensagem
                  </Button>
                </form>
              </Card>
            </div>

            <div>
              <h2 className="font-montserrat text-3xl font-bold mb-6">
                Perguntas Frequentes
              </h2>
              
              <div className="space-y-4">
                <Card className="p-6">
                  <div className="flex gap-4">
                    <HelpCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Como resetar minha senha?</h3>
                      <p className="text-muted-foreground text-sm">
                        Na tela de login, clique em "Esqueci minha senha" e siga as instruções enviadas por email.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex gap-4">
                    <HelpCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Como exportar meus relatórios?</h3>
                      <p className="text-muted-foreground text-sm">
                        No Dashboard, clique no botão "Exportar" e escolha entre PDF ou Excel.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex gap-4">
                    <HelpCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Posso mudar de plano?</h3>
                      <p className="text-muted-foreground text-sm">
                        Sim! Você pode fazer upgrade ou downgrade a qualquer momento em Configurações → Assinatura.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Suporte;