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
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const fileBadgeStyles: Record<string, string> = {
  html: 'bg-[#fff0eb] text-[#ea580c] border-[#fed7aa]',
  css: 'bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]',
  js: 'bg-[#fefce8] text-[#ca8a04] border-[#fef08a]',
  json: 'bg-surface text-muted border-border',
  txt: 'bg-surface text-muted border-border',
};

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const fileTypes = [...new Set(project.files.map((file) => file.type))];

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-lg hover:shadow-accent/5">
      <Link href={`/editor/${project.id}`} className="block cursor-pointer">
        <div className="border-b border-border/50 bg-[#fafaf9] px-4 pb-4 pt-3.5">
          <div className="mb-3 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
            <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
            <span className="h-2 w-2 rounded-full bg-[#28c840]" />
            <span className="ml-2 flex-1 truncate rounded-md bg-white/80 px-2 py-0.5 text-[10px] text-muted ring-1 ring-border/60">
              {project.name.toLowerCase().replace(/\s+/g, '-')}.html
            </span>
          </div>

          <div className="flex aspect-[5/3] flex-col items-center justify-center gap-3 rounded-xl border border-border/40 bg-gradient-to-br from-white via-accent-light/30 to-white">
            <div className="flex flex-wrap justify-center gap-1.5 px-4">
              {fileTypes.map((type) => (
                <span
                  key={type}
                  className={`rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide ${fileBadgeStyles[type] ?? fileBadgeStyles.txt}`}
                >
                  .{type === 'js' ? 'js' : type}
                </span>
              ))}
            </div>
            <span className="font-mono text-xs text-muted/60">&lt;/&gt;</span>
          </div>
        </div>

        <div className="p-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="truncate text-[15px] font-semibold leading-snug tracking-tight">
              {project.name}
            </h3>
            {project.published ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            ) : (
              <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-muted ring-1 ring-border">
                Draft
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-muted">
            {project.files.length} {project.files.length === 1 ? 'file' : 'files'}
            <span className="mx-1.5 text-border">·</span>
            {timeAgo(project.updatedAt)}
          </p>
        </div>
      </Link>

      <div className="mt-auto flex items-center gap-2 border-t border-border/50 px-4 py-3">
        <Link
          href={`/editor/${project.id}`}
          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          <i className="bi bi-pencil-square text-[13px]" aria-hidden="true" />
          Edit
        </Link>
        {project.published ? (
          <Link
            href={`/p/${project.id}`}
            target="_blank"
            title="View live site"
            className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-border bg-white px-3 py-2 text-muted transition-colors hover:border-accent/30 hover:bg-accent-light hover:text-accent"
          >
            <i className="bi bi-box-arrow-up-right text-sm" aria-hidden="true" />
          </Link>
        ) : null}
        <button
          type="button"
          title="Delete project"
          onClick={() => onDelete(project.id)}
          className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-border bg-white px-3 py-2 text-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <i className="bi bi-trash text-sm" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
