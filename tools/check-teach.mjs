// Check Teach Ani end to end (REVIVE;TEACH, src/teach.js; reports/chapter-x/design-teaching.md,
// its "Tests" and "What the probes found"; reports/ext/teach/README.md): stories made with a
// learner's notebooks (reports/ext/teach/notebooks/) by src/pipeline.js makeFilm at 4 frames
// a second, held to what the design's probes found and to goldens in
// reports/ext/teach/<example>/summary.json. The examples:
//   grumpy-unknown     Ken's Cinderella with the stepmother grumpy for mean, a word Ani
//                      doesn't know (test/teach/grumpy-cindy.lisp), MEND and KNOW: her
//                      attraction towards enemies falls to the film's variety, (positive
//                      high), and the Introduction is 226 frames
//   grumpy             the same, with "grumpy is like mean": the contract golden (design
//                      section 10): pass 1's 102 choices are CP 29's, and every scene's
//                      frames are KNOW's goldens' (reports/ext/know), Ken's film with "mean"
//   grumpy-slow        and "a grumpy character's speed is low, medium": her speed medium,
//                      grumpy's low met strong's high, the only one of 102 to change; her
//                      walk to hit Cinderella 7.32 to 12.5 seconds; the Introduction 234
//   helps-with         Ken's own story, Ani as in 1978 with MEND, and "helping can look like
//                      going along with" (also-show): the helping 1978 canceled is shown by
//                      goes-to-and-accompanys, the only task to change; the Introduction 229
//                      frames (192 in 1978)
//   jealous-unknown    Ken's Cinderella with the stepmother jealous and is-jealous-of
//                      Cinderella too (test/teach/jealous-cindy.lisp), unknown words, MEND,
//                      KNOW and APPEAR: the Introduction 222 frames
//   jealous            and the notebook "green is jealous": she is green, her paths jagged
//                      (high), 2 of 156 choices changed; her is-jealous-of's following set
//                      aside, Ken's CHOMET keeping only a way two of her words suggest at once
//                      (pushing: dominates and hates; chomet.123:588-596); the Introduction 235
//   jealous-only       is-jealous-of her only word for Cinderella: she follows her
//   grumpiness         a feeling a learner teaches (speed down, paths more jagged), felt by
//                      the troll alone: shown
//   grumpiness-and-joy felt with joy: Ani's check warns, and Ken's CHOMET rejects the
//                      conflicting changes of speed (chomet.123:464), as KNOW's first pride
//   teases             a verb a learner teaches, a kind of chasing, shown as chasing: the
//                      troll chases the goat (chases-to), 11 frames
// For each: Ani's own check of the notebooks (src/pipeline.js checkKnowledge) passes, every
// piece heard; what the knowledge did (yourKnowledgeDid) is as the example says; with an
// example to compare with, what it changed (knowledgeChanges); and the golden, summary.json:
// the choices, each scene's frames (their number and a hash), events and tasks, what the
// knowledge did and what it changed. Then a rehearsal (src/pipeline.js rehearse) of one piece
// of each kind of test/teach/all-kinds.ani-knowledge.json, with MEND, KNOW and APPEAR: each
// heard, each in under 60 seconds.
// Usage: node tools/check-teach.mjs [example ...] [--save] [--no-rehearsals]
//   --save  write each example's summary.json instead of comparing it, after its checks
// Prints each check with ok or FAIL and its time; exits non-zero if any fails.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { SCENES, makeFilm, checkKnowledge, yourKnowledgeDid, knowledgeChanges, rehearse } from "../src/pipeline.js";

