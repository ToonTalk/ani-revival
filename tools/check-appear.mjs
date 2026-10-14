// Check the knowledge Ani's looks come from (REVIVE;APSUG) against Ken's legitimacy rule:
// "The only legitimate changes that can be made so that Ani makes choices more to my
// liking are to add obvious information that was lacking ... Other changes would
// constitute cheating in that I would be arranging for Ani to do what I want without
// improving the reasoning" (AI-TR-540 p. 189). Ken's decision of 9 October 2026
// (reports/chapter-x/PLAN.md, "Decisions" 4): the revival may add knowledge the thesis
// doesn't state, labeled the revival's with its reason, and any entry that reproduces
// his 1978 looks is dropped. His looks are initialize-characters' shapes and sizes
// (aninit.65:36-47) and running-color's colors (aninit.65:83-87), src/pipeline.js
// KEN_LOOKS. He chose the sizes too ("I choose the following shapes and sizes for
// them", p. 17), so his .05 is a size of his, medium, as his .07 is large.
//
// Each piece of knowledge is followed to Ken's four characters: through each one's own
// words (as CHAR's beautiful brings graceful), and the neighbors and opposites of them,
// as COSUG reaches them; through the relationships the story gives; through the
// character's dynamics in CP 29; through the film's levels. Each (character, element)
// it reaches is judged on its own: whether the value it suggests there is the one Ken's
// drawing has, and whether that value set the character apart in his drawing (no other
// of the four has it: the stepmother's size, every one of his shapes).
//   1. alone: a piece of knowledge that, wherever it reaches, gives Ken's value, and
//      sets at least one character apart, draws Ken's cast: it reproduces his looks.
//   2. each pair: where a piece of the revival's knowledge gives a character a value of
//      Ken's that set it apart, it is flagged; a value another of his four shares (the
//      Prince's triangle is as jagged as Cinderella's star) is listed.
//   3. combinations: where two of the revival's pieces together give a character Ken's
//      shape (one its jaggedness, the other its complexity), they are flagged.
//   4. Ani's result: each look of hers that is Ken's (a shape, a size, a hue), with
//      the knowledge among the sources of the suggestion that won it (followed into
//      the relative choice points among them). The film's variety, where it gave a
//      hue, is followed to the order it takes the hues in, which is the revival's
//      (REVIVE;COLORS :hue-order-knowledge, kind order): a hue of Ken's that set his
//      character apart, given by the variety, is the revival's order's doing, and is
//      flagged under decision 4, as a piece of the revival's knowledge is.
//   5. ablation: pass 1 is run again, with all of the knowledge, with only the
//      revival's (Ken's own left out), and without each piece of the revival's that
//      reaches anyone; each run's looks are set beside Ken's. Here a look of Ken's is
//      one that set the character apart: any of his four shapes, any of his four
//      colors' hues, the stepmother's large size (his medium, three characters' size,
//      is shown but set aside: one piece
//      changing the order of the choices can move it, as graceful's smooth moves the
//      fairy godmother's). A piece without which a look of Ken's in Ani's result goes
//      away brings that look about: it reproduces his looks. A look of Ken's that only
//      the revival's knowledge gives is flagged. The order of the hues can't be left
//      out (the film's variety needs one); instead pass 1 is run with the hues read
//      from red, as a wheel usually is, and the hues of Ken's that reading gives back
//      are shown: the reason the revival reads them from yellow.
// What fails: a piece of the revival's knowledge (its evidence (why ...)) that
// reproduces Ken's looks (1, or 5), which decision 4 drops; and anything flagged (2, 3,
// 5) that has not been reviewed: REVIEWED below gives the decision for each, and why,
// as reports/ext/appear/README.md does. Knowledge that is Ken's own (its evidence his
// thesis or his code) is listed, not failed: it is his, and decision 4 drops only the
// revival's own entries (Ken's decision of 11 October 2026, "Decisions" 6: strong's
// large size, from p. 238, may give back his stepmother's size).
// Prints, for each character, Ken's look beside Ani's, with the sources of Ani's.
//
// Usage: node tools/check-appear.mjs [--run] [--quick] [--jobs n]
//   Ani's result is reports/ext/appear/pass1.json (tools/run-pass1.mjs --extensions
//   appear --glass-box --save), or, with --run, a fresh pass 1.
//   --quick  skip the ablation (5), which runs pass 1 a dozen times, --jobs at once
//            (default: the cores less two, at most 6), about a minute
// Exits non-zero if a piece of the revival's knowledge reproduces a 1978 look, or a
// flag has not been reviewed.
import { readFileSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { availableParallelism } from "node:os";
import { fileURLToPath } from "node:url";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot, pass1, KEN_LOOKS } from "../src/pipeline.js";
import { collectKnowledge, plistGet } from "../src/glassbox-pass1.js";
import { choicesOfItsFile } from "./choices.mjs";

