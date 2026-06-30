'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/client';
import { EditorWorkspace } from '@/components/editor/EditorWorkspace';
import { Logo } from '@/components/ui/Logo';
import type { Project } from '@/lib/types';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const id = params.id as string;

    authClient.getSession().then(({ data }) => {
      if (!data?.session) {
        router.replace('/auth/sign-in');
        return;
      }

      fetch(`/api/projects/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Not found');
          return res.json();
        })
        .then((proj: Project) => setProject(proj))
        .catch(() => {
          setError(true);
          router.replace('/dashboard');
        });
    });
  }, [params.id, router]);

  if (error) return null;

  if (!project) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white text-muted">
        <Logo size="lg" />
        <p className="text-sm">Loading project…</p>
      </div>
    );
  }

  return <EditorWorkspace initialProject={project} />;
}
