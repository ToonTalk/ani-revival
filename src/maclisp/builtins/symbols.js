// Symbols, property lists, values and character-level operations.
import { Sym, Cons, Flonum, UNBOUND, LispError } from "../types.js";
import { makeReader, EOF } from "../reader.js";

export function install(L) {
  const { NIL, T } = L;
  const d = (name, fn) => L.defsubr(name, fn);
  const tv = (b) => (b ? T : NIL);

  d("GET", (s, ind) => L.get(s, ind));
  d("PUTPROP", (s, v, ind) => L.putprop(s, v, ind));
  d("REMPROP", (s, ind) => L.remprop(s, ind));
  d("PLIST", (s) => L.plistOf(s));
  d("SETPLIST", (s, p) => {
    L.setPlistOf(s, p);
    return p;
  });
  d("GETL", (s, inds) => {
    const want = L.toArray(inds);
    for (let p = L.plistOf(s); p instanceof Cons && p.cdr instanceof Cons; p = p.cdr.cdr) {
      if (want.includes(p.car)) return p;
    }
    return NIL;
  });

  d("SET", (s, v) => L.setq(s, v));
  d("SYMEVAL", (s) => {
    if (s.value === UNBOUND) throw new LispError(`${s.name} unbound variable`, s);
    return s.value;
  });
  d("BOUNDP", (s) => tv(s instanceof Sym && s.value !== UNBOUND));
  d("MAKUNBOUND", (s) => {
    s.value = UNBOUND;
    return s;
  });

  d("INTERN", (s) => {
    const found = L.obarray.find(s.name);
    if (found) return found;
    L.obarray.table.set(s.name, s);
    s.interned = true;
    return s;
  });
  d("REMOB", (s) => {
    if (L.obarray.table.get(s.name) === s) L.obarray.table.delete(s.name);
    s.interned = false;
    return NIL;
  });
  let gensymCounter = 0;
  let gensymPrefix = "G";
  d("GENSYM", (x) => {
    if (typeof x === "number") gensymCounter = x;
    else if (x instanceof Sym) gensymPrefix = x.name[0];
    gensymCounter++;
    return new Sym(gensymPrefix + String(gensymCounter).padStart(4, "0"), false);
  });
  d("COPYSYMBOL", (s, copyProps) => {
    const n = new Sym(s.name, false);
    if (copyProps && copyProps !== NIL) {
      n.value = s.value;
      n.plist = L.copyList(L.plistOf(s));
    }
    return n;
  });

  // Character lists: MacLisp works with lists of single-character symbols (or codes).
  const charOf = (x) => (typeof x === "number" ? String.fromCharCode(x) : x instanceof Sym ? x.name : L.print(x, false));
  const textOfChars = (l) => L.toArray(l).map(charOf).join("");
  const charSym = (c) => L.intern(c);
  L.textOfChars = textOfChars;

  d("MAKNAM", (l) => new Sym(textOfChars(l), false));
  d("IMPLODE", (l) => L.intern(textOfChars(l)));
  d("EXPLODE", (x) => L.fromArray([...L.print(x, true)].map(charSym)));
  d("EXPLODEC", (x) => L.fromArray([...L.print(x, false)].map(charSym)));
  d("EXPLODEN", (x) => L.fromArray([...L.print(x, false)].map((c) => c.charCodeAt(0))));
  d("FLATSIZE", (x) => L.print(x, true).length);
  d("FLATC", (x) => L.print(x, false).length);
  d("GETCHAR", (s, n) => {
    const t = L.print(s, false);
    return n >= 1 && n <= t.length ? charSym(t[n - 1]) : NIL;
  });
  d("GETCHARN", (s, n) => {
    const t = L.print(s, false);
    return n >= 1 && n <= t.length ? t.charCodeAt(n - 1) : 0;
  });
  d("ASCII", (n) => charSym(String.fromCharCode(n)));
  d("READLIST", (l) => {
    const text = textOfChars(l);
    const form = L.reader("readlist").open(text).next();
    if (form === EOF) throw new LispError("readlist: nothing to read", l);
    return form;
  });
  d("ALPHALESSP", (a, b) => tv(L.print(a, false) < L.print(b, false)));
  d("SAMEPNAMEP", (a, b) => tv(L.print(a, false) === L.print(b, false)));

  const addresses = new WeakMap();
  const objects = new Map();
  let nextAddress = 0o100000;
  d("MAKNUM", (x) => {
    if (typeof x === "number") return x;
    if (!addresses.has(x)) {
      addresses.set(x, nextAddress);
      objects.set(nextAddress, x);
      nextAddress += 1;
    }
    return addresses.get(x);
  });
  d("MUNKAM", (n) => objects.get(n) ?? NIL);
  d("SXHASH", (x) => {
    const t = L.print(x, true);
    let h = 0;
    for (const c of t) h = (h * 31 + c.charCodeAt(0)) | 0;
    return h;
  });
}
