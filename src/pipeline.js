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
// Any of the revival's extensions asked for (EXTENSIONS) are loaded into each of them.
// Besides the files, pass2() returns the scene's plan as Ani left it (its glass box)
// and film() a record of every frame. Used by the web app's worker, so it runs in Node
// and in a browser, and by the tools (tools/run-film.mjs, run-story.mjs, check-1978.mjs);
// those that run one step at a time (tools/run-pass1.mjs, run-pass2.mjs, run-scene.mjs)
// boot each Lisp with boot() and run-scene.mjs records with recorder(), so that they
// make what the pipeline makes.
import { createLisp } from "./maclisp/index.js";
import { Cons, UNBOUND } from "./maclisp/types.js";
import { pictureArea } from "./tv/canvas.js";
import { UNIT_BIT } from "./tv/turtle.js";
import { collectChoicePoints, collectAppearances, collectLooks } from "./glassbox-pass1.js";

export const SCENES = ["introduction", "kept-apart", "no-longer-kept-apart", "meeting", "justice"];
// RUN's file names for each scene: the program is KEN;<fn1> <fn2>, the summary
// KEN1;<fn1> MINI and the printout KEN1;<fn1> PRINT.
export const FILE_NAMES = { introduction: "INTROD UCTION", "kept-apart": "KEPT APART", "no-longer-kept-apart": "NO LONGER", meeting: "MEET ING", justice: "JUST ICE" };
export const CHARACTERS = ["cinderella", "step-mother", "prince", "fairy-godmother"];

// ---------------------------------------------------------------- extensions

// The revival's extensions to Ani (reports/chapter-x/PLAN.md): files of ours in
// src/director/revive/ (REVIVE;<file>), loaded after the bridge, in this order, only
// when asked for, each file once (REVIVE;WRAP, the helper every extension wraps Ken's
// functions with, is the first file of each that needs it). With none, Ani runs as in
// 1978. changes1978: whether it changes what Ken's Cinderella makes
// (tools/check-1978.mjs --extensions checks those that don't; tools/check-ext.mjs
// compares those that do with their goldens). afterPass1: Lisp that pass 1 evaluates
// after (z) has made the choices and before save-answers saves them. recorder: what
// the filming records besides (recorder's options); looks: true means the extension
// chooses how the characters look (pass 1 returns its appearances, each scene's
// glass box its looks, and a cast may be larger than SHAPES).
export const EXTENSIONS = [
  {
    id: "mend",
    label: "Repairs for new stories",
    files: ["wrap", "mend1", "mend2", "mend3", "mend4", "mend5", "mend6", "mend7", "mend8", "mend9", "mend10", "mend11", "mend12"],
    requires: [],
    changes1978: false,
    note: "Repairs for failures new stories meet and Cinderella never does: (not X) and none values, unknown words, missing relationships and display methods, characters off the stage, COSUG's combine for change suggestions, and two characters with nothing to compare. Each leaves a (revival-repair: ...) note where it acted.",
  },
  {
    id: "appear",
    label: "Ani chooses how her characters look",
    files: ["wrap", "appear", "apsug", "shapes", "looks"],
    requires: [],
    changes1978: true,
    afterPass1: "(choose-appearances)",
    recorder: { looks: true },
    note: "Ani chooses each character's size and shape as she chooses how it moves (thesis pp. 163-164): choice points for size, shape-jaggedness and shape-complexity, made after the 102 dynamics choices, with suggestions from the characters' words, relationships, comparisons and dynamics and the film's levels, each with its evidence; shape experts turn the choices into a polygon, star or circle, and characters drawn alike have a shape choice made again to tell them apart. Pass 2 writes each character's look into the scene's program, and Director draws it.",
  },
];

// The appearance elements REVIVE;APPEAR defines, and their relative elements: a
// choice point for one of them is one of APPEAR's, not one of Ken's 102.
export const APPEARANCE_ELEMENTS = ["size", "shape-jaggedness", "shape-complexity"];
export function isAppearanceChoice(name) {
  const m = /\s(relative-)?([a-z-]+)\)$/.exec(String(name).toLowerCase());
  return Boolean(m) && APPEARANCE_ELEMENTS.includes(m[2]);
}

// Whether any of the extensions chooses how the characters look (recorder.looks).
export function choosesLooks(ids = []) {
  return extensionsFor(ids).some((e) => e.recorder && e.recorder.looks);
}

