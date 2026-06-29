import { notFound, redirect } from 'next/navigation';
import { getStudentName } from '@/lib/session';
import { getProjectById } from '@/lib/storage';
import { EditorWorkspace } from '@/components/editor/EditorWorkspace';

type EditorPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditorPage({ params }: EditorPageProps) {
  const studentName = await getStudentName();

  if (!studentName) {
    redirect('/');
  }

  const { id } = await params;
  const project = await getProjectById(id);

  if (!project || project.owner !== studentName) {
    notFound();
  }

  return <EditorWorkspace initialProject={project} />;
}
