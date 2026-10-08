"""Extract the flipbook printed in the page corners of AI-TR-540 and rebuild it.

Ken's thesis, "Creation of Computer Animation from Story Descriptions" (1979), carries frames of
Ani's Cinderella film in the outer corners of its pages: the upper and lower left corners of even
pages and the upper and lower right corners of odd pages. Each corner is a separate run of
frames; played upper left, lower left, upper right, lower right (as the thesis says on page 17),
they make the whole film.

Each page's embedded 1-bit scan (about 600 dpi) is used at full resolution. A frame is found by
its two long dotted vertical borders, which text cannot imitate; robust line fits to them give
the frame's left and right edges and the scan's skew, and where they start and end gives its top
and bottom (the horizontal borders barely printed, but are used when they show). The frame is
then resampled, nearest pixel, so that its rectangle has the same size and place in every output
image; the corners' scan scale differs by up to about 1%.

Outputs, in sources/flipbook/:
    frames/pNNN-<corner>.png   every frame, 1-bit, at full resolution; corner = ul, ll, ur or lr;
                               the rectangle is always at (24, 24), 824 x 621 pixels
    frames.json                where each frame was found, and how confidently
    contact-sheet.png          every frame by page number, grouped by corner and scene
    flipbook.gif               the four corners in viewing order at half size, about 8 fps,
                               labeled with scene, corner and page
    flipbook.mp4               the same as video

In the GIF and MP4 (not the PNGs) everything outside the rectangle is blanked, the scanned
dotted border is replaced by a drawn one so it doesn't flicker, and the ink is grown by one pixel
so the thin broken lines read at half size.

Usage (run with python -I):
    python -I tools/flipbook.py                  everything (about three minutes)
    python -I tools/flipbook.py --pages 3-40     only the frames of these pages
    python -I tools/flipbook.py --no-extract     rebuild the sheet, GIF and MP4 from frames/
    python -I tools/flipbook.py --delay 22       GIF and MP4 at the film's own pace (0.22 s a frame)
"""

import argparse
import json
import os
import shutil
import struct
import subprocess
import sys
import tempfile
import zlib
from concurrent.futures import ProcessPoolExecutor

import numpy as np
import pymupdf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = r"C:\Users\toont\Documents\MIT-AI-Lab\AITR-540 (1).pdf"
OUT = os.path.join(ROOT, "sources", "flipbook")
MAGICK = "magick"
FFMPEG = r"C:\Program Files\CEWE Creator\CEWE Creator\ffmpeg.exe"

# Viewing order, as the thesis says on page 17: "starting in the upper left, then the lower
# left, upper right and finally the lower right." (Chapter II's page references give the
# corners mirrored; the frames themselves follow page 17.)
CORNERS = [("ul", "upper left"), ("ll", "lower left"), ("ur", "upper right"), ("lr", "lower right")]

# Frame geometry, in pixels at the scan's 600 dpi.
FRAME_W = 824            # output width of the frame rectangle (median measured width is 825)
ASPECT = 0.754           # rectangle height / width, measured where all four borders show
FRAME_H = round(FRAME_W * ASPECT)
MARGIN = 24              # white space kept around the rectangle in every output frame
WMIN, WMAX = 812, 838    # plausible measured widths
COUNT_H = 600            # height over which line evidence is counted when searching for borders
CAP = 450                # most evidence one border may contribute (so one solid rule can't win)
MIN_EVIDENCE = 20        # least evidence the weaker border must have
MIN_SCORE = 100          # least combined evidence for a frame
MIN_SPREAD = 5           # of the 15 stretches of 40 rows along each border, how many must show it

# The film's five scenes (thesis Chapter II) and the frames that carry them:
# (scene, corner, first page, last page). Chapter II's page ranges agree with the frames, but it
# names the opposite corner ("the upper right corner from page 3 to the end" for the frames in
# the upper left of pages 4 to 298). Each scene opens with a blank frame, the cut, which falls on
# a page between two of Chapter II's ranges.
SCENES = [
    ("Introduction", "ul", 4, 298),
    ("Introduction", "ll", 4, 82),
    ("Kept Apart", "ll", 84, 310),
    ("No Longer Kept Apart", "ur", 3, 37),
    ("Meeting", "ur", 39, 289),
    ("Meeting", "lr", 3, 95),
    ("Justice", "lr", 97, 257),
]

