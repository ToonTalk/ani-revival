// Turn some of the project's ES modules, and everything they import, into one classic
// script that sets a global to their exports: for running Ani in a browser worker
// made from a blob (an artifact's sandbox can't import modules from blobs).
//
//   bundleModules(["src/pipeline.js", "src/its/bundle-fs.js"], "AniRuntime") -> script text
//
// It handles the forms the project uses: import { a, b as c } from "./x.js",
// import * as ns from "./x.js", export function/class/const/let, export { a, b as c }.
// Each module becomes a function scope, run once, dependencies first.
import { readFileSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";

export function bundleModules(entries, globalName, root = process.cwd()) {
  const order = [];
  const ids = new Map();
  const sources = new Map();
  function visit(file) {
    if (ids.has(file)) return;
    ids.set(file, -1);
    const src = readFileSync(file, "utf8");
    sources.set(file, src);
    for (const m of src.matchAll(/^\s*import\s+[\s\S]*?\s+from\s+"([^"]+)";?/gm)) visit(resolve(dirname(file), m[1]));
    ids.set(file, order.length);
    order.push(file);
  }
  for (const e of entries) visit(resolve(root, e));
  const parts = [`"use strict";\nconst __mods = [];`];
  for (const file of order) {
    let src = sources.get(file);
    const exported = [];
    // imports become reads of the dependency's exports
    src = src.replace(/^\s*import\s+([\s\S]*?)\s+from\s+"([^"]+)";?/gm, (all, what, spec) => {
      const dep = ids.get(resolve(dirname(file), spec));
      what = what.trim();
      if (what.startsWith("* as ")) return `\nconst ${what.slice(5).trim()} = __mods[${dep}];`;
      if (what.startsWith("{")) {
        const names = what.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean)
          .map((s) => { const [a, b] = s.split(/\s+as\s+/); return b ? `${a}: ${b}` : a; });
        return `\nconst { ${names.join(", ")} } = __mods[${dep}];`;
      }
      throw new Error(`${relative(root, file)}: unsupported import ${all.trim()}`);
    });
    // export lists
    src = src.replace(/^export\s*\{([^}]*)\};?/gm, (all, list) => {
      for (const s of list.split(",").map((x) => x.trim()).filter(Boolean)) {
        const [local, as] = s.split(/\s+as\s+/);
        exported.push([as || local, local]);
      }
      return "";
    });
    // exported declarations
    src = src.replace(/^export\s+(async\s+function\*?|function\*?|class|const|let|var)\s+([A-Za-z_$][\w$]*)/gm, (all, kind, name) => {
      exported.push([name, name]);
      return `${kind} ${name}`;
    });
    if (/^export\s/m.test(src)) throw new Error(`${relative(root, file)}: an export form the bundler doesn't handle`);
    const body = exported.map(([as, local]) => `${JSON.stringify(as)}: ${local}`).join(", ");
    parts.push(`// ${relative(root, file).replace(/\\/g, "/")}\n__mods[${ids.get(file)}] = (function () {\n${src}\nreturn { ${body} };\n})();`);
  }
  const entryIds = entries.map((e) => ids.get(resolve(root, e)));
  parts.push(`self.${globalName} = Object.assign({}, ${entryIds.map((id) => `__mods[${id}]`).join(", ")});`);
  return parts.join("\n\n");
}

if (process.argv[1]?.endsWith("bundle-js.mjs")) {
  const [out, global, ...entries] = process.argv.slice(2);
  const { writeFileSync } = await import("node:fs");
  const text = bundleModules(entries, global);
  writeFileSync(out, text);
  console.log(`wrote ${out} (${Math.round(text.length / 1024)} KB)`);
}
