// The MacLisp interpreter core: evaluation, application, binding, special forms
// and loading. Built-in functions are installed from ./builtins/.
//
// Semantics follow the MacLisp interpreter on ITS (circa 1978):
//  - all variables are dynamically bound (shallow binding: a symbol's value cell
//    holds the current value; bindings are saved on a stack and restored on exit);
//  - functions live on property lists under EXPR, FEXPR, MACRO, SUBR, LSUBR,
//    FSUBR, ARRAY or AUTOLOAD, and the first such property found is used;
//  - a lambda whose parameter "list" is a symbol is a lexpr: the symbol is bound
//    to the number of arguments, which (ARG i) fetches;
//  - RETURN and GO work dynamically, from the innermost PROG or DO;
//  - CATCH and THROW take the old argument order (catch form tag) and
//    (throw value tag); *CATCH and *THROW take the new one.

import { Sym, Cons, Flonum, Subr, LArray, Obarray, LispError, UNBOUND } from "./types.js";
import { makeReader, EOF } from "./reader.js";
import { printString } from "./printer.js";

export class GoSignal {
  constructor(tag) {
    this.tag = tag;
  }
}
export class ReturnSignal {
  constructor(value) {
    this.value = value;
  }
}
export class ThrowSignal {
  constructor(tag, value) {
    this.tag = tag;
    this.value = value;
  }
}
export class ErrSignal {
  constructor(value) {
    this.value = value;
  }
}

export class Lisp {
  constructor({ fs = null, out = null, clock = null } = {}) {
    this.obarray = new Obarray();
    const NIL = this.intern("NIL");
    this.NIL = NIL;
    NIL.value = NIL;
    NIL.plist = NIL;
    const T = this.intern("T");
    this.T = T;
    T.value = T;
    this.fs = fs;
    this.ttyText = [];
    this.out = out || ((s) => this.ttyText.push(s));
    this.clock = clock || (() => performance.now() / 1000);
    this.startTime = this.clock();
    this.specpdl = [];
    this.lexprFrames = [];
    this.loadStack = [];
    this.warnings = [];
    this.breakHandler = (tag) => {
      this.out(`\n;bkpt ${printString(tag)}\n`);
      return NIL;
    };
    const s = (n) => this.intern(n);
    this.S = {
      LAMBDA: s("LAMBDA"), QUOTE: s("QUOTE"), FUNCTION: s("FUNCTION"),
      EXPR: s("EXPR"), FEXPR: s("FEXPR"), MACRO: s("MACRO"), SUBR: s("SUBR"),
      LSUBR: s("LSUBR"), FSUBR: s("FSUBR"), ARRAY: s("ARRAY"), AUTOLOAD: s("AUTOLOAD"),
      OPTIONAL: s("&OPTIONAL"), REST: s("&REST"), OTHERWISE: s("OTHERWISE"),
      IBASE: s("IBASE"), BASE: s("BASE"), NOPOINT: s("*NOPOINT"), PROGN: s("PROGN"),
    };
    this.fnIndicators = new Set([
      this.S.EXPR, this.S.FEXPR, this.S.MACRO, this.S.SUBR, this.S.LSUBR,
      this.S.FSUBR, this.S.ARRAY, this.S.AUTOLOAD,
    ]);
    this.S.IBASE.value = 10; // Ken's KEN COMPLR and LISP 7: "thats the way I like it"
    this.S.BASE.value = 10;
    this.S.NOPOINT.value = T;
    // MacLisp's hook variables: the handlers for autoloading and undefined functions
    this.S.AUTOLOAD_HANDLER = this.S.AUTOLOAD; // the variable AUTOLOAD
    this.S.DEFAULT_AUTOLOAD = s("+DEFAULT-AUTOLOAD");
    this.S.AUTOLOAD.value = this.S.DEFAULT_AUTOLOAD;
    this.S.UNDF_FNCTN = s("UNDF-FNCTN");
    this.S.DEFAULT_UNDF_FNCTN = s("+DEFAULT-UNDF-FNCTN");
    this.S.UNDF_FNCTN.value = this.S.DEFAULT_UNDF_FNCTN;
    // The variables CAR and CDR say how strictly CAR and CDR check their arguments.
    this.S.CARVAR = s("CAR");
    this.S.CDRVAR = s("CDR");
    this.S.CARVAR.value = NIL;
    this.S.CDRVAR.value = NIL;
    this.lenientCarCdr = 0; // how often a lenient CAR or CDR of an atom happened
    this.features = new Set();
    installSpecialForms(this);
  }

