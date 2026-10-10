// Check the knowledge Ani's looks come from (REVIVE;APSUG) against Ken's legitimacy rule:
// "The only legitimate changes that can be made so that Ani makes choices more to my
// liking are to add obvious information that was lacking ... Other changes would
// constitute cheating in that I would be arranging for Ani to do what I want without
// improving the reasoning" (AI-TR-540 p. 189). Ken's decision of 9 October 2026
// (reports/chapter-x/PLAN.md, "Decisions" 4): the revival may add knowledge the thesis
// doesn't state, labeled the revival's with its reason, and any entry that reproduces
// his 1978 looks is dropped. His looks are initialize-characters' shapes and sizes
// (aninit.65:36-47; .05 is every character's size, dichar.103:10, so not one he chose)
// and running-color's colors (aninit.65:83-87), src/pipeline.js KEN_LOOKS.
//
// A piece of knowledge reproduces a 1978 look if it gives back what Ken drew:
//   1. alone: for every one of Ken's four characters it reaches (through the
//      character's own words, as CHAR's beautiful brings graceful, and the neighbors
//      and opposites of them, as COSUG reaches them; through the relationships the
//      story gives; through the character's dynamics in CP 29; through the film's
//      levels) where Ken chose a value, the value it suggests is the one Ken's
//      drawing has, and for at least one of them it is what set that character apart
//      in Ken's drawing (a value no other of the four has: the stepmother's size, a
//      red);
//   2. or in Ani's result: one of her looks is Ken's, a shape or a size he chose, and
//      the knowledge is among the sources of the suggestion that won that choice
//      (followed into the relative choice points among them).
// The revival's own knowledge (its evidence (why ...)) that does either fails the
// check. Knowledge that is Ken's own (its evidence his thesis or his code) is listed,
// not failed: it is his, as the plan keeps p. 238's "strong suggests large".
// Prints, for each character, Ken's look beside Ani's, with the sources of Ani's.
//
// Usage: node tools/check-appear.mjs [--run]
//   Ani's result is reports/ext/appear/pass1.json (tools/run-pass1.mjs --extensions
//   appear --glass-box), or, with --run, a fresh pass 1.
// Exits non-zero if a piece of the revival's knowledge reproduces a 1978 look.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot, pass1, KEN_LOOKS } from "../src/pipeline.js";
import { collectKnowledge, plistGet } from "../src/glassbox-pass1.js";
import { choicesOfItsFile } from "./choices.mjs";

const opposite = (v) => (v === "high" ? "low" : v === "low" ? "high" : v);

// What the check needs to know of Ken's Cinderella, from a Lisp with APPEAR that has
// loaded CINDY as pass 1 does (DATEST's init) and ELEMNT (the shape experts): the
// knowledge, each character's words with the neighbors and opposites of each, the
// relationships, the film's levels, the shape experts' shapes and the size table.
export function gatherWorld(L) {
  const lisp = (x) => L.print(x).toLowerCase();
  const list = (src) => L.toArray(L.evalString(src)).filter((x) => x !== L.NIL);
  const characters = list("(reverse (ask character recall your offspring))").map(lisp);
  const words = {};
  const net = {};
  const learn = (d) => {
    if (net[d]) return;
    const exists = L.evalString(`(exists? '${d})`) !== L.NIL;
    net[d] = { neighbors: exists ? list(`(ask ${d} recall your neighbors)`).map(lisp) : [], opposites: exists ? list(`(ask ${d} recall your opposites)`).map(lisp) : [] };
  };
  for (const c of characters) {
    words[c] = list(`(mapcar (function (lambda (d) (get d 'descriptor))) (ask ${c} collect items memorized matching (description: type ? descriptor ? source ?)))`).map(lisp);
    for (const d of words[c]) learn(d);
  }
  const relationships = [];
  for (const a of characters) for (const b of characters) {
    if (a === b || L.evalString(`(exists? '(relationship-of ${a} ${b}))`) === L.NIL) continue;
    relationships.push({ of: [a, b], words: list(`(mapcar (function (lambda (d) (get d 'descriptor))) (ask (relationship-of ${a} ${b}) collect items memorized matching (description: type ? descriptor ? source ?)))`).map(lisp) });
  }
  const levels = {};
  for (const level of ["flashiness", "complexity", "obviousness", "variety", "originality"]) levels[level] = lisp(L.evalString(`(ask ,(ask film recall your current-film) recall your (${level} level))`));
  const shapes = {};
  for (const expert of list("(ask shape-expert recall your offspring)")) {
    for (const s of L.toArray(L.evalString(`(ask ${lisp(expert)} recall your shapes)`))) {
      const get = (k) => lisp(plistGet(L, s, k));
      shapes[get("name")] = { "shape-jaggedness": get("shape-jaggedness"), "shape-complexity": get("shape-complexity") };
    }
  }
  const sizes = Object.fromEntries(L.toArray(L.evalString("(get 'size 'appearance-numbers)")).map((p) => { const [v, n] = L.toArray(p); return [lisp(v), L.num.val(n)]; }));
  return { characters, words, net, relationships, levels, shapes, sizes, knowledge: collectKnowledge(L) };
}

