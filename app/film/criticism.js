// ---------------------------------------------------------------- your criticism

// Ani heeding a reader's criticism of its films (REVIVE;CRITIC, stages C0 to C3 of
// reports/chapter-x/design-criticism.md; what it did to Ken's Cinderella, and what the page
// needs, is reports/ext/critic/README.md, "For the page"), after Ken's thesis, Chapter X,
// Section D, "Critics and Criticism" (AI-TR-540, pp. 189-191): "Ani should be extended to
// accept criticism of the films and their justification. For many types of criticism there
// is an obvious response."
//   - Buttons where the reasons are: in a step's "Why this way", "Not this way: another
//     way" (the display method vetoed in its task) and, for a step that shows what an
//     establish task chose to convey, "Show something else" (that convey method vetoed in
//     the establish task: Ken's footnote, p. 64); in "Why so long" and on each part of the
//     timeline, "Too quick" and "Too slow" (the part's tasks, by half again); and for a
//     scene, "Keep two apart" and "Start far from" (Ken's remedy for No Longer Kept Apart,
//     p. 69), offered when someone starts where an earlier scene left her without her
//     having been in it.
//   - "Your criticism": the film's record, as it was made (heeded) and as the reader has
//     changed it since (new, or taken back), each in plain words with "Take it back"; and
//     "Remake with my criticism", which says what will be remade.
//   - The remake: src/pipeline.js remakeFilmSteps, in the worker as a film is made, from the
//     film's working files (films made from now on keep them; Ken's 1978 film is remade from
//     the files the tools hold his run to, DATA.kenFiles; a film kept without them is made
//     again from the start, and says so); then the film it was remade from and the new one
//     side by side, with "What your criticism changed" (src/pipeline.js criticismChanges,
//     the page's copy: AniCritic); kept in "Your films" with its criticism (version 3).
//   - The glass box: "What your criticism did here", from the notes CRITIC left where it
//     heeded a criticism or couldn't; "vetoed by you" and "kept apart by you" where a way
//     was set aside; and why something couldn't be met, with p. 191 where Ani has no
//     notion of the thing.
// The record's helpers are src/pipeline.js's own (AniCritic, put in by
// tools/build-film-app.mjs): the page keeps a record as the pipeline does.

const P191 = "“Any aspect of Ani that is built-in (as opposed to explicitly taken into account) or lacking entirely cannot be criticized with any effect”";
const critCite = () => `Ken's thesis, Chapter X, Section D, “Critics and Criticism” (<a href="${AITR_URL}" target="_blank" rel="noopener">AI-TR-540</a>, pp. 189–191)`;
// Ken's 1978 film and its own record (none), at each rate; a reader's film has its own
const KEN_PENDING = {};
const runFps = (run) => (run && (run.fps || fpsOf(run.scenes.find(ready)))) || 4;
const critRecord = (run) => (run && run.criticism) || [];
// What the reader would have Ani heed now: the film's record as it was made, changed by
// what they have criticized or taken back since.
function pendingOf(run) {
  if (!run) return [];
  if (run === RUNS[0]) return (KEN_PENDING[runFps(run)] ||= []);
  return (run.pending ||= [...critRecord(run)]);
}
function setPending(run, record) {
  if (run === RUNS[0]) KEN_PENDING[runFps(run)] = record;
  else run.pending = record;
}
const sameItem = (a, b) => JSON.stringify({ ...a, said: null }) === JSON.stringify({ ...b, said: null });
// one criticism, as the film's record and what is pending have it (an id is never given twice)
const sameCrit = (a, b) => a.id === b.id && a.kind === b.kind;
const nextCritId = (run) => `c${1 + Math.max(0, ...[...critRecord(run), ...pendingOf(run)].map((c) => Number(String(c.id).slice(1)) || 0))}`;
const critChanged = (run) => { const a = critRecord(run), b = pendingOf(run); return a.length !== b.length || a.some((x, k) => !sameItem(x, b[k])); };
// The film can be remade: made to its end (each scene filmed or stopped), and not being made.
const remakeable = (run) => !!run && !(run.status && run.status.running) && run.scenes.length > 0 && run.raw.scenes.filter(Boolean).length === run.sceneIds.length;
const critOK = (run, sc) => !!AniCritic && remakeable(run) && ready(sc) && !(RUNS[1] && RUNS[1].status && RUNS[1].status.running);
// a criticism of the run's record (or of what is pending), by its id
const critItem = (run, id) => [...critRecord(run), ...pendingOf(run)].find((c) => c.id === id) || null;

// ---- the record in plain words

// a method's first word as the film had it, in words: the form it was weighed in, if the
// scene has one
function vetoWords(run, item) {
  const sc = run.scenes[run.sceneIds.indexOf(item.scene)];
  if (item.level === "convey") return `showing that ${critAbout(run, sc, [item.vetoes])}`;
  if (ready(sc)) {
    for (const t of sc.glass.tasks) {
      if (AniCritic.taskDescription(t) !== item.task) continue;
      const forms = [t.variables["current-choice"], t.variables.scores, t.variables["rejected-suggestions"]].filter(Boolean).map(parse);
      let found = null;
      const look = (x) => { if (found || !Array.isArray(x)) return; if (x[0] === item.vetoes && x.length > 1) { found = x; return; } x.forEach(look); };
      forms.forEach(look);
      if (found) return `“${using(run, () => methodText(found))}”`;
    }
  }
  return `“${esc(plain(item.vetoes))}”`;
}
// what a task (or a verb's part of one) is about, in the run's names and the scene's
function critAbout(run, sc, d) {
  const id = sc ? sc.id : null;
  return using(run, () => (id ? asOf(id, () => about(d)) : about(d)));
}
const critTask = (run, scene, task) => critAbout(run, run.scenes[run.sceneIds.indexOf(scene)], parse(task));
const sceneTitleOf = (run, id) => run.titles[id] || titleCase(id);
// The reader's own words for a criticism, if they gave any: not a button's label, which
// the item's words say already.
const BUTTON_WORDS = new Set(["Too quick", "Too slow", "Not this way: another way", "Show something else"]);
const saidWords = (item) => (item && item.said && !BUTTON_WORDS.has(item.said) ? ` <span class="was">(you said “${esc(item.said)}”)</span>` : "");
// An item in plain words (HTML), with the reader's own words if they gave any.
function critWords(run, item, { said = true } = {}) {
  const t = (id) => esc(sceneTitleOf(run, id));
  const w = using(run, () => {
    if (item.kind === "another-way") return item.level === "convey"
      ? `${t(item.scene)}: not ${vetoWords(run, item)} to establish ${critTask(run, item.scene, item.task)}; something else`
      : `${t(item.scene)}: not ${vetoWords(run, item)}; another way to show that ${critTask(run, item.scene, item.task)}`;
    if (item.kind === "pace") return `${t(item.scene)}: too ${item.direction === "too-quick" ? "quick" : "slow"}${item.times > 1 ? ` (said ${countWords(item.times)} times)` : ""}, the part where ${item.tasks.length === 1 ? critTask(run, item.scene, item.tasks[0]) : words(item.tasks.map((x) => critTask(run, item.scene, x)))}`;
    if (item.kind === "keep-apart") return `keep ${who(item.between[0])} and ${who(item.between[1])} apart in ${words(item.scenes.map((id) => esc(midTitle(run, id))))}`;
    return `${t(item.scene)}: ${who(item.who)} starts far from ${who(item.from)}`;
  });
  return `${cap(w)}${said ? saidWords(item) : ""}`;
}
// A film's criticism in a few words each, for its title in "Your films": ", with your
// criticism: No Longer Kept Apart too quick; ...".
function critTitle(run) {
  const t = (id) => sceneTitleOf(run, id).replace(/^The /, "the ");
  const name = (c) => unmark(using(run, () => who(c)));
  const bits = run.criticism.map((c) => (c.kind === "pace" ? `${t(c.scene)} too ${c.direction === "too-quick" ? "quick" : "slow"}`
    : c.kind === "another-way" ? `not ${plain(c.vetoes)} in ${t(c.scene)}`
    : c.kind === "keep-apart" ? `${name(c.between[0])} and ${name(c.between[1])} kept apart`
    : `${name(c.who)} starting far from ${name(c.from)}`));
  return `, with your criticism: ${cap(bits.join("; "))}`;
}
// The scenes a record (and the film's own) reaches from: the first criticized, by index.
function critFrom(run, record = pendingOf(run)) {
  const k = [...record, ...critRecord(run)].flatMap(AniCritic.criticismScenes).map((id) => run.sceneIds.indexOf(id)).filter((i) => i >= 0);
  return k.length ? Math.min(...k) : run.sceneIds.length;
}
const kenFilesAt = (fps) => (DATA.kenFiles && DATA.kenFiles[4] ? (fps === 24 ? (DATA.kenFiles[24] ? { ...DATA.kenFiles[4], ...DATA.kenFiles[24] } : null) : DATA.kenFiles[4]) : null);
const filesOf = (run) => (run === RUNS[0] ? kenFilesAt(runFps(run)) : run.raw.files || null);
// What a remake will do, in a sentence.
function remakePlan(run) {
  if (!filesOf(run)) return "This film was saved before Ani kept its working files, so it is made again from the start, heeding your criticism.";
  const k = critFrom(run);
  const again = run.sceneIds.slice(k).map((id) => midTitle(run, id));
  const kept = run.sceneIds.slice(0, k).map((id) => midTitle(run, id));
  const slow = runFps(run) === 24 ? ` At 24 frames a second each scene filmed again takes minutes${run === RUNS[0] ? " (the 1978 film at 4 a second is quicker to try)" : ""}.` : "";
  return `Ani will plan ${words(again)} again, and film again those whose plan changes${kept.length ? `; ${words(kept)} ${kept.length > 1 ? "are" : "is"} kept as ${kept.length > 1 ? "they were" : "it was"}, before the first scene criticized` : ""}.${slow}`;
}

