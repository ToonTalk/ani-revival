// Check the film page (app/film.html) end to end in headless Chrome: it boots, the
// editor makes a change ("A kind stepmother"), Ani makes the whole film again in the
// page's worker, the frame counts match what Node makes of the same story, the glass
// box opens on the new film, and the new film comes back after a reload. And the switch
// for the films made here: it opens on "Ani as in 1978" and is kept in this browser; a
// new story that Ani as in 1978 stops on (test/stories/tortoise-and-hare.lisp, as the
// model's reply) is explained, with "Make it again with the revival's extensions", which
// makes it with MEND and APPEAR, and the glass box then says in plain English what each
// repair did, and the hare and the tortoise are drawn as Ani chose; Ken's own Cinderella,
// made as it is with the extensions, is drawn with Ani's looks (a small circle, a large
// triangle, an eight-pointed star and a large hexagon), its glass box has "How she looks"
// with a sentence made from Ani's reasons and Ken's 1978 look, and it comes back, looks
// and all, from the browser's copy and from a film file; while in 1978 mode Ken's story
// as it is can't be made again, and Ken's 1978 film is as it was throughout.
// Usage: node tools/check-film-app.mjs [--shots <dir>]   (about fifteen minutes)
//
// It serves the project on a free port itself, and drives Chrome over the DevTools
// protocol with Node's own WebSocket; Chrome's profile goes in the system's temp
// folder and is removed afterwards. CHROME=<path> picks another Chrome.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, extname, normalize } from "node:path";

