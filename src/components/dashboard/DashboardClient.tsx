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
  const [loading, setLoading] = useState(true);

  async function fetchProjects() {
    const res = await fetch('/api/projects');
    if (res.ok) setProjects(await res.json());
    setLoading(false);
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

  const liveCount = projects.filter((p) => p.published).length;

  return (
    <div className="relative min-h-screen bg-canvas">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #e7e5e4 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <header className="sticky top-0 z-20 border-b border-border/60 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div className="leading-tight">
              <p className="font-semibold tracking-tight text-accent">Spark</p>
              {displayName ? (
                <p className="max-w-[200px] truncate text-xs text-muted">{displayName}</p>
              ) : null}
            </div>
          </div>
          <Button variant="ghost" onClick={handleSignOut} className="text-sm">
            Sign out
          </Button>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 py-10 sm:py-12">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your projects</h1>
            <p className="mt-2 text-muted">
              {loading
                ? 'Loading…'
                : projects.length === 0
                ? 'Build and publish HTML sites from your browser'
                : `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}${liveCount > 0 ? ` · ${liveCount} live` : ''}`}
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="shrink-0 self-start sm:self-auto">
            <i className="bi bi-plus-lg" aria-hidden="true" />
            New project
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl border border-border/60 bg-white/60"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-border bg-white/80 px-8 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-light">
              <i className="bi bi-code-slash text-2xl text-accent" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold">No projects yet</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
              Create your first site and start building with HTML, CSS, and JavaScript.
            </p>
            <Button onClick={() => setShowCreate(true)} className="mt-6">
              <i className="bi bi-plus-lg" aria-hidden="true" />
              Create your first project
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
