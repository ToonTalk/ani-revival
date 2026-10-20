// ---------------------------------------------------------------- "Tell Ani what's wrong"

// Criticism in plain English (stage C4 of reports/chapter-x/design-criticism.md, its section
// 6; reports/ext/critic/README.md, "For the page"): at the foot of "Your criticism", the
// visitor says what is wrong with the film in their own words, and a language model of their
// choice (the providers of "Tell Ani a new story", app/film/llm.js: Claude, ChatGPT or Gemini
// with their key, Gemini Nano, or Claude through claude.ai in the claude.ai copy) reads it
// into items under a strict JSON schema (critiqueSchema) whose enums are this film's own
// scenes, parts, ways of showing, characters and words. Nothing is applied that the visitor
// hasn't seen: each item is shown in plain words, with its own button.
//   - criticism Ani can heed (another way, too quick or too slow, keep two apart, start far)
//     is added to "Your criticism" with "Add to your criticism", the visitor's words kept;
//   - what is really a change to the story (Ken's example, 20 October: "the hare is unhappy
//     and should move slowly in the final scene") goes to "Change the story" with the change
//     made there ((establish (emotional-state hare (joy (negative high)))) added to the
//     scene), for the visitor to look over and make;
//   - what is really knowledge, true of any character with that word, goes to Teach Ani,
//     its form filled in;
//   - what Ani has no notion of is refused with Ken's own sentence (AI-TR-540, p. 191).
// The visitor's words go only to the provider they chose, with the film as the glass box
// tells it; never a learner's notebook, and a key only to its own provider.

const critique = { words: "", busy: null, run: null, status: "", items: null, said: "", error: "", raw: "" };
const P191_WHOLE = "“Ani currently has practically no conception of rhythm, for example, and so could not respond to criticisms of the film's rhythm. The same holds for notions such as climax, tension, mood, or humor. Any aspect of Ani that is built-in (as opposed to explicitly taken into account) or lacking entirely cannot be criticized with any effect.”";
// what the model may say Ani can't take criticism of (design section 6, "What counts as built-in")
const CANNOT = ["rhythm", "climax", "tension", "mood", "humor", "built-in", "lacking"];

