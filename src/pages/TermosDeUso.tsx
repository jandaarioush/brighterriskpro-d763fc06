import { Card } from "@/components/ui/card";

const TermosDeUso = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-6">
            <h1 className="font-montserrat text-5xl md:text-6xl font-bold">
              Termos de Uso
            </h1>
            <p className="text-muted-foreground">
              Última atualização: 02 de Outubro de 2025
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8 md:p-12">
            <div className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-montserrat font-bold mb-4">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground mb-6">
                Ao acessar e usar o Brighter Risk Pro, você aceita e concorda em ficar vinculado aos termos e condições deste acordo. Se você não concordar com qualquer parte destes termos, não deverá usar nosso serviço.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground mb-6">
                O Brighter Risk Pro é uma plataforma de gestão de risco para traders que oferece ferramentas de cálculo automático de stop loss, registro de operações, análise de performance e outros recursos relacionados à gestão de trading.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">3. Registro e Conta</h2>
              <p className="text-muted-foreground mb-4">
                Para usar nossos serviços, você deve:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Ter pelo menos 18 anos de idade</li>
                <li>Fornecer informações precisas e completas durante o registro</li>
                <li>Manter a segurança de sua senha</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">4. Uso Aceitável</h2>
              <p className="text-muted-foreground mb-4">
                Você concorda em NÃO:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Usar o serviço para qualquer propósito ilegal</li>
                <li>Tentar acessar áreas restritas do sistema</li>
                <li>Compartilhar sua conta com terceiros</li>
                <li>Fazer engenharia reversa ou copiar qualquer parte do software</li>
                <li>Sobrecarregar ou interferir com o funcionamento do serviço</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">5. Pagamento e Assinaturas</h2>
              <p className="text-muted-foreground mb-6">
                Os planos pagos são cobrados mensalmente ou anualmente, conforme escolhido. O cancelamento pode ser feito a qualquer momento, mas não há reembolso proporcional. Reservamo-nos o direito de modificar os preços mediante notificação prévia de 30 dias.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">6. Propriedade Intelectual</h2>
              <p className="text-muted-foreground mb-6">
                Todo o conteúdo, recursos e funcionalidades do Brighter Risk Pro são propriedade exclusiva da empresa e estão protegidos por leis de direitos autorais, marcas registradas e outras leis de propriedade intelectual.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">7. Isenção de Responsabilidade</h2>
              <p className="text-muted-foreground mb-6">
                O Brighter Risk Pro é uma ferramenta de auxílio à gestão de risco. NÃO somos consultores financeiros e NÃO fornecemos recomendações de investimento. O trading envolve riscos significativos e você pode perder todo o seu capital. Use a plataforma por sua conta e risco.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">8. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground mb-6">
                Em nenhuma circunstância seremos responsáveis por quaisquer danos diretos, indiretos, incidentais, especiais ou consequenciais resultantes do uso ou incapacidade de usar nosso serviço.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">9. Modificações dos Termos</h2>
              <p className="text-muted-foreground mb-6">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre mudanças significativas via email ou através da plataforma. O uso continuado após as alterações constitui aceitação dos novos termos.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">10. Rescisão</h2>
              <p className="text-muted-foreground mb-6">
                Podemos suspender ou encerrar sua conta a qualquer momento, sem aviso prévio, por violação destes termos ou por qualquer motivo que considerarmos apropriado.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">11. Lei Aplicável</h2>
              <p className="text-muted-foreground mb-6">
                Estes termos são regidos pelas leis da República Federativa do Brasil. Quaisquer disputas serão resolvidas nos tribunais de São Paulo, SP.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">12. Contato</h2>
              <p className="text-muted-foreground">
                Para questões sobre estes termos, entre em contato conosco em: contato@brighter.com.br
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default TermosDeUso;