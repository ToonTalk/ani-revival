"""Parse MacLisp FASL files (compiled Lisp) recovered from the ITS tapes.

The format is documented at the top of MacLisp's loader, src/l/fasloa.263 in
github.com/PDP-10/its, and in its dumper, src/comlap/faslap.392 (comments copied
into BINARY-FORMATS.md). In brief:

  word 0      SIXBIT "*FASL+" (or the older "*FASL*"; the loader treats them alike)
  word 1      SIXBIT version of the Lisp that compiled the file
  then blocks: one word of nine 4-bit relocation types, followed by nine
  data items whose length depends on the type:

   0 absolute word      1 relocatable word (RH + load offset)
   2 special: RH = atom index; becomes the address of that symbol's value cell
   3 smashable call: a CALL/JCALL/NCALL/NJCALL UUO whose RH is an atom index
   4 quoted atom: RH = atom index
   5 quoted list: list-building words, an end word (LH -1 or -2), a hash key
   6 GLOBALSYM: add a Lisp-internal address (LSYMS index) to the previous word
   7 GETDDTSYM: add a DDT symbol (SQUOZE) to the previous word; -1 means
     "relocate the previous word's left half"
  10 array reference: RH = atom index of an array
  12 atom-table entry: symbol pname, fixnum, flonum, bignum (or double, complex,
     duplex in later Lisps); each gets the next index (index 0 is NIL)
  13 entry point: LH,,RH = atom indices of function name and its property
     (SUBR, FSUBR, LSUBR, ...); next word = ARGS info,,relocatable address
  14 LOC: continue loading at a relocatable address
  15 PUTDDTSYM: define a DDT symbol
  16 eval mungeable: list-building words for a top-level form to evaluate at
     load time; end word LH -1 (discard the value) or -2 (value goes into
     the atom table)
  17 end of binary: the word must be *FASL* or *FASL+. If the next word is
     *FASL* again, another FASL segment follows; otherwise ^C^C^C^C^C or EOF.

List-building words (types 5 and 16), dispatched on bits 4.7-4.9:
  0,,n push atom n   1xxxxx,,n pop n items, push their list
  2xxxxx,,n pop a tail, then n items, push the dotted list
  3xxxxx,,0 evaluate the top item at load time (shown here as #,form)
  4xxxxx,,n make a hunk of n items   7xxxxx,,x end (-1 or -2 in the LH)

Usage (run with python -I):
    python -I tools/fasl.py FILE.fasl [--code]   dump to stdout
    python -I tools/fasl.py --all                dump every original/*/*.fasl
                                                 into reports/fasl/, with SUMMARY.md
The dump lists the functions defined, top-level forms, quoted constants per
function, what each function calls, the atom table, and (with --code, and
always for --all) a LAP-like listing of the loaded words.
"""

import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import its_words as iw  # noqa: E402
import itsdir  # noqa: E402

FASL_OLD = 0o124641635412   # SIXBIT *FASL*
FASL_NEW = 0o124641635413   # SIXBIT *FASL+
CTRL_C_WORD = 0o014060301406  # five ^C characters
WORDMASK = iw.WORDMASK

RELOC_NAMES = {
    0o0: "absolute", 0o1: "relocatable", 0o2: "special", 0o3: "smashable call",
    0o4: "quoted atom", 0o5: "quoted list", 0o6: "globalsym", 0o7: "getddtsym",
    0o10: "array reference", 0o11: "unused", 0o12: "atom table", 0o13: "entry",
    0o14: "loc", 0o15: "putddtsym", 0o16: "eval mungeable", 0o17: "end",
}

# MacLisp GLOBALSYM table (LSYMS) in index order, from src/l/defns.240 (1981).
# "The relative positions of these symbols get built into FASL files."
GLOBALSYMS = (
    ".SET .MAP PRINTA SPECBIND UNBIND IOGBND .LCALL .UDT ARGLOC INUM ST FXNV1 PDLNMK "
    "PDLNKJ FIX1A FIX1 FLOAT1 IFIX IFLOAT FXCONS FLCONS ERSETUP ERUNDO GOBRK CARCDR "
    ".STORE NPUSH PA3 QUNBOUND FLTSKP FXNV2 FXNV3 FXNV4 FIX2 FLOAT2 AREGET %HUNK1 "
    "%HUNK2 INTREL INHIBIT NOQUIT CHECKI 0PUSH 0.0PUSH NILPROPS VBIND %CXR %RPX %CONS "
    "%NCONS %XCONS %C2NS %HUNK3 %HUNK4 %PDLC %PDLXC %PDLNC PTNTRY PTEXIT SFCALI UNWPUS"
).split()

# MacLisp UUOs (src/l/defns.240).
UUOS = {0o1: "LERR", 0o2: "ACALL", 0o3: "AJCALL", 0o4: "LER3", 0o5: "ERINT", 0o6: "PP",
        0o7: "STRT", 0o10: "SERINT", 0o11: "TP", 0o12: "IOJRST", 0o13: "STRT7",
        0o14: "CALL", 0o15: "JCALL", 0o16: "CALLF", 0o17: "JCALLF",
        0o20: "NCALL", 0o21: "NJCALL", 0o22: "NCALLF", 0o23: "NJCALF"}
CALL_UUOS = {0o14, 0o15, 0o16, 0o17, 0o20, 0o21, 0o22, 0o23}

# MacLisp accumulator names (src/l/defns.240).
ACS = ["0", "A", "B", "C", "AR1", "AR2A", "T", "TT", "D", "R", "F", "FREEAC",
       "P", "FLP", "FXP", "SP"]

