// REVIVE;MEND17 (M17): more than a few ways to convey what a task establishes. Ken's
// eliminate-convey-suggestions calls explore-method-suggestions, which he never wrote,
// when more than a few are left (chomet.123:516-547); Cinderella never gets there, so
// tools/check-1978.mjs can't notice it missing. These check what it does on a small
// case. A model's Lion and the Mouse (reports/llm-trials/2026-10-11 gpt-6.1-sol/) shows
// it in a whole film with KNOW (node tools/run-story.mjs <story> --extensions
// mend,appear,change,know).
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot } from "../src/pipeline.js";

function lisp(extensions = ["mend"]) {
  const L = boot(makeProjectFileSystem(), { extensions });
  const run = (src) => L.print(L.evalString(src));
  return { L, run };
}

// Three related suggestions of three sources, as the lion's relationship to the mouse
// makes them with KNOW: pushing (dominates, low), accompanying (is-protective-to, low)
// and helping (is-generous-towards, as its neighbor is-helpful-towards, medium).
const related = (value, strength, source) =>
  `(related-suggestion: main-suggestion (suggestion: element (establish (relationship (relationship-of lion mouse))) value (method: type convey value ${value}) strength ${strength} source ${source}) relationship identical)`;
const three = `(list '${related("(accompanys lion mouse)", "low", "is-protective-to")} '${related("(pushes lion mouse)", "low", "dominates")} '${related("(helps lion mouse)", "medium", "is-generous-towards")})`;

test("M17: in 1978 mode, more than a few left stops on explore-method-suggestions", () => {
  const { run } = lisp([]);
  run("(load '|ken;chomet >|)");
  run("(define t-task something)");
  assert.throws(() => run(`(eliminate-convey-suggestions ${three} nil 't-task nil 2)`), /EXPLORE-METHOD-SUGGESTIONS undefined function/);
});

test("M17: the strongest few are kept, the first of equals winning, in the order they came", () => {
  const { run } = lisp();
  run("(load '|ken;chomet >|)");
  run("(define t-task something)");
  const kept = run(`(mapcar 'value-of-related-suggestion (eliminate-convey-suggestions ${three} nil 't-task nil 2))`);
  assert.equal(kept, "((ACCOMPANYS LION MOUSE) (HELPS LION MOUSE))");
  assert.equal(run("(ask t-task collect items memorized matching (revival-repair: %))"),
    "((REVIVAL-REPAIR: WHAT EXPLORED WAS ((ACCOMPANYS LION MOUSE) (PUSHES LION MOUSE) (HELPS LION MOUSE)) NOW ((ACCOMPANYS LION MOUSE) (HELPS LION MOUSE)) BECAUSE (A FEW IS 2)))");
  // a few or fewer: Ken's own answer, and no note
  run("(define t-task2 something)");
  assert.equal(run(`(length (eliminate-convey-suggestions (cdr ${three}) nil 't-task2 nil 2))`), "2");
  assert.equal(run("(ask t-task2 collect items memorized matching (revival-repair: %))"), "NIL");
  assert.equal(run(`(mapcar 'value-of-related-suggestion (strongest-few-related-suggestions ${three} 1))`), "((HELPS LION MOUSE))");
});
