// The revival's knowledge (KNOW: src/director/revive/know*.lisp, REVIVE;KNOW and its
// parts), indexed for the film page and the tests: every piece of knowledge, where it is
// (file and line) and why (its ";;why:" line), and the words Ani knows with KNOW on, with
// the neighbor and opposite links as DESCRIPTOR leaves them once it has spread each link
// to the neighbors' neighbors and the opposites' opposites (char.2:111-131).
//
//   knowIndex(root) -> {
//     files:     { know: { id: "revive-know", path }, knowds: ..., ... }
//     words:     { gentle: { kind, suggests, establishes?, borrows?, file, line, why,
//                            neighbors, opposites }, ... }   KNOW's own words
//     knowledge: [ { source, element, value, strength, file, line, why, verb?, through?,
//                feeling? } ]
//                one entry for each suggestion KNOW gives a word (its own or one of Ken's),
//                its line the (for ...) clause's and its why the definition's:
//                element is a dynamics element ("speed"), or "establish" with the convey
//                verb it suggests ("verb": "follows") and, for a verb bound to someone found
//                by a generator, "through": "enemy-of"
//     verbs:     { helps: { method: "helps-along", strength, file, line, why, isNew }, ... }
//                the convey verbs KNOW gives a way of showing
//     methods:   { "helps-along": { file, line, why, estimate, run, activities }, ... }
//                its display methods, with the lines of their receivers and the names of
//                the walks (activities) they plan
//     feelings:  { pride: { file, line, why, levels, changes: [{ element, kind, amount
//                (change) or to (change-to), strength, line }] }, ... }
//     sharing:   { file, line, why }   a word with no way of showing itself borrowing its
//                neighbors' (REVIVE;KNOW)
//     links:     { shy: { neighbors: [...], opposites: [...] }, ... }   Ken's words whose
//                links KNOW changes, as they are once spread (CINDY's shy gains timid)
//     vocabulary: { word: { kind | kindByRelation, suggests, revival?, file, line,
//                  neighbors, opposites } }  every word Ani knows with KNOW on (Ken's
//                  DSCRP and RELATE, and KNOW's), each with its spread links
//   }
//
// The vocabulary is in the shape of tools/build-film-app.mjs's vocabulary() (the page's
// DATA.words), but with the links as spread, not only as written, and revival: true on
// KNOW's words. test/know.test.js checks the links against a running Lisp's.
// Usage: node tools/know-index.mjs [--json]   prints a summary, or the index as JSON
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { decodeItsText } from "../src/its/text.js";

export const KNOW_FILES = ["know", "knowds", "knowrl", "knowcv", "knowdi", "knowem"];

// ---------------------------------------------------------------- reading Lisp

