import { ReactNode } from 'react';
import HubSidebar from './HubSidebar';

interface DashboardLayoutWrapperProps {
  children: ReactNode;
}

export default function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <HubSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
