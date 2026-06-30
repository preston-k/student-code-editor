'use client';

import type { ProjectFile } from '@/lib/types';

interface FileTreeProps {
  files: ProjectFile[];
  activeFileId: string | null;
  onSelect: (fileId: string) => void;
  onCreate: () => void;
  onDelete: (fileId: string) => void;
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

function fileIconColor(type: ProjectFile['type']): string {
  switch (type) {
    case 'html': return '#e44d26';
    case 'css':  return '#264de4';
    case 'js':   return '#d4a017';
    case 'json': return '#89a';
    default:     return '#9ca3af';
  }
}

export function FileTree({ files, activeFileId, onSelect, onCreate, onDelete }: FileTreeProps) {
  return (
    <div className="flex h-full flex-col border-r border-border" style={{ background: '#f3f3f3' }}>
      <div className="group/header flex items-center justify-between px-3 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted select-none">
          Explorer
        </span>
        <button
          type="button"
          onClick={onCreate}
          className="rounded p-0.5 text-muted opacity-0 transition-opacity group-hover/header:opacity-100 hover:bg-black/10 hover:text-foreground"
          title="New file"
        >
          <i className="bi bi-plus text-base leading-none" aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.id}
            className="group/row flex items-center"
            style={{
              background: activeFileId === file.id ? '#d6d6d6' : undefined,
            }}
          >
            <button
              type="button"
              onClick={() => onSelect(file.id)}
              className="flex min-w-0 flex-1 items-center gap-2 py-[5px] pl-4 pr-2 text-left hover:bg-black/5"
              style={{ background: activeFileId === file.id ? 'transparent' : undefined }}
            >
              <i
                className={`bi ${fileIconClass(file.type)} shrink-0 text-[13px]`}
                style={{ color: fileIconColor(file.type) }}
                aria-hidden="true"
              />
              <span
                className="truncate font-mono text-[13px] leading-tight"
                style={{ color: activeFileId === file.id ? '#111' : '#3a3a3a' }}
              >
                {file.name}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(file.id)}
              className="mr-1 rounded p-0.5 text-muted opacity-0 transition-opacity group-hover/row:opacity-100 hover:bg-red-100 hover:text-red-600"
              title="Delete file"
            >
              <i className="bi bi-x text-sm leading-none" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