# KA10 opcodes 100-677 (generated from pdp10-opc.c in larsbrinkhoff/pdp10-its-disassembler).
OPCODES = {
    0o130: "UFA", 0o131: "DFN", 0o132: "FSC", 0o133: "IBP", 0o134: "ILDB", 0o135: "LDB", 0o136: "IDPB", 0o137: "DPB",
    0o140: "FAD", 0o141: "FADL", 0o142: "FADM", 0o143: "FADB", 0o144: "FADR", 0o145: "FADRI", 0o146: "FADRM", 0o147: "FADRB",
    0o150: "FSB", 0o151: "FSBL", 0o152: "FSBM", 0o153: "FSBB", 0o154: "FSBR", 0o155: "FSBRI", 0o156: "FSBRM", 0o157: "FSBRB",
    0o160: "FMP", 0o161: "FMPL", 0o162: "FMPM", 0o163: "FMPB", 0o164: "FMPR", 0o165: "FMPRI", 0o166: "FMPRM", 0o167: "FMPRB",
    0o170: "FDV", 0o171: "FDVL", 0o172: "FDVM", 0o173: "FDVB", 0o174: "FDVR", 0o175: "FDVRI", 0o176: "FDVRM", 0o177: "FDVRB",
    0o200: "MOVE", 0o201: "MOVEI", 0o202: "MOVEM", 0o203: "MOVES", 0o204: "MOVS", 0o205: "MOVSI", 0o206: "MOVSM", 0o207: "MOVSS",
    0o210: "MOVN", 0o211: "MOVNI", 0o212: "MOVNM", 0o213: "MOVNS", 0o214: "MOVM", 0o215: "MOVMI", 0o216: "MOVMM", 0o217: "MOVMS",
    0o220: "IMUL", 0o221: "IMULI", 0o222: "IMULM", 0o223: "IMULB", 0o224: "MUL", 0o225: "MULI", 0o226: "MULM", 0o227: "MULB",
    0o230: "IDIV", 0o231: "IDIVI", 0o232: "IDIVM", 0o233: "IDIVB", 0o234: "DIV", 0o235: "DIVI", 0o236: "DIVM", 0o237: "DIVB",
    0o240: "ASH", 0o241: "ROT", 0o242: "LSH", 0o243: "JFFO", 0o244: "ASHC", 0o245: "ROTC", 0o246: "LSHC",
    0o250: "EXCH", 0o251: "BLT", 0o252: "AOBJP", 0o253: "AOBJN", 0o254: "JRST", 0o255: "JFCL", 0o256: "XCT", 0o257: "MAP",
    0o260: "PUSHJ", 0o261: "PUSH", 0o262: "POP", 0o263: "POPJ", 0o264: "JSR", 0o265: "JSP", 0o266: "JSA", 0o267: "JRA",
    0o270: "ADD", 0o271: "ADDI", 0o272: "ADDM", 0o273: "ADDB", 0o274: "SUB", 0o275: "SUBI", 0o276: "SUBM", 0o277: "SUBB",
    0o300: "CAI", 0o301: "CAIL", 0o302: "CAIE", 0o303: "CAILE", 0o304: "CAIA", 0o305: "CAIGE", 0o306: "CAIN", 0o307: "CAIG",
    0o310: "CAM", 0o311: "CAML", 0o312: "CAME", 0o313: "CAMLE", 0o314: "CAMA", 0o315: "CAMGE", 0o316: "CAMN", 0o317: "CAMG",
    0o320: "JUMP", 0o321: "JUMPL", 0o322: "JUMPE", 0o323: "JUMPLE", 0o324: "JUMPA", 0o325: "JUMPGE", 0o326: "JUMPN", 0o327: "JUMPG",
    0o330: "SKIP", 0o331: "SKIPL", 0o332: "SKIPE", 0o333: "SKIPLE", 0o334: "SKIPA", 0o335: "SKIPGE", 0o336: "SKIPN", 0o337: "SKIPG",
    0o340: "AOJ", 0o341: "AOJL", 0o342: "AOJE", 0o343: "AOJLE", 0o344: "AOJA", 0o345: "AOJGE", 0o346: "AOJN", 0o347: "AOJG",
    0o350: "AOS", 0o351: "AOSL", 0o352: "AOSE", 0o353: "AOSLE", 0o354: "AOSA", 0o355: "AOSGE", 0o356: "AOSN", 0o357: "AOSG",
    0o360: "SOJ", 0o361: "SOJL", 0o362: "SOJE", 0o363: "SOJLE", 0o364: "SOJA", 0o365: "SOJGE", 0o366: "SOJN", 0o367: "SOJG",
    0o370: "SOS", 0o371: "SOSL", 0o372: "SOSE", 0o373: "SOSLE", 0o374: "SOSA", 0o375: "SOSGE", 0o376: "SOSN", 0o377: "SOSG",
    0o400: "SETZ", 0o401: "SETZI", 0o402: "SETZM", 0o403: "SETZB", 0o404: "AND", 0o405: "ANDI", 0o406: "ANDM", 0o407: "ANDB",
    0o410: "ANDCA", 0o411: "ANDCAI", 0o412: "ANDCAM", 0o413: "ANDCAB", 0o414: "SETM", 0o415: "SETMI", 0o416: "SETMM", 0o417: "SETMB",
    0o420: "ANDCM", 0o421: "ANDCMI", 0o422: "ANDCMM", 0o423: "ANDCMB", 0o424: "SETA", 0o425: "SETAI", 0o426: "SETAM", 0o427: "SETAB",
    0o430: "XOR", 0o431: "XORI", 0o432: "XORM", 0o433: "XORB", 0o434: "IOR", 0o435: "IORI", 0o436: "IORM", 0o437: "IORB",
    0o440: "ANDCB", 0o441: "ANDCBI", 0o442: "ANDCBM", 0o443: "ANDCBB", 0o444: "EQV", 0o445: "EQVI", 0o446: "EQVM", 0o447: "EQVB",
    0o450: "SETCA", 0o451: "SETCAI", 0o452: "SETCAM", 0o453: "SETCAB", 0o454: "ORCA", 0o455: "ORCAI", 0o456: "ORCAM", 0o457: "ORCAB",
    0o460: "SETCM", 0o461: "SETCMI", 0o462: "SETCMM", 0o463: "SETCMB", 0o464: "ORCM", 0o465: "ORCMI", 0o466: "ORCMM", 0o467: "ORCMB",
    0o470: "ORCB", 0o471: "ORCBI", 0o472: "ORCBM", 0o473: "ORCBB", 0o474: "SETO", 0o475: "SETOI", 0o476: "SETOM", 0o477: "SETOB",
    0o500: "HLL", 0o501: "HLLI", 0o502: "HLLM", 0o503: "HLLS", 0o504: "HRL", 0o505: "HRLI", 0o506: "HRLM", 0o507: "HRLS",
    0o510: "HLLZ", 0o511: "HLLZI", 0o512: "HLLZM", 0o513: "HLLZS", 0o514: "HRLZ", 0o515: "HRLZI", 0o516: "HRLZM", 0o517: "HRLZS",
    0o520: "HLLO", 0o521: "HLLOI", 0o522: "HLLOM", 0o523: "HLLOS", 0o524: "HRLO", 0o525: "HRLOI", 0o526: "HRLOM", 0o527: "HRLOS",
    0o530: "HLLE", 0o531: "HLLEI", 0o532: "HLLEM", 0o533: "HLLES", 0o534: "HRLE", 0o535: "HRLEI", 0o536: "HRLEM", 0o537: "HRLES",
    0o540: "HRR", 0o541: "HRRI", 0o542: "HRRM", 0o543: "HRRS", 0o544: "HLR", 0o545: "HLRI", 0o546: "HLRM", 0o547: "HLRS",
    0o550: "HRRZ", 0o551: "HRRZI", 0o552: "HRRZM", 0o553: "HRRZS", 0o554: "HLRZ", 0o555: "HLRZI", 0o556: "HLRZM", 0o557: "HLRZS",
    0o560: "HRRO", 0o561: "HRROI", 0o562: "HRROM", 0o563: "HRROS", 0o564: "HLRO", 0o565: "HLROI", 0o566: "HLROM", 0o567: "HLROS",
    0o570: "HRRE", 0o571: "HRREI", 0o572: "HRREM", 0o573: "HRRES", 0o574: "HLRE", 0o575: "HLREI", 0o576: "HLREM", 0o577: "HLRES",
    0o600: "TRN", 0o601: "TLN", 0o602: "TRNE", 0o603: "TLNE", 0o604: "TRNA", 0o605: "TLNA", 0o606: "TRNN", 0o607: "TLNN",
    0o610: "TDN", 0o611: "TSN", 0o612: "TDNE", 0o613: "TSNE", 0o614: "TDNA", 0o615: "TSNA", 0o616: "TDNN", 0o617: "TSNN",
    0o620: "TRZ", 0o621: "TLZ", 0o622: "TRZE", 0o623: "TLZE", 0o624: "TRZA", 0o625: "TLZA", 0o626: "TRZN", 0o627: "TLZN",
    0o630: "TDZ", 0o631: "TSZ", 0o632: "TDZE", 0o633: "TSZE", 0o634: "TDZA", 0o635: "TSZA", 0o636: "TDZN", 0o637: "TSZN",
    0o640: "TRC", 0o641: "TLC", 0o642: "TRCE", 0o643: "TLCE", 0o644: "TRCA", 0o645: "TLCA", 0o646: "TRCN", 0o647: "TLCN",
    0o650: "TDC", 0o651: "TSC", 0o652: "TDCE", 0o653: "TSCE", 0o654: "TDCA", 0o655: "TSCA", 0o656: "TDCN", 0o657: "TSCN",
    0o660: "TRO", 0o661: "TLO", 0o662: "TROE", 0o663: "TLOE", 0o664: "TROA", 0o665: "TLOA", 0o666: "TRON", 0o667: "TLON",
    0o670: "TDO", 0o671: "TSO", 0o672: "TDOE", 0o673: "TSOE", 0o674: "TDOA", 0o675: "TSOA", 0o676: "TDON", 0o677: "TSON",
}


