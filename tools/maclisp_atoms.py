"""List MacLisp's system atoms in the order their symbol headers are allocated.

MacLisp's initial symbols are created by macros in src/l/struct.660 of
github.com/PDP-10/its (MKAT, MKAT1, MKAL, MKALV, MKAV, MKFV, MSA, MRA and direct
RMTAH1 calls). Each call allocates the next word of pure symbol space, after
T, the internal UNBOUND marker and a 16-word ALLOC block. So the order of these
calls is the order of the atoms' header addresses in a running Lisp.

This expands those macro calls (with IRP/IRPS loops, ITS conditionals and the
pname-prefix macros %PIPN = "+INTERNAL-" etc.) into the ordered list of pnames.
The 1981 file is newer than the Lisp in TS D2500, so pdump.py aligns this list
with atoms it has already identified and only uses stretches whose lengths agree.

Output: one line per atom, "kind<TAB>pname-cells<TAB>pname", where kind is P
(own 2-cell property list allocated just before the pname), H (shares a
property list defined elsewhere) or Z (no property list), and pname-cells is
the number of list cells of its pname, prefix included.

Usage (run with python -I):
    python -I tools/maclisp_atoms.py PATH/struct.660 > tools/maclisp_atoms_1981.txt
    python -I tools/maclisp_atoms.py --vcells PATH/struct.660 > tools/maclisp_vcells_1981.txt

With --vcells it lists, in order, the atoms whose value cells struct.660
allocates in value-cell space (MKAV, MKALV, MKFV): the k-th one's value cell is
word k of that space.
"""

import re
import sys

PREFIX = {"%DVST": "defvs", "%DEFM": "DEFMA", "%PIPN": "+INTERNAL-", "%MXPN": "MACROEXPAN",
          "%ARRY": "ARRAY", "%SIEX": "SI:EX", "%SICH": "SI:CH", "%FIXN": "FIXNU", "%FLON": "FLONU",
          "%MTPL": "MULTIPLE-VALUE-", "%READ": "READ-", "%FEXF": "FILE-EXIT-FUNCT",
          "%SIDC": "SI:DEFCLAS", "%VALU": "VALUE"}

# Assembly switches for an ITS MacLisp of about 1980.
FLAGS = {"ITS": 1, "SAIL": 0, "D10": 0, "D20": 0, "PAGING": 1, "BIGNUM": 1, "HNKLOG": 1,
         "USELESS": 1, "JOBQIO": 1, "SFA": 1, "CMU": 0, "TOPS10": 0, "TOPS20": 0, "TENEX": 0}
PREFIX_FLAGS = {"DB": 0, "CX": 0, "DX": 0, "BG": 1, "HN": 1, "PG": 1, "SA": 0, "10": 0, "20": 0,
                "HS": 0, "IT": 1, "REL": 0, "SFA": 1, "QIO": 1, "JQ": 1}

ATOM_MACROS = {"MKAT", "MKAT1", "MKAT2", "MKAL", "MKALV", "MKAV", "MKFV", "MSA", "MRA", "RMTAH1"}


def split_args(s):
    """Split MIDAS macro arguments: commas separate, [..] groups (and ends an arg)."""
    args = []
    cur = ""
    i = 0
    while i < len(s):
        c = s[i]
        if c == "[":
            depth, j = 1, i + 1
            while j < len(s) and depth:
                depth += {"[": 1, "]": -1}.get(s[j], 0)
                j += 1
            inner = s[i + 1:j - 1]
            if cur.strip():
                cur += "[" + inner + "]"
                i = j
                continue
            args.append(inner)
            cur = ""
            i = j
            if i < len(s) and s[i] == ",":
                i += 1
            elif i < len(s) and s[i] not in " \t;":
                pass            # next argument follows the bracket directly
            else:
                # whitespace or end: stop
                rest = s[i:].lstrip()
                if not rest or rest.startswith(";"):
                    return args
                i = len(s) - len(rest)
            continue
        if c == ",":
            args.append(cur.strip())
            cur = ""
        elif c == ";":
            break
        else:
            cur += c
        i += 1
    if cur.strip():
        args.append(cur.strip())
    return args


def words(s):
    return (len(s) + 4) // 5


def pname_of(macro, args):
    """[(kind, pname-cells, pname)] for one macro call. kind: P = has its own
    2-cell property list allocated just before its pname (MKAT, MKAT1, MKAT2,
    MKFV, RMTAH1 with PNL-2); H = shares a property list defined elsewhere
    (MKAL, MKALV, RMTAH1 with another list); Z = no property list."""
    def a(i):
        return args[i] if i < len(args) else ""

    def entry(kind, prefix_macro, pn):
        pre = PREFIX.get(prefix_macro, "")
        return (kind, words(pre) + words(pn), pre + pn, macro in ("MKAV", "MKALV", "MKFV"))
    if macro in ("MKAT", "MKAT2"):
        return [entry("P", "", a(0))]
    if macro == "MKAT1":
        return [entry("P", a(5), a(0))]
    if macro == "MKAL":
        return [entry("H", a(4), a(0))]
    if macro == "MKALV":
        return [entry("H", a(5), a(0))]
    if macro == "MKAV":
        return [entry("Z", a(4), a(0))]
    if macro == "MKFV":
        return [entry("P", a(5), a(0))]
    if macro == "MSA":
        return [entry("Z", "", a(1))]
    if macro == "MRA":
        return [entry("Z", "", x.strip()) for x in ",".join(args).split(",") if x.strip()]
    if macro == "RMTAH1":
        pl = a(2).strip()
        kind = "Z" if not pl else ("P" if pl == "PNL-2" else "H")
        return [entry(kind, a(6), a(3))]
    return []


