"""List and extract ITS archive files (the ARC: device), recovered from the KEN; tapes.

Two archive formats occur (both documented in the PDP-10/its repository,
doc/sysdoc/oarcdv.format and doc/sysdoc/arcdev.format; extraction logic as in
itsarc.c of larsbrinkhoff/pdp10-its-disassembler):

Old format, word 0 = -1 (777777,,777777), used here from 1975-76:
  words 0-1777   a directory laid out like a UFD: word 2 = start of the 5-word
                 name blocks, word 1 = descriptor free pointer (oarcdv.format
                 lists these two the other way round; the files and itsarc.c
                 agree on this order), word 3 = date of last rearrangement;
                 descriptors start at word 11. Each file's
                 descriptor is a load-address byte (40-77) plus two bytes that
                 together index the FBAT.
  words 2000-2005  free-chain and usage counts; word 2005+i = FBAT entry i,
                 the address of the file's first data block.
  data blocks    header word: 4.8 = last block, 4.6-3.6 = length-1,
                 3.4-1.1 = address of the next block; then the data; then a
                 trailer word.
New format, word 0 = SIXBIT "ARC1!!":
  words 0-1777   directory: word 1 = UDNAMP, word 2 = end of data, word 4 =
                 creation date of the archive; name blocks as in a UFD, but the
                 RH of UNRNDM is the address of the file's data header, whose
                 first word is the total length including the 3-word header.

Members are written in the same ITS-evacuate byte format as original/, so text
members read as plain text and binary members (FASL, pictures) can be read with
its_words.py. Members that look personal (mail, letters, resumes, plans) are
listed but not extracted, matching tools/copy_originals.py.

Usage (run with python -I):
    python -I tools/itsarc.py ARCHIVE-FILE          list members
    python -I tools/itsarc.py --all                 list and extract every archive in
                                                    original/ into reports/archives/
"""

import fnmatch
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import its_words as iw  # noqa: E402
import itsdir  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERY_OLD = 0o777777777777
OLD_ARC = 0o416243010101    # SIXBIT ARC!!! (format of oarcdv; not seen here)
NEW_ARC = 0o416243210101    # SIXBIT ARC1!!

PERSONAL_NAMES = [("*MAIL", "mail"), ("*RMAIL", "mail"), ("MAIL *", "mail"), ("RMAIL *", "mail"),
                  ("*LETTER*", "letter"), ("LET*", None), ("RESUME*", "resume"), ("*PLAN*", "plan"),
                  ("MYLIFE*", "personal"), ("_MSGS_*", "messages")]


class ArcError(Exception):
    pass


def archive_format(words):
    if not words:
        return None
    if words[0] == VERY_OLD:
        return "old"
    if words[0] == NEW_ARC:
        return "new"
    if words[0] == OLD_ARC:
        return "arc!!!"
    return None


