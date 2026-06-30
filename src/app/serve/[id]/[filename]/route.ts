import { NextResponse } from 'next/server';
import { getProjectById } from '@/lib/storage';

function contentType(type: string): string {
  switch (type) {
    case 'html': return 'text/html; charset=utf-8';
    case 'css':  return 'text/css; charset=utf-8';
    case 'js':   return 'application/javascript; charset=utf-8';
    case 'json': return 'application/json; charset=utf-8';
    default:     return 'text/plain; charset=utf-8';
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; filename: string }> },
) {
  const { id, filename } = await context.params;
  const project = await getProjectById(id);

  if (!project || !project.published) {
    return new NextResponse('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
  }

  const file = project.files.find((f) => f.name === decodeURIComponent(filename)) ?? null;
  if (!file) {
    return new NextResponse('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
  }

  return new NextResponse(file.content, {
    status: 200,
    headers: { 'Content-Type': contentType(file.type) },
  });
}
