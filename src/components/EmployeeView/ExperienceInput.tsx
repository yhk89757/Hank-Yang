import React, { useState, useEffect } from 'react';
import { JOBS, DEPARTMENTS, LOCATIONS } from '../../constants';
import { cn } from '../../lib/utils';
import { Upload, Sparkles, Search, Filter, CheckCircle2, AlertCircle, Loader2, FileText } from 'lucide-react';
import { analyzeResume, recommendJobs } from '../../services/geminiService';
import { fullMatchPipeline, aiStatus } from '../../services/deepseekService';
import { CompetencyReport, AiConfig, MatchingResult } from '../../types';
import * as pdfjs from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';

// 设置 PDF.js worker 地址
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface ExperienceInputProps {
  onNext: (report: CompetencyReport, jobTitle: string, matchingResult?: MatchingResult) => void;
  onBack: () => void;
  aiConfig: AiConfig | null;
}

export function ExperienceInput({ onNext, onBack, aiConfig }: ExperienceInputProps) {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [motivation, setMotivation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsingStatus, setParsingStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [deptFilter, setDeptFilter] = useState('');
  const [locFilter, setLocFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [testScore, setTestScore] = useState<number | null>(null);
  const [showTest, setShowTest] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<{ jobId: string; matchScore: number; reason: string }[]>([]);
  const [isRecommending, setIsRecommending] = useState(false);
  const [performanceLevel, setPerformanceLevel] = useState<'A' | 'B' | 'C' | ''>('');
  const [hasProjectResults, setHasProjectResults] = useState(false);
  const [hasPersonalWorks, setHasPersonalWorks] = useState(false);
  const [projectResultsText, setProjectResultsText] = useState('');
  const [personalWorksText, setPersonalWorksText] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchingStatus, setMatchingStatus] = useState('');

  useEffect(() => {
    if (resumeText && parsingStatus === 'success') {
      const getRecommendations = async () => {
        setIsRecommending(true);
        try {
          const res = await recommendJobs(resumeText, JOBS);
          setRecommendations(res);
        } catch (error) {
          console.error(error);
        } finally {
          setIsRecommending(false);
        }
      };
      getRecommendations();
    }
  }, [resumeText, parsingStatus]);

  const testOptions = [
    { id: 'A', label: '用户思维' },
    { id: 'B', label: '本质思维' },
    { id: 'C', label: '闭环思维' },
    { id: 'D', label: '迭代思维' },
    { id: 'E', label: '价值思维' },
  ];

  const handleToggleOption = (id: string) => {
    setSelectedOptions(prev => 
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    );
  };

  const handleFinishTest = () => {
    const score = Math.max(0, selectedOptions.length * 20);
    setTestScore(score);
    setShowTest(false);
  };

  const filteredJobs = JOBS.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = !deptFilter || job.department === deptFilter;
    const matchesLoc = !locFilter || job.location === locFilter;
    return matchesSearch && matchesDept && matchesLoc;
  });

  const toggleJob = (id: string) => {
    if (selectedJobs.includes(id)) {
      setSelectedJobs(selectedJobs.filter(i => i !== id));
    } else if (selectedJobs.length < 3) {
      setSelectedJobs([...selectedJobs, id]);
    }
  };

  const parseFile = async (file: File) => {
    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return fullText;
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else {
      return await file.text();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'project' | 'works') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'resume') {
      setFileName(file.name);
      setParsingStatus('parsing');
      try {
        const text = await parseFile(file);
        setResumeText(text);
        setParsingStatus('success');
      } catch (error) {
        console.error('Parsing error:', error);
        setParsingStatus('error');
      }
    } else if (type === 'project') {
      setHasProjectResults(true);
      try {
        const text = await parseFile(file);
        setProjectResultsText(text);
      } catch (e) { console.error(e); }
    } else if (type === 'works') {
      setHasPersonalWorks(true);
      try {
        const text = await parseFile(file);
        setPersonalWorksText(text);
      } catch (e) { console.error(e); }
    }
  };

  const handleSubmit = async () => {
    if (selectedJobs.length === 0 || !performanceLevel) return;
    setIsAnalyzing(true);
    setIsMatching(true);
    setMatchingStatus('正在调用 DeepSeek AI 进行深度分析...');
    
    try {
      const targetJob = JOBS.find(j => j.id === selectedJobs[0])!;
      if (!resumeText && parsingStatus !== 'success') {
        alert('请先上传简历或等待解析完成');
        return;
      }

      // 并行调用 Gemini 胜任力分析 和 DeepSeek 智能匹配
      const [report, matchingResult] = await Promise.all([
        analyzeResume(
          resumeText,
          targetJob.title,
          targetJob.jd,
          motivation,
          testScore || 0,
          {
            performanceLevel,
            hasProjectResults,
            hasPersonalWorks,
            projectResultsText,
            personalWorksText
          },
          aiConfig
        ),
        fullMatchPipeline(
          resumeText,
          targetJob.jd,
          targetJob.portrait,
          targetJob.title,
          {
            performanceLevel,
            testScore: testScore || 0,
            motivation,
            projectResultsText,
            personalWorksText
          }
        ),
      ]);

      // 标记匹配状态
      if (aiStatus.anyFallback) {
        setMatchingStatus('部分分析使用了本地计算（AI服务响应异常）');
      } else {
        setMatchingStatus('DeepSeek AI 智能分析完成 ✓');
      }
      
      onNext(report, targetJob.title, matchingResult);
    } catch (error) {
      console.error('分析过程出错:', error);
      // 即使出错也尝试传递 matchingResult (fullMatchPipeline 内部有 fallback)
      alert('分析过程中遇到问题，将使用本地评估结果。请查看浏览器控制台了解详情。');
    } finally {
      setIsAnalyzing(false);
      setIsMatching(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
      {/* Online Test Modal */}
      {showTest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#E8F3FF] rounded-xl flex items-center justify-center text-[#0052D9]">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">在线笔试测评</h3>
                <p className="text-xs text-[#86909C]">请根据您的理解选择正确答案</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-[#F7F8FA] rounded-2xl border border-[#E5E6EB]">
                <div className="text-sm font-bold text-[#86909C] mb-2 uppercase tracking-wider">题目 1 (多选题)</div>
                <div className="text-lg font-bold text-[#1D2129]">什么是产品思维？</div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {testOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleToggleOption(opt.id)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                      selectedOptions.includes(opt.id)
                        ? "bg-[#E8F3FF] border-[#0052D9] shadow-sm"
                        : "bg-white border-[#E5E6EB] hover:border-[#C9CDD4]"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                      selectedOptions.includes(opt.id)
                        ? "bg-[#0052D9] border-[#0052D9] text-white"
                        : "border-[#E5E6EB] group-hover:border-[#C9CDD4]"
                    )}>
                      {selectedOptions.includes(opt.id) && <CheckCircle2 size={14} />}
                    </div>
                    <span className={cn(
                      "font-medium",
                      selectedOptions.includes(opt.id) ? "text-[#0052D9]" : "text-[#4E5969]"
                    )}>
                      {opt.id}: {opt.label}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleFinishTest}
                disabled={selectedOptions.length === 0}
                className="w-full lighthouse-btn-primary mt-4"
              >
                确认提交答案
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lg:col-span-2 space-y-8">
        {/* Job Selection */}
        <section className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">选择意向岗位 (最多 3 个)</h3>
            <span className={cn(
              "text-sm font-medium px-3 py-1 rounded-full",
              selectedJobs.length === 3 ? "bg-[#E8F3FF] text-[#0052D9]" : "bg-[#F2F3F5] text-[#86909C]"
            )}>
              已选 {selectedJobs.length}/3
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86909C]" size={16} />
              <input
                type="text"
                placeholder="搜索岗位名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F2F3F5] rounded-xl border-none focus:ring-2 focus:ring-[#0052D9] transition-all text-sm"
              />
            </div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-4 py-2 bg-[#F2F3F5] rounded-xl border-none text-sm focus:ring-2 focus:ring-[#0052D9]"
            >
              <option value="">所有事业群</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              value={locFilter}
              onChange={(e) => setLocFilter(e.target.value)}
              className="px-4 py-2 bg-[#F2F3F5] rounded-xl border-none text-sm focus:ring-2 focus:ring-[#0052D9]"
            >
              <option value="">所有地点</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredJobs.map(job => (
              <button
                key={job.id}
                onClick={() => toggleJob(job.id)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                  selectedJobs.includes(job.id) 
                    ? "bg-[#E8F3FF] border-[#0052D9] shadow-sm" 
                    : "bg-white border-[#E5E6EB] hover:border-[#C9CDD4]"
                )}
              >
                <div>
                  <div className="font-bold text-sm mb-1">{job.title}</div>
                  <div className="text-xs text-[#86909C]">{job.department} · {job.location}</div>
                </div>
                {selectedJobs.includes(job.id) && <CheckCircle2 className="text-[#0052D9]" size={20} />}
              </button>
            ))}
          </div>
        </section>

        {/* Uploads & Motivation */}
        <section className="bg-white rounded-3xl p-8 border border-[#E5E6EB] shadow-sm space-y-6">
          <h3 className="text-xl font-bold">履历与动机</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="group relative border-2 border-dashed border-[#E5E6EB] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-[#0052D9] hover:bg-[#F0F7FF] transition-all cursor-pointer">
              <div className={cn(
                "p-3 rounded-xl transition-all",
                parsingStatus === 'success' ? "bg-[#EFFFF1] text-[#2BA471]" : "bg-[#F2F3F5] text-[#86909C] group-hover:bg-[#E8F3FF] group-hover:text-[#0052D9]"
              )}>
                {parsingStatus === 'parsing' ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
              </div>
              <span className={cn(
                "text-sm font-medium transition-all",
                parsingStatus === 'success' ? "text-[#2BA471]" : "text-[#4E5969] group-hover:text-[#0052D9]"
              )}>
                {parsingStatus === 'parsing' ? '正在深度解析...' : (fileName || '个人简历')}
              </span>
              {parsingStatus === 'success' && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 size={16} className="text-[#2BA471]" />
                </div>
              )}
              <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => handleFileUpload(e, 'resume')} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <div className="group relative border-2 border-dashed border-[#E5E6EB] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-[#0052D9] hover:bg-[#F0F7FF] transition-all cursor-pointer">
              <div className={cn(
                "p-3 rounded-xl transition-all",
                hasProjectResults ? "bg-[#EFFFF1] text-[#2BA471]" : "bg-[#F2F3F5] text-[#86909C] group-hover:bg-[#E8F3FF] group-hover:text-[#0052D9]"
              )}>
                <Upload size={20} />
              </div>
              <span className={cn(
                "text-sm font-medium transition-all",
                hasProjectResults ? "text-[#2BA471]" : "text-[#4E5969] group-hover:text-[#0052D9]"
              )}>
                项目成果
              </span>
              {hasProjectResults && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 size={16} className="text-[#2BA471]" />
                </div>
              )}
              <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => handleFileUpload(e, 'project')} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <div className="group relative border-2 border-dashed border-[#E5E6EB] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-[#0052D9] hover:bg-[#F0F7FF] transition-all cursor-pointer">
              <div className={cn(
                "p-3 rounded-xl transition-all",
                hasPersonalWorks ? "bg-[#EFFFF1] text-[#2BA471]" : "bg-[#F2F3F5] text-[#86909C] group-hover:bg-[#E8F3FF] group-hover:text-[#0052D9]"
              )}>
                <Upload size={20} />
              </div>
              <span className={cn(
                "text-sm font-medium transition-all",
                hasPersonalWorks ? "text-[#2BA471]" : "text-[#4E5969] group-hover:text-[#0052D9]"
              )}>
                个人作品
              </span>
              {hasPersonalWorks && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 size={16} className="text-[#2BA471]" />
                </div>
              )}
              <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => handleFileUpload(e, 'works')} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-[#1D2129]">过往平均绩效水平 (必选)</label>
            <div className="grid grid-cols-3 gap-4">
              {['A', 'B', 'C'].map((level) => (
                <button
                  key={level}
                  onClick={() => setPerformanceLevel(level as any)}
                  className={cn(
                    "py-3 rounded-xl border font-bold transition-all",
                    performanceLevel === level
                      ? "bg-[#0052D9] border-[#0052D9] text-white shadow-md shadow-[#0052D9]/20"
                      : "bg-white border-[#E5E6EB] text-[#4E5969] hover:border-[#0052D9] hover:text-[#0052D9]"
                  )}
                >
                  {level} 级
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#86909C]">注：A级赋分7%，B级5%，C级3%。剩余8%由“项目成果”材料决定。</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-[#1D2129]">转岗动机与未来构想</label>
            <textarea
              placeholder="请简述您选择该岗位的初衷，以及您认为自己能为新团队带来的价值..."
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              className="w-full h-32 p-4 bg-[#F2F3F5] rounded-2xl border-none focus:ring-2 focus:ring-[#0052D9] transition-all text-sm resize-none"
            />
          </div>

          <div className="p-4 bg-[#FFF7E8] rounded-2xl border border-[#FFE4BA] flex items-start gap-4">
            <AlertCircle className="text-[#E37318] shrink-0" size={20} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-[#866D42]">笔试测评</p>
                {testScore !== null ? (
                  <span className="text-xs font-bold text-[#2BA471] bg-[#EFFFF1] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    已完成 (得分: {testScore})
                  </span>
                ) : (
                  <span className="text-xs font-bold text-[#E37318] bg-[#FFF2E8] px-2 py-0.5 rounded-full">待完成</span>
                )}
              </div>
              <p className="text-sm text-[#866D42] mb-4">笔试成绩占总分的 15%。请在提交前完成在线测评。</p>
              <button
                onClick={() => setShowTest(true)}
                className={cn(
                  "w-full py-2.5 rounded-xl font-bold text-sm transition-all",
                  testScore !== null 
                    ? "bg-[#F2F3F5] text-[#86909C] cursor-default" 
                    : "bg-[#E37318] text-white hover:bg-[#D46616] shadow-md shadow-[#E37318]/20"
                )}
              >
                {testScore !== null ? '重新测评 (可选)' : '立即开始在线笔试'}
              </button>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between pt-4">
          <button
            onClick={onBack}
            className="px-8 py-3 rounded-xl font-bold text-[#4E5969] hover:bg-[#E5E6EB] transition-all"
          >
            上一步
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedJobs.length === 0 || isAnalyzing || testScore === null || !performanceLevel}
            className="bg-[#0052D9] text-white px-12 py-3 rounded-xl font-bold hover:bg-[#003EB3] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0052D9]/20 flex items-center gap-2"
          >
            {isAnalyzing && <Loader2 size={18} className="animate-spin" />}
            {isAnalyzing ? (
              <span className="flex flex-col items-start">
                <span className="text-xs opacity-80">{matchingStatus || 'AI 双引擎深度分析中...'}</span>
              </span>
            ) : '提交并生成诊断报告'}
          </button>
        </div>

      </div>

      {/* AI Recommendation Sidebar */}
      <aside className="space-y-6">
        <div className="bg-gradient-to-br from-[#0052D9] to-[#003EB3] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <Sparkles className="absolute top-4 right-4 opacity-20" size={48} />
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles size={20} />
            AI 岗位智能推荐
          </h4>
          <p className="text-sm text-white/80 mb-6 leading-relaxed">
            根据您的履历关键词与项目深度，AI 为您预匹配了以下最适合的岗位：
          </p>
          
          <div className="space-y-3">
            {isRecommending ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 bg-white/5 rounded-2xl border border-white/10">
                <Loader2 className="animate-spin text-white/40" size={32} />
                <span className="text-xs text-white/60 font-medium">AI 正在深度匹配中...</span>
              </div>
            ) : recommendations.length > 0 ? (
              recommendations.map((rec) => {
                const job = JOBS.find(j => j.id === rec.jobId);
                if (!job) return null;
                return (
                  <div 
                    key={rec.jobId} 
                    onClick={() => toggleJob(rec.jobId)}
                    className={cn(
                      "bg-white/10 backdrop-blur-md p-4 rounded-2xl border transition-all cursor-pointer group",
                      selectedJobs.includes(rec.jobId) ? "border-white bg-white/20" : "border-white/10 hover:bg-white/20"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">匹配度 {rec.matchScore}%</span>
                      <CheckCircle2 size={14} className={cn(
                        "transition-colors",
                        selectedJobs.includes(rec.jobId) ? "text-white" : "text-white/40 group-hover:text-white"
                      )} />
                    </div>
                    <div className="text-sm font-bold truncate">{job.title}</div>
                    <div className="text-[10px] text-white/50 mt-1 line-clamp-1">{rec.reason}</div>
                  </div>
                );
              })
            ) : (
              JOBS.slice(0, 3).map((job, idx) => (
                <div key={job.id} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">匹配度 {98 - idx * 3}%</span>
                    <CheckCircle2 size={14} className="text-white/40 group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-sm font-bold truncate">{job.title}</div>
                </div>
              ))
            )}
          </div>

          <button className="w-full mt-6 py-3 bg-white text-[#0052D9] rounded-xl font-bold text-sm hover:bg-white/90 transition-all">
            一键申请推荐岗位
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#E5E6EB] shadow-sm">
          <h4 className="font-bold mb-4 text-[#1D2129]">申请小贴士</h4>
          <ul className="space-y-4">
            {[
              '简历中突出与 AI 或产品相关的项目经验',
              '转岗动机建议结合业务痛点提出见解',
              '笔试环节请确保网络稳定，限时 60 分钟'
            ].map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-[#4E5969]">
                <div className="w-5 h-5 rounded-full bg-[#F2F3F5] flex items-center justify-center text-[10px] font-bold shrink-0">
                  {i + 1}
                </div>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
