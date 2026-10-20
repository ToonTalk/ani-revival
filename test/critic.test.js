// REVIVE;CRITIC: Ani heeds a record of a user's criticism of its film
// (reports/chapter-x/design-criticism.md; thesis Chapter X.D, pp. 189-191). That Ken's
// Cinderella comes out byte for byte with CRITIC loaded and an empty record is
// tools/check-1978.mjs's (--extensions critic, minutes); Ken's own examples end to end,
// against their goldens, are tools/check-critic.mjs's (npm run test:critic). These
// check, quickly: the registry and loading on demand; the record, its Lisp and its
// round trip into the Lisp; the wrappers installed once each, in the right file's hooks,
// passing through with an empty record; REVIVE;HOLD with nothing freed giving CP 29; and
// a remake with an empty record keeping every scene it plans again.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeProjectFileSystem, mountRunOutputs } from "../src/its/node-fs.js";
import {
  EXTENSIONS, extensionsFor, boot, withCritic, criticismToLisp, checkRecord, addCriticism, removeCriticism, criticismWords, paceFactor,
  remakeFilm, filesOf, taskDescription, criticismChanges, contactsIn, pass2,
} from "../src/pipeline.js";
import { choicesOfText, choicesOfItsFile, compareChoices } from "../tools/choices.mjs";
import { film1978 } from "../tools/critic-base.mjs";

const NLKA_TASK = "(undoes fairy-godmother (from-scene kept-apart (convey (prevents step-mother (meets cinderella prince)))))";
const RECORD = [
  { id: "c1", kind: "another-way", scene: "no-longer-kept-apart", task: NLKA_TASK, level: "display", vetoes: "goes-to-and-accompanys", by: "you", said: "Not this way" },
  { id: "c2", kind: "pace", scene: "no-longer-kept-apart", tasks: [NLKA_TASK], direction: "too-quick", times: 2, by: "you", said: null },
  { id: "c3", kind: "keep-apart", scenes: ["introduction", "kept-apart"], between: ["cinderella", "prince"], by: "you", said: "Cinderella is not to meet the Prince until the third scene" },
  { id: "c4", kind: "start-far", scene: "no-longer-kept-apart", who: "fairy-godmother", from: "cinderella", by: "you", said: null },
];

// A project file system that notes each file loaded, as "DIR;FN1 FN2".
function loggingFileSystem() {
  const fs = makeProjectFileSystem();
  const loaded = [];
  const resolve = fs.resolveForLoad.bind(fs);
  fs.resolveForLoad = (spec, L) => {
    const r = resolve(spec, L);
    if (r) loaded.push(`${r.truename.dir};${r.truename.fn1} ${r.truename.fn2}`);
    return r;
  };
  return { fs, loaded };
}
const runner = (L) => (src) => L.print(L.evalString(src)).toLowerCase();
const wraps = (run, f) => run(`(mapcar 'car (get '${f} 'revival-wraps))`);

test("the registry: CRITIC is loaded on demand, with MEND and HOLD; it changes nothing of Ken's", () => {
  const e = EXTENSIONS.find((x) => x.id === "critic");
  assert.equal(e.onDemand, true);
  assert.equal(e.group, "criticism");
  assert.equal(e.changes1978, false);
  assert.deepEqual(e.requires, ["mend"]);
  assert.deepEqual(e.files.slice(0, 3), ["wrap", "hold", "critic"]);
  assert.ok(!e.optIn, "not one the switch leaves to be ticked: the switch never turns it on");
  // CHANGE shares HOLD, listed before its own file
  assert.deepEqual(EXTENSIONS.find((x) => x.id === "change").files.slice(0, 3), ["wrap", "hold", "change"]);
  assert.deepEqual(extensionsFor(withCritic([])).map((x) => x.id), ["mend", "critic"]);
  assert.deepEqual(withCritic(["know", "critic"]), ["know", "critic"]);
});