export function bootWorld() {
  const L = boot(makeProjectFileSystem(), { extensions: ["appear"] });
  L.evalString("(load '|ken;datest >|)");
  L.evalString("(init nil)");
  L.evalString("(load '|ken;elemnt >|)");
  return gatherWorld(L);
}

// Ken's 1978 looks as element values: each shape where the experts place it, a size
// he set (not .05, every character's), and his colors; and which of them set a
// character apart (no other of the four had it).
export function kensValues(world) {
  const values = {};
  for (const [c, look] of Object.entries(KEN_LOOKS)) {
    const v = { ...(world.shapes[look.shape] || {}), "color-hue": look.color };
    if (look.aniSize !== world.sizes.medium) v.size = Object.keys(world.sizes).find((k) => world.sizes[k] === look.aniSize);
    v.aniSize = look.aniSize;
    values[c] = v;
  }
  const apart = (c, element) => values[c][element] !== undefined && Object.keys(values).every((o) => o === c || values[o][element] !== values[c][element]);
  return { values, apart };
}

// Where a piece of knowledge reaches Ken's characters and what it suggests for each:
// [{ character, element, value }], value a relation for a relative element.
export function reach(entry, world, cp29) {
  const out = [];
  const elements = Array.isArray(entry.element) ? entry.element : [entry.element];
  if (entry.kind === "descriptor") {
    for (const c of world.characters) {
      for (const w of world.words[c] || []) {
        if (w === entry.source) out.push({ character: c, element: entry.element, value: entry.value, through: w });
        if ((world.net[w]?.neighbors || []).includes(entry.source)) out.push({ character: c, element: entry.element, value: entry.value, through: `neighbor of ${w}` });
        if ((world.net[w]?.opposites || []).includes(entry.source)) out.push({ character: c, element: entry.element, value: opposite(entry.value), through: `opposite of ${w}` });
      }
    }
  } else if (entry.kind === "relationship") {
    for (const r of world.relationships) if (r.words.includes(entry.source)) for (const e of elements) out.push({ character: r.of[0], other: r.of[1], element: e, value: entry.value, through: `(relationship-of ${r.of.join(" ")})` });
  } else if (entry.kind === "dynamics") {
    for (const c of world.characters) {
      const v = cp29.get(`(choice-point-of ${c} ${entry.source})`);
      if (!v) continue;
      const rank = { high: "high", long: "high", medium: "medium", low: "low", short: "low" }[v];
      if (rank) out.push({ character: c, element: entry.element, value: entry.value === "opposite" ? opposite(rank) : rank, through: `its ${entry.source}, ${v}` });
    }
  } else if (entry.kind === "film") {
    const level = world.levels[entry.source.replace(/^\(|\s*level\)$/g, "")];
    const value = entry.value === "same" ? level : entry.value === "medium-unless-high" ? (level === "high" ? null : "medium") : null;
    if (value) for (const c of world.characters) out.push({ character: c, element: entry.element, value, through: `${entry.source} ${level}` });
  }
  // comparisons suggest only different-from, which says the characters differ, not how
  return out;
}

