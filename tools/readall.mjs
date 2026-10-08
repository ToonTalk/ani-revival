// Read every Ani and Director file with the MacLisp reader and report problems.
// Usage: node tools/readall.mjs
import { readFileSync } from "node:fs";
import { decodeItsText } from "../src/its/text.js";
import { makeReader, Obarray, Sym, Cons } from "../src/maclisp/reader.js";
import { ANI_FILES, DRIVER_FILES, DIRECTOR_FILES, EXPANDED_FILES, OTHER_VERSIONS } from "../src/sources.js";

const obarray = new Obarray();
let failures = 0;
const oddSymbols = new Map();

function walk(x, f) {
  while (x instanceof Cons) {
    walk(x.car, f);
    x = x.cdr;
  }
  if (x instanceof Sym) f(x);
}

for (const path of [...ANI_FILES, ...DRIVER_FILES, ...DIRECTOR_FILES, ...EXPANDED_FILES, ...OTHER_VERSIONS]) {
  const { text, flaggedWords, anomalies } = decodeItsText(readFileSync(path));
  const old = path.includes("3100153/") || path.includes("7005044/");
  const reader = makeReader({ obarray, file: path, braces: !old });
  try {
    const forms = reader.readAll(text);
    let note = flaggedWords ? ` (${flaggedWords} word(s) with bit 35 set)` : "";
    if (forms.warnings.length) note += ` [${forms.warnings.join("; ")}]`;
    if (anomalies.length) note += ` ANOMALIES: ${JSON.stringify(anomalies.slice(0, 3))}`;
    console.log(`ok   ${path.padEnd(34)} ${String(forms.length).padStart(4)} forms${note}`);
    for (const { form } of forms)
      walk(form, (s) => {
        if (/["\x1b]/.test(s.name) && s.name.length < 40) oddSymbols.set(s.name, path);
      });
  } catch (e) {
    failures++;
    console.log(`FAIL ${path.padEnd(34)} ${e.message}`);
  }
}
if (oddSymbols.size) console.log("symbols containing \" or ESC:", [...oddSymbols.entries()].slice(0, 20));
console.log(failures ? `${failures} file(s) failed` : "all files read");
