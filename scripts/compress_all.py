"""Compress all remaining scanned PDFs (english, math-1, math-2, physics practice).

- Backs up originals first (../pdf-backups/rest/).
- Auto-restores any file that does not shrink (never makes things worse).
- Skips already-compressed physics books (ph-c*-book.pdf).
"""
import os
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from compress_pdfs import compress  # noqa: E402

ROOT = Path(r"public\pdfs")
BAK = Path(r"..\pdf-backups\rest")
SKIP = {"ph-c1-book.pdf", "ph-c2-book.pdf", "ph-c3-book.pdf", "ph-c4-book.pdf",
        "ph-c5-book.pdf", "ph-c6-book.pdf", "ph-c7-book.pdf", "ph-c8-book.pdf"}

BAK.mkdir(parents=True, exist_ok=True)
files = [f for folder in sorted(ROOT.iterdir()) if folder.is_dir()
         for f in sorted(folder.glob("*.pdf")) if f.name not in SKIP]

print(f"{len(files)} files to compress", flush=True)
tb = ta = 0
restored = []
for f in files:
    rel = f.relative_to(ROOT)
    dst = BAK / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(f, dst)                      # backup before touching
    b, a = compress(f, 150, 80)
    if a >= b:                                # no benefit -> restore original
        shutil.copy2(dst, f)
        restored.append(f.name)
        a = b
    tb += b; ta += a
    print(f"{rel}: {b/1048576:.2f} -> {a/1048576:.2f} MB (-{round((1-a/b)*100)}%)"
          + ("  [restored, no gain]" if f.name in restored else ""), flush=True)

print(f"\nTOTAL: {tb/1048576:.1f} -> {ta/1048576:.1f} MB (-{round((1-ta/tb)*100)}%)")
if restored:
    print("Restored (no gain):", ", ".join(restored))
