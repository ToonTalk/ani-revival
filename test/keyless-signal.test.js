// In a claude.ai chat artifact the page's fetch goes to the chat through postMessage, which
// can't carry an AbortSignal: fetch(url, { signal }) throws a DataCloneError ("AbortSignal
// object could not be cloned"). The film page's keyless claude.ai call (app/film/llm.js,
// CALLS.claudeai without sample) gives fetch no signal, and is raced against it instead
// (stoppable), still ending in "Stopped." when the visitor stops it. The functions are
// read from the page's own file, with a fetch that refuses a signal as the chat's does.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../app/film/llm.js", import.meta.url), "utf8");
const cut = (from, to) => { const i = src.indexOf(from); assert.ok(i >= 0, from); const j = src.indexOf(to, i); assert.ok(j > i, to); return src.slice(i, j); };
const postJSON = cut("async function postJSON", "\n// A call that ends");
const stoppable = cut("function stoppable", "\n// A call given a schema");
const claudeai = cut("async claudeai(", "\n  },\n") + "\n  }";

// the chat's fetch: a signal can't be cloned; a reply comes after `ms`
function chatFetch(ms = 20) {
  const calls = [];
  const fetch = (url, opts = {}) => {
    calls.push({ url, opts });
    if (opts.signal) return Promise.reject(Object.assign(new Error("Failed to execute 'postMessage': AbortSignal object could not be cloned."), { name: "DataCloneError" }));
    return new Promise((ok) => setTimeout(() => ok(new Response(JSON.stringify({ content: [{ type: "text", text: "(define x scene)" }] }), { status: 200 })), ms));
  };
  return { fetch, calls };
}
const callsWith = (fetch) => new Function("fetch", "teller", "modelFor", "KEYLESS_MODEL", `${postJSON}\n${stoppable}\nreturn { ${claudeai} };`)(fetch, {}, () => null, "claude-test");

test("the keyless claude.ai call gives the chat's fetch no signal, and answers", async () => {
  const { fetch, calls } = chatFetch();
  const ctl = new AbortController();
  const text = await callsWith(fetch).claudeai([{ role: "user", content: "a story" }], { signal: ctl.signal });
  assert.equal(text, "(define x scene)");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.anthropic.com/v1/messages");
  assert.equal("signal" in calls[0].opts && calls[0].opts.signal !== undefined, false);
  assert.deepEqual(Object.keys(calls[0].opts.headers), ["content-type"]);
});

test("stopping it still ends in Stopped., with its kind", async () => {
  const { fetch } = chatFetch(5000);
  const ctl = new AbortController();
  const going = callsWith(fetch).claudeai([{ role: "user", content: "a story" }], { signal: ctl.signal });
  setTimeout(() => ctl.abort(), 10);
  const t0 = Date.now();
  await assert.rejects(going, (e) => e.message === "Stopped." && e.kind === "stopped");
  assert.ok(Date.now() - t0 < 1000, "stopped at once, not when the reply came");
});

test("a signal stopped already stops it before it waits", async () => {
  const { fetch } = chatFetch(5000);
  const ctl = new AbortController();
  ctl.abort();
  await assert.rejects(callsWith(fetch).claudeai([{ role: "user", content: "a story" }], { signal: ctl.signal }), (e) => e.message === "Stopped." && e.kind === "stopped");
});

test("the keyed calls still give fetch the signal (their fetch is the browser's own)", () => {
  assert.match(postJSON, /fetch\(url, \{ method: "POST", headers, body: JSON\.stringify\(body\), signal \}\)/);
  for (const name of ["anthropic", "openai", "gemini"]) {
    const body = cut(`async ${name}(`, "\n  },\n");
    assert.match(body, /, signal\)/, name);
  }
});
