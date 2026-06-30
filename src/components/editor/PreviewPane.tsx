'use client';

interface PreviewPaneProps {
  html: string;
}

export function PreviewPane({ html }: PreviewPaneProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-sm text-muted">
        <i className="bi bi-eye" aria-hidden="true" />
        Preview
      </div>
      <iframe
        srcDoc={html}
        title="Preview"
        className="min-h-0 flex-1 bg-white"
        sandbox="allow-scripts"
      />
    </div>
  );
}
