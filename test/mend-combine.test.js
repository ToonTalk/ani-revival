// MEND's M7 (REVIVE;MEND7): COSUG's combine for change suggestions. Ken's COSUG reads a
// change under display (cosug.215:449-634); EMOTE's feelings put it under value
// (emote.9). Cinderella never combines two change suggestions, so check-1978 can't
// tell whether the repair is there; these check it on suggestions made here, with
// Ken's own COSUG and DISPLY, against a stand-in task and film.
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot } from "../src/pipeline.js";

// A Lisp with COSUG, and DISPLY, which defines change: and change-to: and gives them
// COSUG's change:-package and change-to:-package (disply.311:1042-1061), and a film
// whose levels COSUG's compromises read (film-level-of, cosug.215:866-871).
function combining(extensions) {
  const L = boot(makeProjectFileSystem(), { extensions });
  const run = (src) => L.print(L.evalString(src));
  run("(load '|ken;cosug >|)");
  run("(actor-of 'change:)");
  run("(define mend7-film film (set your level of obviousness to high) (set your level of originality to low))");
  run("(ask film set your current-film to mend7-film)");
  let tasks = 0;
  // Combine the suggestions as SUGEST's combine-emotional-state-suggestions has COSUG
  // combine a group (sugest.123:213-234), recording the result on a task of their own.
  // Returns the task and its items, printed.
  const combine = (kind, ...suggestions) => {
    const task = `mend7-task-${++tasks}`;
    run(`(define ${task} something)`);
    run(`(setq mend7-suggestions (list ${suggestions.join(" ")}))`);
    run(`(record+combine-suggestions mend7-suggestions '${kind} '${task})`);
    return { task, items: L.toArray(L.evalString(`(ask ${task} collect items)`)).map((x) => L.print(x).toLowerCase()) };
  };
  return { L, run, combine };
}

// A suggestion as EMOTE's joy makes it (emote.9:11-60), with the change under value.
function change(level, element, { sign = "positive", strength = "high" } = {}) {
  return `'(suggestion: element (establish (emotional-state goat (joy (${sign} ${level}))))
	      value (method: type display-value-change
			     value (change: element (goat ${element}) amount (${sign} ${level}) speed ${level}))
	      strength ${strength} source joy)`;
}
function changeTo(level, element, newValue, { speed = "high", strength = "medium" } = {}) {
  return `'(suggestion: element (establish (emotional-state goat (joy (positive ${level}))))
	      value (method: type display-value-change
			     value (change-to: element (goat ${element}) new-value ${newValue} speed ${speed}))
	      strength ${strength} source joy)`;
}

const notes = (items) => items.filter((x) => x.startsWith("(revival-repair: "));
const suggestions = (items) => items.filter((x) => x.startsWith("(suggestion: "));
const conflicts = (items) => items.filter((x) => x.startsWith("(conflict: "));

const ken = combining([]);
const mend = combining(["mend"]);

test("MEND7 wraps COSUG's record+combine-suggestions when COSUG loads, once, and 1978 doesn't", () => {
  const L = boot(makeProjectFileSystem(), { extensions: ["mend"] });
  const run = (src) => L.print(L.evalString(src));
  // MEND loads before any of Ani's files; COSUG's functions are only tags until it loads
  assert.equal(run("(get 'record+combine-suggestions 'revival-wraps)"), "NIL");
  run("(load '|ken;cosug >|)");
  assert.equal(run("(mapcar 'car (get 'record+combine-suggestions 'revival-wraps))"), "(MEND7)");
  assert.equal(run("(eq (get 'record+combine-suggestions 'expr) (get 'record+combine-suggestions-reading-changes-under-value 'expr))"), "T");
  // loaded again, Ken's definition comes back and is wrapped again, once
  run("(load '|ken;cosug >|)");
  assert.equal(run("(mapcar 'car (get 'record+combine-suggestions 'revival-wraps))"), "(MEND7)");
  assert.equal(run("(eq (get 'record+combine-suggestions 'expr) (get 'record+combine-suggestions-reading-changes-under-value 'expr))"), "T");
  assert.equal(ken.run("(get 'record+combine-suggestions 'revival-wraps)"), "NIL");
});

test("in 1978, two change: suggestions stop; two equal change-to: ones merge into nil, which CHOMET passes over", () => {
  assert.throws(() => ken.combine("change:", change("low", "speed"), change("medium", "speed")), /CHANGE:-PACKAGE \(BAD CHANGE: PACKAGE IN EITHER/);
  const { task, items } = ken.combine("change-to:", changeTo("high", "path-length", "long"), changeTo("medium", "path-length", "long", { strength: "low" }));
  assert.equal(items.length, 1);
  assert.match(items[0], / value nil strength medium source joy\)$/);
  ken.run("(load '|ken;chomet >|)");
  assert.equal(ken.run(`(get-display-change-suggestions '${task})`), "NIL");
});