// The entries for a list of extension ids, with those they require, in registry
// order. An unknown id is an error.
export function extensionsFor(ids = []) {
  const byId = new Map(EXTENSIONS.map((e) => [e.id, e]));
  const wanted = new Set();
  const want = (id, by) => {
    if (!byId.has(id)) throw new Error(`no such extension: ${id}${by ? ` (required by ${by})` : ""}; known: ${EXTENSIONS.map((e) => e.id).join(", ")}`);
    if (wanted.has(id)) return;
    wanted.add(id);
    for (const r of byId.get(id).requires) want(r, id);
  };
  for (const id of ids || []) want(id);
  return EXTENSIONS.filter((e) => wanted.has(e.id));
}

// Load the extensions' files into a Lisp that has loaded the bridge: in registry
// order, each file once. Returns the files loaded. boot() calls it, for the pipeline
// and for the tools that run one step at a time (tools/run-pass1.mjs, ...).
export function loadExtensions(L, ids = []) {
  const files = [];
  for (const e of extensionsFor(ids)) for (const f of e.files) if (!files.includes(f)) files.push(f);
  for (const f of files) L.evalString(`(load '|revive;${f} >|)`);
  return files;
}

// Whether L can hold the revival's repair notes: REVIVE;WRAP, which every repair
// notes through, binds :revival-noted when it loads. Looked up without interning it,
// so that a Lisp running as in 1978 is left exactly as it was.
function noting(L) {
  const noted = L.obarray.find(":REVIVAL-NOTED");
  return Boolean(noted) && noted.value !== UNBOUND;
}

// A fresh Lisp with Director and the 1978 conventions loaded, as Ken's saved jobs had,
// and any of the revival's extensions asked for.
export function boot(fs, { backtrace = false, extensions = [] } = {}) {
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
  loadExtensions(L, extensions);
  return L;
}

// ---------------------------------------------------------------- pass 1

// Ani's choices for the film description in KEN;CINDY, saved as KEN;CP <version>, the
// file pass 2 loads (KEN;CP >). Returns how many choices were made and each choice
// point with its reasons (its glass box, as app/data/pass1.json has them), and, if the
// revival's repairs left notes (REVIVE;MEND8's on a comparison, say), those. An
// extension's afterPass1 runs after (z), before the choices are saved; with one that
// chooses the characters' looks (REVIVE;APPEAR), pass 1 also returns appearances
// (src/glassbox-pass1.js collectAppearances).
export function pass1(fs, { cpVersion = 30, backtrace = false, extensions = [] } = {}) {
  const L = boot(fs, { backtrace, extensions });
  L.evalString("(load '|ken;datest >|)");
  L.evalString("(init nil)");
  L.evalString("(z)");
  for (const e of extensionsFor(extensions)) if (e.afterPass1) L.evalString(e.afterPass1);
  L.evalString(`(save-answers '((ken) cp ${cpVersion}))`);
  const choicePoints = collectChoicePoints(L);
  const repairs = noting(L) ? repairNotes(L) : [];
  const appearances = choosesLooks(extensions) ? collectAppearances(L) : null;
  return { choices: choicePoints.length, choicePoints, ...(repairs.length ? { repairs } : {}), ...(appearances ? { appearances } : {}), lisp: L };
}

// ---------------------------------------------------------------- pass 2

// The scene planned and saved. Returns its glass box: every actor of the plan as Ani
// left it (the scene, its tasks with the methods suggested, rejected and scored, its
// subscenes, activities and special dynamics), each as its variables and the items it
// memorized, printed as Lisp; and, if the revival's repairs left notes, those.
export function pass2(fs, scene, { backtrace = false, setup = null, plan = null, extensions = [] } = {}) {
  const L = boot(fs, { backtrace, extensions });
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
  const glass = {
    scene: actor(L.intern(scene.toUpperCase())),
    tasks: tasks.map(actor),
    subscenes: subscenes.map(actor),
    plans: plans.map(actor),
    dynamics: names("(ask special-dynamics recall your descendants)").map(actor),
    choices: actor(L.readFromString(`(choices-made-in ${scene})`)),
  };
  // the notes only if an extension could have left some, and only if there are any, so
  // that a 1978 glass box is as it was and is made as it was
  const repairs = noting(L) ? repairNotes(L, glass) : [];
  if (repairs.length) glass.repairs = repairs;
  // the look each character is to take, as the program ends (REVIVE;APPEAR), only if
  // there are looks, for the same reason
  const looks = collectLooks(L, scene);
  if (looks.length) glass.looks = looks;
  return glass;
}

