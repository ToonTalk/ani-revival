// The revival's own Lisp (src/director/revive/*, REVIVE;* in the bundle) without its
// comments, for the claude.ai copy of the film page (tools/build-film-app.mjs
// --claude-artifact), which claude.ai refuses over about 950 KB. Every line is kept, so
// that every line number stays as it is; only what follows a ; to the end of its line goes,
// with the blanks before it, outside |symbols|, and never after MacLisp's / escape (so
// (setq a /;) keeps its semicolon). A " is a letter like any other to this MacLisp's
// reader (src/maclisp/reader.js reads "a b" as two symbols), so it is one here too. Ken's
// files are never stripped.
// differentForms checks the result: read with the revival's own MacLisp reader, the
// stripped text must give the same forms, printed alike, starting on the same lines, and
// have as many lines; the build stops otherwise.
import { makeReader, printForm } from "../src/maclisp/reader.js";

export function stripLispComments(text) {
  let out = "", i = 0, bar = false;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "/") { out += text.slice(i, i + 2); i += 2; continue; } // an escape, anywhere
    if (ch === "|") bar = !bar;
    else if (ch === ";" && !bar) {
      while (i < text.length && text[i] !== "\n") i++;
      out = out.replace(/[ \t]+$/, "");
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

// Why two texts of a Lisp file don't read alike, or null if they do: the forms each gives,
// as the revival's reader reads them, with the line each starts on; and the lines.
export function differentForms(a, b) {
  const lines = (t) => t.split("\n").length;
  if (lines(a) !== lines(b)) return `has ${lines(b)} lines, not ${lines(a)}`;
  const forms = (t) => makeReader().readAll(t).map((x) => `${x.line} ${printForm(x.form)}`);
  const x = forms(a), y = forms(b);
  if (x.length !== y.length) return `reads as ${y.length} forms, not ${x.length}`;
  const k = x.findIndex((f, n) => f !== y[n]);
  return k < 0 ? null : `reads differently from its form ${k + 1} (line ${x[k].split(" ")[0]})`;
}
