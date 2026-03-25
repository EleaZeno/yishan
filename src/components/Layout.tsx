
import React from 'react';
import { BookOpen, Brain, BarChart3, PlusCircle, User as UserIcon, LogOut, ShieldCheck, GraduationCap, PenTool, Settings } from 'lucide-react';
import clsx from 'clsx';
import { User } from '../types';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onAddClick, onAdminClick, user, onLogout }) => {
  
  const navItems = [
    { id: 'dashboard', label: '核心', icon: BarChart3 },
    { id: 'study', label: '交互', icon: Brain },
    { id: 'library', label: '词库', icon: BookOpen },
    { id: 'diagnose', label: '诊断', icon: GraduationCap },
    { id: 'practice', label: '练习', icon: PenTool },
  ];

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="flex-none bg-background/80 backdrop-blur-xl border-b safe-top z-30 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-[14px] flex items-center justify-center text-primary-foreground font-black text-xl shadow-xl select-none">
                Yi
            </div>
            <div className="flex flex-col">
                <h1 className="text-lg font-black tracking-tight leading-none">忆闪 YiShan</h1>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.2em]">Flux AI Memory</span>
                    {user && <ShieldCheck size={10} className="text-emerald-500" />}
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <Button 
                onClick={onAddClick}
                className="hidden md:flex items-center gap-2 rounded-xl font-bold shadow-lg"
            >
                <PlusCircle size={16} />
                <span className="text-sm">注入信号</span>
            </Button>

            <Button 
                onClick={() => onTabChange('admin')}
                variant="ghost"
                size="icon"
                className="rounded-xl w-10 h-10 text-muted-foreground hover:text-foreground"
                title="后台管理"
            >
                <Settings size={18} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-border" />}>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-transparent"><UserIcon size={18} /></AvatarFallback>
                  </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                {user ? (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">认证 ID</p>
                        <p className="text-sm font-bold leading-none">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive cursor-pointer font-bold">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>退出当前同步</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={onLogout} className="text-primary focus:text-primary cursor-pointer font-bold">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>登录 / 开启云同步</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
      <nav className="flex-none bg-background/80 backdrop-blur-2xl border-t safe-bottom z-30">
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
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {isActive && <div className="absolute -top-1 w-8 h-1 bg-primary rounded-full" />}
                        <Icon size={22} strokeWidth={isActive ? 3 : 2} className={clsx("transition-transform group-active:scale-90", isActive && "scale-110")} />
                        <span className="text-[9px] mt-2 font-black uppercase tracking-[0.15em]">{item.label}</span>
                    </button>
                );
            })}
            
            <button
                onClick={onAddClick}
                className="flex flex-col items-center justify-center flex-1 h-full group"
            >
                <div className="bg-primary text-primary-foreground p-3.5 rounded-2xl shadow-2xl transform -translate-y-6 border-4 border-background active:scale-90 transition-all hover:opacity-90">
                    <PlusCircle size={24} />
                </div>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em] -mt-5">注入</span>
            </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;

