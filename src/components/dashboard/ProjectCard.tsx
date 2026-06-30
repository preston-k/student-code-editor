'use client';

import Link from 'next/link';
import type { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Saved just now';
  if (mins < 60) return `Saved ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Saved ${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Saved ${days}d ago`;
  return `Saved ${new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <div className="group rounded-xl border border-border bg-white p-5 transition-colors hover:border-accent/30">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-medium">{project.name}</h3>
          {project.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted">{project.description}</p>
          ) : (
            <p className="mt-1 text-sm text-muted">{project.files.length} files</p>
          )}
          <p className="mt-1 text-xs text-muted/70">{timeAgo(project.updatedAt)}</p>
        </div>
        {project.published ? (
          <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
            Live
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/editor/${project.id}`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          <i className="bi bi-pencil-square" aria-hidden="true" />
          Edit
        </Link>
        {project.published ? (
          <Link
            href={`/p/${project.id}`}
            target="_blank"
            className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => onDelete(project.id)}
          className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <i className="bi bi-trash" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
