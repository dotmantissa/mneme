import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function validateApiKey(req: NextRequest): Promise<{
  valid: boolean;
  agentId?: string;
  error?: string;
}> {
  const apiKey = req.headers.get('x-agent-key');
  if (!apiKey) {
    return { valid: false, error: 'Missing X-Agent-Key header' };
  }
  const agent = await prisma.agent.findUnique({
    where: { apiKey },
    select: { id: true },
  });
  if (!agent) {
    return { valid: false, error: 'Invalid API key' };
  }
  return { valid: true, agentId: agent.id };
}
