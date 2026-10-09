// Build app/film.html, the web app that shows Ani making the Cinderella film, from
// app/film.template.html and the data the runs wrote:
//   reports/film/<scene>.film.json   each frame Director filmed (tools/run-scene.mjs --record)
//   reports/pass2/<scene>.glass.json each scene's plan as Ani left it (tools/run-pass2.mjs --glass-box)
//   app/data/pass1.json              pass 1's choice points and their reasoning (tools/run-pass1.mjs --glass-box)
//   KEN;CINDY 46                     the film description, from tape 7005017
// and, for making the film again in the browser, Ani's runtime (src/pipeline.js and
// what it imports, as one classic script for a worker) and the files Ani reads
// (app/data/ani-bundle-files.json, from tools/build-ani-bundle.mjs).
// Everything is inlined, gzipped as base64, so the page works opened directly, served,
// or published as a claude.ai artifact (which can fetch nothing).
// Usage: node tools/build-film-app.mjs [--content-only out.html]
//   --content-only writes the page without its document skeleton (for publishing).
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { decodeItsText } from "../src/its/text.js";
import { definitions } from "./lisp-defs.mjs";
import { bundleModules } from "./bundle-js.mjs";
import { assembleBundle } from "./build-ani-bundle.mjs";

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
  return { display: { file: "disply.311", methods: display }, convey: { file: "convey.64", verbs: convey }, establish };
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

const SCENES = [
  ["introduction", "The Introduction"],
  ["kept-apart", "Kept Apart"],
  ["no-longer-kept-apart", "No Longer Kept Apart"],
  ["meeting", "The Meeting"],
  ["justice", "Justice"],
];

export const sizes = {};
export function buildFilmApp(root = ".", { contentOnly = null } = {}) {
  const fs = makeProjectFileSystem(root);
  const cindy = fs.textOf(fs.find({ dir: "KEN", fn1: "CINDY", fn2: "46" }));
  const pass1 = JSON.parse(readFileSync(`${root}/app/data/pass1.json`, "utf8"));
  const data = {
    scenes: SCENES.map(([id, title]) => ({
      id,
      title,
      film: JSON.parse(readFileSync(`${root}/reports/film/${id}.film.json`, "utf8")),
      glass: JSON.parse(readFileSync(`${root}/reports/pass2/${id}.glass.json`, "utf8")),
    })),
    cindy,
    pass1: { cp29: pass1.cp29, choicePoints: pass1.choicePoints },
    code: codeIndex(root),
    words: vocabulary(root),
  };
  const packed = (text) => gzipSync(Buffer.from(text, "utf8"), { level: 9 }).toString("base64");
  const runtime = bundleModules(["src/pipeline.js", "src/its/bundle-fs.js"], "AniRuntime", root);
  const bundle = assembleBundle(fs, JSON.parse(readFileSync(`${root}/app/data/ani-bundle-files.json`, "utf8")));
  const template = readFileSync(`${root}/app/film.template.html`, "utf8");
  const blocks = { "/*FILM-DATA*/": packed(JSON.stringify(data)), "/*ANI-RUNTIME*/": packed(runtime), "/*ANI-BUNDLE*/": packed(JSON.stringify(bundle)) };
  let content = template;
  for (const [mark, b64] of Object.entries(blocks)) {
    if (content.split(mark).length !== 2) throw new Error(`the template should have one ${mark}`);
    content = content.replace(mark, () => b64);
  }
  sizes.data = blocks["/*FILM-DATA*/"].length;
  sizes.runtime = blocks["/*ANI-RUNTIME*/"].length;
  sizes.bundle = blocks["/*ANI-BUNDLE*/"].length;
  if (contentOnly) {
    writeFileSync(contentOnly, content);
    return contentOnly;
  }
  const page = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n` +
    `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n${content}\n</body>\n</html>\n`;
  writeFileSync(`${root}/app/film.html`, page);
  return `${root}/app/film.html`;
}

if (process.argv[1]?.endsWith("build-film-app.mjs")) {
  const i = process.argv.indexOf("--content-only");
  const out = buildFilmApp(".", { contentOnly: i > 0 ? process.argv[i + 1] : null });
  const kb = (n) => `${Math.round(n / 1024)} KB`;
  console.log(`wrote ${out} (${kb(readFileSync(out).length)}: film data ${kb(sizes.data)}, Ani's runtime ${kb(sizes.runtime)}, Ani's files ${kb(sizes.bundle)})`);
}
