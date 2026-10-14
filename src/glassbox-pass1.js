// Record what pass 1 does, for the glass-box view (app/pass1.html): every
// attempt Ani makes at a choice and its outcome, in order, and afterwards each
// choice point's variables and memory. Used by tools/run-pass1.mjs --glass-box and by
// src/pipeline.js (so a run in the browser has its reasons too).
import { Sym, Cons, Flonum } from "./maclisp/types.js";

// Lisp data as JSON: symbols become lowercase strings, lists arrays, NIL null.
export function toJSON(L, x) {
  if (x === L.NIL || x === null || x === undefined) return null;
  if (x instanceof Sym) return x.name.toLowerCase();
  if (typeof x === "number") return x;
  if (x instanceof Flonum) return x.value ?? Number(L.print(x));
  if (x instanceof Cons) {
    const out = [];
    let p = x;
    for (; p instanceof Cons; p = p.cdr) out.push(toJSON(L, p.car));
    if (p !== L.NIL) out.push(".", toJSON(L, p));
    return out;
  }
  return L.print(x);
}

// Before (z): wrap choose-value so each call is logged with its outcome.
export function installAttemptLog(L) {
  const attempts = [];
  const open = []; // attempts still running, innermost last
  L.defsubr("+GLASS-START", (cp) => {
    const a = { step: attempts.length + 1, choicePoint: toJSON(L, cp) };
    if (open.length) a.within = open[open.length - 1] + 1; // the step it ran inside
    attempts.push(a);
    open.push(attempts.length - 1);
    return attempts.length - 1;
  });
  L.defsubr("+GLASS-END", (index, answer) => {
    open.pop();
    const a = attempts[index];
    const json = toJSON(L, answer);
    if (Array.isArray(json) && json[0] === "postponed:") a.postponed = json[1];
    else a.chose = json;
    return answer;
  });
  L.evalString(`(progn
    (putprop 'choose-value (get 'choose-value 'expr) 'glass-box-original)
    (defun choose-value (choice-point)
      (let ((glass-index (+glass-start choice-point)))
           (+glass-end glass-index
                       (funcall (get 'choose-value 'glass-box-original) choice-point)))))`);
  return attempts;
}

const VARIABLES = [
  "current-choice", "element", "element-name", "thing", "postponement-reasons", "conflicts-resolved",
  "rejected-suggestions", "non-empty-sources", "suggestion-sources", "synonyms", "previous-choices",
];

