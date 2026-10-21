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
import { notebookToLisp, checkNotebook, yoursIndex, rehearsalStory, pieceWords, MAX_NOTEBOOKS } from "./teach.js";

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
    files: ["wrap", "mend1", "mend2", "mend3", "mend4", "mend5", "mend6", "mend7", "mend8", "mend9", "mend10", "mend11", "mend12", "mend13", "mend14", "mend15", "mend16", "mend17", "mend18", "mend19", "mend20"],
    requires: [],
    changes1978: false,
    note: "Repairs for failures new stories meet and Cinderella never does: (not X) and none values, unknown words, missing relationships and display methods, characters off the stage, COSUG's combine for change suggestions, two characters with nothing to compare, measuring from a small way from two places to a third, more than a few ways to convey what a task establishes, a scene that is one task shown by one, a place far off and off the stage that PLACE asks for and never defines, and a character shown off the stage past a corner, where Director's placing her again each tick stopped the film. Each leaves a (revival-repair: ...) note where it acted.",
  },
  {
    id: "appear",
    label: "Ani chooses how its characters look",
    group: "knowledge",
    files: ["wrap", "appear", "apsug", "shapes", "colors", "looks", "alter"],
    requires: [],
    changes1978: true,
    afterPass1: "(choose-appearances)",
    recorder: { looks: true },
    note: "Ani chooses each character's size, shape and color as it chooses how the character moves (thesis pp. 163-164): choice points for size, shape-jaggedness, shape-complexity and a color's intensity, saturation and hue, made after the 102 dynamics choices, with suggestions from the characters' words, relationships, comparisons and dynamics and the film's levels, each with its evidence; shape experts turn the choices into a polygon, star or circle, characters drawn alike have a shape choice made again to tell them apart, and the hue is one of six on a painter's wheel, a small semantic net of colors (p. 240). Pass 2 writes each character's look into the scene's program, and Director draws it; and looks change during a scene as Ani plans them, as display methods beside the dynamics changes (p. 166): joy brightens a character's colors, sadness dims them. Director keeps the colors without drawing them, and the film page paints them in color.",
  },
  {
    id: "change",
    label: "Characters who change",
    group: "knowledge",
    files: ["wrap", "hold", "change", "chshow"],
    // a change is shown by her wandering, as MEND9's wander-around wanders, and the one
    // it changes is brought on by MEND6's bring-on; a change story is a new story, which
    // needs MEND's repairs anyway
    requires: ["mend"],
    changes1978: false,
    sceneSteps: true,
    note: "A scene may change a character, as Ken wrote one in his cinderella-beautified scene: (change (personality step-mother (and evil mean)) (personality step-mother (and good kind))), alone or inside (causes prince ...). Ani takes a fresh look at whoever changes (thesis p. 168): pass 1 again, with the new words, every choice of everyone else held as it was, so that only the changed character is chosen again, and with APPEAR how she looks too. In the scene of the change Ani shows it (p. 169): the cause goes to the one it changes, and once they touch she changes as she wanders about, or she wanders as she changes if nothing causes it; Ani bridges the gap between how she moved and looked and how she will, over a time it decides, gradually, since an abrupt change could be misread, or at once if the cause is magical (the revival's rule). From the next scene on she is described, moves and looks as she has become. A full recompute, with everyone chosen afresh, is kept for comparison.",
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
    // Ken's decision of 16 October: CHOMET's slips in dividing a scene's time (SLIPS'
    // S15, stage 7's question 2) corrected, on with the revival's extensions and never
    // in "Ani as in 1978" (the page's switch must list it beside the five)
    id: "fit",
    label: "A scene keeps its time",
    group: "repairs",
    // and, by Ken's decision of 17 October, a stretched walk takes its stretch once
    // (REVIVE;FITSTR, S16) and a character's dynamics their parent's factors once
    // (REVIVE;SLIPS8, S8, which SLIPS has too: each file loads once)
    files: ["wrap", "fit", "fitstr", "slips8"],
    // the corrected adjust-task-lengths does REVIVE;MEND11's part too
    requires: ["mend"],
    changes1978: true,
    note: "Corrections of Ken's slips in dividing a scene's time among its tasks (CHOMET): a scene's length (short, medium or long) gives it a least and a most time, and \"Ani tries to constrain the film to be a (user) desired length\" (thesis p. 126), but when a task's only way of showing didn't fit, Ken's code moved the task's time, judged the scene by a length it would not have, and then gave the task its own ideal time, so that No Longer Kept Apart ran 4 seconds against its own least of 10: \"things happen too quickly and the fairy godmother just appears and is quickly gone\" (p. 69). Now, once the tasks have their times, a scene shorter than its least (or longer than its most) has its tasks moved to the bound, each within its least and most where it can be, and SCENE stretches their activities to fill it; and the three slips beside it are corrected: a way of showing that needs more time is heard under the name Ken's scoring writes (need-more-time:), and a scene's time is moved towards its bounds with the right sign, a task to its own least or most. In Ken's Cinderella, No Longer Kept Apart takes its 10 seconds, the fairy godmother accompanying Cinderella towards the Prince, and Kept Apart, a quarter second short of its 30, takes 30.  And by Ken's decision of 17 October two slips in how Director stretches a walk are corrected with it: a walk SCENE stretches took the stretch twice, Ken's PLACE writing the parent's speed into the walk's own and Director's demon multiplying it in again (the fairy godmother's accompanying, stretched to fill its 10 seconds, went at an eighth of her speed, not a third, and stopped short of the Prince), and a repeated walk took its parent's speed again each time it was set, so that a stretched activity slowed down cycle by cycle (Kept Apart's guard; a pushing around past the page's 250 seconds). Each leaves a note where it acted.",
  },
  {
    id: "slips",
    label: "Corrections of slips in Ken's files",
    group: "repairs",
    optIn: true,
    files: ["wrap", "slips", "slips1", "slips2", "slips3", "slips6", "slips7", "slips8", "slips9", "slip13", "slip14"],
    // S1 has good's helping find someone to help, which needs KNOW's way of showing
    // helping (REVIVE;KNOWCV): without it the helping is chosen and then dropped;
    // and S15 is FIT's, on with the revival's extensions (Ken's decision of 16 October)
    requires: ["know", "fit"],
    changes1978: true,
    // REVIVE;SLIPS3's notes on the choice points of a friendly character's tendencies
    afterPass1: "(note-friendlys-attractions)",
    note: "Corrections of slips in Ken's files, places where his code does something other than what the code beside it, his comments or his thesis say it is to do, each quoting the line it corrects (Ken's decision 2): is-not looks for someone in the task's scene, where it was given the task and never found anyone, and is-described-as is a preference, ideally all of the words, then any, then anyone (p. 100); a high level of variety picks the least used value and a low the most used, as the thesis says (p. 85); friendly's attractions are named as the elements are; a method's prerequisites are read under the name they are kept by; MIDDLE compares itself with (not bottom); and in Director, a character's dynamics take their parent's factors once, however often they are set, and a change once; a gradual change runs at the speed Ani's estimate gives it (the run confirmed the inversion: four times as long as planned at high speed, a quarter at low), grows once a tick, takes as many steps as it counts, and is carried forth into the walks the characters walk with in its part, as Ken's comment says it is to be; and the film is not stopped while the activity a feeling's part extends still runs. In Ken's Cinderella, Cinderella helps her stepmother in the Introduction; in Kept Apart the guard no longer slows down cycle by cycle, and as the feelings play Cinderella slows down and her paths straighten while the stepmother speeds up and her paths curve, as the thesis tells it (p. 66); and every feeling runs at the pace Ani planned. Each correction leaves a note where it acted.",
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
  {
    // A user's criticism of a film (reports/chapter-x/design-criticism.md). onDemand: not
    // one the switch or the panel turns on; the pipeline loads it, with MEND, into every
    // job of a film that has criticism (boot's criticism), and never otherwise. With an
    // empty record it changes nothing (tools/check-1978.mjs --extensions critic).
    id: "critic",
    label: "Your criticism",
    group: "criticism",
    onDemand: true,
    files: ["wrap", "hold", "critic", "critpc", "critsc"],
    // "start far from" places with PLACE's large-distance-and-offstage, which Ken never
    // defined and REVIVE;MEND19 does (Ken's decision 11 of the design, pending)
    requires: ["mend"],
    changes1978: false,
    note: "Ani heeds a record of your criticism of a film, kept with the film, as Ken's Section D proposes (thesis pp. 189-191: \"Ani should be extended to accept criticism of the films and their justification\"): a way of showing or of conveying vetoed in a task, which Ani sets aside and chooses among what is left (\"removing those alternatives that were vetoed by the user\"); a part too quick or too slow, whose time Ani stretches or shrinks by half again, within the time the story gives it; two characters kept apart in a scene, every way that would bring them together set aside as a prerequisite not met; and a character who starts far from another, placed far off and off the stage. The film is made again from the first scene criticized; a later scene whose plan comes out the same keeps its film. Each heeded criticism leaves a note where it acted, and nothing of it becomes Ani's knowledge.",
  },
  {
    // A learner's own knowledge (reports/chapter-x/design-teaching.md, "Teach Ani";
    // reports/ext/teach/README.md). onDemand, as CRITIC: never in the switch's set; the
    // pipeline loads it, with MEND, into every job of a film made with a learner's
    // notebooks (boot's knowledge), each notebook written as YOURS;N1 KNOW, N2 ... by
    // src/teach.js notebookToLisp and loaded after the extensions. With no notebook, or an
    // empty one, it changes nothing (tools/check-1978.mjs --extensions teach).
    id: "teach",
    label: "Your knowledge",
    group: "yours",
    onDemand: true,
    files: ["wrap", "teach"],
    // a learner's knowledge is soon used in new stories, which need MEND's repairs, and a
    // learner's feeling meets joy through MEND7's repaired combine (cosug.215:449-477);
    // not KNOW: a piece that needs KNOW says so (src/teach.js checkNotebook)
    requires: ["mend"],
    changes1978: false,
    note: "Knowledge you taught Ani on this page (Teach Ani), in Ken's notation, each piece with your reason: words, what they suggest, relationships and how they are shown, other ways of showing a verb, feelings, and verbs that are a kind of one of Ani's. Ken planned for a learner to \"change the system's vocabulary\" and \"see the knowledge of something actually accomplish something complex\" (\"Three Interactions between AI and Education\", 1977, p. 428; AI-TR-540 pp. 149-150). It only adds to Ani's knowledge, never removes or weakens Ken's. Loaded only into a film you make with your knowledge; Ani as in 1978, and Ken's film, never change.",
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
// and any of the revival's extensions asked for. With criticism, a record of a user's
// criticism of the film (checkCriticism's items; none, or an empty record, as without),
// REVIVE;CRITIC is loaded too, with what it requires, and the record is written to the
// file system as KEN1;FILM CRITIC (criticismToLisp) and read into :critic-record. With
// knowledge, a list of a learner's notebooks (src/teach.js; none, as without; an empty
// notebook, one with no pieces, still loads), REVIVE;TEACH is loaded too, with what it
// requires, and each notebook is written as YOURS;N1 KNOW, N2 ... (notebookToLisp, with
// the extensions it is loaded with) and loaded after the extensions, before the record.
export function boot(fs, { backtrace = false, extensions = [], criticism = null, knowledge = null } = {}) {
  const heeding = Boolean(criticism && criticism.length);
  const taught = Boolean(knowledge && knowledge.length);
  if (taught) extensions = withTeach(extensions);
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
  loadExtensions(L, heeding ? withCritic(extensions) : extensions);
  if (taught) {
    const loaded = extensionsFor(heeding ? withCritic(extensions) : extensions).map((e) => e.id);
    knowledge.forEach((notebook, k) => {
      fs.addFile("YOURS", `N${k + 1}`, "KNOW", { text: notebookToLisp(notebook, { n: k + 1, extensions: loaded }), origin: "knowledge" });
      L.evalString(`(load-your-knowledge '((yours) n${k + 1} know))`);
    });
  }
  if (heeding) {
    fs.addFile("KEN1", "FILM", "CRITIC", { text: criticismToLisp(criticism), origin: "criticism" });
    L.evalString("(load-criticism '((ken1) film critic))");
  }
  return L;
}

// The extensions a job of a film with criticism loads: the film's own, and CRITIC.
export const withCritic = (extensions = []) => (extensions.includes("critic") ? extensions : [...extensions, "critic"]);
// The extensions a job of a film made with a learner's knowledge loads: the film's own,
// and TEACH.
export const withTeach = (extensions = []) => (extensions.includes("teach") ? extensions : [...extensions, "teach"]);

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
// hold, a criticism of a pass-1 choice's (REVIVE;CRITIC, stage C6): the choice points
// to choose afresh, as Lisp ("(choice-point-of prince speed)"), every other choice held
// as KEN;CP > has it (REVIVE;HOLD hold-all-but-choice-points, before (z)); the result
// then has held, each choice held that would have come out differently, { choicePoint,
// heldAt, wouldHaveChosen }, as freshLook's. save: false leaves KEN;CP as it was (the
// full recompute a criticism is compared with).
export function pass1(fs, options = {}) {
  const steps = pass1Steps(fs, options);
  for (;;) {
    const r = steps.next();
    if (r.done) return r.value;
  }
}
// The same, with slice, pausing (yield "slice") between its parts (init, (z), each
// extension's afterPass1), as makeFilmSteps's slice asks; without, nowhere.
export function* pass1Steps(fs, { cpVersion = 30, backtrace = false, extensions = [], setup = null, criticism = null, knowledge = null, hold = null, save = true, slice = null } = {}) {
  const L = boot(fs, { backtrace, extensions: hold ? withCritic(extensions) : extensions, criticism, knowledge });
  if (setup) setup(L);
  L.evalString("(load '|ken;datest >|)");
  if (slice) yield "slice";
  L.evalString("(init nil)");
  if (hold) L.evalString(`(hold-all-but-choice-points '(${hold.join(" ")}) '((ken) cp >))`);
  if (slice) yield "slice";
  L.evalString("(z)");
  for (const e of extensionsFor(extensions)) if (e.afterPass1) {
    if (slice) yield "slice";
    L.evalString(e.afterPass1);
  }
  let held = null;
  if (hold) {
    held = L.toArray(L.evalString(":change-held-against")).reverse().map((x) => {
      const [choicePoint, heldAt, wouldHaveChosen] = L.toArray(x).map((y) => toJSON(L, y));
      return { choicePoint, heldAt, wouldHaveChosen };
    });
    L.evalString("(setq :change-held nil)"); // nothing more is held
  }
  if (save) L.evalString(`(save-answers '((ken) cp ${cpVersion}))`);
  const choicePoints = collectChoicePoints(L);
  const repairs = noting(L) ? repairNotes(L) : [];
  const appearances = choosesLooks(extensions) ? collectAppearances(L) : null;
  return { choices: choicePoints.length, choicePoints, ...(repairs.length ? { repairs } : {}), ...(appearances ? { appearances } : {}), ...(held ? { held } : {}), lisp: L };
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
export function freshLook(fs, scene, { plan, extensions = [], becomes = null, backtrace = false, knowledge = null, criticism = null } = {}) {
  const s = plan.scenes.find((x) => x.id === scene);
  const L = boot(fs, { backtrace, extensions: withChange(extensions), knowledge, criticism });
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

export function recomputeEveryone(fs, scene, { plan, extensions = [], becomes = null, backtrace = false, knowledge = null, criticism = null } = {}) {
  const s = plan.scenes.find((x) => x.id === scene);
  const L = boot(fs, { backtrace, extensions: withChange(extensions), knowledge, criticism });
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
export function pass2(fs, scene, { backtrace = false, setup = null, plan = null, extensions = [], becomes = null, criticism = null, knowledge = null } = {}) {
  const L = boot(fs, { backtrace, extensions, criticism, knowledge });
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
  // what the user's criticism did (REVIVE;CRITIC's heeded-criticism: and
  // unmet-criticism: notes), only if it did anything, for the same reason
  const criticism = criticismNotes(L, glass);
  if (criticism.length) glass.criticism = criticism;
  return glass;
}

// The notes REVIVE;CRITIC left where a criticism was heeded, or could not be,
//   (heeded-criticism: id C what W was X now Y because R)
//   (unmet-criticism: id C what W was X because R)
// as { actor, id, heeded, what, was, now?, because, note }: heeded true or false, what
// the kind of criticism (another-way, pace, keep-apart, start-far), was, now and because
// printed as Lisp, and note the whole item. Those of the glass box's actors, then of any
// other actor CRITIC noted (:critic-noted), each actor once, each note once. Looked up
// without interning anything unless REVIVE;CRITIC is loaded.
export function criticismNotes(L, glass) {
  const noted = L.obarray.find(":CRITIC-NOTED");
  if (!noted || noted.value === UNBOUND) return [];
  const lisp = (x) => L.print(x).toLowerCase();
  const out = [];
  const seen = new Set();
  const add = (actor, items) => {
    if (seen.has(actor)) return;
    seen.add(actor);
    for (const note of items) {
      const heeded = note.startsWith("(heeded-criticism: ");
      if (!heeded && !note.startsWith("(unmet-criticism: ")) continue;
      const form = readForms(note)[0];
      const get = (k) => { const i = form.indexOf(k); return i > 0 ? printForm(form[i + 1]) : null; };
      out.push({ actor, id: get("id"), heeded, what: get("what"), was: get("was"), ...(heeded ? { now: get("now") } : {}), because: get("because"), note });
    }
  };
  for (const a of [glass.scene, ...glass.tasks, ...glass.subscenes, ...glass.plans, ...glass.dynamics, glass.choices]) add(a.name, a.items);
  if (noted.value instanceof Cons) {
    for (const x of L.toArray(noted.value).reverse()) {
      if (x === L.NIL || seen.has(lisp(x))) continue;
      L.intern("*GB-ACTOR*").value = x;
      add(lisp(x), L.toArray(L.evalString("(ask ,*gb-actor* collect items)")).map(lisp));
    }
  }
  return out;
}

// The wanders REVIVE;SEEN planned in the scene, from the memo each wandering plan keeps,
// (wanders: character c while (changes-for c) in s after w once-nothing-moves-her-in
// (s ...) because (...)): for each, { character, plan, waiting, subscene, watched,
// because }, plan the wandering plan, waiting the plan that waits until nothing else
// moves her, both printed as Lisp, watched the parts whose plans that move her it waits
// for (her part, and the one it extends), because the reason as Lisp. From the glass
// box's plans, so it needs no Lisp.
export function collectWanders(glass) {
  const out = [];
  for (const p of glass.plans || []) {
    for (const item of p.items || []) {
      if (!item.startsWith("(wanders: ")) continue;
      const memo = readForms(item)[0];
      const get = (k) => { const i = memo.indexOf(k); return i >= 0 ? memo[i + 1] : null; };
      const watched = get("once-nothing-moves-her-in");
      out.push({
        character: get("character"), plan: p.name, waiting: printForm(get("after")), subscene: printForm(get("in")),
        watched: Array.isArray(watched) ? watched.map(printForm) : [], because: printForm(get("because")),
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
// ANINIT's (m n), (ask ,movie-name film the next ,n ticks), a slice at a time: MOVIE's
// method (movie.153:18-45) as it is, but with its do loop's variables kept between
// slices in revive-slice-... and the loop left, between two ticks, when the slice is
// over (REVIVE-SLICE-OVER?, filmSteps's). It is asked again until revive-slice-done.
// Each tick runs with what the method binds bound as the method binds it (:self, length,
// screen-mode and the do loop's), so Director's run is the method's.
const SLICED_FILMING = `(progn
 (setq revive-slice-started nil revive-slice-done nil)
 (define-method (revive film the next ?length ticks a slice at a time) movie
  (cond ((null revive-slice-started)
	 (setq revive-slice-started t)
	 (ask movie set your current-movie to ,(name-of :self))
	 (setq revive-slice-screen-mode (ask screen recall your mode))
	 (ask screen set your mode to ,(ask :self recall your screen-mode))
	 (setq revive-slice-time 0
	       revive-slice-frame-number (ask :self recall your frame-count)
	       revive-slice-universe (ask :self recall your universe)
	       revive-slice-new-frame-handler (ask :self recall your new-frame-handler)
	       revive-slice-ticks-per-frame (ask :self recall your ticks-per-frame)
	       revive-slice-frames-per-second (ask :self recall your frames-per-second)
	       revive-slice-stopped? nil)))
  (let ((screen-mode revive-slice-screen-mode))
       (do ((time revive-slice-time (1+ time))
	    (frame-number revive-slice-frame-number)
	    (universe revive-slice-universe)
	    (new-frame-handler revive-slice-new-frame-handler)
	    (:ticks-per-frame revive-slice-ticks-per-frame)
	    (:frames-per-second revive-slice-frames-per-second)
	    (stopped? revive-slice-stopped? (ask :self recall your stopped?)))
	   ((cond ((or stopped? (> time length)
		       (null (ask ,universe recall your actors-to-run-next)))
		   (setq revive-slice-done t)
		   (ask screen set your mode to ,screen-mode)
		   t)
		  ((revive-slice-over?)
		   (setq revive-slice-time time
			 revive-slice-frame-number frame-number
			 revive-slice-stopped? stopped?)
		   t))
	    frame-number)
	   (cond ((= (\\ time :ticks-per-frame) 0)
		  (put-in-wholine frame-number)
		  (compile-using frame-handler
				 (ask ,new-frame-handler
				      just made frame number ,frame-number for ,:self))
		  (ask :self set your frame-count to ,frame-number)
		  (setq frame-number (1+ frame-number))))
	   (compile-using universe (ask ,universe tick))))))`;
export function film(fs, scene, options = {}) {
  const steps = filmSteps(fs, scene, options);
  for (;;) {
    const r = steps.next();
    if (r.done) return r.value;
  }
}
// The same, a slice at a time: a generator that, with slice (milliseconds), pauses
// (yield "slice") about that often while Director films, so that a page running Ani on
// itself (the claude.ai copy) can answer between slices. Without slice it pauses
// nowhere, and films as film does. A slice is whole ticks: Director films as ANINIT's
// m does, (film the next n ticks) (movie.153:18-45), its do loop run by
// SLICED_FILMING a slice at a time, with the same variables bound to the same values
// at each tick, so that the film is the same, frame for frame.
export function* filmSteps(fs, scene, { fps = 4, frames = 1000, backtrace = false, onClick = null, plan = null, extensions = [], setup = null, criticism = null, knowledge = null, slice = null } = {}) {
  const L = boot(fs, { backtrace, extensions, criticism, knowledge });
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
  if (slice) yield "slice";
  L.evalString(`(start '${scene} ${fps})`);
  if (!slice) L.evalString(`(m ${frames})`);
  else {
    let deadline = 0, checked = 0;
    // at least one tick a slice, however long a tick takes
    L.defsubr("REVIVE-SLICE-OVER?", () => (++checked > 1 && performance.now() > deadline ? L.T : L.NIL));
    L.evalString(SLICED_FILMING);
    for (;;) {
      deadline = performance.now() + slice;
      checked = 0;
      L.evalString(`(ask ,movie-name revive film the next ${frames} ticks a slice at a time)`);
      if (L.evalString("revive-slice-done") !== L.NIL) break;
      yield "slice";
    }
  }
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
// its records, found where it keeps it (each field says where), or a film's frames.
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
//              there sooner; REVIVE;SEEN's wander "changes-ended", its waiting "free" if
//              the wander after it walked, else "changes-ended"; else null); and, for
//              SEEN's waiting plans, watched (the parts whose plans it watches) and
//              waitsFor (those of their plans that move her)
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
      // REVIVE;SEEN's: the wander ends with her changes; its waiting, once nothing else
      // moves her, if the wander after it walked, else with her changes
      if (activity === "wandering-while-changes-run") return "changes-ended";
      if (activity === "waiting-to-wander" && wander) {
        const walked = (spans.get(wander.plan) || []).some((w) => w.begin !== null && (w.end === null ? last : w.end) > w.begin);
        return walked ? "free" : "changes-ended";
      }
      return null;
    });
    return {
      plan: p.name, activity, part: part ? part.n : null, subscene: v.subscene || null, characters: [...characters],
      method, by: family ? REVIVAL_METHODS[family] || "DISPLY" : null, task, estimate,
      ...(wander && activity === "waiting-to-wander" ? { watched: wander.watched } : {}),
      beginTime: v["begin-time"] || null, stops, repeated,
      ...(film ? { film: { spans: runs, seconds: runs.reduce((a, r) => a + (r.end - r.begin) / fps, 0) }, ended } : {}),
    };
  });
  // what each of SEEN's waiting plans waits for: the plans of the parts it watches that
  // move her, but SEEN's own (REVIVE;SEEN nothing-moves-her-in?)
  for (const a of activities) {
    if (!a.watched) continue;
    a.waitsFor = activities.filter((b) => a.watched.includes(b.subscene) && b.by !== "REVIVE;SEEN" && b.activity !== "bridging-the-gap" && b.characters.includes(a.characters[0])).map((b) => b.plan);
  }
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

// The ends of the revival's walks with a character off the picture: for each plan a
// revival's method wrote (whyTheyAct's activities, by other than DISPLY's), at the frame
// each of its runs ended, each of its characters shown on the stage none of whose lines
// reach the picture. The film's segments are the picture's own dots, and the recorder
// keeps none for a character none of whose lines reach it (recorder, above); one partly
// off, at an edge, has some. [{ plan, by, frame, character }]; none is the check that the
// revival plans no walk, but an exit, that leaves anyone off the picture (Ken's own
// methods' walks, exit-by's among them, are not looked at).
export function walksOffThePicture(glass, film, { fps = film.fps || 4 } = {}) {
  const out = [];
  for (const a of whyTheyAct(glass, film, { fps }).activities) {
    if (!a.by || a.by === "DISPLY" || !a.film) continue;
    for (const span of a.film.spans) {
      const frame = film.frames[Math.min(span.end, film.frames.length - 1)];
      for (const c of a.characters) {
        const ch = frame.chars[c];
        if (ch && ch.visible && !frame.segs[c]) out.push({ plan: a.plan, by: a.by, frame: span.end, character: c });
      }
    }
  }
  return out;
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
// last frame anyone moved to the last still frame. A film whose frames keep only the
// picture's segments (the film page's 1978 films, tools/build-film-app.mjs packFilm,
// which keeps no state) is read by its segments instead: a character moves when its
// lines on the picture do (the build checks that this finds the same stretches).
export function stillStretches(film, { fps = film.fps || 4, atLeast = 1 } = {}) {
  const same = (a, b) => (!a && !b) || (!!a && !!b && a.length === b.length && a.every((v, k) => v === b[k]));
  const moved = film.frames.map((fr, i) => {
    if (i === 0) return true;
    const prev = film.frames[i - 1];
    return Object.entries(fr.chars).some(([c, ch]) => {
      const p = prev.chars[c];
      if (!ch.visible) return false;
      if (!ch.state && "state" in ch) return false;
      if (!("state" in ch)) return !p || !p.visible || !same(fr.segs && fr.segs[c], prev.segs && prev.segs[c]);
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
// With knowledge (a learner's notebooks, boot's), a learner's words are Ani's names too,
// so that a story's scene called grumpy is renamed.
export function aniNames(fs, { extensions = [], knowledge = null } = {}) {
  const taught = knowledge && knowledge.length ? knowledge : null;
  const key = extensionsFor(extensions).map((e) => e.id).join(",") + (taught ? ` ${JSON.stringify(taught.map((nb) => notebookToLisp(nb, { extensions })))}` : "");
  if (namesTaken.has(key)) return namesTaken.get(key);
  const L = boot(fs, { extensions, ...(taught ? { knowledge: taught } : {}) });
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
export function storyWithoutClashes(fs, text, { extensions = [], knowledge = null } = {}) {
  const renames = storyRenames(storyOutline(text), aniNames(fs, { extensions, knowledge }));
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
// onFrame(scene, frame), if given, is called as each frame is filmed (film's onClick),
// frame counted from 0, so that a page can say how far the filming has got.
// criticism, a record of a user's criticism (checkCriticism's items), is heeded in every
// job (boot's criticism) and kept as the result's criticism; remakeFilmSteps, which
// remakes a film from the first scene criticized, makes a film so when the film to remake
// kept no files. keepFiles: the result's files are the text of every file the run wrote
// (filesOf), which remakeFilmSteps remakes it from.
// slice (milliseconds), if given, also pauses (yield "slice") about that often while a
// scene is filmed (filmSteps), for a page that runs Ani on itself; the film is the same.
export function* makeFilmSteps(fs, { progress = () => {}, scenes = null, description = null, keepGoing = false, frames = 1000, fps = 4, extensions = [], onPass1 = () => {}, onScene = () => {}, onChange = () => {}, onFrame = null, criticism = null, knowledge = null, keepFiles = false, slice = null } = {}) {
  extensionsFor(extensions); // an unknown one stops the run before it starts
  if (criticism && criticism.length) checkRecord(criticism);
  if (knowledge && knowledge.length > MAX_NOTEBOOKS) throw new Error(`a film is made with up to ${MAX_NOTEBOOKS} notebooks of knowledge, not ${knowledge.length}`);
  // a film is never made with a notebook Ani refuses (src/teach.js checkNotebook, with
  // Ani's names: a word taught again would be defined again, replacing Ani's)
  if (knowledge && knowledge.length) {
    const taken = aniNames(fs, { extensions });
    knowledge.forEach((nb, k) => {
      const r = checkNotebook(nb, { extensions: extensionsFor(withTeach(extensions)).map((e) => e.id), taken, others: knowledge.slice(0, k) });
      if (!r.ok) throw new Error(`Ani refuses the notebook ${JSON.stringify((nb && nb.title) || `notebook ${k + 1}`)}: ${r.refused.map((x) => `${x.piece ? `${x.piece}: ` : ""}${x.says}`).join(" ")}`);
    });
  }
  // the learner's knowledge, heeded in every job, as the criticism is
  const heed = { ...(criticism && criticism.length ? { criticism } : {}), ...(knowledge && knowledge.length ? { knowledge } : {}) };
  const change = extensionsFor(extensions).some((e) => e.sceneSteps);
  let plan = null;
  let renames = [];
  if (description !== null) {
    // a scene or character named as something of Ani's is renamed (storyWithoutClashes)
    ({ text: description, renames } = storyWithoutClashes(fs, description, { extensions, ...(heed.knowledge ? { knowledge: heed.knowledge } : {}) }));
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
  const p1 = yield* pass1Steps(fs, { extensions, slice, ...heed });
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
        const look = freshLook(fs, scene, { plan, extensions, becomes: earlier, ...(heed.knowledge ? { knowledge: heed.knowledge } : {}) });
        progress("recompute", `Pass 1 again, to compare: everyone chosen afresh as of ${scene.replace(/-/g, " ")}`, scene);
        yield;
        const recompute = recomputeEveryone(fs, scene, { plan, extensions, becomes: earlier, ...(heed.knowledge ? { knowledge: heed.knowledge } : {}) });
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
      const { glass } = pass2(fs, scene, { plan, extensions, ...(planned ? { becomes: earlier } : {}), ...heed });
      progress("film", `Filming ${scene.replace(/-/g, " ")}`, scene);
      yield;
      const { film: f } = yield* filmSteps(fs, scene, { plan, frames, fps, extensions, slice, ...(onFrame ? { onClick: (i) => onFrame(scene, i) } : {}), ...heed });
      done = { id: scene, film: f, glass };
    } catch (e) {
      if (!keepGoing) throw e;
      done = { id: scene, error: String((e && e.message) || e) };
    }
    out.scenes.push(done);
    onScene(done);
  }
  if (heed.criticism) out.criticism = heed.criticism;
  if (heed.knowledge) out.knowledge = heed.knowledge; // the notebooks it was made with, as they were
  if (keepFiles) out.files = filesOf(fs);
  return out;
}

// ---------------------------------------------------------------- criticism

// A user's criticism of a film (reports/chapter-x/design-criticism.md; thesis Chapter
// X.D, "Critics and Criticism", AI-TR-540 pp. 189-191), heeded by REVIVE;CRITIC. The
// record is kept with the film (run.criticism), never in its description, as a list of
// items, each an object:
//   common       id ("c1", unique in the record), kind, by ("you"; Ani's own, "ani",
//                is for stage C5), said (the user's words, or null; the page's, not Ani's)
//   another-way  scene, task (the task's description, printed as Lisp: taskDescription),
//                level ("display": how it is shown, a display method; "convey": what is
//                shown, a convey method of an establish task), vetoes (the method's name,
//                its first word: goes-to-and-accompanys, accompanys); and source, only
//                where the scene has more than one task of that description, the
//                description of the task it came from (its (task: ... source s): an
//                establish task's, as Lisp, or "initial-description"; taskSource)
//   pace         scene, tasks (the part's tasks' descriptions), direction ("too-quick"
//                or "too-slow"), times (how many times said, 1 or more; each is a factor
//                of PACE_FACTOR, compounding: addCriticism keeps one item a part); and
//                sources, as another-way's source, one for each task (null where the
//                description is enough), only where one is needed. A record has one pace
//                item for a part: two that name the same task are refused (checkRecord)
//   keep-apart   scenes (one or more), between ([a, b], two characters)
//   start-far    scene, who, from (two characters): who starts far from from
//   choice       the revival's extension (stage C6): a pass-1 choice criticized,
//                character, element (a choice point (choice-point-of character element),
//                "speed", "path-curvature", ...), direction ("lower", "higher" or "not":
//                a direction, never a value) and was (the value the film criticized has
//                there, which the direction is from: "high"). For the whole film: a
//                choice item has no scene (CHOICE_PER_SCENE says why). A record has one
//                choice item for a choice point (addCriticism replaces it)
// The Lisp sees it as KEN1;FILM CRITIC (criticismToLisp), without the words said.
export const CRITICISM_KINDS = ["another-way", "pace", "keep-apart", "start-far", "choice"];
// A pass-1 choice's direction in Ken's own value language (cosug.215:302-307, 382-400):
// lower, (less-than high); higher, (greater-than low); not, (not high).
export const CHOICE_DIRECTIONS = { lower: "less-than", higher: "greater-than", not: "not" };
// Why a choice item has no scene: a pass-1 choice is a character's for the whole film
// (pass 2 reads it in every scene, scene.9:265-275); slower in one scene is a feeling
// of that scene's, which Ani shows by changing how she moves there (EMOTE's joy changes
// her speed, emote.9:12-35), so it is a change to the story, the editor's, not a
// criticism of Ani's choice.
export const CHOICE_PER_SCENE = "A pass-1 choice is for the whole film: Ani chooses how a character moves once, and every scene reads it. Slower in one scene is a feeling in that scene (Ani shows a character's joy, or its lack, by how fast she moves there), so it is a change to the story: say how the character feels in that scene, in the editor.";
// The words of a choice criticism, by element and direction ("moves too fast"); the
// others "has too much ..."/"has too little ...".
const CHOICE_WORDS = {
  speed: { lower: "moves too fast", higher: "moves too slowly" },
  "path-curvature": { lower: "moves in paths too curvy", higher: "moves in paths too straight" },
  "path-length": { lower: "takes paths too long", higher: "takes paths too short" },
  "path-jaggedness": { lower: "moves in paths too jagged", higher: "moves in paths too smooth" },
};
export function choiceWords(item) {
  const name = (x) => String(x).replace(/-/g, " ");
  if (item.direction === "not") return `${name(item.character)}'s ${name(item.element)}: not ${name(item.was)}`;
  const w = CHOICE_WORDS[item.element];
  return `${name(item.character)} ${w ? w[item.direction] : `has too ${item.direction === "lower" ? "much" : "little"} ${name(item.element)}`}`;
}
// The choice point a choice item names, as the glass box names it, and as Lisp.
export const choicePointOf = (item) => ["choice-point-of", item.character, item.element];
const choicePointLisp = (item) => `(choice-point-of ${item.character} ${item.element})`;
const choiceKey = (item) => `${item.character} ${item.element}`;
// One "too quick" is half as long again (the revival's choice, pending Ken: design
// question 3), compounding; within the part's allocated time and SCENE's stretch of 8
// and 1/8 (REVIVE;CRITPC).
export const PACE_FACTOR = 1.5;

const isName = (x) => typeof x === "string" && /^[a-z0-9][a-z0-9+*:.?!-]*$/.test(x);
function isForm(x) {
  if (typeof x !== "string") return false;
  try {
    const f = readForms(x);
    return f.length === 1 && Array.isArray(f[0]);
  } catch {
    return false;
  }
}
// A task's description as the record keeps it: printed as Lisp, lower case, single spaced.
const normalForm = (x) => printForm(readForms(String(x))[0]);

// An item checked (as the record keeps it, above); an error says what is wrong.
export function checkCriticism(item) {
  const bad = (why) => { throw new Error(`criticism${item && typeof item.id === "string" ? ` ${item.id}` : ""}: ${why}`); };
  if (!item || typeof item !== "object" || Array.isArray(item)) bad("is not an object");
  if (!/^c[0-9]+$/.test(String(item.id))) bad("its id must be c1, c2, ...");
  if (!CRITICISM_KINDS.includes(item.kind)) bad(`no such kind ${JSON.stringify(item.kind)}; known: ${CRITICISM_KINDS.join(", ")}`);
  if (item.by !== undefined && item.by !== "you" && item.by !== "ani") bad("by is you or ani");
  if (item.said !== undefined && item.said !== null && typeof item.said !== "string") bad("said is words or null");
  const two = (a, b, what) => { if (!isName(a) || !isName(b) || a === b) bad(`${what} must be two different characters`); };
  const isSource = (x) => x === "initial-description" || isForm(x);
  if (item.kind === "another-way") {
    if (!isName(item.scene)) bad("needs its scene");
    if (!isForm(item.task)) bad("needs its task, the task's description as Lisp");
    if (item.level !== "display" && item.level !== "convey") bad("level is display or convey");
    if (!isName(item.vetoes)) bad("vetoes names a method by its first word");
    if (item.source !== undefined && item.source !== null && !isSource(item.source)) bad("source is the description of the task it came from, as Lisp, or initial-description");
  } else if (item.kind === "pace") {
    if (!isName(item.scene)) bad("needs its scene");
    if (!Array.isArray(item.tasks) || !item.tasks.length || !item.tasks.every(isForm)) bad("needs its part's tasks, each a description as Lisp");
    if (item.direction !== "too-quick" && item.direction !== "too-slow") bad("direction is too-quick or too-slow");
    if (!Number.isInteger(item.times) || item.times < 1) bad("times is how many times it was said, 1 or more");
    if (item.sources !== undefined && item.sources !== null && (!Array.isArray(item.sources) || item.sources.length !== item.tasks.length || !item.sources.every((s) => s === null || isSource(s)))) bad("sources, if given, is one for each task: the description of the task it came from, or null");
  } else if (item.kind === "keep-apart") {
    if (!Array.isArray(item.scenes) || !item.scenes.length || !item.scenes.every(isName)) bad("needs its scenes");
    if (!Array.isArray(item.between) || item.between.length !== 2) bad("between is two characters");
    two(item.between[0], item.between[1], "between");
  } else if (item.kind === "start-far") {
    if (!isName(item.scene)) bad("needs its scene");
    two(item.who, item.from, "who and from");
  } else if (item.kind === "choice") {
    if (item.scene !== undefined || item.scenes !== undefined) bad(CHOICE_PER_SCENE);
    if (!isName(item.character)) bad("needs its character");
    if (!isName(item.element)) bad("needs its element, a choice of pass 1's (speed, path-curvature, ...)");
    if (!Object.hasOwn(CHOICE_DIRECTIONS, item.direction)) bad("direction is lower, higher or not: a direction, never a value");
    if (!isName(item.was)) bad("was is the value the film has, which the direction is from (low, medium, high, ...)");
  }
  return item;
}

// A record checked: a list of items, each id once.
export function checkRecord(record) {
  if (!Array.isArray(record)) throw new Error("a criticism record is a list of criticisms");
  const ids = new Set();
  const paced = new Map(); // a task of a scene, by description and source: the pace item naming it
  for (const c of record) {
    checkCriticism(c);
    if (ids.has(c.id)) throw new Error(`criticism ${c.id}: its id is used twice`);
    ids.add(c.id);
    if (c.kind === "choice") {
      const other = paced.get(`choice ${choiceKey(c)}`);
      if (other) throw new Error(`criticism ${c.id}: ${other} already criticizes that choice; a choice point has one choice item (addCriticism replaces it)`);
      paced.set(`choice ${choiceKey(c)}`, c.id);
    }
    if (c.kind !== "pace") continue;
    c.tasks.forEach((t, k) => {
      const key = `${c.scene} ${normalForm(t)} ${(c.sources && c.sources[k]) || ""}`;
      const other = paced.get(key);
      if (other) throw new Error(`criticism ${c.id}: ${other} already says how quick that part is; a part has one pace item (addCriticism compounds them)`);
      paced.set(key, c.id);
    });
  }
  return record;
}

// The factor a pace criticism stretches its part's time by: 1.5 for each "too quick",
// 1/1.5 for each "too slow".
export function paceFactor(item) {
  const f = PACE_FACTOR ** item.times;
  return item.direction === "too-quick" ? f : 1 / f;
}

// The scenes an item criticizes.
// A choice item criticizes pass 1, which every scene reads: none of them by name, all
// of them in effect (remakeFilmSteps remakes from pass 1).
export function criticismScenes(item) {
  return item.kind === "keep-apart" ? [...item.scenes] : item.kind === "choice" ? [] : [item.scene];
}

// The record as KEN1;FILM CRITIC: a comment, then one (criticism: ...) form an item,
// which REVIVE;CRITIC's load-criticism reads into :critic-record. The words said are
// left out: they are the user's, for the page, and MacLisp's reader here has no strings.
export function criticismToLisp(record) {
  checkRecord(record);
  const lines = [";;; KEN1;FILM CRITIC: the user's criticism of this film, for REVIVE;CRITIC (src/pipeline.js criticismToLisp)"];
  for (const c of record) {
    const parts = [`id ${c.id}`, `kind ${c.kind}`];
    const source = (s) => (s === null || s === undefined ? "nil" : s === "initial-description" ? s : normalForm(s));
    if (c.kind === "another-way") parts.push(`scene ${c.scene}`, `task ${normalForm(c.task)}`, ...(c.source ? [`source ${source(c.source)}`] : []), `level ${c.level}`, `vetoes ${c.vetoes}`);
    if (c.kind === "pace") parts.push(`scene ${c.scene}`, `tasks (${c.tasks.map(normalForm).join(" ")})`, ...(c.sources && c.sources.some(Boolean) ? [`sources (${c.sources.map(source).join(" ")})`] : []), `direction ${c.direction}`, `factor ${lispFloat(paceFactor(c))}`);
    if (c.kind === "keep-apart") parts.push(`scenes (${c.scenes.join(" ")})`, `between (${c.between.join(" ")})`);
    if (c.kind === "start-far") parts.push(`scene ${c.scene}`, `who ${c.who}`, `from ${c.from}`);
    if (c.kind === "choice") parts.push(`choice-point ${choicePointLisp(c)}`, `direction ${c.direction}`, `was ${c.was}`, `value (${CHOICE_DIRECTIONS[c.direction]} ${c.was})`);
    parts.push(`by ${c.by || "you"}`);
    lines.push(`(criticism: ${parts.join(" ")})`);
  }
  return lines.join("\n") + "\n";
}
const lispFloat = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));

// The record with an item added: { record, item }, the record a new list and item the
// one it keeps (null if the item cancelled one). An item without an id is given the next
// (c1, c2, ...); by is "you" unless given. A pace criticism of a part already criticized
// so compounds: the same direction says it once more (times + 1), the other once less,
// and none left takes the item out. A criticism the record already has is not added
// again (item is the one there).
export function addCriticism(record = [], item) {
  checkRecord(record);
  const next = `c${1 + Math.max(0, ...record.map((c) => Number(c.id.slice(1))))}`;
  const c = { ...item, id: item.id || next, by: item.by || "you" };
  if (c.said === undefined) c.said = null;
  const normalSource = (s) => (isForm(s) ? normalForm(s) : s);
  if (c.kind === "another-way") {
    c.task = isForm(c.task) ? normalForm(c.task) : c.task;
    if (c.source === null || c.source === undefined) delete c.source;
    else c.source = normalSource(c.source);
  }
  if (c.kind === "pace") {
    c.tasks = Array.isArray(c.tasks) ? c.tasks.map((t) => (isForm(t) ? normalForm(t) : t)) : c.tasks;
    if (c.times === undefined) c.times = 1;
    if (!Array.isArray(c.sources) || !c.sources.some(Boolean)) delete c.sources;
    else c.sources = c.sources.map((s) => (s ? normalSource(s) : null));
  }
  checkCriticism(c);
  if (record.some((x) => x.id === c.id)) throw new Error(`criticism ${c.id}: the record has one with that id`);
  const sameSet = (a, b) => a.length === b.length && [...a].sort().join("\n") === [...b].sort().join("\n");
  const named = (x) => (x.tasks || []).map((t, k) => `${t} ${(x.sources && x.sources[k]) || ""}`);
  const same = (x) => x.kind === c.kind && (
    (c.kind === "another-way" && x.scene === c.scene && x.task === c.task && (x.source || null) === (c.source || null) && x.level === c.level && x.vetoes === c.vetoes)
    || (c.kind === "pace" && x.scene === c.scene && sameSet(named(x), named(c)))
    || (c.kind === "keep-apart" && sameSet(x.scenes, c.scenes) && sameSet(x.between, c.between))
    || (c.kind === "start-far" && x.scene === c.scene && x.who === c.who && x.from === c.from)
    || (c.kind === "choice" && choiceKey(x) === choiceKey(c)));
  const there = record.find(same);
  // a choice point criticized again, from the film as it is now (which heeds the item
  // there): the new item, from its value, in the old one's place, keeping its id
  if (there && c.kind === "choice") {
    if (there.direction === c.direction && there.was === c.was) return { record: [...record], item: there };
    const replaced = { ...c, id: item.id || there.id };
    return { record: record.map((x) => (x === there ? replaced : x)), item: replaced };
  }
  if (!there) return { record: checkRecord([...record, c]), item: c };
  if (c.kind !== "pace") return { record: [...record], item: there };
  const times = there.direction === c.direction ? there.times + c.times : there.times - c.times;
  if (times === 0) return { record: record.filter((x) => x !== there), item: null };
  const merged = times > 0 ? { ...there, times, said: c.said ?? there.said } : { ...there, direction: c.direction, times: -times, said: c.said ?? there.said };
  return { record: record.map((x) => (x === there ? merged : x)), item: merged };
}

// The record without the item of that id.
export function removeCriticism(record = [], id) {
  return checkRecord(record).filter((c) => c.id !== id);
}

// An item in plain words, with the record's names (the page words them its own way).
export function criticismWords(item) {
  const name = (x) => String(x).replace(/-/g, " ");
  if (item.kind === "another-way") return `${name(item.scene)}: not this way, another way than ${name(item.vetoes)}${item.level === "convey" ? " (what is shown)" : ""}`;
  if (item.kind === "pace") return `${name(item.scene)}: this part is ${item.direction === "too-quick" ? "too quick" : "too slow"}${item.times > 1 ? ` (said ${item.times} times)` : ""}`;
  if (item.kind === "keep-apart") return `keep ${name(item.between[0])} and ${name(item.between[1])} apart in ${item.scenes.map(name).join(" and ")}`;
  if (item.kind === "choice") return choiceWords(item);
  return `${name(item.scene)}: ${name(item.who)} starts far from ${name(item.from)}`;
}

// A glass box task's description, as a criticism names the task: "(personality
// cinderella)", from its (task: description d ...).
export function taskDescription(task) {
  const t = readForms(String(task.variables.task || ""))[0];
  const i = Array.isArray(t) ? t.indexOf("description") : -1;
  return i > 0 ? printForm(t[i + 1]) : null;
}

// Where a glass box task came from, as a criticism names it when its scene has more than
// one task of its description (REVIVE;CRITIC critic-source-of): the description of the
// establish task whose convey method it shows, "initial-description", or null.
export function taskSource(task, glass) {
  const t = readForms(String(task.variables.task || ""))[0];
  const i = Array.isArray(t) ? t.indexOf("source") : -1;
  const s = i > 0 ? t[i + 1] : null;
  if (s === null || s === undefined || s === "nil") return null;
  if (s === "initial-description" || Array.isArray(s)) return printForm(s);
  const from = (glass.tasks || []).find((x) => x.name === s);
  return from ? taskDescription(from) : null;
}

// The source a criticism of the task needs (taskSource), or null if its description
// names it alone in its scene.
export function sourceNeeded(task, glass) {
  const d = taskDescription(task);
  return (glass.tasks || []).filter((x) => taskDescription(x) === d).length > 1 ? taskSource(task, glass) : null;
}

// Whether a criticism item names the glass box task: by description and, where it
// gives one, source (the k-th of a pace item's tasks, or another-way's task).
function namesTask(item, task, glass) {
  const d = taskDescription(task);
  const ok = (want, source) => !source || source === taskSource(task, glass);
  if (item.kind === "another-way") return item.task === d && ok(item.task, item.source);
  if (item.kind === "pace") return item.tasks.some((t, k) => t === d && ok(t, item.sources && item.sources[k]));
  return false;
}

// The files a run wrote that a later job reads (the Lisp's own, the film description a
// run was given, and those a remake kept), as { "DIR;FN1 FN2": text }: KEN;CP 30, each
// scene's program (kept to tell whether a scene planned again comes out the same),
// KEN1;<fn1> MINI (a later scene's from-scene reads it), KEN1;<movie> POSIT (the next
// scene starts from it), and with CHANGE the BECOME files. Kept with a run (makeFilmSteps
// keepFiles), a film can be remade from any scene (remakeFilmSteps): Ken's Cinderella's
// come to about 116,000 characters. Not the printouts (KEN1;<fn1> PRINT, which no job
// reads, 160,000 more), nor KEN1;FILM CRITIC: the run keeps the record itself.
const KEPT_ORIGINS = new Set(["written", "changed", "kept"]);
export function filesOf(fs) {
  const out = {};
  for (const [dir, d] of fs.dirs) {
    for (const [fn1, versions] of d) {
      for (const [fn2, e] of versions) if (KEPT_ORIGINS.has(e.origin) && fn2 !== "PRINT") out[`${dir};${fn1} ${fn2}`] = fs.textOf(e);
    }
  }
  return out;
}

function mountFiles(fs, files) {
  for (const [key, text] of Object.entries(files)) {
    const m = /^([A-Z0-9]+);(\S+) (\S+)$/.exec(key);
    if (!m) throw new Error(`a kept file named ${key}, not DIR;FN1 FN2`);
    fs.addFile(m[1], m[2], m[3], { text, origin: "kept" });
  }
}

// A scene's own files, each { dir, fn1, fn2 }: its program, summary, printout and POSIT.
function sceneFiles(scene, plan) {
  const s = plan ? plan.scenes.find((x) => x.id === scene) : null;
  const [fn1, fn2, movie] = s ? [...s.file, s.movie] : KEN_SCENE_FILES[scene] || [];
  if (!fn1) throw new Error(`no files known for the scene ${scene}`);
  const up = (x) => String(x).toUpperCase().slice(0, 6);
  return {
    program: { dir: "KEN", fn1: up(fn1), fn2: up(fn2) }, mini: { dir: "KEN1", fn1: up(fn1), fn2: "MINI" },
    print: { dir: "KEN1", fn1: up(fn1), fn2: "PRINT" }, posit: { dir: "KEN1", fn1: up(movie), fn2: "POSIT" },
  };
}
const keyOf = (n) => `${n.dir};${n.fn1} ${n.fn2}`;

// Remake a film with criticism: what makeFilmSteps made (previous, with its files,
// makeFilmSteps keepFiles) made again from the first scene criticized on, heeding the
// record (criticism, the whole record: what was criticized before and still is, and
// anything new; none, to make it again without). A generator, as makeFilmSteps, with its
// callbacks and onKept(scene, how, error). Pass 1 is not run again unless a pass-1
// choice is criticized (stage C6), now or in the record the film was made with: the
// film's KEN;CP is mounted with its other files. With one, pass 1 is made again from
// the first scene, the choice points criticized chosen afresh and every other choice
// held as KEN;CP had it (REVIVE;HOLD hold-all-but-choice-points), then, to compare, made
// again with every choice afresh (save false): remade.pass1 is { held, differences,
// knockOns }, held the choices holding kept that would have come out otherwise
// ({ choicePoint, heldAt, wouldHaveChosen }), differences every choice the full recompute
// made otherwise than the film ({ choicePoint, before, after, criticized }), knockOns
// those not criticized; CHANGE's fresh looks are made again too; and every scene is
// planned again (from is ignored). Then
//   - each scene before from (by default the first scene criticized, by this record or
//     the one previous was made with, so that a criticism taken out is made again) is
//     kept as it was: its glass box, its film, its files (onKept(scene, "before"));
//   - each scene from it on is planned again (pass 2, heeding the record); if its program
//     comes out byte for byte as before, its film is kept too, since Director's film is a
//     function of the program alone (film()), and where the film left the characters
//     (onKept(scene, "unchanged")); otherwise it is filmed.
//   - A remake is all or nothing scene by scene: if Ani stops planning or filming a scene
//     (in Ken's chases-to, say, which can't yet place two characters whose destination is
//     placed already, disply.311:95-111), that scene's files are put back as they were,
//     and that scene and every scene after it are kept as the film remade from had them
//     (onKept(scene, "stopped", error), then onKept(scene, "after-stop") for each after
//     it), so that the film is whole; remade.stopped says where and why. Nothing is
//     thrown, keepGoing or not.
// CHANGE's fresh looks are pass 1's, which no criticism here reaches: each is kept as
// previous made it. extensions: the film's own (by default previous.extensions); a
// record that isn't empty adds CRITIC and what it requires to every job. Other
// extensions than the film's were made with are another Director: then every scene is
// planned and filmed again, none kept. fps and frames, the rate and the cap on frames a
// scene is filmed with, default to the film's (its films' rate; frames, 250 seconds at
// that rate, as the page films); a film kept as it was must have been made at that rate
// and run under that cap. A criticism of a scene the film doesn't have is refused. A film
// kept with no files (made before they were kept) is made again from the start
// (makeFilmSteps, with description if it was a new story's). Returns what makeFilmSteps
// returns, with criticism (the record, if not empty), files (unless keepFiles is false),
// and
//   remade  { from, fromScratch?, stopped?, scenes: [{ id, how }] }, how "kept" (before
//           from), "unchanged" (planned again, the same program, the film kept),
//           "refilmed", "stopped" (Ani stopped there: the film remade from's scene is
//           kept) or "after-stop" (after the scene where Ani stopped: kept likewise);
//           stopped { scene, error }, what Lisp said where Ani stopped. (A film made
//           from scratch may still have scenes that "failed", with keepGoing.)
export function* remakeFilmSteps(fs, { previous, criticism = [], from = null, extensions = null, description = null, progress = () => {}, keepGoing = false, frames = null, fps = null, onPass1 = () => {}, onScene = () => {}, onKept = () => {}, onChange = () => {}, onFrame = null, keepFiles = true, slice = null } = {}) {
  if (!previous || !Array.isArray(previous.scenes)) throw new Error("remakeFilmSteps needs the film to remake (previous), as makeFilmSteps returned it");
  const record = checkRecord(criticism || []);
  const base = extensions || previous.extensions || [];
  extensionsFor(base);
  // a film made with a learner's knowledge is remade with it, as it was (its pass 1 is
  // kept, so other knowledge would be another film: makeFilmSteps with knowledge)
  const knowledge = previous.knowledge && previous.knowledge.length ? previous.knowledge : null;
  const heed = { ...(record.length ? { criticism: record } : {}), ...(knowledge ? { knowledge } : {}) };
  const order = previous.scenes.map((s) => s.id);
  for (const c of record) for (const s of criticismScenes(c)) if (!order.includes(s)) throw new Error(`criticism ${c.id}: the film has no scene ${s}`);
  // a criticism of a pass-1 choice (stage C6): pass 1 made again, the choice points
  // criticized now or before (so that one taken out is chosen again without it) chosen
  // afresh, everyone else held as the film had them; and every scene planned again
  const hasChoicePoint = (c) => (previous.choicePoints || []).some((p) => JSON.stringify(p.name) === JSON.stringify(choicePointOf(c)));
  for (const c of record) if (c.kind === "choice" && !hasChoicePoint(c)) throw new Error(`criticism ${c.id}: the film has no choice point ${choicePointLisp(c)}`);
  const freed = [...new Map([...record, ...(previous.criticism || [])].filter((c) => c.kind === "choice").map((c) => [choiceKey(c), c])).values()];
  // the film's rate and cap, unless asked otherwise
  const madeAt = (previous.scenes.find((s) => s.film) || { film: {} }).film.fps || 4;
  fps = fps || madeAt;
  frames = frames || 250 * fps;
  // made with the same Director (extensions), else nothing is kept
  const sameSet = (a, b) => [...new Set(a)].sort().join() === [...new Set(b)].sort().join();
  const sameDirector = sameSet(extensionsFor(base).map((e) => e.id), extensionsFor(previous.extensions || []).map((e) => e.id));
  const criticized = [...record, ...(previous.criticism || [])].flatMap(criticismScenes).map((s) => order.indexOf(s)).filter((k) => k >= 0);
  const startAt = !sameDirector || freed.length ? 0 : from !== null ? order.indexOf(from) : Math.min(order.length, ...criticized);
  if (startAt < 0) throw new Error(`the film has no scene ${from}`);
  if (!previous.files) {
    progress("remake", "This film was saved before Ani kept its working files, so it is made again from the start");
    yield;
    const out = yield* makeFilmSteps(fs, { progress, keepGoing, frames, fps, extensions: base, description, onPass1, onScene, onChange, onFrame, criticism: record, knowledge, keepFiles, slice });
    out.remade = { from: order[0] || null, fromScratch: true, scenes: out.scenes.map((s) => ({ id: s.id, how: s.error ? "failed" : "refilmed" })) };
    return out;
  }
  mountFiles(fs, previous.files);
  // the film description it was made from: a new story's (the changed KEN;CINDY it
  // kept, renamed as makeFilmSteps renamed it), else the one on fs, as makeFilmSteps
  const change = extensionsFor(base).some((e) => e.sceneSteps);
  const cindyKey = Object.keys(previous.files).find((k) => /^KEN;CINDY \d+$/.test(k));
  let plan = null;
  if (cindyKey) plan = storyPlan(storyOutline(previous.files[cindyKey]), { looks: choosesLooks(base), ...(change ? { change } : {}) });
  else if (change) {
    const cindy = fs.find({ dir: "KEN", fn1: "CINDY", fn2: ">" });
    const outline = cindy ? storyOutline(fs.textOf(cindy)) : null;
    if (outline && Object.keys(outline.changes).length) plan = storyPlan(outline, { looks: choosesLooks(base), change });
  }
  const out = { choices: previous.choices, choicePoints: previous.choicePoints, scenes: [] };
  if (previous.renames) out.renames = previous.renames;
  if (base.length) out.extensions = extensionsFor(base).map((e) => e.id);
  if (previous.repairs) out.repairs = previous.repairs;
  if (previous.appearances) out.appearances = previous.appearances;
  let again = null; // pass 1 made again: { held, differences, knockOns }
  if (freed.length) {
    const who = freed.map((c) => `${c.character.replace(/-/g, " ")}'s ${c.element.replace(/-/g, " ")}`).join(" and ");
    progress("pass1", `Pass 1 again: ${who} chosen afresh with your criticism, everyone else held as they were`);
    yield;
    const p1 = yield* pass1Steps(fs, { extensions: base, slice, ...heed, hold: freed.map(choicePointLisp) });
    progress("recompute", "Pass 1 again, to compare: every choice made afresh with your criticism");
    yield;
    const full = yield* pass1Steps(fs, { extensions: base, slice, ...heed, save: false });
    // the full recompute against the film's choices: what holding the others held back
    const was = new Map((previous.choicePoints || []).map((p) => [JSON.stringify(p.name), p.currentChoice]));
    const differences = full.choicePoints.filter((p) => was.has(JSON.stringify(p.name)) && JSON.stringify(was.get(JSON.stringify(p.name))) !== JSON.stringify(p.currentChoice))
      .map((p) => ({ choicePoint: p.name, before: was.get(JSON.stringify(p.name)), after: p.currentChoice, criticized: freed.some((c) => JSON.stringify(choicePointOf(c)) === JSON.stringify(p.name)) }));
    again = { held: p1.held || [], differences, knockOns: differences.filter((d) => !d.criticized) };
    out.choices = p1.choices;
    out.choicePoints = p1.choicePoints;
    if (p1.repairs) out.repairs = p1.repairs; else delete out.repairs;
    if (p1.appearances) out.appearances = p1.appearances; else delete out.appearances;
  }
  onPass1({ choices: out.choices, choicePoints: out.choicePoints, ...(out.repairs ? { repairs: out.repairs } : {}), ...(out.appearances ? { appearances: out.appearances } : {}) });
  const how = [];
  const became = [];
  let stopped = null;
  for (const [k, prev] of previous.scenes.entries()) {
    const scene = prev.id;
    const planned = change && plan ? plan.scenes.find((s) => s.id === scene) : null;
    const earlier = [...became];
    if (planned && planned.changes && again) {
      // pass 1 made again: the fresh look at whoever the scene changes made again too,
      // from the new KEN;CP, heeding the criticism, as makeFilmSteps makes it
      const changing = [...new Set(planned.changes.flatMap((c) => c.characters))];
      try {
        progress("fresh-look", `Pass 1 again: a fresh look at ${changing.map((c) => c.replace(/-/g, " ")).join(" and ")}, who change${changing.length > 1 ? "" : "s"} in ${scene.replace(/-/g, " ")}`, scene);
        yield;
        const look = freshLook(fs, scene, { plan, extensions: base, becomes: earlier, ...heed });
        progress("recompute", `Pass 1 again, to compare: everyone chosen afresh as of ${scene.replace(/-/g, " ")}`, scene);
        yield;
        const recompute = recomputeEveryone(fs, scene, { plan, extensions: base, becomes: earlier, ...heed });
        const record1 = changeRecord(look, recompute, planned);
        (out.changes ||= {})[scene] = record1;
        became.push(planned.become);
        onChange(scene, record1);
      } catch (e) {
        if (!keepGoing) throw e;
        const record1 = { scene, error: String((e && e.message) || e) };
        (out.changes ||= {})[scene] = record1;
        onChange(scene, record1);
      }
    } else if (planned && planned.changes) {
      // the fresh look as previous made it (pass 1's, which no criticism here reaches)
      const record1 = previous.changes && previous.changes[scene];
      if (record1) (out.changes ||= {})[scene] = record1;
      if (record1 && !record1.error && fs.find({ dir: "KEN1", fn1: planned.become.toUpperCase(), fn2: "BECOME" })) became.push(planned.become);
      if (record1 && k >= startAt && !stopped) onChange(scene, record1);
    }
    if (k < startAt || stopped) {
      // before the first scene criticized; or after the one where Ani stopped, kept as
      // the film remade from had it, its files as they were (they were never taken out)
      out.scenes.push(prev);
      how.push({ id: scene, how: stopped ? "after-stop" : "kept" });
      onKept(scene, stopped ? "after-stop" : "before");
      onScene(prev);
      continue;
    }
    const files = sceneFiles(scene, plan);
    const old = Object.fromEntries(Object.entries(files).map(([w, n]) => [w, previous.files[keyOf(n)] ?? null]));
    // planned afresh: RUN appends to a summary that is there (run.65:89-93)
    for (const n of Object.values(files)) fs.delete(n);
    let done;
    try {
      progress("pass2", `Pass 2: planning ${scene.replace(/-/g, " ")} again`, scene);
      yield;
      const { glass } = pass2(fs, scene, { plan, extensions: base, ...(planned ? { becomes: earlier } : {}), ...heed });
      const program = fs.find(files.program);
      const sameRun = sameDirector && prev.film && (prev.film.fps || 4) === fps && prev.film.frames.length < frames;
      if (sameRun && !prev.error && old.program !== null && old.posit !== null && program && fs.textOf(program) === old.program) {
        // the same program films the same: the film is kept, and where it left them
        fs.addFile(files.posit.dir, files.posit.fn1, files.posit.fn2, { text: old.posit, origin: "kept" });
        done = { id: scene, film: prev.film, glass };
        how.push({ id: scene, how: "unchanged" });
        onKept(scene, "unchanged");
      } else {
        progress("film", `Filming ${scene.replace(/-/g, " ")}`, scene);
        yield;
        const { film: f } = yield* filmSteps(fs, scene, { plan, frames, fps, extensions: base, slice, ...(onFrame ? { onClick: (i) => onFrame(scene, i) } : {}), ...heed });
        done = { id: scene, film: f, glass };
        how.push({ id: scene, how: "refilmed" });
      }
    } catch (e) {
      // Ani stopped: the scene's files put back as they were, and the film remade from
      // kept for it and every scene after it
      for (const n of Object.values(files)) fs.delete(n);
      for (const [w, n] of Object.entries(files)) if (old[w] !== null) fs.addFile(n.dir, n.fn1, n.fn2, { text: old[w], origin: "kept" });
      stopped = { scene, error: String((e && e.message) || e) };
      done = prev;
      how.push({ id: scene, how: "stopped" });
      onKept(scene, "stopped", stopped.error);
    }
    out.scenes.push(done);
    onScene(done);
  }
  if (heed.criticism) out.criticism = record;
  if (knowledge) out.knowledge = knowledge;
  out.remade = { from: order[startAt] || null, ...(again ? { pass1: again } : {}), ...(stopped ? { stopped } : {}), scenes: how };
  if (keepFiles) out.files = filesOf(fs);
  return out;
}

// The same, run to the end.
export function remakeFilm(fs, options = {}) {
  const steps = remakeFilmSteps(fs, options);
  for (;;) {
    const r = steps.next();
    if (r.done) return r.value;
  }
}

// What a remake changed, for the page's "What your criticism changed" (design section 7):
//   scenes     [{ id, how, frames: { before, after }, runningTime: { before, after },
//              tasks }]: how as remade.scenes has it; tasks, those whose choice, status
//              or running time differ, matched by description (and, for a description
//              met twice, in order), each { description, before, after }, each side
//              { choice, status, runningTime } or null (the task not there)
//   stopped    { scene, error }, if Ani stopped in a scene (remade.stopped): that scene
//              and those after it are the film remade from's
//   criticism  [{ id, item, words, outcome, notes, cantDo, ... }], each judged by what
//              the film shows as well as by the notes CRITIC left:
//     notes    the heeded-criticism: and unmet-criticism: notes of that id (glassBox's
//              criticism, with the scene)
//     cantDo   the tasks of its scenes Ani could not do once it heeded it and could
//              before, or that weren't there before (task description and scene)
//     outcome  "stopped" (Ani stopped in one of its scenes, or before them, so they
//              couldn't be made with it: stopped, as above), "not-reached" (nothing it
//              names was planned: the task isn't in the scene, the way vetoed wasn't
//              among those Ani weighed, she never comes on), "not-met", "partly" or
//              "met", by its kind:
//       another-way  met when the way was set aside (a note) and the task was done
//              another way; not-met when it was left with no other way (the task
//              can't-do now, where it could before: "no other way"); partly if a note
//              says it couldn't be heeded somewhere
//       pace   from the part's times, before and after (pace: { before, after }, each
//              { planned, film }: the part's running time as planned, the longest of its
//              tasks', and as Director ran it, the seconds between its subscene's
//              beginning and end in the film, null if not filmed): not-met when it
//              moved the wrong way or not at all (by the film when both films have it,
//              else by the plan); partly when it moved but a bound held it (a held-to
//              note) or a note says it couldn't be heeded; else met
//       keep-apart  contacts, any walk of the plans of its scenes that still brings the
//              two together (contactsIn), which should be none; closest, for each of its
//              scenes with a film, how close the two came on the picture (closestApproach:
//              { scene, distance, frame }, distance null if never on it together), which
//              Ken's post-condition wants no less than his small distance, .33 of the
//              screen (place.45:103-105). Partly when a walk or the film still brings
//              them that close, or a note says it couldn't be heeded: the plan can hold
//              them apart and the film still bring them close, where they start close
//              (the Meeting) or a walk that isn't to contact goes towards the other (the
//              guard's prisoner escaping towards the one she is kept from,
//              disply.311:465-473; the revival's table counts walks to contact and walks
//              together, its choice 8); else met, with notes or without (nothing needed
//              setting aside)
//       choice  choice: { choicePoint, before, after, recomputed, knockOns, held,
//              resolvedForIt, rejected }, from pass 1 as the film had it and as made
//              again: the value before and after, the full recompute's value for it,
//              its knock-ons and the choices held (remade.pass1's: a comparison only),
//              how many of Ken's conflicts were resolved for it (criticized-by-you), and
//              the reason its suggestion was rejected for, if it was
//              (self-conflicting-suggestion: (less-than low)); notes, its choice point's
//              (scene null). met when its choice point noted it heeded (the value moved
//              as asked), not-met otherwise, not-reached when the film has no such
//              choice point
//       start-far  start: { walkedOn, frame }, from the scene's film: whether she was
//              first seen off the picture and walked on, and the frame. not-reached when
//              she is never on the stage; met when she was placed far (a heeded note, or
//              a note that Ken's own placing already put her far) and walked on; partly
//              when placed far but on the picture at once; not-met otherwise (a note that
//              she was already in the scene, or no note: PLACE never placed her with the
//              one she was to start far from)
export function criticismChanges(previous, remade) {
  const num = (x) => (x === undefined || x === null || x === "nil" ? null : Number(x));
  const taskState = (t) => ({ choice: t.variables["current-choice"] || "nil", status: t.variables.status || null, runningTime: num(t.variables["running-time"]) });
  const byId = (run) => new Map((run.scenes || []).map((s) => [s.id, s]));
  const before = byId(previous);
  const how = new Map(((remade.remade && remade.remade.scenes) || []).map((s) => [s.id, s.how]));
  const stopped = (remade.remade && remade.remade.stopped) || null;
  const order = (remade.scenes || []).map((s) => s.id);
  const scenes = (remade.scenes || []).map((s) => {
    const b = before.get(s.id) || {};
    const tasksOf = (glass) => {
      const m = new Map();
      for (const t of (glass && glass.tasks) || []) {
        const d = taskDescription(t);
        if (!m.has(d)) m.set(d, []);
        m.get(d).push(taskState(t));
      }
      return m;
    };
    const tb = tasksOf(b.glass), ta = tasksOf(s.glass);
    const tasks = [];
    for (const d of new Set([...tb.keys(), ...ta.keys()])) {
      const xs = tb.get(d) || [], ys = ta.get(d) || [];
      for (let i = 0; i < Math.max(xs.length, ys.length); i++) {
        const x = xs[i] || null, y = ys[i] || null;
        if (JSON.stringify(x) !== JSON.stringify(y)) tasks.push({ description: d, before: x, after: y });
      }
    }
    return {
      id: s.id, how: how.get(s.id) || null,
      frames: { before: b.film ? b.film.frames.length : null, after: s.film ? s.film.frames.length : null },
      runningTime: { before: b.glass ? num(b.glass.scene.variables["running-time"]) : null, after: s.glass ? num(s.glass.scene.variables["running-time"]) : null },
      tasks,
    };
  });
  // a part's times: the longest of the named tasks' running times, and the seconds its
  // subscene ran in the film, from Director's (beginning-of ...) and (end-of ...)
  const partTimes = (s, item) => {
    if (!s || !s.glass) return null;
    const tasks = s.glass.tasks.filter((t) => namesTask(item, t, s.glass));
    if (!tasks.length) return null;
    const planned = Math.max(...tasks.map((t) => num(t.variables["running-time"]) || 0));
    let film = null;
    if (s.film && s.film.events) {
      const fps = s.film.fps || 4;
      for (const sub of new Set(tasks.map((t) => t.variables.subscene).filter(Boolean))) {
        let begin = null, end = null;
        for (const [frame, ev] of s.film.events) {
          if (begin === null && ev === `(beginning-of ${sub})`) begin = frame;
          else if (begin !== null && end === null && ev === `(end-of ${sub})`) end = frame;
        }
        if (begin !== null) film = Math.max(film || 0, Math.round((((end === null ? s.film.frames.length - 1 : end) - begin) / fps) * 1000) / 1000);
      }
    }
    return { planned, film };
  };
  const criticism = (remade.criticism || []).map((item) => {
    const notes = [];
    const cantDo = [];
    let contacts = [];
    const closest = [];
    let pace = null, start = null, named = false;
    for (const s of remade.scenes || []) {
      if (!s.glass) continue;
      for (const n of s.glass.criticism || []) if (n.id === item.id) notes.push({ scene: s.id, ...n });
      if (!criticismScenes(item).includes(s.id)) continue;
      // those Ani could do before (or that weren't there)
      const b = before.get(s.id);
      const was = new Set(((b && b.glass && b.glass.tasks) || []).filter((t) => t.variables.status === "cant-do").map(taskDescription));
      for (const t of s.glass.tasks) if (t.variables.status === "cant-do" && !was.has(taskDescription(t))) cantDo.push({ scene: s.id, task: taskDescription(t) });
      if (item.kind === "another-way" || item.kind === "pace") named = named || s.glass.tasks.some((t) => namesTask(item, t, s.glass));
      if (item.kind === "pace") pace = { before: partTimes(b, item), after: partTimes(s, item) };
      if (item.kind === "keep-apart") {
        contacts = contacts.concat(contactsIn(s.glass).filter((c) => item.between.includes(c.a) && item.between.includes(c.b)).map((c) => ({ scene: s.id, ...c })));
        if (s.film) closest.push({ scene: s.id, ...(closestApproach(s.film, item.between[0], item.between[1]) || { distance: null, frame: null }) });
      }
      if (item.kind === "start-far" && s.film) {
        const k = s.film.frames.findIndex((fr) => fr.chars[item.who] && fr.chars[item.who].visible);
        start = k < 0 ? { walkedOn: null, frame: null } : { walkedOn: !s.film.frames[k].segs[item.who] && s.film.frames.slice(k).some((fr) => fr.segs[item.who]), frame: k };
      }
    }
    // a pass-1 choice: the notes its choice point memorized (REVIVE;CRITIC's
    // record-choice), the value before and after, and what holding the others held back
    let choice = null;
    if (item.kind === "choice") {
      const name = choicePointOf(item);
      const key = JSON.stringify(name);
      const find = (run) => (run.choicePoints || []).find((p) => JSON.stringify(p.name) === key) || null;
      const b = find(previous), a = find(remade);
      for (const m of (a && a.memory) || []) {
        if (!Array.isArray(m) || (m[0] !== "heeded-criticism:" && m[0] !== "unmet-criticism:")) continue;
        const get = (k) => { const i = m.indexOf(k); return i > 0 ? printForm(m[i + 1]) : null; };
        if (get("id") !== item.id) continue;
        const heededHere = m[0] === "heeded-criticism:";
        notes.push({ scene: null, actor: printForm(name), id: item.id, heeded: heededHere, what: get("what"), was: get("was"), ...(heededHere ? { now: get("now") } : {}), because: get("because"), note: printForm(m) });
      }
      const p1 = (remade.remade && remade.remade.pass1) || null;
      const full = p1 ? p1.differences.find((d) => JSON.stringify(d.choicePoint) === key) : null;
      choice = {
        choicePoint: printForm(name), before: b ? b.currentChoice : null, after: a ? a.currentChoice : null,
        // the full recompute's value for it, and what it would have changed of the others'
        // (a comparison only: the remake held them), and the others held at their values
        recomputed: full ? full.after : b ? b.currentChoice : null,
        knockOns: p1 ? p1.knockOns : [], held: p1 ? p1.held : [],
        // Ken's conflicts resolved for it (his stub), and the reason it was rejected for
        resolvedForIt: ((a && a.conflictsResolved) || []).filter((c) => Array.isArray(c) && c[c.indexOf("how-resolved") + 1] === "criticized-by-you").length,
        rejected: (((a && a.rejectedSuggestions) || []).find((r) => Array.isArray(r) && JSON.stringify(r).includes(`["criticism-by-you","${item.id}"]`)) || [])[2] || null,
      };
      named = Boolean(a);
    }
    const heeded = notes.filter((n) => n.heeded), unmet = notes.filter((n) => !n.heeded);
    const why = (n) => String(n.because || "");
    let outcome;
    if (stopped && criticismScenes(item).some((id) => order.indexOf(id) >= order.indexOf(stopped.scene))) outcome = "stopped";
    else if (item.kind === "choice") outcome = !named ? "not-reached" : heeded.length ? "met" : "not-met";
    else if (item.kind === "another-way") {
      const left = (remade.scenes || []).filter((s) => s.id === item.scene && s.glass).flatMap((s) => s.glass.tasks.filter((t) => namesTask(item, t, s.glass)));
      outcome = !named || !heeded.length ? "not-reached" : left.some((t) => t.variables.status === "cant-do") && cantDo.some((x) => x.task === item.task) ? "not-met" : unmet.length ? "partly" : "met";
    } else if (item.kind === "pace") {
      const quicker = item.direction === "too-quick";
      const by = pace && pace.before && pace.after && pace.before.film !== null && pace.after.film !== null ? "film" : "planned";
      const moved = pace && pace.before && pace.after ? pace.after[by] - pace.before[by] : 0;
      const sc = (remade.scenes || []).find((s) => s.id === item.scene);
      const tol = by === "film" ? 0.5 / ((sc && sc.film && sc.film.fps) || 4) : 0.005;
      const right = quicker ? moved > tol : moved < -tol;
      outcome = !named ? "not-reached" : !right ? "not-met" : unmet.length || heeded.some((n) => /held-to/.test(why(n))) ? "partly" : "met";
    } else if (item.kind === "keep-apart") {
      const near = closest.some((c) => c.distance !== null && c.distance < SMALL_DISTANCE);
      outcome = contacts.length || near || unmet.length ? "partly" : "met";
    } else {
      const far = heeded.length || unmet.some((n) => /already-far/.test(why(n)));
      outcome = !start || start.frame === null ? "not-reached" : far && start.walkedOn ? "met" : far ? "partly" : "not-met";
    }
    return {
      id: item.id, item, words: criticismWords(item), outcome, notes, cantDo,
      ...(item.kind === "keep-apart" ? { contacts, closest } : {}), ...(item.kind === "pace" ? { pace } : {}), ...(item.kind === "start-far" ? { start } : {}), ...(item.kind === "choice" ? { choice } : {}),
      ...(outcome === "stopped" ? { stopped } : {}),
    };
  });
  return { scenes, ...(stopped ? { stopped } : {}), criticism };
}

// The walks of a scene's plan that bring two characters together, from each subscene's
// (actions-of c) in its glass box (PLACE's move-character and move-characters,
// place.45:151-216): a walk of a to (contact-with b by a), or of a with b. Each
// { subscene, a, b, how: "contact" | "together", plan }.
export function contactsIn(glass) {
  const out = [];
  for (const s of glass.subscenes || []) {
    for (const [k, v] of Object.entries(s.variables)) {
      if (!k.startsWith("(actions-of ")) continue;
      const actions = readForms(v)[0];
      for (const a of Array.isArray(actions) ? actions : []) {
        if (!Array.isArray(a) || a[0] !== "walk" || a[1] !== "of") continue;
        const plan = a.indexOf("called") > 0 ? printForm(a[a.indexOf("called") + 1]) : null;
        if (a[3] === "with") out.push({ subscene: s.name, a: a[2], b: a[4], how: "together", plan });
        else if (a[3] === "to" && Array.isArray(a[4]) && a[4][0] === "contact-with") out.push({ subscene: s.name, a: a[2], b: a[4][1], how: "contact", plan });
      }
    }
  }
  return out;
}

// How close two characters came in a film while both were on the picture (shown, with
// lines on it): { distance, frame } in fractions of the screen as PLACE measures
// distances (xy-positions, the turtle's coordinates over its size, dichar.103:17-19,
// 69-75; Ken's small distance is under .33, place.45:103-105), or null if they were never
// on the picture together. The turtle's size is taken from the picture, 1000 high.
export const SMALL_DISTANCE = 0.33; // Ken's small-distance?, place.45:103-105
export function closestApproach(f, a, b) {
  const size = [(1000 * f.picture.width) / f.picture.height, 1000];
  let best = null;
  f.frames.forEach((fr, i) => {
    const x = fr.chars[a], y = fr.chars[b];
    if (!x || !y || !x.visible || !y.visible || !x.state || !y.state || !fr.segs[a] || !fr.segs[b]) return;
    const d = Math.hypot((x.state[0] - y.state[0]) / size[0], (x.state[1] - y.state[1]) / size[1]);
    if (!best || d < best.distance) best = { distance: Math.round(d * 1000) / 1000, frame: i };
  });
  return best;
}

// ---------------------------------------------------------------- your knowledge (TEACH)

// A learner's knowledge (reports/chapter-x/design-teaching.md; reports/ext/teach/README.md):
// notebooks of pieces (src/teach.js), loaded by REVIVE;TEACH into every job of a film made
// with them (boot's knowledge, makeFilmSteps's knowledge). Here: Ani's own check of a
// notebook (the trial job), a rehearsal of a piece on a little story, what the knowledge
// did in a film, and what it changed against the film made without it.

// The Ken files a notebook's pieces extend, and PREREQ, which the trial job has Ani read.
const TEACH_FILES = ["dscrp", "relate", "convey", "emote", "sugcon", "prereq"];
// The kind of word an actor is, by its parent.
const KIND_OF_PARENT = {
  "personality-character-descriptor": "personality", "physical-character-descriptor": "physical", "movement-character-descriptor": "movement",
  "odds+ends-character-descriptor": "role", "affection-relationship-descriptor": "relationship", "domination-relationship-descriptor": "relationship",
  "relationship-descriptor": "relationship",
};

// The questions REVIVE;TEACH's check-your-knowledge is asked for notebooks: one for each
// word, relationship, verb and feeling a piece teaches, adds to or links to.
function knowledgeQuestions(notebooks) {
  const q = new Map();
  const ask = (what, name) => { if (typeof name === "string" && /^[a-z][a-z0-9+-]*$/.test(name) && !q.has(name)) q.set(name, what); };
  for (const nb of notebooks) {
    for (const p of (nb && nb.pieces) || []) {
      if (!p) continue;
      if (p.kind === "word" || p.kind === "suggests" || p.kind === "looks" || p.kind === "shows") ask("word", p.word);
      if (p.kind === "relationship" || p.kind === "relationship-shows" || p.kind === "relationship-suggests") ask("relationship", p.word);
      if (p.kind === "word" || p.kind === "relationship") { ask(p.kind, p.like); ask(p.kind, p.opposite); }
      if (p.kind === "feeling") ask("feeling", p.word);
      if (p.kind === "verb") { ask("verb", p.word); ask("verb", p.kindOf); }
      if (p.kind === "way" || p.kind === "shows" || p.kind === "relationship-shows") ask("verb", p.verb);
    }
  }
  return q;
}

// check-your-knowledge's answers, by name: { what, exists, parent, type, neighbors,
// opposites, suggestions, shows, relative }, each list's items printed as Lisp.
function askKnowledge(L, questions) {
  const out = {};
  if (!questions.size) return out;
  const lisp = (x) => L.print(x).toLowerCase();
  const answers = L.evalString(`(check-your-knowledge '(${[...questions].map(([name, what]) => `(${what} ${name})`).join(" ")}))`);
  for (const a of L.toArray(answers)) {
    const [what, name, ...rest] = L.toArray(a);
    const entry = { what: lisp(what) };
    for (let k = 0; k + 1 < rest.length; k += 2) {
      const key = lisp(rest[k]), v = rest[k + 1];
      entry[key] = key === "exists" ? v !== L.NIL : v === L.NIL ? (["parent", "type"].includes(key) ? null : []) : key === "parent" || key === "type" ? lisp(v) : L.toArray(v).map(lisp);
    }
    out[lisp(name)] = entry;
  }
  return out;
}

// Ani's own check of notebooks, the trial job (design section 5): a Lisp booted with the
// film's extensions and TEACH (and, for the vocabulary the checks need, one without the
// notebooks) reads DSCRP, RELATE, CONVEY, EMOTE, SUGCON and PREREQ, and is asked
// (check-your-knowledge) what it now knows of every word the notebooks teach, add to or
// link to. Besides src/teach.js checkNotebook's checks (with Ani's vocabulary and names),
// it refuses a name Lisp defines a function by, a Lisp break while the notebooks load
// (lisp-break, with what Lisp said), a piece Ani doesn't hear once loaded (not-heard), a
// word of Ani's that has lost a suggestion (lost-suggestions: a define of an existing
// word, which the generator never writes, would do it), and links that leave a word both
// close to and the opposite of another (contradiction). extensions: the film's;
// characters: the story's characters (Ken's four are always refused as words). Returns
//   { ok, seconds, notebooks: [{ title, ok, refused, warnings, pieces: { [id]: { heard,
//     spread?: { neighbors, opposites }, says? } } }], words: { [name]: what Ani knows of
//     it once the notebooks are loaded (askKnowledge's) }, stopped?: { notebook, error } }
// spread: what Ken's spreading of links added for a word or relationship piece, beyond the
// link it wrote, with says, the page's sentence ("Because Ken's Ani spreads links, grumpy is
// now also close to cruel.").
export function checkKnowledge(fs, notebooks, { extensions = [], characters = [] } = {}) {
  const t0 = Date.now();
  const loaded = extensionsFor(withTeach(extensions)).map((e) => e.id);
  const questions = knowledgeQuestions(notebooks);
  // Ani without the notebooks: the vocabulary, and what Ani's own words suggest
  const B = boot(fs, { extensions: withTeach(extensions) });
  for (const f of TEACH_FILES) B.evalString(`(load '|ken;${f} >|)`);
  const before = askKnowledge(B, questions);
  const vocabulary = {};
  for (const [name, a] of Object.entries(before)) {
    if (a.exists && KIND_OF_PARENT[a.parent]) vocabulary[name] = { kind: KIND_OF_PARENT[a.parent], neighbors: a.neighbors || [], opposites: a.opposites || [] };
  }
  const lispFunction = (name) => B.evalString(`(getl '${name} '(expr fexpr subr lsubr macro array))`) !== B.NIL;
  const taken = aniNames(fs, { extensions });
  const results = notebooks.map((nb, k) => {
    const r = checkNotebook(nb, { extensions: loaded, vocabulary, taken, others: notebooks.slice(0, k), characters });
    for (const p of (nb && nb.pieces) || []) {
      const name = p && ["word", "relationship", "feeling", "verb"].includes(p.kind) ? p.word : null;
      if (name && /^[a-z][a-z-]*$/.test(name) && !r.refused.some((x) => x.piece === p.id && x.code === "lisp-name") && lispFunction(name)) r.refused.push({ piece: p.id, code: "lisp-name", says: `"${name}" is the name of a function Lisp or Ani has, so Ani can't take it as a word.` });
    }
    return { title: (nb && nb.title) || `notebook ${k + 1}`, ...r, pieces: {} };
  });
  // the trial job: Ani with the notebooks
  let after = null, stopped = null;
  try {
    const T = boot(fs, { extensions, knowledge: notebooks });
    for (const f of TEACH_FILES) T.evalString(`(load '|ken;${f} >|)`);
    after = askKnowledge(T, questions);
  } catch (e) {
    // which notebook: the first whose loading, with those before it, stops Ani
    let at = notebooks.length - 1;
    for (let k = 0; k < notebooks.length; k++) {
      try {
        const T = boot(fs, { extensions, knowledge: notebooks.slice(0, k + 1) });
        for (const f of TEACH_FILES) T.evalString(`(load '|ken;${f} >|)`);
      } catch { at = k; break; }
    }
    stopped = { notebook: at, error: String((e && e.message) || e) };
    results[at].refused.push({ piece: null, code: "lisp-break", says: `Ani stopped while reading this notebook. What Lisp said: ${stopped.error}` });
  }
  if (after) {
    const has = (list, ...parts) => (list || []).some((x) => parts.every((p) => x.includes(p)));
    notebooks.forEach((nb, k) => {
      const r = results[k];
      for (const p of (nb && nb.pieces) || []) {
        if (!p || !p.id) continue;
        const a = after[p.word] || {};
        let heard = true;
        const out = {};
        switch (p.kind) {
          case "word":
          case "relationship": {
            heard = Boolean(a.exists) && a.type === p.type;
            const near = (a.neighbors || []).filter((x) => x !== p.like), far = (a.opposites || []).filter((x) => x !== p.opposite);
            if (p.like) heard = heard && (a.neighbors || []).includes(p.like);
            if (p.opposite) heard = heard && (a.opposites || []).includes(p.opposite);
            if (near.length || far.length) {
              out.spread = { neighbors: near, opposites: far };
              out.says = `Because Ken's Ani spreads links (char.2:111-131), "${p.word}" is now also ${[near.length ? `close to ${near.join(", ")}` : "", far.length ? `the opposite of ${far.join(", ")}` : ""].filter(Boolean).join(", and ")}.`;
            }
            break;
          }
          case "suggests":
          case "looks":
            heard = has(a.suggestions, `element ${p.element} value ${p.value} strength ${p.strength} source ${p.word}`);
            break;
          case "shows":
            heard = has(a.shows, `(${({ enemy: "enemy-of", friend: "friend-of", stranger: "stranger-of" })[p.who]} your-a nil)`, `(${p.verb} your-a `, `strength ${p.strength} source ${p.word}`);
            break;
          case "relationship-shows":
            heard = has(a.shows, `value (${p.verb} your-a your-b)`, `strength ${p.strength} source ${p.word}`);
            break;
          case "relationship-suggests":
            heard = has(a.relative, `element (relative-${p.element} your-a your-b) value ${p.comparison} strength ${p.strength} source ${p.word}`);
            break;
          case "way":
            heard = has((after[p.verb] || {}).shows, `(${p.way} `, `strength ${p.strength} source (yours ${p.verb})`);
            break;
          case "feeling":
            heard = Boolean(a.exists) && (a.shows || []).length >= (p.changes || []).length;
            break;
          case "verb":
            heard = Boolean(a.exists) && a.parent === p.kindOf && ((p.showAs || "parent") !== "parent" || (a.shows || []).length > 0);
            break;
        }
        out.heard = heard;
        r.pieces[p.id] = out;
        if (!heard && !stopped && !r.refused.some((x) => x.piece === p.id)) r.refused.push({ piece: p.id, code: "not-heard", says: "Ani read this piece but doesn't hear it, so it would do nothing." });
      }
      // Ani's words keep everything they suggested: only adding
      for (const [name, b] of Object.entries(before)) {
        if (!b.exists || !(nb.pieces || []).some((p) => p && (p.word === name || p.verb === name))) continue;
        const lost = ["suggestions", "shows", "relative"].flatMap((key) => (b[key] || []).filter((x) => !((after[name] || {})[key] || []).includes(x)));
        if (lost.length) r.refused.push({ piece: null, code: "lost-suggestions", says: `After this notebook, Ani's "${name}" no longer has ${lost.length} of its own suggestions (the first: ${lost[0]}): knowledge is only added, never taken away.` });
      }
      // links, as Ani spread them
      for (const p of (nb && nb.pieces) || []) {
        if (!p || (p.kind !== "word" && p.kind !== "relationship")) continue;
        const a = after[p.word] || {};
        const both = (a.neighbors || []).filter((x) => (a.opposites || []).includes(x));
        if (both.length && !r.refused.some((x) => x.code === "contradiction")) r.refused.push({ piece: p.id, code: "contradiction", says: `Because Ani spreads links (char.2:111-131), "${p.word}" is both close to and the opposite of ${both.join(", ")}.` });
      }
    });
  }
  for (const r of results) r.ok = r.refused.length === 0;
  return { ok: results.every((r) => r.ok), seconds: (Date.now() - t0) / 1000, notebooks: results, words: after || {}, ...(stopped ? { stopped } : {}) };
}

// A rehearsal of a piece (design section 5, "Try it on a little story"): src/teach.js
// rehearsalStory's two-character, one-scene story, through pass 1 and the scene's pass 2
// (not filmed), with the notebooks (the piece's among them) and the film's extensions,
// on fs (which gets the story as the next KEN;CINDY, as makeFilmSteps does; give it a file
// system of its own). Returns { piece, story, outcome, seconds, choicePoints, glass }, the
// outcome yourKnowledgeDid's for that piece ("Ani heard it": a state other than
// never-reached; "used": won or combined), or { piece, story, error } if Ani stopped.
export function rehearse(fs, piece, notebooks, { extensions = [] } = {}) {
  const t0 = Date.now();
  // the type of the word a piece adds to, as Ani knows it with the notebooks
  let type = null;
  if (["suggests", "looks", "shows"].includes(piece.kind) && /^[a-z][a-z-]*$/.test(String(piece.word))) {
    try {
      const L = boot(fs, { extensions, knowledge: notebooks });
      L.evalString("(load '|ken;dscrp >|)");
      const t = L.print(L.evalString(`(and (exists? '${piece.word}) (ask ${piece.word} recall your type))`)).toLowerCase();
      if (["personality", "physical", "movement"].includes(t)) type = t;
    } catch { /* the rehearsal says why it stops */ }
  }
  const story = rehearsalStory(piece, { type });
  try {
    const { text } = storyWithoutClashes(fs, story.text, { extensions, knowledge: notebooks });
    const versions = fs.dirs.get("KEN")?.get("CINDY");
    const top = versions ? Math.max(0, ...[...versions.keys()].filter((k) => /^\d+$/.test(k)).map(Number)) : 0;
    fs.addFile("KEN", "CINDY", String(top + 1), { text, origin: "changed" });
    const plan = storyPlan(storyOutline(text), { looks: choosesLooks(extensions) });
    const p1 = pass1(fs, { extensions, knowledge: notebooks });
    const { glass } = pass2(fs, story.scene, { plan, extensions, knowledge: notebooks });
    const run = { choicePoints: p1.choicePoints, scenes: [{ id: story.scene, glass }], extensions: extensionsFor(extensions).map((e) => e.id), knowledge: notebooks };
    const did = yourKnowledgeDid(run);
    const k = notebooks.findIndex((nb) => (nb.pieces || []).includes(piece));
    const outcome = did.pieces.find((x) => x.piece === piece.id && (k < 0 || x.notebook === k + 1)) || null;
    return { piece: piece.id, story: story.text, outcome, seconds: (Date.now() - t0) / 1000, choicePoints: p1.choicePoints, glass };
  } catch (e) {
    return { piece: piece.id, story: story.text, error: String((e && e.message) || e), seconds: (Date.now() - t0) / 1000 };
  }
}

// ---- reading what Ani did

// A suggestion as the glass boxes keep it, (suggestion: element e value v strength s
// source src), as { element, value, strength, source }, each a form readForms reads (a
// string or a list); null if it isn't one.
function suggestionOf(x) {
  const s = typeof x === "string" ? readForms(x)[0] : x;
  if (!Array.isArray(s) || s[0] !== "suggestion:") return null;
  const get = (k) => { const i = s.indexOf(k); return i > 0 ? s[i + 1] : null; };
  return { element: get("element"), value: get("value"), strength: get("strength"), source: get("source") };
}
// Where a suggestion's source says it came from: [{ origin, via, how }], how "own" (the
// character's word itself), "neighbor" or "opposite" ((neighbor-of via origin): the
// character's word via, the suggestion its neighbor origin's), through (and ...).
function originsOf(source) {
  if (typeof source === "string") return [{ origin: source, via: source, how: "own" }];
  if (!Array.isArray(source)) return [];
  if (source[0] === "and") return source.slice(1).flatMap(originsOf);
  if ((source[0] === "neighbor-of" || source[0] === "opposite-of") && typeof source[1] === "string" && typeof source[2] === "string") {
    return [{ origin: source[2], via: source[1], how: source[0] === "neighbor-of" ? "neighbor" : "opposite" }];
  }
  return [];
}
const shown = (x) => (x === null || x === undefined ? null : printForm(x));
// The verb a convey method's value conveys: (pushes a b), or (bind (...) (chases a `other)).
function verbOfMethod(method) {
  if (!Array.isArray(method)) return null;
  const i = method.indexOf("value");
  let v = i > 0 ? method[i + 1] : null;
  if (Array.isArray(v) && v[0] === "bind") v = v[v.length - 1];
  return Array.isArray(v) ? v[0] : null;
}
// The plain words of a reason pass 1 set a suggestion aside for (choose.198).
const SET_ASIDE = {
  "much-less-strongly-suggested": "much less strongly suggested",
  "not-compatible-with-others": "not compatible with the others",
  "less-strongly-suggested": "less strongly suggested",
};

// The places in pass 1 a suggestion of a piece reached: for each choice point of element
// (absolute, or relative with relative true) where a suggestion that matches did, { choicePoint,
// character, state, value (Ani's choice), against? [{ value, source }], reason? }:
//   won       kept (in the choice point's memory), perhaps against others it beat
//   combined  in a conflict pass 1 compromised on: met in the middle (against)
//   lost      set aside (rejectedSuggestions), with Ken's reason and what was kept
function passOnePlaces(choicePoints, element, matches, { relative = false } = {}) {
  const places = [];
  for (const cp of choicePoints || []) {
    // a relative choice point's element is (relative-speed a b), its elementName relative-speed
    if ((cp.elementName || cp.element) !== element) continue;
    if (relative !== (Array.isArray(cp.name) && cp.name[0] === "relative-choice-point-of")) continue;
    const ours = (s) => s && (Array.isArray(s.element) ? s.element[0] : s.element) === element && matches(s);
    const conflicts = (cp.conflictsResolved || []).filter((c) => {
      const i = c.indexOf("offenders");
      return i > 0 && (c[i + 1] || []).some((o) => ours(suggestionOf(o)));
    });
    const rejected = (cp.rejectedSuggestions || []).filter((r) => { const i = r.indexOf("suggestion"); return i > 0 && ours(suggestionOf(r[i + 1])); });
    const kept = (cp.memory || []).some((m) => ours(suggestionOf(m)));
    if (!conflicts.length && !rejected.length && !kept) continue;
    const others = (c) => { const i = c.indexOf("offenders"); return (c[i + 1] || []).map(suggestionOf).filter((o) => o && !ours(o)).map((o) => ({ value: shown(o.value), strength: o.strength, source: shown(o.source) })); };
    const how = (c) => c[c.indexOf("how-resolved") + 1];
    const place = { choicePoint: cp.name, character: Array.isArray(cp.name[1]) ? cp.name[1] : cp.thing || cp.name[1], value: shown(cp.currentChoice) };
    if (rejected.length) {
      const reason = rejected[0][rejected[0].indexOf("reason") + 1];
      const c = conflicts.find((x) => how(x) === reason) || conflicts[0];
      places.push({ ...place, state: "lost", reason, reasonWords: SET_ASIDE[reason] || String(reason).replace(/-/g, " "), against: c ? others(c) : [] });
    } else if (conflicts.some((c) => how(c) === "compromised")) {
      places.push({ ...place, state: "combined", against: others(conflicts.find((c) => how(c) === "compromised")) });
    } else {
      places.push({ ...place, state: "won", ...(conflicts.length ? { against: conflicts.flatMap(others), reason: how(conflicts[0]), reasonWords: `the others set aside: ${SET_ASIDE[how(conflicts[0])] || String(how(conflicts[0])).replace(/-/g, " ")}` } : {}) });
    }
  }
  return places;
}

// A task's suggestions as SUGEST memorized them on an establish task, (related-suggestions:
// main-suggestion s relationship r others (s ...)), each { suggestion, relationship }.
function relatedSuggestions(task) {
  const out = [];
  for (const item of task.items || []) {
    if (!item.startsWith("(related-suggestions: ")) continue;
    const r = readForms(item)[0];
    const get = (k) => { const i = r.indexOf(k); return i > 0 ? r[i + 1] : null; };
    const relationship = get("relationship");
    out.push({ suggestion: suggestionOf(get("main-suggestion")), relationship, main: true });
    for (const o of get("others") || []) out.push({ suggestion: suggestionOf(o), relationship, main: false });
  }
  return out;
}
const currentChoice = (task) => { const c = readForms(String(task.variables["current-choice"] || "nil"))[0]; return Array.isArray(c) ? c : []; };
const descriptionOf = (task) => { const t = readForms(String(task.variables.task || ""))[0]; const i = Array.isArray(t) ? t.indexOf("description") : -1; return i > 0 ? t[i + 1] : null; };
const forWho = (task) => { const t = readForms(String(task.variables.task || ""))[0]; const i = Array.isArray(t) ? t.indexOf("for-who") : -1; return i > 0 ? shown(t[i + 1]) : null; };

// What a learner's knowledge did in a film (makeFilmSteps's result made with knowledge, or
// any run with choicePoints and scenes' glass boxes), for the glass box's "What your
// knowledge did here" and the pair panel's "What your knowledge did": for each piece of
// each notebook (index: yoursIndex of the notebooks, by default run.knowledge's),
//   { notebook, title, piece, kind, words (src/teach.js pieceWords), because, state,
//     places: [...], why? }
// state, the best of its places', in this order:
//   won            used, and Ani's choice is what it said (or its way was chosen)
//   combined       used, met in the middle with another suggestion
//   lost           used and set aside, each place naming what won and why: in pass 1 Ken's
//                  reason (much less strongly suggested ...); in pass 2, CHOMET keeping only
//                  ways two of a character's words suggest at once
//                  (eliminate-not-related-suggestions, chomet.123:588-596), a better-scoring
//                  way (its scores), a task Ani couldn't do, or conflicting changes rejected
//                  (chomet.123:464)
//   never-reached  no choice or task met it, with why: "no character in this story is
//                  grumpy", "no scene shows what a grumpy character is like", "no scene asks
//                  Ani to show helping", "Ani isn't choosing looks (APPEAR is off)" ...
// A place is a choice point ({ choicePoint, character, state, value, against?, reason?,
// reasonWords? }), a task ({ scene, task, description, character, state, chosen?, verb?,
// way?, reason?, reasonWords?, scores? }), for a feeling one of its changes in a task
// ({ scene, task, description, character, element, change, state, against?, reason? }), or
// for a linked word a way of showing it borrowed with KNOW ({ scene, task, borrowed: true,
// way, state }). A word with no link that a character has is won with no places and a
// note. unread: true on a won or combined piece whose element nothing that draws the film
// reads (ELEMENT_USE). Also { notebooks: [{ n, title }] }.
export function yourKnowledgeDid(run, { index = null, extensions = null } = {}) {
  const notebooks = run.knowledge || [];
  index = index || yoursIndex(notebooks);
  extensions = extensions || run.extensions || [];
  const cps = run.choicePoints || [];
  const scenes = (run.scenes || []).filter((s) => s.glass);
  const tasks = scenes.flatMap((s) => s.glass.tasks.map((t) => ({ scene: s.id, glass: s.glass, task: t })));
  const learners = new Set(Object.keys(index.words));
  // whether any character is described with word (any suggestion of pass 1 names it)
  const described = (w) => cps.some((cp) => [...(cp.memory || []), ...(cp.conflictsResolved || []).flatMap((c) => c[c.indexOf("offenders") + 1] || []), ...(cp.rejectedSuggestions || []).map((r) => r[r.indexOf("suggestion") + 1])]
    .some((s) => { const x = suggestionOf(s); return x && originsOf(x.source).some((o) => o.via === w || o.origin === w); }))
    || tasks.some(({ task }) => relatedSuggestions(task).some((r) => r.suggestion && originsOf(r.suggestion.source).some((o) => o.via === w || o.origin === w)));
  const best = (places) => ["won", "combined", "lost"].find((s) => places.some((p) => p.state === s)) || "never-reached";
  const pieces = [];
  notebooks.forEach((nb, k) => {
    for (const p of (nb && nb.pieces) || []) {
      const base = { notebook: k + 1, title: index.notebooks[k] ? index.notebooks[k].title : nb.title, piece: p.id, kind: p.kind, words: pieceWords(p), because: String(p.because || "").replace(/\s+/g, " ").trim() };
      let places = [], why = null;
      const theirs = !learners.has(p.word); // a piece added to a word of Ani's
      switch (p.kind) {
        case "word":
        case "relationship": {
          // suggestions that reached a character through the piece's link
          const linked = new Set([p.like, p.opposite].filter(Boolean));
          const viaLink = (s) => originsOf(s.source).some((o) => o.how !== "own" && ((o.via === p.word && linked.has(o.origin)) || (o.origin === p.word && linked.has(o.via))));
          for (const element of new Set(cps.map((cp) => cp.elementName || cp.element))) {
            places.push(...passOnePlaces(cps, element, viaLink), ...passOnePlaces(cps, element, viaLink, { relative: true }));
          }
          // and, with KNOW, the ways of showing the word borrowed from its neighbors
          for (const s of scenes) {
            for (const b of s.glass.borrowed || []) {
              if (b.word !== p.word || !linked.has(b.neighbor)) continue;
              places.push({ scene: s.id, task: b.task, character: null, state: b.chosen ? "won" : "lost", borrowed: true, way: b.way, ...(b.chosen ? {} : { reason: "not-chosen" }) });
            }
          }
          if (!places.length && !p.like && !p.opposite && described(p.word)) {
            // a word with no link: Ani knows it, and what it suggests is its other pieces'
            pieces.push({ ...base, state: "won", places: [], note: `a character of this story is ${p.word}: what the word suggests is in its other pieces` });
            continue;
          }
          if (!places.length) why = !described(p.word) ? `no character in this story is ${p.word}` : `nothing ${p.like || p.opposite} suggests reached a choice of this story`;
          break;
        }
        case "suggests":
        case "looks": {
          const matches = (s) => originsOf(s.source).some((o) => (o.origin === p.word) && (!theirs || (o.how === "own" && shown(s.value) === p.value && s.strength === p.strength)));
          places = passOnePlaces(cps, p.element, matches);
          if (!places.length) {
            why = p.kind === "looks" && !cps.some((cp) => cp.parent === "appearance-choice-point") ? "Ani isn't choosing looks (APPEAR is off)"
              : !described(p.word) ? `no character in this story is ${p.word}` : `no choice of ${p.element.replace(/-/g, " ")} heard it`;
          }
          if (p.kind === "suggests" && places.some((x) => x.state !== "lost") && elementUse(p.element, extensions) === "none") base.unread = true;
          break;
        }
        case "relationship-suggests": {
          const matches = (s) => originsOf(s.source).some((o) => o.origin === p.word) && (!theirs || shown(s.value) === p.comparison);
          places = passOnePlaces(cps, `relative-${p.element}`, matches, { relative: true });
          if (!places.length) why = `no two characters of this story are ${p.word.replace(/-/g, " ")} each other, or nothing compared their ${p.element.replace(/-/g, " ")}`;
          break;
        }
        case "shows":
        case "relationship-shows": {
          for (const { scene, task } of tasks) {
            if (task.variables.parent !== "establish-task") continue;
            const ours = relatedSuggestions(task).filter((r) => r.suggestion && originsOf(r.suggestion.source).some((o) => o.origin === p.word) && verbOfMethod(r.suggestion.value) === p.verb
              && (!theirs || r.suggestion.strength === p.strength));
            if (!ours.length) continue;
            const chosen = currentChoice(task).map(verbOfMethod);
            const won = chosen.includes(p.verb);
            const place = { scene, task: task.name, description: shown(descriptionOf(task)), character: forWho(task), state: won ? "won" : "lost", chosen: chosen.filter(Boolean), verb: p.verb };
            if (!won) {
              const unique = ours.every((r) => r.relationship === "unique");
              const others = relatedSuggestions(task).filter((r) => r.main && r.suggestion && r.relationship === "identical").map((r) => verbOfMethod(r.suggestion.value));
              place.reason = unique && others.length ? "not-related" : chosen.length ? "another-way" : "nothing-chosen";
              place.reasonWords = place.reason === "not-related"
                ? `set aside: Ani prefers a way of showing that two of the words suggest at once (${others.join(", ")}), and only yours suggested ${p.verb} (Ken's CHOMET, eliminate-not-related-suggestions, chomet.123:588-596)`
                : place.reason === "another-way" ? `set aside: Ani chose ${chosen.filter(Boolean).join(" and ")}` : "Ani chose no way of showing it";
            }
            places.push(place);
          }
          if (!places.length) {
            why = p.kind === "shows"
              ? (!described(p.word) ? `no character in this story is ${p.word}` : `no scene shows what a ${p.word} character is like`)
              : `no scene shows a relationship that is ${p.word.replace(/-/g, " ")}`;
          }
          break;
        }
        case "way":
        case "verb": {
          const verb = p.kind === "way" ? p.verb : p.word;
          for (const { scene, task } of tasks) {
            if (task.variables.parent !== "convey-task") continue;
            const d = descriptionOf(task);
            if (!Array.isArray(d) || d[0] !== verb) continue;
            const chosen = currentChoice(task);
            const head = Array.isArray(chosen[0]) ? chosen[0][0] : null;
            const cant = task.variables.status === "cant-do";
            const place = { scene, task: task.name, description: shown(d), character: forWho(task), chosen: chosen.map(shown) };
            if (p.kind === "way") {
              const ours = (x) => x.includes(`source (yours ${verb})`) && x.includes(`(${p.way} `);
              const offered = (task.items || []).some((x) => x.startsWith("(suggestion: ") && ours(x));
              // set aside before scoring by CHOMET's reject-suggestion (chomet.123:283-309): kept
              // in the task's rejected-suggestions with Ken's reason
              const rejected = readForms(String(task.variables["rejected-suggestions"] || "nil"))[0];
              const setAside = (Array.isArray(rejected) ? rejected : []).find((x) => Array.isArray(x) && ours(printForm(x)));
              if (!offered && !setAside) continue;
              place.way = p.way;
              place.state = head === p.way ? "won" : "lost";
              if (place.state === "lost") {
                const why = setAside ? setAside[setAside.indexOf("reason") + 1] : null;
                place.reason = setAside ? "set-aside" : cant ? "cant-do" : "another-way";
                const head0 = Array.isArray(why) ? why[0] : why;
                const plain = { "too-much-time:": "it would take more time than the part has to fill", "need-more-time:": "it needs more time than the part has", "more-time-needed:": "it needs more time than the part has", "prerequisites-not-met": "what it needs first isn't so" }[head0] || printForm(why);
                place.reasonWords = setAside ? `set aside before scoring: ${plain} (CHOMET's reject-suggestion, chomet.123:283-309)${head ? `; Ani chose ${head.replace(/-/g, " ")}` : ""}`
                  : cant ? "Ani couldn't do this task at all" : `set aside: CHOMET scored ${head ? head.replace(/-/g, " ") : "another way"} higher`;
                if (setAside) place.setAsideFor = printForm(why);
                place.scores = task.variables.scores || null;
              }
            } else {
              place.state = cant || !chosen.length ? "lost" : "won";
              if (place.state === "lost") {
                const rejected = (task.items || []).filter((x) => x.startsWith("(rejected-suggestion: "));
                place.reason = "cant-do";
                place.reasonWords = `Ani couldn't show it${rejected.length ? ` (${rejected.map((x) => readForms(x)[0][2]).join(", ")})` : ""}`;
              }
            }
            places.push(place);
          }
          if (!places.length) why = `no scene asks Ani to show ${verb.replace(/-/g, " ")}`;
          break;
        }
        case "feeling": {
          // one place for each change of the feeling, in each task that establishes it
          const changeOf = (m) => {
            if (!Array.isArray(m) || (m[0] !== "change:" && m[0] !== "change-to:")) return null;
            const get = (k) => { const i = m.indexOf(k); return i > 0 ? m[i + 1] : null; };
            const element = Array.isArray(get("element")) ? get("element")[1] : null;
            return { element, change: m[0] === "change:" ? (Array.isArray(get("amount")) ? { positive: "up", negative: "down" }[get("amount")[0]] : null) : ({ high: "curved", low: "straight" }[get("new-value")] && element === "path-curvature" ? { high: "curved", low: "straight" }[get("new-value")] : get("new-value")) };
          };
          for (const { scene, task } of tasks) {
            if (task.variables.parent !== "establish-task") continue;
            const d = descriptionOf(task);
            if (!Array.isArray(d) || d[0] !== "emotional-state" || !JSON.stringify(d[2]).includes(`"${p.word}"`)) continue;
            const made = currentChoice(task).map(changeOf).filter(Boolean);
            // CHOMET's conflicts among the task's changes, (conflict: type different-signs
            // element-involved (display amount) offenders (s ...)) (chomet.123:440-472)
            const conflicts = (task.items || []).filter((x) => x.startsWith("(conflict: ")).map((x) => {
              const c = readForms(x)[0];
              const i = c.indexOf("offenders");
              return { type: c[c.indexOf("type") + 1], offenders: (i > 0 ? c[i + 1] : []).map(suggestionOf).filter(Boolean) };
            });
            for (const c of p.changes || []) {
              const place = { scene, task: task.name, description: shown(d), character: shown(d[1]), element: c.element, change: c.change };
              const conflict = conflicts.find((x) => x.offenders.some((o) => o.source === p.word && JSON.stringify(o.value).includes(`"${c.element}"]`)));
              if (made.some((m) => m.element === c.element && m.change === c.change)) place.state = "won";
              else if (conflict) {
                const others = conflict.offenders.filter((o) => o.source !== p.word);
                Object.assign(place, { state: "lost", reason: "conflict", against: others.map((o) => ({ value: shown(o.value), strength: o.strength, source: shown(o.source) })),
                  reasonWords: `cancelled: ${others.map((o) => shown(o.source)).join(" and ")} changes ${c.element.replace(/-/g, " ")} the other way, and Ken's CHOMET rejects conflicting changes rather than choose between them ("hopefully all conflicting ones are so noted for now rather than resolving them I'll reject", chomet.123:464)` });
              } else Object.assign(place, { state: "lost", reason: "not-chosen", reasonWords: "this change wasn't made" });
              places.push(place);
            }
          }
          if (!places.length) why = `no scene shows a character feeling ${p.word}`;
          break;
        }
      }
      pieces.push({ ...base, state: best(places), places, ...(why && !places.length ? { why } : {}) });
    }
  });
  return { notebooks: index.notebooks.map(({ n, title }) => ({ n, title })), pieces };
}

// What a learner's knowledge changed (design section 8, the pair panel's "What your
// knowledge did"): before, the film made without it, after, the same story made with it
// (makeFilmSteps with knowledge; after.knowledge the notebooks), both as makeFilmSteps
// returns them:
//   pass1   { total, changed: [{ choicePoint, before, after, source, pieces }] } every
//           choice whose value differs, source the kept suggestion's source (printed as
//           Lisp) and pieces the ids ("n1 k2") of the pieces whose places include it
//   scenes  [{ id, frames: { before, after }, runningTime: { before, after }, tasks }] as
//           criticismChanges has them: tasks whose choice, status or running time differ
//   pieces  yourKnowledgeDid(after)'s pieces
export function knowledgeChanges(before, after, { index = null } = {}) {
  const did = yourKnowledgeDid(after, { index });
  const key = (n) => JSON.stringify(n);
  const was = new Map((before.choicePoints || []).map((cp) => [key(cp.name), cp]));
  const changed = [];
  for (const cp of after.choicePoints || []) {
    const b = was.get(key(cp.name));
    if (b && key(b.currentChoice) === key(cp.currentChoice)) continue;
    const kept = (cp.memory || []).map(suggestionOf).find((s) => s);
    const pieces = did.pieces.filter((x) => x.places.some((pl) => pl.choicePoint && key(pl.choicePoint) === key(cp.name))).map((x) => `n${x.notebook} ${x.piece}`);
    changed.push({ choicePoint: cp.name, before: b ? b.currentChoice : null, after: cp.currentChoice, source: kept ? shown(kept.source) : null, pieces });
  }
  const remade = { scenes: after.scenes, remade: { scenes: (after.scenes || []).map((s) => ({ id: s.id, how: s.error ? "failed" : "refilmed" })) } };
  const { scenes } = criticismChanges(before, remade);
  return { pass1: { total: (after.choicePoints || []).length, changed }, scenes: scenes.map(({ how, ...s }) => s), pieces: did.pieces };
}
