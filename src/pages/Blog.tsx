import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";

const Blog = () => {
  const posts = [
    {
      title: "5 Erros Comuns na Gestão de Risco que Todo Trader Comete",
      excerpt: "Descubra os principais erros que podem estar sabotando seus resultados e como evitá-los.",
      date: "15 Mar 2025",
      readTime: "5 min",
      category: "Gestão de Risco"
    },
    {
      title: "Como Calcular o Tamanho Ideal de Posição para Day Trade",
      excerpt: "Aprenda a fórmula matemática para determinar quantos contratos operar em cada trade.",
      date: "12 Mar 2025",
      readTime: "8 min",
      category: "Educação"
    },
    {
      title: "Psicologia do Trading: Controlando Emoções em Operações de Alto Risco",
      excerpt: "Estratégias comprovadas para manter a disciplina mesmo nos momentos mais difíceis.",
      date: "10 Mar 2025",
      readTime: "6 min",
      category: "Psicologia"
    },
    {
      title: "Análise de Performance: Métricas que Realmente Importam",
      excerpt: "Vá além do lucro e prejuízo. Entenda quais indicadores são essenciais para evolução consistente.",
      date: "8 Mar 2025",
      readTime: "7 min",
      category: "Análise"
    },
    {
      title: "Índice vs Dólar: Qual Ativo Escolher para Day Trade?",
      excerpt: "Comparação completa entre os dois ativos mais operados no Brasil.",
      date: "5 Mar 2025",
      readTime: "10 min",
      category: "Mercados"
    },
    {
      title: "Gestão de Banca: O Segredo dos Traders Profissionais",
      excerpt: "Como proteger seu capital e crescer de forma sustentável no longo prazo.",
      date: "1 Mar 2025",
      readTime: "9 min",
      category: "Gestão de Risco"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="font-montserrat text-5xl md:text-6xl font-bold">
              Blog Brighter Risk Pro
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Conteúdo exclusivo sobre gestão de risco, trading e performance
            </p>
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-all group">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{post.date}</span>
                  <span>•</span>
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime}</span>
                </div>

                <div className="mb-4">
                  <span className="text-xs font-semibold text-primary">
                    {post.category}
                  </span>
                </div>

                <h3 className="font-montserrat text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>

                <p className="text-muted-foreground mb-6">
                  {post.excerpt}
                </p>

                <Button variant="ghost" className="group/btn p-0">
                  Ler mais
                  <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              Carregar Mais Artigos
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-12">
            <div className="text-center space-y-6">
              <h2 className="font-montserrat text-4xl font-bold">
                Assine Nossa Newsletter
              </h2>
              <p className="text-xl text-muted-foreground">
                Receba conteúdo exclusivo sobre trading e gestão de risco diretamente no seu email
              </p>
              <div className="flex gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Seu melhor email"
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-background"
                />
                <Button size="lg">
                  Assinar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Blog;