def cond_ok(line):
    """Handle line prefixes like DB$ / DB% and 'IFN X,' / 'IFE X,' one-liners.
    Returns (keep, rest-of-line)."""
    m = re.match(r"\s*([A-Z0-9]{2,3})([$%])\s+(.*)", line)
    if m and m.group(1) in PREFIX_FLAGS:
        on = PREFIX_FLAGS[m.group(1)]
        return (on if m.group(2) == "$" else not on), m.group(3)
    return True, line


def expand_irp(header, body):
    """header like 'IRP A,,[x,y]B,,[p,q]' or 'IRPS A,C,[x y,z]'. Yields substituted bodies."""
    irps = header.lstrip().startswith("IRPS")
    spec = header.split(None, 1)[1]
    groups = []
    for m in re.finditer(r"([A-Z]+),([A-Z]*),\[((?:[^\[\]]|\[[^\]]*\])*)\]", spec, re.S):
        groups.append((m.group(1), m.group(2), m.group(3)))
    if not groups:
        return
    lists = []
    for var, sepvar, items in groups:
        if irps:
            toks = [t for t in re.split(r"[\s,]+", items) if t]
        else:
            # IRP items are comma-separated; an item may be bracketed ('[;]').
            toks = []
            cur = ""
            depth = 0
            for ch in items.replace("\n", ","):
                if ch == "[":
                    depth += 1
                    if depth == 1:
                        continue
                if ch == "]":
                    depth -= 1
                    if depth == 0:
                        continue
                if ch == "," and depth == 0:
                    toks.append(cur.strip())
                    cur = ""
                    continue
                cur += ch
            toks.append(cur.strip())
            if toks and toks[-1] == "" and not items.rstrip().endswith(","):
                toks.pop()
        lists.append((var, toks))
    n = len(lists[0][1])
    for k in range(n):
        text = body
        for var, toks in lists:
            val = toks[k] if k < len(toks) else ""
            text = re.sub(r"!*\b%s\b!*" % re.escape(var), val, text)
        yield k, text


def atoms(src):
    lines = src.split("\n")
    start = next(i for i, l in enumerate(lines) if "SUBTTL\tRANDOM SYSTEMIC ATOMS" in l or "SUBTTL RANDOM SYSTEMIC ATOMS" in l)
    end = next(i for i, l in enumerate(lines) if "RANDOM BINDABLE CELLS" in l)
    return list(process(lines[start + 1:end]))


def process(lines):
    i = 0
    depth_skip = []
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        # Block conditionals: IFN X,[  ...  ]
        m = re.match(r"(IFN|IFE)\s+([A-Z0-9.]+)(?:\*([A-Z0-9]+))?,\s*\[\s*(.*)", stripped)
        if m:
            val = FLAGS.get(m.group(2), 0)
            if m.group(3):
                val = val and FLAGS.get(m.group(3), 0)
            keep = bool(val) if m.group(1) == "IFN" else not val
            # collect block until matching ']'
            depth = 1
            block = [m.group(4)] if m.group(4) else []
            j = i + 1
            while j < len(lines) and depth:
                l2 = lines[j]
                depth += l2.count("[") - l2.count("]")
                if depth <= 0:
                    block.append(l2[:l2.rfind("]")])
                    break
                block.append(l2)
                j += 1
            if keep:
                for x in process(block):
                    yield x
            i = j + 1
            continue
        m = re.match(r"(IFN|IFE)\s+([A-Z0-9.]+),\s*(.*)", stripped)
        if m and not stripped.endswith("["):
            val = FLAGS.get(m.group(2), 0)
            keep = bool(val) if m.group(1) == "IFN" else not val
            if keep:
                for x in process([m.group(3)]):
                    yield x
            i += 1
            continue
        keep, rest = cond_ok(line)
        if not keep:
            i += 1
            continue
        rs = rest.strip()
        if rs.startswith(("IRP ", "IRPS ", "IRP\t", "IRPS\t")):
            header = rs
            # header may continue over lines until the closing bracket of the last list
            j = i
            while header.count("[") > header.count("]"):
                j += 1
                header += "\n" + lines[j]
            body = []
            j += 1
            depth = 1
            while j < len(lines):
                t = lines[j].strip()
                if t.startswith(("IRP ", "IRPS ")):
                    depth += 1
                if t.startswith("TERMIN"):
                    depth -= 1
                    if depth == 0:
                        break
                body.append(lines[j])
                j += 1
            hnk = None
            for k, text in expand_irp(header, "\n".join(body)):
                if ".ISTOP" in text and "HNKLOG" in text:
                    hnk = k
                for x in process([ln for ln in text.split("\n") if ".ISTOP" not in ln]):
                    yield x
                if hnk is not None and k >= HUNKS - 1:
                    break
            i = j + 1
            continue
        m = re.match(r"([A-Z0-9]+)\s+(.*)", rs)
        if m and m.group(1) in ATOM_MACROS:
            for pn in pname_of(m.group(1), split_args(m.group(2))):
                yield pn
        i += 1


HUNKS = 9


def main(argv):
    sys.stdout.reconfigure(encoding="utf-8")
    if not argv:
        print(__doc__)
        return 2
    vcells = argv[0] == "--vcells"
    if vcells:
        argv = argv[1:]
    src = open(argv[0], encoding="utf-8", errors="replace").read()
    for kind, cells, pn, vc in atoms(src):
        if not vcells:
            print("%s	%d	%s" % (kind, cells, pn))
        elif vc:
            print(pn)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
