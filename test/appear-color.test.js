// REVIVE;COLORS, REVIVE;ALTER and the changes of look in REVIVE;LOOKS: Ani's colors,
// and her characters' looks changing during a scene (reports/chapter-x/PLAN.md, "Items
// 1 and 2: appearances", Phase 9 stage 5). What the whole of Ken's Cinderella makes
// with them, and that the look changes leave its plans, places and timing as they were
// (the duration guard), are tools/check-ext.mjs's (npm run test:ext, test:ext24); that
// no piece of the revival's knowledge gives back Ken's 1978 colors is
// tools/check-appear.mjs's. These check, quickly: the semantic net of hues, each
// character's color, the display methods and joy's look change, and Director growing,
// dimming, recoloring and in-betweening a look tick by tick.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot, pass2, recorder } from "../src/pipeline.js";
import { UNIT_BIT } from "../src/tv/turtle.js";

// A Lisp with APPEAR set up as pass 1 is before (z), as test/appear.test.js has it, and
// with the files pass 2 plans display methods with: DISPLY, EMOTE, CHOMET and INTERF.
let shared = null;
function setUp() {
  if (shared) return shared;
  const L = boot(makeProjectFileSystem(), { extensions: ["appear"] });
  const run = (src) => L.print(L.evalString(src));
  run("(cs)");
  run("(load '|ken;datest >|)");
  run("(init nil)");
  for (const f of ["elemnt", "csumry", "sugrel", "postpo", "chocho", "nodes", "disply", "emote", "chomet", "interf"]) run(`(load '|ken;${f} >|)`);
  shared = { L, run };
  return shared;
}
const suggestion = (value, strength, source) => `(suggestion: element color-hue value ${value} strength ${strength} source ${source})`;

test("hue-net: six hues on a painter's wheel, each opposite its complement; how two are related", () => {
  const { run } = setUp();
  assert.equal(run("(ask color-hue recall your value-description)"), "HUE-NET");
  assert.equal(run("(ask color-hue recall your possible-values)"), "(YELLOW ORANGE RED PURPLE BLUE GREEN)");
  assert.equal(run("(ask hue-net recall your relative-value-description)"), "HUE-NET");
  const opposite = (h) => run(`(ask hue-net yield opposite of ${h})`);
  assert.deepEqual(["red", "orange", "yellow", "green", "blue", "purple"].map(opposite), ["GREEN", "BLUE", "PURPLE", "RED", "ORANGE", "YELLOW"]);
  const related = (a, b) => run(`(ask hue-net yield relationship ${a} ${b} in nil nil)`);
  assert.equal(related("red", "red"), "IDENTICAL");
  assert.equal(related("red", "orange"), "ADJACENT-HUES");
  assert.equal(related("red", "yellow"), "NEAR-ENOUGH");
  assert.equal(related("purple", "yellow"), "COMPLEMENTARY");
  assert.equal(related("green", "orange"), "NEAR-ENOUGH"); // round the wheel through yellow
  // each hue drawn at the angle of the TV's color of that name
  assert.equal(run("(mapcar 'hue-angle '(red orange yellow green blue purple))"), "(0.0 30.0 60.0 120.0 240.0 270.0)");
});

