// tools/build-film-app.mjs: the claude.ai copy's page script, packed in a block of its own
// and run by a small loader as the body of an async function (PAGE_LOADER,
// pageScriptBody), and withPageScript, which a check hooks its functions into it with.
import { test } from "node:test";
import assert from "node:assert/strict";
import { gzipSync, gunzipSync } from "node:zlib";
import { pack93, unpack93, pageScriptBody, withPageScript, PAGE_SCRIPT_ID } from "../tools/build-film-app.mjs";

const block = (js) => `<script type="text/plain" id="${PAGE_SCRIPT_ID}">${pack93(gzipSync(Buffer.from(js, "utf8")))}</script>`;
const unpacked = (html) => {
  const open = `id="${PAGE_SCRIPT_ID}">`, a = html.indexOf(open) + open.length;
  return gunzipSync(unpack93(html.slice(a, html.indexOf("</script>", a)))).toString("utf8");
};

test("a module's top level, await and all, runs as the body of an async function, strict", async () => {
  const js = "const DATA = await Promise.resolve(41);\nfunction more(x) { return x + 1; }\nglobalThis.__pageScriptCheck = more(DATA);\nlet strict = false;\ntry { undeclared = 1; } catch { strict = true; }\nglobalThis.__pageScriptStrict = strict;";
  await new Function(pageScriptBody(js))();
  assert.equal(globalThis.__pageScriptCheck, 42);
  assert.equal(globalThis.__pageScriptStrict, true);
  delete globalThis.__pageScriptCheck;
  delete globalThis.__pageScriptStrict;
});

test("withPageScript unpacks the page's script, changes it and packs it again, leaving the rest", () => {
  const html = `<p>before</p>${block("const a = 1;")}<script type="module">loader</script>`;
  const hooked = withPageScript(html, (js) => `${js}\nwindow.__check = { a };`);
  assert.equal(unpacked(hooked), "const a = 1;\nwindow.__check = { a };");
  assert.ok(hooked.startsWith("<p>before</p>") && hooked.endsWith('<script type="module">loader</script>'));
  assert.throws(() => withPageScript("<p>no script</p>", (js) => js), /no packed page script/);
});
