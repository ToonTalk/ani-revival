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
// Everything is inlined, gzipped and written as text (pack93: 13 bits to two printable
// characters, denser than base64), so the page works opened directly, served, or
// published as a claude.ai artifact (which can fetch nothing).
// The page's script is the template's, with app/film/llm.js (telling Ani a new story),
// app/film/json.js (the JSON way of telling it), app/film/save.js (saving films) and
// app/film/report.js (reporting errors, and stories sent, to Ken, where
// tools/build-site.mjs gives the site's page a DSN) put in at /*FILM-PARTS*/, and
// src/pipeline.js's own functions for renaming a story's names that clash with Ani's
// (storyOutline, storyRenames, renameStoryNames) at /*STORY-NAMES*/, with the names
// taken (aniNames) in its data.
// Usage: node tools/build-film-app.mjs [--content-only out.html] [--claude-artifact out.html [--site URL]]
//   --content-only writes the page without its document skeleton (for publishing).
//   --claude-artifact writes the copy for a claude.ai chat artifact: its models are only
//     Claude through claude.ai and Gemini Nano, Ani runs on the page itself (a chat
//     artifact refuses workers), and the code pages are linked at --site, or left out.
//     To keep under claude.ai's limit, its page script goes without comments and
//     indentation, gzipped and written as text, which a small module script (PAGE_LOADER)
//     unpacks and runs as a module script of its own (so that it needs no eval), and the
//     revival's own Lisp in its bundle without comments, every line kept
//     (stripReviveComments); Ken's files go as they are.
import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { gzipSync, gunzipSync } from "node:zlib";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { EXTENSIONS, KEN_LOOKS, APPEARANCE_ELEMENTS, aniNames, boot, storyOutline, storyRenames, renameStoryNames, whyTheyAct as whyTheyActOfPipeline } from "../src/pipeline.js";
import { decodeItsText } from "../src/its/text.js";
import { definitions } from "./lisp-defs.mjs";
import { bundleModules } from "./bundle-js.mjs";
import { assembleBundle } from "./build-ani-bundle.mjs";
import { fullPage } from "./page-shell.mjs";
import { stripComments, stringsOf } from "./strip-js-comments.mjs";
import { stripLispComments, differentForms } from "./strip-lisp-comments.mjs";
import { knowIndex } from "./know-index.mjs";

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

// ---- the page's data, carried as text

// Each of the page's three blocks of data (its film data, Ani's runtime and the files Ani
// reads) is gzipped and written as text: the number of bytes, a space, and then the bytes
// 13 bits at a time, each as two characters of TEXT93, the 93 printable ASCII characters
// but the space and "<" (so that nothing in a block can end its <script> or begin a
// comment there). That is 6.5 bits a character, where base64 carries 6, which keeps the
// claude.ai copy under claude.ai's limit. The page's unpack() reads a block back, and so
// does unpack93 here, which the build checks every block with.
export const TEXT93 = [...Array(94)].map((_, k) => String.fromCharCode(33 + k)).filter((c) => c !== "<").join("");
export function pack93(bytes) {
  const out = [];
  let acc = 0, bits = 0;
  const put = (v) => out.push(TEXT93[v % 93], TEXT93[Math.floor(v / 93)]);
  for (const b of bytes) {
    acc |= b << bits;
    bits += 8;
    if (bits >= 13) { put(acc & 8191); acc >>>= 13; bits -= 13; }
  }
  if (bits > 0) put(acc & 8191);
  return `${bytes.length} ${out.join("")}`;
}
export function unpack93(text) {
  const s = text.trim(), sp = s.indexOf(" "), n = Number(s.slice(0, sp));
  const bytes = new Uint8Array(n);
  let acc = 0, bits = 0, o = 0;
  for (let i = sp + 1; i + 1 < s.length && o < n; i += 2) {
    acc |= (TEXT93.indexOf(s[i]) + 93 * TEXT93.indexOf(s[i + 1])) << bits;
    bits += 13;
    while (bits >= 8 && o < n) { bytes[o++] = acc & 255; acc >>>= 8; bits -= 8; }
  }
  if (o !== n) throw new Error(`a block of the page's data is short: ${o} bytes of ${n}`);
  return bytes;
}
function packText(text) {
  const gz = gzipSync(Buffer.from(text, "utf8"), { level: 9 });
  const block = pack93(gz);
  if (/[< ]/.test(block.slice(block.indexOf(" ") + 1))) throw new Error("a block of the page's data has a space or a <");
  if (gunzipSync(unpack93(block)).toString("utf8") !== text) throw new Error("a block of the page's data doesn't read back as written");
  return block;
}

