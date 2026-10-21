// ---------------------------------------------------------------- saving films

// A film can be saved as a video (WebM at the film's own rate, a title card before each
// scene unless turned off, and, if asked for, subtitles from the story and Ani's thinking
// below the picture, also as a .vtt file), or as a film file (.json) that this page opens
// again with all of Ani's reasons. Inside claude.ai a save goes through the page's downloads capability,
// which asks the viewer first; elsewhere it is an ordinary download.

// The smallest WebM that browsers and players accept: an EBML header, one segment with
// its info and one VP8 track, and a cluster of frames from each key frame on.
const EBML = {
  header: [0x1a, 0x45, 0xdf, 0xa3], segment: [0x18, 0x53, 0x80, 0x67], info: [0x15, 0x49, 0xa9, 0x66],
  tracks: [0x16, 0x54, 0xae, 0x6b], cluster: [0x1f, 0x43, 0xb6, 0x75],
};
function ebmlSize(n) {
  for (let len = 1; len <= 8; len++) {
    if (n < 2 ** (7 * len) - 1) {
      const out = new Uint8Array(len);
      let v = n;
      for (let k = len - 1; k >= 0; k--) { out[k] = v & 0xff; v = Math.floor(v / 256); }
      out[0] |= 0x80 >> (len - 1);
      return out;
    }
  }
  throw new Error("element too large");
}
const concatBytes = (parts) => {
  const total = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
};
function ebmlElement(id, ...children) {
  const body = concatBytes(children.map((c) => (c instanceof Uint8Array ? c : ebmlUint(c))));
  return concatBytes([Uint8Array.from(id), ebmlSize(body.length), body]);
}
function ebmlUint(n) {
  const bytes = [];
  do { bytes.unshift(n & 0xff); n = Math.floor(n / 256); } while (n > 0);
  return Uint8Array.from(bytes);
}
const ebmlText = (s) => new TextEncoder().encode(s);
function ebmlFloat(x) { const b = new Uint8Array(8); new DataView(b.buffer).setFloat64(0, x); return b; }
function webm(frames, width, height, durationMs) {
  const head = ebmlElement(EBML.header,
    ebmlElement([0x42, 0x86], 1), ebmlElement([0x42, 0xf7], 1), ebmlElement([0x42, 0xf2], 4), ebmlElement([0x42, 0xf3], 8),
    ebmlElement([0x42, 0x82], ebmlText("webm")), ebmlElement([0x42, 0x87], 2), ebmlElement([0x42, 0x85], 2));
  const info = ebmlElement(EBML.info, ebmlElement([0x2a, 0xd7, 0xb1], 1000000), ebmlElement([0x4d, 0x80], ebmlText("Ani's Cinderella")),
    ebmlElement([0x57, 0x41], ebmlText("Ani's Cinderella")), ebmlElement([0x44, 0x89], ebmlFloat(durationMs)));
  const tracks = ebmlElement(EBML.tracks, ebmlElement([0xae],
    ebmlElement([0xd7], 1), ebmlElement([0x73, 0xc5], 1), ebmlElement([0x83], 1), ebmlElement([0x86], ebmlText("V_VP8")), ebmlElement([0x9c], 0),
    ebmlElement([0xe0], ebmlElement([0xb0], width), ebmlElement([0xba], height))));
  const clusters = [];
  let current = null;
  for (const f of frames) {
    if (!current || f.key || f.ms - current.start > 30000) { current = { start: f.ms, blocks: [] }; clusters.push(current); }
    const rel = f.ms - current.start;
    const block = concatBytes([Uint8Array.from([0x81, (rel >> 8) & 0xff, rel & 0xff, f.key ? 0x80 : 0x00]), f.data]);
    current.blocks.push(ebmlElement([0xa3], block));
  }
  const body = concatBytes([info, tracks, ...clusters.map((c) => ebmlElement(EBML.cluster, ebmlElement([0xe7], c.start), ...c.blocks))]);
  return new Blob([head, concatBytes([Uint8Array.from(EBML.segment), ebmlSize(body.length)]), body], { type: "video/webm" });
}

