// ---------------------------------------------------------------- the JSON way

// A model may write a film description as JSON instead of Ken's Lisp: the page asks for
// it with a JSON schema (storySchema) that allows only Ani's words for each slot and her
// task forms, each with its own fields, so that where the provider enforces the schema
// (OpenAI's strict json_schema, Anthropic's output_config.format, Gemini's
// responseJsonSchema, Chrome's responseConstraint) the model can't write a word Ani
// doesn't know, or a task of the wrong shape. The page then puts the JSON into Ken's
// notation (lispFromJson), exactly in his forms, and tidies and checks that as it does a
// description the model wrote in Lisp; the Lisp is what the reader sees, edits and saves.
// The example in the prompt is Ken's CINDY read into JSON (jsonFromLisp), which the
// page's check translates back to CINDY's forms. Where a provider refuses the schema, the
// page asks again without it, and its checks catch what the schema would have.

// The slots' words: the page's vocabulary (DATA.words, from DSCRP and RELATE; a word of
// the revival's own counts only with its extension on), those with suggestions of their
// own first. The prompt lists these; the schema also allows the words Ken himself gave in
// each slot in CINDY (strong as the Prince's looks, is-protective-of), as the example has them.
function slotWords(kind, extensions = []) {
  const w = DATA.words, on = (x) => !w[x].revival || extensions.includes("know");
  return [...Object.keys(w).filter((x) => w[x].kind === kind && on(x)), ...Object.keys(w).filter((x) => !w[x].kind && w[x].kindByRelation === kind && on(x))];
}
function schemaWords(kind, extensions) {
  const ken = readStory(DATA.cindy);
  const given = kind === "relationship" ? ken.relationships.flatMap((r) => r.how) : Object.values(ken.characters).flatMap((c) => c[kind] || []);
  return [...new Set([...slotWords(kind, extensions), ...given])];
}
const MOODS = ["normal", "hopeful", "depressing", "joyous", "anticipatory", "(very joyous)", "(changes hopeful depressing)", "(and joyous anticipatory)"];
const RHYTHMS = ["normal", "fast", "slow", "(changes fast slow)"];
const LENGTHS = ["short", "medium", "long"];
const LEVELS = ["low", "medium", "high"];
// the film's levels, in the order Ken set them (CINDY 46)
const FILM_LEVELS = ["variety", "complexity", "originality", "rhythm", "coherence", "obviousness", "flashiness", "energy"];
const SLOTS = ["physical", "personality", "movement"];
// What the page's own checks accept (checkTasks, emotionOk), so that the schema offers no
// more than they do: the feelings, and the verbs a task gives two characters, with meets
// only with the repairs (as the prompt says) and any of the revival's KNOW the checks take.
function feelingWords(extensions) {
  const know = extensions.includes("know") && DATA.know ? Object.keys(DATA.know.feelings || {}) : [];
  return [...new Set(["joy", "pride", ...know])].filter((f) => emotionOk([f, ["positive", "low"]]));
}
function pairVerbs(extensions) {
  const base = ["accompanys", "chases", "hurts", "pushes", "alone", "getting-it-on", ...(extensions.includes("mend") ? ["meets"] : [])];
  const know = extensions.includes("know") && DATA.know ? Object.keys(DATA.know.verbs || {}) : [];
  const takes = (v) => { const p = []; checkTasks({ characters: { a: {}, b: {} }, relationships: [], scenes: { s: { tasks: ["convey", [v, "a", "b"]] } }, titles: {}, names: {} }, "s", [], p, []); return !p.length; };
  return [...base, ...know.filter((v) => !base.includes(v) && takes(v))];
}

