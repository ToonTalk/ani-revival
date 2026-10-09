// Ani's whole pipeline, run the way Ken ran it in 1978, on one file system:
//
//   pass 1   DATEST: Ani chooses how each character moves and writes KEN;CP (as CP 29)
//   pass 2   RUN, for each scene: Ani plans it and writes the program Director will run
//            (KEN;KEPT APART, ...) and its summary (KEN1;KEPT MINI, ...)
//   film     ANINIT, for each scene: Director runs the program, films it at 4 frames a
//            second on a 550 by 413 picture, and saves where the characters ended up
//            (KEN1;KA POSIT, ...), which the next scene's pass 2 starts from
//
// Each step boots a fresh Lisp, as each was a separate job on ITS; they pass files.
// Besides the files, pass2() returns the scene's plan as Ani left it (its glass box)
// and film() a record of every frame. Used by tools/run-pass2.mjs, tools/run-scene.mjs
// and the web app's worker, so it runs in Node and in a browser.
import { createLisp } from "./maclisp/index.js";
import { pictureArea } from "./tv/canvas.js";
import { UNIT_BIT } from "./tv/turtle.js";
import { collectChoicePoints } from "./glassbox-pass1.js";

export const SCENES = ["introduction", "kept-apart", "no-longer-kept-apart", "meeting", "justice"];
// RUN's file names for each scene: the program is KEN;<fn1> <fn2>, the summary
// KEN1;<fn1> MINI and the printout KEN1;<fn1> PRINT.
export const FILE_NAMES = { introduction: "INTROD UCTION", "kept-apart": "KEPT APART", "no-longer-kept-apart": "NO LONGER", meeting: "MEET ING", justice: "JUST ICE" };
export const CHARACTERS = ["cinderella", "step-mother", "prince", "fairy-godmother"];

// A fresh Lisp with Director and the 1978 conventions loaded, as Ken's saved jobs had.
export function boot(fs, { backtrace = false } = {}) {
  const L = createLisp({ fs });
  L.formStack = backtrace ? [] : null;
  L.backtraceDepth = 4000;
  L.breakHandler = (tag) => {
    const e = new Error(`break ${L.print(tag)}`);
    e.lispBacktrace = (L.formStack || []).slice(-4000).reverse();
    throw e;
  };
  L.load(L.intern("KEN;LISP >"));
  L.load(L.intern("KEN;LOAD >"));
  L.evalString("(setq :print-load-messages nil)");
  L.evalString("(director '(ani direct))");
  L.evalString("(load '|revive;bridge >|)");
  return L;
}

// ---------------------------------------------------------------- pass 1

// Ani's choices for the film description in KEN;CINDY, saved as KEN;CP <version>, the
// file pass 2 loads (KEN;CP >). Returns how many choices were made and each choice
// point with its reasons (its glass box, as app/data/pass1.json has them).
export function pass1(fs, { cpVersion = 30, backtrace = false } = {}) {
  const L = boot(fs, { backtrace });
  L.evalString("(load '|ken;datest >|)");
  L.evalString("(init nil)");
  L.evalString("(z)");
  L.evalString(`(save-answers '((ken) cp ${cpVersion}))`);
  const choicePoints = collectChoicePoints(L);
  return { choices: choicePoints.length, choicePoints, lisp: L };
}

// ---------------------------------------------------------------- pass 2

// The scene planned and saved. Returns its glass box: every actor of the plan as Ani
// left it (the scene, its tasks with the methods suggested, rejected and scored, its
// subscenes, activities and special dynamics), each as its variables and the items it
// memorized, printed as Lisp.
export function pass2(fs, scene, { backtrace = false, setup = null } = {}) {
  const L = boot(fs, { backtrace });
  L.evalString("(cs)"); // Ken's Director was saved with the TV started; pass 2 measures places on it
  L.evalString("(load '|ken;run >|)");
  if (setup) setup(L);
  L.evalString(`(run '${scene})`);
  L.evalString(`(save '${scene} t)`);
  return { glass: glassBox(L, scene), lisp: L };
}

export function glassBox(L, scene) {
  const lisp = (x) => L.print(x).toLowerCase();
  const ev = (src) => L.evalString(src);
  function actor(name) {
    const out = { name: lisp(name), variables: {}, items: [] };
    L.intern("*GB-ACTOR*").value = name;
    for (const v of L.toArray(ev("(ask ,*gb-actor* list all your variable names)"))) {
      if (v === L.NIL) continue;
      L.intern("*GB-VARIABLE*").value = v;
      out.variables[lisp(v)] = lisp(ev("(ask ,*gb-actor* recall your ,*gb-variable*)"));
    }
    out.items = L.toArray(ev("(ask ,*gb-actor* collect items)")).map(lisp);
    return out;
  }
  const names = (src) => L.toArray(ev(src)).filter((x) => x !== L.NIL);
  const tasks = [...names(`(ask ${scene} recall your convey-tasks)`), ...names(`(ask ${scene} recall your establish-tasks)`)];
  const subscenes = names(`(ask ${scene} recall your subscenes)`);
  const plans = [];
  for (const s of subscenes) {
    L.intern("*GB-ACTOR*").value = s;
    for (const p of names("(ask ,*gb-actor* recall your plans)")) plans.push(p);
  }
  return {
    scene: actor(L.intern(scene.toUpperCase())),
    tasks: tasks.map(actor),
    subscenes: subscenes.map(actor),
    plans: plans.map(actor),
    dynamics: names("(ask special-dynamics recall your descendants)").map(actor),
    choices: actor(L.readFromString(`(choices-made-in ${scene})`)),
  };
}

