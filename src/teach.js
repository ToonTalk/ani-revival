// Teach Ani: a learner's own knowledge (reports/chapter-x/design-teaching.md;
// reports/ext/teach/README.md). Ken's 1977 paper planned a system whose knowledge
// would be "as modular and simply represented as possible", so that "the child, with
// the help of the system, will be able to define new characters for the stories,
// change the system's vocabulary, add a reasonable default course of action and so
// on" ("Three Interactions between AI and Education", Machine Intelligence 8, p. 428),
// and AI-TR-540 says a student "could learn much by observing the effects of altering
// Ani's knowledge and rules" (pp. 149-150).
//
// What one learner teaches is a notebook: JSON, the source of truth, with a title and a
// list of pieces, each with the learner's reason (because), which is required. This
// module, shared by the page, its worker and the tools, holds what doesn't need a Lisp:
//   checkNotebook(notebook, options)   the checks that need no Lisp (the trial job,
//                                      src/pipeline.js checkKnowledge, adds Ani's own)
//   notebookToLisp(notebook, { n, extensions })   the notebook in Ken's notation, the file
//                                      YOURS;N1 KNOW that REVIVE;TEACH loads, every line
//                                      explained, one function per kind of piece
//   yoursIndex(notebooks)              "your knowledge" for the glass box, in the shape of
//                                      the page's DATA.know, each entry with its notebook,
//                                      piece and because
//   pieceWords(piece)                  a piece in plain words, one line
//   rehearsalStory(piece, notebooks)   a two-character, one-scene story that uses a piece
//
// A notebook (format "ani-knowledge", version 1):
//   { format: "ani-knowledge", version: 1, title: "Sam's knowledge", made, changed?,
//     pieces: [ { id: "k1", kind, ...fields, because: "the learner's reason" }, ... ] }
// The kinds of piece, in the design's order of ease (its sections 4.1 to 4.5), and their
// fields (a word is lower-case letters and hyphens, at most 30):
//   word                  (4.1) a new word for characters: word, type ("personality",
//                         "physical" or "movement"), and like or opposite (a word Ani
//                         knows of the same type, or one of the learner's), or neither
//   suggests              (4.2) what a word suggests for how a character moves: word (the
//                         learner's or Ani's), element (MOVEMENT_ELEMENTS), value (as the
//                         element takes it: "low", "(not low)", "long", "(negative high)"),
//                         strength ("low", "medium" or "high")
//   looks                 (4.2, with APPEAR) how a character with the word looks: word,
//                         element (LOOK_ELEMENTS), value, strength
//   shows                 (4.2) how a character shows the word, in pass 2: word, verb
//                         (VERBS), who ("enemy", "friend" or "stranger"), strength
//   relationship          (4.3) a new word for how one character is to another: word, type
//                         ("affection" or "domination"), and like or opposite, or neither
//   relationship-shows    (4.3) how a relationship is shown: word (the learner's or Ani's),
//                         verb, strength, bestWhen ("always", "in-charge", "not-in-charge"
//                         or "dislikes")
//   relationship-suggests (4.3) how the first moves compared with the other: word, element
//                         (RELATIVE_ELEMENTS), comparison ("greater-than", "less-than",
//                         "same-as" or "different-from"), strength
//   way                   (4.3) another way of showing a verb: verb (VERBS, or the
//                         learner's), way (WAYS), first (1: the verb's first character
//                         does the way's first part, as the helper goes to the one helped;
//                         2: the other way round), strength
//   feeling               (4.4) a feeling and how it changes movement: word, changes
//                         ([{ element, change, strength }], FEELING_CHANGES)
//   verb                  (4.5a) a verb that is a kind of one of Ani's: word, kindOf (a
//                         verb with a way of showing in the loaded set, or "action" with
//                         none), showAs ("parent": shown as that verb is shown, the
//                         default; "ways": only by the learner's way pieces for it)
// The revival's choices, pending Ken (reports/chapter-x/PLAN.md, "Teaching Ani"):
// learners may add to Ken's words, only adding, marked as theirs; Ken's legitimacy rule
// is put as a question, the because required; a piece naming a story's character is
// refused (that is criticism); a verb is a kind of an existing verb, with no "A then
// B" and no walk builder; up to four notebooks.

export const NOTEBOOK_FORMAT = "ani-knowledge";
export const NOTEBOOK_VERSION = 1;
export const MAX_NOTEBOOKS = 4;
export const MAX_NAME = 30;

export const PIECE_KINDS = ["word", "suggests", "looks", "shows", "relationship", "relationship-shows", "relationship-suggests", "way", "feeling", "verb"];

// The kinds of word, and the descriptor each is defined as (dscrp.17:49-56, relate.22:14-18).
export const WORD_TYPES = { personality: "personality-character-descriptor", physical: "physical-character-descriptor", movement: "movement-character-descriptor" };
export const RELATIONSHIP_TYPES = { affection: "affection-relationship-descriptor", domination: "domination-relationship-descriptor" };
export const STRENGTHS = ["low", "medium", "high"];

const THREE = ["low", "medium", "high", "(not low)", "(not high)"];
const LENGTH = ["short", "medium", "long"];
const ATTRACTION = ["(positive low)", "(positive medium)", "(positive high)", "(negative low)", "(negative medium)", "(negative high)"];
// The elements of how a character moves that a word may suggest a value for (the
// choice points of pass 1, normal-movement-element's offspring), in the editor's plain
// words, with the values each takes: three-valued as Ken's (not low), dscrp.17:78; the
// path's length short, medium or long (evil's short, graceful's long); the attractions
// signed (shy's (negative high), dscrp.17:66).
export const MOVEMENT_ELEMENTS = {
  speed: { words: "speed", values: THREE },
  "path-curvature": { words: "how curved its paths are", values: THREE },
  "path-length": { words: "how long its paths are", values: LENGTH },
  "path-jaggedness": { words: "how jagged its paths are", values: THREE },
  "activity-level": { words: "how active it is", values: THREE },
  "rhythmic-level": { words: "how rhythmic it is", values: THREE },
  repetiveness: { words: "how repetitive it is", values: THREE },
  acceleration: { words: "how quickly it gets going", values: THREE },
  deliberateness: { words: "how deliberate it is", values: THREE },
  "attraction-towards-friends": { words: "how drawn it is to its friends", values: ATTRACTION },
  "attraction-towards-enemies": { words: "how drawn it is to its enemies", values: ATTRACTION },
  "attraction-towards-strangers": { words: "how drawn it is to strangers", values: ATTRACTION },
};
// With APPEAR, how a character looks (REVIVE;APPEAR's elements, the hue one of six on
// REVIVE;COLORS's painter's wheel).
export const HUES = ["yellow", "orange", "red", "purple", "blue", "green"];
export const LOOK_ELEMENTS = {
  size: { words: "size", values: ["low", "medium", "high"] },
  "shape-jaggedness": { words: "how jagged its shape is", values: ["low", "medium", "high"] },
  "shape-complexity": { words: "how complex its shape is", values: ["low", "medium", "high"] },
  "color-intensity": { words: "how bright its colors are", values: ["low", "medium", "high"] },
  "color-saturation": { words: "how vivid its colors are", values: ["low", "medium", "high"] },
  "color-hue": { words: "its hue", values: HUES },
};
// The relative elements a relationship may suggest a comparison for (loves' list,
// relate.22:22-24), and the comparisons COSUG takes (cosug.215:302-312).
export const RELATIVE_ELEMENTS = ["speed", "acceleration", "activity-level", "rhythmic-level", "deliberateness", "path-length", "path-curvature", "path-jaggedness"];
export const COMPARISONS = { "greater-than": "more than", "less-than": "less than", "same-as": "the same as", "different-from": "differently from" };

