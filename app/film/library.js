// ---------------------------------------------------------------- your films

// Every film made here, or opened from a film file, is kept in this browser, in "Your
// films" (Ken, 16 October: "Is there a way to access previously made films without saving
// them?"): in IndexedDB, the database LIBRARY_DB, each film's record in "films" (its title,
// what Ani was told, the extensions, its frames a second, the model and provider that put a
// story told in English into Ken's notation, when it was made and its size) and the film
// itself in "data", gzipped as a film file has it inside (filmData). A film already kept
// (the same description, made at the same moment, with the same extensions and frames)
// isn't kept twice. At most LIBRARY_CAP are kept; past that, or where the browser has no
// room, the oldest is let go (the oldest not renamed first, and never one on a screen), and
// the page says which. Where this browser won't open IndexedDB, the last film made is kept
// as before, in localStorage (RUN_KEY); the library takes in such a film once it can.
// The reader's notebooks of knowledge (Teach Ani, app/film/teach.js) are kept beside the
// films, in the store "knowledge" (the database's version 2; films kept at version 1 stay as
// they are): each notebook's id, title, pieces, whether it is used, and when it was made and
// changed; where IndexedDB is refused, in localStorage (KNOWLEDGE_KEY) instead.
const LIBRARY_DB = "ani-cinderella";
const LIBRARY_VERSION = 2;
const KNOWLEDGE_KEY = "ani-cinderella:knowledge:v1";
const LIBRARY_CAP = 40;
// state: "opening", "ready", "unavailable" (no IndexedDB here) or "forgotten"; films: the
// records, the newest first; dropped: the films let go for room on this visit
const library = { db: null, ready: null, state: "opening", films: [], dropped: [] };
const libraryFilms = () => library.films;
const libraryTitle = (id) => { const f = library.films.find((x) => x.id === id); return f ? f.title : ""; };

const idbAsk = (req) => new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
const idbDone = (tx) => new Promise((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error || new Error("The browser stopped keeping it.")); });
const gzipBytes = async (text) => new Uint8Array(await new Response(new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer());
// a short fingerprint of a text (FNV-1a), for telling films apart
function hashText(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(36);
}

// The database, opened (and made, the first time); null where this browser refuses it, or
// doesn't answer within five seconds (a sandbox may do either).
function openLibrary() {
  return new Promise((resolve) => {
    let settled = false;
    const done = (db) => { if (settled) { if (db) db.close(); return; } settled = true; resolve(db); };
    setTimeout(() => done(null), 5000);
    let req;
    try { req = indexedDB.open(LIBRARY_DB, LIBRARY_VERSION); } catch { done(null); return; }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("films")) db.createObjectStore("films", { keyPath: "id" });
      if (!db.objectStoreNames.contains("data")) db.createObjectStore("data");
      if (!db.objectStoreNames.contains("knowledge")) db.createObjectStore("knowledge", { keyPath: "id" });
    };
    req.onsuccess = () => {
      const db = req.result;
      // another tab forgetting everything closes this one; it opens again when next needed
      db.onversionchange = () => { db.close(); if (library.db === db) library.db = null; };
      done(db);
    };
    req.onerror = () => done(null);
  });
}
async function libraryDb() {
  if (library.state !== "ready") return null;
  if (!library.db) library.db = await openLibrary();
  return library.db;
}
async function startLibrary() {
  library.db = await openLibrary();
  if (!library.db) { library.state = "unavailable"; updateRunbar(); return; }
  library.state = "ready";
  library.films = await listFilms();
  await takeInLastFilm();
  updateRunbar();
}
async function listFilms() {
  const db = await libraryDb();
  if (!db) return library.films;
  try {
    const all = await idbAsk(db.transaction("films").objectStore("films").getAll());
    return all.sort((a, b) => (b.added || 0) - (a.added || 0));
  } catch { return library.films; }
}
// The last film as the page kept it before "Your films" (RUN_KEY), taken in, once.
async function takeInLastFilm() {
  const b64 = store.get(RUN_KEY);
  if (!b64) return;
  try {
    const d = JSON.parse(await inflate(b64));
    if (![1, 2, 3].includes(d.v) || typeof d.cindy !== "string" || !Array.isArray(d.scenes)) throw new Error("not a film");
    const r = await keepFilm(runFromData(d));
    if (!r.kept) return; // kept where it was, until the library has room
  } catch { /* an old or damaged copy: let it go, as the page always did */ }
  try { localStorage.removeItem(RUN_KEY); } catch { /* nothing kept */ }
}

