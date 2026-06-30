'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { Project } from '@/lib/types';
import { buildPreviewDocument } from '@/lib/preview';
import { FileTree } from '@/components/editor/FileTree';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { PreviewPane } from '@/components/editor/PreviewPane';
import { NewFileModal } from '@/components/editor/NewFileModal';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

const AUTOSAVE_DELAY = 1500;

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
  const [previewHtml, setPreviewHtml] = useState(() => buildPreviewDocument(initialProject));
  const [showNewFile, setShowNewFile] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [splitPercent, setSplitPercent] = useState(50);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const projectRef = useRef(project);
  const draftsRef = useRef(drafts);

  useEffect(() => { projectRef.current = project; }, [project]);
  useEffect(() => { draftsRef.current = drafts; }, [drafts]);

  const activeFile = useMemo(
    () => project.files.find((file) => file.id === activeFileId) ?? null,
    [project.files, activeFileId],
  );

  const activeContent = activeFile ? drafts[activeFile.id] ?? activeFile.content : '';

  const saveFile = useCallback(async (fileId: string) => {
    const currentProject = projectRef.current;
    const file = currentProject.files.find((f) => f.id === fileId);
    if (!file) return;

    setSaveStatus('saving');
    const res = await fetch(`/api/projects/${currentProject.id}/files/${fileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: draftsRef.current[fileId] ?? file.content }),
    });

    if (res.ok) {
      const updated: Project = await res.json();
      setProject(updated);
      setSaveStatus('saved');
      setSavedAt(new Date());
      setPreviewHtml(buildPreviewDocument({
        ...updated,
        files: updated.files.map((f) => ({
          ...f,
          content: draftsRef.current[f.id] ?? f.content,
        })),
      }));
    } else {
      setSaveStatus('unsaved');
    }
  }, []);

  const markDirty = useCallback((fileId: string, content: string) => {
    const newDrafts = { ...draftsRef.current, [fileId]: content };
    draftsRef.current = newDrafts;
    setDrafts(newDrafts);
    setSaveStatus('unsaved');

    // Live preview (300ms debounce — fast feedback, doesn't hammer the iframe)
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      setPreviewHtml(buildPreviewDocument({
        ...projectRef.current,
        files: projectRef.current.files.map((f) => ({
          ...f,
          content: newDrafts[f.id] ?? f.content,
        })),
      }));
    }, 300);

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => saveFile(fileId), AUTOSAVE_DELAY);
  }, [saveFile]);

  function saveCurrentFile() {
    if (!activeFile) return;
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
    }
    saveFile(activeFile.id);
  }

  async function handleCreateFile(name: string) {
    const res = await fetch(`/api/projects/${project.id}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.error) alert(data.error);
      return;
    }

    const updated: Project = await res.json();
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
    const res = await fetch(`/api/projects/${project.id}/files/${fileId}`, {
      method: 'DELETE',
    });
    if (!res.ok) return;

    const updated: Project = await res.json();
    setProject(updated);

    if (activeFileId === fileId) {
      setActiveFileId(updated.files[0]?.id ?? null);
    }

    setDrafts((current) => {
      const next = { ...current };
      delete next[fileId];
      return next;
    });
    setPreviewHtml(buildPreviewDocument(updated));
  }

  async function togglePublish() {
    const res = await fetch(`/api/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !project.published }),
    });
    if (res.ok) {
      setProject(await res.json());
    }
  }

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
  }, []);

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

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDragging.current || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.max(20, Math.min(80, pct)));
    }
    function onMouseUp() {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex cursor-pointer items-center gap-2 text-sm text-muted hover:text-foreground">
            <Logo size="sm" />
            <span className="font-medium text-foreground">{project.name}</span>
          </Link>
          <span className="text-sm text-muted">
            {saveStatus === 'saving'
              ? 'Saving…'
              : saveStatus === 'unsaved'
              ? 'Unsaved'
              : savedAt
              ? `Saved at ${savedAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
              : 'Saved'}
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
          <Button variant="secondary" onClick={saveCurrentFile} disabled={!activeFile || saveStatus === 'saving'}>
            <i className="bi bi-floppy" aria-hidden="true" />
            {saveStatus === 'saving' ? 'Saving…' : 'Save'}
          </Button>
          <Button variant="secondary" onClick={togglePublish}>
            <i className={`bi ${project.published ? 'bi-globe' : 'bi-globe2'}`} aria-hidden="true" />
            {project.published ? 'Published' : 'Publish'}
          </Button>
          {project.published ? (
            <Link
              href={`/p/${project.id}`}
              target="_blank"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/90"
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

        <div ref={splitContainerRef} className="flex min-h-0">
          {/* editor panel */}
          <div
            className="min-h-0 min-w-0 overflow-hidden"
            style={{ width: showPreview ? `${splitPercent}%` : '100%' }}
          >
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
          </div>

          {showPreview ? (
            <>
              {/* drag handle */}
              <div
                className="group relative z-10 flex w-1 flex-shrink-0 cursor-col-resize items-center justify-center bg-border hover:bg-accent/40 active:bg-accent/60 transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  isDragging.current = true;
                  document.body.style.cursor = 'col-resize';
                  document.body.style.userSelect = 'none';
                }}
              >
                <div className="absolute flex h-8 w-4 items-center justify-center rounded-sm">
                  <div className="flex gap-0.5">
                    <span className="h-3 w-px bg-muted/60 group-hover:bg-accent/80 transition-colors" />
                    <span className="h-3 w-px bg-muted/60 group-hover:bg-accent/80 transition-colors" />
                  </div>
                </div>
              </div>

              {/* preview panel */}
              <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                <PreviewPane html={previewHtml} />
              </div>
            </>
          ) : null}
        </div>
      </div>

      {showNewFile ? (
        <NewFileModal onClose={() => setShowNewFile(false)} onCreate={handleCreateFile} />
      ) : null}
    </div>
  );
}