// The verbs a word or relationship may be shown by, with their roles as CONVEY's
// receivers name them (convey.64:65-125; REVIVE;KNOWCV), and the extension each way of
// showing needs: Ken's accompanys, chases, hurts and pushes; meets through REVIVE;MEND5's
// move-to (TEACH requires MEND); avoids, helps and follows through KNOW's (helps and
// avoids are Ken's verbs with no way of showing; follows is KNOW's verb).
export const VERBS = {
  accompanys: { roles: ["character-1", "character-2"], words: "going along with", needs: null },
  chases: { roles: ["chaser", "chasee"], words: "chasing", needs: null },
  hurts: { roles: ["hurter", "hurtee"], words: "hurting", needs: null },
  pushes: { roles: ["pusher", "pushee"], words: "pushing around", needs: null },
  meets: { roles: ["who", "other"], words: "going to meet", needs: "mend" },
  avoids: { roles: ["who", "other"], words: "keeping away from", needs: "know", kens: true },
  helps: { roles: ["helper", "helped"], words: "helping", needs: "know", kens: true },
  follows: { roles: ["follower", "leader"], words: "following", needs: "know", isKnows: true },
};
// The display methods that take two characters, by which a verb can also be shown (a
// way piece), each with the arguments CONVEY's receiver gives it, $1 the one who does
// the way's first part and $2 the other, and the extension that defines it.
export const WAYS = {
  "goes-to-and-accompanys": { form: "(goes-to-and-accompanys $1 $2 (good-distance-from (vicinity-of $1)))", words: "goes to the other and they go on together", needs: null },
  "chases-to": { form: "(chases-to $1 $2 (distance-away-from (vicinity-of $2) (vicinity-of $1) .25))", words: "runs after the other, who runs a quarter of the screen away", needs: null },
  "move-to-and-hits": { form: "(move-to-and-hits $1 $2)", words: "goes to the other and hits it", needs: null },
  "pushes-around": { form: "(pushes-around $1 $2)", words: "pushes the other around", needs: null },
  "move-to": { form: "(move-to $1 (vicinity-of $2))", words: "goes to meet the other", needs: "mend" },
  "helps-along": { form: "(helps-along $1 $2 (good-distance-from (vicinity-of $2)))", words: "goes to the other and helps it along", needs: "know" },
  "moves-away-from": { form: "(moves-away-from $1 $2)", words: "moves away from the other", needs: "know" },
  "follows-behind": { form: "(follows-behind $1 $2)", words: "follows behind the other", needs: "know" },
};
// Who a character's word is shown towards: Ken's generators (sugest.123:341-395): an
// enemy (either hates the other), a friend (likes or loves), a stranger (no relationship).
export const WHO = { enemy: "enemy-of", friend: "friend-of", stranger: "stranger-of" };
// When a relationship's way is best (relate.22:45-68).
export const BEST_WHEN = {
  always: null,
  "in-charge": "((dominates ,character ,other-character))",
  "not-in-charge": "((not (dominates ,character ,other-character)))",
  dislikes: "((not (likes ,character ,other-character)))",
};
// What a feeling may change, as joy's changes (emote.9:11-72): up or down by as much as
// the feeling (change:), or a path made long or short, curved or straight (change-to:).
export const FEELING_CHANGES = {
  speed: ["up", "down"], acceleration: ["up", "down"], "activity-level": ["up", "down"], "rhythmic-level": ["up", "down"],
  "path-jaggedness": ["up", "down"], "path-curvature": ["up", "down", "curved", "straight"], "path-length": ["long", "short"],
};
// What joy does (emote.9:11-72): a feeling that does the opposite with joy at once is
// cancelled, CHOMET rejecting conflicting changes (chomet.123:464, Ken's decision 9).
const JOYS = { speed: "up", acceleration: "up", "activity-level": "up", "rhythmic-level": "up", "path-length": "long", "path-curvature": "curved" };
const OPPOSITE_CHANGE = { up: "down", down: "up", long: "short", short: "long", curved: "straight", straight: "curved" };

// The elements Ani chooses that nothing that draws the film reads in 1978 (src/pipeline.js
// ELEMENT_USE): with DETAIL deliberateness and the attractions are read.
const UNREAD = ["acceleration", "deliberateness", "attraction-towards-friends", "attraction-towards-enemies", "attraction-towards-strangers"];

// Names a word may not take besides those Ani uses for anything: Lisp's own, and the
// names of elements and values.
const LISP_NAMES = new Set(["nil", "t", "quote", "function", "lambda", "car", "cdr", "cons", "list", "append", "and", "or", "not", "null", "cond", "let", "do", "prog", "progn", "set", "setq", "get", "putprop", "eq", "equal", "member", "memq", "length", "reverse", "print", "read", "load", "eval", "apply", "funcall", "mapc", "mapcar", "mapcan", "defun", "define", "ask", "first", "second", "third", "rest", "last", "max", "min", "plus", "times", "difference", "quotient", "go", "return", "error", "break", "throw", "catch", "status", "sstatus", "time", "type", "value", "array", "store", "sort", "subst", "sublis", "atom", "number", "symbol", "string"]);
const VALUE_NAMES = new Set(["low", "medium", "high", "short", "long", "positive", "negative", "none", "unknown", "strength", "source", "element", "establish", "convey", "display", "method", "yours", "greater-than", "less-than", "same-as", "different-from", ...HUES]);
const ELEMENT_NAMES = new Set([...Object.keys(MOVEMENT_ELEMENTS), ...Object.keys(LOOK_ELEMENTS), ...RELATIVE_ELEMENTS.map((e) => `relative-${e}`)]);

// Ken's four (src/pipeline.js CHARACTERS).
const KENS_CAST = ["cinderella", "step-mother", "prince", "fairy-godmother"];

// ---------------------------------------------------------------- reading a notebook

const isWord = (x) => typeof x === "string" && /^[a-z][a-z-]*$/.test(x) && x.length <= MAX_NAME && !x.endsWith("-") && !x.includes("--");
const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
// The words a piece teaches Ani for the first time (word, relationship, feeling, verb).
const NEW_KINDS = { word: "word", relationship: "relationship", feeling: "feeling", verb: "verb" };
export function newName(piece) {
  return NEW_KINDS[piece.kind] ? piece.word : null;
}
// The category of a word as a vocabulary has it: "word" (for characters), "relationship".
const categoryOf = (entry) => (!entry ? null : entry.kind === "relationship" || entry.kindByRelation === "relationship" ? "relationship" : "word");
const typeOf = (entry) => (entry && (entry.kind || entry.kindByRelation)) || null;

// What the notebooks before this one taught (for a piece that adds to a word of an
// earlier notebook, and for two notebooks teaching the same word).
function taughtIn(notebooks) {
  const out = new Map();
  notebooks.forEach((nb, k) => {
    for (const p of (nb && nb.pieces) || []) {
      const name = newName(p);
      if (name && !out.has(name)) out.set(name, { notebook: k, title: nb.title || `notebook ${k + 1}`, piece: p });
    }
  });
  return out;
}

// ---------------------------------------------------------------- the checks