// ---- the reader's notebooks of knowledge (Teach Ani)

// The notebooks kept, in the order they were made; those kept in localStorage while there
// was no library are taken in once it opens.
async function loadNotebooks() {
  let local = [];
  try { const v = JSON.parse(store.get(KNOWLEDGE_KEY) || "[]"); if (Array.isArray(v)) local = v.filter((n) => n && n.id && Array.isArray(n.pieces)); } catch { local = []; }
  const db = await libraryDb();
  if (!db) return local;
  try {
    if (local.length) {
      const tx = db.transaction("knowledge", "readwrite");
      for (const n of local) tx.objectStore("knowledge").put(n);
      await idbDone(tx);
      try { localStorage.removeItem(KNOWLEDGE_KEY); } catch { /* kept there too */ }
    }
    const all = await idbAsk(db.transaction("knowledge").objectStore("knowledge").getAll());
    return all.sort((a, b) => String(a.made || "").localeCompare(String(b.made || "")));
  } catch { return local; }
}
// One notebook kept (as it is now), or let go; where there is no library, all of them in
// localStorage. Says whether it was kept.
async function keepNotebook(rec) {
  const db = await libraryDb();
  const plainRec = JSON.parse(JSON.stringify(rec));
  if (db) {
    try { const tx = db.transaction("knowledge", "readwrite"); tx.objectStore("knowledge").put(plainRec); await idbDone(tx); return true; } catch { /* below */ }
  }
  return store.set(KNOWLEDGE_KEY, JSON.stringify(TEACHING.notebooks));
}
async function forgetNotebook(id) {
  const db = await libraryDb();
  if (db) {
    try { const tx = db.transaction("knowledge", "readwrite"); tx.objectStore("knowledge").delete(id); await idbDone(tx); return true; } catch { /* below */ }
  }
  return store.set(KNOWLEDGE_KEY, JSON.stringify(TEACHING.notebooks));
}

// ---- keeping a film