const opposite = (v) => (v === "high" ? "low" : v === "low" ? "high" : v);

// What was flagged and reviewed under Ken's decision 4, and the decision, keyed as
// flagKey makes them. reports/ext/appear/README.md, "Ken's looks and the revival's
// knowledge", gives the same. (Reviewed on 10 October 2026, and again on 11 October,
// when Ken decided that strong's large size is his own knowledge, from p. 238, which may
// give back his stepmother's size: PLAN.md, "Decisions" 6.)
export const REVIEWED = {
  "pair: path-jaggedness shape-jaggedness, step-mother medium":
    "kept: the rule (a character's outline follows its paths, motivated by p. 175) reaches all four, and gives Ken's value only to the stepmother; Cinderella's medium paths, the fairy godmother's jagged ones and the Prince's smooth ones disagree with his star, circle and triangle. In Ani's film she is not a square, and no look of Ken's in it needs the rule (5).",
  "combination: path-jaggedness shape-jaggedness + speed shape-complexity, step-mother square":
    "kept, both: together the two dynamics rules give the stepmother a square only where nothing else speaks. The speed rule (fast, so simple) agrees with Ken for her and the Prince, whose square and triangle are both simple, and not for Cinderella or the fairy godmother. In Ani's film Ken's own uniqueness summary (p. 94) and mean's jagged outline draw her otherwise.",
  "only the revival's: step-mother shape":
    "kept: with Ken's own knowledge of looks left out (friendly's smooth, strong's large size, dominates, the physical uniqueness and look-alike summaries, flashiness), her jaggedness is a compromise between mean's jagged, her medium paths and the film's variety, and her complexity is the one value left once she is to differ from the fairy godmother (complex) and Cinderella (medium), as Ken's own comparison summaries (CSUMRY) ask of characters so unlike. Ani's film has all of Ken's knowledge in it, and there she is not a square; nothing is dropped for a film Ani doesn't make.",
};

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

