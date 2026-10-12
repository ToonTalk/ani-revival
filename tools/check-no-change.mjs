// Check that MEND leaves alone what Ani as in 1978 films correctly: for each case below,
// each named scene of a story is filmed twice from the same start, as Ani as in 1978 and
// with --extensions mend, and the two films are held against each other frame for
// frame (every character's place, heading, visibility, special dynamics and goal in
// every frame, and every event the movie noted). REVIVE;MEND12 stops moves that never
// end; these are moves that end, however long they take, which it must not touch
// (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"; src/director/revive/mend12.lisp).
// A case's scenes are made in order, as the page makes them: each scene's pass 2, then
// its filming, from where the scene before it left everyone (its POSIT file). A scene
// named only as a lead-in is made once, with MEND; a checked scene is made as in 1978
// first and with MEND second, so the next scene starts where MEND's film left it.
//   identical         the films are the same, frame for frame, and both end
//   through: n        the films are the same up to frame n (Ani as in 1978 is filmed only
//                     that far), and MEND's ends: a scene that never ends in 1978, whose
//                     film MEND must leave as it was until the move that never ends
// A case with planWith is planned with those extensions (a story Ani as in 1978 can't
// plan, stopping in pass 2): each scene's pass 2 is made once, with them, and its program
// filmed twice, by Director as in 1978 (no extensions) and with MEND. A case's frames is
// its cap, if not the page's 250 seconds (CAP_SECONDS: 1,000 frames at 4 a second).
// Usage: node tools/check-no-change.mjs [case ...] [--jobs n]
//   case    only these cases (all by default)
//   --jobs  how many cases at once, each a process of its own (default: the cores less two, at most 4)
// Each case takes minutes; the Gingerbread House at 24 frames a second about fifteen.
// Reports each scene, ok or FAIL with the first frame that differs; exits non-zero on any.
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { availableParallelism } from "node:os";
import { fileURLToPath } from "node:url";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { storyOutline, storyPlan, pass1, pass2, film } from "../src/pipeline.js";

const CASES = {
  // two pushes in one subscene, the troll the pusher of one and the pushee of the other:
  // in 1978 every move ends, after long waits, and the scene films in 182 frames
  "push-two": { file: "test/stories/stress/push-two.lisp", fps: 4, scenes: { "by-the-bridge": "lead-in", "on-the-bridge": "identical" } },
  // Gretel's walk onto the stage winds for seven and a half seconds at 24 frames a
  // second, two and a half times Ani's ideal for the walk, and gets there
  "gingerbread-24": { file: "test/stories/fresh/hansel-and-gretel.lisp", fps: 24, scenes: { "into-the-forest": "identical", "the-gingerbread-house": "identical" } },
  // the same scenes at 4 frames a second, and The Cage after them
  "hansel-and-gretel-4": { file: "test/stories/fresh/hansel-and-gretel.lisp", fps: 4, scenes: { "into-the-forest": "identical", "the-gingerbread-house": "identical", "the-cage": "identical" } },
  // Into the Woods never ends in 1978: Red Riding Hood's moving away in the fourth push,
  // from frame 158, loops outwards for ever (her nearest is at frame 172). The third
  // push's loops round her place, frames 82 to 143, end, and must be left as they are
  "red-riding-hood-woods": { file: "test/stories/red-riding-hood.lisp", fps: 4, scenes: { "into-the-woods": { through: 172 } } },
  // Ken's own tortoise and hare, made on the page (test/stories/stress/pushed-around.lisp).
  // Ani as in 1978 stops in its pass 2 (the hare's activity level is none), so it is
  // planned with MEND. Pushed Around's second push is stretched, and Director's special
  // dynamics make each of its seven cycles take a third longer than the one before
  // (dichar.103:27-31); the scene ends on its own at frame 799, within the page's 250
  // seconds and Ken's 1,000 frames, and M12 must leave it alone
  "pushed-around": { file: "test/stories/stress/pushed-around.lisp", fps: 4, planWith: ["mend"], scenes: { introduction: "lead-in", "pushed-around": "identical" } },
};

const root = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const valued = new Set(["--jobs", "--case"]);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };

