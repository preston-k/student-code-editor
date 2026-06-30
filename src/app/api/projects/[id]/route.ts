import { NextResponse } from 'next/server';
import { requireUserId } from '@/lib/session';
import {
  deleteProject,
  getProjectById,
  updateProject,
} from '@/lib/storage';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const owner = await requireUserId();
    const { id } = await context.params;
    const project = await getProjectById(id);

    if (!project || project.owner !== owner) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const owner = await requireUserId();
    const { id } = await context.params;
    const body = await request.json();

    const project = await updateProject(id, owner, {
      name: body.name,
      description: body.description,
      published: body.published,
    });

    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const owner = await requireUserId();
    const { id } = await context.params;
    const deleted = await deleteProject(id, owner);

    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