test("hue-net's combine: the same hue merged; two steps apart, compromised as COSUG compromises, with Ani's record; a step apart or opposite, a conflict", () => {
  const { run } = setUp();
  const combine = (...s) => run(`(ask hue-net combine suggestions ${s.join(" ")})`);
  const film = "(example-of (ask film recall your current-film) something)";
  assert.equal(combine(suggestion("red", "medium", "a"), suggestion("red", "high", "b")), "(SUGGESTION: ELEMENT COLOR-HUE VALUE RED STRENGTH HIGH SOURCE (AND B A))");
  // equally strong, two steps apart, in Cinderella's film, which is to be obvious: the
  // first is kept, as Ken's pick-non-medium keeps the value that isn't medium
  // (compromise-three-values-different, cosug.215:836-839), the hue between being a
  // hue's medium
  assert.equal(run("(film-level-of 'obviousness)"), "HIGH");
  assert.equal(combine(suggestion("red", "medium", "a"), suggestion("yellow", "medium", "b")),
    "(SUGGESTION: ELEMENT COLOR-HUE VALUE RED STRENGTH MEDIUM SOURCE (AND B A) COMPROMISES ((COMPROMISED: HUES (RED YELLOW) SOURCES (A B) TO RED BECAUSE (EQUALLY-STRONG (OBVIOUSNESS LEVEL) HIGH))))");
  // in a film that isn't to be obvious, they meet in the hue between
  run(`(ask ,${film} set your (obviousness level) to medium)`);
  try {
    assert.equal(combine(suggestion("red", "medium", "a"), suggestion("yellow", "medium", "b")),
      "(SUGGESTION: ELEMENT COLOR-HUE VALUE ORANGE STRENGTH MEDIUM SOURCE (AND B A) COMPROMISES ((COMPROMISED: HUES (RED YELLOW) SOURCES (A B) TO ORANGE BECAUSE (EQUALLY-STRONG))))");
  } finally {
    run(`(ask ,${film} set your (obviousness level) to high)`);
  }
  // not equally: Cinderella's film's originality is low, which takes the stronger
  // (compromise-three-values-different, cosug.215:851-863), as for the fairy godmother,
  // magical's purple against the film's variety's orange
  assert.equal(run("(film-level-of 'originality)"), "LOW");
  assert.equal(combine(suggestion("purple", "medium", "magical"), suggestion("orange", "low", "(variety level)")),
    "(SUGGESTION: ELEMENT COLOR-HUE VALUE PURPLE STRENGTH MEDIUM SOURCE (AND (VARIETY LEVEL) MAGICAL) COMPROMISES ((COMPROMISED: HUES (PURPLE ORANGE) SOURCES (MAGICAL (VARIETY LEVEL)) TO PURPLE BECAUSE ((ORIGINALITY LEVEL) LOW))))");
  assert.equal(combine(suggestion("red", "medium", "a"), suggestion("green", "high", "b")),
    `(CONFLICT: TYPE COMPLEMENTARY ELEMENTS-INVOLVED COLOR-HUE OFFENDERS (${suggestion("red", "medium", "a").toUpperCase()} ${suggestion("green", "high", "b").toUpperCase()}))`);
  assert.match(combine(suggestion("red", "medium", "a"), suggestion("orange", "high", "b")), /^\(CONFLICT: TYPE ADJACENT-HUES /);
  // three: COSUG combines them two at a time (cosug.215:678-762), here the two reds
  // first, merged as two sources, and then that with the yellow, which, more strongly
  // suggested, is red again, with the record of that compromise
  assert.equal(combine(suggestion("red", "medium", "a"), suggestion("yellow", "medium", "b"), suggestion("red", "low", "c")),
    "(SUGGESTION: ELEMENT COLOR-HUE VALUE RED STRENGTH MEDIUM SOURCE (AND B A C) COMPROMISES ((COMPROMISED: HUES (RED YELLOW) SOURCES ((AND A C) B) TO RED BECAUSE ((ORIGINALITY LEVEL) LOW))))");
  // the opposite of an atom only, as value-description's (cosug.215:115), and Ken's
  // shouldnt-happen for an atom that is no hue, not a Lisp arithmetic error
  assert.throws(() => run("(ask hue-net yield opposite of (not purple))"), /BAD-MESSAGE/);
  assert.throws(() => run("(hue-opposite 'none)"), /NONE IS NOT A HUE ON THE WHEEL/);
  assert.throws(() => run("(hue-between 'none 'red)"), /NONE IS NOT A HUE ON THE WHEEL/);
});

test("the film's variety's hue says what it picked from, the counts in the list's order", () => {
  const { run } = setUp();
  run("(ask appearance-choice-point if new make (choice-point-of cinderella color-hue))");
  run("(ask appearance-choice-point if new make (choice-point-of cinderella color-saturation))");
  // no hue chosen yet: the middle of the revival's list, as for Cinderella in her film
  assert.equal(run("(ask (variety level) yield suggestions for (choice-point-of cinderella color-hue))"),
    "(SUGGESTION: ELEMENT COLOR-HUE VALUE PURPLE STRENGTH LOW SOURCE (VARIETY LEVEL) COUNTS ((0 YELLOW) (0 ORANGE) (0 RED) (0 PURPLE) (0 BLUE) (0 GREEN)))");
  // the other elements' suggestions are as Ken's code makes them
  assert.equal(run("(ask (variety level) yield suggestions for (choice-point-of cinderella color-saturation))"),
    "(SUGGESTION: ELEMENT COLOR-SATURATION VALUE MEDIUM STRENGTH LOW SOURCE (VARIETY LEVEL))");
  assert.equal(run("(get 'colors-variety-counts 'revival-done)"), "T");
});

test("a hue conflict CHOOSE can't settle on strengths alone: the stronger by a little, the first if equal, or the one a third suggestion agrees with", () => {
  const { run } = setUp();
  const chosen = (name, ...list) => {
    run(`(define ${name} something)`);
    const cp = `(choice-point-of ${name} color-hue)`;
    run(`(ask appearance-choice-point if new make ${cp})`);
    run(`(ask ${cp} set your suggestion-sources to nil)`);
    run(`(record-combined-suggestion (ask hue-net combine suggestions ${list.join(" ")}) '${cp})`);
    run(`(choose-value '${cp})`);
    return { value: run(`(ask ${cp} recall your current-choice)`), rejected: run(`(ask ${cp} recall your rejected-suggestions)`), conflicts: run(`(ask ${cp} recall your conflicts-resolved)`) };
  };
  // two words, a step apart, one a little more strongly (pick-strongest-suggestion,
  // choose.198:391-403)
  const close = chosen("t-close", suggestion("purple", "medium", "magical"), suggestion("red", "low", "evil"));
  assert.equal(close.value, "PURPLE");
  assert.match(close.rejected, /REASON LESS-STRONGLY-SUGGESTED SUGGESTION \(SUGGESTION: ELEMENT COLOR-HUE VALUE RED /);
  assert.match(close.conflicts, /HOW-RESOLVED LESS-STRONGLY-SUGGESTED TYPE ADJACENT-HUES /);
  // equally strongly: "first is as good as second"
  const equal = chosen("t-equal", suggestion("purple", "medium", "magical"), suggestion("red", "medium", "evil"));
  assert.equal(equal.value, "PURPLE");
  assert.match(equal.rejected, /REASON NO-REASON-AT-ALL SUGGESTION \(SUGGESTION: ELEMENT COLOR-HUE VALUE RED /);
  // with a third, the film's variety's yellow, opposite purple: CHOOSE settles that
  // conflict first, yellow much less strongly suggested than magical's purple, which
  // it keeps as a suggestion; then, for red against purple, equally strong, it asks
  // hue-net how that suggestion is related to each (use-suggestions-to-resolve-
  // conflict, choose.198:454-520, through hue-net's yield relationship ... in ...):
  // the same as purple and a step from red, so red is not compatible with the others
  const third = chosen("t-third", suggestion("purple", "medium", "magical"), suggestion("red", "medium", "evil"), suggestion("yellow", "low", "(variety level)"));
  assert.equal(third.value, "PURPLE");
  assert.match(third.conflicts, /HOW-RESOLVED NOT-COMPATIBLE-WITH-OTHERS TYPE ADJACENT-HUES /);
  assert.match(third.rejected, /REASON NOT-COMPATIBLE-WITH-OTHERS SUGGESTION \(SUGGESTION: ELEMENT COLOR-HUE VALUE RED /);
  assert.match(third.conflicts, /HOW-RESOLVED MUCH-LESS-STRONGLY-SUGGESTED TYPE COMPLEMENTARY /);
});

test("a hue conflict is resolved by CHOOSE as any other: the stronger wins, the weaker is rejected", () => {
  const { run } = setUp();
  run("(define t-hue something)");
  run("(ask appearance-choice-point if new make (choice-point-of t-hue color-hue))");
  const cp = "(choice-point-of t-hue color-hue)";
  const a = suggestion("purple", "high", "magical");
  const b = suggestion("yellow", "low", "(variety level)");
  run(`(ask ${cp} set your suggestion-sources to nil)`);
  run(`(record-combined-suggestion (ask hue-net combine suggestions ${a} ${b}) '${cp})`);
  run(`(choose-value '${cp})`);
  assert.equal(run(`(ask ${cp} recall your current-choice)`), "PURPLE");
  assert.match(run(`(ask ${cp} recall your rejected-suggestions)`), /REASON MUCH-LESS-STRONGLY-SUGGESTED SUGGESTION \(SUGGESTION: ELEMENT COLOR-HUE VALUE YELLOW/);
  assert.match(run(`(ask ${cp} recall your conflicts-resolved)`), /TYPE COMPLEMENTARY/);
});

test("the knowledge of colors: evil's black is Ken's (p. 161), the rest the revival's, each with its evidence; flashiness reaches color", () => {
  const { run, L } = setUp();
  const rows = L.toArray(L.evalString("(appearance-knowledge)")).map((r) => L.print(r));
  const of = (re) => rows.filter((r) => re.test(r));
  assert.deepEqual(of(/^\(DESCRIPTOR EVIL COLOR-/), ["(DESCRIPTOR EVIL COLOR-INTENSITY LOW HIGH (THESIS 161 |bad guys wear black|))"]);
  assert.match(of(/^\(DESCRIPTOR MAGICAL COLOR-HUE/)[0], /PURPLE MEDIUM \(WHY /);
  assert.match(of(/^\(DESCRIPTOR SHABBY COLOR-SATURATION/)[0], /LOW HIGH \(WHY .*p\. 225/);
  // magical's purple, the only hue a word suggests (no evil red: decision 4), and the
  // order the film's variety takes the hues in, the revival's, with its reason
  assert.equal(of(/COLOR-HUE/).length, 2);
  assert.match(of(/^\(ORDER \(VARIETY LEVEL\) COLOR-HUE /)[0], /^\(ORDER \(VARIETY LEVEL\) COLOR-HUE \(YELLOW ORANGE RED PURPLE BLUE GREEN\) LOW \(WHY \|where nothing else decides between hues.*decision 4.*for Ken to decide\|\)\)$/);
  assert.equal(run("(equal (fourth (first :hue-order-knowledge)) (ask color-hue recall your possible-values))"), "T");
  assert.deepEqual(of(/^\(FILM \(FLASHINESS LEVEL\) COLOR-/).map((r) => r.split(" ")[3]), ["COLOR-INTENSITY", "COLOR-SATURATION"]);
  assert.match(of(/^\(LOOK-CHANGE JOY/)[0], /COLOR-INTENSITY AMOUNT MEDIUM \(AND \(THESIS 166 /);
  assert.match(of(/^\(COMPARISON \(UNIQUENESS-SUMMARY: PHYSICAL\)/)[0], /RELATIVE-COLOR-INTENSITY/);
  // taught as Ken's process suggestions takes them
  assert.equal(run("(ask evil collect items memorized matching (suggestion: element color-intensity value ? strength ? source ?))"),
    "((SUGGESTION: ELEMENT COLOR-INTENSITY VALUE LOW STRENGTH HIGH SOURCE EVIL))");
  run("(ask appearance-choice-point if new make (choice-point-of cinderella color-saturation))");
  assert.equal(run("(ask (flashiness level) yield suggestions for (choice-point-of cinderella color-saturation))"),
    "(SUGGESTION: ELEMENT COLOR-SATURATION VALUE LOW STRENGTH MEDIUM SOURCE (FLASHINESS LEVEL))");
});

test("each character's color: its hue's angle, its saturation and intensity as APPEAR's own numbers; a dark one never black", () => {
  const { run } = setUp();
  const choose = (who, e, v) => {
    run(`(ask appearance-choice-point if new make (choice-point-of ${who} ${e}))`);
    run(`(ask (choice-point-of ${who} ${e}) set your current-choice to ${v})`);
  };
  run("(define t-colored something)");
  run("(ask appearance if new make (appearance-of t-colored))");
  choose("t-colored", "color-hue", "blue");
  choose("t-colored", "color-saturation", "low");
  choose("t-colored", "color-intensity", "low");
  run("(color-character 't-colored)");
  assert.equal(run("(ask (appearance-of t-colored) recall your hue)"), "BLUE");
  assert.equal(run("(ask (appearance-of t-colored) recall your look-color)"), "(240.0 0.35 0.45)");
  assert.equal(run("(ask (appearance-of t-colored) collect items memorized matching (colored: %))"), "((COLORED: HUE BLUE ANGLE 240.0 SATURATION 0.35 VALUE 0.45))");
  assert.equal(run("(list (drawn-value 't-colored 'color-hue) (drawn-value 't-colored 'color-saturation) (drawn-value 't-colored 'color-intensity))"), "(BLUE LOW LOW)");
  assert.equal(run("(get 'color-intensity 'appearance-numbers)"), "((LOW 0.45) (MEDIUM 0.65) (HIGH 0.85))");
  // a hue given up on: grey, with a note; and a (not X), which no element of today's
  // makes for a hue, grey with a note of its own
  run("(define t-grey something)");
  run("(ask appearance if new make (appearance-of t-grey))");
  choose("t-grey", "color-hue", "none");
  choose("t-grey", "color-saturation", "high");
  choose("t-grey", "color-intensity", "high");
  run("(color-character 't-grey)");
  assert.equal(run("(ask (appearance-of t-grey) recall your look-color)"), "(0.0 0.0 0.85)");
  assert.match(run("(ask (choice-point-of t-grey color-hue) collect items memorized matching (revival-repair: %))"), /READ-AS-COLOR WAS NONE NOW GREY BECAUSE \(GIVEN UP SO NO HUE\)/);
  run("(define t-not something)");
  run("(ask appearance if new make (appearance-of t-not))");
  choose("t-not", "color-hue", "(not purple)");
  choose("t-not", "color-saturation", "high");
  choose("t-not", "color-intensity", "high");
  run("(color-character 't-not)");
  assert.match(run("(ask (choice-point-of t-not color-hue) collect items memorized matching (revival-repair: %))"), /READ-AS-COLOR WAS \(NOT PURPLE\) NOW GREY BECAUSE \(NOT ONE HUE\)/);
});

test("look changes are display methods, children of change-method, whose estimates are Ken's for the same change", () => {
  const { run } = setUp();
  for (const m of ["look-change:", "look-change-to:"]) assert.notEqual(run(`(ask ${m} are you a change-method)`), "NIL");
  for (const amount of ["(positive high)", "(negative medium)", "(positive low)"]) {
    const speed = amount.match(/(\w+)\)$/)[1];
    assert.equal(run(`(ask look-change: estimate time for look-change: element (t-a color-intensity) amount ${amount} speed ${speed} in nil)`),
      run(`(ask change: estimate time for change: element (t-a speed) amount ${amount} speed ${speed} in nil)`), amount);
  }
  run("(define t-sub something)");
  run("(ask look-change: run look-change: element (t-a color-intensity) amount (negative high) speed high in t-sub)");
  assert.equal(run("(ask t-sub recall your (changes-for t-a))"), "((GRADUALLY CHANGE LOOK BY 0.66666667 FACTOR FOR COLOR-INTENSITY AT HIGH SPEED))");
  // a change to a size is by the ratio of APPEAR's numbers, from the look pass 1 chose
  run("(ask appearance if new make (appearance-of t-a))");
  run("(ask (appearance-of t-a) set your ani-size to 0.036)");
  run("(ask (appearance-of t-a) set your shape to square)");
  run("(ask look-change-to: run look-change-to: element (t-a size) new-value high speed medium in t-sub)");
  assert.match(run("(ask t-sub recall your (changes-for t-a))"), /^\(\(GRADUALLY CHANGE LOOK BY 1\.944\d* FACTOR FOR SIZE AT MEDIUM SPEED\)/);
  // a change of shape: to the shape the experts draw with the new value
  run("(ask look-change-to: run look-change-to: element (t-a shape-jaggedness) new-value high speed low in t-sub)");
  assert.match(run("(ask t-sub recall your (changes-for t-a))"), /^\(\(GRADUALLY CHANGE LOOK TO \(LOOK: SHAPE TRIANGLE ANGLE 120 CENTER-OFFSET \(RIGHT 30\)\) AT LOW SPEED\)/);
  assert.equal(run("(ask look-change-to: estimate time for look-change-to: element (t-a shape-jaggedness) new-value high speed low in nil)"),
    run(`(estimate-time-for-change-by (exp 1.0) 'low)`));
});

test("joy brightens: each joy also suggests a change of its character's color intensity, by its amount at its speed", () => {
  const { run } = setUp();
  const suggested = (level) => run(`(ask joy collect items memorized matching (suggestion: element (establish (emotional-state t-glad (joy ${level}))) value ? strength ? source ?))`);
  assert.match(suggested("(positive high)"), /\(METHOD: TYPE DISPLAY-VALUE-CHANGE VALUE \(LOOK-CHANGE: ELEMENT \(T-GLAD COLOR-INTENSITY\) AMOUNT \(POSITIVE HIGH\) SPEED HIGH\)\) STRENGTH MEDIUM SOURCE JOY/);
  // beside Ken's change of speed by the same amount at the same speed (emote.9:18-23)
  assert.match(suggested("(negative medium)"), /\(CHANGE: ELEMENT \(T-GLAD SPEED\) AMOUNT \(NEGATIVE MEDIUM\) SPEED MEDIUM\)/);
  assert.match(suggested("(negative medium)"), /\(LOOK-CHANGE: ELEMENT \(T-GLAD COLOR-INTENSITY\) AMOUNT \(NEGATIVE MEDIUM\) SPEED MEDIUM\)/);
  assert.equal(run("(get 'alter-joy 'revival-done)"), "T");
  // taught once, though ALTER is loaded again
  const count = () => (suggested("(positive low)").match(/LOOK-CHANGE:/g) || []).length;
  assert.equal(count(), 1);
  run("(load '|revive;alter >|)");
  assert.equal(count(), 1);
  // a task's look changes come after its other methods (CHOMET, wrapped)
  assert.equal(run("(mapcar 'car (get 'reject-bad-value-changes 'revival-wraps))"), "(ALTER)");
  run("(define t-task something)");
  run("(reject-bad-value-changes '((suggestion: element x value (method: type display-value-change value (look-change: element (t-a color-intensity) amount (positive low) speed low))) (suggestion: element x value (method: type display-value-change value (change: element (t-a speed) amount (positive low) speed low)))) 't-task)");
  assert.match(run("(ask t-task recall your current-choice)"), /^\(\(CHANGE: .*\) \(LOOK-CHANGE: .*\)\)$/);
  // and only beside a change of how its character moves by the same amount at the same
  // speed, whose estimate it equals: one left alone is left out, with a note
  run("(define t-alone something)");
  run("(reject-bad-value-changes '((suggestion: element x value (method: type display-value-change value (look-change: element (t-a color-intensity) amount (positive high) speed high))) (suggestion: element x value (method: type display-value-change value (change: element (t-a speed) amount (positive low) speed low))) (suggestion: element x value (method: type display-value-change value (change: element (t-b speed) amount (positive high) speed high)))) 't-alone)");
  assert.equal(run("(ask t-alone recall your current-choice)"), "((CHANGE: ELEMENT (T-A SPEED) AMOUNT (POSITIVE LOW) SPEED LOW) (CHANGE: ELEMENT (T-B SPEED) AMOUNT (POSITIVE HIGH) SPEED HIGH))");
  assert.equal(run("(ask t-alone collect items memorized matching (revival-repair: %))"),
    "((REVIVAL-REPAIR: WHAT LOOK-CHANGE-ALONE WAS (LOOK-CHANGE: ELEMENT (T-A COLOR-INTENSITY) AMOUNT (POSITIVE HIGH) SPEED HIGH) NOW LEFT-OUT BECAUSE (NO CHANGE OF HOW IT MOVES BY THE SAME AMOUNT AT THE SAME SPEED)))");
});

test("ALTER's and LOOKS' hooks fire once, though their files are loaded again", () => {
  const { run } = setUp();
  run("(load '|ken;dichar >|)");
  run("(ask appearance-choice-point if new make (choice-point-of cinderella color-hue))");
  const ids = ["alter-methods", "alter-joy", "looks-steps-special-dynamics", "looks-take-look", "looks-changes", "looks-shape-changes", "colors-hue-net", "colors-variety-counts"];
  // each hook defines receivers, which an actor keeps in its list of them: defined twice,
  // the list would grow
  const state = () => ({
    done: ids.map((id) => run(`(get '${id} 'revival-done)`)),
    receivers: ["look-change:", "look-change-to:", "special-dynamics", "hue-net"].map((a) => run(`(length (get '${a} 'actor))`)),
    joy: (run("(ask joy collect items memorized matching (suggestion: element (establish (emotional-state t-glad (joy (positive low)))) value ? strength ? source ?))").match(/LOOK-CHANGE:/g) || []).length,
    // the variety's hue says its counts once (extended twice, it would say them twice)
    variety: run("(ask (variety level) yield suggestions for (choice-point-of cinderella color-hue))"),
    wraps: run("(mapcar 'car (get 'reject-bad-value-changes 'revival-wraps))"),
  });
  const first = state();
  assert.deepEqual(first.done, ids.map(() => "T"));
  assert.equal(first.joy, 1);
  assert.equal(first.variety.split("COUNTS").length, 2);
  for (const f of ["colors", "looks", "alter"]) run(`(load '|revive;${f} >|)`);
  assert.deepEqual(state(), first);
});

// A Lisp with Director as filming has it, and a character's segments, as one display draws them.
function director() {
  const L = boot(makeProjectFileSystem(), { extensions: ["appear"] });
  const run = (src) => L.print(L.evalString(src));
  run("(cs)");
  run("(load '|ken;aninit >|)");
  run("(tvsize 550 413)");
  run("(setq :frames-per-second 4)");
  const drawn = (who) => {
    const segs = [];
    const vector = L.tv.boundedVectorFix.bind(L.tv);
    L.tv.boundedVectorFix = (a, b, c, d) => { segs.push([a, b, c, d].map((v) => v / UNIT_BIT)); return vector(a, b, c, d); };
    try {
      run(`(ask ${who} display)`);
    } finally {
      L.tv.boundedVectorFix = vector;
    }
    const xs = segs.flatMap((s) => [s[0], s[2]]);
    return { segs, count: segs.length, span: Math.max(...xs) - Math.min(...xs) };
  };
  const tick = () => run("(ask default-universe tick)");
  run("(ask cinderella set your position to (0.0 0.0))");
  run("(ask cinderella show)");
  return { L, run, drawn, tick };
}
// The sides a drawing has: its segments, with those that go on in the same direction
// from where the last ended joined, as directions in whole degrees.
function sides(segs) {
  const out = [];
  let last = null;
  for (const [x0, y0, x1, y1] of segs) {
    if (Math.hypot(x1 - x0, y1 - y0) < 0.01) continue;
    const dir = Math.round((Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI);
    if (last && last.dir === dir && Math.hypot(x0 - last.x, y0 - last.y) < 0.6) { last.x = x1; last.y = y1; continue; }
    last = { dir, x: x1, y: y1 };
    out.push(dir);
  }
  return out;
}

test("Director grows a look tick by tick, through OBJECT's set your size, and it reaches its factor", () => {
  const { run, drawn, tick } = director();
  run("(ask cinderella take look (look: shape square angle 90 center-offset nil ani-size 0.05 look-color (60.0 1.0 0.65)))");
  const spans = [drawn("cinderella").span];
  // a factor of 1.5 at medium speed takes Ken's round(5 x 1 x 4 x ln 1.5) = 8 ticks (dichar.103:105-117)
  assert.equal(run("(look-change-ticks 1.5 'medium)"), "8");
  run("(ask cinderella gradually change look by 1.5 factor for size at medium speed)");
  spans.push(drawn("cinderella").span);
  for (let k = 0; k < 9; k++) { tick(); spans.push(drawn("cinderella").span); }
  for (let k = 1; k <= 8; k++) assert.ok(spans[k] > spans[k - 1], `wider at tick ${k}: ${spans.join(" ")}`);
  assert.ok(Math.abs(spans[8] / spans[0] - 1.5) < 0.02, `${spans[8]} is 1.5 times ${spans[0]}`);
  assert.equal(spans[9], spans[8]); // and stops
  assert.equal(Number(run("(ask cinderella recall your ani-size)")).toFixed(4), "0.0750");
});

test("a look change is carried by the character's special dynamics, as Ken's change is, so the character plans nothing more", () => {
  const { run, tick } = director();
  run("(define (special-dynamics-of cinderella in t-subscene) special-dynamics)");
  run("(ask cinderella set your special-dynamics to (special-dynamics-of cinderella in t-subscene))");
  run("(ask cinderella take look (look: shape square angle 90 center-offset nil ani-size 0.05 look-color (60.0 1.0 0.65)))");
  run("(ask cinderella gradually change look by 1.5 factor for color-intensity at high speed)");
  // Ken's round(5 x 2 x 4 x ln 1.5) = 16 ticks; the first step taken at once
  assert.equal(run("(ask cinderella recall your things-to-do-next)"), "NIL");
  assert.match(run("(ask (special-dynamics-of cinderella in t-subscene) recall your things-to-do-next)"), /^\(\(LOOK STEP 1 OF 16 FOR CINDERELLA DOING \(GROW COLOR-INTENSITY /);
  for (let k = 0; k < 20; k++) tick();
  assert.equal(run("(ask cinderella recall your look-color)"), "(60.0 1.0 0.975)");
  assert.equal(run("(ask (special-dynamics-of cinderella in t-subscene) recall your things-to-do-next)"), "NIL");
});

test("Director dims and brightens a color without drawing it, never darker than .45, and moves a hue round the wheel", () => {
  const { run, tick, L } = director();
  run("(ask cinderella take look (look: shape square angle 90 center-offset nil ani-size 0.05 look-color (60.0 1.0 0.65)))");
  run("(ask cinderella gradually change look by 0.5 factor for color-intensity at high speed)");
  for (let k = 0; k < 40; k++) tick();
  assert.equal(run("(ask cinderella recall your look-color)"), "(60.0 1.0 0.45)");
  run("(ask cinderella gradually change look by 3.0 factor for color-intensity at high speed)");
  for (let k = 0; k < 60; k++) tick();
  assert.equal(run("(ask cinderella recall your look-color)"), "(60.0 1.0 1.0)");
  // yellow to blue: two steps, through green (60, 120, 240 degrees)
  run("(ask cinderella gradually change look to (look: hue blue) at high speed)");
  const hues = [];
  for (let k = 0; k < 45; k++) { tick(); hues.push(Number(L.print(L.evalString("(first (ask cinderella recall your look-color))")))); }
  assert.ok(hues.some((h) => h > 100 && h < 140), `it passes green: ${hues.join(" ")}`);
  assert.ok(hues.every((h, k) => !k || h >= hues[k - 1]), "always on, round the wheel");
  assert.equal(hues[hues.length - 1], 240);
  // never sent to pencolor
  assert.doesNotMatch(readFileSync("src/director/revive/looks.lisp", "utf8").replace(/;.*$/gm, ""), /pencolor/i);
});

test("Director in-betweens a square into a star: it starts as the square drawn twice (KEN1;INTER's fix-headings) and ends as Ken's star", () => {
  const { run, drawn, tick } = director();
  run("(ask cinderella take look (look: shape square angle 90 center-offset nil ani-size 0.05 look-color (60.0 1.0 0.65)))");
  assert.deepEqual(sides(drawn("cinderella").segs).length, 4);
  run("(ask cinderella gradually change look to (look: shape star angle 144 center-offset (right 18)) at medium speed)");
  const first = sides(drawn("cinderella").segs);
  assert.equal(first.length, 8, `the square twice: ${first.join(" ")}`);
  assert.deepEqual(first.slice(0, 4), first.slice(4));
  // in between, a figure that is neither
  for (let k = 0; k < 10; k++) tick();
  assert.equal(run("(ask cinderella recall your draw-procedure)"), "DRAW-LOOK");
  assert.ok(Number(run("(ask cinderella recall your look-amount)")) > 0.4);
  for (let k = 0; k < 15; k++) tick();
  assert.equal(run("(list (ask cinderella recall your shape) (ask cinderella recall your angle) (ask cinderella recall your center-offset) (ask cinderella recall your draw-procedure))"), "(STAR 144 (RIGHT 18) DRAW-POLY)");
  assert.equal(sides(drawn("cinderella").segs).length, 5);
  // a change with too many moves is made at once: a circle's 72 sides against a star's five
  assert.equal(run("(look-morph 5 144)"), "NIL");
  run("(ask cinderella gradually change look to (look: shape circle angle 5 center-offset nil) at medium speed)");
  assert.equal(run("(list (ask cinderella recall your shape) (ask cinderella recall your angle))"), "(CIRCLE 5)");
});

test("the recorder keeps each character's color, and how far a change of shape has come", () => {
  const { L, run, tick } = director();
  run("(ask cinderella take look (look: shape square angle 90 center-offset nil ani-size 0.05 look-color (60.0 1.0 0.65)))");
  const film = recorder(L, { looks: true, cast: ["cinderella"] });
  run("(click)");
  run("(ask cinderella gradually change look to (look: shape star angle 144 center-offset (right 18)) at high speed)");
  run("(click)");
  tick();
  run("(click)");
  assert.deepEqual(film.looks[0], [0, "cinderella", { shape: "square", angle: 90, centerOffset: null, aniSize: 0.05, color: [60, 1, 0.65] }]);
  assert.deepEqual(film.looks[1][2].morph, { to: "star", amount: 0 });
  assert.ok(film.looks[2][2].morph.amount > 0);
  assert.equal(film.looks[2][2].centerOffset.startsWith("(right "), true);
});

test("pass 2 of Kept Apart with APPEAR plans joy's look changes beside Ken's, and the glass box lists them", () => {
  const fs = makeProjectFileSystem();
  fs.addFile("KEN", "CP", "30", { text: readFileSync("reports/ext/appear/ken-cp.30", "utf8"), origin: "test" });
  for (const f of readdirSync("reports/pass2")) {
    const m = /^ken1-([a-z0-9]+)\.posit$/.exec(f);
    if (m) fs.addFile("KEN1", m[1].toUpperCase(), "POSIT", { text: readFileSync(`reports/pass2/${f}`, "utf8"), origin: "reports/pass2" });
  }
  const { glass } = pass2(fs, "kept-apart", { extensions: ["appear"] });
  assert.deepEqual(glass.lookChanges.map((c) => [c.character, c.element, c.amount, c.speed, c.feeling, c.subscene]), [
    ["step-mother", "color-intensity", "(positive medium)", "medium", "(joy (positive medium))", "(subscene-of kept-apart 3)"],
    ["cinderella", "color-intensity", "(negative high)", "high", "(joy (negative high))", "(subscene-of kept-apart 3)"],
  ]);
  assert.equal(glass.lookChanges[1].change, "(gradually change look by 0.66666667 factor for color-intensity at high speed)");
  const program = fs.textOf(fs.find({ dir: "KEN", fn1: "KEPT", fn2: "APART" }));
  assert.match(program, /\(SET YOUR \(CHANGES-FOR CINDERELLA\) TO \(\(GRADUALLY CHANGE LOOK BY 0\.66666667 FACTOR FOR COLOR-INTENSITY AT HIGH SPEED\) \(GRADUALLY CHANGE BY 0\.66666667 FACTOR FOR ACTIVITY-LEVEL AT HIGH SPEED\)/);
  // its estimate is that of joy's change of speed, so its task takes as long as in 1978
  const task = glass.tasks.find((t) => t.name === "establish-task-7");
  assert.equal(task.variables["running-time"], "13.862944");
});
