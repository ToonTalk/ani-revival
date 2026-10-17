// Check the revival's extensions that are meant to change Ken's Cinderella
// (src/pipeline.js EXTENSIONS, changes1978) against what they should make, and against
// 1978 where they should leave it alone. For APPEAR (the default), Ani choosing how its
// characters look (reports/chapter-x/PLAN.md, "Items 1 and 2"), it asserts:
//   - pass 1: KEN;CP 30 has CP 29's 102 choices, by name and value, in CP 29's order,
//     and every other choice is one of the extension's (an appearance element's, or a
//     relative appearance element's); KEN;CP 30 is reports/ext/appear/ken-cp.30, and
//     pass 1's appearances (src/glassbox-pass1.js collectAppearances) are
//     reports/ext/appear/appearances.json;
//   - pass 2, scene by scene, each starting from where the 1978 film left the
//     characters (reports/pass2's POSIT files, as tools/check-1978.mjs --quick has
//     them): its program, once the looks written at its end are taken off, and its
//     summary (KEN1;<fn1> MINI) and printout are byte for byte reports/pass2's, its
//     glass box, without its looks, is reports/pass2/<scene>.glass.json, and what
//     follows 1978's program is exactly the take-look forms, one for each character,
//     as pass 1 chose its look (REVIVE;APPEAR take-look-forms), each printed on a line
//     of its own as dicks-print prints every form of the program; with the changes of
//     look pass 2 planned (REVIVE;ALTER: joy's look-change: methods, and what each
//     adds to its subscene's changes, (gradually change look ...)) taken out of the
//     program, the summary, the printout and the glass box too, so that the look
//     changes are seen to move no method, time or place;
//   - the duration guard: the look changes lengthen nothing. Kept Apart, filmed again
//     with its look changes taken out of its program, from where the Introduction
//     left the characters, makes the same frames and events, and its joy subscene (the
//     third, a parasite on the second, whose changes run beside its movements,
//     action.152:41) ends on the same frame; at 4 frames a second against 1978's
//     positions, and at the rate given against the chained film's; and, at 4 frames
//     a second, the first scene of test/stories/stress/pushed-around.lisp, the
//     tortoise and the hare, whose hare is very happy and moves alone at first, where
//     a look change that ticked on the character would have moved it elsewhere
//     (REVIVE;LOOKS look-change-carrier);
//   - the whole film, chained, at 4 frames a second (pass 1, then each scene's pass 2
//     and filming, each starting from where the last filming left the characters, as
//     the film page makes it): each scene's program, summary, printout, glass box,
//     film (frames, events and looks) and POSIT file are those in reports/ext/appear/.
//     Director's collisions use the characters' sizes (dichar.103:348-358), so these
//     differ from 1978's; reports/ext/appear/README.md says how and why.
// For KNOW (--extensions know, with MEND, which it requires), knowledge Ken could have
// added (reports/chapter-x/PLAN.md, "Item 4, part 2"), it asserts:
//   - pass 1: KEN;CP 30 is byte for byte reports/pass1-choices.txt, CP 29's 102 choices
//     in place, and its choice points and their reasons are app/data/pass1.json's: KNOW
//     adds no choice and moves none (test/know.test.js checks the rule that keeps it so);
//     and no repair notes;
//   - pass 2, scene by scene, each starting from where the 1978 film left the
//     characters: No Longer Kept Apart's, the Meeting's and Justice's program, summary,
//     printout and glass box are byte for byte reports/pass2's; the Introduction's and
//     Kept Apart's, which KNOW changes, are those in reports/ext/know/from-1978/;
//   - the whole film, chained, as for APPEAR: each scene's files are those in
//     reports/ext/know/ (or its 24fps/), and reports/ext/know/README.md says how and why
//     they differ from 1978's.
// For SLIPS (--extensions slips, with KNOW and MEND, which it requires), corrections of
// slips in Ken's files, and for DETAIL (--extensions detail, with MEND), a few of the
// "myriad details" (reports/chapter-x/PLAN.md, "Item 4, part 2"), it asserts:
//   - pass 1: KEN;CP 30 is byte for byte reports/pass1-choices.txt, CP 29's 102 choices
//     in place; with DETAIL its choice points and their reasons are app/data/pass1.json's
//     and it leaves no note; with SLIPS they are but for the three of Cinderella's
//     tendencies, which hear friendly now (REVIVE;SLIPS3) and are
//     reports/ext/slips/pass1-tendencies.json, and its notes are those three choice
//     points' friendly-attraction notes;
//   - pass 2, scene by scene, each starting from where the 1978 film left the
//     characters: a scene the extension doesn't change there (SLIPS_CHANGES,
//     DETAIL_CHANGES) has the program, summary, printout and glass box of its reference,
//     for SLIPS KNOW's (its from-1978/, else 1978's reports/pass2), for DETAIL 1978's; one
//     it changes has those in reports/ext/<slips|detail>/from-1978/;
//   - the whole film, chained, as for APPEAR: each scene's files are those in
//     reports/ext/slips/ or reports/ext/detail/ (or its 24fps/), and the README there
//     says how and why they differ from KNOW's (SLIPS) or 1978's (DETAIL).
// For SEEN (--extensions seen, with MEND, which it requires), a part of only changes made
// seen (REVIVE;SEEN, Ken's testing of the film page, 15 October 2026), it asserts:
//   - pass 1 as for DETAIL: as 1978's, with no notes;
//   - pass 2, scene by scene, each starting from where the 1978 film left the
//     characters: the scenes SEEN doesn't change there (SEEN_CHANGES) as 1978's
//     reports/pass2; the Meeting, whose last part, Cinderella's and the Prince's joys,
//     has them wander once their walk to each other ends, in reports/ext/seen/from-1978/;
//   - the whole film, chained, as for APPEAR, against reports/ext/seen/ (or its 24fps/),
//     and in each scene no part of only changes in which no one moves for more than a
//     second (src/pipeline.js whyTheyAct's stills, "only-changes"); reports/ext/seen/
//     README.md says how and why the films differ from 1978's.
// For FIT (--extensions fit, with MEND, which it requires), CHOMET's slips in dividing a
// scene's time corrected (REVIVE;FIT, SLIPS' S15, Ken's decision of 16 October 2026), it
// asserts:
//   - pass 1 as for DETAIL: as 1978's, with no notes;
//   - pass 2, scene by scene, each starting from where the 1978 film left the
//     characters: the scenes FIT doesn't change there (FIT_CHANGES) as 1978's
//     reports/pass2; Kept Apart (29.75 s planned, held to its least, 30), No Longer
//     Kept Apart (3.98 s, held to 10), and the Meeting and Justice, whose stretched
//     walks keep the parent's factor in them (S16, REVIVE;FITSTR), in
//     reports/ext/fit/from-1978/;
//   - the whole film, chained, as for APPEAR, against reports/ext/fit/ (or its 24fps/);
//     reports/ext/fit/README.md says how and why the films differ from 1978's.
// For each, in each scene of the chained film, every walk the revival planned ends with
// its characters on the picture (src/pipeline.js walksOffThePicture: the film's segments
// are the picture's own dots, and a character none of whose lines reach it has none).
// The goldens are in reports/ext/<the ids of the extensions that change Cinderella>, but
// SLIPS's in reports/ext/slips/ and DETAIL's in reports/ext/detail/.
// Usage: node tools/check-ext.mjs [--extensions appear|know|slips|detail|seen|fit] [--quick] [--fps 24] [--save]
//   --quick  skip the chained film (about three of its four minutes)
//   --fps 24 film the chain at 24 frames a second, as the film page does by default,
//            against reports/ext/<ids>/24fps instead (pass 1 is checked as at 4; pass 2
//            from 1978's positions doesn't depend on the frame rate and is left to the
//            check at 4). About 15 minutes.
//   --save   write the chained film's files to reports/ext/<ids>/ (or its 24fps/)
//            instead of comparing them (and pass 1's KEN;CP 30 and appearances, or
//            KNOW's pass 2 from 1978's positions), after checking the rest
// Prints each check with ok or FAIL and its time; exits non-zero if any fails.
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { SCENES, FILE_NAMES, extensionsFor, isAppearanceChoice, pass1, pass2, film, storyPlan, storyOutline, whyTheyAct, walksOffThePicture } from "../src/pipeline.js";
import { choicesOfText, choicesOfItsFile, compareChoices } from "./choices.mjs";

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] || "" : null; };
const chosen = extensionsFor((opt("--extensions") || "appear").split(",").filter(Boolean));
const extensions = chosen.map((e) => e.id);
if (!chosen.some((e) => e.changes1978)) throw new Error(`none of ${extensions.join(", ")} changes Ken's Cinderella: tools/check-1978.mjs --extensions ${extensions.join(",")} checks it`);
// what this check knows each should make: APPEAR's, KNOW's, SLIPS's (with KNOW),
// DETAIL's, SEEN's or FIT's, one at a time (SLIPS requires KNOW and FIT)
const KINDS = ["appear", "know", "slips", "detail", "seen", "fit"];
const asked = KINDS.filter((k) => extensions.includes(k) && !((k === "know" || k === "fit") && extensions.includes("slips")));
const kind = asked.length === 1 ? asked[0] : null;
if (!kind) throw new Error("tools/check-ext.mjs knows what APPEAR should make, what KNOW should, what SLIPS should (with KNOW, which it requires), what DETAIL should, what SEEN should and what FIT should; give it --extensions with one of appear, know, slips, detail, seen and fit");
const quick = args.includes("--quick");
const save = args.includes("--save");
const fps = opt("--fps") === null ? 4 : Number(opt("--fps"));
if (fps !== 4 && fps !== 24) throw new Error("--fps is 4 (the default) or 24");
if (fps === 24 && quick) throw new Error("--quick skips the chained film, so --fps 24 would check only pass 1");
// as tools/check-1978.mjs films: a scene takes six times the frames at 24 that it takes at 4
const frames = fps === 24 ? 6000 : 1000;
const dir = kind === "slips" || kind === "detail" ? `reports/ext/${kind}` : `reports/ext/${chosen.filter((e) => e.changes1978).map((e) => e.id).join("+")}`;
const filmDir = fps === 24 ? `${dir}/24fps` : dir;

