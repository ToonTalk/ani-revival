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
export function pass2(fs, scene, { backtrace = false, setup = null, plan = null } = {}) {
  const L = boot(fs, { backtrace });
  L.evalString("(cs)"); // Ken's Director was saved with the TV started; pass 2 measures places on it
  L.evalString("(load '|ken;run >|)");
  let before = "";
  if (plan && !plan.ken) {
    // a new story's scenes: where RUN saves each and which POSIT file it starts from
    L.evalString(`(progn ${plan.scenes.map((s) => `(putprop '${s.id} '(${s.file.join(" ")}) 'file-name) (putprop '${s.id} '${s.position ? `((ken1) ${s.position} posit)` : "nil"} 'position-file)`).join(" ")})`);
    // and the decisions of the scenes it refers to (from-scene), as RUN loads KEPT MINI for no-longer-kept-apart
    const s = plan.scenes.find((x) => x.id === scene);
    if (s && s.mini.length) before = ` nil '(progn ${s.mini.map((fn1) => `(director-load '((ar9 ken1) ${fn1} mini) '(to get previous scene decisions))`).join(" ")})`;
  }
  if (setup) setup(L);
  L.evalString(`(run '${scene}${before})`);
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
export function recorder(L, { onClick = null, cast = CHARACTERS } = {}) {
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
                                         '(${cast.join(" ")}))`);
    const chars = {};
    L.toArray(states).forEach((st, i) => {
      const [state, vis, sd, goal] = L.toArray(st);
      const xyh = state !== L.NIL && typeof state === "object" ? L.toArray(state).map((v) => L.num.val(v)) : null;
      chars[cast[i]] = {
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
export function film(fs, scene, { fps = 4, frames = 1000, backtrace = false, onClick = null, plan = null } = {}) {
  const L = boot(fs, { backtrace });
  L.evalString("(cs)");
  L.evalString("(load '|ken;aninit >|)");
  let cast = CHARACTERS;
  if (plan && !plan.ken) {
    // a new story's scenes: the program ANINIT loads for each and its movie's name
    L.evalString(`(progn ${plan.scenes.map((s) => `(putprop '${s.id} '(${s.file.join(" ")}) 'scene-file) (putprop '${s.id} '${s.movie} 'movie-name)`).join(" ")})`);
  }
  if (plan && !plan.kenCast) {
    // a new cast, defined as ANINIT's initialize-characters defines Ken's; his four, made
    // when ANINIT loaded, go first
    cast = plan.cast.map((c) => c.name);
    const gone = CHARACTERS.filter((c) => !cast.includes(c));
    L.evalString(`(progn ${gone.map((c) => `(ask ${c} unmake)`).join(" ")}
      (define-function initialize-characters nil
        ${plan.cast.map((c) => `(define ${c.name} director-character ${c.lisp})`).join("\n        ")}))`);
  }
  // ANINIT filmed at 550 by 413 dots ((tvsize 550 413) before each click), as the
  // thesis's flipbook confirms; the size changes how far characters go
  L.evalString("(tvsize 550 413)");
  L.evalString("(ask ani-movie set your after-new-frame-made to (click))");
  const record = recorder(L, { onClick, cast });
  L.evalString(`(start '${scene} ${fps})`);
  L.evalString(`(m ${frames})`);
  L.evalString(`(save-positions '${scene} '((ken1) ,(get '${scene} 'movie-name) posit))`);
  const f = { scene, ...record };
  if (fps !== 4) f.fps = fps; // Ken's TV previews ran at 4; the film was shot at 24 (ANINIT's running-color)
  if (plan && !plan.kenCast) f.cast = plan.cast.map((c) => ({ name: c.name, shape: c.shape }));
  return { film: f, lisp: L };
}

// ---------------------------------------------------------------- new stories

// Ken's names for Cinderella's scenes: RUN's (fn1 fn2) for each scene's program and
// summary, and ANINIT's movie name, which names the POSIT file of where it ended.
const KEN_SCENE_FILES = {
  introduction: ["introd", "uction", "intro"], "kept-apart": ["kept", "apart", "ka"],
  "no-longer-kept-apart": ["no", "longer", "nl"], meeting: ["meet", "ing", "me"], justice: ["just", "ice", "ju"],
};
// The shapes ANINIT's initialize-characters gave Ken's cast, and two more for a larger one.
export const SHAPES = [
  { shape: "star", lisp: "(set your angle to 144) (set your center-offset to (right 18))" },
  { shape: "square", lisp: "(set your ani-size to .07) (set your angle to 90)" },
  { shape: "triangle", lisp: "(set your angle to 120) (set your center-offset to (right 30))" },
  { shape: "circle", lisp: "(set your angle to 5)" },
  { shape: "pentagon", lisp: "(set your angle to 72)" },
  { shape: "hexagon", lisp: "(set your angle to 60)" },
];
const KEN_SHAPES = { cinderella: 0, "step-mother": 1, prince: 2, "fairy-godmother": 3 };

// A film description read as MacLisp would (; comments, |symbols|, "strings", / escapes),
// enough to find its top-level forms.
function readForms(text) {
  const forms = [];
  const n = text.length;
  let i = 0;
  const skip = () => {
    for (;;) {
      while (i < n && /\s/.test(text[i])) i++;
      if (text[i] !== ";") return;
      while (i < n && text[i] !== "\n") i++;
    }
  };
  const read = () => {
    skip();
    const c = text[i];
    if (c === "(") {
      i++;
      const list = [];
      for (;;) {
        skip();
        if (i >= n) throw new Error("a ( is never closed");
        if (text[i] === ")") { i++; return list; }
        list.push(read());
      }
    }
    if (c === ")") throw new Error("there is an extra )");
    if (c === "'") { i++; return ["quote", read()]; }
    if (c === "|" || c === '"') {
      const j = text.indexOf(c, i + 1);
      const tok = text.slice(i, j < 0 ? n : j + 1);
      i = j < 0 ? n : j + 1;
      return tok;
    }
    let tok = "";
    while (i < n && !/[\s()';|"]/.test(text[i])) {
      if (text[i] === "/") { tok += text[i + 1] || ""; i += 2; continue; }
      tok += text[i++];
    }
    return tok.toLowerCase();
  };
  for (skip(); i < n; skip()) forms.push(read());
  return forms;
}

// What RUN and ANINIT need to know of a film description: its scenes in order, its
// characters, and the earlier scenes each scene refers to (from-scene ...).
export function storyOutline(text) {
  const scenes = [], characters = [], fromScenes = {};
  const refs = (x, out) => {
    if (Array.isArray(x)) {
      if (x[0] === "from-scene" && typeof x[1] === "string") out.push(x[1]);
      for (const y of x) refs(y, out);
    }
    return out;
  };
  for (const f of readForms(text)) {
    if (!Array.isArray(f) || f[0] !== "define" || typeof f[1] !== "string") continue;
    if (f[2] === "scene") { scenes.push(f[1]); fromScenes[f[1]] = [...new Set(refs(f, []))]; }
    if (f[2] === "character") characters.push(f[1]);
  }
  return { scenes, characters, fromScenes };
}

// How a story's scenes and cast are named and drawn. Ken's own five scenes keep
// everything as RUN and ANINIT have it (ken); any other list of scenes is numbered:
// KEN;STORY<n> SCENE for the program, KEN1;STORY<n> MINI for the summary, FILM<n> for
// the movie, each scene starting from the POSIT file of the one before. Ken's four
// characters keep their shapes; new ones take the others in order.
export function storyPlan(outline) {
  if (!outline.scenes.length) throw new Error("the film description defines no scenes");
  if (!outline.characters.length) throw new Error("the film description defines no characters");
  const ken = outline.scenes.length === SCENES.length && outline.scenes.every((s, k) => s === SCENES[k]);
  const kenCast = outline.characters.length === CHARACTERS.length && CHARACTERS.every((c) => outline.characters.includes(c));
  const scenes = outline.scenes.map((id, k) => {
    const own = KEN_SCENE_FILES[id];
    return { id, file: own ? own.slice(0, 2) : [`story${k + 1}`, "scene"], movie: own ? own[2] : `film${k + 1}` };
  });
  scenes.forEach((s, k) => {
    s.position = k ? scenes[k - 1].movie : null;
    // RUN itself loads KEPT MINI for no-longer-kept-apart
    s.mini = s.id === "no-longer-kept-apart" ? [] : (outline.fromScenes[s.id] || []).map((x) => scenes.find((y) => y.id === x)).filter(Boolean).map((x) => x.file[0]);
  });
  const taken = new Set(outline.characters.map((c) => KEN_SHAPES[c]).filter((x) => x !== undefined));
  const free = SHAPES.map((_, k) => k).filter((k) => !taken.has(k));
  const cast = outline.characters.map((name) => {
    const k = KEN_SHAPES[name] ?? free.shift();
    if (k === undefined) throw new Error(`Ani's films have shapes for at most ${SHAPES.length} characters`);
    return { name, shape: SHAPES[k].shape, lisp: SHAPES[k].lisp };
  });
  return { ken, kenCast, scenes, cast };
}

// ---------------------------------------------------------------- the whole film

// Pass 1, then each scene's pass 2 and filming, in order, on fs, whose KEN;CINDY is the
// film description to use, unless description (the text of a changed one) is given:
// that becomes the next version of KEN;CINDY, which DATEST and RUN load, and its own
// scenes are made, in the order it defines them.
// progress(step, detail, scene) reports each step as it starts; onPass1(result) and
// onScene(scene) report each result as it is made. With keepGoing, a scene Ani can't
// plan or film is reported as { id, error } and the next scene is tried. frames caps
// each scene's filming (Ken's (m 1000)), for a scene that never ends. fps is how many
// frames Director films a second: 4, as on Ken's TV previews and in the thesis's
// flipbook, or 24, as the film was shot (ANINIT's running-color); each scene's pass 2
// starts from where the last one's filming left the characters, so the two runs differ.
export function makeFilm(fs, options = {}) {
  const steps = makeFilmSteps(fs, options);
  for (;;) {
    const r = steps.next();
    if (r.done) return r.value;
  }
}

// The same, one step at a time: a generator that pauses after reporting each step's
// progress and before running it, so a page can show the progress before the step
// (up to a minute's work) holds it up.
export function* makeFilmSteps(fs, { progress = () => {}, scenes = null, description = null, keepGoing = false, frames = 1000, fps = 4, onPass1 = () => {}, onScene = () => {} } = {}) {
  let plan = null;
  if (description !== null) {
    const versions = fs.dirs.get("KEN")?.get("CINDY");
    const top = versions ? Math.max(0, ...[...versions.keys()].filter((k) => /^\d+$/.test(k)).map(Number)) : 0;
    fs.addFile("KEN", "CINDY", String(top + 1), { text: description, origin: "changed" });
    plan = storyPlan(storyOutline(description));
  }
  const order = scenes || (plan ? plan.scenes.map((s) => s.id) : SCENES);
  progress("pass1", "Pass 1: choosing how each character moves");
  yield;
  const p1 = pass1(fs);
  const out = { choices: p1.choices, choicePoints: p1.choicePoints, scenes: [] };
  onPass1({ choices: p1.choices, choicePoints: p1.choicePoints });
  for (const scene of order) {
    let done;
    try {
      progress("pass2", `Pass 2: planning ${scene.replace(/-/g, " ")}`, scene);
      yield;
      const { glass } = pass2(fs, scene, { plan });
      progress("film", `Filming ${scene.replace(/-/g, " ")}`, scene);
      yield;
      const { film: f } = film(fs, scene, { plan, frames, fps });
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
