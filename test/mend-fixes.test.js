// Round 2 of MEND (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"): what the
// reviewers asked of repairs already made.
//  - M5 and M6: in a scene's first subscene, whether someone will be brought on is read,
//    while Ani chooses, from where the last scene left everyone (its POSIT file), so the
//    time the task is allotted includes the walk. An estimate that counts a bringing on
//    says so; when the subscene runs its methods only an estimate that assumed otherwise
//    is made again, and a walk counted only then doesn't take the subscene's stretch
//    below .125, where Ken warns (scene.9:168). A method's run notes it if it finds
//    otherwise than its estimate assumed.
//  - M6: among the characters in the scene, those who take part in it by Ken's test
//    (scene-participation, sugest.123:333-335) come first, then the others named in it.
//  - M1 and M2: their hooks on KEN;CP act only in pass 2, RUN's job.
//  - M7: the suggestions handed to COSUG are copies MEND makes itself, not KEN1's
//    reconstructed replaceprop's.
// Cinderella needs none of these, so tools/check-1978.mjs can't notice one that is
// missing. test/stories/stress/meets-offstage.lisp shows the first in a whole film
// (node tools/run-story.mjs <story> --extensions mend).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot, makeFilm, pass2, storyOutline, storyPlan } from "../src/pipeline.js";

function lisp(extensions = ["mend"], fs = makeProjectFileSystem()) {
  const L = boot(fs, { extensions });
  const run = (src) => L.print(L.evalString(src));
  return { L, run, fs };
}

const notes = (run, actor) => run(`(ask ${actor} collect items memorized matching (revival-repair: %))`);

// Where the last scene left them, as ANINIT's save-positions writes it (aninit.65:158-175):
// the goat off the stage, below the picture, and the bear on it.
const POSIT = `(ASK (SUBSCENE-OF (DIRECTOR-SYMBOL-FOR-EVAL SCENE) 1) SET YOUR (LOCATION-OF T-GOAT) TO (PLACE: WHERE (XY-POSITION 0.1 -0.6) WHY (ENDED UP HERE IN T-BEFORE) STATUS COOL))
(ASK (SUBSCENE-OF (DIRECTOR-SYMBOL-FOR-EVAL SCENE) 1) SET YOUR (LOCATION-OF T-BEAR) TO (PLACE: WHERE (XY-POSITION 0.07 -0.09) WHY (ENDED UP HERE IN T-BEFORE) STATUS COOL))
`;

// A scene of two subscenes, made as SCENE makes them, that starts where KEN1;T-LEFT POSIT
// says the last scene left the goat and the bear; the kid isn't in it. And a scene with
// no POSIT file, as a film's first scene has none.
function withAPositFile() {
  const fs = makeProjectFileSystem();
  fs.addFile("KEN1", "T-LEFT", "POSIT", { text: POSIT, origin: "test" });
  const { L, run } = lisp(["mend"], fs);
  run("(cs)"); // pass 2 measures places on the TV, as Ken's saved Director did
  for (const f of ["interf", "char", "place", "scene"]) run(`(load '|ken;${f} >|)`);
  run("(progn (define t-goat character) (define t-bear character) (define t-kid character))");
  run("(define t-scene something)");
  run("(putprop 't-scene '((ken1) t-left posit) 'position-file)");
  run("(define t-first-scene something)");
  run("(ask subscene set your subscene-count to 0)"); // as RUN does (run.65:38)
  run("(ask subscene make subscene of t-scene)");
  run("(ask subscene make subscene of t-scene)");
  run("(ask subscene set your subscene-count to 0)");
  run("(ask subscene make subscene of t-first-scene)");
  return { L, run };
}

const SUB1 = "(subscene-of t-scene 1)";
const SUB2 = "(subscene-of t-scene 2)";

