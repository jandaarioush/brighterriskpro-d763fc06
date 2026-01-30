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
              Última atualização: 28 de Janeiro de 2026
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8 md:p-12">
            <div className="prose prose-slate max-w-none">
              {/* Introdução */}
              <p className="text-muted-foreground mb-6">
                Bem-vindo à <strong>Brighter Inc</strong>. Ao acessar nosso site, aplicativos, cursos, mentorias, comunidades e outros serviços digitais, você declara ter lido, compreendido e aceito integralmente estes Termos de Uso. Caso não concorde com algum item, solicitamos que não utilize nossos serviços.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">1. Sobre a Brighter Inc</h2>
              <p className="text-muted-foreground mb-6">
                A Brighter Inc é uma empresa de tecnologia e educação financeira que desenvolve e oferece ferramentas, cursos, mentorias e conteúdos digitais com foco em gestão de risco, análise de mercado e educação para traders e investidores.
              </p>
              <p className="text-muted-foreground mb-6">
                A Brighter Inc não é uma corretora de valores, gestora de recursos, casa de análise ou qualquer instituição financeira regulamentada pela CVM (Comissão de Valores Mobiliários). Não fazemos recomendações de compra ou venda de ativos, nem prestamos consultoria individualizada de investimento.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">2. Objeto dos Serviços</h2>
              <p className="text-muted-foreground mb-4">
                Os serviços oferecidos pela Brighter Inc têm caráter exclusivamente educacional e informativo, podendo incluir, sem limitação:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Cursos, treinamentos e workshops online;</li>
                <li>Mentorias individuais ou em grupo;</li>
                <li>Acesso a plataformas de conteúdo e ferramentas de apoio;</li>
                <li>Comunidades e grupos de estudo;</li>
                <li>Vídeos, artigos, materiais de apoio e planilhas;</li>
                <li>Qualquer outro serviço ou produto digital que venhamos a disponibilizar.</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                Todo o conteúdo é destinado à educação geral, não substituindo a assessoria de profissionais habilitados.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">3. Perfil do Usuário</h2>
              <p className="text-muted-foreground mb-4">
                Ao utilizar nossos serviços, você declara e garante que:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Possui 18 anos ou mais;</li>
                <li>Está utilizando os serviços de forma pessoal e intransferível;</li>
                <li>Forneceu informações verdadeiras no cadastro;</li>
                <li>Possui capacidade civil para firmar contratos.</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">4. Não Existe Promessa de Resultado</h2>
              <p className="text-muted-foreground mb-4">
                Deixamos absolutamente claro que:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Não prometemos ganhos financeiros</strong>, rentabilidade ou retorno de qualquer natureza;</li>
                <li>Nenhum conteúdo nosso constitui <strong>recomendação de investimento</strong>;</li>
                <li>O mercado de renda variável é de alto risco — perdas financeiras podem ocorrer;</li>
                <li>O sucesso depende exclusivamente da aplicação, disciplina e contexto individual de cada usuário.</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                Se alguém alegar que a Brighter Inc prometeu resultados financeiros, trata-se de informação falsa ou conduta irregular de terceiros, da qual não nos responsabilizamos.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">5. Responsabilidade do Usuário</h2>
              <p className="text-muted-foreground mb-4">
                Ao adquirir ou utilizar nossos serviços, você assume total responsabilidade por:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Suas decisões de investimento;</li>
                <li>Os resultados obtidos com a aplicação do que aprendeu;</li>
                <li>A análise de sua própria situação financeira antes de operar no mercado;</li>
                <li>O cumprimento de todas as leis e regulamentações aplicáveis.</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                A Brighter Inc não será responsável por perdas financeiras de qualquer natureza decorrentes da utilização de nossos conteúdos.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">6. Propriedade Intelectual</h2>
              <p className="text-muted-foreground mb-4">
                Todo o conteúdo disponibilizado pela Brighter Inc, incluindo vídeos, textos, imagens, planilhas, sistemas, logotipos, marcas, nomes comerciais e materiais de apoio, é de propriedade exclusiva da Brighter Inc ou de seus licenciantes.
              </p>
              <p className="text-muted-foreground mb-4">
                É expressamente proibido:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Reproduzir, copiar, distribuir, compartilhar, revender ou ceder qualquer material;</li>
                <li>Fazer download ou gravação de aulas para uso próprio ou de terceiros sem autorização;</li>
                <li>Utilizar os materiais para fins comerciais, cursos próprios ou repasse a terceiros.</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">7. Uso Indevido e Penalidades</h2>
              <p className="text-muted-foreground mb-4">
                Em caso de violação destes Termos, a Brighter Inc se reserva o direito de:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Suspender ou cancelar imediatamente o acesso do usuário;</li>
                <li>Aplicar multa contratual de até 100 (cem) salários mínimos por violação de direitos autorais;</li>
                <li>Tomar as medidas judiciais cabíveis, incluindo ações cíveis e criminais.</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">8. Pagamentos, Acessos e Cancelamentos</h2>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Os pagamentos são processados por terceiros (ex: Kiwify, InfinitePay);</li>
                <li>O acesso é liberado após a confirmação do pagamento;</li>
                <li>O cancelamento pode ser solicitado conforme as regras de cada produto;</li>
                <li>Não há reembolso proporcional após o período de garantia, exceto por acordo expresso.</li>
              </ul>

              <h2 className="text-2xl font-montserrat font-bold mb-4">9. Alterações dos Termos</h2>
              <p className="text-muted-foreground mb-6">
                A Brighter Inc pode alterar estes Termos a qualquer momento, mediante comunicação por e-mail ou aviso no site. O uso continuado dos serviços após as alterações implica aceitação dos novos termos.
              </p>

              <h2 className="text-2xl font-montserrat font-bold mb-4">10. Foro</h2>
              <p className="text-muted-foreground">
                Estes Termos são regidos pelas leis brasileiras. Eventuais disputas serão resolvidas no Foro da Comarca de São Paulo - SP, com renúncia a qualquer outro, por mais privilegiado que seja.
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default TermosDeUso;