  // ------------------------------------------------------------ symbols

  intern(name) {
    return this.obarray.intern(name);
  }

  list(...items) {
    let r = this.NIL;
    for (let i = items.length - 1; i >= 0; i--) r = new Cons(items[i], r);
    return r;
  }

  fromArray(items, tail = this.NIL) {
    let r = tail;
    for (let i = items.length - 1; i >= 0; i--) r = new Cons(items[i], r);
    return r;
  }

  toArray(x) {
    const a = [];
    while (x instanceof Cons) {
      a.push(x.car);
      x = x.cdr;
    }
    return a;
  }

  truth(b) {
    return b ? this.T : this.NIL;
  }

  // Property lists. A list as the "symbol" is a disembodied property list whose
  // cdr holds the properties.
  plistOf(s) {
    if (s instanceof Sym) return s.plist || this.NIL;
    if (s instanceof Cons) return s.cdr;
    return this.NIL;
  }

  setPlistOf(s, plist) {
    if (s instanceof Sym) {
      s.plist = plist;
      s.fcellCache = undefined;
    }
    else if (s instanceof Cons) s.cdr = plist;
    else throw new LispError(`cannot hold properties: ${this.print(s)}`, s);
  }

  get(s, ind) {
    for (let p = this.plistOf(s); p instanceof Cons && p.cdr instanceof Cons; p = p.cdr.cdr) {
      if (p.car === ind) return p.cdr.car;
    }
    return this.NIL;
  }

  putprop(s, val, ind) {
    if (s instanceof Sym) s.fcellCache = undefined;
    for (let p = this.plistOf(s); p instanceof Cons && p.cdr instanceof Cons; p = p.cdr.cdr) {
      if (p.car === ind) {
        p.cdr.car = val;
        return val;
      }
    }
    this.setPlistOf(s, new Cons(ind, new Cons(val, this.plistOf(s))));
    return val;
  }

  remprop(s, ind) {
    if (s instanceof Sym) s.fcellCache = undefined;
    let prev = null;
    for (let p = this.plistOf(s); p instanceof Cons && p.cdr instanceof Cons; prev = p.cdr, p = p.cdr.cdr) {
      if (p.car === ind) {
        if (prev) prev.cdr = p.cdr.cdr;
        else this.setPlistOf(s, p.cdr.cdr);
        return p.cdr;
      }
    }
    return this.NIL;
  }

  // The first function property on the plist: { kind, def } or null. An AUTOLOAD
  // property counts only when there is no definition: tags files give functions
  // AUTOLOAD properties whether or not their files are already loaded.
  // The answer is kept on the symbol until its property list changes (PUTPROP,
  // REMPROP, SETPLIST), since a call looks it up every time.
  fcell(s) {
    if (s instanceof Sym && s.fcellCache !== undefined) return s.fcellCache;
    let autoload = null;
    let found = null;
    for (let p = this.plistOf(s); p instanceof Cons && p.cdr instanceof Cons; p = p.cdr.cdr) {
      if (this.fnIndicators.has(p.car)) {
        if (p.car === this.S.AUTOLOAD) {
          if (!autoload) autoload = { kind: p.car, def: p.cdr.car };
        } else {
          found = { kind: p.car, def: p.cdr.car };
          break;
        }
      }
    }
    found = found || autoload;
    if (s instanceof Sym) s.fcellCache = found;
    return found;
  }

  defsubr(name, fn, kind = "lsubr") {
    const s = this.intern(name);
    const ind = kind === "fsubr" ? this.S.FSUBR : kind === "subr" ? this.S.SUBR : this.S.LSUBR;
    this.putprop(s, new Subr(name, fn, kind), ind);
    return s;
  }