test("M6: in a scene's first subscene, where the last scene left everyone says who starts off the stage, before RUN gives anyone a place", () => {
  const { run } = withAPositFile();
  assert.equal(run(`(where-the-last-scene-left 't-goat '${SUB1})`), "(XY-POSITION 0.1 -0.6)");
  assert.equal(run(`(where-the-last-scene-left 't-bear '${SUB1})`), "(XY-POSITION 0.07 -0.09)");
  assert.equal(run(`(where-the-last-scene-left 't-kid '${SUB1})`), "NIL");
  // only the first subscene starts from the POSIT file (run.65:52-53)
  assert.equal(run(`(where-the-last-scene-left 't-goat '${SUB2})`), "NIL");
  // no one has a place yet, as while Ani chooses (run.65:49-51)
  assert.equal(run(`(located? '(vicinity-of t-goat) '${SUB1})`), "NIL");
  assert.equal(run(`(starts-off-the-stage? 't-goat 't-bear '${SUB1})`), "T");
  assert.equal(run(`(starts-off-the-stage? 't-bear 't-goat '${SUB1})`), "NIL");
  // the kid has no place there, and the bear has: PLACE will put the kid off the stage
  assert.equal(run(`(starts-off-the-stage? 't-kid 't-bear '${SUB1})`), "T");
  // the second subscene, and a scene with no POSIT file, as in 1978: no one is known
  assert.equal(run(`(starts-off-the-stage? 't-goat 't-bear '${SUB2})`), "NIL");
  assert.equal(run("(starts-off-the-stage? 't-goat 't-bear '(subscene-of t-first-scene 1))"), "NIL");
  // RUN loads the file into the first subscene (run.65:52-53); the places say the same
  run("(let ((scene 't-scene)) (load '((ken1) t-left posit)))");
  assert.equal(run(`(located? '(vicinity-of t-goat) '${SUB1})`), "T");
  assert.equal(run(`(starts-off-the-stage? 't-goat 't-bear '${SUB1})`), "T");
  assert.equal(run(`(starts-off-the-stage? 't-bear 't-goat '${SUB1})`), "NIL");
  assert.equal(run(`(starts-off-the-stage? 't-kid 't-bear '${SUB1})`), "T");
});

test("M6: an estimate that counts a bringing on says whom", () => {
  const { run } = withAPositFile();
  // the walk itself, as time-to-get-on-stage would estimate it
  run("(defun time-to-get-on-stage (other character subscene) '(time-estimates: ideal 3.0 least 1.2 most 7.5))");
  const estimate = "'(time-estimates: ideal 5.0 least 2.0 most 12.5)";
  assert.equal(run(`(plus-time-to-bring-on 't-goat 't-bear '${SUB1} ${estimate})`),
    "(TIME-ESTIMATES: IDEAL 8.0 LEAST 3.2 MOST 20.0 BRINGING-ON T-GOAT)");
  assert.equal(run(`(plus-time-to-bring-on 't-bear 't-goat '${SUB1} ${estimate})`), "(TIME-ESTIMATES: IDEAL 5.0 LEAST 2.0 MOST 12.5)");
  assert.equal(run(`(plus-time-to-bring-on 't-goat 't-bear '${SUB2} ${estimate})`), "(TIME-ESTIMATES: IDEAL 5.0 LEAST 2.0 MOST 12.5)");
});

test("M6: when a subscene runs its methods, only an estimate that assumed otherwise about bringing someone on is made again", () => {
  const { run } = withAPositFile();
  const remember = (method, estimate) => run(`(ask ${SUB1} set your (time-estimates-for ${method}) to ${estimate})`);
  remember("(move-to t-bear (vicinity-of t-goat))", "(time-estimates: ideal 8.0 least 3.2 most 20.0 bringing-on t-goat)");
  remember("(move-to-and-hits t-bear t-goat)", "(time-estimates: ideal 5.0 least 2.0 most 12.5)");
  remember("(move-to-and-hits t-goat t-bear)", "(time-estimates: ideal 5.0 least 2.0 most 12.5)");
  remember("(chases-to t-goat t-bear (vicinity-of t-kid))", "(time-estimates: ideal 8.0 least 3.2 most 20.0 bringing-on t-bear)");
  const otherwise = (method) => run(`(assumed-otherwise? '${method} '${SUB1})`);
  assert.equal(run(`(bringing-on-assumed '(move-to t-bear (vicinity-of t-goat)) '${SUB1})`), "T-GOAT");
  // estimated while Ani chose, from the POSIT file: the goat is off the stage, as assumed
  assert.equal(otherwise("(move-to t-bear (vicinity-of t-goat))"), "NIL");
  // estimated without the walk
  assert.notEqual(otherwise("(move-to-and-hits t-bear t-goat)"), "NIL");
  // the bear is on the stage: nothing to bring on, as assumed, or not as assumed
  assert.equal(otherwise("(move-to-and-hits t-goat t-bear)"), "NIL");
  assert.notEqual(otherwise("(chases-to t-goat t-bear (vicinity-of t-kid))"), "NIL");
  // Ken's methods that bring no one on are as remembered
  assert.equal(otherwise("(goes-to-and-accompanys t-bear t-goat (vicinity-of t-goat))"), "NIL");
});

