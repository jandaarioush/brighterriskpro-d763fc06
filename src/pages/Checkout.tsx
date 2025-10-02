import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, CreditCard, Lock } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import logoHorizontal from "@/assets/logo-brighter.png";
import { useState } from "react";
import { toast } from "sonner";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "monthly";
  const isAnnual = plan === "annual";
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Pagamento processado com sucesso!");
    // TODO: Integrate with payment gateway
  };

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
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="order-2 lg:order-1">
            <h1 className="font-montserrat text-3xl font-bold mb-8">Finalizar Compra</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="p-6">
                <h2 className="font-montserrat text-xl font-bold mb-4">Dados Pessoais</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="João Silva"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="joao@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      required
                      value={formData.cpf}
                      onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="font-montserrat text-xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Dados do Cartão
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Número do Cartão</Label>
                    <Input
                      required
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome no Cartão</Label>
                    <Input
                      required
                      value={formData.cardName}
                      onChange={(e) => setFormData({...formData, cardName: e.target.value})}
                      placeholder="JOÃO SILVA"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Validade</Label>
                      <Input
                        required
                        value={formData.cardExpiry}
                        onChange={(e) => setFormData({...formData, cardExpiry: e.target.value})}
                        placeholder="MM/AA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CVV</Label>
                      <Input
                        required
                        value={formData.cardCvv}
                        onChange={(e) => setFormData({...formData, cardCvv: e.target.value})}
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Pagamento 100% seguro e criptografado</span>
              </div>

              <Button type="submit" size="lg" className="w-full text-lg py-6">
                Finalizar Pagamento
              </Button>
            </form>
          </div>

          {/* Plan Details */}
          <div className="order-1 lg:order-2">
            <Card className="p-8 sticky top-24">
              <h2 className="font-montserrat text-2xl font-bold mb-6">Resumo do Pedido</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">Plano Premium</h3>
                    <p className="text-sm text-muted-foreground">
                      {isAnnual ? "Pagamento anual" : "Assinatura mensal"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl">
                      R$ {isAnnual ? "497,00" : "97,00"}
                    </p>
                    {isAnnual && (
                      <p className="text-xs text-muted-foreground">acesso por 1 ano</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-3">
                {[
                  "Métricas avançadas de performance",
                  "Relatórios exportáveis (PDF/Excel)",
                  "Integração com APIs de corretoras",
                  "Heatmaps e gráficos personalizados",
                  "Sistema de gamificação e conquistas",
                  "Suporte prioritário 24/7",
                  "Backup automático em nuvem",
                  "Modo noturno/claro automático"
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-success-foreground" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="border-t mt-6 pt-6">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">R$ {isAnnual ? "497,00" : "97,00"}</span>
                </div>
                {!isAnnual && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Renovação automática a cada mês
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
