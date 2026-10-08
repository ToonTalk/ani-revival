"""Inspect ITS PDUMP core images (saved MacLisp jobs) from the KEN; tapes.

A PDUMP file (format as in pdump-file.c of larsbrinkhoff/pdp10-its-disassembler):
word 0 = 0; words 1-256 = page map, one word per 1K page; the rest of the first
1024 words unused; then every page that is in the file, in order; then the
start instruction and a few words of symbol information.

A dumped MacLisp does not contain the Lisp's own pure pages (the kernel code,
pure symbol blocks and pure list structure); they are mapped in again from the
Lisp file at startup. Everything the user loaded is present. This tool
reconstructs as much naming as the image and the FASL files allow:

* Symbols with impure symbol blocks: a symbol block (SY2) is two words at an
  even address, 777xxx,,value-cell and args,,pname, where pname is a list of
  fixnums holding 5 characters each (src/l/defns.240); a symbol header is a
  word whose LH points at an SY2 block and whose RH is the property list.
* Pure ("system") atoms have their headers in the image but their pnames in
  the absent pure pages. They are named by:
  - aligning functions compiled in the FASL files with the same functions in
    the image (difflib on instruction sequences): quoted atoms, quoted lists,
    special-variable references and call links at aligned positions give the
    image addresses of the atoms the FASL names;
  - property-list fingerprints: a property value |NAME IND| under indicator IND
    names its atom NAME (compiled macros are |FOO MACRO|, GRIND's are
    |FOO #GRIND-FN|);
  - the property indicators themselves (SUBR, LSUBR, FSUBR, MACRO, AUTOLOAD),
    from ARGS information and value kinds.
* Kernel routines (JSP T,nnnnn etc.): FASL words carrying GLOBALSYM or DDT
  relocations give, at aligned positions, image RH - FASL RH = the routine's
  address (SPECBIND, UNBIND, %CONS, %XCONS, %NCONS, CARCDR, R70, ...). The
  CARCDR table is expanded into its entry names (%CADR, %CDDR, ...).
* Call links: compiled code in the image calls through a table of link cells
  (XCT cell); each cell holds CALL n,'F (or a snapped PUSHJ/JRST to the code).
  The cell's contents and the FASL alignment both name the callee.

Outputs (python -I tools/pdump.py --all):
  reports/pdump/<tape>_<file>.txt        symbols, naming summary, KEN1 coverage
  reports/pdump/<tape>_<file>.code.txt   listing of every compiled entry
  reports/pdump/ken1/<FILE>.txt          (TS D2500 only) listings grouped by the
                                         KEN1; file each definition came from,
                                         with best-effort decompilations
"""

import collections
import difflib
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
XCT = 0o256

# Entry points in MacLisp's CARCDR table (src/l/lisp.156); offset -> operation.
CARCDR_TABLE = {
    0: "CADDDR", 1: "CADDAR", 2: "CADDR", 3: "CADAR", 4: "CADR", 5: "CAAR", 6: "CAR",
    8: "CDDDDR", 9: "CDDDAR", 10: "CDDDR", 11: "CDDAR", 12: "CDDR", 13: "CDAR", 14: "CDR",
    16: "CAADDR", 17: "CAADAR", 18: "CAADR", 19: "CAAAR", 21: "CDADDR", 22: "CDADAR",
    23: "CDADR", 24: "CDAAR", 26: "CAAADR", 27: "CAAAAR", 29: "CDDADR", 30: "CDDAAR",
    32: "CDAADR", 33: "CDAAAR", 35: "CADADR", 36: "CADAAR",
}


# Pure atoms identified from Director's own sources, where a macro expander in the
# image builds a form whose source text survives. Keyed by the image's ITS name.
SOURCE_EVIDENCE = {
    "TS D2500": {
        0o75106: ("LAMBDA", "ASK-EACH's expander builds (DIRECTOR-MAPCAR (FUNCTION (#75106 (ACTOR) ...)) ...), "
                            "the form in macro-expanded KEN;SOME (9004336 some.lmlisp: (FUNCTION (LAMBDA (ACTOR) ...))); "
                            "its plist holds a GRIND template; struct.660 puts LAMBDA after VALUE"),
        0o75333: ("GET", "ASK-ALL's expander builds (#75333 (FIRST x) 'NON-ATOMIC-ACTORS), the source text "
                         "(get (first name) 'non-atomic-actors) of KEN;SOME 665"),
    },
}


# Pure atoms identified from how the compiled code in TS D2500 uses them.
# Each was checked by reading the code; where struct.660's order leaves a
# choice, the alternatives are named in the reason.
USAGE_EVIDENCE = {
    "TS D2500": {
        0o75163: ("?", "FULL-PRINT-MODE returns its list of options when its argument is this atom; "
                       "the pattern code tests for it and conses it onto variables (order allows ^B, ? "
                       "or **MISSING-ARG**)"),
        0o75320: ("NULL", "ONE-LONG expands to (AND (LISTP x) (#75320 (REST x))) and TWO-LONG to "
                          "(AND (LISTP (REST x)) (#75320 (NTH-REST 2 x)))"),
        0o75124: ("&REST", "the DEFUN&/DEFMACRO argument-list code tests elements against 75125, 75124 and "
                           "&OPTIONAL and MEMQs 75124 in the list; struct.660 puts &REST, &AUX after &OPTIONAL"),
        0o75125: ("&AUX", "see 75124 (&REST)"),
        0o75247: ("NOT", "expansions build (#75247 (= a b)), (#75247 (< a b)), (#75247 (> a b)); a "
                         "REPLACE-NTH message reads ... IS #75247 EVEN (order allows PAIRP or NOT)"),
        0o75251: ("TYPEP", "the LISTP macro expands to (EQ (#75251 x) 'LIST) (order allows ATOM or TYPEP)"),
        0o75336: ("REMPROP", "DEFINE-FUNCTION and DEFINE-MACRO expand to (#75336 'name 'AUTOLOAD), "
                             "PUT-FUNCTION-DEFINITION to (#75336 name 'EXPR) (order allows SUBLIS or REMPROP)"),
        0o75435: ("PUTPROP", "PUT-FUNCTION-DEFINITION expands to (PROGN (REMPROP name 'EXPR) "
                             "(#75435 name definition 'EXPR))"),
        0o76123: ("SFA", "FORMAT-STREAM-TYPE returns 76123 when the array header has AS.SFA (200000), "
                         "'FILE for a file array (AS.FIL 40000), and 76176 when the file's TTS.TY bit (400) "
                         "is on (bit values from MacLisp's defns.240)"),
        0o76176: ("TTY", "see 76123 (SFA)"),
        0o75713: ("MACROFETCH", "the DEFMACRO expander wraps each expansion in (#75713 FORM) and "
                                "(#75714 ...), the MACROFETCH/MACROMEMO shape of every DEFMAX macro"),
        0o75714: ("MACROMEMO", "see 75713; MACROFETCH also tests the displace switch against 75714"),
        0o75712: ("FLUSH-MACROMEMOS", "the DEFMACRO expander builds (#75712 'name); struct.660 puts "
                                      "FLUSH-MACROMEMOS just before MACROFETCH and MACROMEMO"),
        0o75715: ("MACROEXPAND", "MACROMEMO tests the displace switch against MACROEXPANDED, 75715 and "
                                 "DISPLACE; struct.660 puts MACROEXPAND just after MACROMEMO"),
        0o75744: ("DEFMACRO", "DEFINE-MACRO expands to (#75744 (name #75721 T) args . body), DEFMACRO's "
                              "(name option value) syntax; the DEFMACRO expander memoizes under this name"),
        0o75464: ("PUSH", "ACTOR-PUSH expands to (#75464 x *STACK-OF-ACTORS) and DIRECTOR-MAPCAR builds "
                          "(#75464 x RESULT) (order allows PUSH or POP)"),
        0o75154: ("BLOCK", "#1PRINTER picks #1CRUSH-, #1TBLOCK-, #1BLOCK- or #1MISER-TEMPLATE for the "
                           "modes CRUSH, TBLOCK, 75154 and MISER"),
        0o75462: ("CASEQ", "the DEFMACRO-package code treats 75462 like TYPECASEQ (order allows CASEQ)"),
        0o75327: ("SYMBOLP", "EQ-FIRST-CHARACTER expands to (AND (#75327 x) (= (#75373 x 1) code)), where "
                             "code is (#75373 char 1) computed at expansion time"),
        0o75373: ("GETCHARN", "see 75327 (SYMBOLP); struct.660 also puts GETCHARN right after XCONS (75372)"),
        0o75272: ("FIX", "ROUND expands to (#75272 (+$ 0.5 x)), and compiled code adds 0.5 (FADRI 200400) "
                         "and then calls through a link snapped to the kernel's FIX"),
        0o75316: ("IFIX", "called with NCALL 1 (one argument, numeric result) by turtle code; of the atoms "
                          "struct.660 allows here (PUREP, TIME, FIX, IFIX) only FIX and IFIX fit, and FIX is 75272"),
        0o75732: ("DEFUN&-ERROR", "called with no arguments at each point where the DEFUN& argument-list "
                                  "parser rejects a list (non-symbol variable, duplicate variable, misplaced "
                                  "&OPTIONAL), the places where DEFMAC (src/nilcom/defmac.166) calls (DEFUN&-ERROR)"),
    },
}

# Naming evidence that does not come from the struct.660 order itself.
INDEPENDENT_SOURCES = ("FASL alignment", "call link", "indicator", "plist fingerprint",
                       "Director source evidence", "pattern predicates", "code usage")


STRUCT_SOURCES = ("struct.660 alignment", "struct.660 order", "struct.660 runs")


def is_pdump(words):
    if len(words) < 1024 or words[0] != 0:
        return False
    pm = words[1:257]
    if any((w >> 18) & ~0o700000 for w in pm):      # LH may hold only the absolute/copy/share bits
        return False
    present = sum(1 for w in pm if w and not w & (PAGE_ABS | PAGE_SHARE) and w & (PAGE_READ | PAGE_WRITE))
    return present > 0 and 1024 * (present + 1) <= len(words)


