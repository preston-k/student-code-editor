import { NextResponse } from 'next/server';
import { getProjectById } from '@/lib/storage';
import { buildPreviewDocument } from '@/lib/preview';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const project = await getProjectById(id);

  if (!project || !project.published) {
    return new NextResponse('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
  }

  return new NextResponse(buildPreviewDocument(project), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
