'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/lib/types';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { CreateProjectModal } from '@/components/dashboard/CreateProjectModal';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

interface DashboardClientProps {
  studentName: string;
}

export function DashboardClient({ studentName }: DashboardClientProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadProjects = useCallback(async () => {
    const response = await fetch('/api/projects');
    if (response.status === 401) {
      router.push('/');
      return;
    }
    const data = (await response.json()) as Project[];
    setProjects(data);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this project?')) return;

    const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (response.ok) {
      setProjects((current) => current.filter((project) => project.id !== id));
    }
  }

  async function handleSignOut() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
    router.refresh();
  }

  return (
    <div className="min-h-full bg-white">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <p className="font-medium">Spark</p>
              <p className="text-sm text-muted">Welcome, {studentName}</p>
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
          <p className="mt-1 text-muted">Build, preview, and publish HTML sites.</p>
        </div>

        {loading ? (
          <p className="text-muted">Loading projects...</p>
        ) : projects.length === 0 ? (
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
          onCreated={loadProjects}
        />
      ) : null}
    </div>
  );
}
