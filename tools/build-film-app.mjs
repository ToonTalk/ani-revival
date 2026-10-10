// Build app/film.html, the web app that shows Ani making the Cinderella film, from
// app/film.template.html and the data the runs wrote:
//   reports/film/<scene>.film.json   each frame Director filmed (tools/run-scene.mjs --record)
//   reports/pass2/<scene>.glass.json each scene's plan as Ani left it (tools/run-pass2.mjs --glass-box)
//   app/data/pass1.json              pass 1's choice points and their reasoning (tools/run-pass1.mjs --glass-box)
//   KEN;CINDY 46                     the film description, from tape 7005017
// and, for making the film again in the browser, Ani's runtime (src/pipeline.js and
// what it imports, as one classic script for a worker) and the files Ani reads
// (app/data/ani-bundle-files.json, from tools/build-ani-bundle.mjs), with the revival's
// extensions (src/director/revive/) for the page's switch, "Ani as in 1978 / Ani with
// the revival's extensions", an index of their code for the glass box's links, and how
// Ken drew his cast in 1978 (src/pipeline.js KEN_LOOKS, with ANINIT's lines) for "How she
// looks".
// Everything is inlined, gzipped as base64, so the page works opened directly, served,
// or published as a claude.ai artifact (which can fetch nothing).
// The page's script is the template's, with app/film/llm.js (telling Ani a new story)
// and app/film/save.js (saving films) put in at /*FILM-PARTS*/.
// Usage: node tools/build-film-app.mjs [--content-only out.html] [--claude-artifact out.html [--site URL]]
//   --content-only writes the page without its document skeleton (for publishing).
//   --claude-artifact writes the copy for a claude.ai chat artifact: its models are only
//     Claude through claude.ai and Gemini Nano, Ani runs on the page itself (a chat
//     artifact refuses workers), and the code pages are linked at --site, or left out.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { EXTENSIONS, KEN_LOOKS, APPEARANCE_ELEMENTS } from "../src/pipeline.js";
import { decodeItsText } from "../src/its/text.js";
import { definitions } from "./lisp-defs.mjs";
import { bundleModules } from "./bundle-js.mjs";
import { assembleBundle } from "./build-ani-bundle.mjs";
import { fullPage } from "./page-shell.mjs";

