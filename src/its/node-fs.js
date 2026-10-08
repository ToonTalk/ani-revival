// Mount the recovered files and our reconstructions into an ItsFileSystem (Node).
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { ItsFileSystem } from "./fs.js";
import { installStubs, installLostFilePlaceholders } from "./stubs.js";

// "cindy.46" -> ["CINDY", "46"]
function itsNameOf(file) {
  const dot = file.indexOf(".");
  return dot < 0 ? [file, ""] : [file.slice(0, dot), file.slice(dot + 1)];
}

export function mountFolder(fs, dir, folder, origin) {
  for (const f of readdirSync(folder)) {
    const p = join(folder, f);
    if (!statSync(p).isFile() || f === "MANIFEST.json" || f.startsWith("_file_")) continue;
    const [fn1, fn2] = itsNameOf(f);
    fs.addFile(dir, fn1, fn2, { getBytes: () => readFileSync(p), origin, path: p });
  }
}

// The standard setup: KEN; is tape 7005017 (January 1979), KEN1;DRECT is its
// Emacs save file }^RSV 6, and KEN1; also holds our reconstructions.
export function makeProjectFileSystem(root = process.cwd()) {
  const fs = new ItsFileSystem();
  mountFolder(fs, "KEN", join(root, "original", "7005017"), "tape 7005017");
  fs.addFile("KEN1", "DRECT", "1", {
    getBytes: () => readFileSync(join(root, "original", "7005017", "}^rsv.6")),
    origin: "tape 7005017, }^RSV 6",
  });
  const recon = join(root, "src", "director", "ken1");
  if (existsSync(recon)) {
    for (const f of readdirSync(recon)) {
      if (!f.endsWith(".lisp")) continue;
      const p = join(recon, f);
      fs.addFile("KEN1", f.replace(/\.lisp$/, ""), "1", { getText: () => readFileSync(p, "utf8"), origin: "reconstruction", path: p });
    }
  }
  // REVIVE; holds files of ours that never existed on ITS (src/director/revive).
  const revive = join(root, "src", "director", "revive");
  if (existsSync(revive)) {
    for (const f of readdirSync(revive)) {
      if (!f.endsWith(".lisp")) continue;
      const p = join(revive, f);
      fs.addFile("REVIVE", f.replace(/\.lisp$/, ""), "1", { getText: () => readFileSync(p, "utf8"), origin: "ours", path: p });
    }
  }
  // The compiled tags files, recovered as source (tools/gen-tags.mjs).
  const tags = join(root, "src", "director", "tags");
  if (existsSync(tags)) {
    for (const f of readdirSync(tags)) {
      if (!f.endsWith(".lisp")) continue;
      const p = join(tags, f);
      fs.addFaslSource("KEN", f.replace(/\.lisp$/, ""), { getText: () => readFileSync(p, "utf8"), origin: "recovered from FASL", path: p });
    }
  }
  installStubs(fs);
  installLostFilePlaceholders(fs);
  return fs;
}

// Mount the files our runs wrote (reports/pass2/: ken-introd.uction is
// KEN;INTROD UCTION, ken1-intro.posit is KEN1;INTRO POSIT, ...), so that each
// step of the film's making can read what the earlier ones wrote, as on ITS.
// except: names ("KEN1;KEPT MINI") the coming run writes itself, left out so that
// it starts without them, as it did on ITS (RUN moved each summary to AR9 when it
// had saved it, and a save appends to a summary that is there).
export function mountRunOutputs(fs, folder = join(process.cwd(), "reports", "pass2"), except = []) {
  if (!existsSync(folder)) return;
  for (const f of readdirSync(folder)) {
    const m = /^(ken1?)-([a-z0-9]+)\.([a-z0-9]+)$/.exec(f);
    if (!m) continue;
    if (except.includes(`${m[1]};${m[2]} ${m[3]}`.toUpperCase())) continue;
    const p = join(folder, f);
    fs.addFile(m[1].toUpperCase(), m[2].toUpperCase(), m[3].toUpperCase(), { getText: () => readFileSync(p, "utf8"), origin: "written by our run", path: p });
  }
}
