// ---------------------------------------------------------------- telling Ani a new story

// A language model turns a story told in plain English into a film description in Ken's
// notation, using only the words Ani knows; then Ani plans and films it, as it did
// Cinderella. The models: Claude, ChatGPT or Gemini with the reader's own key (calls go
// straight from this page to the provider); Gemini Nano, built into desktop Chrome
// (nothing leaves the computer); and, inside claude.ai, Claude on the reader's own
// claude.ai account, with no key at all. The request shapes follow Ken's Agent Kit
// (October 2026).

// The claude.ai copy of this page (tools/build-film-app.mjs --claude-artifact) sets
// this: there, calls can go only to Claude through claude.ai, or to Gemini Nano.
const ARTIFACT_BUILD = /*ARTIFACT-BUILD*/false;
const IN_CLAUDE = ARTIFACT_BUILD || typeof window.claude === "object";
const PROVIDERS = {
  claudeai: {
    label: "Claude on claude.ai", key: null,
    note: "Claude on your own claude.ai account: no key needed. The first time, claude.ai asks you to allow it.",
    models: [["", "the usual model"], ["claude-sonnet-5-5", "Claude Sonnet 5.5"], ["claude-opus-5-5", "Claude Opus 5.5"]],
  },
  anthropic: {
    label: "Claude", org: "Anthropic", key: "Anthropic API key", keyHelp: "console.anthropic.com",
    models: [["claude-sonnet-5-5", "Claude Sonnet 5.5"], ["claude-opus-5-5", "Claude Opus 5.5"], ["claude-fable-5-1", "Claude Fable 5.1 · strongest"], ["claude-haiku-4-5", "Claude Haiku 4.5 · cheapest"]],
  },
  openai: {
    label: "ChatGPT", org: "OpenAI", key: "OpenAI API key", keyHelp: "platform.openai.com",
    models: [["gpt-6.1-sol", "GPT-6.1 Sol"], ["gpt-6-astra", "GPT-6 Astra · strongest"], ["gpt-5.6-terra", "GPT-5.6 Terra"], ["gpt-6-luna", "GPT-6 Luna · cheapest"]],
  },
  gemini: {
    label: "Gemini", org: "Google", key: "Google AI API key", keyHelp: "aistudio.google.com",
    models: [["gemini-3.8-flash", "Gemini 3.8 Flash"], ["gemini-3.1-pro-preview", "Gemini 3.1 Pro (preview) · strongest"], ["gemini-3.5-flash-lite", "Gemini 3.5 Flash-Lite · cheapest"]],
  },
  nano: {
    label: "Gemini Nano", key: null,
    note: "Built into Chrome on this computer: free, and nothing leaves it. It's small, so expect rougher drafts; the first use downloads it (a few GB).",
    models: [],
  },
};
// In claude.ai the chat proxy answers only some models; this one is proven there (Agent Kit, Sep 2026).
const KEYLESS_MODEL = "claude-sonnet-4-6";
const SETTINGS_KEY = "ani-cinderella:story-settings:v1";
const KEYS_KEY = "ani-cinderella:keys:v1";
const STORY_KEY = "ani-cinderella:story:v1";
const teller = {
  provider: null, models: {}, keys: {}, remember: false, story: "",
  sample: null, nano: "none", busy: null, draft: null, lastPrompt: null,
};
(function loadTellerSettings() {
  try { Object.assign(teller, JSON.parse(store.get(SETTINGS_KEY) || "{}")); } catch { /* fresh */ }
  try { const k = JSON.parse(store.get(KEYS_KEY) || "null"); if (k) { teller.keys = k; teller.remember = true; } } catch { /* none kept */ }
  teller.story = store.get(STORY_KEY) || "";
  teller.busy = null;
})();
function saveTellerSettings() {
  store.set(SETTINGS_KEY, JSON.stringify({ provider: teller.provider, models: teller.models }));
  if (teller.remember) store.set(KEYS_KEY, JSON.stringify(teller.keys));
  else try { localStorage.removeItem(KEYS_KEY); } catch { /* nothing kept */ }
}
// What can answer here: a page inside claude.ai can reach only claude.ai's Claude and
// Gemini Nano (its sandbox refuses calls to other sites).
function providerAvailable(id) {
  if (id === "claudeai") return ARTIFACT_BUILD || !!teller.sample;
  if (id === "nano") return teller.nano !== "none" && teller.nano !== "unavailable";
  return !IN_CLAUDE;
}
const providerIds = () => Object.keys(PROVIDERS).filter(providerAvailable);
function currentProvider() {
  const ids = providerIds();
  return ids.includes(teller.provider) ? teller.provider : ids[0] || null;
}
const modelFor = (id) => teller.models[id] ?? (PROVIDERS[id].models[0] || [""])[0];
// Probes, once: claude.ai's sample capability, and Gemini Nano in Chrome.
async function probeModels() {
  if (window.claude && typeof window.claude.use === "function") {
    try { teller.sample = await window.claude.use("sample"); } catch { teller.sample = null; }
  }
  const LM = nanoApi();
  if (LM) { try { teller.nano = await LM.availability(NANO_OPTIONS); } catch { teller.nano = "unavailable"; } }
  if (state.panel === "tell") refreshTeller();
}