// The notes the revival's repairs left, (revival-repair: what W was X now Y because R)
// (REVIVE;WRAP), as { actor, note }: those of the glass box's actors, if there is a
// glass box, then of the choice points (pass 2 reads them from KEN;CP), then of any
// other actor revival-note noted, each actor once.
export function repairNotes(L, glass = null) {
  const lisp = (x) => L.print(x).toLowerCase();
  const isNote = (item) => item.startsWith("(revival-repair: ");
  const out = [];
  const seen = new Set();
  const add = (name, items) => {
    if (seen.has(name)) return;
    seen.add(name);
    for (const note of items.filter(isNote)) out.push({ actor: name, note });
  };
  if (glass) for (const a of [glass.scene, ...glass.tasks, ...glass.subscenes, ...glass.plans, ...glass.dynamics, glass.choices]) add(a.name, a.items);
  const others = L.toArray(L.evalString("(and (actor-of 'choice-point dont-autoload) (ask choice-point recall your childless-descendants))"));
  const noted = L.intern(":REVIVAL-NOTED").value;
  if (noted instanceof Cons) others.push(...L.toArray(noted).reverse());
  for (const x of others) {
    if (x === L.NIL || seen.has(lisp(x))) continue;
    L.intern("*GB-ACTOR*").value = x;
    add(lisp(x), L.toArray(L.evalString("(ask ,*gb-actor* collect items)")).map(lisp));
  }
  return out;
}

// ---------------------------------------------------------------- filming

