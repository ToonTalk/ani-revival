// Check the film page's age setting (reports/chapter-x/design-young-children.md, "Tests"),
// in headless Chrome, with no model calls:
//   A. 12+ unchanged: every explanation the page makes for Ken's 1978 film at 12+ (each
//      frame's caption at 4 and 24 frames a second; each character's panel at the start of
//      every part and at every still; the story panel at each scene), byte for byte as
//      reports/ext/ages/12plus.json has them (a hash each; --write-12plus writes it, as it
//      was taken before stage A0's refactor).
//   B. True to the glass box: every "because" lists exactly the source words of the chosen
//      way, read here with this tool's own reader of the glass box; known-true sentences
//      appear and known-false ones never do; each number in a simple sentence rounds from
//      the 12+ one's.
//   C. Vocabulary: every word of every 6–8 sentence is in WORDS_6_8 (with its inflections),
//      a name, a number, a scene title, or a gloss; no 9–11 sentence has Lisp, a citation
//      or an actor's name.
//   D. Length: at 6–8 at most 14 words a sentence and 3 sentences a box; at 9–11, 22 and 4.
//   E. Coverage: the gaps (a fact with no simple template) are counted: none for Ken's film.
//   F. Speech: speechSynthesis and SpeechRecognition stood in for: the captions read in
//      order, the film waits for the voice at 6–8, pause cancels; no recognizer before the
//      grown-up's opt-in, a final result fills the box and sends nothing, "play" plays, and
//      with no recognition no microphone is shown.
//   G. Presentation only: the setting is in no film, film file or library entry; the hash
//      token sets and remembers it; a link can't turn on Talk to Ani.
//   H. Accessibility: controls at 6–8 at least 44 px, no horizontal scroll at 375 px, the
//      glossary opens with Enter and closes with Escape, the captions' live region is off
//      while Ani reads aloud.
//   I. The goldens: reports/ext/ages/cinderella.md (each moment at the three settings) and
//      cinderella.json, written by --write-goldens and checked against otherwise.
// Usage: node tools/check-ages.mjs [--only a] [--write-12plus] [--write-goldens] [--shots dir]
//   (about five minutes; the claude.ai copy is checked too if artifact/ has it)
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";

const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const arg = (n) => process.argv.includes(n);
const argv = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const ONLY = argv("--only");
const SHOTS = argv("--shots");
const GOLD = "reports/ext/ages";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 24);
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".png": "image/png" };

// the page's functions on window.__ages, as tools/check-film-app.mjs hands them on window.__check
const HOOKED = ["captionAt", "select", "goScene", "RUNS", "state", "whyOf", "frameIn", "setRate", "renderSide", "AGES"];
const hookLine = `\nwindow.__ages = { ${HOOKED.map((n) => `get ${n}() { try { return ${n}; } catch { return undefined; } }`).join(", ")} };\n`;
const hooked = (html) => { const end = html.lastIndexOf("</script>"); return html.slice(0, end) + hookLine + html.slice(end); };
const page = () => readFileSync("app/film.html", "utf8");

