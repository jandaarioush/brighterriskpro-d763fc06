// BISECT MODE: minimal App to isolate which provider/lib breaks the production bundle.
// Original App preserved at src/App.full.tsx.bak — restore after diagnosis.
const App = () => {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", background: "#050505", color: "#fafafa" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Bisect step 0 — bare React</h1>
        <p style={{ opacity: 0.7 }}>If you can read this on the published domain, React itself is fine.</p>
      </div>
    </div>
  );
};

export default App;