  setq(s, v) {
    if (!(s instanceof Sym)) throw new LispError(`not a symbol: ${this.print(s)}`, s);
    if (s === this.NIL || s === this.T) throw new LispError(`can't change the value of ${s.name}`, s);
    s.value = v;
    return v;
  }

  // ------------------------------------------------------------ binding

  bind(s, v) {
    if (!(s instanceof Sym)) throw new LispError(`can't bind a non-symbol: ${this.print(s)}`, s);
    this.specpdl.push(s, s.value);
    s.value = v;
  }

  unbindTo(mark) {
    const pdl = this.specpdl;
    while (pdl.length > mark) {
      const old = pdl.pop();
      pdl.pop().value = old;
    }
  }

  // Bind a variable or a destructuring pattern (as in MacLisp's LET).
  bindPattern(pat, v) {
    if (pat instanceof Sym) {
      if (pat !== this.NIL) this.bind(pat, v);
      return;
    }
    if (pat instanceof Cons) {
      this.bindPattern(pat.car, v instanceof Cons ? v.car : this.NIL);
      this.bindPattern(pat.cdr, v instanceof Cons ? v.cdr : this.NIL);
      return;
    }
    throw new LispError(`bad variable in binding: ${this.print(pat)}`, pat);
  }

  // ------------------------------------------------------------ evaluation

  eval(x) {
    if (x instanceof Sym) {
      const v = x.value;
      if (v === UNBOUND) throw new LispError(`${x.name} unbound variable`, x);
      return v;
    }
    if (!(x instanceof Cons)) return x;
    if (this.formStack) {
      // debugging: remember the forms being evaluated, for a backtrace
      this.formStack.push(x);
      try {
        return this.evalCons(x);
      } catch (e) {
        if (!e.lispBacktrace) e.lispBacktrace = this.formStack.slice(-(this.backtraceDepth || 60)).reverse();
        throw e;
      } finally {
        this.formStack.pop();
      }
    }
    return this.evalCons(x);
  }

  evalCons(x) {
    const f = x.car;
    if (f instanceof Sym) {
      let cell = this.fcell(f);
      if (cell === null || cell.kind === this.S.AUTOLOAD) cell = this.autoload(f, cell);
      const kind = cell.kind;
      if (kind === this.S.FSUBR) return cell.def.fn.call(this, x.cdr, x);
      if (kind === this.S.MACRO) return this.eval(this.expansionOf(cell.def, x));
      if (kind === this.S.FEXPR) return this.callFexpr(cell.def, x.cdr, f);
      return this.callCell(cell, this.evlis(x.cdr), f);
    }
    if (f instanceof Cons && f.car === this.S.LAMBDA) return this.applyLambda(f, this.evlis(x.cdr));
    return this.apply(this.eval(f), this.evlis(x.cdr));
  }

  evlis(args) {
    const a = [];
    for (let p = args; p instanceof Cons; p = p.cdr) a.push(this.eval(p.car));
    return a;
  }

  progn(body) {
    let v = this.NIL;
    for (let p = body; p instanceof Cons; p = p.cdr) v = this.eval(p.car);
    return v;
  }

  // An FEXPR receives its argument list unevaluated. Its definition may also be
  // another function's name: DRECT does (defprop director-symbol-for-value quote
  // fexpr), so (director-symbol-for-value x) behaves like (quote x).
  callFexpr(def, args, name) {
    if (def instanceof Sym) {
      const cell = this.fcell(def);
      if (cell && cell.kind === this.S.FSUBR) return cell.def.fn.call(this, args);
      if (cell && cell.kind === this.S.FEXPR) return this.callFexpr(cell.def, args, def);
      return this.apply(def, [args]);
    }
    return this.applyLambda(def, [args, this.NIL], name, true);
  }

