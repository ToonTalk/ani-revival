// SLIPS (src/director/revive/slips*.lisp): corrections of slips in Ken's files. These
// check, fast, what the goldens can't: the registry; that each correction's wrapper or
// receiver is installed when Ken's file loads, once, and that each can be turned off;
// and each correction on its own, against Ken's code beside it. Ken's Cinderella with
// SLIPS is checked by tools/check-ext.mjs --extensions slips (its goldens,
// reports/ext/slips/), each correction alone by tools/check-slips.mjs --each, the speed
// inversion by tools/check-slips.mjs --speed, and stories by tools/check-stress.mjs
// (test/stories/stress/slips-good-helps.lisp).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot, extensionsFor, EXTENSIONS, pass1, pass2, storyOutline, storyPlan } from "../src/pipeline.js";

const lisp = (extensions, setup = null) => {
  const L = boot(makeProjectFileSystem(), { extensions });
  const run = (src) => L.print(L.evalString(src)).toLowerCase();
  if (setup) run(setup);
  return { L, run };
};
const wraps = (run, f) => run(`(mapcar 'car (get '${f} 'revival-wraps))`);

test("the registry: SLIPS corrects slips, a repair, opt-in, changing Ken's Cinderella; it requires KNOW, and FIT, whose S15 is", () => {
  assert.deepEqual(extensionsFor(["slips"]).map((e) => e.id), ["mend", "know", "fit", "slips"]);
  const slips = EXTENSIONS.find((e) => e.id === "slips");
  assert.equal(slips.changes1978, true);
  assert.equal(slips.group, "repairs");
  assert.equal(slips.optIn, true);
  assert.deepEqual(slips.files, ["wrap", "slips", "slips1", "slips2", "slips3", "slips6", "slips7", "slips8", "slips9", "slip13", "slip14"]);
  assert.equal(slips.afterPass1, "(note-friendlys-attractions)");
  // the four the page's switch turns on are not opt-in (Ken's decision 3), nor SEEN,
  // which it turns on beside them since Ken's testing of 15 October
  // and FIT, which Ken's decision of 16 October has on with the revival's extensions
  for (const id of ["mend", "know", "appear", "change", "seen", "fit"]) assert.ok(!EXTENSIONS.find((e) => e.id === id).optIn, id);
});

test("each wrapper is installed once SUGEST, CHOMET, ELEMNT, INTERF and DICHAR have loaded, and in 1978 mode none is", () => {
  const { run } = lisp(["slips"]);
  for (const f of ["sugest", "chomet", "elemnt", "dscrp"]) run(`(load '|ken;${f} >|)`);
  for (const f of ["first-sibling-that-satisfies", "bind-convey-method", "object-that-satisfies", "activity-that-satisfies", "event-that-satisfies"]) assert.equal(wraps(run, f), "(slips1)", f);
  run("(load '|ken;glosug >|)");
  assert.equal(wraps(run, "pick-value-with-variety"), "(slips2)");
  assert.equal(wraps(run, "character-that-satisfies"), "(slips1 mend6 mend4)");
  assert.equal(wraps(run, "pass-prerequisite-test"), "(slips6)");
  assert.equal(wraps(run, "eliminate-by-prerequisites"), "(slips6)");
  // loading SLIPS again wraps nothing twice
  run("(load '|revive;slips1 >|)");
  assert.equal(wraps(run, "first-sibling-that-satisfies"), "(slips1)");
  const ken = lisp([]);
  for (const f of ["sugest", "chomet"]) ken.run(`(load '|ken;${f} >|)`);
  assert.equal(wraps(ken.run, "first-sibling-that-satisfies"), "nil");
  assert.equal(ken.run("(boundp ':slips-off)"), "nil");
});

test("with CHANGE too, SLIPS' functions leave CHSHOW's as they are (S13's carrier-of-walk, not CHSHOW's carrier-of)", () => {
  const { run } = lisp(["change", "slips"]);
  run("(define t-sub something)");
  run("(ask t-sub set your methods to ((changes-while-wandering cinderella)))");
  assert.equal(run("(carrier-of 'cinderella 't-sub)"), "(changes-while-wandering cinderella)");
  assert.notEqual(run("(get 'carrier-of-walk 'expr)"), "nil");
});