// The checks that need no Lisp. options:
//   extensions   the film's extensions (TEACH's own are added by the pipeline)
//   vocabulary   { word: { kind, revival?, neighbors?, opposites? } }, every word Ani knows
//                with these extensions (the page's vocabularyFor(extensions), or the trial
//                job's answers); without it, the checks that need it are left to the trial job
//   taken        a Set of every name Ani defines with these extensions (src/pipeline.js
//                aniNames); without it, left to the trial job
//   others       the notebooks loaded before this one (a film's notebooks in order)
//   characters   the names of the story's characters (Ken's four are always included)
// Returns { ok, refused: [{ piece, code, says }], warnings: [{ piece, code, says }] },
// piece the piece's id (null for the notebook), says the page's sentence.
export function checkNotebook(notebook, { extensions = [], vocabulary = null, taken = null, others = [], characters = [] } = {}) {
  const refused = [], warnings = [];
  const refuse = (piece, code, says) => refused.push({ piece: piece ? piece.id || null : null, code, says });
  const warn = (piece, code, says) => warnings.push({ piece: piece ? piece.id || null : null, code, says });
  const on = new Set(extensions);
  on.add("mend"); // TEACH requires it
  if (!notebook || notebook.format !== NOTEBOOK_FORMAT) {
    refuse(null, "format", "This isn't a notebook of knowledge for Ani (a file saved by Teach Ani).");
    return { ok: false, refused, warnings };
  }
  if (notebook.version !== NOTEBOOK_VERSION) refuse(null, "format", `This notebook was written by a newer page (version ${notebook.version}); this page reads version ${NOTEBOOK_VERSION}.`);
  if (!Array.isArray(notebook.pieces)) {
    refuse(null, "format", "This notebook has no list of pieces.");
    return { ok: false, refused, warnings };
  }
  if (others.length >= MAX_NOTEBOOKS) refuse(null, "too-many-notebooks", `A film can be made with up to ${MAX_NOTEBOOKS} notebooks.`);
  const earlier = taughtIn(others);
  const cast = new Set([...KENS_CAST, ...characters]);
  const ids = new Set();
  // the words this notebook teaches, as it goes, and every word it names
  const mine = new Map(); // name -> piece
  const elementsSaid = new Map(); // `${word} ${element}` -> piece, for the learner's own words
  // a word Ani knows (or this or an earlier notebook teaches), and its category and type
  const known = (w) => {
    if (mine.has(w)) {
      const p = mine.get(w);
      return { category: p.kind === "relationship" ? "relationship" : p.kind === "word" ? "word" : p.kind, type: p.type, yours: true };
    }
    if (earlier.has(w)) {
      const p = earlier.get(w).piece;
      return { category: p.kind === "relationship" ? "relationship" : p.kind === "word" ? "word" : p.kind, type: p.type, yours: true };
    }
    if (vocabulary && vocabulary[w]) return { category: categoryOf(vocabulary[w]), type: typeOf(vocabulary[w]) };
    return null;
  };
  const verbKnown = (v) => VERBS[v] || mine.has(v) && mine.get(v).kind === "verb" || earlier.has(v) && earlier.get(v).piece.kind === "verb";
  // the verbs with a way of showing in the loaded set: Ken's, MEND's meets, KNOW's, and any
  // verb this notebook (or an earlier) gives a way or makes a kind of one
  const ways = new Set();
  const allPieces = [...others.flatMap((nb) => (nb && nb.pieces) || []), ...notebook.pieces];
  for (const p of allPieces) if (p && p.kind === "way" && WAYS[p.way] && (!WAYS[p.way].needs || on.has(WAYS[p.way].needs))) ways.add(p.verb);
  const hasWay = (v) => (VERBS[v] && (!VERBS[v].needs || on.has(VERBS[v].needs))) || ways.has(v)
    || allPieces.some((p) => p && p.kind === "verb" && p.word === v && (p.showAs || "parent") === "parent" && p.kindOf !== "action" && hasWay(p.kindOf));
  const needsSentence = (what, ext) => `${what} needs ${ext === "know" ? "the revival's knowledge (KNOW)" : ext === "appear" ? "Ani choosing how its characters look (APPEAR)" : ext.toUpperCase()}: turn it on, or choose another.`;
  const strengthOk = (piece, s) => {
    if (!STRENGTHS.includes(s)) refuse(piece, "bad-value", `How strongly is one of ${STRENGTHS.join(", ")}.`);
  };
  const nameOk = (piece, w, what) => {
    if (!isWord(w)) return refuse(piece, "bad-name", `"${w}" can't be a word of Ani's: use lower-case letters, with hyphens between words, at most ${MAX_NAME}.`), false;
    if (LISP_NAMES.has(w)) return refuse(piece, "lisp-name", `"${w}" is a name Lisp itself uses, so Ani can't take it as ${what}.`), false;
    if (ELEMENT_NAMES.has(w) || VALUE_NAMES.has(w)) return refuse(piece, "element-name", `"${w}" is the name of one of the things Ani chooses, or of a value, so it can't be ${what}.`), false;
    if (cast.has(w)) return refuse(piece, "names-character", `"${w}" is a character of the story, not ${what}. To change how this film shows her, criticize it (Your criticism).`), false;
    return true;
  };
  const wordUsable = (piece, w, category, what) => {
    if (!isWord(w)) return refuse(piece, "bad-name", `"${w}" isn't a word of Ani's.`), false;
    if (cast.has(w)) return refuse(piece, "names-character", `That's about this film's ${w.replace(/-/g, " ")}, not about any character. To change this film, criticize it (Your criticism).`), false;
    const k = known(w);
    if (!k) {
      // without a vocabulary, left to the trial job
      if (!vocabulary) return true;
      refuse(piece, "unknown-word", `Ani doesn't know "${w}" yet: teach it the word first.`);
      return false;
    }
    if (k.category !== category) return refuse(piece, "link-kind", `"${w}" is a word for ${category === "relationship" ? "a character, not for how one character is to another" : "how one character is to another, not for a character"}: ${what}`), false;
    return true;
  };

  for (const piece of notebook.pieces) {
    if (!piece || typeof piece !== "object") { refuse(null, "format", "A piece of this notebook isn't a piece of knowledge."); continue; }
    if (!piece.id || ids.has(piece.id)) refuse(piece, "format", `Each piece needs an id of its own${piece.id ? ` (${piece.id} is used twice)` : ""}.`);
    ids.add(piece.id);
    if (!PIECE_KINDS.includes(piece.kind)) { refuse(piece, "format", `Ani doesn't know a piece of the kind "${piece.kind}".`); continue; }
    if (!clean(piece.because)) refuse(piece, "no-because", "Say why: Ani keeps your reason with each piece, and shows it wherever the piece is used.");
    if (piece.character) refuse(piece, "names-character", `That's about this film's ${String(piece.character).replace(/-/g, " ")}, not about any ${piece.word || ""} character, in any story. To change this film, criticize it (Your criticism).`.replace(/any {2}/, "any "));
    const w = piece.word;
    switch (piece.kind) {
      case "word":
      case "relationship": {
        const category = piece.kind;
        const types = category === "word" ? WORD_TYPES : RELATIONSHIP_TYPES;
        if (!types[piece.type]) refuse(piece, "bad-value", `A ${category === "word" ? "word for characters tells what a character is like inside (personality), looks like (physical) or how it moves (movement)" : "relationship is about liking and disliking (affection) or who is in charge (domination)"}.`);
        if (!nameOk(piece, w, category === "word" ? "a word for characters" : "a relationship")) break;
        if (mine.has(w) || earlier.has(w)) {
          const where = mine.has(w) ? `this notebook's ${mine.get(w).id}` : earlier.get(w).title;
          refuse(piece, "two-notebooks", `"${w}" is taught already, in ${where}: a word is taught once${earlier.has(w) ? "; untick one of the notebooks" : ""}.`);
          break;
        }
        const k = vocabulary && vocabulary[w];
        if (k) {
          const whose = k.revival ? ", the revival's word" : k.ken ? ", Ken's word" : "";
          const link = (k.opposites || []).length ? `, the opposite of "${k.opposites[0]}"` : (k.neighbors || []).length ? `, much the same as "${k.neighbors[0]}"` : "";
          refuse(piece, "known-word", `Ani already knows "${w}"${whose}${link}: add to Ani's word instead of teaching it again, which would replace it.`);
        }
        else if (taken && taken.has(w)) refuse(piece, "name-taken", `"${w}" is already the name of something Ani knows (an actor or one of its files' names), so it can't be a new word.`);
        mine.set(w, piece);
        if (piece.like && piece.opposite) refuse(piece, "bad-value", "A new word means much the same as one word, or the opposite of one, not both: teach the other as a second piece.");
        for (const linked of [piece.like, piece.opposite].filter(Boolean)) {
          if (linked === w) { refuse(piece, "bad-value", `"${w}" can't be linked to itself.`); continue; }
          if (!wordUsable(piece, linked, category, "link it to a word of the same kind.")) continue;
          const k2 = known(linked);
          if (category === "word" && k2 && k2.type && piece.type && k2.type !== piece.type && !k2.yours) refuse(piece, "link-kind", `"${linked}" is a ${k2.type} word and "${w}" a ${piece.type} one: link it to a word of the same kind.`);
          if (category === "word" && k2 && k2.yours && k2.type && piece.type && k2.type !== piece.type) refuse(piece, "link-kind", `"${linked}" is a ${k2.type} word and "${w}" a ${piece.type} one: link it to a word of the same kind.`);
        }
        break;
      }
      case "suggests":
      case "looks": {
        const table = piece.kind === "suggests" ? MOVEMENT_ELEMENTS : LOOK_ELEMENTS;
        if (piece.kind === "looks" && !on.has("appear")) refuse(piece, "needs-extension", needsSentence("How a character looks", "appear"));
        if (!wordUsable(piece, w, "word", "only a word for characters suggests how a character moves or looks.")) break;
        const e = table[piece.element];
        if (!e) { refuse(piece, "bad-element", `Ani doesn't choose "${piece.element}" for ${piece.kind === "suggests" ? "how a character moves" : "how a character looks"}.`); break; }
        if (!e.values.includes(piece.value)) refuse(piece, "bad-value", `${e.words} takes ${e.values.join(", ")}.`);
        strengthOk(piece, piece.strength);
        const key = `${w} ${piece.element}`;
        const k = known(w);
        if (elementsSaid.has(key) && k && k.yours) refuse(piece, "repeat-element", `"${w}" already suggests something for ${e.words} (${elementsSaid.get(key).id}): one suggestion an element, as Ken's words have.`);
        else elementsSaid.set(key, piece);
        if (piece.kind === "suggests" && UNREAD.includes(piece.element) && !on.has("detail")) warn(piece, "not-read", `Ani chooses ${e.words}, but in 1978 nothing that draws the film reads it, so the film won't show it.`);
        break;
      }
      case "shows": {
        if (!wordUsable(piece, w, "word", "only a word for characters is shown this way.")) break;
        if (!VERBS[piece.verb] && !verbKnown(piece.verb)) { refuse(piece, "bad-value", `Ani doesn't know the verb "${piece.verb}".`); break; }
        if (!WHO[piece.who]) refuse(piece, "bad-value", `Shown towards ${Object.keys(WHO).join(", ")}.`);
        if (VERBS[piece.verb] && VERBS[piece.verb].needs && !on.has(VERBS[piece.verb].needs) && !ways.has(piece.verb)) refuse(piece, "needs-extension", needsSentence(`${VERBS[piece.verb].words[0].toUpperCase()}${VERBS[piece.verb].words.slice(1)}`, VERBS[piece.verb].needs));
        else if (!hasWay(piece.verb)) refuse(piece, "no-way", `Ani has no way of showing "${piece.verb}" with these extensions.`);
        strengthOk(piece, piece.strength);
        break;
      }
      case "relationship-shows": {
        if (!wordUsable(piece, w, "relationship", "only a relationship is shown this way.")) break;
        if (!VERBS[piece.verb] && !verbKnown(piece.verb)) { refuse(piece, "bad-value", `Ani doesn't know the verb "${piece.verb}".`); break; }
        if (VERBS[piece.verb] && VERBS[piece.verb].needs && !on.has(VERBS[piece.verb].needs) && !ways.has(piece.verb)) refuse(piece, "needs-extension", needsSentence(`${VERBS[piece.verb].words[0].toUpperCase()}${VERBS[piece.verb].words.slice(1)}`, VERBS[piece.verb].needs));
        else if (!hasWay(piece.verb)) refuse(piece, "no-way", `Ani has no way of showing "${piece.verb}" with these extensions.`);
        if (!((piece.bestWhen || "always") in BEST_WHEN)) refuse(piece, "bad-value", `Best ${Object.keys(BEST_WHEN).join(", ")}.`);
        strengthOk(piece, piece.strength);
        break;
      }
      case "relationship-suggests": {
        if (!wordUsable(piece, w, "relationship", "only a relationship compares two characters.")) break;
        if (!RELATIVE_ELEMENTS.includes(piece.element)) refuse(piece, "bad-element", `Ani compares two characters' ${RELATIVE_ELEMENTS.join(", ")}.`);
        if (!COMPARISONS[piece.comparison]) refuse(piece, "bad-value", `The first moves ${Object.values(COMPARISONS).join(", ")} the other.`);
        strengthOk(piece, piece.strength);
        break;
      }
      case "way": {
        const v = piece.verb;
        if (!VERBS[v] && !verbKnown(v)) { refuse(piece, "bad-value", `Ani doesn't know the verb "${v}"${isWord(v) ? ": teach it the verb first" : ""}.`); break; }
        if (VERBS[v] && VERBS[v].isKnows && !on.has("know")) refuse(piece, "needs-extension", needsSentence("Following, the revival's verb,", "know"));
        const way = WAYS[piece.way];
        if (!way) { refuse(piece, "bad-value", `Ani has no way of showing called "${piece.way}".`); break; }
        if (way.needs && !on.has(way.needs)) refuse(piece, "needs-extension", needsSentence(`That way (${piece.way})`, way.needs));
        if (![1, 2].includes(piece.first || 1)) refuse(piece, "bad-value", "The way's first part is done by the verb's first character (1) or its second (2).");
        strengthOk(piece, piece.strength);
        break;
      }
      case "feeling": {
        if (!nameOk(piece, w, "a feeling")) break;
        if (mine.has(w) || earlier.has(w)) { refuse(piece, "two-notebooks", `"${w}" is taught already: a word is taught once.`); break; }
        if (vocabulary && vocabulary[w]) refuse(piece, "known-word", `Ani already knows "${w}" as a word for characters or relationships: a feeling needs a name of its own.`);
        else if (taken && taken.has(w)) refuse(piece, "name-taken", `"${w}" is already the name of something Ani knows${["joy", "pride", "anticipation", "loneliness", "fear", "anger"].includes(w) ? " (a feeling)" : ""}, so it can't be a new feeling.`);
        mine.set(w, piece);
        const changes = Array.isArray(piece.changes) ? piece.changes : [];
        if (!changes.length) refuse(piece, "bad-value", "Say at least one thing the feeling changes.");
        const seen = new Set();
        for (const c of changes) {
          const allowed = FEELING_CHANGES[c && c.element];
          if (!allowed) { refuse(piece, "bad-element", `A feeling changes ${Object.keys(FEELING_CHANGES).join(", ")}.`); continue; }
          if (!allowed.includes(c.change)) refuse(piece, "bad-value", `${c.element} can go ${allowed.join(", ")}.`);
          if (seen.has(c.element)) refuse(piece, "repeat-element", `The feeling changes ${c.element} twice.`);
          seen.add(c.element);
          strengthOk(piece, c.strength || piece.strength || "medium");
          if (JOYS[c.element] && OPPOSITE_CHANGE[JOYS[c.element]] === c.change) {
            warn(piece, "cancels-joy", `If a character feels this and joy at once, your ${c.element.replace(/-/g, " ")} ${/^(up|down)$/.test(c.change) ? "going" : "becoming"} ${c.change} and joy's ${/^(up|down)$/.test(c.change) ? "going" : "becoming"} ${JOYS[c.element]} cancel: Ken's CHOMET rejects conflicting changes rather than choose between them ("hopefully all conflicting ones are so noted for now rather than resolving them I'll reject", chomet.123:464).`);
          }
        }
        break;
      }
      case "verb": {
        if (!nameOk(piece, w, "a verb")) break;
        if (mine.has(w) || earlier.has(w)) { refuse(piece, "two-notebooks", `"${w}" is taught already: a word is taught once.`); break; }
        if (VERBS[w] || (taken && taken.has(w))) refuse(piece, "name-taken", `"${w}" is already the name of something Ani knows, so it can't be a new verb.`);
        mine.set(w, piece);
        const parent = piece.kindOf;
        if (parent !== "action" && !VERBS[parent] && !verbKnown(parent)) { refuse(piece, "bad-value", `A new verb is a kind of one of Ani's verbs (${Object.keys(VERBS).join(", ")}), or of "action".`); break; }
        if (!["parent", "ways"].includes(piece.showAs || "parent")) refuse(piece, "bad-value", "A new verb is shown as the verb it is a kind of (parent), or only by your ways of showing it (ways).");
        if ((piece.showAs || "parent") === "parent") {
          if (parent === "action") refuse(piece, "no-way", `"${w}" is a kind of action, which has no way of showing: give it ways of its own (showAs "ways").`);
          else if (VERBS[parent] && VERBS[parent].needs && !on.has(VERBS[parent].needs) && !ways.has(parent)) refuse(piece, "needs-extension", needsSentence(`Showing it as ${VERBS[parent].words}`, VERBS[parent].needs));
          else if (!hasWay(parent)) refuse(piece, "no-way", `Ani has no way of showing "${parent}" with these extensions, so "${w}" couldn't be shown as it is.`);
        } else if (!ways.has(w)) warn(piece, "no-way-yet", `"${w}" has no way of showing yet: add one (another way of showing a verb).`);
        break;
      }
    }
  }
  // words that say nothing (a word with no link and nothing it suggests)
  for (const [w, p] of mine) {
    if (p.kind !== "word" && p.kind !== "relationship") continue;
    const says = p.like || p.opposite || allPieces.some((q) => q && q.word === w && q !== p && q.kind !== "word" && q.kind !== "relationship")
      || allPieces.some((q) => q && (q.like === w || q.opposite === w));
    if (!says) warn(p, "says-nothing", `Ani will know "${w}", but it says nothing yet: link it to a word Ani knows, or say what it suggests.`);
  }
  // links that, once spread, make a word both close to and the opposite of another
  if (vocabulary) {
    const said = new Set();
    for (const c of contradictions(notebook, { vocabulary, others })) {
      if (said.has(c.piece)) continue; // one for each piece, the first
      said.add(c.piece);
      refuse(c.piece, "contradiction", c.says);
    }
  }
  return { ok: refused.length === 0, refused, warnings };
}