// The schema, as JSON Schema in the form OpenAI's strict mode asks for (every property
// required, no others allowed, the root an object, no recursion, fewer than ten levels);
// schemaFor() fits it to the other providers.
function storySchema(extensions = []) {
  const obj = (properties) => ({ type: "object", properties, required: Object.keys(properties), additionalProperties: false });
  const one = (values) => ({ type: "string", enum: values });
  const unset = (values) => ({ type: ["string", "null"], enum: [...values, null] }); // null: not set, as Ken left some
  const list = (items, min = 1) => ({ type: "array", ...(min ? { minItems: min } : {}), items });
  const str = { type: "string" };
  const name = { type: "string", pattern: "^[a-z][a-z0-9-]*$" };
  const pair = { ...list(name, 2), maxItems: 2 };
  const words = (kind, min = 1) => list(one(schemaWords(kind, extensions)), min);
  const tasks = [
    obj({ kind: one(["establish-personality"]), who: name }),
    obj({ kind: one(["establish-emotional-state"]), who: name, feelings: list(obj({ feeling: one(feelingWords(extensions)), sign: one(["positive", "negative"]), amount: one(LEVELS) })) }),
    obj({ kind: one(["establish-relationship"]), from: name, to: name }),
    obj({ kind: one(pairVerbs(extensions)), who: name, whom: name }),
    obj({ kind: one(["wants", "prevents"]), who: name, meets: pair }),
    obj({ kind: one(["aware"]), who: name, gettingItOn: pair }),
  ];
  const changes = !extensions.includes("change") ? [] : [
    ...SLOTS.map((k) => obj({ kind: one([`change-${k}`]), who: name, from: words(k), to: words(k), causedBy: str })),
    obj({ kind: one(["change-relationship"]), who: name, whom: name, from: words("relationship"), to: words("relationship"), causedBy: str }),
  ];
  // what an undoes undoes: only what someone did, a convey task (the page's checks, checkTasks)
  const task = { anyOf: [...tasks, obj({ kind: one(["undoes"]), who: name, scene: name, undone: { anyOf: tasks.slice(3) } }), ...changes] };
  return obj({
    characters: list(obj({ name, called: str, pronoun: one(["she", "he", "they"]), physical: words("physical"), personality: words("personality"), movement: words("movement", 0) })),
    main: name,
    relationships: list(obj({ from: name, to: name, how: words("relationship") }), 0),
    scenes: list(obj({ name, title: str, mood: unset(MOODS), rhythm: unset(RHYTHMS), length: unset(LENGTHS), steps: list(list(task)) })),
    film: obj({ name, ...Object.fromEntries(FILM_LEVELS.map((l) => [l, one(LEVELS)])) }),
    focus: obj({ scenes: list(name, 0), relationships: list(obj({ from: name, to: name }), 0) }),
  });
}
// The schema as each provider takes it: Anthropic's allows minItems of only 0 or 1 and no
// maxItems; for Gemini and Chrome's Gemini Nano, a plain string for each name and setting
// (no pattern, no null). What a provider can't enforce, the page's checks catch.
function schemaFor(provider, schema) {
  const fit = (x) => {
    if (Array.isArray(x)) return x.map(fit);
    if (!x || typeof x !== "object") return x;
    const y = Object.fromEntries(Object.entries(x).map(([k, v]) => [k, fit(v)]));
    if (provider === "anthropic") { delete y.maxItems; if (y.minItems > 1) y.minItems = 1; }
    if (provider === "gemini" || provider === "nano") {
      delete y.pattern;
      if (Array.isArray(y.type)) y.type = y.type[0];
      if (y.enum) y.enum = y.enum.filter((v) => v !== null);
    }
    return y;
  };
  return provider === "openai" ? schema : fit(schema);
}

// ---- JSON into Ken's notation