test("S2: described as all of the words, or any of them", () => {
  const { run } = lisp(["slips"]);
  run("(load '|ken;datest >|)");
  run("(init nil)"); // Ken's Cinderella: the Prince is good (cindy.46:43), no one weak
  assert.equal(run("(described-as-all 'prince '(good))"), "t");
  assert.equal(run("(described-as-all 'prince '(weak good))"), "nil");
  assert.equal(run("(described-as-any 'prince '(weak good))"), "t");
  assert.equal(run("(described-as-any 'step-mother '(weak good))"), "nil");
  // weak physically: described (physical physically-weak), as DSCRP has it (dscrp.17:292)
  // and PREREQ reads weak (prereq.19:45-55)
  run("(define t-kid character (process initial description (physical physically-weak) (personality (and good shy))))");
  assert.equal(run("(described-as-all 't-kid '(weak good))"), "t");
  assert.equal(run("(described-as? 't-kid 'strong)"), "nil");
});

test("S12: a high variety picks the least used value, a low the most used; medium, and turned off, Ken's", () => {
  const pick = (run, level) => run(`(pick-value-with-variety '${level} '(high medium low) 'speed)`);
  const counted = (setup) => {
    const x = lisp(["slips"], setup);
    x.run("(load '|ken;glosug >|)");
    x.run("(load '|ken;elemnt >|)");
    // speed chosen high three times, medium twice, low once
    x.run("(ask speed set your (count-for high) to 3)");
    x.run("(ask speed set your (count-for medium) to 2)");
    x.run("(ask speed set your (count-for low) to 1)");
    return x;
  };
  const { run } = counted();
  assert.equal(pick(run, "high"), "low");
  assert.equal(pick(run, "low"), "high");
  assert.equal(pick(run, "medium"), "medium");
  assert.equal(run("(ask speed recall if any items match (revival-repair: what variety-pick was (high high) now low %))"), "t");
  const off = counted("(setq :slips-off '(s12))");
  assert.equal(pick(off.run, "high"), "high"); // Ken's: the most used (glosug.41:67-68)
  assert.equal(pick(off.run, "low"), "low");
});

test("S3: friendly's tendencies are named as ELEMNT's elements; turned off, as Ken wrote them", () => {
  const suggestions = (run) => run("(ask friendly collect items memorized matching (suggestion: element ? value (? ?) strength ? source ?))");
  const on = lisp(["slips"]);
  on.run("(load '|ken;dscrp >|)");
  const s = suggestions(on.run);
  for (const e of ["friends", "strangers", "enemies"]) {
    assert.ok(s.includes(`element attraction-towards-${e}`), e);
    assert.ok(!s.includes(`element attraction-to-${e}`), e);
  }
  const off = lisp(["slips"], "(setq :slips-off '(s3))");
  off.run("(load '|ken;dscrp >|)");
  assert.ok(suggestions(off.run).includes("element attraction-to-friends value (positive high)"));
});

test("S6: the prerequisites test reads 'prerequisites, and drops a method one of whose is not met", () => {
  // a prerequisite whose status is not met, written as PREREQ's are (prereq.19:27-39)
  const unmet = "(define t-unmet prerequisite (add (if-asked-about (status-of (t-unmet ?) ?) '(status-of (t-unmet x) not-met)) to your list of (status-of if-recalling-items)))";
  const suggestion = "'(suggestion: element x value (method: type convey value (avoids goat kid) prerequisites ((t-unmet x))) strength high source x)";
  const { run } = lisp(["slips"]);
  for (const f of ["chomet", "prereq"]) run(`(load '|ken;${f} >|)`);
  run(unmet);
  assert.equal(run(`(pass-prerequisite-test ${suggestion})`), "nil");
  // eliminate-by-prerequisites drops it, and notes it on the task
  run("(define t-task something)");
  assert.equal(run(`(eliminate-by-prerequisites (list (list 'related-suggestions: 'main-suggestion ${suggestion})) 't-task)`), "nil");
  assert.equal(run("(ask t-task recall if any items match (revival-repair: what prerequisite-not-met was (avoids goat kid) now dropped because ((t-unmet x))))"), "t");
  // Ken's reads 'prerequisite, and passes it
  const off = lisp(["slips"], "(setq :slips-off '(s6))");
  for (const f of ["chomet", "prereq"]) off.run(`(load '|ken;${f} >|)`);
  off.run(unmet);
  assert.equal(off.run(`(pass-prerequisite-test ${suggestion})`), "t");
});