# ---------------------------------------------------------------------------
# The image.

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
        return "".join(s) if n else None          # a symbol may have an empty pname (||)

    def _symbols(self):
        mem = self.mem
        self.sy2 = {}
        for a, w in mem.items():
            if a % 2 == 0 and (w >> 27) == 0o777 and (a + 1) in mem:
                nm = self.pname(mem[a + 1] & iw.RIGHT)
                if nm is not None:
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
        # Symbol-header segments (BIBOP segments of 512 words hold one type).
        segcount = collections.Counter(a >> 9 for a in self.syms)
        self.sysegs = {s for s, c in segcount.items() if c >= 2}
        # Value cells (SY2 word 0 RH) of named symbols.
        self.vcells = {}
        for a, v in self.syms.items():
            vc = mem[v[2]] & iw.RIGHT
            if vc:
                self.vcells.setdefault(vc, v[0])
        # Segments holding conses and fixnums (from plists and pnames).
        self.listsegs, self.fixsegs = set(), set()
        for a, v in self.syms.items():
            p, n = v[1], 0
            while p and p in mem and n < 80 and (p >> 9) not in self.sysegs:
                self.listsegs.add(p >> 9)
                p = mem[p] & iw.RIGHT
                n += 1
        for a in self.sy2:
            p = mem[a + 1] & iw.RIGHT
            while p and p in mem and (p >> 9) not in self.sysegs:
                self.listsegs.add(p >> 9)
                self.fixsegs.add((mem[p] >> 18) >> 9)
                p = mem[p] & iw.RIGHT
        self.fixsegs -= self.listsegs
        self.fixsegs -= self.sysegs
        for s in (0,):
            self.listsegs.discard(s)
            self.fixsegs.discard(s)

    def is_symbol(self, a):
        return a in self.names or ((a >> 9) in self.sysegs and a in self.mem)

    def plist_of(self, a, limit=60):
        """(indicator, value) pairs of the symbol whose header is at a."""
        if a not in self.mem:
            return []
        out = []
        p = self.mem[a] & iw.RIGHT
        n = 0
        while p and p in self.mem and n < limit and (p >> 9) in self.listsegs:
            c = self.mem[p]
            nxt = c & iw.RIGHT
            if nxt == 0 or nxt not in self.mem:
                break
            out.append((c >> 18, self.mem[nxt] >> 18))
            p = self.mem[nxt] & iw.RIGHT
            n += 1
        return out

    def plist(self, a):
        return self.plist_of(a)


# ---------------------------------------------------------------------------
# Naming.

