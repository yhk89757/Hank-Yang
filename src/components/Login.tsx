import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Shield, Calendar, Lock, Eye, EyeOff, Sparkles, CheckCircle2, 
  AlertCircle, ArrowRight, ShieldAlert 
} from 'lucide-react';
import { ViewType } from '../types';
import { cn } from '../lib/utils';

interface LoginProps {
  onLoginSuccess: (role: ViewType) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [selectedRole, setSelectedRole] = React.useState<ViewType>('employee');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  const rolePasswords: Record<ViewType, { password: string; name: string; desc: string }> = {
    employee: { 
      password: 'employee123', 
      name: '员工申报端', 
      desc: '提供AI智能履历解析、职业能力诊断及公正反馈空间。' 
    },
    interviewer: { 
      password: 'interview123', 
      name: '专业面试空间', 
      desc: '专为业务线面试官打造，集成岗位JD、人才匹配画像、AI推荐问答。' 
    },
    admin: { 
      password: 'admin123', 
      name: '管理决策后台', 
      desc: '支持评估指标调优、权重分配与申诉流转中心。' 
    }
  };

  const handleRoleChange = (role: ViewType) => {
    setSelectedRole(role);
    setPassword('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Bypassed password check per user request (login immediately)
    setIsAuthenticating(true);

    // Simulated short delay for animation
    setTimeout(() => {
      setIsAuthenticating(false);
      onLoginSuccess(selectedRole);
    }, 400);
  };

  const handleRoadshow = () => {
    window.open(import.meta.env.BASE_URL + 'roadshow.html', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center p-4 relative overflow-hidden font-sans text-[#1D2129]">
      {/* Decorative ambient background blur */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#0052D9]/5 rounded-full blur-[100px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#3662EC]/5 rounded-full blur-[120px] translate-y-1/3" />

      {/* ====== 顶部路演横幅 ====== */}
      <div className="w-full max-w-5xl mb-6 relative z-10">
        <button
          onClick={handleRoadshow}
          className="w-full flex items-center justify-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0052D9]/5 via-[#8b5cf6]/10 to-[#0052D9]/5 border-2 border-[#0052D9]/20 hover:border-[#0052D9]/40 hover:from-[#0052D9]/10 hover:via-[#8b5cf6]/15 hover:to-[#0052D9]/10 transition-all duration-500 group cursor-pointer"
        >
          {/* 雷达呼吸灯效果 */}
          <div className="relative">
            <div className="absolute inset-0 w-10 h-10 rounded-full bg-[#0052D9]/30 animate-ping" style={{animationDuration: '2s'}} />
            <span className="relative z-10 text-3xl">📽️</span>
          </div>
          <div className="text-left">
            <h3 className="text-xl font-black text-[#1D2129] group-hover:text-[#0052D9] transition-colors">
              立项路演 PPT 汇报空间
            </h3>
            <p className="text-xs text-[#86909C] group-hover:text-[#4E5969] transition-colors">
              沉浸式大屏投影演示 · 5页幻灯片 · 一键跳转真实系统
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-[#0052D9] font-bold text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <span>进入演讲模式</span>
            <span className="text-lg">→</span>
          </div>
        </button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 flex-1 content-center">
        
        {/* Left Side: Clean Brand Concept Panel (5 columns) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-10 md:p-12 bg-gradient-to-br from-[#003EB3] via-[#0052D9] to-[#0A2463] rounded-3xl text-white shadow-xl relative overflow-hidden border border-white/10 min-h-[500px]">
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
          
          {/* Ambient light source glow */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#00f0ff]/20 rounded-full blur-[40px] pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-[#0052D9]/40 rounded-full blur-[60px] pointer-events-none" />

          <div className="space-y-8 relative z-10">
            {/* Enlarged Premium Glassmorphism Logo Box */}
            <div className="flex flex-col gap-5 items-start">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-xl shadow-[#002878]/30 transition-transform duration-350 hover:scale-105">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-white">
                  {/* Outer circle flow */}
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" className="opacity-40" />
                  {/* Water waves ('活水') representing dynamic talent circulation */}
                  <path d="M12 21c4-5 8 5 12 0s8-5 12 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 27c4-5 8 5 12 0s8-5 12 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70" />
                  <path d="M16 33c3-3.75 6 3.75 9 0s6-3.75 9 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-45" />
                  {/* Spark/Star node showing AI-driven matching */}
                  <path d="M24 10v4M24 34v4M10 24h4M34 24h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="24" cy="24" r="3.5" fill="white" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] block" style={{ color: '#93c5fd' }}>Talent Fluid Platform</span>
                <h2 className="text-2xl font-extrabold tracking-tight leading-none m-0" style={{ color: '#ffffff' }}>智能转岗系统</h2>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-2xl font-black leading-snug tracking-tight m-0" style={{ color: '#ffffff' }}>
                活水奔涌，人尽其才
              </h3>
              <p 
                className="text-xs leading-relaxed" 
                style={{ fontWeight: 'normal', fontFamily: 'Verdana', color: '#e0f2fe' }}
              >
                本系统是企业内部公开、安全、去中心化的自驱流转与转岗服务台。依托大语言模型深度提炼与客观胜任力诊断技术，为各事业群骨干员工提供透明的申报链路、权威的AI履历调阅及全流程护航反馈。
              </p>
              <p 
                className="text-xs leading-relaxed" 
                style={{ fontFamily: 'Verdana', color: '#e0f2fe' }}
              >
                在这里，破除各层级组织信息壁垒，以最科学简明的数字化凭证与推荐问答，为人才流动保驾护航，实现企业效能与个人价值的双赢。
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/10 mt-8 lg:mt-0 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15 shadow-inner">
                <Sparkles size={16} className="text-yellow-300" />
              </div>
              <div className="text-xs">
                <div className="font-extrabold" style={{ color: '#ffffff' }}>智能转岗规范化共建项目</div>
                <div className="text-[11px] mt-0.5" style={{ color: '#93c5fd' }}>多维胜任力数字档案支撑，全链条操作透明可追溯</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Identity Selection & Form Panel (7 columns) */}
        <div className="lg:col-span-7 flex flex-col justify-center bg-white rounded-3xl p-8 md:p-12 border border-[#E5E6EB] shadow-md">
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-[#1D2129]">统一身份验证空间</h3>
              <p className="text-sm text-[#86909C]">请根据您的登录需求，选择对应的端直接进入或输入密钥进行登录。</p>
            </div>

            {/* Role Select Cards Grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#86909C] uppercase tracking-wider block">选择登录角色</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { role: 'employee', label: '1. 员工申报端', icon: User, desc: '履历解析与诊断' },
                  { role: 'interviewer', label: '2. 面试空间', icon: Calendar, desc: '敏捷决策评估' },
                  { role: 'admin', label: '3. 管理后台', icon: Shield, desc: '胜任力指标配置' }
                ].map(item => {
                  const isActive = selectedRole === item.role;
                  return (
                    <div
                      key={item.role}
                      onClick={() => handleRoleChange(item.role as ViewType)}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all cursor-pointer text-left relative overflow-hidden flex flex-col justify-between h-28 group",
                        isActive 
                          ? "bg-[#E8F3FF] border-[#0052D9] shadow-md shadow-[#0052D9]/5 text-[#0052D9]" 
                          : "bg-white border-[#F2F3F5] hover:border-[#E5E6EB] hover:bg-[#F7F8FA]"
                      )}
                    >
                      {isActive && (
                        <div className="absolute right-0 top-0 bg-[#0052D9] text-white p-1 rounded-bl-xl">
                          <CheckCircle2 size={12} />
                        </div>
                      )}
                      
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                        isActive ? "bg-[#0052D9] text-white" : "bg-[#F2F3F5] text-[#4E5969] group-hover:bg-[#E5E6EB]"
                      )}>
                        <item.icon size={16} />
                      </div>
                      
                      <div>
                        <div className={cn("text-xs font-bold", isActive ? "text-[#0052D9]" : "text-[#1D2129]")}>
                          {item.label}
                        </div>
                        <div className="text-[10px] text-[#86909C] truncate">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Password Verification form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#86909C] uppercase tracking-wider block">
                    安全鉴权密钥
                  </label>
                  <span className="text-[10px] text-[#0052D9] font-bold">目标：{rolePasswords[selectedRole].name}</span>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center text-[#86909C]">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="安全密钥（已配置免密直通，直接点击下方登录即可）"
                    className={cn(
                      "w-full pl-11 pr-12 py-3.5 bg-[#F2F3F5] border border-[#E5E6EB] rounded-2xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-2",
                      error ? "focus:ring-red-400 border-red-300 bg-red-50/10" : "focus:ring-[#0052D9] border-transparent"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-[#4E5969] hover:text-[#1D2129] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error messages if any */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="p-4 bg-red-50 border border-red-200 text-xs text-red-600 rounded-2xl flex items-start gap-2.5 leading-relaxed"
                  >
                    <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-500" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isAuthenticating}
                className={cn(
                  "w-full py-4 bg-[#0052D9] text-white rounded-2xl text-sm font-bold hover:bg-[#003EB3] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0052D9]/15",
                  isAuthenticating && "bg-[#86909C] cursor-not-allowed text-white shadow-none"
                )}
              >
                {isAuthenticating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    安全体系校验中...
                  </>
                ) : (
                  <>
                    直接登录 / 凭证登录
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Testing Hint Panel */}
            <div className="bg-[#F7F8FA] rounded-2xl p-5 border border-[#E5E6EB] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4E5969]">
                <ShieldAlert size={14} className="text-[#0052D9]" />
                🔍 快捷密钥信息（您无需输入任何内容，或点击一键填入）
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                {Object.entries(rolePasswords).map(([key, details]) => (
                  <div 
                    key={key}
                    onClick={() => {
                      setSelectedRole(key as ViewType);
                      setPassword(details.password);
                      setError(null);
                    }}
                    className="p-2.5 bg-white rounded-xl border border-[#E5E6EB] cursor-pointer hover:border-[#0052D9] hover:shadow-xs transition-all active:scale-95 flex flex-col justify-between"
                  >
                    <div className="font-bold text-[#1D2129] truncate">{key === 'employee' ? '员工端' : key === 'interviewer' ? '面试空间' : '管理后台'}</div>
                    <div className="font-mono text-[#0052D9] bg-[#E8F3FF] px-1.5 py-0.5 rounded-md mt-1 mb-0.5 text-center break-all">
                      {details.password}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
