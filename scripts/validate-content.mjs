#!/usr/bin/env node
/**
 * Content integrity gate for the certified Web Content P0 layer.
 *
 * Checks (fails the build on any error):
 *  - every topic JSON parses, has required fields, provenance=EDITORIAL, valid status/master_qa
 *  - ids unique; related_topics / index_rows / comparison rows / common_problems.topic resolve (aliases allowed)
 *  - every claim / step / quantity / caution carries a source ref (spec V06)
 *  - howto topics with master_step_count: step total matches
 *  - era: any era_kind on a claim/quantity requires a non-null era_notice (spec V16) with year_be 2548 (V17)
 *  - privacy blocklist (D002/D009): no network-directory / contact / coordinate patterns in web content
 *  - critical certified values are present verbatim (T10/T09 mold sizes, adobe ratio, roof angles, plaster test area, foundation numbers, 1.20 m/day)
 *  - diagrams manifest: files exist, never present "4"/"8" as semantic labels in SVG text, ✓/✗ symbols present
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const CONTENT = join(ROOT, 'content', 'web');
const errors = [];
const warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warnings.push(`${f}: ${m}`);

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    if (statSync(f).isDirectory()) walk(f, out);
    else if (f.endsWith('.json')) out.push(f);
  }
  return out;
}

const files = walk(CONTENT);
const topics = [];
for (const f of files) {
  const rel = relative(ROOT, f);
  try {
    const t = JSON.parse(readFileSync(f, 'utf8'));
    t.__file = rel;
    topics.push(t);
  } catch (e) {
    err(rel, `JSON parse error: ${e.message}`);
  }
}

const REQUIRED = ['id', 'topic_id', 'slug', 'section', 'topic_type', 'title', 'source_file', 'master_refs', 'master_qa', 'status', 'provenance', 'key_points', 'safety_cautions', 'common_problems', 'source_refs', 'read_original', 'related_topics'];
const SECTIONS = new Set(['start', 'materials', 'techniques', 'build', 'checklists', 'problems', 'safety', 'faq']);
const TYPES = new Set(['howto', 'problem', 'checklist', 'faq', 'comparison', 'story']);
const STATUS = new Set(['AI_DRAFT', 'QA_PASSED']);
const MQA = new Set(['PASSED', 'PENDING', 'NEEDS_RECHECK', 'BLOCKED_BY_MASTER_QA']);

const ids = new Map();
for (const t of topics) {
  const f = t.__file;
  for (const k of REQUIRED) if (!(k in t)) err(f, `missing field "${k}"`);
  if (t.provenance !== 'EDITORIAL') err(f, `provenance must be EDITORIAL (V01), got ${t.provenance}`);
  if (!STATUS.has(t.status)) err(f, `invalid status ${t.status} (V02)`);
  if (!MQA.has(t.master_qa)) err(f, `invalid master_qa ${t.master_qa} (V02)`);
  if (t.master_qa === 'BLOCKED_BY_MASTER_QA') err(f, 'BLOCKED_BY_MASTER_QA pages must not be built (V13)');
  if (!SECTIONS.has(t.section)) err(f, `unknown section ${t.section}`);
  if (!TYPES.has(t.topic_type)) err(f, `unknown topic_type ${t.topic_type}`);
  if (ids.has(t.id)) err(f, `duplicate id ${t.id} (also in ${ids.get(t.id)})`);
  ids.set(t.id, f);
  for (const a of t.aliases ?? []) { if (ids.has(a)) err(f, `alias ${a} collides`); ids.set(a, f); }
  // path uniqueness
  const path = t.section_index ? `/${t.section}` : `/${t.section}/${t.slug}`;
  if (!t.section_index && !t.slug) err(f, 'non-index topic needs a slug');
  t.__path = path;
}
const paths = new Map();
for (const t of topics) { if (paths.has(t.__path)) err(t.__file, `duplicate route ${t.__path} (also ${paths.get(t.__path)})`); paths.set(t.__path, t.__file); }

// references
for (const t of topics) {
  const f = t.__file;
  for (const r of t.related_topics ?? []) if (!ids.has(r)) err(f, `related_topics "${r}" does not resolve (V05)`);
  for (const row of t.index_rows ?? []) for (const r of row.targets) if (!ids.has(r)) err(f, `index_rows target "${r}" does not resolve`);
  for (const row of t.comparison?.rows ?? []) if (row.topic && !ids.has(row.topic)) err(f, `comparison row topic "${row.topic}" does not resolve`);
  for (const p of t.common_problems ?? []) if (p.topic && !ids.has(p.topic)) err(f, `common_problems topic "${p.topic}" does not resolve`);
}

// traceability: refs on every factual unit (V06). Index/navigation pages (no_new_facts) are exempt.
function needRef(f, label, item) {
  if (!item.ref) err(f, `${label} "${(item.text ?? item.label ?? item.symptom ?? '').slice(0, 40)}…" has no source ref (V06)`);
}
for (const t of topics) {
  const f = t.__file;
  if (t.no_new_facts) continue;
  for (const c of t.key_points ?? []) needRef(f, 'key_point', c);
  for (const s of t.steps ?? []) needRef(f, 'step', s);
  for (const g of t.step_groups ?? []) { if (!g.ref) err(f, `step_group "${g.title}" has no ref`); }
  for (const i of t.items ?? []) needRef(f, 'item', i);
  for (const q of t.ratios_dimensions ?? []) needRef(f, 'quantity', q);
  for (const c of t.safety_cautions ?? []) needRef(f, 'safety_caution', c);
  for (const p of t.common_problems ?? []) needRef(f, 'common_problem', p);
  for (const m of t.materials_tools ?? []) needRef(f, 'material', m);
  for (const r of t.comparison?.rows ?? []) needRef(f, 'comparison row', r);
  if (t.topic_type === 'howto' && !t.no_new_facts && !t.section_index) {
    const total = (t.steps?.length ?? 0) + (t.step_groups ?? []).reduce((n, g) => n + g.steps.length, 0);
    if (t.master_step_count !== undefined) {
      // unnumbered groups (e.g. stone foundation bullets) are not counted by master_step_count
      const counted = (t.steps?.length ?? 0) + (t.step_groups ?? []).filter((g) => g.numbered !== false).reduce((n, g) => n + g.steps.length, 0);
      if (counted !== t.master_step_count && total !== t.master_step_count) err(f, `step count ${counted} != master_step_count ${t.master_step_count} (V04)`);
    }
  }
  if (t.key_points && (t.key_points.length > 10)) warn(f, `key_points has ${t.key_points.length} entries (spec V03 expects 3–7; certified file kept as-is)`);
}

// era (V16/V17)
for (const t of topics) {
  const f = t.__file;
  const eraUnits = [...(t.key_points ?? []), ...(t.ratios_dimensions ?? []), ...(t.steps ?? [])].filter((u) => u.era_kind);
  if (eraUnits.length > 0 && !t.era_notice) err(f, `has era_kind units but era_notice is null (V16)`);
  if (t.era_notice) {
    if (t.era_notice.year_be !== 2548) err(f, `era_notice.year_be must be 2548 (V17)`);
    if (!Array.isArray(t.era_notice.kinds) || t.era_notice.kinds.length === 0) err(f, 'era_notice.kinds empty');
  }
}

// privacy blocklist (D002 / D009 / V19)
const BLOCK = [
  [/ทำเนียบเครือข่าย/u, 'network directory wording'],
  [/PDF\s*11[34][LR]?/u, 'network directory pages PDF 113R–114L'],
  [/\b0\d{1,2}[- ]?\d{3}[- ]?\d{4}\b/u, 'phone-number-like pattern'],
  [/\b1[3-9]\.\d{3,}\s*,\s*\d{2,3}\.\d{3,}/u, 'coordinate-like pattern'],
  [/@[a-z0-9.-]+\.[a-z]{2,}/iu, 'email-like pattern'],
  [/บ้านเลขที่/u, 'house number'],
];
for (const t of topics) {
  const text = JSON.stringify(t);
  for (const [re, label] of BLOCK) if (re.test(text)) err(t.__file, `privacy blocklist hit: ${label} (D002/D009)`);
}

// critical certified values (must remain verbatim somewhere in the package)
const corpus = topics.map((t) => JSON.stringify(t)).join('\n');
const MUST = [
  ['กว้าง ๘ นิ้ว ยาว ๑๔ นิ้ว หรือ ๑๖ นิ้ว หนา ๔ นิ้ว', 'T09 mold size 8×14/16×4 in'],
  ['กว้าง ๑๐ นิ้ว ยาว ๑๖ นิ้ว หนา ๔ นิ้ว', 'T09 mold size 10×16×4 in'],
  ['ดินเหนียว ๑ ส่วน : ทราย ๑-๒ ส่วน : แกลบหรือฟางเส้นสั้น ๑.๕ ส่วน', 'adobe ratio 1 : 1–2 : 1.5'],
  ['ไม่เกิน ๑.๒๐ เมตร', 'adobe build height ≤ 1.20 m/day'],
  ['ไม่ต่ำกว่า ๓๐ องศา', 'roof slope ≥ 30°'],
  ['อย่างน้อย ๔๕ องศา', 'natural thatch ≥ 45°'],
  ['๕๐ x ๕๐ เซนติเมตร', 'plaster test 50×50 cm'],
  ['ลึกลงไปอย่างน้อย ๒๐ เซนติเมตร', 'foundation trench ≥ 20 cm'],
  ['หนาอย่างน้อย ๕ เซนติเมตร', 'gravel layer ≥ 5 cm'],
  ['ส่วนเหนือดิน ๑๕ ซม. / ส่วนในดิน ๑๕-๒๐ ซม. / ชั้นหินรองพื้น ๕ ซม.', 'beam section 15 / 15–20 / 5 cm'],
  ['อย่างน้อย ๕ เซนติเมตร ทุกๆ ระยะ ๖๐ เซนติเมตร', 'cob taper 5 cm per 60 cm'],
  ['ประมาณ ๑๕-๒๐ เซนติเมตร', 'rammed earth lift 15–20 cm'],
  ['ประมาณ 10%', 'rammed earth cement approx. 10%'],
  ['๓-๕ เมตร', 'wall spacing 3–5 m'],
  ['ไม่ถึง 2,000 บาท', 'T26 price example (must carry EraNotice)'],
  ['ห้ามใช้ปูนสำหรับการก่อหรือฉาบเด็ดขาด', 'T08 forbidden cement type'],
];
for (const [needle, label] of MUST) if (!corpus.includes(needle)) err('content/web', `missing certified value: ${label} ("${needle}")`);
// T26 must carry a required price era notice
const price = topics.find((t) => t.id === 'wc-faq-price');
if (price && !(price.era_notice && price.era_notice.kinds.includes('price'))) err(price.__file, 'T26 must have era_notice kind "price"');
if (topics.length !== 26) err('content/web', `expected 26 P0 topics, found ${topics.length}`);

// diagrams manifest
const manifest = JSON.parse(readFileSync(join(ROOT, 'content', 'diagrams.json'), 'utf8'));
const DIAGRAM_STATUS = new Set(Object.keys(manifest._status_vocab ?? {}));
for (const d of manifest.diagrams) {
  if (!DIAGRAM_STATUS.has(d.status)) err('content/diagrams.json', `${d.id}: status ${d.status} not in _status_vocab`);
  const file = join(ROOT, 'public', d.file);
  if (!existsSync(file)) { err('content/diagrams.json', `${d.id}: file ${d.file} missing`); continue; }
  const svg = readFileSync(file, 'utf8');
  if (!/<title/.test(svg) || !/<desc/.test(svg)) err(d.file, 'SVG must have <title> and <desc>');
  // 4/8 as semantic labels: a bare "4" or "8" text node
  if (/<text[^>]*>\s*[48]\s*<\/text>/.test(svg)) err(d.file, 'SVG shows OCR digit 4/8 as a label — use ✓/✗ semantics');
  const hasOk = /id="ok"/.test(svg), hasNo = /id="no"/.test(svg);
  if (d.semantics.includes('✓') && !hasOk) err(d.file, 'spec requires ✓ but SVG has no ok symbol');
  if (d.semantics.includes('✗') && !hasNo) err(d.file, 'spec requires ✗ but SVG has no no symbol');
  for (const id of d.topics) if (!ids.has(id)) err('content/diagrams.json', `${d.id}: topic ${id} does not resolve`);
}
// every figure diagram_id must exist in manifest
for (const t of topics) for (const fig of t.figures ?? []) for (const id of fig.diagram_ids ?? []) if (!manifest.diagrams.some((d) => d.id === id)) err(t.__file, `figure references unknown diagram ${id}`);

for (const w of warnings) console.warn('WARN', w);
if (errors.length) {
  for (const e of errors) console.error('ERROR', e);
  console.error(`\nvalidate-content: ${errors.length} error(s)`);
  process.exit(1);
}
console.log(`validate-content: OK — ${topics.length} topics, ${manifest.diagrams.length} diagrams, ${warnings.length} warning(s)`);