GIF_SCALE = 2            # GIF and MP4 frames are 1/2 size
GIF_DELAY = 12           # hundredths of a second per frame: about 8 fps (the film's own pace is about 4.5)
END_HOLD = 150           # hundredths of a second the last frame stays before the GIF loops
BAND = 7                 # in the GIF and MP4, the scanned border (this many pixels each side) is redrawn
THUMB_SCALE = 6          # contact-sheet thumbnails are 1/6 size


def corner_name(code):
    return dict(CORNERS)[code]


def corners_of_page(p):
    if p < 3:
        return []
    return ["ul", "ll"] if p % 2 == 0 else ["ur", "lr"]


# ---------------------------------------------------------------------------
# Finding a frame

def page_ink(doc, p):
    """The page's embedded scan (the same pixels doc.extract_image gives) as booleans, True = black."""
    imgs = doc[p - 1].get_images(full=True)
    if len(imgs) != 1:
        raise ValueError(f"page {p}: expected one image, found {len(imgs)}")
    pm = pymupdf.Pixmap(doc, imgs[0][0])
    if pm.n != 1:
        raise ValueError(f"page {p}: expected a 1-component image")
    a = np.frombuffer(pm.samples, np.uint8).reshape(pm.height, pm.stride)[:, :pm.width]
    return a < 128


def _any_cols(cs, a, b):
    """For every column x: is there ink in columns x+a .. x+b? (cs: row-wise cumulative sums, zero column first)"""
    w = cs.shape[1] - 1
    x = np.arange(w)
    return (cs[:, np.clip(x + b + 1, 0, w)] - cs[:, np.clip(x + a, 0, w)]) > 0


def line_evidence(ink):
    """True where a pixel could belong to a thin vertical line: ink within 2 pixels across, and
    none 5 to 12 pixels to either side. Dotted borders pass; text and solid areas mostly don't."""
    cs = np.zeros((ink.shape[0], ink.shape[1] + 1), np.int32)
    np.cumsum(ink, axis=1, dtype=np.int32, out=cs[:, 1:])
    return _any_cols(cs, -2, 2) & ~(_any_cols(cs, -12, -5) | _any_cols(cs, 5, 12))


def search_window(shape, corner):
    """Where a corner frame's left border and top edge can be (generous; the frames found span less
    than half of each range)."""
    h, w = shape
    xl = (300, 800) if corner[1] == "l" else (w - 1600, w - 1000)
    yt = (200, 850) if corner[0] == "u" else (h - 1100, h - 650)
    return xl, yt


