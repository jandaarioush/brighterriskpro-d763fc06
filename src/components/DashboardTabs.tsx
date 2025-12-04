import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, FileText, Calculator, Settings, Wallet, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardTabsProps {
  dashboardId?: string;
  dashboardType: 'futuros' | 'acoes' | 'internacional';
}

export default function DashboardTabs({ dashboardId, dashboardType }: DashboardTabsProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isFuturos = dashboardType === 'futuros';
  const showCarteira = dashboardType === 'acoes' || dashboardType === 'internacional';

  const getCalendarPath = () => isFuturos ? '/calendar' : `/calendar/${dashboardId}`;
  const getTradesPath = () => isFuturos ? '/trades' : `/trades/${dashboardId}`;
  const getSimulatorPath = () => isFuturos ? '/simulator' : `/simulator/${dashboardId}`;
  const getSettingsPath = () => '/settings';

  const isActive = (path: string) => location.pathname === path;
  const isCarteiraActive = () => 
    location.pathname.includes('/portfolio-weekly/') || 
    location.pathname.includes('/portfolio-monthly/');

  const tabs = [
    { label: 'Calendário', icon: Calendar, path: getCalendarPath() },
    { label: 'Trades', icon: FileText, path: getTradesPath() },
    { label: 'Simulador', icon: Calculator, path: getSimulatorPath() },
  ];

  return (
    <div className="bg-card border-b border-border mb-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          {tabs.map((tab) => (
            <Button
              key={tab.path}
              variant="ghost"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive(tab.path)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
              onClick={() => navigate(tab.path)}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Button>
          ))}

          {/* Carteira Dropdown - apenas para Ações e Internacional */}
          {showCarteira && dashboardId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isCarteiraActive()
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Wallet className="h-4 w-4" />
                  <span>Carteira</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem
                  className={`cursor-pointer ${
                    location.pathname === `/portfolio-weekly/${dashboardId}` ? 'bg-accent' : ''
                  }`}
                  onClick={() => navigate(`/portfolio-weekly/${dashboardId}`)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Carteira Semanal
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`cursor-pointer ${
                    location.pathname === `/portfolio-monthly/${dashboardId}` ? 'bg-accent' : ''
                  }`}
                  onClick={() => navigate(`/portfolio-monthly/${dashboardId}`)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Carteira Mensal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive(getSettingsPath())
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
            onClick={() => navigate(getSettingsPath())}
          >
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
