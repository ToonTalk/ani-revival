// Build app/pass1.html, the glass-box view of pass 1, from app/pass1.template.html
// and the data tools/run-pass1.mjs --glass-box writes (app/data/pass1.json). The
// data is inlined, so the page works opened directly or served.
// Usage: node tools/build-glassbox.mjs [--content-only out.html]
//   --content-only writes the page without its document skeleton (for publishing).
// buildGlassBox(root, { data, out }) builds it from another run's data into another file
// (tools/run-pass1.mjs --extensions: reports/ext/<a+b>/pass1.json and pass1.html).
import { readFileSync, writeFileSync } from "node:fs";
import { fullPage } from "./page-shell.mjs";

export function buildGlassBox(root = ".", { contentOnly = null, data = `${root}/app/data/pass1.json`, out = `${root}/app/pass1.html` } = {}) {
  const template = readFileSync(`${root}/app/pass1.template.html`, "utf8");
  const json = readFileSync(data, "utf8").replace(/</g, "\\u003c");
  // "Back to the film", back to the film page as it was left (app/back-to-film.js)
  const content = template.replace("/*PASS1-DATA*/", () => json).replace("/*BACK-TO-FILM*/", () => readFileSync(`${root}/app/back-to-film.js`, "utf8"));
  if (contentOnly) {
    writeFileSync(contentOnly, content);
    return contentOnly;
  }
  const page = fullPage(content);
  writeFileSync(out, page);
  return out;
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/").replace(/^\//, "")}` || process.argv[1]?.endsWith("build-glassbox.mjs")) {
  const i = process.argv.indexOf("--content-only");
  console.log("wrote " + buildGlassBox(".", { contentOnly: i > 0 ? process.argv[i + 1] : null }));
}
