import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { generateEmbedding } from '@/lib/embeddings';
import { successResponse, errorResponse } from '@/lib/api';
import { validateApiKey } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await validateApiKey(req);
    if (!auth.valid) {
      return errorResponse(auth.error ?? 'Unauthorized', 401);
    }
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const agentId = searchParams.get('agentId');
    const topK = Math.min(parseInt(searchParams.get('limit') ?? '5', 10), 20);

    if (!query) return errorResponse('q is required', 400);
    if (!agentId) return errorResponse('agentId is required', 400);

    const embedding = await generateEmbedding(query);
    const embeddingString = `[${embedding.join(',')}]`;

    const results = await prisma.$queryRaw<Array<{
      id: string;
      agentId: string;
      type: string;
      content: string;
      summary: string;
      parentId: string | null;
      storageHash: string | null;
      txHash: string | null;
      signature: string | null;
      createdAt: Date;
      score: number;
    }>>`
      SELECT
        id,
        "agentId",
        type::text,
        content,
        summary,
        "parentId",
        "storageHash",
        "txHash",
        signature,
        "createdAt",
        1 - (embedding <=> ${embeddingString}::vector) AS score
      FROM "Memory"
      WHERE "agentId" = ${agentId}
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${embeddingString}::vector
      LIMIT ${topK}
    `;

    return successResponse({ results, query });
  } catch (err) {
    console.error('[GET /api/search]', err);
    return errorResponse('Internal server error', 500);
  }
}
