# C2 IMPLEMENTATION REPORT — จากดินสู่บ้าน P0 website

| | |
|---|---|
| JOB_ID | JOB-20261005-CLAUDECODE-04 |
| ROLE | Claude Code — Implementation Owner / Website Engineer |
| REPOSITORY | https://github.com/THANA-UTHAI/BAANDINBOOK (`Thana-uthai/BaandinBook`) |
| BRANCH | `claude/baandin-website-p0-p0jxt9` (session-designated branch; repo was empty, so no `main` existed to branch from) |
| DATE | 2026-10-05 |
| STATUS | **C2_IMPLEMENTED_PENDING_CHATGPT_QA** |
| GATES IN | MASTER_READY_FOR_WEB=YES · WEB_QA_PASSED=YES · G2_REVIEW_PASSED=YES · G3_QA_PASSED_AS_SPECIFICATION |

Not merged to `main`, not deployed. No deployment settings were added. PUBLISH_READY is **not** self-declared.

## 1. Commits (branch head first)

| SHA | Scope |
|---|---|
| (this commit) | docs: C2 implementation report |
| `1f5bbac` | ci: content validator, link checker, tests, GitHub Actions, README |
| `33d547d` | assets: G3 redraw diagrams V01, V04, V06–V11 as SVG + manifest |
| `57c97e8` | feat: components, routes, search and provenance pages |
| `dc8c317` | content: transcribe certified Web Content P0 T01–T26 to `content/web` JSON |
| `7defd83` | chore: scaffold Astro 7 static site |

## 2. Repository state found / stack detected

- The GitHub repository was **empty** (no branches, no commits, no README, no CI, no framework). Nothing was reinitialised, replaced, deleted or force-pushed.
- Stack chosen (per C1_01 §7 "static, Markdown/JSON content, git history as audit"): **Astro 7.3** static output, TypeScript strict, plain CSS, no client framework, no external fonts/analytics. Only `/search` ships a small inline script.
- Node 22 / npm 10. Dependencies: `astro`, dev: `@astrojs/check`, `typescript`.

## 3. Content source and integrity

Content was read from the certified Drive package and transcribed 1:1 into `content/web/<section>/<slug>.json` (26 files):

| Drive file | Topics |
|---|---|
| WEB_CONTENT_P0_START.md | T01–T05 |
| WEB_CONTENT_P0_MATERIALS.md | T06–T08 |
| WEB_CONTENT_P0_TECHNIQUES_A.md | T09–T10 |
| WEB_CONTENT_P0_TECHNIQUES_B.md | T11–T12 |
| WEB_CONTENT_P0_ROOF_PLASTER.md | T13–T14 |
| WEB_CONTENT_P0_PROBLEMS.md | T15–T17, T19, T20 (T18/T21 metadata+content from FINAL docs) |
| WEB_CONTENT_P0_T18_FINAL (QA_PASSED) | T18 — master_step_count = 10 |
| WEB_CONTENT_P0_T21_FINAL (QA_PASSED) | T21 — Wattle & Daub ref MASTER ชุด05 PDF49–50 ข้อ 1 |
| WEB_CONTENT_P0_SAFETY_FAQ | T22–T26 |

Control docs read before coding: 00_AI_CONTROL_CENTER, START_HERE, PROJECT_DECISIONS D001–D009, AI_WORKFLOW_AND_ROLES, AI_COMMUNICATION_PROTOCOL, WEB_CONTENT_LAYER_SPEC, WEB_CONTENT_P0_MANIFEST, WEB_CONTENT_P0_QA_REPORT, HANDOFF_GEMINI_G2_TO_CHATGPT (project copy), HANDOFF_GEMINI_G3_TO_CHATGPT (project copy), C1_01, C1_04, WEB_CONTENT_INVENTORY.

