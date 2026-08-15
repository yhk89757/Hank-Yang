import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { JOBS, PROCESS_STAGES } from '../../constants';
import { cn } from '../../lib/utils';
import { LayoutDashboard, Users, TrendingUp, AlertTriangle, CheckCircle2, Search, Filter, Clock, Brain, Save, Sparkles, Cpu, MessageSquare, X, Send, RotateCcw, FileText, ShieldCheck, BarChart2, Download } from 'lucide-react';
import { AiConfig, Complaint } from '../../types';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as apiDataService from '../../services/apiDataService';

const SCORE_DISTRIBUTION = [
  { range: '90-100', count: 12 },
  { range: '80-89', count: 45 },
  { range: '70-79', count: 32 },
  { range: '60-69', count: 18 },
  { range: '<60', count: 5 },
];

const JOB_POPULARITY = JOBS.map(j => ({
  name: j.title.split('-').pop()?.trim() || j.title,
  value: Math.floor(Math.random() * 100) + 20
})).sort((a, b) => b.value - a.value);

const COLORS = ['#0052D9', '#2BA471', '#E37318', '#D54941', '#86909C'];

interface AdminDashboardProps {
  candidates: {
    name: string;
    job: string;
    score: number;
    status: string;
  }[];
  aiConfig: AiConfig | null;
  onUpdateConfig: (config: AiConfig) => void;
}

