// Collect the files Ani's whole pipeline reads, for running Ani in a browser (the film
// page's "Make the film"): app/data/ani-bundle-files.json lists them, and
// assembleBundle() gathers their texts from the project's files.
//
// It runs the pipeline (src/pipeline.js: pass 1, then each scene's pass 2 and
// filming) on the project's files, noting every file read; lists those, together
// with all of Ani's, Director's and the drivers' files (a changed film description
// may need parts the standard run doesn't), the revival's files (all of
// src/director/revive, extensions included) and the recovered FASL sources; writes the
// bundle itself to app/data/ani-bundle.json (for test/rerun.html); then runs the
// pipeline again on the bundle alone and checks that it makes the same film, frame
// for frame.
// Usage: node tools/build-ani-bundle.mjs [--no-check] [--extensions a,b]
//   --extensions  make both films with the revival's extensions (src/pipeline.js
//   EXTENSIONS), to check that the bundle has every file they need.
import { writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { makeBundleFileSystem } from "../src/its/bundle-fs.js";
import { makeFilm, extensionsFor } from "../src/pipeline.js";
import { ANI_FILES, DRIVER_FILES, DIRECTOR_FILES } from "../src/sources.js";

// The bundle for a manifest: { files: [[dir, fn1, fn2]], fasl: [[dir, fn1]] }.
export function assembleBundle(fs, manifest) {
  return {
    about: "The files Ani's pipeline reads, from tape 7005017 and the revival (tools/build-ani-bundle.mjs).",
    files: manifest.files.map(([dir, fn1, fn2]) => {
      const e = fs.find({ dir, fn1, fn2 });
      if (!e) throw new Error(`the bundle's ${dir};${fn1} ${fn2} is missing`);
      return { dir, fn1, fn2, text: fs.textOf(e) };
    }),
    fasl: manifest.fasl.map(([dir, fn1]) => {
      const e = fs.faslSources && fs.faslSources.get(`${dir};${fn1}`);
      if (!e) throw new Error(`the bundle's ${dir};${fn1} FASL source is missing`);
      return { dir, fn1, text: fs.textOf(e) };
    }),
  };
}

if (process.argv[1]?.endsWith("build-ani-bundle.mjs")) {
  const fs = makeProjectFileSystem();
  const read = new Map(); // "DIR;FN1 FN2" -> entry
  const fasl = new Map();
  const find = fs.find.bind(fs);
  fs.find = (name) => {
    const e = find(name);
    if (e && (e.text !== undefined || e.getText || e.getBytes || e.bytes)) read.set(`${e.dir};${e.fn1} ${e.fn2}`, e);
    return e;
  };
  const resolve = fs.resolveForLoad.bind(fs);
  fs.resolveForLoad = (spec, L) => {
    const r = resolve(spec, L);
    if (r && r.entry && r.truename && r.truename.fn2 === "FASL" && fs.faslSources) {
      const key = `${r.entry.dir};${r.entry.fn1}`;
      if (fs.faslSources.get(key) === r.entry) fasl.set(key, r.entry);
    }
    return r;
  };

  const t0 = Date.now();
  const progress = (step, what) => console.log(`${((Date.now() - t0) / 1000).toFixed(0).padStart(4)} s  ${what}`);
  const extAt = process.argv.indexOf("--extensions");
  const extensions = extensionsFor(extAt > 0 ? (process.argv[extAt + 1] || "").split(",").filter(Boolean) : []).map((e) => e.id);
  if (extensions.length) console.log(`with the extensions ${extensions.join(", ")}`);
  const first = makeFilm(fs, { progress, extensions });
  console.log(`made the film from the project's files: ${first.choices} choices, ${first.scenes.map((s) => `${s.id} ${s.film.frames.length}`).join(", ")}`);

  // The files to bundle: those read, and every file of Ani, her drivers and Director.
  const keep = new Map(read);
  for (const p of [...ANI_FILES, ...DRIVER_FILES, ...DIRECTOR_FILES]) {
    const base = p.split("/").pop();
    const dot = base.indexOf(".");
    const fn1 = base.slice(0, dot).toUpperCase(), fn2 = base.slice(dot + 1).toUpperCase();
    const e = fs.dirs.get("KEN")?.get(fn1)?.get(fn2);
    if (e) keep.set(`KEN;${fn1} ${fn2}`, e);
  }
  for (const [dir, files] of fs.dirs) {
    if (dir !== "KEN1" && dir !== "REVIVE") continue;
    for (const [, versions] of files) for (const [, e] of versions) if (!String(e.origin || "").startsWith("written")) keep.set(`${e.dir};${e.fn1} ${e.fn2}`, e);
  }
  const written = (e) => String(e.origin || "").startsWith("written"); // files the run itself wrote
  const manifest = {
    about: "The files the film page's Ani reads (tools/build-ani-bundle.mjs); tools/build-film-app.mjs bundles their texts.",
    files: [...keep.values()].filter((e) => !written(e)).map((e) => [e.dir, e.fn1, e.fn2]),
    fasl: [...(fs.faslSources ? fs.faslSources.values() : [])].map((e) => [e.dir, e.fn1]),
  };
  mkdirSync("app/data", { recursive: true });
  const lines = (list) => list.map((x) => "  " + JSON.stringify(x)).join(",\n");
  writeFileSync("app/data/ani-bundle-files.json", `{\n "about": ${JSON.stringify(manifest.about)},\n "files": [\n${lines(manifest.files)}\n ],\n "fasl": [\n${lines(manifest.fasl)}\n ]\n}\n`);
  const bundle = assembleBundle(makeProjectFileSystem(), manifest);
  const json = JSON.stringify(bundle);
  writeFileSync("app/data/ani-bundle.json", json);
  console.log(`wrote app/data/ani-bundle-files.json and app/data/ani-bundle.json: ${bundle.files.length} files and ${bundle.fasl.length} FASL sources, ${Math.round(json.length / 1024)} KB`);

  if (!process.argv.includes("--no-check")) {
    const digest = (scenes) => scenes.map((s) => createHash("sha256").update(JSON.stringify(s.film.frames)).digest("hex").slice(0, 12));
    const second = makeFilm(makeBundleFileSystem(bundle), { progress, extensions });
    const a = digest(first.scenes), b = digest(second.scenes);
    const same = a.every((x, k) => x === b[k]);
    console.log(same ? "the bundle alone makes the same film, frame for frame" : `the bundle's film differs: ${a.join(" ")} vs ${b.join(" ")}`);
    process.exit(same ? 0 : 1);
  }
}