// The links a notebook (and those before it) writes, in order: { from, to, type, piece },
// as notebookToLisp writes them, (ask mean add grumpy to your list of neighbors).
export function notebookLinks(notebook) {
  const out = [];
  for (const p of (notebook && notebook.pieces) || []) {
    if (p.kind !== "word" && p.kind !== "relationship") continue;
    if (p.like) out.push({ from: p.like, to: p.word, type: "neighbors", piece: p });
    if (p.opposite) out.push({ from: p.opposite, to: p.word, type: "opposites", piece: p });
  }
  return out;
}

// DESCRIPTOR's spreading (char.2:111-131), as tools/know-index.mjs spreadLinks does it,
// on a net that starts as the vocabulary has it (its lists as spread already).
function spread(net, links) {
  const node = (w) => (net[w] ||= { neighbors: [], opposites: [] });
  function addOpposite(self, d) {
    const me = node(self);
    if (me.opposites.includes(d) || d === self) return;
    me.opposites = [d, ...me.opposites];
    node(d);
    addOpposite(d, self);
    for (const n of [...me.neighbors]) addOpposite(n, d);
  }
  function addNeighbor(self, d) {
    const me = node(self);
    if (me.neighbors.includes(d) || d === self) return;
    me.neighbors = [d, ...me.neighbors];
    node(d);
    addNeighbor(d, self);
    for (const n of [...me.neighbors]) addNeighbor(n, d);
    for (const o of [...me.opposites]) addOpposite(o, d);
  }
  for (const l of links) (l.type === "opposites" ? addOpposite : addNeighbor)(l.from, l.to);
  return net;
}