export function AdminDashboard({ candidates, aiConfig, onUpdateConfig }: AdminDashboardProps) {
  const today = new Date('2026-04-12'); // Fixed current date for demo consistency
  const totalCandidates = candidates.length + 240; // Mocking a larger pool for visual impact
  const reviewPending = candidates.filter(c => c.status === '复核中' || c.status === '申诉待处理' || c.status === '投诉处理中').length;

  const [localConfig, setLocalConfig] = React.useState<AiConfig | null>(aiConfig);
  const [complaints, setComplaints] = React.useState<Complaint[]>([]);
  const [feedbacks, setFeedbacks] = React.useState<any[]>([]);
  const [selectedComplaint, setSelectedComplaint] = React.useState<Complaint | null>(null);
  const [selectedCandidateReport, setSelectedCandidateReport] = React.useState<any | null>(null);
  const [hrFeedback, setHrFeedback] = React.useState('');
  const [showWarningCenter, setShowWarningCenter] = React.useState(false);
  const [selectedFeedback, setSelectedFeedback] = React.useState<any | null>(null);

  // Simulated AI loading & exporting analytical states in Admin View
  const [isAdminAnalyzing, setIsAdminAnalyzing] = React.useState(false);
  const [adminAnalysisStep, setAdminAnalysisStep] = React.useState(0);
  const [isAdminExporting, setIsAdminExporting] = React.useState(false);
  const [adminExportProgress, setAdminExportProgress] = React.useState(0);
  const [adminExportStep, setAdminExportStep] = React.useState('');

  const complaintStats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    appeals: complaints.filter(c => c.type !== '投诉').length,
    complaints: complaints.filter(c => c.type === '投诉').length
  };

  const fetchComplaints = async () => {
    try {
      const { data } = await apiDataService.getComplaints();
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints from localStorage:', error);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const { data } = await apiDataService.getFeedbacks();
      setFeedbacks(data);
    } catch (error) {
      console.error('Failed to fetch feedbacks from localStorage:', error);
    }
  };

  React.useEffect(() => {
    fetchComplaints();
    fetchFeedbacks();
    const interval = setInterval(() => {
      fetchComplaints();
      fetchFeedbacks();
    }, 5000); // Poll for new data
    return () => clearInterval(interval);
  }, []);

  const handleResolveComplaint = async (id: string) => {
    try {
      await apiDataService.updateComplaint(id, { status: 'resolved', feedback: hrFeedback });
      setSelectedComplaint(null);
      setHrFeedback('');
      fetchComplaints();
    } catch (error) {
      console.error('Failed to resolve complaint in localStorage:', error);
    }
  };

  const handleOpenReport = (candidate: any) => {
    setSelectedCandidateReport(candidate);
    setIsAdminAnalyzing(true);
    setAdminAnalysisStep(0);
    const steps = [
      '🔍 正在连接核心大模型提取内部诊断特征...',
      '⚖️ 正在测算岗位认知与契合度偏差权重系数...',
      '📊 正在绘制高内聚高鲁棒性职业能力雷达蛛网...',
      '🎯 生成就绪！正在渲染候选人AI透明诊断报告...'
    ];
    let timer = 0;
    steps.forEach((text, i) => {
      setTimeout(() => {
        setAdminAnalysisStep(i);
        if (i === steps.length - 1) {
          setTimeout(() => {
            setIsAdminAnalyzing(false);
          }, 600);
        }
      }, timer);
      timer += 500;
    });
  };

  const handleExportAdminReport = () => {
    if (isAdminExporting) return;
    setIsAdminExporting(true);
    setAdminExportProgress(0);
    setAdminExportStep('⏳ 正在建立至企业内部安全存储云的导出通道...');

    const steps = [
      { p: 20, text: '📅 正在校对候选人内部诊断评测雷达元数据...' },
      { p: 45, text: '🔒 正在执行大模型指令防注入审核与内部安全打标...' },
      { p: 70, text: '📜 正在装载 PDF 高像素模板，写入及安全合规专属背景层...' },
      { p: 90, text: '🛰️ 报告封装完成，正在触发浏览器本地物理存储区存储...' },
      { p: 100, text: '🎉 安全导出成功！即将启动自动静默下载。' }
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < steps.length) {
        setAdminExportProgress(steps[currentIndex].p);
        setAdminExportStep(steps[currentIndex].text);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsAdminExporting(false);
          const rawText = `
==================================================
           智能岗途 - 职业专家AI诊断报告
==================================================
测评人姓名：${selectedCandidateReport?.name || '候选人'}
目标转岗岗：${selectedCandidateReport?.job || '未定义'}
转岗诊断分：${selectedCandidateReport?.score || 'N/A'} 分 [AI综合评定通过]
导出时间码：2026年 [内部专属合规绝密件，切勿外泄]
==================================================
          `;
          const element = document.createElement("a");
          const file = new Blob([rawText], {type: 'text/plain'});
          element.href = URL.createObjectURL(file);
          element.download = `${selectedCandidateReport?.name || '候选人'}_AI诊断分析报告.txt`;
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }, 800);
      }
    }, 400);
  };

  React.useEffect(() => {
    if (aiConfig) setLocalConfig(aiConfig);
  }, [aiConfig]);

  if (!localConfig) return null;

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 px-4 sm:px-6 lg:px-10">
      {/* Header with Status Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#1D2129]">管理控制台</h2>
          <p className="text-sm text-[#86909C]">实时监控全公司转岗动态与 AI 评估质量</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-[#E5E6EB] shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[#2BA471] animate-pulse" />
          <span className="text-xs font-bold text-[#4E5969]">系统运行中 · 胜任力大模型 3.0</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: '总申请人数', value: totalCandidates.toString(), icon: Users, color: '#0052D9' },
          { label: '平均匹配度', value: candidates.length > 0 ? (candidates.reduce((acc, c) => acc + c.score, 0) / candidates.length).toFixed(1) + '%' : '82.4%', icon: TrendingUp, color: '#2BA471' },
          { label: '待复核申诉', value: reviewPending.toString(), icon: AlertTriangle, color: '#E37318' },
          { label: '已完成评估', value: (totalCandidates - reviewPending).toString(), icon: CheckCircle2, color: '#0052D9' },
        ].map(stat => (
          <div key={stat.label} className="lighthouse-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${stat.color}10`, color: stat.color }}>
                <stat.icon size={20} />
              </div>
              <span className="text-xs font-bold text-[#2BA471]">+12%</span>
            </div>
            <div className="text-2xl font-black text-[#1D2129]">{stat.value}</div>
            <div className="text-xs text-[#86909C] font-medium mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-[700px]">
        {/* Left Column: Process & Candidates (8 cols) */}
        <div className="lg:col-span-8 space-y-8 flex flex-col">
          {/* Process Nodes Overview - Horizontal & Visual */}
          <section className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Clock size={20} className="text-[#0052D9]" />
                转岗全流程监控
              </h3>
              <div className="flex items-center gap-2 text-xs font-bold text-[#2BA471] bg-[#EFFFF1] px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2BA471] animate-pulse" />
                预计剩余 11 天
              </div>
            </div>
            
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-[18px] left-0 w-full h-[2px] bg-[#F2F3F5] z-0" />
              
              <div className="grid grid-cols-4 gap-4 relative z-10">
                {PROCESS_STAGES.map((stage) => {
                  const isPast = new Date(stage.endDate) < today;
                  const isCurrent = today >= new Date(stage.startDate) && today <= new Date(stage.endDate);
                  
                  let detail = '';
                  if (stage.id === 'ai_screening') detail = stage.adminDetail(totalCandidates - reviewPending, totalCandidates);
                  else if (stage.id === 'manual_review') detail = stage.adminDetail(reviewPending);
                  else detail = stage.adminDetail();

                  return (
                    <div key={stage.id} className="space-y-4">
                      <div className={cn(
                        "w-9 h-9 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-all",
                        isPast ? "bg-[#2BA471]" : isCurrent ? "bg-[#0052D9] scale-110 ring-4 ring-[#0052D9]/10" : "bg-[#F2F3F5]"
                      )}>
                        {isPast ? <CheckCircle2 size={16} className="text-white" /> : 
                         isCurrent ? <Clock size={16} className="text-white animate-spin-slow" /> : 
                         <div className="w-2 h-2 rounded-full bg-[#86909C]" />}
                      </div>
                      <div className="space-y-1">
                        <div className={cn(
                          "text-sm font-bold truncate",
                          isCurrent ? "text-[#0052D9]" : "text-[#1D2129]"
                        )}>
                          {stage.label}
                        </div>
                        <div className="text-[10px] text-[#86909C] font-medium">
                          {stage.startDate.split('-').slice(1).join('/')}-{stage.endDate.split('-').slice(1).join('/')}
                        </div>
                        <div className="text-[10px] text-[#86909C] leading-tight bg-[#F7F8FA] p-2 rounded-lg border border-[#F2F3F5]">
                          {detail}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Candidate List Table */}
          <section className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm flex-1 min-h-[450px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Users size={20} className="text-[#0052D9]" />
                候选人实时动态
              </h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86909C]" size={14} />
                  <input type="text" placeholder="搜索候选人..." className="pl-9 pr-4 py-1.5 bg-[#F2F3F5] rounded-lg border-none text-xs focus:ring-1 focus:ring-[#0052D9]" />
                </div>
                <button className="p-1.5 bg-[#F2F3F5] rounded-lg text-[#4E5969] hover:bg-[#E5E6EB]">
                  <Filter size={14} />
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#86909C] border-b border-[#F2F3F5]">
                    <th className="text-left font-medium pb-4">候选人</th>
                    <th className="text-left font-medium pb-4">意向岗位</th>
                    <th className="text-left font-medium pb-4">综合分</th>
                    <th className="text-left font-medium pb-4">状态</th>
                    <th className="text-right font-medium pb-4">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F3F5]">
                  {candidates.map((candidate, i) => (
                    <tr key={i} className="group hover:bg-[#F7F8FA] transition-colors">
                      <td className="py-4 font-bold">{candidate.name}</td>
                      <td className="py-4 text-[#4E5969]">{candidate.job}</td>
                      <td className="py-4">
                        <span className="font-black text-[#0052D9]">{candidate.score}</span>
                      </td>
                      <td className="py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-bold",
                          candidate.status === '已通过' ? "bg-[#EFFFF1] text-[#2BA471]" : "bg-[#FFF7E8] text-[#E37318]"
                        )}>
                          {candidate.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => handleOpenReport(candidate)}
                          className="text-[#0052D9] font-bold text-xs hover:underline"
                        >
                          查看报告
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: AI Training & Analytics (4 cols) */}
        <div className="lg:col-span-4 space-y-8 flex flex-col">
          {/* AI Configuration Center - Refined Style */}
          <section className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm relative overflow-hidden flex-1 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0052D9] opacity-[0.02] blur-[80px] -mr-32 -mt-32 group-hover:opacity-[0.05] transition-opacity" />
            <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0052D9 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Brain size={20} className="text-[#0052D9]" />
                  AI 配置中心
                </h3>
                <button 
                  onClick={() => onUpdateConfig(localConfig)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0052D9] text-white rounded-xl text-xs font-bold hover:bg-[#003EB3] transition-all shadow-lg shadow-[#0052D9]/10"
                >
                  <Save size={14} />
                  保存配置
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#86909C] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={12} className="text-[#0052D9]" />
                    核心指令 (System Prompt)
                  </label>
                  <textarea 
                    value={localConfig.systemPrompt}
                    onChange={(e) => setLocalConfig({ ...localConfig, systemPrompt: e.target.value })}
                    className="w-full h-24 p-4 bg-[#F7F8FA] rounded-2xl border border-[#E5E6EB] text-xs text-[#1D2129] focus:ring-2 focus:ring-[#0052D9] transition-all resize-none placeholder:text-[#86909C]"
                    placeholder="输入 AI 评估智能体的核心指令..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#86909C] uppercase tracking-wider">API 模型</label>
                    <div className="relative">
                      <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86909C]" size={14} />
                      <input 
                        type="text" 
                        value={localConfig.modelName}
                        onChange={(e) => setLocalConfig({ ...localConfig, modelName: e.target.value })}
                        className="w-full pl-9 pr-4 py-2.5 bg-[#F7F8FA] rounded-xl border border-[#E5E6EB] text-xs text-[#1D2129] focus:ring-2 focus:ring-[#0052D9]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#86909C] uppercase tracking-wider">语言风格</label>
                    <input 
                      type="text" 
                      value={localConfig.languageStyle}
                      onChange={(e) => setLocalConfig({ ...localConfig, languageStyle: e.target.value })}
                      className="w-full p-2.5 bg-[#F7F8FA] rounded-xl border border-[#E5E6EB] text-xs text-[#1D2129] focus:ring-2 focus:ring-[#0052D9]"
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#F7F8FA] rounded-2xl border border-[#E5E6EB]">
                  <div className="text-[10px] font-bold text-[#86909C] uppercase tracking-wider mb-4">评分权重动态分配</div>
                  <div className="space-y-4">
                    {localConfig.weights.map((w, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[#4E5969]">{w.label}</span>
                          <span className="font-bold text-[#0052D9]">{(w.weight * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 bg-[#E5E6EB] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#0052D9] transition-all duration-500" 
                            style={{ width: `${w.weight * 100}%` }}
                          />
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={w.weight}
                          onChange={(e) => {
                            const newWeights = [...localConfig.weights];
                            newWeights[idx].weight = parseFloat(e.target.value);
                            setLocalConfig({ ...localConfig, weights: newWeights });
                          }}
                          className="w-full h-1 bg-transparent appearance-none cursor-pointer accent-[#0052D9]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Timeout Warning Monitoring */}
          <section className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#D54941] opacity-[0.03] -mr-8 -mt-8 rounded-full" />
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <AlertTriangle size={20} className="text-[#D54941]" />
              超时预警监控
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#FFF7E8] rounded-2xl border border-[#FFE4BA]">
                <div className="text-[10px] text-[#E37318] font-bold mb-1 uppercase">待复核超时</div>
                <div className="text-2xl font-black text-[#E37318]">{complaints.filter(c => c.status === 'pending').length}</div>
              </div>
              <div className="p-4 bg-[#FFF2F0] rounded-2xl border border-[#FFD8D4]">
                <div className="text-[10px] text-[#D54941] font-bold mb-1 uppercase">申诉待处理</div>
                <div className="text-2xl font-black text-[#D54941]">{complaints.filter(c => c.type === '投诉' && c.status === 'pending').length}</div>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              {complaints.filter(c => c.status === 'pending').slice(0, 2).map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedComplaint(c)}
                  className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E5E6EB] cursor-pointer hover:border-[#0052D9] transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-[#1D2129]">{c.candidateName}</span>
                    <span className={cn(
                      "text-[8px] px-1.5 py-0.5 rounded font-bold",
                      c.type === '投诉' ? "bg-[#D54941] text-white" : "bg-[#0052D9] text-white"
                    )}>
                      {c.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#86909C] truncate">{c.content}</p>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowWarningCenter(true)}
              className="relative z-20 w-full mt-6 py-3 bg-[#D54941] text-white rounded-xl text-sm font-bold hover:bg-[#B33B34] transition-all shadow-lg shadow-[#D54941]/10 cursor-pointer"
            >
              进入预警处理中心
            </button>
          </section>

          {/* Job Popularity Pie Chart */}
          <section className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm">
            <h3 className="text-lg font-bold mb-6">岗位热度分布</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={JOB_POPULARITY}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {JOB_POPULARITY.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
              {JOB_POPULARITY.slice(0, 4).map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-[#4E5969] truncate">{item.name}</span>
                  </div>
                  <span className="font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Bottom Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Score Distribution */}
        <section className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
            <LayoutDashboard size={20} className="text-[#0052D9]" />
            转岗评分分布
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SCORE_DISTRIBUTION}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F3F5" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#86909C', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#86909C', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#F7F8FA' }}
                />
                <Bar dataKey="count" fill="#0052D9" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Appeals & Complaints Analytics */}
        <section className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
            <AlertTriangle size={20} className="text-[#D54941]" />
            申诉与投诉看板
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#F7F8FA] rounded-2xl border border-[#E5E6EB]">
                <div className="text-[10px] text-[#86909C] font-bold mb-1 uppercase">总申诉量</div>
                <div className="text-2xl font-black text-[#1D2129]">{complaintStats.appeals}</div>
              </div>
              <div className="p-4 bg-[#FFF2F0] rounded-2xl border border-[#FFD8D4]">
                <div className="text-[10px] text-[#D54941] font-bold mb-1 uppercase">总投诉量</div>
                <div className="text-2xl font-black text-[#D54941]">{complaintStats.complaints}</div>
              </div>
            </div>
            
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: '已处理', value: complaintStats.resolved },
                      { name: '待处理', value: complaintStats.pending }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#2BA471" />
                    <Cell fill="#E37318" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 text-[10px] font-bold">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#2BA471]" />
                <span className="text-[#4E5969]">已处理 ({complaintStats.resolved})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#E37318]" />
                <span className="text-[#4E5969]">待处理 ({complaintStats.pending})</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback & Satisfaction Analytics */}
        <section className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp size={20} className="text-[#2BA471]" />
              员工满意度
            </h3>
            <div className="text-xs font-bold text-[#2BA471] bg-[#EFFFF1] px-3 py-1 rounded-full">
              {(feedbacks.reduce((acc, f) => acc + f.rating, 0) / (feedbacks.length || 1)).toFixed(1)} / 5.0
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[1, 2, 3, 4, 5].map(r => ({
                  rating: `${r}星`,
                  count: feedbacks.filter(f => f.rating === r).length
                }))}>
                  <XAxis dataKey="rating" axisLine={false} tickLine={false} tick={{ fill: '#86909C', fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2BA471" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2 overflow-y-auto max-h-32 custom-scrollbar pr-2">
              {feedbacks.slice(0, 3).map((f, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedFeedback(f)}
                  className="p-3 bg-[#F7F8FA] rounded-xl border border-[#F2F3F5] cursor-pointer hover:border-[#0052D9] hover:bg-white transition-all group relative"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Search size={10} className="text-[#0052D9]" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#0052D9] text-white text-[8px] flex items-center justify-center font-bold">
                        {f.candidateName?.[0] || 'Y'}
                      </div>
                      <span className="text-[10px] font-bold text-[#1D2129]">{f.candidateName || '杨鸿康'}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <div key={idx} className={cn("w-1 h-1 rounded-full", idx < f.rating ? "bg-[#E37318]" : "bg-[#E5E6EB]")} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-[#4E5969] line-clamp-2 leading-relaxed mb-1">{f.suggestion || '无建议内容'}</p>
                  <div className="text-right">
                    <span className="text-[8px] text-[#86909C] font-bold">{new Date(f.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Warning Center Full-screen View */}
      <AnimatePresence>
        {showWarningCenter && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[60] bg-[#F7F8FA] flex flex-col"
          >
            <div className="bg-white border-b border-[#E5E6EB] p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setShowWarningCenter(false)} className="p-2 hover:bg-[#F2F3F5] rounded-full transition-all">
                  <RotateCcw size={20} className="text-[#4E5969]" />
                </button>
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <AlertTriangle className="text-[#D54941]" />
                    预警处理中心
                  </h2>
                  <p className="text-xs text-[#86909C]">集中处理员工申诉、投诉及超时复核任务</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-[#FFF2F0] rounded-xl border border-[#FFD8D4] flex items-center gap-3">
                  <span className="text-xs font-bold text-[#D54941]">待处理投诉</span>
                  <span className="text-lg font-black text-[#D54941]">{complaints.filter(c => c.type === '投诉' && c.status === 'pending').length}</span>
                </div>
                <button onClick={() => setShowWarningCenter(false)} className="p-2 hover:bg-[#F2F3F5] rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex">
              {/* Sidebar Filters */}
              <div className="w-64 bg-white border-r border-[#E5E6EB] p-6 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-[#86909C] uppercase tracking-wider">处理优先级</h4>
                  <div className="space-y-2">
                    {['全部预警', '紧急投诉', '常规申诉', '超时复核'].map(filter => (
                      <button key={filter} className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#F7F8FA] transition-all">
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main List */}
              <div className="flex-1 p-8 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {complaints.length > 0 ? complaints.map(c => (
                    <div 
                      key={c.id} 
                      className={cn(
                        "bg-white p-6 rounded-3xl border transition-all flex items-center justify-between hover:shadow-md",
                        c.status === 'pending' ? "border-[#E5E6EB]" : "border-[#F2F3F5] opacity-60"
                      )}
                    >
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center",
                          c.type === '投诉' ? "bg-[#FFF2F0] text-[#D54941]" : "bg-[#F0F7FF] text-[#0052D9]"
                        )}>
                          {c.type === '投诉' ? <AlertTriangle size={24} /> : <MessageSquare size={24} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-lg">{c.candidateName}</span>
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold",
                              c.type === '投诉' ? "bg-[#D54941] text-white" : "bg-[#0052D9] text-white"
                            )}>
                              {c.type}
                            </span>
                          </div>
                          <p className="text-sm text-[#4E5969]">{c.content}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right mr-4">
                          <div className="text-[10px] text-[#86909C] font-bold uppercase">提交时间</div>
                          <div className="text-xs font-medium">{new Date(c.timestamp).toLocaleString()}</div>
                        </div>
                        {c.status === 'pending' ? (
                          <button 
                            onClick={() => setSelectedComplaint(c)}
                            className="px-6 py-2.5 bg-[#0052D9] text-white rounded-xl font-bold hover:bg-[#003EB3] transition-all shadow-lg shadow-[#0052D9]/10"
                          >
                            立即处理
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-[#2BA471] font-bold text-sm">
                            <CheckCircle2 size={16} />
                            已处理
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                      <div className="w-20 h-20 bg-[#F2F3F5] rounded-full flex items-center justify-center text-[#86909C]">
                        <CheckCircle2 size={40} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold text-[#1D2129]">暂无待处理预警</h4>
                        <p className="text-sm text-[#86909C]">所有申诉与投诉均已处理完毕，系统运行良好。</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Detail Modal */}
      <AnimatePresence>
        {selectedFeedback && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#F2F3F5] flex items-center justify-between">
                <h4 className="text-lg font-bold">员工反馈详情</h4>
                <button onClick={() => setSelectedFeedback(null)} className="p-2 hover:bg-[#F2F3F5] rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#E8F3FF] flex items-center justify-center text-[#0052D9] font-black text-xl">
                    {selectedFeedback.candidateName?.[0] || 'Y'}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{selectedFeedback.candidateName || '杨鸿康'}</div>
                    <div className="text-xs text-[#86909C]">{new Date(selectedFeedback.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-[#86909C] uppercase">满意度评分</div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Sparkles key={i} size={16} className={i < selectedFeedback.rating ? "text-[#E37318]" : "text-[#E5E6EB]"} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-[#86909C] uppercase">详细建议</div>
                  <div className="p-4 bg-[#F7F8FA] rounded-2xl text-sm text-[#4E5969] leading-relaxed italic">
                    “{selectedFeedback.suggestion || '该员工未提供具体文字建议。'}”
                  </div>
                </div>
              </div>
              <div className="p-6 bg-[#F7F8FA] text-center">
                <button 
                  onClick={() => setSelectedFeedback(null)}
                  className="w-full py-3 bg-[#0052D9] text-white rounded-xl font-bold hover:bg-[#003EB3] transition-all"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Candidate Report Modal */}
      <AnimatePresence>
        {selectedCandidateReport && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-[#F2F3F5] flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F0F7FF] flex items-center justify-center text-[#0052D9]">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1D2129]">{selectedCandidateReport.name} 的评估报告</h4>
                    <p className="text-xs text-[#86909C]">申请岗位：{selectedCandidateReport.job} | 评估日期：2026-04-12</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-[#EFFFF1] text-[#2BA471] rounded-xl text-sm font-bold flex items-center gap-2">
                    <ShieldCheck size={16} />
                    AI 认证报告
                  </div>
                  <button onClick={() => setSelectedCandidateReport(null)} className="p-2 hover:bg-[#F2F3F5] rounded-full transition-all">
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar relative">
                {/* AI Loading State Overlay */}
                <AnimatePresence>
                  {isAdminAnalyzing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/95 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-8 text-center space-y-6"
                    >
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-[#0052D9]/10 rounded-full" />
                        <div className="absolute inset-0 border-4 border-[#0052D9] border-t-transparent rounded-full animate-spin" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-base font-bold text-[#1D2129]">正在连接专属大模型胜任力评估引擎...</h4>
                        <p className="text-xs text-[#0052D9] font-medium font-mono min-h-[18px]">
                          { [
                            '🔍 正在连接核心大模型提取内部诊断特征...',
                            '⚖️ 正在测算岗位认知与契合度偏差权重系数...',
                            '📊 正在绘制高内聚高鲁棒性职业能力雷达蛛网...',
                            '🎯 生成就绪！正在渲染候选人AI透明诊断报告...'
                          ][adminAnalysisStep] }
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Score Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-[#F7F8FA] rounded-3xl border border-[#E5E6EB] text-center">
                    <div className="text-[10px] font-bold text-[#86909C] uppercase mb-2">综合评分</div>
                    <div className="text-5xl font-black text-[#0052D9]">{selectedCandidateReport.score}</div>
                    <div className="text-xs text-[#2BA471] mt-2 font-bold">击败了 88% 的候选人</div>
                  </div>
                  <div className="col-span-2 p-6 bg-white rounded-3xl border border-[#E5E6EB]">
                    <h5 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <BarChart2 size={16} className="text-[#0052D9]" />
                      维度分析
                    </h5>
                    <div className="space-y-4">
                      {[
                        { label: '专业技能', value: 92, color: '#0052D9' },
                        { label: '文化契合度', value: 85, color: '#2BA471' },
                        { label: '潜力评估', value: 78, color: '#E37318' }
                      ].map(dim => (
                        <div key={dim.label} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span>{dim.label}</span>
                            <span>{dim.value}</span>
                          </div>
                          <div className="h-2 bg-[#F2F3F5] rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${dim.value}%` }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: dim.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Detailed Feedback */}
                <div className="space-y-6">
                  <h5 className="text-lg font-bold text-[#1D2129] border-l-4 border-[#0052D9] pl-4">AI 评估详情</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h6 className="text-sm font-bold text-[#2BA471] flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        核心优势
                      </h6>
                      <ul className="space-y-3">
                        {[
                          '具备深厚的行业背景，对业务逻辑理解透彻',
                          '在过往项目中展现出卓越的领导力与团队协作能力',
                          '技术栈与目标岗位高度匹配，上手成本极低'
                        ].map((item, i) => (
                          <li key={i} className="flex gap-3 text-sm text-[#4E5969] leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2BA471] mt-2 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h6 className="text-sm font-bold text-[#E37318] flex items-center gap-2">
                        <AlertTriangle size={16} />
                        待提升项
                      </h6>
                      <ul className="space-y-3">
                        {[
                          '在跨组织协同与多边对齐的精细化沟通上面仍有进一步优化空间',
                          '对新兴技术趋势的敏感度可以进一步加强',
                          '建议在入职后加强对公司内部流程的熟悉'
                        ].map((item, i) => (
                          <li key={i} className="flex gap-3 text-sm text-[#4E5969] leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E37318] mt-2 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className="p-6 bg-[#F0F7FF] rounded-3xl border border-[#B2D1FF]">
                  <h5 className="text-sm font-bold text-[#0052D9] mb-3">AI 最终建议</h5>
                  <p className="text-sm text-[#003EB3] leading-relaxed font-medium">
                    该候选人综合素质极高，特别是在专业技能与文化契合度方面表现优异。建议尽快安排终面，并重点考察其在复杂场景下的决策能力。预计入职后能迅速为团队带来价值。
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-[#F7F8FA] border-t border-[#F2F3F5] flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedCandidateReport(null)}
                  className="px-8 py-3 bg-white border border-[#E5E6EB] text-[#4E5969] rounded-xl font-bold hover:bg-[#F2F3F5] transition-all"
                >
                  关闭
                </button>
                <button 
                  disabled={isAdminExporting}
                  onClick={handleExportAdminReport}
                  className="px-8 py-3 bg-[#0052D9] text-white rounded-xl font-bold hover:bg-[#003EB3] transition-all shadow-lg shadow-[#0052D9]/10 flex items-center gap-2"
                >
                  <Download size={16} className={isAdminExporting ? "animate-bounce" : ""} />
                  {isAdminExporting ? `正在导出 (${adminExportProgress}%)` : '导出分析报告'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Export Latch Overlay */}
      <AnimatePresence>
        {isAdminExporting && (
          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-[#E5E6EB] text-center space-y-6"
            >
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 border-4 border-[#F2F3F5] rounded-full" />
                <div className="absolute inset-0 border-4 border-[#0052D9] border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-3 bg-[#E8F3FF] rounded-full flex items-center justify-center text-[#0052D9]">
                  <Download size={20} />
                </div>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-[#1D2129]">正在导出 AI 胜任力评估报告</h4>
                <p className="text-[10px] text-[#86909C] font-mono leading-relaxed min-h-[36px]">
                  {adminExportStep}
                </p>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 bg-[#F2F3F5] rounded-full overflow-hidden w-full">
                  <div 
                    className="h-full bg-[#0052D9] transition-all duration-300"
                    style={{ width: `${adminExportProgress}%` }}
                  />
                </div>
                <div className="text-right text-[9px] font-bold text-[#0052D9]">{adminExportProgress}%</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Complaint Detail Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#F2F3F5] flex items-center justify-between">
                <h4 className="text-lg font-bold flex items-center gap-2">
                  <MessageSquare size={20} className="text-[#0052D9]" />
                  处理申诉/投诉
                </h4>
                <button onClick={() => setSelectedComplaint(null)} className="p-2 hover:bg-[#F2F3F5] rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F2F3F5] flex items-center justify-center font-bold text-[#0052D9]">
                        {selectedComplaint.candidateName[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold">{selectedComplaint.candidateName}</div>
                        <div className="text-[10px] text-[#86909C]">{selectedComplaint.timestamp}</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-[#F0F7FF] text-[#0052D9] rounded-lg text-[10px] font-bold">
                      {selectedComplaint.type}
                    </span>
                  </div>
                  <div className="p-4 bg-[#F7F8FA] rounded-2xl text-sm text-[#4E5969] leading-relaxed">
                    {selectedComplaint.content}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-[#1D2129]">HR 复核反馈意见</label>
                  <textarea 
                    value={hrFeedback}
                    onChange={(e) => setHrFeedback(e.target.value)}
                    placeholder="请输入复核结果及对员工的激励性建议..."
                    className="w-full h-32 p-4 bg-[#F2F3F5] rounded-2xl border-none text-sm focus:ring-2 focus:ring-[#0052D9] transition-all resize-none"
                  />
                </div>
              </div>
              <div className="p-6 bg-[#F7F8FA] flex gap-3">
                <button 
                  onClick={() => handleResolveComplaint(selectedComplaint.id)}
                  className="flex-1 py-3 bg-[#0052D9] text-white rounded-xl font-bold hover:bg-[#003EB3] transition-all flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  确认并发送反馈
                </button>
                <button 
                  onClick={() => setSelectedComplaint(null)}
                  className="px-6 py-3 bg-white border border-[#E5E6EB] text-[#4E5969] rounded-xl font-bold hover:bg-[#F2F3F5] transition-all"
                >
                  暂存
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
