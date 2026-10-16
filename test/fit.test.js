// FIT (src/director/revive/fit.lisp): S15, a scene keeps the time its length gives it,
// Ken's decision of 16 October (on with the revival's extensions, never in "Ani as in
// 1978"). These reproduce Ken's No Longer Kept Apart, planned as in 1978 from where his
// 1978 Kept Apart left everyone (reports/pass2/): a short scene, (length-bounds (10.0
// 25.0)), whose one task is given 3.98 s by Ken's CHOMET, and with FIT 10 s; and each
// piece's line against Ken's. Ken's Cinderella with FIT, chained, is checked by
// tools/check-ext.mjs --extensions fit (reports/ext/fit/), and with SLIPS by
// tools/check-ext.mjs --extensions slips.
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeProjectFileSystem, mountRunOutputs } from "../src/its/node-fs.js";
import { boot, extensionsFor, EXTENSIONS, pass2 } from "../src/pipeline.js";

const godmothersScene = (extensions, off = null) => {
  const fs = makeProjectFileSystem();
  mountRunOutputs(fs); // reports/pass2: KEN1;KA POSIT and KEPT MINI, as the 1978 run left them
  const setup = off ? (L) => L.evalString(`(setq :slips-off '(${off}))`) : null;
  const { glass } = pass2(fs, "no-longer-kept-apart", { extensions, setup });
  return { scene: glass.scene.variables, task: glass.tasks[0].variables, part: glass.subscenes[0].variables, notes: (glass.repairs || []).map((r) => r.note) };
};

test("the registry: FIT is a repair, on with the revival's extensions, requiring MEND; SLIPS requires it", () => {
  const fit = EXTENSIONS.find((e) => e.id === "fit");
  assert.equal(fit.group, "repairs");
  assert.ok(!fit.optIn);
  assert.equal(fit.changes1978, true);
  assert.deepEqual(fit.files, ["wrap", "fit"]);
  assert.deepEqual(extensionsFor(["fit"]).map((e) => e.id), ["mend", "fit"]);
  assert.deepEqual(extensionsFor(["slips"]).map((e) => e.id), ["mend", "know", "fit", "slips"]);
});

test("Ken's CHOMET gives No Longer Kept Apart 3.98 s against its own least of 10; FIT holds it to 10, SCENE stretching the godmother's accompanying", () => {
  // as in 1978 (MEND changes nothing in Ken's Cinderella): the allocation moved by
  // -6.08 to (3.92 18.92), the scene judged by 17.5 - 6.08 = 11.42, the task given its
  // ideal, 3.98 s
  const ken = godmothersScene(["mend"]);
  assert.equal(ken.scene["length-bounds"], "(10.0 25.0)");
  assert.equal(ken.task["allocated-time"], "(3.9198 18.9198)");
  assert.equal(ken.task["running-time"], "3.98");
  assert.equal(ken.scene["running-time"], "3.98");
  assert.equal(ken.part["stretched-by"], "1.0");
  const estimate = Object.entries(ken.part).find(([k]) => k.startsWith("(time-estimates-for (goes-to-and-accompanys"));
  assert.equal(estimate[1], "(time-estimates: ideal 3.98 most 6.95 least 2.792)");
  // with FIT: adjust-task-lengths takes the task to its most, 6.95, and what is left,
  // 3.05, the scene's one part's task takes past it
  const fit = godmothersScene(["mend", "fit"]);
  assert.equal(fit.task["running-time"], "10.0");
  assert.equal(fit.scene["running-time"], "10.0");
  assert.equal(fit.part["stretched-by"], "2.5125628");
  assert.deepEqual(fit.notes, [
    "(revival-repair: what scene-time-kept was (planned 3.98) now 10.0 because ((length-bounds 10.0 25.0) (convey-task-3 was 3.98 now 10.0 least 2.792 most 6.95)))",
    "(revival-repair: what task-time-bound was 2.792 now 6.95 because (new-time 10.0 most 6.95))",
  ]);
  // turned off, Ken's
  const off = godmothersScene(["mend", "fit"], "s15");
  assert.equal(off.task["running-time"], "3.98");
  assert.deepEqual(off.notes, []);
  // with Ken's adjust-task-lengths (s15-least-most off) the task above its most is given
  // its least, ";;must be too small" (chomet.123:174-178), and its least is none
  // (chomet.123:121, 129): the scene would have no time at all, so S15 fills it from
  // nothing it can scale, and leaves it so
  const kensAdjust = godmothersScene(["mend", "fit"], "s15-least-most");
  assert.equal(kensAdjust.task["running-time"], "0.0");
});

test("s15-reason: resurect-bad-time-fits hears need-more-time:, the name time-fit-score-1 writes; Ken's looks for more-time-needed:", () => {
  const L = boot(makeProjectFileSystem(), { extensions: ["fit"] });
  const run = (src) => L.print(L.evalString(src)).toLowerCase();
  run("(load '|ken;chomet >|)");
  assert.equal(run("(mapcar 'car (get 'resurect-bad-time-fits 'revival-wraps))"), "(fit)");
  const rejects = "'((rejected-suggestion: reason (need-more-time: ideal-difference 2.5 will-accept 1.25) suggestion s1) (rejected-suggestion: reason (too-much-time: ideal-difference -4.0 will-accept -3.0) suggestion s2))";
  assert.equal(run(`(resurect-bad-time-fits ${rejects} 'ideal-difference)`), "2.5");
  assert.equal(run(`(resurect-bad-time-fits ${rejects} 'will-accept)`), "1.25");
  run("(setq :slips-off '(s15-reason))");
  assert.equal(run(`(resurect-bad-time-fits ${rejects} 'ideal-difference)`), "-4.0");
});

test("a scene with no length-bounds (no task of it ever given a share of them) is left as it is", () => {
  const L = boot(makeProjectFileSystem(), { extensions: ["fit"] });
  const run = (src) => L.print(L.evalString(src)).toLowerCase();
  run("(load '|ken;chomet >|)");
  run("(define t-scene something)");
  assert.equal(run("(keep-the-scene-time 't-scene)"), "nil");
  assert.equal(run("(ask t-scene recall your running-time)"), "nil");
});

test("each piece is wrapped once CHOMET loads, after MEND11's adjust-task-lengths; as in 1978 none is", () => {
  const L = boot(makeProjectFileSystem(), { extensions: ["fit"] });
  const run = (src) => L.print(L.evalString(src)).toLowerCase();
  run("(load '|ken;chomet >|)");
  for (const f of ["approve-or-remake-tasks-choices", "redistribute-time-for-tasks", "time-bounds-for-task"]) assert.equal(run(`(mapcar 'car (get '${f} 'revival-wraps))`), "(fit)", f);
  assert.equal(run("(mapcar 'car (get 'adjust-task-lengths 'revival-wraps))"), "(fit mend11)");
  run("(load '|revive;fit >|)");
  assert.equal(run("(mapcar 'car (get 'approve-or-remake-tasks-choices 'revival-wraps))"), "(fit)");
  const K = boot(makeProjectFileSystem(), { extensions: [] });
  K.evalString("(load '|ken;chomet >|)");
  assert.equal(K.print(K.evalString("(get 'approve-or-remake-tasks-choices 'revival-wraps)")).toLowerCase(), "nil");
});
