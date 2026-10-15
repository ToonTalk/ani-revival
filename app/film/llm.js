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
// format: how the model writes the description, "json" (the page puts it into Ken's
// notation, app/film/json.js) or "lisp" (Ken's notation itself)
const teller = {
  provider: null, models: {}, keys: {}, remember: false, story: "", format: "json",
  sample: null, nano: "none", busy: null, draft: null, lastPrompt: null,
};
(function loadTellerSettings() {
  try { Object.assign(teller, JSON.parse(store.get(SETTINGS_KEY) || "{}")); } catch { /* fresh */ }
  try { const k = JSON.parse(store.get(KEYS_KEY) || "null"); if (k) { teller.keys = k; teller.remember = true; } } catch { /* none kept */ }
  teller.story = store.get(STORY_KEY) || "";
  teller.busy = null;
})();
function saveTellerSettings() {
  store.set(SETTINGS_KEY, JSON.stringify({ provider: teller.provider, models: teller.models, format: teller.format }));
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

// Ani's words, from DSCRP and RELATE: the ones with suggestions of their own first
// (slotWords, which the JSON way's schema reads too).
const wordList = (kind, extensions = []) => slotWords(kind, extensions).join(" ");
// Ken's CINDY without the scenes he commented out (they use things Ani can't do).
function cindyExample() {
  return DATA.cindy.split("\n").filter((line, k) => k === 0 || !/^\s*;/.test(line)).join("\n").replace(/\n{3,}/g, "\n\n");
}
// extensions: the revival's extensions the film will be made with (the page's switch);
// with the repairs (MEND), Ani can show a meeting on its own too; with CHANGE, a scene may
// change a character, in the form of Ken's commented-out cinderella-beautified
// (cindy.46:94-105). With none, the prompt is as it was.
// With KNOW, the knowledge Ken could have added (REVIVE;KNOW: DATA.know), its words are in
// the lists, and the prompt teaches its ways of showing relationships, its three tasks
// (helps, avoids, follows) and its feelings, each feeling in one form, (fear (positive
// high)): only Ken's joy is shown negative (REVIVE;KNOWEM; reports/ext/know/README.md).
// format "json": the same guidance, for a description written as JSON (app/film/json.js),
// each notation's own lines chosen by L(lisp, json); "lisp" (the default): Ken's notation.
function storyPrompt(story, { compact = false, extensions = [], format = "lisp" } = {}) {
  const mend = extensions.includes("mend");
  const change = extensions.includes("change");
  // with the revival's extensions, the story's own cast (Ken, 15 October: Gemini Nano made
  // a two-character story four, turning the prize won into "the Crown" and adding a crowd);
  // the prompt with the extensions off stays as it was
  const revival = extensions.length > 0;
  const know = extensions.includes("know") && !!DATA.know;
  const j = format === "json";
  const L = (lisp, json) => (j ? json : lisp);
  const knowVerbs_ = know ? pairVerbs(extensions).filter((v) => DATA.know.verbs[v]) : [];
  const verbs = j ? pairVerbs(extensions).filter((v) => !["accompanys", "chases", "hurts", "pushes", "alone", "getting-it-on", "meets", ...knowVerbs_].includes(v)) : [];
  // KNOW's three tasks, each with what it shows
  const KNOW_TASK = { helps: "X helping Y along (Y sets off alone; X comes up behind and helps it on)", avoids: "X keeping away from Y (when Y comes near, X runs off)", follows: "X following Y wherever it goes" };
  const knowTasks = knowVerbs_.map((v) => L(`  (convey (${v} X Y)) for ${KNOW_TASK[v] || v}`, `  {"kind": "${v}", "who": X, "whom": Y} for ${KNOW_TASK[v] || v}`)).join("\n");
  // the ways of showing KNOW gives relationships (likes, is-obedient-to, ...), from its index
  const shownBy = {};
  if (know) for (const k of DATA.know.knowledge) if (k.element === "establish" && (vocabularyFor(extensions)[k.source] || {}).kind === "relationship") (shownBy[k.verb] ||= []).push(k.source);
  for (const [w, x] of Object.entries(DATA.know ? DATA.know.words : {})) if (know && x.kind === "relationship" && x.borrows) for (const n of x.borrows) for (const v of Object.keys(shownBy)) if (shownBy[v].includes(n) && !shownBy[v].includes(w)) shownBy[v].push(w);
  const KNOW_SHOW = { follows: "following the other", helps: "helping the other", avoids: "keeping away from the other", accompanys: "going along with the other" };
  const relShown = Object.entries(shownBy).map(([v, ws]) => `${words(ws)} by ${KNOW_SHOW[v] || v}`);
  const others = know ? feelingWords(extensions).filter((f) => f !== "joy") : [];
  return `Ani is a program Ken Kahn wrote at MIT in 1978. Given a film description in his Lisp notation, it plans and animates a short film in which each character is a simple shape (Cinderella was a star). Turn the story at the end into a film description Ani can run${L("", ", written as JSON: the page puts it into Ken's notation for Ani")}.

Write it in exactly the form of the example (Ken's own description of Cinderella${L("", ", as JSON")}), using ONLY the words listed here; Ani stops on anything else.

CHARACTERS
- 2 to 5 characters (never more than 6). Names are lowercase words joined by hyphens, like red-riding-hood or wolf.
${revival ? `- Use only the characters the story names. Add one only if the story clearly needs someone it doesn't name. Never make a thing, a place or a prize (a crown, a castle, a race) into a character: Ani shows only characters moving.
` : ""}- ${L(`Each one: (define name character (process initial description (physical ...) (personality ...))). Each of physical and personality is one word or (and word word ...). The main character also gets (role-in-story most-important). ${know ? `A character may also get (movement W), W one of: ${slotWords("movement", extensions).join(" ")}.` : "A character may also get (movement graceful) or (movement clumsy)."}`, `Each one: {"name", "called", "pronoun", "physical", "personality", "movement"}. called is what people call them, with "the" where English needs it ("the wolf"), and pronoun she, he or they. physical and personality are each a list of one word or more; ${know ? `movement is [] or one of ${slotWords("movement", extensions).map((w) => `["${w}"]`).join(", ")}` : `movement is [], ["graceful"] or ["clumsy"]`}. "main" names the main character.`)}
- physical: ${wordList("physical", extensions)}
- personality: ${wordList("personality", extensions)}

RELATIONSHIPS
- ${L("Define (relationship-of a b)", `Give a relationship {"from": a, "to": b, "how": [...]}`)} ${mend ? `for each ordered pair who feel something about each other; a to b and b to a are two relationships.` : `for EVERY ordered pair of characters, both a to b and b to a: Ani asks about all of them.`}
- ${L("Each is one word or (and word word ...)", "how is a list of one word or more")}: ${wordList("relationship", extensions)}
${relShown.length ? `- Ani shows how one character feels about another by what they do: ${relShown.join("; ")} (as well as the ways she always had, such as loves by going along with the other).
` : ""}${mend ? `- For characters who have little to do with each other, leave the pair out: Ani takes a relationship the story doesn't give as neutral.` : `- For characters who have little to do with each other, use is-polite-to: Ani has no neutral word, and is-polite-to is the mildest, with no suggestions of its own.`}
- Let only characters who pick on someone hate or be hated: Ani gives a mean or evil character the first character it hates, or is hated by, as its victim, even one who isn't in the scene.

SCENES (2 to 5, in story order)
${L(`- (define scene-name scene (process initial description TASKS) (set your mood to M) (set your rhythm to R) (set your length to L))
- TASKS is one task, or (and task task ...) for tasks Ani may order as it likes, or (sequence: task task ...) for tasks in this order; a sequence may contain an (and ...).`, `- Each one: {"name", "title", "mood": M, "rhythm": R, "length": L, "steps": [[task, ...], ...]}; title is the scene's title for people.
- steps are Ken's (sequence: ...) of (and ...)s: the steps come in this order, and the tasks within a step Ani may order as she likes. So one step of several tasks lets Ani order them all, and one task alone is [[task]].`)}
- A task is one of these, with X, Y, Z characters:
${j ? `  {"kind": "establish-personality", "who": X}
  {"kind": "establish-emotional-state", "who": X, "feelings": [{"feeling": "joy", "sign": "positive", "amount": "low"}]} with positive or negative, and low, medium or high; a feeling is one of: ${feelingWords(extensions).join(", ")}${others.length ? `; only joy may be "negative" (unhappy): ${words(others)} are always "positive", and a negative one shows nothing` : ""}
  {"kind": "establish-relationship", "from": X, "to": Y} for a relationship you defined
  {"kind": "wants", "who": X, "meets": [X, Y]}
  {"kind": "prevents", "who": X, "meets": [Y, Z]}
  {"kind": "undoes", "who": X, "scene": EARLIER-SCENE, "undone": THAT-SCENE'S-TASK}, the earlier scene's task copied exactly, as in the example; only what someone did there, a convey task, can be undone
  {"kind": "accompanys", "who": X, "whom": Y}, and so too chases, hurts and pushes
  {"kind": "alone", "who": X, "whom": Y} means everyone else leaves, so that X and Y are alone together (Ani shows it by the others leaving the stage); don't use it for X leaving Y alone
  {"kind": "getting-it-on", "who": X, "whom": Y} for two characters in love coming together
  {"kind": "aware", "who": X, "gettingItOn": [Y, Z]}${verbs.length ? `
  {"kind": "${verbs[0]}", "who": X, "whom": Y}${verbs.length > 1 ? `, and so too ${words(verbs.slice(1))}` : ""}` : ""}${change ? `
  {"kind": "change-personality", "who": X, "from": OLD, "to": NEW, "causedBy": ""} for X changing: OLD is the words of X's personality that go and NEW the words that take their place; causedBy is Y when Y brings the change about. change-physical and change-movement work the same way, and so does how X feels about Y: {"kind": "change-relationship", "who": X, "whom": Y, "from": OLD, "to": NEW, "causedBy": ""}` : ""}${knowTasks ? `
${knowTasks}` : ""}${mend ? `
  {"kind": "meets", "who": X, "whom": Y} for X going to meet Y
  Nothing else: Ani can't show ${knowTasks ? "" : "helps, "}gives, says, and so on.` : `
  Nothing else: Ani can't show "meets" on its own, or ${knowTasks ? "" : "helps, "}gives, says, and so on.`}` : `  (establish (personality X))
  (establish (emotional-state X (joy (positive low)))) with positive or negative, and low, medium or high${others.length ? `
  a feeling may also be ${words(others).replace(/ and ([^ ]+)$/, " or $1")}, written as joy is but always positive, as (fear (positive high)); a negative one shows nothing, so for unhappiness use (joy (negative ...)); several feelings at once go in (and ...), as in the example` : ""}
  (establish (relationship (relationship-of X Y))) for a relationship you defined
  (convey (wants X (meets X Y)))
  (convey (prevents X (meets Y Z)))
  (convey (undoes X (from-scene earlier-scene-name THAT-SCENE'S-TASK))), the earlier scene's task copied exactly, as in the example; only what someone did there, a convey task, can be undone
  (convey (accompanys X Y))
  (convey (chases X Y))
  (convey (hurts X Y))
  (convey (pushes X Y))
  (convey (alone X Y)) means everyone else leaves, so that X and Y are alone together (Ani shows it by the others leaving the stage); don't use it for X leaving Y alone
  (convey (getting-it-on X Y)) for two characters in love coming together
  (convey (aware X (getting-it-on Y Z)))${change ? `
  (convey (change (personality X OLD) (personality X NEW))) for X changing: OLD is the words of X's personality that go and NEW the words that take their place, each one word or (and word word ...); write it (convey (causes Y (change ...))) when Y brings the change about. physical works the same way, and so does how X feels about Y: (change (relationship (relationship-of X Y) OLD) (relationship (relationship-of X Y) NEW))` : ""}${knowTasks ? `
${knowTasks}` : ""}${mend ? `
  (convey (meets X Y)) for X going to meet Y
  Nothing else: Ani can't show ${knowTasks ? "" : "helps, "}gives, says, and so on.` : `
  Nothing else: Ani can't show (meets X Y) on its own, or ${knowTasks ? "" : "helps, "}gives, says, and so on.`}`}
- M (mood): ${MOODS.join(", ")}
- R (rhythm): ${RHYTHMS.join(", ")}
- L (length): short, medium or long

MAKING A GOOD FILM
- Ani shows what characters are like, how they feel and what they do to each other, by how they move. She can't show places, objects, races, winning or speech. Turn each event of the story into those: a win becomes the winner's joy and pride and the loser's ${know ? "unhappiness" : "shame"} (establish${L(" ", "-")}emotional-state), a rivalry becomes chases or pushes, a friendship accompanys${know ? ", a fright avoids, loyalty follows" : ""}.
- Give each scene two to four tasks that together tell its part of the story, mixing establish tasks (what someone is like, or feels) with convey tasks (what someone does to someone). A scene of one task is thin.
${revival ? `- A story of two characters stays a story of two: a scene's tasks can all be between them, one chasing, pushing or hurting the other, and how each feels. Don't add characters to have someone to meet, prevent meeting or go along with.
` : ""}- chases, pushes and hurts go on for as long as the scene lasts. Put them in short scenes, or in a ${L("sequence: with other tasks after them", "step with other steps after it")}; never make a scene of pushes alone.
- Let feelings change from scene to scene as the story goes, and end each scene, and the film, on the feelings the story has there.
- In the first scene, establish the personality of the main characters and the main relationship, so the film starts by showing who they are.
- Ani shows what a mean or evil character is like by having them pick on their victim: ${L("(establish (personality X))", "establish-personality of X")} has X chase or hurt someone. So in a scene where such a character should be beaten, ashamed or out of the action (the hero's triumph), establish their feelings there, not their personality: ${know ? L("(establish (emotional-state X (joy (negative high))))", `{"kind": "establish-emotional-state", "who": X, "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]}`) : L("(establish (emotional-state X (pride (negative high))))", `{"kind": "establish-emotional-state", "who": X, "feelings": [{"feeling": "pride", "sign": "negative", "amount": "high"}]}`)}.${change ? `
- A change is shown in its scene: if Y brings it about, Y goes to X and transforms X; if nothing does, X wanders about as X changes. Ani changes how X moves${extensions.includes("appear") ? " and looks" : ""} from what it was to what it will be, gradually, or at once if Y is magical. After the scene Ani takes a fresh look at X, as if X were brand new, and in the later scenes X is described, moves${extensions.includes("appear") ? " and looks" : ""} as X has become. So the change can have a scene of its own, followed by how X feels about it, as in Ken's own scene of a change: ${L("(sequence: (convey (causes Y (change ...))) (establish (emotional-state X (joy (positive high)))))", `"steps": [[the change], [X's joy]]`)}; and show who X has become in a later scene, with ${L("(establish (personality X))", "establish-personality of X")}.` : ""}

THE FILM
- ${L("After the scenes, copy the example's (declare (coutput (read))) line, its film definition (name yours after the story, ending in -film) and its focus definition. In the focus, parts-of-the-focus lists the main character, the scenes that matter most and the main relationships.", `film: its name (after the story, ending in -film) and its levels. focus: the scenes that matter most and the main relationships (the main character comes first in the focus anyway).`)}
- The film's levels in the example are Cinderella's: set each to suit your story, to low, medium or high, rather than copying hers. energy is how lively everyone moves (high makes every character fast; a slow, patient or gentle story wants low or medium), flashiness how showy the movement is, variety how much Ani varies her choices, and originality whether she repeats them (low) or not; set rhythm, complexity, coherence and obviousness as the story feels.
${L(`- Keep the example's first lines (the -*-lisp-*- line, (include |ai:ken;declar >|), (defcomment cindy)) and its last line, (compile-actors).

Right after the first line, add two comment lines naming things for people:
;; cast: red-riding-hood = Red Riding Hood (she); wolf = the wolf (he)
;; scenes: into-the-woods = Into the Woods; the-wolf-waits = The Wolf Waits
(use "the" where English needs it; pronouns she, he or they)

Reply with the whole film description in one \`\`\`lisp code block, and nothing else.`, `
Reply with the JSON object alone, and nothing else.`)}

THE EXAMPLE (Ken's description of Cinderella, 1978${L("", ", as JSON")}):
\`\`\`${L("lisp", "json")}
${j ? (compact ? JSON.stringify(cindyJson()) : printJson(cindyJson())) : compact ? cindyExample().replace(/^\s*;.*$/gm, "").replace(/\n{2,}/g, "\n") : cindyExample()}
\`\`\`

THE STORY:
${story.trim()}`;
}
const unhtml = (s) => String(s).replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
// text: the description the problems are in; for a problem with an undoes, the prompt
// names each scene and the tasks a later scene may undo, exactly as they must be copied.
function repairPrompt(problems, format = "lisp", text = "") {
  const json = format === "json";
  let undo = "";
  if (text && problems.some((p) => /undo|isn't an earlier scene|copy it exactly/i.test(unhtml(p)))) {
    const story = readStory(text);
    const ids = Object.keys(story.scenes);
    const lines = ids.map((id) => {
      const done = tasksOf(story.scenes[id].tasks).filter((t) => t[0] === "convey" && Array.isArray(t[1]) && t[1][0] !== "undoes");
      const what = done.map((t) => (json ? flatJson(taskJson(t)) : show(t)));
      return `- ${id}: ${what.length ? what.join(json ? ", " : " ") : "nothing a later scene can undo"}`;
    });
    undo = `\n\nAn undoes task undoes only what someone did in a scene before its own: a ${json ? "convey task (not an establish-...)" : "(convey ...) task"} of that scene, copied exactly${json ? ` as "undone", with that scene's name as "scene"` : ", inside (from-scene that-scene ...)"}. The scenes, in order, and what each one does that a later scene may undo:\n${lines.join("\n")}\nIf there is nothing earlier to undo, leave the undoes out.`;
  }
  return json
    ? `Ani's checker found these problems with that film description (in Ken's notation, as the page put your JSON):\n${problems.map((p) => "- " + unhtml(p)).join("\n")}${undo}\n\nReply with the whole corrected film description as JSON, in the same form, and nothing else.`
    : `Ani's checker found these problems with that film description:\n${problems.map((p) => "- " + unhtml(p)).join("\n")}${undo}\n\nReply with the whole corrected film description in one \`\`\`lisp code block, and nothing else.`;
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
// a form left open is closed at its last line of code, and extra ")"s dropped where they
// closed it too soon, or at its end.
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
      // an extra ")" comes out where the form closed too soon, if code follows there
      // (else Ani reads what follows as commands of their own), or else at its end
      for (let m = s, run = 0; m < k; m++) { run += depthOf(lines[m]); if (run <= 0) { k = m; break; } }
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
// A call given a schema (the JSON way's, storySchema) asks the provider to keep to it; one
// that refuses it (a 400) is asked again without it, and the page's checks catch what the
// schema would have.
const shaped = (schema, call) => (schema ? call(true).catch((e) => (e && e.status === 400 ? call(false) : Promise.reject(e))) : call(false));
// Each takes the conversation so far, turns of {role, content}, ending on the user.
const CALLS = {
  async anthropic(turns, { signal, schema }) {
    const key = teller.keys.anthropic;
    if (!key) throw new Error("Add your Anthropic API key first.");
    const model = modelFor("anthropic");
    const body = { model, max_tokens: 12000, messages: turns };
    if (/^claude-(opus-5|sonnet-5|fable)/.test(model)) body.output_config = { effort: "medium" };
    const json = await shaped(schema, (on) => postJSON("https://api.anthropic.com/v1/messages", {
      "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true",
    }, on ? { ...body, output_config: { ...body.output_config, format: { type: "json_schema", schema: schemaFor("anthropic", schema) } } } : body, signal));
    return (json.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  },
  async openai(turns, { signal, schema }) {
    const key = teller.keys.openai;
    if (!key) throw new Error("Add your OpenAI API key first.");
    const model = modelFor("openai");
    const headers = { "content-type": "application/json", authorization: "Bearer " + key };
    const ask = async (extra) => {
      try { return await postJSON("https://api.openai.com/v1/chat/completions", headers, { model, messages: turns, max_completion_tokens: 12000, ...extra }, signal); }
      catch (e) {
        if (e.kind === "network") e.message = "OpenAI didn't accept a call from this page (some accounts refuse calls straight from a web page). Try Claude or Gemini.";
        if (e.status === 400 && /max_completion_tokens/.test(e.message)) return postJSON("https://api.openai.com/v1/chat/completions", headers, { model, messages: turns, max_tokens: 12000, ...extra }, signal);
        throw e;
      }
    };
    const json = await shaped(schema, (on) => ask(on ? { response_format: { type: "json_schema", json_schema: { name: "film_description", strict: true, schema } } } : {}));
    return String((((json.choices || [])[0] || {}).message || {}).content || "");
  },
  async gemini(turns, { signal, schema }) {
    const key = teller.keys.gemini;
    if (!key) throw new Error("Add your Google AI API key first.");
    const model = modelFor("gemini");
    const gen = { maxOutputTokens: 12000, ...(schema ? { responseMimeType: "application/json" } : {}) };
    const major = /^gemini-(\d+)/.exec(model);
    if (major && +major[1] >= 3) gen.thinkingConfig = { thinkingLevel: "low" };
    const json = await shaped(schema, (on) => postJSON(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      "content-type": "application/json", "x-goog-api-key": key,
    }, { contents: turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })), generationConfig: on ? { ...gen, responseJsonSchema: schemaFor("gemini", schema) } : gen }, signal));
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
  async nano(turns, { signal, onText, schema }) {
    const LM = nanoApi();
    if (!LM) throw new Error("This browser has no built-in Gemini Nano (it needs desktop Chrome).");
    // the conversation so far goes in as the session's opening prompts, as Agent Kit does
    const initialPrompts = turns.slice(0, -1).map((t) => ({ role: t.role, content: t.content }));
    // Chrome fires downloadprogress even when the model is already there (loaded 1 at
    // once), so the download is said only while one is really under way
    const downloading = teller.nano !== "available";
    const session = await LM.create({
      ...NANO_OPTIONS, signal, ...(initialPrompts.length ? { initialPrompts } : {}),
      monitor(m) { m.addEventListener("downloadprogress", (e) => { if (downloading && e.loaded < 1) setTellerStatus(`Chrome is downloading Gemini Nano: ${Math.round(e.loaded * 100)}%`); }); },
    });
    teller.nano = "available";
    setTellerStatus("");
    try {
      const last = turns[turns.length - 1].content;
      if (typeof session.measureInputUsage === "function" && session.inputQuota) {
        const need = await session.measureInputUsage(last).catch(() => 0);
        const room = session.inputQuota - (session.inputUsage || 0);
        if (need > room) throw new Error(`That's more than Gemini Nano can read at once (${need} tokens, with room for ${room}). Try a shorter story, or another model.`);
      }
      // the JSON way's schema as Chrome's responseConstraint (the prompt shows the form, so
      // the schema itself needn't take up Nano's input); a Chrome that refuses it is asked again without
      const run = async (on) => {
        const opts = { signal, ...(on ? { responseConstraint: schemaFor("nano", schema), omitResponseConstraintInput: true } : {}) };
        if (typeof session.promptStreaming !== "function") return String(await session.prompt(last, opts));
        const reader = session.promptStreaming(last, opts).getReader();
        let text = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = String(value);
          // older Chrome sent the whole answer so far each time, newer sends only the new part
          text = text && chunk.startsWith(text) ? chunk : text + chunk;
          if (onText) onText(text);
          // held to the form, Nano can pad its JSON with white space and never stop (the form
          // allows white space between any two parts): the answer ends once its JSON is whole,
          // and after a long run of white space, what is still open is closed
          if (on) {
            const { end, open, inString } = scanJson(text);
            if (end >= 0) { reader.cancel().catch(() => {}); return text.slice(0, end); }
            if (/\s{400}$/.test(text)) {
              reader.cancel().catch(() => {});
              return (text.trimEnd() + (inString ? '"' : "")).replace(/,$/, "") + open.reverse().map((b) => (b === "{" ? "}" : "]")).join("");
            }
          }
        }
        return text;
      };
      return await (schema ? run(true).catch((e) => { if (signal && signal.aborted) throw e; return run(false); }) : run(false));
    } finally { try { session.destroy(); } catch { /* gone */ } }
  },
};
const NANO_OPTIONS = { expectedInputs: [{ type: "text", languages: ["en"] }], expectedOutputs: [{ type: "text", languages: ["en"] }] };
// JSON read so far: where its outermost value ends (-1 if it hasn't), the brackets still
// open, and whether it stops inside a string.
function scanJson(text) {
  const open = [];
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inString) { if (c === "\\") i++; else if (c === '"') inString = false; continue; }
    if (c === '"') inString = true;
    else if (c === "{" || c === "[") open.push(c);
    else if ((c === "}" || c === "]") && open.length) { open.pop(); if (!open.length) return { end: i + 1, open, inString }; }
  }
  return { end: -1, open, inString };
}
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
    <div class="ed-group">
      <p class="label">The model writes</p>
      <div class="seg" role="group" aria-label="What the model writes">${[["json", "JSON"], ["lisp", "Ken's Lisp"]].map(([f, label]) => `<button type="button" data-format="${f}" aria-pressed="${teller.format === f}">${label}</button>`).join("")}</div>
      <p class="note">As JSON, it can use only Ani's words and tasks where the model's maker holds it to a form, and the page puts it into Ken's notation; or it can write Ken's notation itself.</p>
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
  side.querySelectorAll("[data-format]").forEach((b) => b.addEventListener("click", () => {
    teller.format = b.dataset.format;
    saveTellerSettings();
    side.querySelectorAll("[data-format]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  }));
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
  // while it works the draft box says so; the status line under the buttons stays empty, so it isn't said twice
  setTellerStatus("");
  const say = (text) => { const w = document.getElementById("tell-working"); if (w) w.textContent = text; else setTellerStatus(text); };
  const tick = setInterval(() => say(`${doing}… ${clock(Date.now() - t0)}`), 1000);
  say(`${doing}…`);
  try {
    // the JSON way: the model writes JSON to the schema, and the page puts it into Ken's notation
    const format = repair ? repair.format || "lisp" : teller.format === "lisp" ? "lisp" : "json";
    const extensions = modeExtensions();
    const turns = repair
      ? [...repair.turns, { role: "assistant", content: repair.reply }, { role: "user", content: repairPrompt(repair.problems, format, repair.text) }]
      : [{ role: "user", content: storyPrompt(story, { compact: id === "nano", extensions, format }) }];
    // what has come so far, shown as it streams, without the runs of blank space a model
    // held to a schema pads its JSON with (Gemini Nano does)
    const streamed = (text) => (format === "json" ? text.replace(/\s+/g, " ") : text.replace(/[ \t]+$/gm, "").replace(/\n{2,}/g, "\n")).slice(-1500);
    const reply = await CALLS[id](turns, { signal: ctl.signal, schema: format === "json" ? storySchema(extensions) : null, onText: (text) => { const pre = document.getElementById("tell-stream"); if (pre) { pre.hidden = false; pre.textContent = streamed(text); } } });
    if (!String(reply).trim()) throw new Error("The model sent back an empty answer.");
    // put into Ken's notation (a reply in Lisp anyway is read as Lisp), or balanced; then
    // tidied (tidyStory), each said in the draft
    const fromJson = format === "json" ? storyFromReply(reply) : null;
    const { text: balancedText, balanced } = fromJson ? { text: fromJson.text, balanced: 0 } : lispOf(reply);
    const tidy = tidyStory(balancedText);
    const text = tidy.text;
    const { problems } = checkStory(text);
    // what the page tidied in this reply (a fixed one is written again whole, so what was
    // tidied in the one before it no longer applies)
    const tidied = tidy.fixes;
    teller.draft = { text, reply, turns, problems, balanced, tidied, format, json: fromJson && fromJson.json, story: repair && teller.draft ? teller.draft.story : story, provider: id, model: modelFor(id), seconds: (Date.now() - t0) / 1000 };
    say(`${PROVIDERS[id].label} ${repair ? "fixed" : "wrote"} it${fromJson ? " as JSON" : ""} in ${clock(Date.now() - t0)}.`);
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
  // where Ani as in 1978 stops is a problem where the extensions ticked don't go on (in
  // 1978 mode, everywhere), and a note of what they do where they do
  const as1978 = MODE === "1978";
  const unmet = stops.filter((x) => !CHOSEN.includes(x.change ? "change" : x.know ? "know" : "mend"));
  const problems = [...hard, ...unmet.map((x) => x.as1978)];
  const mended = stops.filter((x) => !unmet.includes(x)).map((x) => `<span class="made-with">${x.mended}</span>`);
  const cast = Object.keys(story.characters);
  const scenes = Object.keys(story.scenes);
  result.innerHTML = `
    <div class="draft">
      ${failure ? `<p class="problems">${esc(failure)}</p>` : ""}
      ${story.error ? `<p><b>Ani can't read this film description yet.</b></p>`
        : `<p><b>${esc(cast.length)} character${cast.length === 1 ? "" : "s"}</b> and <b>${esc(scenes.length)} scene${scenes.length === 1 ? "" : "s"}</b>, in plain words:</p>${storyInWords(story)}`}
      ${d.json ? `<p class="note">${esc(PROVIDERS[d.provider].label)} wrote it as JSON, which the page put into Ken's notation.</p>` : d.format === "json" ? `<p class="note">${esc(PROVIDERS[d.provider].label)} answered in Lisp, not JSON; the page read the Lisp.</p>` : ""}
      ${d.balanced ? `<p class="note">The model left the parentheses of ${d.balanced} form${d.balanced === 1 ? "" : "s"} unbalanced; the page balanced them, closing a form left open at its last line, and taking out a ")" too many where it closed a form too soon.</p>` : ""}
      ${tidyNote(d.tidied)}
      ${problems.length ? `<ul class="problems">${problems.map((p) => `<li>${p}</li>`).join("")}</ul>` : `<p class="note">Ani's checks find nothing wrong.</p>`}
      ${notes.length || mended.length ? `<ul class="changes note">${[...mended, ...notes].map((n) => `<li>${n}</li>`).join("")}</ul>` : ""}
      <div class="actions">
        ${problems.length ? `<button type="button" class="btn" id="tell-fix">Ask ${esc(PROVIDERS[d.provider].label)} to fix these</button>` : ""}
        ${story.missingPairs && story.missingPairs.length && as1978 ? `<button type="button" class="btn" id="tell-fill">Fill in the missing relationships (as “is polite to”)</button>` : ""}
        <button type="button" class="btn primary" id="tell-edit">${problems.length ? "Open it in the editor" : "Look it over, then make the film"}</button>
      </div>
      ${d.json ? `<details><summary>What ${esc(PROVIDERS[d.provider].label)} wrote</summary><div class="body"><pre class="lisp">${esc(printJson(d.json))}</pre></div></details>` : ""}
      <details><summary>The film description, as Ani will read it</summary><div class="body"><pre class="lisp">${esc(formatLisp(d.text))}</pre></div></details>
    </div>`;
  result.querySelector("#tell-fix")?.addEventListener("click", () => draftStory({ repair: { turns: d.turns, reply: d.reply, problems, format: d.format, text: d.text } }));
  result.querySelector("#tell-fill")?.addEventListener("click", () => { d.text = fillRelationships(d.text); showDraft(); });
  result.querySelector("#tell-edit").addEventListener("click", () => {
    // laid out to fit the editor; printed again only where not a word changes
    editor.text = formatLisp(d.text);
    store.set(DRAFT_KEY, editor.text);
    // what the page tidied, and the story as told, go with it to the film
    editor.tidied = [...(d.tidied || [])];
    setTold({ story: d.story, provider: PROVIDERS[d.provider].org ? `${PROVIDERS[d.provider].label} (${PROVIDERS[d.provider].org})` : PROVIDERS[d.provider].label, model: d.model || (d.provider === "nano" ? "Gemini Nano" : "the usual model") });
    select(null, { panel: "edit" });
  });
}