test("S7: MIDDLE is less than (not low), as it is greater than (not high); Ken's line answers nil", () => {
  const { run } = lisp(["slips"]);
  run("(load '|ken;elemnt >|)");
  assert.equal(run("(ask medium are you greater-than (not high))"), "bottom");
  assert.equal(run("(ask medium are you less-than (not low))"), "top");
  assert.equal(run("(ask medium are you less-than (not short))"), "top");
  assert.equal(run("(ask medium are you less-than high)"), "t");
  assert.equal(run("(ask middle recall if any items match (revival-repair: what middle-less-than %))"), "t");
  const off = lisp(["slips"], "(setq :slips-off '(s7))");
  off.run("(load '|ken;elemnt >|)");
  assert.equal(off.run("(ask medium are you less-than (not low))"), "nil");
});

// Director as filming has it, at a frame rate, Cinderella standing with the scene's
// dynamics, (special-dynamics-of cinderella in t-subscene), whose subscene is an actor
// for the notes (as test/change.test.js's directorAt, with one).
function directorAt(fps, extensions = ["slips"], setup = null) {
  const L = boot(makeProjectFileSystem(), { extensions });
  const run = (src) => L.print(L.evalString(src)).toLowerCase();
  if (setup) run(setup);
  run("(cs)");
  run("(load '|ken;aninit >|)");
  run("(tvsize 550 413)");
  run(`(setq :frames-per-second ${fps})`);
  run("(define t-subscene director-subscene)");
  run("(define (special-dynamics-of cinderella in t-subscene) special-dynamics (set your path-curvature to low))");
  run("(ask cinderella set your special-dynamics to (special-dynamics-of cinderella in t-subscene))");
  run("(ask cinderella set your position to (0.0 0.0))");
  run("(ask cinderella show)");
  const tick = () => run("(ask default-universe tick)");
  return { L, run, tick };
}
const sceneFactor = (run) => Number(run("(ask (special-dynamics-of cinderella in t-subscene) recall your (path-curvature factor))"));

test("S8: dynamics set again take their parent's factor once, as it is now; Ken's demon multiplies it in again", () => {
  const setTwice = (run) => {
    run("(ask (special-dynamics-of cinderella in t-subscene) set your (speed factor) to 0.5)");
    run("(define |(special-dynamics-of cinderella in t-subscene)-1| (special-dynamics-of cinderella in t-subscene) (set your (speed factor) to 0.8))");
    const walk = "|(special-dynamics-of cinderella in t-subscene)-1|";
    const speed = () => Number(run(`(ask ${walk} recall your (speed factor))`));
    run(`(ask cinderella set your special-dynamics to ${walk})`);
    const first = speed();
    run("(ask cinderella set your special-dynamics to (special-dynamics-of cinderella in t-subscene))");
    run(`(ask cinderella set your special-dynamics to ${walk})`);
    const second = speed();
    run("(ask (special-dynamics-of cinderella in t-subscene) set your (speed factor) to 0.25)");
    run(`(ask cinderella set your special-dynamics to ${walk})`);
    return [first, second, speed()];
  };
  const { run } = directorAt(4);
  const [first, second, third] = setTwice(run);
  assert.ok(Math.abs(first - 0.4) < 1e-6 && Math.abs(second - 0.4) < 1e-6, `${first} ${second}`);
  assert.ok(Math.abs(third - 0.2) < 1e-6, `the parent's as it is now: ${third}`);
  assert.equal(run("(ask t-subscene recall if any items match (revival-repair: what factors-once %))"), "t");
  const ken = directorAt(4, ["slips"], "(setq :slips-off '(s8))");
  const kens = setTwice(ken.run);
  assert.ok(Math.abs(kens[1] - 0.2) < 1e-6 && Math.abs(kens[2] - 0.05) < 1e-6, `Ken's: ${kens}`);
});

