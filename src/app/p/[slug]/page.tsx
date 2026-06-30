'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Project } from '@/lib/types';
import { buildPreviewDocument } from '@/lib/preview';

export default function PublishedPage() {
  const params = useParams();
  const [html, setHtml] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const slug = params.slug as string;
    fetch(`/api/p/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((project: Project) => setHtml(buildPreviewDocument(project)))
      .catch(() => setNotFound(true));
  }, [params.slug]);

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">This site could not be found.</p>
      </div>
    );
  }

  if (!html) return null;

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
        title="Published site"
        className="h-screen w-full border-0"
        sandbox="allow-scripts"
      />
    </>
  );
}
