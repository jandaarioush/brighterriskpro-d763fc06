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
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Trades from "./pages/Trades";
import Simulator from "./pages/Simulator";
import Settings from "./pages/Settings";
import AdminWebhooks from "./pages/AdminWebhooks";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";
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
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trades"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Trades />
                </ProtectedRoute>
              }
            />
            <Route
              path="/simulator"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Simulator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/webhooks"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <Navbar />
                    <AdminWebhooks />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <Navbar />
                    <AdminUsers />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <Navbar />
                    <AdminReports />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
