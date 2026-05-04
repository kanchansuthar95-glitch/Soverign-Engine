import { z } from 'zod';

export const AgentResponseSchema = z.object({
  status: z.enum(['success', 'fail']),
  data: z.record(z.any()),
  reasoning: z.string(),
  next_event: z.string().optional(),
  confidence: z.number().min(0).max(1)
});

export type AgentResponse = z.infer<typeof AgentResponseSchema>;

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  hierarchy: string;
  color: string;
}
