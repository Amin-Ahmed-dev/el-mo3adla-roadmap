"""Rebuild a scanned PDF page-by-page as compressed JPEGs.

Each page is rendered at the given target pixel width and re-encoded with
Pillow at an explicit JPEG quality; page size is kept.
Usage: python scripts/compress-scanned-pdf.py <in.pdf> <out.pdf> [width_px] [quality]
"""
import io
import sys
import pymupdf
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
width_px = int(sys.argv[3]) if len(sys.argv) > 3 else 1500
quality = int(sys.argv[4]) if len(sys.argv) > 4 else 75

old = pymupdf.open(src)
new = pymupdf.open()
for page in old:
    # Page boxes are pixel-as-point on these scans, so scale by width.
    scale = width_px / page.rect.width
    pix = page.get_pixmap(matrix=pymupdf.Matrix(scale, scale), alpha=False)
    im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=quality)
    p = new.new_page(width=page.rect.width, height=page.rect.height)
    p.insert_image(p.rect, stream=buf.getvalue())
old.close()
new.save(dst, deflate=True, garbage=3)
new.close()
print("done")

