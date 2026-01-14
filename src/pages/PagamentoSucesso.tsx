import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ExternalLink, ArrowRight } from "lucide-react";
import { ThemeLogo } from "@/components/ThemeLogo";

export default function PagamentoSucesso() {
  const [searchParams] = useSearchParams();
  
  const receiptUrl = searchParams.get("receipt_url");
  const orderNsu = searchParams.get("order_nsu");
  const captureMethod = searchParams.get("capture_method");
  const transactionNsu = searchParams.get("transaction_nsu");

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return "Pagamento";
    switch (method.toLowerCase()) {
      case "pix":
        return "PIX";
      case "credit_card":
        return "Cartão de Crédito";
      case "debit_card":
        return "Cartão de Débito";
      default:
        return method;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <ThemeLogo className="h-8 w-8" />
            <span className="font-montserrat font-bold text-xl">Brighter Risk Pro</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="max-w-lg w-full p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-success" />
            </div>
            <h1 className="font-montserrat text-3xl font-bold mb-2">
              Pagamento Confirmado!
            </h1>
            <p className="text-muted-foreground">
              Sua assinatura do Brighter Risk Pro foi ativada com sucesso.
            </p>
          </div>

          {/* Payment Details */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left space-y-3">
            {orderNsu && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nº do Pedido:</span>
                <span className="font-mono text-sm">{orderNsu}</span>
              </div>
            )}
            {captureMethod && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Forma de Pagamento:</span>
                <span>{getPaymentMethodLabel(captureMethod)}</span>
              </div>
            )}
            {transactionNsu && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID da Transação:</span>
                <span className="font-mono text-sm truncate max-w-[180px]">{transactionNsu}</span>
              </div>
            )}
          </div>

          {/* Receipt Link */}
          {receiptUrl && (
            <a
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
            >
              <ExternalLink className="w-4 h-4" />
              Ver comprovante de pagamento
            </a>
          )}

          {/* Next Steps */}
          <div className="border-t border-border pt-6 mt-6 space-y-4">
            <h2 className="font-semibold text-lg">Próximos passos</h2>
            <p className="text-muted-foreground text-sm">
              Você receberá um email com instruções para criar sua conta. 
              Se você já tem uma conta, basta fazer login para acessar todos os recursos.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/primeiro-acesso" className="flex-1">
                <Button className="w-full" size="lg">
                  Criar minha conta
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/auth" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Dúvidas? Entre em contato pelo{" "}
            <Link to="/suporte" className="text-primary hover:underline">
              suporte
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
