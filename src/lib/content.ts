/**
 * Content loader for the certified Web Content P0 layer.
 *
 * Source of truth for copy: content/web/** (transcribed from the certified
 * Drive package, see docs/CONTENT_SCHEMA.md). This module only READS it;
 * nothing here may rewrite numbers, cautions, provenance or EraNotice.
 */

export type ClaimTypeCode = 'F' | 'N' | 'C' | 'X' | 'A';
export type ModalityCode = 'D' | 'R' | 'Rc' | 'N' | 'F';

export interface Claim {
  id?: string;
  n?: number;
  heading?: string;
  text: string;
  type?: ClaimTypeCode;
  mod?: string; // e.g. "Rc" or "R,Rc" exactly as certified
  ref?: string;
  verbatim?: string[];
  era_kind?: string | null;
  strong?: boolean;
  strong_phrase?: string;
  safety?: boolean;
  from_item?: number;
  from_claim?: string;
  group?: string;
}

export interface StepGroup {
  title: string;
  ref?: string;
  numbered?: boolean;
  steps: Claim[];
}

export interface Quantity {
  id?: string;
  label: string;
  value_text: string;
  context?: string;
  era_kind?: string | null;
  ref?: string;
}

export interface CommonProblem {
  symptom: string;
  what_book_says: string;
  ref?: string;
  topic?: string;
}

export interface Figure {
  ref: string;
  caption_original?: string;
  note?: string;
  needs_redraw?: boolean;
  diagram_ids?: string[];
}

export interface EraNotice {
  year_be: 2548;
  scope: 'inline' | 'block' | 'page' | 'whole_claim';
  kinds: string[];
  claim_ids?: string[];
  note?: string;
  proposed?: boolean;
  decision_pending?: boolean;
  /** set once ChatGPT QA has confirmed a previously proposed notice (e.g. "ChatGPT QA — CCR-02 (5 ต.ค. 2569)") */
  confirmed_by?: string;
  required?: boolean;
}

export interface IndexRow {
  n?: number;
  label: string;
  lead?: string;
  targets: string[];
}

export interface ComparisonRow {
  technique: string;
  topic?: string;
  tag?: string;
  wall: string;
  wall_strong?: string;
  pros: string;
  cons: string;
  ref: string;
}

export interface ExtraBlock {
  title: string;
  ref?: string;
  text?: string;
  list?: string[];
}

export type Section =
  | 'start'
  | 'materials'
  | 'techniques'
  | 'build'
  | 'checklists'
  | 'problems'
  | 'safety'
  | 'faq';

export type TopicType = 'howto' | 'problem' | 'checklist' | 'faq' | 'comparison' | 'story';

export interface Topic {
  id: string;
  aliases?: string[];
  topic_id: string;
  slug: string;
  section: Section;
  section_index?: boolean;
  topic_type: TopicType;
  topic_type_note?: string;
  priority: 'P0';
  title: string;
  question?: string;
  symptom?: string;
  source_file: string;
  source_file_note?: string;
  source_set: string;
  source_range: string;
  ref_precision?: 'PARAGRAPH' | 'PAGE_SIDE' | 'PDF_RANGE';
  master_step_count?: number;
  master_step_note?: string;
  master_refs: string[];
  master_qa: 'PASSED' | 'PENDING' | 'NEEDS_RECHECK' | 'BLOCKED_BY_MASTER_QA';
  status: 'AI_DRAFT' | 'QA_PASSED';
  provenance: 'EDITORIAL';
  editorial_label?: string;
  no_new_facts?: boolean;
  book_note?: string;
  chapter_note?: string;
  principle?: string;
  one_line_summary?: string;
  quick_answer?: string;
  quick_answer_era?: boolean;
  key_points_title?: string;
  key_points: Claim[];
  steps_title?: string;
  steps_ref?: string;
  steps?: Claim[];
  step_groups?: StepGroup[];
  items_title?: string;
  items?: Claim[];
  extra_blocks?: ExtraBlock[];
  materials_title?: string;
  materials_tools?: Claim[];
  materials_note?: string;
  ratios_title?: string;
  ratios_dimensions?: Quantity[];
  ratios_note?: string;
  safety_title?: string;
  safety_cautions: Claim[];
  safety_note?: string;
  common_problems_title?: string;
  common_problems: CommonProblem[];
  common_problems_note?: string;
  comparison?: { title: string; note?: string; columns: string[]; rows: ComparisonRow[] };
  index_rows?: IndexRow[];
  figures?: Figure[];
  era_notice: EraNotice | null;
  source_refs: string[];
  read_original: string[];
  related_topics: string[];
  presentation_cautions?: string[];
  qa_closure?: string;
  editorial_notes?: string[];
}