const read = (path) => readFileSync(path, "utf8");
const t0 = Date.now();
let failures = 0;
function check(what, problem, seconds = null) {
  const time = seconds === null ? "" : ` (${seconds.toFixed(1)}s)`;
  if (problem) {
    failures++;
    console.log(`FAIL   ${what}${time}: ${problem}`);
  } else console.log(`ok     ${what}${time}`);
}
function run(what, f) {
  const t = Date.now();
  try {
    return { value: f(), seconds: (Date.now() - t) / 1000 };
  } catch (e) {
    check(what, `stopped: ${e.message}${e.where ? ` (at ${e.where})` : ""}`, (Date.now() - t) / 1000);
    return finish();
  }
}
function firstDifference(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return `they differ at character ${i} of ${a.length} (expected ${b.length}): ${JSON.stringify(a.slice(Math.max(0, i - 30), i + 50))}`;
}
const same = (a, b) => (a === b ? null : firstDifference(a, b));
const textIn = (fs, d, fn1, fn2) => {
  const e = fs.find({ dir: d, fn1, fn2 });
  return e ? fs.textOf(e) : "";
};
// A golden of the chained film: written with --save, else compared.
function golden(what, name, text) {
  const path = `${filmDir}/${name}`;
  if (save) {
    writeFileSync(path, text);
    return console.log(`saved  ${what} as ${path}`);
  }
  check(`${what} as ${path}`, existsSync(path) ? same(text, read(path)) : "there is no such file (make it with --save)");
}
function finish() {
  const total = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(failures ? `\n${failures} check${failures > 1 ? "s" : ""} FAILED (${total} s)` : `\nall checks ok (${total} s)`);
  process.exit(failures ? 1 : 0);
}
if (save) mkdirSync(filmDir, { recursive: true });