// The video's options, kept in this browser: a title card before each scene (on unless
// turned off), and subtitles (off unless turned on).
const VIDEO_KEY = "ani-cinderella:video:v1";
const videoOptions = { titles: true, subtitles: false };
try { Object.assign(videoOptions, JSON.parse(store.get(VIDEO_KEY) || "{}")); } catch { /* as they are */ }

// The pictures of a video: for each scene shown, a one-second title card (unless turned
// off), then each frame, drawn as the screen draws it (two films side by side when both
// are shown).
function videoRate(runs, sceneIndexes) {
  return Math.max(4, ...sceneIndexes.flatMap((i) => runs.map((r) => r.scenes[i]).filter(ready).map(fpsOf)));
}
function videoPlan(runs, sceneIndexes, rate, titles = true) {
  const plan = [];
  for (const i of sceneIndexes) {
    const scenes = runs.map((r) => r.scenes[i]);
    const longest = Math.max(0, ...scenes.map((sc) => (ready(sc) ? sc.last / fpsOf(sc) : 0)));
    if (titles) for (let k = 0; k < rate; k++) plan.push({ i, title: true });
    for (let n = 0; n <= Math.round(longest * rate); n++) plan.push({ i, t: n / rate });
  }
  return plan;
}
// The subtitles at one of a video's pictures, for one film: the scene and part, and what
// the page's caption says there (what is shown, to show what), as plain text. The same
// subscenes, changes of shape or size, steps of a change of who someone is (the cause's
// walk, the bridges, her wander, REVIVE;CHSHOW) and ending give the same words (a color's
// steps are said by the part's look changes), so they are worked out once (memo).
function subtitleAt(run, k, item, memo) {
  const sc = run.scenes[item.i];
  const tag = memo.both ? `${memo.runs ? pairShort(memo.runs, k) : run.short} · ` : "";
  if (item.title) return { part: `${tag}${sc ? sc.title : `Scene ${item.i + 1}`}`, text: "" };
  if (!ready(sc)) return { part: `${tag}${sc ? sc.title : `Scene ${item.i + 1}`}`, text: sc ? "Ani stopped while making this scene." : "No such scene in this version." };
  const f = Math.min(sc.last, Math.floor(item.t * fpsOf(sc) + 1e-6));
  const looks = shapeChanges(sc, f).map((x) => x[0]).join();
  const showing = (sc.glass.changesShown || []).map((x) => changePhase(sc, x, f)).join();
  const key = `${k} ${item.i} ${atScene(item.i, () => using(run, () => subsceneAt(f).map((x) => x.n).join()))} ${looks} ${showing} ${f === sc.last}`;
  if (!memo.has(key)) {
    const c = captionAt(run, item.i, f);
    memo.set(key, { part: `${tag}${unmark(c.part)}`, text: unmark([c.text, ...c.more].filter(Boolean).join(" ")) });
  }
  return memo.get(key);
}
// Below each picture, a strip with its subtitles: the part in grey, then what the caption
// says, wrapped, in at most five lines.
const SUB_BAND = 124;
function drawSubtitle(ctx, sub) {
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 13px "Public Sans", system-ui, sans-serif`;
  ctx.fillStyle = "#a9b5af";
  ctx.fillText(sub.part, 12, 20, 527);
  ctx.font = `400 15px "Public Sans", system-ui, sans-serif`;
  ctx.fillStyle = "#e5ece8";
  const lines = [];
  let cur = "";
  for (const w of sub.text.split(/\s+/).filter(Boolean)) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width > 527 && cur) { lines.push(cur); cur = w; } else cur = next;
  }
  if (cur) lines.push(cur);
  if (lines.length > 5) { lines.length = 5; lines[4] = lines[4].replace(/\s*\S*$/, " …"); }
  lines.forEach((l, n) => ctx.fillText(l, 12, 42 + n * 19, 527));
}
function drawVideoFrame(ctx, runs, item, scale, { subtitles = false, memo = null } = {}) {
  const w = 551 * scale, h = 413 * scale, gap = runs.length > 1 ? 12 * scale : 0;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  runs.forEach((run, k) => {
    ctx.setTransform(scale, 0, 0, scale, k * (w + gap), 0);
    const sc = run.scenes[item.i];
    if (item.title) {
      const lines = [sc ? sc.title : `Scene ${item.i + 1}`];
      if (runs.length > 1) lines.push(run.label);
      screenMessage(ctx, lines);
    } else if (!ready(sc)) screenMessage(ctx, [sc ? "Ani stopped while making this scene." : "No such scene in this version."]);
    else drawFrame(ctx, run, sc, Math.min(sc.last, Math.floor(item.t * fpsOf(sc) + 1e-6)), { color: state.color });
    if (subtitles && !item.title) {
      ctx.setTransform(scale, 0, 0, scale, k * (w + gap), h);
      drawSubtitle(ctx, subtitleAt(run, k, item, memo));
    }
  });
}
// The same subtitles as a WebVTT file, timed to the video with these options: a cue for
// each title card and each stretch of the same words.
const vttTime = (sec) => { const ms = Math.round(sec * 1000); const p = (n, d = 2) => String(n).padStart(d, "0"); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)}.${p(ms % 1000, 3)}`; };
function makeSubtitles(runs, sceneIndexes, titles) {
  const rate = videoRate(runs, sceneIndexes);
  const memo = Object.assign(new Map(), { both: runs.length > 1, runs });
  const cues = [];
  videoPlan(runs, sceneIndexes, rate, titles).forEach((item, n) => {
    const text = runs.map((run, k) => { const s = subtitleAt(run, k, item, memo); return s.text ? `${s.part}\n${s.text}` : s.part; }).join("\n");
    const last = cues[cues.length - 1];
    if (last && last.text === text) last.end = (n + 1) / rate;
    else cues.push({ start: n / rate, end: (n + 1) / rate, text });
  });
  const clean = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `WEBVTT\n\n${cues.map((c, k) => `${k + 1}\n${vttTime(c.start)} --> ${vttTime(c.end)}\n${clean(c.text)}\n`).join("\n")}`;
}
async function makeVideo(runs, sceneIndexes, onProgress, signal, { titles = true, subtitles = false } = {}) {
  const scale = 2;
  const width = (551 * runs.length + (runs.length - 1) * 12) * scale, height = (413 + (subtitles ? SUB_BAND : 0)) * scale;
  const even = (n) => n + (n % 2);
  const canvas = document.createElement("canvas");
  canvas.width = even(width);
  canvas.height = even(height);
  const ctx = canvas.getContext("2d");
  const rate = videoRate(runs, sceneIndexes);
  const plan = videoPlan(runs, sceneIndexes, rate, titles);
  const draw = { subtitles, memo: Object.assign(new Map(), { both: runs.length > 1, runs }) };
  const frameUs = Math.round(1e6 / rate);
  const config = { codec: "vp8", width: canvas.width, height: canvas.height, bitrate: rate > 4 ? 4000000 : 2500000, framerate: rate };
  const webCodecs = typeof VideoEncoder !== "undefined" && typeof VideoFrame !== "undefined" && (await VideoEncoder.isConfigSupported(config).catch(() => ({}))).supported;
  if (webCodecs) {
    const frames = [];
    let failure = null;
    const encoder = new VideoEncoder({
      output: (chunk) => { const data = new Uint8Array(chunk.byteLength); chunk.copyTo(data); frames.push({ data, ms: Math.round(chunk.timestamp / 1000), key: chunk.type === "key" }); },
      error: (e) => { failure = e; },
    });
    encoder.configure(config);
    for (let n = 0; n < plan.length; n++) {
      if (signal && signal.aborted) { encoder.close(); throw Object.assign(new Error("Stopped."), { kind: "stopped" }); }
      if (failure) throw failure;
      drawVideoFrame(ctx, runs, plan[n], scale, draw);
      const frame = new VideoFrame(canvas, { timestamp: n * frameUs, duration: frameUs });
      encoder.encode(frame, { keyFrame: n % (rate * 4) === 0 });
      frame.close();
      if (encoder.encodeQueueSize > 8) await new Promise((r) => setTimeout(r, 0));
      if (n % 20 === 0) { onProgress(n / plan.length); await new Promise((r) => setTimeout(r, 0)); }
    }
    await encoder.flush();
    encoder.close();
    if (failure) throw failure;
    return { blob: webm(frames, canvas.width, canvas.height, plan.length * 1000 / rate), ext: "webm" };
  }
  // without WebCodecs: record the canvas as it is drawn, in real time
  if (typeof MediaRecorder === "undefined" || !canvas.captureStream) throw new Error("This browser can't make videos.");
  const stream = canvas.captureStream(0);
  const track = stream.getVideoTracks()[0];
  const type = ["video/webm;codecs=vp8", "video/webm", "video/mp4"].find((t) => MediaRecorder.isTypeSupported(t)) || "";
  const recorder = new MediaRecorder(stream, type ? { mimeType: type, videoBitsPerSecond: 2500000 } : {});
  const chunks = [];
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  const stopped = new Promise((r) => { recorder.onstop = r; });
  recorder.start();
  for (let n = 0; n < plan.length; n++) {
    if (signal && signal.aborted) { recorder.stop(); throw Object.assign(new Error("Stopped."), { kind: "stopped" }); }
    drawVideoFrame(ctx, runs, plan[n], scale, draw);
    if (track.requestFrame) track.requestFrame();
    onProgress(n / plan.length);
    await new Promise((r) => setTimeout(r, 1000 / rate));
  }
  recorder.stop();
  await stopped;
  const mime = recorder.mimeType || type || "video/webm";
  return { blob: new Blob(chunks, { type: mime }), ext: /mp4/.test(mime) ? "mp4" : "webm" };
}