export interface DiagramSpec {
  id: string;
  file: string;
  title: string;
  source: string;
  book_page: string;
  ref_image: string;
  topics: string[];
  caption: string;
  alt: string;
  provenance: string;
  semantics: string;
  status: string;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

const modules = import.meta.glob<Topic>('/content/web/**/*.json', {
  eager: true,
  import: 'default',
});

const ALL: Topic[] = Object.values(modules).sort((a, b) => a.topic_id.localeCompare(b.topic_id));

const BY_ID = new Map<string, Topic>();
for (const t of ALL) {
  BY_ID.set(t.id, t);
  for (const a of t.aliases ?? []) BY_ID.set(a, t);
}

export function allTopics(): Topic[] {
  return ALL;
}

export function topicById(id: string): Topic | undefined {
  return BY_ID.get(id);
}

export function topicsInSection(section: Section): Topic[] {
  return ALL.filter((t) => t.section === section && !t.section_index);
}

export function sectionIndexTopic(section: Section): Topic | undefined {
  return ALL.find((t) => t.section === section && t.section_index);
}

export function topicUrl(t: Topic): string {
  return t.section_index || t.slug === '' ? `/${t.section}` : `/${t.section}/${t.slug}`;
}

export function urlForId(id: string): string | undefined {
  const t = topicById(id);
  return t ? topicUrl(t) : undefined;
}

// ---------------------------------------------------------------------------
// Diagrams manifest (G3 visual package)
// ---------------------------------------------------------------------------

import diagramsJson from '../../content/diagrams.json';

export const DIAGRAMS: DiagramSpec[] = (diagramsJson as { diagrams: DiagramSpec[] }).diagrams;

export function diagramById(id: string): DiagramSpec | undefined {
  return DIAGRAMS.find((d) => d.id === id);
}

// ---------------------------------------------------------------------------
// Presentation vocab (labels only; never alters certified text)
// ---------------------------------------------------------------------------

export const SECTIONS: Record<Section, { title: string; short: string; description: string; order: number }> = {
  start: { title: 'เริ่มต้นที่นี่', short: 'เริ่มต้น', description: 'เส้นทางเรียนสำหรับผู้เริ่มต้น ข้อแนะนำก่อนสร้าง และหลักการออกแบบ', order: 1 },
  materials: { title: 'ดินและวัสดุ', short: 'ดิน', description: 'ประเภทดิน และวิธีทดสอบดินที่หนังสือระบุ', order: 2 },
  techniques: { title: 'เทคนิคก่อสร้าง', short: 'เทคนิค', description: 'อิฐดินดิบ ดินปั้น ดินอัด และตารางเปรียบเทียบตามที่หนังสือระบุ', order: 3 },
  build: { title: 'ฐานราก และการฉาบ', short: 'ก่อสร้าง', description: 'ฐานราก/ระบบระบายน้ำ และการฉาบผิว', order: 4 },
  checklists: { title: 'รายการตรวจ', short: 'ตรวจ', description: 'ข้อพิจารณาและข้อควรคำนึงที่หนังสือมี ในรูปแบบรายการ', order: 5 },
  problems: { title: 'ค้นตามปัญหา', short: 'ปัญหา', description: 'ข้อผิดพลาดที่มักเกิดขึ้น และดัชนีอาการ → หัวข้อที่มีข้อความรองรับ', order: 6 },
  safety: { title: 'ความปลอดภัย', short: 'ปลอดภัย', description: 'ข้อควรระวังที่หนังสือระบุ รวมศูนย์ พร้อมลิงก์กลับหัวข้อต้นทาง', order: 7 },
  faq: { title: 'คำถามยอดฮิต', short: 'FAQ', description: 'บ้านดินคืออะไร ปลวก ฝน อายุบ้าน ราคา', order: 8 },
};

export const SECTION_ORDER = (Object.keys(SECTIONS) as Section[]).sort((a, b) => SECTIONS[a].order - SECTIONS[b].order);

export const TOPIC_TYPE_LABEL: Record<TopicType, string> = {
  howto: 'วิธีทำ',
  problem: 'ปัญหา/ข้อผิดพลาด',
  checklist: 'รายการตรวจ',
  faq: 'คำถามยอดฮิต',
  comparison: 'เปรียบเทียบ',
  story: 'เรื่องเล่า',
};

export const CLAIM_TYPE_LABEL: Record<ClaimTypeCode, { short: string; long: string }> = {
  F: { short: 'ข้อเท็จจริง', long: 'FACT — ข้อเท็จจริงตามหนังสือ' },
  N: { short: 'ตัวเลข', long: 'NUMBER — ตัวเลข/ขนาดตามหนังสือ' },
  C: { short: 'ข้อควรระวัง', long: 'CAUTION — ข้อควรระวังตามหนังสือ' },
  X: { short: 'บริบท', long: 'CONTEXT — บริบทประกอบ' },
  A: { short: 'ความเห็นผู้เขียน', long: 'OPINION_OF_AUTHOR — ความเห็น/ประสบการณ์ของผู้เขียนหนังสือ' },
};

export const MODALITY_LABEL: Record<ModalityCode, { short: string; long: string }> = {
  D: { short: 'บรรยาย', long: 'DESCRIPTIVE — ข้อความบรรยาย' },
  R: { short: 'ต้อง', long: 'REQUIRED — หนังสือระบุว่า "ต้อง"' },
  Rc: { short: 'ควร', long: 'RECOMMENDED — หนังสือระบุว่า "ควร"' },
  N: { short: 'ไม่ควร', long: 'NOT_RECOMMENDED — หนังสือระบุว่า "ไม่ควร"' },
  F: { short: 'ห้าม', long: 'FORBIDDEN — หนังสือระบุว่า "ห้าม"' },
};

export function modalityCodes(mod?: string): ModalityCode[] {
  if (!mod) return [];
  return mod
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is ModalityCode => s in MODALITY_LABEL);
}

export const STATUS_LABEL: Record<Topic['status'], string> = {
  AI_DRAFT: 'AI_DRAFT · ผ่าน WEB_QA (ChatGPT) ระดับแพ็กเกจ P0',
  QA_PASSED: 'QA_PASSED',
};

export const BOOK = {
  title: 'จากดินสู่บ้าน สร้างบ้านด้วยดิน',
  year_be: 2548,
  isbn: '978-611-90054-4-0',
  era_text: 'ข้อมูลจากหนังสือที่เขียน/จัดทำในปี พ.ศ. 2548',
};

/** Pull "PDF nn" page numbers out of a certified source ref string, for display grouping only. */
export function pdfPagesInRef(ref: string | undefined): number[] {
  if (!ref) return [];
  const out = new Set<number>();
  const re = /PDF\s*0*(\d{1,3})(?:\s*[LR])?(?:\s*[–-]\s*0*(\d{1,3}))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(ref))) {
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    if (b >= a && b - a < 40) for (let i = a; i <= b; i++) out.add(i);
    else out.add(a);
  }
  return [...out].sort((x, y) => x - y);
}
