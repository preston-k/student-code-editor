import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';

const handlers = auth.handler();

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (handlers as any).GET(request, context);
  } catch (error) {
    console.error('[neon-auth] GET error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (handlers as any).POST(request, context);
  } catch (error) {
    console.error('[neon-auth] POST error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
