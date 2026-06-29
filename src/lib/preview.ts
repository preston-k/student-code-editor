import type { Project, ProjectFile } from './types';

function findEntryFile(files: ProjectFile[]): ProjectFile | undefined {
  return (
    files.find((f) => f.name === 'index.html') ??
    files.find((f) => f.type === 'html') ??
    files.find((f) => f.name.endsWith('.html'))
  );
}

function inlineAssets(html: string, files: ProjectFile[]): string {
  let result = html;

  for (const file of files) {
    if (file.type === 'css') {
      const hrefPattern = new RegExp(
        `<link[^>]+href=["']${escapeRegex(file.name)}["'][^>]*>`,
        'gi',
      );
      result = result.replace(
        hrefPattern,
        `<style>\n${file.content}\n</style>`,
      );
    }

    if (file.type === 'js') {
      const srcPattern = new RegExp(
        `<script[^>]+src=["']${escapeRegex(file.name)}["'][^>]*></script>`,
        'gi',
      );
      result = result.replace(
        srcPattern,
        `<script>\n${file.content}\n</script>`,
      );
    }
  }

  return result;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildPreviewDocument(project: Project): string {
  const entry = findEntryFile(project.files);

  if (!entry) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${project.name}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; color: #6b7280; }
  </style>
</head>
<body>
  <p>No HTML file found. Create an index.html to preview your site.</p>
</body>
</html>`;
  }

  return inlineAssets(entry.content, project.files);
}

export function getFileIcon(type: ProjectFile['type']): string {
  switch (type) {
    case 'html':
      return 'bi-filetype-html';
    case 'css':
      return 'bi-filetype-css';
    case 'js':
      return 'bi-filetype-js';
    case 'json':
      return 'bi-filetype-json';
    default:
      return 'bi-file-text';
  }
}
