// REVIVE;MEND10 and REVIVE;MEND12 (M10 and M12): alone with no one else to send off,
// and moves that never end. Cinderella needs neither repair,
// so tools/check-1978.mjs can't notice one that is missing; these check that each is
// installed once its Ken file has loaded, and what it does on small cases made here.
// The stress stories show them in a whole film (node tools/run-story.mjs <story>
// --extensions mend): test/stories/stress/alone-two.lisp for M10, and
// test/stories/stress/pushee-blocked.lisp, push-mutual.lisp and
// test/stories/red-riding-hood.lisp for M12; tools/check-no-change.mjs checks that M12
// leaves alone moves that end, however long they take.
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

// A convey task with CONVEY's suggestion for (alone fox crow) when the fox and the crow
// are the story's only characters (convey.64:236-243), and, if given, another.
function aloneTask(run, other = null) {
  run("(define mend-task something)");
  run(`(ask mend-task memorize
         (suggestion: element (convey (alone fox crow))
                      value (method: type display value (exit-by nil) strength high source alone)))`);
  if (other) run(`(ask mend-task memorize ${other})`);
}

test("MEND10 wraps score-suggestions once CHOMET has loaded, round MEND5's", () => {
  const { run } = lisp();
  assert.equal(wraps(run, "score-suggestions"), "NIL");
  run("(load '|ken;chomet >|)");
  assert.equal(wraps(run, "score-suggestions"), "(MEND10 MEND5)");
  // CHOMET or MEND10 loaded again: Ken's score-suggestions back, and wrapped again, once each
  run("(load '|ken;chomet >|)");
  run("(load '|revive;mend10 >|)");
  assert.equal(wraps(run, "score-suggestions"), "(MEND10 MEND5)");
});

test("in 1978 mode score-suggestions is Ken's", () => {
  const { run } = lisp([]);
  run("(load '|ken;chomet >|)");
  assert.equal(wraps(run, "score-suggestions"), "NIL");
  assert.equal(run("(get 'no-one-to-send-off? 'expr)"), "NIL");
});

