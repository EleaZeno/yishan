import React from 'react';
import { BookOpen, Brain, BarChart3, PlusCircle, User as UserIcon, LogOut } from 'lucide-react';
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
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="flex-none bg-white shadow-sm z-10 px-4 py-3 flex justify-between items-center lg:px-8">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-sm">
                忆
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800">忆闪 YiShan</h1>
            {user && (
                 <span className="hidden sm:inline-block ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium border border-indigo-100">
                    Cloud
                 </span>
            )}
            {!user && (
                 <span className="hidden sm:inline-block ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium border border-gray-200">
                    Guest
                 </span>
            )}
        </div>
        
        <div className="flex items-center gap-3">
             {/* Desktop Add Button */}
            <button 
                onClick={onAddClick}
                className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-sm"
            >
                <PlusCircle size={18} />
                <span>添加单词</span>
            </button>

            {/* User Profile / Logout */}
            <div className="relative group">
                <button className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                    <UserIcon size={20} />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-2 hidden group-hover:block hover:block z-50">
                    {user ? (
                        <>
                            <div className="px-3 py-2 border-b border-gray-100 mb-1">
                                <p className="text-xs text-gray-400 font-medium">当前账号</p>
                                <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
                            </div>
                            <button 
                                onClick={onLogout}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                            >
                                <LogOut size={16} /> 退出登录
                            </button>
                        </>
                    ) : (
                         <button 
                            onClick={onLogout} // In guest mode this acts as "Go to Login"
                            className="w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                            登录 / 注册
                        </button>
                    )}
                </div>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Mobile/Tablet Bottom Navigation */}
      <nav className="flex-none bg-white border-t border-gray-200 pb-safe md:pb-0">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto md:max-w-4xl">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={clsx(
                            "flex flex-col items-center justify-center w-full h-full transition-colors",
                            isActive ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-xs mt-1 font-medium">{item.label}</span>
                    </button>
                );
            })}
            
             {/* Floating Action Button for Mobile */}
            <button
                onClick={onAddClick}
                className="md:hidden flex flex-col items-center justify-center w-full h-full text-indigo-600"
            >
                <div className="bg-indigo-600 text-white p-2 rounded-full shadow-lg transform -translate-y-4 border-4 border-gray-50">
                    <PlusCircle size={28} />
                </div>
                <span className="text-xs font-medium -mt-3">添加</span>
            </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;