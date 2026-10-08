"""Best-effort decompiler for MacLisp compiled code in a PDUMP image.

Used by pdump.py for the per-KEN1-file reports. It executes a function's code
symbolically: accumulators and the regular pushdown list hold expressions, the
kernel consers build list expressions (%NCONS A <- (LIST A), %CONS A <- (CONS A B),
%XCONS A <- (CONS B A); the %PDL... variants likewise), CARCDR+k entries apply
the CAR/CDR combination named in MacLisp's table, calls through link cells
become calls (arguments in A, B, C, AR1, AR2A, or on the stack for lsubr-style
calls), conditional jumps and skips become COND branches, LSH x,-9 followed by
SKIPGE ST(x) becomes an ATOM test, and HRLM/HRRM through a pointer become
RPLACA/RPLACD. Loops, number code and anything else unsupported stop the
decompilation of that function, and the reason is reported.

Macros defined with DEFMACRO (DEFMAX) compile to a recognizable shape:
MACROFETCH (memoized expansion), a LENGTH check that calls ERROR with
"Wrong number args to a macro call", the expansion, then MACROMEMO. Those are
rendered as (DEFMACRO name (args) `template). Other macros are rendered as
MacLisp (DEFUN name MACRO (FORM) ...).

Argument names are not recoverable (the tags lines stop at the name), so
arguments print as ARG1, ARG2 ... and REST.

Every result is a reconstruction, labeled with a confidence:
  high    straight-line code, every instruction and call understood
  medium  branches, or calls whose argument counts were inferred
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import its_words as iw  # noqa: E402
import fasl  # noqa: E402

ACN = {0: "0", 1: "A", 2: "B", 3: "C", 4: "AR1", 5: "AR2A", 6: "T", 7: "TT", 8: "D", 9: "R",
       10: "F", 11: "FREEAC", 12: "P", 13: "FLP", 14: "FXP", 15: "SP"}
ARGREGS = ["A", "B", "C", "AR1", "AR2A"]
CONSERS = {"%NCONS": "n", "%PDLNC": "n", "%CONS": "c", "%PDLC": "c", "%C2NS": "c",
           "%XCONS": "x", "%PDLXC": "x"}

# Argument counts of system SUBRs reached through snapped links (struct.660 ARGS
# fields; DEFMAX for MACROFETCH and MACROMEMO).
SYS_NARGS = {"LENGTH": 1, "MACROFETCH": 1, "MACROMEMO": 3, "GET": 2, "PUTPROP": 3, "REMPROP": 2,
             "ASSQ": 2, "ASSOC": 2, "MEMBER": 2, "MEMQ": 2, "EQUAL": 2, "LAST": 1, "NREVERSE": 1,
             "REVERSE": 1, "MAKNAM": 1, "EXPLODE": 1, "EXPLODEC": 1, "READLIST": 1,
             "FIX": 1, "FLOAT": 1, "PRINT": 1, "PRINC": 1, "PRIN1": 1, "TERPRI": 0, "SLEEP": 1,
             "PROBEF": 1, "LOAD": 1, "SUBST": 3, "SUBLIS": 2, "SET": 2, "RPLACA": 2, "RPLACD": 2,
             "NTH": 2, "NTHCDR": 2, "*APPEND": 2, "*NCONC": 2, "*PLUS": 2, "*DIF": 2, "*TIMES": 2,
             "*QUO": 2, "*GREAT": 2, "*LESS": 2, "*DELQ": 2, "*DELETE": 2, "*EVAL": 1, "EVAL": 1,
             "EQ": 2, "ATOM": 1, "NOT": 1, "NULL": 1, "SYMEVAL": 1, "PLIST": 1, "INTERN": 1,
             "GETL": 2, "SASSQ": 3, "SASSOC": 3, "DISPLACE": 2, "COPYSYMBOL": 2, "PNGET": 2,
             "GETCHARN": 2, "GETCHAR": 2, "FLATC": 1, "FLATSIZE": 1, "SXHASH": 1, "XCONS": 2,
             "NCONS": 1, "CONS": 2, "BOUNDP": 1, "MAKUNBOUND": 1, "TYPEP": 1, "NUMBERP": 1}


class Fail(Exception):
    pass


NIL = ("nil",)


def car(e):
    if e[0] == "cons":
        return e[1]
    return ("car", e)


def cdr(e):
    if e[0] == "cons":
        return e[2]
    return ("cdr", e)


class State:
    __slots__ = ("regs", "stack", "stmts", "written", "fxp", "flp")

    def __init__(self):
        self.regs = {}
        self.stack = []
        self.stmts = []
        self.written = set()
        self.fxp = []
        self.flp = []

    def copy(self):
        s = State()
        s.regs = dict(self.regs)
        s.stack = list(self.stack)
        s.stmts = list(self.stmts)
        s.written = set(self.written)
        s.fxp = list(self.fxp)
        s.flp = list(self.flp)
        return s

    def get(self, reg):
        return self.regs.get(reg, ("unknown", reg))

    def set(self, reg, val):
        self.regs[reg] = val
        self.written.add(reg)


class Decompiler:
    def __init__(self, nm, start, name, kind, nargs):
        self.nm = nm
        self.img = nm.img
        self.start = start
        self.end = nm.next_start.get(start) or start + 2000
        self.name = name
        self.kind = kind
        self.nargs = nargs
        self.steps = 0
        self.inferred = False
        self.branched = False
        self.vcells = dict(getattr(nm, "vcell_unknown", {}))     # #vcNNNNN: unnamed system variables
        self.vcells.update(nm.vcell)

    # -- operands -----------------------------------------------------------
    def addr_value(self, r):
        nm = self.nm
        if r == 0:
            return NIL
        if self.start <= r < self.end:
            return ("retaddr", r)
        if r in nm.atom or self.img.is_symbol(r):
            return ("sym", nm.atom.get(r) or "#%o" % r, r)
        seg = r >> 9
        if seg in self.img.listsegs and r in self.img.mem:
            return ("const", r)
        if seg in self.img.fixsegs and r in self.img.mem:
            return ("num", iw.signed(self.img.mem[r]))
        if seg in nm.flosegs and r in self.img.mem:
            return ("flo", self.img.mem[r])
        n = nm.small_fixnum(r)
        if n is not None:
            return ("num", n)
        if r < 0o1000:
            return ("num", r)
        return ("unknown", "address %o" % r)

    def stack_pos(self, st, r):
        off = r - (1 << 18) if r & (1 << 17) else r
        pos = len(st.stack) - 1 + off
        if pos < 0 or pos >= len(st.stack):
            raise Fail("stack reference out of range")
        return pos

    def read(self, st, w, imm=False):
        x = (w >> 18) & 0o17
        ind = (w >> 22) & 1
        r = w & iw.RIGHT
        if x == 12:
            if ind and not imm:
                return ("unbox", st.stack[self.stack_pos(st, r)])     # @-n(P): the number pointed to
            if ind or imm:
                raise Fail("address of or indirect through a stack slot")
            return st.stack[self.stack_pos(st, r)]
        if x in (13, 14):                                              # -n(FLP) / -n(FXP): number stacks
            stk = st.fxp if x == 14 else st.flp
            if ind:
                raise Fail("indirect through a number stack slot")
            off = r - (1 << 18) if r & (1 << 17) else r
            pos = len(stk) - 1 + off
            if pos < 0 or pos >= len(stk):
                raise Fail("number stack reference out of range")
            return stk[pos]                                            # MOVEI A,(FXP) passes the number
        if x:
            if self.nm.kernel_name(r) == "ST" and not ind:
                v = st.get(ACN[x])
                if v[0] == "segof":
                    return ("stword", v[1])
            if r or ind:
                raise Fail("indexed address with offset or indirection")
            base = st.get(ACN[x])
            return base if imm else ("unbox", base)
        if ind:
            if r in self.vcells:
                return ("unbox", ("special", self.vcells[r]))
            raise Fail("indirect addressing")
        if imm:
            return self.addr_value(r)
        if r <= 0o17:
            return st.get(ACN[r])
        if r in self.vcells:
            return ("special", self.vcells[r])
        kn = self.nm.kernel_name(r) or ""
        if kn == "R70":
            return NIL
        if kn.startswith("R70+"):
            return ("num", int(kn[4:], 8))
        if self.start <= r < self.end and r in self.img.mem:
            lit = self.img.mem[r]                       # a word in the function's literal pool
            if lit >> 18 == 0:
                return self.addr_value(lit & iw.RIGHT)
            return ("raw", lit)
        raise Fail("load from address %o" % r)

    def pointer_operand(self, st, w):
        """The cons a HLRZ/HRRZ/HRLM/HRRM operand points at: (X), @-n(P) or
        @(SPECIAL X)."""
        x = (w >> 18) & 0o17
        ind = (w >> 22) & 1
        r = w & iw.RIGHT
        if x == 12 and ind:
            return st.stack[self.stack_pos(st, r)]
        if x and x != 12 and not ind and r == 0:
            return st.get(ACN[x])
        if not x and ind and r in self.vcells:
            return ("special", self.vcells[r])
        if not x and ind and r <= 0o17:
            return st.get(ACN[r])
        raise Fail("unsupported pointer operand")

    def halfword_plain(self, st, w, mn):
        """HRRZ of a stack slot or value cell is the pointer itself."""
        x = (w >> 18) & 0o17
        ind = (w >> 22) & 1
        r = w & iw.RIGHT
        if mn != "HRRZ" or ind:
            return None
        if x == 12:
            return st.stack[self.stack_pos(st, r)]
        if not x and r in self.vcells:
            return ("special", self.vcells[r])
        if not x and r <= 0o17:
            return st.get(ACN[r])
        return None

    def write(self, st, w, val):
        x = (w >> 18) & 0o17
        ind = (w >> 22) & 1
        r = w & iw.RIGHT
        if x == 12 and not ind:
            st.stack[self.stack_pos(st, r)] = val
            return
        if x in (13, 14) and not ind:
            stk = st.fxp if x == 14 else st.flp
            off = r - (1 << 18) if r & (1 << 17) else r
            pos = len(stk) - 1 + off
            if pos < 0 or pos >= len(stk):
                raise Fail("number stack store out of range")
            stk[pos] = val
            return
        if x or ind:
            raise Fail("store through a pointer")
        if r <= 0o17:
            st.set(ACN[r], val)
            return
        if r in self.vcells:
            st.stmts.append(("setq", self.vcells[r], val))
            return
        raise Fail("store to address %o" % r)

    # -- calls ---------------------------------------------------------------
    def link_call(self, st, cell):
        nm = self.nm
        w = self.img.mem.get(cell)
        if w is None:
            raise Fail("link cell missing")
        op = w >> 27
        ac = (w >> 23) & 0o17
        rh = w & iw.RIGHT
        callee = nm.links.get(cell) or nm.atom.get(rh) or ("#%o" % rh)
        if op in fasl.CALL_UUOS:
            mn = fasl.UUOS[op]
            return callee, ac, mn in ("JCALL", "NJCALL", "JCALLF", "NJCALF"), mn
        if op in (0o260, 0o254):
            return callee, self.callee_nargs(st, callee), op == 0o254, "PUSHJ" if op == 0o260 else "JRST"
        raise Fail("unrecognized link cell")

    def callee_nargs(self, st, callee):
        img = self.img
        for a in img.byname.get(callee, []):
            args = img.mem[img.syms[a][2] + 1] >> 18
            if args and not args >> 9 and (args & 0o777) not in (0, 0o777):
                return (args & 0o777) - 1
        if SYS_NARGS.get(callee) is not None:
            return SYS_NARGS[callee]
        # Infer from the argument registers set since the previous call.
        self.inferred = True
        n = 0
        for reg in ARGREGS:
            if reg in st.written:
                n += 1
            else:
                break
        return max(n, 1)

    def do_call(self, st, callee, nargs):
        if nargs == 0o16:                                # lsubr-style: args on the stack, T = -n
            t = st.regs.get("T")
            if not (t and t[0] == "num" and t[1] is not None and t[1] <= 0):
                raise Fail("lsubr call without a known argument count")
            n = -t[1]
            if n > len(st.stack):
                raise Fail("lsubr call pops more than pushed")
            args = st.stack[len(st.stack) - n:]
            del st.stack[len(st.stack) - n:]
            return ("call", callee, list(args))
        if nargs == 0o17:
            return ("fcall", callee, st.get("A"))
        if nargs > 5:
            raise Fail("call with %d register arguments" % nargs)
        return ("call", callee, [st.get(r) for r in ARGREGS[:nargs]])

    # -- execution -----------------------------------------------------------
    def branch(self, test, if_true_pc, if_false_pc, st, seen, depth):
        self.branched = True
        if depth > 40:
            raise Fail("too deeply nested")
        t = self.run(if_true_pc, st.copy(), seen, depth + 1)
        f = self.run(if_false_pc, st.copy(), seen, depth + 1)
        return ("if", test, t, f)

    def run(self, pc, st, seen, depth=0):
        try:
            return self._run(pc, st, seen, depth)
        except Fail as e:
            if " at " in str(e) or getattr(e, "located", False):
                raise
            w = self.img.mem.get(self.last_pc)
            import pdump
            text = pdump.disasm_word(self.nm, w) if w is not None else "?"
            f = Fail("%s at %06o: %s" % (e, self.last_pc, text))
            f.located = True
            raise f

    def _run(self, pc, st, seen, depth=0):
        img = self.img
        nm = self.nm
        while True:
            self.last_pc = pc
            self.steps += 1
            if self.steps > 8000:
                raise Fail("too long")
            if pc in seen:
                raise Fail("loop")
            if not (self.start <= pc < self.end):
                raise Fail("jump outside the function")
            seen = seen | {pc}
            w = img.mem.get(pc)
            if w is None:
                raise Fail("code missing")
            op = (w >> 27) & 0o777
            ac = (w >> 23) & 0o17
            acn = ACN[ac]
            x = (w >> 18) & 0o17
            ind = (w >> 22) & 1
            r = w & iw.RIGHT
            mn = fasl.OPCODES.get(op) or fasl.UUOS.get(op)
            nxt = pc + 1
            simple = not x and not ind
            if mn is None:
                raise Fail("word %s is not an instruction" % iw.octal(w))
            if mn == "PUSH" and ac == 12:
                st.stack.append(self.read(st, w))
            elif mn == "POP" and ac == 12:
                if not st.stack:
                    raise Fail("pop from empty stack")
                self.write(st, w, st.stack.pop())
            elif mn == "MOVE":
                st.set(acn, self.read(st, w))
            elif mn in ("MOVEI", "HRRZI"):
                st.set(acn, self.read(st, w, imm=True))
            elif mn == "MOVEM":
                self.write(st, w, st.get(acn))
            elif mn == "SETZM":
                self.write(st, w, NIL)
            elif mn in ("SETZ", "SETZB") and simple and r == 0:
                st.set(acn, NIL)
            elif mn == "SETZB":
                st.set(acn, NIL)
                self.write(st, w, NIL)
            elif mn == "HRRZ" and x and not ind and nm.kernel_name(r) == "ST":
                v = st.get(ACN[x])
                if v[0] != "segof":
                    raise Fail("ST lookup of a non-segment value")
                st.set(acn, ("call", "TYPEP", [v[1]]))
            elif mn in ("HLRZ", "HRRZ") and self.halfword_plain(st, w, mn) is not None:
                st.set(acn, self.halfword_plain(st, w, mn))
            elif mn in ("HLRZ", "HRRZ") and not (simple and r > 0o17 and r not in self.vcells):
                v = self.pointer_operand(st, w)
                st.set(acn, car(v) if mn == "HLRZ" else cdr(v))
            elif mn in ("HRLM", "HRRM") and not simple:
                ptr = self.pointer_operand(st, w)
                st.stmts.append(("do", ("call", "RPLACA" if mn == "HRLM" else "RPLACD", [ptr, st.get(acn)])))
            elif mn == "EXCH":
                if x == 12 and not ind:
                    pos = self.stack_pos(st, r)
                    a, b = st.stack[pos], st.get(acn)
                    st.set(acn, a)
                    st.stack[pos] = b
                elif simple and r <= 0o17:
                    other = ACN[r]
                    a, b = st.get(other), st.get(acn)
                    st.set(acn, a)
                    st.set(other, b)
                else:
                    raise Fail("unsupported EXCH")
            elif mn == "LSH" and simple and r == 0o777767:     # LSH x,-9: segment number
                st.set(acn, ("segof", st.get(acn)))
            elif mn in ("SKIPGE", "SKIPL") and ac == 0 and x and not ind and nm.kernel_name(r) == "ST":
                v = st.get(ACN[x])
                if v[0] != "segof":
                    raise Fail("ST lookup of a non-segment value")
                test = ("call", "ATOM", [v[1]])
                # SKIPGE skips when the ST entry is >= 0, i.e. the object is not a list.
                if mn == "SKIPGE":
                    return self.branch(test, pc + 2, pc + 1, st, seen, depth)
                return self.branch(test, pc + 1, pc + 2, st, seen, depth)
            elif mn == "JSP" and ac == 6:
                kname = nm.kernel_name(r) if simple else None
                if kname in CONSERS:
                    a, b = st.get("A"), st.get("B")
                    k = CONSERS[kname]
                    st.set("A", ("cons", a, NIL) if k == "n" else (("cons", a, b) if k == "c" else ("cons", b, a)))
                elif kname == "CARCDR":
                    v = st.get("A")
                    for ch in reversed("ADDD"):
                        v = car(v) if ch == "A" else cdr(v)
                    st.set("A", v)
                elif kname and kname.startswith("%C") and kname.endswith("R"):
                    v = st.get("A")
                    for ch in reversed(kname[2:-1]):
                        v = car(v) if ch == "A" else cdr(v)
                    st.set("A", v)
                elif kname == "PDLNMK":
                    pass
                elif kname in ("FXCONS", "FIX1A", "FLCONS"):
                    st.set("A", st.get("TT"))
                elif kname == "PDLNKJ":
                    return ("return", st, st.get("A"))
                elif kname == "SPECBIND":
                    nxt = self.specbind(st, pc + 1)
                else:
                    raise Fail("JSP T,%s not modeled" % (kname or "%o" % r))
            elif mn == "PUSHJ" and ac == 12 and simple and nm.kernel_name(r) == "UNBIND":
                st.stmts.append(("unbind",))
            elif mn == "JRST" and simple and nm.kernel_name(r) == "UNBIND":
                st.stmts.append(("unbind",))
                return ("return", st, st.get("A"))
            elif op in fasl.CALL_UUOS and simple:
                callee = nm.atom.get(r) or ("#%o" % r)
                tail = mn in ("JCALL", "NJCALL", "JCALLF", "NJCALF")
                call = self.do_call(st, callee, ac)
                if tail:
                    return ("return", st, call)
                st.stmts.append(("callpos", call))
                st.regs["A"] = call
                st.written = {"A"}
                if mn in ("NCALL", "NCALLF"):
                    st.regs["TT"] = ("num-of", call)
            elif mn == "XCT" and simple:
                callee, nargs, tail, how = self.link_call(st, r)
                call = self.do_call(st, callee, nargs)
                if tail:
                    if st.stack and st.stack[-1][0] == "retaddr":
                        nxt = st.stack.pop()[1]          # a JCALL with a pushed return address
                        st.stmts.append(("callpos", call))
                        st.set("A", ("unknown", "value of %s" % callee))
                    else:
                        return ("return", st, call)
                else:
                    st.stmts.append(("callpos", call))
                    st.regs["A"] = call
                    st.written = {"A"}
                    if how == "NCALL" or callee == "LENGTH":
                        st.regs["TT"] = ("num-of", call)
            elif mn == "MOVNI" and simple:
                st.set(acn, ("num", -r))
            elif mn == "SUB" and ac == 12:
                kn = nm.kernel_name(r) or ""
                if not kn.startswith("R70+"):
                    raise Fail("SUB P,%o not modeled" % r)
                n = int(kn[4:], 8)
                if n > len(st.stack):
                    raise Fail("popping more than pushed")
                del st.stack[len(st.stack) - n:]
            elif mn == "POPJ" and ac == 12:
                return ("return", st, st.get("A"))
            elif mn == "JRST" and simple:
                nxt = r
            elif mn in ("JUMPE", "JUMPN") and simple:
                test = st.get(acn)
                if mn == "JUMPE":
                    return self.branch(test, pc + 1, r, st, seen, depth)
                return self.branch(test, r, pc + 1, st, seen, depth)
            elif mn in ("SKIPE", "SKIPN"):
                test = self.read(st, w)
                if ac:
                    st.set(acn, test)
                if mn == "SKIPE":            # skip when NIL
                    return self.branch(test, pc + 1, pc + 2, st, seen, depth)
                return self.branch(test, pc + 2, pc + 1, st, seen, depth)
            elif mn in ("CAIE", "CAIN") and not ind and x and x != 12 and r == 0:
                test = ("call", "EQ", [st.get(acn), st.get(ACN[x])])
                if mn == "CAIE":
                    return self.branch(test, pc + 2, pc + 1, st, seen, depth)
                return self.branch(test, pc + 1, pc + 2, st, seen, depth)
            elif mn in ("CAIE", "CAIN") and simple:
                left = st.get(acn)
                if acn == "TT" and left[0] == "num-of":
                    test = ("call", "=", [left[1], ("num", r)])
                else:
                    test = ("call", "EQ", [left, self.addr_value(r)])
                if mn == "CAIE":             # skip when equal
                    return self.branch(test, pc + 2, pc + 1, st, seen, depth)
                return self.branch(test, pc + 1, pc + 2, st, seen, depth)
            elif mn in ("CAIL", "CAIG", "CAILE", "CAIGE") and simple and acn == "TT":
                left = st.get("TT")
                n = r - (1 << 18) if r & (1 << 17) else r
                inner = left[1] if left[0] == "num-of" else left
                rel = {"CAIL": "<", "CAIG": ">", "CAILE": "<=", "CAIGE": ">="}[mn]
                return self.branch(("cmp", rel, inner, n), pc + 2, pc + 1, st, seen, depth)
            elif mn in ("CAME", "CAMN") and not ind:
                test = ("call", "EQ", [st.get(acn), self.read(st, w)])
                if mn == "CAME":
                    return self.branch(test, pc + 2, pc + 1, st, seen, depth)
                return self.branch(test, pc + 1, pc + 2, st, seen, depth)
            elif mn == "SKIPA" and ac == 0:
                nxt = pc + 2
            elif mn == "TDZA" and simple and r == ac:
                st.set(acn, NIL)
                nxt = pc + 2
            elif mn == "JFCL":
                pass
            elif mn == "HRRZ" and x and not ind and nm.kernel_name(r) == "ST":
                v = st.get(ACN[x])
                if v[0] != "segof":
                    raise Fail("ST lookup of a non-segment value")
                st.set(acn, ("call", "TYPEP", [v[1]]))
            elif mn in ("TLNE", "TLNN") and simple and st.get(acn)[0] == "stword":
                obj = st.get(acn)[1]
                test = ("typetest", r, obj)
                # TLNE skips when the masked type bits are all zero (object not of the type).
                if mn == "TLNE":
                    return self.branch(test, pc + 1, pc + 2, st, seen, depth)
                return self.branch(test, pc + 2, pc + 1, st, seen, depth)
            elif mn == "PUSH" and ac in (13, 14):
                (st.fxp if ac == 14 else st.flp).append(self.read(st, w))
            elif mn == "POP" and ac in (13, 14):
                stk = st.fxp if ac == 14 else st.flp
                if not stk:
                    raise Fail("pop from empty number stack")
                self.write(st, w, stk.pop())
            elif mn == "SUB" and ac in (13, 14):
                kn = nm.kernel_name(r) or ""
                if not kn.startswith("R70+"):
                    raise Fail("SUB on a number stack not modeled")
                n = int(kn[4:], 8)
                stk = st.fxp if ac == 14 else st.flp
                if n > len(stk):
                    raise Fail("popping more than pushed (number stack)")
                del stk[len(stk) - n:]
            elif mn in ("FADR", "FSBR", "FMPR", "FDVR", "FAD", "FSB", "FMP", "FDV") and acn in ("TT", "D", "R", "F", "T"):
                fn = {"FA": "+$", "FS": "-$", "FM": "*$", "FD": "//$"}[mn[:2]]
                st.set(acn, ("call", fn, [st.get(acn), self.read(st, w)]))
            elif mn in ("JUMPL", "JUMPGE", "JUMPLE", "JUMPG") and simple:
                v = st.get(acn)
                rel = {"JUMPL": "<", "JUMPGE": ">=", "JUMPLE": "<=", "JUMPG": ">"}[mn]
                return self.branch(("cmp", rel, v, 0), r, pc + 1, st, seen, depth)
            elif mn in ("CAML", "CAMG", "CAMLE", "CAMGE") and not ind or (mn in ("CAML", "CAMG", "CAMLE", "CAMGE") and ind and not x):
                rel = {"CAML": "<", "CAMG": ">", "CAMLE": "<=", "CAMGE": ">="}[mn]
                test = ("cmp2", rel, st.get(acn), self.read(st, w))
                return self.branch(test, pc + 2, pc + 1, st, seen, depth)
            elif mn == "SKIPA" and ac:
                st.set(acn, self.read(st, w))
                nxt = pc + 2
            elif mn in ("ADD", "SUB", "IMUL", "IDIV") and acn in ("TT", "D", "R", "F", "T"):
                fn = {"ADD": "PLUS", "SUB": "DIFFERENCE", "IMUL": "TIMES", "IDIV": "QUOTIENT"}[mn]
                st.set(acn, ("call", fn, [st.get(acn), self.read(st, w)]))
            elif mn in ("ADDI", "SUBI", "IMULI", "IDIVI") and simple and acn in ("TT", "D", "R", "F", "T"):
                fn = {"ADDI": "PLUS", "SUBI": "DIFFERENCE", "IMULI": "TIMES", "IDIVI": "QUOTIENT"}[mn]
                n = r - (1 << 18) if r & (1 << 17) else r
                st.set(acn, ("call", fn, [st.get(acn), ("num", n)]))
            elif mn == "MOVSI" and simple:
                st.set(acn, ("rawlh", r))
            elif mn == "JSP" and ac == 6 and simple and nm.kernel_name(r) in ("FXCONS", "FIX1A", "FLCONS"):
                st.set("A", st.get("TT"))
            elif op in fasl.CALL_UUOS and not simple:
                if x and not ind and r == 0 and x != 12:
                    fnv = st.get(ACN[x])
                elif ind and not x and r in self.vcells:
                    fnv = ("special", self.vcells[r])
                elif ind and x == 12:
                    fnv = st.stack[self.stack_pos(st, r)]
                else:
                    raise Fail("computed call not modeled")
                if ac > 5:
                    raise Fail("computed call with %o" % ac)
                call = ("call", "FUNCALL", [fnv] + [st.get(reg) for reg in ARGREGS[:ac]])
                if mn in ("JCALL", "NJCALL", "JCALLF", "NJCALF"):
                    return ("return", st, call)
                st.stmts.append(("callpos", call))
                st.regs["A"] = call
                st.written = {"A"}
            else:
                raise Fail("%s not modeled" % mn)
            pc = nxt

    def specbind(self, st, pc):
        """Consume SPECBIND specification words: 0 n,cell binds cell to AC n (0 = NIL)."""
        while True:
            w = self.img.mem.get(pc)
            if w is None:
                raise Fail("specbind words missing")
            var = self.vcells.get(w & iw.RIGHT) or ("#vc%o" % (w & iw.RIGHT))
            if (w >> 33) == 7:                       # 7_41 M,cell: bind cell to -M(P)
                m = (w >> 18) & 0o77777
                if m >= len(st.stack):
                    raise Fail("binding to a stack slot out of range")
                st.stmts.append(("bind", var, st.stack[len(st.stack) - 1 - m]))
                pc += 1
                continue
            if (w >> 27) != 0:
                return pc
            ac = (w >> 23) & 0o17
            st.stmts.append(("bind", var, NIL if ac == 0 else st.get(ACN[ac])))
            pc += 1

    def decompile(self):
        st = State()
        if self.kind == "MACRO":
            st.set("A", ("arg", 0))
        else:
            for i in range(min(self.nargs, 5)):
                st.set(ARGREGS[i], ("arg", i))
        return self.run(self.start, st, frozenset())


# ---------------------------------------------------------------------------
# Rendering.

class Text:
    """Pre-rendered text inside an S-expression."""
    def __init__(self, s):
        self.s = s


def fmt(x):
    if isinstance(x, Text):
        return x.s
    if isinstance(x, list):
        if len(x) == 2 and x[0] == fasl.Sym("QUOTE") and not isinstance(x[1], Text):
            return "'" + fmt(x[1])
        return "(" + " ".join(fmt(i) for i in x) + ")"
    return fasl.fmt(x)


def pretty(x, indent=0, width=96):
    flat = fmt(x)
    if indent + len(flat) <= width or not isinstance(x, list) or not x:
        return flat
    head = fmt(x[0])
    if isinstance(x[0], fasl.Sym) and len(x) > 1:
        first = "(" + head + " " + pretty(x[1], indent + len(head) + 2, width)
        rest = x[2:]
        sub = indent + 2
    else:
        first = "(" + pretty(x[0], indent + 1, width)
        rest = x[1:]
        sub = indent + 1
    return "\n".join([first] + [" " * sub + pretty(e, sub, width) for e in rest]) + ")"


def cr_chain(e):
    ops = []
    while e[0] in ("car", "cdr") and len(ops) < 4:
        ops.append("A" if e[0] == "car" else "D")
        e = e[1]
    return ops, e


def calls_in(e, acc):
    if isinstance(e, tuple):
        if e[0] in ("call", "fcall"):
            acc.add(id(e))
        for x in e[1:]:
            if isinstance(x, (tuple, list)):
                calls_in(x, acc)
    elif isinstance(e, list):
        for x in e:
            calls_in(x, acc)


def count_calls(e, cnt):
    if isinstance(e, tuple):
        if e[0] in ("call", "fcall"):
            cnt[id(e)] = cnt.get(id(e), 0) + 1
            if cnt[id(e)] > 1:
                return          # do not count the inside of a repeated call twice
        for x in e[1:]:
            if isinstance(x, (tuple, list)):
                count_calls(x, cnt)
    elif isinstance(e, list):
        for x in e:
            count_calls(x, cnt)


class Renderer:
    def __init__(self, nm, argnames):
        self.nm = nm
        self.argnames = argnames
        self.temps = {}          # id(call) -> variable name
        self.bound = set()       # ids whose SETQ was already rendered on the current path

    def plan_temps(self, tree):
        """Calls used more than once on one path get a variable."""
        def walk(t, path_cnt):
            if t[0] == "return":
                cnt = dict(path_cnt)
                for s in t[1].stmts:
                    if s[0] in ("setq", "bind"):
                        count_calls(s[2], cnt)
                    elif s[0] == "do":
                        count_calls(s[1], cnt)
                count_calls(t[2], cnt)
                for k, v in cnt.items():
                    if v > 1 and k not in self.temps:
                        self.temps[k] = "V%d" % (len(self.temps) + 1)
            elif t[0] == "if":
                cnt = dict(path_cnt)
                count_calls(t[1], cnt)
                walk(t[2], cnt)
                walk(t[3], cnt)
        walk(tree, {})

    def expr(self, e):
        t = e[0]
        if t == "arg":
            return fasl.Sym(self.argnames[e[1]] if e[1] < len(self.argnames) else "ARG%d" % (e[1] + 1))
        if t == "argname":
            return fasl.Sym(e[1])
        if t == "nil":
            return fasl.Sym("NIL")
        if t == "sym":
            return [fasl.Sym("QUOTE"), fasl.Sym(e[1])]
        if t == "num":
            return fasl.Num("fixnum", e[1], [])
        if t == "flo":
            return fasl.Num("flonum", fasl.pdp10_float(e[1]), [e[1]])
        if t == "const":
            return Text("'" + self.nm.sexp(e[1], [400]))
        if t in ("car", "cdr"):
            ops, base = cr_chain(e)
            return [fasl.Sym("C" + "".join(ops) + "R"), self.expr(base)]
        if t == "cons":
            items, tail = self.cons_items(e)
            if tail[0] == "nil":
                return [fasl.Sym("LIST")] + [self.expr(i) for i in items]
            if len(items) == 1:
                return [fasl.Sym("CONS"), self.expr(items[0]), self.expr(tail)]
            return [fasl.Sym("LIST*")] + [self.expr(i) for i in items] + [self.expr(tail)]
        if t == "call":
            form = [fasl.Sym(e[1])] + [self.value(a) for a in e[2]]
            k = id(e)
            if k in self.temps:
                if k in self.bound:
                    return fasl.Sym(self.temps[k])
                self.bound.add(k)
                return [fasl.Sym("SETQ"), fasl.Sym(self.temps[k]), form]
            return form
        if t == "fcall":
            arg = e[2]
            if arg[0] == "const":
                inner = self.nm.sexp(arg[1], [400])
                if inner.startswith("(") and inner.endswith(")"):
                    return Text("(%s %s)" % (fasl.fmt_sym(e[1]), inner[1:-1]))
            return Text("(APPLY '%s %s)" % (fasl.fmt_sym(e[1]), fmt(self.value(arg))))
        if t == "special":
            return fasl.Sym(e[1])
        if t == "num-of":
            return self.expr(e[1])
        if t == "cmp":
            if e[3] == 0 and e[1] in ("<", ">="):
                f = [fasl.Sym("MINUSP"), self.expr(e[2])]
                return f if e[1] == "<" else [fasl.Sym("NOT"), f]
            if e[3] == 0 and e[1] in (">", "<="):
                f = [fasl.Sym("PLUSP"), self.expr(e[2])]
                return f if e[1] == ">" else [fasl.Sym("NOT"), f]
            fn = {"<": "LESSP", ">": "GREATERP", "<=": "NOT-GREATERP", ">=": "NOT-LESSP"}[e[1]]
            return [fasl.Sym(fn), self.expr(e[2]), fasl.Num("fixnum", e[3], [])]
        if t == "cmp2":
            fn = {"<": "LESSP", ">": "GREATERP", "<=": "NOT-GREATERP", ">=": "NOT-LESSP"}[e[1]]
            if fn.startswith("NOT-"):
                return [fasl.Sym("NOT"), [fasl.Sym({"NOT-GREATERP": "GREATERP", "NOT-LESSP": "LESSP"}[fn]),
                                          self.expr(e[2]), self.expr(e[3])]]
            return [fasl.Sym(fn), self.expr(e[2]), self.expr(e[3])]
        if t == "segof":
            return self.expr(e[1])
        if t == "unbox":
            return self.expr(e[1])
        if t == "stword":
            return [fasl.Sym("TYPEP"), self.expr(e[1])]
        if t == "typetest":
            mask, obj = e[1], self.expr(e[2])
            names = {0o100000: "FIXP", 0o40000: "FLOATP", 0o160000: "NUMBERP", 0o140000: "NUMBERP",
                     0o10000: "SYMBOLP", 0o400000: "PAIRP", 0o4000: "ARRAYP", 0o20000: "BIGP"}
            if mask in names:
                return [fasl.Sym(names[mask]), obj]
            return Text("(TYPE-BITS-TEST %s #o%o)" % (fmt(obj), mask))
        if t == "rawlh":
            v = e[1] << 18
            return fasl.Num("flonum", fasl.pdp10_float(v), [v])
        return Text("#<%s>" % " ".join(str(x) for x in e[1:]))

    def cons_items(self, e):
        items = []
        while e[0] == "cons":
            items.append(e[1])
            e = e[2]
        return items, e

    def has_quoted(self, e):
        if e[0] in ("sym", "const"):
            return True
        if e[0] == "cons":
            return self.has_quoted(e[1]) or self.has_quoted(e[2])
        return False

    def template(self, e):
        """Backquote rendering of a list-building expression."""
        t = e[0]
        if t == "sym":
            return fasl.fmt_sym(e[1])
        if t == "nil":
            return "NIL"
        if t in ("num", "flo"):
            return fmt(self.expr(e))          # numbers evaluate to themselves
        if t == "const":
            return self.nm.sexp(e[1], [400])
        if t == "cons":
            items, tail = self.cons_items(e)
            if len(items) == 2 and items[0][:2] == ("sym", "QUOTE") and tail[0] == "nil":
                return "'" + self.template(items[1])
            parts = [self.template(i) for i in items]
            if tail[0] == "nil":
                return "(" + " ".join(parts) + ")"
            if tail[0] == "const":
                inner = self.nm.sexp(tail[1], [400])
                if inner.startswith("(") and inner.endswith(")"):
                    return "(" + " ".join(parts + [inner[1:-1]]) + ")"
                return "(" + " ".join(parts) + " . " + inner + ")"
            if tail[0] in ("sym", "cons"):
                return "(" + " ".join(parts) + " . " + self.template(tail) + ")"
            return "(" + " ".join(parts) + " . ," + fmt(self.expr(tail)) + ")"
        return "," + fmt(self.expr(e))

    def value(self, e):
        if e[0] == "cons" and self.has_quoted(e):
            return Text("`" + self.template(e))
        return self.expr(e)

    def stmts(self, st, final, consumed=frozenset()):
        used = set(consumed)
        for s in st.stmts:
            if s[0] in ("setq", "bind"):
                calls_in(s[2], used)
            elif s[0] == "do":
                calls_in(s[1], used)
                if s[1][0] == "call":
                    for a in s[1][2]:
                        calls_in(a, used)
        if final is not None:
            calls_in(final, used)
            used.discard(id(final))
        out = []
        for s in st.stmts:
            if s[0] == "callpos":
                if id(s[1]) not in used and s[1] is not final:
                    out.append(self.value(s[1]))
            elif s[0] == "setq":
                out.append([fasl.Sym("SETQ"), fasl.Sym(s[1]), self.value(s[2])])
            elif s[0] == "do":
                out.append(self.value(s[1]))
            elif s[0] == "bind":
                out.append(Text(";; binds special %s to %s" % (s[1], fmt(self.value(s[2])))))
        return out

    def body(self, tree, consumed=frozenset()):
        if tree[0] == "return":
            st, val = tree[1], tree[2]
            forms = self.stmts(st, val, consumed)
            if not (val[0] == "unknown" and str(val[1]).startswith("value of")):
                forms.append(self.value(val))
            return forms
        if tree[0] == "if":
            test, a, b = tree[1], tree[2], tree[3]
            inner = set(consumed)
            calls_in(test, inner)
            test_form = self.value(test)
            saved = set(self.bound)
            ta = self.body(a, frozenset(inner))
            self.bound = set(saved)
            tb = self.body(b, frozenset(inner))
            self.bound = saved
            clause1 = [test_form] + ta
            if len(tb) == 1 and isinstance(tb[0], list) and tb[0] and tb[0][0] == fasl.Sym("COND"):
                return [[fasl.Sym("COND"), clause1] + tb[0][1:]]
            return [[fasl.Sym("COND"), clause1, [fasl.Sym("T")] + tb]]
        if False:
            ta, tb = None, None
        return [Text(";; ?")]


# ---------------------------------------------------------------------------
# DEFMACRO (DEFMAX) recognition.

def strip_defmax(tree):
    """If tree has DEFMAX's shape, return (expansion value, statements state, (min, max))."""
    if tree[0] != "if":
        return None
    test, a, b = tree[1], tree[2], tree[3]
    if not (test[0] == "call" and test[1] == "MACROFETCH"):
        return None
    rest = b
    nmin = nmax = None
    if rest[0] == "if":
        t2 = rest[1]
        if t2[0] == "call" and t2[1] == "=" and t2[2][1][0] == "num":
            nmin = nmax = t2[2][1][1]
            rest = rest[2]
        elif t2[0] == "cmp" and t2[1] == "<":
            nmin, rest = t2[3], rest[3]        # CAIL TT,n: too short -> error branch
        elif t2[0] == "cmp" and t2[1] == ">":
            nmax, rest = t2[3], rest[3]
        else:
            return None
        if rest[0] == "if" and rest[1][0] == "cmp":      # min and max both checked
            t3 = rest[1]
            if t3[1] == ">":
                nmax, rest = t3[3], rest[3]
            elif t3[1] == "<":
                nmin, rest = t3[3], rest[3]
    if rest[0] != "return":
        return None
    val = rest[2]
    if val[0] == "call" and val[1] == "MACROMEMO" and len(val[2]) == 3:
        return val[2][1], rest[1], (nmin, nmax)
    # Some expanders end in a tail call that computes (and memoizes) the expansion.
    return val, rest[1], (nmin, nmax)


