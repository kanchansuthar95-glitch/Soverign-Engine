import db from "./db";
import { BaseAgent } from "./Agent";
import { AgentConfig } from "./schemas";
import { v4 as uuidv4 } from "uuid";

interface Event {
  id: string;
  jobId: string;
  type: string;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  agentConfig?: AgentConfig;
}

export class Engine {
  private static instance: Engine;
  private isProcessing = false;

  private constructor() {}

  public static getInstance(): Engine {
    if (!Engine.instance) {
      Engine.instance = new Engine();
    }
    return Engine.instance;
  }

  async createJob(prompt: string, agents: AgentConfig[]) {
    const jobId = uuidv4();
    db.prepare("INSERT INTO jobs (id, prompt, status) VALUES (?, ?, 'pending')").run(jobId, prompt);
    
    // Initial Event
    this.addEvent(jobId, 'PLAN_INIT', { prompt }, agents[0]);
    
    // Chain remaining agents if needed, but the event engine should handle transitions
    // For now, let's queue all selected agents as separate events for the job
    for (let i = 1; i < agents.length; i++) {
        this.addEvent(jobId, 'AGENT_TASK', { prompt }, agents[i]);
    }

    this.processQueue();
    return jobId;
  }

  private addEvent(jobId: string, type: string, payload: any, agentConfig?: AgentConfig) {
    const eventId = uuidv4();
    db.prepare("INSERT INTO events (id, job_id, type, payload, agent_id, status) VALUES (?, ?, ?, ?, ?, 'pending')")
      .run(eventId, jobId, type, JSON.stringify(payload), agentConfig?.id || null);
    
    if (agentConfig) {
        // Store agent config if it doesn't exist
        db.prepare("INSERT OR IGNORE INTO agents (id, name, role, system_prompt, hierarchy, color) VALUES (?, ?, ?, ?, ?, ?)")
          .run(agentConfig.id, agentConfig.name, agentConfig.role, agentConfig.systemPrompt, agentConfig.hierarchy, agentConfig.color);
    }
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (true) {
        const nextEvent = db.prepare(`
          SELECT * FROM events 
          WHERE status = 'pending' 
          ORDER BY created_at ASC 
          LIMIT 1
        `).get() as any;

        if (!nextEvent) break;

        // Update status to processing
        db.prepare("UPDATE events SET status = 'processing' WHERE id = ?").run(nextEvent.id);
        db.prepare("UPDATE jobs SET status = 'processing' WHERE id = ?").run(nextEvent.job_id);

        try {
          const agentData = db.prepare("SELECT * FROM agents WHERE id = ?").get(nextEvent.agent_id) as any;
          const jobData = db.prepare("SELECT * FROM jobs WHERE id = ?").get(nextEvent.job_id) as any;
          
          if (agentData) {
            const agent = new BaseAgent({
              id: agentData.id,
              name: agentData.name,
              role: agentData.role,
              systemPrompt: agentData.system_prompt,
              hierarchy: agentData.hierarchy,
              color: agentData.color
            });

            // Context: previous events for this job
            const previousEvents = db.prepare("SELECT response, agent_id FROM events WHERE job_id = ? AND status = 'completed' AND response IS NOT NULL").all(nextEvent.job_id) as any[];
            const context = previousEvents.map(e => {
              const res = JSON.parse(e.response);
              const agent = db.prepare("SELECT name FROM agents WHERE id = ?").get(e.agent_id) as any;
              return `[${agent?.name || 'Previous Agent'}]: ${res.reasoning}\nFindings: ${JSON.stringify(res.data)}`;
            }).join("\n\n");

            const response = await agent.execute(jobData.prompt, context);

            db.prepare("UPDATE events SET status = 'completed', response = ? WHERE id = ?")
              .run(JSON.stringify(response), nextEvent.id);
          } else {
             // System tasks (like PLAN_INIT if no agent)
             db.prepare("UPDATE events SET status = 'completed' WHERE id = ?").run(nextEvent.id);
          }

        } catch (err) {
          console.error("Event processing error:", err);
          db.prepare("UPDATE events SET status = 'failed' WHERE id = ?").run(nextEvent.id);
          
          // Log failure to memory for future agents
          db.prepare("INSERT INTO failures (failure_type, cause, input) VALUES (?, ?, ?)")
            .run('EVENT_PROCESS_FAIL', String(err), nextEvent.payload);
        }
      }

      // Check if all events for a job are done
      // This is a simplified check
      db.prepare(`
        UPDATE jobs 
        SET status = 'completed' 
        WHERE id NOT IN (SELECT job_id FROM events WHERE status != 'completed')
        AND status = 'processing'
      `).run();

    } finally {
      this.isProcessing = false;
    }
  }
}