# ---------------------------------------------------------------------------
# Lisp objects reconstructed from the atom table and list words.

class Sym:
    __slots__ = ("name",)

    def __init__(self, name):
        self.name = name

    def __eq__(self, other):
        return isinstance(other, Sym) and other.name == self.name

    def __hash__(self):
        return hash(("sym", self.name))


NIL = Sym("NIL")


class Num:
    __slots__ = ("kind", "value", "words")

    def __init__(self, kind, value, words):
        self.kind, self.value, self.words = kind, value, words


class Dotted:
    __slots__ = ("items", "tail")

    def __init__(self, items, tail):
        self.items, self.tail = items, tail


class Hunk:
    __slots__ = ("items",)

    def __init__(self, items):
        self.items = items


class LoadEval:
    """A form evaluated at load time (list word type 3, or a type-16 value
    stored in the atom table)."""
    __slots__ = ("form",)

    def __init__(self, form):
        self.form = form


class FaslError(Exception):
    pass


def pdp10_float(w):
    if w == 0:
        return 0.0
    neg = bool(w & (1 << 35))
    if neg:
        w = (-w) & WORDMASK
    exp = (w >> 27) & 0o377
    frac = w & 0o777777777
    v = frac / float(1 << 27) * 2.0 ** (exp - 128)
    return -v if neg else v


def pname(words):
    s = "".join(chr(c) for w in words for c in iw.chars7(w))
    return s.rstrip("\x00")


# ---------------------------------------------------------------------------
# Printing S-expressions in MacLisp-like syntax.

_PLAIN = re.compile(r"^[A-Z0-9!$%&*+\-.<=>?@^_~:#{}\[\]\\]+$")
_NUMLIKE = re.compile(r"^[+-]?(\d+\.?|\d*\.\d+([EeDd][+-]?\d+)?|\d+[EeDd][+-]?\d+)$")