// The review of stage 7's M1: a change grown into a walk of the scene's dynamics (DICHAR's
// second repeat) and into the scene's dynamics (its first), and the walk then set again,
// as an activity repeats. Ken's demon takes the change twice, once in the walk's own
// factor and once in the parent's now; S8 takes it once (as the stepmother's second walk
// in Justice). The walk's own factor is 1.0, so it walks at the scene's speed.
test("S8: a change grown into a walk and into its parent is taken once when the walk is set again; Ken's demon takes it twice", () => {
  const walk = "|(special-dynamics-of cinderella in t-subscene)-1|";
  const run = (setup) => {
    const d = directorAt(4, ["slips"], setup);
    d.run(`(define ${walk} (special-dynamics-of cinderella in t-subscene) (set your (speed factor) to 1.0))`);
    d.run(`(ask cinderella set your special-dynamics to ${walk})`); // her walk, first set
    d.run("(ask cinderella gradually change by 0.5 factor for speed at medium speed)");
    for (let k = 0; k < 30; k++) d.tick();
    const scene = Number(d.run("(ask (special-dynamics-of cinderella in t-subscene) recall your (speed factor))"));
    const own = Number(d.run(`(ask ${walk} recall your (speed factor))`));
    d.run("(ask cinderella set your special-dynamics to (special-dynamics-of cinderella in t-subscene))");
    d.run(`(ask cinderella set your special-dynamics to ${walk})`); // set again
    const again = Number(d.run(`(ask ${walk} recall your (speed factor))`));
    d.run("(ask cinderella set your special-dynamics to (special-dynamics-of cinderella in t-subscene))");
    d.run(`(ask cinderella set your special-dynamics to ${walk})`); // and again
    return { d, scene, own, again, third: Number(d.run(`(ask ${walk} recall your (speed factor))`)) };
  };
  // the change by 0.5 at medium speed: 14 steps of e^(-1/20), 2.718^(-14/20) = 0.4966
  const change = 2.718 ** (-14 / 20);
  const slips = run(null);
  assert.ok(Math.abs(slips.scene - change) < 1e-4 && Math.abs(slips.own - change) < 1e-4, `the change grows both: ${slips.scene} ${slips.own}`);
  assert.ok(Math.abs(slips.again - change) < 1e-4, `set again, the change once: ${slips.again}`);
  assert.ok(Math.abs(slips.third - change) < 1e-4, `and again: ${slips.third}`);
  assert.equal(slips.d.run(`(ask t-subscene recall if any items match (revival-repair: what factors-once was ((%)) now once because (set-again ${walk} (a-change-taken-twice ((%))))))`), "t");
  // Ken's demon (S8 off): the change twice, 0.4966 squared
  const ken = run("(setq :slips-off '(s8))");
  assert.ok(Math.abs(ken.again - change * change) < 1e-4, `Ken's: ${ken.again}`);
  // a change whose scene dynamics are not the walk's parent's (a part that extends
  // another, its dynamics not the walk's ancestors) is kept in the walk, as before
  const other = directorAt(4);
  other.run("(define t-host director-subscene)");
  other.run("(define (special-dynamics-of cinderella in t-host) special-dynamics (set your speed to medium))");
  other.run("(define |(special-dynamics-of cinderella in t-host)-1| (special-dynamics-of cinderella in t-host) (set your (speed factor) to 1.0))");
  // her first change is in t-subscene, whose dynamics she then has: they are her scene's
  other.run("(ask cinderella gradually change by 1.0 factor for speed at medium speed)");
  other.run("(ask cinderella set your special-dynamics to |(special-dynamics-of cinderella in t-host)-1|)");
  other.run("(ask cinderella gradually change by 0.5 factor for speed at medium speed)");
  for (let k = 0; k < 30; k++) other.tick();
  other.run("(ask cinderella set your special-dynamics to (special-dynamics-of cinderella in t-host))");
  other.run("(ask cinderella set your special-dynamics to |(special-dynamics-of cinderella in t-host)-1|)");
  const kept = Number(other.run("(ask |(special-dynamics-of cinderella in t-host)-1| recall your (speed factor))"));
  assert.ok(Math.abs(kept - change) < 1e-4, `kept in the walk: ${kept}`);
});

