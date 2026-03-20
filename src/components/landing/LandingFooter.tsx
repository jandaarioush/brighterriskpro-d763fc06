import { Link } from "react-router-dom";

export const LandingFooter = () => (
  <footer className="border-t border-[hsl(0,0%,100%,0.04)] py-12 px-6">
    <div className="container mx-auto max-w-6xl">
      <div className="grid md:grid-cols-4 gap-8 mb-10">
        <div>
          <h3 className="font-montserrat font-bold text-base mb-4">Brighter Risk Pro</h3>
          <p className="text-[hsl(0,0%,45%)] text-sm leading-relaxed" style={{ WebkitTextFillColor: 'initial' }}>
            Gestão de risco para traders que buscam longevidade no mercado.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-4 text-[hsl(0,0%,70%)]" style={{ WebkitTextFillColor: 'initial' }}>Produto</h4>
          <ul className="space-y-2 text-sm text-[hsl(0,0%,45%)]" style={{ WebkitTextFillColor: 'initial' }}>
            <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
            <li><Link to="/trades" className="hover:text-primary transition-colors">Trades</Link></li>
            <li><Link to="/recursos" className="hover:text-primary transition-colors">Recursos</Link></li>
            <li><Link to="/precos" className="hover:text-primary transition-colors">Preços</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-4 text-[hsl(0,0%,70%)]" style={{ WebkitTextFillColor: 'initial' }}>Empresa</h4>
          <ul className="space-y-2 text-sm text-[hsl(0,0%,45%)]" style={{ WebkitTextFillColor: 'initial' }}>
            <li><Link to="/suporte" className="hover:text-primary transition-colors">Suporte</Link></li>
            <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            <li><Link to="/sobre-nos" className="hover:text-primary transition-colors">Sobre Nós</Link></li>
            <li><Link to="/contato" className="hover:text-primary transition-colors">Contato</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-4 text-[hsl(0,0%,70%)]" style={{ WebkitTextFillColor: 'initial' }}>Legal</h4>
          <ul className="space-y-2 text-sm text-[hsl(0,0%,45%)]" style={{ WebkitTextFillColor: 'initial' }}>
            <li><Link to="/termos-de-uso" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
            <li><Link to="/politica-privacidade" className="hover:text-primary transition-colors">Privacidade</Link></li>
            <li><Link to="/cookies" className="hover:text-primary transition-colors">Cookies</Link></li>
            <li><Link to="/lgpd" className="hover:text-primary transition-colors">LGPD</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[hsl(0,0%,100%,0.04)] pt-8 text-center text-xs text-[hsl(0,0%,35%)]" style={{ WebkitTextFillColor: 'initial' }}>
        <p>&copy; 2025 Brighter Risk Pro. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>
);
