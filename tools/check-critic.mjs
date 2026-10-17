// Check REVIVE;CRITIC end to end (reports/chapter-x/design-criticism.md, stages C1-C3):
// Ken's Cinderella remade with criticism, each example from the film as it was
// (tools/critic-base.mjs: as in 1978, or with KNOW and SLIPS) by src/pipeline.js
// remakeFilm at 4 frames a second, held to what Ken's lines say should happen and to
// its goldens in reports/ext/critic/<example>/ (README.md there says what each did, and
// why). The examples:
//   nlka-too-quick       Ken's first remedy for No Longer Kept Apart (p. 69): "allocate
//                        more time for this scene" (C2)
//   nlka-start-far       his second: "have the fairy godmother start far from
//                        Cinderella" (C3)
//   nlka-both            both (C2, C3)
//   intro-apart          his footnote on the Introduction's subscene (d) (p. 64):
//                        "Cinderella is not to meet the Prince until the third scene"
//                        (C3), with Ken's knowledge
//   intro-apart-slips    the same, with KNOW and SLIPS, where Ani picks "something else
//                        to establish Cinderella's personality"; the plan holds them
//                        apart and the film of Kept Apart does not (README.md)
//   intro-apart-slips-far  and the Prince starting far from Cinderella in Kept Apart too
//   nlka-veto            "not this way": goes-to-and-accompanys vetoed in No Longer Kept
//                        Apart (C1, how it is shown)
//   intro-convey-veto    "show something else": accompanys vetoed in establishing
//                        Cinderella's personality (C1, what is shown), with Ken's knowledge
//   intro-convey-veto-know  the same, with KNOW, which has a way to show helping
//   ka-too-slow          Kept Apart's guarding part too slow, once and three times (C2)
//   meeting-apart        Cinderella and the Prince kept apart in the Meeting, a scene that
//                        is them together (C3)
// and the cases the review of 17 October found wrong, so that they stay right:
//   ka-veto-guard        "not this way" on the stepmother's guarding in Kept Apart: Ani
//                        stops in Ken's unfinished chases-to (disply.311:95-111), and the
//                        remake keeps the film as it was from there, its files whole
//                        (M1): "couldn't be made"
//   nlka-veto-quick      a veto and "too quick" in No Longer Kept Apart: the part longer
//                        than with the veto alone, paced on the time Ken's scene-wide
//                        adjustment gave it (M2)
//   ka-apart-alone       Cinderella and the Prince kept apart in Kept Apart alone: nothing
//                        to set aside, judged from the film (M3): met at 4 frames a second,
//                        partly at 24
//   nlka-far-from-other  the fairy godmother to start far from the stepmother, whom PLACE
//                        never places her with: not met, from the film (M3)
//   nlka-veto-none       both of the godmother's ways vetoed: no other way, not met (M3)
//   nlka-joy-far         start far where SCENE redoes the part (a feeling after it): heeded
//                        again (M4), from Ken's story with that feeling added
//   meeting-far          Cinderella to start far from the Prince in the Meeting, where she
//                        is on the stage already when they are placed: not heeded, said so,
//                        not met (M5)
// and CRITIC with FIT (REVIVE;FIT, Ken's decisions of 16 and 17 October), from Ken's
// Cinderella made with FIT (reports/ext/fit), where No Longer Kept Apart is held to its
// least, 10 seconds:
//   nlka-too-quick-fit   "too quick" on the godmother's part: paced from the 10 seconds FIT
//                        gave it, 15, within the scene's 10 to 25: met
//   nlka-too-slow-fit    "too slow" on it: the scene already at its least, the pace keeps it
//                        within its length-bounds, as FIT does: not met, held to them, and
//                        the scene kept
// For each, besides its own checks: the scenes before the first criticized are kept,
// not planned again; every scene from it on is planned again, and one whose program is
// unchanged keeps its film; the record's every criticism leaves a note where Ani heeded
// it, or the outcome says why not; and the goldens: summary.json (the record, what was
// remade, and src/pipeline.js criticismChanges), and for each scene planned again its
// glass box, and for each filmed again its film and program.
// Usage: node tools/check-critic.mjs [example ...] [--save] [--fps 24 [--make-base]]
//   --save   write the goldens instead of comparing them (after the other checks)
//   --fps 24 Ken's two examples (nlka-too-quick, nlka-start-far, nlka-both and
//            intro-apart) at 24 frames a second, as the film was shot, from the film
//            at 24 (tools/critic-base.mjs film1978at24), against reports/ext/critic/24fps/
//   --make-base  with --fps 24, first make the whole film at 24 frames a second, check
//            its frames and events against reports/film/24fps, and keep its files as
//            reports/ext/critic/24fps/base-files.json (about 15 minutes)
// Prints each check with ok or FAIL; exits non-zero if any fails. 35 to 55 minutes.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { remakeFilm, criticismChanges, contactsIn, closestApproach, taskDescription, whyTheyAct, SCENES, EXTENSIONS } from "../src/pipeline.js";
import { film1978, film1978at24, filmWith, BASE_24 } from "./critic-base.mjs";
import { makeFilm } from "../src/pipeline.js";