// Ken's 1978 looks as element values: each shape where the experts place it, each
// size as the value whose number it is (his .05 medium), and his colors; and which of
// them set a character apart (no other of the four had it).
export function kensValues(world) {
  const values = {};
  for (const [c, look] of Object.entries(KEN_LOOKS)) {
    const v = { ...(world.shapes[look.shape] || {}), "color-hue": look.color };
    v.size = Object.keys(world.sizes).find((k) => world.sizes[k] === look.aniSize);
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
  // comparisons suggest only different-from, which says the characters differ, not how;
  // the order of the hues says which the film's variety takes where nothing else
  // decides, which depends on the choices made before (4 and 5 judge it)
  return out;
}

// Whether one reach agrees with Ken's drawing, and whether it is what set the
// character apart. An element his looks don't have (a color, so far) is unknown.
function judge(r, ken) {
  const mine = ken.values[r.character];
  if (!mine) return { unknown: true };
  if (r.other) {
    const theirs = ken.values[r.other];
    if (!theirs || !r.element.endsWith("size")) return { unknown: true };
    const relation = mine.aniSize > theirs.aniSize ? "greater-than" : mine.aniSize < theirs.aniSize ? "less-than" : "same-as";
    const agrees = relation === r.value;
    return { agrees, apart: agrees && (ken.apart(r.character, "size") || ken.apart(r.other, "size")) };
  }
  if (mine[r.element] === undefined) return { unknown: true };
  const agrees = mine[r.element] === r.value;
  return { agrees, apart: agrees && ken.apart(r.character, r.element) };
}

export const isTheRevivals = (evidence) => (Array.isArray(evidence) ? evidence.some(isTheRevivals) : Boolean(evidence && evidence.why));
const label = (k) => `${k.kind} ${k.source}: ${Array.isArray(k.element) ? k.element.join("/") : k.element} ${k.value} (${k.strength})`;
const shortName = (k) => `${k.source} ${Array.isArray(k.element) ? k.element.join("/") : k.element}`;

// Each (character, element) a piece of knowledge reaches, judged: [{ character, other,
// element, value, through, agrees, apart }], those it reaches only where Ken's looks
// have no value left out. A pair it reaches in more than one way agrees if each does.
export function judgedPairs(k, world, cp29) {
  const ken = kensValues(world);
  const pairs = new Map();
  for (const r of reach(k, world, cp29)) {
    const key = `${r.character} ${r.other || ""} ${r.element}`;
    if (!pairs.has(key)) pairs.set(key, []);
    pairs.get(key).push({ ...r, ...judge(r, ken) });
  }
  const out = [];
  for (const rs of pairs.values()) {
    const known = rs.filter((r) => !r.unknown);
    if (!known.length) continue;
    const agrees = known.every((r) => r.agrees);
    out.push({ character: rs[0].character, other: rs[0].other, element: rs[0].element, value: [...new Set(rs.map((r) => r.value))].join(" or "), through: rs.map((r) => r.through).join(", "), agrees, apart: agrees && known.some((r) => r.apart) });
  }
  return out;
}

// 1. Each piece of knowledge alone: every pair it reaches agrees, and one sets apart.
export function checkAlone(world, cp29) {
  const found = [];
  for (const k of world.knowledge) {
    const pairs = judgedPairs(k, world, cp29);
    if (pairs.length && pairs.every((p) => p.agrees) && pairs.some((p) => p.apart)) found.push({ knowledge: k, revivals: isTheRevivals(k.evidence), reached: pairs });
  }
  return found;
}

// 2. Each pair where a piece of the revival's knowledge gives Ken's value.
export function checkPairs(world, cp29) {
  const found = [];
  for (const k of world.knowledge.filter((x) => isTheRevivals(x.evidence))) {
    for (const p of judgedPairs(k, world, cp29)) if (p.agrees) found.push({ knowledge: k, ...p });
  }
  return found;
}

// 3. Two pieces of the revival's knowledge that together give a character Ken's shape,
// one its jaggedness and the other its complexity.
export function checkCombinations(world, cp29) {
  const found = [];
  const revivals = world.knowledge.filter((k) => isTheRevivals(k.evidence));
  for (const c of world.characters) {
    const kens = KEN_LOOKS[c];
    if (!kens) continue;
    const on = (element) => revivals.flatMap((k) => reach(k, world, cp29).filter((r) => r.character === c && !r.other && r.element === element).map((r) => ({ knowledge: k, value: r.value, through: r.through })));
    for (const j of on("shape-jaggedness")) for (const x of on("shape-complexity")) {
      const shape = Object.keys(world.shapes).find((s) => world.shapes[s]["shape-jaggedness"] === j.value && world.shapes[s]["shape-complexity"] === x.value);
      if (shape === kens.shape) found.push({ character: c, shape, parts: [j, x] });
    }
  }
  return found;
}

// 4. Ani's result: a look of hers that is Ken's, and the knowledge it came from.
export function checkResult(world, appearances, choicePoints) {
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
    // the film's levels; and the film's variety's hue, from the revival's order of hues
    if (src[1] === "level") return world.knowledge.filter((k) => (k.kind === "film" || (k.kind === "order" && src[0] === "variety")) && k.source === `(${src.join(" ")})` && k.element === element);
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
    for (const what of kensIn(a)) {
      const elements = elementsOf(what);
      const behind = elements.flatMap((e) => (a.elements[e]?.sources || []).flatMap((s) => knowledgeOf(s, e)));
      for (const k of [...new Set(behind)]) found.push({ character: a.character, what, knowledge: k, revivals: isTheRevivals(k.evidence) });
      if (!behind.length) found.push({ character: a.character, what, knowledge: null, revivals: false });
    }
  }
  return found;
}

