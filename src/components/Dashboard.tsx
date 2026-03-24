import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Award, Clock, Target, BookOpen, ChevronRight, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { api } from '../services/auth';

interface DashboardProps {
  user: { id: string; email: string; name?: string };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, onLogout }) => {
  const [stats, setStats] = useState({
    total_words: 0,
    mastered_words: 0,
    study_time: 0,
    test_count: 0
  });
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentWords, setRecentWords] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load stats
      const statsData = await api.getStats(user.id);
      setStats({
        total_words: statsData.total_words_learned || 0,
        mastered_words: statsData.mastered_words || 0,
        study_time: statsData.total_study_time || 0,
        test_count: 0
      });
      
      // Load prediction
      const pred = await api.getPrediction(user.id, 'gaokao');
      setPrediction(pred);
      
      // Load recent books
      const books = await api.getBooks();
      setRecentWords(books.slice(0, 3));
    } catch (e) {
      console.error('Failed to load data:', e);
      // Use mock data for demo
      setStats({
        total_words: 50,
        mastered_words: 20,
        study_time: 3600,
        test_count: 5
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds/60)}m`;
    return `${Math.floor(seconds/3600)}h ${Math.floor((seconds%3600)/60)}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 pb-20">
      {/* User Header */}
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Welcome back</p>
            <h2 className="text-2xl font-bold">{user.name || user.email}</h2>
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
            <CardTitle className="text-sm text-muted-foreground">Total Learned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total_words}</div>
            <p className="text-xs text-muted-foreground">words</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Mastered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.mastered_words}</div>
            <p className="text-xs text-muted-foreground">words</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Study Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{formatTime(stats.study_time)}</div>
            <p className="text-xs text-muted-foreground">total time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Predicted</CardTitle>
          </CardHeader>
          <CardContent>
            {prediction ? (
              <>
                <div className="text-3xl font-bold text-purple-600">{prediction.predicted_score}</div>
                <p className="text-xs text-muted-foreground">{prediction.exam_type} max {prediction.max_score}</p>
              </>
            ) : (
              <div className="text-lg font-bold">--</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          className="h-14" 
          onClick={() => onNavigate('library')}
        >
          <BookOpen size={20} className="mr-2" />
          Library
        </Button>
        <Button 
          className="h-14" 
          onClick={() => onNavigate('study')}
        >
          <Activity size={20} className="mr-2" />
          Study Now
        </Button>
      </div>

      {/* Recent Books */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Vocabulary Books</h3>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('library')}>
            View All <ChevronRight size={16} />
          </Button>
        </div>
        <div className="space-y-2">
          {recentWords.map((book: any) => (
            <Card key={book.id} className="cursor-pointer hover:bg-accent transition" onClick={() => onNavigate('library')}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{book.name}</p>
                  <p className="text-xs text-muted-foreground">{book.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{book.word_count}</p>
                  <p className="text-xs text-muted-foreground">words</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;