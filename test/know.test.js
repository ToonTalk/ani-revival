// KNOW (src/director/revive/know*.lisp): knowledge Ken could have added. These check,
// fast, what the goldens can't: that its hooks and wrappers are installed when Ken's
// files load, and once; the rule that keeps Ken's Cinderella's pass 1 at CP 29, over the
// links as DESCRIPTOR spreads them (char.2:111-131); that tools/know-index.mjs spreads
// them as the running Lisp does; and its pieces, one by one. Cinderella with KNOW is
// checked by tools/check-ext.mjs --extensions know (npm run test:know), and stories that
// use every piece by tools/check-stress.mjs (test/stories/stress/know-*.lisp).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot, extensionsFor, collectBorrowed } from "../src/pipeline.js";
import { decodeItsText } from "../src/its/text.js";
import { knowIndex } from "../tools/know-index.mjs";

const lisp = (extensions) => {
  const L = boot(makeProjectFileSystem(), { extensions });
  const run = (src) => L.print(L.evalString(src)).toLowerCase();
  return { L, run };
};
const index = knowIndex(".");

// The words CINDY uses for her characters and their relationships (cindy.46:7-51), and
// graceful, which beautiful makes a character (char.2:13-20).
function cindyWords() {
  const text = decodeItsText(readFileSync("original/7005017/cindy.46")).text;
  const cast = text.slice(0, text.indexOf("(define introduction scene"));
  const words = new Set(["graceful"]);
  for (const m of cast.matchAll(/\(process initial description([\s\S]*?)\)\)\s*\n\s*\n/g)) {
    for (const w of m[1].match(/[a-z][a-z+-]*/g)) if (!["physical", "personality", "role-in-story", "movement", "and"].includes(w)) words.add(w);
  }
  return [...words];
}
// The dynamics elements, absolute and relative, a word could suggest values for.
const ELEMENTS = ["speed", "acceleration", "activity-level", "rhythmic-level", "repetiveness", "deliberateness",
  "path-length", "path-curvature", "path-jaggedness", "attraction-towards-friends", "attraction-towards-enemies",
  "attraction-towards-strangers", "attraction-to-friends", "attraction-to-strangers", "attraction-to-enemies"];
const RELATIVE = ["relative-speed", "relative-acceleration", "relative-activity-level", "relative-rhythmic-level",
  "relative-deliberateness", "relative-path-length", "relative-path-curvature", "relative-path-jaggedness", "relative-vertical-position"];
// A word's suggestions for how a character moves (absolute and relative), printed.
function dynamicsSuggestions(run, word) {
  const out = [];
  for (const e of ELEMENTS) out.push(run(`(ask ${word} collect items memorized matching (suggestion: element ${e} value ? strength ? source ?))`));
  for (const e of RELATIVE) out.push(run(`(ask ${word} collect items memorized matching (suggestion: element (${e} a b) value ? strength ? source ?))`));
  return out.filter((x) => x !== "nil");
}

test("the registry: KNOW requires MEND and changes Ken's Cinderella", () => {
  const ids = extensionsFor(["know"]).map((e) => e.id);
  assert.deepEqual(ids, ["mend", "know"]);
  const know = extensionsFor(["know"]).find((e) => e.id === "know");
  assert.equal(know.changes1978, true);
  assert.deepEqual(know.files, ["wrap", "know", "knowds", "knowrl", "knowcv", "knowdi", "knowem"]);
});

test("without KNOW, none of its words, feelings, verbs or methods exist", () => {
  for (const extensions of [[], ["mend"]]) {
    const { run } = lisp(extensions);
    run("(load '|ken;dscrp >|)");
    run("(load '|ken;relate >|)");
    for (const name of [...Object.keys(index.words), ...Object.keys(index.feelings), ...Object.keys(index.methods), "follows"]) {
      assert.equal(run(`(exists? '${name})`), "nil", `${name} with ${extensions.join(",") || "nothing"}`);
    }
    assert.equal(run("(ask shy recall your neighbors)"), "nil");
  }
});

