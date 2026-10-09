// An ITS file system made from a bundle of texts, for a browser (or anywhere the
// project's folders aren't at hand): the files Ani's pipeline reads, collected by
// tools/build-ani-bundle.mjs, plus the built-in stand-ins for system files.
//
//   bundle = { files: [{ dir, fn1, fn2, text }], fasl: [{ dir, fn1, text }] }
import { ItsFileSystem } from "./fs.js";
import { installStubs, installLostFilePlaceholders } from "./stubs.js";

export function makeBundleFileSystem(bundle) {
  const fs = new ItsFileSystem();
  for (const f of bundle.files) fs.addFile(f.dir, f.fn1, f.fn2, { text: f.text, origin: f.origin || "bundle" });
  for (const f of bundle.fasl || []) fs.addFaslSource(f.dir, f.fn1, { text: f.text, origin: "recovered from FASL" });
  installStubs(fs);
  installLostFilePlaceholders(fs);
  return fs;
}