// Which of a look's aspects are Ken's: "shape", "size", "color" (its hue: his colors
// were the TV's, each at its full intensity and saturation, so only his hues set his
// characters apart, REVIVE;COLORS).
function kensIn(a) {
  const k = KEN_LOOKS[a.character];
  if (!k) return [];
  return [...(a.look.shape === k.shape ? ["shape"] : []), ...(a.look.aniSize === k.aniSize ? ["size"] : []), ...(a.look.hue && a.look.hue === k.color ? ["color"] : [])];
}
// The elements an aspect of a look is made of.
const elementsOf = (what) => (what === "shape" ? ["shape-jaggedness", "shape-complexity"] : what === "color" ? ["color-hue"] : ["size"]);

// Whether an aspect of Ken's look set the character apart in his drawing: each of his
// four shapes and four colors is his alone, and of the sizes only the stepmother's
// large one is (his medium, .05, is three characters' size).
function setApart(character, what) {
  const key = what === "shape" ? "shape" : what === "color" ? "color" : "aniSize";
  return Object.entries(KEN_LOOKS).every(([c, look]) => c === character || look[key] !== KEN_LOOKS[character][key]);
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

// ---------------------------------------------------------------- 5. the ablation

// Leave pieces of knowledge out of a Lisp that has booted with APPEAR, before DATEST
// loads: each is taught when its file loads (REVIVE;APSUG's +after-load hooks), from
// :appearance-knowledge, :appearance-relationship-knowledge, the elements'
// dynamics-suggestions and film-level-suggestions, and the two comparison teachers.
export function leaveOut(L, rows) {
  const ev = (s) => L.evalString(s);
  for (const id of ["apsug-descriptors", "apsug-relationships", "apsug-comparisons"]) {
    if (ev(`(get '${id} 'revival-done)`) !== L.NIL) throw new Error(`${id} has been taught already, so its knowledge can't be left out`);
  }
  const pairs = (kind) => rows.filter((r) => r.kind === kind).map((r) => `(${r.source} ${r.element})`);
  const without = (variable, list) => `(setq ${variable} (mapcan (function (lambda (e) (and (not (member (list (first e) (second e)) '(${list.join(" ")}))) (list e)))) ${variable}))`;
  if (pairs("descriptor").length) ev(without(":appearance-knowledge", pairs("descriptor")));
  if (pairs("relationship").length) ev(without(":appearance-relationship-knowledge", pairs("relationship")));
  for (const r of rows.filter((x) => x.kind === "dynamics" || x.kind === "film")) {
    const prop = r.kind === "dynamics" ? "dynamics-suggestions" : "film-level-suggestions";
    ev(`(putprop '${r.element} (mapcan (function (lambda (rule) (and (not (equal (first rule) '${r.source})) (list rule)))) (get '${r.element} '${prop})) '${prop})`);
  }
  for (const r of rows.filter((x) => x.kind === "comparison")) {
    ev(`(defun ${r.source === "look-alike:" ? "teach-look-alike-about-appearance" : "teach-uniqueness-about-appearance"} () nil)`);
  }
}

// The film's variety's order of the hues read another way: color-hue's possible values,
// set once ELEMNT has defined it (REVIVE;APPEAR's hook, which comes first). The wheel,
// and so which hues are neighbors and complements, is as it was.
export function readHuesAs(L, order) {
  L.evalString(`(+after-load '|ken;elemnt >| '(ask color-hue set your possible-values to (${order.join(" ")})))`);
}
// The hues read from red, as a wheel usually is (and as the revival's own angles, 0 to
// 270 degrees, run): the reading decision 4 dropped.
export const HUES_FROM_RED = ["red", "orange", "yellow", "green", "blue", "purple"];

// Ani's looks with the rows left out: pass 1 in a process of its own (this file, with
// --looks-without), as [{ character, look, elements }]; with hues, the hues read in that
// order.
function looksWithout(rows, hues = null) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [fileURLToPath(import.meta.url), "--looks-without", JSON.stringify(rows.map(({ kind, source, element }) => ({ kind, source, element }))), ...(hues ? ["--hues", hues.join(",")] : [])], { cwd: fileURLToPath(new URL("..", import.meta.url)), stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { err += d; });
    child.on("close", (code) => (code === 0 ? resolve(JSON.parse(out)) : reject(new Error(`pass 1 without ${rows.length} pieces stopped (exit ${code}): ${err.trim().split("\n").pop()}`))));
  });
}