def coarse_frame(ink, corner):
    """Find the frame's two dotted vertical borders: the pair of columns, one frame-width apart,
    with the most line evidence over a frame's height."""
    (xa, xb), (ya, yb) = search_window(ink.shape, corner)
    y1, y2 = max(0, ya), min(ink.shape[0], yb + FRAME_H + 40)
    x1, x2 = max(0, xa - 15), min(ink.shape[1], xb + WMAX + 15)
    ev = line_evidence(ink[y1:y2, x1:x2])
    cum = np.zeros((ev.shape[0] + 1, ev.shape[1]), np.int32)
    np.cumsum(ev, axis=0, dtype=np.int32, out=cum[1:])
    tops = np.arange(0, min(yb - y1, ev.shape[0] - COUNT_H - 20), 2)
    count = cum[tops + 10 + COUNT_H] - cum[tops + 10]           # evidence per column, frame-high window
    lefts = np.arange(xa - x1, min(xb - x1, count.shape[1] - WMAX - 1))
    left = count[:, lefts]
    right = np.full_like(left, -1)
    rw = np.zeros_like(left)
    for wd in range(WMIN, WMAX + 1):
        cand = count[:, lefts + wd]
        better = cand > right
        right[better] = cand[better]
        rw[better] = wd
    score = np.minimum(left, CAP) + np.minimum(right, CAP)
    score[np.minimum(left, right) < MIN_EVIDENCE] = -1
    i, j = np.unravel_index(np.argmax(score), score.shape)
    if score[i, j] < MIN_SCORE:
        return None
    # A dotted border has evidence all along it; text only in the bands of its lines.
    spread = []
    for col in (lefts[j], lefts[j] + rw[i, j]):
        along = ev[tops[i] + 10:tops[i] + 10 + COUNT_H, col - 3:col + 4].any(axis=1)
        spread.append(int(along[:COUNT_H // 40 * 40].reshape(-1, 40).any(axis=1).sum()))
    if min(spread) < MIN_SPREAD:
        return None
    xl = int(lefts[j] + x1)
    return dict(xl=xl, xr=xl + int(rw[i, j]), yt=int(tops[i] + y1), yb=int(tops[i] + y1 + FRAME_H),
                evidence=[int(left[i, j]), int(right[i, j])], spread=spread)


def _fit_line(main, cross, c0, tol_init=14, tol=3.0, iters=5):
    """Robust least-squares fit cross = a + b * (main - mc) to the ink pixels near cross = c0."""
    m = np.abs(cross - c0) <= tol_init
    if m.sum() < 15:
        return None
    mains, crosses = main[m].astype(float), cross[m].astype(float)
    mc = float(mains.mean())
    a, b = float(np.median(crosses)), 0.0
    for it in range(iters):
        res = crosses - (a + b * (mains - mc))
        keep = np.abs(res) <= (tol_init if it == 0 else tol)
        if keep.sum() < 15:
            return None
        A = np.vstack([np.ones(keep.sum()), mains[keep] - mc]).T
        a, b = (float(v) for v in np.linalg.lstsq(A, crosses[keep], rcond=None)[0])
    return dict(a=a, b=b, mc=mc, n=int(keep.sum()))


def locate_frame(ink, corner):
    """Find a corner frame's rectangle. Returns its geometry, or None if there is no frame."""
    c = coarse_frame(ink, corner)
    if c is None:
        return None
    xl, xr, yt, yb = c["xl"], c["xr"], c["yt"], c["yb"]
    y1, y2 = max(0, yt - 60), min(ink.shape[0], yb + 60)
    fits = {}
    for name, x0 in (("L", xl), ("R", xr)):
        yy, xx = np.nonzero(ink[y1:y2, x0 - 20:x0 + 21])
        fits[name] = _fit_line(yy + y1, xx + x0 - 20, x0)
    good = [f for f in fits.values() if f]
    if not good:
        return None
    # The scan's skew, as the slope dx/dy shared by both vertical borders.
    b = sum(f["b"] * f["n"] for f in good) / sum(f["n"] for f in good)
    yc = (yt + yb) / 2.0
    xs = {n: (f["a"] + f["b"] * (yc - f["mc"])) if f else None for n, f in fits.items()}
    if xs["L"] is None:
        xs["L"] = xs["R"] - (xr - xl)
    if xs["R"] is None:
        xs["R"] = xs["L"] + (xr - xl)
    xc = (xs["L"] + xs["R"]) / 2.0
    k = 1.0 / np.sqrt(1.0 + b * b)

    # Frame coordinates: u along the horizontal borders, v along the vertical ones.
    X1, X2 = int(xs["L"] - 60), int(xs["R"] + 61)
    Y1, Y2 = max(0, yt - 160), min(ink.shape[0], yb + 160)
    win = ink[Y1:Y2, X1:X2]
    ev = line_evidence(win)

    def frame_coords(mask):
        yy, xx = np.nonzero(mask)
        yy, xx = yy + Y1 - yc, xx + X1 - xc
        return (xx - b * yy) * k, (yy + b * xx) * k

    u, v = frame_coords(win)
    eu, ev_v = frame_coords(ev)
    uL, uR = (xs["L"] - xc) * k, (xs["R"] - xc) * k
    width = uR - uL
    height = ASPECT * width

    # Line evidence along the two vertical borders, and the faint horizontal borders' ink.
    on_lines = ev_v[(np.abs(eu - uL) <= 4) | (np.abs(eu - uR) <= 4)]
    inner = (u > uL + 15) & (u < uR - 15)
    vmin = int(np.floor(v.min())) - 10
    prof = np.bincount(np.round(v[inner] - vmin).astype(int), minlength=int(v.max() - vmin) + 20)

    def border_ink(vtop):
        i, j = int(round(vtop - vmin)), int(round(vtop + height - vmin))
        if i - 2 < 0 or j + 3 > len(prof):
            return 0, 0
        return int(prof[i - 2:i + 3].sum()), int(prof[j - 2:j + 3].sum())

    # The top edge: the frame-high window holding the most of the vertical borders' evidence...
    if len(on_lines) < 30:
        return None
    lines_sorted = np.sort(on_lines)
    cands = np.arange(lines_sorted[0] - height + 20, lines_sorted[-1] - 20, 0.5)
    inside = (np.searchsorted(lines_sorted, cands + height + 3, side="right")
              - np.searchsorted(lines_sorted, cands - 3, side="left"))
    best = inside.max()
    plateau = cands[inside >= best - 1]
    if plateau[-1] - plateau[0] <= 12:
        vtop = (plateau[0] + plateau[-1]) / 2.0
        how = "borders"
    else:
        # ...unless the borders stop short of a corner: then the faint horizontal borders decide.
        sc = np.array([sum(border_ink(t)) for t in plateau])
        if sc.max() >= 20:
            vtop = float(plateau[sc >= sc.max() - 1].mean())
            how = "short borders, placed by horizontal border"
        else:
            vtop = (plateau[0] + plateau[-1]) / 2.0
            how = "short borders, centered"
    # Snap to the horizontal borders if both show clearly.
    snap, top_best = 0.0, sum(border_ink(vtop))
    for dv in np.arange(-8, 8.5, 0.5):
        s = sum(border_ink(vtop + dv))
        if s > top_best:
            top_best, snap = s, float(dv)
    t_ink, b_ink = border_ink(vtop + snap)
    if t_ink >= 25 and b_ink >= 25 and snap:
        vtop += snap
        how += ", snapped to horizontal borders"
    else:
        snap = 0.0
        t_ink, b_ink = border_ink(vtop)
    uncertainty = float(plateau[-1] - plateau[0]) / 2.0 if how.startswith("short") and "placed" not in how else 0.0
    held = lines_sorted[(lines_sorted >= vtop - 3) & (lines_sorted <= vtop + height + 3)]
    span = float(held[-1] - held[0]) if len(held) else 0.0

    uc, vc = (uL + uR) / 2.0, vtop + height / 2.0
    cx = xc + (uc + b * vc) * k
    cy = yc + (vc - b * uc) * k
    return dict(cx=round(float(cx), 2), cy=round(float(cy), 2), slope=round(float(b), 5),
                width=round(float(width), 2), how=how, snap=snap, border_ink=[t_ink, b_ink],
                line_evidence=c["evidence"], spread=c["spread"], span=round(span, 1),
                uncertainty=round(uncertainty, 1))


def extract_frame(ink, g):
    """Resample the frame so its rectangle sits at (MARGIN, MARGIN) with size FRAME_W x FRAME_H."""
    s = g["width"] / FRAME_W
    b = g["slope"]
    k = 1.0 / np.sqrt(1.0 + b * b)
    ow, oh = FRAME_W + 2 * MARGIN, FRAME_H + 2 * MARGIN
    u = (np.arange(ow) - (MARGIN + FRAME_W / 2.0)) * s
    v = (np.arange(oh) - (MARGIN + FRAME_H / 2.0)) * s
    U, V = np.meshgrid(u, v)
    x = np.round(g["cx"] + (U + b * V) * k).astype(int)
    y = np.round(g["cy"] + (V - b * U) * k).astype(int)
    inside = (x >= 0) & (x < ink.shape[1]) & (y >= 0) & (y < ink.shape[0])
    out = np.zeros((oh, ow), bool)
    out[inside] = ink[y[inside], x[inside]]
    return out


# ---------------------------------------------------------------------------
# Images

def _png(path, width, height, bit_depth, rows):
    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    raw = b"".join(b"\x00" + r for r in rows)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, bit_depth, 0, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


def write_png_1bit(path, ink):
    """ink: bool array, True = black."""
    packed = np.packbits(~ink, axis=1)
    _png(path, ink.shape[1], ink.shape[0], 1, [r.tobytes() for r in packed])


def write_png_gray(path, gray):
    gray = np.ascontiguousarray(gray, np.uint8)
    _png(path, gray.shape[1], gray.shape[0], 8, [r.tobytes() for r in gray])


def read_png_1bit(path):
    pm = pymupdf.Pixmap(path)
    a = np.frombuffer(pm.samples, np.uint8).reshape(pm.height, pm.stride)[:, :pm.width * pm.n:pm.n]
    return a < 128


def shrink(ink, f, boost=3.0):
    """Reduce a bool image by an integer factor to gray, darkening so thin broken lines stay visible."""
    h, w = ink.shape[0] // f * f, ink.shape[1] // f * f
    frac = ink[:h, :w].reshape(h // f, f, w // f, f).mean(axis=(1, 3))
    return (255 * (1 - np.clip(frac * boost, 0, 1))).astype(np.uint8)


_label_cache = {}


def label(text, height, bold=False):
    """Black text on white as a gray array `height` pixels tall (rendered with PyMuPDF's Helvetica)."""
    key = (text, height, bold)
    if key not in _label_cache:
        font = "hebo" if bold else "helv"
        fs = 20.0
        tl = pymupdf.get_text_length(text, fontname=font, fontsize=fs)
        doc = pymupdf.open()
        page = doc.new_page(width=tl + 4, height=fs * 1.25)
        page.insert_text((2, fs * 0.95), text, fontname=font, fontsize=fs)
        zoom = height / (fs * 1.25)
        pm = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), colorspace=pymupdf.csGRAY)
        a = np.frombuffer(pm.samples, np.uint8).reshape(pm.height, pm.stride)[:, :pm.width].copy()
        _label_cache[key] = a
    return _label_cache[key]


def paste(canvas, img, x, y):
    h, w = img.shape
    canvas[y:y + h, x:x + w] = np.minimum(canvas[y:y + h, x:x + w], img)


# ---------------------------------------------------------------------------
# The pipeline

def frame_path(p, corner):
    return os.path.join(OUT, "frames", f"p{p:03}-{corner}.png")


def process_page(p):
    doc = pymupdf.open(PDF)
    ink = page_ink(doc, p)
    found = []
    for corner in corners_of_page(p):
        g = locate_frame(ink, corner)
        if g is None:
            continue
        write_png_1bit(frame_path(p, corner), extract_frame(ink, g))
        g.update(page=p, corner=corner)
        found.append(g)
    return p, found


def extract_all(pages, jobs):
    os.makedirs(os.path.join(OUT, "frames"), exist_ok=True)
    for p in pages:
        for corner in ("ul", "ll", "ur", "lr"):
            if os.path.exists(frame_path(p, corner)):
                os.remove(frame_path(p, corner))
    results = []
    with ProcessPoolExecutor(max_workers=jobs) as ex:
        for p, found in ex.map(process_page, pages):
            results.extend(found)
            print(f"page {p}: " + (", ".join(f"{g['corner']}" for g in found) or "no frames"), flush=True)
    return results


def load_index():
    path = os.path.join(OUT, "frames.json")
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return {"frames": []}


def sequences(index):
    """{corner: [frame records in page order]} for the corners in viewing order."""
    seqs = {code: [] for code, _ in CORNERS}
    for g in sorted(index["frames"], key=lambda g: g["page"]):
        seqs[g["corner"]].append(g)
    return seqs


def scene_of(corner, page):
    for scene, code, first, last in SCENES:
        if code == corner and first <= page <= last:
            return scene
    return "(no scene)"


def segments(frames, corner):
    """Split one corner's frames into runs that belong to the same scene."""
    out = []
    for g in frames:
        s = scene_of(corner, g["page"])
        if out and out[-1][0] == s:
            out[-1][1].append(g)
        else:
            out.append((s, [g]))
    return out


def contact_sheet(index, path):
    seqs = sequences(index)
    f = THUMB_SCALE
    tw, th = (FRAME_W + 2 * MARGIN) // f, (FRAME_H + 2 * MARGIN) // f
    cols, gap, lab_h, pad = 22, 14, 16, 20
    cell_w, cell_h = tw + gap, th + lab_h + gap
    width = pad * 2 + cols * cell_w
    parts = []
    head = np.full((100, width), 255, np.uint8)
    paste(head, label("AI-TR-540: the flipbook in the page corners, every frame, labeled by page", 32, bold=True), pad, 14)
    paste(head, label("Viewing order (thesis page 17): upper left, lower left, upper right, lower right. "
                      "Within each corner, time runs forward with the page numbers. Blank frames mark the cuts between scenes.",
                      21), pad, 60)
    parts.append(head)
    for code, name in CORNERS:
        frames = seqs[code]
        bar = np.full((52, width), 255, np.uint8)
        bar[6:8, pad:width - pad] = 0
        parity = "even" if code[1] == "l" else "odd"
        title = (f"{name.capitalize()} corner: {len(frames)} frames, {parity} pages {frames[0]['page']}-{frames[-1]['page']}"
                 if frames else f"{name.capitalize()} corner: no frames")
        paste(bar, label(title, 28, bold=True), pad, 16)
        parts.append(bar)
        for scene, group in segments(frames, code):
            sub = np.full((34, width), 255, np.uint8)
            paste(sub, label(f"{scene}, pages {group[0]['page']}-{group[-1]['page']}", 22), pad, 6)
            rows = -(-len(group) // cols)
            grid = np.full((rows * cell_h + 8, width), 255, np.uint8)
            for i, g in enumerate(group):
                r, c = divmod(i, cols)
                x, y = pad + c * cell_w, r * cell_h
                paste(grid, shrink(read_png_1bit(frame_path(g["page"], code)), f), x, y)
                lab = label(str(g["page"]), lab_h - 3)
                paste(grid, lab, x + (tw - lab.shape[1]) // 2, y + th + 1)
            parts += [sub, grid]
    sheet = np.vstack(parts + [np.full((pad, width), 255, np.uint8)])
    write_png_gray(path, sheet)
    print(f"wrote {path} ({sheet.shape[1]}x{sheet.shape[0]})")


def _dilate3(a):
    """Grow ink by one pixel in every direction (3 x 3)."""
    out = a.copy()
    out[1:, :] |= a[:-1, :]
    out[:-1, :] |= a[1:, :]
    tmp = out.copy()
    out[:, 1:] |= tmp[:, :-1]
    out[:, :-1] |= tmp[:, 1:]
    return out


def _video_codec():
    """Arguments for the best H.264 (or MPEG-4) encoder this ffmpeg has."""
    enc = subprocess.run([FFMPEG, "-hide_banner", "-encoders"], capture_output=True, text=True).stdout
    if " libx264 " in enc:
        return ["-c:v", "libx264", "-crf", "16", "-preset", "slow"]
    if " libopenh264 " in enc:
        return ["-c:v", "libopenh264", "-b:v", "1M"]
    return ["-c:v", "mpeg4", "-q:v", "2"]


def animation_frame(ink, scene, corner, page):
    """One GIF/MP4 frame: the frame at 1/GIF_SCALE size with a drawn border and a two-line label.

    Only the inside of the rectangle is kept, so marks beside the frame go; the scanned
    dotted border, which differs from page to page and would flicker, is replaced by a
    steady drawn one. Nothing inside the rectangle is touched."""
    m, s = MARGIN, GIF_SCALE
    inside = np.zeros_like(ink)
    y0, y1, x0, x1 = m + BAND, m + FRAME_H - BAND + 1, m + BAND, m + FRAME_W - BAND + 1
    inside[y0:y1, x0:x1] = ink[y0:y1, x0:x1]
    img = shrink(_dilate3(inside), s, boost=2.0)     # a pixel bolder, so the broken lines read at half size
    t, l, b, r = m // s, m // s, (m + FRAME_H) // s, (m + FRAME_W) // s
    for (ya, yb, xa, xb) in ((t - 1, t + 1, l - 1, r + 1), (b - 1, b + 1, l - 1, r + 1),
                             (t - 1, b + 1, l - 1, l + 1), (t - 1, b + 1, r - 1, r + 1)):
        img[ya:yb, xa:xb] = np.minimum(img[ya:yb, xa:xb], 120)
    h, w = img.shape
    canvas = np.full((h + 46, w + w % 2), 255, np.uint8)
    canvas[:h, :w] = img
    l1 = label(scene, 19, bold=True)
    l2 = label(f"{corner_name(corner)} corner, page {page}", 17)
    paste(canvas, l1, (w - l1.shape[1]) // 2, h + 2)
    paste(canvas, l2, (w - l2.shape[1]) // 2, h + 24)
    return (np.round(canvas / 17.0) * 17).astype(np.uint8)    # 16 exact grays, pure white kept


def build_animations(index, delay, want_mp4=True):
    """flipbook.gif (and flipbook.mp4): every corner in viewing order, `delay` hundredths of a second per frame."""
    seqs = sequences(index)
    frames = [animation_frame(read_png_1bit(frame_path(g["page"], code)), scene_of(code, g["page"]), code, g["page"])
              for code, _ in CORNERS for g in seqs[code]]
    fps = 100.0 / delay
    tmp = tempfile.mkdtemp(prefix="flipbook-")
    try:
        names = []
        for img in frames:
            names.append(f"f{len(names):04}.png")
            write_png_gray(os.path.join(tmp, names[-1]), img)
        gif = os.path.join(OUT, "flipbook.gif")
        args = [MAGICK, "-delay", str(delay)] + names[:-1] + ["-delay", str(END_HOLD), names[-1],
                                                               "-loop", "0", "-layers", "Optimize", gif]
        subprocess.run(args, check=True, cwd=tmp)       # relative names keep the command line short
        print(f"wrote {gif} ({len(frames)} frames, {delay / 100:g} s each = {fps:.1f} fps, "
              f"{os.path.getsize(gif) // 1024} KB)")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    if want_mp4 and os.path.exists(FFMPEG):
        # Raw frames go in through a pipe (this ffmpeg build cannot read PNG); the last is held as in the GIF.
        h, w = frames[0].shape
        mp4 = os.path.join(OUT, "flipbook.mp4")
        cmd = [FFMPEG, "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "gray", "-s", f"{w}x{h}",
               "-framerate", f"{fps:.6f}", "-i", "-"] + _video_codec() + [
               "-pix_fmt", "yuv420p", "-r", "25", "-movflags", "+faststart", mp4]
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        for img in frames + [frames[-1]] * (round(END_HOLD / delay) - 1):
            proc.stdin.write(img.tobytes())
        proc.stdin.close()
        if proc.wait():
            raise RuntimeError("ffmpeg failed")
        print(f"wrote {mp4} ({os.path.getsize(mp4) // 1024} KB)")


def parse_pages(s, n):
    if not s:
        return list(range(1, n + 1))
    pages = []
    for part in s.split(","):
        a, _, b = part.partition("-")
        pages.extend(range(int(a), int(b or a) + 1))
    return pages


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--pages", help="pages to extract, e.g. 3-40,100 (default: all)")
    ap.add_argument("--no-extract", action="store_true", help="reuse frames/ and frames.json")
    ap.add_argument("--no-mp4", action="store_true")
    ap.add_argument("--delay", type=int, default=GIF_DELAY,
                    help=f"hundredths of a second per frame (default {GIF_DELAY}; 22 is the film's own pace)")
    ap.add_argument("--jobs", type=int, default=os.cpu_count() or 4)
    args = ap.parse_args()

    n_pages = len(pymupdf.open(PDF))
    index = load_index()
    if not args.no_extract:
        pages = parse_pages(args.pages, n_pages)
        found = extract_all(pages, args.jobs)
        keep = [g for g in index["frames"] if g["page"] not in set(pages)]
        index = {"source": PDF, "frame_size": [FRAME_W, FRAME_H], "margin": MARGIN,
                 "frames": sorted(keep + found, key=lambda g: (g["page"], g["corner"]))}
        with open(os.path.join(OUT, "frames.json"), "w") as f:
            json.dump(index, f, indent=1)
        print(f"{len(found)} frames found on {len(pages)} pages")
        if args.pages:
            print("sheet and animations not rebuilt (only some pages were extracted)")
            return
    contact_sheet(index, os.path.join(OUT, "contact-sheet.png"))
    build_animations(index, args.delay, want_mp4=not args.no_mp4)


if __name__ == "__main__":
    sys.exit(main())
