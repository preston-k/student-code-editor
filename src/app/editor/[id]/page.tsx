'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStudentName, getProjectById } from '@/lib/client-storage';
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
    const found = getProjectById(id);

    if (!found || found.owner !== studentName) {
      router.replace('/dashboard');
      return;
    }

    setProject(found);
  }, [params.id, router]);

  if (!project) return null;

  return <EditorWorkspace initialProject={project} />;
}
