// @ts-check
import { defineConfig } from 'astro/config';

// Static site. No adapter, no client framework: pages are plain HTML + CSS,
// with a single small inline script on /search. Deployment target is not
// configured here on purpose (Owner decides hosting; see docs/C2_IMPLEMENTATION_REPORT.md).
export default defineConfig({
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  compressHTML: true,
});
