import { NextResponse } from 'next/server';
import { requireUserId } from '@/lib/session';
import { createProject, listProjectsByOwner } from '@/lib/storage';

export async function GET() {
  try {
    const owner = await requireUserId();
    const projects = await listProjectsByOwner(owner);
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const owner = await requireUserId();
    const body = await request.json();

    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const project = await createProject(owner, {
      name: body.name,
      description: body.description,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
