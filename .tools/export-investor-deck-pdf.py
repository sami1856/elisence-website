#!/usr/bin/env python3
"""High-quality print PDF export for elisence-investor-deck.html (12 slides, landscape)."""
from __future__ import annotations

import base64
import json
import os
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DECK_HTML = ROOT / "elisence-investor-deck.html"
PDF_NAME = "Elisence_Investor_Deck_WebSummit_2026.pdf"
AUDIT = ROOT / "audit" / "investor-deck-pdf-export"
PROOF_FIRST = AUDIT / "pdf-proof-page-01.png"
PROOF_LAST = AUDIT / "pdf-proof-page-12.png"
REPORT = AUDIT / "export-report.json"

PRINT_BOOST_CSS = """
@page { size: 13.333in 7.5in; margin: 0; }
@media print {
  html.deck-magnetic-active,
  html.deck-magnetic-active body {
    position: static !important;
    inset: auto !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
  }
  .deck-viewport {
    position: static !important;
    height: auto !important;
    overflow: visible !important;
  }
  .deck-track {
    transform: none !important;
    display: block !important;
  }
  html.deck-magnetic-active .slide,
  .deck-track > .slide {
    height: 100vh !important;
    min-height: 100vh !important;
    max-height: 100vh !important;
    overflow: hidden !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    box-sizing: border-box !important;
  }
  .deck-track > .slide:last-child,
  #slide-12 {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }
}
"""


def desktop_path() -> Path:
    desk = Path(os.environ.get("USERPROFILE", "")) / "Desktop"
    if desk.is_dir():
        return desk
    try:
        import winreg

        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders",
        )
        val, _ = winreg.QueryValueEx(key, "Desktop")
        winreg.CloseKey(key)
        return Path(os.path.expandvars(val))
    except OSError:
        return desk


def export_pdf() -> tuple[Path, int]:
    from selenium import webdriver
    from selenium.webdriver.edge.options import Options

    out = desktop_path() / PDF_NAME
    file_url = DECK_HTML.resolve().as_uri()

    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--window-size=1920,1080")
    driver = webdriver.Edge(options=opts)

    try:
        driver.get(file_url)
        time.sleep(2.5)
        slide_count = driver.execute_script(
            "return document.querySelectorAll('.deck-track > .slide').length;"
        )
        driver.execute_cdp_cmd("Emulation.setEmulatedMedia", {"media": "print"})
        driver.execute_script(
            """
            const s = document.createElement('style');
            s.textContent = arguments[0];
            document.head.appendChild(s);
            """,
            PRINT_BOOST_CSS,
        )
        time.sleep(0.8)
        # 13.333in x 7.5in @ 96dpi
        result = driver.execute_cdp_cmd(
            "Page.printToPDF",
            {
                "printBackground": True,
                "preferCSSPageSize": True,
                "paperWidth": 13.333,
                "paperHeight": 7.5,
                "marginTop": 0,
                "marginBottom": 0,
                "marginLeft": 0,
                "marginRight": 0,
                "landscape": False,
                "scale": 1,
                "displayHeaderFooter": False,
            },
        )
        pdf_bytes = base64.b64decode(result["data"])
        out.write_bytes(pdf_bytes)
    finally:
        driver.quit()

    if not out.is_file() or out.stat().st_size < 50_000:
        raise RuntimeError(f"PDF export failed or too small: {out}")
    return out, int(slide_count)


def validate_pdf(pdf_path: Path) -> dict:
    from pypdf import PdfReader

    reader = PdfReader(str(pdf_path))
    pages = len(reader.pages)
    meta = {
        "path": str(pdf_path),
        "bytes": pdf_path.stat().st_size,
        "pages": pages,
        "expected_pages": 12,
        "pages_ok": pages == 12,
    }

    AUDIT.mkdir(parents=True, exist_ok=True)
    import pypdfium2 as pdfium

    doc = pdfium.PdfDocument(str(pdf_path))
    page_count = len(doc)
    scale = 2.0
    for idx, out_path in ((0, PROOF_FIRST), (page_count - 1, PROOF_LAST)):
        page = doc[idx]
        bitmap = page.render(scale=scale)
        bitmap.to_pil().save(str(out_path))
    meta["proof_first"] = str(PROOF_FIRST)
    meta["proof_last"] = str(PROOF_LAST)
    doc.close()

    REPORT.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    return meta


def main() -> int:
    if not DECK_HTML.is_file():
        print(f"Missing deck: {DECK_HTML}", file=sys.stderr)
        return 1

    pdf_path, slides = export_pdf()
    meta = validate_pdf(pdf_path)
    meta["html_slides"] = slides
    print(json.dumps(meta, indent=2))

    if not meta["pages_ok"]:
        print(f"ERROR: expected 12 pages, got {meta['pages']}", file=sys.stderr)
        return 1
    print(f"Saved: {pdf_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
