import React, { useState } from 'react';
import { JOBS, SCORING_WEIGHTS, DEPARTMENTS, PROCESS_STAGES } from '../../constants';
import { Info, Target, Award, ShieldCheck, ArrowRight, Sparkles, ChevronDown, ChevronUp, MapPin, Briefcase, GraduationCap, CheckCircle2, ChevronRight, Brain, Cpu, MessageCircle, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { AiConfig } from '../../types';

interface LighthouseProps {
  onNext: () => void;
  aiConfig: AiConfig | null;
}

export function Lighthouse({ onNext, aiConfig }: LighthouseProps) {
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [activeDept, setActiveDept] = useState<string>('全部');

  const today = new Date('2026-04-12'); // Fixed current date for demo consistency

  const filteredJobs = activeDept === '全部' 
    ? JOBS 
    : JOBS.filter(j => j.department === activeDept);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Process Timeline for Transparency */}
      <section className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-[#1D2129]">转岗流程透明化</h3>
            <p className="text-xs text-[#86909C] mt-1">全流程 AI 辅助，人工复核，确保公平公正</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#EFFFF1] text-[#2BA471] rounded-lg text-xs font-bold">
            <CheckCircle2 size={14} />
            当前进度：AI 初筛阶段
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {PROCESS_STAGES.map((stage, idx) => {
            const isPast = new Date(stage.endDate) < today;
            const isCurrent = today >= new Date(stage.startDate) && today <= new Date(stage.endDate);
            
            return (
              <div key={stage.id} className="relative group">
                <div className={cn(
                  "p-4 rounded-2xl border transition-all h-full",
                  isCurrent ? "bg-[#E8F3FF] border-[#0052D9] shadow-md" : 
                  isPast ? "bg-[#F7F8FA] border-[#E5E6EB] opacity-60" : "bg-white border-[#E5E6EB]"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md",
                      isCurrent ? "bg-[#0052D9] text-white" : "bg-[#F2F3F5] text-[#86909C]"
                    )}>
                      第 {stage.days[0]}-{stage.days[1]} 天
                    </span>
                    {isPast && <CheckCircle2 size={14} className="text-[#2BA471]" />}
                  </div>
                  <h4 className={cn(
                    "text-sm font-bold mb-1",
                    isCurrent ? "text-[#0052D9]" : "text-[#1D2129]"
                  )}>
                    {stage.label}
                  </h4>
                  <p className="text-[10px] text-[#86909C] leading-relaxed">
                    {stage.description}
                  </p>
                </div>
                {idx < PROCESS_STAGES.length - 1 && (
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-[#E5E6EB]">
                    <ChevronRight size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white rounded-3xl p-10 border border-[#E5E6EB]/60 shadow-[0_12px_40px_rgba(0,0,0,0.015)] relative overflow-hidden group">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-[#0052D9]/5 via-[#00f0ff]/2 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#E8F3FF] text-[#0052D9] rounded-full text-[10px] font-black uppercase tracking-wider mb-6 border border-[#0052D9]/10">
            <Sparkles size={12} />
            Powered by 胜任力大语言模型 3.0
          </div>
          <h2 className="text-3xl font-black mb-6 text-[#1D2129] leading-tight">
            转岗启航：<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0052D9] to-[#003EB3]">透明灯塔</span>
          </h2>
          <p className="text-[#4E5969] text-sm leading-relaxed mb-8 font-normal">
            通过“全域胜任力白盒诊断”与“去中心化反馈护航”的双轨协同，旨在创造一个科学客观、标准透明且支持自主复盘的敏捷转岗评估环境。我们打破单纯的历史绩效壁垒，聚焦于跨界迁移潜力、项目成果资产以及主观能动性的深度匹配。
          </p>
          <div className="flex items-center gap-4">
            <button 
              onClick={onNext}
              className="lighthouse-btn-primary flex items-center gap-2 shadow-lg shadow-[#0052D9]/10 hover:shadow-xl hover:shadow-[#0052D9]/20"
            >
              开始我的转岗之旅
              <ArrowRight size={20} />
            </button>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-[#F2F3F5] overflow-hidden shadow-xs">
                  <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-white bg-[#F2F3F5] flex items-center justify-center text-[10px] font-black text-[#86909C]">
                +2k
              </div>
            </div>
          </div>
        </div>
        
        {/* Subtle Penguin Watermark */}
        <div className="absolute right-[-5%] top-[-10%] w-[40%] h-[120%] opacity-[0.03] pointer-events-none select-none rotate-12 group-hover:rotate-6 transition-transform duration-1000">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
          </svg>
        </div>
        <div className="absolute right-10 bottom-10 text-[#0052D9] opacity-[0.05]">
          <Target size={120} />
        </div>
      </section>

      {/* Scoring Logic & Job List */}
      <div className="grid grid-cols-1 gap-8">
        {/* Scoring Weights */}
        <section className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Target className="text-[#0052D9]" size={24} />
            评分维度与权重说明
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {SCORING_WEIGHTS.map((item) => (
              <div key={item.label} className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E5E6EB] text-center">
                <div className="text-2xl font-black mb-1" style={{ color: item.color }}>
                  {Math.round(item.weight * 100)}%
                </div>
                <div className="text-xs font-medium text-[#86909C]">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-r from-[#F7F9FC] to-white p-6 rounded-2xl border border-[#E5E6EB]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1D2129]">
                <ShieldCheck className="text-[#0052D9]" size={18} />
                <span>精准对准能力本位</span>
              </div>
              <p className="text-xs text-[#4E5969] leading-relaxed">
                评估模型打破单一的绩效排序模型，围绕候选人的履历深度、业务理解力与主观意愿进行微观对齐，确保每一个跨团队志愿得到最公平、最深层能力的量化展现。
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#E37318]">
                <Sparkles className="text-[#E37318]" size={18} />
                <span>15% 专属跨界潜力考察</span>
              </div>
              <p className="text-xs text-[#4E5969] leading-relaxed">
                我们独立开辟15%的“跨界潜力评估”权值，用于发掘候选人在核心技术深度与创新产品思维上的底层迁移力，为下一阶段多维度的职业破局提供白盒智推。
              </p>
            </div>
          </div>
        </section>

        {/* Integrated Job List */}
        <section className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Award className="text-[#0052D9]" size={24} />
              本次竞聘岗位列表
            </h3>
            
            {/* Department Filters */}
            <div className="flex flex-wrap gap-2">
              {['全部', ...DEPARTMENTS].map(dept => (
                <button
                  key={dept}
                  onClick={() => setActiveDept(dept)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all border",
                    activeDept === dept 
                      ? "bg-[#0052D9] border-[#0052D9] text-white shadow-md shadow-[#0052D9]/20" 
                      : "bg-white border-[#E5E6EB] text-[#4E5969] hover:border-[#0052D9] hover:text-[#0052D9]"
                  )}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div 
                key={job.id} 
                className={cn(
                  "rounded-2xl border transition-all overflow-hidden",
                  expandedJob === job.id 
                    ? "border-[#0052D9] ring-1 ring-[#0052D9]/10 shadow-lg" 
                    : "border-[#F2F3F5] hover:border-[#C9CDD4] bg-white"
                )}
              >
                {/* Preview Header */}
                <div 
                  onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  className="p-6 cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg text-[#1D2129] group-hover:text-[#0052D9] transition-colors">
                      {job.department} {job.title}
                    </h4>
                    <div className="flex flex-wrap gap-4 text-xs text-[#86909C] font-medium">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#0052D9]/60" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Briefcase size={14} className="text-[#0052D9]/60" />
                        {job.experience}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <GraduationCap size={14} className="text-[#0052D9]/60" />
                        {job.education}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-[#0052D9] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                      查看详情 →
                    </span>
                    <div className={cn(
                      "w-8 h-8 rounded-full bg-[#F2F3F5] flex items-center justify-center text-[#4E5969] transition-transform",
                      expandedJob === job.id ? "rotate-180 bg-[#E8F3FF] text-[#0052D9]" : ""
                    )}>
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedJob === job.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-8 pt-2 border-t border-[#F2F3F5] bg-[#F7F8FA]/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-bold text-[#1D2129]">
                              <div className="w-1.5 h-4 bg-[#0052D9] rounded-full" />
                              岗位职责 (JD)
                            </div>
                            <p className="text-sm text-[#4E5969] leading-relaxed pl-3.5 whitespace-pre-wrap">
                              {job.jd}
                            </p>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-bold text-[#0052D9]">
                              <div className="w-1.5 h-4 bg-[#0052D9] rounded-full" />
                              人才画像 (Portrait)
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-[#E5E6EB] shadow-sm">
                              <p className="text-sm text-[#4E5969] italic leading-relaxed whitespace-pre-wrap">
                                {job.portrait}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                          <button 
                            onClick={onNext}
                            className="lighthouse-btn-primary py-2 px-6 text-sm"
                          >
                            立即申请此岗位
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* AI Agent Configuration Transparency - Moved to bottom and restyled */}
      {aiConfig && (
        <section className="bg-[#F7F8FA] rounded-3xl p-8 border border-[#E5E6EB] shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-[#E8F3FF] rounded-xl">
              <Brain size={24} className="text-[#0052D9]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1D2129]">AI 评估 Agent 配置透明度</h3>
              <p className="text-xs text-[#86909C]">基于先进神经网络与语义大模型，确保每一份评估都客观、公正、可追溯</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4E5969]">
                <Cpu size={14} className="text-[#0052D9]" />
                API 模型
              </div>
              <div className="text-sm font-bold text-[#1D2129] bg-white p-3 rounded-xl border border-[#E5E6EB]">
                {aiConfig.modelName}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4E5969]">
                <MessageCircle size={14} className="text-[#0052D9]" />
                语言风格
              </div>
              <div className="text-sm font-bold text-[#1D2129] bg-white p-3 rounded-xl border border-[#E5E6EB]">
                {aiConfig.languageStyle}
              </div>
            </div>

            <div className="space-y-3 lg:col-span-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4E5969]">
                <Shield size={14} className="text-[#0052D9]" />
                公正透明原则
              </div>
              <div className="flex flex-wrap gap-2">
                {aiConfig.principles.map((p, i) => (
                  <span key={i} className="text-[10px] font-bold bg-[#EFFFF1] text-[#2BA471] border border-[#B7EBD0] px-3 py-1 rounded-full">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[#E5E6EB]">
            <div className="text-xs font-bold text-[#4E5969] mb-4">当前评分权重配置</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {aiConfig.weights.map((w, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-[#E5E6EB]">
                  <div className="text-[10px] text-[#86909C] mb-1">{w.label}</div>
                  <div className="text-lg font-black text-[#0052D9]">{(w.weight * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
