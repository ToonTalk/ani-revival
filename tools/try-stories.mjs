// Try stories the way the film page's "Tell Ani a new story" does, but in a batch: for
// each story, the page's own prompt (storyPrompt, built by the page's own code in headless
// Chrome), a model's reply, the page's own clean-up, tidy and checks (lispOf, tidyStory,
// checkStory), "ask the model to fix these" rounds while the checks find problems
// (repairPrompt, as the page's button sends it), and then Ani herself on the result
// (tools/run-story.mjs), with the revival's extensions. Writes each step to
// reports/llm-trials/<date> <model> <format>/.
// Usage: node tools/try-stories.mjs [--model gpt-6.1-sol] [--format json|lisp] [--extensions mend,appear]
//          [--only name,...] [--story "text"] [--stories examples,file.json,...] [--fix-rounds 2]
//          [--jobs 4] [--ani-timeout 40] [--ani dir] [--no-ani] [--reuse]
//   --format      how the model writes the description: json (the page's JSON way: the
//                 request carries the page's schema, storySchema, as OpenAI's strict
//                 json_schema, and the page puts the reply into Ken's notation,
//                 storyFromReply) or lisp (Ken's notation itself); the page's own default
//                 if not given
//   --stories     lists of [name, story] pairs (e.g. test/stories/trial-stories.json), and
//                 "examples" for the page's example stories (EXAMPLE_STORIES in
//                 app/film/llm.js), which are the default
//   --fix-rounds  the most "ask the model to fix these" rounds a story gets (2)
//   --jobs        how many runs of Ani at once (4); --ani-timeout, the minutes a run may
//                 take before it is stopped (40)
//   --ani         the folder whose tools/run-story.mjs runs Ani (this one by default), e.g.
//                 a snapshot of a commit, so that work going on here doesn't change the runs
//   --no-ani      only the drafts, checked and tidied: Ani isn't run on them
//   The key is read from the OPENAI_API_KEY environment variable and never printed or
//   saved. --reuse reads the replies an earlier run saved today, and asks only for those
//   missing. Each story's summary has: whether the reply was JSON, the forms whose
//   parentheses the page balanced (Lisp), the problems the checks found before the page's
//   tidy and after it, what the tidy did, the fix rounds, words Ani doesn't know or given
//   in another kind's slot, the task forms used, and what Ani made of each scene.
// Build the page first (node tools/build-film-app.mjs): the prompt comes from app/film.html.
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";

const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : fallback; };
const model = arg("--model", "gpt-6.1-sol");
const extensions = arg("--extensions", "mend,appear").split(",").filter(Boolean);
const only = arg("--only", "").split(",").filter(Boolean).map((s) => s.toLowerCase());
const oneStory = arg("--story", null);
const storyLists = arg("--stories", "examples").split(",").filter(Boolean);
const fixRounds = Number(arg("--fix-rounds", 2));
const jobs = Number(arg("--jobs", 4));
const aniTimeout = Number(arg("--ani-timeout", 40)) * 60000;
const aniRoot = resolvePath(arg("--ani", "."));
const reuse = process.argv.includes("--reuse"); // read replies saved by an earlier run instead of asking again
const noAni = process.argv.includes("--no-ani"); // only the drafts: Ani isn't run on them
const key = process.env.OPENAI_API_KEY;
if (!key) throw new Error("OPENAI_API_KEY isn't set");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const day = new Date().toISOString().slice(0, 10);

// ---- the page's own code, in headless Chrome
const temp = await mkdtemp(join(tmpdir(), "ani-try-"));
const html = readFileSync("app/film.html", "utf8");
const end = html.lastIndexOf("</script>");
// analyze: what a description holds, by the page's own reading of it (readStory): each
// word Ani doesn't know (WORDS), or given in another kind's slot (one Ken didn't give
// there himself), and the task forms its scenes use
const analyze = `(text) => {
  const story = readStory(text), unknown = [], misplaced = [], forms = {};
  for (const [name, c] of Object.entries(story.characters)) for (const [slot, ws] of c.slots) for (const w of ws) {
    if (!SLOT_KIND[slot]) continue;
    if (!WORDS[w]) unknown.push(name + " " + slot + " " + w);
    else if (kindOf(w) !== SLOT_KIND[slot] && !kenGave(slot, w)) misplaced.push(name + " " + slot + " " + w);
  }
  for (const r of story.relationships) for (const w of r.how) if (!WORDS[w]) unknown.push(r.from + "->" + r.to + " " + w);
  for (const st of Object.values(story.scenes)) for (const t of tasksOf(st.tasks)) {
    const d = Array.isArray(t[1]) ? t[1] : [];
    const form = t[0] === "establish" ? "establish " + d[0] : String(d[0]);
    forms[form] = (forms[form] || 0) + 1;
  }
  return { unknown, misplaced, forms, characters: Object.keys(story.characters).length, scenes: Object.keys(story.scenes).length, error: story.error };
}`;
writeFileSync(join(temp, "film.html"), html.slice(0, end) + `\nwindow.__ani = { storyPrompt, lispOf, tidyStory, repairPrompt, checkStory, storySchema, storyFromReply, EXAMPLE_STORIES, format: teller.format, analyze: ${analyze} };\n` + html.slice(end));
const port = 9300 + Math.floor(Math.random() * 600);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${join(temp, "profile")}`, "--no-first-run", "--no-default-browser-check", "about:blank"], { stdio: "ignore" });
let ws;
async function page() {
  let wsUrl = null;
  for (let k = 0; k < 75 && !wsUrl; k++) {
    await sleep(200);
    try { wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page")?.webSocketDebuggerUrl; } catch { /* starting */ }
  }
  if (!wsUrl) throw new Error(`Chrome didn't start (${CHROME})`);
  ws = new WebSocket(wsUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const n = ++id; pending.set(n, { resolve, reject }); ws.send(JSON.stringify({ id: n, method, params })); });
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  await send("Page.navigate", { url: pathToFileURL(join(temp, "film.html")).href });
  let ready = false;
  for (let k = 0; k < 60 && !ready; k++) { await sleep(500); ready = await evaluate("!!window.__ani").catch(() => false); }
  if (!ready) throw new Error("the film page didn't start");
  return evaluate;
}

