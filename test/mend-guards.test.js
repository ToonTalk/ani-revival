// MEND's guards (src/director/revive/mend3.lisp, mend4.lisp): M3 skips a word Ani
// doesn't know and names it; M4 answers "don't know" about a relationship the story
// doesn't give. Cinderella needs neither, so tools/check-1978.mjs can't notice them
// missing; these check that each wrapper is installed once its file of Ken's has
// loaded, and what it does in a small case, against what Ken's code does without it.
// The stress stories test/stories/stress/unknown-word.lisp and missing-relationships.lisp
// are the whole case (node tools/run-story.mjs <story> --extensions mend).
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot } from "../src/pipeline.js";

// A stand-in for a story's KEN;CINDY: the goat, the kid and the troll, with a common
// parent so that each has the others as siblings (the troll first, as the last
// defined); the goat loves the kid, and nothing relates the goat and the troll, as in
// test/stories/stress/missing-relationships.lisp. calm is a word with one convey
// suggestion for the goat. mg-task and mg-task2 stand for establish tasks of the
// scene mg-scene, as SCENE sets them up (scene.9:459-466), to note on.
const STORY = `
(define mg-folk something)
(define goat mg-folk)
(define kid mg-folk)
(define troll mg-folk)
(define (relationship-of goat kid) something)
(ask (relationship-of goat kid) memorize
     (description: type relationship descriptor loves source initial-description))
(define calm something)
(ask calm memorize
     (suggestion: element (establish goat calm)
		  value (method: type convey value (accompanys goat kid))
		  strength high
		  source calm))
(define mg-scene something)
(define mg-task something)
(define mg-task2 something)
(ask mg-scene set your establish-tasks to (mg-task mg-task2))
(ask mg-task set your task to (task: description (personality goat) for-who goat source initial-description))
(ask mg-task set your scene to mg-scene)
(ask mg-task2 set your task to (task: description (personality goat) for-who goat source initial-description))
(ask mg-task2 set your scene to mg-scene)
`;

function withStory(extensions) {
  const fs = makeProjectFileSystem();
  fs.addFile("KEN", "CINDY", "47", { text: STORY, origin: "test" });
  const L = boot(fs, { extensions });
  const run = (src) => L.print(L.evalString(src));
  run("(load '|ken;cindy >|)");
  return { L, run };
}

// The ids of the wrappers round a function, outermost first (REVIVE;WRAP).
const wraps = (run, f) => run(`(mapcar 'car (get '${f} 'revival-wraps))`).replace(/[()]/g, "").split(" ").filter((x) => x && x !== "NIL");

// An actor's repair notes (REVIVE;WRAP's revival-note).
const NOTES = "memorized matching (revival-repair: what ? was ? now ? because ?)";

test("M3 and M4 wrap Ken's functions once their files load, and once only", () => {
  const { run } = withStory(["mend"]);
  for (const f of ["establish-personality-suggestions", "character-that-satisfies", "meet-description-of", "choose-methods-for-task"]) {
    assert.deepEqual(wraps(run, f), [], `${f}: nothing wrapped before its file loads`);
  }
  run("(load '|ken;sugest >|)");
  run("(load '|ken;prereq >|)");
  run("(load '|ken;chomet >|)");
  // the hooks fire again when MEND's files are loaded again; nothing is wrapped twice
  run("(load '|revive;mend3 >|)");
  run("(load '|revive;mend4 >|)");
  const once = (f, id) => assert.equal(wraps(run, f).filter((x) => x === id).length, 1, `${f} wrapped by ${id}, once`);
  once("establish-personality-suggestions", "MEND3");
  once("character-that-satisfies", "MEND4");
  once("meet-description-of", "MEND4");
  once("choose-methods-for-task", "MEND4");
  // and the task at hand is bound only while a wrapper runs
  assert.equal(run(":task-at-hand"), "NIL");
});

test("without MEND, Ken's functions are as he wrote them", () => {
  const { run } = withStory([]);
  run("(load '|ken;sugest >|)");
  run("(load '|ken;prereq >|)");
  run("(load '|ken;chomet >|)");
  for (const f of ["establish-personality-suggestions", "character-that-satisfies", "meet-description-of", "choose-methods-for-task"]) {
    assert.deepEqual(wraps(run, f), [], f);
  }
});

const DESCRIPTIONS = (...words) => `'(${words.map((w) => `(description: type personality descriptor ${w} source initial-description)`).join(" ")})`;

