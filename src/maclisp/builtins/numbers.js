// Arithmetic. MacLisp separates fixnums (JS numbers here) from flonums
// (Flonum objects). The generic functions (PLUS, TIMES, ...) return a flonum
// when any argument is one; the $ functions work on flonums.
import { Flonum, LispError } from "../types.js";

export function install(L) {
  const { NIL, T } = L;
  const d = (name, fn) => L.defsubr(name, fn);
  const tv = (b) => (b ? T : NIL);

  const isNum = (x) => typeof x === "number" || x instanceof Flonum;
  function val(x) {
    if (typeof x === "number") return x;
    if (x instanceof Flonum) return x.value;
    throw new LispError(`not a number: ${L.print(x)}`, x);
  }
  const anyFlo = (xs) => xs.some((x) => x instanceof Flonum);
  const fix = (n) => (Number.isFinite(n) ? Math.trunc(n) : n);
  const mk = (v, flo) => (flo ? new Flonum(v) : fix(v));
  L.num = { isNum, val, mk };

  function generic(op, identity) {
    return (...xs) => {
      if (xs.length === 0) return identity;
      const flo = anyFlo(xs);
      let r = val(xs[0]);
      for (let i = 1; i < xs.length; i++) r = op(r, val(xs[i]), flo);
      return mk(r, flo);
    };
  }
  const add = generic((a, b) => a + b, 0);
  const mul = generic((a, b) => a * b, 1);
  function sub(...xs) {
    if (xs.length === 1) return mk(-val(xs[0]), anyFlo(xs));
    return generic((a, b) => a - b, 0)(...xs);
  }
  function div(...xs) {
    if (xs.length === 1) xs = [xs[0] instanceof Flonum ? new Flonum(1) : 1, xs[0]];
    const flo = anyFlo(xs);
    let r = val(xs[0]);
    for (let i = 1; i < xs.length; i++) {
      const b = val(xs[i]);
      if (!flo && b === 0) throw new LispError("division by zero", xs[i]);
      r = flo ? r / b : Math.trunc(r / b);
    }
    return mk(r, flo);
  }
  for (const n of ["PLUS", "+"]) d(n, add);
  for (const n of ["TIMES", "*"]) d(n, mul);
  for (const n of ["DIFFERENCE", "-"]) d(n, sub);
  for (const n of ["QUOTIENT", "/"]) d(n, div);

  const flo = (f) => (...xs) => new Flonum(f(...xs.map(val)));
  d("+$", flo((...v) => v.reduce((a, b) => a + b, 0)));
  d("*$", flo((...v) => v.reduce((a, b) => a * b, 1)));
  d("-$", flo((...v) => (v.length === 1 ? -v[0] : v.slice(1).reduce((a, b) => a - b, v[0]))));
  d("/$", flo((...v) => (v.length === 1 ? 1 / v[0] : v.slice(1).reduce((a, b) => a / b, v[0]))));
  d("1+$", flo((a) => a + 1));
  d("1-$", flo((a) => a - 1));

  d("ADD1", (x) => mk(val(x) + 1, x instanceof Flonum));
  d("SUB1", (x) => mk(val(x) - 1, x instanceof Flonum));
  d("1+", (x) => mk(val(x) + 1, x instanceof Flonum));
  d("1-", (x) => mk(val(x) - 1, x instanceof Flonum));
  d("MINUS", (x) => mk(-val(x), x instanceof Flonum));
  d("ABS", (x) => mk(Math.abs(val(x)), x instanceof Flonum));
  d("REMAINDER", (a, b) => mk(val(a) % val(b), a instanceof Flonum || b instanceof Flonum));
  d("\\", (a, b) => val(a) % val(b));
  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a;
  }
  d("GCD", (a, b) => gcd(val(a), val(b)));
  d("\\\\", (a, b) => gcd(val(a), val(b)));

  function compareChain(test) {
    return (...xs) => {
      for (let i = 0; i + 1 < xs.length; i++) if (!test(val(xs[i]), val(xs[i + 1]))) return NIL;
      return T;
    };
  }
  d("GREATERP", compareChain((a, b) => a > b));
  d("LESSP", compareChain((a, b) => a < b));
  d(">", compareChain((a, b) => a > b));
  d("<", compareChain((a, b) => a < b));
  d("=", compareChain((a, b) => a === b));
  d("MAX", (...xs) => {
    const f = anyFlo(xs);
    return mk(Math.max(...xs.map(val)), f);
  });
  d("MIN", (...xs) => {
    const f = anyFlo(xs);
    return mk(Math.min(...xs.map(val)), f);
  });
  d("ZEROP", (x) => tv(val(x) === 0));
  d("PLUSP", (x) => tv(val(x) > 0));
  d("MINUSP", (x) => tv(val(x) < 0));
  d("ODDP", (x) => tv(Math.abs(val(x)) % 2 === 1));
  d("EVENP", (x) => tv(val(x) % 2 === 0));

  d("FLOAT", (x) => new Flonum(val(x)));
  d("FIX", (x) => Math.floor(val(x)));
  d("IFIX", (x) => Math.floor(val(x)));
  d("SQRT", flo(Math.sqrt));
  d("SIN", flo(Math.sin));
  d("COS", flo(Math.cos));
  d("ATAN", (y, x = 1) => {
    let a = Math.atan2(val(y), val(x));
    if (a < 0) a += 2 * Math.PI;
    return new Flonum(a);
  });
  d("LOG", flo(Math.log));
  d("EXP", flo(Math.exp));
  d("EXPT", (a, b) => mk(Math.pow(val(a), val(b)), a instanceof Flonum || b instanceof Flonum));
  d("^", (a, b) => mk(Math.pow(val(a), val(b)), false));
  d("^$", (a, b) => new Flonum(Math.pow(val(a), val(b))));

  // A seeded generator, so runs are reproducible.
  let seed = 1979;
  L.random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed;
  };
  d("RANDOM", (n) => {
    const r = L.random();
    return typeof n === "number" && n > 0 ? r % n : r;
  });

  d("LSH", (n, k) => (k >= 0 ? n << k : n >>> -k));
  d("ASH", (n, k) => (k >= 0 ? n * 2 ** k : Math.floor(n / 2 ** -k)));
  d("ROT", (n, k) => ((n << k) | (n >>> (32 - k))) | 0);
  d("LOGAND", (...xs) => xs.reduce((a, b) => a & b, -1));
  d("LOGIOR", (...xs) => xs.reduce((a, b) => a | b, 0));
  d("LOGXOR", (...xs) => xs.reduce((a, b) => a ^ b, 0));
  d("BOOLE", (op, ...xs) => {
    const f = [
      () => 0, (a, b) => a & b, (a, b) => ~a & b, (a, b) => b, (a, b) => a & ~b, (a) => a, (a, b) => a ^ b, (a, b) => a | b,
      (a, b) => ~(a | b), (a, b) => ~(a ^ b), (a) => ~a, (a, b) => ~a | b, (a, b) => ~b, (a, b) => a | ~b, (a, b) => ~(a & b), () => -1,
    ][op];
    return xs.reduce((a, b) => f(a, b));
  });
  d("HAULONG", (n) => (n === 0 ? 0 : Math.floor(Math.log2(Math.abs(n))) + 1));
}
