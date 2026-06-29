export type FileType = 'html' | 'css' | 'js' | 'txt' | 'json';

export interface ProjectFile {
  id: string;
  name: string;
  type: FileType;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  owner: string;
  description: string;
  published: boolean;
  files: ProjectFile[];
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  name: string;
  createdAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface CreateFileInput {
  name: string;
  type: FileType;
  content?: string;
}

export interface UpdateFileInput {
  name?: string;
  content?: string;
}