  // A form's macro expansion is computed once and kept with the form, as MacLisp's
  // displacing macros did (in 1980 Director's DEFINE-MACRO made them so). It is
  // kept with the definition that made it, so redefining the macro (as
  // REVIVE;BRIDGE does to ASK) takes effect. macroCache = false turns this off.
  expansionOf(def, form) {
    if (this.macroCache === false) return this.macroexpand1(def, form);
    if (!this.macroCache) this.macroCache = new WeakMap();
    const kept = this.macroCache.get(form);
    if (kept && kept.def === def) return kept.expansion;
    const expansion = this.macroexpand1(def, form);
    this.macroCache.set(form, { def, expansion });
    return expansion;
  }

  macroexpand1(def, form) {
    if (def instanceof Subr) return def.fn.call(this, form);
    if (def instanceof Sym) return this.apply(def, [form]);
    return this.applyLambda(def, [form]);
  }

  // Calling a function that isn't defined. If it has an AUTOLOAD property, the
  // function named by the variable AUTOLOAD is called with (function . file)
  // (MacLisp's default just loads the file; DRECT installs its own handler).
  // Otherwise the function named by UNDF-FNCTN gets a chance to define it.
  autoload(f, cell) {
    if (cell && cell.kind === this.S.AUTOLOAD) {
      const spec = cell.def;
      const handler = this.S.AUTOLOAD_HANDLER.value;
      if (handler instanceof Sym && handler !== this.NIL && handler !== this.S.DEFAULT_AUTOLOAD) {
        this.apply(handler, [new Cons(f, spec)]);
      } else {
        this.load(spec);
      }
      const after = this.fcell(f);
      if (after && after.kind !== this.S.AUTOLOAD) return after;
      throw new LispError(`${f.name} undefined function (autoload from ${this.print(spec)} didn't define it)`, f);
    }
    const handler = this.S.UNDF_FNCTN.value;
    if (handler instanceof Sym && handler !== this.NIL && handler !== this.S.DEFAULT_UNDF_FNCTN && !this.inUndfHandler) {
      this.inUndfHandler = true;
      let result;
      try {
        result = this.apply(handler, [new Cons(f, this.NIL)]);
      } finally {
        this.inUndfHandler = false;
      }
      const after = this.fcell(f);
      if (result !== this.NIL && after && after.kind !== this.S.AUTOLOAD) return after;
    }
    throw new LispError(`${f.name} undefined function`, f);
  }

  callCell(cell, args, name) {
    const kind = cell.kind;
    const def = cell.def;
    // profiling: callCounts, if set, is a Map from a function's name to its calls
    if (this.callCounts && name) this.callCounts.set(name.name, (this.callCounts.get(name.name) || 0) + 1);
    if (kind === this.S.SUBR || kind === this.S.LSUBR) return def.fn.apply(this, args);
    if (kind === this.S.EXPR) {
      if (def instanceof Sym) return this.apply(def, args);
      if (def instanceof Subr) return def.fn.apply(this, args);
      return this.applyLambda(def, args, name);
    }
    if (kind === this.S.ARRAY) return this.arrayRef(def, args);
    throw new LispError(`can't call ${name ? name.name : this.print(def)} with ${kind.name}`, name);
  }

  apply(fn, args) {
    if (fn instanceof Sym) {
      let cell = this.fcell(fn);
      if (cell === null || cell.kind === this.S.AUTOLOAD) cell = this.autoload(fn, cell);
      if (cell.kind === this.S.FEXPR) return this.applyLambda(cell.def, [this.fromArray(args), this.NIL], fn, true);
      if (cell.kind === this.S.FSUBR) return cell.def.fn.call(this, this.fromArray(args.map((a) => this.list(this.S.QUOTE, a))));
      if (cell.kind === this.S.MACRO) throw new LispError(`can't apply the macro ${fn.name}`, fn);
      return this.callCell(cell, args, fn);
    }
    if (fn instanceof Cons && fn.car === this.S.LAMBDA) return this.applyLambda(fn, args);
    if (fn instanceof Subr) return fn.fn.apply(this, args);
    if (fn instanceof LArray) return this.arrayRef(fn, args);
    throw new LispError(`not a function: ${this.print(fn)}`, fn);
  }