test("loading on demand: no criticism, no CRITIC and no file; criticism, CRITIC and KEN1;FILM CRITIC read", () => {
  const plain = loggingFileSystem();
  boot(plain.fs);
  const empty = loggingFileSystem();
  boot(empty.fs, { criticism: [] });
  assert.deepEqual(empty.loaded, plain.loaded);
  assert.equal(empty.fs.find({ dir: "KEN1", fn1: "FILM", fn2: "CRITIC" }), null);

  const some = loggingFileSystem();
  const L = boot(some.fs, { criticism: RECORD });
  const files = extensionsFor(["critic"]).flatMap((e) => e.files).filter((f, i, all) => all.indexOf(f) === i).map((f) => `REVIVE;${f.toUpperCase()} 1`);
  assert.deepEqual(some.loaded, [...plain.loaded, ...files]);
  assert.ok(some.fs.find({ dir: "KEN1", fn1: "FILM", fn2: "CRITIC" }));
  const run = runner(L);
  assert.equal(run("(length :critic-record)"), "4");
  // every field as the record has it
  assert.equal(run("(get (first :critic-record) 'vetoes)"), "goes-to-and-accompanys");
  assert.equal(run("(get (first :critic-record) 'task)"), NLKA_TASK);
  assert.equal(run("(get (second :critic-record) 'factor)"), "2.25");
  assert.equal(run("(get (third :critic-record) 'between)"), "(cinderella prince)");
  assert.equal(run("(get (fourth :critic-record) 'who)"), "fairy-godmother");
  // with the film's own extensions besides
  const know = loggingFileSystem();
  boot(know.fs, { extensions: ["know"], criticism: RECORD });
  assert.ok(know.loaded.includes("REVIVE;KNOW 1") && know.loaded.includes("REVIVE;CRITIC 1"));
});