// A film file: the description Ani was told, pass 1's choice points and each scene's
// plan and film, gzipped inside a small JSON wrapper. A film made by Ani as in 1978 is
// version 1, as every film file was before the revival's extensions; one made with them,
// or with Ani's looks, is version 2, which records which extensions, the notes their
// repairs left in pass 1 (repairs; each scene's are in its glass box) and how Ani chose
// each character's look (appearances; each scene's film and glass box have its looks,
// so the film is drawn with them when it is opened again), and, with CHANGE, Ani's fresh
// look after each scene that changes someone (changes; each later scene's glass box has
// what it made so), so the film opens again with "How she has changed". Both are read;
// version 1 means Ani as in 1978. A film remade with the reader's criticism is version 3
// (REVIVE;CRITIC: app/film/criticism.js), which keeps the record of criticism it was made
// with, inside and, for a reader, outside; a page before it refuses one ("made by a newer
// page") rather than drop the criticism. So is a film made with the reader's knowledge
// (Teach Ani, app/film/teach.js), which keeps the notebooks it was made with, as they were
// (knowledge, inside; their titles outside), and the film it was made beside (teachFrom). Any film may keep its working files, which a remake
// with criticism is made from, and a remade one the film it was remade from and how each
// scene was made again. Either may also keep what the page tidied in the
// description first, and the story as told (madeFrom).
// Outside the gzip, for a person or a program reading the file: what film it is, the story
// as told in English and the model that put it into Ken's notation (when it came from
// "Tell Ani a new story"), the description Ani read, the extensions and the date; the page
// reads only the gzip.
const FILM_FORMAT = "ani-film";
const FILM_HOME = "https://toontalk.github.io/ani/";
async function filmFile(run) {
  const made = (run.status && run.status.made) || new Date().toISOString();
  const inner = JSON.stringify({ cindy: run.cindy, choicePoints: run.raw.choicePoints, scenes: run.raw.scenes.filter(Boolean), made, seconds: run.status && run.status.seconds, ...version2(run), ...version3(run), ...madeFrom(run) });
  const title = storyTitle(run), told = run.told || {};
  const outer = {
    format: FILM_FORMAT, version: runVersion(run),
    about: `A film of ${title}, made by Ani, Ken Kahn's 1978 animation program, revived; open it at ${FILM_HOME} to watch it with all of Ani's reasons.`,
    title,
    ...(told.story ? { story: told.story } : {}),
    lisp: run.cindy,
    ...(told.provider ? { model: told.model, provider: told.provider } : {}),
    extensions: runExtensions(run),
    ...(runVersion(run) === 3 && run.criticism && run.criticism.length ? { criticism: run.criticism.map((c) => ({ ...c })) } : {}),
    // the notebooks of knowledge it was made with (Teach Ani), their titles and pieces
    ...(run.knowledge && run.knowledge.length ? { knowledge: run.knowledge.map((n) => ({ title: n.title, pieces: n.pieces.length })) } : {}),
    date: made,
    gzip: await deflate(inner),
  };
  return new Blob([JSON.stringify(outer, null, 2)], { type: "application/json" });
}
async function readFilmFile(text) {
  let outer;
  try { outer = JSON.parse(text); } catch { throw new Error("That isn't a film file (it isn't JSON)."); }
  if (!outer || outer.format !== FILM_FORMAT || typeof outer.gzip !== "string") throw new Error("That isn't one of Ani's film files.");
  if (![1, 2, 3].includes(outer.version)) throw new Error("That film file was made by a newer page than this one.");
  const d = JSON.parse(await inflate(outer.gzip));
  if (typeof d.cindy !== "string" || !Array.isArray(d.scenes)) throw new Error("That film file is damaged.");
  d.v = outer.version;
  d.extensions = outer.version >= 2 && Array.isArray(d.extensions) ? d.extensions : [];
  if (outer.version === 1) { delete d.appearances; delete d.changes; }
  if (outer.version !== 3) { delete d.criticism; delete d.knowledge; }
  return d;
}
// A film file opened becomes the reader's version, and goes into "Your films" too (once:
// opened again, it is the film kept already).
async function openFilm(d, name) {
  stopRun({ quiet: true });
  const run = runFromData(d);
  run.status.file = name;
  showAsCurrent(run);
  await library.ready;
  saveRun(run, { file: name });
}
function chooseFilmFile() {
  // made afresh and never put in the page: the only file picker that opens everywhere
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.onchange = async () => {
    const file = input.files && input.files[0];
    if (!file) return;
    try { await openFilm(await readFilmFile(await file.text()), file.name); setSaveStatus(`Opened ${file.name}.`); }
    catch (e) { setSaveStatus(e.message); }
  };
  input.click();
}