// ---- adding to it

// Each criticism button names the run and the item it adds (CRIT_ACTIONS), drawn afresh
// with the panel. Only the oldest are let go, when there are many: the buttons on the
// screen were drawn last, so theirs stay (a panel draws a few dozen at most).
const CRIT_ACTIONS = new Map();
let critActionId = 0;
function critAction(run, f) {
  if (CRIT_ACTIONS.size > 2000) for (const k of [...CRIT_ACTIONS.keys()].slice(0, 1000)) CRIT_ACTIONS.delete(k);
  const k = String(++critActionId);
  CRIT_ACTIONS.set(k, { run, f });
  return k;
}
function critButton(run, item, label, title = "") {
  const k = critAction(run, () => criticize(run, item));
  // (one the record already has is shown pressed; a pace one compounds, so it never is)
  let there = false;
  if (item.kind !== "pace") { try { const r = AniCritic.addCriticism(pendingOf(run), item); there = !!r.item && pendingOf(run).some((c) => c.id === r.item.id); } catch { there = false; } }
  return `<button type="button" class="crit-btn" data-crit-act="${k}"${there ? ' aria-pressed="true"' : ""}${title ? ` title="${esc(title)}"` : ""}>${esc(label)}</button>`;
}
const critNote = { text: "", run: null };
function criticize(run, item) {
  try {
    // (its id is the next of both the film's record and what is pending, so that one taken
    // back is never confused with a new one)
    const { item: kept, record } = AniCritic.addCriticism(pendingOf(run), { ...item, id: item.id || nextCritId(run) });
    setPending(run, record);
    critNote.run = run;
    critNote.text = kept ? "Added to your criticism; remake the film when you are ready." : "That takes back the other: this part is no longer criticized.";
  } catch (e) {
    critNote.run = run;
    critNote.text = `Ani can't take that as criticism: ${e.message || e}`;
  }
  renderSide();
  const box = document.getElementById("crit");
  if (box) box.scrollIntoView({ block: "nearest", behavior: "smooth" });
}
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest("[data-crit-act]");
  if (!b) return;
  const a = CRIT_ACTIONS.get(b.dataset.critAct);
  if (a) { e.preventDefault(); a.f(b); }
});

