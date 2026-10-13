// Check that the stress stories still do what test/stories/stress/README.md says they
// do, with MEND and without it, and that MEND and APPEAR together film them too, and
// the extensions the page's switch turns on. Each story in test/stories/stress/, the
// two controls, test/stories/tortoise-and-hare.lisp and red-riding-hood.lisp, and the
// fresh fables in test/stories/fresh/ is made with tools/run-story.mjs as the README
// makes it (the page's "Make the film", at 4 frames a second and at most 1,000 frames a
// scene, the page's 250 seconds), four times: as Ani as in 1978 ("without"), with
// --extensions mend ("with"), with --extensions mend,appear ("with-appear": APPEAR adds
// a kind of choice point that MEND's repairs must step over, and its sizes change
// Director's collisions, so a story films differently), and with --extensions
// mend,appear,change,know ("with-know": the extensions the page's switch turns on, Ken's
// decision 3 of 9 October; KNOW's knowledge gives some stories new ways of showing,
// and its words, feelings and relationships, used by test/stories/stress/know-*.lisp,
// are words and feelings Ani knows). What happened is held
// against test/stories/stress/expected.json. For each story, under each of those
// four, that file gives:
//   exit      run-story's exit status: 0 if every scene filmed and ended, else 1
//   pass1     "ok", or "failed: " and the start of the error pass 1 stopped with
//   scenes    each scene, in order: the frames it filmed; "under the cap", if it ended in
//             however many; "capped", if it hit the cap and never ended; or "failed in
//             pass 2: " or "failed in filming: " and the start of the error (with, for
//             NO-SUCH-ACTOR, what Lisp typed: "GRUMPY is not an actor")
//   finished  how many scenes filmed and ended
//   notes     the repair notes left (REVIVE;WRAP's (revival-repair: what W ...)), by kind
//             W, each with how many: pass 1's, each pass 2's glass box's and the filming's
// An expected error or failure need only be the start of what happened.
// Every story in test/stories/stress/ needs an entry, under its file's name; a story
// kept elsewhere is named by its entry's file. To add one, put it in the folder and run
//   node tools/check-stress.mjs <name> --record
// (or, for a story kept elsewhere, give its file: test/stories/<name>.lisp), which makes
// it each way and writes what it did as its entry, keeping the others. Read it over
// (git diff), and loosen what may change: a scene's frames to "under the cap", say.
// Usage: node tools/check-stress.mjs [name ...] [--modes m,...] [--jobs n] [--record]
//   name      only these stories (by name, as in expected.json, or by file); all by default
//   --modes   only these of without, with, with-appear and with-know (all by default); with
//             --record, the others stay as expected.json has them
//   --jobs    how many runs at once, each a process of its own (default: the cores less two, at most 6)
//   --record  write what each story did into expected.json as its expectations
// Reports each story, ok or FAIL with each difference; exits non-zero on any.
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdtempSync, openSync, closeSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir, availableParallelism } from "node:os";
import { join, basename, relative, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { storyOutline } from "../src/pipeline.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const folder = "test/stories/stress";
const expectedPath = join(root, folder, "expected.json");
const args = process.argv.slice(2);
const valued = new Set(["--jobs", "--modes"]);
const names = args.filter((a, i) => !a.startsWith("--") && !valued.has(args[i - 1]));
const record = args.includes("--record");
const at = args.indexOf("--jobs");
const jobs = at >= 0 ? Math.max(1, Number(args[at + 1]) || 1) : Math.max(1, Math.min(6, availableParallelism() - 2));
const ALL_MODES = [["without", []], ["with", ["--extensions", "mend"]], ["with-appear", ["--extensions", "mend,appear"]], ["with-know", ["--extensions", "mend,appear,change,know"]]];
const label = { without: "without MEND", with: "with MEND", "with-appear": "with MEND and APPEAR", "with-know": "with the page's set" };
const modesAt = args.indexOf("--modes");
const MODES = modesAt >= 0 ? (args[modesAt + 1] || "").split(",").filter(Boolean).map((m) => ALL_MODES.find(([n]) => n === m) || (() => { throw new Error(`no mode ${m}: known are ${ALL_MODES.map(([n]) => n).join(", ")}`); })()) : ALL_MODES;

const expected = existsSync(expectedPath)
  ? JSON.parse(readFileSync(expectedPath, "utf8"))
  : { about: "What each stress story does without MEND, with it, with MEND and APPEAR, and with the extensions the page's switch turns on, MEND, APPEAR, CHANGE and KNOW (tools/check-stress.mjs, which says what each field means).", frames: 1000, fps: 4, stories: {} };
// the stories: those with an entry, in its order, then any in the folder without one
const stories = Object.entries(expected.stories).map(([name, e]) => ({ name, file: e.file || `${folder}/${name}.lisp` }));
for (const f of readdirSync(join(root, folder)).filter((f) => f.endsWith(".lisp")).sort()) {
  const name = basename(f, ".lisp");
  if (!expected.stories[name]) stories.push({ name, file: `${folder}/${f}` });
}
// a story named by its file (test/stories/x.lisp) goes by the file's name
const wanted = names.map((n) => {
  if (!n.endsWith(".lisp")) return n;
  const name = basename(n, ".lisp");
  const file = relative(root, resolvePath(n)).replace(/\\/g, "/");
  if (!stories.some((s) => s.name === name)) stories.push({ name, file });
  else if (stories.find((s) => s.name === name).file !== file) throw new Error(`${name} is already in expected.json, for ${stories.find((s) => s.name === name).file}`);
  return name;
});
for (const n of wanted) if (!stories.some((s) => s.name === n)) throw new Error(`no story ${n}: known are ${stories.map((s) => s.name).join(", ")}`);
const chosen = stories.filter((s) => !wanted.length || wanted.includes(s.name));

// ---------------------------------------------------------------- running them

const tmp = mkdtempSync(join(tmpdir(), "ani-check-stress-"));
const seconds = (t0) => Math.round((Date.now() - t0) / 1000);
// One run of tools/run-story.mjs, in its own process: its exit status and its --out.
function runStory(story, mode, extra) {
  const out = join(tmp, `${story.name}.${mode}.json`);
  const logPath = join(tmp, `${story.name}.${mode}.log`);
  const log = openSync(logPath, "w");
  const t0 = Date.now();
  const child = spawn(process.execPath, [join(root, "tools", "run-story.mjs"), join(root, story.file), ...extra,
    "--frames", String(expected.frames), "--fps", String(expected.fps), "--no-backtrace", "--out", out], { cwd: root, stdio: ["ignore", log, log] });
  closeSync(log); // the child has its own
  return new Promise((done) => {
    child.on("error", (e) => done({ exit: null, error: e.message, logPath, seconds: seconds(t0) }));
    child.on("exit", (code) => {
      let result = null;
      try { result = JSON.parse(readFileSync(out, "utf8")); } catch { /* it stopped before writing */ }
      done({ exit: code, result, logPath, seconds: seconds(t0) });
    });
  });
}

// The start of an error, on one line; for NO-SUCH-ACTOR, with what Lisp typed about it.
function errorOf(error, typed = []) {
  let s = String(error || "").replace(/\s+/g, " ").trim();
  if (/NO-SUCH-ACTOR/.test(s)) {
    // ";warning from ASK: GRUMPY is not an actor --- type (?) for help"
    const said = typed.filter((l) => /is not an actor/.test(l)).pop();
    const m = said && /^(?:.*?: )?(.*? is not an actor)/.exec(said.replace(/\s+/g, " ").trim());
    if (m) s += `, ${m[1]}`;
  }
  return s.length > 110 ? s.slice(0, 110) : s;
}

// What a run did, in expected.json's terms.
function observed(run) {
  const r = run.result;
  if (!r) return { exit: run.exit, crashed: run.error || "run-story wrote no result" };
  const p = r.pass1;
  const o = { exit: run.exit, pass1: !p ? "never ran" : p.ok ? "ok" : `failed: ${errorOf(p.error, p.typed)}` };
  o.scenes = {};
  for (const s of r.scenes) {
    o.scenes[s.id] = s.ok ? (s.capped ? "capped" : s.frames) : `failed in ${s.failedIn === "film" ? "filming" : "pass 2"}: ${errorOf(s.error, s.typed)}`;
  }
  o.finished = r.scenes.filter((s) => s.ok && !s.capped).length;
  o.notes = {};
  for (const n of [...((p && p.repairs) || []), ...r.scenes.flatMap((s) => s.repairs || [])]) {
    const m = /\(revival-repair: what (\S+) /.exec(n);
    const kind = m ? m[1] : "unreadable";
    o.notes[kind] = (o.notes[kind] || 0) + 1;
  }
  return o;
}

// How what happened differs from what was expected, as a list of sentences.
function differences(want, got) {
  if (got.crashed) return [`run-story stopped: ${got.crashed} (exit ${got.exit})`];
  const out = [];
  const prefix = (w, g) => typeof g === "string" && typeof w === "string" && g.startsWith(w);
  if (got.exit !== want.exit) out.push(`exit ${got.exit}, expected ${want.exit}`);
  if (got.pass1 !== want.pass1 && !prefix(want.pass1, got.pass1)) out.push(`pass 1 ${got.pass1}, expected ${want.pass1}`);
  const ids = Object.keys(got.scenes), wantIds = Object.keys(want.scenes || {});
  if (ids.join(" ") !== wantIds.join(" ")) out.push(`the scenes made were ${ids.join(", ") || "none"}, expected ${wantIds.join(", ") || "none"}`);
  for (const id of ids.filter((x) => wantIds.includes(x))) {
    const w = want.scenes[id], g = got.scenes[id];
    const fits = w === g || (w === "under the cap" && typeof g === "number") || prefix(w, g);
    if (!fits) out.push(`${id}: ${typeof g === "number" ? `${g} frames` : g}, expected ${typeof w === "number" ? `${w} frames` : w}`);
  }
  if (got.finished !== want.finished) out.push(`${got.finished} scenes finished, expected ${want.finished}`);
  const notes = (n) => Object.entries(n || {}).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, c]) => `${k} ${c}`).join(", ") || "none";
  if (notes(got.notes) !== notes(want.notes)) out.push(`notes ${notes(got.notes)}, expected ${notes(want.notes)}`);
  return out;
}

