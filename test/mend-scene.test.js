// REVIVE;MEND9 and REVIVE;MEND11: SCENE's wander-around, which no 1978 file defines,
// and a running time for a task Ani can't do when CHOMET adjusts the scene's lengths.
// Cinderella needs neither (she never plans wander-around, and her scenes never need
// adjusting), so tools/check-1978.mjs can't notice them missing; these check that each
// is installed once its Ken file has loaded, and what it does with SCENE's own
// subscenes, made here. The stress stories test/stories/stress/feeling-only-first.lisp
// and cant-do-adjusted.lisp show them in a whole film:
// node tools/run-story.mjs <story> --extensions mend.
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
const notes = (run, actor) => run(`(ask ${actor} collect items memorized matching (revival-repair: %))`);

test("MEND9 and MEND11 are installed once their files of Ken's have loaded, and not before", () => {
  const { run } = lisp();
  // wander-around is known before DISPLY loads, as the tags know DISPLY's own actors
  assert.equal(run("(exists? 'wander-around)"), "|KEN;DISPLY|");
  assert.equal(run("(actor-of 'wander-around dont-autoload)"), "NIL");
  assert.equal(wraps(run, "adjust-task-lengths"), "NIL");
  run("(load '|ken;disply >|)");
  run("(load '|ken;chomet >|)");
  assert.notEqual(run("(actor-of 'wander-around dont-autoload)"), "NIL");
  assert.notEqual(run("(ask wander-around are you a display-method)"), "NIL");
  assert.equal(wraps(run, "adjust-task-lengths"), "(MEND11)");
  // DISPLY and CHOMET loaded again: wander-around defined once, Ken's
  // adjust-task-lengths back and wrapped again, once
  run("(load '|ken;disply >|)");
  run("(load '|ken;chomet >|)");
  assert.equal(run("(get 'mend9-wander-around 'revival-done)"), "T");
  assert.equal(wraps(run, "adjust-task-lengths"), "(MEND11)");
});

test("in 1978 mode none of this is there", () => {
  const { run } = lisp([]);
  assert.equal(run("(exists? 'wander-around)"), "NIL");
  run("(load '|ken;disply >|)");
  run("(load '|ken;chomet >|)");
  assert.equal(run("(actor-of 'wander-around dont-autoload)"), "NIL");
  assert.equal(wraps(run, "adjust-task-lengths"), "NIL");
});

// A scene of SCENE's with two subscenes (as RUN starts one, run.65:38), a goat and a
// troll with their special dynamics in the first, the troll's fast, and the first
// subscene's running time.
function withAScene(runningTime = "20.0") {
  const { L, run } = lisp();
  run("(cs)"); // pass 2 measures places on the TV, as Ken's saved Director did
  run("(load '|ken;scene >|)");
  run("(load '|ken;char >|)");
  run("(define t-goat character)");
  run("(define t-troll character)");
  run("(ask subscene set your subscene-count to 0)");
  run("(define t-scene something)");
  run("(ask subscene make subscene of t-scene)");
  run("(ask subscene make subscene of t-scene)");
  run(`(ask (subscene-of t-scene 1) set your running-time to ${runningTime})`);
  for (const [who, speed] of [["t-goat", "medium"], ["t-troll", "high"]]) {
    const sd = `(special-dynamics-of ${who} in (subscene-of t-scene 1))`;
    run(`(ask special-dynamics make ${sd})`);
    run(`(ask ${sd} set your speed to ${speed})`);
    run(`(ask ${who} set your ${sd} to ${sd})`);
  }
  // as SCENE's plan your actions plans an action (scene.9:207-209)
  const wander = (who) => run(`(ask ,(ask wander-around make interned offspring) plan wander-around ${who} in (subscene-of t-scene 1))`);
  return { L, run, wander };
}

