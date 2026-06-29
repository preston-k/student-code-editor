'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Project, ProjectFile } from '@/lib/types';
import { FileTree } from '@/components/editor/FileTree';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { PreviewPane } from '@/components/editor/PreviewPane';
import { NewFileModal } from '@/components/editor/NewFileModal';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

interface EditorWorkspaceProps {
  initialProject: Project;
}

export function EditorWorkspace({ initialProject }: EditorWorkspaceProps) {
  const [project, setProject] = useState(initialProject);
  const [activeFileId, setActiveFileId] = useState<string | null>(
    initialProject.files[0]?.id ?? null,
  );
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialProject.files.map((file) => [file.id, file.content])),
  );
  const [previewKey, setPreviewKey] = useState(0);
  const [showNewFile, setShowNewFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

  const activeFile = useMemo(
    () => project.files.find((file) => file.id === activeFileId) ?? null,
    [project.files, activeFileId],
  );

  const activeContent = activeFile ? drafts[activeFile.id] ?? activeFile.content : '';

  const markDirty = useCallback((fileId: string, content: string) => {
    setDrafts((current) => ({ ...current, [fileId]: content }));
    setSaved(false);
  }, []);

  async function saveCurrentFile() {
    if (!activeFile) return;

    setSaving(true);
    const response = await fetch(`/api/projects/${project.id}/files/${activeFile.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: drafts[activeFile.id] ?? activeFile.content }),
    });

    if (response.ok) {
      const updated = (await response.json()) as Project;
      setProject(updated);
      setSaved(true);
      setPreviewKey((key) => key + 1);
    }

    setSaving(false);
  }

  async function handleCreateFile(name: string) {
    const response = await fetch(`/api/projects/${project.id}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) return;

    const updated = (await response.json()) as Project;
    const created = updated.files.find(
      (file) => !project.files.some((existing) => existing.id === file.id),
    );

    setProject(updated);
    if (created) {
      setDrafts((current) => ({ ...current, [created.id]: created.content }));
      setActiveFileId(created.id);
    }
  }

  async function handleDeleteFile(fileId: string) {
    const response = await fetch(`/api/projects/${project.id}/files/${fileId}`, {
      method: 'DELETE',
    });

    if (!response.ok) return;

    const updated = (await response.json()) as Project;
    setProject(updated);

    if (activeFileId === fileId) {
      setActiveFileId(updated.files[0]?.id ?? null);
    }

    setDrafts((current) => {
      const next = { ...current };
      delete next[fileId];
      return next;
    });
    setPreviewKey((key) => key + 1);
  }

  async function togglePublish() {
    const response = await fetch(`/api/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !project.published }),
    });

    if (response.ok) {
      const updated = (await response.json()) as Project;
      setProject(updated);
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        saveCurrentFile();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted hover:text-foreground">
            <Logo size="sm" />
            <span className="font-medium text-foreground">{project.name}</span>
          </Link>
          <span className="text-sm text-muted">
            {saved ? 'Saved' : 'Unsaved changes'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setShowPreview((value) => !value)}
            className="hidden sm:inline-flex"
          >
            <i className={`bi ${showPreview ? 'bi-layout-split' : 'bi-layout-sidebar'}`} aria-hidden="true" />
            {showPreview ? 'Hide preview' : 'Show preview'}
          </Button>
          <Button variant="secondary" onClick={saveCurrentFile} disabled={saving || !activeFile}>
            <i className="bi bi-floppy" aria-hidden="true" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="secondary" onClick={togglePublish}>
            <i className={`bi ${project.published ? 'bi-globe' : 'bi-globe2'}`} aria-hidden="true" />
            {project.published ? 'Published' : 'Publish'}
          </Button>
          {project.published ? (
            <Link
              href={`/p/${project.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/90"
            >
              <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
              View live
            </Link>
          ) : null}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[220px_1fr]">
        <FileTree
          files={project.files}
          activeFileId={activeFileId}
          onSelect={setActiveFileId}
          onCreate={() => setShowNewFile(true)}
          onDelete={handleDeleteFile}
        />

        <div className={`grid min-h-0 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          {activeFile ? (
            <CodeEditor
              fileName={activeFile.name}
              value={activeContent}
              onChange={(value) => markDirty(activeFile.id, value)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              Select or create a file to start coding
            </div>
          )}

          {showPreview ? <PreviewPane projectId={project.id} refreshKey={previewKey} /> : null}
        </div>
      </div>

      {showNewFile ? (
        <NewFileModal onClose={() => setShowNewFile(false)} onCreate={handleCreateFile} />
      ) : null}
    </div>
  );
}
