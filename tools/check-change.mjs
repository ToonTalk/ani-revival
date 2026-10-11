// Check REVIVE;CHANGE, characters who change (reports/chapter-x/PLAN.md, item 3, stage
// 3), against its goldens in reports/ext/change/ (its README explains each). That CHANGE
// leaves Ken's Cinderella byte for byte as in 1978 is tools/check-1978.mjs's
// (--extensions change); test/change.test.js checks the pieces quickly. This asserts:
//   - held, nothing changed: Ani's own pass 1 with every choice held but one
//     character's, and no change made, chooses that character's choices again exactly
//     as CP 29 has them, for each of Ken's four (so a fresh look changes only what a
//     change brings about);
//   - the fresh looks (each: the story's pass 1, CP 29's 102 choices by name and
//     value; Ani's fresh look at whoever the scene changes; the full recompute beside
//     it), against reports/ext/change/fresh-look/<case>.json, and the plan's facts:
//       repents      the stepmother from evil and mean to good and kind
//                    (test/stories/change-of-heart.lisp): path-curvature low to high,
//                    path-length medium to long, path-jaggedness medium to low,
//                    acceleration high to medium, her three attractions turned round,
//                    her deliberateness held (the Prince's is held at medium); a full
//                    recompute would also make the Prince more deliberate;
//       socializes   Cinderella from shy to brazen (test/stories/socializing.lisp):
//                    speed low to medium and two attractions; a full recompute would
//                    also change three speeds and two attractions of the others;
//       beautified   Ken's cinderella-beautified (cindy.46:94-105, uncommented as the
//                    film description is read, in memory only): shabby to elegant
//                    changes nothing, as his footnote predicts (thesis L4354-4355);
//   - the two stories end to end, at 4 frames a second, with MEND, APPEAR and CHANGE,
//     as the film page makes them: every scene films and ends; each scene's program,
//     summary, glass box, film and POSIT file, each BECOME file, and the run's record
//     of each change, against reports/ext/change/<story>/; and the scene after the
//     change planned and filmed again without learning who she has become (from the
//     same positions), so that moves-differently.json shows which of her elements the
//     program carries differently and what Director then did differently.
// Usage: node tools/check-change.mjs [--quick] [--save] [--only repents,...]
//   --quick  only the fresh looks and the held control (about four minutes, not twelve)
//   --save   write the goldens instead of comparing them, after the facts are checked
//   --only   these cases only (held, repents, socializes, beautified,
//            change-of-heart, socializing)
// Prints each check with ok or FAIL; exits non-zero if any fails.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot, pass1, pass2, film, makeFilm, freshLook, recomputeEveryone, changeRecord, storyOutline, storyPlan } from "../src/pipeline.js";
import { choicesOfText, choicesOfItsFile, compareChoices } from "./choices.mjs";

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] || "" : null; };
const quick = args.includes("--quick");
const save = args.includes("--save");
const only = opt("--only") ? opt("--only").split(",") : null;
const wanted = (name) => !only || only.includes(name);
const DIR = "reports/ext/change";
const read = (path) => readFileSync(path, "utf8");
const t0 = Date.now();
let failures = 0;
function check(what, problem, seconds = null) {
  const time = seconds === null ? "" : ` (${seconds.toFixed(1)}s)`;
  if (problem) {
    failures++;
    console.log(`FAIL   ${what}${time}: ${problem}`);
  } else console.log(`ok     ${what}${time}`);
}
function firstDifference(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return `they differ at character ${i} of ${a.length} (expected ${b.length}): ${JSON.stringify(a.slice(Math.max(0, i - 30), i + 50))}`;
}
const same = (a, b) => (a === b ? null : firstDifference(a, b));
const timed = (f) => { const t = Date.now(); const value = f(); return { value, seconds: (Date.now() - t) / 1000 }; };
// A golden: written with --save, else compared.
function golden(what, path, text) {
  if (save) {
    mkdirSync(path.slice(0, path.lastIndexOf("/")), { recursive: true });
    writeFileSync(path, text);
    return console.log(`saved  ${what} as ${path}`);
  }
  check(`${what} as ${path}`, existsSync(path) ? same(text, read(path)) : "there is no such file (make it with --save)");
}
const textIn = (fs, dir, fn1, fn2) => {
  const e = fs.find({ dir, fn1, fn2 });
  return e ? fs.textOf(e) : "";
};
const show = (x) => (Array.isArray(x) ? `(${x.map(show).join(" ")})` : String(x));

