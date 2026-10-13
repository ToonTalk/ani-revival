// Check films recorded with whole segments against the same films recorded before, when
// the recorder (src/pipeline.js recorder) kept only what the turtle drew inside the picture:
// ANINIT films with the turtle cutting lines at the picture's edge, and since 13 Oct 2026
// a character partly off the picture keeps its segments whole, those beyond the edge too,
// so that the film page can draw color's nested copies whole and cut them at the edge.
// For each film file (a golden, reports/**/<scene>.film.json) it asserts that the film in
// the working tree differs from the one in git (--before, HEAD by default) only so:
//   - everything but the frames' segments is the same: the picture, the events, the
//     looks, each frame's characters' states, and which characters have segments in
//     each frame, in the same order;
//   - a character's segments that differ include some that leave the picture (or reach
//     its edge, within the recorder's rounding), and,
//     cut at the picture's edge as the turtle cuts them (TVRTLE's Cohen and Sutherland,
//     src/tv/turtle.js clipVectorVisibility, at the edges the turtle has after ANINIT's
//     setup, in picture dots), they are the old ones, in the same order: those inside
//     the picture exactly, and each cut one as the old one, which lies along it, from
//     the same end inside the picture to the edge, within the recorder's rounding (see
//     cutAs); those wholly beyond the edge are new;
//   - a character's segments that don't leave the picture are exactly as they were.
// Usage: node tools/check-whole-segments.mjs [--before <rev>] [film.json ...]
//        node tools/check-whole-segments.mjs --files old.json new.json
//   with no files, every reports/**/*.film.json git has at <rev>; --files compares two
//   files instead (a film, or a run with scenes[].film)
// Prints a line for each film (how many characters' frames changed, and how many
// segments wholly beyond the edge they gained) and exits non-zero if any check fails.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot } from "../src/pipeline.js";
import { pictureArea } from "../src/tv/canvas.js";
import { UNIT_BIT } from "../src/tv/turtle.js";

const args = process.argv.slice(2);
const at = args.indexOf("--before");
const before = at >= 0 ? args[at + 1] : "HEAD";
const files = args.includes("--files");
let paths = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--before");
const git = (...a) => execFileSync("git", a, { encoding: "utf8", maxBuffer: 1 << 28 });
if (!paths.length && !files) paths = git("ls-tree", "-r", "--name-only", before, "reports").split("\n").filter((p) => p.endsWith(".film.json"));
// the films to compare: [name, old, new]
const filmsOf = (d) => (d.frames ? [["", d]] : (d.scenes || []).filter((s) => s.film).map((s) => [` ${s.id}`, s.film]));
const pairs = [];
if (files) {
  if (paths.length !== 2) throw new Error("--files takes two files, the old and the new");
  const [a, b] = paths.map((p) => filmsOf(JSON.parse(readFileSync(p, "utf8"))));
  if (a.length !== b.length) throw new Error(`${paths[0]} has ${a.length} films, ${paths[1]} ${b.length}`);
  a.forEach(([name, film], k) => pairs.push([`${paths[1]}${name}`, film, b[k][1]]));
} else for (const path of paths) pairs.push([path, JSON.parse(git("show", `${before}:${path}`)), JSON.parse(readFileSync(path, "utf8"))]);

// The turtle's edges in the recorder's picture dots: Director booted and ANINIT loaded,
// as src/pipeline.js film() films, at (tvsize 550 413).
const L = boot(makeProjectFileSystem());
L.evalString("(cs)");
L.evalString("(load '|ken;aninit >|)");
L.evalString("(tvsize 550 413)");
const tv = L.tv;
if (!tv.clipMode) throw new Error("ANINIT's turtle should be cutting lines at the edge (clip)");
const area = pictureArea(tv, 0);
const half = UNIT_BIT / 2;
const X = (x) => (tv.tvFixX(x) + half) / UNIT_BIT - area.x;
const Y = (y) => (tv.tvFixY(y) + half) / UNIT_BIT - area.y;
const E = { left: X(tv.turtlePictureLeft), right: X(tv.turtlePictureRight), top: Y(tv.turtlePictureTop), bottom: Y(tv.turtlePictureBottom) };
console.log(`the turtle's edges in picture dots: x ${E.left.toFixed(3)} to ${E.right.toFixed(3)}, y ${E.top.toFixed(3)} to ${E.bottom.toFixed(3)}; against ${files ? paths[0] : before}\n`);