def fmt_sym(name):
    if name and _PLAIN.match(name) and not _NUMLIKE.match(name):
        return name
    out = []
    for ch in name:
        c = ord(ch)
        if ch in "|/":
            out.append("/" + ch)
        elif c < 0o40:
            out.append("^" + chr(c + 0o100))
        elif c == 0o177:
            out.append("^?")
        else:
            out.append(ch)
    return "|" + "".join(out) + "|"


def fmt_num(n):
    if n.kind in ("fixnum", "bignum"):
        return str(n.value)
    if n.kind == "flonum":
        s = "%.8g" % n.value
        if "e" in s:
            m, e = s.split("e")
            if "." not in m:
                m += ".0"
            return m + "E" + str(int(e))
        if "." not in s:
            s += ".0"
        return s
    return "#<%s %s>" % (n.kind, " ".join("%012o" % w for w in n.words))


def fmt(x):
    """One-line MacLisp-ish rendering."""
    if isinstance(x, Sym):
        return fmt_sym(x.name)
    if isinstance(x, Num):
        return fmt_num(x)
    if isinstance(x, list):
        if len(x) == 2 and x[0] == Sym("QUOTE"):
            return "'" + fmt(x[1])
        return "(" + " ".join(fmt(e) for e in x) + ")"
    if isinstance(x, Dotted):
        return "(" + " ".join(fmt(e) for e in x.items) + " . " + fmt(x.tail) + ")"
    if isinstance(x, Hunk):
        return "#HUNK(" + " ".join(fmt(e) for e in x.items) + ")"
    if isinstance(x, LoadEval):
        return "#," + fmt(x.form)
    return repr(x)


def pretty(x, indent=0, width=100):
    """Pretty-print: flat if it fits, else break lists one element per line."""
    flat = fmt(x)
    if indent + len(flat) <= width or not isinstance(x, (list, Dotted)):
        return flat
    items = x if isinstance(x, list) else x.items
    if isinstance(x, list) and len(x) == 2 and x[0] == Sym("QUOTE"):
        return "'" + pretty(x[1], indent + 1, width)
    head = fmt(items[0]) if items else ""
    lines = []
    if items and isinstance(items[0], Sym) and len(items) > 1:
        first = "(" + head + " " + pretty(items[1], indent + len(head) + 2, width)
        rest = items[2:]
        sub = indent + 2
    else:
        first = "(" + (pretty(items[0], indent + 1, width) if items else "")
        rest = items[1:]
        sub = indent + 1
    lines.append(first)
    for e in rest:
        lines.append(" " * sub + pretty(e, sub, width))
    if isinstance(x, Dotted):
        lines.append(" " * sub + ". " + pretty(x.tail, sub + 2, width))
    return "\n".join(lines) + ")"


def atoms_in(x, acc):
    if isinstance(x, Sym):
        acc.add(x.name)
    elif isinstance(x, list):
        for e in x:
            atoms_in(e, acc)
    elif isinstance(x, Dotted):
        for e in x.items:
            atoms_in(e, acc)
        atoms_in(x.tail, acc)
    elif isinstance(x, Hunk):
        for e in x.items:
            atoms_in(e, acc)
    elif isinstance(x, LoadEval):
        atoms_in(x.form, acc)
    return acc


# ---------------------------------------------------------------------------
# Parsing.

class Loaded:
    """One word loaded into binary program space."""
    __slots__ = ("addr", "word", "rtype", "ref", "lh", "patches", "item")

    def __init__(self, addr, word, rtype, ref=None, lh=None, item=None):
        self.addr, self.word, self.rtype, self.ref, self.lh = addr, word, rtype, ref, lh
        self.patches = []
        self.item = item


class Segment:
    def __init__(self, start):
        self.start = start            # word index of the magic word
        self.magic = None
        self.version = None
        self.atoms = [NIL]            # atom table; index 0 is NIL
        self.atom_kinds = ["nil"]
        self.entries = []             # (name, type, args_lh, addr, item_no)
        self.mungeables = []          # (item_no, form, disposition)
        self.quoted_lists = []        # (item_no, addr, form, hashkey)
        self.loaded = {}              # addr -> Loaded
        self.ddt_defs = []            # (symbol, value)
        self.locs = []
        self.items = 0
        self.blocks = 0
        self.end = None               # word index just past the end item
        self.end_magic = None
        self.counts = {}
        self.uses = {}                # atom name -> set of uses


def parse(words, hash_key=True):
    """Parse all FASL segments in words. Returns (segments, info dict)."""
    segs = []
    pos = 0
    n = len(words)
    info = {"trailer": None, "error": None, "words": n}
    while pos < n:
        magic = words[pos]
        if (magic | 1) != FASL_NEW:
            if not segs:
                raise FaslError("not a FASL file: first word %s %r" % (iw.octal(magic), iw.sixbit(magic)))
            info["error"] = "unexpected word %s after end of segment at %o" % (iw.octal(magic), pos)
            break
        seg = Segment(pos)
        seg.magic = magic
        if pos + 1 >= n:
            raise FaslError("file ends after the magic word")
        seg.version = words[pos + 1]
        pos += 2
        try:
            pos = _parse_segment(words, pos, seg, hash_key)
        except FaslError as e:
            segs.append(seg)
            info["error"] = str(e)
            return segs, info
        segs.append(seg)
        if pos >= n:
            break
        nxt = words[pos]
        if (nxt | 1) == FASL_NEW:
            continue                   # another segment follows
        if nxt == CTRL_C_WORD:
            info["trailer"] = "^C^C^C^C^C"
            pos += 1
            if pos < n:
                info["error"] = "%d words after the ^C trailer" % (n - pos)
            break
        info["error"] = "%d unexpected words after the end marker" % (n - pos)
        break
    info["consumed"] = pos
    return segs, info


def _use(seg, atom, how):
    if isinstance(atom, Sym):
        seg.uses.setdefault(atom.name, set()).add(how)


