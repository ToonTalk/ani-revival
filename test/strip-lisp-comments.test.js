// tools/strip-lisp-comments.mjs: the revival's Lisp without its comments, for the claude.ai
// copy of the film page, every line kept and every form read back alike; and the build's
// check that says where a stripped file would read differently.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { stripLispComments, differentForms } from "../tools/strip-lisp-comments.mjs";

test("a comment goes to the end of its line, with the blanks before it; |symbols| and / escapes keep their semicolons", () => {
  const text = "(setq a 1) ;; one\n;;; a whole line\n(print '|c ; d|) ; why\n(setq e /;) ;x\n(print '|two\nlines; e|)\n";
  assert.equal(stripLispComments(text), "(setq a 1)\n\n(print '|c ; d|)\n(setq e /;)\n(print '|two\nlines; e|)\n");
  assert.equal(differentForms(text, stripLispComments(text)), null);
});

test("the check says when a text reads differently, or has other lines", () => {
  assert.match(differentForms("(a)\n(b)\n", "(a)\n(c)\n"), /reads differently from its form 2 \(line 2\)/);
  assert.match(differentForms("(a)\n(b)\n", "(a) (b)\n"), /has 2 lines, not 3/);
  assert.match(differentForms("(a)\n(b)\n", "(a)\n\n"), /reads as 1 forms, not 2/);
});

test("every file of the revival's reads back alike without its comments, on the same lines", () => {
  for (const f of readdirSync("src/director/revive").filter((x) => x.endsWith(".lisp"))) {
    const text = readFileSync(`src/director/revive/${f}`, "utf8").replace(/\r\n?/g, "\n");
    const stripped = stripLispComments(text);
    assert.equal(differentForms(text, stripped), null, f);
    assert.ok(stripped.length < text.length, f);
  }
});
