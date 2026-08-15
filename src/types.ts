export type ViewType = 'employee' | 'admin' | 'interviewer';
export type EmployeeModule = 'lighthouse' | 'input' | 'report' | 'feedback';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  jd: string;
  portrait: string;
  experience: string;
  education: string;
}

export interface CompetencyReport {
  totalScore: number;
  scores: {
    match: number;      // 匹配度 (55%)
    performance: number; // 绩效 (15%)
    potential: number;   // 潜力 (15%)
    test: number;        // 笔试 (15%)
  };
  analysis: {
    highlight: string;
    adaptation: string;
    growth: string;
  };
  reasoning: {
    dimension: string;
    score: number;
    detail: string;
  }[];
}

export interface Complaint {
  id: string;
  type: 'rules' | 'plan' | 'other';
  content: string;
  status: 'pending' | 'processing' | 'resolved';
  timestamp: string;
  candidateName: string;
}

export interface Candidate {
  id: number;
  name: string;
  job: string;
  score: number;
  status: string;
  time: string;
}

export interface AiConfig {
  modelName: string;
  languageStyle: string;
  principles: string[];
  systemPrompt: string;
  weights: { label: string; weight: number; color: string }[];
}

// ========== 智能匹配相关类型 ==========

/** 简历解析后的结构化数据 */
export interface ResumeParsedData {
  name: string;
  skills: string[];
  skillLevels: { skill: string; level: '初级' | '中级' | '高级' | '专家' }[];
  experience: {
    company: string;
    role: string;
    duration: string;
    highlights: string[];
  }[];
  education: {
    degree: string;
    school: string;
    major: string;
  };
  projects: {
    name: string;
    description: string;
    role: string;
    technologies: string[];
  }[];
  summary: string;
}

/** JD解析后的结构化数据 */
export interface JDParsedData {
  requiredSkills: string[];
  preferredSkills: string[];
  experienceRequirement: string;
  educationRequirement: string;
  responsibilities: string[];
  softSkills: string[];
  keywords: string[];
}

/** 人才画像解析数据 */
export interface TalentProfileData {
  coreTraits: string[];
  rolePositioning: string;
  capabilityMatrix: {
    category: string;
    requirements: string[];
  }[];
  idealBackground: string;
}

/** 单个维度的匹配结果 */
export interface DimensionMatch {
  dimension: string;
  score: number;
  weight: number;
  matchedPoints: string[];
  gapPoints: string[];
  detail: string;
}

/** 技能差距 */
export interface SkillGap {
  skill: string;
  requiredLevel: string;
  currentLevel: string;
  gap: 'none' | 'minor' | 'moderate' | 'significant';
  priority: 'high' | 'medium' | 'low';
}

/** 学习资源推荐 */
export interface LearningResource {
  title: string;
  type: 'course' | 'book' | 'article' | 'project' | 'certification';
  provider: string;
  url: string;
  description: string;
  targetSkill: string;
  difficulty: '入门' | '进阶' | '高级';
  duration: string;
  relevance: number;
}

/** 完整的智能匹配结果 */
export interface MatchingResult {
  overallScore: number;
  dimensionMatches: DimensionMatch[];
  skillGaps: SkillGap[];
  learningResources: LearningResource[];
  resumeParsed: ResumeParsedData;
  jdParsed: JDParsedData;
  talentProfile: TalentProfileData;
  summary: string;
  recommendation: 'highly_recommend' | 'recommend' | 'consider' | 'not_recommend';
}
