// REVIVE;TIMELY (reports/ext/timely/README.md): Director keeps to the times Ani planned,
// opt-in, at Ken's request of 22 October 2026; and src/pipeline.js lengthReport, how long a
// film is (what was asked for, what Ani planned and what Director took), which the film
// page shows with every film. With TIMELY off nothing changes: it is never loaded
// (tools/check-1978.mjs and the goldens).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { EXTENSIONS, extensionsFor, makeFilm, lengthReport, SCENES } from "../src/pipeline.js";

const SIX = ["mend", "know", "appear", "change", "seen", "fit"];
const KEN_CINDY = (() => { const fs = makeProjectFileSystem(); return fs.textOf(fs.find({ dir: "KEN", fn1: "CINDY", fn2: "46" })); })();
// Ken's Cinderella of 22 October: every scene short, the film 1 to 1 minutes
const ONE_MINUTE = KEN_CINDY.replace(/\(set your length to (long|medium)\)/g, "(set your length to short)").replace("(interval (minutes 2) (minutes 5))", "(interval (minutes 1) (minutes 1))");

test("TIMELY is opt-in, a repair, requires FIT and CHANGE, and is in none of the switch's six", () => {
  const e = EXTENSIONS.find((x) => x.id === "timely");
  assert.ok(e && e.optIn && !e.onDemand);
  assert.equal(e.group, "repairs");
  assert.deepEqual(e.files, ["wrap", "timely"]);
  assert.deepEqual(extensionsFor(["timely"]).map((x) => x.id), ["mend", "change", "fit", "timely"]);
  assert.ok(!SIX.includes("timely"));
  assert.ok(!extensionsFor(SIX).some((x) => x.id === "timely"));
});

test("lengthReport: Ken's 1978 film, asked for 2 to 5 minutes, each scene's plan against its film", () => {
  const scenes = SCENES.map((id) => ({ id, glass: JSON.parse(readFileSync(`reports/pass2/${id}.glass.json`, "utf8")), film: JSON.parse(readFileSync(`reports/film/${id}.film.json`, "utf8")) }));
  const r = lengthReport(scenes, { cindy: KEN_CINDY });
  assert.deepEqual(r.asked, { least: 120, most: 300 });
  assert.deepEqual(r.scenes.map((s) => s.filmed), scenes.map((s) => Math.round((s.film.frames.length / 4) * 100) / 100));
  for (const s of r.scenes) assert.equal(s.planned, Math.round(Number(scenes.find((x) => x.id === s.id).glass.scene.variables["running-time"]) * 100) / 100);
  assert.equal(r.planned, Math.round(r.scenes.reduce((a, s) => a + s.planned, 0) * 100) / 100);
  assert.ok(r.scenes.every((s) => Array.isArray(s.parts) && s.timely.length === 0));
});

test("Ken's one-minute Cinderella: Kept Apart, whose change of feeling would run long past its part, keeps to its plan with TIMELY", () => {
  const extensions = [...SIX, "timely"];
  const made = makeFilm(makeProjectFileSystem(), { description: ONE_MINUTE, extensions, fps: 4, frames: 1000, scenes: ["introduction", "kept-apart"] });
  const r = lengthReport(made.scenes.slice(0, 2), { cindy: ONE_MINUTE, extensions });
  assert.deepEqual(r.asked, { least: 60, most: 60 });
  const kept = r.scenes[1];
  // within a little of its plan (without TIMELY it runs about nine seconds past it)
  assert.ok(Math.abs(kept.filmed - kept.planned) < 1.5, `Kept Apart with TIMELY: ${kept.filmed} s against ${kept.planned}`);
  // the stepmother's change of path-curvature at high speed, which Director would take
  // 13.86 s over (four times Ani's estimate), made over the seconds left in its part
  const change = kept.timely.find((n) => n.what === "change-kept-to-time" && /^\(step-mother path-curvature by 4\.0 at high speed in 13\.86/.test(n.was));
  assert.ok(change, JSON.stringify(kept.timely.map((n) => n.was)));
  assert.ok(Number(/in ([\d.]+) seconds/.exec(change.now)[1]) < 6);
});
