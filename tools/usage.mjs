// Show how functions are used in the surviving Ani and Director code: the first
// few call sites of each name given.
// Usage: node tools/usage.mjs name ...
import { readFileSync } from "node:fs";
import { decodeItsText } from "../src/its/text.js";
import { ANI_FILES, DRIVER_FILES, DIRECTOR_FILES } from "../src/sources.js";

const files = [...ANI_FILES, ...DRIVER_FILES, ...DIRECTOR_FILES].map((p) => [
  p.split("/").pop(),
  decodeItsText(readFileSync(p)).text.split("\n"),
]);
const limit = Number(process.env.LIMIT || 3);
for (const name of process.argv.slice(2)) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`[(']${escaped}[\\s)]`, "i");
  const hits = [];
  for (const [f, lines] of files) {
    lines.forEach((l, i) => {
      if (re.test(l) && !/^\s*;/.test(l)) hits.push(`${f}:${i + 1}: ${l.trim().slice(0, 130)}`);
    });
  }
  console.log(`== ${name} (${hits.length})`);
  for (const h of hits.slice(0, limit)) console.log("   " + h);
}
