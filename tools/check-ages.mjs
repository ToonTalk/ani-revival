// Check the film page's age setting (reports/chapter-x/design-young-children.md, "Tests"),
// in headless Chrome, with no model calls:
//   A. 12+ unchanged: every explanation the page makes for Ken's 1978 film at 12+ (each
//      frame's caption at 4 and 24 frames a second; each character's panel at the start of
//      every part and at every still; the story panel at each scene), byte for byte as
//      reports/ext/ages/12plus.json has them (a hash each; --write-12plus writes it, as it
//      was taken before stage A0's refactor).
//      Written again on 21 October 2026 with the page's button keys counted out (critAction's
//      numbers, which a Gemini Nano answering the page's probe shifts; the check now runs
//      with no Nano) and "Your criticism" relabeled "Criticism of this film" (no "your"
//      for what is kept on a shared computer, Ken): a script compared every one of the 4,094
//      with the last commit's, and those 10 labels were the only difference.
//      And again later that day, with two of Ken's settings read by their form (settingWords:
//      "mood joyous and anticipatory", "mood very joyous", were "mood and joyous to
//      anticipatory", "mood very to joyous"): the story panel at each scene, 10, the only
//      difference.
//      And on 22 October, with "How long the film is" (Ken's request, option 3): the story
//      panel's box and "How Ani timed it"'s step where a part ran past its plan, 41 hashes;
//      built with those two stubbed out, all 4,094 were as before.
//   (Since 21 October 2026 the settings are 6–11 and 12+: Ken's decision, 6–8 gone and 9–11
//   become 6–11; the old links #ages-6-8 and #ages-9-11 open 6–11.)
//   B. True to the glass box, at 6–11: each "to show what … is like: …" names exactly the
//      source words the glass box gives its way, read here with this tool's own reader of the
//      related-suggestions items, and a way that came from a relationship never says what
//      someone is like; Who decided is a ladder (The story says, Ani knows, So Ani chose);
//      every simple panel ends in More (the 12+ panel); the glossary's terms only are marked.
//   C. No 6–11 sentence has Lisp, a citation of Ken's files or an actor's name.
//   D. Length at 6–11: sentences over 22 words are counted, as a warning (the record's own
//      lists of words make some longer).
//   E. Everyday words at 6–11: what the page shows (the story panel, a character's panel,
//      Teach Ani, Tell Ani a new story, the editor, the footer), outside More, Lisp and the
//      boxes typed in, has none of the page's own hard words (the revival, extensions, a
//      language model, Ken's notation, the glass box, frames, criticism, heed, establish,
//      convey, the thesis, an API key); and at 12+ again every word is back as it was.
//   T. Teaching kept on a shared computer: Teach Ani's "Save this teaching to a file", "Open
//      saved teaching…" and "Forget all teaching saved on this computer", which lists what it
//      deletes in the page and deletes it only when confirmed, also in "What this page keeps";
//      a new notebook is "Teaching", and no label says "my".
//   F. Speech: speechSynthesis and SpeechRecognition stood in for: at 6–11 Read aloud is off
//      until turned on; on, with "Wait for the voice" chosen in the speech settings,
//      a scene begins with its title, a new caption waits for the voice, pause stops it, the
//      voice says Ani as SAY_AS has it; no recognizer before the grown-up's opt-in, a final
//      result fills the box and sends nothing, "play" plays, anything else is said back, and
//      with no recognition no microphone is shown and the settings point to dictation.
//      The voice (Ken: "when possible use a female voice"): app/film/speech.js chooseVoice
//      given made-up lists of voices: a woman's English voice of the page's English, a
//      natural or online one first; another English, then any woman's English voice; offline
//      only a local one; with no woman's voice, the default English one; the visitor's
//      choice always wins.
//   F12. Speech at 12+: out of the way (a small "Speech" in the header's row, closed), Read
//      aloud off and not beside Play, nothing said, no microphone; turned on there, it reads
//      and appears beside Play, and the film doesn't wait for the voice; Talk to Ani only
//      after the opt-in, then a microphone by the story box and none beside Play.
//   G. Presentation only: a film's data is the same at every age, with no age in it; the
//      hash token sets and remembers the age; a link can't turn on Talk to Ani.
//   H. Accessibility: controls at 6–11 at least 32 px (44 with "Bigger"), no
//      horizontal scroll at 375 px, a glossary term opens with Enter and closes with Escape,
//      the captions' live region is off while Ani reads aloud, a line says who is on the
//      screen, the guides' links follow the setting, and the text colors meet 4.5:1.
//   A6. At 6–11, Tell Ani's model settings under More settings and Teach Ani's kinds 1 and 2
//      first; at 12+ both as they were, and Read aloud not beside Play (off at first).
// Usage: node tools/check-ages.mjs [--only a|a1] [--write-12plus] [--shots dir]
//   (about five minutes)
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
const HOOKED = ["captionAt", "select", "goScene", "RUNS", "state", "whyOf", "frameIn", "setRate", "renderSide", "AGES", "GLOSS", "filmData", "chooseVoice"];
const hookLine = `\nwindow.__ages = { ${HOOKED.map((n) => `get ${n}() { try { return ${n}; } catch { return undefined; } }`).join(", ")} };\n`;
const hooked = (html) => { const end = html.lastIndexOf("</script>"); return html.slice(0, end) + hookLine + html.slice(end); };
const page = () => readFileSync("app/film.html", "utf8");

