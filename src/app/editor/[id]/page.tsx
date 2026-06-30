'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/client';
import { EditorWorkspace } from '@/components/editor/EditorWorkspace';
import type { Project } from '@/lib/types';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);

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
        .catch(() => router.replace('/dashboard'));
    });
  }, [params.id, router]);

  if (!project) return null;

  return <EditorWorkspace initialProject={project} />;
}