async function saveFile(blob, filename) {
  if (window.claude && typeof window.claude.use === "function") {
    const downloads = await window.claude.use("downloads").catch(() => null);
    if (downloads) {
      try { await downloads.save({ filename, data: blob }); return `Saved ${filename}.`; }
      catch (e) { return e && e.code === "declined" ? "Not saved." : `Couldn't save it here (${(e && e.code) || e}).`; }
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return `Saved ${filename}.`;
}
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "film";

// ---- the Save button

let saving = null;
function setSaveStatus(text) { const el = document.getElementById("save-status"); if (el) el.textContent = text; }
function toggleSavePanel(force) {
  const panel = document.getElementById("save-panel");
  panel.hidden = force === undefined ? !panel.hidden : !force;
  document.getElementById("save").setAttribute("aria-expanded", String(!panel.hidden));
  if (!panel.hidden) renderSavePanel();
}
function renderSavePanel() {
  const panel = document.getElementById("save-panel");
  const runs = shown().map(screenRun).filter(Boolean);
  const both = runs.length > 1;
  const mine = RUNS[1];
  // the reader's films on the screens, each as a film file (with Ken's alone, their version)
  const files = state.view === 0 ? (mine ? [mine] : []) : [...new Set(runs.filter((r) => r !== RUNS[0]))];
  const fileLabel = (run, k) => (run === mine ? "The new version" : files.length > 1 ? `The film on the ${runs.indexOf(run) ? "right" : "left"}` : `“${run.label.length > 40 ? run.label.slice(0, 38) + "…" : run.label}”`);
  const sc = runs[0].scenes[state.scene];
  const { titles, subtitles } = videoOptions;
  panel.innerHTML = `
    <p class="label">Save</p>
    <div class="save-options">
      <button type="button" class="btn" data-save="scene">${both ? "This scene of both films" : "This scene"}, as a video</button>
      <button type="button" class="btn" data-save="film">${both ? "Both whole films, side by side" : "The whole film"}, as a video</button>
      ${files.map((run, k) => `<button type="button" class="btn" data-save="file" data-file="${k}">${esc(fileLabel(run, k))}, as a film file</button>`).join("")}
      <button type="button" class="btn" data-save="open">Open a saved film…</button>
    </div>
    <div class="save-settings">
      <label class="check"><input type="checkbox" data-video="titles"${titles ? " checked" : ""}> A title card before each scene</label>
      <label class="check"><input type="checkbox" data-video="subtitles"${subtitles ? " checked" : ""}> Subtitles: what each part shows, and why</label>
      ${subtitles ? `<button type="button" class="linkish" data-save="vtt">The subtitles alone, as a .vtt file</button>` : ""}
    </div>
    <p class="note">Videos are WebM, at ${videoRate(runs, [state.scene])} frames a second, ${state.color ? "in color" : "in black and white"} as the screen shows it now, ${titles ? "with a title before each scene" : "with no titles"}${subtitles ? `, and with subtitles under ${both ? "each film" : "the picture"}: the scene, the part, and what Ani shows and why, as the caption says it. The .vtt file has them timed to the whole ${both ? "films" : "film"}, for a video player` : ""}. A film file keeps everything: open it here later to watch it with all of Ani's reasons.</p>
    <p class="note" id="save-status" aria-live="polite"></p>
    ${mine ? sendStoryButton(mine) : ""}`;
  panel.querySelectorAll("[data-save]").forEach((b) => b.addEventListener("click", () => saveAction(b.dataset.save, runs, sc, files[Number(b.dataset.file)] || mine)));
  panel.querySelectorAll("[data-video]").forEach((b) => b.addEventListener("change", () => {
    videoOptions[b.dataset.video] = b.checked;
    store.set(VIDEO_KEY, JSON.stringify(videoOptions));
    renderSavePanel();
  }));
}
async function saveAction(what, runs, sc, film = RUNS[1]) {
  if (what === "open") return chooseFilmFile();
  if (saving) { saving.abort(); return; }
  if (what === "file") {
    const run = film;
    setSaveStatus("Packing the film…");
    setSaveStatus(await saveFile(await filmFile(run), `ani-${slug(storyTitle(run))}.json`));
    return;
  }
  const indexes = what === "scene" ? [state.scene] : [...Array(Math.max(...runs.map((r) => r.sceneIds.length))).keys()];
  const base = `ani-${slug(runs.map(storyTitle).join("-and-"))}`;
  if (what === "vtt") {
    setSaveStatus(await saveFile(new Blob([makeSubtitles(runs, indexes, videoOptions.titles)], { type: "text/vtt" }), `${base}.vtt`));
    return;
  }
  saving = new AbortController();
  const button = document.querySelector(`#save-panel [data-save="${what}"]`);
  const label = button.textContent;
  button.textContent = "Stop";
  try {
    const { blob, ext } = await makeVideo(runs, indexes, (p) => setSaveStatus(`Making the video: ${Math.round(p * 100)}%`), saving.signal, videoOptions);
    const name = `${base}${what === "scene" ? "-" + slug(sc ? sc.title : "scene") : ""}${state.color ? "-color" : ""}.${ext}`;
    setSaveStatus(await saveFile(blob, name));
  } catch (e) {
    setSaveStatus(e.kind === "stopped" ? "Stopped." : `It didn't work: ${e.message || e}`);
  } finally {
    saving = null;
    button.textContent = label;
  }
}
