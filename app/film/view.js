// ---------------------------------------------------------------- where the visitor is

// Where the visitor is on the page (which films, the view, the scene and the moment, playing
// or paused, the 1978 film's frames a second, TV or color, the character clicked, the panel
// open, which of its details are open and which "why?" box, and how far it and the page are
// scrolled), kept in this tab's sessionStorage whenever it changes and as the page is left,
// so that coming back from the code pages (Ken, 16 October: "it was showing the state of the
// app after a refresh"), or a reload, puts the page back as it was. Each visit of the page
// in the tab's history has its own (its id kept in history.state), so that two never mix,
// and the tab's last is what "Back to the film" opens where it can't go back
// (film.html#view; app/back-to-film.js). A page the browser kept whole while it was away
// (its back-forward cache) comes back as it was, and is drawn again.
const VIEW_KEY = "ani-cinderella:view:v1:";
const VIEWS_KEPT = 12;
const session = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); return true; } catch { return false; } },
};
const historyState = () => { try { const s = history.state; return s && typeof s === "object" ? s : {}; } catch { return {}; } };
function rememberViewId() {
  try { if (historyState().aniView !== view.id) history.replaceState({ ...historyState(), aniView: view.id }, ""); } catch { /* not allowed here */ }
}
view.id = typeof historyState().aniView === "string" ? historyState().aniView : `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
rememberViewId();
// the page puts its own scroll back, once its films are drawn
try { history.scrollRestoration = "manual"; } catch { /* as the browser has it */ }

// The details of the side panel, each named by its summary (and which of that name it is),
// open or not; and opened or closed again as they were.
function detailsKeys(root) {
  const seen = {};
  return [...root.querySelectorAll("details")].map((d) => {
    const s = d.querySelector(":scope > summary");
    const t = (s ? s.textContent : "").replace(/\s+/g, " ").trim();
    seen[t] = (seen[t] || 0) + 1;
    return [`${t}#${seen[t]}`, d];
  });
}
const detailsOf = (root) => detailsKeys(root).map(([k, d]) => [k, d.open]);
function applyDetails(root, list) {
  const want = new Map(Array.isArray(list) ? list : []);
  for (const [k, d] of detailsKeys(root)) if (want.has(k) && d.open !== !!want.get(k)) d.open = !!want.get(k);
}
// The "why?" box open in the side panel: a choice point or a look, as its button names it.
const BOX_ATTRS = ["cp", "look", "cmp-cp", "cmp-look"];
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest(BOX_ATTRS.map((a) => `#side [data-${a}]`).join(", "));
  if (!b || view.restoring) return;
  const attr = BOX_ATTRS.find((a) => b.hasAttribute(`data-${a}`));
  const value = b.getAttribute(`data-${attr}`);
  // a look's "why?" pressed again closes its box
  view.box = /look/.test(attr) && view.box && view.box.attr === attr && view.box.value === value ? null : { attr, value };
  scheduleSave();
}, true);
function openBox(root, box) {
  if (!box || !BOX_ATTRS.includes(box.attr)) return;
  const b = [...root.querySelectorAll(`[data-${box.attr}]`)].find((x) => x.getAttribute(`data-${box.attr}`) === box.value);
  if (b) { b.click(); view.box = box; }
}

function viewState() {
  const side = document.getElementById("side");
  const cur = RUNS[1];
  return {
    v: 1, at: Date.now(),
    cur: cur ? { libId: cur.libId || null, running: !!(cur.status && cur.status.running) } : null,
    pair: [...state.pair], chosen: state.chosen, view: state.view, rate: RATE, color: state.color,
    scene: state.scene, time: state.time, playing: state.playing,
    selected: state.selected ? { run: state.selected.run, char: state.selected.char, plan: state.selected.plan || null } : null,
    panel: state.panel, details: detailsOf(side), box: view.box,
    sideScroll: side.scrollTop, pageScroll: window.scrollY,
    savePanel: !document.getElementById("save-panel").hidden,
  };
}
// Kept a moment after a change (at most every 400 ms while the film plays), and at once as
// the page is hidden or left.
function scheduleSave() {
  if (view.timer || view.restoring || view.forgetting) return;
  view.timer = setTimeout(() => { view.timer = null; saveView(); }, 400);
}
function saveView() {
  if (view.restoring || view.forgetting || !view.id) return;
  if (!session.set(VIEW_KEY + view.id, JSON.stringify(viewState()))) return;
  session.set(`${VIEW_KEY}last`, view.id);
  // this tab's last few visits of the page, no more
  try {
    const kept = [];
    for (let k = 0; k < sessionStorage.length; k++) {
      const key = sessionStorage.key(k);
      if (key && key.startsWith(VIEW_KEY) && !/:(last|leaving)$/.test(key)) kept.push([key, (JSON.parse(sessionStorage.getItem(key) || "{}").at) || 0]);
    }
    if (kept.length > VIEWS_KEPT) kept.sort((a, b) => a[1] - b[1]).slice(0, kept.length - VIEWS_KEPT).forEach(([key]) => sessionStorage.removeItem(key));
  } catch { /* refused here */ }
}
function saveNow() {
  clearTimeout(view.timer);
  view.timer = null;
  saveView();
}
window.addEventListener("pagehide", () => {
  if (view.forgetting) return;
  saveNow();
  // for a code page reached from here without a referrer (a file:// page), to know it was
  session.set(`${VIEW_KEY}leaving`, JSON.stringify({ at: Date.now(), id: view.id }));
});
document.addEventListener("visibilitychange", () => { if (document.hidden && !view.forgetting) saveNow(); });
document.getElementById("side").addEventListener("scroll", () => scheduleSave(), { passive: true });
window.addEventListener("scroll", () => scheduleSave(), { passive: true });
document.addEventListener("toggle", (e) => { if (e.target.closest && e.target.closest("#side")) scheduleSave(); }, true);
// a hash link (a moment of the 1978 film) is an entry of its own in the tab's history
window.addEventListener("hashchange", rememberViewId);
// back from the browser's back-forward cache: as it was, drawn again, and "Your films" read
// again (another tab may have changed them)
window.addEventListener("pageshow", (e) => {
  if (!e.persisted) return;
  rememberViewId();
  sizeCanvases();
  drawBands();
  render();
  listFilms().then((films) => { library.films = films; filmsChanged(); }).catch(() => {});
});

