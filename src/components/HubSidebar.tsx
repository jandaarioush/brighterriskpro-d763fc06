import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, TrendingUp, Globe, LayoutDashboard, ChevronLeft, ChevronRight, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import logoHorizontal from "@/assets/logo-brighter.png";

interface Dashboard {
  id: string;
  name: string;
  type: 'futuros' | 'acoes' | 'internacional';
}

const dashboardConfig = {
  futuros: {
    label: 'Futuros',
    icon: BarChart3,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-500/10',
    activeColor: 'bg-blue-500/20 border-l-2 border-blue-500',
  },
  acoes: {
    label: 'Ações',
    icon: TrendingUp,
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-500/10',
    activeColor: 'bg-green-500/20 border-l-2 border-green-500',
  },
  internacional: {
    label: 'Mercado Internacional',
    icon: Globe,
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-500/10',
    activeColor: 'bg-orange-500/20 border-l-2 border-orange-500',
  },
};

export default function HubSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      loadDashboards();
    }
  }, [user]);

  const loadDashboards = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboards')
        .select('id, name, type')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        await createDefaultDashboards();
      } else {
        setDashboards(data as Dashboard[]);
      }
    } catch (error) {
      console.error('Error loading dashboards:', error);
    }
  };

  const createDefaultDashboards = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('monthly_risk')
        .eq('id', user?.id)
        .single();

      const defaultDashboards = [
        { name: 'Futuros', type: 'futuros', icon: 'BarChart3' },
        { name: 'Ações', type: 'acoes', icon: 'TrendingUp' },
        { name: 'Mercado Internacional', type: 'internacional', icon: 'Globe' },
      ];

      const { data, error } = await supabase
        .from('dashboards')
        .insert(
          defaultDashboards.map(d => ({
            user_id: user?.id,
            name: d.name,
            type: d.type,
            icon: d.icon,
            monthly_risk: profileData?.monthly_risk || 0,
          }))
        )
        .select('id, name, type');

      if (error) throw error;
      setDashboards(data as Dashboard[]);
    } catch (error) {
      console.error('Error creating default dashboards:', error);
    }
  };

  const handleDashboardClick = (dashboard: Dashboard) => {
    if (dashboard.type === 'futuros') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${dashboard.id}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const isDashboardActive = (dashboard: Dashboard) => {
    if (dashboard.type === 'futuros') {
      return location.pathname === '/dashboard';
    }
    return location.pathname === `/dashboard/${dashboard.id}`;
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } min-h-screen bg-card border-r border-border flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src={logoHorizontal} alt="Brighter" className="h-6" />
            <span className="font-montserrat font-bold text-sm">Risk Pro</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={collapsed ? 'mx-auto' : ''}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {/* Visão Geral */}
        <div className="px-3 mb-4">
          {!collapsed && (
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
              Visão Geral
            </p>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 ${
                  isActive('/hub')
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'hover:bg-accent'
                } ${collapsed ? 'px-3' : ''}`}
                onClick={() => navigate('/hub')}
              >
                <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Dashboard Principal</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">Dashboard Principal</TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Meus Dashboards */}
        <div className="px-3">
          {!collapsed && (
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
              Meus Dashboards
            </p>
          )}
          <div className="space-y-1">
            {dashboards.map((dashboard) => {
              const config = dashboardConfig[dashboard.type];
              const IconComponent = config.icon;
              const active = isDashboardActive(dashboard);

              return (
                <Tooltip key={dashboard.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-3 ${
                        active ? config.activeColor : config.hoverColor
                      } ${collapsed ? 'px-3' : ''}`}
                      onClick={() => handleDashboardClick(dashboard)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${config.color} flex-shrink-0`} />
                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                      </div>
                      {!collapsed && <span>{dashboard.name}</span>}
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">{dashboard.name}</TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Configurações e Sair - próximo aos dashboards */}
        <div className="px-3 mt-4 space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 ${
                  isActive('/settings')
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                } ${collapsed ? 'px-3' : ''}`}
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Configurações</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Configurações</TooltipContent>}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 text-muted-foreground hover:text-foreground ${
                  collapsed ? 'px-3' : ''
                }`}
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Sair</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Sair</TooltipContent>}
          </Tooltip>
        </div>
      </nav>
    </aside>
  );
}