// Where in Ani's code each method, kind of task and plan is, for links into the code
// page (app/source.html#<file>-<line>).
function codeIndex(root) {
  const defs = (file) => definitions(decodeItsText(readFileSync(`${root}/original/7005017/${file}`)).text);
  const display = {};
  for (const d of defs("disply.311")) {
    if (d.kind === "define" && d.name && d.parent === "display-method") (display[d.name] ||= {}).define = d.line;
    const run = d.pattern && d.pattern.match(/^\(run ([a-z:-]+) /);
    if (run) (display[run[1]] ||= {}).run = d.line;
  }
  const convey = {};
  for (const d of defs("convey.64")) {
    const m = d.pattern && d.pattern.match(/\(convey \(([a-z-]+) /);
    if (m && !convey[m[1]]) convey[m[1]] = d.line;
  }
  const sugest = Object.fromEntries(defs("sugest.123").filter((d) => d.name).map((d) => [d.name, d.line]));
  const establish = {
    personality: ["sugest.123", sugest["establish-personality-suggestions"]],
    relationship: ["sugest.123", sugest["establish-relationship-suggestions"]],
    "emotional-state": ["sugest.123", sugest["combine-emotional-state-suggestions"]],
  };
  return { display: { file: "disply.311", methods: display }, convey: { file: "convey.64", verbs: convey }, establish, revive: reviveIndex(root) };
}

// How Ken drew his four in 1978 (src/pipeline.js KEN_LOOKS), with where in ANINIT he
// said so, for the glass box's "In 1978 Ken drew her himself as ...": each character's
// definition in initialize-characters (its shape, and its size if not every
// director-character's, dichar.103:10) and its color in running-color.
function kenLooks(root) {
  const lines = decodeItsText(readFileSync(`${root}/original/7005017/aninit.65`)).text.split("\n");
  const lineOf = (re) => lines.findIndex((l) => re.test(l)) + 1;
  const dichar = decodeItsText(readFileSync(`${root}/original/7005017/dichar.103`)).text.split("\n");
  const characters = {};
  for (const [c, look] of Object.entries(KEN_LOOKS)) {
    const defineLine = lineOf(new RegExp(`^\\s*\\(define ${c} director-character`));
    const colorLine = lineOf(new RegExp(`^\\s*\\(ask ${c} set your colors to \\(${look.color}\\)`));
    if (!defineLine || !colorLine) throw new Error(`aninit.65 doesn't draw ${c} as KEN_LOOKS says`);
    characters[c] = { ...look, defineLine, colorLine };
  }
  return {
    file: "aninit.65", characters,
    initialize: lineOf(/^\(define-function initialize-characters/), runningColor: lineOf(/^\(define-form \(running-color/),
    size: { file: "dichar.103", line: dichar.findIndex((l) => /set your ani-size to \.05/.test(l)) + 1 },
  };
}

// The revival's own Lisp (src/director/revive/, REVIVE;<name>), every file there, so
// that a repair file added later is listed with no change here: what each file is (its
// title line), where each kind of repair note is written (the definition around each
// (revival-note actor 'kind ...), for the page's plain sentences), and the display
// methods a file defines (MEND5's move-to). Ids are the code page's (build-source-app).
// The bridge first, then the files in the order the extensions load them, then any
// others.
export function reviveFiles(root) {
  const dir = `${root}/src/director/revive`;
  const order = ["bridge", ...EXTENSIONS.flatMap((e) => e.files)];
  const rank = (name) => (order.includes(name) ? order.indexOf(name) : order.length);
  return readdirSync(dir).filter((f) => f.endsWith(".lisp")).map((f) => f.replace(/\.lisp$/, ""))
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b, "en", { numeric: true }))
    .map((name) => ({ name, path: `src/director/revive/${name}.lisp`, text: readFileSync(`${dir}/${name}.lisp`, "utf8").replace(/\r\n?/g, "\n") }));
}
function reviveIndex(root) {
  const files = [], notes = {}, methods = {};
  for (const { name, text } of reviveFiles(root)) {
    const id = `revive-${name}`;
    const title = (text.match(/^;;;\s*REVIVE;[A-Z0-9]+:\s*(.+)$/m) || [])[1] || "";
    files.push({ name, id, its: `REVIVE;${name.toUpperCase()}`, title });
    const defs = definitions(text);
    const lineAt = (i) => text.slice(0, i).split("\n").length;
    const around = (line) => (defs.filter((d) => d.line <= line).pop() || { line }).line;
    // the actor is a name, or a form such as (ask ,condition recall your subscene)
    for (const m of text.matchAll(/\(revival-note\s+(?:\([^()]*\)|\S+)\s+'([a-z0-9+-]+)/g)) notes[m[1]] ||= [id, around(lineAt(m.index))];
    for (const m of text.matchAll(/\(define ([a-z0-9:+-]+) display-method\b/g)) (methods[m[1]] ||= { file: id }).define = lineAt(m.index);
    for (const m of text.matchAll(/\(define-receiver \(run ([a-z0-9:+-]+) /g)) (methods[m[1]] ||= { file: id }).run = lineAt(m.index);
  }
  return { files, notes, methods };
}

// The words Ani knows for describing characters and relationships, from DSCRP and
// RELATE: for each word, its kind (the descriptor it is defined as, if it is), whether
// it has suggestions of its own for how a character moves or what to show, and the
// words it is the opposite or a neighbor of ("ugly" is only the opposite of beautiful).
// Other words in a film description are remembered but suggest nothing.
function vocabulary(root) {
  const kinds = {
    "physical-character-descriptor": "physical", "personality-character-descriptor": "personality",
    "movement-character-descriptor": "movement", "odds+ends-character-descriptor": "role",
    "affection-relationship-descriptor": "relationship", "domination-relationship-descriptor": "relationship",
  };
  const words = {};
  const word = (w) => (words[w] ||= {});
  for (const file of ["dscrp.17", "relate.22"]) {
    const text = decodeItsText(readFileSync(`${root}/original/7005017/${file}`)).text;
    const defs = [...text.matchAll(/^\(define ([a-z+-]+) ([a-z+-]+)/gm)];
    defs.forEach((m, i) => {
      if (!kinds[m[2]]) return;
      const w = word(m[1]);
      w.kind = kinds[m[2]];
      const block = text.slice(m.index, i + 1 < defs.length ? defs[i + 1].index : text.length);
      if (block.includes("(process suggestions")) w.suggests = true;
      w.file = file;
      w.line = text.slice(0, m.index).split("\n").length;
    });
    for (const m of text.matchAll(/\((?:uncompiled-)?ask ([a-z+-]+) add ([a-z+-]+) to your list of (opposites|neighbors)\)/g)) {
      (word(m[1])[m[3]] ||= []).push(m[2]);
      (word(m[2])[m[3]] ||= []).push(m[1]);
    }
  }
  // a word known only by a relation takes its kind from the word it is related to
  for (const [w, v] of Object.entries(words)) {
    if (v.kind) continue;
    const kin = [...(v.opposites || []), ...(v.neighbors || [])].map((x) => words[x]?.kind).find(Boolean);
    if (kin) v.kindByRelation = kin;
  }
  return words;
}

// A film packed for the page, which unpacks it as it loads: each character's segment
// coordinates in tenths of a dot, as changes from that character's last frame (consecutive
// frames differ little, so this gzips well), and a character's visibility, special
// dynamics and goal only when they change (the page uses no more of the record).
function packFilm(film) {
  const last = {}, was = {};
  const segs = [], chars = [];
  for (const fr of film.frames) {
    const s = {};
    for (const [c, seg] of Object.entries(fr.segs)) {
      const t = seg.map((v) => Math.round(v * 10));
      const p = last[c];
      s[c] = p && p.length === t.length ? ["d", ...t.map((v, k) => v - p[k])] : t;
      last[c] = t;
    }
    segs.push(s);
    const ch = {};
    for (const [c, v] of Object.entries(fr.chars)) {
      const now = [v.visible ? 1 : 0, v.dynamics, v.goal];
      const key = JSON.stringify(now);
      if (was[c] !== key) { ch[c] = now; was[c] = key; }
    }
    chars.push(ch);
  }
  const { frames, ...rest } = film;
  return { ...rest, packed: { segs, chars } };
}

const SCENES = [
  ["introduction", "The Introduction"],
  ["kept-apart", "Kept Apart"],
  ["no-longer-kept-apart", "No Longer Kept Apart"],
  ["meeting", "The Meeting"],
  ["justice", "Justice"],
];

export const sizes = {};
export function buildFilmApp(root = ".", { contentOnly = null, claudeArtifact = null, site = "" } = {}) {
  const fs = makeProjectFileSystem(root);
  const cindy = fs.textOf(fs.find({ dir: "KEN", fn1: "CINDY", fn2: "46" }));
  const pass1 = JSON.parse(readFileSync(`${root}/app/data/pass1.json`, "utf8"));
  const sceneData = (dir, glassDir) => SCENES.map(([id, title]) => ({
    id,
    title,
    film: packFilm(JSON.parse(readFileSync(`${root}/${dir}/${id}.film.json`, "utf8"))),
    glass: JSON.parse(readFileSync(`${root}/${glassDir}/${id}.glass.json`, "utf8")),
  }));
  const data = {
    scenes: sceneData("reports/film", "reports/pass2"),
    // the same film at 24 frames a second, as it was shot (tools/run-film.mjs --fps 24)
    scenes24: existsSync(`${root}/reports/film/24fps/justice.film.json`) ? sceneData("reports/film/24fps", "reports/film/24fps") : null,
    cindy,
    pass1: { cp29: pass1.cp29, choicePoints: pass1.choicePoints },
    code: codeIndex(root),
    words: vocabulary(root),
    // the revival's extensions (src/pipeline.js EXTENSIONS), which the page's switch
    // turns on for the films it makes; Ken's 1978 film above is as it was made
    extensions: EXTENSIONS.map(({ id, label, files, requires, changes1978, note, recorder }) => ({ id, label, files, requires, changes1978, note, ...(recorder && recorder.looks ? { looks: true } : {}) })),
    // the elements Ani chooses a look by (REVIVE;APPEAR), and how Ken drew his cast in 1978
    appearanceElements: APPEARANCE_ELEMENTS,
    kenLooks: kenLooks(root),
  };
  const packed = (text) => gzipSync(Buffer.from(text, "utf8"), { level: 9 }).toString("base64");
  // with the interpreter's Lisp, so the page can read what the Lisp that stopped typed last
  const runtime = bundleModules(["src/pipeline.js", "src/its/bundle-fs.js", "src/maclisp/index.js"], "AniRuntime", root);
  const bundle = assembleBundle(fs, JSON.parse(readFileSync(`${root}/app/data/ani-bundle-files.json`, "utf8")));
  const template = readFileSync(`${root}/app/film.template.html`, "utf8");
  const blocks = { "/*FILM-DATA*/": packed(JSON.stringify(data)), "/*ANI-RUNTIME*/": packed(runtime), "/*ANI-BUNDLE*/": packed(JSON.stringify(bundle)) };
  const parts = ["llm.js", "save.js"].map((f) => readFileSync(`${root}/app/film/${f}`, "utf8")).join("\n");
  let content = template;
  for (const [mark, text] of Object.entries({ ...blocks, "/*FILM-PARTS*/": parts })) {
    if (content.split(mark).length !== 2) throw new Error(`the template should have one ${mark}`);
    content = content.replace(mark, () => text);
  }
  if (claudeArtifact) {
    const flags = { "/*ARTIFACT-BUILD*/false": "true", '/*CODE-SITE*/""': JSON.stringify(site || "none") };
    for (const [mark, value] of Object.entries(flags)) {
      if (content.split(mark).length !== 2) throw new Error(`the page should have one ${mark}`);
      content = content.replace(mark, () => value);
    }
  }
  sizes.data = blocks["/*FILM-DATA*/"].length;
  sizes.runtime = blocks["/*ANI-RUNTIME*/"].length;
  sizes.bundle = blocks["/*ANI-BUNDLE*/"].length;
  if (contentOnly) {
    writeFileSync(contentOnly, content);
    return contentOnly;
  }
  const page = fullPage(content);
  if (claudeArtifact) {
    // claude.ai refused pages over about 950 KB, and drops an inline script over about 1.2 MB
    const scripts = [...page.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => Buffer.byteLength(m[1]));
    if (Buffer.byteLength(page) > 950000) throw new Error(`the claude.ai copy is ${Math.round(Buffer.byteLength(page) / 1024)} KB, over claude.ai's limit`);
    if (scripts.some((n) => n > 800000)) throw new Error("a script in the claude.ai copy is over 800 KB");
    writeFileSync(claudeArtifact, page);
    return claudeArtifact;
  }
  writeFileSync(`${root}/app/film.html`, page);
  return `${root}/app/film.html`;
}

if (process.argv[1]?.endsWith("build-film-app.mjs")) {
  const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
  const out = buildFilmApp(".", { contentOnly: arg("--content-only"), claudeArtifact: arg("--claude-artifact"), site: arg("--site") || "" });
  const kb = (n) => `${Math.round(n / 1024)} KB`;
  console.log(`wrote ${out} (${kb(readFileSync(out).length)}: film data ${kb(sizes.data)}, Ani's runtime ${kb(sizes.runtime)}, Ani's files ${kb(sizes.bundle)})`);
}