test("M6: a walk counted only when the subscene runs doesn't take its stretch below Ken's .125", () => {
  const { run } = withAPositFile();
  // the reviewers' meeting: allotted 1.0761 seconds, estimated again at 11.29 (a stretch
  // of .095), and 5.61 as remembered
  run(`(ask ${SUB1} set your running-time to 1.0761)`);
  const near = (expr, x) => run(`(< (abs (-$ ${expr} ${x})) 0.0001)`);
  assert.equal(near(`(stretched-no-less-than-ken-warns 11.29 5.61 '${SUB1})`, "8.6088"), "T");
  assert.match(notes(run, SUB1),
    /^\(\(REVIVAL-REPAIR: WHAT LEAST-STRETCH WAS 0\.09531\d* NOW 0\.125 BECAUSE \(BRINGING ON COUNTED ONLY WHEN PLACES ARE KNOWN AND KEN WARNS BELOW 0\.125\)\)\)$/);
  // a stretch of .125 or more is left as it is
  assert.equal(run(`(stretched-no-less-than-ken-warns 6.0 5.61 '${SUB1})`), "6.0");
  // Ken's own estimates already below it: no lower than those, and noted
  assert.equal(run(`(stretched-no-less-than-ken-warns 20.0 10.0 '${SUB1})`), "10.0");
  assert.equal(run(`(length (ask ${SUB1} collect items memorized matching (revival-repair: %)))`), "2");
  // a subscene with nothing to do (run your methods' factor 0.0, scene.9:167)
  run(`(ask ${SUB2} set your running-time to 0.0)`);
  assert.equal(run(`(stretched-no-less-than-ken-warns 11.29 5.61 '${SUB2})`), "11.29");
  assert.equal(notes(run, SUB2), "NIL");
});

test("M6: a method's run brings on as it finds the subscene, and notes when its estimate assumed otherwise", () => {
  const { run } = withAPositFile();
  const remember = (method, estimate) => run(`(ask ${SUB1} set your (time-estimates-for ${method}) to ${estimate})`);
  remember("(move-to t-bear (vicinity-of t-goat))", "(time-estimates: ideal 8.0 least 3.2 most 20.0 bringing-on t-goat)");
  remember("(move-to-and-hits t-bear t-goat)", "(time-estimates: ideal 5.0 least 2.0 most 12.5)");
  remember("(chases-to t-goat t-bear (vicinity-of t-kid))", "(time-estimates: ideal 8.0 least 3.2 most 20.0 bringing-on t-bear)");
  assert.equal(run(`(brings-on? 't-goat 't-bear '${SUB1} '(move-to t-bear (vicinity-of t-goat)))`), "T");
  assert.equal(notes(run, SUB1), "NIL");
  assert.equal(run(`(brings-on? 't-goat 't-bear '${SUB1} '(move-to-and-hits t-bear t-goat))`), "T");
  assert.equal(notes(run, SUB1),
    "((REVIVAL-REPAIR: WHAT BRINGING-ON-ASSUMED WAS (T-GOAT NOT-BROUGHT-ON) NOW (T-GOAT BROUGHT-ON) BECAUSE (PLACED-SINCE-THE-STRETCH-FOR (MOVE-TO-AND-HITS T-BEAR T-GOAT))))");
  assert.equal(run(`(brings-on? 't-bear 't-goat '${SUB1} '(chases-to t-goat t-bear (vicinity-of t-kid)))`), "NIL");
  assert.match(notes(run, SUB1), /WHAT BRINGING-ON-ASSUMED WAS \(T-BEAR BROUGHT-ON\) NOW \(T-BEAR NOT-BROUGHT-ON\)/);
});