const listOf = (x) => (Array.isArray(x) ? x : x === undefined || x === null || x === "" ? [] : [x]);
// a name or word as a Lisp symbol: lowercase, words joined by hyphens, nothing Lisp reads otherwise
const sym = (x) => String(x ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9+-]/g, "") || "unnamed";
const wordsValue = (ws) => { const l = [...new Set(listOf(ws).map(sym))]; return l.length === 1 ? l[0] : ["and", ...l]; };
// a setting as written in the enum ("(very joyous)"), or several words put in parentheses
const setting = (v) => { const s = String(v).toLowerCase().replace(/[^a-z0-9() -]/g, "").replace(/\s+/g, " ").trim(); return /\s/.test(s) && !s.startsWith("(") ? `(${s})` : s; };
function taskLisp(t) {
  t = t && typeof t === "object" ? t : {};
  const k = sym(t.kind), w = sym(t.who), pair = (p) => listOf(p).map(sym);
  if (k === "establish-personality") return ["establish", ["personality", w]];
  if (k === "establish-emotional-state") {
    const fs = listOf(t.feelings).map((f) => [sym(f && f.feeling), [sym(f && f.sign), sym(f && f.amount)]]);
    return ["establish", ["emotional-state", w, fs.length === 1 ? fs[0] : ["and", ...fs]]];
  }
  if (k === "establish-relationship") return ["establish", ["relationship", ["relationship-of", sym(t.from), sym(t.to)]]];
  if (k === "wants" || k === "prevents") return ["convey", [k, w, ["meets", ...pair(t.meets)]]];
  if (k === "aware") return ["convey", [k, w, ["getting-it-on", ...pair(t.gettingItOn)]]];
  if (k === "undoes") return ["convey", [k, w, ["from-scene", sym(t.scene), taskLisp(t.undone)]]];
  const change = /^change-(.+)$/.exec(k);
  if (change) {
    const whose = change[1] === "relationship" ? ["relationship-of", w, sym(t.whom)] : w;
    const c = ["change", [change[1], whose, wordsValue(t.from)], [change[1], whose, wordsValue(t.to)]];
    return ["convey", t.causedBy ? ["causes", sym(t.causedBy), c] : c];
  }
  return ["convey", [k, w, sym(t.whom)]];
}
// steps: Ken's (sequence: ...) of (and ...)s; one step is an (and ...), one task alone itself
function tasksLisp(steps) {
  const one = (g) => (g.length === 1 ? g[0] : ["and", ...g]);
  const groups = listOf(steps).map((g) => listOf(g).map(taskLisp)).filter((g) => g.length);
  return groups.length === 1 ? one(groups[0]) : groups.length ? ["sequence:", ...groups.map(one)] : ["and"];
}
// laid out as Ken laid his out: the first task on the (and or (sequence: line, the others under it
const taskTree = (x, lead) => (x.length < 2 || (x[0] !== "and" && x[0] !== "sequence:") ? show(x)
  : `(${x[0]} ${x.slice(1).map((y) => taskTree(y, lead + " ".repeat(x[0].length + 2))).join("\n" + lead + " ".repeat(x[0].length + 2))})`);
