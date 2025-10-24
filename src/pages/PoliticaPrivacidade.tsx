import { Card } from "@/components/ui/card";

const PoliticaPrivacidade = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-6">
            <h1 className="font-montserrat text-5xl md:text-6xl font-bold">
              Política de Privacidade
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
              <h2 className="text-2xl font-montserrat font-bold mb-4">1. Informações que Coletamos</h2>
              <p className="text-muted-foreground mb-4">
                Coletamos as seguintes informações quando você usa nosso serviço:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Informações de cadastro:</strong> nome, email, telefone, cidade, estado</li>
                <li><strong>Informações financeiras:</strong> dados de pagamento processados por provedores terceiros seguros</li>
                <li><strong>Dados de trading:</strong> operações registradas, configurações de risco, capital</li>
                <li><strong>Dados de uso:</strong> páginas visitadas, recursos utilizados, tempo de uso</li>
                <li><strong>Informações técnicas:</strong> endereço IP, tipo de navegador, dispositivo</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">2. Como Usamos suas Informações</h2>
              <p className="text-muted-foreground mb-4">
                Utilizamos suas informações para:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Processar pagamentos e gerenciar assinaturas</li>
                <li>Enviar notificações importantes sobre sua conta</li>
                <li>Personalizar sua experiência na plataforma</li>
                <li>Analisar o uso e melhorar funcionalidades</li>
                <li>Prevenir fraudes e garantir segurança</li>
                <li>Cumprir obrigações legais</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">3. Compartilhamento de Informações</h2>
              <p className="text-muted-foreground mb-4">
                NÃO vendemos suas informações pessoais. Podemos compartilhar dados apenas com:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Provedores de serviços:</strong> processadores de pagamento, hospedagem</li>
                <li><strong>Conformidade legal:</strong> quando exigido por lei ou ordem judicial</li>
                <li><strong>Proteção de direitos:</strong> para proteger nossos direitos, propriedade ou segurança</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">4. Segurança dos Dados</h2>
              <p className="text-muted-foreground mb-6">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, incluindo criptografia SSL/TLS, firewalls, controle de acesso restrito e backups regulares. No entanto, nenhum método de transmissão pela internet é 100% seguro.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">5. Retenção de Dados</h2>
              <p className="text-muted-foreground mb-6">
                Mantemos suas informações pessoais enquanto sua conta estiver ativa ou conforme necessário para fornecer nossos serviços. Após o cancelamento, seus dados podem ser mantidos por até 5 anos para fins legais e contábeis.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">6. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground mb-4">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a exclusão de dados desnecessários</li>
                <li>Revogar consentimento</li>
                <li>Solicitar portabilidade dos dados</li>
                <li>Obter informações sobre compartilhamento</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                Para exercer esses direitos, entre em contato: contato@brighter.com.br
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">7. Cookies e Tecnologias Similares</h2>
              <p className="text-muted-foreground mb-6">
                Utilizamos cookies para melhorar sua experiência, analisar o uso da plataforma e personalizar conteúdo. Você pode configurar seu navegador para recusar cookies, mas isso pode afetar a funcionalidade do serviço.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">8. Dados de Menores</h2>
              <p className="text-muted-foreground mb-6">
                Nosso serviço não é destinado a menores de 18 anos. Não coletamos intencionalmente informações de menores. Se você acredita que coletamos dados de um menor, entre em contato imediatamente.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">9. Transferência Internacional de Dados</h2>
              <p className="text-muted-foreground mb-6">
                Seus dados são armazenados em servidores localizados no Brasil. Se houver necessidade de transferência internacional, garantiremos proteção adequada conforme exigido pela LGPD.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">10. Alterações nesta Política</h2>
              <p className="text-muted-foreground mb-6">
                Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas via email ou através da plataforma. Recomendamos revisar esta página regularmente.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">11. Contato</h2>
              <p className="text-muted-foreground">
                Para dúvidas sobre esta política de privacidade:<br />
                Email: contato@brighter.com.br<br />
                Endereço: Avenida Paulista, 1636, Sala 1105 - São Paulo, SP - CEP: 01310-200 - Edifício Paulista Corporate
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PoliticaPrivacidade;