// After the run: each choice point (in the order save-answers writes them) with
// its variables and the items it memorized. keep, if given, says which to collect,
// from the name as toJSON gives it (src/pipeline.js freshLook keeps the changed
// characters', and so never asks a kind of choice point with no instances, such as
// REVIVE;APPEAR's appearance-choice-point in a job that chose no looks, for its
// element, which it would take from its name).
export function collectChoicePoints(L, keep = null) {
  const names = L.evalString("(ask choice-point recall your childless-descendants)");
  const out = [];
  for (let p = names; p instanceof Cons; p = p.cdr) {
    const name = p.car;
    if (keep && !keep(toJSON(L, name))) continue;
    const src = L.print(name);
    const cp = { name: toJSON(L, name), parent: toJSON(L, L.evalString(`(ask ${src} recall your parent)`)) };
    for (const v of VARIABLES) {
      const value = toJSON(L, L.evalString(`(ask ${src} recall your ${v})`));
      if (value !== null) cp[v.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
    }
    cp.memory = toJSON(L, L.evalString(`(ask ${src} collect items)`)) || [];
    out.push(cp);
  }
  return out;
}

// ---------------------------------------------------------------- appearances

// (get list key) of a list such as (suggestion: element speed value low ...), as
// Ken's code reads them: the value after the key, or NIL.
export function plistGet(L, list, key) {
  const items = L.toArray(list);
  for (let i = 1; i + 1 < items.length; i += 2) if (items[i] instanceof Sym && items[i].name === key.toUpperCase()) return items[i + 1];
  return L.NIL;
}

// Whether REVIVE;APPEAR is loaded: its function is defined. Looked up without
// interning anything, so that a Lisp running as in 1978 is left exactly as it was.
function defined(L, name) {
  const s = L.obarray.find(name.toUpperCase());
  return Boolean(s) && L.evalString(`(and (getl '${name} '(expr subr lsubr fexpr)) t)`) !== L.NIL;
}

// A piece of evidence from REVIVE;APSUG, with the case of its words kept: (thesis 161
// |smooth is friendly|) as { thesis: 161, text }, (code |relate.22:63| |...|) as
// { code: "relate.22:63", text }, (why |...|) as { why: text }, the revival's own
// reason, and (and e1 e2) as a list of them.
export function evidenceJSON(L, x) {
  const items = L.toArray(x);
  const word = (s) => (s instanceof Sym ? s.name : L.print(s));
  const kind = word(items[0]).toLowerCase();
  if (kind === "and") return items.slice(1).map((e) => evidenceJSON(L, e));
  if (kind === "thesis") return { thesis: items[1], text: word(items[2]) };
  if (kind === "code") return { code: word(items[1]), text: word(items[2]) };
  if (kind === "why") return { why: word(items[1]) };
  return { other: L.print(x) };
}

// How Ani chose each character's look (REVIVE;APPEAR, APSUG, SHAPES and COLORS), for
// the glass box's "How she looks": for each character, in focus order,
//   { character,
//     look: { shape, angle, centerOffset, aniSize, hue, color },
//                                                             what Director is to draw,
//                                                             color [hue angle,
//                                                             saturation, value] as
//                                                             the page paints it, hue
//                                                             its name (null if none)
//     elements: { size: { choicePoint, value, strength, sources, drawn, overriddenBy },
//                 shape-jaggedness: ..., shape-complexity: ..., color-intensity: ...,
//                 color-saturation: ..., color-hue: ... },
//                                                             each choice, its winning
//                                                             suggestion's strength and
//                                                             sources (the choice point
//                                                             itself is in choicePoints),
//                                                             the value the look has as
//                                                             drawn (differing where the
//                                                             shape experts overrode the
//                                                             choice, one value for a (not
//                                                             X)), and, only if they
//                                                             overrode it, the choice
//                                                             point's (overridden-by: ...)
//     experts: [ "(considered: ...)", "(relaxed: ...)", "(chosen: ...)",
//                "(colored: hue ... angle ... saturation ... value ...)" ] }
// with knowledge, every piece of knowledge a look's suggestion can come from, each
// { kind, source, element, value, strength, evidence }, and findings, what telling
// the characters apart found: { comparison, items: ["(look-alike: ...)", ...] }.
// Empty if REVIVE;APPEAR is not loaded or chose nothing.
export function collectAppearances(L) {
  if (!defined(L, "choose-appearances") || L.evalString("(actor-of 'appearance dont-autoload)") === L.NIL) return null;
  const lisp = (x) => L.print(x).toLowerCase();
  const ev = (src) => L.evalString(src);
  const characters = L.toArray(ev("(characters-in-focus-order)"));
  const out = { characters: [], knowledge: [], findings: [] };
  for (const c of characters) {
    const name = lisp(c);
    L.intern("*GB-ACTOR*").value = L.readFromString(`(appearance-of ${name})`);
    if (ev("(exists? *gb-actor*)") === L.NIL) continue;
    const recall = (v) => ev(`(ask ,*gb-actor* recall your ${v})`);
    const num = (v) => (v === L.NIL ? null : L.num.val(v));
    const shape = recall("shape");
    // its color (REVIVE;COLORS), if it was given one: its hue's name, or null for none,
    // and [hue angle, saturation, value]
    const lookColor = recall("look-color");
    const color = lookColor === L.NIL ? {} : { hue: recall("hue") === L.NIL ? null : lisp(recall("hue")), color: L.toArray(lookColor).map(num) };
    const entry = {
      character: name,
      look: { shape: shape === L.NIL ? null : lisp(shape), angle: num(recall("angle")), centerOffset: recall("center-offset") === L.NIL ? null : lisp(recall("center-offset")), aniSize: num(recall("ani-size")), ...color },
      elements: {},
      experts: L.toArray(ev("(ask ,*gb-actor* collect items)")).map(lisp).reverse(),
    };
    for (const element of L.toArray(ev("(ask appearance-element recall your offspring)")).reverse()) {
      const e = lisp(element);
      const cp = `(choice-point-of ${name} ${e})`;
      if (ev(`(exists? '${cp})`) === L.NIL) continue;
      const value = ev(`(ask ${cp} recall your current-choice)`);
      // the suggestion record-choice memorized, with the value chosen (choose.198:596-603)
      const chosen = L.toArray(ev(`(ask ${cp} collect items memorized matching (suggestion: %))`)).find((s) => lisp(plistGet(L, s, "value")) === lisp(value));
      const field = (k) => (chosen ? plistGet(L, chosen, k) : L.NIL);
      const source = field("source");
      const sources = source === L.NIL ? [] : source instanceof Cons && lisp(source.car) === "and" ? L.toArray(source.cdr).map(lisp) : [lisp(source)];
      // the value as drawn (REVIVE;SHAPES drawn-value), which differs from the choice
      // where the shape experts overrode it, and is one value for a (not X); and the
      // choice point's (overridden-by: ...), if the experts overrode it
      const drawn = defined(L, "drawn-value") ? ev(`(drawn-value '${name} '${e})`) : L.NIL;
      const overriddenBy = L.toArray(ev(`(ask ${cp} collect items memorized matching (overridden-by: %))`)).map(lisp);
      entry.elements[e] = { choicePoint: cp, value: lisp(value), strength: chosen ? lisp(field("strength")) : null, sources, drawn: drawn === L.NIL ? null : lisp(drawn), ...(overriddenBy.length ? { overriddenBy } : {}) };
    }
    out.characters.push(entry);
  }
  out.knowledge = collectKnowledge(L);
  for (const comparison of L.toArray(ev("(and (actor-of 'character-comparison dont-autoload) (ask character-comparison recall your offspring))"))) {
    if (comparison === L.NIL) continue;
    L.intern("*GB-ACTOR*").value = comparison;
    const items = L.toArray(ev("(ask ,*gb-actor* collect items)")).map(lisp).filter((i) => i.startsWith("(look-alike: ") || i.startsWith("(alike-after-all: "));
    if (items.length) out.findings.push({ comparison: lisp(comparison), items: items.reverse() });
  }
  return out;
}

// Every piece of knowledge a look's suggestion can come from (REVIVE;APSUG's
// appearance-knowledge), each { kind, source, element, value, strength, evidence }:
// kind descriptor, relationship, comparison, dynamics or film; source the word, the
// relationship, the summary, the dynamics element or the film's level; element the
// appearance element (or a list of relative ones); value the value, relation or rule
// (same, opposite, medium-unless-high); evidence as evidenceJSON makes it.
export function collectKnowledge(L) {
  if (!defined(L, "appearance-knowledge")) return [];
  const lisp = (x) => L.print(x).toLowerCase();
  return L.toArray(L.evalString("(appearance-knowledge)")).map((row) => {
    const [kind, source, element, value, strength, evidence] = L.toArray(row);
    return { kind: lisp(kind), source: lisp(source), element: element instanceof Cons ? L.toArray(element).map(lisp) : lisp(element), value: lisp(value), strength: lisp(strength), evidence: evidenceJSON(L, evidence) };
  });
}

// The look each character is to take in the scene, as pass 2 writes it at the end of
// the scene's program (REVIVE;APPEAR's take-look-forms): [{ character, shape, angle,
// centerOffset, aniSize, color?, form }], color [hue angle, saturation, value] if
// REVIVE;COLORS gave it one. Empty if REVIVE;APPEAR is not loaded.
export function collectLooks(L, scene) {
  if (!defined(L, "take-look-forms")) return [];
  const lisp = (x) => L.print(x).toLowerCase();
  return L.toArray(L.evalString(`(take-look-forms '${scene})`)).map((form) => {
    const [, character, , , look] = L.toArray(form);
    const get = (k) => plistGet(L, look, k);
    const num = (v) => (v === L.NIL ? null : L.num.val(v));
    const color = get("look-color") === L.NIL ? {} : { color: L.toArray(get("look-color")).map(num) };
    return { character: lisp(character), shape: get("shape") === L.NIL ? null : lisp(get("shape")), angle: num(get("angle")), centerOffset: get("center-offset") === L.NIL ? null : lisp(get("center-offset")), aniSize: num(get("ani-size")), ...color, form: lisp(form) };
  });
}

// What the characters were told, and what each descriptor suggests, for context.
export function collectStory(L) {
  const characters = toJSON(L, L.evalString("(ask character recall your offspring)")) || [];
  const descriptions = {};
  for (const c of characters) {
    descriptions[c] = toJSON(L, L.evalString(`(ask ${c} collect items memorized matching (description: type ? descriptor ? source ?))`)) || [];
  }
  return { characters, descriptions };
}