def _parse_segment(words, pos, seg, hash_key):
    n = len(words)
    loc = 0                      # relative load address
    last = None                  # last Loaded word (for patches)

    def get():
        nonlocal pos
        if pos >= n:
            raise FaslError("premature end of file at word %o" % pos)
        w = words[pos]
        pos += 1
        return w

    def atom(i):
        if i >= len(seg.atoms):
            raise FaslError("atom index %d out of range (table has %d) at word %o" % (i, len(seg.atoms), pos))
        return seg.atoms[i]

    def read_list(first):
        stack = []
        w = first
        while True:
            op = (w >> 33) & 7
            r = w & iw.RIGHT
            if op == 0:
                stack.append(atom(r))
            elif op == 1:
                if r > len(stack):
                    raise FaslError("list underflow at word %o" % (pos - 1))
                items = stack[len(stack) - r:] if r else []
                del stack[len(stack) - r:]
                stack.append(list(items) if items else NIL)
            elif op == 2:
                if r + 1 > len(stack):
                    raise FaslError("dotted list underflow at word %o" % (pos - 1))
                tail = stack.pop()
                items = stack[len(stack) - r:] if r else []
                del stack[len(stack) - r:]
                stack.append(Dotted(list(items), tail) if items else tail)
            elif op == 3:
                if not stack:
                    raise FaslError("eval of empty stack at word %o" % (pos - 1))
                stack[-1] = LoadEval(stack[-1])
            elif op == 4:
                if r > len(stack):
                    raise FaslError("hunk underflow at word %o" % (pos - 1))
                items = stack[len(stack) - r:]
                del stack[len(stack) - r:]
                stack.append(Hunk(list(items)))
            elif op == 7:
                lhv = iw.lh(w)
                if lhv not in (0o777777, 0o777776):
                    raise FaslError("bad list end word %s at word %o" % (iw.octal(w), pos - 1))
                if len(stack) != 1:
                    raise FaslError("list ends with %d items on the stack at word %o" % (len(stack), pos - 1))
                return stack[0], (lhv == 0o777777), r
            else:
                raise FaslError("bad list word %s at word %o" % (iw.octal(w), pos - 1))
            w = get()

    while True:
        relw = get()
        seg.blocks += 1
        for k in range(9):
            t = (relw >> (32 - 4 * k)) & 0o17
            data = get()
            seg.items += 1
            seg.counts[t] = seg.counts.get(t, 0) + 1
            item = seg.items
            if t in (0o0, 0o1, 0o2, 0o3, 0o4, 0o10):
                ref = None
                if t in (0o2, 0o3, 0o4, 0o10):
                    ref = atom(iw.rh(data))
                    _use(seg, ref, {0o2: "special", 0o3: "called", 0o4: "quoted", 0o10: "array"}[t])
                last = Loaded(loc, data, t, ref, item=item)
                seg.loaded[loc] = last
                loc += 1
            elif t == 0o5:
                form, keep, lhv = read_list(data)
                hk = get() if hash_key else None
                if keep:
                    last = Loaded(loc, (lhv << 18), t, form, lhv, item=item)
                    seg.loaded[loc] = last
                    seg.quoted_lists.append((item, loc, form, hk))
                    loc += 1
                else:
                    seg.atoms.append(form)
                    seg.atom_kinds.append("list")
                    seg.quoted_lists.append((item, None, form, hk))
                for a in atoms_in(form, set()):
                    seg.uses.setdefault(a, set()).add("in constant")
            elif t == 0o6:
                if last is None:
                    raise FaslError("GLOBALSYM before any loaded word")
                idx = iw.rh(data)
                if idx == 0o777777:
                    name = "R70"      # LSYMS-1, the table of n,,n constants
                elif idx < len(GLOBALSYMS):
                    name = GLOBALSYMS[idx]
                else:
                    name = "GLOBALSYM#%o" % idx
                last.patches.append(("-" if data >> 35 else "+") + name)
            elif t == 0o7:
                if data == WORDMASK:
                    if last is None:
                        raise FaslError("LH relocation before any loaded word")
                    last.patches.append("LH relocated")
                else:
                    sym = iw.squoze(data)
                    field = {3: "", 2: "(AC)", 1: "(RH)", 0: "(swapped)"}[(data >> 30) & 3]
                    sign = "-" if data >> 35 else "+"
                    note = "%sDDT:%s%s" % (sign, sym, field)
                    if data & (1 << 34):
                        note += "=%s" % iw.octal(get())
                    if last is None:
                        raise FaslError("GETDDTSYM before any loaded word")
                    last.patches.append(note)
            elif t == 0o11:
                raise FaslError("relocation type 11 (unused) at word %o" % (pos - 1))
            elif t == 0o12:
                kind = (data >> 33) & 7
                r = iw.rh(data)
                if kind == 0:
                    pw = [get() for _ in range(r)]
                    seg.atoms.append(Sym(pname(pw)))
                    seg.atom_kinds.append("symbol")
                elif kind == 1:
                    v = get()
                    seg.atoms.append(Num("fixnum", iw.signed(v), [v]))
                    seg.atom_kinds.append("fixnum")
                elif kind == 2:
                    v = get()
                    seg.atoms.append(Num("flonum", pdp10_float(v), [v]))
                    seg.atom_kinds.append("flonum")
                elif kind == 3:
                    ws = [get() for _ in range(r)]
                    val = 0
                    for x in ws:
                        val = (val << 35) | (x & ((1 << 35) - 1))
                    if (data >> 18) & 7:
                        val = -val
                    seg.atoms.append(Num("bignum", val, ws))
                    seg.atom_kinds.append("bignum")
                elif kind in (4, 5, 6):
                    cnt = 4 if kind == 6 else 2
                    ws = [get() for _ in range(cnt)]
                    kn = {4: "double", 5: "complex", 6: "duplex"}[kind]
                    seg.atoms.append(Num(kn, None, ws))
                    seg.atom_kinds.append(kn)
                else:
                    raise FaslError("atom table entry of type 7 at word %o" % (pos - 1))
            elif t == 0o13:
                name = atom(iw.lh(data))
                typ = atom(iw.rh(data))
                v = get()
                seg.entries.append((name, typ, iw.lh(v), iw.rh(v), item))
                _use(seg, name, "defined")
            elif t == 0o14:
                loc = iw.rh(data)
                seg.locs.append(loc)
            elif t == 0o15:
                sym = iw.squoze(data)
                if data >> 35:
                    val = get()
                else:
                    val = loc
                seg.ddt_defs.append((sym, val))
            elif t == 0o16:
                form, discard, _r = read_list(data)
                if discard:
                    seg.mungeables.append((item, form, "evaluated"))
                else:
                    seg.mungeables.append((item, form, "value -> atom %d" % len(seg.atoms)))
                    seg.atoms.append(LoadEval(form))
                    seg.atom_kinds.append("eval")
                for a in atoms_in(form, set()):
                    seg.uses.setdefault(a, set()).add("in top-level form")
            elif t == 0o17:
                if (data | 1) != FASL_NEW:
                    raise FaslError("end item is %s, not *FASL*" % iw.octal(data))
                seg.end = pos
                seg.end_magic = data
                return pos


