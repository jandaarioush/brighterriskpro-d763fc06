import { ReactNode } from 'react';
import HubSidebar from './HubSidebar';
import { ThemeToggle } from './ThemeToggle';
import { useLocalClock } from '@/hooks/useLocalClock';
import { formatDigitalClock } from '@/lib/formatting';
import { Clock } from 'lucide-react';

interface DashboardLayoutWrapperProps {
  children: ReactNode;
}

export default function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
  const now = useLocalClock(1000);
  const clockTime = formatDigitalClock(now);

  return (
    <div className="min-h-screen flex w-full bg-background bg-grain dark:bg-radial-dark">
      <HubSidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-end gap-4 px-6 py-3 border-b border-border/40 bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-mono-trading font-semibold tabular-nums text-foreground">
              {clockTime}
            </span>
            <span className="text-[10px] text-muted-foreground">(BRT)</span>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
