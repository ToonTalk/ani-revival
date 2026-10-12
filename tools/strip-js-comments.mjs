// Comments taken out of a JavaScript module, for the claude.ai copy of the film page,
// which claude.ai refuses over about 950 KB. A small tokenizer follows strings, template
// literals (with their ${...} parts), regular expressions and comments; it removes // and
// /* */ comments in code, and the lines that held only a comment, and leaves every
// string, template and regular expression exactly as written. stringsOf() lists those
// tokens, so a caller can check that taking the comments out changed none of them.

const REGEX_AFTER = new Set([..."(,=:[!&|?{};+-*%<>~^"]);
const REGEX_KEYWORDS = new Set(["return", "typeof", "case", "do", "else", "in", "of", "new", "delete", "void", "throw", "yield", "await", "instanceof"]);

function scan(src, { keepComments }) {
  let out = "";
  const strings = [];
  let i = 0;
  // the stack of template literals whose ${...} part we are in, each with its brace depth
  const templates = [];
  let lastSignificant = ""; // the last code character that isn't white space
  let lastWord = "";
  const n = src.length;
  const pushCode = (s) => { out += s; for (const c of s) if (!/\s/.test(c)) lastSignificant = c; };
  // a template literal's text from i, up to its end or its next ${
  const templateText = (from) => {
    let j = from;
    let text = "";
    while (j < n) {
      if (src[j] === "\\") { text += src.slice(j, j + 2); j += 2; continue; }
      if (src[j] === "`") { text += "`"; j++; return { j, text, closed: true }; }
      if (src[j] === "$" && src[j + 1] === "{") { text += "${"; j += 2; return { j, text, closed: false }; }
      text += src[j++];
    }
    throw new Error("unterminated template literal");
  };
  while (i < n) {
    const c = src[i];
    if (c === "`" || (templates.length && c === "}" && templates[templates.length - 1] === 0)) {
      // a template literal begins, or its text resumes after a ${...} part
      if (c === "}") templates.pop();
      const { j, text, closed } = templateText(i + 1);
      strings.push(c + text);
      out += c + text;
      i = j;
      lastSignificant = closed ? "`" : "{";
      lastWord = "";
      if (!closed) templates.push(0);
      continue;
    }
    if (templates.length && c === "{") templates[templates.length - 1]++;
    if (templates.length && c === "}") templates[templates.length - 1]--;
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c) { if (src[j] === "\\") j++; j++; }
      const tok = src.slice(i, j + 1);
      strings.push(tok);
      pushCode(tok);
      i = j + 1;
      lastWord = "";
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      let j = i;
      while (j < n && src[j] !== "\n") j++;
      if (keepComments) out += src.slice(i, j);
      else {
        // a line that held only this comment goes, with its newline; otherwise only the
        // comment goes and the line's code stays
        const lineStart = out.lastIndexOf("\n") + 1;
        if (out.slice(lineStart).trim() === "" && src[j] === "\n") { out = out.slice(0, lineStart); j++; }
      }
      i = j;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const j = src.indexOf("*/", i + 2);
      if (j < 0) throw new Error("unterminated block comment");
      const body = src.slice(i, j + 2);
      if (keepComments) out += body;
      else out += body.includes("\n") ? "\n" : " ";
      i = j + 2;
      continue;
    }
    if (c === "/" && (!lastSignificant || REGEX_AFTER.has(lastSignificant) || REGEX_KEYWORDS.has(lastWord))) {
      // a regular expression
      let j = i + 1;
      let inClass = false;
      while (j < n) {
        const d = src[j];
        if (d === "\\") { j += 2; continue; }
        if (d === "\n") throw new Error(`a regular expression runs past its line at ${i}`);
        if (inClass) { if (d === "]") inClass = false; } else if (d === "[") inClass = true; else if (d === "/") break;
        j++;
      }
      j++;
      while (j < n && /[a-z]/i.test(src[j])) j++;
      const tok = src.slice(i, j);
      strings.push(tok);
      pushCode(tok);
      i = j;
      lastWord = "";
      continue;
    }
    if (/[A-Za-z_$]/.test(c)) {
      let j = i;
      while (j < n && /[\w$]/.test(src[j])) j++;
      lastWord = src.slice(i, j);
      pushCode(lastWord);
      i = j;
      continue;
    }
    if (!/\s/.test(c)) lastWord = "";
    pushCode(c);
    i++;
  }
  if (templates.length) throw new Error("unterminated template expression");
  return { out, strings };
}

export const stripComments = (src) => scan(src, { keepComments: false }).out;
export const stringsOf = (src) => scan(src, { keepComments: true }).strings;