// The place to go back to: on a reload or a step back or forward through the tab's
// history, this visit's; opened as film.html#view, the tab's last; else none.
function savedView() {
  let type = "navigate";
  try { type = performance.getEntriesByType("navigation")[0].type || type; } catch { /* not said */ }
  let id = null;
  if (location.hash === "#view") {
    id = session.get(`${VIEW_KEY}last`);
    try { history.replaceState(historyState(), "", location.pathname + location.search); } catch { /* not allowed here */ }
  } else if (type === "reload" || type === "back_forward") id = view.id;
  if (!id) return null;
  try { const s = JSON.parse(session.get(VIEW_KEY + id) || "null"); return s && s.v === 1 ? s : null; } catch { return null; }
}
// Put the page back as it was: the films (the reader's version and any of their films on a
// screen, read from "Your films"), the view, the scene and moment, the character and the
// panel, its details and "why?" box, the scroll, and playing if it was.
async function restoreView(s) {
  view.restoring = true;
  const side = document.getElementById("side");
  try {
    if (RATES.includes(s.rate) && s.rate !== RATE) {
      RATE = s.rate;
      RUNS[0] = kenRun(RATE);
      document.querySelectorAll("#rate button").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.rate) === RATE)));
    }
    if (typeof s.color === "boolean" && s.color !== state.color) setColor(s.color, { remember: false });
    if (!RUNS[1] && s.cur && s.cur.libId) { const run = await libraryRun(s.cur.libId, { current: true }); if (run && !RUNS[1]) RUNS[1] = run; }
    // a film Ani was making when the page was left went with it
    view.lost = !!(s.cur && s.cur.running && !(RUNS[1] && RUNS[1].status && RUNS[1].status.running));
    if (!RUNS[1]) await restoreRun();
    for (const ref of Array.isArray(s.pair) ? s.pair : []) if (/^lib:/.test(ref)) await libraryRun(ref.slice(4));
    if (Array.isArray(s.pair) && s.pair.length === 2) state.pair = s.pair.map(String);
    // the left film the visitor chose, theirs still; a film of "Films made here" read first
    if (typeof s.chosen === "string" && /^lib:/.test(s.chosen)) await libraryRun(s.chosen.slice(4));
    state.chosen = typeof s.chosen === "string" && (!/^lib:/.test(s.chosen) || libraryFilms().some((f) => `lib:${f.id}` === s.chosen)) ? s.chosen : null;
    state.selected = null;
    state.panel = "story";
    setView(s.view === "both" || s.view === 1 ? s.view : 0);
    state.scene = Math.max(0, Math.min(Number(s.scene) || 0, sceneCount() - 1));
    document.querySelectorAll("#scenes button").forEach((b, k) => b.setAttribute("aria-pressed", String(k === state.scene)));
    state.time = Math.max(0, Math.min(Number(s.time) || 0, maxTime()));
    drawBands();
    render();
    const sel = s.selected;
    if (sel && shown().includes(sel.run)) {
      const run = screenRun(sel.run);
      if (run && run.cast.includes(sel.char) && ready(sceneOf(sel.run))) state.selected = { run: sel.run, char: sel.char, plan: sel.plan || null, of: run };
    }
    state.panel = ["story", "why", "edit", "tell", "compare", "films", "teach"].includes(s.panel) ? s.panel : defaultPanel();
    if (state.panel === "why" && !state.selected) state.panel = defaultPanel();
    if (state.panel === "edit") editor.text = store.get(DRAFT_KEY) || (RUNS[1] ? RUNS[1].cindy : DATA.cindy);
    lastPanel = null;
    renderSide();
    applyDetails(side, s.details);
    openBox(side, s.box);
    if (s.savePanel) toggleSavePanel(true);
    draw();
    updateRunbar();
    const scroll = () => { side.scrollTop = Number(s.sideScroll) || 0; window.scrollTo(0, Number(s.pageScroll) || 0); };
    scroll();
    requestAnimationFrame(scroll);
    // (after a "why?" box's own smooth scroll into view)
    if (s.box) setTimeout(scroll, 450);
    if (s.playing) play();
  } finally {
    view.restoring = false;
  }
  scheduleSave();
}