// Siblings, most recently defined first as Ani's characters are, and a scene whose tasks
// name some of them. took-part lists those whose task SCENE records their part in, as
// it does a task's subject (scene.9:463-465).
function withParticipants(tookPart) {
  const { run } = lisp();
  run("(load '|ken;sugest >|)");
  run("(progn (define t-a something) (define t-troll t-a) (define t-imp t-a) (define t-kid t-a) (define t-elf t-a) (define t-goat t-a))");
  const related = (a, b, word) =>
    run(`(progn (ask something make (relationship-of ${a} ${b}))
                (ask (relationship-of ${a} ${b}) memorize (description: type relationship descriptor ${word} source initial-description)))`);
  related("t-troll", "t-goat", "hates");
  related("t-troll", "t-elf", "hates");
  related("t-kid", "t-troll", "hates");
  run("(define t-scene something (set your convey-tasks to (t-task-1 t-task-2)) (set your establish-tasks to (t-task-3)))");
  const task = (name, description, who) => {
    run(`(define ${name} something
           (set your task to (task: description ${description} for-who ${who} source initial-description))
           (set your scene to t-scene))`);
    if (tookPart.includes(who)) run(`(ask ${who} memorize (scene-participation: scene t-scene task ${name}))`);
  };
  task("t-task-1", "(accompanys t-kid t-goat)", "t-kid");
  task("t-task-2", "(meets t-imp t-elf)", "t-imp");
  task("t-task-3", "(personality t-troll)", "t-troll");
  return { run };
}

test("M6: those who take part in the scene come first, by Ken's test, then the others named in it", () => {
  const enemy = (run) => run("(character-that-satisfies '(enemy-of t-troll nil) 't-task-3)");
  // Ken's pick is the goat, the first sibling the troll hates; the goat and the elf are
  // only named in the scene, the kid takes part in it, and hates the troll
  let { run } = withParticipants(["t-kid", "t-imp", "t-troll"]);
  assert.equal(run("(ask t-troll recall your siblings)"), "(T-GOAT T-ELF T-KID T-IMP)");
  assert.equal(run("(first-sibling-that-is-or-does 'hates 't-troll)"), "T-GOAT");
  // the goat is named, and so first among those named; the kid, who takes part, comes first
  assert.equal(enemy(run), "T-KID");
  assert.equal(notes(run, "t-task-3"), "((REVIVAL-REPAIR: WHAT IN-SCENE-FIRST WAS T-GOAT NOW T-KID BECAUSE (TAKES-PART-IN T-SCENE)))");
  // with no one's part recorded, the first named who fits: Ken's pick stands
  ({ run } = withParticipants([]));
  assert.equal(enemy(run), "T-GOAT");
  assert.equal(notes(run, "t-task-3"), "NIL");
  // Ken's pick takes part in the scene: it stands
  ({ run } = withParticipants(["t-goat", "t-kid"]));
  run("(ask t-goat memorize (scene-participation: scene t-scene task t-task-1))");
  assert.equal(enemy(run), "T-GOAT");
  assert.equal(notes(run, "t-task-3"), "NIL");
});