// The film description in Ken's notation, laid out as CINDY is: the cast and scene names
// for people on the comment lines the page reads, each relationship after the second of
// its characters, the film's levels in Ken's order with his other settings, and the focus.
function lispFromJson(s) {
  s = s && typeof s === "object" ? s : {};
  const chars = listOf(s.characters).filter((c) => c && typeof c === "object"), main = sym(s.main);
  const scenes = listOf(s.scenes).filter((x) => x && typeof x === "object");
  const rels = listOf(s.relationships).filter((r) => r && typeof r === "object"), film = s.film || {}, focus = s.focus || {};
  const people = (x) => String(x ?? "").replace(/[;()\n]/g, " ").replace(/\s+/g, " ").trim();
  const out = [";; -*-lisp-*-",
    `;; cast: ${chars.map((c) => `${sym(c.name)} = ${people(c.called) || plain(sym(c.name))} (${["she", "he", "they", "it"].includes(c.pronoun) ? c.pronoun : "they"})`).join("; ")}`,
    `;; scenes: ${scenes.map((x) => `${sym(x.name)} = ${people(x.title) || titleCase(sym(x.name))}`).join("; ")}`,
    "", "(include |ai:ken;declar >|)", "", "(defcomment cindy) ;for tags", ""];
  const defined = new Set(), left = [...rels];
  const relate = (r) => out.push(relationshipForm(sym(r.from), sym(r.to), [show(wordsValue(r.how))]), "");
  for (const c of chars) {
    const n = sym(c.name);
    const slots = SLOTS.map((k) => [k, [show(wordsValue(c[k]))]]).filter(([k]) => listOf(c[k]).length);
    out.push(characterForm(n, n === main ? [...slots, ["role-in-story", ["most-important"]]] : slots), "");
    defined.add(n);
    for (const r of left.filter((r) => defined.has(sym(r.from)) && defined.has(sym(r.to)))) { left.splice(left.indexOf(r), 1); relate(r); }
  }
  left.forEach(relate); // naming a character not defined: the checks say so
  for (const x of scenes) {
    const set = [["mood", x.mood], ["rhythm", x.rhythm], ["length", x.length]].filter(([, v]) => v !== null && v !== undefined && v !== "");
    out.push(`(define ${sym(x.name)} scene\n\t(process initial description\n\t\t ${taskTree(tasksLisp(x.steps), "\t\t ")})${set.map(([k, v]) => `\n\t(set your ${k} to ${setting(v)})`).join("")})`, "");
  }
  const level = (l) => `\t(set your level of ${l} to ${LEVELS.includes(film[l]) ? film[l] : "medium"})`;
  const parts = [main, ...listOf(focus.scenes).map(sym), ...listOf(focus.relationships).map((r) => ["relationship-of", sym(r && r.from), sym(r && r.to)])];
  out.push("(declare (coutput (read))) ;;dont want the side effects upon (... level) lost", "",
    `(define ${sym(film.name || "story-film")} film`, ...FILM_LEVELS.slice(0, 3).map(level), "\t(set your film-length to (interval (minutes 2) (minutes 5)))",
    level("rhythm"), "\t(set your mood to scene-dependent)", ...FILM_LEVELS.slice(4).map(level), "\t(set your focus to the-films-focus))", "",
    "(define the-films-focus focus", " (set your order-of-character+element-type+element to (characters element-types elements))",
    ` (set your parts-of-the-focus to\n      ${pretty(parts, 6)}))`, "", "(compile-actors)");
  return out.join("\n") + "\n";
}

// ---- Ken's notation into JSON (for the example: Ken's CINDY)

