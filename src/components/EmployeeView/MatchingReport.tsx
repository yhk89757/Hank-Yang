import React from 'react';
import { MatchingResult, DimensionMatch, SkillGap } from '../../types';
import { cn } from '../../lib/utils';
import {
  Target, Zap, BookOpen, Award, AlertTriangle,
  CheckCircle2, TrendingUp, ChevronDown, ChevronUp,
  Sparkles, Shield, Brain, BarChart2, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MatchingReportProps {
  result: MatchingResult | null;
  isLoading?: boolean;
}

export function MatchingReport({ result, isLoading }: MatchingReportProps) {
  const [expandedDim, setExpandedDim] = React.useState<string | null>(null);
  const [showAllGaps, setShowAllGaps] = React.useState(false);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm">
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#E8F3FF] border-t-[#0052D9] rounded-full animate-spin" />
            <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#0052D9]" size={24} />
          </div>
          <div className="text-center">
            <p className="font-bold text-[#1D2129] text-lg">AI 智能匹配分析中...</p>
            <p className="text-sm text-[#86909C] mt-1">DeepSeek 正在深度解析简历、JD与人才画像</p>
          </div>
          <div className="flex gap-2 mt-2">
            {['解析简历...', '分析JD...', '构建人才画像...', '智能匹配...'].map((step, i) => (
              <span key={i} className="text-[10px] bg-[#F2F3F5] text-[#4E5969] px-2 py-1 rounded-full">
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-[#2BA471]';
    if (score >= 70) return 'text-[#0052D9]';
    if (score >= 60) return 'text-[#E37318]';
    return 'text-[#D54941]';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-[#EFFFF1] border-[#2BA471]';
    if (score >= 70) return 'bg-[#E8F3FF] border-[#0052D9]';
    if (score >= 60) return 'bg-[#FFF7E8] border-[#E37318]';
    return 'bg-[#FFF0F0] border-[#D54941]';
  };

  const getGapLabel = (gap: string) => {
    switch (gap) {
      case 'none': return { label: '无差距', color: 'bg-[#EFFFF1] text-[#2BA471]' };
      case 'minor': return { label: '轻微', color: 'bg-[#E8F3FF] text-[#0052D9]' };
      case 'moderate': return { label: '中等', color: 'bg-[#FFF7E8] text-[#E37318]' };
      case 'significant': return { label: '显著', color: 'bg-[#FFF0F0] text-[#D54941]' };
      default: return { label: '未知', color: 'bg-[#F2F3F5] text-[#86909C]' };
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴 高优先';
      case 'medium': return '🟡 中优先';
      case 'low': return '🟢 低优先';
      default: return priority;
    }
  };

  const getRecommendationLabel = (rec: string) => {
    switch (rec) {
      case 'highly_recommend': return { label: '强烈推荐', color: 'bg-[#2BA471]' };
      case 'recommend': return { label: '推荐', color: 'bg-[#0052D9]' };
      case 'consider': return { label: '可考虑', color: 'bg-[#E37318]' };
      case 'not_recommend': return { label: '不推荐', color: 'bg-[#D54941]' };
      default: return { label: rec, color: 'bg-[#86909C]' };
    }
  };

  const recInfo = getRecommendationLabel(result.recommendation);
  const displayedGaps = showAllGaps ? result.skillGaps : result.skillGaps.filter(g => g.gap !== 'none').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <section className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Score Circle */}
          <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="88" cy="88" r="78" fill="none" stroke="#F2F3F5" strokeWidth="8" />
              <circle
                cx="88" cy="88" r="78" fill="none"
                stroke={result.overallScore >= 70 ? '#0052D9' : '#E37318'}
                strokeWidth="8"
                strokeDasharray={490.09}
                strokeDashoffset={490.09 * (1 - result.overallScore / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-4xl font-black tracking-tight", getScoreColor(result.overallScore))}>
                {Math.round(result.overallScore)}
              </span>
              <span className="text-[11px] text-[#86909C] font-bold uppercase tracking-wider">综合匹配度</span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className={cn("px-3 py-1 rounded-full text-xs font-bold text-white", recInfo.color)}>
                {recInfo.label}
              </span>
              <span className="text-xs text-[#86909C] flex items-center gap-1">
                <Sparkles size={12} className="text-[#0052D9]" />
                DeepSeek AI 智能匹配
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#1D2129]">AI 智能匹配分析报告</h2>
            <p className="text-sm text-[#4E5969] leading-relaxed">{result.summary}</p>
          </div>
        </div>
      </section>

      {/* Dimension Matches */}
      <section className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm">
        <h3 className="text-lg font-bold text-[#1D2129] mb-6 flex items-center gap-2">
          <Target size={20} className="text-[#0052D9]" />
          五维度匹配分析
        </h3>
        <div className="space-y-3">
          {result.dimensionMatches.map((dim, idx) => {
            const isExpanded = expandedDim === dim.dimension;
            return (
              <div
                key={dim.dimension}
                className={cn(
                  "rounded-2xl border transition-all",
                  isExpanded ? "bg-[#F8FAFC] border-[#0052D9]/30" : "bg-white border-[#E5E6EB]"
                )}
              >
                <button
                  onClick={() => setExpandedDim(isExpanded ? null : dim.dimension)}
                  className="w-full p-4 flex items-center gap-4 text-left"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: ['#E8F3FF', '#EFFFF1', '#FFF7E8', '#F3E8FF', '#FFE8F0'][idx] }}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-[#1D2129]">{dim.dimension}</span>
                      <span className="text-xs text-[#86909C]">权重 {(dim.weight * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-[#F2F3F5] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${dim.score}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={cn(
                          "h-full rounded-full",
                          dim.score >= 80 ? "bg-[#2BA471]" : dim.score >= 60 ? "bg-[#0052D9]" : "bg-[#E37318]"
                        )}
                      />
                    </div>
                  </div>
                  <span className={cn("text-lg font-black shrink-0", getScoreColor(dim.score))}>
                    {dim.score}
                  </span>
                  {isExpanded ? <ChevronUp size={16} className="text-[#86909C]" /> : <ChevronDown size={16} className="text-[#86909C]" />}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        <p className="text-xs text-[#4E5969] leading-relaxed">{dim.detail}</p>
                        {dim.matchedPoints.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-[#2BA471] mb-1.5">✓ 匹配点</p>
                            <div className="flex flex-wrap gap-1.5">
                              {dim.matchedPoints.map((p, i) => (
                                <span key={i} className="text-[10px] bg-[#EFFFF1] text-[#2BA471] px-2 py-1 rounded-lg flex items-center gap-1">
                                  <CheckCircle2 size={10} /> {p}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {dim.gapPoints.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-[#E37318] mb-1.5">✗ 差距点</p>
                            <div className="flex flex-wrap gap-1.5">
                              {dim.gapPoints.map((p, i) => (
                                <span key={i} className="text-[10px] bg-[#FFF7E8] text-[#E37318] px-2 py-1 rounded-lg flex items-center gap-1">
                                  <AlertTriangle size={10} /> {p}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Skill Gaps */}
      <section className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm">
        <h3 className="text-lg font-bold text-[#1D2129] mb-6 flex items-center gap-2">
          <Brain size={20} className="text-[#E37318]" />
          技能差距分析
          <span className="text-xs text-[#86909C] font-normal ml-2">
            {result.skillGaps.filter(g => g.gap !== 'none').length} 项待补齐
          </span>
        </h3>
        <div className="space-y-2">
          {displayedGaps.map((gap, idx) => {
            const gapInfo = getGapLabel(gap.gap);
            return (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#F2F3F5]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-[#1D2129]">{gap.skill}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold", gapInfo.color)}>
                      {gapInfo.label}
                    </span>
                    <span className="text-[10px] text-[#86909C]">
                      {getPriorityLabel(gap.priority)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#86909C]">
                    <span>要求: <b className="text-[#1D2129]">{gap.requiredLevel}</b></span>
                    <ArrowRight size={10} />
                    <span>当前: <b className="text-[#1D2129]">{gap.currentLevel}</b></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {result.skillGaps.filter(g => g.gap !== 'none').length > 5 && (
          <button
            onClick={() => setShowAllGaps(!showAllGaps)}
            className="mt-3 w-full py-2 text-xs font-bold text-[#0052D9] hover:bg-[#E8F3FF] rounded-xl transition-all"
          >
            {showAllGaps ? '收起' : `查看全部 ${result.skillGaps.filter(g => g.gap !== 'none').length} 项`}
          </button>
        )}
      </section>
    </div>
  );
}
