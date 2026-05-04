import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import db from "./lib/db";
import { Engine } from "./lib/Engine";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const engine = Engine.getInstance();

  // --- API Routes (DETERMINISTIC & REAL) ---

  app.get("/api/health", (req, res) => {
    res.json({ status: "online", engine: "Aegis Core v5.0", database: "SQLite Connected" });
  });

  // Source Management (Now persistent)
  app.get("/api/sources", (req, res) => {
      const sources = db.prepare("SELECT * FROM memory WHERE key LIKE 'source_%'").all();
      res.json(sources.map((s: any) => JSON.parse(s.value)));
  });

  app.post("/api/sources", (req, res) => {
    const id = Math.random().toString(36).substr(2, 9);
    const source = { id, ...req.body, status: 'ready' };
    db.prepare("INSERT INTO memory (key, value) VALUES (?, ?)").run(`source_${id}`, JSON.stringify(source));
    res.json(source);
  });

  // Intelligence Job Execution
  app.post("/api/intelligence/run", async (req, res) => {
    const { prompt, agents } = req.body;
    
    if (!prompt || !agents || agents.length === 0) {
      return res.status(400).json({ error: "Invalid mission parameters." });
    }

    try {
      const jobId = await engine.createJob(prompt, agents);
      res.json({ jobId, status: 'initiated' });
    } catch (err) {
      res.status(500).json({ error: "Failed to initiate engine", details: String(err) });
    }
  });

  // Polling Job Status
  app.get("/api/intelligence/job/:id", (req, res) => {
    const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(req.params.id) as any;
    if (!job) return res.status(404).json({ error: "Job not found" });

    const events = db.prepare("SELECT * FROM events WHERE job_id = ? ORDER BY created_at ASC").all(req.params.id) as any[];
    
    res.json({
      ...job,
      events: events.map(e => ({
        ...e,
        payload: JSON.parse(e.payload || '{}'),
        response: JSON.parse(e.response || 'null')
      }))
    });
  });

  // Global Logs
  app.get("/api/intelligence/logs", (req, res) => {
    const logs = db.prepare("SELECT * FROM events ORDER BY created_at DESC LIMIT 50").all();
    res.json(logs.map((l: any) => ({
        ...l,
        payload: JSON.parse(l.payload || '{}'),
        response: JSON.parse(l.response || 'null')
    })));
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production path correction: process.cwd() is project root
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\x1b[35m[AEGIS ENGINE]\x1b[0m Orchestrator active at http://localhost:${PORT}`);
  });
}

startServer();
