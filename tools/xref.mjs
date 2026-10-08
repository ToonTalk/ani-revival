// Cross-reference: every function that Ani and the surviving Director call,
// against where it is defined.
//
// Usage: node tools/xref.mjs
// Writes reports/xref.json and reports/XREF.md.
//
// Classification of each called name:
//   defined   defined in a surviving file (Ani, drivers, Director KEN; files, KEN1;DRECT)
//   lost      defined in a KEN1; file that did not survive (per the 1979 tags table)
//   builtin   a MacLisp primitive (tools/maclisp-builtins.txt)
//   turtle    an LLOGO TV turtle primitive (reports/tvrtle-names.txt, from PDP-10/its src/llogo/tvrtle.542)
//   unknown   none of the above: needs a look
//
// Director code mixes Lisp with message sending, so the walker follows Director's
// conventions: the words of a message are data, except that ,x evaluates x; method
// bodies ("do when receiving PATTERN body...") are code.

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { decodeItsText } from "../src/its/text.js";
import { makeReader, Obarray, Sym, Cons, printForm } from "../src/maclisp/reader.js";
import {
  ANI_FILES, DRIVER_FILES, DIRECTOR_FILES, EXPANDED_FILES, OTHER_VERSIONS,
} from "../src/sources.js";

const ob = new Obarray();
const NIL = ob.intern("NIL");

// ---------------------------------------------------------------- tags table