// The links as they will be once the notebook's are spread: { word: { neighbors, opposites } }
// for the vocabulary's words and the notebooks'.
export function spreadNotebookLinks(notebooks, vocabulary) {
  const net = {};
  for (const [w, v] of Object.entries(vocabulary || {})) net[w] = { neighbors: [...(v.neighbors || [])], opposites: [...(v.opposites || [])] };
  return spread(net, notebooks.flatMap(notebookLinks));
}

// The words a notebook's links leave both close to and opposite to another, each with
// the chain of links that did it, as { piece, word, other, says }.
export function contradictions(notebook, { vocabulary, others = [] }) {
  const before = spreadNotebookLinks(others, vocabulary);
  const after = spreadNotebookLinks([...others, notebook], vocabulary);
  const out = [];
  const reported = new Set();
  const links = notebookLinks(notebook);
  // the written links, both ways, for the chain: Ken's and the revival's as the
  // vocabulary's spread lists have them, and the notebooks'
  const edges = new Map();
  const edge = (a, b, type, by) => { (edges.get(a) || edges.set(a, []).get(a)).push({ to: b, odd: type === "opposites", by }); };
  for (const [w, v] of Object.entries(vocabulary || {})) {
    for (const n of v.neighbors || []) edge(w, n, "neighbors", "Ani's");
    for (const o of v.opposites || []) edge(w, o, "opposites", "Ani's");
  }
  for (const l of [...others.flatMap(notebookLinks), ...links]) {
    const by = links.includes(l) ? `yours, ${l.piece.id}` : "an earlier notebook's";
    edge(l.from, l.to, l.type, by);
    edge(l.to, l.from, l.type, by);
  }
  const chain = (from, to, odd) => {
    // breadth first over (word, parity), the first path that reaches to with that parity
    const start = `${from} 0`;
    const prev = new Map([[start, null]]);
    const queue = [[from, 0]];
    while (queue.length) {
      const [w, p] = queue.shift();
      if (w === to && p === odd) break;
      for (const e of edges.get(w) || []) {
        const key = `${e.to} ${p ^ (e.odd ? 1 : 0)}`;
        if (prev.has(key)) continue;
        prev.set(key, { from: `${w} ${p}`, e, w });
        queue.push([e.to, p ^ (e.odd ? 1 : 0)]);
      }
    }
    const steps = [];
    for (let key = `${to} ${odd}`; prev.get(key); key = prev.get(key).from) {
      const { e, w } = prev.get(key);
      steps.unshift(`${w} is ${e.odd ? "the opposite of" : "close to"} ${e.to} (${e.by})`);
    }
    return steps;
  };
  // the notebook's own words first
  const own = new Set(links.map((l) => l.to));
  for (const [w, v] of Object.entries(after).sort(([a], [b]) => Number(own.has(b)) - Number(own.has(a)))) {
    const both = v.neighbors.filter((x) => v.opposites.includes(x));
    for (const x of both) {
      const was = before[w] && before[w].neighbors.includes(x) && before[w].opposites.includes(x);
      if (was) continue;
      const key = [w, x].sort().join(" ");
      if (reported.has(key)) continue;
      reported.add(key);
      const near = chain(w, x, 0), far = chain(w, x, 1);
      const piece = links.find((l) => near.concat(far).some((s) => s.includes(`yours, ${l.piece.id}`)))?.piece || links[0]?.piece || null;
      out.push({ piece, word: w, other: x, says: `Because Ani spreads links to the neighbors' neighbors and the opposites' opposites (Ken's DESCRIPTOR, char.2:111-131), "${w}" would be both close to and the opposite of "${x}": ${near.join(", then ")}; but ${far.join(", then ")}.` });
    }
  }
  return out;
}

// ---------------------------------------------------------------- the Lisp

// Whether a piece is one notebookToLisp can write: its kind known, its names words, its
// values those the forms offer, its id a short name.
export function wellFormed(p) {
  if (!p || typeof p !== "object" || !/^[A-Za-z0-9-]{1,20}$/.test(String(p.id || ""))) return false;
  const word = (x) => isWord(x);
  const strength = (x) => STRENGTHS.includes(x);
  const verb = (x) => word(x);
  switch (p.kind) {
    case "word": return word(p.word) && Boolean(WORD_TYPES[p.type]) && (!p.like || word(p.like)) && (!p.opposite || word(p.opposite));
    case "relationship": return word(p.word) && Boolean(RELATIONSHIP_TYPES[p.type]) && (!p.like || word(p.like)) && (!p.opposite || word(p.opposite));
    case "suggests": return word(p.word) && Boolean(MOVEMENT_ELEMENTS[p.element]) && MOVEMENT_ELEMENTS[p.element].values.includes(p.value) && strength(p.strength);
    case "looks": return word(p.word) && Boolean(LOOK_ELEMENTS[p.element]) && LOOK_ELEMENTS[p.element].values.includes(p.value) && strength(p.strength);
    case "shows": return word(p.word) && verb(p.verb) && Boolean(WHO[p.who]) && strength(p.strength);
    case "relationship-shows": return word(p.word) && verb(p.verb) && (p.bestWhen || "always") in BEST_WHEN && strength(p.strength);
    case "relationship-suggests": return word(p.word) && RELATIVE_ELEMENTS.includes(p.element) && Boolean(COMPARISONS[p.comparison]) && strength(p.strength);
    case "way": return verb(p.verb) && Boolean(WAYS[p.way]) && [1, 2].includes(p.first || 1) && strength(p.strength);
    case "feeling": return word(p.word) && Array.isArray(p.changes) && p.changes.length > 0
      && p.changes.every((c) => c && FEELING_CHANGES[c.element] && FEELING_CHANGES[c.element].includes(c.change) && strength(c.strength || p.strength || "medium"));
    case "verb": return word(p.word) && (p.kindOf === "action" || verb(p.kindOf)) && ["parent", "ways"].includes(p.showAs || "parent");
    default: return false;
  }
}

// A reason as a ;;yours line's text: one line.
const reasonLine = (p) => clean(p.because);
// A reason inside |...|, as APSUG's evidence: / and | escaped as MacLisp reads them.
const barred = (s) => `|${clean(s).replace(/\//g, "//").replace(/\|/g, "/|")}|`;
const roleOf = (verb, k) => (VERBS[verb] ? VERBS[verb].roles[k] : ["one", "other"][k]);