// ---------------------------------------------------------------- filming

// Hooks that record each frame as Ken's camera took it: ANINIT's after-new-frame-made
// calls (click) once the frame is on the screen. For each frame: the line segments
// each character was drawn with (TV dots from the picture's top left) and each
// character's state; and every event the movie noted, by frame. onClick, if given, is
// called at each click too (to save a picture, say).
export function recorder(L, { onClick = null } = {}) {
  const film = { picture: null, frames: [], events: [] };
  let drawing = null;
  let segs = {};
  const seen = new Set();
  L.defsubr("REVIVE-DRAWING", (...a) => {
    if (a.length) drawing = a[0] === L.NIL ? null : L.print(a[0]).toLowerCase();
    return drawing ? L.intern(drawing.toUpperCase()) : L.NIL;
  });
  L.defsubr("REVIVE-EVENT", (frame, event) => {
    const key = `${L.print(frame)} ${L.print(event).toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      film.events.push([typeof frame === "number" ? frame : null, L.print(event).toLowerCase()]);
    }
    return L.NIL;
  });
  L.defsubr("CLICK", () => {
    const states = L.evalString(`(mapcar (function (lambda (c) (list (ask ,c recall your state) (ask ,c recall your visibility)
                                                                    (ask ,c recall your special-dynamics) (ask ,c recall your current-goal))))
                                         '(${CHARACTERS.join(" ")}))`);
    const chars = {};
    L.toArray(states).forEach((st, i) => {
      const [state, vis, sd, goal] = L.toArray(st);
      const xyh = state !== L.NIL && typeof state === "object" ? L.toArray(state).map((v) => L.num.val(v)) : null;
      chars[CHARACTERS[i]] = {
        state: xyh && xyh.map((v) => Math.round(v * 100) / 100), visible: vis !== L.NIL,
        dynamics: sd === L.NIL ? null : L.print(sd).toLowerCase(), goal: goal === L.NIL ? null : L.print(goal).toLowerCase(),
      };
    });
    film.frames.push({ segs, chars });
    segs = {};
    if (onClick) onClick(film.frames.length - 1);
    return L.T;
  });
  // who draws each segment, and each event the movie notes
  L.evalString(`(progn
     (define-extension-method (display) object
       (cond ((revive-drawing) (ask-old :self display))
             (t (revive-drawing (name-of :self)) (ask-old :self display) (revive-drawing nil))))
     (define-extension-method (note that ?event happened) director-subscene
       (revive-event (ask ,(ask movie recall your current-movie) recall your frame-count) event)
       (ask-old :self note that ,event happened)))`);
  // the segments drawn since the screen was last wiped (the frame handler wipes and
  // redraws before each click)
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
  return film;
}

// The scene filmed in black and white, with a record of every frame; its end positions
// are saved as KEN1;<movie> POSIT for the next scene's pass 2.
export function film(fs, scene, { fps = 4, frames = 1000, backtrace = false, onClick = null } = {}) {
  const L = boot(fs, { backtrace });
  L.evalString("(cs)");
  L.evalString("(load '|ken;aninit >|)");
  // ANINIT filmed at 550 by 413 dots ((tvsize 550 413) before each click), as the
  // thesis's flipbook confirms; the size changes how far characters go
  L.evalString("(tvsize 550 413)");
  L.evalString("(ask ani-movie set your after-new-frame-made to (click))");
  const record = recorder(L, { onClick });
  L.evalString(`(start '${scene} ${fps})`);
  L.evalString(`(m ${frames})`);
  L.evalString(`(save-positions '${scene} '((ken1) ,(get '${scene} 'movie-name) posit))`);
  return { film: { scene, ...record }, lisp: L };
}

// ---------------------------------------------------------------- the whole film

// Pass 1, then each scene's pass 2 and filming, in order, on fs, whose KEN;CINDY is the
// film description to use, unless description (the text of a changed one) is given:
// that becomes the next version of KEN;CINDY, which DATEST and RUN load.
// progress(step, detail, scene) reports each step as it starts; onPass1(result) and
// onScene(scene) report each result as it is made. With keepGoing, a scene Ani can't
// plan or film is reported as { id, error } and the next scene is tried.
export function makeFilm(fs, { progress = () => {}, scenes = SCENES, description = null, keepGoing = false, onPass1 = () => {}, onScene = () => {} } = {}) {
  if (description !== null) {
    const versions = fs.dirs.get("KEN")?.get("CINDY");
    const top = versions ? Math.max(0, ...[...versions.keys()].filter((k) => /^\d+$/.test(k)).map(Number)) : 0;
    fs.addFile("KEN", "CINDY", String(top + 1), { text: description, origin: "changed" });
  }
  progress("pass1", "Pass 1: choosing how each character moves");
  const p1 = pass1(fs);
  const out = { choices: p1.choices, choicePoints: p1.choicePoints, scenes: [] };
  onPass1({ choices: p1.choices, choicePoints: p1.choicePoints });
  for (const scene of scenes) {
    let done;
    try {
      progress("pass2", `Pass 2: planning ${scene.replace(/-/g, " ")}`, scene);
      const { glass } = pass2(fs, scene);
      progress("film", `Filming ${scene.replace(/-/g, " ")}`, scene);
      const { film: f } = film(fs, scene);
      done = { id: scene, film: f, glass };
    } catch (e) {
      if (!keepGoing) throw e;
      done = { id: scene, error: String((e && e.message) || e) };
    }
    out.scenes.push(done);
    onScene(done);
  }
  return out;
}
