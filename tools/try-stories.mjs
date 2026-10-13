// Try stories the way the film page's "Tell Ani a new story" does, but in a batch: for
// each story, the page's own prompt (storyPrompt, built by the page's own code in headless
// Chrome), a model's reply, the page's own clean-up, tidy and checks (lispOf, tidyStory,
// checkStory), one
// "ask the model to fix these" round if the checks find problems (repairPrompt, as the
// page's button sends it), and then Ani herself on the result (tools/run-story.mjs), with
// the revival's extensions. Writes each step to reports/llm-trials/<date> <model>/.
// Usage: node tools/try-stories.mjs [--model gpt-6.1-sol] [--extensions mend,appear] [--only name,...] [--story "text"] [--stories file.json]
//   By default it tries the page's example stories (EXAMPLE_STORIES in app/film/llm.js).
//   The key is read from the OPENAI_API_KEY environment variable and never printed or
//   saved. Each story costs one call, or two when a fix is asked for. --reuse reads the
//   replies an earlier run saved today, and asks only for those missing.
// Build the page first (node tools/build-film-app.mjs): the prompt comes from app/film.html.
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : fallback; };
const model = arg("--model", "gpt-6.1-sol");
const extensions = arg("--extensions", "mend,appear").split(",").filter(Boolean);
const only = arg("--only", "").split(",").filter(Boolean).map((s) => s.toLowerCase());
const oneStory = arg("--story", null);
const storiesFile = arg("--stories", null); // a JSON list of [name, story] pairs, e.g. test/stories/trial-stories.json
const reuse = process.argv.includes("--reuse"); // read replies saved by an earlier run instead of asking again
const key = process.env.OPENAI_API_KEY;
if (!key) throw new Error("OPENAI_API_KEY isn't set");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const day = new Date().toISOString().slice(0, 10);
const out = join("reports", "llm-trials", `${day} ${model}`);
mkdirSync(out, { recursive: true });

// ---- the page's own code, in headless Chrome
const temp = await mkdtemp(join(tmpdir(), "ani-try-"));
const html = readFileSync("app/film.html", "utf8");
const end = html.lastIndexOf("</script>");
writeFileSync(join(temp, "film.html"), html.slice(0, end) + "\nwindow.__ani = { storyPrompt, lispOf, tidyStory, repairPrompt, checkStory, EXAMPLE_STORIES };\n" + html.slice(end));
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