// TVRTLE's codes (1 left, 2 right, 4 below, 8 above), the picture's y running down. The
// recorder rounds to a tenth of a dot, so a line's end within a twentieth of a dot of an
// edge may be on either side of it: the edges are moved out that far to find what leaves
// the picture and to cut it, and a segment must be as it was exactly only if it keeps
// that far inside them.
const grown = (d) => ({ left: E.left - d, right: E.right + d, top: E.top - d, bottom: E.bottom + d });
const OUT = grown(0.05), IN = grown(-0.05);
const code = (x, y, e = OUT) => (x < e.left ? 1 : x > e.right ? 2 : 0) + (y > e.bottom ? 4 : y < e.top ? 8 : 0);
const within = (s, e) => code(s[0], s[1], e) === 0 && code(s[2], s[3], e) === 0;
// a segment cut as clipVectorVisibility cuts it (the outside end moved to the edge, and
// put first), at the edges e, or null if none of it is on the picture
function cut([x0, y0, x1, y1], e = OUT) {
  let v0 = code(x0, y0, e), v1 = code(x1, y1, e);
  for (let guard = 0; guard < 100; guard++) {
    if (v0 === 0 && v1 === 0) return [x0, y0, x1, y1];
    if (v0 & v1) return null;
    if (v0 === 0) { [x0, x1, y0, y1, v0, v1] = [x1, x0, y1, y0, v1, v0]; }
    if (v0 & 1) { y0 += ((y1 - y0) / (x1 - x0)) * (e.left - x0); x0 = e.left; }
    if (v0 & 2) { y0 += ((y1 - y0) / (x1 - x0)) * (e.right - x0); x0 = e.right; }
    if (v0 & 4) { x0 += ((x1 - x0) / (y1 - y0)) * (e.bottom - y0); y0 = e.bottom; }
    if (v0 & 8) { x0 += ((x1 - x0) / (y1 - y0)) * (e.top - y0); y0 = e.top; }
    v0 = code(x0, y0, e);
  }
  return null;
}
// Whether w, an old segment, is the whole segment s cut as the turtle cut it: each of
// w's ends lies on s (within a fifth of a dot: both were rounded to a tenth), and is
// either an end of s itself, exactly (the turtle rounds an end inside the picture as the
// recorder now does), or on an edge (within the rounding); and w runs the way s, cut,
// runs (the turtle puts the end it moved first). Along a line that meets the edge at a
// shallow angle, where on the edge it is cut moves far with a small change in the line,
// so this asks where the old ends lie, not how far they are from the new cut's.
const dist = (px, py, [x0, y0, x1, y1]) => {
  const dx = x1 - x0, dy = y1 - y0, len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / len)) : 0;
  return Math.hypot(px - (x0 + t * dx), py - (y0 + t * dy));
};
const onEdge = (x, y) => [x - E.left, x - E.right, y - E.top, y - E.bottom].some((d) => Math.abs(d) <= 0.06);
function cutAs(s, w) {
  const c = cut(s);
  for (const [x, y] of [[w[0], w[1]], [w[2], w[3]]]) {
    if (dist(x, y, s) > 0.2) return false;
    const isEnd = (x === s[0] && y === s[1]) || (x === s[2] && y === s[3]);
    if (!isEnd && !onEdge(x, y)) return false;
  }
  // which way it runs is the turtle's, unless an end of s is within the rounding of an
  // edge, so that which end the turtle moved can't be told
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const grazes = [[s[0], s[1]], [s[2], s[3]]].some(([x, y]) => code(x, y, OUT) === 0 && code(x, y, IN) !== 0);
  return grazes || d([w[0], w[1]], [c[0], c[1]]) <= d([w[0], w[1]], [c[2], c[3]]) + 1e-9 || d([c[0], c[1]], [c[2], c[3]]) < 0.5;
}
const quads = (a) => Array.from({ length: a.length / 4 }, (_, k) => a.slice(4 * k, 4 * k + 4));