class Names:
    """All the names that can be attached to addresses in the image."""

    def __init__(self, img):
        self.img = img
        self.atom = dict(img.names)                 # symbol header -> name
        self.atom_src = {a: "pname" for a in img.names}
        self.vcell = dict(img.vcells)               # value cell -> symbol name
        self.kernel = {}                            # kernel address -> name
        self.links = {}                             # link cell -> callee name
        self.link_src = {}
        self.arrays = {}                            # SAR address -> array name
        self.entries = {}                           # code address -> (function, property)
        self.inds = {}
        self.stats = collections.Counter()
        self.conflicts = []
        self.evidence = {}
        self.image_name = None
        self.in0 = None
        self.flosegs = set()
        self.segtype = {}
        self.vcsegs = set()
        self.vcell_unknown = {}

    # -- helpers ---------------------------------------------------------
    def sym(self, a):
        """Printed name of a symbol address (resolved or #octal)."""
        if a == 0:
            return "NIL"
        if a in self.atom:
            return fasl.fmt_sym(self.atom[a])
        return "#%o" % a

    def ind_name(self, ind):
        return self.atom.get(ind) or self.inds.get(ind) or ("#%06o" % ind)

    def sexp(self, v, budget=None, depth=0):
        img = self.img
        if budget is None:
            budget = [300]
        budget[0] -= 1
        if budget[0] < 0:
            return "..."
        if v == 0:
            return "NIL"
        if v in self.atom or img.is_symbol(v):
            return self.sym(v)
        seg = v >> 9
        if seg in img.fixsegs and v in img.mem:
            return str(iw.signed(img.mem[v]))
        if seg in self.flosegs and v in img.mem:
            return fasl.fmt(fasl.Num("flonum", fasl.pdp10_float(img.mem[v]), [img.mem[v]]))
        if self.small_fixnum(v) is not None:
            return str(self.small_fixnum(v))
        if seg in img.listsegs and v in img.mem and depth < 30:
            items = []
            p, n = v, 0
            while p and n < 400:
                if (p >> 9) not in img.listsegs or p not in img.mem:
                    items.append(". " + self.sexp(p, budget, depth + 1))
                    break
                c = img.mem[p]
                items.append(self.sexp(c >> 18, budget, depth + 1))
                p = c & iw.RIGHT
                n += 1
                if budget[0] < 0:
                    items.append("...")
                    break
            if len(items) == 2 and items[0] == "QUOTE":
                return "'" + items[1]
            return "(" + " ".join(items) + ")"
        if v in self.kernel:
            return "#<%s>" % self.kernel[v]
        return "#%o" % v

    def to_obj(self, v, budget=None, depth=0):
        """Image structure as fasl objects (Sym, Num, list, Dotted) for fasl.pretty."""
        img = self.img
        if budget is None:
            budget = [4000]
        budget[0] -= 1
        if budget[0] < 0 or depth > 60:
            return fasl.Sym("...")
        if v == 0:
            return fasl.Sym("NIL")
        if v in self.atom or img.is_symbol(v):
            return fasl.Sym(self.atom.get(v) or "#%o" % v)
        seg = v >> 9
        if seg in img.fixsegs and v in img.mem:
            return fasl.Num("fixnum", iw.signed(img.mem[v]), [])
        if seg in self.flosegs and v in img.mem:
            return fasl.Num("flonum", fasl.pdp10_float(img.mem[v]), [img.mem[v]])
        if self.small_fixnum(v) is not None:
            return fasl.Num("fixnum", self.small_fixnum(v), [])
        if seg in img.listsegs and v in img.mem:
            items = []
            p, n = v, 0
            while p and n < 1000:
                if (p >> 9) not in img.listsegs or p not in img.mem:
                    return fasl.Dotted(items, self.to_obj(p, budget, depth + 1))
                c = img.mem[p]
                items.append(self.to_obj(c >> 18, budget, depth + 1))
                p = c & iw.RIGHT
                n += 1
            return items
        return fasl.Sym("#%o" % v)

    # -- building --------------------------------------------------------
    def build(self):
        img = self.img
        self._indicators()
        self._entries()
        self._align_fasls()
        self._plist_fingerprints()
        self._links()
        self._plist_fingerprints()      # links can name more atoms
        self._struct_order(fill=False)  # drops single-vote FASL names that contradict the order
        self._source_evidence()
        self._struct_dp()
        self._source_evidence()
        self._pattern_evidence()        # needs EQ, QUOTE and the C...R atoms named
        self._struct_dp(redo=True)      # again, with the pattern evidence as anchors
        self._source_evidence()
        self._struct_runs()
        self._struct_order()            # fill gaps between named atoms
        self._name_unbound()
        self._links()
        self._plist_fingerprints()
        self._links()
        self._recompute_spans()
        self._expand_kernel()
        self._segment_types()
        return self

    def _segment_types(self):
        """The segment table (ST, at 4000) holds each 512-word segment's type
        bits and, in the right half, the type's atom (LIST, FIXNUM, FLONUM ...)."""
        img = self.img
        self.segtype = {}
        for seg in range(0o1000):
            w = img.mem.get(0o4000 + seg)
            if w and (w & iw.RIGHT) in self.atom:
                self.segtype[seg] = self.atom[w & iw.RIGHT]
        self.flosegs = {s for s, n in self.segtype.items() if n == "FLONUM"}
        # Value-cell space: the segment holding the known value cells. Its other
        # cells (LH 0) belong to system variables whose symbol blocks are pure;
        # they print as #vcNNNNN.
        cnt = collections.Counter(a >> 9 for a in self.vcell)
        self.vcsegs = {s for s, n in cnt.items() if n >= 20}
        self.vcell_unknown = {a: "#vc%o" % a for s in self.vcsegs for a in range(s << 9, (s + 1) << 9)
                              if a in img.mem and a not in self.vcell and not img.mem[a] >> 18}
        img.fixsegs |= {s for s, n in self.segtype.items()
                        if n == "FIXNUM" and (s << 9) in img.mem and s not in img.listsegs}

    def _struct_dp(self, redo=False):
        """Align the pure atoms with MacLisp's allocation order in
        src/l/struct.660 (tools/maclisp_atoms_1981.txt) by dynamic programming.

        Evidence per image atom: its header word's RH. Atoms that have their own
        property list (MKAT and friends) point into a pure list area where each
        atom's 2 plist cells are followed by its pname cells, so consecutive such
        pointers differ by 2 + the pname cells in between; atoms without a plist
        have RH 0. The 1981 list gives each atom's kind and pname length. Atoms
        already named by other evidence pin the alignment."""
        path = os.path.join(ROOT, "tools", "maclisp_atoms_1981.txt")
        if not os.path.exists(path):
            return
        if redo:
            for a in [a for a, s in self.atom_src.items() if s == "struct.660 alignment"]:
                del self.atom[a]
                del self.atom_src[a]
            self.stats["atoms named by struct.660 alignment"] = 0
            for k in [k for k in self.stats if k.startswith("struct.660 DP")]:
                del self.stats[k]
        rows = []
        for l in open(path, encoding="utf-8"):
            if l.strip():
                k, c, n = l.rstrip("\n").split("\t", 2)
                rows.append((k, int(c), n))
        img = self.img
        t_addr = next((a for a, n in self.atom.items() if n == "T" and self.atom_src.get(a) != "pname"), None)
        if t_addr is None or t_addr not in img.mem:
            return
        base_lh = img.mem[t_addr] >> 18
        start = next((a for a in range(t_addr + 1, t_addr + 64)
                      if a in img.mem and (img.mem[a] >> 18) == base_lh + 4), None)
        if start is None:
            return
        addrs = []
        a = start
        while a in img.mem:
            lh = img.mem[a] >> 18
            if lh != base_lh + 4 + 2 * (a - start):
                # A symbol block copied out later (e.g. MACRO, GC-DAEMON) keeps its
                # place; a user symbol with its own pname ends the pure atoms.
                if a in img.names and img.syms[a][2] == lh:
                    break
            addrs.append(a)
            a += 1
        # Image features.  The pure list area (shared with the system Lisp, so
        # not in the dump) was filled in allocation order: each MKAT atom's 2
        # plist cells followed by its pname cells, and just the pname cells of
        # every other atom.  An atom's original plist pointer is its header RH or,
        # when properties were added at run time, the tail where its impure
        # plist cells end.
        def orig_ptr(a):
            p = img.mem[a] & iw.RIGHT
            n = 0
            while p and p in img.mem and n < 60:
                c2 = img.mem[p] & iw.RIGHT
                if c2 not in img.mem:
                    return None
                p = img.mem[c2] & iw.RIGHT
                n += 1
            if p == 0:
                return 0
            if p not in img.mem and 0o100000 <= p < 0o200000:
                return p
            return None
        orig = [orig_ptr(a) for a in addrs]
        # The allocation chain: the longest run of increasing pointers with room
        # for the atoms in between (shared plists point elsewhere and drop out).
        cand = [(j, p) for j, p in enumerate(orig) if p]
        best = [(1, -1)] * len(cand)
        for b, (jb, pb) in enumerate(cand):
            for a_ in range(b):
                ja, pa = cand[a_]
                gap = jb - ja
                if gap + 2 <= pb - pa <= 10 * gap + 2 and best[a_][0] + 1 > best[b][0]:
                    best[b] = (best[a_][0] + 1, a_)
        chain = []
        if cand:
            b = max(range(len(cand)), key=lambda x: best[x][0])
            while b >= 0:
                chain.append(cand[b])
                b = best[b][1]
            chain.reverse()
        in_chain = {j for j, p in chain}
        typ = []
        for j in range(len(addrs)):
            if orig[j] == 0:
                typ.append("Z")
            elif j in in_chain:
                typ.append("P")
            elif orig[j]:
                typ.append("X")         # shares a plist allocated elsewhere
            else:
                typ.append("U")         # plist replaced; original kind unknown
        # span[j] = (d, D): the next chain atom is d atoms on, D cells further.
        span = {}
        for (j1, p1), (j2, p2) in zip(chain, chain[1:]):
            if j2 - j1 <= 40 and all(typ[k] in ("Z", "X") for k in range(j1 + 1, j2)):
                span[j1] = (j2 - j1, p2 - p1)
        cells = [span[j][1] - 2 if j in span and span[j][0] == 1 else None for j in range(len(addrs))]
        self.stats["struct.660 DP: atoms in the pure allocation chain"] = len(chain)

        def span_expected(i, d):
            if i + d > len(rows):
                return None
            return 2 + sum(rows[i + k][1] for k in range(d))
        known = {}
        for j, a in enumerate(addrs):
            if a in self.atom and self.atom_src.get(a) in INDEPENDENT_SOURCES:
                known[j] = self.atom[a]

        def mscore(i, j):
            k81, c81, n81 = rows[i]
            t = typ[j]
            if t == "Z":
                return 3 if k81 == "Z" else (-4 if k81 == "P" else 0)
            if t == "P":
                v = 3 if k81 == "P" else (0 if k81 == "H" else -4)
                if j in span and k81 == "P":
                    d, D = span[j]
                    v += 3 if span_expected(i, d) == D else -5
                return v
            if t == "X":
                return 1 if k81 == "H" else 0
            return 0

        n, m = len(rows), len(addrs)
        NEG = -1e9
        SKIP_ROW, SKIP_ATOM = -1.0, -4.0     # a 1981 atom missing in 1980 is the likelier change

        def vscore(i, j, use_anchors):
            v = float(mscore(i, j))
            if use_anchors and j in known:
                v += 25 if known[j] == rows[i][2] else -25
            return v

        def forward(use_anchors):
            F = [[NEG] * (m + 1) for _ in range(n + 1)]
            back = [[0] * (m + 1) for _ in range(n + 1)]
            F[0][0] = 0.0
            for i in range(n + 1):
                Fi = F[i]
                for j in range(m + 1):
                    s = Fi[j]
                    if s == NEG:
                        continue
                    if i < n and s + SKIP_ROW > F[i + 1][j]:
                        F[i + 1][j] = s + SKIP_ROW
                        back[i + 1][j] = 1
                    if j < m and s + SKIP_ATOM > Fi[j + 1]:
                        Fi[j + 1] = s + SKIP_ATOM
                        back[i][j + 1] = 2
                    if i < n and j < m:
                        v = s + vscore(i, j, use_anchors)
                        if v > F[i + 1][j + 1]:
                            F[i + 1][j + 1] = v
                            back[i + 1][j + 1] = 3
            return F, back

        def backward(use_anchors):
            B = [[NEG] * (m + 1) for _ in range(n + 1)]
            B[n][m] = 0.0
            for i in range(n, -1, -1):
                Bi = B[i]
                for j in range(m, -1, -1):
                    best = Bi[j]
                    if i < n and B[i + 1][j] + SKIP_ROW > best:
                        best = B[i + 1][j] + SKIP_ROW
                    if j < m and Bi[j + 1] + SKIP_ATOM > best:
                        best = Bi[j + 1] + SKIP_ATOM
                    if i < n and j < m and B[i + 1][j + 1] > NEG:
                        v = B[i + 1][j + 1] + vscore(i, j, use_anchors)
                        if v > best:
                            best = v
                    Bi[j] = best
            return B

        def traceback(back):
            i, j = n, m
            pairs = []
            while i > 0 or j > 0:
                b = back[i][j]
                if b == 3:
                    pairs.append((i - 1, j - 1))
                    i, j = i - 1, j - 1
                elif b == 1:
                    i -= 1
                else:
                    j -= 1
            pairs.reverse()
            return pairs

        # Validation: the alignment from header features alone, compared with
        # atoms named by independent evidence.
        F0, back0 = forward(False)
        free = traceback(back0)
        agree = sum(1 for i, j in free if j in known and known[j] == rows[i][2])
        disagree = sum(1 for i, j in free if j in known and known[j] != rows[i][2])
        self.stats["struct.660 DP without anchors: known atoms recovered"] = agree
        self.stats["struct.660 DP without anchors: known atoms missed"] = disagree
        F, back = forward(True)
        B = backward(True)
        pairs = traceback(back)
        matched = dict((j, i) for i, j in pairs)
        # Max-marginal check: the best complete alignment that gives atom j any
        # other row (or none) must score clearly lower than the chosen one.
        margin = {}
        for j in range(m):
            best_alt = NEG
            mine = None
            for i in range(n):
                if F[i][j] == NEG or B[i + 1][j + 1] == NEG:
                    s_match = NEG
                else:
                    s_match = F[i][j] + vscore(i, j, True) + B[i + 1][j + 1]
                if matched.get(j) == i:
                    mine = s_match
                elif s_match > best_alt:
                    best_alt = s_match
                if F[i][j] > NEG and B[i][j + 1] > NEG:
                    s_skip = F[i][j] + SKIP_ATOM + B[i][j + 1]
                    if s_skip > best_alt:
                        best_alt = s_skip
            if mine is not None:
                margin[j] = mine - best_alt
        self.struct_margin = {addrs[j]: v for j, v in margin.items()}
        # A chain atom's span is checked with the rows actually matched to it
        # and to the atoms up to the next chain atom; a failed check rejects them all.
        bad_span = set()
        for j, (d, D) in span.items():
            i = matched.get(j)
            if i is None or any(matched.get(j + k) != i + k for k in range(d)):
                continue
            if span_expected(i, d) != D:
                bad_span.update(range(j, j + d))
        self.stats["struct.660 DP matches rejected by pname spans"] = len(bad_span)
        MARGIN = 3.0
        for j, i in sorted(matched.items()):
            k81, c81, n81 = rows[i]
            t = typ[j]
            if t == "Z" and k81 == "P" or t == "P" and k81 == "Z":
                continue
            if j in bad_span:
                continue
            if margin.get(j, 0) < MARGIN:
                self.stats["struct.660 DP matches rejected as ambiguous"] += 1
                continue
            a = addrs[j]
            if a in self.atom and self.atom_src.get(a) != "pname" and self.atom[a] != n81:
                if self.atom_src.get(a) == "FASL alignment" and sum(self.align_votes[0].get(a, {}).values()) <= 1:
                    del self.atom[a]
                    del self.atom_src[a]
                else:
                    self.conflicts.append(("atom", a, self.atom[a], n81, "struct.660 DP"))
                    continue
            self._name_atom(a, n81, "struct.660 alignment")
        self.struct_range = (addrs[0], addrs[-1]) if addrs else None
        self.struct_pairs = len(pairs)
        # Allocation addresses in the pure list area: an MKAT atom's plist
        # pointer, or the pname pointer of an atom whose symbol block (SY2) was
        # copied into impure memory, where it can be read.
        pos = {j: p for j, p in chain}
        for j, a in enumerate(addrs):
            sy2 = img.mem[a] >> 18
            if sy2 in img.mem and sy2 + 1 in img.mem:
                pn = img.mem[sy2 + 1] & iw.RIGHT
                if pn not in img.mem and 0o100000 <= pn < 0o200000:
                    start_ = pn - (2 if typ[j] == "P" else 0)
                    if j in pos and pos[j] != start_:
                        continue
                    pos[j] = start_
        self.struct_dp = {"rows": rows, "addrs": addrs, "typ": typ, "span": span, "pos": pos,
                          "matched": matched, "margin": margin}

    def _struct_runs(self):
        """Name the atoms between confidently placed ones by exhaustive search.

        Between two placed atoms, the unplaced atoms take 1981 rows from those
        in between, in order; surplus rows are atoms MacLisp gained after 1980.
        A placement must fit the header types (no plist vs own plist) and every
        known allocation address: the distance between two atoms whose address
        in the pure list area is known equals what the atoms in between
        allocated (2 plist cells if they own a plist, plus their pname cells).
        An atom is named only when every fitting placement gives it the same row."""
        feat = getattr(self, "struct_dp", None)
        if not feat:
            return
        rows, addrs, typ, pos, matched = feat["rows"], feat["addrs"], feat["typ"], feat["pos"], feat["matched"]
        placed, extra = {}, {}
        for j, a in enumerate(addrs):
            n = self.atom.get(a)
            if n is None or self.atom_src.get(a) == "pname":
                continue
            i = matched.get(j)
            if i is not None and rows[i][2] == n:
                placed[j] = i
            else:
                extra[j] = (len(n) + 4) // 5 + (2 if typ[j] == "P" else 0)

        def alloc(j, i):
            return rows[i][1] + (2 if typ[j] == "P" else 0)

        def fits(j, i):
            k = rows[i][0]
            return not (typ[j] == "Z" and k == "P" or typ[j] == "P" and k == "Z")
        def solve(ja, jb, max_extra):
            """Options per unplaced atom between placed atoms ja and jb: row
            indexes, or "X" for an atom absent from the 1981 list."""
            ia, ib = placed[ja], placed[jb]
            free = [j for j in range(ja + 1, jb) if j not in extra]
            seq = list(range(ja, jb + 1))
            nseq = len(seq)
            prevpos, lastp = [], None
            for t_, j in enumerate(seq):
                prevpos.append(lastp)
                if j in pos:
                    lastp = t_
            later, flag = [False] * (nseq + 1), False
            for t_ in range(nseq - 1, -1, -1):
                flag = flag or seq[t_] in pos
                later[t_] = flag

            def check(t_, acc):
                j = seq[t_]
                return not (j in pos and prevpos[t_] is not None and acc is not None
                            and acc != pos[j] - pos[seq[prevpos[t_]]])

            def moves(t_, state):
                i_next, acc, nx = state
                j = seq[t_]
                if not check(t_, acc):
                    return []
                if j in pos:
                    acc = 0
                track = (j in pos or prevpos[t_] is not None) and later[t_ + 1]

                def add(acc_, n):
                    return (acc_ + n) if (track and acc_ is not None) else (None if track else 0)
                if j == ja:
                    return [(None, (ia + 1, add(acc, alloc(j, ia)), nx))]
                if j in extra:
                    return [(None, (i_next, add(acc, extra[j]), nx))]
                out = [(i, (i + 1, add(acc, alloc(j, i)), nx)) for i in range(i_next, ib) if fits(j, i)]
                if nx < max_extra:
                    out.append(("X", (i_next, None if track else 0, nx + 1)))
                return out
            F = [{(ia + 1, 0, 0)}]
            for t_ in range(nseq - 1):
                nxt = set()
                for s in F[t_]:
                    for _, s2 in moves(t_, s):
                        nxt.add(s2)
                if len(nxt) > 30000:
                    return "too big", None
                F.append(nxt)
            good = {s for s in F[nseq - 1] if s[0] <= ib and check(nseq - 1, s[1])}
            opts = {}
            for t_ in range(nseq - 2, -1, -1):
                g = set()
                for s in F[t_]:
                    for i, s2 in moves(t_, s):
                        if s2 in good:
                            g.add(s)
                            if seq[t_] in free:
                                opts.setdefault(seq[t_], set()).add(i)
                good = g
            if not good:
                return "unfit", None
            return "ok", opts

        js = sorted(placed)
        resolved = ambiguous = unfit = 0
        alternatives = {}
        extras_used = 0
        for ja, jb in zip(js, js[1:]):
            if placed[jb] <= placed[ja]:
                continue
            free = [j for j in range(ja + 1, jb) if j not in extra]
            if not free:
                continue
            # Fewest atoms outside the 1981 list first.
            for max_extra in (0, 1, 2, 3):
                status, opts = solve(ja, jb, max_extra)
                if status != "unfit":
                    break
            if status == "unfit":
                unfit += 1
                continue
            if status == "too big":
                ambiguous += 1
                continue
            extras_used += max_extra
            complete = True
            for j in free:
                o = opts.get(j, set())
                rows_o = sorted(x for x in o if x != "X")
                if len(o) == 1 and rows_o:
                    self._name_atom(addrs[j], rows[rows_o[0]][2], "struct.660 runs")
                    continue
                complete = False
                alternatives[addrs[j]] = [rows[i][2] for i in rows_o] + (["(not in the 1981 list)"] if "X" in o else [])
            if complete:
                resolved += 1
            else:
                ambiguous += 1
        self.stats["struct.660 runs: atoms outside the 1981 list assumed"] = extras_used
        self.struct_alternatives = alternatives
        self.stats["struct.660 runs: resolved completely"] = resolved
        self.stats["struct.660 runs: left with alternatives"] = ambiguous
        self.stats["struct.660 runs: no placement fits"] = unfit

    def cross_validate(self, folds=5, seed=1979):
        """Estimate how often the order-based names (struct.660 alignment, runs
        and order) are wrong: hide a fold of the atoms named by independent
        evidence, rerun the order-based naming, and compare."""
        import copy
        import random
        if not getattr(self, "struct_range", None):
            return None
        lo, hi = self.struct_range
        indep = sorted(a for a, s in self.atom_src.items() if s in INDEPENDENT_SOURCES and lo <= a <= hi)
        random.Random(seed).shuffle(indep)
        result = {"same": 0, "unnamed": 0, "different": 0, "cases": []}
        for f in range(folds):
            hide = set(indep[f::folds])
            other = copy.copy(self)
            other.atom = {a: n for a, n in self.atom.items()
                          if a not in hide and self.atom_src[a] not in STRUCT_SOURCES}
            other.atom_src = {a: self.atom_src[a] for a in other.atom}
            other.stats = collections.Counter()
            other.conflicts = []
            other._struct_dp()
            other._struct_runs()
            other._struct_order()
            for a in sorted(hide):
                got = other.atom.get(a)
                if got is None:
                    result["unnamed"] += 1
                elif got == self.atom[a]:
                    result["same"] += 1
                else:
                    result["different"] += 1
                    result["cases"].append((a, self.atom[a], got, other.atom_src.get(a)))
        return result

    def _source_evidence(self):
        image = getattr(self, "image_name", None)
        for table, src in ((SOURCE_EVIDENCE.get(image, {}), "Director source evidence"),
                           (USAGE_EVIDENCE.get(image, {}), "code usage")):
            for a, (name, why) in table.items():
                for b, n in list(self.atom.items()):
                    if n == name and b != a and self.atom_src.get(b) in STRUCT_SOURCES:
                        del self.atom[b]
                        del self.atom_src[b]
                        self.stats["names withdrawn in favor of source or usage evidence"] += 1
                if self.atom.get(a) != name:
                    if a in self.atom and self.atom_src.get(a) not in STRUCT_SOURCES:
                        self.conflicts.append(("atom", a, self.atom[a], name, src + " (overrides %s)"
                                               % self.atom_src.get(a)))
                    self.atom.pop(a, None)
                    self.atom_src.pop(a, None)
                    self._name_atom(a, name, src)
                self.evidence[a] = why

    def image_list(self, p, depth=0):
        """Image list structure as nested Python lists of addresses (atoms stay ints)."""
        img = self.img
        if depth > 40 or p == 0:
            return [] if p == 0 else None
        if (p >> 9) not in img.listsegs or p not in img.mem:
            return p
        out = []
        n = 0
        while p and n < 400:
            if (p >> 9) not in img.listsegs or p not in img.mem:
                return out
            c = img.mem[p]
            car = c >> 18
            out.append(self.image_list(car, depth + 1) if (car >> 9) in img.listsegs and car in img.mem else car)
            p = c & iw.RIGHT
            n += 1
        return out

    def _pattern_evidence(self):
        """Director's pattern predicates are named after their pattern, e.g.
        |(MOVE ?SPEED)P|, and test (EQ (C...R OBJECT) 'word) for each constant word.
        Interpreted ones (EXPR) and compiled ones (SUBR) both name the atoms they test."""
        import lispdecomp
        img = self.img
        votes = collections.defaultdict(collections.Counter)

        def words_of(name):
            if not (name.startswith("(") and name.endswith(")P")):
                return None
            body = name[1:-2]
            if any(ch in body for ch in "(){}[]|"):
                return None
            return body.split()

        def path_pos(path):
            # path letters outer-first, e.g. CADDR -> "ADD"; position = number of D's if it ends in A..D*
            if not path or path[0] != "A" or any(ch != "D" for ch in path[1:]):
                return None
            return len(path) - 1

        def name_of(a):
            return (self.atom.get(a) or img.names.get(a)) if isinstance(a, int) else None

        def walk_expr(form, obj_addr, words):
            # Interpreted: (EQ (C..R OBJECT) (QUOTE word)) for each constant word,
            # and (ONE-LONG (CD..DR OBJECT)) when the pattern ends in a variable.
            # A known C..R names the word; a word read from its own pname names the C..R.
            if not isinstance(form, list) or not form:
                return
            if len(form) == 3 and name_of(form[0]) == "EQ" and isinstance(form[1], list) \
                    and len(form[1]) == 2 and form[1][1] == obj_addr and isinstance(form[2], list) \
                    and len(form[2]) == 2 and name_of(form[2][0]) == "QUOTE":
                f, w = form[1][0], form[2][1]
                fn = name_of(f) or ""
                if fn.startswith("C") and fn.endswith("R"):
                    k = path_pos(fn[1:-1])
                    if k is not None and k < len(words) and not words[k].startswith("?"):
                        votes[w][words[k]] += 1
                wn = img.names.get(w) if isinstance(w, int) else None
                if wn and words.count(wn) == 1 and words.index(wn) <= 3 and isinstance(f, int):
                    votes[f]["CA" + "D" * words.index(wn) + "R"] += 1
            if len(form) == 2 and name_of(form[0]) == "ONE-LONG" and isinstance(form[1], list) \
                    and len(form[1]) == 2 and form[1][1] == obj_addr and words[-1].startswith("?") \
                    and 1 <= len(words) - 1 <= 4 and isinstance(form[1][0], int):
                votes[form[1][0]]["C" + "D" * (len(words) - 1) + "R"] += 1
            for x in form:
                walk_expr(x, obj_addr, words)

        def walk_tree(e, words):
            if isinstance(e, tuple):
                if e[0] == "call" and e[1] == "EQ" and len(e[2]) == 2:
                    a, b = e[2]
                    for x, y in ((a, b), (b, a)):
                        if y[0] == "sym" and len(y) > 2 and x[0] in ("car", "cdr"):
                            ops, base = lispdecomp.cr_chain(x)
                            if base == ("arg", 0):
                                k = path_pos("".join(ops))
                                if k is not None and k < len(words) and not words[k].startswith("?"):
                                    votes[y[2]][words[k]] += 1
                for z in e[1:]:
                    if isinstance(z, (tuple, list)):
                        walk_tree(z, words)
            elif isinstance(e, list):
                for z in e:
                    walk_tree(z, words)

        for name, hs in img.byname.items():
            words = words_of(name)
            if not words:
                continue
            for a in hs:
                for ind, v in img.plist_of(a):
                    iname = self.inds.get(ind) or self.atom.get(ind)
                    if iname == "EXPR":
                        lam = self.image_list(v)
                        if isinstance(lam, list) and len(lam) >= 3 and isinstance(lam[1], list) and lam[1]:
                            obj = lam[1][0]
                            for f in lam[2:]:
                                walk_expr(f, obj, words)
                    elif iname == "SUBR" and v in img.mem:
                        d = lispdecomp.Decompiler(self, v, name, "SUBR", 1)
                        try:
                            tree = d.decompile()
                        except Exception:
                            continue
                        walk_tree(tree, words)
        agree = disagree = new = 0
        for a, c in votes.items():
            nm, n = c.most_common(1)[0]
            if n < 0.8 * sum(c.values()):
                continue
            cur = self.atom.get(a)
            if cur == nm:
                agree += 1
                continue
            src = self.atom_src.get(a)
            if cur is None:
                self._name_atom(a, nm, "pattern predicates")
                new += 1
            elif src in STRUCT_SOURCES:
                disagree += 1
                self.conflicts.append(("atom", a, cur, nm, "pattern predicates override " + src))
                del self.atom[a]
                del self.atom_src[a]
                self._name_atom(a, nm, "pattern predicates")
            else:
                self.conflicts.append(("atom", a, cur, nm, "pattern predicates (kept %s)" % src))
        self.stats["pattern predicates: atoms confirmed"] = agree
        self.stats["pattern predicates: atoms newly named"] = new
        self.stats["pattern predicates: struct.660 names corrected"] = disagree

    def _name_unbound(self):
        """struct.660 allocates QUNBOUND (pname UNBOUND), the internal unbound
        marker, immediately after T."""
        t_addr = next((a for a, n in self.atom.items() if n == "T" and self.atom_src.get(a) != "pname"), None)
        if t_addr is not None and (t_addr + 1) not in self.atom:
            self._name_atom(t_addr + 1, "UNBOUND", "struct.660 layout")

    def _struct_order(self, fill=True):
        """Name pure system atoms by their allocation order in MacLisp's
        src/l/struct.660 (tools/maclisp_atoms_1981.txt): between two atoms
        already identified, if the address gap equals the gap in the 1981 list,
        the atoms in between are the ones listed there."""
        path = os.path.join(ROOT, "tools", "maclisp_atoms_1981.txt")
        if not os.path.exists(path):
            return
        rows81 = [l.rstrip("\n").split("\t") for l in open(path, encoding="utf-8") if l.strip()]
        names81 = [r[-1] for r in rows81]
        pos81 = collections.defaultdict(list)
        for i, n in enumerate(names81):
            pos81[n].append(i)
        t_addr = next((a for a, n in self.atom.items() if n == "T" and self.atom_src.get(a) != "pname"), None)
        if t_addr is None:
            return
        lo, hi = t_addr, t_addr + len(names81) + 400
        anchors = sorted((a, n) for a, n in self.atom.items()
                         if lo < a < hi and self.atom_src.get(a) != "pname" and n in pos81)
        # Choose increasing 1981 positions (longest chain with a sane offset drift).
        chain = []
        best = {}
        for idx, (a, n) in enumerate(anchors):
            for p in pos81[n]:
                cand = [(1, None)]
                for j in range(idx):
                    for pj, (length, _) in best.get(j, {}).items():
                        aj = anchors[j][0]
                        if pj < p and (a - aj) >= 0 and abs((a - aj) - (p - pj)) <= 40:
                            cand.append((length + 1, (j, pj)))
                best.setdefault(idx, {})[p] = max(cand, key=lambda t: t[0])
        end = None
        for idx in best:
            for p, (length, prev) in best[idx].items():
                if end is None or length > end[0]:
                    end = (length, idx, p)
        if end is None:
            return
        length, idx, p = end
        while True:
            chain.append((anchors[idx][0], anchors[idx][1], p))
            prev = best[idx][p][1]
            if prev is None:
                break
            idx, p = prev
        chain.reverse()
        self.struct_chain = chain
        # Leave-one-out check of the method.
        ok = bad = 0
        for i in range(1, len(chain) - 1):
            (a1, n1, p1), (a2, n2, p2), (a3, n3, p3) = chain[i - 1], chain[i], chain[i + 1]
            if self.atom_src.get(a2) not in INDEPENDENT_SOURCES:
                continue
            if a3 - a1 == p3 - p1:
                if names81[p1 + (a2 - a1)] == n2:
                    ok += 1
                else:
                    bad += 1
        self.stats["struct-order leave-one-out checks agreeing"] = ok
        self.stats["struct-order leave-one-out checks disagreeing"] = bad
        # Single-vote FASL names that contradict the chain are dropped.
        votes = self.align_votes[0]
        in_chain = {a for a, n, p in chain}
        for a, n in list(self.atom.items()):
            if self.atom_src.get(a) != "FASL alignment" or a in in_chain or not (lo < a < hi):
                continue
            if sum(votes.get(a, {}).values()) > 1:
                continue
            prev = max(((ca, cp) for ca, cn, cp in chain if ca < a), default=None)
            est = prev[1] + (a - prev[0]) if prev else None
            if est is not None and (n not in pos81 or all(abs(p - est) > 15 for p in pos81[n])):
                del self.atom[a]
                del self.atom_src[a]
                self.stats["single-vote FASL names dropped (contradict struct order)"] += 1
        if not fill:
            return
        feat = getattr(self, "struct_dp", None) or {}
        jof = {a: j for j, a in enumerate(feat.get("addrs", []))}
        typ, span = feat.get("typ", []), feat.get("span", {})

        def consistent(a, p):
            j = jof.get(a)
            if j is None:
                return True
            kind = rows81[p][0]
            if typ[j] == "Z" and kind == "P" or typ[j] == "P" and kind == "Z":
                return False
            if j in span:
                d, D = span[j]
                if p + d > len(rows81) or 2 + sum(int(rows81[p + k][1]) for k in range(d)) != D:
                    return False
            return True
        for (a1, n1, p1), (a2, n2, p2) in zip(chain, chain[1:]):
            if a2 - a1 == p2 - p1 and a2 - a1 > 1:
                if not all(consistent(a1 + k, p1 + k) for k in range(0, a2 - a1)):
                    self.stats["struct.660 order gaps rejected by header features"] += 1
                    continue
                for k in range(1, a2 - a1):
                    self._name_atom(a1 + k, names81[p1 + k], "struct.660 order")

    def _indicators(self):
        img = self.img
        uses = collections.defaultdict(list)
        for a in img.syms:
            for ind, v in img.plist_of(a):
                if ind not in img.names:
                    uses[ind].append((a, v))

        def is_code(v):
            seg = v >> 9
            return v in img.mem and not img.is_symbol(v) and seg not in img.listsegs and seg not in img.fixsegs

        code_inds = []
        for ind, lst in uses.items():
            vs = [v for a, v in lst]
            filenames = sum(1 for v in vs if v in img.names and ";" in img.names[v])
            macro_syms = sum(1 for (a, v) in lst if v in img.names and img.names[v] == img.names[a] + " MACRO")
            if len(vs) >= 5 and filenames >= 0.6 * len(vs):
                self.inds[ind] = "AUTOLOAD"
            elif len(vs) >= 5 and macro_syms >= 0.6 * len(vs):
                self.inds[ind] = "MACRO"
            elif len(vs) >= 5 and sum(1 for v in vs if is_code(v)) >= 0.8 * len(vs):
                args = [img.mem[img.syms[a][2] + 1] >> 18 for a, v in lst]
                nil_n = sum(1 for x in args if x and not x >> 9)
                m_n = sum(1 for x in args if x >> 9)
                code_inds.append((ind, nil_n, m_n, len(vs)))
        if code_inds:
            subr = max(code_inds, key=lambda t: t[1])
            self.inds[subr[0]] = "SUBR"
            rest = [t for t in code_inds if t[0] != subr[0]]
            if rest:
                lsubr = max(rest, key=lambda t: t[2])
                if lsubr[2]:
                    self.inds[lsubr[0]] = "LSUBR"
                    rest = [t for t in rest if t[0] != lsubr[0]]
                for t in rest:
                    if not t[1] and not t[2]:
                        self.inds[t[0]] = "FSUBR"
        self.ind_uses = uses
        for ind, nm in self.inds.items():
            self._name_atom(ind, nm, "indicator")

    def _entries(self):
        img = self.img
        code = {i for i, n in self.inds.items() if n in ("SUBR", "LSUBR", "FSUBR")}
        for a, nm in img.names.items():
            for ind, v in img.plist_of(a):
                if ind in code and v in img.mem:
                    kind = self.inds[ind]
                    if v not in self.entries or len(nm) < len(self.entries[v][0]):
                        self.entries[v] = (nm, kind)
        self.starts = sorted(self.entries)
        self.next_start = {a: (self.starts[i + 1] if i + 1 < len(self.starts) else None)
                           for i, a in enumerate(self.starts)}

    def _name_atom(self, a, name, src):
        if a in self.atom:
            if self.atom[a] != name and self.atom_src.get(a) != "pname":
                self.conflicts.append(("atom", a, self.atom[a], name, src))
            return
        self.atom[a] = name
        self.atom_src[a] = src
        self.stats["atoms named by " + src] += 1

    def _align_fasls(self):
        """Align every FASL function with the same-named function in the image."""
        img = self.img
        atom_v = collections.defaultdict(collections.Counter)
        vcell_v = collections.defaultdict(collections.Counter)
        kern_v = collections.defaultdict(collections.Counter)
        link_v = collections.defaultdict(collections.Counter)
        array_v = collections.defaultdict(collections.Counter)
        in0_v = collections.Counter()
        by_name = collections.defaultdict(list)
        for a, (nm, kind) in self.entries.items():
            by_name[nm].append(a)

        def ftok(ld):
            if ld is None:
                return ("?",)
            if ld.rtype == 3:
                return ("C",)
            return ("W", ld.word >> 18)

        def itok(w):
            op = w >> 27
            if op == XCT or op in fasl.CALL_UUOS:
                return ("C",)
            return ("W", w >> 18)

        def walk(form, p, depth=0):
            if depth > 40:
                return
            if isinstance(form, fasl.Sym):
                if form.name != "NIL" and p:
                    atom_v[p][form.name] += 1
                return
            if isinstance(form, list):
                for e in form:
                    if not p or p not in img.mem:
                        return
                    walk(e, img.mem[p] >> 18, depth + 1)
                    p = img.mem[p] & iw.RIGHT
            elif isinstance(form, fasl.Dotted):
                for e in form.items:
                    if not p or p not in img.mem:
                        return
                    walk(e, img.mem[p] >> 18, depth + 1)
                    p = img.mem[p] & iw.RIGHT
                walk(form.tail, p, depth + 1)

        pairs = 0
        for dirpath, _, files in os.walk(os.path.join(ROOT, "original")):
            for fn in sorted(files):
                if not fn.endswith(".fasl"):
                    continue
                try:
                    segs, info = fasl.parse(iw.decode_file(os.path.join(dirpath, fn)))
                except Exception:
                    continue
                for seg in segs:
                    ents = sorted((addr, nm.name) for (nm, typ, argl, addr, item) in seg.entries)
                    top = max(seg.loaded) + 1 if seg.loaded else 0
                    for i, (fa, nm) in enumerate(ents):
                        fend = ents[i + 1][0] if i + 1 < len(ents) else top
                        for ia in by_name.get(nm, []):
                            iend = self.next_start.get(ia) or ia + (fend - fa)
                            if iend - ia > 4000:
                                continue
                            ft = [ftok(seg.loaded.get(k)) for k in range(fa, fend)]
                            it = [itok(img.mem.get(k, 0)) for k in range(ia, iend)]
                            sm = difflib.SequenceMatcher(None, ft, it, autojunk=False)
                            blocks = sm.get_matching_blocks()
                            matched = sum(b.size for b in blocks)
                            if matched < 4 or matched < 0.6 * min(len(ft), len(it)):
                                continue
                            pairs += 1
                            for b in blocks:
                                for t in range(b.size):
                                    ld = seg.loaded.get(fa + b.a + t)
                                    w = img.mem.get(ia + b.b + t)
                                    if ld is None or w is None:
                                        continue
                                    rh = w & iw.RIGHT
                                    if ld.rtype == 3 and isinstance(ld.ref, fasl.Sym):
                                        if (w >> 27) == XCT:
                                            link_v[rh][ld.ref.name] += 1
                                        else:
                                            atom_v[rh][ld.ref.name] += 1
                                    elif ld.rtype == 4 and isinstance(ld.ref, fasl.Sym) and ld.ref.name != "NIL":
                                        atom_v[rh][ld.ref.name] += 1
                                    elif ld.rtype == 4 and isinstance(ld.ref, fasl.Num) and ld.ref.kind == "fixnum":
                                        in0_v[(rh - ld.ref.value) & iw.RIGHT] += 1
                                    elif ld.rtype == 2 and isinstance(ld.ref, fasl.Sym):
                                        vcell_v[rh][ld.ref.name] += 1
                                    elif ld.rtype == 10 and isinstance(ld.ref, fasl.Sym):
                                        array_v[rh][ld.ref.name] += 1
                                    elif ld.rtype == 5:
                                        walk(ld.ref, rh)
                                    for pt in ld.patches:
                                        if pt[0] in "+-" and not pt.startswith(("+DDT", "-DDT")):
                                            name = pt[1:]
                                        elif pt.startswith(("+DDT:", "-DDT:")):
                                            name = re.sub(r"\(.*|=.*", "", pt[5:])
                                        else:
                                            continue
                                        val = (rh - (ld.word & iw.RIGHT)) & iw.RIGHT
                                        if pt[0] == "-":
                                            val = (-val) & iw.RIGHT
                                        kern_v[name][val] += 1
        self.stats["FASL/image function pairs aligned"] = pairs
        for a, c in atom_v.items():
            nm, n = c.most_common(1)[0]
            if n >= 0.6 * sum(c.values()) and (img.is_symbol(a) or a in self.atom):
                self._name_atom(a, nm, "FASL alignment")
        for a, c in vcell_v.items():
            nm, n = c.most_common(1)[0]
            if n >= 0.6 * sum(c.values()) and a not in self.vcell:
                self.vcell[a] = nm
                self.stats["value cells named by FASL alignment"] += 1
        for a, c in array_v.items():
            nm, n = c.most_common(1)[0]
            self.arrays.setdefault(a, nm)
        for name, c in kern_v.items():
            top = c.most_common(2)
            val, n = top[0]
            second = top[1][1] if len(top) > 1 else 0
            if n >= 0.7 * sum(c.values()) or (n >= 2 and n >= 2 * second):
                if val not in self.kernel:
                    self.kernel[val] = name
                    self.stats["kernel symbols from GLOBALSYM/DDT alignment"] += 1
        for cell, c in link_v.items():
            nm, n = c.most_common(1)[0]
            if n >= 0.6 * sum(c.values()):
                self.links[cell] = nm
                self.link_src[cell] = "FASL alignment"
        self.align_votes = (atom_v, vcell_v, kern_v, link_v)
        if in0_v:
            val, n = in0_v.most_common(1)[0]
            if n >= 3 and n >= 0.6 * sum(in0_v.values()):
                self.in0 = val
                self.kernel.setdefault(val, "IN0")
                self.stats["IN0 (small fixnum table) located from aligned constants"] = n

    def _plist_fingerprints(self):
        img = self.img
        for seg in sorted(img.sysegs):
            for a in range(seg << 9, (seg + 1) << 9):
                if a in self.atom or a not in img.mem:
                    continue
                for ind, v in img.plist_of(a):
                    vn = self.atom.get(v)
                    iname = self.atom.get(ind) or self.inds.get(ind)
                    if vn and iname and vn.endswith(" " + iname) and len(vn) > len(iname) + 1:
                        self._name_atom(a, vn[:-len(iname) - 1], "plist fingerprint")
                        break

    def _links(self):
        """Resolve every XCT link cell used by compiled code."""
        img = self.img
        cells = set()
        for a in self.starts:
            end = self.next_start.get(a) or a + 2000
            for k in range(a, min(end, a + 4000)):
                w = img.mem.get(k)
                if w is not None and (w >> 27) == XCT and not (w >> 18) & 0o37:
                    cells.add(w & iw.RIGHT)
        self.link_cells = cells
        for cell in cells:
            w = img.mem.get(cell)
            if w is None:
                continue
            op = w >> 27
            rh = w & iw.RIGHT
            if op in fasl.CALL_UUOS:
                callee = self.atom.get(rh)
                known = self.links.get(cell)
                if known and rh not in self.atom and img.is_symbol(rh):
                    self._name_atom(rh, known, "call link")
                    callee = known
                if callee and cell not in self.links:
                    self.links[cell] = callee
                    self.link_src[cell] = "link cell"
            elif op in (0o260, 0o254):            # snapped: PUSHJ P,code or JRST code
                if rh in self.entries and cell not in self.links:
                    self.links[cell] = self.entries[rh][0]
                    self.link_src[cell] = "snapped link"
                elif cell in self.links and rh not in self.entries and rh not in self.kernel:
                    self.kernel[rh] = self.links[cell] + " (kernel SUBR)"
        self.stats["link cells used by code"] = len(cells)
        self.stats["link cells named"] = sum(1 for c in cells if c in self.links)

    def _recompute_spans(self):
        """Snapped links into present pages are entry points of functions whose
        symbols are pure atoms (system functions loaded into impure memory,
        e.g. the autoloaded MACROFETCH): list them as entries too."""
        img = self.img
        for cell in self.link_cells:
            w = img.mem.get(cell)
            if w is None or (w >> 27) not in (0o260, 0o254):
                continue
            rh = w & iw.RIGHT
            if rh in img.mem and rh not in self.entries and cell in self.links:
                self.entries[rh] = (self.links[cell], "SUBR via link")
                self.kernel.pop(rh, None)
        self.starts = sorted(self.entries)
        self.next_start = {a: (self.starts[i + 1] if i + 1 < len(self.starts) else None)
                           for i, a in enumerate(self.starts)}

    def _expand_kernel(self):
        base = next((a for a, n in self.kernel.items() if n == "CARCDR"), None)
        if base is not None:
            for off, op in CARCDR_TABLE.items():
                self.kernel.setdefault(base + off, "%" + op)

    def small_fixnum(self, r):
        """Value of a pointer into MacLisp's table of preallocated fixnums (IN0)."""
        if self.in0 is not None and -0o2000 <= r - self.in0 <= 0o4000 and r not in self.img.mem:
            return r - self.in0
        return None

    def kernel_name(self, r):
        if r in self.kernel:
            return self.kernel[r]
        for base_name in ("R70", "CARCDR"):
            base = next((a for a, n in self.kernel.items() if n == base_name), None)
            if base is not None and base < r <= base + 0o44:
                return "%s+%o" % (base_name, r - base)
        return None