// Ken's CINDY 46 with his cinderella-beautified uncommented, as the film description is
// read: nothing under original/ changes.
export function beautifiedCindy() {
  const cindy = readFileSync("original/7005017/cindy.46", "latin1");
  const start = cindy.indexOf(";;(define cinderella-beautified");
  const end = cindy.indexOf("(define no-longer-kept-apart");
  const block = cindy.slice(start, end).split("\n").map((l) => l.replace(/^;;/, "")).join("\n");
  return cindy.slice(0, start) + block + cindy.slice(end);
}
const storyText = (name) => read(`test/stories/${name}.lisp`).replace(/\r\n/g, "\n");
function withCindy(text) {
  const fs = makeProjectFileSystem();
  fs.addFile("KEN", "CINDY", "47", { text, origin: "check-change" });
  return fs;
}

console.log(`REVIVE;CHANGE against ${DIR}${quick ? ", without the films" : ""}${save ? " (saving the goldens)" : ""}\n`);

// ---------------------------------------------------------------- held, nothing changed
if (wanted("held")) {
  const cp29 = choicesOfItsFile("original/7005017/cp.29");
  for (const character of ["cinderella", "step-mother", "prince", "fairy-godmother"]) {
    const r = timed(() => {
      const fs = makeProjectFileSystem();
      const L = boot(fs, { extensions: ["change"] });
      L.evalString("(load '|ken;datest >|)");
      L.evalString("(init-as-of 'introduction)"); // no change up to it
      L.evalString(`(hold-everyone-but '(${character}) '((ken) cp 29))`);
      L.evalString("(z)");
      // saved as pass 1 saves its answers, and read as check-1978 reads them
      L.evalString("(save-answers '((ken) cp 31))");
      const ours = choicesOfText(textIn(fs, "KEN", "CP", "31"));
      return { c: compareChoices(cp29, ours), against: L.print(L.evalString(":change-held-against")) };
    });
    const { c, against } = r.value;
    check(`held, nothing changed: ${character} chosen again, everyone else held: CP 29's ${c.same} of ${cp29.size}`,
      c.same === cp29.size && against === "NIL" ? null : `${c.differ.length} differ (${c.differ.slice(0, 3).map((d) => d.join(" ")).join("; ")}), held against ${against}`, r.seconds);
  }
}

// ---------------------------------------------------------------- the fresh looks
// Each story's pass 1, then the fresh look and the full recompute of its changing scene.
function lookAt(text, scene, extensions) {
  const fs = withCindy(text);
  const p1 = timed(() => pass1(fs, { extensions }));
  const plan = storyPlan(storyOutline(text), { change: true });
  const s = plan.scenes.find((x) => x.id === scene);
  const look = timed(() => freshLook(fs, scene, { plan, extensions }));
  const recompute = timed(() => recomputeEveryone(fs, scene, { plan, extensions }));
  const record = changeRecord(look.value, recompute.value, s);
  return { fs, p1, look, recompute, record, become: textIn(fs, "KEN1", s.become.toUpperCase(), "BECOME") };
}
const valuesOf = (record, character) => Object.fromEntries(record.characters.find((c) => c.character === character).values.map((v) => [v.element, v]));
// Each element that changed, element: [before, after], as printed.
const changedOf = (record, character) => Object.fromEntries(record.characters.find((c) => c.character === character).values.filter((v) => v.changed).map((v) => [v.element, [show(v.before), show(v.after)]]));
const knockOnsOf = (record) => record.recompute.knockOns.map((k) => `${show(k.choicePoint)} ${show(k.before)} ${show(k.after)}`).sort();
const sameObject = (a, b) => (JSON.stringify(a) === JSON.stringify(b) ? null : `got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`);
const recordJSON = (record) => JSON.stringify(record, null, 1) + "\n";

