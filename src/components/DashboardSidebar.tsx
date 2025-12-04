import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  List, 
  Activity, 
  Settings, 
  Wallet,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import logoHorizontal from "@/assets/logo-brighter.png";

interface DashboardSidebarProps {
  dashboardId: string;
  dashboardType: string;
}

export function DashboardSidebar({ dashboardId, dashboardType }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const showPortfolio = dashboardType === 'acoes' || dashboardType === 'internacional';

  const menuItems = [
    { icon: Home, label: 'Home', path: `/dashboard/${dashboardId}` },
    { icon: Calendar, label: 'Calendário', path: `/calendar/${dashboardId}` },
    { icon: List, label: 'Trades', path: `/trades/${dashboardId}` },
    { icon: Activity, label: 'Simulador', path: `/simulator/${dashboardId}` },
    ...(showPortfolio ? [{ icon: Wallet, label: 'Carteira', path: `/portfolio/${dashboardId}` }] : []),
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  const typeColors = {
    futuros: 'border-blue-500/30',
    acoes: 'border-green-500/30',
    internacional: 'border-orange-500/30',
  };

  return (
    <div 
      className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className={cn(
        "p-4 border-b border-border flex items-center",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <Link to="/hub" className="flex items-center gap-2">
            <img src={logoHorizontal} alt="Brighter" className="h-6" />
          </Link>
        )}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Hub Link */}
      <div className="p-2">
        <Link
          to="/hub"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
            "text-muted-foreground hover:text-foreground hover:bg-accent",
            collapsed && "justify-center"
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Meus Dashboards</span>}
        </Link>
      </div>

      {/* Divider */}
      <div className={cn("mx-4 h-px bg-border", typeColors[dashboardType as keyof typeof typeColors])} />

      {/* Menu Items */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
                collapsed && "justify-center"
              )}
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Brighter Risk Pro
          </p>
        </div>
      )}
    </div>
  );
}
