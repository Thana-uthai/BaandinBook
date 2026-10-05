# Diagram QA status (G3 redraws)

Per-diagram visual QA state of the 8 redrawn SVGs in `public/assets/diagrams/`.
Authoritative data: `content/diagrams.json` (`status` per item, vocabulary in `_status_vocab`).
`npm run validate` rejects any status not in that vocabulary.

Source of the QA findings: `00_PROJECT_CONTROL/02_ACTIVE_PROMPTS/C5_VISUAL_QA_REPORT_AND_CLAUDE_CORRECTION_PROMPT`
(ChatGPT, JOB-20261005-CLAUDECODE-07), which inspected the actual book scans against the C2 SVGs.

| id | file | source | status (C5) |
|---|---|---|---|
| V01 | V01_orientation_sun_wind_rain.svg | PDF 031 / p.๕๙ | CHATGPT_SOURCE_VISUAL_QA_PASSED |
| V04 | V04_adobe_drop_test.svg | PDF 042 / p.๘๑ | CHATGPT_SOURCE_VISUAL_QA_PASSED |
| V06 | V06_soil_toughness.svg | PDF 044 / p.๘๔ | CHATGPT_SOURCE_VISUAL_QA_PASSED |
| V07 | V07_lintels.svg | **PDF 055** / p.๑๐๗ (was wrongly PDF 056) | IMPLEMENTED_C5_CORRECTION_PENDING_CHATGPT_FINAL_VISUAL_QA |
| V08 | V08_window_water.svg | PDF 057 / p.๑๑๐ | CHATGPT_SOURCE_VISUAL_QA_PASSED |
| V09 | V09_roof_slope.svg | PDF 059 / p.๑๑๔ | CHATGPT_SOURCE_VISUAL_QA_PASSED |
| V10 | V10_central_gutter.svg | PDF 059 / p.๑๑๕ (upper) | CHATGPT_SOURCE_VISUAL_QA_PASSED |
| V11 | V11_roof_water_wall.svg | PDF 059 / p.๑๑๕ (lower right) | IMPLEMENTED_C5_CORRECTION_PENDING_CHATGPT_FINAL_VISUAL_QA |

The six PASS drawings were not touched in C5. The retired C2 status
`IMPLEMENTED_FROM_G3_SPEC_PENDING_CHATGPT_QA` no longer applies to any diagram.

## C5 corrections

### V07 ลักษณะของทับหลังในแบบต่าง ๆ

- **Before (C2, per G3 spec):** 3 panels — lintel extending ≥ 15 cm into the wall on each side (✓),
  lintel cut flush with the frame (✗), and an arch. Source metadata said PDF 056.
- **After (C5):** 4 panels in source order, drawn as wall sections with the outside on the left:
  1. ทับหลังแบบเรียบ — plain lintel, water follows the surface under it → ✗ (source 8)
  2. ทับหลังมีบัวหยดน้ำและแผ่นไม้ — wood board with a drip moulding, water drips clear → ✓ (source 4)
  3. ทับหลังไม้ท่อนใหญ่ — one large log → ✓ (source 4)
  4. ทับหลังไม้ท่อนเล็ก — several small logs → ✓ (source 4)
  The arch panel and the "≥ 15 cm each side" dimension were removed (not in the source figure).
  The adjacent book text "lintel should be at least 15 cm wide" is shown only as a footnote line
  labelled as book text, not as part of the figure. Source metadata and `ref_image` now say PDF 055 /
  `pdfหน้า055.jpg`; book page ๑๐๗ unchanged.
- **Caveat for ChatGPT final QA:** `04_ภาพประกอบ` on Drive has no `pdfหน้า055.jpg`, so V07 was drawn
  from the C5 textual findings (terminology and ✓/✗ per variant), not from the scan itself. The exact
  geometry of each variant in the book could not be checked by Claude Code.

### V11 น้ำจากหลังคาโดนผนังดิน

- **Before (C2, per G3 spec):** 2 panels — short eave with rain hitting the wall (✗) vs long eave with a
  drainage trench (✓). The ✓ panel does not exist in the source.
- **After (C5):** the single warning configuration from the scan (`pdfหน้า059.jpg`, lower right):
  two gable roofs side by side, inner eaves facing each other, roof runoff from both sides falling onto
  the earthen wall standing between them, water pooling and splashing at the wall head, ✗ (source 8).
  Caption verbatim: "ระวังน้ำที่ไหลจากหลังคาโดนผนังดิน จะทำให้พังเร็ว". No ✓ panel; no eave-length or
  trench advice is depicted. The `ok` symbol was removed from the SVG so no ✓ can be rendered.

## Rules kept

- Provenance EDITORIAL (D008) on every diagram; book page / PDF references on every diagram.
- `<title>`, `<desc>`, manifest `alt` and `caption` updated to match the corrected semantics.
- OCR digits 4/8 are never shown as labels; ✓/✗ symbols use the shared `ok` / `no` symbol ids.