const CASES = [
  {
    name: "repents", text: () => storyText("change-of-heart"), scene: "change-of-heart", who: "step-mother",
    changed: {
      "path-jaggedness": ["medium", "low"], "path-curvature": ["low", "high"], "path-length": ["medium", "long"], acceleration: ["high", "medium"],
      "attraction-towards-friends": ["(negative high)", "(positive high)"], "attraction-towards-enemies": ["(negative high)", "(positive high)"], "attraction-towards-strangers": ["(negative medium)", "(positive medium)"],
    },
    held: ["(choice-point-of prince deliberateness) medium high"],
    knockOns: ["(choice-point-of prince deliberateness) medium high"],
  },
  {
    name: "socializes", text: () => storyText("socializing"), scene: "learning", who: "cinderella",
    changed: { speed: ["low", "medium"], "attraction-towards-enemies": ["(negative medium)", "(positive medium)"], "attraction-towards-strangers": ["(negative high)", "(positive high)"] },
    knockOns: [
      "(choice-point-of fairy-godmother attraction-towards-enemies) (positive medium) (positive low)", "(choice-point-of fairy-godmother speed) medium high",
      "(choice-point-of prince attraction-towards-enemies) (positive low) (negative high)", "(choice-point-of prince speed) high medium", "(choice-point-of step-mother speed) high medium",
    ],
  },
  { name: "beautified", text: beautifiedCindy, scene: "cinderella-beautified", who: "cinderella", changed: {}, held: [], knockOns: [] },
];
const cp29 = choicesOfItsFile("original/7005017/cp.29");
const freshLooks = {};
for (const k of CASES) {
  if (!wanted(k.name)) continue;
  const r = lookAt(k.text(), k.scene, ["change"]);
  const ours = choicesOfText(textIn(r.fs, "KEN", "CP", "30"));
  const c = compareChoices(cp29, ours);
  check(`${k.name}: pass 1, CP 29's ${c.same} of ${cp29.size} choices by name and value`, c.same === cp29.size && ours.size === cp29.size ? null : `${c.differ.length} differ, ${c.onlyA.length} missing, ${c.onlyB.length} extra`, r.p1.seconds);
  check(`${k.name}: the fresh look at ${k.who} after ${k.scene} changes ${Object.keys(k.changed).length ? Object.entries(k.changed).map(([e, [a, b]]) => `${e} ${a} to ${b}`).join(", ") : "nothing"}`,
    sameObject(changedOf(r.record, k.who), k.changed), r.look.seconds);
  if (k.held) check(`${k.name}: the others' choices held that would have come out differently: ${k.held.join("; ") || "none"}`, sameObject(r.record.held.map((h) => `${show(h.choicePoint)} ${show(h.heldAt)} ${show(h.wouldHaveChosen)}`), k.held));
  check(`${k.name}: a full recompute would also change ${k.knockOns.length ? k.knockOns.join("; ") : "no one else"}`, sameObject(knockOnsOf(r.record), k.knockOns), r.recompute.seconds);
  check(`${k.name}: the BECOME file says so`, k.changed && Object.keys(k.changed).every((e) => new RegExp(`\\(${e.toUpperCase()} ${k.changed[e][1].toUpperCase().replace(/[()]/g, "\\$&")}\\)`).test(r.become.split("NEW-VALUES")[1] || "")) ? null : r.become.slice(0, 300));
  golden(`${k.name}: the fresh look's record`, `${DIR}/fresh-look/${k.name}.json`, recordJSON(r.record));
  golden(`${k.name}: the BECOME file`, `${DIR}/fresh-look/${k.name}.become`, r.become);
  freshLooks[k.name] = r.record;
}

