import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type {
  CreateFileInput,
  CreateProjectInput,
  Project,
  ProjectFile,
  UpdateFileInput,
} from './types';
import { uniqueSlug } from './slug';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function projectPath(id: string) {
  return path.join(PROJECTS_DIR, `${id}.json`);
}

function defaultFiles(): ProjectFile[] {
  const now = new Date().toISOString();
  return [
    {
      id: randomUUID(),
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
  <main>
    <h1>Hello, World!</h1>
    <p>Start building your site here.</p>
  </main>
  <script src="script.js"></script>
</body>
</html>`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      name: 'style.css',
      type: 'css',
      content: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, sans-serif;
  line-height: 1.6;
  padding: 2rem;
  background: #fafafa;
  color: #171717;
}

main {
  max-width: 640px;
  margin: 0 auto;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      name: 'script.js',
      type: 'js',
      content: `console.log('Welcome to Spark!');`,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function inferFileType(name: string): ProjectFile['type'] {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'html' || ext === 'htm') return 'html';
  if (ext === 'css') return 'css';
  if (ext === 'js') return 'js';
  if (ext === 'json') return 'json';
  return 'txt';
}

async function readProject(id: string): Promise<Project | null> {
  try {
    const raw = await fs.readFile(projectPath(id), 'utf-8');
    return JSON.parse(raw) as Project;
  } catch {
    return null;
  }
}

async function writeProject(project: Project) {
  await ensureDir(PROJECTS_DIR);
  await fs.writeFile(projectPath(project.id), JSON.stringify(project, null, 2));
}

async function getAllProjects(): Promise<Project[]> {
  await ensureDir(PROJECTS_DIR);
  const files = await fs.readdir(PROJECTS_DIR);
  const projects: Project[] = [];

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const raw = await fs.readFile(path.join(PROJECTS_DIR, file), 'utf-8');
    projects.push(JSON.parse(raw) as Project);
  }

  return projects.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function listProjectsByOwner(owner: string): Promise<Project[]> {
  const all = await getAllProjects();
  return all.filter((p) => p.owner === owner);
}

export async function getProjectById(id: string): Promise<Project | null> {
  return readProject(id);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const all = await getAllProjects();
  return all.find((p) => p.slug === slug && p.published) ?? null;
}

export async function createProject(
  owner: string,
  input: CreateProjectInput,
): Promise<Project> {
  const all = await getAllProjects();
  const now = new Date().toISOString();
  const slug = uniqueSlug(
    input.name,
    all.map((p) => p.slug),
  );

  const project: Project = {
    id: randomUUID(),
    name: input.name.trim(),
    slug,
    owner,
    description: input.description?.trim() ?? '',
    published: false,
    files: defaultFiles(),
    createdAt: now,
    updatedAt: now,
  };

  await writeProject(project);
  return project;
}

export async function updateProject(
  id: string,
  owner: string,
  updates: Partial<Pick<Project, 'name' | 'description' | 'published'>>,
): Promise<Project | null> {
  const project = await readProject(id);
  if (!project || project.owner !== owner) return null;

  if (updates.name !== undefined) {
    project.name = updates.name.trim();
  }
  if (updates.description !== undefined) {
    project.description = updates.description.trim();
  }
  if (updates.published !== undefined) {
    project.published = updates.published;
  }

  project.updatedAt = new Date().toISOString();
  await writeProject(project);
  return project;
}

export async function deleteProject(id: string, owner: string): Promise<boolean> {
  const project = await readProject(id);
  if (!project || project.owner !== owner) return false;

  await fs.unlink(projectPath(id));
  return true;
}

export async function addFile(
  projectId: string,
  owner: string,
  input: CreateFileInput,
): Promise<Project | null> {
  const project = await readProject(projectId);
  if (!project || project.owner !== owner) return null;

  const name = input.name.trim();
  if (project.files.some((f) => f.name === name)) {
    throw new Error('A file with this name already exists');
  }

  const now = new Date().toISOString();
  const file: ProjectFile = {
    id: randomUUID(),
    name,
    type: input.type ?? inferFileType(name),
    content: input.content ?? '',
    createdAt: now,
    updatedAt: now,
  };

  project.files.push(file);
  project.updatedAt = now;
  await writeProject(project);
  return project;
}

export async function updateFile(
  projectId: string,
  owner: string,
  fileId: string,
  input: UpdateFileInput,
): Promise<Project | null> {
  const project = await readProject(projectId);
  if (!project || project.owner !== owner) return null;

  const file = project.files.find((f) => f.id === fileId);
  if (!file) return null;

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
  project.updatedAt = file.updatedAt;
  await writeProject(project);
  return project;
}

export async function deleteFile(
  projectId: string,
  owner: string,
  fileId: string,
): Promise<Project | null> {
  const project = await readProject(projectId);
  if (!project || project.owner !== owner) return null;

  project.files = project.files.filter((f) => f.id !== fileId);
  project.updatedAt = new Date().toISOString();
  await writeProject(project);
  return project;
}
