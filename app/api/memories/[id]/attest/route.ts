import { NextRequest } from 'next/server';
import { attestMemory, verifyMemory } from '@/lib/signing';
import { successResponse, errorResponse } from '@/lib/api';
import { validateApiKey } from '@/lib/auth';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await validateApiKey(_req);
    if (!auth.valid) {
      return errorResponse(auth.error ?? 'Unauthorized', 401);
    }
    const result = await attestMemory(params.id);
    return successResponse(result, 200);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    console.error('[POST /api/memories/[id]/attest]', err);
    if (message.includes('not found')) return errorResponse(message, 404);
    return errorResponse('Attestation failed', 500);
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await validateApiKey(_req);
    if (!auth.valid) {
      return errorResponse(auth.error ?? 'Unauthorized', 401);
    }
    const result = await verifyMemory(params.id);
    return successResponse(result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    console.error('[GET /api/memories/[id]/attest]', err);
    if (message.includes('not found') || message.includes('no signature')) {
      return errorResponse(message, 404);
    }
    return errorResponse('Verification failed', 500);
  }
}
