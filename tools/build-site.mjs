// Build the web site for toontalk.github.io/ani/ (the ToonTalk/ani repository, served
// by GitHub Pages from its main branch): the film page as index.html, the code and
// choice-point pages beside it, the pages about Ani (site/pages/*.html, and whatever of
// site/pages/ they use) at its top, and the claude.ai copy, its code links pointing here.
// The site's film page, and only it, reports its errors to Ken's Sentry: it is given the
// DSN in site/sentry.json (app/film.html and the claude.ai copies have none, and report
// nothing; claude.ai's CSP would refuse Sentry anyway).
// Usage: node tools/build-site.mjs <site folder>   (the folder of the ani repository)
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, normalize, relative, sep } from "node:path";
import { buildFilmApp } from "./build-film-app.mjs";
import { buildSourceApp } from "./build-source-app.mjs";

export const SITE_URL = "https://toontalk.github.io/ani/";
// The film page with Ken's Sentry DSN (public by design) in SENTRY_DSN (app/film/report.js).
export function withSentry(html, root = ".") {
  const { dsn } = JSON.parse(readFileSync(`${root}/site/sentry.json`, "utf8"));
  const mark = '/*SENTRY-DSN*/""';
  if (html.split(mark).length !== 2) throw new Error(`the film page should have one ${mark}`);
  return html.replace(mark, () => JSON.stringify(dsn));
}

// On the site the film page is index.html, so a link to it ("Back to the film", which may
// end in #view) goes to the folder; and the pages about Ani, in site/pages/ beside the
// repository's app/, are beside it.
export const toIndex = (html) => html.replace(/href="film\.html([#?][^"]*)?"/g, (m, rest) => `href="./${rest || ""}"`);
const toSitePages = (html) => html.replace(/href="\.\.\/site\/pages\/([^"/]+\.html)"/g, 'href="$1"');

// The pages about Ani (site/pages/*.html, written for the site), and the files of
// site/pages/ they use (each src, href, poster or srcset there, and each url() in a style
// sheet among them, that names a file inside site/pages/), copied to the site at the same
// places; returns the files copied, relative to the site.
export function copySitePages(out, root = ".") {
  const dir = join(root, "site", "pages");
  if (!existsSync(dir)) return [];
  const copied = new Set();
  const inside = (p) => { const r = relative(dir, p); return r && !r.startsWith("..") && !r.includes(`..${sep}`) && !/^[a-z]:/i.test(r); };
  const refs = (text, isCss) => {
    const out = [];
    const attr = /\b(?:src|href|poster)\s*=\s*["']([^"'#?]+)/gi, srcset = /\bsrcset\s*=\s*["']([^"']+)["']/gi, url = /url\(\s*["']?([^"')#?]+)/gi;
    if (!isCss) {
      for (const m of text.matchAll(attr)) out.push(m[1]);
      for (const m of text.matchAll(srcset)) for (const part of m[1].split(",")) out.push(part.trim().split(/\s+/)[0]);
    }
    for (const m of text.matchAll(url)) out.push(m[1]);
    return out.filter((u) => u && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/)/i.test(u));
  };
  const copy = (file) => {
    const rel = relative(dir, file).split(sep).join("/");
    if (copied.has(rel)) return;
    copied.add(rel);
    const to = join(out, rel);
    mkdirSync(dirname(to), { recursive: true });
    const isHtml = /\.html?$/i.test(file), isCss = /\.css$/i.test(file);
    if (isHtml || isCss) {
      const text = readFileSync(file, "utf8");
      writeFileSync(to, isHtml ? toIndex(text) : text);
      for (const u of refs(text, isCss)) {
        let target;
        try { target = normalize(join(dirname(file), decodeURIComponent(u))); } catch { continue; }
        if (inside(target) && existsSync(target) && statSync(target).isFile() && !/\.html?$/i.test(target)) copy(target);
      }
    } else writeFileSync(to, readFileSync(file));
  };
  for (const name of readdirSync(dir).filter((f) => /\.html$/i.test(f)).sort()) copy(join(dir, name));
  return [...copied];
}

export function buildSite(out, root = ".") {
  mkdirSync(out, { recursive: true });
  buildFilmApp(root);
  // the code page too, so it has every file the film page's code links name (the
  // revival's extensions among them)
  buildSourceApp(root);
  writeFileSync(`${out}/index.html`, withSentry(toSitePages(readFileSync(`${root}/app/film.html`, "utf8")), root));
  for (const page of ["source.html", "pass1.html"]) writeFileSync(`${out}/${page}`, toIndex(readFileSync(`${root}/app/${page}`, "utf8")));
  const pages = copySitePages(out, root);
  buildFilmApp(root, { claudeArtifact: `${out}/ani-cinderella-claude-artifact.html`, site: SITE_URL });
  writeFileSync(`${out}/.nojekyll`, "");
  if (!existsSync(`${out}/README.md`)) writeFileSync(`${out}/README.md`, readFileSync(`${root}/site/README.md`, "utf8"));
  return ["index.html", "source.html", "pass1.html", ...pages, "ani-cinderella-claude-artifact.html"].map((f) => `${out}/${f}`);
}

if (process.argv[1]?.endsWith("build-site.mjs")) {
  const out = process.argv[2];
  if (!out) { console.error("usage: node tools/build-site.mjs <site folder>"); process.exit(1); }
  for (const f of buildSite(out)) console.log(`wrote ${f} (${Math.round(readFileSync(f).length / 1024)} KB)`);
}
