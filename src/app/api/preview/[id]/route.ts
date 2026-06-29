import { NextResponse } from 'next/server';
import { getProjectById } from '@/lib/storage';
import { buildPreviewDocument } from '@/lib/preview';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const project = await getProjectById(id);

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const html = buildPreviewDocument(project);
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
