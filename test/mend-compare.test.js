// MEND's empty comparison (src/director/revive/mend8.lisp): M8 lets pass 1 go on when
// two characters have nothing to compare, where Ken's summarize-comparison stops
// (sumcom.53:8-10). Cinderella's characters always share a word, so
// tools/check-1978.mjs can't notice it missing; these check that the wrapper is
// installed once SUMCOM has loaded, and what it does for the goat and the kid of
// test/stories/stress/no-descriptors.lisp, against what Ken's code does without it.
// The whole story: node tools/run-story.mjs test/stories/stress/no-descriptors.lisp --extensions mend
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot } from "../src/pipeline.js";

const STORY = readFileSync(new URL("./stories/stress/no-descriptors.lisp", import.meta.url), "utf8").replace(/\r\n/g, "\n");

// Pass 1 up to its choosing: DATEST loads the story (as the next KEN;CINDY) and its
// files, and (init nil) makes the characters; comparisons are made later, on demand.
function initialized(extensions) {
  const fs = makeProjectFileSystem();
  fs.addFile("KEN", "CINDY", "47", { text: STORY, origin: "test" });
  const L = boot(fs, { extensions });
  const run = (src) => L.print(L.evalString(src));
  run("(load '|ken;datest >|)");
  run("(init nil)");
  return { L, run };
}

const wraps = (run, f) => run(`(mapcar 'car (get '${f} 'revival-wraps))`).replace(/[()]/g, "").split(" ").filter((x) => x && x !== "NIL");
const NOTES = "memorized matching (revival-repair: what ? was ? now ? because ?)";

test("M8 wraps summarize-comparison once SUMCOM loads, and once only", () => {
  const fs = makeProjectFileSystem();
  const L = boot(fs, { extensions: ["mend"] });
  const run = (src) => L.print(L.evalString(src));
  assert.deepEqual(wraps(run, "summarize-comparison"), [], "nothing wrapped before SUMCOM loads");
  run("(load '|ken;sumcom >|)");
  run("(load '|revive;mend8 >|)"); // the hook fires again; nothing is wrapped twice
  assert.deepEqual(wraps(run, "summarize-comparison"), ["MEND8"]);
  run("(load '|ken;sumcom >|)"); // Ken's definition back, and wrapped again
  assert.deepEqual(wraps(run, "summarize-comparison"), ["MEND8"]);
  assert.equal(run("(eq (get 'summarize-comparison 'expr) (get 'summarize-comparison-even-of-nothing 'expr))"), "T");
});

test("without MEND, two characters with nothing to compare stop pass 1, as in 1978", () => {
  const { run } = initialized([]);
  assert.deepEqual(wraps(run, "summarize-comparison"), []);
  assert.throws(() => run("(ask goat compare yourself with kid)"), /SUMMARIZE-COMPARISON \(\(COMPARISON-OF GOAT KID\) DOES NOT EXIST\)/);
});

test("with MEND, they get an empty comparison with a note, and others are as Ken's", () => {
  const { run } = initialized(["mend"]);
  assert.equal(run("(exists? '(comparison-of goat kid))"), "NIL");
  run("(ask goat compare yourself with kid)");
  // made as record-comparison makes one, so the kid's way round names it too
  assert.equal(run("(eq (actor-of '(comparison-of goat kid)) (actor-of '(comparison-of kid goat)))"), "T");
  assert.equal(run("(ask (comparison-of goat kid) collect items memorized matching (comparison: %))"), "NIL");
  assert.equal(run("(ask (comparison-of goat kid) collect items memorized matching (comparison-summary: %))"), "NIL");
  assert.equal(run(`(ask (comparison-of goat kid) collect items ${NOTES})`),
    "((REVIVAL-REPAIR: WHAT NOTHING-TO-COMPARE WAS STOPPED NOW EMPTY BECAUSE (NO SAME OPPOSITE OR NEIGHBORING DESCRIPTORS)))");
  assert.equal(run(":revival-noted"), "((COMPARISON-OF GOAT KID))");
  // the goat and the troll have findings: Ken's code makes their comparison, no note
  run("(ask goat compare yourself with troll)");
  assert.equal(run("(ask (comparison-of goat troll) collect items memorized matching (comparison: %))") === "NIL", false);
  assert.equal(run(`(ask (comparison-of goat troll) collect items ${NOTES})`), "NIL");
  // and the comparison yields its relative choice points, as find-relative-choice-points asks next
  assert.match(run("(ask (comparison-of goat kid) yield your relative choice point of speed)"), /RELATIVE-CHOICE-POINT-OF/);
});
