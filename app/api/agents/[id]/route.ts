import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await prisma.agent.findUnique({ where: { id: params.id } });
    if (!agent) return errorResponse('Agent not found', 404);
    await prisma.agent.delete({ where: { id: params.id } });
    return successResponse({ deleted: params.id });
  } catch (err) {
    console.error('[DELETE /api/agents/[id]]', err);
    return errorResponse('Internal server error', 500);
  }
}