test("M6: when Ken's pick isn't in the scene, those who take part come before those only named", () => {
  // the kid's task names the cub, not the goat: the goat is in no task of the scene
  const { run } = lisp();
  run("(load '|ken;sugest >|)");
  run("(progn (define t-a something) (define t-troll t-a) (define t-imp t-a) (define t-kid t-a) (define t-elf t-a) (define t-goat t-a))");
  for (const [a, b] of [["t-troll", "t-goat"], ["t-troll", "t-elf"], ["t-kid", "t-troll"]]) {
    run(`(progn (ask something make (relationship-of ${a} ${b}))
                (ask (relationship-of ${a} ${b}) memorize (description: type relationship descriptor hates source initial-description)))`);
  }
  run("(define t-scene something (set your convey-tasks to (t-task-1 t-task-2)) (set your establish-tasks to (t-task-3)))");
  const task = (name, description, who) =>
    run(`(define ${name} something
           (set your task to (task: description ${description} for-who ${who} source initial-description))
           (set your scene to t-scene))`);
  task("t-task-1", "(accompanys t-kid t-cub)", "t-kid");
  task("t-task-2", "(meets t-imp t-elf)", "t-imp");
  task("t-task-3", "(personality t-troll)", "t-troll");
  const enemy = () => run("(character-that-satisfies '(enemy-of t-troll nil) 't-task-3)");
  // no one's part recorded: the elf, the first after the goat named in the scene
  assert.equal(enemy(), "T-ELF");
  assert.equal(notes(run, "t-task-3"), "((REVIVAL-REPAIR: WHAT IN-SCENE-FIRST WAS T-GOAT NOW T-ELF BECAUSE (NAMED-IN T-SCENE)))");
  // the kid's part recorded, as SCENE records it: the kid, though the elf comes first
  run("(ask t-task-3 forget items matching (revival-repair: %))");
  run("(ask t-kid memorize (scene-participation: scene t-scene task t-task-1))");
  assert.equal(enemy(), "T-KID");
  assert.equal(notes(run, "t-task-3"), "((REVIVAL-REPAIR: WHAT IN-SCENE-FIRST WAS T-GOAT NOW T-KID BECAUSE (TAKES-PART-IN T-SCENE)))");
});

// Choices as pass 1 writes them to KEN;CP, with a (not X) and a none.
const CP = `
(define (choice-point-of a speed) absolute-choice-point (set your current-choice to high))
(define (choice-point-of d speed) absolute-choice-point (set your current-choice to (not high)))
(define (choice-point-of d activity-level) absolute-choice-point (set your current-choice to none))
`;

function withChoices(job) {
  const fs = makeProjectFileSystem();
  fs.addFile("KEN", "CP", "999", { text: CP, origin: "test" });
  const { run } = lisp(["mend"], fs);
  run("(define mendf-film film (set your level of variety to medium))");
  if (job) run(`(load '|ken;${job} >|)`);
  run("(load '|ken;cp >|)");
  const choice = (who, element) => run(`(ask (choice-point-of ${who} ${element}) recall your current-choice)`);
  return { run, choice };
}

test("M1 and M2: KEN;CP's choices are repaired only in pass 2, RUN's job", () => {
  // RUN, when it loads, sets :choice-points-loaded (run.65:29)
  const pass2Job = withChoices("run");
  assert.equal(pass2Job.run("(boundp ':choice-points-loaded)"), "T");
  assert.equal(pass2Job.choice("d", "speed"), "LOW");
  assert.equal(pass2Job.choice("d", "activity-level"), "MEDIUM");
  assert.equal(pass2Job.run("(length :revival-noted)"), "2");
  // a pass-1 job, as CHANGE's fresh look is to be, loads DATEST and then the CP: pass 1's
  // own values stay as they are
  for (const job of ["datest", null]) {
    const { run, choice } = withChoices(job);
    assert.equal(run("(boundp ':choice-points-loaded)"), "NIL");
    assert.equal(choice("d", "speed"), "(NOT HIGH)");
    assert.equal(choice("d", "activity-level"), "NONE");
    assert.equal(choice("a", "speed"), "HIGH");
    assert.equal(run(":revival-noted"), "NIL");
  }
});

