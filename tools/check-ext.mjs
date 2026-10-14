// Check the revival's extensions that are meant to change Ken's Cinderella
// (src/pipeline.js EXTENSIONS, changes1978) against what they should make, and against
// 1978 where they should leave it alone. For APPEAR (the default), Ani choosing how her
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
//     positions, and at the rate given against the chained film's;
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
// The goldens are in reports/ext/<the ids of the extensions that change Cinderella>.
// Usage: node tools/check-ext.mjs [--extensions appear|know] [--quick] [--fps 24] [--save]
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
import { SCENES, FILE_NAMES, extensionsFor, isAppearanceChoice, pass1, pass2, film } from "../src/pipeline.js";
import { choicesOfText, choicesOfItsFile, compareChoices } from "./choices.mjs";

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] || "" : null; };
const chosen = extensionsFor((opt("--extensions") || "appear").split(",").filter(Boolean));
const extensions = chosen.map((e) => e.id);
if (!chosen.some((e) => e.changes1978)) throw new Error(`none of ${extensions.join(", ")} changes Ken's Cinderella: tools/check-1978.mjs --extensions ${extensions.join(",")} checks it`);
// what this check knows each should make: APPEAR's or KNOW's, not both at once yet
const kind = extensions.includes("appear") ? "appear" : extensions.includes("know") ? "know" : null;
if (!kind || (extensions.includes("appear") && extensions.includes("know"))) throw new Error("so far tools/check-ext.mjs knows what APPEAR should make, and what KNOW should; give it --extensions with one of appear and know");
const quick = args.includes("--quick");
const save = args.includes("--save");
const fps = opt("--fps") === null ? 4 : Number(opt("--fps"));
if (fps !== 4 && fps !== 24) throw new Error("--fps is 4 (the default) or 24");
if (fps === 24 && quick) throw new Error("--quick skips the chained film, so --fps 24 would check only pass 1");
// as tools/check-1978.mjs films: a scene takes six times the frames at 24 that it takes at 4
const frames = fps === 24 ? 6000 : 1000;
const dir = `reports/ext/${chosen.filter((e) => e.changes1978).map((e) => e.id).join("+")}`;
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
    check(`${scene}: KEN1;${fn1} PRINT, without its look changes, as 1978's`, same(withoutLookChanges(textIn(fs2, "KEN1", fn1, "PRINT")), read(`reports/pass2/ken1-${lower}.print`)));
    check(`${scene}: the glass box, without its looks and look changes, as 1978's`, same(JSON.stringify(glassWithoutLookChanges(withoutLooksKey(p2.value.glass)), null, 1), read(`reports/pass2/${scene}.glass.json`)));
    const planned = p2.value.glass.lookChanges || [];
    console.log(`       look changes: ${planned.length ? planned.map((c) => `${c.character} ${c.element} by ${c.amount} at ${c.speed} speed, for ${c.feeling || c.task}, in ${c.subscene}`).join("; ") : "none"}`);
    if (scene === "kept-apart") durationGuard(fs2, null, "from 1978's positions");
  }
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
    const movie = f.value.lisp.print(f.value.lisp.evalString(`(get '${scene} 'movie-name)`)).toLowerCase();
    golden(`${scene}: KEN1;${movie.toUpperCase()} POSIT`, `ken1-${movie}.posit`, textIn(fs3, "KEN1", movie.toUpperCase(), "POSIT"));
  }
}
finish();
