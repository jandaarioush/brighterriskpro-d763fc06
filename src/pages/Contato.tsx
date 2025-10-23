import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contato = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve.",
    });
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="font-montserrat text-5xl md:text-6xl font-bold">
              Entre em Contato
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Estamos prontos para atender você
            </p>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Formulário */}
            <div>
              <h2 className="font-montserrat text-3xl font-bold mb-6">
                Envie uma Mensagem
              </h2>
              <p className="text-muted-foreground mb-8">
                Preencha o formulário abaixo e responderemos o mais breve possível.
              </p>

              <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
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
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

            {/* Informações */}
            <div>
              <h2 className="font-montserrat text-3xl font-bold mb-6">
                Informações de Contato
              </h2>

              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex gap-4">
                    <Mail className="w-6 h-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Email</h3>
                      <p className="text-muted-foreground">contato@brighter.com.br</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex gap-4">
                    <Phone className="w-6 h-6 text-success flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Telefone</h3>
                      <p className="text-muted-foreground">+55 11 97048-1021</p>
                      <p className="text-muted-foreground">WhatsApp: +55 11 97048-1021</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex gap-4">
                    <MapPin className="w-6 h-6 text-danger flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Endereço</h3>
                      <p className="text-muted-foreground">
                        Avenida Paulista, 1636, Sala 1105<br />
                        São Paulo - SP<br />
                        CEP: 01310-200<br />
                        Edifício Paulista Corporate
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex gap-4">
                    <Clock className="w-6 h-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Horário de Atendimento</h3>
                      <p className="text-muted-foreground">
                        Segunda a sexta: 09:00 as 18:00
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

export default Contato;