// Teach Ani (REVIVE;TEACH, src/teach.js; reports/chapter-x/design-teaching.md): a
// learner's notebook of knowledge, written in Ken's notation and loaded into Ani. These
// check, fast, the notebook's Lisp (byte for byte against test/teach/), that every
// generated file loads with and without KNOW and APPEAR and only adds to Ani's knowledge,
// the checks (each refusal with its sentence), the wrapper on SUGCON's
// gather-convey-suggestions, the index of "your knowledge", and Ani's trial job. Films
// made with notebooks are checked end to end by tools/check-teach.mjs; Ani with TEACH
// and an empty notebook by tools/check-1978.mjs --extensions teach --knowledge
// reports/ext/teach/empty.ani-knowledge.json.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { EXTENSIONS, extensionsFor, withTeach, boot, checkKnowledge, makeFilm, storyOutline, yourKnowledgeDid } from "../src/pipeline.js";
import { notebookToLisp, checkNotebook, yoursIndex, contradictions, wellFormed, pieceWords, rehearsalStory, legitimacyQuestion, PIECE_KINDS, MAX_NOTEBOOKS } from "../src/teach.js";

const read = (path) => readFileSync(path, "utf8");
const ALL = JSON.parse(read("test/teach/all-kinds.ani-knowledge.json"));
const EMPTY = JSON.parse(read("reports/ext/teach/empty.ani-knowledge.json"));
const notebook = (pieces, title = "a test notebook") => ({ format: "ani-knowledge", version: 1, title, pieces });
const lisp = (extensions, knowledge = null) => {
  const L = boot(makeProjectFileSystem(), { extensions, ...(knowledge ? { knowledge } : {}) });
  const run = (src) => L.print(L.evalString(src)).toLowerCase();
  return { L, run };
};
const loadKen = (run) => { for (const f of ["dscrp", "relate", "convey", "emote", "sugcon", "prereq"]) run(`(load '|ken;${f} >|)`); };
const codes = (r) => r.refused.map((x) => `${x.piece} ${x.code}`);

test("the registry: TEACH is on demand, in a group of its own, requires MEND only, and changes nothing of 1978", () => {
  const e = EXTENSIONS.find((x) => x.id === "teach");
  assert.equal(e.group, "yours");
  assert.equal(e.onDemand, true);
  assert.equal(e.optIn, undefined);
  assert.deepEqual(e.files, ["wrap", "teach"]);
  assert.deepEqual(e.requires, ["mend"]);
  assert.equal(e.changes1978, false);
  assert.equal(EXTENSIONS[EXTENSIONS.length - 1].id, "teach");
  assert.deepEqual(extensionsFor(withTeach([])).map((x) => x.id), ["mend", "teach"]);
  assert.deepEqual(withTeach(["know", "teach"]), ["know", "teach"]);
  assert.ok(PIECE_KINDS.length === 10 && MAX_NOTEBOOKS === 4);
});