def _ildb_bytes(dirw, ptr):
    while True:
        w = dirw[11 + ptr // 6]
        yield (w >> (30 - 6 * (ptr % 6))) & 0o77
        ptr += 1


def parse_archive(words):
    """Return (format, header dict, list of member dicts with 'words')."""
    fmt = archive_format(words)
    if fmt is None:
        raise ArcError("not an archive (word 0 = %s)" % iw.octal(words[0] if words else 0))
    if len(words) < 1024:
        raise ArcError("archive shorter than its directory block")
    dirw = words[:1024]
    hdr = {"format": fmt}
    if fmt == "new":
        namp = dirw[1]
        hdr.update(data_end=dirw[2], cleaned=iw.its_date(dirw[3]), created=iw.its_date(dirw[4]))
    else:
        # oarcdv.format names word 1 UDNAMP and word 2 UDESCP, but the files (and
        # itsarc.c) have them the other way round: word 2 is the name-area start.
        namp = dirw[2]
        hdr.update(descp=dirw[1], rearranged=iw.its_date(dirw[3]))
        if fmt == "old" and len(words) > 0o2005:
            hdr.update(free_words=words[0o2001], free_blocks=words[0o2002],
                       used_words=words[0o2003], used_blocks=words[0o2004])
    members = []
    for i in range(namp, 1024, 5):
        fn1, fn2, rnd, date, ref = dirw[i:i + 5]
        m = {"fn1": iw.sixbit(fn1).rstrip(), "fn2": iw.sixbit(fn2).rstrip(),
             "created": iw.its_date(date), "referenced": iw.its_date(ref & iw.LEFT, with_time=False),
             "rnd": rnd, "flags": iw.lh(rnd)}
        try:
            if fmt == "new":
                data = iw.rh(rnd)
                total = words[data]
                m["words"] = list(words[data + 3:data + total])
                if len(m["words"]) != total - 3:
                    raise ArcError("member runs past the end of the archive")
                m["opens"] = None
            else:
                m["opens"] = iw.rh(ref)
                g = _ildb_bytes(dirw, rnd & 0o17777)
                n = next(g)
                if n == 0:                     # empty descriptor: a zero-length member
                    m["words"] = []
                    m["empty_descriptor"] = True
                    members.append(m)
                    continue
                if not (0o40 <= n <= 0o77):
                    raise ArcError("descriptor byte %o is not a load-address byte" % n)
                n2, n3 = next(g), next(g)
                idx = ((n & 0o37) << 12) | (n2 << 6) | n3
                b = words[0o2005 + idx]
                data = []
                seen = set()
                prev = 0
                while True:
                    if b in seen or b >= len(words):
                        raise ArcError("bad block chain at %o" % b)
                    seen.add(b)
                    h = words[b]
                    n = ((h >> 23) & 0o1777) + 1
                    data.extend(words[b + 1:b + 1 + n])
                    t = words[b + 1 + n] if b + 1 + n < len(words) else None
                    # The trailer repeats the header's length, with the previous
                    # block's address in place of the next one's. (Its 4.8 flag
                    # differs on middle blocks of some members archived in 1974.)
                    if t is None or ((t >> 23) & 0o1777) != ((h >> 23) & 0o1777) or \
                            (prev and (t & 0o17777777) != prev):
                        m["trailer_mismatch"] = m.get("trailer_mismatch", 0) + 1
                    if h & (1 << 34):          # 4.8: last block of the file
                        break
                    prev = b
                    b = h & 0o17777777
                m["words"] = data
        except (ArcError, IndexError, StopIteration) as e:
            m["words"] = None
            m["error"] = str(e)
        members.append(m)
    return fmt, hdr, members


def describe(words):
    """A short, content-free description of a member's kind."""
    if not words:
        return "empty", ""
    w0 = words[0]
    if (w0 | 1) == 0o124641635413:
        return "FASL", ""
    if archive_format(words):
        return "archive", ""
    nbin = sum(1 for w in words if w & 1)
    chars = [c for w in words for c in iw.chars7(w)]
    printable = sum(1 for c in chars if c in (9, 10, 12, 13, 3, 0) or 32 <= c < 127)
    if nbin <= max(2, len(words) // 200) and printable >= 0.97 * len(chars):
        text = iw.words_to_text(words)
        first = next((ln.strip() for ln in text.splitlines() if ln.strip()), "")
        return "text", first
    return "binary", ""


def personal_reason(m, text_head):
    name = "%s %s" % (m["fn1"], m["fn2"])
    for pat, why in PERSONAL_NAMES:
        if why and fnmatch.fnmatch(name, pat):
            return why
    head = text_head[:3000]
    lines = [ln.strip() for ln in head.splitlines()[:40]]
    # The author asked readers not to read it (e.g. ".comment ... not; .comment reading this.")
    if re.search(r"\bnot\W+(?:\.comment\W+)?read(?:ing)? this", " ".join(lines[:6]), re.I):
        return "marked private by its author"
    hdrs = sum(1 for ln in lines if re.match(r"^(From|To|Date|Subject|Cc|Sent-by|Received|Message-ID)\s*:", ln, re.I))
    if hdrs >= 2:
        return "email"
    # ITS mail/message header line, e.g. "USER@MIT-AI 12/07/76 00:33:22"
    if any(re.match(r"^\S+@\S+\s+\d\d/\d\d/\d\d\s+\d\d:\d\d:\d\d", ln) for ln in lines[:5]):
        return "mail message"
    if any(re.match(r"^Dear\b", ln) for ln in lines) or re.search(r"\n\s*(Sincerely|Love|Yours truly|Best regards)\b", head):
        return "letter"
    return None


def safe_member_name(fn1, fn2):
    return iw.report_name(iw.ondisk_name(fn1, fn2))


def render_listing(label, fmt, hdr, members, extracted=None):
    out = ["ITS archive: %s" % label,
           "Format: %s; %d members; %s" % (
               {"old": "old ARC (word 0 = -1)", "new": "ARC1!!", "arc!!!": "ARC!!!"}[fmt], len(members),
               ", ".join("%s %s" % (k, v) for k, v in hdr.items() if k != "format" and v is not None)),
           "",
           "%-6s %-6s %7s  %-19s  %-10s  %-8s %s" % ("FN1", "FN2", "words", "created", "referenced", "kind", "first line / notes")]
    for m in members:
        if m.get("error"):
            out.append("%-6s %-6s %7s  %-19s  %-10s  %-8s %s" % (m["fn1"], m["fn2"], "?", m["created"] or "-",
                                                               m["referenced"] or "-", "ERROR", m["error"]))
            continue
        kind, first = m["kind"], m["first"]
        note = first
        if m.get("personal"):
            note = "(looks personal: %s; not extracted)" % m["personal"]
        elif kind != "text":
            note = ""
        if len(note) > 70:
            note = note[:67] + "..."
        out.append("%-6s %-6s %7d  %-19s  %-10s  %-8s %s" % (m["fn1"], m["fn2"], len(m["words"]), m["created"] or "-",
                                                           m["referenced"] or "-", kind, note))
    return "\n".join(out) + "\n"


def process(path, label, outdir=None):
    words = iw.decode_file(path)
    fmt, hdr, members = parse_archive(words)
    for m in members:
        if m.get("error"):
            continue
        kind, first = describe(m["words"])
        m["kind"], m["first"] = kind, first
        head = iw.words_to_text(m["words"][:600]) if kind == "text" else ""
        m["personal"] = personal_reason(m, head)
        if outdir and not m["personal"]:
            os.makedirs(outdir, exist_ok=True)
            fn = safe_member_name(m["fn1"], m["fn2"])
            with open(os.path.join(outdir, fn), "wb") as fh:
                fh.write(iw.encode(m["words"]))
            m["file"] = fn
    listing = render_listing(label, fmt, hdr, members)
    if outdir:
        os.makedirs(outdir, exist_ok=True)
        with open(os.path.join(outdir, "_LISTING.txt"), "w", encoding="utf-8", newline="\n") as fh:
            fh.write(listing)
    return fmt, hdr, members, listing


def _all():
    man = json.load(open(os.path.join(ROOT, "original", "MANIFEST.json"), encoding="utf-8"))
    base = os.path.join(ROOT, "reports", "archives")
    os.makedirs(base, exist_ok=True)
    index = []
    for f in man["files"]:
        path = os.path.join(ROOT, f["path"])
        name = os.path.basename(path)
        try:
            words = iw.decode_file(path)
        except iw.FormatError:
            continue
        if not archive_format(words):
            continue
        its = itsdir.its_label(f["tape"], name)
        label = "%s (KEN;%s, tape %s, %s)" % (f["path"], its, f["tape"], f["tape_date"])
        outdir = os.path.join(base, "%s_%s" % (f["tape"], iw.report_name(name)))
        fmt, hdr, members, listing = process(path, label, outdir)
        print(listing)
        index.append((f["tape"], its, os.path.basename(outdir), fmt, members))
    with open(os.path.join(base, "INDEX.md"), "w", encoding="utf-8", newline="\n") as fh:
        fh.write("# ITS archives found on the KEN; tapes\n\n")
        fh.write("Extracted by `python -I tools/itsarc.py --all`. Each folder holds the members "
                 "(ITS-evacuate format, so text reads as plain text) and `_LISTING.txt` with dates. "
                 "Members that look personal are listed but not extracted.\n\n")
        for tape, its, folder, fmt, members in index:
            ok = [m for m in members if not m.get("error")]
            pers = [m for m in ok if m.get("personal")]
            fh.write("- **%s** (tape %s, %s format): %d members, %d extracted%s. Folder `%s/`.\n" %
                     (its, tape, fmt, len(members), len(ok) - len(pers),
                      (", %d personal not extracted" % len(pers)) if pers else "", folder))
    return 0


def main(argv):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    if argv[0] == "--all":
        return _all()
    for path in argv:
        print(process(path, path)[3])
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
