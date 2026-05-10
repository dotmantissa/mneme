import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { CreateMemorySchema } from '@/lib/validation';
import { successResponse, errorResponse } from '@/lib/api';
import { generateEmbedding } from '@/lib/embeddings';
import { uploadMemoryBlob } from '@/lib/0g';
import { attestMemory } from '@/lib/signing';
import { validateApiKey } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await validateApiKey(req);
    if (!auth.valid) {
      return errorResponse(auth.error ?? 'Unauthorized', 401);
    }
    const body = await req.json();
    const parsed = CreateMemorySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400);
    }

    const { agentId, type, content, summary, parentId, metadata } = parsed.data;

    const agentExists = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agentExists) {
      return errorResponse('Agent not found', 404);
    }

    if (parentId) {
      const parentExists = await prisma.memory.findUnique({ where: { id: parentId } });
      if (!parentExists) {
        return errorResponse('Parent memory not found', 404);
      }
    }

    const embeddingVector = await generateEmbedding(`${summary}\n\n${content}`);
    const embeddingString = `[${embeddingVector.join(',')}]`;

    let storageHash: string | null = null;
    try {
      const uploadResult = await uploadMemoryBlob(content);
      storageHash = uploadResult.rootHash;
    } catch (uploadErr) {
      console.warn('[POST /api/memories] 0G upload skipped:', uploadErr);
    }

    const memory = await prisma.$queryRaw<{ id: string }[]>`
      INSERT INTO "Memory" (id, "agentId", type, content, summary, embedding, "parentId", metadata, "storageHash", "txHash", signature, "createdAt")
      VALUES (
        gen_random_uuid()::text,
        ${agentId},
        ${type}::"MemoryType",
        ${content},
        ${summary},
        ${embeddingString}::vector,
        ${parentId ?? null},
        ${metadata ? JSON.stringify(metadata) : null}::jsonb,
        ${storageHash},
        null,
        null,
        now()
      )
      RETURNING id
    `;

    const createdMemory = await prisma.memory.findUnique({
      where: { id: memory[0].id },
    });

    if (createdMemory) {
      attestMemory(createdMemory.id).catch((err) =>
        console.warn('[POST /api/memories] Attestation skipped:', err)
      );
    }

    return successResponse(createdMemory, 201);
  } catch (err) {
    console.error('[POST /api/memories]', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
    const cursor = searchParams.get('cursor');

    if (!agentId) return errorResponse('agentId is required', 400);

    const memories = await prisma.memory.findMany({
      where: {
        agentId,
        ...(type && ['episodic','semantic','procedural','outcome'].includes(type) ? { type: type as 'episodic' | 'semantic' | 'procedural' | 'outcome' } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const nextCursor = memories.length === limit ? memories[memories.length - 1].id : null;

    return successResponse({ memories, nextCursor });
  } catch (err) {
    console.error('[GET /api/memories]', err);
    return errorResponse('Internal server error', 500);
  }
}
