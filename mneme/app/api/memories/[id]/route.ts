import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memory = await prisma.memory.findUnique({
      where: { id: params.id },
      include: {
        parent: { select: { id: true, summary: true, type: true } },
        children: { select: { id: true, summary: true, type: true, createdAt: true } },
      },
    });
    if (!memory) return errorResponse('Memory not found', 404);
    return successResponse(memory);
  } catch (err) {
    console.error('[GET /api/memories/[id]]', err);
    return errorResponse('Internal server error', 500);
  }
}
