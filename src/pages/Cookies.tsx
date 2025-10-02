import { Card } from "@/components/ui/card";

const Cookies = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-6">
            <h1 className="font-montserrat text-5xl md:text-6xl font-bold">
              Política de Cookies
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
              <h2 className="text-2xl font-montserrat font-bold mb-4">O que são Cookies?</h2>
              <p className="text-muted-foreground mb-6">
                Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você visita um site. Eles são amplamente utilizados para fazer os sites funcionarem de forma mais eficiente e fornecer informações aos proprietários do site.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">Como Usamos Cookies</h2>
              <p className="text-muted-foreground mb-6">
                O Brighter Risk Pro utiliza cookies para melhorar sua experiência, analisar o uso da plataforma, personalizar conteúdo e garantir a segurança. Ao continuar usando nosso site, você concorda com o uso de cookies conforme descrito nesta política.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">Tipos de Cookies que Utilizamos</h2>

              <h3 className="text-xl font-semibold mb-3">1. Cookies Essenciais</h3>
              <p className="text-muted-foreground mb-4">
                Necessários para o funcionamento básico do site. Sem eles, você não conseguiria fazer login ou usar recursos importantes.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>session_token:</strong> Mantém você conectado durante a sessão</li>
                <li><strong>user_preferences:</strong> Salva suas configurações de tema e idioma</li>
                <li><strong>security_token:</strong> Protege contra ataques CSRF</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2. Cookies de Performance</h3>
              <p className="text-muted-foreground mb-4">
                Ajudam-nos a entender como os visitantes usam o site, permitindo melhorias na experiência.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>analytics_id:</strong> Rastreia páginas visitadas e tempo de uso</li>
                <li><strong>performance_metrics:</strong> Mede velocidade de carregamento</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">3. Cookies de Funcionalidade</h3>
              <p className="text-muted-foreground mb-4">
                Permitem que o site lembre suas escolhas e ofereça recursos aprimorados.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>theme_preference:</strong> Salva modo claro/escuro</li>
                <li><strong>dashboard_layout:</strong> Memoriza layout personalizado</li>
                <li><strong>notification_settings:</strong> Preferências de notificação</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4. Cookies de Marketing</h3>
              <p className="text-muted-foreground mb-4">
                Usados para rastrear visitantes em sites e exibir anúncios relevantes.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>ad_preference:</strong> Personaliza anúncios exibidos</li>
                <li><strong>conversion_tracking:</strong> Mede eficácia de campanhas</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">Cookies de Terceiros</h2>
              <p className="text-muted-foreground mb-4">
                Utilizamos serviços de terceiros que também podem definir cookies:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Google Analytics:</strong> Análise de tráfego e comportamento</li>
                <li><strong>Stripe:</strong> Processamento seguro de pagamentos</li>
                <li><strong>Intercom:</strong> Chat de suporte ao cliente</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">Duração dos Cookies</h2>
              <p className="text-muted-foreground mb-4">
                Os cookies podem ser:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Cookies de sessão:</strong> Temporários, deletados quando você fecha o navegador</li>
                <li><strong>Cookies persistentes:</strong> Permanecem até expirarem ou serem deletados manualmente (até 12 meses)</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">Como Controlar Cookies</h2>
              <p className="text-muted-foreground mb-4">
                Você tem controle total sobre os cookies:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Configurações do navegador:</strong> Bloqueie ou delete cookies nas configurações</li>
                <li><strong>Painel de preferências:</strong> Gerencie categorias de cookies em Configurações → Privacidade</li>
                <li><strong>Opt-out de terceiros:</strong> Use ferramentas como Google Analytics Opt-out</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">Impacto de Bloquear Cookies</h2>
              <p className="text-muted-foreground mb-4">
                Se você bloquear ou deletar cookies, algumas funcionalidades podem não funcionar corretamente:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Você pode precisar fazer login sempre que visitar o site</li>
                <li>Preferências e configurações podem não ser salvas</li>
                <li>Alguns recursos personalizados podem não estar disponíveis</li>
                <li>A experiência geral pode ser degradada</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">Atualizações desta Política</h2>
              <p className="text-muted-foreground mb-6">
                Podemos atualizar esta política de cookies periodicamente para refletir mudanças em nossas práticas ou por razões legais. Recomendamos revisar esta página regularmente.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">Mais Informações</h2>
              <p className="text-muted-foreground mb-6">
                Para mais informações sobre como usamos cookies e protegemos seus dados, consulte nossa Política de Privacidade completa.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">Contato</h2>
              <p className="text-muted-foreground">
                Se você tiver dúvidas sobre nossa política de cookies:<br />
                Email: privacidade@brighterriskpro.com<br />
                Telefone: (11) 3000-0000
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Cookies;