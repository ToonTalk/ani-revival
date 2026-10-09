// The revival's extensions (src/pipeline.js EXTENSIONS): the registry, loading them
// after the bridge, REVIVE;WRAP's wrapping once per job, and the repair notes the glass
// box collects. That the extensions change nothing in Ken's Cinderella is
// tools/check-1978.mjs's job (npm run test:golden), which takes minutes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createLisp } from "../src/maclisp/index.js";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { EXTENSIONS, extensionsFor, boot, makeFilm, repairNotes } from "../src/pipeline.js";
import { collectChoicePoints } from "../src/glassbox-pass1.js";

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

test("the registry: each extension's files are in src/director/revive, named as ITS keeps them", () => {
  const ids = new Set();
  for (const e of EXTENSIONS) {
    assert.equal(typeof e.id, "string");
    assert.ok(!ids.has(e.id), `${e.id} is listed once`);
    ids.add(e.id);
    assert.equal(typeof e.label, "string");
    assert.equal(typeof e.note, "string");
    assert.equal(typeof e.changes1978, "boolean");
    for (const r of e.requires) assert.ok(EXTENSIONS.findIndex((x) => x.id === r) < EXTENSIONS.indexOf(e), `${e.id} requires ${r}, listed before it`);
    for (const f of e.files) {
      assert.match(f, /^[a-z0-9]{1,6}$/, `REVIVE;${f}: six characters or fewer`);
      assert.ok(existsSync(`src/director/revive/${f}.lisp`), `src/director/revive/${f}.lisp`);
    }
  }
  assert.deepEqual(extensionsFor([]), []);
  assert.deepEqual(extensionsFor(["mend"]).map((e) => e.id), ["mend"]);
  assert.equal(extensionsFor(["mend"])[0].changes1978, false);
});

test("an unknown extension is an error, before anything runs", () => {
  assert.throws(() => extensionsFor(["mend", "nonesuch"]), /no such extension: nonesuch/);
  assert.throws(() => boot(makeProjectFileSystem(), { extensions: ["nonesuch"] }), /no such extension/);
  let progressed = false;
  assert.throws(() => makeFilm(makeProjectFileSystem(), { extensions: ["nonesuch"], progress: () => (progressed = true) }), /no such extension/);
  assert.equal(progressed, false);
});

test("with no extensions, boot loads the files it loaded before; with MEND, those and MEND's", () => {
  // boot as it was before extensions (src/pipeline.js, Phase 7)
  const before = loggingFileSystem();
  const L = createLisp({ fs: before.fs });
  L.load(L.intern("KEN;LISP >"));
  L.load(L.intern("KEN;LOAD >"));
  L.evalString("(setq :print-load-messages nil)");
  L.evalString("(director '(ani direct))");
  L.evalString("(load '|revive;bridge >|)");

  const none = loggingFileSystem();
  boot(none.fs);
  assert.deepEqual(none.loaded, before.loaded);
  const empty = loggingFileSystem();
  boot(empty.fs, { extensions: [] });
  assert.deepEqual(empty.loaded, before.loaded);

  const mend = loggingFileSystem();
  boot(mend.fs, { extensions: ["mend"] });
  const files = EXTENSIONS.find((e) => e.id === "mend").files.map((f) => `REVIVE;${f.toUpperCase()} 1`);
  assert.deepEqual(mend.loaded, [...before.loaded, ...files]);
});

// A booted Lisp with MEND, and a file KEN;WRAPT that defines a function, standing in
// for one of Ken's.
function withWrapTest() {
  const fs = makeProjectFileSystem();
  fs.addFile("KEN", "WRAPT", "1", { text: "(defun wrapt-double (x) (* 2 x))\n", origin: "test" });
  const L = boot(fs, { extensions: ["mend"] });
  const run = (src) => L.print(L.evalString(src));
  run(`(defun wrapt-plus-one (x) (1+ (funcall (revival-wrapped 'wrapt-double 'test) x)))`);
  run(`(defun wrapt-times-ten (x) (* 10 (funcall (revival-wrapped 'wrapt-double 'test2) x)))`);
  return { L, run };
}