def arg_paths(e, acc):
    if not isinstance(e, tuple):
        return
    if e[0] in ("car", "cdr"):
        ops, base = cr_chain(e)
        if base == ("arg", 0):
            acc.add("".join(ops))
            return
        arg_paths(base, acc)
        return
    for x in e[1:]:
        if isinstance(x, tuple):
            arg_paths(x, acc)
        elif isinstance(x, list):
            for y in x:
                arg_paths(y, acc)


def rename_args(e, mapping):
    if not isinstance(e, tuple):
        return e
    if e[0] in ("car", "cdr"):
        ops, base = cr_chain(e)
        if base == ("arg", 0):
            path = "".join(ops)
            for k in range(len(path)):
                if path[k:] in mapping:
                    v = ("argname", mapping[path[k:]])
                    for ch in reversed(path[:k]):
                        v = ("car", v) if ch == "A" else ("cdr", v)
                    return v
            return e
        inner = rename_args(base, mapping)
        for ch in reversed(ops):
            inner = ("car", inner) if ch == "A" else ("cdr", inner)
        return inner
    out = [e[0]]
    for x in e[1:]:
        if isinstance(x, tuple):
            out.append(rename_args(x, mapping))
        elif isinstance(x, list):
            out.append([rename_args(y, mapping) for y in x])
        else:
            out.append(x)
    return tuple(out)


