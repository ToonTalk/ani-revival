// The top-level definitions in a MacLisp or Director source file, with their lines:
// for the source viewer's links and for links from the film page into the code.
//
//   definitions(text) -> [{ line, kind, name, actor, pattern }]
//
// kind is the defining form (defun, define-function, define, define-receiver, ...);
// name is what it defines: a function or macro, or an actor for (define NAME parent);
// for methods, pattern is the message pattern as written and actor its actor. Forms
// inside a top-level (progn ...) count too. The scanner follows MacLisp's syntax:
// / escapes the next character, |...| is a symbol, "..." a string, ; a comment.

const DEFINERS = new Set([
  "defun", "define-function", "define-form", "define-macro", "defmacro", "define-method-helper",
  "define-alias", "define-synonym", "define-abbreviation", "define-do-now-macro",
]);
const METHODS = new Set([
  "define-receiver", "define-method", "define-receive", "define-macro-method",
  "define-extension-method", "define-extension-receiver",
]);

// Read one datum's text starting at i (skipping blanks and comments); returns [text, end].
function datum(text, i) {
  const n = text.length;
  for (;;) {
    while (i < n && /\s/.test(text[i])) i++;
    if (text[i] === ";") { while (i < n && text[i] !== "\n") i++; continue; }
    break;
  }
  const start = i;
  if (text[i] === "(") {
    let depth = 0;
    for (; i < n; i++) {
      const c = text[i];
      if (c === "/") { i++; continue; }
      if (c === ";") { while (i < n && text[i] !== "\n") i++; continue; }
      if (c === "|") { i++; while (i < n && text[i] !== "|") { if (text[i] === "/") i++; i++; } continue; }
      if (c === '"') { i++; while (i < n && text[i] !== '"') { if (text[i] === "/") i++; i++; } continue; }
      if (c === "(") depth++;
      else if (c === ")") { depth--; if (depth === 0) return [text.slice(start, i + 1), i + 1]; }
    }
    return [text.slice(start), n];
  }
  if (text[i] === "|") { const j = text.indexOf("|", i + 1); return [text.slice(i, j + 1), j + 1]; }
  while (i < n && !/[\s()]/.test(text[i])) { if (text[i] === "/") i++; i++; }
  return [text.slice(start, i), i];
}

// The elements of a list's text, as texts (one level).
function elements(listText) {
  const out = [];
  let i = 1;
  for (;;) {
    const [d, end] = datum(listText, i);
    if (!d || d === ")" || end >= listText.length) break;
    if (d.startsWith(")")) break;
    out.push(d);
    i = end;
  }
  return out;
}

export function definitions(text) {
  const defs = [];
  const lineAt = (() => {
    const starts = [0];
    for (let k = 0; k < text.length; k++) if (text[k] === "\n") starts.push(k + 1);
    return (pos) => {
      let lo = 0, hi = starts.length - 1;
      while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= pos) lo = mid; else hi = mid - 1; }
      return lo + 1;
    };
  })();
  function visit(formText, pos) {
    if (!formText.startsWith("(")) return;
    const els = elements(formText);
    const head = (els[0] || "").toLowerCase();
    const line = lineAt(pos);
    if (head === "progn") {
      // forms inside: find each element's position
      let i = 1;
      for (let k = 0; k < els.length; k++) {
        const at = formText.indexOf(els[k], i);
        if (k > 0) visit(els[k], pos + at);
        i = at + els[k].length;
      }
      return;
    }
    if (DEFINERS.has(head)) {
      let name = els[1] || "";
      if (name.startsWith("(")) name = elements(name)[0] || "";
      defs.push({ line, kind: head, name: name.toLowerCase() });
    } else if (head === "define" && els[1]) {
      if (!els[1].startsWith("(")) defs.push({ line, kind: "define", name: els[1].toLowerCase(), parent: (els[2] || "").toLowerCase() });
      else defs.push({ line, kind: "define", pattern: els[1].toLowerCase(), parent: (els[2] || "").toLowerCase() });
    } else if (METHODS.has(head) && els[1]) {
      const actor = head === "define-receive" ? els[3] : els[2];
      defs.push({ line, kind: head, pattern: els[1].replace(/\s+/g, " ").toLowerCase(), actor: (actor || "").toLowerCase() });
    }
  }
  let i = 0;
  for (;;) {
    const [d, end] = datum(text, i);
    if (!d) break;
    const pos = text.indexOf(d, i);
    visit(d, pos);
    if (end <= i) break;
    i = end;
  }
  return defs;
}