const args = process.argv.slice(2);
const save = args.includes("--save");
const rehearsals = !args.includes("--no-rehearsals");
const read = (path) => readFileSync(path, "utf8");
const notebookOf = (name) => JSON.parse(read(`reports/ext/teach/notebooks/${name}.ani-knowledge.json`));
const t0 = Date.now();
let failures = 0;
function check(what, problem, seconds = null) {
  const time = seconds === null ? "" : ` (${seconds.toFixed(1)}s)`;
  if (problem) {
    failures++;
    console.log(`FAIL   ${what}${time}: ${problem}`);
  } else console.log(`ok     ${what}${time}`);
}
const is = (a, b) => (JSON.stringify(a) === JSON.stringify(b) ? null : `${JSON.stringify(a)}, not ${JSON.stringify(b)}`);
const hash = (t) => { let h = 0x811c9dc5; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(36); };
const cpOf = (run, who, element) => (run.choicePoints || []).find((c) => JSON.stringify(c.name) === JSON.stringify(["choice-point-of", who, element]));
const sceneOf = (run, id) => (run.scenes || []).find((s) => s.id === id) || {};
const taskOf = (run, scene, description) => ((sceneOf(run, scene).glass || {}).tasks || []).find((t) => (t.variables.task || "").startsWith(`(task: description ${description} `));
const pieceOf = (did, id) => did.pieces.find((p) => p.piece === id) || {};

// Ken's 1978 film, as the goldens have it (app/data/pass1.json, reports/pass2, reports/film)
const ken1978 = {
  choicePoints: JSON.parse(read("app/data/pass1.json")).choicePoints,
  scenes: SCENES.map((id) => ({ id, glass: JSON.parse(read(`reports/pass2/${id}.glass.json`)), film: JSON.parse(read(`reports/film/${id}.film.json`)) })),
};
ken1978.choices = ken1978.choicePoints.length;