# ---------------------------------------------------------------------------
# Disassembly.

def disasm_word(nm, w, here=None, span=None):
    """One word as LAP-ish text with names resolved. span: (start, name) of the
    current function, for local labels."""
    img = nm.img
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
        sf = nm.small_fixnum(r) if not (mn and fasl._is_immediate(mn) and mn.startswith(("J", "PUSHJ"))) else None
        if sf is not None and r != nm.in0:
            return "'%d" % sf
        kn = nm.kernel_name(r)
        if kn:
            return kn
        if r in nm.vcell:
            return "(SPECIAL %s)" % fasl.fmt_sym(nm.vcell[r])
        if r in nm.vcell_unknown:
            return "(SPECIAL %s)" % nm.vcell_unknown[r]
        if r in nm.arrays:
            return "(ARRAY %s)" % fasl.fmt_sym(nm.arrays[r])
        if r in nm.atom or img.is_symbol(r):
            return "'" + nm.sym(r)
        if r in nm.entries:
            return fasl.fmt_sym(nm.entries[r][0])
        if span and span[0] <= r < span[2]:
            return "%s+%o" % (fasl.fmt_sym(span[1]), r - span[0]) if r != span[0] else fasl.fmt_sym(span[1])
        seg = r >> 9
        if seg in img.listsegs and r in img.mem:
            s = "'" + nm.sexp(r, [80])
            return s if len(s) < 120 else s[:117] + "..."
        if seg in img.fixsegs and r in img.mem:
            return "'%d" % iw.signed(img.mem[r])
        if seg in nm.flosegs and r in img.mem:
            return "'" + fasl.fmt(fasl.Num("flonum", fasl.pdp10_float(img.mem[r]), [img.mem[r]]))
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
    text = "%s %s,%s%s%s" % (mn, fasl.ACS[ac], ind, opnd(mn), idx)
    if op == XCT and not x and not ind:
        callee = link_text(nm, r)
        if callee:
            text += "   ; " + callee
    return text