test("the record: checked, written as Lisp without the words said, added to and taken from", () => {
  assert.deepEqual(checkRecord(RECORD), RECORD);
  assert.throws(() => checkRecord([{ ...RECORD[0], kind: "rhythm" }]), /no such kind/);
  assert.throws(() => checkRecord([RECORD[0], RECORD[0]]), /used twice/);
  assert.throws(() => checkRecord([{ ...RECORD[0], task: "(undoes" }]), /needs its task/);
  assert.throws(() => checkRecord([{ ...RECORD[2], between: ["cinderella", "cinderella"] }]), /two different characters/);
  const text = criticismToLisp(RECORD);
  assert.equal(text.split("\n").filter((l) => l.startsWith("(criticism: ")).length, 4);
  assert.ok(!/said|Cinderella is not/.test(text), "the words said are the page's");
  assert.match(text, /\(criticism: id c2 kind pace scene no-longer-kept-apart tasks \(\(undoes .*\)\) direction too-quick factor 2\.25 by you\)/);
  assert.equal(paceFactor(RECORD[1]), 2.25);
  assert.equal(paceFactor({ ...RECORD[1], direction: "too-slow", times: 1 }), 1 / 1.5);

  // ids given in turn; the same criticism not added twice; a pace compounding and cancelling
  let r = [];
  let item;
  ({ record: r, item } = addCriticism(r, { kind: "another-way", scene: "no-longer-kept-apart", task: NLKA_TASK.replace(/ /g, "  "), level: "display", vetoes: "goes-to-and-accompanys" }));
  assert.equal(item.id, "c1");
  assert.equal(item.task, NLKA_TASK, "the description kept as Lisp prints it");
  assert.equal(item.by, "you");
  ({ record: r } = addCriticism(r, { kind: "another-way", scene: "no-longer-kept-apart", task: NLKA_TASK, level: "display", vetoes: "goes-to-and-accompanys" }));
  assert.equal(r.length, 1);
  const quick = { kind: "pace", scene: "no-longer-kept-apart", tasks: [NLKA_TASK], direction: "too-quick" };
  ({ record: r, item } = addCriticism(r, quick));
  assert.deepEqual([item.id, item.times], ["c2", 1]);
  ({ record: r, item } = addCriticism(r, quick));
  assert.deepEqual([r.length, item.id, item.times], [2, "c2", 2]);
  ({ record: r, item } = addCriticism(r, { ...quick, direction: "too-slow" }));
  assert.deepEqual([item.direction, item.times], ["too-quick", 1]);
  ({ record: r, item } = addCriticism(r, { ...quick, direction: "too-slow" }));
  assert.equal(item, null);
  assert.equal(r.length, 1);
  ({ record: r, item } = addCriticism(r, { ...quick, direction: "too-slow" }));
  assert.deepEqual([item.id, item.direction, item.times], ["c2", "too-slow", 1], "the next id after those in the record");
  r = removeCriticism(r, "c1");
  assert.deepEqual(r.map((c) => c.id), ["c2"]);
  for (const c of RECORD) assert.equal(typeof criticismWords(c), "string");

  // a task named by its description and, where its scene has two of that description, the
  // description of the task it came from (source; a pace's sources, one for each task)
  const dance = { kind: "another-way", scene: "the-dance", task: "(accompanys cinderella prince)", source: "(personality  cinderella)", level: "display", vetoes: "goes-to-and-accompanys" };
  ({ item } = addCriticism([], dance));
  assert.equal(item.source, "(personality cinderella)");
  assert.match(criticismToLisp([item]), /task \(accompanys cinderella prince\) source \(personality cinderella\) level display/);
  const other = addCriticism([item], { ...dance, source: "(relationship (relationship-of cinderella prince))" });
  assert.equal(other.record.length, 2, "a veto of the other task of that description is another criticism");
  const paced = { kind: "pace", scene: "the-dance", tasks: ["(accompanys cinderella prince)"], sources: ["initial-description"], direction: "too-quick" };
  assert.match(criticismToLisp([addCriticism([], paced).item]), /tasks \(\(accompanys cinderella prince\)\) sources \(initial-description\) direction/);
  assert.equal(addCriticism([], { ...paced, sources: [null] }).item.sources, undefined, "no source where none is needed");
  assert.throws(() => checkRecord([{ ...dance, id: "c1", source: "(personality" }]), /source is/);
  // a part has one pace item: two that name the same task are refused
  assert.throws(() => checkRecord([RECORD[1], { ...RECORD[1], id: "c9", direction: "too-slow", times: 1 }]), /already says how quick that part is/);
  assert.throws(() => addCriticism([RECORD[1]], { ...RECORD[1], id: undefined, tasks: [NLKA_TASK, "(alone cinderella prince)"] }), /already says how quick/);
});

test("a criticism of a pass-1 choice: a direction from the film's value, for the whole film, one item a choice point", () => {
  const fast = { kind: "choice", character: "prince", element: "speed", direction: "lower", was: "high", said: "The Prince moves too fast" };
  let { record, item } = addCriticism([], fast);
  assert.equal(item.id, "c1");
  assert.equal(criticismWords(item), "prince moves too fast");
  assert.match(criticismToLisp(record), /\(criticism: id c1 kind choice choice-point \(choice-point-of prince speed\) direction lower was high value \(less-than high\) by you\)/);
  assert.match(criticismToLisp([{ ...item, direction: "higher", was: "low" }]), /value \(greater-than low\)/);
  assert.match(criticismToLisp([{ ...item, direction: "not" }]), /value \(not high\)/);
  assert.equal(criticismWords({ ...item, element: "path-curvature", direction: "higher" }), "prince moves in paths too straight");
  assert.equal(criticismWords({ ...item, element: "acceleration" }), "prince has too much acceleration");
  assert.equal(criticismWords({ ...item, direction: "not" }), "prince's speed: not high");
  // never a value, and never per scene: a feeling of the scene's, a change to the story
  assert.throws(() => checkRecord([{ ...item, direction: "medium" }]), /a direction, never a value/);
  assert.throws(() => checkRecord([{ ...item, scene: "justice" }]), /change to the story: say how the character feels in that scene, in the editor/);
  // said again from the film remade (now medium): the new item in the old one's place
  ({ record, item } = addCriticism(record, { ...fast, was: "medium" }));
  assert.deepEqual([record.length, item.id, item.was], [1, "c1", "medium"]);
  assert.equal(addCriticism(record, { ...fast, was: "medium" }).record.length, 1, "the same criticism once");
  assert.throws(() => checkRecord([item, { ...item, id: "c2" }]), /already criticizes that choice/);
  // read into the Lisp
  const run = runner(boot(makeProjectFileSystem(), { criticism: record }));
  assert.equal(run("(get (critic-of-choice-point '(choice-point-of prince speed)) 'value)"), "(less-than medium)");
  assert.equal(run("(critic-of-choice-point '(choice-point-of cinderella speed))"), "nil");
});

