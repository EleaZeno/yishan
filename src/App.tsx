import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Layout from "./components/Layout";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import Library from "./components/Library";
import StudySession from "./components/StudySession";
import Practice from "./components/Practice";
import DiagnosticCenter from "./components/DiagnosticCenter";
import VocabTest from "./components/VocabTest";
import { authService, api } from "./services/auth";

type Tab = "dashboard" | "library" | "study" | "practice" | "tests" | "diagnostic";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Quick auth check
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      await authService.login(email, password);
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (e: any) {
      alert(e.message || "Login failed");
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setActiveTab("dashboard");
  };

  const navigate = (tab: string) => {
    setActiveTab(tab as Tab);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard user={user} onNavigate={navigate} onLogout={handleLogout} />;
      case "library":
        return <Library userId={user?.id} onBack={() => setActiveTab("dashboard")} />;
      case "study":
        return <StudySession userId={user?.id} onComplete={() => setActiveTab("dashboard")} />;
      case "practice":
        return <Practice userId={user?.id} />;
      case "tests":
        return <VocabTest userId={user?.id} />;
      default:
        return <Dashboard user={user} onNavigate={navigate} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Layout activeTab={activeTab} onTabChange={setActiveTab} user={user} />
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;