"""Inspect ITS PDUMP core images (saved MacLisp jobs) from the KEN; tapes.

A PDUMP file (format as in pdump-file.c of larsbrinkhoff/pdp10-its-disassembler):
word 0 = 0; words 1-256 = page map, one word per 1K page (bit 4.9 absolute,
4.7 shared, 2.9 writable, 2.8 readable); the rest of the first 1024 words
unused; then every readable/writable, non-shared page in order; then the
start instruction and a few words of symbol information.

A dumped MacLisp does not contain the Lisp's own pure pages (they are mapped in
again from the Lisp file at startup), so system atoms such as SUBR, EXPR, LAMBDA
are not in the image. Everything the user loaded is. This tool rebuilds the
symbol table from the image itself:

* a symbol block (SY2) is two words at an even address: 777xxx,,value-cell and
  args,,pname, where pname is a list of fixnums holding 5 characters each
  (src/l/defns.240, "SYMBOL BLOCK-STRUCTURE DEFINITIONS");
* a symbol header is a word whose LH points at an SY2 block; its RH is the
  property list (indicator value indicator value ...).

Property indicators that are system atoms appear only as addresses. They are
identified by matching functions defined in the FASL files (SUBR, LSUBR) and
by the kinds of values they hold (AUTOLOAD values are file names). A compiled
macro FOO has MACRO property |FOO MACRO|, a symbol whose SUBR property is the
code.

The code listing disassembles each compiled entry up to the next entry. Operands
are resolved where the image allows: 'X for symbols, (SPECIAL X) for value
cells, function names for code addresses, quoted lists and fixnums.
Addresses inside the absent pure Lisp stay octal.

Usage (run with python -I):
    python -I tools/pdump.py --all     write reports/pdump/ for every PDUMP in original/
"""

import collections
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import its_words as iw  # noqa: E402
import fasl  # noqa: E402
import itsdir  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE_ABS, PAGE_SHARE = 0o400000000000, 0o100000000000
PAGE_WRITE, PAGE_READ = 0o400000, 0o200000


def is_pdump(words):
    if len(words) < 1024 or words[0] != 0:
        return False
    pm = words[1:257]
    if any((w >> 18) & ~0o700000 for w in pm):      # LH may hold only the absolute/copy/share bits
        return False
    present = sum(1 for w in pm if w and not w & (PAGE_ABS | PAGE_SHARE) and w & (PAGE_READ | PAGE_WRITE))
    return present > 0 and 1024 * (present + 1) <= len(words)


