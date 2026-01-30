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
              Última atualização: 29 de Janeiro de 2026
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8 md:p-12">
            <div className="prose prose-slate max-w-none">
              <p className="text-muted-foreground mb-6">
                A presente Política de Privacidade descreve como a <strong>Brighter Inc</strong> e a <strong>Brighter Sphere</strong> (doravante denominadas "Brighter") coletam, utilizam, armazenam e protegem os dados pessoais de seus usuários, em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD).
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">1. Quem Somos</h2>
              <p className="text-muted-foreground mb-6">
                A Brighter Inc é uma empresa de tecnologia e educação financeira, e a Brighter Sphere é uma comunidade educacional voltada para traders e investidores. Atuamos como controladoras dos dados pessoais tratados em nossos serviços, plataformas, cursos, ferramentas e comunidades online.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">2. Quais Dados Coletamos</h2>
              <p className="text-muted-foreground mb-4">
                Podemos coletar os seguintes dados pessoais:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Dados de identificação:</strong> nome completo, e-mail, telefone/WhatsApp, cidade, estado;</li>
                <li><strong>Dados de pagamento:</strong> informações de cobrança e transações (processadas por gateways de pagamento como Kiwify e InfinitePay);</li>
                <li><strong>Dados de uso:</strong> histórico de navegação, interações com a plataforma, desempenho em cursos e mentorias;</li>
                <li><strong>Dados de comunicação:</strong> mensagens enviadas por e-mail, chat ou formulários;</li>
                <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, dispositivo, sistema operacional, cookies;</li>
                <li><strong>Dados sensíveis:</strong> não coletamos dados sensíveis de forma intencional.</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">3. Como Coletamos os Dados</h2>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Formulários de cadastro e inscrição;</li>
                <li>Interação com nossos canais de comunicação;</li>
                <li>Uso de nossas plataformas e ferramentas;</li>
                <li>Participação em eventos, lives e comunidades;</li>
                <li>Cookies e tecnologias similares.</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">4. Finalidade do Uso dos Dados</h2>
              <p className="text-muted-foreground mb-4">
                Utilizamos seus dados para:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Fornecer, operar e melhorar nossos serviços;</li>
                <li>Processar pagamentos e gerenciar assinaturas;</li>
                <li>Enviar comunicações administrativas e de suporte;</li>
                <li>Personalizar sua experiência educacional;</li>
                <li>Realizar análises internas e aprimorar produtos;</li>
                <li>Cumprir obrigações legais e regulatórias;</li>
                <li>Prevenir fraudes e garantir segurança.</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">5. Base Legal para o Tratamento</h2>
              <p className="text-muted-foreground mb-4">
                Os dados são tratados com base nas seguintes hipóteses legais da LGPD:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Consentimento (Art. 7º, I):</strong> quando você aceita expressamente;</li>
                <li><strong>Execução de contrato (Art. 7º, V):</strong> para prestação de serviços adquiridos;</li>
                <li><strong>Legítimo interesse (Art. 7º, IX):</strong> para comunicação e melhorias;</li>
                <li><strong>Cumprimento de obrigação legal (Art. 7º, II):</strong> conforme exigido por autoridades.</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">6. Compartilhamento de Dados</h2>
              <p className="text-muted-foreground mb-4">
                Seus dados poderão ser compartilhados com:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Provedores de serviços:</strong> hospedagem, pagamentos, e-mail marketing, análise de dados;</li>
                <li><strong>Plataformas de terceiros:</strong> como WhatsApp, Discord, Zoom, Notion e similares;</li>
                <li><strong>Autoridades legais:</strong> quando exigido por lei, ordem judicial ou administrativa.</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                Não vendemos, alugamos ou comercializamos seus dados pessoais.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">7. Armazenamento e Segurança</h2>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Os dados são armazenados em servidores seguros, localizados no Brasil ou no exterior (com garantias de proteção);</li>
                <li>Utilizamos criptografia, firewalls, controle de acesso e outras medidas de segurança;</li>
                <li>Apesar das medidas adotadas, nenhum sistema é 100% seguro — por isso, incentivamos o uso de senhas fortes e cuidado no compartilhamento de informações.</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">8. Direitos do Titular</h2>
              <p className="text-muted-foreground mb-4">
                Você pode, a qualquer momento, exercer os seguintes direitos (Art. 18 da LGPD):
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Confirmar o tratamento de seus dados;</li>
                <li>Acessar seus dados pessoais;</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;</li>
                <li>Solicitar a portabilidade dos dados;</li>
                <li>Revogar consentimento a qualquer tempo.</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                Para exercer esses direitos, entre em contato com: <strong>contato@brighter.com.br</strong>
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">9. Cookies</h2>
              <p className="text-muted-foreground mb-6">
                Utilizamos cookies para melhorar sua experiência de navegação, lembrar preferências e coletar dados de desempenho. Você pode gerenciar os cookies diretamente em seu navegador, mas a desativação pode impactar algumas funcionalidades.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">10. Alterações nesta Política</h2>
              <p className="text-muted-foreground mb-6">
                Esta política pode ser atualizada a qualquer momento. Notificaremos sobre alterações relevantes por e-mail ou através de aviso em nossas plataformas.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">11. Contato</h2>
              <p className="text-muted-foreground">
                Para dúvidas, solicitações ou exercício de direitos, entre em contato:<br />
                <strong>E-mail:</strong> contato@brighter.com.br<br />
                <strong>Endereço:</strong> Avenida Paulista, 1636, Sala 1105 - São Paulo, SP - CEP: 01310-200 - Edifício Paulista Corporate
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PoliticaPrivacidade;
