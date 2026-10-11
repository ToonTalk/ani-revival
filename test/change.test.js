// REVIVE;CHANGE: characters who change (reports/chapter-x/PLAN.md, item 3; stage 3).
// That Ken's Cinderella comes out byte for byte with CHANGE on is tools/check-1978.mjs's
// (node tools/check-1978.mjs --extensions change, minutes); the fresh looks and the two
// stories end to end against their goldens are tools/check-change.mjs's (npm run
// test:change, minutes). These check, quickly: the registry and the outline; who takes
// part in a change; the description changed, and changed before study-descriptor-use
// (the ordering guard); holding the others' choices while Ani chooses again; what a
// BECOME file says; and making it so in a later scene's pass 2, with MEND narrowing a
// value pass 2 can't use.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot, EXTENSIONS, extensionsFor, storyOutline, storyPlan, collectBecomes } from "../src/pipeline.js";

const story = (name) => readFileSync(`test/stories/${name}.lisp`, "utf8").replace(/\r\n/g, "\n");
const KEN_CINDY = readFileSync("original/7005017/cindy.46", "latin1");

// A Lisp with the extensions, the film description given as the newest KEN;CINDY.
function lisp(extensions = ["change"], cindy = null) {
  const fs = makeProjectFileSystem();
  if (cindy) fs.addFile("KEN", "CINDY", "47", { text: cindy, origin: "test" });
  const L = boot(fs, { extensions });
  const run = (src) => L.print(L.evalString(src)).toLowerCase();
  return { L, run, fs };
}
// As pass 1 is before (z): DATEST's init, the film description loaded and studied.
function pass1Ready(extensions, cindy) {
  const x = lisp(extensions, cindy);
  x.run("(load '|ken;datest >|)");
  x.run("(init nil)");
  return x;
}
const wraps = (run, f) => run(`(mapcar 'car (get '${f} 'revival-wraps))`);
const tasksOf = (run, scene) => run(`(mapcar (function (lambda (x) (ask ,x recall your task))) (ask ${scene} recall your tasks))`);

test("the registry: CHANGE leaves Ken's Cinderella alone and has steps of its own for a scene", () => {
  const e = EXTENSIONS.find((x) => x.id === "change");
  assert.deepEqual(e.files, ["wrap", "change"]);
  assert.equal(e.changes1978, false);
  assert.equal(e.sceneSteps, true);
  assert.deepEqual(extensionsFor(["change"]).map((x) => x.id), ["change"]);
});

test("the outline finds each change, its cause and whom it changes; the plan names the BECOME files", () => {
  assert.deepEqual(storyOutline(KEN_CINDY).changes, {}); // cinderella-beautified is commented out
  const heart = storyOutline(story("change-of-heart"));
  assert.deepEqual(heart.changes, {
    "change-of-heart": [{ type: "personality", who: "step-mother", from: ["evil", "mean"], to: ["good", "kind"], cause: "prince", characters: ["step-mother"] }],
  });
  const social = storyOutline(story("socializing"));
  assert.deepEqual(social.changes.learning, [{ type: "personality", who: "cinderella", from: ["shy"], to: ["brazen"], cause: null, characters: ["cinderella"] }]);
  const rel = storyOutline("(define s scene (process initial description (convey (change (relationship (relationship-of a b) hates) (relationship (relationship-of a b) is-polite-to)))))");
  assert.deepEqual(rel.changes.s[0].characters, ["a", "b"]);
  // with change, the scene that changes someone writes a BECOME file and the later ones learn from it
  const plan = storyPlan(heart, { change: true });
  assert.deepEqual(plan.scenes.map((s) => [s.id, s.become || null, s.becomes]), [["at-home", null, []], ["change-of-heart", "story2", []], ["kind-again", null, ["story2"]]]);
  // without, the plan is as it was
  assert.deepEqual(Object.keys(storyPlan(heart).scenes[1]).sort(), ["file", "id", "mini", "movie", "position"]);
});

test("each hook is installed once, though REVIVE;CHANGE is loaded again; in 1978 mode none is", () => {
  const { run } = pass1Ready(["change"], null);
  run("(load '|ken;choose >|)");
  assert.equal(wraps(run, "process-task-description"), "(change)");
  assert.equal(wraps(run, "record-choice"), "(change)");
  assert.notEqual(run("(actor-of 'description-change dont-autoload)"), "nil");
  run("(load '|revive;change >|)");
  run("(load '|revive;change >|)");
  assert.equal(wraps(run, "process-task-description"), "(change)");
  assert.equal(wraps(run, "record-choice"), "(change)");
  const plain = pass1Ready([], null);
  plain.run("(load '|ken;choose >|)");
  assert.equal(wraps(plain.run, "process-task-description"), "nil");
  assert.equal(wraps(plain.run, "record-choice"), "nil");
  assert.equal(plain.run("(exists? 'description-change)"), "nil");
});

