// A reader for MacLisp as Ken wrote it in 1976-79, including the Director
// read macros (KEN1;REAMAC, the "henrys-read-macros" feature).
//
// Syntax notes (MacLisp, ITS):
//  - "/" is the escape character ("/(" is a symbol constituent; "'/ " is the symbol " ").
//  - |...| reads a symbol with its characters exactly as written.
//  - Symbols are upcased; numbers are read in ibase (Ken's init files set 10),
//    and a trailing "." always means decimal.
//  - ";" starts a comment; form feeds separate pages and are whitespace.
// Director read macros, as the macro-expanded files (SOME LISP etc.) show:
//    'x     (QUOTE x)                      a quote that may contain the forms below
//    ,x     (DIRECTOR-SYMBOL-FOR-EVAL x)   evaluate x
//    `x     (DIRECTOR-SYMBOL-FOR-VALUE x)  the value of variable x
//    !x     (DIRECTOR-SYMBOL-FOR-UNPACK x) splice x
//    {and a b}  (DIRECTOR-SYMBOL-FOR-AND-PATTERN a b)
//    {or a b}   (DIRECTOR-SYMBOL-FOR-OR-PATTERN a b)
//    #x     evaluate x at read time (handled by options.readEval)

export class Sym {
  constructor(name) {
    this.name = name;
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
}

export class ReaderError extends Error {
  constructor(message, file, line) {
    super(`${file || "?"}:${line}: ${message}`);
    this.file = file;
    this.line = line;
  }
}

const WHITESPACE = new Set([" ", "\t", "\n", "\r", "\f", "\v"]);
// Characters that end a token. The Director macro characters are terminating.
const TERMINATORS = new Set(["(", ")", ";", "'", "`", ",", "!", "{", "}", "|", "#"]);

const MARKERS = {
  "'": "QUOTE",
  ",": "DIRECTOR-SYMBOL-FOR-EVAL",
  "`": "DIRECTOR-SYMBOL-FOR-VALUE",
  "!": "DIRECTOR-SYMBOL-FOR-UNPACK",
};

// Options:
//   ibase     input radix for numerals without a trailing "." (Ken's init files set 10)
//   braces    true for the Director read macros {and ...} and {or ...}; false for
//             pre-1977 files, where { and } were ordinary characters
//   readEval  function called with the form after "#"; default is to keep (SHARP-EVAL form)
export function makeReader({ obarray = new Obarray(), ibase = 10, readEval = null, file = null, braces = true } = {}) {
  const terminators = braces ? TERMINATORS : new Set([...TERMINATORS].filter((c) => c !== "{" && c !== "}"));
  const NIL = obarray.intern("NIL");
  const sym = (n) => obarray.intern(n);

  function list(...items) {
    let r = NIL;
    for (let i = items.length - 1; i >= 0; i--) r = new Cons(items[i], r);
    return r;
  }

  // Read every top-level form in text. Returns [{ form, line, endLine }].
  function readAll(text) {
    let pos = 0;
    let line = 1;

    const peek = () => text[pos];
    const next = () => {
      const c = text[pos++];
      if (c === "\n") line++;
      return c;
    };

    function skipWhitespaceAndComments() {
      for (;;) {
        const c = peek();
        if (c === undefined) return;
        if (WHITESPACE.has(c)) {
          next();
        } else if (c === ";") {
          while (peek() !== undefined && peek() !== "\n") next();
        } else if (c === "\x03" || c === "\x00") {
          next(); // padding
        } else {
          return;
        }
      }
    }

    function readToken() {
      // Returns { text, escaped } for a symbol-or-number token.
      let s = "";
      let escaped = false;
      for (;;) {
        const c = peek();
        if (c === undefined || WHITESPACE.has(c) || terminators.has(c)) break;
        if (c === "/") {
          next();
          const e = next();
          if (e === undefined) throw new ReaderError("end of file after /", file, line);
          s += e;
          escaped = true;
        } else {
          s += next().toUpperCase();
        }
      }
      return { text: s, escaped };
    }

    function readBarSymbol() {
      next(); // opening |
      let s = "";
      for (;;) {
        const c = next();
        if (c === undefined) throw new ReaderError("end of file inside |...|", file, line);
        if (c === "|") break;
        if (c === "/") {
          const e = next();
          if (e === undefined) throw new ReaderError("end of file after /", file, line);
          s += e;
        } else {
          s += c;
        }
      }
      // A bar symbol can continue with ordinary characters, e.g. |foo|bar.
      const rest = readToken();
      return sym(s + rest.text);
    }

    function parseNumber(t) {
      if (/^[+-]?\d+\.$/.test(t)) return parseInt(t.slice(0, -1), 10);
      if (/^[+-]?\d+$/.test(t)) {
        if (ibase === 10) return parseInt(t, 10);
        // In MacLisp a numeral with 8 or 9 in it is read in decimal.
        return /[89]/.test(t) ? parseInt(t, 10) : parseInt(t, ibase);
      }
      if (/^[+-]?(\d*\.\d+|\d+\.\d*)([eE][+-]?\d+)?$/.test(t) || /^[+-]?\d+[eE][+-]?\d+$/.test(t)) {
        return new Flonum(parseFloat(t));
      }
      return null;
    }

    function readList(close) {
      const startLine = line;
      next(); // opening ( or {
      const items = [];
      let tail = NIL;
      for (;;) {
        skipWhitespaceAndComments();
        const c = peek();
        if (c === undefined) throw new ReaderError(`end of file inside list begun on line ${startLine}`, file, line);
        if (c === close) {
          next();
          break;
        }
        if (c === ")" || (c === "}" && braces)) {
          throw new ReaderError(`unexpected ${c} inside list begun on line ${startLine}`, file, line);
        }
        if (c === "." && items.length > 0) {
          // a lone dot introduces the tail of a dotted list
          const after = text[pos + 1];
          if (after === undefined || WHITESPACE.has(after) || after === "(" || after === ")") {
            next();
            tail = readForm();
            skipWhitespaceAndComments();
            if (peek() !== close) throw new ReaderError("expected end of dotted list", file, line);
            next();
            break;
          }
        }
        items.push(readForm());
      }
      let r = tail;
      for (let i = items.length - 1; i >= 0; i--) {
        r = new Cons(items[i], r);
        r.line = startLine;
      }
      return r;
    }

    function readForm() {
      skipWhitespaceAndComments();
      const c = peek();
      if (c === undefined) throw new ReaderError("unexpected end of file", file, line);
      if (c === "(") return readList(")");
      if (c === "{" && braces) {
        const startLine = line;
        const items = readList("}");
        const head = items === NIL ? null : items.car;
        let r;
        if (head instanceof Sym && head.name === "AND") r = new Cons(sym("DIRECTOR-SYMBOL-FOR-AND-PATTERN"), items.cdr);
        else if (head instanceof Sym && head.name === "OR") r = new Cons(sym("DIRECTOR-SYMBOL-FOR-OR-PATTERN"), items.cdr);
        else r = new Cons(sym("DIRECTOR-SYMBOL-FOR-BRACES"), items);
        r.line = startLine;
        return r;
      }
      if (c === ")" || (c === "}" && braces)) throw new ReaderError(`unexpected ${c}`, file, line);
      if (c === "|") return readBarSymbol();
      if (MARKERS[c]) {
        const startLine = line;
        next();
        const r = list(sym(MARKERS[c]), readForm());
        r.line = startLine;
        return r;
      }
      if (c === "#") {
        const startLine = line;
        next();
        const form = readForm();
        if (readEval) return readEval(form);
        const r = list(sym("SHARP-EVAL"), form);
        r.line = startLine;
        return r;
      }
      const tok = readToken();
      if (tok.text === "" && !tok.escaped) {
        // a stray character we do not handle; consume it so we make progress
        throw new ReaderError(`cannot read character ${JSON.stringify(next())}`, file, line);
      }
      if (!tok.escaped) {
        const n = parseNumber(tok.text);
        if (n !== null) return n;
      }
      return sym(tok.text);
    }

    const forms = [];
    forms.warnings = [];
    for (;;) {
      skipWhitespaceAndComments();
      if (peek() === undefined) break;
      if (peek() === ")" || (peek() === "}" && braces)) {
        forms.warnings.push(`line ${line}: ignored stray ${next()} at top level`);
        continue;
      }
      const startLine = line;
      const form = readForm();
      forms.push({ form, line: startLine, endLine: line });
    }
    return forms;
  }

  return { readAll, NIL, sym, list };
}

// Print a form in MacLisp syntax (for reports and debugging).
export function printForm(x, NILsym) {
  if (x instanceof Sym) {
    if (/^[A-Z0-9*+\-:?%$&<>=^\\.@~\[\]_]+$/.test(x.name) && !/^[+-]?\d/.test(x.name) && x.name !== ".") return x.name.toLowerCase();
    return "|" + x.name.replace(/[|/]/g, (m) => "/" + m) + "|";
  }
  if (typeof x === "number") return String(x);
  if (x instanceof Flonum) return Number.isInteger(x.value) ? x.value.toFixed(1) : String(x.value);
  if (x instanceof Cons) {
    const head = x.car instanceof Sym ? x.car.name : null;
    const one = x.cdr instanceof Cons && x.cdr.cdr instanceof Sym && x.cdr.cdr.name === "NIL";
    if (one) {
      const arg = printForm(x.cdr.car, NILsym);
      if (head === "QUOTE") return "'" + arg;
      if (head === "DIRECTOR-SYMBOL-FOR-EVAL") return "," + arg;
      if (head === "DIRECTOR-SYMBOL-FOR-VALUE") return "`" + arg;
      if (head === "DIRECTOR-SYMBOL-FOR-UNPACK") return "!" + arg;
    }
    const parts = [];
    let p = x;
    while (p instanceof Cons) {
      parts.push(printForm(p.car, NILsym));
      p = p.cdr;
    }
    if (!(p instanceof Sym && p.name === "NIL")) parts.push(".", printForm(p, NILsym));
    return "(" + parts.join(" ") + ")";
  }
  return String(x);
}
