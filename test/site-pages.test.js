// tools/build-site.mjs: the pages about Ani (site/pages/*.html), with the files of
// site/pages/ they use, copied to the site's top; links to the film page ("Back to the
// film", which ends in #view) going to the site's folder; and the film page's links to the
// pages about Ani, at ../site/pages/ in app/film.html (tools/build-film-app.mjs MORE_PAGES)
// and beside it on the site. And app/back-to-film.js, which the code and choice-point pages
// carry, reads as a classic script.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { copySitePages, toIndex } from "../tools/build-site.mjs";
import { MORE_PAGES } from "../tools/build-film-app.mjs";

test("links to the film page go to the site's folder, #view and all", () => {
  assert.equal(toIndex('<a href="film.html">x</a> <a href="film.html#view" class="back-to-film">y</a> <a href="film.html?open#kept-apart.4">z</a>'),
    '<a href="./">x</a> <a href="./#view" class="back-to-film">y</a> <a href="./?open#kept-apart.4">z</a>');
  assert.equal(toIndex('<a href="films.html">x</a>'), '<a href="films.html">x</a>');
});

test("the pages about Ani are copied to the site's top, with the files of site/pages/ they use, and nothing else", () => {
  const root = mkdtempSync(join(tmpdir(), "ani-site-pages-"));
  try {
    const pages = join(root, "site", "pages"), out = join(root, "out");
    mkdirSync(join(pages, "img"), { recursive: true });
    writeFileSync(join(pages, "making-of.html"), '<a href="film.html#view">back</a><img src="img/a.png"><link rel="stylesheet" href="pages.css"><img srcset="img/b.png 1x, img/c.png 2x"><a href="students.html">s</a><a href="https://example.org/x.png">x</a><a href="../secret.txt">no</a>');
    writeFileSync(join(pages, "students.html"), "<p>students</p>");
    writeFileSync(join(pages, "pages.css"), 'body { background: url("img/d.png"); }');
    for (const f of ["a", "b", "c", "d", "unused"]) writeFileSync(join(pages, "img", `${f}.png`), f);
    writeFileSync(join(root, "site", "secret.txt"), "not for the site");
    const copied = copySitePages(out, root).sort();
    assert.deepEqual(copied, ["img/a.png", "img/b.png", "img/c.png", "img/d.png", "making-of.html", "pages.css", "students.html"]);
    assert.match(readFileSync(join(out, "making-of.html"), "utf8"), /<a href="\.\/#view">back<\/a>/);
    assert.equal(existsSync(join(out, "img", "unused.png")), false);
    assert.equal(existsSync(join(root, "secret.txt")), false);
    assert.deepEqual(copySitePages(join(root, "none"), join(root, "nowhere")), []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("the film page's links to the pages about Ani", () => {
  const footer = '<a href="making-of.html">How this was made</a> · <a href="students.html">A guide for students</a> · <a href="teachers.html">A guide for teachers</a> · <a href="source.html">code</a>';
  assert.equal(footer.replace(MORE_PAGES, (m, name) => `href="../site/pages/${name}"`),
    '<a href="../site/pages/making-of.html">How this was made</a> · <a href="../site/pages/students.html">A guide for students</a> · <a href="../site/pages/teachers.html">A guide for teachers</a> · <a href="source.html">code</a>');
  const template = readFileSync(new URL("../app/film.template.html", import.meta.url), "utf8");
  for (const page of ["making-of.html", "students.html", "teachers.html"]) assert.ok(template.includes(`href="${page}"`), page);
});

test("Back to the film's script reads as a classic script, and the code pages carry it", () => {
  const js = readFileSync(new URL("../app/back-to-film.js", import.meta.url), "utf8");
  assert.doesNotThrow(() => new Function(js));
  for (const page of ["source", "pass1"]) {
    const t = readFileSync(new URL(`../app/${page}.template.html`, import.meta.url), "utf8");
    assert.ok(t.includes("<script>/*BACK-TO-FILM*/</script>"), page);
    assert.ok(t.includes('<a href="film.html#view" class="back-to-film">Back to the film</a>'), page);
  }
});