# ---------------------------------------------------------------------------
# Rendering.

def args_str(lhv):
    lo, hi = (lhv >> 9) & 0o777, lhv & 0o777

    def one(v, is_max):
        if v == 0:
            return "NIL"
        if is_max and v == 0o777:
            return "511"
        return str(v - 1)
    if lhv == 0:
        return ""
    return "(%s . %s)" % (one(lo, False), one(hi, True))


_IMMEDIATE_PREFIXES = ("CAI", "TR", "TL", "JUMP", "AOJ", "SOJ", "AOBJ", "JRST", "JFCL", "JSP", "JSR",
                       "JSA", "JRA", "PUSHJ", "POPJ", "XCT")
_SHIFTS = {"ASH", "ROT", "LSH", "ASHC", "ROTC", "LSHC", "JFFO", "FSC"}


def _is_immediate(mn):
    if mn in _SHIFTS:
        return True
    if mn.startswith(_IMMEDIATE_PREFIXES):
        return True
    return mn.endswith("I") and mn not in ("SKIPI",)


def operand(ld, seg, names, mn=None, x=0, short=True):
    """Symbolic rendering of a loaded word's address field."""
    w = ld.word
    r = iw.rh(w)
    t = ld.rtype
    syms = [pt for pt in ld.patches if pt[0] in "+-" and pt[1:] and not pt.startswith(("+DDT", "-DDT"))]
    ddts = [pt for pt in ld.patches if pt.startswith(("+DDT", "-DDT"))]
    if syms or ddts:
        base = []
        for pt in syms + ddts:
            nm = pt[1:].replace("DDT:", "")
            nm = re.sub(r"\(.*", "", nm)
            base.append(("" if pt[0] == "+" and not base else pt[0]) + nm)
        off = r - (1 << 18) if r & (1 << 17) else r
        s = "".join(base)
        if off:
            s += "%+d" % off if abs(off) < 8 else ("+%o" % off if off > 0 else "-%o" % -off)
        return s
    if t == 0o1:
        return names.get(r, "L%o" % r)
    if t == 0o2:
        return "(SPECIAL %s)" % fmt(ld.ref)
    if t in (0o3, 0o4):
        return "'" + fmt(ld.ref)
    if t == 0o10:
        return "(ARRAY %s)" % fmt(ld.ref)
    if t == 0o5:
        s = "'" + fmt(ld.ref)
        if short and len(s) > 90:
            s = s[:87] + "..."
        return s
    if x and r & (1 << 17):
        return "-%o" % ((1 << 18) - r)
    if x and r == 0:
        return ""
    if mn and r <= 0o17 and not x and not _is_immediate(mn):
        return ACS[r]
    return "%o" % r


def disasm(ld, seg, names):
    w = ld.word
    op = (w >> 27) & 0o777
    ac = (w >> 23) & 0o17
    ind = "@" if (w >> 22) & 1 else ""
    x = (w >> 18) & 0o17
    idx = "(%s)" % ACS[x] if x else ""
    if op == 0:
        e = operand(ld, seg, names, None, x)
        if ld.rtype == 0o0 and not ld.patches:
            return iw.octal(w)
        return "%o,,%s" % (iw.lh(w), (ind + e + idx) if (ind or idx) else e)
    if op in UUOS:
        mn = UUOS[op]
        e = operand(ld, seg, names, mn, x)
        if op in CALL_UUOS:
            note = {0o16: "  ; lsubr-style", 0o17: "  ; fsubr-style"}.get(ac, "")
            return "%s %o,%s%s%s%s" % (mn, ac, ind, e, idx, note)
        return "%s %s,%s%s%s" % (mn, ACS[ac], ind, e, idx)
    mn = OPCODES.get(op)
    if mn is None:
        if op >= 0o700:
            return "%s  ; (I/O opcode %o)" % (iw.octal(w), op)
        return "%s  ; (opcode %o)" % (iw.octal(w), op)
    e = operand(ld, seg, names, mn, x)
    return "%s %s,%s%s%s" % (mn, ACS[ac], ind, e, idx)


def version_str(w):
    """FASLAP writes LDFNM2: SIXBIT .FNAM2 of the Lisp source with its low 8 bits
    replaced by assembly flags (D10 ITS D20 BIGNUM CMU SAIL HISEGMENT PAGING in
    the 1981 source)."""
    name = iw.sixbit(w & ~0o377).rstrip()
    return "%r, flag bits %03o" % (name, w & 0o377)


def owner_of(addr, starts):
    """Name of the entry whose code contains addr (greatest start <= addr)."""
    best = None
    for a, nm in starts:
        if a <= addr:
            best = nm
        else:
            break
    return best


