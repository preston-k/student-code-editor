import { NextResponse } from 'next/server';
import { requireUserId } from '@/lib/session';
import { addFile, getProjectById } from '@/lib/storage';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const owner = await requireUserId();
    const { id } = await context.params;
    const body = await request.json();

    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    const project = await addFile(id, owner, {
      name: body.name,
      type: body.type,
      content: body.content,
    });

    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
  }
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const owner = await requireUserId();
    const { id } = await context.params;
    const project = await getProjectById(id);

    if (!project || project.owner !== owner) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(project.files);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