def defmacro_args(val, nmin, nmax):
    """Argument list from the (C...R FORM) paths the expansion uses."""
    acc = set()
    arg_paths(val, acc)
    mapping, argv = {}, []
    path, k = "D", 1
    limit = (nmax - 1) if nmax else 9
    while k <= limit:
        a = "A" + path
        if any(p.endswith(a) for p in acc) or (nmin and k <= nmin - 1):
            mapping[a] = "ARG%d" % k
            argv.append("ARG%d" % k)
            k += 1
            path = "D" + path
            continue
        break
    if any(p.endswith(path) and not p.endswith("A" + path) for p in acc) or \
            any(p == path for p in acc):
        mapping[path] = "REST"
        argv += [".", "REST"] if argv else ["&REST", "REST"]
    return mapping, argv


def decompile(nm, start, name, kind="SUBR", args=0):
    """Report lines: a DECOMPILATION block, or the reason there is none."""
    if kind == "LSUBR":
        return ["  DECOMPILATION: not attempted (lsubr entry)"]
    if kind == "FSUBR":
        return ["  DECOMPILATION: not attempted (fsubr entry)"]
    nargs = 1 if kind == "MACRO" else ((args & 0o777) - 1 if args and not args >> 9 else 0)
    d = Decompiler(nm, start, name, kind, nargs)
    try:
        tree = d.decompile()
    except Fail as e:
        return ["  DECOMPILATION: not available (%s)" % e]
    except RecursionError:
        return ["  DECOMPILATION: not available (too deeply nested)"]
    lines = []
    if kind == "MACRO":
        dm = strip_defmax(tree)
        if dm:
            val, st, (nmin, nmax) = dm
            mapping, argv = defmacro_args(val, nmin, nmax)
            r = Renderer(nm, ["FORM"])
            renamed = rename_args(val, mapping)
            pre = []
            for s in st.stmts:
                if s[0] in ("setq", "do"):
                    pre.append(s)
            body = r.value(renamed)
            conf = "medium" if (d.inferred or pre) else "high"
            note = ""
            if nmin and nmax and nmin == nmax:
                note = "   ; exactly %d argument(s)" % (nmin - 1)
            elif nmin:
                note = "   ; at least %d argument(s)" % (nmin - 1)
            lines.append("  DECOMPILATION (reconstructed from machine code; confidence %s):" % conf)
            text = "(DEFMACRO %s (%s)%s\n  %s)" % (fasl.fmt_sym(name), " ".join(argv), note, pretty(body, 2))
            lines.extend("  | " + ln for ln in text.split("\n"))
            return lines
    r = Renderer(nm, ["FORM"] if kind == "MACRO" else ["ARG%d" % (i + 1) for i in range(nargs)])
    r.plan_temps(tree)
    forms = r.body(tree)
    if r.temps:
        forms = [[fasl.Sym("LET"), [fasl.Sym(v) for v in sorted(set(r.temps.values()), key=lambda x: int(x[1:]))]] + forms]
    conf = "high" if not d.branched and not d.inferred else "medium"
    if kind == "MACRO":
        head = "(DEFUN %s MACRO (FORM)" % fasl.fmt_sym(name)
    else:
        head = "(DEFUN %s (%s)" % (fasl.fmt_sym(name), " ".join("ARG%d" % (i + 1) for i in range(nargs)))
    lines.append("  DECOMPILATION (reconstructed from machine code; confidence %s):" % conf)
    text = head + "\n" + "\n".join("  " + pretty(f, 2) for f in forms) + ")"
    lines.extend("  | " + ln for ln in text.split("\n"))
    return lines
