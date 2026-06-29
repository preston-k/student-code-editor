'use client';

interface PreviewPaneProps {
  projectId: string;
  refreshKey: number;
}

export function PreviewPane({ projectId, refreshKey }: PreviewPaneProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-sm text-muted">
        <i className="bi bi-eye" aria-hidden="true" />
        Preview
      </div>
      <iframe
        key={refreshKey}
        src={`/api/preview/${projectId}`}
        title="Preview"
        className="min-h-0 flex-1 bg-white"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
