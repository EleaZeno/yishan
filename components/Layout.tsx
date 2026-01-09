import React from 'react';
import { BookOpen, Brain, BarChart3, PlusCircle, User as UserIcon, LogOut, Cloud } from 'lucide-react';
import clsx from 'clsx';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onAddClick, user, onLogout }) => {
  
  const navItems = [
    { id: 'dashboard', label: '概览', icon: BarChart3 },
    { id: 'study', label: '复习', icon: Brain },
    { id: 'library', label: '词库', icon: BookOpen },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="flex-none bg-white/80 backdrop-blur-md border-b border-slate-200 safe-top z-30 px-4 py-3 flex justify-between items-center lg:px-8">
        <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg">
                忆
            </div>
            <div className="flex flex-col">
                <h1 className="text-lg font-bold tracking-tight text-slate-800 leading-none">忆闪 YiShan</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Scientific Memory</span>
                    {user && <Cloud size={10} className="text-indigo-400" />}
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={onAddClick}
                className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-md active:scale-95"
            >
                <PlusCircle size={18} />
                <span>添加</span>
            </button>

            <div className="relative group">
                <button className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200">
                    <UserIcon size={20} />
                </button>
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 hidden group-hover:block hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {user ? (
                        <>
                            <div className="px-3 py-3 border-b border-slate-50 mb-1">
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">已登录账号</p>
                                <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                            </div>
                            <button 
                                onClick={onLogout}
                                className="w-full text-left px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-50 rounded-xl flex items-center gap-2 font-medium transition-colors"
                            >
                                <LogOut size={16} /> 退出登录
                            </button>
                        </>
                    ) : (
                         <button 
                            onClick={onLogout}
                            className="w-full text-left px-3 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold flex items-center gap-2"
                        >
                            <UserIcon size={16} /> 登录 / 注册
                        </button>
                    )}
                </div>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={clsx(
          "flex-1 w-full max-w-7xl mx-auto relative",
          activeTab === 'study' ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden p-4 lg:p-10 no-scrollbar"
      )}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="flex-none bg-white/90 backdrop-blur-lg border-t border-slate-200 safe-bottom md:pb-0 z-30">
        <div className="flex justify-around items-center h-20 max-w-md mx-auto md:max-w-4xl px-2">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={clsx(
                            "flex flex-col items-center justify-center flex-1 h-full transition-all relative",
                            isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {isActive && <div className="absolute top-2 w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={clsx("transition-transform", isActive && "scale-110")} />
                        <span className="text-[10px] mt-1.5 font-bold uppercase tracking-wider">{item.label}</span>
                    </button>
                );
            })}
            
            <button
                onClick={onAddClick}
                className="flex flex-col items-center justify-center flex-1 h-full group"
            >
                <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-xl shadow-indigo-100 transform -translate-y-5 border-4 border-slate-50 active:scale-90 transition-all">
                    <PlusCircle size={28} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider -mt-4">添加</span>
            </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;