// BISECT step 1 — BrowserRouter + ThemeProvider
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

const Home = () => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", background: "#050505", color: "#fafafa" }}>
    <div style={{ textAlign: "center" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Bisect step 1 — Router + ThemeProvider</h1>
      <p style={{ opacity: 0.7 }}>Se você ler isso no domínio publicado, BrowserRouter e next-themes estão OK.</p>
    </div>
  </div>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