test("notebookToLisp writes each kind in Ken's notation, the same every time (test/teach/)", () => {
  assert.equal(notebookToLisp(ALL, { n: 1, extensions: ["mend", "know", "appear", "teach"] }), read("test/teach/all-kinds.lisp"));
  // without APPEAR the look is a comment, not a call
  assert.equal(notebookToLisp(ALL, { n: 2, extensions: ["mend", "teach"] }), read("test/teach/all-kinds-mend.lisp"));
  const text = read("test/teach/all-kinds.lisp");
  // never a define of a word Ani knows: shy and is-polite-to are added to
  assert.match(text, /\n\(uncompiled-ask shy process suggestions\n/);
  assert.match(text, /\n\(uncompiled-ask is-polite-to process suggestions\n/);
  assert.doesNotMatch(text, /\n\(define (shy|mean|is-polite-to|helps|chases) /);
  // every piece has its ;;yours line, the learner's reason
  for (const p of ALL.pieces) assert.ok(text.includes(`;;yours ${p.id}: `), p.id);
  // every line that isn't a piece is explained: each top-level form is preceded by a ;;; comment
  const forms = text.split("\n").filter((l) => /^\((defun|\+after-load|mapc|also-show)/.test(l));
  assert.ok(forms.length >= 10);
  for (const block of text.split("\n\n").filter((b) => /^\((defun|mapc)/m.test(b) && !/^;;yours/.test(b))) assert.match(block, /^;;; /, block.slice(0, 60));
  // an empty notebook teaches nothing
  assert.equal(notebookToLisp(EMPTY), `;;; -*-lisp-*-\n;;; YOURS;N1 KNOW: "An empty notebook", knowledge taught to Ani on the film page (Teach Ani).\n${notebookToLisp(EMPTY).split("\n").slice(2).join("\n")}`);
  assert.match(notebookToLisp(EMPTY), /This notebook has no pieces yet, so this file teaches Ani nothing\.\n$/);
  // a piece Ani can't read is left out, never written
  const bad = notebook([{ id: "k1", kind: "word", word: "Grumpy!)", type: "personality", because: "x" }, { id: "k2", kind: "suggests", word: "mean", element: "speed", value: "fast)", strength: "high", because: "x" }]);
  assert.ok(!wellFormed(bad.pieces[0]) && !wellFormed(bad.pieces[1]));
  assert.match(notebookToLisp(bad), /Left out, as not pieces Ani can read: k1, k2\./);
  assert.doesNotMatch(notebookToLisp(bad), /Grumpy|fast/);
});

test("every generated file loads with no break, with and without KNOW and APPEAR, and Ani hears every piece", () => {
  for (const extensions of [["mend"], ["mend", "know"], ["mend", "appear"], ["mend", "know", "appear"]]) {
    const { run } = lisp(extensions, [ALL]);
    loadKen(run);
    assert.equal(run("(exists? 'grumpy)") !== "nil", true, extensions.join());
    assert.equal(run("(ask grumpy recall your type)"), "personality");
    assert.equal(run("(ask is-jealous-of recall your type)"), "affection");
    assert.equal(run("(ask teases recall your parent)"), "chases");
    assert.equal(run("(ask grumpiness recall your parent)"), "emotion");
    // the look only with APPEAR
    assert.equal(run("(ask jealous collect items memorized matching (suggestion: element color-hue value ? strength ? source ?))") !== "nil", extensions.includes("appear"), extensions.join());
  }
});

test("a notebook only adds: Ken's words keep every suggestion, and a learner's sits beside them", () => {
  const ask = (run, word, element) => run(`(ask ${word} collect items memorized matching (suggestion: element ${element} value ? strength ? source ?))`);
  const before = lisp(["mend"]);
  loadKen(before.run);
  const after = lisp(["mend"], [ALL]);
  loadKen(after.run);
  for (const [word, element] of [["shy", "speed"], ["shy", "attraction-towards-strangers"], ["mean", "attraction-towards-enemies"], ["hates", "(relative-speed a b)"]]) {
    assert.equal(ask(after.run, word, element), ask(before.run, word, element), `${word} ${element}`);
  }
  // shy gains the learner's path-curvature, and keeps its avoiding a stranger
  assert.equal(ask(after.run, "shy", "path-curvature"), "((suggestion: element path-curvature value high strength low source shy))");
  assert.equal(ask(before.run, "shy", "path-curvature"), "nil");
  const shows = (run, w) => run(`(ask ${w} collect items memorized matching (suggestion: element (establish (${w} a b)) value ? strength ? source ?))`);
  assert.equal(shows(before.run, "is-polite-to"), "nil");
  assert.equal(shows(after.run, "is-polite-to"), "((suggestion: element (establish (is-polite-to a b)) value (method: type convey value (accompanys a b) best-when ((not (dominates a b)))) strength low source is-polite-to))");
  // the link and DESCRIPTOR's spreading of it
  assert.equal(after.run("(ask mean recall your neighbors)"), "(grumpy)");
  assert.equal(after.run("(ask grumpy recall your neighbors)"), "(mean)");
});

test("also-show: the wrapper on gather-convey-suggestions passes straight through with no ways, and appends a learner's way", () => {
  const plain = lisp(["mend"]);
  loadKen(plain.run);
  const empty = lisp(["mend"], [EMPTY]);
  loadKen(empty.run);
  // with TEACH and no ways: the same as without, and the wrapper is installed once
  for (const verb of ["helps", "chases", "accompanys", "pushes"]) {
    assert.equal(empty.run(`(gather-convey-suggestions '(${verb} a b))`), plain.run(`(gather-convey-suggestions '(${verb} a b))`), verb);
  }
  assert.equal(empty.run("(mapcar 'car (get 'gather-convey-suggestions 'revival-wraps))"), "(teach)");
  assert.equal(empty.run(":your-ways"), "nil");
  // with one: helps, which had none in 1978 (convey.64:127), now has the learner's
  const taught = lisp(["mend"], [notebook([{ id: "k1", kind: "way", verb: "helps", way: "goes-to-and-accompanys", first: 1, strength: "medium", because: "staying with someone helps" }])]);
  loadKen(taught.run);
  assert.equal(plain.run("(gather-convey-suggestions '(helps cinderella prince))"), "nil");
  assert.equal(taught.run("(gather-convey-suggestions '(helps cinderella prince))"),
    "((suggestion: element (convey (helps cinderella prince)) value (method: type display value (goes-to-and-accompanys cinderella prince (good-distance-from (vicinity-of cinderella)))) strength medium source (yours helps)))");
  // after Ken's (and KNOW's), never in place of them; the second way round
  const both = lisp(["mend", "know"], [notebook([{ id: "k1", kind: "way", verb: "helps", way: "goes-to-and-accompanys", first: 2, strength: "low", because: "the one helped leads" }])]);
  loadKen(both.run);
  assert.equal(both.run("(gather-convey-suggestions '(helps a b))"),
    "((suggestion: element (convey (helps a b)) value (method: type display value (helps-along a b (good-distance-from (vicinity-of b)))) strength high source helps) (suggestion: element (convey (helps a b)) value (method: type display value (goes-to-and-accompanys b a (good-distance-from (vicinity-of b)))) strength low source (yours helps)))");
  // a verb with another number of characters is left alone
  assert.equal(taught.run("(gather-convey-suggestions '(helps a))"), "nil");
});

test("a feeling: changes as KNOWEM's, with TEACH's own felt-level helpers when KNOW is off", () => {
  for (const extensions of [["mend"], ["mend", "know"]]) {
    const { run } = lisp(extensions, [ALL]);
    loadKen(run);
    const shows = run("(ask grumpiness collect items memorized matching (suggestion: element (establish (emotional-state troll (grumpiness (positive high)))) value ? strength ? source ?))");
    assert.match(shows, /\(change: element \(troll speed\) amount \(negative high\) speed high\)\) strength medium source grumpiness\)/);
    assert.match(shows, /\(change-to: element \(troll path-length\) new-value short speed high\)\) strength medium source grumpiness\)/);
    assert.equal(run("(ask grumpiness collect items memorized matching (suggestion: element (establish (emotional-state troll (grumpiness (negative high)))) value ? strength ? source ?))"), "nil");
  }
});

test("checkNotebook refuses what would stop Ani or isn't knowledge, each with its sentence", () => {
  const vocabulary = { mean: { kind: "personality", neighbors: ["cruel"], opposites: [] }, cruel: { kind: "personality", neighbors: ["mean"], opposites: [] }, beautiful: { kind: "physical", neighbors: [], opposites: ["ugly"] }, lazy: { kind: "personality", opposites: ["hard-working"], neighbors: [] }, hates: { kind: "relationship", neighbors: [], opposites: ["loves"] }, shy: { kind: "personality", neighbors: [], opposites: [] } };
  const taken = new Set(["fear", "friends", "alone", ...Object.keys(vocabulary)]);
  const r = checkNotebook(notebook([
    { id: "k1", kind: "word", word: "lazy", type: "personality", like: "mean", because: "x" },
    { id: "k2", kind: "word", word: "fear", type: "personality", because: "x" },
    { id: "k3", kind: "word", word: "sulky", type: "personality", like: "beautiful", because: "y" },
    { id: "k4", kind: "word", word: "sour", type: "personality", like: "hates", because: "y" },
    { id: "k5", kind: "suggests", word: "step-mother", element: "speed", value: "low", strength: "high", because: "she is slow" },
    { id: "k6", kind: "suggests", word: "sour", element: "speed", value: "low", strength: "high", character: "goat", because: "the goat is slow" },
    { id: "k7", kind: "word", word: "speed", type: "personality", because: "x" },
    { id: "k8", kind: "shows", word: "sour", verb: "follows", who: "enemy", strength: "low", because: " " },
    { id: "k9", kind: "suggests", word: "nobody", element: "speed", value: "low", strength: "high", because: "x" },
    { id: "k10", kind: "suggests", word: "sour", element: "acceleration", value: "high", strength: "high", because: "x" },
    { id: "k11", kind: "suggests", word: "sour", element: "acceleration", value: "low", strength: "high", because: "x" },
    { id: "k12", kind: "looks", word: "sour", element: "size", value: "low", strength: "high", because: "x" },
    { id: "k13", kind: "way", verb: "helps", way: "helps-along", strength: "low", because: "x" },
    { id: "k14", kind: "verb", word: "teases", kindOf: "helps", because: "x" },
    { id: "k15", kind: "word", word: "Grumpy!", type: "personality", because: "x" },
    { id: "k16", kind: "word", word: "nil", type: "personality", because: "x" },
    { id: "k17", kind: "suggests", word: "mean", element: "speed", value: "fast", strength: "high", because: "x" },
    { id: "k18", kind: "word", word: "sour", type: "personality", because: "again" },
  ]), { extensions: ["mend"], vocabulary, taken, characters: ["goat"] });
  assert.equal(r.ok, false);
  assert.deepEqual(codes(r), ["k1 known-word", "k2 name-taken", "k3 link-kind", "k4 link-kind", "k5 names-character", "k6 names-character", "k7 element-name",
    "k8 no-because", "k8 needs-extension", "k9 unknown-word", "k11 repeat-element", "k12 needs-extension", "k13 needs-extension", "k14 needs-extension",
    "k15 bad-name", "k16 lisp-name", "k17 bad-value", "k18 two-notebooks"]);
  const says = Object.fromEntries(r.refused.map((x) => [`${x.piece} ${x.code}`, x.says]));
  assert.equal(says["k1 known-word"], "Ani already knows \"lazy\", the opposite of \"hard-working\": add to Ani's word instead of teaching it again, which would replace it.");
  assert.equal(says["k5 names-character"], "That's about this film's step mother, not about any character. To change this film, criticize it (Your criticism).");
  assert.equal(says["k6 names-character"], "That's about this film's goat, not about any sour character, in any story. To change this film, criticize it (Your criticism).");
  assert.equal(says["k8 needs-extension"], "Following needs the revival's knowledge (KNOW): turn it on, or choose another.");
  assert.deepEqual(r.warnings.map((x) => `${x.piece} ${x.code}`), ["k10 not-read", "k11 not-read", "k2 says-nothing"]);
  // with KNOW, following and KNOW's ways are offered
  const know = checkNotebook(notebook([{ id: "k1", kind: "word", word: "sour", type: "personality", like: "mean", because: "x" }, { id: "k2", kind: "shows", word: "sour", verb: "follows", who: "enemy", strength: "low", because: "y" }, { id: "k3", kind: "way", verb: "helps", way: "helps-along", strength: "low", because: "x" }]), { extensions: ["mend", "know"], vocabulary, taken });
  assert.deepEqual(codes(know), []);
  // a learner's way gives helps a way of showing without KNOW, so a word may be shown by helping
  const way = checkNotebook(notebook([{ id: "k1", kind: "way", verb: "helps", way: "goes-to-and-accompanys", strength: "low", because: "x" }, { id: "k2", kind: "shows", word: "shy", verb: "helps", who: "friend", strength: "low", because: "y" }]), { extensions: ["mend"], vocabulary, taken });
  assert.deepEqual(codes(way), []);
  // joy's cancelling, a warning, not a refusal
  const feeling = checkNotebook(notebook([{ id: "k1", kind: "feeling", word: "grumpiness", changes: [{ element: "speed", change: "down" }, { element: "path-jaggedness", change: "up" }], because: "x" }]), { extensions: ["mend"], vocabulary, taken });
  assert.deepEqual(codes(feeling), []);
  assert.deepEqual(feeling.warnings.map((x) => x.code), ["cancels-joy"]);
  assert.match(feeling.warnings[0].says, /^If a character feels this and joy at once, your speed going down and joy's going up cancel: Ken's CHOMET rejects conflicting changes rather than choose between them \("hopefully all conflicting ones are so noted for now rather than resolving them I'll reject", chomet\.123:464\)\.$/);
  // two notebooks that teach the same word; more than four
  const one = notebook([{ id: "k1", kind: "word", word: "sour", type: "personality", like: "mean", because: "x" }], "Sam's");
  assert.deepEqual(codes(checkNotebook(one, { vocabulary, taken, others: [one] })), ["k1 two-notebooks"]);
  assert.deepEqual(codes(checkNotebook(EMPTY, { others: [EMPTY, EMPTY, EMPTY, EMPTY] })), ["null too-many-notebooks"]);
  assert.deepEqual(codes(checkNotebook({ pieces: [] })), ["null format"]);
});

test("contradictions: a word left both close to and the opposite of another, with the chain of links", () => {
  // a vocabulary whose links are already inconsistent through a learner's link
  const vocabulary = { good: { kind: "personality", neighbors: ["kind"], opposites: ["evil"] }, kind: { kind: "personality", neighbors: ["good"], opposites: ["evil"] }, evil: { kind: "personality", neighbors: [], opposites: ["good", "kind"] } };
  assert.deepEqual(contradictions(notebook([{ id: "k1", kind: "word", word: "sour", type: "personality", like: "evil", because: "x" }]), { vocabulary }), []);
  const nb2 = notebook([{ id: "k1", kind: "word", word: "sour", type: "personality", like: "evil", because: "x" }, { id: "k2", kind: "word", word: "tart", type: "personality", like: "sour", because: "y" }]);
  assert.deepEqual(contradictions(nb2, { vocabulary }), []);
  // a new word links to one word only, so on a consistent net it can't contradict; on a
  // net that already holds a word both close and opposite, the new word inherits it, and
  // only the new contradiction is said, with both chains of links
  const odd = { a: { kind: "personality", neighbors: ["b"], opposites: ["b"] }, b: { kind: "personality", neighbors: ["a"], opposites: ["a"] } };
  const c = contradictions(notebook([{ id: "k1", kind: "word", word: "x", type: "personality", like: "a", because: "x" }]), { vocabulary: odd });
  assert.deepEqual(c.map((x) => [x.piece.id, x.word, x.other])[0], ["k1", "x", "b"]);
  assert.equal(c[0].says, "Because Ani spreads links to the neighbors' neighbors and the opposites' opposites (Ken's DESCRIPTOR, char.2:111-131), \"x\" would be both close to and the opposite of \"b\": x is close to a (yours, k1), then a is close to b (Ani's); but x is close to a (yours, k1), then a is the opposite of b (Ani's).");
  // checkNotebook refuses it, given the vocabulary
  assert.deepEqual(codes(checkNotebook(notebook([{ id: "k1", kind: "word", word: "x", type: "personality", like: "a", because: "x" }]), { vocabulary: odd })), ["k1 contradiction"]);
});

test("yoursIndex: the learner's knowledge in DATA.know's shape, each entry with its notebook, piece and because", () => {
  const index = yoursIndex([ALL]);
  assert.deepEqual(index.notebooks, [{ n: 1, title: "Every kind of piece", pieces: ALL.pieces.length }]);
  assert.deepEqual(Object.keys(index.words), ["grumpy", "jealous", "is-jealous-of"]);
  assert.equal(index.words.grumpy.like, "mean");
  assert.deepEqual(index.links, [{ from: "mean", to: "grumpy", type: "neighbors", notebook: 1, title: "Every kind of piece", piece: "k1", because: "a grumpy character is a mean one" }]);
  assert.deepEqual(index.knowledge.find((k) => k.piece === "k2"), { source: "grumpy", element: "speed", value: "low", strength: "medium", notebook: 1, title: "Every kind of piece", piece: "k2", because: "a grumpy character drags its feet: it can't be bothered to hurry" });
  assert.equal(index.knowledge.find((k) => k.piece === "k12").through, "enemy-of");
  assert.equal(index.knowledge.find((k) => k.piece === "k5").looks, true);
  assert.equal(index.knowledge.find((k) => k.piece === "k14").element, "relative-speed");
  assert.equal(index.verbs.helps.method, "goes-to-and-accompanys");
  assert.equal(index.verbs.helps.ways[0].value, "(goes-to-and-accompanys helper helped (good-distance-from (vicinity-of helper)))");
  assert.deepEqual([index.verbs.teases.isNew, index.verbs.teases.kindOf], [true, "chases"]);
  assert.deepEqual(index.feelings.grumpiness.changes.map((c) => c.change), ["down", "short"]);
  assert.equal(index.vocabulary.grumpy.yours, true);
  for (const p of ALL.pieces) assert.ok(pieceWords(p).length > 10, p.id);
  assert.equal(pieceWords(ALL.pieces[0]), "\"grumpy\" is a word for what a character is like inside, and means much the same as \"mean\".");
  assert.match(legitimacyQuestion("grumpy"), /^Would this be true of any grumpy character, in any story\?/);
});

test("Ani's trial job: every piece heard, spreading said, and refusals only Lisp can see", () => {
  const fs = makeProjectFileSystem();
  const ok = checkKnowledge(fs, [ALL], { extensions: ["mend", "know", "appear"] });
  assert.equal(ok.ok, true, JSON.stringify(ok.notebooks[0].refused));
  assert.deepEqual(Object.values(ok.notebooks[0].pieces).map((p) => p.heard), ALL.pieces.map(() => true));
  assert.deepEqual(ok.notebooks[0].pieces.k1.spread, { neighbors: ["cruel"], opposites: [] });
  assert.equal(ok.notebooks[0].pieces.k1.says, "Because Ken's Ani spreads links (char.2:111-131), \"grumpy\" is now also close to cruel.");
  assert.ok(ok.seconds < 60);
  // without KNOW, cruel isn't Ani's, following isn't a verb, and the look needs APPEAR
  const mend = checkKnowledge(fs, [ALL], { extensions: ["mend"] });
  assert.deepEqual(codes(mend.notebooks[0]), ["k5 needs-extension", "k7 needs-extension"]);
  assert.equal(mend.notebooks[0].pieces.k1.spread, undefined);
  // Ani's own names and Lisp's functions
  const bad = checkKnowledge(fs, [notebook([{ id: "k1", kind: "word", word: "lazy", type: "personality", because: "x" }, { id: "k2", kind: "word", word: "friends", type: "personality", because: "x" }, { id: "k3", kind: "word", word: "mapcan", type: "personality", because: "x" }])], { extensions: ["mend"] });
  assert.deepEqual(codes(bad.notebooks[0]).filter((c) => !/lost-suggestions|not-heard/.test(c)), ["k1 known-word", "k2 name-taken", "k3 lisp-name"]);
  // a define of a word Ani knows would replace it: the trial job sees what it lost
  assert.ok(bad.notebooks[0].refused.some((x) => x.code === "lost-suggestions" && /"lazy"|"friends"/.test(x.says)) || bad.notebooks[0].refused.some((x) => x.code === "known-word"));
});

test("a film is never made with a notebook Ani refuses, and the rehearsal's story is a story", () => {
  const fs = makeProjectFileSystem();
  assert.throws(() => makeFilm(fs, { extensions: ["mend"], knowledge: [notebook([{ id: "k1", kind: "word", word: "lazy", type: "personality", because: "x" }], "Lazy")], scenes: ["introduction"] }),
    /Ani refuses the notebook "Lazy": k1: "lazy" is already the name of something Ani knows/);
  assert.throws(() => makeFilm(fs, { knowledge: [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY] }), /up to 4 notebooks/);
  for (const p of ALL.pieces) {
    const s = rehearsalStory(p);
    const outline = storyOutline(s.text);
    assert.deepEqual(outline.scenes, ["rehearsal"], p.id);
    assert.deepEqual(outline.characters, ["first-one", "second-one"], p.id);
  }
});

test("yourKnowledgeDid reads a film's glass boxes: won, combined, lost, never reached", () => {
  // a run as makeFilmSteps returns one, cut down to what yourKnowledgeDid reads
  const nb = notebook([
    { id: "k1", kind: "word", word: "grumpy", type: "personality", like: "mean", because: "a grumpy character is a mean one" },
    { id: "k2", kind: "suggests", word: "grumpy", element: "speed", value: "low", strength: "medium", because: "slow" },
    { id: "k3", kind: "relationship-shows", word: "is-jealous-of", verb: "follows", strength: "medium", because: "follows" },
    { id: "k4", kind: "way", verb: "helps", way: "goes-to-and-accompanys", strength: "medium", because: "with" },
    { id: "k5", kind: "suggests", word: "grumpy", element: "acceleration", value: "high", strength: "low", because: "unread" },
  ]);
  const sug = (element, value, strength, source) => ["suggestion:", "element", element, "value", value, "strength", strength, "source", source];
  const run = {
    knowledge: [nb], extensions: ["mend", "know"],
    choicePoints: [
      { name: ["choice-point-of", "step-mother", "speed"], element: "speed", thing: "step-mother", currentChoice: "medium",
        conflictsResolved: [["conflict:", "how-resolved", "compromised", "type", "top-bottom", "elements-involved", "speed", "offenders", [sug("speed", "high", "medium", "strong"), sug("speed", "low", "medium", "grumpy")]]],
        memory: [sug("speed", "medium", "low", ["and", "grumpy", "strong"])] },
      { name: ["choice-point-of", "step-mother", "attraction-towards-enemies"], element: "attraction-towards-enemies", thing: "step-mother", currentChoice: ["negative", "high"],
        memory: [sug("attraction-towards-enemies", ["negative", "high"], "high", ["neighbor-of", "grumpy", "mean"])] },
    ],
    scenes: [{ id: "introduction", glass: { tasks: [
      { name: "establish-task-5", variables: { parent: "establish-task", task: "(task: description (relationship (relationship-of step-mother cinderella)) for-who (relationship-of step-mother cinderella) source initial-description)", "current-choice": "((method: type convey value (pushes step-mother cinderella)))" },
        items: ["(related-suggestions: main-suggestion (suggestion: element (establish (is-jealous-of step-mother cinderella)) value (method: type convey value (follows step-mother cinderella)) strength medium source is-jealous-of) relationship unique others nil)",
          "(related-suggestions: main-suggestion (suggestion: element (establish (dominates step-mother cinderella)) value (method: type convey value (pushes step-mother cinderella)) strength low source dominates) relationship identical others ((suggestion: element (establish (hates step-mother cinderella)) value (method: type convey value (pushes step-mother cinderella)) strength low source hates)))"] },
      { name: "convey-task-11", variables: { parent: "convey-task", task: "(task: description (helps cinderella prince) for-who cinderella source establish-task-1)", "current-choice": "((goes-to-and-accompanys cinderella prince (good-distance-from (vicinity-of cinderella))))", status: "done" },
        items: ["(suggestion: element (convey (helps cinderella prince)) value (method: type display value (goes-to-and-accompanys cinderella prince (good-distance-from (vicinity-of cinderella)))) strength medium source (yours helps))"] },
    ] } }],
  };
  const did = yourKnowledgeDid(run);
  const state = Object.fromEntries(did.pieces.map((p) => [p.piece, p.state]));
  assert.deepEqual(state, { k1: "won", k2: "combined", k3: "lost", k4: "won", k5: "never-reached" });
  const k3 = did.pieces.find((p) => p.piece === "k3").places[0];
  assert.equal(k3.reason, "not-related");
  assert.match(k3.reasonWords, /two of the words suggest at once \(pushes\).*eliminate-not-related-suggestions, chomet\.123:588-596/);
  assert.deepEqual(did.pieces.find((p) => p.piece === "k2").places[0].against, [{ value: "high", strength: "medium", source: "strong" }]);
  assert.equal(did.pieces.find((p) => p.piece === "k5").why, "no choice of acceleration heard it");
});
