// REVIVE;MEND14 and REVIVE;MEND15 (M14 and M15): a fence no one can make, a guard with
// no one else to walk, and two goals that lead to each other. Cinderella needs none of
// them (her stepmother stands guard, the Prince walks across, and no goal leads back to
// its own character), so tools/check-1978.mjs can't notice one missing; these check
// that each is installed once its Ken file has loaded, and what it does on small cases.
// The stress stories show them in a whole film (node tools/run-story.mjs <story>
// --extensions mend): test/stories/stress/fence.lisp for M14's fence, and
// guard-self.lisp for M14's guard and M15.
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot } from "../src/pipeline.js";

function lisp(extensions = ["mend"]) {
  const L = boot(makeProjectFileSystem(), { extensions });
  const run = (src) => L.print(L.evalString(src));
  return { L, run };
}
const wraps = (run, f) => run(`(mapcar 'car (get '${f} 'revival-wraps))`);

test("MEND14 wraps score-suggestions round MEND5's and MEND10's, and extends stands-guard; not in 1978 mode", () => {
  const { run } = lisp();
  run("(load '|ken;chomet >|)");
  assert.equal(wraps(run, "score-suggestions"), "(MEND14 MEND10 MEND5)");
  run("(load '|ken;disply >|)");
  assert.equal(run("(get 'mend14-stands-guard 'revival-done)"), "T");
  const ken = lisp([]);
  ken.run("(load '|ken;chomet >|)");
  ken.run("(load '|ken;disply >|)");
  assert.equal(wraps(ken.run, "score-suggestions"), "NIL");
  assert.equal(ken.run("(get 'mend14-stands-guard 'revival-done)"), "NIL");
});

test("M14: DISPLY runs every display method of its but makes-fence and chases-off", () => {
  const { run } = lisp();
  for (const m of ["makes-fence", "chases-off"]) assert.equal(run(`(runs-in-director? '(${m} kid (between a b)))`), "NIL", m);
  for (const m of ["stands-guard", "chases-to", "pushes-around", "move-to"]) assert.equal(run(`(runs-in-director? '(${m} a b c))`), "T", m);
});

test("M14: of Ken's scores, the one Ani would choose is the first with the highest weighted sum", () => {
  const { run } = lisp();
  // the film's levels, as weighted-score reads them (chomet.123:239-252), all medium
  run("(load '|ken;cosug >|)"); // numberify (cosug.215:771-776)
  run("(defun film-level-of (x) 'medium)");
  const pkg = (name, s) => `(scores: suggestion (suggestion: element t value (method: type display value (${name} a b))) strength ${s} prerequisite 3 best-when 3 time-fit 3 originality 3 variety 3)`;
  assert.equal(run(`(method-of-score (best-of-scores '(${pkg("stands-guard", 2)} ${pkg("makes-fence", 4)} ${pkg("chases-to", 4)})))`), "(MAKES-FENCE A B)");
  assert.equal(run("(best-of-scores nil)"), "NIL");
});

test("M14: a guard with no one else to walk adds nothing for Director to run", () => {
  const { run } = lisp();
  run("(define t-sub something)");
  run("(ask t-sub set your movements to (nil (repeat 3 (and p1 p2) then note that (end-of nil) happened)))");
  run("(drop-nothing-to-run 't-sub '(stands-guard troll goat (away-from (vicinity-of goat) (vicinity-of troll))))");
  assert.equal(run("(ask t-sub recall your movements)"), "((REPEAT 3 (AND P1 P2) THEN NOTE THAT (END-OF NIL) HAPPENED))");
  assert.equal(run("(ask t-sub collect items memorized matching (revival-repair: %))"),
    "((REVIVAL-REPAIR: WHAT NOTHING-TO-RUN WAS NIL NOW DROPPED BECAUSE (NO-ONE-ELSE-WALKS (STANDS-GUARD TROLL GOAT (AWAY-FROM (VICINITY-OF GOAT) (VICINITY-OF TROLL))))))");
  // Cinderella's Kept Apart: the Prince walks across, nothing to take out, no note
  run("(define t-sub2 something)");
  run("(ask t-sub2 set your movements to ((repeat 3 (and p1 p2)) make-guarding-more-interesting))");
  run("(drop-nothing-to-run 't-sub2 '(stands-guard step-mother cinderella p))");
  assert.equal(run("(ask t-sub2 recall your movements)"), "((REPEAT 3 (AND P1 P2)) MAKE-GUARDING-MORE-INTERESTING)");
  assert.equal(run("(ask t-sub2 collect items)"), "NIL");
});

// Two director characters at places, with current goals, as Director has them.
function twoMovers(run, goalA, goalB) {
  run("(cs)");
  run("(ask current-goal-of list all your variable names)"); // INTERF loaded, as Director has it
  run("(load '|ken;dichar >|)");
  for (const [c, x] of [["t-a", 100.0], ["t-b", -100.0]]) {
    run(`(define ${c} director-character)`);
    run(`(ask ${c} set your position to (${x.toFixed(1)} 0.0))`);
    run(`(ask ${c} set your visibility to t)`);
  }
  run(`(ask t-a set your current-goal to ${goalA})`);
  run(`(ask t-b set your current-goal to ${goalB})`);
}

test("M15: two goals that lead to each other: the second time round, the character's own place", () => {
  const goals = ["(small-way-from-plus-size (vicinity-of t-b) (current-goal-of t-b) t-b)", "(current-goal-of t-a)"];
  // in 1978 mode, finding either finds the other for ever
  const ken = lisp([]);
  twoMovers(ken.run, ...goals);
  assert.throws(() => ken.run("(find-xy-position '(current-goal-of t-a) nil)"), /call stack/);
  const { run } = lisp();
  twoMovers(run, ...goals);
  assert.equal(wraps(run, "find-xy-position"), "(MEND15)");
  const at = run("(find-xy-position '(current-goal-of t-a) nil)");
  assert.match(at, /^\(XY-POSITION /);
  assert.equal(run("(ask position collect items memorized matching (revival-repair: %))"),
    "((REVIVAL-REPAIR: WHAT GOAL-LOOP WAS (CURRENT-GOAL-OF T-A) NOW (VICINITY-OF T-A) BECAUSE (ITS GOAL LEADS BACK TO IT)))");
  assert.equal(run(":revival-goals-being-found"), "NIL");
});

test("M15: a chain of goals that ends is found as before", () => {
  const goals = ["(small-way-from-plus-size (vicinity-of t-b) (current-goal-of t-b) t-b)", "(stationary-target (vicinity-of t-a) (xy-position 0.2 0.1))"];
  const ken = lisp([]);
  twoMovers(ken.run, ...goals);
  const { run } = lisp();
  twoMovers(run, ...goals);
  for (const p of ["(current-goal-of t-a)", "(current-goal-of t-b)", "(vicinity-of t-a)"]) {
    assert.equal(run(`(find-xy-position '${p} nil)`), ken.run(`(find-xy-position '${p} nil)`), p);
  }
  assert.equal(run(":revival-noted"), "NIL");
});
