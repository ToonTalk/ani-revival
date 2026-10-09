// Build app/pass1.html, the glass-box view of pass 1, from app/pass1.template.html
// and the data tools/run-pass1.mjs --glass-box writes (app/data/pass1.json). The
// data is inlined, so the page works opened directly or served.
// Usage: node tools/build-glassbox.mjs [--content-only out.html]
//   --content-only writes the page without its document skeleton (for publishing).
import { readFileSync, writeFileSync } from "node:fs";
import { fullPage } from "./page-shell.mjs";

export function buildGlassBox(root = ".", { contentOnly = null } = {}) {
  const template = readFileSync(`${root}/app/pass1.template.html`, "utf8");
  const data = readFileSync(`${root}/app/data/pass1.json`, "utf8").replace(/</g, "\\u003c");
  const content = template.replace("/*PASS1-DATA*/", () => data);
  if (contentOnly) {
    writeFileSync(contentOnly, content);
    return contentOnly;
  }
  const page = fullPage(content);
  writeFileSync(`${root}/app/pass1.html`, page);
  return `${root}/app/pass1.html`;
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/").replace(/^\//, "")}` || process.argv[1]?.endsWith("build-glassbox.mjs")) {
  const i = process.argv.indexOf("--content-only");
  console.log("wrote " + buildGlassBox(".", { contentOnly: i > 0 ? process.argv[i + 1] : null }));
}
