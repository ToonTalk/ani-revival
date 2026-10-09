// Build app/source.html, the code Ani and Director ran, with each name linked to its
// definition, from app/source.template.html. The files are read from the tapes
// (original/, decoded from ITS's evacuate format) and from the revival's own
// sources (src/director/). Linked from the film page (app/film.html).
// Usage: node tools/build-source-app.mjs [--content-only out.html]
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { decodeItsText } from "../src/its/text.js";
import { ANI_FILES, DRIVER_FILES, DIRECTOR_FILES } from "../src/sources.js";
import { definitions } from "./lisp-defs.mjs";

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
  const ours = [`src/director/revive/bridge.lisp`, ...readdirSync(`${root}/src/director/ken1`).filter((f) => f.endsWith(".lisp")).sort().map((f) => `src/director/ken1/${f}`)];
  for (const p of ours) {
    const text = readFileSync(`${root}/${p}`, "utf8").replace(/\r\n?/g, "\n");
    const name = p.split("/").pop().replace(/\.lisp$/, "");
    const bridge = p.includes("revive");
    // the first comment line after the title says what the file is
    const lines = text.split("\n").filter((l) => /^;;;?\s/.test(l)).map((l) => l.replace(/^;+\s*/, ""));
    const note = (lines.find((l, k) => k > 0 && l && !/^-\*-/.test(l)) || "").replace(/\s+/g, " ");
    files.push({ id: bridge ? "revive-bridge" : `ken1-${name}`, its: bridge ? "REVIVE;BRIDGE" : `KEN1;${name.toUpperCase()}`, group: "revival", note, text, origin: "written for the revival" });
  }
  for (const f of files) f.defs = definitions(f.text);
  const data = {
    groups: [
      { id: "ani", title: "Ani", note: "Ani herself: the 31 files the 1979 tags table lists, from tape 7005017 (January 1979)." },
      { id: "drivers", title: "Running Ani", note: "How the passes were run, and Ani's films." },
      { id: "director", title: "Director", note: "The Director files that survived, as of January 1979." },
      { id: "revival", title: "Written for the revival", note: "Not Ken's code: KEN1; files rebuilt from the evidence, and REVIVE;BRIDGE, which restores the 1978 conventions Ani relies on. Each definition cites its evidence." },
    ],
    files,
  };
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  const template = readFileSync(`${root}/app/source.template.html`, "utf8");
  const content = template.replace("/*SOURCE-DATA*/", () => json);
  if (contentOnly) {
    writeFileSync(contentOnly, content);
    return contentOnly;
  }
  const page = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n` +
    `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n${content}\n</body>\n</html>\n`;
  writeFileSync(`${root}/app/source.html`, page);
  return `${root}/app/source.html`;
}

if (process.argv[1]?.endsWith("build-source-app.mjs")) {
  const i = process.argv.indexOf("--content-only");
  const out = buildSourceApp(".", { contentOnly: i > 0 ? process.argv[i + 1] : null });
  console.log(`wrote ${out} (${Math.round(readFileSync(out).length / 1024)} KB)`);
}
