// Run a scene Ani planned, in Director, the way KEN;ANINIT did: load the scene's
// program (written by tools/run-pass2.mjs into reports/pass2/), film it, and save
// where each character ended up (KEN1;INTRO POSIT and so on, which pass 2 loads to
// plan the next scene). The position file is copied to reports/pass2/.
// Usage: node tools/run-scene.mjs [scene] [--frames n] [--fps n] [--png] [--color] [--no-backtrace]
//   --png  photograph each frame as the 1978 film was shot: after each new frame
//          the movie evaluates its after-new-frame-made, which here calls CLICK, the
//          camera (lost; ours saves the TV picture), into reports/film/<scene>/NNN.png.
//   --color  film in color, as the 1978 film was shot: the color TV ((run-color)
//          before (cs)), and ANINIT's running-color, whose characters are MANY-POLYS
//          in green, red, yellow and orange and whose after-new-frame-made clicks the
//          camera; the frames go to reports/film/<scene>-color/.
import { createLisp } from "../src/maclisp/index.js";
import { makeProjectFileSystem, mountRunOutputs } from "../src/its/node-fs.js";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { encodePNG } from "../src/tv/png.js";
import { Flonum } from "../src/maclisp/types.js";
import { pictureArea } from "../src/tv/canvas.js";

const args = process.argv.slice(2);
const scene = args.find((a, i) => !a.startsWith("--") && !/^--/.test(args[i - 1] || "")) || "introduction";
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? Number(args[i + 1]) : dflt; };
const frames = opt("--frames", 1000);
const fps = opt("--fps", 4);

const fs = makeProjectFileSystem();
// Files the earlier steps wrote: every scene program and position file so far.
mountRunOutputs(fs); // what earlier steps wrote (KEN;INTROD UCTION, ...)

const L = createLisp({ fs });
L.formStack = args.includes("--no-backtrace") ? null : [];
L.backtraceDepth = 4000;
L.breakHandler = (tag) => {
  const e = new Error(`break ${L.print(tag)}`);
  e.lispBacktrace = (L.formStack || []).slice(-4000).reverse();
  throw e;
};
// The camera. ANINIT's after-new-frame-made calls (click) once the frame is on the
// screen; the frames are numbered from 0 as the movie numbers them.
const color = args.includes("--color");
// --pdp10: round every flonum to PDP-10 single precision (an experiment; frames go to
// reports/film/<scene>-pdp10/ and the positions are left alone).
const pdp10 = args.includes("--pdp10");
if (pdp10) Flonum.pdp10 = true;
const png = args.includes("--png") || color;
const filmDir = `reports/film/${scene}${color ? "-color" : ""}${pdp10 ? "-pdp10" : ""}`;
// ANINIT's color hook waits until 3 seconds have passed since the last click (the
// camera needed them); here no time need pass.
if (color) L.defsubr("SLEEP", () => L.NIL);
if (png) {
  rmSync(filmDir, { recursive: true, force: true });
  mkdirSync(filmDir, { recursive: true });
  let shot = 0;
  L.defsubr("CLICK", () => {
    const img = L.tvDisplay.toRGBA({ crop: pictureArea(L.tv, 0) });
    writeFileSync(`${filmDir}/${String(shot++).padStart(3, "0")}.png`, encodePNG(img));
    return L.T;
  });
}
const isSend = (f) => /^\((ASK|ASK1|ASK-EACH|DO-AS-IF-YOU-WERE|DEFINE) /.test(L.print(f));
function step(what, src) {
  const t0 = Date.now();
  try {
    const v = L.evalString(src);
    console.log(`ok     ${what} (${((Date.now() - t0) / 1000).toFixed(1)}s)  => ${L.print(v).slice(0, 120)}`);
    return true;
  } catch (e) {
    console.log(`FAILED ${what}: ${e.message}${e.where ? ` (at ${e.where})` : ""}`);
    const bt = e.lispBacktrace || [];
    if (bt.length) {
      console.log("  innermost forms:");
      for (const f of bt.slice(0, 6)) console.log("    " + L.print(f).slice(0, 200));
      console.log("  the sends that led there, innermost first:");
      for (const f of bt.filter(isSend).slice(0, 25)) console.log("    " + L.print(f).slice(0, 220));
    } else if (!(e.message || "").startsWith("break")) console.log(e.stack.split("\n").slice(0, 6).join("\n"));
    return false;
  }
}

L.load(L.intern("KEN;LISP >"));
L.load(L.intern("KEN;LOAD >"));
L.evalString("(setq :print-load-messages nil)");
const ok =
  step("(director '(ani direct))", "(director '(ani direct))") &&
  step("load REVIVE;BRIDGE (the 1978 conventions)", "(load '|revive;bridge >|)") &&
  (!color || step("(run-color): the color TV", "(run-color)")) &&
  step("(cs): start the TV display", "(cs)") &&
  step("load ANINIT (Director extended to run Ani's scenes)", "(load '|ken;aninit >|)") &&
  // ANINIT filmed at 550 by 413 dots ((tvsize 550 413) before each click), and the
  // thesis's flipbook has those proportions; the size changes how far characters go.
  step("(tvsize 550 413): the picture the film was made at", "(tvsize 550 413)") &&
  (!png || color || step("the camera: a click after each new frame", "(ask ani-movie set your after-new-frame-made to (click))")) &&
  (!color || step("color filming: start calls ANINIT's running-color", "(setq :running-color t)")) &&
  step(`(start '${scene} ${fps})`, `(start '${scene} ${fps})`) &&
  step(`(m ${frames}): film the scene`, `(m ${frames})`) &&
  step("save the positions", `(save-positions '${scene} '((ken1) ,(get '${scene} 'movie-name) posit))`);

const out = L.ttyText.join("");
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
  const name = L.print(L.evalString(`(get '${scene} 'movie-name)`)).toLowerCase();
  const e = fs.find({ dir: "KEN1", fn1: name.toUpperCase(), fn2: "POSIT" });
  if (e && (color || pdp10)) {
    // The flipbook, which our pipeline follows, was filmed in black and white (its
    // shapes are outlines); a color run, whose characters move a little differently,
    // leaves the next scene's starting positions alone.
    console.log(`KEN1;${name.toUpperCase()} POSIT: not copied (color run)
` + fs.textOf(e));
  } else if (e) {
    writeFileSync(`reports/pass2/ken1-${name}.posit`, fs.textOf(e));
    console.log(`KEN1;${name.toUpperCase()} POSIT: copied to reports/pass2/ken1-${name}.posit\n` + fs.textOf(e));
  }
}
process.exit(ok ? 0 : 1);
