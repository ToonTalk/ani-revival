"""Render PDF pages to PNG for OCR and for viewing.

Usage: python -I tools/render_pages.py <pdf> <out-dir> [dpi] [first-last]
"""
import os
import sys

import pymupdf

pdf, out = sys.argv[1], sys.argv[2]
dpi = int(sys.argv[3]) if len(sys.argv) > 3 else 200
doc = pymupdf.open(pdf)
first, last = 1, len(doc)
if len(sys.argv) > 4:
    first, last = (int(x) for x in sys.argv[4].split("-"))
os.makedirs(out, exist_ok=True)
for i in range(first - 1, last):
    doc[i].get_pixmap(dpi=dpi, colorspace=pymupdf.csGRAY).save(os.path.join(out, f"p{i + 1:03}.png"))
print(f"rendered pages {first}-{last} of {len(doc)} at {dpi} dpi -> {out}")