// "Not this way: another way" and "Show something else", for a step's "Why this way".
function critWayButtons(run, sc, t, method) {
  if (!critOK(run, sc) || !t) return "";
  const v = t.actor.variables;
  const scores = v.scores ? lispList(parse(v.scores)) : [];
  const rejected = v["rejected-suggestions"] ? lispList(parse(v["rejected-suggestions"])) : [];
  const desc = AniCritic.taskDescription(t.actor);
  // the task's source, where the scene has another task of its description (src/pipeline.js sourceNeeded)
  const source = (task) => { const s = AniCritic.sourceNeeded(task, sc.glass); return s ? { source: s } : {}; };
  const out = [];
  if (Array.isArray(method) && typeof method[0] === "string" && desc && !/:$/.test(method[0])) {
    const left = waysLeft(v, method[0]);
    // a caution where what is left would stop Ani (see critCaution), the veto offered all the same
    const caution = !left.length ? ` <span class="note crit-caution">Ani has no other way here that it could use: the others were set aside for reasons that still hold, so it would leave this part out (its own “can't do”).</span>`
      : left.every((f) => f[0] === "chases-to" && chaseStops(sc, v.subscene, f)) ? ` <span class="note crit-caution">${critCaution("chases-to")}</span>` : "";
    out.push(scores.length > 1 || rejected.length
      ? critButton(run, { kind: "another-way", scene: sc.id, task: desc, ...source(t.actor), level: "display", vetoes: method[0], said: "Not this way: another way" }, "Not this way: another way", "Ani sets this way aside in this task and chooses among what is left (thesis pp. 189–191)") + caution
      : `<span class="note">Ani had no other way to show this.</span>`);
  }
  // what is shown: the establish task this one conveys a part of
  const up = t.source && t.source !== "initial-description" ? taskByName(t.source) : null;
  if (up && up.kind === "establish" && Array.isArray(t.description) && typeof t.description[0] === "string") {
    out.push(critButton(run, { kind: "another-way", scene: sc.id, task: AniCritic.taskDescription(up.actor), ...source(up.actor), level: "convey", vetoes: t.description[0], said: "Show something else" }, "Show something else", "Ani establishes this some other way (thesis p. 64)"));
  }
  return out.length ? ` <span class="crit-buttons">${out.join(" ")}</span>` : "";
}
// The ways of showing a task's veto would leave Ani: those it scored but the one vetoed,
// and those it set aside only for taking too much time, which Ken's code can bring back
// (resurect-bad-time-fits, chomet.123:187); not those Director has no way to run
// (REVIVE;MEND14 sets them aside), nor those set aside for other reasons, which hold.
const UNRUNNABLE = new Set(["makes-fence", "chases-off"]);
function waysLeft(v, vetoed) {
  const form = (s) => { const m = Array.isArray(s) ? kv(s, "value") : null; const f = Array.isArray(m) ? kv(m, "value") : null; return Array.isArray(f) && typeof f[0] === "string" ? f : null; };
  const scored = (v.scores ? lispList(parse(v.scores)) : []).map((x) => form(kv(x, "suggestion")));
  const timed = (v["rejected-suggestions"] ? lispList(parse(v["rejected-suggestions"])) : []).filter((x) => { const r = kv(x, "reason"); return Array.isArray(r) && r[0] === "too-much-time:"; }).map((x) => form(kv(x, "suggestion")));
  return [...scored, ...timed].filter((f) => f && f[0] !== vetoed && !UNRUNNABLE.has(f[0]));
}
// Whether Ken's chases-to would stop on this chase in this part: the chaser or the one
// chased has no place yet (a cut earlier in the scene left them nowhere), while where
// they run to has one (initial-locations-for-chases-to, disply.311:95-111, his break
// cant-handle-yet-in-chases-to-intial-locs). Read from where the film remade from had
// them: the part's places from before it ran its ways (a cut's or an earlier scene's),
// else the last an earlier part had.
function chaseStops(sc, subName, form) {
  const [, chaser, chasee, dest] = form;
  const k = sc.glass.subscenes.findIndex((s) => s.name === subName);
  if (k < 0) return false;
  const placed = (c) => {
    for (let i = k; i >= 0; i--) {
      const loc = sc.glass.subscenes[i].variables[`(location-of ${c})`];
      if (!loc) continue;
      const p = parse(loc), why = kv(p, "why");
      if (i === k && !(Array.isArray(why) && (why[0] === "ended" || why[0] === "cut"))) continue; // placed by this part's own ways, the one vetoed among them
      return kv(p, "where") !== "nowhere";
    }
    return null;
  };
  let target = null;
  const find = (x) => { if (target || !Array.isArray(x)) return; if (x[0] === "vicinity-of") { target = x[1]; return; } x.forEach(find); };
  find(dest);
  return (placed(chaser) === false || placed(chasee) === false) && !!target && placed(target) === true;
}
// Why a way left would stop Ani, in plain words. The veto is offered all the same, with
// this caution: Ani's own reasoning is what should say what it can't do (the design,
// section 8), the page's reading of where everyone is may be wrong where the plan changes
// before the part, and a remake in which Ani stops keeps the film as it was and says why.
function critCaution(method) {
  if (method === "chases-to") return "The only other way Ani has here is a chase (Ken's chases-to), and Ken's chases-to can't yet place the two when where they run to has a place and one of them has none, here after the cut earlier in the scene: a case he left unfinished (disply.311:95-111). Ani will most likely stop there; if it does, the film is kept as it was, and says so.";
  return "";
}
// the tasks of a part a pace criticism names: its tasks shown by a way of doing something,
// each with its time (not a change of feeling beside them)
function paceTasks(w, part) {
  return w.tasks.filter((t) => part.tasks.includes(t.name) && t.kind === "convey" && t.runningTime !== null && t.chosen.length && !t.chosen.every((c) => /^\((change:|change-to:|look-change)/.test(c)) && t.description);
}
// "Too quick" and "Too slow" for a part: each disabled where the part already takes all (or
// the least) of the time the story gives it, saying so, with "Make the scene longer in the
// story" where the scene's length can grow.
function critPaceButtons(run, sc, w, part, { short = false } = {}) {
  if (!critOK(run, sc) || !part || part.parasiteOn) return "";
  const tasks = paceTasks(w, part);
  if (!tasks.length) return "";
  const tasksOf = tasks.map((t) => t.description);
  // each task's source, where its scene has another of its description (src/pipeline.js sourceNeeded)
  const sources = tasks.map((t) => { const g = sc.glass.tasks.find((x) => x.name === t.name); return g ? AniCritic.sourceNeeded(g, sc.glass) : null; });
  const most = tasks.every((t) => t.allocatedTime && t.runningTime >= t.allocatedTime[1] - 0.005);
  const least = tasks.every((t) => t.allocatedTime && t.runningTime <= t.allocatedTime[0] + 0.005);
  const span = tasks[0].allocatedTime ? secondsSpan(tasks[0].allocatedTime[0], tasks[0].allocatedTime[1]) : "";
  const item = (direction, said) => ({ kind: "pace", scene: sc.id, tasks: tasksOf, ...(sources.some(Boolean) ? { sources } : {}), direction, said });
  // the story's time for the part, whatever Ani estimated for its ways (which "Why so long" gives)
  const allOf = `This part already takes all the time your story gives it, ${esc(span)}, whatever Ani's own estimate`;
  const leastOf = `This part already takes the least time your story gives it, ${esc(span)}`;
  const quick = most ? `<button type="button" class="crit-btn" disabled title="${allOf}">Too quick</button>` : critButton(run, item("too-quick", "Too quick"), "Too quick", "Ani gives the part half as long again, within the time the story gives it (thesis pp. 189–191)");
  const slow = least ? `<button type="button" class="crit-btn" disabled title="${leastOf}">Too slow</button>` : critButton(run, item("too-slow", "Too slow"), "Too slow", "Ani gives the part a third less time, within the time the story gives it (thesis pp. 189–191)");
  const bound = short ? "" : most ? ` <span class="note">${allOf}.${longerButton(run, sc.id)}</span>` : least ? ` <span class="note">${leastOf}.</span>` : "";
  return ` <span class="crit-buttons">${quick} ${slow}</span>${bound}`;
}
// "Make the scene longer in the story": the scene's length one step longer (short to
// medium, medium to long), in the editor, for the reader to make; a change to the
// description, not a criticism of how Ani made it.
const LONGER = { short: "medium", medium: "long" };
function longerText(run, id) {
  const sc = run.story.scenes[id];
  if (!sc || !sc.span) return null;
  const block = run.cindy.slice(sc.span.start, sc.span.end);
  const m = /\(set your length to (short|medium)\)/.exec(block);
  if (!m) return null;
  return run.cindy.slice(0, sc.span.start) + block.replace(m[0], `(set your length to ${LONGER[m[1]]})`) + run.cindy.slice(sc.span.end);
}
function longerButton(run, id) {
  const text = longerText(run, id);
  if (!text) return "";
  const k = critAction(run, () => {
    editor.text = text;
    store.set(DRAFT_KEY, text);
    editor.tidied = [...(run.tidied || [])];
    setTold(run.told || null);
    select(null, { panel: "edit" });
  });
  return ` <button type="button" class="linkish" data-crit-act="${k}">Make the scene longer in the story</button>`;
}

// ---- a scene's own: keep two apart, start one far from another

// Those on the stage in a scene, in the cast's order.
const onStage = (run, sc) => run.cast.filter((c) => sc.film.frames.some((fr) => fr.chars[c] && fr.chars[c].visible && fr.segs[c]));
// Who starts the scene where an earlier scene left her, without having had a part in it
// (Ken's No Longer Kept Apart: the fairy godmother "just appears", p. 69; the revival found
// that his save-positions puts a character never shown at the center): each { who, from },
// from the one nearest her there.
function startFarOffers(run, sc) {
  const k = run.sceneIds.indexOf(sc.id);
  if (k < 1) return [];
  const prev = run.scenes[k - 1];
  const inPrev = new Set(ready(prev) ? prev.activities.flatMap((a) => a.chars) : []);
  const out = [];
  for (const c of run.cast) {
    for (const sub of sc.glass.subscenes) {
      const loc = sub.variables[`(location-of ${c})`];
      if (!loc) continue;
      const p = parse(loc), why = kv(p, "why"), where = kv(p, "where");
      if (Array.isArray(why) && why[0] === "ended" && why[3] === "in" && !inPrev.has(c) && Array.isArray(where) && where[0] === "xy-position") {
        // the nearest of the others placed where they ended up too
        const near = run.cast.filter((x) => x !== c).map((x) => { const q = sub.variables[`(location-of ${x})`] ? kv(parse(sub.variables[`(location-of ${x})`]), "where") : null; return Array.isArray(q) && q[0] === "xy-position" ? [x, Math.hypot(q[1] - where[1], q[2] - where[2])] : null; }).filter(Boolean).sort((a, b) => a[1] - b[1]);
        // whom PLACE places her with: the others of her ways of showing here (start far acts
        // where PLACE places the two together, REVIVE;CRITSC), else anyone
        const partners = placedWith(run, sc, c);
        const others = partners.length ? partners : run.cast.filter((x) => x !== c);
        const nearest = near.map((n) => n[0]).find((x) => others.includes(x));
        out.push({ who: c, from: nearest || others[0], partners: others });
      }
      break;
    }
  }
  return out;
}
// The characters PLACE places c with in a scene: those in the first two places of a way of
// showing chosen there that has c in them too (goes-to-and-accompanys fairy-godmother
// cinderella ...: Cinderella), as Ken's display methods hand PLACE their two.
function placedWith(run, sc, c) {
  const has = (x, name) => (Array.isArray(x) ? x.some((y) => has(y, name)) : x === name);
  const out = [];
  for (const t of sc.glass.tasks) {
    for (const m of lispList(parse(t.variables["current-choice"] || "nil"))) {
      if (!Array.isArray(m) || typeof m[0] !== "string" || /:$/.test(m[0])) continue;
      const two = m.slice(1, 3);
      if (!has(two, c)) continue;
      for (const x of run.cast) if (x !== c && has(two, x) && !out.includes(x)) out.push(x);
    }
  }
  return out;
}
function critSceneBox(run, sc, { open = false } = {}) {
  if (!critOK(run, sc)) return "";
  const cast = onStage(run, sc);
  const k = run.sceneIds.indexOf(sc.id);
  const name = (c) => esc(cap(who(c)));
  const opts = (list, at) => list.map((c) => `<option value="${esc(c)}"${c === at ? " selected" : ""}>${name(c)}</option>`).join("");
  const parts = [];
  if (cast.length >= 2) {
    const a = cast.includes("cinderella") && cast.includes("prince") ? "cinderella" : cast[0];
    const b = a === "cinderella" && cast.includes("prince") ? "prince" : cast.find((x) => x !== a);
    const go = critAction(run, (btn) => {
      const box = btn.closest(".crit-apart");
      const [x, y] = [...box.querySelectorAll("select")].map((s) => s.value);
      const before = box.querySelector("input[type=checkbox]");
      if (x === y) { critNote.run = run; critNote.text = "Choose two different characters to keep apart."; renderSide(); return; }
      const scenes = before && before.checked ? run.sceneIds.slice(0, k + 1) : [sc.id];
      criticize(run, { kind: "keep-apart", scenes, between: [x, y], said: `Keep ${unmark(who(x))} and ${unmark(who(y))} apart in ${scenes.map((id) => sceneTitleOf(run, id)).join(" and ")}` });
    });
    parts.push(`<div class="crit-apart"><p><b>Keep two apart in this scene</b>: <select aria-label="One of the two">${opts(cast, a)}</select> and <select aria-label="The other">${opts(cast, b)}</select>${k > 0 ? ` <label class="check"><input type="checkbox"> and the scenes before it</label>` : ""} <button type="button" class="crit-btn" data-crit-act="${go}">Keep them apart</button></p>
      <p class="note">Ken's third kind of criticism (pp. 189–191): “this post-condition could be added to all the methods in that scene and it could be remade”. Every way of showing that would bring the two together is set aside, as a prerequisite not met.</p></div>`);
  }
  for (const offer of startFarOffers(run, sc)) {
    const others = offer.partners;
    const go = critAction(run, (btn) => {
      const from = btn.closest(".crit-far").querySelector("select").value;
      criticize(run, { kind: "start-far", scene: sc.id, who: offer.who, from, said: `Have ${unmark(who(offer.who))} start far from ${unmark(who(from))}` });
    });
    const kw = meet(run.story, offer.who);
    parts.push(`<div class="crit-far"><p><b>Start far from</b>: ${name(offer.who)} ${agree(kw, "starts", "start")} where ${esc(sceneTitleOf(run, run.sceneIds[k - 1]))} left ${kw.her}, though ${kw.she} had no part in it. Have ${kw.her} start far from <select aria-label="Far from whom">${opts(others, offer.from)}</select> <button type="button" class="crit-btn" data-crit-act="${go}">Start far</button></p>
      <p class="note">Ken's remedy for No Longer Kept Apart (p. 69): “have the fairy godmother start far from Cinderella”. PLACE places ${kw.her} far off and off the stage, and ${kw.she} ${agree(kw, "walks", "walk")} on.</p></div>`);
  }
  if (!parts.length) return "";
  return `<details class="crit-scene"${open ? " open" : ""}><summary>Criticize ${esc(sc.title)} as a whole</summary><div class="body">${parts.join("")}</div></details>`;
}

// ---- Ken's examples

const KEN_NLKA = "(undoes fairy-godmother (from-scene kept-apart (convey (prevents step-mother (meets cinderella prince)))))";
// "Try criticizing": Ken's own, for a film of his story that has the parts they name.
function kenExamples(run) {
  if (!sameStory(RUNS[0], run)) return [];
  const has = (id, d) => { const sc = run.scenes[run.sceneIds.indexOf(id)]; return ready(sc) && sc.glass.tasks.some((t) => AniCritic.taskDescription(t) === d); };
  const out = [];
  if (has("no-longer-kept-apart", KEN_NLKA)) {
    out.push(["No Longer Kept Apart is too quick", [{ kind: "pace", scene: "no-longer-kept-apart", tasks: [KEN_NLKA], direction: "too-quick", said: "Too quick: allocate more time for this scene" }], "p. 69"]);
    out.push(["the fairy godmother should start far from Cinderella", [{ kind: "start-far", scene: "no-longer-kept-apart", who: "fairy-godmother", from: "cinderella", said: "Have the fairy godmother start far from Cinderella" }], "p. 69"]);
  }
  if (run.sceneIds.slice(0, 2).join() === "introduction,kept-apart" && onStage(run, run.scenes[0]).includes("prince")) {
    out.push(["Cinderella is not to meet the Prince until the third scene", [{ kind: "keep-apart", scenes: ["introduction", "kept-apart"], between: ["cinderella", "prince"], said: "Cinderella is not to meet the Prince until the third scene" }], "p. 64"]);
  }
  return out;
}
function tryCriticizing(run) {
  if (!remakeable(run)) return "";
  const ex = kenExamples(run);
  if (!ex.length) return "";
  const links = ex.map(([label, items, page]) => {
    const k = critAction(run, () => { for (const it of items) criticize(run, it); });
    return `<button type="button" class="linkish" data-crit-act="${k}">${esc(label)}</button> <span class="was">(${page})</span>`;
  });
  return `<p class="note crit-try">Try criticizing the film as Ken suggested: ${links.join(" · ")}. Or click a character for “Not this way” and “Too quick”.</p>`;
}

// ---- "Your criticism", and the remake

function critBox(run, { compact = false } = {}) {
  if (!AniCritic || !run) return "";
  const record = critRecord(run), pending = pendingOf(run);
  const note = critNote.run === run && critNote.text ? `<p class="note crit-added" aria-live="polite">${esc(critNote.text)}</p>` : "";
  if (critNote.run === run) critNote.text = "";
  const try_ = compact ? "" : tryCriticizing(run);
  if (!record.length && !pending.length) {
    if (compact) return note ? `<div class="crit" id="crit">${note}</div>` : "";
    return try_ || note ? `<div class="crit" id="crit"><p class="label">Your criticism</p>${note}${try_}${critAboutBox()}</div>` : "";
  }
  const rows = [];
  for (const c of pending) {
    const was = record.find((x) => sameCrit(x, c));
    const state = !was ? "new" : sameItem(was, c) ? "heeded" : "changed";
    const k = critAction(run, () => { setPending(run, AniCritic.removeCriticism(pendingOf(run), c.id)); renderSide(); });
    rows.push(`<li class="crit-${state}">${critWords(run, c)} <span class="crit-state">${state === "new" ? "not yet heeded" : state === "changed" ? "changed, not yet heeded" : "heeded in this film"}</span> <button type="button" class="linkish" data-crit-act="${k}">Take it back</button></li>`);
  }
  for (const c of record.filter((x) => !pending.some((y) => sameCrit(x, y)))) {
    const k = critAction(run, () => { const p = pendingOf(run); setPending(run, [...p, c].sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)))); renderSide(); });
    rows.push(`<li class="crit-taken"><s>${critWords(run, c)}</s> <span class="crit-state">taken back: the remake makes the film without it</span> <button type="button" class="linkish" data-crit-act="${k}">Keep it</button></li>`);
  }
  const busy = RUNS[1] && RUNS[1].status && RUNS[1].status.running;
  const changed = critChanged(run);
  const go = critAction(run, () => startRemake(run));
  const plan = !remakeable(run) ? "This film wasn't made to its end, so it can't be remade with criticism: make it again first." : changed ? remakePlan(run) : "Nothing new to heed yet: this film was made with this criticism.";
  return `<div class="crit" id="crit"><p class="label">Your criticism${record.length ? " of this film" : ""}</p>${note}<ul class="crit-list">${rows.join("")}</ul>
    <p class="note">${esc(plan)}</p>
    <div class="actions"><button type="button" class="btn primary crit-go" data-crit-act="${go}"${!changed || busy || !remakeable(run) ? " disabled" : ""}${busy ? ' title="Ani is making a film; remake this one when it has finished, or stop it"' : ""}>Remake with my criticism</button></div>
    ${compact ? "" : try_}${compact ? "" : critAboutBox()}</div>`;
}
// Where criticism comes from, a click away.
const critAboutBox = () => `<details class="crit-about"><summary>About criticizing Ani's films</summary><div class="body"><p class="note">From ${critCite()}: the way Ken improved Ani, finding faulty reasoning and changing the program, “is a good one for constructing Ani but is not a reasonable method for a user trying to control Ani's decisions”; instead “Ani should be extended to accept criticism of the films and their justification.” The revival built his first three kinds: a way of showing vetoed (Ani sets it aside, “removing those alternatives that were vetoed by the user”), a part too quick or too slow (half as long again, or a third shorter, within the time the story gives the scene), and two characters kept apart in a scene, with his remedy of starting one far from another. ${fileLink("critic")}</p>
  <p class="note">Your criticism is kept with this film, not in its story and never in Ani's knowledge: a criticism is of how Ani made the film, not of what it is to show. Knowledge Ani lacks, true of any character in any story (“helping can look like going along with”), isn't a criticism of this film: <button type="button" class="linkish" data-teach-open="">Teach Ani instead</button>. Ani is remade from the first scene criticized; a later scene whose plan comes out the same keeps its film. That is the revival's stand-in, at the film's scale, for Ken's “unless necessary no other parts of the film” (p. 64), until Ani can hold a scene's other parts as they were (a later stage). If Ani stops on the way, the film is kept as it was from that scene on, and says why. Where Ani can't do what you ask, it says why; and of what it has no notion of, Ken wrote ${P191} (p. 191).</p></div></details>`;

