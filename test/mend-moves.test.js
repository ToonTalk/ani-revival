// REVIVE;MEND10 and REVIVE;MEND12 (M10 and M12): alone with no one else to send off,
// and moves that never end. Cinderella needs neither repair,
// so tools/check-1978.mjs can't notice one that is missing; these check that each is
// installed once its Ken file has loaded, and what it does on small cases made here.
// The stress stories show them in a whole film (node tools/run-story.mjs <story>
// --extensions mend): test/stories/stress/alone-two.lisp for M10, and
// test/stories/stress/pushee-blocked.lisp and test/stories/red-riding-hood.lisp for M12.
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
// a character going to a stationary place, as ACTION's cause ... to gradually go in arc
// sets one up (action.152:283-306): its current goal, the stop condition with the
// distance to go, and the movie's frames a second.
function withAMove(extensions = ["mend"], fps = 4) {
  const { L, run } = lisp(extensions);
  run("(cs)");
  run("(load '|ken;dichar >|)");
  run("(load '|ken;interf >|)");
  run("(define t-sd special-dynamics (set your speed to medium))");
  run("(define t-mover director-character)");
  run("(ask t-mover set your position to (10.0 20.0))");
  run("(ask t-mover set your special-dynamics to t-sd)");
  run("(ask t-mover set your current-goal to (stationary-target (vicinity-of t-kid) (xy-position 0.1 0.1)))");
  run("(define t-sub something)");
  run("(setq t-condition (stop-when-there 't-sub))");
  run("(ask ,t-condition set your original-distance to 137.5)");
  run(`(setq :frames-per-second ${fps} :ticks-per-frame 1)`);
  return { L, run };
}

// Ask the condition each tick, as go in arc does (dichar.103:173-176), until it says
// stop: the ticks it took, and its answer. With step, the mover moves that far between
// one tick and the next.
const ticksToStop = (run, most = 100, step = 0) =>
  run(`(do ((i 1 (1+ i)) (a nil (progn (ask t-mover set your position to (,(*$ ${step.toFixed(1)} (float i)) 20.0))
                                        (ask ,t-condition should t-mover stop after moving 1.0 of 100.0 to (0 0)))))
           ((or a (> i ${most})) (list (1- i) a)))`);

// Ani's most for a walk is 2.5 times its ideal, the distance at the mover's speed and a
// third of a second (place.45:528-559): here 137.5 at medium speed.
const mostFor = (run) => 2.5 * (137.5 / Number(run("(ask t-sd yield real value for speed)")) + 0.33);

test("MEND12 extends the arc stop condition once DICHAR has loaded, and not in 1978 mode", () => {
  const { run } = withAMove();
  assert.equal(run("(get 'mend12-overdue 'revival-done)"), "T");
  // MEND12 loaded again, so its hook fires again: still one extension (two would each
  // count the time, and stop the move in half the ticks)
  run("(load '|revive;mend12 >|)");
  assert.equal(ticksToStop(run), ticksToStop(withAMove().run));
  const ken = withAMove([]);
  assert.equal(ken.run("(get 'mend12-overdue 'revival-done)"), "NIL");
  // Ken's waits on (a mover that never arrives goes on for ever)
  assert.equal(ticksToStop(ken.run), "(100 NIL)");
});

test("M12: a move to a stationary place that runs past the most time Ani allows for it stops as if there", () => {
  const { run } = withAMove();
  const most = mostFor(run);
  // moving all the while (circling), or standing still (waiting): the whole time counts
  for (const step of [50, 0]) {
    const { run } = withAMove();
    const [ticks, answer] = ticksToStop(run, 100, step).replace(/[()]/g, "").split(" ");
    // asked once a tick, a quarter of a second at 4 frames a second: it stops on the
    // first tick past the most, going no further (the counting-down condition's 0.0,
    // dichar.103:498)
    assert.equal(answer, "0.0");
    assert.equal(Number(ticks), Math.floor(most * 4) + 1);
  }
  ticksToStop(run, 100, 50);
  assert.ok(Math.abs(Number(run("(ask ,t-condition recall your revival-most-time)")) - most) < 1e-4);
  assert.equal(run("(ask t-sub collect items memorized matching (revival-repair: %))"),
    `((REVIVAL-REPAIR: WHAT OVERDUE-MOVE WAS (T-MOVER GOING-TO (VICINITY-OF T-KID)) NOW STOPPED-AS-IF-THERE BECAUSE (MORE-THAN ${run("(ask ,t-condition recall your revival-most-time)")} SECONDS)))`);
  assert.match(run(":revival-noted"), /\bT-SUB\b/);
  // at 24 frames a second it takes as long
  const at24 = withAMove(["mend"], 24);
  assert.equal(ticksToStop(at24.run, 200, 50).replace(/[()]/g, "").split(" ")[0], String(Math.floor(most * 24) + 1));
});

test("M12: a move to a moving target stops once the mover has stood still for longer than the most", () => {
  const { run } = withAMove();
  const most = mostFor(run);
  run("(ask t-mover set your current-goal to (contact-with t-kid by t-mover))");
  // standing still, as a mover waiting for someone to move does (dichar.103:317-318); the
  // first tick, with nothing to compare, doesn't count
  const [ticks, answer] = ticksToStop(run, 100, 0).replace(/[()]/g, "").split(" ");
  assert.equal(answer, "0.0");
  assert.equal(Number(ticks), Math.floor(most * 4) + 2);
  assert.equal(run("(ask t-sub collect items memorized matching (revival-repair: %))"),
    `((REVIVAL-REPAIR: WHAT OVERDUE-MOVE WAS (T-MOVER GOING-TO (CONTACT-WITH T-KID BY T-MOVER)) NOW STOPPED-AS-IF-THERE BECAUSE (STILL-FOR-MORE-THAN ${run("(ask ,t-condition recall your revival-most-time)")} SECONDS)))`);
});

test("M12: otherwise Ken's stop condition answers as he wrote it", () => {
  const { run } = withAMove();
  // there: the last little bit (dichar.103:411-414)
  assert.equal(run("(ask ,t-condition should t-mover stop after moving 10.0 of 5.0 to (0 0))"), "10.0");
  // a moving target, followed a step a tick, however long
  run("(ask t-mover set your current-goal to (contact-with t-kid by t-mover))");
  assert.equal(ticksToStop(run, 100, 50), "(100 NIL)");
  // a condition with no distance to go (made other than by ACTION) has no most
  run("(ask t-mover set your current-goal to (stationary-target (vicinity-of t-kid) (xy-position 0.1 0.1)))");
  run("(setq t-condition (stop-when-there 't-sub))");
  assert.equal(ticksToStop(run), "(100 NIL)");
  // Ken's other conditions have receivers of their own (dichar.103:433-446)
  run("(setq t-condition (move-only-original-distance 't-sub))");
  run("(ask ,t-condition set your original-distance to 137.5)");
  assert.equal(run("(ask ,t-condition should t-mover stop after moving 100.0 of 200.0 to (0 0))"), "NIL");
  assert.equal(run("(ask ,t-condition should t-mover stop after moving 100.0 of 200.0 to (0 0))"), "37.5");
  assert.equal(run("(ask t-sub collect items)"), "NIL");
});
