// DETAIL (src/director/revive/detail.lisp, dtwalk, dttend, dtrhym): a few of the "myriad
// details" (AI-TR-540 pp. 183-187). These check, fast, what the goldens can't: the
// registry; that each detail's wrapper, receiver or prerequisite is installed when Ken's
// file loads, and that each can be turned off; and each detail on its own. Ken's
// Cinderella with DETAIL is checked by tools/check-ext.mjs --extensions detail (its
// goldens, reports/ext/detail/), each detail alone by tools/check-detail.mjs, and
// stories by tools/check-stress.mjs (test/stories/stress/detail-*.lisp).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot, extensionsFor, EXTENSIONS, elementUse, pass1, pass2, storyOutline, storyPlan } from "../src/pipeline.js";

const lisp = (extensions, setup = null, fs = makeProjectFileSystem()) => {
  const L = boot(fs, { extensions });
  const run = (src) => L.print(L.evalString(src)).toLowerCase();
  if (setup) run(setup);
  return { L, run, fs };
};
const wraps = (run, f) => run(`(mapcar 'car (get '${f} 'revival-wraps))`);

test("the registry: DETAIL is knowledge, opt-in, changing Ken's Cinderella; it requires MEND", () => {
  assert.deepEqual(extensionsFor(["detail"]).map((e) => e.id), ["mend", "detail"]);
  const detail = EXTENSIONS.find((e) => e.id === "detail");
  assert.equal(detail.changes1978, true);
  assert.equal(detail.group, "knowledge");
  assert.equal(detail.optIn, true);
  assert.deepEqual(detail.files, ["wrap", "detail", "dtwalk", "dttend", "dtrhym"]);
  // registry order: SLIPS and DETAIL after those the page's switch turns on (the four,
  // SEEN, since Ken's testing of 15 October, and FIT, since his decision of 16 October);
  // then CRITIC, loaded on demand with a film's criticism, and TEACH, with a learner's
  // knowledge, never by the switch
  assert.deepEqual(EXTENSIONS.map((e) => e.id), ["mend", "appear", "change", "know", "seen", "fit", "slips", "detail", "timely", "critic", "teach"]);
  // with DETAIL, Director reads deliberateness, and the best-when scores the tendencies
  assert.equal(elementUse("deliberateness", ["detail"]), "director");
  assert.equal(elementUse("attraction-towards-friends", ["detail"]), "best-when");
  assert.equal(elementUse("deliberateness", ["mend", "know"]), "none");
  assert.equal(elementUse("speed", ["detail"]), "director");
});

test("each wrapper is installed once its Ken file has loaded, and in 1978 mode none is", () => {
  const { run } = lisp(["detail"]);
  run("(cs)");
  run("(load '|ken;aninit >|)"); // Director, with DICHAR
  for (const f of ["sugest", "chomet", "prereq"]) run(`(load '|ken;${f} >|)`);
  assert.equal(wraps(run, "go-in-arc"), "(dtwalk)");
  assert.equal(wraps(run, "score-suggestions"), "(dttend mend14 mend10 mend5)");
  assert.equal(wraps(run, "eliminate-not-best-whens"), "(dttend)");
  assert.equal(wraps(run, "instaniate-convey-suggestions"), "(dttend)");
  assert.notEqual(run("(actor-of 'drawn-to dont-autoload)"), "nil");
  run("(load '|revive;dtwalk >|)");
  assert.equal(wraps(run, "go-in-arc"), "(dtwalk)");
  const ken = lisp([]);
  ken.run("(cs)");
  ken.run("(load '|ken;aninit >|)");
  assert.equal(wraps(ken.run, "go-in-arc"), "nil");
  assert.equal(ken.run("(boundp ':detail-off)"), "nil");
});

test("the walk: a deliberate character goes in arcs d times as long, jagging 1/d as far; medium, as Ken's", () => {
  const { run } = lisp(["detail"]);
  run("(cs)");
  run("(load '|ken;aninit >|)");
  // Ken's go-in-arc, as DTWALK hands it on, answers the path it was given
  run("(rplaca (cdr (assq 'dtwalk (get 'go-in-arc 'revival-wraps))) '(lambda (c d g og curvature length jaggedness careful others) (list curvature length jaggedness)))");
  const walk = (value, factor = null) => {
    run(`(define (special-dynamics-of cinderella in t-subscene) special-dynamics (set your deliberateness to ${value})${factor ? ` (set your (deliberateness factor) to ${factor})` : ""})`);
    run("(ask cinderella set your special-dynamics to (special-dynamics-of cinderella in t-subscene))");
    return run("(go-in-arc 'cinderella 1.0 nil nil 15.0 27.5 2.0 nil nil)");
  };
  assert.equal(walk("high"), "(15.0 55.0 1.0)");
  assert.equal(walk("low"), "(15.0 13.75 4.0)");
  assert.equal(walk("medium"), "(15.0 27.5 2.0)");
  assert.equal(walk("high", "1.25"), "(15.0 68.75 0.8)");
  const off = lisp(["detail"], "(setq :detail-off '(walk))");
  off.run("(cs)");
  off.run("(load '|ken;aninit >|)");
  off.run("(rplaca (cdr (assq 'dtwalk (get 'go-in-arc 'revival-wraps))) '(lambda (c d g og curvature length jaggedness careful others) (list curvature length jaggedness)))");
  off.run("(define (special-dynamics-of cinderella in t-subscene) special-dynamics (set your deliberateness to high))");
  off.run("(ask cinderella set your special-dynamics to (special-dynamics-of cinderella in t-subscene))");
  assert.equal(off.run("(go-in-arc 'cinderella 1.0 nil nil 15.0 27.5 2.0 nil nil)"), "(15.0 27.5 2.0)");
});