// Whether one reach agrees with Ken's drawing, and whether it is what set the
// character apart. Where Ken chose nothing (a size of .05, every character's, or an
// element his looks don't have), there is nothing to give back: unknown.
function judge(r, ken) {
  const mine = ken.values[r.character];
  if (!mine) return { unknown: true };
  if (r.other) {
    const theirs = ken.values[r.other];
    if (!theirs || !r.element.endsWith("size")) return { unknown: true };
    if (mine.size === undefined && theirs.size === undefined) return { unknown: true };
    const relation = mine.aniSize > theirs.aniSize ? "greater-than" : mine.aniSize < theirs.aniSize ? "less-than" : "same-as";
    const agrees = relation === r.value;
    return { agrees, apart: agrees && (ken.apart(r.character, "size") || ken.apart(r.other, "size")) };
  }
  if (mine[r.element] === undefined) return { unknown: true };
  const agrees = mine[r.element] === r.value;
  return { agrees, apart: agrees && ken.apart(r.character, r.element) };
}

const isTheRevivals = (evidence) => (Array.isArray(evidence) ? evidence.some(isTheRevivals) : Boolean(evidence && evidence.why));
const label = (k) => `${k.kind} ${k.source}: ${Array.isArray(k.element) ? k.element.join("/") : k.element} ${k.value} (${k.strength})`;

// 1. Each piece of knowledge alone.
export function checkAlone(world, cp29) {
  const ken = kensValues(world);
  const found = [];
  for (const k of world.knowledge) {
    const reached = reach(k, world, cp29);
    if (!reached.length) continue;
    const judged = reached.map((r) => ({ ...r, ...judge(r, ken) }));
    const known = judged.filter((r) => !r.unknown);
    if (known.length && known.every((r) => r.agrees) && known.some((r) => r.apart)) found.push({ knowledge: k, revivals: isTheRevivals(k.evidence), reached: known });
  }
  return found;
}

// 2. Ani's result: a look of hers that is Ken's, and the knowledge it came from.
// sourcesOf(choicePointName) gives the sources of its winning suggestion.
export function checkResult(world, appearances, choicePoints) {
  const ken = kensValues(world);
  const byName = new Map(choicePoints.map((cp) => [JSON.stringify(cp.name), cp]));
  const winning = (cp) => {
    const value = JSON.stringify(cp.currentChoice);
    return (cp.memory || []).find((m) => Array.isArray(m) && m[0] === "suggestion:" && JSON.stringify(m[m.indexOf("value") + 1]) === value);
  };
  // the knowledge behind a source, following relative choice points
  const knowledgeOf = (source, element, seen = new Set()) => {
    const s = typeof source === "string" ? source : JSON.stringify(source);
    if (seen.has(s)) return [];
    seen.add(s);
    const src = typeof source === "string" ? parseLisp(source) : source;
    if (typeof src === "string") return world.knowledge.filter((k) => k.kind === "descriptor" && k.source === src && k.element === element);
    if (src[0] === "neighbor-of" || src[0] === "opposite-of") return world.knowledge.filter((k) => k.kind === "descriptor" && k.source === src[2] && k.element === element);
    if (src[0] === "dynamics-of") return world.knowledge.filter((k) => k.kind === "dynamics" && k.source === src[2] && k.element === element);
    if (src[1] === "level") return world.knowledge.filter((k) => k.kind === "film" && k.source === `(${src.join(" ")})` && k.element === element);
    if (src[0] === "relative-choice-point-of") {
      const cp = byName.get(JSON.stringify(src)) || byName.get(JSON.stringify([src[0], [...src[1]].reverse(), src[2]]));
      const w = cp && winning(cp);
      if (!w) return [];
      const inner = w[w.indexOf("source") + 1];
      const sources = Array.isArray(inner) && inner[0] === "and" ? inner.slice(1) : [inner];
      return sources.flatMap((x) => {
        if (typeof x === "string") return world.knowledge.filter((k) => k.kind === "relationship" && k.source === x);
        if (x[0] === "uniqueness-summary:" && x[4] === "physical") return world.knowledge.filter((k) => k.kind === "comparison" && k.source.startsWith("(uniqueness-summary:"));
        if (x[0] === "look-alike:") return world.knowledge.filter((k) => k.kind === "comparison" && k.source === "look-alike:");
        return [];
      });
    }
    return [];
  };
  const found = [];
  for (const a of appearances.characters) {
    const kens = KEN_LOOKS[a.character];
    if (!kens) continue;
    const same = [];
    if (a.look.shape === kens.shape) same.push(["shape", ["shape-jaggedness", "shape-complexity"]]);
    if (kens.aniSize !== world.sizes.medium && a.look.aniSize === kens.aniSize) same.push(["size", ["size"]]);
    for (const [what, elements] of same) {
      const behind = elements.flatMap((e) => (a.elements[e]?.sources || []).flatMap((s) => knowledgeOf(s, e)));
      for (const k of [...new Set(behind)]) found.push({ character: a.character, what, knowledge: k, revivals: isTheRevivals(k.evidence) });
    }
  }
  return found;
}