def link_text(nm, cell):
    img = nm.img
    w = img.mem.get(cell)
    if w is None:
        return None
    op = w >> 27
    ac = (w >> 23) & 0o17
    rh = w & iw.RIGHT
    callee = nm.links.get(cell)
    if op in fasl.CALL_UUOS:
        name = fasl.fmt_sym(callee) if callee else nm.sym(rh)
        kind = {0o16: " lsubr-style", 0o17: " fsubr-style"}.get(ac, "")
        return "%s %o,'%s%s" % (fasl.UUOS[op], ac, name, kind)
    if op in (0o260, 0o254):
        target = fasl.fmt_sym(callee) if callee else (nm.kernel_name(rh) or "%o" % rh)
        return "%s %s (snapped link)" % ("PUSHJ P," if op == 0o260 else "JRST", target)
    return "cell holds %s" % iw.octal(w)


def function_span(nm, a):
    end = nm.next_start.get(a) or a + 2000
    return a, end


def listing_lines(nm, a, label=None, max_words=3000):
    img = nm.img
    start, end = function_span(nm, a)
    name = nm.entries[a][0] if a in nm.entries else (label or "%o" % a)
    span = (start, name, end)
    out = []
    zeros = 0
    k = start
    while k < end and k in img.mem and k - start < max_words:
        w = img.mem[k]
        zeros = zeros + 1 if w == 0 else 0
        if zeros > 8:
            out.append("  ...  (zeros)")
            break
        out.append("  %06o  %s  %s" % (k, iw.octal(w), disasm_word(nm, w, k, span)))
        k += 1
    return out


