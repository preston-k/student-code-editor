'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false });

interface CodeEditorProps {
  fileName: string;
  value: string;
  onChange: (value: string) => void;
}

function getLanguage(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'html' || ext === 'htm') return html();
  if (ext === 'css') return css();
  if (ext === 'js') return javascript();
  return null;
}

export function CodeEditor({ fileName, value, onChange }: CodeEditorProps) {
  const extensions = useMemo(() => {
    const lang = getLanguage(fileName);
    return lang ? [lang] : [];
  }, [fileName]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-sm text-muted">
        <i className="bi bi-code-slash" aria-hidden="true" />
        {fileName}
      </div>
      <div className="min-h-0 flex-1 overflow-auto text-sm">
        <CodeMirror
          value={value}
          height="100%"
          extensions={extensions}
          onChange={onChange}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            autocompletion: false,
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
          }}
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
}
