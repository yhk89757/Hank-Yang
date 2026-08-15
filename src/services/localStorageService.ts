// localStorage数据服务 - 用于静态部署，替代后端API
//
// 版本管理机制：每次部署时更新 DATA_VERSION，网站加载时自动检测
// 版本不匹配 → 清空所有旧数据 → 写入新版本号 → 从默认数据重新开始
// 版本匹配   → 保留用户数据不动

const DATA_VERSION = 2; // ⬆️ 每次修改数据结构/默认值时 +1
const VERSION_KEY = 'lighthouse_data_version';

const STORAGE_KEYS = {
  CANDIDATES: 'lighthouse_candidates',
  COMPLAINTS: 'lighthouse_complaints',
  FEEDBACKS: 'lighthouse_feedbacks',
  AI_CONFIG: 'lighthouse_ai_config'
};

// 默认数据
const DEFAULT_DATA = {
  candidates: [
    { id: 1, name: '张三', job: '金融AI产品经理', score: 92, status: '已通过', time: new Date().toISOString() },
    { id: 2, name: '李四', job: 'AI原生产品经理', score: 88, status: '复核中', time: new Date().toISOString() },
    { id: 3, name: '王五', job: '通用AIGC模型产品经理（多模态方向）', score: 85, status: '已通过', time: new Date().toISOString() },
    { id: 4, name: '赵六', job: '智能支付-资金产品经理', score: 79, status: '待面试', time: new Date().toISOString() }
  ],
  complaints: [
    { 
      id: '1', 
      candidateName: '李四', 
      type: '规则疑问', 
      content: '我觉得 AI 对我的项目成果评估偏低，希望能人工复核。', 
      status: 'pending', 
      timestamp: new Date().toISOString(),
      feedback: ''
    }
  ],
  feedbacks: [
    { id: '1', rating: 5, suggestion: '系统非常透明，评估报告很有参考价值。', candidateName: '张三', timestamp: new Date().toISOString() },
    { id: '2', rating: 4, suggestion: '希望能增加更多岗位的 AI 评估。', candidateName: '李四', timestamp: new Date().toISOString() }
  ],
  aiConfig: {
    modelName: '胜任力大模型 3.0',
    languageStyle: '专业、客观、激励性',
    principles: ['公正性优先', '隐私即安全', '多维度匹配', '解释性评估'],
    systemPrompt: '你是一个专业的资深人才评测与转岗评估专家，负责根据候选人的简历、项目成果和个人作品，结合岗位人才画像进行深度匹配度分析。你的目标是提供客观、公正且具有成长建议的评估报告。',
    weights: [
      { label: '材料匹配度', weight: 0.55, color: '#0052D9' },
      { label: '部门绩效', weight: 0.15, color: '#2BA471' },
      { label: '跨界潜力', weight: 0.15, color: '#E37318' },
      { label: '笔试成绩', weight: 0.15, color: '#D54941' }
    ]
  }
};