// ---- the prompt

// Ani's words, from DSCRP and RELATE: the ones with suggestions of their own first.
function wordList(kind) {
  const w = DATA.words;
  const own = Object.keys(w).filter((x) => w[x].kind === kind);
  const related = Object.keys(w).filter((x) => !w[x].kind && w[x].kindByRelation === kind);
  return [...own, ...related].join(" ");
}
// Ken's CINDY without the scenes he commented out (they use things Ani can't do).
function cindyExample() {
  return DATA.cindy.split("\n").filter((line, k) => k === 0 || !/^\s*;/.test(line)).join("\n").replace(/\n{3,}/g, "\n\n");
}
// extensions: the revival's extensions the film will be made with (the page's switch);
// with the repairs (MEND), Ani can show a meeting on its own too.
function storyPrompt(story, { compact = false, extensions = [] } = {}) {
  const mend = extensions.includes("mend");
  return `Ani is a program Ken Kahn wrote at MIT in 1978. Given a film description in his Lisp notation, it plans and animates a short film in which each character is a simple shape (Cinderella was a star). Turn the story at the end into a film description Ani can run.

Write it in exactly the form of the example (Ken's own description of Cinderella), using ONLY the words listed here; Ani stops on anything else.

CHARACTERS
- 2 to 5 characters (never more than 6). Names are lowercase words joined by hyphens, like red-riding-hood or wolf.
- Each one: (define name character (process initial description (physical ...) (personality ...))). Each of physical and personality is one word or (and word word ...). The main character also gets (role-in-story most-important). A character may also get (movement graceful) or (movement clumsy).
- physical: ${wordList("physical")}
- personality: ${wordList("personality")}

RELATIONSHIPS
- Define (relationship-of a b) for EVERY ordered pair of characters, both a to b and b to a: Ani asks about all of them.
- Each is one word or (and word word ...): ${wordList("relationship")}
- For characters who have little to do with each other, use is-polite-to.
- Let only characters who pick on someone hate or be hated: Ani gives a mean or evil character the first character it hates, or is hated by, as its victim, even one who isn't in the scene.

SCENES (2 to 5, in story order)
- (define scene-name scene (process initial description TASKS) (set your mood to M) (set your rhythm to R) (set your length to L))
- TASKS is one task, or (and task task ...) for tasks Ani may order as it likes, or (sequence: task task ...) for tasks in this order; a sequence may contain an (and ...).
- A task is one of these, with X, Y, Z characters:
  (establish (personality X))
  (establish (emotional-state X (joy (positive low)))) with positive or negative, and low, medium or high
  (establish (relationship (relationship-of X Y))) for a relationship you defined
  (convey (wants X (meets X Y)))
  (convey (prevents X (meets Y Z)))
  (convey (undoes X (from-scene earlier-scene-name THAT-SCENE'S-TASK))), the earlier scene's task copied exactly, as in the example
  (convey (accompanys X Y))
  (convey (chases X Y))
  (convey (hurts X Y))
  (convey (pushes X Y))
  (convey (alone X Y)) means everyone else leaves, so that X and Y are alone together (Ani shows it by the others leaving the stage); don't use it for X leaving Y alone
  (convey (getting-it-on X Y)) for two characters in love coming together
  (convey (aware X (getting-it-on Y Z)))${mend ? `
  (convey (meets X Y)) for X going to meet Y
  Nothing else: Ani can't show helps, gives, says, and so on.` : `
  Nothing else: Ani can't show (meets X Y) on its own, or helps, gives, says, and so on.`}
- M (mood): normal, hopeful, depressing, joyous, anticipatory, (very joyous), (changes hopeful depressing), (and joyous anticipatory)
- R (rhythm): normal, fast, slow, (changes fast slow)
- L (length): short, medium or long

THE FILM
- After the scenes, copy the example's (declare (coutput (read))) line, its film definition (name yours after the story, ending in -film) and its focus definition. In the focus, parts-of-the-focus lists the main character, the scenes that matter most and the main relationships.
- Keep the example's first lines (the -*-lisp-*- line, (include |ai:ken;declar >|), (defcomment cindy)) and its last line, (compile-actors).

Right after the first line, add two comment lines naming things for people:
;; cast: red-riding-hood = Red Riding Hood (she); wolf = the wolf (he)
;; scenes: into-the-woods = Into the Woods; the-wolf-waits = The Wolf Waits
(use "the" where English needs it; pronouns she, he or they)

Reply with the whole film description in one \`\`\`lisp code block, and nothing else.

THE EXAMPLE (Ken's description of Cinderella, 1978):
\`\`\`lisp
${compact ? cindyExample().replace(/^\s*;.*$/gm, "").replace(/\n{2,}/g, "\n") : cindyExample()}
\`\`\`

THE STORY:
${story.trim()}`;
}
const unhtml = (s) => String(s).replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
function repairPrompt(problems) {
  return `Ani's checker found these problems with that film description:\n${problems.map((p) => "- " + unhtml(p)).join("\n")}\n\nReply with the whole corrected film description in one \`\`\`lisp code block, and nothing else.`;
}
// The Lisp in a reply: the fenced block (or, failing one, the reply from its first Lisp
// line on), with the lines Ken's files always have written as he wrote them, and each
// top-level form's parentheses balanced (small models drop a ")" or add one).
function lispOf(reply) {
  const fence = String(reply).match(/```(?:lisp|common-lisp|scheme)?[^\n]*\n([\s\S]*?)(?:```|$)/i);
  let text = fence ? fence[1] : String(reply);
  if (!fence) { const at = text.search(/^\s*(;;.*-\*-lisp|;;\s*cast:|\(include|\(define)/m); if (at > 0) text = text.slice(at); }
  text = text.replace(/\r/g, "").trim() + "\n";
  text = text.replace(/^\(include\b.*$/m, "(include |ai:ken;declar >|)").replace(/^\(defcomment\b.*$/m, "(defcomment cindy) ;for tags")
    .replace(/^\(declare\s+\(coutput\b.*$/m, "(declare (coutput (read)))").replace(/^\(compile-actors\b.*$/m, "(compile-actors)");
  if (!/^\(include \|ai:ken;declar >\|\)/m.test(text)) text = text.replace(/^((?:;.*\n)*)/, "$1\n(include |ai:ken;declar >|)\n\n");
  if (!/^\(compile-actors\)/m.test(text)) text += "\n(compile-actors)\n";
  return balanceParens(text);
}
// Each top-level form is taken to start with "(" at the start of a line, as in Ken's files;
// a form left open is closed at its last line of code, and extra ")"s at its end dropped.
function balanceParens(text) {
  const lines = text.split("\n");
  const codeEnd = (line) => {
    let inString = false, inBar = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === "/" && !inString) { i++; continue; }
      if (c === '"' && !inBar) inString = !inString;
      else if (c === "|" && !inString) inBar = !inBar;
      else if (c === ";" && !inString && !inBar) return i;
    }
    return line.length;
  };
  const depthOf = (line) => {
    let depth = 0, inString = false, inBar = false;
    const end = codeEnd(line);
    for (let i = 0; i < end; i++) {
      const c = line[i];
      if (c === "/" && !inString) { i++; continue; }
      if (c === '"' && !inBar) inString = !inString;
      else if (c === "|" && !inString) inBar = !inBar;
      else if (!inString && !inBar) depth += c === "(" ? 1 : c === ")" ? -1 : 0;
    }
    return depth;
  };
  const starts = lines.map((l, k) => (l.startsWith("(") ? k : -1)).filter((k) => k >= 0);
  let balanced = 0;
  starts.forEach((s, i) => {
    const e = i + 1 < starts.length ? starts[i + 1] : lines.length;
    let depth = 0;
    for (let k = s; k < e; k++) depth += depthOf(lines[k]);
    if (!depth) return;
    balanced++;
    let k = e - 1;
    while (k > s && !lines[k].slice(0, codeEnd(lines[k])).trim()) k--;
    if (depth > 0) {
      const at = codeEnd(lines[k]);
      lines[k] = lines[k].slice(0, at).replace(/\s+$/, "") + ")".repeat(depth) + (at < lines[k].length ? " " + lines[k].slice(at) : "");
    } else {
      for (let extra = -depth; extra > 0 && k >= s; k--) {
        const at = codeEnd(lines[k]);
        let code = lines[k].slice(0, at).replace(/\s+$/, "");
        while (extra > 0 && code.endsWith(")")) { code = code.slice(0, -1); extra--; }
        lines[k] = code + lines[k].slice(at);
      }
    }
  });
  return { text: lines.join("\n"), balanced };
}

// ---- calling the models

async function postJSON(url, headers, body, signal) {
  let res;
  try { res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal }); }
  catch (e) {
    if (signal && signal.aborted) throw Object.assign(new Error("Stopped."), { kind: "stopped" });
    throw Object.assign(new Error(`Couldn't reach ${new URL(url).host} (${e.message || "network error"}).`), { kind: "network" });
  }
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not JSON */ }
  if (!res.ok) {
    const detail = (json && (json.error && (json.error.message || json.error.status) || json.message)) || text.slice(0, 200);
    const help = res.status === 401 || res.status === 403 ? "The key was refused." : res.status === 404 ? "That model wasn't found." : res.status === 429 ? "Too many requests, or the account is out of credit." : "";
    throw Object.assign(new Error(`${help} (${res.status}: ${detail})`.trim()), { kind: "http", status: res.status });
  }
  return json;
}
// Each takes the conversation so far, turns of {role, content}, ending on the user.
const CALLS = {
  async anthropic(turns, { signal }) {
    const key = teller.keys.anthropic;
    if (!key) throw new Error("Add your Anthropic API key first.");
    const model = modelFor("anthropic");
    const body = { model, max_tokens: 12000, messages: turns };
    if (/^claude-(opus-5|sonnet-5|fable)/.test(model)) body.output_config = { effort: "medium" };
    const json = await postJSON("https://api.anthropic.com/v1/messages", {
      "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true",
    }, body, signal);
    return (json.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  },
  async openai(turns, { signal }) {
    const key = teller.keys.openai;
    if (!key) throw new Error("Add your OpenAI API key first.");
    const model = modelFor("openai");
    const headers = { "content-type": "application/json", authorization: "Bearer " + key };
    let json;
    try { json = await postJSON("https://api.openai.com/v1/chat/completions", headers, { model, messages: turns, max_completion_tokens: 12000 }, signal); }
    catch (e) {
      if (e.kind === "network") e.message = "OpenAI didn't accept a call from this page (some accounts refuse calls straight from a web page). Try Claude or Gemini.";
      if (e.status === 400 && /max_completion_tokens/.test(e.message)) json = await postJSON("https://api.openai.com/v1/chat/completions", headers, { model, messages: turns, max_tokens: 12000 }, signal);
      else throw e;
    }
    return String((((json.choices || [])[0] || {}).message || {}).content || "");
  },
  async gemini(turns, { signal }) {
    const key = teller.keys.gemini;
    if (!key) throw new Error("Add your Google AI API key first.");
    const model = modelFor("gemini");
    const gen = { maxOutputTokens: 12000 };
    const major = /^gemini-(\d+)/.exec(model);
    if (major && +major[1] >= 3) gen.thinkingConfig = { thinkingLevel: "low" };
    const json = await postJSON(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      "content-type": "application/json", "x-goog-api-key": key,
    }, { contents: turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })), generationConfig: gen }, signal);
    return ((((json.candidates || [])[0] || {}).content || {}).parts || []).filter((p) => !p.thought).map((p) => p.text || "").join("");
  },
  async claudeai(turns, { signal, onText }) {
    const model = modelFor("claudeai");
    if (teller.sample) {
      try {
        const { text, truncated } = await teller.sample(turns, { signal, onText: ({ text }) => onText && onText(text), cache: false, ...(model ? { model } : {}) });
        if (truncated) throw new Error("The answer was cut short. Try a shorter story.");
        return text;
      } catch (e) {
        if (e && e.code) {
          const why = { not_granted: "claude.ai wasn't allowed to answer for this page.", sampling_disabled: "Claude isn't available to this account here.", rate_limited: "Too many requests just now; try again in a little while.", session_expired: "Sign in to claude.ai again, then press your browser's reload button.", cancelled: "Stopped.", refused: "Claude declined to write this one." };
          throw Object.assign(new Error(why[e.code] || `Claude couldn't answer (${e.code}).`), { kind: e.code });
        }
        throw e;
      }
    }
    // the claude.ai chat's proxy: the same call as with a key, but no key
    const json = await postJSON("https://api.anthropic.com/v1/messages", { "content-type": "application/json" }, { model: model || KEYLESS_MODEL, max_tokens: 8000, messages: turns }, signal)
      .catch((e) => { throw Object.assign(new Error(e.status === 401 || e.status === 403 ? "claude.ai didn't answer: sign in to claude.ai, then press your browser's reload button." : e.message), { kind: e.kind }); });
    if (!json || !Array.isArray(json.content)) throw new Error("The answer couldn't be read. If you are signed out of claude.ai, sign in, then press your browser's reload button.");
    return json.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  },
  async nano(turns, { signal, onText }) {
    const LM = nanoApi();
    if (!LM) throw new Error("This browser has no built-in Gemini Nano (it needs desktop Chrome).");
    // the conversation so far goes in as the session's opening prompts, as Agent Kit does
    const initialPrompts = turns.slice(0, -1).map((t) => ({ role: t.role, content: t.content }));
    const session = await LM.create({
      ...NANO_OPTIONS, signal, ...(initialPrompts.length ? { initialPrompts } : {}),
      monitor(m) { m.addEventListener("downloadprogress", (e) => setTellerStatus(`Chrome is downloading Gemini Nano: ${Math.round(e.loaded * 100)}%`)); },
    });
    try {
      const last = turns[turns.length - 1].content;
      if (typeof session.measureInputUsage === "function" && session.inputQuota) {
        const need = await session.measureInputUsage(last).catch(() => 0);
        const room = session.inputQuota - (session.inputUsage || 0);
        if (need > room) throw new Error(`That's more than Gemini Nano can read at once (${need} tokens, with room for ${room}). Try a shorter story, or another model.`);
      }
      if (typeof session.promptStreaming !== "function") return String(await session.prompt(last, { signal }));
      const reader = session.promptStreaming(last, { signal }).getReader();
      let text = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = String(value);
        // older Chrome sent the whole answer so far each time, newer sends only the new part
        text = text && chunk.startsWith(text) ? chunk : text + chunk;
        if (onText) onText(text);
      }
      return text;
    } finally { try { session.destroy(); } catch { /* gone */ } }
  },
};
const NANO_OPTIONS = { expectedInputs: [{ type: "text", languages: ["en"] }], expectedOutputs: [{ type: "text", languages: ["en"] }] };
const nanoApi = () => (typeof window.LanguageModel !== "undefined" && window.LanguageModel && typeof window.LanguageModel.create === "function" ? window.LanguageModel : null);