def listing(nm):
    out = []
    for a in nm.starts:
        nmx, kind = nm.entries[a]
        out.append("")
        out.append("%s (%s):" % (fasl.fmt_sym(nmx), kind))
        out.extend(listing_lines(nm, a))
    return out


# ---------------------------------------------------------------------------
# Tags tables.

def read_tags(path):
    """Sections of an EMACS TAGS file: list of (header, [definition names])."""
    text = iw.words_to_text(iw.decode_file(path))
    out = []
    for sec in text.split("\x1f\n"):
        lines = sec.split("\n")
        if not lines or ";" not in lines[0]:
            continue
        defs = []
        for ln in lines[2:]:
            if "\x7f" in ln:
                m = re.match(r"\((?:defun|defmacro|define-form|defprop|def\S*)\s+\(?([^\s()]+)",
                             ln.split("\x7f")[0], re.I)
                if m:
                    defs.append((m.group(1).upper(), ln.split("\x7f")[0].strip()))
        out.append((lines[0].strip(), defs))
    return out


def section_file(header):
    """'KEN1; AI: MACROS >' or 'AI: DIRECT; MACROS >' -> (directory, file)."""
    toks = header.replace(";", "; ").split()
    d = next((t[:-1] for t in toks if t.endswith(";")), None)
    rest = [t for t in toks if not t.endswith(";") and not t.endswith(":")]
    return d, (rest[0] if rest else None)


