# จากดินสู่บ้าน — เว็บไซต์ P0

Static website for the project **จากดินสู่บ้าน** (knowledge base derived from the book
*จากดินสู่บ้าน สร้างบ้านด้วยดิน*, book context พ.ศ. 2548). This repository is the **code**
workspace (C2). The **content** source of truth stays in the certified project Google Drive
(Web Content P0 T01–T26, `WEB_QA_PASSED`); `content/web/` is a faithful transcription of it.

> Status: **P0 release QA passed** — C2 build → C4 label cleanup → C5/C5B diagram corrections → C6 visual QA 8/8 passed
> (`docs/C2_IMPLEMENTATION_REPORT.md`, `docs/DIAGRAMS_QA_STATUS.md`). Production branch: `main`.
> Content changes still require Owner + ChatGPT QA approval; deployment only from `main` with Owner authorization.

## Stack

| | |
|---|---|
| Framework | [Astro](https://astro.build) 7 (static output, zero client JS except `/search`) |
| Language | TypeScript (strict) + `.astro` components, plain CSS |
| Content | `content/web/**/*.json` — one file per topic, schema in `docs/CONTENT_SCHEMA.md` |
| Diagrams | `public/assets/diagrams/*.svg` — 8 redraw groups from the Gemini G3 spec, manifest `content/diagrams.json` |
| Checks | `scripts/validate-content.mjs`, `scripts/check-links.mjs`, `node --test`, `astro check` |

No analytics, fonts, or third-party scripts are loaded. Search runs client-side over a static JSON index.

## Local run / build

```bash
npm ci            # Node >= 20 (CI uses 22)
npm run dev       # http://localhost:4321
npm run verify    # validate → astro check → build → link check
npm run preview   # serve dist/
```

Individual steps: `npm run validate`, `npm test`, `npm run check`, `npm run build`, `npm run check:links`.

## Routes (P0)

| Route | Content |
|---|---|
| `/` | Home: three entry paths, sections, FAQ |
| `/start`, `/start/start-here`, `/start/design-principles` | T05 path (index), T02, T03 |
| `/materials/soil-types`, `/materials/soil-test` | T06, T07 |
| `/techniques` (T12 comparison), `/techniques/adobe`, `/techniques/cob`, `/techniques/rammed-earth` | T12, T09, T10, T11 |
| `/build/foundation-drainage`, `/build/plaster` | T08, T14 |
| `/checklists/site-selection`, `/checklists/roof-basics` | T04, T13 |
| `/problems` (T20 index), `/problems/mistakes-*`, `/problems/cracking-index` | T20, T15–T19, T21 |
| `/safety` | T22 |
| `/faq/what-is-earthhouse`, `/faq/termites`, `/faq/rain-melt`, `/faq/lifespan`, `/faq/price` | T01, T23–T26 |
| `/search`, `/search-index.json` | client-side search + filters |
| `/sources`, `/about`, `/diagrams`, `/404` | provenance, content policy (D006), diagram status |

## Content rules enforced in code

- Every topic is `provenance: EDITORIAL` and shows ORIGINAL / COMMUNITY / EDITORIAL badges (D006).
- Every claim, step, quantity, caution and table cell carries its certified source ref (`PDF nnL/R (หน้า)` / `MASTER:ชุดNN/…`).
- Numbers, Thai numerals, modality (ต้อง/ห้าม/ควร/ไม่ควร) and cautions are rendered verbatim; safety blocks are never collapsed.
- `era_notice` renders an EraNotice (พ.ศ. 2548) near the data, plus a page-level era bar (D005/D007).
- Directory / network data is not published (D002/D009); the validator has a privacy blocklist.
- Diagram ✓/✗ semantics follow the G3 spec; OCR digits 4/8 are never shown as labels.

Any change to technical facts, numbers, cautions, provenance, source refs or EraNotice must go back
to ChatGPT QA as a `CONTENT_CHANGE_REQUEST` before merge/publish.

## Repository layout

```
content/web/<section>/<slug>.json   certified topics (T01–T26)
content/diagrams.json               G3 diagram manifest
public/assets/diagrams/*.svg        redraw assets
src/lib/content.ts                  loader, types, labels, URL helpers
src/components/*.astro              KeyPoints/Steps/Ratios/Safety/SourceCite/EraNotice/Figure/Comparison/…
src/pages/                          routes
scripts/                            validation, link check, tests
docs/                               implementation report, content schema
```