const lookWords = (a) => {
  const size = `${{ 0.036: "small", 0.05: "medium", 0.07: "large" }[a.look.aniSize] || String(a.look.aniSize)}${a.look.hue ? ` ${a.look.hue}` : ""}`;
  const ken = kensIn(a).map((w) => (setApart(a.character, w) ? w : `${w}, which sets no one apart`));
  return `${size} ${a.look.shape}${ken.length ? ` (Ken's ${ken.join(" and ")})` : ""}`;
};

// The runs: all of the knowledge, only the revival's, and without each piece of the
// revival's that reaches one of Ken's characters (one that reaches none can change
// nothing); and all of it with the hues read from red. Each run's looks, and what the
// comparison with all of it found.
export async function ablate(world, cp29, jobs) {
  const revivals = world.knowledge.filter((k) => isTheRevivals(k.evidence));
  const kens = world.knowledge.filter((k) => !isTheRevivals(k.evidence));
  const reaching = revivals.filter((k) => reach(k, world, cp29).length);
  const order = revivals.find((k) => k.kind === "order");
  const runs = [{ name: "all of it", leave: [] }, { name: "only the revival's", leave: kens, onlyRevivals: true },
    ...reaching.map((k) => ({ name: `without ${shortName(k)}`, leave: [k], without: k })),
    ...(order ? [{ name: `with the hues read from red (${HUES_FROM_RED.join(" ")}), not in the revival's order`, leave: [], hues: HUES_FROM_RED, order }] : [])];
  const queue = [...runs];
  const worker = async () => {
    for (let r = queue.shift(); r; r = queue.shift()) r.looks = await looksWithout(r.leave, r.hues);
  };
  await Promise.all(Array.from({ length: Math.min(jobs, runs.length) }, worker));
  const all = runs[0].looks;
  // the aspects of Ken's looks that set a character apart, which a run gives back
  const kenIn = (looks) => new Set(looks.flatMap((a) => kensIn(a).filter((w) => setApart(a.character, w)).map((w) => `${a.character} ${w}`)));
  const base = kenIn(all);
  for (const r of runs.slice(1)) {
    const now = kenIn(r.looks);
    r.lost = [...base].filter((x) => !now.has(x)); // Ken's looks that need the piece left out
    r.gained = [...now].filter((x) => !base.has(x)); // Ken's looks the piece keeps away
    r.ken = [...now];
  }
  return { runs, skipped: revivals.filter((k) => !reaching.includes(k) && k.kind !== "order") };
}

// ---------------------------------------------------------------- the flags

// The key REVIEWED knows a flag by.
export function flagKey(f) {
  if (f.type === "pair") return `pair: ${shortName(f.knowledge)}, ${f.character}${f.other ? ` than ${f.other}` : ""} ${f.value}`;
  if (f.type === "combination") return `combination: ${f.parts.map((p) => shortName(p.knowledge)).join(" + ")}, ${f.character} ${f.shape}`;
  if (f.type === "result") return `result: ${shortName(f.knowledge)}, ${f.character} ${f.what}`;
  return `only the revival's: ${f.character} ${f.what}`;
}

// The table, Ken's look beside Ani's.
function lookTable(appearances) {
  const lines = [];
  for (const a of appearances.characters) {
    const k = KEN_LOOKS[a.character];
    const size = (n) => (n === 0.036 ? "small" : n === 0.07 ? "large" : n === 0.05 ? "medium" : String(n));
    lines.push(`${a.character.padEnd(16)} Ken 1978: ${k ? `${size(k.aniSize)} ${k.color} ${k.shape}` : "-"}`.padEnd(52) + `Ani: ${size(a.look.aniSize)} ${a.look.hue ? `${a.look.hue} ` : ""}${a.look.shape}`);
    for (const [e, x] of Object.entries(a.elements)) lines.push(`${"".padEnd(18)}${e} ${x.value}${x.drawn && x.drawn !== x.value ? `, drawn ${x.drawn}` : ""}, from ${x.sources.join(", ")}`);
  }
  return lines.join("\n");
}

async function main() {
  const t0 = Date.now();
  const args = process.argv.slice(2);
  const at = args.indexOf("--jobs");
  const jobs = at >= 0 ? Math.max(1, Number(args[at + 1]) || 1) : Math.max(1, Math.min(6, availableParallelism() - 2));
  const world = bootWorld();
  const cp29 = choicesOfItsFile("original/7005017/cp.29");
  let failures = 0;
  const flags = [];
  const fail = (line) => { failures++; console.log(`FAIL   ${line}`); };
  const flag = (f, line) => {
    const key = flagKey(f);
    const decided = REVIEWED[key];
    flags.push(key);
    if (decided) console.log(`flag   ${line}\n         reviewed: ${decided}`);
    else fail(`${line}\n         not reviewed under Ken's decision 4: decide, and add "${key}" to REVIEWED with why`);
  };

  const revivals = world.knowledge.filter((k) => isTheRevivals(k.evidence));
  console.log(`${world.knowledge.length} pieces of knowledge, ${revivals.length} of them the revival's, against Ken's 1978 looks (his .05 medium)\n`);

  console.log("1. each piece alone");
  const alone = checkAlone(world, cp29);
  for (const f of alone) {
    const line = `${label(f.knowledge)} gives back Ken's wherever it reaches: ${f.reached.map((r) => `${r.character}${r.other ? ` than ${r.other}` : ""} ${r.element} ${r.value} (${r.through})`).join("; ")}`;
    if (f.revivals) fail(line);
    else console.log(`Ken's  ${line}`);
  }
  if (!alone.some((f) => f.revivals)) console.log("ok     no piece of the revival's gives back Ken's looks wherever it reaches");

  console.log("\n2. each character and element a piece of the revival's reaches");
  const pairs = checkPairs(world, cp29);
  for (const p of pairs) {
    const line = `${shortName(p.knowledge)} gives ${p.character}${p.other ? ` than ${p.other}` : ""} Ken's ${p.element} ${p.value} (${p.through})`;
    if (p.apart) flag({ type: "pair", ...p }, `${line}, which set ${p.character} apart in his drawing`);
    else console.log(`shared ${line}, which another of his characters has too (3 looks at these together)`);
  }
  if (!pairs.some((p) => p.apart)) console.log("ok     no piece of the revival's gives any character a value of Ken's that set it apart");

  console.log("\n3. two pieces of the revival's together");
  const combos = checkCombinations(world, cp29);
  for (const c of combos) flag({ type: "combination", ...c }, `${c.parts.map((p) => `${shortName(p.knowledge)} (${p.value}, ${p.through})`).join(" with ")} give ${c.character} Ken's ${c.shape}`);
  if (!combos.length) console.log("ok     no two pieces of the revival's give a character Ken's shape");

  let result = null;
  if (args.includes("--run")) {
    const p = pass1(makeProjectFileSystem(), { extensions: ["appear"] });
    result = { appearances: p.appearances, choicePoints: p.choicePoints };
  } else if (existsSync("reports/ext/appear/pass1.json")) {
    result = JSON.parse(readFileSync("reports/ext/appear/pass1.json", "utf8"));
  }
  const resultFound = [];
  if (result && result.appearances) {
    console.log(`\n4. Ani's looks, against Ken's 1978 looks\n${lookTable(result.appearances)}\n`);
    for (const f of checkResult(world, result.appearances, result.choicePoints)) {
      resultFound.push(f);
      const line = `${f.character}'s ${f.what} is Ken's${setApart(f.character, f.what) ? "" : " (his medium, which sets no one apart)"}${f.knowledge ? `, from ${label(f.knowledge)}` : ", from no piece of knowledge (a compromise)"}`;
      // a look of Ken's that set his character apart, from the revival's knowledge (the
      // order of the hues among it), is judged under decision 4
      if (f.revivals && setApart(f.character, f.what)) flag({ type: "result", character: f.character, what: f.what, knowledge: f.knowledge }, `in Ani's result, ${line}`);
      else console.log(`${f.revivals ? "theirs" : "Ken's "} ${line}`);
    }
    if (!resultFound.length) console.log("ok     no look of Ani's is Ken's");
  } else console.log("\n4. Ani's result: there is no reports/ext/appear/pass1.json (tools/run-pass1.mjs --extensions appear --glass-box --save); or give --run");

  if (args.includes("--quick")) {
    for (const f of resultFound.filter((x) => x.revivals && setApart(x.character, x.what))) console.log(`(5 would judge whether ${shortName(f.knowledge)} brings about ${f.character}'s ${f.what}: run without --quick)`);
  } else {
    console.log(`\n5. pass 1 again, with some of the knowledge left out (${jobs} at a time)`);
    const { runs, skipped } = await ablate(world, cp29, jobs);
    for (const r of runs) {
      console.log(`       ${r.name}: ${r.looks.map((a) => `${a.character} ${lookWords(a)}`).join("; ")}`);
    }
    // the hues read from red: which of Ken's it gives back, the reason for the revival's order
    for (const r of runs.filter((x) => x.hues)) {
      const back = r.looks.filter((a) => kensIn(a).includes("color")).map((a) => `${a.character}'s ${a.look.hue}`);
      console.log(`       (${back.length ? `read from red, the film's variety gives back Ken's ${back.join(", ")}: the reason the revival's order reads the hues from yellow (decision 4)` : "read from red, the film's variety gives back none of Ken's hues now: the reason for reading them from yellow no longer holds; say so to Ken"})`);
    }
    if (skipped.length) console.log(`       (not left out, since they reach none of Ken's characters: ${skipped.map(shortName).join(", ")})`);
    if (result && result.appearances) {
      const fresh = JSON.stringify(runs[0].looks.map((a) => [a.character, a.look]));
      const saved = JSON.stringify(result.appearances.characters.map((a) => [a.character, a.look]));
      if (fresh !== saved) fail(`pass 1 with all of the knowledge draws ${runs[0].looks.map((a) => `${a.character} ${lookWords(a)}`).join("; ")}, not as reports/ext/appear/pass1.json has it (make it again)`);
    }
    for (const r of runs.filter((x) => x.without)) {
      for (const lost of r.lost) {
        const line = `without ${shortName(r.without)}, ${lost.replace(" ", "'s ")} is no longer Ken's: ${shortName(r.without)} brings about a look of Ken's`;
        if (isTheRevivals(r.without.evidence)) fail(`${line}, and is the revival's, which decision 4 drops`);
        else console.log(`Ken's  ${line}`);
      }
      for (const gained of r.gained) console.log(`       without ${shortName(r.without)}, ${gained.replace(" ", "'s ")} would be Ken's: with it, Ani's isn't`);
    }
    const only = runs.find((x) => x.onlyRevivals);
    for (const k of only.ken) {
      const [character, what] = k.split(" ");
      const a = only.looks.find((x) => x.character === character);
      const elements = elementsOf(what);
      flag({ type: "only", character, what }, `with only the revival's knowledge, ${character}'s ${what} is Ken's (${lookWords(a)}): ${elements.map((e) => `${e} ${a.elements[e].value} from ${a.elements[e].sources.join(", ")}`).join("; ")}`);
    }
    if (!runs.some((r) => r.without && r.lost.length) && !only.ken.length) console.log("ok     no piece of the revival's brings about a look of Ken's, and only the revival's gives back none");
  }
  // a decision for a flag no longer raised is stale
  if (!args.includes("--quick")) for (const key of Object.keys(REVIEWED).filter((k) => !flags.includes(k))) fail(`REVIEWED has "${key}", which nothing flags now: take it out`);

  const seconds = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(failures ? `\n${failures} check${failures > 1 ? "s" : ""} FAILED (${seconds} s)` : `\nno piece of the revival's knowledge reproduces Ken's 1978 looks, and every flag is reviewed (${seconds} s)`);
  process.exit(failures ? 1 : 0);
}

// The child of looksWithout: pass 1 with the rows left out (and the hues read in
// another order, if given), its looks as JSON.
function looksWithoutChild(rowsJSON, hues) {
  const rows = JSON.parse(rowsJSON);
  const p = pass1(makeProjectFileSystem(), { extensions: ["appear"], setup: (L) => { leaveOut(L, rows); if (hues) readHuesAs(L, hues.split(",")); } });
  process.stdout.write(JSON.stringify(p.appearances.characters.map((a) => ({ character: a.character, look: a.look, elements: a.elements }))));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const i = process.argv.indexOf("--looks-without");
  const h = process.argv.indexOf("--hues");
  if (i >= 0) looksWithoutChild(process.argv[i + 1], h >= 0 ? process.argv[h + 1] : null);
  else await main();
}