class Image:
    def __init__(self, words):
        self.pmap = words[1:257]
        self.mem = {}
        self.pages = []
        pos = 1024
        for i, info in enumerate(self.pmap):
            if info == 0 or info & (PAGE_ABS | PAGE_SHARE) or not info & (PAGE_READ | PAGE_WRITE):
                continue
            for j, w in enumerate(words[pos:pos + 1024]):
                self.mem[i * 1024 + j] = w
            self.pages.append((i, info))
            pos += 1024
        self.tail = words[pos:]
        self._symbols()

    def pname(self, p, limit=60):
        s = []
        n = 0
        while p:
            if p not in self.mem or n > limit:
                return None
            c = self.mem[p]
            car = c >> 18
            if car not in self.mem:
                return None
            for ch in iw.chars7(self.mem[car]):
                if ch == 0:
                    continue
                if ch < 32 or ch == 127:
                    return None
                s.append(chr(ch))
            p = c & iw.RIGHT
            n += 1
        return "".join(s) or None

    def _symbols(self):
        mem = self.mem
        self.sy2 = {}
        for a, w in mem.items():
            if a % 2 == 0 and (w >> 27) == 0o777 and (a + 1) in mem:
                nm = self.pname(mem[a + 1] & iw.RIGHT)
                if nm:
                    self.sy2[a] = nm
        self.syms = {}            # header address -> (name, plist pointer, sy2 address)
        for a, w in mem.items():
            lh = w >> 18
            if lh in self.sy2:
                self.syms[a] = (self.sy2[lh], w & iw.RIGHT, lh)
        self.names = {a: v[0] for a, v in self.syms.items()}
        self.byname = collections.defaultdict(list)
        for a, v in self.syms.items():
            self.byname[v[0]].append(a)
        # value cells (SY2 word 0 RH) -> symbol name
        self.vcells = {}
        for a, v in self.syms.items():
            vc = mem[v[2]] & iw.RIGHT
            if vc:
                self.vcells.setdefault(vc, v[0])
        # segments holding conses and fixnums (from plists and pnames)
        self.listsegs, self.fixsegs = set(), set()
        for a, v in self.syms.items():
            p, n = v[1], 0
            while p and p in mem and n < 80:
                self.listsegs.add(p >> 9)
                p = mem[p] & iw.RIGHT
                n += 1
        for a in self.sy2:
            p = mem[a + 1] & iw.RIGHT
            while p and p in mem:
                self.listsegs.add(p >> 9)
                self.fixsegs.add((mem[p] >> 18) >> 9)
                p = mem[p] & iw.RIGHT
        self.fixsegs -= self.listsegs
        self.listsegs.discard(0)        # low core: accumulators and Lisp system variables
        self.fixsegs.discard(0)
        self.globals = {}               # pure-Lisp address -> GLOBALSYM name (learned from FASLs)

    def plist(self, a):
        out = []
        p = self.syms[a][1]
        n = 0
        while p and p in self.mem and n < 60:
            c = self.mem[p]
            nxt = c & iw.RIGHT
            if nxt == 0 or nxt not in self.mem:
                break
            out.append((c >> 18, self.mem[nxt] >> 18))
            p = self.mem[nxt] & iw.RIGHT
            n += 1
        return out

    def sexp(self, v, budget=None, depth=0):
        if budget is None:
            budget = [300]
        budget[0] -= 1
        if budget[0] < 0:
            return "..."
        if v == 0:
            return "NIL"
        if v in self.names:
            return fasl.fmt_sym(self.names[v])
        seg = v >> 9
        if seg in self.fixsegs and v in self.mem:
            return str(iw.signed(self.mem[v]))
        if seg in self.listsegs and v in self.mem and depth < 20:
            items = []
            p, n = v, 0
            while p and n < 200:
                if (p >> 9) not in self.listsegs or p not in self.mem:
                    items.append(". " + self.sexp(p, budget, depth + 1))
                    break
                c = self.mem[p]
                items.append(self.sexp(c >> 18, budget, depth + 1))
                p = c & iw.RIGHT
                n += 1
                if budget[0] < 0:
                    items.append("...")
                    break
            return "(" + " ".join(items) + ")"
        return "#%o" % v


def infer_indicators(img):
    """Name the unnamed (pure) indicator atoms."""
    votes = collections.defaultdict(collections.Counter)
    for dirpath, _, files in os.walk(os.path.join(ROOT, "original")):
        for fn in files:
            if not fn.endswith(".fasl"):
                continue
            try:
                segs, info = fasl.parse(iw.decode_file(os.path.join(dirpath, fn)))
            except Exception:
                continue
            for seg in segs:
                for (nm, typ, argl, addr, item) in seg.entries:
                    for a in img.byname.get(nm.name, []):
                        for ind, v in img.plist(a):
                            if ind not in img.names:
                                votes[ind][typ.name] += 1
    names = {}
    uses = collections.defaultdict(list)
    for a in img.syms:
        for ind, v in img.plist(a):
            if ind not in img.names:
                uses[ind].append((a, v))

    def is_code(v):
        seg = v >> 9
        return v in img.mem and v not in img.names and seg not in img.listsegs and seg not in img.fixsegs

    code_inds = []
    for ind, lst in uses.items():
        vs = [v for a, v in lst]
        filenames = sum(1 for v in vs if v in img.names and ";" in img.names[v])
        macro_syms = sum(1 for (a, v) in lst if v in img.names and img.names[v] == img.names[a] + " MACRO")
        if len(vs) >= 5 and filenames >= 0.6 * len(vs):
            names[ind] = "AUTOLOAD"
        elif len(vs) >= 5 and macro_syms >= 0.6 * len(vs):
            names[ind] = "MACRO"
        elif len(vs) >= 5 and sum(1 for v in vs if is_code(v)) >= 0.8 * len(vs):
            # ARGS property (SY2 word 1 LH): SUBRs carry (NIL . n), LSUBRs (m . n), FSUBRs none.
            args = [img.mem[img.syms[a][2] + 1] >> 18 for a, v in lst]
            nil_n = sum(1 for x in args if x and not x >> 9)
            m_n = sum(1 for x in args if x >> 9)
            code_inds.append((ind, nil_n, m_n, len(vs)))
    if code_inds:
        subr = max(code_inds, key=lambda t: t[1])
        names[subr[0]] = "SUBR"
        rest = [t for t in code_inds if t[0] != subr[0]]
        if rest:
            lsubr = max(rest, key=lambda t: t[2])
            if lsubr[2]:
                names[lsubr[0]] = "LSUBR"
                rest = [t for t in rest if t[0] != lsubr[0]]
            for t in rest:
                if not t[1] and not t[2]:
                    names[t[0]] = "FSUBR"
    return names, uses, votes


