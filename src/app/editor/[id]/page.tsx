'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStudentName } from '@/lib/client-storage';
import { EditorWorkspace } from '@/components/editor/EditorWorkspace';
import type { Project } from '@/lib/types';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const studentName = getStudentName();
    if (!studentName) {
      router.replace('/');
      return;
    }

    const id = params.id as string;
    fetch(`/api/projects/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data: Project) => {
        if (data.owner !== studentName) {
          router.replace('/dashboard');
          return;
        }
        setProject(data);
      })
      .catch(() => router.replace('/dashboard'));
  }, [params.id, router]);

  if (!project) return null;

  return <EditorWorkspace initialProject={project} />;
}