test("KNOW's words, feelings, verbs and methods are known before their Ken file loads, and defined once it has", () => {
  const { run } = lisp(["mend", "know"]);
  // exists? answers with the file the tags give (KEN1;DRECT)
  const file = (name) => run(`(exists? '${name})`).replace(/\|/g, "");
  for (const w of Object.keys(index.words)) assert.ok(/^ken;(dscrp|relate)$/.test(file(w)), w);
  for (const e of Object.keys(index.feelings)) assert.equal(file(e), "ken;emote");
  for (const m of Object.keys(index.methods)) assert.equal(file(m), "ken;disply");
  assert.equal(file("follows"), "ken;convey");
  for (const file of ["dscrp", "relate", "prereq", "convey", "disply", "emote", "sugest"]) run(`(load '|ken;${file} >|)`);
  for (const w of Object.keys(index.words)) assert.ok(run(`(actor-of '${w} dont-autoload)`) !== "nil", w);
  assert.notEqual(run("(ask follows are you a moves)"), "nil");
  for (const m of Object.keys(index.methods)) assert.notEqual(run(`(ask ${m} are you a display-method)`), "nil", m);
  for (const e of Object.keys(index.feelings)) assert.notEqual(run(`(ask ${e} are you a emotion)`), "nil", e);
  // each hook ran once: loaded again, DSCRP gives gentle its suggestions once
  run("(load '|ken;dscrp >|)");
  assert.equal(L_count(run, "gentle", "speed"), 1);
  assert.equal(run("(ask gentle recall your opposites)"), "(rough)");
});
function L_count(run, word, element) {
  const items = run(`(ask ${word} collect items memorized matching (suggestion: element ${element} value ? strength ? source ?))`);
  return items === "nil" ? 0 : (items.match(/\(suggestion: /g) || []).length;
}

test("KNOW wraps SUGEST's establish functions round MEND3's, and MEND6's mover-and-other-of, once", () => {
  const { run } = lisp(["mend", "know"]);
  assert.equal(run("(mapcar 'car (get 'mover-and-other-of 'revival-wraps))"), "(knowdi)");
  assert.equal(run("(mover-and-other-of '(follows-behind cinderella step-mother))"), "(cinderella step-mother)");
  assert.equal(run("(mover-and-other-of '(helps-along cinderella prince (good-distance-from (vicinity-of prince))))"), "(cinderella prince)");
  assert.equal(run("(mover-and-other-of '(pushes-around step-mother cinderella))"), "(step-mother cinderella)");
  run("(load '|ken;sugest >|)");
  assert.equal(run("(mapcar 'car (get 'establish-personality-suggestions 'revival-wraps))"), "(know mend3)");
  assert.equal(run("(mapcar 'car (get 'establish-relationship-suggestions 'revival-wraps))"), "(know)");
  assert.equal(run("(mapcar 'car (get 'distill-suggestions 'revival-wraps))"), "(know)");
  assert.equal(run("(eq (get 'distill-suggestions 'expr) (get 'distill-suggestions-with-borrowed 'expr))"), "t");
  // loaded again, Ken's definitions come back and are wrapped again, once
  run("(load '|ken;sugest >|)");
  assert.equal(run("(mapcar 'car (get 'establish-personality-suggestions 'revival-wraps))"), "(know mend3)");
});

test("CP 29's rule: no word of KNOW's with suggestions for how a character moves is linked to a word CINDY uses, and CINDY's words suggest as they did", () => {
  const words = cindyWords();
  assert.ok(words.includes("shy") && words.includes("is-obedient-to") && words.includes("graceful"));
  const know = lisp(["mend", "know"]);
  const ken = lisp([]);
  for (const { run } of [know, ken]) for (const f of ["dscrp", "relate"]) run(`(load '|ken;${f} >|)`);
  const linked = new Set();
  for (const w of words) {
    if (know.run(`(actor-of '${w} dont-autoload)`) === "nil") continue; // a word Ani doesn't know (is-protective-of)
    for (const rel of ["neighbors", "opposites"]) {
      const list = know.run(`(ask ${w} recall your ${rel})`);
      for (const x of list === "nil" ? [] : list.slice(1, -1).split(" ")) if (index.words[x]) linked.add(x);
    }
    // KNOW gives CINDY's words no suggestions for how a character moves; one RELATE
    // doesn't know (is-protective-of), which KNOW defines, has none
    const before = ken.run(`(actor-of '${w} dont-autoload)`) === "nil" ? [] : dynamicsSuggestions(ken.run, w);
    assert.deepEqual(dynamicsSuggestions(know.run, w), before, w);
  }
  // timid, wicked and cruel, and dislikes: linked, with none of their own
  assert.deepEqual([...linked].sort(), ["cruel", "dislikes", "timid", "wicked"]);
  // CINDY's is-protective-of is KNOW's now, a relationship word of no type, as CHAR made
  // it in 1978 (char.2:162-168), linked to RELATE's is-protective-to, which has no
  // suggestions for how a character moves either
  assert.equal(know.run("(ask is-protective-of recall your type)"), "unknown");
  assert.equal(know.run("(ask is-protective-of recall your neighbors)"), "(is-protective-to)");
  assert.deepEqual(dynamicsSuggestions(know.run, "is-protective-to"), []);
  for (const x of linked) assert.deepEqual(dynamicsSuggestions(know.run, x), [], x);
  // and every word of KNOW's with suggestions of its own is linked to none of CINDY's
  for (const [w, v] of Object.entries(index.words)) if (v.suggests) assert.ok(!linked.has(w), w);
});

test("tools/know-index.mjs spreads the links as DESCRIPTOR does: each list as the running Lisp has it, in order", () => {
  const { run } = lisp(["mend", "know"]);
  for (const f of ["dscrp", "relate"]) run(`(load '|ken;${f} >|)`);
  const asLisp = (list) => (list && list.length ? `(${list.join(" ")})` : "nil");
  let compared = 0;
  for (const [w, v] of Object.entries(index.vocabulary)) {
    if (w === "likes" || run(`(actor-of '${w} dont-autoload)`) === "nil") continue;
    assert.equal(run(`(ask ${w} recall your neighbors)`), asLisp(v.neighbors), `${w}'s neighbors`);
    assert.equal(run(`(ask ${w} recall your opposites)`), asLisp(v.opposites), `${w}'s opposites`);
    compared++;
  }
  assert.ok(compared > 60, `${compared} words compared`);
  // the spreading the review named: evil+wicked makes wicked an opposite of good and kind
  assert.deepEqual(index.vocabulary.good.opposites, ["wicked", "evil", "bad"]);
  assert.deepEqual(index.vocabulary.timid.opposites, ["brazen", "forward"]);
});

test("the index: every piece of KNOW's knowledge has its file, line and why", () => {
  for (const k of index.knowledge) {
    assert.ok(index.files[k.file], `${k.source} ${k.element}: file`);
    assert.ok(Number.isInteger(k.line) && k.line > 0, `${k.source} ${k.element}: line`);
    assert.ok(k.why && k.why.length > 20, `${k.source} ${k.element}: why`);
  }
  for (const [w, v] of Object.entries(index.words)) assert.ok(v.why, `${w}: why`);
  for (const [v, x] of Object.entries(index.verbs)) assert.ok(x.why && x.method, `${v}`);
  for (const [m, x] of Object.entries(index.methods)) assert.ok(x.why && x.estimate && x.run && x.activities.length > 1, m);
  for (const [e, x] of Object.entries(index.feelings)) assert.ok(x.why && x.changes.length === (e === "pride" ? 2 : 3), e);
  // Ken's decision 9: pride doesn't change speed
  assert.deepEqual(index.feelings.pride.changes.map((c) => c.element), ["path-jaggedness", "deliberateness"]);
  assert.deepEqual(Object.keys(index.verbs).sort(), ["avoids", "follows", "helps"]);
  assert.deepEqual(index.verbs.follows.isNew, true);
  assert.deepEqual(Object.keys(index.feelings), ["pride", "anticipation", "loneliness", "fear", "anger"]);
  const est = (w) => index.knowledge.filter((k) => k.source === w && k.element === "establish").map((k) => k.verb);
  assert.deepEqual(est("is-obedient-to"), ["follows"]);
  assert.deepEqual(est("is-helpful-towards"), ["helps"]);
  assert.deepEqual(est("likes"), ["accompanys"]);
  // Ken's decision 10
  assert.deepEqual(est("is-protective-to"), ["accompanys"]);
  assert.deepEqual(est("is-grateful-to"), ["accompanys"]);
  assert.deepEqual(est("is-intolerant-of"), ["avoids"]);
  for (const w of ["is-polite-to", "is-impolite-to", "is-tolerant-of"]) assert.deepEqual(est(w), [], w);
  assert.deepEqual(index.words["is-protective-of"].borrows, ["is-protective-to"]);
  assert.deepEqual(index.words.timid.borrows, ["shy"]);
  // the line given is the line of the (for ...) clause in the file
  const lines = readFileSync(`src/director/revive/knowds.lisp`, "utf8").split("\n");
  const speed = index.knowledge.find((k) => k.source === "gentle" && k.element === "speed");
  assert.match(lines[speed.line - 1], /\(for speed low strength medium\)/);
});

test("a word with no way of showing itself borrows its neighbors', at the same strength; one with its own borrows nothing", () => {
  const { run } = lisp(["mend", "know"]);
  for (const f of ["dscrp", "relate", "sugest"]) run(`(load '|ken;${f} >|)`);
  const d = (type, word) => `(description: type ${type} descriptor ${word} source initial-description)`;
  const timid = run(`(personality-suggestions-borrowed '(${d("personality", "timid")}) 'goat)`);
  assert.match(timid, /^\(\(suggestion: element \(establish goat timid\) value \(method: type convey value \(bind \(\(other \(character-that-satisfies \(stranger-of goat nil\)\)\)\) \(avoids goat /);
  assert.match(timid, / strength medium source \(neighbor-of timid shy\)\)\)$/);
  // shy has its own, an unknown word has no neighbors to ask
  assert.equal(run(`(personality-suggestions-borrowed '(${d("personality", "shy")} ${d("personality", "grumpy")}) 'goat)`), "nil");
  // a relationship: Ken's is-generous-towards, a neighbor of is-helpful-towards (relate.22:114)
  assert.equal(run(`(relationship-suggestions-borrowed '(${d("affection", "is-generous-towards")}) '(relationship-of fairy-godmother cinderella))`),
    "((suggestion: element (establish (is-generous-towards fairy-godmother cinderella)) value (method: type convey value (helps fairy-godmother cinderella)) strength medium source (neighbor-of is-generous-towards is-helpful-towards)))");
  // CINDY's words for Cinderella's stepmother borrow nothing: is-obedient-to has its own, is-tolerant-of no neighbor with any
  assert.equal(run(`(relationship-suggestions-borrowed '(${d("domination", "is-obedient-to")} ${d("domination", "is-tolerant-of")}) '(relationship-of cinderella step-mother))`), "nil");
  // distill-suggestions adds what the establish function worked out, once: the task
  // records it among its related suggestions (sugest.123:192-210), and the next call
  // has nothing borrowed
  run("(define know-test-task-1 something)");
  run("(define know-test-task-2 something)");
  run("(setq :know-borrowed '((suggestion: element (establish goat timid) value (method: type convey value (avoids goat troll)) strength medium source (neighbor-of timid shy))))");
  run("(distill-suggestions nil 'know-test-task-1)");
  assert.equal(run("(ask know-test-task-1 collect items memorized matching (related-suggestions: %))"),
    "((related-suggestions: main-suggestion (suggestion: element (establish goat timid) value (method: type convey value (avoids goat troll)) strength medium source (neighbor-of timid shy)) relationship unique others nil))");
  assert.equal(run(":know-borrowed"), "nil");
  run("(distill-suggestions nil 'know-test-task-2)");
  assert.equal(run("(ask know-test-task-2 collect items memorized matching (related-suggestions: %))"), "nil");
});

test("the feelings: changes as joy's, at the feeling's level; a plain level as Ken wrote his pre-meeting scene; none for a negative one", () => {
  const { run } = lisp(["mend", "know"]);
  // pride with no joy: asking it loads EMOTE, as ask-if-exists does (sugest.123:38)
  const ask = (feeling) => run(`(ask-if-exists ${feeling.split(" ")[0].slice(1)} collect items memorized matching (suggestion: element (establish (emotional-state stepmother ${feeling})) value ? strength ? source ?))`);
  const pride = ask("(pride (positive medium))");
  // no speed change (Ken's decision 9)
  assert.doesNotMatch(pride, /\(stepmother speed\)/);
  assert.match(pride, /\(change: element \(stepmother path-jaggedness\) amount \(negative medium\) speed medium\)\) strength medium source pride\)/);
  assert.match(pride, /\(change: element \(stepmother deliberateness\) amount \(positive medium\) speed medium\)\) strength low source pride\)/);
  assert.match(ask("(anticipation high)"), /\(change: element \(stepmother activity-level\) amount \(positive high\) speed high\)\) strength high source anticipation\)/);
  assert.match(ask("(loneliness high)"), /\(change-to: element \(stepmother path-length\) new-value long speed low\)\) strength low source loneliness\)/);
  assert.match(ask("(fear (positive low))"), /\(change: element \(stepmother speed\) amount \(positive low\) speed low\)\) strength high source fear\)/);
  assert.match(ask("(anger high)"), /\(change: element \(stepmother path-curvature\) amount \(negative high\) speed high\)\) strength medium source anger\)/);
  assert.equal(ask("(pride (negative high))"), "nil");
  assert.equal(ask("(fear enormous)"), "nil");
});

