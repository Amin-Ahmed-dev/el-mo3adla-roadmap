"""Classify remaining PDFs: pure scan vs real text/vector (drives compression choice)."""
from pathlib import Path

import pymupdf

ROOT = Path(r"public\pdfs")

for folder in sorted(ROOT.iterdir()):
    if not folder.is_dir():
        continue
    scans, text, mixed = [], [], []
    for f in sorted(folder.glob("*.pdf")):
        d = pymupdf.open(f)
        tchars = sum(len(pg.get_text().strip()) for pg in d)
        npages = len(d)
        has_imgs = any(pg.get_images(full=True) for pg in d)
        d.close()
        if tchars < 50:
            scans.append(f.name)          # no real text -> pure scan
        elif tchars > 200 * npages:
            text.append(f.name)           # text-dominant
        else:
            mixed.append((f.name, tchars, npages))
    print(f"[{folder.name}] scans={len(scans)} text={len(text)} mixed={len(mixed)}")
    for n in scans:
        print(f"  SCAN  {n}")
    for n in text:
        print(f"  TEXT  {n}")
    for n, t, p in mixed:
        print(f"  MIXED {n} ({t} chars / {p} pages)")