// The program pass 2 wrote, without the looks REVIVE;APPEAR writes at its end:
// (ASK CINDERELLA TAKE LOOK (LOOK: ...)) and so on, one for each character, each on a
// line of its own as dicks-print writes every form of the program.
const LOOK_FORM = /\n\(ASK [A-Z0-9-]+ TAKE LOOK /;
function withoutLooks(program) {
  const i = program.search(LOOK_FORM);
  return i < 0 ? program : program.slice(0, i);
}
const looksOf = (program) => {
  const i = program.search(LOOK_FORM);
  return i < 0 ? "" : program.slice(i);
};
// A glass box without its looks, which a 1978 glass box doesn't have.
const withoutLooksKey = (glass) => {
  const { looks, ...rest } = glass;
  return rest;
};

// The changes of look pass 2 planned (REVIVE;ALTER) taken out of Lisp printed in a
// program, a summary, a printout or a glass box: each (gradually change look ...),
// (look-change: ...) and (look-change-to: ...), with the space that sets it apart.
const LOOK_CHANGE_HEADS = ["(gradually change look ", "(look-change: ", "(look-change-to: "];
export function withoutLookChanges(text) {
  let out = "";
  let i = 0;
  const lower = text.toLowerCase();
  for (;;) {
    let next = -1;
    for (const h of LOOK_CHANGE_HEADS) {
      const k = lower.indexOf(h, i);
      if (k >= 0 && (next < 0 || k < next)) next = k;
    }
    if (next < 0) return out + text.slice(i);
    let depth = 0, j = next;
    for (; j < text.length; j++) {
      if (text[j] === "(") depth++;
      else if (text[j] === ")" && --depth === 0) break;
    }
    let start = next, end = j + 1;
    if (text[start - 1] === " ") start--;
    else if (text[end] === " ") end++;
    out += text.slice(i, start);
    i = end;
  }
}
// The same for a printout (KEN1;<fn1> PRINT, as save-it-all prints each actor): a line
// about a look change, a variable of its own ("My (TIME-ESTIMATES-FOR (LOOK-CHANGE:
// ...)) is ...") or an item memorized, a suggestion of one, goes, an item with the
// empty line before it that sets it apart; from any other line, the look changes it
// lists go.
export function printWithoutLookChanges(text) {
  const out = [];
  for (const line of text.split("\n")) {
    if (aboutLookChange(line) && /^My \(TIME-ESTIMATES-FOR \(LOOK-CHANGE/i.test(line)) continue;
    if (aboutLookChange(line) && /^\(SUGGESTION: /i.test(line)) {
      if (out.length && out[out.length - 1] === "") out.pop();
      continue;
    }
    out.push(withoutLookChanges(line));
  }
  return out.join("\n");
}
// The same for a glass box: an item or a variable about a look change goes, its looks
// and lookChanges go, and a look change goes from any value that lists it with others.
const aboutLookChange = (s) => LOOK_CHANGE_HEADS.some((h) => s.toLowerCase().includes(h.trim()));
export function glassWithoutLookChanges(x) {
  if (Array.isArray(x)) return x.filter((y) => !(typeof y === "string" && aboutLookChange(y))).map(glassWithoutLookChanges);
  if (x && typeof x === "object") {
    const out = {};
    for (const [k, v] of Object.entries(x)) if (k !== "looks" && k !== "lookChanges" && !aboutLookChange(k)) out[k] = glassWithoutLookChanges(v);
    return out;
  }
  return typeof x === "string" ? withoutLookChanges(x) : x;
}

// The duration guard: Kept Apart filmed from the positions on fs (and its program
// there), and again with its look changes taken out of the program; the first film is
// given, or made. Checks that the two have the same frames and events, and that the
// joy subscene ends on the same frame.
function durationGuard(fs, first, what) {
  const [fn1, fn2] = FILE_NAMES["kept-apart"].split(" ");
  const program = textIn(fs, "KEN", fn1, fn2);
  const changes = (program.match(/\(GRADUALLY CHANGE LOOK /g) || []).length;
  // a file system of its own for each filming, with the program, the answers file and
  // where the Introduction left the characters, so that fs keeps its own POSIT files
  const fsWith = (text) => {
    const out = makeProjectFileSystem();
    for (const e of [["KEN", fn1, fn2], ["KEN", "CP", "30"], ["KEN1", "INTRO", "POSIT"]]) {
      const t = e[0] === "KEN" && e[1] === fn1 ? text : textIn(fs, ...e);
      if (t) out.addFile(e[0], e[1], e[2], { text: t, origin: "the duration guard" });
    }
    return out;
  };
  const with_ = first || run(`kept-apart: filming ${what}, with its look changes`, () => film(fsWith(program), "kept-apart", { extensions, fps, frames }).film).value;
  const w = run(`kept-apart: filming ${what}, without its look changes`, () => film(fsWith(withoutLookChanges(program)), "kept-apart", { extensions, fps, frames }).film);
  const without = w.value;
  const endOf = (f) => (f.events.find((e) => e[1] === "(end-of (subscene-of kept-apart 3))") || [null])[0];
  check(`kept-apart ${what}: ${changes} look change${changes === 1 ? "" : "s"} in the program; the joy subscene ends on frame ${endOf(with_)} with them, ${endOf(without)} without (${fps} frames a second)`,
    !changes ? "there are none to take out" : endOf(with_) !== null && endOf(with_) === endOf(without) ? null : "it ends on another frame", w.seconds);
  check(`kept-apart ${what}: the same ${with_.frames.length} frames and ${with_.events.length} events with and without them`,
    same(JSON.stringify({ frames: with_.frames, events: with_.events }), JSON.stringify({ frames: without.frames, events: without.events })));
}

console.log(`Ani with the extensions ${extensions.join(", ")}, against 1978 and ${filmDir}${quick ? ", without the chained film" : `, the chained film at ${fps} frames a second`}${save ? " (saving the chained film's files)" : ""}\n`);

// ---------------------------------------------------------------- pass 1
const fs1 = makeProjectFileSystem();
const p1 = run("pass 1", () => pass1(fs1, { extensions }));
const cp = textIn(fs1, "KEN", "CP", "30");
if (kind === "know") {
  const ours = cp ? choicesOfText(cp, "KEN;CP 30") : new Map();
  const theirs = choicesOfItsFile("original/7005017/cp.29");
  const c = compareChoices(theirs, ours);
  const a = [...theirs.keys()], b = [...ours.keys()];
  const inPlace = a.filter((k, i) => b[i] === k).length;
  check(`pass 1: ${c.same} of CP 29's ${theirs.size} choices, ${inPlace} in place`,
    c.same === theirs.size && ours.size === theirs.size && inPlace === a.length ? null : `${c.differ.length} differ, ${c.onlyA.length} missing, ${c.onlyB.length} extra`, p1.seconds);
  check("pass 1: KEN;CP 30 as reports/pass1-choices.txt, as in 1978 mode", same(cp, read("reports/pass1-choices.txt")));
  check("pass 1: the choice points and their reasons as app/data/pass1.json has them", same(JSON.stringify(p1.value.choicePoints), JSON.stringify(JSON.parse(read("app/data/pass1.json")).choicePoints)));
  check("pass 1: no repair notes", (p1.value.repairs || []).length ? `${p1.value.repairs.length}, the first ${JSON.stringify(p1.value.repairs[0])}` : null);
}
// SLIPS: pass 1 as 1978's, but for what three of Cinderella's choice points hear
// (REVIVE;SLIPS3); DETAIL, SEEN and FIT: as 1978's
const TENDENCIES = ["attraction-towards-strangers", "attraction-towards-enemies", "attraction-towards-friends"];
const SLIPS_PASS1 = TENDENCIES.map((e) => JSON.stringify(["choice-point-of", "cinderella", e]));
if (kind === "slips" || kind === "detail" || kind === "seen" || kind === "fit") {
  const ours = cp ? choicesOfText(cp, "KEN;CP 30") : new Map();
  const theirs = choicesOfItsFile("original/7005017/cp.29");
  const c = compareChoices(theirs, ours);
  const a = [...theirs.keys()], b = [...ours.keys()];
  const inPlace = a.filter((k, i) => b[i] === k).length;
  check(`pass 1: ${c.same} of CP 29's ${theirs.size} choices, ${inPlace} in place`,
    c.same === theirs.size && ours.size === theirs.size && inPlace === a.length ? null : `${c.differ.length} differ, ${c.onlyA.length} missing, ${c.onlyB.length} extra`, p1.seconds);
  check("pass 1: KEN;CP 30 as reports/pass1-choices.txt, as in 1978 mode", same(cp, read("reports/pass1-choices.txt")));
  const golden = JSON.parse(read("app/data/pass1.json")).choicePoints;
  const ourCPs = p1.value.choicePoints;
  const differing = ourCPs.filter((x, k) => JSON.stringify(x) !== JSON.stringify(golden[k])).map((x) => JSON.stringify(x.name));
  const expected = kind === "slips" ? SLIPS_PASS1 : [];
  check(`pass 1: the choice points and their reasons as app/data/pass1.json has them${expected.length ? ", but for Cinderella's three tendencies" : ""}`,
    ourCPs.length !== golden.length ? `${ourCPs.length} choice points, not ${golden.length}` : JSON.stringify([...differing].sort()) === JSON.stringify([...expected].sort()) ? null : `these differ: ${differing.join(", ") || "none"}`);
  const notes = (p1.value.repairs || []);
  if (kind === "slips") {
    const noted = TENDENCIES.every((e) => notes.some((n) => n.actor === `(choice-point-of cinderella ${e})` && n.note.startsWith("(revival-repair: what friendly-attraction ")));
    check("pass 1: the notes are the three tendencies' friendly-attraction notes", notes.length === 3 && noted ? null : JSON.stringify(notes));
    const tendencies = JSON.stringify(ourCPs.filter((x) => SLIPS_PASS1.includes(JSON.stringify(x.name))), null, 1) + "\n";
    const path = `${dir}/pass1-tendencies.json`;
    if (save) {
      mkdirSync(dir, { recursive: true });
      writeFileSync(path, tendencies);
      console.log(`saved  pass 1's three tendencies' choice points as ${path}`);
    } else check(`pass 1: the three tendencies' choice points as ${path}`, existsSync(path) ? same(tendencies, read(path)) : "there is no such file (make it with --save)");
  } else check("pass 1: no repair notes", notes.length ? `${notes.length}, the first ${JSON.stringify(notes[0])}` : null);
}
if (kind === "appear") {
  const ours = cp ? choicesOfText(cp, "KEN;CP 30") : new Map();
  const theirs = choicesOfItsFile("original/7005017/cp.29");
  const kens = new Map([...ours].filter(([k]) => !isAppearanceChoice(k)));
  const c = compareChoices(theirs, kens);
  const a = [...theirs.keys()], b = [...kens.keys()];
  const inOrder = a.filter((k, i) => b[i] === k).length;
  check(`pass 1: ${c.same} of CP 29's ${theirs.size} choices, by name and value, ${inOrder} in CP 29's order`,
    c.same === theirs.size && kens.size === theirs.size && inOrder === a.length ? null : `${c.differ.length} differ, ${c.onlyA.length} missing, ${c.onlyB.length} not APPEAR's and not CP 29's`, p1.seconds);
  const added = [...ours.keys()].filter(isAppearanceChoice);
  const relative = added.filter((k) => k.startsWith("(relative-")).length;
  check(`pass 1: the other ${added.length} choices are APPEAR's, ${added.length - relative} absolute and ${relative} relative`, added.length ? null : "there are none");
  if (save) {
    writeFileSync(`${dir}/ken-cp.30`, cp);
    writeFileSync(`${dir}/appearances.json`, JSON.stringify(p1.value.appearances, null, 1) + "\n");
    console.log(`saved  pass 1's KEN;CP 30 and appearances in ${dir}`);
  } else {
    check(`pass 1: KEN;CP 30 as ${dir}/ken-cp.30`, existsSync(`${dir}/ken-cp.30`) ? same(cp, read(`${dir}/ken-cp.30`)) : "there is no such file (make it with --save)");
    check(`pass 1: the appearances as ${dir}/appearances.json`, existsSync(`${dir}/appearances.json`) ? same(JSON.stringify(p1.value.appearances, null, 1) + "\n", read(`${dir}/appearances.json`)) : "there is no such file (make it with --save)");
  }
}
const characters = (p1.value.appearances?.characters || []).map((c) => c.character);

// ---------------------------------------------------------------- pass 2, from 1978's positions
// Each scene planned from where the 1978 film left the characters, so that its plan can
// be set beside 1978's: with the looks taken off, the same files.
if (fps === 4 && kind === "appear") {
  const fs2 = makeProjectFileSystem();
  fs2.addFile("KEN", "CP", "30", { text: cp, origin: "pass 1 of this check" });
  for (const f of readdirSync("reports/pass2")) {
    const m = /^ken1-([a-z0-9]+)\.posit$/.exec(f);
    if (m) fs2.addFile("KEN1", m[1].toUpperCase(), "POSIT", { text: read(`reports/pass2/${f}`), origin: "reports/pass2" });
  }
  for (const scene of SCENES) {
    const [fn1, fn2] = FILE_NAMES[scene].split(" ");
    const lower = fn1.toLowerCase();
    const p2 = run(`${scene}: pass 2 from 1978's positions`, () => pass2(fs2, scene, { extensions }));
    const program = textIn(fs2, "KEN", fn1, fn2);
    check(`${scene}: KEN;${fn1} ${fn2}, without its looks and look changes, as 1978's (reports/pass2)`, same(withoutLookChanges(withoutLooks(program)), read(`reports/pass2/ken-${lower}.${fn2.toLowerCase()}`)), p2.seconds);
    // what was taken off is exactly the take-look forms, one for each character, as
    // the Lisp that wrote the program prints them: nothing else, nothing missing
    const L = p2.value.lisp;
    const forms = L.toArray(L.evalString(`(take-look-forms '${scene})`));
    const expected = forms.map((f) => `\n${L.print(f)} `).join("");
    const named = forms.map((f) => L.print(L.toArray(f)[1]).toLowerCase());
    const missing = characters.filter((c) => !named.includes(c));
    check(`${scene}: what follows 1978's program is exactly the ${forms.length} take-look forms`, same(looksOf(program), expected));
    check(`${scene}: a look for each of the ${characters.length} characters`, missing.length || !characters.length ? `none for ${missing.join(", ") || "anyone"}` : null);
    check(`${scene}: KEN1;${fn1} MINI, without its look changes, as 1978's`, same(withoutLookChanges(textIn(fs2, "KEN1", fn1, "MINI")), read(`reports/pass2/ken1-${lower}.mini`)));
    check(`${scene}: KEN1;${fn1} PRINT, without its look changes, as 1978's`, same(printWithoutLookChanges(textIn(fs2, "KEN1", fn1, "PRINT")), read(`reports/pass2/ken1-${lower}.print`)));
    check(`${scene}: the glass box, without its looks and look changes, as 1978's`, same(JSON.stringify(glassWithoutLookChanges(withoutLooksKey(p2.value.glass)), null, 1), read(`reports/pass2/${scene}.glass.json`)));
    const planned = p2.value.glass.lookChanges || [];
    console.log(`       look changes: ${planned.length ? planned.map((c) => `${c.character} ${c.element} by ${c.amount} at ${c.speed} speed, for ${c.feeling || c.task}, in ${c.subscene}`).join("; ") : "none"}`);
    if (scene === "kept-apart") durationGuard(fs2, null, "from 1978's positions");
  }
  storyGuard("test/stories/stress/pushed-around.lisp");
}

// The duration guard on a story's first scene, made with MEND as well: filmed as its
// program has it, and with its look changes taken out, the same frames and events.
function storyGuard(file) {
  const text = read(file);
  // the story needs MEND's repairs (its (not X) and none values, M1 and M2), as the page makes it
  const extensions = [...new Set(["mend", ...chosen.map((e) => e.id)])];
  const plan = storyPlan(storyOutline(text), { looks: true });
  const s = plan.scenes[0];
  const [fn1, fn2] = s.file.map((x) => x.toUpperCase());
  const fs5 = makeProjectFileSystem();
  fs5.addFile("KEN", "CINDY", "47", { text, origin: file });
  const r = run(`${file}: pass 1 and ${s.id}'s pass 2`, () => {
    pass1(fs5, { extensions });
    return pass2(fs5, s.id, { plan, extensions }).glass;
  });
  const program = textIn(fs5, "KEN", fn1, fn2);
  const filmOf = (text2) => {
    const f = makeProjectFileSystem();
    f.addFile("KEN", "CINDY", "47", { text, origin: file });
    f.addFile("KEN", "CP", "30", { text: textIn(fs5, "KEN", "CP", "30"), origin: "the story's pass 1" });
    f.addFile("KEN", fn1, fn2, { text: text2, origin: "the story's pass 2" });
    return film(f, s.id, { plan, extensions, frames: 1000, fps: 4 }).film;
  };
  const a = run(`${s.id}: filming with its look changes`, () => filmOf(program));
  const b = run(`${s.id}: filming without them`, () => filmOf(withoutLookChanges(program)));
  const changes = (r.value.lookChanges || []).length;
  check(`${file}, ${s.id}: ${changes} look change${changes === 1 ? "" : "s"}; the same ${a.value.frames.length} frames and ${a.value.events.length} events with and without them`,
    !changes ? "there are none to take out" : same(JSON.stringify({ frames: a.value.frames, events: a.value.events }), JSON.stringify({ frames: b.value.frames, events: b.value.events })), r.seconds + a.seconds + b.seconds);
}

// For KNOW: the scenes it doesn't change, the same files as 1978's; the two it does,
// those in reports/ext/know/from-1978/.
const KNOW_CHANGES = ["introduction", "kept-apart"];
if (fps === 4 && kind === "know") {
  const fs2 = makeProjectFileSystem();
  fs2.addFile("KEN", "CP", "30", { text: cp, origin: "pass 1 of this check" });
  for (const f of readdirSync("reports/pass2")) {
    const m = /^ken1-([a-z0-9]+)\.posit$/.exec(f);
    if (m) fs2.addFile("KEN1", m[1].toUpperCase(), "POSIT", { text: read(`reports/pass2/${f}`), origin: "reports/pass2" });
  }
  const from1978 = `${dir}/from-1978`;
  if (save) mkdirSync(from1978, { recursive: true });
  for (const scene of SCENES) {
    const [fn1, fn2] = FILE_NAMES[scene].split(" ");
    const lower = fn1.toLowerCase();
    const p2 = run(`${scene}: pass 2 from 1978's positions`, () => pass2(fs2, scene, { extensions }));
    const files = [
      [`KEN;${fn1} ${fn2}`, `ken-${lower}.${fn2.toLowerCase()}`, textIn(fs2, "KEN", fn1, fn2)],
      [`KEN1;${fn1} MINI`, `ken1-${lower}.mini`, textIn(fs2, "KEN1", fn1, "MINI")],
      [`KEN1;${fn1} PRINT`, `ken1-${lower}.print`, textIn(fs2, "KEN1", fn1, "PRINT")],
      ["the glass box", `${scene}.glass.json`, JSON.stringify(p2.value.glass, null, 1)],
    ];
    if (!KNOW_CHANGES.includes(scene)) {
      for (const [what, name, text] of files) check(`${scene}: ${what} as 1978's (reports/pass2)`, same(text, read(`reports/pass2/${name}`)));
      console.log(`       (${p2.seconds.toFixed(1)}s)`);
      continue;
    }
    for (const [what, name, text] of files) {
      const path = `${from1978}/${name}`;
      if (save) { writeFileSync(path, text); console.log(`saved  ${scene}: ${what} as ${path}`); continue; }
      check(`${scene}: ${what} as ${path}`, existsSync(path) ? same(text, read(path)) : "there is no such file (make it with --save)");
    }
    check(`${scene}: the program is not 1978's`, files[0][2] === read(`reports/pass2/${files[0][1]}`) ? "KNOW should change it" : null, p2.seconds);
  }
}

// For SLIPS, DETAIL, SEEN and FIT: each scene planned from where the 1978 film left the
// characters. The scenes each changes have their files in <dir>/from-1978/; the others
// are as the reference has them: for SLIPS, KNOW's (its from-1978/ for the scenes KNOW
// changes, else 1978's reports/pass2), for DETAIL, SEEN and FIT 1978's.
// SLIPS: S1, and FIT's S15 holding Kept Apart and No Longer Kept Apart to their least and
// S16 keeping the parent's factor a stretched walk has in it, (speed from-parent), in the
// Meeting's and Justice's programs; the other corrections act in Director
const SLIPS_CHANGES = ["introduction", "kept-apart", "no-longer-kept-apart", "meeting", "justice"];
// 29.75 s held to 30, and 3.98 to 10; and S16's (speed from-parent) in the Meeting and Justice
const FIT_CHANGES = ["kept-apart", "no-longer-kept-apart", "meeting", "justice"];
const DETAIL_CHANGES = ["introduction", "kept-apart", "no-longer-kept-apart", "meeting", "justice"]; // the tendencies' notes, and the rhythm's changes
const SEEN_CHANGES = ["meeting"]; // the joys of its last part; Kept Apart's are carried by the standing guard, a repeat
if (fps === 4 && (kind === "slips" || kind === "detail" || kind === "seen" || kind === "fit")) {
  const changes = kind === "slips" ? SLIPS_CHANGES : kind === "seen" ? SEEN_CHANGES : kind === "fit" ? FIT_CHANGES : DETAIL_CHANGES;
  const fs2 = makeProjectFileSystem();
  fs2.addFile("KEN", "CP", "30", { text: cp, origin: "pass 1 of this check" });
  for (const f of readdirSync("reports/pass2")) {
    const m = /^ken1-([a-z0-9]+)\.posit$/.exec(f);
    if (m) fs2.addFile("KEN1", m[1].toUpperCase(), "POSIT", { text: read(`reports/pass2/${f}`), origin: "reports/pass2" });
  }
  const from1978 = `${dir}/from-1978`;
  if (save) mkdirSync(from1978, { recursive: true });
  const reference = (name) => (kind === "slips" && existsSync(`reports/ext/know/from-1978/${name}`) ? `reports/ext/know/from-1978/${name}` : `reports/pass2/${name}`);
  for (const scene of SCENES) {
    const [fn1, fn2] = FILE_NAMES[scene].split(" ");
    const lower = fn1.toLowerCase();
    const p2 = run(`${scene}: pass 2 from 1978's positions`, () => pass2(fs2, scene, { extensions }));
    const files = [
      [`KEN;${fn1} ${fn2}`, `ken-${lower}.${fn2.toLowerCase()}`, textIn(fs2, "KEN", fn1, fn2)],
      [`KEN1;${fn1} MINI`, `ken1-${lower}.mini`, textIn(fs2, "KEN1", fn1, "MINI")],
      [`KEN1;${fn1} PRINT`, `ken1-${lower}.print`, textIn(fs2, "KEN1", fn1, "PRINT")],
      ["the glass box", `${scene}.glass.json`, JSON.stringify(p2.value.glass, null, 1)],
    ];
    if (!changes.includes(scene)) {
      for (const [what, name, text] of files) check(`${scene}: ${what} as ${reference(name)}`, same(text, read(reference(name))));
      console.log(`       (${p2.seconds.toFixed(1)}s)`);
      continue;
    }
    for (const [what, name, text] of files) {
      const path = `${from1978}/${name}`;
      if (save) { writeFileSync(path, text); console.log(`saved  ${scene}: ${what} as ${path}`); continue; }
      check(`${scene}: ${what} as ${path}`, existsSync(path) ? same(text, read(path)) : "there is no such file (make it with --save)");
    }
    check(`${scene}: the glass box is not ${reference(files[3][1])}'s`, files[3][2] === read(reference(files[3][1])) ? `${kind.toUpperCase()} should change it` : null, p2.seconds);
  }
}

// ---------------------------------------------------------------- the chained film
if (!quick) {
  const fs3 = makeProjectFileSystem();
  fs3.addFile("KEN", "CP", "30", { text: cp, origin: "pass 1 of this check" });
  for (const scene of SCENES) {
    const [fn1, fn2] = FILE_NAMES[scene].split(" ");
    const lower = fn1.toLowerCase();
    const p2 = run(`${scene}: pass 2, chained`, () => pass2(fs3, scene, { extensions }));
    console.log(`       (${p2.seconds.toFixed(1)}s)`);
    golden(`${scene}: KEN;${fn1} ${fn2}`, `ken-${lower}.${fn2.toLowerCase()}`, textIn(fs3, "KEN", fn1, fn2));
    golden(`${scene}: KEN1;${fn1} MINI`, `ken1-${lower}.mini`, textIn(fs3, "KEN1", fn1, "MINI"));
    golden(`${scene}: KEN1;${fn1} PRINT`, `ken1-${lower}.print`, textIn(fs3, "KEN1", fn1, "PRINT"));
    golden(`${scene}: the glass box`, `${scene}.glass.json`, JSON.stringify(p2.value.glass, null, 1));
    const f = run(`${scene}: filming, chained`, () => film(fs3, scene, { extensions, fps, frames }));
    const ours = f.value.film;
    console.log(`       (${f.seconds.toFixed(1)}s) ${ours.frames.length} frames, ${ours.events.length} events${ours.looks ? `, ${ours.looks.length} looks` : ""}`);
    golden(`${scene}: the film`, `${scene}.film.json`, JSON.stringify(ours));
    if (kind === "appear" && scene === "kept-apart") durationGuard(fs3, ours, "chained");
    // every walk the revival planned ends with its characters on the picture
    // (src/pipeline.js walksOffThePicture, by the recorder's own segments)
    const off = walksOffThePicture(p2.value.glass, ours, { fps });
    check(`${scene}: every walk the revival planned ends with its characters on the picture`, off.length ? off.map((w) => `${w.plan} at frame ${w.frame}, ${w.character}`).join("; ") : null);
    if (kind === "seen") {
      // no part of only changes leaves everyone standing still for more than a second
      const stills = whyTheyAct(p2.value.glass, ours, { fps, extensions }).stills;
      const left = stills.filter((x) => x.kind === "only-changes");
      check(`${scene}: no part of only changes in which no one moves for more than a second${stills.length ? ` (still: ${stills.map((x) => `${x.kind} frames ${x.from} to ${x.to}`).join("; ")})` : ""}`,
        left.length ? left.map((x) => `${x.part} frames ${x.from} to ${x.to}`).join("; ") : null);
    }
    const movie = f.value.lisp.print(f.value.lisp.evalString(`(get '${scene} 'movie-name)`)).toLowerCase();
    golden(`${scene}: KEN1;${movie.toUpperCase()} POSIT`, `ken1-${movie}.posit`, textIn(fs3, "KEN1", movie.toUpperCase(), "POSIT"));
  }
}
finish();
