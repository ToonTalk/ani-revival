// Run a scene Ani planned, in Director, the way KEN;ANINIT did: load the scene's
// program (written by tools/run-pass2.mjs into reports/pass2/), film it, and save
// where each character ended up (KEN1;INTRO POSIT and so on, which pass 2 loads to
// plan the next scene). The position file is copied to reports/pass2/.
// Usage: node tools/run-scene.mjs [scene] [--frames n] [--fps n] [--png] [--color] [--no-backtrace] [--extensions a,b]
//   --png  photograph each frame as the 1978 film was shot: after each new frame
//          the movie evaluates its after-new-frame-made, which here calls CLICK, the
//          camera (lost; ours saves the TV picture), into reports/film/<scene>/NNN.png.
//   --color  film in color, as the 1978 film was shot: the color TV ((run-color)
//          before (cs)), and ANINIT's running-color, whose characters are MANY-POLYS
//          in green, red, yellow and orange and whose after-new-frame-made clicks the
//          camera; the frames go to reports/film/<scene>-color/.
//   --record  also write reports/film/<scene>.film.json for the web app: for each
//          frame, the line segments each character was drawn with (TV dots from the
//          picture's top left) and each character's state; and every event the movie
//          noted (the beginnings and ends of subscenes and activities), by frame.
//   --extensions  also load the revival's extensions (src/pipeline.js EXTENSIONS).
//          The scene's program and the positions are read from reports/ext/<a+b>/
//          (as tools/run-pass2.mjs --extensions writes them), or else from
//          reports/pass2/, and what this run writes goes to reports/ext/<a+b>/.
// Director is booted, and the camera records, as src/pipeline.js's film() does them
// (boot and recorder), so this run's record is the film page's.
import { makeProjectFileSystem, mountRunOutputs } from "../src/its/node-fs.js";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { extensionsFor, choosesLooks, boot, recorder } from "../src/pipeline.js";
import { encodePNG } from "../src/tv/png.js";
import { Flonum } from "../src/maclisp/types.js";
import { printString } from "../src/maclisp/printer.js";
import { pictureArea } from "../src/tv/canvas.js";

const args = process.argv.slice(2);
const scene = args.find((a, i) => !a.startsWith("--") && !/^--/.test(args[i - 1] || "")) || "introduction";
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? Number(args[i + 1]) : dflt; };
const frames = opt("--frames", 1000);
const fps = opt("--fps", 4);
const extAt = args.indexOf("--extensions");
const extensions = extensionsFor(extAt >= 0 ? (args[extAt + 1] || "").split(",").filter(Boolean) : []).map((e) => e.id);
const extDir = extensions.length ? `reports/ext/${extensions.join("+")}` : null;

const fs = makeProjectFileSystem();
// Files the earlier steps wrote: every scene program and position file so far.
mountRunOutputs(fs); // what earlier steps wrote (KEN;INTROD UCTION, ...)
if (extDir) mountRunOutputs(fs, join(process.cwd(), extDir));

// The camera. ANINIT's after-new-frame-made calls (click) once the frame is on the
// screen; the frames are numbered from 0 as the movie numbers them.
const color = args.includes("--color");
// ANINIT's color filming makes the characters many-polys whose parts are copies made
// before the program is loaded (bridge.lisp, define-many-polys), so they would keep
// Ken's shapes while the outline takes Ani's (REVIVE;LOOKS): not supported with the
// extensions that choose the characters' looks.
if (color && choosesLooks(extensions)) {
  console.log(`--color is not supported with ${extensions.join(", ")}: Director's color filming keeps Ken's shapes in its many-polys, where Ani has chosen others (REVIVE;LOOKS)`);
  process.exit(1);
}
// --pdp10: round every flonum to PDP-10 single precision (an experiment; frames go to
// reports/film/<scene>-pdp10/ and the positions are left alone).
const pdp10 = args.includes("--pdp10");
if (pdp10) Flonum.pdp10 = true;
const png = args.includes("--png") || color;
const record = args.includes("--record");
const filmDir = `${extDir ? `${extDir}/film` : "reports/film"}/${scene}${color ? "-color" : ""}${pdp10 ? "-pdp10" : ""}`;
if (png) {
  rmSync(filmDir, { recursive: true, force: true });
  mkdirSync(filmDir, { recursive: true });
}
let L = null;
let film = null; // the recording (src/pipeline.js recorder): each frame's segments and states, and the events
// Each click photographs the picture, if asked to, as the recorder notes the frame.
const photograph = (shot) => {
  const img = L.tvDisplay.toRGBA({ crop: pictureArea(L.tv, 0) });
  writeFileSync(`${filmDir}/${String(shot).padStart(3, "0")}.png`, encodePNG(img));
};

