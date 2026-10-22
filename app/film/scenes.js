// ---------------------------------------------------------------- the scenes and the film, in "Change the story"

// Beside the characters and their relationships, "Change the story" has a card for each
// scene, with its title, its tasks in plain words (each with a button to take it out, and
// "+ add" offering only tasks Ani can plan: the page's own checks, taskVerdict, which the
// tidy step and "Tell Ani what's wrong" use) and menus for its mood, rhythm and length; and
// the film's own settings: its length, and the levels Ani's choices read, each with a line
// on what it changes, from Ken's code. A level nothing in Ani reads (the rhythm level), the
// film's mood and its focus are said, not offered. Each menu changes only its own form in
// the text, as Ken laid it out (setWords does so for a character), so a description no one
// changes is byte for byte as it was, and the text and the menus follow each other.

// The forms inside the form that opens at open: the span of each of its parts in
// parentheses, read as Ken's reader reads them (comments, |...| and "..." skipped, /
// escaping the next character), and where the form closes.
function innerForms(text, open) {
  const kids = [];
  let depth = 0, start = -1;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === ";") { const nl = text.indexOf("\n", i); if (nl < 0) break; i = nl; continue; }
    if (c === "/") { i++; continue; }
    if (c === "|" || c === '"') { const j = text.indexOf(c, i + 1); if (j < 0) break; i = j; continue; }
    if (c === "(") { if (depth === 1) start = i; depth++; }
    else if (c === ")") { depth--; if (depth === 1) kids.push({ start, end: i + 1 }); if (depth === 0) return { kids, close: i }; }
  }
  return { kids, close: -1 };
}
const formOf = (text, s) => parse(uncomment(text.slice(s.start, s.end)));
// A definition's settings, (set your mood to ...) and (set your level of variety to ...):
// { key ("mood", "level of variety"), value (as Lisp), span }.
function settingsIn(text, span) {
  return innerForms(text, span.start).kids.map((s) => {
    const f = formOf(text, s);
    if (!Array.isArray(f) || f[0] !== "set" || f[1] !== "your") return null;
    if (f[2] === "level" && f[3] === "of" && f[5] === "to" && f.length === 7) return { key: `level of ${f[4]}`, value: show(f[6]), span: s };
    return f[3] === "to" && f.length === 5 ? { key: String(f[2]), value: show(f[4]), span: s } : null;
  }).filter(Boolean);
}
// The text with a definition's setting given a value (Lisp), or taken out (null): the form
// itself changed where it is, a comment after it kept; one not there yet goes under the
// definition's last part, indented as it is.
function withSetting(text, span, key, value) {
  const at = settingsIn(text, span).find((x) => x.key === key);
  const form = value === null || value === undefined ? null : `(set your ${key} to ${value})`;
  if (at) {
    if (form) return at.value === value ? text : text.slice(0, at.span.start) + form + text.slice(at.span.end);
    let s = at.span.start, e = at.span.end;
    while (s > 0 && (text[s - 1] === " " || text[s - 1] === "\t")) s--;
    if (s > 0 && text[s - 1] === "\n") s--;
    const nl = text.indexOf("\n", e), rest = text.slice(e, nl < 0 ? text.length : nl);
    // its comment goes with it (Ken's ";this is relative to the film's rhythm")
    if (/^[ \t]*;/.test(rest)) e += rest.length;
    return text.slice(0, s) + text.slice(e);
  }
  if (!form) return text;
  const { kids, close } = innerForms(text, span.start);
  const last = kids[kids.length - 1];
  if (!last || close < 0) return text;
  const lineStart = text.lastIndexOf("\n", last.start - 1) + 1;
  const lead = /^[ \t]*$/.test(text.slice(lineStart, last.start)) ? text.slice(lineStart, last.start) : "\t";
  let put = last.end;
  if (text.slice(last.end, close).includes(";")) { const nl = text.indexOf("\n", last.end); if (nl >= 0 && nl < close) put = nl; }
  return text.slice(0, put) + `\n${lead}${form}` + text.slice(put);
}
// the film's definition, the first (define ... film ...), as readStory reads its levels
function filmSpan(text) {
  const { forms } = topForms(text);
  return forms.find((f) => /^\(define\s+[^\s()]+\s+film\b/i.test(text.slice(f.start, Math.min(f.end, f.start + 200)))) || null;
}
// the film's settings, { key: value (Lisp) }
function filmSettings(text) {
  const span = filmSpan(text);
  return span ? Object.fromEntries(settingsIn(text, span).map((x) => [x.key, x.value])) : {};
}
// A film length, (interval (minutes 2) (minutes 5)), in seconds, as SCENE reads it
// (secondify, scene.9:366-371): [least, most], or null.
function filmLengthSeconds(v) {
  const x = typeof v === "string" ? parse(v) : v;
  const secs = (t) => (Array.isArray(t) && t.length === 2 && /^\d+(\.\d+)?$/.test(String(t[1])) ? (t[0] === "minutes" ? 60 * Number(t[1]) : t[0] === "seconds" ? Number(t[1]) : NaN) : NaN);
  if (!Array.isArray(x) || x[0] !== "interval" || x.length !== 3) return null;
  const r = [secs(x[1]), secs(x[2])];
  return r.every((n) => Number.isFinite(n)) ? r : null;
}

// ---- a scene's tasks, as a tree of spans

// The scene's (process initial description TASKS): each (and ...) and (sequence: ...) with
// its parts, each task a leaf, with its span in the text.
function sceneTasks(text, span) {
  const proc = innerForms(text, span.start).kids.find((k) => { const f = formOf(text, k); return Array.isArray(f) && f[0] === "process"; });
  const top = proc && innerForms(text, proc.start).kids[0];
  if (!top) return null;
  const node = (s, parent) => {
    const form = formOf(text, s);
    const n = { start: s.start, end: s.end, form, parent, kids: null };
    if (Array.isArray(form) && (form[0] === "and" || form[0] === "sequence:")) n.kids = innerForms(text, s.start).kids.map((k) => node(k, n));
    return n;
  };
  return node(top, null);
}
const leavesOf = (n) => (n.kids ? n.kids.flatMap(leavesOf) : [n]);
const treeOf = (text, id) => { const sc = readStory(text).scenes[id]; return sc && sc.span ? sceneTasks(text, sc.span) : null; };
// The text with a part taken out: with the space before it (or, the first, after it); a
// part that leaves one beside it in its (and ...) or (sequence: ...) leaves that one alone
// in its place; one alone in its, the (and ...) too.
function cutNode(text, n) {
  const p = n.parent;
  if (!p) return text;
  if (p.kids.length === 1) return cutNode(text, p);
  if (p.kids.length === 2) {
    const other = p.kids[p.kids[0] === n ? 1 : 0];
    return text.slice(0, p.start) + text.slice(other.start, other.end) + text.slice(p.end);
  }
  let s = n.start, e = n.end;
  if (p.kids[0] === n) { while (e < text.length && /\s/.test(text[e])) e++; } else { while (s > 0 && /\s/.test(text[s - 1])) s--; }
  return text.slice(0, s) + text.slice(e);
}
// the text without a scene's k-th task (never its only one)
function withoutTask(text, id, k) {
  const root = treeOf(text, id), leaf = root && leavesOf(root)[k];
  return !leaf || leaf === root ? text : cutNode(text, leaf);
}
// The text with a task added to a scene: in its (and ...), under the last, as Ken laid
// them out; in a (sequence: ...), in the step asked for (by default the last), or as a new
// step at its end ("new"); a task alone put in an (and ...) with it.
function withTask(text, id, task, step = null) {
  const root = treeOf(text, id);
  if (!root) return text;
  const seq = Array.isArray(root.form) && root.form[0] === "sequence:" && root.kids.length;
  const target = !seq || step === "new" ? root : root.kids[step === null || step === undefined ? root.kids.length - 1 : Math.min(Number(step), root.kids.length - 1)];
  const t = show(task);
  const lead = (at) => { const ls = text.lastIndexOf("\n", at - 1) + 1; return text.slice(ls, at).replace(/[^\t ]/g, " "); };
  if (target.kids && target.kids.length) {
    const last = target.kids[target.kids.length - 1];
    return text.slice(0, last.end) + "\n" + lead(last.start) + t + text.slice(last.end);
  }
  return text.slice(0, target.start) + "(and " + text.slice(target.start, target.end) + "\n" + lead(target.start) + "     " + t + ")" + text.slice(target.end);
}

// ---- the tasks Ani can plan

// What "+ add" offers a scene: every task of these kinds, for the story's cast, that the
// page's checks find Ani can plan (taskVerdict: nothing wrong, or a stop the extensions
// the film is made with go on from), and isn't in the scene already. A change of someone
// (REVIVE;CHANGE) is written in the text. Each: { kind, args, task }.
const TASK_KINDS = {
  personality: "What someone is like",
  feeling: "How someone feels",
  relationship: "How one feels about another",
  accompanys: "One goes along with another",
  chases: "One chases another",
  hurts: "One hurts another",
  pushes: "One pushes another around",
  alone: "Two are alone together",
  "getting-it-on": "Two are “getting it on”",
  meets: "One goes to meet another",
  helps: "One helps another",
  follows: "One follows another",
  avoids: "One keeps away from another",
  wants: "One wants to meet another",
  prevents: "One keeps two from meeting",
  aware: "One sees two “getting it on”",
  undoes: "One undoes what someone did in an earlier scene",
};
function plannableTasks(story, id, extensions = modeExtensions()) {
  const ids = Object.keys(story.scenes), earlier = ids.slice(0, ids.indexOf(id));
  const cast = Object.keys(story.characters);
  const have = new Set(tasksOf(story.scenes[id].tasks).map(show));
  const out = [];
  const add = (kind, args, task) => {
    if (have.has(show(task))) return;
    const v = taskVerdict(story, id, earlier, task, extensions);
    if (v && (v.bad || !v.stop || !extensions.includes(v.stop.change ? "change" : v.stop.know ? "know" : "mend"))) return;
    out.push({ kind, args, task });
  };
  const pairs = cast.flatMap((a) => cast.filter((b) => b !== a).map((b) => [a, b]));
  for (const a of cast) add("personality", [a], ["establish", ["personality", a]]);
  const signed = signedFeelings(extensions);
  for (const a of cast) for (const f of feelingWords(extensions)) for (const sign of signed.includes(f) ? ["positive", "negative"] : ["positive"]) for (const amount of LEVEL_WORDS) {
    const fe = [f, [sign, amount]];
    add("feeling", [a, show(fe)], ["establish", ["emotional-state", a, fe]]);
  }
  for (const r of story.relationships) add("relationship", [`${r.from} ${r.to}`], ["establish", ["relationship", ["relationship-of", r.from, r.to]]]);
  for (const v of pairVerbs(extensions)) for (const [a, b] of pairs) if (v !== "alone" && v !== "getting-it-on" || a < b) add(v, [a, b], ["convey", [v, a, b]]);
  for (const [a, b] of pairs) add("wants", [a, b], ["convey", ["wants", a, ["meets", a, b]]]);
  for (const a of cast) for (const [b, c] of pairs) if (b !== a && c !== a && b < c) add("prevents", [a, b, c], ["convey", ["prevents", a, ["meets", b, c]]]);
  for (const a of cast) for (const [b, c] of pairs) if (b !== a && c !== a && b < c) add("aware", [a, b, c], ["convey", ["aware", a, ["getting-it-on", b, c]]]);
  for (const e of earlier) for (const t of tasksOf(story.scenes[e].tasks)) {
    if (!Array.isArray(t) || t[0] !== "convey" || !Array.isArray(t[1]) || ["undoes", "change", "causes"].includes(t[1][0])) continue;
    for (const a of cast) add("undoes", [a, `${e} ${show(t)}`], ["convey", ["undoes", a, ["from-scene", e, t]]]);
  }
  return out;
}
// what each of a kind's choices is: a character, a feeling, a relationship, a task undone
function argLabel(story, kind, k, v) {
  return using({ story, cast: Object.keys(story.characters) }, () => {
    if (kind === "feeling" && k === 1) return feeling(parse(v));
    if (kind === "relationship") { const [a, b] = v.split(" "); return `${cap(nameOf(story, a))} → ${nameOf(story, b)}`; }
    if (kind === "undoes" && k === 1) { const sp = v.indexOf(" "), e = v.slice(0, sp), t = parse(v.slice(sp + 1)); return `${titleOf(story, e)}: ${unhtml(about(t[1]))}`; }
    return cap(nameOf(story, v));
  });
}
const ARG_NAMES = { feeling: ["Who", "Feeling"], relationship: ["Who, about whom"], prevents: ["Who", "Keeps", "From meeting"], aware: ["Who", "Sees", "With"], undoes: ["Who", "What"], personality: ["Who"] };
const argName = (kind, k) => (ARG_NAMES[kind] || ["Who", "Whom"])[k] || "";

// ---- what the settings are, and what they change (Ken's code, and the thesis)

// A scene's settings, as Ken gave them in CINDY 46 (his commented-out scenes too) and as
// Ani reads them: the length as NUMBERIFY reads it (cosug.215:771-776), the rhythm as the
// revival's DETAIL reads it (REVIVE;DTRHYM rhythm-for-subscene), the mood as Ken wrote it
// (nothing reads it); SCENE's defaults, normal and medium (scene.9:9-10).
const SCENE_SETTING = {
  mood: { values: ["normal", "hopeful", "depressing", "joyous", "anticipatory", "(very joyous)", "(and joyous anticipatory)", "(changes hopeful depressing)", "(changes depressing joyous)"], unset: "normal" },
  rhythm: { values: ["normal", "fast", "slow", "picking-up", "(changes fast slow)", "(changes slow fast)"], unset: null },
  length: { values: ["short", "medium", "long"], unset: "medium" },
};
const settingLabel = (key) => ({ mood: at611("Mood", "Mood"), rhythm: at611("Rhythm", "Pace"), length: at611("Length", "How long") })[key];
// a setting's value in words, as the scene cards say it (at 6–11, kidSettings's way)
const settingValueWords = (v) => (simpleAge() ? (/^\(changes /.test(v) ? (() => { const x = parse(v); return `${plain(x[1])}, then ${plain(x[2])}`; })() : /^\(and /.test(v) ? words(parse(v).slice(1).map(plain)) : plain(String(v).replace(/[()]/g, ""))) : v === "picking-up" ? "picking up" : settingWords(v).replace(/-/g, " "));
// The film's levels, as Ken set them (cindy.46:157-166) and film.17 gives them by default
// (film.17:20-27), with what each changes in Ani's choices; the rhythm level, which nothing
// reads, is said, not offered.
const FILM_DEFAULTS = { variety: "medium", complexity: "low", originality: "medium", coherence: "high", obviousness: "medium", energy: "medium", flashiness: "medium", rhythm: "medium" };
const LEVEL_NOTES = {
  variety: [
    () => `how much Ani avoids what it has used most: each way of showing scores lower the more it has been chosen, and the film's variety weighs that score (${kenAt("chomet.123:251-252")}, ${kenAt("chomet.123:436-439")}); for every element it suggests, weakly, the value chosen least (high), most (low) or in between (medium) (${kenAt("glosug.41:43-74")}); and it sets how many times an activity is repeated (${kenAt("place.45:407-422")}).`,
    "How much Ani mixes things up: high picks what it has used least, low what it has used most.",
  ],
  complexity: [
    () => `how many ways of conveying a task Ani narrows its choice down to before choosing: (1 + complexity + obviousness + the scene's length) / 3, each low, medium or high counting 1, 2 or 3 (${kenAt("chomet.123:478-490")}, ${kenAt("chomet.123:516-525")}). It decides nothing in pass 1, only how a scene is planned.`,
    "How many ways Ani uses to show each thing in a scene.",
  ],
  originality: [
    () => `how Ani settles two conflicting suggestions of different strengths for one choice: high takes the weaker, low the stronger, medium the average weighted by strength (${kenAt("cosug.215:851-863")}); a way of showing scores lower each time it has been used before, and originality weighs that (${kenAt("chomet.123:249-250")}, ${kenAt("chomet.123:423-434")}); and, low or high, it suggests values used before, or the least common (${kenAt("glosug.41:87-120")}).`,
    "How much Ani avoids doing what it did before: high tries new ways, low repeats old ones.",
  ],
  coherence: [
    () => `how much a way of showing's prerequisites, its best-when and how well it fits the time count when Ani chooses it (${kenAt("chomet.123:243-248")}). It decides nothing in pass 1, only how a scene is planned.`,
    "How much Ani cares that each way of showing fits what is happening and the time there is.",
  ],
  obviousness: [
    () => `how much a suggestion's strength counts when Ani chooses a way of showing (${kenAt("chomet.123:241-242")}); with complexity, how many ways of conveying it narrows a task's choice to (${kenAt("chomet.123:486")}); where two conflicting suggestions are equally strong, high takes the one that isn't medium, and otherwise medium wins (${kenAt("cosug.215:837-845")}, ${kenAt("cosug.215:917-923")}); and how many times an activity is repeated (${kenAt("place.45:407-422")}).`,
    "How much Ani goes for the clearest, most strongly suggested ways of showing.",
  ],
  flashiness: [
    () => `a suggestion for every element of how the characters move (speed, activity, ...), the value the level says: high, medium or low (${kenAt("glosug.41:25-41")}; Ken's comment there: bigger and brighter could be flashier too, not done).`,
    "Pushes how everyone moves towards high, medium or low: quicker and busier, or calmer.",
  ],
  energy: [
    () => `a suggestion for every element of how the characters move, the value the level says: high, medium or low (${kenAt("glosug.41:11-23")}), as flashiness does.`,
    "Like flashiness: pushes how everyone moves towards high, medium or low.",
  ],
};
const LEVEL_ORDER = ["variety", "complexity", "originality", "coherence", "obviousness", "flashiness", "energy"];
// what is said, and not offered: Ken's settings nothing in Ani changes with, and the focus
const notOffered = () => at611(
  `<p class="note">Not offered: the film's <b>level of rhythm</b>, which Ani's code defines (${kenAt("glosug.41:150")}) and nothing reads (Ken: “medium-fast was here but not supported so...”, ${kenAt("cindy.46:161")}); the film's <b>mood</b>, “scene-dependent”, which nothing reads either (${kenAt("film.17:29")}); and its <b>focus</b>, which orders Ani's choices (${kenAt("chocho.19:16-45")}, ${kenAt("nodes.38:38-58")}) and names a definition of its own: change it in the text.</p>`,
  `<p class="note">Some of Ken's settings aren't here, because Ani doesn't use them: the film's rhythm and its mood. What Ani thinks about first (its focus) can be changed in the text.</p>`);

// ---- the cards

// the editor's state for "+ add": which scene, kind and choices
const adding = { scene: null, kind: null, args: [], step: null };
function settingMenu(id, key, cur) {
  const S = SCENE_SETTING[key];
  const values = [...S.values, ...(cur && !S.values.includes(cur) ? [cur] : [])];
  const unsetLabel = S.unset ? at611(`not set (${settingValueWords(S.unset)}, Ani's default)`, `not set (${settingValueWords(S.unset)})`) : "not set";
  return `<label class="ed-set"><span>${settingLabel(key)}</span><select data-scene-set="${esc(key)}" data-scene="${esc(id)}" aria-label="${esc(settingLabel(key))} of the scene"><option value=""${cur ? "" : " selected"}>${esc(unsetLabel)}</option>${values.map((v) => `<option value="${esc(v)}"${v === cur ? " selected" : ""}>${esc(settingValueWords(v))}${S.values.includes(v) ? "" : " (as written)"}</option>`).join("")}</select></label>`;
}
function taskLine(story, t) {
  return using({ story, cast: Object.keys(story.characters) }, () => {
    const x = taskText(t[0], t[1]);
    return simpleAge() ? x.replace(/^to (establish|convey) /, "") : cap(x.replace(/^to /, ""));
  });
}
function sceneCards(text, story) {
  const ids = Object.keys(story.scenes);
  return ids.map((id) => {
    const sc = story.scenes[id];
    const root = sc.span ? sceneTasks(text, sc.span) : null;
    const leaves = root ? leavesOf(root) : [];
    const set = Object.fromEntries((sc.span ? settingsIn(text, sc.span) : []).map((x) => [x.key, x.value]));
    const seq = root && root.kids && root.form[0] === "sequence:";
    let k = 0;
    const li = (n) => { const i = k++; return `<li><span>${taskLine(story, n.form)}</span>${leaves.length > 1 ? `<button type="button" class="ed-x" data-task-remove="${i}" data-scene="${esc(id)}" aria-label="Take out: ${esc(unhtml(taskLine(story, n.form)))}">×</button>` : ""}</li>`; };
    const tasks = !root ? "" : seq
      ? `<ol class="ed-steps">${root.kids.map((step) => `<li><ul class="ed-tasks">${leavesOf(step).map(li).join("")}</ul></li>`).join("")}</ol>`
      : `<ul class="ed-tasks">${leaves.map(li).join("")}</ul>`;
    const open = adding.scene === id;
    return `<div class="ed-scene" data-scene-card="${esc(id)}"><b>${esc(titleOf(story, id))}</b>
      ${seq ? `<p class="note">${at611(`Step by step, in this order (Ken's (sequence: ...)); the tasks of a step together, in any order Ani likes (${kenAt("scene.9:385-386")}).`, "One step after another; the things in a step happen together.")}</p>` : ""}
      ${tasks}
      ${open ? addBox(story, id, root) : `<div class="actions"><button type="button" class="linkish" data-add-open="${esc(id)}">${at611("+ add a task", "+ add something to show")}</button></div>`}
      <div class="ed-sets">${["mood", "rhythm", "length"].map((key) => settingMenu(id, key, set[key] || null)).join("")}</div>
    </div>`;
  }).join("");
}
function addBox(story, id, root) {
  const all = plannableTasks(story, id);
  const kinds = Object.keys(TASK_KINDS).filter((kd) => all.some((x) => x.kind === kd));
  if (!kinds.length) return `<p class="note">There is nothing more Ani can plan in this scene. <button type="button" class="linkish" data-add-cancel>Close</button></p>`;
  if (!kinds.includes(adding.kind)) adding.kind = kinds[0];
  let fit = all.filter((x) => x.kind === adding.kind);
  const n = fit[0].args.length;
  const menus = [];
  for (let k = 0; k < n; k++) {
    const opts = [...new Set(fit.map((x) => x.args[k]))];
    if (!opts.includes(adding.args[k])) adding.args[k] = opts[0];
    menus.push(`<label class="ed-set"><span>${esc(argName(adding.kind, k))}</span><select data-add-arg="${k}">${opts.map((v) => `<option value="${esc(v)}"${v === adding.args[k] ? " selected" : ""}>${esc(argLabel(story, adding.kind, k, v))}</option>`).join("")}</select></label>`);
    fit = fit.filter((x) => x.args[k] === adding.args[k]);
  }
  adding.args.length = n;
  const seq = root && root.kids && root.form[0] === "sequence:";
  const steps = seq ? root.kids.length : 0;
  if (seq && !(adding.step === "new" || (Number(adding.step) >= 0 && Number(adding.step) < steps))) adding.step = String(steps - 1);
  const stepMenu = seq ? `<label class="ed-set"><span>${at611("Where", "Where")}</span><select data-add-step>${root.kids.map((_, i) => `<option value="${i}"${String(i) === String(adding.step) ? " selected" : ""}>with step ${i + 1}</option>`).join("")}<option value="new"${adding.step === "new" ? " selected" : ""}>as step ${steps + 1}, at the end</option></select></label>` : "";
  const task = fit[0].task;
  return `<div class="ed-add">
    <label class="ed-set"><span>${at611("Task", "What")}</span><select data-add-kind>${kinds.map((kd) => `<option value="${kd}"${kd === adding.kind ? " selected" : ""}>${esc(TASK_KINDS[kd])}</option>`).join("")}</select></label>
    ${menus.join("")}${stepMenu}
    <p class="note">${at611("Ani will be told", "Ani will be asked")} ${(taskLine(story, task).replace(/^./, (c) => c.toLowerCase()).replace(/^(?!to )/, simpleAge() ? "to show " : "to "))}.</p>
    <div class="actions"><button type="button" class="btn" data-add-go="${esc(id)}">Add it</button><button type="button" class="linkish" data-add-cancel>Cancel</button></div>
  </div>`;
}
// the film's settings: its length, and its levels, each with what it changes
function filmBox(text, story) {
  const span = filmSpan(text);
  if (!span) return `<p class="note">${at611("This description defines no film, so there are no film settings to change.", "This story has no film settings.")}</p>`;
  const set = filmSettings(text);
  const len = set["film-length"] || null, secs = len ? filmLengthSeconds(len) : null;
  const MIN = [1, 2, 3, 4, 5, 6, 8, 10];
  const [lo, hi] = secs ? secs.map((s) => s / 60) : [null, null];
  const opt = (v, cur) => `<option value="${v}"${v === cur ? " selected" : ""}>${v}</option>`;
  const minutes = (which, cur) => `<select data-film-length="${which}" aria-label="${which === "lo" ? "Shortest" : "Longest"}, in minutes">${!secs ? `<option value="" selected>${len ? "as written" : "not set"}</option>` : ""}${[...new Set([...MIN, ...(cur ? [cur] : [])])].sort((a, b) => a - b).map((v) => opt(v, cur)).join("")}</select>`;
  const lengthRow = `<div class="ed-film-row"><span class="ed-film-k">${at611("Length", "How long")}</span><span class="ed-film-v">${minutes("lo", lo)} to ${minutes("hi", hi)} minutes${!len ? ` <span class="note">(not set: one to four, Ani's default)</span>` : !secs ? ` <span class="note">(written ${esc(len)})</span>` : ""}</span><span class="note ed-film-why">${at611(`Each scene gets its share of it by its length, short 1, medium 2 and long 3 (${kenAt("scene.9:346-364")}), and Ani fits the scene's tasks into that share (${kenAt("chomet.123:39-60")}).`, "Each scene gets part of this time: a long scene three times as much as a short one.")}</span></div>`;
  const rows = LEVEL_ORDER.map((l) => {
    const cur = set[`level of ${l}`] || null;
    const vals = [...LEVEL_WORDS, ...(cur && !LEVEL_WORDS.includes(cur) ? [cur] : [])];
    const sel = `<select data-film-level="${l}" aria-label="The film's ${l}"><option value=""${cur ? "" : " selected"}>not set (${FILM_DEFAULTS[l]}, Ani's default)</option>${vals.map((v) => `<option value="${esc(v)}"${v === cur ? " selected" : ""}>${esc(v)}${LEVEL_WORDS.includes(v) ? "" : " (as written)"}</option>`).join("")}</select>`;
    return `<div class="ed-film-row"><span class="ed-film-k">${esc(cap(l))}</span><span class="ed-film-v">${sel}</span><span class="note ed-film-why">${simpleAge() ? esc(LEVEL_NOTES[l][1]) : cap(LEVEL_NOTES[l][0]())}</span></div>`;
  }).join("");
  return `${lengthRow}${rows}${notOffered()}`;
}
// what the scenes' settings change, said once above the cards
function sceneSettingsNote() {
  const detail = modeExtensions().includes("detail");
  return at611More(
    `<p class="note"><b>Length</b> is a scene's share of the film's length, short, medium or long counting 1, 2 or 3 (${kenAt("scene.9:346-364")}), and, with the film's complexity and obviousness, how many ways of conveying each of its tasks Ani narrows its choice to (${kenAt("chomet.123:478-490")})${modeExtensions().includes("fit") ? "; with FIT, the revival's, a scene keeps the time its length gives it (REVIVE;FIT)" : ""}. <b>Rhythm</b>: Ani as in 1978 doesn't read a scene's rhythm (Ken wrote “this is relative to the film's rhythm”, ${kenAt("cindy.46:61")}, and nothing asks for it); with DETAIL, the revival's, fast and slow speed a scene's characters up or slow them down a quarter, and a changing rhythm goes from its first value in the first part to its last in the last (REVIVE;DTRHYM)${detail ? "" : "; DETAIL isn't ticked, so here it changes nothing"}. <b>Mood</b>: nothing in Ani reads a scene's mood (SCENE sets it to normal, ${kenAt("scene.9:9")}, and no file asks for it), so it changes nothing in the film; Ken gave each scene one, and the page shows it.</p>`,
    `<p class="note">How long a scene is decides how much of the film's time it gets. Ani from 1978 doesn't use a scene's pace${detail ? " (here a new part does: a fast scene's characters move a little quicker, a slow one's a little slower)" : ""}, or its mood, so changing those changes nothing in the film.</p>`,
    "More: what these settings change");
}

// ---- the menus, changing the text

function onScenesChange(e) {
  const t = e.target;
  if (t.matches("select[data-scene-set]")) {
    const sc = readStory(editor.text).scenes[t.dataset.scene];
    if (!sc || !sc.span) return;
    setEditorText(withSetting(editor.text, sc.span, t.dataset.sceneSet, t.value || null));
    refocus(`select[data-scene-set="${t.dataset.sceneSet}"][data-scene="${t.dataset.scene}"]`);
  } else if (t.matches("select[data-film-level]")) {
    const span = filmSpan(editor.text);
    if (!span) return;
    setEditorText(withSetting(editor.text, span, `level of ${t.dataset.filmLevel}`, t.value || null));
    refocus(`select[data-film-level="${t.dataset.filmLevel}"]`);
  } else if (t.matches("select[data-film-length]")) {
    const span = filmSpan(editor.text);
    if (!span || !t.value) return;
    const secs = filmLengthSeconds(filmSettings(editor.text)["film-length"] || "(interval (minutes 1) (minutes 4))") || [60, 240];
    let [lo, hi] = secs.map((s) => s / 60);
    if (t.dataset.filmLength === "lo") { lo = Number(t.value); if (hi < lo) hi = lo; } else { hi = Number(t.value); if (lo > hi) lo = hi; }
    setEditorText(withSetting(editor.text, span, "film-length", `(interval (minutes ${lo}) (minutes ${hi}))`));
    refocus(`select[data-film-length="${t.dataset.filmLength}"]`);
  } else if (t.matches("select[data-add-kind]")) { adding.kind = t.value; adding.args = []; refreshEditor(); refocus("select[data-add-kind]"); }
  else if (t.matches("select[data-add-arg]")) { adding.args[Number(t.dataset.addArg)] = t.value; adding.args.length = Number(t.dataset.addArg) + 1; refreshEditor(); refocus(`select[data-add-arg="${t.dataset.addArg}"]`); }
  else if (t.matches("select[data-add-step]")) { adding.step = t.value; refreshEditor(); refocus("select[data-add-step]"); }
}
function onScenesClick(e) {
  const b = e.target.closest && e.target.closest("button");
  if (!b) return;
  if (b.dataset.taskRemove !== undefined) {
    setEditorText(withoutTask(editor.text, b.dataset.scene, Number(b.dataset.taskRemove)));
    refocus(`[data-scene-card="${b.dataset.scene}"] [data-add-open]`);
  } else if (b.dataset.addOpen !== undefined) {
    Object.assign(adding, { scene: b.dataset.addOpen, kind: null, args: [], step: null });
    refreshEditor();
    refocus("select[data-add-kind]");
  } else if (b.dataset.addCancel !== undefined) {
    const id = adding.scene;
    adding.scene = null;
    refreshEditor();
    refocus(`[data-scene-card="${id}"] [data-add-open]`);
  } else if (b.dataset.addGo !== undefined) {
    const id = b.dataset.addGo, story = readStory(editor.text);
    const x = story.scenes[id] && plannableTasks(story, id).find((y) => y.kind === adding.kind && y.args.join("|") === adding.args.join("|"));
    if (!x) return;
    const step = adding.step;
    adding.scene = null;
    setEditorText(withTask(editor.text, id, x.task, step));
    refocus(`[data-scene-card="${id}"] [data-add-open]`);
  } else if (b.id === "ed-open-text") {
    const box = document.getElementById("ed-lisp-box");
    if (!box) return;
    box.open = true;
    editor.openLisp = true;
    box.scrollIntoView({ block: "start", behavior: "smooth" });
    const ta = document.getElementById("ed-lisp");
    if (ta) ta.focus({ preventScroll: true });
  }
}
function refocus(selector) {
  const el = document.querySelector(`#side ${selector}`);
  if (el) el.focus({ preventScroll: true });
}

// ---- remaking a film told in English

// A film made from "Tell Ani a new story" keeps the story as told (run.told, in "Your
// films" and film files too); its story panel shows it, editable, and "Change the story
// and make it again" has the model write the description again from the words as they
// are now: the visitor sees the description and Ani's checks of it (showDraft), then looks
// it over in the editor and makes the film, with the extensions it was made with.
let toldShown = null;
function toldBox(run) {
  toldShown = run && run !== RUNS[0] && run.told && run.told.story ? run : null;
  if (!toldShown) return "";
  run = toldShown;
  return `<div class="told-box"><p class="label">${(run === R ? at611("The story as told", "The story as it was told") : at611("The new version's story, as told", "The new film's story, as it was told"))}</p>
    <textarea id="told-again" class="story-box" rows="4" aria-label="The story as told">${esc(run.told.story)}</textarea>
    <div class="actions"><button type="button" class="btn" id="told-remake">Change the story and make it again</button></div>
    <p class="note">${at611(`Change the words, and the model chosen in “Tell Ani a new story”${run.told.model ? ` (last time ${esc(run.told.model)})` : ""} writes the film description again from them; you see it, and Ani's checks of it, before Ani makes the film.`, "Change the words, and the AI writes them again in words Ani can read. You see them, and what Ani thinks of them, before Ani makes the film.")}</p></div>`;
}
document.addEventListener("click", (e) => {
  if (!e.target.closest || !e.target.closest("#told-remake")) return;
  const run = toldShown, box = document.getElementById("told-again");
  const words_ = box ? box.value.trim() : "";
  if (!run || !words_) return;
  teller.story = words_;
  store.set(STORY_KEY, words_);
  // told again as the film was made, for this visit (the visitor's own choice is kept)
  if (runExtensions(run).length && MODE === "1978") setMode("revival", { remember: false });
  else if (!runExtensions(run).length && MODE !== "1978") setMode("1978", { remember: false });
  editor.fps = runFps(run);
  openTeller();
  if (currentProvider()) draftStory();
});
// a film's length in words: "2 to 5 minutes"
const filmLengthWords = (v) => { const r = filmLengthSeconds(v); return r ? `${+(r[0] / 60).toFixed(2)} to ${+(r[1] / 60).toFixed(2)} minutes` : plain(String(v)); };
