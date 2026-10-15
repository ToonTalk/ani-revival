// Ani's whole pipeline, run the way Ken ran it in 1978, on one file system:
//
//   pass 1   DATEST: Ani chooses how each character moves and writes KEN;CP (as CP 29)
//   pass 2   RUN, for each scene: Ani plans it and writes the program Director will run
//            (KEN;KEPT APART, ...) and its summary (KEN1;KEPT MINI, ...)
//   film     ANINIT, for each scene: Director runs the program, films it at 4 frames a
//            second on a 550 by 413 picture, and saves where the characters ended up
//            (KEN1;KA POSIT, ...), which the next scene's pass 2 starts from
//   and, with the revival's CHANGE, before the pass 2 of a scene that changes someone:
//   pass 1 again  DATEST: Ani's fresh look at whoever changes, everyone else held, saved
//            as KEN1;<fn1> BECOME, which the later scenes' pass 2 loads and the scene's own
//            pass 2 shows the change by (REVIVE;CHSHOW); and once more with everyone
//            chosen afresh, for comparison
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
import { collectChoicePoints, collectAppearances, collectLooks, toJSON, plistGet } from "./glassbox-pass1.js";

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
// glass box its looks, and a cast may be larger than SHAPES). group: where the page's
// "Which extensions" panel lists it, "repairs" (repairs to 1978 limits) or "knowledge"
// (knowledge Ken could have added); optIn: not among those the page's switch turns on
// (Ken's decision 3 of 9 October: the switch turns on MEND, KNOW, APPEAR and CHANGE,
// and SLIPS and DETAIL are opt-in).
export const EXTENSIONS = [
  {
    id: "mend",
    label: "Repairs for new stories",
    group: "repairs",
    files: ["wrap", "mend1", "mend2", "mend3", "mend4", "mend5", "mend6", "mend7", "mend8", "mend9", "mend10", "mend11", "mend12", "mend13", "mend14", "mend15", "mend16", "mend17", "mend18", "mend19"],
    requires: [],
    changes1978: false,
    note: "Repairs for failures new stories meet and Cinderella never does: (not X) and none values, unknown words, missing relationships and display methods, characters off the stage, COSUG's combine for change suggestions, two characters with nothing to compare, measuring from a small way from two places to a third, more than a few ways to convey what a task establishes, a scene that is one task shown by one, and a place far off and off the stage that PLACE asks for and never defines. Each leaves a (revival-repair: ...) note where it acted.",
  },
  {
    id: "appear",
    label: "Ani chooses how her characters look",
    group: "knowledge",
    files: ["wrap", "appear", "apsug", "shapes", "colors", "looks", "alter"],
    requires: [],
    changes1978: true,
    afterPass1: "(choose-appearances)",
    recorder: { looks: true },
    note: "Ani chooses each character's size, shape and color as she chooses how it moves (thesis pp. 163-164): choice points for size, shape-jaggedness, shape-complexity and a color's intensity, saturation and hue, made after the 102 dynamics choices, with suggestions from the characters' words, relationships, comparisons and dynamics and the film's levels, each with its evidence; shape experts turn the choices into a polygon, star or circle, characters drawn alike have a shape choice made again to tell them apart, and the hue is one of six on a painter's wheel, a small semantic net of colors (p. 240). Pass 2 writes each character's look into the scene's program, and Director draws it; and looks change during a scene as Ani plans them, as display methods beside the dynamics changes (p. 166): joy brightens a character's colors, sadness dims them. Director keeps the colors without drawing them, and the film page paints them in color.",
  },
  {
    id: "change",
    label: "Characters who change",
    group: "knowledge",
    files: ["wrap", "change", "chshow"],
    // a change is shown by her wandering, as MEND9's wander-around wanders, and the one
    // it changes is brought on by MEND6's bring-on; a change story is a new story, which
    // needs MEND's repairs anyway
    requires: ["mend"],
    changes1978: false,
    sceneSteps: true,
    note: "A scene may change a character, as Ken wrote one in his cinderella-beautified scene: (change (personality step-mother (and evil mean)) (personality step-mother (and good kind))), alone or inside (causes prince ...). Ani takes a fresh look at whoever changes (thesis p. 168): pass 1 again, with the new words, every choice of everyone else held as it was, so that only the changed character is chosen again, and with APPEAR how she looks too. In the scene of the change she shows it (p. 169): the cause goes to the one it changes, and once they touch she changes as she wanders about, or she wanders as she changes if nothing causes it; Ani bridges the gap between how she moved and looked and how she will, over a time she decides, gradually, since an abrupt change could be misread, or at once if the cause is magical (the revival's rule). From the next scene on she is described, moves and looks as she has become. A full recompute, with everyone chosen afresh, is kept for comparison.",
  },
  {
    id: "know",
    label: "Knowledge Ken could have added",
    group: "knowledge",
    files: ["wrap", "know", "knowds", "knowrl", "knowcv", "knowdi", "knowem"],
    // its display methods bring on a character off the stage with MEND6's bring-on, and
    // its feelings are combined with joy by MEND7's repair of COSUG's combine
    requires: ["mend"],
    changes1978: true,
    note: "Knowledge Ken could have added (thesis p. 19: words such as \"clever\", \"fears\" or \"helps\" \"could be added\"), each piece in the idiom of the file of his it extends and each with its evidence or the revival's reason: words for characters (gentle, rough, nervous, calm, cheerful, gloomy, clever, brave, cowardly, curious, playful, old, young, slow and quick, and timid, wicked and cruel, which borrow from shy, evil and mean); relationships (dislikes and fears; ways of showing likes, is-obedient-to, is-helpful-towards, and, by Ken's decision 10, is-protective-to, is-grateful-to and is-intolerant-of; is-protective-of a neighbor of is-protective-to); ways of showing helps, avoids and follows (helps-along, moves-away-from and follows-behind); feelings (pride, anticipation, loneliness, fear and anger); and a word with no way of showing itself borrowing its neighbors' (dscrp.17:183). Ken's Cinderella makes the same choices in pass 1; in pass 2 Cinderella follows her stepmother and helps the Prince in the Introduction, where Ani had no idea how in 1978, and the stepmother's pride makes her paths smoother in Kept Apart.",
  },
  {
    // Ken's testing of the film page (15 October): a feeling's part with nothing else to
    // do left everyone standing still for seconds while the feeling ran. Not in MEND,
    // since it changes Ken's Cinderella (his Meeting's last part); switched on with the
    // four by default (the page's switch must list it beside them)
    id: "seen",
    label: "Changes seen when no one has anything to do",
    group: "repairs",
    files: ["wrap", "seen"],
    // the wander is REVIVE;MEND9's: its walks, and joining a subscene's movements
    requires: ["mend"],
    changes1978: true,
    note: "A feeling changes how a character moves (joy makes her faster and bouncier), but \"cannot stand alone\" (thesis pp. 125-126): where a character has only changes in a part, Ken's SCENE extends the activity before it, or has her \"wander around\" at the start of a scene, \"so that the changes are apparent\". In Director the extended activity can end before the changes do (Director runs a change at high speed four times longer than Ani planned), and a character may have had no part in it, so everyone stood still while the feeling ran on. The revival's repair, which Ken approved: in such a part, once nothing else moves her, she wanders about while her changes run, across the stage and back as SCENE's wander does, and stops when they end. In Ken's Cinderella, Cinderella and the Prince wander after they meet at the end of the Meeting, as their joy runs; in Kept Apart the stepmother and Cinderella stand guard to the end, as in 1978. Each part leaves a note where it acted.",
  },
  {
    id: "slips",
    label: "Corrections of slips in Ken's files",
    group: "repairs",
    optIn: true,
    files: ["wrap", "slips", "slips1", "slips2", "slips3", "slips6", "slips7", "slips8", "slips9"],
    // S1 has good's helping find someone to help, which needs KNOW's way of showing
    // helping (REVIVE;KNOWCV): without it the helping is chosen and then dropped
    requires: ["know"],
    changes1978: true,
    // REVIVE;SLIPS3's notes on the choice points of a friendly character's tendencies
    afterPass1: "(note-friendlys-attractions)",
    note: "Corrections of slips in Ken's files, places where his code does something other than what the code beside it, his comments or his thesis say it is to do, each quoting the line it corrects (Ken's decision 2): is-not looks for someone in the task's scene, where it was given the task and never found anyone, and is-described-as is a preference, ideally all of the words, then any, then anyone (p. 100); a high level of variety picks the least used value and a low the most used, as the thesis says (p. 85); friendly's attractions are named as the elements are; a method's prerequisites are read under the name they are kept by; MIDDLE compares itself with (not bottom); and in Director, a character's dynamics take their parent's factors once, however often they are set, and a gradual change runs at the speed Ani's estimate gives it (the run confirmed the inversion: four times as long as planned at high speed, a quarter at low), grows once a tick, and takes as many steps as it counts. In Ken's Cinderella, Cinderella helps her stepmother in the Introduction, the stepmother's guard no longer slows down cycle by cycle in Kept Apart, and every feeling changes her characters at the pace Ani planned. Each correction leaves a note where it acted.",
  },
  {
    id: "detail",
    label: "A few of the \"myriad details\"",
    group: "knowledge",
    optIn: true,
    files: ["wrap", "detail", "dtwalk", "dttend", "dtrhym"],
    // a tendency or deliberateness left (not X) or none is read as MEND reads it, and a
    // new story needs MEND's repairs anyway
    requires: ["mend"],
    changes1978: true,
    note: "A few of the low-level details the thesis names as left undone (pp. 183-187, \"Attending to Myriad Details\"), each the revival's reading of its sentence: a character's deliberateness shapes its path in Director's walk, how often, how quickly and how far it changes direction (f), a deliberate character going in longer arcs with smaller jags; its tendencies towards friends, enemies and strangers feed the best-when scores of the ways of showing that take it to another or away (c); and a scene's rhythm, fast, slow or changing, suggests changes of speed, as an emotional state does (B.2 (a)). In Ken's Cinderella the stepmother walks deliberately and the fairy godmother not, Kept Apart starts quicker and ends slower, and No Longer Kept Apart and the Meeting are quicker. Each leaves a note where it acted.",
  },
];

