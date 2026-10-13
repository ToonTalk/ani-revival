// REVIVE;MEND16 (M16): how far a small way from one place towards another is from a
// third. Cinderella never asks (her Kept Apart measures from a small way from only to
// its anchors), so tools/check-1978.mjs can't notice it missing; these check that it is
// installed once INTERF has loaded, and again when INTERF loads again, and what it does
// on a small case. The stress story test/stories/stress/small-way-third.lisp shows it in
// a whole film (node tools/run-story.mjs <story> --extensions mend).
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

// Three characters and three subscenes, as pass 2 plans them: in the first, t-a, t-b and
// t-c stand at places; in the second, t-a has walked a small way towards t-b, a moving
// target, and stands at the place as written (new-place-package, place.45:175-183).
function walkedASmallWay(run) {
  run("(cs)");
  run("(load '|ken;interf >|)");
  for (const c of ["t-a", "t-b", "t-c"]) run(`(define ${c} character)`);
  for (const s of ["t-s1", "t-s2", "t-s3"]) run(`(define ${s} something)`);
  run("(ask t-s1 set your next-subscene to t-s2)");
  run("(ask t-s2 set your previous-subscene to t-s1)");
  run("(ask t-s2 set your next-subscene to t-s3)");
  run("(ask t-s3 set your previous-subscene to t-s2)");
  for (const [c, x, y] of [["t-a", "0.0", "0.0"], ["t-b", "0.5", "0.0"], ["t-c", "0.2", "0.3"]]) {
    run(`(ask t-s1 set your (location-of ${c}) to (place: where (xy-position ${x} ${y}) why start status known))`);
  }
  run("(ask t-s2 set your (location-of t-a) to (place: where (small-way-from (vicinity-of t-a) (vicinity-of t-b)) why moved status symbolic))");
}

test("MEND16 wraps ask-positions-for-distance once INTERF has loaded, and again when it loads again; not in 1978 mode", () => {
  const { run } = lisp();
  run("(load '|ken;interf >|)");
  assert.equal(wraps(run, "ask-positions-for-distance"), "(MEND16)");
  run("(load '|ken;interf >|)");
  assert.equal(wraps(run, "ask-positions-for-distance"), "(MEND16)");
  assert.equal(run("(eq (get 'ask-positions-for-distance 'expr) (get 'ask-positions-for-distance-from-a-small-way 'expr))"), "T");
  const ken = lisp([]);
  ken.run("(load '|ken;interf >|)");
  assert.equal(wraps(ken.run, "ask-positions-for-distance"), "NIL");
});

test("M16: only a third place is one INTERF's small-way-from would stop on", () => {
  const { run } = lisp();
  run("(load '|ken;interf >|)");
  run("(define t-b character)");
  const sw = "'(small-way-from (vicinity-of t-a) (vicinity-of t-b))";
  assert.equal(run(`(small-way-from-and-a-third-place? ${sw} '(vicinity-of t-c))`), "T");
  assert.equal(run(`(small-way-from-and-a-third-place? ${sw} '(xy-position 0.5 0.0))`), "T");
  for (const p of ["(vicinity-of t-a)", "(vicinity-of t-b)", "(small-way-from (vicinity-of t-b) (vicinity-of t-a))", "(no-such-place-actor 1)"]) {
    assert.equal(run(`(small-way-from-and-a-third-place? ${sw} '${p})`), "NIL", p);
  }
  assert.equal(run(`(small-way-from-and-a-third-place? '(vicinity-of t-c) ${sw})`), "NIL");
});

test("M16: from a small way from to a third place, measured from where it was when the walk was planned", () => {
  const ken = lisp([]);
  walkedASmallWay(ken.run);
  assert.throws(() => ken.run("(screen-fraction-between '(vicinity-of t-a) '(vicinity-of t-c) 't-s2)"), /SMALL-WAY-FROM-CANT-DO-YET/);
  const { run } = lisp();
  walkedASmallWay(run);
  assert.equal(run("(find-xy-position '(vicinity-of t-a) 't-s2)"), "(SYMBOLIC-POSITION (SMALL-WAY-FROM (VICINITY-OF T-A) (VICINITY-OF T-B)))");
  // a third of the way from (0 0) to (0.5 0): t-b is not more than half the screen away
  const d = Number(run("(screen-fraction-between '(vicinity-of t-a) '(vicinity-of t-c) 't-s2)"));
  assert.ok(Math.abs(d - Math.hypot(0.2 - 0.165, 0.3)) < 1e-4, String(d));
  assert.equal(run("(ask t-s3 recall your (distance-between (small-way-from (vicinity-of t-a) (vicinity-of t-b)) (vicinity-of t-c)))"), `(SCREEN-FRACTION ${d})`);
  assert.equal(Number(run("(screen-fraction-between '(vicinity-of t-c) '(vicinity-of t-a) 't-s2)")), d);
  assert.equal(run("(ask t-s2 collect items memorized matching (revival-repair: %))"),
    "((REVIVAL-REPAIR: WHAT MEASURED-SMALL-WAY-FROM WAS (SMALL-WAY-FROM (VICINITY-OF T-A) (VICINITY-OF T-B)) NOW (FROM (XY-POSITION 0.165 0.0) AS IN T-S1) BECAUSE (THIRD PLACE (VICINITY-OF T-C))))");
  assert.equal(run(":revival-small-ways-being-measured"), "NIL");
});

test("M16: from a small way from to its own second place, measured later, Ken's answer asks a third place's question inside it", () => {
  // t-a's place in t-s2 is the small way from itself, so Ken's answer from an anchor
  // (distance-from-position-between, interf.149:44-57) asks how far that is from t-b's
  // xy position, a third place
  const ken = lisp([]);
  walkedASmallWay(ken.run);
  assert.throws(() => ken.run("(screen-fraction-between '(vicinity-of t-a) '(vicinity-of t-b) 't-s2)"), /SMALL-WAY-FROM-CANT-DO-YET/);
  const { run } = lisp();
  walkedASmallWay(run);
  // Ken's answer, two thirds of the distance M16 measures (0.5 - 0.165)
  const d = Number(run("(screen-fraction-between '(vicinity-of t-a) '(vicinity-of t-b) 't-s2)"));
  assert.ok(Math.abs(d - 0.67 * (0.5 - 0.165)) < 1e-4, String(d));
  assert.match(run("(ask t-s2 collect items memorized matching (revival-repair: %))"), /BECAUSE \(THIRD PLACE \(XY-POSITION 0\.5 0\.0\)\)/);
});

test("M16: from a small way from whose anchors never had places, nothing, as INTERF answers a distance it can't work out", () => {
  const { run } = lisp();
  run("(cs)");
  run("(load '|ken;interf >|)");
  for (const c of ["t-a", "t-b", "t-c"]) run(`(define ${c} character)`);
  run("(define t-s1 something)");
  run("(define t-s2 something)");
  run("(ask t-s1 set your next-subscene to t-s2)");
  run("(ask t-s2 set your previous-subscene to t-s1)");
  run("(ask t-s1 set your (location-of t-c) to (place: where (xy-position 0.2 0.3) why start status known))");
  assert.equal(run("(ask-positions-for-distance '(small-way-from (vicinity-of t-a) (vicinity-of t-b)) '(vicinity-of t-c) 't-s1 't-s2)"), "NIL");
  assert.match(run("(ask t-s1 collect items memorized matching (revival-repair: %))"), /NOW \(NOTHING\) BECAUSE \(THIRD PLACE \(VICINITY-OF T-C\)\)/);
});