test("the relationships: ways of showing for is-obedient-to, is-helpful-towards, likes, dislikes and fears", () => {
  const { run } = lisp(["mend", "know"]);
  for (const f of ["relate", "prereq"]) run(`(load '|ken;${f} >|)`);
  const shows = (word) => run(`(ask ${word} collect items memorized matching (suggestion: element (establish (${word} a b)) value ? strength ? source ?))`);
  assert.equal(shows("is-obedient-to"), "((suggestion: element (establish (is-obedient-to a b)) value (method: type convey value (follows a b)) strength medium source is-obedient-to))");
  assert.equal(shows("is-helpful-towards"), "((suggestion: element (establish (is-helpful-towards a b)) value (method: type convey value (helps a b)) strength medium source is-helpful-towards))");
  assert.equal(shows("likes"), "((suggestion: element (establish (likes a b)) value (method: type convey value (accompanys a b)) strength low source likes))");
  assert.equal(shows("dislikes"), "((suggestion: element (establish (dislikes a b)) value (method: type convey value (avoids a b) best-when ((not (dominates a b)))) strength medium source dislikes))");
  // Ken's decision 10
  assert.equal(shows("is-protective-to"), "((suggestion: element (establish (is-protective-to a b)) value (method: type convey value (accompanys a b)) strength low source is-protective-to))");
  assert.equal(shows("is-grateful-to"), "((suggestion: element (establish (is-grateful-to a b)) value (method: type convey value (accompanys a b)) strength low source is-grateful-to))");
  assert.equal(shows("is-intolerant-of"), "((suggestion: element (establish (is-intolerant-of a b)) value (method: type convey value (avoids a b) best-when ((not (dominates a b)))) strength medium source is-intolerant-of))");
  for (const w of ["is-polite-to", "is-impolite-to", "is-tolerant-of"]) assert.equal(shows(w), "nil", w);
  assert.equal(shows("fears"), "((suggestion: element (establish (fears a b)) value (method: type convey value (avoids a b)) strength high source fears))");
  // Ken's words with ways of their own are as they were
  assert.match(shows("hates"), /\(avoids a b\) best-when \(\(not \(dominates a b\)\)\)\) strength medium source hates\)/);
  // likes is still PREREQ's prerequisite
  assert.notEqual(run("(ask likes are you a prerequisite)"), "nil");
});

