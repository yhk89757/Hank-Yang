import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Calendar, Clock, BookOpen, AlertTriangle, CheckCircle2, ChevronRight, 
  Award, Star, HelpCircle, Save, Send, ShieldCheck, Download, Sparkles, 
  FileText, Briefcase, User, Info, Check, MessageSquare, ClipboardList, PenTool 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Candidate } from '../../types';
import * as apiDataService from '../../services/apiDataService';

interface InterviewerDashboardProps {
  candidates: Candidate[];
  onRefreshCandidates?: () => void;
}

const SUPPLEMENTARY_CANDIDATES = [
  { 
    id: 101, 
    name: '陈七', 
    job: 'AI产品经理（游戏业务方向）', 
    score: 82, 
    status: '待面试', 
    time: '2026-06-13T10:30:00.000Z',
    period: 'tomorrow',
    details: {
      currentRole: '技术运营与游戏内 AIGC 应用主推人',
      background: '邮箱: chenqi@generic.com | 工作年限: 4年 | 毕业院校: 电子科技大学 (本科)',
      projects: [
        { title: '主导大型开放世界 AI NPC 行为树与自动对话生成', desc: '采用精简版本地 LLM 驱动 NPC 表现，大幅缩减人工文案输出量，提升玩家单机沉涉度 30%。' },
        { title: '游戏运营营销文案智能推荐及 A/B 智能测试分发', desc: '结合玩家画像与点击行为自动化出图与营销物料推荐，助力买量成本下降 15%。' }
      ],
      skills: ['游戏引擎脚本开发', 'LLM 智能体对话调优', 'AIGC 文生图管线部署', '敏捷产品上线迭代', '数据驱动运营分析'],
      conclusion: '具备突出的游戏业务感知和创新的交互落地能力，非常切合对应的游戏AI岗位要求。'
    }
  },
  { 
    id: 102, 
    name: '吴九', 
    job: '聚合游戏平台-用户体验专员', 
    score: 84, 
    status: '待面试', 
    time: '2026-06-14T14:15:00.000Z',
    period: 'after_tomorrow',
    details: {
      currentRole: '应用体验优化与中台交互负责人',
      background: '邮箱: wujiu@generic.com | 工作年限: 5年 | 毕业院校: 广州美术学院 (本科)',
      projects: [
        { title: '主导全端聚合游戏中心体验重构', desc: '开展大规模多端交互全链路诊断，在极精细的代码提点下优化路由跳转，留存直接提升 8%。' },
        { title: '多端游戏社区与玩家成长体系精益建立', desc: '设计激励流与碎片化互动组件，提高日活玩家长期对齐价值与沉浸感。' }
      ],
      skills: ['多端交互对齐规范', '全链路漏斗体验诊断', 'SQL 与复杂 BI 分析', '用户激励闭环设计', '轻量级组件渲染调优'],
      conclusion: '交互根基专业，具备优秀的全端体验统一设计与敏捷协作推进力。'
    }
  },
  { 
    id: 103, 
    name: '孙十', 
    job: '金融AI产品经理', 
    score: 90, 
    status: '待面试', 
    time: '2026-06-16T09:30:00.000Z',
    period: 'next_week',
    details: {
      currentRole: '金融业务科技与信用大模型策略产品专家',
      background: '邮箱: sunshi@generic.com | 工作年限: 5年 | 毕业院校: 西安交通大学 (硕士)',
      projects: [
        { title: '企业智能客服及 Query 精准分类决策树优化', desc: '通过搭建混淆矩阵与 Prompt 体系重构金融专属合规路由，分类召回率由 81% 提至 95%。' },
        { title: '风险自动研判策略与多因子合规归因系统', desc: '运用图论关联技术，构建智能风险自愈流控中台，支撑日均百万级安全数据审计。' }
      ],
      skills: ['金融风控制策对齐', 'LLM 语义分类与召回', 'Prompt Engineering 深度调优', '多模态数据挖掘', '跨团队说服与 ROI 精算'],
      conclusion: '思维极其严密，兼备金融合规红线嗅觉与优秀的模型产品思维组合。'
    }
  },
  { 
    id: 104, 
    name: '郑十一', 
    job: 'AI原生产品经理', 
    score: 86, 
    status: '待面试', 
    time: '2026-06-18T15:00:00.000Z',
    period: 'next_week',
    details: {
      currentRole: 'ToB 流程自动化与智能体架构师',
      background: '邮箱: zhengshiyi@generic.com | 工作年限: 6年 | 毕业院校: 上海交通大学 (本科)',
      projects: [
        { title: '主导研发全流程 AI 智能代理辅助构建与敏捷审查', desc: '打通编译与静态检测孤岛，在不泄露内部合规信息的情形下，使上线发布周期缩减 20%。' },
        { title: '跨系统经营指标自适应仪表盘与策略生成', desc: '对生产环境异常进行自动化兜底降级处理，减少约 35% 的冗余报警。' }
      ],
      skills: ['AI Agent 感知决策流设计', '大模型微前端嵌入技术', '多层嵌套重排自愈', 'ToB 场景深度拆解', '高带宽流量架构规划'],
      conclusion: '在 ToB 业务流程自动化以及大模型落地实效方面有深厚积淀，实战推进力极好。'
    }
  }
];

