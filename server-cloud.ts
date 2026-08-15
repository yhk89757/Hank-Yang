/**
 * 透明岗途 — 云端数据库服务器
 * 
 * 部署到 Lighthouse 使用 Node.js 运行：
 *   npm install sql.js express cors
 *   npx tsx server-cloud.ts
 * 
 * 前端通过 API 读写数据，实现多用户实时同步。
 * 数据持久化在 SQLite 文件中（重启不丢失）。
 */

import express from 'express';
import cors from 'cors';
import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(process.cwd(), 'lighthouse_data.db');

// ========== 数据库初始化 ==========

async function initDatabase(): Promise<Database> {
  const SQL = await initSqlJs();

  let db: Database;
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log(`[DB] 已加载现有数据库 (${(fileBuffer.length / 1024).toFixed(1)} KB)`);
  } else {
    db = new SQL.Database();
    console.log('[DB] 创建新数据库');
  }

  // 创建表（如果不存在）
  db.run(`
    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      job TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      status TEXT DEFAULT '待评估',
      time TEXT DEFAULT (datetime('now')),
      interviewer_score INTEGER,
      interviewer_opinion TEXT,
      interviewer_feedback TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      candidate_name TEXT NOT NULL,
      type TEXT DEFAULT '规则疑问',
      content TEXT,
      status TEXT DEFAULT 'pending',
      feedback TEXT DEFAULT '',
      timestamp TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id TEXT PRIMARY KEY,
      candidate_name TEXT,
      rating INTEGER DEFAULT 0,
      suggestion TEXT,
      timestamp TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS ai_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      config_json TEXT NOT NULL
    )
  `);

  // 种子数据（仅在表为空时）
  const count = db.exec('SELECT COUNT(*) as cnt FROM candidates');
  const cnt = count[0]?.values[0]?.[0] || 0;

  if (cnt === 0) {
    console.log('[DB] 插入初始种子数据...');
    db.run(`INSERT INTO candidates (name, job, score, status, time) VALUES
      ('张三', '金融AI产品经理', 92, '已通过', datetime('now')),
      ('李四', 'AI原生产品经理', 88, '复核中', datetime('now')),
      ('王五', '通用AIGC模型产品经理（多模态方向）', 85, '已通过', datetime('now')),
      ('赵六', '智能支付-资金产品经理', 79, '待面试', datetime('now'))
    `);

    db.run(`INSERT INTO complaints (id, candidate_name, type, content, status, timestamp) VALUES
      ('1', '李四', '规则疑问', '我觉得 AI 对我的项目成果评估偏低，希望能人工复核。', 'pending', datetime('now'))
    `);

    db.run(`INSERT INTO feedbacks (id, candidate_name, rating, suggestion, timestamp) VALUES
      ('1', '张三', 5, '系统非常透明，评估报告很有参考价值。', datetime('now')),
      ('2', '李四', 4, '希望能增加更多岗位的 AI 评估。', datetime('now'))
    `);

    const defaultConfig = {
      modelName: '胜任力大模型 3.0',
      languageStyle: '专业、客观、激励性',
      principles: ['公正性优先', '隐私即安全', '多维度匹配', '解释性评估'],
      systemPrompt: '你是一个专业的资深人才评测与转岗评估专家...',
      weights: [
        { label: '材料匹配度', weight: 0.55, color: '#0052D9' },
        { label: '部门绩效', weight: 0.15, color: '#2BA471' },
        { label: '跨界潜力', weight: 0.15, color: '#E37318' },
        { label: '笔试成绩', weight: 0.15, color: '#D54941' }
      ]
    };
    db.run(`INSERT INTO ai_config (id, config_json) VALUES (1, ?)`, [JSON.stringify(defaultConfig)]);
  }

  // 持久化保存
  saveDatabase(db);
  return db;
}

