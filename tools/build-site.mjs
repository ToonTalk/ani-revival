// Build the web site for toontalk.github.io/ani/ (the ToonTalk/ani repository, served
// by GitHub Pages from its main branch): the film page as index.html, the code and
// choice-point pages beside it, and the claude.ai copy, its code links pointing here.
// Usage: node tools/build-site.mjs <site folder>   (the folder of the ani repository)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { buildFilmApp } from "./build-film-app.mjs";
import { buildSourceApp } from "./build-source-app.mjs";

export const SITE_URL = "https://toontalk.github.io/ani/";

export function buildSite(out, root = ".") {
  mkdirSync(out, { recursive: true });
  buildFilmApp(root);
  // the code page too, so it has every file the film page's code links name (the
  // revival's extensions among them)
  buildSourceApp(root);
  // on the site the film page is index.html, so "Back to the film" goes to the folder
  const toIndex = (html) => html.replace(/href="film\.html"/g, 'href="./"');
  writeFileSync(`${out}/index.html`, readFileSync(`${root}/app/film.html`, "utf8"));
  for (const page of ["source.html", "pass1.html"]) writeFileSync(`${out}/${page}`, toIndex(readFileSync(`${root}/app/${page}`, "utf8")));
  buildFilmApp(root, { claudeArtifact: `${out}/ani-cinderella-claude-artifact.html`, site: SITE_URL });
  writeFileSync(`${out}/.nojekyll`, "");
  if (!existsSync(`${out}/README.md`)) writeFileSync(`${out}/README.md`, readFileSync(`${root}/site/README.md`, "utf8"));
  return ["index.html", "source.html", "pass1.html", "ani-cinderella-claude-artifact.html"].map((f) => `${out}/${f}`);
}

if (process.argv[1]?.endsWith("build-site.mjs")) {
  const out = process.argv[2];
  if (!out) { console.error("usage: node tools/build-site.mjs <site folder>"); process.exit(1); }
  for (const f of buildSite(out)) console.log(`wrote ${f} (${Math.round(readFileSync(f).length / 1024)} KB)`);
}
