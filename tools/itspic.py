"""Render the picture files on the KEN; tapes: TV-turtle windows and KST fonts.

Window files (*.WINDOW, *.NWIND, and the windows inside archives) are MacLisp
DUMPARRAYS files (format in src/lspsrc/dumpar.8 of github.com/PDP-10/its):
for each array, a word -n,,n, n words of 7-bit pname, a key word -count,,type,
then count data words; the file may end with a word of ^C's. LLOGO's TV turtle
(src/llogo/tvrtle.542, MAKEWINDOW-ARRAY) saves each window NAME as two fixnum
arrays: NAME-WINDOW-INFO = (words per row, rows, home x, home y, top-home,
bottom-home, left-home, right-home) and NAME-WINDOW-PICTURE, rows of bits
packed 36 per word, leftmost pixel in the high-order bit.

KST files are ITS raster fonts (XGP/TV): word 0 = KSTID, word 1 RH = height
(LH = baseline and column adjustment); then per character a word 1, a word
left-kern,,code, a word raster-width,,character-width, and height rows of
ceil(raster-width/32) words, 32 pixels per word, left-justified.

Output: one PNG contact sheet per file (lit pixels drawn black on white) plus a
text index giving each window or glyph and its position on the sheet.

Usage (run with python -I):
    python -I tools/itspic.py --all       write reports/images/
"""

import json
import os
import struct
import sys
import zlib

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import its_words as iw  # noqa: E402
import itsarc  # noqa: E402
import itsdir  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


KST_LSB_FIRST = True   # XGP font bytes hold the leftmost pixel in their low bit (checked visually)


class PicError(Exception):
    pass


# ---------------------------------------------------------------------------
# DUMPARRAYS and windows.

def parse_dumparrays(words):
    arrays = []
    i, n = 0, len(words)
    while i < n:
        m = words[i]
        if m == iw.CTRL_C_WORD:
            break
        cnt = m & iw.RIGHT
        if cnt == 0 or ((-(m >> 18)) & iw.RIGHT) != cnt:
            raise PicError("word %o is not a DUMPARRAYS header" % i)
        name = iw.words_to_text(words[i + 1:i + 1 + cnt]).rstrip("\x00")
        key = words[i + 1 + cnt]
        typ = key & iw.RIGHT
        total = (-(key >> 18)) & iw.RIGHT
        data = words[i + 2 + cnt:i + 2 + cnt + total]
        if len(data) != total:
            raise PicError("array %s truncated" % name)
        arrays.append((name, typ, data))
        i += 2 + cnt + total
    return arrays


def windows(arrays):
    info = {}
    pics = {}
    order = []
    for name, typ, data in arrays:
        if name.endswith("-WINDOW-INFO"):
            base = name[:-len("-WINDOW-INFO")]
            info[base] = [iw.signed(x) for x in data]
            order.append(base)
        elif name.endswith("-WINDOW-PICTURE"):
            pics[name[:-len("-WINDOW-PICTURE")]] = data
    out = []
    for base in order:
        inf = info[base]
        pic = pics.get(base)
        if len(inf) < 8 or pic is None or inf[0] == 0:
            out.append((base, None))
            continue
        wpr, rows = inf[0], inf[1]
        width = inf[7] - inf[6] + 1
        bitmap = []
        for r in range(rows):
            row = pic[r * wpr:(r + 1) * wpr]
            bits = []
            for w in row:
                bits.extend((w >> (35 - k)) & 1 for k in range(36))
            bitmap.append(bits[:width])
        out.append((base, bitmap))
    return out


# ---------------------------------------------------------------------------
# KST fonts.

def parse_kst(words):
    if len(words) < 3:
        raise PicError("too short for a KST font")
    height = words[1] & iw.RIGHT
    if not 0 < height < 1024:
        raise PicError("implausible KST height %d" % height)
    chars = []
    i = 2
    while i < len(words):
        if words[i] in (iw.WORDMASK, iw.CTRL_C_WORD):
            break
        if words[i] != 1:
            raise PicError("expected a character marker at word %o" % i)
        code = words[i + 1] & iw.RIGHT
        kern = iw.signed(words[i + 1]) >> 18 if words[i + 1] >> 35 else words[i + 1] >> 18
        rw = words[i + 2] >> 18
        cw = words[i + 2] & iw.RIGHT
        bpr = (rw + 7) // 8                 # bytes per raster row
        nwords = (height * bpr + 3) // 4    # rows form one byte stream, 4 bytes per word
        k = i + 3
        stream = []
        for w in words[k:k + nwords]:
            stream.extend(((w >> 28) & 0xFF, (w >> 20) & 0xFF, (w >> 12) & 0xFF, (w >> 4) & 0xFF))
        if len(stream) < height * bpr:
            raise PicError("character %o truncated" % code)
        rows = []
        for r in range(height):
            bits = []
            for byte in stream[r * bpr:(r + 1) * bpr]:
                if KST_LSB_FIRST:
                    bits.extend((byte >> b) & 1 for b in range(8))
                else:
                    bits.extend((byte >> (7 - b)) & 1 for b in range(8))
            rows.append(bits[:rw])
        chars.append((code, kern, rw, cw, rows))
        i = k + nwords
    return height, chars


# ---------------------------------------------------------------------------
# PNG output (8-bit grayscale; stdlib only).

def write_png(path, pixels, width, height):
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        raw.extend(pixels[y * width:(y + 1) * width])

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 0, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