// A small reader for MacLisp as these files write it: lists (and CMATCH's {...}, read as
// lists headed by "{"), symbols (/ escapes, |...|), and the prefixes ' ` , read as
// (quote x), (backquote x) and (comma x). Each list keeps its offset in the text.
function readForms(text) {
  let i = 0;
  const n = text.length;
  function skip() {
    for (;;) {
      while (i < n && /\s/.test(text[i])) i++;
      if (text[i] === ";") { while (i < n && text[i] !== "\n") i++; continue; }
      return;
    }
  }
  function read() {
    skip();
    if (i >= n) return undefined;
    const c = text[i];
    if (c === "(" || c === "{") {
      const close = c === "(" ? ")" : "}";
      const list = [];
      list.at = i;
      if (c === "{") list.push("{");
      i++;
      for (;;) {
        skip();
        if (text[i] === close) { i++; return list; }
        if (i >= n) return list;
        list.push(read());
      }
    }
    if (c === "'" || c === "`" || c === ",") {
      i++;
      const x = read();
      return [c === "'" ? "quote" : c === "`" ? "backquote" : "comma", x];
    }
    if (c === '"') {
      const start = i++;
      while (i < n && text[i] !== '"') { if (text[i] === "/") i++; i++; }
      i++;
      return text.slice(start, i);
    }
    let s = "";
    while (i < n && !/[\s(){}'`,;]/.test(text[i])) {
      if (text[i] === "/") { s += text[i + 1]; i += 2; continue; }
      if (text[i] === "|") { const j = text.indexOf("|", i + 1); s += text.slice(i + 1, j); i = j + 1; continue; }
      s += text[i++].toLowerCase();
    }
    return s;
  }
  const forms = [];
  for (;;) {
    const f = read();
    if (f === undefined) break;
    forms.push(f);
  }
  return forms;
}

// Print a form back as Lisp, lower case, with ' ` , as written.
function show(x) {
  if (!Array.isArray(x)) return String(x);
  if (x[0] === "quote" && x.length === 2) return "'" + show(x[1]);
  if (x[0] === "backquote" && x.length === 2) return "`" + show(x[1]);
  if (x[0] === "comma" && x.length === 2) return "," + show(x[1]);
  if (x[0] === "{") return "{" + x.slice(1).map(show).join(" ") + "}";
  return "(" + x.map(show).join(" ") + ")";
}
const unquote = (x) => (Array.isArray(x) && x[0] === "quote" ? x[1] : x);
// The value after an indicator in a plist-like list: (method: type convey value (...)).
const prop = (list, key) => {
  if (!Array.isArray(list)) return undefined;
  const k = list.indexOf(key);
  return k > 0 ? list[k + 1] : undefined;
};
// Every list in a form, depth first.
function* lists(x) {
  if (!Array.isArray(x)) return;
  yield x;
  for (const y of x) yield* lists(y);
}

function lispFile(root, name) {
  const path = `src/director/revive/${name}.lisp`;
  const text = readFileSync(`${root}/${path}`, "utf8").replace(/\r\n?/g, "\n");
  const starts = [0];
  for (let k = 0; k < text.length; k++) if (text[k] === "\n") starts.push(k + 1);
  const lineAt = (pos) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= pos) lo = mid; else hi = mid - 1; }
    return lo + 1;
  };
  const lines = text.split("\n");
  // the ;;why: lines right above line (1-based), joined
  const whyAbove = (line) => {
    const out = [];
    for (let k = line - 2; k >= 0 && /^\s*;;why:/.test(lines[k]); k--) out.unshift(lines[k].replace(/^\s*;;why:\s*/, ""));
    return out.join(" ") || null;
  };
  return { name, path, text, forms: readForms(text), lineAt, whyAbove, id: `revive-${name}` };
}

// ---------------------------------------------------------------- Ken's words and their links

const KINDS = {
  "physical-character-descriptor": "physical", "personality-character-descriptor": "personality",
  "movement-character-descriptor": "movement", "odds+ends-character-descriptor": "role",
  "affection-relationship-descriptor": "relationship", "domination-relationship-descriptor": "relationship",
};
const LINK = /\((?:uncompiled-)?ask ([a-z+-]+) add ([a-z+-]+) to your list of (opposites|neighbors)\)/g;

