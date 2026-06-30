'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Project, ProjectFile } from '@/lib/types';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false });

function getExtension(file: ProjectFile) {
  if (file.type === 'html') return [html()];
  if (file.type === 'css') return [css()];
  if (file.type === 'js') return [javascript()];
  return [];
}

function fileIconColor(type: ProjectFile['type']): string {
  switch (type) {
    case 'html': return '#e44d26';
    case 'css':  return '#264de4';
    case 'js':   return '#d4a017';
    default:     return '#9ca3af';
  }
}

function fileIconClass(type: ProjectFile['type']): string {
  switch (type) {
    case 'html': return 'bi-filetype-html';
    case 'css':  return 'bi-filetype-css';
    case 'js':   return 'bi-filetype-js';
    case 'json': return 'bi-filetype-json';
    default:     return 'bi-file-text';
  }
}

export default function ServeFilePage() {
  const params = useParams();
  const id = params.id as string;
  const filename = decodeURIComponent(params.filename as string);

  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/serve/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((proj: Project) => setProject(proj))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">This site could not be found.</p>
      </div>
    );
  }

  if (!project) return null;

  const file = project.files.find((f) => f.name === filename) ?? null;

  if (!file) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">File &ldquo;{filename}&rdquo; not found in this project.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <div className="flex items-center gap-0 overflow-x-auto border-b border-border bg-surface" style={{ minHeight: 38 }}>
        <Link
          href={`/serve/${id}`}
          className="flex shrink-0 items-center gap-2 border-r border-border px-4 py-2 text-[13px] text-muted transition-colors hover:bg-white/60 hover:text-foreground"
        >
          <i className="bi bi-play-fill text-green-500" aria-hidden="true" />
          Preview
        </Link>

        {project.files.map((f) => (
          <Link
            key={f.id}
            href={`/serve/${id}/${encodeURIComponent(f.name)}`}
            className={`flex shrink-0 items-center gap-2 border-r border-border px-4 py-2 text-[13px] transition-colors ${
              f.name === filename
                ? 'bg-white font-medium text-foreground'
                : 'text-muted hover:bg-white/60 hover:text-foreground'
            }`}
          >
            <i
              className={`bi ${fileIconClass(f.type)} text-xs`}
              style={{ color: fileIconColor(f.type) }}
              aria-hidden="true"
            />
            <span className="font-mono">{f.name}</span>
          </Link>
        ))}

        <div className="ml-auto flex items-center pr-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground"
          >
            <i className="bi bi-lightning-charge-fill text-accent" aria-hidden="true" />
            Built with Spark
          </Link>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <CodeMirror
          value={file.content}
          height="100%"
          extensions={getExtension(file)}
          readOnly
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
          }}
          style={{ height: '100%', fontSize: 13 }}
        />
      </div>
    </div>
  );
}
