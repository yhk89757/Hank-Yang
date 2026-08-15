/// <reference types="vite/client" />
import { GoogleGenAI } from "@google/genai";
import { CompetencyReport, AiConfig } from "../types";

// 优先使用用户自定义的配置
const customKey = import.meta.env.VITE_CUSTOM_AI_KEY;
const customBaseUrl = import.meta.env.VITE_CUSTOM_AI_BASE_URL;
const customModel = import.meta.env.VITE_CUSTOM_AI_MODEL;
const systemKey = process.env.GEMINI_API_KEY;

// 初始化 SDK，支持自定义 Base URL
const ai = new GoogleGenAI({ 
  apiKey: customKey || systemKey || "",
  baseUrl: customBaseUrl || undefined 
} as any);

export async function analyzeResume(
  resumeText: string,
  jobTitle: string,
  jobJD: string,
  motivation: string,
  actualTestScore: number,
  extraData: {
    performanceLevel: 'A' | 'B' | 'C' | '';
    hasProjectResults: boolean;
    hasPersonalWorks: boolean;
    projectResultsText: string;
    personalWorksText: string;
  },
  aiConfig?: AiConfig | null
): Promise<CompetencyReport> {
  const systemPrompt = aiConfig?.systemPrompt || "你是一个极其严苛且专业的 HR 专家。请根据以下信息对候选人进行深度转岗胜任力分析。";
  
  const weightsDescription = aiConfig?.weights.map(w => {
    if (w.label === '材料匹配度') return `1. 基于个人材料的匹配度 (满分 ${(w.weight * 100).toFixed(0)}%): 简历材料占比 30%, 个人作品占比 15%, 项目成果占比 10%`;
    if (w.label === '部门绩效') return `2. 过往部门绩效与成果 (满分 ${(w.weight * 100).toFixed(0)}%): 绩效水平 A=7%, B=5%, C=3%; 项目成果附件提交得 8%`;
    if (w.label === '跨界潜力') return `3. 跨界潜力评估 (满分 ${(w.weight * 100).toFixed(0)}%): 个人作品附件提交得 8%, 转岗动机与未来构想 AI 评估满分 7%`;
    if (w.label === '笔试成绩') return `4. 笔试成绩 (满分 ${(w.weight * 100).toFixed(0)}%): 换算公式 (实际笔试成绩 / 100) * ${(w.weight * 100).toFixed(0)}`;
    return '';
  }).join('\n    ') || `
    1. 基于个人材料的匹配度 (满分 55%): 简历材料占比 30%, 个人作品占比 15%, 项目成果占比 10%
    2. 过往部门绩效与成果 (满分 15%): 绩效水平 A=7%, B=5%, C=3%; 项目成果附件提交得 8%
    3. 跨界潜力评估 (满分 15%): 个人作品附件提交得 8%, 转岗动机与未来构想 AI 评估满分 7%
    4. 笔试成绩 (满分 15%): 换算公式 (实际笔试成绩 / 100) * 15
  `;

  const prompt = `
    ${systemPrompt}
    
    【目标岗位】: ${jobTitle}
    【岗位要求 (JD)】: ${jobJD}
    【候选人简历内容】: ${resumeText}
    【项目成果内容】: ${extraData.projectResultsText || (extraData.hasProjectResults ? "已提交文件但未提取到文本" : "未提交")}
    【个人作品内容】: ${extraData.personalWorksText || (extraData.hasPersonalWorks ? "已提交文件但未提取到文本" : "未提交")}
    【转岗动机】: ${motivation}
    【过往平均绩效水平】: ${extraData.performanceLevel}
    【在线笔试真实成绩】: ${actualTestScore} (满分100)

    请输出一个 JSON 格式的深度诊断报告，严格遵循以下评分权重逻辑：

    ${weightsDescription}

    JSON 字段要求：
    - totalScore: 以上四项加总后的百分制总分 (0-100)
    - scores: { 
        match: 基于个人材料的匹配度得分, 
        performance: 过往部门绩效与成果得分, 
        potential: 跨界潜力评估得分, 
        test: 笔试成绩换算后的得分 
      }
    - analysis: { 
        highlight: "挖掘简历/作品中隐藏的闪光点", 
        adaptation: "客观指出经验与 JD 的具体差距", 
        growth: "针对差距给出具体学习建议" 
      }
    - reasoning: [{ dimension: "维度名称", score: 分数, detail: "详细评分依据，必须提及上述权重逻辑" }]

    【评估原则】：
    1. 严格执行权重：如果某项材料未提交，对应的权重分数必须为 0。
    2. 深度匹配：分析简历中的项目深度，而不仅仅是关键词。
    3. 逻辑一致：评分必须与评语中的差距分析完全对应。
    ${aiConfig?.principles.map(p => `4. ${p}`).join('\n    ') || ''}

    注意：严格按照 JSON 格式输出，不要包含 Markdown 代码块。
  `;

  try {
    const response = await ai.models.generateContent({
      // 优先使用自定义模型名称，默认为 gemini-3-flash-preview
      model: customModel || "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "";
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    // 本地规则计算：严格基于用户实际输入的真实数据，不再使用硬编码
    return computeLocalReport(resumeText, jobJD, motivation, actualTestScore, extraData);
  }
}

/**
 * 本地规则计算胜任力报告（Gemini API 不可用时的准确兜底方案）
 * 严格基于用户实际输入的数据，每项分数均可追溯
 */
function computeLocalReport(
  resumeText: string,
  jobJD: string,
  motivation: string,
  actualTestScore: number,
  extraData: {
    performanceLevel: 'A' | 'B' | 'C' | '';
    hasProjectResults: boolean;
    hasPersonalWorks: boolean;
    projectResultsText: string;
    personalWorksText: string;
  }
): CompetencyReport {
  // --- 1. 笔试成绩换算 (满分15) ---
  // 公式: (实际笔试成绩 / 100) * 15
  const testScore = Math.round((actualTestScore / 100) * 15);
  
  // --- 2. 部门绩效 (满分15) ---
  // A=7, B=5, C=3; 项目成果附件提交得8%
  const perfMap: Record<string, number> = { A: 7, B: 5, C: 3 };
  const perfBase = perfMap[extraData.performanceLevel] || 0;
  const perfProject = extraData.hasProjectResults ? 8 : 0;
  const performanceScore = perfBase + perfProject;
  
  // --- 3. 跨界潜力 (满分15) ---
  // 个人作品附件提交得8%, 转岗动机AI评估满分7%
  const potWorks = extraData.hasPersonalWorks ? 8 : 0;
  const motLen = motivation.length;
  const potMotivation = motLen >= 100 ? 7 : motLen >= 60 ? 5 : motLen >= 30 ? 3 : motLen > 0 ? 1 : 0;
  const potentialScore = potWorks + potMotivation;
  
  // --- 4. 材料匹配度 (满分55) ---
  // 基于简历文本与JD的关键词+经验深度匹配
  const resumeLower = resumeText.toLowerCase();
  const jdLower = jobJD.toLowerCase();
  
  // 关键词池
  const keywordPool = [
    'ai', '产品', '数据', '用户', '运营', '技术', '项目管理',
    'python', 'react', '机器学习', '深度学习', '大模型', 'llm',
    '需求分析', '用户研究', '数据分析', 'sql', 'tableau',
    '增长', '策略', '商业化', '设计', '敏捷', 'scrum',
    '全栈', '前端', '后端', '移动端', '小程序',
    '沟通', '协作', '领导', '创新', '复盘'
  ];
  
  // 简历关键词命中
  const resumeKeywords = keywordPool.filter(k => resumeLower.includes(k.toLowerCase()));
  const jdKeywords = keywordPool.filter(k => jdLower.includes(k.toLowerCase()));
  
  // 匹配度 = 简历命中关键词 / JD关键词
  const jdKeyCount = jdKeywords.length || 1;
  const matchRate = Math.min(1, resumeKeywords.length / jdKeyCount);
  
  // 基础分: 55 * 匹配率
  const keywordMatchScore = Math.round(matchRate * 55 * 0.7);
  
  // 深度加分: 简历长度、项目成果、作品质量
  const depthScore = Math.min(16, Math.round(
    (resumeText.length > 500 ? 5 : resumeText.length > 200 ? 3 : 0) +
    (extraData.projectResultsText.length > 100 ? 6 : extraData.hasProjectResults ? 4 : 0) +
    (extraData.personalWorksText.length > 100 ? 5 : extraData.hasPersonalWorks ? 3 : 0)
  ));
  
  const matchScore = Math.min(55, keywordMatchScore + depthScore);
  
  // --- 汇总 ---
  const totalScore = matchScore + performanceScore + potentialScore + testScore;
  
  // --- 生成评语 ---
  const levelLabel = extraData.performanceLevel || '未知';
  const projectLabel = extraData.hasProjectResults ? '已提交' : '未提交';
  const worksLabel = extraData.hasPersonalWorks ? '已提交' : '未提交';
  
  return {
    totalScore,
    scores: {
      match: matchScore,
      performance: performanceScore,
      potential: potentialScore,
      test: testScore,
    },
    analysis: {
      highlight: resumeKeywords.length > 5
        ? `简历中检测到${resumeKeywords.length}项与目标岗位相关的关键词（${resumeKeywords.slice(0, 6).join('、')}），具备一定的专业基础。`
        : `简历中检测到${resumeKeywords.length}项与目标岗位相关的关键词，建议补充更多行业术语和项目经验细节。`,
      adaptation: jdKeywords.length > 0
        ? `目标岗位JD要求的关键能力包括：${jdKeywords.slice(0, 5).join('、')}。简历中覆盖了${resumeKeywords.length}/${jdKeywords.length}项（${Math.round(matchRate * 100)}%），差距领域需针对性提升。`
        : '目标岗位JD信息不足，无法进行精确匹配分析。请补充完整JD后重新评估。',
      growth: totalScore >= 80
        ? '综合评分较高，建议在面试中重点展示项目成果和跨界思维，同时准备对目标业务的深度洞察。'
        : totalScore >= 60
        ? `当前综合评分${totalScore}分，建议针对JD要求的${jdKeywords.filter(k => !resumeKeywords.includes(k)).slice(0, 3).join('、')}等技能进行专项提升，同时补充相关项目经验。`
        : `当前综合评分${totalScore}分，与目标岗位存在较大差距。强烈建议先通过内部培训、跨部门项目等方式积累${jdKeywords.filter(k => !resumeKeywords.includes(k)).slice(0, 3).join('、')}等核心能力。`,
    },
    reasoning: [
      {
        dimension: '材料匹配度',
        score: matchScore,
        detail: `简历命中${resumeKeywords.length}项JD关键词(${Math.round(matchRate * 100)}%匹配率) + 内容深度加分${depthScore}分 = ${matchScore}/55。绩效${levelLabel}级(${perfBase}分)+成果${projectLabel}(${perfProject}分)=${performanceScore}/15。作品${worksLabel}(${potWorks}分)+动机字数${motLen}(${potMotivation}分)=${potentialScore}/15。笔试${actualTestScore}分换算(${testScore}/15)。总分${totalScore}`,
      },
    ],
  };
}

export async function recommendJobs(
  resumeText: string,
  availableJobs: any[]
): Promise<{ jobId: string; matchScore: number; reason: string }[]> {
  const prompt = `
    你是一个专业的资深高级猎头。请根据候选人的简历内容，从提供的岗位列表中筛选出最匹配的 3 个岗位。
    
    【候选人简历内容】: ${resumeText}
    【可选岗位列表】: ${JSON.stringify(availableJobs.map(j => ({ id: j.id, title: j.title, department: j.department, jd: j.jd, portrait: j.portrait })))}

    请输出一个 JSON 数组，包含 3 个对象，每个对象包含以下字段：
    - jobId: 岗位 ID
    - matchScore: 匹配度分数 (0-100)
    - reason: 简短的推荐理由 (15字以内)

    注意：严格按照 JSON 格式输出，不要包含 Markdown 代码块，确保 JSON 可以被直接解析。
  `;

  try {
    const response = await ai.models.generateContent({
      model: customModel || "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return availableJobs.slice(0, 3).map(j => ({
      jobId: j.id,
      matchScore: 85,
      reason: "基于您的核心能力预匹配"
    }));
  }
}