test("Ken's Cinderella: every task and every part in a scene as without CHANGE", () => {
  const parts = (run) => run("(mapcar (function (lambda (c) (ask ,c collect items memorized matching (scene-participation: %)))) (reverse (ask character recall your offspring)))");
  const tasks = (run) => run("(mapcar (function (lambda (s) (list s (mapcar (function (lambda (x) (ask ,x recall your task))) (ask ,s recall your tasks))))) (reverse (ask scene recall your offspring)))");
  const ken = pass1Ready([], null);
  const ours = pass1Ready(["change"], null);
  assert.equal(tasks(ours.run), tasks(ken.run));
  assert.equal(parts(ours.run), parts(ken.run));
});

test("who takes part: a change standing alone is for the changed character, who notes her part", () => {
  // as in 1978, the story stops: Ken's code asks (personality cinderella shy) to note its part
  const ken = lisp([], story("socializing"));
  ken.run("(load '|ken;datest >|)");
  assert.throws(() => ken.run("(init nil)"), /NO-SUCH-ACTOR/);
  const { run } = pass1Ready(["change"], story("socializing"));
  assert.match(tasksOf(run, "learning"), /\(task: description \(change \(personality cinderella shy\) \(personality cinderella brazen\)\) for-who cinderella source initial-description\)/);
  assert.match(run("(ask cinderella collect items memorized matching (scene-participation: scene learning %))"), /\(scene-participation: scene learning task convey-task-\d+\)/);
  // inside (causes prince ...), the task is the Prince's, as Ken's code makes it, and the
  // stepmother notes her part as well
  const heart = pass1Ready(["change"], story("change-of-heart"));
  assert.match(tasksOf(heart.run, "change-of-heart"), /\(task: description \(causes prince \(change .*\)\) for-who prince source initial-description\)/);
  // (her joy's establish task is hers by Ken's code; the change's is noted by CHANGE)
  assert.match(heart.run("(ask step-mother collect items memorized matching (scene-participation: scene change-of-heart %))"), /\(scene-participation: scene change-of-heart task convey-task-\d+\)/);
  assert.match(heart.run("(ask prince collect items memorized matching (scene-participation: scene change-of-heart %))"), /convey-task/);
  assert.equal(heart.run("(changes-in-scene 'change-of-heart)"), "(((change (personality step-mother (and evil mean)) (personality step-mother (and good kind))) prince))");
  assert.equal(heart.run("(characters-changed-in 'change-of-heart)"), "(step-mother)");
  assert.equal(heart.run("(changes-in-scene 'at-home)"), "nil");
});

test("a relationship change changes both of its characters, and both note their part", () => {
  const cindy = KEN_CINDY.replace("(define no-longer-kept-apart scene", `(define making-up scene
	(process initial description
		 (convey (change (relationship (relationship-of step-mother cinderella) hates)
				 (relationship (relationship-of step-mother cinderella) is-polite-to)))))

(define no-longer-kept-apart scene`);
  const { run } = pass1Ready(["change"], cindy);
  assert.equal(run("(characters-changed-in 'making-up)"), "(step-mother cinderella)");
  assert.match(tasksOf(run, "making-up"), /for-who step-mother /);
  for (const c of ["step-mother", "cinderella"]) assert.match(run(`(ask ${c} collect items memorized matching (scene-participation: scene making-up %))`), /convey-task/);
  assert.equal(run("(length (changes-of-character 'cinderella 'making-up))"), "1");
});

test("the ordering guard: the change is made before study-descriptor-use works out how each word is used", () => {
  // what study-descriptor-use (compar.69:127-136) sees of the stepmother, and the usage it
  // records: made after it (after DATEST's init), the usage would be the old words', and
  // the uniqueness summaries with them
  const { run } = lisp(["change"], story("change-of-heart"));
  run("(load '|ken;datest >|)");
  run("(load '|ken;compar >|)");
  run(`(progn (putprop 'study-descriptor-use (get 'study-descriptor-use 'expr) 'test-original)
     (defun study-descriptor-use nil
       (setq test-seen (mapcar (function (lambda (d) (get d 'descriptor)))
                               (ask step-mother collect items memorized matching (description: type personality %))))
       (funcall (get 'study-descriptor-use 'test-original))))`);
  run("(init-as-of 'change-of-heart)");
  assert.deepEqual(run("test-seen").slice(1, -1).split(" ").sort(), ["good", "kind", "selfish", "strong"]);
  assert.equal(run("(ask good recall your usage)"), "(4 out-of 4)");
  assert.equal(run("(ask evil recall your usage)"), "(0 out-of 4)");
  assert.equal(run("(ask mean recall your usage)"), "(0 out-of 4)");
  // the scene before the change: as the film description has her
  const before = lisp(["change"], story("change-of-heart"));
  before.run("(load '|ken;datest >|)");
  before.run("(init-as-of 'at-home)");
  assert.equal(before.run("(ask good recall your usage)"), "(3 out-of 4)");
  assert.equal(before.run("(ask evil recall your usage)"), "(1 out-of 4)");
});

