import React, { useState, useEffect } from "react";

type Tab = "dashboard" | "library" | "study";

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoggedIn(true);
    }
  };

  const handleGuest = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: "100vh", padding: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: "400px", width: "100%", padding: "24px", border: "1px solid #e5e7eb", borderRadius: "12px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", marginBottom: "8px" }}>YiShan</h1>
          <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "24px" }}>Login to continue</p>
          
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "14px" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "16px" }}
                placeholder="111@111.com"
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "14px" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "16px" }}
                placeholder="111"
              />
            </div>
            <button type="submit" style={{ padding: "12px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
              Login
            </button>
          </form>
          
          <button onClick={handleGuest} style={{ width: "100%", marginTop: "16px", padding: "12px", backgroundColor: "transparent", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer" }}>
            Guest Access
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "16px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "20px", fontWeight: "bold" }}>YiShan</div>
        <button onClick={() => setIsLoggedIn(false)} style={{ padding: "8px 16px", backgroundColor: "transparent", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer" }}>
          Logout
        </button>
      </header>
      
      <nav style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
        {(["dashboard", "library", "study"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ flex: 1, padding: "12px", border: "none", borderBottom: tab === t ? "2px solid #4f46e5" : "2px solid transparent", backgroundColor: tab === t ? "#f3f4f6" : "white", cursor: "pointer", textTransform: "capitalize" }}
          >
            {t}
          </button>
        ))}
      </nav>
      
      <main style={{ flex: 1, padding: "24px" }}>
        {tab === "dashboard" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>Welcome!</h2>
            <p style={{ color: "#6b7280" }}>You are logged in as {email || "Guest"}</p>
            <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
              <div style={{ padding: "16px", backgroundColor: "#f3f4f6", borderRadius: "12px" }}>
                <div style={{ fontSize: "24px", fontWeight: "bold" }}>50</div>
                <div style={{ fontSize: "14px", color: "#6b7280" }}>Words Learned</div>
              </div>
              <div style={{ padding: "16px", backgroundColor: "#f3f4f6", borderRadius: "12px" }}>
                <div style={{ fontSize: "24px", fontWeight: "bold" }}>20</div>
                <div style={{ fontSize: "14px", color: "#6b7280" }}>Mastered</div>
              </div>
            </div>
          </div>
        )}
        {tab === "library" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>Library</h2>
            <p style={{ color: "#6b7280" }}>Vocabulary books will appear here.</p>
          </div>
        )}
        {tab === "study" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>Study</h2>
            <p style={{ color: "#6b7280" }}>Start a study session here.</p>
          </div>
        )}
      </main>
    </div>
  );
}