// ---- the model (the page's request, chat/completions; with the JSON way, the page's
// schema as a strict json_schema, and, as the page does, asked again without it if OpenAI
// refuses the schema)
let schemaRefused = null;
async function ask(turns, schema) {
  const t0 = Date.now();
  const call = async (withSchema) => {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages: turns, max_completion_tokens: 12000, ...(withSchema ? { response_format: { type: "json_schema", json_schema: { name: "film_description", strict: true, schema } } } : {}) }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(`${res.status}: ${(json.error && json.error.message) || res.statusText}`), { status: res.status });
    return json;
  };
  let json;
  try { json = await call(!!schema); }
  catch (e) {
    if (!(schema && e.status === 400)) throw e;
    schemaRefused = e.message;
    console.log(`OpenAI refused the schema (${e.message}); asking without it`);
    json = await call(false);
  }
  return { text: json.choices?.[0]?.message?.content || "", seconds: (Date.now() - t0) / 1000, usage: json.usage || null, finish: json.choices?.[0]?.finish_reason || null };
}

// ---- Ani, a few runs at a time, each with a time limit
let running = 0;
const waiting = [];
async function runAni(file) {
  if (running >= jobs) await new Promise((r) => waiting.push(r));
  running++;
  try {
    return await new Promise((resolve) => {
      const json = file.replace(/\.lisp$/, ".run.json");
      const p = spawn(process.execPath, [join(aniRoot, "tools/run-story.mjs"), resolvePath(file), "--extensions", extensions.join(","), "--out", resolvePath(json)], { stdio: ["ignore", "pipe", "pipe"], cwd: aniRoot });
      let log = "", timedOut = false;
      const timer = setTimeout(() => { timedOut = true; p.kill(); }, aniTimeout);
      p.stdout.on("data", (d) => { log += d; });
      p.stderr.on("data", (d) => { log += d; });
      p.on("close", (code) => {
        clearTimeout(timer);
        if (timedOut) log += `\nSTOPPED after ${aniTimeout / 60000} minutes\n`;
        writeFileSync(file.replace(/\.lisp$/, ".run.txt"), log);
        let r = null;
        try { r = JSON.parse(readFileSync(json, "utf8")); } catch { /* none */ }
        resolve({ code, log, result: r, timedOut });
      });
    });
  } finally {
    running--;
    if (waiting.length) waiting.shift()();
  }
}