  applyLambda(lam, args, name = null, fexpr = false) {
    if (!(lam instanceof Cons) || lam.car !== this.S.LAMBDA) {
      throw new LispError(`bad function definition for ${name ? name.name : "?"}: ${this.print(lam)}`, lam);
    }
    const params = lam.cdr.car;
    const body = lam.cdr.cdr;
    const mark = this.specpdl.length;
    try {
      if (params instanceof Sym && params !== this.NIL) {
        // lexpr
        this.bind(params, args.length);
        this.lexprFrames.push(args);
        try {
          return this.progn(body);
        } finally {
          this.lexprFrames.pop();
        }
      }
      let p = params;
      let i = 0;
      let mode = 0; // 0 required, 1 optional, 2 rest
      while (p instanceof Cons) {
        const v = p.car;
        if (v === this.S.OPTIONAL) mode = 1;
        else if (v === this.S.REST) mode = 2;
        else if (mode === 0) {
          if (i >= args.length) {
            if (fexpr) {
              this.bind(v, this.NIL);
              p = p.cdr;
              continue;
            }
            throw this.wrongArgs(name, lam, args);
          }
          this.bindPattern(v, args[i++]);
        } else if (mode === 1) {
          const [var_, init] = v instanceof Cons ? [v.car, v.cdr.car] : [v, this.NIL];
          this.bind(var_, i < args.length ? args[i++] : v instanceof Cons ? this.eval(init) : this.NIL);
        } else {
          this.bind(v, this.fromArray(args.slice(i)));
          i = args.length;
        }
        p = p.cdr;
      }
      if (i < args.length && !fexpr) throw this.wrongArgs(name, lam, args);
      return this.progn(body);
    } finally {
      this.unbindTo(mark);
    }
  }

  wrongArgs(name, lam, args) {
    return new LispError(
      `wrong number of args to ${name ? name.name : "lambda"}: ${args.length} given, lambda list ${this.print(lam.cdr.car)}`,
      name,
    );
  }

  arrayRef(arr, subs) {
    if (arr instanceof Sym) arr = this.get(arr, this.S.ARRAY);
    if (!(arr instanceof LArray)) throw new LispError(`not an array: ${this.print(arr)}`, arr);
    return arr.data[arr.index(subs)];
  }

  // ------------------------------------------------------------ printing

  print(x, slashify = true) {
    const base = typeof this.S.BASE.value === "number" ? this.S.BASE.value : 10;
    return printString(x, { slashify, base, nopoint: this.S.NOPOINT.value !== this.NIL });
  }

  // ------------------------------------------------------------ reading and loading

  reader(file) {
    return makeReader({
      obarray: this.obarray,
      ibase: () => (typeof this.S.IBASE.value === "number" ? this.S.IBASE.value : 10),
      readEval: (form) => this.eval(form),
      file,
      expandQuotes: true,
    });
  }

  readFromString(text) {
    const form = this.reader("string").open(text).next();
    return form === EOF ? this.NIL : form;
  }

  // Load a file named by an ITS file spec (symbol or namelist).
  load(spec) {
    if (!this.fs) throw new LispError("no file system", spec);
    const file = this.fs.resolveForLoad(spec, this);
    if (!file) throw new LispError(`file not found: ${this.print(spec)}`, spec);
    if (file.stub) {
      // a file we know about but replace with built-ins (e.g. the TV turtle, Dick's printer)
      if (file.stub.onLoad) file.stub.onLoad(this);
      return this.T;
    }
    const result = this.loadText(file.text, file.truename);
    this.runAfterLoad(file.truename);
    return result;
  }

  // Forms to evaluate each time a file has been loaded, kept by directory and first
  // name: (+after-load file form) adds one (an interpreter extension, for REVIVE;
  // files that adjust what a lazily loaded file defines).
  runAfterLoad(name) {
    if (!name || typeof name !== "object") return;
    this.loadedFiles = this.loadedFiles || new Set();
    const key = `${name.dir};${name.fn1}`;
    this.loadedFiles.add(key);
    for (const hook of this.afterLoad || []) if (hook.key === key) this.eval(hook.form);
  }

