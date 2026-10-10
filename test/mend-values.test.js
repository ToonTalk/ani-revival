// MEND's repairs of values pass 2 and Director can't use (REVIVE;MEND1 and MEND2):
// (not X) narrowed by the film's variety level after RUN loads KEN;CP, none read as
// medium, and weightify's guard. Cinderella needs neither, so check-1978 --extensions
// mend can't notice one that is missing; these check, on small stand-ins, that each
// is installed when its file loads and what it does. The stress stories
// test/stories/stress/not-high.lisp and none-value.lisp run them in a real film
// (node tools/run-story.mjs <story> --extensions mend).
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot } from "../src/pipeline.js";

// Choices as pass 1 writes them to KEN;CP (as in CP 29), with the values pass 2
// can't use: d's speed and path length are (not X), its activity level none.
const CP = `
(define (choice-point-of a speed) absolute-choice-point (set your current-choice to high))
(define (choice-point-of b speed) absolute-choice-point (set your current-choice to high))
(define (choice-point-of c speed) absolute-choice-point (set your current-choice to medium))
(define (choice-point-of d speed) absolute-choice-point (set your current-choice to (not high)))
(define (choice-point-of a path-length) absolute-choice-point (set your current-choice to long))
(define (choice-point-of d path-length) absolute-choice-point (set your current-choice to (not short)))
(define (choice-point-of d activity-level) absolute-choice-point (set your current-choice to none))
(define (choice-point-of d attraction-towards-friends) absolute-choice-point (set your current-choice to (positive high)))
(define (relative-choice-point-of (d a) relative-speed) relative-choice-point (set your current-choice to different-from))
`;

// A Lisp booted with MEND whose KEN;CP > is CP above, with a film of the given
// variety level, and RUN loaded, as in pass 2 (MEND1 and MEND2 act only in RUN's job:
// test/mend-fixes.test.js); loading the CP is left to the test, as RUN does it
// (run.65:44-45).
function withChoices(variety, { extensions = ["mend"], cp = CP } = {}) {
  const fs = makeProjectFileSystem();
  fs.addFile("KEN", "CP", "999", { text: cp, origin: "test" });
  const L = boot(fs, { extensions });
  const run = (src) => L.print(L.evalString(src));
  run("(load '|ken;run >|)");
  run(`(define mendv-film film (set your level of variety to ${variety}))`);
  return { L, run };
}

const choice = (run, who, element) => run(`(ask (choice-point-of ${who} ${element}) recall your current-choice)`);
const notes = (run, actor) => run(`(ask ${actor} collect items memorized matching (revival-repair: %))`);

test("M1: after KEN;CP loads, (not X) is narrowed by the variety level, with counts from the CP", () => {
  const { run } = withChoices("medium");
  assert.equal(run("(ask mendv-film recall your (variety level))"), "MEDIUM");
  run("(load '|ken;cp >|)");
  // speed: high twice, medium once, low never; medium variety takes the middle of
  // the two left sorted most used first, the less used (glosug.41:71-72)
  assert.equal(choice(run, "d", "speed"), "LOW");
  assert.equal(notes(run, "(choice-point-of d speed)"),
    "((REVIVAL-REPAIR: WHAT NARROWED WAS (NOT HIGH) NOW LOW BECAUSE ((VARIETY LEVEL) MEDIUM (COUNTS (1 MEDIUM) (0 LOW)) (MIDDLE-ELEMENT KEN1 RECONSTRUCTION))))");
  // the counts record-choice kept in pass 1 (choose.198:600), and the narrowed value counted
  assert.equal(run("(mapcar (function (lambda (v) (ask speed recall your (count-for ,v)))) '(high medium low))"), "(2 1 1)");
  // path-length's values are short, medium and long
  assert.equal(choice(run, "d", "path-length"), "MEDIUM");
  assert.equal(notes(run, "(choice-point-of d path-length)"),
    "((REVIVAL-REPAIR: WHAT NARROWED WAS (NOT SHORT) NOW MEDIUM BECAUSE ((VARIETY LEVEL) MEDIUM (COUNTS (0 MEDIUM) (1 LONG)) (MIDDLE-ELEMENT KEN1 RECONSTRUCTION))))");
  // the others are as pass 1 left them
  assert.equal(choice(run, "a", "speed"), "HIGH");
  assert.equal(choice(run, "d", "attraction-towards-friends"), "(POSITIVE HIGH)");
  assert.equal(run("(ask (relative-choice-point-of (d a) relative-speed) recall your current-choice)"), "DIFFERENT-FROM");
  assert.equal(notes(run, "(choice-point-of a speed)"), "NIL");
});

