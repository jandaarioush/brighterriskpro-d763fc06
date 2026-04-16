// BISECT step 2 — + QueryClient, TooltipProvider, Toaster, Sonner
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const queryClient = new QueryClient();

const Home = () => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", background: "#050505", color: "#fafafa" }}>
    <div style={{ textAlign: "center" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Bisect step 2 — + Query/Tooltip/Toaster/Sonner</h1>
      <p style={{ opacity: 0.7 }}>Se você ler isso no domínio publicado, esses 4 providers estão OK.</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<Home />} />
          </Routes>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