const EXAMPLES = [
  {
    id: "grumpy-unknown", story: "test/teach/grumpy-cindy.lisp", notebooks: [], extensions: ["mend", "know"], scenes: ["introduction"],
    expect(r) {
      check("grumpy-unknown: 102 choices", is(r.choices, 102));
      check("grumpy-unknown: the stepmother's attraction towards enemies (positive high), by the film's variety alone (Ken's mean: (negative high))", is(cpOf(r, "step-mother", "attraction-towards-enemies").currentChoice, ["positive", "high"]));
      check("grumpy-unknown: the Introduction 226 frames", is(sceneOf(r, "introduction").film.frames.length, 226));
    },
  },
  {
    id: "grumpy", story: "test/teach/grumpy-cindy.lisp", notebooks: ["grumpy"], extensions: ["mend", "know"], scenes: null,
    expect(r, did) {
      const ken = new Map(ken1978.choicePoints.map((c) => [JSON.stringify(c.name), JSON.stringify(c.currentChoice)]));
      const differ = r.choicePoints.filter((c) => ken.get(JSON.stringify(c.name)) !== JSON.stringify(c.currentChoice));
      check(`grumpy: pass 1's ${r.choices} choices are CP 29's (app/data/pass1.json)`, r.choices === 102 && !differ.length ? null : `${differ.length} differ: ${differ.slice(0, 3).map((c) => JSON.stringify(c.name)).join(", ")}`);
      for (const e of ["attraction-towards-enemies", "attraction-towards-strangers"]) {
        const kept = JSON.stringify(cpOf(r, "step-mother", e).memory);
        check(`grumpy: the stepmother's ${e} says (neighbor-of grumpy mean)`, kept.includes('["neighbor-of","grumpy","mean"]') ? null : kept);
      }
      for (const id of SCENES) {
        const golden = JSON.parse(read(`reports/ext/know/${id}.film.json`));
        const s = sceneOf(r, id);
        check(`grumpy: ${id}'s ${s.film ? s.film.frames.length : "no"} frames are KNOW's with "mean" (reports/ext/know/${id}.film.json, ${golden.frames.length})`, s.film && JSON.stringify(s.film.frames) === JSON.stringify(golden.frames) && JSON.stringify(s.film.events) === JSON.stringify(golden.events) ? null : s.error || "they differ");
      }
      check("grumpy: KNOW's sharing borrows mean's hurting and chasing for grumpy (both chosen)", is((sceneOf(r, "introduction").glass.borrowed || []).map((b) => [b.word, b.neighbor, b.way, b.chosen]), [["grumpy", "mean", "(hurts step-mother cinderella)", true], ["grumpy", "mean", "(chases step-mother cinderella)", true]]));
      check("grumpy: the piece won", is(pieceOf(did, "k1").state, "won"));
    },
  },
  {
    id: "grumpy-slow", story: "test/teach/grumpy-cindy.lisp", notebooks: ["grumpy-slow"], extensions: ["mend", "know"], scenes: ["introduction"], before: "grumpy",
    expect(r, did, changes) {
      check("grumpy-slow: the stepmother's speed medium", is(cpOf(r, "step-mother", "speed").currentChoice, "medium"));
      check("grumpy-slow: the only one of 102 choices to change", is(changes.pass1.changed.map((c) => [c.choicePoint, c.before, c.after, c.pieces]), [[["choice-point-of", "step-mother", "speed"], "high", "medium", ["n1 k2"]]]));
      const k2 = pieceOf(did, "k2");
      check("grumpy-slow: grumpy's low met strong's high in the middle", is([k2.state, k2.places[0] && k2.places[0].against], ["combined", [{ value: "high", strength: "medium", source: "strong" }]]));
      const hit = changes.scenes[0].tasks.find((t) => t.description === "(hurts step-mother cinderella)");
      check("grumpy-slow: her walk to hit Cinderella 7.32 to 12.5 seconds", is(hit && [hit.before.runningTime, hit.after.runningTime], [7.32, 12.5]));
      check("grumpy-slow: the Introduction 225 to 234 frames", is(changes.scenes[0].frames, { before: 225, after: 234 }));
    },
  },
  {
    id: "helps-with", story: "ken", notebooks: ["helps-with"], extensions: ["mend"], scenes: ["introduction"], before: "1978",
    expect(r, did, changes) {
      const t = taskOf(r, "introduction", "(helps cinderella prince)");
      check("helps-with: Cinderella's helping the Prince shown by goes-to-and-accompanys", t && t.variables["current-choice"].startsWith("((goes-to-and-accompanys cinderella prince") ? null : t && t.variables["current-choice"]);
      check("helps-with: no choice of pass 1 changed", is(changes.pass1.changed.length, 0));
      check("helps-with: no other task changed", is(changes.scenes[0].tasks.map((x) => x.description), ["(helps cinderella prince)"]));
      check("helps-with: the Introduction 192 to 229 frames", is(changes.scenes[0].frames, { before: 192, after: 229 }));
      check("helps-with: the piece won", is(pieceOf(did, "k1").state, "won"));
    },
  },
  {
    id: "jealous-unknown", story: "test/teach/jealous-cindy.lisp", notebooks: [], extensions: ["mend", "know", "appear"], scenes: ["introduction"],
    expect(r) {
      check("jealous-unknown: 156 choices", is(r.choices, 156));
      check("jealous-unknown: the stepmother's path-jaggedness medium", is(cpOf(r, "step-mother", "path-jaggedness").currentChoice, "medium"));
      check("jealous-unknown: the Introduction 222 frames", is(sceneOf(r, "introduction").film.frames.length, 222));
    },
  },
  {
    id: "jealous", story: "test/teach/jealous-cindy.lisp", notebooks: ["jealous"], extensions: ["mend", "know", "appear"], scenes: ["introduction"], before: "jealous-unknown",
    expect(r, did, changes) {
      check("jealous: 2 of 156 choices changed, her path-jaggedness and hue", is(changes.pass1.changed.map((c) => [c.choicePoint[2], c.after, c.pieces]), [["path-jaggedness", "high", ["n1 k2"]], ["color-hue", "green", ["n1 k3"]]]));
      check("jealous: her path-jaggedness won, strong's low set aside as much less strongly suggested", is([pieceOf(did, "k2").state, pieceOf(did, "k2").places[0].reason], ["won", "much-less-strongly-suggested"]));
      check("jealous: green, from jealous", is(pieceOf(did, "k3").state, "won"));
      const k5 = pieceOf(did, "k5");
      check("jealous: her following set aside: CHOMET keeps pushing, which dominates and hates both suggest (chomet.123:588-596)", is([k5.state, k5.places[0] && k5.places[0].reason, k5.places[0] && k5.places[0].chosen], ["lost", "not-related", ["pushes"]]));
      check("jealous: the Introduction 222 to 235 frames", is(changes.scenes[0].frames, { before: 222, after: 235 }));
    },
  },
  {
    id: "jealous-only", story: "test/teach/jealous-only-cindy.lisp", notebooks: ["jealous"], extensions: ["mend", "know", "appear"], scenes: ["introduction"],
    expect(r, did) {
      const k5 = pieceOf(did, "k5");
      check("jealous-only: with is-jealous-of her only word for Cinderella, she follows her", is([k5.state, k5.places[0] && k5.places[0].chosen], ["won", ["follows"]]));
      const t = taskOf(r, "introduction", "(follows step-mother cinderella)");
      check("jealous-only: shown by follows-behind", t && t.variables["current-choice"].startsWith("((follows-behind step-mother cinderella") ? null : t && t.variables["current-choice"]);
    },
  },
  {
    id: "grumpiness", story: "test/teach/grumpiness.lisp", notebooks: ["grumpiness"], extensions: ["mend", "know"], scenes: null, warns: ["k1 cancels-joy"],
    expect(r, did) {
      const k1 = pieceOf(did, "k1");
      check("grumpiness: the troll's speed goes down and his paths grow jagged", is(k1.places.map((x) => [x.element, x.state]), [["speed", "won"], ["path-jaggedness", "won"]]));
    },
  },
  {
    id: "grumpiness-and-joy", story: "test/teach/grumpiness-and-joy.lisp", notebooks: ["grumpiness"], extensions: ["mend", "know"], scenes: null, warns: ["k1 cancels-joy"],
    expect(r, did) {
      const k1 = pieceOf(did, "k1");
      check("grumpiness-and-joy: the speed going down rejected with joy's going up (chomet.123:464); the jaggedness made", is(k1.places.map((x) => [x.element, x.state, x.reason || null, (x.against || []).map((a) => a.source)]), [["speed", "lost", "conflict", ["joy"]], ["path-jaggedness", "won", null, []]]));
    },
  },
  {
    id: "teases", story: "test/teach/teases.lisp", notebooks: ["teases"], extensions: ["mend", "know"], scenes: null,
    expect(r, did) {
      const t = taskOf(r, "on-the-bridge", "(teases troll goat)");
      check("teases: the troll teases the goat, shown as chasing (chases-to)", t && t.variables["current-choice"].startsWith("((chases-to troll goat") ? null : t ? t.variables["current-choice"] : "no chases task");
      check("teases: 11 frames", is(sceneOf(r, "on-the-bridge").film && sceneOf(r, "on-the-bridge").film.frames.length, 11));
      check("teases: the piece won", is(pieceOf(did, "k1").state, "won"));
    },
  },
];

