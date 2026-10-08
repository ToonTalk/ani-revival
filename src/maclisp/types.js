// MacLisp data types.
//
// Fixnums are JS numbers; flonums are Flonum objects, because MacLisp keeps the
// two apart (1 and 1.0 print differently, and = compares within a type).
// Symbols carry a value cell and a property list; as in MacLisp, a function
// definition lives on the property list under EXPR, FEXPR, MACRO, SUBR, LSUBR,
// FSUBR, ARRAY or AUTOLOAD.

export const UNBOUND = Symbol("unbound");

export class Sym {
  constructor(name, interned = true) {
    this.name = name;
    this.value = UNBOUND;
    this.plist = null; // a Lisp list (NIL once the interpreter exists); null means empty
    this.interned = interned;
    this.fcellCache = undefined; // the interpreter's note of its function definition

  }
  toString() {
    return this.name;
  }
}

export class Cons {
  constructor(car, cdr) {
    this.car = car;
    this.cdr = cdr;
  }
}

// MacLisp's flonums were PDP-10 single-precision words: a sign, an 8-bit exponent and
// a 27-bit fraction. With Flonum.pdp10 set, each flonum is rounded to that precision
// as it is made (arithmetic, the reader, the TV turtle), so that comparisons come out
// as they did on the PDP-10.
export class Flonum {
  constructor(value) {
    this.value = Flonum.pdp10 ? pdp10Single(value) : value;
  }
}
Flonum.pdp10 = false;

// x rounded to 27 significant bits, halves up (the PDP-10's rounding instructions
// add half a unit to the two's-complement fraction and truncate).
export function pdp10Single(x) {
  if (x === 0 || !Number.isFinite(x)) return x;
  let e = Math.floor(Math.log2(Math.abs(x)));
  if (2 ** e > Math.abs(x)) e--;
  else if (2 ** (e + 1) <= Math.abs(x)) e++;
  const scale = 2 ** (26 - e);
  return Math.floor(x * scale + 0.5) / scale;
}

// A built-in function. kind is "subr" (fixed arguments, evaluated), "lsubr"
// (any number of evaluated arguments) or "fsubr" (special form: receives the
// unevaluated argument list).
export class Subr {
  constructor(name, fn, kind = "lsubr") {
    this.name = name;
    this.fn = fn;
    this.kind = kind;
  }
}

// MacLisp arrays: called like functions to read, STORE to write.
export class LArray {
  constructor(type, dims) {
    this.type = type;
    this.dims = dims;
    this.data = new Array(dims.reduce((a, b) => a * b, 1)).fill(null);
  }
  index(subs) {
    let i = 0;
    for (let k = 0; k < this.dims.length; k++) {
      const s = subs[k];
      if (typeof s !== "number" || s < 0 || s >= this.dims[k]) throw new Error(`array subscript out of range: ${s}`);
      i = i * this.dims[k] + s;
    }
    return i;
  }
}

export class Obarray {
  constructor() {
    this.table = new Map();
  }
  intern(name) {
    let s = this.table.get(name);
    if (!s) {
      s = new Sym(name);
      this.table.set(name, s);
    }
    return s;
  }
  find(name) {
    return this.table.get(name) || null;
  }
}

export class LispError extends Error {
  constructor(message, datum) {
    super(message);
    this.datum = datum;
  }
}
