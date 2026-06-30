import type {
  CreateFileInput,
  CreateProjectInput,
  Project,
  ProjectFile,
  UpdateFileInput,
} from './types';
import { uniqueSlug } from './slug';

const STUDENT_KEY = 'spark_student';
const PROJECTS_KEY = 'spark_projects';

// ── Auth ─────────────────────────────────────────────────────────────────────

export function getStudentName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STUDENT_KEY);
}

export function signIn(name: string): void {
  localStorage.setItem(STUDENT_KEY, name.trim().slice(0, 40));
}

export function signOut(): void {
  localStorage.removeItem(STUDENT_KEY);
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function readAll(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? (JSON.parse(raw) as Project[]) : [];
  } catch {
    return [];
  }
}

function writeAll(projects: Project[]): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

function inferFileType(name: string): ProjectFile['type'] {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'html' || ext === 'htm') return 'html';
  if (ext === 'css') return 'css';
  if (ext === 'js') return 'js';
  if (ext === 'json') return 'json';
  return 'txt';
}

function defaultFiles(): ProjectFile[] {
  const now = new Date().toISOString();
  return [
    {
      id: crypto.randomUUID(),
      name: 'index.html',
      type: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Site</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <script src="script.js"></script>
</body>
</html>`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: 'style.css',
      type: 'css',
      content: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: 'script.js',
      type: 'js',
      content: '',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

// ── Projects ─────────────────────────────────────────────────────────────────

export function listProjectsByOwner(owner: string): Project[] {
  return readAll()
    .filter((p) => p.owner === owner)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getProjectById(id: string): Project | null {
  return readAll().find((p) => p.id === id) ?? null;
}

export function getProjectBySlug(slug: string): Project | null {
  return readAll().find((p) => p.slug === slug && p.published) ?? null;
}

export function createProject(owner: string, input: CreateProjectInput): Project {
  const all = readAll();
  const now = new Date().toISOString();
  const slug = uniqueSlug(input.name, all.map((p) => p.slug));

  const project: Project = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    slug,
    owner,
    description: input.description?.trim() ?? '',
    published: false,
    files: defaultFiles(),
    createdAt: now,
    updatedAt: now,
  };

  writeAll([...all, project]);
  return project;
}

export function updateProject(
  id: string,
  owner: string,
  updates: Partial<Pick<Project, 'name' | 'description' | 'published'>>,
): Project | null {
  const all = readAll();
  const index = all.findIndex((p) => p.id === id && p.owner === owner);
  if (index === -1) return null;

  const project = { ...all[index] };
  if (updates.name !== undefined) project.name = updates.name.trim();
  if (updates.description !== undefined) project.description = updates.description.trim();
  if (updates.published !== undefined) project.published = updates.published;
  project.updatedAt = new Date().toISOString();

  all[index] = project;
  writeAll(all);
  return project;
}

export function deleteProject(id: string, owner: string): boolean {
  const all = readAll();
  const next = all.filter((p) => !(p.id === id && p.owner === owner));
  if (next.length === all.length) return false;
  writeAll(next);
  return true;
}

// ── Files ────────────────────────────────────────────────────────────────────

export function addFile(
  projectId: string,
  owner: string,
  input: CreateFileInput,
): Project | null {
  const all = readAll();
  const index = all.findIndex((p) => p.id === projectId && p.owner === owner);
  if (index === -1) return null;

  const project = { ...all[index], files: [...all[index].files] };
  const name = input.name.trim();

  if (project.files.some((f) => f.name === name)) {
    throw new Error('A file with this name already exists');
  }

  const now = new Date().toISOString();
  const file: ProjectFile = {
    id: crypto.randomUUID(),
    name,
    type: input.type ?? inferFileType(name),
    content: input.content ?? '',
    createdAt: now,
    updatedAt: now,
  };

  project.files = [...project.files, file];
  project.updatedAt = now;
  all[index] = project;
  writeAll(all);
  return project;
}

export function updateFile(
  projectId: string,
  owner: string,
  fileId: string,
  input: UpdateFileInput,
): Project | null {
  const all = readAll();
  const index = all.findIndex((p) => p.id === projectId && p.owner === owner);
  if (index === -1) return null;

  const project = { ...all[index], files: [...all[index].files] };
  const fileIndex = project.files.findIndex((f) => f.id === fileId);
  if (fileIndex === -1) return null;

  const file = { ...project.files[fileIndex] };

  if (input.name !== undefined) {
    const newName = input.name.trim();
    if (project.files.some((f) => f.id !== fileId && f.name === newName)) {
      throw new Error('A file with this name already exists');
    }
    file.name = newName;
    file.type = inferFileType(newName);
  }

  if (input.content !== undefined) {
    file.content = input.content;
  }

  file.updatedAt = new Date().toISOString();
  project.files[fileIndex] = file;
  project.updatedAt = file.updatedAt;
  all[index] = project;
  writeAll(all);
  return project;
}

export function deleteFile(
  projectId: string,
  owner: string,
  fileId: string,
): Project | null {
  const all = readAll();
  const index = all.findIndex((p) => p.id === projectId && p.owner === owner);
  if (index === -1) return null;

  const project = { ...all[index] };
  project.files = project.files.filter((f) => f.id !== fileId);
  project.updatedAt = new Date().toISOString();
  all[index] = project;
  writeAll(all);
  return project;
}
