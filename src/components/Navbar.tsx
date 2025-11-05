import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, List, Settings, Activity, Shield, Users, Webhook, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logoHorizontal from "@/assets/logo-brighter.png";

export function Navbar() {
  const location = useLocation();
  const { user, signOut, isAdmin } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center">
            <img src={logoHorizontal} alt="Brighter" className="h-8" />
            <span className="ml-3 font-montserrat font-bold text-xl">Risk Pro</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                isActive("/dashboard")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="font-medium hidden md:inline">Home</span>
            </Link>
            
            <Link
              to="/calendar"
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                isActive("/calendar")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="font-medium hidden md:inline">Calendário</span>
            </Link>
            
            <Link
              to="/trades"
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                isActive("/trades")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <List className="w-4 h-4" />
              <span className="font-medium hidden md:inline">Trades</span>
            </Link>

            <Link
              to="/simulator"
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                isActive("/simulator")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span className="font-medium hidden md:inline">Simulador</span>
            </Link>

            <Link
              to="/settings"
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                isActive("/settings")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="font-medium hidden md:inline">Configurações</span>
            </Link>

            {isAdmin && (
              <>
                <Link
                  to="/admin/users"
                  className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                    isActive("/admin/users")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="font-medium hidden md:inline">Usuários</span>
                </Link>
                
                <Link
                  to="/admin/webhooks"
                  className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                    isActive("/admin/webhooks")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Webhook className="w-4 h-4" />
                  <span className="font-medium hidden md:inline">Webhooks</span>
                </Link>
                
                <Link
                  to="/admin/reports"
                  className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                    isActive("/admin/reports")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-medium hidden md:inline">Relatórios</span>
                </Link>
              </>
            )}

            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
              {isAdmin && (
                <Badge variant="default" className="gap-1">
                  <Shield className="w-3 h-3" />
                  Admin
                </Badge>
              )}
              <span className="text-sm text-muted-foreground hidden md:inline">
                {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}