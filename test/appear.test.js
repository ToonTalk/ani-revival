// REVIVE;APPEAR, APSUG, SHAPES and LOOKS: Ani chooses how her characters look
// (reports/chapter-x/PLAN.md, "Items 1 and 2: appearances"). That Ken's 102 choices
// stay CP 29's with APPEAR on, that pass 2 plans each scene as in 1978 but for the
// looks, and what the whole film makes, are tools/check-ext.mjs's (npm run test:ext,
// minutes); that no piece of the revival's knowledge gives back Ken's 1978 looks is
// tools/check-appear.mjs's, whose first part runs here. These check, quickly: that
// each hook fires once, the knowledge, the shape experts, telling characters apart,
// the sizes, and Director taking a look.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot, pass1, recorder, storyPlan, EXTENSIONS, APPEARANCE_ELEMENTS, isAppearanceChoice } from "../src/pipeline.js";
import { UNIT_BIT } from "../src/tv/turtle.js";
import { gatherWorld, checkAlone, checkPairs, checkCombinations } from "../tools/check-appear.mjs";
import { choicesOfItsFile } from "../tools/choices.mjs";

function lisp(extensions = ["appear"]) {
  const L = boot(makeProjectFileSystem(), { extensions });
  const run = (src) => L.print(L.evalString(src));
  return { L, run };
}
const wraps = (run, f) => run(`(mapcar 'car (get '${f} 'revival-wraps))`);

// A Lisp with APPEAR set up as pass 1 is before (z): CINDY loaded (DATEST's init),
// and the files (z) loads, ELEMNT, CSUMRY and SUGREL; and RUN and DICHAR, of pass 2.
let shared = null;
function setUp() {
  if (shared) return shared;
  const { L, run } = lisp();
  run("(cs)"); // the TV, which DICHAR's characters are drawn on, as pass 2 has it
  run("(load '|ken;datest >|)");
  run("(init nil)");
  for (const f of ["elemnt", "csumry", "sugrel", "postpo", "chocho", "nodes", "run", "dichar"]) run(`(load '|ken;${f} >|)`);
  shared = { L, run };
  return shared;
}

const ONCE = ["appear-elements", "shape-experts", "appear-choice-point", "appear-choice-point-sources", "apsug-descriptors", "apsug-relationships", "apsug-comparisons", "apsug-film-levels", "looks-take-look"];
const WRAPPED = { "save-answers": "(APPEAR)", "save-all": "(APPEAR)", "collect-relationship-and-comparison-suggestions": "(APSUG)", "gather-suggestions-of-type": "(APSUG)", "source-type": "(APSUG)" };

test("the registry: APPEAR changes Ken's Cinderella, chooses after (z), records looks; its elements are REVIVE;APPEAR's", () => {
  const e = EXTENSIONS.find((x) => x.id === "appear");
  assert.equal(e.changes1978, true);
  assert.equal(e.afterPass1, "(choose-appearances)");
  assert.deepEqual(e.recorder, { looks: true });
  assert.deepEqual(e.files, ["wrap", "appear", "apsug", "shapes", "looks"]);
  const { run } = setUp();
  assert.equal(run("(reverse (ask appearance-element recall your offspring))"), `(${APPEARANCE_ELEMENTS.join(" ").toUpperCase()})`);
  assert.ok(isAppearanceChoice("(choice-point-of cinderella size)"));
  assert.ok(isAppearanceChoice("(relative-choice-point-of (step-mother cinderella) relative-shape-jaggedness)"));
  assert.ok(!isAppearanceChoice("(choice-point-of cinderella speed)"));
  assert.ok(!isAppearanceChoice("(relative-choice-point-of (step-mother cinderella) relative-path-jaggedness)"));
});

