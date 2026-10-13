// Gemini Nano, held to the JSON way's form (Chrome's responseConstraint), can pad its answer
// with white space and never stop: the form allows white space between any two parts. The
// film page (app/film/llm.js) ends Nano's answer once its JSON is whole, and after a long run
// of white space closes what is still open. scanJson is read from the page's own file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../app/film/llm.js", import.meta.url), "utf8");
const scanJson = new Function(`${src.slice(src.indexOf("function scanJson"), src.indexOf("const nanoApi"))}; return scanJson;`)();
const closed = (text) => {
  const { open, inString } = scanJson(text);
  return (text.trimEnd() + (inString ? '"' : "")).replace(/,$/, "") + open.reverse().map((b) => (b === "{" ? "}" : "]")).join("");
};

test("a whole answer ends where its JSON does, brackets in strings not counted", () => {
  const text = '{"a": [1, {"b": "x}]"}], "c": "q\\"}"}   \n   ';
  const { end } = scanJson(text);
  assert.equal(text.slice(0, end), '{"a": [1, {"b": "x}]"}], "c": "q\\"}"}');
  assert.deepEqual(JSON.parse(text.slice(0, end)).c, 'q"}');
});

test("an answer that isn't whole has no end, and what is open is closed", () => {
  for (const [text, want] of [
    ['{"a": [1, 2], "f": {"s": ["d"]}' + " ".repeat(500), { a: [1, 2], f: { s: ["d"] } }],
    ['{"b": [1,', { b: [1] }],
    ['{"t": "half', { t: "half" }],
  ]) {
    assert.equal(scanJson(text).end, -1, text);
    assert.deepEqual(JSON.parse(closed(text)), want);
  }
});

test("the page stops reading after a run of 400 white space characters", () => {
  const i = src.indexOf("async nano(");
  const nano = src.slice(i, src.indexOf("\n  },\n", i));
  assert.match(nano, /scanJson\(text\)/);
  assert.match(nano, /\\s\{400\}\$/);
  assert.match(nano, /reader\.cancel\(\)/);
});