const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^[/\\]+/, "");
  const at = path.replace(/\\/g, "/");
  if (path.startsWith("..")) { res.writeHead(403).end(); return; }
  // (with no Gemini Nano, whose answer to the page's probe comes at no set time and adds a
  // button to "Tell Ani what's wrong")
  if (at === "app/film.ages.html") { res.writeHead(200, { "content-type": "text/html" }).end(hooked(page()).replace("<head>", `<head>\n<script>${NO_NANO}</script>`)); return; }
  // with speech stood in for, before the page's own script runs (test F)
  if (at === "app/film.speech.html") { res.writeHead(200, { "content-type": "text/html" }).end(hooked(page()).replace("<head>", `<head>\n<script>${SPEECH_STUB}</script>`)); return; }
  if (at === "app/film.nospeech.html") { res.writeHead(200, { "content-type": "text/html" }).end(hooked(page()).replace("<head>", `<head>\n<script>${SPEECH_STUB}\ndelete window.SpeechRecognition; delete window.webkitSpeechRecognition;</script>`)); return; }
  try {
    const body = await readFile(join(process.cwd(), path));
    res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" }).end(body);
  } catch { res.writeHead(404).end(); }
});
const NO_NANO = `for (const k of ["LanguageModel", "ai"]) try { Object.defineProperty(window, k, { value: undefined, configurable: true }); } catch { /* not here */ }`;
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
    // (a critAction key counts the page's own buttons; written \\d here, inside a template)
    const norm = (h) => h.replace(/data-crit-act="\\d+"/g, 'data-crit-act="#"');
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
  await open("film.ages.html", "#ages-6-11");
  const linked = await js(`({ cls: document.documentElement.className, kept: localStorage.getItem("ani-cinderella:age:v1"), note: document.getElementById("age-note").hidden ? "" : document.getElementById("age-note").innerText, ages: [...document.querySelectorAll("#ages [data-age]")].map((b) => b.textContent).join(" "), intro: [...document.querySelectorAll("header .intro")].filter((p) => p.offsetParent).map((p) => p.innerText).join(" | ") })`);
  check(/(^| )age-6-11( |$)/.test(linked.cls) && linked.kept === "6-11" && /This link set the page for ages 6–11/.test(linked.note) && linked.ages === "6–11 12+" && /^Ani is a computer program that Ken Kahn wrote at MIT in 1978\./.test(linked.intro),
    `G. #ages-6-11 sets the page for ages 6–11, says so, and is kept in this browser; the setting offers ${linked.ages}: ${linked.note} | ${linked.intro}`);
  // the old links, and an old kept value, open 6–11
  const old = [];
  for (const token of ["ages-6-8", "ages-9-11"]) {
    await js(`localStorage.setItem("ani-cinderella:age:v1", "12")`);
    await send("Page.navigate", { url: "about:blank" });
    await open("film.ages.html", `#${token}`);
    old.push(await js(`document.documentElement.className + " " + localStorage.getItem("ani-cinderella:age:v1")`));
  }
  await js(`localStorage.setItem("ani-cinderella:age:v1", "9-11")`);
  await send("Page.navigate", { url: "about:blank" });
  await open();
  old.push(await js(`document.documentElement.className`));
  check(old.every((x) => /(^| )age-6-11( |$)/.test(x)) && /6-11$/.test(old[0]) && /6-11$/.test(old[1]), `G. the old links #ages-6-8 and #ages-9-11, and a kept 9–11, open 6–11 (${old.join(" | ")})`);
  await send("Page.navigate", { url: "about:blank" });
  await open("film.ages.html", "#kept-apart.48.cinderella.ages-6-11");
  await sleep(300);
  const moment = await js(`({ cls: document.documentElement.className, scene: window.__ages.state.scene, panel: window.__ages.state.panel, who: window.__ages.state.selected && window.__ages.state.selected.char, kept: localStorage.getItem("ani-cinderella:age:v1") })`);
  check(/(^| )age-6-11( |$)/.test(moment.cls) && moment.scene === 1 && moment.panel === "why" && moment.who === "cinderella" && moment.kept === "6-11", `G. #kept-apart.48.cinderella.ages-6-11 opens the moment at ages 6–11 (${JSON.stringify(moment)})`);
  await open();
  const kept = await js(`document.documentElement.className`);
  check(/(^| )age-6-11( |$)/.test(kept), "G. the age is kept: the page opened again without a link is at ages 6–11");
  const back12 = await js(`(() => { document.querySelector('#ages [data-age="12"]').click(); return { cls: document.documentElement.className, kept: localStorage.getItem("ani-cinderella:age:v1"), legend: document.querySelectorAll("#legend .chip").length, label: document.getElementById("frame-label").textContent }; })()`);
  check(!/age-/.test(back12.cls) && back12.kept === "12" && back12.legend === 0 && /frame/.test(back12.label), "G. 12+ chosen: the page is as it was (no chips in the legend, the frame said)");
  // H (sizes at 6–11 with "Bigger"): every control shown is at least 44 by 44 px, and at 375
  // px wide the page doesn't scroll sideways (a link in a sentence is WCAG 2.5.5's inline
  // exception)
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
  await js(`document.querySelector('#ages [data-age="6-11"]').click()`);
  await sleep(200);
  const bigOn = await js(`(() => { document.getElementById("bigger").click(); return { cls: document.documentElement.className, kept: localStorage.getItem("ani-cinderella:bigger:v1"), pressed: document.getElementById("bigger").getAttribute("aria-pressed") }; })()`);
  await sleep(200);
  const big = await js(SIZES);
  check(/(^| )big( |$)/.test(bigOn.cls) && bigOn.kept === "1" && bigOn.pressed === "true" && !big.small.length, `H. at 6–11 with "Bigger" (kept in this browser), every control is at least 44 by 44 px${big.small.length ? `: ${big.small.slice(0, 12).join("; ")}` : ""}`);
  await shot("ages-6-11-bigger-desktop.png");
  await phone();
  await sleep(400);
  const narrow = await js(SIZES);
  check(narrow.scroll <= 0, `H. at 6–11 with "Bigger", 375 px wide, the page doesn't scroll sideways (${narrow.scroll} px over)`);
  await shot("ages-6-11-bigger-phone.png");
  await desktop();
  await js(`document.getElementById("bigger").click()`);
  await sleep(200);
  await shot("ages-6-11-desktop.png");
  await phone();
  await sleep(400);
  const narrow611 = await js(SIZES);
  check(narrow611.scroll <= 0, `H. at 6–11, 375 px wide, the page doesn't scroll sideways (${narrow611.scroll} px over)`);
  await shot("ages-6-11-phone.png");
  await desktop();
  await js(`document.querySelector('#ages [data-age="12"]').click()`);
  if (ONLY === "a1") throw null;
  // ---------------------------------------------------------------- the simpler sentences (A2)
  // Every 6–11 caption of Ken's film at 4 frames a second, and each character's panel at the
  // start of each part (its simple boxes, not More), read as text by the check.
  await desktop();
  await open();
  await js(`document.querySelector('#ages [data-age="6-11"]').click()`);
  await sleep(300);
  const simple = await js(`(async () => {
    const t = window.__ages, run = t.RUNS[0], out = { captions: [], panels: [], gl: {}, glass: [] };
    const side = document.getElementById("side");
    const text = (h) => { const d = document.createElement("div"); d.innerHTML = h; return d.textContent; };
    for (let i = 0; i < run.scenes.length; i++) {
      const sc = run.scenes[i];
      out.glass.push(sc.glass.tasks.map((x) => ({ name: x.name, parent: x.variables.parent, task: x.variables.task, items: x.items || [] })));
      let lastPart = null;
      for (let f = 0; f <= sc.last; f++) {
        const c = t.captionAt(run, i, f);
        const s = [c.part, text(c.text), ...c.more.map(text)].join(" | ");
        if (out.captions[out.captions.length - 1] !== s) out.captions.push(s);
        for (const m of (c.text + c.more.join(" ")).matchAll(/data-gl="([^"]+)"/g)) out.gl[m[1]] = true;
        if (c.part !== lastPart) {
          lastPart = c.part;
          t.goScene(i, (f + 0.5) / 4);
          for (const ch of run.cast) {
            if (!sc.film.frames[f] || !sc.film.frames[f].chars[ch]) continue;
            t.select({ run: 0, char: ch }, { scroll: false });
            const d = side.querySelector(".who-decided"); if (d) d.open = true;
            const boxes = [...side.children].filter((x) => !x.matches(".age-more, .side-head")).map((x) => x.innerText.replace(/\\b(Read this|Too quick|Too slow|Not this way: another way|Show something else)\\b/g, "")).join("\\n");
            out.panels.push({ at: i + " " + f + " " + ch, text: boxes, more: !!side.querySelector(".age-more"), gl: [...side.querySelectorAll("[data-gl]")].map((b) => b.dataset.gl) });
          }
        }
      }
    }
    t.select(null, { scroll: false });
    return out;
  })()`);
  const allText = [...simple.captions, ...simple.panels.map((p) => p.text)];
  // C at 6–11: no Lisp, no citation of Ken's files, no actor's name, and not the words
  // subscene, method or element
  const lispy = allText.filter((s) => /\((set|define|establish|convey|method:|task:)\b|\b[a-z]+\.\d+:\d+|\b(establish|convey)-task-\d+|\b(subscene|method|element)s?\b/i.test(s));
  check(!lispy.length && simple.captions.length > 20 && simple.panels.length > 20, `C. no 6–11 sentence has Lisp, a citation or an actor's name (${simple.captions.length} captions, ${simple.panels.length} panels)${lispy.length ? `: ${lispy.slice(0, 3).join(" ‖ ").slice(0, 400)}` : ""}`);
  // B, independently of the page: the check's own reader of the glass boxes. Each 6–11
  // "to show what X is like: words" names exactly the source words of the related-suggestions
  // items whose way is the one shown, and a way that came from a relationship never says
  // what someone is like.
  const sourcesOf = (scene) => {
    const out = [];
    for (const t of scene) for (const item of t.items) {
      if (!item.startsWith("(related-suggestions:")) continue;
      // the task's own kind (personality, relationship, ...), from its description
      const kind = (/description \(([\w-]+)/.exec(t.task || "") || [])[1];
      const head = item.slice(0, item.indexOf(" relationship "));
      const way = /value \(method: type convey value \(([^)]*)\)/.exec(head);
      const main = /source (\S+?)\)/.exec(head);
      if (!way || !main) continue;
      const others = [...item.slice(item.indexOf(" others ")).matchAll(/source (\S+?)\)/g)].map((m) => m[1]);
      out.push({ kind, way: way[1], sources: [main[1], ...others].filter((w, k, a) => a.indexOf(w) === k) });
    }
    return out;
  };
  const known = simple.glass.flatMap(sourcesOf);
  const likeLines = simple.captions.flatMap((s) => [...s.matchAll(/to show what ([^.|]+?) is like: ([^.|]+)\./g)].map((m) => m[2].split(/, | and /).map((w) => w.trim().replace(/ /g, "-"))));
  const likeOk = likeLines.every((ws) => known.some((k) => k.kind === "personality" && k.sources.length === ws.length && ws.every((w) => k.sources.includes(w))));
  const relWays = new Set(known.filter((k) => k.kind !== "personality").map((k) => k.way.split(" ")[0]));
  const pushLike = simple.captions.filter((s) => /pushes [^,]+ around, to show what/.test(s));
  check(likeLines.length > 0 && likeOk && !pushLike.length, `B. each 6–11 “to show what … is like: …” names exactly the source words the glass box gives its way (${likeLines.length} such sentences; ways from relationships: ${[...relWays].join(", ")}), and a push never says what someone is like`);
  // the ladder: Who decided says what the story says, what Ani knows, and what Ani chose
  const ladders = simple.panels.filter((p) => /The story says/.test(p.text));
  check(ladders.length > 5 && ladders.every((p) => /So Ani chose/.test(p.text)) && simple.panels.every((p) => p.more), `B. Who decided is a ladder (The story says…, Ani knows…, So Ani chose…) in ${ladders.length} panels, and every simple panel ends in More, the 12+ panel`);
  // the glossary: its terms only; the record's other words pass through unglossed
  const glUsed = [...new Set([...Object.keys(simple.gl), ...simple.panels.flatMap((p) => p.gl)])];
  const GLOSSED = await js(`Object.keys(window.__ages.GLOSS || {})`);
  check(glUsed.length >= 4 && GLOSSED.length > 0 && glUsed.every((g) => GLOSSED.includes(g)), `B. glossary terms marked in the 6–11 text: ${glUsed.join(", ")}`);
  // D at 6–11: sentences of at most 22 words, boxes of at most 4 sentences (a warning, as the
  // record's own lists of words can make a sentence longer)
  const sentences = allText.flatMap((s) => s.split(/(?<=[.!?])\s+|\s\|\s|\n/)).map((s) => s.trim()).filter(Boolean);
  const long = sentences.filter((s) => s.split(/\s+/).length > 22);
  console.log(`${long.length ? "warn" : "ok  "}  D. 6–11 sentences of more than 22 words: ${long.length} of ${sentences.length}${long.length ? ` (the longest ${Math.max(...long.map((s) => s.split(/\s+/).length))} words)` : ""}`);
  // H: a glossary term opens with Enter and closes with Escape, its text tied to it
  const pop = await js(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    window.__ages.select(null, { scroll: false });
    await wait(100);
    const b = document.querySelector("#side [data-gl]");
    if (!b) return { none: true };
    b.focus();
    b.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    b.click(); // (a button's Enter is its click)
    await wait(50);
    const open = { expanded: b.getAttribute("aria-expanded"), described: b.getAttribute("aria-describedby"), shown: !document.getElementById("gl-pop").hidden, text: document.getElementById("gl-pop").innerText };
    document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await wait(50);
    return { ...open, closed: document.getElementById("gl-pop").hidden && b.getAttribute("aria-expanded") === "false", focus: document.activeElement === b };
  })()`);
  check(!pop.none && pop.expanded === "true" && pop.described === "gl-pop" && pop.shown && /Ani's word: “/.test(pop.text) && pop.closed && pop.focus, `H. a glossary term opens its popover (aria-expanded, aria-describedby) and Escape closes it, back on the term: ${(pop.text || "").replace(/\s+/g, " ").slice(0, 120)}`);
  // H at 6–11: every control shown at least 32 by 32 px
  const mid = await js(SIZES.replace("r.width < 43.5 || r.height < 43.5", "r.width < 31.5 || r.height < 31.5"));
  check(!mid.small.length, `H. at 6–11 every control is at least 32 by 32 px${mid.small.length ? `: ${mid.small.slice(0, 12).join("; ")}` : ""}`);
  // A7: who is on the stage, for a screen reader
  const onScreen = await js(`document.getElementById("on-screen").textContent`);
  check(/^On the screen now: /.test(onScreen), `H. a line for a screen reader says who is on the screen: ${onScreen}`);
  await shot("ages-6-11-panel.png");
  // the guides' links follow the setting: the guide for teachers and parents at both, its
  // part on young children at 6–11
  const guides = await js(`[...document.querySelectorAll("header .guides a")].filter((a) => getComputedStyle(a).display !== "none").map((a) => a.getAttribute("href") + "=" + a.textContent)`);
  check(guides.some((g) => /students\.html=A guide for students$/.test(g)) && guides.some((g) => /teachers\.html#young=A guide for teachers and parents$/.test(g)) && guides.length === 2, `H. at 6–11 the header links to ${guides.join(", ")}`);
  // H: the text tokens the simpler settings use meet 4.5:1 on the page's sheet, in both themes
  const CONTRAST = `(() => {
    const css = getComputedStyle(document.documentElement);
    const rgb = (v) => { const s = v.trim(); const m = /^#([0-9a-f]{6})$/i.exec(s); return m ? [0, 2, 4].map((k) => parseInt(m[1].slice(k, k + 2), 16)) : null; };
    const lum = (c) => { const [r, g, b] = c.map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    const sheet = rgb(css.getPropertyValue("--sheet")), ink = rgb(css.getPropertyValue("--ink")), muted = rgb(css.getPropertyValue("--muted"));
    return sheet && ink && muted ? { ink: +ratio(ink, sheet).toFixed(2), muted: +ratio(muted, sheet).toFixed(2) } : null;
  })()`;
  const light = await js(CONTRAST);
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
  await sleep(100);
  const dark = await js(CONTRAST);
  await send("Emulation.setEmulatedMedia", { features: [] });
  check(light && dark && Math.min(light.ink, light.muted, dark.ink, dark.muted) >= 4.5, `H. the text colors meet 4.5:1 on the sheet in both themes (light: ink ${light && light.ink}, muted ${light && light.muted}; dark: ink ${dark && dark.ink}, muted ${dark && dark.muted})`);

  // ---------------------------------------------------------------- A6: Tell Ani, Teach Ani
  const a6 = await js(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.getElementById("open-teller").click();
    await wait(300);
    const more = document.querySelector("#side details.more-settings");
    const out = { folded: !!more && !more.open && /The (model|AI) writes/.test(more.innerText + more.textContent) && /Which Ani/.test(more.textContent) };
    window.__ages.select(null, { scroll: false });
    await wait(100);
    const teach = document.querySelector("[data-teach-open]");
    teach.click();
    await wait(800);
    const kinds = document.querySelector("#side details.more-kinds");
    out.kinds = [...document.querySelectorAll("#side .teach-kind")].filter((b) => !b.closest("details")).map((b) => b.textContent);
    out.more = kinds ? [...kinds.querySelectorAll(".teach-kind")].length : 0;
    window.__ages.select(null, { scroll: false });
    return out;
  })()`);
  check(a6.folded && a6.kinds.length === 2 && a6.more >= 3, `A6. at 6–11, Tell Ani's model settings are under More settings, and Teach Ani opens on ${a6.kinds.join(" and ")}, with ${a6.more} more kinds under More kinds`);
  // and at 12+ both are as they were
  await js(`document.querySelector('#ages [data-age="12"]').click()`);
  await sleep(200);
  const a6at12 = await js(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.getElementById("open-teller").click();
    await wait(300);
    const out = { folded: !!document.querySelector("#side details.more-settings"), readAloud: getComputedStyle(document.getElementById("read-aloud")).display };
    window.__ages.select(null, { scroll: false });
    return out;
  })()`);
  check(!a6at12.folded && a6at12.readAloud === "none", "A6. at 12+, Tell Ani is as it was, and Read aloud (off at first) isn't beside Play");

  // ---------------------------------------------------------------- G: presentation only
  const films = await js(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const out = {};
    for (const age of ["12", "6-11"]) {
      document.querySelector('#ages [data-age="' + age + '"]').click();
      await wait(150);
      out[age] = JSON.stringify(window.__ages.filmData(window.__ages.RUNS[0]));
    }
    document.querySelector('#ages [data-age="12"]').click();
    return { same: out["12"] === out["6-11"], age: /ages?-?(6-11|6-8|9-11)|"age"/.test(out["6-11"]), n: out["12"].length };
  })()`);
  check(films.same && !films.age, `G. a film's data is the same at every age, with no age in it (${films.n.toLocaleString("en-US")} characters)`);

  // ---------------------------------------------------------------- F: speech (A4, A5)
  await open("film.speech.html", "#ages-6-11");
  const read = await js(`(async () => {
    const t = window.__ages, S = window.__speech, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
    out.before = [document.getElementById("read-aloud").hidden, document.getElementById("read-aloud").getAttribute("aria-pressed"), S.said.filter((x) => x !== "<cancel>").length].join();
    t.goScene(0, 0);
    await wait(300);
    document.getElementById("read-aloud").click();
    document.querySelector('#speech-settings [data-speech-wait="1"]').click();
    out.pressed = document.getElementById("read-aloud").getAttribute("aria-pressed");
    out.live = document.getElementById("caption-0").getAttribute("aria-live");
    await wait(700);
    out.first = S.said.filter((x) => x !== "<cancel>").slice(0, 2);
    document.getElementById("play").click();
    await wait(400);
    const n0 = S.said.length;
    t.goScene(1, 0.1);
    await wait(300);
    out.saidWhileSpeaking = S.said.slice(n0).filter((x) => x !== "<cancel>").length;
    const a = t.state.time; await wait(800); out.held = t.state.time - a;
    for (let k = 0; k < 8; k++) S.end();
    await wait(300);
    out.next = S.said.slice(n0).filter((x) => x !== "<cancel>");
    const b = t.state.time; await wait(600); out.moving = t.state.time - b;
    document.getElementById("play").click();
    await wait(100);
    out.cancelled = S.said[S.said.length - 1] === "<cancel>";
    const d = document.getElementById("speech-settings"); d.open = true;
    const n1 = S.said.length;
    document.getElementById("speech-try").click();
    out.annie = S.said.slice(n1).some((x) => /\\bAnnie\\b/.test(x)) && !S.said.some((x) => /\\bAni\\b/.test(x));
    out.recognizers = S.made.length;
    return out;
  })()`);
  check(read.before === "false,false,0" && read.pressed === "true" && read.live === "off" && read.first.length && /^Scene one: /.test(read.first[0]), `F. at 6–11 Read aloud is beside Play and off until turned on; on, the captions' live region is off, and a scene begins with its title (${read.before}): ${read.first.join(" ")}`);
  check(read.saidWhileSpeaking === 0 && read.held === 0 && /^Scene two: /.test(read.next[0] || "") && read.moving > 0 && read.cancelled, `F. at 6–11, with "Wait for the voice" chosen, a new caption waits for the voice (the film held still, then went on with the next caption said), and Pause stops the voice`);
  check(read.annie && read.recognizers === 0, "F. the voice says Ani as SAY_AS respells it, and no recognizer is made before the grown-up's opt-in");
  // the voice chosen when the visitor has chosen none: a woman's, when there is one
  const voices = await js(`(() => {
    const choose = window.__ages.chooseVoice, v = (name, lang, local = true, def = false) => ({ name, lang, localService: local, default: def, voiceURI: name });
    const win = [v("Microsoft David - English (United States)", "en-US", true, true), v("Microsoft Mark - English (United States)", "en-US"), v("Microsoft Zira - English (United States)", "en-US"), v("Microsoft Hazel - English (United Kingdom)", "en-GB"), v("Microsoft Aria Online (Natural) - English (United States)", "en-US", false), v("Microsoft Guy Online (Natural) - English (United States)", "en-US", false), v("Microsoft Sonia Online (Natural) - English (United Kingdom)", "en-GB", false), v("Microsoft Hedda - German (Germany)", "de-DE")];
    const chrome = [v("Google Deutsch", "de-DE", false), v("Google US English", "en-US", false), v("Google UK English Male", "en-GB", false), v("Google UK English Female", "en-GB", false)];
    const apple = [v("Daniel", "en-GB", true, true), v("Alex", "en-US"), v("Samantha", "en-US"), v("Karen", "en-AU"), v("Moira", "en-IE")];
    const android = [v("English United States (male)", "en-US", true, true), v("English United Kingdom (female)", "en-GB")];
    const men = [v("Microsoft David - English (United States)", "en-US", true, true), v("Microsoft Mark - English (United States)", "en-US"), v("Google UK English Male", "en-GB", false), v("Thomas", "fr-FR")];
    const n = (x) => (x ? x.name : null);
    return {
      winUS: n(choose(win, { lang: "en-US" })), winGB: n(choose(win, { lang: "en-GB" })), winOff: n(choose(win, { lang: "en-US", online: false })),
      chosen: n(choose(win, { chosen: "Microsoft Mark - English (United States)", lang: "en-US" })), chosenOffOnline: n(choose(win, { chosen: "Microsoft Guy Online (Natural) - English (United States)", online: false })),
      chromeUS: n(choose(chrome, { lang: "en-US" })), chromeGB: n(choose(chrome, { lang: "en-GB" })),
      apple: n(choose(apple, { lang: "en-US" })), appleGB: n(choose(apple, { lang: "en-GB" })),
      android: n(choose(android, { lang: "en-US" })),
      men: n(choose(men, { lang: "en-US" })), none: n(choose([v("Thomas", "fr-FR")], { lang: "en-US" })),
    };
  })()`);
  const wantVoices = {
    winUS: "Microsoft Aria Online (Natural) - English (United States)", winGB: "Microsoft Sonia Online (Natural) - English (United Kingdom)", winOff: "Microsoft Zira - English (United States)",
    chosen: "Microsoft Mark - English (United States)", chosenOffOnline: "Microsoft Zira - English (United States)",
    chromeUS: "Google US English", chromeGB: "Google UK English Female", apple: "Samantha", appleGB: "Samantha",
    android: "English United Kingdom (female)", men: "Microsoft David - English (United States)", none: null,
  };
  const voiceMiss = Object.keys(wantVoices).filter((k) => voices[k] !== wantVoices[k]);
  check(!voiceMiss.length, `F. the voice, with none chosen, is a woman's English voice when there is one (the page's English, natural or online first; offline a local one); the visitor's choice wins; with none, the default English voice${voiceMiss.length ? `; wrong: ${voiceMiss.map((k) => `${k} ${voices[k]}`).join(" | ")}` : ""}`);
  // Talk to Ani: opt-in in the settings, a microphone by the story box, words in the box and
  // nothing sent; a command beside Play at 6–11; an unknown phrase said back; a link can't
  // turn it on
  const talk = await js(`(async () => {
    const t = window.__ages, S = window.__speech, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
    out.micsBefore = document.querySelectorAll(".mic-row").length + (document.getElementById("talk-cmd").hidden ? 0 : 1);
    document.getElementById("speech-talk").click();
    await wait(200);
    document.getElementById("open-teller").click();
    await wait(300);
    out.mics = document.querySelectorAll(".mic-row").length;
    out.madeBeforePress = S.made.length;
    const sent = []; const real = window.fetch; window.fetch = (...a) => { sent.push(String(a[0])); return real(...a); };
    document.querySelector(".mic-row button").click();
    await wait(50);
    S.hear("a timid goat crosses a bridge");
    await wait(100);
    out.box = document.getElementById("tell-story").value;
    out.sent = sent.length;
    window.fetch = real;
    out.cmdShown = !document.getElementById("talk-cmd").hidden;
    document.getElementById("talk-cmd").click(); await wait(50); S.hear("play"); await wait(200);
    out.played = t.state.playing;
    document.getElementById("talk-cmd").click(); await wait(50); S.hear("banana bread"); await wait(100);
    out.heard = document.getElementById("talk-heard").textContent;
    return out;
  })()`);
  check(talk.micsBefore === 0 && talk.mics === 1 && talk.madeBeforePress === 0 && talk.box === "a timid goat crosses a bridge" && talk.sent === 0, "F. Talk to Ani: no microphone before the opt-in; after it, one by the story box, whose words go into the box, and nothing is sent");
  check(talk.cmdShown && talk.played && /^Ani heard: “banana bread”\. Try “play” or “why”\.$/.test(talk.heard), `F. at 6–11, with Talk to Ani on, a microphone beside Play: “play” plays, and anything else is said back: ${talk.heard}`);
  await js(`localStorage.removeItem("ani-cinderella:speech:v1")`);
  await send("Page.navigate", { url: "about:blank" });
  await open("film.speech.html", "#ages-9-11.talk.talk-to-ani");
  const linkTalk = await js(`({ kept: localStorage.getItem("ani-cinderella:speech:v1"), cmd: document.getElementById("talk-cmd").hidden })`);
  check(!/"talk":true/.test(linkTalk.kept || "") && linkTalk.cmd, "G. a link can't turn on Talk to Ani (the hash sets only the age)");
  await open("film.nospeech.html", "#ages-9-11");
  const none = await js(`(async () => { const d = document.getElementById("speech-settings"); d.open = true; await new Promise((r) => setTimeout(r, 100)); return { mics: document.querySelectorAll(".mic, .mic-row").length - document.querySelectorAll(".mic[hidden]").length, text: d.innerText }; })()`);
  check(none.mics === 0 && /Windows\+H/.test(none.text), "F. where the browser has no recognition, no microphone is shown, and the settings point to the computer's own dictation");
  await js(`document.querySelector('#ages [data-age="12"]').click()`);
  await sleep(200);
  const none12 = await js(`(async () => { const d = document.getElementById("speech-settings"); d.open = true; await new Promise((r) => setTimeout(r, 100)); const out = { mics: document.querySelectorAll(".mic, .mic-row").length - document.querySelectorAll(".mic[hidden]").length, text: d.innerText }; d.open = false; return out; })()`);
  check(none12.mics === 0 && /Windows\+H/.test(none12.text), "F12. at 12+ too, with no recognition, no microphone, and the settings point to dictation");

  // ---------------------------------------------------------------- F12: speech at 12+
  await js(`localStorage.removeItem("ani-cinderella:speech:v1"); localStorage.setItem("ani-cinderella:age:v1", "12")`);
  await send("Page.navigate", { url: "about:blank" });
  await open("film.speech.html");
  const s12 = await js(`(async () => {
    const t = window.__ages, S = window.__speech, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
    const d = document.getElementById("speech-settings"), btn = document.getElementById("read-aloud");
    out.where = d.parentElement.id; out.summary = d.querySelector("summary").textContent; out.closed = !d.open;
    out.shown = getComputedStyle(document.getElementById("speech-head")).display !== "none";
    out.btnBefore = getComputedStyle(btn).display; out.live = document.getElementById("caption-0").getAttribute("aria-live");
    t.goScene(0, 0); await wait(700);
    out.saidBefore = S.said.filter((x) => x !== "<cancel>").length;
    out.micsBefore = document.querySelectorAll(".mic-row").length + (document.getElementById("talk-cmd").hidden ? 0 : 1);
    d.querySelector("summary").click(); await wait(100);
    const box = document.getElementById("speech-read");
    out.unchecked = !!box && !box.checked; out.noWait = !d.querySelector("[data-speech-wait]");
    out.note = d.innerText;
    box.click(); await wait(700);
    out.btnAfter = getComputedStyle(btn).display; out.pressed = btn.getAttribute("aria-pressed");
    out.first = S.said.filter((x) => x !== "<cancel>").slice(0, 1);
    out.kept = localStorage.getItem("ani-cinderella:speech:v1");
    document.body.click(); await wait(50); out.closedByClick = !d.open;
    document.getElementById("play").click(); await wait(400);
    const n0 = S.said.length;
    t.goScene(1, 0.1); await wait(300);
    const a = t.state.time; await wait(800); out.moving = t.state.time - a;
    out.saidNext = S.said.slice(n0).filter((x) => x !== "<cancel>").length;
    document.getElementById("play").click(); await wait(100);
    d.open = true; await wait(50);
    document.getElementById("speech-talk").click(); await wait(300);
    document.getElementById("open-teller").click(); await wait(400);
    out.mics = document.querySelectorAll(".mic-row").length; out.cmd = document.getElementById("talk-cmd").hidden;
    out.byStory = !!document.querySelector("#tell-story + .mic-row");
    out.recognizers = S.made.length;
    window.__ages.select(null, { scroll: false });
    return out;
  })()`);
  check(s12.where === "speech-head" && s12.summary === "Speech" && s12.closed && s12.shown && s12.btnBefore === "none" && s12.live === "polite" && s12.saidBefore === 0 && s12.micsBefore === 0,
    `F12. at 12+ speech is out of the way: a closed "Speech" in the header's row, Read aloud off and not beside Play, nothing said, no microphone (${s12.where}, ${s12.summary}, said ${s12.saidBefore})`);
  check(s12.unchecked && s12.noWait && /Off until you turn it on, on this computer\. A link can't turn it on\./.test(s12.note) && s12.btnAfter !== "none" && s12.pressed === "true" && s12.first.length && /"read12":true/.test(s12.kept || "") && !/"read":/.test(s12.kept || "") && s12.closedByClick,
    `F12. turned on in "Speech", Read aloud reads (${s12.first.join(" ").slice(0, 60)}…) and appears beside Play, kept for 12+ only; no wait-for-the-voice choice; a click elsewhere closes "Speech"`);
  check(s12.moving > 0.3 && s12.saidNext > 0, `F12. at 12+ the film doesn't wait for the voice (it moved ${s12.moving.toFixed(2)} s while the voice was still speaking, and said the new caption)`);
  check(s12.mics === 1 && s12.byStory && s12.cmd && s12.recognizers === 0, "F12. at 12+ Talk to Ani after the opt-in: a microphone by the story box, none beside Play, and nothing listening until it is pressed");
  await js(`localStorage.removeItem("ani-cinderella:speech:v1")`);

  // ---------------------------------------------------------------- E: everyday words at 6–11
  // What the page shows at 6–11, panel by panel, outside More, Lisp and the boxes typed in:
  // none of the page's own hard words. Then at 12+ every word is back as it was.
  await js(`localStorage.removeItem("ani-cinderella:speech:v1")`);
  await send("Page.navigate", { url: "about:blank" });
  await open("film.ages.html", "#ages-6-11");
  const HARD = "\\b(revival|extensions?|language models?|notation|glass box(es)?|frames?|criticism|criticiz\\w*|heed\\w*|establish\\w*|convey\\w*|thesis|API keys?|Pass [12])\\b";
  const everydayText = await js(`(async () => {
    const t = window.__ages, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
    const side = document.getElementById("side");
    // the text shown, as innerText reads it, without More, Lisp and the boxes typed in
    const shown = (el) => {
      const hide = [...el.querySelectorAll(".age-more, pre, textarea, code, .lisp, details.teach-lisp > .body, #ed-lisp-box > .body")];
      hide.forEach((x) => { x.dataset.was = x.style.display; x.style.display = "none"; });
      const text = el.innerText;
      hide.forEach((x) => { x.style.display = x.dataset.was; });
      return text;
    };
    const openAll = () => side.querySelectorAll("details:not(.age-more)").forEach((d) => { d.open = true; });
    for (let i = 0; i < 5; i++) { t.goScene(i, 0.5); t.select(null, { scroll: false }); await wait(60); openAll(); await wait(30); out["story " + i] = shown(side); }
    for (const ch of ["cinderella", "step-mother"]) { t.goScene(2, 1); t.select({ run: 0, char: ch }, { scroll: false }); await wait(60); openAll(); await wait(30); out["panel " + ch] = shown(side); }
    t.select(null, { scroll: false }); await wait(50);
    document.getElementById("open-teller").click(); await wait(300); openAll(); await wait(30); out.tell = shown(side);
    t.select(null, { scroll: false }); await wait(50);
    document.getElementById("open-editor").click(); await wait(600); openAll(); await wait(30); out.editor = shown(side);
    t.select(null, { scroll: false }); await wait(50);
    document.querySelector("[data-teach-open]").click(); await wait(800);
    for (const b of document.querySelectorAll("#side .teach-kind")) { b.click(); await wait(150); openAll(); await wait(30); out["teach " + b.textContent] = shown(side); }
    out.page = shown(document.querySelector("header")) + "\\n" + shown(document.querySelector(".controls")) + "\\n" + shown(document.querySelector("footer"));
    t.select(null, { scroll: false });
    return out;
  })()`);
  const hardRe = new RegExp(HARD, "i");
  const hard = Object.entries(everydayText).flatMap(([k, v]) => v.split(/\n+/).filter((l) => hardRe.test(l)).map((l) => `${k}: ${l.trim().slice(0, 140)}`));
  check(Object.keys(everydayText).length >= 12 && !hard.length, `E. at 6–11 none of the page's own hard words is shown outside More, Lisp and the boxes typed in (${Object.keys(everydayText).length} panels)${hard.length ? `: ${[...new Set(hard)].slice(0, 8).join(" ‖ ")}` : ""}`);
  const back = await js(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.querySelector('#ages [data-age="12"]').click();
    await wait(150);
    return { footer: document.querySelector("footer").textContent, label: document.getElementById("frame-label").textContent, aria: document.getElementById("back").getAttribute("aria-label") };
  })()`);
  check(/A new story is first put into Ken's notation by a language model of your choice/.test(back.footer) && /frame/.test(back.label) && back.aria === "Back one frame", `E. at 12+ again, every word is back as it was (the footer's “Ken's notation by a language model”, “${back.aria}”)`);

  // ---------------------------------------------------------------- T: teaching on a shared computer
  const teaching = await js(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
    const until = async (f, ms = 3000) => { for (let k = 0; k < ms / 50 && !f(); k++) await wait(50); return f(); };
    const side = document.getElementById("side");
    document.querySelector("[data-teach-open]").click();
    await until(() => side.querySelector(".teach-files"));
    const btn = (nb) => side.querySelector('.teach-files [data-teach-nb="' + nb + '"]');
    out.first = { save: !!btn("save-open") && btn("save-open").disabled, open: !!btn("file"), forget: !!btn("forget-all") };
    side.querySelector('.teach-books [data-teach-nb="new"]').click();
    await until(() => btn("forget-all"));
    out.title = (side.querySelector(".teach-book-head b") || {}).textContent;
    btn("forget-all").click();
    await until(() => side.querySelector(".teach-forget"));
    out.confirm = (side.querySelector(".teach-forget") || {}).innerText || "";
    out.stillThere = /\\(1 notebook/.test(side.querySelector(".teach-books summary").textContent);
    side.querySelector("[data-forget-teaching-no]").click();
    await wait(100);
    out.kept = !side.querySelector(".teach-forget") && /\\(1 notebook/.test(side.querySelector(".teach-books summary").textContent);
    btn("forget-all").click();
    await until(() => side.querySelector("[data-forget-teaching]"));
    side.querySelector("[data-forget-teaching]").click();
    await until(() => /\\(0 notebooks/.test((side.querySelector(".teach-books summary") || {}).textContent || ""));
    out.after = side.querySelector(".teach-books summary").textContent + " | " + ((side.querySelector(".crit-added") || {}).textContent || "");
    out.forgetGone = !btn("forget-all");
    // and in "What this page keeps"
    side.querySelector('.teach-books [data-teach-nb="new"]').click();
    await until(() => btn("forget-all"));
    const kept = document.getElementById("kept-note");
    kept.open = true;
    await until(() => document.getElementById("kept-forget-teaching"));
    document.getElementById("kept-forget-teaching").click();
    await until(() => document.querySelector("#kept-body [data-forget-teaching]"));
    out.keptConfirm = (document.querySelector("#kept-body .teach-forget") || {}).innerText || "";
    document.querySelector("#kept-body [data-forget-teaching]").click();
    await until(() => !document.getElementById("kept-forget-teaching"));
    out.keptAfter = !document.getElementById("kept-forget-teaching") && !/Teaching: /.test(document.getElementById("kept-body").innerText);
    kept.open = false;
    // no label says "my", at either age
    const labels = () => [...document.querySelectorAll("button, summary, .label, h2, option, figcaption")].map((x) => x.textContent).filter((x) => /\\bmy\\b/i.test(x));
    out.my12 = labels();
    document.querySelector('#ages [data-age="6-11"]').click(); await wait(200);
    out.my611 = labels();
    document.querySelector('#ages [data-age="12"]').click(); await wait(100);
    window.__ages.select(null, { scroll: false });
    return out;
  })()`);
  check(teaching.first.save && teaching.first.open && !teaching.first.forget, `T. Teach Ani has "Save this teaching to a file" (not yet: nothing taught) and "Open saved teaching…", and with nothing kept no "Forget"`);
  check(teaching.title === "Teaching" && /This deletes all the teaching kept on this computer, one notebook:\s*“Teaching” \(0 pieces\)/.test(teaching.confirm) && teaching.stillThere && teaching.kept,
    `T. a new notebook is “${teaching.title}”; "Forget all teaching saved on this computer" lists what it deletes in the page, and "Keep it" keeps it: ${teaching.confirm.replace(/\s+/g, " ").slice(0, 160)}`);
  check(/\(0 notebooks\)/.test(teaching.after) && /forgotten/.test(teaching.after) && teaching.forgetGone && /“Teaching” \(0 pieces\)/.test(teaching.keptConfirm) && teaching.keptAfter,
    `T. confirmed, the teaching is forgotten (${teaching.after.trim()}); "What this page keeps" offers the same, with the same list`);
  check(!teaching.my12.length && !teaching.my611.length, `T. no label says "my", at 12+ or 6–11${teaching.my12.length || teaching.my611.length ? `: ${[...teaching.my12, ...teaching.my611].join(" | ")}` : ""}`);
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