test("with MEND, two change: suggestions combine as Ken's COSUG combines them, the change under value, noted on the task", () => {
  const { items } = mend.combine("change:", change("low", "speed"), change("medium", "speed"));
  // low and medium are near enough (cosug.215:183-188); obviousness high picks the one
  // that isn't medium (cosug.215:836-839)
  assert.deepEqual(suggestions(items), [
    "(suggestion: element (and (establish (emotional-state goat (joy (positive medium)))) (establish (emotional-state goat (joy (positive low))))) value (method: best-when nil type display-value-change value (change: element (goat speed) amount (positive low) speed low)) strength high source joy)",
  ]);
  assert.deepEqual(notes(items), [
    "(revival-repair: what combined-changes was stopped now ((change: element (goat speed) amount (positive low) speed low)) because (change under value not display))",
  ]);
});

test("with MEND, equal change-to: changes merge into a method, which CHOMET takes", () => {
  const { task, items } = mend.combine("change-to:", changeTo("high", "path-length", "long"), changeTo("medium", "path-length", "long", { strength: "low" }));
  assert.deepEqual(suggestions(items), [
    "(suggestion: element (and (establish (emotional-state goat (joy (positive medium)))) (establish (emotional-state goat (joy (positive high))))) value (method: type display-value-change value (change-to: element (goat path-length) new-value long speed high)) strength medium source joy)",
  ]);
  assert.deepEqual(notes(items), [
    "(revival-repair: what combined-changes was lost now ((change-to: element (goat path-length) new-value long speed high)) because (change under value not display))",
  ]);
  mend.run("(load '|ken;chomet >|)");
  assert.match(mend.run(`(get-display-change-suggestions '${task})`), /^\(\(SUGGESTION: .* VALUE \(METHOD: TYPE DISPLAY-VALUE-CHANGE VALUE \(CHANGE-TO: /);
});

test("with MEND, a conflict's offenders are the suggestions themselves, as the task was given them", () => {
  const { task, items } = mend.combine("change:", change("high", "speed", { sign: "negative" }), change("high", "speed"));
  assert.equal(suggestions(items).length, 0);
  assert.equal(conflicts(items).length, 1);
  assert.match(conflicts(items)[0], /^\(conflict: type different-signs element-involved \(display amount\) offenders /);
  assert.equal(mend.run(`(let ((offenders (get (first (ask ${task} collect items memorized matching (conflict: %))) 'offenders)))
			    (and (eq (first offenders) (first mend7-suggestions))
				 (eq (second offenders) (second mend7-suggestions))))`), "T");
  assert.deepEqual(notes(items), [
    "(revival-repair: what combined-changes was stopped now ((conflict different-signs (goat speed))) because (change under value not display))",
  ]);
});

test("with MEND, three suggestions on one element go through Ken's relationships of changes too", () => {
  const { task, items } = mend.combine("change:", change("low", "speed"), change("medium", "speed"), change("high", "speed"));
  // the two far apart conflict; the one between stands, unmerged (cosug.215:714-762)
  assert.equal(conflicts(items).length, 1);
  assert.match(conflicts(items)[0], /^\(conflict: type \(and top-bottom top-bottom\) element-involved \(change: \(and speed amount\)\) offenders /);
  assert.equal(mend.run(`(eq (first (ask ${task} collect items memorized matching (suggestion: %))) (second mend7-suggestions))`), "T");
  assert.deepEqual(notes(items), [
    "(revival-repair: what combined-changes was stopped now ((conflict (and top-bottom top-bottom) (goat speed)) (change: element (goat speed) amount (positive medium) speed medium)) because (change under value not display))",
  ]);
});

test("MEND leaves to Ken's own code what it can combine: a single change, and values that aren't changes", () => {
  for (const { combine, run } of [ken, mend]) {
    const one = combine("change-to:", changeTo("high", "path-length", "long"));
    assert.equal(run(`(eq (first (ask ${one.task} collect items)) (first mend7-suggestions))`), "T");
    assert.equal(notes(one.items).length, 0);
  }
  // as pass 1 combines an element's suggestions (cosug.215:93-97)
  const speeds = [
    "'(suggestion: element speed value low strength high source shy)",
    "'(suggestion: element speed value high strength low source kind)",
    "'(suggestion: element speed value medium strength medium source good)",
  ];
  const before = ken.combine("speed", ...speeds).items;
  const after = mend.combine("speed", ...speeds).items;
  assert.deepEqual(after, before);
  assert.equal(notes(after).length, 0);
  assert.equal(mend.run("(changes-under-value-to-combine? mend7-suggestions)"), "NIL");
});
