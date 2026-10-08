// A reader for MacLisp as Ken wrote it in 1976-79, including the Director
// read macros of the lost file KEN1;REAMAC (the "henrys-read-macros" feature).
//
// Syntax notes (MacLisp, ITS):
//  - "/" is the escape character ("/(" is a symbol constituent; "'/ " is the symbol " ").
//  - |...| reads a symbol with its characters exactly as written.
//  - Symbols are upcased; numbers are read in ibase (Ken's init files set 10),
//    and a trailing "." always means decimal.
//  - ";" starts a comment; form feeds separate pages and are whitespace.
//
// Director read macros, as the macro-expanded files (SOME LISP etc.) show:
//    'x     (QUOTE x)                      if x holds no , or !, ...
//           otherwise code that builds x   (REAMAC's QUOTE-ALLOWING-EVAL-AND-UNPACK)
//    ,x     (DIRECTOR-SYMBOL-FOR-EVAL x)   evaluate x
//    `x     (DIRECTOR-SYMBOL-FOR-VALUE x)  the value of variable x
//    !x     (DIRECTOR-SYMBOL-FOR-UNPACK x) splice x
//    {and a b}  (DIRECTOR-SYMBOL-FOR-AND-PATTERN a b)
//    {or a b}   (DIRECTOR-SYMBOL-FOR-OR-PATTERN a b)
//    #x     evaluate x at read time (options.readEval)

import { Sym, Cons, Flonum, Obarray } from "./types.js";

export { Sym, Cons, Flonum, Obarray };

export class ReaderError extends Error {
  constructor(message, file, line) {
    super(`${file || "?"}:${line}: ${message}`);
    this.file = file;
    this.line = line;
  }
}

