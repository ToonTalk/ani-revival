// tools/build-film-app.mjs: the claude.ai copy's page script, packed in a block of its own
// and put on the page by a small loader (PAGE_LOADER) as a module script of its own, with
// no eval (the review of stage 7, M3 and its note 14); and withPageScript, which a check
// hooks its functions into it with.
import { test } from "node:test";
import assert from "node:assert/strict";
import { gzipSync, gunzipSync } from "node:zlib";
import { pack93, unpack93, withPageScript, PAGE_SCRIPT_ID, PAGE_LOADER } from "../tools/build-film-app.mjs";

const block = (js) => `<script type="text/plain" id="${PAGE_SCRIPT_ID}">${pack93(gzipSync(Buffer.from(js, "utf8")))}</script>`;
const unpacked = (html) => {
  const open = `id="${PAGE_SCRIPT_ID}">`, a = html.indexOf(open) + open.length;
  return gunzipSync(unpack93(html.slice(a, html.indexOf("</script>", a)))).toString("utf8");
};

// A page as far as the loader sees it: its packed block, and the scripts it puts on it.
function pageFor(js) {
  const packed = pack93(gzipSync(Buffer.from(js, "utf8")));
  const appended = [];
  const document = {
    getElementById: (id) => (id === PAGE_SCRIPT_ID ? { textContent: ` ${packed}\n` } : null),
    createElement: (tag) => ({ tag, type: "", textContent: "" }),
    body: { append: (el) => appended.push(el) },
  };
  return { document, appended };
}

test("the loader unpacks the page's script and puts it on the page as a module script, with no eval", async () => {
  // the page's script as it might be: a module's top level, await and all, strings with
  // every printable character, and text past a 64 KB stretch of the gzip
  const js = `const DATA = JSON.parse(await unpack(document.getElementById("film-data").textContent));\nconst s = "<script> & ' \\" \` é ✓";\n${"// filler line\n".repeat(6000)}export {};\n`;
  const { document, appended } = pageFor(js);
  // the loader is a module's text; here, the body of an async function with document given
  await new Function("document", `return (async () => {\n${PAGE_LOADER}\n})();`)(document);
  assert.equal(appended.length, 1);
  assert.equal(appended[0].tag, "script");
  assert.equal(appended[0].type, "module");
  assert.equal(appended[0].textContent, js);
  // and it has no eval of its own
  assert.doesNotMatch(PAGE_LOADER, /new Function|\beval\(/);
});

test("withPageScript unpacks the page's script, changes it and packs it again, leaving the rest", () => {
  const html = `<p>before</p>${block("const a = 1;")}<script type="module">loader</script>`;
  const hooked = withPageScript(html, (js) => `${js}\nwindow.__check = { a };`);
  assert.equal(unpacked(hooked), "const a = 1;\nwindow.__check = { a };");
  assert.ok(hooked.startsWith("<p>before</p>") && hooked.endsWith('<script type="module">loader</script>'));
  assert.throws(() => withPageScript("<p>no script</p>", (js) => js), /no packed page script/);
});
