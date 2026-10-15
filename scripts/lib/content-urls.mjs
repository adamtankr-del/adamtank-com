// Maps content files to the public URLs they render, mirroring src/lib/urls.ts
// (originalPath from the Squarespace import, else /section/<id>) and the
// `path` field of content/pages. Plain regex over the frontmatter so this can
// run from astro.config.mjs and the IndexNow script without astro:content.
import { readdirSync, readFileSync } from 'node:fs';

export const SITE = 'https://www.adamtank.com';

function frontmatter(file) {
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = {};
  if (!m) return fm;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*"?([^"\n]*?)"?\s*$/);
    if (kv) fm[kv[1]] = kv[2];
  }
  return fm;
}

// Returns { url: { file, date } } for every content entry.
export function contentUrls() {
  const map = {};
  for (const [dir, section] of [['content/blog', 'new-blog'], ['content/quotes', 'quotes']]) {
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.md'))) {
      const fm = frontmatter(`${dir}/${f}`);
      const path = fm.originalPath || `/${section}/${f.replace(/\.md$/, '')}`;
      map[SITE + path] = { file: `${dir}/${f}`, date: fm.date || null };
    }
  }
  for (const f of readdirSync('content/pages').filter((n) => n.endsWith('.md'))) {
    const fm = frontmatter(`content/pages/${f}`);
    if (fm.path) map[SITE + fm.path] = { file: `content/pages/${f}`, date: null };
  }
  return map;
}

// Source file behind a URL that is not a content entry.
export function staticSource(url) {
  const path = new URL(url).pathname.replace(/\/$/, '');
  if (path === '') return 'src/pages/index.astro';
  if (path === '/new-blog') return 'src/pages/new-blog/index.astro';
  if (path === '/quotes') return 'src/pages/quotes/index.astro';
  if (/^\/quotes\/page\/\d+$/.test(path)) return null; // pagination, no single source
  return `src/pages${path}.astro`;
}