const wanted = args.filter((a) => !a.startsWith("--"));
for (const w of wanted) if (!EXAMPLES.some((e) => e.id === w)) throw new Error(`no example ${w}; the examples: ${EXAMPLES.map((e) => e.id).join(", ")}`);
// an example's example to compare with is made too
const chosen = new Set(wanted.length ? wanted : EXAMPLES.map((e) => e.id));
for (const e of EXAMPLES) if (chosen.has(e.id) && e.before && e.before !== "1978") chosen.add(e.before);

// What's kept in an example's golden: the choices, each scene's frames, events and tasks,
// what the knowledge did and what it changed.
function summary(e, r, did, changes) {
  return {
    example: e.id, story: e.story, notebooks: e.notebooks, extensions: e.extensions,
    choices: r.choices, choiceValues: Object.fromEntries(r.choicePoints.map((c) => [JSON.stringify(c.name), c.currentChoice])),
    scenes: r.scenes.map((s) => s.error ? { id: s.id, error: s.error } : {
      id: s.id, frames: s.film.frames.length, framesHash: hash(JSON.stringify(s.film.frames)), events: s.film.events,
      tasks: s.glass.tasks.map((t) => [t.name, t.variables.task, t.variables["current-choice"] || null, t.variables.status || null, t.variables["running-time"] || null]),
    }),
    did: did.pieces.map(({ words, because, title, ...p }) => p),
    ...(changes ? { changes: { pass1: changes.pass1, scenes: changes.scenes } } : {}),
  };
}

