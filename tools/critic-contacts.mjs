// The contact table of REVIVE;CRITSC (reports/chapter-x/design-criticism.md, section
// 4.3): which ways of showing bring which two of their characters together, read from
// the code, not invented. A display method brings two together when its run receiver
// walks one to (contact-with B by A), or walks the two together (move-characters plan A
// B ...), in its own body or in a function it calls with them (DISPLY's, Ken's
// disply.311, and the revival's, src/director/revive/*.lisp). A convey method (a verb of
// CONVEY's, convey.64, or the revival's) brings two together when every way of showing
// it suggests does. The table names each method's arguments by position, 1 the first
// after the method's name, or (place n), the character of its n-th argument, a place
// (PLACE's character-involved-in, as REVIVE;MEND5's move-to finds who it goes to).
//
// Usage: node tools/critic-contacts.mjs [--write]
//   prints the table as REVIVE;CRITSC has it, each line citing where it was read;
//   --write puts it into src/director/revive/critsc.lisp between its markers. Exits
//   non-zero if critsc.lisp's table is not the one read (without --write), which
//   test/critic-contacts.test.js checks, so that a new way of showing can't escape
//   "keep these two apart" unseen.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
export const CRITSC = join(root, "src/director/revive/critsc.lisp");
const BEGIN = ";;; ---- the contact table, written by tools/critic-contacts.mjs (do not edit by hand)";
const END = ";;; ---- the end of the contact table";

