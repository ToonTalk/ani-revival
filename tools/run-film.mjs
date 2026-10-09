// Make the whole 1978 film in one go (src/pipeline.js: pass 1, then each scene's pass 2
// and filming) and save each scene's film and plan for the film page.
//   node tools/run-film.mjs --fps 24     -> reports/film/24fps/<scene>.film.json and .glass.json
// At 24 frames a second, as the film was shot (ANINIT's running-color), Director moves the
// characters in smaller steps; where a scene leaves them decides how the next is planned,
// so this is a different run from the 4-frames-a-second one of reports/film/ (the TV
// previews and the thesis's flipbook). About twelve minutes.
import { writeFileSync, mkdirSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { makeFilm } from "../src/pipeline.js";

const at = process.argv.indexOf("--fps");
const fps = at > 0 ? Number(process.argv[at + 1]) : 24;
const out = `reports/film/${fps}fps`;
mkdirSync(out, { recursive: true });
const t0 = Date.now();
const result = makeFilm(makeProjectFileSystem(), {
  fps, frames: 6000,
  progress: (step, what) => console.log(`${((Date.now() - t0) / 1000).toFixed(0).padStart(4)} s  ${what}`),
  onScene: (s) => {
    writeFileSync(`${out}/${s.id}.film.json`, JSON.stringify(s.film));
    writeFileSync(`${out}/${s.id}.glass.json`, JSON.stringify(s.glass));
    console.log(`        ${s.id}: ${s.film.frames.length} frames (${(s.film.frames.length / fps).toFixed(1)} s)`);
  },
});
console.log(`${result.choices} choices; wrote ${out}/ in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
