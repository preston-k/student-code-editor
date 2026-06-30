import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.NEON_DATABASE_URL!);

export async function initSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id          UUID PRIMARY KEY,
      name        TEXT NOT NULL,
      slug        TEXT NOT NULL UNIQUE,
      owner       TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      published   BOOLEAN NOT NULL DEFAULT FALSE,
      created_at  TIMESTAMPTZ NOT NULL,
      updated_at  TIMESTAMPTZ NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS project_files (
      id         UUID PRIMARY KEY,
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name       TEXT NOT NULL,
      type       TEXT NOT NULL,
      content    TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      UNIQUE (project_id, name)
    )
  `;
}
