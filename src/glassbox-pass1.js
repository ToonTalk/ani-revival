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
// its variables and the items it memorized.
export function collectChoicePoints(L) {
  const names = L.evalString("(ask choice-point recall your childless-descendants)");
  const out = [];
  for (let p = names; p instanceof Cons; p = p.cdr) {
    const name = p.car;
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

// What the characters were told, and what each descriptor suggests, for context.
export function collectStory(L) {
  const characters = toJSON(L, L.evalString("(ask character recall your offspring)")) || [];
  const descriptions = {};
  for (const c of characters) {
    descriptions[c] = toJSON(L, L.evalString(`(ask ${c} collect items memorized matching (description: type ? descriptor ? source ?))`)) || [];
  }
  return { characters, descriptions };
}
