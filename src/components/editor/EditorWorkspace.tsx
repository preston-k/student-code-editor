'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { Project } from '@/lib/types';
import {
  getStudentName,
  updateFile,
  addFile,
  deleteFile,
  updateProject,
} from '@/lib/client-storage';
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
  const [showPreview, setShowPreview] = useState(true);

  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const projectRef = useRef(project);
  const draftsRef = useRef(drafts);

  useEffect(() => { projectRef.current = project; }, [project]);
  useEffect(() => { draftsRef.current = drafts; }, [drafts]);

  const owner = getStudentName() ?? '';

  const activeFile = useMemo(
    () => project.files.find((file) => file.id === activeFileId) ?? null,
    [project.files, activeFileId],
  );

  const activeContent = activeFile ? drafts[activeFile.id] ?? activeFile.content : '';

  const saveFile = useCallback((fileId: string) => {
    const currentProject = projectRef.current;
    const file = currentProject.files.find((f) => f.id === fileId);
    if (!file) return;

    setSaveStatus('saving');
    const updated = updateFile(currentProject.id, owner, fileId, {
      content: draftsRef.current[fileId] ?? file.content,
    });

    if (updated) {
      setProject(updated);
      setSaveStatus('saved');
      setPreviewHtml(buildPreviewDocument({
        ...updated,
        files: updated.files.map((f) => ({
          ...f,
          content: draftsRef.current[f.id] ?? f.content,
        })),
      }));
    }
  }, [owner]);

  const markDirty = useCallback((fileId: string, content: string) => {
    setDrafts((current) => ({ ...current, [fileId]: content }));
    setSaveStatus('unsaved');

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

  function handleCreateFile(name: string) {
    try {
      const updated = addFile(project.id, owner, { name });
      if (!updated) return;

      const created = updated.files.find(
        (file) => !project.files.some((existing) => existing.id === file.id),
      );

      setProject(updated);
      if (created) {
        setDrafts((current) => ({ ...current, [created.id]: created.content }));
        setActiveFileId(created.id);
      }
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    }
  }

  function handleDeleteFile(fileId: string) {
    const updated = deleteFile(project.id, owner, fileId);
    if (!updated) return;

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

  function togglePublish() {
    const updated = updateProject(project.id, owner, { published: !project.published });
    if (updated) setProject(updated);
  }

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
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

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted hover:text-foreground">
            <Logo size="sm" />
            <span className="font-medium text-foreground">{project.name}</span>
          </Link>
          <span className="text-sm text-muted">
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : 'Unsaved'}
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

          {showPreview ? <PreviewPane html={previewHtml} /> : null}
        </div>
      </div>

      {showNewFile ? (
        <NewFileModal onClose={() => setShowNewFile(false)} onCreate={handleCreateFile} />
      ) : null}
    </div>
  );
}
