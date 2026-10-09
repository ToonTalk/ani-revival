// ---------------------------------------------------------------- saving films

// A film can be saved as a video (WebM at the film's own rate, a title card before each
// scene), or as a film file (.json) that this page opens again with all of
// Ani's reasons. Inside claude.ai a save goes through the page's downloads capability,
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

// The pictures of a video: for each scene shown, a one-second title card, then each frame,
// drawn as the screen draws it (two films side by side when both are shown).
function videoRate(runs, sceneIndexes) {
  return Math.max(4, ...sceneIndexes.flatMap((i) => runs.map((r) => r.scenes[i]).filter(ready).map(fpsOf)));
}
function videoPlan(runs, sceneIndexes, rate) {
  const plan = [];
  for (const i of sceneIndexes) {
    const scenes = runs.map((r) => r.scenes[i]);
    const longest = Math.max(0, ...scenes.map((sc) => (ready(sc) ? sc.last / fpsOf(sc) : 0)));
    for (let k = 0; k < rate; k++) plan.push({ i, title: true });
    for (let n = 0; n <= Math.round(longest * rate); n++) plan.push({ i, t: n / rate });
  }
  return plan;
}
function drawVideoFrame(ctx, runs, item, scale) {
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
  });
}
async function makeVideo(runs, sceneIndexes, onProgress, signal) {
  const scale = 2;
  const width = (551 * runs.length + (runs.length - 1) * 12) * scale, height = 413 * scale;
  const even = (n) => n + (n % 2);
  const canvas = document.createElement("canvas");
  canvas.width = even(width);
  canvas.height = even(height);
  const ctx = canvas.getContext("2d");
  const rate = videoRate(runs, sceneIndexes);
  const plan = videoPlan(runs, sceneIndexes, rate);
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
      drawVideoFrame(ctx, runs, plan[n], scale);
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
    drawVideoFrame(ctx, runs, plan[n], scale);
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
// plan and film, gzipped inside a small JSON wrapper.
const FILM_FORMAT = "ani-film";
async function filmFile(run) {
  const inner = JSON.stringify({ cindy: run.cindy, choicePoints: run.raw.choicePoints, scenes: run.raw.scenes.filter(Boolean), made: (run.status && run.status.made) || new Date().toISOString(), seconds: run.status && run.status.seconds });
  return new Blob([JSON.stringify({ format: FILM_FORMAT, version: 1, about: "A film made by Ani, Ken Kahn's 1978 animation program, revived. Open it in the page Ani's Cinderella to watch it with all of Ani's reasons.", gzip: await deflate(inner) })], { type: "application/json" });
}
async function readFilmFile(text) {
  let outer;
  try { outer = JSON.parse(text); } catch { throw new Error("That isn't a film file (it isn't JSON)."); }
  if (!outer || outer.format !== FILM_FORMAT || outer.version !== 1 || typeof outer.gzip !== "string") throw new Error("That isn't one of Ani's film files.");
  const d = JSON.parse(await inflate(outer.gzip));
  if (typeof d.cindy !== "string" || !Array.isArray(d.scenes)) throw new Error("That film file is damaged.");
  return d;
}
async function openFilm(d, name) {
  stopRun({ quiet: true });
  const run = makeRun({ label: "Your version", short: "Yours", cindy: d.cindy, choicePoints: d.choicePoints || [], scenes: d.scenes });
  run.status = { running: false, made: d.made, seconds: d.seconds, restored: true, file: name };
  RUNS[1] = run;
  saveRun(run);
  state.selected = null;
  state.scene = 0;
  state.time = 0;
  setView(sameStory(RUNS[0], run) ? "both" : 1);
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
  const runs = shown().map((r) => RUNS[r]).filter(Boolean);
  const both = runs.length > 1;
  const mine = RUNS[1];
  const sc = runs[0].scenes[state.scene];
  panel.innerHTML = `
    <p class="label">Save</p>
    <div class="save-options">
      <button type="button" class="btn" data-save="scene">${both ? "This scene of both films" : "This scene"}, as a video</button>
      <button type="button" class="btn" data-save="film">${both ? "Both whole films, side by side" : "The whole film"}, as a video</button>
      ${mine ? `<button type="button" class="btn" data-save="file">Your version, as a film file</button>` : ""}
      <button type="button" class="btn" data-save="open">Open a saved film…</button>
    </div>
    <p class="note">Videos are WebM, at ${videoRate(runs, [state.scene])} frames a second, ${state.color ? "in color" : "in black and white"} as the screen shows it now, with a title before each scene. A film file keeps everything: open it here later to watch it with all of Ani's reasons.</p>
    <p class="note" id="save-status" aria-live="polite"></p>`;
  panel.querySelectorAll("[data-save]").forEach((b) => b.addEventListener("click", () => saveAction(b.dataset.save, runs, sc)));
}
async function saveAction(what, runs, sc) {
  if (what === "open") return chooseFilmFile();
  if (saving) { saving.abort(); return; }
  if (what === "file") {
    const run = RUNS[1];
    setSaveStatus("Packing the film…");
    setSaveStatus(await saveFile(await filmFile(run), `ani-${slug(storyTitle(run))}.json`));
    return;
  }
  const indexes = what === "scene" ? [state.scene] : [...Array(Math.max(...runs.map((r) => r.sceneIds.length))).keys()];
  saving = new AbortController();
  const button = document.querySelector(`#save-panel [data-save="${what}"]`);
  const label = button.textContent;
  button.textContent = "Stop";
  try {
    const { blob, ext } = await makeVideo(runs, indexes, (p) => setSaveStatus(`Making the video: ${Math.round(p * 100)}%`), saving.signal);
    const name = `ani-${slug(runs.map(storyTitle).join("-and-"))}${what === "scene" ? "-" + slug(sc ? sc.title : "scene") : ""}${state.color ? "-color" : ""}.${ext}`;
    setSaveStatus(await saveFile(blob, name));
  } catch (e) {
    setSaveStatus(e.kind === "stopped" ? "Stopped." : `It didn't work: ${e.message || e}`);
  } finally {
    saving = null;
    button.textContent = label;
  }
}