def ken1_tags_coverage(nm):
    """Compare the 1979 tags table's KEN1 definitions with the image."""
    tags = os.path.join(ROOT, "original", "7005017", "ken.tags")
    if not os.path.exists(tags):
        return None
    rows = []
    tot = collections.Counter()
    for head, defs in read_tags(tags):
        if not head.startswith("KEN1;") or not defs:
            continue
        c = collections.Counter()
        missing = []
        for d, _ in defs:
            k = definition_kind(nm, d)
            c[k] += 1
            if k not in ("compiled", "macro"):
                missing.append(d)
        tot.update(c)
        rows.append((head, len(defs), c, missing))
    return rows, tot


def definition_kind(nm, name):
    img = nm.img
    got = set()
    for a in img.byname.get(name, []):
        got |= {nm.inds.get(ind, "?") for ind, v in img.plist_of(a)}
    if got & {"SUBR", "LSUBR", "FSUBR"}:
        return "compiled"
    if "MACRO" in got:
        return "macro"
    if got & {"EXPR", "FEXPR"}:
        return "interpreted"
    if "AUTOLOAD" in got:
        return "autoload only"
    if got:
        return "other"
    return "absent"


# ---------------------------------------------------------------------------
# Reports.

def build(path, image_name=None):
    img = Image(iw.decode_file(path))
    nm = Names(img)
    nm.image_name = image_name
    return nm.build()


