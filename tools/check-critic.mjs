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
// For each, besides its own checks: the scenes before the first criticized are kept,
// not planned again; every scene from it on is planned again, and one whose program is
// unchanged keeps its film; the record's every criticism leaves a note where Ani heeded
// it, or the outcome says why not; and the goldens: summary.json (the record, what was
// remade, and src/pipeline.js criticismChanges), and for each scene planned again its
// glass box, and for each filmed again its film and program.
// Usage: node tools/check-critic.mjs [example ...] [--save]
//   --save   write the goldens instead of comparing them (after the other checks)
// Prints each check with ok or FAIL; exits non-zero if any fails. About fifteen minutes.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { remakeFilm, criticismChanges, contactsIn, closestApproach, taskDescription, whyTheyAct, SCENES, EXTENSIONS } from "../src/pipeline.js";
import { film1978, filmWith } from "./critic-base.mjs";

const args = process.argv.slice(2);
const save = args.includes("--save");
const only = args.filter((a) => !a.startsWith("--"));
// the stages built: C1 with REVIVE;CRITIC, C2 with CRITPC, C3 with CRITSC
const criticFiles = EXTENSIONS.find((e) => e.id === "critic").files;
const BUILT = { C1: true, C2: criticFiles.includes("critpc"), C3: criticFiles.includes("critsc") };

const NLKA = "(undoes fairy-godmother (from-scene kept-apart (convey (prevents step-mother (meets cinderella prince)))))";
const GUARD = "(prevents step-mother (meets cinderella prince))";
const FRIENDLY = "(personality cinderella)";
const you = (said) => ({ by: "you", said });
const PACE = { id: "c1", kind: "pace", scene: "no-longer-kept-apart", tasks: [NLKA], direction: "too-quick", times: 1, ...you("Too quick: allocate more time for this scene") };
const FAR = { id: "c2", kind: "start-far", scene: "no-longer-kept-apart", who: "fairy-godmother", from: "cinderella", ...you("Have the fairy godmother start far from Cinderella") };
const APART = { id: "c1", kind: "keep-apart", scenes: ["introduction", "kept-apart"], between: ["cinderella", "prince"], ...you("Cinderella is not to meet the Prince until the third scene") };

const read = (p) => readFileSync(p, "utf8");
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
    name: "nlka-too-quick", stages: "C2", base: "1978", record: [PACE],
    check(run, ch, prev) {
      expectEqual("remade from No Longer Kept Apart, the two before kept", howOf(run), { introduction: "kept", "kept-apart": "kept", "no-longer-kept-apart": "refilmed", meeting: "refilmed", justice: "refilmed" });
      const t = taskOf(sceneOf(run, "no-longer-kept-apart"), NLKA);
      check("the godmother's part given half as long again, within its allocated time", Math.abs(Number(t.variables["running-time"]) - 1.5 * 3.98) < 0.01 ? null : `running time ${t.variables["running-time"]}`);
      expectEqual("its walks stretched by SCENE as it stretches every part", sceneOf(run, "no-longer-kept-apart").glass.subscenes[0].variables["stretched-by"], "1.5");
      expectEqual("met", outcome(ch, "c1"), "met");
      check("longer than 1978's", frames(run, "no-longer-kept-apart") > frames(prev, "no-longer-kept-apart") ? null : "not longer");
    },
  },
  {
    name: "nlka-start-far", stages: "C3", base: "1978", record: [{ ...FAR, id: "c1" }],
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
    name: "nlka-both", stages: "C2 C3", base: "1978", record: [PACE, FAR],
    check(run, ch, prev) {
      const scene = sceneOf(run, "no-longer-kept-apart");
      firstSeenOffThePicture(scene.film, "fairy-godmother");
      expectEqual("both met", [outcome(ch, "c1"), outcome(ch, "c2")], ["met", "met"]);
      check("longer than either remedy alone would make it, and than 1978's", frames(run, "no-longer-kept-apart") > frames(prev, "no-longer-kept-apart") ? null : "not longer");
    },
  },
  {
    name: "intro-apart", stages: "C3", base: "1978", record: [APART],
    check(run, ch) {
      expectEqual("the Introduction planned and filmed again; Kept Apart on planned again and kept, unless necessary no other parts of the film", howOf(run), { introduction: "refilmed", "kept-apart": "unchanged", "no-longer-kept-apart": "unchanged", meeting: "unchanged", justice: "unchanged" });
      const t = taskOf(sceneOf(run, "introduction"), FRIENDLY);
      expectEqual("with Ken's knowledge, nothing else to establish Cinderella's personality: cant-do", t.variables.status, "cant-do");
      check("both of Ken's ways set aside, as prerequisites not met that name the criticism", (t.variables["rejected-suggestions"].match(/kept-apart-by-you cinderella prince c1/g) || []).length === 2 ? null : t.variables["rejected-suggestions"].slice(0, 300));
      keptApart(run, ch, ["introduction", "kept-apart"]);
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
      expectEqual("three times: partly met, held at the bound again", outcome(criticismChanges(run, thrice), "c1"), "partly");
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
  const acts = whyTheyAct(s.glass, s.film).activities.filter((a) => a.characters.includes("cinderella") && a.film && a.film.spans.some((sp) => sp.begin <= near.frame && sp.end >= near.frame));
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
const bases = {};
const baseOf = (b) => (bases[b] ||= b === "1978" ? film1978() : filmWith(b));
for (const ex of EXAMPLES) {
  if (only.length && !only.includes(ex.name)) continue;
  if (!ex.stages.split(" ").every((st) => BUILT[st])) continue;
  console.log(`\n${ex.name}`);
  const previous = baseOf(ex.base);
  const t = Date.now();
  let run;
  try {
    run = remakeFilm(makeProjectFileSystem(), { previous, criticism: ex.record });
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
    else {
      check(`${s.id}: planned again`, how === "unchanged" || how === "refilmed" ? null : how);
      if (how === "unchanged") check(`${s.id}: the same program, so the same film`, s.film === previous.scenes[k].film ? null : "a film other than the kept one");
    }
  });
  for (const c of changes.criticism) check(`${c.id} (${c.words}): ${c.outcome}`, c.outcome === "not-reached" ? "no note: never heeded" : null);
  ex.check(run, changes, previous);
  // the goldens
  const dir = `reports/ext/critic/${ex.name}`;
  if (save) mkdirSync(dir, { recursive: true });
  golden(dir, "summary.json", JSON.stringify({ base: ex.base, record: ex.record, remade: run.remade, changes }, null, 1) + "\n");
  run.scenes.forEach((s, k) => {
    const how = howOf(run)[s.id];
    if (how === "kept") return;
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
