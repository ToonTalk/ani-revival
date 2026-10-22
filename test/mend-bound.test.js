// REVIVE;MEND21 (M21): a scene planned exactly at its least or its most time, which Ken's
// redistribute-time-for-tasks (chomet.123:39-65) asks only whether it is strictly within
// its bounds, below them or above them, and so stops on: "shouldnt happen"
// (arithmetic goofed up). Ken's Cinderella has a range of lengths, and no scene is
// planned at a bound, so tools/check-1978.mjs can't notice the repair missing; these
// check it on a scene of one time, as a film of 1 to 1 minutes gives every scene.
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot } from "../src/pipeline.js";

function lisp(extensions = ["mend"]) {
  const L = boot(makeProjectFileSystem(), { extensions });
  const run = (src) => L.print(L.evalString(src));
  return { L, run };
}
// a scene with no tasks or parts whose least and most are both 12 seconds; with no
// time changes its new length is 12, exactly at both
function aSceneOfOneTime(run, bounds = "12.0 12.0") {
  run("(load '|ken;chomet >|)");
  run("(define t-one-time something)");
  run(`(ask t-one-time set your length-bounds to (${bounds}))`);
  run("(ask t-one-time set your task-ordering to nil)");
  run("(ask t-one-time set your subscenes to nil)");
}

test("M21: in 1978 mode a scene planned exactly at its bounds stops: arithmetic goofed up", () => {
  const { L, run } = lisp([]);
  aSceneOfOneTime(run);
  assert.throws(() => L.evalString("(redistribute-time-for-tasks nil 't-one-time nil)"), /ARITHMETIC GOOFED UP/i);
});

test("M21: with MEND it is within its bounds, each task given its ideal time, and noted", () => {
  const { run } = lisp();
  aSceneOfOneTime(run);
  run("(redistribute-time-for-tasks nil 't-one-time nil)");
  assert.match(run("(ask t-one-time collect items memorized matching (revival-repair: %))"),
    /\(REVIVAL-REPAIR: WHAT SCENE-AT-ITS-BOUND WAS \(ARITHMETIC GOOFED UP\) NOW WITHIN BECAUSE \(NEW-LENGTH 12\.0 LEAST 12\.0 MOST 12\.0\)\)/i);
  assert.equal(run("(ask t-one-time recall your running-time)"), "0");
});

test("M21: a scene strictly within its bounds goes to Ken's, with no note", () => {
  const { run } = lisp();
  aSceneOfOneTime(run, "10.0 14.0");
  run("(redistribute-time-for-tasks nil 't-one-time nil)");
  assert.equal(run("(ask t-one-time collect items memorized matching (revival-repair: %))"), "NIL");
});

test("M21: with FIT, whose reading of the bounds is its own (s15-signs), the same", () => {
  const { run } = lisp(["mend", "fit"]);
  aSceneOfOneTime(run);
  run("(redistribute-time-for-tasks nil 't-one-time nil)");
  assert.match(run("(ask t-one-time collect items memorized matching (revival-repair: %))"), /SCENE-AT-ITS-BOUND/i);
});