let failures = 0;
for (const [path, old, now] of pairs) {
  const problems = [];
  const fail = (p) => { if (problems.length < 8) problems.push(p); else if (problems.length === 8) problems.push("..."); };
  const rest = (f) => JSON.stringify({ ...f, frames: undefined });
  if (rest(old) !== rest(now)) fail("something besides the frames differs (picture, events, looks, ...)");
  if (old.frames.length !== now.frames.length) fail(`${now.frames.length} frames, not ${old.frames.length}`);
  let changed = 0, gained = 0;
  const who = new Set();
  old.frames.forEach((o, f) => {
    const n = now.frames[f];
    if (!n) return;
    if (JSON.stringify(o.chars) !== JSON.stringify(n.chars)) fail(`frame ${f}: the characters' states differ`);
    if (Object.keys(o.segs).join() !== Object.keys(n.segs).join()) { fail(`frame ${f}: drawn ${Object.keys(n.segs).join(", ")}, not ${Object.keys(o.segs).join(", ")}`); return; }
    for (const c of Object.keys(o.segs)) {
      const a = o.segs[c], b = n.segs[c];
      if (a.length % 4 || b.length % 4) { fail(`frame ${f} ${c}: segments of other than four numbers`); continue; }
      if (JSON.stringify(a) === JSON.stringify(b)) {
        if (!quads(b).every((s) => within(s, OUT))) fail(`frame ${f} ${c}: leaves the picture, yet as it was`);
        continue;
      }
      const whole = quads(b);
      // (an end within the rounding of the edge may have been beyond it for the turtle,
      // which then put it first)
      if (whole.every((s) => within(s, IN))) { fail(`frame ${f} ${c}: differs, yet keeps inside the picture`); continue; }
      // the new segments in order against the old: one well inside must be the next old
      // one exactly; one that leaves the picture, cut, must be it, near enough (see cutAs);
      // one that only grazes the edge (within the rounding) may have been cut to nothing
      const was = quads(a);
      let k = 0;
      for (const s of whole) {
        const w = was[k];
        if (within(s, IN)) {
          if (!w || w.join() !== s.join()) { fail(`frame ${f} ${c}: ${s.join(",")}, inside the picture, isn't the old ${k}th, ${w ? w.join(",") : "(none)"}`); k = Infinity; break; }
          k++;
        } else if (cut(s)) {
          if (w && cutAs(s, w)) k++;
          else if (cut(s, IN)) { fail(`frame ${f} ${c}: ${s.join(",")}, cut at the edge, isn't the old ${k}th, ${w ? w.join(",") : "(none)"}`); k = Infinity; break; }
        }
      }
      if (k !== Infinity && k !== was.length) fail(`frame ${f} ${c}: ${was.length - k} old segments not found among the new`);
      changed++;
      gained += whole.length - was.length;
      who.add(c);
    }
  });
  if (problems.length) failures++;
  console.log(`${problems.length ? "FAIL" : "ok  "}   ${path}: ${old.frames.length} frames; ${changed} character-frame${changed === 1 ? "" : "s"} at the edge now whole${changed ? ` (${[...who].join(", ")}; ${gained} more segment${gained === 1 ? "" : "s"}, wholly beyond the edge)` : ""}`);
  for (const p of problems) console.log(`         ${p}`);
}
console.log(failures ? `\n${failures} film${failures === 1 ? "" : "s"} differ otherwise` : `\nall ${pairs.length} films differ only where a character leaves the picture`);
process.exit(failures ? 1 : 0);
