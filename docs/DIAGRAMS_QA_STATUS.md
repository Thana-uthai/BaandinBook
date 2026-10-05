# Diagram QA status (G3 redraws)

Per-diagram visual QA state of the 8 redrawn SVGs in `public/assets/diagrams/`.
Authoritative data: `content/diagrams.json` (`status` per item, vocabulary in `_status_vocab`).
`npm run validate` rejects any status not in that vocabulary.

Source of the QA findings: `00_PROJECT_CONTROL/02_ACTIVE_PROMPTS/C5_VISUAL_QA_REPORT_AND_CLAUDE_CORRECTION_PROMPT`
(ChatGPT, JOB-20261005-CLAUDECODE-07), which inspected the actual book scans against the C2 SVGs.

| id | file | source | status (after C5B final QA) |
|---|---|---|---|
| V01 | V01_orientation_sun_wind_rain.svg | PDF 031 / p.๕๙ | CHATGPT_SOURCE_VISUAL_QA_PASSED |
| V04 | V04_adobe_drop_test.svg | PDF 042 / p.๘๑ | CHATGPT_SOURCE_VISUAL_QA_PASSED |
| V06 | V06_soil_toughness.svg | PDF 044 / p.๘๔ | CHATGPT_SOURCE_VISUAL_QA_PASSED |
| V07 | V07_lintels.svg | **PDF 055** / p.๑๐๗ (was wrongly PDF 056) | CHATGPT_SOURCE_VISUAL_QA_PASSED (C5B final QA) |
| V08 | V08_window_water.svg | PDF 057 / p.๑๑๐ | CHATGPT_SOURCE_VISUAL_QA_PASSED |
| V09 | V09_roof_slope.svg | PDF 059 / p.๑๑๔ | CHATGPT_SOURCE_VISUAL_QA_PASSED |
| V10 | V10_central_gutter.svg | PDF 059 / p.๑๑๕ (upper) | CHATGPT_SOURCE_VISUAL_QA_PASSED |
| V11 | V11_roof_water_wall.svg | PDF 059 / p.๑๑๕ (lower right) | CHATGPT_SOURCE_VISUAL_QA_PASSED (C5B final QA) |

The six PASS drawings were not touched in C5/C5B. ChatGPT re-inspected the C5B drawings of V07 and V11
against the scans and returned `C5B_FINAL_VISUAL_QA_PASSED`; the Owner approved merging PR #2 at head `c95b37c`.
All 8 diagrams now hold `CHATGPT_SOURCE_VISUAL_QA_PASSED` (V07/V11 additionally carry `qa_confirmed_by`).
The retired statuses `IMPLEMENTED_FROM_G3_SPEC_PENDING_CHATGPT_QA` (C2) and
`IMPLEMENTED_C5_CORRECTION_PENDING_CHATGPT_FINAL_VISUAL_QA` (C5/C5B) no longer apply to any diagram.

## C5 corrections

### V07 ลักษณะของทับหลังในแบบต่าง ๆ

- **Before (C2, per G3 spec):** 3 panels — lintel extending ≥ 15 cm into the wall on each side (✓),
  lintel cut flush with the frame (✗), and an arch. Source metadata said PDF 056.
- **After (C5, revised in C5B):** a vertical sectional schematic, four variants stacked top-to-bottom in
  source order, each showing wall above the opening / lintel / วงกบ / opening:
  1. แบบที่ ๑ — plain flat lintel on the frame → ✗ (source 8)
  2. แบบที่ ๒ — แผ่นไม้ with บัวหยดน้ำ → ✓ (source 4)
  3. แบบที่ ๓ — ไม้ท่อนใหญ่ → ✓ (source 4)
  4. แบบที่ ๔ — ไม้ท่อนเล็ก (several logs) → ✓ (source 4)
  Only the source labels are used (วงกบ, แผ่นไม้, บัวหยดน้ำ, ไม้ท่อนใหญ่, ไม้ท่อนเล็ก). The C5 draft's
  rain, blue water arrows/drops, "ภายนอก/ภายใน" labels and water-behaviour claims were removed in C5B
  as unsupported visual inference. The arch panel and the "≥ 15 cm each side" dimension are not drawn.
  The adjacent book text "lintel should be at least 15 cm wide" appears only as a footnote line
  labelled as book text, not as figure geometry. Source metadata and `ref_image` say PDF 055 /
  `pdfหน้า055.jpg`; book page ๑๐๗ unchanged.
- **Caveat for ChatGPT final QA:** `04_ภาพประกอบ` on Drive has no `pdfหน้า055.jpg`, so V07 was drawn
  from the C5/C5B textual findings (variant order, labels, ✓/✗), not from the scan itself.

### V11 น้ำจากหลังคาโดนผนังดิน

- **Before (C2, per G3 spec):** 2 panels — short eave with rain hitting the wall (✗) vs long eave with a
  drainage trench (✓). The ✓ panel does not exist in the source.
- **After (C5, revised in C5B):** the single warning configuration from the scan (`pdfหน้า059.jpg`,
  p.๑๑๕ lower figure): two building portions side by side / offset, the eave of the left roof pointing at
  the adjacent portion, runoff from that roof striking the earthen wall of the adjacent portion, ✗
  (source 8). Rain is kept (present in the source). The C5 draft's symmetric "both roofs drain onto a
  central freestanding wall" construction and the base-erosion detail were removed in C5B.
  Caption verbatim: "ระวังน้ำที่ไหลจากหลังคาโดนผนังดิน จะทำให้พังเร็ว". No ✓ panel; no eave-length or
  trench advice is depicted. The `ok` symbol is absent from the SVG so no ✓ can be rendered. The adjacent
  book text (p.๑๑๕ §๓) warns not to let the eave face a direction where the water meets the house wall.

## Rules kept

- Provenance EDITORIAL (D008) on every diagram; book page / PDF references on every diagram.
- `<title>`, `<desc>`, manifest `alt` and `caption` updated to match the corrected semantics.
- OCR digits 4/8 are never shown as labels; ✓/✗ symbols use the shared `ok` / `no` symbol ids.