// A word's (for ...) clauses, as DSCRP's process suggestions takes them (dscrp.17:62-74).
function forClause(piece, word) {
  if (piece.kind === "suggests") return `(for ${piece.element} ${piece.value} strength ${piece.strength})`;
  if (piece.kind === "shows") {
    return `(for (establish ?character ${word})
	       '(method: type convey
			 value (bind ((other
				       (character-that-satisfies
					(${WHO[piece.who]} ,character nil))))
				     (${piece.verb} ,character \`other)))
	       strength '${piece.strength})`;
  }
  if (piece.kind === "relationship-shows") {
    const best = BEST_WHEN[piece.bestWhen || "always"];
    return `(for (establish (${word} ?character ?other-character))
	       '(method: type convey
			 value (${piece.verb} ,character ,other-character)${best ? `
			 best-when ${best}` : ""})
	       strength '${piece.strength})`;
  }
  if (piece.kind === "relationship-suggests") return `(for (relative-${piece.element} ? ?)
	       '${piece.comparison}
	       strength '${piece.strength})`;
  return null;
}

// A feeling's (for ...) clauses, as KNOWEM writes them after Ken's joy (emote.9:11-72).
function feelingClause(word, c, strength) {
  const pattern = `(establish (emotional-state ?character (${word} {a-felt-level? ?level})))`;
  const change = c.change;
  const value = change === "up" || change === "down"
    ? `(change: element (,character ${c.element})
					amount (${change === "up" ? "positive" : "negative"} ,(felt-level level))
					speed ,(felt-level level))`
    : `(change-to: element (,character ${c.element})
					   new-value ${change === "curved" ? "high" : change === "straight" ? "low" : change}
					   speed ,(felt-level level))`;
  return `(for ${pattern}
	       '(method: type display-value-change
			 value ${value})
	       strength '${c.strength || strength || "medium"})`;
}

