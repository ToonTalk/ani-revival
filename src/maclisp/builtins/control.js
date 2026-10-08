// Function calling, mapping, errors, lexpr argument access, and macro helpers.
import { Sym, Cons, LispError } from "../types.js";

export function install(L) {
  const { NIL, T } = L;
  const d = (name, fn) => L.defsubr(name, fn);

  d("EVAL", (x) => L.eval(x));
  d("APPLY", (f, args) => L.apply(f, L.toArray(args)));
  d("FUNCALL", (f, ...args) => L.apply(f, args));
  d("LEXPR-FUNCALL", (f, ...args) => {
    const last = args.pop();
    return L.apply(f, [...args, ...L.toArray(last)]);
  });
  d("PROG1", (a) => a);
  d("PROG2", (a, b) => b);

  // MacLisp's mapping functions take any number of lists and stop at the shortest.
  function lists(ls) {
    return ls.map((l) => l);
  }
  function step(ls) {
    for (let i = 0; i < ls.length; i++) ls[i] = ls[i].cdr;
  }
  const allCons = (ls) => ls.every((l) => l instanceof Cons);
  d("MAPC", (f, ...ls) => {
    const first = ls[0];
    const cur = lists(ls);
    while (allCons(cur)) {
      L.apply(f, cur.map((l) => l.car));
      step(cur);
    }
    return first;
  });
  d("MAPCAR", (f, ...ls) => {
    const cur = lists(ls);
    const out = [];
    while (allCons(cur)) {
      out.push(L.apply(f, cur.map((l) => l.car)));
      step(cur);
    }
    return L.fromArray(out);
  });
  d("MAPCAN", (f, ...ls) => {
    const cur = lists(ls);
    const out = [];
    while (allCons(cur)) {
      out.push(L.apply(f, cur.map((l) => l.car)));
      step(cur);
    }
    return L.nconc(...out);
  });
  d("MAP", (f, ...ls) => {
    const first = ls[0];
    const cur = lists(ls);
    while (allCons(cur)) {
      L.apply(f, [...cur]);
      step(cur);
    }
    return first;
  });
  d("MAPLIST", (f, ...ls) => {
    const cur = lists(ls);
    const out = [];
    while (allCons(cur)) {
      out.push(L.apply(f, [...cur]));
      step(cur);
    }
    return L.fromArray(out);
  });
  d("MAPCON", (f, ...ls) => {
    const cur = lists(ls);
    const out = [];
    while (allCons(cur)) {
      out.push(L.apply(f, [...cur]));
      step(cur);
    }
    return L.nconc(...out);
  });

  d("ERROR", (msg = NIL, datum, type) => {
    const text = msg === NIL ? "error" : L.print(msg, false);
    throw new LispError(datum === undefined ? text : `${text} ${L.print(datum)}`, datum);
  });

  // (arg i) in a lexpr; (arg nil) gives the number of arguments.
  function frame() {
    const f = L.lexprFrames[L.lexprFrames.length - 1];
    if (!f) throw new LispError("arg: not inside a lexpr", NIL);
    return f;
  }
  d("ARG", (i) => {
    const f = frame();
    if (i === NIL) return f.length;
    if (i < 1 || i > f.length) throw new LispError(`arg ${i} out of range (${f.length} args)`, i);
    return f[i - 1];
  });
  d("SETARG", (i, v) => {
    frame()[i - 1] = v;
    return v;
  });
  d("LISTIFY", (n) => {
    const f = frame();
    return L.fromArray(n >= 0 ? f.slice(0, n) : f.slice(f.length + n));
  });

  // (displace old new): replace a macro call with its expansion, in place.
  d("DISPLACE", (old, nu) => {
    if (!(old instanceof Cons)) return nu;
    if (nu instanceof Cons) {
      old.car = nu.car;
      old.cdr = nu.cdr;
    } else {
      old.car = L.S.PROGN;
      old.cdr = new Cons(nu, NIL);
    }
    return old;
  });

  d("MACROEXPAND-1", (form) => {
    if (form instanceof Cons && form.car instanceof Sym) {
      const cell = L.fcell(form.car);
      if (cell && cell.kind === L.S.MACRO) return L.macroexpand1(cell.def, form);
    }
    return form;
  });
}