def ind_name(img, inds, ind):
    if ind in img.names:
        return fasl.fmt_sym(img.names[ind])
    return inds.get(ind, "#%06o" % ind)


# ---------------------------------------------------------------------------
# Disassembly.

def disasm_word(img, w, here, entries, spans):
    op = (w >> 27) & 0o777
    ac = (w >> 23) & 0o17
    ind = "@" if (w >> 22) & 1 else ""
    x = (w >> 18) & 0o17
    r = w & iw.RIGHT
    idx = "(%s)" % fasl.ACS[x] if x else ""

    def opnd(mn=None):
        if x:
            if r == 0:
                return ""
            return ("-%o" % ((1 << 18) - r)) if r & (1 << 17) else "%o" % r
        imm = mn is not None and fasl._is_immediate(mn)
        if r <= 0o17:
            if mn in ("POPJ",) or (mn and mn.startswith("JRST") and r == 0):
                return "%o" % r
            return "%o" % r if imm else fasl.ACS[r]
        if mn in fasl._SHIFTS and r & (1 << 17):
            return "-%o" % ((1 << 18) - r)
        if r in img.globals:
            return img.globals[r]
        r70 = next((a for a, nm in img.globals.items() if nm == "R70"), None)
        if r70 is not None and r70 < r <= r70 + 0o20:
            return "R70+%o" % (r - r70)
        if r in img.names:
            return "'" + fasl.fmt_sym(img.names[r])
        if r in img.vcells:
            return "(SPECIAL %s)" % fasl.fmt_sym(img.vcells[r])
        if r in entries:
            return entries[r]
        if r in spans:
            base, nm = spans[r]
            return "%s+%o" % (nm, r - base) if r != base else nm
        seg = r >> 9
        if seg in img.listsegs and r in img.mem:
            s = "'" + img.sexp(r, [60])
            return s if len(s) < 100 else s[:97] + "..."
        if seg in img.fixsegs and r in img.mem:
            return "'%d" % iw.signed(img.mem[r])
        return "%o" % r
    if op == 0:
        if w == 0:
            return "0"
        return "%o,,%s" % (w >> 18, opnd())
    if op in fasl.UUOS:
        mn = fasl.UUOS[op]
        if op in fasl.CALL_UUOS:
            return "%s %o,%s%s%s" % (mn, ac, ind, opnd(mn), idx)
        return "%s %s,%s%s%s" % (mn, fasl.ACS[ac], ind, opnd(mn), idx)
    mn = fasl.OPCODES.get(op)
    if mn is None:
        return iw.octal(w)
    return "%s %s,%s%s%s" % (mn, fasl.ACS[ac], ind, opnd(mn), idx)


def learn_globals(img, inds):
    """Name pure-Lisp addresses by aligning functions compiled in FASL files with
    the same functions in the image: where the FASL word has a GLOBALSYM patch,
    image RH - FASL RH is that symbol's address. R70+n words give R70 itself."""
    code_inds = {i for i, n in inds.items() if n in ("SUBR", "LSUBR", "FSUBR")}
    entries = code_entries(img, inds)
    starts = sorted(entries)
    nxt = {a: (starts[i + 1] if i + 1 < len(starts) else None) for i, a in enumerate(starts)}
    votes = collections.defaultdict(collections.Counter)
    for dirpath, _, files in os.walk(os.path.join(ROOT, "original")):
        for fn in files:
            if not fn.endswith(".fasl"):
                continue
            try:
                segs, info = fasl.parse(iw.decode_file(os.path.join(dirpath, fn)))
            except Exception:
                continue
            for seg in segs:
                ents = sorted((addr, nm.name) for (nm, typ, argl, addr, item) in seg.entries)
                for i, (fa, nm) in enumerate(ents):
                    fend = ents[i + 1][0] if i + 1 < len(ents) else max(seg.loaded) + 1
                    for a in img.byname.get(nm, []):
                        for ind, v in img.plist(a):
                            if ind not in code_inds or v not in nxt or nxt[v] is None:
                                continue
                            if nxt[v] - v != fend - fa:
                                continue
                            ok = True
                            for k in range(fend - fa):
                                ld = seg.loaded.get(fa + k)
                                w = img.mem.get(v + k)
                                if ld is None or w is None or (ld.word >> 18) != (w >> 18):
                                    ok = False
                                    break
                            if not ok:
                                continue
                            for k in range(fend - fa):
                                ld = seg.loaded[fa + k]
                                for pt in ld.patches:
                                    if pt[0] in "+-" and not pt.startswith(("+DDT", "-DDT")):
                                        val = ((img.mem[v + k] & iw.RIGHT) - (ld.word & iw.RIGHT)) & iw.RIGHT
                                        if pt[0] == "-":
                                            val = (-val) & iw.RIGHT
                                        votes[pt[1:]][val] += 1
    for name, c in votes.items():
        val, n = c.most_common(1)[0]
        if n >= 2 and n >= 0.7 * sum(c.values()):
            img.globals.setdefault(val, name)
    return votes


