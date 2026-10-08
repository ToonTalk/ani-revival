// Director's graphics running on the TV turtle: the demos, rendered to PNG.
//
//   node tools/tv-demo.mjs            all demos
//   node tools/tv-demo.mjs fred movie  some of them
//
// Each demo boots Director the way Ken's KEN;LISP and KEN;LOAD did, starts
// the display with (cs) as Ken's init file arranged, and runs Director
// commands, saving the TV picture after each one in reports/tv/:
//   <demo>-NN.png     the picture area after step NN, at TV resolution
//   <demo>.png        all the steps on one sheet
// and reports/tv/index.json lists the steps and the commands behind them.
//
// The 1976 fonts (KEN;20FG and 25FG WINDOW/WINFON, tape 3100153) are added to
// KEN; so that TEXT actors can be captioned as in Ken's 1976 demo frames; the
// 1979 fonts on PLASMA; did not survive.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { createLisp } from "../src/maclisp/index.js";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { encodePNG, contactSheet } from "../src/tv/png.js";
import { pictureArea } from "../src/tv/canvas.js";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "tv");

export function bootDirector({ color = false } = {}) {
  const fs = makeProjectFileSystem(ROOT);
  for (const [fn1, fn2] of [["25FG", "WINDOW"], ["25FG", "WINFON"], ["20FG", "WINDOW"], ["20FG", "WINFON"]]) {
    const p = join(ROOT, "original", "3100153", `${fn1.toLowerCase()}.${fn2.toLowerCase()}`);
    fs.addFile("KEN", fn1, fn2, { getBytes: () => readFileSync(p), origin: "tape 3100153 (1976)", path: p });
  }
  const L = createLisp({ fs });
  L.formStack = [];
  L.breakHandler = (tag) => {
    const e = new Error(`break ${L.print(tag)}`);
    e.lispBacktrace = L.formStack.slice(-40).reverse();
    throw e;
  };
  const ev = (src) => L.evalString(src);
  ev("(load '|ken;lisp >|)");
  ev("(load '|ken;load >|)");
  ev("(setq :print-load-messages nil)");
  ev("(director '(ani direct))");
  // SOME 666 sets this when it is loaded, but the setting doesn't stick here
  // (see reports/TV-TURTLE.md); planning needs it.
  ev("(ask something set your universe to default-universe)");
  if (color) ev("(run-color)"); // KEN1;DRECT: use LLOGO;COLORT
  ev("(cs)"); // as Ken did: loads the turtle, starts the display, fancifies
  ev("(defprop 25fg |ken;25fg winfon| font-autoload-file)");
  ev("(defprop 20fg |ken;20fg winfon| font-autoload-file)");
  return L;
}

function run(L, src) {
  try {
    return L.evalString(src);
  } catch (e) {
    console.log(`FAILED ${src}\n  ${e.message}`);
    if (e.lispBacktrace) for (const f of e.lispBacktrace.slice(0, 15)) console.log("    " + L.print(f).slice(0, 160));
    throw e;
  }
}

// A demo: steps of { lisp, caption, frame (default true) }. Captions are shown
// with a TEXT actor in 25FG when caption is true.
function playDemo(name, { color = false, captions = false, setup = [], steps, onSleep = null, scale = 1 }) {
  const L = bootDirector({ color });
  for (const s of setup) run(L, s);
  const frames = [];
  const index = [];
  const area = () => pictureArea(L.tv, 0);
  const grab = (label, lisp) => {
    const img = L.tvDisplay.toRGBA({ crop: area(), scale });
    const file = `${name}-${String(frames.length + 1).padStart(2, "0")}.png`;
    writeFileSync(join(OUT, file), encodePNG(img));
    frames.push(img);
    index.push({ file, label, lisp });
  };
  if (onSleep) {
    // MOVIE's run-frame sleeps after erasing the old frame and after drawing
    // the new one; grab the drawn ones (run-frame's ACTION is (display)).
    L.defsubr("SLEEP", () => {
      const action = L.intern("ACTION").value;
      const drawing = action && action.car === L.intern("DISPLAY");
      if (onSleep.active && drawing) grab(`projected frame ${frames.length + 1 - onSleep.offset}`, onSleep.lisp);
      return L.NIL;
    });
  }
  if (captions) {
    run(L, "(ask text make caption)");
    run(L, "(ask caption set your font to 25fg)");
  }
  for (const step of steps) {
    if (captions && step.caption) {
      // hidden first: OBJECT's text actor re-shows a changed text before it
      // updates its length, so a longer caption would be centered wrongly
      run(L, "(ask caption hide)");
      run(L, `(ask caption set your text to |${step.caption}|)`);
      run(L, `(ask caption setxy ${step.captionAt || "0 330"})`);
      run(L, "(ask caption show)");
    }
    if (step.project && onSleep) {
      onSleep.active = true;
      onSleep.offset = frames.length;
      onSleep.lisp = step.lisp;
    }
    for (const src of [].concat(step.lisp)) run(L, src);
    if (onSleep) onSleep.active = false;
    if (step.frame !== false && !step.project) grab(step.caption || [].concat(step.lisp).join(" "), step.lisp);
  }
  writeFileSync(join(OUT, `${name}.png`), encodePNG(contactSheet(frames, { columns: color ? 3 : 2 })));
  return { name, color, frames: index, output: L.ttyText.join("").slice(-2000) };
}