// Each of Ken's functions CRITIC's files wrap, with the ids of its wrappers, newest
// first, as the registry's files have them.
function expectedWraps() {
  const files = EXTENSIONS.find((x) => x.id === "critic").files;
  const has = (f) => files.includes(f);
  const ids = (...xs) => `(${xs.filter(Boolean).join(" ")})`;
  return {
    "record-choice": ids("critic", "hold"),
    "gather-suggestions-of-type": ids("critic"),
    "try-to-resolve-using-criticism": ids("critic"),
    "get-display-method-suggestions": ids(has("critsc") && "critsc", "critic"),
    "get-convey-method-suggestions": ids(has("critsc") && "critsc", "critic"),
    ...(has("critpc") ? { "ideal-time-for-task": ids("critpc"), "adjust-task-lengths": ids("critpc", "mend11"), "approve-or-remake-tasks-choices": ids("critpc") } : {}),
    ...(has("critsc") ? { "place-small-distance-apart": ids("critsc"), "place-medium-distance-apart": ids("critsc"), "place-large-distance-apart": ids("critsc") } : {}),
  };
}

test("the wrappers: installed once each, in their files' hooks; Ken's functions alone without CRITIC", () => {
  const L = boot(makeProjectFileSystem(), { criticism: RECORD });
  const run = runner(L);
  const kens = ["choose", "chomet", "place"];
  for (const f of kens) run(`(load '|ken;${f} >|)`);
  for (const [f, w] of Object.entries(expectedWraps())) assert.equal(wraps(run, f), w, f);
  // Ken's files loaded again, and CRITIC's: each wrapped once still
  for (const f of kens) run(`(load '|ken;${f} >|)`);
  for (const f of EXTENSIONS.find((x) => x.id === "critic").files) if (f !== "wrap") run(`(load '|revive;${f} >|)`);
  for (const [f, w] of Object.entries(expectedWraps())) assert.equal(wraps(run, f), w, `${f}, loaded again`);
  assert.equal(run("(length :critic-record)"), "4", "loaded again, the record is kept");
  const plain = runner(boot(makeProjectFileSystem()));
  for (const f of kens) plain(`(load '|ken;${f} >|)`);
  for (const f of Object.keys(expectedWraps())) assert.equal(wraps(plain, f), "nil", f);
});

test("with a record that criticizes another scene, every wrapper passes through: No Longer Kept Apart planned as in 1978", () => {
  const fs = makeProjectFileSystem();
  mountRunOutputs(fs, "reports/pass2", ["KEN;NO LONGER", "KEN1;NO MINI", "KEN1;NO PRINT"]);
  const elsewhere = RECORD.map((c) => (c.kind === "keep-apart" ? { ...c, scenes: ["introduction"] } : { ...c, scene: "meeting" }));
  const { glass } = pass2(fs, "no-longer-kept-apart", { criticism: elsewhere });
  assert.equal(JSON.stringify(glass, null, 1), readFileSync("reports/pass2/no-longer-kept-apart.glass.json", "utf8"));
  assert.equal(fs.textOf(fs.find({ dir: "KEN", fn1: "NO", fn2: "LONGER" })), readFileSync("reports/pass2/ken-no.longer", "utf8"));
});

