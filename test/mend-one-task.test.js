// REVIVE;MEND18 (M18): a scene whose only task is shown by one convey task. Every scene
// of Cinderella that establishes something is an (and ...) or a (sequence: ...) of
// tasks, so SCENE's simplify-task-ordering never meets a lone task there, and
// tools/check-1978.mjs can't notice the repair missing; these check that it is
// installed once SCENE has loaded, and what it does. The stress story
// test/stories/stress/only-relationship.lisp shows it in a whole film
// (node tools/run-story.mjs <story> --extensions mend).
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot } from "../src/pipeline.js";

function lisp(extensions = ["mend"]) {
  const L = boot(makeProjectFileSystem(), { extensions });
  const run = (src) => L.print(L.evalString(src));
  return { L, run };
}
const wraps = (run, f) => run(`(mapcar 'car (get '${f} 'revival-wraps))`);
const notes = (run, actor) => run(`(ask ${actor} collect items memorized matching (revival-repair: %))`);

test("MEND18 wraps simplify-task-ordering once SCENE has loaded, and again when it loads again; not in 1978 mode", () => {
  const { run } = lisp();
  assert.equal(wraps(run, "simplify-task-ordering"), "NIL");
  run("(load '|ken;scene >|)");
  assert.equal(wraps(run, "simplify-task-ordering"), "(MEND18)");
  run("(load '|ken;scene >|)");
  assert.equal(wraps(run, "simplify-task-ordering"), "(MEND18)");
  assert.equal(run("(eq (get 'simplify-task-ordering 'expr) (get 'simplify-task-ordering-of-one-task 'expr))"), "T");
  const ken = lisp([]);
  ken.run("(load '|ken;scene >|)");
  assert.equal(wraps(ken.run, "simplify-task-ordering"), "NIL");
});

test("M18: a lone task, which Ken's simplify-task-ordering stops on, is the ordering it is, with a note on it", () => {
  const ken = lisp([]);
  ken.run("(load '|ken;scene >|)");
  ken.run("(define t-task something)");
  assert.throws(() => ken.run("(simplify-task-ordering 't-task)"), /cdr of non-list: T-TASK/);
  // as process-scene-description hands it the scene's ordering, the establish task
  // replaced by its one convey task (scene.9:398-402)
  assert.throws(() => ken.run("(reorder-task-ordering (subst 't-task 't-establish 't-establish))"), /cdr of non-list: T-TASK/);
  const { run } = lisp();
  run("(load '|ken;scene >|)");
  run("(define t-task something)");
  assert.equal(run("(reorder-task-ordering (subst 't-task 't-establish 't-establish))"), "T-TASK");
  assert.equal(notes(run, "t-task"), "((REVIVAL-REPAIR: WHAT ONE-TASK-ORDERING WAS (REST T-TASK) NOW T-TASK BECAUSE (THE ORDERING IS ONE TASK)))");
  // noted once, however often
  assert.equal(run("(simplify-task-ordering 't-task)"), "T-TASK");
  assert.equal(run("(length (ask t-task collect items memorized matching (revival-repair: %)))"), "1");
});

test("M18: a list, and nil, are Ken's, with no note", () => {
  for (const extensions of [[], ["mend"]]) {
    const { run } = lisp(extensions);
    run("(load '|ken;scene >|)");
    for (const t of ["t-a", "t-b", "t-c"]) run(`(define ${t} something)`);
    // the new part of a scene where an establish task's one convey task takes its place
    // (chomet.123:510-513, order-parallel-tasks, scene.9:489-510)
    assert.equal(run("(simplify-task-ordering '(and (sequence: (and t-a))))"), "T-A");
    assert.equal(run("(simplify-task-ordering '(and t-a (sequence: t-b (and t-c))))"), "(AND T-A (SEQUENCE: T-B T-C))");
    assert.equal(run("(reorder-task-ordering '(sequence: t-a))"), "T-A");
    assert.equal(run("(simplify-task-ordering nil)"), "(NIL)");
    for (const t of ["t-a", "t-b", "t-c"]) assert.equal(notes(run, t), "NIL");
  }
});
