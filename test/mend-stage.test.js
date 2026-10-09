// REVIVE;MEND5 and REVIVE;MEND6 (reports/chapter-x/PLAN.md, M5 and M6): missing display
// methods and move-to; characters in the scene first, and bringing an off-stage
// victim on. Cinderella needs none of these repairs, so tools/check-1978.mjs can't
// notice one that is missing; these check that each is installed once its Ken file
// has loaded, and what it does on small cases made here. The stress stories
// (test/stories/stress/meets-alone.lisp, offstage-victim.lisp) show them in a whole
// film: node tools/run-story.mjs <story> --extensions mend.
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

test("MEND5 and MEND6 wrap Ken's functions once their files have loaded, and not before", () => {
  const { run } = lisp();
  assert.equal(wraps(run, "score-suggestions"), "NIL");
  // move-to is known before DISPLY loads, as the tags know DISPLY's own actors
  assert.equal(run("(exists? 'move-to)"), "|KEN;DISPLY|");
  assert.equal(run("(actor-of 'move-to dont-autoload)"), "NIL");
  run("(load '|ken;chomet >|)");
  run("(load '|ken;sugest >|)");
  run("(load '|ken;scene >|)");
  run("(load '|ken;disply >|)");
  assert.match(wraps(run, "score-suggestions"), /\bMEND5\b/);
  for (const f of ["character-that-satisfies", "first-sibling-that-is-or-does", "first-sibling-that-satisfies-relationship", "first-sibling-that-is-not-related", "maximum-ideal-time-of"]) {
    assert.match(wraps(run, f), /\bMEND6\b/, f);
  }
  assert.notEqual(run("(actor-of 'move-to dont-autoload)"), "NIL");
  assert.notEqual(run("(ask move-to are you a display-method)"), "NIL");
  assert.equal(run("(ask move-to collect all prerequisites of (move-to goat (vicinity-of troll)))"), "((CAN-MOVE GOAT (VICINITY-OF TROLL)))");
  assert.equal(run("(list (get 'mend5-move-to 'revival-done) (get 'mend6-bring-on 'revival-done))"), "(T T)");
  // CHOMET loaded again: Ken's score-suggestions back, and wrapped again, once
  run("(load '|ken;chomet >|)");
  assert.equal(wraps(run, "score-suggestions").match(/\bMEND5\b/g).length, 1);
});

test("in 1978 mode none of this is there", () => {
  const { run } = lisp([]);
  assert.equal(run("(exists? 'move-to)"), "NIL");
  run("(load '|ken;sugest >|)");
  run("(load '|ken;chomet >|)");
  assert.equal(run("(get 'first-sibling-that-is-or-does 'revival-wraps)"), "NIL");
  assert.equal(run("(get 'score-suggestions 'revival-wraps)"), "NIL");
});

test("M5: a display method no file defines is rejected with no-such-display-method, and noted", () => {
  const { run } = lisp();
  run("(load '|ken;chomet >|)");
  run("(define mend-task something)");
  run(`(ask mend-task memorize
         (suggestion: element (convey (meets goat troll))
                      value (method: type display value (no-such-method goat troll))
                      strength high source meets))`);
  // Ken's score-suggestions would ask NO-SUCH-METHOD for its tasks-used-in (chomet.123:436-439)
  assert.equal(run("(score-suggestions (ask mend-task collect items memorized matching (suggestion: %)) 'mend-task)"), "NIL");
  // rejected as Ken's reject-suggestion rejects (chomet.123:305-309): forgotten, and listed with its reason
  assert.equal(run("(get (first (ask mend-task recall your rejected-suggestions)) 'reason)"), "(NO-SUCH-DISPLAY-METHOD NO-SUCH-METHOD)");
  assert.equal(run("(ask mend-task collect items memorized matching (suggestion: %))"), "NIL");
  assert.equal(run("(ask mend-task collect items memorized matching (revival-repair: %))"),
    "((REVIVAL-REPAIR: WHAT NO-SUCH-DISPLAY-METHOD WAS (NO-SUCH-METHOD GOAT TROLL) NOW REJECTED BECAUSE NOT-DEFINED))");
  assert.match(run(":revival-noted"), /\bMEND-TASK\b/);
});