// ---------------------------------------------------------------- the stories end to end
const EXTENSIONS = ["mend", "appear", "change"];
const STORIES = [
  { name: "change-of-heart", look: "repents", after: "kind-again", who: "step-mother" },
  { name: "socializing", look: "socializes", after: "the-dance", who: "cinderella" },
];
// The root special dynamics of a character in each subscene of a program, as pass 2
// saved them (run.65:113-117): { "<subscene>": { element: value } }.
function dynamicsIn(program, character) {
  const out = {};
  const re = new RegExp(`^\\(DEFINE \\(SPECIAL-DYNAMICS-OF ${character.toUpperCase()} IN \\(SUBSCENE-OF ([A-Z0-9-]+) (\\d+)\\)\\) SPECIAL-DYNAMICS (.*)$`, "gm");
  for (const m of program.matchAll(re)) {
    const values = {};
    for (const s of m[3].matchAll(/\(SET YOUR ([A-Z-]+) TO ([A-Z]+)\)/g)) values[s[1].toLowerCase()] = s[2].toLowerCase();
    out[`(subscene-of ${m[1].toLowerCase()} ${m[2]})`] = values;
  }
  return out;
}
// How far a character went on the picture, in TV dots, frame to frame while visible.
function distanceIn(f, character) {
  let d = 0, last = null;
  for (const fr of f.frames) {
    const c = fr.chars[character];
    if (!c || !c.state || !c.visible) { last = null; continue; }
    if (last) d += Math.hypot(c.state[0] - last[0], c.state[1] - last[1]);
    last = c.state;
  }
  return Math.round(d);
}
// How much a character turned, in degrees, frame to frame while visible: with its
// distance, how curved its paths were.
function turningIn(f, character) {
  let t = 0, last = null;
  for (const fr of f.frames) {
    const c = fr.chars[character];
    if (!c || !c.state || !c.visible) { last = null; continue; }
    if (last !== null) t += Math.abs((((c.state[2] - last) % 360) + 540) % 360 - 180);
    last = c.state[2];
  }
  return Math.round(t);
}
const WEIGHT = { low: 0.5, short: 0.5, medium: 1, high: 2, long: 2 }; // INTERF's weightify (interf.149:899-904)
if (!quick) {
  for (const st of STORIES) {
    if (!wanted(st.name)) continue;
    const text = storyText(st.name);
    // as the film page makes a film of a story: its text the next version of KEN;CINDY
    const fs = makeProjectFileSystem();
    const plan = storyPlan(storyOutline(text), { looks: true, change: true });
    const r = timed(() => makeFilm(fs, { description: text, extensions: EXTENSIONS, frames: 600, fps: 4 }));
    const run = r.value;
    check(`${st.name}: made with ${EXTENSIONS.join(", ")}: ${run.scenes.map((s) => `${s.id} ${s.film ? s.film.frames.length : "failed"}`).join(", ")} frames`,
      run.scenes.every((s) => s.film && s.film.frames.length <= 600) ? null : "a scene failed or never ended", r.seconds);
    const dir = `${DIR}/${st.name}`;
    for (const s of plan.scenes) {
      const done = run.scenes.find((x) => x.id === s.id);
      if (!done || !done.film) continue;
      const [fn1, fn2] = s.file;
      golden(`${st.name} ${s.id}: KEN;${fn1.toUpperCase()} ${fn2.toUpperCase()}`, `${dir}/ken-${fn1}.${fn2}`, textIn(fs, "KEN", fn1.toUpperCase(), fn2.toUpperCase()));
      golden(`${st.name} ${s.id}: KEN1;${fn1.toUpperCase()} MINI`, `${dir}/ken1-${fn1}.mini`, textIn(fs, "KEN1", fn1.toUpperCase(), "MINI"));
      golden(`${st.name} ${s.id}: the glass box`, `${dir}/${s.id}.glass.json`, JSON.stringify(done.glass, null, 1));
      golden(`${st.name} ${s.id}: the film`, `${dir}/${s.id}.film.json`, JSON.stringify(done.film));
      golden(`${st.name} ${s.id}: KEN1;${s.movie.toUpperCase()} POSIT`, `${dir}/ken1-${s.movie}.posit`, textIn(fs, "KEN1", s.movie.toUpperCase(), "POSIT"));
      if (s.become) golden(`${st.name} ${s.id}: KEN1;${s.become.toUpperCase()} BECOME`, `${dir}/ken1-${s.become}.become`, textIn(fs, "KEN1", s.become.toUpperCase(), "BECOME"));
    }
    const changes = Object.fromEntries(Object.entries(run.changes || {}).map(([k, v]) => [k, v]));
    golden(`${st.name}: the run's record of each change`, `${dir}/changes.json`, JSON.stringify(changes, null, 1) + "\n");
    // the fresh look made in the film is the one made with CHANGE alone
    const inFilm = Object.values(changes)[0];
    if (freshLooks[st.look]) check(`${st.name}: the fresh look in the film chose as with CHANGE alone (${st.look})`, sameObject(inFilm.characters.map((c) => c.values), freshLooks[st.look].characters.map((c) => c.values)));
    // the scene after the change, planned and filmed again from the same positions
    // without learning who she has become
    const after = plan.scenes.find((x) => x.id === st.after);
    const before = plan.scenes[plan.scenes.indexOf(after) - 1];
    const fs2 = withCindy(text);
    fs2.addFile("KEN", "CP", "30", { text: textIn(fs, "KEN", "CP", "30"), origin: "the film's pass 1" });
    fs2.addFile("KEN1", before.movie.toUpperCase(), "POSIT", { text: textIn(fs, "KEN1", before.movie.toUpperCase(), "POSIT"), origin: "the film" });
    const p2 = pass2(fs2, after.id, { plan, extensions: EXTENSIONS, becomes: [] });
    const f2 = film(fs2, after.id, { plan, extensions: EXTENSIONS, frames: 600, fps: 4 }).film;
    const withBecome = { program: textIn(fs, "KEN", after.file[0].toUpperCase(), after.file[1].toUpperCase()), film: run.scenes.find((x) => x.id === after.id).film, glass: run.scenes.find((x) => x.id === after.id).glass };
    const without = { program: textIn(fs2, "KEN", after.file[0].toUpperCase(), after.file[1].toUpperCase()), film: f2, glass: p2.glass };
    const dWith = dynamicsIn(withBecome.program, st.who), dWithout = dynamicsIn(without.program, st.who);
    const elements = {};
    for (const [sub, values] of Object.entries(dWith)) {
      for (const [e, v] of Object.entries(values)) {
        const was = (dWithout[sub] || {})[e];
        if (was !== undefined && was !== v) (elements[sub] ||= {})[e] = { without: was, with: v, factor: WEIGHT[v] / WEIGHT[was] };
      }
    }
    const taskPlan = (glass) => glass.tasks.map((t) => `${t.name} ${(/description (\(.*\)) for-who /.exec(t.variables.task || "") || [])[1]}: ${t.variables.status || t.variables["current-choice"]}`);
    const moves = {
      scene: after.id, character: st.who, became: Object.keys(changes)[0],
      frames: { with: withBecome.film.frames.length, without: without.film.frames.length },
      distance: { with: distanceIn(withBecome.film, st.who), without: distanceIn(without.film, st.who) },
      turning: { with: turningIn(withBecome.film, st.who), without: turningIn(without.film, st.who) },
      // the moves REVIVE;MEND12 stopped while the scene was filmed, those that never end
      repairs: { with: (withBecome.film.repairs || []).map((r) => r.note), without: (without.film.repairs || []).map((r) => r.note) },
      specialDynamics: elements,
      plan: { with: taskPlan(withBecome.glass), without: taskPlan(without.glass) },
    };
    // the elements Director draws that her fresh look changed (ELEMENT_USE)
    const expected = Object.entries(changedOf(inFilm, st.who)).filter(([e]) => ["speed", "path-curvature", "path-length", "path-jaggedness"].includes(e));
    const first = Object.values(elements)[0] || {};
    check(`${st.name}: in ${after.id} the program moves ${st.who} as she has become: ${expected.map(([e, [a, b]]) => `${e} ${b}, not ${a}`).join("; ")}`,
      expected.length && expected.every(([e, [a, b]]) => first[e] && first[e].with === b && first[e].without === a) ? null : `the special dynamics differ in ${JSON.stringify(elements)}`);
    golden(`${st.name}: how ${st.who} moves in ${after.id}, with and without who she has become`, `${dir}/moves-differently.json`, JSON.stringify(moves, null, 1) + "\n");
  }
}

const total = ((Date.now() - t0) / 1000).toFixed(0);
console.log(failures ? `\n${failures} check${failures > 1 ? "s" : ""} FAILED (${total} s)` : `\nall checks ok (${total} s)`);
process.exit(failures ? 1 : 0);