const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^[/\\]+/, "");
  const at = path.replace(/\\/g, "/");
  if (path.startsWith("..")) { res.writeHead(403).end(); return; }
  if (at === "app/film.ages.html") { res.writeHead(200, { "content-type": "text/html" }).end(hooked(page())); return; }
  // with speech stood in for, before the page's own script runs (test F)
  if (at === "app/film.speech.html") { res.writeHead(200, { "content-type": "text/html" }).end(hooked(page()).replace("<head>", `<head>\n<script>${SPEECH_STUB}</script>`)); return; }
  if (at === "app/film.nospeech.html") { res.writeHead(200, { "content-type": "text/html" }).end(hooked(page()).replace("<head>", `<head>\n<script>${SPEECH_STUB}\ndelete window.SpeechRecognition; delete window.webkitSpeechRecognition;</script>`)); return; }
  try {
    const body = await readFile(join(process.cwd(), path));
    res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" }).end(body);
  } catch { res.writeHead(404).end(); }
});
// speechSynthesis and SpeechRecognition stood in for: utterances recorded, each ended only
// when the check says so (window.__speech.end()), recognizers counted as they are made
const SPEECH_STUB = `
(() => {
  const said = [], queue = [];
  class Utterance { constructor(text) { this.text = text; this.rate = 1; this.pitch = 1; this.voice = null; this.lang = ""; } }
  const synth = {
    speaking: false, pending: false,
    speak(u) { said.push(u.text); queue.push(u); this.speaking = true; },
    cancel() { const q = queue.splice(0); this.speaking = false; said.push("<cancel>"); },
    getVoices() { return [{ name: "Test voice", lang: "en-US", localService: true, default: true, voiceURI: "test" }]; },
    addEventListener() {}, removeEventListener() {},
    pause() {}, resume() {},
  };
  const made = [];
  class Recognition { constructor() { made.push(this); this.started = false; } start() { this.started = true; } stop() { this.started = false; if (this.onend) this.onend({}); } abort() { this.stop(); } }
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
  window.SpeechSynthesisUtterance = Utterance;
  window.SpeechRecognition = Recognition;
  window.__speech = {
    said, made,
    end() { const u = queue.shift(); synth.speaking = queue.length > 0; if (u && u.onend) u.onend({}); return !!u; },
    hear(text, final = true) { const r = made[made.length - 1]; if (!r || !r.onresult) return false; const alt = { transcript: text, confidence: 0.9 }; const res = [alt]; res.isFinal = final; r.onresult({ resultIndex: 0, results: [res] }); if (final && r.onend) r.onend({}); return true; },
  };
})();`;

await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
const scratch = process.env.ANI_SCRATCH || tmpdir();
const profile = await mkdtemp(join(scratch, "ani-ages-"));
const port = 9300 + Math.floor(Math.random() * 600);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "about:blank"], { stdio: "ignore" });