// The appearance elements REVIVE;APPEAR defines, and their relative elements: a
// choice point for one of them is one of APPEAR's, not one of Ken's 102.
export const APPEARANCE_ELEMENTS = ["color-intensity", "color-saturation", "color-hue", "size", "shape-jaggedness", "shape-complexity"];
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
// (src/glassbox-pass1.js collectAppearances). setup, if given, is called with the Lisp
// once it has booted, before DATEST loads (tools/check-appear.mjs leaves out some of
// APPEAR's knowledge with it).
export function pass1(fs, { cpVersion = 30, backtrace = false, extensions = [], setup = null } = {}) {
  const L = boot(fs, { backtrace, extensions });
  if (setup) setup(L);
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

// ---------------------------------------------------------------- pass 1 again

// What becomes of each element Ani chooses for a character's dynamics, for the glass
// box of a change: Director draws speed and the path's curvature, length and
// jaggedness (dichar.103:164-169); pass 2 repeats an activity as often as the
// rhythmic level, activity level and repetiveness say (place.45:411-420); acceleration
// and deliberateness are chosen and used by neither, as in 1978 (thesis X.B.3: (d),
// L4830-4836, characters "accelerate instantaneously despite the fact that much effort
// was expended determining the acceleration"; (f), L4853-4856, deliberateness); the
// attractions only pass 1 reads.
export const ELEMENT_USE = {
  speed: "director", "path-curvature": "director", "path-length": "director", "path-jaggedness": "director",
  "rhythmic-level": "cycles", "activity-level": "cycles", repetiveness: "cycles",
  acceleration: "none", deliberateness: "none",
  "attraction-towards-friends": "none", "attraction-towards-enemies": "none", "attraction-towards-strangers": "none",
  // with APPEAR, how she looks, which Director draws (REVIVE;LOOKS)
  size: "looks", "shape-jaggedness": "looks", "shape-complexity": "looks", "color-intensity": "looks", "color-saturation": "looks", "color-hue": "looks",
};
// What becomes of an element with these extensions: ELEMENT_USE's, but with DETAIL
// (REVIVE;DTWALK and DTTEND) Director's walk reads deliberateness ("director"), and the
// best-when scores of the ways of showing read the attractions ("best-when").
export function elementUse(element, extensions = []) {
  if (extensionsFor(extensions).some((e) => e.id === "detail")) {
    if (element === "deliberateness") return "director";
    if (element.startsWith("attraction-towards-")) return "best-when";
  }
  return ELEMENT_USE[element] || "none";
}

const becomeFiles = (fn1s) => `'(${fn1s.map((fn1) => `((ken1) ${fn1} become)`).join(" ")})`;
// The extensions a job of CHANGE's own boots with: those asked for, and CHANGE.
const withChange = (extensions) => (extensions.includes("change") ? extensions : [...extensions, "change"]);
// What pass 1 does after (z) with these extensions (EXTENSIONS' afterPass1), for the
// fresh look and the recompute to do it too: with APPEAR, Ani chooses how they look.
const afterZ = (extensions) => `'(${extensionsFor(extensions).filter((e) => e.afterPass1).map((e) => e.afterPass1).join(" ")})`;
// A look as REVIVE;CHANGE keeps it, ((shape hexagon) (angle 60) ... (look-color (270.0 0.35
// 0.65))), as { shape, angle, centerOffset, aniSize, hue, color }, or null.
function lookOf(L, x) {
  if (!(x instanceof Cons)) return null;
  const parts = Object.fromEntries(L.toArray(x).map((p) => { const [k, v] = L.toArray(p); return [L.print(k).toLowerCase(), v]; }));
  const lisp = (v) => (v === undefined || v === L.NIL ? null : L.print(v).toLowerCase());
  const num = (v) => (v === undefined || v === L.NIL ? null : L.num.val(v));
  return {
    shape: lisp(parts.shape), angle: num(parts.angle), centerOffset: lisp(parts["center-offset"]), aniSize: num(parts["ani-size"]), hue: lisp(parts.hue),
    color: parts["look-color"] instanceof Cons ? L.toArray(parts["look-color"]).map((v) => L.num.val(v)) : null,
  };
}
// The characters a choice point is of: (choice-point-of c e) and
// (relative-choice-point-of (a b) e), as toJSON gives them.
const choicePointCharacters = (name) => (Array.isArray(name) ? (Array.isArray(name[1]) ? name[1] : [name[1]]) : []);

// Ani's fresh look at the characters a scene changes (REVIVE;CHANGE take-a-fresh-look):
// pass 1 again as of the scene, the film description with the changes of the scenes up
// to and including it, every choice of everyone else held as it was (the story's
// KEN;CP, as pass 1 wrote it, and the BECOME files of the scenes before), so that only
// the changed characters are chosen again; their new values are written to
// KEN1;<fn1> BECOME, which the later scenes' pass 2 loads. plan is the story's
// (storyPlan with change); becomes, if given, names the earlier BECOME files to hold
// (by default the plan's). Returns, for the glass box:
//   { scene, file, characters: [{ character, actor, changes, causes, values,
//     relativeValues, choicePoints, notDescribed, looks? }], held, lisp }
// values: every element, { element, before, after, changed, use } (use: elementUse);
// relativeValues: { choicePoint, value }; choicePoints: the fresh look's choice points
// of the character, absolute and relative, as pass 1's glass box has them
// (collectChoicePoints); notDescribed: the old words of her changes her description
// didn't have, so that the change took nothing away for them; looks, when Ani chooses
// the looks (REVIVE;APPEAR), how she was drawn before and how the fresh look draws her,
// { before, after, changed }, each as lookOf gives it (values then has the elements of a
// look too, use "looks"); held: each other choice the fresh look held that would have
// come out differently, { choicePoint, heldAt, wouldHaveChosen }.
export function freshLook(fs, scene, { plan, extensions = [], becomes = null, backtrace = false } = {}) {
  const s = plan.scenes.find((x) => x.id === scene);
  const L = boot(fs, { backtrace, extensions: withChange(extensions) });
  const lisp = (x) => L.print(x).toLowerCase();
  L.evalString("(load '|ken;datest >|)");
  const definitions = L.toArray(L.evalString(`(take-a-fresh-look '${scene} '((ken) cp >) ${becomeFiles(becomes || s.becomes || [])} '((ken1) ${s.become} become) ${afterZ(extensions)})`));
  const changed = definitions.map((d) => lisp(L.toArray(L.toArray(d)[1])[1]));
  const choicePoints = collectChoicePoints(L, (name) => choicePointCharacters(name).some((c) => changed.includes(c)));
  const characters = definitions.map((d) => {
    const [, name, , ...settings] = L.toArray(d);
    const set = {};
    for (const x of settings) {
      const words = L.toArray(x);
      set[lisp(words[2])] = words[4];
    }
    const pairs = (v) => L.toArray(v).map((p) => L.toArray(p).map((y) => toJSON(L, y)));
    const before = new Map(pairs(set["old-values"]).map(([e, v]) => [e, v]));
    const character = lisp(L.toArray(name)[1]);
    return {
      character, actor: lisp(name),
      changes: L.toArray(set.changes).map(lisp), causes: L.toArray(set.causes).map(lisp),
      values: pairs(set["new-values"]).map(([element, after]) => ({
        element, before: before.get(element) ?? null, after, changed: JSON.stringify(before.get(element) ?? null) !== JSON.stringify(after), use: elementUse(element, extensions),
      })),
      relativeValues: pairs(set["relative-values"]).map(([choicePoint, value]) => ({ choicePoint, value })),
      choicePoints: choicePoints.filter((c) => choicePointCharacters(c.name).includes(character)),
      notDescribed: L.toArray(set["not-described"]).map(lisp),
      ...(set["new-look"] ? { looks: looksOf(L, set["old-look"], set["new-look"]) } : {}),
    };
  });
  const held = L.toArray(L.evalString(":change-held-against")).reverse().map((x) => {
    const [choicePoint, heldAt, wouldHaveChosen] = L.toArray(x).map((y) => toJSON(L, y));
    return { choicePoint, heldAt, wouldHaveChosen };
  });
  return { scene, file: `KEN1;${s.become.toUpperCase()} BECOME`, characters, held, lisp: L };
}

// For comparison only: pass 1 again as of the scene with every choice made afresh
// (REVIVE;CHANGE recompute-everyone-as-of), as a full recompute would make them.
// Returns each choice that differs from the choices as they were (the story's KEN;CP
// and the earlier BECOME files): { choicePoint, characters, before, after }.
// How she was drawn and how she is drawn now, from a BECOME file's old-look and
// new-look: { before, after, changed: [aspect, ...] }, the aspects size, brightness,
// clarity, hue and shape.
function looksOf(L, oldLook, newLook) {
  const before = lookOf(L, oldLook), after = lookOf(L, newLook);
  const aspects = { size: (x) => x.aniSize, brightness: (x) => x.color && x.color[2], clarity: (x) => x.color && x.color[1], hue: (x) => x.hue, shape: (x) => x.shape };
  const changed = before && after ? Object.keys(aspects).filter((k) => aspects[k](before) !== aspects[k](after)) : [];
  return { before, after, changed };
}

export function recomputeEveryone(fs, scene, { plan, extensions = [], becomes = null, backtrace = false } = {}) {
  const s = plan.scenes.find((x) => x.id === scene);
  const L = boot(fs, { backtrace, extensions: withChange(extensions) });
  L.evalString("(load '|ken;datest >|)");
  const differences = L.toArray(L.evalString(`(recompute-everyone-as-of '${scene} '((ken) cp >) ${becomeFiles(becomes || s.becomes || [])} ${afterZ(extensions)})`)).map((x) => {
    const [choicePoint, before, after] = L.toArray(x).map((y) => toJSON(L, y));
    return { choicePoint, characters: choicePointCharacters(choicePoint), before, after };
  });
  return { scene, differences, lisp: L };
}

// The record of a scene's change for the glass box, from its fresh look and full
// recompute (makeFilmSteps keeps it as run.changes[scene]):
//   { scene, changes, file, characters, held, recompute: { differences, knockOns } }
// changes: the scene's changes as storyOutline found them; characters and held: the
// fresh look's; recompute.differences: every choice the full recompute made
// differently from the choices as they were, each with ofChanged, whether it is of a
// changed character (a relative choice point between her and another is); and
// knockOns, those of the others alone, which the fresh look holds back.
export function changeRecord(look, recompute, planScene) {
  const changed = look.characters.map((c) => c.character);
  const differences = recompute.differences.map((d) => ({ ...d, ofChanged: d.characters.some((c) => changed.includes(c)) }));
  return {
    scene: look.scene, changes: planScene.changes, file: look.file,
    characters: look.characters, held: look.held,
    recompute: { differences, knockOns: differences.filter((d) => !d.ofChanged) },
  };
}

// ---------------------------------------------------------------- pass 2

// The scene planned and saved. Returns its glass box: every actor of the plan as Ani
// left it (the scene, its tasks with the methods suggested, rejected and scored, its
// subscenes, activities and special dynamics), each as its variables and the items it
// memorized, printed as Lisp; and, if the revival's repairs left notes, those.
export function pass2(fs, scene, { backtrace = false, setup = null, plan = null, extensions = [], becomes = null } = {}) {
  const L = boot(fs, { backtrace, extensions });
  L.evalString("(cs)"); // Ken's Director was saved with the TV started; pass 2 measures places on it
  L.evalString("(load '|ken;run >|)");
  // what RUN is to do before it plans the scene (its to-do-before-running, run.65:48)
  const before = [];
  const s = plan ? plan.scenes.find((x) => x.id === scene) : null;
  if (plan && !plan.ken) {
    // a new story's scenes: where RUN saves each and which POSIT file it starts from
    L.evalString(`(progn ${plan.scenes.map((s) => `(putprop '${s.id} '(${s.file.join(" ")}) 'file-name) (putprop '${s.id} '${s.position ? `((ken1) ${s.position} posit)` : "nil"} 'position-file)`).join(" ")})`);
    // and the decisions of the scenes it refers to (from-scene), as RUN loads KEPT MINI for no-longer-kept-apart
    if (s && s.mini.length) before.push(...s.mini.map((fn1) => `(director-load '((ar9 ken1) ${fn1} mini) '(to get previous scene decisions))`));
  }
  // who the characters changed in earlier scenes have become (REVIVE;CHANGE): those
  // scenes' BECOME files, made so; becomes, if given, names those to load instead of
  // the plan's (makeFilmSteps gives those its fresh looks made); only those on fs (a
  // scene planned on its own, say, after a fresh look that wasn't made)
  const learned = (becomes || (s && s.becomes) || []).filter((fn1) => fs.find({ dir: "KEN1", fn1: fn1.toUpperCase(), fn2: "BECOME" }));
  if (learned.length) before.push(`(learn-who-they-have-become '(${learned.map((fn1) => `((ken1) ${fn1} become)`).join(" ")}))`);
  // and the scene's own change, if its fresh look was made, which REVIVE;CHSHOW shows
  // in the scene (not made so: the scene's tasks read the description as it was)
  if (s && s.become && fs.find({ dir: "KEN1", fn1: s.become.toUpperCase(), fn2: "BECOME" })) before.push(`(learn-what-changes-in '${scene} '((ken1) ${s.become} become))`);
  if (setup) setup(L);
  L.evalString(`(run '${scene}${before.length ? ` nil '(progn ${before.join(" ")})` : ""})`);
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
  // the changes of look planned (REVIVE;ALTER), only if any were, for the same reason
  const lookChanges = collectLookChanges(L, scene);
  if (lookChanges.length) glass.lookChanges = lookChanges;
  // who the characters changed in earlier scenes have become, as this scene's pass 2
  // made them so (REVIVE;CHANGE), only if any were, for the same reason
  const becomes = collectBecomes(L);
  if (becomes.length) glass.becomes = becomes;
  // how the scene shows a change made in it (REVIVE;CHSHOW), only if it shows one, for
  // the same reason
  const changesShown = collectChangesShown(L, scene);
  if (changesShown.length) {
    // the task each is shown by, the one whose methods have its way of showing it
    for (const c of changesShown) {
      // her bridges are all one task's (REVIVE;CHSHOW's showing-task-of), each "for" her
      // change-of actor; with none, the task whose way of showing it is
      const bridged = `for ${c.actor})`;
      const t = glass.tasks.find((x) => (x.variables["current-choice"] || "").includes(bridged))
        || (c.shownBy && c.shownBy !== "alone" && glass.tasks.find((x) => (x.variables["current-choice"] || "").includes(c.shownBy)));
      c.task = t ? t.name : null;
    }
    glass.changesShown = changesShown;
  }
  // the ways of showing a word borrowed from its neighbor (REVIVE;KNOW's sharing), only
  // if any were, for the same reason
  const borrowed = collectBorrowed(L, glass.tasks);
  if (borrowed.length) glass.borrowed = borrowed;
  // the wanders while changes run that REVIVE;SEEN planned, only if any were, for the
  // same reason
  const wanders = collectWanders(glass);
  if (wanders.length) glass.wanders = wanders;
  return glass;
}

// The wanders REVIVE;SEEN planned in the scene, from the memo each wandering plan keeps,
// (wanders: character c while (changes-for c) in s after w once-free-of (p ...) because
// (...)): for each, { character, plan, waiting, subscene, onceFreeOf, because }, plan
// the wandering plan, waiting the plan that waits until nothing else moves her, both
// printed as Lisp, onceFreeOf the plans (or a subscene, for a repeated plan) she waits
// for, because the reason as Lisp. From the glass box's plans, so it needs no Lisp.
export function collectWanders(glass) {
  const out = [];
  for (const p of glass.plans || []) {
    for (const item of p.items || []) {
      if (!item.startsWith("(wanders: ")) continue;
      const memo = readForms(item)[0];
      const get = (k) => { const i = memo.indexOf(k); return i >= 0 ? memo[i + 1] : null; };
      const free = get("once-free-of"); // nil, read as "nil", if nothing else moves her
      out.push({
        character: get("character"), plan: p.name, waiting: printForm(get("after")), subscene: printForm(get("in")),
        onceFreeOf: Array.isArray(free) ? free.map(printForm) : [], because: printForm(get("because")),
      });
    }
  }
  return out;
}

// A form readForms read, printed again as Lisp.
function printForm(x) {
  return Array.isArray(x) ? `(${x.map(printForm).join(" ")})` : x === null || x === undefined ? null : String(x);
}

// The suggestions of the scene's establish tasks that a word borrowed from a neighbor
// (REVIVE;KNOW: a word with no way of showing itself borrows each neighbor's, with the
// source (neighbor-of word neighbor), dscrp.17:183), as SUGEST's find-related-suggestions
// memorized them on the task (related-suggestions: main-suggestion s ... others (s ...)),
// sugest.123:98-139, 204-210): for each, { task, word, neighbor, way, strength, chosen },
// way the convey task it suggests, (helps troll kid), printed as Lisp, and chosen whether
// the task's current choice has it. tasks: the glass box's tasks. Looked up without
// interning anything unless REVIVE;KNOW is loaded, so that a Lisp running as in 1978 is
// left as it was.
export function collectBorrowed(L, tasks) {
  const wrapper = L.obarray.find("DISTILL-SUGGESTIONS-WITH-BORROWED");
  if (!wrapper || L.evalString("(get 'distill-suggestions-with-borrowed 'expr)") === L.NIL) return [];
  const lisp = (x) => L.print(x).toLowerCase();
  const out = [];
  for (const t of tasks) {
    if (t.variables.parent !== "establish-task") continue;
    L.intern("*GB-ACTOR*").value = L.intern(t.name.toUpperCase());
    const found = L.evalString(`(mapcan (function (lambda (s)
        (let ((source (get s 'source)))
             (and (not (atom source)) (eq (first source) 'neighbor-of)
                  (list (list (second source) (third source) (get (get s 'value) 'value) (get s 'strength)
                              (and (member (get s 'value) (ask ,*gb-actor* recall your current-choice)) t)))))))
      (mapcan (function (lambda (r) (cons (get r 'main-suggestion) (append (get r 'others) nil))))
              (ask ,*gb-actor* collect items memorized matching (related-suggestions: main-suggestion ? relationship ? others ?))))`);
    for (const x of L.toArray(found)) {
      if (x === L.NIL) continue;
      const [word, neighbor, way, strength, chosen] = L.toArray(x);
      out.push({ task: t.name, word: lisp(word), neighbor: lisp(neighbor), way: lisp(way), strength: lisp(strength), chosen: chosen !== L.NIL });
    }
  }
  return out;
}

// The changes of look pass 2 planned in the scene (REVIVE;ALTER look-changes-in): for
// each, { task, subscene, method, change, character, element, kind, amount | newValue,
// speed, feeling? }, task and subscene their names, method the display method as the
// task chose it, (look-change: element (cinderella color-intensity) amount (negative
// high) speed high), change what Director is to do, (gradually change look by
// .66666667 factor for color-intensity at high speed), each printed as Lisp, kind
// look-change: or look-change-to:, and feeling, for a look-change:, the feeling of an
// emotional-state task that changes that look, at the level of the amount ("(joy
// (negative high))", feelingOf), if the task is one. Looked up
// without interning anything unless REVIVE;ALTER is loaded, so that a Lisp running as
// in 1978 is left as it was.
export function collectLookChanges(L, scene) {
  if (!L.obarray.find("LOOK-CHANGES-IN") || L.evalString("(get 'look-changes-in 'expr)") === L.NIL) return [];
  const lisp = (x) => (x === L.NIL ? null : L.print(x).toLowerCase());
  const out = [];
  for (const x of L.toArray(L.evalString(`(look-changes-in '${scene})`))) {
    if (x === L.NIL) continue;
    const [task, subscene, method, change] = L.toArray(x);
    const get = (k) => plistGet(L, method, k);
    const element = L.toArray(get("element")).map(lisp);
    const kind = lisp(method.car);
    L.intern("*GB-ACTOR*").value = task;
    const description = L.evalString("(get (ask ,*gb-actor* recall your task) 'description)");
    const feeling = kind === "look-change:" ? feelingOf(L, description, lisp(get("amount")), element[1]) : null;
    out.push({
      task: lisp(task), subscene: lisp(subscene), method: lisp(method), change: lisp(change),
      character: element[0], element: element[1], kind,
      ...(kind === "look-change:" ? { amount: lisp(get("amount")) } : { newValue: lisp(get("new-value")) }),
      speed: lisp(get("speed")), ...(feeling ? { feeling } : {}),
    });
  }
  return out;
}

// The feeling of an emotional-state task's description, (emotional-state cinderella
// (joy (negative high))), that made a look change by an amount: one REVIVE;ALTER's
// :look-change-knowledge says changes the element (joy, for color-intensity), at the
// level the look change was made by, "(joy (negative high))"; null if there is none.
// By the feeling, not the level alone: two feelings of a task may share a level.
function feelingOf(L, description, amount, element) {
  if (!(description instanceof Cons)) return null;
  const lisp = (x) => L.print(x).toLowerCase();
  const parts = L.toArray(description);
  if (lisp(parts[0]) !== "emotional-state") return null;
  const feelings = L.toArray(L.evalString(`(and (boundp ':look-change-knowledge) (mapcan (function (lambda (k) (and (eq (second k) '${element}) (list (first k))))) :look-change-knowledge))`)).filter((x) => x !== L.NIL).map(lisp);
  const states = parts[2] instanceof Cons && lisp(parts[2].car) === "and" ? L.toArray(parts[2]).slice(1) : [parts[2]];
  const found = states.find((s) => s instanceof Cons && feelings.includes(lisp(s.car)) && lisp(L.toArray(s)[1]) === amount);
  return found ? lisp(found) : null;
}

// What pass 2 made so of the earlier scenes' changes (REVIVE;CHANGE
// learn-who-they-have-become): for each (change-of c in s) actor, in film order,
// { actor, character, scene, changes, causes, described: [{ type, was, now }],
// madeSo: [{ element, was, now }], notDescribed, looks? }, each change, cause and
// value printed as Lisp (a cause nil if there was none). described: the descriptions
// it changed (by the character each change describes; for a relationship, the
// first); madeSo: the values the fresh look chose differently, made so; notDescribed:
// the old words her description didn't have; looks, when the fresh look chose how she
// looks (REVIVE;APPEAR), { before, after, changed } as freshLook gives them, and
// lookMadeSo, whether pass 2 drew her so (her look as the CP or an earlier scene had it
// differed). Looked up without interning anything unless REVIVE;CHANGE is loaded, so
// that a Lisp running as in 1978 is left as it was.
export function collectBecomes(L) {
  if (!L.obarray.find("CHANGES-OF-EARLIER-SCENES") || L.evalString("(get 'changes-of-earlier-scenes 'expr)") === L.NIL) return [];
  const lisp = (x) => L.print(x).toLowerCase();
  const out = [];
  for (const actor of L.toArray(L.evalString("(changes-of-earlier-scenes)"))) {
    if (actor === L.NIL) continue;
    L.intern("*GB-ACTOR*").value = actor;
    const [, character, , scene] = L.toArray(actor).map(lisp);
    const madeSo = L.toArray(L.evalString("(ask ,*gb-actor* collect items memorized matching (made-so: %))")).map((item) => {
      const [, , element, , was, , now] = L.toArray(item).map(lisp);
      return { element, was, now };
    });
    const described = L.toArray(L.evalString("(ask ,*gb-actor* collect items memorized matching (described-anew: %))")).map((item) => {
      const [, , type, , was, , now] = L.toArray(item).map(lisp);
      return { type, was, now };
    });
    out.push({
      actor: lisp(actor), character, scene,
      changes: L.toArray(L.evalString("(ask ,*gb-actor* recall your changes)")).map(lisp),
      causes: L.toArray(L.evalString("(ask ,*gb-actor* recall your causes)")).map(lisp),
      described: described.reverse(), // memorized newest first
      madeSo: madeSo.reverse(),
      notDescribed: L.toArray(L.evalString("(ask ,*gb-actor* recall your not-described)")).map(lisp),
      ...(lookChange(L)),
    });
  }
  return out;
}

// The looks of the change-of actor in *gb-actor*, if it has them: { looks }.
function looksOfChange(L) {
  const { looks } = lookChange(L);
  return looks ? { looks } : {};
}
// The looks of the change-of actor in *gb-actor*, if it has them: { looks, lookMadeSo }.
function lookChange(L) {
  const newLook = L.evalString("(ask ,*gb-actor* recall your new-look)");
  if (newLook === L.NIL) return {};
  const looks = looksOf(L, L.evalString("(ask ,*gb-actor* recall your old-look)"), newLook);
  const madeSo = L.evalString("(ask ,*gb-actor* recall if any items match (looked-anew: %))") !== L.NIL;
  return { looks, lookMadeSo: madeSo };
}

// How the scene shows each change made in it (REVIVE;CHSHOW), from the change-of actors
// its pass 2 loaded to show (changes-shown-in): for each, in film order, { actor,
// character, changes, causes, rate, rateBecause, rateRule?, shownBy, subscene,
// stretchedBy, seconds, ideal, goesTo, bridging, bridges, wanders, notBridged, looks?,
// task } (task, the glass box's name of the task whose methods show it, glassBox adds):
//   rate          "gradual" or "instantaneous"; rateBecause, the reason as Lisp;
//                 rateRule "(of the revival)": the magical rule, or, for a gradual
//                 change, its speed, Ken's slowest (both the revival's)
//   shownBy       the way of showing it, "(goes-to-and-transforms prince step-mother)",
//                 "(changes-while-wandering cinderella)", or "alone" (its bridges run with
//                 no way of showing beside them); subscene, stretchedBy as run
//   seconds, ideal  how long the change is shown (the wander), as run and as estimated
//   goesTo        { plan, by }: the cause's walk to her (goes-to-and-transforms)
//   bridging      { plan, seconds, ideal }: the bridges' plan, null if nothing to bridge
//   bridges       [{ element, character, was, now, form, atOnce? }]: each element
//                 bridged, from what to what, and what Director is to do (a form shared
//                 by the shape's two elements is given with each); atOnce, a shape
//                 Director has no in-between for, changed in a tick
//   wanders       { plans, seconds, carriedBy? }: her walks while she changes; none, and
//                 carriedBy, when another way of showing of the part moves her
//   notBridged    [{ element, was, now, because }]: the elements chosen again that
//                 Director doesn't read, or pass 2 can't weigh
//   looks         { before, after, changed }, with APPEAR
// The film's events give each plan's beginning and end frames. Looked up without
// interning anything unless REVIVE;CHSHOW is loaded.
export function collectChangesShown(L, scene) {
  if (!L.obarray.find("CHANGES-SHOWN-IN") || L.evalString("(get 'changes-shown-in 'expr)") === L.NIL) return [];
  const lisp = (x) => (x === undefined || x === L.NIL ? null : L.print(x).toLowerCase());
  const items = (pattern) => L.toArray(L.evalString(`(ask ,*gb-actor* collect items memorized matching ${pattern})`)).filter((x) => x !== L.NIL).reverse();
  const get = (item, key) => plistGet(L, item, key);
  const out = [];
  for (const actor of L.toArray(L.evalString(`(changes-shown-in '${scene})`))) {
    if (actor === L.NIL) continue;
    L.intern("*GB-ACTOR*").value = actor;
    const [, character] = L.toArray(actor).map(lisp);
    const rate = items("(rate: %)")[0];
    const shown = items("(shown-by: %)")[0];
    const goesTo = items("(goes-to: %)")[0];
    const bridging = items("(bridges: %)")[0];
    const wanders = items("(wanders: %)")[0];
    const num = (v) => (v === undefined || v === L.NIL ? null : L.num.val(v));
    out.push({
      actor: lisp(actor), character,
      changes: L.toArray(L.evalString("(ask ,*gb-actor* recall your changes)")).map(lisp),
      causes: L.toArray(L.evalString("(ask ,*gb-actor* recall your causes)")).map(lisp),
      rate: rate ? lisp(get(rate, "is")) : null,
      rateBecause: rate ? lisp(get(rate, "because")) : null,
      ...(rate && get(rate, "rule") !== L.NIL && get(rate, "rule") !== undefined ? { rateRule: lisp(get(rate, "rule")) } : {}),
      shownBy: shown ? lisp(get(shown, "method")) : null,
      subscene: shown ? lisp(get(shown, "in")) : null,
      stretchedBy: shown ? num(get(shown, "stretched-by")) : null,
      seconds: shown ? num(get(shown, "seconds")) : null,
      ideal: shown ? num(get(shown, "ideal")) : null,
      goesTo: goesTo ? { plan: lisp(get(goesTo, "plan")), by: lisp(get(goesTo, "by")) } : null,
      bridging: bridging ? { plan: lisp(get(bridging, "plan")), seconds: num(get(bridging, "seconds")), ideal: num(get(bridging, "ideal")) } : null,
      bridges: items("(bridged: %)").map((b) => {
        const element = L.toArray(get(b, "element")).map(lisp);
        const atOnce = get(b, "at-once");
        return { element: element[1], character: element[0], was: lisp(get(b, "was")), now: lisp(get(b, "now")), form: lisp(get(b, "by")), ...(atOnce !== undefined && atOnce !== L.NIL ? { atOnce: true } : {}) };
      }),
      wanders: wanders ? { plans: L.toArray(get(wanders, "plans")).map(lisp), seconds: num(get(wanders, "seconds")), ...(get(wanders, "carried-by") !== undefined && get(wanders, "carried-by") !== L.NIL ? { carriedBy: lisp(get(wanders, "carried-by")) } : {}) } : null,
      notBridged: items("(not-bridged: %)").map((n) => ({ element: lisp(get(n, "element")), was: lisp(get(n, "was")), now: lisp(get(n, "now")), because: lisp(get(n, "because")) })),
      ...looksOfChange(L),
    });
  }
  return out;
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
// each character was drawn with (TV dots from the picture's top left; whole, for a
// character partly off the picture, see below) and each character's state; and every
// event the movie noted, by frame. onClick, if given, is
// called at each click too, with the frame and the Lisp (to save a picture, say). With looks (an extension that
// chooses how the characters look, REVIVE;APPEAR and LOOKS), film.looks records who
// looks how from which frame, changes only: [frame, character, { shape, angle,
// centerOffset, aniSize, color?, morph? }], frame counted from 0 as frames are; color,
// if the character has one (REVIVE;COLORS), [hue angle, saturation, value], as Director
// keeps it and the page paints it; morph, while its shape changes to another
// (REVIVE;LOOKS), { to, amount }, the shape it is becoming and how far it has come, 0
// to 1 (the segments are the in-between, as drawn); frames[].chars is as it is
// without.
export function recorder(L, { onClick = null, cast = CHARACTERS, looks = false } = {}) {
  const film = { picture: null, frames: [], events: [] };
  if (looks) film.looks = [];
  const lastLook = {};
  let drawing = null;
  let segs = {};
  let all = {}; // each character's segments, those off the picture too (below)
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
    all = {};
    if (looks) recordLooks(film.frames.length - 1);
    if (onClick) onClick(film.frames.length - 1, L); // the Lisp too, for a probe of Director's state (tools/check-change.mjs)
    return L.T;
  });
  // each character's look as Director now draws it, kept when it changes
  function recordLooks(frame) {
    const all = L.evalString(`(mapcar (function (lambda (c) (list (ask ,c recall your shape) (ask ,c recall your angle)
                                                                  (ask ,c recall your center-offset) (ask ,c recall your ani-size)
                                                                  (ask ,c recall your look-color) (ask ,c recall your look-amount)
                                                                  (get (ask ,c recall your look-target) 'shape))))
                                      '(${cast.join(" ")}))`);
    L.toArray(all).forEach((x, i) => {
      const [shape, angle, offset, size, color, amount, target] = L.toArray(x);
      const num = (v) => (v === L.NIL ? null : Math.round(L.num.val(v) * 10000) / 10000);
      const look = {
        shape: shape === L.NIL ? null : L.print(shape).toLowerCase(), angle: num(angle),
        centerOffset: offset === L.NIL ? null : L.print(offset).toLowerCase(), aniSize: num(size),
      };
      if (color instanceof Cons) {
        const [h, s, v] = L.toArray(color).map((y) => L.num.val(y));
        look.color = [Math.round(h * 10) / 10, Math.round(s * 1000) / 1000, Math.round(v * 1000) / 1000];
      }
      if (amount !== L.NIL) look.morph = { to: target === L.NIL ? null : L.print(target).toLowerCase(), amount: Math.round(L.num.val(amount) * 1000) / 1000 };
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
  // redraws before each click). ANINIT films with the turtle cutting lines at the
  // picture's edge (its asd's (clip)), so a character partly off the picture is drawn
  // cut; its segments are kept whole, in picture dots beyond the picture too, as
  // Director drew them before the cut, so that a page can draw the copies color nests
  // inside each shape whole and cut them at the edge, as the color turtle did. A
  // character none of whose lines reach the picture has no segments, as on the screen,
  // and each character comes in the order its first line reached the picture.
  const tv = L.tv;
  const area = pictureArea(tv, 0);
  film.picture = { width: area.width, height: area.height };
  const r = (v) => Math.round(v * 10) / 10;
  const dots = (a, b, c, d) => [r(a / UNIT_BIT - area.x), r(b / UNIT_BIT - area.y), r(c / UNIT_BIT - area.x), r(d / UNIT_BIT - area.y)];
  const keep = (seg, onPicture) => {
    (all[drawing] ||= []).push(...seg);
    if (onPicture && !segs[drawing]) segs[drawing] = all[drawing];
  };
  let cutting = false; // within the turtle's clip
  let reached = false; // ... and some of the line was drawn
  const vector = tv.boundedVectorFix.bind(tv);
  tv.boundedVectorFix = (a, b, c, d) => {
    if (drawing) {
      if (cutting) reached = true;
      else keep(dots(a, b, c, d), true);
    }
    return vector(a, b, c, d);
  };
  // the line as the turtle's bounded-vector would draw it uncut (its rounding: TV dots
  // and a half)
  const half = UNIT_BIT / 2;
  const clip = tv.clipVector.bind(tv);
  tv.clipVector = (fromX, fromY, toX, toY) => {
    if (!drawing) return clip(fromX, fromY, toX, toY);
    const seg = dots(tv.tvFixX(fromX) + half, tv.tvFixY(fromY) + half, tv.tvFixX(toX) + half, tv.tvFixY(toY) + half);
    cutting = true;
    reached = false;
    try {
      return clip(fromX, fromY, toX, toY);
    } finally {
      cutting = false;
      keep(seg, reached);
    }
  };
  const wipe = tv.wipe.bind(tv);
  tv.wipe = (wipeArgs) => {
    segs = {};
    all = {};
    return wipe(wipeArgs);
  };
  return film;
}

// The scene filmed in black and white, with a record of every frame; its end positions
// are saved as KEN1;<movie> POSIT for the next scene's pass 2. If the revival's repairs
// left notes while it was filmed (REVIVE;MEND2's weightify guard, say, in Director's
// special dynamics), the film has them as repairs, as pass 2's glass box has its own.
// setup, if given, is called with the Lisp once it has booted, before ANINIT loads, as
// pass 1's and pass 2's are (tools/check-slips.mjs makes SLIPS's corrections one at a
// time with it).
export function film(fs, scene, { fps = 4, frames = 1000, backtrace = false, onClick = null, plan = null, extensions = [], setup = null } = {}) {
  const L = boot(fs, { backtrace, extensions });
  if (setup) setup(L);
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

// ---------------------------------------------------------------- why they act as they do

// Which display method writes which activities. A plan is named (activity-of <activity>
// n) (activity-name-of, place.45:240-242) by the method that writes it: DISPLY's (the
// lines of disply.311 each method names its activities at) and the revival's own. A
// change's plans (REVIVE;CHSHOW) are its way of showing's, which the glass box's
// changesShown names; a getting-on-stage REVIVE;MEND6 planned for another method says so
// in its note; REVIVE;SEEN's are named by its wanders.
export const ACTIVITY_METHODS = {
  "chasee-runs-away": "chases-to", "chaser-pursues": "chases-to", // disply.311:47-82
  "goes-to-to-hit": "move-to-and-hits", "hitting-other": "move-to-and-hits", // 113-153
  "getting-on-stage": "goes-to-and-accompanys", "goes-to-to-accompany": "goes-to-and-accompanys", "accompanying-each-other": "goes-to-and-accompanys", // 186-225
  "pusher-comes-in-contact": "pushes-around", "moving-together": "pushes-around", "pushee-coasts": "pushes-around", "pushee-moves-away": "pushes-around", // 243-328
  "prisoner-escapes": "stands-guard", "guard-chases": "stands-guard", "prisoner-escapes-again-plan": "stands-guard", "resume-guard": "stands-guard", "make-guarding-more-interesting": "stands-guard", // 455-556
  "moving-towards-each-other": "move-to-each-other", // 653-700
  "moving-small-part-towards": "move-small-part-towards", // 711
  "goes-to-contact-other": "repeatedly-come-in-contact", "move-apart-a-little": "repeatedly-come-in-contact", // 790-830
  "turn-character": "alternately-turn", "turn-character-back": "alternately-turn", // 940-960
  "move-near-the-group": "move-near-and-turn", "turn-towards-others": "move-near-and-turn", // 982-985
  "exit-by-character": "exit-by", // 1029
  "goes-to-meet": "move-to", // REVIVE;MEND5
  "wander-around": "wander-around", // REVIVE;MEND9, SCENE's (scene.9:216-218)
  "trying-alone": "helps-along", "goes-behind-to-help": "helps-along", "comes-in-contact-to-help": "helps-along", "helping-along": "helps-along", // REVIVE;KNOWDI
  "other-approaches": "moves-away-from", "moves-away": "moves-away-from", "leading": "follows-behind", "following": "follows-behind", // REVIVE;KNOWDI
  "goes-to-to-transform": "goes-to-and-transforms", // REVIVE;CHSHOW
  "waiting-to-wander": "wander-while-changes-run", "wandering-while-changes-run": "wander-while-changes-run", // REVIVE;SEEN
};
// The methods the revival wrote, by the file that has them.
const REVIVAL_METHODS = {
  "move-to": "REVIVE;MEND5", "wander-around": "REVIVE;MEND9", "helps-along": "REVIVE;KNOWDI", "moves-away-from": "REVIVE;KNOWDI", "follows-behind": "REVIVE;KNOWDI",
  "goes-to-and-transforms": "REVIVE;CHSHOW", "changes-while-wandering": "REVIVE;CHSHOW", "bridge-to:": "REVIVE;CHSHOW", "wander-while-changes-run": "REVIVE;SEEN",
};

// Why the characters of a scene act as they do, and for as long as they do: what the
// film page needs to say why each activity lasts as long as it does, gathered from a
// scene's glass box (pass 2's records: glassBox) and, if given, its film (the frames
// and the movie's events: recorder). Nothing here is new to Ani: each value is one of
// her records, found where she keeps it (each field says where), or a film's frames.
// extensions: the run's (with SLIPS, Director runs a change at the speed Ani planned).
// Returns { scene, parts, tasks, activities, stills }:
//   scene      { length, lengthBounds, runningTime, mood, rhythm }: the scene's length
//              setting (CINDY's, or SCENE's default medium, scene.9:8-10), the bounds
//              it gives the scene (its share of the film's film-length, scene.9:346-357),
//              and the running time CHOMET gave it (chomet.123:68-74, 141-153)
//   parts      each subscene, { name, n, tasks, runningTime, stretchedBy, beginTime,
//              parasiteOn, extendedBy: [{ seconds, by }], estimates: { method: { ideal,
//              least, most } }, changesFor: { character: [form] }, movements, film:
//              { begin, end } }: its running time (the longest of its tasks', scene.9:
//              137-140, plus any part's that extends it, extend-last-actions-of,
//              scene.9:223-240) and how much its methods were stretched to fill it
//              (scene.9:159-170); a part of only changes begins a time after the part it
//              extends (beginTime) and is its parasite
//   tasks      each task, { name, kind, description, subscene, share, allocatedTime,
//              runningTime, status, chosen, scores, rejected }: its share of the scene
//              and the time that allocates it (compute-bounds-on-time-for, scene.9:332-344),
//              the running time CHOMET picked within it for its methods' ideal
//              (pick-time-within, chomet.123:95-139), the methods chosen and, as Lisp,
//              CHOMET's scores and the suggestions it rejected with their reasons
//   activities each plan, { plan, activity, part, subscene, characters, method, by, task,
//              estimate, beginTime, stops, repeated, film: { spans, seconds }, ended }:
//              the method that wrote it and the task it serves (ACTIVITY_METHODS, the
//              task whose chosen methods have it), who wrote it (by: "DISPLY", or the
//              revival's file), Ani's estimate of the method in its part (its
//              time-estimates-for: ideal, least, most), when it begins, what stops it
//              (its stop conditions as its Lisp has them: after-seconds, when-there,
//              when-plan-ended, when-changes-ended, original-distance, after-a-hit,
//              after-turning, when-nothing-else-moves-her, the bridges' after-seconds;
//              and repeated, the n of a (repeat n ...) of the part's movements it is in),
//              and, with the film, when it ran (spans of frames) and how each run ended,
//              as far as the frames tell ("time" if it ran its seconds, "there" if it got
//              there sooner, else null)
//   stills     with the film, each stretch of more than a second inside a part in which
//              no character on the stage moves, { from, to, seconds, part, parasiteOn,
//              after, kind, ... }, after the plans that ended last before it (of the part
//              or the one it extends); kind
//                "plans-running"     a plan of the part runs and moves no one (running);
//                "repeat-unwinding"  the part's (repeat n ...) (repeat: n) unwinding after
//                                    its last run, a tick a run (action.152:94-123: each
//                                    run's sequence: runs its empty rest the next tick);
//                "only-changes"      a part of only changes (its plans, if any,
//                                    REVIVE;SEEN's), its changes still running with
//                                    nothing to move anyone, what SEEN is for;
//                "changes-running"   the part's plans have ended and its changes still run;
//                "nothing-running"   none of these;
//              with changes, each { character, form, aniSeconds, directorSeconds }: Ani's
//              estimate (estimate-time-for-change-by, disply.311:1098-1111) and how long
//              Director takes (DICHAR's gradually change, dichar.103:102-121: four times
//              Ani's at high speed and a quarter at low, unless SLIPS).
export function whyTheyAct(glass, film = null, { fps = (film && film.fps) || 4, extensions = [] } = {}) {
  const read = (s) => (s === undefined || s === null ? null : readForms(String(s))[0]);
  const num = (x) => (x === undefined || x === null || x === "nil" ? null : Number(x));
  const list = (x) => (Array.isArray(x) ? x : []);
  const sv = glass.scene.variables;
  const bounds = read(sv["length-bounds"]);
  const scene = {
    length: sv.length || null, lengthBounds: Array.isArray(bounds) ? bounds.map(Number) : null,
    runningTime: num(sv["running-time"]), mood: sv.mood || null, rhythm: sv.rhythm || null,
  };
  // the movie's events, as spans of frames for each plan or subscene
  const spans = new Map();
  for (const [frame, ev] of film ? film.events : []) {
    const m = /^\((beginning|end)-of (\(.*\))\)$/.exec(ev);
    if (!m) continue;
    const runs = spans.get(m[2]) || [];
    spans.set(m[2], runs);
    if (m[1] === "beginning") runs.push({ begin: frame, end: null });
    else {
      const open = [...runs].reverse().find((r) => r.end === null);
      if (open) open.end = frame;
      else if (!runs.length) runs.push({ begin: null, end: frame }); // a parasite told it ended before it began (REVIVE;BRIDGE)
    }
  }
  const last = film ? film.frames.length - 1 : null;
  const tasks = glass.tasks.map((t) => {
    const v = t.variables;
    const task = read(v.task);
    const at = (k) => { const i = list(task).indexOf(k); return i >= 0 ? task[i + 1] : null; };
    const allocated = read(v["allocated-time"]);
    return {
      name: t.name, kind: v.parent === "establish-task" ? "establish" : v.parent === "convey-task" ? "convey" : v.parent || null,
      description: printForm(at("description")), subscene: v.subscene || null, share: num(v.share),
      allocatedTime: Array.isArray(allocated) ? allocated.map(Number) : null, runningTime: num(v["running-time"]), status: v.status || null,
      chosen: list(read(v["current-choice"])).map(printForm), scores: v.scores || null, rejected: v["rejected-suggestions"] || null,
    };
  });
  const parts = glass.subscenes.map((s, k) => {
    const v = s.variables;
    const estimates = {}, changesFor = {};
    for (const [key, value] of Object.entries(v)) {
      const est = /^\(time-estimates-for (.*)\)$/.exec(key);
      if (est) { const e = read(value); const get = (x) => num(e[e.indexOf(x) + 1]); estimates[est[1]] = { ideal: get("ideal"), least: get("least"), most: get("most") }; }
      const ch = /^\(changes-for ([^ ()]+)\)$/.exec(key);
      if (ch) changesFor[ch[1]] = list(read(value)).map(printForm);
    }
    const status = read(v.status);
    const span = (spans.get(s.name) || []).find((r) => r.begin !== null) || null;
    return {
      name: s.name, n: k + 1, tasks: [...list(read(v["convey-tasks"])), ...list(read(v["establish-tasks"]))],
      runningTime: num(v["running-time"]), stretchedBy: num(v["stretched-by"]), beginTime: v["begin-time"] || null,
      parasiteOn: Array.isArray(status) && status[0] === "parasite-on" ? printForm(status[1]) : null,
      extendedBy: (s.items || []).filter((i) => i.startsWith("(extra-time-added ")).map((i) => { const x = read(i); return { seconds: num(x[1]), by: printForm(x[3]) }; }),
      estimates, changesFor, movements: v.movements || null,
      film: span ? { begin: span.begin, end: span.end === null ? last : span.end } : null,
    };
  });
  const partOf = (name) => parts.find((p) => p.name === name) || null;
  const shown = glass.changesShown || [];
  const wanders = glass.wanders || collectWanders(glass);
  const activities = glass.plans.map((p) => {
    const v = p.variables;
    const lisp = read(v.plans);
    const activity = list(read(p.name))[1] || null;
    const part = partOf(v.subscene);
    // who it moves or changes
    const characters = new Set();
    walkForm(lisp, (f) => {
      if (f[0] !== "ask") return;
      if (f[2] === "cause") (Array.isArray(f[3]) ? f[3] : [f[3]]).forEach((c) => characters.add(c));
      else if (f[2] === "set" && f[4] === "special-dynamics") characters.add(f[1]);
      else if (f[2] === "gradually" && f[3] === "face") characters.add(f[4]);
      else if (f[2] === "gradually" && f[3] === "change") characters.add(f[1]);
      else if ((f[2] === "wander" || (f[2] === "wait" && f[3] === "until"))) characters.add(f[f[2] === "wander" ? 3 : 4]);
    });
    // the method that wrote it, and the task whose chosen methods have it
    let method = null, family = ACTIVITY_METHODS[activity] || null, task = null;
    const change = shown.find((x) => (x.goesTo && x.goesTo.plan === p.name) || (x.bridging && x.bridging.plan === p.name) || (x.wanders && x.wanders.plans.includes(p.name)));
    const wander = wanders.find((w) => w.plan === p.name || w.waiting === p.name);
    const brought = activity === "getting-on-stage" && (glass.repairs || []).map((r) => read(r.note)).find((n) => list(n)[2] === "brought-on-stage" && printForm(n[n.indexOf("now") + 1]) === p.name);
    if (change) {
      method = change.shownBy && change.shownBy !== "alone" ? change.shownBy : null;
      family = method ? list(read(method))[0] : "bridge-to:";
      task = change.task || null;
    } else if (wander) {
      method = `(wander-while-changes-run ${wander.character})`;
    } else if (brought) {
      const because = list(brought[brought.indexOf("because") + 1]);
      family = because[because.length - 1] || family;
    } else if (activity === "wander-around") {
      method = `(wander-around ${[...characters][0] || ""})`.replace(" )", ")");
    }
    if (!task && family && family !== "wander-around" && family !== "wander-while-changes-run") {
      const candidates = tasks.filter((t) => !part || t.subscene === part.name);
      for (const t of candidates) {
        const m = t.chosen.find((c) => list(read(c))[0] === family || (family === "goes-to-and-accompanys" && list(read(c))[0] === "goes-to-and-accompanies"));
        if (m) { task = t.name; method = method || m; break; }
      }
    }
    const estimate = part && method && part.estimates[method] ? part.estimates[method] : null;
    // what stops it, as its Lisp has it
    const stops = [];
    walkForm(lisp, (f) => {
      const i = f.indexOf("stopping");
      if (i >= 0 && f[i + 1] === "if") stopsOf(f[i + 2], stops);
      if (f[2] === "cause" && f.includes("hit") && f.includes("retreat")) stops.push({ kind: "after-a-hit" });
      if (f[2] === "cause" && f[5] === "gradually" && f[6] === "turn") stops.push({ kind: "after-turning", degrees: num(f[7]) });
      if (f[2] === "wait" && f[3] === "until") stops.push({ kind: "when-nothing-else-moves-her" }, { kind: "when-changes-ended" });
      if (f[2] === "wander" && f.includes("while")) stops.push({ kind: "when-changes-ended" });
      if (f[2] === "gradually" && f[3] === "change" && f[f.length - 1] === "seconds") stops.push({ kind: "after-seconds", seconds: num(f[f.length - 2]) });
    });
    const movements = part && part.movements ? read(part.movements) : null;
    const repeated = repeatAround(movements, p.name);
    const runs = (spans.get(p.name) || []).filter((r) => r.begin !== null).map((r) => ({ begin: r.begin, end: r.end === null ? last : r.end }));
    const after = stops.find((s) => s.kind === "after-seconds");
    const ended = runs.map((r) => {
      const seconds = (r.end - r.begin) / fps;
      if (after && seconds >= after.seconds - 1.5 / fps) return "time";
      if (stops.some((s) => s.kind === "when-there")) return "there";
      return null;
    });
    return {
      plan: p.name, activity, part: part ? part.n : null, subscene: v.subscene || null, characters: [...characters],
      method, by: family ? REVIVAL_METHODS[family] || "DISPLY" : null, task, estimate,
      beginTime: v["begin-time"] || null, stops, repeated,
      ...(film ? { film: { spans: runs, seconds: runs.reduce((a, r) => a + (r.end - r.begin) / fps, 0) }, ended } : {}),
    };
  });
  // each still stretch as it falls in each part (a part of only changes runs beside the
  // part it extends), where it is more than a second
  const stills = [];
  for (const s of film ? stillStretches(film, { fps, atLeast: 0 }) : []) {
    for (const p of parts) {
      if (!p.film) continue;
      const from = Math.max(s.from, p.film.begin), to = Math.min(s.to, p.film.end);
      if ((to - from) / fps <= 1) continue;
      const out = { from, to, seconds: Math.round(((to - from) / fps) * 100) / 100, part: p.name, parasiteOn: p.parasiteOn };
      // the plans that ended last before it, in the part or the one it extends
      const before = activities.filter((a) => (a.subscene === p.name || a.subscene === p.parasiteOn) && a.film && a.film.spans.some((r) => r.end <= from + 1));
      const lastEnd = Math.max(-1, ...before.flatMap((a) => a.film.spans.map((r) => r.end)).filter((e) => e <= from + 1));
      out.after = before.filter((a) => a.film.spans.some((r) => r.end === lastEnd)).map((a) => a.plan);
      const own = activities.filter((a) => a.subscene === p.name);
      const running = own.filter((a) => a.film && a.film.spans.some((r) => r.begin < to && r.end > from)).map((a) => a.plan);
      const repeat = p.movements ? /\(repeat (\d+) /.exec(p.movements) : null;
      const changes = () => Object.entries(p.changesFor).flatMap(([character, forms]) => forms.map((form) => ({ character, form, ...changeSeconds(form, extensions) })));
      if (running.length) {
        out.kind = "plans-running";
        out.running = running;
      } else if (repeat && p.film.end <= to + 1 && (to - from) <= Number(repeat[1]) + 2) {
        out.kind = "repeat-unwinding";
        out.repeat = Number(repeat[1]);
      } else if (Object.keys(p.changesFor).length) {
        // a part of only changes (its plans, if any, REVIVE;SEEN's), or one whose plans
        // have ended with its changes still running
        out.kind = own.every((a) => a.by === "REVIVE;SEEN") ? "only-changes" : "changes-running";
        out.changes = changes();
      } else out.kind = "nothing-running";
      stills.push(out);
    }
  }
  return { scene, parts, tasks, activities, stills };
}

// Each list in a form, depth first.
function walkForm(form, f) {
  if (!Array.isArray(form)) return;
  f(form);
  for (const x of form) walkForm(x, f);
}

// The stop conditions of a "stopping if" (dichar.103:401-499; REVIVE;CHSHOW's
// stop-when-plan-ended, REVIVE;SEEN's stop-when-changes-ended), each { kind, ... }.
function stopsOf(form, out) {
  if (!Array.isArray(form)) return;
  const [head, ...args] = form;
  const quoted = (x) => (Array.isArray(x) && x[0] === "quote" ? x[1] : x);
  if (head === "stop-if-either-wants-to") args.forEach((a) => stopsOf(a, out));
  else if (head === "stop-after-so-many-seconds") out.push({ kind: "after-seconds", seconds: Number(args[0]) });
  else if (head === "stop-when-there") out.push({ kind: "when-there" });
  else if (head === "stop-when-there-then") out.push({ kind: "when-there", then: printForm(quoted(args[1])) });
  else if (head === "stop-when-moved-original-distance-then" || head === "move-only-original-distance") out.push({ kind: "original-distance" });
  else if (head === "move-only-fraction-of-distance") out.push({ kind: "fraction-of-distance", fraction: Number(args[1]) });
  else if (head === "stop-when-plan-ended") out.push({ kind: "when-plan-ended", plan: printForm(quoted(args[0])) });
  else if (head === "stop-when-changes-ended") out.push({ kind: "when-changes-ended" });
  else out.push({ kind: "other", lisp: printForm(form) });
}

// The n of the (repeat n ...) of movements a plan is in, or null.
function repeatAround(movements, plan) {
  let found = null;
  walkForm(movements, (f) => {
    if (found === null && f[0] === "repeat" && JSON.stringify(f).includes(JSON.stringify(readForms(plan)[0]))) found = Number(f[1]);
  });
  return found;
}

// How long a change form of a part's changes runs: Ani's estimate (ten seconds an
// e-fold at low speed, five at medium, two and a half at high: DISPLY's
// estimate-time-for-change-by, disply.311:1098-1111, time-to-grow-e-times 5.0,
// interf.149:917) and Director's (DICHAR's gradually change, dichar.103:102-121, the
// weight multiplying where Ani's divides: four times Ani's at high speed, a quarter at
// low; as Ani's with SLIPS, whose S9 corrects it); a change in seconds (REVIVE;CHSHOW,
// LOOKS) takes its seconds.
function changeSeconds(form, extensions = []) {
  const f = readForms(form)[0];
  if (!Array.isArray(f)) return {};
  if (f[f.length - 1] === "seconds") { const s = Number(f[f.length - 2]); return { aniSeconds: s, directorSeconds: s }; }
  const by = f.indexOf("by"), at = f.indexOf("at");
  if (by < 0 || at < 0) return {};
  const factor = Number(f[by + 1]);
  const weight = { low: 0.5, medium: 1, high: 2 }[f[at + 1]];
  if (!weight || !(factor > 0)) return {};
  const ani = (5.0 / weight) * Math.abs(Math.log(factor));
  const slips = extensionsFor(extensions).some((e) => e.id === "slips");
  return { aniSeconds: Math.round(ani * 100) / 100, directorSeconds: Math.round((slips ? ani : 5.0 * weight * Math.abs(Math.log(factor))) * 100) / 100 };
}

// The stretches of a film of more than a second in which no character on the stage
// moves (its place or heading the same frame to frame): { from, to, seconds }, from the
// last frame anyone moved to the last still frame.
export function stillStretches(film, { fps = film.fps || 4, atLeast = 1 } = {}) {
  const moved = film.frames.map((fr, i) => {
    if (i === 0) return true;
    const prev = film.frames[i - 1];
    return Object.entries(fr.chars).some(([c, ch]) => {
      const p = prev.chars[c];
      if (!ch.visible || !ch.state) return false;
      if (!p || !p.visible || !p.state) return true;
      return ch.state[0] !== p.state[0] || ch.state[1] !== p.state[1] || ch.state[2] !== p.state[2];
    });
  });
  const out = [];
  for (let i = 1; i < moved.length; i++) {
    if (moved[i]) continue;
    let j = i;
    while (j + 1 < moved.length && !moved[j + 1]) j++;
    if ((j - (i - 1)) / fps > atLeast) out.push({ from: i - 1, to: j, seconds: Math.round(((j - (i - 1)) / fps) * 100) / 100 });
    i = j;
  }
  return out;
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
// characters, the earlier scenes each scene refers to (from-scene ...), and the
// characters each scene changes (changes), for REVIVE;CHANGE.
export function storyOutline(text) {
  const scenes = [], characters = [], fromScenes = {}, changes = {};
  const refs = (x, out) => {
    if (Array.isArray(x)) {
      if (x[0] === "from-scene" && typeof x[1] === "string") out.push(x[1]);
      for (const y of x) refs(y, out);
    }
    return out;
  };
  for (const f of readForms(text)) {
    if (!Array.isArray(f) || f[0] !== "define" || typeof f[1] !== "string") continue;
    if (f[2] === "scene") {
      scenes.push(f[1]);
      fromScenes[f[1]] = [...new Set(refs(f, []))];
      const found = f.slice(3).filter((x) => Array.isArray(x) && x[0] === "process" && x[1] === "initial" && x[2] === "description")
        .flatMap((x) => x.slice(3)).flatMap(changesOfTasks);
      if (found.length) changes[f[1]] = found;
    }
    if (f[2] === "character") characters.push(f[1]);
  }
  return { scenes, characters, fromScenes, changes };
}

// The changes a scene's tasks make, as REVIVE;CHANGE takes them (changes-in): a convey
// or establish task whose description is (change (TYPE WHO OLD) (TYPE WHO NEW)), as Ken
// wrote one in his commented-out cinderella-beautified (cindy.46:94-105), or a change
// inside (causes CAUSER ...), with the causer; only of a lasting description (physical,
// personality, movement, role-in-story or relationship). A change anywhere else in a
// task (inside wants, prevents or undoes, or in a display task) isn't made, and isn't
// here. Each is { type, who, from, to, cause, characters }: who is a character or
// ["relationship-of", a, b]; from and to are lists of words; characters are those it
// changes, both of a relationship's. ordering is a task or an (and ...) or
// (sequence: ...) of them.
const LASTING = ["physical", "personality", "movement", "role-in-story", "relationship"];
function changesOfTasks(ordering) {
  if (!Array.isArray(ordering)) return [];
  if (ordering[0] === "and" || ordering[0] === "sequence:") return ordering.slice(1).flatMap(changesOfTasks);
  return ordering[0] === "convey" || ordering[0] === "establish" ? changesIn(ordering[1], null) : [];
}
function changesIn(x, cause) {
  if (!Array.isArray(x)) return [];
  const part = (p) => Array.isArray(p) && p.length === 3 && typeof p[0] === "string";
  if (x[0] === "change" && x.length === 3 && part(x[1]) && part(x[2])) {
    if (!LASTING.includes(x[1][0])) return [];
    const words = (d) => (Array.isArray(d) && d[0] === "and" ? d.slice(1) : [d]);
    const who = x[1][1];
    const characters = Array.isArray(who) ? who.slice(1, 3) : [who];
    return [{ type: x[1][0], who, from: words(x[1][2]), to: words(x[2][2]), cause, characters }];
  }
  if (x[0] === "causes" && x.length > 2) return x.slice(2).flatMap((y) => changesIn(y, x[1]));
  return [];
}

// How a story's scenes and cast are named and drawn. Ken's own five scenes keep
// everything as RUN and ANINIT have it (ken); any other list of scenes is numbered:
// KEN;STORY<n> SCENE for the program, KEN1;STORY<n> MINI for the summary, FILM<n> for
// the movie, each scene starting from the POSIT file of the one before. Ken's four
// characters keep their shapes; new ones take the others in order. With looks (Ani
// chooses them, REVIVE;APPEAR), those beyond SHAPES start with NEUTRAL_LOOK, which their
// chosen look replaces; without, there are shapes for six. With change (REVIVE;CHANGE),
// a scene that changes someone has its changes and becomes, the BECOME file its fresh
// look writes (KEN1;<fn1> BECOME, named by its fn1), and every scene the becomes of the
// scenes before it, which its pass 2 learns who they have become from.
export function storyPlan(outline, { looks = false, change = false } = {}) {
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
  if (change) {
    const made = [];
    for (const s of scenes) {
      s.becomes = [...made];
      const changes = (outline.changes || {})[s.id] || [];
      if (changes.length) {
        s.changes = changes;
        s.become = s.file[0];
        made.push(s.file[0]);
      }
    }
  }
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

// ---------------------------------------------------------------- a story's names

// A story's scene or character must not be named as something Ani's files define: when
// the file loads, its definition replaces the story's, and the scene or character is
// gone. A scene called friends stopped a model's Lion and the Mouse once PREREQ loaded
// and made friends a dummy prerequisite (prereq.19:134); with KNOW, a scene called fear
// is made an emotion when EMOTE loads, and one called alone becomes CONVEY's verb. So a
// story's names are checked against those of a Lisp booted with the extensions: every
// name the tags give a file to load it from (Ken's, load.33:60-65, and the extensions'
// own), every actor there already, and the words DSCRP and RELATE make by linking (a
// story's brazen would be made shy's opposite). CINDY's own names are the story's to
// use: the story is the next version of KEN;CINDY. A name that clashes is renamed,
// fear to fear-scene, alone to alone-character, wherever the story names it (its
// definition, the tasks, (from-scene ...), the focus, and the ";; cast:" and ";; scenes:"
// lines, whose titles stay), and nowhere else: the feeling in (fear high) is left alone.
// The page's tidy step and the JSON translator use the same helper.

// The names a story may not use, lower case, for a Lisp booted with these extensions;
// made once for each set of extensions.
const namesTaken = new Map();
export function aniNames(fs, { extensions = [] } = {}) {
  const key = extensionsFor(extensions).map((e) => e.id).join(",");
  if (namesTaken.has(key)) return namesTaken.get(key);
  const L = boot(fs, { extensions });
  L.evalString("(load '|ken;dscrp >|)");
  L.evalString("(load '|ken;relate >|)");
  const indicator = (name) => L.obarray.find(name);
  const ACTOR_LOAD = indicator("ACTOR-LOAD"), ACTOR = indicator("ACTOR");
  const names = new Set();
  for (const [name, sym] of L.obarray.table) {
    for (let p = sym.plist; p && p !== L.NIL && p.cdr; p = p.cdr.cdr) {
      if (p.car === ACTOR || (p.car === ACTOR_LOAD && L.print(p.cdr.car) !== "|KEN;CINDY|")) {
        names.add(name.toLowerCase());
        break;
      }
    }
  }
  namesTaken.set(key, names);
  return names;
}

// The renames a story needs: [{ kind: "scene" | "character", from, to }].
export function storyRenames(outline, taken) {
  const used = new Set([...outline.scenes, ...outline.characters]);
  const renames = [];
  for (const [kind, names] of [["scene", outline.scenes], ["character", outline.characters]]) {
    for (const from of names) {
      // a scene named as one of the story's own characters is renamed too: the later
      // define replaces the earlier, and the character is never planned or drawn (Gemini
      // Nano's tortoise story made "The Crowd" the scene crowd, and the crowd a scene)
      const twin = kind === "scene" && !taken.has(from) && outline.characters.includes(from);
      if (!taken.has(from) && !twin) continue;
      let to = `${from}-${kind}`;
      for (let k = 2; taken.has(to) || used.has(to); k++) to = `${from}-${kind}-${k}`;
      used.add(to);
      renames.push(twin ? { kind, from, to, twin: true } : { kind, from, to });
    }
  }
  return renames;
}

// The story with its scenes and characters renamed (renames as storyRenames gives them),
// only where they are named: each scene's and character's definition; in a
// relationship's definition, its two characters; in a scene's description, every word
// that is not the first of its list (characters and from-scene's scene), but for the
// words of a description in a change, (personality goat (and kind good)); the focus's
// parts; and the cast and scenes lines.
export function renameStoryNames(text, renames) {
  if (!renames.length) return text;
  // by kind, since a scene renamed for being one of the story's characters (twin) is
  // renamed only where a scene is named; in the focus, which names either, it stays the
  // character's
  const toOf = Object.fromEntries(["scene", "character"].map((k) => [k, new Map(renames.filter((r) => r.kind === k).map((r) => [r.from, r.to]))]));
  const twins = new Set(renames.filter((r) => r.twin).map((r) => r.from));
  const toFor = (name, kind) => (kind ? toOf[kind].get(name) : toOf.character.get(name) || (twins.has(name) ? undefined : toOf.scene.get(name)));
  const edits = []; // [start, end, replacement]
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
      const items = [];
      for (;;) {
        skip();
        if (i >= n) return { items };
        if (text[i] === ")") { i++; return { items }; }
        items.push(read());
      }
    }
    if (c === ")") { i++; return { atom: ")" }; }
    if (c === "'") { i++; return { quoted: read() }; }
    if (c === "|" || c === '"') {
      const j = text.indexOf(c, i + 1);
      i = j < 0 ? n : j + 1;
      return { atom: "" };
    }
    const start = i;
    let tok = "";
    while (i < n && !/[\s()';|"]/.test(text[i])) {
      if (text[i] === "/") { tok += text[i + 1] || ""; i += 2; continue; }
      tok += text[i++];
    }
    return { atom: tok.toLowerCase(), start, end: i };
  };
  const rename = (x, kind) => { const t = x && x.atom && toFor(x.atom, kind); if (t) edits.push([x.start, x.end, t]); };
  const WORDS = ["physical", "personality", "movement", "role-in-story", "relationship"];
  // a scene's tasks: every word but a list's first, and but a change's words
  const inTasks = (x) => {
    if (!x || !x.items) return;
    const head = x.items[0] && x.items[0].atom;
    x.items.forEach((y, k) => {
      if (WORDS.includes(head) && k >= 2) return; // (personality goat (and ...)), the words
      if (y.items) return inTasks(y);
      if (y.quoted) return inTasks(y.quoted);
      if (k === 0) return;
      rename(y, head === "from-scene" && k === 1 ? "scene" : "character");
    });
  };
  const everything = (x) => {
    if (!x) return;
    if (x.items) x.items.forEach(everything);
    else if (x.quoted) everything(x.quoted);
    else rename(x);
  };
  for (skip(); i < n; skip()) {
    const f = read();
    if (!f.items || !f.items[0] || f.items[0].atom !== "define") continue;
    const [, name, type, ...body] = f.items;
    if (name && name.items) { if (name.items[0] && name.items[0].atom === "relationship-of") name.items.slice(1).forEach((x) => rename(x, "character")); continue; }
    if (type && (type.atom === "scene" || type.atom === "character")) rename(name, type.atom);
    if (type && type.atom === "scene") {
      for (const b of body) if (b.items && b.items[0] && b.items[0].atom === "process") b.items.slice(3).forEach((t) => (t.items ? inTasks(t) : rename(t, "character")));
    }
    if (type && type.atom === "focus") {
      for (const b of body) {
        const at = b.items ? b.items.findIndex((y) => y.atom === "parts-of-the-focus") : -1;
        if (at >= 0) everything(b.items[at + 2]);
      }
    }
  }
  let out = text;
  for (const [start, end, rep] of edits.sort((a, b) => b[0] - a[0])) out = out.slice(0, start) + rep + out.slice(end);
  // ";; cast: goat = the goat (she); troll = ..." and ";; scenes: on-the-bridge = On the Bridge; ..."
  return out.replace(/^(;;\s*(cast|scenes):)(.*)$/gm, (line, label, which, list) =>
    label + list.replace(/(^|;)(\s*)([a-z0-9+:-]+)(\s*=)/gi, (m, sep, sp, id, eq) => sep + sp + (toFor(id.toLowerCase(), which.toLowerCase() === "cast" ? "character" : "scene") || id) + eq));
}

// The story with any clashing names renamed, and the renames made.
export function storyWithoutClashes(fs, text, { extensions = [] } = {}) {
  const renames = storyRenames(storyOutline(text), aniNames(fs, { extensions }));
  return { text: renameStoryNames(text, renames), renames };
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
// With an extension that has steps of its own for a scene (sceneSteps: REVIVE;CHANGE's
// fresh look and full recompute, before the pass 2 of each scene that changes someone),
// those run too: their records go to the result's changes, { [scene]: changeRecord },
// each reported by onChange(scene, record) as it is made; one that fails is
// { scene, error } there (with keepGoing; without, the run stops), and the later
// scenes are planned without it. Each scene's pass 2 learns who they have become from
// the BECOME files this run's fresh looks wrote in the scenes before it.
export function* makeFilmSteps(fs, { progress = () => {}, scenes = null, description = null, keepGoing = false, frames = 1000, fps = 4, extensions = [], onPass1 = () => {}, onScene = () => {}, onChange = () => {} } = {}) {
  extensionsFor(extensions); // an unknown one stops the run before it starts
  const change = extensionsFor(extensions).some((e) => e.sceneSteps);
  let plan = null;
  let renames = [];
  if (description !== null) {
    // a scene or character named as something of Ani's is renamed (storyWithoutClashes)
    ({ text: description, renames } = storyWithoutClashes(fs, description, { extensions }));
    const versions = fs.dirs.get("KEN")?.get("CINDY");
    const top = versions ? Math.max(0, ...[...versions.keys()].filter((k) => /^\d+$/.test(k)).map(Number)) : 0;
    fs.addFile("KEN", "CINDY", String(top + 1), { text: description, origin: "changed" });
    plan = storyPlan(storyOutline(description), { looks: choosesLooks(extensions), ...(change ? { change } : {}) });
  } else if (change) {
    // the film description already on fs, Ken's or not: planned as a story only if it
    // changes someone, so that Ken's Cinderella is made as it was
    const cindy = fs.find({ dir: "KEN", fn1: "CINDY", fn2: ">" });
    const outline = cindy ? storyOutline(fs.textOf(cindy)) : null;
    if (outline && Object.keys(outline.changes).length) plan = storyPlan(outline, { looks: choosesLooks(extensions), change });
  }
  const renamed = (id) => (renames.find((r) => r.kind === "scene" && r.from === id) || { to: id }).to;
  const order = scenes ? scenes.map(renamed) : plan ? plan.scenes.map((s) => s.id) : SCENES;
  progress("pass1", choosesLooks(extensions) ? "Pass 1: choosing how each character moves and looks" : "Pass 1: choosing how each character moves");
  yield;
  const p1 = pass1(fs, { extensions });
  const out = { choices: p1.choices, choicePoints: p1.choicePoints, scenes: [] };
  if (renames.length) out.renames = renames; // [{ kind, from, to }]: the scenes and characters renamed
  if (extensions.length) out.extensions = extensionsFor(extensions).map((e) => e.id);
  if (p1.repairs) out.repairs = p1.repairs; // pass 1's, as each scene's glass box has its own
  if (p1.appearances) out.appearances = p1.appearances; // how Ani chose each character's look
  onPass1({ choices: p1.choices, choicePoints: p1.choicePoints, ...(p1.repairs ? { repairs: p1.repairs } : {}), ...(p1.appearances ? { appearances: p1.appearances } : {}) });
  const became = []; // the BECOME files this run's fresh looks wrote, by fn1
  for (const scene of order) {
    let done;
    const planned = change && plan ? plan.scenes.find((s) => s.id === scene) : null;
    const earlier = [...became];
    if (planned && planned.changes) {
      // Ani's fresh look at whoever the scene changes, and the full recompute beside it
      const changing = [...new Set(planned.changes.flatMap((c) => c.characters))];
      const who = changing.map((c) => c.replace(/-/g, " ")).join(" and ");
      try {
        progress("fresh-look", `Pass 1 again: a fresh look at ${who}, who change${changing.length > 1 ? "" : "s"} in ${scene.replace(/-/g, " ")}`, scene);
        yield;
        const look = freshLook(fs, scene, { plan, extensions, becomes: earlier });
        progress("recompute", `Pass 1 again, to compare: everyone chosen afresh as of ${scene.replace(/-/g, " ")}`, scene);
        yield;
        const recompute = recomputeEveryone(fs, scene, { plan, extensions, becomes: earlier });
        const record = changeRecord(look, recompute, planned);
        (out.changes ||= {})[scene] = record;
        became.push(planned.become);
        onChange(scene, record);
      } catch (e) {
        if (!keepGoing) throw e;
        const record = { scene, error: String((e && e.message) || e) };
        (out.changes ||= {})[scene] = record;
        onChange(scene, record);
      }
    }
    try {
      progress("pass2", `Pass 2: planning ${scene.replace(/-/g, " ")}`, scene);
      yield;
      const { glass } = pass2(fs, scene, { plan, extensions, ...(planned ? { becomes: earlier } : {}) });
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