test("the description changed: the old words forgotten with what they told, the new ones described as if she were brand new", () => {
  const { run } = pass1Ready(["change"], null);
  const desc = (who) => run(`(ask ${who} collect items memorized matching (description: %))`);
  run("(make-description-change '(change (physical cinderella (and beautiful shabby)) (physical cinderella elegant)))");
  const c = desc("cinderella");
  assert.doesNotMatch(c, /descriptor (beautiful|shabby|graceful) /); // graceful was told by beautiful
  // an initial description, as CHAR memorizes the story's (Ken's decision 8, 11 October)
  assert.match(c, /\(description: type physical descriptor elegant source initial-description\)/);
  // a new beautiful tells graceful: CHAR's own demon (char.2:13-20)
  run("(make-description-change '(change (physical step-mother ugly) (physical step-mother beautiful)))");
  assert.match(desc("step-mother"), /\(description: type movement descriptor graceful source beautiful\)/);
  // a relationship's new word has the descriptor's own type
  run("(make-description-change '(change (relationship (relationship-of step-mother cinderella) hates) (relationship (relationship-of step-mother cinderella) is-polite-to)))");
  const r = desc("(relationship-of step-mother cinderella)");
  assert.doesNotMatch(r, /hates/);
  assert.match(r, /\(description: type domination descriptor is-polite-to source initial-description\)/);
  assert.match(r, /descriptor dominates source initial-description/);
  assert.equal(run("(characters-changed-by '(change (relationship (relationship-of step-mother cinderella) hates) (relationship (relationship-of step-mother cinderella) is-polite-to)))"), "(step-mother cinderella)");
});

test("holding the others: record-choice records a held choice as it was, and says so; nothing held, Ken's", () => {
  const { run } = pass1Ready(["change"], null);
  run("(load '|ken;choose >|)");
  run("(load '|ken;elemnt >|)");
  run("(ask absolute-choice-point if new make (choice-point-of cinderella speed))");
  run("(ask absolute-choice-point if new make (choice-point-of prince speed))");
  run("(setq :change-held '(((choice-point-of prince speed) high)))");
  run("(ask speed set your (count-for high) to 0)");
  run("(ask speed set your (count-for low) to 0)");
  // the Prince's is held: Ani would choose low, and it is recorded as high
  run("(record-choice '(choice-point-of prince speed) '(suggestion: element (prince speed) value low strength medium source test))");
  assert.equal(run("(ask (choice-point-of prince speed) recall your current-choice)"), "high");
  assert.equal(run("(ask (choice-point-of prince speed) collect items memorized matching (suggestion: %))"),
    "((suggestion: element (prince speed) value high strength medium source (held-as-it-was would-have-chosen low from test)))");
  assert.equal(run(":change-held-against"), "(((choice-point-of prince speed) high low))");
  assert.equal(run("(list (ask speed recall your (count-for high)) (ask speed recall your (count-for low)))"), "(1 0)");
  // Cinderella's is not held: chosen as Ani chooses
  run("(record-choice '(choice-point-of cinderella speed) '(suggestion: element (cinderella speed) value low strength medium source shy))");
  assert.equal(run("(ask (choice-point-of cinderella speed) recall your current-choice)"), "low");
  // a relative choice point held under its other name reads as that name reads it (cpoint.87:100-108)
  run("(setq :change-held '(((relative-choice-point-of (step-mother prince) relative-speed) less-than)))");
  assert.equal(run("(held-value-of '(relative-choice-point-of (prince step-mother) relative-speed))"), "(greater-than)");
  assert.equal(run("(held-value-of '(relative-choice-point-of (step-mother prince) relative-speed))"), "(less-than)");
  // nothing held, as in every other job: Ken's record-choice
  run("(setq :change-held nil)");
  run("(ask absolute-choice-point if new make (choice-point-of step-mother speed))");
  run("(record-choice '(choice-point-of step-mother speed) '(suggestion: element (step-mother speed) value medium strength high source strong))");
  assert.equal(run("(ask (choice-point-of step-mother speed) collect items memorized matching (suggestion: %))"), "((suggestion: element (step-mother speed) value medium strength high source strong))");
});