export const EOF = Symbol("eof");

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
//   obarray       where symbols are interned
//   ibase         input radix for numerals without a trailing "." (a number, or a
//                 function returning one, so a running Lisp can change it)
//   braces        true for {and ...} and {or ...}; false for pre-1977 files, where
//                 { and } were ordinary characters
//   readEval      function called with the form after "#"; default keeps (SHARP-EVAL form)
//   expandQuotes  true to expand 'x containing , or !, into code that builds it, as
//                 REAMAC did; false (for analysis tools) to keep (QUOTE x)
export function makeReader({
  obarray = new Obarray(),
  ibase = 10,
  readEval = null,
  file = null,
  braces = true,
  expandQuotes = false,
} = {}) {
  const terminators = braces ? TERMINATORS : new Set([...TERMINATORS].filter((c) => c !== "{" && c !== "}"));
  const NIL = obarray.intern("NIL");
  const sym = (n) => obarray.intern(n);
  const getIbase = typeof ibase === "function" ? ibase : () => ibase;
  const S = {
    QUOTE: sym("QUOTE"),
    CONS: sym("CONS"),
    APPEND: sym("APPEND"),
    EVAL: sym("DIRECTOR-SYMBOL-FOR-EVAL"),
    UNPACK: sym("DIRECTOR-SYMBOL-FOR-UNPACK"),
  };

  function list(...items) {
    let r = NIL;
    for (let i = items.length - 1; i >= 0; i--) r = new Cons(items[i], r);
    return r;
  }

  // ---- REAMAC's quote: (CONTAINS-EVAL-OR-UNPACK x) and (QUOTE-ALLOWING-EVAL-AND-UNPACK x)

  function containsEvalOrUnpack(x) {
    while (x instanceof Cons) {
      if (x.car === S.EVAL || x.car === S.UNPACK) return true;
      if (containsEvalOrUnpack(x.car)) return true;
      x = x.cdr;
    }
    return false;
  }

  function quoteAllowingEvalAndUnpack(x) {
    if (x instanceof Cons && x.car === S.EVAL) return x.cdr.car;
    if (x instanceof Cons && x.car === S.UNPACK) return quoteAllowingEvalAndUnpack(x.cdr.car);
    if (!containsEvalOrUnpack(x)) {
      if (typeof x === "number" || x instanceof Flonum || x === NIL) return x;
      return list(S.QUOTE, x);
    }
    // x is a list holding markers: build it with CONS, splicing with APPEND
    const items = [];
    let tail = x;
    while (tail instanceof Cons && tail.car !== S.EVAL) {
      items.push(tail.car);
      tail = tail.cdr;
    }
    let result = tail === NIL ? NIL : quoteAllowingEvalAndUnpack(tail); // (a . ,b)
    for (let i = items.length - 1; i >= 0; i--) {
      const e = items[i];
      if (e instanceof Cons && e.car === S.UNPACK) {
        const spliced = quoteAllowingEvalAndUnpack(e.cdr.car);
        result = result === NIL ? spliced : list(S.APPEND, spliced, result);
      } else {
        result = list(S.CONS, quoteAllowingEvalAndUnpack(e), result);
      }
    }
    return result;
  }

  // Open a text for reading. Returns a stream with next(), which returns the
  // next form or EOF, and line, the current line number.
  function open(text) {
    let pos = 0;
    let line = 1;
    const warnings = [];

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
        if (WHITESPACE.has(c) || c === "\x03" || c === "\x00") {
          next();
        } else if (c === ";") {
          while (peek() !== undefined && peek() !== "\n") next();
        } else {
          return;
        }
      }
    }

    function readToken() {
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
      const rest = readToken(); // |foo|bar continues the symbol
      return sym(s + rest.text);
    }

    function parseNumber(t) {
      if (/^[+-]?\d+\.$/.test(t)) return parseInt(t.slice(0, -1), 10);
      if (/^[+-]?\d+$/.test(t)) {
        const base = getIbase();
        if (base === 10) return parseInt(t, 10);
        // A numeral containing 8 or 9 is read in decimal.
        return /[89]/.test(t) ? parseInt(t, 10) : parseInt(t, base);
      }
      if (/^[+-]?(\d*\.\d+|\d+\.\d*)([eE][+-]?\d+)?$/.test(t) || /^[+-]?\d+[eE][+-]?\d+$/.test(t)) {
        return new Flonum(parseFloat(t));
      }
      return null;
    }

    function readList(close) {
      const startLine = line;
      next(); // ( or {
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
        const x = readForm();
        if (c === "'" && expandQuotes) return quoteAllowingEvalAndUnpack(x);
        const r = list(sym(MARKERS[c]), x);
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
        throw new ReaderError(`cannot read character ${JSON.stringify(next())}`, file, line);
      }
      if (!tok.escaped) {
        const n = parseNumber(tok.text);
        if (n !== null) return n;
      }
      return sym(tok.text);
    }

    return {
      warnings,
      get line() {
        return line;
      },
      next() {
        for (;;) {
          skipWhitespaceAndComments();
          if (peek() === undefined) return EOF;
          if (peek() === ")" || (peek() === "}" && braces)) {
            // MacLisp's loader ignored stray close parentheses at top level.
            warnings.push(`line ${line}: ignored stray ${next()} at top level`);
            continue;
          }
          return readForm();
        }
      },
    };
  }

  // Read every top-level form in text. Returns [{ form, line, endLine }] with a
  // warnings property.
  function readAll(text) {
    const stream = open(text);
    const forms = [];
    for (;;) {
      // position the stream at the next form to record its starting line
      const before = stream.line;
      const form = stream.next();
      if (form === EOF) break;
      forms.push({ form, line: form instanceof Cons && form.line ? form.line : before, endLine: stream.line });
    }
    forms.warnings = stream.warnings;
    return forms;
  }

  return { open, readAll, NIL, sym, list, quoteAllowingEvalAndUnpack, containsEvalOrUnpack };
}

// Print a form in MacLisp syntax (for reports and debugging; the interpreter has
// its own printer with MacLisp's exact conventions).
export function printForm(x) {
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
      const arg = printForm(x.cdr.car);
      if (head === "QUOTE") return "'" + arg;
      if (head === "DIRECTOR-SYMBOL-FOR-EVAL") return "," + arg;
      if (head === "DIRECTOR-SYMBOL-FOR-VALUE") return "`" + arg;
      if (head === "DIRECTOR-SYMBOL-FOR-UNPACK") return "!" + arg;
    }
    const parts = [];
    let p = x;
    while (p instanceof Cons) {
      parts.push(printForm(p.car));
      p = p.cdr;
    }
    if (!(p instanceof Sym && p.name === "NIL")) parts.push(".", printForm(p));
    return "(" + parts.join(" ") + ")";
  }
  return String(x);
}