test("REVIVE;HOLD: with every choice held, pass 1 makes CP 29's choices; holding none but one frees that one", () => {
  const fs = makeProjectFileSystem();
  const L = boot(fs, { criticism: RECORD });
  const run = runner(L);
  run("(load '|ken;datest >|)");
  run("(init nil)");
  run("(hold-all-but-choice-points nil '((ken) cp 29))");
  assert.equal(run("(length :change-held)"), "102");
  run("(z)");
  assert.equal(run(":change-held-against"), "nil", "nothing would have come out otherwise");
  run("(setq :change-held nil)");
  run("(save-answers '((ken) cp 31))");
  const ours = choicesOfText(fs.textOf(fs.find({ dir: "KEN", fn1: "CP", fn2: "31" })), "KEN;CP 31");
  const c = compareChoices(choicesOfItsFile("original/7005017/cp.29"), ours);
  assert.equal(c.same, 102);
  // one choice point freed is left out of what is held, under either of its names
  run("(hold-all-but-choice-points '((choice-point-of prince speed) (relative-choice-point-of (prince cinderella) relative-speed)) '((ken) cp 29))");
  assert.equal(run("(length :change-held)"), "100");
  assert.equal(run("(held-value-of '(choice-point-of prince speed))"), "nil");
});

test("a remake with an empty record plans the scenes from the one asked for again, and keeps their films", () => {
  const previous = film1978();
  const kept = [];
  const out = remakeFilm(makeProjectFileSystem(), { previous, criticism: [], from: "justice", onKept: (s, how) => kept.push([s, how]) });
  assert.deepEqual(out.remade, { from: "justice", scenes: ["introduction", "kept-apart", "no-longer-kept-apart", "meeting"].map((id) => ({ id, how: "kept" })).concat([{ id: "justice", how: "unchanged" }]) });
  assert.deepEqual(kept.map((k) => k[1]), ["before", "before", "before", "before", "unchanged"]);
  assert.equal(out.criticism, undefined);
  // planned again, the same glass box as 1978's, and the film kept
  assert.equal(JSON.stringify(out.scenes[4].glass, null, 1), JSON.stringify(previous.scenes[4].glass, null, 1));
  assert.equal(out.scenes[4].film, previous.scenes[4].film);
  // and the files kept, the ones remade as they were
  for (const [k, text] of Object.entries(previous.files)) assert.equal(out.files[k], text, k);
  // nothing criticized and no scene asked for: nothing to make again
  const none = remakeFilm(makeProjectFileSystem(), { previous, criticism: [] });
  assert.equal(none.remade.from, null);
  assert.ok(none.remade.scenes.every((s) => s.how === "kept"));
  const changes = criticismChanges(previous, out);
  assert.ok(changes.scenes.every((s) => !s.tasks.length && s.frames.before === s.frames.after));
});

test("the glass box's names for a task and its walks that bring two together", () => {
  const { scenes } = film1978();
  const intro = scenes[0].glass;
  assert.equal(taskDescription(intro.tasks.find((t) => t.name === "establish-task-1")), "(personality cinderella)");
  assert.equal(taskDescription(scenes[2].glass.tasks[0]), NLKA_TASK);
  // in 1978 the Introduction's last part has Cinderella go to the Prince and walk with him
  const together = contactsIn(intro).filter((c) => [c.a, c.b].sort().join() === "cinderella,prince");
  assert.deepEqual(together.map((c) => [c.subscene, c.how]).sort(), [["(subscene-of introduction 5)", "contact"], ["(subscene-of introduction 5)", "together"]]);
  assert.equal(filesOf(makeProjectFileSystem()) && Object.keys(filesOf(makeProjectFileSystem())).length, 0);
});
