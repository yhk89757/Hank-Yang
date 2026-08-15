import React from 'react';
import { ViewType, EmployeeModule } from '../types';
import { User, Shield, LayoutDashboard, Info, FileText, MessageSquare, LogOut, Calendar, Presentation } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  view: ViewType;
  setView: (view: ViewType) => void;
  activeModule: EmployeeModule;
  setActiveModule: (module: EmployeeModule) => void;
  onLogout: () => void;
}

export function Layout({ children, view, setView, activeModule, setActiveModule, onLogout }: LayoutProps) {
  const roleConfig = {
    employee: {
      name: "杨鸿康",
      dept: "核心产品开发部",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80",
      badgeText: "已认证员工",
      badgeColor: "bg-[#E8F3FF] text-[#0052D9] border-[#0052D9]/20",
      icon: User
    },
    interviewer: {
      name: "李大伟",
      dept: "业务线人才评估委员会",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
      badgeText: "评估业务考官",
      badgeColor: "bg-orange-50 text-[#E37318] border-orange-200",
      icon: Calendar
    },
    admin: {
      name: "黄主管",
      dept: "HR效能规划总部",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80",
      badgeText: "首席系统管理员",
      badgeColor: "bg-emerald-50 text-[#2BA471] border-emerald-200",
      icon: Shield
    }
  };

  const currentRole = roleConfig[view] || roleConfig.employee;
  const RoleIcon = currentRole.icon;

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-sans text-[#1D2129]">
      {/* Top Header */}
      <header className="bg-white border-b border-[#E5E6EB] h-16 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 bg-[#0052D9] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#0052D9]/20 overflow-hidden">
            {/* Stylized Penguin Icon using Lucide Bird + custom styling */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0052D9] to-[#003EB3]" />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 relative z-10 text-white">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" fill="currentColor" fillOpacity="0.2" />
              <circle cx="12" cy="12" r="3" fill="white" />
              <path d="M12 15v4" />
              <path d="M15 12h4" />
              <path d="M5 12h4" />
              <path d="M12 5v4" />
            </svg>
          </div>
          <div className="flex flex-col -space-y-1">
            <h1 className="text-lg font-black tracking-tight text-[#1D2129] m-0">智能转岗系统</h1>
            <span className="text-[10px] font-bold text-[#0052D9] uppercase tracking-[0.2em] opacity-80">Talent Mobility Portal</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* ====== 路演投影PPT按钮 (雷达呼吸灯) ====== */}
          <button
            onClick={() => window.open('/roadshow.html', '_blank')}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0052D9]/5 to-[#8b5cf6]/5 border border-[#0052D9]/20 hover:border-[#0052D9]/40 hover:bg-[#0052D9]/10 transition-all group"
            title="打开立项路演 PPT 汇报空间"
          >
            {/* 雷达呼吸灯效果 */}
            <span className="absolute inset-0 rounded-xl bg-[#0052D9]/10 animate-ping" style={{animationDuration: '2.5s'}} />
            <span className="relative z-10 flex items-center gap-2">
              <Presentation size={15} className="text-[#0052D9] group-hover:text-[#003EB3] transition-colors" />
              <span className="text-xs font-bold text-[#0052D9] group-hover:text-[#003EB3] transition-colors hidden lg:inline">
                投影 PPT
              </span>
            </span>
          </button>

          {/* Verified locked identity state indicator, preventing unauthorized context jumps */}
          <div className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide flex items-center gap-2 border bg-white/50 backdrop-blur-xs shadow-xs",
            currentRole.badgeColor
          )}>
            <RoleIcon size={12} strokeWidth={2.5} />
            鉴权端：{currentRole.badgeText}
          </div>
          
          <div className="flex items-center gap-3 border-l border-[#E5E6EB] pl-6">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-[#1D2129]">{currentRole.name}</div>
              <div className="text-[10px] text-[#86909C]">{currentRole.dept}</div>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-50">
              <img src={currentRole.avatar} alt={currentRole.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
            
            {/* Quick header log out button */}
            <button 
              onClick={onLogout}
              className="p-2 text-[#86909C] hover:text-[#D54941] hover:bg-[#FFF2F1] rounded-xl transition-all"
              title="退出登录"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for Employee View */}
        {view === 'employee' && (
          <aside className="w-64 bg-white border-r border-[#E5E6EB] hidden lg:flex flex-col p-6 gap-2">
            <div className="text-[10px] font-bold text-[#86909C] uppercase tracking-wider mb-2 px-3">转岗流程</div>
            {[
              { id: 'lighthouse', label: '透明灯塔', icon: Info },
              { id: 'input', label: '履历解析', icon: FileText },
              { id: 'report', label: '职业诊断', icon: LayoutDashboard },
              { id: 'feedback', label: '护航反馈', icon: MessageSquare },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id as EmployeeModule)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  activeModule === item.id 
                    ? "bg-[#E8F3FF] text-[#0052D9]" 
                    : "text-[#4E5969] hover:bg-[#F2F3F5] hover:text-[#1D2129]"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
            
            <div className="mt-auto pt-6 border-t border-[#F2F3F5]">
              <button 
                onClick={onLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#D54941] hover:bg-[#FFF2F1] w-full transition-all"
              >
                <LogOut size={18} />
                退出登录
              </button>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
