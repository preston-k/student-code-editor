'use client';

interface CodeEditorProps {
  value: string;
  fileName: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ value, fileName, onChange }: CodeEditorProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-sm text-muted">
        <i className="bi bi-code-slash" aria-hidden="true" />
        {fileName}
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        className="min-h-0 flex-1 resize-none bg-white p-4 font-mono text-sm leading-6 outline-none"
      />
    </div>
  );
}