Verified in code and in the built HTML:
- T09/T10 mold dimensions present verbatim: **กว้าง ๘ นิ้ว ยาว ๑๔ นิ้ว หรือ ๑๖ นิ้ว หนา ๔ นิ้ว** and **กว้าง ๑๐ นิ้ว ยาว ๑๖ นิ้ว หนา ๔ นิ้ว**; no "๖ นิ้ว" width anywhere.
- Adobe ratio ๑ : ๑-๒ : ๑.๕; build height ไม่เกิน ๑.๒๐ เมตร; foundation 20 / 5 / 20 cm + beam 15 / 15–20 / 5 cm; cob ≥ ๒๐ ซม. top, ๕ ซม./๖๐ ซม. taper; rammed earth ≥ ๒๐ ซม., lifts ๑๕-๒๐ ซม., cement ประมาณ 10%; roof ไม่ต่ำกว่า ๓๐ องศา / อย่างน้อย ๔๕ องศา; plaster test ๕๐ x ๕๐ เซนติเมตร; wall spacing ๓-๕ เมตร (all enforced by `scripts/validate-content.mjs`).
- Every claim/step/quantity/caution/table cell carries its certified source ref; validator fails otherwise (spec V06).
- EraNotice rendered for T02 (duration), T11 (proposed), T12 (proposed), T14 (๘๐ ปี), T15 (decision pending — shown as proposal), T25 (duration), T26 (**REQUIRED**, price) + a site-wide page-level era bar (D005/D007). `year_be` = 2548 everywhere (V17).
- Safety blocks render on all 26 topic pages, never collapsed; FORBIDDEN cautions (T08 cement type, T26 price) highlighted.
- D006: EDITORIAL badge on every topic + legend explaining ORIGINAL / COMMUNITY / EDITORIAL in footer and `/about`.
- D001: book title/ISBN/era shown on `/sources`; full credits page (ชุด01, P2) deferred with `/book`.
- D002/D009: no directory, no network directory, no contacts, no coordinates. Validator blocklist covers network-directory wording, PDF 113R–114L, phone/email/coordinate patterns. The phrase "ทำเนียบเครือข่าย" appears only in policy statements ("not published") on `/about`, `/sources`, footer — no data.
- No content text, number, caution, provenance, source ref or EraNotice was changed. Presentation-only grouping (T04 "ใจและคน"/"ของและอุปกรณ์", already proposed in the certified file) is labelled as presentation.

## 4. Routes / pages completed (36 built)

| Route | Topic |
|---|---|
| `/` | Home — three entry paths, section cards, FAQ, content-origin note |
| `/start` · `/start/start-here` · `/start/design-principles` | T05 (8-step path, labelled "จัดโดยทีมงาน") · T02 · T03 |
| `/materials` · `/materials/soil-types` · `/materials/soil-test` | section · T06 · T07 |
| `/techniques` · `/techniques/adobe` · `/techniques/cob` · `/techniques/rammed-earth` | T12 (comparison, certified columns only) · T09 · T10 · T11 |
| `/build` · `/build/foundation-drainage` · `/build/plaster` | section · T08 · T14 |
| `/checklists` · `/checklists/site-selection` · `/checklists/roof-basics` | section · T04 · T13 |
| `/problems` · `/problems/mistakes-time-season` · `-prep` · `-site` · `-design` · `-materials` · `/problems/cracking-index` | T20 (index, "จัดหมวดโดยทีมงาน") · T15–T19 · T21 |
| `/safety` | T22 |
| `/faq` · `/faq/what-is-earthhouse` · `/faq/termites` · `/faq/rain-melt` · `/faq/lifespan` · `/faq/price` | section · T01 · T23 · T24 · T25 · T26 |
| `/search` + `/search-index.json` | client-side search, filters by section / topic type / has-safety / has-era; Thai tokenisation via `Intl.Segmenter('th')`, substring fallback, no-JS fallback list |
| `/sources` · `/about` · `/diagrams` · `/404` | provenance & chapter map · content policy (D006) · diagram status |

## 5. Reusable components (`src/components/`)

`TopicPage` (fixed block order) · `Badges` (EDITORIAL/status/type) · `EraNotice` · `SourceCite` · `ClaimList` (key points with claim-type + modality chips, verbatim values) · `Steps` (numbered/unnumbered groups, master_step_count check) · `Checklist` · `Ratios` (verbatim values) · `Safety` (prominent, FORBIDDEN highlight) · `CommonProblems` · `Comparison` · `IndexRows` (path / symptom table) · `Figure` (G3 SVG with caption/alt/provenance, or placeholder with original caption) · `TopicCard`.

Source metadata in code/data: every JSON carries `topic_id`, `id`, `source_file`, `source_set`, `source_range`, `master_refs`, `master_qa`, `status`, `provenance`, per-unit `ref`; every built page carries `data-topic-id / data-provenance / data-status` and a "ที่มาและการตรวจสอบ" footer.

## 6. Visual assets (G3 contract)

Implemented as SVG in `public/assets/diagrams/` from the G3 textual spec (not from memory of the scans). Manifest `content/diagrams.json` holds source page, ref image, caption, alt, provenance (EDITORIAL / D008), ✓/✗ semantics and status.

| ID | File | Used on | Status |
|---|---|---|---|
| V01 | V01_orientation_sun_wind_rain.svg | T03 | IMPLEMENTED_FROM_G3_SPEC_PENDING_CHATGPT_QA |
| V04 | V04_adobe_drop_test.svg | T09 | same |
| V06 | V06_soil_toughness.svg | T09, T07 | same |
| V07 | V07_lintels.svg | — (lintel topic not in P0) | same, shown on `/diagrams` |
| V08 | V08_window_water.svg | — (openings topic not in P0) | same, shown on `/diagrams` |
| V09 | V09_roof_slope.svg | T13 | same |
| V10 | V10_central_gutter.svg | T13 | same |
| V11 | V11_roof_water_wall.svg | T13 | same |