def contact_sheet(items, max_width=1200, pad=6):
    """items: list of (label, bitmap rows). Returns (pixels, w, h, placements)."""
    x = y = pad
    row_h = 0
    places = []
    for label, bm in items:
        if not bm:
            places.append((label, None))
            continue
        h, w = len(bm), max((len(r) for r in bm), default=0)
        if x + w + pad > max_width and x > pad:
            x = pad
            y += row_h + pad
            row_h = 0
        places.append((label, (x, y, w, h)))
        x += w + pad
        row_h = max(row_h, h)
    W = max_width if any(p for _, p in places) else 1
    W = min(W, max((p[0] + p[2] + pad for _, p in places if p), default=1))
    H = y + row_h + pad
    pix = bytearray([255]) * (W * H)
    for (label, bm), (_, p) in zip(items, places):
        if not p:
            continue
        px, py, w, h = p
        for r, row in enumerate(bm):
            base = (py + r) * W + px
            for c, b in enumerate(row):
                if b:
                    pix[base + c] = 0
        # light frame
        for c in range(-1, w + 1):
            for yy in (py - 1, py + h):
                if 0 <= yy < H and 0 <= px + c < W and pix[yy * W + px + c] == 255:
                    pix[yy * W + px + c] = 200
        for r in range(-1, h + 1):
            for xx in (px - 1, px + w):
                if 0 <= xx < W and 0 <= py + r < H and pix[(py + r) * W + xx] == 255:
                    pix[(py + r) * W + xx] = 200
    return pix, W, H, places


def render_file(words, label, outbase):
    """Try window and KST interpretations. Returns a description or None."""
    try:
        arrays = parse_dumparrays(words)
        wins = windows(arrays)
        if wins:
            items = [(nm, bm) for nm, bm in wins]
            pix, W, H, places = contact_sheet(items)
            write_png(outbase + ".png", pix, W, H)
            with open(outbase + ".txt", "w", encoding="utf-8", newline="\n") as fh:
                fh.write("%s\nMacLisp DUMPARRAYS file of %d TV-turtle windows (%d arrays). Sheet %dx%d; "
                         "positions are x,y,width,height in pixels.\n\n" % (label, len(wins), len(arrays), W, H))
                for nm, p in places:
                    fh.write("%-30s %s\n" % (nm, "empty window" if not p else "%d,%d,%d,%d" % p))
            return "windows: %d (%s)" % (len(wins), ", ".join(nm for nm, _ in wins[:6]) +
                                         (", ..." if len(wins) > 6 else ""))
    except PicError:
        pass
    try:
        height, chars = parse_kst(words)
        items = [("%03o %s" % (c[0], chr(c[0]) if 32 < c[0] < 127 else ""), c[4]) for c in chars]
        pix, W, H, places = contact_sheet(items)
        write_png(outbase + ".png", pix, W, H)
        with open(outbase + ".txt", "w", encoding="utf-8", newline="\n") as fh:
            fh.write("%s\nKST font, height %d, %d characters. Sheet %dx%d; positions are x,y,width,height.\n\n"
                     % (label, height, len(chars), W, H))
            for (nm, p), c in zip(places, chars):
                fh.write("char %-8s kern %4d raster width %4d char width %4d  at %s\n" %
                         (nm, c[1], c[2], c[3], "%d,%d,%d,%d" % p if p else "-"))
        return "KST font: height %d, %d characters" % (height, len(chars))
    except (PicError, IndexError):
        pass
    return None


def _all():
    man = json.load(open(os.path.join(ROOT, "original", "MANIFEST.json"), encoding="utf-8"))
    outdir = os.path.join(ROOT, "reports", "images")
    os.makedirs(outdir, exist_ok=True)
    lines = []
    for f in man["files"]:
        path = os.path.join(ROOT, f["path"])
        name = os.path.basename(path)
        try:
            words = iw.decode_file(path)
        except iw.FormatError:
            continue
        its = itsdir.its_label(f["tape"], name)
        if itsarc.archive_format(words):
            fmt, hdr, members = itsarc.parse_archive(words)
            for m in members:
                if not m.get("words"):
                    continue
                mname = "%s %s" % (m["fn1"], m["fn2"])
                base = os.path.join(outdir, "%s_%s__%s" % (f["tape"], iw.report_name(name),
                                                          itsarc.safe_member_name(m["fn1"], m["fn2"])))
                desc = render_file(m["words"], "KEN;%s member %s (tape %s)" % (its, mname, f["tape"]), base)
                if desc:
                    lines.append("| %s | %s (in archive %s) | %s | %s |" % (f["tape"], mname, its, desc,
                                                                            os.path.basename(base) + ".png"))
            continue
        if name.endswith(".fasl") or name == "_file_.(dir)":
            continue
        base = os.path.join(outdir, "%s_%s" % (f["tape"], iw.report_name(name)))
        desc = render_file(words, "KEN;%s (tape %s)" % (its, f["tape"]), base)
        if desc:
            lines.append("| %s | %s | %s | %s |" % (f["tape"], its, desc, os.path.basename(base) + ".png"))
    with open(os.path.join(outdir, "INDEX.md"), "w", encoding="utf-8", newline="\n") as fh:
        fh.write("# Pictures recovered from the KEN; tapes\n\nGenerated by `python -I tools/itspic.py --all`. "
                 "Lit pixels are drawn black on white. Each PNG has a .txt index alongside.\n\n")
        fh.write("| Tape | File | Contents | Sheet |\n|---|---|---|---|\n")
        fh.write("\n".join(lines) + "\n")
    print("\n".join(lines))
    return 0


def main(argv):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    if argv[0] == "--all":
        return _all()
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
