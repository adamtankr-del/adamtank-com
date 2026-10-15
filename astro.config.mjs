import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { contentUrls, staticSource } from './scripts/lib/content-urls.mjs';

// Sitemap <lastmod>: the last git commit that touched the page source. For
// imported posts and quotes, whose only commit is the Squarespace port (or the
// boundary of the shallow clone Vercel builds from), the frontmatter date is
// used instead. A page gets no lastmod rather than a date we are not sure of.
const IMPORT_COMMIT = 'b156d8e';
const shallowBoundary = (() => {
  try { return new Set(readFileSync('.git/shallow', 'utf8').split('\n').filter(Boolean)); } catch { return new Set(); }
})();
const importHash = (() => {
  try { return execFileSync('git', ['rev-parse', IMPORT_COMMIT], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; }
})();
function gitLast(file) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%H|%cI', '--', file], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (!out) return null;
    const [hash, date] = out.split('|');
    return { hash, date, uncertain: shallowBoundary.has(hash) || hash === importHash };
  } catch { return null; }
}
const content = contentUrls();
function lastmodFor(url) {
  const entry = content[url.replace(/\/$/, '')];
  if (entry) {
    const g = gitLast(entry.file);
    if (g && !g.uncertain) return g.date;
    return entry.date ? `${entry.date}T00:00:00Z` : null;
  }
  const src = staticSource(url);
  if (!src || !existsSync(src)) return null;
  const g = gitLast(src);
  return g && !g.uncertain ? g.date : null;
}

export default defineConfig({
  site: 'https://www.adamtank.com',
  trailingSlash: 'never',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/build.txt'),
      serialize(item) {
        const lastmod = lastmodFor(item.url);
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
  ],
});
