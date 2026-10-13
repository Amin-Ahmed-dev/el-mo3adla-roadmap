"""Width-based compression for PDFs with inflated page dimensions (English set).

Renders each page at a target pixel width (instead of DPI-relative-to-inflated
page boxes) as JPEG q80, with backup + auto-restore when no gain.
"""
import os
import shutil
import sys
from pathlib import Path

import pymupdf

ROOT = Path(r"public\pdfs\english")
BAK = Path(r"..\pdf-backups\rest\english-width")
TARGET_W = 1500  # px — verified visually indistinguishable from 2583px original
QUALITY = 80

BAK.mkdir(parents=True, exist_ok=True)
tb = ta = 0
for f in sorted(ROOT.glob("*.pdf")):
    dst = BAK / f.name
    shutil.copy2(f, dst)  # backup
    b = f.stat().st_size
    src = pymupdf.open(f)
    out = pymupdf.open()
    for pg in src:
        dpi = int(72 * TARGET_W / pg.rect.width)
        pix = pg.get_pixmap(dpi=dpi, alpha=False)
        jpg = pix.tobytes("jpeg", jpg_quality=QUALITY)
        np = out.new_page(width=pix.width * 72 / dpi, height=pix.height * 72 / dpi)
        np.insert_image(np.rect, stream=jpg)
    src.close()
    tmp = f.with_suffix(".tmp.pdf")
    out.save(tmp, garbage=4, deflate=True)
    out.close()
    a = tmp.stat().st_size
    if a >= b:  # no benefit -> restore
        tmp.unlink()
        a = b
        print(f"{f.name}: {b/1048576:.2f} -> no gain, restored", flush=True)
    else:
        os.replace(tmp, f)
        print(f"{f.name}: {b/1048576:.2f} -> {a/1048576:.2f} MB (-{round((1-a/b)*100)}%)", flush=True)
    tb += b
    ta += a

print(f"\nTOTAL: {tb/1048576:.1f} -> {ta/1048576:.1f} MB (-{round((1-ta/tb)*100)}%)")
