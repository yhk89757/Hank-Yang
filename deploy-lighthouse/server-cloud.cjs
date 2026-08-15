var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server-cloud.ts
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_sql = __toESM(require("sql.js"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var PORT = process.env.PORT || 3e3;
var DB_PATH = import_path.default.join(process.cwd(), "lighthouse_data.db");
async function initDatabase() {
  const SQL = await (0, import_sql.default)();
  let db;
  if (import_fs.default.existsSync(DB_PATH)) {
    const fileBuffer = import_fs.default.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log(`[DB] \u5DF2\u52A0\u8F7D\u73B0\u6709\u6570\u636E\u5E93 (${(fileBuffer.length / 1024).toFixed(1)} KB)`);
  } else {
    db = new SQL.Database();
    console.log("[DB] \u521B\u5EFA\u65B0\u6570\u636E\u5E93");
  }
  db.run(`
    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      job TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      status TEXT DEFAULT '\u5F85\u8BC4\u4F30',
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
      type TEXT DEFAULT '\u89C4\u5219\u7591\u95EE',
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
  const count = db.exec("SELECT COUNT(*) as cnt FROM candidates");
  const cnt = count[0]?.values[0]?.[0] || 0;
  if (cnt === 0) {
    console.log("[DB] \u63D2\u5165\u521D\u59CB\u79CD\u5B50\u6570\u636E...");
    db.run(`INSERT INTO candidates (name, job, score, status, time) VALUES
      ('\u5F20\u4E09', '\u91D1\u878DAI\u4EA7\u54C1\u7ECF\u7406', 92, '\u5DF2\u901A\u8FC7', datetime('now')),
      ('\u674E\u56DB', 'AI\u539F\u751F\u4EA7\u54C1\u7ECF\u7406', 88, '\u590D\u6838\u4E2D', datetime('now')),
      ('\u738B\u4E94', '\u901A\u7528AIGC\u6A21\u578B\u4EA7\u54C1\u7ECF\u7406\uFF08\u591A\u6A21\u6001\u65B9\u5411\uFF09', 85, '\u5DF2\u901A\u8FC7', datetime('now')),
      ('\u8D75\u516D', '\u667A\u80FD\u652F\u4ED8-\u8D44\u91D1\u4EA7\u54C1\u7ECF\u7406', 79, '\u5F85\u9762\u8BD5', datetime('now'))
    `);
    db.run(`INSERT INTO complaints (id, candidate_name, type, content, status, timestamp) VALUES
      ('1', '\u674E\u56DB', '\u89C4\u5219\u7591\u95EE', '\u6211\u89C9\u5F97 AI \u5BF9\u6211\u7684\u9879\u76EE\u6210\u679C\u8BC4\u4F30\u504F\u4F4E\uFF0C\u5E0C\u671B\u80FD\u4EBA\u5DE5\u590D\u6838\u3002', 'pending', datetime('now'))
    `);
    db.run(`INSERT INTO feedbacks (id, candidate_name, rating, suggestion, timestamp) VALUES
      ('1', '\u5F20\u4E09', 5, '\u7CFB\u7EDF\u975E\u5E38\u900F\u660E\uFF0C\u8BC4\u4F30\u62A5\u544A\u5F88\u6709\u53C2\u8003\u4EF7\u503C\u3002', datetime('now')),
      ('2', '\u674E\u56DB', 4, '\u5E0C\u671B\u80FD\u589E\u52A0\u66F4\u591A\u5C97\u4F4D\u7684 AI \u8BC4\u4F30\u3002', datetime('now'))
    `);
    const defaultConfig = {
      modelName: "\u80DC\u4EFB\u529B\u5927\u6A21\u578B 3.0",
      languageStyle: "\u4E13\u4E1A\u3001\u5BA2\u89C2\u3001\u6FC0\u52B1\u6027",
      principles: ["\u516C\u6B63\u6027\u4F18\u5148", "\u9690\u79C1\u5373\u5B89\u5168", "\u591A\u7EF4\u5EA6\u5339\u914D", "\u89E3\u91CA\u6027\u8BC4\u4F30"],
      systemPrompt: "\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u8D44\u6DF1\u4EBA\u624D\u8BC4\u6D4B\u4E0E\u8F6C\u5C97\u8BC4\u4F30\u4E13\u5BB6...",
      weights: [
        { label: "\u6750\u6599\u5339\u914D\u5EA6", weight: 0.55, color: "#0052D9" },
        { label: "\u90E8\u95E8\u7EE9\u6548", weight: 0.15, color: "#2BA471" },
        { label: "\u8DE8\u754C\u6F5C\u529B", weight: 0.15, color: "#E37318" },
        { label: "\u7B14\u8BD5\u6210\u7EE9", weight: 0.15, color: "#D54941" }
      ]
    };
    db.run(`INSERT INTO ai_config (id, config_json) VALUES (1, ?)`, [JSON.stringify(defaultConfig)]);
  }
  saveDatabase(db);
  return db;
}
function saveDatabase(db) {
  const data = db.export();
  const buffer = Buffer.from(data);
  import_fs.default.writeFileSync(DB_PATH, buffer);
}
function queryAll(db, table) {
  const result = db.exec(`SELECT * FROM ${table}`);
  if (!result.length || !result[0].values.length) return [];
  const columns = result[0].columns;
  return result[0].values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}
async function startServer() {
  const db = await initDatabase();
  const app = (0, import_express.default)();
  app.use((0, import_cors.default)({
    origin: [
      "https://hank89757-d8glv2d4ufa70b0d9-1442530132.tcloudbaseapp.com",
      "http://localhost:5173",
      "http://localhost:3000"
    ],
    credentials: false
  }));
  app.use(import_express.default.json({ limit: "10mb" }));
  app.get("/api/candidates", (_req, res) => {
    try {
      const candidates = queryAll(db, "candidates");
      res.json(candidates);
    } catch (err) {
      console.error("[API] GET /api/candidates \u9519\u8BEF:", err.message);
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/candidates", (req, res) => {
    try {
      const { name, job, score, status, time } = req.body;
      db.run(
        `INSERT INTO candidates (name, job, score, status, time) VALUES (?, ?, ?, ?, ?)`,
        [name || "\u533F\u540D", job || "\u672A\u77E5\u5C97\u4F4D", score || 0, status || "\u5F85\u8BC4\u4F30", time || (/* @__PURE__ */ new Date()).toISOString()]
      );
      saveDatabase(db);
      const candidates = queryAll(db, "candidates");
      const created = candidates[candidates.length - 1];
      res.status(201).json(created);
    } catch (err) {
      console.error("[API] POST /api/candidates \u9519\u8BEF:", err.message);
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/candidates/status", (req, res) => {
    try {
      const { name, status } = req.body;
      db.run(`UPDATE candidates SET status = ? WHERE name = ?`, [status, name]);
      saveDatabase(db);
      const updated = db.exec(`SELECT * FROM candidates WHERE name = ?`, [name]);
      if (updated.length && updated[0].values.length) {
        const obj = {};
        updated[0].columns.forEach((col, i) => {
          obj[col] = updated[0].values[0][i];
        });
        return res.json(obj);
      }
      res.status(404).json({ error: "Candidate not found" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/candidates/:id", (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const fields = [];
      const values = [];
      if (updates.status !== void 0) {
        fields.push("status = ?");
        values.push(updates.status);
      }
      if (updates.interviewer_score !== void 0) {
        fields.push("interviewer_score = ?");
        values.push(updates.interviewer_score);
      }
      if (updates.interviewer_opinion !== void 0) {
        fields.push("interviewer_opinion = ?");
        values.push(updates.interviewer_opinion);
      }
      if (updates.interviewer_feedback !== void 0) {
        fields.push("interviewer_feedback = ?");
        values.push(updates.interviewer_feedback);
      }
      if (fields.length === 0) return res.status(400).json({ error: "\u6CA1\u6709\u8981\u66F4\u65B0\u7684\u5B57\u6BB5" });
      values.push(parseInt(id));
      db.run(`UPDATE candidates SET ${fields.join(", ")} WHERE id = ?`, values);
      saveDatabase(db);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/complaints", (_req, res) => {
    try {
      res.json(queryAll(db, "complaints"));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/complaints", (req, res) => {
    try {
      const id = String(Date.now());
      const { candidateName, type, content } = req.body;
      db.run(
        `INSERT INTO complaints (id, candidate_name, type, content, status, timestamp) VALUES (?, ?, ?, ?, 'pending', datetime('now'))`,
        [id, candidateName || "\u533F\u540D", type || "\u89C4\u5219\u7591\u95EE", content || ""]
      );
      if (candidateName) {
        db.run(`UPDATE candidates SET status = ? WHERE name = ?`, [
          type === "\u6295\u8BC9" ? "\u6295\u8BC9\u5904\u7406\u4E2D" : "\u7533\u8BC9\u5F85\u5904\u7406",
          candidateName
        ]);
      }
      saveDatabase(db);
      const complaints = queryAll(db, "complaints");
      res.status(201).json(complaints[complaints.length - 1]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/complaints/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { status, feedback } = req.body;
      db.run(`UPDATE complaints SET status = ?, feedback = ? WHERE id = ?`, [status, feedback || "", id]);
      if (status === "resolved") {
        const result = db.exec(`SELECT candidate_name FROM complaints WHERE id = ?`, [id]);
        if (result.length && result[0].values.length) {
          const candidateName = result[0].values[0][0];
          db.run(`UPDATE candidates SET status = '\u5DF2\u590D\u6838' WHERE name = ?`, [candidateName]);
        }
      }
      saveDatabase(db);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/feedbacks", (_req, res) => {
    try {
      res.json(queryAll(db, "feedbacks"));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/feedbacks", (req, res) => {
    try {
      const id = String(Date.now());
      const { rating, suggestion, candidateName } = req.body;
      db.run(
        `INSERT INTO feedbacks (id, candidate_name, rating, suggestion, timestamp) VALUES (?, ?, ?, ?, datetime('now'))`,
        [id, candidateName || "\u533F\u540D", rating || 0, suggestion || ""]
      );
      saveDatabase(db);
      const feedbacks = queryAll(db, "feedbacks");
      res.status(201).json(feedbacks[feedbacks.length - 1]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/ai-config", (_req, res) => {
    try {
      const result = db.exec(`SELECT config_json FROM ai_config WHERE id = 1`);
      if (result.length && result[0].values.length) {
        const config = JSON.parse(result[0].values[0][0]);
        return res.json(config);
      }
      res.json({});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/ai-config", (req, res) => {
    try {
      const configJson = JSON.stringify(req.body);
      db.run(`INSERT OR REPLACE INTO ai_config (id, config_json) VALUES (1, ?)`, [configJson]);
      saveDatabase(db);
      res.json(req.body);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/health", (_req, res) => {
    const candidateCount = db.exec(`SELECT COUNT(*) as cnt FROM candidates`)[0]?.values[0]?.[0] || 0;
    const complaintCount = db.exec(`SELECT COUNT(*) as cnt FROM complaints`)[0]?.values[0]?.[0] || 0;
    res.json({
      status: "ok",
      uptime: process.uptime(),
      database: import_path.default.basename(DB_PATH),
      dbSize: import_fs.default.existsSync(DB_PATH) ? `${(import_fs.default.statSync(DB_PATH).size / 1024).toFixed(1)} KB` : "0 KB",
      records: { candidates: candidateCount, complaints: complaintCount }
    });
  });
  setInterval(() => saveDatabase(db), 3e4);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551  \u900F\u660E\u5C97\u9014 \u2014 \u4E91\u7AEF\u6570\u636E\u5E93\u670D\u52A1\u5668 v2.0         \u2551
\u2551  \u7AEF\u53E3: ${PORT}                                \u2551
\u2551  \u6570\u636E\u5E93: ${DB_PATH}
\u2551  CORS: \u5DF2\u542F\u7528 (CloudBase + localhost)       \u2551
\u2551  API: http://0.0.0.0:${PORT}/api/             \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
    `);
  });
}
startServer().catch((err) => {
  console.error("\u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25:", err);
  process.exit(1);
});
//# sourceMappingURL=server-cloud.cjs.map
