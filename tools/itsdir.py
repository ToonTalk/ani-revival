"""Decode ITS user file directories (UFDs), the "_file_.(dir)" files on each tape.

An ITS UFD is one 1024-word disk block (layout in src/system/fsdefs.43 of
github.com/PDP-10/its):

  word 0  UDESCP   free pointer into the descriptor area (in 6-bit bytes)
  word 1  UDNAMP   index of the first name block
  word 2  UDNAME   SIXBIT directory name (KEN)
  word 3  UDBLKS   RH = number of blocks used
  word 4  UDALLO   allocation (0 here)
  words 11. up     descriptor area: 6-bit bytes describing each file's disk
                   blocks (0 end, 1-12 take N, 13-30 skip N-12 and take 1,
                   31 placeholder, 40-77 load a 17-bit address and take 1),
                   or, for a link, its target "DIR;FN1;FN2" in SIXBIT
  UDNAMP..1777     name area, 5 words per file, sorted by name:
                   FN1, FN2 (SIXBIT); UNRNDM (flags, pack, descriptor pointer,
                   UNWRDC = words in last block); UNDATE (creation date/time);
                   UNREF (reference date, author index, byte size).

The copies on the backup tapes omit the unused gap between the end of the
descriptor area (word 11 + ceil(UDESCP/6)) and UDNAMP: every _file_.(dir)
here decodes to exactly (11 + ceil(UDESCP/6)) + (1024 - UDNAMP) words. This
tool puts the gap back before decoding.

Usage (run with python -I):
    python -I tools/itsdir.py PATH-TO-_file_.(dir)     print the listing
    python -I tools/itsdir.py --all                    write reports/itsdir/<tape>.txt
                                                       for every tape that has one
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import its_words as iw  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UDDESC = 11

UNLINK = 1 << 18
UNREAP = 2 << 18
UNWRIT = 4 << 18
UNMARK = 0o10 << 18
UNCDEL = 0o20 << 18
UNDUMP = 1 << 35


def expand_ufd(words):
    """Rebuild the full 1024-word UFD from the gap-less tape copy."""
    if len(words) == 1024:
        return list(words)
    udescp, udnamp = words[0], words[1]
    ndesc = UDDESC + (udescp + 5) // 6
    if ndesc + (1024 - udnamp) != len(words):
        raise ValueError("UFD has %d words; expected %d + %d" % (len(words), ndesc, 1024 - udnamp))
    return list(words[:ndesc]) + [0] * (udnamp - ndesc) + list(words[ndesc:])


def desc_bytes(ufd, ptr):
    """Yield 6-bit descriptor bytes starting at byte index ptr."""
    while True:
        w = ufd[UDDESC + ptr // 6]
        yield (w >> (30 - 6 * (ptr % 6))) & 0o77
        ptr += 1


def file_blocks(ufd, ptr):
    """Follow a file descriptor; return the list of disk block numbers."""
    blocks = []
    b = None
    g = desc_bytes(ufd, ptr)
    for _ in range(4096):
        n = next(g)
        if n == 0:
            return blocks
        if 1 <= n <= 12:
            if b is None:
                raise ValueError("take before load-address")
            blocks.extend(range(b, b + n))
            b += n
        elif 13 <= n <= 30:
            b += n - 12
            blocks.append(b)
            b += 1
        elif n == 31:
            continue
        else:
            n2, n3 = next(g), next(g)
            b = ((n & 0o37) << 12) | (n2 << 6) | n3
            blocks.append(b)
            b += 1
    raise ValueError("runaway descriptor")


def link_target(ufd, ptr):
    """Decode a link descriptor into (dir, fn1, fn2)."""
    g = desc_bytes(ufd, ptr)
    parts = []
    cur = ""
    for _ in range(40):
        c = next(g)
        if c == 0:
            parts.append(cur)
            break
        if c == 0o32:                      # ':' quotes the next character
            cur += chr(next(g) + 0o40)
        elif c == 0o33:                    # ';' ends a component (some old links end FN2 with it too)
            parts.append(cur)
            cur = ""
            if len(parts) == 3:
                break
            continue
        else:
            cur += chr(c + 0o40)
        if len(cur) == 6 and len(parts) < 2:
            parts.append(cur)
            cur = ""
    while len(parts) < 3:
        parts.append("")
    return tuple(p.rstrip() for p in parts[:3])


def byte_info(code):
    """UNBYTE: (bits per byte, unused bytes in last word); 0 means 36-bit (old files)."""
    if code == 0:
        return None
    if code <= 0o21:
        return 36 - code, 0
    if code <= 0o157:
        return (code - 0o44) >> 2, code & 3
    if code <= 0o370:
        return (code - 0o200) >> 4, code & 0o17
    return (code - 0o400) >> 6, code & 0o77


def parse_ufd(words):
    ufd = expand_ufd(words)
    hdr = {"UDESCP": ufd[0], "UDNAMP": ufd[1], "UDNAME": iw.sixbit(ufd[2]).rstrip(),
           "UDBLKS": ufd[3], "UDALLO": ufd[4]}
    entries = []
    for i in range(ufd[1], 1024, 5):
        fn1, fn2, rnd, date, ref = ufd[i:i + 5]
        e = {"fn1": iw.sixbit(fn1).rstrip(), "fn2": iw.sixbit(fn2).rstrip(), "rnd": rnd,
             "date": date, "ref": ref,
             "link": bool(rnd & UNLINK), "reap": bool(rnd & UNREAP), "writing": bool(rnd & UNWRIT),
             "deleted": bool(rnd & UNCDEL), "dumped": bool(rnd & UNDUMP),
             "pack": (rnd >> 13) & 0o37, "dscp": rnd & 0o17777, "wrdc": (rnd >> 24) & 0o1777,
             "created": iw.its_date(date), "referenced": iw.its_date(ref & iw.LEFT, with_time=False),
             "author": (ref >> 9) & 0o777, "byte": byte_info(ref & 0o777)}
        if e["link"]:
            e["target"] = link_target(ufd, e["dscp"])
        else:
            try:
                blocks = file_blocks(ufd, e["dscp"])
                e["blocks"] = len(blocks)
                if blocks:
                    last = e["wrdc"] or 1024
                    e["words"] = (len(blocks) - 1) * 1024 + last
                else:
                    e["words"] = 0
            except (ValueError, IndexError) as ex:
                e["blocks"] = None
                e["words"] = None
                e["error"] = str(ex)
        entries.append(e)
    return hdr, entries


def its_names_for_tape(tape):
    """Map on-disk names in original/<tape>/ to "FN1 FN2" using that tape's UFD,
    falling back to the weenix/SFM rules for tapes without one."""
    path = os.path.join(ROOT, "original", tape, "_file_.(dir)")
    names = {}
    if os.path.exists(path):
        _hdr, entries = parse_ufd(iw.decode_file(path))
        for e in entries:
            for c in iw.ondisk_candidates(e["fn1"], e["fn2"]):
                names.setdefault(c, "%s %s" % (e["fn1"], e["fn2"]))
    return names


def its_label(tape, ondisk, _cache={}):
    if tape not in _cache:
        _cache[tape] = its_names_for_tape(tape)
    if ondisk in _cache[tape]:
        return _cache[tape][ondisk]
    if ondisk == "_file_.(dir)":
        return ".FILE. (DIR)"
    return "%s %s" % iw.its_name(ondisk)


def load_manifest():
    man = json.load(open(os.path.join(ROOT, "original", "MANIFEST.json"), encoding="utf-8"))
    present = {}
    for f in man["files"]:
        present.setdefault(f["tape"], {})[os.path.basename(f["path"])] = f
    skipped = {}
    for s in man["skipped"]:
        skipped.setdefault(s["tape"], {})[os.path.basename(s["file"].replace("\\", "/"))] = s["reason"]
    return present, skipped


def render(tape, path, words, present=None, skipped=None):
    hdr, entries = parse_ufd(words)
    present = present or {}
    skipped = skipped or {}
    out = []
    p = out.append
    p("ITS directory listing decoded from %s" % path)
    p("Directory %s; %d entries; header UDESCP=%o UDNAMP=%o, blocks used %d (UDBLKS %s)" %
      (hdr["UDNAME"], len(entries), hdr["UDESCP"], hdr["UDNAMP"], iw.rh(hdr["UDBLKS"]), iw.octal(hdr["UDBLKS"])))
    dates = sorted(e["created"] for e in entries if e["created"])
    refs = sorted(e["referenced"] for e in entries if e["referenced"])
    if dates:
        p("Creation dates range from %s to %s; latest reference date %s." %
          (dates[0], dates[-1], refs[-1] if refs else "?"))
    p("")
    p("Columns: name; words (from the descriptor: (blocks-1)*1024 + words in last block); creation")
    p("date/time; reference date; flags (L link, ! not yet dumped, $ don't reap, W open for writing,")
    p("D delete when closed); author index (octal MFD index, when recorded); byte size; and whether")
    p("the file is on this tape (\"on tape\" with its decoded word count when it differs).")
    p("")
    p("%-6s %-6s %7s  %-19s  %-10s  %-5s %s" % ("FN1", "FN2", "words", "created", "referenced", "flags", "notes"))
    nlinks = 0
    found = set()
    for e in entries:
        flags = ("L" if e["link"] else "") + ("" if e["dumped"] else "!") + ("$" if e["reap"] else "") + \
                ("W" if e["writing"] else "") + ("D" if e["deleted"] else "")
        notes = []
        if e["link"]:
            nlinks += 1
            d, f1, f2 = e["target"]
            notes.append("-> %s;%s %s" % (d, f1, f2))
            size = "-"
        else:
            size = "?" if e["words"] is None else str(e["words"])
            if e.get("error"):
                notes.append("descriptor error: " + e["error"])
        if e["author"] not in (0, 0o777):
            notes.append("author %03o" % e["author"])
        if e["byte"]:
            notes.append("%d-bit bytes, %d unused in last word" % e["byte"])
        if not e["link"]:
            cands = iw.ondisk_candidates(e["fn1"], e["fn2"])
            name = next((c for c in cands if c in present or c in skipped), cands[0])
            if name in present:
                found.add(name)
                fpath = os.path.join(ROOT, present[name]["path"])
                try:
                    n = len(iw.decode_file(fpath))
                except iw.FormatError:
                    n = None
                if n == e["words"]:
                    notes.append("on tape")
                else:
                    notes.append("on tape (decoded %s words)" % n)
            elif name in skipped:
                found.add(name)
                notes.append("on tape, not copied (%s)" % skipped[name])
        p("%-6s %-6s %7s  %-19s  %-10s  %-5s %s" % (e["fn1"], e["fn2"], size, e["created"] or "-",
                                                    e["referenced"] or "-", flags, "; ".join(notes)))
    extra = sorted(n for n in present if n not in found and n != "_file_.(dir)")
    extra_sk = sorted(n for n in skipped if n not in found)
    p("")
    p("%d entries (%d links); %d listed files are on this tape." % (len(entries), nlinks, len(found)))
    if extra or extra_sk:
        p("Files on this tape that the directory does not list: %s" % ", ".join(extra + extra_sk))
    return "\n".join(out) + "\n", hdr, entries, found, extra + extra_sk


def _all():
    present, skipped = load_manifest()
    outdir = os.path.join(ROOT, "reports", "itsdir")
    os.makedirs(outdir, exist_ok=True)
    summary = []
    for tape in sorted(present):
        if "_file_.(dir)" not in present[tape]:
            continue
        path = os.path.join(ROOT, present[tape]["_file_.(dir)"]["path"])
        words = iw.decode_file(path)
        text, hdr, entries, found, extra = render(tape, os.path.relpath(path, ROOT).replace("\\", "/"),
                                                  words, present.get(tape), skipped.get(tape))
        with open(os.path.join(outdir, tape + ".txt"), "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
        sizes_ok = sum(1 for l in text.splitlines() if l.endswith("on tape") or "; on tape" in l)
        summary.append((tape, len(entries), len(found), len(extra)))
        print(tape, len(entries), "entries,", len(found), "on tape,", len(extra), "unlisted")
    return 0


def main(argv):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    if argv[0] == "--all":
        return _all()
    present, skipped = load_manifest()
    for path in argv:
        tape = os.path.basename(os.path.dirname(os.path.abspath(path)))
        text = render(tape, path, iw.decode_file(path), present.get(tape), skipped.get(tape))[0]
        sys.stdout.write(text)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