let failures = 0;
const check = (ok, what) => { console.log(`${ok ? "ok  " : "FAIL"}  ${what}`); if (!ok) failures++; };
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
  const errors = [];
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
    if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const n = ++id;
    const timer = setTimeout(() => { pending.delete(n); reject(new Error(`${method} timed out`)); }, 240000);
    pending.set(n, { resolve: (v) => { clearTimeout(timer); resolve(v); }, reject: (e) => { clearTimeout(timer); reject(e); } });
    ws.send(JSON.stringify({ id: n, method, params }));
  });
  const js = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const shot = async (name) => { if (SHOTS) { mkdirSync(SHOTS, { recursive: true }); writeFileSync(join(SHOTS, name), Buffer.from((await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false })).data, "base64")); } };
  const desktop = () => send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  const phone = () => send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
  const open = async (file = "film.ages.html", hash = "") => {
    await send("Page.navigate", { url: `${base}/app/${file}${hash}` });
    for (let k = 0; k < 100; k++) { await sleep(200); if (await js(`!!window.__ages && !!document.getElementById("caption-0") && document.getElementById("caption-0").innerText.length > 0`).catch(() => false)) return; }
    throw new Error("the page didn't start");
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await desktop();

  // ---------------------------------------------------------------- A. 12+ unchanged
  // Every explanation, at 12+ (the default), as text: what the page shows. A number that
  // only counts the page's own buttons (critAction's keys) is left out.
  // one scene at a time (rate, i): its captions, its panels and its story panel
  const SNAP = (rate, i) => `(async () => {
    const t = window.__ages, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
    const side = document.getElementById("side");
    const norm = (h) => h.replace(/data-crit-act="\d+"/g, 'data-crit-act="#"');
    const rate = ${rate}, i = ${i};
    if (window.__rate !== rate) { t.setRate(rate); window.__rate = rate; await wait(50); }
    const run = t.RUNS[0];
    if (i >= run.scenes.length) return null;
    const sc = run.scenes[i], fps = rate;
    const moments = new Set();
    let lastPart = null;
    for (let f = 0; f <= sc.last; f++) {
      const c = t.captionAt(run, i, f);
      out["caption " + rate + " " + i + " " + f] = JSON.stringify(c);
      if (c.part !== lastPart) { moments.add(f); lastPart = c.part; }
    }
    const w = t.whyOf(run, sc);
    for (const s of (w ? w.stills : [])) moments.add(Math.min(s.to, Math.max(s.from + 1, Math.round((s.from + s.to) / 2))));
    for (const f of [...moments].sort((a, b) => a - b)) {
      t.goScene(i, (f + 0.5) / fps);
      for (const c of run.cast) {
        if (!sc.film.frames[f] || !sc.film.frames[f].chars[c]) continue;
        t.select({ run: 0, char: c }, { scroll: false });
        out["why " + rate + " " + i + " " + f + " " + c] = norm(side.innerHTML);
      }
    }
    t.goScene(i, 0.5 / fps);
    t.select(null, { scroll: false });
    out["story " + rate + " " + i] = norm(side.innerHTML);
    return out;
  })()`;
  const snapshot = async () => {
    const snap = {};
    for (const rate of [4, 24]) for (let i = 0; i < 9; i++) {
      const t0 = Date.now();
      const part = await js(SNAP(rate, i));
      if (!part) break;
      Object.assign(snap, part);
      if (process.env.ANI_VERBOSE) console.log(`  ${rate} ${i}: ${Object.keys(part).length} in ${Date.now() - t0} ms`);
    }
    await js("window.__ages.setRate(4), window.__rate = 4");
    return snap;
  };
  if (!ONLY || ONLY === "a") {
    await open();
    const snap = await snapshot();
    const hashes = Object.fromEntries(Object.entries(snap).map(([k, v]) => [k, sha(v)]));
    const n = Object.keys(hashes).length;
    writeFileSync(join(scratch, "ages-12plus-snapshot.json"), JSON.stringify(snap));
    if (arg("--write-12plus")) {
      mkdirSync(GOLD, { recursive: true });
      writeFileSync(`${GOLD}/12plus.json`, JSON.stringify(hashes, null, 0).replace(/","/g, '",\n"') + "\n");
      console.log(`wrote ${GOLD}/12plus.json (${n} explanations)`);
    } else {
      const want = JSON.parse(readFileSync(`${GOLD}/12plus.json`, "utf8"));
      const differ = Object.keys(want).filter((k) => want[k] !== hashes[k]);
      const extra = Object.keys(hashes).filter((k) => !(k in want));
      check(!differ.length && !extra.length && n === Object.keys(want).length, `A. 12+ unchanged: ${n} explanations of Ken's film (captions at 4 and 24 frames a second, every panel at every part and still, the story panel), byte for byte${differ.length ? `; differ: ${differ.slice(0, 6).join(" | ")}` : ""}${extra.length ? `; new: ${extra.slice(0, 4).join(" | ")}` : ""}`);
    }
  }
  if (ONLY === "a") throw null;
  // ---------------------------------------------------------------- the setting (A1)
  // G (the hash and the storage): a link sets the age, says so, and it is remembered; with a
  // moment it opens the moment at that age; a reload keeps it; 12+ puts the page back.
  await open("film.ages.html", "#ages-6-8");
  const linked = await js(`({ cls: document.documentElement.className, kept: localStorage.getItem("ani-cinderella:age:v1"), note: document.getElementById("age-note").hidden ? "" : document.getElementById("age-note").innerText, inDrawer: !!document.querySelector("#grownups #ages"), intro: [...document.querySelectorAll("header .intro")].filter((p) => p.offsetParent).map((p) => p.innerText).join(" | "), color: window.__ages.state.color })`);
  check(/(^| )age-6-8( |$)/.test(linked.cls) && linked.kept === "6-8" && /This link set the page for ages 6–8/.test(linked.note) && linked.inDrawer && /^Ani is a computer program from 1978\./.test(linked.intro) && linked.color,
    `G. #ages-6-8 sets the page for ages 6–8, says so, and is kept in this browser; the control is in For grown-ups, the intro is one line, the film in color: ${linked.note} | ${linked.intro}`);
  await send("Page.navigate", { url: `${base}/app/film.ages.html#kept-apart.48.cinderella.ages-9-11` });
  await sleep(300);
  await send("Page.reload", {});
  for (let k = 0; k < 100 && !(await js("!!window.__ages && document.getElementById('caption-0').innerText.length > 0").catch(() => false)); k++) await sleep(200);
  const moment = await js(`({ cls: document.documentElement.className, scene: window.__ages.state.scene, panel: window.__ages.state.panel, who: window.__ages.state.selected && window.__ages.state.selected.char, kept: localStorage.getItem("ani-cinderella:age:v1") })`);
  check(/(^| )age-9-11( |$)/.test(moment.cls) && moment.scene === 1 && moment.panel === "why" && moment.who === "cinderella" && moment.kept === "9-11", `G. #kept-apart.48.cinderella.ages-9-11 opens the moment at ages 9–11 (${JSON.stringify(moment)})`);
  await open();
  const kept = await js(`document.documentElement.className`);
  check(/(^| )age-9-11( |$)/.test(kept), "G. the age is kept: the page opened again without a link is at ages 9–11");
  const back12 = await js(`(() => { document.querySelector('#ages [data-age="12"]').click(); return { cls: document.documentElement.className, kept: localStorage.getItem("ani-cinderella:age:v1"), legend: document.querySelectorAll("#legend .chip").length, label: document.getElementById("frame-label").textContent }; })()`);
  check(!/age-/.test(back12.cls) && back12.kept === "12" && back12.legend === 0 && /frame/.test(back12.label), "G. 12+ chosen: the page is as it was (no chips in the legend, the frame said)");
  // H (sizes at 6–8): every control shown is at least 44 by 44 px, and at 375 px wide the page
  // doesn't scroll sideways (a link in a sentence is WCAG 2.5.5's inline exception)
  const SIDE_TOO = "";
  const SIZES = `(() => {
    const small = [];
    for (const b of document.querySelectorAll("header button, header a, header summary, .controls button, #scenes button, #legend button, #runbar button, footer button${SIDE_TOO}")) {
      const r = b.getBoundingClientRect();
      if (!r.width || !r.height || getComputedStyle(b).visibility === "hidden") continue;
      if (b.classList.contains("linkish") && b.closest("p, li") && b.closest("p, li").textContent.trim().length > b.textContent.trim().length + 20) continue; // a button in a sentence
      if (r.width < 43.5 || r.height < 43.5) small.push((b.textContent || b.getAttribute("aria-label") || b.className).trim().slice(0, 30) + " " + Math.round(r.width) + "x" + Math.round(r.height));
    }
    return { small, scroll: document.documentElement.scrollWidth - window.innerWidth };
  })()`;
  await js(`document.querySelector('#ages [data-age="6-8"]').click()`);
  await sleep(200);
  const big = await js(SIZES);
  check(!big.small.length, `H. at 6–8 every control is at least 44 by 44 px${big.small.length ? `: ${big.small.slice(0, 12).join("; ")}` : ""}`);
  await shot("ages-6-8-desktop.png");
  await phone();
  await sleep(400);
  const narrow = await js(SIZES);
  check(narrow.scroll <= 0, `H. at 6–8, 375 px wide, the page doesn't scroll sideways (${narrow.scroll} px over)`);
  await shot("ages-6-8-phone.png");
  await desktop();
  await js(`document.querySelector('#ages [data-age="9-11"]').click()`);
  await sleep(200);
  await shot("ages-9-11-desktop.png");
  await phone();
  await sleep(400);
  await shot("ages-9-11-phone.png");
  await desktop();
  await js(`document.querySelector('#ages [data-age="12"]').click()`);
  if (ONLY === "a1") throw null;
  /*AGES-TESTS*/
} catch (e) {
  if (e) { console.error(e); failures++; }
} finally {
  try { ws && ws.close(); } catch { /* closed */ }
  chrome.kill();
  server.close();
  await sleep(500);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
console.log(failures ? `${failures} failed` : "all ok");
process.exit(failures ? 1 : 0);