test("M3: a word Ani doesn't know is skipped and named on the task; Ken's code stops on it", () => {
  const ken = withStory([]);
  ken.run("(load '|ken;sugest >|)");
  assert.throws(() => ken.run(`(establish-personality-suggestions ${DESCRIPTIONS("grumpy", "calm")} 'mg-task 'goat)`), /break NO-SUCH-ACTOR/);

  const { run } = withStory(["mend"]);
  run("(load '|ken;sugest >|)");
  run(`(establish-personality-suggestions ${DESCRIPTIONS("grumpy", "calm")} 'mg-task 'goat)`);
  // calm's suggestion went on to be related (sugest.123:91-92, 192-210), and grumpy is named
  assert.equal(
    run("(ask mg-task collect items)"),
    "((RELATED-SUGGESTIONS: MAIN-SUGGESTION (SUGGESTION: ELEMENT (ESTABLISH GOAT CALM) VALUE (METHOD: TYPE CONVEY VALUE (ACCOMPANYS GOAT KID)) STRENGTH HIGH SOURCE CALM) RELATIONSHIP UNIQUE OTHERS NIL) " +
      "(REVIVAL-REPAIR: WHAT UNKNOWN-WORD WAS GRUMPY NOW SKIPPED BECAUSE NO-SUCH-WORD))",
  );
  assert.equal(run(":revival-noted"), "(MG-TASK)");
});

test("M3: a word whose file hasn't loaded yet is known, as the tags say, and asked", () => {
  const { run } = withStory(["mend"]);
  run("(load '|ken;sugest >|)");
  assert.equal(run("(actor-of 'mean dont-autoload)"), "NIL"); // KEN;DSCRP not loaded
  run(`(establish-personality-suggestions ${DESCRIPTIONS("grumpy", "mean")} 'mg-task 'goat)`);
  assert.notEqual(run("(actor-of 'mean dont-autoload)"), "NIL"); // asking mean loaded it
  assert.equal(
    run(`(ask mg-task collect items ${NOTES})`),
    "((REVIVAL-REPAIR: WHAT UNKNOWN-WORD WAS GRUMPY NOW SKIPPED BECAUSE NO-SUCH-WORD))",
  );
});

test("M4: looking for a friend, Ani passes over a sibling with no relationship, with one note; Ken's code stops", () => {
  const ken = withStory([]);
  ken.run("(load '|ken;sugest >|)");
  assert.throws(() => ken.run("(character-that-satisfies '(friend-of goat nil) 'mg-task)"), /break NO-SUCH-ACTOR/);

  const { run } = withStory(["mend"]);
  run("(load '|ken;sugest >|)");
  assert.equal(run("(ask goat recall your siblings)"), "(TROLL KID)");
  assert.equal(run("(ask mg-task recall your scene)"), "MG-SCENE");
  // twice, as friendly's helps and accompanys both look (dscrp.17:109-132): likes asks
  // about the troll four times each (prereq.19:115-118)
  assert.equal(run("(character-that-satisfies '(friend-of goat nil) 'mg-task)"), "KID");
  assert.equal(run("(character-that-satisfies '(friend-of goat nil) 'mg-task)"), "KID");
  assert.equal(
    run("(ask mg-task collect items)"),
    "((REVIVAL-REPAIR: WHAT MISSING-RELATIONSHIP WAS (RELATIONSHIP-OF GOAT TROLL) NOW DONT-KNOW BECAUSE NO-SUCH-RELATIONSHIP))",
  );
  assert.equal(run(":revival-noted"), "(MG-TASK)");
  // likes itself: don't know about the troll, met for the kid, and no task at hand to note on
  assert.equal(run("(ask likes recall an item matching (status-of (likes goat troll) ?status) then status)"), "DONT-KNOW");
  assert.equal(run("(ask likes recall an item matching (status-of (likes goat kid) ?status) then status)"), "MET");
  assert.equal(run(":revival-noted"), "(MG-TASK)");
});

test("M4: likes asked while Ani chooses a task's methods notes on that task", () => {
  const { run } = withStory(["mend"]);
  run("(load '|ken;chomet >|)");
  run("(load '|ken;prereq >|)");
  // Stand-ins, wrapped round CHOMET's choosers inside choose-methods-for-task
  // (chomet.123:200-203): the display chooser scores best-whens (likes goat troll) and
  // (likes goat kid) with Ken's best-when-score (chomet.123:376-387), and neither
  // chooser goes on to Ken's, which need a film.
  run("(defun mg-score-best-whens (suggestions task) (setq mg-score (best-when-score '((likes goat troll) (likes goat kid)))) nil)");
  run("(defun mg-choose-nothing (related-suggestions task) nil)");
  run("(revival-wrap 'choose-a-display-method 'mg-test 'mg-score-best-whens)");
  run("(revival-wrap 'choose-a-few-convey-methods 'mg-test 'mg-choose-nothing)");
  run("(choose-methods-for-task 'mg-task2)");
  assert.equal(run("mg-score"), "1"); // the troll's don't know counts 0, the kid's met 1
  assert.equal(
    run(`(ask mg-task2 collect items ${NOTES})`),
    "((REVIVAL-REPAIR: WHAT MISSING-RELATIONSHIP WAS (RELATIONSHIP-OF GOAT TROLL) NOW DONT-KNOW BECAUSE NO-SUCH-RELATIONSHIP))",
  );
});
