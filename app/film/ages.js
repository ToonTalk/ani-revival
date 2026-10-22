// ---------------------------------------------------------------- the age setting

// How the page presents Ani: for ages 6–11, or 12 and over (today's page, the default),
// reports/chapter-x/design-young-children.md. The setting changes only words and what is
// shown: it never reaches Ani, a film, a film file, the films kept here, a criticism or a
// notebook, and "Ani as in 1978" and every film are the same at either setting. It is kept
// in this browser (AGE_KEY), and a teacher sets it for a class with a link, a bare token in
// the page's dot-separated hash: #ages-6-11 or #ages-12, alone or with a moment
// (#kept-apart.48.cinderella.ages-6-11). There were three settings until 21 October 2026
// (6–8, 9–11 and 12+); Ken's decision then: "My grandchildren (5 and 7) would have no
// problems with the 9-11 wording", so 6–8 went and 9–11 became 6–11. The old tokens
// (#ages-6-8, #ages-9-11) and the old kept values still open 6–11 (OLD_AGES). A link can set
// the age; it can never turn on Talk to Ani (app/film/speech.js).
const AGES = ["6-11", "12"];
const OLD_AGES = { "6-8": "6-11", "9-11": "6-11" };
const AGE_KEY = "ani-cinderella:age:v1";
const AGE_NAMES = { "6-11": "ages 6–11", 12: "12 and over" };
const ageOf = (v) => (AGES.includes(v) ? v : OLD_AGES[v] || null);
let AGE = ageOf(store.get(AGE_KEY)) || "12";
const simpleAge = () => AGE !== "12";
// The words the page shows: at 12+ as they were (full), at 6–11 in everyday words (kid),
// written here by hand, never by a language model (reports/chapter-x/ages-6-11-words.md
// lists each). at611More puts the 12+ text under "More" at 6–11, as the panels do.
function at611(full, kid) { return simpleAge() ? kid : full; }
function at611More(full, kid, label = "More") { return simpleAge() ? `${kid}<details class="age-more"><summary>${label}</summary><div class="body">${full}</div></details>` : full; }

// ---- everyday words at 6–11, everywhere the page shows text

