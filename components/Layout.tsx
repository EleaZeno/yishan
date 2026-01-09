
import React from 'react';
import { BookOpen, Brain, BarChart3, PlusCircle, User as UserIcon, LogOut, Cloud, ShieldCheck } from 'lucide-react';
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
    { id: 'dashboard', label: '核心', icon: BarChart3 },
    { id: 'study', label: '交互', icon: Brain },
    { id: 'library', label: '词库', icon: BookOpen },
  ];

  return (
    <div className="flex flex-col h-full bg-[#fcfdfe] text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="flex-none bg-white/70 backdrop-blur-xl border-b border-slate-100 safe-top z-30 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-[14px] flex items-center justify-center text-white font-black text-xl shadow-xl shadow-slate-200 select-none">
                Yi
            </div>
            <div className="flex flex-col">
                <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">忆闪 YiShan</h1>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em]">Flux AI Memory</span>
                    {user && <ShieldCheck size={10} className="text-emerald-500" />}
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={onAddClick}
                className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
                <PlusCircle size={16} />
                <span className="text-sm">注入信号</span>
            </button>

            <div className="relative group">
                <button className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors border border-slate-100">
                    <UserIcon size={18} />
                </button>
                <div className="absolute right-0 top-full mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 hidden group-hover:block hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {user ? (
                        <>
                            <div className="px-3 py-3 border-b border-slate-50 mb-1">
                                <p className="text-[9px] text-slate-400 font-black uppercase mb-1 tracking-widest">认证 ID</p>
                                <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                            </div>
                            <button 
                                onClick={onLogout}
                                className="w-full text-left px-3 py-3 text-xs text-rose-500 hover:bg-rose-50 rounded-xl flex items-center gap-2 font-bold transition-colors"
                            >
                                <LogOut size={14} /> 退出当前同步
                            </button>
                        </>
                    ) : (
                         <button 
                            onClick={onLogout}
                            className="w-full text-left px-3 py-3 text-xs text-indigo-600 hover:bg-indigo-50 rounded-xl font-black flex items-center gap-2"
                        >
                            <UserIcon size={14} /> 登录 / 开启云同步
                        </button>
                    )}
                </div>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={clsx(
          "flex-1 w-full max-w-5xl mx-auto relative",
          activeTab === 'study' ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden p-6 md:p-10 no-scrollbar"
      )}>
        {children}
      </main>

      {/* Modern Bottom Navigation */}
      <nav className="flex-none bg-white/80 backdrop-blur-2xl border-t border-slate-100 safe-bottom z-30">
        <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-6">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={clsx(
                            "flex flex-col items-center justify-center flex-1 h-full transition-all relative group",
                            isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {isActive && <div className="absolute -top-1 w-8 h-1 bg-indigo-600 rounded-full" />}
                        <Icon size={22} strokeWidth={isActive ? 3 : 2} className={clsx("transition-transform group-active:scale-90", isActive && "scale-110")} />
                        <span className="text-[9px] mt-2 font-black uppercase tracking-[0.15em]">{item.label}</span>
                    </button>
                );
            })}
            
            <button
                onClick={onAddClick}
                className="flex flex-col items-center justify-center flex-1 h-full group"
            >
                <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl shadow-slate-200 transform -translate-y-6 border-4 border-white active:scale-90 transition-all hover:bg-indigo-600">
                    <PlusCircle size={24} />
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] -mt-5">注入</span>
            </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