if (opt("--case")) {
  runCase(opt("--case"));
} else {
  const names = args.filter((a, i) => !a.startsWith("--") && !valued.has(args[i - 1]));
  for (const n of names) if (!CASES[n]) throw new Error(`no such case: ${n}; known: ${Object.keys(CASES).join(", ")}`);
  const todo = names.length ? names : Object.keys(CASES);
  const jobs = opt("--jobs") ? Math.max(1, Number(opt("--jobs")) || 1) : Math.max(1, Math.min(4, availableParallelism() - 2));
  const t0 = Date.now();
  let failures = 0;
  const queue = [...todo];
  const one = () => {
    const name = queue.shift();
    if (!name) return Promise.resolve();
    return new Promise((resolve) => {
      const child = spawn(process.execPath, [fileURLToPath(import.meta.url), "--case", name], { cwd: root, stdio: ["ignore", "pipe", "inherit"] });
      let out = "";
      child.stdout.on("data", (d) => { out += d; });
      child.on("close", (code) => {
        process.stdout.write(out);
        if (code !== 0) failures++;
        resolve();
      });
    }).then(one);
  };
  await Promise.all(Array.from({ length: Math.min(jobs, todo.length) }, one));
  console.log(`\n${failures ? `${failures} case${failures === 1 ? "" : "s"} FAILED` : "all cases ok"} (${Math.round((Date.now() - t0) / 1000)}s)`);
  process.exit(failures ? 1 : 0);
}

function runCase(name) {
  const c = CASES[name];
  const t0 = Date.now();
  const description = readFileSync(`${root}/${c.file}`, "utf8").replace(/\r\n/g, "\n");
  const fs = makeProjectFileSystem(root);
  // the story as the page's editor gives it to Ani: KEN;CINDY one version up (src/pipeline.js makeFilmSteps)
  const versions = fs.dirs.get("KEN")?.get("CINDY");
  const top = versions ? Math.max(0, ...[...versions.keys()].filter((k) => /^\d+$/.test(k)).map(Number)) : 0;
  fs.addFile("KEN", "CINDY", String(top + 1), { text: description, origin: "changed" });
  const plan = storyPlan(storyOutline(description));
  pass1(fs, { extensions: c.planWith || [] });
  const cap = c.frames || c.fps * 250; // the page's cap, 1,000 frames at 4 a second
  const make = (scene, extensions, frames) => {
    pass2(fs, scene, { plan, extensions: c.planWith || extensions });
    return film(fs, scene, { plan, frames, fps: c.fps, extensions }).film;
  };
  let failed = 0;
  const say = (ok, what) => { if (!ok) failed++; console.log(`${ok ? "ok  " : "FAIL"} ${name} ${what}`); };
  for (const s of plan.scenes) {
    const how = c.scenes[s.id];
    if (!how) break;
    try {
      if (how === "lead-in") { make(s.id, ["mend"], cap); continue; }
      const through = how === "identical" ? null : how.through;
      const ken = make(s.id, [], through === null ? cap : through);
      const mend = make(s.id, ["mend"], cap);
      const notes = (mend.repairs || []).map((r) => r.note).join("; ");
      const n = through === null ? Math.max(ken.frames.length, mend.frames.length) : through + 1;
      let differs = null;
      for (let i = 0; i < n && differs === null; i++) {
        if (JSON.stringify(ken.frames[i] && ken.frames[i].chars) !== JSON.stringify(mend.frames[i] && mend.frames[i].chars)) differs = i;
      }
      const events = (f) => JSON.stringify(f.events.filter(([frame]) => through === null || frame === null || frame <= through));
      const sameEvents = events(ken) === events(mend);
      const ended = mend.frames.length <= cap && (through !== null || ken.frames.length <= cap);
      const at = `${s.id} at ${c.fps} frames a second`;
      if (through === null) {
        say(differs === null && sameEvents && ended,
          `${at}: ${ken.frames.length} frames as in 1978, ${mend.frames.length} with MEND${differs !== null ? `; they differ from frame ${differs}` : ""}${sameEvents ? "" : "; the events differ"}${ended ? "" : "; hit the cap"}${notes ? `; notes: ${notes}` : ""}`);
      } else {
        say(differs === null && sameEvents && ended,
          `${at}: the same as in 1978 through frame ${through}${differs !== null ? ` — NOT: they differ from frame ${differs}` : ""}${sameEvents ? "" : "; the events differ"}; ${ended ? `ends in ${mend.frames.length} frames with MEND` : "hit the cap with MEND"}${notes ? `; notes: ${notes}` : ""}`);
      }
    } catch (e) {
      say(false, `${s.id}: ${(e && e.message) || e}`);
      break;
    }
  }
  console.log(`     ${name} took ${Math.round((Date.now() - t0) / 1000)}s`);
  process.exit(failed ? 1 : 0);
}
