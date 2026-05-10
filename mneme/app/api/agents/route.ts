import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { CreateAgentSchema } from '@/lib/validation';
import { successResponse, errorResponse } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateAgentSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400);
    }
    const agent = await prisma.agent.create({
      data: { name: parsed.data.name },
    });
    return successResponse(agent, 201);
  } catch (err) {
    console.error('[POST /api/agents]', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { memories: true } } },
    });
    return successResponse(agents);
  } catch (err) {
    console.error('[GET /api/agents]', err);
    return errorResponse('Internal server error', 500);
  }
}
