// Director's pattern matcher, KEN1;CMATCH's MATCH and MATCH-BINDINGS, built into
// the interpreter. Matching is most of what Director does (every message is
// tried against method patterns until one matches), and in 1979 it ran as
// compiled code; interpreted, it made pass 1 take minutes. This is the same
// algorithm as the Lisp it replaces, clause for clause; the rest of CMATCH is
// still Lisp (src/director/ken1/cmatch.lisp), and that file explains the patterns.
//
//   (match object pattern)          non-NIL if the object matches
//   (match-bindings pattern object) NIL, or (t (variable . value) ...)
//   (pattern-variable-value v pattern object)
import { Sym, Cons, Flonum } from "../maclisp/types.js";

export function installMatcher(L) {
  const { NIL, T } = L;
  const QUOTED = L.intern("DIRECTOR-SYMBOL-FOR-QUOTED-PATTERN");
  const OR = L.intern("DIRECTOR-SYMBOL-FOR-OR-PATTERN");
  const AND = L.intern("DIRECTOR-SYMBOL-FOR-AND-PATTERN");
  const BRACES = L.intern("DIRECTOR-SYMBOL-FOR-BRACES");
  const isNumber = (x) => typeof x === "number" || x instanceof Flonum;
  const cdr = (x) => (x instanceof Cons ? x.cdr : NIL);

  // pattern-variable? and variable-name: ?foo and %foo name FOO; ? and % name nothing.
  const isVariable = (p) => p instanceof Sym && (p.name[0] === "?" || p.name[0] === "%");
  const names = new WeakMap();
  function variableName(p) {
    if (p.name.length === 1) return null;
    let v = names.get(p);
    if (!v) names.set(p, (v = L.intern(p.name.slice(1))));
    return v;
  }

  // add-binding: a new binding, or the bindings if it agrees with an old one, else NIL.
  // Like the Lisp, given NIL it starts afresh.
  function addBinding(v, x, bindings) {
    if (v === null) return bindings;
    for (let p = cdr(bindings); p instanceof Cons; p = p.cdr) {
      if (p.car instanceof Cons && p.car.car === v) return L.equal(p.car.cdr, x) ? bindings : NIL;
    }
    return new Cons(T, new Cons(new Cons(v, x), cdr(bindings)));
  }

  // find-variables-in-pattern (last first) and devariablize-predicate, kept per expression.
  const variablesOf = new WeakMap();
  function findVariables(expr) {
    let vs = variablesOf.get(expr);
    if (vs) return vs;
    const found = [];
    (function walk(p) {
      if (isVariable(p)) {
        const v = variableName(p);
        if (v && !found.includes(v)) found.push(v);
      } else if (p instanceof Cons && p.car !== QUOTED) {
        walk(p.car);
        walk(p.cdr);
      }
    })(expr);
    vs = found.reverse();
    variablesOf.set(expr, vs);
    return vs;
  }
  const devariablized = new WeakMap();
  function devariablize(expr) {
    if (isVariable(expr)) return variableName(expr) ?? NIL;
    if (!(expr instanceof Cons)) return expr;
    let d = devariablized.get(expr);
    if (!d) devariablized.set(expr, (d = new Cons(devariablize(expr.car), devariablize(expr.cdr))));
    return d;
  }

  // {expr}: bind its variables to x and evaluate it; if true, record the bindings.
  function matchPredicate(expr, x, bindings) {
    const vars = findVariables(expr);
    const mark = L.specpdl.length;
    let ok;
    try {
      for (const v of vars) L.bind(v, x);
      ok = L.eval(devariablize(expr));
    } finally {
      L.unbindTo(mark);
    }
    if (ok === NIL) return NIL;
    let b = bindings;
    for (const v of vars) b = addBinding(v, x, b);
    return b;
  }

  function match1(p, x, bindings) {
    if (bindings === NIL) return NIL;
    if (p instanceof Cons && p.car === QUOTED) return L.equal(p.cdr.car, x) ? bindings : NIL;
    if (isVariable(p)) return addBinding(variableName(p), x, bindings);
    if (!(p instanceof Cons)) return p === x || (isNumber(p) && isNumber(x) && L.equal(p, x)) ? bindings : NIL;
    if (p.car === OR) {
      for (let a = p.cdr; a instanceof Cons; a = a.cdr) {
        const b = match1(a.car, x, bindings);
        if (b !== NIL) return b;
      }
      return NIL;
    }
    if (p.car === AND) {
      let b = bindings;
      for (let a = p.cdr; a instanceof Cons && b !== NIL; a = a.cdr) b = match1(a.car, x, b);
      return b;
    }
    if (p.car === BRACES) return matchPredicate(p.cdr, x, bindings);
    // a rest variable at this position takes the remaining list, even if empty
    if (isVariable(p.car) && p.car.name[0] === "%") return addBinding(variableName(p.car), x, bindings);
    if (!(x instanceof Cons)) return NIL;
    return match1(p.cdr, x.cdr, match1(p.car, x.car, bindings));
  }

  const matchBindings = (pattern, x) => match1(pattern, x, new Cons(T, NIL));

  // (method-applicable? method-name message), from KEN1;MACROS: funcall the method's
  // predicate, or match the message against its pattern. A predicate made by
  // test-part-of-pattern, (lambda (message) (match message (quote pattern))), is
  // matched here directly.
  const PREDICATE = L.intern("METHOD-PATTERN-PREDICATE");
  const PATTERN = L.intern("METHOD-PATTERN");
  const LAMBDA = L.intern("LAMBDA");
  const MATCH = L.intern("MATCH");
  const QUOTE = L.intern("QUOTE");
  const patternOfPredicate = new WeakMap();
  function standardPattern(pred) {
    if (patternOfPredicate.has(pred)) return patternOfPredicate.get(pred);
    let pattern = null;
    try {
      const [lam, params, body] = [pred.car, pred.cdr.car, pred.cdr.cdr];
      const call = body.car;
      if (lam === LAMBDA && params instanceof Cons && params.cdr === NIL && body.cdr === NIL &&
          call.car === MATCH && call.cdr.car === params.car && call.cdr.cdr.car.car === QUOTE && call.cdr.cdr.cdr === NIL) {
        pattern = call.cdr.cdr.car.cdr.car;
      }
    } catch (e) { pattern = null; }
    patternOfPredicate.set(pred, pattern);
    return pattern;
  }
  L.defsubr("METHOD-APPLICABLE?", (methodName, message) => {
    const pred = L.get(methodName, PREDICATE);
    if (pred === NIL) return matchBindings(L.get(methodName, PATTERN), message) === NIL ? NIL : T;
    const pattern = pred instanceof Cons ? standardPattern(pred) : null;
    if (pattern !== null) return matchBindings(pattern, message) === NIL ? NIL : T;
    return L.apply(pred, [message]);
  });
  L.defsubr("MATCH-BINDINGS", (pattern, x) => matchBindings(pattern, x));
  L.defsubr("MATCH", (object, pattern) => (matchBindings(pattern, object) === NIL ? NIL : T));
  L.defsubr("PATTERN-VARIABLE-VALUE", (v, pattern, message) => {
    for (let p = cdr(matchBindings(pattern, message)); p instanceof Cons; p = p.cdr) {
      if (p.car instanceof Cons && p.car.car === v) return p.car.cdr;
    }
    return NIL;
  });
}
