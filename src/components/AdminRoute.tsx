import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading, isAdmin, checkingRole } = useAuth();
  
  // Aguardar carregamento
  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Verificando permissões...</p>
        </div>
      </div>
    );
  }
  
  // Não autenticado
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Não é admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">
            🚫 Acesso Negado
          </h1>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm">
            Esta área é exclusiva para administradores.
          </p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
