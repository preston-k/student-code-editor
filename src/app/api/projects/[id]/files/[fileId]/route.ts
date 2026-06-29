import { NextResponse } from 'next/server';
import { requireStudentName } from '@/lib/session';
import { deleteFile, updateFile } from '@/lib/storage';

type RouteContext = {
  params: Promise<{ id: string; fileId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const owner = await requireStudentName();
    const { id, fileId } = await context.params;
    const body = await request.json();

    const project = await updateFile(id, owner, fileId, {
      name: body.name,
      content: body.content,
    });

    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update file' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const owner = await requireStudentName();
    const { id, fileId } = await context.params;
    const project = await deleteFile(id, owner, fileId);

    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