// Hooks that record each frame as Ken's camera took it: ANINIT's after-new-frame-made
// calls (click) once the frame is on the screen. For each frame: the line segments
// each character was drawn with (TV dots from the picture's top left) and each
// character's state; and every event the movie noted, by frame. onClick, if given, is
// called at each click too (to save a picture, say). With looks (an extension that
// chooses how the characters look, REVIVE;APPEAR and LOOKS), film.looks records who
// looks how from which frame, changes only: [frame, character, { shape, angle,
// centerOffset, aniSize }], frame counted from 0 as frames are; frames[].chars is as
// it is without.
export function recorder(L, { onClick = null, cast = CHARACTERS, looks = false } = {}) {
  const film = { picture: null, frames: [], events: [] };
  if (looks) film.looks = [];
  const lastLook = {};
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
    if (looks) recordLooks(film.frames.length - 1);
    if (onClick) onClick(film.frames.length - 1);
    return L.T;
  });
  // each character's look as Director now draws it, kept when it changes
  function recordLooks(frame) {
    const all = L.evalString(`(mapcar (function (lambda (c) (list (ask ,c recall your shape) (ask ,c recall your angle)
                                                                  (ask ,c recall your center-offset) (ask ,c recall your ani-size))))
                                      '(${cast.join(" ")}))`);
    L.toArray(all).forEach((x, i) => {
      const [shape, angle, offset, size] = L.toArray(x);
      const num = (v) => (v === L.NIL ? null : Math.round(L.num.val(v) * 10000) / 10000);
      const look = {
        shape: shape === L.NIL ? null : L.print(shape).toLowerCase(), angle: num(angle),
        centerOffset: offset === L.NIL ? null : L.print(offset).toLowerCase(), aniSize: num(size),
      };
      const key = JSON.stringify(look);
      if (lastLook[cast[i]] !== key) {
        lastLook[cast[i]] = key;
        film.looks.push([frame, cast[i], look]);
      }
    });
  }
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
// are saved as KEN1;<movie> POSIT for the next scene's pass 2. If the revival's repairs
// left notes while it was filmed (REVIVE;MEND2's weightify guard, say, in Director's
// special dynamics), the film has them as repairs, as pass 2's glass box has its own.
export function film(fs, scene, { fps = 4, frames = 1000, backtrace = false, onClick = null, plan = null, extensions = [] } = {}) {
  const L = boot(fs, { backtrace, extensions });
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
  // what the extensions record besides (EXTENSIONS: recorder), such as the looks
  const more = Object.assign({}, ...extensionsFor(extensions).map((e) => e.recorder || {}));
  const record = recorder(L, { onClick, cast, ...more });
  L.evalString(`(start '${scene} ${fps})`);
  L.evalString(`(m ${frames})`);
  L.evalString(`(save-positions '${scene} '((ken1) ,(get '${scene} 'movie-name) posit))`);
  const f = { scene, ...record };
  if (fps !== 4) f.fps = fps; // Ken's TV previews ran at 4; the film was shot at 24 (ANINIT's running-color)
  if (plan && !plan.kenCast) f.cast = plan.cast.map((c) => ({ name: c.name, shape: c.shape }));
  const repairs = noting(L) ? repairNotes(L) : [];
  if (repairs.length) f.repairs = repairs; // only then, so a film is as it was
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
// When Ani chooses the looks (REVIVE;APPEAR), a character beyond those six starts as a
// hexagon of the usual size, which the look its scene's program gives it then replaces
// (REVIVE;LOOKS).
export const NEUTRAL_LOOK = { shape: "hexagon", lisp: "(set your angle to 60)" };
// How Ken drew his four in 1978: initialize-characters' shapes and sizes (aninit.65:36-47;
// .05 is every director-character's size, dichar.103:10) and running-color's colors
// (aninit.65:83-87). The film page and tools/check-appear.mjs set Ani's looks beside them.
export const KEN_LOOKS = {
  cinderella: { shape: "star", angle: 144, aniSize: 0.05, color: "green" },
  "step-mother": { shape: "square", angle: 90, aniSize: 0.07, color: "red" },
  prince: { shape: "triangle", angle: 120, aniSize: 0.05, color: "yellow" },
  "fairy-godmother": { shape: "circle", angle: 5, aniSize: 0.05, color: "orange" },
};

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
// characters keep their shapes; new ones take the others in order. With looks (Ani
// chooses them, REVIVE;APPEAR), those beyond SHAPES start with NEUTRAL_LOOK, which their
// chosen look replaces; without, there are shapes for six.
export function storyPlan(outline, { looks = false } = {}) {
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
    if (k === undefined && looks) return { name, shape: NEUTRAL_LOOK.shape, lisp: NEUTRAL_LOOK.lisp };
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
// extensions: the revival's extensions (EXTENSIONS) every step loads; none, as in 1978.
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
export function* makeFilmSteps(fs, { progress = () => {}, scenes = null, description = null, keepGoing = false, frames = 1000, fps = 4, extensions = [], onPass1 = () => {}, onScene = () => {} } = {}) {
  extensionsFor(extensions); // an unknown one stops the run before it starts
  let plan = null;
  if (description !== null) {
    const versions = fs.dirs.get("KEN")?.get("CINDY");
    const top = versions ? Math.max(0, ...[...versions.keys()].filter((k) => /^\d+$/.test(k)).map(Number)) : 0;
    fs.addFile("KEN", "CINDY", String(top + 1), { text: description, origin: "changed" });
    plan = storyPlan(storyOutline(description), { looks: choosesLooks(extensions) });
  }
  const order = scenes || (plan ? plan.scenes.map((s) => s.id) : SCENES);
  progress("pass1", choosesLooks(extensions) ? "Pass 1: choosing how each character moves and looks" : "Pass 1: choosing how each character moves");
  yield;
  const p1 = pass1(fs, { extensions });
  const out = { choices: p1.choices, choicePoints: p1.choicePoints, scenes: [] };
  if (extensions.length) out.extensions = extensionsFor(extensions).map((e) => e.id);
  if (p1.repairs) out.repairs = p1.repairs; // pass 1's, as each scene's glass box has its own
  if (p1.appearances) out.appearances = p1.appearances; // how Ani chose each character's look
  onPass1({ choices: p1.choices, choicePoints: p1.choicePoints, ...(p1.repairs ? { repairs: p1.repairs } : {}), ...(p1.appearances ? { appearances: p1.appearances } : {}) });
  for (const scene of order) {
    let done;
    try {
      progress("pass2", `Pass 2: planning ${scene.replace(/-/g, " ")}`, scene);
      yield;
      const { glass } = pass2(fs, scene, { plan, extensions });
      progress("film", `Filming ${scene.replace(/-/g, " ")}`, scene);
      yield;
      const { film: f } = film(fs, scene, { plan, frames, fps, extensions });
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