// Three families of siblings (most recently defined first, as Ani's characters are)
// and a scene whose tasks name some of them.
function withAScene() {
  const { L, run } = lisp();
  run("(load '|ken;sugest >|)");
  run("(load '|ken;prereq >|)"); // likes, for friend-of
  run(`(progn (define t-a something) (define t-troll t-a) (define t-imp t-a) (define t-kid t-a) (define t-elf t-a) (define t-goat t-a)
              (define t-b something) (define t-fox t-b) (define t-cub t-b) (define t-hen t-b)
              (define t-c something) (define t-owl t-c) (define t-mole t-c) (define t-bat t-c))`);
  const related = (a, b, word) =>
    run(`(progn (ask something make (relationship-of ${a} ${b}))
                (ask (relationship-of ${a} ${b}) memorize (description: type relationship descriptor ${word} source initial-description)))`);
  related("t-troll", "t-goat", "hates");
  related("t-kid", "t-troll", "hates");
  related("t-fox", "t-hen", "loves");
  related("t-fox", "t-cub", "likes");
  const task = (name, description, who, scene) =>
    run(`(define ${name} something
           (set your task to (task: description ${description} for-who ${who} source initial-description))
           (set your scene to ${scene}))`);
  run("(define t-scene something (set your convey-tasks to (t-task-1 t-task-2)) (set your establish-tasks to (t-task-3 t-task-4 t-task-5)))");
  task("t-task-1", "(accompanys t-kid t-cub)", "t-kid", "t-scene");
  task("t-task-2", "(meets t-imp t-mole)", "t-imp", "t-scene");
  task("t-task-3", "(personality t-troll)", "t-troll", "t-scene");
  task("t-task-4", "(personality t-fox)", "t-fox", "t-scene");
  task("t-task-5", "(personality t-owl)", "t-owl", "t-scene");
  run("(define t-scene-2 something (set your establish-tasks to (t-task-6)))");
  task("t-task-6", "(relationship (relationship-of t-troll t-elf))", "t-troll", "t-scene-2");
  return { L, run };
}

test("M6: friend-of, enemy-of and stranger-of look first among everyone named in the scene", () => {
  const { run } = withAScene();
  assert.equal(run("(ask t-troll recall your siblings)"), "(T-GOAT T-ELF T-KID T-IMP)");
  // Ken's picks, anywhere (sugest.123:357-395); the goat, the hen and the bat are in no task
  assert.equal(run("(first-sibling-that-is-or-does 'hates 't-troll)"), "T-GOAT");
  assert.equal(run("(first-sibling-that-satisfies-relationship 't-fox 'likes)"), "T-HEN");
  assert.equal(run("(first-sibling-that-is-not-related 't-owl)"), "T-BAT");
  // for a task of the scene, the first named in the scene who fits; the cub and the
  // mole are named only as the objects of tasks, which SCENE's scene-participation
  // doesn't record (scene.9:463-465)
  assert.equal(run("(character-that-satisfies '(enemy-of t-troll nil) 't-task-3)"), "T-KID");
  assert.equal(run("(character-that-satisfies '(friend-of t-fox nil) 't-task-4)"), "T-CUB");
  assert.equal(run("(character-that-satisfies '(stranger-of t-owl nil) 't-task-5)"), "T-MOLE");
  const note = (task) => run(`(ask ${task} collect items memorized matching (revival-repair: %))`);
  assert.equal(note("t-task-3"), "((REVIVAL-REPAIR: WHAT IN-SCENE-FIRST WAS T-GOAT NOW T-KID BECAUSE (NAMED-IN T-SCENE)))");
  assert.equal(note("t-task-4"), "((REVIVAL-REPAIR: WHAT IN-SCENE-FIRST WAS T-HEN NOW T-CUB BECAUSE (NAMED-IN T-SCENE)))");
  assert.equal(note("t-task-5"), "((REVIVAL-REPAIR: WHAT IN-SCENE-FIRST WAS T-BAT NOW T-MOLE BECAUSE (NAMED-IN T-SCENE)))");
});