const DEMOS = {
  // Ken's own check of Director's graphics, from KEN;DUMP 44: "this is just a
  // quick and simple test to make sure that turt part of director is working".
  // A pentagon that grows and turns, a star that shrinks and turns, a 36-gon
  // "to frame it with a large circle", and a movie of 4 ticks at 2 frames a
  // second, projected. Run as written; the frames are grabbed as the movie
  // projects.
  "test-director": {
    onSleep: { active: false },
    setup: ["(director-load 'dump)"],
    steps: [{ lisp: "(test-director)", project: true }],
  },

  // Ken's 1976 demo of the rocket FRED (KEN;DEMOS WINDOW, tape 3100153,
  // reports/images/3100153_demos.window__demos.1-8.png), replayed with the
  // 1979 Director. The 1976 commands (appear forward 50, ...) are the 1979
  // ones (forward 50, ...); the missile is a method FRED learns here. The
  // captions stay on one line: a caption wider than the 550-dot picture
  // makes FWUSE's fontterpri ask FILLWINDOW for a band a dot too wide.
  fred: {
    captions: true,
    setup: [
      "(ask rocket make fred)",
      "(ask fred setxy 200 -250)",
      "(ask fred set your speed to 40)",
      `(define-method (shoot missle ?distance) fred
          (ask rocket make missle)
          (ask missle set your size to 45)
          (ask missle set your state to ,(ask :self recall your state))
          (ask missle set your speed to 100)
          (ask missle show)
          (ask missle plan next gradually forward ,distance))`,
    ],
    steps: [
      { caption: "ASK FRED (SHOW)", lisp: "(ask fred show)" },
      { caption: "ASK FRED (FORWARD 50)", lisp: "(ask fred forward 50)" },
      { caption: "ASK FRED (LEFT 120)", lisp: "(ask fred left 120)" },
      { caption: "ASK FRED (GRADUALLY FORWARD 75)", lisp: "(ask fred gradually forward 75)" },
      { caption: "ASK DEFAULT-UNIVERSE (TICK)", lisp: "(ask default-universe tick)" },
      { caption: "ASK FRED (GROW 10)", lisp: "(ask fred grow 10)" },
      { caption: "ASK FRED (BACK 50)", lisp: "(ask fred back 50)" },
      { caption: "ASK FRED (SHOOT MISSLE 200)", lisp: "(ask fred shoot missle 200)" },
      { caption: "ASK DEFAULT-UNIVERSE (TICK)", lisp: "(ask default-universe tick)" },
      { caption: "ASK DEFAULT-UNIVERSE (TICK)", lisp: "(ask default-universe tick)" },
    ],
  },

  // KEN1;INTER: a square becoming a triangle, and a star becoming a pentagon,
  // with the 1976 table function slt (interpolation, from, to, step, columns,
  // rows). (OBJECT 401's interpolation actor can't draw: its "when drawing
  // use" passes only the shape arguments, so the drawer gets 2 of its 4.)
  interpolation: {
    setup: [
      "(mi 'sq-tri '(draw-poly 100 90) '(draw-poly 100 120))",
      "(mi 'star-pent '(draw-poly 100 144) '(draw-poly 100 72))",
    ],
    steps: [
      { lisp: "(slt sq-tri 0 1 .25 5 2)", caption: "(slt sq-tri 0 1 .25 5 2)" },
      { lisp: "(slt star-pent 0 1 .25 5 2)", caption: "(slt star-pent 0 1 .25 5 2)" },
    ],
  },

  // The objects of KEN;POLY 29 ("the initial environment includes this
  // definition of Poly and two other objects, Rocket and Flower": the guide).
  shapes: {
    setup: ["(ask poly make hexagon)", "(ask poly make square)", "(ask poly make triangle)", "(ask poly make star)", "(ask flower make rose)"],
    steps: [
      { lisp: ["(ask hexagon setxy -1000 150)", "(ask hexagon show)"], caption: "a POLY, angle 60" },
      { lisp: ["(ask square set your angle to 90)", "(ask square setxy -500 150)", "(ask square show)"], caption: "angle 90" },
      { lisp: ["(ask triangle set your angle to 120)", "(ask triangle setxy 0 150)", "(ask triangle show)"], caption: "angle 120" },
      { lisp: ["(ask star set your angle to 144)", "(ask star setxy 500 150)", "(ask star show)"], caption: "angle 144" },
      { lisp: ["(ask rocket setxy 1000 150)", "(ask rocket show)"], caption: "ROCKET" },
      { lisp: ["(ask rose set your petal-colors to (green red purple))", "(ask rose setxy -500 -250)", "(ask rose show)"], caption: "FLOWER" },
      { lisp: ["(ask star grow 100)", "(ask square right 30)", "(ask triangle setheading 90)", "(ask hexagon shrink 50)"], caption: "grow, turn, shrink" },
      { lisp: "(ask rocket hide)", caption: "hide the rocket" },
    ],
  },

  // The Director Guide's movie: (ask movie make fantasia), (ask fantasia film
  // the next 12 ticks), (ask fantasia project), with a rocket flying and a
  // star turning, planned with "gradually" messages.
  movie: {
    onSleep: { active: false },
    setup: [
      "(ask rocket make fred)",
      "(ask fred setxy -1100 -300)",
      "(ask fred setheading 60)",
      "(ask fred set your speed to 200)",
      "(ask poly make sue)",
      "(ask sue set your angle to 144)",
      "(ask sue setxy 600 100)",
      "(ask sue set your rotational-speed to 15)",
      "(ask fred show)",
      "(ask sue show)",
      "(ask fred plan next gradually forward 2000)",
      "(ask sue plan next gradually right 360)",
      "(ask movie make fantasia)",
    ],
    steps: [
      { lisp: "(ask fantasia film the next 12 ticks)", caption: "after filming 12 ticks" },
      { lisp: "(ask fantasia project)", project: true },
    ],
  },

  // LLOGO;COLORT, as KEN;ANINIT runs Ani's film: (run-color) before the
  // turtle loads, (tvsize 550 413), and Ani's characters' shapes and colors
  // (ANINIT's initialize-characters and running-color). ANINIT makes them
  // descendants of many-polys, which no surviving file defines; it is
  // defined here, for the demo, with the reconstructed draw-many-polys.
  color: {
    color: true,
    setup: [
      "(tvsize 550 413)",
      "(define many-polys poly (set your offset to 10.0) (when drawing use draw-many-polys of size angle offset))",
      "(define cinderella many-polys (set your angle to 144) (set your center-offset to (right 18)) (set your offset to 20.0) (set your colors to (green)))",
      "(define step-mother many-polys (set your angle to 90) (set your colors to (red)))",
      "(define prince many-polys (set your angle to 120) (set your center-offset to (right 30)) (set your colors to (yellow)))",
      "(define fairy-godmother many-polys (set your angle to 5) (set your colors to (orange)))",
      "(ask cinderella set your size to 58)",
      "(ask step-mother set your size to 81)",
      "(ask prince set your size to 58)",
      "(ask fairy-godmother set your size to 58)",
    ],
    steps: [
      { lisp: ["(ask cinderella setxy 0 200)", "(ask cinderella show)"], caption: "Cinderella, a green star" },
      { lisp: ["(ask step-mother setxy 0 0)", "(ask step-mother show)"], caption: "the stepmother, a red square" },
      { lisp: ["(ask prince setxy 0 -200)", "(ask prince show)"], caption: "the prince, a yellow triangle" },
      { lisp: ["(ask fairy-godmother setxy 450 0)", "(ask fairy-godmother show)"], caption: "the fairy godmother, orange" },
      { lisp: ["(ask cinderella forward 150)", "(ask step-mother right 45)", "(ask prince setheading 180)"], caption: "moving and turning" },
      // OBJECT's (change your colors to (orange) in 2 ticks) needs MACROS's
      // comma to evaluate commas nested in it (see reports/TV-TURTLE.md), so
      // its color mixing is called directly here.
      { lisp: "(ask step-mother set your colors to ,(mix-colors '(red) (color-differences '(red) '(orange)) 0.5))", caption: "half way from red to orange" },
    ],
  },
};

// Run the demos when this file is run, not when bootDirector is imported.
if (import.meta.url === pathToFileURL(process.argv[1]).href) main();

function main() {
  const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(DEMOS);
  for (const name of wanted) if (!DEMOS[name]) throw new Error(`no demo named ${name}; there are ${Object.keys(DEMOS).join(", ")}`);
  mkdirSync(OUT, { recursive: true });
  let indexAll = {};
  try {
    indexAll = JSON.parse(readFileSync(join(OUT, "index.json"), "utf8"));
  } catch {
    indexAll = {};
  }
  for (const name of wanted) {
    const t0 = Date.now();
    const r = playDemo(name, DEMOS[name]);
    indexAll[name] = { color: r.color, frames: r.frames };
    console.log(`${name}: ${r.frames.length} frames in ${Date.now() - t0} ms`);
  }
  writeFileSync(join(OUT, "index.json"), JSON.stringify(indexAll, null, 1) + "\n");
}
