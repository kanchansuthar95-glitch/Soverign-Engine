import { GoogleGenerativeAI } from "@google/generative-ai";
import { AgentConfig, AgentResponse, AgentResponseSchema } from "./schemas";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export class BaseAgent {
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  async execute(input: string, context: string): Promise<AgentResponse> {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      generationConfig: { responseMimeType: "application/json" } 
    });

    const systemPrompt = `
      [IDENTITY: ${this.config.name}]
      [ROLE: ${this.config.role}]
      [HIERARCHY: ${this.config.hierarchy}]
      [CORE_PROMPT: ${this.config.systemPrompt}]

      INSTRUCTIONS:
      Produce a high-depth, technical analysis based on the MISSION and CONTEXT provided.
      You MUST return valid JSON matching the schema:
      {
        "status": "success | fail",
        "data": { ... },
        "reasoning": "multi-step explanation",
        "next_event": "STRICT_EVENT_NAME",
        "confidence": 0.0-1.0
      }

      DO NOT include markdown formatting in your response. Return ONLY raw JSON.
    `;

    const fullPrompt = `
      MISSION: ${input}
      CONTEXT: ${context}
    `;

    try {
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: fullPrompt }
      ]);

      const text = result.response.text();
      const parsed = JSON.parse(text);
      
      // Validate with Zod
      return AgentResponseSchema.parse(parsed);
    } catch (error) {
      console.error(`Agent ${this.config.name} execution failed:`, error);
      return {
        status: "fail",
        data: { error: String(error) },
        reasoning: "Internal execution failure or parsing error.",
        confidence: 0
      };
    }
  }
}
