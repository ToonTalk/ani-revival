// REVIVE;SEEN (src/director/revive/seen.lisp): a character whose part is only changes
// wanders while they run, once nothing else moves her (Ken's testing of the film page, 15
// October 2026); and src/pipeline.js whyTheyAct, what the page needs to say why the
// characters act as they do. The whole films are tools/check-ext.mjs --extensions seen's
// and tools/check-change.mjs's (the beautified scene); tools/check-still.mjs finds every
// still stretch in the goldens.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot, EXTENSIONS, extensionsFor, whyTheyAct, stillStretches, walksOffThePicture } from "../src/pipeline.js";

function lisp(extensions = ["seen"]) {
  const L = boot(makeProjectFileSystem(), { extensions });
  const run = (src) => L.print(L.evalString(src));
  return { L, run };
}
const wraps = (run, f) => run(`(mapcar 'car (get '${f} 'revival-wraps))`);
const json = (path) => JSON.parse(readFileSync(path, "utf8"));

test("SEEN is a repair the switch turns on, beside MEND, which it requires; it changes Ken's Cinderella", () => {
  const seen = EXTENSIONS.find((e) => e.id === "seen");
  assert.deepEqual(seen.files, ["wrap", "seen"]);
  assert.deepEqual(seen.requires, ["mend"]);
  assert.equal(seen.changes1978, true);
  assert.equal(seen.group, "repairs");
  assert.ok(!seen.optIn);
  assert.deepEqual(extensionsFor(["seen"]).map((e) => e.id), ["mend", "seen"]);
});

test("SEEN is installed once its files of Ken's have loaded, and not in 1978 mode or with MEND alone", () => {
  const { run } = lisp();
  assert.equal(run("(exists? 'wander-while-changes-run)"), "|KEN;DISPLY|");
  assert.equal(wraps(run, "plan-something-if-only-changes"), "NIL");
  run("(load '|ken;scene >|)");
  run("(load '|ken;disply >|)");
  assert.equal(wraps(run, "plan-something-if-only-changes"), "(SEEN)");
  assert.notEqual(run("(ask wander-while-changes-run are you a display-method)"), "NIL");
  run("(load '|ken;scene >|)");
  assert.equal(wraps(run, "plan-something-if-only-changes"), "(SEEN)");
  for (const ext of [[], ["mend"]]) {
    const { run: r } = lisp(ext);
    r("(load '|ken;scene >|)");
    assert.equal(wraps(r, "plan-something-if-only-changes"), "NIL", ext.join());
    assert.equal(r("(exists? 'wander-while-changes-run)"), "NIL", ext.join());
  }
});

// Two subscenes of a scene, as SCENE makes them, the goat walking in the first and with
// only changes in the second.
function withAScene() {
  const { L, run } = lisp();
  run("(cs)");
  run("(load '|ken;scene >|)");
  run("(load '|ken;char >|)");
  run("(load '|ken;disply >|)");
  run("(define t-goat character)");
  run("(define t-troll character)");
  run("(ask subscene set your subscene-count to 0)");
  run("(define t-scene something)");
  run("(ask subscene make subscene of t-scene)");
  run("(ask subscene make subscene of t-scene)");
  run("(ask (subscene-of t-scene 1) set your (location-of t-goat) to (place: where (xy-position 0.1 0.2) why test status cool))");
  run("(ask (subscene-of t-scene 1) set your (location-of t-troll) to (place: where (xy-position 0.7 0.0) why test status cool))");
  run(`(ask (subscene-of t-scene 1) set your (actions-of t-goat) to
         ((walk of t-goat to (screen-position upper left) as stationary-target careful of collisions starting at 0.0
                using x called (activity-of t-walk 1) stopping if (stop-when-there (quote (subscene-of t-scene 1))))))`);
  run(`(ask (subscene-of t-scene 1) set your (actions-of t-troll) to
         ((walk of t-troll with t-goat to (screen-position middle middle) as stationary-target careful of collisions starting at 0.0
                using x called (activity-of t-drag 1) stopping if (stop-when-there (quote (subscene-of t-scene 1))))
          (hit t-goat by t-troll using x called (activity-of t-hit 1))))`);
  return { L, run };
}