  // name is a parsed ITS name ({ dir, fn1, fn2 }) or a string.
  loadText(text, name = "string") {
    const label = typeof name === "string" ? name : `${name.dir};${name.fn1} ${name.fn2}`;
    const stream = this.reader(label).open(text);
    this.loadStack.push({ name, label, stream });
    try {
      for (;;) {
        const form = stream.next();
        if (form === EOF) break;
        this.eval(form);
      }
    } catch (e) {
      if (e instanceof LispError && !e.where) e.where = `${label}, line ${stream.line}`;
      throw e;
    } finally {
      this.loadStack.pop();
      if (stream.warnings.length) this.warnings.push(...stream.warnings.map((w) => `${label}: ${w}`));
    }
    return this.T;
  }

  // Evaluate the forms in a string; returns the last value.
  evalString(text) {
    const stream = this.reader("string").open(text);
    let v = this.NIL;
    for (;;) {
      const form = stream.next();
      if (form === EOF) return v;
      v = this.eval(form);
    }
  }

  warn(msg) {
    this.warnings.push(msg);
  }
}

// ---------------------------------------------------------------- special forms

function installSpecialForms(L) {
  const { NIL, T, S } = L;
  const sp = (name, fn) => L.defsubr(name, fn, "fsubr");
  const isTag = (x) => x instanceof Sym || typeof x === "number";

  sp("QUOTE", (args) => args.car);
  sp("FUNCTION", (args) => args.car);
  sp("*FUNCTION", (args) => args.car);
  sp("DECLARE", () => NIL);
  sp("COMMENT", () => L.intern("COMMENT"));

  sp("COND", function (clauses) {
    for (let c = clauses; c instanceof Cons; c = c.cdr) {
      const clause = c.car;
      const v = this.eval(clause.car);
      if (v !== NIL) return clause.cdr instanceof Cons ? this.progn(clause.cdr) : v;
    }
    return NIL;
  });

  sp("AND", function (args) {
    let v = T;
    for (let p = args; p instanceof Cons; p = p.cdr) {
      v = this.eval(p.car);
      if (v === NIL) return NIL;
    }
    return v;
  });

  sp("OR", function (args) {
    for (let p = args; p instanceof Cons; p = p.cdr) {
      const v = this.eval(p.car);
      if (v !== NIL) return v;
    }
    return NIL;
  });

  sp("SETQ", function (args) {
    let v = NIL;
    for (let p = args; p instanceof Cons; p = p.cdr.cdr) {
      v = this.eval(p.cdr.car);
      this.setq(p.car, v);
    }
    return v;
  });

  sp("PROGN", function (args) {
    return this.progn(args);
  });

  sp("PROG", function (args) {
    const mark = this.specpdl.length;
    try {
      for (let v = args.car; v instanceof Cons; v = v.cdr) this.bind(v.car, NIL);
      return runProgBody(this, this.toArray(args.cdr));
    } catch (e) {
      if (e instanceof ReturnSignal) return e.value;
      throw e;
    } finally {
      this.unbindTo(mark);
    }
  });

  sp("GO", (args) => {
    throw new GoSignal(args.car);
  });

  L.defsubr("RETURN", (v = NIL) => {
    throw new ReturnSignal(v);
  });

  sp("DO", function (args) {
    const mark = this.specpdl.length;
    try {
      if (args.car instanceof Sym && args.car !== NIL) {
        // old style: (do var init step endtest . body)
        const [v, init, step, endtest] = this.toArray(args).slice(0, 4);
        const body = this.toArray(args.cdr.cdr.cdr.cdr);
        this.bind(v, this.eval(init));
        for (;;) {
          if (this.eval(endtest) !== NIL) return NIL;
          runProgBody(this, body);
          this.setq(v, this.eval(step));
        }
      }
      // new style: (do ((var init step) ...) (endtest . results) . body)
      const specs = this.toArray(args.car).map((s) => (s instanceof Cons ? this.toArray(s) : [s]));
      const inits = specs.map((s) => (s.length > 1 ? this.eval(s[1]) : NIL));
      specs.forEach((s, i) => this.bind(s[0], inits[i]));
      const end = args.cdr.car;
      const body = this.toArray(args.cdr.cdr);
      if (end === NIL) {
        // (do ((...)) nil body): run the body once
        runProgBody(this, body);
        return NIL;
      }
      for (;;) {
        if (this.eval(end.car) !== NIL) return this.progn(end.cdr);
        runProgBody(this, body);
        const steps = specs.map((s) => (s.length > 2 ? { v: s[0], x: this.eval(s[2]) } : null));
        for (const st of steps) if (st) this.setq(st.v, st.x);
      }
    } catch (e) {
      if (e instanceof ReturnSignal) return e.value;
      throw e;
    } finally {
      this.unbindTo(mark);
    }
  });

  function letForm(sequential) {
    return function (args) {
      const mark = this.specpdl.length;
      try {
        const specs = this.toArray(args.car);
        if (sequential) {
          for (const s of specs) {
            if (s instanceof Cons) this.bindPattern(s.car, s.cdr instanceof Cons ? this.eval(s.cdr.car) : NIL);
            else this.bindPattern(s, NIL);
          }
        } else {
          const vals = specs.map((s) => (s instanceof Cons && s.cdr instanceof Cons ? this.eval(s.cdr.car) : NIL));
          specs.forEach((s, i) => this.bindPattern(s instanceof Cons ? s.car : s, vals[i]));
        }
        return this.progn(args.cdr);
      } finally {
        this.unbindTo(mark);
      }
    };
  }
  sp("LET", letForm(false));
  sp("LET*", letForm(true));

  sp("PROGV", function (args) {
    const syms = this.toArray(this.eval(args.car));
    // The values are taken one per symbol, so a circular list works (Director
    // passes :circular-list-of-nils); symbols beyond the values become unbound.
    let vals = this.eval(args.cdr.car);
    const mark = this.specpdl.length;
    try {
      for (const s of syms) {
        if (vals instanceof Cons) {
          this.bind(s, vals.car);
          vals = vals.cdr;
        } else this.bind(s, UNBOUND);
      }
      return this.progn(args.cdr.cdr);
    } finally {
      this.unbindTo(mark);
    }
  });

  sp("UNWIND-PROTECT", function (args) {
    try {
      return this.eval(args.car);
    } finally {
      this.progn(args.cdr);
    }
  });

  function caseForm(args, L) {
    const key = L.eval(args.car);
    for (let c = args.cdr; c instanceof Cons; c = c.cdr) {
      const clause = c.car;
      const k = clause.car;
      const hit =
        k === T || k === S.OTHERWISE ? true
        : k instanceof Cons ? L.toArray(k).some((x) => eqv(x, key))
        : eqv(k, key);
      if (hit) return L.progn(clause.cdr);
    }
    return NIL;
  }
  const eqv = (a, b) => a === b || (a instanceof Flonum && b instanceof Flonum && a.value === b.value);
  sp("CASEQ", function (args) {
    return caseForm(args, this);
  });
  sp("SELECTQ", function (args) {
    return caseForm(args, this);
  });

  // (catch form [tag]) and (throw value [tag]): the old MacLisp forms; tags not evaluated.
  sp("CATCH", function (args) {
    const tag = args.cdr instanceof Cons ? args.cdr.car : null;
    try {
      return this.eval(args.car);
    } catch (e) {
      if (e instanceof ThrowSignal && (tag === null || e.tag === null || e.tag === tag)) return e.value;
      throw e;
    }
  });
  sp("THROW", function (args) {
    const v = this.eval(args.car);
    throw new ThrowSignal(args.cdr instanceof Cons ? args.cdr.car : null, v);
  });
  sp("*CATCH", function (args) {
    const tag = this.eval(args.car);
    try {
      return this.progn(args.cdr);
    } catch (e) {
      if (e instanceof ThrowSignal && (tag === NIL || e.tag === tag || (tag instanceof Cons && this.toArray(tag).includes(e.tag)))) return e.value;
      throw e;
    }
  });
  L.defsubr("*THROW", (tag, v) => {
    throw new ThrowSignal(tag, v);
  });

  sp("ERRSET", function (args) {
    const mark = this.specpdl.length;
    const frames = this.lexprFrames.length;
    try {
      return new Cons(this.eval(args.car), NIL);
    } catch (e) {
      this.unbindTo(mark);
      this.lexprFrames.length = frames;
      if (e instanceof ErrSignal) return e.value;
      if (e instanceof LispError) {
        const flag = args.cdr instanceof Cons ? this.eval(args.cdr.car) : T;
        if (flag !== NIL) this.out(`;${e.message}\n`);
        return NIL;
      }
      throw e;
    }
  });
  sp("ERR", function (args) {
    throw new ErrSignal(args instanceof Cons ? this.eval(args.car) : NIL);
  });

  sp("DEFUN", function (args) {
    let name = args.car;
    let ind = S.EXPR;
    let rest = args.cdr;
    if (name instanceof Cons) {
      ind = name.cdr instanceof Cons ? name.cdr.car : S.EXPR;
      name = name.car;
    } else if (rest.car === S.MACRO || rest.car === S.FEXPR || rest.car === S.EXPR) {
      ind = rest.car;
      rest = rest.cdr;
    }
    // a new definition replaces any user definition of another kind
    if (ind === S.EXPR || ind === S.FEXPR || ind === S.MACRO) {
      for (const k of [S.EXPR, S.FEXPR, S.MACRO, S.AUTOLOAD]) if (k !== ind) this.remprop(name, k);
    }
    this.putprop(name, new Cons(S.LAMBDA, rest), ind);
    return name;
  });

  // (macro name (form) body...): the old way to define a macro
  sp("MACRO", function (args) {
    this.remprop(args.car, S.EXPR);
    this.putprop(args.car, new Cons(S.LAMBDA, args.cdr), S.MACRO);
    return args.car;
  });

  sp("DEFPROP", function (args) {
    this.putprop(args.car, args.cdr.car, args.cdr.cdr.car);
    return args.car;
  });

  sp("INCLUDE", function (args) {
    return this.load(args.car);
  });

  sp("BREAK", function (args) {
    const pred = args.cdr instanceof Cons ? this.eval(args.cdr.car) : T;
    return pred === NIL ? NIL : this.breakHandler(args.car);
  });

  sp("PUSH", function (args) {
    const place = args.cdr.car;
    const v = new Cons(this.eval(args.car), this.eval(place));
    return this.setq(place, v);
  });
  sp("POP", function (args) {
    const place = args.car;
    const l = this.eval(place);
    this.setq(place, l instanceof Cons ? l.cdr : NIL);
    return l instanceof Cons ? l.car : NIL;
  });

  sp("ARRAY", function (args) {
    const name = args.car;
    const dims = this.evlis(args.cdr.cdr);
    const arr = new LArray(args.cdr.car instanceof Sym ? args.cdr.car.name : "T", dims);
    if (name !== NIL) this.putprop(name, arr, S.ARRAY);
    return name === NIL ? arr : name;
  });
  sp("STORE", function (args) {
    const ref = args.car;
    const v = this.eval(args.cdr.car);
    let arr = ref.car;
    if (arr instanceof Sym) arr = this.get(arr, S.ARRAY);
    else arr = this.eval(arr);
    const subs = this.evlis(ref.cdr);
    arr.data[arr.index(subs)] = v;
    return v;
  });
}

function runProgBody(L, body) {
  let tags = null;
  let pc = 0;
  for (;;) {
    try {
      while (pc < body.length) {
        const f = body[pc++];
        if (f instanceof Cons) L.eval(f);
      }
      return L.NIL;
    } catch (e) {
      if (e instanceof GoSignal) {
        if (tags === null) {
          tags = new Map();
          body.forEach((f, i) => {
            if (!(f instanceof Cons)) tags.set(f, i);
          });
        }
        if (tags.has(e.tag)) {
          pc = tags.get(e.tag) + 1;
          continue;
        }
      }
      throw e;
    }
  }
}
