import React from 'react';
import { Layout } from './components/Layout';
import { Lighthouse } from './components/EmployeeView/Lighthouse';
import { ExperienceInput } from './components/EmployeeView/ExperienceInput';
import { DiagnosisReport } from './components/EmployeeView/DiagnosisReport';
import { SupportFeedback } from './components/EmployeeView/SupportFeedback';
import { AdminDashboard } from './components/AdminView/AdminDashboard';
import { InterviewerDashboard } from './components/InterviewerSpace/InterviewerDashboard';
import { Login } from './components/Login';
import { ViewType, EmployeeModule, CompetencyReport, Candidate, AiConfig, MatchingResult } from './types';
import * as localStorageService from './services/localStorageService';
import * as apiDataService from './services/apiDataService';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(() => {
    return localStorage.getItem('lighthouse_portal_logged_in') === 'true';
  });
  const [view, setView] = React.useState<ViewType>(() => {
    return (localStorage.getItem('lighthouse_portal_view') as ViewType) || 'employee';
  });
  const [activeModule, setActiveModule] = React.useState<EmployeeModule>('lighthouse');
  const [report, setReport] = React.useState<CompetencyReport | null>(null);
  const [matchingResult, setMatchingResult] = React.useState<MatchingResult | null>(null);
  const [dataSource, setDataSource] = React.useState<'cloud' | 'local'>('local');

  const defaultCandidates: Candidate[] = [
    { id: 1, name: '张三', job: '金融AI产品经理', score: 92, status: '已通过', time: new Date().toISOString() },
    { id: 2, name: '李四', job: 'AI原生产品经理', score: 88, status: '复核中', time: new Date().toISOString() },
    { id: 3, name: '王五', job: '通用AIGC模型产品经理（多模态方向）', score: 85, status: '已通过', time: new Date().toISOString() },
    { id: 4, name: '赵六', job: '智能支付-资金产品经理', score: 79, status: '待面试', time: new Date().toISOString() },
  ];

  const [candidates, setCandidates] = React.useState<Candidate[]>(defaultCandidates);
  const [aiConfig, setAiConfig] = React.useState<AiConfig>({
    modelName: '胜任力大模型 3.0',
    languageStyle: '专业、客观、激励性',
    principles: ['公正性优先', '隐私即安全', '多维度匹配', '解释性评估'],
    systemPrompt: '你是一个专业的资深人才评测与转岗评估专家，负责根据候选人的简历、项目成果 and 个人作品，结合岗位人才画像进行深度匹配度分析。你的目标是提供客观、公正且具有成长建议的评估报告。',
    weights: [
      { label: '材料匹配度', weight: 0.55, color: '#0052D9' },
      { label: '部门绩效', weight: 0.15, color: '#2BA471' },
      { label: '跨界潜力', weight: 0.15, color: '#E37318' },
      { label: '笔试成绩', weight: 0.15, color: '#D54941' }
    ]
  });

  // ====== 云端优先数据拉取 ======

  const fetchCandidates = async () => {
    try {
      const { data, source } = await apiDataService.getCandidates();
      if (Array.isArray(data) && data.length > 0) {
        setCandidates(data);
        setDataSource(source === 'api' ? 'cloud' : 'local');
      }
    } catch (error) {
      console.warn('Failed to fetch candidates:', error);
    }
  };

  const fetchAiConfig = async () => {
    try {
      const { data, source } = await apiDataService.getAiConfig();
      if (data && data.modelName) {
        setAiConfig(data);
        // Also update local cache for offline fallback
        localStorageService.updateAiConfig(data);
      }
    } catch (error) {
      console.warn('Failed to fetch AI configuration:', error);
    }
  };

  React.useEffect(() => {
    // 自动清理旧版本数据
    const cleanupReport = localStorageService.autoCleanup();
    if (cleanupReport.cleaned) {
      console.log(
        `[App] 数据已自动清理 (v${cleanupReport.previousVersion} → v${cleanupReport.currentVersion})，原因: ${cleanupReport.reason}`
      );
    }

    // 初始化 API 服务（检测云端数据库连通性）
    apiDataService.initApiService().then(({ available }) => {
      setDataSource(available ? 'cloud' : 'local');
    });

    fetchCandidates();
    fetchAiConfig();
    const interval = setInterval(fetchCandidates, 5000);
    return () => clearInterval(interval);
  }, []);

  // ====== 数据写入（云端优先） ======

  const updateAiConfig = async (newConfig: AiConfig) => {
    setAiConfig(newConfig);
    try {
      await apiDataService.updateAiConfig(newConfig);
    } catch (error) {
      console.error('Failed to sync AI config to cloud:', error);
    }
  };

  const addCandidate = async (newReport: CompetencyReport, jobTitle: string) => {
    const newCandidate: Candidate = {
      id: Date.now(),
      name: '杨鸿康',
      job: jobTitle,
      score: newReport.totalScore,
      status: '已通过',
      time: new Date().toISOString()
    };

    setCandidates(prev => [newCandidate, ...prev]);

    try {
      await apiDataService.addCandidate(newCandidate);
      fetchCandidates(); // 从云端同步最新数据
    } catch (error) {
      console.warn('Failed to sync candidate to cloud, saved locally:', error);
    }
  };

  const handleLoginSuccess = (role: ViewType) => {
    setIsLoggedIn(true);
    setView(role);
    localStorage.setItem('lighthouse_portal_logged_in', 'true');
    localStorage.setItem('lighthouse_portal_view', role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('lighthouse_portal_logged_in');
  };

  const handleSetView = (newView: ViewType) => {
    setView(newView);
    localStorage.setItem('lighthouse_portal_view', newView);
  };

  const renderEmployeeModule = () => {
    switch (activeModule) {
      case 'lighthouse':
        return <Lighthouse onNext={() => setActiveModule('input')} aiConfig={aiConfig} />;
      case 'input':
        return (
          <ExperienceInput
            onNext={(newReport, jobTitle, matchResult) => {
              setReport(newReport);
              setMatchingResult(matchResult || null);
              addCandidate(newReport, jobTitle);
              setActiveModule('report');
            }}
            onBack={() => setActiveModule('lighthouse')}
            aiConfig={aiConfig}
          />
        );
      case 'report':
        return (
          <DiagnosisReport
            report={report}
            matchingResult={matchingResult}
            onNext={() => setActiveModule('feedback')}
            onBack={() => setActiveModule('input')}
          />
        );
      case 'feedback':
        return <SupportFeedback onReset={() => setActiveModule('lighthouse')} />;
      default:
        return <Lighthouse onNext={() => setActiveModule('input')} aiConfig={aiConfig} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout
      view={view}
      setView={handleSetView}
      activeModule={activeModule}
      setActiveModule={setActiveModule}
      onLogout={handleLogout}
    >
      {view === 'employee' ? renderEmployeeModule() : view === 'interviewer' ? (
        <InterviewerDashboard
          candidates={candidates}
          onRefreshCandidates={fetchCandidates}
        />
      ) : (
        <AdminDashboard
          candidates={candidates}
          aiConfig={aiConfig}
          onUpdateConfig={updateAiConfig}
        />
      )}
    </Layout>
  );
}