test("REVIVE;WRAP wraps once, though the hook fires twice or the file is loaded again", () => {
  const { run } = withWrapTest();
  // the hook given twice: both fire after each load of KEN;WRAPT
  run(`(+after-load '|ken;wrapt >| '(revival-wrap 'wrapt-double 'test 'wrapt-plus-one))`);
  run(`(+after-load '|ken;wrapt >| '(revival-wrap 'wrapt-double 'test 'wrapt-plus-one))`);
  run(`(load '|ken;wrapt >|)`);
  assert.equal(run("(wrapt-double 5)"), "11");
  // loaded again: Ken's definition comes back, and is wrapped again, once
  run(`(load '|ken;wrapt >|)`);
  assert.equal(run("(wrapt-double 5)"), "11");
  // a hook given after the file has loaded fires at once
  run(`(+after-load '|ken;wrapt >| '(revival-wrap 'wrapt-double 'test 'wrapt-plus-one))`);
  assert.equal(run("(wrapt-double 5)"), "11");
  // a second wrapper goes round the first, and both survive another load
  run(`(+after-load '|ken;wrapt >| '(revival-wrap 'wrapt-double 'test2 'wrapt-times-ten))`);
  assert.equal(run("(wrapt-double 5)"), "110");
  run(`(load '|ken;wrapt >|)`);
  assert.equal(run("(wrapt-double 5)"), "110");
  // REVIVE;WRAP loaded again changes nothing
  run(`(load '|revive;wrap >|)`);
  assert.equal(run("(wrapt-double 5)"), "110");
  assert.equal(run("(mapcar 'car (get 'wrapt-double 'revival-wraps))"), "(TEST2 TEST)");
});

test("REVIVE;WRAP's revival-once does what can't be wrapped once, though the hook fires twice", () => {
  const { run } = withWrapTest();
  run("(setq wrapt-count 0)");
  run("(defun wrapt-count-up () (setq wrapt-count (1+ wrapt-count)))");
  run(`(+after-load '|ken;wrapt >| '(revival-once 'wrapt-once 'wrapt-count-up))`);
  run(`(+after-load '|ken;wrapt >| '(revival-once 'wrapt-once 'wrapt-count-up))`);
  run(`(load '|ken;wrapt >|)`);
  assert.equal(run("wrapt-count"), "1");
  run(`(+after-load '|ken;wrapt >| '(revival-once 'wrapt-once 'wrapt-count-up))`);
  assert.equal(run("wrapt-count"), "1");
});

test("REVIVE;WRAP refuses what it can't wrap", () => {
  const { run } = withWrapTest();
  assert.throws(() => run("(revival-wrap 'wrapt-no-such-function 'test 'wrapt-plus-one)"), /shouldnt happen/);
  run(`(load '|ken;wrapt >|)`);
  assert.throws(() => run("(revival-wrap 'wrapt-double 'test 'wrapt-no-such-wrapper)"), /shouldnt happen/);
  assert.throws(() => run("(revival-wrapped 'wrapt-double 'test)"), /shouldnt happen/);
  assert.equal(run("(wrapt-double 5)"), "10");
});

test("a repair note is memorized once, and the glass box collects it", () => {
  const { L, run } = withWrapTest();
  run("(define wrapt-task something)");
  run("(define wrapt-subscene something)");
  run("(revival-note 'wrapt-task 'unknown-word 'grumpy nil 'no-such-word)");
  run("(revival-note 'wrapt-task 'unknown-word 'grumpy nil 'no-such-word)");
  run("(revival-note 'wrapt-subscene 'brought-on-stage 'wolf '(getting-on-stage wolf) 'off-the-stage)");
  assert.equal(run("(ask wrapt-task collect items)"), "((REVIVAL-REPAIR: WHAT UNKNOWN-WORD WAS GRUMPY NOW NIL BECAUSE NO-SUCH-WORD))");
  assert.equal(run("(ask wrapt-task recall an item matching (revival-repair: what ?w was ?x now ? because ?) then (list w x))"), "(UNKNOWN-WORD GRUMPY)");
  // the task as glassBox records it; the subscene only as revival-note noted it
  const items = (name) => L.toArray(L.evalString(`(ask ${name} collect items)`)).map((x) => L.print(x).toLowerCase());
  const glass = {
    scene: { name: "wrapt-scene", items: [] }, tasks: [{ name: "wrapt-task", items: items("wrapt-task") }],
    subscenes: [], plans: [], dynamics: [], choices: { name: "(choices-made-in wrapt-scene)", items: [] },
  };
  assert.deepEqual(repairNotes(L, glass), [
    { actor: "wrapt-task", note: "(revival-repair: what unknown-word was grumpy now nil because no-such-word)" },
    { actor: "wrapt-subscene", note: "(revival-repair: what brought-on-stage was wolf now (getting-on-stage wolf) because off-the-stage)" },
  ]);
});

test("a repair note on a pass-1 choice point is in its memory, as the pass-1 glass box shows it", () => {
  const L = boot(makeProjectFileSystem(), { extensions: ["mend"] });
  L.evalString("(load '|ken;datest >|)");
  // one choice point of each kind, as pass 1 makes them
  L.evalString("(ask absolute-choice-point make (choice-point-of wrapt speed))");
  L.evalString("(ask relative-choice-point make (relative-choice-point-of (wrapt wrapu) relative-speed))");
  L.evalString("(revival-note '(choice-point-of wrapt speed) 'narrowed '(not high) 'medium '(variety level))");
  const points = collectChoicePoints(L);
  assert.deepEqual(points.map((c) => c.memory), [
    [],
    [["revival-repair:", "what", "narrowed", "was", ["not", "high"], "now", "medium", "because", ["variety", "level"]]],
  ]);
});
