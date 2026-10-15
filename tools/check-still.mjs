// Where no one moves, and where the revival's walks end: a check of films already made
// (the goldens, or a folder given), from each scene's film and glass box, with
// src/pipeline.js whyTheyAct.
//   - Each still stretch, more than a second inside a part in which no character on the
//     stage moves, with why no one moves (whyTheyAct's stills: "only-changes", the part's
//     changes running with nothing to move anyone; "repeat-unwinding", Director unwinding
//     a part's (repeat n ...) after its last run, a tick a run; "plans-running", a plan
//     running that moves no one; "nothing-running").
//   - FAIL if a scene made with REVIVE;SEEN (its glass box has wanders) still has a part
//     of only changes in which no one moves for more than a second: SEEN is there so that
//     a feeling's part never leaves everyone standing still (reports/ext/seen/README.md).
//   - FAIL if a walk the revival planned ends with one of its characters off the picture:
//     the film's segments are the picture's own dots (recorder, src/pipeline.js), and a
//     character none of whose lines reach the picture has none; one partly off has its
//     center (the middle of its segments) off the 551 by 413 picture. A walk of Ken's
//     own (DISPLY's, "exit-by" among them, which is meant to leave) is not checked.
// Usage: node tools/check-still.mjs [folder ...] [--quiet]
//   folder  a folder of <scene>.film.json files, with <scene>.glass.json beside them (or,
//           for reports/film, in reports/pass2); the goldens by default: reports/film and
//           its 24fps/, and each of reports/ext/*/ and reports/ext/change/*/ with its 24fps/
//   --quiet only the failures and the totals
// Exits non-zero if any check fails.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { whyTheyAct } from "../src/pipeline.js";

const args = process.argv.slice(2);
const quiet = args.includes("--quiet");
const given = args.filter((a) => !a.startsWith("--"));
const isDir = (p) => existsSync(p) && statSync(p).isDirectory();
const withRates = (d) => [d, join(d, "24fps")].filter(isDir);
const folders = given.length ? given : [
  ...withRates("reports/film"),
  ...readdirSync("reports/ext").map((d) => join("reports/ext", d)).filter((d) => isDir(d) && d !== join("reports/ext", "change")).flatMap(withRates),
  ...readdirSync("reports/ext/change").map((d) => join("reports/ext/change", d)).filter(isDir).flatMap(withRates),
].filter((d) => readdirSync(d).some((f) => f.endsWith(".film.json")));

let failures = 0, stills = 0, walks = 0;
const byKind = {};
for (const dir of folders) {
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".film.json")).sort()) {
    const id = f.slice(0, -".film.json".length);
    const glassPath = [join(dir, `${id}.glass.json`), join("reports/pass2", `${id}.glass.json`)].find(existsSync);
    if (!glassPath) continue;
    const film = JSON.parse(readFileSync(join(dir, f), "utf8"));
    const glass = JSON.parse(readFileSync(glassPath, "utf8"));
    const fps = film.fps || (/[\\/]24fps$/.test(dir) ? 24 : 4);
    const why = whyTheyAct(glass, film, { fps });
    const where = `${dir.replace(/\\/g, "/")}/${id}`;
    for (const s of why.stills) {
      stills++;
      byKind[s.kind] = (byKind[s.kind] || 0) + 1;
      const said = `${where}: ${s.part} frames ${s.from} to ${s.to} (${s.seconds} s), ${s.kind}${s.repeat ? ` of ${s.repeat} runs` : ""}${s.changes ? `: ${[...new Set(s.changes.map((c) => c.character))].join(" and ")}'s changes, Ani's ${Math.max(...s.changes.map((c) => c.aniSeconds || 0)).toFixed(2)} s, Director's ${Math.max(...s.changes.map((c) => c.directorSeconds || 0)).toFixed(2)} s` : ""}${s.running ? `: ${s.running.join(", ")}` : ""}`;
      if (s.kind === "only-changes" && glass.wanders) {
        failures++;
        console.log(`FAIL   ${said}: made with SEEN, and no one wanders`);
      } else if (!quiet) console.log(`still  ${said}`);
    }
    // the revival's walks end on the picture
    const W = film.picture.width, H = film.picture.height;
    for (const a of why.activities) {
      if (!a.by || a.by === "DISPLY" || !a.film) continue;
      for (const span of a.film.spans) {
        const frame = film.frames[Math.min(span.end, film.frames.length - 1)];
        for (const c of a.characters) {
          const ch = frame.chars[c];
          if (!ch || !ch.visible) continue;
          walks++;
          // none of her lines reach the picture: the recorder keeps no segments for her
          // then; a character partly on, at an edge, is on the picture
          if (!frame.segs[c]) {
            failures++;
            console.log(`FAIL   ${where}: ${a.plan} (${a.by}) ends at frame ${span.end} with ${c} off the picture`);
          }
        }
      }
    }
  }
}
console.log(`\n${folders.length} folders: ${stills} still stretches (${Object.entries(byKind).map(([k, n]) => `${n} ${k}`).join(", ") || "none"}); ${walks} ends of the revival's walks, ${failures ? "" : "all "}on the picture${failures ? `; ${failures} check${failures > 1 ? "s" : ""} FAILED` : ""}`);
process.exit(failures ? 1 : 0);