// The film as the glass box tells it, with the ids the schema offers: each scene's parts
// (p1, ...; a part that can be too quick or too slow), and the tasks shown by a way Ani
// chose (t1, ...; one that "Not this way" or "Show something else" can be said of).
function critiqueFilm(run) {
  const scenes = [], parts = {}, tasks = {};
  using(run, () => run.scenes.forEach((sc) => {
    if (!ready(sc)) return;
    const w = whyOf(run, sc);
    const g = (name) => sc.glass.tasks.find((x) => x.name === name);
    const source = (task) => { const s = AniCritic.sourceNeeded(task, sc.glass); return s ? { source: s } : {}; };
    const rows = [];
    for (const p of w.parts) {
      const pace = !p.parasiteOn && paceTasks(w, p);
      let pid = null;
      if (pace && pace.length) {
        pid = `p${Object.keys(parts).length + 1}`;
        const sources = pace.map((t) => (g(t.name) ? AniCritic.sourceNeeded(g(t.name), sc.glass) : null));
        parts[pid] = { scene: sc.id, n: p.n, tasks: pace.map((t) => t.description), ...(sources.some(Boolean) ? { sources } : {}) };
      }
      const ways = [];
      for (const name of p.tasks) {
        const a = g(name);
        if (!a) continue;
        const t = taskInfo(a), m = t.choice[0];
        if (t.kind !== "convey" || !Array.isArray(m) || typeof m[0] !== "string" || /:$/.test(m[0])) continue;
        const v = a.variables, desc = AniCritic.taskDescription(a);
        const others = [...(v.scores ? lispList(parse(v.scores)) : []), ...(v["rejected-suggestions"] ? lispList(parse(v["rejected-suggestions"])) : [])]
          .map((x) => { const s = kv(x, "suggestion"), mv = Array.isArray(s) ? kv(s, "value") : null, f = Array.isArray(mv) ? kv(mv, "value") : null; return Array.isArray(f) && typeof f[0] === "string" ? f[0] : null; })
          .filter((x) => x && x !== m[0]);
        const up = t.source && t.source !== "initial-description" && g(t.source) ? taskInfo(g(t.source)) : null;
        const tid = `t${Object.keys(tasks).length + 1}`;
        tasks[tid] = {
          scene: sc.id, what: about(t.description), way: methodText(m),
          how: desc && (v.scores && lispList(parse(v.scores)).length > 1 || v["rejected-suggestions"]) ? { kind: "another-way", scene: sc.id, task: desc, ...source(a), level: "display", vetoes: m[0] } : null,
          what_: up && up.kind === "establish" && Array.isArray(t.description) && typeof t.description[0] === "string" ? { kind: "another-way", scene: sc.id, task: AniCritic.taskDescription(up.actor), ...source(up.actor), level: "convey", vetoes: t.description[0], to: about(up.description) } : null,
        };
        ways.push(`    ${tid}: ${unhtml(about(t.description))}: Ani showed it as “${unhtml(methodText(m))}”${others.length ? ` (it also weighed ${[...new Set(others)].map(plain).join(", ")})` : " (it had no other way)"}${tasks[tid].what_ ? `; Ani chose it to show ${unhtml(tasks[tid].what_.to)}` : ""}`);
      }
      const span = p.film ? `${sec(p.film.begin / fpsOf(sc))} to ${sec(p.film.end / fpsOf(sc))} into the scene` : "not reached";
      rows.push(`  Part ${p.n}${pid ? ` (${pid})` : ""}, ${span}${p.parasiteOn ? `, alongside part ${partN(w, p.parasiteOn)}` : ""}: ${unhtml(words(p.tasks.map((x) => g(x)).filter(Boolean).map((x) => about(taskInfo(x).description))) || "nothing new")}${ways.length ? `\n${ways.join("\n")}` : ""}`);
    }
    const onstage = onStage(run, sc).map((c) => meet(run.story, c).name);
    scenes.push(`Scene “${sc.title}” (id ${sc.id}), ${sec(sc.last / fpsOf(sc))} long, with ${onstage.join(", ") || "no one"} on the stage:\n${rows.join("\n")}`);
  }));
  return { scenes, parts, tasks };
}
// How each character moves, as pass 1 chose it, in words: "the hare: speed high, ..."
function critiqueMoves(run) {
  const els = ["speed", "path-curvature", "path-length", "path-jaggedness", "activity-level"];
  return run.cast.map((c) => {
    const vals = els.map((el) => { const cp = run.cp.get(show(["choice-point-of", c, el])); return cp ? `${elementName(el)} ${plain(show(cp.currentChoice))}` : null; }).filter(Boolean);
    const k = run.story.characters[c] || {};
    return `- ${meet(run.story, c).name} (id ${c}; ${[...(k.physical || []), ...(k.personality || []), ...(k.movement || [])].map(plain).join(", ") || "no words"})${vals.length ? `: ${vals.join(", ")}` : ""}`;
  }).join("\n");
}
// The words Ani knows for characters, for "teach" (Ani's and the revival's KNOW's, never a learner's)
const critiqueWords = (run) => [...new Set(["personality", "physical", "movement"].flatMap((k) => slotWords(k, runExtensions(run))))];

// The schema, strict as storySchema is (app/film/json.js), its enums this film's own.
function critiqueSchema(run, film = critiqueFilm(run)) {
  const { obj, one, list, str } = schemaParts();
  const ids = run.sceneIds.filter((id) => ready(run.scenes[run.sceneIds.indexOf(id)]));
  const cast = one(run.cast);
  const kinds = [];
  const tids = Object.keys(film.tasks), pids = Object.keys(film.parts);
  if (tids.length) kinds.push(obj({ kind: one(["another-way"]), task: one(tids), level: one(["how", "what"]), said: str }));
  if (pids.length) kinds.push(obj({ kind: one(["pace"]), part: one(pids), direction: one(["too-quick", "too-slow"]), said: str }));
  const els = Object.keys(AniTeach.MOVEMENT_ELEMENTS).filter((el) => run.cast.some((c) => run.cp.has(show(["choice-point-of", c, el]))));
  if (AniCritic.choiceWords && els.length) kinds.push(obj({ kind: one(["choice"]), character: cast, element: one(els), direction: one(["lower", "higher", "not"]), said: str }));
  kinds.push(obj({ kind: one(["keep-apart"]), scenes: list(one(ids)), between: { ...list(cast, 2), maxItems: 2 }, said: str }));
  kinds.push(obj({ kind: one(["start-far"]), scene: one(ids), who: cast, from: cast, said: str }));
  const task = storyTaskSchema(runExtensions(run), cast);
  kinds.push(obj({ kind: one(["story"]), scene: one([...run.sceneIds, "none"]), add: { anyOf: [...task.anyOf, obj({ kind: one(["no-task"]) })] }, change: str, said: str }));
  kinds.push(obj({ kind: one(["teach"]), word: one(critiqueWords(run)), element: one(Object.keys(AniTeach.MOVEMENT_ELEMENTS)), value: str, because: str, said: str }));
  kinds.push(obj({ kind: one(["cannot"]), about: one(CANNOT), explain: str, said: str }));
  return obj({ items: list({ anyOf: kinds }, 0) });
}