def render(path, words, segs, info, label=None, code=True):
    out = []
    p = out.append
    p("FASL dump: %s" % (label or path))
    p("Decoded %d words (ITS evacuate format%s)." %
      (len(words), (", last word padded with %d ^C" % words.padded_chars) if getattr(words, "padded_chars", 0) else ""))
    status = "clean" if not info.get("error") else "PROBLEM: " + info["error"]
    p("Parse: %s; %d segment(s); consumed %d of %d words%s." %
      (status, len(segs), info.get("consumed", 0), len(words),
       (", trailer " + info["trailer"]) if info.get("trailer") else ""))
    p("Numbers below are decimal unless shown as octal (nnnnnn,,nnnnnn); #,form = evaluated at load time.")
    for si, seg in enumerate(segs):
        p("")
        p("=" * 78)
        p("Segment %d at word %o: header %s, Lisp version word %s (%s), %d blocks, %d items%s" %
          (si + 1, seg.start, iw.sixbit(seg.magic), iw.octal(seg.version), version_str(seg.version),
           seg.blocks, seg.items, "" if seg.end is not None else " (NO END MARKER)"))
        cnts = ", ".join("%s %d" % (RELOC_NAMES[k], v) for k, v in sorted(seg.counts.items()))
        p("Item counts: " + cnts)
        names = {}
        starts = []
        for (nm, typ, argl, addr, item) in seg.entries:
            names.setdefault(addr, fmt(nm))
            starts.append((addr, fmt(nm)))
        starts.sort()

        p("")
        p("-- Functions defined (%d) --" % len(seg.entries))
        if seg.entries:
            p("  %-28s %-8s %-12s %s" % ("name", "property", "args", "address"))
        for (nm, typ, argl, addr, item) in seg.entries:
            p("  %-28s %-8s %-12s %06o" % (fmt(nm), fmt(typ), args_str(argl), addr))

        p("")
        p("-- Top-level forms evaluated at load time (%d) --" % len(seg.mungeables))
        for (item, form, disp) in seg.mungeables:
            p("  " + pretty(form, 2) + ("" if disp == "evaluated" else "   ; " + disp))

        # Per-function references.
        per = {}
        for addr in sorted(seg.loaded):
            ld = seg.loaded[addr]
            own = owner_of(addr, starts) or "(before first entry)"
            d = per.setdefault(own, {"called": [], "special": [], "quoted": [], "lists": [], "array": []})
            if ld.rtype == 0o3:
                key = fmt(ld.ref)
                if key not in d["called"]:
                    d["called"].append(key)
            elif ld.rtype == 0o2:
                key = fmt(ld.ref)
                if key not in d["special"]:
                    d["special"].append(key)
            elif ld.rtype == 0o4:
                key = fmt(ld.ref)
                if key not in d["quoted"]:
                    d["quoted"].append(key)
            elif ld.rtype == 0o10:
                key = fmt(ld.ref)
                if key not in d["array"]:
                    d["array"].append(key)
            elif ld.rtype == 0o5:
                d["lists"].append(ld.ref)
        p("")
        p("-- References by function (calls via CALL UUOs, special variables, quoted atoms and lists) --")
        order = [nm for _, nm in starts]
        if "(before first entry)" in per:
            order = ["(before first entry)"] + order
        seen = set()
        for nm in order:
            if nm in seen or nm not in per:
                continue
            seen.add(nm)
            d = per[nm]
            p("  %s" % nm)
            for key, label_ in (("called", "calls"), ("special", "specials"), ("array", "arrays"), ("quoted", "quoted atoms")):
                if d[key]:
                    p("      %-13s %s" % (label_ + ":", " ".join(d[key])))
            for form in d["lists"]:
                p("      quoted list:  " + pretty(form, 20))

        # Atom summary.
        syms = sorted(k for k in seg.uses)
        p("")
        p("-- Symbols and how they are used (%d) --" % len(syms))
        for s in syms:
            p("  %-30s %s" % (fmt_sym(s), ", ".join(sorted(seg.uses[s]))))
        unused = [fmt(a) for i, a in enumerate(seg.atoms) if i and isinstance(a, Sym) and a.name not in seg.uses]
        if unused:
            p("  (in atom table, no direct use found: %s)" % " ".join(unused))

        p("")
        p("-- Atom table (%d entries; 0 is NIL) --" % (len(seg.atoms) - 1))
        for i, a in enumerate(seg.atoms):
            if i == 0:
                continue
            kind = seg.atom_kinds[i]
            p("  %4d %-7s %s" % (i, kind, pretty(a, 15) if kind in ("list", "eval") else fmt(a)))

        if seg.ddt_defs:
            p("")
            p("-- DDT symbols defined --")
            for sym, val in seg.ddt_defs:
                p("  %-8s %s" % (sym, iw.octal(val)))

        if code:
            p("")
            out.extend(code_lines(seg))
    return "\n".join(out) + "\n"


def code_lines(seg):
    """LAP-like listing of the words a segment loads."""
    out = ["-- Loaded words (LAP-like listing; addresses relative to the load origin) --",
           "-- 'X = quoted atom or list, (SPECIAL X) = value cell, CALL n,'F = call F with n args",
           "-- (16 = lsubr-style, 17 = fsubr-style), Lnnn = local address, R70+n = the constant n,,n."]
    names = {}
    for (nm, typ, argl, addr, item) in seg.entries:
        names.setdefault(addr, fmt(nm))
    for addr in sorted(seg.loaded):
        ld = seg.loaded[addr]
        if addr in names:
            for (nm, typ, argl, a2, item) in seg.entries:
                if a2 == addr:
                    out.append("")
                    out.append("%s:   ; %s %s" % (fmt(nm), fmt(typ), args_str(argl)))
        txt = disasm(ld, seg, names)
        if ld.patches:
            txt += "   ; " + ", ".join(ld.patches)
        out.append("  %06o  %s  %s" % (addr, iw.octal(ld.word), txt))
    return out