// ---- the panel

const EXAMPLE_STORIES = [
  ["Red Riding Hood", "Little Red Riding Hood is a good, friendly girl who loves her kind old grandmother and wants to visit her. A mean, evil wolf blocks the way through the woods, and she is very unhappy. A strong woodcutter chases the wolf off, and Red Riding Hood and her grandmother are together again, very happy."],
  ["The Tortoise and the Hare", "A boastful, fast hare laughs at a slow, hard-working tortoise. The hare keeps pushing the tortoise around and the tortoise is unhappy. The tortoise is determined; the hare is lazy. In the end the tortoise is happy and proud, and the hare is ashamed."],
  ["Beauty and the Beast", "Belle is beautiful, kind and stubborn. The Beast is ugly, strong and mean at first, and keeps her apart from her father. Belle comes to love the Beast; her father, who is weak and kind, wants to see her. At the end Belle and the Beast are in love and very happy."],
];
function openTeller() {
  select(null, { panel: "tell" });
}
function tellerPanel() {
  const side = document.getElementById("side");
  side.innerHTML = `
    <div class="side-head"><h2>Tell Ani a new story</h2><button type="button" class="linkish" id="tell-close">Back</button></div>
    <p class="note">Tell a short story in plain English. A language model turns it into a film description in Ken's notation, using only the words Ani knows; you can look it over and change it; then Ani plans and films it, as it did Cinderella. Ani knows very little (no talking, no objects, nothing but movement), so simple stories of a few characters who love, hate, chase, guard and rescue each other work best.</p>
    <div class="presets"><span class="label">Try</span>${EXAMPLE_STORIES.map(([t], i) => `<button type="button" data-story="${i}">${esc(t)}</button>`).join("")}</div>
    <textarea id="tell-story" class="story-box" rows="6" placeholder="Once upon a time…" aria-label="Your story"></textarea>
    <div class="ed-group">
      <p class="label">The model</p>
      <div class="seg" role="group" aria-label="Which model" id="tell-providers"></div>
      <p class="note" id="tell-provider-note"></p>
      <div id="tell-key-row" class="key-row">
        <label for="tell-key" id="tell-key-label">API key</label>
        <input id="tell-key" type="password" autocomplete="off" spellcheck="false">
        <label class="check"><input type="checkbox" id="tell-remember"> Remember keys in this browser</label>
      </div>
      <div id="tell-model-row" class="key-row">
        <label for="tell-model">Model</label>
        <input id="tell-model" type="text" autocomplete="off" spellcheck="false">
        <div class="chips" id="tell-model-chips"></div>
      </div>
    </div>
    ${SWITCHED.length ? `<div class="ed-group"><p class="label">Which Ani</p><div class="make-settings">${modeSwitch()}</div><p class="note mode-note">${esc(modeNote())}</p></div>` : ""}
    <div class="actions"><button type="button" class="btn primary" id="tell-go">Write the film description</button><button type="button" class="linkish" id="tell-stop" hidden>Stop</button></div>
    <p class="note" id="tell-status" aria-live="polite"></p>
    <div id="tell-result"></div>`;
  side.querySelector("#tell-close").addEventListener("click", () => select(null));
  const box = side.querySelector("#tell-story");
  box.value = teller.story;
  box.addEventListener("input", () => { teller.story = box.value; store.set(STORY_KEY, box.value); });
  side.querySelectorAll("[data-story]").forEach((b) => b.addEventListener("click", () => { box.value = teller.story = EXAMPLE_STORIES[Number(b.dataset.story)][1]; store.set(STORY_KEY, box.value); }));
  side.querySelector("#tell-key").addEventListener("input", (e) => { teller.keys[currentProvider()] = e.target.value.trim(); saveTellerSettings(); });
  side.querySelector("#tell-remember").addEventListener("change", (e) => { teller.remember = e.target.checked; saveTellerSettings(); refreshTeller(); });
  side.querySelector("#tell-model").addEventListener("input", (e) => { teller.models[currentProvider()] = e.target.value.trim(); saveTellerSettings(); refreshTeller({ keepInputs: true }); });
  side.querySelector("#tell-go").addEventListener("click", () => draftStory());
  side.querySelector("#tell-stop").addEventListener("click", () => { if (teller.busy) teller.busy.abort(); });
  refreshTeller();
}
function setTellerStatus(text) { const el = document.getElementById("tell-status"); if (el) el.textContent = text; }
function refreshTeller({ keepInputs = false } = {}) {
  const side = document.getElementById("side");
  if (state.panel !== "tell" || !side.querySelector("#tell-providers")) return;
  const ids = providerIds();
  const id = currentProvider();
  side.querySelector("#tell-providers").innerHTML = ids.length
    ? ids.map((p) => `<button type="button" data-provider="${p}" aria-pressed="${p === id}">${esc(PROVIDERS[p].label)}</button>`).join("")
    : "";
  side.querySelectorAll("[data-provider]").forEach((b) => b.addEventListener("click", () => { teller.provider = b.dataset.provider; saveTellerSettings(); refreshTeller(); }));
  const p = id ? PROVIDERS[id] : null;
  const blocked = IN_CLAUDE ? " Inside claude.ai the page can reach only Claude through claude.ai and Gemini Nano; open the page in a browser tab to use your own keys for Claude, ChatGPT or Gemini." : "";
  side.querySelector("#tell-provider-note").textContent = !p ? "No model can be reached from here." + blocked
    : (p.note || `Calls go straight from this page to ${p.org}, with your key; it is kept only in this tab unless you tick “Remember”.`) + (id === "nano" && teller.nano !== "available" ? " (Chrome will download it the first time.)" : "") + (IN_CLAUDE && id !== "nano" ? "" : "");
  const keyRow = side.querySelector("#tell-key-row");
  keyRow.hidden = !p || !p.key;
  if (p && p.key) {
    side.querySelector("#tell-key-label").textContent = p.key;
    const input = side.querySelector("#tell-key");
    if (!keepInputs) input.value = teller.keys[id] || "";
    input.placeholder = `from ${p.keyHelp}`;
    side.querySelector("#tell-remember").checked = teller.remember;
  }
  const modelRow = side.querySelector("#tell-model-row");
  modelRow.hidden = !p || !p.models.length;
  if (p && p.models.length) {
    const input = side.querySelector("#tell-model");
    if (!keepInputs) input.value = modelFor(id);
    input.placeholder = id === "claudeai" ? "the usual model" : "";
    side.querySelector("#tell-model-chips").innerHTML = p.models.map(([m, label]) => `<button type="button" class="model-chip" data-model="${esc(m)}" aria-pressed="${modelFor(id) === m}" title="${esc(m || "claude.ai chooses")}">${esc(label)}</button>`).join("");
    side.querySelectorAll("[data-model]").forEach((b) => b.addEventListener("click", () => { teller.models[id] = b.dataset.model; saveTellerSettings(); refreshTeller(); }));
  }
  const go = side.querySelector("#tell-go");
  go.disabled = !p || !!teller.busy;
  side.querySelector("#tell-stop").hidden = !teller.busy;
}
async function draftStory({ repair = null } = {}) {
  const id = currentProvider();
  if (!id || teller.busy) return;
  const story = (teller.story || "").trim();
  if (!repair && story.length < 20) { setTellerStatus("Write a story of a sentence or more first."); return; }
  const ctl = new AbortController();
  teller.busy = ctl;
  refreshTeller({ keepInputs: true });
  const result = document.getElementById("tell-result");
  const t0 = Date.now();
  const doing = `${PROVIDERS[id].label} is ${repair ? "fixing the film description" : "writing the film description"}`;
  result.innerHTML = `<div class="draft"><p class="note" id="tell-working">${esc(doing)}…</p><pre class="lisp" id="tell-stream" hidden></pre><div class="actions"><button type="button" class="linkish" id="tell-stop-here">Stop</button></div></div>`;
  result.querySelector("#tell-stop-here").addEventListener("click", () => ctl.abort());
  result.scrollIntoView({ block: "nearest", behavior: "smooth" });
  const say = (text) => { setTellerStatus(text); const w = document.getElementById("tell-working"); if (w) w.textContent = text; };
  const tick = setInterval(() => say(`${doing}… ${clock(Date.now() - t0)}`), 1000);
  say(`${doing}…`);
  try {
    const turns = repair
      ? [...repair.turns, { role: "assistant", content: repair.reply }, { role: "user", content: repairPrompt(repair.problems) }]
      : [{ role: "user", content: storyPrompt(story, { compact: id === "nano", extensions: modeExtensions() }) }];
    const reply = await CALLS[id](turns, { signal: ctl.signal, onText: (text) => { const pre = document.getElementById("tell-stream"); if (pre) { pre.hidden = false; pre.textContent = text.slice(-1500); } } });
    if (!String(reply).trim()) throw new Error("The model sent back an empty answer.");
    const { text, balanced } = lispOf(reply);
    const { problems } = checkStory(text);
    teller.draft = { text, reply, turns, problems, balanced, provider: id, model: modelFor(id), seconds: (Date.now() - t0) / 1000 };
    say(`${PROVIDERS[id].label} ${repair ? "fixed" : "wrote"} it in ${clock(Date.now() - t0)}.`);
    showDraft();
  } catch (e) {
    const why = e.kind === "stopped" || e.kind === "cancelled" || ctl.signal.aborted ? "Stopped." : `It didn't work: ${e.message || e}`;
    say(why);
    if (teller.draft) showDraft(why);
    else result.innerHTML = `<p class="problems">${esc(why)}</p>`;
  } finally {
    clearInterval(tick);
    teller.busy = null;
    refreshTeller({ keepInputs: true });
  }
}
function showDraft(failure = null) {
  const result = document.getElementById("tell-result");
  const d = teller.draft;
  if (!result || !d) return;
  const { story, problems: hard, notes, stops } = checkStory(d.text);
  // where Ani as in 1978 stops is a problem in 1978 mode, and a note of what the repairs do in theirs
  const as1978 = MODE === "1978";
  const problems = [...hard, ...(as1978 ? stops.map((x) => x.as1978) : [])];
  const mended = as1978 ? [] : stops.map((x) => `<span class="made-with">${x.mended}</span>`);
  const cast = Object.keys(story.characters);
  const scenes = Object.keys(story.scenes);
  result.innerHTML = `
    <div class="draft">
      ${failure ? `<p class="problems">${esc(failure)}</p>` : ""}
      ${story.error ? `<p><b>Ani can't read this film description yet.</b></p>`
        : `<p><b>${esc(cast.length)} character${cast.length === 1 ? "" : "s"}</b>: ${esc(words(cast.map((c) => nameOf(story, c))))}. <b>${esc(scenes.length)} scene${scenes.length === 1 ? "" : "s"}</b>: ${esc(words(scenes.map((s) => titleOf(story, s))))}.</p>`}
      ${d.balanced ? `<p class="note">The model left the parentheses of ${d.balanced} form${d.balanced === 1 ? "" : "s"} unbalanced; the page balanced them, closing each form at its last line.</p>` : ""}
      ${problems.length ? `<ul class="problems">${problems.map((p) => `<li>${p}</li>`).join("")}</ul>` : `<p class="note">Ani's checks find nothing wrong.</p>`}
      ${notes.length || mended.length ? `<ul class="changes note">${[...mended, ...notes].map((n) => `<li>${n}</li>`).join("")}</ul>` : ""}
      <div class="actions">
        ${problems.length ? `<button type="button" class="btn" id="tell-fix">Ask ${esc(PROVIDERS[d.provider].label)} to fix these</button>` : ""}
        ${story.missingPairs && story.missingPairs.length ? `<button type="button" class="btn" id="tell-fill">Fill in the missing relationships</button>` : ""}
        <button type="button" class="btn primary" id="tell-edit">${problems.length ? "Open it in the editor" : "Look it over, then make the film"}</button>
      </div>
      <details><summary>The film description</summary><div class="body"><pre class="lisp">${esc(d.text)}</pre></div></details>
    </div>`;
  result.querySelector("#tell-fix")?.addEventListener("click", () => draftStory({ repair: { turns: d.turns, reply: d.reply, problems } }));
  result.querySelector("#tell-fill")?.addEventListener("click", () => { d.text = fillRelationships(d.text); showDraft(); });
  result.querySelector("#tell-edit").addEventListener("click", () => {
    editor.text = d.text;
    store.set(DRAFT_KEY, d.text);
    select(null, { panel: "edit" });
  });
}