// Beside the sentences written for 6–11 (at611, the templates below), the page's own words
// for what it is and does (the revival, its extensions, a language model, Ken's notation,
// a pass, a frame, criticism, ...) are said in everyday words wherever they are shown at
// 6–11: a fixed table of phrases, in order, each with its replacement (EVERYDAY; the report
// reports/chapter-x/ages-6-11-words.md lists them), put in the text and the titles, labels
// and placeholders of what the page shows as it is drawn (a MutationObserver), and taken
// out again at 12+ (each text as it was is kept). Never inside More (.age-more, the 12+
// text), Lisp, code, or a box the reader types in; and never Ani's own words of the record
// (dominates, is tolerant of, ...), which the table doesn't name. A replacement never holds
// what it replaces, so drawing again changes nothing more.
const EVERYDAY = [
  // the page's citations of Ken's files, the thesis's pages and the extensions' names
  [/\s*\((?:[a-z0-9]+\.\d+(?:, line \d+|:[\d, –-]+)|(?:the )?thesis,? pp?\. [^)]*|pp?\. [\d–-]+|AI-TR-540,? pp?\. [^)]*|REVIVE;[A-Z0-9]+|(?:MEND|KNOW|APPEAR|CHANGE|SEEN|FIT|SLIPS|DETAIL|CRITIC|TEACH|TIMELY)(?:, [^)]*)?)\)/g, ""],
  [/\(the revival's\)/g, "(added in 2026)"],
  [/\bWhat Lisp said\b/g, "More: what Ani's program said"],
  // the revival and its extensions: what was added to Ani in 2026
  [/\bAni with the revival's extensions\b/g, "Ani with the new parts added in 2026"],
  [/\bsome of the revival's extensions\b/g, "some of the new parts added in 2026"],
  [/\bthe revival's extensions\b/g, "the new parts added in 2026"],
  [/\bThe revival's extensions\b/g, "The new parts added in 2026"],
  [/\bthe revival's repairs\b/g, "the repairs added in 2026"],
  [/\bThe revival's repairs\b/g, "The repairs added in 2026"],
  [/\bthe revival's knowledge\b/g, "the knowledge added in 2026"],
  [/\bthe revival's (correction|repair|rule|choice|reading)s?\b/g, "a $1 added in 2026"],
  [/\bthe revival's own\b/g, "the 2026"],
  [/\bthe revival's\b/g, "the 2026"],
  [/\bThe revival's\b/g, "The 2026"],
  [/\bthis revival\b/g, "this 2026 version of Ani"],
  [/\bthe revival\b/g, "the 2026 version of Ani"],
  [/\bThe revival\b/g, "The 2026 version of Ani"],
  [/\bWhich extensions\b/g, "Which new parts"],
  [/\bextensions\b/g, "new parts"],
  [/\bextension\b/g, "new part"],
  // a language model, Ken's notation and the film description
  [/\ba language model\b/g, "an AI"],
  [/\bA language model\b/g, "An AI"],
  [/\blanguage models?\b/g, "AI"],
  [/\bwrite Ken's notation itself\b/g, "write Ken's Lisp itself"],
  [/\bput it into Ken's notation\b/g, "turned it into words Ani can read"],
  [/\bin Ken's notation\b/g, "in words Ani can read"],
  [/\binto Ken's notation\b/g, "into words Ani can read"],
  [/\bKen's notation\b/g, "words Ani can read"],
  [/\bthe film description\b/g, "the story"],
  [/\bThe film description\b/g, "The story"],
  [/\ba film description\b/g, "a story"],
  [/\bfilm descriptions?\b/g, "story"],
  [/\bAnthropic API key\b/g, "Key for Claude (from a grown-up)"],
  [/\bOpenAI API key\b/g, "Key for ChatGPT (from a grown-up)"],
  [/\bGemini API key\b/g, "Key for Gemini (from a grown-up)"],
  [/\bAPI keys\b/g, "keys"],
  [/\bAPI key\b/g, "key"],
  [/\bthe model\b/g, "the AI"],
  [/\bThe model\b/g, "The AI"],
  [/\bTHE MODEL\b/g, "THE AI"],
  [/\bWhich model\b/g, "Which AI"],
  [/\ba model\b/g, "an AI"],
  [/\bNo model\b/g, "No AI"],
  // the glass box: what Ani noted while it planned
  [/\bthe glass box tells it\b/g, "Ani's notes tell it"],
  [/\bthe glass box (says|shows|gives)\b/g, (m, v) => `Ani's notes ${v.slice(0, -1)}`],
  [/\bthe glass box\b/g, "Ani's notes"],
  [/\bThe glass box\b/g, "Ani's notes"],
  [/\bglass boxes\b/g, "Ani's notes"],
  [/\bglass box\b/g, "Ani's notes"],
  // Ani's two passes, and frames
  [/\bPass ([12])\b/g, "Step $1"],
  [/\bpass ([12])\b/g, "step $1"],
  [/\bpass-1\b/g, "step-1"],
  [/\bframes a second\b/g, "pictures a second"],
  [/\bscene frames\b/g, "scene pictures"],
  [/\bFrames\b/g, "Pictures"],
  [/\bframes\b/g, "pictures"],
  [/\bFrame\b/g, "Picture"],
  [/\bframe\b/g, "picture"],
  // criticism: fixing a film
  [/\bRemake with this criticism\b/g, "Make it again with these fixes"],
  [/\bremade with criticism\b/g, "made again with fixes"],
  [/\bthis criticism\b/g, "these fixes"],
  [/\bthe criticism\b/g, "the fixes"],
  [/\byour criticism\b/g, "your fixes"],
  [/\bCriticism of this film\b/g, "Fixing this film"],
  [/\bCRITICISM OF THIS FILM\b/g, "FIXING THIS FILM"],
  [/\bcriticism\b/g, "fixes"],
  [/\bCriticism\b/g, "Fixes"],
  [/\bcriticizing\b/g, "fixing"],
  [/\bCriticize\b/g, "Fix something in"],
  [/\bcriticized\b/g, "fixed"],
  [/\bcriticize\b/g, "fix"],
  [/\bnot yet heeded\b/g, "not used yet"],
  [/\bheeded\b/g, "used"],
  [/\bheeding\b/g, "using"],
  [/\bheed\b/g, "use"],
  // what Ani was asked: establish and convey are "show"
  [/\bEstablish (that|what|how)\b/g, "Show $1"],
  [/\bConvey (that|what|how)\b/g, "Show $1"],
  [/\bto establish (that|what|how)\b/g, "to show $1"],
  [/\bto convey (that|what|how)\b/g, "to show $1"],
  [/\bconveying\b/g, "showing"],
  // Ken's program that draws the film, and seconds
  [/\bDirector stopped filming here\b/g, "The filming stopped here"],
  [/(\d) s\b/g, "$1 seconds"],
  [/(^|[^\d.])1 seconds\b/g, (m, a) => `${a}1 second`],
  // a few more of the page's own words
  [/\bWhich element\b/g, "Which part of how it moves"],
  [/^Calls go straight from this page to ([^,]+), with your key; it is kept only in this tab unless you tick “Remember”\.$/, "Your story goes straight from this page to $1, with the key. The key is kept only in this tab unless “Remember” is ticked."],
  [/^Model$/, "Which one"],
  [/\b(normal|fast|slow|changing) rhythm\b/g, "$1 pace"],
  [/\bVideos are WebM, at\b/g, "Videos are made at"],
  [/\bin Ken's own notation\b/g, "in Ken's own Lisp"],
  [/\bAs Ken's TV previews ran, and as the thesis's flipbook shows\b/g, "As Ken's quick TV previews ran"],
  [/, whatever Ani's own estimate$/, ", whatever Ani first planned"],
  [/\bis a word for personality\b/g, "is a word for what someone is like inside"],
  [/\bwhich he wrote and left commented out\b/g, "which he wrote and then left out"],
  [/, so that coming back from the code pages, or a reload, puts you back there\b/g, ", so that coming back to the page puts you back there"],
];
const everyday = (text) => EVERYDAY.reduce((t, [re, to]) => t.replace(re, to), text);
// what was changed, to put back at 12+: text nodes and attributes, each as it was
const EVERYDAY_WAS = new Map();
const EVERYDAY_SKIP = ".age-more, pre, code, textarea, script, style, .lisp, #gl-pop .note";
const EVERYDAY_ATTRS = ["title", "aria-label", "placeholder"];
function everydayNode(node) {
  if (node.nodeType === 3) {
    const el = node.parentElement;
    if (!el || el.closest(EVERYDAY_SKIP)) return;
    const to = everyday(node.nodeValue);
    if (to === node.nodeValue) return;
    if (!EVERYDAY_WAS.has(node)) EVERYDAY_WAS.set(node, node.nodeValue);
    node.nodeValue = to;
    return;
  }
  if (node.nodeType !== 1 || node.closest(EVERYDAY_SKIP)) return;
  for (const a of EVERYDAY_ATTRS) {
    const v = node.getAttribute(a);
    // (a title in Lisp, Ani's own record, stays as it is)
    if (!v || /^\(/.test(v)) continue;
    const to = everyday(v);
    if (to === v) continue;
    const was = EVERYDAY_WAS.get(node) || {};
    if (!(a in was)) was[a] = v;
    EVERYDAY_WAS.set(node, was);
    node.setAttribute(a, to);
  }
  for (const c of node.childNodes) everydayNode(c);
}
let everydayWatch = null;
function everydayWords() {
  if (simpleAge()) {
    everydayNode(document.body);
    if (!everydayWatch) {
      everydayWatch = new MutationObserver((records) => {
        for (const r of records) {
          if (r.type === "characterData") everydayNode(r.target);
          else if (r.type === "attributes") everydayNode(r.target);
          else for (const n of r.addedNodes) everydayNode(n);
        }
      });
      everydayWatch.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: EVERYDAY_ATTRS });
    }
    return;
  }
  if (everydayWatch) { everydayWatch.disconnect(); everydayWatch = null; }
  for (const [node, was] of EVERYDAY_WAS) {
    if (!node.isConnected) continue;
    if (node.nodeType === 3) node.nodeValue = was;
    else for (const [a, v] of Object.entries(was)) node.setAttribute(a, v);
  }
  EVERYDAY_WAS.clear();
}
// the age a link's hash names, if one of its parts is ages-...
function ageOfHash(parts) {
  for (const p of parts) { const m = /^ages-(6-11|6-8|9-11|12)$/.exec(p); if (m) return ageOf(m[1]); }
  return null;
}
// Bigger buttons and words at 6–11, a choice kept in this browser (BIG_KEY): what 6–8 had,
// now an option ("Bigger" beside the film's controls)
const BIG_KEY = "ani-cinderella:bigger:v1";
let BIG = store.get(BIG_KEY) === "1";
// The class on <html> the style sheet reads (age-6-11, and big for bigger buttons and
// words), and the control's pressed button.
function applyAge() {
  const html = document.documentElement;
  html.classList.toggle("age-6-11", AGE === "6-11");
  html.classList.toggle("big", simpleAge() && BIG);
  document.querySelectorAll("#ages [data-age]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.age === AGE)));
  const big = document.getElementById("bigger");
  if (big) big.setAttribute("aria-pressed", String(BIG));
  everydayWords();
}
document.getElementById("bigger").addEventListener("click", () => {
  BIG = !BIG;
  store.set(BIG_KEY, BIG ? "1" : "0");
  applyAge();
  if (typeof layout === "function") layout();
});
// Set the age: kept in this browser (unless remember is false), and the page drawn again at
// it; from a link, with a note that says so.
function setAge(age, { remember = true, link = false } = {}) {
  age = ageOf(age);
  if (!age) return;
  const changed = age !== AGE;
  AGE = age;
  if (remember) store.set(AGE_KEY, age);
  applyAge();
  const note = document.getElementById("age-note");
  if (note && link) {
    note.hidden = false;
    note.querySelector("span").textContent = `This link set the page for ${AGE_NAMES[age]}. A grown-up can change it at the top.`;
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
// "Film settings": frames a second, TV or color and Save, folded away at 6–11, beside the
// controls
document.querySelectorAll("[data-film-settings]").forEach((b) => b.addEventListener("click", () => {
  const on = document.documentElement.classList.toggle("film-settings");
  document.querySelectorAll("[data-film-settings]").forEach((x) => x.setAttribute("aria-expanded", String(on)));
}));
// "About this page", the footer's rest at 6–11
document.getElementById("about-page").addEventListener("click", (e) => {
  const on = document.documentElement.classList.toggle("footer-open");
  e.currentTarget.setAttribute("aria-expanded", String(on));
});
applyAge();

// ---------------------------------------------------------------- naming the characters

const SHAPE_WORDS = { star: "star", square: "square", triangle: "triangle", circle: "circle", pentagon: "five-sided shape", hexagon: "six-sided shape", octagon: "eight-sided shape", "eight-pointed-star": "star with eight points", "ten-pointed-star": "star with ten points" };
const shapeOfChar = (run, c) => (run && run.shapes && run.shapes[c]) || KEN_SHAPE[c] || "circle";
// A character as the page names it, and "Cinderella (star)" for a chip
const nameAt = (c) => who(c);

// The legend at 6–11: each character a button that opens it (a keyboard and screen
// reader's way to the panel, which the film's picture lacks), "Cinderella (star)".
function ageLegend(cast, runs) {
  const el = document.getElementById("legend");
  el.innerHTML = cast.map(([c, rs]) => {
    const run = rs[0], r = shown().find((k) => screenRun(k) === run) ?? 0;
    const label = `${meet(run.story, c).name} (${SHAPE_WORDS[shapeOfChar(run, c)] || shapeName(shapeOfChar(run, c))})`;
    return `<button type="button" class="chip" data-chip="${esc(c)}" data-slot="${r}">${icon(c, 16, run)}<span>${esc(cap(label))}</span></button>`;
  }).join("");
  el.querySelectorAll("[data-chip]").forEach((b) => b.addEventListener("click", () => {
    const r = Number(b.dataset.slot);
    if (ready(sceneOf(r))) select({ run: r, char: b.dataset.chip });
  }));
}

// ---------------------------------------------------------------- the simpler sentences (A2)

// At 6–11 the explanations are said from the same
// facts as the 12+ ones (captionFacts, wayFacts, longFacts, chainFacts, and the
// related-suggestions items Ani's record keeps), by templates here: never by shortening a
// 12+ sentence, and never by a language model. Each simple box ends in "More", which opens
// the 12+ text of the same moment, with its code citations and Ani's own records.
// Ani's words stay as the record has them. A word in the glossary (GLOSS) is a button that
// opens a popover with its meaning; the glossary holds only neutral words, and every other
// word of the record passes through as it is, unglossed.

// The glossary: each term as the page writes it, its meaning at 6–11, and Ani's own word.
const GLOSS = {
  dominates: { said: "dominates", means: "is in charge of someone, and makes them do things", ani: "dominates" },
  "is-obedient-to": { said: "is obedient to", means: "does what someone tells them to do", ani: "is-obedient-to" },
  "is-tolerant-of": { said: "is tolerant of", means: "puts up with someone, even when they are unkind", ani: "is-tolerant-of" },
  "is-polite-to": { said: "is polite to", means: "is careful to be nice to someone", ani: "is-polite-to" },
  "is-impolite-to": { said: "is impolite to", means: "is rude to someone", ani: "is-impolite-to" },
  "is-grateful-to": { said: "is grateful to", means: "is thankful for what someone did", ani: "is-grateful-to" },
  "is-protective-of": { said: "is protective of", means: "looks after someone and keeps them safe", ani: "is-protective-of" },
  "is-generous-towards": { said: "is generous towards", means: "gives a lot to someone, and is glad to", ani: "is-generous-towards" },
  "is-helpful-towards": { said: "is helpful towards", means: "helps someone", ani: "is-helpful-towards" },
  "hard-working": { said: "hard working", means: "does a lot of work, and does it well", ani: "hard-working" },
  shabby: { said: "shabby", means: "worn out and old, like clothes that have been worn a lot", ani: "shabby" },
  stubborn: { said: "stubborn", means: "won't change their mind", ani: "stubborn" },
  determined: { said: "determined", means: "keeps trying until they get what they want", ani: "determined" },
  brazen: { said: "brazen", means: "bold, and not at all shy", ani: "brazen" },
  magical: { said: "magical", means: "can do magic", ani: "magical" },
  graceful: { said: "graceful", means: "moves smoothly and beautifully", ani: "graceful" },
  "getting-it-on": { said: "“getting it on”", means: "Ken's 1978 phrase for two people falling for each other and being happy together", ani: "getting-it-on" },
  accompanys: { said: "accompanies", means: "goes along with someone", ani: "accompanys" },
  prevents: { said: "prevents", means: "stops something from happening", ani: "prevents" },
  undoes: { said: "undoes", means: "makes what happened before not count any more", ani: "undoes" },
  aware: { said: "becomes aware", means: "finds out", ani: "aware" },
};
// each term's place in a sentence the page wrote (escaped HTML), longest first
const GLOSS_TERMS = Object.entries(GLOSS).map(([key, g]) => [key, esc(g.said)]).sort((a, b) => b[1].length - a[1].length);
const GLOSS_RE = new RegExp(`(^|[^\\w-])(${GLOSS_TERMS.map(([, s]) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![\\w-])`, "g");
// Mark the glossary's terms in a sentence (HTML): in its text, never inside a tag, and each
// term once a sentence.
function glossed(html) {
  const seen = new Set();
  return String(html).split(/(<[^>]*>)/).map((part, n, all) => {
    if (part.startsWith("<")) return part;
    // not inside a button or a link already
    const before = all.slice(0, n).join("");
    if ((before.match(/<(button|a)\b/g) || []).length > (before.match(/<\/(button|a)>/g) || []).length) return part;
    return part.replace(GLOSS_RE, (m, lead, term) => {
      const key = (GLOSS_TERMS.find(([, s]) => s === term) || [])[0];
      if (!key || seen.has(key)) return m;
      seen.add(key);
      return `${lead}<button type="button" class="gl" data-gl="${key}" aria-expanded="false">${term}</button>`;
    });
  }).join("");
}
// The popover: one for the page, opened by a term's button (click, tap or Enter), closed by
// Escape, by the button again, or by a click elsewhere; its text is tied to the button
// (aria-describedby).
function glossPopover() {
  let pop = document.getElementById("gl-pop");
  if (!pop) {
    pop = document.createElement("div");
    pop.id = "gl-pop";
    pop.className = "gl-pop";
    pop.setAttribute("role", "note");
    pop.hidden = true;
    document.body.append(pop);
  }
  return pop;
}
let glossOpen = null;
function closeGloss({ focus = false } = {}) {
  const pop = document.getElementById("gl-pop");
  if (pop) pop.hidden = true;
  if (glossOpen) {
    glossOpen.setAttribute("aria-expanded", "false");
    glossOpen.removeAttribute("aria-describedby");
    if (focus && glossOpen.isConnected) glossOpen.focus();
  }
  glossOpen = null;
}
function openGloss(b) {
  const g = GLOSS[b.dataset.gl];
  if (!g) return;
  if (glossOpen === b) { closeGloss(); return; }
  closeGloss();
  const pop = glossPopover();
  const fromStory = R && typeof R.cindy === "string" && new RegExp(`(^|[\\s(])${g.ani.replace(/[-]/g, "\\-")}([\\s)]|$)`).test(R.cindy);
  pop.innerHTML = `<p><b>${esc(g.said)}</b>: ${esc(g.means)}.</p><p class="note">Ani's word: “${esc(g.ani)}”${fromStory ? ". It is in the story Ani was told." : "."}</p>${speechAvailable() ? `<button type="button" class="linkish" data-read-text="${esc(`${g.said}: ${g.means}.`)}">Read this</button>` : ""}`;
  pop.hidden = false;
  const r = b.getBoundingClientRect();
  const w = Math.min(320, window.innerWidth - 24);
  pop.style.width = `${w}px`;
  pop.style.left = `${Math.max(12, Math.min(window.innerWidth - w - 12, r.left + window.scrollX))}px`;
  pop.style.top = `${r.bottom + window.scrollY + 6}px`;
  b.setAttribute("aria-expanded", "true");
  b.setAttribute("aria-describedby", "gl-pop");
  glossOpen = b;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest("[data-gl]");
  if (b) { e.preventDefault(); openGloss(b); return; }
  if (glossOpen && !(e.target.closest && e.target.closest("#gl-pop"))) closeGloss();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && glossOpen) { e.stopPropagation(); closeGloss({ focus: true }); } }, true);
// (speechAvailable is app/film/speech.js's; the glossary works without it)
const speechAvailable = () => typeof speechSupported === "function" && speechSupported();

// ---- the facts the simple sentences add: the words a way of showing came from

// The words of the story whose suggestion a convey task's way was (wayFromWords): the related-suggestions
// items of the task it was made for (its source), whose main suggestion's way is this
// task's, with the others Ken's find-related-suggestions took as the same (relationship
// identical). [] when the record names none.
function wayFromWords(t) {
  if (!t || !t.source || t.source === "initial-description") return [];
  const up = taskByName(t.source);
  if (!up || !up.actor || !up.actor.items) return [];
  const want = show(t.description);
  const out = [];
  for (const item of up.actor.items) {
    const x = parse(item);
    if (!Array.isArray(x) || x[0] !== "related-suggestions:") continue;
    const main = kv(x, "main-suggestion");
    const value = kv(kv(main, "value"), "value");
    if (show(value) !== want) continue;
    for (const s of [main, ...lispList(kv(x, "others"))]) { const w = kv(s, "source"); if (typeof w === "string" && !out.includes(w)) out.push(w); }
  }
  return out;
}

// ---- captions

// "to show that ...", or "to show what she is like: ...", from the top of the way's chain:
// what the story asked for, and (for what a character is like) the words the way came from
function simplePurpose(t, top) {
  const d = top.description;
  if (Array.isArray(d) && d[0] === "personality") {
    const src = t === top ? [] : wayFromWords(t);
    return src.length ? `to show what ${who(d[1])} is like: ${esc(words(src.map(plain)))}` : `to show what ${who(d[1])} is like`;
  }
  const a = about(d);
  return /^(what|how) /.test(a) ? `to show ${a}` : `to show that ${a}`;
}
// A caption at 6–11: the scene and its title; each way of showing and what it is for; the
// changes of feeling; and the 12+ caption's other lines as they are.
function ageCaption(run, i, f, full) {
  const sc = run.scenes[i];
  const facts = captionFacts(sc, f);
  if (!facts) return full;
  const shows = facts.ways.map(({ kind, t, m, top }) => (kind === "change" ? changeShowLine(sc, t, m) : `${cap(methodText(m))}, ${simplePurpose(t, top)}.`));
  const more = [];
  const feelers = [...new Set(facts.changes.map((t) => (Array.isArray(t.description) ? t.description[1] : null)).filter(Boolean))];
  const feel = facts.changes.map((t) => about(t.description));
  if (feel.length) more.push(`${shows.length ? "Meanwhile" : "Here"} Ani changes how ${who(feelers)} ${feelers.length === 1 ? agree(meet(run.story, feelers[0]), "moves", "move") : "move"}, to show that ${feel.join(" and that ")}.`);
  if (facts.wanderers.length) more.push(`${cap(who(facts.wanderers))} ${facts.wanderers.length > 1 ? "wander" : agree(meet(run.story, facts.wanderers[0]), "wanders", "wander")} about, so that the change of feeling is seen.`);
  // the 12+ caption's other lines (a change shown, colors), as they are, but for the notes of
  // the revival's corrections and details (SLIPS, DETAIL, FIT), which say how Ken's code was
  // mended, in its own words: they stay in the 12+ caption
  more.push(...full.more.filter((x) => !/^(Meanwhile|Here) Ani changes how they move, /.test(x) && !/ about while the change runs, so that it is seen/.test(x) && !/\b(SLIPS|DETAIL|FIT)\b|the revival's (correction|rule)/.test(x)));
  return { part: `Scene ${i + 1} · ${esc(sc.title)}`, text: glossed(shows.join(" ")) || (feel.length ? "" : full.text), more: more.map(glossed) };
}

// ---- a character's panel

const SIMPLE_KINDS = { strength: "how strongly it was suggested", prerequisite: "what it needs being ready", "best-when": "suiting these two best", "time-fit": "fitting the time", originality: "not being used yet", variety: "making the film more varied" };
const oneDecimal = (n) => `${Number(n).toFixed(1).replace(/\.0$/, "")} second${Number(Number(n).toFixed(1)) === 1 ? "" : "s"}`;
// a reason a way was set aside, at 6–11
function simpleReject(r) {
  const critic = critReject(r);
  if (critic) return critic.replace(/^vetoed by you/, "you said no to it");
  if (Array.isArray(r) && r[0] === "too-much-time:") {
    const d = Number(kv(r, "ideal-difference"));
    return `it would end ${oneDecimal(Math.abs(d))} too ${d < 0 ? "soon" : "late"}`;
  }
  if (r === "no-idea-how-to-convey-method") return "Ani had no way to show it";
  return noCitations(rejectText(r));
}
// a sentence without its links to Ken's code (kept in the 12+ view, under More)
const noCitations = (html) => String(html).replace(/\s*\(?<a\b[^>]*>[^<]*<\/a>\)?/g, "").replace(/\s*\([a-z0-9]+\.\d+:[\d, –-]+\)/g, "").replace(/\s*\(\s*\)/g, "");
// Why this way, at 6–11, from wayFacts
function simpleWay(t, method) {
  const x = wayFacts(t, method);
  const out = [];
  if (x.kind === "only") out.push("Ani knew only one way to show this.");
  else if (x.kind === "weighed") out.push(`Ani thought of ${x.weighed} ways, and this one scored best${x.better.length ? `, on ${words(x.better.map((b) => SIMPLE_KINDS[b.kind] || plain(b.kind)))}` : ""}. The other was ${wayQ(x.other)}.`);
  else out.push("This was the way Ani's suggestions offered.");
  for (const r of x.setAside) out.push(`Ani set aside ${wayQ(r.way)}: ${simpleReject(r.reason)}.`);
  return out.join(" ");
}
// Why so long, at 6–11, from longFacts: how long it lasts, what stops it, Ken's repeat, the
// scene's length in the story, and a stretch to fill its part
function simpleLong(run, sc, w, a, char, f) {
  const k = meet(run.story, char);
  const x = longFacts(sc, w, a, f);
  const out = [];
  if (x.r) {
    const stops = stopWords(a.stops, k, char).map((s) => s.replace(/(\d+(?:\.\d+)?) s\b/g, (m, d) => oneDecimal(d)));
    out.push(`${x.r.begin === x.r.end ? "This step takes no time" : `This step lasts ${oneDecimal(x.seconds)}`}${stops.length ? `. It stops ${orWords(stops)}` : ""}.`);
  }
  if (a.repeated) out.push(`Ken's plan does it ${a.repeated} times.`);
  const st = run.story.scenes[sc.id];
  const length = st && st.settings && st.settings.length;
  if (length && typeof length === "string") out.push(`${kenScene(run, sc.id) ? "Ken's story" : "The story"} asks for a ${esc(plain(length))} scene.`);
  if (x.part && x.part.stretchedBy && x.part.stretchedBy > 1.005 && !x.part.parasiteOn) out.push("Ani stretched it to fill its part.");
  return out.join(" ");
}
// Who decided, as a ladder: what the story says, what Ani knows that links it to the way,
// and the way Ani chose
function simpleLadder(t, method) {
  const chain = chainFacts(t);
  const top = chain[chain.length - 1].t;
  const d = top.description;
  const says = Array.isArray(d) && d[0] === "personality" ? `${who(d[1])} is ${esc(traitsOf(d[1]))}` : about(d);
  const steps = [`<li><b>The story says</b> ${says}.</li>`];
  // each link below the top: the words its suggestion came from
  for (let n = chain.length - 2; n >= 0; n--) {
    const { t: x } = chain[n];
    const src = wayFromWords(x);
    const k = knowOfTask(x);
    const theirs = k ? " (from the revival's added knowledge)" : "";
    steps.push(`<li><b>Ani knows</b>${theirs} ${src.length ? `that ${words(src.map((w) => `“${esc(plain(w))}”`))} can be shown by ${n === 0 ? "this way" : `showing that ${about(x.description)}`}` : n === 0 ? "a way to show this" : `that it can be shown by showing that ${about(x.description)}`}.</li>`);
  }
  steps.push(`<li><b>So Ani chose</b> this: ${methodText(method)}.</li>`);
  return `<ol class="ladder">${steps.join("")}</ol>`;
}
// a speaker button that reads the box it is in (app/film/speech.js), where the browser speaks
const readButton = () => (speechAvailable() ? `<button type="button" class="linkish read-this" data-read-box aria-label="Read this aloud">Read this</button>` : "");
// The panel of a character at 6–11: the heading, what the character is doing, why this
// way, why so long and who decided (closed), each simple, with the criticism buttons; then
// "More about Ani's choices", the 12+ panel of the same moment.
function agePanel(x) {
  const { s, f, char, k, act, between, main } = x;
  const fps = fpsOf(s);
  const name = k.name;
  const head = `<div class="side-head"><div class="who">${icon(char, 22)}<h2>${esc(cap(name))}</h2></div><button type="button" class="linkish" id="back-to-story">Back</button></div>
    <p class="where">${state.view === "both" || R !== RUNS[0] ? `${esc(R.label)} · ` : ""}${esc(s.title)} · ${(f / fps).toFixed(1)} seconds in</p>`;
  let lead = "", why = "";
  if (!act) lead = x.lead;
  else if (between) lead = `<p class="lead">${esc(cap(k.the))} is between two steps of Ani's plan.</p>`;
  else {
    const label = SEEN_ACTIVITIES.includes(act.base) ? seenLabel(act, char) : esc(ACTIVITY[act.base] || plain(act.base));
    const with_ = act.chars.filter((c) => c !== char);
    lead = `<p class="lead">${esc(cap(k.the))} is ${label}${with_.length ? ` (with ${esc(who(with_))})` : ""}.</p>`;
    const w = whyOf(R, s);
    const a = w && w.activities.find((y) => y.plan === act.name);
    const t = taskOfActivity(act);
    if (a && (a.by === "REVIVE;SEEN" || a.activity === "wander-around")) {
      why = `<div class="age-box"><p><span class="label">Why this way</span> Ani has ${esc(k.the)} wander about, so that the change of feeling is seen (the revival's repair). ${readButton()}</p></div>`;
    } else if (a && t) {
      const method = parse(a.method || "nil");
      const way = simpleWay(t, method);
      const long = simpleLong(R, s, w, a, char, f);
      why = `<div class="age-box">
        <p><span class="label">Why this way</span> ${glossed(way)} ${readButton()}${noCitations(critWayButtons(R, s, t, method))}</p>
        ${long ? `<p><span class="label">Why so long</span> ${long} ${readButton()}${noCitations(critPaceButtons(R, s, w, w.parts.find((p) => p.name === a.subscene)))}</p>` : ""}
        <details class="who-decided"><summary>Who decided</summary><div class="body">${glossed(simpleLadder(t, method))}${readButton()}</div></details>
      </div>`;
    }
  }
  const still = simpleStill(R, s, f);
  const more = `<details class="age-more"><summary>More about Ani's choices</summary><div class="body">${x.where}${x.lead}${x.still}${x.whyBox}${x.more}</div></details>`;
  return head + x.crit + glossed(lead) + still + why + x.here + more;
}
// Where no one moves, at 6–11: for how long, with why under More (the 12+ box)
function simpleStill(run, sc, f) {
  const w = whyOf(run, sc);
  const s = w && w.stills.find((x) => f > x.from && f <= x.to);
  if (!s) return "";
  return `<div class="still-box"><p>No one moves for ${oneDecimal(s.seconds)}. ${readButton()}</p></div>`;
}

// ---- what Ani was told

// The story's characters at 6–11, a sentence or two each, and how they feel about each
// other, with the glossary; the words as the page shows them today are under More.
function ageStoryPeople(run, people) {
  const lines = run.cast.map((c) => {
    const k = run.story.characters[c];
    if (!k) return "";
    const m = meet(run.story, c);
    const list = (ws) => esc(words(ws.map(plain)));
    const parts = [];
    if (k.personality.length) parts.push(`${esc(m.name)} is ${list(k.personality)}.`);
    if (k.physical.length) parts.push(`${esc(cap(m.she))} ${agree(m, "is", "are")} ${list(k.physical)}.`);
    if (k.movement.length) parts.push(`${esc(cap(m.she))} ${agree(m, "moves", "move")} in a way that is ${list(k.movement)}.`);
    if (!parts.length) parts.push(`Ani was told nothing about what ${esc(m.the)} is like.`);
    return `<li>${icon(c)} ${glossed(parts.join(" "))}</li>`;
  }).join("");
  return `<div class="age-story"><p class="label">Who is in the story</p><ul class="age-people">${lines}</ul>${readButton()}
    <details class="age-more"><summary>More: the words Ani was told</summary><div class="body"><div class="people">${people}</div></div></details></div>`;
}

// ---- for a screen reader (A7)

// "On the screen now: the stepmother and Cinderella", a line read by a screen reader when
// who is on the stage changes (the film's picture says nothing to one); at 6–11.
function ageOnScreen(sc, f) {
  const el = document.getElementById("on-screen");
  const fr = sc && sc.film && sc.film.frames[f];
  if (!el || !fr) return;
  const here = Object.keys(fr.chars || {}).filter((c) => R && R.cast && R.cast.includes(c));
  const text = here.length ? `On the screen now: ${here.map((c) => nameAt(c)).join(", ").replace(/, ([^,]*)$/, " and $1")}.` : "No one is on the screen now.";
  if (el.textContent !== text) el.textContent = text;
}