// the kind stepmother's film, as tools/run-pass2.mjs and run-scene.mjs (or src/pipeline.js) make it in Node
const EXPECTED_LAST_FRAMES = [78, 133, 40, 200, 94];
// the tortoise and the hare with the revival's extensions (MEND and APPEAR): The Boast,
// The Race and The Finish film in 187, 111 and 29 frames (node tools/run-story.mjs
// test/stories/tortoise-and-hare.lisp --extensions mend,appear; with MEND alone, 187,
// 108 and 29, test/stories/stress/expected.json: the hare's larger size changes the
// race), so they end at frames 186, 110 and 28
const EXPECTED_MENDED_LAST_FRAMES = [186, 110, 28];
// Ken's Cinderella with the revival's extensions: 193, 116, 19, 175 and 92 frames, as
// reports/ext/appear/README.md has them (and run-story.mjs with --extensions mend,appear)
const EXPECTED_LOOKS_LAST_FRAMES = [192, 115, 18, 174, 91];
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const shotsAt = process.argv.indexOf("--shots");
const shots = shotsAt > 0 ? process.argv[shotsAt + 1] : null;
if (shots) mkdirSync(shots, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^[/\\]+/, "");
  if (path.startsWith("..")) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(join(process.cwd(), path));
    res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" }).end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const profile = await mkdtemp(join(tmpdir(), "ani-check-"));
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
  const send = (method, params = {}) => new Promise((resolve, reject) => { const n = ++id; pending.set(n, { resolve, reject }); ws.send(JSON.stringify({ id: n, method, params })); });
  const js = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const shot = async (name) => { if (shots) writeFileSync(join(shots, name), Buffer.from((await send("Page.captureScreenshot", { format: "png" })).data, "base64")); };
  const open = async () => {
    await send("Page.navigate", { url: `${base}/app/film.html` });
    for (let k = 0; k < 50; k++) { await sleep(200); if (await js(`!!document.getElementById("caption-0") && document.getElementById("caption-0").innerText.length > 0`).catch(() => false)) return; }
    throw new Error("the page didn't start");
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

  await open();
  check(/The stepmother pushes Cinderella around/.test(await js(`document.getElementById("caption-0").innerText`)), "the 1978 film starts, with its caption");
  // Play pressed at the very start of a scene: an animation frame's time can come a little
  // before the click's, and a clock run backwards once broke every redraw after it
  const played = await js(`(async () => {
    for (let k = 0; k < 20; k++) {
      document.querySelectorAll("#scenes button")[k % 5].click();
      await new Promise((r) => setTimeout(r, 20));
      document.getElementById("play").click();
      await new Promise((r) => setTimeout(r, 60));
      if (document.getElementById("play").textContent === "Pause") document.getElementById("play").click();
    }
    document.querySelector("#scenes button").click();
    return document.getElementById("frame-label").textContent;
  })()`);
  check(errors.length === 0 && /^0\.0 \//.test(played), "Play from the start of each scene, twenty times, without an error");
  await shot("1-film.png");
  // Ken's 1978 film, as shipped: each scene's length and the first caption, to compare at the end
  const film1978 = () => js(`(async () => {
    document.querySelector('#runbar [data-view="0"]').click();
    const out = [];
    for (const b of document.querySelectorAll("#scenes button")) {
      b.click();
      await new Promise((r) => setTimeout(r, 30));
      out.push(document.getElementById("frame-label").textContent.split("/")[1].trim());
    }
    document.querySelector("#scenes button").click();
    await new Promise((r) => setTimeout(r, 30));
    return out.join(" ") + " | " + document.getElementById("caption-0").innerText;
  })()`);
  const shipped = await film1978();

  // the switch for the films made here: "Ani as in 1978" at first, kept in this browser
  const pressed = () => js(`[...document.querySelectorAll("#side [data-mode]")].filter((b) => b.getAttribute("aria-pressed") === "true").map((b) => b.dataset.mode).join()`);
  await js(`document.getElementById("open-editor").click()`);
  await sleep(200);
  const first = await pressed();
  const panel = await js(`(() => { const p = document.querySelector("#side .ext-panel"); return p ? (p.open ? "open" : "closed") + " " + p.textContent : "none"; })()`);
  await js(`document.querySelector('#side [data-mode="revival"]').click()`);
  await open();
  await js(`document.getElementById("open-editor").click()`);
  await sleep(200);
  const kept = await pressed();
  await js(`document.querySelector('#side [data-mode="1978"]').click()`);
  await sleep(100);
  const back = await pressed();
  await js(`document.getElementById("ed-close").click()`);
  await sleep(200);
  check(first === "1978" && kept === "revival" && back === "1978", `the switch opens on "Ani as in 1978" and is kept in this browser (${first}, after a reload ${kept}, then ${back})`);
  check(/^closed /.test(panel) && /MEND/.test(panel) && /APPEAR/.test(panel) && /SHAPES/.test(panel) && /SLIPS/.test(panel), "under it, a closed \"Which extensions\" panel lists the repairs and Ani choosing the looks");

  await js(`document.getElementById("open-editor").click()`);
  await sleep(200);
  await js(`document.querySelector('[data-preset="0"]').click()`);
  await sleep(200);
  const changes = await js(`document.getElementById("ed-check").innerText`);
  check(/now pretty/.test(changes) && /now loves/.test(changes), "the editor applies \"A kind stepmother\"");
  await shot("2-editor.png");

  const t0 = Date.now();
  await js(`document.getElementById("ed-make").click()`);
  let status = "";
  for (let k = 0; k < 150; k++) {
    await sleep(4000);
    status = await js(`document.getElementById("run-status").innerText`);
    if (!/·/.test(status)) break;
  }
  check(/5 of 5 scenes filmed/.test(status), `Ani makes the film again in the page (${Math.round((Date.now() - t0) / 1000)} s): ${status}`);
  const lasts = await js(`(async () => {
    const out = [];
    for (const b of document.querySelectorAll("#scenes button")) {
      b.click();
      await new Promise((r) => setTimeout(r, 30));
      document.querySelector('#runbar [data-view="1"]').click();
      await new Promise((r) => setTimeout(r, 30));
      // the label shows seconds; a re-run is at 4 frames a second unless asked for 24
      out.push(Math.round(parseFloat(document.getElementById("frame-label").textContent.split("/")[1]) * 4));
    }
    document.querySelector('#runbar [data-view="both"]').click();
    return out;
  })()`);
  check(JSON.stringify(lasts) === JSON.stringify(EXPECTED_LAST_FRAMES), `the new film's scenes end at frames ${lasts.join(", ")} (Node: ${EXPECTED_LAST_FRAMES.join(", ")})`);

  await js(`(() => { document.querySelector("#scenes button").click(); const s = document.getElementById("scrub"); s.value = 30; s.dispatchEvent(new Event("input")); })()`);
  await sleep(200);
  const why = await js(`(() => {
    const c = document.querySelector("#fig-1 canvas");
    const r = c.getBoundingClientRect();
    for (let y = 0; y < 413; y += 3) for (let x = 0; x < 551; x += 3) {
      const at = { clientX: r.left + x / 551 * r.width, clientY: r.top + y / 413 * r.height, bubbles: true };
      c.dispatchEvent(new MouseEvent("mousemove", at));
      if (c.classList.contains("over")) { c.dispatchEvent(new MouseEvent("click", at)); return document.getElementById("side").innerText; }
    }
    return "";
  })()`);
  check(/Your version · The Introduction/.test(why), "clicking a character in the new film opens its glass box");
  await shot("3-side-by-side.png");

  await open();
  await sleep(1500);
  check(/5 of 5 scenes filmed/.test(await js(`document.getElementById("run-status").innerText`)), "the new film comes back after a reload");

  // a new story: the model's reply is stood in for (test/stories/red-riding-hood.lisp),
  // so nothing leaves the page; this checks drafting, the checks and the editor
  const drafted = await js(`(async () => {
    const lisp = await (await fetch("/test/stories/red-riding-hood.lisp")).text();
    const real = window.fetch;
    let asked = null;
    window.fetch = async (url, opts) => {
      if (!String(url).startsWith("https://api.anthropic.com/")) return real(url, opts);
      asked = JSON.parse(opts.body);
      return new Response(JSON.stringify({ content: [{ type: "text", text: "\`\`\`lisp\\n" + lisp + "\\n\`\`\`" }] }), { status: 200 });
    };
    document.getElementById("open-teller").click();
    await new Promise((r) => setTimeout(r, 200));
    const side = document.getElementById("side");
    side.querySelector('[data-provider="anthropic"]').click();
    await new Promise((r) => setTimeout(r, 100));
    side.querySelector('[data-story="0"]').click();
    const key = side.querySelector("#tell-key");
    key.value = "test-key-not-real";
    key.dispatchEvent(new Event("input"));
    side.querySelector("#tell-go").click();
    for (let k = 0; k < 50 && !side.querySelector("#tell-edit"); k++) await new Promise((r) => setTimeout(r, 100));
    const result = side.querySelector("#tell-result").innerText;
    side.querySelector("#tell-edit").click();
    await new Promise((r) => setTimeout(r, 200));
    return { asked: asked && asked.model, prompt: asked && asked.messages[0].content.length, result, editor: document.getElementById("ed-chars").innerText, make: !document.getElementById("ed-make").disabled };
  })()`);
  check(drafted.asked === "claude-sonnet-5-5" && drafted.prompt > 5000, `the story goes to the model with Ani's vocabulary (${drafted.prompt} characters to ${drafted.asked})`);
  check(/4 characters/.test(drafted.result) && /nothing wrong/.test(drafted.result), "the drafted description passes Ani's checks");
  check(/Red Riding Hood/.test(drafted.editor) && drafted.make, "the editor shows the new cast, ready to make the film");

  // a new story Ani as in 1978 stops on: the model's reply is stood in for again
  // (test/stories/tortoise-and-hare.lisp), and Ani makes it in 1978 mode
  await open();
  const asked = await js(`(async () => {
    const lisp = await (await fetch("/test/stories/tortoise-and-hare.lisp")).text();
    const real = window.fetch;
    let prompt = null;
    window.fetch = async (url, opts) => {
      if (!String(url).startsWith("https://api.anthropic.com/")) return real(url, opts);
      prompt = JSON.parse(opts.body).messages[0].content;
      return new Response(JSON.stringify({ content: [{ type: "text", text: "\`\`\`lisp\\n" + lisp + "\\n\`\`\`" }] }), { status: 200 });
    };
    document.getElementById("open-teller").click();
    await new Promise((r) => setTimeout(r, 200));
    const side = document.getElementById("side");
    side.querySelector('[data-provider="anthropic"]').click();
    await new Promise((r) => setTimeout(r, 100));
    side.querySelector('[data-story="1"]').click();
    const key = side.querySelector("#tell-key");
    key.value = "test-key-not-real";
    key.dispatchEvent(new Event("input"));
    side.querySelector("#tell-go").click();
    for (let k = 0; k < 50 && !side.querySelector("#tell-edit"); k++) await new Promise((r) => setTimeout(r, 100));
    side.querySelector("#tell-edit").click();
    await new Promise((r) => setTimeout(r, 200));
    document.getElementById("ed-make").click();
    return prompt;
  })()`);
  check(/everyone else leaves/.test(asked || "") && /Ani can't show \(meets X Y\) on its own/.test(asked || ""), "in 1978 mode the prompt says what (alone X Y) means, and that Ani can't show meeting on its own");
  const finished = async (tries = 150) => {
    let status = "";
    for (let k = 0; k < tries; k++) {
      await sleep(3000);
      status = await js(`document.getElementById("run-status").innerText`);
      if (!/·/.test(status)) break;
    }
    return status;
  };
  const stopped = await finished();
  const told = await js(`(() => { const b = document.querySelector("#side .stop-box"); return b ? b.innerText : ""; })()`);
  check(/0 of 3 scenes filmed, 3 stopped/.test(stopped), `Ani as in 1978 stops on the tortoise and the hare: ${stopped}`);
  check(/gave up on the hare's activity level/.test(told) && /can't weigh a value of none/.test(told), "the page says why, in a plain sentence");
  check(/Make it again with the revival's extensions/.test(told), "and offers \"Make it again with the revival's extensions\"");
  await shot("4-stopped-in-1978.png");

  // made again with the revival's extensions (MEND and APPEAR)
  const t1 = Date.now();
  await js(`document.querySelector("#side .stop-box [data-remake]").click()`);
  await sleep(300);
  const mode = await js(`localStorage.getItem("ani-cinderella:mode:v1")`);
  const mended = await finished();
  check(mode === "revival" && /with the revival's extensions: 3 of 3 scenes filmed/.test(mended), `with them, Ani makes it again (${Math.round((Date.now() - t1) / 1000)} s): ${mended}`);
  // the last frame of each scene of your version, at 4 frames a second
  const lastsOf = (n) => js(`(async () => {
    document.querySelector('#runbar [data-view="1"]').click();
    const out = [];
    for (const b of [...document.querySelectorAll("#scenes button")].slice(0, ${n})) {
      b.click();
      await new Promise((r) => setTimeout(r, 30));
      out.push(Math.round(parseFloat(document.getElementById("frame-label").textContent.split("/")[1]) * 4));
    }
    return out;
  })()`);
  const mendedLasts = await lastsOf(3);
  check(JSON.stringify(mendedLasts) === JSON.stringify(EXPECTED_MENDED_LAST_FRAMES), `its three scenes end at frames ${mendedLasts.join(", ")} (Node: ${EXPECTED_MENDED_LAST_FRAMES.join(", ")})`);
  await shot("5-made-with-repairs.png");
  const glass = await js(`(async () => {
    document.querySelector("#scenes button").click();
    const s = document.getElementById("scrub"); s.value = 10; s.dispatchEvent(new Event("input"));
    await new Promise((r) => setTimeout(r, 100));
    const c = document.querySelector("#fig-1 canvas");
    const r = c.getBoundingClientRect();
    for (let y = 0; y < 413; y += 3) for (let x = 0; x < 551; x += 3) {
      const at = { clientX: r.left + x / 551 * r.width, clientY: r.top + y / 413 * r.height, bubbles: true };
      c.dispatchEvent(new MouseEvent("mousemove", at));
      if (c.classList.contains("over")) {
        c.dispatchEvent(new MouseEvent("click", at));
        const box = document.querySelector("#side .repairs");
        return box ? box.innerText : "no repairs section: " + document.getElementById("side").innerText.slice(0, 200);
      }
    }
    return "no character found";
  })()`);
  check(/Ani's pass 1 gave up on the hare's activity level; the revival's repairs read it as medium, as Ani already reads an element she never set\./.test(glass), "the glass box says what the repairs did, in plain English");
  await js(`document.querySelector("#side .repairs") && document.querySelector("#side .repairs").scrollIntoView({ block: "start" })`);
  await shot("6-glass-box-repairs.png");
  // a new character has no 1978 look of Ken's: "How he looks" ends with the shape Ani as in
  // 1978 would have given him
  const newLooks = await js(`(() => { const d = document.querySelector("#side details.looks"); if (!d) return ""; d.open = true; return d.innerText; })()`);
  check(/^How (he|she|they) looks?\s+Ani made (him|her|them) (a|an) /.test(newLooks) && /With Ani as in 1978, the (hare|tortoise) would be (a|an) [a-z]+: a new character takes the next of the six shapes no one in the story has\.\s*$/.test(newLooks), `a new character's "How he looks": ${newLooks.split("\n").filter((l) => l.trim()).slice(1).join(" ")}`);
  // with APPEAR, the hare and the tortoise are drawn as Ani chose them (tools/run-story.mjs:
  // the tortoise a small square, the hare a large eight-pointed star)
  const fable = await js(`document.getElementById("legend").innerText`);
  check(/The hare: eight-pointed star/.test(fable) && /The tortoise: square/.test(fable), `the hare and the tortoise are drawn as Ani chose them (${fable.replace(/\n/g, "; ")})`);

  // Ken's Cinderella as it is, made with the extensions: with APPEAR, Ani draws his cast
  await open();
  await js(`document.getElementById("open-editor").click()`);
  await sleep(200);
  await js(`document.getElementById("ed-reset").click()`);
  await sleep(200);
  const asIs = await js(`({ enabled: !document.getElementById("ed-make").disabled, note: document.getElementById("ed-check").innerText, mode: ([...document.querySelectorAll("#side [data-mode]")].find((b) => b.getAttribute("aria-pressed") === "true") || {}).dataset?.mode })`);
  check(asIs.mode === "revival" && asIs.enabled && /This is Ken's story as it is\. With the revival's extensions Ani chooses each character's size and shape/.test(asIs.note), "with the extensions on, Ken's story as it is can be made again, and the editor says why");
  await js(`document.querySelector('#side [data-mode="1978"]').click()`);
  await sleep(100);
  const as1978 = await js(`!document.getElementById("ed-make").disabled`);
  await js(`document.querySelector('#side [data-mode="revival"]').click()`);
  await sleep(100);
  check(!as1978, "in 1978 mode it can't: it is Ken's film");
  const t2 = Date.now();
  await js(`document.getElementById("ed-make").click()`);
  const looked = await finished(400);
  check(/with the revival's extensions: 5 of 5 scenes filmed/.test(looked), `Ani makes Ken's Cinderella with the extensions (${Math.round((Date.now() - t2) / 1000)} s): ${looked}`);
  const looksLasts = await lastsOf(5);
  check(JSON.stringify(looksLasts) === JSON.stringify(EXPECTED_LOOKS_LAST_FRAMES), `its scenes end at frames ${looksLasts.join(", ")} (reports/ext/appear: ${EXPECTED_LOOKS_LAST_FRAMES.join(", ")})`);
  // the legend and each icon from Ani's looks, beside Ken's: a path's points, or a circle
  const cast = () => js(`(() => {
    document.querySelector('#runbar [data-view="both"]').click();
    const legend = [...document.querySelectorAll("#legend span")].map((s) => s.innerText + " [" + [...s.querySelectorAll("svg")].map((g) => (g.querySelector("circle") ? "circle" : g.querySelector("path").getAttribute("d").split("L").length + " points")).join(", ") + "]").join("; ");
    const drawn = document.querySelector("#side .cast-looks");
    return { legend, drawn: drawn ? drawn.innerText.replace(/\\s*why\\?/g, "").replace(/\\n+/g, "; ") : "" };
  })()`);
  const drew = await cast();
  const castOk = (x) => /Cinderella: star in 1978, circle in yours \[5 points, circle\]/.test(x.legend) && /The stepmother: square in 1978, triangle in yours \[4 points, 3 points\]/.test(x.legend)
    && /The fairy godmother: circle in 1978, eight-pointed star in yours \[circle, 8 points\]/.test(x.legend) && /The Prince: triangle in 1978, hexagon in yours \[3 points, 6 points\]/.test(x.legend);
  check(castOk(drew), `the screens' legend and icons are Ani's looks beside Ken's: ${drew.legend}`);
  check(/Cinderella: a small circle \(in 1978, a green star\)/.test(drew.drawn) && /The stepmother: a large triangle \(in 1978, a red square\)/.test(drew.drawn) && /The fairy godmother: an eight-pointed star \(in 1978, an orange circle\)/.test(drew.drawn) && /The Prince: a large hexagon \(in 1978, a yellow triangle\)/.test(drew.drawn), `"How Ani drew them": ${drew.drawn}`);
  await js(`(() => { document.querySelector("#scenes button").click(); const s = document.getElementById("scrub"); s.value = 12; s.dispatchEvent(new Event("input")); })()`);
  await sleep(200);
  await shot("7-cinderella-with-looks.png");
  // her glass box: "How she looks", closed, a sentence made from Ani's reasons, each aspect
  // opening its choice point with the evidence, and Ken's 1978 look at the end
  const clickOn = (fig, name, then) => js(`(async () => {
    const c = document.querySelector("#${fig} canvas");
    for (let y = 0; y < 413; y += 3) for (let x = 0; x < 551; x += 3) {
      const r = c.getBoundingClientRect();
      const at = { clientX: r.left + x / 551 * r.width, clientY: r.top + y / 413 * r.height, bubbles: true };
      c.dispatchEvent(new MouseEvent("mousemove", at));
      if (!c.classList.contains("over")) continue;
      c.dispatchEvent(new MouseEvent("click", at));
      await new Promise((r) => setTimeout(r, 20));
      const h = document.querySelector("#side h2");
      if (h && h.innerText === ${JSON.stringify(name)}) return (${then})();
    }
    return { found: false };
  })()`);
  const how = await clickOn("fig-1", "Cinderella", `async () => {
    const d = document.querySelector("#side details.looks");
    if (!d) return { found: true, text: "" };
    const closed = !d.open;
    d.open = true;
    d.querySelector('[data-look="cinderella|size"]').click();
    await new Promise((r) => setTimeout(r, 50));
    d.scrollIntoView({ block: "start" });
    return { found: true, closed, text: d.innerText, box: d.querySelector("#look-box").innerText };
  }`);
  check(how.found && how.closed && /^How she looks\s+Ani made her a small circle: small because she is shy and the film isn't to be flashy; smooth because she is friendly and graceful; simple because she is shy and the film is to be simple\./.test(how.text), `her glass box has "How she looks", closed, with a sentence from Ani's reasons: ${(how.text || "").split("\n").filter((l) => l.trim())[1] || ""}`);
  const howText = how.text || "", howBox = how.box || "";
  check(/In 1978 Ken drew her himself as a green star: the star in initialize-characters/.test(howText) && /the green in running-color/.test(howText) && /In 1978 Ken drew her/.test(howText.split("\n").filter(Boolean).pop() || ""), "it ends with how Ken drew her in 1978, and where he said so");
  check(/She is shy, which suggests small\.\s*the revival's: a shy character keeps small and takes up little room/.test(howBox) && /size is also bigger is flashier.{0,3}\s*\(Ken's code, glosug\.41:39\)/.test(howBox), "\"small\" opens her size's choice point, with Ken's code quoted and the revival's knowledge marked as the revival's");
  await shot("8-how-she-looks.png");
  const kens = await clickOn("fig-0", "Cinderella", `() => ({ found: true, looks: !!document.querySelector("#side details.looks") })`);
  check(kens.found && !kens.looks, "Ken's 1978 film's glass box has no \"How she looks\": he drew her himself");
  // it comes back from this browser's copy, and from a film file, drawn with Ani's looks
  await open();
  await sleep(1500);
  const restored = await cast();
  check(castOk(restored) && /5 of 5 scenes filmed/.test(await js(`document.getElementById("run-status").innerText`)), "it comes back after a reload, drawn with Ani's looks");
  const saved = await js(`(async () => {
    const orig = HTMLAnchorElement.prototype.click;
    let got = null;
    HTMLAnchorElement.prototype.click = function () { if (this.download) got = { name: this.download, href: this.href }; else orig.call(this); };
    try {
      if (document.getElementById("save-panel").hidden) document.getElementById("save").click();
      document.querySelector('#save-panel [data-save="file"]').click();
      for (let k = 0; k < 100 && !got; k++) await new Promise((r) => setTimeout(r, 100));
    } finally { HTMLAnchorElement.prototype.click = orig; }
    if (!got) return { saved: false };
    const text = await (await fetch(got.href)).text();
    sessionStorage.setItem("ani-check-film", text);
    localStorage.removeItem("ani-cinderella:run:v1");
    return { saved: true, name: got.name, version: JSON.parse(text).version, kb: Math.round(text.length / 1024) };
  })()`);
  await open();
  await sleep(500);
  const none = await js(`document.getElementById("runbar").hidden`);
  await js(`(async () => {
    const text = sessionStorage.getItem("ani-check-film");
    const dt = new DataTransfer();
    dt.items.add(new File([text], "film.json", { type: "application/json" }));
    document.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
    for (let k = 0; k < 50 && document.getElementById("runbar").hidden; k++) await new Promise((r) => setTimeout(r, 100));
  })()`);
  await sleep(300);
  const reopened = await cast();
  check(saved.saved && saved.version === 2 && none && castOk(reopened), `saved as a film file (${saved.name}, version ${saved.version}, ${saved.kb} KB) and opened again on a fresh page, it is drawn with Ani's looks`);
  check(await film1978() === shipped, "Ken's 1978 film is as it was shipped");
  await js(`document.querySelector('#runbar [data-view="both"]').click()`);
  check(errors.length === 0, `no uncaught errors${errors.length ? ": " + errors.slice(0, 3).join(" | ") : ""}`);
} catch (e) {
  check(false, e.message);
} finally {
  if (ws) ws.close();
  chrome.kill();
  server.close();
  await sleep(500);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
console.log(failures ? `${failures} check(s) failed` : "all checks passed");
process.exit(failures ? 1 : 0);
