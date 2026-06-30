import type { Project, ProjectFile } from './types';

function findEntryFile(files: ProjectFile[]): ProjectFile | undefined {
  return (
    files.find((f) => f.name === 'index.html') ??
    files.find((f) => f.type === 'html') ??
    files.find((f) => f.name.endsWith('.html'))
  );
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assetPathPattern(filename: string): string {
  const escaped = escapeRegex(filename);
  return `(?:\\.\\/)?${escaped}(?:\\?[^"'#]*)?(?:#[^"']*)?`;
}

function publishedPath(projectId: string): string {
  return `/p/${projectId}`;
}

function isAlreadyPublishedPath(url: string, projectId: string): boolean {
  const prefix = publishedPath(projectId);
  return url === prefix || url === `${prefix}/` || url.startsWith(`${prefix}/`);
}

function rewriteRootPath(url: string, projectId: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return url;
  if (isAlreadyPublishedPath(trimmed, projectId)) return url;
  const path = trimmed.slice(1);
  const base = publishedPath(projectId);
  return path ? `${base}/${path}` : `${base}/`;
}

export function rewritePublishedCss(css: string, projectId: string): string {
  return css.replace(
    /url\(\s*(["']?)(\/(?!\/)[^)'"]*)\1\s*\)/gi,
    (match, quote, url) => {
      const rewritten = rewriteRootPath(url, projectId);
      return rewritten === url ? match : `url(${quote}${rewritten}${quote})`;
    },
  );
}

function rewritePublishedHtml(html: string, projectId: string): string {
  const withAttrs = html.replace(
    /\b(href|src|action|poster|data|formaction)\s*=\s*(["'])\/(?!\/)([^"'#]*)\2/gi,
    (match, attr, quote, path) => {
      const url = `/${path}`;
      const rewritten = rewriteRootPath(url, projectId);
      return rewritten === url ? match : `${attr}=${quote}${rewritten}${quote}`;
    },
  );

  const baseTag = `<base href="${publishedPath(projectId)}/">`;
  if (/<head[^>]*>/i.test(withAttrs)) {
    return withAttrs.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
  }
  return `${baseTag}${withAttrs}`;
}

function inlineAssets(html: string, files: ProjectFile[], projectId?: string): string {
  let result = html;

  for (const file of files) {
    if (file.type === 'css') {
      const hrefPattern = new RegExp(
        `<link[^>]+href=["']${assetPathPattern(file.name)}["'][^>]*>`,
        'gi',
      );
      const cssContent = projectId ? rewritePublishedCss(file.content, projectId) : file.content;
      result = result.replace(
        hrefPattern,
        `<style>\n${cssContent}\n</style>`,
      );
    }

    if (file.type === 'js') {
      const srcPattern = new RegExp(
        `<script[^>]+src=["']${assetPathPattern(file.name)}["'][^>]*>\\s*</script>`,
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

export function buildPublishedDocument(project: Project, htmlContent?: string): string {
  const entry = findEntryFile(project.files);
  const sourceHtml = htmlContent ?? entry?.content;

  if (!sourceHtml) {
    return buildPreviewDocument(project);
  }

  const inlined = inlineAssets(sourceHtml, project.files, project.id);
  const html = rewritePublishedHtml(inlined, project.id);
  const robotsMeta = '<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">';

  return html.includes('</head>')
    ? html.replace('</head>', robotsMeta + '</head>')
    : html + robotsMeta;
}

export const publishedNoCrawlHeaders = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
} as const;

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

export function isProtectedFile(name: string): boolean {
  return name === 'index.html';
}