// The remake: a new film, the reader's version, made from the film's working files with
// the record pending, beside the film it was remade from.
let critTemp = 0;
function startRemake(orig) {
  if (!remakeable(orig) || (RUNS[1] && RUNS[1].status && RUNS[1].status.running)) return;
  const record = pendingOf(orig).map((c) => ({ ...c }));
  const fps = runFps(orig);
  const ken = orig === RUNS[0];
  const files = filesOf(orig);
  // the film it was remade from, to put beside it
  let ref = "ken";
  if (!ken) {
    let id = orig.libId;
    if (!id) id = `kept-${++critTemp}`;
    LIB_RUNS.set(id, orig);
    ref = `lib:${id}`;
  }
  const previous = {
    choices: orig.raw.choicePoints.length, choicePoints: orig.raw.choicePoints, scenes: orig.raw.scenes.map((s) => ({ id: s.id, ...(s.error ? { error: s.error } : { film: s.film, glass: s.glass }) })),
    ...(runExtensions(orig).length ? { extensions: runExtensions(orig) } : {}), criticism: critRecord(orig),
    ...(files ? { files } : {}), ...(orig.raw.changes ? { changes: orig.raw.changes } : {}), ...(orig.raw.repairs ? { repairs: orig.raw.repairs } : {}), ...(orig.raw.appearances ? { appearances: orig.raw.appearances } : {}),
    // a film made with the reader's knowledge is remade with it, as it was (Teach Ani)
    ...(orig.knowledge && orig.knowledge.length ? { knowledge: orig.knowledge } : {}),
  };
  const run = makeRun({ label: record.length ? `${yoursLabel(runExtensions(orig))}, remade with your criticism` : `${yoursLabel(runExtensions(orig))}, remade without criticism`, short: "Yours", cindy: orig.cindy, choicePoints: orig.raw.choicePoints, extensions: runExtensions(orig), repairs: orig.raw.repairs, appearances: orig.raw.appearances, changes: orig.raw.changes, tidied: orig.tidied, told: orig.told });
  run.fps = fps;
  run.criticism = record;
  run.pending = record.map((c) => ({ ...c }));
  if (orig.knowledge && orig.knowledge.length) run.knowledge = orig.knowledge;
  run.remadeFrom = { ken, fps, id: ken ? null : orig.libId || null, title: ken ? "Ani's 1978 film" : (orig.libId && libraryTitle(orig.libId)) || orig.label, made: (orig.status && orig.status.made) || null, print: ken ? null : printOf(orig) };
  run.remaking = { from: files ? critFrom(orig, record) : 0, fromScratch: !files };
  run.keptHow = {};
  // the film remade from has its own record again, if it is looked at later
  if (ken) KEN_PENDING[fps] = [];
  else orig.pending = null;
  startRun(ken ? null : orig.cindy, fps, runExtensions(orig), { run, remake: { previous, criticism: record }, pair: [ref, "cur"] });
}