// 通用localStorage操作函数
function getFromStorage<T>(key: string, defaultData: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultData;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultData;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

// Candidates API
export function getCandidates(): any[] {
  return getFromStorage(STORAGE_KEYS.CANDIDATES, DEFAULT_DATA.candidates);
}

export function addCandidate(candidate: any): any {
  const candidates = getCandidates();
  const newCandidate = { ...candidate, id: Date.now() };
  const updatedCandidates = [newCandidate, ...candidates];
  saveToStorage(STORAGE_KEYS.CANDIDATES, updatedCandidates);
  return newCandidate;
}

export function updateCandidate(id: number, updates: any): any | null {
  const candidates = getCandidates();
  const index = candidates.findIndex(c => c.id === id);
  if (index !== -1) {
    candidates[index] = { ...candidates[index], ...updates };
    saveToStorage(STORAGE_KEYS.CANDIDATES, candidates);
    return candidates[index];
  }
  return null;
}

export function updateCandidateStatus(name: string, status: string): any | null {
  const candidates = getCandidates();
  const index = candidates.findIndex(c => c.name === name);
  if (index !== -1) {
    candidates[index] = { ...candidates[index], status };
    saveToStorage(STORAGE_KEYS.CANDIDATES, candidates);
    return candidates[index];
  }
  return null;
}

// Complaints API
export function getComplaints(): any[] {
  return getFromStorage(STORAGE_KEYS.COMPLAINTS, DEFAULT_DATA.complaints);
}

export function addComplaint(complaint: any): any {
  const complaints = getComplaints();
  const newComplaint = { ...complaint, id: Date.now().toString(), status: 'pending', timestamp: new Date().toISOString(), feedback: '' };
  const updatedComplaints = [newComplaint, ...complaints];
  saveToStorage(STORAGE_KEYS.COMPLAINTS, updatedComplaints);
  
  // 更新候选人状态
  if (complaint.candidateName) {
    const newStatus = complaint.type === '投诉' ? '投诉处理中' : '申诉待处理';
    updateCandidateStatus(complaint.candidateName, newStatus);
  }
  
  return newComplaint;
}

export function updateComplaint(id: string, updates: any): any | null {
  const complaints = getComplaints();
  const index = complaints.findIndex(c => c.id === id);
  if (index !== -1) {
    complaints[index] = { ...complaints[index], ...updates };
    saveToStorage(STORAGE_KEYS.COMPLAINTS, complaints);
    
    // 如果解决了，更新候选人状态
    if (updates.status === 'resolved' && complaints[index].candidateName) {
      updateCandidateStatus(complaints[index].candidateName, '已复核');
    }
    
    return complaints[index];
  }
  return null;
}

// Feedbacks API
export function getFeedbacks(): any[] {
  return getFromStorage(STORAGE_KEYS.FEEDBACKS, DEFAULT_DATA.feedbacks);
}

export function addFeedback(feedback: any): any {
  const feedbacks = getFeedbacks();
  const newFeedback = { ...feedback, id: Date.now().toString(), timestamp: new Date().toISOString() };
  const updatedFeedbacks = [newFeedback, ...feedbacks];
  saveToStorage(STORAGE_KEYS.FEEDBACKS, updatedFeedbacks);
  return newFeedback;
}

// AI Config API
export function getAiConfig(): any {
  return getFromStorage(STORAGE_KEYS.AI_CONFIG, DEFAULT_DATA.aiConfig);
}

export function updateAiConfig(config: any): any {
  const updatedConfig = { ...getAiConfig(), ...config };
  saveToStorage(STORAGE_KEYS.AI_CONFIG, updatedConfig);
  return updatedConfig;
}

// ========== 自动清理机制 ==========

interface CleanupReport {
  cleaned: boolean;
  reason: 'version_mismatch' | 'force' | 'none';
  previousVersion: number | null;
  currentVersion: number;
}

/**
 * 页面加载时自动调用，检测并清理旧版本数据。
 *
 * 规则：
 * 1. 首次访问（无版本号）→ 写入当前版本号，写入默认数据
 * 2. 版本号匹配 → 保留现有数据，不操作
 * 3. 版本号不匹配 → 清空所有旧数据，写入默认数据，写入新版本号
 *
 * 返回清理报告，方便调试。
 */
export function autoCleanup(): CleanupReport {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  const parsedVersion = storedVersion ? parseInt(storedVersion, 10) : null;

  const report: CleanupReport = {
    cleaned: false,
    reason: 'none',
    previousVersion: parsedVersion,
    currentVersion: DATA_VERSION
  };

  // 首次访问：写入默认数据和版本号
  if (parsedVersion === null) {
    console.log(`[自动清理] 首次访问，初始化数据版本 v${DATA_VERSION}`);
    seedAllDefaults();
    localStorage.setItem(VERSION_KEY, String(DATA_VERSION));
    report.reason = 'force';
    report.cleaned = true;
    return report;
  }

  // 版本匹配：不做任何操作
  if (parsedVersion === DATA_VERSION) {
    return report;
  }

  // 版本不匹配：清空所有旧数据，重新播种
  console.log(
    `[自动清理] 检测到数据版本变更 v${parsedVersion} → v${DATA_VERSION}，正在清理旧数据...`
  );

  // 清空所有相关 key
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });

  // 写入新的默认数据
  seedAllDefaults();

  // 写入新版本号
  localStorage.setItem(VERSION_KEY, String(DATA_VERSION));

  report.cleaned = true;
  report.reason = 'version_mismatch';
  console.log('[自动清理] 清理完成，已写入最新默认数据。');
  return report;
}

/**
 * 强制清空所有数据并重新播种（调试用）
 */
export function forceCleanup(): CleanupReport {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  seedAllDefaults();
  localStorage.setItem(VERSION_KEY, String(DATA_VERSION));
  return {
    cleaned: true,
    reason: 'force',
    previousVersion: null,
    currentVersion: DATA_VERSION
  };
}

/**
 * 将所有默认数据写入 localStorage（内部函数）
 */
function seedAllDefaults(): void {
  saveToStorage(STORAGE_KEYS.CANDIDATES, DEFAULT_DATA.candidates);
  saveToStorage(STORAGE_KEYS.COMPLAINTS, DEFAULT_DATA.complaints);
  saveToStorage(STORAGE_KEYS.FEEDBACKS, DEFAULT_DATA.feedbacks);
  saveToStorage(STORAGE_KEYS.AI_CONFIG, DEFAULT_DATA.aiConfig);
}
