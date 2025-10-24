import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Download, Trash2, FileText } from "lucide-react";

const LGPD = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-6">
            <h1 className="font-montserrat text-5xl md:text-6xl font-bold">
              Conformidade com a LGPD
            </h1>
            <p className="text-xl text-muted-foreground">
              Lei Geral de Proteção de Dados Pessoais - Lei nº 13.709/2018
            </p>
          </div>
        </div>
      </section>

      {/* Introdução */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-montserrat font-bold mb-6">
              Nosso Compromisso com a LGPD
            </h2>
            <p className="text-muted-foreground mb-4">
              O Brighter Risk Pro está totalmente comprometido com a proteção dos seus dados pessoais e em conformidade com a Lei Geral de Proteção de Dados (LGPD). Tratamos seus dados com transparência, segurança e respeito aos seus direitos.
            </p>
            <p className="text-muted-foreground">
              Esta página explica como implementamos os princípios da LGPD e quais são seus direitos como titular de dados.
            </p>
          </Card>

          {/* Princípios */}
          <h2 className="text-3xl font-montserrat font-bold mb-8">
            Princípios que Seguimos
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="p-6">
              <Shield className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Finalidade</h3>
              <p className="text-muted-foreground text-sm">
                Coletamos dados apenas para propósitos legítimos, específicos e informados a você.
              </p>
            </Card>

            <Card className="p-6">
              <Lock className="w-10 h-10 text-success mb-4" />
              <h3 className="font-semibold text-lg mb-2">Segurança</h3>
              <p className="text-muted-foreground text-sm">
                Utilizamos medidas técnicas e administrativas para proteger seus dados contra acessos não autorizados.
              </p>
            </Card>

            <Card className="p-6">
              <Eye className="w-10 h-10 text-danger mb-4" />
              <h3 className="font-semibold text-lg mb-2">Transparência</h3>
              <p className="text-muted-foreground text-sm">
                Fornecemos informações claras sobre como seus dados são tratados e compartilhados.
              </p>
            </Card>

            <Card className="p-6">
              <FileText className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Responsabilização</h3>
              <p className="text-muted-foreground text-sm">
                Demonstramos a adoção de medidas eficazes de proteção de dados e prevenção de incidentes.
              </p>
            </Card>
          </div>

          {/* Direitos do Titular */}
          <Card className="p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-montserrat font-bold mb-6">
              Seus Direitos como Titular de Dados
            </h2>
            <p className="text-muted-foreground mb-6">
              De acordo com a LGPD, você tem os seguintes direitos em relação aos seus dados pessoais:
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <Eye className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Direito de Acesso</h3>
                  <p className="text-muted-foreground text-sm">
                    Solicitar e obter confirmação sobre a existência de tratamento de dados e acesso aos seus dados pessoais.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <FileText className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Direito de Correção</h3>
                  <p className="text-muted-foreground text-sm">
                    Solicitar a correção de dados incompletos, inexatos ou desatualizados.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Download className="w-6 h-6 text-danger flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Direito de Portabilidade</h3>
                  <p className="text-muted-foreground text-sm">
                    Solicitar a portabilidade dos seus dados para outro fornecedor de serviço ou produto.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Trash2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Direito de Eliminação</h3>
                  <p className="text-muted-foreground text-sm">
                    Solicitar a eliminação de dados pessoais tratados com seu consentimento, exceto quando houver obrigação legal de retenção.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Shield className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Direito de Informação</h3>
                  <p className="text-muted-foreground text-sm">
                    Obter informações sobre as entidades públicas e privadas com as quais compartilhamos seus dados.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Lock className="w-6 h-6 text-danger flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Direito de Revogação de Consentimento</h3>
                  <p className="text-muted-foreground text-sm">
                    Revogar o consentimento dado para o tratamento de dados a qualquer momento.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Base Legal */}
          <Card className="p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-montserrat font-bold mb-6">
              Base Legal para Tratamento de Dados
            </h2>
            <p className="text-muted-foreground mb-4">
              Tratamos seus dados pessoais com base nas seguintes hipóteses legais:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span><strong>Consentimento:</strong> Quando você nos autoriza expressamente</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span><strong>Execução de contrato:</strong> Para fornecer os serviços contratados</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span><strong>Legítimo interesse:</strong> Para melhorar nossos serviços e segurança</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span><strong>Obrigação legal:</strong> Quando exigido por lei ou regulação</span>
              </li>
            </ul>
          </Card>

          {/* Segurança */}
          <Card className="p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-montserrat font-bold mb-6">
              Medidas de Segurança
            </h2>
            <p className="text-muted-foreground mb-4">
              Implementamos as seguintes medidas de segurança para proteger seus dados:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-success">✓</span>
                <span>Criptografia SSL/TLS para transmissão de dados</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success">✓</span>
                <span>Criptografia de dados sensíveis em repouso</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success">✓</span>
                <span>Controle de acesso restrito aos dados</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success">✓</span>
                <span>Backups regulares e seguros</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success">✓</span>
                <span>Monitoramento contínuo de ameaças</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success">✓</span>
                <span>Treinamento regular da equipe sobre proteção de dados</span>
              </li>
            </ul>
          </Card>


          {/* CTA */}
          <Card className="p-8 bg-primary/5 border-primary/30">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-montserrat font-bold">
                Exercer Seus Direitos
              </h2>
              <p className="text-muted-foreground">
                Para exercer qualquer um de seus direitos previstos na LGPD, entre em contato conosco
              </p>
              <Button size="lg">
                Fazer uma Solicitação
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default LGPD;