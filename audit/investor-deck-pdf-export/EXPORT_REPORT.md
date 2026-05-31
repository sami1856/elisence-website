# Elisence Investor Deck — PDF Export Report

**Source:** `elisence-investor-deck.html` (Slides 01–12)  
**Method:** Chromium print-to-PDF via Edge CDP (`Page.printToPDF`) — vector text, `printBackground: true`, print media emulation. **Not** screenshot-based.

## Output

| Item | Value |
|------|--------|
| **Desktop PDF** | `C:\Users\sami\Desktop\Elisence_Investor_Deck_WebSummit_2026.pdf` |
| **Pages** | 12 |
| **Size** | ~8.4 MB |
| **Orientation** | Landscape 16:9 (13.333in × 7.5in) |
| **Scale** | 1920×1080 viewport, deviceScaleFactor 2 in browser session |

## Validation

- [x] 12 slides exported in order 01 → 12
- [x] One slide per page
- [x] Print backgrounds / dark theme preserved
- [x] No extra blank page
- [x] Proof renders: `pdf-proof-page-01.png`, `pdf-proof-page-12.png`

## Script

`.tools/export-investor-deck-pdf.py`
