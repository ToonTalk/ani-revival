// MacLisp's printer: PRINC and PRIN1 text for any Lisp object.
//
// Differences from 1979 MacLisp, chosen for readability: PRIN1 quotes awkward
// symbols with |...| rather than slashing every character, which our reader
// reads back the same way.

import { Sym, Cons, Flonum, LArray, Subr } from "./types.js";

const PLAIN = /^[A-Z0-9*+\-:?%$&<>=^\\.@~\[\]_!#{}]+$/;

function symbolText(s, slashify) {
  if (!slashify) return s.name;
  const n = s.name;
  if (n === "") return "||";
  const looksNumeric = /^[+-]?(\d+\.?|\d*\.\d+([eE][+-]?\d+)?)$/.test(n);
  if (PLAIN.test(n) && !looksNumeric && n !== ".") return n;
  return "|" + n.replace(/[|/]/g, (m) => "/" + m) + "|";
}

export function flonumText(v) {
  if (!Number.isFinite(v)) return v > 0 ? "1.0E38" : v < 0 ? "-1.0E38" : "0.0";
  if (v === 0) return "0.0";
  const abs = Math.abs(v);
  if (abs >= 1e8 || abs < 1e-6) {
    const [m, e] = v.toExponential(7).split("e");
    const mant = String(Number(m));
    return (mant.includes(".") ? mant : mant + ".0") + "E" + Number(e);
  }
  const s = String(Number(v.toPrecision(8)));
  return s.includes(".") ? s.replace(/^(-?)0\./, "$10.") : s + ".0";
}

export function fixnumText(n, base = 10, nopoint = true) {
  if (base === 10) return nopoint ? String(n) : String(n) + ".";
  return n.toString(base).toUpperCase();
}

// Convert x to text. options: { slashify, base, nopoint, NIL, depthLimit }
export function printString(x, { slashify = true, base = 10, nopoint = true, depthLimit = 400 } = {}) {
  const out = [];
  const seen = new Set();
  function p(x, depth) {
    if (depth > depthLimit) {
      out.push("...");
      return;
    }
    if (x instanceof Sym) {
      out.push(symbolText(x, slashify));
    } else if (typeof x === "number") {
      out.push(fixnumText(x, base, nopoint));
    } else if (typeof x === "bigint") {
      out.push(x.toString());
    } else if (x instanceof Flonum) {
      out.push(flonumText(x.value));
    } else if (x instanceof Cons) {
      if (seen.has(x)) {
        out.push("<circular>");
        return;
      }
      seen.add(x);
      out.push("(");
      let first = true;
      let q = x;
      let count = 0;
      while (q instanceof Cons) {
        if (!first) out.push(" ");
        p(q.car, depth + 1);
        first = false;
        q = q.cdr;
        if (++count > 100000) {
          out.push(" ...");
          break;
        }
        if (seen.has(q)) {
          out.push(" . <circular>");
          q = null;
          break;
        }
      }
      if (q !== null && !(q instanceof Sym && q.name === "NIL")) {
        out.push(" . ");
        p(q, depth + 1);
      }
      out.push(")");
      seen.delete(x);
    } else if (x instanceof LArray) {
      out.push(`#ARRAY-${x.type}-${x.dims.join("x")}`);
    } else if (x instanceof Subr) {
      out.push(`#SUBR-${x.name}`);
    } else if (x && x.isLispFile) {
      out.push(`#FILE-${x.name}`);
    } else if (typeof x === "string") {
      out.push(x);
    } else {
      out.push(`#<${String(x)}>`);
    }
  }
  p(x, 0);
  return out.join("");
}
