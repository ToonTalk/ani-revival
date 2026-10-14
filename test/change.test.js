// REVIVE;CHANGE: characters who change (reports/chapter-x/PLAN.md, item 3; stages 3 and 6).
// That Ken's Cinderella comes out byte for byte with CHANGE on is tools/check-1978.mjs's
// (node tools/check-1978.mjs --extensions change, minutes); the fresh looks and the two
// stories end to end against their goldens are tools/check-change.mjs's (npm run
// test:change, minutes). These check, quickly: the registry and the outline; who takes
// part in a change; the description changed, and changed before study-descriptor-use
// (the ordering guard); holding the others' choices while Ani chooses again; what a
// BECOME file says; and making it so in a later scene's pass 2, with MEND narrowing a
// value pass 2 can't use. And stage 6, REVIVE;CHSHOW: the change and causes verbs' ways
// of showing a change and its bridges, the rate, the element types' Director forms, and
// Director's bridge over seconds; with APPEAR, a look's bridge and a look made so.
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

test("the registry: CHANGE leaves Ken's Cinderella alone and has steps of its own for a scene; it needs MEND", () => {
  const e = EXTENSIONS.find((x) => x.id === "change");
  assert.deepEqual(e.files, ["wrap", "change", "chshow"]);
  assert.equal(e.changes1978, false);
  assert.equal(e.sceneSteps, true);
  // a change is shown by MEND9's wander and MEND6's bring-on (REVIVE;CHSHOW)
  assert.deepEqual(e.requires, ["mend"]);
  assert.deepEqual(extensionsFor(["change"]).map((x) => x.id), ["mend", "change"]);
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
  // stage 6's: CONVEY's verbs, DISPLY's ways of showing, SUGCON's task, once each
  run("(load '|ken;sugcon >|)");
  run("(load '|ken;convey >|)");
  run("(load '|ken;disply >|)");
  run("(load '|revive;chshow >|)");
  assert.equal(wraps(run, "convey-suggestions"), "(chshow)");
  assert.equal(wraps(run, "mover-and-other-of"), "(chshow)");
  for (const a of ["change", "causes", "bridge-to:", "goes-to-and-transforms", "changes-while-wandering"]) assert.notEqual(run(`(actor-of '${a} dont-autoload)`), "nil", a);
  for (const f of ["sugcon", "convey", "disply"]) plain.run(`(load '|ken;${f} >|)`);
  assert.equal(wraps(plain.run, "convey-suggestions"), "nil");
  for (const a of ["change", "causes", "bridge-to:", "goes-to-and-transforms", "changes-while-wandering"]) assert.equal(plain.run(`(exists? '${a})`), "nil", a);
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

test("who takes part in a relationship change, when SCENE orders tasks: its two characters, not relationship-of", () => {
  // SCENE asks each word of a convey task's description if it is a character
  // (scene.9:526-532); the tags have CINDY define relationship-of, so as in 1978 the ask stops
  const change = "'(change (relationship (relationship-of step-mother cinderella) hates) (relationship (relationship-of step-mother cinderella) is-polite-to))";
  const ken = pass1Ready([], null);
  assert.equal(ken.run("(exists? 'relationship-of)"), "|ken;cindy|");
  assert.throws(() => ken.run(`(participants-of-task ${change})`), /NO-SUCH-ACTOR/);
  const { run } = pass1Ready(["change"], null);
  assert.equal(wraps(run, "participants-of-task-1"), "(change)");
  assert.deepEqual(run(`(participants-of-task ${change})`).replace(/[()]/g, "").split(" ").sort(), ["cinderella", "step-mother"]);
  assert.deepEqual(run(`(participants-of-task '(causes prince (change (relationship (relationship-of step-mother cinderella) hates) (relationship (relationship-of step-mother cinderella) loves))))`).replace(/[()]/g, "").split(" ").sort(), ["cinderella", "prince", "step-mother"]);
  // Ken's tasks name characters, and are found as before
  for (const t of ["(pushes step-mother cinderella)", "(wants cinderella (meets cinderella prince))"]) {
    assert.equal(run(`(participants-of-task '${t})`), ken.run(`(participants-of-task '${t})`), t);
  }
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
 (SET YOUR OLD-VALUES TO ((PATH-CURVATURE LOW) (SPEED HIGH) (ACCELERATION HIGH) (DELIBERATENESS (NOT HIGH))))
 (SET YOUR NEW-VALUES TO ((PATH-CURVATURE HIGH) (SPEED (NOT HIGH)) (ACCELERATION HIGH) (DELIBERATENESS (NOT HIGH))))
 (SET YOUR RELATIVE-VALUES TO NIL)
 (SET YOUR NOT-DESCRIBED TO (GRUMPY)))
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
  // deliberateness: the fresh look left it as it was, a (not high) MEND narrows, so it
  // is left as pass 2 has it, not made so again
  assert.equal(run("(ask (choice-point-of step-mother deliberateness) recall your current-choice)"), "high");
  assert.equal(run("(ask (choice-point-of step-mother deliberateness) collect items memorized matching (changed-in: %))"), "nil");
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
  // the description it changed, and the old word she was never described as
  assert.deepEqual(becomes[0].described, [{ type: "personality", was: "(and evil mean)", now: "(and good kind)" }]);
  assert.deepEqual(becomes[0].notDescribed, ["grumpy"]);
  assert.equal(becomes[0].looks, undefined); // APPEAR isn't on
});

// Ken's CINDY 46 with scenes of our own before no-longer-kept-apart.
const withScenes = (scenes) => KEN_CINDY.replace("(define no-longer-kept-apart scene", `${scenes.map(([name, task]) => `(define ${name} scene
	(process initial description ${task}))

`).join("")}(define no-longer-kept-apart scene`);
const SHY_TO_BRAZEN = "(change (personality cinderella shy) (personality cinderella brazen))";

test("a change is made only by a task of its own or inside causes: wanted, prevented, undone or displayed, it is left alone, with a note", () => {
  const cindy = withScenes([
    ["hoping", `(convey (wants cinderella ${SHY_TO_BRAZEN}))`],
    ["stopping", `(convey (prevents step-mother ${SHY_TO_BRAZEN}))`],
    ["shown", `(display ${SHY_TO_BRAZEN})`],
    ["cheering-up", "(convey (change (emotional-state cinderella sad) (emotional-state cinderella happy)))"],
    ["learning", `(convey ${SHY_TO_BRAZEN})`],
    ["undone", `(convey (undoes fairy-godmother (from-scene learning (convey ${SHY_TO_BRAZEN}))))`],
    ["made-over", "(convey (causes fairy-godmother (change (physical cinderella shabby) (physical cinderella elegant))))"],
  ]);
  // the outline takes the same changes as REVIVE;CHANGE
  assert.deepEqual(Object.keys(storyOutline(cindy).changes), ["learning", "made-over"]);
  const { run } = pass1Ready(["change"], cindy);
  for (const [scene, n, because] of [["hoping", 0, "(inside wants)"], ["stopping", 0, "(inside prevents)"], ["undone", 0, "(inside undoes)"],
    ["cheering-up", 0, "(emotional-state is not a lasting description)"], ["learning", 1, null], ["made-over", 1, null]]) {
    assert.equal(run(`(length (changes-in-scene '${scene}))`), String(n), scene);
    const notes = run(`(mapcar (function (lambda (x) (ask ,x collect items memorized matching (revival-repair: %)))) (ask ${scene} recall your tasks))`);
    const escaped = (t) => t.replace(/[()]/g, "\\$&");
    if (because) assert.match(notes, new RegExp(`what change-not-made was ${escaped("(change ")}.*${escaped(") now left-alone because ")}${escaped(because)}`), scene);
    else assert.doesNotMatch(notes, /change-not-made/, scene);
  }
  // a display task is not one of the scene's tasks (scene.9:11-13): noted on it
  assert.match(run("(mapcar (function (lambda (x) (ask ,x collect items memorized matching (revival-repair: %)))) (ask shown recall your display-tasks))"), /change-not-made .* because \(in a display task\)/);
  assert.equal(run("(changes-in-scene 'shown)"), "nil");
});

test("a relationship the story never gave is made, then changed; an old word she never had is said", () => {
  const { run } = pass1Ready(["change"], null);
  assert.equal(run("(exists? '(relationship-of prince step-mother))"), "nil");
  assert.equal(run("(make-description-change '(change (relationship (relationship-of prince step-mother) hates) (relationship (relationship-of prince step-mother) loves)))"), "(hates)");
  assert.match(run("(ask (relationship-of prince step-mother) collect items memorized matching (description: %))"), /descriptor loves source initial-description/);
  assert.equal(run("(make-description-change '(change (personality cinderella (and shy grumpy)) (personality cinderella brazen)))"), "(grumpy)");
});

test("a change naming no character of the story stops with that said", () => {
  const x = lisp(["change"], withScenes([["typo", "(convey (change (personality cindrella shy) (personality cindrella brazen)))"]]));
  x.run("(load '|ken;datest >|)");
  assert.throws(() => x.run("(init nil)"), /CINDRELLA IS NOT A CHARACTER OF THE STORY/);
});

test("the glass box has no becomes unless CHANGE is loaded and made something so", () => {
  const ken = lisp([], null);
  assert.deepEqual(collectBecomes(ken.L), []);
  assert.ok(!ken.L.obarray.find("CHANGES-OF-EARLIER-SCENES"));
  const ours = lisp(["change"], null);
  ours.run("(load '|ken;char >|)");
  assert.deepEqual(collectBecomes(ours.L), []);
});

// ---------------------------------------------------------------- stage 6: REVIVE;CHSHOW

// A pass 2 as RUN starts one (run.65:42-48), CINDY and the CP loaded, with a change-of
// actor to show in the scene: the BECOME text given, learnt as pass 2 learns its own
// scene's (learn-what-changes-in).
function pass2With(extensions, story, become, scene, cp = null) {
  const x = lisp(extensions, story);
  x.fs.addFile("KEN1", "SHOWN", "BECOME", { text: become, origin: "test" });
  x.fs.addFile("KEN", "CP", "30", { text: cp || readFileSync("original/7005017/cp.29", "latin1"), origin: "test" });
  x.run("(load '|ken;run >|)");
  x.run(`(director-load 'cindy '(to reset ${scene}))`);
  x.run("(director-load 'cp)");
  x.run("(setq :choice-points-loaded t)");
  x.run(`(learn-what-changes-in '${scene} '((ken1) shown become))`);
  for (const f of ["sugcon", "convey", "disply", "chomet", "elemnt"]) x.run(`(load '|ken;${f} >|)`);
  return x;
}
// The repentant stepmother's BECOME file (reports/ext/change/fresh-look/repents.become),
// with a cause given.
const REPENTS = (cause) => `(DEFINE (CHANGE-OF STEP-MOTHER IN CHANGE-OF-HEART) DESCRIPTION-CHANGE
 (SET YOUR CHANGES TO ((CHANGE (PERSONALITY STEP-MOTHER (AND EVIL MEAN)) (PERSONALITY STEP-MOTHER (AND GOOD KIND)))))
 (SET YOUR CAUSES TO (${cause}))
 (SET YOUR OLD-VALUES TO ((PATH-JAGGEDNESS MEDIUM) (PATH-CURVATURE LOW) (PATH-LENGTH MEDIUM) (DELIBERATENESS HIGH) (REPETIVENESS MEDIUM) (ACCELERATION HIGH) (RHYTHMIC-LEVEL MEDIUM) (ACTIVITY-LEVEL HIGH) (SPEED HIGH) (ATTRACTION-TOWARDS-FRIENDS (NEGATIVE HIGH)) (ATTRACTION-TOWARDS-ENEMIES (NEGATIVE HIGH)) (ATTRACTION-TOWARDS-STRANGERS (NEGATIVE MEDIUM))))
 (SET YOUR NEW-VALUES TO ((PATH-JAGGEDNESS LOW) (PATH-CURVATURE MEDIUM) (PATH-LENGTH LONG) (DELIBERATENESS HIGH) (REPETIVENESS MEDIUM) (ACCELERATION MEDIUM) (RHYTHMIC-LEVEL MEDIUM) (ACTIVITY-LEVEL HIGH) (SPEED HIGH) (ATTRACTION-TOWARDS-FRIENDS (POSITIVE HIGH)) (ATTRACTION-TOWARDS-ENEMIES (POSITIVE HIGH)) (ATTRACTION-TOWARDS-STRANGERS (POSITIVE MEDIUM))))
 (SET YOUR RELATIVE-VALUES TO NIL)
 (SET YOUR NOT-DESCRIBED TO NIL))
`;
// The suggestions SUGCON collects for a scene's convey task, by its place in the scene.
const suggestionsOf = (run, scene, which = 0) => {
  run(`(setq test-task (nth ${which} (reverse (ask ${scene} recall your convey-tasks))))`);
  run("(convey-suggestions (ask ,test-task recall your task) test-task)");
  return run("(ask ,test-task collect items memorized matching (suggestion: %))");
};

test("causes shows a change it causes: the cause goes to the one it changes, and the elements Director reads are bridged, gradually", () => {
  const { run } = pass2With(["change"], story("change-of-heart"), REPENTS("PRINCE"), "change-of-heart");
  // the scene's own change is to be shown, not made so: her description is as it was
  assert.match(run("(ask step-mother collect items memorized matching (description: type personality %))"), /descriptor evil /);
  assert.equal(run("(changes-shown-in 'change-of-heart)"), "((change-of step-mother in change-of-heart))");
  assert.equal(run("(changes-of-earlier-scenes)"), "nil");
  // (causes prince (change ...)), after (accompanys prince step-mother)
  const s = suggestionsOf(run, "change-of-heart", 1);
  assert.match(s, /value \(method: type display value \(goes-to-and-transforms prince step-mother\)\) strength high source causes/);
  const bridges = [...s.matchAll(/\(bridge-to: element \(step-mother ([a-z-]+)\) new-value ([a-z]+) speed ([a-z]+) for \(change-of step-mother in change-of-heart\)\)/g)].map((m) => m.slice(1).join(" "));
  assert.deepEqual(bridges.sort(), ["path-curvature medium low", "path-jaggedness low low", "path-length long low"]);
  // the others are chosen again, and said not to be bridged: Director doesn't read them
  const notBridged = run("(ask (change-of step-mother in change-of-heart) collect items memorized matching (not-bridged: %))");
  for (const e of ["acceleration", "attraction-towards-friends", "attraction-towards-enemies", "attraction-towards-strangers"]) {
    assert.match(notBridged, new RegExp(`element ${e} was .* because \\(director does not read it\\)`), e);
  }
  assert.doesNotMatch(notBridged, /deliberateness|speed/); // not changed
  assert.match(run("(ask (change-of step-mother in change-of-heart) collect items memorized matching (rate: %))"),
    /\(rate: is gradual speed low because \(an abrupt change could easily be misinterpreted thesis 169\)\)/);
  // the accompanying task is suggested as in 1978
  assert.doesNotMatch(suggestionsOf(run, "change-of-heart", 0), /bridge-to:|transforms/);
});

test("a magical cause changes her at once, the revival's rule; a change with no cause is shown as she wanders; a causes of no change, as in 1978, has no suggestions", () => {
  const magic = pass2With(["change"], story("change-of-heart"), REPENTS("FAIRY-GODMOTHER"), "change-of-heart");
  assert.match(suggestionsOf(magic.run, "change-of-heart", 1), /speed instantaneous for/);
  assert.match(magic.run("(ask (change-of step-mother in change-of-heart) collect items memorized matching (rate: %))"),
    /\(rate: is instantaneous because \(magical fairy-godmother\) rule \(of the revival\)\)/);
  // Cinderella from shy to brazen, on her own: changes-while-wandering, her speed bridged
  const SOCIAL = `(DEFINE (CHANGE-OF CINDERELLA IN LEARNING) DESCRIPTION-CHANGE (SET YOUR CHANGES TO ((CHANGE (PERSONALITY CINDERELLA SHY) (PERSONALITY CINDERELLA BRAZEN)))) (SET YOUR CAUSES TO (NIL))
 (SET YOUR OLD-VALUES TO ((SPEED LOW))) (SET YOUR NEW-VALUES TO ((SPEED MEDIUM))) (SET YOUR RELATIVE-VALUES TO NIL) (SET YOUR NOT-DESCRIBED TO NIL))`;
  const social = pass2With(["change"], story("socializing"), SOCIAL, "learning");
  const t = suggestionsOf(social.run, "learning");
  assert.match(t, /value \(method: type display value \(changes-while-wandering cinderella\)\) strength high source change/);
  assert.match(t, /\(bridge-to: element \(cinderella speed\) new-value medium speed low for \(change-of cinderella in learning\)\)/);
  // a change whose fresh look wasn't made: no suggestions, "cant-do" as in stage 3
  const none = lisp(["change"], story("socializing"));
  none.fs.addFile("KEN", "CP", "30", { text: readFileSync("original/7005017/cp.29", "latin1"), origin: "test" });
  none.run("(load '|ken;run >|)");
  none.run("(director-load 'cindy '(to reset learning))");
  for (const f of ["sugcon", "convey", "disply"]) none.run(`(load '|ken;${f} >|)`);
  assert.equal(suggestionsOf(none.run, "learning"), "nil");
  // causes of something not a change, as EVIL's and DOMINATES' would make: none
  none.run("(setq :change-convey-task (first (ask learning recall your convey-tasks)))");
  assert.equal(none.run("(ask causes yield suggestions for (convey (causes step-mother (does cinderella cleaning))))"), "nil");
});

// Director as filming has it, at a frame rate, with Cinderella standing with the
// scene's dynamics.
function directorAt(fps, extensions = ["change"]) {
  const L = boot(makeProjectFileSystem(), { extensions });
  const run = (src) => L.print(L.evalString(src)).toLowerCase();
  run("(cs)");
  run("(load '|ken;aninit >|)");
  run("(tvsize 550 413)");
  run(`(setq :frames-per-second ${fps})`);
  run("(define (special-dynamics-of cinderella in t-subscene) special-dynamics (set your path-curvature to low))");
  run("(ask cinderella set your special-dynamics to (special-dynamics-of cinderella in t-subscene))");
  run("(ask cinderella set your position to (0.0 0.0))");
  run("(ask cinderella show)");
  const tick = () => run("(ask default-universe tick)");
  return { L, run, tick };
}

test("Director bridges an element over the seconds Ani planned, reaching its factor at 4 frames a second and at 24", () => {
  for (const fps of [4, 24]) {
    const { run, tick } = directorAt(fps);
    // walking, with dynamics of her own under the scene's (as a walk's are, place.45:452-461)
    run("(define |(special-dynamics-of cinderella in t-subscene)-1| (special-dynamics-of cinderella in t-subscene))");
    run("(ask cinderella set your special-dynamics to |(special-dynamics-of cinderella in t-subscene)-1|)");
    run("(ask cinderella gradually change by 4.0 factor for path-curvature in 2.5 seconds then set your bridged to done)");
    const ticks = Math.round(2.5 * fps);
    const value = () => Number(run("(ask cinderella ask your special-dynamics to yield your path-curvature value)"));
    // the first step at once, the rest one a tick: low (.5) times 4 after ticks - 1 ticks
    for (let k = 1; k < ticks; k++) tick();
    assert.ok(Math.abs(value() - 2.0) < 1e-4, `${fps} fps: ${value()} after ${ticks - 1} ticks`);
    assert.equal(run("(ask (special-dynamics-of cinderella in t-subscene) recall your bridged)"), "nil");
    tick(); // the followup, on the tick the bridge ends: 2.5 seconds after it began
    assert.equal(run("(ask (special-dynamics-of cinderella in t-subscene) recall your bridged)"), "done");
    tick();
    assert.ok(Math.abs(value() - 2.0) < 1e-4, "and stops");
  }
});

test("Director's bridge grows a factor once a tick, where Ken's two repeats grow one a walk has from the scene's twice at first, and one she stands with twice a tick", () => {
  // standing, her special dynamics the scene's (dichar.103:22-26)
  const { run, tick } = directorAt(4);
  const factor = (r) => Number(r("(ask (special-dynamics-of cinderella in t-subscene) recall your (path-curvature factor))"));
  run("(ask cinderella gradually change by 4.0 factor for path-curvature in 2.0 seconds)");
  for (let k = 1; k < 8; k++) tick();
  assert.ok(Math.abs(factor(run) - 4.0) < 1e-4, `the bridge: ${factor(run)}`);
  // Ken's, at medium speed: round(5 x 1 x 4 x ln 4) = 28 ticks, and 27 steps of 2.718^(1/20)
  // each (dichar.103:102-121; his e is 2.718, dichar.103:100), taken twice a tick:
  // 2.718^(27/10), not 2.718^(27/20)
  const ken = directorAt(4);
  ken.run("(ask cinderella gradually change by 4.0 factor for path-curvature at medium speed)");
  for (let k = 0; k < 30; k++) ken.tick();
  assert.ok(Math.abs(factor(ken.run) - 2.718 ** (27 / 10)) < 1e-3, `Ken's: ${factor(ken.run)}`);
  // and walking with dynamics that have the factor from the scene's: a step ahead, from
  // the first tick on
  const walking = directorAt(4);
  walking.run("(define |(special-dynamics-of cinderella in t-subscene)-1| (special-dynamics-of cinderella in t-subscene))");
  walking.run("(ask cinderella set your special-dynamics to |(special-dynamics-of cinderella in t-subscene)-1|)");
  walking.run("(ask cinderella gradually change by 4.0 factor for path-curvature at medium speed)");
  for (let k = 0; k < 30; k++) walking.tick();
  const own = Number(walking.run("(ask cinderella ask your special-dynamics to yield your path-curvature value)"));
  assert.ok(Math.abs(own - 0.5 * 2.718 ** (28 / 20)) < 1e-3, `Ken's, walking: ${own}`);
});

test("an instantaneous bridge is a tick", () => {
  const { run, tick } = directorAt(24);
  run("(define |(special-dynamics-of cinderella in t-subscene)-1| (special-dynamics-of cinderella in t-subscene))");
  run("(ask cinderella set your special-dynamics to |(special-dynamics-of cinderella in t-subscene)-1|)");
  run("(ask cinderella gradually change by 2.0 factor for path-curvature in 0.0 seconds then set your bridged to done)");
  assert.equal(Number(run("(ask cinderella ask your special-dynamics to yield your path-curvature value)")), 1);
  tick();
  assert.equal(run("(ask (special-dynamics-of cinderella in t-subscene) recall your bridged)"), "done");
});

// Cinderella's look as pass 1 drew her with APPEAR, and a look she might become.
const OLD_LOOK = "((shape hexagon) (angle 60) (center-offset nil) (ani-size 0.036) (hue purple) (look-color (270.0 0.35 0.65)))";
const NEW_LOOK = "((shape star) (angle 144) (center-offset (right 18)) (ani-size 0.05) (hue blue) (look-color (240.0 1.0 0.65)))";
const APPEARANCE_OF = "(define (appearance-of cinderella) appearance (set your shape to hexagon) (set your angle to 60) (set your center-offset to nil) (set your ani-size to 0.036) (set your hue to purple) (set your look-color to (270.0 0.35 0.65)))";

test("with APPEAR, a look's bridge: appearance-element gives Director a look change in seconds, from her look to the fresh look's", () => {
  const { run } = lisp(["mend", "appear", "change"], null);
  for (const f of ["cpoint", "elemnt", "char"]) run(`(load '|ken;${f} >|)`);
  run(APPEARANCE_OF);
  run(`(define (change-of cinderella in s) description-change (set your new-look to ${NEW_LOOK}))`);
  const form = (e) => run(`(ask appearance-element yield gradual change of (cinderella ${e}) to high for (change-of cinderella in s) in 6.0 seconds in nil)`);
  assert.match(form("size"), /^\(gradually change look by 1\.38\d* factor for size in 6\.0 seconds\)$/);
  assert.match(form("color-saturation"), /^\(gradually change look by 2\.857\d* factor for color-saturation in 6\.0 seconds\)$/);
  assert.equal(form("color-intensity"), "nil"); // as it was
  assert.equal(form("color-hue"), "(gradually change look to (look: hue blue) in 6.0 seconds)");
  assert.equal(form("shape-jaggedness"), "(gradually change look to (look: shape star angle 144 center-offset (right 18)) in 6.0 seconds)");
  // the elements CHSHOW bridges: those the look shows differently, the shape by a shape
  // element chosen differently
  run("(ask (change-of cinderella in s) set your new-values to ((size medium) (shape-jaggedness high) (shape-complexity medium) (color-saturation high) (color-intensity medium) (color-hue blue)))");
  run("(ask (change-of cinderella in s) set your old-values to ((size low) (shape-jaggedness low) (shape-complexity medium) (color-saturation low) (color-intensity medium) (color-hue purple)))");
  assert.equal(run("(look-elements-to-bridge '(change-of cinderella in s))"), "((size medium) (color-saturation high) (color-hue blue) (shape-jaggedness high))");
});

test("with APPEAR, Director changes a look over seconds: by a factor, to a hue, to a shape at once in a tick", () => {
  for (const fps of [4, 24]) {
    const { run, tick } = directorAt(fps, ["mend", "appear", "change"]);
    run("(ask cinderella take look (look: shape square angle 90 center-offset nil ani-size 0.05 look-color (60.0 0.35 0.65)))");
    run("(ask cinderella gradually change look by 2.0 factor for color-saturation in 2.0 seconds)");
    run("(ask cinderella gradually change look to (look: hue blue) in 2.0 seconds)");
    for (let k = 0; k < 2 * fps + 1; k++) tick();
    assert.equal(run("(ask cinderella recall your look-color)"), "(240.0 0.7 0.65)", `${fps} fps`);
    run("(ask cinderella gradually change look to (look: shape star angle 144 center-offset (right 18)) in 0.0 seconds)");
    assert.equal(run("(ask cinderella recall your shape)"), "star");
  }
});

test("with APPEAR, a later scene draws her as she has become: her look made so, and the program's take-look form", () => {
  const BECOME_LOOK = `(DEFINE (CHANGE-OF CINDERELLA IN MADE-OVER) DESCRIPTION-CHANGE (SET YOUR CHANGES TO ((CHANGE (PHYSICAL CINDERELLA SHABBY) (PHYSICAL CINDERELLA ELEGANT)))) (SET YOUR CAUSES TO (FAIRY-GODMOTHER))
 (SET YOUR OLD-VALUES TO ((SPEED LOW))) (SET YOUR NEW-VALUES TO ((SPEED LOW))) (SET YOUR RELATIVE-VALUES TO NIL) (SET YOUR NOT-DESCRIBED TO NIL)
 (SET YOUR OLD-LOOK TO ${OLD_LOOK.toUpperCase()}) (SET YOUR NEW-LOOK TO ${NEW_LOOK.toUpperCase()}))`;
  const { run, L, fs } = lisp(["mend", "appear", "change"], null);
  fs.addFile("KEN1", "MADE", "BECOME", { text: BECOME_LOOK, origin: "test" });
  fs.addFile("KEN", "CP", "30", { text: `${readFileSync("original/7005017/cp.29", "latin1")}\n${APPEARANCE_OF.toUpperCase()}\n`, origin: "test" });
  run("(load '|ken;run >|)");
  run("(director-load 'cindy '(to reset meeting))");
  run("(director-load 'cp)");
  run("(learn-who-they-have-become '(((ken1) made become)))");
  assert.equal(run("(ask (appearance-of cinderella) recall your shape)"), "star");
  assert.equal(run("(ask (appearance-of cinderella) recall your look-color)"), "(240.0 1.0 0.65)");
  assert.match(run("(ask (change-of cinderella in made-over) collect items memorized matching (looked-anew: %))"), /was \(\(shape hexagon\).*now \(\(shape star\)/);
  assert.match(run("(take-look-forms 'meeting)"), /\(ask cinderella take look \(look: shape star angle 144 center-offset \(right 18\) ani-size 0\.05 look-color \(240\.0 1\.0 0\.65\)\)\)/);
  const [b] = collectBecomes(L);
  assert.deepEqual(b.looks.changed, ["size", "clarity", "hue", "shape"]);
  assert.equal(b.lookMadeSo, true);
});
