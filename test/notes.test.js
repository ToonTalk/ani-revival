// The repair notes src/pipeline.js collects outside pass 1: pass 2's glass box and the
// filming collect them only when REVIVE;WRAP is loaded (a run as in 1978 is left as it
// was, :revival-noted never so much as interned), and a note left while a scene is
// filmed comes back with the film.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeProjectFileSystem, mountRunOutputs } from "../src/its/node-fs.js";
import { pass2, film } from "../src/pipeline.js";

// The project's files with what the 1978 run wrote (reports/pass2/: the programs and
// where each scene left the characters).
function filesOfTheRun() {
  const fs = makeProjectFileSystem();
  mountRunOutputs(fs);
  return fs;
}

test("as in 1978, pass 2's glass box and a film have no repairs, and nothing looks for any", () => {
  const p2 = pass2(filesOfTheRun(), "introduction");
  assert.equal("repairs" in p2.glass, false);
  assert.equal(p2.lisp.obarray.find(":REVIVAL-NOTED"), null);
  const f = film(filesOfTheRun(), "introduction", { frames: 3 });
  assert.equal("repairs" in f.film, false);
  assert.equal(f.lisp.obarray.find(":REVIVAL-NOTED"), null);
});

test("a note left while filming comes back with the film: MEND2's weightify guard in Director", () => {
  // the Introduction's program with every special dynamics' speed none, as pass 1
  // records an element it gave up on (choose.198:69-73)
  const fs = filesOfTheRun();
  const program = readFileSync("reports/pass2/ken-introd.uction", "utf8").replace(/\(SET YOUR SPEED TO [A-Z]+\)/g, "(SET YOUR SPEED TO NONE)");
  fs.addFile("KEN", "INTROD", "UCTION", { text: program, origin: "test" });
  const f = film(fs, "introduction", { frames: 3, extensions: ["mend"] });
  assert.ok(f.film.repairs && f.film.repairs.length, "the film has repairs");
  for (const r of f.film.repairs) {
    assert.match(r.actor, /special-dynamics-of/);
    assert.equal(r.note, "(revival-repair: what read-as-medium was none now medium because (weightify knows only low short medium long and high))");
  }
  // and with nothing to repair, a film with MEND has none
  const plain = film(filesOfTheRun(), "introduction", { frames: 3, extensions: ["mend"] });
  assert.equal("repairs" in plain.film, false);
});