// A printed Lisp form as JSON: symbols as lowercase strings, lists as arrays.
function parseLisp(text) {
  let i = 0;
  const read = () => {
    while (/\s/.test(text[i])) i++;
    if (text[i] === "(") {
      i++;
      const out = [];
      for (;;) {
        while (/\s/.test(text[i])) i++;
        if (text[i] === ")") { i++; return out; }
        out.push(read());
      }
    }
    let tok = "";
    while (i < text.length && !/[\s()]/.test(text[i])) tok += text[i++];
    return tok.toLowerCase();
  };
  return read();
}

// The table, Ken's look beside Ani's.
function lookTable(appearances) {
  const lines = [];
  for (const a of appearances.characters) {
    const k = KEN_LOOKS[a.character];
    const size = (n) => (n === 0.036 ? "small" : n === 0.07 ? "large" : n === 0.05 ? "medium" : String(n));
    lines.push(`${a.character.padEnd(16)} Ken 1978: ${k ? `${size(k.aniSize)} ${k.color} ${k.shape}` : "-"}`.padEnd(52) + `Ani: ${size(a.look.aniSize)} ${a.look.shape}`);
    for (const [e, x] of Object.entries(a.elements)) lines.push(`${"".padEnd(18)}${e} ${x.value}, from ${x.sources.join(", ")}`);
  }
  return lines.join("\n");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const t0 = Date.now();
  const world = bootWorld();
  const cp29 = choicesOfItsFile("original/7005017/cp.29");
  let failures = 0;
  const alone = checkAlone(world, cp29);
  console.log(`1. each of the ${world.knowledge.length} pieces of knowledge alone, against Ken's 1978 looks`);
  for (const f of alone) {
    if (f.revivals) failures++;
    console.log(`${f.revivals ? "FAIL  " : "Ken's "} ${label(f.knowledge)} gives back Ken's: ${f.reached.map((r) => `${r.character}${r.other ? ` than ${r.other}` : ""} ${r.element} ${r.value} (${r.through})`).join("; ")}`);
  }
  if (!alone.length) console.log("ok     none gives back a look of Ken's");
  let result = null;
  if (process.argv.includes("--run")) {
    const p = pass1(makeProjectFileSystem(), { extensions: ["appear"] });
    result = { appearances: p.appearances, choicePoints: p.choicePoints };
  } else if (existsSync("reports/ext/appear/pass1.json")) {
    result = JSON.parse(readFileSync("reports/ext/appear/pass1.json", "utf8"));
  }
  if (result && result.appearances) {
    const found = checkResult(world, result.appearances, result.choicePoints);
    console.log(`\n2. Ani's looks, against Ken's 1978 looks\n${lookTable(result.appearances)}\n`);
    for (const f of found) {
      if (f.revivals) failures++;
      console.log(`${f.revivals ? "FAIL  " : "Ken's "} ${f.character}'s ${f.what} is Ken's, from ${label(f.knowledge)} (${JSON.stringify(f.knowledge.evidence)})`);
    }
    if (!found.length) console.log("ok     no look of Ani's is Ken's");
  } else console.log("\n2. Ani's result: there is no reports/ext/appear/pass1.json (tools/run-pass1.mjs --extensions appear --glass-box --save); or give --run");
  console.log(failures ? `\n${failures} piece${failures > 1 ? "s" : ""} of the revival's knowledge give back Ken's 1978 looks (${((Date.now() - t0) / 1000).toFixed(0)} s)` : `\nno piece of the revival's knowledge gives back Ken's 1978 looks (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  process.exit(failures ? 1 : 0);
}
