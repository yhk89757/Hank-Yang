/// <reference types="vite/client" />
import {
  ResumeParsedData,
  JDParsedData,
  TalentProfileData,
  MatchingResult,
  SkillGap,
  LearningResource,
  DimensionMatch,
} from '../types';

const API_URL = import.meta.env.VITE_AI_API_URL || 'https://api.deepseek.com/v1';
const API_KEY = import.meta.env.VITE_AI_API_KEY || '';

// 全局状态：追踪是否使用了fallback
export const aiStatus = {
  resumeParsed: false,
  jdParsed: false,
  profileParsed: false,
  matchDone: false,
  learningDone: false,
  anyFallback: false,
  lastError: '',
};

/**
 * 通用DeepSeek API调用封装（带重试）
 */
async function callDeepSeek(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.3,
  retries: number = 2
): Promise<string> {
  if (!API_KEY) {
    aiStatus.lastError = 'DeepSeek API Key 未配置';
    throw new Error(aiStatus.lastError);
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(`${API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature,
          max_tokens: 4096,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 300)}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('API返回内容为空');
      return content;
    } catch (error: any) {
      lastError = error;
      aiStatus.lastError = error.message || String(error);
      console.warn(`DeepSeek API 调用失败 (第${attempt + 1}次):`, aiStatus.lastError);
      
      if (attempt < retries) {
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('DeepSeek API 调用失败，已达最大重试次数');
}

/**
 * 清理 AI 返回的 JSON（处理 markdown 代码块等）
 */
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  // 移除 markdown 代码块
  const jsonMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (jsonMatch) {
    cleaned = jsonMatch[1].trim();
  }
  // 尝试提取 JSON 对象
  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objMatch) {
    cleaned = objMatch[0];
  }
  return cleaned;
}

/**
 * 解析简历，提取结构化信息
 */
export async function parseResume(resumeText: string): Promise<ResumeParsedData> {
  aiStatus.resumeParsed = false;
  const systemPrompt = `你是一位资深HR和简历解析专家。你的任务是从简历文本中提取结构化信息。你必须只输出一个有效的JSON对象，不要有任何其他文字。`;
  const userPrompt = `请解析以下简历文本，提取完整的结构化信息。只输出JSON，不要添加解释。

【简历原文】
${resumeText}

输出格式（严格JSON，所有字段必填）：
{
  "name": "候选人姓名（从简历中提取，找不到填'未知'）",
  "skills": ["技能1", "技能2"],
  "skillLevels": [{"skill": "技能名", "level": "初级|中级|高级|专家"}],
  "experience": [{"company": "公司名", "role": "职位", "duration": "时长", "highlights": ["亮点"]}],
  "education": {"degree": "学历", "school": "学校", "major": "专业"},
  "projects": [{"name": "项目名", "description": "描述", "role": "角色", "technologies": ["技术"]}],
  "summary": "200字以内的候选人综合摘要"
}`;

  try {
    const text = await callDeepSeek(systemPrompt, userPrompt, 0.2);
    const result = JSON.parse(cleanJsonResponse(text));
    aiStatus.resumeParsed = true;
    return result;
  } catch (error) {
    console.error('简历解析失败，使用本地规则解析:', error);
    aiStatus.anyFallback = true;
    return getFallbackResumeData(resumeText);
  }
}

/**
 * 解析JD，提取结构化需求
 */
export async function parseJD(jdText: string): Promise<JDParsedData> {
  aiStatus.jdParsed = false;
  const systemPrompt = `你是一位资深招聘专家。请从岗位描述(JD)中提取结构化信息。你必须只输出一个有效的JSON对象，不要有任何其他文字。`;
  const userPrompt = `请解析以下JD文本，提取结构化需求。只输出JSON。

【JD原文】
${jdText}

输出格式（严格JSON）：
{
  "requiredSkills": ["硬性技能要求"],
  "preferredSkills": ["加分技能"],
  "experienceRequirement": "经验要求总体描述",
  "educationRequirement": "学历要求描述",
  "responsibilities": ["核心职责"],
  "softSkills": ["软技能"],
  "keywords": ["关键词"]
}`;

  try {
    const text = await callDeepSeek(systemPrompt, userPrompt, 0.2);
    const result = JSON.parse(cleanJsonResponse(text));
    aiStatus.jdParsed = true;
    return result;
  } catch (error) {
    console.error('JD解析失败，使用本地规则解析:', error);
    aiStatus.anyFallback = true;
    return getFallbackJDData(jdText);
  }
}

/**
 * 解析人才画像
 */
export async function parseTalentProfile(portraitText: string): Promise<TalentProfileData> {
  aiStatus.profileParsed = false;
  const systemPrompt = `你是一位人才评估专家。请从人才画像文本中提取结构化信息。你必须只输出一个有效的JSON对象。`;
  const userPrompt = `请解析以下人才画像文本。只输出JSON。

【人才画像】
${portraitText}

输出格式（严格JSON）：
{
  "coreTraits": ["核心特质"],
  "rolePositioning": "角色定位的一句话描述",
  "capabilityMatrix": [{"category": "能力类别", "requirements": ["要求"]}],
  "idealBackground": "理想背景描述"
}`;

  try {
    const text = await callDeepSeek(systemPrompt, userPrompt, 0.2);
    const result = JSON.parse(cleanJsonResponse(text));
    aiStatus.profileParsed = true;
    return result;
  } catch (error) {
    console.error('画像解析失败，使用本地规则解析:', error);
    aiStatus.anyFallback = true;
    return getFallbackProfileData(portraitText);
  }
}

/**
 * 智能匹配：综合评估候选人与岗位的匹配度
 */
export async function matchCandidate(
  resumeData: ResumeParsedData,
  jdData: JDParsedData,
  talentProfile: TalentProfileData,
  extraInfo?: {
    performanceLevel?: string;
    testScore?: number;
    motivation?: string;
    projectResultsText?: string;
    personalWorksText?: string;
  }
): Promise<{
  dimensionMatches: DimensionMatch[];
  skillGaps: SkillGap[];
  overallScore: number;
  summary: string;
  recommendation: string;
}> {
  aiStatus.matchDone = false;
  const systemPrompt = `你是一位严苛的AI人才匹配专家，拥有20年HR经验。请基于候选人数据、JD和人才画像，进行五维度深度匹配分析。必须只输出一个有效的JSON对象。

评估固定权重：
1. 技能匹配 (45%)
2. 经验匹配 (25%)
3. 教育背景 (10%)
4. 跨界潜力 (15%)
5. 文化契合 (5%)`;

  const userPrompt = `请严格基于以下数据进行综合匹配评估。只输出JSON。

【候选人简历数据】
${JSON.stringify(resumeData, null, 2)}

【JD需求】
${JSON.stringify(jdData, null, 2)}

【人才画像】
${JSON.stringify(talentProfile, null, 2)}

【补充信息】
- 绩效水平: ${extraInfo?.performanceLevel || 'N/A'}
- 笔试成绩: ${extraInfo?.testScore || 'N/A'}
- 转岗动机: ${extraInfo?.motivation || 'N/A'}
- 项目成果: ${extraInfo?.projectResultsText ? '已提供' : '未提供'}
- 个人作品: ${extraInfo?.personalWorksText ? '已提供' : '未提供'}

输出JSON格式（overallScore必须严格按权重计算 = 技能*0.45 + 经验*0.25 + 教育*0.10 + 跨界*0.15 + 文化*0.05）：
{
  "dimensionMatches": [
    {"dimension": "技能匹配", "score": 0-100, "weight": 0.45, "matchedPoints": [], "gapPoints": [], "detail": ""},
    {"dimension": "经验匹配", "score": 0-100, "weight": 0.25, "matchedPoints": [], "gapPoints": [], "detail": ""},
    {"dimension": "教育背景", "score": 0-100, "weight": 0.10, "matchedPoints": [], "gapPoints": [], "detail": ""},
    {"dimension": "跨界潜力", "score": 0-100, "weight": 0.15, "matchedPoints": [], "gapPoints": [], "detail": ""},
    {"dimension": "文化契合", "score": 0-100, "weight": 0.05, "matchedPoints": [], "gapPoints": [], "detail": ""}
  ],
  "skillGaps": [{"skill": "技能名", "requiredLevel": "要求等级", "currentLevel": "当前等级", "gap": "none|minor|moderate|significant", "priority": "high|medium|low"}],
  "overallScore": 加权总分(0-100),
  "summary": "300字以内的综合评语，需包含核心优势、主要差距和总体建议",
  "recommendation": "highly_recommend|recommend|consider|not_recommend"
}`;

  try {
    const text = await callDeepSeek(systemPrompt, userPrompt, 0.3);
    const result = JSON.parse(cleanJsonResponse(text));
    aiStatus.matchDone = true;
    return result;
  } catch (error) {
    console.error('智能匹配失败，使用本地计算:', error);
    aiStatus.anyFallback = true;
    return getFallbackMatchingResult(resumeData, jdData, extraInfo);
  }
}

/**
 * 根据技能差距推荐学习资源
 */
export async function recommendLearningResources(
  skillGaps: SkillGap[],
  jobTitle: string
): Promise<LearningResource[]> {
  aiStatus.learningDone = false;
  if (!skillGaps || skillGaps.length === 0) {
    aiStatus.learningDone = true;
    return [];
  }

  const gapsWithIssue = skillGaps.filter(g => g.gap !== 'none');
  if (gapsWithIssue.length === 0) {
    aiStatus.learningDone = true;
    return [];
  }

  const systemPrompt = `你是一位资深学习发展顾问。请根据候选人的技能差距，推荐针对性的学习资源。必须只输出一个JSON数组。`;
  const userPrompt = `为以下技能差距推荐学习资源，目标岗位：【${jobTitle}】。

【技能差距】
${JSON.stringify(gapsWithIssue, null, 2)}

为每个有差距的技能推荐1-2个真实存在的高质量学习资源。只输出JSON数组：
[
  {
    "title": "资源名称",
    "type": "course|book|article|project|certification",
    "provider": "提供方",
    "url": "资源链接",
    "description": "100字以内描述及推荐理由",
    "targetSkill": "目标技能名称",
    "difficulty": "入门|进阶|高级",
    "duration": "预计学习时长",
    "relevance": 85
  }
]
要求：资源必须真实存在、按相关度降序、优先推荐有实践项目的资源`;

  try {
    const text = await callDeepSeek(systemPrompt, userPrompt, 0.4);
    const resources = JSON.parse(cleanJsonResponse(text));
    const arr = Array.isArray(resources) ? resources : (resources.learningResources || []);
    aiStatus.learningDone = true;
    return arr;
  } catch (error) {
    console.error('学习资源推荐失败，使用内置推荐:', error);
    aiStatus.anyFallback = true;
    return getFallbackLearningResources(skillGaps);
  }
}

/**
 * 一站式智能匹配管线
 */
export async function fullMatchPipeline(
  resumeText: string,
  jdText: string,
  portraitText: string,
  jobTitle: string,
  extraInfo?: {
    performanceLevel?: string;
    testScore?: number;
    motivation?: string;
    projectResultsText?: string;
    personalWorksText?: string;
  }
): Promise<MatchingResult> {
  // 重置状态
  aiStatus.anyFallback = false;
  aiStatus.lastError = '';

  // 阶段1: 并行解析简历、JD和人才画像
  console.log('[DeepSeek] 阶段1: 开始并行解析简历、JD、人才画像...');
  const [resumeParsed, jdParsed, talentProfile] = await Promise.all([
    parseResume(resumeText),
    parseJD(jdText),
    parseTalentProfile(portraitText),
  ]);
  console.log('[DeepSeek] 阶段1完成 - 简历AI:', aiStatus.resumeParsed, 'JD AI:', aiStatus.jdParsed, '画像 AI:', aiStatus.profileParsed);

  // 阶段2: 匹配评估
  console.log('[DeepSeek] 阶段2: 开始智能匹配...');
  const matchResult = await matchCandidate(resumeParsed, jdParsed, talentProfile, extraInfo);
  console.log('[DeepSeek] 阶段2完成 - 匹配 AI:', aiStatus.matchDone, '总分:', matchResult.overallScore);

  // 阶段3: 学习资源推荐
  console.log('[DeepSeek] 阶段3: 开始学习资源推荐...');
  const learningResources = await recommendLearningResources(matchResult.skillGaps, jobTitle);
  console.log('[DeepSeek] 阶段3完成 - 学习资源 AI:', aiStatus.learningDone, '数量:', learningResources.length);

  return {
    overallScore: matchResult.overallScore,
    dimensionMatches: matchResult.dimensionMatches,
    skillGaps: matchResult.skillGaps,
    learningResources,
    resumeParsed,
    jdParsed,
    talentProfile,
    summary: matchResult.summary,
    recommendation: matchResult.recommendation as MatchingResult['recommendation'],
  };
}

// ========== Fallback 数据（基于输入文本做本地规则解析） ==========

function getFallbackResumeData(text: string): ResumeParsedData {
  // 基于简历文本做简单本地规则提取
  const skills = extractSkillsFromText(text);
  const education = extractEducation(text);
  const name = extractName(text);
  
  return {
    name: name || '候选人',
    skills: skills.length > 0 ? skills : ['项目管理', '数据分析', '产品规划'],
    skillLevels: skills.map(s => ({ skill: s, level: '中级' as const })),
    experience: [{ company: '待解析', role: '待解析', duration: '待解析', highlights: [] }],
    education: education || { degree: '本科', school: '待解析', major: '待解析' },
    projects: [],
    summary: `基于简历文本（${text.length}字）的本地解析结果。简历中检测到${skills.length}项技能关键词。`,
  };
}

function getFallbackJDData(text: string): JDParsedData {
  const skills = extractSkillsFromText(text);
  return {
    requiredSkills: skills.length > 0 ? skills : ['产品规划', '数据分析', '项目管理'],
    preferredSkills: ['AI技术理解', '跨团队协作'],
    experienceRequirement: '3-5年相关经验',
    educationRequirement: '本科及以上',
    responsibilities: ['负责产品规划与设计', '需求分析与管理'],
    softSkills: ['沟通协作', '逻辑思维'],
    keywords: skills.length > 0 ? skills : ['产品', '数据', 'AI'],
  };
}

function getFallbackProfileData(text: string): TalentProfileData {
  return {
    coreTraits: extractKeywords(text, 3),
    rolePositioning: '具备AI产品思维的专业人才',
    capabilityMatrix: [
      { category: '产品能力', requirements: ['产品规划', '需求分析'] },
      { category: '技术理解', requirements: ['AI基础知识', '技术沟通'] },
    ],
    idealBackground: '有AI产品或相关技术背景',
  };
}

function getFallbackMatchingResult(
  resumeData: ResumeParsedData,
  jdData: JDParsedData,
  extraInfo?: {
    performanceLevel?: string;
    testScore?: number;
    motivation?: string;
    projectResultsText?: string;
    personalWorksText?: string;
  }
) {
  // 基于实际数据做简单的技能匹配计算
  const resumeSkills = new Set(resumeData.skills.map(s => s.toLowerCase()));
  const jdSkills = new Set(jdData.requiredSkills.map(s => s.toLowerCase()));
  const matchedSkills = [...resumeSkills].filter(s => jdSkills.has(s));
  const matchRate = jdSkills.size > 0 ? matchedSkills.length / jdSkills.size : 0.5;
  
  const skillScore = Math.round(matchRate * 100);
  
  // 经验维度基于简历中的经验数量
  const expCount = resumeData.experience?.length || 0;
  const expScore = Math.min(90, 40 + expCount * 10);
  
  // 教育维度
  const degreeMap: Record<string, number> = { '博士': 90, '硕士': 80, '本科': 70, '大专': 50, '未知': 60 };
  const eduScore = degreeMap[resumeData.education?.degree || ''] || 60;
  
  // 跨界潜力：基于项目数量+作品+动机
  const projCount = resumeData.projects?.length || 0;
  const hasProjectResults = !!(extraInfo?.projectResultsText && extraInfo.projectResultsText.length > 50);
  const hasPersonalWorks = !!(extraInfo?.personalWorksText && extraInfo.personalWorksText.length > 50);
  const motLen = (extraInfo?.motivation || '').length;
  const potBase = Math.min(60, 30 + projCount * 10);
  const potBonus = (hasProjectResults ? 15 : 0) + (hasPersonalWorks ? 10 : 0) + (motLen > 50 ? 15 : motLen > 20 ? 10 : 0);
  const potScore = Math.min(100, potBase + potBonus);
  
  // 文化契合：基于技能多样性和绩效等级
  const perfMap: Record<string, number> = { A: 85, B: 75, C: 60 };
  const perfScore = perfMap[extraInfo?.performanceLevel || ''] || 65;
  const cultureScore = Math.min(95, Math.round((resumeData.skills.length > 8 ? 75 : 55) * 0.5 + perfScore * 0.5));
  
  // 笔试成绩融入教育维度（笔试反映学习能力）
  const testScore = extraInfo?.testScore || 0;
  const testAdjust = testScore > 0 ? Math.round((testScore / 100 - 0.5) * 10) : 0; // ±5调整
  const adjustedEduScore = Math.min(100, Math.max(0, eduScore + testAdjust));
  
  const overallScore = Math.round(
    skillScore * 0.45 + expScore * 0.25 + adjustedEduScore * 0.10 + potScore * 0.15 + cultureScore * 0.05
  );

  return {
    dimensionMatches: [
      {
        dimension: '技能匹配',
        score: skillScore,
        weight: 0.45,
        matchedPoints: matchedSkills.length > 0 ? matchedSkills : ['基础能力匹配'],
        gapPoints: [...jdSkills].filter(s => !resumeSkills.has(s)).map(s => `缺少「${s}」技能`),
        detail: `候选人${resumeData.skills.length}项技能中，与JD匹配${matchedSkills.length}项（匹配率${Math.round(matchRate * 100)}%）。${resumeData.name || '候选人'}的核心技能${matchRate >= 0.6 ? '较好' : '部分'}覆盖岗位要求。`,
      },
      {
        dimension: '经验匹配',
        score: expScore,
        weight: 0.25,
        matchedPoints: expCount > 0 ? [`${expCount}段相关工作经历`] : ['具备相关背景'],
        gapPoints: expCount < 2 ? ['工作经历偏少，建议积累更多实战经验'] : [],
        detail: `候选人简历中有${expCount}段工作/实习经历，经验匹配度${expScore}分。${expCount >= 3 ? '经验丰富，可快速适应新岗位。' : '建议通过内部项目积累更多相关经验。'}`,
      },
      {
        dimension: '教育背景',
        score: adjustedEduScore,
        weight: 0.10,
        matchedPoints: [`学历${resumeData.education?.degree || '未知'}·${resumeData.education?.school || '未知'}`],
        gapPoints: testScore < 60 ? [`笔试成绩${testScore}分偏低，建议加强专业知识学习`] : [],
        detail: `学历背景（${resumeData.education?.degree || '未知'}）评${eduScore}分，笔试成绩${testScore}分${testAdjust >= 0 ? '正面加分' : '略有影响'}(${testAdjust >= 0 ? '+' : ''}${testAdjust})，综合${adjustedEduScore}分。`,
      },
      {
        dimension: '跨界潜力',
        score: potScore,
        weight: 0.15,
        matchedPoints: [
          projCount > 0 ? `${projCount}个项目经验` : '具备学习基础',
          hasProjectResults ? '已提交项目成果' : '',
          hasPersonalWorks ? '已提交个人作品' : '',
          motLen > 50 ? '转岗动机详实' : '',
        ].filter(Boolean),
        gapPoints: [
          !hasProjectResults && '未提交项目成果材料',
          !hasPersonalWorks && '未提交个人作品材料',
          motLen <= 20 && '转岗动机过于简短',
        ].filter(Boolean) as string[],
        detail: `项目经验(${projCount}个)、成果提交(${hasProjectResults ? '是' : '否'})、作品提交(${hasPersonalWorks ? '是' : '否'})、动机字数(${motLen})综合评估${potScore}分。`,
      },
      {
        dimension: '文化契合',
        score: cultureScore,
        weight: 0.05,
        matchedPoints: ['基本文化契合', ...(extraInfo?.performanceLevel === 'A' ? ['高绩效团队贡献者'] : [])],
        gapPoints: extraInfo?.performanceLevel === 'C' ? ['历史绩效偏低，需关注适应能力'] : [],
        detail: `基于${resumeData.skills.length}项技能组合与绩效${extraInfo?.performanceLevel || '未知'}级综合评估文化契合度${cultureScore}分。`,
      },
    ],
    skillGaps: [...jdSkills]
      .filter(s => !resumeSkills.has(s))
      .slice(0, 5)
      .map(s => ({
        skill: s,
        requiredLevel: '中级',
        currentLevel: '初级',
        gap: 'moderate' as const,
        priority: 'high' as const,
      })),
    overallScore,
    summary: `(本地规则计算) 候选人${resumeData.skills.length}项技能 vs JD${jdData.requiredSkills.length}项要求，技能匹配率${Math.round(matchRate * 100)}%。笔试${testScore}分，绩效${extraInfo?.performanceLevel || '未知'}级。五维度加权总分${overallScore}分。${overallScore >= 70 ? '建议进入面试环节。' : '建议加强核心技能后重新评估。'}`,
    recommendation: overallScore >= 80 ? 'highly_recommend' : overallScore >= 65 ? 'recommend' : overallScore >= 50 ? 'consider' : 'not_recommend',
  };
}

function getFallbackLearningResources(gaps: SkillGap[]): LearningResource[] {
  const resourceMap: Record<string, LearningResource> = {
    '产品规划': { title: '《产品方法论》', type: 'book', provider: '电子工业出版社', url: '', description: '系统掌握产品规划全流程', targetSkill: '产品规划', difficulty: '进阶', duration: '2周', relevance: 90 },
    '数据分析': { title: 'SQL与数据分析实战', type: 'course', provider: 'Coursera', url: 'https://www.coursera.org/', description: '提升数据驱动决策能力', targetSkill: '数据分析', difficulty: '进阶', duration: '8小时', relevance: 85 },
    '项目管理': { title: 'PMP认证指南', type: 'certification', provider: 'PMI', url: '', description: '国际项目管理专业认证', targetSkill: '项目管理', difficulty: '高级', duration: '3个月', relevance: 80 },
    '用户研究': { title: '用户体验研究方法', type: 'course', provider: 'IDEO U', url: '', description: '学习系统的用户研究方法论', targetSkill: '用户研究', difficulty: '进阶', duration: '4周', relevance: 82 },
    '需求分析': { title: '需求工程最佳实践', type: 'book', provider: '机械工业出版社', url: '', description: '需求分析的系统方法论', targetSkill: '需求分析', difficulty: '进阶', duration: '2周', relevance: 88 },
  };

  return gaps
    .filter(g => g.gap !== 'none')
    .map(g => resourceMap[g.skill] || {
      title: `${g.skill}实战指南`,
      type: 'course',
      provider: '极客时间',
      url: 'https://time.geekbang.org/',
      description: `针对性提升${g.skill}能力的实践课程`,
      targetSkill: g.skill,
      difficulty: '进阶',
      duration: '4周',
      relevance: 75,
    });
}

// ========== 本地辅助解析函数 ==========

function extractSkillsFromText(text: string): string[] {
  const skillPatterns = [
    'React', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'Go',
    '产品规划', '产品设计', '产品管理', '数据分析', '数据挖掘', '机器学习', '深度学习',
    '项目管理', '需求分析', '用户研究', '用户增长', '增长黑客', '运营策略',
    'NLP', 'CV', '大语言模型', 'LLM', 'AI', '人工智能', 'Prompt Engineering',
    'SQL', 'Tableau', 'PowerBI', 'Excel', 'Figma', 'Sketch', 'Axure',
    '前端开发', '后端开发', '全栈开发', '移动端开发', '小程序开发',
    'HR', '人力资源', '招聘', '培训', '绩效', '薪酬',
    '营销', '品牌', '新媒体', '内容运营', '社群运营',
    '战略', '商业分析', '咨询', '财务分析',
  ];

  const found = new Set<string>();
  const lowerText = text.toLowerCase();
  for (const skill of skillPatterns) {
    if (lowerText.includes(skill.toLowerCase())) {
      found.add(skill);
    }
  }
  return [...found].slice(0, 15);
}

function extractEducation(text: string): { degree: string; school: string; major: string } | null {
  const degrees = ['博士', '硕士', '本科', '学士', '大专', 'MBA', 'EMBA', 'PhD'];
  let degree = '';
  for (const d of degrees) {
    if (text.includes(d)) { degree = d; break; }
  }
  if (!degree) return null;

  // 尝试提取学校
  const schoolMatch = text.match(/([\u4e00-\u9fa5]{2,10}(大学|学院|College|University))/);
  const school = schoolMatch ? schoolMatch[0] : '待解析';

  // 尝试提取专业
  const majorMatch = text.match(/专业[：:]\s*([^\n，。,\.]{2,20})/);
  const major = majorMatch ? majorMatch[1] : '待解析';

  return { degree, school, major };
}

function extractName(text: string): string {
  // 简单的中文姓名提取
  const nameMatch = text.match(/([\u4e00-\u9fa5]{2,4})\s*(的简历|简历|个人简历)/);
  if (nameMatch) return nameMatch[1];
  
  // 尝试提取第一行的姓名
  const lines = text.split('\n').filter(l => l.trim());
  const firstLine = lines[0]?.trim() || '';
  const nameOnly = firstLine.match(/^([\u4e00-\u9fa5]{2,4})$/);
  if (nameOnly) return nameOnly[1];
  
  return '';
}

function extractKeywords(text: string, count: number): string[] {
  const keywords = [
    '创新', '领导力', '协作', '执行力', '学习能力', '解决问题',
    '数据驱动', '用户导向', '结果导向', '自驱力', '沟通', '逻辑思维',
    '技术深度', '产品思维', '商业敏感', '战略眼光', '韧性',
  ];
  const found = keywords.filter(k => text.includes(k));
  return found.length > 0 ? found.slice(0, count) : ['学习能力', '协作', '执行力'];
}