// JavaScript without its comments, its indentation and the spaces and line ends no token
// needs (tools/strip-js-comments.mjs), checked: every string, template and regular
// expression in it must come out exactly as written, and it must still read as JavaScript,
// lines joined and all (node --check, as a module for .mjs, a classic script for .cjs);
// otherwise the build stops.
function stripChecked(js, what, ext) {
  const stripped = stripComments(js);
  if (JSON.stringify(stringsOf(js)) !== JSON.stringify(stringsOf(stripped))) throw new Error(`taking the comments out of ${what} changed a string`);
  const tmp = join(tmpdir(), `ani-stripped-${process.pid}${ext}`);
  writeFileSync(tmp, stripped);
  const checked = spawnSync(process.execPath, ["--check", tmp], { encoding: "utf8" });
  rmSync(tmp, { force: true });
  if (checked.status !== 0) throw new Error(`${what} doesn't read as JavaScript without its comments: ${(checked.stderr || "").split("\n").slice(0, 5).join(" ")}`);
  return stripped;
}

// The claude.ai copy's page script, packed (pack93 of its gzip, as the data blocks are),
// in a block of its own, and the module script that unpacks it and runs it as the module it
// was: an inline module script put on the page, with its text, so that it starts where a
// page may run inline scripts but not eval (a CSP without 'unsafe-eval'), as the copy
// before stage 7 did (the review of stage 7, M3: run with new Function, as it was, it
// showed nothing at all there). tools/check-film-app.mjs hooks a check's functions into it
// with withPageScript; test/page-script.test.js runs the loader on a packed block.
export const PAGE_SCRIPT_ID = "page-script";
export const PAGE_LOADER = `
const s = document.getElementById("${PAGE_SCRIPT_ID}").textContent.trim(), sp = s.indexOf(" "), n = Number(s.slice(0, sp));
const T = [...Array(94)].map((_, k) => String.fromCharCode(33 + k)).filter((c) => c !== "<").join(""), digit = new Int16Array(128);
for (let k = 0; k < 93; k++) digit[T.charCodeAt(k)] = k;
const bytes = new Uint8Array(n);
let acc = 0, bits = 0, o = 0;
for (let i = sp + 1; i + 1 < s.length && o < n; i += 2) {
  acc |= (digit[s.charCodeAt(i)] + 93 * digit[s.charCodeAt(i + 1)]) << bits;
  bits += 13;
  while (bits >= 8 && o < n) { bytes[o++] = acc & 255; acc >>>= 8; bits -= 8; }
}
const js = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
const el = document.createElement("script");
el.type = "module";
el.textContent = js;
document.body.append(el);
`;
// The claude.ai copy with its page script changed by f (the script's text, unpacked, to
// the text to pack again): for a check that hooks functions into it.
export function withPageScript(html, f) {
  const open = `<script type="text/plain" id="${PAGE_SCRIPT_ID}">`;
  const a = html.indexOf(open), b = a < 0 ? -1 : html.indexOf("</script>", a);
  if (a < 0 || b < 0) throw new Error("the page has no packed page script");
  const js = gunzipSync(unpack93(html.slice(a + open.length, b))).toString("utf8");
  return html.slice(0, a + open.length) + packText(f(js)) + html.slice(b);
}