console.log(`Teach Ani: ${[...chosen].join(", ")}${rehearsals ? ", and the rehearsals" : ""}\n`);
const runs = new Map([["1978", ken1978]]);
for (const e of EXAMPLES) {
  if (!chosen.has(e.id)) continue;
  const notebooks = e.notebooks.map(notebookOf);
  const fs = makeProjectFileSystem();
  if (notebooks.length) {
    const tc = Date.now();
    const c = checkKnowledge(fs, notebooks, { extensions: e.extensions });
    check(`${e.id}: Ani's check of the notebook passes, every piece heard`, c.ok && c.notebooks.every((n) => Object.values(n.pieces).every((p) => p.heard)) ? null : JSON.stringify(c.notebooks.map((n) => n.refused)), (Date.now() - tc) / 1000);
    check(`${e.id}: its warnings`, is(c.notebooks.flatMap((n) => n.warnings.map((w) => `${w.piece} ${w.code}`)), e.warns || []));
  }
  const t = Date.now();
  let r;
  try {
    r = makeFilm(fs, { description: e.story === "ken" ? null : read(e.story).replace(/\r\n/g, "\n"), extensions: e.extensions, scenes: e.scenes, keepGoing: true, frames: 1000, fps: 4, ...(notebooks.length ? { knowledge: notebooks } : {}) });
  } catch (err) {
    check(`${e.id}: made`, `stopped: ${err.message}`, (Date.now() - t) / 1000);
    continue;
  }
  check(`${e.id}: made (${r.scenes.map((s) => `${s.id} ${s.error ? "FAILED" : s.film.frames.length}`).join(", ")})`, r.scenes.some((s) => s.error) ? r.scenes.find((s) => s.error).error : null, (Date.now() - t) / 1000);
  runs.set(e.id, r);
  const did = yourKnowledgeDid(r);
  const changes = e.before && runs.has(e.before) ? knowledgeChanges(runs.get(e.before), r) : null;
  try {
    e.expect(r, did, changes);
  } catch (err) {
    check(`${e.id}: its checks`, `stopped: ${err.stack}`);
  }
  if (!wanted.length || wanted.includes(e.id)) {
    const text = JSON.stringify(summary(e, r, did, changes), null, 1) + "\n";
    const path = `reports/ext/teach/${e.id}/summary.json`;
    if (save) {
      mkdirSync(`reports/ext/teach/${e.id}`, { recursive: true });
      writeFileSync(path, text);
      console.log(`saved  ${e.id}: ${path}`);
    } else check(`${e.id}: as ${path}`, !existsSync(path) ? "there is no such file (make it with --save)" : text === read(path) ? null : (() => { const g = read(path); let i = 0; while (i < text.length && text[i] === g[i]) i++; return `they differ at character ${i}: ${JSON.stringify(text.slice(Math.max(0, i - 40), i + 60))}`; })());
  }
}

// ---------------------------------------------------------------- rehearsals
if (rehearsals) {
  const all = JSON.parse(read("test/teach/all-kinds.ani-knowledge.json"));
  const kinds = new Set();
  for (const piece of all.pieces) {
    if (kinds.has(piece.kind)) continue;
    kinds.add(piece.kind);
    const r = rehearse(makeProjectFileSystem(), piece, [all], { extensions: ["mend", "know", "appear"] });
    check(`rehearsal of ${piece.id} (${piece.kind}): Ani heard it (${r.error ? "stopped" : r.outcome ? r.outcome.state : "no outcome"}), in under 60 seconds`,
      r.error ? r.error : !r.outcome || r.outcome.state === "never-reached" ? `never reached: ${r.outcome && r.outcome.why}` : r.seconds >= 60 ? `${r.seconds.toFixed(1)} s` : null, r.seconds);
  }
}

const total = ((Date.now() - t0) / 1000).toFixed(0);
console.log(failures ? `\n${failures} check${failures > 1 ? "s" : ""} FAILED (${total} s)` : `\nall checks ok (${total} s)`);
process.exit(failures ? 1 : 0);
