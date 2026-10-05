import type { APIRoute } from 'astro';
import { allTopics, topicUrl, SECTIONS, TOPIC_TYPE_LABEL } from '../lib/content';

/**
 * Static search index consumed by /search. Built from the certified JSON only.
 * `text` concatenates the displayed strings so matches point at real page content.
 */
export const GET: APIRoute = () => {
  const items = allTopics().map((t) => {
    const parts: string[] = [];
    const push = (s?: string) => { if (s) parts.push(s); };
    push(t.question); push(t.one_line_summary); push(t.quick_answer); push(t.symptom);
    for (const c of t.key_points) { push(c.heading); push(c.text); }
    for (const s of t.steps ?? []) { push(s.heading); push(s.text); }
    for (const g of t.step_groups ?? []) for (const s of g.steps) push(s.text);
    for (const i of t.items ?? []) push(i.text);
    for (const q of t.ratios_dimensions ?? []) { push(q.label); push(q.value_text); }
    for (const c of t.safety_cautions) push(c.text);
    for (const p of t.common_problems) { push(p.symptom); push(p.what_book_says); }
    for (const r of t.index_rows ?? []) { push(r.label); push(r.lead); }
    for (const r of t.comparison?.rows ?? []) { push(r.technique); push(r.wall); push(r.pros); push(r.cons); }
    return {
      id: t.id,
      topic_id: t.topic_id,
      url: topicUrl(t),
      title: t.title,
      section: t.section,
      section_title: SECTIONS[t.section].title,
      type: t.topic_type,
      type_label: TOPIC_TYPE_LABEL[t.topic_type],
      summary: t.one_line_summary ?? t.quick_answer ?? '',
      has_safety: t.safety_cautions.length > 0,
      has_era: !!t.era_notice,
      text: parts.join(' \n '),
    };
  });
  return new Response(JSON.stringify({ generated: 'build', count: items.length, items }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
