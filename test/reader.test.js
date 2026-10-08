import { test } from "node:test";
import assert from "node:assert/strict";
import { makeReader, printForm, Flonum, Sym } from "../src/maclisp/reader.js";
import { decodeItsText } from "../src/its/text.js";

const read1 = (text, opts) => makeReader(opts).readAll(text)[0].form;
const show = (text, opts) => printForm(read1(text, opts));

test("symbols are upcased; bars keep case; slash escapes", () => {
  assert.equal(read1("foo-bar").name, "FOO-BAR");
  assert.equal(read1("|When receiving|").name, "When receiving");
  assert.equal(read1("'/ ").cdr.car.name, " ");
  assert.equal(read1("/#print").name, "#PRINT"); // only the escaped character is taken literally
  assert.equal(read1("|ai:ken;declare >|").name, "ai:ken;declare >");
});

test("numbers: ibase, trailing dot, flonums", () => {
  assert.equal(read1("550"), 550);
  assert.equal(read1("10."), 10);
  assert.equal(read1("-12"), -12);
  assert.ok(read1("2.0") instanceof Flonum);
  assert.equal(read1(".07").value, 0.07);
  assert.equal(read1("17", { ibase: 8 }), 15);
  assert.equal(read1("18", { ibase: 8 }), 18); // a numeral with 8 or 9 reads as decimal
  assert.ok(read1("1+") instanceof Sym);
  assert.ok(read1("*$") instanceof Sym);
});

test("Director read macros", () => {
  assert.equal(show("(ask ,choice-point recall your current-choice)"), "(ask ,choice-point recall your current-choice)");
  assert.equal(read1(",x").car.name, "DIRECTOR-SYMBOL-FOR-EVAL");
  assert.equal(read1("`x").car.name, "DIRECTOR-SYMBOL-FOR-POSTPONED-EVAL");
  assert.equal(read1("!,x").car.name, "DIRECTOR-SYMBOL-FOR-UNPACK");
  assert.equal(read1("{or a an}").car.name, "DIRECTOR-SYMBOL-FOR-OR-PATTERN");
  assert.equal(read1("{and ?x ,p}").car.name, "DIRECTOR-SYMBOL-FOR-AND-PATTERN");
  assert.equal(read1("#(getcharn '? 1)").car.name, "SHARP-EVAL");
});

test("comments, form feeds, dotted pairs, stray close parens", () => {
  assert.equal(show("(a ;comment\n\f b . c)"), "(a b . c)");
  const forms = makeReader().readAll("(a))\n(b)");
  assert.equal(forms.length, 2);
  assert.equal(forms.warnings.length, 1);
});

test("old files: braces are ordinary characters", () => {
  assert.equal(read1("(eq x '/{)", { braces: false }).cdr.cdr.car.cdr.car.name, "{");
  assert.equal(read1("(up-til '} y)", { braces: false }).cdr.car.cdr.car.name, "}");
});

test("ITS text: words with bit 35 set decode to their five characters", () => {
  // "prere" with bit 35 set, as found in SUGCON 26
  const bytes = Buffer.from([0x28, 0x61, 0x64, 0x64, 0x2d, 0xfe, 0x1c, 0xb2, 0xf2, 0xcb, 0x71, 0x75, 0x69]);
  const { text, flaggedWords } = decodeItsText(bytes);
  assert.equal(text, "(add-prerequi");
  assert.equal(flaggedWords, 1);
  // trailing ^C padding is dropped
  assert.equal(decodeItsText(Buffer.from("(a)\x03\x03")).text, "(a)");
});

test("ITS evacuate format: line endings and rubout pairs", () => {
  // LF stands for ITS's CR LF; CR for a lone LF; 0x80-0xED for rubout + a character
  assert.equal(decodeItsText(Buffer.from([0x61, 0x0a, 0x62, 0x0d, 0x63])).text, "a\nb\nc");
  assert.equal(decodeItsText(Buffer.from([0x28, 0x64, 0xb6, 0x34])).text, "(d\x7f64"); // a tags-table entry
  assert.equal(decodeItsText(Buffer.from([0xee, 0xef])).text, "\r\x7f");
});