test("what else moves her: the walks and hits that move her in her part and the one it extends, each once", () => {
  const { run } = withAScene();
  assert.equal(run("(movers-of-action '(walk of a to x called p))"), "(A)");
  assert.equal(run("(movers-of-action '(walk of a with b to x called p))"), "(A B)");
  assert.equal(run("(movers-of-action '(turning of a 30 degrees starting at 0.0 using x called p stopping if c))"), "(A)");
  assert.equal(run("(movers-of-action '(hit v by a using x called p))"), "(A)");
  // (the characters in the order SCENE has them, the troll first)
  assert.equal(run("(plans-that-move 't-goat '(subscene-of t-scene 1))"), "((ACTIVITY-OF T-DRAG 1) (ACTIVITY-OF T-WALK 1))");
  assert.equal(run("(plans-that-move 't-troll '(subscene-of t-scene 1))"), "((ACTIVITY-OF T-DRAG 1) (ACTIVITY-OF T-HIT 1))");
  // Director watches her part and the one it extends
  assert.equal(run("(parts-to-watch '(subscene-of t-scene 2))"), "((SUBSCENE-OF T-SCENE 2) (SUBSCENE-OF T-SCENE 1))");
  assert.equal(run("(parts-to-watch '(subscene-of t-scene 1))"), "((SUBSCENE-OF T-SCENE 1))");
  // a plan already made whose Lisp has her move
  assert.equal(run("(moves-in-lisp? 't-goat '((sequence: (ask p cause (t-goat) to gradually go in arc))))"), "T");
  assert.equal(run("(moves-in-lisp? 't-goat '((ask p gradually face t-goat towards x plus 0.0)))"), "T");
  assert.equal(run("(moves-in-lisp? 't-goat '((ask p cause t-troll to hit t-goat and then retreat)))"), "NIL");
  // a repeated activity carries her to its part's end: no wander beside it
  assert.equal(run("(carried-by-a-repeat? 't-goat '(subscene-of t-scene 2))"), "NIL");
  run("(ask (subscene-of t-scene 1) set your movements to ((repeat 3 (and (activity-of t-walk 1)))))");
  assert.equal(run("(carried-by-a-repeat? 't-goat '(subscene-of t-scene 2))"), "T");
  assert.equal(run("(carried-by-a-repeat? 't-troll '(subscene-of t-scene 2))"), "NIL");
});

test("the wander: a plan that waits until nothing else moves her, and one after it that walks while her changes run", () => {
  const { run } = withAScene();
  const plan = run("(ask ,(ask wander-while-changes-run make interned offspring) plan wander-while-changes-run t-goat in (subscene-of t-scene 2))");
  assert.match(plan, /^\(ACTIVITY-OF WANDERING-WHILE-CHANGES-RUN \d+\)$/);
  const plans = run("(ask (subscene-of t-scene 2) recall your plans)");
  const waiting = /\(ACTIVITY-OF WAITING-TO-WANDER \d+\)/.exec(plans)[0];
  // the waiting plan begins with its part, once the part's changes run; both are run from
  // the part's initial actions, not among its movements, so that the part ends when its
  // changes do
  assert.equal(run(`(ask ${waiting} recall your begin-time)`), "(AFTER (BEGINNING-OF (SUBSCENE-OF T-SCENE 2)) 0.0)");
  assert.equal(run("(ask (subscene-of t-scene 2) recall your initial-actions)"),
    `((RUN ${waiting} THEN SEE IF EVERYBODY IS DONE) (RUN ${plan} THEN SEE IF EVERYBODY IS DONE))`);
  assert.equal(run(`(ask ${plan} recall your begin-time)`), `(AFTER (END-OF ${waiting}) 0.0)`);
  assert.equal(run(`(ask ${waiting} recall your plans)`),
    `((ASK ${waiting} WAIT UNTIL T-GOAT IS MOVED BY NOTHING IN ((SUBSCENE-OF T-SCENE 2) (SUBSCENE-OF T-SCENE 1)) OR (SUBSCENE-OF T-SCENE 2) CHANGES END))`);
  assert.equal(run(`(ask ${plan} recall your plans)`), `((ASK ${plan} WANDER T-GOAT WHILE CHANGES RUN IN (SUBSCENE-OF T-SCENE 2)))`);
  assert.match(run(`(ask ${plan} collect items)`), /\(WANDERS: CHARACTER T-GOAT WHILE \(CHANGES-FOR T-GOAT\) IN \(SUBSCENE-OF T-SCENE 2\) AFTER \(ACTIVITY-OF WAITING-TO-WANDER \d+\) ONCE-NOTHING-MOVES-HER-IN \(\(SUBSCENE-OF T-SCENE 2\) \(SUBSCENE-OF T-SCENE 1\)\) BECAUSE \(SO THAT THE CHANGES ARE APPARENT THESIS 126\)\)/);
  assert.equal(run("(ask (subscene-of t-scene 2) collect items memorized matching (revival-repair: %))"),
    "((REVIVAL-REPAIR: WHAT NOTHING-TO-DO WAS (STANDS-STILL T-GOAT) NOW (WANDER-WHILE-CHANGES-RUN T-GOAT) BECAUSE (SO THAT THE CHANGES ARE APPARENT THESIS 126)))");
});