const args = process.argv.slice(2);
const save = args.includes("--save");
const fpsAt = args.indexOf("--fps");
const fps = fpsAt >= 0 ? Number(args[fpsAt + 1]) : 4;
if (fps !== 4 && fps !== 24) throw new Error("--fps is 4 (the default) or 24");
const frameCap = fps === 24 ? 6000 : 1000;
const only = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--fps");
// the stages built: C1 with REVIVE;CRITIC, C2 with CRITPC, C3 with CRITSC
const criticFiles = EXTENSIONS.find((e) => e.id === "critic").files;
const BUILT = { C1: true, C2: criticFiles.includes("critpc"), C3: criticFiles.includes("critsc") };

const NLKA = "(undoes fairy-godmother (from-scene kept-apart (convey (prevents step-mother (meets cinderella prince)))))";
const GUARD = "(prevents step-mother (meets cinderella prince))";
const FRIENDLY = "(personality cinderella)";
const you = (said) => ({ by: "you", said });
const PACE = { id: "c1", kind: "pace", scene: "no-longer-kept-apart", tasks: [NLKA], direction: "too-quick", times: 1, ...you("Too quick: allocate more time for this scene") };
const SLOW = { ...PACE, direction: "too-slow", ...you("Too slow") };
const FAR = { id: "c2", kind: "start-far", scene: "no-longer-kept-apart", who: "fairy-godmother", from: "cinderella", ...you("Have the fairy godmother start far from Cinderella") };
const APART = { id: "c1", kind: "keep-apart", scenes: ["introduction", "kept-apart"], between: ["cinderella", "prince"], ...you("Cinderella is not to meet the Prince until the third scene") };

const read = (p) => readFileSync(p, "utf8");
const VETO = (id, task, vetoes) => ({ id, kind: "another-way", scene: "no-longer-kept-apart", task, level: "display", vetoes, ...you("Not this way: another way") });
// Ken's story with a feeling after No Longer Kept Apart's undoing (a part SCENE redoes by
// extending the one before, extend-last-actions-of, scene.9:224-240), made to that scene
// with its files kept, as a film to remake
function nlkaJoy() {
  const cindy = readFileSync("original/7005017/cindy.46", "latin1");
  const undoing = /\(convey \(undoes fairy-godmother\s+\(from-scene kept-apart\s+\(convey \(prevents step-mother\s+\(meets cinderella prince\)\)\)\)\)\)/;
  if (!undoing.test(cindy)) throw new Error("Ken's No Longer Kept Apart has no undoing to add a feeling after");
  const story = cindy.replace(undoing, (m) => `(sequence: ${m} (establish (emotional-state cinderella (joy (positive high)))))`);
  const made = makeFilm(makeProjectFileSystem(), { description: story, scenes: ["introduction", "kept-apart", "no-longer-kept-apart"], keepFiles: true, fps, frames: frameCap });
  return { ...made, description: story };
}
let failures = 0;
function check(what, problem) {
  if (problem) {
    failures++;
    console.log(`FAIL   ${what}: ${problem}`);
  } else console.log(`ok     ${what}`);
}
const expectEqual = (what, got, want) => check(`${what}: ${JSON.stringify(want)}`, JSON.stringify(got) === JSON.stringify(want) ? null : `got ${JSON.stringify(got)}`);

// The scene of a remade film, its glass box's task with that description, and so on.
const sceneOf = (run, id) => run.scenes.find((s) => s.id === id);
const taskOf = (scene, description) => scene.glass.tasks.find((t) => taskDescription(t) === description);
const howOf = (run) => Object.fromEntries(run.remade.scenes.map((s) => [s.id, s.how]));
const frames = (run, id) => sceneOf(run, id).film.frames.length;
const outcome = (changes, id) => (changes.criticism.find((c) => c.id === id) || {}).outcome;
// The walks of a scene's plan that bring a and b together.
const together = (scene, a, b) => contactsIn(scene.glass).filter((c) => [c.a, c.b].sort().join() === [a, b].sort().join());

