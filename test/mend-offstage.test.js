// REVIVE;MEND19 (M19): far off and off the stage, the constraint PLACE's
// place-large-distance-apart asks for and never defines. In Ken's Cinderella everyone
// it places already has a place, or the subscene starts with a cut, so
// tools/check-1978.mjs can't notice the repair missing; these check that it is defined
// once PLACE has loaded, and what it does. The stress story
// test/stories/stress/far-and-offstage.lisp shows it in a whole film
// (node tools/run-story.mjs <story> --extensions mend).
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot } from "../src/pipeline.js";

function lisp(extensions = ["mend"]) {
  const L = boot(makeProjectFileSystem(), { extensions });
  const run = (src) => L.print(L.evalString(src));
  return { L, run };
}
const notes = (run, actor) => run(`(ask ${actor} collect items memorized matching (revival-repair: %))`);

test("MEND19 defines large-distance-and-offstage once PLACE has loaded, once a job; not in 1978 mode", () => {
  const { run } = lisp();
  // known before PLACE loads, as the tags know PLACE's own constraints
  assert.equal(run("(exists? 'large-distance-and-offstage)"), "|KEN;PLACE|");
  assert.equal(run("(exists? 'medium-distance-and-offstage)"), "|KEN;PLACE|");
  assert.equal(run("(actor-of 'large-distance-and-offstage dont-autoload)"), "NIL");
  run("(load '|ken;place >|)");
  assert.notEqual(run("(actor-of 'large-distance-and-offstage dont-autoload)"), "NIL");
  assert.notEqual(run("(ask large-distance-and-offstage are you a constraint)"), "NIL");
  run("(load '|ken;place >|)");
  assert.equal(run("(get 'mend19-large-distance-and-offstage 'revival-done)"), "T");
  const ken = lisp([]);
  assert.equal(ken.run("(exists? 'large-distance-and-offstage)"), "NIL");
  ken.run("(load '|ken;place >|)");
  assert.equal(ken.run("(actor-of 'large-distance-and-offstage dont-autoload)"), "NIL");
});

// A subscene with a kid at a place (an xy position, as where the last scene left him)
// and a troll with none, the subscene not starting with a cut.
function aKidPlaced(run, kidAt = "(xy-position -0.05 -0.07)") {
  run("(cs)"); // pass 2 measures places on the TV, as Ken's saved Director did
  run("(load '|ken;interf >|)");
  run("(load '|ken;place >|)");
  for (const c of ["t-kid", "t-troll"]) run(`(define ${c} character)`);
  run("(define t-s1 something)");
  if (kidAt) run(`(ask t-s1 set your (location-of t-kid) to (place: where ${kidAt} why start status known))`);
}

test("M19: in 1978 mode the troll's place stops pass 2: no actor answers", () => {
  const { run } = lisp([]);
  aKidPlaced(run);
  assert.throws(() => run("(place-large-distance-apart 'move-small-part-towards '(vicinity-of t-troll) '(vicinity-of t-kid) '(small) 't-s1)"), /NO-SUCH-ACTOR/);
});

test("M19: placed far from the other and off the stage, at INTERF's good-distance-from-and-offstage, with a note", () => {
  const { run } = lisp();
  aKidPlaced(run);
  // as move-small-part-towards places its two (disply.311:721-726)
  run("(place-large-distance-apart 'move-small-part-towards '(vicinity-of t-troll) '(vicinity-of t-kid) '(small) 't-s1)");
  assert.equal(run("(ask t-s1 recall your transition-type)"), "NIL"); // no cut was made
  assert.equal(run("(ask t-s1 recall your (location-of t-troll))"),
    "(PLACE: WHERE (GOOD-DISTANCE-FROM-AND-OFFSTAGE (VICINITY-OF T-KID)) WHY (SO THAT (MOVE-SMALL-PART-TOWARDS T-TROLL T-KID)) STATUS (PLACED BY T-S1))");
  // off the stage (INTERF's on-stage test: within .5 of the middle, interf.149:111), and
  // the farthest of its five off-stage places from the kid, who is below and left of the
  // middle: above the top far right
  assert.equal(run("(find-xy-position '(vicinity-of t-troll) 't-s1)"), "(XY-POSITION 0.49 0.6)");
  assert.ok(Number(run("(screen-fraction-between '(vicinity-of t-troll) '(vicinity-of t-kid) 't-s1)")) > 0.67);
  assert.equal(notes(run, "t-s1"),
    "((REVIVAL-REPAIR: WHAT DEFINED-CONSTRAINT WAS (LARGE-DISTANCE-AND-OFFSTAGE NOT-DEFINED) NOW (T-TROLL AT (GOOD-DISTANCE-FROM-AND-OFFSTAGE (VICINITY-OF T-KID))) BECAUSE (NAMED-IN PLACE)))");
});

test("M19: with the other placed nowhere either, the middle below the stage, as medium-distance-and-offstage", () => {
  const { run } = lisp();
  aKidPlaced(run, null);
  run("(pick-location-for 't-troll '(large-distance-and-offstage (vicinity-of t-kid)) '(so that t) 't-s1)");
  assert.equal(run("(get (ask t-s1 recall your (location-of t-troll)) 'where)"), "(OFF-SCREEN-POSITION LOWER MIDDLE)");
  assert.match(notes(run, "t-s1"), /NOW \(T-TROLL AT \(OFF-SCREEN-POSITION LOWER MIDDLE\)\)/);
});

test("M19: with a cut, or both placed, Ken's own constraints, and no note", () => {
  const { run } = lisp();
  aKidPlaced(run);
  run("(ask t-s1 set your transition-type to cut)");
  run("(place-large-distance-apart 'move-to-each-other '(vicinity-of t-troll) '(vicinity-of t-kid) '(small) 't-s1)");
  assert.match(run("(ask t-s1 recall your (location-of t-troll))"), /^\(PLACE: WHERE \(GOOD-DISTANCE-FROM \(VICINITY-OF T-KID\)\)/);
  assert.equal(notes(run, "t-s1"), "NIL");
});