// A notebook in Ken's notation: the file YOURS;N<n> KNOW. extensions: those it is loaded
// with (a look is written only with APPEAR). Every line that isn't a piece says what it
// is for, in a ;;; comment, so that nothing in it is unexplained (Ken's rule for the glass
// box); each piece has its ;;yours line, the learner's own reason, above it. The same
// notebook gives the same file every time.
export function notebookToLisp(notebook, { n = 1, extensions = [] } = {}) {
  const all = (notebook && notebook.pieces) || [];
  // only pieces Ani can read are written: a name that isn't a word, or a value that isn't
  // one of those the forms offer, would stop Lisp's reader (checkNotebook refuses them)
  const pieces = all.filter(wellFormed);
  const left = all.filter((p) => !wellFormed(p));
  const looks = extensions.includes("appear");
  const title = clean(notebook && notebook.title) || "your knowledge";
  const out = [];
  out.push(`;;; -*-lisp-*-
;;; YOURS;N${n} KNOW: "${title.replace(/"/g, "'")}", knowledge taught to Ani on the film page (Teach Ani).
;;; Written from the notebook's pieces by src/teach.js notebookToLisp, in Ken's own
;;; notation: words as his DSCRP writes them, relationships as RELATE, verbs as CONVEY,
;;; feelings as EMOTE. Each ";;yours" line is the learner's own reason for the piece
;;; under it. REVIVE;TEACH loads this file; nothing in it removes or weakens Ken's
;;; knowledge, and nothing in it is loaded unless a film is made with it.`);
  if (left.length) out.push(`;;; Left out, as not pieces Ani can read: ${left.map((p) => (p && /^[A-Za-z0-9-]{1,20}$/.test(String(p.id)) ? p.id : "a piece")).join(", ")}.`);
  if (!pieces.length) {
    out.push(";;; This notebook has no pieces yet, so this file teaches Ani nothing.");
    return out.join("\n\n") + "\n";
  }
  const isNew = (kind) => (w) => pieces.some((p) => p.kind === kind && p.word === w);
  const newWord = isNew("word"), newRelationship = isNew("relationship");
  const yours = (p) => `;;yours ${p.id}: ${reasonLine(p)}`;

  // ---- words for characters, in DSCRP's hook
  const words = [];
  const wordLinks = [];
  const looksLines = [];
  const definedWords = [];
  for (const p of pieces) {
    if (p.kind === "word") {
      const own = pieces.filter((q) => q.word === p.word && (q.kind === "suggests" || q.kind === "shows"));
      const lines = [yours(p), ...own.map(yours)];
      const clauses = own.map((q) => forClause(q, p.word));
      lines.push(clauses.length ? `(define ${p.word} ${WORD_TYPES[p.type]}
 (process suggestions
	  ${clauses.join("\n\t  ")}))` : `(define ${p.word} ${WORD_TYPES[p.type]})`);
      words.push(lines.join("\n"));
      definedWords.push(p.word);
      if (p.like) wordLinks.push(`${yours(p)}\n (ask ${p.like} add ${p.word} to your list of neighbors)`);
      if (p.opposite) wordLinks.push(`${yours(p)}\n (ask ${p.opposite} add ${p.word} to your list of opposites)`);
    } else if ((p.kind === "suggests" || p.kind === "shows") && !newWord(p.word)) {
      // a word Ani already knows, Ken's or the revival's: added to as KNOWRL adds to Ken's
      // words, never defined again (a define would replace it)
      words.push(`${yours(p)}
(uncompiled-ask ${p.word} process suggestions
		${forClause(p, p.word).replace(/\n\t/g, "\n\t\t")})`);
    } else if (p.kind === "looks") {
      const entry = `(teach-appearance '((${p.word} ${p.element} ${p.value} ${p.strength} (yours n${n} ${p.id} ${barred(p.because)}))))`;
      looksLines.push(looks ? `${yours(p)}\n${entry}` : `${yours(p)}\n;;;   (not loaded: Ani chooses how its characters look only with APPEAR, which is off)`);
    }
  }
  if (words.length || wordLinks.length || looksLines.length) {
    const body = [...words, ...looksLines];
    if (wordLinks.length) body.push(`;;; The links, as Ken's are written at the end of DSCRP (dscrp.17:273-295). Ani
;;; spreads each to the neighbors' neighbors and the opposites' opposites (char.2:111-131).
(progn
${wordLinks.join("\n")})`);
    out.push(`;;; Your words for characters, and what words suggest, written as Ken's DSCRP writes
;;; his (dscrp.17:49-295). This function holds them; the line after it waits until Ani
;;; has read Ken's words (DSCRP), then teaches yours, once.${looksLines.length && looks ? `
;;; A look is sent through APPEAR's own teach-appearance (REVIVE;APSUG), with your
;;; reason as its evidence.` : ""}
(defun teach-yours-n${n}-words ()
  (let ((:insert-methods-at-end nil))

${body.join("\n\n")}))

(+after-load '|ken;dscrp >| '(revival-once 'yours-n${n}-words 'teach-yours-n${n}-words))`);
  }

  // ---- relationships, in RELATE's hook
  const rels = [];
  const relLinks = [];
  const definedRelationships = [];
  for (const p of pieces) {
    if (p.kind === "relationship") {
      const own = pieces.filter((q) => q.word === p.word && (q.kind === "relationship-shows" || q.kind === "relationship-suggests"));
      const clauses = own.map((q) => forClause(q, p.word));
      rels.push([yours(p), ...own.map(yours), clauses.length ? `(define ${p.word} ${RELATIONSHIP_TYPES[p.type]}
 (process suggestions
	  ${clauses.join("\n\t  ")}))` : `(define ${p.word} ${RELATIONSHIP_TYPES[p.type]})`].join("\n"));
      definedRelationships.push(p.word);
      if (p.like) relLinks.push(`${yours(p)}\n (uncompiled-ask ${p.like} add ${p.word} to your list of neighbors)`);
      if (p.opposite) relLinks.push(`${yours(p)}\n (uncompiled-ask ${p.opposite} add ${p.word} to your list of opposites)`);
    } else if ((p.kind === "relationship-shows" || p.kind === "relationship-suggests") && !newRelationship(p.word)) {
      rels.push(`${yours(p)}
(uncompiled-ask ${p.word} process suggestions
		${forClause(p, p.word).replace(/\n\t/g, "\n\t\t")})`);
    }
  }
  if (rels.length || relLinks.length) {
    const body = [...rels];
    if (relLinks.length) body.push(`;;; The links, as Ken's are written at the end of RELATE (relate.22:106-114).
(progn
${relLinks.join("\n")})`);
    out.push(`;;; Your words for how one character is to another, written as Ken's RELATE writes his
;;; (relate.22:20-102). This function holds them; the line after it waits until Ani has
;;; read Ken's relationships (RELATE), then teaches yours, once.
(defun teach-yours-n${n}-relationships ()
  (let ((:insert-methods-at-end nil))

${body.join("\n\n")}))

(+after-load '|ken;relate >| '(revival-once 'yours-n${n}-relationships 'teach-yours-n${n}-relationships))`);
  }

  // ---- verbs, in CONVEY's hook
  const verbs = [];
  const definedVerbs = [];
  for (const p of pieces.filter((q) => q.kind === "verb")) {
    definedVerbs.push(p.word);
    const parent = p.kindOf;
    const lines = [yours(p), `(define ${p.word} ${parent})`];
    if ((p.showAs || "parent") === "parent") {
      const [a, b] = ["one", "other"];
      lines.push(`;;; shown as ${parent} is shown: a task (convey (${p.word} x y)) is conveyed as (${parent} x y)
(define-receiver (yield suggestions for {and ?task (convey (${p.word} ?${a} ?${b}))}) ${p.word}
 '((suggestion: element ,task
		value (method: type convey
			       value (${parent} ,${a} ,${b}))
		strength high
		source ${p.word})))`);
    }
    verbs.push(lines.join("\n"));
  }
  if (verbs.length) {
    out.push(`;;; Your verbs, written as Ken's CONVEY writes his (convey.64:60-125): each is a kind
;;; of one of Ani's verbs, as chasing is a kind of moving, (define chases moves)
;;; (convey.64:100), and takes its prerequisites. This function holds them; the line after
;;; it waits until Ani has read Ken's verbs (CONVEY), then teaches yours, once.
(defun teach-yours-n${n}-verbs ()
  (let ((:insert-methods-at-end nil))

${verbs.join("\n\n")}))

(+after-load '|ken;convey >| '(revival-once 'yours-n${n}-verbs 'teach-yours-n${n}-verbs))`);
  }

  // ---- other ways of showing a verb, through REVIVE;TEACH's also-show
  const ways = pieces.filter((p) => p.kind === "way");
  if (ways.length) {
    out.push(`;;; Other ways of showing a verb. REVIVE;TEACH's also-show adds each beside Ken's ways
;;; (and the revival's), never in place of them, where SUGCON asks a verb for its ways
;;; (sugcon.26:57); Ani's CHOMET then chooses among them all, so yours can lose.
${ways.map((p) => {
      const roles = [roleOf(p.verb, 0), roleOf(p.verb, 1)];
      const [one, two] = (p.first || 1) === 2 ? [roles[1], roles[0]] : roles;
      return `${yours(p)}
(also-show ${p.verb} (${roles.join(" ")})
	   ${WAYS[p.way].form.replace(/\$1/g, one).replace(/\$2/g, two)}
	   ${p.strength})`;
    }).join("\n\n")}`);
  }

  // ---- feelings, in EMOTE's hook
  const feelings = pieces.filter((p) => p.kind === "feeling");
  if (feelings.length) {
    out.push(`;;; Your feelings, written as Ken's joy is (emote.9:11-72) and the revival's are
;;; (REVIVE;KNOWEM): each changes how a character moves by as much as the feeling, at the
;;; feeling's speed. a-felt-level? and felt-level are KNOWEM's (or REVIVE;TEACH's copies):
;;; a feeling is felt at (positive low), medium or high, or plainly low, medium or high.
;;; This function holds them; the line after it waits until Ani has read Ken's feelings
;;; (EMOTE), then teaches yours, once.
(defun teach-yours-n${n}-feelings ()
  (let ((:insert-methods-at-end nil))

${feelings.map((p) => `${yours(p)}
(define ${p.word} emotion
 (process suggestions
	  ${p.changes.map((c) => feelingClause(p.word, c, p.strength)).join("\n\t  ")}))`).join("\n\n")}))

(+after-load '|ken;emote >| '(revival-once 'yours-n${n}-feelings 'teach-yours-n${n}-feelings))`);
  }

  // ---- the tags
  const tags = [["|KEN;DSCRP|", definedWords], ["|KEN;RELATE|", definedRelationships], ["|KEN;CONVEY|", definedVerbs], ["|KEN;EMOTE|", feelings.map((p) => p.word)]].filter(([, ws]) => ws.length);
  if (tags.length) {
    out.push(`;;; These lines tell Ani which of Ken's files each of your new words belongs with, so
;;; that Ani knows it exists before that file has loaded, and asking it loads the file.
${tags.map(([file, ws]) => `(mapc (function (lambda (word) (putprop word '${file} 'actor-load))) '(${ws.join(" ")}))`).join("\n")}`);
  }
  return out.join("\n\n") + "\n";
}

// ---------------------------------------------------------------- the index

// "Your knowledge", for the glass box: an index in the shape of the page's DATA.know
// (tools/know-index.mjs), so that the page's badge code finds a learner's knowledge as it
// finds the revival's, each entry with { notebook, piece, because } (notebook its number,
// from 1, and title) in place of { file, line, why }:
//   notebooks  [{ n, title, pieces }]
//   words      { grumpy: { kind: "personality", like?, opposite?, suggests?, establishes?, ... } }
//              the learner's words for characters and relationships (kind "relationship")
//   knowledge  [{ source, element, value, strength, ... }] one entry for each suggestion a
//              piece gives a word, the learner's or Ani's (as DATA.know.knowledge): element
//              a dynamics element, a look's (looks: true), "establish" with its verb and
//              through (enemy-of ...) for a way of showing it, or a relative element
//              ("relative-speed") with value the comparison; for a feeling, one for each
//              change, feeling: true, value "(positive level)" or the new value
//   verbs      { helps: { ways: [{ method, value, strength, first, ... }], method }, teases:
//              { isNew: true, kindOf: "chases", showAs, ... } }
//   feelings   { grumpiness: { changes: [{ element, change, strength }], ... } }
//   links      [{ from, to, type: "neighbors" | "opposites", ... }] as written
//   vocabulary { word: { kind, yours: true, notebook, piece, ... } } the learner's words, for
//              the editor's chips (beside DATA.words / DATA.know.vocabulary)
export function yoursIndex(notebooks = []) {
  const index = { notebooks: [], words: {}, knowledge: [], verbs: {}, feelings: {}, links: [], vocabulary: {} };
  notebooks.forEach((nb, k) => {
    const n = k + 1;
    const title = clean(nb && nb.title) || `notebook ${n}`;
    index.notebooks.push({ n, title, pieces: ((nb && nb.pieces) || []).length });
    for (const p of (nb && nb.pieces) || []) {
      const at = { notebook: n, title, piece: p.id, because: clean(p.because) };
      switch (p.kind) {
        case "word":
        case "relationship":
          index.words[p.word] = { kind: p.kind === "word" ? p.type : "relationship", ...(p.kind === "relationship" ? { type: p.type } : {}), ...(p.like ? { like: p.like } : {}), ...(p.opposite ? { opposite: p.opposite } : {}), ...at };
          index.vocabulary[p.word] = { kind: p.kind === "word" ? p.type : "relationship", yours: true, ...at };
          if (p.like) index.links.push({ from: p.like, to: p.word, type: "neighbors", ...at });
          if (p.opposite) index.links.push({ from: p.opposite, to: p.word, type: "opposites", ...at });
          break;
        case "suggests":
          index.knowledge.push({ source: p.word, element: p.element, value: p.value, strength: p.strength, ...at });
          break;
        case "looks":
          index.knowledge.push({ source: p.word, element: p.element, value: p.value, strength: p.strength, looks: true, ...at });
          break;
        case "shows":
          index.knowledge.push({ source: p.word, element: "establish", verb: p.verb, through: WHO[p.who], value: `(${p.verb} ${WHO[p.who]})`, strength: p.strength, ...at });
          break;
        case "relationship-shows":
          index.knowledge.push({ source: p.word, element: "establish", verb: p.verb, value: `(${p.verb})`, strength: p.strength, bestWhen: p.bestWhen || "always", ...at });
          break;
        case "relationship-suggests":
          index.knowledge.push({ source: p.word, element: `relative-${p.element}`, value: p.comparison, strength: p.strength, ...at });
          break;
        case "way": {
          const v = (index.verbs[p.verb] ||= { ways: [] });
          v.ways ||= [];
          const roles = [roleOf(p.verb, 0), roleOf(p.verb, 1)];
          const [one, two] = (p.first || 1) === 2 ? [roles[1], roles[0]] : roles;
          v.ways.push({ method: p.way, value: WAYS[p.way] ? WAYS[p.way].form.replace(/\$1/g, one).replace(/\$2/g, two) : null, strength: p.strength, first: p.first || 1, ...at });
          if (!v.method) v.method = p.way;
          break;
        }
        case "feeling":
          index.feelings[p.word] = { changes: (p.changes || []).map((c) => ({ element: c.element, change: c.change, strength: c.strength || p.strength || "medium" })), ...at };
          for (const c of p.changes || []) {
            index.knowledge.push({ source: p.word, element: c.element, value: c.change === "up" ? "(positive level)" : c.change === "down" ? "(negative level)" : c.change === "curved" ? "high" : c.change === "straight" ? "low" : c.change, strength: c.strength || p.strength || "medium", feeling: true, change: c.change, ...at });
          }
          break;
        case "verb":
          index.verbs[p.word] = { ...(index.verbs[p.word] || {}), isNew: true, kindOf: p.kindOf, showAs: p.showAs || "parent", ...at };
          index.vocabulary[p.word] = { kind: "verb", yours: true, ...at };
          break;
      }
    }
  });
  return index;
}

// ---------------------------------------------------------------- plain words

const say = (x) => String(x).replace(/-/g, " ");
const valueWords = (element, value) => {
  const m = /^\((positive|negative) (low|medium|high)\)$/.exec(value);
  if (m) return `${m[1] === "positive" ? "drawn" : "kept away"} ${{ low: "a little", medium: "somewhat", high: "strongly" }[m[2]]}`;
  const not = /^\(not (low|high)\)$/.exec(value);
  if (not) return `not ${not[1]}`;
  return say(value);
};
// A piece in plain words, one line, as the panel lists it.
export function pieceWords(p) {
  switch (p.kind) {
    case "word": return `"${p.word}" is a word for what a character is ${p.type === "physical" ? "like to look at" : p.type === "movement" ? "like in how it moves" : "like inside"}${p.like ? `, and means much the same as "${p.like}"` : p.opposite ? `, and is the opposite of "${p.opposite}"` : ""}.`;
    case "suggests": return `A ${p.word} character's ${MOVEMENT_ELEMENTS[p.element] ? MOVEMENT_ELEMENTS[p.element].words : say(p.element)} is ${valueWords(p.element, p.value)}, ${p.strength === "high" ? "strongly" : p.strength === "low" ? "weakly" : "medium strongly"}.`;
    case "looks": return `A ${p.word} character's ${LOOK_ELEMENTS[p.element] ? LOOK_ELEMENTS[p.element].words : say(p.element)} is ${say(p.value)}, ${p.strength === "high" ? "strongly" : p.strength === "low" ? "weakly" : "medium strongly"}.`;
    case "shows": return `A ${p.word} character shows it by ${VERBS[p.verb] ? VERBS[p.verb].words : say(p.verb)} ${p.who === "enemy" ? "an enemy" : p.who === "friend" ? "a friend" : "a stranger"}, ${p.strength === "high" ? "strongly" : p.strength === "low" ? "weakly" : "medium strongly"}.`;
    case "relationship": return `"${p.word}" is a way one character can be to another, about ${p.type === "domination" ? "who is in charge" : "liking and disliking"}${p.like ? `, much the same as "${p.like}"` : p.opposite ? `, the opposite of "${p.opposite}"` : ""}.`;
    case "relationship-shows": return `One who ${say(p.word)} another shows it by ${VERBS[p.verb] ? VERBS[p.verb].words : say(p.verb)} it, ${p.strength === "high" ? "strongly" : p.strength === "low" ? "weakly" : "medium strongly"}${{ always: "", "in-charge": ", best when it is in charge", "not-in-charge": ", best when it is not in charge", dislikes: ", best when it doesn't like the other" }[p.bestWhen || "always"]}.`;
    case "relationship-suggests": return `One who ${say(p.word)} another moves with ${say(p.element)} ${COMPARISONS[p.comparison] || say(p.comparison)} the other's, ${p.strength === "high" ? "strongly" : p.strength === "low" ? "weakly" : "medium strongly"}.`;
    case "way": return `${VERBS[p.verb] ? VERBS[p.verb].words[0].toUpperCase() + VERBS[p.verb].words.slice(1) : `"${p.verb}"`} can also look like this: the ${(p.first || 1) === 2 ? "second" : "first"} one ${WAYS[p.way] ? WAYS[p.way].words : say(p.way)}, ${p.strength === "high" ? "strongly" : p.strength === "low" ? "weakly" : "medium strongly"}.`;
    case "feeling": return `"${p.word}" is a feeling: ${(p.changes || []).map((c) => `${say(c.element)} ${c.change === "up" || c.change === "down" ? `goes ${c.change}` : `becomes ${c.change}`}`).join("; ")}.`;
    case "verb": return `"${p.word}" is a kind of ${say(p.kindOf)}${(p.showAs || "parent") === "parent" ? `, shown as ${say(p.kindOf)} is shown` : ", shown by your ways of showing it"}.`;
    default: return String(p.kind);
  }
}

// Ken's legitimacy rule, put to the learner as a question at "Add to Ani" (design section
// 5; his p. 189), for a piece about word.
export function legitimacyQuestion(word) {
  return `Would this be true of any ${word} character, in any story? Ken's rule for himself was to add only knowledge that was missing, never to arrange for Ani to make the film he wanted.`;
}

// ---------------------------------------------------------------- the rehearsal

// A two-character, one-scene story that uses a piece (design section 5, "Try it on a
// little story"), for src/pipeline.js rehearse: "first-one" and "second-one", the scene
// "rehearsal". The piece's word is given to the first; a way of showing a word towards an
// enemy has the second hate the first, towards a friend love it, towards a stranger
// nothing between them. type: the word's type (personality, physical or movement), for a
// piece that adds to a word (a word piece has its own; personality by default). Returns
// { text, scene, first, second }.
export function rehearsalStory(piece, { type = null } = {}) {
  const first = "first-one", second = "second-one";
  const desc = { [first]: { personality: "good" }, [second]: { personality: "good" } };
  const rel = {}; // `${a} ${b}` -> words
  let task;
  switch (piece.kind) {
    case "word": case "suggests": case "looks": case "shows": {
      const kind = piece.type || (WORD_TYPES[type] ? type : "personality");
      desc[first] = { [kind]: piece.word };
      if (kind !== "personality") desc[first].personality = "good";
      if (piece.kind === "shows" && piece.who === "enemy") rel[`${second} ${first}`] = "hates";
      if (piece.kind === "shows" && piece.who === "friend") rel[`${first} ${second}`] = "loves";
      task = `(establish (personality ${first}))`;
      break;
    }
    case "relationship": case "relationship-shows": case "relationship-suggests":
      rel[`${first} ${second}`] = piece.word;
      task = `(establish (relationship (relationship-of ${first} ${second})))`;
      break;
    case "way":
      task = `(convey (${piece.verb} ${first} ${second}))`;
      break;
    case "verb":
      task = `(convey (${piece.word} ${first} ${second}))`;
      break;
    case "feeling":
      task = `(establish (emotional-state ${first} (${piece.word} (positive medium))))`;
      break;
    default:
      throw new Error(`no rehearsal for a piece of the kind ${piece.kind}`);
  }
  const character = (name) => `(define ${name} character
	(process initial description
		 ${Object.entries(desc[name]).map(([k, v]) => `(${k} ${v})`).join("\n\t\t ")}${name === first ? "\n\t\t (role-in-story most-important)" : ""}))`;
  const relationships = Object.entries(rel).map(([pair, w]) => `(define (relationship-of ${pair}) relationship
	(process initial description
		 ${w}))`);
  const text = `;; -*-lisp-*-
;; cast: ${first} = the first one (it); ${second} = the second one (it)
;; scenes: rehearsal = Rehearsal
;; A rehearsal of a learner's piece ${piece.id || ""} (src/teach.js rehearsalStory).

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

${character(first)}

${character(second)}

${relationships.join("\n\n")}${relationships.length ? "\n\n" : ""}(define rehearsal scene
	(process initial description
		 ${task})
	(set your rhythm to normal)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define rehearsal-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
	(set your film-length to (interval (minutes 1) (minutes 2)))
	(set your level of rhythm to high)
	(set your mood to scene-dependent)
	(set your level of coherence to high)
	(set your level of obviousness to high)
	(set your level of flashiness to low)
	(set your level of energy to high)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to
      (${first} ${second})))

(compile-actors)
`;
  return { text, scene: "rehearsal", first, second };
}