def report(path, label, image_name=None):
    nm = build(path, image_name)
    img = nm.img
    words_n = sum(1 for _ in img.mem)
    out = []
    p = out.append
    p("PDUMP core image: %s" % label)
    p("%d pages in the file (%d writable); start instruction %s; trailing words: %s" %
      (len(img.pages), sum(1 for _, i in img.pages if i & PAGE_WRITE),
       iw.octal(img.tail[0]) if img.tail else "-", " ".join(iw.octal(x) for x in img.tail[1:])))
    runs = []
    cur = None
    for i in range(256):
        st = "present" if (i * 1024) in img.mem else "absent"
        if cur and cur[0] == st:
            cur[2] = i
        else:
            cur = [st, i, i]
            runs.append(cur)
    p("Pages (octal): " + ", ".join("%o-%o %s" % (a, b, s) for s, a, b in runs))
    p("Symbols: %d headers with impure symbol blocks (%d names); %d symbol segments." %
      (len(img.syms), len(img.byname), len(img.sysegs)))
    p("")
    p("-- Naming summary --")
    for k, v in sorted(nm.stats.items()):
        p("  %-50s %d" % (k, v))
    pure_named = sorted((a, n, nm.atom_src[a]) for a, n in nm.atom.items() if nm.atom_src[a] != "pname")
    p("  pure atoms named: %d" % len(pure_named))
    if nm.conflicts:
        p("  naming conflicts (first name kept): %d" % len(nm.conflicts))
        for c in nm.conflicts[:20]:
            p("    %s %o: %s vs %s (%s)" % c)
    p("")
    p("-- Property indicators (pure atoms), as inferred --")
    for ind, lst in sorted(nm.ind_uses.items(), key=lambda kv: -len(kv[1])):
        if len(lst) >= 3:
            p("  %06o  %-10s used %4d times" % (ind, nm.ind_name(ind), len(lst)))
    p("")
    p("-- Kernel addresses named (GLOBALSYM/DDT alignment, CARCDR table, snapped links) --")
    for a, n in sorted(nm.kernel.items()):
        p("  %06o  %s" % (a, n))
    p("")
    p("-- Pure atoms named (address, name, evidence) --")
    for a, n, src in pure_named:
        p("  %06o  %-32s %s" % (a, fasl.fmt_sym(n), src))
    if nm.evidence:
        p("")
        p("-- Why: Director source text and code usage behind those names --")
        for a in sorted(nm.evidence):
            p("  %06o  %-18s %s" % (a, fasl.fmt_sym(nm.atom.get(a, "?")), nm.evidence[a]))
    if image_name == "TS D2500" and getattr(nm, "struct_range", None):
        cv = nm.cross_validate()
        if cv:
            p("")
            p("-- Check of the order-based names (struct.660 alignment, runs, order) --")
            p("  Five-fold cross-validation: each fifth of the %d pure atoms named by independent"
              % (cv["same"] + cv["unnamed"] + cv["different"]))
            p("  evidence was hidden and the order-based naming rerun without it.")
            p("  same name: %d   left unnamed: %d   different name: %d"
              % (cv["same"], cv["unnamed"], cv["different"]))
            for a, true, got, src in cv["cases"]:
                p("    %06o  %s, but the order gives %s (%s)" % (a, true, got, src))
    lo, hi = getattr(nm, "struct_range", None) or (0, -1)
    unnamed = collections.Counter()
    for a in nm.starts:
        s, e = function_span(nm, a)
        for k in range(s, min(e, s + 4000)):
            w = img.mem.get(k)
            if w is None:
                continue
            r = w & iw.RIGHT
            if lo <= r <= hi and r not in nm.atom and not (w >> 18) & 0o17:
                unnamed[r] += 1
    p("")
    p("-- Pure atoms referenced by code but still unnamed (address: references; candidates) --")
    alts = getattr(nm, "struct_alternatives", {})
    for r, c in unnamed.most_common(60):
        cand = alts.get(r)
        p("  %06o %3d  %s" % (r, c, ("one of " + ", ".join(cand)) if cand else ""))
    p("")
    p("-- Value cells named by FASL alignment --")
    for a, n in sorted(nm.vcell.items()):
        if a not in img.vcells:
            p("  %06o  %s" % (a, n))
    cov = ken1_tags_coverage(nm)
    if cov:
        rows, tot = cov
        p("")
        p("-- KEN1 definitions from the 1979 tags table (7005017 KEN TAGS) found in this image --")
        for head, n, c, missing in rows:
            p("  %-24s %3d defs: %s" % (head, n, ", ".join("%s %d" % kv for kv in sorted(c.items()))))
        p("  TOTAL %d: %s" % (sum(tot.values()), ", ".join("%s %d" % kv for kv in sorted(tot.items()))))
    interp = []
    for name in sorted(img.byname):
        for a in img.byname[name]:
            for ind, v in img.plist_of(a):
                iname = nm.ind_name(ind)
                if iname in ("EXPR", "FEXPR") and (v >> 9) in img.listsegs:
                    interp.append((name, iname, v))
    if interp:
        p("")
        p("-- Interpreted definitions (EXPR and FEXPR properties), printed in full --")
        for name, iname, v in interp:
            p("  %s  [%s]" % (fasl.fmt_sym(name), iname))
            for l in fasl.pretty(nm.to_obj(v), 4, 100).split("\n"):
                p("    " + l)
    p("")
    p("-- Symbols with properties --")
    for name in sorted(img.byname):
        props = []
        for a in img.byname[name]:
            for ind, v in img.plist_of(a):
                iname = nm.ind_name(ind)
                if iname in ("SUBR", "LSUBR", "FSUBR"):
                    props.append("%s %06o" % (iname, v))
                elif iname == "MACRO" and v in img.names:
                    sub = [("%s %06o" % (nm.ind_name(i2), v2)) for i2, v2 in img.plist_of(img.byname[img.names[v]][0])]
                    props.append("MACRO %s [%s]" % (fasl.fmt_sym(img.names[v]), ", ".join(sub)))
                else:
                    s = nm.sexp(v, [25])
                    props.append("%s %s" % (fasl.fmt_sym(iname), s if len(s) < 70 else s[:67] + "..."))
        if props:
            p("  %-36s %s" % (fasl.fmt_sym(name), "; ".join(props)))
    code = ["Code listing for %s" % label,
            "Compiled entries in address order. XCT link cells are followed by the call they make.",
            "'X symbol (#octal = pure atom not yet named), (SPECIAL X) value cell (#vcNNNNN = value cell",
            "of a system variable not yet named), kernel routines by GLOBALSYM name, R70+n = the constant n,,n."]
    code.extend(listing(nm))
    return nm, "\n".join(out) + "\n", "\n".join(code) + "\n"


def write_ken1(nm, outdir):
    """Per-KEN1-file listings and decompilations for TS D2500."""
    import lispdecomp
    img = nm.img
    os.makedirs(outdir, exist_ok=True)
    t79 = read_tags(os.path.join(ROOT, "original", "7005017", "ken.tags"))
    t80 = read_tags(os.path.join(ROOT, "original", "701431", "ken.tags"))
    files80 = {}
    for head, defs in t80:
        d, f = section_file(head)
        files80[f] = (head, defs)
    alias = {"DL": "DLIST"}
    index = []
    order = [h for h, defs in t79 if h.startswith("KEN1;") and defs]
    priority = ["MACROS", "UTIL", "CMATCH", "PROP", "DL", "TUTIL"]
    summary = collections.Counter()
    for head, defs in t79:
        if not head.startswith("KEN1;") or not defs:
            continue
        _, f = section_file(head)
        names79 = [d for d, _ in defs]
        h80, d80 = files80.get(alias.get(f, f), (None, []))
        added = [(d, src) for d, src in d80 if d not in names79]
        lines = ["%s: functions recovered from TS D2500 (KEN;TS D2500, 5 Jan 1980)" % head,
                 "Definitions in the order of the 1979 tags table (7005017 KEN TAGS)%s." %
                 ((", then those added in %s by 1980 (701431 KEN TAGS)" % h80) if added else ""),
                 "Listings name calls through link cells, kernel routines and atoms where known;",
                 "#75413-style names are pure system atoms not yet identified and #vc71041-style names",
                 "value cells of unidentified system variables (see 701431_ts.d2500.txt for candidates).",
                 "DECOMPILATION blocks are reconstructions from machine code, not Ken's source:",
                 "check each one against its listing. Confidence: high = straight-line code fully",
                 "understood; medium = branches or calls whose argument conventions were inferred;",
                 "low = partial.", ""]
        counts = collections.Counter()
        for d, src in [(d, s) for d, s in defs] + added:
            kind = definition_kind(nm, d)
            counts[kind] += 1
            lines.append("=" * 78)
            lines.append("%s    [%s]%s" % (d, kind, "    (added by 1980)" if (d, src) in added else ""))
            lines.append("  tags: %s" % src[:110])
            for a in img.byname.get(d, []):
                for ind, v in img.plist_of(a):
                    iname = nm.ind_name(ind)
                    if iname in ("SUBR", "LSUBR", "FSUBR") and v in nm.entries:
                        args = img.mem[img.syms[a][2] + 1] >> 18
                        lines.append("  %s at %06o, args %s" % (iname, v, fasl.args_str(args) or "-"))
                        dec = lispdecomp.decompile(nm, v, d, kind=iname, args=args)
                        lines.extend(dec)
                        lines.extend(listing_lines(nm, v))
                        summary["decompiled " + dec[0].split(":")[0].split()[-1]] += 0
                    elif iname == "MACRO" and v in img.names:
                        mname = img.names[v]
                        for i2, v2 in img.plist_of(v):
                            if nm.ind_name(i2) in ("SUBR", "LSUBR", "FSUBR") and v2 in nm.entries:
                                lines.append("  MACRO expander %s at %06o" % (fasl.fmt_sym(mname), v2))
                                dec = lispdecomp.decompile(nm, v2, d, kind="MACRO", args=2)
                                lines.extend(dec)
                                lines.extend(listing_lines(nm, v2))
                    elif iname == "AUTOLOAD":
                        lines.append("  AUTOLOAD from %s (code not in the image)" % nm.sexp(v, [10]))
                    elif iname in ("EXPR", "FEXPR", "MACRO") and (v >> 9) in img.listsegs:
                        obj = nm.to_obj(v)
                        lines.append("  %s property (interpreted definition, printed from the image):" % iname)
                        for l in fasl.pretty(obj, 4, 100).split("\n"):
                            lines.append("  | " + l)
                    else:
                        s = nm.sexp(v, [30])
                        lines.append("  property %s: %s" % (fasl.fmt_sym(iname), s[:100]))
            lines.append("")
        fname = os.path.join(outdir, "%s.txt" % f)
        with open(fname, "w", encoding="utf-8", newline="\n") as fh:
            fh.write("\n".join(lines) + "\n")
        index.append((f, len(defs), len(added), counts))
    order_files = sorted(index, key=lambda r: (priority.index(r[0]) if r[0] in priority else 99))
    with open(os.path.join(outdir, "INDEX.md"), "w", encoding="utf-8", newline="\n") as fh:
        fh.write("# KEN1 runtime recovered from TS D2500\n\n")
        fh.write("One file per KEN1; source file of the 1979 tags table (7005017 KEN TAGS), definitions in "
                 "tags order, followed by definitions added to the corresponding DIRECT; file by 1980 "
                 "(701431 KEN TAGS). Each compiled definition has its listing and, where the decompiler "
                 "succeeded, a reconstruction marked with its confidence. Generated by "
                 "`python -I tools/pdump.py --all`.\n\n")
        fh.write("| File | 1979 defs | added by 1980 | compiled | macro | interpreted | autoload only "
                 "| other | absent |\n")
        fh.write("|---|---|---|---|---|---|---|---|---|\n")
        for f, n79, nadd, c in order_files:
            fh.write("| [%s](%s.txt) | %d | %d | %d | %d | %d | %d | %d | %d |\n" %
                     (f, f, n79, nadd, c["compiled"], c["macro"], c["interpreted"], c["autoload only"],
                      c["other"], c["absent"]))
    return index


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
        nm, text, code = report(path, label, its)
        base = os.path.join(outdir, "%s_%s" % (f["tape"], iw.report_name(name)))
        with open(base + ".txt", "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
        with open(base + ".code.txt", "w", encoding="utf-8", newline="\n") as fh:
            fh.write(code)
        if its == "TS D2500":
            write_ken1(nm, os.path.join(outdir, "ken1"))
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
        sys.stdout.write(report(path, path)[1])
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
