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

  const handleLoginSuccess = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsAuthenticated(true);
  };

  const handleGuestAccess = () => {
    // Create guest user
    const guestUser = { id: "guest", email: "guest@yishan.app", name: "Guest User" };
    setUser(guestUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setActiveTab("dashboard");
  };

  const handleAddClick = () => {
    // Placeholder for add word functionality
    alert("Add word feature coming soon!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} onGuestAccess={handleGuestAccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard user={user} onNavigate={(t) => setActiveTab(t as Tab)} onLogout={handleLogout} />;
      case "library":
        return <Library userId={user?.id} onBack={() => setActiveTab("dashboard")} />;
      case "study":
        return <StudySession userId={user?.id} onComplete={() => setActiveTab("dashboard")} />;
      case "practice":
        return <Practice userId={user?.id} />;
      case "tests":
        return <VocabTest userId={user?.id} />;
      case "diagnostic":
        return <DiagnosticCenter userId={user?.id} />;
      default:
        return <Dashboard user={user} onNavigate={(t) => setActiveTab(t as Tab)} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Layout 
        activeTab={activeTab} 
        onTabChange={(t) => setActiveTab(t as Tab)} 
        onAddClick={handleAddClick}
        user={user}
        onLogout={handleLogout}
      />
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;