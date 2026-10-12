// REVIVE;MEND13 (M13): two characters at one place. Cinderella never reckons a place from
// one place towards the same place, so tools/check-1978.mjs can't notice the repair
// missing; these check that it is installed once INTERF has loaded, and what it does.
// The stress stories show it in a whole film (node tools/run-story.mjs <story>
// --extensions mend): test/stories/stress/same-place.lisp (Director hung before the
// first frame) and sent-off-unseen.lisp (pass 2 overflowed the stack).
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot } from "../src/pipeline.js";

function lisp(extensions = ["mend"]) {
  const L = boot(makeProjectFileSystem(), { extensions });
  const run = (src) => L.print(L.evalString(src));
  run("(cs)");
  run("(load '|ken;interf >|)");
  return { L, run };
}

// two characters, as Director has them, at places
function twoAt(run, fox, rabbit) {
  run("(load '|ken;dichar >|)");
  for (const [c, [x, y]] of [["t-fox", fox], ["t-rabbit", rabbit]]) {
    run(`(define ${c} director-character)`);
    run(`(ask ${c} set your position to (${x.toFixed(1)} ${y.toFixed(1)}))`);
    run(`(ask ${c} set your visibility to t)`);
  }
}

test("MEND13 wraps towards-by-distance and move-from-xy-position once INTERF has loaded, and not in 1978 mode", () => {
  const { run } = lisp();
  assert.equal(run("(mapcar 'car (get 'move-from-xy-position 'revival-wraps))"), "(MEND13)");
  assert.equal(run("(mapcar 'car (get 'towards-by-distance 'revival-wraps))"), "(MEND13)");
  // INTERF or MEND13 loaded again: Ken's back, and wrapped again, once
  run("(load '|ken;interf >|)");
  run("(load '|revive;mend13 >|)");
  assert.equal(run("(mapcar 'car (get 'move-from-xy-position 'revival-wraps))"), "(MEND13)");
  const ken = lisp([]);
  assert.equal(ken.run("(get 'move-from-xy-position 'revival-wraps)"), "NIL");
});

test("in 1978 mode a place reckoned from a place towards itself is not a number", () => {
  const { run } = lisp([]);
  // 0.0 over 0.0 (interf.149:97): it prints as 0.0 but is not equal even to itself
  assert.equal(run("(let ((x (second (move-from-xy-position '(xy-position 0.0 0.0) '(xy-position 0.0 0.0) 0.0 nil)))) (= x x))"), "NIL");
});

test("M13: from a place towards itself goes straight up the distance, away from it straight down, as Ken's turtle would", () => {
  const { run } = lisp();
  // the turtle's bearing of its own place is 0, straight up (interf.149:79-87)
  assert.equal(run("(move-from-xy-position '(xy-position 0.1 0.2) '(xy-position 0.1 0.2) 0.15 nil)"), "(XY-POSITION 0.1 0.35)");
  assert.equal(run("(move-from-xy-position '(xy-position 0.1 0.2) '(xy-position 0.1 0.2) -0.15 nil)"), "(XY-POSITION 0.1 0.05)");
  // contact, no distance: the place itself
  assert.equal(run("(move-from-xy-position '(xy-position 0.1 0.2) '(xy-position 0.1 0.2) 0.0 nil)"), "(XY-POSITION 0.1 0.2)");
  // kept on the stage as Ken keeps any other (move-from-xy-position-1, interf.149:109-118)
  assert.equal(run("(move-from-xy-position '(xy-position 0.45 0.45) '(xy-position 0.45 0.45) 0.2 'keep)"), "(XY-POSITION 0.45 0.475)");
  // two places that are not one: Ken's, as in 1978
  const ken = lisp([]);
  for (const form of ["(move-from-xy-position '(xy-position 0.1 0.1) '(xy-position 0.3 0.1) 0.1 nil)",
    "(move-from-xy-position '(xy-position 0.1 0.1) '(xy-position 0.4 0.5) -0.2 'keep)"]) {
    assert.equal(run(form), ken.run(form), form);
  }
});

test("M13: contact with someone at the same place, and a place away from them, and the note", () => {
  const { run } = lisp();
  twoAt(run, [0, 0], [0, 0]);
  run("(define t-sub something)");
  // INTERF's contact (interf.149:291-305) and distance-away-from, asked in a subscene
  assert.equal(run("(towards-by-distance '(vicinity-of t-rabbit) '(vicinity-of t-fox) 't-sub 0.0 nil)"), "(XY-POSITION 0.0 0.0)");
  assert.equal(run("(find-xy-position '(contact-with t-rabbit by t-fox) nil)"), "(XY-POSITION 0.0 0.0)");
  assert.equal(run("(find-xy-position '(distance-away-from (vicinity-of t-fox) (vicinity-of t-rabbit) 0.1) nil)"), "(XY-POSITION 0.0 -0.1)");
  assert.equal(run("(ask t-sub collect items memorized matching (revival-repair: %))"),
    "((REVIVAL-REPAIR: WHAT SAME-PLACE WAS (FROM (VICINITY-OF T-RABBIT) TOWARDS (VICINITY-OF T-FOX)) NOW (XY-POSITION 0.0 0.0) BECAUSE (BOTH AT (XY-POSITION 0.0 0.0))))");
  assert.match(run(":revival-noted"), /\bT-SUB\b/);
  // apart, Ken's: no note
  const apart = lisp();
  twoAt(apart.run, [0, 0], [100, 0]);
  apart.run("(define t-sub something)");
  apart.run("(towards-by-distance '(vicinity-of t-rabbit) '(vicinity-of t-fox) 't-sub 0.05 nil)");
  assert.equal(apart.run("(ask t-sub collect items)"), "NIL");
});

test("M13: a step that is not a number is not halved for ever; the place stays where it was", () => {
  const nan = "(//$ 0.0 0.0)";
  const form = `(move-from-xy-position-1 0.1 0.2 ${nan} ${nan} ${nan} ${nan} 'keep)`;
  // in 1978 mode the halving never brings it on the stage (interf.149:113-117)
  const ken = lisp([]);
  assert.throws(() => ken.run(form), /call stack/);
  const { run } = lisp();
  run("(define t-sub something)");
  run("(setq :revival-towards '(nil nil t-sub))");
  assert.equal(run(form), "(XY-POSITION 0.1 0.2)");
  assert.equal(run("(ask t-sub collect items memorized matching (revival-repair: %))"),
    "((REVIVAL-REPAIR: WHAT NO-STEP WAS (NOT-A-NUMBER) NOW (XY-POSITION 0.1 0.2) BECAUSE (HALVING NEVER BRINGS IT ON THE STAGE)))");
  // something over 0.0, likewise
  assert.equal(run("(move-from-xy-position-1 0.1 0.2 (//$ 1.0 0.0) 0.2 (//$ 1.0 0.0) 0.0 'keep)"), "(XY-POSITION 0.1 0.2)");
  // numbers are halved as Ken halves them, and a step not kept on the stage is his
  for (const f of ["(move-from-xy-position-1 0.1 0.2 0.9 0.2 0.8 0.0 'keep)", "(move-from-xy-position-1 0.1 0.2 0.9 0.2 0.8 0.0 nil)"]) {
    assert.equal(run(f), ken.run(f), f);
  }
});
