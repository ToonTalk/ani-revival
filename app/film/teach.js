// ---------------------------------------------------------------- Teach Ani

// A learner adds to Ani's knowledge (REVIVE;TEACH; reports/chapter-x/design-teaching.md,
// its sections 3 to 9 and 12; what the Lisp and the pipeline do, and what the page needs, is
// reports/ext/teach/README.md, "For the page"), after Ken's note on his 1977 paper, "Three
// Interactions between AI and Education" (Machine Intelligence 8, p. 428): "the child, with
// the help of the system, will be able to define new characters for the stories, change
// the system's vocabulary, add a reasonable default course of action and so on", and
// AI-TR-540: "a student of animation could learn much by observing the effects of altering
// Ani's knowledge and rules" (pp. 149-150).
//   - "Teach Ani", beside "Change the story", and "+ teach Ani a word" at the end of the
//     editor's word lists: the panel. Its default view is short: a sentence, the open
//     notebook's pieces in plain words, and "+ Teach Ani…" with the kinds in order of ease;
//     each kind's form has menus from Ani's live vocabulary (the film's extensions), Ken's
//     own entry beside it as an example, the "because" required, Ken's legitimacy rule as
//     a question, and the Lisp it becomes (src/teach.js notebookToLisp), each part
//     explained, a click away.
//   - Ani's check: src/teach.js checkNotebook on the page as the learner types, and "Check
//     with Ani", the trial job (src/pipeline.js checkKnowledge) in a worker of its own,
//     its refusals and warnings in plain words, with how Ken's spreading of links reached
//     further; "Try it on a little story" (src/pipeline.js rehearse), on demand.
//   - "Your knowledge": the notebooks, kept in this browser beside "Your films"
//     (app/film/library.js), up to four used at once, renamed, deleted, saved as an
//     .ani-knowledge.json file (the notebook, with its Lisp beside it for reading without
//     the page) and opened from one (a file picker, or dropped on the page).
//   - "Make it with my knowledge": the film again (src/pipeline.js makeFilmSteps with the
//     notebooks, TEACH and MEND added to every job), with the same extensions and frames a
//     second, then the two side by side with "What your knowledge did" (src/pipeline.js
//     knowledgeChanges and yourKnowledgeDid, the page's copies: AniTeach): pass 1's choices
//     that changed, each scene's frames and tasks, and every piece won, combined, lost to
//     another, or never reached, and why.
//   - The glass box: "your knowledge: <because>" badges (yoursIndex, shaped as DATA.know)
//     on a suggestion, a way of showing or a feeling that came from it, and "What your
//     knowledge did here".
//   - The design's examples, one click away ("Try teaching"), with the frames
//     tools/check-teach.mjs's goldens have; and "About teaching Ani".
// Nothing about a notebook is sent anywhere, and with no notebook used nothing changes: no
// film is made with TEACH, and the prompts are as they were.

const KAHN_1977_URL = "https://drive.google.com/file/d/1_C_ZzwWCpTOa3Zp8UHAKFuVUA2JxeSSX/view";
const kahn1977 = () => `Ken's “Three Interactions between AI and Education” (1977, <i>Machine Intelligence 8</i>, p. 428; <a href="${KAHN_1977_URL}" target="_blank" rel="noopener">Ken's copy</a>)`;
// the page's state: the notebook open, the form being filled in, what Ani's check and its
// rehearsals said, the example being tried
const teachUi = { open: null, form: null, note: "", check: null, checking: false, rehearsals: {}, example: null, highlight: null, renaming: null, confirm: null };
const TEACH_KINDS = [
  ["word", "A word like another"],
  ["suggests", "What a word suggests"],
  ["relationship", "A relationship"],
  ["way", "Another way of showing a verb"],
  ["feeling", "A feeling"],
  ["verb", "A verb as a kind of another"],
];
const TYPE_WORDS = { personality: "what a character is like inside (personality)", physical: "how it looks (physical)", movement: "how it moves (movement)" };
const STRENGTH_WORDS = { low: "weakly", medium: "medium strongly", high: "strongly" };

// ---- notebooks