export function InterviewerDashboard({ candidates, onRefreshCandidates }: InterviewerDashboardProps) {
  // Demo Interview State
  const [selectedCandidate, setSelectedCandidate] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState<'resume' | 'jd' | 'ai' | 'feedback'>('resume');

  // Modern Calendar & View State
  const [scheduleView, setScheduleView] = React.useState<'list' | 'week' | 'month'>('week');
  const [selectedCalendarDate, setSelectedCalendarDate] = React.useState<number>(12); // June 12 by default (today)

  // Schedule range selection state: 'today', 'tomorrow', 'after_tomorrow', 'next_week'
  const [schedulePeriod, setSchedulePeriod] = React.useState<'today' | 'tomorrow' | 'after_tomorrow' | 'next_week'>('today');

  // Helper mapping: resolves a candidate to a specific calendar date in June 2026
  const getCandidateDay = React.useCallback((cand: any): number => {
    if (cand.time) {
      try {
        const d = new Date(cand.time);
        if (!isNaN(d.getTime())) {
          // If the date falls in June 2026, match it, otherwise use fallback logic
          if (d.getFullYear() === 2026 && d.getMonth() === 5) {
            return d.getDate();
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Static & relative evaluation rules mapping
    if (cand.period === 'today' || cand.name === '张三' || cand.name === '李四') return 12;
    if (cand.period === 'tomorrow' || cand.name === '王五' || cand.id === 3 || cand.id === 101) return 13;
    if (cand.period === 'after_tomorrow' || cand.name === '赵六' || cand.id === 4 || cand.id === 102) return 14;
    if (cand.name === '孙十' || cand.id === 103) return 16;
    if (cand.name === '郑十一' || cand.id === 104) return 18;
    return 12; // Fallback to Friday June 12
  }, []);

  // Compute standard candidate mapping combining parent and supplementary pools
  const allCandidatesList = React.useMemo(() => {
    const parentParsed = candidates.map(cand => {
      let period: 'today' | 'tomorrow' | 'after_tomorrow' | 'next_week' = 'today';
      if (cand.name === '王五' || cand.id === 3) {
        period = 'tomorrow';
      } else if (cand.name === '赵六' || cand.id === 4) {
        period = 'after_tomorrow';
      }
      return {
        ...cand,
        period,
        displayTime: cand.time ? new Date(cand.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '15:00'
      };
    });

    const supplementaryParsed = SUPPLEMENTARY_CANDIDATES.map(cand => ({
      ...cand,
      displayTime: new Date(cand.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }));

    return [...parentParsed, ...supplementaryParsed];
  }, [candidates]);

  const scheduleCounts = React.useMemo(() => {
    const parentParsed = candidates.map(cand => {
      let period: 'today' | 'tomorrow' | 'after_tomorrow' | 'next_week' = 'today';
      if (cand.name === '王五' || cand.id === 3) {
        period = 'tomorrow';
      } else if (cand.name === '赵六' || cand.id === 4) {
        period = 'after_tomorrow';
      }
      return period;
    });

    const supplementaryParsed = SUPPLEMENTARY_CANDIDATES.map(cand => cand.period);
    const all = [...parentParsed, ...supplementaryParsed];

    return {
      today: all.filter(p => p === 'today').length,
      tomorrow: all.filter(p => p === 'tomorrow').length,
      after_tomorrow: all.filter(p => p === 'after_tomorrow').length,
      next_week: all.filter(p => p === 'next_week').length,
    };
  }, [candidates]);

  // Combined candidates shown in sidebar depends on view state
  const displayedCandidates = React.useMemo(() => {
    if (scheduleView === 'list') {
      return allCandidatesList.filter(c => c.period === schedulePeriod);
    } else {
      return allCandidatesList.filter(c => getCandidateDay(c) === selectedCalendarDate);
    }
  }, [allCandidatesList, scheduleView, schedulePeriod, selectedCalendarDate, getCandidateDay]);

  // JD Interactive Evaluation State
  const [isJDEvalOpen, setIsJDEvalOpen] = React.useState<boolean>(false);
  const [jdMatchRating, setJdMatchRating] = React.useState<number>(4);
  const [jdMatchNotes, setJdMatchNotes] = React.useState<string>('');
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved'>('saved');

  // Auto-save debounced timer ref
  const saveTimeoutRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (selectedCandidate) {
      const stored = localStorage.getItem(`jd_eval_${selectedCandidate.id}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setJdMatchRating(parsed.rating || 4);
          setJdMatchNotes(parsed.notes || '');
          setSaveStatus('saved');
        } catch (e) {
          console.error(e);
        }
      } else {
        setJdMatchRating(4);
        setJdMatchNotes('');
        setSaveStatus('saved');
      }
    }
  }, [selectedCandidate?.id]);

  const handleJDEvalChange = (type: 'rating' | 'notes', val: any) => {
    if (type === 'rating') {
      setJdMatchRating(val);
    } else {
      setJdMatchNotes(val);
    }
    
    setSaveStatus('saving');
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (selectedCandidate) {
        localStorage.setItem(`jd_eval_${selectedCandidate.id}`, JSON.stringify({
          rating: type === 'rating' ? val : jdMatchRating,
          notes: type === 'notes' ? val : jdMatchNotes
        }));
        setSaveStatus('saved');
      }
    }, 600);
  };

  
  // Export Loading State
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState(0);
  const [exportStep, setExportStep] = React.useState('');

  // AI Loading State for Analysis
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisStep, setAnalysisStep] = React.useState(0);

  // Evaluation Form State
  const [interviewerScore, setInterviewerScore] = React.useState<string>('A');
  const [interviewerOpinion, setInterviewerOpinion] = React.useState<string>('');
  const [interviewerQuestionsFeedback, setInterviewerQuestionsFeedback] = React.useState<Record<string, string>>({});
  const [decision, setDecision] = React.useState<'pass' | 'recheck' | 'reject' | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // Sync initial candidate when active list shifts
  React.useEffect(() => {
    if (displayedCandidates.length > 0) {
      const isAlreadyIncluded = displayedCandidates.some(c => c.id === selectedCandidate?.id);
      if (!isAlreadyIncluded) {
        const defaultCand = displayedCandidates.find(c => c.name === '杨鸿康') || displayedCandidates[0];
        setSelectedCandidate(defaultCand);
        triggerAILoadingAnimation();
      }
    } else {
      setSelectedCandidate(null);
    }
  }, [displayedCandidates]);

  const triggerAILoadingAnimation = () => {
    setIsAnalyzing(true);
    setAnalysisStep(0);
    const steps = [
      '🔍 正在调取大模型建立候选人数字档案...',
      '📈 精细化对比目标岗位 JD 与人才画像特征...',
      '⚡ 融合高价值历史测评向量生成预测模型...',
      '🎯 生成定制化推荐提问矩阵与深度诊断分析...'
    ];
    
    let timer = 0;
    steps.forEach((text, i) => {
      setTimeout(() => {
        setAnalysisStep(i);
        if (i === steps.length - 1) {
          setTimeout(() => {
            setIsAnalyzing(false);
          }, 800);
        }
      }, timer);
      timer += 600;
    });
  };

  const handleSelectCandidate = (cand: any) => {
    setSelectedCandidate(cand);
    setDecision(null);
    setInterviewerOpinion('');
    setInterviewerQuestionsFeedback({});
    setIsSubmitted(false);
    triggerAILoadingAnimation();
  };

  // Mock JD details depending on selection
  const getJobDetails = (jobTitle: string) => {
    const defaultDetails = {
      department: '战略规划部 - 金融数智组',
      salary: '年薪 40万 - 60万',
      desc: '负责自研级核心推荐算法、基础研发，或者前端工程架构。主导高内聚低耦合的前端中后台及C端复杂业务场景开发，具备专业精细的极佳性能优化思维。',
      requirements: [
        '5年以上大型前端项目工程实践架构经验，具有全栈复合研发经验者优先。',
        '精通 React 及其运行机理，对虚拟DOM更新重绘、状态管理有底层的微观调试视野。',
        '深刻领悟敏捷研发体系，能够在快速迭代中保持代码整洁度和组件高内聚性。',
        '对平台文化与长视频、内容行业有深入洞察者大加分。'
      ],
      portrait: {
        hardSkills: '精通常规 React/TypeScript / Node.js 微服务 / Webpack 与 Vite 深度定制 / 首屏渲染优化 50% 缩减实践',
        softTraits: '极致技术乐观主义 / 强业务感知视角 / 善于快速精准定位复杂链路故障。',
        cultureValues: '合作共赢 / 坚守阳光准则 / 日常产出极致纯粹的优雅代码'
      }
    };

    if (jobTitle.includes('社交') || jobTitle.includes('专家')) {
      return defaultDetails;
    }

    return {
      department: '前沿实验室 - 多模态组',
      salary: '年薪 50万 - 80万',
      desc: '负责高性能计算、大规模分布式集群存储或云基础设施的技术设计与开发。解决跨数据中心的一致性事务，以及极端流量瞬时波峰中的资源自主弹性路由、超算负载降噪。',
      requirements: [
        '熟练掌握 C++/Go/Rust 中至少一种，对操作系统内核屏障、内存一致性机制有炉火纯青的认知。',
        '熟悉底层网络的 TCP/QUIC 性能极限优化算法，有万级节点私有云架构实战经验。',
        '善于化繁为简，热衷于构建高鲁棒性的复杂服务体系。'
      ],
      portrait: {
        hardSkills: '精通 epoll/DPDK / 内存泄露排查与分代垃圾回收定制 / 超大规模自愈云控制算法',
        softTraits: '冷静严谨 / 代码洁癖高居人类前 1.5% 分位 / 具备雷达级别的异常排雷直觉',
        cultureValues: '正直真诚 / 追求极致可靠性 / 科技向善'
      }
    };
  };

  // Mock AI recommended questions
  const getAiQuestions = (jobTitle: string) => {
    return [
      {
        id: 'q1',
        dimension: '专业硬实力',
        question: '当处于大并发大流量播放场景下，多媒体视频组件的惰性加载与复用技术如何保障帧率恒定在 60fps？在低端机型上有什么独特的渲染兜底策略？',
        checkpoint: '候选人需提及 IntersectionObserver 高频节流、虚拟滚动列表中的 Canvas 实例化池，重点看其是否懂得垃圾回收机制的防抖防卡顿原理。',
        weight: '🔥 核心考察项 (权重 40%)'
      },
      {
        id: 'q2',
        dimension: '架构宏观能力',
        question: '当系统经历类似“跨部门重构”或“敏捷热部署升级”时，你是如何主导大体量、异构组件间的增量无感部署的？如何设计灾备与急速降级网关？',
        checkpoint: '考察其服务注册树、灰度版本路由（AB 灰度流量切割）、微前端沙箱隔离机制等。重点看其是否具有容错悲观设计和快速熔断自愈能力。',
        weight: '⚡ 进阶架构力 (权重 30%)'
      },
      {
        id: 'q3',
        dimension: '企业价值观与软实力',
        question: '当你想推进的一项具有深远意义的技术重构计划（如完全重写某老旧框架核心），与短期业务版本交付发生了极为尖锐的资源冲突，你具体的跨团队博弈与对齐路径是什么？',
        checkpoint: '评估是否符合“合作”与“创业精神”。重点看其是否能用数据（ROI、技术债利息率、研发能效提点）去说服利益人，而不是生硬争吵。',
        weight: '🤝 文化软技能 (权重 30%)'
      }
    ];
  };

  // Export process controller
  const handleExportReport = () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgress(0);
    setExportStep('🎯 正在拉取候选人胜任力雷达多维度评定面板...');

    const steps = [
      { p: 15, text: '🎯 正在拉取候选人胜任力雷达多维度评定面板...' },
      { p: 35, text: '🧠 正在打包 AI 定性诊断、优势与阻碍性盲区评测...' },
      { p: 60, text: '📝 正在压缩生成 PDF 加密文档，写入安全评判签名...' },
      { p: 85, text: '🔒 正在执行本地安全校验与合规性水印映射...' },
      { p: 100, text: '🎉 报告生成成功！正在触发系统自动导出...' }
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < steps.length) {
        setExportProgress(steps[currentIndex].p);
        setExportStep(steps[currentIndex].text);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsExporting(false);
          // Download simulated dynamic text report!
          const reportText = `
========================================
       智能转岗系统 - 业务线考官与候选人匹配空间
========================================
候选人姓名: ${selectedCandidate?.name || '未知'}
求职岗方向: ${selectedCandidate?.job || '未知'}
当前测评总分: ${selectedCandidate?.score || '暂无'}
评估生成日期: 2026年 [核心技术群 内部专属机密文档]
----------------------------------------

【AI 评估核心优势】
1. 具备优秀的精益極客匠心，追求简洁高效。
2. 专业基本功在评定系统分析中位于顶层队列。
3. 展现出极为主动的自驱精神，愿意主动探索未定义平台边界。

【面试研判关键点】
本报告已绑定候选人安全比对序列。查看请自觉遵守合规红线。

文件校验完成（AI-STUDIO-VERIFIED-PASS-2026）
          `;
          
          const element = document.createElement("a");
          const file = new Blob([reportText], {type: 'text/plain'});
          element.href = URL.createObjectURL(file);
          element.download = `${selectedCandidate?.name || '候选人'}_AI面试评估报告.txt`;
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }, 1000);
      }
    }, 450);
  };

  // Submit Feedback to Backend/State
  const handleSubmitFeedback = async () => {
    if (!decision) {
      alert('请选择面试决策 (决定通过/再次考察/不通过)！');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a visual delay to resemble server integration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Post actual request to backend to log this interviewer's decision
      // We can mock updating candidate's state also!
      const statusMap = {
        pass: '面试通过',
        recheck: '再次考察中',
        reject: '面试淘汰'
      };

      await apiDataService.updateCandidate(selectedCandidate.id, {
        status: statusMap[decision],
        interviewerDecision: {
          score: interviewerScore,
          opinion: interviewerOpinion,
          questionsFeedback: interviewerQuestionsFeedback
        }
      });

      setIsSubmitted(true);
      if (onRefreshCandidates) {
        onRefreshCandidates();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const jobDetails = selectedCandidate ? getJobDetails(selectedCandidate.job) : null;
  const aiQuestions = selectedCandidate ? getAiQuestions(selectedCandidate.job) : [];

  return (
    <div className="max-w-[1600px] mx-auto pb-20 space-y-10 px-4 sm:px-6 lg:px-10">
      {/* Tab Header Detail */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E5E6EB] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-[#EEF2FF] text-[#0052D9] rounded-lg text-xs font-bold leading-none flex items-center gap-1.5 shadow-sm">
              <Calendar size={12} />
              专业面试空间
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5E6EB]" />
            <span className="text-xs text-[#86909C] font-bold">精细化 AI 定性诊断与评估流转</span>
          </div>
          <h2 className="text-2xl font-black text-[#1D2129]">面试官评估工作台</h2>
          <p className="text-sm text-[#86909C]">与“评估灯塔”员工端、HR 决策中心三端联通。在此您可以全面审阅候选人，提炼精准提问指南，并录入面试决策与核心意见。</p>
        </div>
        
        {/* Export Button */}
        <div className="flex items-center gap-4">
          <button 
            disabled={isExporting}
            onClick={handleExportReport}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg",
              isExporting 
                ? "bg-[#F2F3F5] text-[#86909C] cursor-not-allowed shadow-none" 
                : "bg-white border border-[#E5E6EB] hover:bg-[#F7F8FA] text-[#1D2129] shadow-sm"
            )}
          >
            <Download size={16} className={isExporting ? "animate-bounce" : ""} />
            {isExporting ? `导出中 (${exportProgress}%)` : "导出 AI 胜任力报告"}
          </button>
        </div>
      </div>

      {/* Export Loader Overlay */}
      <AnimatePresence>
        {isExporting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#E5E6EB] space-y-6 text-center"
            >
              <div className="relative w-20 h-20 mx-auto">
                {/* Visual loading ring */}
                <div className="absolute inset-0 border-4 border-[#F2F3F5] rounded-full" />
                <div className="absolute inset-0 border-4 border-[#0052D9] border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-4 bg-[#E8F3FF] rounded-full flex items-center justify-center text-[#0052D9]">
                  <Download size={24} />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-[#1D2129]">生成安全分析报告...</h4>
                <p className="text-xs text-[#86909C] font-mono leading-relaxed px-4 min-h-[40px]">
                  {exportStep}
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 bg-[#F2F3F5] rounded-full overflow-hidden w-full">
                  <div 
                    className="h-full bg-[#0052D9] transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <div className="text-right text-[10px] font-bold text-[#0052D9]">{exportProgress}% 已就绪</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left column: Candidate list (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-[#E5E6EB]/80 shadow-sm space-y-5">
            
            {/* Header Title with Multi-dim scheduling */}
            <div className="flex justify-between items-center pb-3 border-b border-[#F2F3F5]">
              <h3 className="text-sm font-black text-[#1D2129] flex items-center gap-1.5 leading-none">
                <Calendar size={16} className="text-[#0052D9]" />
                面试日程日历
              </h3>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-[#E8F3FF] text-[#0052D9] rounded-md uppercase tracking-wider">
                多维排程
              </span>
            </div>

            {/* View Switcher Controls (List, Week, Month) */}
            <div className="flex bg-[#F2F3F5] p-1 rounded-xl w-full border border-[#E5E6EB]/40">
              {[
                { id: 'list', label: '快排列表' },
                { id: 'week', label: '周视图' },
                { id: 'month', label: '月视图' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setScheduleView(tab.id as any);
                    // Reset to active defaults
                    if (tab.id === 'week' || tab.id === 'month') {
                      setSelectedCalendarDate(12);
                    }
                  }}
                  className={cn(
                    "flex-1 text-[10px] py-1.5 font-extrabold rounded-lg transition-all",
                    scheduleView === tab.id
                      ? "bg-white text-[#0052D9] shadow-sm scale-102"
                      : "text-[#4E5969] hover:text-[#1D2129] hover:bg-white/40"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* View 1: Traditional Quick List View */}
            {scheduleView === 'list' && (
              <div className="grid grid-cols-4 gap-1 bg-[#F7F8FA] p-1 rounded-2xl border border-[#F2F3F5]">
                {[
                  { key: 'today', title: '本日', sub: '06/12', day: '五', count: scheduleCounts.today },
                  { key: 'tomorrow', title: '明日', sub: '06/13', day: '六', count: scheduleCounts.tomorrow },
                  { key: 'after_tomorrow', title: '后天', sub: '06/14', day: '日', count: scheduleCounts.after_tomorrow },
                  { key: 'next_week', title: '下周', sub: '06/15+', day: '跨周', count: scheduleCounts.next_week },
                ].map((pill) => {
                  const isActive = schedulePeriod === pill.key;
                  return (
                    <button
                      key={pill.key}
                      onClick={() => {
                        setSchedulePeriod(pill.key as any);
                        const nextCands = allCandidatesList.filter(c => c.period === pill.key);
                        if (nextCands.length > 0) {
                          setSelectedCandidate(nextCands[0]);
                          triggerAILoadingAnimation();
                        } else {
                          setSelectedCandidate(null);
                        }
                      }}
                      type="button"
                      className={cn(
                        "flex flex-col items-center justify-center py-2.5 px-0.5 rounded-xl transition-all cursor-pointer select-none",
                        isActive
                          ? "bg-[#0052D9] text-white shadow-md shadow-[#0052D9]/25 scale-102"
                          : "hover:bg-[#E5E6EB]/50 text-[#4E5969]"
                      )}
                    >
                      <span className="text-[10px] font-black leading-none mb-1">{pill.title}</span>
                      <span className={cn(
                        "text-[8px] leading-tight font-extrabold tracking-tight",
                        isActive ? "text-white/80" : "text-[#86909C]"
                      )}>
                        {pill.sub}
                      </span>
                      <span className={cn(
                        "mt-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-black min-w-[14px] text-center leading-none",
                        isActive ? "bg-white/20 text-white" : "bg-[#E5E6EB]/80 text-[#4E5969]"
                      )}>
                        {pill.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* View 2: High-density Horizontal Week Strip View */}
            {scheduleView === 'week' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-0.5 text-[10px] text-[#86909C]">
                  <span className="font-bold">2026年 6月 12日 - 18日</span>
                  <span className="text-[#0052D9] font-bold">考点联编周历</span>
                </div>
                <div className="grid grid-cols-7 gap-1 bg-[#F7F8FA] p-1 rounded-2xl border border-[#F2F3F5]">
                  {[
                    { date: 12, dayName: '五', label: '06/12' },
                    { date: 13, dayName: '六', label: '06/13' },
                    { date: 14, dayName: '日', label: '06/14' },
                    { date: 15, dayName: '一', label: '06/15' },
                    { date: 16, dayName: '二', label: '06/16' },
                    { date: 17, dayName: '三', label: '06/17' },
                    { date: 18, dayName: '四', label: '06/18' }
                  ].map(day => {
                    const isSelected = selectedCalendarDate === day.date;
                    const isToday = day.date === 12;
                    const count = allCandidatesList.filter(c => getCandidateDay(c) === day.date).length;
                    return (
                      <button
                        key={day.date}
                        onClick={() => {
                          setSelectedCalendarDate(day.date);
                          const nextCands = allCandidatesList.filter(c => getCandidateDay(c) === day.date);
                          if (nextCands.length > 0) {
                            setSelectedCandidate(nextCands[0]);
                            triggerAILoadingAnimation();
                          } else {
                            setSelectedCandidate(null);
                          }
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all relative",
                          isSelected
                            ? "bg-[#0052D9] text-white shadow-md shadow-[#0052D9]/20 scale-102"
                            : isToday
                            ? "bg-[#E8F3FF] text-[#0052D9] border border-[#0052D9]/30"
                            : "hover:bg-[#E5E6EB]/50 text-[#4E5969]"
                        )}
                      >
                        <span className="text-[8px] font-extrabold leading-none mb-1 opacity-80">{day.dayName}</span>
                        <span className="text-xs font-black leading-none">{day.date}</span>
                        {count > 0 && (
                          <span className={cn(
                            "w-1 h-1 rounded-full mt-1.5",
                            isSelected ? "bg-white animate-pulse" : "bg-[#0052D9]"
                          )} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View 3: Complete June 2026 Interactive Month Grid View */}
            {scheduleView === 'month' && (
              <div className="space-y-3 p-2 bg-[#F7F8FA] rounded-2xl border border-[#F2F3F5] animate-fadeIn">
                <div className="flex justify-between items-center text-[10px] text-[#1D2129]">
                  <span className="font-extrabold">2026年 6月度大考表</span>
                  <span className="text-[9px] text-[#86909C] font-mono">30天考历</span>
                </div>
                
                <div className="grid grid-cols-7 gap-0.5 text-center text-[8px] font-black text-[#86909C] border-b border-[#E5E6EB] pb-1">
                  {['一', '二', '三', '四', '五', '六', '日'].map(h => (
                    <span key={h} className="leading-none">{h}</span>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 30 }, (_, i) => {
                    const dayNum = i + 1;
                    const isSelected = selectedCalendarDate === dayNum;
                    const isToday = dayNum === 12;
                    const count = allCandidatesList.filter(c => getCandidateDay(c) === dayNum).length;
                    
                    return (
                      <button
                        key={dayNum}
                        onClick={() => {
                          setSelectedCalendarDate(dayNum);
                          const nextCands = allCandidatesList.filter(c => getCandidateDay(c) === dayNum);
                          if (nextCands.length > 0) {
                            setSelectedCandidate(nextCands[0]);
                            triggerAILoadingAnimation();
                          } else {
                            setSelectedCandidate(null);
                          }
                        }}
                        className={cn(
                          "h-7 rounded-lg flex flex-col items-center justify-center relative transition-all text-[9px] font-black",
                          isSelected
                            ? "bg-[#0052D9] text-white shadow-xs"
                            : isToday
                            ? "border border-[#0052D9] text-[#0052D9] font-black bg-[#E8F3FF]"
                            : "hover:bg-[#E5E6EB]/50 text-[#4E5969]"
                        )}
                      >
                        <span className="leading-none">{dayNum}</span>
                        {count > 0 && (
                          <span className={cn(
                            "absolute bottom-0.5 w-[3px] h-[3px] rounded-full",
                            isSelected ? "bg-white" : "bg-[#0052D9]"
                          )} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Combined Active Filter Details Section */}
            <div className="pt-2">
              <div className="flex justify-between items-center text-[10px] text-[#86909C] mb-3">
                <span className="font-bold text-[10px] flex items-center gap-1">
                  <Clock size={10} className="text-[#0052D9]" />
                  {scheduleView === 'list' ? (
                    {
                      today: '本日拟面试对象',
                      tomorrow: '明日已预约候考人',
                      after_tomorrow: '后天预排考考查对象',
                      next_week: '跨周远期考核预测库'
                    }[schedulePeriod]
                  ) : (
                    `6月 ${selectedCalendarDate}日 对应排程`
                  )}
                </span>
                <span className="font-mono bg-[#EFFFF1] text-[#2BA471] px-2 py-0.5 rounded font-black text-[10px]">
                  {displayedCandidates.length} 位
                </span>
              </div>

              {/* Candidates List with Enterprise Precision Card UI */}
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-0.5 custom-scrollbar">
                {displayedCandidates.length > 0 ? (
                  displayedCandidates.map((cand, idx) => {
                    const isActive = selectedCandidate?.id === cand.id;
                    return (
                      <div 
                        key={cand.id || idx}
                        onClick={() => handleSelectCandidate(cand)}
                        className={cn(
                          "p-4 rounded-xl border transition-all cursor-pointer group text-left relative overflow-hidden",
                          isActive 
                            ? "bg-[#E8F3FF] border-[#0052D9] shadow-md shadow-[#0052D9]/5 scale-101" 
                            : "bg-white border-[#F2F3F5] hover:border-[#E5E6EB] hover:bg-[#F7F8FA]"
                        )}
                      >
                        {/* Selected accent highlight handle bar */}
                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0052D9]" />}
                        
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="font-bold text-sm text-[#1D2129]">{cand.name}</span>
                          <span className={cn(
                            "text-[8px] font-extrabold px-2 py-0.5 rounded-full leading-none scale-90 origin-right",
                            cand.status.includes('通过') 
                              ? "bg-[#EFFFF1] text-[#2BA471]" 
                              : cand.status.includes('淘汰')
                              ? "bg-[#FFF2F0] text-[#D54941]"
                              : cand.status.includes('待面试') || cand.status.includes('未评估')
                              ? "bg-[#E8F3FF] text-[#0052D9]"
                              : "bg-[#FFF7E8] text-[#E37318]"
                          )}>
                            {cand.status}
                          </span>
                        </div>
                        <div className="text-xs text-[#4E5969] truncate mb-2.5 font-medium leading-tight">{cand.job}</div>
                        
                        <div className="flex justify-between items-center text-[10px] text-[#86909C]">
                          <span className="flex items-center gap-1 font-bold">
                            <Clock size={10} className="text-[#0052D9]" />
                            {cand.displayTime || '15:00'}
                          </span>
                          <span className="font-mono text-[#0052D9] font-black bg-[#E8F3FF]/40 px-1.5 py-0.5 rounded">评分: {cand.score}分</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-[#86909C] bg-[#F7F8FA] rounded-xl border border-dashed border-[#E5E6EB]">
                    <Clock size={18} className="mx-auto mb-2 text-[#C9CDD4]" />
                    <p className="text-xs font-semibold">该时区暂无拟排日程</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Main detailed interviewer tabspace (9 cols) */}
        <div className="lg:col-span-9 space-y-6 flex flex-col">
          {selectedCandidate ? (
            <div className="bg-white rounded-3xl border border-[#E5E6EB] shadow-sm flex flex-col overflow-hidden min-h-[700px]">
              
              {/* Tab Selector */}
              <div className="bg-[#F7F8FA] border-b border-[#E5E6EB] px-8 py-4 flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-2 bg-[#E1E4E8] p-1 rounded-xl">
                  {[
                    { id: 'resume', label: '候选人履历', icon: FileText },
                    { id: 'jd', label: '岗位 JD & 画像', icon: Briefcase },
                    { id: 'ai', label: 'AI 评估 & 推荐问答', icon: Sparkles },
                    { id: 'feedback', label: '面试意见反馈表', icon: ClipboardList }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                        activeTab === tab.id 
                          ? "bg-white text-[#0052D9] shadow-sm" 
                          : "text-[#4E5969] hover:bg-[#F2F3F5] hover:text-[#1D2129]"
                      )}
                    >
                      <tab.icon size={14} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#86909C] font-medium">评分评定级别:</span>
                  <div className="flex gap-1.5">
                    {['S', 'A', 'B', 'C', 'D'].map(score => (
                      <button 
                        key={score}
                        onClick={() => setInterviewerScore(score)}
                        className={cn(
                          "w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center transition-all",
                          interviewerScore === score 
                            ? "bg-[#0052D9] text-white shadow-md shadow-[#0052D9]/20" 
                            : "bg-[#F2F3F5] text-[#4E5969] hover:bg-[#E5E6EB]"
                        )}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="p-8 flex-1 relative">
                
                {/* AI Loading State Animation overlay in Tab view */}
                <AnimatePresence>
                  {isAnalyzing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/95 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-8 space-y-6 text-center"
                    >
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-[#0052D9]/10 rounded-full" />
                        <div className="absolute inset-0 border-4 border-[#0052D9] border-t-transparent rounded-full animate-spin" />
                      </div>
                      <div className="space-y-1.5 max-w-md">
                        <h4 className="text-base font-bold text-[#1d2129]">正在构建敏捷评估空间...</h4>
                        <div className="text-xs text-[#0052D9] font-medium min-h-[20px] transition-all">
                          { [
                            '🔍 正在调取大模型建立候选人数字档案...',
                            '📈 精细化对比目标岗位 JD 与人才画像特征...',
                            '⚡ 融合高价值历史测评向量生成预测模型...',
                            '🎯 生成定制化推荐提问矩阵与深度诊断分析...'
                          ][analysisStep] }
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {activeTab === 'resume' && (
                  <div className="space-y-8 text-left animate-fadeIn">
                    <div className="flex gap-6 items-start pb-6 border-b border-[#F2F3F5]">
                      <div className="w-16 h-16 rounded-3xl bg-[#E8F3FF] text-[#0052D9] font-black text-2xl flex items-center justify-center shadow-inner">
                        {selectedCandidate.name[0]}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-bold flex items-center gap-3">
                          {selectedCandidate.name}
                          <span className="text-xs bg-[#EFFFF1] text-[#2BA471] px-2.5 py-0.5 rounded-full font-bold">核心产品群骨干转岗推荐对象</span>
                        </h4>
                        <p className="text-sm text-[#4E5969]">
                          {selectedCandidate.details?.currentRole || '当前方向：应用工程与全栈研发架构专家 | 曾任多平台引擎和核心系统技术核心'}
                        </p>
                        <p className="text-xs text-[#86909C]">
                          {selectedCandidate.details?.background || `邮箱: ${selectedCandidate.name === '杨鸿康' ? 'yhk897577@gmail.com' : 'test@generic.com'} | 工作年限: 6年 | 毕业院校: 华中科技大学 (本科)`}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h5 className="text-sm font-bold text-[#1D2129] border-b border-[#F2F3F5] pb-2 flex items-center gap-2">
                          <BookOpen size={16} className="text-[#0052D9]" />
                          项目履历核心
                        </h5>
                        <div className="space-y-4 text-xs leading-relaxed text-[#4E5969]">
                          <div className="p-4 bg-[#F7F8FA] rounded-2xl relative overflow-hidden">
                            <div className="font-bold text-[#1D2129] mb-1">主导高体量系统 UI 组件彻底拆分与解耦 (2024-至今)</div>
                            <p>作为核心架构师，使用增量状态同步隔离技术重写组件库高吞吐渲染链路，实现组件体积缩减 45%，并荣获内部系统工程精品奖。</p>
                          </div>
                          <div className="p-4 bg-[#F7F8FA] rounded-2xl relative overflow-hidden">
                            <div className="font-bold text-[#1D2129] mb-1">高性能图像视频加载与极致流畅渲染攻坚 (2022-2024)</div>
                            <p>带领3人攻坚小组解决首屏性能抖动。采用多级缓存与切片分块缓冲策略，优化移动客户端首屏响应时长低于 180ms，使核心流控转化效率提升 22%。</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h5 className="text-sm font-bold text-[#1D2129] border-b border-[#F2F3F5] pb-2 flex items-center gap-2">
                          <Award size={16} className="text-[#0052D9]" />
                          专业技术栈 & 内部认证
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {['React Engine 资深评级', 'TypeScript 编译流调优', 'Node 高并发微服务架构', 'Redis 热点缓存熔断设计', '中后台大规模沙箱沙盒解耦', '微前端网关高级总线机制', '持续敏捷构建 (DevOps) 主力', '极致首屏极速加载性能标杆', '华科信奉代码极客精神'].map(skill => (
                            <span key={skill} className="px-3 py-1.5 bg-[#F2F3F5] text-[#1D2129] text-[10px] font-bold rounded-xl border border-[#E5E6EB] transition-colors hover:bg-white hover:border-[#0052D9]">
                              {skill}
                            </span>
                          ))}
                        </div>
                        
                        <div className="p-4 bg-[#F0F7FF] rounded-2xl border border-[#B2D1FF]">
                          <div className="text-xs font-bold text-[#0052D9] mb-1.5 flex items-center gap-1.5">
                            <Sparkles size={12} />
                            智能系统诊断结论:
                          </div>
                          <p className="text-[11px] text-[#003EB3] leading-relaxed">
                            该候选人具有典型的精益极客精神，在技术纵深突破与大规模核心系统支撑上面无一短板，非常切合岗位对应的技术与自驱力评估标准。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'jd' && jobDetails && (
                  <div className="space-y-8 text-left animate-fadeIn">
                    <div className="p-6 bg-[#F7F8FA] rounded-3xl border border-[#E5E6EB] flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-[#1D2129] mb-1">{selectedCandidate.job}</h4>
                        <p className="text-xs text-[#86909C]">所属部门：{jobDetails.department} | 研发总线职能</p>
                      </div>
                      <span className="text-xl font-black text-[#0052D9]">{jobDetails.salary}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h5 className="text-sm font-bold text-[#1D2129] border-b border-[#F2F3F5] pb-2">岗位职责与描述</h5>
                        <p className="text-sm text-[#4E5969] leading-relaxed italic">{jobDetails.desc}</p>
                        
                        <h5 className="text-sm font-bold text-[#1D2129] border-b border-[#F2F3F5] pb-2 pt-4">岗位硬性要求</h5>
                        <ul className="space-y-2">
                          {jobDetails.requirements.map((req, i) => (
                            <li key={i} className="flex gap-2 text-xs text-[#4E5969] leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0052D9] mt-2 shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <section className="bg-[#FFF9F3] border border-[#FFDDA2] rounded-2xl p-5 space-y-3">
                          <h5 className="text-sm font-bold text-[#E37318] flex items-center gap-2">
                            <Award size={16} />
                            理想人才画像标准 (Talent Portrait)
                          </h5>
                          <div className="space-y-3 text-xs leading-relaxed">
                            <div>
                              <div className="font-extrabold text-[#1D2129] mb-0.5">硬性技能:</div>
                              <p className="text-[#4E5969]">{jobDetails.portrait.hardSkills}</p>
                            </div>
                            <div>
                              <div className="font-extrabold text-[#1D2129] mb-0.5">团队特质 & 软实力:</div>
                              <p className="text-[#4E5969]">{jobDetails.portrait.softTraits}</p>
                            </div>
                            <div>
                              <div className="font-extrabold text-[#1D2129] mb-0.5">核心价值观契合度:</div>
                              <p className="text-[#4E5969]">{jobDetails.portrait.cultureValues}</p>
                            </div>
                          </div>
                        </section>

                        {/* Interactive Match Alignment rating button */}
                        <div className="bg-[#E8F3FF]/80 border border-[#B2D1FF] rounded-2xl p-4 space-y-2.5">
                          <div className="flex justify-between items-center">
                            <h5 className="text-xs font-bold text-[#0052D9] flex items-center gap-1.5">
                              <ClipboardList size={14} />
                              真实 JD 匹配口径研判
                            </h5>
                            <span className="text-[9px] text-[#0052D9] font-bold bg-white px-2 py-0.5 rounded-full border border-[#B2D1FF]">
                              即时对齐视窗
                            </span>
                          </div>
                          <p className="text-[11px] text-[#003EB3] leading-relaxed">
                            面试官可在此直接记录对候选人的硬性技能、软实力、以及技术深度的对齐初判。
                          </p>
                          <button 
                            type="button"
                            onClick={() => setIsJDEvalOpen(true)}
                            className="w-full py-2 bg-[#0052D9] hover:bg-[#003EB3] text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <PenTool size={13} />
                            录入对齐评分及备注 (Auto Saving)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'ai' && (
                  <div className="space-y-8 text-left animate-fadeIn">
                    <div className="p-6 bg-gradient-to-r from-[#F0F7FF] to-white rounded-3xl border border-[#B2D1FF] flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#0052D9] shadow-sm shrink-0">
                        <Sparkles size={24} className="text-[#0052D9]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#0052D9]">胜任力大模型推荐提问指导</h4>
                        <p className="text-xs text-[#003EB3]">已根据候选人简历结构结合同类型技术岗的核心指标进行深度关联分析，定制化构建以下提问指南以辅助评研。</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {aiQuestions.map((q, idx) => (
                        <div key={q.id} className="bg-white rounded-2xl border border-[#E5E6EB] p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                          <div className="absolute right-4 top-4 text-[10px] font-bold text-[#86909C]">
                            {q.weight}
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0052D9]" />
                            <span className="text-xs font-bold text-[#0052D9] bg-[#E8F3FF] px-2.5 py-0.5 rounded-md uppercase tracking-wider">{q.dimension}</span>
                            <span className="text-xs text-[#86909C]">问题 #{idx + 1}</span>
                          </div>
                          
                          <p className="text-sm font-bold text-[#1D2129] mb-4 leading-relaxed bg-[#F7F8FA] p-4 rounded-xl border border-[#E5E6EB]">
                            {q.question}
                          </p>

                          <div className="space-y-2">
                            <div className="text-[10px] font-black text-[#86909C] uppercase tracking-wide flex items-center gap-1.5">
                              <ShieldCheck size={12} className="text-[#2BA471]" />
                              标准答案考核点 (Interviewer Checkpoint)
                            </div>
                            <p className="text-xs text-[#4E5969] leading-relaxed bg-[#EFFFF1] rounded-xl p-4 text-[#2BA471] italic font-medium border border-[#A6E8B9]">
                              {q.checkpoint}
                            </p>
                          </div>

                          {/* Quick rating for this question to help interviewer */}
                          <div className="mt-4 pt-4 border-t border-[#F2F3F5] flex items-center justify-between">
                            <span className="text-xs text-[#86909C] font-semibold">候选人本题回答现场评级：</span>
                            <div className="flex gap-2">
                              {['超纲卓越', '符合预期', '有所欠缺', '完全偏离'].map((level, lIdx) => {
                                const qKey = `${q.id}_ans`;
                                const isSelected = interviewerQuestionsFeedback[qKey] === level;
                                return (
                                  <button 
                                    key={level}
                                    onClick={() => setInterviewerQuestionsFeedback(prev => ({ ...prev, [qKey]: level }))}
                                    className={cn(
                                      "px-3 py-1 rounded-lg text-[10px] font-bold border transition-all",
                                      isSelected
                                        ? "bg-[#0052D9] text-white border-[#0052D9]"
                                        : "bg-white text-[#4E5969] border-[#E5E6EB] hover:bg-[#F2F3F5]"
                                    )}
                                  >
                                    {level}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'feedback' && (
                  <div className="space-y-8 text-left animate-fadeIn">
                    <div className="p-6 bg-white border border-[#E5E6EB] rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#EFFFF1] text-[#2BA471] rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1D2129]">最终决策提报（符合公平敏捷复审）</h4>
                        <p className="text-xs text-[#86909C]">在此录入您的复核判断和面试评语，系统直接将其回显至相应流程节点，保障面试评判的公开透明与全流程互信。</p>
                      </div>
                    </div>

                    {isSubmitted ? (
                      <div className="p-10 bg-[#EFFFF1] border border-[#A6E8B9] rounded-3xl text-center space-y-4">
                        <div className="w-16 h-16 bg-[#2BA471] text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#2BA471]/20">
                          <Check size={32} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-bold text-[#1D2129]">评定提交就绪</h4>
                          <p className="text-sm text-[#4E5969]">您的决策已完成系统录入和签名存储。数据已自动广播给：</p>
                        </div>
                        <div className="flex justify-center gap-4 text-xs font-bold text-[#1D2129] py-2">
                          <span className="px-3 py-1 bg-white rounded-lg border border-[#A6E8B9]">👥 HR 管理后台已更新状态</span>
                          <span className="px-3 py-1 bg-white rounded-lg border border-[#A6E8B9]">📱 员工转岗中心收到面试决策通知</span>
                        </div>
                        <button 
                          onClick={() => {
                            setIsSubmitted(false);
                            setDecision(null);
                            setInterviewerOpinion('');
                          }}
                          className="px-6 py-2 bg-white text-[#2BA471] border border-[#2BA471] rounded-xl text-xs font-bold hover:bg-[#2BA471]/10 transition-all"
                        >
                          重新修改评语决策
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Decision Radio buttons */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-[#1D2129]">最终面试决策 (Decision)</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                              { id: 'pass', label: '面试通过 (Pass)', color: '#2BA471', bg: '#EFFFF1', border: '#A6E8B9', textClass: 'text-[#2BA471]' },
                              { id: 'recheck', label: '仍需再次深入考察 (Hold/Recheck)', color: '#E37318', bg: '#FFF7E8', border: '#FFE4BA', textClass: 'text-[#E37318]' },
                              { id: 'reject', label: '淘汰或流转其他池 (Reject)', color: '#D54941', bg: '#FFF2F0', border: '#FFD8D4', textClass: 'text-[#D54941]' }
                            ].map(item => {
                              const isChecked = decision === item.id;
                              return (
                                <div 
                                  key={item.id}
                                  onClick={() => setDecision(item.id as any)}
                                  style={{ backgroundColor: isChecked ? item.bg : 'white', borderColor: isChecked ? item.color : '#E5E6EB' }}
                                  className={cn(
                                    "p-4 rounded-2xl border-2 cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-2",
                                    isChecked ? "shadow-md" : "hover:bg-[#F7F8FA]"
                                  )}
                                >
                                  <div 
                                    style={{ backgroundColor: isChecked ? item.color : '#E5E6EB' }}
                                    className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                                  >
                                    {isChecked && <Check size={10} strokeWidth={4} />}
                                  </div>
                                  <div className={cn("text-xs font-black", isChecked ? item.textClass : "text-[#4E5969]")}>
                                    {item.label}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Text opinion */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-[#1D2129] flex items-center justify-between">
                            <span>详细评语建议 (专业基本功，优点，劣势点描述)</span>
                            <span className="text-[10px] text-[#86909C]">支持 Markdown 智能换行排版</span>
                          </label>
                          <textarea 
                            value={interviewerOpinion}
                            onChange={(e) => setInterviewerOpinion(e.target.value)}
                            placeholder="请深度描述您的评定原因，此内容在“护航反馈”版块内可供员工针对特定疑问发起答复交流，确保评估的公开透明与极致可信度..."
                            className="w-full h-40 p-4 bg-[#F7F8FA] rounded-2xl border border-[#E5E6EB] text-sm focus:ring-2 focus:ring-[#0052D9] transition-all resize-none placeholder:text-[#86909C]"
                          />
                        </div>

                        {/* Submit Actions */}
                        <div className="flex gap-4">
                          <button 
                            disabled={isSubmitting}
                            onClick={handleSubmitFeedback}
                            className={cn(
                              "flex-1 py-3 bg-[#0052D9] text-white rounded-xl font-bold hover:bg-[#003EB3] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0052D9]/10",
                              isSubmitting && "bg-[#86909C] cursor-wait text-white"
                            )}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                正在进行分布式签名提交...
                              </>
                            ) : (
                              <>
                                <Send size={16} />
                                会签并提报流程
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E5E6EB] p-20 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 bg-[#F2F3F5] rounded-full flex items-center justify-center text-[#86909C]">
                <Users size={40} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#1D2129]">请选择一位本日候选人</h4>
                <p className="text-xs text-[#86909C]">可在左侧列表选择待评定的面试对象</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive JD Matching feedback popup */}
      <AnimatePresence>
        {isJDEvalOpen && (
          <div className="fixed inset-0 bg-[#1D2129]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -10 }}
              className="bg-white rounded-2xl border border-[#E5E6EB] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col font-sans"
            >
              <div className="bg-[#E8F3FF] px-6 py-4 border-b border-[#B2D1FF] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="text-[#0052D9]" size={18} />
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-[#1D2129]">和岗位人才画像 JD 匹配度直考</h4>
                    <p className="text-[10px] text-[#0052D9] font-semibold">正在评阅: {selectedCandidate?.name || '候选人'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsJDEvalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/85 hover:bg-white flex items-center justify-center text-[#4E5969] transition-all hover:scale-105 active:scale-95 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5 text-left">
                {/* Save status notification badge */}
                <div className="flex justify-between items-center bg-[#F7F8FA] px-3.5 py-1.5 rounded-xl border border-[#E5E6EB]">
                  <span className="text-[10px] text-[#4E5969] font-bold">对齐考评状态</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold">
                    {saveStatus === 'saving' ? (
                      <>
                        <span className="w-1.5 h-1.5 bg-[#E37318] rounded-full animate-ping" />
                        <span className="text-[#E37318] flex items-center gap-1">
                          🔄 自动存盘中...
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 bg-[#2BA471] rounded-full animate-pulse" />
                        <span className="text-[#2BA471]">
                          ✅ 云端双轨已同步
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Star rating selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1D2129] flex justify-between">
                    <span>岗位履历对齐星级 (CV Rating)</span>
                    <span className="text-xs font-bold text-[#0052D9]">{jdMatchRating} / 5 星</span>
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = jdMatchRating >= star;
                      return (
                        <button
                          key={star}
                          onClick={() => handleJDEvalChange('rating', star)}
                          className={cn(
                            "w-10 h-10 rounded-xl border transition-all text-lg flex items-center justify-center",
                            isActive 
                              ? "bg-amber-50 border-amber-300 text-amber-500 scale-105" 
                              : "bg-white border-[#E5E6EB] text-[#C9CDD4] hover:bg-[#F8FAFC]"
                          )}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-[#86909C] leading-relaxed">
                    对齐评级标准：5 = 极致对齐且具突破特质，4 = 高契合度，3 = 符合基本底格，2/1 = 建议开发转岗方向调整。
                  </p>
                </div>

                {/* Observations & notes comment */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1D2129]">JD 专项核验及亮点备注 (Observations)</label>
                  <textarea
                    value={jdMatchNotes}
                    onChange={(e) => handleJDEvalChange('notes', e.target.value)}
                    placeholder="请输入针对此岗位画像对齐情况的核心技术观察与考证评述，文字将被自动捕捉并无缝同步至会签底表..."
                    className="w-full h-32 p-3 bg-[#F7F8FA] rounded-xl border border-[#E5E6EB] text-xs resize-none focus:ring-1 focus:ring-[#0052D9] focus:bg-white placeholder:text-[#86909C] outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#F7F8FA] px-6 py-4 border-t border-[#E5E6EB] flex justify-end gap-2 text-xs">
                <button
                  onClick={() => setIsJDEvalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#E5E6EB] hover:bg-[#F2F3F5] rounded-xl font-bold text-[#4E5969] transition-all"
                >
                  关闭
                </button>
                <button
                  onClick={() => {
                    setIsJDEvalOpen(false);
                    // Automatically append to main opinion
                    setInterviewerOpinion(prev => {
                      const prefix = prev ? prev + '\n\n' : '';
                      return `${prefix}【JD匹配观察：对齐星级 ${jdMatchRating}星】\n${jdMatchNotes}`;
                    });
                    setActiveTab('feedback');
                  }}
                  className="px-4 py-2 bg-[#0052D9] text-white hover:bg-[#003EB3] rounded-xl font-bold transition-all shadow-md shadow-[#0052D9]/15"
                >
                  同步评语并进入提报
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