Symbol rule honoured: ✓/✗ drawn as symbols; OCR digits 4/8 never appear as labels (validator + unit test). 11 non-redraw figures (original scans) are rendered as placeholders with the certified original caption, listed on `/diagrams` — awaiting image files from 04_ภาพประกอบ.

## 7. QA / test results

| Check | Result |
|---|---|
| `npm ci` / install | OK (Node 22.22, npm 10.9) |
| `npm run validate` | OK — 26 topics, 8 diagrams, 0 warnings |
| `npm test` | 7/7 pass (mold sizes, cob dims, T18/T21 overrides, T26 era, validator, diagrams) |
| `npm run check` (astro check) | 0 errors, 0 warnings |
| `npm run build` | 36 pages, no errors |
| `npm run check:links` | 912 internal links across 36 pages, 0 broken |
| Heading/landmark audit (built HTML) | 1×h1, no skipped levels, `lang="th"`, skip link, `<main>`, all `<img>` have alt — all 36 pages |
| Mobile smoke (headless Chromium, 390 px) | home, adobe, price pages render without horizontal overflow; dark-mode tokens present |
| Safety blocks | present on all 26 topic pages |
| Secrets scan | no keys/tokens/private URLs committed; `.env*` ignored |
| GitHub Actions | `.github/workflows/ci.yml` runs the same pipeline on push/PR (not yet observed running — first push) |

## 8. Known limitations

- `/book` (ORIGINAL full text) and `read_original` links are not built — P2 scope; `read_original` ids are shown as codes with a note.
- Directory (`/directory`), network, community, gallery, guide: out of P0 / blocked by D002 (TEMP-DIR-01 not yet decided) and D009.
- Search is client-side substring/segmenter ranking over a static index; adequate for 26 pages, no fuzzy matching.
- Diagram SVGs are schematic renderings of the G3 spec; geometry has **not** been compared to the 300-dpi scans by me — that is the ChatGPT QA step.
- `ref_precision: PDF_RANGE` topics remain as certified (QA accepted them); page-side precision upgrade is a content task, not C2.
- V07/V08 have no P0 host page; they are reachable only via `/diagrams`.

## 9. CONTENT_CHANGE_REQUESTS (none applied — for ChatGPT decision)

No certified text was changed. Items observed while transcribing that ChatGPT may want to close:

1. **CCR-01 (id alias)** — T08, T13, T20 reference `wc-problem-termites`; the canonical SAFETY_FAQ id is `wc-faq-termites`. The site maps the alias in code (`aliases` field) and leaves the certified strings untouched. Suggest aligning the id in the Drive files.
2. **CCR-02 (era proposals)** — T11 (`statement-of-present`, cement 10%), T12 (`law` + `statement-of-present`), T15 (๓ เท่า/๒ เท่า, decision pending) are rendered as EraNotice **labelled "ข้อเสนอ — รอ ChatGPT ยืนยัน"**. Confirm or drop; no text was altered.
3. **CCR-03 (T12 Cordwood)** — the NEEDS_RECHECK sentence about log orientation is excluded per the certified note and QA report; nothing to change unless QA wants the "placed crosswise to wall" wording added.
4. **CCR-04 (T13 extra block)** — "รายละเอียดการเชื่อมผนังดินกับโครงหลังคา" is rendered as an extra block with its ref; confirm it belongs on the roof checklist page.

## 10. BLOCKED items

None for the build. Two process items could not be done from this session:
- Appending to the existing Google Docs **AI_JOB_LOG** and **00_AI_CONTROL_CENTER** (protocol §12): the connected Drive tool can create files but cannot edit existing Docs. The handoff document was created as a new file in 00_PROJECT_CONTROL instead; ChatGPT/Owner to append the log entry.
- The branch name `claude/c2-website-build` suggested in the prompt was not used because the session was pinned to `claude/baandin-website-p0-p0jxt9`; Owner may rename on GitHub if preferred.

## 11. Assets still waiting (Gemini / project)

- 11 original-scan figures (T03 ×2, T04, T07 ×2, T08 ×2, T10, T14 ×2 and the T08 beam section) — need image files from 04_ภาพประกอบ with D008 caption status.
- ChatGPT QA of the 8 SVGs against scans (geometry/labels), then status update in `content/diagrams.json`.

## 12. How to run

See `README.md`: `npm ci && npm run verify` (validate → check → build → link check), `npm run dev` for local preview.

## 13. Next action for ChatGPT (exact)

1. Pull branch `claude/baandin-website-p0-p0jxt9`, run `npm ci && npm run verify`.
2. Content QA pass on the rendered site (`npm run preview`): spot-check T09 mold sizes, T18 (10 items), T21 cards, T26 EraNotice, safety blocks.
3. Review 8 SVGs on `/diagrams` against scans; set each manifest `status` to QA_PASSED or return redraw notes.
4. Decide CCR-01…CCR-04 above.
5. Append AI_JOB_LOG / Control Center; then Owner decides merge to `main` and hosting (none configured).