const summary = [];
let format = arg("--format", null), out = null;
try {
  const evaluate = await page();
  format ||= await evaluate("window.__ani.format");
  if (!["json", "lisp"].includes(format)) throw new Error(`--format is json or lisp, not ${format}`);
  out = join("reports", "llm-trials", `${day} ${model} ${format}`);
  mkdirSync(out, { recursive: true });
  let stories = [];
  if (oneStory) stories = [["Your story", oneStory]];
  else for (const s of storyLists) stories.push(...(s === "examples" ? await evaluate("window.__ani.EXAMPLE_STORIES") : JSON.parse(readFileSync(s, "utf8"))));
  if (only.length) stories = stories.filter(([name]) => only.some((o) => name.toLowerCase().includes(o)));
  const schema = format === "json" ? await evaluate(`window.__ani.storySchema(${JSON.stringify(extensions)})`) : null;
  if (schema) writeFileSync(join(out, "schema.json"), JSON.stringify(schema, null, 1) + "\n");
  console.log(`${stories.length} stories, ${model}, written as ${format}, Ani with ${extensions.join(" and ") || "nothing"} (${aniRoot}); writing to ${out}`);
  const runs = [];
  for (const [name, story] of stories) {
    const base = join(out, slug(name));
    const prompt = await evaluate(`window.__ani.storyPrompt(${JSON.stringify(story)}, { extensions: ${JSON.stringify(extensions)}, format: ${JSON.stringify(format)} })`);
    if (!runs.length) writeFileSync(join(out, "prompt-example.txt"), prompt.replace(story.trim(), "<the story>") + "\n");
    const turns = [{ role: "user", content: prompt }];
    writeFileSync(`${base}.story.txt`, story + "\n");
    // each round: the reply put into Ken's notation (the JSON way) or balanced (Lisp), the
    // checks before the page's tidy, the tidy, and the checks after it
    const rounds = [];
    const clean = (r) => evaluate(`(() => {
      const a = window.__ani, reply = ${JSON.stringify(r)};
      const fromJson = ${JSON.stringify(format)} === "json" ? a.storyFromReply(reply) : null;
      const lisp = fromJson ? null : a.lispOf(reply), raw = fromJson ? fromJson.text : lisp.text;
      const before = a.checkStory(raw), tidy = a.tidyStory(raw), after = a.checkStory(tidy.text);
      const stops = (c) => (c.stops || []).map((s) => s.mended || s.as1978);
      return { json: !!fromJson, balanced: lisp ? lisp.balanced : 0, raw, text: tidy.text, before: before.problems, beforeNotes: before.notes, fixes: tidy.fixes.map((f) => f.short), problems: after.problems, notes: after.notes, stops: stops(after), words: a.analyze(raw), wordsAfter: a.analyze(tidy.text) };
    })()`);
    let reply, round;
    try {
      let saved = null;
      if (reuse) { try { saved = readFileSync(`${base}.reply.md`, "utf8"); } catch { /* none */ } }
      reply = saved !== null ? { text: saved, seconds: 0, usage: null } : await ask(turns, schema);
      writeFileSync(`${base}.reply.md`, reply.text);
      round = { ...(await clean(reply.text)), seconds: reply.seconds, usage: reply.usage, finish: reply.finish };
      rounds.push(round);
      let said = reply.text;
      for (let k = 1; k <= fixRounds && round.problems.length; k++) {
        turns.push({ role: "assistant", content: said }, { role: "user", content: await evaluate(`window.__ani.repairPrompt(${JSON.stringify(round.problems)}, ${JSON.stringify(format)})`) });
        let savedFix = null;
        if (reuse) { try { savedFix = readFileSync(`${base}.fix${k}.md`, "utf8"); } catch { /* none */ } }
        const again = savedFix !== null ? { text: savedFix, seconds: 0, usage: null } : await ask(turns, schema);
        writeFileSync(`${base}.fix${k}.md`, again.text);
        said = again.text;
        round = { ...(await clean(again.text)), seconds: again.seconds, usage: again.usage, finish: again.finish };
        rounds.push(round);
      }
    } catch (e) {
      console.log(`FAILED ${name}: ${e.message}`);
      summary.push({ name, error: e.message });
      continue;
    }
    writeFileSync(`${base}.lisp`, round.text);
    const first = rounds[0];
    console.log(`asked  ${name}: ${first.seconds.toFixed(0)} s${format === "json" ? (first.json ? ", JSON" : ", NOT JSON") : ""}; ${first.before.length} problems before the tidy${first.fixes.length ? `, tidied (${first.fixes.join("; ")})` : ""}, ${first.problems.length} after${rounds.length > 1 ? `; ${rounds.length - 1} fix round${rounds.length > 2 ? "s" : ""}, then ${round.problems.length} problems` : ""}`);
    runs.push({ name, base, rounds, ani: noAni ? Promise.resolve({ code: null, result: null, timedOut: false }) : runAni(`${base}.lisp`) });
  }
  for (const r of runs) {
    const { code, result, timedOut } = await r.ani;
    const scenes = (result && result.scenes) || [];
    const stopped = (s) => s.frames === undefined;
    const line = scenes.map((s) => `${s.id}: ${stopped(s) ? "STOPPED" : s.capped ? "NEVER ENDED" : `${s.frames} frames`}`).join("; ");
    if (!noAni) console.log(`made   ${r.name}: ${timedOut ? "STOPPED by the time limit" : code === 0 ? "every scene ended" : "not every scene ended"}${line ? ` (${line})` : ""}`);
    const last = r.rounds[r.rounds.length - 1];
    summary.push({
      name: r.name,
      rounds: r.rounds.map(({ raw, text, ...x }) => x),
      fixRounds: r.rounds.length - 1,
      problems: last.problems,
      words: last.wordsAfter,
      exit: code, timedOut,
      pass1: result && result.pass1 ? { ok: result.pass1.ok !== false, error: result.pass1.error || null } : null,
      changes: result && result.changes ? result.changes.map((c) => ({ scene: c.scene, ok: c.ok, error: c.error || null })) : [],
      scenes: scenes.map((s) => ({ id: s.id, frames: s.frames ?? null, capped: !!s.capped, repairs: (s.repairs || []).length, stopped: stopped(s), error: s.error || null })),
    });
  }
} finally {
  if (out) writeFileSync(join(out, "summary.json"), JSON.stringify({ model, format, extensions, ani: aniRoot, schemaRefused, summary }, null, 1) + "\n");
  if (ws) ws.close();
  chrome.kill();
  await sleep(500);
  await rm(temp, { recursive: true, force: true }).catch(() => {});
}