// The 1979 EMACS tags table lists every definition in every file, including the
// KEN1; files that are lost. Each entry is the start of the definition's line
// followed by its character position, whose first digit has the 200 bit set.
function readTags(path) {
  const raw = readFileSync(path).toString("latin1");
  const files = [];
  for (const sec of raw.split("\x1f")) {
    const lines = sec.split(/\r?\n/).filter((l) => l.length);
    if (lines.length < 2) continue;
    const m = lines[0].match(/^(\w+); (\w+): (\S+)(?: (\S+))?/);
    if (!m) continue;
    const [, dir, , fn1, fn2] = m;
    const defs = [];
    for (const l of lines.slice(2)) {
      const mm = l.match(/^(.*?)([\xb0-\xb9])(\d*)$/);
      if (!mm) continue;
      const head = mm[1];
      const pos = parseInt(String.fromCharCode(mm[2].charCodeAt(0) & 0x7f) + mm[3], 10);
      const dm = head.match(/^\((\S+)\s+(\(?)\s*([^\s()]+)/);
      if (dm) defs.push({ kind: dm[1].toLowerCase(), name: dm[3].toUpperCase(), pos, paren: dm[2] === "(" });
    }
    files.push({ dir, file: fn1, fn2, defs });
  }
  return files;
}

const tags = readTags("original/7005017/ken.tags");
const lostFiles = tags.filter((t) => t.dir === "KEN1" && t.defs.some((d) => d.kind !== "defcomment") && t.fn2 === ">");
const lostDefs = new Map(); // NAME -> {file, kind, pos}
for (const t of lostFiles) {
  for (const d of t.defs) {
    if (d.kind === "defcomment") continue;
    if (!lostDefs.has(d.name)) lostDefs.set(d.name, { file: t.file, kind: d.kind, pos: d.pos, paren: d.paren });
  }
}
// KEN1;DRECT survived (as }^RSV 6), so its definitions are not lost.
for (const [n, d] of lostDefs) if (d.file === "DRECT") lostDefs.delete(n);

// ---------------------------------------------------------------- name lists

function readNameList(path) {
  return new Set(
    readFileSync(path, "utf8")
      .split("\n")
      .map((l) => l.replace(/;.*/, ""))
      .join(" ")
      .split(/\s+/)
      .filter(Boolean)
      .map((s) => s.toUpperCase()),
  );
}
const builtins = readNameList("tools/maclisp-builtins.txt");
const turtle = readNameList("reports/tvrtle-names.txt");
// Names that belong to the 1979 environment rather than to Director or Ani:
// LIBLSP;#PRINT (the pretty printer), the editor, the XGP printer, TV hardware setup.
const environment = new Set(["#PRINT", "#PRIN1", "#PRINC", "INF-EDIT", "R-XGP", "SPLITSCREEN", "MAP-TV-CORE"]);
// Director syntax handled by the method-defining macros rather than called.
const directorSyntax = new Set(["HELP-COMMENTS:"]);

// ---------------------------------------------------------------- reading

function readForms(path, opts = {}) {
  const { text } = decodeItsText(readFileSync(path));
  try {
    return makeReader({ obarray: ob, file: path, ...opts }).readAll(text);
  } catch (e) {
    return { error: e.message };
  }
}

const isSym = (x, name) => x instanceof Sym && (name === undefined || x.name === name);
function toArray(x) {
  const a = [];
  while (x instanceof Cons) {
    a.push(x.car);
    x = x.cdr;
  }
  return a;
}

// ---------------------------------------------------------------- walking

const defs = new Map(); // NAME -> [{file, line, kind}]
const calls = new Map(); // NAME -> [{file, line}]
const actors = new Map(); // actor name -> [{file, line, parent}]
const methods = []; // {file, line, actor, pattern}
const autoloads = new Map(); // NAME -> file
const messageHeads = new Map(); // first word of messages sent -> count

function addDef(name, file, line, kind) {
  if (!(name instanceof Sym)) return;
  const k = name.name;
  if (!defs.has(k)) defs.set(k, []);
  defs.get(k).push({ file, line, kind });
}
function addCall(name, file, line) {
  const k = name.name;
  if (!calls.has(k)) calls.set(k, []);
  calls.get(k).push({ file, line });
}

const IGNORE_ARGS = new Set(["DECLARE", "COMMENT", "DEFCOMMENT", "INCLUDE", "STATUS", "SSTATUS", "COMPILE-ACTORS", "QUOTE"]);
const ASK_FORMS = new Set(["ASK", "ASK-IF", "ASK-IF-EXISTS", "ASK-OLD", "ASK-IF-UNDERSTOOD", "ASK-ALL", "ASK-MACRO", "ASK-EACH", "ASK-IF-CAN", "UNCOMPILED-ASK", "UNCOMPILED-ASK-IF-CAN"]);
const METHOD_DEFINERS = new Set([
  "DEFINE-METHOD", "DEFINE-RECEIVER", "DEFINE-RECEIVE", "DEFINE-MACRO-METHOD",
  "DEFINE-EXTENSION-RECEIVER", "DEFINE-EXTENSION-METHOD",
]);
const MAPPERS = new Set(["MAPCAR", "MAPC", "MAPCAN", "MAPCON", "MAPLIST", "MAP", "FUNCALL", "APPLY", "SORT", "SORTCAR"]);

function lineOf(x, fallback) {
  return (x instanceof Cons && x.line) || fallback;
}

// Data (a quoted form or the words of a message): only Director markers hold code.
function walkData(x, file, line) {
  if (!(x instanceof Cons)) return;
  const head = x.car;
  if (isSym(head, "DIRECTOR-SYMBOL-FOR-EVAL") || isSym(head, "SHARP-EVAL")) {
    walkCode(x.cdr.car, file, lineOf(x, line));
    return;
  }
  if (isSym(head, "DIRECTOR-SYMBOL-FOR-VALUE")) return;
  for (const item of toArray(x)) walkData(item, file, lineOf(x, line));
}

// A message: a list of words, possibly carrying code bodies.
function walkMessage(words, file, line) {
  const w = toArray(words);
  if (w.length && w[0] instanceof Sym) messageHeads.set(w[0].name, (messageHeads.get(w[0].name) || 0) + 1);
  for (let i = 0; i < w.length; i++) {
    // ... WHEN RECEIVING <pattern> <body...>   and   ... BY DOING <body...>
    if (isSym(w[i], "RECEIVING") && i + 1 < w.length) {
      walkData(w[i + 1], file, line);
      let j = i + 2;
      const byDoing = w.findIndex((x, k) => k >= j && isSym(x, "DOING"));
      if (byDoing >= 0) j = byDoing + 1;
      for (; j < w.length; j++) walkCode(w[j], file, lineOf(w[j], line));
      return;
    }
    // DO THE FOLLOWING: <message> <message> ...
    if (isSym(w[i], "FOLLOWING:")) {
      for (let j = i + 1; j < w.length; j++) {
        if (w[j] instanceof Cons && !isSym(w[j].car, "DIRECTOR-SYMBOL-FOR-EVAL")) walkMessage(w[j], file, lineOf(w[j], line));
        else walkData(w[j], file, line);
      }
      return;
    }
    walkData(w[i], file, lineOf(w[i], line));
  }
}

function walkBody(forms, file, line) {
  for (const f of forms) walkCode(f, file, lineOf(f, line));
}

function walkDefinition(form, file, line) {
  const head = form.car.name;
  const a = toArray(form);
  switch (head) {
    case "DEFUN": {
      // (defun name [macro|fexpr|expr] args body...) or (defun (name prop) args body...)
      let name = a[1];
      let kind = "defun";
      let i = 2;
      if (name instanceof Cons) {
        kind = `defun ${printForm(name.cdr.car)}`;
        name = name.car;
      } else if (isSym(a[2]) && ["MACRO", "FEXPR", "EXPR", "LEXPR"].includes(a[2].name)) {
        kind = `defun ${a[2].name.toLowerCase()}`;
        i = 3;
      }
      addDef(name, file, line, kind);
      walkBody(a.slice(i + 1), file, line);
      return true;
    }
    case "MACRO":
    case "DEFMACRO":
      addDef(a[1], file, line, head.toLowerCase());
      walkBody(a.slice(3), file, line);
      return true;
    case "DEFINE-FUNCTION":
      addDef(a[1], file, line, "define-function");
      walkBody(a.slice(3), file, line);
      return true;
    case "DEFINE-FORM":
    case "DEFINE-METHOD-HELPER": {
      const name = a[1] instanceof Cons ? a[1].car : a[1];
      addDef(name, file, line, head.toLowerCase());
      walkBody(a.slice(head === "DEFINE-FORM" ? 2 : 3), file, line);
      return true;
    }
    case "DEFINE-SYNONYM":
      addDef(a[1], file, line, "define-synonym");
      if (a[2] instanceof Sym) addCall(a[2], file, line);
      return true;
    case "DEFINE-ABBREVIATION":
      addDef(a[1], file, line, "define-abbreviation");
      return true;
    case "DEFPROP":
      if (isSym(a[3], "AUTOLOAD") && a[1] instanceof Sym) autoloads.set(a[1].name, printForm(a[2]));
      return true;
    case "DEFINE":
    case "DEFINE-OR-ADD-TO": {
      const name = printForm(a[1]);
      if (!actors.has(name)) actors.set(name, []);
      actors.get(name).push({ file, line, parent: a[2] ? printForm(a[2]) : null });
      for (const clause of a.slice(3)) walkMessage(clause, file, lineOf(clause, line));
      return true;
    }
    default:
      if (METHOD_DEFINERS.has(head)) {
        methods.push({ file, line, kind: head.toLowerCase(), pattern: printForm(a[1]), actor: a[2] ? printForm(a[2]) : null });
        walkData(a[1], file, line);
        walkBody(a.slice(3), file, line);
        return true;
      }
      return false;
  }
}

function walkCode(x, file, line) {
  if (!(x instanceof Cons)) return;
  line = lineOf(x, line);
  const head = x.car;
  const a = toArray(x);
  if (head instanceof Cons) {
    if (isSym(head.car, "LAMBDA")) walkBody(toArray(head).slice(2), file, line);
    else walkCode(head, file, line);
    walkBody(a.slice(1), file, line);
    return;
  }
  if (!(head instanceof Sym)) return;
  const name = head.name;
  if (walkDefinition(x, file, line)) return;
  switch (name) {
    case "QUOTE":
      walkData(a[1], file, line);
      return;
    case "DIRECTOR-SYMBOL-FOR-EVAL":
    case "SHARP-EVAL":
    case "DIRECTOR-SYMBOL-FOR-UNPACK":
      walkCode(a[1], file, line);
      return;
    case "DIRECTOR-SYMBOL-FOR-VALUE":
      return;
    case "FUNCTION":
      if (a[1] instanceof Sym) addCall(a[1], file, line);
      else walkCode(a[1], file, line);
      return;
    case "LAMBDA":
      walkBody(a.slice(2), file, line);
      return;
    case "COND":
      for (const clause of a.slice(1)) walkBody(toArray(clause), file, line);
      return;
    case "LET":
    case "LET*":
    case "LET-FILES":
      for (const b of toArray(a[1])) if (b instanceof Cons) walkBody(toArray(b).slice(1), file, line);
      walkBody(a.slice(2), file, line);
      return;
    case "DO":
      if (a[1] instanceof Sym && !isSym(a[1], "NIL")) {
        walkBody(a.slice(2), file, line); // old-style (do var init step test body...)
      } else {
        for (const b of toArray(a[1])) if (b instanceof Cons) walkBody(toArray(b).slice(1), file, line);
        walkBody(toArray(a[2]), file, line);
        walkBody(a.slice(3), file, line);
      }
      return;
    case "PROG":
      walkBody(a.slice(2), file, line);
      return;
    case "SETQ":
    case "SETQ-IF-UNBOUND":
      for (let i = 2; i < a.length; i += 2) walkCode(a[i], file, line);
      return;
    case "CASEQ":
    case "SELECTQ":
      walkCode(a[1], file, line);
      for (const clause of a.slice(2)) walkBody(toArray(clause).slice(1), file, line);
      return;
  }
  if (IGNORE_ARGS.has(name)) return;
  addCall(head, file, line);
  if (name === "DO-AS-IF-YOU-WERE") {
    // (do-as-if-you-were ACTOR RECEIVER word word ...)
    walkMessage(listFrom(a.slice(3)), file, line);
    return;
  }
  if (ASK_FORMS.has(name)) {
    // (ask ACTOR word word ...): the actor may be computed; the rest is a message
    if (!(a[1] instanceof Sym)) walkData(a[1], file, line);
    walkMessage(listFrom(a.slice(2)), file, line);
    return;
  }
  if (MAPPERS.has(name) && a[1] instanceof Cons && isSym(a[1].car, "QUOTE") && a[1].cdr.car instanceof Sym) {
    addCall(a[1].cdr.car, file, line); // (mapcar 'f ...)
  }
  walkBody(a.slice(1), file, line);
}

function listFrom(arr) {
  let r = NIL;
  for (let i = arr.length - 1; i >= 0; i--) r = new Cons(arr[i], r);
  return r;
}

// ---------------------------------------------------------------- run

const readErrors = [];
const studied = [...ANI_FILES, ...DRIVER_FILES, ...DIRECTOR_FILES];
const formsByFile = new Map();
for (const path of studied) {
  const forms = readForms(path);
  if (forms.error) {
    readErrors.push({ path, error: forms.error });
    continue;
  }
  formsByFile.set(path, forms);
  for (const { form, line } of forms) {
    if (form instanceof Cons && form.car instanceof Sym) {
      if (!walkDefinition(form, path, line)) walkCode(form, path, line);
    }
  }
}

// Same-named definitions in other versions (regex: these files are older or newer dialects).
const otherDefs = new Map();
const defRe = /\((?:defun|define-function|define-form|define-method-helper|macro|defmacro|define-macro|define-do-now-macro)\s+\(?\s*([^\s()]+)/gi;
for (const path of OTHER_VERSIONS) {
  const { text } = decodeItsText(readFileSync(path));
  for (const m of text.matchAll(defRe)) {
    const n = m[1].toUpperCase();
    if (!otherDefs.has(n)) otherDefs.set(n, new Set());
    otherDefs.get(n).add(path.replace("original/", ""));
  }
}

// Mentions in the macro-expanded Director files.
const expandedText = EXPANDED_FILES.map((p) => decodeItsText(readFileSync(p)).text.toUpperCase()).join("\n");
const mentionedInExpanded = (n) => new RegExp(`[\\s(']${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s)]`).test(expandedText);

// Mentions in the Director Guides (OCR text).
const guides = ["sources/text/AIM-482.txt", "sources/text/AIM-482b.txt"].filter(existsSync).map((p) => readFileSync(p, "utf8").toUpperCase());
const inGuide = (n) => guides.some((g) => g.includes(n.length > 3 ? n : ` ${n} `));

// Atom names in the compiled FASLs on tape 7005017 (crude: runs of ASCII characters).
const faslAtoms = new Set();
for (const f of readdirSync("original/7005017").filter((f) => f.endsWith(".fasl"))) {
  const b = readFileSync(`original/7005017/${f}`).toString("latin1");
  for (const m of b.matchAll(/[A-Z0-9*$:?%&<>=+\-\/\\.]{2,}/g)) faslAtoms.add(m[0]);
}

function classify(name) {
  if (defs.has(name)) return "defined";
  if (directorSyntax.has(name)) return "syntax";
  if (lostDefs.has(name) && !(lostDefs.get(name).paren && builtins.has(name))) return "lost";
  if (builtins.has(name)) return "builtin";
  if (environment.has(name)) return "environment";
  if (turtle.has(name)) return "turtle";
  return "unknown";
}

const rows = [];
for (const [name, sites] of calls) {
  const cls = classify(name);
  rows.push({
    name,
    class: cls,
    calls: sites.length,
    files: [...new Set(sites.map((s) => s.file.replace("original/7005017/", "")))],
    firstSite: `${sites[0].file.replace("original/", "")}:${sites[0].line}`,
    lostIn: lostDefs.get(name)?.file || null,
    lostKind: lostDefs.get(name)?.kind || null,
    otherVersions: otherDefs.has(name) ? [...otherDefs.get(name)] : [],
    inExpanded: mentionedInExpanded(name),
    inFasl: faslAtoms.has(name),
    inGuide: inGuide(name),
    autoload: autoloads.get(name) || null,
  });
}
rows.sort((x, y) => y.calls - x.calls);

// Lost definitions that nothing surviving calls (still part of the runtime).
const uncalledLost = [...lostDefs.entries()].filter(([n]) => !calls.has(n)).map(([n, d]) => ({ name: n, ...d }));

writeFileSync(
  "reports/xref.json",
  JSON.stringify({ readErrors, rows, uncalledLost, actors: Object.fromEntries(actors), methods, lostFiles: lostFiles.map((t) => ({ file: t.file, defs: t.defs })) }, null, 1),
);

// ---------------------------------------------------------------- report

const by = (c) => rows.filter((r) => r.class === c);
const count = (c) => by(c).length;
const md = [];
md.push("# Cross-reference: what Ani and Director call, and where it's defined", "");
md.push(`*Generated by \`node tools/xref.mjs\`. Studied: ${studied.length - readErrors.length} files (Ani's 31, her 3 driver files, and the surviving Director files including KEN1;DRECT).*`, "");
md.push("## Summary", "");
md.push("| Class | Distinct names called | Meaning |", "|---|---|---|");
md.push(`| defined | ${count("defined")} | defined in a surviving file |`);
md.push(`| lost | ${count("lost")} | defined in a KEN1; file that did not survive |`);
md.push(`| builtin | ${count("builtin")} | MacLisp primitive |`);
md.push(`| turtle | ${count("turtle")} | LLOGO TV turtle primitive |`);
md.push(`| environment | ${count("environment")} | 1979 environment only (pretty printer, editor, XGP, TV setup); not needed |`);
md.push(`| syntax | ${count("syntax")} | Director syntax read by the method-defining macros |`);
md.push(`| unknown | ${count("unknown")} | none of the above; needs a look |`, "");
md.push(`Also: ${actors.size} actors defined, ${methods.length} methods defined with define-method and its relatives, ${defs.size} functions and macros defined.`, "");
if (readErrors.length) {
  md.push("Files the reader could not read:", "");
  for (const e of readErrors) md.push(`- \`${e.path}\`: ${e.error}`);
  md.push("");
}

md.push("## The lost runtime", "");
md.push(`The 1979 tags table lists ${[...lostDefs.keys()].length} definitions in the KEN1; files that did not survive (not counting KEN1;DRECT, which did). The surviving code calls ${count("lost")} of them directly; those are the first things to rebuild. The rest are used inside the lost files themselves, or not at all by Ani.`, "");
md.push("### Called by the surviving code", "");
md.push("Columns:", "");
md.push("- **Calls**: call sites in the surviving code");
md.push("- **Other versions**: a same-named definition in an older or newer version");
md.push("- **Exp**: mentioned in the macro-expanded Director files");
md.push("- **Fasl**: appears as an atom in a compiled FASL on tape 7005017, so compiled code probably refers to it at run time (a function rather than a macro that was expanded away)");
md.push("- **Guide**: mentioned in the Director Guide", "");
md.push("| File | Name | Kind | Calls | First call site | Other versions | Exp | Fasl | Guide |", "|---|---|---|---|---|---|---|---|---|");
const yes = (b) => (b ? "✓" : "");
const lostRows = by("lost").sort((x, y) => (x.lostIn === y.lostIn ? y.calls - x.calls : x.lostIn.localeCompare(y.lostIn)));
for (const r of lostRows) {
  md.push(`| ${r.lostIn} | \`${r.name.toLowerCase()}\` | ${r.lostKind} | ${r.calls} | ${r.firstSite} | ${r.otherVersions.join(", ")} | ${yes(r.inExpanded)} | ${yes(r.inFasl)} | ${yes(r.inGuide)} |`);
}
md.push("");
md.push("### Not called directly by the surviving code", "");
const uncalledByFile = new Map();
for (const u of uncalledLost) {
  if (!uncalledByFile.has(u.file)) uncalledByFile.set(u.file, []);
  uncalledByFile.get(u.file).push(u.name.toLowerCase());
}
for (const [f, names] of uncalledByFile) md.push(`- **${f}** (${names.length}): ${names.map((n) => `\`${n}\``).join(", ")}`);
md.push("");

md.push("## Unknown names", "");
md.push("Called but not defined in any surviving file, not in the lost files' tags, and not a known MacLisp or TV turtle primitive. Some are MacLisp primitives missing from the list; some may be defined at run time (for example by `define-abbreviation`); some may be real gaps.", "");
md.push("| Name | Calls | First call site | Other versions | Fasl | Guide |", "|---|---|---|---|---|---|");
for (const r of by("unknown")) {
  md.push(`| \`${r.name.toLowerCase()}\` | ${r.calls} | ${r.firstSite} | ${r.otherVersions.join(", ")} | ${r.inFasl ? "✓" : ""} | ${r.inGuide ? "✓" : ""} |`);
}
md.push("");

md.push("## Most-called names", "");
md.push("| Name | Class | Calls | Defined or lost in |", "|---|---|---|---|");
for (const r of rows.slice(0, 60)) {
  const where = r.class === "defined" ? defs.get(r.name)[0].file.replace("original/", "") : r.lostIn || "";
  md.push(`| \`${r.name.toLowerCase()}\` | ${r.class} | ${r.calls} | ${where} |`);
}
md.push("");
writeFileSync("reports/XREF.md", md.join("\n"));

console.log(`calls: ${rows.length} distinct names; defined ${count("defined")}, lost ${count("lost")}, builtin ${count("builtin")}, turtle ${count("turtle")}, unknown ${count("unknown")}`);
console.log(`lost definitions not called by surviving code: ${uncalledLost.length}`);
console.log(`actors ${actors.size}, methods ${methods.length}, functions ${defs.size}; read errors: ${readErrors.length}`);