test("M9: a wander is walks across the stage and back, for the subscene's running time", () => {
  const { run, wander } = withAScene("20.0");
  const plan = wander("t-goat");
  assert.match(plan, /^\(ACTIVITY-OF WANDER-AROUND \d+\)$/);
  assert.equal(run(`(ask ${plan} recall your begin-time)`), "0.0");
  // a walk across the stage, corner to corner, at medium speed: 8 seconds a screen
  // (interf.149:914) for 1.06 screens, and a third of a second to ease in (place.45:530)
  assert.equal(run("(across-the-stage)"), "1.0606602");
  assert.equal(run("(get (ask (subscene-of t-scene 1) recall your (time-estimates-for (wander-around t-goat))) 'ideal)"), "8.8152814");
  // so 20 seconds is two walks of 10, each to the place farthest from where it starts,
  // stopping when there or when its time is up
  const walks = run(`(rest (first (ask ${plan} recall your plans)))`);
  assert.equal(run(`(length (rest (first (ask ${plan} recall your plans))))`), "2");
  assert.equal(run(`(first (ask ${plan} recall your plans))`).slice(0, 11), "(SEQUENCE: ");
  for (const part of [
    "(ASK T-GOAT INITIALIZE YOUR CURVATURE-SIGN TOWARDS (GOOD-DISTANCE-FROM (VICINITY-OF T-GOAT)))",
    `(ASK ${plan} CAUSE (T-GOAT) TO GRADUALLY GO IN ARC CAREFUL OF COLLISIONS TO (GOOD-DISTANCE-FROM (VICINITY-OF T-GOAT)) AS STATIONARY-TARGET STOPPING IF (STOP-IF-EITHER-WANTS-TO (STOP-AFTER-SO-MANY-SECONDS 10.0) (STOP-WHEN-THERE (QUOTE (SUBSCENE-OF T-SCENE 1)))))`,
  ]) assert.equal(walks.split(part).length - 1, 2, part);
  // with the goat's own dynamics, not stretched, which the subscene keeps to save
  assert.match(run("(ask (subscene-of t-scene 1) recall your special-dynamics)"), /\(SPECIAL-DYNAMICS-OF T-GOAT IN \(SUBSCENE-OF T-SCENE 1\)\)-\d+/);
  assert.match(walks, /\(ASK T-GOAT SET YOUR SPECIAL-DYNAMICS TO \|\(SPECIAL-DYNAMICS-OF T-GOAT IN \(SUBSCENE-OF T-SCENE 1\)\)-\d+\|\)/);
  // the fast troll crosses in 4.57 seconds: four walks of 5
  const trolls = wander("t-troll");
  assert.equal(run(`(length (rest (first (ask ${trolls} recall your plans))))`), "4");
  assert.match(run(`(ask ${trolls} recall your plans)`), /\(STOP-AFTER-SO-MANY-SECONDS 5\.0\)/);
  // the subscene notes that each plan is the revival's
  assert.equal(notes(run, "(subscene-of t-scene 1)"),
    "((REVIVAL-REPAIR: WHAT DEFINED-ACTION WAS NOT-DEFINED NOW (WANDER-AROUND T-TROLL) BECAUSE (NAMED-IN SCENE)) " +
    "(REVIVAL-REPAIR: WHAT DEFINED-ACTION WAS NOT-DEFINED NOW (WANDER-AROUND T-GOAT) BECAUSE (NAMED-IN SCENE)))");
  assert.match(run(":revival-noted"), /\(SUBSCENE-OF T-SCENE 1\)/);
});

test("M9: shorter than a walk across, one walk that stops when the time is up; none, it stops at once", () => {
  for (const time of ["3.0", "0.0"]) {
    const { run, wander } = withAScene(time);
    const plan = wander("t-goat");
    assert.equal(run(`(length (rest (first (ask ${plan} recall your plans))))`), "1");
    assert.ok(run(`(ask ${plan} recall your plans)`).includes(`(STOP-AFTER-SO-MANY-SECONDS ${time})`), time);
  }
});

test("M9: one with no place yet is placed, in the middle or a medium distance from one placed", () => {
  const { run, wander } = withAScene();
  assert.equal(run("(located? '(vicinity-of t-goat) '(subscene-of t-scene 1))"), "NIL");
  wander("t-goat");
  assert.equal(run("(ask (subscene-of t-scene 1) recall your (location-of t-goat))"),
    "(PLACE: WHERE (SCREEN-POSITION MIDDLE MIDDLE) WHY (SO THAT (WANDER-AROUND T-GOAT)) STATUS (PLACED BY (SUBSCENE-OF T-SCENE 1)))");
  wander("t-troll");
  assert.equal(run("(ask (subscene-of t-scene 1) recall your (location-of t-troll))"),
    "(PLACE: WHERE (MEDIUM-DISTANCE-FROM (VICINITY-OF T-GOAT)) WHY (SO THAT (WANDER-AROUND T-TROLL)) STATUS (PLACED BY (SUBSCENE-OF T-SCENE 1)))");
  assert.equal(run("(find-xy-position '(vicinity-of t-troll) '(subscene-of t-scene 1))"), "(XY-POSITION 0.25 0.25)");
  // one already placed (by the last scene's POSIT, say) stays where it is
  const { run: run2, wander: wander2 } = withAScene();
  run2("(ask (subscene-of t-scene 1) set your (location-of t-goat) to (place: where (xy-position 0.3 -0.2) why test status cool))");
  wander2("t-goat");
  assert.equal(run2("(ask (subscene-of t-scene 1) recall your (location-of t-goat))"), "(PLACE: WHERE (XY-POSITION 0.3 -0.2) WHY TEST STATUS COOL)");
  // and the next subscene is told nothing: pass 2 goes on from where it was
  assert.equal(run2("(ask (subscene-of t-scene 2) recall your (location-of t-goat))"), "NIL");
});