// Ken's Cinderella as pass 2 has it before RUN plans a scene: CINDY, the choices of CP 29.
function cinderellaPass2(setup = null) {
  const fs = makeProjectFileSystem();
  fs.addFile("KEN", "CP", "30", { text: readFileSync("original/7005017/cp.29", "latin1"), origin: "test" });
  const x = lisp(["detail"], setup, fs);
  x.run("(load '|ken;run >|)");
  x.run("(director-load 'cindy '(to get cinderella))");
  x.run("(director-load 'cp '(to get choices))");
  x.run("(load '|ken;prereq >|)");
  x.run("(actor-of 'move-to-and-hits)"); // DISPLY, as asking a way of showing loads it
  return x;
}
const status = (run, a, b) => run(`(ask drawn-to recall an item matching (status-of (drawn-to ${a} ${b}) ?status) then status)`);

test("the tendencies: drawn-to reads the tendency towards what the other is, a friend, an enemy or a stranger", () => {
  const { run } = cinderellaPass2();
  assert.equal(status(run, "cinderella", "prince"), "met"); // she loves him; (positive high) towards friends
  assert.equal(status(run, "step-mother", "cinderella"), "not-met"); // she hates her; (negative high) towards enemies
  assert.equal(status(run, "cinderella", "step-mother"), "not-met"); // hated by her; (negative medium) towards enemies
  assert.equal(status(run, "fairy-godmother", "step-mother"), "met"); // no relationship; (positive medium) towards strangers
  assert.equal(status(run, "cinderella", "fairy-godmother"), "dont-know"); // is-polite-to and is-grateful-to: none of the three
  // and the ways of showing that take one to another, or away, have the clause
  assert.equal(run("(ask move-to-and-hits collect best-when of (move-to-and-hits step-mother cinderella))"), "((drawn-to step-mother cinderella))");
  assert.equal(run("(ask repeatedly-come-in-contact collect best-when of (repeatedly-come-in-contact prince cinderella))"), "((drawn-to cinderella prince) (drawn-to prince cinderella))");
  assert.equal(run("(ask alternately-turn collect best-when of (alternately-turn prince cinderella))"), "nil");
  // the convey verbs' only with :detail-tendencies-of-convey-methods
  assert.equal(run("(ask pushes collect best-when of (pushes step-mother cinderella))"), "nil");
  const convey = cinderellaPass2("(setq :detail-tendencies-of-convey-methods t)");
  assert.equal(convey.run("(ask pushes collect best-when of (pushes step-mother cinderella))"), "((drawn-to step-mother cinderella))");
  const off = cinderellaPass2("(setq :detail-off '(tend))");
  assert.equal(status(off.run, "cinderella", "prince"), "dont-know");
  assert.equal(off.run("(ask move-to-and-hits collect best-when of (move-to-and-hits step-mother cinderella))"), "nil");
});

test("the rhythm: fast and slow throughout, (changes A B) at the beginning and the end, picking-up at the end", () => {
  const { run } = lisp(["detail"]);
  run("(define t-scene something)");
  for (const k of [1, 2, 3]) run(`(define (subscene-of t-scene ${k}) something (set your scene to t-scene) (set your order-in-scene to ${k}))`);
  run("(ask t-scene set your subscenes to ((subscene-of t-scene 1) (subscene-of t-scene 2) (subscene-of t-scene 3)))");
  const at = (k, rhythm) => run(`(rhythm-for-subscene '(subscene-of t-scene ${k}) '${rhythm})`);
  assert.equal(at(2, "fast"), "((positive medium) throughout)");
  assert.equal(at(1, "slow"), "((negative medium) throughout)");
  assert.equal(at(1, "normal"), "nil");
  assert.equal(at(1, "(changes fast slow)"), "((positive medium) beginning)");
  assert.equal(at(2, "(changes fast slow)"), "nil");
  assert.equal(at(3, "(changes fast slow)"), "((negative medium) end)");
  assert.equal(at(1, "picking-up"), "nil");
  assert.equal(at(3, "picking-up"), "((positive medium) end)");
  assert.equal(at(1, "(changes normal fast)"), "nil");
});

test("the rhythm in a scene: each subscene's characters change speed as an emotional state changes it, with a note", () => {
  const file = "test/stories/stress/detail-rhythm.lisp";
  const text = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const plan = storyPlan(storyOutline(text));
  const fs = makeProjectFileSystem();
  fs.addFile("KEN", "CINDY", "47", { text, origin: file });
  pass1(fs, { extensions: ["detail"] });
  const { glass } = pass2(fs, "by-the-bridge", { plan, extensions: ["detail"] });
  const program = fs.textOf(fs.find({ dir: "KEN", fn1: "STORY1", fn2: "SCENE" }));
  assert.match(program, /\(GRADUALLY CHANGE BY 0\.8 FACTOR FOR SPEED AT MEDIUM SPEED\)/);
  const notes = glass.repairs.map((r) => r.note).filter((n) => n.includes("rhythm-speed"));
  assert.ok(notes.some((n) => n === "(revival-repair: what rhythm-speed was (troll speed) now (change: amount (negative medium) speed medium) because (rhythm slow throughout))"), notes.join("\n"));
});