test("is-protective-of, CINDY's word for the fairy godmother, borrows is-protective-to's way of showing (Ken's decision 10)", () => {
  const { run } = lisp(["mend", "know"]);
  for (const f of ["relate", "sugest"]) run(`(load '|ken;${f} >|)`);
  assert.equal(run("(relationship-suggestions-borrowed '((description: type unknown descriptor is-protective-of source initial-description)) '(relationship-of fairy-godmother cinderella))"),
    "((suggestion: element (establish (is-protective-of fairy-godmother cinderella)) value (method: type convey value (accompanys fairy-godmother cinderella)) strength low source (neighbor-of is-protective-of is-protective-to)))");
});

test("the glass box records what a word borrowed from its neighbor, and whether Ani chose it; nothing without KNOW", () => {
  const { L, run } = lisp(["mend", "know"]);
  for (const f of ["relate", "sugest"]) run(`(load '|ken;${f} >|)`);
  // as establish-relationship-suggestions works it out and distill-suggestions records it
  // on the task (sugest.123:69-92, 192-210): is-protective-of's accompanying, borrowed
  run("(define know-test-task-3 something)");
  run("(setq :know-borrowed (relationship-suggestions-borrowed '((description: type unknown descriptor is-protective-of source initial-description)) '(relationship-of fairy-godmother cinderella)))");
  run("(distill-suggestions nil 'know-test-task-3)");
  const task = { name: "know-test-task-3", variables: { parent: "establish-task" } };
  const borrowed = { task: "know-test-task-3", word: "is-protective-of", neighbor: "is-protective-to", way: "(accompanys fairy-godmother cinderella)", strength: "low" };
  assert.deepEqual(collectBorrowed(L, [task]), [{ ...borrowed, chosen: false }]);
  run("(ask know-test-task-3 set your current-choice to ((method: type convey value (accompanys fairy-godmother cinderella))))");
  assert.deepEqual(collectBorrowed(L, [task]), [{ ...borrowed, chosen: true }]);
  // only establish tasks; a convey task's suggestions are its verb's
  assert.deepEqual(collectBorrowed(L, [{ ...task, variables: { parent: "convey-task" } }]), []);
  // as in 1978, and with MEND alone: nothing, and nothing interned
  const ken = lisp(["mend"]);
  assert.deepEqual(collectBorrowed(ken.L, [task]), []);
  assert.ok(!ken.L.obarray.find("DISTILL-SUGGESTIONS-WITH-BORROWED"));
});

test("a feeling of KNOW's at a level it doesn't take shows nothing, and its task says so", () => {
  const { run } = lisp(["mend", "know"]);
  for (const f of ["emote", "sugest"]) run(`(load '|ken;${f} >|)`);
  assert.equal(run("(mapcar 'car (get 'establish-suggestions 'revival-wraps))"), "(knowem)");
  run("(define know-feeling-task something)");
  run("(note-feelings-not-shown '(emotional-state goat (and (joy (negative high)) (pride (negative high)) (fear high))) 'know-feeling-task)");
  assert.equal(run("(ask know-feeling-task collect items memorized matching (revival-repair: %))"),
    "((revival-repair: what feeling-not-shown was (pride (negative high)) now nothing because (a level the feeling does not take)))");
  run("(define know-feeling-task-2 something)");
  run("(note-feelings-not-shown '(emotional-state goat (pride (positive low))) 'know-feeling-task-2)");
  assert.equal(run("(ask know-feeling-task-2 collect items memorized matching (revival-repair: %))"), "nil");
});
