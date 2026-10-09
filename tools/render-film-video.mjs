// Render Ani's 1978 film at 24 frames a second, in color, as a WebM video, drawn by the film
// page's own code: three seconds of black first (the 1978 film has about that much under its
// first line of narration), then the five scenes with no title cards, then one second more of
// the last picture. tools/narrate-film.py then lays Ken's narration onto it.
// Usage: node tools/render-film-video.mjs [out-folder]   (about two minutes)
// Writes <out-folder>/ani-24fps-color.webm and frames.json (default reports/film/narration).
//
// It loads a copy of app/film.html (build it first: node tools/build-film-app.mjs) with one
// line added that hands the page's drawing functions to the script, from the system's temp
// folder, in headless Chrome driven over the DevTools protocol with Node's own WebSocket.
// The video comes back a megabyte at a time: Chrome stalls handing back 4 MB at once.
// CHROME=<path> picks another Chrome.
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = process.argv[2] || "reports/film/narration";
const LEAD = 75, HOLD = 24, FPS = 24;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

const temp = await mkdtemp(join(tmpdir(), "ani-render-"));
const html = readFileSync("app/film.html", "utf8");
const end = html.lastIndexOf("</script>");
writeFileSync(join(temp, "film.html"), html.slice(0, end) + "\nwindow.__ani = { kenRun, drawFrame, webm };\n" + html.slice(end));
const port = 9300 + Math.floor(Math.random() * 600);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${join(temp, "profile")}`, "--no-first-run", "--no-default-browser-check", "about:blank"], { stdio: "ignore" });
let ws;
try {
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
  await send("Page.enable");
  await send("Page.navigate", { url: pathToFileURL(join(temp, "film.html")).href });
  let ready = false;
  for (let k = 0; k < 60 && !ready; k++) { await sleep(500); ready = await evaluate("!!window.__ani").catch(() => false); }
  if (!ready) throw new Error("the film page didn't start");
  const setup = await evaluate(`(() => {
    const { kenRun, drawFrame } = window.__ani;
    const run = kenRun(${FPS});
    const canvas = document.createElement("canvas");
    canvas.width = 1102; canvas.height = 826;
    const ctx = canvas.getContext("2d");
    const plan = [];
    for (let k = 0; k < ${LEAD}; k++) plan.push(null);
    run.scenes.forEach((sc, i) => { for (let f = 0; f < sc.film.frames.length; f++) plan.push([i, f]); });
    const last = plan[plan.length - 1];
    for (let k = 0; k < ${HOLD}; k++) plan.push(last);
    const frameUs = Math.round(1e6 / ${FPS});
    const job = { plan, frames: [], failure: null, n: 0, canvas };
    job.encoder = new VideoEncoder({ output: (chunk) => { const data = new Uint8Array(chunk.byteLength); chunk.copyTo(data); job.frames.push({ data, ms: Math.round(chunk.timestamp / 1000), key: chunk.type === "key" }); }, error: (e) => { job.failure = String(e); } });
    job.encoder.configure({ codec: "vp8", width: canvas.width, height: canvas.height, bitrate: 8000000, framerate: ${FPS} });
    job.step = async (count) => {
      for (const stop = Math.min(plan.length, job.n + count); job.n < stop; job.n++) {
        if (job.failure) throw new Error(job.failure);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const at = plan[job.n];
        if (at) { ctx.setTransform(2, 0, 0, 2, 0, 0); drawFrame(ctx, run, run.scenes[at[0]], at[1], { color: true }); }
        const frame = new VideoFrame(canvas, { timestamp: job.n * frameUs, duration: frameUs });
        job.encoder.encode(frame, { keyFrame: job.n % ${FPS * 2} === 0 });
        frame.close();
      }
      await job.encoder.flush();
      return job.n;
    };
    window.__job = job;
    return { lead: ${LEAD}, frames: run.scenes.map((sc) => sc.film.frames.length), fps: ${FPS}, total: plan.length };
  })()`);
  for (let done = 0; done < setup.total;) {
    done = await evaluate("window.__job.step(240)");
    process.stdout.write(`\r${done} of ${setup.total} frames`);
  }
  const size = await evaluate(`(async () => {
    const job = window.__job;
    job.encoder.close();
    const blob = window.__ani.webm(job.frames, job.canvas.width, job.canvas.height, job.plan.length * 1000 / ${FPS});
    const url = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
    window.__b64 = url.slice(url.indexOf(",") + 1);
    return window.__b64.length;
  })()`);
  const parts = [];
  for (let a = 0; a < size; a += 1 << 20) parts.push(await evaluate(`window.__b64.slice(${a}, ${a + (1 << 20)})`));
  writeFileSync(join(OUT, "ani-24fps-color.webm"), Buffer.from(parts.join(""), "base64"));
  writeFileSync(join(OUT, "frames.json"), JSON.stringify(setup) + "\n");
  console.log(`\nwrote ${join(OUT, "ani-24fps-color.webm")} (${(size * 0.75 / 1e6).toFixed(1)} MB) and frames.json: ${JSON.stringify(setup)}`);
} finally {
  if (ws) ws.close();
  chrome.kill();
  await sleep(500);
  await rm(temp, { recursive: true, force: true }).catch(() => {});
}