// ---- the glass box: what the criticism did here

// "6 to 15 seconds", "4.29 to 10.71 seconds"
const secondsSpan = (a, b) => `${+Number(a).toFixed(2)} to ${+Number(b).toFixed(2)} seconds`;
const nForm = (x) => (x === null || x === undefined ? null : parse(x));
// One note of CRITIC's in a sentence (HTML): where a criticism was heeded, or couldn't be.
function critNoteSentence(run, sc, n, { withSaid = true } = {}) {
  const item = critItem(run, n.id);
  const said = withSaid ? saidWords(item) : "";
  const was = nForm(n.was), now = nForm(n.now), because = lispList(nForm(n.because));
  const w = whyOf(run, sc);
  if (n.what === "another-way") {
    return because[1] === "convey"
      ? `Ani set aside showing that ${critAbout(run, sc, was)}, vetoed by you, and established it some other way, if it knew one.${said}`
      : (sc.glass.tasks.find((t) => t.name === n.actor) || { variables: {} }).variables.status === "cant-do" ? `Ani set aside ${wayQ(was)}, vetoed by you, and had no other way left.${said}`
      : `Ani set aside ${wayQ(was)}, vetoed by you, and chose among the ways left.${said}`;
  }
  if (n.what === "keep-apart") {
    const [, a, b, level] = because;
    return `Ani set aside ${level === "convey" ? `showing that ${critAbout(run, sc, was)}` : wayQ(was)}: it would bring ${who(a)} and ${who(b)} together, which you said they must not do in this scene (kept apart by you).${said}`;
  }
  if (n.what === "pace") {
    const quick = because[0] === "too-quick";
    const k = because.indexOf("held-to"), held = k >= 0 ? lispList(because[k + 1]) : null;
    const a = because.indexOf("after"), adjusted = a >= 0 ? lispList(because[a + 1]) : null;
    const part = w && w.parts.find((p) => p.tasks.includes(n.actor));
    // the walks: SCENE stretches them by the part's time over Ani's ideal for it, so without
    // the criticism they would have been stretched by as much less (or more) as the time
    const s1 = part && part.stretchedBy, s0 = s1 && n.heeded ? (s1 * Number(was)) / Number(now) : null;
    const fmt = (x) => +x.toFixed(2);
    const stretched = s1 && s0 && Math.abs(s1 - s0) > 0.005 ? `, the walks ${s1 > s0 ? "slowed" : "sped up"} to fit (stretched by ${fmt(s1)}, where they were ${fmt(s0)})` : "";
    // held-to (length-bounds l m): with FIT, the scene kept within the time its length gives it
    const bound = held ? (held[0] === "allocated-time" ? `${secondsSpan(held[1], held[2])}, the time your story gives this part` : held[0] === "length-bounds" ? `${secondsSpan(held[1], held[2])}, the time your story gives this scene, which the revival holds it to` : `SCENE's own limit: a part's walks are stretched no more than ${Number(held[1]) > 1 ? "8 times" : "to an eighth of"} Ani's ideal for them`) : "";
    const byStory = held && (held[0] === "allocated-time" || held[0] === "length-bounds");
    // the scene's adjustment was FIT's hold of the scene's time (its scene-time-kept note), or Ken's
    const fitted = [...(sc.glass.repairs || []), ...((sc.film && sc.film.repairs) || [])].some((r) => /what scene-time-kept /.test(r.note));
    const after = adjusted ? (fitted ? ` The revival had first held the scene to the time its length gives it (FIT, Ken's decision of 16 October), which gave this part ${sec(Number(was))}; Ani heeded your criticism on the time that left it.` : ` Ken's SCENE had first fitted the whole scene to its length (adjust-task-lengths, chomet.123:140-185), which gave this part ${sec(Number(was))}; Ani heeded your criticism on the time that left it.`) : "";
    if (!n.heeded) return `You said this part was too ${quick ? "quick" : "slow"}, but it already takes ${quick ? "all the" : "the least"} time ${byStory ? "your story gives it" : "SCENE allows it"} (${esc(bound)}), so Ani left it at ${sec(Number(was))}.${after}${said}${quick && byStory ? longerButton(run, sc.id) : ""}`;
    return `You said this part was too ${quick ? "quick" : "slow"}: Ani gave it ${sec(Number(now))} instead of ${sec(Number(was))}${stretched}${held ? `; held to ${esc(bound)}${quick && byStory ? ": this part already takes all the time your story gives the scene" : ""}` : ""}.${after}${said}${held && quick && byStory ? longerButton(run, sc.id) : ""}`;
  }
  if (n.what === "start-far") {
    const c = item && item.who, from = item && item.from;
    const k = c ? meet(run.story, c) : { she: "she", her: "her" };
    const name = c ? cap(who(c)) : "She";
    if (!n.heeded && because[0] === "already-in-the-scene") return `${name} already had a part earlier in this scene, on the stage, when PLACE placed ${k.her} with ${from ? who(from) : "the other"}, so Ani didn't move ${k.her} far off mid-scene: there was no start to make far.${said}`;
    if (!n.heeded && because[0] === "already-far") return `PLACE already places ${who(c || "")} far from ${from ? who(from) : "the other"} here, as Ken's code would without your criticism (place-large-distance-apart), so your criticism changed nothing here.${said}`;
    return `${name} was placed ${using(run, () => place(now))}, because you asked that ${k.she} start far from ${from ? who(from) : "the other"}; PLACE chose where${Array.isArray(was) && was[0] === "xy-position" ? `, where before ${k.she} was where the last scene left ${k.her}` : ""}.${said}`;
  }
  return esc(n.note);
}
// The tasks of a scene Ani could no longer do once it heeded a criticism (status cant-do,
// with a note of CRITIC's on them): "No other way to ... was left".
function critCantDo(run, sc) {
  const notes = sc.glass.criticism || [];
  return sc.glass.tasks.filter((t) => t.variables.status === "cant-do" && notes.some((n) => n.actor === t.name && n.heeded)).map((t) => {
    const i = taskInfo(t);
    const set = notes.filter((n) => n.actor === t.name && n.heeded);
    const ways = set.map((n) => (lispList(nForm(n.because)).includes("convey") ? `showing that ${critAbout(run, sc, nForm(n.was))}` : wayQ(nForm(n.was))));
    const apart = set.find((n) => n.what === "keep-apart");
    const why = apart ? (() => { const [, a, b] = lispList(nForm(apart.because)); return `: the ${ways.length > 1 ? "ways" : "way"} Ani knew ${ways.length > 1 ? "all bring" : "brings"} ${who(a)} to ${who(b)}`; })() : `: ${words(ways)} ${ways.length > 1 ? "were" : "was"} set aside`;
    const ext = runExtensions(run);
    // what the revival's knowledge would do instead, where the revival has seen it
    const verb = Array.isArray(i.description) ? i.description[0] : null;
    const hint = i.description && show(i.description) === "(personality cinderella)" && !ext.includes("slips") ? " With the revival's KNOW and SLIPS, Ani has Cinderella help her stepmother instead (the revival's trial of Ken's footnote)."
      : !ext.includes("know") && KNOWN && typeof verb === "string" && KNOWN.verbs[verb] ? ` With the revival's knowledge (KNOW), Ani would show ${esc(VERB_ING[verb] || plain(verb))} by ${esc(plain(KNOWN.verbs[verb].method))}.` : "";
    // what Ani lacks is knowledge, not a criticism of this film: Teach Ani a way of showing the verb
    const teach = typeof verb === "string" && AniTeach.VERBS[verb] ? ` <button type="button" class="linkish" data-teach-open="${esc(JSON.stringify({ kind: "way", fields: { verb } }))}">Teach Ani instead</button>: another way of showing ${esc(VERB_ING[verb] || plain(verb))}, for every film you make with your knowledge.` : "";
    return `No other way ${using(run, () => asOf(sc.id, () => taskText(i.kind, i.description)))} was left${why}; Ani has no other way to show this with what it knows, and leaves it (its own warning, “can't do”).${hint}${teach}`;
  });
}
// "What your criticism did here", in the glass box: this character's first.
function critHere(run, sc, char) {
  const notes = (sc.glass && sc.glass.criticism) || [];
  if (!notes.length) return "";
  const mentions = (n) => `${n.was} ${n.now} ${n.because}`.split(/[\s()]+/).includes(char) || (critItem(run, n.id) || {}).who === char;
  const lines = [...notes.filter(mentions), ...notes.filter((n) => !mentions(n))].map((n) => critNoteSentence(run, sc, n));
  const cant = critCantDo(run, sc);
  return `<details class="crit-here" open><summary>What your criticism did here (${lines.length + cant.length})</summary><div class="body"><ul class="fixes crit-fixes">${[...lines, ...cant].map((x) => `<li>${x}</li>`).join("")}</ul>
    <p class="note">Ani heeded your criticism where its own code chooses, as ${critCite()} proposes; nothing of it became Ani's knowledge. ${fileLink("critic")} ${fileLink("critpc")} ${fileLink("critsc")}</p></div></details>`;
}
// A way set aside by a criticism, as rejectText says it (R is the film's): vetoed by you,
// with your own words if you gave any (not a button's label, which says no more).
function critReject(r) {
  if (!Array.isArray(r)) return null;
  if (r[0] === "vetoed-by-you") {
    const item = R && critItem(R, r[1]);
    return `vetoed by you${item && item.said && !BUTTON_WORDS.has(item.said) ? `, who said “${esc(item.said)}”` : ""}`;
  }
  return null;
}
// One of a way's prerequisites not met, in words (Ken's, from PREREQ and DISPLY, and the
// reader's kept-apart-by-you): "the fairy godmother isn't faster than the stepmother".
function prereqWords(p) {
  if (!Array.isArray(p)) return esc(plain(String(p)));
  const [h, a, b] = p;
  if (h === "kept-apart-by-you") return `it would bring ${who(a)} and ${who(b)} together, which you said they must not do in this scene (kept apart by you)`;
  if (h === "faster") return `${who(a)} isn't faster than ${who(b)}`;
  if (h === "dominates") return `${who(a)} doesn't dominate ${who(b)}`;
  if (h === "can-move") return `${who(a)} can't move ${Array.isArray(b) ? place(b) : who(b)}`;
  if (h === "pen-down-for") return `${who(a)} has no pen down to leave a trail (a prerequisite Ken left as a dummy, prereq.19:64)`;
  if (h === "on-stage") return `${who(a)} isn't on the stage`;
  if (h === "drawn-to") return `${who(a)} isn't drawn to ${who(b)}`;
  // any other: its words, without the Lisp's brackets
  return esc(plain(show(p).replace(/[()]/g, " ").replace(/\s+/g, " ").trim()));
}
// A reason a way was set aside that rejectText words no other way: prerequisites not met
// (Ken's, and the reader's keep-apart), a need for more time than the part has, or no way
// for Director to run it (REVIVE;MEND14's). Null for anything else.
function rejectWords(r) {
  if (!Array.isArray(r)) return null;
  if (r[0] === "prerequisites-not-met") {
    const ps = lispList(r[1]);
    return ps.length ? words(ps.map(prereqWords)) : "a prerequisite of it isn't met";
  }
  if (r[0] === "need-more-time:") {
    const d = Number(kv(r, "ideal-difference")), w = Number(kv(r, "will-accept"));
    return `it needs more time than the part has: ideally ${sec(Math.abs(d))} more, ${sec(Math.abs(w))} more at the least`;
  }
  if (r[0] === "no-run-receiver") return `Director has no way to run ${esc(plain(String(r[1])))} (Ken's DISPLY never gives it one; the revival's repairs set it aside)`;
  return null;
}
// The pace note on a task, for "How Ani timed it".
function critTiming(run, sc, taskName) {
  const n = ((sc.glass && sc.glass.criticism) || []).find((x) => x.actor === taskName && x.what === "pace");
  return n ? critNoteSentence(run, sc, n) : "";
}
// Where a character was placed far off by a criticism, for "Where she started this part".
function critStart(run, sc, subName, char) {
  const n = ((sc.glass && sc.glass.criticism) || []).find((x) => x.actor === subName && x.what === "start-far" && (critItem(run, x.id) || {}).who === char);
  return n ? `<p class="made-with">${critNoteSentence(run, sc, n)}</p>` : "";
}

