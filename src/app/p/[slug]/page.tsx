import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProjectBySlug } from '@/lib/storage';
import { buildPreviewDocument } from '@/lib/preview';

type PublishedPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublishedPage({ params }: PublishedPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const html = buildPreviewDocument(project);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm text-muted shadow-sm transition-colors hover:text-foreground"
        >
          <i className="bi bi-lightning-charge-fill text-accent" aria-hidden="true" />
          Built with Spark
        </Link>
      </div>
      <iframe
        srcDoc={html}
        title={project.name}
        className="h-screen w-full border-0"
        sandbox="allow-scripts allow-same-origin"
      />
    </>
  );
}