test("her changes run while ACTION's list of what is still running has one of hers", () => {
  const { run } = lisp();
  run("(define t-part something)");
  assert.equal(run("(still-running-list? (append-atoms 'actions-still-running- 7))"), "T");
  assert.equal(run("(still-running-list? 'actions-still)"), "NIL");
  // a part that has begun but not yet run its changes (no list yet): they are to run
  assert.equal(run("(changes-still-running? 't-goat 't-part)"), "T");
  run("(setq :t-list (append-atoms 'actions-still-running- 7))"); // ACTION's own names are made so, uninterned
  run("(ask t-part set your ,:t-list to ((and (activity-of x 1)) (ask t-goat gradually change by 1.5 factor for speed at high speed)))");
  assert.equal(run("(changes-still-running? 't-goat 't-part)"), "T");
  assert.equal(run("(changes-still-running? 't-troll 't-part)"), "NIL");
  // once hers has ended, taken off the list
  run("(ask t-part set your ,:t-list to ((and (activity-of x 1))))");
  assert.equal(run("(changes-still-running? 't-goat 't-part)"), "NIL");
});

test("the film waits while a wander SEEN planned is waiting or walking: its wandering plan knows its waiting plan", () => {
  const { run } = withAScene();
  const plan = run("(ask ,(ask wander-while-changes-run make interned offspring) plan wander-while-changes-run t-goat in (subscene-of t-scene 2))");
  assert.match(run(`(waiting-plan-of '${plan})`), /^\(ACTIVITY-OF WAITING-TO-WANDER \d+\)$/);
  assert.equal(run("(waiting-plan-of '(activity-of wandering-while-changing 3))"), "NIL");
  // Director's stop is extended once ACTION loads, beside REVIVE;CHSHOW's if CHANGE is on
  run("(load '|ken;action >|)");
  assert.equal(run("(get 'seen-film-waits 'revival-done)"), "T");
});

test("Ken's Cinderella as in 1978 has still stretches: the Meeting's joys at 24 frames a second, and two repeats unwinding at 4", () => {
  const meeting24 = whyTheyAct(json("reports/film/24fps/meeting.glass.json"), json("reports/film/24fps/meeting.film.json"), { fps: 24 });
  assert.deepEqual(meeting24.stills.map((s) => [s.part, s.from, s.to, s.kind]), [["(subscene-of meeting 7)", 900, 1049, "only-changes"]]);
  const joy = meeting24.stills[0];
  assert.equal(joy.parasiteOn, "(subscene-of meeting 6)");
  assert.deepEqual([...new Set(joy.changes.map((c) => c.character))].sort(), ["cinderella", "prince"]);
  // a change by 2 at high speed: Ani's estimate 2.5 seconds an e-fold, Director's 10
  const pathLength = joy.changes.find((c) => c.form === "(gradually change by 2.0 factor for path-length at high speed)");
  assert.deepEqual([pathLength.aniSeconds, pathLength.directorSeconds], [1.73, 6.93]);
  assert.deepEqual(joy.after.sort(), ["(activity-of moving-towards-each-other 7)", "(activity-of moving-towards-each-other 8)"].sort());
  const introduction = whyTheyAct(json("reports/pass2/introduction.glass.json"), json("reports/film/introduction.film.json"));
  assert.deepEqual(introduction.stills.map((s) => [s.part, s.from, s.to, s.kind, s.repeat]), [["(subscene-of introduction 3)", 139, 149, "repeat-unwinding", 10]]);
  const meeting = whyTheyAct(json("reports/pass2/meeting.glass.json"), json("reports/film/meeting.film.json"));
  assert.deepEqual(meeting.stills.map((s) => [s.part, s.from, s.to, s.kind, s.repeat]), [["(subscene-of meeting 2)", 79, 86, "repeat-unwinding", 8]]);
  assert.deepEqual(stillStretches(json("reports/film/kept-apart.film.json")), []);
});