test("each hook fires once, though the REVIVE files are loaded again", () => {
  const { run } = setUp();
  const state = () => ({
    once: ONCE.map((id) => run(`(get '${id} 'revival-done)`)),
    wraps: Object.keys(WRAPPED).map((f) => wraps(run, f)),
    shy: run("(length (get 'shy 'appearance-evidence))"),
    shySize: run("(length (ask shy collect items memorized matching (suggestion: element size %)))"),
    dominates: run("(length (ask dominates recall your (suggestion: if-recalling-items)))"),
    unique: run("(length (ask uniqueness-summary: recall your (suggestion: if-recalling-items)))"),
  });
  const first = state();
  assert.deepEqual(first.once, ONCE.map(() => "T"));
  assert.deepEqual(first.wraps, Object.values(WRAPPED));
  assert.equal(first.shy, "2"); // size and shape-complexity
  assert.equal(first.shySize, "1");
  // every hook given again fires at once, its file being loaded; nothing is done twice
  for (const f of ["appear", "apsug", "shapes", "looks"]) run(`(load '|revive;${f} >|)`);
  assert.deepEqual(state(), first);
});

test("in 1978 mode none of this is there", () => {
  const { run } = lisp([]);
  assert.equal(run("(exists? 'appearance-choice-point)"), "NIL");
  run("(load '|ken;choose >|)");
  run("(load '|ken;datest >|)");
  assert.equal(wraps(run, "source-type"), "NIL");
  assert.equal(wraps(run, "save-answers"), "NIL");
  assert.equal(run("(get 'shy 'appearance-evidence)"), "NIL");
});