def analyze(path):
    words = iw.decode_file(path)
    try:
        segs, info = parse(words, hash_key=True)
    except FaslError as e:
        return words, [], {"error": str(e), "consumed": 0, "words": len(words)}
    if info.get("error"):
        # Very old FASLAP may not have written hash keys after quoted lists.
        try:
            segs2, info2 = parse(words, hash_key=False)
            if not info2.get("error"):
                info2["note"] = "parsed without hash keys after quoted lists"
                return words, segs2, info2
        except FaslError:
            pass
    return words, segs, info


# ---------------------------------------------------------------------------

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _all():
    import json
    from urllib.parse import quote
    man = json.load(open(os.path.join(ROOT, "original", "MANIFEST.json"), encoding="utf-8"))
    outdir = os.path.join(ROOT, "reports", "fasl")
    codedir = os.path.join(outdir, "code")
    os.makedirs(codedir, exist_ok=True)
    rows = []
    defs = {}      # function name -> list of (tape, its file, property, args)
    for f in man["files"]:
        path = os.path.join(ROOT, f["path"])
        name = os.path.basename(f["path"])
        if not name.endswith(".fasl"):
            continue
        itsfile = itsdir.its_label(f["tape"], name)
        words, segs, info = analyze(path)
        label = "%s  (ITS KEN;%s, tape %s, %s)" % (f["path"], itsfile, f["tape"], f["tape_date"])
        base = "%s_%s" % (f["tape"], iw.report_name(name)[:-5])
        text = render(path, words, segs, info, label=label, code=False)
        text += "\nThe LAP-like listing of the loaded words is in code/%s.code.txt.\n" % base
        with open(os.path.join(outdir, base + ".txt"), "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
        with open(os.path.join(codedir, base + ".code.txt"), "w", encoding="utf-8", newline="\n") as fh:
            fh.write("Code listing: %s\n\n" % label)
            for si, seg in enumerate(segs):
                if len(segs) > 1:
                    fh.write("== Segment %d ==\n" % (si + 1))
                fh.write("\n".join(code_lines(seg)) + "\n")
        for seg in segs:
            for (nm, typ, argl, addr, item) in seg.entries:
                defs.setdefault(fmt(nm), []).append((f["tape"], itsfile, fmt(typ), args_str(argl)))
        nent = sum(len(s.entries) for s in segs)
        nmung = sum(len(s.mungeables) for s in segs)
        natoms = sum(len(s.atoms) - 1 for s in segs)
        hdr = iw.sixbit(segs[0].magic) if segs else "?"
        ver = iw.sixbit(segs[0].version & ~0o377).strip() if segs else "?"
        ok = not info.get("error") and info.get("consumed") == len(words)
        rows.append((f["tape"], itsfile, len(words), hdr, ver, len(segs), nent, nmung, natoms, ok,
                     info.get("error") or info.get("note") or "", base))
        print(("OK  " if ok else "BAD ") + f["path"], info.get("error") or "")
    with open(os.path.join(outdir, "SUMMARY.md"), "w", encoding="utf-8", newline="\n") as fh:
        fh.write("# FASL parse summary\n\n")
        fh.write("Generated by `python -I tools/fasl.py --all` from every `*.fasl` file in `original/`. "
                 "\"Clean\" means every decoded word was consumed: header, blocks, end marker, "
                 "and nothing left over.\n\n")
        good = sum(1 for r in rows if r[9])
        fh.write("**%d of %d files parse cleanly.**\n\n" % (good, len(rows)))
        fh.write("\"Lisp version\" is the SIXBIT text of header word 1 with its low 8 flag bits masked. "
                 "Read in tape-date order (810, 997, 020 for `*FASL*`; 104 ... 914 for `*FASL+`) these "
                 "look like the compiling MacLisp's version number without its leading digit "
                 "(an inference, not documented).\n\n")
        fh.write("| Tape | ITS file (KEN;) | Words | Header | Lisp version | Functions | Top-level forms | Atom-table entries | Clean | Dump | Code |\n")
        fh.write("|---|---|---|---|---|---|---|---|---|---|---|\n")
        for r in rows:
            note = (" (%s)" % r[10].replace("|", "/")) if r[10] else ""
            fh.write("| %s | %s | %d | %s | %s | %d | %d | %d | %s%s | [dump](%s) | [code](%s) |\n" %
                     (r[0], r[1], r[2], r[3], r[4], r[6], r[7], r[8], "yes" if r[9] else "**no**", note,
                      quote(r[11] + ".txt"), "code/" + quote(r[11] + ".code.txt")))
        if any(r[5] != 1 for r in rows):
            fh.write("\nFiles with more than one FASL segment: %s\n" %
                     ", ".join("%s %s (%d)" % (r[0], r[1], r[5]) for r in rows if r[5] != 1))
    with open(os.path.join(outdir, "DEFINITIONS.md"), "w", encoding="utf-8", newline="\n") as fh:
        fh.write("# Functions defined in the FASL files\n\n")
        fh.write("Every compiled entry point (FASL relocation type 13), with the property it is "
                 "stored under and its ARGS information ((NIL . n) = SUBR of n args; (m . n) = LSUBR). "
                 "Generated by `python -I tools/fasl.py --all`.\n\n")
        fh.write("| Function | Defined in (tape: KEN; file, property, args) |\n|---|---|\n")
        for k in sorted(defs):
            fh.write("| `%s` | %s |\n" % (k.replace("|", "\\|"), "; ".join(
                "%s: %s %s %s" % (t, itsf, prop, ar) for (t, itsf, prop, ar) in defs[k])))
    return 0


def main(argv):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    if argv[0] == "--all":
        return _all()
    code = "--code" in argv
    for path in [a for a in argv if not a.startswith("--")]:
        words, segs, info = analyze(path)
        sys.stdout.write(render(path, words, segs, info, code=code))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
