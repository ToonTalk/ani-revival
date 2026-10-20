// ---------------------------------------------------------------- the age setting

// How the page presents Ani: for ages 6–8, ages 9–11, or 12 and over (today's page, the
// default), reports/chapter-x/design-young-children.md. The setting changes only words and
// what is shown: it never reaches Ani, a film, a film file, "Your films", a criticism or a
// notebook, and "Ani as in 1978" and every film are the same at every setting. It is kept
// in this browser (AGE_KEY), and a teacher sets it for a class with a link, a bare token in
// the page's dot-separated hash: #ages-6-8, #ages-9-11, #ages-12, alone or with a moment
// (#kept-apart.48.cinderella.ages-6-8). A link can set the age; it can never turn on
// Talk to Ani (app/film/speech.js).
const AGES = ["6-8", "9-11", "12"];
const AGE_KEY = "ani-cinderella:age:v1";
const AGE_NAMES = { "6-8": "ages 6–8", "9-11": "ages 9–11", 12: "12 and over" };
let AGE = AGES.includes(store.get(AGE_KEY)) ? store.get(AGE_KEY) : "12";
const young = () => AGE === "6-8";
const simpleAge = () => AGE !== "12";
// the age a link's hash names, if one of its parts is ages-...
function ageOfHash(parts) {
  for (const p of parts) { const m = /^ages-(6-8|9-11|12)$/.exec(p); if (m) return m[1]; }
  return null;
}
// The runbar's words for the films at 6–8, and today's
const RUNBAR_WORDS = { 0: ["Ani's 1978 film", "Ken's film"], 1: ["Your version", "My film"] };
// The classes on <html> the style sheet reads (age-6-8, age-9-11), the control's pressed
// button, where the control is (in the header; at 6–8 in "For grown-ups", so that a child
// doesn't switch it by accident), and the runbar's words.
function applyAge() {
  const html = document.documentElement;
  html.classList.toggle("age-6-8", AGE === "6-8");
  html.classList.toggle("age-9-11", AGE === "9-11");
  document.querySelectorAll("#ages [data-age]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.age === AGE)));
  const ages = document.getElementById("ages");
  const home = document.getElementById(young() ? "grownups-ages" : "ages-home");
  if (ages && home && ages.parentElement !== home) home.append(ages);
  document.querySelectorAll("#runbar [data-view]").forEach((b) => { const w = RUNBAR_WORDS[b.dataset.view]; if (w) b.textContent = w[young() ? 1 : 0]; });
}
// at 6–8 the film is shown in color, whatever this browser kept (a grown-up can still
// choose TV in For grown-ups' film settings)
function youngColor({ boot = false } = {}) {
  if (!young() || state.color || ageColorChosen) return;
  if (!boot) { setColor(true, { remember: false }); return; }
  state.color = true;
  document.getElementById("mode-bw").setAttribute("aria-pressed", "false");
  document.getElementById("mode-color").setAttribute("aria-pressed", "true");
}
let ageColorChosen = false;
document.getElementById("mode-bw").addEventListener("click", () => { ageColorChosen = true; });
// Set the age: kept in this browser (unless remember is false), and the page drawn again at
// it; from a link, with a note that says so.
function setAge(age, { remember = true, link = false } = {}) {
  if (!AGES.includes(age)) return;
  const changed = age !== AGE;
  AGE = age;
  if (remember) store.set(AGE_KEY, age);
  applyAge();
  youngColor();
  const note = document.getElementById("age-note");
  if (note && link) {
    note.hidden = false;
    note.querySelector("span").textContent = `This link set the page for ${AGE_NAMES[age]}. A grown-up can change it ${young() ? "in “For grown-ups”, at the top" : "at the top"}.`;
  }
  if (!changed) return;
  if (typeof onAgeChanged === "function") onAgeChanged();
  lastPanel = null;
  layout();
  renderSceneButtons();
  updateRunbar();
  render();
  renderSide();
}
document.querySelectorAll("#ages [data-age]").forEach((b) => b.addEventListener("click", () => setAge(b.dataset.age)));
document.getElementById("age-note-close").addEventListener("click", () => { document.getElementById("age-note").hidden = true; });
// "Film settings": frames a second, TV or color and Save, folded away at 9–11 (beside the
// controls) and at 6–8 (in For grown-ups)
document.querySelectorAll("[data-film-settings]").forEach((b) => b.addEventListener("click", () => {
  const on = document.documentElement.classList.toggle("film-settings");
  document.querySelectorAll("[data-film-settings]").forEach((x) => x.setAttribute("aria-expanded", String(on)));
}));
// "About this page", the footer's rest at 6–8
document.getElementById("about-page").addEventListener("click", (e) => {
  const on = document.documentElement.classList.toggle("footer-open");
  e.currentTarget.setAttribute("aria-expanded", String(on));
});
applyAge();
youngColor({ boot: true });

// ---------------------------------------------------------------- naming the characters

// At 6–8 a character is named by what the child sees: "the" + color + shape ("the red
// square"), in TV's black and white by its shape alone; at 9–11 and 12+ by its name. A
// shape is "it". Names are a tap away: the legend's chips and the panel's heading show both.
const SHAPE_WORDS = { star: "star", square: "square", triangle: "triangle", circle: "circle", pentagon: "five-sided shape", hexagon: "six-sided shape", octagon: "eight-sided shape", "eight-pointed-star": "star with eight points", "ten-pointed-star": "star with ten points" };
// each 1978 shape's color, as the film draws it (SHAPE_LOOK), in a word
const FILM_HUE = { star: "green", square: "red", triangle: "yellow", circle: "orange", pentagon: "blue", hexagon: "purple" };
const shapeOfChar = (run, c) => (run && run.shapes && run.shapes[c]) || KEN_SHAPE[c] || "circle";
// a character's color in a word: in a film made with Ani's colors, the hue of its look as
// at its first appearance in the scene (a color that dims or brightens renames no one);
// else its 1978 color, that of the shape it would have had
function hueOfChar(run, c, sc = null) {
  const own = run && run.cast && lookOf(run, c);
  if (own && own.color) {
    let look = own;
    if (sc && sc.film && sc.film.looks) { const first = sc.film.looks.find((x) => x[1] === c && x[2] && x[2].color); if (first) look = first[2]; }
    const [h, sat] = look.color;
    return sat === 0 ? "gray" : look.hue || HUES.find((x) => HUE_ANGLE[x] === h) || "colored";
  }
  const slot = (run && run.slots && run.slots[c]) || (run && run.shapes && run.shapes[c]) || KEN_SHAPE[c];
  return FILM_HUE[slot] || "orange";
}
// the 6–8 names of a run's cast, told apart where two would be the same: by size, then by
// name ("the circle (the tortoise)")
function kidNames(run, sc = null) {
  const color = state.color;
  const base = Object.fromEntries(run.cast.map((c) => [c, `${color ? `${hueOfChar(run, c, sc)} ` : ""}${SHAPE_WORDS[shapeOfChar(run, c)] || plain(shapeOfChar(run, c))}`]));
  const out = {};
  for (const c of run.cast) {
    const same = run.cast.filter((o) => base[o] === base[c]);
    if (same.length < 2) { out[c] = `the ${base[c]}`; continue; }
    const size = (x) => { const l = lookOf(run, x); const w = l ? sizeWord(l.aniSize) : ""; return w === "large" || w === "fairly large" ? "big" : w === "small" || w === "fairly small" ? "small" : ""; };
    const sizes = same.map(size);
    out[c] = sizes.every(Boolean) && new Set(sizes).size === sizes.length ? `the ${size(c)} ${base[c]}` : `the ${base[c]} (${meet(run.story, c).the})`;
  }
  return out;
}
// A character as the setting names it: at 6–8 "the red square", else as the page names it.
function nameAt(c, run = R) {
  if (!young() || !run || !run.cast || !run.cast.includes(c)) return who(c);
  const sc = run.scenes && typeof state.scene === "number" ? run.scenes[state.scene] : null;
  return kidNames(run, sc)[c] || who(c);
}
// "the red square · the stepmother", for a heading or a chip
const bothNames = (c, run = R) => `${nameAt(c, run)} · ${meet(run.story, c).the}`;

// The legend at 6–8 and 9–11: each character a button that opens it (a keyboard and screen
// reader's way to the panel, which the film's picture lacks), "green star · Cinderella" or
// "Cinderella (star)".
function ageLegend(cast, runs) {
  const el = document.getElementById("legend");
  el.innerHTML = cast.map(([c, rs]) => {
    const run = rs[0], r = shown().find((k) => screenRun(k) === run) ?? 0;
    const label = young() ? using(run, () => `${nameAt(c, run).replace(/^the /, "")} · ${meet(run.story, c).name}`) : `${meet(run.story, c).name} (${SHAPE_WORDS[shapeOfChar(run, c)] || shapeName(shapeOfChar(run, c))})`;
    return `<button type="button" class="chip" data-chip="${esc(c)}" data-slot="${r}">${icon(c, young() ? 22 : 16, run)}<span>${esc(cap(label))}</span></button>`;
  }).join("");
  el.querySelectorAll("[data-chip]").forEach((b) => b.addEventListener("click", () => {
    const r = Number(b.dataset.slot);
    if (ready(sceneOf(r))) select({ run: r, char: b.dataset.chip });
  }));
}
