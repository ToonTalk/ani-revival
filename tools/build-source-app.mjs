// Build app/source.html, the code Ani and Director ran, with each name linked to its
// definition, from app/source.template.html. The files are read from the tapes
// (original/, decoded from ITS's evacuate format) and from the revival's own
// sources (src/director/), the extensions in src/director/revive/ among them. Linked
// from the film page (app/film.html), whose glass box links each repair to its file.
// Usage: node tools/build-source-app.mjs [--content-only out.html]
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { decodeItsText } from "../src/its/text.js";
import { ANI_FILES, DRIVER_FILES, DIRECTOR_FILES } from "../src/sources.js";
import { definitions } from "./lisp-defs.mjs";
import { fullPage } from "./page-shell.mjs";
import { reviveFiles } from "./build-film-app.mjs";

const DIRECTOR_NOTES = {
  "}^rsv.6": "Director's kernel: actors, sending messages, finding the method that matches, loading and saving. Recovered from an Emacs save file.",
  "some.666": "Something, the actor all others descend from: variables, making actors, memory, planning.",
  "object.401": "Objects that draw themselves on the TV and move gradually.",
  "screen.86": "The screen, between actors and the TV display.",
  "movie.153": "Movies: filming ticks as frames, and projecting them.",
  "poly.29": "Polygons, the shapes Ani's characters are drawn as.",
  "actcom.17": "Comparing actors.",
  "lisp.7": "Ken's Lisp init file.",
  "load.33": "Loading Director and Ani's tags.",
  "declar.67": "Compiler declarations, part 1.",
  "decla2.186": "Compiler declarations for Director's system code.",
  "dump.44": "Saving a Director job, and Ken's quick test of the turtle part.",
  "tv2r.8": "Reading the TV picture into a printable file.",
};
const DRIVER_NOTES = {
  "datest.56": "Pass 1: Ani chooses how each character moves (wrote CP 29).",
  "run.65": "Pass 2: Ani plans each scene and writes the program Director runs.",
  "aninit.65": "Director extended to run Ani's scene programs, and to film them.",
};

export function buildSourceApp(root = ".", { contentOnly = null } = {}) {
  const manifest = new Map(JSON.parse(readFileSync(`${root}/original/MANIFEST.json`, "utf8")).files.map((f) => [f.path, f]));
  const inventory = readFileSync(`${root}/INVENTORY.md`, "utf8");
  const aniNotes = {};
  for (const m of inventory.matchAll(/^\| `([^`]+)` \| \d+ \| [^|]* \| ([^|\n]+) \|/gm)) aniNotes[m[1]] = m[2].trim();
  const files = [];
  const original = (path, group, note) => {
    const base = path.split("/").pop();
    const m = manifest.get(path);
    const text = decodeItsText(readFileSync(`${root}/${path}`)).text.replace(/\r\n?/g, "\n");
    const id = base === "}^rsv.6" ? "drect.6" : base;
    files.push({ id, its: base === "}^rsv.6" ? "KEN1;DRECT (}^RSV 6)" : m ? `${m.its_dir};${m.its_name}` : base, group, note, text, origin: m ? `tape ${m.tape}` : "" });
  };
  for (const p of ANI_FILES) original(p, "ani", aniNotes[p.split("/").pop()] || "");
  for (const p of DRIVER_FILES) original(p, "drivers", DRIVER_NOTES[p.split("/").pop()] || "");
  for (const p of DIRECTOR_FILES.filter((p) => !p.endsWith("diagrm.92"))) original(p, "director", DIRECTOR_NOTES[p.split("/").pop()] || "");
  // the first comment line after the title says what the file is
  const noteOf = (text) => {
    const lines = text.split("\n").filter((l) => /^;;;?\s/.test(l)).map((l) => l.replace(/^;+\s*/, ""));
    return (lines.find((l, k) => k > 0 && l && !/^-\*-/.test(l)) || "").replace(/\s+/g, " ");
  };
  // the revival's own: REVIVE;BRIDGE and the KEN1; files rebuilt from the evidence, then
  // the extensions, every other file in src/director/revive/ (WRAP, MEND1, ...), in the
  // order they load, so a file added there is listed with no change here
  const revive = reviveFiles(root);
  const ken1 = readdirSync(`${root}/src/director/ken1`).filter((f) => f.endsWith(".lisp")).sort().map((f) => `src/director/ken1/${f}`);
  for (const { name, text } of revive.filter((f) => f.name === "bridge")) files.push({ id: "revive-bridge", its: "REVIVE;BRIDGE", group: "revival", note: noteOf(text), text, origin: "written for the revival" });
  for (const p of ken1) {
    const text = readFileSync(`${root}/${p}`, "utf8").replace(/\r\n?/g, "\n");
    const name = p.split("/").pop().replace(/\.lisp$/, "");
    files.push({ id: `ken1-${name}`, its: `KEN1;${name.toUpperCase()}`, group: "revival", note: noteOf(text), text, origin: "written for the revival" });
  }
  for (const { name, text } of revive.filter((f) => f.name !== "bridge")) {
    // the title line says what the file is: ";;; REVIVE;MEND1: M1, (not X) is narrowed ..."
    const title = (text.match(/^;;;\s*REVIVE;[A-Z0-9]+:\s*(.+)$/m) || [])[1];
    files.push({ id: `revive-${name}`, its: `REVIVE;${name.toUpperCase()}`, group: "revival", note: title || noteOf(text), text, origin: "an extension written for the revival, loaded only when asked for" });
  }
  for (const f of files) f.defs = definitions(f.text);
  const data = {
    groups: [
      { id: "ani", title: "Ani", note: "Ani itself: the 31 files the 1979 tags table lists, from tape 7005017 (January 1979)." },
      { id: "drivers", title: "Running Ani", note: "How the passes were run, and Ani's films." },
      { id: "director", title: "Director", note: "The Director files that survived, as of January 1979." },
      { id: "revival", title: "Written for the revival", note: "Not Ken's code: KEN1; files rebuilt from the evidence; REVIVE;BRIDGE, which restores the 1978 conventions Ani relies on; and the revival's extensions (REVIVE;WRAP, MEND1 and on), which are not part of Ani as in 1978 and load only when the film page's switch asks for the revival's repairs. Each definition cites its evidence." },
    ],
    files,
  };
  const packed = gzipSync(Buffer.from(JSON.stringify(data), "utf8"), { level: 9 }).toString("base64");
  const template = readFileSync(`${root}/app/source.template.html`, "utf8");
  // "Back to the film", back to the film page as it was left (app/back-to-film.js)
  const content = template.replace("/*SOURCE-DATA*/", () => packed).replace("/*BACK-TO-FILM*/", () => readFileSync(`${root}/app/back-to-film.js`, "utf8"));
  if (contentOnly) {
    writeFileSync(contentOnly, content);
    return contentOnly;
  }
  const page = fullPage(content);
  writeFileSync(`${root}/app/source.html`, page);
  return `${root}/app/source.html`;
}

if (process.argv[1]?.endsWith("build-source-app.mjs")) {
  const i = process.argv.indexOf("--content-only");
  const out = buildSourceApp(".", { contentOnly: i > 0 ? process.argv[i + 1] : null });
  console.log(`wrote ${out} (${Math.round(readFileSync(out).length / 1024)} KB)`);
}