test("the choices as they were: KEN;CP's, read as save-answers wrote them; the elements put together with append", () => {
  const { run } = pass1Ready(["change"], null);
  assert.equal(run("(length (answers-in-file '((ken) cp 29)))"), "102");
  assert.equal(run("(assoc '(choice-point-of step-mother speed) (answers-in-file '((ken) cp 29)))"), "((choice-point-of step-mother speed) high)");
  run("(load '|ken;elemnt >|)");
  run("(load '|ken;nodes >|)");
  const before = run("(ask normal-movement-element recall your offspring)");
  assert.equal(run("(length (elements-chosen))"), "12");
  assert.equal(run("(length (elements-chosen))"), "12");
  // mapcan would have spliced the attractions onto normal-movement-element's own list
  assert.equal(run("(ask normal-movement-element recall your offspring)"), before);
  assert.equal(run("(length (ask normal-movement-element recall your offspring))"), "9");
  // a choice replaced under either name of a relative choice point
  assert.equal(run("(with-choice '((a 1) ((relative-choice-point-of (x y) e) 2)) '(relative-choice-point-of (y x) e) 3)"), "(((relative-choice-point-of (y x) e) 3) (a 1))");
});

// A BECOME file as a fresh look writes one: the stepmother repents, with a (not high)
// for her speed, which pass 2 can't weigh.
const BECOME = `(DEFINE (CHANGE-OF STEP-MOTHER IN CHANGE-OF-HEART) DESCRIPTION-CHANGE
 (SET YOUR CHANGES TO ((CHANGE (PERSONALITY STEP-MOTHER (AND EVIL MEAN)) (PERSONALITY STEP-MOTHER (AND GOOD KIND)))))
 (SET YOUR CAUSES TO (PRINCE))
 (SET YOUR OLD-VALUES TO ((PATH-CURVATURE LOW) (SPEED HIGH) (ACCELERATION HIGH)))
 (SET YOUR NEW-VALUES TO ((PATH-CURVATURE HIGH) (SPEED (NOT HIGH)) (ACCELERATION HIGH)))
 (SET YOUR RELATIVE-VALUES TO NIL))
`;

test("who they have become: a later scene's pass 2 makes the change so, and MEND narrows what it can't use", () => {
  const { run, L, fs } = lisp(["mend", "change"], story("change-of-heart"));
  fs.addFile("KEN1", "STORY2", "BECOME", { text: BECOME, origin: "test" });
  fs.addFile("KEN", "CP", "30", { text: readFileSync("original/7005017/cp.29", "latin1"), origin: "test" });
  // as RUN starts a scene: CINDY and the CP loaded (run.65:42-45), then to-do-before-running
  run("(load '|ken;run >|)");
  run("(director-load 'cindy '(to reset kind-again))");
  run("(director-load 'cp)");
  run("(setq :choice-points-loaded t)");
  run("(learn-who-they-have-become '(((ken1) story2 become)))");
  const desc = run("(ask step-mother collect items memorized matching (description: type personality %))");
  assert.doesNotMatch(desc, /evil|mean/);
  assert.match(desc, /descriptor good source initial-description/);
  assert.match(desc, /descriptor kind source initial-description/);
  assert.equal(run("(ask (choice-point-of step-mother path-curvature) recall your current-choice)"), "high");
  assert.equal(run("(ask (choice-point-of step-mother path-curvature) collect items memorized matching (changed-in: %))"),
    "((changed-in: change-of-heart was low by (change-of step-mother in change-of-heart)))");
  // acceleration was as it is: nothing to make so
  assert.equal(run("(ask (choice-point-of step-mother acceleration) collect items memorized matching (changed-in: %))"), "nil");
  // (not high) narrowed by REVIVE;MEND1, which notes it
  assert.match(run("(ask (choice-point-of step-mother speed) recall your current-choice)"), /^(low|medium)$/);
  assert.match(run("(ask (choice-point-of step-mother speed) collect items memorized matching (revival-repair: %))"), /what narrowed was \(not high\)/);
  // what the glass box shows
  const becomes = collectBecomes(L);
  assert.equal(becomes.length, 1);
  assert.equal(becomes[0].actor, "(change-of step-mother in change-of-heart)");
  assert.deepEqual(becomes[0].causes, ["prince"]);
  assert.deepEqual(becomes[0].madeSo.map((m) => m.element), ["path-curvature", "speed"]);
  assert.deepEqual(becomes[0].madeSo[0], { element: "path-curvature", was: "low", now: "high" });
});

test("the glass box has no becomes unless CHANGE is loaded and made something so", () => {
  const ken = lisp([], null);
  assert.deepEqual(collectBecomes(ken.L), []);
  assert.ok(!ken.L.obarray.find("CHANGES-OF-EARLIER-SCENES"));
  const ours = lisp(["change"], null);
  ours.run("(load '|ken;char >|)");
  assert.deepEqual(collectBecomes(ours.L), []);
});
