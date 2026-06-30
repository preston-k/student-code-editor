'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/lib/types';
import { authClient } from '@/lib/auth/client';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { CreateProjectModal } from '@/components/dashboard/CreateProjectModal';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

export function DashboardClient() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  async function fetchProjects() {
    const res = await fetch('/api/projects');
    if (res.ok) setProjects(await res.json());
  }

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (!data?.session) {
        router.replace('/auth/sign-in');
        return;
      }
      setDisplayName(data.user?.name || data.user?.email || '');
      fetchProjects();
    });
  }, [router]);

  async function handleCreate(name: string, description?: string) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      const project: Project = await res.json();
      router.push(`/editor/${project.id}`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project?')) return;
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) setProjects((current) => current.filter((p) => p.id !== id));
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.push('/auth/sign-in');
  }

  return (
    <div className="min-h-full bg-white">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <p className="font-semibold text-accent">Spark</p>
              {displayName ? <p className="text-sm text-muted">{displayName}</p> : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowCreate(true)}>
              <i className="bi bi-plus-lg" aria-hidden="true" />
              New project
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Your projects</h1>
          <p className="mt-1 text-muted">Your HTML projects</p>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <i className="bi bi-folder2-open mb-4 text-3xl text-muted" aria-hidden="true" />
            <p className="mb-4 text-muted">No projects yet. Create your first site.</p>
            <Button onClick={() => setShowCreate(true)}>
              <i className="bi bi-plus-lg" aria-hidden="true" />
              Create project
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      {showCreate ? (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreate}
        />
      ) : null}
    </div>
  );
}