function saveDatabase(db: Database): void {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// ========== 辅助函数 ==========

function queryAll(db: Database, table: string): any[] {
  const result = db.exec(`SELECT * FROM ${table}`);
  if (!result.length || !result[0].values.length) return [];
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj: any = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

// ========== Express 服务器 ==========

async function startServer() {
  const db = await initDatabase();
  const app = express();

  // CORS — 允许 CloudBase 前端和本地开发访问
  app.use(cors({
    origin: [
      'https://hank89757-d8glv2d4ufa70b0d9-1442530132.tcloudbaseapp.com',
      'http://localhost:5173',
      'http://localhost:3000'
    ],
    credentials: false
  }));

  app.use(express.json({ limit: '10mb' }));

  // ====== Candidates API ======

  app.get('/api/candidates', (_req, res) => {
    try {
      const candidates = queryAll(db, 'candidates');
      res.json(candidates);
    } catch (err: any) {
      console.error('[API] GET /api/candidates 错误:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/candidates', (req, res) => {
    try {
      const { name, job, score, status, time } = req.body;
      db.run(
        `INSERT INTO candidates (name, job, score, status, time) VALUES (?, ?, ?, ?, ?)`,
        [name || '匿名', job || '未知岗位', score || 0, status || '待评估', time || new Date().toISOString()]
      );
      saveDatabase(db);

      const candidates = queryAll(db, 'candidates');
      const created = candidates[candidates.length - 1];
      res.status(201).json(created);
    } catch (err: any) {
      console.error('[API] POST /api/candidates 错误:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/candidates/status', (req, res) => {
    try {
      const { name, status } = req.body;
      db.run(`UPDATE candidates SET status = ? WHERE name = ?`, [status, name]);
      saveDatabase(db);

      const updated = db.exec(`SELECT * FROM candidates WHERE name = ?`, [name]);
      if (updated.length && updated[0].values.length) {
        const obj: any = {};
        updated[0].columns.forEach((col: string, i: number) => { obj[col] = updated[0].values[0][i]; });
        return res.json(obj);
      }
      res.status(404).json({ error: 'Candidate not found' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/candidates/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
      if (updates.interviewer_score !== undefined) { fields.push('interviewer_score = ?'); values.push(updates.interviewer_score); }
      if (updates.interviewer_opinion !== undefined) { fields.push('interviewer_opinion = ?'); values.push(updates.interviewer_opinion); }
      if (updates.interviewer_feedback !== undefined) { fields.push('interviewer_feedback = ?'); values.push(updates.interviewer_feedback); }

      if (fields.length === 0) return res.status(400).json({ error: '没有要更新的字段' });

      values.push(parseInt(id));
      db.run(`UPDATE candidates SET ${fields.join(', ')} WHERE id = ?`, values);
      saveDatabase(db);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ====== Complaints API ======

  app.get('/api/complaints', (_req, res) => {
    try {
      res.json(queryAll(db, 'complaints'));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/complaints', (req, res) => {
    try {
      const id = String(Date.now());
      const { candidateName, type, content } = req.body;
      db.run(
        `INSERT INTO complaints (id, candidate_name, type, content, status, timestamp) VALUES (?, ?, ?, ?, 'pending', datetime('now'))`,
        [id, candidateName || '匿名', type || '规则疑问', content || '']
      );

      // 同步更新候选人状态
      if (candidateName) {
        db.run(`UPDATE candidates SET status = ? WHERE name = ?`, [
          type === '投诉' ? '投诉处理中' : '申诉待处理',
          candidateName
        ]);
      }

      saveDatabase(db);
      const complaints = queryAll(db, 'complaints');
      res.status(201).json(complaints[complaints.length - 1]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/complaints/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { status, feedback } = req.body;
      db.run(`UPDATE complaints SET status = ?, feedback = ? WHERE id = ?`, [status, feedback || '', id]);

      // 如果已解决，更新候选人状态
      if (status === 'resolved') {
        const result = db.exec(`SELECT candidate_name FROM complaints WHERE id = ?`, [id]);
        if (result.length && result[0].values.length) {
          const candidateName = result[0].values[0][0];
          db.run(`UPDATE candidates SET status = '已复核' WHERE name = ?`, [candidateName]);
        }
      }

      saveDatabase(db);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ====== Feedbacks API ======

  app.get('/api/feedbacks', (_req, res) => {
    try {
      res.json(queryAll(db, 'feedbacks'));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/feedbacks', (req, res) => {
    try {
      const id = String(Date.now());
      const { rating, suggestion, candidateName } = req.body;
      db.run(
        `INSERT INTO feedbacks (id, candidate_name, rating, suggestion, timestamp) VALUES (?, ?, ?, ?, datetime('now'))`,
        [id, candidateName || '匿名', rating || 0, suggestion || '']
      );
      saveDatabase(db);
      const feedbacks = queryAll(db, 'feedbacks');
      res.status(201).json(feedbacks[feedbacks.length - 1]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ====== AI Config API ======

  app.get('/api/ai-config', (_req, res) => {
    try {
      const result = db.exec(`SELECT config_json FROM ai_config WHERE id = 1`);
      if (result.length && result[0].values.length) {
        const config = JSON.parse(result[0].values[0][0] as string);
        return res.json(config);
      }
      res.json({});
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/ai-config', (req, res) => {
    try {
      const configJson = JSON.stringify(req.body);
      db.run(`INSERT OR REPLACE INTO ai_config (id, config_json) VALUES (1, ?)`, [configJson]);
      saveDatabase(db);
      res.json(req.body);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ====== 健康检查 ======

  app.get('/api/health', (_req, res) => {
    const candidateCount = db.exec(`SELECT COUNT(*) as cnt FROM candidates`)[0]?.values[0]?.[0] || 0;
    const complaintCount = db.exec(`SELECT COUNT(*) as cnt FROM complaints`)[0]?.values[0]?.[0] || 0;
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      database: path.basename(DB_PATH),
      dbSize: fs.existsSync(DB_PATH) ? `${(fs.statSync(DB_PATH).size / 1024).toFixed(1)} KB` : '0 KB',
      records: { candidates: candidateCount, complaints: complaintCount }
    });
  });

  // ====== 定时自动保存 ======
  setInterval(() => saveDatabase(db), 30000); // 每30秒自动保存

  app.listen(PORT as number, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════════╗
║  透明岗途 — 云端数据库服务器 v2.0         ║
║  端口: ${PORT}                                ║
║  数据库: ${DB_PATH}
║  CORS: 已启用 (CloudBase + localhost)       ║
║  API: http://0.0.0.0:${PORT}/api/             ║
╚════════════════════════════════════════════╝
    `);
  });
}

startServer().catch(err => {
  console.error('服务器启动失败:', err);
  process.exit(1);
});