test("M9: with the subscene's methods' movements, the wander joins them; with none, Director runs every plan", () => {
  const { run, wander } = withAScene();
  const alone = wander("t-goat");
  assert.equal(run("(ask (subscene-of t-scene 1) recall your movements)"), "NIL");
  run("(ask (subscene-of t-scene 1) set your movements to ((sequence: (activity-of exit-by-character 1))))");
  const joined = wander("t-troll");
  assert.equal(run("(ask (subscene-of t-scene 1) recall your movements)"), `(${joined} (SEQUENCE: (ACTIVITY-OF EXIT-BY-CHARACTER 1)))`);
  assert.notEqual(alone, joined);
});

// A scene of SCENE's whose tasks CHOMET's adjust-task-lengths passes over (chomet.123:
// 156-157): the kid's, which Ani can't do, alone in the first subscene; in the second,
// the troll's, handled by his convey tasks, and one Ani can't do that already has a
// time; and one handled by convey tasks that no subscene lists.
function withTasksPassedOver(extensions) {
  const { run } = lisp(extensions);
  run("(load '|ken;scene >|)");
  run("(load '|ken;chomet >|)");
  run("(ask subscene set your subscene-count to 0)");
  run("(define t-scene something)");
  run("(ask subscene make subscene of t-scene)");
  run("(ask subscene make subscene of t-scene)");
  run("(define t-kid-task something (set your status to cant-do))");
  run("(define t-troll-task something (set your status to being-handled-by-convey-tasks))");
  run("(define t-timed-task something (set your status to cant-do) (set your running-time to 2.5))");
  run("(define t-handled-task something (set your status to being-handled-by-convey-tasks))");
  run("(ask (subscene-of t-scene 1) set your establish-tasks to (t-kid-task))");
  run("(ask (subscene-of t-scene 2) set your establish-tasks to (t-troll-task t-timed-task))");
  run("(ask t-scene set your tasks to (t-kid-task t-troll-task t-timed-task t-handled-task))");
  // shorten the scene's tasks by 10 seconds (redistribute-time-for-tasks, chomet.123:62-64)
  run("(adjust-task-lengths 't-scene -10.0 nil)");
  return { run };
}

test("M11: a subscene's task that adjust-task-lengths passes over reads 0.0, as ideal-time-for-task gives it", () => {
  const { run } = withTasksPassedOver(["mend"]);
  // Ken's loop timed none of them, and set the scene's running time to their total
  assert.equal(run("(ask t-scene recall your running-time)"), "0.0");
  assert.equal(run("(ask t-kid-task recall your running-time)"), "0.0");
  assert.equal(run("(ask t-troll-task recall your running-time)"), "0.0");
  assert.equal(run("(ask t-timed-task recall your running-time)"), "2.5");
  // a task no subscene reads keeps Ken's NIL
  assert.equal(run("(ask t-handled-task recall your running-time)"), "NIL");
  assert.equal(run("(ask (subscene-of t-scene 1) recall your running-time)"), "0.0");
  assert.equal(run("(ask (subscene-of t-scene 2) recall your running-time)"), "2.5");
  assert.equal(notes(run, "t-kid-task"), "((REVIVAL-REPAIR: WHAT NO-RUNNING-TIME WAS NIL NOW 0.0 BECAUSE (STATUS CANT-DO)))");
  assert.equal(notes(run, "t-troll-task"), "((REVIVAL-REPAIR: WHAT NO-RUNNING-TIME WAS NIL NOW 0.0 BECAUSE (STATUS BEING-HANDLED-BY-CONVEY-TASKS)))");
  assert.equal(notes(run, "t-timed-task"), "NIL");
  assert.equal(notes(run, "t-handled-task"), "NIL");
});

test("M11: in 1978 mode the first subscene's running time is the max of a NIL, and stops", () => {
  const { run } = withTasksPassedOver([]);
  assert.equal(run("(ask t-kid-task recall your running-time)"), "NIL");
  assert.throws(() => run("(ask (subscene-of t-scene 1) recall your running-time)"), /not a number: NIL/);
});
