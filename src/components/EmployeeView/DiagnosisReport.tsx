import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { SCORING_WEIGHTS } from '../../constants';
import { cn } from '../../lib/utils';
import { Download, Share2, Award, Target, TrendingUp, ChevronLeft, Sparkles, Shield, Info, ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'motion/react';
import { CompetencyReport, MatchingResult } from '../../types';
import { MatchingReport } from './MatchingReport';
import { LearningRecommendations } from './LearningRecommendations';
import { aiStatus } from '../../services/deepseekService';

interface DiagnosisReportProps {
  report: CompetencyReport | null;
  matchingResult?: MatchingResult | null;
  onNext: () => void;
  onBack: () => void;
}

export function DiagnosisReport({ report, matchingResult, onNext, onBack }: DiagnosisReportProps) {
  if (!report) return null;

  const [activeDimension, setActiveDimension] = React.useState<number>(0);
  const [showSmartMatch, setShowSmartMatch] = React.useState(true);
  const [showLearning, setShowLearning] = React.useState(true);

  // 优先使用 DeepSeek 匹配结果，其次使用 Gemini 报告
  const hasDeepSeekResult = matchingResult && matchingResult.dimensionMatches && matchingResult.dimensionMatches.length > 0;
  
  const chartData = hasDeepSeekResult 
    ? matchingResult!.dimensionMatches.map((dm, i) => ({
        subject: dm.dimension,
        A: dm.score,
        rawScore: dm.score,
        maxScore: 100,
        color: ['#0052D9', '#2BA471', '#E37318', '#D54941', '#8B5CF6'][i],
      }))
    : [
        { subject: '材料匹配度', A: (report.scores.match / 55) * 100, rawScore: report.scores.match, maxScore: 55, color: '#0052D9' },
        { subject: '部门绩效', A: (report.scores.performance / 15) * 100, rawScore: report.scores.performance, maxScore: 15, color: '#2BA471' },
        { subject: '跨界潜力', A: (report.scores.potential / 15) * 100, rawScore: report.scores.potential, maxScore: 15, color: '#E37318' },
        { subject: '笔试成绩', A: (report.scores.test / 15) * 100, rawScore: report.scores.test, maxScore: 15, color: '#D54941' },
      ];

  const normalizedScores = hasDeepSeekResult
    ? matchingResult!.dimensionMatches.map(dm => dm.score)
    : [
        (report.scores.match / 55) * 100,
        (report.scores.performance / 15) * 100,
        (report.scores.potential / 15) * 100,
        (report.scores.test / 15) * 100,
      ];

  const rawScores = hasDeepSeekResult
    ? matchingResult!.dimensionMatches.map(dm => dm.score)
    : [
        report.scores.match,
        report.scores.performance,
        report.scores.potential,
        report.scores.test,
      ];

  const maxScores = hasDeepSeekResult
    ? matchingResult!.dimensionMatches.map(() => 100)
    : [55, 15, 15, 15];

  const effectiveScore = hasDeepSeekResult ? matchingResult!.overallScore : report.totalScore;

  const dimensionDetails = [
    {
      title: '材料匹配度 (CV & JD Alignment)',
      desc: '评估候选人的核心履历背景、历史项目类型与目标岗位的相似对齐度。高匹配度表示候选人在过往经历中承接并成功交付过类似极客任务。',
      subMetrics: ['核心框架原理 (精通度)', '大型工程研发实践经验', '首屏加载与编译流优化经验'],
      actionableAdvice: '建议面试中重点验证组件解耦实践的底层深度，了解高带宽流量架构的具体方案。'
    },
    {
      title: '部门绩效 (Historical Level Contribution)',
      desc: '展现过去两个评估周期内最真实的业务贡献情况，消除由于团队差异导致的主观偏差，专注考察实际的效能提点与高价值代码产出。',
      subMetrics: ['业务核心指标提点', '内部系统工程成果评定', '敏捷发布流管理成熟度'],
      actionableAdvice: '建议面试中通过开放式探讨，挖掘其在此类跨团队敏捷重构中的首创和担当作为。'
    },
    {
      title: '跨界潜力 (Cognitive & Transfer Potential)',
      desc: '独立开辟15%的跨度智推潜力值，用于发掘候选人在核心算法自适应学习、知识迁移与新业务探索时的综合成长曲线。',
      subMetrics: ['技术纵深自学意愿', '异构系统架构自愈直觉', '复杂博弈沟通中的ROI说服力'],
      actionableAdvice: '面试中可通过设置特定极客约束下的突发变动场景，考察其危机兜底与弹性抗压素质。'
    },
    {
      title: '笔试成绩 (Analytical & Technical Quiz)',
      desc: '通过专业严肃的基础技术测验和特定业务算法设计模拟考，量化考察逻辑严密性与核心编程素养。',
      subMetrics: ['逻辑推理与代码洁癖', '多层嵌套重排自愈设计', '高并发资源路由计算精度'],
      actionableAdvice: '可针对其笔试中高光或错题区域进行追问式白盒拆解，验证其真实的编码严谨性。'
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-3 border border-[#E5E6EB] rounded-2xl shadow-xl space-y-1 text-left font-sans">
          <p className="text-xs font-bold text-[#1D2129]">{data.subject}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="text-xs text-[#4E5969]">得分率：</span>
            <span className="text-xs font-black text-[#0052D9]">{Math.round(data.A)}%</span>
          </div>
          <p className="text-[10px] text-[#86909C]">原始得分：{data.rawScore} / {data.maxScore}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <section className="bg-white rounded-2xl p-6 border border-[#E5E6EB]/80 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#F2F3F5"
              strokeWidth="10"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#0052D9"
              strokeWidth="10"
              strokeDasharray={439.82}
              strokeDashoffset={439.82 * (1 - effectiveScore / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-[#1D2129] tracking-tight">{Math.round(effectiveScore)}</span>
            <span className="text-[10px] text-[#86909C] font-bold uppercase tracking-wider">综合胜任分</span>
          </div>
        </div>

        <div className="flex-1 space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F2F3F5] text-[#4E5969] rounded-md text-[9px] font-bold uppercase tracking-wider">
            <Shield size={10} className="text-[#0052D9]" />
            胜任力白盒诊断系统
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1D2129] flex items-center justify-center md:justify-start gap-2">
              个人胜任力诊断报告
              <span className="text-xs bg-[#EFFFF1] text-[#2BA471] px-2 py-0.5 rounded-full font-bold">学术校准完成</span>
            </h2>
            <p className="text-xs text-[#4E5969] mt-0.5">申报方向：大模型产品经理 | 专业技术级评审</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <span className="bg-[#E8F3FF] text-[#0052D9] px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
              <Award size={14} />
              {effectiveScore >= 85 ? '推荐人选' : '高匹配潜力储备'}
            </span>
            <span className="bg-[#EFFFF1] text-[#2BA471] px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
              <TrendingUp size={14} />
              迁移潜力达 {hasDeepSeekResult ? Math.round(matchingResult!.dimensionMatches.find(d => d.dimension === '跨界潜力')?.score || 0) : Math.round(report.scores.potential)}%
            </span>
            {matchingResult && (
              <span className="bg-[#F3E8FF] text-[#8B5CF6] px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
                <Sparkles size={14} />
                DeepSeek匹配 {Math.round(matchingResult.overallScore)}%
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 self-start md:self-center">
          <button className="p-2.5 bg-[#F2F3F5] rounded-xl text-[#4E5969] hover:bg-[#E5E6EB] transition-all" title="导出数据密流">
            <Download size={18} />
          </button>
          <button className="p-2.5 bg-[#F2F3F5] rounded-xl text-[#4E5969] hover:bg-[#E5E6EB] transition-all" title="分享加密链接">
            <Share2 size={18} />
          </button>
        </div>
      </section>

      {/* DeepSeek Smart Match Toggle */}
      {matchingResult && (
        <section className="bg-white rounded-2xl border border-[#E5E6EB]/80 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowSmartMatch(!showSmartMatch)}
            className="w-full p-5 flex items-center justify-between hover:bg-[#F8FAFC] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0052D9] to-[#003EB3] rounded-xl flex items-center justify-center">
                <BrainIcon size={20} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-[#1D2129] flex items-center gap-2">
                  DeepSeek AI 五维度详情拆解
                  {aiStatus.anyFallback ? (
                    <span className="text-[10px] bg-[#FFF7E8] text-[#E37318] px-2 py-0.5 rounded-full font-normal">本地计算</span>
                  ) : (
                    <span className="text-[10px] bg-[#EFFFF1] text-[#2BA471] px-2 py-0.5 rounded-full font-normal">AI 实时分析</span>
                  )}
                </h3>
                <p className="text-xs text-[#86909C]">匹配项·差距项·技能缺口·学习路径 — 完整深度分析报告</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-[#86909C]">
                  {matchingResult.dimensionMatches.length} 维度 · {matchingResult.skillGaps.filter(g => g.gap !== 'none').length} 项差距
                </span>
              </div>
              {showSmartMatch ? <ChevronUp size={20} className="text-[#86909C]" /> : <ChevronDown size={20} className="text-[#86909C]" />}
            </div>
          </button>
          {showSmartMatch && (
            <div className="px-5 pb-5 border-t border-[#F2F3F5] pt-5">
              <MatchingReport result={matchingResult} />
            </div>
          )}
        </section>
      )}

      {/* Learning Resources Toggle */}
      {matchingResult && matchingResult.learningResources.length > 0 && (
        <section className="bg-white rounded-2xl border border-[#E5E6EB]/80 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowLearning(!showLearning)}
            className="w-full p-5 flex items-center justify-between hover:bg-[#F8FAFC] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-xl flex items-center justify-center">
                <BookIcon size={20} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-[#1D2129] flex items-center gap-2">
                  AI 智能学习资源推荐
                  {aiStatus.anyFallback ? (
                    <span className="text-[10px] bg-[#FFF7E8] text-[#E37318] px-2 py-0.5 rounded-full font-normal">内置推荐</span>
                  ) : (
                    <span className="text-[10px] bg-[#EFFFF1] text-[#2BA471] px-2 py-0.5 rounded-full font-normal">AI 实时推荐</span>
                  )}
                </h3>
                <p className="text-xs text-[#86909C]">
                  基于 {matchingResult.skillGaps.filter(g => g.gap !== 'none').length} 项技能差距，推荐 {matchingResult.learningResources.length} 个针对性学习资源
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#8B5CF6] bg-[#F3E8FF] px-2 py-1 rounded-full">
                {matchingResult.learningResources.length} 个资源
              </span>
              {showLearning ? <ChevronUp size={20} className="text-[#86909C]" /> : <ChevronDown size={20} className="text-[#86909C]" />}
            </div>
          </button>
          {showLearning && (
            <div className="px-5 pb-5 border-t border-[#F2F3F5] pt-5">
              <LearningRecommendations
                resources={matchingResult.learningResources}
                skillGaps={matchingResult.skillGaps}
              />
            </div>
          )}
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart & Breakdown (7 cols) */}
        <section className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E5E6EB]/80 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold flex items-center gap-1.5 text-[#1D2129]">
                <Target className="text-[#0052D9]" size={16} />
                能力极坐标雷达展现
              </h3>
              <span className="text-[10px] text-[#86909C] font-semibold">💡 点击下方进度条可精细查阅评估白盒对齐</span>
            </div>
            
            <div className="h-60 w-full flex items-center justify-center relative bg-gradient-to-b from-[#F8FAFC]/50 to-white rounded-2xl border border-[#F2F3F5] p-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                  <PolarGrid stroke="#E5E6EB" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#4E5969', fontSize: 11, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={45} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="能力指标对齐率"
                    dataKey="A"
                    stroke="#0052D9"
                    fill="#0052D9"
                    fillOpacity={0.08}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#0052D9' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#003EB3' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {hasDeepSeekResult
              ? matchingResult!.dimensionMatches.map((dm, idx) => {
                  const isActive = activeDimension === idx;
                  return (
                    <div 
                      key={dm.dimension} 
                      onClick={() => setActiveDimension(idx)}
                      className={cn(
                        "p-2.5 rounded-xl border transition-all cursor-pointer text-left relative overflow-hidden group",
                        isActive 
                          ? "bg-[#E8F3FF]/40 border-[#0052D9]/30" 
                          : "bg-white border-transparent hover:bg-[#F8FAFC]"
                      )}
                    >
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[#4E5969] font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: chartData[idx].color }} />
                          {dm.dimension}
                          <span className="text-[9px] text-[#86909C] font-normal">(权重 {Math.round(dm.weight * 100)}%)</span>
                        </span>
                        <span className="font-extrabold text-[#1D2129]">
                          {Math.round(dm.score)} <span className="text-[#86909C] font-normal">/ 100</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#F2F3F5] rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${dm.score}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: chartData[idx].color }}
                        />
                      </div>
                    </div>
                  );
                })
              : SCORING_WEIGHTS.map((item, idx) => {
                  const isActive = activeDimension === idx;
                  return (
                    <div 
                      key={item.label} 
                      onClick={() => setActiveDimension(idx)}
                      className={cn(
                        "p-2.5 rounded-xl border transition-all cursor-pointer text-left relative overflow-hidden group",
                        isActive 
                          ? "bg-[#E8F3FF]/40 border-[#0052D9]/30" 
                          : "bg-white border-transparent hover:bg-[#F8FAFC]"
                      )}
                    >
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[#4E5969] font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.label}
                          <span className="text-[9px] text-[#86909C] font-normal">(占比 {Math.round(item.weight * 100)}%)</span>
                        </span>
                        <span className="font-extrabold text-[#1D2129]">
                          {Math.round(rawScores[idx])} <span className="text-[#86909C] font-normal">/ {maxScores[idx]}</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#F2F3F5] rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${normalizedScores[idx]}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </section>

        {/* Selected Dimension Insight & Advice (5 cols) */}
        <section className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#E5E6EB]/80 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-[#F2F3F5] pb-3">
              <Info className="text-[#0052D9] shrink-0" size={16} />
              <h4 className="text-xs font-bold text-[#1D2129] uppercase tracking-wider">
                {hasDeepSeekResult ? 'DeepSeek AI 深度维度拆解' : '主动指标拆解与学术释义'}
              </h4>
            </div>

            <div className="space-y-3.5 text-left">
              <div>
                <span className="text-[10px] text-white font-extrabold px-2 py-0.5 rounded" style={{ backgroundColor: chartData[activeDimension].color }}>
                  维度 {activeDimension + 1}
                </span>
                {hasDeepSeekResult ? (
                  <>
                    <h5 className="text-base font-bold text-[#1D2129] mt-1.5">
                      {matchingResult!.dimensionMatches[activeDimension].dimension}
                      <span className="text-sm font-normal text-[#86909C] ml-2">
                        得分: {Math.round(matchingResult!.dimensionMatches[activeDimension].score)} / 100
                      </span>
                    </h5>
                    <p className="text-xs text-[#4E5969] mt-1 leading-relaxed">
                      {matchingResult!.dimensionMatches[activeDimension].detail}
                    </p>
                  </>
                ) : (
                  <>
                    <h5 className="text-base font-bold text-[#1D2129] mt-1.5">
                      {dimensionDetails[activeDimension].title}
                    </h5>
                    <p className="text-xs text-[#4E5969] mt-1 leading-relaxed">
                      {dimensionDetails[activeDimension].desc}
                    </p>
                  </>
                )}
              </div>

              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#F2F3F5]">
                <div className="text-[10px] uppercase font-bold text-[#86909C] tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles size={11} className="text-[#0052D9]" />
                  核心子能力分项考量
                </div>
                <ul className="space-y-1.5">
                  {hasDeepSeekResult
                    ? matchingResult!.dimensionMatches[activeDimension].matchedPoints.map((pt, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2BA471]" />
                          <span className="text-[#2BA471] font-semibold">{pt}</span>
                        </li>
                      ))
                    : dimensionDetails[activeDimension].subMetrics.map((sm, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-[#1D2129]">
                          <span className="w-1 h-1 rounded-full bg-[#0052D9]" />
                          <span className="font-semibold">{sm}</span>
                        </li>
                      ))
                  }
                  {hasDeepSeekResult && matchingResult!.dimensionMatches[activeDimension].gapPoints.length > 0 && (
                    matchingResult!.dimensionMatches[activeDimension].gapPoints.map((gp, i) => (
                      <li key={`gap-${i}`} className="flex items-center gap-2 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D54941]" />
                        <span className="text-[#D54941] font-semibold">{gp}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="p-3.5 bg-[#FFF9F3] rounded-xl border border-[#FFE4BA] text-[#E37318]">
                <div className="text-[10px] uppercase font-bold text-[#E37318] tracking-wider mb-1 flex items-center gap-1">
                  <ArrowUpRight size={12} />
                  HR 研判与复核建议 (Interviewer Guide)
                </div>
                <p className="text-xs leading-relaxed text-[#8F4800]">
                  {hasDeepSeekResult 
                    ? (matchingResult!.recommendation === 'highly_recommend' 
                        ? '强烈推荐！候选人各维度匹配度优秀，建议优先安排深度面试。'
                        : matchingResult!.recommendation === 'recommend'
                        ? '推荐进入面试环节。候选人在核心维度表现出色，部分技能差距可通过入职后培训弥补。'
                        : matchingResult!.recommendation === 'consider'
                        ? '可考虑面试，但需重点考察候选人的技能差距项，建议针对弱项设置专项面试环节。'
                        : matchingResult!.recommendation === 'not_recommend'
                        ? '当前匹配度较低，建议等待更合适的候选人。如业务急需，可安排轻量级面试。'
                        : '基于AI分析结果，建议根据匹配得分和技能差距综合决策。')
                    : dimensionDetails[activeDimension].actionableAdvice
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-[#86909C] flex items-center gap-1 pt-2 border-t border-[#F2F3F5]">
            <Shield size={11} className="text-[#0052D9]" />
            双轨学术核准 | 本报告已开启全流程不可篡改安全锁定
          </div>
        </section>
      </div>

      {/* AI Analysis (The 3-part structure) */}
      <div className="grid grid-cols-1 gap-6">
        <section className="bg-white rounded-2xl p-6 border border-[#E5E6EB]/80 shadow-sm space-y-6">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <Sparkles className="text-[#0052D9]" size={16} />
            白盒定量智推评语
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative pl-5 border-l-2 border-[#2BA471]">
              <div className="absolute -left-[6px] top-0 w-2.5 h-2.5 bg-[#2BA471] rounded-full border-2 border-white" />
              <h4 className="font-bold text-[#2BA471] text-xs mb-1.5">高光优势点诊断 (Strength Highlight)</h4>
              <p className="text-xs text-[#4E5969] leading-relaxed">
                {report.analysis.highlight}
              </p>
            </div>

            <div className="relative pl-5 border-l-2 border-[#0052D9]">
              <div className="absolute -left-[6px] top-0 w-2.5 h-2.5 bg-[#0052D9] rounded-full border-2 border-white" />
              <h4 className="font-bold text-[#0052D9] text-xs mb-1.5">客观适配程度解析 (Adaptation Gap)</h4>
              <p className="text-xs text-[#4E5969] leading-relaxed">
                {report.analysis.adaptation}
              </p>
            </div>

            <div className="relative pl-5 border-l-2 border-[#E37318]">
              <div className="absolute -left-[6px] top-0 w-2.5 h-2.5 bg-[#E37318] rounded-full border-2 border-white" />
              <h4 className="font-bold text-[#E37318] text-xs mb-1.5">未来成长路径规划 (Growth Blueprint)</h4>
              <p className="text-xs text-[#4E5969] leading-relaxed">
                {report.analysis.growth}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F2F3F5]">
            <div className="flex items-center gap-3 p-3.5 bg-[#F7F8FA] rounded-xl border border-[#F2F3F5]">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs shrink-0">
                <Shield className="text-[#0052D9]" size={16} />
              </div>
              <div className="text-[10px] text-[#86909C]">
                <p className="font-bold text-[#1D2129] mb-0.5">算法可解释性与对齐声明</p>
                <p>基于通用学术指标的智能评估报告，评估逻辑符合企业技术委员会与战略组织发展的双重校准体系，杜绝品牌垄断性算法歧视。</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-[#4E5969] bg-white border border-[#E5E6EB] hover:bg-[#F2F3F5] transition-all text-xs"
        >
          <ChevronLeft size={16} />
          更正并返回
        </button>
        <button
          onClick={onNext}
          className="bg-[#0052D9] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#003EB3] transition-all hover:shadow-lg hover:shadow-[#0052D9]/15 text-xs"
        >
          确认成果并开启答复建档
        </button>
      </div>
    </div>
  );
}

// 内联图标组件
function BrainIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5Z"/>
      <path d="M12 4.5v15M8 8c-1.5 0-2.5 1-2.5 2.5S6.5 13 8 13"/>
      <path d="M16 8c1.5 0 2.5 1 2.5 2.5S17.5 13 16 13"/>
    </svg>
  );
}

function BookIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
      <path d="M12 6v14"/>
      <path d="M8 10h2"/>
      <path d="M8 14h2"/>
    </svg>
  );
}
