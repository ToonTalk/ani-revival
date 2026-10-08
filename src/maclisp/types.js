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

export class Flonum {
  constructor(value) {
    this.value = value;
  }
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