test("the revival's walks end on the picture, by the recorder's own segments (Ken's testing: Cinderella was on the picture)", () => {
  // the beautified scene: Cinderella's last walk of the transformation ends at frame 89 at
  // Director's (-339.37, 195.05), which is on the picture, near its top left (as Ken tested
  // it; with FIT, since Ken's decisions of 16 and 17 October, at frame 95, at (-196.82,
  // 176.71))
  const glass = json("reports/ext/change/beautified-film/cinderella-beautified.glass.json");
  const film = json("reports/ext/change/beautified-film/cinderella-beautified.film.json");
  assert.deepEqual(walksOffThePicture(glass, film, { fps: 4 }), []);
  // and a character none of whose lines reach the picture is off it
  const last = film.frames.length - 1;
  const cut = { ...film, frames: film.frames.map((fr, i) => (i === 95 ? { ...fr, segs: { ...fr.segs, cinderella: undefined } } : fr)) };
  const off = walksOffThePicture(glass, cut, { fps: 4 });
  assert.ok(off.some((w) => w.character === "cinderella" && w.frame === 95), JSON.stringify(off));
  assert.ok(last > 95);
});

test("why an activity lasts as long as it does: its task, method, estimate, part, stops and how it ended", () => {
  const why = whyTheyAct(json("reports/pass2/meeting.glass.json"), json("reports/film/meeting.film.json"));
  assert.deepEqual(why.scene, { length: "long", lengthBounds: [30, 75], runningTime: why.scene.runningTime, mood: why.scene.mood, rhythm: why.scene.rhythm });
  const walk = why.activities.find((a) => a.plan === "(activity-of moving-towards-each-other 7)");
  assert.equal(walk.method, "(move-to-each-other prince cinderella)");
  assert.equal(walk.by, "DISPLY");
  assert.equal(walk.task, "convey-task-11");
  assert.equal(walk.part, 6);
  assert.deepEqual(walk.estimate, { ideal: 1.3333333, least: 0.53333333, most: 4 });
  assert.ok(walk.stops.some((s) => s.kind === "when-there"));
  const part = why.parts.find((p) => p.n === 6);
  assert.deepEqual([part.runningTime, part.stretchedBy], [4.7990692, 3.5993019]);
  // the joys' part extends it, beginning 3.07 seconds after it, its parasite
  assert.deepEqual([why.parts[6].parasiteOn, why.parts[6].beginTime], ["(subscene-of meeting 6)", "(after (beginning-of (subscene-of meeting 6)) 3.0662013)"]);
  const task = why.tasks.find((t) => t.name === "convey-task-11");
  assert.equal(task.kind, "convey");
  assert.ok(task.allocatedTime.length === 2 && task.share > 0 && task.scores);
  // the turns are repeated eight times
  const turn = why.activities.find((a) => a.plan === "(activity-of turn-character 1)");
  assert.equal(turn.repeated, 8);
  assert.equal(turn.method.split(" ")[0], "(alternately-turn");
  assert.equal(turn.film.spans.length, 8);
  // the hitting in the Introduction stops after each hit
  const intro = whyTheyAct(json("reports/pass2/introduction.glass.json"), json("reports/film/introduction.film.json"));
  const hit = intro.activities.find((a) => a.plan === "(activity-of hitting-other 1)");
  assert.equal(hit.repeated, 10);
  assert.ok(hit.stops.some((s) => s.kind === "after-a-hit"));
});