// The prompt: what Ani is, the film as the glass box tells it, the kinds of item, and the
// visitor's words.
function critiquePrompt(run, said, film = critiqueFilm(run)) {
  const ext = runExtensions(run);
  return `You help a visitor criticize a film made by Ani, the program in Ken Kahn's 1979 MIT thesis that turns a short film description into an animation of simple shapes. Ani planned each scene from the description, choosing a way of showing each task (its "ways"), and how long each part takes; the visitor has watched the film and says what is wrong with it. Read what they say into items, as JSON in the form given, using only the ids below.

THE FILM: "${storyTitle(run)}", made ${unhtml(madeWith(run))}.
The characters, with the words the description gives them, and how Ani chose they move:
${critiqueMoves(run)}

The scenes, part by part, and the ways Ani chose:
${film.scenes.join("\n\n")}

THE KINDS OF ITEM:
- "another-way": a task's way of showing is wrong. level "how": Ani sets the way it chose aside and shows the task another way (only for a task that weighed other ways); level "what": for a task Ani chose in order to establish something, Ani establishes that some other way. task: a t id above.
- "pace": a part is too quick (Ani gives it half as long again, within the time the story gives the scene) or too slow (a third less). part: a p id above.
- "choice": how a character moves in the whole film is wrong (the revival's extension of Ken's criticism): Ani chose each character's speed, the curvature, length and jaggedness of its paths and so on once, for every scene (listed above); direction "lower" (the hare moves too fast: speed lower), "higher", or "not" (not the value it has); Ani makes that choice again with the criticism, everyone else's as they were. Something about one scene only is not a choice but a story item (a feeling in that scene).
- "keep-apart": two characters should not come close to each other in these scenes (Ken's example: Cinderella is not to meet the Prince until the third scene).
- "start-far": a character should start far from another in a scene, and walk on (Ken's example: the fairy godmother should start far from Cinderella).
- "story": what is really a change to the film description, not to how Ani made the film: what the characters are like, feel, or do in a scene. scene: where the change goes ("none" if it is about a character in every scene); add: the task to add to that scene, in the form of the description's tasks (kind "no-task" if it isn't one); change: the change in a few plain words. For example, "the hare is unhappy and should move slowly in the final scene" is a story item for the last scene, adding the task {"kind": "establish-emotional-state", "who": "hare", "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]}: Ani shows an unhappy character moving slowly.
- "teach": what is true of any character with one of Ani's words, in any story, not of this film ("quick characters should not move fast"): word, one of Ani's words; element, how it moves (${Object.keys(AniTeach.MOVEMENT_ELEMENTS).join(", ")}); value: low, medium or high (for path-length short, medium or long); because: the visitor's reason, in their words.
- "cannot": what Ani has no notion of, as Ken wrote (thesis p. 191): ${unhtml(P191_WHOLE)} about: rhythm, climax, tension, mood, humor; "built-in", for what is built into Ani or its Director: where characters start when nothing places them, how Director walks and turns them, the 4 and 24 frames a second, the order of the scenes${ext.includes("appear") ? "" : ", how the characters look (Ken drew them himself)"}; "lacking", for anything else Ani doesn't have at all (sound, words on the screen, scenery, props). explain: in one sentence, which, and why.
Every item has "said": the visitor's words it came from. One thing the visitor says may make more than one item; say nothing they didn't. If none fits, use "cannot". Reply with JSON only: {"items": [...]}.

THE VISITOR SAYS:
${said}`;
}

// ---- the box, at the foot of "Your criticism"