test("M10: alone's (exit-by nil) is rejected with no-one-else-to-send-off, and noted", () => {
  const { run } = lisp();
  run("(load '|ken;chomet >|)");
  aloneTask(run);
  // Ken's get-estimated-time-of would stop on it: exit-by of no one has no time bound
  // (disply.311:1008-1020, chomet.123:448-460)
  assert.equal(run("(score-suggestions (get-display-method-suggestions 'mend-task) 'mend-task)"), "NIL");
  // rejected as Ken's reject-suggestion rejects (chomet.123:305-309): forgotten, and listed with its reason
  assert.equal(run("(get (first (ask mend-task recall your rejected-suggestions)) 'reason)"), "(NO-ONE-ELSE-TO-SEND-OFF)");
  assert.equal(run("(get-display-method-suggestions 'mend-task)"), "NIL");
  assert.equal(run("(ask mend-task collect items memorized matching (revival-repair: %))"),
    "((REVIVAL-REPAIR: WHAT ALREADY-ALONE WAS (EXIT-BY NIL) NOW REJECTED BECAUSE NO-ONE-ELSE-TO-SEND-OFF))");
  assert.match(run(":revival-noted"), /\bMEND-TASK\b/);
  // so no display method is chosen, and Ken's approve-or-remake-tasks-choices makes the
  // task cant-do (chomet.123:23-37)
  aloneTask(run);
  assert.match(run("(choose-a-display-method (get-display-method-suggestions 'mend-task) 'mend-task)"), /^\(NO-FEASIBLE-SUGGESTIONS-AMONG/);
  assert.equal(run("(ask mend-task recall your current-choice)"), "NIL");
});

test("M10: only an exit-by of no one is set aside", () => {
  const { run } = lisp();
  run("(load '|ken;chomet >|)");
  assert.equal(run("(no-one-to-send-off? '(exit-by nil))"), "T");
  // Cinderella's alone sends off the fairy godmother and the stepmother (reports/pass2/ken1-meet.mini)
  assert.equal(run("(no-one-to-send-off? '(exit-by (fairy-godmother step-mother)))"), "NIL");
  assert.equal(run("(no-one-to-send-off? '(move-to fox (vicinity-of crow)))"), "NIL");
  // a method no file defines still goes to MEND5, inside, with its own reason
  aloneTask(run, "(suggestion: element (convey (alone fox crow)) value (method: type display value (no-such-method fox)) strength high source alone)");
  assert.equal(run("(score-suggestions (get-display-method-suggestions 'mend-task) 'mend-task)"), "NIL");
  assert.equal(run("(mapcar (function (lambda (r) (get r 'reason))) (ask mend-task recall your rejected-suggestions))"),
    "((NO-SUCH-DISPLAY-METHOD NO-SUCH-METHOD) (NO-ONE-ELSE-TO-SEND-OFF))");
});

// A Lisp that has loaded DICHAR as the filming job does (after the TV is started), with
// a character going to a stationary place and the stop condition go in arc asks for the
// move, told the move's goal as go in arc tells it (REVIVE;MEND12's extension of go in
// arc), and the movie's frames a second.
const GOAL = "(stationary-target (vicinity-of t-kid) (xy-position 0.1 0.1))";
function withAMove(extensions = ["mend"], fps = 4) {
  const { L, run } = lisp(extensions);
  run("(cs)");
  run("(load '|ken;dichar >|)");
  run("(load '|ken;interf >|)");
  run("(define t-sd special-dynamics (set your speed to medium))");
  run("(define t-mover director-character)");
  run("(ask t-mover set your position to (10.0 20.0))");
  run("(ask t-mover set your special-dynamics to t-sd)");
  run(`(ask t-mover set your current-goal to ${GOAL})`);
  run("(define t-sub something)");
  newCondition(run, extensions.length > 0);
  run(`(setq :frames-per-second ${fps} :ticks-per-frame 1)`);
  return { L, run };
}
function newCondition(run, told = true) {
  run("(setq t-condition (stop-when-there 't-sub))");
  if (told) run(`(ask ,t-condition set your revival-goal to ${GOAL})`);
}

// Ask the condition each tick, as go in arc does (dichar.103:173-176), with 100.0 to go
// (the distance go in arc reckons along the arc), until it says stop: the ticks it took,
// and its answer. Between one tick and the next the mover is put where place says, a
// Lisp form of the tick i; with waiting, it takes Ken's careful step towards a place
// where the kid stands, and backs up to wait for him (dichar.103:285-318).
const ticksToStop = (run, most = 100, place = "(list 10.0 20.0)", waiting = false) =>
  run(`(do ((i 1 (1+ i))
            (a nil (progn ${waiting ? WAITING_STEP : `(ask t-mover set your position to ,${place})`}
                          (ask ,t-condition should t-mover stop after moving 1.0 of 100.0 to (0.0 0.0)))))
           ((or a (> i ${most})) (list (1- i) a)))`);
const WAITING_STEP = "(ask t-mover forward 5.0 towards (0.0 0.0) originally (stationary-target (vicinity-of t-elf) (xy-position 0.0 0.0)) dragging nil along avoiding (t-kid) 0.0 degrees off target)";
function withTheKidInTheWay(run) {
  run("(define t-kid director-character)");
  run("(ask t-kid set your position to (0.0 0.0))");
}
const parse = (answer) => answer.replace(/[()]/g, "").split(" ");

// Ani's most for a walk is 2.5 times its ideal, the distance at the mover's speed and a
// third of a second (place.45:528-559): here the 100.0 go in arc gives the condition, at
// medium speed.
const mostFor = (run) => 2.5 * (100 / Number(run("(ask t-sd yield real value for speed)")) + 0.33);
const notes = (run) => run("(ask t-sub collect items memorized matching (revival-repair: %))");
const most = (run) => run("(ask ,t-condition recall your revival-most-time)");

test("MEND12 extends go in arc and the arc stop condition once DICHAR has loaded, and not in 1978 mode", () => {
  const { run } = withAMove();
  assert.equal(run("(get 'mend12-moves 'revival-done)"), "T");
  // MEND12 loaded again, so its hook fires again: still one extension (two would each
  // count the time, and stop the move in half the ticks)
  run("(load '|revive;mend12 >|)");
  assert.equal(ticksToStop(run), ticksToStop(withAMove().run));
  const ken = withAMove([]);
  assert.equal(ken.run("(get 'mend12-moves 'revival-done)"), "NIL");
  // Ken's goes on for ever, standing still
  assert.equal(ticksToStop(ken.run), "(100 NIL)");
});

test("M12: go in arc tells the condition the move's own goal, not the mover's current one", () => {
  const { run } = withAMove();
  newCondition(run, false);
  // a character in two moves at once has the current goal of the one started last
  // (ACTION sets it on everyone in a move, action.152:283, 293)
  run("(ask t-mover set your current-goal to (contact-with t-someone-else by t-mover))");
  run("(ask t-mover set your last-curvature-sign to 1.0)");
  assert.match(run(`(ask t-mover go in arc regardless of collisions dragging nil along to ${GOAL} stopping if ,t-condition)`), /^\(GO IN ARC /);
  assert.equal(run("(ask ,t-condition recall your revival-goal)"), GOAL.toUpperCase());
  // and its most, from the distance go in arc gave it along the arc
  assert.ok(Number(most(run)) > 0);
  // in 1978 mode go in arc is Ken's alone
  const ken = withAMove([]);
  ken.run("(ask t-mover set your last-curvature-sign to 1.0)");
  ken.run(`(ask t-mover go in arc regardless of collisions dragging nil along to ${GOAL} stopping if ,t-condition)`);
  assert.equal(ken.run("(ask ,t-condition recall your revival-goal)"), "NIL");
});

test("M12: a mover that waits for longer than the most stops as if there", () => {
  for (const fps of [4, 24]) {
    const { run } = withAMove(["mend"], fps);
    withTheKidInTheWay(run);
    const m = mostFor(run);
    const [ticks, answer] = parse(ticksToStop(run, 400, null, true));
    // asked once a tick: it stops on the first tick past the most, going no further (the
    // counting-down condition's 0.0, dichar.103:498), at 4 frames a second and at 24.
    // Here each step comes before the asking; go in arc asks first, then steps
    // (dichar.103:173-202), so the step before the first asking is no part of the move,
    // and the waiting counted starts a tick later
    assert.equal(answer, "0.0");
    assert.equal(Number(ticks), Math.floor(m * fps) + 2);
    assert.ok(Math.abs(Number(most(run)) - m) < 1e-4);
    assert.equal(notes(run),
      `((REVIVAL-REPAIR: WHAT OVERDUE-MOVE WAS (T-MOVER GOING-TO (VICINITY-OF T-KID)) NOW STOPPED-AS-IF-THERE BECAUSE (WAITING-FOR-MORE-THAN ${most(run)} SECONDS)))`);
    assert.match(run(":revival-noted"), /\bT-SUB\b/);
  }
});

test("M12: a mover that gets no nearer for longer than the most stops as if there", () => {
  const cases = {
    // standing still, not waiting for anyone (two of its moves cancelling out)
    still: "(list 10.0 20.0)",
    // going away
    away: "(list (+$ 10.0 (*$ 5.0 (float i))) 20.0)",
    // looping round, each loop further off: a circle of 50 about a centre going away
    out: "(list (+$ 200.0 (*$ 3.0 (float i)) (*$ 50.0 (cos (*$ 1.0472 (float i))))) (*$ 50.0 (sin (*$ 1.0472 (float i)))))",
  };
  for (const [what, place] of Object.entries(cases)) {
    const { run } = withAMove();
    const m = mostFor(run);
    const [ticks, answer] = parse(ticksToStop(run, 100, place));
    assert.equal(answer, "0.0", what);
    // the first tick is its nearest (for the loop, one in its first turn): it stops on
    // the first tick past the most after that
    assert.ok(Number(ticks) >= Math.floor(m * 4) + 1 && Number(ticks) <= Math.floor(m * 4) + 7, `${what}: ${ticks}`);
    assert.equal(notes(run),
      `((REVIVAL-REPAIR: WHAT OVERDUE-MOVE WAS (T-MOVER GOING-TO (VICINITY-OF T-KID)) NOW STOPPED-AS-IF-THERE BECAUSE (NO-NEARER-FOR-MORE-THAN ${most(run)} SECONDS)))`, what);
  }
});

test("M12: a mover that keeps getting nearer goes on, however slowly or roundabout", () => {
  const cases = {
    // half a dot a tick (Cinderella in Justice at 24 frames a second)
    slowly: "(list (-$ 1000.0 (*$ 0.5 (float i))) 0.0)",
    // looping round, each loop nearer (Red Riding Hood's third push)
    in: "(list (-$ 600.0 (*$ 2.0 (float i)) (*$ 50.0 (cos (*$ 1.0472 (float i))))) (*$ 50.0 (sin (*$ 1.0472 (float i)))))",
    // standing still, for less than the most, before it goes
    late: "(cond ((< i 8) (list 500.0 0.0)) (t (list (-$ 500.0 (*$ 3.0 (float i))) 0.0)))",
  };
  for (const [what, place] of Object.entries(cases)) {
    const { run } = withAMove();
    assert.equal(ticksToStop(run, 150, place), "(150 NIL)", what);
    assert.equal(notes(run), "NIL", what);
  }
});

test("M12: Ken's careful step is as he wrote it, and notes on the mover when it waits", () => {
  for (const extensions of [["mend"], []]) {
    const { run } = withAMove(extensions);
    withTheKidInTheWay(run);
    // the kid is at the destination and no part of the goal, so the mover backs up
    assert.equal(run(WAITING_STEP), "(WAITING FOR T-KID TO MOVE)");
    assert.equal(run("(ask t-mover recall your position)"), "(10.0 20.0)");
    assert.equal(run("(get 't-mover 'revival-waited)"), extensions.length ? "T" : "NIL");
    // with no one in the way it goes
    run("(ask t-kid set your position to (500.0 500.0))");
    run("(remprop 't-mover 'revival-waited)");
    assert.notEqual(run(WAITING_STEP), "(WAITING FOR T-KID TO MOVE)");
    assert.notEqual(run("(ask t-mover recall your position)"), "(10.0 20.0)");
    assert.equal(run("(get 't-mover 'revival-waited)"), "NIL");
  }
});

test("M12: a step waited before the move began doesn't count", () => {
  const { run } = withAMove();
  run("(putprop 't-mover t 'revival-waited)");
  // first asked: the most is made, and the old step forgotten
  run("(ask ,t-condition should t-mover stop after moving 1.0 of 100.0 to (0.0 0.0))");
  assert.equal(run("(ask ,t-condition recall your revival-seconds-waiting)"), "0.0");
});

test("M12: otherwise Ken's stop conditions answer as he wrote them", () => {
  const { run } = withAMove();
  // there: the last little bit (dichar.103:411-414)
  assert.equal(run("(ask ,t-condition should t-mover stop after moving 10.0 of 5.0 to (0 0))"), "10.0");
  // a stop-when-there that go in arc doesn't ask itself, as stop-if-either-wants-to asks
  // the one beside its timer (disply.311:219-222), isn't told a goal, and is Ken's alone
  newCondition(run, false);
  assert.equal(ticksToStop(run), "(100 NIL)");
  run("(setq t-either (stop-if-either-wants-to (stop-when-there 't-sub)))");
  run(`(ask ,t-either set your revival-goal to ${GOAL})`);
  assert.equal(run("(do ((i 1 (1+ i)) (a nil (ask ,t-either should t-mover stop after moving 1.0 of 100.0 to (0.0 0.0)))) ((or a (> i 100)) (list (1- i) a)))"), "(100 NIL)");
  // Ken's other conditions have receivers of their own (dichar.103:433-446)
  run("(setq t-condition (move-only-original-distance 't-sub))");
  run(`(ask ,t-condition set your revival-goal to ${GOAL})`);
  run("(ask ,t-condition set your original-distance to 137.5)");
  assert.equal(run("(ask ,t-condition should t-mover stop after moving 100.0 of 200.0 to (0 0))"), "NIL");
  assert.equal(run("(ask ,t-condition should t-mover stop after moving 100.0 of 200.0 to (0 0))"), "37.5");
  assert.equal(run("(ask t-sub collect items)"), "NIL");
});

// ACTION's plan faces a character at the start of a move, a turn a tick, re-sent each
// tick until the heading is reached (action.152:309-322). Here the facing is asked about
// tick by tick, the movie's frame count going up one a tick, with the character's
// heading as heading(i) says.
function withAFacing(extensions = ["mend"]) {
  const { L, run } = withAMove(extensions);
  run("(load '|ken;action >|)");
  run("(define t-movie something)");
  run("(ask t-movie set your frame-count to 0)");
  run("(ask movie set your current-movie to t-movie)");
  run("(define t-plan something)");
  run("(ask t-plan set your subscene to t-sub)");
  return { L, run };
}
// facing (0 500) from (10 20): a heading of about 1 (OBJECT's bearings)
const turnsToStop = (run, heading, ticks = 60) =>
  run(`(do ((i 1 (1+ i))
            (a nil (progn (ask t-movie set your frame-count to ,i)
                          (ask t-mover set your heading to ,${heading})
                          (never-ending-turn? 't-plan 't-mover '(0.0 500.0) 0.0))))
           ((or a (> i ${ticks})) (list (1- i) a)))`);

test("MEND12 extends the plan's facing once ACTION has loaded, and not in 1978 mode", () => {
  const { run } = withAMove();
  assert.equal(run("(get 'mend12-facing 'revival-done)"), "NIL");
  run("(load '|ken;action >|)");
  assert.equal(run("(get 'mend12-facing 'revival-done)"), "T");
  const ken = withAMove([]);
  ken.run("(load '|ken;action >|)");
  assert.equal(ken.run("(get 'mend12-facing 'revival-done)"), "NIL");
});

test("M12: a facing that turns no nearer for longer than the most for turning round is done as if turned", () => {
  const { run } = withAFacing();
  // Ani's most for a turn is three times the degrees at the rotational speed
  // (place.45:435-443): for half a turn at medium speed, half of her 2 seconds to turn
  // around (interf.149:915), three seconds, 12 ticks at 4 frames a second. Two facings
  // cancelling out leave the heading where it was.
  const [ticks, answer] = parse(turnsToStop(run, "90.0"));
  assert.equal(answer, "T");
  assert.equal(Number(ticks), 3 * 4 + 2);
  assert.equal(notes(run),
    "((REVIVAL-REPAIR: WHAT OVERDUE-TURN WAS (T-MOVER FACING (0.0 500.0)) NOW FACED-AS-IF-TURNED BECAUSE (NO-NEARER-FOR-MORE-THAN 3.0 SECONDS)))");
  // turning nearer, however slowly, goes on: a degree and a half a tick, or under a
  // degree a tick (Hansel in Home Again at 24 frames a second), which is nearer by a
  // degree every other tick
  for (const heading of ["(-$ 90.0 (*$ 1.5 (float i)))", "(-$ 90.0 (*$ 0.75 (float i)))"]) {
    const slowly = withAFacing();
    assert.equal(turnsToStop(slowly.run, heading), "(60 NIL)", heading);
    assert.equal(notes(slowly.run), "NIL");
  }
  // a facing asked again after a tick or more without it is another, begun again
  const again = withAFacing();
  assert.equal(again.run(`(do ((i 1 (1+ i))
                               (a nil (progn (ask t-movie set your frame-count to ,(* 2 i))
                                             (ask t-mover set your heading to 90.0)
                                             (never-ending-turn? 't-plan 't-mover '(0.0 500.0) 0.0))))
                              ((or a (> i 60)) (list (1- i) a)))`), "(60 NIL)");
  assert.equal(notes(again.run), "NIL");
});
