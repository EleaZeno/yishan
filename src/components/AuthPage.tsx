import React, { useState } from 'react';
import { User, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { authService } from '../services/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';

interface AuthPageProps {
  onLoginSuccess: () => void;
  onGuestAccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onGuestAccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await authService.login(email, password);
        localStorage.setItem('yishan_token', response.token);
        localStorage.setItem('yishan_user', JSON.stringify(response.user));
      } else {
        const response = await authService.register(email, password);
        localStorage.setItem('yishan_token', response.token);
        localStorage.setItem('yishan_user', JSON.stringify(response.user));
      }
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-2xl mb-4 shadow-lg shadow-primary/20">
            忆
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLogin ? '欢迎回来' : '创建账号'}
          </CardTitle>
          <CardDescription>
            {isLogin ? '登录以同步你的学习进度' : '开启基于科学记忆算法的单词之旅'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="请输入至少6位密码"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                 {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-base font-bold"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
              {isLogin ? '立即登录' : '注册账号'}
            </Button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4">
             <Button 
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary"
             >
                {isLogin ? '还没有账号？ 立即注册' : '已有账号？ 去登录'}
             </Button>

             <div className="w-full flex items-center gap-3">
                <div className="h-px bg-border flex-1"></div>
                <span className="text-xs text-muted-foreground">或者</span>
                <div className="h-px bg-border flex-1"></div>
             </div>

             <Button 
                variant="outline"
                onClick={onGuestAccess}
                className="w-full py-6 group"
             >
                <span>以游客身份试用</span>
                <ArrowRight size={16} className="ml-2 text-muted-foreground group-hover:translate-x-1 transition-transform" />
             </Button>
             <p className="text-xs text-center text-muted-foreground">
                注意：游客数据仅保存在本地浏览器中，无法跨端同步
             </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;