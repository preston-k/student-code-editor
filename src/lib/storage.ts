import { randomUUID } from 'crypto';
import type {
  CreateFileInput,
  CreateProjectInput,
  Project,
  ProjectFile,
  UpdateFileInput,
} from './types';
import { uniqueSlug } from './slug';
import { sql, initSchema } from './db';

let schemaReady: Promise<void> | null = null;

function ensureSchema() {
  if (!schemaReady) schemaReady = initSchema();
  return schemaReady;
}

type DbProject = {
  id: string;
  name: string;
  slug: string;
  user_id: string;
  description: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

type DbFile = {
  id: string;
  project_id: string;
  name: string;
  type: string;
  content: string;
  created_at: string;
  updated_at: string;
};

function toProjectFile(row: DbFile): ProjectFile {
  return {
    id: row.id,
    name: row.name,
    type: row.type as ProjectFile['type'],
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function assembleProject(row: DbProject): Promise<Project> {
  const files = (await sql`
    SELECT * FROM project_files WHERE project_id = ${row.id} ORDER BY created_at
  `) as DbFile[];

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    owner: row.user_id,
    description: row.description,
    published: row.published,
    files: files.map(toProjectFile),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function inferFileType(name: string): ProjectFile['type'] {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'html' || ext === 'htm') return 'html';
  if (ext === 'css') return 'css';
  if (ext === 'js') return 'js';
  if (ext === 'json') return 'json';
  return 'txt';
}

function defaultFiles(): Array<{ name: string; type: ProjectFile['type']; content: string }> {
  return [
    {
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
    },
    { name: 'style.css', type: 'css', content: '' },
    { name: 'script.js', type: 'js', content: '' },
  ];
}

export async function listProjectsByOwner(user_id: string): Promise<Project[]> {
  await ensureSchema();
  const rows = (await sql`
    SELECT * FROM projects WHERE user_id = ${user_id} ORDER BY updated_at DESC
  `) as DbProject[];

  return Promise.all(rows.map(assembleProject));
}

export async function getProjectById(id: string): Promise<Project | null> {
  await ensureSchema();
  const rows = (await sql`SELECT * FROM projects WHERE id = ${id}`) as DbProject[];
  if (!rows[0]) return null;
  return assembleProject(rows[0]);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  await ensureSchema();
  const rows = (await sql`
    SELECT * FROM projects WHERE slug = ${slug} AND published = TRUE
  `) as DbProject[];
  if (!rows[0]) return null;
  return assembleProject(rows[0]);
}

export async function createProject(user_id: string, input: CreateProjectInput): Promise<Project> {
  await ensureSchema();
  const allSlugs = (await sql`SELECT slug FROM projects`) as { slug: string }[];
  const slug = uniqueSlug(input.name, allSlugs.map((r) => r.slug));
  const now = new Date().toISOString();
  const id = randomUUID();

  await sql`
    INSERT INTO projects (id, name, slug, user_id, description, published, created_at, updated_at)
    VALUES (${id}, ${input.name.trim()}, ${slug}, ${user_id}, ${input.description?.trim() ?? ''}, FALSE, ${now}, ${now})
  `;

  const files = defaultFiles();
  for (const file of files) {
    const fileId = randomUUID();
    await sql`
      INSERT INTO project_files (id, project_id, name, type, content, created_at, updated_at)
      VALUES (${fileId}, ${id}, ${file.name}, ${file.type}, ${file.content}, ${now}, ${now})
    `;
  }

  return (await getProjectById(id))!;
}

export async function updateProject(
  id: string,
  user_id: string,
  updates: Partial<Pick<Project, 'name' | 'description' | 'published'>>,
): Promise<Project | null> {
  await ensureSchema();
  const rows = (await sql`SELECT * FROM projects WHERE id = ${id} AND user_id = ${user_id}`) as DbProject[];
  if (!rows[0]) return null;

  const now = new Date().toISOString();
  const current = rows[0];
  const name = updates.name !== undefined ? updates.name.trim() : current.name;
  const description = updates.description !== undefined ? updates.description.trim() : current.description;
  const published = updates.published !== undefined ? updates.published : current.published;

  await sql`
    UPDATE projects SET name = ${name}, description = ${description}, published = ${published}, updated_at = ${now}
    WHERE id = ${id}
  `;

  return getProjectById(id);
}

export async function deleteProject(id: string, user_id: string): Promise<boolean> {
  await ensureSchema();
  const result = await sql`DELETE FROM projects WHERE id = ${id} AND user_id = ${user_id} RETURNING id`;
  return (result as { id: string }[]).length > 0;
}

export async function addFile(
  projectId: string,
  user_id: string,
  input: CreateFileInput,
): Promise<Project | null> {
  await ensureSchema();
  const rows = (await sql`SELECT * FROM projects WHERE id = ${projectId} AND user_id = ${user_id}`) as DbProject[];
  if (!rows[0]) return null;

  const name = input.name.trim();
  const type = input.type ?? inferFileType(name);
  const now = new Date().toISOString();
  const fileId = randomUUID();

  try {
    await sql`
      INSERT INTO project_files (id, project_id, name, type, content, created_at, updated_at)
      VALUES (${fileId}, ${projectId}, ${name}, ${type}, ${input.content ?? ''}, ${now}, ${now})
    `;
  } catch (err) {
    if (err instanceof Error && err.message.includes('unique')) {
      throw new Error('A file with this name already exists');
    }
    throw err;
  }

  await sql`UPDATE projects SET updated_at = ${now} WHERE id = ${projectId}`;
  return getProjectById(projectId);
}

export async function updateFile(
  projectId: string,
  user_id: string,
  fileId: string,
  input: UpdateFileInput,
): Promise<Project | null> {
  await ensureSchema();
  const rows = (await sql`SELECT * FROM projects WHERE id = ${projectId} AND user_id = ${user_id}`) as DbProject[];
  if (!rows[0]) return null;

  const fileRows = (await sql`SELECT * FROM project_files WHERE id = ${fileId} AND project_id = ${projectId}`) as DbFile[];
  if (!fileRows[0]) return null;

  const now = new Date().toISOString();
  const current = fileRows[0];
  const name = input.name !== undefined ? input.name.trim() : current.name;
  const type = input.name !== undefined ? inferFileType(name) : current.type;
  const content = input.content !== undefined ? input.content : current.content;

  try {
    await sql`
      UPDATE project_files SET name = ${name}, type = ${type}, content = ${content}, updated_at = ${now}
      WHERE id = ${fileId}
    `;
  } catch (err) {
    if (err instanceof Error && err.message.includes('unique')) {
      throw new Error('A file with this name already exists');
    }
    throw err;
  }

  await sql`UPDATE projects SET updated_at = ${now} WHERE id = ${projectId}`;
  return getProjectById(projectId);
}

export async function deleteFile(
  projectId: string,
  user_id: string,
  fileId: string,
): Promise<Project | null> {
  await ensureSchema();
  const rows = (await sql`SELECT * FROM projects WHERE id = ${projectId} AND user_id = ${user_id}`) as DbProject[];
  if (!rows[0]) return null;

  await sql`DELETE FROM project_files WHERE id = ${fileId} AND project_id = ${projectId}`;
  const now = new Date().toISOString();
  await sql`UPDATE projects SET updated_at = ${now} WHERE id = ${projectId}`;
  return getProjectById(projectId);
}
