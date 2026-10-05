# Content schema — `content/web/**/*.json`

One JSON file per P0 topic (T01–T26). The shape follows `WEB_CONTENT_LAYER_SPEC` v0.1 §3,
flattened to the way the certified Markdown files (`WEB_CONTENT_P0_*`) actually encode it.
The site **reads** these files; it never rewrites them. Types live in `src/lib/content.ts`.

## Identity and provenance

| field | meaning |
|---|---|
| `id` | stable id from the certified file, e.g. `wc-howto-adobe` |
| `aliases` | other ids used for this topic in related_topics elsewhere (only `wc-problem-termites → wc-faq-termites`) |
| `topic_id` | `T01`…`T26` (WEB_CONTENT_P0_MANIFEST) |
| `section`, `slug`, `section_index` | route: `/<section>/<slug>`; `section_index: true` ⇒ `/<section>` |
| `topic_type` | `howto` · `problem` · `checklist` · `faq` · `comparison` |
| `source_file` | certified Drive document the text was taken from (`WEB_CONTENT_P0_START`, `…_T18_FINAL`, …) |
| `source_set`, `source_range`, `ref_precision`, `master_refs`, `master_qa` | as certified |
| `status` | `AI_DRAFT` (package-level WEB_QA_PASSED) or `QA_PASSED` (T18, T21) |
| `provenance` | always `EDITORIAL` |

## Content blocks

| field | component |
|---|---|
| `one_line_summary`, `quick_answer`, `question`, `symptom` | header / คำตอบสั้น |
| `key_points: Claim[]` | `ClaimList` (chips: claim type F/N/C/X/A, modality D/R/Rc/N/F, verbatim values, era_kind, source) |
| `steps: Step[]` / `step_groups[]` | `Steps` (numbered unless `numbered: false`); `master_step_count` is checked |
| `items: Claim[]` | `Checklist` (checklist topics) |
| `extra_blocks[]` | titled list/paragraph blocks (e.g. “สิ่งที่ควรเตรียม”, “ข้อแนะนำอัตราส่วน”) |
| `ratios_dimensions: Quantity[]` | `Ratios` — `value_text` verbatim, never converted |
| `materials_tools: Claim[]` (optional `group`) | materials list |
| `safety_cautions: Claim[]` + `safety_note` | `Safety` — always rendered, FORBIDDEN (`mod: "F"`) highlighted |
| `common_problems[]` | `CommonProblems` (อาการ → สิ่งที่หนังสือบอก) |
| `comparison` | `Comparison` (T12 only; certified columns only) |
| `index_rows[]` | `IndexRows` (T05 path, T20 problems index) |
| `figures[]` | `Figure`: `needs_redraw` + `diagram_ids` → G3 SVG; otherwise placeholder with original caption |
| `era_notice` | `EraNotice` (`proposed: true` = proposal awaiting ChatGPT confirmation, shown as such) |
| `source_refs`, `read_original`, `related_topics`, `qa_closure`, `editorial_notes`, `presentation_cautions` | provenance footer |

### Claim

```jsonc
{ "id": "k1", "heading": "optional", "text": "…", "type": "F|N|C|X|A", "mod": "D|R|Rc|N|F (comma-joined if certified so)",
  "ref": "PDF 73R (๑๔๓)", "verbatim": ["๒๐ เซนติเมตร"], "era_kind": null, "strong": false, "strong_phrase": "…", "safety": false }
```

Codes are the ones used in the certified tables: F=FACT, N=NUMBER, C=CAUTION, X=CONTEXT, A=OPINION_OF_AUTHOR;
D=DESCRIPTIVE, R=REQUIRED, Rc=RECOMMENDED, N=NOT_RECOMMENDED, F=FORBIDDEN.

## Validation (`npm run validate`)

Required fields, provenance, unique ids/routes, resolvable references, a source ref on every factual
unit, step counts vs `master_step_count`, era consistency (V16/V17), privacy blocklist (D002/D009),
presence of critical certified values (mold sizes, ratios, angles, 50×50 cm, 1.20 m/day, 3–5 m, price EraNotice),
and diagram manifest integrity (files exist, ✓/✗ symbols present, no OCR 4/8 labels).