const EXAMPLES = [
  {
    name: "nlka-too-quick", fps24: true, stages: "C2", base: "1978", record: [PACE],
    check(run, ch, prev) {
      expectEqual("remade from No Longer Kept Apart, the two before kept", howOf(run), { introduction: "kept", "kept-apart": "kept", "no-longer-kept-apart": "refilmed", meeting: "refilmed", justice: "refilmed" });
      const t = taskOf(sceneOf(run, "no-longer-kept-apart"), NLKA);
      const was = Number(taskOf(sceneOf(prev, "no-longer-kept-apart"), NLKA).variables["running-time"]);
      check(`the godmother's part given half as long again (${was} seconds), within its allocated time`, Math.abs(Number(t.variables["running-time"]) - 1.5 * was) < 0.01 ? null : `running time ${t.variables["running-time"]}`);
      expectEqual("its walks stretched by SCENE as it stretches every part", sceneOf(run, "no-longer-kept-apart").glass.subscenes[0].variables["stretched-by"], "1.5");
      expectEqual("met", outcome(ch, "c1"), "met");
      check("longer than 1978's", frames(run, "no-longer-kept-apart") > frames(prev, "no-longer-kept-apart") ? null : "not longer");
    },
  },
  {
    name: "nlka-start-far", fps24: true, stages: "C3", base: "1978", record: [{ ...FAR, id: "c1" }],
    check(run, ch) {
      expectEqual("remade from No Longer Kept Apart", howOf(run)["no-longer-kept-apart"], "refilmed");
      const scene = sceneOf(run, "no-longer-kept-apart");
      const where = scene.glass.subscenes[0].variables["(location-of fairy-godmother)"] || "";
      check("she is placed far from Cinderella and off the stage, by PLACE", /offstage/.test(where) ? null : where);
      firstSeenOffThePicture(scene.film, "fairy-godmother");
      check("her first walk is to Cinderella", together(scene, "fairy-godmother", "cinderella").length ? null : "no walk to her");
      expectEqual("met", outcome(ch, "c1"), "met");
    },
  },
  {
    name: "nlka-both", fps24: true, stages: "C2 C3", base: "1978", record: [PACE, FAR],
    check(run, ch, prev) {
      const scene = sceneOf(run, "no-longer-kept-apart");
      firstSeenOffThePicture(scene.film, "fairy-godmother");
      expectEqual("both met", [outcome(ch, "c1"), outcome(ch, "c2")], ["met", "met"]);
      check("longer than either remedy alone would make it, and than 1978's", frames(run, "no-longer-kept-apart") > frames(prev, "no-longer-kept-apart") ? null : "not longer");
    },
  },
  {
    name: "intro-apart", fps24: true, stages: "C3", base: "1978", record: [APART],
    check(run, ch) {
      expectEqual("the Introduction planned and filmed again; Kept Apart on planned again and kept, unless necessary no other parts of the film", howOf(run), { introduction: "refilmed", "kept-apart": "unchanged", "no-longer-kept-apart": "unchanged", meeting: "unchanged", justice: "unchanged" });
      const intro = sceneOf(run, "introduction");
      const t = taskOf(intro, FRIENDLY);
      check("accompanying the Prince set aside, as a prerequisite not met that names the criticism", (t.variables["rejected-suggestions"].match(/kept-apart-by-you cinderella prince c1/g) || []).length === 1 && /accompanys cinderella prince/.test(t.variables["rejected-suggestions"]) ? null : t.variables["rejected-suggestions"].slice(0, 300));
      // with Ken's knowledge Ani has no way of showing helping, so the contact table's
      // helps (KNOW's helps-along) doesn't count here: Ani picks it, as Ken's footnote says
      // it would pick something else, and can't show it, as in 1978
      expectEqual("with Ken's knowledge, Ani picks something else to establish Cinderella's personality: helping the Prince", t.variables["current-choice"], "((method: type convey value (helps cinderella prince)))");
      expectEqual("which Ani as in 1978 has no way to show (cant-do, as in 1978)", taskOf(intro, "(helps cinderella prince)").variables.status, "cant-do");
      if (fps === 4) keptApart(run, ch, ["introduction", "kept-apart"]);
      else {
        // at 24 frames a second Kept Apart, 1978's own film, has the guard's prisoner
        // escape to within 0.308 of the Prince (README.md): partly met
        keptApart(run, ch, ["introduction"]);
        keptApart(run, ch, ["kept-apart"], { plan: true });
        nearByEscape(run, ch, "kept-apart", 0.3);
      }
    },
  },
  {
    name: "intro-apart-slips", stages: "C3", base: "slips", record: [APART],
    check(run, ch) {
      const intro = sceneOf(run, "introduction");
      const t = taskOf(intro, FRIENDLY);
      const chosen = intro.glass.tasks.map((x) => x.variables["current-choice"] || "").join(" ");
      check("Ani picks something else to establish Cinderella's personality: she helps her stepmother", /\(helps-along cinderella step-mother/.test(chosen) ? null : chosen.slice(0, 300));
      check("and follows her", /\(follows-behind cinderella step-mother/.test(chosen) ? null : "no follows-behind");
      check("the personality task is not cant-do", t.variables.status !== "cant-do" ? null : "cant-do");
      keptApart(run, ch, ["introduction"]);
      // Kept Apart: the plan holds them apart, the film does not (README.md): the Prince,
      // never on the stage in the Introduction now, starts Kept Apart at the center,
      // where Ken's save-positions put him (aninit.65:158-173), near enough that there is
      // no cut, and Cinderella, the guard's prisoner, escapes towards him
      // (plan-stands-guard-cycle, disply.311:465-473) before the stepmother stops her
      keptApart(run, ch, ["kept-apart"], { plan: true });
      nearByEscape(run, ch, "kept-apart", 0);
      const prince = sceneOf(run, "kept-apart").glass.subscenes[0].variables["(location-of prince)"] || "";
      check("the Prince starts Kept Apart where the Introduction's POSIT file put him, never on the stage there", /ended up here in introduction/.test(prince) && !sceneOf(run, "introduction").film.frames.some((f) => f.segs.prince) ? null : prince);
    },
  },
  {
    name: "intro-apart-slips-far", stages: "C3", base: "slips",
    record: [APART, { id: "c2", kind: "start-far", scene: "kept-apart", who: "prince", from: "cinderella", ...you("Have the Prince start far from Cinderella in Kept Apart") }],
    check(run, ch) {
      const where = sceneOf(run, "kept-apart").glass.subscenes[0].variables["(location-of prince)"] || "";
      check("the Prince placed far from Cinderella and off the stage, by PLACE", /offstage/.test(where) ? null : where);
      keptApart(run, ch, ["introduction"]);
      keptApart(run, ch, ["kept-apart"], { plan: true });
      // started far, they come less close, but the guard's prisoner still escapes towards
      // him: the start-far met, the keep-apart partly
      nearByEscape(run, ch, "kept-apart", 0.2);
      expectEqual("start far met, keep apart partly", [outcome(ch, "c1"), outcome(ch, "c2")], ["partly", "met"]);
    },
  },
  {
    name: "nlka-veto", stages: "C1", base: "1978", record: [{ id: "c1", kind: "another-way", scene: "no-longer-kept-apart", task: NLKA, level: "display", vetoes: "goes-to-and-accompanys", ...you("Not this way: another way") }],
    check(run, ch) {
      const t = taskOf(sceneOf(run, "no-longer-kept-apart"), NLKA);
      check("another way: the godmother chases the stepmother off", /^\(\(chases-to fairy-godmother step-mother/.test(t.variables["current-choice"]) ? null : t.variables["current-choice"]);
      check("the way vetoed set aside with Ken's reject-suggestion, vetoed by you", /reason \(vetoed-by-you c1\) suggestion \(suggestion: .*goes-to-and-accompanys/.test(t.variables["rejected-suggestions"]) ? null : "not in rejected-suggestions");
      check("stands-guard still set aside by Ken's own reason", /reason \(prerequisites-not-met \(\(faster fairy-godmother step-mother\)\)\)/.test(t.variables["rejected-suggestions"]) ? null : "not so");
      expectEqual("met", outcome(ch, "c1"), "met");
    },
  },
  {
    name: "intro-convey-veto", stages: "C1", base: "1978", record: [{ id: "c1", kind: "another-way", scene: "introduction", task: FRIENDLY, level: "convey", vetoes: "accompanys", ...you("Show something else") }],
    check(run, ch) {
      const intro = sceneOf(run, "introduction");
      const t = taskOf(intro, FRIENDLY);
      check("what is shown: helping alone is left", /^\(\(method: type convey value \(helps cinderella prince\)\)\)$/.test(t.variables["current-choice"]) ? null : t.variables["current-choice"]);
      check("which Ken's knowledge has no way to show: cant-do, as in 1978", taskOf(intro, "(helps cinderella prince)").variables.status === "cant-do" ? null : "not cant-do");
      check("nothing accompanies anyone in the Introduction", intro.glass.tasks.every((x) => !/goes-to-and-accompanys/.test(x.variables["current-choice"] || "")) ? null : "goes-to-and-accompanys chosen");
      expectEqual("met", outcome(ch, "c1"), "met");
    },
  },
  {
    name: "intro-convey-veto-know", stages: "C1", base: "know", record: [{ id: "c1", kind: "another-way", scene: "introduction", task: FRIENDLY, level: "convey", vetoes: "accompanys", ...you("Show something else") }],
    check(run, ch) {
      const intro = sceneOf(run, "introduction");
      check("with KNOW, helping is shown, by helps-along", /\(helps-along cinderella prince/.test(taskOf(intro, "(helps cinderella prince)").variables["current-choice"] || "") ? null : "not helps-along");
      expectEqual("met", outcome(ch, "c1"), "met");
    },
  },
  {
    name: "ka-too-slow", stages: "C2", base: "1978", record: [{ id: "c1", kind: "pace", scene: "kept-apart", tasks: [GUARD], direction: "too-slow", times: 1, ...you("Too slow") }],
    check(run, ch, prev) {
      const t = taskOf(sceneOf(run, "kept-apart"), GUARD);
      const [lo] = t.variables["allocated-time"].slice(1, -1).split(" ").map(Number);
      expectEqual("the guarding shortened, to the least its allocated time allows", Number(t.variables["running-time"]), lo);
      expectEqual("partly met: held to the story's time for it", outcome(ch, "c1"), "partly");
      // and said three times, at its bound already: not met
      const thrice = remakeFilm(makeProjectFileSystem(), { previous: run, criticism: [{ ...this.record[0], times: 3 }], from: "kept-apart" });
      const t3 = taskOf(sceneOf(thrice, "kept-apart"), GUARD);
      expectEqual("said three times, no shorter", Number(t3.variables["running-time"]), lo);
      expectEqual("three times, from the film already at its bound: not met (no quicker than the film remade from)", outcome(criticismChanges(run, thrice), "c1"), "not-met");
      // a part that already takes the least time the story gives it: not met
      const prince = "(accompanys prince cinderella)";
      const atBound = remakeFilm(makeProjectFileSystem(), { previous: prev, criticism: [{ id: "c1", kind: "pace", scene: "meeting", tasks: [prince], direction: "too-slow", times: 1, ...you("Too slow") }] });
      const changes = criticismChanges(prev, atBound);
      expectEqual("the Meeting's Prince accompanying Cinderella, at its least already: not met", outcome(changes, "c1"), "not-met");
      check("and its note says it was held to the time the story gives it", /held-to \(allocated-time/.test(changes.criticism[0].notes.map((n) => n.because).join(" ")) ? null : JSON.stringify(changes.criticism[0].notes));
      expectEqual("the Meeting planned again, the same program, its film kept", howOf(atBound).meeting, "unchanged");
    },
  },
  {
    name: "meeting-apart", stages: "C3", base: "1978", record: [{ id: "c1", kind: "keep-apart", scenes: ["meeting"], between: ["cinderella", "prince"], ...you("Keep Cinderella and the Prince apart in the Meeting") }],
    check(run, ch, prev) {
      const meeting = sceneOf(run, "meeting");
      // its parts: the convey tasks of 1978's Meeting, each gone or cant-do now, or made
      const parts = sceneOf(prev, "meeting").glass.tasks.filter((t) => t.variables.parent === "convey-task").map(taskDescription);
      const now = new Map(meeting.glass.tasks.map((t) => [taskDescription(t), t.variables.status || "made"]));
      const lost = parts.filter((d) => !now.has(d) || now.get(d) === "cant-do");
      check(`most of the Meeting can't be made without bringing them together: ${lost.length} of its ${parts.length} parts`, lost.length * 2 > parts.length ? null : `lost only ${lost.join(", ")}`);
      check("the film is made", meeting.film && meeting.film.frames.length ? null : "no film");
      keptApart(run, ch, ["meeting"], { plan: true });
      // they start the Meeting together, where No Longer Kept Apart left them, and nothing
      // in Ani moves two apart: partly met
      const near = ch.criticism[0].closest[0];
      const first = sceneOf(prev, "no-longer-kept-apart").film;
      const atEnd = closestApproach({ ...first, frames: first.frames.slice(-1) }, "cinderella", "prince");
      check(`they start the Meeting together (${near.distance}), as No Longer Kept Apart left them (${atEnd && atEnd.distance}): partly met`, near.distance < 0.33 && atEnd && atEnd.distance < 0.33 && ch.criticism[0].outcome === "partly" ? null : JSON.stringify({ near, atEnd, outcome: ch.criticism[0].outcome }));
    },
  },
  // ---- the review's cases (17 October)
  {
    name: "ka-veto-guard", stages: "C1", base: "1978", stops: true, record: [{ id: "c1", kind: "another-way", scene: "kept-apart", task: GUARD, level: "display", vetoes: "stands-guard", ...you("Not this way: another way") }],
    check(run, ch, prev) {
      expectEqual("Ani stops in Kept Apart, in Ken's unfinished chases-to", run.remade.stopped && [run.remade.stopped.scene, run.remade.stopped.error], ["kept-apart", "break CANT-HANDLE-YET-IN-CHASES-TO-INTIAL-LOCS"]);
      expectEqual("Kept Apart and every scene after it kept as the film remade from had them", howOf(run), { introduction: "kept", "kept-apart": "stopped", "no-longer-kept-apart": "after-stop", meeting: "after-stop", justice: "after-stop" });
      check("each scene's film and glass box the film remade from's", run.scenes.every((s, k) => s.film === prev.scenes[k].film && s.glass === prev.scenes[k].glass) ? null : "a scene differs");
      const lost = Object.keys(prev.files).filter((k) => run.files[k] !== prev.files[k]);
      check("its working files put back: the remade film's files are the film remade from's", lost.length ? `differ: ${lost.join(", ")}` : null);
      expectEqual("couldn't be made: stopped, where and why", [outcome(ch, "c1"), ch.criticism[0].stopped && ch.criticism[0].stopped.scene], ["stopped", "kept-apart"]);
    },
  },
  {
    name: "nlka-veto-quick", stages: "C1 C2", base: "1978", record: [VETO("c1", NLKA, "goes-to-and-accompanys"), { ...PACE, id: "c2" }],
    check(run, ch) {
      const t = taskOf(sceneOf(run, "no-longer-kept-apart"), NLKA);
      const alone = JSON.parse(read("reports/ext/critic/nlka-veto/no-longer-kept-apart.glass.json"));
      const was = Number(taskOf({ glass: alone }, NLKA).variables["running-time"]);
      check(`the chase given half as long again as with the veto alone (${was} seconds), on the time Ken's adjustment of the scene gave it`, Math.abs(Number(t.variables["running-time"]) - 1.5 * was) < 0.01 ? null : `running time ${t.variables["running-time"]}`);
      check("its note says the pace was heeded after Ken's adjustment", (ch.criticism[1].notes.find((n) => n.heeded) || {}).because && /after \(scene-adjusted /.test(ch.criticism[1].notes.find((n) => n.heeded).because) ? null : JSON.stringify(ch.criticism[1].notes));
      const vetoAlone = JSON.parse(read("reports/ext/critic/nlka-veto/summary.json")).changes.scenes.find((s) => s.id === "no-longer-kept-apart").frames.after;
      check(`longer than with the veto alone (${vetoAlone} frames)`, frames(run, "no-longer-kept-apart") > vetoAlone ? null : `${frames(run, "no-longer-kept-apart")} frames`);
      expectEqual("both met, the pace judged by the film: the part ran longer than in 1978", [outcome(ch, "c1"), outcome(ch, "c2")], ["met", "met"]);
      check("the part's film seconds before and after", ch.criticism[1].pace.after.film > ch.criticism[1].pace.before.film ? null : JSON.stringify(ch.criticism[1].pace));
    },
  },
  {
    name: "ka-apart-alone", fps24: true, stages: "C3", base: "1978", record: [{ id: "c1", kind: "keep-apart", scenes: ["kept-apart"], between: ["cinderella", "prince"], ...you("Keep Cinderella and the Prince apart in Kept Apart") }],
    check(run, ch) {
      expectEqual("nothing in Kept Apart brings them together: no note, every scene planned again and kept", [ch.criticism[0].notes.length, howOf(run)["kept-apart"]], [0, "unchanged"]);
      keptApart(run, ch, ["kept-apart"], { plan: true });
      const near = ch.criticism[0].closest[0];
      // judged from the film: met at 4 frames a second (0.345), partly at 24 (0.308, the
      // guard's prisoner escaping towards him)
      const want = fps === 4 ? "met" : "partly";
      expectEqual(`judged by the film, ${near.distance} at frame ${near.frame}: ${want}`, outcome(ch, "c1"), want);
    },
  },
  {
    name: "nlka-far-from-other", stages: "C3", base: "1978", record: [{ id: "c1", kind: "start-far", scene: "no-longer-kept-apart", who: "fairy-godmother", from: "step-mother", ...you("Have the fairy godmother start far from the stepmother") }],
    check(run, ch) {
      expectEqual("PLACE never places her with the stepmother: no note, the scene kept", [ch.criticism[0].notes.length, howOf(run)["no-longer-kept-apart"]], [0, "unchanged"]);
      expectEqual("judged by the film: she is on the picture at once, not met", [ch.criticism[0].start.walkedOn, outcome(ch, "c1")], [false, "not-met"]);
    },
  },
  {
    name: "nlka-veto-none", stages: "C1", base: "1978", record: [VETO("c1", NLKA, "goes-to-and-accompanys"), VETO("c2", NLKA, "chases-to")],
    check(run, ch) {
      expectEqual("no other way left: the godmother's part can't be done", taskOf(sceneOf(run, "no-longer-kept-apart"), NLKA).variables.status, "cant-do");
      expectEqual("both not met: no other way", [outcome(ch, "c1"), outcome(ch, "c2")], ["not-met", "not-met"]);
    },
  },
  {
    name: "nlka-joy-far", stages: "C3", base: "nlkajoy", record: [{ ...FAR, id: "c1" }],
    check(run, ch, prev) {
      const scene = sceneOf(run, "no-longer-kept-apart");
      check("a part of only a feeling after the undoing, which SCENE redoes the undoing's part to show", (sceneOf(prev, "no-longer-kept-apart").glass.subscenes[0].items || []).some((i) => /^\(extra-time-added /.test(i)) ? null : "no extra time added");
      const where = scene.glass.subscenes[0].variables["(location-of fairy-godmother)"] || "";
      check("heeded again in the part SCENE redid: she is placed far from Cinderella and off the stage", /offstage/.test(where) && (scene.glass.criticism || []).some((n) => n.heeded && n.what === "start-far") ? null : where);
      firstSeenOffThePicture(scene.film, "fairy-godmother");
      expectEqual("met", outcome(ch, "c1"), "met");
    },
  },
  {
    // FIT holds No Longer Kept Apart to its least, 10 seconds (its task 3.98, its most 6.95,
    // the part stretched by 2.51); the pace works from the time FIT gave the task, as from
    // Ken's own adjustment, within the task's allocated time and the scene's length-bounds
    name: "nlka-too-quick-fit", stages: "C2", base: "fit", record: [PACE],
    check(run, ch, prev) {
      expectEqual("remade from No Longer Kept Apart, the two before kept", howOf(run), { introduction: "kept", "kept-apart": "kept", "no-longer-kept-apart": "refilmed", meeting: "refilmed", justice: "refilmed" });
      const scene = sceneOf(run, "no-longer-kept-apart");
      const t = taskOf(scene, NLKA);
      const was = Number(taskOf(sceneOf(prev, "no-longer-kept-apart"), NLKA).variables["running-time"]);
      check(`FIT's film gives the godmother's part the scene's least (${was} seconds)`, was === 10 ? null : `${was}`);
      check("the pace makes it half as long again, 15 seconds, within the scene's 10 to 25", Math.abs(Number(t.variables["running-time"]) - 15) < 0.01 && Number(scene.glass.scene.variables["running-time"]) === 15 ? null : `running time ${t.variables["running-time"]}, the scene's ${scene.glass.scene.variables["running-time"]}`);
      const note = (ch.criticism[0].notes.find((n) => n.heeded) || {}).because || "";
      check("paced on the time FIT's hold of the scene gave it (after the scene's adjustment, 4.03 from Ken's 5.97)", /^\(too-quick 1\.5 after \(scene-adjusted 4\.03/.test(note) ? null : note);
      check("FIT's own note kept: the scene held to 10 seconds before the pace", (scene.glass.repairs || []).some((r) => /what scene-time-kept was \(planned 5\.97\) now 10\.0 /.test(r.note)) ? null : "no scene-time-kept note");
      expectEqual("met", outcome(ch, "c1"), "met");
      check("longer than FIT's film", frames(run, "no-longer-kept-apart") > frames(prev, "no-longer-kept-apart") ? null : "not longer");
    },
  },
  {
    name: "nlka-too-slow-fit", stages: "C2", base: "fit", record: [SLOW],
    check(run, ch) {
      const scene = sceneOf(run, "no-longer-kept-apart");
      expectEqual("the godmother's part kept at the scene's least, 10 seconds", taskOf(scene, NLKA).variables["running-time"], "10.0");
      expectEqual("not heeded, held to the scene's length-bounds", ch.criticism[0].notes.map((n) => [n.heeded, n.because]), [[false, "(too-slow 0.66666667 held-to (length-bounds 10.0 25.0) after (scene-adjusted 6.0802))"]]);
      expectEqual("not met", outcome(ch, "c1"), "not-met");
      expectEqual("No Longer Kept Apart planned again, the same program: its film kept, and the rest", howOf(run), { introduction: "kept", "kept-apart": "kept", "no-longer-kept-apart": "unchanged", meeting: "unchanged", justice: "unchanged" });
    },
  },
  {
    name: "meeting-far", stages: "C3", base: "1978", record: [{ id: "c1", kind: "start-far", scene: "meeting", who: "cinderella", from: "prince", ...you("Have Cinderella start far from the Prince") }],
    check(run, ch) {
      const notes = ch.criticism[0].notes;
      expectEqual("not heeded where she is on the stage already, and said so", notes.map((n) => [n.heeded, n.because]), [[false, "(already-in-the-scene)"]]);
      expectEqual("the Meeting planned again, the same program: its film kept", howOf(run).meeting, "unchanged");
      expectEqual("not met", outcome(ch, "c1"), "not-met");
    },
  },
];

// Her first frame on the stage puts her off the picture: she walks on.
function firstSeenOffThePicture(f, who) {
  const k = f.frames.findIndex((fr) => fr.chars[who] && fr.chars[who].visible);
  check(`${who.replace(/-/g, " ")} first seen off the picture (frame ${k}), walking on`, k >= 0 && !f.frames[k].segs[who] ? null : k < 0 ? "never seen" : "on the picture at once");
}

// In the scenes kept apart: no walk of their plans brings the two together, and (unless
// plan, the plan alone) in the films they never come within Ken's small distance
// (place.45:103-105) while both are on the picture.
function keptApart(run, ch, scenes, { plan = false } = {}) {
  for (const id of scenes) {
    const s = sceneOf(run, id);
    const walks = together(s, "cinderella", "prince");
    check(`${id}: no walk of the plan brings Cinderella and the Prince together`, walks.length ? JSON.stringify(walks) : null);
    if (plan) continue;
    const near = closestApproach(s.film, "cinderella", "prince");
    check(`${id}: in the film they never come within Ken's small distance (.33 of the screen)${near ? `; closest ${near.distance}, frame ${near.frame}` : "; never on the picture together"}`, near && near.distance < 0.33 ? `${near.distance} at frame ${near.frame}` : null);
  }
  const c = ch.criticism.find((x) => x.item.kind === "keep-apart");
  check("no contacts left (criticismChanges)", c.contacts.length ? JSON.stringify(c.contacts) : null);
}

// In a scene kept apart whose film still brings them within Ken's small distance: how
// close (at least atLeast), when, that Cinderella was then escaping the guard towards the
// Prince (the guarding's prisoner-escapes, disply.311:465-473), and that the outcome
// says so (partly).
function nearByEscape(run, ch, id, atLeast) {
  const s = sceneOf(run, id);
  const near = ch.criticism[0].closest.find((c) => c.scene === id);
  // her escape running then, or just ended (within half a second): with FIT's S8 and S16
  // in SLIPS the guard keeps her pace, and in intro-apart-slips Cinderella's first escape
  // ends at frame 13, the Prince, walking across as the guard's "more interesting" walk,
  // passing her at 14 (README.md)
  const acts = whyTheyAct(s.glass, s.film).activities.filter((a) => a.characters.includes("cinderella") && a.film && a.film.spans.some((sp) => sp.begin <= near.frame && sp.end >= near.frame - Math.round(fps / 2)));
  check(`${id}: the film brings them within Ken's small distance, ${near.distance} at frame ${near.frame}, as Cinderella escapes the guard towards him: partly met`,
    near.distance !== null && near.distance < 0.33 && near.distance >= atLeast && acts.some((a) => /^\(activity-of prisoner-escapes/.test(a.plan)) && ch.criticism[0].outcome === "partly" ? null : JSON.stringify({ near, acts: acts.map((a) => a.plan), outcome: ch.criticism[0].outcome }));
}

const FILE_KEY = (run, scene) => {
  // the scene's program among the run's files: KEN;<fn1> <fn2>
  const fn = { introduction: "INTROD UCTION", "kept-apart": "KEPT APART", "no-longer-kept-apart": "NO LONGER", meeting: "MEET ING", justice: "JUST ICE" }[scene];
  return { key: `KEN;${fn}`, file: `ken-${fn.toLowerCase().replace(" ", ".")}` };
};

function golden(dir, name, text) {
  const path = `${dir}/${name}`;
  if (save) {
    writeFileSync(path, text);
    return console.log(`saved  ${path}`);
  }
  check(`as ${path}`, !existsSync(path) ? "there is no such file (make it with --save)" : read(path) === text ? null : firstDifference(text, read(path)));
}
function firstDifference(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return `they differ at character ${i} of ${a.length} (expected ${b.length}): ${JSON.stringify(a.slice(Math.max(0, i - 30), i + 50))}`;
}

const t0 = Date.now();
if (fps === 24 && args.includes("--make-base")) {
  // the whole film at 24 frames a second, its files kept, held to reports/film/24fps
  const t = Date.now();
  const made = makeFilm(makeProjectFileSystem(), { fps: 24, frames: frameCap, keepFiles: true });
  for (const s of made.scenes) {
    const golden = JSON.parse(read(`reports/film/24fps/${s.id}.film.json`));
    check(`the film at 24: ${s.id}'s ${s.film.frames.length} frames and its events as reports/film/24fps`, JSON.stringify(s.film.frames) === JSON.stringify(golden.frames) && JSON.stringify(s.film.events) === JSON.stringify(golden.events) ? null : "they differ");
  }
  mkdirSync("reports/ext/critic/24fps", { recursive: true });
  writeFileSync(BASE_24, `${JSON.stringify(made.files, null, 1)}\n`);
  console.log(`saved  ${BASE_24} (${((Date.now() - t) / 1000).toFixed(0)} s)`);
}
const bases = {};
const baseOf = (b) => (bases[b] ||= b === "nlkajoy" ? nlkaJoy() : fps === 24 ? film1978at24() : b === "1978" ? film1978() : filmWith(b));
for (const ex of EXAMPLES) {
  if (only.length && !only.includes(ex.name)) continue;
  if (!ex.stages.split(" ").every((st) => BUILT[st])) continue;
  if (fps === 24 && !ex.fps24) continue;
  console.log(`\n${ex.name}`);
  const previous = baseOf(ex.base);
  const t = Date.now();
  let run;
  try {
    run = remakeFilm(makeProjectFileSystem(), { previous, criticism: ex.record, fps, frames: frameCap, description: previous.description || null });
  } catch (e) {
    check(`${ex.name}: remade`, `stopped: ${e.message}`);
    continue;
  }
  const changes = criticismChanges(previous, run);
  console.log(`       remade in ${((Date.now() - t) / 1000).toFixed(0)} s: ${run.scenes.map((s) => `${s.id} ${howOf(run)[s.id]} ${s.film ? s.film.frames.length : "-"}`).join(", ")}`);
  // what every remake must do
  const first = Math.min(...ex.record.flatMap((c) => (c.kind === "keep-apart" ? c.scenes : [c.scene])).map((s) => SCENES.indexOf(s)));
  run.scenes.forEach((s, k) => {
    const how = howOf(run)[s.id];
    if (k < first) check(`${s.id}: before the first scene criticized, kept as it was`, how === "kept" && s === previous.scenes[k] ? null : how);
    else if (how === "stopped" || how === "after-stop") check(`${s.id}: ${how === "stopped" ? "where Ani stopped" : "after where Ani stopped"}, kept as it was`, s === previous.scenes[k] ? null : "not the scene remade from");
    else {
      check(`${s.id}: planned again`, how === "unchanged" || how === "refilmed" ? null : how);
      if (how === "unchanged") check(`${s.id}: the same program, so the same film`, s.film === previous.scenes[k].film ? null : "a film other than the kept one");
    }
  });
  for (const c of changes.criticism) check(`${c.id} (${c.words}): ${c.outcome}`, c.outcome === "not-reached" ? "nothing it names was planned" : c.outcome === "stopped" && !ex.stops ? `Ani stopped: ${JSON.stringify(c.stopped)}` : null);
  if (!ex.stops) check("Ani didn't stop", run.remade.stopped ? JSON.stringify(run.remade.stopped) : null);
  ex.check(run, changes, previous);
  // the goldens
  const dir = `reports/ext/critic/${fps === 24 ? "24fps/" : ""}${ex.name}`;
  if (save) mkdirSync(dir, { recursive: true });
  golden(dir, "summary.json", JSON.stringify({ base: ex.base, record: ex.record, remade: run.remade, changes }, null, 1) + "\n");
  run.scenes.forEach((s, k) => {
    const how = howOf(run)[s.id];
    if (how === "kept" || how === "stopped" || how === "after-stop") return;
    golden(dir, `${s.id}.glass.json`, JSON.stringify(s.glass, null, 1));
    if (how !== "refilmed") return;
    golden(dir, `${s.id}.film.json`, JSON.stringify(s.film));
    const { key, file } = FILE_KEY(run, s.id);
    golden(dir, file, run.files[key]);
  });
}
const total = ((Date.now() - t0) / 1000).toFixed(0);
console.log(failures ? `\n${failures} check${failures > 1 ? "s" : ""} FAILED (${total} s)` : `\nall checks ok (${total} s)`);
process.exit(failures ? 1 : 0);
