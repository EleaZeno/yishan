import React, { useState } from 'react';
import { User, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { authService } from '../services/auth';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="w-full p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
             <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-indigo-200">
                忆
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
                {isLogin ? '欢迎回来' : '创建账号'}
            </h1>
            <p className="text-gray-500 text-sm mt-1 text-center">
                {isLogin ? '登录以同步你的学习进度' : '开启基于科学记忆算法的单词之旅'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="请输入至少6位密码"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                 {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? '立即登录' : '注册账号')}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4">
             <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors"
             >
                {isLogin ? '还没有账号？ 立即注册' : '已有账号？ 去登录'}
             </button>

             <div className="w-full flex items-center gap-3">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-xs text-gray-400">或者</span>
                <div className="h-px bg-gray-200 flex-1"></div>
             </div>

             <button 
                onClick={onGuestAccess}
                className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 group"
             >
                <span>以游客身份试用</span>
                <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
             </button>
             <p className="text-xs text-center text-gray-400">
                注意：游客数据仅保存在本地浏览器中，无法跨端同步
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;