function critiqueBox(run) {
  if (!AniCritic || !remakeable(run)) return "";
  const ids = providerIds(), id = currentProvider(), p = id ? PROVIDERS[id] : null;
  const busy = critique.busy && critique.run === run;
  const result = critique.run === run ? critiqueResult(run) : "";
  return `<details class="crit-tell"${critique.run === run && (critique.items || critique.error || busy) ? " open" : ""}><summary>Tell Ani what's wrong</summary><div class="body">
    <p class="note">Say what is wrong with the film in your own words. A language model reads it into criticism Ani can heed, a change to the story, or something to teach Ani, and you choose what to do with each. Your words, with the film as the glass box tells it, go only to the model you choose.</p>
    <textarea id="crq-words" class="story-box" rows="3" placeholder="The fairy godmother just appears and is quickly gone…" aria-label="What is wrong with the film">${esc(critique.words)}</textarea>
    ${ids.length ? `<div class="seg" role="group" aria-label="Which model">${ids.map((x) => `<button type="button" data-crq-provider="${x}" data-crit-act="${critAction(run, () => { teller.provider = x; saveTellerSettings(); renderSide(); })}" aria-pressed="${x === id}">${esc(PROVIDERS[x].label)}</button>`).join("")}</div>` : `<p class="note">No model can be reached from here${IN_CLAUDE ? ": inside claude.ai the page can reach only Claude through claude.ai and Gemini Nano" : ""}.</p>`}
    ${p && p.key ? `<div class="key-row"><label for="crq-key">${esc(p.key)}</label><input id="crq-key" type="password" autocomplete="off" spellcheck="false" placeholder="from ${esc(p.keyHelp)}" value="${esc(teller.keys[id] || "")}"></div>` : ""}
    <div class="actions"><button type="button" class="btn primary" data-crq="go" data-crit-act="${critAction(run, () => askCritique(run))}"${!p || busy ? " disabled" : ""}>Ask ${esc(p ? p.label : "a model")} to read it</button>${busy ? `<button type="button" class="linkish" data-crq="stop" data-crit-act="${critAction(run, () => critique.busy && critique.busy.abort())}">Stop</button>` : ""}</div>
    <p class="note" id="crq-status" aria-live="polite">${esc(critique.run === run ? critique.status : "")}</p>
    ${result}</div></details>`;
}
// What the model read, each item with what can be done with it.
function critiqueResult(run) {
  if (critique.error) return `<p class="note crit-caution">${esc(critique.error)}</p>`;
  if (!critique.items) return "";
  if (!critique.items.length) return `<p class="note">The model found nothing in what you said that Ani could act on.</p>`;
  const rows = critique.items.map((x) => `<li class="crq-item">${x.html}${x.act ? ` <button type="button" class="btn${x.primary ? " primary" : ""}" data-crq="act" data-crit-act="${critAction(run, () => x.f())}"${x.done ? " disabled" : ""}>${esc(x.done || x.act)}</button>` : ""}</li>`).join("");
  return `<p class="label">What ${esc(critique.provider || "the model")} read in it</p><ul class="crq-items">${rows}</ul>${critique.raw ? `<details><summary>What it wrote</summary><div class="body"><pre class="lisp">${esc(critique.raw)}</pre></div></details>` : ""}`;
}
document.addEventListener("input", (e) => {
  if (e.target.id === "crq-words") critique.words = e.target.value;
  if (e.target.id === "crq-key") { teller.keys[currentProvider()] = e.target.value.trim(); saveTellerSettings(); }
});
async function askCritique(run) {
  const id = currentProvider();
  const said = (critique.words || "").trim();
  if (!run || !id || critique.busy) return;
  Object.assign(critique, { run, items: null, error: "", raw: "", status: "" });
  if (said.length < 4) { critique.status = "Say what is wrong first."; renderSide(); return; }
  const film = critiqueFilm(run);
  const schema = critiqueSchema(run, film);
  const ctl = new AbortController();
  Object.assign(critique, { busy: ctl, said, provider: PROVIDERS[id].label, status: `Asking ${PROVIDERS[id].label}…` });
  renderSide();
  try {
    const reply = await CALLS[id]([{ role: "user", content: critiquePrompt(run, said, film) }], { signal: ctl.signal, schema, schemaName: "film_criticism" });
    critique.raw = String(reply || "");
    const json = jsonOf(critique.raw);
    if (!json || !Array.isArray(json.items)) throw new Error("The model's answer couldn't be read as the JSON asked for. Try again, or another model.");
    critique.items = json.items.map((x) => critiqueItem(run, film, x, said)).filter(Boolean);
    critique.status = "";
  } catch (e) {
    critique.error = e.kind === "stopped" || ctl.signal.aborted ? "Stopped." : e.message || String(e);
    critique.status = "";
  } finally {
    critique.busy = null;
    renderSide();
    const box = document.querySelector(".crit-tell");
    if (box) box.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

// One item of the reply, checked against the film, in plain words, with what can be done
// with it: { html, act, f, primary, run }.
function critiqueItem(run, film, x, said) {
  if (!x || typeof x !== "object") return null;
  const words_ = typeof x.said === "string" && x.said.trim() ? x.said.trim() : said;
  const you = ` <span class="was">(you said “${esc(words_)}”)</span>`;
  const out = { run, said: words_ };
  const crit = (item, html) => {
    const it = { ...item, said: words_ };
    Object.assign(out, { html: `<b>Criticism:</b> ${html}${you}`, act: "Add to your criticism", primary: true, f: () => { out.done = "Added"; criticize(run, it); } });
    return out;
  };
  const sceneTitle_ = (id) => esc(sceneTitleOf(run, id));
  const who_ = (c) => esc(meet(run.story, c).the);
  switch (x.kind) {
    case "another-way": {
      const t = film.tasks[x.task];
      const item = t && (x.level === "what" ? t.what_ : t.how);
      if (!item) return { ...out, html: `<b>Not something Ani can change:</b> ${t ? `in ${sceneTitle_(t.scene)}, ${t.what}, ${x.level === "what" ? "wasn't chosen to establish something else" : "Ani had no other way to show it"}` : "the model named a step this film doesn't have"}.${you}` };
      const { to, ...rec } = item;
      return crit(rec, x.level === "what" ? `in ${sceneTitle_(t.scene)}, show ${to} some other way than ${esc(plain(item.vetoes))}` : `in ${sceneTitle_(t.scene)}, not this way (“${t.way}”): another way, for ${t.what}`);
    }
    case "pace": {
      const p = film.parts[x.part];
      if (!p || !["too-quick", "too-slow"].includes(x.direction)) return { ...out, html: `<b>Not something Ani can change:</b> the model named a part this film doesn't have.${you}` };
      const { n, ...rest } = p;
      return crit({ kind: "pace", ...rest, direction: x.direction }, `part ${n} of ${sceneTitle_(p.scene)} is ${x.direction === "too-quick" ? "too quick" : "too slow"}`);
    }
    case "choice": {
      const cp = run.cp.get(show(["choice-point-of", x.character, x.element])), v = cp && show(cp.currentChoice);
      if (!cp || !AniCritic.choiceWords || !["lower", "higher", "not"].includes(x.direction)) return { ...out, html: `<b>Not something Ani can change:</b> the model named a choice this film doesn't have.${you}` };
      const item = { kind: "choice", character: x.character, element: x.element, direction: x.direction, was: v };
      return crit(item, `the revival's: ${esc(AniCritic.choiceWords(item).replace(x.character.replace(/-/g, " "), meet(run.story, x.character).the))} (${esc(elementName(x.element))} ${esc(v)} now; pass 1 made again with it, everyone else as they were)`);
    }
    case "keep-apart": {
      const scenes = [...new Set((x.scenes || []).filter((id) => run.sceneIds.includes(id)))], b = [...new Set((x.between || []).filter((c) => run.cast.includes(c)))];
      if (!scenes.length || b.length !== 2) return null;
      return crit({ kind: "keep-apart", scenes, between: b }, `keep ${who_(b[0])} and ${who_(b[1])} apart in ${words(scenes.map(sceneTitle_))}`);
    }
    case "start-far": {
      if (!run.sceneIds.includes(x.scene) || !run.cast.includes(x.who) || !run.cast.includes(x.from) || x.who === x.from) return null;
      return crit({ kind: "start-far", scene: x.scene, who: x.who, from: x.from }, `in ${sceneTitle_(x.scene)}, ${who_(x.who)} starts far from ${who_(x.from)}`);
    }
    case "story": {
      const task = x.add && x.add.kind && x.add.kind !== "no-task" ? taskLisp(x.add) : null;
      const text = task && run.sceneIds.includes(x.scene) ? withTaskIn(run.cindy, run.story, x.scene, show(task)) : null;
      const change = typeof x.change === "string" ? x.change.trim() : "";
      Object.assign(out, {
        html: `<b>A change to the story</b>, not criticism of how Ani made it: ${esc(change || "the story told differently")}.${text ? ` In ${sceneTitle_(x.scene)}, Ani would be told <code>${esc(show(task))}</code>: ${about(task[1])}.` : ""}${you} <span class="note">Criticism is of how Ani made the film; what the film is to show is its story.</span>`,
        act: text ? "Change the story this way" : "Change the story", primary: true,
        f: () => critiqueToEditor(run, text, text ? `From “Tell Ani what's wrong”: in ${sceneTitleOf(run, x.scene)}, Ani is told ${show(task)} (${unhtml(about(task[1]))}). Look it over in Ani's version below, then make the film.` : `From “Tell Ani what's wrong”: ${change || words_}. Change the story here, then make the film.`),
      });
      return out;
    }
    case "teach": {
      const E = AniTeach.MOVEMENT_ELEMENTS[x.element];
      const W = aniWords(runExtensions(run));
      if (!E || !W[x.word]) return { ...out, html: `<b>Knowledge, not criticism of this film:</b> ${esc(x.because || words_)}, but not of a word and way of moving Ani has.${you}` };
      const value = E.values.includes(x.value) ? x.value : E.values[0];
      const given = { kind: "suggests", fields: { what: "moves", word: x.word, element: x.element, value, because: typeof x.because === "string" ? x.because : "" }, note: esc(`From “Tell Ani what's wrong”: “${words_}”. Look it over, say why, and add it to a notebook.`) };
      Object.assign(out, { html: `<b>Knowledge, true of any ${esc(plain(x.word))} character in any story</b>, not criticism of this film: a ${esc(plain(x.word))} character's ${esc(E.noun)} is ${esc(plain(value))}.${you}`, act: "Teach Ani this", primary: true, f: () => openTeach(given) });
      return out;
    }
    case "cannot": {
      const about_ = CANNOT.includes(x.about) ? x.about : "lacking";
      Object.assign(out, { html: `<b>Ani can't take this criticism</b>${typeof x.explain === "string" && x.explain.trim() ? `: ${esc(x.explain.trim().replace(/[.!]+$/, ""))}` : ""}. As Ken wrote, ${P191_WHOLE} (thesis p. 191; ${esc(about_ === "built-in" ? "this is built in" : about_ === "lacking" ? "Ani lacks this entirely" : `Ani has no notion of ${about_}`)}).${you}` });
      return out;
    }
  }
  return null;
}
// The description with a task added to a scene: into its (and ...), or made one with the
// task there; the rest of the text as it was.
function withTaskIn(text, story, id, task) {
  const sc = story.scenes[id];
  if (!sc || !sc.span) return null;
  const block = text.slice(sc.span.start, sc.span.end);
  const at = block.indexOf("(process initial description");
  if (at < 0) return null;
  let i = block.indexOf("(", at + 1), depth = 0, end = -1, lastChild = -1;
  if (i < 0) return null;
  for (let k = i; k < block.length; k++) {
    const c = block[k];
    if (c === ";") { const nl = block.indexOf("\n", k); k = nl < 0 ? block.length : nl; continue; }
    if (c === "|") { const bar = block.indexOf("|", k + 1); k = bar < 0 ? block.length : bar; continue; }
    if (c === "(") { if (depth === 1) lastChild = k; depth++; }
    else if (c === ")" && --depth === 0) { end = k; break; }
  }
  if (end < 0) return null;
  const form = block.slice(i, end + 1);
  // under the (and ...)'s last task, as it is laid out (tabs and all)
  const and = /^\(and\s/.test(block.slice(i, end + 1));
  const at_ = and && lastChild > 0 ? lastChild : i + 5, line = block.lastIndexOf("\n", at_) + 1;
  const lead = "\n" + block.slice(line, at_).replace(/[^\t ]/g, " ");
  const put = and ? `${form.slice(0, -1)}${lead}${task})` : `(and ${form}${lead}${task})`;
  return text.slice(0, sc.span.start) + block.slice(0, i) + put + block.slice(end + 1) + text.slice(sc.span.end);
}
// The editor, with the story changed, for the visitor to look over and make: made as the
// film was (its extensions; its frames a second), its story as told kept.
function critiqueToEditor(run, text, note) {
  editor.text = text || run.cindy;
  store.set(DRAFT_KEY, editor.text);
  editor.tidied = [...(run.tidied || [])];
  setTold(run.told || null);
  editor.fps = runFps(run);
  if (runExtensions(run).length && MODE === "1978") setMode("revival");
  else if (!runExtensions(run).length && MODE !== "1978") setMode("1978");
  editor.note = esc(note);
  editor.openLisp = !!text;
  select(null, { panel: "edit" });
}