// ---- the model (the page's request, chat/completions)
async function ask(turns) {
  const t0 = Date.now();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages: turns, max_completion_tokens: 12000 }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status}: ${(json.error && json.error.message) || res.statusText}`);
  return { text: json.choices?.[0]?.message?.content || "", seconds: (Date.now() - t0) / 1000, usage: json.usage || null };
}

function runAni(file) {
  return new Promise((resolve) => {
    const json = file.replace(/\.lisp$/, ".run.json");
    const p = spawn(process.execPath, ["tools/run-story.mjs", file, "--extensions", extensions.join(","), "--out", json], { stdio: ["ignore", "pipe", "pipe"] });
    let log = "";
    p.stdout.on("data", (d) => { log += d; });
    p.stderr.on("data", (d) => { log += d; });
    p.on("close", (code) => { writeFileSync(file.replace(/\.lisp$/, ".run.txt"), log); let r = null; try { r = JSON.parse(readFileSync(json, "utf8")); } catch { /* none */ } resolve({ code, log, result: r }); });
  });
}

const summary = [];
try {
  const evaluate = await page();
  let stories = oneStory ? [["Your story", oneStory]] : storiesFile ? JSON.parse(readFileSync(storiesFile, "utf8")) : await evaluate("window.__ani.EXAMPLE_STORIES");
  if (only.length) stories = stories.filter(([name]) => only.some((o) => name.toLowerCase().includes(o)));
  console.log(`${stories.length} stories, ${model}, Ani with ${extensions.join(" and ") || "nothing"}; writing to ${out}`);
  const runs = [];
  for (const [name, story] of stories) {
    const base = join(out, slug(name));
    const prompt = await evaluate(`window.__ani.storyPrompt(${JSON.stringify(story)}, { extensions: ${JSON.stringify(extensions)} })`);
    const turns = [{ role: "user", content: prompt }];
    writeFileSync(`${base}.story.txt`, story + "\n");
    let reply, text, check, fixed = false, tidied = [];
    // balanced and tidied, as the page does a draft
    const cleaned = async (r) => { const t = await evaluate(`(() => { const t = window.__ani.tidyStory(window.__ani.lispOf(${JSON.stringify(r)}).text); return { text: t.text, fixes: t.fixes.map((f) => f.short) }; })()`); tidied.push(...t.fixes); return t.text; };
    try {
      let saved = null;
      if (reuse) { try { saved = readFileSync(`${base}.reply.md`, "utf8"); } catch { /* none */ } }
      reply = saved !== null ? { text: saved, seconds: 0, usage: null } : await ask(turns);
      writeFileSync(`${base}.reply.md`, reply.text);
      text = await cleaned(reply.text);
      check = await evaluate(`(() => { const c = window.__ani.checkStory(${JSON.stringify(text)}); return { problems: c.problems, notes: c.notes, stops: (c.stops || []).map((s) => s.mended || s.as1978) }; })()`);
      if (check.problems.length) {
        const repair = await evaluate(`window.__ani.repairPrompt(${JSON.stringify(check.problems)})`);
        let savedFix = null;
        if (reuse) { try { savedFix = readFileSync(`${base}.fix.md`, "utf8"); } catch { /* none */ } }
        const again = savedFix !== null ? { text: savedFix, seconds: 0 } : await ask([...turns, { role: "assistant", content: reply.text }, { role: "user", content: repair }]);
        writeFileSync(`${base}.fix.md`, again.text);
        const text2 = await cleaned(again.text);
        const check2 = await evaluate(`(() => { const c = window.__ani.checkStory(${JSON.stringify(text2)}); return { problems: c.problems, notes: c.notes, stops: (c.stops || []).map((s) => s.mended || s.as1978) }; })()`);
        fixed = { problems: check.problems, seconds: again.seconds };
        text = text2;
        check = check2;
      }
    } catch (e) {
      console.log(`FAILED ${name}: ${e.message}`);
      summary.push({ name, error: e.message });
      continue;
    }
    writeFileSync(`${base}.lisp`, text);
    console.log(`asked  ${name}: ${reply.seconds.toFixed(0)} s${fixed ? `, then fixed (${fixed.problems.length} problems)` : ""}${tidied.length ? `; the page tidied it (${tidied.join("; ")})` : ""}; ${check.problems.length ? `still ${check.problems.length} problems` : "Ani's checks find nothing wrong"}`);
    runs.push({ name, base, reply, check, fixed, tidied, ani: runAni(`${base}.lisp`) });
  }
  for (const r of runs) {
    const { code, result } = await r.ani;
    const scenes = (result && result.scenes) || [];
    const stopped = (s) => s.frames === undefined;
    const line = scenes.map((s) => `${s.id}: ${stopped(s) ? "STOPPED" : s.capped ? "NEVER ENDED" : `${s.frames} frames`}`).join("; ");
    console.log(`made   ${r.name}: ${code === 0 ? "every scene ended" : "not every scene ended"}${line ? ` (${line})` : ""}`);
    summary.push({ name: r.name, seconds: r.reply.seconds, usage: r.reply.usage, fixed: r.fixed, ...(r.tidied.length ? { tidied: r.tidied } : {}), problems: r.check.problems, exit: code, scenes: scenes.map((s) => ({ id: s.id, frames: s.frames ?? null, capped: !!s.capped, repairs: (s.repairs || []).length, stopped: stopped(s) })) });
  }
} finally {
  writeFileSync(join(out, "summary.json"), JSON.stringify({ model, extensions, summary }, null, 1) + "\n");
  if (ws) ws.close();
  chrome.kill();
  await sleep(500);
  await rm(temp, { recursive: true, force: true }).catch(() => {});
}