// A notebook as the file format has it (src/teach.js): what the pipeline and the checks read.
const notebookOf = (rec) => ({ format: AniTeach.NOTEBOOK_FORMAT, version: AniTeach.NOTEBOOK_VERSION, title: rec.title, made: rec.made, ...(rec.changed ? { changed: rec.changed } : {}), pieces: rec.pieces.map((p) => ({ ...p })) });
const usedNotebooks = () => TEACHING.notebooks.filter((n) => n.used).slice(0, AniTeach.MAX_NOTEBOOKS);
const openNotebook = () => TEACHING.notebooks.find((n) => n.id === teachUi.open) || null;
const notebookNamed = (title) => TEACHING.notebooks.find((n) => n.title === title) || null;
function newNotebookRecord(title = null, pieces = []) {
  const n = TEACHING.notebooks.length + 1;
  const taken = new Set(TEACHING.notebooks.map((x) => x.title));
  let t = title || "My knowledge";
  for (let k = 2; taken.has(t); k++) t = `${title || "My knowledge"} (${k})`;
  return { id: `k${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, title: t, made: new Date().toISOString(), pieces, used: usedNotebooks().length < AniTeach.MAX_NOTEBOOKS && n >= 1 };
}
// the notebook a first piece will go into, before there is one
const draftNotebook = () => ({ id: null, title: "My knowledge", made: new Date().toISOString(), pieces: [] });
async function saveNotebook(rec) {
  rec.changed = new Date().toISOString();
  await keepNotebook(rec);
  teachChanged();
}
// After the notebooks changed: the editor's words, and the panels that show them.
function teachChanged() {
  WORDS = vocabularyFor(modeExtensions());
  if (state.panel === "teach") renderSide();
  else if (state.panel === "edit") refreshEditor();
}
async function startTeaching() {
  await library.ready;
  TEACHING.notebooks = await loadNotebooks();
  TEACHING.loaded = true;
  if (!teachUi.open && TEACHING.notebooks.length) teachUi.open = TEACHING.notebooks[0].id;
  teachChanged();
}

// ---- the film it is taught for

// The film "Make it with my knowledge" makes again: your version, if there is one made (or
// stopped with a scene to watch), else Ken's 1978 film; its extensions are the menus'.
function teachBase() {
  const cur = RUNS[1];
  if (cur && !(cur.status && cur.status.running) && cur.scenes.some(ready) && !(cur.knowledge && cur.knowledge.length)) return cur;
  if (cur && cur.teachFrom) { const b = teachBeforeOf(cur); if (b) return b; }
  return RUNS[0];
}
const teachExtensions = () => runExtensions(teachBase());
// the extensions a job with knowledge loads: the film's, with TEACH and MEND (which it needs)
const teachLoaded = (ext = teachExtensions()) => withRequired([...ext, "teach"]);
const teachOn = (id, ext = teachExtensions()) => teachLoaded(ext).includes(id);
// Ani's own words with these extensions (not the learner's), for the menus and the checks
const aniWords = (ext = teachExtensions()) => aniVocabulary(ext);
const teachCast = () => (teachBase().cast || []).slice();
// The page's own checks of a notebook (src/teach.js checkNotebook), with the notebooks used
// before it (those ticked, in order, but this one).
function pageCheck(rec, { pieces = rec.pieces, ext = teachExtensions() } = {}) {
  const others = usedNotebooks().filter((n) => n.id !== rec.id).map(notebookOf);
  return AniTeach.checkNotebook({ ...notebookOf(rec), pieces }, { extensions: teachLoaded(ext), vocabulary: aniWords(ext), taken: namesTaken(teachLoaded(ext)), others, characters: teachCast() });
}

// ---- the menus

// Words Ani knows of a type (personality, physical, movement, or relationship), and the
// learner's own of it (in the notebook open and those used), the learner's first.
function wordsOfType(type, ext = teachExtensions()) {
  const W = aniWords(ext);
  const ani = Object.keys(W).filter((w) => (W[w].kind || W[w].kindByRelation) === type && !/-descriptor$/.test(w)).sort();
  const mine = [];
  for (const rec of [openNotebook(), ...usedNotebooks()].filter(Boolean)) for (const p of rec.pieces) {
    const t = p.kind === "word" ? p.type : p.kind === "relationship" ? "relationship" : null;
    if (t === type && !mine.includes(p.word)) mine.push(p.word);
  }
  return { mine, ani: ani.filter((w) => !mine.includes(w)) };
}
const optionsOf = (list, value, label = (x) => plain(x)) => list.map((x) => `<option value="${esc(x)}"${x === value ? " selected" : ""}>${esc(label(x))}</option>`).join("");
function wordSelect(field, type, value, { blank = null, types = null } = {}) {
  const groups = (types || [type]).map((t) => wordsOfType(t));
  const mine = [...new Set(groups.flatMap((g) => g.mine))], ani = [...new Set(groups.flatMap((g) => g.ani))].sort();
  return `<select data-tf="${field}" aria-label="A word">${blank !== null ? `<option value="">${esc(blank)}</option>` : ""}${mine.length ? `<optgroup label="Your words">${optionsOf(mine, value)}</optgroup>` : ""}<optgroup label="Ani's words">${optionsOf(ani, value)}</optgroup></select>`;
}
// The verbs a word may be shown by, and the ways a verb may also be shown by, with these
// extensions: those that need one that is off are left out, and said so.
const verbsOn = (ext) => Object.keys(AniTeach.VERBS).filter((v) => !AniTeach.VERBS[v].needs || teachOn(AniTeach.VERBS[v].needs, ext));
const waysOn = (ext) => Object.keys(AniTeach.WAYS).filter((w) => !AniTeach.WAYS[w].needs || teachOn(AniTeach.WAYS[w].needs, ext));
const verbWords = (v) => (AniTeach.VERBS[v] ? AniTeach.VERBS[v].words : plain(v));
function myVerbs() {
  const out = [];
  for (const rec of [openNotebook(), ...usedNotebooks()].filter(Boolean)) for (const p of rec.pieces) if (p.kind === "verb" && !out.includes(p.word)) out.push(p.word);
  return out;
}
function needsNote(ext) {
  const off = [];
  if (!teachOn("know", ext)) off.push("following, helping and keeping away, and the revival's words, need the revival's knowledge (KNOW)");
  if (!teachOn("appear", ext)) off.push("how a word looks needs Ani choosing how its characters look (APPEAR)");
  return off.length ? `<p class="note">With this film's extensions (${esc(ext.length ? extensionsName(ext) : "Ani as in 1978")}), ${esc(words(off))}: make a film with them first to teach those.</p>` : "";
}
const elementNoun = (el) => (AniTeach.MOVEMENT_ELEMENTS[el] || AniTeach.LOOK_ELEMENTS[el] || {}).noun || plain(el);
const elementLabel = (el) => (AniTeach.MOVEMENT_ELEMENTS[el] || AniTeach.LOOK_ELEMENTS[el] || { words: plain(el) }).words;
function valueLabel(el, v) {
  const m = /^\((positive|negative) (low|medium|high)\)$/.exec(v);
  if (m) return `${m[1] === "positive" ? "drawn to them" : "kept away from them"}, ${({ low: "a little", medium: "somewhat", high: "strongly" })[m[2]]}`;
  const not = /^\(not ([a-z ]+)\)$/.exec(v);
  return not ? `not ${words(not[1].split(" ").map(plain)).replace(/ and /, " or ")}` : plain(v);
}

// ---- Ken's own entries, as examples beside each form

function kenExample(form) {
  const ken = (DATA.teach && DATA.teach.ken) || {};
  const know = teachOn("know");
  const f = form.f;
  const line = (who, text, at) => `<p class="ken-example"><span class="label-inline">${who}</span> ${text}${at ? ` <span class="was">(${esc(at)})</span>` : ""}</p>`;
  const lines = [];
  switch (form.kind) {
    case "word":
      lines.push(line("Ken:", "“industrious” means much the same as “hard-working”, and “lazy” is the opposite of it.", "dscrp.17:276-277"));
      if (know) lines.push(line("The revival:", "“timid” means much the same as “shy” <span class=\"ours-tag\">the revival's</span>", "REVIVE;KNOWDS"));
      break;
    case "suggests":
      if (f.what === "looks") {
        lines.push(line("The thesis:", "“bad guys wear black”, so an evil character is dark.", "AI-TR-540, p. 161"));
        lines.push(line("The revival:", "a shy character is small, as it keeps small and takes up little room <span class=\"ours-tag\">the revival's</span>", "REVIVE;APSUG"));
      } else if (f.what === "shows") {
        lines.push(line("Ken:", "a mean character shows it by chasing an enemy, medium strongly, or by hurting one, strongly.", "dscrp.17:252-267"));
      } else {
        const k = ken.suggests && ken.suggests[f.element];
        if (k) lines.push(line("Ken:", esc(AniTeach.pieceWords({ kind: "suggests", word: k.word, element: f.element, value: k.value, strength: k.strength }).replace(/^A /, "a ").replace(/\.$/, "")) + ".", `dscrp.17:${k.line}`));
        else lines.push(line("Ken:", "a shy character's speed is low, weakly.", "dscrp.17:64"));
        if (AniTeach.MOVEMENT_ELEMENTS[f.element] && ["acceleration", "deliberateness"].includes(f.element) || /^attraction-/.test(f.element || "")) lines.push(`<p class="note">Ani chooses this, but in 1978 nothing that draws the film reads it, so the film won't show it${teachOn("detail") ? " (with DETAIL it is read)" : ""}.</p>`);
      }
      break;
    case "relationship":
      lines.push(line("Ken:", "one who hates another shows it by keeping away from it, medium strongly, best when it is not in charge; one who dominates another moves faster than the other, medium strongly.", "relate.22:39-63"));
      if (know) lines.push(line("The revival:", "one who fears another keeps away from it, strongly <span class=\"ours-tag\">the revival's</span>", "REVIVE;KNOWRL"));
      lines.push(`<p class="note">For one of Ken's words with no way of showing (is polite to, is tolerant of), Ken decided Ani “could show them only by gestures [it doesn't] have” (his decision 10). If you disagree, give one a way here, and see.</p>`);
      break;
    case "way":
      lines.push(line("Ken:", "CONVEY shows chasing, hurting, pushing around and going along with each by a way of its own; of helping it says “for now don't have an suggestions as to how to convey this”.", "convey.64:65-127"));
      break;
    case "feeling":
      lines.push(line("Ken:", "joy makes a character's speed, how active it is, how rhythmic it is and how quickly it gets going go up, by as much as the joy, and a great joy changes its paths too.", "emote.9:11-48"));
      if (know) lines.push(line("The revival:", "pride, and anger <span class=\"ours-tag\">the revival's</span>", "REVIVE;KNOWEM"));
      break;
    case "verb":
      lines.push(line("Ken:", "pushing is a kind of meeting (“gota meet in order to push”), and so is hurting (“gotta meet before you can hurt”).", "convey.64:82, 91"));
      break;
  }
  return lines.join("");
}

// ---- the forms

// A form's first values: a kind, and what the learner brought (a word from the editor, a
// verb from criticism, a reason).
function newForm(kind, given = {}) {
  const ext = teachExtensions();
  const f = { because: "", strength: "medium", ...given };
  if (kind === "word") Object.assign(f, { word: f.word || "", type: f.type || "personality", rel: f.rel || "like", link: f.link || "" });
  if (kind === "suggests") {
    Object.assign(f, { what: f.what || "moves", word: f.word || "", element: f.element || "speed", value: f.value || "low" });
    if (f.what === "looks" && !teachOn("appear", ext)) f.what = "moves";
    f.verb ||= verbsOn(ext)[0];
    f.who ||= "enemy";
  }
  if (kind === "relationship") Object.assign(f, { word: f.word || "", type: f.type || "affection", rel: f.rel || "none", link: "", verb: f.verb || "", bestWhen: "always", showStrength: "medium", relElement: "", comparison: "greater-than", relStrength: "low" });
  if (kind === "way") Object.assign(f, { verb: f.verb || "helps", way: f.way || "goes-to-and-accompanys", first: f.first || 1 });
  if (kind === "feeling") Object.assign(f, { word: f.word || "", rows: f.rows || [{ element: "speed", change: "down" }] });
  if (kind === "verb") Object.assign(f, { word: f.word || "", kindOf: f.kindOf || "chases", showAs: "parent" });
  return { kind, f };
}
// The pieces a form makes (src/teach.js's kinds), with ids after the notebook's.
function formPieces(form, rec) {
  const f = form.f, because = String(f.because || "").replace(/\s+/g, " ").trim();
  const word = String(f.word || "").trim().toLowerCase().replace(/\s+/g, "-");
  let k = 1 + Math.max(0, ...((rec && rec.pieces) || []).map((p) => Number(String(p.id).slice(1)) || 0));
  const id = () => `k${k++}`;
  switch (form.kind) {
    case "word": return [{ id: id(), kind: "word", word, type: f.type, ...(f.rel === "like" && f.link ? { like: f.link } : f.rel === "opposite" && f.link ? { opposite: f.link } : {}), because }];
    case "suggests":
      if (f.what === "looks") return [{ id: id(), kind: "looks", word, element: f.element, value: f.value, strength: f.strength, because }];
      if (f.what === "shows") return [{ id: id(), kind: "shows", word, verb: f.verb, who: f.who, strength: f.strength, because }];
      return [{ id: id(), kind: "suggests", word, element: f.element, value: f.value, strength: f.strength, because }];
    case "relationship": {
      const known = aniWords()[word] && (aniWords()[word].kind || aniWords()[word].kindByRelation) === "relationship";
      const out = known ? [] : [{ id: id(), kind: "relationship", word, type: f.type, ...(f.rel === "like" && f.link ? { like: f.link } : f.rel === "opposite" && f.link ? { opposite: f.link } : {}), because }];
      if (f.verb) out.push({ id: id(), kind: "relationship-shows", word, verb: f.verb, strength: f.showStrength, bestWhen: f.bestWhen, because });
      if (f.relElement) out.push({ id: id(), kind: "relationship-suggests", word, element: f.relElement, comparison: f.comparison, strength: f.relStrength, because });
      return out;
    }
    case "way": return [{ id: id(), kind: "way", verb: f.verb, way: f.way, first: Number(f.first) || 1, strength: f.strength, because }];
    case "feeling": return [{ id: id(), kind: "feeling", word, changes: f.rows.map((r) => ({ element: r.element, change: r.change, strength: f.strength })), because }];
    case "verb": return [{ id: id(), kind: "verb", word, kindOf: f.kindOf, showAs: f.showAs, because }];
  }
  return [];
}
const sel = (field, list, value, label, aria) => `<select data-tf="${field}" aria-label="${esc(aria || field)}">${optionsOf(list, value, label)}</select>`;
const strengthSel = (field, value) => sel(field, AniTeach.STRENGTHS, value, (s) => s, "How strongly");
function formFields(form) {
  const f = form.f, ext = teachExtensions();
  const W = aniWords(ext);
  const wordInput = (ph) => `<input type="text" data-tf="word" value="${esc(f.word || "")}" placeholder="${esc(ph)}" maxlength="30" spellcheck="false" autocapitalize="off" aria-label="The word">`;
  switch (form.kind) {
    case "word": {
      const type = f.type;
      const known = f.word && W[f.word] ? W[f.word] : null;
      return `<p class="teach-row">Teach Ani a new word: ${wordInput("grumpy")}</p>
        ${known ? `<p class="note teach-known">Ani already knows “${esc(plain(f.word))}”${relationNoteIn(W, f.word) ? `: ${esc(relationNoteIn(W, f.word))}` : ""}. <button type="button" class="linkish" data-teach-switch="suggests">Add to Ani's word instead</button> (teaching it again would replace it, and lose what Ani knows of it).</p>` : ""}
        <p class="teach-row">It tells ${sel("type", Object.keys(AniTeach.WORD_TYPES), type, (t) => TYPE_WORDS[t], "What kind of word")}</p>
        <p class="teach-row">It means ${sel("rel", ["like", "opposite", "none"], f.rel, (r) => ({ like: "much the same as", opposite: "the opposite of", none: "(nothing else)" })[r], "How it is linked")} ${f.rel === "none" ? "" : wordSelect("link", type, f.link, { blank: "choose a word" })}</p>`;
    }
    case "suggests": {
      const what = f.what;
      const els = what === "looks" ? Object.keys(AniTeach.LOOK_ELEMENTS) : Object.keys(AniTeach.MOVEMENT_ELEMENTS);
      if (what !== "shows" && !els.includes(f.element)) f.element = els[0];
      const values = what === "looks" ? AniTeach.LOOK_ELEMENTS[f.element].values : what === "moves" ? AniTeach.MOVEMENT_ELEMENTS[f.element].values : [];
      if (what !== "shows" && !values.includes(f.value)) f.value = values[0];
      const whatSel = sel("what", ["moves", "looks", "shows"].filter((x) => x !== "looks" || teachOn("appear", ext)), what, (x) => ({ moves: "how it moves", looks: "how it looks", shows: "how it shows it" })[x], "What it suggests");
      const row = what === "shows"
        ? `A ${wordSelect("word", null, f.word, { blank: "choose a word", types: ["personality", "physical", "movement"] })} character shows it by ${sel("verb", verbsOn(ext), f.verb, verbWords, "Which verb")} ${sel("who", ["enemy", "friend", "stranger"], f.who, (w) => ({ enemy: "an enemy", friend: "a friend", stranger: "a stranger" })[w], "Whom")}, ${strengthSel("strength", f.strength)} strongly.`
        : `A ${wordSelect("word", null, f.word, { blank: "choose a word", types: ["personality", "physical", "movement"] })} character's ${sel("element", els, f.element, elementLabel, "Which element")} is ${sel("value", values, f.value, (v) => valueLabel(f.element, v), "Its value")}, ${strengthSel("strength", f.strength)} strongly.`;
      return `<p class="teach-row">What it suggests: ${whatSel}</p><p class="teach-row">${row}</p>`;
    }
    case "relationship": {
      const known = f.word && W[f.word] && (W[f.word].kind || W[f.word].kindByRelation) === "relationship";
      const comparisons = Object.keys(AniTeach.COMPARISONS);
      return `<p class="teach-row">Teach Ani a way one character can feel about another: ${wordInput("is-jealous-of")}</p>
        ${known ? `<p class="note teach-known">Ani already knows “${esc(plain(f.word))}”: what you choose below is added to it.</p>` : `<p class="teach-row">It is about ${sel("type", Object.keys(AniTeach.RELATIONSHIP_TYPES), f.type, (t) => ({ affection: "liking and disliking (affection)", domination: "who is in charge (domination)" })[t], "What it is about")}</p>
        <p class="teach-row">It means ${sel("rel", ["none", "like", "opposite"], f.rel, (r) => ({ like: "much the same as", opposite: "the opposite of", none: "(nothing else)" })[r], "How it is linked")} ${f.rel === "none" ? "" : wordSelect("link", "relationship", f.link, { blank: "choose a word" })}</p>`}
        <p class="teach-row">Ani can show it by having the first one ${sel("verb", ["", ...verbsOn(ext), ...myVerbs()], f.verb, (v) => (v ? verbWords(v) : "(no way of showing)"), "Which verb")} the other${f.verb ? `, ${strengthSel("showStrength", f.showStrength)} strongly, best ${sel("bestWhen", Object.keys(AniTeach.BEST_WHEN), f.bestWhen, (b) => ({ always: "always", "in-charge": "when the first is in charge", "not-in-charge": "when the first is not in charge", dislikes: "when the first doesn't like the other" })[b], "Best when")}` : ""}.</p>
        <p class="teach-row">The first moves ${sel("comparison", comparisons, f.comparison, (c) => AniTeach.COMPARISONS[c], "Compared")} the other in ${sel("relElement", ["", ...AniTeach.RELATIVE_ELEMENTS], f.relElement, (e) => (e ? elementLabel(e) : "(nothing: leave this out)"), "Which element")}${f.relElement ? `, ${strengthSel("relStrength", f.relStrength)} strongly` : ""}.</p>`;
    }
    case "way": {
      const verbs = [...new Set([...Object.keys(AniTeach.VERBS), ...myVerbs()])];
      const roles = (AniTeach.VERBS[f.verb] || { roles: ["the first", "the other"] }).roles.map(plain);
      return `<p class="teach-row">Ani can also show ${sel("verb", verbs, f.verb, verbWords, "Which verb")} by ${sel("way", waysOn(ext), f.way, (w) => plain(w), "Which way")}: the ${sel("first", ["1", "2"], String(f.first), (x) => (x === "1" ? roles[0] : roles[1]), "Who goes first")} ${esc((AniTeach.WAYS[f.way] || { words: "" }).words)}, ${strengthSel("strength", f.strength)} strongly.</p>`;
    }
    case "feeling": {
      const rows = f.rows.map((r, k) => `<span class="teach-change">${sel(`row-${k}-element`, Object.keys(AniTeach.FEELING_CHANGES), r.element, elementLabel, "Which element")} ${sel(`row-${k}-change`, AniTeach.FEELING_CHANGES[r.element] || ["up", "down"], r.change, (c) => (c === "up" || c === "down" ? `goes ${c}` : `becomes ${c}`), "How it changes")}${f.rows.length > 1 ? ` <button type="button" class="linkish" data-teach-row-out="${k}" aria-label="Take this change out">×</button>` : ""}</span>`).join("; ");
      return `<p class="teach-row">Teach Ani a feeling: ${wordInput("grumpiness")}</p>
        <p class="teach-row">A character who feels it: ${rows} <button type="button" class="linkish" data-teach-row-add>+ another</button></p>
        <p class="teach-row">each by as much as the feeling, ${strengthSel("strength", f.strength)} strongly.</p>`;
    }
    case "verb":
      return `<p class="teach-row">Teach Ani a verb: ${wordInput("teases")}, a kind of ${sel("kindOf", verbsOn(ext), f.kindOf, verbWords, "A kind of")},</p>
        <p class="teach-row">shown ${sel("showAs", ["parent", "ways"], f.showAs, (x) => (x === "parent" ? `as ${verbWords(f.kindOf)} is shown` : "only by your ways of showing it (Another way of showing a verb)"), "How it is shown")}.</p>`;
  }
  return "";
}
const relationNoteIn = (W, w) => { const i = W[w] || {}; return [i.opposites && i.opposites.length ? `the opposite of ${words(i.opposites.map(plain))}` : "", i.neighbors && i.neighbors.length ? `close to ${words(i.neighbors.map(plain))}` : ""].filter(Boolean).join(", and "); };
// The words of a form's word, for the legitimacy question.
const formWord = (form) => String((form.kind === "way" ? verbWords(form.f.verb) : form.f.word) || "such a").replace(/-/g, " ");
// The Lisp a notebook becomes, each part explained: Ken's notation, the ";;;" lines saying
// what each part is, your reason on each ";;yours" line, and the pieces of the form being
// filled in marked.
function lispPreview(rec, extra = []) {
  const text = AniTeach.notebookToLisp({ ...notebookOf(rec), pieces: [...rec.pieces, ...extra] }, { n: 1, extensions: teachLoaded() });
  const fresh = new Set(extra.map((p) => p.id));
  let marking = false;
  return text.split("\n").map((l) => {
    const yours = /^;;yours (k\d+):/.exec(l);
    if (yours) marking = fresh.has(yours[1]);
    else if (!l.trim()) marking = false;
    const cls = /^;;;/.test(l) ? "lisp-why" : yours ? "lisp-yours" : "";
    return `<span class="${cls}${marking ? " lisp-new" : ""}">${esc(l)}</span>`;
  }).join("\n");
}
function formBox() {
  const form = teachUi.form;
  if (!form) return "";
  const rec = openNotebook() || draftNotebook();
  const pieces = formPieces(form, rec);
  const ready = String(form.f.because || "").trim() && pieces.length;
  const checked = rec && ready ? pageCheck(rec, { pieces: [...rec.pieces, ...pieces] }) : null;
  const ids = new Set(pieces.map((p) => p.id));
  const refused = checked ? checked.refused.filter((r) => ids.has(r.piece) || r.piece === null) : [];
  const warned = checked ? checked.warnings.filter((r) => ids.has(r.piece)) : [];
  const title = (TEACH_KINDS.find(([k]) => k === form.kind) || [, ""])[1];
  return `<div class="teach-form" id="teach-form"><p class="label">${esc(title)}</p>
    ${formFields(form)}
    <p class="teach-row teach-because"><label>Because: <input type="text" data-tf="because" value="${esc(form.f.because || "")}" placeholder="say why, in your own words" maxlength="300" aria-label="Because"></label></p>
    <div class="teach-example">${kenExample(form)}</div>
    ${needsNote(teachExtensions())}
    <div id="teach-form-check">${formCheck(form, pieces, refused, warned)}</div>
    <details class="teach-lisp"><summary>See it as Ani reads it</summary><div class="body"><p class="note">The Lisp your notebook becomes with this, in Ken's own notation (his DSCRP, RELATE, CONVEY and EMOTE). The grey lines say what each part is; your reason is kept on each “;;yours” line, and the part this form adds is marked.</p><pre class="lisp teach-lisp-text" id="teach-form-lisp">${rec ? lispPreview(rec, pieces) : ""}</pre></div></details>
    <p class="note teach-legit">${esc(AniTeach.legitimacyQuestion(formWord(form)))}</p>
    <div class="actions"><button type="button" class="btn primary" data-teach-add>Add to Ani</button><button type="button" class="linkish" data-teach-cancel>Cancel</button></div></div>`;
}
// What the page's own checks say of the form, as it is filled in: the reason, first.
function formCheck(form, pieces, refused, warned) {
  if (!String(form.f.because || "").trim()) return `<p class="note">Say why: Ani keeps your reason with each piece, and shows it wherever the piece is used.</p>`;
  if (!pieces.length) return `<p class="note">Choose what Ani can show it by, or how the first moves compared with the other: Ani knows the word already.</p>`;
  const crit = refused.find((r) => r.code === "names-character");
  return `${refused.length ? `<ul class="problems">${refused.map((r) => `<li>${esc(r.says)}</li>`).join("")}</ul>` : `<p class="note ok-line">Ani can take this.</p>`}${crit ? `<p class="note"><button type="button" class="linkish" data-teach-criticize="${esc(form.f.word || "")}">Criticize this film instead</button></p>` : ""}${warned.length ? `<ul class="changes note">${warned.map((r) => `<li>${esc(r.says)}</li>`).join("")}</ul>` : ""}`;
}

// ---- the panel

function openTeach(given = {}) {
  if (given.kind) teachUi.form = newForm(given.kind, given.fields || {});
  if (given.notebook) teachUi.open = given.notebook;
  if (given.note !== undefined) teachUi.note = given.note;
  teachUi.highlight = given.piece || null;
  select(null, { panel: "teach" });
}
function pieceLine(rec, p) {
  const ch = teachUi.check && teachUi.check.id === rec.id ? teachUi.check.result : null;
  const nb = ch && ch.notebooks ? ch.notebooks[ch.notebooks.length - 1] : null;
  const heard = nb && nb.pieces[p.id];
  const refused = nb ? nb.refused.filter((r) => r.piece === p.id) : [];
  const warned = nb ? nb.warnings.filter((r) => r.piece === p.id) : [];
  const reh = teachUi.rehearsals[`${rec.id} ${p.id}`];
  const status = !heard ? "" : refused.length ? `<span class="teach-state no">refused</span>` : heard.heard ? `<span class="teach-state yes">Ani hears it</span>` : "";
  return `<li class="teach-piece${teachUi.highlight === p.id ? " highlight" : ""}" data-piece="${esc(p.id)}"><span>${esc(AniTeach.pieceWords(p))}</span> ${status}
    <span class="teach-because">because ${esc(p.because)}</span>
    ${heard && heard.says ? `<span class="note teach-spread">${esc(heard.says.replace(/ \(char\.2:111-131\)/, ""))} (Ken's rule, char.2:111-131)</span>` : ""}
    ${refused.length || warned.length ? `<ul class="${refused.length ? "problems" : "changes note"}">${[...refused, ...warned].map((r) => `<li>${esc(r.says)}</li>`).join("")}</ul>` : ""}
    ${reh ? `<span class="note teach-rehearsal">${rehearsalWords(reh)}</span>` : ""}
    <span class="teach-piece-acts"><button type="button" class="linkish" data-teach-rehearse="${esc(p.id)}"${reh && reh.running ? " disabled" : ""}>${reh && reh.running ? "Trying it…" : "Try it on a little story"}</button> · <button type="button" class="linkish" data-teach-out="${esc(p.id)}">Take it out</button></span></li>`;
}
const STATE_WORDS = { won: "won", combined: "combined with another suggestion", lost: "set aside", "never-reached": "never reached" };
function rehearsalWords(r) {
  if (r.running) return "Ani is trying it on a little story of two characters, one scene (about 15 seconds)…";
  if (r.error) return `On a little story of two characters, Ani stopped: ${esc(stopText(r.error))}`;
  const o = r.outcome;
  if (!o) return "On a little story of two characters, Ani didn't hear it.";
  const why = o.state === "never-reached" ? (o.why ? `: ${esc(o.why)}` : "") : o.places && o.places.length ? `: ${placesWords(null, o.places.slice(0, 2))}` : o.note ? `: ${esc(o.note)}` : "";
  return `On a little story of two characters, one scene (${(r.seconds || 0).toFixed(0)} s): Ani heard it, and it ${esc(STATE_WORDS[o.state] || o.state)}${why}.`;
}
function teachPanel() {
  const side = document.getElementById("side");
  if (!TEACHING.loaded) { side.innerHTML = `<div class="side-head"><h2>Teach Ani</h2><button type="button" class="linkish" id="teach-close">Back</button></div><p class="note">Opening your knowledge…</p>`; side.querySelector("#teach-close").addEventListener("click", () => select(null)); return; }
  let rec = openNotebook();
  if (!rec && TEACHING.notebooks.length) { rec = TEACHING.notebooks[0]; teachUi.open = rec.id; }
  const used = usedNotebooks();
  const base = teachBase();
  const ext = runExtensions(base);
  const busy = !!(RUNS[1] && RUNS[1].status && RUNS[1].status.running);
  const kinds = TEACH_KINDS.map(([k, label]) => `<button type="button" class="teach-kind" data-teach-kind="${k}"${teachUi.form && teachUi.form.kind === k ? ' aria-pressed="true"' : ""}>${esc(label)}</button>`).join("");
  const book = rec ? `<div class="teach-book">
      <div class="teach-book-head"><b>${esc(rec.title)}</b> <span class="note">${rec.pieces.length} piece${rec.pieces.length === 1 ? "" : "s"}${rec.used ? ", used in your films" : ", not used now"}</span></div>
      ${rec.pieces.length ? `<ol class="teach-pieces">${rec.pieces.map((p) => pieceLine(rec, p)).join("")}</ol>` : `<p class="note">Nothing in it yet.</p>`}
    </div>` : "";
  const check = teachUi.check && rec && teachUi.check.id === rec.id ? checkSummary(teachUi.check) : "";
  side.innerHTML = `
    <div class="side-head"><h2>Teach Ani</h2><button type="button" class="linkish" id="teach-close">Back</button></div>
    <p class="note">Teach Ani something it doesn't know. Ani will use it in every film you make with your knowledge.</p>
    ${teachUi.note ? `<p class="note crit-added" aria-live="polite">${teachUi.note}</p>` : ""}
    ${book}
    <div class="teach-add"><span class="label">+ Teach Ani…</span><div class="teach-kinds">${kinds}</div></div>
    ${formBox()}
    ${rec && rec.pieces.length ? `<div class="actions"><button type="button" class="btn" data-teach-check${teachUi.checking ? " disabled" : ""}>${teachUi.checking ? "Ani is checking…" : "Check with Ani"}</button></div>${check}
    <details class="teach-lisp"><summary>See it as Ani reads it</summary><div class="body"><p class="note">${esc(rec.title)} as the Lisp file Ani loads (YOURS;N1 KNOW), in Ken's own notation. The grey lines say what each part is; your reason is on each “;;yours” line.</p><pre class="lisp teach-lisp-text">${lispPreview(rec)}</pre></div></details>` : ""}
    <div class="teach-make"><p class="label">Make it with my knowledge</p>
      ${used.length ? `<p class="note">Ani will make ${base === RUNS[0] ? "Ken's 1978 film" : `your version (${esc(base.label)})`} again, ${base === RUNS[0] ? "as in 1978" : esc(ext.length ? `with ${extensionsName(ext)}` : "as in 1978")}, at ${runFps(base)} frames a second, with your knowledge: ${esc(words(used.map((n) => `“${n.title}”`)))} (REVIVE;TEACH, with the revival's repairs, MEND, which it needs, loaded for this film only). Then the two are shown side by side, with what your knowledge did.</p>` : `<p class="note">Tick “use” beside a notebook in Your knowledge to make a film with it.</p>`}
      <div class="actions"><button type="button" class="btn primary" data-teach-make${!used.length || busy ? " disabled" : ""}${busy ? ' title="Ani is making a film; make this one when it has finished, or stop it"' : ""}>Make it with my knowledge</button></div></div>
    ${notebooksBox()}
    ${tryTeaching()}
    ${teachAboutBox()}`;
  side.querySelector("#teach-close").addEventListener("click", () => { teachUi.note = ""; select(null); });
  teachUi.note = "";
  const h = side.querySelector(".teach-piece.highlight");
  if (h) h.scrollIntoView({ block: "nearest" });
}
function checkSummary(c) {
  if (c.running) return `<p class="note">Ani is reading your knowledge with Ken's files, as it would for a film (about two seconds once it has started)…</p>`;
  if (c.error) return `<p class="note problems">Ani couldn't check it: ${esc(c.error)}</p>`;
  const r = c.result;
  const nb = r.notebooks[r.notebooks.length - 1];
  const others = r.notebooks.slice(0, -1).filter((x) => !x.ok);
  const spread = Object.values(nb.pieces).filter((x) => x.says).length;
  const lisp = r.stopped ? `<details><summary>What Lisp said</summary><div class="body"><pre class="lisp">${esc(r.stopped.error)}</pre></div></details>` : "";
  return `<div class="teach-check ${nb.ok ? "ok" : "no"}"><p>${nb.ok ? `Ani read your knowledge with Ken's files and heard every piece (${r.seconds.toFixed(1)} s).` : `Ani refuses ${nb.refused.length === 1 ? "one thing" : `${nb.refused.length} things`} in this notebook (${r.seconds.toFixed(1)} s): each is said under its piece${nb.refused.some((x) => !x.piece) ? ", and here" : ""}.`}${spread ? " Where Ken's spreading of links took a word further, its piece says so." : ""}</p>
    ${nb.refused.filter((x) => !x.piece).map((x) => `<p class="note problems">${esc(x.says)}</p>`).join("")}${nb.warnings.filter((x) => !x.piece).map((x) => `<p class="note">${esc(x.says)}</p>`).join("")}
    ${others.length ? `<p class="note">${esc(words(others.map((x) => `“${x.title}”`)))}, used with it, ${others.length === 1 ? "has" : "have"} something Ani refuses too.</p>` : ""}${lisp}</div>`;
}
function notebooksBox() {
  const list = TEACHING.notebooks;
  const used = usedNotebooks();
  const full = used.length >= AniTeach.MAX_NOTEBOOKS;
  const rows = list.map((n) => {
    const renaming = teachUi.renaming === n.id;
    const confirm = teachUi.confirm === n.id;
    return `<li class="teach-nb${n.id === teachUi.open ? " current" : ""}" data-nb="${esc(n.id)}">
      <label class="teach-use"><input type="checkbox" data-teach-use${n.used ? " checked" : ""}${!n.used && full ? ` disabled title="Up to ${AniTeach.MAX_NOTEBOOKS} notebooks are used at once"` : ""}> use</label>
      ${renaming ? `<span class="film-rename"><input type="text" value="${esc(n.title)}" maxlength="80" aria-label="The notebook's title" data-teach-title><button type="button" class="btn" data-teach-nb="rename-yes">Rename</button><button type="button" class="linkish" data-teach-nb="rename-no">Cancel</button></span>` : `<b>${esc(n.title)}</b> <span class="note">${n.pieces.length} piece${n.pieces.length === 1 ? "" : "s"}</span>`}
      <span class="film-actions">${n.id === teachUi.open ? "" : `<button type="button" class="linkish" data-teach-nb="open">Open</button>`}<button type="button" class="linkish" data-teach-nb="rename">Rename</button><button type="button" class="linkish" data-teach-nb="save">Save as a file</button><button type="button" class="linkish" data-teach-nb="delete">Delete</button></span>
      ${confirm ? `<span class="film-confirm">Delete “${esc(n.title)}” from this browser? Films made with it keep their own copy. <button type="button" class="btn danger" data-teach-nb="delete-yes">Delete it</button> <button type="button" class="linkish" data-teach-nb="delete-no">Keep it</button></span>` : ""}</li>`;
  }).join("");
  return `<details class="teach-books"${list.length > 1 || teachUi.renaming || teachUi.confirm ? " open" : ""}><summary>Your knowledge (${list.length} notebook${list.length === 1 ? "" : "s"}${list.length ? `, ${used.length} used` : ""})</summary><div class="body">
    <p class="note">Each notebook is kept in this browser, beside your films, and sent nowhere. A film is made with those ticked “use”, up to ${AniTeach.MAX_NOTEBOOKS}; two may not teach the same word. Save one as a file to share it (a teacher can hand out a class notebook so), and open one someone saved, or drop it on the page.</p>
    ${list.length ? `<ul class="teach-nbs">${rows}</ul>` : ""}
    <div class="actions"><button type="button" class="btn" data-teach-nb="new">+ A new notebook</button><button type="button" class="btn" data-teach-nb="file">Open a shared file…</button></div>
    <p class="note" id="teach-status" aria-live="polite"></p></div></details>`;
}
const teachAboutBox = () => `<details class="teach-about crit-about"><summary>About teaching Ani</summary><div class="body">
  <p class="note">Ken wrote in ${kahn1977()} that knowledge should be “as modular and simply represented as possible”, so that “the child, with the help of the system, will be able to define new characters for the stories, change the system's vocabulary, add a reasonable default course of action and so on”; and in his thesis, that “a student of animation could learn much by observing the effects of altering Ani's knowledge and rules” (<a href="${AITR_URL}" target="_blank" rel="noopener">AI-TR-540</a>, pp. 149–150). Teach Ani is the revival's way of doing that: what you teach is written in Ken's own notation, in a file of yours (YOURS;N1 KNOW), and read after his files by REVIVE;TEACH, only into a film you make with it. ${fileLink("teach")}</p>
  <p class="note">Your knowledge only adds: words, what they suggest, relationships and how they are shown, other ways of showing a verb, feelings, and verbs that are a kind of one of Ani's. It never removes or weakens Ken's knowledge, and Ken's 1978 film, and Ani as in 1978, never change. Each piece keeps your reason, and the glass box shows it wherever the piece was used, marked “your knowledge”. A piece about one of the story's characters isn't knowledge but criticism of one film, so it is refused here (criticize the film instead). Ken's rule for himself was to add only “obvious information that was lacking”, never to arrange “for Ani to do what I want without improving the reasoning”; the page asks you that as a question, not a gate.</p>
  <p class="note">Not built yet (the revival's choices, pending Ken): a verb made of two others, one after the other; a way of showing built from walks; telling Ani in your own words; editing a notebook as Lisp.</p></div></details>`;

// ---- the examples ("Try teaching", the design's section 12)

const exampleOf = (id) => ((DATA.teach && DATA.teach.examples) || []).find((e) => e.id === id) || null;
function tryTeaching() {
  const ex = (DATA.teach && DATA.teach.examples) || [];
  if (!ex.length) return "";
  const card = teachUi.example ? exampleCard(exampleOf(teachUi.example)) : "";
  return `<div class="teach-try"><p class="note crit-try">Try teaching: ${ex.map((e) => `<button type="button" class="linkish" data-teach-example="${esc(e.id)}">${esc(e.label)}</button>`).join(" · ")}</p>${card}</div>`;
}
const EXAMPLE_WORDS = {
  grumpy: { before: "Ken's Cinderella, with the stepmother grumpy where Ken has her mean: a word Ani doesn't know", look: "The first time, one of Ani's choices about the stepmother changes: with nothing to go on, it picks her attraction to enemies from the film's variety, so she is drawn towards Cinderella and chases her before hitting her. With your knowledge, the film is exactly Ken's: you gave Ani back what “mean” meant. Click the stepmother: “she is grumpy, which you taught Ani means much the same as mean”." },
  "grumpy-slow": { before: "Ken's Cinderella, with the stepmother grumpy, a word Ani doesn't know", look: "Before you make it, how fast do you think she will move? She moves at medium speed: her other word, strong, says fast (Ken's knowledge), so Ani met the two in the middle. Her walk to hit Cinderella takes 12.5 seconds instead of 7.3." },
  "helps-with": { before: null, look: "In 1978 Ani canceled Cinderella's helping the Prince in the Introduction: it had no idea how to show it (the thesis, p. 65). Now she helps him by going along with him. Compare it with the revival's own way (KNOW's helping along): which shows helping better?" },
  jealous: { before: "Ken's Cinderella, with the stepmother jealous too, and jealous of Cinderella: words Ani doesn't know", look: "She is green, and her paths are more jagged, but she still pushes Cinderella instead of following her. Open “What your knowledge did”: Ani prefers a way of showing that two of her words suggest at once (dominates and hates both suggest pushing), and only yours suggested following. Made with “is jealous of” as her only word for Cinderella, she follows her (the Introduction, 220 frames)." },
};
function exampleCard(e) {
  if (!e) return "";
  const w = EXAMPLE_WORDS[e.id] || {};
  const ext = e.extensions;
  const extWords = ext.length ? extensionsName(ext) : "Ani as in 1978";
  const rec = TEACHING.notebooks.find((n) => n.example === e.id);
  const before = e.story ? exampleBefore(e) : RUNS[0];
  const busy = !!(RUNS[1] && RUNS[1].status && RUNS[1].status.running);
  const steps = [];
  if (e.story) steps.push(`<li>${esc(w.before)}, made ${esc(ext.length ? `with ${extWords}` : extWords)} at 4 frames a second: <button type="button" class="btn" data-teach-example-make="${esc(e.id)}"${busy ? " disabled" : ""}>Make it without your knowledge</button>${before ? ` <span class="note ok-line">made</span>` : ""}<span class="note"> (The Introduction: ${e.frames.before} frames.)</span></li>`);
  steps.push(`<li>With your notebook “${esc(rec ? rec.title : e.notebook.title)}” (ticked “use”, the only one): <button type="button" class="btn primary" data-teach-example-with="${esc(e.id)}"${busy || !before ? " disabled" : ""}>Make it with my knowledge</button><span class="note"> (The Introduction: ${e.frames.after} frames${e.story ? "" : `, where Ken's 1978 film has ${e.frames.before}`}.)</span></li>`);
  return `<div class="teach-example-card"><p class="label">Try teaching: ${esc(e.label)}</p><ol>${steps.join("")}</ol><p class="note"><b>What to look for:</b> ${esc(w.look || "")}</p><p class="note">Made ${esc(ext.length ? `with ${extWords}` : "by Ani as in 1978")}${ext.includes("mend") ? "" : ", with the revival's repairs (MEND) loaded with your knowledge, which needs them,"} as tools/check-teach.mjs makes it, whatever the switch says, so that the frames are those above.</p></div>`;
}
// The film an example is tried against: your version, if it is the example's story made
// without knowledge with its extensions at 4 frames a second.
function exampleBefore(e) {
  const r = RUNS[1];
  if (!r || (r.status && r.status.running) || (r.knowledge && r.knowledge.length) || !r.scenes.some(ready)) return null;
  const text = tidyStory(DATA.teach.stories[e.story], { extensions: e.extensions }).text;
  return r.cindy === text && sameIds(runExtensions(r), e.extensions) && runFps(r) === 4 ? r : null;
}
// An example's notebook, added once (as a copy, which you may change) and ticked alone.
async function useExample(e) {
  let rec = TEACHING.notebooks.find((n) => n.example === e.id);
  if (!rec) {
    rec = newNotebookRecord(e.notebook.title, e.notebook.pieces.map((p) => ({ ...p })));
    rec.example = e.id;
    TEACHING.notebooks.push(rec);
  }
  for (const n of TEACHING.notebooks) if (n.used !== (n === rec)) { n.used = n === rec; await keepNotebook(n); }
  teachUi.open = rec.id;
  teachUi.example = e.id;
  teachUi.form = null;
  await keepNotebook(rec);
  teachChanged();
  return rec;
}

// ---- Ani's check and rehearsals, in a worker of their own

// A job of Teach Ani's (checkKnowledge or rehearse; TEACH_JOB) in a worker made as a
// film's is, or, where the page may not start one (a claude.ai chat), on the page.
async function teachJob(message) {
  if (!ani.runtime) {
    const [rt, bundle] = await Promise.all([unpack(document.getElementById("ani-runtime").textContent), unpack(document.getElementById("ani-bundle").textContent)]);
    ani.runtime = rt;
    ani.bundle = bundle;
  }
  const inPage = async () => {
    await new Promise((r) => setTimeout(r, 60)); // let the page say it is checking first
    const R_ = ani.inPage || (ani.inPage = runtimeOnPage());
    return self.AniTeachJob(R_, R_.makeBundleFileSystem(JSON.parse(ani.bundle)), message);
  };
  if (ARTIFACT_BUILD) return inPage();
  let w = null;
  try {
    const url = URL.createObjectURL(new Blob([ani.runtime, "\n", GLUE], { type: "text/javascript" }));
    w = new Worker(url);
    URL.revokeObjectURL(url);
  } catch { w = null; }
  if (!w) return inPage();
  return new Promise((resolve, reject) => {
    let heard = false;
    w.onmessage = (e) => {
      heard = true;
      if (e.data.type === "teach") { w.terminate(); resolve(e.data.result); }
      else if (e.data.type === "error") { w.terminate(); reject(new Error(e.data.message)); }
    };
    w.onerror = (e) => { e.preventDefault(); w.terminate(); if (!heard) inPage().then(resolve, reject); else reject(new Error(e.message || "The worker checking your knowledge failed.")); };
    w.postMessage({ bundle: ani.bundle, teach: message });
  });
}
async function checkWithAni(rec) {
  if (!rec || teachUi.checking) return;
  const others = usedNotebooks().filter((n) => n.id !== rec.id).map(notebookOf);
  teachUi.checking = true;
  teachUi.check = { id: rec.id, running: true };
  renderSide();
  try {
    const result = await teachJob({ check: true, notebooks: [...others, notebookOf(rec)], extensions: teachExtensions(), characters: teachCast() });
    teachUi.check = { id: rec.id, result };
  } catch (e) { teachUi.check = { id: rec.id, error: String(e.message || e) }; }
  teachUi.checking = false;
  if (state.panel === "teach") renderSide();
}
async function rehearsePiece(rec, id) {
  const p = rec.pieces.find((x) => x.id === id);
  const key = `${rec.id} ${id}`;
  if (!p || (teachUi.rehearsals[key] && teachUi.rehearsals[key].running)) return;
  teachUi.rehearsals[key] = { running: true };
  renderSide();
  const others = usedNotebooks().filter((n) => n.id !== rec.id).map(notebookOf);
  const nb = notebookOf(rec);
  try { teachUi.rehearsals[key] = await teachJob({ rehearse: true, piece: nb.pieces.find((x) => x.id === id), notebooks: [...others, nb], extensions: teachExtensions() }); }
  catch (e) { teachUi.rehearsals[key] = { error: String(e.message || e) }; }
  if (state.panel === "teach") renderSide();
}

// ---- "Make it with my knowledge"

let teachTemp = 0;
// before: the film to make again (and to put beside it); or, from the editor, a story of
// its own (description, extensions, fps), beside your version if it is that story as it was
// made, else beside Ken's.
function makeWithKnowledge(before = teachBase(), { description = undefined, extensions = null, fps = null, notebooks = usedNotebooks() } = {}) {
  if (!notebooks.length || (RUNS[1] && RUNS[1].status && RUNS[1].status.running)) return;
  const ext = extensions || runExtensions(before);
  // the page's own checks first: a film is never made with a notebook Ani refuses
  for (const rec of notebooks) {
    const c = pageCheck(rec, { ext });
    if (!c.ok) { teachUi.open = rec.id; teachUi.note = esc(`Ani refuses something in “${rec.title}”: ${c.refused[0].says} Take it out, or untick the notebook, first.`); openTeach({ notebook: rec.id }); return; }
  }
  const ken = before === RUNS[0];
  const rate = fps || runFps(before);
  let ref = "ken";
  if (!ken) {
    let id = before.libId;
    if (!id) id = `kept-${++teachTemp}`;
    LIB_RUNS.set(id, before);
    ref = `lib:${id}`;
  }
  const knowledge = notebooks.map(notebookOf);
  const cindy = description !== undefined ? description : ken ? DATA.cindy : before.cindy;
  const run = makeRun({ label: `${yoursLabel(ext)}, with your knowledge`, short: "Yours", cindy, extensions: ext, tidied: ken ? [] : before.tidied, told: ken ? null : before.told });
  run.knowledge = knowledge;
  run.teachFrom = { ken, fps: rate, id: ken ? null : before.libId || null, title: ken ? "Ani's 1978 film" : (before.libId && libraryTitle(before.libId)) || before.label, made: (before.status && before.status.made) || null, print: ken ? null : printOf(before) };
  if (state.panel === "teach") teachUi.note = "";
  startRun(description !== undefined ? cindy : ken ? null : before.cindy, rate, ext, { run, pair: [ref, "cur"] });
}
// From the editor: its story, with the switch's extensions and its frames a second.
function makeEditorWithKnowledge() {
  setEditorText(editor.text);
  const ext = modeExtensions();
  const text = tidyStory(editor.text, { extensions: ext }).text;
  if (checkStory(text, { extensions: ext }).problems.length) return;
  const r = RUNS[1];
  const same = r && !(r.status && r.status.running) && r.cindy === text && sameIds(runExtensions(r), ext) && runFps(r) === editor.fps && !(r.knowledge && r.knowledge.length);
  makeWithKnowledge(same ? r : RUNS[0], { description: text, extensions: ext, fps: editor.fps });
}
// The film one made with knowledge was made from, if the page has it.
function teachBeforeOf(b) {
  const r = b && b.teachFrom;
  if (!r) return null;
  if (r.ken) return RUNS[0] && runFps(RUNS[0]) === r.fps ? RUNS[0] : null;
  for (const [id, x] of LIB_RUNS) if ((r.id && id === r.id) || (r.print && printOf(x) === r.print)) return x;
  return null;
}

// ---- "What your knowledge did": the pair panel, and the glass box

const asRun = (run) => ({ choicePoints: run.raw.choicePoints || [], scenes: run.raw.scenes.filter(Boolean), extensions: runExtensions(run), knowledge: run.knowledge || [] });
const DID = new WeakMap();
// What a film's knowledge did (src/pipeline.js yourKnowledgeDid), worked out once it is made.
function knowledgeDid(run) {
  if (!run || !run.knowledge || !run.knowledge.length) return null;
  if (run.status && run.status.running) { try { return AniTeach.yourKnowledgeDid(asRun(run)); } catch (e) { console.error(e); return null; } }
  let d = DID.get(run);
  if (!d) { try { d = AniTeach.yourKnowledgeDid(asRun(run)); } catch (e) { console.error(e); d = { notebooks: [], pieces: [] }; } DID.set(run, d); }
  return d;
}
const YOURS_OF = new WeakMap();
// "Your knowledge" as the glass box reads it (src/teach.js yoursIndex, the shape of DATA.know).
function yoursOf(run) {
  if (!run || !run.knowledge || !run.knowledge.length) return null;
  let y = YOURS_OF.get(run);
  if (!y) { y = AniTeach.yoursIndex(run.knowledge); YOURS_OF.set(run, y); }
  return y;
}
// The badge: "your knowledge", the reason, and a link to the piece in Teach Ani.
function yoursBadge(entry) {
  if (!entry) return "";
  return `<span class="evidence"><span class="yours-tag">your knowledge</span>: “${esc(entry.because)}” <button type="button" class="linkish" data-yours="${esc(`${entry.title}|${entry.piece}`)}" title="Open this piece in Teach Ani">see it</button></span>`;
}
// The learner's pieces behind a pass-1 suggestion: a word of theirs (or a word of Ani's
// linked to one of theirs), or a suggestion they added to a word of Ani's, told apart by
// its element, value and strength (as knowOfSource tells KNOW's).
function yoursOfSource(run, s, el, value = null, strength = null) {
  const y = yoursOf(run);
  if (!y) return [];
  const out = [];
  for (const x of Array.isArray(s) && s[0] === "and" ? s.slice(1) : [s]) {
    const [w, base] = Array.isArray(x) && (x[0] === "opposite-of" || x[0] === "neighbor-of") ? [x[1], x[2]] : [x, null];
    if (typeof w !== "string") continue;
    const mine = y.knowledge.find((k) => k.source === (base || w) && k.element === el && (y.words[base || w] || ((value === null || k.value === show(value)) && (strength === null || k.strength === strength))));
    if (mine && !out.includes(mine)) out.push(mine);
    else if (y.words[w] && !out.includes(y.words[w])) out.push(y.words[w]);
    else if (base && y.words[base] && !out.includes(y.words[base])) out.push(y.words[base]);
  }
  return out;
}
// How a learner's word reads in a suggestion's source: "grumpy, which you taught Ani means
// much the same as mean".
function yoursWordWords(run, x) {
  const y = yoursOf(run);
  if (!y || !Array.isArray(x)) return null;
  const [how, w, base] = x;
  const mine = y.words[w], theirs = y.words[base];
  if (mine && (mine.like === base || mine.opposite === base)) return `${plain(w)}, which you taught Ani ${how === "neighbor-of" ? "means much the same as" : "is the opposite of"} ${plain(base)}`;
  if (theirs && (theirs.like === w || theirs.opposite === w)) return `${plain(w)}, which you taught Ani ${how === "neighbor-of" ? "means much the same as" : "is the opposite of"} your ${plain(base)}`;
  return null;
}
// A learner's way of showing a verb, chosen or weighed in a task: the badge.
function yoursOfWay(run, src, m) {
  const y = yoursOf(run);
  if (!y || !Array.isArray(src) || src[0] !== "yours") return null;
  const v = y.verbs[src[1]];
  return v && v.ways ? v.ways.find((x) => Array.isArray(m) && x.method === m[0]) || v.ways[0] : null;
}
const VERDICT = { won: "Won", combined: "Combined", lost: "Lost", "never-reached": "Never reached" };
// What a place a piece reached says, in words (src/pipeline.js yourKnowledgeDid's places).
function placeWords(run, pl) {
  const reason = pl.reasonWords ? esc(pl.reasonWords.replace(/\(([a-z-]+(?: [a-z-]+)*)\)/g, (m, x) => `(${x.replace(/-/g, " ")})`)) : "";
  if (pl.choicePoint) {
    const [, who_, el] = pl.choicePoint;
    const whoWords = Array.isArray(who_) ? `${who(who_[0])} beside ${who(who_[1])}` : who(who_);
    const against = (pl.against || []).map((a) => `${esc(valueLabel(el, a.value))}${a.source ? ` (from ${sourceWords(run, who_, a.source)})` : ""}`);
    const el2 = String(el).replace(/^relative-/, "");
    const what = `${cap(whoWords)}'s ${esc(elementNoun(el2))}: ${esc(valueLabel(el2, pl.value))}`;
    if (pl.state === "combined") return `${what}: yours met ${words(against) || "another suggestion"} in the middle`;
    if (pl.state === "lost") return `${what}: yours was set aside, ${reason}${against.length ? `, for ${words(against)}` : ""}`;
    return `${what}${against.length ? `, over ${words(against)}` : ""}`;
  }
  const scTitle = run && pl.scene ? esc(run.titles[pl.scene] || titleCase(pl.scene)) : pl.scene ? esc(titleCase(pl.scene)) : "";
  if (pl.borrowed) return `${scTitle}: borrowed “${esc(plain(String(pl.way).replace(/[()]/g, " ").trim().split(" ")[0]))}”${pl.state === "won" ? ", and Ani chose it" : ", but Ani chose another way"}`;
  const d = pl.description ? (() => { try { return run ? critAbout(run, run.scenes[run.sceneIds.indexOf(pl.scene)], parse(pl.description)) : esc(plain(pl.description.replace(/[()]/g, " ").trim())); } catch { return esc(plain(pl.description)); } })() : "";
  if (pl.element) return `${scTitle}: ${d}, ${esc(elementLabel(pl.element))} ${pl.change === "up" || pl.change === "down" ? `going ${pl.change}` : `becoming ${esc(pl.change)}`}: ${pl.state === "won" ? "made" : reason || "not made"}`;
  const chosen = pl.way ? `your way: the one who does it ${esc(AniTeach.WAYS[pl.way] ? AniTeach.WAYS[pl.way].words : plain(pl.way))}` : pl.verb ? `by ${esc(verbWords(pl.verb))}` : "";
  return `${scTitle}: ${d}${pl.state === "won" ? `, shown ${chosen}` : `: ${reason}`}`;
}
// A suggestion's source in words: a character's words ("she is strong"), as the glass box
// says them, or its words alone.
function sourceWords(run, who_, src) {
  try {
    if (run && typeof who_ === "string") return using(run, () => sourceText(who_, typeof src === "string" ? parse(src) : src));
  } catch { /* said plainly below */ }
  return esc(plain(String(src).replace(/[()]/g, " ").replace(/\b(and|neighbor-of|opposite-of)\b/g, "").replace(/\s+/g, " ").trim()));
}
const placesWords = (run, places) => places.map((pl) => placeWords(run, pl)).join("; ");
// "Lost to …": what won where a piece lost.
function lostTo(p) {
  const pl = p.places.find((x) => x.state === "lost");
  if (!pl) return "";
  if (pl.against && pl.against.length) return ` to ${words(pl.against.map((a) => esc(plain(String(a.source || a.value).replace(/[()]/g, " ").replace(/\b(and|neighbor-of|opposite-of)\b/g, "").replace(/\s+/g, " ").trim()))))}`;
  if (pl.chosen && pl.chosen.length) return ` to ${words(pl.chosen.map((c) => { const v = plain(String(c).replace(/[()]/g, " ").trim().split(" ")[0]); return esc(AniTeach.VERBS[v] ? AniTeach.VERBS[v].words : VERB_ING[v] || v); }))}`;
  return "";
}
function didItem(run, p, places = p.places) {
  const y = yoursOf(run);
  const entry = y ? { title: p.title, piece: p.piece, because: p.because } : null;
  // (a relationship word with no link: Ken's words for it, "is jealous of", not "is is-jealous-of")
  const rel = p.note && p.kind === "relationship" ? /^a character of this story is ([a-z-]+):/.exec(p.note) : null;
  const note = rel ? `in this story one character ${plain(rel[1])} another: what the word suggests is in its other pieces` : p.note;
  const where = p.state === "never-reached" ? (p.why ? `: ${esc(p.why.replace(/-/g, " "))}` : "") : places.length ? `<ul class="crit-why">${places.slice(0, 6).map((pl) => `<li>${placeWords(run, pl)}</li>`).join("")}${places.length > 6 ? `<li>and ${places.length - 6} more</li>` : ""}</ul>` : note ? `: ${esc(note)}` : "";
  return `<li class="teach-did ${esc(p.state)}"><span class="crit-verdict">${VERDICT[p.state] || esc(p.state)}${p.state === "lost" ? lostTo(p) : ""}</span> ${esc(p.words)}${p.unread ? ` <span class="note">(Ani chose it, but nothing that draws the film reads it)</span>` : ""} ${yoursBadge(entry)}${where}</li>`;
}
// The pair panel's first section: a film made with knowledge beside one of the same story
// made without it (the film it was made from, or any other).
function teachChangedSection(a, b) {
  if (!a || !b || a === b || !b.knowledge || !b.knowledge.length || !sameStory(a, b)) return "";
  if (a.knowledge && JSON.stringify(a.knowledge) === JSON.stringify(b.knowledge)) return "";
  const running = !!(b.status && b.status.running);
  let ch;
  try { ch = AniTeach.knowledgeChanges(asRun(a), asRun(b)); } catch (e) { console.error(e); return ""; }
  const from = teachBeforeOf(b) === a;
  const left = state.view === "both" && screenRun(0) === a ? "left" : "right";
  const cp = ch.pass1.changed.map((c) => {
    const [kind, who_, el] = c.choicePoint;
    const whoWords = Array.isArray(who_) ? `${who(who_[0])} beside ${who(who_[1])}` : who(who_);
    const el2 = String(el).replace(/^relative-/, "");
    const val = (v) => (v === null || v === undefined ? "—" : esc(valueLabel(el2, show(v))));
    const pieces = c.pieces.map((id) => { const [n, k] = id.split(" "); const p = ch.pieces.find((x) => `n${x.notebook}` === n && x.piece === k); return p ? `your “${esc(p.words.replace(/\.$/, ""))}”` : ""; }).filter(Boolean);
    const kept = c.source && typeof who_ === "string" ? sourceWords(b, who_, c.source) : "";
    return `<li>${cap(whoWords)}'s ${esc(elementNoun(el2))}${kind === "relative-choice-point-of" ? " (compared)" : ""}: ${val(c.before)} → <b>${val(c.after)}</b>${pieces.length ? `, because of ${words(pieces)}` : ""}${kept ? ` <span class="was">(the suggestion kept: ${kept})</span>` : ""}</li>`;
  }).join("");
  const scenes = ch.scenes.map((s) => {
    const t = esc(b.titles[s.id] || titleCase(s.id));
    const fr = s.frames.before !== null && s.frames.after !== null ? `${s.frames.before} frames, now ${s.frames.after}` : s.frames.after !== null ? `${s.frames.after} frames` : running ? "not made yet" : "not made";
    const tasks = s.tasks.map((x) => {
      const d = critAbout(b, b.scenes[b.sceneIds.indexOf(s.id)], parse(x.description));
      const side = (y) => (!y ? "not there" : y.status === "cant-do" ? "couldn't be done" : y.choice === "nil" ? "nothing chosen" : `${words(lispList(parse(y.choice)).map((m) => (Array.isArray(m) && m[0] === "method:" ? `showing that ${critAbout(b, null, kv(m, "value"))}` : using(b, () => methodText(m)))))}${y.runningTime !== null && y.runningTime !== undefined ? ` (${sec(y.runningTime)})` : ""}`);
      return `<li>${cap(d)}: ${side(x.before)}; now ${side(x.after)}.</li>`;
    }).join("");
    return `<li><b>${t}</b>: ${fr}.${tasks ? `<ul class="changes">${tasks}</ul>` : ""}</li>`;
  }).join("");
  return `<div class="teach-changed"><p class="label">What your knowledge did</p>
    <p class="note">${esc(b === RUNS[1] ? "Your version" : b.label)} was made ${from ? `from ${a === RUNS[0] ? "Ken's 1978 film" : `“${esc(a.label)}”`} (on the ${left}) again` : "beside the film on the " + left}, with your knowledge: ${esc(words(b.knowledge.map((n) => `“${n.title}”`)))}${running ? "; Ani is still making it" : ""}.</p>
    <ul class="crit-outcomes teach-dids">${ch.pieces.map((p) => didItem(b, p)).join("")}</ul>
    <p class="note">Pass 1: ${ch.pass1.changed.length} of Ani's ${ch.pass1.total} choices changed.</p>${cp ? `<ul class="changes">${cp}</ul>` : ""}
    <details${running ? " open" : ""}><summary>Scene by scene</summary><div class="body"><ul class="changes crit-scenes">${scenes}</ul></div></details>
    <p class="note">Click a character on either screen for “What your knowledge did here”, and “your knowledge” wherever a piece was used.</p></div>`;
}
// The glass box's "What your knowledge did here": the pieces that acted for this character
// (in pass 1) or in this scene, hers first.
function teachHere(run, sc, char) {
  const did = knowledgeDid(run);
  if (!did || !sc) return "";
  const mine = (pl) => (pl.choicePoint ? (Array.isArray(pl.character) ? pl.character.includes(char) : pl.character === char) : pl.scene === sc.id && String(pl.character || "").split(/[\s()]+/).includes(char));
  const here = (pl) => pl.choicePoint ? mine(pl) : pl.scene === sc.id;
  const items = did.pieces.map((p) => ({ p, places: p.places.filter(here), first: p.places.some(mine) })).filter((x) => x.places.length);
  const made = run.knowledge.map((n) => `“${n.title}”${n.changed || n.made ? ` as it was on ${shortDay(n.changed || n.made)}` : ""}`);
  const none = did.pieces.filter((p) => p.state === "never-reached").length;
  return `<details class="teach-here"${items.length ? " open" : ""}><summary>What your knowledge did here (${items.length})</summary><div class="body">
    ${items.length ? `<ul class="crit-outcomes teach-dids">${[...items.filter((x) => x.first), ...items.filter((x) => !x.first)].map((x) => didItem(run, x.p, x.places)).join("")}</ul>` : `<p class="note">None of your pieces acted in ${esc(sc.title)}.</p>`}
    <p class="note">This film was made with your knowledge: ${esc(words(made))}${none ? `; ${none} of its pieces never reached this story (open “What your knowledge did” beside the film made without it to see why)` : ""}. ${fileLink("teach")}</p></div></details>`;
}
// "How she looks": the looks your knowledge chose for her, each with its badge.
function teachLooks(run, c) {
  const did = knowledgeDid(run);
  if (!did) return "";
  const lines = did.pieces.filter((p) => p.kind === "looks").flatMap((p) => p.places.filter((pl) => pl.choicePoint && pl.character === c).map((pl) => `<p class="fix-line">You taught Ani that ${esc(p.words.charAt(0).toLowerCase() + p.words.slice(1).replace(/\.$/, ""))}: ${pl.state === "won" ? "Ani chose it" : pl.state === "combined" ? "Ani met it in the middle with another suggestion" : `Ani set it aside${pl.reasonWords ? `, ${esc(pl.reasonWords)}` : ""}`}. ${yoursBadge({ title: p.title, piece: p.piece, because: p.because })}</p>`));
  return lines.join("");
}
const shortDay = (iso) => { const d = new Date(iso); return isNaN(d) ? "" : d.toLocaleDateString(undefined, { day: "numeric", month: "long" }); };

// ---- files

async function saveNotebookFile(rec) {
  const nb = notebookOf(rec);
  const file = { ...nb, lisp: AniTeach.notebookToLisp(nb, { n: 1, extensions: teachLoaded() }) };
  return saveFile(new Blob([JSON.stringify(file, null, 1)], { type: "application/json" }), `${slug(rec.title).slice(0, 60).replace(/-$/, "") || "knowledge"}.ani-knowledge.json`);
}
// A notebook read from a file (one saved by Teach Ani, with or without its Lisp): checked as
// a notebook (src/teach.js), then added, under its own title.
async function openKnowledgeText(text, name) {
  let nb;
  try { nb = JSON.parse(text); } catch { throw new Error("That isn't a notebook of knowledge (it isn't JSON)."); }
  const c = AniTeach.checkNotebook(nb, { extensions: teachLoaded() });
  const format = c.refused.find((r) => r.code === "format");
  if (format) throw new Error(format.says);
  const rec = newNotebookRecord(String(nb.title || name.replace(/\.ani-knowledge\.json$|\.json$/i, "")).slice(0, 80), nb.pieces.filter((p) => p && p.id && AniTeach.PIECE_KINDS.includes(p.kind)).map((p) => ({ ...p })));
  rec.made = nb.made || rec.made;
  rec.file = name;
  TEACHING.notebooks.push(rec);
  await keepNotebook(rec);
  teachUi.open = rec.id;
  teachUi.note = esc(`Opened ${name}: “${rec.title}”, ${rec.pieces.length} piece${rec.pieces.length === 1 ? "" : "s"}.${rec.used ? "" : ` Tick “use” to make films with it (up to ${AniTeach.MAX_NOTEBOOKS} at once).`}`);
  openTeach({ notebook: rec.id });
  checkWithAni(rec);
}
function chooseKnowledgeFile() {
  // made afresh and never put in the page: the only file picker that opens everywhere
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.onchange = async () => {
    const file = input.files && input.files[0];
    if (!file) return;
    try { await openKnowledgeText(await file.text(), file.name); }
    catch (e) { teachUi.note = esc(e.message); if (state.panel === "teach") renderSide(); }
  };
  input.click();
}

// ---- what the panel's controls do

async function teachAct(el) {
  const rec = openNotebook();
  const d = el.dataset;
  if (d.teachKind !== undefined) {
    teachUi.form = teachUi.form && teachUi.form.kind === d.teachKind ? null : newForm(d.teachKind);
    renderSide();
    const f = document.getElementById("teach-form");
    if (f) f.scrollIntoView({ block: "nearest", behavior: "smooth" });
  } else if (d.teachSwitch !== undefined) {
    teachUi.form = newForm(d.teachSwitch, { word: teachUi.form.f.word, because: teachUi.form.f.because });
    renderSide();
  } else if (d.teachCancel !== undefined) {
    teachUi.form = null;
    renderSide();
  } else if (d.teachRowAdd !== undefined) {
    teachUi.form.f.rows.push({ element: "path-jaggedness", change: "up" });
    renderSide();
  } else if (d.teachRowOut !== undefined) {
    teachUi.form.f.rows.splice(Number(d.teachRowOut), 1);
    renderSide();
  } else if (d.teachAdd !== undefined) {
    await addFormToAni();
  } else if (d.teachOut !== undefined) {
    if (!rec) return;
    rec.pieces = rec.pieces.filter((p) => p.id !== d.teachOut);
    if (teachUi.check && teachUi.check.id === rec.id) teachUi.check = null;
    await saveNotebook(rec);
  } else if (d.teachRehearse !== undefined) {
    rehearsePiece(rec, d.teachRehearse);
  } else if (d.teachCheck !== undefined) {
    checkWithAni(rec);
  } else if (d.teachMake !== undefined) {
    makeWithKnowledge();
  } else if (d.teachCriticize !== undefined) {
    // a piece about one of the story's characters is criticism of the film: her glass box
    const base = teachBase();
    const c = base.cast.find((x) => x === d.teachCriticize || plain(x) === plain(d.teachCriticize)) || base.cast[0];
    if (state.view === "both" || base !== screenRun(0)) setView(base === RUNS[0] ? 0 : 1);
    select({ run: base === RUNS[0] ? 0 : 1, char: c });
  } else if (d.teachExample !== undefined) {
    const e = exampleOf(d.teachExample);
    if (e) { await useExample(e); if (!e.story) setRate(4); }
  } else if (d.teachExampleMake !== undefined) {
    const e = exampleOf(d.teachExampleMake);
    if (e) startRun(DATA.teach.stories[e.story], 4, e.extensions);
  } else if (d.teachExampleWith !== undefined) {
    const e = exampleOf(d.teachExampleWith);
    if (!e) return;
    const rec2 = await useExample(e);
    if (!e.story && RATE !== 4) setRate(4);
    const before = e.story ? exampleBefore(e) : RUNS[0];
    if (before) makeWithKnowledge(before, { notebooks: [rec2] });
  } else if (d.teachNb !== undefined) {
    await notebookAct(el.closest("[data-nb]") ? el.closest("[data-nb]").dataset.nb : null, d.teachNb, el);
  }
}
async function addFormToAni() {
  const form = teachUi.form;
  let rec = openNotebook();
  if (!rec) { rec = newNotebookRecord(); TEACHING.notebooks.push(rec); teachUi.open = rec.id; }
  const pieces = formPieces(form, rec);
  if (!String(form.f.because || "").trim() || !pieces.length) { renderSide(); return; }
  const c = pageCheck(rec, { pieces: [...rec.pieces, ...pieces] });
  const ids = new Set(pieces.map((p) => p.id));
  if (c.refused.some((r) => ids.has(r.piece) || r.piece === null)) { renderSide(); return; }
  rec.pieces.push(...pieces);
  teachUi.form = null;
  teachUi.highlight = pieces[0].id;
  teachUi.note = esc(`Added to “${rec.title}”: ${pieces.map((p) => AniTeach.pieceWords(p)).join(" ")}`);
  await saveNotebook(rec);
  checkWithAni(rec);
}
async function notebookAct(id, act, el) {
  const rec = TEACHING.notebooks.find((n) => n.id === id);
  const status = (t) => { const s = document.getElementById("teach-status"); if (s) s.textContent = t; };
  if (act === "new") {
    const n = newNotebookRecord();
    TEACHING.notebooks.push(n);
    teachUi.open = n.id;
    teachUi.check = null;
    await keepNotebook(n);
    teachChanged();
  } else if (act === "file") chooseKnowledgeFile();
  else if (!rec) return;
  else if (act === "open") { teachUi.open = id; teachUi.form = null; renderSide(); }
  else if (act === "rename") { teachUi.renaming = id; renderSide(); const i = document.querySelector("[data-teach-title]"); if (i) { i.focus(); i.select(); } }
  else if (act === "rename-yes") {
    const t = (document.querySelector("[data-teach-title]") || {}).value;
    teachUi.renaming = null;
    const title = String(t || "").replace(/\s+/g, " ").trim();
    if (title && title !== rec.title) { rec.title = title; await saveNotebook(rec); } else renderSide();
  } else if (act === "rename-no") { teachUi.renaming = null; renderSide(); }
  else if (act === "save") status(await saveNotebookFile(rec));
  else if (act === "delete") { teachUi.confirm = id; renderSide(); }
  else if (act === "delete-no") { teachUi.confirm = null; renderSide(); }
  else if (act === "delete-yes") {
    teachUi.confirm = null;
    TEACHING.notebooks = TEACHING.notebooks.filter((n) => n !== rec);
    await forgetNotebook(rec.id);
    if (teachUi.open === id) teachUi.open = TEACHING.notebooks[0] ? TEACHING.notebooks[0].id : null;
    teachChanged();
  }
}
// the panel's inputs: a form's fields (a text field changes the preview and the checks as it
// is typed; a menu draws the form again, its menus following), a notebook's "use"
function onTeachInput(e) {
  if (state.panel !== "teach") return;
  const el = e.target;
  if (el.matches && el.matches("[data-teach-use]")) {
    if (e.type !== "change") return;
    const rec = TEACHING.notebooks.find((n) => n.id === el.closest("[data-nb]").dataset.nb);
    if (!rec) return;
    rec.used = el.checked && (rec.used || usedNotebooks().length < AniTeach.MAX_NOTEBOOKS);
    keepNotebook(rec).then(teachChanged);
    return;
  }
  const field = el.dataset && el.dataset.tf;
  if (!field || !teachUi.form) return;
  const f = teachUi.form.f;
  const row = /^row-(\d+)-(element|change)$/.exec(field);
  if (row) {
    const r = f.rows[Number(row[1])];
    r[row[2]] = el.value;
    if (row[2] === "element" && !(AniTeach.FEELING_CHANGES[r.element] || []).includes(r.change)) r.change = AniTeach.FEELING_CHANGES[r.element][0];
  } else f[field] = el.value;
  if (el.tagName === "SELECT") { if (e.type === "change") renderSide(); return; }
  // typed: the checks and the Lisp follow, and the form keeps its focus
  const rec = openNotebook() || draftNotebook();
  const pieces = formPieces(teachUi.form, rec);
  const ids = new Set(pieces.map((p) => p.id));
  const c = rec && String(f.because || "").trim() && pieces.length ? pageCheck(rec, { pieces: [...rec.pieces, ...pieces] }) : null;
  const box = document.getElementById("teach-form-check");
  if (box) box.innerHTML = formCheck(teachUi.form, pieces, c ? c.refused.filter((r) => ids.has(r.piece) || r.piece === null) : [], c ? c.warnings.filter((r) => ids.has(r.piece)) : []);
  const lisp = document.getElementById("teach-form-lisp");
  if (lisp && rec) lisp.innerHTML = lispPreview(rec, pieces);
  // a word Ani knows, typed into "a new word", says so at once
  if (field === "word" && e.type === "change" && (teachUi.form.kind === "word" || teachUi.form.kind === "relationship")) renderSide();
}
document.getElementById("side").addEventListener("input", onTeachInput);
document.getElementById("side").addEventListener("change", onTeachInput);
// Teach Ani's buttons, wherever they are: the panel's, the editor's "+ teach Ani a word",
// criticism's "Teach Ani instead", and the glass box's "your knowledge" badges.
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest("button, a");
  if (!b) return;
  if (b.dataset.yours !== undefined) {
    const [title, piece] = b.dataset.yours.split("|");
    const rec = notebookNamed(title);
    if (rec) openTeach({ notebook: rec.id, piece });
    else openTeach({ note: esc(`This film was made with “${title}” as it was then; that notebook is no longer in this browser. The film keeps its own copy, which “What your knowledge did” reads.`) });
    return;
  }
  if (b.dataset.teachOpen !== undefined) {
    let given = {};
    try { given = JSON.parse(b.dataset.teachOpen || "{}"); } catch { given = {}; }
    openTeach(given);
    return;
  }
  if (b.dataset.teachMakeEditor !== undefined) { makeEditorWithKnowledge(); return; }
  if (state.panel === "teach" && Object.keys(b.dataset).some((k) => k.startsWith("teach"))) teachAct(b);
});
// a notebook's title, renamed with Enter
document.getElementById("side").addEventListener("keydown", (e) => {
  if (state.panel !== "teach" || !e.target.matches || !e.target.matches("[data-teach-title]")) return;
  if (e.key === "Enter") notebookAct(teachUi.renaming, "rename-yes");
  else if (e.key === "Escape") notebookAct(teachUi.renaming, "rename-no");
});