def code_entries(img, inds):
    """Map code address -> function label for every compiled entry."""
    code_inds = {i for i, n in inds.items() if n in ("SUBR", "LSUBR", "FSUBR")}
    entries = {}
    for a in img.syms:
        for ind, v in img.plist(a):
            if ind in code_inds and v in img.mem:
                label = "%s (%s)" % (fasl.fmt_sym(img.names[a]), inds[ind])
                if v not in entries or len(label) < len(entries[v]):
                    entries[v] = label
    return entries


def listing(img, inds):
    entries = code_entries(img, inds)
    addrs = sorted(entries)
    spans = {}
    out = []
    for i, a in enumerate(addrs):
        end = addrs[i + 1] if i + 1 < len(addrs) else a + 2000
        nm = entries[a].split(" (")[0]
        for k in range(a, end):
            spans[k] = (a, nm)
    for i, a in enumerate(addrs):
        end = addrs[i + 1] if i + 1 < len(addrs) else a + 2000
        out.append("")
        out.append("%s:" % entries[a])
        k = a
        zeros = 0
        while k < end and k in img.mem:
            w = img.mem[k]
            zeros = zeros + 1 if w == 0 else 0
            if zeros > 8:
                out.append("  ...  (zeros)")
                break
            out.append("  %06o  %s  %s" % (k, iw.octal(w), disasm_word(img, w, k, entries, spans)))
            k += 1
    return out


# ---------------------------------------------------------------------------

def ken1_tags_coverage(img, inds):
    """Compare the 1979 tags table's KEN1 definitions with the image."""
    tags = os.path.join(ROOT, "original", "7005017", "ken.tags")
    if not os.path.exists(tags):
        return []
    text = iw.words_to_text(iw.decode_file(tags))
    code_inds = {i for i, n in inds.items() if n in ("SUBR", "LSUBR", "FSUBR")}
    mac = {i for i, n in inds.items() if n == "MACRO"}
    auto = {i for i, n in inds.items() if n == "AUTOLOAD"}
    rows = []
    tot = collections.Counter()
    for sec in text.split("\x1f\n"):
        lines = sec.split("\n")
        if not lines or not lines[0].startswith("KEN1;"):
            continue
        defs = []
        for ln in lines[2:]:
            if "\x7f" in ln:
                m = re.match(r"\((?:defun|defmacro|define-form|defprop|def\S*)\s+\(?([^\s()]+)", ln.split("\x7f")[0], re.I)
                if m:
                    defs.append(m.group(1).upper())
        if not defs:
            continue
        c = collections.Counter()
        missing = []
        for d in defs:
            got = set()
            for a in img.byname.get(d, []):
                got |= {ind for ind, v in img.plist(a)}
            if got & code_inds:
                c["compiled"] += 1
            elif got & mac:
                c["macro"] += 1
            elif got & auto:
                c["autoload only"] += 1
                missing.append(d)
            elif got:
                c["other"] += 1
                missing.append(d)
            else:
                c["absent"] += 1
                missing.append(d)
        tot.update(c)
        rows.append((lines[0].strip(), len(defs), c, missing))
    return rows, tot