// ---- "What your criticism changed", beside the film it was remade from

// Whether b was remade from a (Ken's film at its rate, or one of the reader's films).
function remadeFrom(a, b) {
  const r = b && b.remadeFrom;
  if (!a || !r || a === b) return false;
  if (r.ken) return a === RUNS[0] && runFps(a) === r.fps;
  return (!!r.id && a.libId === r.id) || (!!r.print && printOf(a) === r.print) || [...LIB_RUNS.entries()].some(([id, x]) => x === a && (id === r.id || (!r.id && /^kept-/.test(id) && x.status && x.status.made === r.made)));
}
const OUTCOME = { met: "Met", partly: "Partly met", "not-met": "Not met", "not-reached": "Not reached", stopped: "Couldn't be made" };
// A scene's title in the middle of a sentence: "the Introduction", "the Meeting".
const midTitle = (run, id) => sceneTitleOf(run, id).replace(/^The /, "the ");
function critOutcome(run, sc0, c) {
  const item = c.item;
  const out = [];
  const scOf = (id) => run.scenes[run.sceneIds.indexOf(id)];
  if (c.outcome === "stopped" && c.stopped) {
    // Ani stopped: the film remade from is kept from that scene on (src/pipeline.js remakeFilmSteps)
    const at = c.stopped.scene, why = whyStopped(run, c.stopped.error, (run.stoppedTyped || {})[at] || [], at).text;
    const own = criticismScenesOf(item).includes(at);
    out.push(`Ani stopped planning ${esc(midTitle(run, at))} again with your criticism: ${why} So ${esc(midTitle(run, at))}${run.sceneIds.indexOf(at) < run.sceneIds.length - 1 ? " and the scenes after it are" : " is"} kept as the film remade from had ${run.sceneIds.indexOf(at) < run.sceneIds.length - 1 ? "them" : "it"}, and your criticism couldn't be heeded${own ? "" : ` in ${esc(words(criticismScenesOf(item).map((id) => midTitle(run, id))))}`}.`);
    return out;
  }
  for (const n of c.notes) { const sc = scOf(n.scene); if (sc) out.push(critNoteSentence(run, sc, n, { withSaid: false })); }
  // the tasks it left with no way (a veto's, a keep-apart's), not another kind's
  for (const x of item.kind === "another-way" || item.kind === "keep-apart" ? c.cantDo || [] : []) {
    const sc = scOf(x.scene);
    if (sc) out.push(...critCantDo(run, sc).filter((s, k, all) => all.indexOf(s) === k && !out.includes(s)));
  }
  if (item.kind === "keep-apart" || (item.kind === "another-way" && item.level === "convey")) for (const id of criticismScenesOf(item)) out.push(...critConveyLeft(run, scOf(id), critPrevScene(run, id)));
  if (item.kind === "another-way" && c.outcome === "not-met" && !out.some((x) => /^No other way /.test(x))) out.push("Not met: no other way. Ani set your way aside and had no other way left to show it, so it leaves this part out.");
  if (item.kind === "pace" && c.pace && c.pace.before && c.pace.after) {
    const by = c.pace.before.film !== null && c.pace.after.film !== null ? "film" : "planned";
    const b = c.pace.before[by], a = c.pace.after[by];
    const was = by === "film" ? "In the film this part ran" : "Ani planned this part for";
    const same = Math.abs(a - b) < 0.01, wrong = item.direction === "too-quick" ? "quicker" : "slower", wanted = item.direction === "too-quick" ? "slower" : "quicker";
    out.push(`${was} ${sec(a)}, where in the film remade from it was ${sec(b)}${c.outcome !== "not-met" ? "" : same ? `: no ${wanted}` : `: ${wrong}, not ${wanted}`}.`);
  }
  if (item.kind === "keep-apart") {
    for (const x of c.closest || []) {
      const t = esc(midTitle(run, x.scene));
      if (x.distance === null) out.push(`In ${t} they are never on the picture together.`);
      else if (x.distance < AniCritic.SMALL_DISTANCE) out.push(`But in the film of ${t} they come within ${x.distance} of the screen of each other (frame ${x.frame}), closer than Ken's small distance, a third of it (place.45:103-105). The plan holds them apart: no walk of one to the other, and no walk of the two together. What brings them close is where they start, or a walk towards the other's whereabouts that isn't to meet, such as the guard's prisoner escaping towards the one she is kept from; the revival's table of ways that bring two together counts walks to contact and walks together, not a walk towards the other's whereabouts (its choice, pending Ken).`);
      else out.push(`In ${t} they come no closer than ${x.distance} of the screen (frame ${x.frame}), more than Ken's small distance, a third of it.`);
    }
    for (const x of c.contacts || []) out.push(`A walk in ${esc(midTitle(run, x.scene))} still brings them together (${esc(plain(String(x.plan || x.how)).replace(/[()]/g, ""))}), which the revival's table of such ways missed.`);
    // a scene the criticism empties: the design's sentence (section 8)
    for (const id of item.scenes) {
      const sc = scOf(id), was = critPrevScene(run, id);
      if (!ready(sc) || !was || !was.glass) continue;
      const parts = was.glass.tasks.filter((t) => t.variables.parent === "convey-task").map(AniCritic.taskDescription);
      const now = new Map(sc.glass.tasks.map((t) => [AniCritic.taskDescription(t), t.variables.status || "made"]));
      const lost = parts.filter((d) => !now.has(d) || now.get(d) === "cant-do");
      if (parts.length && lost.length * 2 > parts.length) out.push(`Most of ${esc(midTitle(run, id))} couldn't be made without bringing ${who(item.between[0])} and ${who(item.between[1])} together; that is what ${esc(midTitle(run, id))} is for. Perhaps this is a change to the story.`);
    }
  }
  if (item.kind === "start-far" && c.start && c.start.frame !== null) {
    if (c.start.walkedOn) out.push(`In the film ${who(item.who)} is first seen off the picture (frame ${c.start.frame}) and walks on.`);
    else if (!c.notes.length) {
      const sc = scOf(item.scene), with_ = sc && ready(sc) ? placedWith(run, sc, item.who) : [];
      out.push(`PLACE never placed ${who(item.who)} and ${who(item.from)} as a pair in ${esc(midTitle(run, item.scene))}${with_.length && !with_.includes(item.from) ? `: it places ${meet(run.story, item.who).her} with ${words(with_.map((x) => who(x)))} here` : ""}, so there was nothing to start far from; ${meet(run.story, item.who).she} is on the picture from frame ${c.start.frame}.`);
    } else out.push(`In the film ${who(item.who)} is on the picture from the first (frame ${c.start.frame}).`);
  }
  if (c.outcome === "not-reached") out.push(item.kind === "start-far" ? `${cap(who(item.who))} never comes on in ${esc(midTitle(run, item.scene))}, so there was nothing to place far off.`
    : item.kind === "another-way" ? `Ani didn't weigh ${esc(plain(item.vetoes))} for that part this time, so there was nothing to set aside.`
    : "Nothing it names was planned in the scenes remade.");
  return [...new Set(out)];
}
const criticismScenesOf = (item) => AniCritic.criticismScenes(item);
// What an establish task of a scene shows now, where the criticism left it fewer convey
// methods than the film remade from: "To establish what Cinderella is like, Ani now shows
// only that Cinderella helps the Prince, which it has no way to show (as in 1978), so none
// of it is on the screen."
function critConveyLeft(run, sc, was) {
  if (!ready(sc) || !was || !was.glass) return [];
  const methods = (t) => lispList(parse(t.variables["current-choice"] || "nil")).filter((m) => Array.isArray(m) && m[0] === "method:").map((m) => show(kv(m, "value")));
  const out = [];
  for (const t of sc.glass.tasks) {
    if (t.variables.parent !== "establish-task") continue;
    const d = AniCritic.taskDescription(t);
    const b = was.glass.tasks.find((x) => AniCritic.taskDescription(x) === d);
    if (!b) continue;
    const now = methods(t), before = methods(b);
    if (!before.length || now.length >= before.length || now.some((m) => !before.includes(m))) continue;
    const shown = now.map((m) => sc.glass.tasks.find((x) => AniCritic.taskDescription(x) === m && x.variables.parent === "convey-task"));
    const none = shown.every((x) => !x || x.variables.status === "cant-do");
    const i = taskInfo(t);
    out.push(`${cap(using(run, () => asOf(sc.id, () => taskText(i.kind, i.description))))}, Ani now shows ${now.length ? `only that ${words(now.map((m) => critAbout(run, sc, parse(m))))}` : "nothing"}${now.length && none ? `, which it has no way to show${runExtensions(run).length ? "" : " (as in 1978)"}, so none of it is on the screen` : ""}.`);
  }
  return out;
}
// The scene of the film a run was remade from, if it is one of the films on the page.
function critPrevScene(run, id) {
  const from = [RUNS[0], ...LIB_RUNS.values()].find((a) => a && remadeFrom(a, run));
  return from ? from.scenes[from.sceneIds.indexOf(id)] : null;
}
function critChangedSection(a, b) {
  if (!AniCritic || !remadeFrom(a, b)) return "";
  const running = b.status && b.status.running;
  const prev = { scenes: a.raw.scenes.filter(Boolean) };
  const now = { scenes: b.raw.scenes.filter(Boolean), criticism: critRecord(b), remade: b.remade || { scenes: Object.entries(b.keptHow || {}).map(([id, how]) => ({ id, how: how === "before" ? "kept" : how })) } };
  let ch;
  try { ch = using(b, () => AniCritic.criticismChanges(prev, now)); } catch (e) { console.error(e); return ""; }
  const taken = critRecord(a).filter((x) => !critRecord(b).some((y) => sameCrit(x, y)));
  const items = ch.criticism.map((c) => `<li class="crit-outcome ${esc(c.outcome)}"><span class="crit-verdict">${OUTCOME[c.outcome] || esc(c.outcome)}</span> ${critWords(b, c.item)}${running ? "" : `<ul class="crit-why">${critOutcome(b, null, c).map((s) => `<li>${s}</li>`).join("")}</ul>`}</li>`);
  for (const c of taken) items.push(`<li class="crit-outcome taken"><span class="crit-verdict">Taken back</span> ${critWords(a, c)}: made again without it.</li>`);
  const HOW = { kept: "kept as it was, before the first scene criticized", unchanged: "planned again: the same program, so its film is kept (Director's film is a function of the program alone)", refilmed: "planned again and filmed again", failed: "planned again, and Ani stopped", stopped: "Ani stopped planning it again with your criticism, so it is kept as it was, its working files with it", "after-stop": "kept as it was: Ani stopped in a scene before it, which it starts from" };
  const scenes = ch.scenes.map((s) => {
    const t = esc(sceneTitleOf(b, s.id));
    const fr = s.frames.before !== null && s.frames.after !== null && s.how === "refilmed" ? `: ${s.frames.before} frames, now ${s.frames.after}` : "";
    const tasks = s.tasks.map((x) => {
      const d = critAbout(b, b.scenes[b.sceneIds.indexOf(s.id)], parse(x.description));
      const side = (y) => (!y ? "not there" : y.status === "cant-do" ? "couldn't be done" : y.choice === "nil" ? "nothing chosen" : `${words(lispList(parse(y.choice)).map((m) => (Array.isArray(m) && m[0] === "method:" ? `showing that ${critAbout(b, null, kv(m, "value"))}` : using(b, () => methodText(m)))))}${y.runningTime !== null ? ` (${sec(y.runningTime)})` : ""}`);
      return `<li>${cap(d)}: ${side(x.before)}; now ${side(x.after)}.</li>`;
    }).join("");
    return `<li><b>${t}</b>: ${esc(HOW[s.how] || (running ? "not made yet" : "made"))}${fr}.${tasks ? `<ul class="changes">${tasks}</ul>` : ""}</li>`;
  }).join("");
  const left = state.view === "both" && screenRun(0) === a ? "left" : "right";
  return `<div class="crit-changed"><p class="label">What your criticism changed</p>
    <p class="note">${esc(b === RUNS[1] ? "Your version" : b.label)} was remade from ${a === RUNS[0] ? "Ken's 1978 film" : `“${esc(a.label)}”`} (on the ${left}) with your criticism${running ? "; Ani is still making it" : ""}.</p>
    <ul class="crit-outcomes">${items.join("")}</ul>
    <details${running ? " open" : ""}><summary>Scene by scene</summary><div class="body"><ul class="changes crit-scenes">${scenes}</ul></div></details>
    <p class="note">How Ani heeded it, a click away on each screen: click a character for “What your criticism did here”. From ${critCite()}.</p></div>`;
}
