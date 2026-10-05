#!/usr/bin/env node
/**
 * Post-build internal link checker. Walks dist/, extracts href/src values that
 * start with "/" and verifies the target file exists (trailingSlash: never, build.format: file).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
if (!existsSync(DIST)) { console.error('dist/ not found — run `npm run build` first'); process.exit(1); }

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    if (statSync(f).isDirectory()) walk(f, out);
    else if (f.endsWith('.html')) out.push(f);
  }
  return out;
}
function resolves(url) {
  const clean = url.split('#')[0].split('?')[0];
  if (clean === '/' || clean === '') return existsSync(join(DIST, 'index.html'));
  const p = join(DIST, clean);
  return existsSync(p) || existsSync(p + '.html') || existsSync(join(p, 'index.html'));
}

const pages = walk(DIST);
let links = 0, broken = [];
const re = /\b(?:href|src)="([^"]+)"/g;
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  let m;
  while ((m = re.exec(html))) {
    const url = m[1];
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    links++;
    if (!resolves(url)) broken.push(`${relative(DIST, page)} → ${url}`);
  }
}
if (broken.length) {
  for (const b of broken) console.error('BROKEN', b);
  console.error(`check-links: ${broken.length} broken internal link(s) in ${pages.length} pages`);
  process.exit(1);
}
console.log(`check-links: OK — ${links} internal links across ${pages.length} pages`);