// One line for a run: what pass 1 and each scene did, the notes, the exit status.
function summary(o) {
  if (o.crashed) return `run-story stopped: ${o.crashed}`;
  const scenes = Object.entries(o.scenes).map(([id, v]) => `${id} ${typeof v === "number" ? `${v} frames` : v}`);
  const notes = Object.entries(o.notes).map(([k, c]) => (c > 1 ? `${k} x${c}` : k));
  const n = Object.keys(o.scenes).length;
  return [`pass 1 ${o.pass1}`, ...scenes, `${o.finished} of ${n} finished`, notes.length ? `notes ${notes.join(", ")}` : "no notes", `exit ${o.exit}`].join("; ");
}

// Write expected.json: each mode of each story on a line of its own, to read and diff;
// the stories in the order they were (a new one after them, as the folder lists it).
function writeExpected() {
  const entries = stories.filter((s) => expected.stories[s.name]).map(({ name }) => [name, expected.stories[name]]).map(([name, e]) => {
    const lines = [`  ${JSON.stringify(name)}: {`];
    const fields = Object.entries(e).map(([k, v]) => `   ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
    return `${lines[0]}\n${fields.join(",\n")}\n  }`;
  });
  const head = Object.entries(expected).filter(([k]) => k !== "stories").map(([k, v]) => ` ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
  writeFileSync(expectedPath, `{\n${head.join("\n")}\n "stories": {\n${entries.join(",\n")}\n }\n}\n`);
}

// ---------------------------------------------------------------- the check

console.log(`${chosen.length} stor${chosen.length === 1 ? "y" : "ies"}, each ${MODES.map(([mode]) => label[mode]).join(", ")}, ${jobs} at a time${record ? "; recording what they do in " + folder + "/expected.json" : ""}\n`);
const t0 = Date.now();
let failures = 0;
const missing = chosen.filter((s) => !record && !expected.stories[s.name]);
for (const s of missing) {
  failures++;
  console.log(`FAIL   ${s.name}: no expectations in ${folder}/expected.json (make them with: node tools/check-stress.mjs ${s.name} --record)`);
}
const toRun = chosen.filter((s) => !missing.includes(s));
// the stories with the most scenes take longest: start them first
const scenesIn = (s) => { try { return storyOutline(readFileSync(join(root, s.file), "utf8")).scenes.length; } catch { return 0; } };
const queue = toRun.map((s) => ({ s, n: scenesIn(s) })).sort((a, b) => b.n - a.n).flatMap(({ s }) => MODES.map(([mode, extra]) => ({ s, mode, extra })));
const runs = new Map(); // "name mode" -> run
const finished = new Map(); // name -> modes done
const reported = [];
function report(story) {
  const entry = expected.stories[story.name];
  const results = MODES.map(([mode]) => runs.get(`${story.name} ${mode}`));
  const got = Object.fromEntries(MODES.map(([mode], k) => [mode, observed(results[k])]));
  const time = Math.max(...results.map((r) => r.seconds));
  if (record) {
    // the modes run now, and any others as they were
    const kept = entry || {};
    expected.stories[story.name] = { file: story.file, ...Object.fromEntries(ALL_MODES.map(([mode]) => [mode, got[mode] || kept[mode]]).filter(([, v]) => v)) };
    console.log(`noted  ${story.name} (${time} s)`);
  } else {
    const diffs = MODES.flatMap(([mode]) => (entry[mode] ? differences(entry[mode], got[mode]) : [`no expectations (make them with: node tools/check-stress.mjs ${story.name} --modes ${mode} --record)`]).map((d) => `${label[mode]}: ${d}`));
    if (diffs.length) failures++;
    console.log(`${diffs.length ? "FAIL  " : "ok    "} ${story.name} (${time} s)`);
    for (const d of diffs) console.log(`         ${d}`);
    if (diffs.length) for (const r of results) console.log(`         see ${r.logPath}`);
  }
  for (const [mode] of MODES) console.log(`         ${(label[mode] + ":").padEnd(22)}${summary(got[mode])}`);
  reported.push(story.name);
}
async function worker() {
  for (let item = queue.shift(); item; item = queue.shift()) {
    const run = await runStory(item.s, item.mode, item.extra);
    runs.set(`${item.s.name} ${item.mode}`, run);
    const done = (finished.get(item.s.name) || 0) + 1;
    finished.set(item.s.name, done);
    if (done === MODES.length) report(item.s);
  }
}
await Promise.all(Array.from({ length: Math.min(jobs, queue.length) || 1 }, worker));
if (record) {
  writeExpected();
  console.log(`\nwrote ${folder}/expected.json (${reported.length} stor${reported.length === 1 ? "y" : "ies"} recorded): read it over with git diff`);
}
if (!failures) rmSync(tmp, { recursive: true, force: true });
console.log(failures ? `\n${failures} stor${failures === 1 ? "y" : "ies"} FAILED (${seconds(t0)} s); the runs' logs are in ${tmp}`
  : `\n${record ? `recorded ${toRun.length}` : `all ${toRun.length}`} stor${toRun.length === 1 ? "y" : "ies"}${record ? "" : " as expected"} (${seconds(t0)} s)`);
process.exit(failures ? 1 : 0);