// Its title, as the list says it until the visitor renames it: a new story's, or Ken's
// with what was changed ("Cinderella: the stepmother pretty, kind and good; ...").
// A film remade with criticism adds it, a few words each ("..., with your criticism:
// No Longer Kept Apart too quick").
function filmTitle(run) {
  const critic = `${run.criticism && run.criticism.length ? critTitle(run) : ""}${run.knowledge && run.knowledge.length ? `, with teaching: ${run.knowledge.map((n) => n.title).join(", ")}` : ""}`;
  const cut = (t) => (t.length > 90 ? `${t.slice(0, 88).replace(/[\s;,]+\S*$/, "")}…` : t);
  if (!sameCast(RUNS[0], run)) return cut(`${storyTitle(run)}${critic}`);
  const bits = changeBits(RUNS[0].story, run);
  if (!bits.length) return cut(`Cinderella, as Ken told it${critic}`);
  return cut(`Cinderella: ${bits.slice(0, 2).join("; ")}${bits.length > 2 ? "; …" : ""}${critic}`);
}
// what a version of Ken's story changed, a few words each
function changeBits(ken, run) {
  const b = run.story, out = [];
  using(run, () => {
    for (const c of CAST) {
      const x = ken.characters[c], y = b.characters[c];
      if (!x || !y) continue;
      const added = [], removed = [];
      for (const slot of ["physical", "personality", "movement"]) {
        added.push(...y[slot].filter((w) => !x[slot].includes(w)));
        removed.push(...x[slot].filter((w) => !y[slot].includes(w)));
      }
      if (added.length) out.push(`${who(c)} ${words(added.map(plain))}`);
      else if (removed.length) out.push(`${who(c)} no longer ${words(removed.map(plain))}`);
    }
    for (const r of b.relationships) {
      const old = ken.relationships.find((x) => x.from === r.from && x.to === r.to);
      const added = r.how.filter((w) => !(old ? old.how : []).includes(w));
      if (added.length) out.push(`${who(r.from)} ${words(added.map(verb))} ${who(r.to)}`);
    }
    const kens = kenBeautifiedIn(b, run.cindy);
    if (kens) out.push("Ken's beautified scene");
    for (const id of Object.keys(b.scenes).filter((x) => !ken.scenes[x] && !(kens && x === BEAUTIFIED))) out.push(`a new scene, ${titleOf(b, id)}`);
    for (const id of Object.keys(ken.scenes).filter((x) => !b.scenes[x])) out.push(`without ${titleOf(ken, id)}`);
  });
  return out;
}
// what Ani was told, as plain lines: the story as told in English, and Ken's story's changes
// or a new story's cast and scenes
function filmAbout(run) {
  const out = [];
  if (run.told && run.told.story) out.push(`Told as: “${run.told.story}”`);
  if (sameCast(RUNS[0], run)) {
    const ch = storyChanges(RUNS[0].story, run.story, DATA.cindy, run.cindy).map(unmark);
    out.push(...(ch.length ? ch : ["Ken's story, as he told it."]));
  } else out.push(`A story of ${words(run.cast.map((c) => meet(run.story, c).the))}, in ${run.sceneIds.length} scene${run.sceneIds.length === 1 ? "" : "s"}: ${words(run.sceneIds.map((id) => run.titles[id]))}.`);
  return out;
}
// A film's fingerprint: when it was made, its description, its extensions, its frames (and
// its criticism), which tells two films apart; a film remade with criticism names the film it
// was remade from by it (remadeFrom.print).
function printOf(run, data = null) {
  const scenes = data ? data.scenes : run.raw.scenes.filter(Boolean);
  const made = data ? data.made : run.status && run.status.made;
  const frames = scenes.map((s) => (s.film && s.film.frames ? s.film.frames.length : -1)).join();
  const record = run.criticism && run.criticism.length ? `|${hashText(JSON.stringify(run.criticism))}` : "";
  const knowledge = run.knowledge && run.knowledge.length ? `|k${hashText(JSON.stringify(run.knowledge))}` : "";
  return `${made || ""}|${hashText(run.cindy)}|${runExtensions(run).join()}|${hashText(frames)}${record}${knowledge}`;
}
function filmMeta(run, data, size, file) {
  const told = run.told || null;
  return {
    id: `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    title: filmTitle(run), renamed: false,
    made: data.made || new Date().toISOString(), added: Date.now(), size,
    fps: run.fps || fpsOf(run.scenes.find(ready)), extensions: runExtensions(run),
    told: told ? { story: told.story || null, provider: told.provider || null, model: told.model || null } : null,
    about: filmAbout(run),
    scenes: run.sceneIds.length, filmed: run.scenes.filter(ready).length,
    stopped: !!(run.status && run.status.stopped), file: file || null,
    print: printOf(run, data),
    // a film remade with criticism (version 3): how many, and the film it was remade from
    ...(run.criticism && run.criticism.length ? { criticism: run.criticism.length } : {}),
    ...(run.remadeFrom ? { remadeFrom: { id: run.remadeFrom.id || null, title: run.remadeFrom.title || null, ken: !!run.remadeFrom.ken } } : {}),
    // a film made with the reader's knowledge (version 3): the notebooks' titles
    ...(run.knowledge && run.knowledge.length ? { knowledge: run.knowledge.map((n) => n.title) } : {}),
  };
}
// The film to let go for room: the oldest not on a screen, one renamed only after the rest.
function toLetGo(films) {
  const onScreen = new Set([RUNS[1] && RUNS[1].libId, ...state.pair.map((r) => String(r).replace(/^lib:/, ""))].filter(Boolean));
  const free = films.filter((f) => !onScreen.has(f.id)).sort((a, b) => (a.added || 0) - (b.added || 0));
  return free.find((f) => !f.renamed) || free[0] || null;
}
const isQuota = (e) => !!e && (e.name === "QuotaExceededError" || /quota/i.test(e.message || ""));
async function putFilm(db, meta, gz) {
  const tx = db.transaction(["films", "data"], "readwrite");
  tx.objectStore("data").put(gz, meta.id);
  tx.objectStore("films").put(meta);
  await idbDone(tx);
}
async function putMeta(db, meta) {
  const tx = db.transaction("films", "readwrite");
  tx.objectStore("films").put(meta);
  await idbDone(tx);
}
async function forgetFilm(db, id) {
  const tx = db.transaction(["films", "data"], "readwrite");
  tx.objectStore("films").delete(id);
  tx.objectStore("data").delete(id);
  await idbDone(tx);
  LIB_RUNS.delete(id);
}
// Keep a film: { kept, id, dropped (the films let go for room), room: "full" if there was
// none, again: it was kept already }, or { fallback } where there is no library.
async function keepFilm(run, { file = null } = {}) {
  const db = await libraryDb();
  if (!db) return { fallback: true };
  const data = filmData(run);
  const gz = await gzipBytes(JSON.stringify(data));
  const meta = filmMeta(run, data, gz.length, file);
  library.films = await listFilms();
  const already = library.films.find((f) => f.print === meta.print);
  if (already) {
    await putMeta(db, { ...already, added: Date.now() });
    library.films = await listFilms();
    return { kept: true, id: already.id, again: true, dropped: [] };
  }
  const dropped = [];
  let films = library.films;
  const letGo = async () => {
    const f = toLetGo(films);
    if (!f) return false;
    await forgetFilm(db, f.id);
    dropped.push(f);
    films = films.filter((x) => x !== f);
    return true;
  };
  const said = (r) => { library.dropped.push(...dropped); return { ...r, dropped }; };
  while (films.length >= LIBRARY_CAP) if (!(await letGo())) break;
  // the browser's room, where it says (with a fifth to spare): what can't fit even with every
  // other film let go isn't kept, and lets none go
  let room = null;
  try { const est = navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate() : null; if (est && est.quota) room = est.quota - (est.usage || 0); } catch { /* not said */ }
  const need = gz.length * 1.2;
  if (room !== null && need > room) {
    const freeable = films.filter((f) => toLetGo([f])).reduce((n, f) => n + (f.size || 0), 0);
    if (room + freeable < need) { library.films = await listFilms(); return said({ kept: false, room: "full" }); }
    while (room < need) { const f = toLetGo(films); if (!f || !(await letGo())) break; room += f.size || 0; }
  }
  for (let tries = 0; ; tries++) {
    try { await putFilm(db, meta, gz); break; }
    catch (e) {
      if (!isQuota(e) || tries >= 3 || !(await letGo())) { library.films = await listFilms(); return said({ kept: false, room: isQuota(e) ? "full" : null }); }
    }
  }
  library.films = await listFilms();
  return said({ kept: true, id: meta.id });
}
async function loadFilmData(id) {
  const db = await libraryDb();
  if (!db) return null;
  const gz = await idbAsk(db.transaction("data").objectStore("data").get(id));
  return gz ? JSON.parse(await gunzip(gz)) : null;
}
// One of "Your films" as a run, read when first wanted: the reader's version (current), or
// a film on a screen beside another, called by its title.
async function libraryRun(id, { current = false } = {}) {
  if (!current) {
    if (RUNS[1] && RUNS[1].libId === id) return RUNS[1];
    if (LIB_RUNS.has(id)) return LIB_RUNS.get(id);
  }
  const meta = library.films.find((f) => f.id === id);
  if (!meta) return null;
  let d;
  try { d = await loadFilmData(id); } catch (e) { console.error(e); d = null; }
  if (!d || typeof d.cindy !== "string" || !Array.isArray(d.scenes)) return null;
  const run = runFromData(d, current ? {} : { label: meta.title, short: meta.title.length > 24 ? `${meta.title.slice(0, 22)}…` : meta.title });
  run.libId = id;
  run.status.kept = true;
  if (!current) LIB_RUNS.set(id, run);
  return run;
}
// After "Your films" changed: the count, the lists over the screens, the panel.
function filmsChanged() {
  updateRunbar();
  renderWhich();
  if (state.panel === "films" || state.panel === "story") renderSide();
}
// The words the status line adds about where a film is kept.
function keptWords(run) {
  const st = run.status || {};
  const out = [];
  if (st.kept === false) out.push(st.room === "full" ? " This browser has no room to keep it: save it as a film file to keep it." : " This browser couldn't keep it.");
  if (st.kept === "deleted") out.push(" It is no longer kept in this browser.");
  if (st.dropped && st.dropped.length) out.push(` To make room, the page let go of ${st.dropped.length === 1 ? "your oldest film" : `your ${st.dropped.length} oldest films`}: ${words(st.dropped.map((f) => `“${f.title}” (made ${shortDate(f.made)})`))}.`);
  if (view.lost) out.push(" The film Ani was making when you left the page was lost with it.");
  return out.join("");
}

// "Change this story", for one of the reader's films beside Ken's: its description in the
// editor, with what the page tidied and the story as told.
function editStoryOf(run) {
  editor.text = run.cindy;
  store.set(DRAFT_KEY, run.cindy);
  editor.tidied = [...(run.tidied || [])];
  setTold(run.told || null);
  select(null, { panel: "edit" });
}

// ---- the panel

function openFilms() {
  select(null, { panel: "films" });
}
const sizeWords = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
function filmFacts(f) {
  const told = f.told && (f.told.model || f.told.provider) ? `written by ${[f.told.provider, f.told.model].filter(Boolean).join(", ")}` : "";
  const remade = f.remadeFrom ? `remade from ${f.remadeFrom.ken ? "Ken's 1978 film" : `“${f.remadeFrom.title || "another film"}”`} ${f.criticism ? `with criticism (${f.criticism})` : "without criticism"}` : f.criticism ? `with your criticism (${f.criticism})` : "";
  return [shortDate(f.made), `${f.fps} frames a second`, f.extensions && f.extensions.length ? `with ${extensionsName(f.extensions)}` : "by Ani as in 1978", f.knowledge && f.knowledge.length ? `with teaching (${f.knowledge.join(", ")})` : "", remade, told,
    f.filmed < f.scenes ? `${f.filmed} of ${f.scenes} scenes${f.stopped ? ", stopped" : ""}` : `${f.scenes} scene${f.scenes === 1 ? "" : "s"}`, sizeWords(f.size || 0), f.file ? `opened from ${f.file}` : ""].filter(Boolean).join(" · ");
}
function setFilmsStatus(text) { const el = document.getElementById("films-status"); if (el) el.textContent = text; }
function filmsPanel() {
  const side = document.getElementById("side");
  const films = libraryFilms();
  const cur = RUNS[1] && RUNS[1].libId;
  const running = !!(RUNS[1] && RUNS[1].status && RUNS[1].status.running);
  const intro = library.state === "unavailable"
    ? "This browser won't let the page keep a library of films here, so only the last film made is kept, as before. Save a film as a film file to keep it."
    : at611(`Every film made here, or opened from a film file, is kept in this browser, and nowhere else, the newest first: up to ${LIBRARY_CAP}; past that the page lets go of the oldest to make room (those renamed last of all), and says which. Save a film as a film file to keep it for good, or to watch it in another browser.`,
      `Every film made here, or opened from a film file, is kept on this computer, the newest first, up to ${LIBRARY_CAP}; after that the oldest are let go to make room. Save a film to a file to keep it for good.`);
  const dropped = library.dropped.length ? `<p class="note dropped">On this visit the page let go of ${words(library.dropped.map((f) => `“${esc(f.title)}” (made ${esc(shortDate(f.made))})`))} to make room.</p>` : "";
  const rows = films.map((f) => `<li class="film${f.id === cur ? " current" : ""}" data-film="${esc(f.id)}">
      <div class="film-head"><span class="film-title">${esc(f.title)}</span>${f.id === cur ? ` <span class="tag">the new version now</span>` : ""}</div>
      <p class="note">${esc(filmFacts(f))}</p>
      <div class="film-actions">
        <button type="button" class="linkish" data-film-act="open"${running ? ` disabled title="Ani is making a film; open this one when it has finished, or stop it"` : ""}>Open</button>
        <span>Side by side: <button type="button" class="linkish" data-film-act="left">on the left</button> · <button type="button" class="linkish" data-film-act="right">on the right</button></span>
        <button type="button" class="linkish" data-film-act="rename">Rename</button>
        <button type="button" class="linkish" data-film-act="save">Save as a film file</button>
        <button type="button" class="linkish" data-film-act="delete">Delete</button>
      </div>
      <div class="film-confirm" hidden></div>
      <details><summary>What Ani was told</summary><div class="body"><ul class="changes">${(f.about || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></details>
    </li>`).join("");
  // Ken's 1978 film, the oldest, last: to put beside any of them
  const ken = `<li class="film ken-film" data-film="ken">
      <div class="film-head"><span class="film-title">Ani's 1978 film</span></div>
      <p class="note">${esc(at611("Ken's Cinderella, as Ani made it at MIT in 1978 · always here", "Ken's Cinderella, as Ani made it in 1978 · always here"))}</p>
      <div class="film-actions"><span>Side by side: <button type="button" class="linkish" data-film-act="left">on the left</button> · <button type="button" class="linkish" data-film-act="right">on the right</button></span></div>
    </li>`;
  side.innerHTML = `
    <div class="side-head"><h2>Films made here</h2><button type="button" class="linkish" id="films-close">Back</button></div>
    <p class="note">${intro}</p>
    ${dropped}
    ${films.length ? "" : `<p class="note">${library.state === "unavailable" ? "" : "No films yet. Change the story, or tell Ani a new one, and each film it makes is kept here."}</p>`}
    <ul class="films">${rows}${ken}</ul>
    <div class="actions"><button type="button" class="btn" id="films-file">Open a saved film…</button></div>
    <p class="note" id="films-status" aria-live="polite"></p>`;
  side.querySelector("#films-close").addEventListener("click", () => select(null));
  side.querySelector("#films-file").addEventListener("click", () => chooseFilmFile());
  side.querySelectorAll("[data-film-act]").forEach((b) => b.addEventListener("click", () => filmAction(b.closest("[data-film]").dataset.film, b.dataset.filmAct, b)));
}
async function filmAction(id, act, button) {
  if (id === "ken") {
    if (act === "left" || act === "right") { setFilmsStatus("Putting it on the screen…"); await setPair(act === "left" ? 0 : 1, "ken"); }
    return;
  }
  const f = library.films.find((x) => x.id === id);
  if (!f) return;
  const item = button.closest("[data-film]");
  if (act === "open") {
    if (RUNS[1] && RUNS[1].status && RUNS[1].status.running) return;
    setFilmsStatus("Opening it…");
    const run = await libraryRun(id, { current: true });
    if (!run) { setFilmsStatus("This film couldn't be read back."); return; }
    showAsCurrent(run);
  } else if (act === "left" || act === "right") {
    setFilmsStatus("Putting it on the screen…");
    await setPair(act === "left" ? 0 : 1, RUNS[1] && RUNS[1].libId === id ? "cur" : `lib:${id}`);
  } else if (act === "save") {
    setFilmsStatus("Packing the film…");
    const run = await libraryRun(id);
    setFilmsStatus(run ? await saveFile(await filmFile(run), `ani-${slug(f.title).slice(0, 60).replace(/-$/, "")}.json`) : "This film couldn't be read back.");
  } else if (act === "rename") {
    const head = item.querySelector(".film-head");
    head.innerHTML = `<div class="film-rename"><input type="text" value="${esc(f.title)}" aria-label="The film's title" maxlength="120"><button type="button" class="btn" data-rename="yes">Rename</button><button type="button" class="linkish" data-rename="no">Cancel</button></div>`;
    const input = head.querySelector("input");
    const done = async (yes) => {
      const title = input.value.replace(/\s+/g, " ").trim();
      if (yes && title && title !== f.title) await renameFilm(id, title);
      else renderSide();
    };
    head.querySelector('[data-rename="yes"]').addEventListener("click", () => done(true));
    head.querySelector('[data-rename="no"]').addEventListener("click", () => done(false));
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") done(true); else if (e.key === "Escape") done(false); });
    input.focus();
    input.select();
  } else if (act === "delete") {
    // asked on the page (a claude.ai artifact shows no confirm())
    const box = item.querySelector(".film-confirm");
    box.innerHTML = `<p>Delete “${esc(f.title)}” from this browser? It can't be undone: save it as a film file first to keep it.</p><div class="actions"><button type="button" class="btn danger" data-delete="yes">Delete it</button><button type="button" class="linkish" data-delete="no">Keep it</button></div>`;
    box.hidden = false;
    box.querySelector('[data-delete="yes"]').addEventListener("click", () => deleteFilm(id));
    box.querySelector('[data-delete="no"]').addEventListener("click", () => { box.hidden = true; });
  }
}
async function renameFilm(id, title) {
  const db = await libraryDb();
  const f = library.films.find((x) => x.id === id);
  if (!db || !f) return;
  try { await putMeta(db, { ...f, title, renamed: true }); } catch (e) { setFilmsStatus(`It couldn't be renamed: ${e.message || e}`); return; }
  library.films = await listFilms();
  const run = LIB_RUNS.get(id);
  if (run) { run.label = title; run.short = title.length > 24 ? `${title.slice(0, 22)}…` : title; }
  filmsChanged();
}
async function deleteFilm(id) {
  const db = await libraryDb();
  if (!db) return;
  try { await forgetFilm(db, id); } catch (e) { setFilmsStatus(`It couldn't be deleted: ${e.message || e}`); return; }
  library.films = await listFilms();
  // the reader's version stays on its screen, no longer kept; a film beside it gives way
  if (RUNS[1] && RUNS[1].libId === id) { RUNS[1].libId = null; RUNS[1].status.kept = "deleted"; }
  const onScreen = state.pair.includes(`lib:${id}`);
  if (state.chosen === `lib:${id}`) state.chosen = null;
  state.pair = state.pair.map((ref, r) => (ref === `lib:${id}` ? (r ? "cur" : "ken") : ref));
  filmsChanged();
  if (onScreen && state.view === "both") { const panel = state.panel; setView("both"); if (panel === "films") { state.panel = "films"; renderSide(); } }
}

// ---------------------------------------------------------------- what this page keeps

// "What this page keeps in this browser", in the footer: exactly what is kept, and where,
// read when it is opened, with "Forget all teaching saved on this computer" (app/film/teach.js,
// forgetTeachingBox) and "Forget all of it", which clears everything the page keeps (in
// localStorage and sessionStorage, the keys named ani-cinderella:..., and its IndexedDB
// database) and starts the page afresh. Its words don't say "your": the computer may be
// shared, and what is kept may be someone else's (Ken, 21 October).
// (whether to ask about reporting an error to Ken: "never", once the visitor said so; report.js)
const REPORT_KEY = "ani-cinderella:error-reports:v1";
const KEPT_WHAT = () => [
  [COLOR_KEY, "Whether the film is shown in color or as Ken's TV previews ran (TV)"],
  [RATE_KEY, "Which frames a second the 1978 film is shown at"],
  [MODE_KEY, at611("Which Ani makes the films made here, once the switch was pressed: Ani as in 1978, or with the revival's extensions (until then, with the extensions)", "Which Ani makes the films made here, once it was chosen: Ani as in 1978, or with the new parts added in 2026")],
  [EXT_KEY, at611("The revival's extensions ticked, when they aren't one of the switch's settings", "Which of the new parts added in 2026 are ticked")],
  [FPS_KEY, at611("The frames a second the films are made at", "How smooth the films made here are")],
  [DRAFT_KEY, at611("The film description being changed in “Change the story”", "The story being changed in “Change the story”")],
  [TOLD_KEY, at611("The last story told in English, and the model that put it into Ken's notation", "The last story told to Ani, and the AI that turned it into words Ani can read")],
  [STORY_KEY, "The story being told in “Tell Ani a new story”"],
  [SETTINGS_KEY, at611("The model chosen, and whether it writes JSON or Ken's Lisp", "Which AI was chosen, and how it writes")],
  [KEYS_KEY, at611("API keys, only if “Remember keys in this browser” was ticked", "Keys for the AI, only if “Remember keys in this browser” was ticked")],
  [VIDEO_KEY, "The video options: title cards and subtitles"],
  [RUN_KEY, "The last film made here, where this browser won't keep a library of them"],
  [KNOWLEDGE_KEY, "The notebooks of teaching (Teach Ani), where this browser won't keep a library"],
  [AGE_KEY, "The age setting (6–11 or 12+). Nothing about anyone is kept"],
  [BIG_KEY, "Whether buttons and words are bigger at 6–11"],
  [SPEECH_KEY, "The speech settings: Read aloud, the voice, how fast, and whether Talk to Ani is on"],
  [REPORT_KEY, "That “Don't ask again” was chosen when Ani ran into an error: no report is ever sent from this browser"],
];
const PAGE_PREFIX = "ani-cinderella:";
function keysIn(storage) {
  const out = [];
  try { for (let k = 0; k < storage.length; k++) { const key = storage.key(k); if (key && key.startsWith(PAGE_PREFIX)) out.push([key, (storage.getItem(key) || "").length]); } } catch { /* refused here */ }
  return out;
}
function renderKept() {
  const body = document.getElementById("kept-body");
  const local = keysIn(localStorage), sess = keysIn(sessionStorage);
  const known = KEPT_WHAT();
  const chars = (n) => (n >= 1024 ? `${Math.round(n / 1024)} thousand characters` : `${n} character${n === 1 ? "" : "s"}`);
  const localItems = [...known.filter(([k]) => local.some(([x]) => x === k)).map(([k, what]) => `<li>${esc(what)}${at611(` <span class="note">(${esc(k)}, ${chars(local.find(([x]) => x === k)[1])})</span>`, "")}</li>`),
    ...local.filter(([x]) => !known.some(([k]) => k === x)).map(([k, n]) => `<li><span class="note">${esc(k)}, ${chars(n)}</span></li>`)];
  const films = libraryFilms(), size = films.reduce((n, f) => n + (f.size || 0), 0);
  const views = sess.filter(([k]) => k.startsWith(VIEW_KEY) && !/:(last|leaving)$/.test(k)).length;
  const sessItems = sess.length ? [`<li>Where you are on the page: the films on the screens, the scene and the moment, the character you clicked and what you opened, so that coming back from the code pages, or a reload, puts you back there${at611(` <span class="note">(${views} place${views === 1 ? "" : "s"} in this tab's history${sess.some(([k]) => k === `${VIEW_KEY}leaving`) ? ", and when you last left the page" : ""})</span>`, "")}</li>`] : [];
  const nbs = TEACHING.notebooks.length;
  body.innerHTML = `
    <p>Everything here stays in this browser, for this page alone; the page sends none of it anywhere.</p>
    <p class="kept-where">${at611("In localStorage, until you clear it", "Settings and stories, until they are forgotten")}</p>
    ${localItems.length ? `<ul>${localItems.join("")}</ul>` : `<p>Nothing now.</p>`}
    <p class="kept-where">${at611(`In IndexedDB (the database “${esc(LIBRARY_DB)}”), until you clear it`, "Films and teaching, until they are forgotten")}</p>
    <p>${library.state === "unavailable" ? "Nothing: this browser won't let the page keep a library here." : films.length ? `Films made here: ${films.length} film${films.length === 1 ? "" : "s"}, ${sizeWords(size)} (each with its title, what Ani was told, how it was made and when).` : "Nothing now (the films made here are kept here once one is made)."}</p>
    ${library.state !== "unavailable" && nbs ? `<p>Teaching: ${nbs} notebook${nbs === 1 ? "" : "s"} (Teach Ani), each with its title and pieces.</p>` : ""}
    <p class="kept-where">${at611("In sessionStorage, until this tab is closed", "Where you are on the page, until this tab is closed")}</p>
    ${sessItems.length ? `<ul>${sessItems.join("")}</ul>` : `<p>Nothing now.</p>`}
    <p>${at611("Gemini Nano, if you have used it here, is kept by Chrome itself, not by this page.", "Gemini Nano, an AI that runs in Chrome, is kept by Chrome itself, not by this page.")}</p>
    <div class="actions">${nbs ? `<button type="button" class="btn danger" id="kept-forget-teaching">Forget all teaching saved on this computer</button>` : ""}<button type="button" class="btn danger" id="kept-forget">Forget all of it</button></div>
    ${nbs && teachUi.forgetAll === "kept" ? forgetTeachingBox("kept") : ""}
    <div class="kept-confirm" id="kept-confirm" hidden></div>`;
  const ft = body.querySelector("#kept-forget-teaching");
  if (ft) ft.addEventListener("click", () => { teachUi.forgetAll = "kept"; renderKept(); const y = body.querySelector("[data-forget-teaching]"); if (y) y.focus(); });
  body.querySelector("#kept-forget").addEventListener("click", () => {
    const box = body.querySelector("#kept-confirm");
    box.innerHTML = `<p>This deletes ${films.length ? `the ${films.length} film${films.length === 1 ? "" : "s"} made here${nbs ? ", " : " and "}` : ""}${nbs ? `the ${nbs} notebook${nbs === 1 ? "" : "s"} of teaching and ` : ""}everything listed above from this browser, and starts the page afresh. It can't be undone.</p><div class="actions"><button type="button" class="btn danger" id="kept-yes">Forget it all</button><button type="button" class="linkish" id="kept-no">Keep it</button></div>`;
    box.hidden = false;
    box.querySelector("#kept-yes").addEventListener("click", () => forgetAll());
    box.querySelector("#kept-no").addEventListener("click", () => { box.hidden = true; });
  });
}
document.getElementById("kept-note").addEventListener("toggle", (e) => { if (e.target.open) renderKept(); });
function deleteLibrary() {
  if (library.db) { try { library.db.close(); } catch { /* closed */ } library.db = null; }
  library.state = "forgotten";
  library.films = [];
  return new Promise((resolve) => {
    setTimeout(resolve, 4000);
    try { const req = indexedDB.deleteDatabase(LIBRARY_DB); req.onsuccess = () => resolve(); req.onerror = () => resolve(); } catch { resolve(); }
  });
}
async function forgetAll() {
  view.forgetting = true; // nothing kept on the way out
  clearTimeout(view.timer);
  stopRun({ quiet: true });
  for (const storage of [localStorage, sessionStorage]) {
    try { for (const [key] of keysIn(storage)) storage.removeItem(key); } catch { /* refused here */ }
  }
  await deleteLibrary();
  try { history.replaceState(null, "", location.pathname + location.search); } catch { /* not allowed here */ }
  location.reload();
}
