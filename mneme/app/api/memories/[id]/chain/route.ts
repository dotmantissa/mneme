import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';

interface ChainNode {
  id: string;
  type: string;
  summary: string;
  content: string;
  storageHash: string | null;
  txHash: string | null;
  children: ChainNode[];
}

async function buildTree(memoryId: string): Promise<ChainNode> {
  const memory = await prisma.memory.findUnique({
    where: { id: memoryId },
    select: {
      id: true,
      type: true,
      summary: true,
      content: true,
      storageHash: true,
      txHash: true,
    },
  });

  if (!memory) throw new Error('Memory not found');

  const children = await prisma.memory.findMany({
    where: { parentId: memoryId },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  const childTrees = await Promise.all(children.map((c) => buildTree(c.id)));

  return {
    id: memory.id,
    type: memory.type,
    summary: memory.summary,
    content: memory.content,
    storageHash: memory.storageHash,
    txHash: memory.txHash,
    children: childTrees,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const start = await prisma.memory.findUnique({
      where: { id: params.id },
      select: { id: true, parentId: true },
    });

    if (!start) return errorResponse('Memory not found', 404);

    let rootId = start.id;
    let parentId = start.parentId;

    while (parentId) {
      const parent = await prisma.memory.findUnique({
        where: { id: parentId },
        select: { id: true, parentId: true },
      });
      if (!parent) break;
      rootId = parent.id;
      parentId = parent.parentId;
    }

    const root = await buildTree(rootId);
    return successResponse({ root });
  } catch (err) {
    console.error('[GET /api/memories/[id]/chain]', err);
    return errorResponse('Internal server error', 500);
  }
}
