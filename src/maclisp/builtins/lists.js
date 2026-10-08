// List and predicate primitives.
import { Sym, Cons, Flonum, LispError } from "../types.js";

export function install(L) {
  const { NIL, T } = L;
  const d = (name, fn) => L.defsubr(name, fn);
  const tv = (b) => (b ? T : NIL);

  function car(x) {
    if (x instanceof Cons) return x.car;
    if (x === NIL) return NIL;
    throw new LispError(`car of non-list: ${L.print(x)}`, x);
  }
  function cdr(x) {
    if (x instanceof Cons) return x.cdr;
    if (x === NIL) return NIL;
    throw new LispError(`cdr of non-list: ${L.print(x)}`, x);
  }
  L.car = car;
  L.cdr = cdr;

  d("CAR", car);
  d("CDR", cdr);
  // CAAR ... CDDDDR
  for (let n = 2; n <= 4; n++) {
    const combos = [""];
    for (let i = 0; i < n; i++) combos.splice(0, combos.length, ...combos.flatMap((c) => [c + "A", c + "D"]));
    for (const c of combos) {
      const ops = c.split("").reverse();
      d(`C${c}R`, (x) => {
        for (const o of ops) x = o === "A" ? car(x) : cdr(x);
        return x;
      });
    }
  }

  d("CONS", (a, b) => new Cons(a, b));
  d("NCONS", (a) => new Cons(a, NIL));
  d("XCONS", (a, b) => new Cons(b, a));
  d("LIST", (...xs) => L.fromArray(xs));

  function copyList(l) {
    const items = [];
    while (l instanceof Cons) {
      items.push(l.car);
      l = l.cdr;
    }
    return L.fromArray(items, l);
  }
  L.copyList = copyList;

  function append(...ls) {
    if (ls.length === 0) return NIL;
    let result = ls[ls.length - 1];
    for (let i = ls.length - 2; i >= 0; i--) {
      const items = L.toArray(ls[i]);
      result = L.fromArray(items, result);
    }
    return result;
  }
  L.append = append;
  d("APPEND", append);

  function nconc(...ls) {
    let result = NIL;
    let last = null;
    for (const l of ls) {
      if (!(l instanceof Cons)) {
        if (last) last.cdr = l;
        else result = l;
        continue;
      }
      if (last) last.cdr = l;
      else result = l;
      last = l;
      while (last.cdr instanceof Cons) last = last.cdr;
    }
    return result;
  }
  L.nconc = nconc;
  d("NCONC", nconc);

  d("REVERSE", (l) => {
    let r = NIL;
    for (; l instanceof Cons; l = l.cdr) r = new Cons(l.car, r);
    return r;
  });
  function nreverse(l) {
    let r = NIL;
    while (l instanceof Cons) {
      const next = l.cdr;
      l.cdr = r;
      r = l;
      l = next;
    }
    return r;
  }
  d("NREVERSE", nreverse);
  d("NRECONC", (l, tail) => nconc(nreverse(l), tail));
  d("LENGTH", (l) => {
    let n = 0;
    for (; l instanceof Cons; l = l.cdr) n++;
    return n;
  });
  d("LAST", (l) => {
    if (!(l instanceof Cons)) return l;
    while (l.cdr instanceof Cons) l = l.cdr;
    return l;
  });
  d("NTHCDR", (n, l) => {
    for (let i = 0; i < n; i++) l = cdr(l);
    return l;
  });
  d("NTH", (n, l) => {
    for (let i = 0; i < n; i++) l = cdr(l);
    return car(l);
  });

  const eq = (a, b) => a === b;
  function equal(a, b) {
    for (;;) {
      if (a === b) return true;
      if (a instanceof Flonum && b instanceof Flonum) return a.value === b.value;
      if (a instanceof Cons && b instanceof Cons) {
        if (!equal(a.car, b.car)) return false;
        a = a.cdr;
        b = b.cdr;
        continue;
      }
      return false;
    }
  }
  L.equal = equal;
  d("EQ", (a, b) => tv(a === b));
  d("EQUAL", (a, b) => tv(equal(a, b)));

  function member(x, l, test) {
    for (; l instanceof Cons; l = l.cdr) if (test(x, l.car)) return l;
    return NIL;
  }
  d("MEMBER", (x, l) => member(x, l, equal));
  d("MEMQ", (x, l) => member(x, l, eq));
  function assoc(x, l, test) {
    for (; l instanceof Cons; l = l.cdr) if (l.car instanceof Cons && test(x, l.car.car)) return l.car;
    return NIL;
  }
  d("ASSOC", (x, l) => assoc(x, l, equal));
  d("ASSQ", (x, l) => assoc(x, l, eq));
  d("SASSOC", (x, l, f) => {
    const r = assoc(x, l, equal);
    return r !== NIL ? r : L.apply(f, []);
  });
  d("SASSQ", (x, l, f) => {
    const r = assoc(x, l, eq);
    return r !== NIL ? r : L.apply(f, []);
  });

  function del(x, l, test, n = Infinity) {
    while (l instanceof Cons && n > 0 && test(x, l.car)) {
      l = l.cdr;
      n--;
    }
    if (!(l instanceof Cons)) return l;
    let prev = l;
    while (prev.cdr instanceof Cons) {
      if (n > 0 && test(x, prev.cdr.car)) {
        prev.cdr = prev.cdr.cdr;
        n--;
      } else prev = prev.cdr;
    }
    return l;
  }
  d("DELETE", (x, l, n) => del(x, l, equal, typeof n === "number" ? n : Infinity));
  d("DELQ", (x, l, n) => del(x, l, eq, typeof n === "number" ? n : Infinity));
  d("REMOVE", (x, l) => L.fromArray(L.toArray(l).filter((e) => !equal(x, e))));
  d("REMQ", (x, l) => L.fromArray(L.toArray(l).filter((e) => e !== x)));

  d("RPLACA", (c, v) => {
    if (!(c instanceof Cons)) throw new LispError(`rplaca of non-cons: ${L.print(c)}`, c);
    c.car = v;
    return c;
  });
  d("RPLACD", (c, v) => {
    if (!(c instanceof Cons)) throw new LispError(`rplacd of non-cons: ${L.print(c)}`, c);
    c.cdr = v;
    return c;
  });

  function subst(n, o, x) {
    if (equal(x, o)) return n;
    if (x instanceof Cons) return new Cons(subst(n, o, x.car), subst(n, o, x.cdr));
    return x;
  }
  d("SUBST", subst);
  d("SUBLIS", (alist, x) => {
    const pairs = L.toArray(alist);
    function s(x) {
      if (x instanceof Sym) {
        const p = pairs.find((p) => p.car === x);
        return p ? p.cdr : x;
      }
      if (x instanceof Cons) {
        const a = s(x.car);
        const b = s(x.cdr);
        return a === x.car && b === x.cdr ? x : new Cons(a, b);
      }
      return x;
    }
    return s(x);
  });

  // MacLisp's SORT is destructive; for lists it is a merge sort. This one is a
  // stable merge sort that, like MacLisp's, asks (pred b a) to decide whether
  // an element from the right half goes before one from the left.
  function mergeSort(items, before) {
    if (items.length < 2) return items;
    const mid = items.length >> 1;
    const a = mergeSort(items.slice(0, mid), before);
    const b = mergeSort(items.slice(mid), before);
    const out = [];
    let i = 0;
    let j = 0;
    while (i < a.length && j < b.length) {
      if (before(b[j], a[i])) out.push(b[j++]);
      else out.push(a[i++]);
    }
    while (i < a.length) out.push(a[i++]);
    while (j < b.length) out.push(b[j++]);
    return out;
  }
  function sortList(l, pred, key) {
    const cells = [];
    for (let p = l; p instanceof Cons; p = p.cdr) cells.push(p);
    const sorted = mergeSort(cells, (x, y) => L.apply(pred, [key(x.car), key(y.car)]) !== NIL);
    for (let i = 0; i < sorted.length; i++) sorted[i].cdr = i + 1 < sorted.length ? sorted[i + 1] : NIL;
    return sorted.length ? sorted[0] : NIL;
  }
  d("SORT", (l, pred) => sortList(l, pred, (x) => x));
  d("SORTCAR", (l, pred) => sortList(l, pred, (x) => car(x)));

  d("ATOM", (x) => tv(!(x instanceof Cons)));
  d("NULL", (x) => tv(x === NIL));
  d("NOT", (x) => tv(x === NIL));
  d("SYMBOLP", (x) => tv(x instanceof Sym));
  d("NUMBERP", (x) => tv(typeof x === "number" || x instanceof Flonum));
  d("FIXP", (x) => tv(typeof x === "number"));
  d("FLOATP", (x) => tv(x instanceof Flonum));
  d("BIGP", () => NIL);
  d("HUNKP", () => NIL);
  d("STRINGP", () => NIL);
  d("LISTP", (x) => tv(x instanceof Cons || x === NIL));
}