// The claude.ai copy's bundle: the revival's own Lisp files (REVIVE;*) without their
// comments (tools/strip-lisp-comments.mjs), every line kept, so that every line number
// stays as it is; each must read back as the same forms on the same lines, or the build
// stops. Ken's files go as they are. The glass box's lines into the revival's code are
// worked out here, from the repository's files (reviveIndex, knowIndex's ;;why: lines),
// not from the bundle, and this copy has no code pages. Returns the characters taken out.
function stripReviveComments(bundle) {
  let saved = 0;
  for (const f of bundle.files) {
    if (f.dir !== "REVIVE") continue;
    const stripped = stripLispComments(f.text);
    const why = differentForms(f.text, stripped);
    if (why) throw new Error(`REVIVE;${f.fn1} ${f.fn2} without its comments ${why}`);
    saved += f.text.length - stripped.length;
    f.text = stripped;
  }
  return saved;
}

// The differences that make b of a, two JSON values: [[path, value]], each value put at
// its path (a list of keys); a list or object whose keys differ is put whole.
export function jsonPatch(a, b, path = [], out = []) {
  if (JSON.stringify(a) === JSON.stringify(b)) return out;
  const both = a && b && typeof a === "object" && typeof b === "object" && Array.isArray(a) === Array.isArray(b);
  if (!both || (Array.isArray(a) ? a.length !== b.length : JSON.stringify(Object.keys(a)) !== JSON.stringify(Object.keys(b)))) { out.push([path, b]); return out; }
  for (const k of Object.keys(b)) jsonPatch(a[k], b[k], [...path, Array.isArray(b) ? Number(k) : k], out);
  return out;
}
export function applyJsonPatch(a, patch) {
  let out = JSON.parse(JSON.stringify(a));
  for (const [path, v] of patch) {
    if (!path.length) { out = v; continue; }
    let o = out;
    for (const k of path.slice(0, -1)) o = o[k];
    o[path[path.length - 1]] = v;
  }
  return out;
}

// ---- a story's names that clash with Ani's

// The names a story's scenes and characters may not have (src/pipeline.js aniNames: a
// file that defines one would replace the story's scene or character when it loads), for
// the page's tidy step: those of Ani as in 1978, and those each extension adds; and the
// file each is loaded from (its tags entry, as load.33 fills them; none for an actor Ani
// already has when she starts), for saying why. The page takes a run's names as Ken's
// and each of its extensions' together, which is checked here against aniNames for all
// of them at once.
function storyNames(root) {
  const fs = makeProjectFileSystem(root);
  const base = aniNames(fs, { extensions: [] });
  const byExtension = {};
  for (const e of EXTENSIONS) byExtension[e.id] = [...aniNames(fs, { extensions: [e.id] })].filter((n) => !base.has(n)).sort();
  const all = EXTENSIONS.map((e) => e.id);
  const union = new Set([...base, ...all.flatMap((id) => byExtension[id])]);
  const real = aniNames(fs, { extensions: all });
  if (union.size !== real.size || [...real].some((n) => !union.has(n))) throw new Error("the names each extension takes don't add up to those all of them take together (aniNames)");
  // where each is loaded from, in a Lisp booted as aniNames boots one
  const L = boot(fs, { extensions: all });
  L.evalString("(load '|ken;dscrp >|)");
  L.evalString("(load '|ken;relate >|)");
  const ACTOR_LOAD = L.obarray.find("ACTOR-LOAD");
  const byFile = {}; // "KEN;EMOTE" -> the names it defines
  for (const name of [...real].sort()) {
    const sym = L.obarray.find(name.toUpperCase());
    for (let p = sym && sym.plist; p && p !== L.NIL && p.cdr; p = p.cdr.cdr) {
      if (p.car === ACTOR_LOAD) { (byFile[L.print(p.cdr.car).replace(/^\|(.*)\|$/, "$1")] ||= []).push(name); break; }
    }
  }
  return { base: [...base].sort(), byExtension, byFile };
}

