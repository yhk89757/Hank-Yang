import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory data store for candidates
  let candidates = [
    { id: 1, name: '张三', job: '金融AI产品经理', score: 92, status: '已通过', time: new Date().toISOString() },
    { id: 2, name: '李四', job: 'AI原生产品经理', score: 88, status: '复核中', time: new Date().toISOString() },
    { id: 3, name: '王五', job: '通用AIGC模型产品经理（多模态方向）', score: 85, status: '已通过', time: new Date().toISOString() },
    { id: 4, name: '赵六', job: '智能支付-资金产品经理', score: 79, status: '待面试', time: new Date().toISOString() },
  ];

  let complaints = [
    { 
      id: '1', 
      candidateName: '李四', 
      type: '规则疑问', 
      content: '我觉得 AI 对我的项目成果评估偏低，希望能人工复核。', 
      status: 'pending', 
      timestamp: new Date().toISOString(),
      feedback: ''
    }
  ];

  let feedbacks = [
    { id: '1', rating: 5, suggestion: '系统非常透明，评估报告很有参考价值。', candidateName: '张三', timestamp: new Date().toISOString() },
    { id: '2', rating: 4, suggestion: '希望能增加更多岗位的 AI 评估。', candidateName: '李四', timestamp: new Date().toISOString() }
  ];

  let aiConfig = {
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
  };

  // API Routes
  app.get("/api/candidates", (req, res) => {
    res.json(candidates);
  });

  app.get("/api/complaints", (req, res) => {
    res.json(complaints);
  });

  app.get("/api/feedbacks", (req, res) => {
    res.json(feedbacks);
  });

  app.post("/api/feedbacks", (req, res) => {
    const newFeedback = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...req.body
    };
    feedbacks = [newFeedback, ...feedbacks];
    res.status(201).json(newFeedback);
  });

  app.post("/api/complaints", (req, res) => {
    const newComplaint = {
      id: Date.now().toString(),
      status: 'pending',
      timestamp: new Date().toISOString(),
      feedback: '',
      ...req.body
    };
    complaints = [newComplaint, ...complaints];
    
    // Update candidate status
    const candIndex = candidates.findIndex(c => c.name === req.body.candidateName);
    if (candIndex !== -1) {
      candidates[candIndex].status = req.body.type === '投诉' ? '投诉处理中' : '申诉待处理';
    }
    
    res.status(201).json(newComplaint);
  });

  app.put("/api/complaints/:id", (req, res) => {
    const { id } = req.params;
    const { status, feedback } = req.body;
    const index = complaints.findIndex(c => c.id === id);
    if (index !== -1) {
      complaints[index] = { ...complaints[index], status, feedback };
      
      // If resolved, update candidate status
      const candIndex = candidates.findIndex(c => c.name === complaints[index].candidateName);
      if (candIndex !== -1 && status === 'resolved') {
        candidates[candIndex].status = '已复核';
      }
      
      return res.json(complaints[index]);
    }
    res.status(404).json({ message: "Complaint not found" });
  });

  app.get("/api/ai-config", (req, res) => {
    res.json(aiConfig);
  });

  app.post("/api/ai-config", (req, res) => {
    aiConfig = { ...aiConfig, ...req.body };
    res.json(aiConfig);
  });

  app.post("/api/candidates", (req, res) => {
    const newCandidate = {
      id: Date.now(),
      ...req.body,
      time: new Date().toISOString()
    };
    candidates = [newCandidate, ...candidates];
    res.status(201).json(newCandidate);
  });

  app.put("/api/candidates/status", (req, res) => {
    const { name, status } = req.body;
    const index = candidates.findIndex(c => c.name === name);
    if (index !== -1) {
      candidates[index] = { ...candidates[index], status };
      return res.json(candidates[index]);
    }
    res.status(404).json({ message: "Candidate not found" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
