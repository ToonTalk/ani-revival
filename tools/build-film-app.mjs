// Build app/film.html, the web app that shows Ani making the Cinderella film, from
// app/film.template.html and the data the runs wrote:
//   reports/film/<scene>.film.json   each frame Director filmed (tools/run-scene.mjs --record)
//   reports/pass2/<scene>.glass.json each scene's plan as Ani left it (tools/run-pass2.mjs --glass-box)
//   app/data/pass1.json              pass 1's choice points and their reasoning (tools/run-pass1.mjs --glass-box)
//   KEN;CINDY 46                     the film description, from tape 7005017
// The data is inlined, so the page works opened directly, served, or published.
// Usage: node tools/build-film-app.mjs [--content-only out.html]
//   --content-only writes the page without its document skeleton (for publishing).
import { readFileSync, writeFileSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";

const SCENES = [
  ["introduction", "The Introduction"],
  ["kept-apart", "Kept Apart"],
  ["no-longer-kept-apart", "No Longer Kept Apart"],
  ["meeting", "The Meeting"],
  ["justice", "Justice"],
];

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
  };
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  const template = readFileSync(`${root}/app/film.template.html`, "utf8");
  const content = template.replace("/*FILM-DATA*/", () => json);
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
  console.log(`wrote ${out} (${Math.round(readFileSync(out).length / 1024)} KB)`);
}