const isSend = (f) => /^\((ASK|ASK1|ASK-EACH|DO-AS-IF-YOU-WERE|DEFINE) /.test(printString(f));
function step(what, src) {
  const t0 = Date.now();
  try {
    const v = typeof src === "function" ? src() : L.evalString(src);
    console.log(`ok     ${what} (${((Date.now() - t0) / 1000).toFixed(1)}s)  => ${(Array.isArray(v) ? v.join(" ") : L.print(v)).slice(0, 120)}`);
    return true;
  } catch (e) {
    console.log(`FAILED ${what}: ${e.message}${e.where ? ` (at ${e.where})` : ""}`);
    const bt = e.lispBacktrace || [];
    if (bt.length) {
      console.log("  innermost forms:");
      for (const f of bt.slice(0, 6)) console.log("    " + printString(f).slice(0, 200));
      console.log("  the sends that led there, innermost first:");
      for (const f of bt.filter(isSend).slice(0, 25)) console.log("    " + printString(f).slice(0, 220));
    } else if (!(e.message || "").startsWith("break")) console.log(e.stack.split("\n").slice(0, 6).join("\n"));
    return false;
  }
}

const ok =
  // Director with the 1978 conventions (REVIVE;BRIDGE), as each step of the pipeline boots it
  step(`boot Director and REVIVE;BRIDGE${extensions.length ? `, with the extensions ${extensions.join(", ")}` : ""}`,
    () => { L = boot(fs, { backtrace: !args.includes("--no-backtrace"), extensions }); return []; }) &&
  // ANINIT's color hook waits until 3 seconds have passed since the last click (the
  // camera needed them); here no time need pass.
  (!color || step("no waiting between clicks", () => { L.defsubr("SLEEP", () => L.NIL); return []; })) &&
  (!color || step("(run-color): the color TV", "(run-color)")) &&
  step("(cs): start the TV display", "(cs)") &&
  step("load ANINIT (Director extended to run Ani's scenes)", "(load '|ken;aninit >|)") &&
  // ANINIT filmed at 550 by 413 dots ((tvsize 550 413) before each click), and the
  // thesis's flipbook has those proportions; the size changes how far characters go.
  step("(tvsize 550 413): the picture the film was made at", "(tvsize 550 413)") &&
  (!(png || record) || color || step("the camera: a click after each new frame", "(ask ani-movie set your after-new-frame-made to (click))")) &&
  (!(png || record) || step("the recorder: who draws each segment, each character's state, and each event",
    () => { film = recorder(L, { onClick: png ? photograph : null, ...Object.assign({}, ...extensionsFor(extensions).map((e) => e.recorder || {})) }); return []; })) &&
  (!color || step("color filming: start calls ANINIT's running-color", "(setq :running-color t)")) &&
  step(`(start '${scene} ${fps})`, `(start '${scene} ${fps})`) &&
  step(`(m ${frames}): film the scene`, `(m ${frames})`) &&
  step("save the positions", `(save-positions '${scene} '((ken1) ,(get '${scene} 'movie-name) posit))`);

const out = L ? L.ttyText.join("") : "";
if (out.trim()) console.log("\nterminal output (last 3000 characters):\n" + out.slice(-3000));
if (ok) {
  // When each subscene began and ended, in frames (the movie notes each one), and how
  // Ani's estimate compared: to set beside the flipbook's page ranges.
  const timings = L.evalString(`(let ((movie (ask movie recall your current-movie)))
     (mapcar (function (lambda (s) (list s (ask ,movie recall your (beginning-of ,s))
                                           (ask ,movie recall your (end-of ,s))
                                           (ask ,s recall your running-time))))
             (ask ${scene} recall your subscenes)))`);
  console.log(`\nframes filmed: ${L.print(L.evalString(`(ask ,(ask movie recall your current-movie) recall your frame-count)`))}`);
  console.log("subscene                                  begins  ends  frames  estimate (s)");
  for (const [s, b, e, est] of L.toArray(timings).map((x) => L.toArray(x))) {
    const n = (x) => (typeof x === "number" ? String(x) : "-");
    const len = typeof b === "number" && typeof e === "number" ? String(e - b) : "-";
    console.log(`${L.print(s).toLowerCase().padEnd(42)}${n(b).padStart(6)}${n(e).padStart(6)}${len.padStart(8)}  ${typeof est === "number" ? est.toFixed(2) : "-"}`);
  }
  if (record) {
    // as src/pipeline.js's film() makes it, for the film page
    const f = { scene, ...film };
    if (fps !== 4) f.fps = fps;
    const path = `${extDir || "reports/film"}/${scene}${color ? "-color" : ""}.film.json`;
    mkdirSync(extDir || "reports/film", { recursive: true });
    writeFileSync(path, JSON.stringify(f));
    console.log(`recorded ${f.frames.length} frames and ${f.events.length} events in ${path}`);
  }
  const name = L.print(L.evalString(`(get '${scene} 'movie-name)`)).toLowerCase();
  const e = fs.find({ dir: "KEN1", fn1: name.toUpperCase(), fn2: "POSIT" });
  if (e && (color || pdp10)) {
    // The flipbook, which our pipeline follows, was filmed in black and white (its
    // shapes are outlines); a color run, whose characters move a little differently,
    // leaves the next scene's starting positions alone.
    console.log(`KEN1;${name.toUpperCase()} POSIT: not copied (color run)
` + fs.textOf(e));
  } else if (e) {
    const dir = extDir || "reports/pass2";
    mkdirSync(dir, { recursive: true });
    writeFileSync(`${dir}/ken1-${name}.posit`, fs.textOf(e));
    console.log(`KEN1;${name.toUpperCase()} POSIT: copied to ${dir}/ken1-${name}.posit\n` + fs.textOf(e));
  }
}
process.exit(ok ? 0 : 1);