test("S9, S10, S11: a gradual change takes DISPLY's estimate, grows once a tick, and reaches its factor", () => {
  // by 4 at high speed: DISPLY's estimate is 5/2 x ln 4 = 3.47 seconds (disply.311:1104-1107),
  // 14 ticks at 4 frames a second; Ken's Director takes 5 x 2 x ln 4 x 4 = 55
  const { run, tick } = directorAt(4);
  run("(ask cinderella gradually change by 4.0 factor for path-curvature at high speed)");
  for (let k = 0; k < 13; k++) tick();
  const at13 = sceneFactor(run);
  tick();
  assert.ok(Math.abs(sceneFactor(run) - 2.718 ** (14 / (2.5 * 4)) ) < 1e-3, `after 14 ticks: ${sceneFactor(run)} (${at13} after 13)`);
  for (let k = 0; k < 10; k++) tick();
  assert.ok(Math.abs(sceneFactor(run) - 2.718 ** (14 / 10)) < 1e-3, `and stops: ${sceneFactor(run)}`);
  for (const what of ["change-at-its-speed", "change-steps", "grown-once"]) assert.equal(run(`(ask t-subscene recall if any items match (revival-repair: what ${what} %))`), "t", what);
  // a change of a tick takes its step: Ken's repeat 1 time takes none (some.666:444-450)
  const one = directorAt(4, ["slips"], "(setq :slips-off '(s9))");
  one.run("(ask cinderella gradually change by 1.125 factor for path-curvature at low speed)");
  for (let k = 0; k < 3; k++) one.tick();
  assert.ok(Math.abs(sceneFactor(one.run) - 2.718 ** (1 / 10)) < 1e-4, `one tick, one step: ${sceneFactor(one.run)}`);
  const ken = directorAt(4, ["slips"], "(setq :slips-off '(s9 s10 s11))");
  ken.run("(ask cinderella gradually change by 1.125 factor for path-curvature at low speed)");
  for (let k = 0; k < 3; k++) ken.tick();
  assert.equal(ken.run("(ask (special-dynamics-of cinderella in t-subscene) recall your (path-curvature factor))"), "nil", "Ken's: no step at all");
});

// A story's pass 1 and its first scene's pass 2, with these extensions.
function storyScene(file, extensions) {
  const text = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const plan = storyPlan(storyOutline(text));
  const fs = makeProjectFileSystem();
  fs.addFile("KEN", "CINDY", "47", { text, origin: file });
  pass1(fs, { extensions });
  return pass2(fs, plan.scenes[0].id, { plan, extensions }).glass;
}
const choiceOf = (glass, name) => (glass.tasks.find((t) => t.name === name) || { variables: {} }).variables["current-choice"];

test("S1 and S2: good helps the one in the scene weak and good both; failing that, either; failing that, anyone; Ken's is-not finds no one", () => {
  const file = "test/stories/stress/slips-good-helps.lisp";
  const glass = storyScene(file, ["slips"]);
  assert.match(choiceOf(glass, "establish-task-1"), /\(helps goat kid\)/);
  const notes = glass.repairs.map((r) => r.note);
  assert.ok(notes.includes("(revival-repair: what described-as-preferred was (weak good) now (kid all) because (in on-the-bridge))"), notes.join("\n"));
  assert.ok(notes.some((n) => n.startsWith("(revival-repair: what no-such-generator was (is-desired-by ")));
  const off = storyScene(file, ["know"]);
  assert.doesNotMatch(choiceOf(off, "establish-task-1") || "", /helps/);
});