test("M7: the suggestions handed to COSUG are MEND's own copies, whatever KEN1's replaceprop does", () => {
  const { run } = lisp();
  // a copy, the indicator's value replaced in its place; the list given is left as it was
  run("(setq mendf-plist (list 'suggestion: 'element 'e 'value 'v 'strength 'high))");
  assert.equal(run("(property-replaced-in-a-copy mendf-plist 'w 'value)"), "(SUGGESTION: ELEMENT E VALUE W STRENGTH HIGH)");
  assert.equal(run("mendf-plist"), "(SUGGESTION: ELEMENT E VALUE V STRENGTH HIGH)");
  // COSUG's combine of two change: suggestions with a replaceprop that changes the list
  // in place, as KEN1's reconstruction might have had to (src/director/ken1/util.lisp,
  // VERIFY): the same result, and the suggestions as SUGEST collected them
  run("(load '|ken;cosug >|)");
  run("(actor-of 'change:)");
  run("(define mendf-cosug-film film (set your level of obviousness to high) (set your level of originality to low))");
  run("(ask film set your current-film to mendf-cosug-film)");
  run("(defun replaceprop (plist value indicator) (putprop plist value indicator) plist)");
  const change = (level) => `'(suggestion: element (establish (emotional-state goat (joy (positive ${level}))))
	      value (method: type display-value-change
			     value (change: element (goat speed) amount (positive ${level}) speed ${level}))
	      strength high source joy)`;
  run("(define mendf-task something)");
  run(`(setq mendf-suggestions (list ${change("low")} ${change("medium")}))`);
  run("(record+combine-suggestions mendf-suggestions 'change: 'mendf-task)");
  assert.equal(run("(ask mendf-task collect items memorized matching (suggestion: %))").toLowerCase(),
    "((suggestion: element (and (establish (emotional-state goat (joy (positive medium)))) (establish (emotional-state goat (joy (positive low))))) value (method: best-when nil type display-value-change value (change: element (goat speed) amount (positive low) speed low)) strength high source joy))");
  assert.equal(run("(mapcar (function (lambda (s) (list (get (get s 'value) 'display) (first (get (get s 'value) 'value))))) mendf-suggestions)"),
    "((NIL CHANGE:) (NIL CHANGE:))");
});

// The stress story's Reunion, planned from where On the Bridge left everyone (as its
// filming leaves them: the goat off the stage, below the picture).
const REUNION_POSIT = `(ASK (SUBSCENE-OF (DIRECTOR-SYMBOL-FOR-EVAL SCENE) 1) SET YOUR (LOCATION-OF KID) TO (PLACE: WHERE (XY-POSITION 0.18634139 -0.16708579) WHY (ENDED UP HERE IN ON-THE-BRIDGE) STATUS COOL))
(ASK (SUBSCENE-OF (DIRECTOR-SYMBOL-FOR-EVAL SCENE) 1) SET YOUR (LOCATION-OF TROLL) TO (PLACE: WHERE (XY-POSITION 0.0 0.0) WHY (ENDED UP HERE IN ON-THE-BRIDGE) STATUS COOL))
(ASK (SUBSCENE-OF (DIRECTOR-SYMBOL-FOR-EVAL SCENE) 1) SET YOUR (LOCATION-OF GOAT) TO (PLACE: WHERE (XY-POSITION 0.10578521 -0.60260794) WHY (ENDED UP HERE IN ON-THE-BRIDGE) STATUS COOL))
`;

test("M5 and M6: a meeting with someone the last scene sent off is allotted her walk on (stress/meets-offstage.lisp)", () => {
  const description = readFileSync(new URL("./stories/stress/meets-offstage.lisp", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const fs = makeProjectFileSystem();
  const plan = storyPlan(storyOutline(description));
  makeFilm(fs, { description, scenes: [], extensions: ["mend"] }); // pass 1
  fs.addFile("KEN1", plan.scenes[0].movie.toUpperCase(), "POSIT", { text: REUNION_POSIT, origin: "test" });
  const { lisp: L } = pass2(fs, "reunion", { plan, extensions: ["mend"] });
  const run = (src) => L.print(L.evalString(src)).toLowerCase();
  assert.equal(run("(ask convey-task-3 recall your current-choice)"), "((move-to kid (vicinity-of goat)))");
  // estimated while Ani chose, with the goat's walk on counted, and allotted at least
  // the short scene's 20 seconds (pick-time-within, chomet.123:131-139)
  assert.match(run("(ask (subscene-of reunion 1) recall your (time-estimates-for (move-to kid (vicinity-of goat))))"), / bringing-on goat\)$/);
  assert.equal(run("(ask convey-task-3 recall your running-time)"), "20.0");
  // so the subscene is stretched, not squeezed into a second (the reviewers saw .095)
  assert.equal(run("(> (ask (subscene-of reunion 1) recall your stretched-by) 1.0)"), "t");
  assert.match(notes(run, "(subscene-of reunion 1)"), /what brought-on-stage was \(goat at \(xy-position 0\.10578521 -0\.60260794\)\)/);
  assert.doesNotMatch(notes(run, "(subscene-of reunion 1)"), /least-stretch|bringing-on-assumed/);
});
