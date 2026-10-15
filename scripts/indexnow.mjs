// Submit changed page URLs to IndexNow (Bing, Yandex, Naver, Seznam share one endpoint).
// Run by .github/workflows/indexnow.yml after each push is live on Vercel.
//
//   BEFORE=<sha>  commit range start (github.event.before); empty or all-zero = submit every URL
//   ALL=true      submit every sitemap URL regardless of what changed
//   DRY=1         print the URL list without submitting
//   FILES=a,b     test the file-to-URL mapping with this changed-file list instead of git diff
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { SITE, contentUrls } from './lib/content-urls.mjs';

const HOST = new URL(SITE).host;
const keyFile = readdirSync('public').find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('IndexNow key file missing from public/');
const KEY = readFileSync(`public/${keyFile}`, 'utf8').trim();

async function sitemapUrls() {
  const index = await (await fetch(`${SITE}/sitemap-index.xml`)).text();
  const maps = [...index.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  const urls = [];
  for (const m of maps) {
    const xml = await (await fetch(m)).text();
    urls.push(...[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((x) => x[1]));
  }
  return urls;
}

const content = contentUrls();
const urlByFile = Object.fromEntries(Object.entries(content).map(([u, v]) => [v.file, u]));

// Map a changed source file to the public URLs it affects. Returns 'all' when
// the file is shared by every page (layout, components, styles, config).
function urlsForFile(file) {
  if (urlByFile[file]) {
    const u = urlByFile[file];
    const hub = u.includes('/new-blog/') ? `${SITE}/new-blog` : u.includes('/quotes/') ? `${SITE}/quotes` : null;
    return hub ? [u, hub] : [u];
  }
  if (/^content\/(blog|quotes|pages)\//.test(file)) return []; // deleted or unmapped entry
  let m;
  if (file === 'src/pages/index.astro') return [`${SITE}/`];
  if (file === 'src/pages/new-blog/index.astro') return [`${SITE}/new-blog`];
  if (file === 'src/pages/quotes/index.astro') return [`${SITE}/quotes`];
  if (/^src\/pages\/new-blog\/\[/.test(file)) return { prefix: `${SITE}/new-blog/` };
  if (/^src\/pages\/quotes\//.test(file)) return { prefix: `${SITE}/quotes/` };
  if (file === 'src/pages/[...page].astro') return { prefix: `${SITE}/keynote-speaker` };
  if ((m = file.match(/^src\/pages\/([a-z0-9-]+)\.astro$/))) return m[1] === '404' ? [] : [`${SITE}/${m[1]}`];
  if (/^src\/pages\/.*\.ts$/.test(file)) return [];
  if (/^(src\/|astro\.config\.mjs|package\.json|package-lock\.json)/.test(file)) return 'all';
  return [];
}

const before = process.env.BEFORE || '';
const everything = process.env.ALL === 'true' || !before || /^0+$/.test(before);
const all = await sitemapUrls();
let urls;

if (everything) {
  urls = all;
} else {
  let changed;
  if (process.env.FILES) changed = process.env.FILES.split(',');
  else try {
    changed = execSync(`git diff --name-only ${before} HEAD`, { encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch {
    changed = null; // range not available (force push, rebase); fall back to everything
  }
  if (!changed) urls = all;
  else {
    const set = new Set();
    let useAll = false;
    for (const f of changed) {
      const r = urlsForFile(f);
      if (r === 'all') { useAll = true; break; }
      if (Array.isArray(r)) r.forEach((u) => set.add(u));
      else if (r.prefix) all.filter((u) => u.startsWith(r.prefix)).forEach((u) => set.add(u));
    }
    urls = useAll ? all : all.filter((u) => set.has(u) || set.has(u.replace(/\/$/, '')) || set.has(`${u}/`));
  }
}

urls = [...new Set(urls)];
console.log(`${everything ? 'all' : 'changed'}: ${urls.length} URL(s)`);
urls.forEach((u) => console.log('  ' + u));
if (!urls.length) process.exit(0);
if (process.env.DRY) process.exit(0);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${keyFile}`, urlList: urls }),
});
console.log(`IndexNow responded ${res.status} ${res.statusText}`);
if (res.status !== 200 && res.status !== 202) {
  console.error(await res.text());
  process.exit(1);
}
