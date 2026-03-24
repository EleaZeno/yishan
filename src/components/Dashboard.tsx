import React, { useState, useEffect } from "react";
import { Activity, BookOpen, Award, Clock, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

interface DashboardProps {
  user: { id?: string; email?: string; name?: string } | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, onLogout }) => {
  const [stats, setStats] = useState({
    total_words: 50,
    mastered_words: 20,
    study_time: 3600,
    tests: 5
  });
  const [loading, setLoading] = useState(false);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <div className="space-y-6 p-4 pb-20">
      {/* User Header */}
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Welcome back</p>
            <h2 className="text-2xl font-bold">{user?.name || user?.email || "Guest"}</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="text-white hover:bg-white/20"
          >
            <LogOut size={16} className="mr-1" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Activity size={16} className="text-primary" />
              Total Learned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total_words}</div>
            <p className="text-xs text-muted-foreground">words</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Award size={16} className="text-green-500" />
              Mastered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.mastered_words}</div>
            <p className="text-xs text-muted-foreground">words</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock size={16} className="text-blue-500" />
              Study Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{formatTime(stats.study_time)}</div>
            <p className="text-xs text-muted-foreground">total time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Activity size={16} className="text-purple-500" />
              Tests Taken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.tests}</div>
            <p className="text-xs text-muted-foreground">practice tests</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button className="h-14" onClick={() => onNavigate("library")}>
          <BookOpen size={20} className="mr-2" />
          Browse Books
        </Button>
        <Button className="h-14" onClick={() => onNavigate("study")}>
          <Activity size={20} className="mr-2" />
          Start Study
        </Button>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Welcome to YiShan! Start learning vocabulary today.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => onNavigate("library")}>
              Browse Library
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate("practice")}>
              Practice Mode
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;