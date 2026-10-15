// What an extension's parts change in Ken's Cinderella, one part at a time: the chained
// film (pass 1, then each scene's pass 2 and filming, as the film page makes it) made
// with a setup that turns the other parts off, beside a reference film. Used by
// tools/check-slips.mjs (SLIPS' corrections, beside KNOW's Cinderella) and
// tools/check-detail.mjs (DETAIL's details, beside 1978's).
import { readFileSync, existsSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { SCENES, FILE_NAMES, pass1, pass2, film } from "../src/pipeline.js";

const read = (path) => readFileSync(path, "utf8");
const textIn = (fs, d, fn1, fn2) => {
  const e = fs.find({ dir: d, fn1, fn2 });
  return e ? fs.textOf(e) : "";
};
export const kindOf = (note) => (/^\(revival-repair: what (\S+)/.exec(note) || [])[1];
// The notes by kind: { kind: how many }.
export function kinds(notes) {
  const out = {};
  for (const n of notes) out[kindOf(n.note)] = (out[kindOf(n.note)] || 0) + 1;
  return out;
}

// The chained film with these extensions and this setup (src/pipeline.js's setup, called
// with each Lisp once it has booted), beside the reference:
//   reference.film(scene), .glass(scene), .program(scene): the files to set each scene
//   beside (a path, or null if there is none); golden(scene), if given, the film the
//   whole set should make, to say whether it does.
// Returns { pass1: { cp, choicePointsDiffering, notes }, scenes: [{ scene, frames,
// referenceFrames, firstFrameDiffering, events, program, tasks, subscenes, notes,
// filmMatchesGolden? }] }: cp "CP 29" or "differs"; choicePointsDiffering, the names of
// the choice points that differ from app/data/pass1.json's; events "same" or how many;
// program "same", "differs" or null (no reference); tasks, those whose description or
// current choice differs from the reference glass box's, { task, description, now,
// was }; subscenes, those whose running time, stretch or movements differ, { subscene,
// runningTime, stretchedBy, was }; notes by kind (pass 2's and the filming's); turning
// and referenceTurning, how each character turned as it walked (turning, below).
export function chained({ extensions, setup = null, fps = 4, reference, golden = null }) {
  const frames = fps === 24 ? 6000 : 1000;
  const fs = makeProjectFileSystem();
  const p1 = pass1(fs, { extensions, setup });
  const cp = textIn(fs, "KEN", "CP", "30");
  const goldenCPs = JSON.parse(read("app/data/pass1.json")).choicePoints;
  const result = {
    pass1: {
      cp: cp === read("reports/pass1-choices.txt") ? "CP 29" : "differs",
      choicePointsDiffering: p1.choicePoints.filter((c, k) => JSON.stringify(c) !== JSON.stringify(goldenCPs[k])).map((c) => c.name),
      notes: kinds(p1.repairs || []),
    },
    scenes: [],
  };
  for (const scene of SCENES) {
    const [fn1, fn2] = FILE_NAMES[scene].split(" ");
    const { glass } = pass2(fs, scene, { extensions, setup });
    const f = film(fs, scene, { extensions, fps, frames, setup }).film;
    const theirFilm = JSON.parse(read(reference.film(scene)));
    const glassPath = reference.glass(scene);
    const theirGlass = glassPath && existsSync(glassPath) ? JSON.parse(read(glassPath)) : null;
    const programPath = reference.program(scene);
    let first = null;
    for (let i = 0; i < Math.max(f.frames.length, theirFilm.frames.length); i++) if (JSON.stringify(f.frames[i]) !== JSON.stringify(theirFilm.frames[i])) { first = i; break; }
    const byName = (xs) => new Map(xs.map((x) => [x.name, x]));
    const theirTasks = byName(theirGlass ? theirGlass.tasks : []);
    const tasks = theirGlass ? glass.tasks.filter((t) => !theirTasks.has(t.name) || theirTasks.get(t.name).variables["current-choice"] !== t.variables["current-choice"] || theirTasks.get(t.name).variables.task !== t.variables.task)
      .map((t) => ({ task: t.name, description: t.variables.task, now: t.variables["current-choice"] || null, was: theirTasks.has(t.name) ? theirTasks.get(t.name).variables["current-choice"] || null : null })) : null;
    const theirSubscenes = byName(theirGlass ? theirGlass.subscenes : []);
    const subscenes = theirGlass ? glass.subscenes.filter((s) => !theirSubscenes.has(s.name) || ["running-time", "stretched-by", "movements"].some((v) => theirSubscenes.get(s.name).variables[v] !== s.variables[v]))
      .map((s) => ({ subscene: s.name, runningTime: s.variables["running-time"], stretchedBy: s.variables["stretched-by"], was: theirSubscenes.has(s.name) ? { runningTime: theirSubscenes.get(s.name).variables["running-time"], stretchedBy: theirSubscenes.get(s.name).variables["stretched-by"] } : null })) : null;
    const goldenPath = golden ? golden(scene) : null;
    result.scenes.push({
      scene, frames: f.frames.length, referenceFrames: theirFilm.frames.length, firstFrameDiffering: first,
      events: JSON.stringify(f.events) === JSON.stringify(theirFilm.events) ? "same" : f.events.length,
      program: programPath && existsSync(programPath) ? (textIn(fs, "KEN", fn1, fn2) === read(programPath) ? "same" : "differs") : null,
      tasks, subscenes, notes: kinds([...(glass.repairs || []), ...(f.repairs || [])]),
      turning: turning(f), referenceTurning: turning(theirFilm),
      ...(goldenPath ? { filmMatchesGolden: existsSync(goldenPath) ? JSON.stringify(f) === read(goldenPath) : null } : {}),
    });
  }
  return result;
}

// How each character turned as it walked in a film: for each, the frames it moved in
// (its place changed from the frame before) and the mean of how far its heading turned
// from one frame to the next in those, in degrees: { character: { moved, turn } }.
export function turning(film) {
  const out = {};
  for (let i = 1; i < film.frames.length; i++) {
    for (const [c, now] of Object.entries(film.frames[i].chars || {})) {
      const before = (film.frames[i - 1].chars || {})[c];
      if (!now.state || !before || !before.state) continue;
      const [x0, y0, h0] = before.state, [x1, y1, h1] = now.state;
      if (x0 === x1 && y0 === y1) continue;
      const turn = Math.abs(((h1 - h0 + 540) % 360) - 180);
      const t = (out[c] ||= { moved: 0, total: 0 });
      t.moved++;
      t.total += turn;
    }
  }
  return Object.fromEntries(Object.entries(out).map(([c, t]) => [c, { moved: t.moved, turn: Math.round((t.total / t.moved) * 100) / 100 }]));
}

// One line for each scene of a result.
export function describe(r) {
  const lines = [`pass 1: ${r.pass1.cp}, ${r.pass1.choicePointsDiffering.length} choice points differ, notes ${JSON.stringify(r.pass1.notes)}`];
  for (const s of r.scenes) lines.push(`${s.scene}: ${s.frames} frames (reference ${s.referenceFrames}), ${s.firstFrameDiffering === null ? "the same frames" : `differ from frame ${s.firstFrameDiffering}`}, events ${s.events}, program ${s.program}, ${s.tasks ? s.tasks.length : "?"} tasks and ${s.subscenes ? s.subscenes.length : "?"} subscenes differ, notes ${JSON.stringify(s.notes)}`);
  return lines;
}
