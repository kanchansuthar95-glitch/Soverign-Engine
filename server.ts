import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// In-memory Lab State (Phase 2: Memory Layer)
const LabState = {
  sources: [
    { id: "1", name: 'Main Backend Repository', type: 'github', status: 'ready', items: 1240, size: '42MB', content: "// Placeholder for ingested code" },
  ],
  findings: [],
  jobs: [],
  auditLogs: [
    { id: "1", timestamp: new Date().toISOString(), type: "system", msg: "Aegis OS initialized." }
  ]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes (Phase 2 & 3) ---

  app.get("/api/health", (req, res) => {
    res.json({ status: "online", system: "Aegis OS", version: "1.1.0-beta" });
  });

  // Source Management
  app.get("/api/sources", (req, res) => res.json(LabState.sources));
  app.post("/api/sources", (req, res) => {
    const newSource = {
      id: Math.random().toString(36).substr(2, 9),
      status: 'ready',
      createdAt: new Date().toISOString(),
      ...req.body
    };
    LabState.sources.push(newSource);
    LabState.auditLogs.unshift({ id: Date.now().toString(), timestamp: new Date().toISOString(), type: "info", msg: `New source ingested: ${newSource.name}` });
    res.json(newSource);
  });

  // Audit Logs
  app.get("/api/audit", (req, res) => res.json(LabState.auditLogs));

  // --- Intelligence Core (Phase 3 & 4: Multi-Agent Debate) ---
  app.post("/api/intelligence/debate", async (req, res) => {
    const { prompt, agents } = req.body;
    
    const activeAgents = (agents || []).sort((a: any, b: any) => {
      const order = { 'Sentinel': 0, 'Specialist': 1, 'Director': 2 };
      return order[a.hierarchy] - order[b.hierarchy];
    });

    if (activeAgents.length === 0) {
      activeAgents.push({ roleId: 'orchestrator', name: 'Aegis Core', systemPrompt: 'Security Lead', color: '#6366F1' });
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      let sessionHistory = `MISSION GOAL: ${prompt}\n\n`;
      const responses: any[] = [];

      // Sequentially process each agent to simulate a debate loop with hierarchy awareness
      for (const agent of activeAgents) {
        const isDirector = agent.hierarchy === 'Director';
        const isSentinel = agent.hierarchy === 'Sentinel';
        
        let instructions = "";
        if (isDirector) {
          instructions = "As a Director, your job is to analyze the contributions below and provide a master synthesis. Identify the most critical path forward.";
        } else if (isSentinel) {
          instructions = "As a Sentinel, your job is to find flaws in the mission goal or any anticipated technical approaches. Be a brutal skeptic.";
        } else {
          instructions = "As a Specialist, provide deep technical analysis on this specific problem space.";
        }

        const agentPrompt = `
[INTELLIGENCE LAYER: AEGIS-OS v4.0]
[CONTEXT STATUS: ACTIVE DEBATE]

IDENTITY BIOMETRICS:
- NAME: ${agent.name}
- CLASS: ${agent.hierarchy}
- NEURAL_MODELS: [GPT-4o, Gemini-1.5, DeepSeek-V3]
- CORE_LOGIC: ${agent.systemPrompt}

OPERATIONAL PARAMETERS:
${instructions}

DEBATE LEDGER (SHARED CONTEXT):
${sessionHistory}

PRIMARY MISSION:
"${prompt}"

REASONING PROTOCOL:
1. INTERNAL_MONOLOGUE: Engage in multi-step Chain-of-Thought reasoning.
2. KNOWLEDGE_RETRIEVAL: Simulate cross-analysis with global cybersecurity databases (CVE, NVD, MITRE ATT&CK, OWASP).
3. CONTRADICTION_CHECK: Evaluate previous agent claims for technical accuracy.
4. SYNTHESIS: Provide deep, creative, and technical output. 

OUTPUT REQUIREMENTS:
- Use technical nomenclature (e.g., "Non-recursive mutex lock," "Entropy depletion," "Heap-grooming").
- Provide structured reasoning.
- If specialized, go deep into the technical implementation.
- Be extremely detailed and prioritize security/bug bounty perspectives.
        `;
        
        const result = await model.generateContent(agentPrompt);
        const text = result.response.text();
        
        responses.push({ 
          role: agent.roleId, 
          name: agent.name, 
          content: text,
          color: agent.color,
          hierarchy: agent.hierarchy
        });
        
        sessionHistory += `[${agent.name} (${agent.hierarchy})]: ${text}\n\n`;
      }

      const analysisJob = {
        id: `debate_${Date.now()}`,
        responses,
        timestamp: new Date().toISOString()
      };

      LabState.findings.push(analysisJob);
      res.json(analysisJob);

    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Intelligence Engine failure", details: error.message });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\x1b[36m[Aegis OS]\x1b[0m Core functional at http://localhost:${PORT}`);
  });
}

startServer();
