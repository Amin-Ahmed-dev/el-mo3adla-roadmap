import io
import os

import pymupdf
from PIL import Image, ImageChops

BAK = r"e:\IBM Build Skills\cs-equivalency-react-project\pdf-backups\physics-books"
NEW = r"public\pdfs\physics"

ok = True
for f in sorted(os.listdir(BAK)):
    d1 = pymupdf.open(os.path.join(BAK, f))
    d2 = pymupdf.open(os.path.join(NEW, f))
    same_pages = len(d1) == len(d2)
    p1 = Image.open(io.BytesIO(d1[len(d1) // 2].get_pixmap(dpi=90, alpha=False).tobytes("png")))
    p2 = Image.open(io.BytesIO(d2[len(d2) // 2].get_pixmap(dpi=90, alpha=False).tobytes("png")))
    diff = ImageChops.difference(p1.convert("L"), p2.convert("L"))
    mad = sum(diff.get_flattened_data()) / (p1.width * p1.height)
    good = same_pages and mad < 6
    if not good:
        ok = False
    print(
        f"{f}: pages {len(d1)}=={len(d2)} {'yes' if same_pages else 'NO'} "
        f"| mid-page diff {mad:.2f}/255 -> {'OK' if good else 'FAIL'}"
    )
    d1.close()
    d2.close()
print("ALL OK" if ok else "PROBLEMS FOUND")
