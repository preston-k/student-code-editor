'use client';

import type { ProjectFile } from '@/lib/types';
import { getFileIcon } from '@/lib/preview';

interface FileTreeProps {
  files: ProjectFile[];
  activeFileId: string | null;
  onSelect: (fileId: string) => void;
  onCreate: () => void;
  onDelete: (fileId: string) => void;
}

export function FileTree({
  files,
  activeFileId,
  onSelect,
  onCreate,
  onDelete,
}: FileTreeProps) {
  return (
    <div className="flex h-full flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">Files</span>
        <button
          type="button"
          onClick={onCreate}
          className="rounded-md p-1 text-muted transition-colors hover:bg-white hover:text-accent"
          title="New file"
        >
          <i className="bi bi-plus-lg" aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {files.map((file) => (
          <div
            key={file.id}
            className={`group mb-1 flex items-center rounded-lg ${
              activeFileId === file.id ? 'bg-white shadow-sm' : 'hover:bg-white/70'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(file.id)}
              className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm"
            >
              <i className={`bi ${getFileIcon(file.type)} text-muted`} aria-hidden="true" />
              <span className="truncate">{file.name}</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(file.id)}
              className="mr-2 rounded p-1 text-transparent transition-colors group-hover:text-muted hover:!text-red-600"
              title="Delete file"
            >
              <i className="bi bi-x" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