def report(path, label):
    words = iw.decode_file(path)
    img = Image(words)
    inds, uses, votes = infer_indicators(img)
    learn_globals(img, inds)
    out = []
    p = out.append
    p("PDUMP core image: %s" % label)
    p("%d words; %d pages in the file (%d writable); start instruction %s; trailing words: %s" %
      (len(words), len(img.pages), sum(1 for _, i in img.pages if i & PAGE_WRITE),
       iw.octal(img.tail[0]) if img.tail else "-", " ".join(iw.octal(x) for x in img.tail[1:])))
    absent = [i for i, info in enumerate(img.pmap) if info and info & (PAGE_ABS | PAGE_SHARE)]
    p("Pages mapped but not in the file (shared/absolute, i.e. the pure Lisp): %d" % len(absent))
    p("Symbols rebuilt from the image: %d headers, %d distinct names, %d value cells." %
      (len(img.syms), len(img.byname), len(img.vcells)))
    p("")
    p("-- Property indicators that are pure system atoms, as inferred --")
    for ind, lst in sorted(uses.items(), key=lambda kv: -len(kv[1])):
        if len(lst) < 3:
            continue
        p("  %06o  %-9s used %4d times; FASL entry votes %s" %
          (ind, inds.get(ind, "?"), len(lst), dict(votes[ind]) if votes[ind] else "-"))
    if img.globals:
        p("")
        p("-- Pure-Lisp addresses named by aligning FASL code with the image (GLOBALSYMs) --")
        p("  " + ", ".join("%s=%o" % (nm, a) for a, nm in sorted(img.globals.items(), key=lambda kv: kv[1])))
    cov = ken1_tags_coverage(img, inds)
    if cov:
        rows, tot = cov
        p("")
        p("-- KEN1 definitions from the 1979 tags table (7005017 KEN TAGS) found in this image --")
        for head, n, c, missing in rows:
            p("  %-24s %3d defs: %s" % (head, n, ", ".join("%s %d" % kv for kv in sorted(c.items()))))
        p("  TOTAL %d: %s" % (sum(tot.values()), ", ".join("%s %d" % kv for kv in sorted(tot.items()))))
        p("  Not present as code or macro:")
        for head, n, c, missing in rows:
            if missing:
                p("    %s: %s" % (head, " ".join(missing)))
    p("")
    p("-- Symbols with properties (indicator value; code addresses in octal) --")
    for nm in sorted(img.byname):
        props = []
        for a in img.byname[nm]:
            for ind, v in img.plist(a):
                iname = ind_name(img, inds, ind)
                if iname in ("SUBR", "LSUBR", "FSUBR"):
                    props.append("%s %06o" % (iname, v))
                elif iname == "MACRO" and v in img.names:
                    sub = [("%s %06o" % (ind_name(img, inds, i2), v2)) for i2, v2 in img.plist(img.byname[img.names[v]][0])]
                    props.append("MACRO %s [%s]" % (fasl.fmt_sym(img.names[v]), ", ".join(sub)))
                else:
                    s = img.sexp(v, [25])
                    props.append("%s %s" % (iname, s if len(s) < 70 else s[:67] + "..."))
        if props:
            p("  %-36s %s" % (fasl.fmt_sym(nm), "; ".join(props)))
    code = ["Code listing for %s" % label,
            "Compiled entries in address order. Operands: 'X symbol, (SPECIAL X) value cell, quoted lists",
            "and fixnums where the image holds them; addresses in the absent pure Lisp stay octal."]
    code.extend(listing(img, inds))
    return "\n".join(out) + "\n", "\n".join(code) + "\n"


def _all():
    man = json.load(open(os.path.join(ROOT, "original", "MANIFEST.json"), encoding="utf-8"))
    outdir = os.path.join(ROOT, "reports", "pdump")
    os.makedirs(outdir, exist_ok=True)
    for f in man["files"]:
        path = os.path.join(ROOT, f["path"])
        name = os.path.basename(path)
        try:
            words = iw.decode_file(path)
        except iw.FormatError:
            continue
        if not is_pdump(words):
            continue
        its = itsdir.its_label(f["tape"], name)
        label = "%s (KEN;%s, tape %s, %s)" % (f["path"], its, f["tape"], f["tape_date"])
        text, code = report(path, label)
        base = os.path.join(outdir, "%s_%s" % (f["tape"], iw.report_name(name)))
        with open(base + ".txt", "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
        with open(base + ".code.txt", "w", encoding="utf-8", newline="\n") as fh:
            fh.write(code)
        print(label, "->", os.path.basename(base) + ".txt")
    return 0


def main(argv):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    if argv[0] == "--all":
        return _all()
    for path in argv:
        sys.stdout.write(report(path, path)[0])
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