function taskJson(t) {
  const [, d] = t, [v, a, b] = d;
  const pair = (x) => (Array.isArray(x) ? x.slice(1) : []);
  if (t[0] === "establish") {
    if (v === "personality") return { kind: "establish-personality", who: a };
    if (v === "relationship") return { kind: "establish-relationship", from: a[1], to: a[2] };
    return { kind: "establish-emotional-state", who: a, feelings: wordsOf(b).map((f) => { const [sign, amount] = Array.isArray(f[1]) ? f[1] : ["positive", f[1]]; return { feeling: f[0], sign, amount }; }) };
  }
  if (v === "wants" || v === "prevents") return { kind: v, who: a, meets: pair(b) };
  if (v === "aware") return { kind: v, who: a, gettingItOn: pair(b) };
  if (v === "undoes") return { kind: v, who: a, scene: b[1], undone: taskJson(b[2]) };
  const [c] = changesIn(d);
  if (c) return c.type === "relationship" ? { kind: "change-relationship", who: c.who[1], whom: c.who[2], from: c.from, to: c.to, causedBy: c.cause || "" } : { kind: `change-${c.type}`, who: c.who, from: c.from, to: c.to, causedBy: c.cause || "" };
  return { kind: v, who: a, whom: b };
}
function jsonFromLisp(text) {
  const story = readStory(text);
  const cast = Object.keys(story.characters);
  const focusForm = topForms(text).forms.map((f) => parse(uncomment(text.slice(f.start, f.end)))).find((f) => f[0] === "define" && f[2] === "focus");
  const set = focusForm && focusForm.find((x) => Array.isArray(x) && x[2] === "parts-of-the-focus");
  const parts = set ? set[4] : [];
  const stepsOf = (t) => (t[0] === "sequence:" ? t.slice(1).map((x) => (x[0] === "and" ? x.slice(1) : [x])) : [t[0] === "and" ? t.slice(1) : [t]]);
  const named = (c) => meet(story, c);
  return {
    characters: cast.map((c) => ({ name: c, called: named(c).the, pronoun: named(c).she, physical: story.characters[c].physical, personality: story.characters[c].personality, movement: story.characters[c].movement })),
    main: cast.find((c) => story.characters[c].role === "most-important") || cast[0],
    relationships: story.relationships.map((r) => ({ from: r.from, to: r.to, how: r.how })),
    scenes: Object.entries(story.scenes).map(([id, x]) => ({ name: id, title: titleOf(story, id), mood: x.settings.mood ? show(x.settings.mood) : null, rhythm: x.settings.rhythm ? show(x.settings.rhythm) : null, length: x.settings.length ? show(x.settings.length) : null, steps: stepsOf(x.tasks).map((g) => g.map(taskJson)) })),
    film: { name: story.films[0], ...Object.fromEntries(FILM_LEVELS.map((l) => [l, story.levels[l]])) },
    focus: { scenes: parts.filter((p) => story.scenes[p]), relationships: parts.filter(Array.isArray).map((r) => ({ from: r[1], to: r[2] })) },
  };
}
// Two descriptions with the same forms, comments and layout aside.
const formsOf = (text) => topForms(text).forms.map((f) => show(parse(uncomment(text.slice(f.start, f.end)))));
const sameForms = (a, b) => JSON.stringify(formsOf(a)) === JSON.stringify(formsOf(b));
// JSON laid out as a person would: what fits on a line stays on it.
const flatJson = (x) => (Array.isArray(x) ? `[${x.map(flatJson).join(", ")}]` : x && typeof x === "object" ? `{${Object.entries(x).map(([k, v]) => `${JSON.stringify(k)}: ${flatJson(v)}`).join(", ")}}` : JSON.stringify(x));
function printJson(x, indent = "") {
  const flat = flatJson(x);
  if (!x || typeof x !== "object" || indent.length + flat.length <= 140) return flat;
  const pad = indent + "  ";
  return Array.isArray(x) ? `[\n${x.map((v) => pad + printJson(v, pad)).join(",\n")}\n${indent}]`
    : `{\n${Object.entries(x).map(([k, v]) => `${pad}${JSON.stringify(k)}: ${printJson(v, pad)}`).join(",\n")}\n${indent}}`;
}
// Ken's CINDY as JSON, without the scenes he commented out, as the example (cindyExample)
const cindyJson = () => jsonFromLisp(cindyExample());

// ---- reading a reply

// The JSON object in a reply: the whole reply, or a fenced block, or from its first { to
// its last }.
function jsonOf(reply) {
  const s = String(reply), fence = s.match(/```[a-z]*[^\n]*\n([\s\S]*?)```/i);
  for (const t of [s, fence && fence[1], s.slice(s.indexOf("{"), s.lastIndexOf("}") + 1)]) {
    try { const v = t && JSON.parse(t); if (v && typeof v === "object" && !Array.isArray(v)) return v; } catch { /* not this */ }
  }
  return null;
}
// A reply written as JSON, put into Ken's notation ({ json, text }); null if it isn't JSON
// the page can read (the page then reads it as Lisp, as a model may answer in Lisp anyway).
function storyFromReply(reply) {
  const json = jsonOf(reply);
  if (!json || !(json.characters || json.scenes)) return null;
  try { return { json, text: lispFromJson(json) }; } catch { return null; }
}
