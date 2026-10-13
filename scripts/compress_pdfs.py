#!/usr/bin/env python3
"""Compress scanned PDF books for web delivery (physics, etc.).

- Re-encodes embedded images (the bloat in scanned books) via PyMuPDF.
- Usage: python scripts/compress_pdfs.py <source-glob-dir> [dpi_target] [quality]
- Originals MUST be backed up manually before running; this script overwrites in place.
"""
import sys
import os
from pathlib import Path

import pymupdf


def compress(path: Path, dpi_target: int, quality: int) -> tuple[int, int]:
    """Rebuild a scanned PDF: re-render every page at dpi_target as JPEG(quality).

    Safe for pure-scan PDFs (no selectable text) — content is pixel-identical
    apart from JPEG compression artifacts (~3/255 mean diff at q80).
    """
    before = path.stat().st_size
    src = pymupdf.open(path)
    out = pymupdf.open()
    for pg in src:
        pix = pg.get_pixmap(dpi=dpi_target, alpha=False)
        jpg = pix.tobytes("jpeg", jpg_quality=quality)
        np = out.new_page(width=pix.width * 72 / dpi_target, height=pix.height * 72 / dpi_target)
        np.insert_image(np.rect, stream=jpg)
    src.close()
    tmp = path.with_suffix(".tmp.pdf")
    out.save(tmp, garbage=4, deflate=True)
    out.close()
    os.replace(tmp, path)  # atomic in-place swap
    return before, path.stat().st_size


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    folder = Path(sys.argv[1])
    dpi_target = int(sys.argv[2]) if len(sys.argv) > 2 else 150
    quality = int(sys.argv[3]) if len(sys.argv) > 3 else 80

    files = sorted(folder.glob("*.pdf"))
    if not files:
        print(f"No PDFs in {folder}")
        sys.exit(1)

    total_before = total_after = 0
    for f in files:
        b, a = compress(f, dpi_target, quality)
        total_before += b
        total_after += a
        pct = round((1 - a / b) * 100) if b else 0
        print(f"{f.name}: {b/1048576:.1f} MB -> {a/1048576:.1f} MB (-{pct}%)")

    print(
        f"\nTOTAL: {total_before/1048576:.1f} MB -> {total_after/1048576:.1f} MB "
        f"(-{round((1-total_after/total_before)*100)}%)"
    )


if __name__ == "__main__":
    main()