test("M6: when no one in the scene fits, Ken's pick stands, with no note", () => {
  const { run } = withAScene();
  // t-scene-2 names the elf, whom the troll doesn't hate
  assert.equal(run("(character-that-satisfies '(enemy-of t-troll nil) 't-task-6)"), "T-GOAT");
  assert.equal(run("(ask t-task-6 collect items)"), "NIL");
  // asked outside a task's suggestions, as in 1978
  assert.equal(run("(first-sibling-that-is-or-does 'hates 't-troll)"), "T-GOAT");
  assert.equal(run(":revival-noted"), "NIL");
});

// A subscene where the bear is on the stage and the goat is off it, below the picture.
function withPlaces() {
  const { run } = lisp();
  run("(cs)"); // pass 2 measures places on the TV, as Ken's saved Director did
  run("(load '|ken;interf >|)");
  run("(load '|ken;char >|)");
  run("(define t-goat character)");
  run("(define t-bear character)");
  const at = (who, where) => `(set your (location-of ${who}) to (place: where ${where} why test status cool))`;
  run(`(define t-sub something ${at("t-goat", "(xy-position 0.07 -0.6)")} ${at("t-bear", "(xy-position 0.07 -0.09)")})`);
  run(`(define t-sub-2 something ${at("t-bear", "(xy-position 0.07 -0.09)")})`);
  run(`(define t-sub-3 something (set your transition-type to cut) ${at("t-bear", "(xy-position 0.07 -0.09)")})`);
  run(`(define t-sub-4 something ${at("t-goat", "(medium-distance-from-and-offstage (vicinity-of t-bear))")} ${at("t-bear", "(xy-position 0.07 -0.09)")})`);
  return { run };
}

test("M6: who starts the subscene off the stage, and where she comes on", () => {
  const { run } = withPlaces();
  assert.equal(run("(off-the-stage? 't-goat 't-sub)"), "T");
  assert.equal(run("(off-the-stage? 't-bear 't-sub)"), "NIL");
  assert.notEqual(run("(starts-off-the-stage? 't-goat 't-bear 't-sub)"), "NIL");
  assert.equal(run("(starts-off-the-stage? 't-bear 't-goat 't-sub)"), "NIL");
  // placed off it, by PLACE's "if no cut" place
  assert.notEqual(run("(starts-off-the-stage? 't-goat 't-bear 't-sub-4)"), "NIL");
  // no place yet, the bear placed and no cut: PLACE will put her off the stage
  assert.notEqual(run("(starts-off-the-stage? 't-goat 't-bear 't-sub-2)"), "NIL");
  // after a cut PLACE puts both on the stage
  assert.equal(run("(starts-off-the-stage? 't-goat 't-bear 't-sub-3)"), "NIL");
  // she comes on half way towards the bear
  assert.equal(run("(find-xy-position (getting-on-stage-place 't-goat 't-bear) 't-sub)"), "(XY-POSITION 0.07 -0.345)");
  assert.equal(run("(half-way-from-where-place-puts 't-bear 't-sub-2)"), "0.255");
});

test("M6: the bringing on runs before the method's own movement", () => {
  const { run } = lisp();
  run("(define t-sub something (set your movements to ((sequence: a b) (and c d))))");
  run("(bring-on-first '(activity-of getting-on-stage 1) 't-sub)");
  assert.equal(run("(ask t-sub recall your movements)"), "((SEQUENCE: (ACTIVITY-OF GETTING-ON-STAGE 1) (SEQUENCE: A B)) (AND C D))");
});