// Lisp read as Ken wrote it, enough to walk: lists (arrays, with the line each began
// on), atoms as written, lower case; quote, comma and !, kept as part of an atom or as a
// ["quote", x] list; { } as atoms; ; comments, |...| and "..." atoms.
function readLisp(text) {
  const forms = [];
  let i = 0, line = 1;
  const n = text.length;
  const skip = () => {
    for (;;) {
      while (i < n && /\s/.test(text[i])) { if (text[i] === "\n") line++; i++; }
      if (text[i] !== ";") return;
      while (i < n && text[i] !== "\n") i++;
    }
  };
  const read = () => {
    skip();
    const c = text[i];
    if (c === "(") {
      const list = [];
      list.line = line;
      i++;
      for (;;) {
        skip();
        if (i >= n) return list;
        if (text[i] === ")") { i++; return list; }
        list.push(read());
      }
    }
    if (c === ")") { i++; return ")"; }
    if (c === "'" || c === "`") { i++; const q = ["quote", read()]; q.line = line; return q; }
    if (c === "|" || c === '"') {
      const j = text.indexOf(c, i + 1);
      const tok = text.slice(i, j < 0 ? n : j + 1);
      for (const ch of tok) if (ch === "\n") line++;
      i = j < 0 ? n : j + 1;
      return tok;
    }
    let tok = "";
    while (i < n && !/[\s()';|"]/.test(text[i])) {
      if (text[i] === "/") { tok += text[i + 1] || ""; i += 2; continue; }
      tok += text[i++];
    }
    if (!tok) { i++; return ""; }
    return tok.toLowerCase();
  };
  for (skip(); i < n; skip()) forms.push(read());
  return forms;
}

const bare = (x) => (typeof x === "string" ? x.replace(/^!?,/, "").replace(/^\?/, "") : null);
function walk(form, f) {
  if (!Array.isArray(form)) return;
  f(form);
  for (const x of form) walk(x, f);
}

// The files read: DISPLY and CONVEY (Ken's), then the revival's, by name.
function sources() {
  const ken = ["disply.311", "convey.64"].map((f) => ({ name: f, text: readFileSync(join(root, "original/7005017", f), "latin1") }));
  const revive = readdirSync(join(root, "src/director/revive")).filter((f) => f.endsWith(".lisp") && f !== "critsc.lisp").sort()
    .map((f) => ({ name: `revive/${f}`, text: readFileSync(join(root, "src/director/revive", f), "utf8") }));
  return [...ken, ...revive].map((s) => ({ ...s, forms: readLisp(s.text) }));
}
const cite = (file, line) => `${file.replace(/^revive\/(.*)\.lisp$/, (m, f) => `REVIVE;${f.toUpperCase()}`)}:${line}`;

// Every function of the files (define-function and defun, anywhere), by name.
function functionsOf(files) {
  const fns = new Map();
  for (const s of files) {
    for (const f of s.forms) {
      walk(f, (x) => {
        if ((x[0] === "define-function" || x[0] === "defun") && typeof x[1] === "string" && Array.isArray(x[2])) {
          if (!fns.has(x[1])) fns.set(x[1], { params: x[2].filter((p) => typeof p === "string"), body: x.slice(3), file: s.name });
        }
      });
    }
  }
  return fns;
}

// What a form brings together, given what its variables stand for (env: name ->
// position or ["place", n]), following calls into functions with those variables.
function contactsInBody(body, env, file, fns, depth, out) {
  const desc = (x) => { const v = bare(x); return v !== null && env.has(v) ? env.get(v) : null; };
  const add = (a, b, how, line, where) => { if (a !== null && b !== null && JSON.stringify(a) !== JSON.stringify(b)) out.push({ pair: [a, b], how, at: cite(where, line) }); };
  const visit = (x, env2, where) => {
    if (!Array.isArray(x)) return;
    const d = (y) => { const v = bare(y); return v !== null && env2.has(v) ? env2.get(v) : null; };
    if (x[0] === "contact-with" && x[2] === "by") add(d(x[3]), d(x[1]), "contact", x.line, where);
    if (x[0] === "move-characters") add(d(x[2]), d(x[3]), "together", x.line, where);
    if (x[0] === "let" && Array.isArray(x[1])) {
      const inner = new Map(env2);
      for (const b of x[1]) {
        if (!Array.isArray(b) || typeof b[0] !== "string" || b.length < 2) continue;
        const e = b[1];
        if (Array.isArray(e) && e[0] === "character-involved-in" && typeof d(e[1]) === "number") inner.set(b[0], ["place", d(e[1])]);
        else if (typeof e === "string" && d(e) !== null) inner.set(b[0], d(e));
        else inner.delete(b[0]);
      }
      for (const b of x[1]) if (Array.isArray(b)) for (const y of b.slice(1)) visit(y, env2, where);
      for (const y of x.slice(2)) visit(y, inner, where);
      return;
    }
    const fn = typeof x[0] === "string" ? fns.get(x[0]) : null;
    if (fn && depth < 4) {
      const env3 = new Map();
      fn.params.forEach((p, k) => { const v = d(x[k + 1]); if (v !== null) env3.set(p, v); });
      if (env3.size >= 2) for (const y of fn.body) visit(y, env3, fn.file);
    }
    for (const y of x) visit(y, env2, where);
  };
  for (const y of body) visit(y, env, file);
  return out;
}

// The display methods' table: each run receiver's pairs, by method, in the order read.
export function displayContacts(files = sources()) {
  const fns = functionsOf(files);
  const table = new Map();
  for (const s of files) {
    for (const f of s.forms) {
      walk(f, (x) => {
        if (x[0] !== "define-receiver" || !Array.isArray(x[1]) || x[1][0] !== "run" || typeof x[1][1] !== "string") return;
        const method = x[1][1];
        const env = new Map();
        const pattern = x[1].slice(2);
        const end = pattern.indexOf("in");
        pattern.slice(0, end < 0 ? pattern.length : end).forEach((p, k) => { if (typeof p === "string" && p.startsWith("?") && p.length > 1) env.set(p.slice(1), k + 1); });
        const found = contactsInBody(x.slice(3), env, s.name, fns, 0, []);
        const entry = table.get(method) || { method, at: cite(s.name, x.line), pairs: [] };
        for (const c of found) {
          const rank = (a) => (typeof a === "number" ? a : 100 + a[1]);
          const key = JSON.stringify([...c.pair].sort((a, b) => rank(a) - rank(b)));
          const had = entry.pairs.find((p) => p.key === key);
          if (had) { if (!had.at.includes(c.at)) had.at.push(c.at); } else entry.pairs.push({ key, pair: JSON.parse(key), at: [c.at] });
        }
        table.set(method, entry);
      });
    }
  }
  return [...table.values()];
}

// The convey methods' table: each verb whose every way of showing (a display method its
// yield-suggestions receivers suggest) brings the same two of its characters together.
export function conveyContacts(files = sources(), display = displayContacts(files)) {
  const byMethod = new Map(display.map((e) => [e.method, e]));
  const verbs = new Map();
  for (const s of files) {
    for (const f of s.forms) {
      walk(f, (x) => {
        if (!(x[0] === "define-receiver" || x[0] === "define-receive") || !Array.isArray(x[1]) || x[1][0] !== "yield" || x[1][1] !== "suggestions") return;
        // {and ?task (convey (verb ?a ?b))}
        let verbForm = null;
        walk(x[1], (y) => { if (y[0] === "convey" && Array.isArray(y[1]) && typeof y[1][0] === "string") verbForm = verbForm || y[1]; });
        if (!verbForm) return;
        const verb = verbForm[0];
        const env = new Map();
        verbForm.slice(1).forEach((p, k) => { if (typeof p === "string" && p.startsWith("?") && p.length > 1) env.set(p.slice(1), k + 1); });
        const ways = [];
        walk(x.slice(2), (y) => {
          if (y[0] !== "method:") return;
          const type = y[y.indexOf("type") + 1], value = y[y.indexOf("value") + 1];
          if (type === "display" && Array.isArray(value) && typeof value[0] === "string") ways.push({ form: value, line: y.line });
        });
        const v = verbs.get(verb) || { verb, ways: [] };
        for (const w of ways) v.ways.push({ ...w, at: cite(s.name, w.line) });
        verbs.set(verb, v);
      });
    }
  }
  const out = [];
  for (const v of verbs.values()) {
    if (!v.ways.length) continue;
    // each way's pairs, as the names of the verb's variables its arguments are
    const pairsOf = (w) => {
      const e = byMethod.get(w.form[0]);
      if (!e) return [];
      const resolve = (p) => {
        const arg = typeof p === "number" ? w.form[p] : w.form[p[1]];
        let found = null;
        if (typeof arg === "string") found = arg;
        else walk(arg, (y) => { if (!found && y[0] === "vicinity-of") found = y[1]; });
        return found;
      };
      return e.pairs.map((p) => p.pair.map(resolve));
    };
    let common = null;
    for (const w of v.ways) {
      const pairs = pairsOf(w).filter((p) => p[0] && p[1]).map((p) => p.map((a) => a.replace(/^!?,/, "")).sort().join(" "));
      common = common === null ? new Set(pairs) : new Set([...common].filter((p) => pairs.includes(p)));
    }
    out.push({ verb: v.verb, ways: v.ways.map((w) => `${w.form[0]} ${w.at}`), methods: [...new Set(v.ways.map((w) => w.form[0]))], together: [...(common || [])] });
  }
  return out;
}

// The verbs' pairs as positions of the verb: its receivers' variables, in order.
function verbPositions(files) {
  const pos = new Map();
  for (const s of files) {
    for (const f of s.forms) {
      walk(f, (x) => {
        if (!(x[0] === "define-receiver" || x[0] === "define-receive") || !Array.isArray(x[1]) || x[1][0] !== "yield") return;
        let verbForm = null;
        walk(x[1], (y) => { if (y[0] === "convey" && Array.isArray(y[1]) && typeof y[1][0] === "string") verbForm = verbForm || y[1]; });
        if (!verbForm) return;
        const m = pos.get(verbForm[0]) || new Map();
        verbForm.slice(1).forEach((p, k) => { if (typeof p === "string" && p.startsWith("?")) m.set(p.slice(1), k + 1); });
        pos.set(verbForm[0], m);
      });
    }
  }
  return pos;
}

const lispPos = (p) => (typeof p === "number" ? String(p) : `(place ${p[1]})`);

// The table as REVIVE;CRITSC has it, between its markers.
export function contactTable() {
  const files = sources();
  const display = displayContacts(files);
  const convey = conveyContacts(files, display);
  const positions = verbPositions(files);
  const lines = [BEGIN,
    ";;; Each display method's run receiver, (method pair ...), a pair the two of its arguments it",
    ";;; brings together (1 its first argument, (place n) the character of its n-th, a place);",
    ";;; a method with none brings no two together. Then each verb of CONVEY's (and the",
    ";;; revival's) whose every way of showing brings the same two of its characters together,",
    ";;; (verb pair ... by way ...), with its ways of showing: a verb counts only in a job that",
    ";;; has one of them (helps, by KNOW's helps-along, not in a film made without KNOW).",
    "(setq :critic-display-contacts",
    "      '("];
  display.forEach((e, k) => {
    const pairs = e.pairs.map((p) => `(${p.pair.map(lispPos).join(" ")})`).join(" ");
    const where = e.pairs.length ? `${e.at}; ${e.pairs.map((p) => p.at.join(", ")).join("; ")}` : e.at;
    lines.push(`\t(${e.method}${pairs ? " " + pairs : ""})${k === display.length - 1 ? "))" : ""} ;;${where}`);
  });
  lines.push("(setq :critic-convey-contacts", "      '(");
  const verbs = convey.filter((v) => v.together.length);
  verbs.forEach((v, k) => {
    const pos = positions.get(v.verb);
    // the variables of each pair, as the receivers named them, read back to positions
    const pairs = v.together.map((p) => `(${p.split(" ").map((name) => pos.get(name)).sort((a, b) => a - b).join(" ")})`).join(" ");
    lines.push(`\t(${v.verb} ${pairs} by ${v.methods.join(" ")})${k === verbs.length - 1 ? "))" : ""} ;;${v.ways.join("; ")}`);
  });
  if (!verbs.length) lines.push("\t))");
  lines.push(END);
  return lines.join("\n");
}

// critsc.lisp's table, as it is in the file now.
export function tableInFile(text = readFileSync(CRITSC, "utf8")) {
  const a = text.indexOf(BEGIN), b = text.indexOf(END);
  return a < 0 || b < 0 ? null : text.slice(a, b + END.length);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const table = contactTable();
  if (process.argv.includes("--write")) {
    const text = readFileSync(CRITSC, "utf8");
    const old = tableInFile(text);
    if (old === null) throw new Error(`${CRITSC} has no markers for the table`);
    writeFileSync(CRITSC, text.replace(old, table));
    console.log(`wrote the contact table into ${CRITSC}`);
  } else {
    console.log(table);
    let inFile = null;
    try { inFile = tableInFile(); } catch { inFile = null; }
    if (inFile !== table) {
      console.log("\ncritsc.lisp's table is not this one: node tools/critic-contacts.mjs --write");
      process.exit(1);
    }
  }
}
