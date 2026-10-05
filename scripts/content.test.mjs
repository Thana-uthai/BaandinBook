import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

test('T09 adobe mold dimensions remain 8×14/16×4 and 10×16×4 inches (G2 check)', () => {
  const t = read('content/web/techniques/adobe.json');
  const values = t.ratios_dimensions.map((q) => q.value_text);
  assert.ok(values.includes('กว้าง ๘ นิ้ว ยาว ๑๔ นิ้ว หรือ ๑๖ นิ้ว หนา ๔ นิ้ว'));
  assert.ok(values.includes('กว้าง ๑๐ นิ้ว ยาว ๑๖ นิ้ว หนา ๔ นิ้ว'));
  assert.ok(!JSON.stringify(t).includes('กว้าง ๖ นิ้ว'), 'the superseded 6-inch width must not appear');
  assert.ok(!JSON.stringify(t).includes('6 นิ้ว'), 'the superseded 6-inch width must not appear (arabic)');
});

test('T10 cob keeps top width ≥ 20 cm and taper 5 cm / 60 cm', () => {
  const t = read('content/web/techniques/cob.json');
  const values = t.ratios_dimensions.map((q) => q.value_text).join(' | ');
  assert.match(values, /อย่างน้อย ๒๐ เซนติเมตร/);
  assert.match(values, /อย่างน้อย ๕ เซนติเมตร ทุกๆ ระยะ ๖๐ เซนติเมตร/);
});

test('T18 FINAL override: 10 design mistakes, QA_PASSED', () => {
  const t = read('content/web/problems/mistakes-design.json');
  assert.equal(t.master_step_count, 10);
  assert.equal(t.key_points.length, 10);
  assert.equal(t.status, 'QA_PASSED');
  assert.match(JSON.stringify(t), /๓-๕ เมตร/);
});

test('T21 FINAL override: Wattle & Daub source precision closed', () => {
  const t = read('content/web/problems/cracking-index.json');
  assert.equal(t.status, 'QA_PASSED');
  const wd = t.common_problems.find((p) => p.symptom.includes('Wattle'));
  assert.ok(wd && wd.ref.includes('PDF49–50') && wd.ref.includes('ข้อ 1'));
});

test('T26 price carries REQUIRED EraNotice and forbids current-price reading', () => {
  const t = read('content/web/faq/price.json');
  assert.ok(t.era_notice && t.era_notice.kinds.includes('price') && t.era_notice.required === true);
  assert.equal(t.era_notice.year_be, 2548);
  assert.ok(t.safety_cautions.some((c) => c.text.includes('2,000')));
});

test('every topic is EDITORIAL and no topic is BLOCKED', () => {
  const out = execSync(`node ${join(ROOT, 'scripts/validate-content.mjs')}`, { encoding: 'utf8' });
  assert.match(out, /validate-content: OK/);
});

test('G3 diagram files exist and never label with OCR digits 4/8', () => {
  const m = read('content/diagrams.json');
  assert.equal(m.diagrams.length, 8);
  for (const d of m.diagrams) {
    const f = join(ROOT, 'public', d.file);
    assert.ok(existsSync(f), `${d.file} exists`);
    const svg = readFileSync(f, 'utf8');
    assert.doesNotMatch(svg, /<text[^>]*>\s*[48]\s*<\/text>/);
  }
});