// The functions src/pipeline.js renames a story's clashing names with, as written there,
// for the page's tidy step, so that the page and the pipeline use one helper: each a
// top-level function, ending at a line that is only "}", or a const on one line. The
// build checks that they rename a story as src/pipeline.js's own do.
const STORY_NAME_FUNCTIONS = ["readForms", "storyOutline", "LASTING", "changesOfTasks", "changesIn", "storyRenames", "renameStoryNames"];
// src/pipeline.js's own top-level functions and constants of these names, as written there:
// a function ends at a line that is only "}", a const on one line at its ";", and a const
// that opens an object on its line at the line that is only "};".
function pipelineSource(root, names) {
  const src = readFileSync(`${root}/src/pipeline.js`, "utf8").replace(/\r\n?/g, "\n");
  return names.map((name) => {
    const m = new RegExp(`^(?:export )?(function\\*? ${name}\\(|const ${name} = )`, "m").exec(src);
    if (!m) throw new Error(`src/pipeline.js has no top-level ${name}`);
    const line = src.slice(m.index, src.indexOf("\n", m.index));
    const end = !m[1].startsWith("const") ? src.indexOf("\n}\n", m.index) + 3 : /\{$/.test(line) ? src.indexOf("\n};\n", m.index) + 4 : src.indexOf(";\n", m.index) + 2;
    if (end < m.index + 3) throw new Error(`src/pipeline.js's ${name} doesn't end as the build expects`);
    return src.slice(m.index, end).replace(/^export /, "");
  }).join("\n");
}
function pipelineFunctions(root) {
  const code = pipelineSource(root, STORY_NAME_FUNCTIONS);
  const page = new Function(`${code}\nreturn { storyOutline, storyRenames, renameStoryNames };`)();
  const sample = `;; cast: alone = the alone one (she); goat = the goat (she)
;; scenes: fear = Fear; screen = The Screen
(define alone character (process initial description (personality (and kind alone))))
(define goat character (process initial description (personality shy)))
(define (relationship-of alone goat) relationship (process initial description loves))
(define fear scene (process initial description (and (establish (emotional-state alone (fear high))) (convey (alone alone goat)))))
(define screen scene (process initial description (convey (undoes goat (from-scene fear (convey (alone alone goat)))))))
(define the-films-focus focus (set your parts-of-the-focus to (alone fear screen (relationship-of alone goat))))
`;
  const taken = new Set(["alone", "fear", "screen"]);
  const ours = renameStoryNames(sample, storyRenames(storyOutline(sample), taken));
  const theirs = page.renameStoryNames(sample, page.storyRenames(page.storyOutline(sample), taken));
  if (ours !== theirs || ours === sample) throw new Error("the page's copy of src/pipeline.js's story-name functions renames a story differently");
  return code;
}

// src/pipeline.js's whyTheyAct and what it needs, as written there, for the page's "why
// they act as they do" (the character panel's explanations and the scene's timeline): the
// page runs Ani's records through the same code as the tools (tools/check-still.mjs). The
// page's copy reads the page's own registry of extensions (DATA.extensions, as EXTENSIONS).
// The build checks that it says what src/pipeline.js says of Ken's 1978 scenes and of his
// beautified scene with the page's set (reports/ext/change/beautified-film), and that a
// 1978 film as the page carries it (packFilm: the picture's segments, no state) has the
// same stretches of more than a second in a part with no one moving (whyTheyAct's stills)
// as the film itself.
const WHY_FUNCTIONS = ["readForms", "printForm", "extensionsFor", "collectWanders", "ACTIVITY_METHODS", "REVIVAL_METHODS", "whyTheyAct", "walkForm", "stopsOf", "repeatAround", "changeSeconds", "stillStretches"];
function unpackForCheck(film) {
  // as the page's unpackFilm does
  const last = {}, now = {};
  const frames = film.packed.segs.map((s, k) => {
    const segs = {};
    for (const [c, t] of Object.entries(s)) { const abs = t[0] === "d" ? t.slice(1).map((v, i) => v + last[c][i]) : t; last[c] = abs; segs[c] = abs.map((v) => v / 10); }
    for (const [c, v] of Object.entries(film.packed.chars[k])) now[c] = { visible: !!v[0], dynamics: v[1], goal: v[2] };
    return { segs, chars: { ...now } };
  });
  const { packed, ...rest } = film;
  return { ...rest, frames };
}
function whyFunctions(root) {
  const code = pipelineSource(root, WHY_FUNCTIONS);
  const page = new Function("EXTENSIONS", `${code}\nreturn { whyTheyAct };`)(EXTENSIONS);
  const json = (f) => JSON.parse(readFileSync(`${root}/${f}`, "utf8"));
  const cases = [
    ...SCENES.map(([id]) => [`reports/pass2/${id}.glass.json`, `reports/film/${id}.film.json`, []]),
    ...SCENES.map(([id]) => [`reports/film/24fps/${id}.glass.json`, `reports/film/24fps/${id}.film.json`, []]),
    ["reports/ext/change/beautified-film/cinderella-beautified.glass.json", "reports/ext/change/beautified-film/cinderella-beautified.film.json", ["mend", "know", "appear", "change", "seen"]],
  ].filter(([g, f]) => existsSync(`${root}/${g}`) && existsSync(`${root}/${f}`));
  for (const [g, f, extensions] of cases) {
    const glass = json(g), film = json(f);
    const theirs = JSON.stringify(whyTheyActOfPipeline(glass, film, { extensions }));
    if (JSON.stringify(page.whyTheyAct(glass, film, { extensions })) !== theirs) throw new Error(`the page's copy of whyTheyAct says otherwise of ${f}`);
    const packedStills = JSON.stringify(page.whyTheyAct(glass, unpackForCheck(packFilm(film)), { extensions }).stills);
    if (packedStills !== JSON.stringify(JSON.parse(theirs).stills)) throw new Error(`${f} as the page carries it has other stretches with no one moving than the film itself`);
  }
  return code;
}

// The run that confirmed the DICHAR/DISPLY speed inversion (reports/ext/slips/speed.json,
// tools/check-slips.mjs --speed): every gradual change Director runs in Ken's 1978
// Cinderella, by its speed, how many, and the least and most of the ticks Director gave it
// over DISPLY's estimate; null if the file isn't there.
function speedSummary(root) {
  const file = `${root}/reports/ext/slips/speed.json`;
  if (!existsSync(file)) return null;
  const by = {};
  for (const r of JSON.parse(readFileSync(file, "utf8")).kens) (by[r.speed] ||= []).push(r.ratio);
  return ["high", "medium", "low"].filter((s) => by[s]).map((speed) => ({ speed, changes: by[speed].length, least: Math.min(...by[speed]), most: Math.max(...by[speed]) }));
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
    // turns on for the films it makes, each in its group of the "Which extensions" panel,
    // and those (optIn) a visitor ticks there; Ken's 1978 film above is as it was made
    extensions: EXTENSIONS.map(({ id, label, group, optIn, files, requires, changes1978, note, recorder }) => ({ id, label, group, ...(optIn ? { optIn: true } : {}), files, requires, changes1978, note, ...(recorder && recorder.looks ? { looks: true } : {}) })),
    // the elements Ani chooses a look by (REVIVE;APPEAR), and how Ken drew his cast in 1978
    appearanceElements: APPEARANCE_ELEMENTS,
    kenLooks: kenLooks(root),
    // the revival's knowledge (REVIVE;KNOW): each piece with its file, line and why, for
    // the glass box's marks, and the words Ani knows with KNOW on (tools/know-index.mjs)
    know: knowIndex(root),
    // the names a story's scenes and characters may not have, for the page's tidy step
    names: storyNames(root),
    // the run that confirmed SLIPS' S9, the DICHAR/DISPLY speed inversion, which the page
    // shows where it says the inversion
    slipsSpeed: speedSummary(root),
  };
  // a 24-frame scene's glass box is its 4-frame one but for where the scenes before it left
  // the characters: carried as the differences (jsonPatch), which the page applies
  if (data.scenes24) for (const s of data.scenes24) {
    const base = data.scenes.find((x) => x.id === s.id).glass;
    const patch = jsonPatch(base, s.glass);
    if (JSON.stringify(applyJsonPatch(base, patch)) !== JSON.stringify(s.glass)) throw new Error(`${s.id}'s 24-frame glass box doesn't come back from its differences`);
    if (JSON.stringify(patch).length < JSON.stringify(s.glass).length) { s.glassPatch = patch; delete s.glass; }
  }
  const packed = packText;
  // with the interpreter's Lisp, so the page can read what the Lisp that stopped typed last;
  // without its comments, as the claude.ai copy's script goes (stripChecked)
  const runtime = stripChecked(bundleModules(["src/pipeline.js", "src/its/bundle-fs.js", "src/maclisp/index.js"], "AniRuntime", root), "Ani's runtime", ".cjs");
  const bundle = assembleBundle(fs, JSON.parse(readFileSync(`${root}/app/data/ani-bundle-files.json`, "utf8")));
  sizes.lispComments = claudeArtifact ? stripReviveComments(bundle) : 0;
  const template = readFileSync(`${root}/app/film.template.html`, "utf8");
  const blocks = { "/*FILM-DATA*/": packed(JSON.stringify(data)), "/*ANI-RUNTIME*/": packed(runtime), "/*ANI-BUNDLE*/": packed(JSON.stringify(bundle)) };
  // the claude.ai copy reports nothing (its CSP refuses Sentry), so it has report.js's
  // two names, as they are with no DSN, and none of its code
  const reportOff = "const report = { on: false };\nconst sendStoryButton = () => \"\";\n";
  const parts = ["llm.js", "json.js", "save.js", "report.js"].map((f) => (claudeArtifact && f === "report.js" ? reportOff : readFileSync(`${root}/app/film/${f}`, "utf8"))).join("\n");
  let content = template;
  for (const [mark, text] of Object.entries({ ...blocks, "/*FILM-PARTS*/": parts, "/*STORY-NAMES*/": pipelineFunctions(root), "/*WHY-THEY-ACT*/": whyFunctions(root) })) {
    if (content.split(mark).length !== 2) throw new Error(`the template should have one ${mark}`);
    content = content.replace(mark, () => text);
  }
  if (claudeArtifact) {
    const flags = { "/*ARTIFACT-BUILD*/false": "true", '/*CODE-SITE*/""': JSON.stringify(site || "none") };
    for (const [mark, value] of Object.entries(flags)) {
      if (content.split(mark).length !== 2) throw new Error(`the page should have one ${mark}`);
      content = content.replace(mark, () => value);
    }
    // claude.ai refuses a page over about 950 KB, so this copy's page script goes without
    // its comments, its indentation and the spaces and line ends no token needs
    // (tools/strip-js-comments.mjs); every string, template and regular expression in it
    // must come out exactly as written, or the build stops
    const open = '<script type="module">';
    const a = content.indexOf(open) + open.length;
    const b = content.indexOf("</script>", a);
    if (a < open.length || b < 0 || content.indexOf(open, a) >= 0) throw new Error("the page should have one module script");
    const js = content.slice(a, b);
    const stripped = stripChecked(js, "the claude.ai copy's script", ".mjs");
    sizes.comments = js.length - stripped.length;
    // and it goes gzipped and written as text, as the page's data does, in a block of its
    // own (PAGE_SCRIPT_ID), which a small module script (PAGE_LOADER) unpacks and puts on
    // the page as a module script of its own; stripChecked has read it as a module.
    const packedScript = packText(stripped);
    const loader = stripChecked(PAGE_LOADER, "the claude.ai copy's loader", ".mjs");
    sizes.script = packedScript.length;
    content = content.slice(0, a - open.length) + `<script type="text/plain" id="${PAGE_SCRIPT_ID}">${packedScript}</script>\n` + open + loader + content.slice(b);
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
  console.log(`wrote ${out} (${readFileSync(out).length} bytes, ${kb(readFileSync(out).length)}: film data ${kb(sizes.data)}, Ani's runtime ${kb(sizes.runtime)}, Ani's files ${kb(sizes.bundle)}${sizes.comments ? `; ${kb(sizes.comments)} of comments, indentation and spaces left out, and the script packed in ${kb(sizes.script)}` : ""}${sizes.lispComments ? `; the revival's Lisp without ${kb(sizes.lispComments)} of comments, every line kept and read back alike` : ""})`);
}
