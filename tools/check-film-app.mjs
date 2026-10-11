// Check the film page (app/film.html) end to end in headless Chrome: it boots, the
// editor makes a change ("A kind stepmother"), Ani makes the whole film again in the
// page's worker, the frame counts match what Node makes of the same story, the glass
// box opens on the new film, and the new film comes back after a reload. And the switch
// for the films made here: it opens on "Ani as in 1978" and is kept in this browser; a
// new story that Ani as in 1978 stops on (test/stories/tortoise-and-hare.lisp, as the
// model's reply) is explained, with "Make it again with the revival's extensions", which
// makes it with MEND and APPEAR, and the glass box then says in plain English what each
// repair did, and the hare and the tortoise are drawn as Ani chose; Ken's own Cinderella,
// made as it is with the extensions, is drawn with Ani's looks (a small hexagon, a large
// triangle, an eight-pointed star and a large circle), its glass box has "How she looks"
// (Cinderella's and the stepmother's) with a sentence made from Ani's reasons and Ken's
// 1978 look, and it comes back, looks and all, from the browser's copy and from a film
// file; while in 1978 mode Ken's story
// as it is can't be made again, and Ken's 1978 film is as it was throughout. And a story
// with a change (test/stories/change-of-heart.lisp, as the model's reply): with the
// extensions the prompt teaches the change task, and in 1978 mode it doesn't; in 1978
// mode the page won't make the story, and offers the extensions; with them Ani takes a
// fresh look at the stepmother after Change of Heart (the progress says so), every scene
// ends as in Node, the changing scene's caption says the change itself isn't shown yet,
// and Kind Again's glass box has "How she has changed", with a sentence made from the
// fresh look, her elements before and after, each opening the fresh look's choice point,
// and the dynamics saying where each value came from; and it all comes back after a
// reload, and in a film file.
// Usage: node tools/check-film-app.mjs [--shots <dir>]   (about twenty minutes)
// With --shots, the change story's fresh look and "How she has changed" are also taken
// at a phone's width.
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
// the stepmother who repents, with the revival's extensions (MEND, APPEAR and CHANGE): At
// Home, Change of Heart and Kind Again film in 108, 72 and 29 frames (node
// tools/run-story.mjs test/stories/change-of-heart.lisp --extensions mend,appear,change
// --frames 1000, and reports/ext/change/README.md), so they end at frames 107, 71 and 28
const EXPECTED_CHANGE_LAST_FRAMES = [107, 71, 28];
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
  check(/Characters who change \(CHANGE\)\. A scene may change a character/.test(panel) && /fresh look/.test(panel) && /isn't shown yet/.test(panel), "and characters who change, in a plain sentence");

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
  check(!/\(change \(/.test(asked || "") && !/causes/.test(asked || ""), "in 1978 mode the prompt doesn't offer a change");
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
  const castOk = (x) => /Cinderella: star in 1978, hexagon in yours \[5 points, 6 points\]/.test(x.legend) && /The stepmother: square in 1978, triangle in yours \[4 points, 3 points\]/.test(x.legend)
    && /The fairy godmother: circle in 1978, eight-pointed star in yours \[circle, 8 points\]/.test(x.legend) && /The Prince: triangle in 1978, circle in yours \[3 points, circle\]/.test(x.legend);
  check(castOk(drew), `the screens' legend and icons are Ani's looks beside Ken's: ${drew.legend}`);
  check(/Cinderella: a small hexagon \(in 1978, a green star\)/.test(drew.drawn) && /The stepmother: a large triangle \(in 1978, a red square\)/.test(drew.drawn) && /The fairy godmother: an eight-pointed star \(in 1978, an orange circle\)/.test(drew.drawn) && /The Prince: a large circle \(in 1978, a yellow triangle\)/.test(drew.drawn), `"How Ani drew them": ${drew.drawn}`);
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
  check(how.found && how.closed && /^How she looks\s+Ani made her a small hexagon: small because she is shy and the film isn't to be flashy; smooth because she is friendly and graceful; moderately complex, from suggestions Ani combined\./.test(how.text), `her glass box has "How she looks", closed, with a sentence from Ani's reasons: ${(how.text || "").split("\n").filter((l) => l.trim())[1] || ""}`);
  const howText = how.text || "", howBox = how.box || "";
  check(/In 1978 Ken drew her himself as a green star: the star in initialize-characters/.test(howText) && /the green in running-color/.test(howText) && /In 1978 Ken drew her/.test(howText.split("\n").filter(Boolean).pop() || ""), "it ends with how Ken drew her in 1978, and where he said so");
  check(/She is shy, which suggests small\.\s*the revival's: a shy character keeps small and takes up little room/.test(howBox) && /size is also bigger is flashier.{0,3}\s*\(Ken's code, glosug\.41:39\)/.test(howBox), "\"small\" opens her size's choice point, with Ken's code quoted and the revival's knowledge marked as the revival's");
  await shot("8-how-she-looks.png");
  // the stepmother's: large, as Ken drew her, by his own knowledge (strong, p. 238, his
  // decision of 11 October; dominates, relate.22:63), the thesis quoted as the thesis's
  const step = await clickOn("fig-1", "The stepmother", `async () => {
    const d = document.querySelector("#side details.looks");
    if (!d) return { found: true, text: "" };
    d.open = true;
    d.querySelector('[data-look="step-mother|size"]').click();
    await new Promise((r) => setTimeout(r, 50));
    d.scrollIntoView({ block: "start" });
    return { found: true, text: d.innerText, box: d.querySelector("#look-box").innerText };
  }`);
  check(step.found && /^How she looks\s+Ani made her a large triangle: large because she is strong and is to be larger than Cinderella/.test(step.text || "") && /strong friendly ally.{0,3}\s*\(thesis, p\. 238\)/.test(step.box || "") && /In 1978 Ken drew her himself as a large red square/.test(step.text || ""), `the stepmother's "How she looks": ${(step.text || "").split("\n").filter((l) => l.trim())[1] || ""}`);
  await shot("8b-how-the-stepmother-looks.png");
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

  // a story with a change: the stepmother repents (test/stories/change-of-heart.lisp, as
  // the model's reply), told with the extensions on, then looked at in 1978 mode
  await open();
  const changeTold = await js(`(async () => {
    const lisp = await (await fetch("/test/stories/change-of-heart.lisp")).text();
    const real = window.fetch;
    let prompt = null;
    window.fetch = async (url, opts) => {
      if (!String(url).startsWith("https://api.anthropic.com/")) return real(url, opts);
      prompt = JSON.parse(opts.body).messages[0].content;
      return new Response(JSON.stringify({ content: [{ type: "text", text: "\`\`\`lisp\\n" + lisp + "\\n\`\`\`" }] }), { status: 200 });
    };
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.getElementById("open-teller").click();
    await wait(200);
    const side = document.getElementById("side");
    side.querySelector('[data-mode="revival"]').click();
    side.querySelector('[data-provider="anthropic"]').click();
    await wait(100);
    side.querySelector('[data-story="0"]').click();
    const key = side.querySelector("#tell-key");
    key.value = "test-key-not-real";
    key.dispatchEvent(new Event("input"));
    side.querySelector("#tell-go").click();
    for (let k = 0; k < 50 && !side.querySelector("#tell-edit"); k++) await wait(100);
    const revival = side.querySelector("#tell-result").innerText;
    side.querySelector('[data-mode="1978"]').click();
    await wait(200);
    const as1978 = side.querySelector("#tell-result").innerText;
    side.querySelector("#tell-edit").click();
    await wait(300);
    const offer = document.getElementById("ed-make-mend");
    return { prompt, revival, as1978, editor: document.getElementById("ed-check").innerText, refused: document.getElementById("ed-make").disabled, offer: offer && !offer.hidden ? offer.textContent : "" };
  })()`);
  check(/\(convey \(change \(personality X OLD\) \(personality X NEW\)\)\)/.test(changeTold.prompt || "") && /\(convey \(causes Y \(change \.\.\.\)\)\)/.test(changeTold.prompt || "") && /A change is shown from the next scene on, for now/.test(changeTold.prompt || "") && /isn't animated yet/.test(changeTold.prompt || ""), "with the extensions, the prompt teaches the change task, and says it is shown from the next scene on");
  check(/nothing wrong/.test(changeTold.revival) && /Ani takes a fresh look at the stepmother after this scene, and she moves as she has become from Kind Again on; the change itself isn't shown yet/.test(changeTold.revival), "with them, the draft passes Ani's checks, and says what CHANGE will do");
  const refusal = /The Prince makes the stepmother good and kind, no longer evil and mean.{0,3} in Change of Heart: Ani as in 1978 can't change a character during a story/;
  check(refusal.test(changeTold.as1978) && refusal.test(changeTold.editor), "in 1978 mode it is refused, in a plain sentence");
  check(changeTold.refused && changeTold.offer === "Make it with the revival's extensions", `and can't be made as in 1978; the editor offers "${changeTold.offer}"`);
  await js(`document.getElementById("ed-check").scrollIntoView({ block: "center" })`);
  await shot("11-change-refused-in-1978.png");

  // made with the extensions: the fresh look shows in the progress, between At Home's
  // filming and Change of Heart's pass 2
  const t3 = Date.now();
  await js(`document.getElementById("ed-make-mend").click()`);
  const seen = {};
  let freshMeter = null, freshShot = false;
  for (let k = 0; k < 600; k++) {
    await sleep(1000);
    const now = await js(`(() => { const p = document.getElementById("progress"); return { status: document.getElementById("run-status").innerText, meter: p ? p.querySelector("i").style.width : "" }; })()`);
    for (const [step, re] of [["fresh", /Pass 1 again: a fresh look at the stepmother, who changes in Change of Heart/], ["recompute", /Pass 1 again, to compare: everyone chosen afresh as of Change of Heart/], ["pass2", /Pass 2: planning Change of Heart/]]) if (re.test(now.status) && !seen[step]) seen[step] = Date.now();
    if (seen.fresh && !freshShot) {
      freshShot = true;
      freshMeter = parseFloat(now.meter);
      await shot("12-fresh-look-progress.png");
      if (shots) {
        await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
        await sleep(400);
        await js(`document.getElementById("progress") && document.getElementById("progress").scrollIntoView({ block: "center" })`);
        await sleep(200);
        await shot("12b-fresh-look-progress-phone.png");
        await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
        await js(`scrollTo(0, 0)`);
      }
    }
    if (!/·/.test(now.status)) break;
  }
  const changeMade = await js(`document.getElementById("run-status").innerText`);
  const took = (a, b) => (seen[a] && seen[b] ? `${Math.round((seen[b] - seen[a]) / 1000)} s` : "?");
  check(!!seen.fresh && !!seen.recompute && !!seen.pass2 && seen.fresh < seen.recompute && seen.recompute < seen.pass2 && freshMeter > 0 && freshMeter < 100, `the progress shows Ani's fresh look (${took("fresh", "recompute")}, the bar at ${freshMeter}%) and the full recompute (${took("recompute", "pass2")}) before Change of Heart's pass 2`);
  check(/with the revival's extensions: 3 of 3 scenes filmed/.test(changeMade), `with them, Ani makes it (${Math.round((Date.now() - t3) / 1000)} s): ${changeMade}`);
  const changeLasts = await lastsOf(3);
  check(JSON.stringify(changeLasts) === JSON.stringify(EXPECTED_CHANGE_LAST_FRAMES), `its three scenes end at frames ${changeLasts.join(", ")} (Node: ${EXPECTED_CHANGE_LAST_FRAMES.join(", ")})`);
  const compared = await js(`document.getElementById("side").innerText`);
  check(/In Change of Heart the Prince made the stepmother good and kind, no longer evil and mean; from Kind Again on /.test(compared), "the story's panel says who the story changed, and how she moves after");
  // Change of Heart: the caption says the change itself isn't shown yet
  const changeCaption = await js(`(async () => {
    document.querySelectorAll("#scenes button")[1].click();
    const s = document.getElementById("scrub"); s.value = 2; s.dispatchEvent(new Event("input"));
    await new Promise((r) => setTimeout(r, 100));
    return document.getElementById("caption-1").innerText;
  })()`);
  check(/Here the Prince makes the stepmother good and kind, no longer evil and mean\. Ani doesn't animate the change itself yet; a later stage will\. From Kind Again on, the stepmother moves as she has become\./.test(changeCaption), `Change of Heart's caption says the change isn't shown yet: ${changeCaption.split("\n").slice(-1)[0]}`);
  // Kind Again: the stepmother's glass box
  const howChanged = async () => {
    await js(`(async () => { document.querySelector('#runbar [data-view="1"]').click(); document.querySelectorAll("#scenes button")[2].click(); const s = document.getElementById("scrub"); s.value = 2; s.dispatchEvent(new Event("input")); await new Promise((r) => setTimeout(r, 100)); })()`);
    return clickOn("fig-1", "The stepmother", `async () => {
      const d = document.querySelector("#side details.changed");
      if (!d) return { found: true, text: "" };
      const closed = !d.open;
      d.open = true;
      const row = [...d.querySelectorAll("tbody tr")].find((r) => /Curvature of the path/.test(r.innerText));
      row.querySelector("[data-cp]").click();
      await new Promise((r) => setTimeout(r, 50));
      const held = d.querySelector("details");
      held.open = true;
      const moves = [...document.querySelectorAll("#side details")].find((x) => /^How she moves/.test(x.innerText));
      if (moves) moves.open = true;
      d.scrollIntoView({ block: "start" });
      return { found: true, closed, text: d.innerText, box: d.querySelector("#chg-box").innerText, held: held.innerText, rows: [...d.querySelectorAll("tbody tr")].map((r) => r.innerText.replace(/\\s+/g, " ").trim()), moves: moves ? moves.innerText : "" };
    }`);
  };
  const changed = await howChanged();
  check(changed.found && changed.closed && /^How she has changed\s+In Change of Heart the Prince made the stepmother good and kind, no longer evil and mean; from Kind Again on her path curves more, her curves are longer and her path is smoother\./.test(changed.text || ""), `Kind Again's glass box has "How she has changed", closed, with a sentence from the fresh look: ${(changed.text || "").split("\n").filter((l) => l.trim())[1] || ""}`);
  // the table's rows: Director's elements, then pass 2's, then those Director doesn't use, each group under a line that says so
  const rows = changed.rows || [];
  const at = (re) => rows.findIndex((r) => re.test(r));
  const groups = [/^Director moves her by these$/, /^Pass 2 repeats an activity as often as these say$/, /^Chosen again; Director doesn't use these, as in 1978 \(thesis p\. 186\)$/].map(at);
  check(rows.length === 15 && groups.join() === "0,5,9" && /^Curvature of the path low medium why\?$/.test(rows[2] || "") && /^Acceleration high medium why\?$/.test(rows[10] || "") && /^Liking for enemies strong dislike strong liking why\?$/.test(rows[13] || ""), `her twelve elements before and after, Director's first, and those Director doesn't use marked so (${rows.slice(0, 3).join("; ")}; ...; ${rows.slice(9, 11).join("; ")}; ...)`);
  check(/^Ani's fresh look after Change of Heart\s+The stepmother's curvature of the path: medium/.test(changed.box || "") && /good \(the opposite of evil\)/.test(changed.box || "") && /her curvature of the path is to be different from Cinderella's, the fairy godmother's and the Prince's/.test(changed.box || ""), `its "why?" opens the fresh look's choice point: ${(changed.box || "").split("\n").slice(0, 3).join(" | ")}`);
  check(/Without holding them, the Prince's deliberateness would have been high, not medium\./.test(changed.held || "") && /with everyone chosen afresh as of Change of Heart, the Prince's deliberateness would be high, not medium, and her deliberateness would be medium, not high/.test(changed.held || ""), "one click away, what was held, and the full recompute to compare");
  check(/as Ani chose for the stepmother in her fresh look after Change of Heart; it was low before/.test(changed.moves || ""), "How she moves says her curvature comes from the fresh look");
  await shot("13-how-she-has-changed.png");
  if (shots) {
    await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleep(400);
    await js(`document.querySelector("#side details.changed").scrollIntoView({ block: "start" })`);
    await sleep(200);
    await shot("13b-how-she-has-changed-phone.png");
    await js(`document.querySelector("#chg-box").scrollIntoView({ block: "start" })`);
    await sleep(200);
    await shot("13c-fresh-look-choice-phone.png");
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  }
  // At Home, before the change, has none
  const before = await js(`(async () => {
    document.querySelectorAll("#scenes button")[0].click();
    await new Promise((r) => setTimeout(r, 100));
    return !!document.querySelector("#side details.changed");
  })()`);
  check(!before, "At Home's glass box, before the change, has no \"How she has changed\"");
  // it comes back after a reload, and from a film file
  await open();
  await sleep(1500);
  const again = await howChanged();
  check(/^How she has changed\s+In Change of Heart the Prince made the stepmother/.test(again.text || "") && /^Ani's fresh look after Change of Heart/.test(again.box || ""), "after a reload, the film comes back with \"How she has changed\"");
  const changeFile = await js(`(async () => {
    const orig = HTMLAnchorElement.prototype.click;
    let got = null;
    HTMLAnchorElement.prototype.click = function () { if (this.download) got = { name: this.download, href: this.href }; else orig.call(this); };
    try {
      if (document.getElementById("save-panel").hidden) document.getElementById("save").click();
      document.querySelector('#save-panel [data-save="file"]').click();
      for (let k = 0; k < 100 && !got; k++) await new Promise((r) => setTimeout(r, 100));
    } finally { HTMLAnchorElement.prototype.click = orig; }
    if (!got) return { saved: false };
    const outer = JSON.parse(await (await fetch(got.href)).text());
    const bin = Uint8Array.from(atob(outer.gzip), (c) => c.charCodeAt(0));
    const d = JSON.parse(await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream("gzip"))).text());
    const c = d.changes && d.changes["change-of-heart"];
    return { saved: true, name: got.name, version: outer.version, who: c ? c.characters.map((x) => x.character).join() : "", held: c ? c.held.length : -1 };
  })()`);
  check(changeFile.saved && changeFile.version === 2 && changeFile.who === "step-mother" && changeFile.held === 1, `its film file (${changeFile.name}, version ${changeFile.version}) carries Ani's fresh look`);

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
