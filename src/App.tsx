import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import FirstAccess from "./pages/FirstAccess";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import Demo from "./pages/Demo";
import Hub from "./pages/Hub";
import Dashboard from "./pages/Dashboard";
import StockDashboard from "./pages/StockDashboard";
import Calendar from "./pages/Calendar";
import StockCalendar from "./pages/StockCalendar";
import Trades from "./pages/Trades";
import StockTrades from "./pages/StockTrades";
import Simulator from "./pages/Simulator";
import StockSimulator from "./pages/StockSimulator";
import Settings from "./pages/Settings";
import Portfolio from "./pages/Portfolio";
import WeeklyPortfolio from "./pages/WeeklyPortfolio";
import MonthlyPortfolio from "./pages/MonthlyPortfolio";
import AdminWebhooks from "./pages/AdminWebhooks";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";
import AdminEngagement from "./pages/AdminEngagement";
import NotFound from "./pages/NotFound";
import Recursos from "./pages/Recursos";
import Precos from "./pages/Precos";
import Suporte from "./pages/Suporte";
import Blog from "./pages/Blog";
import SobreNos from "./pages/SobreNos";
import Contato from "./pages/Contato";
import TermosDeUso from "./pages/TermosDeUso";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import Cookies from "./pages/Cookies";
import LGPD from "./pages/LGPD";
import UploadVideos from "./pages/UploadVideos";
import UploadAdmin from "./pages/UploadAdmin";
import { Navbar } from "./components/Navbar";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { AdminRoute } from "./components/AdminRoute";
import DashboardLayoutWrapper from "./components/DashboardLayoutWrapper";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/primeiro-acesso" element={<FirstAccess />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/recursos" element={<Recursos />} />
            <Route path="/precos" element={<Precos />} />
            <Route path="/suporte" element={<Suporte />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/sobre-nos" element={<SobreNos />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/termos-de-uso" element={<TermosDeUso />} />
            <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/lgpd" element={<LGPD />} />
            <Route path="/upload-videos" element={<UploadVideos />} />
            <Route path="/upload-admin" element={<UploadAdmin />} />
            <Route path="/hub" element={<ProtectedRoute><Hub /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/:dashboardId" element={<ProtectedRoute><StockDashboard /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><DashboardLayoutWrapper><Calendar /></DashboardLayoutWrapper></ProtectedRoute>} />
            <Route path="/calendar/:dashboardId" element={<ProtectedRoute><StockCalendar /></ProtectedRoute>} />
            <Route path="/trades" element={<ProtectedRoute><DashboardLayoutWrapper><Trades /></DashboardLayoutWrapper></ProtectedRoute>} />
            <Route path="/trades/:dashboardId" element={<ProtectedRoute><StockTrades /></ProtectedRoute>} />
            <Route path="/simulator" element={<ProtectedRoute><DashboardLayoutWrapper><Simulator /></DashboardLayoutWrapper></ProtectedRoute>} />
            <Route path="/simulator/:dashboardId" element={<ProtectedRoute><StockSimulator /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><DashboardLayoutWrapper><Settings /></DashboardLayoutWrapper></ProtectedRoute>} />
            <Route path="/portfolio/:dashboardId" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
            <Route path="/portfolio-weekly/:dashboardId" element={<ProtectedRoute><WeeklyPortfolio /></ProtectedRoute>} />
            <Route path="/portfolio-monthly/:dashboardId" element={<ProtectedRoute><MonthlyPortfolio /></ProtectedRoute>} />
            <Route path="/admin/webhooks" element={<ProtectedRoute><AdminRoute><DashboardLayoutWrapper><AdminWebhooks /></DashboardLayoutWrapper></AdminRoute></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminRoute><DashboardLayoutWrapper><AdminUsers /></DashboardLayoutWrapper></AdminRoute></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute><AdminRoute><DashboardLayoutWrapper><AdminReports /></DashboardLayoutWrapper></AdminRoute></ProtectedRoute>} />
            <Route path="/admin/engagement" element={<ProtectedRoute><AdminRoute><DashboardLayoutWrapper><AdminEngagement /></DashboardLayoutWrapper></AdminRoute></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
