import { Link, useLocation } from "react-router-dom";
import { TrendingUp, LayoutDashboard, List } from "lucide-react";

export function Navbar() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Brighter Risk Pro
            </span>
          </Link>
          
          <div className="flex gap-1">
            <Link
              to="/"
              className={`
                px-4 py-2 rounded-md flex items-center gap-2 transition-all
                ${isActive("/") 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }
              `}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="font-medium">Dashboard</span>
            </Link>
            
            <Link
              to="/trades"
              className={`
                px-4 py-2 rounded-md flex items-center gap-2 transition-all
                ${isActive("/trades") 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }
              `}
            >
              <List className="w-4 h-4" />
              <span className="font-medium">Trades</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
