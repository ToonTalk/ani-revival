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
// And the page's care for a model's slips and the reader's films: it tidies a description
// before Ani reads it (Ken's Beauty and the Beast, test/untidy/belfie.lisp, as the model's
// reply: (and ...) put around the beast's looks, the focus's relationship made one part,
// two tasks with one character left out, each said in a note; then pass 1 runs), and
// leaves Ken's CINDY and every story in test/stories and reports/llm-trials as they are;
// a stop on a message an actor didn't understand is said in plain words, with what Lisp
// said a click away; missing relationships are filled in only as in 1978; the prompt asks
// for the story's own film levels and a beaten villain's feelings; "How he looks" says why
// the tortoise moves fast, and that he is slower than the hare; the Save panel's title
// cards and subtitles (burned in below the picture, and as a .vtt file, side by side too);
// a film file's readable fields, and old film files still open; and, with no DSN, nothing
// of Sentry's is loaded and no "Send this story to Ken" is offered, while with one (here,
// pointing at this server) an uncaught error arrives with no key, story or user in it, and
// a story is sent only when the visitor confirms (skipped if Sentry's SDK can't be loaded).
// And the JSON way (app/film/json.js), the default: Ken's CINDY read into JSON and put
// back has his forms; the schema keeps to OpenAI's strict rules in both modes and the
// example keeps to it, and each provider gets its own copy; the JSON prompt has the Lisp
// prompt's guidance; and, with the model's replies stood in for, a schema the provider
// refuses is asked again without it, a problem is fixed in a JSON round, and Gemini Nano
// gets the schema as Chrome's responseConstraint.
// Usage: node tools/check-film-app.mjs [--shots <dir>]   (about twenty-five minutes)
// With --shots, the change story's fresh look and "How she has changed", the tidy note,
// a stop sentence and the Save panel are also taken at a phone's width.
//
// It serves the project on a free port itself, and drives Chrome over the DevTools
// protocol with Node's own WebSocket; Chrome's profile goes in the system's temp
// folder and is removed afterwards. CHROME=<path> picks another Chrome.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
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
// every story the tidy must leave as it is
const storiesUnder = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? storiesUnder(`${dir}/${e.name}`) : e.name.endsWith(".lisp") ? [`${dir}/${e.name}`] : []));
const WELL_FORMED = [...storiesUnder("test/stories"), ...storiesUnder("reports/llm-trials")];
// Two pages made from app/film.html: film.check.html hands some of its functions to
// window.__check, as tools/render-film-video.mjs does; film.report-check.html has a DSN
// that sends Sentry's envelopes here, where they are kept.
const envelopes = [];
const filmPage = () => readFileSync(join(process.cwd(), "app/film.html"), "utf8");
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^[/\\]+/, "");
  const at = path.replace(/\\/g, "/");
  if (path.startsWith("..")) { res.writeHead(403).end(); return; }
  if (req.method === "POST" && /^api\/1\/envelope\/?$/.test(at)) {
    let body = "";
    req.on("data", (c) => { body += c; });
    req.on("end", () => { envelopes.push(body); res.writeHead(200, { "content-type": "application/json" }).end("{}"); });
    return;
  }
  if (at === "app/film.check.html") {
    const html = filmPage(), end = html.lastIndexOf("</script>");
    res.writeHead(200, { "content-type": "text/html" }).end(html.slice(0, end) + "\nwindow.__check = { tidyStory, checkStory, whyStopped, stopBox, makeRun, using, drawVideoFrame, makeSubtitles, RUNS, DATA, storySchema, schemaFor, slotWords, lispFromJson, jsonFromLisp, cindyJson, cindyExample, sameForms, formsOf, storyPrompt, storyFromReply, printJson, lispOf };\n" + html.slice(end));
    return;
  }
  if (at === "app/film.report-check.html") {
    const html = filmPage(), mark = '/*SENTRY-DSN*/""';
    res.writeHead(html.includes(mark) ? 200 : 500, { "content-type": "text/html" }).end(html.replace(mark, () => JSON.stringify(`http://checkkey@127.0.0.1:${server.address().port}/1`)));
    return;
  }
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
  const sentryAsked = []; // requests for anything of Sentry's while the page has no DSN
  let reporting = false;
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
    if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === "Network.requestWillBeSent" && !reporting && /sentry/i.test(m.params.request.url)) sentryAsked.push(m.params.request.url);
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
  await send("Network.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  const phone = async (name, scrollTo) => {
    if (!shots) return;
    await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleep(400);
    await js(`(() => { const el = ${scrollTo}; if (el) el.scrollIntoView({ block: "start" }); })()`);
    await sleep(200);
    await shot(name);
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await sleep(200);
  };

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

  // tidying: Ken's CINDY and every well-formed story come out as they are; Ken's Beauty and
  // the Beast is tidied; a word in another kind's slot moves; a stop on a message an actor
  // didn't understand is said plainly; the subtitles are drawn below the picture
  await send("Page.navigate", { url: `${base}/app/film.check.html` });
  for (let k = 0; k < 50 && !(await js("!!window.__check").catch(() => false)); k++) await sleep(200);
  const tidy = await js(`(async () => {
    const t = window.__check;
    const changed = [];
    for (const f of ${JSON.stringify(WELL_FORMED)}) {
      const text = await (await fetch("/" + f.split("/").map(encodeURIComponent).join("/"))).text();
      const r = t.tidyStory(text);
      if (r.text !== text || r.fixes.length) changed.push(f);
    }
    const cindy = t.tidyStory(t.DATA.cindy);
    const belfie = await (await fetch("/test/untidy/belfie.lisp")).text();
    const b = t.tidyStory(belfie);
    const variant = belfie.replace("(physical beautiful)", "(physical (and beautiful kind))").replace("(personality (and stubborn good strong kind))", "(personality (and stubborn good strong))");
    const v = t.tidyStory(variant);
    const run = t.makeRun({ label: "Your version", short: "Yours", cindy: belfie });
    run.status = { error: "break BAD-MESSAGE", typed: [";warning from BEAST: (PROCESS EACH INITIAL DESCRIPTION (PHYSICAL UGLY PHYSICALLY-STRONG)) is not understood", "--- type (?) for help"] };
    const box = document.createElement("div");
    box.innerHTML = t.stopBox(run);
    const generic = t.whyStopped(run, "break BAD-MESSAGE", [";warning from BELLE: (FROBNICATE YOUR WIDGET) is not understood"]).text;
    // a picture of the video with subtitles: its strip below the picture has words in it
    const canvas = document.createElement("canvas");
    canvas.width = 551; canvas.height = 413 + 124;
    const ctx = canvas.getContext("2d");
    t.drawVideoFrame(ctx, [t.RUNS[0]], { i: 0, t: 2 }, 1, { subtitles: true, memo: Object.assign(new Map(), { both: false }) });
    const strip = ctx.getImageData(0, 413, 551, 124).data;
    let lit = 0;
    for (let k = 0; k < strip.length; k += 4) if (strip[k] > 100) lit++;
    const vtt = t.makeSubtitles([t.RUNS[0]], [0], true);
    document.getElementById("side").innerHTML = box.innerHTML;
    document.querySelector("#side details.said").open = true;
    return { changed, cindy: cindy.text === t.DATA.cindy && !cindy.fixes.length, fixes: b.fixes.map((f) => f.short), text: b.text, again: t.tidyStory(b.text).fixes.length,
      variant: v.fixes.map((f) => f.short), moved: v.text.includes("(physical beautiful)") && v.text.includes("(personality (and stubborn good strong kind))"),
      box: box.innerText, said: box.querySelector("details.said pre") ? box.querySelector("details.said pre").innerText : "", generic, lit, vtt: vtt.slice(0, 400) };
  })()`);
  check(!tidy.changed.length && tidy.cindy, `the tidy leaves Ken's CINDY and all ${WELL_FORMED.length} stories in test/stories and reports/llm-trials as they are${tidy.changed.length ? ` (changed: ${tidy.changed.join(", ")})` : ""}`);
  // (a character is called as a story read before named it, "the Beast", or else by its Lisp name)
  const named = (s) => s.replace(/\b(?:the )?beast's/gi, "beast's").replace(/\bbelle's/gi, "belle's");
  check(named(tidy.fixes.join("; ")) === "put (and ...) around beast's looks; left out (prevents beast (meets belle)) in Kept Apart; left out (aware belle (getting-it-on beast)) in Justice; made (relationship-of belle beast) one part of the focus" && /\(physical \(and ugly physically-strong\)\)/.test(tidy.text) && /\(belle \(relationship-of belle beast\)/.test(tidy.text) && !/\(meets belle\)\)/.test(tidy.text) && !/\(getting-it-on beast\)/.test(tidy.text) && tidy.again === 0,
    `Ken's Beauty and the Beast is tidied, once: ${tidy.fixes.join("; ")}`);
  check(named(tidy.variant[0] || "") === "moved “kind” from belle's looks to her character" && tidy.variant.length === 5 && tidy.moved, `a word in another kind's slot goes to its own: ${tidy.variant[0]}`);
  check(/Pass 1: Ani couldn't read beast's description: \(physical ugly physically-strong\) — two words need \(and \.\.\.\) around them\./.test(named(tidy.box)) && /^;warning from BEAST: \(PROCESS EACH INITIAL DESCRIPTION \(PHYSICAL UGLY PHYSICALLY-STRONG\)\) is not understood\nbreak BAD-MESSAGE$/.test(tidy.said), `where Ani stopped on it says why in plain words, with what Lisp said a click away: ${(tidy.box.match(/Pass 1:.*?them\./) || [tidy.box])[0]} | ${JSON.stringify(tidy.said)}`);
  check(tidy.generic === "Belle didn't understand a message Ani sent: “(frobnicate your widget)”.", `any other message not understood is said with who and which: ${tidy.generic}`);
  check(tidy.lit > 400 && /^WEBVTT\n\n1\n00:00:00\.000 --> 00:00:01\.000\nThe Introduction\n\n2\n00:00:01\.000 --> /.test(tidy.vtt) && /\nScene 1 · The Introduction · part 1 of \d+\n/.test(tidy.vtt), `a video's subtitles are drawn below the picture (${tidy.lit} lit dots) and written as WebVTT, timed after the title card`);
  await shot("1b-stop-sentence.png");
  await phone("1c-stop-sentence-phone.png", `document.querySelector("#side .stop-box")`);
  await open();
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
  // a change inside (wants ...) isn't made (REVIVE;CHANGE changes-in): the story check says
  // so plainly; then back to "A kind stepmother"
  const leftAlone = await js(`(async () => {
    const lisp = await (await fetch("/test/stories/change-of-heart.lisp")).text();
    const ta = document.getElementById("ed-lisp");
    ta.value = lisp.replace("(convey (causes prince", "(convey (wants prince");
    ta.dispatchEvent(new Event("input"));
    await new Promise((r) => setTimeout(r, 700));
    const said = document.getElementById("ed-check").innerText;
    document.getElementById("ed-reset").click();
    await new Promise((r) => setTimeout(r, 200));
    document.querySelector('[data-preset="0"]').click();
    await new Promise((r) => setTimeout(r, 200));
    return { said, again: document.getElementById("ed-check").innerText };
  })()`);
  check(/a change is made only by a task of its own, \(convey \(change \.\.\.\)\), or inside \(causes x \(change \.\.\.\)\); inside \(wants \.\.\.\) Ani leaves it alone, and no one changes\./.test(leftAlone.said) && leftAlone.again === changes, "a change inside (wants ...) is said, plainly, to be left alone");
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

  // saving a video: title cards on and subtitles off at first; with subtitles on and title
  // cards off, the .vtt file and the video of one scene of both films, side by side
  const saveOptions = await js(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const orig = HTMLAnchorElement.prototype.click;
    const got = [];
    HTMLAnchorElement.prototype.click = function () { if (this.download) got.push({ name: this.download, href: this.href }); else orig.call(this); };
    try {
      document.querySelector('#runbar [data-view="both"]').click();
      document.querySelectorAll("#scenes button")[2].click();
      if (document.getElementById("save-panel").hidden) document.getElementById("save").click();
      const panel = document.getElementById("save-panel");
      const box = (k) => panel.querySelector('[data-video="' + k + '"]');
      const defaults = { titles: box("titles").checked, subtitles: box("subtitles").checked, vtt: !!panel.querySelector('[data-save="vtt"]') };
      box("subtitles").click();
      box("titles").click();
      await wait(50);
      const note = panel.querySelector(".note").innerText;
      panel.querySelector('[data-save="vtt"]').click();
      for (let k = 0; k < 100 && got.length < 1; k++) await wait(100);
      const vtt = got[0] ? await (await fetch(got[0].href)).text() : "";
      panel.querySelector('[data-save="scene"]').click();
      for (let k = 0; k < 1200 && got.length < 2; k++) await wait(100);
      let dims = null;
      if (got[1]) {
        const b = new Uint8Array(await (await fetch(got[1].href)).arrayBuffer());
        const at = [...b.keys()].find((i) => b[i] === 0x56 && String.fromCharCode(...b.slice(i, i + 5)) === "V_VP8");
        const num = (id) => { for (let i = at; i < at + 64; i++) if (b[i] === id && b[i + 1] === 0x82) return b[i + 2] * 256 + b[i + 3]; return null; };
        dims = { width: num(0xb0), height: num(0xba), bytes: b.length };
      }
      ${shots ? "" : "box(\"subtitles\").click(); box(\"titles\").click();"}
      return { defaults, note, vtt, files: got.map((g) => g.name), dims };
    } finally { HTMLAnchorElement.prototype.click = orig; }
  })()`);
  check(saveOptions.defaults.titles && !saveOptions.defaults.subtitles && !saveOptions.defaults.vtt, "the Save panel has title cards on and subtitles off, at first");
  check(/^WEBVTT\n\n1\n00:00:00\.000 --> /.test(saveOptions.vtt) && /\n1978 · Scene 1 · The Introduction · part 1 of \d+\nThe stepmother pushes Cinderella around/.test(saveOptions.vtt) && /\nYours · Scene 1 · The Introduction · part 1 of \d+\n/.test(saveOptions.vtt) && !/\nThe Introduction\n/.test(saveOptions.vtt) && !/<b>/.test(saveOptions.vtt),
    `with subtitles on and no title cards, the .vtt file has each film's part and caption, side by side (${saveOptions.files[0]}: ${saveOptions.vtt.split("\n").slice(2, 6).join(" | ")})`);
  check(saveOptions.dims && saveOptions.dims.width === (551 * 2 + 12) * 2 && saveOptions.dims.height === (413 + 124) * 2, `and the video of a scene of both films has the subtitles' strip below the pictures (${saveOptions.files[1]}: ${saveOptions.dims ? `${saveOptions.dims.width} by ${saveOptions.dims.height}, ${Math.round(saveOptions.dims.bytes / 1024)} KB` : "none"})`);
  if (shots) {
    await js(`document.getElementById("save-panel").scrollIntoView({ block: "start" })`);
    await shot("3b-save-panel.png");
    await phone("3c-save-panel-phone.png", `document.getElementById("save-panel")`);
    await js(`(() => { const p = document.getElementById("save-panel"); p.querySelector('[data-video="subtitles"]').click(); p.querySelector('[data-video="titles"]').click(); })()`);
  }

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
    const json = side.querySelector('[data-format="json"]').getAttribute("aria-pressed") === "true";
    side.querySelector('[data-format="lisp"]').click();
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
    return { json, asked: asked && asked.model, shaped: !!(asked && asked.output_config && asked.output_config.format), prompt: asked && asked.messages[0].content.length, result, editor: document.getElementById("ed-chars").innerText, make: !document.getElementById("ed-make").disabled };
  })()`);
  check(drafted.json, "the model writes JSON by default (the JSON way), which the page puts into Ken's notation");
  check(drafted.asked === "claude-sonnet-5-5" && drafted.prompt > 5000 && !drafted.shaped, `with "Ken's Lisp" chosen, the story goes to the model with Ani's vocabulary (${drafted.prompt} characters to ${drafted.asked}), with no schema`);
  check(/4 characters/.test(drafted.result) && /nothing wrong/.test(drafted.result), "the drafted description passes Ani's checks");
  check(/Red Riding Hood/.test(drafted.editor) && drafted.make, "the editor shows the new cast, ready to make the film");

  // the JSON way (app/film/json.js): Ken's CINDY read into JSON and put back gives his
  // forms; the schema keeps to OpenAI's strict rules and the example keeps to it; each
  // provider's copy of it; the prompt in both modes; and a reply read leniently
  await send("Page.navigate", { url: `${base}/app/film.check.html` });
  for (let k = 0; k < 50 && !(await js("!!window.__check").catch(() => false)); k++) await sleep(200);
  const jsonWay = await js(`(async () => {
    const t = window.__check;
    const REVIVAL = ["mend", "know", "appear", "change"];
    const back = t.lispFromJson(t.cindyJson());
    // OpenAI's strict rules: every object closed, with every property required; no
    // $ref, allOf, not or if; under ten levels; at most 1,000 enum values
    const strict = (schema) => {
      let depth = 0, enums = 0, ok = schema.type === "object" && !schema.anyOf;
      const walk = (x, d) => {
        if (Array.isArray(x)) return x.forEach((y) => walk(y, d));
        if (!x || typeof x !== "object") return;
        if (x.$ref || x.allOf || x.not || x.if || x.oneOf) ok = false;
        if (x.type === "object" && (x.additionalProperties !== false || JSON.stringify(Object.keys(x.properties || {})) !== JSON.stringify(x.required))) ok = false;
        if (x.enum) enums += x.enum.length;
        const nd = x.type === "object" || x.type === "array" ? d + 1 : d;
        depth = Math.max(depth, nd);
        for (const [k, v] of Object.entries(x)) if (k !== "enum") walk(v, nd);
      };
      walk(schema, 0);
      return { ok: ok && depth <= 10 && enums <= 1000, depth, enums };
    };
    // a value against a schema, as the providers read one
    const valid = (v, s) => {
      if (s.anyOf) return s.anyOf.some((x) => valid(v, x));
      const types = [].concat(s.type || []);
      const typeOf = v === null ? "null" : Array.isArray(v) ? "array" : typeof v;
      if (types.length && !types.includes(typeOf)) return false;
      if (s.enum && !s.enum.includes(v)) return false;
      if (s.pattern && !new RegExp(s.pattern).test(v)) return false;
      if (typeOf === "array") return v.length >= (s.minItems || 0) && v.length <= (s.maxItems ?? Infinity) && v.every((x) => valid(x, s.items));
      if (typeOf === "object") return Object.keys(v).every((k) => s.properties[k]) && s.required.every((k) => k in v && valid(v[k], s.properties[k]));
      return true;
    };
    const s1978 = t.storySchema([]), sRevival = t.storySchema(REVIVAL);
    const kinds = (s) => JSON.stringify(s).match(/"kind":\\{"type":"string","enum":\\[[^\\]]*\\]/g).join(" ");
    const anth = JSON.stringify(t.schemaFor("anthropic", sRevival)), nano = JSON.stringify(t.schemaFor("nano", sRevival)), gemini = JSON.stringify(t.schemaFor("gemini", sRevival));
    const lisp1978 = t.storyPrompt("A story.", { extensions: [] }), json1978 = t.storyPrompt("A story.", { extensions: [], format: "json" }), jsonRevival = t.storyPrompt("A story.", { extensions: REVIVAL, format: "json" });
    const physical = sRevival.properties.characters.items.properties.physical.items.enum;
    const rrh = await (await fetch("/test/stories/red-riding-hood.lisp")).text();
    const rrhJson = t.jsonFromLisp(rrh);
    const odd = t.lispFromJson({ characters: [{ name: "Big Bad Wolf", physical: "huge" }], scenes: [{ steps: [{ kind: "chases", who: "big-bad-wolf", whom: "hunter" }] }] });
    // the safety net, where the A/B (reports/llm-trials/2026-10-13 ...) found it wanting: a
    // ")" too many in a scene's tasks comes out there, and one left in is a problem; and
    // undoing an (establish ...) is a problem, which the schema can't even say
    const cindy = t.cindyExample();
    const slip = cindy.replace("(joy (negative high))))))\\n\\t(set your mood to joyous)", "(joy (negative high)))))))\\n\\t(set your mood to joyous)");
    const mended = t.lispOf("\`\`\`lisp\\n" + slip + "\\n\`\`\`");
    const misMended = slip.replace("\\t(set your length to medium))\\n", "\\t(set your length to medium)\\n");
    const undoing = t.cindyJson();
    undoing.scenes[2].steps[0][0].undone = undoing.scenes[1].steps[2][0];
    return {
      cindy: t.sameForms(t.cindyExample(), back) && !t.tidyStory(back).fixes.length && !t.checkStory(back).problems.length,
      strict1978: strict(s1978), strictRevival: strict(sRevival),
      example: valid(t.cindyJson(), sRevival) && valid(t.cindyJson(), s1978),
      kinds1978: kinds(s1978), kindsRevival: kinds(sRevival),
      words: JSON.stringify(physical) === JSON.stringify([...t.slotWords("physical", REVIVAL), "strong"]),
      anthropic: !/"maxItems"/.test(anth) && !/"minItems":[2-9]/.test(anth) && /"pattern"/.test(anth),
      portable: !/"pattern"|null|"type":\\[/.test(nano) && nano === gemini,
      lisp1978: /Ani can't show \\(meets X Y\\) on its own/.test(lisp1978) && !/JSON/.test(lisp1978),
      json1978: /written as JSON/.test(json1978) && /Ani can't show "meets" on its own/.test(json1978) && /everyone else leaves/.test(json1978) && /for EVERY ordered pair/.test(json1978) && !/change-|causedBy/.test(json1978) && /THE EXAMPLE \\(Ken's description of Cinderella, 1978, as JSON\\):\\n\`\`\`json\\n\\{/.test(json1978),
      jsonRevival: /"kind": "change-personality"/.test(jsonRevival) && /"kind": "meets", "who": X, "whom": Y/.test(jsonRevival) && /leave the pair out/.test(jsonRevival),
      lenient: !!t.storyFromReply("Here it is:\\n\`\`\`json\\n" + JSON.stringify(rrhJson) + "\\n\`\`\`") && !!t.storyFromReply("Sure. " + JSON.stringify(rrhJson)) && !t.storyFromReply("\`\`\`lisp\\n" + rrh + "\\n\`\`\`"),
      // its forms, in CINDY's order (each relationship after its characters) and with the
      // film's length aside (Ken's, two to five minutes, in the JSON way)
      rrh: JSON.stringify(t.formsOf(rrh.replace("(minutes 1) (minutes 3)", "(minutes 2) (minutes 5)")).sort()) === JSON.stringify(t.formsOf(t.lispFromJson(rrhJson)).sort()),
      net: slip !== cindy && misMended !== slip && mended.balanced === 1 && t.sameForms(mended.text, cindy) && t.checkStory(misMended).problems.some((p) => /stands on its own/.test(p))
        && t.checkStory(t.lispFromJson(undoing)).problems.some((p) => /can undo only what someone did/.test(p)) && !valid(undoing, sRevival),
      odd: /\\(physical huge\\)/.test(odd) && /\\(convey \\(chases big-bad-wolf hunter\\)\\)/.test(odd) && t.checkStory(odd).problems.some((p) => /isn't defined|two defined characters/.test(p)),
      rrhJson: t.printJson(rrhJson),
    };
  })()`);
  check(jsonWay.cindy, "Ken's CINDY read into JSON and put back into his notation has CINDY's forms, needs no tidying and passes Ani's checks");
  check(jsonWay.strict1978.ok && jsonWay.strictRevival.ok && jsonWay.example, `the schema keeps to OpenAI's strict rules (${jsonWay.strictRevival.depth} levels, ${jsonWay.strictRevival.enums} enum values with the extensions), and the example, Ken's CINDY as JSON, keeps to it in both modes`);
  check(!/meets|change-/.test(jsonWay.kinds1978) && /"meets"/.test(jsonWay.kindsRevival) && /"change-personality"/.test(jsonWay.kindsRevival) && /"change-relationship"/.test(jsonWay.kindsRevival) && jsonWay.words, "the schema's task forms follow the mode (meets and the changes only with the extensions), and its words are the page's vocabulary, with those Ken gave in CINDY");
  check(jsonWay.anthropic && jsonWay.portable, "each provider gets the schema as it takes one: Anthropic's without maxItems, Gemini's and Gemini Nano's without patterns or null");
  check(jsonWay.lisp1978 && jsonWay.json1978 && jsonWay.jsonRevival, "the JSON prompt has the Lisp prompt's guidance, with the task forms as JSON, in 1978 mode and with the extensions");
  check(jsonWay.net, "a \")\" too many in a scene's tasks comes out where it closed the scene too soon, one left in is a problem, and so is undoing an (establish ...), which the schema can't say");
  check(jsonWay.lenient && jsonWay.rrh && jsonWay.odd, "a reply's JSON is found in a fence or after a sentence, a Lisp reply is left to be read as Lisp, Red Riding Hood goes to JSON and back, and odd JSON comes out as Lisp the checks then question");

  // the JSON way in the panel, with the model's replies stood in for: Anthropic first
  // refuses the schema (as for "Schema is too complex"), so the page asks again without
  // it; that reply names a character the story doesn't define, so the checks find a
  // problem; "Ask Claude to fix these" asks for the whole description again as JSON, with
  // the schema; and the fixed reply passes Ani's checks
  await open();
  const toldJson = await js(`(async () => {
    const good = ${JSON.stringify(jsonWay.rrhJson)};
    const bad = good.replace('"who": "wolf"', '"who": "hunter"');
    if (bad === good) return { error: "the stand-in has no task of the wolf's" };
    const real = window.fetch;
    const bodies = [];
    window.fetch = async (url, opts) => {
      if (!String(url).startsWith("https://api.anthropic.com/")) return real(url, opts);
      const body = JSON.parse(opts.body);
      bodies.push(body);
      if (bodies.length === 1) return new Response(JSON.stringify({ type: "error", error: { type: "invalid_request_error", message: "Schema is too complex for compilation." } }), { status: 400 });
      return new Response(JSON.stringify({ content: [{ type: "text", text: bodies.length === 2 ? bad : good }] }), { status: 200 });
    };
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.getElementById("open-teller").click();
    await wait(200);
    const side = document.getElementById("side");
    side.querySelector('[data-format="json"]').click();
    side.querySelector('[data-mode="revival"]').click();
    side.querySelector('[data-provider="anthropic"]').click();
    await wait(100);
    side.querySelector('[data-story="0"]').click();
    const key = side.querySelector("#tell-key");
    key.value = "test-key-not-real";
    key.dispatchEvent(new Event("input"));
    side.querySelector("#tell-go").click();
    for (let k = 0; k < 50 && !side.querySelector("#tell-edit"); k++) await wait(100);
    const first = side.querySelector("#tell-result").innerText;
    side.querySelector("#tell-fix").click();
    for (let k = 0; k < 50 && (bodies.length < 3 || !side.querySelector("#tell-edit")); k++) await wait(100);
    await wait(200);
    const fixed = side.querySelector("#tell-result").innerText;
    side.querySelector("#tell-result details").open = true;
    const wrote = side.querySelector("#tell-result details pre").innerText;
    side.querySelector("#tell-edit").click();
    await wait(300);
    const format = (b) => (b.output_config && b.output_config.format) || null;
    return {
      formats: bodies.map((b) => (format(b) ? format(b).type : "none")).join(" "),
      maxItems: bodies.some((b) => /"maxItems"/.test(JSON.stringify(format(b) || {}))),
      prompt: bodies[0].messages[0].content.slice(0, 400), again: bodies[1].messages[0].content === bodies[0].messages[0].content,
      repair: bodies[2].messages[bodies[2].messages.length - 1].content, said: bodies[2].messages[1].content === bad,
      first, fixed, wrote, lisp: document.getElementById("ed-lisp").value,
    };
  })()`);
  check(toldJson.formats === "json_schema none json_schema" && !toldJson.maxItems && /written as JSON/.test(toldJson.prompt) && toldJson.again, `the request carries the schema (Anthropic's output_config.format), and one the provider refuses is asked again without it (${toldJson.formats})`);
  check(/wrote it as JSON, which the page put into Ken's notation/.test(toldJson.first) && /hunter/.test(toldJson.first) && /isn't defined|two defined characters/.test(toldJson.first), "the draft says the model wrote JSON, and the checks find the character it didn't define");
  check(/Reply with the whole corrected film description as JSON, in the same form/.test(toldJson.repair) && /hunter/.test(toldJson.repair) && toldJson.said, "asked to fix it, the model gets its JSON back and the problems, and is asked for JSON again");
  check(/4 characters/.test(toldJson.fixed) && /nothing wrong/.test(toldJson.fixed) && /"characters": \[/.test(toldJson.wrote), "the fixed draft passes Ani's checks, with what the model wrote a click away");
  check(/^;; -\*-lisp-\*-\n;; cast: red-riding-hood = Red Riding Hood \(she\)/.test(toldJson.lisp) && /\(define red-riding-hood character/.test(toldJson.lisp) && /\(compile-actors\)\s*$/.test(toldJson.lisp), "the editor gets the description in Ken's notation, cast line and all");

  // Gemini Nano, stood in for by a LanguageModel in the page: the schema goes as Chrome's
  // responseConstraint (and needn't take up its input), with the compact prompt
  const nanoReply = JSON.stringify(JSON.parse(jsonWay.rrhJson));
  const nanoScript = await send("Page.addScriptToEvaluateOnNewDocument", { source: `window.__nanoCalls = [];
    window.LanguageModel = {
      availability: async () => "available",
      create: async (opts) => ({
        inputQuota: 1e6, inputUsage: 0, measureInputUsage: async () => 1000, destroy() {},
        promptStreaming(text, o) {
          window.__nanoCalls.push({ text, constraint: o && o.responseConstraint ? JSON.stringify(o.responseConstraint) : null, omit: !!(o && o.omitResponseConstraintInput) });
          return new ReadableStream({ start(c) { c.enqueue(${JSON.stringify(nanoReply)}); c.close(); } });
        },
      }),
    };` });
  await open();
  const toldNano = await js(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.getElementById("open-teller").click();
    await wait(300);
    const side = document.getElementById("side");
    side.querySelector('[data-format="json"]').click();
    side.querySelector('[data-provider="nano"]').click();
    await wait(100);
    side.querySelector('[data-story="0"]').click();
    side.querySelector("#tell-go").click();
    for (let k = 0; k < 50 && !side.querySelector("#tell-edit"); k++) await wait(100);
    const c = window.__nanoCalls[0] || {};
    return { calls: window.__nanoCalls.length, constraint: c.constraint || "", omit: c.omit, compact: /\`\`\`json\\n\\{"characters":\\[\\{"name":"cinderella"/.test(c.text || ""), result: side.querySelector("#tell-result").innerText };
  })()`);
  await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: nanoScript.identifier });
  check(toldNano.calls === 1 && /^\{"type":"object"/.test(toldNano.constraint) && !/"pattern"/.test(toldNano.constraint) && toldNano.omit && toldNano.compact, "Gemini Nano gets the schema as Chrome's responseConstraint, not counted in its input, with the compact prompt");
  check(/Gemini Nano wrote it as JSON/.test(toldNano.result) && /4 characters/.test(toldNano.result) && /nothing wrong/.test(toldNano.result), "and its JSON reply becomes a draft that passes Ani's checks");

  // Ken's Beauty and the Beast as the model's reply: the draft says what the page tidied,
  // and so does the editor; missing relationships are filled in only in 1978 mode; then
  // Ani as in 1978 gets through pass 1 (and the run is stopped there)
  await open();
  const beauty = await js(`(async () => {
    const lisp = await (await fetch("/test/untidy/belfie.lisp")).text();
    const real = window.fetch;
    window.fetch = async (url, opts) => {
      if (!String(url).startsWith("https://api.anthropic.com/")) return real(url, opts);
      return new Response(JSON.stringify({ content: [{ type: "text", text: "\`\`\`lisp\\n" + lisp + "\\n\`\`\`" }] }), { status: 200 });
    };
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.getElementById("open-teller").click();
    await wait(200);
    const side = document.getElementById("side");
    side.querySelector('[data-format="lisp"]').click();
    side.querySelector('[data-mode="1978"]').click();
    side.querySelector('[data-provider="anthropic"]').click();
    await wait(100);
    side.querySelector('[data-story="2"]').click();
    const key = side.querySelector("#tell-key");
    key.value = "test-key-not-real";
    key.dispatchEvent(new Event("input"));
    side.querySelector("#tell-go").click();
    for (let k = 0; k < 50 && !side.querySelector("#tell-edit"); k++) await wait(100);
    const draft = side.querySelector("#tell-result").innerText;
    side.querySelector("#tell-edit").click();
    await wait(300);
    const editor = document.getElementById("ed-check").innerText;
    const box = document.getElementById("ed-lisp").value;
    // the same story without the relationships Ken filled in himself
    const ta = document.getElementById("ed-lisp");
    const missing = box.replace(/;; how the others feel[\\s\\S]*?(?=\\(define introduction scene)/, "");
    ta.value = missing;
    ta.dispatchEvent(new Event("change"));
    await wait(100);
    const fill1978 = !!document.getElementById("ed-fill");
    side.querySelector('[data-mode="revival"]').click();
    await wait(100);
    const fillRevival = !!document.getElementById("ed-fill"), said = document.getElementById("ed-check").innerText;
    side.querySelector('[data-mode="1978"]').click();
    ta.value = box;
    ta.dispatchEvent(new Event("change"));
    await wait(100);
    return { draft, editor, said, fill1978, fillRevival, tidied: /\\(physical \\(and ugly physically-strong\\)\\)/.test(box) && !/\\(meets belle\\)\\)/.test(box), make: !document.getElementById("ed-make").disabled };
  })()`);
  const note = /The page tidied the description: put \(and \.\.\.\) around beast's looks; left out \(prevents beast \(meets belle\)\) in Kept Apart; left out \(aware belle \(getting-it-on beast\)\) in Justice; made \(relationship-of belle beast\) one part of the focus\./;
  check(note.test(beauty.draft) && /nothing wrong/.test(beauty.draft), "the model's draft of Ken's Beauty and the Beast is tidied, and says so, and then passes Ani's checks");
  check(note.test(beauty.editor) && beauty.tidied && beauty.make, "the editor has the tidied description, says what was tidied, and can make it");
  check(beauty.fill1978 && !beauty.fillRevival && /take a missing relationship as unknown, which is neutral/.test(beauty.said), "missing relationships are filled in (as “is polite to”) only as in 1978; with the extensions a missing one is neutral, and the editor says so");
  await js(`document.getElementById("ed-check").scrollIntoView({ block: "start" })`);
  await shot("3d-tidy-note.png");
  await phone("3e-tidy-note-phone.png", `document.getElementById("ed-check")`);
  await js(`document.getElementById("ed-make").click()`);
  let pass1 = "";
  for (let k = 0; k < 60; k++) {
    await sleep(1000);
    pass1 = await js(`document.getElementById("run-status").innerText`);
    if (!/Pass 1/.test(pass1)) break;
  }
  const madeNote = await js(`document.getElementById("side").innerText`);
  await js(`document.getElementById("run-stop").hidden || document.getElementById("run-stop").click()`);
  check(/Pass 2|scenes? filmed/.test(pass1) && !/stopped in pass 1/.test(pass1) && note.test(madeNote), `then Ani as in 1978 gets through pass 1 (${pass1.replace(/\s+/g, " ").slice(0, 80)}), and the film's panel says what was tidied`);

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
    side.querySelector('[data-format="lisp"]').click();
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
  check(/For characters who have little to do with each other, use is-polite-to: Ani has no neutral word/.test(asked || "") && /The film's levels in the example are Cinderella's: set each to suit your story/.test(asked || "") && /establish their feelings there, not their personality/.test(asked || ""), "the prompt says why is-polite-to, asks for the story's own film levels, and for a beaten villain's feelings, not personality");
  check(!/Send this story to Ken/.test(await js(`document.getElementById("side").innerText`)), "with no DSN, nothing offers to send a story to Ken");
  // click each character on a screen until the glass box is the one named, then run then()
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
  check(/What Lisp said/.test(told), "with what Lisp said a click away");
  await shot("4-stopped-in-1978.png");
  await phone("4b-stopped-in-1978-phone.png", `document.querySelector("#side .stop-box")`);

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
  const tortoise = await clickOn("fig-1", "The tortoise", `() => { const d = document.querySelector("#side details.looks"); if (!d) return { found: true, text: "" }; d.open = true; return { found: true, text: d.innerText }; }`);
  check(/simple because he moves fast \(Ani made him fast because he is hard working and determined and the film's energy is high\), though slower than the hare\./.test(tortoise.text || ""), `the tortoise's "How he looks" says why he moves fast, and that he is slower than the hare: ${(tortoise.text || "").split("\n").filter((l) => l.trim())[1] || ""}`);

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
    const o = JSON.parse(text);
    return { saved: true, name: got.name, version: o.version, kb: Math.round(text.length / 1024), fields: Object.keys(o).join(), about: o.about, title: o.title, lisp: (o.lisp || "").startsWith(";; -*-lisp-*-") && (o.lisp || "").includes("(define cinderella character"), story: o.story, extensions: (o.extensions || []).join(), date: o.date, readable: text.split("\\n").length > 5 };
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
  check(saved.fields === "format,version,about,title,lisp,extensions,date,gzip" && saved.about === "A film of Cinderella, made by Ani, Ken Kahn's 1978 animation program, revived; open it at https://toontalk.github.io/ani/ to watch it with all of Ani's reasons." && saved.title === "Cinderella" && saved.lisp && saved.extensions === "mend,appear,change" && /^\d{4}-\d\d-\d\dT/.test(saved.date || "") && saved.readable && saved.story === undefined,
    `its top level is readable, with the film's title, its Lisp, the extensions and the date, and an "about" that names it (${saved.fields})`);

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
    side.querySelector('[data-format="lisp"]').click();
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
  const groups = [/^Director moves her by these$/, /^Pass 2 repeats an activity as often as these say$/, /^Chosen again; Director doesn't use these, as in 1978 \(thesis pp\. 185-186\)$/].map(at);
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
    // a film file as the page wrote them before (no readable fields), as version 2 and as 1
    const old = [];
    for (const version of [2, 1]) {
      const dt = new DataTransfer();
      dt.items.add(new File([JSON.stringify({ format: outer.format, version, about: "A film made by Ani, Ken Kahn's 1978 animation program, revived. Open it in the page Ani's Cinderella to watch it with all of Ani's reasons.", gzip: outer.gzip })], "old.json", { type: "application/json" }));
      document.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
      await new Promise((r) => setTimeout(r, 1500));
      old.push(document.getElementById("run-status").innerText);
    }
    return { saved: true, name: got.name, version: outer.version, who: c ? c.characters.map((x) => x.character).join() : "", held: c ? c.held.length : -1,
      title: outer.title, story: outer.story, model: outer.model, provider: outer.provider, about: outer.about, lisp: typeof outer.lisp === "string" && outer.lisp === d.cindy, extensions: (outer.extensions || []).join(), old };
  })()`);
  check(changeFile.saved && changeFile.version === 2 && changeFile.who === "step-mother" && changeFile.held === 1, `its film file (${changeFile.name}, version ${changeFile.version}) carries Ani's fresh look`);
  check(changeFile.title === "Change of Heart" && /^Little Red Riding Hood is a good, friendly girl/.test(changeFile.story || "") && changeFile.model === "claude-sonnet-5-5" && changeFile.provider === "Claude (Anthropic)" && changeFile.lisp && changeFile.extensions === "mend,appear,change" && /^A film of Change of Heart, made by Ani/.test(changeFile.about || ""),
    `and, readable at its top, the story as told in English, the model and provider that wrote it, and its Lisp (${changeFile.model}, ${changeFile.provider})`);
  check(/^Your version, with the revival's extensions: 3 of 3 scenes filmed/.test(changeFile.old[0] || "") && /^Your version: 3 of 3 scenes filmed/.test(changeFile.old[1] || ""), `film files as the page wrote them before still open, version 2 and version 1 (${changeFile.old.map((x) => x.split(".")[0]).join("; ")})`);

  check(await film1978() === shipped, "Ken's 1978 film is as it was shipped");
  await js(`document.querySelector('#runbar [data-view="both"]').click()`);
  const quiet = await js(`({ sdk: typeof window.Sentry, script: !!document.querySelector('script[src*="sentry"]'), note: document.querySelector(".reporting").hidden, send: !!document.querySelector(".send-story") })`);
  check(!sentryAsked.length && quiet.sdk === "undefined" && !quiet.script && quiet.note && !quiet.send, `with no DSN, nothing of Sentry's is loaded or asked for, the page doesn't say errors are reported, and offers no story to send${sentryAsked.length ? ` (asked for ${sentryAsked[0]})` : ""}`);

  // with a DSN, as on the site (here it points at this server): an uncaught error arrives
  // with no key, story text or user; a story goes only when the visitor confirms
  reporting = true;
  const SECRET = "sk-check-NOT-A-REAL-KEY-0123456789", TOLD = "Once upon a check, a tortoise raced a hare across the meadow and won.";
  await js(`(() => { localStorage.setItem("ani-cinderella:keys:v1", JSON.stringify({ anthropic: ${JSON.stringify(SECRET)} })); localStorage.setItem("ani-cinderella:story:v1", ${JSON.stringify(TOLD)}); })()`);
  await send("Page.navigate", { url: `${base}/app/film.report-check.html` });
  let sdk = false;
  for (let k = 0; k < 75 && !sdk; k++) { await sleep(200); sdk = await js(`typeof window.Sentry === "object" && !!window.Sentry.getClient && !!window.Sentry.getClient()`).catch(() => false); }
  if (!sdk) console.log("skip  the reporting checks: Sentry's SDK couldn't be loaded here");
  else {
    const noted = await js(`!document.querySelector(".reporting").hidden`);
    await js(`setTimeout(() => { throw new Error("a deliberate check error, with ${SECRET} and ${TOLD}"); }, 0)`);
    for (let k = 0; k < 50 && !envelopes.length; k++) await sleep(200);
    const error = envelopes.join("\n");
    errors.splice(0, errors.length, ...errors.filter((e) => !/a deliberate check error/.test(e)));
    check(noted && /a deliberate check error, with \[removed\] and \[removed\]/.test(error) && !error.includes(SECRET) && !error.includes(TOLD) && !/"user"/.test(error) && !/ip_address/.test(error) && /"infer_ip":"never"/.test(error) && !/"breadcrumbs":\[\{/.test(error),
      `an uncaught error is reported, its key and story text removed, with no user, IP address or breadcrumbs (${envelopes.length} envelope${envelopes.length === 1 ? "" : "s"}, ${error.length} bytes)`);
    const before = envelopes.length;
    const offer = await js(`(async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const dt = new DataTransfer();
      dt.items.add(new File([sessionStorage.getItem("ani-check-film")], "film.json", { type: "application/json" }));
      document.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
      // (the film opens a moment later, and showing it draws the Save panel again)
      await wait(1500);
      if (document.getElementById("save-panel").hidden) document.getElementById("save").click();
      const panel = document.getElementById("save-panel");
      panel.querySelector("[data-send-story]").click();
      await wait(100);
      const shown = panel.querySelector(".send-box").innerText;
      panel.querySelector("[data-send-no]").click();
      await wait(1500);
      return { shown };
    })()`);
    const declined = envelopes.length === before;
    await js(`(() => { const panel = document.getElementById("save-panel"); panel.querySelector("[data-send-story]").click(); })()`);
    await sleep(100);
    await js(`document.getElementById("save-panel").scrollIntoView({ block: "start" })`);
    await shot("14-send-this-story.png");
    await phone("14b-send-this-story-phone.png", `document.querySelector("#save-panel .send-box")`);
    await js(`document.querySelector("#save-panel [data-send-yes]").click()`);
    for (let k = 0; k < 50 && envelopes.length === before; k++) await sleep(200);
    const story = envelopes.slice(before).join("\n");
    let thanked = "";
    for (let k = 0; k < 50 && !/^Sent\./.test(thanked); k++) { await sleep(200); thanked = await js(`document.querySelector("#save-panel .send-box").innerText`); }
    check(/This is everything that will be sent to Ken/.test(offer.shown) && /"title": "Cinderella"/.test(offer.shown) && /"lisp": ";; -\*-lisp-\*-/.test(offer.shown) && /"extensions": \[/.test(offer.shown) && /"stopped": \[\]/.test(offer.shown) && /"provider": "\(none\)"/.test(offer.shown), "\"Send this story to Ken\" shows exactly what will be sent: the story, the Lisp, the model and provider, the extensions and where Ani stopped");
    check(declined && /A story sent to Ken: Cinderella/.test(story) && /\(define cinderella character/.test(story) && /story\.json/.test(story) && !story.includes(SECRET) && /^Sent\./.test(thanked), `nothing is sent until the visitor confirms; then the story arrives, with its Lisp, and no key (${story.length} bytes)`);
  }
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