test("the knowledge: each entry is taught as Ken's process suggestions takes it, with its evidence", () => {
  const { run, L } = setUp();
  const entries = L.toArray(L.evalString(":appearance-knowledge"));
  assert.ok(entries.length >= 8);
  for (const entry of entries) {
    const [descriptor, element, value, strength, evidence] = L.toArray(entry).map((x) => L.print(x));
    assert.match(evidence, /^\((THESIS \d+|CODE |WHY )/, `${descriptor}'s ${element} has its evidence`);
    assert.equal(run(`(ask ${descriptor} collect items memorized matching (suggestion: element ${element} value ? strength ? source ?))`),
      `((SUGGESTION: ELEMENT ${element} VALUE ${value} STRENGTH ${strength} SOURCE ${descriptor}))`);
  }
  // the reviews' corrections: no strong pointed, no evil red; strong large is Ken's,
  // from p. 238 (his decision of 11 October), and with friendly's smooth (p. 161) the
  // only entries that are the thesis's own; shabby's ragged outline is the revival's,
  // motivated by p. 166
  const text = entries.map((e) => L.print(e)).join(" ");
  assert.match(text, /\(STRONG SIZE HIGH MEDIUM \(THESIS 238 \|The atypical size and shape for the friendly character might be chosen because the character is supposed to be a strong friendly ally\|\)\)/);
  assert.doesNotMatch(text, /\(STRONG SHAPE-JAGGEDNESS/);
  assert.doesNotMatch(text, /\(EVIL /);
  assert.deepEqual(text.match(/\(THESIS \d+/g), ["(THESIS 238", "(THESIS 161"]);
  assert.match(text, /\(SHABBY SHAPE-JAGGEDNESS HIGH LOW \(WHY \|.*motivated by p\. 166/);
  // dominates suggests a greater relative size, as its comment says (relate.22:63)
  assert.equal(run("(ask dominates collect items memorized matching (suggestion: element (relative-size step-mother cinderella) value ? strength ? source ?))"),
    "((SUGGESTION: ELEMENT (RELATIVE-SIZE STEP-MOTHER CINDERELLA) VALUE GREATER-THAN STRENGTH MEDIUM SOURCE DOMINATES))");
  // a physically unique character is told to look different (p. 94)
  assert.equal(run("(ask uniqueness-summary: collect items memorized matching (suggestion: element (relative-shape-complexity cinderella prince) value ? strength ? source (uniqueness-summary: uniqueness-level high descriptor-type physical of-who cinderella)))"),
    "((SUGGESTION: ELEMENT (RELATIVE-SHAPE-COMPLEXITY CINDERELLA PRINCE) VALUE DIFFERENT-FROM STRENGTH HIGH SOURCE (UNIQUENESS-SUMMARY: UNIQUENESS-LEVEL HIGH DESCRIPTOR-TYPE PHYSICAL OF-WHO CINDERELLA)))");
  // the film's levels: flashiness suggests a size, as Ken's comment has it (glosug.41:39)
  run("(ask appearance-choice-point if new make (choice-point-of cinderella size))");
  assert.equal(run("(ask (flashiness level) yield suggestions for (choice-point-of cinderella size))"),
    "(SUGGESTION: ELEMENT SIZE VALUE LOW STRENGTH MEDIUM SOURCE (FLASHINESS LEVEL))");
  // and for a movement element, Ken's own suggestion, as in 1978 (glosug.41:30-38)
  assert.equal(run("(ask (flashiness level) yield suggestions for (choice-point-of cinderella speed))"),
    "(SUGGESTION: ELEMENT SPEED VALUE LOW STRENGTH MEDIUM SOURCE (FLASHINESS LEVEL))");
});

test("check-appear: no piece of the revival's knowledge gives back Ken's 1978 looks; one that would is caught", () => {
  const { L } = setUp();
  const world = gatherWorld(L);
  const cp29 = choicesOfItsFile("original/7005017/cp.29");
  const found = checkAlone(world, cp29);
  assert.deepEqual(found.filter((f) => f.revivals), []);
  // Ken's own knowledge that agrees with his drawing is listed, not failed
  assert.deepEqual(found.map((f) => `${f.knowledge.source} ${f.knowledge.element}`).sort(), ["dominates relative-size"]);
  // his .05 is his medium (p. 17): a piece that makes the stepmother large and the
  // fairy godmother and the Prince large too doesn't give back his looks wherever it
  // reaches, but where it gives the stepmother his large size it is flagged, pair by pair
  const strongLarge = { kind: "descriptor", source: "strong", element: "size", value: "high", strength: "medium", evidence: { why: "test" } };
  assert.deepEqual(checkAlone({ ...world, knowledge: [strongLarge] }, cp29), []);
  assert.deepEqual(checkPairs({ ...world, knowledge: [strongLarge] }, cp29).map((p) => [p.character, p.value, p.apart]), [["step-mother", "high", true]]);
  // two of the revival's that together give the stepmother Ken's square are flagged
  const combos = checkCombinations(world, cp29);
  assert.deepEqual(combos.map((c) => [c.character, c.shape, c.parts.map((p) => p.knowledge.source).join(" + ")]), [["step-mother", "square", "path-jaggedness + speed"]]);
  // the kind of entry the rule forbids
  const dominatesLarger = { kind: "relationship", source: "dominates", element: "relative-size", value: "greater-than", strength: "medium", evidence: { why: "test" } };
  const squareish = { kind: "descriptor", source: "mean", element: "shape-jaggedness", value: "medium", strength: "medium", evidence: { why: "test" } };
  const caught = checkAlone({ ...world, knowledge: [dominatesLarger, squareish] }, cp29);
  assert.deepEqual(caught.map((f) => [f.knowledge.source, f.revivals]), [["dominates", true], ["mean", true]]);
});

// Constraints as REVIVE;SHAPES makes them, for (element value justification).
const constraints = (...cs) => `'(${cs.map(([e, v, j = 5]) => `(constraint: element ${e} value ${v} justification ${j} choice-point nil)`).join(" ")})`;
const offered = (run, ...cs) => run(`(mapcar (function (lambda (o) (get (second o) 'name))) (shapes-offered ${constraints(...cs)}))`);

test("the shape experts: each of the nine pairs of values has its shape; (not high) still allows the ten-pointed star", () => {
  const { run } = setUp();
  assert.equal(offered(run, ["shape-jaggedness", "high"], ["shape-complexity", "low"]), "(TRIANGLE)");
  const table = { low: ["CIRCLE", "HEXAGON", "OCTAGON"], medium: ["SQUARE", "PENTAGON", "TEN-POINTED-STAR"], high: ["TRIANGLE", "STAR", "EIGHT-POINTED-STAR"] };
  for (const [j, row] of Object.entries(table)) ["low", "medium", "high"].forEach((c, k) => assert.equal(offered(run, ["shape-jaggedness", j], ["shape-complexity", c]), `(${row[k]})`, `${j} ${c}`));
  assert.equal(offered(run, ["shape-jaggedness", "(not high)"], ["shape-complexity", "high"]), "(OCTAGON TEN-POINTED-STAR)");
  assert.equal(offered(run, ["shape-complexity", "high"]), "(OCTAGON EIGHT-POINTED-STAR TEN-POINTED-STAR)");
});

// Two characters of the test's own, with shape choices made as record-choice makes
// them: each value chosen and the suggestion it came from.
function twoCharacters(run) {
  for (const [who, jag, cx] of [["t-dum", "medium", "low"], ["t-dee", "medium", "low"]]) {
    run(`(define ${who} something)`);
    for (const [e, v, strength, source] of [["shape-jaggedness", jag, "medium", "friendly"], ["shape-complexity", cx, "low", "shy"]]) {
      run(`(ask appearance-choice-point if new make (choice-point-of ${who} ${e}))`);
      run(`(ask (choice-point-of ${who} ${e}) memorize (suggestion: element ${e} value ${v} strength ${strength} source ${source}))`);
      run(`(ask (choice-point-of ${who} ${e}) set your current-choice to ${v})`);
    }
  }
}

test("the shape experts: when no shape fits, the least justified constraint is relaxed, and its choice point says the drawn shape overrode it", () => {
  const { run } = setUp();
  twoCharacters(run);
  const shapes = run("(ask polygon-expert recall your shapes)");
  run("(ask polygon-expert set your shapes to nil)"); // so no expert knows a square
  try {
    assert.equal(run("(get (draw-character 't-dum nil t t) 'name)"), "TEN-POINTED-STAR");
  } finally {
    run(`(ask polygon-expert set your shapes to ${shapes})`);
  }
  assert.equal(run("(ask (appearance-of t-dum) collect items memorized matching (relaxed: %))"), "((RELAXED: ELEMENT SHAPE-COMPLEXITY VALUE LOW JUSTIFICATION 3 BECAUSE NO-SHAPE-FITS))");
  assert.equal(run("(ask (choice-point-of t-dum shape-complexity) collect items memorized matching (overridden-by: %))"), "((OVERRIDDEN-BY: SHAPE-EXPERTS DRAWN TEN-POINTED-STAR BECAUSE NO-SHAPE-FITS))");
  assert.equal(run("(ask (appearance-of t-dum) recall your angle)"), "108");
  // one Ani chose alike after all is drawn as no shape another is already drawn as, and
  // as one that differs from it on both elements: relaxing complexity leaves only
  // squares, pentagons and ten-pointed stars, all as jagged as the square, so jaggedness
  // is relaxed too, and of those left the film's low complexity takes the simplest
  assert.equal(run("(get (draw-character 't-dee '((t-dum square)) t t) 'name)"), "HEXAGON");
  for (const e of ["shape-complexity", "shape-jaggedness"]) {
    assert.equal(run(`(ask (choice-point-of t-dee ${e}) collect items memorized matching (overridden-by: %))`), "((OVERRIDDEN-BY: SHAPE-EXPERTS DRAWN HEXAGON BECAUSE (DRAWN-ALIKE-WITH T-DUM)))");
  }
  assert.equal(run("(length (ask (appearance-of t-dee) collect items memorized matching (relaxed: %)))"), "2");
  // the value drawn, beside the value chosen, for the glass box
  assert.equal(run("(list (drawn-value 't-dee 'shape-jaggedness) (drawn-value 't-dee 'shape-complexity))"), "(LOW MEDIUM)");
});

test("sizes: APPEAR's own numbers, never weightify's; (not X) one of the two values left, picked by the film's variety, none medium, each with a note", () => {
  const { run } = setUp();
  const size = (who, value) => {
    run(`(ask appearance-choice-point if new make (choice-point-of ${who} size))`);
    run(`(ask (choice-point-of ${who} size) set your current-choice to ${value})`);
    return run(`(appearance-number '(choice-point-of ${who} size))`);
  };
  assert.equal(size("t-small", "low"), "0.036");
  assert.equal(size("t-large", "high"), "0.07");
  // (not high): of medium and low, neither chosen yet, medium variety takes the middle
  // of the two (glosug.41:71-72), low, as REVIVE;MEND1 narrows a movement element's
  assert.equal(size("t-not-high", "(not high)"), "0.036");
  assert.equal(run("(ask (choice-point-of t-not-high size) collect items memorized matching (revival-repair: %))"),
    "((REVIVAL-REPAIR: WHAT READ-AS-NUMBER WAS (NOT HIGH) NOW 0.036 BECAUSE (NARROWED-TO LOW (VARIETY LEVEL) MEDIUM (COUNTS (0 MEDIUM) (0 LOW)) (MIDDLE-ELEMENT KEN1 RECONSTRUCTION))))");
  // low now counts as chosen, so of high and low, (not medium) takes the less used, high
  assert.equal(size("t-not-medium", "(not medium)"), "0.07");
  assert.match(run("(ask (choice-point-of t-not-medium size) collect items memorized matching (revival-repair: %))"), /NARROWED-TO HIGH \(VARIETY LEVEL\) MEDIUM \(COUNTS \(0 HIGH\) \(1 LOW\)\)/);
  // the choice point keeps Ani's (not X), as the CP does
  assert.equal(run("(ask (choice-point-of t-not-high size) recall your current-choice)"), "(NOT HIGH)");
  assert.equal(size("t-none", "none"), "0.05");
  assert.match(run("(ask (choice-point-of t-none size) collect items memorized matching (revival-repair: %))"), /READ-AS-NUMBER WAS NONE NOW 0\.05/);
});

test("telling apart: two characters drawn alike have their least justified shape choice made again, with a different-from suggestion", () => {
  const fs = makeProjectFileSystem();
  fs.addFile("KEN", "CINDY", "47", { text: readFileSync("test/stories/appear-alike.lisp", "utf8"), origin: "test" });
  const p1 = pass1(fs, { extensions: ["appear"] });
  const looks = Object.fromEntries(p1.appearances.characters.map((c) => [c.character, c]));
  // both would be hexagons; Dum's complexity, the least justified, is chosen again
  assert.deepEqual(p1.appearances.findings, [{ comparison: "(comparison-of dum dee)", items: ["(look-alike: shape hexagon of-who (comparison-of dum dee))"] }]);
  const cp = (name) => p1.choicePoints.find((c) => JSON.stringify(c.name) === JSON.stringify(name));
  const dum = cp(["choice-point-of", "dum", "shape-complexity"]);
  assert.deepEqual(dum.previousChoices, ["medium"]);
  assert.ok(dum.memory.some((m) => m[0] === "redetermined:" && m[2] === "dee"));
  // the relative choice point got the different-from, from the look-alike: finding
  const relative = cp(["relative-choice-point-of", ["dum", "dee"], "relative-shape-complexity"]);
  assert.equal(relative.currentChoice, "different-from");
  assert.ok(JSON.stringify(relative.memory).includes('["look-alike:","shape","hexagon"'));
  // what the choice points say is what is drawn
  assert.equal(dum.currentChoice, "low");
  assert.equal(looks.dum.look.shape, "circle");
  assert.equal(looks.dee.look.shape, "hexagon");
  assert.equal(looks.dee.elements["shape-complexity"].value, "medium");
  assert.ok(!JSON.stringify(p1.choicePoints).includes("overridden-by:"));
  for (const c of Object.values(looks)) for (const x of Object.values(c.elements)) assert.equal(x.drawn, x.value);
});

test("Director takes a look: the shape and the size it draws change", () => {
  const { L, run } = lisp();
  run("(cs)");
  run("(load '|ken;aninit >|)");
  run("(tvsize 550 413)");
  // the segments one display of a character draws, and their extent in TV dots
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
    return { count: segs.length, span: Math.max(...xs) - Math.min(...xs) };
  };
  run("(ask cinderella set your position to (0.0 0.0))");
  run("(ask cinderella show)");
  const star = drawn("cinderella");
  assert.equal(star.count, 5); // Ken's star (aninit.65:37-39)
  assert.equal(run("(ask cinderella take look (look: shape circle angle 5 center-offset nil ani-size 0.036))"), "(LOOK: SHAPE CIRCLE ANGLE 5 CENTER-OFFSET NIL ANI-SIZE 0.036)");
  const circle = drawn("cinderella");
  assert.equal(circle.count, 72); // draw-poly turning 5 degrees
  assert.equal(run("(ask cinderella recall your shape)"), "CIRCLE");
  assert.equal(Number(run("(ask cinderella recall your ani-size)")), 0.036);
  // its size is ani-size times the screen's (dichar.103:13-14), and what is drawn follows it
  run("(ask cinderella take look (look: shape circle angle 5 center-offset nil ani-size 0.072))");
  const twice = drawn("cinderella");
  assert.ok(Math.abs(twice.span / circle.span - 2) < 0.05, `${twice.span} is twice ${circle.span}`);
  run("(ask step-mother set your position to (100.0 0.0))");
  run("(ask step-mother show)");
  assert.equal(drawn("step-mother").count, 4); // Ken's square
  run("(ask step-mother take look (look: shape triangle angle 120 center-offset (right 30) ani-size 0.07))");
  assert.equal(drawn("step-mother").count, 3);
  // the recorder keeps who looks how from which frame, changes only
  const film = recorder(L, { looks: true, cast: ["cinderella", "step-mother"] });
  run("(click)");
  run("(ask cinderella take look (look: shape hexagon angle 60 center-offset nil ani-size 0.05))");
  run("(click)");
  run("(click)");
  assert.equal(film.frames.length, 3);
  assert.deepEqual(film.looks, [
    [0, "cinderella", { shape: "circle", angle: 5, centerOffset: null, aniSize: 0.072 }],
    [0, "step-mother", { shape: "triangle", angle: 120, centerOffset: "(right 30)", aniSize: 0.07 }],
    [1, "cinderella", { shape: "hexagon", angle: 60, centerOffset: null, aniSize: 0.05 }],
  ]);
  assert.deepEqual(Object.keys(film.frames[0].chars.cinderella), ["state", "visible", "dynamics", "goal"]); // frames[].chars as without
});

test("a cast larger than SHAPES' six: with Ani choosing the looks, those beyond start as a hexagon her look then replaces", () => {
  const outline = { scenes: ["one"], characters: ["a", "b", "c", "d", "e", "f", "g"], fromScenes: { one: [] } };
  assert.throws(() => storyPlan(outline), /at most 6 characters/);
  const plan = storyPlan(outline, { looks: true });
  assert.deepEqual(plan.cast.map((c) => c.shape), ["star", "square", "triangle", "circle", "pentagon", "hexagon", "hexagon"]);
  assert.equal(plan.cast[6].lisp, "(set your angle to 60)");
});