// With APPEAR on too, absolute-choice-point has a child, APPEAR's appearance-choice-point,
// among its offspring, as well as the choice points pass 1 made; M1 and M2 take only
// those (REVIVE;MEND1 choice-points-pass-1-made). Before, M1 asked the child for its
// element-name, and pass 2 of any story with a (not X) on a movement element stopped
// (test/stories/fresh/fox-and-crow.lisp, test/stories/stress/not-high.lisp).
test("M1 and M2 with APPEAR on: only the choice points pass 1 made are read, not APPEAR's kind of choice point", () => {
  const cp = `${CP}(define (choice-point-of d size) appearance-choice-point (set your current-choice to (not high)))\n`;
  const { run } = withChoices("medium", { extensions: ["mend", "appear"], cp });
  run("(load '|ken;cp >|)");
  assert.match(run("(ask absolute-choice-point recall your offspring)"), /APPEARANCE-CHOICE-POINT/);
  assert.doesNotMatch(run("(choice-points-pass-1-made)"), /APPEARANCE-CHOICE-POINT|SIZE/);
  assert.equal(choice(run, "d", "speed"), "LOW");
  assert.equal(choice(run, "d", "activity-level"), "MEDIUM");
  // APPEAR's own (not X) stays as pass 1 chose it: APPEAR reads it (appearance-number)
  assert.equal(choice(run, "d", "size"), "(NOT HIGH)");
  assert.equal(notes(run, "(choice-point-of d size)"), "NIL");
});

test("M1: high and low variety pick as GLOSUG's pick-value-with-variety does", () => {
  // as written, high takes the most used of the two left and low the least used
  // (glosug.41:67-70)
  const high = withChoices("high");
  high.run("(load '|ken;cp >|)");
  assert.equal(choice(high.run, "d", "speed"), "MEDIUM");
  assert.equal(notes(high.run, "(choice-point-of d speed)"),
    "((REVIVAL-REPAIR: WHAT NARROWED WAS (NOT HIGH) NOW MEDIUM BECAUSE ((VARIETY LEVEL) HIGH (COUNTS (1 MEDIUM) (0 LOW)))))");
  const low = withChoices("low");
  low.run("(load '|ken;cp >|)");
  assert.equal(choice(low.run, "d", "speed"), "LOW");
});

test("M2: after KEN;CP loads, a movement element given up on reads as medium", () => {
  const { run } = withChoices("medium");
  run("(load '|ken;cp >|)");
  assert.equal(choice(run, "d", "activity-level"), "MEDIUM");
  assert.equal(notes(run, "(choice-point-of d activity-level)"),
    "((REVIVAL-REPAIR: WHAT GAVE-UP WAS NONE NOW MEDIUM BECAUSE (INTERF READS AN UNSET ELEMENT AS MEDIUM)))");
  // every choice point noted is listed for the glass box (src/pipeline.js repairNotes)
  assert.equal(run(":revival-noted"),
    "((CHOICE-POINT-OF D ACTIVITY-LEVEL) (CHOICE-POINT-OF D PATH-LENGTH) (CHOICE-POINT-OF D SPEED))");
  // loaded again, as a hook may fire again: nothing is left to repair
  run("(load '|ken;cp >|)");
  assert.equal(choice(run, "d", "speed"), "LOW");
  assert.equal(run("(length :revival-noted)"), "3");
});

test("Cinderella's CP 29 loads as it is: no repair, no note, no count", () => {
  const { run } = withChoices("medium");
  run("(load '|ken;cp 29|)");
  assert.equal(run(":revival-noted"), "NIL");
  assert.equal(choice(run, "cinderella", "speed"), "LOW");
  assert.equal(choice(run, "step-mother", "repetiveness"), "MEDIUM");
  assert.equal(run("(ask speed recall your (count-for low))"), "NIL");
});

test("M2: weightify is wrapped once INTERF loads, and reads none and (not X) as medium", () => {
  const L = boot(makeProjectFileSystem(), { extensions: ["mend"] });
  const run = (src) => L.print(L.evalString(src));
  assert.equal(run("(get 'weightify 'revival-wraps)"), "NIL");
  run("(load '|ken;interf >|)");
  assert.equal(run("(mapcar 'car (get 'weightify 'revival-wraps))"), "(MEND2)");
  // what Ken's weightify knows, as before (interf.149:899-904)
  assert.equal(run("(mapcar 'weightify '(low short medium long high))"), "(0.5 0.5 1.0 2.0 2.0)");
  assert.equal(run("(weightify 'none)"), "1.0");
  assert.equal(run("(weightify '(not high))"), "1.0");
  assert.throws(() => run("(weightify 'grumpy)"), /shouldnt happen \(WEIGHTIFY \(GRUMPY IS NOT/);
  // no actor asked, so no note
  assert.equal(run(":revival-noted"), "NIL");
  // asked by a special dynamics (interf.149:845-847): the note goes on it
  run("(define mendv-dynamics special-dynamics (set your speed to none))");
  assert.equal(run("(ask mendv-dynamics yield your speed value)"), "1.0");
  assert.equal(notes(run, "mendv-dynamics"),
    "((REVIVAL-REPAIR: WHAT READ-AS-MEDIUM WAS NONE NOW MEDIUM BECAUSE (WEIGHTIFY KNOWS ONLY LOW SHORT MEDIUM LONG AND HIGH)))");
  assert.equal(run(":revival-noted"), "(MENDV-DYNAMICS)");
  // INTERF loaded again: Ken's weightify is wrapped again, once
  run("(load '|ken;interf >|)");
  assert.equal(run("(mapcar 'car (get 'weightify 'revival-wraps))"), "(MEND2)");
  assert.equal(run("(weightify 'none)"), "1.0");
});
