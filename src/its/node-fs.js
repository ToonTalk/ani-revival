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
      fs.addFile("KEN1", f.replace(/\.lisp$/, ""), "1", { getBytes: () => readFileSync(p), origin: "reconstruction", path: p });
    }
  }
  installStubs(fs);
  installLostFilePlaceholders(fs);
  return fs;
}
