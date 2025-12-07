import React from 'react';
import { BookOpen, Brain, BarChart3, PlusCircle } from 'lucide-react';
import clsx from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onAddClick }) => {
  
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
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                忆
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800">YiShan</h1>
        </div>
        
        {/* Desktop Add Button */}
        <button 
            onClick={onAddClick}
            className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-sm"
        >
            <PlusCircle size={18} />
            <span>添加单词</span>
        </button>
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
            
             {/* Floating Action Button for Mobile usually covers content, putting it in nav bar as a special action */}
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
