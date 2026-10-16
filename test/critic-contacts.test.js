// REVIVE;CRITSC's contact table (reports/chapter-x/design-criticism.md, section 4.3):
// which ways of showing bring which two of their characters together, read from the
// code by tools/critic-contacts.mjs. The table in src/director/revive/critsc.lisp must
// be the one the files give today, so that a new way of showing, Ken's or the
// revival's, can't escape "keep these two apart" unseen; and it must say what the
// design read from DISPLY by hand.
import { test } from "node:test";
import assert from "node:assert/strict";
import { contactTable, tableInFile, displayContacts, conveyContacts } from "../tools/critic-contacts.mjs";

test("critsc.lisp's contact table is the one the files give (node tools/critic-contacts.mjs --write)", () => {
  assert.equal(tableInFile(), contactTable());
});

test("the ways of showing that bring two together are DISPLY's five and the revival's own", () => {
  const display = displayContacts();
  const pairs = Object.fromEntries(display.map((e) => [e.method, e.pairs.map((p) => p.pair)]));
  // the design's reading of DISPLY's run receivers (contact-with and move-characters)
  for (const m of ["move-to-and-hits", "goes-to-and-accompanys", "pushes-around", "move-to-each-other", "repeatedly-come-in-contact"]) assert.deepEqual(pairs[m], [[1, 2]], m);
  for (const m of ["chases-to", "stands-guard", "move-small-part-towards", "alternately-turn", "move-near-and-turn", "exit-by"]) assert.deepEqual(pairs[m], [], m);
  // and the revival's: MEND5's move-to goes to the one in its place; KNOW's helping and
  // following come in contact, moving away does not; CHSHOW's transforming does
  assert.deepEqual(pairs["move-to"], [[1, ["place", 2]]]);
  assert.deepEqual(pairs["helps-along"], [[1, 2]]);
  assert.deepEqual(pairs["follows-behind"], [[1, 2]]);
  assert.deepEqual(pairs["moves-away-from"], []);
  assert.deepEqual(pairs["goes-to-and-transforms"], [[1, 2]]);
  // every pair cites the lines it was read from
  for (const e of display) for (const p of e.pairs) assert.ok(p.at.length && p.at.every((a) => /:\d+$/.test(a)), e.method);
});

test("the verbs every way of showing of which brings their two together", () => {
  const verbs = Object.fromEntries(conveyContacts().map((v) => [v.verb, v.together]));
  for (const v of ["accompanys", "meets", "pushes", "hurts", "helps", "follows"]) assert.ok(verbs[v] && verbs[v].length === 1, v);
  for (const v of ["chases", "avoids"]) assert.deepEqual(verbs[v] || [], [], v);
});
