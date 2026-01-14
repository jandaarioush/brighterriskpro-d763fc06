import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, ArrowLeft, CreditCard, Shield } from "lucide-react";
import { ThemeLogo } from "@/components/ThemeLogo";
import { useToast } from "@/hooks/use-toast";
import { usePhoneMask } from "@/hooks/usePhoneMask";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(100, "Nome muito longo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  phone: z.string().min(12, "Telefone inválido").max(20, "Telefone muito longo"),
});

type Plan = "mensal" | "anual";

const plans = {
  mensal: {
    name: "Premium Mensal",
    price: 97,
    priceDisplay: "R$ 97",
    period: "/mês",
    description: "Cancele quando quiser",
    features: [
      "Trades ilimitados",
      "Métricas avançadas de performance",
      "Relatórios exportáveis (PDF/Excel)",
      "Heatmaps e gráficos personalizados",
      "Suporte prioritário 24/7",
    ],
  },
  anual: {
    name: "Premium Anual",
    price: 497,
    priceDisplay: "R$ 497",
    period: "/ano",
    description: "Economize R$ 667 (43% off)",
    features: [
      "Tudo do plano mensal",
      "Backup automático em nuvem",
      "Sistema de gamificação",
      "Modo noturno/claro automático",
      "43% de desconto",
    ],
  },
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("mensal");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { value: phone, handleChange: handlePhoneChange } = usePhoneMask("+55");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    const planoParam = searchParams.get("plano");
    if (planoParam === "mensal" || planoParam === "anual") {
      setSelectedPlan(planoParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate inputs
    const validation = customerSchema.safeParse({ name, email, phone });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-infinitepay-link`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plano: selectedPlan,
            customer: {
              name: name.trim(),
              email: email.trim().toLowerCase(),
              phone_number: phone,
            },
          }),
        }
      );

      const data = await response.json();

      if (!data.success || !data.checkout_url) {
        throw new Error(data.error || "Erro ao criar link de pagamento");
      }

      // Redirect to Infinite Pay checkout
      window.location.href = data.checkout_url;
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Erro no checkout",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
              <ThemeLogo className="h-8 w-8" />
              <span className="font-montserrat font-bold text-xl">Brighter Risk Pro</span>
            </Link>
            <Link to="/precos" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Voltar para preços
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-montserrat text-4xl font-bold mb-4">Finalize sua assinatura</h1>
            <p className="text-muted-foreground text-lg">
              Escolha seu plano e preencha seus dados para continuar
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Plan Selection */}
            <div className="space-y-6">
              <h2 className="font-semibold text-xl mb-4">1. Escolha seu plano</h2>
              
              <div className="space-y-4">
                {(["mensal", "anual"] as Plan[]).map((planKey) => {
                  const plan = plans[planKey];
                  const isSelected = selectedPlan === planKey;
                  return (
                    <Card
                      key={planKey}
                      className={`p-6 cursor-pointer transition-all ${
                        isSelected
                          ? "border-2 border-primary bg-primary/5"
                          : "border-2 border-transparent hover:border-muted"
                      }`}
                      onClick={() => setSelectedPlan(planKey)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            <h3 className="font-semibold text-lg">{plan.name}</h3>
                            {planKey === "anual" && (
                              <span className="bg-success/20 text-success text-xs px-2 py-0.5 rounded-full font-medium">
                                Melhor valor
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm ml-8">{plan.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold">{plan.priceDisplay}</span>
                          <span className="text-muted-foreground">{plan.period}</span>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <ul className="mt-4 ml-8 space-y-2">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <Check className="w-4 h-4 text-success" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Customer Form */}
            <div className="space-y-6">
              <h2 className="font-semibold text-xl mb-4">2. Seus dados</h2>
              
              <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      className={errors.name ? "border-destructive" : ""}
                      disabled={loading}
                    />
                    {errors.name && (
                      <p className="text-destructive text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className={errors.email ? "border-destructive" : ""}
                      disabled={loading}
                    />
                    {errors.email && (
                      <p className="text-destructive text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">WhatsApp / Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="+55 11 99999-9999"
                      className={errors.phone ? "border-destructive" : ""}
                      disabled={loading}
                    />
                    {errors.phone && (
                      <p className="text-destructive text-sm mt-1">{errors.phone}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Inclua o código do país (ex: +55 para Brasil)
                    </p>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-border pt-4 mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground">Plano selecionado:</span>
                      <span className="font-medium">{plans[selectedPlan].name}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span>{plans[selectedPlan].priceDisplay}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pagar com Infinite Pay
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Pagamento seguro processado pela Infinite Pay</span>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
