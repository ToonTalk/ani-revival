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
//   --record  also write reports/film/<scene>.film.json for the web app: for each
//          frame, the line segments each character was drawn with (TV dots from the
//          picture's top left) and each character's state; and every event the movie
//          noted (the beginnings and ends of subscenes and activities), by frame.
import { createLisp } from "../src/maclisp/index.js";
import { makeProjectFileSystem, mountRunOutputs } from "../src/its/node-fs.js";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { encodePNG } from "../src/tv/png.js";
import { Flonum } from "../src/maclisp/types.js";
import { pictureArea } from "../src/tv/canvas.js";
import { UNIT_BIT } from "../src/tv/turtle.js";

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
const record = args.includes("--record");
const filmDir = `reports/film/${scene}${color ? "-color" : ""}${pdp10 ? "-pdp10" : ""}`;
// ANINIT's color hook waits until 3 seconds have passed since the last click (the
// camera needed them); here no time need pass.
if (color) L.defsubr("SLEEP", () => L.NIL);
// The recording: the object whose display is drawing, and the segments drawn since
// the screen was last wiped (the frame handler wipes and redraws before each click).
const CHARACTERS = ["cinderella", "step-mother", "prince", "fairy-godmother"];
const film = { scene, picture: null, frames: [], events: [] };
let drawing = null;
let segs = {};
function hookTurtle() {
  const tv = L.tv;
  const area = pictureArea(tv, 0);
  film.picture = { width: area.width, height: area.height };
  const vector = tv.boundedVectorFix.bind(tv);
  tv.boundedVectorFix = (a, b, c, d) => {
    if (drawing) {
      const r = (v) => Math.round(v * 10) / 10;
      (segs[drawing] ||= []).push(r(a / UNIT_BIT - area.x), r(b / UNIT_BIT - area.y), r(c / UNIT_BIT - area.x), r(d / UNIT_BIT - area.y));
    }
    return vector(a, b, c, d);
  };
  const wipe = tv.wipe.bind(tv);
  tv.wipe = (wipeArgs) => {
    segs = {};
    return wipe(wipeArgs);
  };
}
if (record) {
  L.defsubr("REVIVE-DRAWING", (...a) => {
    if (a.length) drawing = a[0] === L.NIL ? null : L.print(a[0]).toLowerCase();
    return drawing ? L.intern(drawing.toUpperCase()) : L.NIL;
  });
  const seen = new Set();
  L.defsubr("REVIVE-EVENT", (frame, event) => {
    const key = `${L.print(frame)} ${L.print(event).toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      film.events.push([typeof frame === "number" ? frame : null, L.print(event).toLowerCase()]);
    }
    return L.NIL;
  });
}
if (png || record) {
  if (png) {
    rmSync(filmDir, { recursive: true, force: true });
    mkdirSync(filmDir, { recursive: true });
  }
  let shot = 0;
  L.defsubr("CLICK", () => {
    if (png) {
      const img = L.tvDisplay.toRGBA({ crop: pictureArea(L.tv, 0) });
      writeFileSync(`${filmDir}/${String(shot).padStart(3, "0")}.png`, encodePNG(img));
    }
    if (record) {
      const states = L.evalString(`(mapcar (function (lambda (c) (list (ask ,c recall your state) (ask ,c recall your visibility)
                                                                      (ask ,c recall your special-dynamics) (ask ,c recall your current-goal))))
                                           '(${CHARACTERS.join(" ")}))`);
      const chars = {};
      L.toArray(states).forEach((st, i) => {
        const [state, vis, sd, goal] = L.toArray(st);
        const xyh = state instanceof Object && state !== L.NIL ? L.toArray(state).map((v) => L.num.val(v)) : null;
        chars[CHARACTERS[i]] = { state: xyh && xyh.map((v) => Math.round(v * 100) / 100), visible: vis !== L.NIL,
          dynamics: sd === L.NIL ? null : L.print(sd).toLowerCase(), goal: goal === L.NIL ? null : L.print(goal).toLowerCase() };
      });
      film.frames.push({ segs, chars });
      segs = {};
    }
    shot++;
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
  (!(png || record) || color || step("the camera: a click after each new frame", "(ask ani-movie set your after-new-frame-made to (click))")) &&
  (!record || step("the recorder: who draws each segment, and each event", `(progn
     (define-extension-method (display) object
       (cond ((revive-drawing) (ask-old :self display))
             (t (revive-drawing (name-of :self)) (ask-old :self display) (revive-drawing nil))))
     (define-extension-method (note that ?event happened) director-subscene
       (revive-event (ask ,(ask movie recall your current-movie) recall your frame-count) event)
       (ask-old :self note that ,event happened)))`) && (hookTurtle(), true)) &&
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
  if (record) {
    writeFileSync(`reports/film/${scene}${color ? "-color" : ""}.film.json`, JSON.stringify(film));
    console.log(`recorded ${film.frames.length} frames and ${film.events.length} events in reports/film/${scene}${color ? "-color" : ""}.film.json`);
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
