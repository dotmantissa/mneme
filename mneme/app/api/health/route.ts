import { NextResponse } from 'next/server';
import { validateEnv } from '@/lib/env';
import { prisma } from '@/lib/db';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

export async function GET() {
  try {
    validateEnv();
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (err: unknown) {
    return NextResponse.json({ status: 'error', error: getErrorMessage(err) }, { status: 500 });
  }
}