// Ken's words, as build-film-app's vocabulary() reads them, and his links in file order.
function kensWords(root) {
  const words = {};
  const links = [];
  for (const file of ["dscrp.17", "relate.22"]) {
    const text = decodeItsText(readFileSync(`${root}/original/7005017/${file}`)).text;
    const defs = [...text.matchAll(/^\(define ([a-z+-]+) ([a-z+-]+)/gm)];
    defs.forEach((m, k) => {
      if (!KINDS[m[2]]) return;
      const block = text.slice(m.index, k + 1 < defs.length ? defs[k + 1].index : text.length);
      words[m[1]] = { kind: KINDS[m[2]], ...(block.includes("(process suggestions") ? { suggests: true } : {}), file, line: text.slice(0, m.index).split("\n").length };
    });
    for (const m of text.matchAll(LINK)) links.push({ file, from: m[1], to: m[2], type: m[3] });
  }
  return { words, links };
}

// DESCRIPTOR's add ... to your list of opposites / neighbors (char.2:111-131): a new link
// goes on the front of the list, the other word links back, and the link spreads: an
// opposite to the word's neighbors, a neighbor to its neighbors as a neighbor and to its
// opposites as an opposite. A word met for the first time is made by the linking word's
// parent ("if new make", char.2:117, 126), so it takes that word's kind.
export function spreadLinks(links, kindOf = () => null) {
  const net = {};
  const made = {};
  const node = (w) => (net[w] ||= { neighbors: [], opposites: [] });
  const make = (by, w) => { if (!net[w] && !made[w]) made[w] = kindOf(by) || made[by] || null; node(w); };
  function addOpposite(self, d) {
    const me = node(self);
    if (me.opposites.includes(d) || d === self) return;
    me.opposites = [d, ...me.opposites];
    make(self, d);
    addOpposite(d, self);
    for (const n of [...me.neighbors]) addOpposite(n, d);
  }
  function addNeighbor(self, d) {
    const me = node(self);
    if (me.neighbors.includes(d) || d === self) return;
    me.neighbors = [d, ...me.neighbors];
    make(self, d);
    addNeighbor(d, self);
    for (const n of [...me.neighbors]) addNeighbor(n, d);
    for (const o of [...me.opposites]) addOpposite(o, d);
  }
  for (const l of links) (l.type === "opposites" ? addOpposite : addNeighbor)(l.from, l.to);
  return { net, made };
}

// ---------------------------------------------------------------- KNOW's knowledge

export function knowIndex(root = ".") {
  const f = Object.fromEntries(KNOW_FILES.map((name) => [name, lispFile(root, name)]));
  const where = (file, list) => ({ file, line: f[file].lineAt(list.at), why: f[file].whyAbove(f[file].lineAt(list.at)) });
  const words = {}, knowledge = [], verbs = {}, methods = {}, feelings = {};
  const knowLinks = [];

  // A suggestion as DESCRIPTOR's process suggestion takes it, (for element value strength
  // s), for word, from the definition at list.
  // Its line is the (for ...) clause's; its why, the definition's.
  function suggestionFrom(word, forClause, definedAt) {
    const [, element, value, , strength] = forClause;
    const at = { ...definedAt, line: f[definedAt.file].lineAt(forClause.at) };
    if (!Array.isArray(element)) {
      return { source: word, element, value: show(value), strength: show(unquote(strength)), ...at };
    }
    // (establish ...): a convey method, perhaps bound to someone a generator finds
    const method = unquote(value);
    const shown = prop(method, "value");
    const bind = Array.isArray(shown) && shown[0] === "bind" ? shown : null;
    const verbForm = bind ? bind[bind.length - 1] : shown;
    const generator = bind ? [...lists(bind[1])].find((l) => /-of$/.test(l[0]) && l[0] !== "relationship-of") : null;
    return { source: word, element: "establish", verb: verbForm[0], value: show(verbForm), strength: show(unquote(strength)), ...(generator ? { through: generator[0] } : {}), ...at };
  }

  // each list in the parts' definitions, wherever it is nested
  for (const name of ["knowds", "knowrl", "knowcv", "knowdi", "knowem"]) {
    for (const form of f[name].forms) {
      for (const l of lists(form)) {
        const head = l[0];
        // (define word kind-descriptor (process suggestions (for ...) ...))
        if (head === "define" && KINDS[l[2]]) {
          const at = where(name, l);
          const ps = l.slice(3).find((x) => Array.isArray(x) && x[0] === "process" && x[1] === "suggestions");
          const fors = ps ? ps.slice(2) : [];
          const own = fors.map((c) => suggestionFrom(l[1], c, at));
          words[l[1]] = { kind: KINDS[l[2]], ...(own.some((s) => s.element !== "establish") ? { suggests: true } : {}), ...(own.some((s) => s.element === "establish") ? { establishes: own.filter((s) => s.element === "establish").map((s) => s.verb) } : {}), ...at };
          knowledge.push(...own);
        }
        // (uncompiled-ask word process suggestions (for ...)): Ken's word, KNOW's suggestion
        if ((head === "uncompiled-ask" || head === "ask") && l[2] === "process" && l[3] === "suggestions") {
          const at = where(name, l);
          for (const c of l.slice(4)) knowledge.push(suggestionFrom(l[1], c, at));
        }
        // likes: an if-asked-about suggestion: item, as put-suggestion-in-source makes one
        if ((head === "uncompiled-ask" || head === "ask") && l[2] === "add" && Array.isArray(l[3]) && l[3][0] === "if-asked-about") {
          const at = where(name, l);
          const item = unquote(l[3][2]);
          const method = prop(item, "value");
          const verbForm = prop(method, "value");
          knowledge.push({ source: l[1], element: "establish", verb: verbForm[0], value: show(verbForm), strength: show(prop(item, "strength")), ...at });
        }
        // links: (ask a add b to your list of opposites)
        if ((head === "ask" || head === "uncompiled-ask") && l[2] === "add" && typeof l[3] === "string" && l[4] === "to" && /^(opposites|neighbors)$/.test(l[8])) {
          knowLinks.push({ file: name, line: f[name].lineAt(l.at), from: l[1], to: l[3], type: l[8] });
        }
        // (define-receiver (yield suggestions for {and ?task (convey (verb ...))}) verb '(...))
        if (head === "define-receiver" && Array.isArray(l[1]) && l[1][0] === "yield" && l[1][1] === "suggestions") {
          const convey = [...lists(l[1])].find((x) => x[0] === "convey");
          const verb = convey && convey[1][0];
          const suggestion = unquote(l[3])[0];
          const method = prop(prop(suggestion, "value"), "value");
          verbs[verb] = { ...(verbs[verb] || {}), method: method[0], value: show(method), strength: show(prop(suggestion, "strength")), ...where(name, l) };
        }
        // (define follows moves): a verb that is new
        if (head === "define" && name === "knowcv" && typeof l[2] === "string" && !KINDS[l[2]]) {
          verbs[l[1]] = { ...(verbs[l[1]] || {}), isNew: true, kindOf: l[2], defined: where(name, l) };
        }
        // (define method display-method ...), its receivers, and the walks it names
        if (head === "define" && l[2] === "display-method") methods[l[1]] = { ...(methods[l[1]] || {}), ...where(name, l), activities: [] };
        if (head === "define-receiver" && Array.isArray(l[1]) && methods[l[l.length > 2 ? 2 : 1]] !== undefined) {
          const actor = l[2];
          if (l[1][0] === "estimate") methods[actor].estimate = f[name].lineAt(l.at);
          if (l[1][0] === "run") {
            methods[actor].run = f[name].lineAt(l.at);
            const names = [...lists(l)].filter((x) => x[0] === "activity-name-of").map((x) => unquote(x[1]));
            // REVIVE;MEND6's bring-on walks the other on first, as getting-on-stage
            if ([...lists(l)].some((x) => x[0] === "bring-on")) names.unshift("getting-on-stage");
            methods[actor].activities = names;
          }
        }
        // (define feeling emotion (process suggestions (for (establish (emotional-state ...)) ...)))
        if (head === "define" && l[2] === "emotion") {
          const at = where(name, l);
          const ps = l.slice(3).find((x) => Array.isArray(x) && x[0] === "process");
          const changes = ps.slice(2).map((c) => {
            const v = prop(unquote(c[2]), "value");
            const element = prop(v, "element")[1];
            const line = f[name].lineAt(c.at);
            return v[0] === "change:" ? { element, kind: "change", amount: prop(v, "amount")[0], strength: show(unquote(c[4])), line }
              : { element, kind: "change-to", to: show(prop(v, "new-value")), strength: show(unquote(c[4])), line };
          });
          feelings[l[1]] = { ...at, levels: ["(positive low)", "(positive medium)", "(positive high)", "low", "medium", "high"], changes };
          for (const c of changes) knowledge.push({ source: l[1], element: c.element, value: c.kind === "change" ? `(${c.amount} level)` : c.to, strength: c.strength, feeling: true, ...at, line: c.line });
        }
      }
    }
  }
  for (const v of Object.values(verbs)) if (v.kindOf && !v.isNew) delete v.kindOf;

  // sharing: the comment block on (dscrp.17:183) in REVIVE;KNOW, and the wrapper
  const sharingLine = f.know.text.split("\n").findIndex((t) => t.includes('"bad ... should get most from its neighbor"')) + 1;
  const sharing = { file: "know", line: sharingLine, why: "\"bad ... should get most from its neighbor\" (dscrp.17:183): a word with no way of showing itself borrows each neighbor's, at the same strength, with the source (neighbor-of word neighbor), as pass 1 borrows a neighbor's suggestions for how a character moves (cosug.215:84-88)" };

  // the links, Ken's and KNOW's, spread as DESCRIPTOR spreads them, in the order they are
  // made: DSCRP's, then KNOWDS's (read in once DSCRP has loaded), RELATE's, KNOWRL's
  const ken = kensWords(root);
  const ordered = [
    ...ken.links.filter((l) => l.file === "dscrp.17"), ...knowLinks.filter((l) => l.file === "knowds"),
    ...ken.links.filter((l) => l.file === "relate.22"), ...knowLinks.filter((l) => l.file === "knowrl"),
  ];
  const kenOnly = spreadLinks(ken.links).net;
  const kindOf = (w) => (words[w] || ken.words[w] || {}).kind || null;
  const { net, made } = spreadLinks(ordered, kindOf);
  for (const [w, v] of Object.entries(words)) Object.assign(v, net[w] || { neighbors: [], opposites: [] });
  // a word with no way of showing itself borrows its neighbors' (REVIVE;KNOW)
  for (const w of Object.keys(words)) {
    if (!words[w].establishes && (net[w]?.neighbors || []).length) words[w].borrows = net[w].neighbors;
  }
  const links = {};
  for (const [w, v] of Object.entries(net)) {
    if (words[w]) continue;
    const before = kenOnly[w] || { neighbors: [], opposites: [] };
    if (JSON.stringify(before) !== JSON.stringify(v)) links[w] = v;
  }

  // every word Ani knows with KNOW on
  const vocabulary = {};
  for (const [w, v] of Object.entries(ken.words)) vocabulary[w] = { ...v };
  for (const [w, v] of Object.entries(words)) vocabulary[w] = { kind: v.kind, ...(v.suggests ? { suggests: true } : {}), revival: true, file: v.file, line: v.line };
  for (const k of knowledge) if (vocabulary[k.source] && !vocabulary[k.source].revival && k.element === "establish") (vocabulary[k.source].revivalEstablishes ||= []).push(k.verb);
  for (const [w, v] of Object.entries(net)) {
    const entry = (vocabulary[w] ||= {});
    if (!entry.kind && made[w]) entry.kindByRelation = made[w];
    if (v.neighbors.length) entry.neighbors = v.neighbors;
    if (v.opposites.length) entry.opposites = v.opposites;
  }
  // likes is PREREQ's prerequisite, a relationship a story may name (prereq.19:110-120)
  if (!vocabulary.likes) vocabulary.likes = { kind: "relationship", file: "prereq.19", line: 110, revivalEstablishes: knowledge.filter((k) => k.source === "likes").map((k) => k.verb) };

  const files = Object.fromEntries(KNOW_FILES.map((name) => [name, { id: f[name].id, path: f[name].path }]));
  return { files, words, knowledge, verbs, methods, feelings, sharing, links, vocabulary };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const index = knowIndex(fileURLToPath(new URL("..", import.meta.url)));
  if (process.argv.includes("--json")) console.log(JSON.stringify(index, null, 1));
  else {
    console.log(`words (${Object.keys(index.words).length}): ${Object.entries(index.words).map(([w, v]) => `${w} (${v.kind}${v.suggests ? ", suggests" : ""}${v.establishes ? `, establishes by ${v.establishes.join(", ")}` : ""}${v.borrows ? `, borrows from ${v.borrows.join(", ")}` : ""})`).join("; ")}`);
    console.log(`knowledge: ${index.knowledge.length} suggestions`);
    console.log(`verbs: ${Object.entries(index.verbs).map(([v, x]) => `${v} -> ${x.method}`).join(", ")}`);
    console.log(`methods: ${Object.entries(index.methods).map(([m, x]) => `${m} (${x.activities.join(", ")})`).join("; ")}`);
    console.log(`feelings: ${Object.keys(index.feelings).join(", ")}`);
    console.log(`Ken's words whose links change: ${Object.entries(index.links).map(([w, v]) => `${w} (neighbors ${v.neighbors.join(" ") || "-"}; opposites ${v.opposites.join(" ") || "-"})`).join("; ")}`);
  }
}
