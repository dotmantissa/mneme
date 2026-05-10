import { z } from 'zod';

export const CreateMemorySchema = z.object({
  agentId: z.string().min(1),
  type: z.enum(['episodic', 'semantic', 'procedural', 'outcome']),
  content: z.string().min(1).max(10000),
  summary: z.string().min(1).max(500),
  parentId: z.string().optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

export const CreateAgentSchema = z.object({
  name: z.string().min(1).max(100),
});

export type CreateMemoryInput = z.infer<typeof CreateMemorySchema>;
export type CreateAgentInput = z.infer<typeof CreateAgentSchema>;
