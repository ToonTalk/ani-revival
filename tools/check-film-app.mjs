// Check the film page (app/film.html) end to end in headless Chrome: it boots, the
// editor makes a change ("A kind stepmother"), Ani makes the whole film again in the
// page's worker, the frame counts match what Node makes of the same story, the glass
// box opens on the new film, and the new film comes back after a reload. And the switch
// for the films made here: it opens on "Ani as in 1978" and is kept in this browser; a
// new story that Ani as in 1978 stops on (test/stories/tortoise-and-hare.lisp, as the
// model's reply) is explained, with "Make it again with the revival's extensions", which
// makes it with MEND and APPEAR, and the glass box then says in plain English what each
// repair did, and the hare and the tortoise are drawn as Ani chose; Ken's own Cinderella,
// made as it is with the extensions, is drawn with Ani's looks (a small hexagon, a large
// triangle, an eight-pointed star and a large circle), its glass box has "How she looks"
// (Cinderella's and the stepmother's) with a sentence made from Ani's reasons and Ken's
// 1978 look, and it comes back, looks and all, from the browser's copy and from a film
// file; while in 1978 mode Ken's story
// as it is can't be made again, and Ken's 1978 film is as it was throughout. And a story
// with a change (test/stories/change-of-heart.lisp, as the model's reply): with the
// extensions the prompt teaches the change task, and in 1978 mode it doesn't; in 1978
// mode the page won't make the story, and offers the extensions; with them Ani takes a
// fresh look at the stepmother after Change of Heart (the progress says so), every scene
// ends as in Node, the changing scene's caption says how Ani shows the change (the Prince
// goes to the stepmother and transforms her, gradually, and she changes as she wanders),
// and Change of Heart's and Kind Again's glass boxes have "How she has changed", with a
// sentence made from the fresh look, the bridge (what changed, over how long, from which
// frame, and what was chosen again and not bridged), how she looks, her elements before
// and after, by who reads them, each opening the fresh look's choice point (her look's
// too), and the dynamics saying where each value came from; and it all comes back after a
// reload, and in a film file.
// And the changes shown (REVIVE;CHSHOW, stage 6): "Change the story" offers Ken's own
// cinderella-beautified scene, which he wrote and left commented out (cindy.46:94-105),
// put back as he wrote it, and made with the extensions (the switch turns to them; in 1978
// mode it is refused, and Ken's CINDY itself is as it was); Ani films its six scenes as
// Node does, and in Cinderella Beautified the fairy godmother goes to Cinderella and, as
// they touch, Cinderella's colors become clear at once (the fairy godmother is magical:
// the revival's rule), which the film's looks, the captions, the subtitles, a video's
// picture in color, "How she has changed" with its bridge, and "How she looks" in the
// next scene say; a change with no cause (Learning to Socialize, reports/ext/change/
// socializing, 72 frames), where Cinderella wanders as she grows into an octagon, said in
// its captions and in "How she has changed"; and the prompt in 1978 mode is as it was.
// And the page's care for a model's slips and the reader's films: it tidies a description
// before Ani reads it (Ken's Beauty and the Beast, test/untidy/belfie.lisp, as the model's
// reply: (and ...) put around the beast's looks, the focus's relationship made one part,
// two tasks with one character left out, each said in a note; then pass 1 runs), and
// leaves Ken's CINDY and every story in test/stories and reports/llm-trials as they are;
// a stop on a message an actor didn't understand is said in plain words, with what Lisp
// said a click away; missing relationships are filled in only as in 1978; the prompt asks
// for the story's own film levels and a beaten villain's feelings; "How he looks" says why
// the tortoise moves fast, and that he is slower than the hare; the Save panel's title
// cards and subtitles (burned in below the picture, and as a .vtt file, side by side too);
// a film file's readable fields, and old film files still open; and, with no DSN, nothing
// of Sentry's is loaded and no "Send this story to Ken" is offered, while with one (here,
// pointing at this server) an uncaught error arrives with no key, story or user in it, and
// a story is sent only when the visitor confirms (skipped if Sentry's SDK can't be loaded).
// And the JSON way (app/film/json.js), the default: Ken's CINDY read into JSON and put
// back has his forms; the schema keeps to OpenAI's strict rules in both modes and the
// example keeps to it, and each provider gets its own copy; the JSON prompt has the Lisp
// prompt's guidance; and, with the model's replies stood in for, a schema the provider
// refuses is asked again without it, a problem is fixed in a JSON round, and Gemini Nano
// gets the schema as Chrome's responseConstraint.
// And the revival's knowledge (KNOW), which the switch turns on with the others: the panel
// says in a sentence which extensions are on; Ken's Cinderella made with them has KNOW's
// following, helping and pride, each marked in the glass box as the revival's knowledge;
// the prompt (both ways) and the JSON schema teach KNOW's words, relationships, tasks and
// feelings only with it on, the schema within OpenAI's documented limits for strict
// Structured Outputs (at most 5,000 object properties, 10 levels of nesting, 1,000 enum
// values, 15,000 characters of enum values for one enum of more than 250, and 120,000
// characters of property names and enum values in all), and the prompt with it off is
// as it was; a story whose scene is called fear (a feeling with KNOW) is renamed
// fear-scene, says why, and films; the tidy step leaves out any task Ani can't plan,
// and a scene left with none, so that Gemini Nano's Tortoise and the Hare, with an undoes
// in the scene it undoes, can be made, without "downloading" said for a model already
// there and with its streamed JSON shown without its padding; and the claude.ai copy
// (artifact/ani-cinderella-claude-artifact.html, built first) is under 950,000 bytes,
// starts, and gives a model the full page's prompt and schema word for word. And MEND's
// two newest repairs, M18 (a scene that is one task shown by one) and M19 (far off and off
// the stage), each said where Ani as in 1978 stops and, in a film made with it, in a
// sentence with its code; and a word borrowing its neighbor's way of showing (CINDY's
// is-protective-of, is-protective-to's), as the glass box records it, in a sentence.
// And Ani's colors (APPEAR, stage 5): the panel says what COLORS and ALTER do; "How she
// looks" has a sentence for her colors with Ani's reasons, whose knowledge each one is,
// and her look change in the scene; "How Ani drew them" names each color; in color mode
// the film made with the extensions paints Cinderella in the dull purple Ani chose, and
// Ken's film her green; a joy brightens the Prince and Cinderella over frames in the
// Meeting at 24 frames a second (reports/ext/appear/24fps), and a sadness dims her in
// Kept Apart; the caption says so, with its note only in TV mode, and says where a look
// change shows nothing (Justice); "Ani changes how they look" is said only for a change
// of shape or size; a shape changing into another is cut at the picture's edges; and a
// video paints the colors, its subtitles to match. And the review of stage 5, with Ken's
// decision 11 (his uniqueness rule for hues): the hue's sentence says what decided it
// (no one had a hue yet, so the revival's list of hues; or which others it keeps the
// character apart from, by Ken's rule applied by the revival, and what the film's
// variety took of the hues left), the order of the hues and the rule are in "Where the
// reasons for her colors come from", the order as the revival's, the fairy godmother's
// orange (Ken's own 1978 hue for her) is said with magical's purple set aside, the glass
// box says where a
// change was cut short by the scene's end (the Meeting at 4 frames a second) and where the
// screen draws a color lighter than Ani chose it (a dark one under 3:1 against black,
// lifted in the same hue, dark kept darker than medium; Cinderella's four as she chose
// them), the icons are toned for the light theme, and the reviewer's story of six
// (test/stories/six-colors.lisp), whose Prince the shape experts drew after relaxing
// every constraint, has "How he looks" for everyone.
// And SLIPS and DETAIL, the opt-in extensions (stage 7, Ken's decision 3): a visitor who
// never ticks them sees the page as before (the switch opens on "Ani as in 1978" with
// nothing ticked, "Ani with the revival's extensions" ticks MEND, KNOW, APPEAR and CHANGE
// and nothing more, the prompt with them is today's, and with SLIPS and DETAIL ticked too
// the same, and "Which extensions" has the registry's two groups, SLIPS and DETAIL opt-in
// and unticked); ticked in 1978 mode, SLIPS brings KNOW and MEND and DETAIL brings MEND,
// as reports/ext/slips/ and reports/ext/detail/ make Ken's Cinderella, and the page makes
// it so, 230, 115, 19, 180 and 85 frames with SLIPS and 189, 116, 16, 169 and 87 with
// DETAIL, each correction and detail said where it acted (the compare panel, with the
// frames beside 1978's and the run that confirmed the speed inversion; the captions; the
// glass box, with Ken's lines; pass 1's notes on Cinderella's tendencies); with DETAIL,
// "How she has changed" says that Director's walk reads deliberateness and the best-when
// scores the tendencies (test/stories/stress/change-alone.lisp, made in Node); and the
// claude.ai copy, its page script packed, keeps under 950,000 bytes and gives a model the
// full page's prompt with SLIPS and DETAIL too.
// And Ken's testing of 15 October: the film opens in color, and a visitor's choice of TV
// is kept; SEEN is among the switch's extensions (MEND, KNOW, APPEAR, CHANGE and SEEN), and
// Ken's Cinderella with them films in 222, 116, 19, 200 and 128 frames, his beautified
// scene in 171, 116, 137, 18, 190 and 155, with Cinderella and the fairy godmother wandering
// while their joys run, said in the captions, the glass box's notes and her panel; any
// other set of ticks is said as "some of the revival's extensions (MEND, KNOW and SLIPS)",
// the switch's third setting pressed; why they act as they do: the stepmother's hits say
// why this way and why so long, from Ken's scene's length to the frames, where no one moves
// the panel says why, a scene's parts and steps open their explanations, and the fairy
// godmother standing by says what keeps her part going; "Cinderella beautified" is a
// toggle, taking out the scene alone; the status line says the frame each filming has
// reached, that Chrome paused the tab (frozen here for eight seconds, the time not counted),
// and, after minutes with nothing from Ani, offers Stop; and the claude.ai copy starts
// where eval is refused, Ani's runtime too.
// And Ken's testing of 16 October (2): every film made is kept in "Your films" (IndexedDB),
// and is there after a reload, with its title, date, frames a second, how it was made and
// its size, and a film kept the old way (localStorage) is taken in, once; any two films side
// by side, each chosen from a list over its screen: 1978 beside one of "Your films", two of
// them (what differs between them and Ani's choices, scene by scene, each screen's caption
// tagged Left or Right, playing together) and two different stories (said plainly, and not
// compared scene by scene); a film renamed (kept after a reload), saved as a film file,
// opened as the reader's version and deleted (after the page asks; gone after a reload);
// the place put back after a code link and "Back to the film" (the stepmother clicked at
// frame 30 of Kept Apart, side by side: the same films, scene, frame, character, panel,
// details and scroll), as the browser kept the page (its back-forward cache, pageshow
// persisted) and with the page made again (film.nobf.html has an unload handler, so the
// browser doesn't keep it), after a reload, and from a code page opened some other way
// (film.html#view); and "What this page keeps in your browser" and "Forget all of it", after
// which the page is the default page as before, its prompts pinned.
// And criticism (REVIVE;CRITIC, stages C0 to C3, reports/ext/critic/README.md, "For the
// page"): CRITIC in the "Which extensions" panel's "criticism" group, never ticked; Ken's
// two examples offered in the story panel; in the godmother's glass box in No Longer Kept
// Apart, "Not this way: another way", "Too quick" and "Too slow", and the scene's own "Keep
// two apart" and "Start far"; "Your criticism" and "Remake with my criticism", which remakes
// Ken's 1978 film (at 4 frames a second) in the worker from his files, as
// tools/check-critic.mjs's goldens have it: "too quick" 192, 116, 30, 183 and 90 frames,
// the first two kept; then, from that film's own files, "too quick" taken back and "start
// far" added, 25, 177 and 85; his footnote (Cinderella not meeting the Prince until the
// third scene) 111, with Kept Apart to Justice planned again and kept; and "not this way"
// on the godmother, 23, 178 and 100; each beside the film it was remade from, with "What
// your criticism changed"; a version-3 film file; "Your films" after a reload; and a film
// kept without its working files made again from the start, said so.
// And FIT (Ken's decisions of 16 and 17 October, reports/ext/fit/README.md, "For the page"):
// the switch turns on six, FIT with the five (a scene keeps the time its length gives it,
// a stretched walk takes its stretch once, a repeated walk its parent's factor once), so
// the films made with the revival's extensions are FIT's: Ken's Cinderella 275, 121, 36,
// 213 and 102 frames, the beautified preset 266, 120, 138, 34, 186 and 107, with SLIPS
// (which requires FIT) 250, 122, 34, 185 and 73, the tortoise and the hare 169, 156 and 29,
// the stepmother who repents 169, 62 and 121, and Nano's six scenes 224, 212, 66, 17, 17
// and 113; FIT's notes in a glass box section of their own, its captions, and the step it
// adds to "How Ani timed it".
// And Teach Ani (REVIVE;TEACH; reports/ext/teach/README.md, "For the page"): with no notebook
// the page as it was, its prompts pinned; the forms, a refusal, Ani's check, notebooks as
// files, the design's examples made in the page's worker in the frames Node makes them,
// "What your knowledge did", the glass box's badges and a version-3 film file (see the
// section below).
// Usage: node tools/check-film-app.mjs [--shots <dir>] [--only teach]   (about an hour)
//   --only teach  only the first checks and Teach Ani's (about a quarter of an hour)
// With --shots, the change story's fresh look and "How she has changed", the tidy note,
// a stop sentence and the Save panel are also taken at a phone's width, and the fairy
// godmother transforming Cinderella in color: before, as they touch, and after; and "Your
// films" (at a phone's width too), two of them side by side, and the place put back; and
// the criticism buttons, "Your criticism" (at a phone's width too), a remade film beside
// Ken's with "What your criticism changed", and his footnote's.
//
// It serves the project on a free port itself, and drives Chrome over the DevTools
// protocol with Node's own WebSocket; Chrome's profile goes in the system's temp
// folder and is removed afterwards. CHROME=<path> picks another Chrome.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, extname, normalize } from "node:path";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { storyWithoutClashes, makeFilm, pass1, checkKnowledge } from "../src/pipeline.js";
import { withPageScript, PAGE_SCRIPT_ID } from "./build-film-app.mjs";

// the extensions the page's switch turns on (src/pipeline.js EXTENSIONS, Ken's decision 3,
// SEEN since his testing of 15 October, and FIT since his decisions of 16 and 17 October)
const REVIVAL = ["mend", "know", "appear", "change", "seen", "fit"];
// the kind stepmother's film, as tools/run-pass2.mjs and run-scene.mjs (or src/pipeline.js) make it in Node
const EXPECTED_LAST_FRAMES = [78, 133, 40, 200, 94];
// the tortoise and the hare with the revival's extensions (MEND, KNOW, APPEAR, CHANGE,
// SEEN and FIT): The Boast, The Race and The Finish film in 169, 156 and 29 frames (node
// tools/run-story.mjs test/stories/tortoise-and-hare.lisp --extensions
// mend,know,appear,change,seen,fit; before FIT 187, 111 and 29, as with mend,know,appear,change
// and mend,appear; with MEND alone, 187, 108 and 29, test/stories/stress/expected.json: the
// hare's larger size changes the race), so they end at frames 168, 155 and 28
const EXPECTED_MENDED_LAST_FRAMES = [168, 155, 28];
// Ken's Cinderella with the revival's extensions: 275, 121, 36, 213 and 102 frames
// (reports/ext/fit/README.md, "With the page's set"; before FIT, 222, 116, 19, 200 and 128,
// reports/ext/seen/README.md, "With the page's set"; with the four before SEEN, 222, 116,
// 19, 175 and 92; with APPEAR alone, 193, 116, 19, 175 and 92, reports/ext/appear/README.md:
// KNOW's following and helping make the Introduction longer, reports/ext/know/README.md;
// SEEN has Cinderella and the Prince wander while their joys run, at the end of the
// Meeting, and Justice starts from where that leaves them)
const EXPECTED_LOOKS_LAST_FRAMES = [274, 120, 35, 212, 101];
// the stepmother who repents, with the revival's extensions (MEND, KNOW, APPEAR, CHANGE,
// SEEN and FIT): At Home, Change of Heart and Kind Again film in 169, 62 and 121 frames (node
// tools/run-story.mjs test/stories/change-of-heart.lisp --extensions
// mend,know,appear,change,seen,fit: Kind Again, planned far short of its least, is held to
// it; before FIT 165, 62 and 29; with the four before SEEN, 165, 53 and 29: SEEN has a
// feeling's part of Change of Heart wandered; without KNOW, 108, 62 and 29,
// reports/ext/change/README.md; before Ani showed the change in its scene, stage 6, Change
// of Heart was 72, and 52 before the review of stage 6 gave her wander one more walk), so
// they end at frames 168, 61 and 120
const EXPECTED_CHANGE_LAST_FRAMES = [168, 61, 120];
// Ken's Cinderella with his cinderella-beautified scene put back, made with the page's
// extensions, as tools/check-change.mjs makes it (reports/ext/change/README.md,
// beautified-film, and reports/ext/fit/README.md): 266, 120, 138, 34, 186 and 107 frames
// with FIT (before FIT 171, 116, 137, 18, 190 and 155; with the four before SEEN, 171, 116,
// 137, 20, 193 and 90), so they end at these
const EXPECTED_BEAUTIFIED_LAST_FRAMES = [265, 119, 137, 33, 185, 106];
// the opt-in extensions (Ken's decision 3), each with what it requires, as
// reports/ext/slips/ and reports/ext/detail/ make Ken's Cinderella (their READMEs): with
// SLIPS (and KNOW, FIT and MEND) 250, 122, 34, 185 and 73 frames (reports/ext/slips/README.md
// since FIT; 230, 107, 17, 175 and 84 before it, and 230, 115, 19, 180 and 85 before the
// review of stage 7's S13), with DETAIL (and MEND) 189,
// 116, 16, 169 and 87, so they end at these
const WITH_SLIPS = ["mend", "know", "fit", "slips"], WITH_DETAIL = ["mend", "detail"];
const EXPECTED_SLIPS_LAST_FRAMES = [249, 121, 33, 184, 72];
const EXPECTED_DETAIL_LAST_FRAMES = [188, 115, 15, 168, 86];
// the prompt and schema with the switch's extensions (Lisp, JSON and the schema, for
// STORY_FOR_PROMPTS), as SLIPS and DETAIL leave them (stage 7), with Ken's lines of 15
// October on the story's own cast (only with the revival's extensions; the schema is as
// before); SEEN, added to the switch on 15 October, changes neither the prompt nor the
// schema (they read KNOW, MEND and CHANGE); and since Ken's testing of 16 October (2) the
// prompt calls Ani "it" (his choice), where with the extensions off it is as it was,
// "she" and all: the Lisp and JSON prompts changed by that alone, the schema not
const PROMPT_REVIVAL_SHA = ["7ef0c66e94ac8d87a4038c79b0796552999d12f511ad1671ccba2ea965df0f1d", "b3dbac893ebaf72547f35de6a851dc250cac8969bebbc85a085fcace51afd05c", "39c398879946467919cd3a3256b05257a2348dc2ed33c2650fefeb9a23b0a7c0"];
// the prompt with the extensions off (Lisp, then JSON, for STORY_FOR_PROMPTS), as it was
// before Ani showed changes (stage 6): its SHA-256, which a change to the 1978 mode's
// prompt changes (make it again, from storyPrompt with no extensions, if that is meant)
const PROMPT_1978_SHA = ["635256ea2e8d8d3320ff4742d6b92c3198b49510759818dcbe1ff714bba91343", "fae292e1b61a1fbf17210863eda6108924f1e8d1f45879759c2f1602e61d0c39"];
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const shotsAt = process.argv.indexOf("--shots");
const shots = shotsAt > 0 ? process.argv[shotsAt + 1] : null;
const onlyAt = process.argv.indexOf("--only");
const ONLY_TEACH = onlyAt > 0 && process.argv[onlyAt + 1] === "teach";
if (shots) mkdirSync(shots, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
// every story the tidy must leave as it is
const storiesUnder = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? storiesUnder(`${dir}/${e.name}`) : e.name.endsWith(".lisp") ? [`${dir}/${e.name}`] : []));
const WELL_FORMED = [...storiesUnder("test/stories"), ...storiesUnder("reports/llm-trials")];
// each as src/pipeline.js storyWithoutClashes renames it, as in 1978 and with the switch's
// extensions: the page's tidy step must rename it so too (one helper, in Node and on the page)
const nodeFs = makeProjectFileSystem();
const RENAMED = Object.fromEntries(WELL_FORMED.map((f) => {
  const text = readFileSync(f, "utf8");
  const renamed = (extensions) => { try { return storyWithoutClashes(nodeFs, text, { extensions }).text; } catch { return text; } };
  return [f, { y1978: renamed([]), revival: renamed(REVIVAL) }];
}));
// MEND's two newest repairs and a word borrowing its neighbor's way of showing, each made
// here in Node as the page's worker makes it (src/pipeline.js makeFilm), for the page to
// say in a sentence: MEND18 in test/stories/stress/only-relationship.lisp and MEND19 in
// far-and-offstage.lisp, with MEND; and is-protective-of borrowing is-protective-to's
// accompanying in know-protective.lisp (REVIVE;KNOW's sharing, Ken's decision 10), with
// the switch's extensions
// The reviewer's story of six (test/stories/six-colors.lisp, the review of stage 5, M4):
// telling the Prince apart from the hunter, the shape experts relaxed both of his shape
// constraints, and Ani's record, (considered: constraints nil ...), once made "How he
// looks" throw. Its pass 1, as the page's worker makes it, with the switch's extensions.
const SIX = (() => {
  const text = storyWithoutClashes(nodeFs, readFileSync("test/stories/six-colors.lisp", "utf8").replace(/\r\n/g, "\n"), { extensions: REVIVAL }).text;
  const fs = makeProjectFileSystem();
  fs.addFile("KEN", "CINDY", "47", { text, origin: "test/stories/six-colors.lisp" });
  const p = pass1(fs, { extensions: REVIVAL });
  return { cindy: text, choicePoints: p.choicePoints, appearances: p.appearances };
})();
const NEWER = Object.fromEntries([["only-relationship", ["mend"]], ["far-and-offstage", ["mend"]], ["know-protective", REVIVAL]].map(([name, extensions]) => {
  const story = readFileSync(`test/stories/stress/${name}.lisp`, "utf8").replace(/\r\n/g, "\n");
  const made = makeFilm(makeProjectFileSystem(), { description: story, keepGoing: true, extensions, frames: 1000, fps: 4 });
  return [name, { story, extensions, choicePoints: made.choicePoints, scenes: made.scenes, repairs: made.repairs || null, appearances: made.appearances || null }];
}));
// Three of the stress stories of the review of stage 6, made here in Node with the
// switch's extensions as the page's worker makes them, for the page to say: a change
// shown alone beside another's way of showing (change-two-effects, M2: "How she has
// changed" threw); a relationship change, where nothing changes on screen
// (change-won-over, M5: "transforms him"); and a change and then a feeling, where the
// feeling's part ends first and the film waits for the bridges (change-then-joy, M3)
const REVIEWED6 = Object.fromEntries(["change-two-effects", "change-won-over", "change-then-joy"].map((name) => {
  const story = readFileSync(`test/stories/stress/${name}.lisp`, "utf8").replace(/\r\n/g, "\n");
  const made = makeFilm(makeProjectFileSystem(), { description: story, keepGoing: true, extensions: REVIVAL, frames: 1000, fps: 4 });
  return [name, { story, extensions: REVIVAL, choicePoints: made.choicePoints, scenes: made.scenes, repairs: made.repairs || null, appearances: made.appearances || null, changes: made.changes || null }];
}));
// A change made with DETAIL too (test/stories/stress/change-alone.lisp: the troll becomes
// beautiful by himself), made here in Node as the page's worker makes it, for "How he has
// changed" to say who reads each element (src/pipeline.js elementUse)
const CHANGE_DETAIL = (() => {
  const story = readFileSync("test/stories/stress/change-alone.lisp", "utf8").replace(/\r\n/g, "\n");
  const extensions = [...REVIVAL, "detail"];
  const made = makeFilm(makeProjectFileSystem(), { description: story, keepGoing: true, extensions, frames: 1000, fps: 4 });
  return { story, extensions, choicePoints: made.choicePoints, scenes: made.scenes, repairs: made.repairs || null, appearances: made.appearances || null, changes: made.changes || null };
})();
// the claude.ai copy, as tools/build-film-app.mjs --claude-artifact built it, and a story
// to compare the prompts it and the full page give a model
const ARTIFACT = "artifact/ani-cinderella-claude-artifact.html";
const STORY_FOR_PROMPTS = "A timid goat is afraid of a cruel troll, who chases her; a brave kid helps her across the bridge, and she follows him home, proud and happy.";
// Gemini Nano's Tortoise and the Hare, as it wrote it in Ken's Chrome with the extensions
// on (test/untidy/nano-tortoise.lisp; Nano wrote it as JSON): in its scene The Push,
// (undoes tortoise (from-scene push (convey (pushes hare tortoise)))), an undoes in the
// scene it undoes, which "Ask Gemini Nano to fix these" wrote again. With that task left
// out, all six scenes film, in 224, 212, 66, 17, 17 and 113 frames with the switch's
// extensions (node tools/run-story.mjs on the tidied story --extensions
// mend,know,appear,change,seen,fit; three of its scenes held to their least, planned
// 13.8, 6.8 and 11.7 seconds, held to 17.1, 34.3 and 17.1; before FIT 139, 49, 49, 17, 17 and 117; the last was 112 with the
// four, before SEEN; its last scene
// establishes a relationship and changes it, which stage 3's fix of 13 October films; Determination and the last scene show their
// changes since stage 6, where they were 6 and 2), so they end at these frames
const NANO_TORTOISE = readFileSync("test/untidy/nano-tortoise.lisp", "utf8");
const EXPECTED_NANO_LAST_FRAMES = [223, 211, 65, 16, 16, 112];
// a page with its functions on window.__check, as tools/render-film-video.mjs hands them
const CHECKED = ["tidyStory", "checkStory", "whyStopped", "stopBox", "makeRun", "using", "drawVideoFrame", "makeSubtitles", "RUNS", "DATA", "storySchema", "schemaFor", "slotWords", "lispFromJson", "jsonFromLisp", "cindyJson", "cindyExample", "sameForms", "formsOf", "storyPrompt", "storyFromReply", "printJson", "lispOf", "repairPrompt", "taskVerdict", "knowItems", "namesTaken", "extensionsPanel", "repairsIn", "repairCode", "drawFrame", "paintAt", "shapeChanges", "captionAt", "atScene", "looksBody", "drawnList", "screenRgb", "inkStyle", "lifted", "changedBody", "beautifiedCindy", "modeExtensions", "optInSummary", "select", "goScene", "setView", "runNotes", "runWords", "whyOf", "withoutBeautified", "hasBeautified", "setWords", "ani", "unpack", "runtimeOnPage", "keepFilm", "runFromData", "library", "filmData", "deflate", "inflate", "deleteFilm", "state", "view", "pendingOf", "criticize", "startRemake", "stopRun", "readFilmFile", "filmFile", "fitTiming", "openTeach", "TEACHING", "teachUi", "makeWithKnowledge", "openKnowledgeText", "notebookFileText", "notebookFileName", "vocabularyFor", "choicePointBox", "critBox", "filmData", "storySchema"];
// (the claude.ai copy's page script is packed, tools/build-film-app.mjs PAGE_LOADER: the
// hook goes at its end, unpacked and packed again)
const hooked = (html) => {
  const line = `\nwindow.__check = { ${CHECKED.join(", ")} };\n`;
  if (html.includes(`id="${PAGE_SCRIPT_ID}"`)) return withPageScript(html, (js) => js + line);
  const end = html.lastIndexOf("</script>");
  return html.slice(0, end) + line + html.slice(end);
};
// Two pages made from app/film.html: film.check.html hands some of its functions to
// window.__check, as tools/render-film-video.mjs does; film.report-check.html has a DSN
// that sends Sentry's envelopes here, where they are kept.
const envelopes = [];
const filmPage = () => readFileSync(join(process.cwd(), "app/film.html"), "utf8");
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^[/\\]+/, "");
  const at = path.replace(/\\/g, "/");
  if (path.startsWith("..")) { res.writeHead(403).end(); return; }
  if (req.method === "POST" && /^api\/1\/envelope\/?$/.test(at)) {
    let body = "";
    req.on("data", (c) => { body += c; });
    req.on("end", () => { envelopes.push(body); res.writeHead(200, { "content-type": "application/json" }).end("{}"); });
    return;
  }
  if (at === "app/film.check.html") {
    res.writeHead(200, { "content-type": "text/html" }).end(hooked(filmPage()));
    return;
  }
  // the same, with an unload handler, so that the browser doesn't keep it in its back-forward
  // cache: coming back to it, it is made again from what it kept in the tab
  if (at === "app/film.nobf.html") {
    res.writeHead(200, { "content-type": "text/html" }).end(hooked(filmPage()).replace("<head>", '<head>\n<script>addEventListener("unload", () => {});</script>'));
    return;
  }
  if (at === "artifact/claude.check.html") {
    res.writeHead(200, { "content-type": "text/html" }).end(hooked(readFileSync(join(process.cwd(), ARTIFACT), "utf8")));
    return;
  }
  // the claude.ai copy where eval is refused: a CSP with inline scripts and no 'unsafe-eval'
  // (the review of stage 7, M3)
  if (at === "artifact/claude.csp.html") {
    res.writeHead(200, { "content-type": "text/html", "content-security-policy": "script-src 'self' 'unsafe-inline'" }).end(hooked(readFileSync(join(process.cwd(), ARTIFACT), "utf8")));
    return;
  }
  if (at === "app/film.report-check.html") {
    const html = filmPage(), mark = '/*SENTRY-DSN*/""';
    res.writeHead(html.includes(mark) ? 200 : 500, { "content-type": "text/html" }).end(html.replace(mark, () => JSON.stringify(`http://checkkey@127.0.0.1:${server.address().port}/1`)));
    return;
  }
  try {
    const body = await readFile(join(process.cwd(), path));
    res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" }).end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const profile = await mkdtemp(join(tmpdir(), "ani-check-"));
const port = 9300 + Math.floor(Math.random() * 600);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "about:blank"], { stdio: "ignore" });

let failures = 0;
const check = (ok, what) => { console.log(`${ok ? "ok  " : "FAIL"}  ${what}`); if (!ok) failures++; };
let ws;
try {
  let wsUrl = null;
  for (let k = 0; k < 75 && !wsUrl; k++) {
    await sleep(200);
    try { wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page")?.webSocketDebuggerUrl; } catch { /* starting */ }
  }
  if (!wsUrl) throw new Error(`Chrome didn't start (${CHROME})`);
  ws = new WebSocket(wsUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const pending = new Map();
  const errors = [];
  const sentryAsked = []; // requests for anything of Sentry's while the page has no DSN
  const sdkAsked = []; // requests for Sentry's bundle, at any time
  let reporting = false;
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
    if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === "Network.requestWillBeSent" && !reporting && /sentry/i.test(m.params.request.url)) sentryAsked.push(m.params.request.url);
    if (m.method === "Network.requestWillBeSent" && /sentry-cdn/i.test(m.params.request.url)) sdkAsked.push(m.params.request.url);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const n = ++id; pending.set(n, { resolve, reject }); ws.send(JSON.stringify({ id: n, method, params })); });
  const js = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const shot = async (name) => { if (shots) writeFileSync(join(shots, name), Buffer.from((await send("Page.captureScreenshot", { format: "png" })).data, "base64")); };
  const open = async () => {
    await send("Page.navigate", { url: `${base}/app/film.html` });
    for (let k = 0; k < 50; k++) { await sleep(200); if (await js(`!!document.getElementById("caption-0") && document.getElementById("caption-0").innerText.length > 0`).catch(() => false)) return; }
    throw new Error("the page didn't start");
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  const phone = async (name, scrollTo) => {
    if (!shots) return;
    await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleep(400);
    await js(`(() => { const el = ${scrollTo}; if (el) el.scrollIntoView({ block: "start" }); })()`);
    await sleep(200);
    await shot(name);
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await sleep(200);
  };

  await open();
  check(/The stepmother pushes Cinderella around/.test(await js(`document.getElementById("caption-0").innerText`)), "the 1978 film starts, with its caption");
  // Play pressed at the very start of a scene: an animation frame's time can come a little
  // before the click's, and a clock run backwards once broke every redraw after it
  const played = await js(`(async () => {
    for (let k = 0; k < 20; k++) {
      document.querySelectorAll("#scenes button")[k % 5].click();
      await new Promise((r) => setTimeout(r, 20));
      document.getElementById("play").click();
      await new Promise((r) => setTimeout(r, 60));
      if (document.getElementById("play").textContent === "Pause") document.getElementById("play").click();
    }
    document.querySelector("#scenes button").click();
    return document.getElementById("frame-label").textContent;
  })()`);
  check(errors.length === 0 && /^0\.0 \//.test(played), "Play from the start of each scene, twenty times, without an error");
  await shot("1-film.png");

  // Ken's testing on the page (3), 20 October: frames are numbered across the whole film,
  // and the player says the frame beside the time, the scene's own in brackets; a scene
  // chosen above the film opens on its first frame with someone on it (frame 0 is the
  // cleared screen); a frame said in the timeline shows it when clicked; the strip's colors
  // are explained, in hover titles and a key below it (the thin orange one, a part of only
  // feelings running alongside another: Ken's SCENE, scene.9:216-240); Teach Ani is in the
  // header's row, and where a choice's reasons are words of Ani's, "Teach Ani something
  // different about" each opens its form, filled in
  await send("Page.navigate", { url: `${base}/app/film.check.html` });
  for (let k = 0; k < 50 && !(await js("!!window.__check").catch(() => false)); k++) await sleep(200);
  const round3 = await js(`(async () => {
    const t = window.__check, wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.querySelector('#rate [data-rate="4"]').click();
    await wait(100);
    document.querySelectorAll("#scenes button")[1].click();
    await wait(100);
    const label = document.getElementById("frame-label").textContent;
    const ka = t.RUNS[0].scenes[1], intro = t.RUNS[0].scenes[0];
    const f = Math.floor(t.state.time * 4 + 1e-6);
    const someone = Object.values(ka.film.frames[f].chars).some((c) => c && c.visible);
    const blank0 = !Object.values(ka.film.frames[0].chars).some((c) => c && c.visible);
    // the strip: a hover title on each part, the thin orange one's too, and the key
    const box = document.getElementById("bands").getBoundingClientRect(), scrub = document.querySelector(".scrub");
    const titles = new Set();
    for (let x = 0.02; x < 1; x += 0.04) for (const y of [3, 14]) { scrub.dispatchEvent(new MouseEvent("mousemove", { clientX: box.left + box.width * x, clientY: box.top + y, bubbles: true })); titles.add(document.getElementById("scrub").title); }
    const key = document.getElementById("bands-key").innerText;
    // the glass box's heading, at that frame
    t.select({ run: 0, char: "cinderella" });
    await wait(100);
    const where = document.querySelector("#side .where").innerText;
    // the timeline, in the story panel: a frame clicked is shown
    t.select(null);
    await wait(100);
    const tl = document.querySelector("#side details.timeline");
    tl.open = true;
    const go = [...tl.querySelectorAll("[data-frame-go]")][3];
    const [, , gf] = go.dataset.frameGo.split("|").map(Number);
    const goText = go.textContent;
    go.click();
    await wait(100);
    const jumped = Math.floor(t.state.time * 4 + 1e-6) === gf && document.getElementById("frame-label").textContent.includes("scene frame " + gf + ")");
    // Teach Ani, in the header's row
    document.querySelector("header [data-teach-open]").click();
    await wait(100);
    const teachPanel = t.state.panel;
    // "Teach Ani something different about" a word, in a choice point's reasons
    const cp = t.using(t.RUNS[0], () => t.choicePointBox("prince", "speed"));
    const div = document.createElement("div");
    div.innerHTML = cp;
    document.body.append(div);
    const offer = div.querySelector(".teach-offer");
    const offerText = offer ? offer.textContent : "";
    if (offer) offer.click();
    await wait(100);
    div.remove();
    const form = t.teachUi.form;
    return { label, f, base: intro.last + 1, someone, blank0, titles: [...titles].filter(Boolean), key, where, goText, gf, jumped, teachPanel, offerText, form: form && { kind: form.kind, word: form.f.word, element: form.f.element, value: form.f.value }, panel: t.state.panel };
  })()`);
  const lm = /^0\.\d \/ [\d.]+ s · frame ([\d,]+) \(scene frame (\d+)\)$/.exec(round3.label);
  check(!!lm && Number(lm[1].replace(/,/g, "")) === round3.base + round3.f && Number(lm[2]) === round3.f && round3.f > 0 && round3.someone && round3.blank0,
    `a scene chosen above the film opens on its first frame with someone on it (Kept Apart's frame ${round3.f}; its frame 0 is the cleared screen), and the player says the film's frame beside the time, the scene's in brackets (${round3.label})`);
  check(round3.titles.some((x) => /^Part 2 of 3: frames [\d,]+ to [\d,]+, with a part of feelings running alongside it$/.test(x)) && round3.titles.some((x) => /^Part 3, running alongside part 2 \(frames [\d,]+ to [\d,]+\): it has only changes of feeling, so Ani runs it while that part goes on, made longer to hold it$/.test(x))
    && /The scene's parts, in turn/.test(round3.key) && /A part running alongside another: it has only changes of feeling, so Ani runs it while the part before it goes on, made longer to hold it \(Ken's SCENE, scene\.9:216-240\)/.test(round3.key),
    `the strip's parts have hover titles (${round3.titles.length}: ${round3.titles.slice(0, 2).join("; ")}), and a key below it says what the thin orange one is`);
  check(/^Kept Apart · part \d+ of \d+ · frame [\d,]+ \(scene frame \d+ of 115; [\d.]+ s, at 4 frames a second\)$/.test(round3.where) && Number(/frame ([\d,]+) \(/.exec(round3.where)[1].replace(/,/g, "")) === round3.base + round3.f,
    `the glass box's heading says the film's frame, the scene's in brackets (${round3.where})`);
  check(round3.jumped && Number(round3.goText.replace(/,/g, "")) === round3.base + round3.gf, `a frame in the timeline (${round3.goText}) shows that frame when clicked`);
  check(round3.teachPanel === "teach" && /^Teach Ani something different about “[a-z -]+”$/.test(round3.offerText) && round3.form && round3.form.kind === "suggests" && round3.form.element === "speed" && round3.offerText.includes(`“${round3.form.word.replace(/-/g, " ")}”`) && round3.form.value !== "high" && round3.panel === "teach",
    `Teach Ani is in the header's row, and the Prince's speed (high) offers "${round3.offerText}", which opens its form filled in (${round3.form ? `${round3.form.word}: speed ${round3.form.value}` : "none"})`);
  await shot("16-teach-from-a-choice.png");

  // Ken's decision of 20 October on making a film: no 4/24 toggle beside "Make the film", but
  // two buttons, quick and jerky (4 frames a second) and slow and smoother (24), the one
  // pressed remembered; the player's 4/24 for his 1978 film is as it was
  const makeButtons = await js(`(async () => {
    const t = window.__check, wait = (ms) => new Promise((r) => setTimeout(r, ms));
    t.select(null);
    await wait(200);
    document.getElementById("open-editor").click();
    await wait(200);
    const side = document.getElementById("side");
    [...side.querySelectorAll("[data-preset]")].find((b) => b.textContent === "A shy Prince").click();
    await wait(300);
    const quick = document.getElementById("ed-make").textContent, smooth = document.getElementById("ed-make-24").textContent;
    const toggle = !!side.querySelector("[data-fps]"), rate = !!document.querySelector('#rate [data-rate="24"]');
    document.getElementById("ed-make-24").click();
    await wait(500);
    const fps = t.RUNS[1] && t.RUNS[1].status && t.RUNS[1].status.running ? t.RUNS[1].fps || null : "not running";
    const kept = localStorage.getItem("ani-cinderella:run-fps:v1");
    t.stopRun();
    await wait(300);
    return { quick, smooth, toggle, rate, fps, kept };
  })()`);
  check(makeButtons.quick === "Make it quickly (jerky, 4 frames a second, about 3 minutes)" && makeButtons.smooth === "Make it smoothly (24 frames a second, about 15 minutes)" && !makeButtons.toggle && makeButtons.rate && makeButtons.kept === "24" && makeButtons.fps === 24,
    `"Change the story" has two buttons, "${makeButtons.quick}" and "${makeButtons.smooth}", and no 4/24 toggle; the one pressed is remembered (${makeButtons.kept}), and the 1978 film's 4/24 is as it was (made at ${makeButtons.fps})`);
  await js(`(() => { localStorage.setItem("ani-cinderella:run-fps:v1", "4"); localStorage.removeItem("ani-cinderella:draft:v1"); })()`);

  // "Tell Ani what's wrong" (criticism C4), on Ken's film, with the model's reply stood in
  // for (no model is called here): the request goes to the provider chosen, and only there,
  // with the visitor's words and the film as the glass box tells it, and no key in its body;
  // the schema is strict (every object's properties all required, no others), its enums the
  // film's own scenes, parts, ways and cast; each item is shown, with what can be done with
  // it, and nothing is added until the visitor says so: a part too quick goes to "Your
  // criticism" with the visitor's words, knowledge to Teach Ani, its form filled in, and
  // what Ani has no notion of is refused with Ken's sentence (p. 191)
  await open();
  await send("Page.navigate", { url: `${base}/app/film.check.html` });
  for (let k = 0; k < 50 && !(await js("!!window.__check").catch(() => false)); k++) await sleep(200);
  const c4 = await js(`(async () => {
    const t = window.__check, wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.querySelector('#rate [data-rate="4"]').click();
    document.querySelectorAll("#scenes button")[2].click();
    await wait(200);
    const SAID = "No Longer Kept Apart is too quick, and it feels gloomy; pretty characters should move fast";
    const real = window.fetch, calls = [];
    window.fetch = async (url, opts) => {
      calls.push(String(url));
      if (!String(url).startsWith("https://api.anthropic.com/")) return real(url, opts);
      const body = JSON.parse(opts.body);
      window.__c4body = body;
      const parts = body.output_config.format.schema.properties.items.items.anyOf.find((x) => x.properties.kind.enum[0] === "pace").properties.part.enum;
      // the part of No Longer Kept Apart, as the prompt lists it
      const p = (/Scene “No Longer Kept Apart”[\\s\\S]*?Part 1 \\((p\\d+)\\)/.exec(body.messages[0].content) || [])[1];
      const reply = { items: [
        { kind: "pace", part: p || parts[0], direction: "too-quick", said: "No Longer Kept Apart is too quick" },
        { kind: "cannot", about: "mood", explain: "Mood is not something Ani takes into account", said: "it feels gloomy" },
        { kind: "teach", word: "pretty", element: "speed", value: "high", because: "pretty characters dance about", said: "pretty characters should move fast" },
        { kind: "pace", part: "p999", direction: "too-slow", said: "a part the film doesn't have" } ] };
      return new Response(JSON.stringify({ content: [{ type: "text", text: JSON.stringify(reply) }] }), { status: 200 });
    };
    const side = document.getElementById("side");
    const tell = side.querySelector(".crit-tell");
    if (!tell) return { error: "no Tell Ani what's wrong" };
    tell.open = true;
    side.querySelector('[data-crq-provider="anthropic"]').click();
    await wait(100);
    const key = document.getElementById("crq-key");
    key.value = "test-key-not-real";
    key.dispatchEvent(new Event("input", { bubbles: true }));
    const words = document.getElementById("crq-words");
    words.value = SAID;
    words.dispatchEvent(new Event("input", { bubbles: true }));
    document.querySelector('.crit-tell [data-crq="go"]').click();
    for (let k = 0; k < 50 && !document.querySelector(".crq-items"); k++) await wait(100);
    const body = window.__c4body;
    window.fetch = real;
    const items = [...document.querySelectorAll(".crq-item")].map((x) => x.innerText);
    const pendingBefore = t.pendingOf(t.RUNS[0]).length;
    // strict: every object's properties all required, none other allowed
    const strict = (x) => !x || typeof x !== "object" ? true : Array.isArray(x) ? x.every(strict) : (x.type !== "object" || (x.additionalProperties === false && JSON.stringify(Object.keys(x.properties).sort()) === JSON.stringify([...x.required].sort()))) && Object.values(x).every(strict);
    const schema = body && body.output_config.format.schema;
    const kinds = schema ? schema.properties.items.items.anyOf : [];
    const enumOf = (kind, prop) => { const k = kinds.find((x) => x.properties.kind.enum[0] === kind); return k ? k.properties[prop].enum || (k.properties[prop].items || {}).enum : null; };
    window.scrollTo(0, 0);
    document.querySelector(".crq-items").scrollIntoView({ block: "center" });
    await wait(100);
    window.__c4shot = true;
    document.querySelector('.crq-item [data-crq="act"]').click();
    await wait(200);
    const pending = t.pendingOf(t.RUNS[0]).map((c) => ({ kind: c.kind, scene: c.scene, direction: c.direction, said: c.said }));
    const listed = [...document.querySelectorAll(".crit-list li")].map((x) => x.innerText);
    const teachButton = [...document.querySelectorAll(".crq-item")].find((x) => /Knowledge/.test(x.innerText)).querySelector('[data-crq="act"]');
    teachButton.click();
    await wait(200);
    const form = t.teachUi.form;
    return {
      calls, items, pendingBefore, pending, listed, strict: strict(schema), panel: t.state.panel,
      form: form && { kind: form.kind, word: form.f.word, element: form.f.element, value: form.f.value, because: form.f.because },
      prompt: body ? body.messages[0].content : "", keyInBody: JSON.stringify(body || {}).includes("test-key-not-real"), keyHeader: !!body,
      scenes: enumOf("start-far", "scene"), cast: enumOf("start-far", "who"), sceneIds: t.RUNS[0].sceneIds, castIds: t.RUNS[0].cast, kinds: kinds.map((x) => x.properties.kind.enum[0]),
    };
  })()`);
  check(!c4.error && c4.calls.length === 1 && /^https:\/\/api\.anthropic\.com\//.test(c4.calls[0]) && !c4.keyInBody && c4.prompt.includes("No Longer Kept Apart is too quick, and it feels gloomy; pretty characters should move fast") && /Scene “No Longer Kept Apart” \(id no-longer-kept-apart\)/.test(c4.prompt) && /thesis p\. 191/.test(c4.prompt),
    `"Tell Ani what's wrong" asks only the provider chosen (${(c4.calls || []).join(", ")}), with the visitor's words and the film as the glass box tells it, and no key in the request's body`);
  check(c4.strict && JSON.stringify(c4.scenes) === JSON.stringify(c4.sceneIds) && JSON.stringify(c4.cast) === JSON.stringify(c4.castIds) && c4.kinds.join() === "another-way,pace,choice,keep-apart,start-far,story,teach,cannot",
    `its schema is strict, its enums the film's own scenes and cast, its kinds ${c4.kinds && c4.kinds.join(", ")}`);
  check(c4.items.length === 4 && /^Not something Ani can change: the model named a part this film doesn't have\./.test(c4.items[3]) && /^Criticism: part 1 of No Longer Kept Apart is too quick \(you said “No Longer Kept Apart is too quick”\) Add to your criticism$/.test(c4.items[0])
    && /^Ani can't take this criticism: Mood is not something Ani takes into account\. As Ken wrote, “Ani currently has practically no conception of rhythm, for example, and so could not respond to criticisms of the film's rhythm\. The same holds for notions such as climax, tension, mood, or humor\./.test(c4.items[1])
    && /^Knowledge, true of any pretty character in any story, not criticism of this film: a pretty character's speed is high\./.test(c4.items[2]) && c4.pendingBefore === 0,
    `each item is shown in plain words, with what can be done with it, and nothing added yet (${c4.items.map((x) => x.split(":")[0]).join("; ")})`);
  check(c4.pending.length === 1 && c4.pending[0].kind === "pace" && c4.pending[0].scene === "no-longer-kept-apart" && c4.pending[0].direction === "too-quick" && c4.pending[0].said === "No Longer Kept Apart is too quick" && /you said “No Longer Kept Apart is too quick”/.test(c4.listed.join(" ")),
    `"Add to your criticism" adds it, with the visitor's words (${c4.listed.join(" | ")})`);
  check(c4.panel === "teach" && c4.form && c4.form.kind === "suggests" && c4.form.word === "pretty" && c4.form.element === "speed" && c4.form.value === "high" && c4.form.because === "pretty characters dance about",
    `"Teach Ani this" opens Teach Ani's form filled in (${c4.form ? `${c4.form.word}: ${c4.form.element} ${c4.form.value}, because ${c4.form.because}` : "none"})`);

  // the film opens in color (Ken, 15 October), and a visitor's choice of TV is kept
  const pictureAt = () => js(`document.getElementById("mode-color").getAttribute("aria-pressed") + " " + document.getElementById("mode-bw").getAttribute("aria-pressed")`);
  const pictureFirst = await pictureAt();
  await js(`document.getElementById("mode-bw").click()`);
  await open();
  const pictureKept = await pictureAt();
  await js(`document.getElementById("mode-color").click()`);
  await open();
  check(pictureFirst === "true false" && pictureKept === "false true" && (await pictureAt()) === "true false", `the film opens in color, and a visitor's choice of TV is kept in this browser (${pictureFirst}; after TV and a reload, ${pictureKept})`);

  // why they act as they do (Ken, 15 October: "it is easy to find why characters look as
  // they do but harder to figure out why they act as they do"): in Ken's 1978 film at 4
  // frames a second, the stepmother's hits in the Introduction say why they last as they
  // do, from Ken's scene's length to the frames; where no one moves after the tenth (frames
  // 139 to 149), the panel says so, and why (his Director's repeat unwinding); and the
  // scene, part by part, each step opening its explanation
  await send("Page.navigate", { url: `${base}/app/film.check.html` });
  for (let k = 0; k < 50 && !(await js("!!window.__check").catch(() => false)); k++) await sleep(200);
  const why1978 = await js(`(async () => {
    const t = window.__check, wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.querySelector('#rate [data-rate="4"]').click();
    await wait(100);
    t.goScene(0, 144 / 4 + 1e-4);
    t.select({ run: 0, char: "step-mother" });
    await wait(50);
    const still = document.querySelector("#side .still-box");
    if (still) still.querySelector("details").open = true;
    const stillText = still ? still.textContent : "";
    t.goScene(0, 120 / 4 + 1e-4);
    t.select({ run: 0, char: "step-mother" });
    await wait(50);
    const box = document.querySelector("#side .why-act");
    if (box) box.querySelector("details").open = true;
    const hits = box ? box.textContent : "";
    t.goScene(1, 60 / 4 + 1e-4);
    t.select({ run: 0, char: "cinderella" });
    await wait(50);
    const guard = (document.querySelector("#side .why-act") || {}).textContent || "";
    t.goScene(0, 0);
    t.select(null);
    await wait(50);
    const tl = document.querySelector("#side .timeline");
    if (tl) tl.open = true;
    const tlText = tl ? tl.innerText : "";
    const entry = tl && [...tl.querySelectorAll("[data-tl]")].find((b) => /hitting the other, 10 times/.test(b.textContent));
    if (entry) entry.click();
    await wait(100);
    const opened = document.getElementById("side").innerText.slice(0, 600);
    document.querySelector('#rate [data-rate="24"]').click();
    await wait(100);
    return { stillText, hits, guard, tlText, entry: !!entry, opened };
  })()`);
  check(/^No one on the stage moves from frame 139 to 149 \(2\.5 s\), in part 3\./.test(why1978.stillText) && /the last of the 10 runs of Ken's \(repeat 10 \.\.\.\), and his Director takes a tick for each run to unwind/.test(why1978.stillText) && /action\.152:94-123/.test(why1978.stillText),
    `where no one moves, the panel says so, and why: ${why1978.stillText.split("Why no one moves")[0]}`);
  check(/Why so long It lasts 0\.5 s \(frames 119 to 121\): it stops after the hit; this is the fourth of its ten runs, from Ken's \(repeat 10 \.\.\.\)\. Ken's scene says \(set your length to long\), 30 to 75 seconds; Ani planned 7\.32 s for “the stepmother goes to Cinderella and hits her”\./.test(why1978.hits)
    && /Why this way It was the one way Ani's suggestions offered for this\./.test(why1978.hits) && /Ani gave a fifth of the scene, 6 to 15 seconds, to conveying that the stepmother hurts Cinderella/.test(why1978.hits) && /Its estimate for “the stepmother goes to Cinderella and hits her” is 7\.32 s at best/.test(why1978.hits),
    `the stepmother's hit says why this way and why so long, from Ken's scene's length to the frames: ${(why1978.hits.match(/Why so long[^]*?\.(?= Ken's)/) || [""])[0]}`);
  check(/Why this way Ani weighed two ways, each score weighted by the film's levels, and this one came out highest, on its prerequisites \(75 against 25\) and fitting the time \(75 against 25\)/.test(why1978.guard) && /it set aside “the stepmother chases the Prince off the stage” \(it doesn't fit the time/.test(why1978.guard) && /stretched it by 1\.97, to take in part 3, which extends it/.test(why1978.guard),
    "in Kept Apart, why the stepmother stands guard and not otherwise (CHOMET's scores and what it set aside), and why her guard is stretched");
  check(/^The Introduction, part by part \(5 parts\)/.test(why1978.tlText) && /110–139 The stepmother: hitting the other, 10 times/.test(why1978.tlText) && /139–149 no one moves \(2\.5 s\)/.test(why1978.tlText) && why1978.entry && /^The stepmother/.test(why1978.opened) && /hitting the other/.test(why1978.opened),
    "the story panel has the scene, part by part, and a step opens its explanation in the glass box of the one who does it");
  const notes = await js(`(() => {
    const t = window.__check, now = Date.now();
    const st = { running: true, started: now - 700000, heard: now - 610000, step: "film", scene: "kept-apart", what: "Filming Kept Apart", frame: 80, frameScene: "kept-apart" };
    return { words: t.runWords(st), silent: t.runNotes(st).join(" "), inPage: t.runNotes({ ...st, inPage: true }).join(" "), paused: t.runNotes({ ...st, heard: now, resumedAt: now - 1000, lastPause: 125000 }).join(" ") };
  })()`);
  check(/^Filming Kept Apart · frame 80 · 11:40$/.test(notes.words) && /^Ani has sent nothing for 10 minutes \(Filming Kept Apart\)\. It may still be working, or it may be stuck: <button type="button" class="linkish" data-stop-run>Stop<\/button> ends the run/.test(notes.silent) && notes.inPage === "" && /^Chrome paused this tab while it was in the background, for 2:05; Ani went on when it came back, and that time isn't counted\.$/.test(notes.paused),
    `the status line while filming says the frame reached (${notes.words}), and, when Ani has sent nothing for minutes, says so and offers Stop; and that Chrome paused the tab, the time not counted`);

  // tidying: Ken's CINDY and every well-formed story come out as they are; Ken's Beauty and
  // the Beast is tidied; a word in another kind's slot moves; a stop on a message an actor
  // didn't understand is said plainly; the subtitles are drawn below the picture
  await send("Page.navigate", { url: `${base}/app/film.check.html` });
  for (let k = 0; k < 50 && !(await js("!!window.__check").catch(() => false)); k++) await sleep(200);
  const tidy = await js(`(async () => {
    const t = window.__check;
    // as in 1978 and with the switch's extensions: a story comes out as src/pipeline.js's
    // storyWithoutClashes renames it, or, where the tidy left out what Ani can't plan,
    // only where Ani's checks found a problem, and then with none
    const changed = [], renamed = [], leftOut = [];
    const RENAMED = ${JSON.stringify(RENAMED)};
    for (const f of ${JSON.stringify(WELL_FORMED)}) {
      const text = await (await fetch("/" + f.split("/").map(encodeURIComponent).join("/"))).text();
      for (const [mode, extensions] of [["y1978", []], ["revival", ${JSON.stringify(REVIVAL)}]]) {
        const r = t.tidyStory(text, { extensions });
        const others = r.fixes.filter((x) => !/^renamed /.test(x.short));
        if (!others.length) { if (r.text !== RENAMED[f][mode]) changed.push(mode + " " + f); else if (r.fixes.length) renamed.push(mode + " " + f); continue; }
        const before = t.checkStory(text, { extensions }).problems.length, after = t.checkStory(r.text, { extensions }).problems.length;
        if (!before || after) changed.push(mode + " " + f + " (" + others.map((x) => x.short).join("; ") + ")"); else leftOut.push(mode + " " + f);
      }
    }
    const cindy = t.tidyStory(t.DATA.cindy, { extensions: [] });
    const cindyRevival = t.tidyStory(t.DATA.cindy, { extensions: ${JSON.stringify(REVIVAL)} });
    const belfie = await (await fetch("/test/untidy/belfie.lisp")).text();
    const b = t.tidyStory(belfie);
    const variant = belfie.replace("(physical beautiful)", "(physical (and beautiful kind))").replace("(personality (and stubborn good strong kind))", "(personality (and stubborn good strong))");
    const v = t.tidyStory(variant);
    // Gemini Nano's crowd story: a scene and a character both called crowd
    const crowdText = await (await fetch("/test/untidy/nano-crowd.lisp")).text();
    const crowd = t.tidyStory(crowdText, { extensions: ${JSON.stringify(REVIVAL)} });
    const run = t.makeRun({ label: "Your version", short: "Yours", cindy: belfie });
    run.status = { error: "break BAD-MESSAGE", typed: [";warning from BEAST: (PROCESS EACH INITIAL DESCRIPTION (PHYSICAL UGLY PHYSICALLY-STRONG)) is not understood", "--- type (?) for help"] };
    const box = document.createElement("div");
    box.innerHTML = t.stopBox(run);
    const generic = t.whyStopped(run, "break BAD-MESSAGE", [";warning from BELLE: (FROBNICATE YOUR WIDGET) is not understood"]).text;
    // a picture of the video with subtitles: its strip below the picture has words in it
    const canvas = document.createElement("canvas");
    canvas.width = 551; canvas.height = 413 + 124;
    const ctx = canvas.getContext("2d");
    t.drawVideoFrame(ctx, [t.RUNS[0]], { i: 0, t: 2 }, 1, { subtitles: true, memo: Object.assign(new Map(), { both: false }) });
    const strip = ctx.getImageData(0, 413, 551, 124).data;
    let lit = 0;
    for (let k = 0; k < strip.length; k += 4) if (strip[k] > 100) lit++;
    const vtt = t.makeSubtitles([t.RUNS[0]], [0], true);
    document.getElementById("side").innerHTML = box.innerHTML;
    document.querySelector("#side details.said").open = true;
    return { changed, renamed, leftOut, cindy: cindy.text === t.DATA.cindy && !cindy.fixes.length && cindyRevival.text === t.DATA.cindy && !cindyRevival.fixes.length, fixes: b.fixes.map((f) => f.short), text: b.text, again: t.tidyStory(b.text).fixes.length,
      crowd: { fixes: crowd.fixes.map((f) => f.short), long: crowd.fixes.map((f) => f.long).join(" "), scene: crowd.text.includes("(define crowd-scene scene"), character: crowd.text.includes("(define crowd character"), line: crowd.text.includes("ashamed = Ashamed; crowd-scene = The Crowd"), cast: crowd.text.includes("; crowd = the crowd (they)"), problems: t.checkStory(crowd.text, { extensions: ${JSON.stringify(REVIVAL)} }).problems.length },
      variant: v.fixes.map((f) => f.short), moved: v.text.includes("(physical beautiful)") && v.text.includes("(personality (and stubborn good strong kind))"),
      box: box.innerText, said: box.querySelector("details.said pre") ? box.querySelector("details.said pre").innerText : "", generic, lit, vtt: vtt.slice(0, 400) };
  })()`);
  check(!tidy.changed.length && tidy.cindy && tidy.renamed.length >= 7 && tidy.renamed.some((x) => /^revival .*know-scene-named-fear/.test(x)) && !tidy.renamed.some((x) => /^y1978 .*know-scene-named-fear/.test(x)),
    `the tidy leaves Ken's CINDY and all ${WELL_FORMED.length} stories in test/stories and reports/llm-trials as they are, as in 1978 and with the extensions, but for the names src/pipeline.js storyWithoutClashes renames (${tidy.renamed.length}, a scene called friends as in 1978, fear only with KNOW) and the tasks Ani can't plan (in ${tidy.leftOut.length}, each a story Ani's checks found a problem in, and none after)${tidy.changed.length ? ` (changed otherwise: ${tidy.changed.join(", ")})` : ""}`);
  // (a character is called as a story read before named it, "the Beast", or else by its Lisp name)
  const named = (s) => s.replace(/\b(?:the )?beast's/gi, "beast's").replace(/\bbelle's/gi, "belle's");
  check(named(tidy.fixes.join("; ")) === "put (and ...) around beast's looks; left out (prevents beast (meets belle)) in Kept Apart; left out (aware belle (getting-it-on beast)) in Justice; made (relationship-of belle beast) one part of the focus" && /\(physical \(and ugly physically-strong\)\)/.test(tidy.text) && /\(belle \(relationship-of belle beast\)/.test(tidy.text) && !/\(meets belle\)\)/.test(tidy.text) && !/\(getting-it-on beast\)/.test(tidy.text) && tidy.again === 0,
    `Ken's Beauty and the Beast is tidied, once: ${tidy.fixes.join("; ")}`);
  check(tidy.crowd.fixes.join("; ") === "renamed the scene “crowd” to crowd-scene, since the story has a character called crowd too" && /the scene's would replace the character's, and the character would never be planned or drawn/.test(tidy.crowd.long) && tidy.crowd.scene && tidy.crowd.character && tidy.crowd.line && tidy.crowd.cast && !tidy.crowd.problems,
    `a scene with one of the story's characters' names (Gemini Nano's "The Crowd") is renamed, the character keeps its name, and the page says why: ${tidy.crowd.fixes.join("; ")}`);
  check(named(tidy.variant[0] || "") === "moved “kind” from belle's looks to her character" && tidy.variant.length === 5 && tidy.moved, `a word in another kind's slot goes to its own: ${tidy.variant[0]}`);
  check(/Pass 1: Ani couldn't read beast's description: \(physical ugly physically-strong\) — two words need \(and \.\.\.\) around them\./.test(named(tidy.box)) && /^;warning from BEAST: \(PROCESS EACH INITIAL DESCRIPTION \(PHYSICAL UGLY PHYSICALLY-STRONG\)\) is not understood\nbreak BAD-MESSAGE$/.test(tidy.said), `where Ani stopped on it says why in plain words, with what Lisp said a click away: ${(tidy.box.match(/Pass 1:.*?them\./) || [tidy.box])[0]} | ${JSON.stringify(tidy.said)}`);
  check(tidy.generic === "Belle didn't understand a message Ani sent: “(frobnicate your widget)”.", `any other message not understood is said with who and which: ${tidy.generic}`);
  check(tidy.lit > 400 && /^WEBVTT\n\n1\n00:00:00\.000 --> 00:00:01\.000\nThe Introduction\n\n2\n00:00:01\.000 --> /.test(tidy.vtt) && /\nScene 1 · The Introduction · part 1 of \d+\n/.test(tidy.vtt), `a video's subtitles are drawn below the picture (${tidy.lit} lit dots) and written as WebVTT, timed after the title card`);
  // MEND18, MEND19 and a borrowed way of showing, each in a sentence: where Ani as in 1978
  // stops, and, in a film made with them (in Node, above), what the repair did, and that
  // is-protective-of borrows is-protective-to's way of showing, as the glass box records it
  const newer = await js(`(() => {
    const t = window.__check;
    const NEWER = ${JSON.stringify(NEWER)};
    const plain = (s) => s.replace(/<[^>]+>/g, "").replace(/\\s+/g, " ").trim();
    const said = (name) => {
      const x = NEWER[name];
      const run = t.makeRun({ label: "Yours", short: "Yours", cindy: x.story, scenes: x.scenes, extensions: x.extensions, choicePoints: x.choicePoints, repairs: x.repairs, appearances: x.appearances });
      const sc = run.scenes[0];
      return { frames: sc && sc.film ? sc.film.frames.length : 0, borrowed: JSON.stringify((sc && sc.glass && sc.glass.borrowed) || null), repairs: t.repairsIn(run, sc).map((r) => plain(r.html)), known: t.knowItems(run, sc).map((k) => plain(k.html)) };
    };
    const one = t.whyStopped(null, "cdr of non-list: CONVEY-TASK-1");
    const far = t.whyStopped(null, "break NO-SUCH-ACTOR", [";warning from ASK: LARGE-DISTANCE-AND-OFFSTAGE is not an actor --- type (?) for help"]);
    const code = (what) => { const a = document.createElement("div"); a.innerHTML = t.repairCode(what); const l = a.querySelector("a"); return l ? l.getAttribute("href") : ""; };
    return { one, far, only: said("only-relationship"), offstage: said("far-and-offstage"), protective: said("know-protective"), codes: [code("one-task-ordering"), code("defined-constraint")] };
  })()`);
  check(/^The scene's only task was to show a relationship, which Ani shows by one thing the characters do; with that one task in its place, Ken's SCENE took it for a list of tasks and stopped \(scene\.9:535-538\)\.$/.test(newer.one.text) && /^take one task as the scene's whole order of tasks/.test(newer.one.repair || "")
    && /^A character with no place yet was to come on from off the stage, far from another, before they moved; Ken's PLACE asks for that place \(large-distance-and-offstage\) but defines only its small and medium distances\.$/.test(newer.far.text) && /^define it as Ken's medium-distance-and-offstage is$/.test(newer.far.repair || ""),
    `where Ani as in 1978 stops on a scene that is one task shown by one, or on a place PLACE never defines, the page says why, and offers MEND18's and MEND19's repairs: ${newer.one.repair} | ${newer.far.repair}`);
  check(newer.only.frames === 87 && newer.only.repairs.length === 1 && /^The scene's only task was to establish that the troll dominates the goat, which Ani shows by one thing the characters do: the troll pushes the goat around\. With that one task in its place, Ken's SCENE took the scene's order of tasks for a list and stopped, in Ani as in 1978 \(scene\.9:535-538\); the revival's repairs take one task as the whole order, as Ken's own reorder-task-ordering-1 already does \(scene\.9:474\)\.$/.test(newer.only.repairs[0]) && /source\.html#revive-mend18-\d+$/.test(newer.codes[0]),
    `MEND18's note in a sentence, with its code (only-relationship, ${newer.only.frames} frames; ${newer.codes[0]}): ${newer.only.repairs[0]}`);
  check(newer.offstage.frames === 48 && newer.offstage.repairs.length === 1 && /^The troll had no place yet, and was to come on from off the stage, far from the kid; Ken's PLACE asks for that \(large-distance-and-offstage\) but defines only its small and medium distances, so Ani as in 1978 stopped there\. The revival defined it as Ken's medium-distance-and-offstage is, and placed the troll off the stage, far from the kid\.$/.test(newer.offstage.repairs[0]) && /source\.html#revive-mend19-\d+$/.test(newer.codes[1]),
    `MEND19's note in a sentence, with its code (far-and-offstage, ${newer.offstage.frames} frames; ${newer.codes[1]}): ${newer.offstage.repairs[0]}`);
  // the review of stage 6: a change shown alone (M2), a relationship change (M5), and the
  // film waiting for a bridge (M3), each said as it was shown
  const reviewed = await js(`(() => {
    const t = window.__check, R6 = ${JSON.stringify(REVIEWED6)};
    const plain = (s) => String(s).replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ").replace(/ ([,.;:])/g, "$1").trim();
    const runOf = (name) => { const x = R6[name]; return t.makeRun({ label: "Yours", short: "Yours", cindy: x.story, scenes: x.scenes, extensions: x.extensions, choicePoints: x.choicePoints, repairs: x.repairs, appearances: x.appearances, changes: x.changes }); };
    const say = (run, i, f) => { const c = t.captionAt(run, i, f); return plain([c.text, ...c.more].join(" ")); };
    const body = (run, c, i) => { try { return plain(t.using(run, () => t.changedBody(run, c, i))); } catch (e) { return "THREW " + e.message; } };
    const two = runOf("change-two-effects"), won = runOf("change-won-over"), joy = runOf("change-then-joy");
    const bridgeEnded = (run, i) => { const sc = run.scenes[i], x = (sc.glass.changesShown || [])[0]; return !!x && !!x.bridging && sc.film.events.some(([, e]) => e === "(end-of " + x.bridging.plan + ")"); };
    return {
      two: { goat: body(two, "goat", 1), caption: say(two, 1, 20) },
      won: { caption: say(won, 1, 1), goat: body(won, "goat", 1) },
      joy: { goat: body(joy, "goat", 1), ended: bridgeEnded(joy, 1), repairs: t.repairsIn(joy, joy.scenes[1]).map((r) => plain(r.html)) },
    };
  })()`);
  check(!/^THREW/.test(reviewed.two.goat) && /beside another change, where the kid goes to the troll and transforms him, she changes with no way of showing of her own, from the start of the part, gradually, over [\d.]+ seconds/.test(reviewed.two.goat)
    && /to convey that he makes the troll kind, no longer mean; and the kid makes the goat brazen, no longer shy:/.test(reviewed.two.caption) && /The goat changes too: /.test(reviewed.two.caption),
    `a change shown alone, beside another's way of showing (change-two-effects, the review's M2): "How she has changed" says so (${(reviewed.two.goat.match(/Ani shows it in Turnabout:[^:]*/) || [reviewed.two.goat.slice(0, 120)])[0]}), and the caption says both changes`);
  check(/The goat goes to the troll, to convey that the goat changes how the troll feels about the goat, from “hates” to “loves”: how one feels about another doesn't change how either moves, so nothing changes on screen\./.test(reviewed.won.caption) && !/transforms/.test(reviewed.won.caption)
    && /Ani shows the change in Won Over: the goat, who brings it about, goes to the troll, whose relationship it is; she is chosen again too\./.test(reviewed.won.goat),
    `a relationship change, where nothing changes on screen (change-won-over, the review's M5): ${(reviewed.won.caption.match(/The goat goes to the troll[^.]*\./) || [""])[0]}`);
  check(reviewed.joy.ended && /a part that extends this one ended first, and the revival's repairs kept the film going until the change had been shown/.test(reviewed.joy.goat)
    && reviewed.joy.repairs.some((r) => /part that extends the one where a change is shown ended first, and Ken's code would have stopped the film there/.test(r)),
    `a change and then a feeling, the feeling's part ending first (change-then-joy, the review's M3): the bridges end, and the glass box says the revival's repairs kept the film going (${reviewed.joy.repairs.length} repair notes)`);
  check(newer.protective.frames === 324 && newer.protective.borrowed === JSON.stringify([{ task: "establish-task-1", word: "is-protective-of", neighbor: "is-protective-to", way: "(accompanys troll kid)", strength: "low", chosen: true }])
    && newer.protective.known.some((k) => /^“is protective of” borrows “is protective to”'s way of showing it, going along with: the revival's knowledge makes them neighbors \(Ken's comment, dscrp\.17:183\)\. the revival's: CINDY's word for how the fairy godmother is to Cinderella/.test(k) && / code$/.test(k))
    // since FIT (Ken's decisions of 16 and 17 October) the scene, planned far short of its
    // least, is held to it (324 frames, 35 before), and FIT's notes are among the repairs
    && newer.protective.repairs.filter((r) => /^The scene's only task was to establish that the troll is protective of the kid, which Ani shows by one thing the characters do: the troll accompanies the kid\./.test(r)).length === 1 && newer.protective.repairs.some((r) => /The revival holds a scene to its length's bounds once its tasks have their times/.test(r)),
    `the glass box records that is-protective-of borrowed is-protective-to's way of showing, and the page says so, with its reason and code (know-protective, ${newer.protective.frames} frames): ${newer.protective.known.join(" | ")}`);
  await shot("1b-stop-sentence.png");
  await phone("1c-stop-sentence-phone.png", `document.querySelector("#side .stop-box")`);
  await open();
  // Ken's 1978 film, as shipped: each scene's length and the first caption, to compare at the end
  const film1978 = () => js(`(async () => {
    document.querySelector('#runbar [data-view="0"]').click();
    const out = [];
    for (const b of document.querySelectorAll("#scenes button")) {
      b.click();
      await new Promise((r) => setTimeout(r, 30));
      out.push(document.getElementById("frame-label").textContent.split("/")[1].trim());
    }
    document.querySelector("#scenes button").click();
    await new Promise((r) => setTimeout(r, 30));
    return out.join(" ") + " | " + document.getElementById("caption-0").innerText;
  })()`);
  const shipped = await film1978();
  const toCheckPage = async (page = "film.check.html") => {
    await send("Page.navigate", { url: `${base}/app/${page}` });
    for (let k = 0; k < 75 && !(await js("!!window.__check && !!window.__check.library.ready && !window.__check.view.restoring").catch(() => false)); k++) await sleep(200);
    await js(`(async () => { await window.__check.library.ready; for (let k = 0; k < 30 && !window.__check.RUNS[1]; k++) await new Promise((r) => setTimeout(r, 100)); })()`);
    await sleep(300);
  };
  // (with --only teach, on to Teach Ani's checks)
  if (!ONLY_TEACH) {

  // the switch for the films made here: "Ani as in 1978" at first, kept in this browser
  const pressed = () => js(`[...document.querySelectorAll("#side [data-mode]")].filter((b) => b.getAttribute("aria-pressed") === "true").map((b) => b.dataset.mode).join()`);
  await js(`document.getElementById("open-editor").click()`);
  await sleep(200);
  const first = await pressed();
  const panel = await js(`(() => { const p = document.querySelector("#side .ext-panel"); return p ? (p.open ? "open" : "closed") + " " + p.textContent : "none"; })()`);
  await js(`document.querySelector('#side [data-mode="revival"]').click()`);
  await open();
  await js(`document.getElementById("open-editor").click()`);
  await sleep(200);
  const kept = await pressed();
  await js(`document.querySelector('#side [data-mode="1978"]').click()`);
  await sleep(100);
  const back = await pressed();
  await js(`document.getElementById("ed-close").click()`);
  await sleep(200);
  check(first === "1978" && kept === "revival" && back === "1978", `the switch opens on "Ani as in 1978" and is kept in this browser (${first}, after a reload ${kept}, then ${back})`);
  check(/^closed /.test(panel) && /MEND/.test(panel) && /APPEAR/.test(panel) && /SHAPES/.test(panel) && /SLIPS/.test(panel), "under it, a closed \"Which extensions\" panel lists the repairs and Ani choosing the looks");
  check(/Ani chooses each character's size, shape and colors as it chooses how the character moves/.test(panel) && /COLORS A small semantic net of six hues on a painter's wheel \(thesis p\. 240\)/.test(panel) && /ALTER Looks that change during a scene, as display methods beside Ken's changes of how a character moves \(thesis p\. 166\): joy brightens a character's colors and sadness dims them/.test(panel) && !/next stage|doesn't choose colors|keeps the color it has/.test(panel),
    "and Ani's colors, with what COLORS and ALTER do, and nothing of colors to come");
  check(/Characters who change \(CHANGE\)\. A scene may change a character/.test(panel) && /fresh look/.test(panel) && /In the scene itself Ani shows the change \(p\. 169\): the cause goes to her and transforms her, or, with no cause, she wanders about as she changes/.test(panel) && /his own cinderella-beautified scene, put back as he wrote it, now plays/.test(panel) && !/isn't shown yet/.test(panel)
    && /CHSHOW Showing a change in its scene \(thesis p\. 169\)/.test(panel) && /noted as not bridged, since Director doesn't read it/.test(panel), "and characters who change, in a plain sentence, with what CHSHOW does: the change shown in its scene");
  check(/The switch turns on six of the revival's extensions: the repairs for new stories \(MEND\), the knowledge Ken could have added \(KNOW\), Ani choosing how its characters look \(APPEAR\), characters who change \(CHANGE\), changes seen when no one has anything to do \(SEEN\) and scenes that keep their time \(FIT\)\./.test(panel) && /Changes seen when no one has anything to do \(SEEN\)\. A feeling changes how a character moves/.test(panel) && /SEEN A character whose part is only changes of feeling waits until nothing else moves her/.test(panel) && /Knowledge Ken could have added \(KNOW\)\. Knowledge Ken could have added: the thesis says words such as/.test(panel) && /KNOWDI/.test(panel) && /helps-along, moves-away-from and follows-behind/.test(panel) && /A scene keeps its time \(FIT\)\. A scene's length \(short, medium or long\) gives it a least and a most time/.test(panel) && /FIT S15, a scene keeps its time/.test(panel) && /FITSTR S16, a walk SCENE stretches takes its stretch once/.test(panel) && /Two more are opt-in, off unless you tick them \(Ken's decision 3\): corrections of slips in Ken's files \(SLIPS\) and a few of the thesis's “myriad details” \(DETAIL\)\./.test(panel) && !/will be switches of their own/.test(panel),
    "the panel says in a sentence which extensions the switch turns on, KNOW, SEEN and FIT among them with what each of their files does, and that SLIPS and DETAIL are opt-in");

  await js(`document.getElementById("open-editor").click()`);
  await sleep(200);
  await js(`document.querySelector('[data-preset="0"]').click()`);
  await sleep(200);
  const changes = await js(`document.getElementById("ed-check").innerText`);
  check(/now pretty/.test(changes) && /now loves/.test(changes), "the editor applies \"A kind stepmother\"");
  // a change inside (wants ...) isn't made (REVIVE;CHANGE changes-in): Ani can't plan it,
  // so the tidy step leaves it out, and the editor says so plainly, and why; then back to
  // "A kind stepmother"
  const leftAlone = await js(`(async () => {
    const lisp = await (await fetch("/test/stories/change-of-heart.lisp")).text();
    const ta = document.getElementById("ed-lisp");
    ta.value = lisp.replace("(convey (causes prince", "(convey (wants prince");
    ta.dispatchEvent(new Event("input"));
    await new Promise((r) => setTimeout(r, 700));
    document.querySelectorAll("#ed-check details").forEach((d) => (d.open = true));
    const said = document.getElementById("ed-check").innerText;
    document.getElementById("ed-reset").click();
    await new Promise((r) => setTimeout(r, 200));
    document.querySelector('[data-preset="0"]').click();
    await new Promise((r) => setTimeout(r, 200));
    return { said, again: document.getElementById("ed-check").innerText, make: !document.getElementById("ed-make").disabled };
  })()`);
  check(/left out (the scene change-of-heart|\(wants prince \(change)/.test(leftAlone.said) && /a change is made only by a task of its own, \(convey \(change \.\.\.\)\), or inside \(causes x \(change \.\.\.\)\); inside \(wants \.\.\.\) Ani leaves it alone, and no one changes\./.test(leftAlone.said) && leftAlone.again === changes,
    "a change inside (wants ...), which Ani can't plan, is left out, and the editor says so, and why, plainly");
  await shot("2-editor.png");

  const t0 = Date.now();
  await js(`document.getElementById("ed-make").click()`);
  let status = "";
  for (let k = 0; k < 150; k++) {
    await sleep(4000);
    status = await js(`document.getElementById("run-status").innerText`);
    if (!/·/.test(status)) break;
  }
  check(/5 of 5 scenes filmed/.test(status), `Ani makes the film again in the page (${Math.round((Date.now() - t0) / 1000)} s): ${status}`);
  const lasts = await js(`(async () => {
    const out = [];
    for (const b of document.querySelectorAll("#scenes button")) {
      b.click();
      await new Promise((r) => setTimeout(r, 30));
      document.querySelector('#runbar [data-view="1"]').click();
      await new Promise((r) => setTimeout(r, 30));
      // the label shows seconds; a re-run is at 4 frames a second unless asked for 24
      out.push(Math.round(parseFloat(document.getElementById("frame-label").textContent.split("/")[1]) * 4));
    }
    document.querySelector('#runbar [data-view="both"]').click();
    return out;
  })()`);
  check(JSON.stringify(lasts) === JSON.stringify(EXPECTED_LAST_FRAMES), `the new film's scenes end at frames ${lasts.join(", ")} (Node: ${EXPECTED_LAST_FRAMES.join(", ")})`);

  // saving a video: title cards on and subtitles off at first; with subtitles on and title
  // cards off, the .vtt file and the video of one scene of both films, side by side
  const saveOptions = await js(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const orig = HTMLAnchorElement.prototype.click;
    const got = [];
    HTMLAnchorElement.prototype.click = function () { if (this.download) got.push({ name: this.download, href: this.href }); else orig.call(this); };
    try {
      document.querySelector('#runbar [data-view="both"]').click();
      document.querySelectorAll("#scenes button")[2].click();
      if (document.getElementById("save-panel").hidden) document.getElementById("save").click();
      const panel = document.getElementById("save-panel");
      const box = (k) => panel.querySelector('[data-video="' + k + '"]');
      const defaults = { titles: box("titles").checked, subtitles: box("subtitles").checked, vtt: !!panel.querySelector('[data-save="vtt"]') };
      box("subtitles").click();
      box("titles").click();
      await wait(50);
      const note = panel.querySelector(".note").innerText;
      panel.querySelector('[data-save="vtt"]').click();
      for (let k = 0; k < 100 && got.length < 1; k++) await wait(100);
      const vtt = got[0] ? await (await fetch(got[0].href)).text() : "";
      panel.querySelector('[data-save="scene"]').click();
      for (let k = 0; k < 1200 && got.length < 2; k++) await wait(100);
      let dims = null;
      if (got[1]) {
        const b = new Uint8Array(await (await fetch(got[1].href)).arrayBuffer());
        const at = [...b.keys()].find((i) => b[i] === 0x56 && String.fromCharCode(...b.slice(i, i + 5)) === "V_VP8");
        const num = (id) => { for (let i = at; i < at + 64; i++) if (b[i] === id && b[i + 1] === 0x82) return b[i + 2] * 256 + b[i + 3]; return null; };
        dims = { width: num(0xb0), height: num(0xba), bytes: b.length };
      }
      ${shots ? "" : "box(\"subtitles\").click(); box(\"titles\").click();"}
      return { defaults, note, vtt, files: got.map((g) => g.name), dims };
    } finally { HTMLAnchorElement.prototype.click = orig; }
  })()`);
  check(saveOptions.defaults.titles && !saveOptions.defaults.subtitles && !saveOptions.defaults.vtt, "the Save panel has title cards on and subtitles off, at first");
  check(/^WEBVTT\n\n1\n00:00:00\.000 --> /.test(saveOptions.vtt) && /\n1978 · Scene 1 · The Introduction · part 1 of \d+\nThe stepmother pushes Cinderella around/.test(saveOptions.vtt) && /\nYours · Scene 1 · The Introduction · part 1 of \d+\n/.test(saveOptions.vtt) && !/\nThe Introduction\n/.test(saveOptions.vtt) && !/<b>/.test(saveOptions.vtt),
    `with subtitles on and no title cards, the .vtt file has each film's part and caption, side by side (${saveOptions.files[0]}: ${saveOptions.vtt.split("\n").slice(2, 6).join(" | ")})`);
  check(saveOptions.dims && saveOptions.dims.width === (551 * 2 + 12) * 2 && saveOptions.dims.height === (413 + 124) * 2, `and the video of a scene of both films has the subtitles' strip below the pictures (${saveOptions.files[1]}: ${saveOptions.dims ? `${saveOptions.dims.width} by ${saveOptions.dims.height}, ${Math.round(saveOptions.dims.bytes / 1024)} KB` : "none"})`);
  if (shots) {
    await js(`document.getElementById("save-panel").scrollIntoView({ block: "start" })`);
    await shot("3b-save-panel.png");
    await phone("3c-save-panel-phone.png", `document.getElementById("save-panel")`);
    await js(`(() => { const p = document.getElementById("save-panel"); p.querySelector('[data-video="subtitles"]').click(); p.querySelector('[data-video="titles"]').click(); })()`);
  }

  await js(`(() => { document.querySelector("#scenes button").click(); const s = document.getElementById("scrub"); s.value = 30; s.dispatchEvent(new Event("input")); })()`);
  await sleep(200);
  const why = await js(`(() => {
    const c = document.querySelector("#fig-1 canvas");
    const r = c.getBoundingClientRect();
    for (let y = 0; y < 413; y += 3) for (let x = 0; x < 551; x += 3) {
      const at = { clientX: r.left + x / 551 * r.width, clientY: r.top + y / 413 * r.height, bubbles: true };
      c.dispatchEvent(new MouseEvent("mousemove", at));
      if (c.classList.contains("over")) { c.dispatchEvent(new MouseEvent("click", at)); return document.getElementById("side").innerText; }
    }
    return "";
  })()`);
  check(/Your version · The Introduction/.test(why), "clicking a character in the new film opens its glass box");
  await shot("3-side-by-side.png");

  await open();
  await sleep(1500);
  check(/5 of 5 scenes filmed/.test(await js(`document.getElementById("run-status").innerText`)), "the new film comes back after a reload");

  // "Your films" (Ken's testing (2), 16 October: "Is there a way to access previously made
  // films without saving them?"): the film just made is kept in this browser's library
  // (IndexedDB), and is there after the reload, with its title, when it was made, its frames
  // a second, how it was made and its size; and a film kept as the page kept its last one
  // before (localStorage, ani-cinderella:run:v1) is taken into the library, once, and comes
  // back as the reader's version
  const kept1 = await js(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.getElementById("open-films").click();
    await wait(200);
    const side = document.getElementById("side");
    return { button: document.getElementById("open-films").innerText, panel: side.querySelector("h2").innerText, items: [...side.querySelectorAll(".films > li")].map((li) => li.innerText.replace(/\\s+/g, " ")), old: localStorage.getItem("ani-cinderella:run:v1") };
  })()`);
  check(kept1.button === "Your films (1)" && kept1.panel === "Your films" && kept1.items.length === 1 && /^Cinderella: the stepmother pretty, kind and good; the stepmother loves and is helpful/.test(kept1.items[0]) && /your version now/.test(kept1.items[0]) && /· 4 frames a second · by Ani as in 1978 · 5 scenes · \d+(\.\d)? [KM]B/.test(kept1.items[0]) && kept1.old === null,
    `the film made is kept in "Your films" (IndexedDB), and is there after a reload, with its title, date, frames a second, how it was made and its size: ${kept1.items[0] || "none"}`);
  await send("Page.navigate", { url: `${base}/app/film.check.html` });
  for (let k = 0; k < 50 && !(await js("!!window.__check && !!window.__check.library.ready").catch(() => false)); k++) await sleep(200);
  const takenIn = await js(`(async () => {
    const t = window.__check, wait = (ms) => new Promise((r) => setTimeout(r, ms));
    await t.library.ready;
    for (let k = 0; k < 50 && !t.RUNS[1]; k++) await wait(100);
    const data = t.filmData(t.RUNS[1]);
    // kept for the checks of "Your films" below (a film file's inside, as the library keeps it)
    sessionStorage.setItem("ani-check-kind", await t.deflate(JSON.stringify(data)));
    // as the page kept the last film before "Your films", and with the library empty
    localStorage.setItem("ani-cinderella:run:v1", await t.deflate(JSON.stringify(data)));
    await t.deleteFilm(t.library.films[0].id);
    return t.library.films.length;
  })()`);
  await send("Page.navigate", { url: `${base}/app/film.check.html` });
  for (let k = 0; k < 50 && !(await js("!!window.__check && !!window.__check.library.ready").catch(() => false)); k++) await sleep(200);
  const tookIn = await js(`(async () => {
    const t = window.__check, wait = (ms) => new Promise((r) => setTimeout(r, ms));
    await t.library.ready;
    for (let k = 0; k < 50 && !t.RUNS[1]; k++) await wait(100);
    await wait(300);
    return { films: t.library.films.map((f) => f.title), old: localStorage.getItem("ani-cinderella:run:v1"), status: document.getElementById("run-status").innerText, current: !!t.RUNS[1] && t.RUNS[1].libId === (t.library.films[0] || {}).id };
  })()`);
  check(takenIn === 0 && tookIn.films.length === 1 && /^Cinderella: the stepmother pretty/.test(tookIn.films[0]) && tookIn.old === null && tookIn.current && /5 of 5 scenes filmed/.test(tookIn.status),
    `a film kept the old way (localStorage) is taken into "Your films", once, and comes back as the reader's version: ${tookIn.status}`);

  // a new story: the model's reply is stood in for (test/stories/red-riding-hood.lisp),
  // so nothing leaves the page; this checks drafting, the checks and the editor
  const drafted = await js(`(async () => {
    const lisp = await (await fetch("/test/stories/red-riding-hood.lisp")).text();
    const real = window.fetch;
    let asked = null;
    window.fetch = async (url, opts) => {
      if (!String(url).startsWith("https://api.anthropic.com/")) return real(url, opts);
      asked = JSON.parse(opts.body);
      return new Response(JSON.stringify({ content: [{ type: "text", text: "\`\`\`lisp\\n" + lisp + "\\n\`\`\`" }] }), { status: 200 });
    };
    document.getElementById("open-teller").click();
    await new Promise((r) => setTimeout(r, 200));
    const side = document.getElementById("side");
    const json = side.querySelector('[data-format="json"]').getAttribute("aria-pressed") === "true";
    side.querySelector('[data-format="lisp"]').click();
    side.querySelector('[data-provider="anthropic"]').click();
    await new Promise((r) => setTimeout(r, 100));
    side.querySelector('[data-story="0"]').click();
    const key = side.querySelector("#tell-key");
    key.value = "test-key-not-real";
    key.dispatchEvent(new Event("input"));
    side.querySelector("#tell-go").click();
    for (let k = 0; k < 50 && !side.querySelector("#tell-edit"); k++) await new Promise((r) => setTimeout(r, 100));
    const result = side.querySelector("#tell-result").innerText;
    side.querySelector("#tell-edit").click();
    await new Promise((r) => setTimeout(r, 200));
    return { json, asked: asked && asked.model, shaped: !!(asked && asked.output_config && asked.output_config.format), prompt: asked && asked.messages[0].content.length, result, editor: document.getElementById("ed-chars").innerText, make: !document.getElementById("ed-make").disabled };
  })()`);
  check(drafted.json, "the model writes JSON by default (the JSON way), which the page puts into Ken's notation");
  check(drafted.asked === "claude-sonnet-5-5" && drafted.prompt > 5000 && !drafted.shaped, `with "Ken's Lisp" chosen, the story goes to the model with Ani's vocabulary (${drafted.prompt} characters to ${drafted.asked}), with no schema`);
  check(/4 characters/.test(drafted.result) && /nothing wrong/.test(drafted.result), "the drafted description passes Ani's checks");
  check(/Red Riding Hood/.test(drafted.editor) && drafted.make, "the editor shows the new cast, ready to make the film");

  // the JSON way (app/film/json.js): Ken's CINDY read into JSON and put back gives his
  // forms; the schema keeps to OpenAI's strict rules and the example keeps to it; each
  // provider's copy of it; the prompt in both modes; and a reply read leniently
  await send("Page.navigate", { url: `${base}/app/film.check.html` });
  for (let k = 0; k < 50 && !(await js("!!window.__check").catch(() => false)); k++) await sleep(200);
  const jsonWay = await js(`(async () => {
    const t = window.__check;
    const REVIVAL = ${JSON.stringify(REVIVAL)};
    const back = t.lispFromJson(t.cindyJson());
    // OpenAI's strict rules for Structured Outputs: every object closed, with every
    // property required; no $ref, allOf, not or if; and its documented limits: at most
    // 5,000 object properties, 10 levels of nesting, 1,000 enum values in all, 15,000
    // characters of enum values for one enum of more than 250 values, and 120,000
    // characters of property names and enum values in all
    const strict = (schema) => {
      let depth = 0, enums = 0, props = 0, chars = 0, bigEnum = 0, ok = schema.type === "object" && !schema.anyOf;
      const walk = (x, d) => {
        if (Array.isArray(x)) return x.forEach((y) => walk(y, d));
        if (!x || typeof x !== "object") return;
        if (x.$ref || x.allOf || x.not || x.if || x.oneOf) ok = false;
        if (x.type === "object" && (x.additionalProperties !== false || JSON.stringify(Object.keys(x.properties || {})) !== JSON.stringify(x.required))) ok = false;
        if (x.properties) { props += Object.keys(x.properties).length; chars += Object.keys(x.properties).join("").length; }
        if (x.enum) {
          enums += x.enum.length;
          const n = x.enum.filter((v) => typeof v === "string").join("").length;
          chars += n;
          if (x.enum.length > 250) bigEnum = Math.max(bigEnum, n);
        }
        const nd = x.type === "object" || x.type === "array" ? d + 1 : d;
        depth = Math.max(depth, nd);
        for (const [k, v] of Object.entries(x)) if (k !== "enum") walk(v, nd);
      };
      walk(schema, 0);
      return { ok: ok && depth <= 10 && enums <= 1000 && props <= 5000 && chars <= 120000 && bigEnum <= 15000, depth, enums, props, chars };
    };
    // a value against a schema, as the providers read one
    const valid = (v, s) => {
      if (s.anyOf) return s.anyOf.some((x) => valid(v, x));
      const types = [].concat(s.type || []);
      const typeOf = v === null ? "null" : Array.isArray(v) ? "array" : typeof v;
      if (types.length && !types.includes(typeOf)) return false;
      if (s.enum && !s.enum.includes(v)) return false;
      if (s.pattern && !new RegExp(s.pattern).test(v)) return false;
      if (typeOf === "array") return v.length >= (s.minItems || 0) && v.length <= (s.maxItems ?? Infinity) && v.every((x) => valid(x, s.items));
      if (typeOf === "object") return Object.keys(v).every((k) => s.properties[k]) && s.required.every((k) => k in v && valid(v[k], s.properties[k]));
      return true;
    };
    const s1978 = t.storySchema([]), sRevival = t.storySchema(REVIVAL);
    const kinds = (s) => JSON.stringify(s).match(/"kind":\\{"type":"string","enum":\\[[^\\]]*\\]/g).join(" ");
    const anth = JSON.stringify(t.schemaFor("anthropic", sRevival)), nano = JSON.stringify(t.schemaFor("nano", sRevival)), gemini = JSON.stringify(t.schemaFor("gemini", sRevival));
    const lisp1978 = t.storyPrompt("A story.", { extensions: [] }), json1978 = t.storyPrompt("A story.", { extensions: [], format: "json" }), jsonRevival = t.storyPrompt("A story.", { extensions: REVIVAL, format: "json" });
    const physical = sRevival.properties.characters.items.properties.physical.items.enum;
    const rrh = await (await fetch("/test/stories/red-riding-hood.lisp")).text();
    const rrhJson = t.jsonFromLisp(rrh);
    const odd = t.lispFromJson({ characters: [{ name: "Big Bad Wolf", physical: "huge" }], scenes: [{ steps: [{ kind: "chases", who: "big-bad-wolf", whom: "hunter" }] }] });
    // the safety net, where the A/B (reports/llm-trials/2026-10-13 ...) found it wanting: a
    // ")" too many in a scene's tasks comes out there, and one left in is a problem; and
    // undoing an (establish ...) is a problem, which the schema can't even say
    const cindy = t.cindyExample();
    const slip = cindy.replace("(joy (negative high))))))\\n\\t(set your mood to joyous)", "(joy (negative high)))))))\\n\\t(set your mood to joyous)");
    const mended = t.lispOf("\`\`\`lisp\\n" + slip + "\\n\`\`\`");
    const misMended = slip.replace("\\t(set your length to medium))\\n", "\\t(set your length to medium)\\n");
    const undoing = t.cindyJson();
    undoing.scenes[2].steps[0][0].undone = undoing.scenes[1].steps[2][0];
    // KNOW, only with it on: its words in the slots, its tasks, its feelings (only joy
    // signed negative), and in the prompt, how its relationships are shown
    const lispRevival = t.storyPrompt("A story.", { extensions: REVIVAL });
    const kindsOf = (s) => JSON.stringify(s).match(/"kind":\\{"type":"string","enum":\\[[^\\]]*\\]/g).join(" ");
    const feelingsOf = (s) => JSON.stringify(s.properties.scenes.items.properties.steps.items.items.anyOf[1].properties.feelings.items);
    const personality = (s) => s.properties.characters.items.properties.personality.items.enum;
    const knowSchema = /"helps"/.test(kindsOf(sRevival)) && /"avoids"/.test(kindsOf(sRevival)) && /"follows"/.test(kindsOf(sRevival)) && !/"helps"|"follows"/.test(kindsOf(s1978))
      && personality(sRevival).includes("gentle") && personality(sRevival).includes("timid") && !personality(s1978).includes("gentle")
      && sRevival.properties.relationships.items.properties.how.items.enum.includes("fears") && !s1978.properties.relationships.items.properties.how.items.enum.includes("fears")
      && /"anyOf":\\[\\{"type":"object","properties":\\{"feeling":\\{"type":"string","enum":\\["joy"\\]\\},"sign":\\{"type":"string","enum":\\["positive","negative"\\]\\}/.test(feelingsOf(sRevival))
      && /"enum":\\["pride","anticipation","loneliness","fear","anger"\\]\\},"sign":\\{"type":"string","enum":\\["positive"\\]\\}/.test(feelingsOf(sRevival)) && !/anticipation/.test(feelingsOf(s1978));
    const knowPrompt = (p, j) => (j ? /\\{"kind": "follows", "who": X, "whom": Y\\} for X following Y/.test(p) && /only joy may be "negative"/.test(p) : /\\(convey \\(helps X Y\\)\\) for X helping Y along/.test(p) && /\\(convey \\(avoids X Y\\)\\)/.test(p) && /\\(convey \\(follows X Y\\)\\)/.test(p) && /a feeling may also be pride, anticipation, loneliness, fear or anger, written as joy is but always positive/.test(p))
      && /is-obedient-to by following the other/.test(p) && /fears, dislikes and is-intolerant-of by keeping away from the other/.test(p) && /personality: [^\\n]*\\bgentle\\b/.test(p) && /Nothing else: Ani can't show gives, says/.test(p);
    // asked to fix an undoes, a model is told each scene and what a later one may undo
    const nanoJson = t.jsonFromLisp(${JSON.stringify(NANO_TORTOISE)}), nanoLisp = t.lispFromJson(nanoJson);
    const undoProblem = t.checkStory(nanoLisp, { extensions: REVIVAL }).problems;
    const fixJson = t.repairPrompt(undoProblem, "json", nanoLisp), fixLisp = t.repairPrompt(undoProblem, "lisp", nanoLisp);
    const repairUndo = undoProblem.length === 1 && /push isn't an earlier scene/.test(undoProblem[0])
      && /An undoes task undoes only what someone did in a scene before its own/.test(fixJson) && /\\n- boast: nothing a later scene can undo\\n- push: nothing a later scene can undo\\n- determination: \\{"kind": "change-personality", "who": "tortoise"/.test(fixJson)
      && /\\n- determination: \\(convey \\(causes hare \\(change \\(personality tortoise/.test(fixLisp) && /Reply with the whole corrected film description as JSON/.test(fixJson);
    // what a model is given, in each mode and way, to compare with the claude.ai copy's
    const given = {};
    for (const [mode, extensions] of [["1978", []], ["revival", REVIVAL], ["slips", ${JSON.stringify(WITH_SLIPS)}], ["all", [...REVIVAL, "slips", "detail"]]]) {
      for (const format of ["lisp", "json"]) for (const compact of [false, true]) given[mode + " " + format + (compact ? " compact" : "")] = t.storyPrompt(${JSON.stringify(STORY_FOR_PROMPTS)}, { extensions, format, compact });
      given[mode + " schema"] = JSON.stringify(t.storySchema(extensions));
    }
    return {
      given, repairUndo, nanoJson: JSON.stringify(nanoJson),
      knowSchema, knowPrompt: knowPrompt(lispRevival, false) && knowPrompt(jsonRevival, true) && ![lisp1978, json1978].some((p) => /personality: [^\\n]*\\bgentle\\b|helps X Y|"helps"|anticipation|is-obedient-to by/.test(p)),
      cindy: t.sameForms(t.cindyExample(), back) && !t.tidyStory(back).fixes.length && !t.checkStory(back).problems.length,
      strict1978: strict(s1978), strictRevival: strict(sRevival),
      example: valid(t.cindyJson(), sRevival) && valid(t.cindyJson(), s1978),
      kinds1978: kinds(s1978), kindsRevival: kinds(sRevival),
      words: JSON.stringify(physical) === JSON.stringify([...t.slotWords("physical", REVIVAL), "strong"]),
      anthropic: !/"maxItems"/.test(anth) && !/"minItems":[2-9]/.test(anth) && /"pattern"/.test(anth),
      portable: !/"pattern"|null|"type":\\[/.test(nano) && nano === gemini,
      lisp1978: /Ani can't show \\(meets X Y\\) on its own/.test(lisp1978) && !/JSON/.test(lisp1978),
      json1978: /written as JSON/.test(json1978) && /Ani can't show "meets" on its own/.test(json1978) && /everyone else leaves/.test(json1978) && /for EVERY ordered pair/.test(json1978) && !/change-|causedBy/.test(json1978) && /THE EXAMPLE \\(Ken's description of Cinderella, 1978, as JSON\\):\\n\`\`\`json\\n\\{/.test(json1978),
      jsonRevival: /"kind": "change-personality"/.test(jsonRevival) && /"kind": "meets", "who": X, "whom": Y/.test(jsonRevival) && /leave the pair out/.test(jsonRevival),
      lenient: !!t.storyFromReply("Here it is:\\n\`\`\`json\\n" + JSON.stringify(rrhJson) + "\\n\`\`\`") && !!t.storyFromReply("Sure. " + JSON.stringify(rrhJson)) && !t.storyFromReply("\`\`\`lisp\\n" + rrh + "\\n\`\`\`"),
      // its forms, in CINDY's order (each relationship after its characters) and with the
      // film's length aside (Ken's, two to five minutes, in the JSON way)
      rrh: JSON.stringify(t.formsOf(rrh.replace("(minutes 1) (minutes 3)", "(minutes 2) (minutes 5)")).sort()) === JSON.stringify(t.formsOf(t.lispFromJson(rrhJson)).sort()),
      net: slip !== cindy && misMended !== slip && mended.balanced === 1 && t.sameForms(mended.text, cindy) && t.checkStory(misMended).problems.some((p) => /stands on its own/.test(p))
        && t.checkStory(t.lispFromJson(undoing)).problems.some((p) => /can undo only what someone did/.test(p)) && !valid(undoing, sRevival),
      odd: /\\(physical huge\\)/.test(odd) && /\\(convey \\(chases big-bad-wolf hunter\\)\\)/.test(odd) && t.checkStory(odd).problems.some((p) => /isn't defined|two defined characters/.test(p)),
      rrhJson: t.printJson(rrhJson),
    };
  })()`);
  check(jsonWay.cindy, "Ken's CINDY read into JSON and put back into his notation has CINDY's forms, needs no tidying and passes Ani's checks");
  check(jsonWay.strict1978.ok && jsonWay.strictRevival.ok && jsonWay.example, `the schema keeps to OpenAI's strict rules and documented limits (with the extensions, KNOW's words and feelings among them: ${jsonWay.strictRevival.depth} levels of 10, ${jsonWay.strictRevival.enums} enum values of 1,000, ${jsonWay.strictRevival.props} properties of 5,000, ${jsonWay.strictRevival.chars} characters of names and values of 120,000; as in 1978, ${jsonWay.strict1978.depth} levels and ${jsonWay.strict1978.enums} enum values), and the example, Ken's CINDY as JSON, keeps to it in both modes`);
  check(jsonWay.repairUndo, "asked to fix an undoes of what no earlier scene did, a model is told each scene's name and what a later scene may undo, exactly as it must be copied");
  check(jsonWay.knowSchema, "with KNOW, the schema has its tasks (helps, avoids, follows), its words (gentle, timid; fears) and its feelings, only joy signed negative; as in 1978, none of them");
  check(jsonWay.knowPrompt, "with KNOW, the prompt (Lisp and JSON) teaches its tasks, its feelings in one form, always positive, and how its relationships are shown, with its words in the lists; as in 1978 it has none of them");
  check(!/meets|change-/.test(jsonWay.kinds1978) && /"meets"/.test(jsonWay.kindsRevival) && /"change-personality"/.test(jsonWay.kindsRevival) && /"change-relationship"/.test(jsonWay.kindsRevival) && jsonWay.words, "the schema's task forms follow the mode (meets and the changes only with the extensions), and its words are the page's vocabulary, with those Ken gave in CINDY");
  check(jsonWay.anthropic && jsonWay.portable, "each provider gets the schema as it takes one: Anthropic's without maxItems, Gemini's and Gemini Nano's without patterns or null");
  check(jsonWay.lisp1978 && jsonWay.json1978 && jsonWay.jsonRevival, "the JSON prompt has the Lisp prompt's guidance, with the task forms as JSON, in 1978 mode and with the extensions");
  check(jsonWay.net, "a \")\" too many in a scene's tasks comes out where it closed the scene too soon, one left in is a problem, and so is undoing an (establish ...), which the schema can't say");
  check(jsonWay.lenient && jsonWay.rrh && jsonWay.odd, "a reply's JSON is found in a fence or after a sentence, a Lisp reply is left to be read as Lisp, Red Riding Hood goes to JSON and back, and odd JSON comes out as Lisp the checks then question");

  // the claude.ai copy: under claude.ai's limit, it starts and draws Ken's film, and a
  // model is given the full page's prompt and schema, word for word, in each mode and way
  const artifactBytes = readFileSync(ARTIFACT).length;
  check(artifactBytes < 950000, `the claude.ai copy is ${artifactBytes.toLocaleString("en-US")} bytes, under 950,000`);
  const errorsBefore = errors.length;
  await send("Page.navigate", { url: `${base}/artifact/claude.check.html` });
  for (let k = 0; k < 75 && !(await js("!!window.__check && document.getElementById('caption-0').innerText.length > 0").catch(() => false)); k++) await sleep(200);
  const copy = await js(`(async () => {
    const t = window.__check, REVIVAL = ${JSON.stringify(REVIVAL)};
    const given = {};
    for (const [mode, extensions] of [["1978", []], ["revival", REVIVAL], ["slips", ${JSON.stringify(WITH_SLIPS)}], ["all", [...REVIVAL, "slips", "detail"]]]) {
      for (const format of ["lisp", "json"]) for (const compact of [false, true]) given[mode + " " + format + (compact ? " compact" : "")] = t.storyPrompt(${JSON.stringify(STORY_FOR_PROMPTS)}, { extensions, format, compact });
      given[mode + " schema"] = JSON.stringify(t.storySchema(extensions));
    }
    const c = document.querySelector("#fig-0 canvas"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let lit = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 200) lit++;
    return { given, caption: document.getElementById("caption-0").innerText, lit, providers: [...document.querySelectorAll("#tell-providers [data-provider]")].length };
  })()`);
  const differ = Object.keys(jsonWay.given).filter((k) => jsonWay.given[k] !== copy.given[k]);
  check(!differ.length && Object.keys(copy.given).length === 20 && /The stepmother pushes Cinderella around/.test(copy.caption) && copy.lit > 100 && errors.length === errorsBefore,
    `the claude.ai copy starts and draws Ken's film (${copy.lit} lit dots), and gives a model the full page's prompt and schema word for word, as in 1978, with the extensions, and with SLIPS and DETAIL, in Lisp and JSON${differ.length ? ` (differ: ${differ.join(", ")})` : ""}`);
  // where eval is refused (a CSP without 'unsafe-eval'), it starts too, its page script put
  // on the page as a module script of its own, and Ani's runtime, which it runs on the page
  // itself, as a classic script: nothing on the page needs eval (the review of stage 7, M3)
  await send("Page.navigate", { url: `${base}/artifact/claude.csp.html` });
  for (let k = 0; k < 75 && !(await js("!!window.__check && document.getElementById('caption-0').innerText.length > 0").catch(() => false)); k++) await sleep(200);
  const noEval = await js(`(async () => {
    const t = window.__check;
    if (!t) return { started: false };
    // (a string given to setTimeout is compiled in the page, as eval is; this expression's
    // own new Function would be DevTools', which a page's CSP doesn't refuse)
    window.__evalRan = false;
    setTimeout("window.__evalRan = true", 0);
    await new Promise((r) => setTimeout(r, 300));
    const evalRefused = !window.__evalRan;
    let runtime = "";
    try { t.ani.runtime = await t.unpack(document.getElementById("ani-runtime").textContent); const R = t.runtimeOnPage(); runtime = typeof R.makeFilmSteps; } catch (e) { runtime = String(e.message || e); }
    return { started: true, evalRefused, runtime, caption: document.getElementById("caption-0").innerText };
  })()`).catch((e) => ({ started: false, error: e.message }));
  check(noEval.started && noEval.evalRefused && noEval.runtime === "function" && /The stepmother pushes Cinderella around/.test(noEval.caption || ""),
    `where eval is refused, the claude.ai copy starts and draws Ken's film, and Ani's runtime starts on the page with no eval (eval refused: ${noEval.evalRefused}; the runtime: ${noEval.runtime || noEval.error})`);

  // the JSON way in the panel, with the model's replies stood in for: Anthropic first
  // refuses the schema (as for "Schema is too complex"), so the page asks again without
  // it; that reply names a character the story doesn't define in a task, which the page
  // leaves out, and gives a relationship no words, which the checks find a problem in;
  // "Ask Claude to fix these" asks for the whole description again as JSON, with the
  // schema; and the fixed reply passes Ani's checks
  await open();
  const toldJson = await js(`(async () => {
    const good = ${JSON.stringify(jsonWay.rrhJson)};
    const bad = good.replace('"who": "wolf"', '"who": "hunter"').replace(/"how": \\[[^\\]]*\\]/, '"how": []');
    if (!/hunter/.test(bad) || !/"how": \\[\\]/.test(bad)) return { error: "the stand-in has no task of the wolf's, or no relationship" };
    const real = window.fetch;
    const bodies = [];
    window.fetch = async (url, opts) => {
      if (!String(url).startsWith("https://api.anthropic.com/")) return real(url, opts);
      const body = JSON.parse(opts.body);
      bodies.push(body);
      if (bodies.length === 1) return new Response(JSON.stringify({ type: "error", error: { type: "invalid_request_error", message: "Schema is too complex for compilation." } }), { status: 400 });
      return new Response(JSON.stringify({ content: [{ type: "text", text: bodies.length === 2 ? bad : good }] }), { status: 200 });
    };
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.getElementById("open-teller").click();
    await wait(200);
    const side = document.getElementById("side");
    side.querySelector('[data-format="json"]').click();
    side.querySelector('[data-mode="revival"]').click();
    side.querySelector('[data-provider="anthropic"]').click();
    await wait(100);
    side.querySelector('[data-story="0"]').click();
    const key = side.querySelector("#tell-key");
    key.value = "test-key-not-real";
    key.dispatchEvent(new Event("input"));
    side.querySelector("#tell-go").click();
    for (let k = 0; k < 50 && !side.querySelector("#tell-edit"); k++) await wait(100);
    const first = side.querySelector("#tell-result").innerText;
    side.querySelector("#tell-fix").click();
    for (let k = 0; k < 50 && (bodies.length < 3 || !side.querySelector("#tell-edit")); k++) await wait(100);
    await wait(200);
    const fixed = side.querySelector("#tell-result").innerText;
    const wroteBox = [...side.querySelectorAll("#tell-result details")].find((x) => /wrote/.test(x.querySelector("summary").innerText));
    wroteBox.open = true;
    const wrote = wroteBox.querySelector("pre").innerText;
    side.querySelector("#tell-edit").click();
    await wait(300);
    const format = (b) => (b.output_config && b.output_config.format) || null;
    return {
      formats: bodies.map((b) => (format(b) ? format(b).type : "none")).join(" "),
      maxItems: bodies.some((b) => /"maxItems"/.test(JSON.stringify(format(b) || {}))),
      prompt: bodies[0].messages[0].content.slice(0, 400), again: bodies[1].messages[0].content === bodies[0].messages[0].content,
      repair: bodies[2].messages[bodies[2].messages.length - 1].content, said: bodies[2].messages[1].content === bad,
      first, fixed, wrote, lisp: document.getElementById("ed-lisp").value,
    };
  })()`);
  check(toldJson.formats === "json_schema none json_schema" && !toldJson.maxItems && /written as JSON/.test(toldJson.prompt) && toldJson.again, `the request carries the schema (Anthropic's output_config.format), and one the provider refuses is asked again without it (${toldJson.formats})`);
  check(/wrote it as JSON, which the page put into Ken's notation/.test(toldJson.first) && /left out [^;]*hunter/.test(toldJson.first) && /has no words for/.test(toldJson.first), "the draft says the model wrote JSON, that the page left out the task of a character the story doesn't define, and the checks find the relationship with no words");
  check(/Reply with the whole corrected film description as JSON, in the same form/.test(toldJson.repair) && /has no words for/.test(toldJson.repair) && toldJson.said, "asked to fix it, the model gets its JSON back and the problems, and is asked for JSON again");
  check(/4 characters/.test(toldJson.fixed) && /nothing wrong/.test(toldJson.fixed) && /"characters": \[/.test(toldJson.wrote), "the fixed draft passes Ani's checks, with what the model wrote a click away");
  check(/^;; -\*-lisp-\*-\n;; cast: red-riding-hood = Red Riding Hood \(she\)/.test(toldJson.lisp) && /\(define red-riding-hood character/.test(toldJson.lisp) && /\(compile-actors\)\s*$/.test(toldJson.lisp), "the editor gets the description in Ken's notation, cast line and all");

  // Gemini Nano, stood in for by a LanguageModel in the page: the schema goes as Chrome's
  // responseConstraint (and needn't take up its input), with the compact prompt
  const nanoReply = JSON.stringify(JSON.parse(jsonWay.rrhJson));
  const nanoScript = await send("Page.addScriptToEvaluateOnNewDocument", { source: `window.__nanoCalls = [];
    window.LanguageModel = {
      availability: async () => "available",
      create: async (opts) => ({
        inputQuota: 1e6, inputUsage: 0, measureInputUsage: async () => 1000, destroy() {},
        promptStreaming(text, o) {
          window.__nanoCalls.push({ text, constraint: o && o.responseConstraint ? JSON.stringify(o.responseConstraint) : null, omit: !!(o && o.omitResponseConstraintInput) });
          return new ReadableStream({ start(c) { c.enqueue(${JSON.stringify(nanoReply)}); c.close(); } });
        },
      }),
    };` });
  await open();
  const toldNano = await js(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.getElementById("open-teller").click();
    await wait(300);
    const side = document.getElementById("side");
    side.querySelector('[data-format="json"]').click();
    side.querySelector('[data-provider="nano"]').click();
    await wait(100);
    side.querySelector('[data-story="0"]').click();
    side.querySelector("#tell-go").click();
    for (let k = 0; k < 50 && !side.querySelector("#tell-edit"); k++) await wait(100);
    const c = window.__nanoCalls[0] || {};
    return { calls: window.__nanoCalls.length, constraint: c.constraint || "", omit: c.omit, compact: /\`\`\`json\\n\\{"characters":\\[\\{"name":"cinderella"/.test(c.text || ""), result: side.querySelector("#tell-result").innerText };
  })()`);
  await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: nanoScript.identifier });
  check(toldNano.calls === 1 && /^\{"type":"object"/.test(toldNano.constraint) && !/"pattern"/.test(toldNano.constraint) && toldNano.omit && toldNano.compact, "Gemini Nano gets the schema as Chrome's responseConstraint, not counted in its input, with the compact prompt");
  check(/Gemini Nano wrote it as JSON/.test(toldNano.result) && /4 characters/.test(toldNano.result) && /nothing wrong/.test(toldNano.result), "and its JSON reply becomes a draft that passes Ani's checks");

  // Gemini Nano's Tortoise and the Hare (NANO_TORTOISE, as the JSON it wrote), with an
  // undoes in the scene it undoes: the tidy step leaves it out, and the scene keeps its
  // other tasks, so the film can be made, from the draft and the editor, and all six
  // scenes film. Nano is already there ("available"), so though Chrome fires
  // downloadprogress anyway, nothing says it is downloading; and its JSON, padded with
  // blank lines as it streams, is shown without them.
  // as Nano streams it: the JSON with runs of blank lines, the second half a moment later
  const padded = JSON.stringify(JSON.parse(jsonWay.nanoJson), null, 1).replace(/\n/g, "\n\n\n\n   ");
  const tortoiseScript = await send("Page.addScriptToEvaluateOnNewDocument", { source: `window.__nanoStatus = [];
    window.LanguageModel = {
      availability: async () => "available",
      create: async (opts) => {
        const progress = new EventTarget();
        if (opts && opts.monitor) opts.monitor(progress);
        const e = new Event("downloadprogress"); e.loaded = 1; progress.dispatchEvent(e);
        return {
          inputQuota: 1e6, inputUsage: 0, measureInputUsage: async () => 1000, destroy() {},
          promptStreaming(text, o) {
            const all = ${JSON.stringify(padded)};
            return new ReadableStream({ async start(c) {
              c.enqueue(all.slice(0, all.length >> 1));
              for (let k = 0; k < 8; k++) { await new Promise((r) => setTimeout(r, 100)); const s = document.getElementById("tell-status"), p = document.getElementById("tell-stream"); window.__nanoStatus.push({ status: s ? s.textContent : "", stream: p ? p.textContent : "" }); }
              c.enqueue(all.slice(all.length >> 1)); c.close();
            } });
          },
        };
      },
    };` });
  await open();
  const nanoTortoise = await js(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.getElementById("open-teller").click();
    await wait(300);
    const side = document.getElementById("side");
    side.querySelector('[data-format="json"]').click();
    side.querySelector('[data-mode="revival"]').click();
    side.querySelector('[data-provider="nano"]').click();
    await wait(100);
    side.querySelector('[data-story="1"]').click();
    side.querySelector("#tell-go").click();
    for (let k = 0; k < 80 && !side.querySelector("#tell-edit"); k++) await wait(100);
    const draft = side.querySelector("#tell-result").innerText, status = document.getElementById("tell-status").textContent;
    const draftMake = !side.querySelector("#tell-fix");
    side.querySelector("#tell-edit").click();
    await wait(300);
    const out = { draft, status, draftMake, seen: window.__nanoStatus, editor: document.getElementById("ed-check").innerText, make: !document.getElementById("ed-make").disabled };
    document.getElementById("ed-make").click();
    return out;
  })()`);
  await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: tortoiseScript.identifier });
  let nanoMade = "";
  for (let k = 0; k < 300; k++) {
    await sleep(2000);
    nanoMade = await js(`document.getElementById("run-status").innerText`);
    if (!/·/.test(nanoMade)) break;
  }
  const nanoLasts = await js(`(async () => {
    document.querySelector('#runbar [data-view="1"]').click();
    const out = [];
    for (const b of document.querySelectorAll("#scenes button")) {
      b.click();
      await new Promise((r) => setTimeout(r, 30));
      out.push(Math.round(parseFloat(document.getElementById("frame-label").textContent.split("/")[1]) * 4));
    }
    return out;
  })()`);
  const leftOutUndo = /left out \(undoes tortoise \(from-scene push \(convey \(pushes hare tortoise\)\)\)\) in The Push/;
  check(/Gemini Nano wrote it as JSON/.test(nanoTortoise.draft) && leftOutUndo.test(nanoTortoise.draft) && /nothing wrong/.test(nanoTortoise.draft) && nanoTortoise.draftMake && leftOutUndo.test(nanoTortoise.editor) && nanoTortoise.make,
    "Gemini Nano's Tortoise and the Hare, with an undoes in the scene it undoes: the page leaves that task out, says so, and the film can be made, from the draft and the editor");
  check(/with the revival's extensions: 6 of 6 scenes filmed/.test(nanoMade) && JSON.stringify(nanoLasts) === JSON.stringify(EXPECTED_NANO_LAST_FRAMES),
    `and all six of its scenes film (${nanoMade.split("\n")[0]}), ending at frames ${nanoLasts.join(", ")} (Node: ${EXPECTED_NANO_LAST_FRAMES.join(", ")})`);
  const nanoSeen = nanoTortoise.seen || [];
  check(nanoSeen.length > 0 && !nanoSeen.some((x) => /download/i.test(x.status)) && !/download/i.test(nanoTortoise.status) && nanoSeen.some((x) => x.stream.length > 20) && !nanoSeen.some((x) => /\n\s*\n|\s{2,}/.test(x.stream)),
    `with Nano already there, nothing says it is downloading; and its streamed JSON is shown without its padding (${(nanoSeen.find((x) => x.stream) || { stream: "" }).stream.slice(0, 60)}...)`);

  // Ken's Beauty and the Beast as the model's reply: the draft says what the page tidied,
  // and so does the editor; missing relationships are filled in only in 1978 mode; then
  // Ani as in 1978 gets through pass 1 (and the run is stopped there)
  await open();
  const beauty = await js(`(async () => {
    const lisp = await (await fetch("/test/untidy/belfie.lisp")).text();
    const real = window.fetch;
    window.fetch = async (url, opts) => {
      if (!String(url).startsWith("https://api.anthropic.com/")) return real(url, opts);
      return new Response(JSON.stringify({ content: [{ type: "text", text: "\`\`\`lisp\\n" + lisp + "\\n\`\`\`" }] }), { status: 200 });
    };
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.getElementById("open-teller").click();
    await wait(200);
    const side = document.getElementById("side");
    side.querySelector('[data-format="lisp"]').click();
    side.querySelector('[data-mode="1978"]').click();
    side.querySelector('[data-provider="anthropic"]').click();
    await wait(100);
    side.querySelector('[data-story="2"]').click();
    const key = side.querySelector("#tell-key");
    key.value = "test-key-not-real";
    key.dispatchEvent(new Event("input"));
    side.querySelector("#tell-go").click();
    for (let k = 0; k < 50 && !side.querySelector("#tell-edit"); k++) await wait(100);
    const draft = side.querySelector("#tell-result").innerText;
    side.querySelector("#tell-edit").click();
    await wait(300);
    const editor = document.getElementById("ed-check").innerText;
    const box = document.getElementById("ed-lisp").value;
    // the same story without the relationships Ken filled in himself
    const ta = document.getElementById("ed-lisp");
    const missing = box.replace(/;; how the others feel[\\s\\S]*?(?=\\(define introduction scene)/, "");
    ta.value = missing;
    ta.dispatchEvent(new Event("change"));
    await wait(100);
    const fill1978 = !!document.getElementById("ed-fill");
    side.querySelector('[data-mode="revival"]').click();
    await wait(100);
    const fillRevival = !!document.getElementById("ed-fill"), said = document.getElementById("ed-check").innerText;
    side.querySelector('[data-mode="1978"]').click();
    ta.value = box;
    ta.dispatchEvent(new Event("change"));
    await wait(100);
    return { draft, editor, said, fill1978, fillRevival, tidied: /\\(physical \\(and ugly physically-strong\\)\\)/.test(box) && !/\\(meets belle\\)\\)/.test(box), make: !document.getElementById("ed-make").disabled };
  })()`);
  const note = /The page tidied the description: put \(and \.\.\.\) around beast's looks; left out \(prevents beast \(meets belle\)\) in Kept Apart; left out \(aware belle \(getting-it-on beast\)\) in Justice; made \(relationship-of belle beast\) one part of the focus\./;
  check(note.test(beauty.draft) && /nothing wrong/.test(beauty.draft), "the model's draft of Ken's Beauty and the Beast is tidied, and says so, and then passes Ani's checks");
  check(note.test(beauty.editor) && beauty.tidied && beauty.make, "the editor has the tidied description, says what was tidied, and can make it");
  check(beauty.fill1978 && !beauty.fillRevival && /take a missing relationship as unknown, which is neutral/.test(beauty.said), "missing relationships are filled in (as “is polite to”) only as in 1978; with the extensions a missing one is neutral, and the editor says so");
  await js(`document.getElementById("ed-check").scrollIntoView({ block: "start" })`);
  await shot("3d-tidy-note.png");
  await phone("3e-tidy-note-phone.png", `document.getElementById("ed-check")`);
  await js(`document.getElementById("ed-make").click()`);
  let pass1 = "";
  for (let k = 0; k < 60; k++) {
    await sleep(1000);
    pass1 = await js(`document.getElementById("run-status").innerText`);
    if (!/Pass 1/.test(pass1)) break;
  }
  const madeNote = await js(`document.getElementById("side").innerText`);
  await js(`document.getElementById("run-stop").hidden || document.getElementById("run-stop").click()`);
  check(/Pass 2|scenes? filmed/.test(pass1) && !/stopped in pass 1/.test(pass1) && note.test(madeNote), `then Ani as in 1978 gets through pass 1 (${pass1.replace(/\s+/g, " ").slice(0, 80)}), and the film's panel says what was tidied`);

  // a new story Ani as in 1978 stops on: the model's reply is stood in for again
  // (test/stories/tortoise-and-hare.lisp), and Ani makes it in 1978 mode
  await open();
  const asked = await js(`(async () => {
    const lisp = await (await fetch("/test/stories/tortoise-and-hare.lisp")).text();
    const real = window.fetch;
    let prompt = null;
    window.fetch = async (url, opts) => {
      if (!String(url).startsWith("https://api.anthropic.com/")) return real(url, opts);
      prompt = JSON.parse(opts.body).messages[0].content;
      return new Response(JSON.stringify({ content: [{ type: "text", text: "\`\`\`lisp\\n" + lisp + "\\n\`\`\`" }] }), { status: 200 });
    };
    document.getElementById("open-teller").click();
    await new Promise((r) => setTimeout(r, 200));
    const side = document.getElementById("side");
    side.querySelector('[data-format="lisp"]').click();
    side.querySelector('[data-provider="anthropic"]').click();
    await new Promise((r) => setTimeout(r, 100));
    side.querySelector('[data-story="1"]').click();
    const key = side.querySelector("#tell-key");
    key.value = "test-key-not-real";
    key.dispatchEvent(new Event("input"));
    side.querySelector("#tell-go").click();
    for (let k = 0; k < 50 && !side.querySelector("#tell-edit"); k++) await new Promise((r) => setTimeout(r, 100));
    side.querySelector("#tell-edit").click();
    await new Promise((r) => setTimeout(r, 200));
    document.getElementById("ed-make").click();
    return prompt;
  })()`);
  check(/everyone else leaves/.test(asked || "") && /Ani can't show \(meets X Y\) on its own/.test(asked || ""), "in 1978 mode the prompt says what (alone X Y) means, and that Ani can't show meeting on its own");
  check(!/\(change \(/.test(asked || "") && !/causes/.test(asked || ""), "in 1978 mode the prompt doesn't offer a change");
  check(/For characters who have little to do with each other, use is-polite-to: Ani has no neutral word/.test(asked || "") && /The film's levels in the example are Cinderella's: set each to suit your story/.test(asked || "") && /establish their feelings there, not their personality/.test(asked || ""), "the prompt says why is-polite-to, asks for the story's own film levels, and for a beaten villain's feelings, not personality");
  check(!/Send this story to Ken/.test(await js(`document.getElementById("side").innerText`)), "with no DSN, nothing offers to send a story to Ken");
  // click each character on a screen until the glass box is the one named, then run then()
  const clickOn = (fig, name, then) => js(`(async () => {
    const c = document.querySelector("#${fig} canvas");
    for (let y = 0; y < 413; y += 3) for (let x = 0; x < 551; x += 3) {
      const r = c.getBoundingClientRect();
      const at = { clientX: r.left + x / 551 * r.width, clientY: r.top + y / 413 * r.height, bubbles: true };
      c.dispatchEvent(new MouseEvent("mousemove", at));
      if (!c.classList.contains("over")) continue;
      c.dispatchEvent(new MouseEvent("click", at));
      // a message, not a timer: once the page has been frozen and resumed (Chrome's freeze,
      // below) headless Chrome keeps it hidden, and a hidden page's timers wait a second each
      await new Promise((r) => { const ch = new MessageChannel(); ch.port1.onmessage = () => r(); ch.port2.postMessage(0); });
      const h = document.querySelector("#side h2");
      if (h && h.innerText === ${JSON.stringify(name)}) return (${then})();
    }
    return { found: false };
  })()`);
  // (each step's start, in seconds, is printed: the page's STEP_SECONDS are measured so)
  const finished = async (tries = 150) => {
    let status = "";
    const t0 = Date.now(), steps = [];
    for (let k = 0; k < tries; k++) {
      await sleep(3000);
      status = await js(`document.getElementById("run-status").innerText`);
      if (!/·/.test(status)) break;
      const what = status.split(" · ")[0].trim();
      if (!steps.length || steps[steps.length - 1][1] !== what) steps.push([Math.round((Date.now() - t0) / 1000), what]);
    }
    console.log(`      steps, in seconds from the start (headless Chrome): ${steps.map(([t, w]) => `${t} ${w}`).join("; ")}; done at ${Math.round((Date.now() - t0) / 1000)}`);
    return status;
  };
  const stopped = await finished();
  const told = await js(`(() => { const b = document.querySelector("#side .stop-box"); return b ? b.innerText : ""; })()`);
  check(/0 of 3 scenes filmed, 3 stopped/.test(stopped), `Ani as in 1978 stops on the tortoise and the hare: ${stopped}`);
  check(/gave up on the hare's activity level/.test(told) && /can't weigh a value of none/.test(told), "the page says why, in a plain sentence");
  check(/Make it again with the revival's extensions/.test(told), "and offers \"Make it again with the revival's extensions\"");
  check(/What Lisp said/.test(told), "with what Lisp said a click away");
  await shot("4-stopped-in-1978.png");
  await phone("4b-stopped-in-1978-phone.png", `document.querySelector("#side .stop-box")`);

  // made again with the revival's extensions (MEND and APPEAR)
  const t1 = Date.now();
  await js(`document.querySelector("#side .stop-box [data-remake]").click()`);
  await sleep(300);
  const mode = await js(`localStorage.getItem("ani-cinderella:mode:v1")`);
  const mended = await finished();
  check(mode === "revival" && /with the revival's extensions: 3 of 3 scenes filmed/.test(mended), `with them, Ani makes it again (${Math.round((Date.now() - t1) / 1000)} s): ${mended}`);
  // the last frame of each scene of your version, at 4 frames a second
  const lastsOf = (n) => js(`(async () => {
    document.querySelector('#runbar [data-view="1"]').click();
    const out = [];
    for (const b of [...document.querySelectorAll("#scenes button")].slice(0, ${n})) {
      b.click();
      await new Promise((r) => setTimeout(r, 30));
      out.push(Math.round(parseFloat(document.getElementById("frame-label").textContent.split("/")[1]) * 4));
    }
    return out;
  })()`);
  const mendedLasts = await lastsOf(3);
  check(JSON.stringify(mendedLasts) === JSON.stringify(EXPECTED_MENDED_LAST_FRAMES), `its three scenes end at frames ${mendedLasts.join(", ")} (Node: ${EXPECTED_MENDED_LAST_FRAMES.join(", ")})`);
  await shot("5-made-with-repairs.png");
  const glass = await js(`(async () => {
    document.querySelector("#scenes button").click();
    const s = document.getElementById("scrub"); s.value = 10; s.dispatchEvent(new Event("input"));
    await new Promise((r) => setTimeout(r, 100));
    const c = document.querySelector("#fig-1 canvas");
    const r = c.getBoundingClientRect();
    for (let y = 0; y < 413; y += 3) for (let x = 0; x < 551; x += 3) {
      const at = { clientX: r.left + x / 551 * r.width, clientY: r.top + y / 413 * r.height, bubbles: true };
      c.dispatchEvent(new MouseEvent("mousemove", at));
      if (c.classList.contains("over")) {
        c.dispatchEvent(new MouseEvent("click", at));
        const box = document.querySelector("#side .repairs");
        return box ? box.innerText : "no repairs section: " + document.getElementById("side").innerText.slice(0, 200);
      }
    }
    return "no character found";
  })()`);
  check(/Ani's pass 1 gave up on the hare's activity level; the revival's repairs read it as medium, as Ani already reads an element it never set\./.test(glass), "the glass box says what the repairs did, in plain English");
  await js(`document.querySelector("#side .repairs") && document.querySelector("#side .repairs").scrollIntoView({ block: "start" })`);
  await shot("6-glass-box-repairs.png");
  // a new character has no 1978 look of Ken's: "How he looks" ends with the shape Ani as in
  // 1978 would have given him
  const newLooks = await js(`(() => { const d = document.querySelector("#side details.looks"); if (!d) return ""; d.open = true; return d.innerText; })()`);
  check(/^How (he|she|they) looks?\s+Ani made (him|her|them) (a|an) /.test(newLooks) && /With Ani as in 1978, the (hare|tortoise) would be (a|an) [a-z]+: a new character takes the next of the six shapes no one in the story has\.\s*$/.test(newLooks), `a new character's "How he looks": ${newLooks.split("\n").filter((l) => l.trim()).slice(1).join(" ")}`);
  // with APPEAR, the hare and the tortoise are drawn as Ani chose them (tools/run-story.mjs:
  // the tortoise a small square, the hare a large eight-pointed star)
  const fable = await js(`document.getElementById("legend").innerText`);
  check(/The hare: eight-pointed star/.test(fable) && /The tortoise: square/.test(fable), `the hare and the tortoise are drawn as Ani chose them (${fable.replace(/\n/g, "; ")})`);
  const tortoise = await clickOn("fig-1", "The tortoise", `() => { const d = document.querySelector("#side details.looks"); if (!d) return { found: true, text: "" }; d.open = true; return { found: true, text: d.innerText }; }`);
  check(/simple because he moves fast \(Ani made him fast because he is hard working and determined and the film's energy is high\), though slower than the hare\./.test(tortoise.text || ""), `the tortoise's "How he looks" says why he moves fast, and that he is slower than the hare: ${(tortoise.text || "").split("\n").filter((l) => l.trim())[1] || ""}`);

  // "Tell Ani what's wrong" with Ken's own example (20 October), on the tortoise and the hare
  // just made: "the hare is unhappy and should move slowly in the final scene" is a change to
  // the story, not criticism of how Ani made the film, so it goes to "Change the story" with
  // (establish (emotional-state hare (joy (negative high)))) added to The Finish, for the
  // visitor to look over and make (the model's reply stood in for; no model is called)
  const hare = await js(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const SAID = "the hare is unhappy and should move slowly in the final scene";
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await wait(200);
    const real = window.fetch, calls = [];
    window.fetch = async (url, opts) => {
      calls.push(String(url));
      if (!String(url).startsWith("https://api.anthropic.com/")) return real(url, opts);
      window.__hareBody = JSON.parse(opts.body);
      const reply = { items: [{ kind: "story", scene: "the-finish", add: { kind: "establish-emotional-state", who: "hare", feelings: [{ feeling: "joy", sign: "negative", amount: "high" }] }, change: "the hare is unhappy in the final scene", said: SAID }] };
      return new Response(JSON.stringify({ content: [{ type: "text", text: JSON.stringify(reply) }] }), { status: 200 });
    };
    const side = document.getElementById("side");
    const tell = side.querySelector(".crit-tell");
    if (!tell) return { error: "no Tell Ani what's wrong: " + side.innerText.slice(0, 200) };
    tell.open = true;
    side.querySelector('[data-crq-provider="anthropic"]').click();
    await wait(100);
    const key = document.getElementById("crq-key");
    key.value = "test-key-not-real";
    key.dispatchEvent(new Event("input", { bubbles: true }));
    const words = document.getElementById("crq-words");
    words.value = SAID;
    words.dispatchEvent(new Event("input", { bubbles: true }));
    document.querySelector('.crit-tell [data-crq="go"]').click();
    for (let k = 0; k < 50 && !document.querySelector(".crq-items"); k++) await wait(100);
    window.fetch = real;
    const body = window.__hareBody;
    const item = (document.querySelector(".crq-item") || {}).innerText || "";
    const schema = body && body.output_config.format.schema;
    const story = schema && schema.properties.items.items.anyOf.find((x) => x.properties.kind.enum[0] === "story");
    document.querySelector('.crq-item [data-crq="act"]').click();
    await wait(300);
    const lisp = document.getElementById("ed-lisp").value;
    const finish = lisp.slice(lisp.indexOf("(define the-finish scene"), lisp.indexOf("(declare"));
    return { calls, item, panel: side.querySelector("h2").innerText, note: (document.querySelector("#side .crit-added") || {}).innerText || "", finish, lispOpen: document.getElementById("ed-lisp-box").open,
      scenes: story ? story.properties.scene.enum : null, who: story ? story.properties.add.anyOf[0].properties.who.enum : null, prompt: body ? body.messages[0].content.includes(SAID) : false,
      rest: /\\(define the-boast scene/.test(lisp) && /\\(define the-race scene/.test(lisp) && /\\(define tortoise-and-hare-film film/.test(lisp) && (lisp.match(/emotional-state hare \\(joy/g) || []).length === 1 };
  })()`);
  check(!hare.error && hare.calls.length === 1 && hare.prompt && JSON.stringify(hare.scenes) === JSON.stringify(["the-boast", "the-race", "the-finish", "none"]) && JSON.stringify(hare.who) === JSON.stringify(["hare", "tortoise"])
    && /^A change to the story, not criticism of how Ani made it: the hare is unhappy in the final scene\. In The Finish, Ani would be told \(establish \(emotional-state hare \(joy \(negative high\)\)\)\): the hare is [a-z ]*unhappy\./.test(hare.item),
    `Ken's "the hare is unhappy and should move slowly in the final scene" is read as a change to the story (${(hare.item || hare.error || "").split("(you said")[0].trim()})`);
  check(hare.panel === "Change the story" && /^From “Tell Ani what's wrong”: in The Finish, Ani is told \(establish \(emotional-state hare \(joy \(negative high\)\)\)\)/.test(hare.note) && hare.lispOpen
    && /\(establish \(emotional-state hare \(pride \(negative high\)\)\)\)\s*\n\s*\(establish \(emotional-state hare \(joy \(negative high\)\)\)\)\)\)/.test(hare.finish) && hare.rest,
    `"Change the story this way" opens the editor with the task added to The Finish, and the rest of the story as it was, for the visitor to make (${hare.note.slice(0, 60)}...)`);
  await shot("18-hare-to-the-editor.png");
  await js(`document.getElementById("ed-close").click()`);

  // a story whose scene is called fear (test/stories/stress/know-scene-named-fear.lisp, as
  // the model's reply): with KNOW, fear is a feeling EMOTE defines, and would replace the
  // scene, so the page renames it fear-scene, as src/pipeline.js storyWithoutClashes does,
  // says why in the draft, the editor and the film's panel, and Ani films it
  await open();
  const clash = await js(`(async () => {
    const lisp = await (await fetch("/test/stories/stress/know-scene-named-fear.lisp")).text();
    const real = window.fetch;
    window.fetch = async (url, opts) => {
      if (!String(url).startsWith("https://api.anthropic.com/")) return real(url, opts);
      return new Response(JSON.stringify({ content: [{ type: "text", text: "\`\`\`lisp\\n" + lisp + "\\n\`\`\`" }] }), { status: 200 });
    };
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.getElementById("open-teller").click();
    await wait(200);
    const side = document.getElementById("side");
    side.querySelector('[data-format="lisp"]').click();
    side.querySelector('[data-mode="revival"]').click();
    side.querySelector('[data-provider="anthropic"]').click();
    await wait(100);
    side.querySelector('[data-story="0"]').click();
    const key = side.querySelector("#tell-key");
    key.value = "test-key-not-real";
    key.dispatchEvent(new Event("input"));
    side.querySelector("#tell-go").click();
    for (let k = 0; k < 50 && !side.querySelector("#tell-edit"); k++) await wait(100);
    const draft = side.querySelector("#tell-result").innerText;
    side.querySelector("#tell-edit").click();
    await wait(300);
    const editor = document.getElementById("ed-check").innerText, text = document.getElementById("ed-lisp").value;
    document.getElementById("ed-make").click();
    return { draft, editor, text };
  })()`);
  const clashMade = await finished();
  const clashPanel = await js(`(() => { document.querySelectorAll("#side details").forEach((d) => (d.open = true)); return document.getElementById("side").innerText + " | " + [...document.querySelectorAll("#scenes button")].map((b) => b.innerText).join(" "); })()`);
  const renamedNote = /renamed the scene “fear” to fear-scene, since fear is one of Ani's feelings/;
  check(renamedNote.test(clash.draft) && renamedNote.test(clash.editor) && /\(define fear-scene scene/.test(clash.text) && /;; scenes: fear-scene = Fear/.test(clash.text),
    "a story's scene called fear is renamed fear-scene with KNOW on, its title kept, and the draft and the editor say so");
  check(/with the revival's extensions: 1 of 1 scenes? filmed/.test(clashMade) && renamedNote.test(clashPanel) && /Your scene “fear” is called fear-scene here: fear is one of Ani's feelings, and the file that defines it, Ken's EMOTE, would replace your scene when it loads\./.test(clashPanel),
    `and Ani films it (${clashMade.split("\n")[0]}), and the film's panel says why, in plain words`);
  await shot("6b-renamed-scene.png");

  // Ken's Cinderella as it is, made with the extensions: with APPEAR, Ani draws his cast
  await open();
  await js(`document.getElementById("open-editor").click()`);
  await sleep(200);
  await js(`document.getElementById("ed-reset").click()`);
  await sleep(200);
  const asIs = await js(`({ enabled: !document.getElementById("ed-make").disabled, note: document.getElementById("ed-check").innerText, mode: ([...document.querySelectorAll("#side [data-mode]")].find((b) => b.getAttribute("aria-pressed") === "true") || {}).dataset?.mode })`);
  check(asIs.mode === "revival" && asIs.enabled && /This is Ken's story as it is\. With the revival's extensions Ani knows words, relationships, ways of showing and feelings Ken could have added, chooses each character's size, shape and colors, which Ken chose himself, has a character whose only part is a change of feeling wander about while it runs, so that it is seen, and keeps each scene to the time its length gives it, a walk taking its stretch once/.test(asIs.note), "with the extensions on, Ken's story as it is can be made again, and the editor says why");
  await js(`document.querySelector('#side [data-mode="1978"]').click()`);
  await sleep(100);
  const as1978 = await js(`!document.getElementById("ed-make").disabled`);
  await js(`document.querySelector('#side [data-mode="revival"]').click()`);
  await sleep(100);
  check(!as1978, "in 1978 mode it can't: it is Ken's film");
  const t2 = Date.now();
  await js(`document.getElementById("ed-make").click()`);
  const looked = await finished(400);
  check(/with the revival's extensions: 5 of 5 scenes filmed/.test(looked), `Ani makes Ken's Cinderella with the extensions (${Math.round((Date.now() - t2) / 1000)} s): ${looked}`);
  const looksLasts = await lastsOf(5);
  check(JSON.stringify(looksLasts) === JSON.stringify(EXPECTED_LOOKS_LAST_FRAMES), `its scenes end at frames ${looksLasts.join(", ")} (Node, with the same extensions: ${EXPECTED_LOOKS_LAST_FRAMES.join(", ")})`);
  // the legend and each icon from Ani's looks, beside Ken's: a path's points, or a circle
  const cast = () => js(`(() => {
    document.querySelector('#runbar [data-view="both"]').click();
    const legend = [...document.querySelectorAll("#legend span")].map((s) => s.innerText + " [" + [...s.querySelectorAll("svg")].map((g) => (g.querySelector("circle") ? "circle" : g.querySelector("path").getAttribute("d").split("L").length + " points")).join(", ") + "]").join("; ");
    const drawn = document.querySelector("#side .cast-looks");
    return { legend, drawn: drawn ? drawn.innerText.replace(/\\s*why\\?/g, "").replace(/\\n+/g, "; ") : "" };
  })()`);
  const drew = await cast();
  const castOk = (x) => /Cinderella: star in 1978, hexagon in yours \[5 points, 6 points\]/.test(x.legend) && /The stepmother: square in 1978, triangle in yours \[4 points, 3 points\]/.test(x.legend)
    && /The fairy godmother: circle in 1978, eight-pointed star in yours \[circle, 8 points\]/.test(x.legend) && /The Prince: triangle in 1978, circle in yours \[3 points, circle\]/.test(x.legend);
  check(castOk(drew), `the screens' legend and icons are Ani's looks beside Ken's: ${drew.legend}`);
  check(/Cinderella: a small hexagon in a dull purple \(in 1978, a green star\)/.test(drew.drawn) && /The stepmother: a large triangle in a dark, dull blue \(in 1978, a red square\)/.test(drew.drawn) && /The fairy godmother: an eight-pointed star in a bright orange \(in 1978, an orange circle\)/.test(drew.drawn) && /The Prince: a large circle in a bright, clear red \(in 1978, a yellow triangle\)/.test(drew.drawn), `"How Ani drew them", in Ani's colors: ${drew.drawn}`);
  await js(`(() => { document.querySelector("#scenes button").click(); const s = document.getElementById("scrub"); s.value = 12; s.dispatchEvent(new Event("input")); })()`);
  await sleep(200);
  await shot("7-cinderella-with-looks.png");
  // her glass box: "How she looks", closed, a sentence made from Ani's reasons, each aspect
  // opening its choice point with the evidence, and Ken's 1978 look at the end
  const how = await clickOn("fig-1", "Cinderella", `async () => {
    const d = document.querySelector("#side details.looks");
    if (!d) return { found: true, text: "" };
    const closed = !d.open;
    d.open = true;
    d.querySelector('[data-look="cinderella|size"]').click();
    await new Promise((r) => setTimeout(r, 50));
    d.scrollIntoView({ block: "start" });
    return { found: true, closed, text: d.innerText, box: d.querySelector("#look-box").innerText };
  }`);
  check(how.found && how.closed && /^How she looks\s+Ani made her a small hexagon: small because she is shy and the film isn't to be flashy; smooth because she is friendly and graceful; moderately complex, from suggestions Ani combined\./.test(how.text), `her glass box has "How she looks", closed, with a sentence from Ani's reasons: ${(how.text || "").split("\n").filter((l) => l.trim())[1] || ""}`);
  const howText = how.text || "", howBox = how.box || "";
  check(/\nAni colored her a dull purple: neither bright nor dark, a compromise between bright, because she is good \(the opposite of evil\), and dark, because the film isn't to be flashy; dull because she is shabby and the film isn't to be flashy \(clear, for “beautiful”, set aside as not compatible with the others\); purple, since nothing suggests a hue for her and no one had a hue yet: the film's medium variety takes the middle one of the revival's list of hues.{0,8}; and by the same rule the stepmother, the fairy godmother and the Prince are each drawn in another hue than her\./.test(howText),
    `and a sentence for her colors, with Ani's reasons, its compromise, what it set aside, and what decided her hue: ${(howText.match(/Ani colored her[^\n]*/) || [""])[0]}`);
  check(/“evil” suggests dark, and so its opposite “good” bright\. Ken's: .?bad guys wear black.? \(thesis, p\. 161\)/.test(howText) && /The film's flashiness reaches brightness and clarity\. Ken's code: .?color is many and bright is flashier.? \(glosug\.41:40\)/.test(howText) && /“shabby” suggests dull\. the revival's: a shabby character's clothes are faded/.test(howText) && /“beautiful” suggests clear\. the revival's: /.test(howText)
    && /The order of the hues: yellow, orange, red, purple, blue and green\. the revival's: where nothing else decides between hues, the film's variety takes them in this order, round Johannes Itten's color circle from the yellow at its top\. .*decision 4.*decision 11.*the hues the rule leaves/.test(howText),
    "where each reason for her colors comes from, Ken's knowledge quoted and the revival's marked as the revival's, the order of the hues among it");
  check(/In part 1, to show that Cinderella is a little happy, Ani brightens her colors, from a brightness of \.65 to \.7\d* \(1 is the screen's brightest\): a look change.*by the same amount at the same speed; only color mode shows it\.\s*Ken's, .?a suggestion for how to establish that a character is very happy is that the intensity of the colors of the character be increased.? \(thesis, p\. 166\); the revival's: a less happy character brightens less/.test(howText),
    `and, in the Introduction, her look change, with Ken's evidence and the revival's reason: ${(howText.match(/In part \d+, to show[^\n]*/) || [""])[0].slice(0, 160)}`);
  check(/In 1978 Ken drew her himself as a green star: the star in initialize-characters/.test(howText) && /the green in running-color/.test(howText) && /In 1978 Ken drew her/.test(howText.split("\n").filter(Boolean).pop() || ""), "it ends with how Ken drew her in 1978, and where he said so");
  check(/She is shy, which suggests small\.\s*the revival's: a shy character keeps small and takes up little room/.test(howBox) && /size is also bigger is flashier.{0,3}\s*\(Ken's code, glosug\.41:39\)/.test(howBox), "\"small\" opens her size's choice point, with Ken's code quoted and the revival's knowledge marked as the revival's");
  await shot("8-how-she-looks.png");
  // the stepmother's: large, as Ken drew her, by his own knowledge (strong, p. 238, his
  // decision of 11 October; dominates, relate.22:63), the thesis quoted as the thesis's
  const step = await clickOn("fig-1", "The stepmother", `async () => {
    const d = document.querySelector("#side details.looks");
    if (!d) return { found: true, text: "" };
    d.open = true;
    d.querySelector('[data-look="step-mother|size"]').click();
    await new Promise((r) => setTimeout(r, 50));
    d.scrollIntoView({ block: "start" });
    return { found: true, text: d.innerText, box: d.querySelector("#look-box").innerText };
  }`);
  // her hue, by Ken's uniqueness rule for hues (his decision 11): any but the others'
  check(/\nAni colored her a dark, dull blue: dark because she is evil and is to be different in brightness from Cinderella and the fairy godmother; dull because she is ugly \(the opposite of beautiful\) and the film isn't to be flashy; any hue but orange, purple and red: she is to look different from the Prince \(red\), Cinderella \(purple\) and the fairy godmother \(orange\), by Ken's rule that a unique character should “move \(or appear\) differently” \(thesis p\. 94\), which the revival applies to hue as he decided; drawn blue, as the film's medium variety takes the middle one of the hues left, yellow, blue and green, in the order of the revival's list/.test(step.text || "")
    && /A character unique in its looks is to look different from the others, in its hue too\. Ken's: .?the finding that a character is unique suggests that that character move \(or appear\) differently from the others.? \(thesis, p\. 94\); the revival's: Ken's rule applied by the revival to a hue/.test(step.text || "")
    && /On the black screen a dark, dull blue would be hard to see \(2\.55:1 against black\), so the page draws her lighter, in the same hue, at 3:1\./.test(step.text || ""),
    `the stepmother's colors, with Ani's reasons: her hue kept apart from the others' by Ken's rule, applied by the revival, and drawn lighter on the black screen: ${((step.text || "").match(/Ani colored her[^\n]*/) || [""])[0]}`);
  check(step.found && /^How she looks\s+Ani made her a large triangle: large because she is strong and is to be larger than Cinderella/.test(step.text || "") && /strong friendly ally.{0,3}\s*\(thesis, p\. 238\)/.test(step.box || "") && /In 1978 Ken drew her himself as a large red square/.test(step.text || ""), `the stepmother's "How she looks": ${(step.text || "").split("\n").filter((l) => l.trim())[1] || ""}`);
  await shot("8b-how-the-stepmother-looks.png");
  const kens = await clickOn("fig-0", "Cinderella", `() => ({ found: true, looks: !!document.querySelector("#side details.looks") })`);
  check(kens.found && !kens.looks, "Ken's 1978 film's glass box has no \"How she looks\": he drew her himself");
  // KNOW's part in it (reports/ext/know/README.md): Cinderella follows her stepmother and
  // helps the Prince in the Introduction, where in 1978 Ani had no idea how, and the
  // stepmother is proud in Kept Apart; each is marked in the glass box as the revival's
  // knowledge, with its reason. The film comes back in the page that hands its runs to
  // the check, which finds the frame halfway through each activity.
  await send("Page.navigate", { url: `${base}/app/film.check.html` });
  for (let k = 0; k < 100 && !(await js(`!!window.__check && /5 of 5 scenes filmed/.test(document.getElementById("run-status").innerText)`).catch(() => false)); k++) await sleep(200);
  const knowAt = async (sceneIndex, activity, name) => {
    await js(`(async () => {
      document.querySelector('#runbar [data-view="1"]').click();
      document.querySelectorAll("#scenes button")[${sceneIndex}].click();
      await new Promise((r) => setTimeout(r, 50));
      const sc = window.__check.RUNS[1].scenes[${sceneIndex}];
      const a = sc.activities.find((x) => (${JSON.stringify(activity)} ? x.base === ${JSON.stringify(activity)} : x.chars.includes(${JSON.stringify(name === "The stepmother" ? "step-mother" : "")})) && x.begin !== null);
      const s = document.getElementById("scrub");
      s.value = a ? (a.begin + a.end) / 2 / ((sc.film && sc.film.fps) || 4) : 0;
      s.dispatchEvent(new Event("input"));
      await new Promise((r) => setTimeout(r, 100));
    })()`);
    return clickOn("fig-1", name, `() => {
      document.querySelectorAll("#side details").forEach((d) => (d.open = true));
      const k = document.querySelector("#side details.knowledge");
      return { found: true, lead: (document.querySelector("#side .lead") || {}).innerText || "", why: ([...document.querySelectorAll("#side details")].map((d) => d.innerText).find((x) => /^Why/.test(x)) || ""), knowledge: k ? k.innerText : "" };
    }`);
  };
  const following = await knowAt(0, "following", "Cinderella");
  check(following.found && /^Cinderella is following the other\./.test(following.lead) && /To convey that Cinderella follows the stepmother, .*\(the revival's way of showing it\)/.test(following.why) && /To establish that Cinderella is obedient to and is tolerant of the stepmother .*\(shown as the revival's knowledge of “is obedient to” says\)/.test(following.why)
    && /Cinderella follows the stepmother, shown by the revival's follows-behind: the leader goes on ahead, and the follower follows it, keeping behind\. the revival's: /.test(following.knowledge) && /Cinderella is obedient to and is tolerant of the stepmother, which Ani shows by following: the revival's knowledge gives “is obedient to” that way of showing it\. the revival's: in 1978 "Ani has no idea how/.test(following.knowledge),
    `with KNOW, Cinderella follows her stepmother in the Introduction, and the glass box marks it as the revival's knowledge, with its reason: ${following.lead} | ${(following.knowledge.split("\n")[1] || "").slice(0, 120)}`);
  const helping = await knowAt(0, "helping-along", "Cinderella");
  check(helping.found && /^Cinderella is helping the other along, from behind \(with the Prince\)\./.test(helping.lead) && /Cinderella helps the Prince, shown by the revival's helps-along: the one helped sets off alone, slowly, and the helper goes round behind it and helps it along\. the revival's: "Ani had decided to have Cinderella help the Prince/.test(helping.knowledge),
    `and helps the Prince along, where in 1978 Ani "canceled it": ${helping.lead}`);
  const proud = await knowAt(1, null, "The stepmother");
  check(proud.found && /The stepmother is proud, which the revival's pride shows: the stepmother's deliberateness rises and the stepmother's jaggedness of the path falls\. the revival's: a proud character/.test(proud.knowledge),
    `and in Kept Apart the stepmother's pride smooths her paths, as the revival's knowledge: ${(proud.knowledge.match(/The stepmother is proud[^.]*\./) || [""])[0]}`);
  await shot("8c-what-the-revivals-knowledge-did.png");
  // FIT (reports/ext/fit/README.md, "On the page"): No Longer Kept Apart, planned 3.98
  // seconds, held to its least, 10, the godmother's task to its most, 6.95, and her walk
  // taking its stretch once: each said in the glass box, with Ken's lines, in "How Ani
  // timed it" and in the caption
  const fit = await js(`(() => {
    const t = window.__check, run = t.RUNS[1], i = run.sceneIds.indexOf("no-longer-kept-apart"), sc = run.scenes[i];
    const plain = (s) => s.replace(/<[^>]+>/g, "").replace(/\\s+/g, " ").trim();
    return { notes: t.repairsIn(run, sc).map((r) => plain(r.html)), timing: plain(t.atScene(i, () => t.using(run, () => t.fitTiming(run, sc, "convey-task-3")))),
      caption: (() => { const c = t.captionAt(run, i, 10); return [c.text, ...c.more].join(" ").replace(/<[^>]+>/g, ""); })() };
  })()`);
  check(fit.notes.some((n) => /^No Longer Kept Apart is to run 10 to 25 seconds, the time its length gives it, but Ani planned it at 3\.98 s, short of its least: Ken's CHOMET .*\(chomet\.123:39-74\).* The revival holds a scene to its length's bounds once its tasks have their times \(Ken's decision of 16 October\), 10 s: “[^”]+”, 10 s where it was 3\.98 s; SCENE stretches each part's ways of showing to fill its time/.test(n))
    && fit.notes.some((n) => /^Holding the scene to its length, “[^”]+” would take 10 s, more than its most, 6\.95 s\. Ken's adjust-task-lengths gave a task above its most its least and one below its least its most \(chomet\.123:167-180\), 2\.79 s here; the revival gives it its most, 6\.95 s/.test(n))
    && fit.notes.some((n) => /^In part 1, as .*SCENE slows the part's walks \(×0\.4\) to fill its time\. Ken's PLACE writes that into each new walk's own speed \(place\.45:455-461\), and his Director multiplied it in again the first time the walk was set \(dichar\.103:27-31\), so the fairy godmother's walk took the slowing twice \(×0\.4 and ×0\.4 again, ×0\.16\)\. The revival takes it once/.test(n))
    && /^The scene's tasks came to 3\.98 s, short of its least, 10 s; the revival holds a scene to the time its length gives it \(FIT, Ken's decision of 16 October\), 10 s, and this task's time went from 3\.98 s to 10 s; that is past its most, 6\.95 s/.test(fit.timing)
    && /The fairy godmother's walk takes its stretch once, as SCENE planned it \(the revival's correction, FIT\)\./.test(fit.caption),
    `with FIT, No Longer Kept Apart is held to its least, and the glass box, "How Ani timed it" and the caption say so: ${fit.notes.filter((n) => /scene|SCENE/.test(n)).map((n) => n.slice(0, 160)).join(" | ")} | ${fit.timing.slice(0, 120)}`);
  // Ani's colors (APPEAR, stage 5; reports/ext/appear/README.md). In color mode the film
  // made with the extensions paints each character in the color Ani chose, as it is at
  // each frame (Cinderella a dull purple, 270 degrees, .35, .65), while Ken's film keeps
  // his (her green); a joy's look change brightens a character over frames (the Prince
  // and Cinderella in the Meeting at 24 frames a second, from reports/ext/appear/24fps),
  // a sadness dims one (Cinderella in Kept Apart), and the caption says so, with a note
  // that only color mode shows it, and where a look change shows nothing (Justice: the
  // stepmother is as dark as Ani draws anyone already); the "becomes" list speaks only of
  // a change of shape or size, never of a color's steps; a shape in the middle of a
  // change has its copies cut at the picture's edges; and a video paints the colors too.
  const colors = await js(`(async () => {
    const t = window.__check, wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const run = t.RUNS[1], ken = t.RUNS[0];
    // one character alone, drawn in color at a frame: the brightest color it is drawn in,
    // and the picture (h dots high, for a strip below the picture)
    const alone = (r, sc, f, c, h = 413) => {
      const cv = document.createElement("canvas");
      cv.width = 551; cv.height = h;
      const ctx = cv.getContext("2d");
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 551, h);
      t.drawFrame(ctx, { ...r, cast: [c] }, sc, f, { color: true });
      const d = ctx.getImageData(0, 0, 551, h).data;
      let best = [0, 0, 0];
      for (let k = 0; k < d.length; k += 4) if (d[k] + d[k + 1] + d[k + 2] > best[0] + best[1] + best[2]) best = [d[k], d[k + 1], d[k + 2]];
      return { best, d };
    };
    // in Kept Apart, from the first frame she is drawn in (frame 0 is the cleared screen)
    const ka = run.scenes[1], first = (sc) => sc.film.frames.findIndex((fr) => fr.segs.cinderella);
    const yours = alone(run, ka, first(ka), "cinderella").best, kens = alone(ken, ken.scenes[1], first(ken.scenes[1]), "cinderella").best;
    // and there her colors dim, from her first step to her last
    const steps = (ka.film.looks || []).filter((x) => x[1] === "cinderella" && x[0] > 0);
    const before = alone(run, ka, steps.length ? steps[0][0] - 1 : 0, "cinderella").best, after = alone(run, ka, steps.length ? steps[steps.length - 1][0] : 0, "cinderella").best;
    // the Meeting at 24 frames a second, as Node filmed it with APPEAR
    const get = async (p) => (await fetch(p)).json();
    const r24 = t.makeRun({ label: "Yours", short: "Yours", cindy: t.DATA.cindy, choicePoints: (await get("/reports/ext/appear/pass1.json")).choicePoints, appearances: await get("/reports/ext/appear/appearances.json"), extensions: ["appear"],
      scenes: [{ id: "meeting", film: await get("/reports/ext/appear/24fps/meeting.film.json"), glass: await get("/reports/ext/appear/24fps/meeting.glass.json") }] });
    const m = r24.scenes[3];
    const lit = (who, f) => alone(r24, m, f, who).best;
    const meeting = { prince: [lit("prince", 860), lit("prince", 1000)], cinderella: [lit("cinderella", 860), lit("cinderella", 1000)] };
    // the captions, in TV and in color
    const say = (r, i, f) => { const c = t.captionAt(r, i, f); return [c.text, ...c.more].join(" ").replace(/<[^>]+>/g, ""); };
    const partOf = (r, i, x) => r.scenes[i].subscenes.find((s) => s.name === x.subscene);
    const kaFrame = partOf(run, 1, ka.glass.lookChanges.find((x) => x.character === "cinderella")).begin + 2;
    const ju = run.scenes[4], juFrame = partOf(run, 4, ju.glass.lookChanges[0]).begin + 2;
    document.getElementById("mode-bw").click();
    const tv = { kept: say(run, 1, kaFrame), meeting: say(r24, 3, 900), justice: say(run, 4, juFrame) };
    document.getElementById("mode-color").click();
    const inColor = { kept: say(run, 1, kaFrame), meeting: say(r24, 3, 900) };
    // the screen's own caption, in color
    document.querySelector('#runbar [data-view="1"]').click();
    document.querySelectorAll("#scenes button")[1].click();
    const s = document.getElementById("scrub");
    s.value = kaFrame / 4; s.dispatchEvent(new Event("input"));
    await wait(100);
    const screen = document.getElementById("caption-1").innerText;
    // "Ani changes how they look" only for a change of shape or size: never in Ken's
    // Cinderella made with the extensions, whose colors step each frame of a look change;
    // and in a made-up film whose colors step each frame, and whose shape turns into a
    // star from frame 5 to 9, for a second from each
    let becomes = 0;
    run.scenes.forEach((sc, i) => sc.film.frames.forEach((_, f) => { if (/Ani changes how they look/.test(say(run, i, f))) becomes++; }));
    const look = (frame, v, extra = {}) => [frame, "cinderella", { shape: "hexagon", angle: 60, centerOffset: null, aniSize: 0.05, color: [120, 1, v], ...extra }];
    const made = { film: { fps: 4, looks: [look(0, 0.5), ...[1, 2, 3, 4].map((f) => look(f, 0.5 + f / 20)), ...[5, 6, 7, 8].map((f) => look(f, 0.75, { morph: { to: "star", amount: (f - 4) / 5 } })), [9, "cinderella", { shape: "star", angle: 144, centerOffset: "(right 18)", aniSize: 0.05, color: [120, 1, 0.75] }]] } };
    const said = [...Array(14).keys()].map((f) => t.shapeChanges(made, f).map((x) => x[0]).join() || "-").join(" ");
    // a hexagon in the middle of becoming a star, partly below the picture: each copy color
    // draws inside it is cut at the picture's bottom edge, none in the strip below
    const hex = []; for (let k = 0; k < 6; k++) { const a = (k * 60) * Math.PI / 180, b = ((k + 1) * 60) * Math.PI / 180; hex.push(275 + 34 * Math.cos(a), 404 + 34 * Math.sin(a), 275 + 34 * Math.cos(b), 404 + 34 * Math.sin(b)); }
    const edge = { film: { fps: 4, frames: [{ segs: { cinderella: hex }, chars: {} }], looks: [look(0, 0.85, { morph: { to: "star", amount: 0.5 } })] } };
    const cut = alone(run, edge, 0, "cinderella", 413 + 124).d;
    let inside = 0, below = 0;
    for (let k = 0; k < cut.length; k += 4) if (cut[k + 1] > 60) { if (k / 4 / 551 >= 414) below++; else inside++; }
    // a video in color paints her purple, and its subtitles say her colors dim (with the
    // note in black and white)
    document.getElementById("mode-bw").click();
    const vttTV = t.makeSubtitles([run], [1], true);
    document.getElementById("mode-color").click();
    const cv = document.createElement("canvas"); cv.width = 551; cv.height = 413 + 124;
    t.drawVideoFrame(cv.getContext("2d"), [run], { i: 1, t: first(ka) / 4 }, 1, { subtitles: true, memo: Object.assign(new Map(), { both: false }) });
    const vd = cv.getContext("2d").getImageData(0, 0, 551, 413).data;
    let purple = 0;
    for (let k = 0; k < vd.length; k += 4) if (Math.abs(vd[k] - 137) < 8 && Math.abs(vd[k + 1] - 108) < 8 && Math.abs(vd[k + 2] - 166) < 8) purple++;
    const vttColor = t.makeSubtitles([run], [1], true);
    // the screens in color, both films, for the picture
    document.querySelector('#runbar [data-view="both"]').click();
    s.value = 70 / 4; s.dispatchEvent(new Event("input"));
    await wait(100);
    return { yours, kens, before, after, meeting, tv, inColor, screen, becomes, said, inside, below, purple,
      vtt: { color: /Cinderella's colors dim too\\./.test(vttColor) && !/only in color mode/.test(vttColor), tv: /Cinderella's colors dim too \\(colors show only in color mode\\)\\./.test(vttTV) } };
  })()`);
  const near = (a, b, d = 6) => a.every((v, k) => Math.abs(v - b[k]) <= d);
  check(near(colors.yours, [137, 108, 166]) && near(colors.kens, [91, 224, 111]),
    `in color mode, Ani's Cinderella is painted in the dull purple Ani chose (${colors.yours.join(", ")}; 270 degrees, .35, .65), and Ken's in his green (${colors.kens.join(", ")})`);
  const sum = (c) => c[0] + c[1] + c[2];
  check(colors.meeting.prince[1][0] - colors.meeting.prince[0][0] >= 30 && colors.meeting.prince[1][1] < 20 && sum(colors.meeting.cinderella[1]) - sum(colors.meeting.cinderella[0]) > 150 && sum(colors.before) - sum(colors.after) > 80,
    `a joy's look change brightens a character over frames: in the Meeting at 24 frames a second the Prince's red goes from ${colors.meeting.prince[0].join(", ")} at frame 860 to ${colors.meeting.prince[1].join(", ")} at 1000, and Cinderella's purple from ${colors.meeting.cinderella[0].join(", ")} to ${colors.meeting.cinderella[1].join(", ")}; in Kept Apart her sadness dims her, from ${colors.before.join(", ")} to ${colors.after.join(", ")}`);
  check(/The stepmother's colors brighten and Cinderella's colors dim too \(colors show only in color mode\)\./.test(colors.tv.kept) && /Cinderella's and the Prince's colors brighten too \(colors show only in color mode\)\./.test(colors.tv.meeting)
    && /The stepmother's colors brighten and Cinderella's colors dim too\./.test(colors.inColor.kept) && !/only in color mode/.test(colors.inColor.kept + colors.inColor.meeting)
    && /The stepmother's colors would dim, but she is as dark as Ani draws anyone already\./.test(colors.tv.justice) && /Cinderella's colors dim too\.\n(?:[^\n]*\(the revival's correction, FIT\)\.\n)*Ani chose these colors, as it chose the shapes and sizes\./.test(colors.screen),
    `the caption says so (${(colors.tv.kept.match(/The stepmother's colors[^.]*\./) || [""])[0]}), with its note only in TV mode, and where a look change shows nothing: ${(colors.tv.justice.match(/The stepmother's colors would[^.]*\./) || [""])[0]}`);
  check(colors.becomes === 0 && colors.said === "- - - - - 5 5 5 5 9 9 9 9 -",
    `"Ani changes how they look" is said only for a change of shape or size, for a second, never for a color's steps (${colors.becomes} frames in Ken's Cinderella made with the extensions; in a made-up film, by frame: ${colors.said})`);
  check(colors.inside > 50 && colors.below === 0, `a shape in the middle of becoming another, partly off the picture, has every copy cut at the picture's edge (${colors.inside} dots on the picture, ${colors.below} below it)`);
  check(colors.purple > 10 && colors.vtt.color && colors.vtt.tv, `a video in color paints Ani's colors (${colors.purple} dots of Cinderella's purple in its first picture), and its subtitles say her colors dim, with the note only in black and white`);
  await shot("8d-color-mode.png");
  // the glass box's colors, the review of stage 5: the fairy godmother's purple from Ani's
  // record of its compromise with the film's variety's orange; Cinderella's sadness in Kept
  // Apart, which dims her to .45, which the screen draws a little lighter; her joy in the
  // Meeting, which the film now waits for while she wanders (SEEN), where before SEEN the
  // scene's end cut it short at 4 frames a second; the stepmother in Justice
  const glassColors = await js(`(() => {
    const t = window.__check, run = t.RUNS[1];
    const body = (c, i) => { const d = document.createElement("div"); d.innerHTML = t.atScene(i, () => t.using(run, () => t.looksBody(run, c, "x", run.scenes[i]))); return d.innerText.replace(/\\s+/g, " "); };
    return { fairy: body("fairy-godmother", 0), kept: body("cinderella", 1), meeting: body("cinderella", 3), justice: body("step-mother", 4) };
  })()`);
  check(/Ani colored her a bright orange: bright because she is good and kind \(both opposites of evil\) and is to be different in brightness from Cinderella; neither clear nor dull, a compromise between dull, because the film isn't to be flashy \(and for the film's variety\), and clear, because she is pretty; orange: she is to look different from Cinderella \(purple\) and the Prince \(red\), by Ken's rule that a unique character should “move \(or appear\) differently” \(thesis p\. 94\), which the revival applies to hue as he decided, so any hue but purple and red; of those, the film's variety took orange: its medium variety takes the middle one of the hues ordered by how often each had been used so far, most first \(red once and purple once, the others not yet\)/.test(glassColors.fairy)
    && /\(purple, for “magical” \(one of the hues ruled out, so the two conflict\), set aside as much less strongly suggested than any hue but red and purple\)/.test(glassColors.fairy),
    `the fairy godmother's orange, Ken's own 1978 hue for her, by his uniqueness rule (magical's purple set aside, as Cinderella's) and the film's variety in the revival's order: ${(glassColors.fairy.match(/orange: she is to look[^)]*\)[^)]*\)/) || [""])[0]}`);
  check(/In part 3, to show that Cinderella is very unhappy, Ani dims her colors, from a brightness of \.65 to \.45 \(1 is the screen's brightest\); on the black screen the page draws her a little lighter than \.45, so that she can still be seen: a look change/.test(glassColors.kept)
    && /In part 7, to show that Cinderella is very happy, Ani brightens her colors, from a brightness of \.65 to \.975 \(1 is the screen's brightest\): a look change/.test(glassColors.meeting) && !/the scene ends before/.test(glassColors.meeting)
    && /In part 1, to show that the stepmother is very unhappy, Ani would dim her colors, but she is as dark as Ani draws anyone already: a look change/.test(glassColors.justice) && !/On the black screen/.test(glassColors.kept),
    `the glass box says how far a look change goes (with SEEN, the Meeting's joy to its end) and where the screen draws a color lighter: ${(glassColors.meeting.match(/In part 7, to show[^:]*/) || [""])[0]} | ${(glassColors.kept.match(/In part 3, to show[^:]*/) || [""])[0]}`);
  // Ani's colors as drawn: on the black screen, at least 3:1 at her darkest and a little
  // more the brighter she made it, so a dark blue, a medium one and a bright one are lifted
  // and stay in that order; Cinderella's, the fairy godmother's and the Prince's as Ani
  // chose them, the stepmother's dark, dull blue lifted in its hue; on the light theme's
  // white, an icon in a bright yellow toned to 3:1
  const drawnColors = await js(`(() => {
    const t = window.__check;
    const light = (style) => (style.match(/--ani-light:rgb\\((\\d+),(\\d+),(\\d+)\\)/) || []).slice(1).map(Number);
    return { blues: [0.45, 0.65, 0.85].map((v) => t.screenRgb([240, 1, v])), lifted: [[240, 1, 0.45], [270, 0.35, 0.65], [240, 0.35, 0.45], [30, 0.65, 0.85], [0, 1, 0.85]].map((c) => t.lifted(c)),
      cinderella: [[270, 0.35, 0.65], [30, 0.65, 0.85], [0, 1, 0.85]].map((c) => t.screenRgb(c)), stepmother: t.screenRgb([240, 0.35, 0.45]), yellow: light(t.inkStyle([60, 1, 0.85])) };
  })()`);
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
  const hsv = ([h, s, v]) => [5, 3, 1].map((n) => { const k = (n + h / 60) % 6; return Math.round(255 * (v - v * s * Math.max(0, Math.min(k, 4 - k, 1)))); });
  const onBlack = drawnColors.blues.map((c) => ratio(c, [0, 0, 0]));
  const sm = drawnColors.stepmother;
  check(onBlack[0] >= 3 && onBlack[1] >= 3.4 && onBlack[2] >= 3.8 && onBlack[0] < onBlack[1] && onBlack[1] < onBlack[2] && drawnColors.lifted.join() === "true,false,true,false,false"
    && drawnColors.cinderella.every((c, k) => c.join() === hsv([[270, 0.35, 0.65], [30, 0.65, 0.85], [0, 1, 0.85]][k]).join())
    && ratio(sm, [0, 0, 0]) >= 3 && ratio(sm, [0, 0, 0]) < 3.2 && sm[2] > sm[0] && Math.abs(sm[0] - sm[1]) <= 1 && ratio(drawnColors.yellow, [255, 255, 255]) >= 3,
    `a dark, a medium and a bright clear blue are drawn at ${onBlack.map((x) => x.toFixed(2)).join(", ")} to 1 against the black screen, in that order; Cinderella's, the fairy godmother's and the Prince's as Ani chose them, the stepmother's dark, dull blue lifted to ${sm.join(", ")} (${ratio(sm, [0, 0, 0]).toFixed(2)} to 1); a bright yellow icon is ${ratio(drawnColors.yellow, [255, 255, 255]).toFixed(2)} to 1 on the light theme's white`);
  // the reviewer's story of six: "How he looks" for each, the Prince's too, whose shape the
  // experts found after relaxing every constraint, and "How Ani drew them"
  const six = await js(`(() => {
    const t = window.__check, r = JSON.parse(${JSON.stringify(JSON.stringify(SIX))});
    const run = t.makeRun({ label: "Yours", short: "Yours", cindy: r.cindy, choicePoints: r.choicePoints, appearances: r.appearances, extensions: ${JSON.stringify(REVIVAL)} });
    const text = (html) => { const d = document.createElement("div"); d.innerHTML = html; return d.innerText.replace(/\\s+/g, " "); };
    const out = {};
    for (const c of run.cast) { try { out[c] = text(t.using(run, () => t.looksBody(run, c, "x", null))); } catch (e) { out[c] = "THREW " + e.message; } }
    let drawn;
    try { drawn = text(t.using(run, () => t.drawnList(run))); } catch (e) { drawn = "THREW " + e.message; }
    return { out, drawn };
  })()`);
  check(Object.keys(six.out).length === 6 && Object.values(six.out).every((x) => !/^THREW/.test(x) && /^Ani made /.test(x)) && /Ani asked the shape experts for a shape that is anything at all; /.test(six.out.prince || "") && /The Prince: a small pentagon/.test(six.drawn),
    `the reviewer's story of six: "How she looks" for each of the six, the Prince's too, whose shape the experts found after relaxing every constraint (${(Object.entries(six.out).find(([, x]) => /^THREW/.test(x)) || ["", "none threw"])[1].slice(0, 120)})`);
  // COLORS' and APPEAR's notes on a color, each in a sentence with its code: a hue Ani
  // gave up on is drawn grey (read-as-color), a brightness chosen as (not X) narrowed to
  // one of the two left (read-as-number)
  const colorNotes = await js(`(() => {
    const t = window.__check;
    const repairs = [{ actor: "(choice-point-of cinderella color-hue)", note: "(revival-repair: what read-as-color was none now grey because (given up so no hue))" },
      { actor: "(choice-point-of cinderella color-intensity)", note: "(revival-repair: what read-as-number was (not high) now 0.65 because (narrowed-to medium (variety level) medium (counts (0 low) (0 medium)) (middle-element ken1 reconstruction)))" },
      { actor: "(choice-point-of prince color-hue)", note: "(revival-repair: what read-as-color was (not purple red) now blue because (narrowed-to blue (variety level) medium (counts (0 yellow) (0 orange) (0 blue) (0 green)) (middle-element ken1 reconstruction)))" },
      { actor: "establish-task-7", note: "(revival-repair: what look-change-alone was (look-change: element (cinderella color-intensity) amount (negative high) speed high) now left-out because (no change of how it moves by the same amount at the same speed))" }];
    const run = t.makeRun({ label: "Yours", short: "Yours", cindy: t.DATA.cindy, extensions: ["appear"], repairs });
    const code = (what) => { const a = document.createElement("div"); a.innerHTML = t.repairCode(what); const l = a.querySelector("a"); return l ? l.getAttribute("href") : ""; };
    return { said: t.repairsIn(run, null).map((r) => r.html.replace(/<[^>]+>/g, "")), codes: [code("read-as-color"), code("read-as-number"), code("look-change-alone")] };
  })()`);
  check(colorNotes.said[0] === "Ani gave up on Cinderella's hue, so there was no hue to draw her in; the revival's repairs draw her grey, a color with no hue, at the brightness Ani chose."
    && /^Ani chose Cinderella's brightness “not bright”, and its table of brightnesses has a number only for dark, neither bright nor dark and bright; the revival's repairs narrowed it to neither bright nor dark \(0\.65\), the one of the two left that the film's medium variety picks/.test(colorNotes.said[1] || "")
    && colorNotes.said[2] === "Ani chose the Prince's hue as any hue but purple and red, to keep him apart from the others in hue (Ken's rule, p. 94, applied by the revival), and drew him blue, the one of the hues left that the film's medium variety picks, as for a size chosen as “not large”."
    && /^Ani was to dim Cinderella's colors beside her changes of how she moves by the same amount at the same speed, but those changes were all set aside \(Ken's CHOMET makes neither of two changes of different signs\); alone, the look change would decide how long the part runs, where it is only to go along with them, so the revival leaves it out\.$/.test(colorNotes.said[3] || "")
    && /source\.html#revive-colors-\d+$/.test(colorNotes.codes[0]) && /source\.html#revive-appear-\d+$/.test(colorNotes.codes[1]) && /source\.html#revive-alter-\d+$/.test(colorNotes.codes[2]),
    `a hue given up on, a brightness narrowed, a hue chosen as any hue but some and a look change left alone, each in a sentence with its code (${colorNotes.codes.join(", ")}): ${colorNotes.said.join(" | ")}`);
  // it comes back from this browser's copy, and from a film file, drawn with Ani's looks
  await open();
  await sleep(1500);
  const restored = await cast();
  check(castOk(restored) && /5 of 5 scenes filmed/.test(await js(`document.getElementById("run-status").innerText`)), "it comes back after a reload, drawn with Ani's looks");
  const saved = await js(`(async () => {
    const orig = HTMLAnchorElement.prototype.click;
    let got = null;
    HTMLAnchorElement.prototype.click = function () { if (this.download) got = { name: this.download, href: this.href }; else orig.call(this); };
    try {
      if (document.getElementById("save-panel").hidden) document.getElementById("save").click();
      document.querySelector('#save-panel [data-save="file"]').click();
      for (let k = 0; k < 100 && !got; k++) await new Promise((r) => setTimeout(r, 100));
    } finally { HTMLAnchorElement.prototype.click = orig; }
    if (!got) return { saved: false };
    const text = await (await fetch(got.href)).text();
    sessionStorage.setItem("ani-check-film", text);
    // a fresh page: no film kept in this browser ("Your films", and the old way)
    localStorage.removeItem("ani-cinderella:run:v1");
    await new Promise((resolve) => { const req = indexedDB.deleteDatabase("ani-cinderella"); req.onsuccess = req.onerror = resolve; setTimeout(resolve, 5000); });
    const o = JSON.parse(text);
    return { saved: true, name: got.name, version: o.version, kb: Math.round(text.length / 1024), fields: Object.keys(o).join(), about: o.about, title: o.title, lisp: (o.lisp || "").startsWith(";; -*-lisp-*-") && (o.lisp || "").includes("(define cinderella character"), story: o.story, extensions: (o.extensions || []).join(), date: o.date, readable: text.split("\\n").length > 5 };
  })()`);
  await open();
  await sleep(500);
  const none = await js(`document.getElementById("runbar").hidden`);
  await js(`(async () => {
    const text = sessionStorage.getItem("ani-check-film");
    const dt = new DataTransfer();
    dt.items.add(new File([text], "film.json", { type: "application/json" }));
    document.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
    for (let k = 0; k < 50 && document.getElementById("runbar").hidden; k++) await new Promise((r) => setTimeout(r, 100));
  })()`);
  await sleep(300);
  const reopened = await cast();
  check(saved.saved && saved.version === 2 && none && castOk(reopened), `saved as a film file (${saved.name}, version ${saved.version}, ${saved.kb} KB) and opened again on a fresh page, it is drawn with Ani's looks`);
  check(saved.fields === "format,version,about,title,lisp,extensions,date,gzip" && saved.about === "A film of Cinderella, made by Ani, Ken Kahn's 1978 animation program, revived; open it at https://toontalk.github.io/ani/ to watch it with all of Ani's reasons." && saved.title === "Cinderella" && saved.lisp && saved.extensions === "mend,know,appear,change,seen,fit" && /^\d{4}-\d\d-\d\dT/.test(saved.date || "") && saved.readable && saved.story === undefined,
    `its top level is readable, with the film's title, its Lisp, the extensions and the date, and an "about" that names it (${saved.fields})`);

  // a story with a change: the stepmother repents (test/stories/change-of-heart.lisp, as
  // the model's reply), told with the extensions on, then looked at in 1978 mode
  await open();
  const changeTold = await js(`(async () => {
    const lisp = await (await fetch("/test/stories/change-of-heart.lisp")).text();
    const real = window.fetch;
    let prompt = null;
    window.fetch = async (url, opts) => {
      if (!String(url).startsWith("https://api.anthropic.com/")) return real(url, opts);
      prompt = JSON.parse(opts.body).messages[0].content;
      return new Response(JSON.stringify({ content: [{ type: "text", text: "\`\`\`lisp\\n" + lisp + "\\n\`\`\`" }] }), { status: 200 });
    };
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.getElementById("open-teller").click();
    await wait(200);
    const side = document.getElementById("side");
    side.querySelector('[data-format="lisp"]').click();
    side.querySelector('[data-mode="revival"]').click();
    side.querySelector('[data-provider="anthropic"]').click();
    await wait(100);
    side.querySelector('[data-story="0"]').click();
    const key = side.querySelector("#tell-key");
    key.value = "test-key-not-real";
    key.dispatchEvent(new Event("input"));
    side.querySelector("#tell-go").click();
    for (let k = 0; k < 50 && !side.querySelector("#tell-edit"); k++) await wait(100);
    const revival = side.querySelector("#tell-result").innerText;
    side.querySelector('[data-mode="1978"]').click();
    await wait(200);
    const as1978 = side.querySelector("#tell-result").innerText;
    side.querySelector("#tell-edit").click();
    await wait(300);
    const offer = document.getElementById("ed-make-mend");
    return { prompt, revival, as1978, editor: document.getElementById("ed-check").innerText, refused: document.getElementById("ed-make").disabled, offer: offer && !offer.hidden ? offer.textContent : "" };
  })()`);
  check(/\(convey \(change \(personality X OLD\) \(personality X NEW\)\)\)/.test(changeTold.prompt || "") && /\(convey \(causes Y \(change \.\.\.\)\)\)/.test(changeTold.prompt || "") && /A change is shown in its scene: if Y brings it about, Y goes to X and transforms X; if nothing does, X wanders about as X changes\. Ani changes how X moves and looks/.test(changeTold.prompt || "") && /\(sequence: \(convey \(causes Y \(change \.\.\.\)\)\) \(establish \(emotional-state X \(joy \(positive high\)\)\)\)\)/.test(changeTold.prompt || "") && !/isn't animated yet/.test(changeTold.prompt || ""), "with the extensions, the prompt teaches the change task, and says the change is shown in its scene, then from the next scene on");
  check(/nothing wrong/.test(changeTold.revival) && /Ani shows the change in this scene, where the Prince goes to the stepmother and transforms her, gradually; after it Ani takes a fresh look at the stepmother, and she moves and looks as she has become from Kind Again on\./.test(changeTold.revival), "with them, the draft passes Ani's checks, and says what CHANGE will do: show the change, then take a fresh look");
  const refusal = /The Prince makes the stepmother good and kind, no longer evil and mean.{0,3} in Change of Heart: Ani as in 1978 can't change a character during a story/;
  check(refusal.test(changeTold.as1978) && refusal.test(changeTold.editor), "in 1978 mode it is refused, in a plain sentence");
  check(changeTold.refused && changeTold.offer === "Make it with the revival's extensions", `and can't be made as in 1978; the editor offers "${changeTold.offer}"`);
  await js(`document.getElementById("ed-check").scrollIntoView({ block: "center" })`);
  await shot("11-change-refused-in-1978.png");

  // made with the extensions: the fresh look shows in the progress, between At Home's
  // filming and Change of Heart's pass 2
  const t3 = Date.now();
  await js(`document.getElementById("ed-make-mend").click()`);
  const seen = {};
  let freshMeter = null, freshShot = false;
  for (let k = 0; k < 1200; k++) {
    await sleep(1000);
    const now = await js(`(() => { const p = document.getElementById("progress"); return { status: document.getElementById("run-status").innerText, meter: p ? p.querySelector("i").style.width : "" }; })()`);
    for (const [step, re] of [["fresh", /Pass 1 again: a fresh look at the stepmother, who changes in Change of Heart/], ["recompute", /Pass 1 again, to compare: everyone chosen afresh as of Change of Heart/], ["pass2", /Pass 2: planning Change of Heart/]]) if (re.test(now.status) && !seen[step]) seen[step] = Date.now();
    if (seen.fresh && !freshShot) {
      freshShot = true;
      freshMeter = parseFloat(now.meter);
      await shot("12-fresh-look-progress.png");
      if (shots) {
        await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
        await sleep(400);
        await js(`document.getElementById("progress") && document.getElementById("progress").scrollIntoView({ block: "center" })`);
        await sleep(200);
        await shot("12b-fresh-look-progress-phone.png");
        await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
        await js(`scrollTo(0, 0)`);
      }
    }
    if (!/·/.test(now.status)) break;
  }
  const changeMade = await js(`document.getElementById("run-status").innerText`);
  const took = (a, b) => (seen[a] && seen[b] ? `${Math.round((seen[b] - seen[a]) / 1000)} s` : "?");
  check(!!seen.fresh && !!seen.recompute && !!seen.pass2 && seen.fresh < seen.recompute && seen.recompute < seen.pass2 && freshMeter > 0 && freshMeter < 100, `the progress shows Ani's fresh look (${took("fresh", "recompute")}, the bar at ${freshMeter}%) and the full recompute (${took("recompute", "pass2")}) before Change of Heart's pass 2`);
  check(/with the revival's extensions: 3 of 3 scenes filmed/.test(changeMade), `with them, Ani makes it (${Math.round((Date.now() - t3) / 1000)} s): ${changeMade}`);
  const changeLasts = await lastsOf(3);
  check(JSON.stringify(changeLasts) === JSON.stringify(EXPECTED_CHANGE_LAST_FRAMES), `its three scenes end at frames ${changeLasts.join(", ")} (Node: ${EXPECTED_CHANGE_LAST_FRAMES.join(", ")})`);
  const compared = await js(`document.getElementById("side").innerText`);
  check(/In Change of Heart the Prince made the stepmother good and kind, no longer evil and mean; from Kind Again on /.test(compared), "the story's panel says who the story changed, and how she moves after");
  // Change of Heart: the caption says how Ani shows the change, and what it is doing now
  const changeCaption = await js(`(async () => {
    document.querySelectorAll("#scenes button")[1].click();
    const s = document.getElementById("scrub"); s.value = 2; s.dispatchEvent(new Event("input"));
    await new Promise((r) => setTimeout(r, 100));
    return document.getElementById("caption-1").innerText;
  })()`);
  check(/The Prince goes to the stepmother and transforms her, to convey that he makes her good and kind, no longer evil and mean: gradually, since an abrupt change could be misread \(thesis p\. 169\)\./.test(changeCaption) && /The stepmother changes as she wanders: her path grows smoother and curves more, and her curves grow longer, over [\d.]+ seconds\./.test(changeCaption) && !/a later stage/.test(changeCaption),
    `Change of Heart's caption says how Ani shows the change, and what it is doing now: ${changeCaption.split("\n").filter((l) => /transforms|changes as she wanders/.test(l)).join(" ")}`);
  // Kind Again: the stepmother's glass box
  const howChanged = async () => {
    await js(`(async () => { document.querySelector('#runbar [data-view="1"]').click(); document.querySelectorAll("#scenes button")[2].click(); const s = document.getElementById("scrub"); s.value = 2; s.dispatchEvent(new Event("input")); await new Promise((r) => setTimeout(r, 100)); })()`);
    return clickOn("fig-1", "The stepmother", `async () => {
      const d = document.querySelector("#side details.changed");
      if (!d) return { found: true, text: "" };
      const closed = !d.open;
      d.open = true;
      // her look's choice, made again: its why opens the fresh look's choice point too
      const lookRow = [...d.querySelectorAll("tbody tr")].find((r) => /Jaggedness of the shape/.test(r.innerText));
      lookRow.querySelector("[data-cp]").click();
      await new Promise((r) => setTimeout(r, 50));
      const lookBox = d.querySelector("#chg-box").innerText;
      const row = [...d.querySelectorAll("tbody tr")].find((r) => /Curvature of the path/.test(r.innerText));
      row.querySelector("[data-cp]").click();
      await new Promise((r) => setTimeout(r, 50));
      const held = d.querySelector("details");
      held.open = true;
      const moves = [...document.querySelectorAll("#side details")].find((x) => /^How she moves/.test(x.innerText));
      if (moves) moves.open = true;
      d.scrollIntoView({ block: "start" });
      return { found: true, closed, text: d.innerText, box: d.querySelector("#chg-box").innerText, lookBox, held: held.innerText, rows: [...d.querySelectorAll("tbody tr")].map((r) => r.innerText.replace(/\\s+/g, " ").trim()), moves: moves ? moves.innerText : "" };
    }`);
  };
  const changed = await howChanged();
  check(changed.found && changed.closed && /^How she has changed\s+In Change of Heart the Prince made the stepmother good and kind, no longer evil and mean; from Kind Again on her path curves more, her curves are longer and her path is smoother\./.test(changed.text || ""), `Kind Again's glass box has "How she has changed", closed, with a sentence from the fresh look: ${(changed.text || "").split("\n").filter((l) => l.trim())[1] || ""}`);
  // the bridge, in Change of Heart: the Prince's walk to her, the frames and time of the
  // bridges, what they changed, and what was chosen again and not bridged; and her look,
  // chosen again and drawn as before
  check(/Ani shows it in Change of Heart: the Prince goes to her \((frames \d+ to \d+|they touch as the part begins, at frame 0)\), and once they touch she changes as she wanders, gradually, over [\d.]+ seconds \(frames \d+ to \d+\): her path grows smoother and curves more, and her curves grow longer; gradually, since an abrupt change “could easily be misinterpreted as meaning something else” \(thesis p\. 169\)\./.test(changed.text || "")
    && /Chosen again but not bridged: her acceleration, which Director doesn't use, as in 1978 \(thesis pp\. 185-186\); her likings for friends, enemies and strangers, which only pass 1 reads\./.test(changed.text || "")
    && /Ani chose how she looks again too, as pass 1 chooses looks after how the characters move, with everyone else's held as they were, and she is drawn as before, as a large triangle in a dark, dull blue: the jaggedness of her shape is chosen “not smooth” where it was jagged, and she is drawn the same either way\./.test(changed.text || ""),
    `with the bridge: ${((changed.text || "").match(/Ani shows it in Change of Heart:[^.]*\./) || [""])[0]}`);
  // the table's rows: Director's elements, then her look's, then pass 2's, then those
  // Director doesn't use, each group under a line that says who reads them and how those
  // that changed are shown
  const rows = changed.rows || [];
  const at = (re) => rows.findIndex((r) => re.test(r));
  const groups = [/^Director moves her by these; those that changed are bridged in Change of Heart, gradually, over [\d.]+ seconds$/, /^Director draws her by these; she is drawn as before$/, /^Pass 2 repeats an activity as often as these say$/, /^Chosen again; Director doesn't use these, as in 1978 \(thesis pp\. 185-186\)$/].map(at);
  check(rows.length === 22 && groups.join() === "0,5,12,16" && /^Curvature of the path low medium why\?$/.test(rows[2] || "") && /^Jaggedness of the shape jagged not smooth \(drawn as before\) why\?$/.test(rows[7] || "") && /^Acceleration high medium why\?$/.test(rows[17] || "") && /^Liking for enemies strong dislike strong liking why\?$/.test(rows[20] || ""), `her eighteen elements before and after, Director's first, then her look's, and those Director doesn't use marked so (${rows.slice(0, 3).join("; ")}; ...; ${rows.slice(5, 8).join("; ")}; ...; ${rows.slice(16, 18).join("; ")}; ...)`);
  check(/^Ani's fresh look after Change of Heart\s+The stepmother's jaggedness of the shape: not smooth/.test(changed.lookBox || "") && /How the stepmother looks is chosen after how she moves, as pass 1 chooses looks/.test(changed.lookBox || ""), `a look's "why?" opens the fresh look's choice point too: ${(changed.lookBox || "").split("\n").slice(0, 2).join(" | ")}`);
  check(/^Ani's fresh look after Change of Heart\s+The stepmother's curvature of the path: medium/.test(changed.box || "") && /good \(the opposite of evil\)/.test(changed.box || "") && /her curvature of the path is to be different from Cinderella's, the fairy godmother's and the Prince's/.test(changed.box || ""), `its "why?" opens the fresh look's choice point: ${(changed.box || "").split("\n").slice(0, 3).join(" | ")}`);
  check(/Without holding them, the Prince's deliberateness would have been high, not medium\./.test(changed.held || "") && /with everyone chosen afresh as of Change of Heart, the Prince's deliberateness would be high, not medium, and her deliberateness would be medium, not high/.test(changed.held || ""), "one click away, what was held, and the full recompute to compare");
  check(/as Ani chose for the stepmother in her fresh look after Change of Heart; it was low before/.test(changed.moves || ""), "How she moves says her curvature comes from the fresh look");
  await shot("13-how-she-has-changed.png");
  if (shots) {
    await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleep(400);
    await js(`document.querySelector("#side details.changed").scrollIntoView({ block: "start" })`);
    await sleep(200);
    await shot("13b-how-she-has-changed-phone.png");
    await js(`document.querySelector("#chg-box").scrollIntoView({ block: "start" })`);
    await sleep(200);
    await shot("13c-fresh-look-choice-phone.png");
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  }
  // Change of Heart, the scene of the change, has it too: the change said as it is made,
  // and from Kind Again on
  await js(`(async () => { document.querySelector('#runbar [data-view="1"]').click(); document.querySelectorAll("#scenes button")[1].click(); const s = document.getElementById("scrub"); s.value = 5; s.dispatchEvent(new Event("input")); await new Promise((r) => setTimeout(r, 100)); })()`);
  const inScene = ((await clickOn("fig-1", "The stepmother", `async () => {
    const d = document.querySelector("#side details.changed");
    if (d) d.open = true;
    return { found: true, text: d ? d.innerText : "" };
  }`)) || {}).text || "";
  check(/^How she has changed\s+In Change of Heart the Prince makes the stepmother good and kind, no longer evil and mean\. From Kind Again on her path curves more, her curves are longer and her path is smoother\.\s+Ani shows it in Change of Heart:/.test(inScene) && !/later stage/.test(inScene), `Change of Heart's glass box has "How she has changed" too, as the change is made: ${inScene.split("\n").filter((l) => l.trim())[1] || ""}`);
  // At Home, before the change, has none
  const before = await js(`(async () => {
    document.querySelectorAll("#scenes button")[0].click();
    await new Promise((r) => setTimeout(r, 100));
    return !!document.querySelector("#side details.changed");
  })()`);
  check(!before, "At Home's glass box, before the change, has no \"How she has changed\"");
  // it comes back after a reload, and from a film file
  await open();
  await sleep(1500);
  const again = await howChanged();
  check(/^How she has changed\s+In Change of Heart the Prince made the stepmother/.test(again.text || "") && /^Ani's fresh look after Change of Heart/.test(again.box || ""), "after a reload, the film comes back with \"How she has changed\"");
  const changeFile = await js(`(async () => {
    const orig = HTMLAnchorElement.prototype.click;
    let got = null;
    HTMLAnchorElement.prototype.click = function () { if (this.download) got = { name: this.download, href: this.href }; else orig.call(this); };
    try {
      if (document.getElementById("save-panel").hidden) document.getElementById("save").click();
      document.querySelector('#save-panel [data-save="file"]').click();
      for (let k = 0; k < 100 && !got; k++) await new Promise((r) => setTimeout(r, 100));
    } finally { HTMLAnchorElement.prototype.click = orig; }
    if (!got) return { saved: false };
    const outer = JSON.parse(await (await fetch(got.href)).text());
    const bin = Uint8Array.from(atob(outer.gzip), (c) => c.charCodeAt(0));
    const d = JSON.parse(await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream("gzip"))).text());
    const c = d.changes && d.changes["change-of-heart"];
    // a film file as the page wrote them before (no readable fields), as version 2 and as 1
    const old = [];
    for (const version of [2, 1]) {
      const dt = new DataTransfer();
      dt.items.add(new File([JSON.stringify({ format: outer.format, version, about: "A film made by Ani, Ken Kahn's 1978 animation program, revived. Open it in the page Ani's Cinderella to watch it with all of Ani's reasons.", gzip: outer.gzip })], "old.json", { type: "application/json" }));
      document.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
      await new Promise((r) => setTimeout(r, 1500));
      old.push(document.getElementById("run-status").innerText);
    }
    return { saved: true, name: got.name, version: outer.version, who: c ? c.characters.map((x) => x.character).join() : "", held: c ? c.held.length : -1,
      title: outer.title, story: outer.story, model: outer.model, provider: outer.provider, about: outer.about, lisp: typeof outer.lisp === "string" && outer.lisp === d.cindy, extensions: (outer.extensions || []).join(), old };
  })()`);
  check(changeFile.saved && changeFile.version === 2 && changeFile.who === "step-mother" && changeFile.held === 1, `its film file (${changeFile.name}, version ${changeFile.version}) carries Ani's fresh look`);
  check(changeFile.title === "Change of Heart" && /^Little Red Riding Hood is a good, friendly girl/.test(changeFile.story || "") && changeFile.model === "claude-sonnet-5-5" && changeFile.provider === "Claude (Anthropic)" && changeFile.lisp && changeFile.extensions === "mend,know,appear,change,seen,fit" && /^A film of Change of Heart, made by Ani/.test(changeFile.about || ""),
    `and, readable at its top, the story as told in English, the model and provider that wrote it, and its Lisp (${changeFile.model}, ${changeFile.provider})`);
  check(/^Your version, with the revival's extensions: 3 of 3 scenes filmed/.test(changeFile.old[0] || "") && /^Your version: 3 of 3 scenes filmed/.test(changeFile.old[1] || ""), `film files as the page wrote them before still open, version 2 and version 1 (${changeFile.old.map((x) => x.split(".")[0]).join("; ")})`);

  // Ken's own beautified scene, put back (REVIVE;CHSHOW, stage 6): "Change the story" offers
  // it, turning the switch to the extensions; in 1978 mode it is refused; Ken's CINDY is as
  // it was
  await send("Page.navigate", { url: `${base}/app/film.check.html` });
  for (let k = 0; k < 75 && !(await js("!!window.__check && document.getElementById('caption-0').innerText.length > 0").catch(() => false)); k++) await sleep(200);
  const beautyAsked = await js(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const t = window.__check;
    document.getElementById("open-editor").click();
    await wait(200);
    document.querySelector('#side [data-mode="1978"]').click();
    await wait(100);
    const b = [...document.querySelectorAll("#side [data-preset]")].find((x) => x.textContent === "Cinderella beautified");
    if (!b) return { found: false };
    const title = b.title;
    b.click();
    await wait(300);
    const mode = [...document.querySelectorAll("#side [data-mode]")].filter((x) => x.getAttribute("aria-pressed") === "true").map((x) => x.dataset.mode).join();
    const text = t.beautifiedCindy();
    return { found: true, title, mode, same: document.getElementById("ed-lisp").value === text, editor: document.getElementById("ed-check").innerText, make: !document.getElementById("ed-make").disabled,
      kens: t.DATA.cindy.includes(";;(define cinderella-beautified scene") && !t.DATA.cindy.includes("\\n(define cinderella-beautified scene") && text.includes("\\n(define cinderella-beautified scene") && text.replace(/^;;/gm, "") === t.DATA.cindy.replace(/^;;/gm, ""),
      refused: t.checkStory(text, { extensions: [] }).stops.filter((s) => s.change).map((s) => s.as1978) };
  })()`);
  check(beautyAsked.found && /^Cinderella beautified: Ken's own scene, which he wrote and left commented out \(cindy\.46:94-105\)/.test(beautyAsked.title) && beautyAsked.mode === "revival" && beautyAsked.same && beautyAsked.make && beautyAsked.kens,
    "\"Change the story\" offers Ken's own beautified scene, which he wrote and left commented out, put back as he wrote it (his CINDY itself is as it was), and turns the switch to the extensions");
  check(/Ken's own scene Cinderella Beautified, which he wrote and left commented out \(cindy\.46:94-105\), put back as he wrote it: convey that the fairy godmother makes Cinderella elegant, no longer shabby/.test(beautyAsked.editor || "") && !/Other changes/.test(beautyAsked.editor || "")
    && /Ani shows the change in this scene, where the fairy godmother goes to Cinderella and transforms her, at once, since the fairy godmother is magical \(the revival's rule\); after it Ani takes a fresh look at Cinderella, and she moves and looks as she has become from No Longer Kept Apart on\./.test(beautyAsked.editor || ""),
    `the editor says what was put back, and what Ani will do with it: ${(beautyAsked.editor || "").split("\n").find((l) => /Ani shows the change/.test(l)) || ""}`);
  check((beautyAsked.refused || []).length === 1 && /Ani as in 1978 can't change a character during a story/.test(beautyAsked.refused[0]), "in 1978 mode it is refused, in a plain sentence");
  const toggled = await js(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const t = window.__check, ta = () => document.getElementById("ed-lisp").value;
    const preset = (label) => [...document.querySelectorAll("#side [data-preset]")].find((x) => x.textContent === label);
    const pressedNow = () => preset("Cinderella beautified").getAttribute("aria-pressed");
    const out = { put: pressedNow() };
    preset("A shy Prince").click();
    await wait(300);
    out.shy = { pressed: pressedNow(), has: t.hasBeautified(ta()), editor: document.getElementById("ed-check").innerText };
    preset("Cinderella beautified").click();
    await wait(300);
    out.off = { pressed: pressedNow(), text: ta() === t.setWords(t.DATA.cindy, { char: "prince", slot: "personality" }, ["good", "shy"]), editor: document.getElementById("ed-check").innerText };
    preset("Cinderella beautified").click();
    await wait(300);
    out.on = { pressed: pressedNow(), has: t.hasBeautified(ta()), take: !!document.querySelector("#ed-check [data-take-out]") };
    document.querySelector("#ed-check [data-take-out]").click();
    await wait(300);
    out.taken = { pressed: pressedNow(), has: t.hasBeautified(ta()) };
    document.getElementById("ed-reset").click();
    await wait(300);
    out.reset = ta() === t.DATA.cindy && pressedNow() === "false";
    preset("Cinderella beautified").click();
    await wait(300);
    out.again = ta() === t.beautifiedCindy() && pressedNow() === "true";
    return out;
  })()`);
  check(toggled.put === "true" && toggled.shy.pressed === "true" && toggled.shy.has && /The Prince: now shy/.test(toggled.shy.editor) && /Ken's own scene Cinderella Beautified/.test(toggled.shy.editor)
    && toggled.off.pressed === "false" && toggled.off.text && /The Prince: now shy/.test(toggled.off.editor) && !/Cinderella Beautified/.test(toggled.off.editor)
    && toggled.on.pressed === "true" && toggled.on.has && toggled.on.take && toggled.taken.pressed === "false" && !toggled.taken.has && toggled.reset && toggled.again,
    "\"Cinderella beautified\" is a toggle: pressed while the story has the scene; pressed again it takes out the scene alone, keeping a shy Prince, Ken's story with him; \"Take it out\" beside the scene does the same; and \"Back to Ken's story\" is as it was");
  // made with the extensions: every scene as Node makes it
  const t4 = Date.now();
  await js(`document.getElementById("ed-make").click()`);
  let beautyMade = "", filmingSaid = "", frozeSaid = "", frozen = false;
  const beautySteps = [];
  for (let k = 0; k < 1500; k++) {
    await sleep(1000);
    beautyMade = await js(`document.getElementById("run-status").innerText`);
    if (!/·/.test(beautyMade)) break;
    const what = beautyMade.split(" · ")[0].trim();
    if (!beautySteps.length || beautySteps[beautySteps.length - 1][1] !== what) beautySteps.push([Math.round((Date.now() - t4) / 1000), what]);
    if (!filmingSaid && /Filming [^·]+ · frame [1-9]\d* · \d+:\d\d/.test(beautyMade)) filmingSaid = beautyMade.split("\n")[0];
    // frozen for eight seconds while Kept Apart is filmed, as Chrome freezes a tab in the background
    if (!frozen && /Filming Kept Apart · frame [1-9]/.test(beautyMade)) {
      frozen = true;
      await send("Page.setWebLifecycleState", { state: "frozen" });
      await sleep(8000);
      await send("Page.setWebLifecycleState", { state: "active" });
      await sleep(500);
      frozeSaid = await js(`document.getElementById("run-status").innerText`);
    }
  }
  console.log(`      steps of the beautified film, in seconds from the start (headless Chrome): ${beautySteps.map(([t, w]) => `${t} ${w}`).join("; ")}`);
  check(/with the revival's extensions: 6 of 6 scenes filmed/.test(beautyMade), `Ani makes it (${Math.round((Date.now() - t4) / 1000)} s): ${beautyMade.split("\n")[0]}`);
  check(!!filmingSaid, `while it is made, the status line says how far each filming has got: ${filmingSaid.trim()}`);
  check(/Chrome paused this tab while it was in the background, for 0:0[789]; Ani went on when it came back, and that time isn't counted\./.test(frozeSaid), `frozen for eight seconds, as Chrome freezes a tab in the background, the page says so when it comes back: ${frozeSaid.replace(/\s+/g, " ").trim()}`);
  const beautyLasts = await js(`(async () => {
    document.querySelector('#runbar [data-view="1"]').click();
    const out = [];
    for (const b of document.querySelectorAll("#scenes button")) {
      b.click();
      await new Promise((r) => setTimeout(r, 30));
      out.push(Math.round(parseFloat(document.getElementById("frame-label").textContent.split("/")[1]) * 4));
    }
    return out;
  })()`);
  check(JSON.stringify(beautyLasts) === JSON.stringify(EXPECTED_BEAUTIFIED_LAST_FRAMES), `its six scenes end at frames ${beautyLasts.join(", ")} (Node: ${EXPECTED_BEAUTIFIED_LAST_FRAMES.join(", ")})`);
  // SEEN (reports/ext/seen/README.md): after the transformation, the joys' part, where the
  // fairy godmother and Cinderella wander while their joys run, each once nothing else moves
  // her; the glass box's notes say why, and her panel says why this way and why so long
  const seenSaid = await js(`(async () => {
    const t = window.__check, wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const run = t.RUNS[1], i = run.sceneIds.indexOf("cinderella-beautified");
    const panel = async (f, c) => { t.goScene(i, f / 4 + 1e-4); t.select({ run: 1, char: c }); await wait(60); return document.getElementById("side"); };
    let side = await panel(100, "cinderella");
    const lead = side.querySelector(".lead").textContent, box = (side.querySelector(".why-act") || {}).textContent || "";
    const notes = [...side.querySelectorAll(".repairs .fixes > li summary")].map((x) => x.textContent);
    side = await panel(85, "cinderella");
    const entry = [...side.querySelectorAll("[data-tl]")].find((b) => /Cinderella: waiting until nothing else moves her/.test(b.textContent));
    if (entry) entry.click();
    await wait(100);
    const waiting = document.getElementById("side").querySelector(".why-act")?.textContent || "";
    side = await panel(40, "fairy-godmother");
    const standing = side.querySelector(".why-act")?.textContent || "";
    t.goScene(i, 100 / 4 + 1e-4);
    await wait(60);
    return { lead, box, notes, waiting, standing, entry: !!entry, caption: document.getElementById("caption-1").innerText };
  })()`);
  check(/^Cinderella is wandering about while her joy changes how she moves, so that the change is seen \(the revival's repair\)\.$/.test(seenSaid.lead) && /Why so long She wanders from frame 95 to 109 \(3\.5 s\), until her changes end: the longest, her length of each curve by 2 at high speed, takes Director [\d.]+ s from the part's start, where Ani planned 1\.73 s/.test(seenSaid.box) && /the revival's repair \(SEEN\) has her wander here too, once nothing else moves her, while her changes run\./.test(seenSaid.box),
    `with SEEN, Cinderella wanders while her joy runs, and her panel says why, and why so long: ${seenSaid.lead}`);
  check(seenSaid.notes.filter((n) => /only part is a change of feeling/.test(n)).length === 2 && seenSaid.notes.some((n) => /^At frame \d+ Ken's Director would have stopped the film/.test(n)) && /Cinderella and the fairy godmother wander about while the change runs, so that it is seen \(the revival's repair\)\./.test(seenSaid.caption),
    "the glass box says why each of them wanders (SEEN's nothing-to-do) and why the film went on (film-waited-for-wander), and the caption says they wander so that the change is seen");
  check(seenSaid.entry && /She waits from frame 82 to 95 \(3\.25 s\), until “wandering about while the change is shown”, which moves her, ends at frame 95\./.test(seenSaid.waiting),
    "her wait, opened from the scene's timeline, says what she waits for");
  check(/Why so long Part 1 goes on to frame 97: meanwhile Cinderella is wandering about while the change is shown \(to frame 66\), and she has no step of her own in it now\. Ken's scene says \(set your length to long\), 24 to 60 seconds; Ani planned 20\.4 s for “the fairy godmother goes to Cinderella and transforms her” and stretched it by 1\.18, to take in part 2, which extends it\./.test(seenSaid.standing),
    `the fairy godmother, standing by, says why so long (Ken: "Why so long (20s)? ... is this standing by?"): ${seenSaid.standing.replace(/How Ani timed the part.*/, "")}`);
  // Cinderella Beautified: the fairy godmother's walk to her, the touch, the change at once,
  // her wander; her colors in the film's looks, painted in color mode, in the captions and
  // the subtitles; and a video's picture
  const beautified = await js(`(async () => {
    const t = window.__check, run = t.RUNS[1], i = run.sceneIds.indexOf("cinderella-beautified"), sc = run.scenes[i];
    const x = (sc.glass.changesShown || [])[0] || {};
    const span = (plan) => { const a = sc.activities.find((y) => y.name === plan); return a ? [a.begin, a.end] : null; };
    const look = (f) => { let l = null; for (const [fr, c, v] of sc.film.looks || []) { if (fr > f) break; if (c === "cinderella") l = v; } return l; };
    const touch = x.goesTo ? span(x.goesTo.plan) : null, bridge = x.bridging ? span(x.bridging.plan) : null;
    // her color, drawn alone in color at a frame: the dots in the color the screen draws hers in
    const dots = (f, rgb) => {
      const cv = document.createElement("canvas"); cv.width = 551; cv.height = 413;
      const ctx = cv.getContext("2d"); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 551, 413);
      t.drawFrame(ctx, { ...run, cast: ["cinderella"] }, sc, f, { color: true });
      const d = ctx.getImageData(0, 0, 551, 413).data; let n = 0;
      for (let k = 0; k < d.length; k += 4) if (Math.abs(d[k] - rgb[0]) < 8 && Math.abs(d[k + 1] - rgb[1]) < 8 && Math.abs(d[k + 2] - rgb[2]) < 8) n++;
      return n;
    };
    const dull = t.screenRgb([270, 0.35, 0.65]), clear = t.screenRgb([270, 1, 0.65]);
    const say = (f) => { const c = t.captionAt(run, i, f); return [c.text, ...c.more].join(" ").replace(/<[^>]+>/g, ""); };
    document.getElementById("mode-bw").click();
    const tv = say(touch ? touch[1] + 1 : 5);
    document.getElementById("mode-color").click();
    const caps = { going: say(2), touch: say(touch ? touch[1] : 10), change: say(touch ? touch[1] + 1 : 11), drawn: say(12), after: say(30) };
    const vtt = t.makeSubtitles([run], [i], false);
    const cv = document.createElement("canvas"); cv.width = 551; cv.height = 413 + 124;
    t.drawVideoFrame(cv.getContext("2d"), [run], { i, t: 14 / 4 }, 1, { subtitles: true, memo: Object.assign(new Map(), { both: false }) });
    const vd = cv.getContext("2d").getImageData(0, 0, 551, 413).data;
    let video = 0;
    for (let k = 0; k < vd.length; k += 4) if (Math.abs(vd[k] - clear[0]) < 8 && Math.abs(vd[k + 1] - clear[1]) < 8 && Math.abs(vd[k + 2] - clear[2]) < 8) video++;
    return { shownBy: x.shownBy, rate: x.rate, rule: x.rateRule, bridges: (x.bridges || []).map((b) => b.element + " " + b.was + " " + b.now).join(), touch, bridge, wander: (x.wanders || { plans: [] }).plans.map(span),
      sat: [4, 11, 12, 40].map((f) => (look(f) && look(f).color ? look(f).color[1] : null)), before: [dots(4, dull), dots(4, clear)], after: [dots(12, dull), dots(12, clear)], tv, caps, video,
      vtt: { going: /First the fairy godmother goes to Cinderella; once they touch, she changes at once\\./.test(vtt), touch: /They touch, and she changes at once\\./.test(vtt) && /At once her colors become clear\\./.test(vtt) && !/colors become clear \\(colors show only/.test(vtt), after: /Cinderella wanders about as she has become, so that the change is seen\\./.test(vtt) } };
  })()`);
  check(beautified.shownBy === "(goes-to-and-transforms fairy-godmother cinderella)" && beautified.rate === "instantaneous" && beautified.rule === "(of the revival)" && beautified.bridges === "color-saturation 0.35 1.0"
    && JSON.stringify(beautified.touch) === "[0,10]" && JSON.stringify(beautified.bridge) === "[11,11]" && JSON.stringify(beautified.sat) === "[0.35,0.35,1,1]",
    `in Cinderella Beautified the fairy godmother goes to Cinderella (frames ${(beautified.touch || []).join(" to ")}; with FIT her walk takes its stretch once), and as they touch Cinderella's colors become clear at once (the bridge at frame ${(beautified.bridge || [])[0]}; her saturation by frame 4, 11, 12 and 40: ${beautified.sat.join(", ")}), magical, by the revival's rule; then she wanders (${beautified.wander.map((w) => (w || []).join("-")).join(", ")})`);
  check(beautified.before[0] > 10 && beautified.before[1] === 0 && beautified.after[1] > 10 && beautified.after[0] === 0,
    `in color mode she is painted the dull purple Ani chose before the touch (${beautified.before[0]} dots at frame 4) and the clear one after (${beautified.after[1]} dots at frame 12)`);
  check(/The fairy godmother goes to Cinderella and transforms her, to convey that she makes Cinderella elegant, no longer shabby: she is magical, so it happens at once \(the revival's rule\)\./.test(beautified.caps.going) && /First the fairy godmother goes to Cinderella; once they touch, she changes at once\./.test(beautified.caps.going)
    && /They touch, and she changes at once\./.test(beautified.caps.touch) && /At once her colors become clear\./.test(beautified.caps.change) && /At once her colors become clear\./.test(beautified.caps.drawn) && !/At once/.test(beautified.caps.after)
    && /At once her colors become clear \(colors show only in color mode\)\./.test(beautified.tv) && /Cinderella wanders about as she has become, so that the change is seen\./.test(beautified.caps.after),
    `the captions say so, the touch at the frame the walk ends and the change until Director draws it: ${beautified.caps.touch.replace(/^.*?\. /, "")} | ${beautified.caps.change.replace(/^.*?\. /, "")}`);
  check(beautified.vtt.going && beautified.vtt.touch && beautified.vtt.after && beautified.video > 10, `and so do the subtitles, and a video in color paints her clear purple after the touch (${beautified.video} dots)`);
  if (shots) {
    await js(`document.querySelectorAll("#scenes button")[2].click()`);
    for (const [f, name] of [[2, "15a-beautified-before.png"], [12, "15b-beautified-touch.png"], [40, "15c-beautified-after.png"]]) {
      await js(`(async () => { const s = document.getElementById("scrub"); s.value = ${f / 4}; s.dispatchEvent(new Event("input")); await new Promise((r) => setTimeout(r, 150)); document.getElementById("stage").scrollIntoView({ block: "start" }); })()`);
      await shot(name);
    }
  }
  // her glass box in Cinderella Beautified: "How she has changed", with the bridge; and in
  // No Longer Kept Apart, "How she looks" says how she is drawn since
  const beautyGlass = await js(`(async () => {
    document.querySelector('#runbar [data-view="1"]').click();
    document.querySelectorAll("#scenes button")[2].click();
    const s = document.getElementById("scrub"); s.value = 40 / 4; s.dispatchEvent(new Event("input"));
    await new Promise((r) => setTimeout(r, 100));
    return true;
  })()`);
  const beautyChanged = beautyGlass && await clickOn("fig-1", "Cinderella", `async () => {
    const d = document.querySelector("#side details.changed");
    if (!d) return { found: true, text: "" };
    d.open = true;
    const row = [...d.querySelectorAll("tbody tr")].find((r) => /^Clarity/.test(r.innerText));
    if (row) row.querySelector("[data-cp]").click();
    await new Promise((r) => setTimeout(r, 50));
    const lead = document.querySelector("#side .lead");
    return { found: true, text: d.innerText, box: d.querySelector("#chg-box").innerText, lead: lead ? lead.innerText : "", row: row ? row.innerText.replace(/\\s+/g, " ").trim() : "" };
  }`);
  check(/In Cinderella Beautified the fairy godmother makes Cinderella elegant, no longer shabby\. From No Longer Kept Apart on she moves as before, but she is drawn in a clear purple, no longer a dull purple\./.test(beautyChanged.text || "")
    && /Ani shows it in Cinderella Beautified: the fairy godmother goes to her \(frames 0 to 10\), and when they touch, at frame 10, her colors become clear at once \(Director draws the change from frame 12\), since the fairy godmother is magical \(the revival's rule\); then she wanders about for [\d.]+ seconds \(frames 11 to \d+\), so that the change is seen\./.test(beautyChanged.text || "")
    && /^Clarity dull clear why\?$/.test(beautyChanged.row || "") && /^Ani's fresh look after Cinderella Beautified\s+Cinderella's clarity: clear/.test(beautyChanged.box || "") && /Cinderella is wandering about while the change is shown/.test(beautyChanged.lead || ""),
    `her glass box there has "How she has changed", with the bridge: ${((beautyChanged.text || "").match(/Ani shows it in Cinderella Beautified:[^;]*/) || [""])[0]}`);
  const beautyAfter = await js(`(async () => {
    document.querySelectorAll("#scenes button")[3].click();
    const s = document.getElementById("scrub"); s.value = 2; s.dispatchEvent(new Event("input"));
    await new Promise((r) => setTimeout(r, 100));
    return true;
  })()`) && await clickOn("fig-1", "Cinderella", `async () => {
    document.querySelectorAll("#side details").forEach((x) => (x.open = true));
    const looks = [...document.querySelectorAll("#side details")].find((x) => /^How she looks/.test(x.innerText));
    const changed = document.querySelector("#side details.changed");
    return { found: true, looks: looks ? looks.innerText : "", changed: changed ? changed.innerText : "" };
  }`);
  check(/Since Cinderella Beautified, she is drawn in a clear purple, no longer a dull purple: Ani's fresh look after that scene chose her look again/.test(beautyAfter.looks || "") && /In Cinderella Beautified the fairy godmother made Cinderella elegant, no longer shabby; from No Longer Kept Apart on she moves as before, but she is drawn in a clear purple/.test(beautyAfter.changed || ""),
    "and in No Longer Kept Apart, \"How she looks\" and \"How she has changed\" say how she is drawn since");
  // a change with no cause: Learning to Socialize (reports/ext/change/socializing, 72 frames, made with
  // MEND, APPEAR and CHANGE), where Cinderella wanders as she grows into an octagon
  const social = await js(`(async () => {
    const t = window.__check, get = async (p) => (await fetch(p)).json(), dir = "/reports/ext/change/socializing/";
    const scenes = [];
    for (const id of ["wallflower", "learning", "the-dance"]) scenes.push({ id, film: await get(dir + id + ".film.json"), glass: await get(dir + id + ".glass.json") });
    const cindy = (await (await fetch("/test/stories/socializing.lisp")).text()).replace(/\\r\\n/g, "\\n");
    const run = t.makeRun({ label: "Yours", short: "Yours", cindy, scenes, extensions: ["mend", "appear", "change"], changes: await get(dir + "changes.json") });
    const sc = run.scenes[1];
    document.getElementById("mode-bw").click();
    const say = (f) => { const c = t.captionAt(run, 1, f); return [c.text, ...c.more].join(" ").replace(/<[^>]+>/g, ""); };
    const shape = (f) => { let l = null; for (const [fr, c, v] of sc.film.looks || []) { if (fr > f) break; if (c === "cinderella") l = v; } return l ? l.shape + (l.morph ? ">" + l.morph.to : "") + " " + l.aniSize : ""; };
    return { frames: sc.film.frames.length, caps: [say(5), say(66)], shapes: [0, 32, 64, 67].map(shape),
      changed: t.using(run, () => t.changedBody(run, "cinderella", 1)).replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ") };
  })()`);
  check(social.frames === 72 && /^hexagon 0\.036,hexagon>octagon 0\.04\d*,/.test(social.shapes.join()) && /octagon 0\.05$/.test(social.shapes[3]),
    `a change with no cause: Learning to Socialize, ${social.frames} frames, where Cinderella grows from a hexagon into an octagon (${social.shapes.join("; ")})`);
  check(/Cinderella wanders about as she changes, to convey that she becomes brazen, no longer shy: gradually, since an abrupt change could be misread \(thesis p\. 169\)\./.test(social.caps[0]) && /Over 16 seconds, she grows, turns from a hexagon into an octagon and moves faster\./.test(social.caps[0]) && /Cinderella becomes an octagon/.test(social.caps[1]),
    `its captions say so: ${(social.caps[0].match(/Over 16 seconds[^.]*\./) || [""])[0]}`);
  check(/^ In Learning to Socialize Cinderella becomes brazen, no longer shy\. From The Dance on she moves faster, and she is drawn as an octagon, no longer a small hexagon\. Ani shows it in Learning to Socialize: she wanders as she changes, gradually, over 16 seconds \(frames 0 to 64\): she grows, turns from a hexagon into an octagon and moves faster;/.test(social.changed)
    && /Ani's own estimate was 10 seconds \(ten seconds an e-fold of the largest change; a change of shape or hue counts as one e-fold\), stretched by 1\.6/.test(social.changed) && /Chosen again but not bridged: her likings for enemies and strangers, which only pass 1 reads\./.test(social.changed)
    && /Director draws her by these; her look's change is bridged in Learning to Socialize, gradually, over 16 seconds Size small middle-sized why\?/.test(social.changed),
    "and \"How she has changed\" has the bridge: what changed, over how long, from which frame, and what was chosen again and not bridged");
  // SLIPS and DETAIL, the opt-in extensions (stage 7, Ken's decision 3). A visitor who
  // never ticks them sees the page as before: the switch opens on "Ani as in 1978" with
  // nothing ticked, "Ani with the revival's extensions" ticks the five and nothing more
  // (and keeps no list of ticks, only the switch, as before), the prompt and schema with
  // the five are today's, and with SLIPS and DETAIL ticked too they are the same; "Which
  // extensions" has the registry's groups, SLIPS and DETAIL opt-in and unticked (and
  // CRITIC, in its own, with no tick)
  await js(`(() => { for (const k of ["ani-cinderella:mode:v1", "ani-cinderella:extensions:v1", "ani-cinderella:run:v1"]) localStorage.removeItem(k); })()`);
  await send("Page.navigate", { url: `${base}/app/film.check.html` });
  for (let k = 0; k < 50 && !(await js("!!window.__check").catch(() => false)); k++) await sleep(200);
  const optDefault = await js(`(async () => {
    const t = window.__check, wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const hex = async (s) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, "0")).join("");
    document.getElementById("open-editor").click();
    await wait(200);
    const side = document.getElementById("side");
    const ticks = () => [...side.querySelectorAll("input[data-ext]")].filter((x) => x.checked).map((x) => x.dataset.ext).sort().join();
    const pressed = () => [...side.querySelectorAll("[data-mode]")].filter((b) => b.getAttribute("aria-pressed") === "true").map((b) => b.dataset.mode).join();
    const first = { pressed: pressed(), ticks: ticks(), ext: t.modeExtensions().join() };
    side.querySelector('[data-mode="revival"]').click();
    await wait(100);
    const on = { pressed: pressed(), ticks: ticks(), ext: t.modeExtensions().join(), stored: localStorage.getItem("ani-cinderella:extensions:v1"), mode: localStorage.getItem("ani-cinderella:mode:v1") };
    const panel = side.querySelector(".ext-panel");
    const groups = [...panel.querySelectorAll(".ext-group")].map((g) => g.querySelector(".label").textContent + ": " + [...g.querySelectorAll("input[data-ext]")].map((x) => x.dataset.ext + (x.checked ? "+" : "-") + (x.closest(".ext").querySelector(".opt-in") ? " opt-in" : "")).join(", ")).join("; ");
    const STORY = ${JSON.stringify(STORY_FOR_PROMPTS)}, prompts = {};
    for (const [k, ext] of [["page", ${JSON.stringify(REVIVAL)}], ["all", [...${JSON.stringify(REVIVAL)}, "slips", "detail"]], ["slips", ${JSON.stringify(WITH_SLIPS)}], ["mendKnow", ["mend", "know"]], ["detail", ${JSON.stringify(WITH_DETAIL)}], ["mend", ["mend"]]]) prompts[k] = [await hex(t.storyPrompt(STORY, { extensions: ext })), await hex(t.storyPrompt(STORY, { extensions: ext, format: "json" })), await hex(JSON.stringify(t.storySchema(ext)))];
    side.querySelector('[data-mode="1978"]').click();
    await wait(100);
    return { first, on, groups, text: panel.textContent, prompts, back: pressed() + " " + ticks(), tidy: t.tidyStory(t.DATA.cindy, { extensions: [...${JSON.stringify(REVIVAL)}, "slips", "detail"] }).fixes.length };
  })()`);
  check(optDefault.first.pressed === "1978" && optDefault.first.ticks === "" && optDefault.first.ext === "" && optDefault.on.pressed === "revival" && optDefault.on.ticks === [...REVIVAL].sort().join() && optDefault.on.ext === REVIVAL.join() && optDefault.on.stored === null && optDefault.on.mode === "revival" && optDefault.back === "1978 ",
    `the default page is as before: the switch opens on "Ani as in 1978" with nothing ticked, and "Ani with the revival's extensions" ticks ${optDefault.on.ext} and nothing more, keeping only the switch in this browser`);
  check(optDefault.groups === "Knowledge: know+, appear+, change+, detail- opt-in; Repairs: mend+, seen+, fit+, slips- opt-in; Criticism: ; Yours: " && /Corrections of slips in Ken's files \(SLIPS\)\.\s+opt-in\s+Corrections of slips in Ken's files: places where his code does other than/.test(optDefault.text) && /A few of the "myriad details" \(DETAIL\)\.\s+opt-in\s+A few of the low-level details the thesis names as left undone/.test(optDefault.text) && /SLIPS1 S1 and S2: is-not/.test(optDefault.text) && /DTWALK \(f\) Deliberateness in Director's walk/.test(optDefault.text),
    `"Which extensions" has the registry's two groups, each extension with its tick and its sentence, SLIPS and DETAIL opt-in and unticked: ${optDefault.groups}`);
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  check(same(optDefault.prompts.page, PROMPT_REVIVAL_SHA) && same(optDefault.prompts.all, optDefault.prompts.page) && same(optDefault.prompts.slips, optDefault.prompts.mendKnow) && same(optDefault.prompts.detail, optDefault.prompts.mend) && optDefault.tidy === 0,
    `the prompt and schema with the switch's five are today's, the four's of before (${optDefault.prompts.page.map((h) => h.slice(0, 12)).join(", ")}), and SLIPS and DETAIL change neither (they add nothing to Ani's vocabulary), nor anything the page tidies in Ken's CINDY`);

  // Ken's Cinderella with SLIPS: ticked in 1978 mode, SLIPS brings KNOW and MEND, as
  // reports/ext/slips/ makes it, and the page makes it again with them, as it makes a
  // changed story, in the frames of SLIPS' README
  await open();
  const slipsTicked = await js(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.getElementById("open-editor").click();
    await wait(200);
    document.getElementById("ed-reset").click();
    await wait(200);
    const side = document.getElementById("side");
    const x = side.querySelector('input[data-ext="slips"]');
    x.checked = true;
    x.dispatchEvent(new Event("change", { bubbles: true }));
    await wait(200);
    side.querySelector(".ext-panel").open = true;
    return { ticks: [...side.querySelectorAll("input[data-ext]")].filter((y) => y.checked).map((y) => y.dataset.ext).sort().join(), pressed: [...side.querySelectorAll("[data-mode]")].filter((b) => b.getAttribute("aria-pressed") === "true").map((b) => b.dataset.mode).join(), some: (side.querySelector('[data-mode="some"]') || {}).textContent || "", note: side.querySelector(".mode-note").innerText, editor: document.getElementById("ed-check").innerText, make: !document.getElementById("ed-make").disabled, stored: localStorage.getItem("ani-cinderella:extensions:v1") };
  })()`);
  check(slipsTicked.ticks === "fit,know,mend,slips" && slipsTicked.pressed === "some" && /^Some of them: MEND, KNOW, FIT and SLIPS$/.test(slipsTicked.some) && slipsTicked.stored === JSON.stringify(WITH_SLIPS) && slipsTicked.make && /^With some of the revival's extensions \(MEND, KNOW, FIT and SLIPS\), Ani goes on where Ken's stopped on a new story, knows words, relationships, ways of showing and feelings Ken could have added, keeps each scene to the time its length gives it, a walk taking its stretch once, and corrects slips in Ken's files; the glass box says where each one acted\. Ken's own Cinderella comes out differently with them/.test(slipsTicked.note) && /This is Ken's story as it is\. With some of the revival's extensions \(MEND, KNOW, FIT and SLIPS\) Ani knows words/.test(slipsTicked.editor),
    `ticked in 1978 mode, SLIPS brings KNOW, FIT and MEND (${slipsTicked.ticks}), kept in this browser, the switch saying which ("${slipsTicked.some}", not "Ani with the revival's extensions": the review of stage 7, note 12), and Ken's story as it is can be made with them: ${slipsTicked.note.split(";")[0]}`);
  await js(`document.querySelector('#side input[data-ext="slips"]').closest(".ext-group").scrollIntoView({ block: "start" })`);
  await shot("16-which-extensions-slips.png");
  const t7 = Date.now();
  await js(`document.getElementById("ed-make").click()`);
  const slipsMade = await finished(400);
  check(/with some of the revival's extensions \(MEND, KNOW, FIT and SLIPS\): 5 of 5 scenes filmed/.test(slipsMade), `Ani makes Ken's Cinderella with SLIPS (${Math.round((Date.now() - t7) / 1000)} s): ${slipsMade}`);
  const slipsLasts = await lastsOf(5);
  check(same(slipsLasts, EXPECTED_SLIPS_LAST_FRAMES), `its scenes end at frames ${slipsLasts.join(", ")} (reports/ext/slips/README.md: 250, 122, 34, 185 and 73 frames, with FIT)`);
  // what it changed, and why, beside 1978's: the compare panel, the captions, the glass box
  await send("Page.navigate", { url: `${base}/app/film.check.html` });
  for (let k = 0; k < 100 && !(await js(`!!window.__check && /5 of 5 scenes filmed/.test(document.getElementById("run-status").innerText)`).catch(() => false)); k++) await sleep(200);
  const slipsSaid = await js(`(async () => {
    const t = window.__check, wait = (ms) => new Promise((r) => setTimeout(r, ms)), run = t.RUNS[1];
    const say = (i, f) => { const c = t.captionAt(run, i, f); return [c.text, ...c.more].join(" ").replace(/<[^>]+>/g, ""); };
    document.querySelector('#runbar [data-view="both"]').click();
    await wait(100);
    document.querySelectorAll("#side details").forEach((d) => (d.open = true));
    const compare = document.getElementById("side").innerText;
    t.setView(1);
    t.goScene(0, 172 / 4);
    t.select({ run: 1, char: "cinderella" });
    await wait(50);
    document.querySelectorAll("#side details").forEach((d) => (d.open = true));
    const why = document.getElementById("side").innerText;
    return { extensions: run.extensions.join(), compare, why, helps: say(0, 172), joys: say(0, 25), guard: say(1, 58) };
  })()`);
  check(/What SLIPS changed, and why/i.test(slipsSaid.compare) && /Frames at 4 a second: The Introduction 250 \(192 in 1978\), Kept Apart 122 \(116 in 1978\), No Longer Kept Apart 34 \(17 in 1978\), The Meeting 185 \(179 in 1978\), Justice 73 \(84 in 1978\)\. It needs KNOW and FIT, whose own differences from 1978 the glass box marks as theirs\./.test(slipsSaid.compare),
    `the compare panel says what SLIPS changed, with each scene's frames beside 1978's: ${(slipsSaid.compare.match(/Frames at 4 a second[^\n]*/) || [""])[0]}`);
  check(/In The Introduction, Cinderella helps the stepmother \(part 5, frames 157 to 206\), not the Prince: Cinderella's part asks for someone in the scene, ideally weak and good, and failing that anyone \(thesis p\. 100\), and is-not found the stepmother, who is neither; in 1978 Ken's is-not, given the task and not the scene, never found anyone \(sugest\.123:333-335, scene\.9:380\)\. Good's helping the stepmother and friendly's helping the Prince are the same to Ken's find-related-suggestions, which relates two conveys by their verb and who does it \(sugest\.123:162-177\), and only the first is made a task \(sugest\.123:204-210\)\./.test(slipsSaid.compare),
    "and why Cinderella helps her stepmother, not the Prince: is-not now looks in the scene, and Ken's relating takes the two helps as one, good's first");
  // S8 is FIT's since Ken's decision 13 (its notes said in the glass box and the captions
  // with FIT's), so SLIPS' panel no longer lists it
  check(!/cycle by cycle: Ken's Director multiplied in a walk's parent factor again/.test(slipsSaid.compare)
    && /Every change Ani planned for how a character moves runs for as long as DISPLY estimates it \(31 changes, in The Introduction, Kept Apart, The Meeting and Justice\)/.test(slipsSaid.compare) && /now change over 5 ticks, not 1/.test(slipsSaid.compare) && /high\s*20\s*10 \(10 ended with the film\)\s*3\.7 to 3\.9/.test(slipsSaid.compare) && /low\s*11\s*3 \(8 of a tick, which takes no step\)\s*0\.22 to 0\.23/.test(slipsSaid.compare) && /In Kept Apart: In part 3, which extends part 2, Ken's Director grew the dynamics of the part a feeling changes/.test(slipsSaid.compare)
    && /35 changes \(in The Introduction, Kept Apart, The Meeting and Justice\) grow their factor once a tick/.test(slipsSaid.compare) && /Every change takes all its steps \(37, in/.test(slipsSaid.compare),
    "and Director's corrections, each with Ken's line: the speed inversion with what Director measured (S9) (the walks set again, S8, FIT's now), each change grown once a tick (S10), every step taken (S11), and Kept Apart's feelings carried into the guard's walks (S13)");
  check(/In pass 1, friendly's suggestions for Cinderella's likings for strangers, enemies and friends are heard, named as pass 1's elements are \(dscrp\.17:106-108, elemnt\.1:101-105\); each is chosen as in 1978\./.test(slipsSaid.compare) && /Friendly suggests that Cinderella is drawn to strangers \(medium strength\), but Ken wrote it for attraction to strangers \(dscrp\.17:106-108\)[^]*Heard now, it is set aside, not compatible with the others: Cinderella strongly avoids strangers, as in 1978\./.test(slipsSaid.compare),
    "and pass 1's notes on Cinderella's tendencies, which hear friendly now and are chosen as in 1978 (S3)");
  check(/With SLIPS, Cinderella helps the stepmother: Cinderella's part asks for someone ideally weak and good, and failing that anyone, and is-not now looks in the scene; Ken's relating takes this and friendly's helping the Prince as the same, and good's comes first\./.test(slipsSaid.helps)
    && /With SLIPS, Cinderella's and the stepmother's changes here run as Ani planned them: over 5 ticks, not 1, growing once a tick and taking every step\./.test(slipsSaid.joys) && /The stepmother's walk takes its parent's factor once, so each cycle is no slower than the last \(the revival's correction, FIT\)\./.test(slipsSaid.guard),
    `the captions say each correction as its part plays: ${(slipsSaid.helps.match(/With SLIPS[^.]*\./) || [""])[0]}`);
  check(/What the corrections of slips did here \(7\)\s+Cinderella's part asks for someone in the scene who is, ideally, weak and good/.test(slipsSaid.why) && /With SLIPS, good's helping the stepmother and friendly's helping the Prince are the same to Ken's find-related-suggestions/.test(slipsSaid.why) && /Ken's is-not applies is-described-as as if it were a function, but it is the name of a generator \(sugest\.123:402\)/.test(slipsSaid.why),
    `her glass box, helping her stepmother, has the corrections, the one that found the stepmother first, and her chain says why the stepmother's helping displaced the Prince's: ${(slipsSaid.why.match(/What the corrections of slips did here \(\d+\)/) || [""])[0]}`);
  if (shots) {
    await js(`(async () => { document.querySelector('#runbar [data-view="both"]').click(); document.querySelectorAll("#scenes button")[0].click(); const s = document.getElementById("scrub"); s.value = 172 / 4; s.dispatchEvent(new Event("input")); await new Promise((r) => setTimeout(r, 150)); document.getElementById("stage").scrollIntoView({ block: "start" }); })()`);
    await shot("17-cinderella-with-slips-helps.png");
  }

  // Ken's Cinderella with DETAIL: ticked in 1978 mode, DETAIL brings MEND, as
  // reports/ext/detail/ makes it, in the frames of DETAIL's README
  await open();
  const detailTicked = await js(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.getElementById("open-editor").click();
    await wait(200);
    document.getElementById("ed-reset").click();
    await wait(200);
    const side = document.getElementById("side");
    side.querySelector('[data-mode="1978"]').click();
    await wait(100);
    const x = side.querySelector('input[data-ext="detail"]');
    x.checked = true;
    x.dispatchEvent(new Event("change", { bubbles: true }));
    await wait(200);
    return { ticks: [...side.querySelectorAll("input[data-ext]")].filter((y) => y.checked).map((y) => y.dataset.ext).sort().join(), make: !document.getElementById("ed-make").disabled, editor: document.getElementById("ed-check").innerText };
  })()`);
  check(detailTicked.ticks === "detail,mend" && detailTicked.make && /With some of the revival's extensions \(MEND and DETAIL\) Ani attends to a few of the thesis's “myriad details”, so you can make it as it is/.test(detailTicked.editor), `ticked in 1978 mode, DETAIL brings MEND (${detailTicked.ticks}), and Ken's story as it is can be made with them`);
  const t8 = Date.now();
  await js(`document.getElementById("ed-make").click()`);
  const detailMade = await finished(400);
  check(/with some of the revival's extensions \(MEND and DETAIL\): 5 of 5 scenes filmed/.test(detailMade), `Ani makes Ken's Cinderella with DETAIL (${Math.round((Date.now() - t8) / 1000)} s): ${detailMade}`);
  const detailLasts = await lastsOf(5);
  check(same(detailLasts, EXPECTED_DETAIL_LAST_FRAMES), `its scenes end at frames ${detailLasts.join(", ")} (reports/ext/detail/README.md: 189, 116, 16, 169 and 87 frames)`);
  await send("Page.navigate", { url: `${base}/app/film.check.html` });
  for (let k = 0; k < 100 && !(await js(`!!window.__check && /5 of 5 scenes filmed/.test(document.getElementById("run-status").innerText)`).catch(() => false)); k++) await sleep(200);
  const detailSaid = await js(`(async () => {
    const t = window.__check, wait = (ms) => new Promise((r) => setTimeout(r, ms)), run = t.RUNS[1];
    const say = (i, f) => { const c = t.captionAt(run, i, f); return [c.text, ...c.more].join(" ").replace(/<[^>]+>/g, ""); };
    const compare = t.optInSummary(run).replace(/<[^>]+>/g, "");
    const why = async (i, f, c) => { t.setView(1); t.goScene(i, f / 4); t.select({ run: 1, char: c }); await wait(50); document.querySelectorAll("#side details").forEach((d) => (d.open = true)); return document.getElementById("side").innerText; };
    return { compare, keptApart: say(1, 2), meeting: say(3, 4), prince: await why(4, 43, "prince"), stepmother: await why(4, 43, "step-mother") };
  })()`);
  check(/What DETAIL changed, and why/.test(detailSaid.compare) && /Frames at 4 a second: The Introduction 189 \(192 in 1978\), Kept Apart 116 \(116 in 1978\), No Longer Kept Apart 16 \(17 in 1978\), The Meeting 169 \(179 in 1978\), Justice 87 \(84 in 1978\)\./.test(detailSaid.compare)
    && /Director's walk reads deliberateness: [^.]*the stepmother \(high\) in The Introduction, Kept Apart, The Meeting and Justice; the fairy godmother \(low\) in No Longer Kept Apart and The Meeting/.test(detailSaid.compare)
    && /\(16 clauses, on 12 tasks, in The Introduction, Kept Apart, No Longer Kept Apart, The Meeting and Justice\)[^.]*\. [^.]*\. Here they decide nothing: every way of showing chosen is the one chosen in 1978/.test(detailSaid.compare)
    && /Kept Apart \(fast, then slow\): Cinderella speeds up in part 1, and Cinderella and the stepmother slow down in part 3; No Longer Kept Apart \(fast\): Cinderella and the fairy godmother speed up in part 1/.test(detailSaid.compare),
    "the compare panel says what DETAIL changed, with each scene's frames beside 1978's: the deliberate walks, the tendencies (deciding nothing), the scenes' rhythms");
  check(/With DETAIL, Cinderella walks deliberately \(high\): arcs twice as long, jags half as large\./.test(detailSaid.keptApart) && /With DETAIL, Kept Apart's rhythm \(fast, then slow\) speeds Cinderella up a quarter here\./.test(detailSaid.keptApart) && /With DETAIL, the fairy godmother walks with little deliberateness \(low\): arcs half as long, jags twice as large; the stepmother walks deliberately \(high\)/.test(detailSaid.meeting),
    `the captions say each detail as its part plays: ${(detailSaid.keptApart.match(/With DETAIL, Kept[^.]*\./) || [""])[0]}`);
  check(/Best when Cinderella is drawn to the Prince \(met\) and the Prince is drawn to Cinderella \(met\): DETAIL's clause/.test(detailSaid.prince) && /What the details did here \(2\)/.test(detailSaid.prince) && /Deliberateness\s+medium\s+as Ani chose for the Prince in pass 1 why medium\?; Director's walk reads it \(DETAIL\), and medium changes nothing/.test(detailSaid.prince)
    && /Deliberateness\s+high[^\n]*Director's walk reads it \(DETAIL\): arcs twice as long, jags half as large/.test(detailSaid.stepmother),
    "the glass box says DETAIL's best-when clauses where the scores show, and that Director's walk reads deliberateness, in the table of how each moves");
  // "How he has changed" with DETAIL: deliberateness is read by Director's walk, the
  // tendencies by the best-when scores (src/pipeline.js elementUse)
  const changeDetail = await js(`(async () => {
    const t = window.__check, r = ${JSON.stringify(CHANGE_DETAIL)};
    const run = t.makeRun({ label: "Yours", short: "Yours", cindy: r.story, choicePoints: r.choicePoints, scenes: r.scenes, extensions: r.extensions, repairs: r.repairs, appearances: r.appearances, changes: r.changes });
    const k = run.sceneIds.findIndex((id) => r.changes && r.changes[id] && !r.changes[id].error);
    return { k, body: k < 0 ? "" : t.using(run, () => t.changedBody(run, "troll", k)).replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ") };
  })()`);
  check(changeDetail.k >= 0 && /Director moves him by these[^]*Deliberateness \(Director's walk reads it: DETAIL\)/.test(changeDetail.body) && /The best-when scores of the ways of showing read these \(DETAIL\), from the next scene on Liking for friends/.test(changeDetail.body) && !/Liking for/.test((changeDetail.body.split("Chosen again; Director doesn't use these")[1] || "").split("What Ani held")[0]),
    `with DETAIL, "How he has changed" says Director's walk reads deliberateness and the best-when scores the tendencies, where it said "Director doesn't use these, as in 1978": ${(changeDetail.body.match(/The best-when scores[^.]*\)/) || [""])[0]}`);
  // back to the switch's two settings, for what follows
  await js(`(() => { localStorage.removeItem("ani-cinderella:extensions:v1"); localStorage.setItem("ani-cinderella:mode:v1", "revival"); })()`);

  // Ken's testing on the page (2), 16 October: "Your films", any two films side by side,
  // the place put back on coming back from the code, and what the page keeps in the browser.
  // Two more films go into "Your films" as the page's worker makes them: a story of MEND's
  // (test/stories/stress/far-and-offstage.lisp, made here in Node) and the kind stepmother
  // made above (kept in this tab); Ken's Cinderella with SLIPS and with DETAIL, made above,
  // are there already
  await toCheckPage();
  const put = await js(`(async () => {
    const t = window.__check;
    const far = JSON.parse(${JSON.stringify(JSON.stringify(NEWER["far-and-offstage"]))});
    const run = t.makeRun({ label: "x", short: "x", cindy: far.story, choicePoints: far.choicePoints, scenes: far.scenes, extensions: far.extensions, repairs: far.repairs, appearances: far.appearances });
    run.status = { running: false, made: new Date(Date.now() - 60000).toISOString(), seconds: 9 };
    const a = await t.keepFilm(run);
    const b = await t.keepFilm(t.runFromData(JSON.parse(await t.inflate(sessionStorage.getItem("ani-check-kind")))));
    return [a.kept, b.kept];
  })()`);
  await toCheckPage();
  const lib = await js(`(async () => {
    const t = window.__check, wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.getElementById("open-films").click();
    await wait(200);
    const films = t.library.films.map((f) => ({ id: f.id, title: f.title, ext: f.extensions.join() }));
    const pick = (re, ext) => films.find((f) => re.test(f.title) && (!ext || f.ext.split(",").includes(ext)));
    return { films, kind: pick(/^Cinderella: the stepmother pretty/), far: pick(/^Far/), detail: pick(/^Cinderella, as Ken told it$/, "detail"), slips: pick(/^Cinderella, as Ken told it$/, "slips"), current: t.RUNS[1] && t.RUNS[1].libId, button: document.getElementById("open-films").innerText,
      first: (document.querySelector("#side .films > li") || {}).innerText || "" };
  })()`);
  check(put.every(Boolean) && lib.kind && lib.far && lib.detail && lib.slips && lib.current === lib.kind.id && lib.films[0].id === lib.kind.id && /your version now/.test(lib.first) && lib.button === `Your films (${lib.films.length})`,
    `"Your films" lists every film kept, the newest first, the reader's version marked (${lib.films.length}: ${lib.films.map((f) => f.title).join(" | ")})`);
  await shot("17-your-films.png");
  await phone("17b-your-films-phone.png", `document.querySelector("#side .films")`);
  if (lib.kind && lib.far && lib.detail && lib.slips) {
    const filmItem = (id) => `document.querySelector('#side [data-film="' + ${JSON.stringify(id)} + '"]')`;
    const panelNow = `(() => { const side = document.getElementById("side"), t = window.__check; return { pair: t.state.pair.join(), view: String(t.state.view), head: side.querySelector("h2").innerText, side: side.innerText, captions: [0, 1].map((r) => document.getElementById("caption-" + r).innerText), selects: [...document.querySelectorAll("select.which-film")].map((s) => s.value + "=" + s.selectedOptions[0].text), scenes: [...document.querySelectorAll("#scenes button")].map((b) => b.innerText).join(", "), label: document.getElementById("frame-label").innerText }; })()`;
    // Ken's 1978 film beside one of "Your films": its "on the right"
    await js(`${filmItem(lib.detail.id)}.querySelector('[data-film-act="right"]').click()`);
    await sleep(500);
    const kenBeside = await js(panelNow);
    check(kenBeside.view === "both" && kenBeside.pair === `ken,lib:${lib.detail.id}` && kenBeside.head === "Two films of one story" && /On the right: Cinderella, as Ken told it, one of your films/.test(kenBeside.side) && /Nothing: this is Ken's story\./.test(kenBeside.side) && /Made with some of the revival's extensions \(MEND and DETAIL\)\./.test(kenBeside.side) && /How Ani's choices changed/i.test(kenBeside.side) && /\n1978\n[^]*\nYours\n/.test(kenBeside.side)
      && /^1978 · Scene 1 · The Introduction/.test(kenBeside.captions[0]) && /^Yours · Scene 1 · The Introduction/.test(kenBeside.captions[1]) && kenBeside.selects[0] === "ken=Ani's 1978 film" && kenBeside.selects[1].startsWith(`lib:${lib.detail.id}=Cinderella, as Ken told it · `),
      `1978 beside one of "Your films" (from its "on the right"): what was changed of Ken's story and of Ani's choices, scene by scene, each screen's caption tagged (${kenBeside.selects.join(" | ")})`);
    // two of "Your films", the left chosen from the list over its screen
    await js(`(() => { const s = document.querySelector('select.which-film[data-slot="0"]'); s.value = "lib:" + ${JSON.stringify(lib.slips.id)}; s.dispatchEvent(new Event("change", { bubbles: true })); })()`);
    await sleep(600);
    const two = await js(panelNow);
    // played together: from the start of Kept Apart, paused first; if the browser here runs no
    // animation frames (late in a long check it has been seen not to), stepped forward instead
    const played = await js(`(async () => {
      const t = window.__check, wait = (ms) => new Promise((r) => setTimeout(r, ms)), play = document.getElementById("play");
      const wasPlaying = t.state.playing;
      if (t.state.playing) play.click();
      t.goScene(1, 0);
      let ticks = 0, on = true;
      const count = () => { if (!on) return; ticks++; requestAnimationFrame(count); };
      requestAnimationFrame(count);
      play.click();
      for (let k = 0; k < 30 && t.state.time < 1.2; k++) await wait(100);
      on = false;
      if (t.state.playing) play.click();
      let how = "played";
      if (t.state.time < 1) { how = "stepped"; for (let k = 0; k < 6; k++) document.getElementById("fwd").click(); }
      await wait(100);
      return { how, wasPlaying, ticks, time: +t.state.time.toFixed(2), label: document.getElementById("frame-label").innerText, captions: [0, 1].map((r) => document.getElementById("caption-" + r).innerText.split("\\n")[0]) };
    })()`);
    // each part of it by name, so that a failure says which
    const twoOk = {
      pair: two.view === "both" && two.pair === `lib:${lib.slips.id},lib:${lib.detail.id}`, head: two.head === "Two films of one description",
      left: /Left, Cinderella, as Ken told it \([^)]*\): Ken's story, as he told it\. Made with some of the revival's extensions \(MEND, KNOW, FIT and SLIPS\), at 4 frames a second\./.test(two.side),
      right: /Right, Cinderella, as Ken told it \([^)]*\): Ken's story, as he told it\. Made with some of the revival's extensions \(MEND and DETAIL\), at 4 frames a second\./.test(two.side),
      story: /Not at all: both were told the same film description\./.test(two.side), made: /They were made differently: the left with some of the revival's extensions \(MEND, KNOW, FIT and SLIPS\), the right with some of the revival's extensions \(MEND and DETAIL\)\./.test(two.side),
      choices: /In pass 1, \d+ of Ani's \d+ choices of how they move came out differently on the right/.test(two.side), scenes: /The Introduction\nLeft\n\d+ s in \d+ parts?: [^]*\nRight\n\d+ s in \d+ parts?:/.test(two.side),
      captions: /^Left · Scene 1 · The Introduction/.test(two.captions[0]) && /^Right · Scene 1 · The Introduction/.test(two.captions[1]),
      played: /^Left · (Scene 2 · )?Kept Apart/.test(played.captions[0]) && /^Right · (Scene 2 · )?Kept Apart/.test(played.captions[1]) && /^1\.\d \//.test(played.label) && played.time >= 1,
    };
    const twoFailed = Object.keys(twoOk).filter((k) => !twoOk[k]);
    check(!twoFailed.length,
      `two of "Your films" side by side (the left chosen over its screen), playing together, and what differs between them: ${(two.side.match(/They were made differently[^\n]*/) || [""])[0]} ${(two.side.match(/In pass 1, [^\n]*/) || [""])[0]} (${played.how} to ${played.label}${played.how === "stepped" ? `: no animation frames ran here, ${played.ticks} in 3 s` : ""})${twoFailed.length ? ` (not: ${twoFailed.join(", ")}; ${JSON.stringify({ captions: two.captions.map((c) => c.split("\n")[0]), played })})` : ""}`);
    await js(`document.getElementById("stage").scrollIntoView({ block: "start" })`);
    await shot("18-side-by-side-two-films.png");
    // two different stories: said plainly, and not compared scene by scene
    await js(`(() => { window.__check.goScene(0, 0); const s = document.querySelector('select.which-film[data-slot="1"]'); s.value = "lib:" + ${JSON.stringify(lib.far.id)}; s.dispatchEvent(new Event("change", { bubbles: true })); })()`);
    await sleep(600);
    const apart = await js(panelNow);
    check(apart.head === "Two different stories" && /These are two different stories, so they can't be compared scene by scene: Cinderella, with Cinderella, the stepmother, the fairy godmother and the Prince in 5 scenes, and [^,]+, with [^.]+ in \d scenes?\. Each screen plays its own film/.test(apart.side) && /^Scene 1, Scene 2/.test(apart.scenes) && /^Left · Scene 1 · The Introduction/.test(apart.captions[0]) && /^Right · Scene 1 · /.test(apart.captions[1]) && /\nScene 2\nLeft\nKept Apart: [^\n]*\nRight\n—\n/.test(apart.side),
      `two different stories side by side are said to be, plainly, and each plays its own scenes (${apart.scenes})`);
    // rename, which stays after a reload and shows over the screen; save as a film file; open;
    // delete, which stays deleted
    await js(`(async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      document.getElementById("open-films").click();
      await wait(200);
      ${filmItem(lib.far.id)}.querySelector('[data-film-act="rename"]').click();
      await wait(50);
      const input = ${filmItem(lib.far.id)}.querySelector(".film-rename input");
      input.value = "  A film far off the stage  ";
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await wait(400);
    })()`);
    const renamed = await js(`({ item: ${filmItem(lib.far.id)}.querySelector(".film-title").innerText, option: [...document.querySelectorAll('select.which-film[data-slot="1"] option')].map((o) => o.text).find((x) => /far off/.test(x)) || "" })`);
    await toCheckPage();
    const renamedKept = await js(`window.__check.library.films.find((f) => f.id === ${JSON.stringify(lib.far.id)}).title + " " + window.__check.library.films.find((f) => f.id === ${JSON.stringify(lib.far.id)}).renamed`);
    const saved = await js(`(async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      document.getElementById("open-films").click();
      await wait(200);
      const orig = HTMLAnchorElement.prototype.click;
      let got = null;
      HTMLAnchorElement.prototype.click = function () { if (this.download) got = { name: this.download, href: this.href }; else orig.call(this); };
      try {
        ${filmItem(lib.far.id)}.querySelector('[data-film-act="save"]').click();
        for (let k = 0; k < 100 && !got; k++) await wait(100);
      } finally { HTMLAnchorElement.prototype.click = orig; }
      if (!got) return { saved: false };
      const o = JSON.parse(await (await fetch(got.href)).text());
      return { saved: true, name: got.name, format: o.format, version: o.version, lisp: o.lisp, extensions: o.extensions.join() };
    })()`);
    check(renamed.item === "A film far off the stage" && /^A film far off the stage · /.test(renamed.option) && renamedKept === "A film far off the stage true" && saved.saved && saved.name === "ani-a-film-far-off-the-stage.json" && saved.format === "ani-film" && saved.lisp === NEWER["far-and-offstage"].story && saved.extensions === "mend",
      `a film renamed keeps its name after a reload, over its screen too (${renamed.option}), and is saved as a film file from the list (${saved.name})`);
    const opened = await js(`(async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      ${filmItem(lib.detail.id)}.querySelector('[data-film-act="open"]').click();
      await wait(800);
      return { status: document.getElementById("run-status").innerText, current: window.__check.RUNS[1].libId, view: String(window.__check.state.view), pair: window.__check.state.pair.join() };
    })()`);
    check(opened.current === lib.detail.id && /^Your version, with some of the revival's extensions \(MEND and DETAIL\): 5 of 5 scenes filmed/.test(opened.status) && opened.view === "both" && opened.pair === "ken,cur",
      `one of "Your films" opened becomes the reader's version, beside Ken's: ${opened.status}`);
    const deleted = await js(`(async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms)), t = window.__check;
      document.getElementById("open-films").click();
      await wait(200);
      const n = t.library.films.length;
      ${filmItem(lib.far.id)}.querySelector('[data-film-act="delete"]').click();
      await wait(50);
      const asked = ${filmItem(lib.far.id)}.querySelector(".film-confirm").innerText;
      ${filmItem(lib.far.id)}.querySelector('[data-delete="yes"]').click();
      await wait(500);
      return { n, now: t.library.films.length, asked, listed: !!document.querySelector('#side [data-film="' + ${JSON.stringify(lib.far.id)} + '"]') };
    })()`);
    await toCheckPage();
    const stillGone = await js(`!window.__check.library.films.some((f) => f.id === ${JSON.stringify(lib.far.id)})`);
    check(/^Delete “A film far off the stage” from this browser\? It can't be undone/.test(deleted.asked) && deleted.now === deleted.n - 1 && !deleted.listed && stillGone,
      `a film deleted, after the page asks, is gone from the list, and stays gone after a reload (${deleted.n} films, then ${deleted.now})`);

    // the place put back (Ken: "it was showing the state of the app after a refresh"): the
    // stepmother clicked in the reader's version at frame 30 of Kept Apart, side by side with
    // Ken's, "How Ani chose this" opened and the panel scrolled; then a code link, and "Back
    // to the film": as the browser kept the page (its back-forward cache), and with the page
    // made again from what it kept in this tab (a page with an unload handler, which the
    // browser doesn't keep); and a reload; and "Back to the film" from a code page opened
    // some other way, which opens film.html#view
    const inspect = `(async () => {
      const t = window.__check, wait = (ms) => new Promise((r) => setTimeout(r, ms));
      t.setView("both");
      t.goScene(1, 30 / 4 + 1e-4);
      t.select({ run: 1, char: "step-mother" });
      await wait(200);
      const d = [...document.querySelectorAll("#side details")].find((x) => /How Ani chose this/.test(x.querySelector("summary").textContent));
      if (d) d.open = true;
      await wait(100);
      document.getElementById("side").scrollTop = 120;
      await wait(700);
      window.__keptWhole = true;
    })()`;
    const placeNow = `(() => { const t = window.__check, side = document.getElementById("side"); return { view: String(t.state.view), pair: t.state.pair.join(), scene: t.state.scene, label: document.getElementById("frame-label").innerText, where: (side.querySelector(".where") || {}).innerText || "", who: (side.querySelector(".who") || {}).innerText || "", panel: t.state.panel, open: [...side.querySelectorAll("details")].filter((d) => d.open).map((d) => d.querySelector("summary").textContent.trim()).join(" | "), scroll: side.scrollTop, whole: !!window.__keptWhole, nav: performance.getEntriesByType("navigation")[0].type }; })()`;
    const viaCode = async (page) => {
      await toCheckPage(page);
      await js(inspect);
      const before = await js(placeNow);
      const link = await js(`(() => { const a = document.querySelector('#side a[href*="source.html"]'); if (!a) return ""; a.click(); return a.getAttribute("href"); })()`);
      for (let k = 0; k < 50 && !(await js(`/source\\.html$/.test(location.pathname) && !!document.querySelector(".code .l")`).catch(() => false)); k++) await sleep(200);
      const there = await js("location.pathname + location.hash").catch(() => "");
      await js(`document.querySelector("a.back-to-film").click()`);
      for (let k = 0; k < 75 && !(await js(`!!window.__check && !window.__check.view.restoring && /film/.test(location.pathname)`).catch(() => false)); k++) await sleep(200);
      await sleep(800);
      return { before, link, there, after: await js(placeNow) };
    };
    const samePlace = (a, b) => a.view === b.view && a.pair === b.pair && a.scene === b.scene && a.label === b.label && a.where === b.where && a.who === b.who && a.panel === b.panel && a.open === b.open && Math.abs(a.scroll - b.scroll) <= 2;
    const kept = await viaCode("film.check.html");
    check(kept.link && /source\.html$/.test(kept.there.split("#")[0]) && samePlace(kept.before, kept.after) && /Kept Apart · part \d+ of \d+ · frame 30 of/.test(kept.after.where) && kept.after.panel === "why",
      `a code link from the stepmother's glass box, then "Back to the film": the same films, scene, frame, character, panel, details and scroll (${kept.after.whole ? "kept whole by the browser's back-forward cache, pageshow persisted" : `made again, ${kept.after.nav}`}): ${kept.after.who} · ${kept.after.where} · ${kept.after.open}`);
    const remade = await viaCode("film.nobf.html");
    check(remade.link && samePlace(remade.before, remade.after) && !remade.after.whole && remade.after.nav === "back_forward",
      `and with the page made again (no back-forward cache), put back from what it kept in this tab: ${remade.after.who} · ${remade.after.where} · ${remade.after.open} · scrolled ${remade.after.scroll}`);
    await shot("19-context-restored.png");
    await send("Page.reload");
    for (let k = 0; k < 75 && !(await js(`!!window.__check && !!window.__check.library.ready && !window.__check.view.restoring && !!window.__check.state.selected`).catch(() => false)); k++) await sleep(200);
    await sleep(800);
    const reloaded = await js(placeNow);
    check(samePlace(remade.after, reloaded) && reloaded.nav === "reload", `and after a reload: ${reloaded.who} · ${reloaded.where}`);
    await send("Page.navigate", { url: "about:blank" });
    await sleep(300);
    await send("Page.navigate", { url: `${base}/app/pass1.html` });
    for (let k = 0; k < 50 && !(await js(`!!document.querySelector("a.back-to-film") && !!document.querySelector(".cell")`).catch(() => false)); k++) await sleep(200);
    const pass1Link = await js(`document.querySelector("a.back-to-film").getAttribute("href")`);
    await js(`document.querySelector("a.back-to-film").click()`);
    for (let k = 0; k < 75 && !(await js(`/film\\.html$/.test(location.pathname) && document.getElementById("side").innerText.includes("The stepmother")`).catch(() => false)); k++) await sleep(200);
    await sleep(800);
    const fromLink = await js(`({ href: location.pathname + location.hash, where: (document.querySelector("#side .where") || {}).innerText || "", who: (document.querySelector("#side .who") || {}).innerText || "" })`);
    check(pass1Link === "film.html#view" && fromLink.href === "/app/film.html" && fromLink.where === remade.after.where && fromLink.who === remade.after.who,
      `"Back to the film" from a page opened some other way opens film.html#view, which puts back where this tab last was: ${fromLink.who} · ${fromLink.where}`);
  }

  // Criticism on the page (REVIVE;CRITIC, stages C0 to C3; reports/ext/critic/README.md,
  // "For the page"): Ken's 1978 film at 4 frames a second, criticized where the reasons
  // are and remade in the page's worker from the files his film was made with, each as
  // tools/check-critic.mjs's goldens have it (reports/ext/critic/<example>/summary.json),
  // beside it with "What your criticism changed"; a remade film criticized again (one
  // criticism taken back, another added) and remade from its own files; Ken's two Cinderella
  // examples offered in the story panel ("Try criticizing"), his footnote's (p. 64) made;
  // "not this way" in the godmother's "Why this way"; a version-3 film file and "Your films"
  // after a reload; a film kept without its working files made again from the start, said
  // so; and the "Which extensions" panel's "criticism" group, CRITIC never ticked.
  {
    await toCheckPage();
    await js(`document.querySelector('#rate [data-rate="4"]').click()`);
    await sleep(300);
    const critPanel = await js(`(() => { const t = window.__check; const div = document.createElement("div"); div.innerHTML = t.extensionsPanel(); const g = [...div.querySelectorAll(".ext-group")].find((x) => /^Criticism/.test(x.querySelector(".label").textContent)); return { group: g ? g.innerText : "", ticks: [...div.querySelectorAll("input[data-ext]")].map((x) => x.dataset.ext).join() }; })()`);
    check(/Your criticism \(CRITIC\)\. on demand/.test(critPanel.group) && !critPanel.ticks.includes("critic") && /never ticked/.test(critPanel.group),
      `"Which extensions" lists CRITIC in a "criticism" group, loaded on demand, with no tick of its own (ticks: ${critPanel.ticks})`);
    const remakeDone = async (label) => {
      const t0 = Date.now();
      for (let k = 0; k < 900 && await js(`(() => { const r = window.__check.RUNS[1]; return !r || !r.status || r.status.running; })()`); k++) await sleep(1000);
      await sleep(800);
      await js(`document.querySelectorAll("#side .crit-changed details").forEach((d) => { d.open = true; })`);
      await sleep(100);
      const made = await js(`(() => { const t = window.__check, r = t.RUNS[1]; return { frames: r.scenes.map((s) => s && s.film ? s.film.frames.length : null), how: r.remade ? r.remade.scenes.map((s) => s.how) : null, error: r.status.error || null, files: !!r.raw.files, criticism: (r.criticism || []).map((c) => c.kind), pair: t.state.pair.join(), view: String(t.state.view), side: document.getElementById("side").innerText }; })()`);
      console.log(`      (${label}: ${Math.round((Date.now() - t0) / 1000)} s)`);
      return made;
    };
    const story0 = await js(`document.getElementById("side").innerText`);
    check(/Try criticizing the film as Ken suggested: No Longer Kept Apart is too quick \(p\. 69\) · the fairy godmother should start far from Cinderella \(p\. 69\) · Cinderella is not to meet the Prince until the third scene \(p\. 64\)/.test(story0),
      "the story panel offers Ken's two examples to try: No Longer Kept Apart too quick, the fairy godmother starting far, and Cinderella not meeting the Prince until the third scene");
    // the godmother in No Longer Kept Apart: "Not this way" and "Too quick"
    await js(`(() => { const t = window.__check; t.goScene(2, 2.0); t.select({ run: 0, char: "fairy-godmother" }); })()`);
    await sleep(400);
    const buttons = await js(`(() => { const s = document.getElementById("side"); return { way: [...s.querySelectorAll(".why-act .crit-btn")].map((b) => b.textContent), timeline: [...s.querySelectorAll(".timeline .crit-btn")].map((b) => b.textContent), scene: s.querySelector(".crit-scene") ? s.querySelector(".crit-scene").innerText : "" }; })()`);
    check(buttons.way.join() === "Not this way: another way,Too quick,Too slow" && buttons.timeline.join() === "Too quick,Too slow" && /Criticize No Longer Kept Apart as a whole/.test(buttons.scene),
      `the godmother's glass box: "Why this way" with ${buttons.way[0]}, "Why so long" and the timeline's part with Too quick and Too slow, and "Criticize No Longer Kept Apart as a whole"`);
    await shot("20-criticism-buttons.png");
    await js(`[...document.querySelectorAll("#side .why-act .crit-btn")].find((b) => b.textContent === "Too quick").click()`);
    await sleep(300);
    const listed = await js(`(document.getElementById("crit") || {}).innerText || ""`);
    check(/No Longer Kept Apart: too quick, the part where the fairy godmother undoes what happened in Kept Apart/.test(listed) && /not yet heeded/.test(listed) && /Take it back/.test(listed) && /Ani will plan No Longer Kept Apart, the Meeting and Justice again, and film again those whose plan changes; the Introduction and Kept Apart are kept as they were/.test(listed),
      `"Too quick" goes into "Your criticism", in plain words, with "Take it back" and what a remake will do: ${(listed.match(/Ani will plan[^.]*\./) || [""])[0]}`);
    await shot("21-your-criticism.png");
    await phone("21b-your-criticism-phone.png", `document.getElementById("crit")`);
    await js(`document.querySelector("#crit .crit-go").click()`);
    const quick = await remakeDone("No Longer Kept Apart too quick");
    // nlka-too-quick: 30, 183, 90, the Introduction and Kept Apart kept
    check(!quick.error && quick.frames.join() === "192,116,30,183,90" && quick.how.join() === "kept,kept,refilmed,refilmed,refilmed" && quick.files && quick.pair === "ken,cur" && quick.view === "both"
      && /What your criticism changed\s+Your version was remade from Ken's 1978 film \(on the left\) with your criticism\./i.test(quick.side) && /Met No Longer Kept Apart: too quick/i.test(quick.side) && /Ani gave it 5\.97 s instead of 3\.98 s, the walks slowed to fit \(stretched by 1\.5, where they were 1\)/.test(quick.side),
      `"Remake with my criticism" remakes Ken's film in the worker from his files, as reports/ext/critic/nlka-too-quick has it (${quick.frames.join(", ")} frames; ${quick.how.join(", ")}), beside his, with "What your criticism changed": met, 5.97 s instead of 3.98`);
    await shot("22-criticism-side-by-side.png");
    // the remade film, alone: its glass box, then "too quick" taken back and "start far" added
    await js(`(() => { const t = window.__check; t.setView(1); t.goScene(2, 2.0); t.select({ run: 1, char: "fairy-godmother" }); })()`);
    await sleep(400);
    const here = await js(`(document.querySelector("#side .crit-here") || {}).innerText || ""`);
    check(/What your criticism did here \(1\)\s+You said this part was too quick: Ani gave it 5\.97 s instead of 3\.98 s/.test(here), `the remade film's glass box says "What your criticism did here": ${here.split("\n")[1] || ""}`);
    await js(`window.__check.select(null)`);
    await sleep(300);
    await js(`[...document.querySelectorAll("#crit button")].find((b) => b.textContent === "Take it back").click()`);
    await sleep(200);
    await js(`(() => { document.querySelector("#side .crit-scene").open = true; document.querySelector("#side .crit-far .crit-btn").click(); })()`);
    await sleep(300);
    const again = await js(`(document.getElementById("crit") || {}).innerText || ""`);
    check(/No Longer Kept Apart: the fairy godmother starts far from Cinderella\s*\(you said “Have the fairy godmother start far from Cinderella”\)\s*not yet heeded/.test(again) && /taken back: the remake makes the film without it/.test(again),
      `on the remade film, "too quick" taken back and "Start far" (offered: she starts where Kept Apart left her, though she had no part in it) added`);
    await js(`document.querySelector("#crit .crit-go").click()`);
    const far = await remakeDone("from the remade film: start far, too quick taken back");
    // nlka-start-far: 25, 177, 85
    check(!far.error && far.frames.join() === "192,116,25,177,85" && far.how.join() === "kept,kept,refilmed,refilmed,refilmed" && /^lib:/.test(far.pair) && /Taken back No Longer Kept Apart: too quick/i.test(far.side) && /Met No Longer Kept Apart: the fairy godmother starts far from Cinderella/i.test(far.side) && /The fairy godmother was placed off the stage, far from Cinderella, because you asked/.test(far.side),
      `a remade film criticized again and remade from its own files, as reports/ext/critic/nlka-start-far has it (${far.frames.join(", ")}), beside the film it was remade from: "too quick" taken back, "start far" met`);
    // a version-3 film file, and "Your films" after a reload
    const filed = await js(`(async () => { const t = window.__check; const text = await (await t.filmFile(t.RUNS[1])).text(); const outer = JSON.parse(text); const d = await t.readFilmFile(text); return { version: outer.version, outer: (outer.criticism || []).map((c) => c.kind).join(), inner: (d.criticism || []).map((c) => c.kind).join(), files: Object.keys(d.files || {}).length, from: d.remadeFrom ? d.remadeFrom.title : null }; })()`);
    check(filed.version === 3 && filed.outer === "start-far" && filed.inner === "start-far" && filed.files >= 16 && /^Cinderella, as Ken told it, with your criticism: No Longer Kept Apart too quick$/.test(filed.from),
      `a film remade with criticism is saved as a version-3 film file, with its criticism (outside and in), its ${filed.files} working files and the film it was remade from, and read back`);
    await send("Page.reload");
    for (let k = 0; k < 75 && !(await js(`!!window.__check && !!window.__check.library.ready && !window.__check.view.restoring`).catch(() => false)); k++) await sleep(200);
    await sleep(800);
    const listedFilms = await js(`(async () => { const t = window.__check; await t.library.ready; return t.library.films.filter((f) => f.remadeFrom).map((f) => \`\${f.title} | \${f.criticism || 0} | \${f.remadeFrom.ken ? "ken" : f.remadeFrom.title}\`); })()`);
    check(listedFilms.length >= 2 && listedFilms.some((x) => / \| 1 \| ken$/.test(x)) && listedFilms.some((x) => /^Cinderella, as Ken told it, with your criticism: The fairy godmother starting far\b.* \| 1 \| Cinderella, as Ken told it, with your criticism: No Longer Kept Apart too quick$/.test(x)),
      `after a reload "Your films" has each remade film, with its criticism and the film it was remade from: ${listedFilms.join("; ")}`);
    // Ken's footnote (p. 64), from "Try criticizing"
    await toCheckPage();
    await js(`(() => { const t = window.__check; t.setView(0); t.goScene(0, 0); t.select(null); })()`);
    await sleep(300);
    await js(`[...document.querySelectorAll("#side .crit-try button")].find((b) => /third scene/.test(b.textContent)).click()`);
    await sleep(300);
    await js(`document.querySelector("#crit .crit-go").click()`);
    const apart = await remakeDone("Ken's footnote, Cinderella and the Prince kept apart");
    // intro-apart: 151, and Kept Apart to Justice planned again and kept; with Ken's
    // knowledge Ani picks helping the Prince, which it has no way to show
    check(!apart.error && apart.frames.join() === "151,116,17,179,84" && apart.how.join() === "refilmed,unchanged,unchanged,unchanged,unchanged"
      && /Met Keep Cinderella and the Prince apart in the Introduction and Kept Apart \(you said “Cinderella is not to meet the Prince until the third scene”\)/i.test(apart.side)
      && /To establish what Cinderella is like \(good, friendly, hard working, shy\), Ani now shows only that Cinderella helps the Prince, which it has no way to show \(as in 1978\), so none of it is on the screen/.test(apart.side)
      && /In Kept Apart they come no closer than 0\.345 of the screen \(frame 72\)/.test(apart.side) && /planned again: the same program, so its film is kept/.test(apart.side),
      `Ken's footnote, "Cinderella is not to meet the Prince until the third scene", as reports/ext/critic/intro-apart has it (${apart.frames.join(", ")}; ${apart.how.join(", ")}): her friendliness is shown by helping the Prince, which Ani as in 1978 can't show, and Kept Apart on are planned again and kept, the two never closer than 0.345 of the screen`);
    await js(`(() => { const d = [...document.querySelectorAll("#side .crit-changed details")][0]; if (d) d.open = true; })()`);
    await sleep(200);
    await shot("23-criticism-footnote.png");
    // "not this way" in the godmother's "Why this way"
    await js(`(() => { const t = window.__check; t.setView(0); t.goScene(2, 2.0); t.select({ run: 0, char: "fairy-godmother" }); })()`);
    await sleep(400);
    await js(`[...document.querySelectorAll("#side .why-act .crit-btn")].find((b) => b.textContent === "Not this way: another way").click()`);
    await sleep(300);
    await js(`document.querySelector("#crit .crit-go").click()`);
    const veto = await remakeDone("not this way, the godmother's goes-to-and-accompanys");
    await js(`(() => { const t = window.__check; t.goScene(2, 1.0); t.select({ run: 1, char: "fairy-godmother" }); const d = [...document.querySelectorAll("#side details")].find((x) => /How Ani chose this/.test(x.querySelector("summary").textContent)); if (d) d.open = true; })()`);
    await sleep(400);
    const vetoed = await js(`(() => { const s = document.getElementById("side"); return { here: (s.querySelector(".crit-here") || {}).innerText || "", card: (s.querySelector(".method.vetoed") || {}).innerText || "", struck: !!s.querySelector(".method.vetoed s") }; })()`);
    // nlka-veto: 23, 178, 100
    check(!veto.error && veto.frames.join() === "192,116,23,178,100" && /Ani set aside “the fairy godmother goes to Cinderella and accompanies her”, vetoed by you, and chose among the ways left/.test(vetoed.here) && /^Vetoed by you/i.test(vetoed.card) && vetoed.struck,
      `"Not this way", as reports/ext/critic/nlka-veto has it (${veto.frames.join(", ")}): the godmother's way is struck through in "How Ani chose this", vetoed by you, and the glass box says what Ani did`);
    // a pass-1 choice criticized (C6, the revival's extension of Ken's idea): the Prince's
    // speed in his choice point offers "This is wrong: the Prince moves too fast", "Try
    // criticizing" has it, and the remake makes pass 1 again with everyone else held, as
    // reports/ext/critic/choice-prince has it (192, 116, 16, 201 and 111 frames): the
    // Prince's speed high to medium, said in his choice point, the fairy godmother's held,
    // and the full recompute's knock-on said in "What your criticism changed"
    await toCheckPage();
    const offered = await js(`(() => { const t = window.__check; t.setView(0); t.goScene(0, 1); t.select(null); const html = t.using(t.RUNS[0], () => t.choicePointBox("prince", "speed")); const d = document.createElement("div"); d.innerHTML = html; return { buttons: [...d.querySelectorAll(".crit-choice .crit-btn")].map((b) => b.textContent), label: (d.querySelector(".crit-choice .label") || {}).textContent || "", tried: [...document.querySelectorAll("#side .crit-try button")].map((b) => b.textContent) }; })()`);
    check(offered.buttons.join() === "This is wrong: the Prince moves too fast,This is wrong: the Prince moves too slowly,This is wrong: not high" && /The revival's: criticism of pass 1's choices/.test(offered.label) && offered.tried.includes("the Prince moves too fast"),
      `the Prince's speed (high) offers ${offered.buttons.map((b) => `"${b}"`).join(", ")}, labeled the revival's, and "Try criticizing" has "the Prince moves too fast"`);
    await js(`[...document.querySelectorAll("#side .crit-try button")].find((b) => b.textContent === "the Prince moves too fast").click()`);
    await sleep(300);
    const plan6 = await js(`(document.getElementById("crit") || {}).innerText || ""`);
    await js(`document.querySelector("#crit .crit-go").click()`);
    const choice = await remakeDone("the Prince moves too fast");
    const boxes = await js(`(() => { const t = window.__check; const text = (c) => { const d = document.createElement("div"); d.innerHTML = t.using(t.RUNS[1], () => t.choicePointBox(c, "speed")); return d.innerText; }; return { prince: text("prince"), godmother: text("fairy-godmother") }; })()`);
    check(!choice.error && choice.frames.join() === "192,116,16,201,111" && /Ani will make pass 1 again, choosing the Prince's speed afresh with your criticism and holding every other choice as it was/.test(plan6)
      && /Met the Prince moves too fast/i.test(choice.side) && /The Prince's speed: high in the film remade from, medium now\./.test(choice.side) && /Had Ani chosen everything afresh, the fairy godmother's speed would have gone from medium to high too; the remake held it\./.test(choice.side),
      `"the Prince moves too fast", as reports/ext/critic/choice-prince has it (${choice.frames.join(", ")}; ${choice.how.join(", ")}): met, high to medium, and the knock-on the remake held said beside Ken's film`);
    check(/high before; medium now, because you said “The Prince moves too fast”\./.test(boxes.prince) && /you said “The Prince moves too fast”/.test(boxes.prince.replace(/high before[^.]*\./, "")) && /Held as it was, medium, while pass 1 was made again for your criticism; on its own Ani would have chosen high\./.test(boxes.godmother),
      `the remade film's choice points: the Prince's "high before; medium now, because you said ...", his suggestion's source "you said ...", and the fairy godmother's speed "held as it was, medium; on its own Ani would have chosen high"`);
    await shot("24-choice-criticized.png");
    // "not this way" on the stepmother's guarding in Kept Apart: offered with a caution, and
    // when Ani stops in Ken's unfinished chases-to, the film kept as it was from there and
    // the criticism "couldn't be made", said in plain words (reports/ext/critic/ka-veto-guard)
    await toCheckPage();
    await js(`(() => { const t = window.__check; t.setView(0); t.goScene(1, 6.0); t.select({ run: 0, char: "step-mother" }); })()`);
    await sleep(400);
    const guard = await js(`(() => { const s = document.getElementById("side"); return { buttons: [...s.querySelectorAll(".why-act .crit-btn")].map((b) => b.textContent), caution: (s.querySelector(".why-act .crit-caution") || {}).innerText || "" }; })()`);
    check(guard.buttons.includes("Not this way: another way") && /The only other way Ani has here is a chase \(Ken's chases-to\)/.test(guard.caution),
      `the stepmother's guarding in Kept Apart offers "Not this way" with a caution that the chase left would stop Ani: ${guard.caution.slice(0, 120)}`);
    await js(`[...document.querySelectorAll("#side .why-act .crit-btn")].find((b) => b.textContent === "Not this way: another way").click()`);
    await sleep(300);
    await js(`document.querySelector("#crit .crit-go").click()`);
    const stoppedRemake = await remakeDone("not this way, the stepmother's guarding: Ani stops");
    check(!stoppedRemake.error && stoppedRemake.frames.join() === "192,116,17,179,84" && stoppedRemake.how.join() === "kept,stopped,after-stop,after-stop,after-stop"
      && /Couldn't be made Kept Apart: not/i.test(stoppedRemake.side) && /Ken's chases-to can't yet place the two/.test(stoppedRemake.side) && /kept as the film remade from had them/.test(stoppedRemake.side),
      `where Ani stops (Ken's chases-to, disply.311:95-111) the remake keeps the film as it was from that scene on (${stoppedRemake.frames.join(", ")}; ${stoppedRemake.how.join(", ")}) and says the criticism couldn't be made, and why`);
    // a film kept without its working files is made again from the start, and says so
    const scratch = await js(`(async () => {
      const t = window.__check, wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const d = JSON.parse(JSON.stringify(t.filmData(t.RUNS[1])));
      delete d.files;
      const run = t.runFromData(d);
      t.criticize(run, { kind: "start-far", scene: "no-longer-kept-apart", who: "fairy-godmother", from: "cinderella", said: null });
      const had = !!run.raw.files;
      t.startRemake(run);
      const seen = [];
      for (let k = 0; k < 150 && !seen.some((w) => /^Pass 1/.test(w)); k++) { await wait(100); const w = t.RUNS[1] === run ? "(not started)" : (t.RUNS[1].status || {}).what || ""; if (seen[seen.length - 1] !== w) seen.push(w); }
      const said = document.getElementById("run-status").innerText;
      const remaking = t.RUNS[1].remaking;
      t.stopRun({ quiet: true });
      return { had, seen, remaking, said };
    })()`);
    check(!scratch.had && scratch.remaking && scratch.remaking.fromScratch && /This film was saved before Ani kept its working files, so it is made again from the start: Pass 1/.test(scratch.said), `a film kept without its working files is made again from the start, and the status line says so throughout: "${scratch.said}"`);
    await js(`document.querySelector('#rate [data-rate="24"]').click()`);
    await sleep(200);
  }

  }
  // Teach Ani on the page (REVIVE;TEACH; reports/chapter-x/design-teaching.md;
  // reports/ext/teach/README.md, "For the page"). With no notebook, the page is as it was:
  // "Which extensions" lists TEACH in a "Yours" group, never ticked, no word is the
  // learner's, and the prompts are as pinned. The forms, one for each kind, with menus
  // from Ani's vocabulary for the film's extensions, Ken's own entry beside each, the
  // because required, and the Lisp it becomes with each part explained; refusals (a word
  // Ani knows, a story's character, an element's name) in plain words, with "Add to Ani's
  // word instead" and "Criticize this film instead"; "Check with Ani" (the trial job in a
  // worker, as Node's checkKnowledge says) and "Try it on a little story"; a notebook saved
  // as a file and opened from one (and dropped on the page), renamed, used (up to four)
  // and deleted, kept after a reload. Then the design's examples made with their
  // notebooks in the page's worker, the Introduction's frames as tools/check-teach.mjs's
  // goldens have them (reports/ext/teach/<example>/summary.json): grumpy unknown 226,
  // "grumpy is like mean" 225, "grumpy moves slowly" 234, "helping can look like going
  // along with" 229 (192 in 1978), "jealous" 222 and then 235; each beside the film made
  // without it, with "What your knowledge did" (won, combined, lost to pushing around,
  // with CHOMET's reason); the glass box's "your knowledge" badges ("she is grumpy, which
  // you taught Ani means much the same as mean") and "What your knowledge did here"; a
  // version-3 film file with the knowledge; "Your films"; the extensions panel's TEACH
  // ticked and greyed with the notebook's title; "Teach Ani instead" in criticism; and,
  // with notebooks used, the prompts still as pinned.
  {
    await toCheckPage();
    await js(`document.querySelector('#rate [data-rate="4"]').click()`);
    await sleep(300);
    // with no notebook, as before
    const none = await js(`(async () => {
      const t = window.__check, hex = async (s) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, "0")).join("");
      const div = document.createElement("div"); div.innerHTML = t.extensionsPanel();
      const g = [...div.querySelectorAll(".ext-group")].find((x) => /^Yours/.test(x.querySelector(".label").textContent));
      const STORY = ${JSON.stringify(STORY_FOR_PROMPTS)};
      return { notebooks: t.TEACHING.notebooks.length, group: g ? g.textContent.replace(/\\s+/g, " ") : "", ticked: g ? !!g.querySelector("input:checked") : null, yours: Object.values(t.vocabularyFor(${JSON.stringify(REVIVAL)})).filter((w) => w.yours).length,
        prompts: [await hex(t.storyPrompt(STORY, { extensions: [] })), await hex(t.storyPrompt(STORY, { extensions: [], format: "json" }))] };
    })()`);
    check(none.notebooks === 0 && /^Yours ?Knowledge you taught Ani \(Teach Ani\)[^]*Your knowledge \(TEACH\)\. on demand/.test(none.group) && none.ticked === false && none.yours === 0 && JSON.stringify(none.prompts) === JSON.stringify(PROMPT_1978_SHA),
      `with no notebook the page is as it was: "Which extensions" lists TEACH in a "Yours" group, on demand and unticked; no word is the learner's; the prompts are as pinned`);
    // the panel, beside "Change the story"
    await js(`(() => { window.__check.select(null); document.getElementById("open-teach").click(); })()`);
    await sleep(400);
    const panel = await js(`document.getElementById("side").innerText`);
    check(/^Teach Ani\s+Back\s+Teach Ani something it doesn't know\. Ani will use it in every film you make with your knowledge\./.test(panel) && /\+ Teach Ani…\s+A word like another\s+What a word suggests\s+A relationship\s+Another way of showing a verb\s+A feeling\s+A verb as a kind of another/i.test(panel) && /Try teaching: grumpy is like mean · grumpy moves slowly · helping can look like going along with · jealous/.test(panel) && /About teaching Ani/.test(panel),
      `"Teach Ani" beside "Change the story": a sentence, "+ Teach Ani…" with six kinds in order of ease, "Try teaching" with the design's four examples, and "About teaching Ani"`);
    const about = await js(`document.querySelector(".teach-about").textContent`);
    check(/Three Interactions between AI and Education/.test(about) && /Machine Intelligence 8/.test(about) && /AI-TR-540, pp\. 149–150/.test(about) && await js(`!!document.querySelector('.teach-about a[href*="drive.google.com/file/d/1_C_ZzwWCpTOa3Zp8UHAKFuVUA2JxeSSX"]') && !!document.querySelector('.teach-about a[href*="6abb311d-b27d-4829-9fc2-46baf6491077"]')`),
      `"About teaching Ani" cites Ken's 1977 paper (his copy) and AI-TR-540, pp. 149-150`);
    // each kind's form, its menus from Ani's vocabulary (Ken's 1978 film: no KNOW, no APPEAR)
    const forms = await js(`(async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const out = {};
      for (const kind of ["word", "suggests", "relationship", "way", "feeling", "verb"]) {
        document.querySelector('[data-teach-kind="' + kind + '"]').click();
        await wait(150);
        const f = document.getElementById("teach-form");
        const opts = (field) => [...f.querySelectorAll('select[data-tf="' + field + '"] option')].map((o) => o.value).filter(Boolean);
        out[kind] = { text: f.innerText, link: opts("link"), element: opts("element"), what: opts("what"), verb: opts("verb"), way: opts("way"), kindOf: opts("kindOf"), rows: opts("row-0-element") };
        document.querySelector('[data-teach-kind="' + kind + '"]').click();
        await wait(100);
      }
      return out;
    })()`);
    check(forms.word.link.includes("mean") && forms.word.link.includes("hard-working") && /Ken: “industrious” means much the same as “hard-working”/.test(forms.word.text)
      && forms.suggests.element.length === 12 && forms.suggests.what.join() === "moves,shows" && /Ken: a shy character's speed is low, weakly\. \(dscrp\.17:64\)/.test(forms.suggests.text)
      && forms.relationship.verb.join() === ",accompanys,chases,hurts,pushes,meets".slice(1) && /Ken: one who hates another shows it by keeping away from it/.test(forms.relationship.text)
      && forms.way.way.join() === "goes-to-and-accompanys,chases-to,move-to-and-hits,pushes-around,move-to" && forms.feeling.rows.length === 7 && /Ken: joy makes/.test(forms.feeling.text)
      && forms.verb.kindOf.join() === "accompanys,chases,hurts,pushes,meets" && /Ken: pushing is a kind of meeting/.test(forms.verb.text)
      && Object.values(forms).every((f) => /Because:/.test(f.text) && /Would this be true of any/.test(f.text) && /See it as Ani reads it/.test(f.text)),
      `each kind's form has menus from Ani's words and verbs for the film's extensions (Ken's 1978 film: no KNOW, so no following or helping; no APPEAR, so no looks), Ken's own entry beside it, the because, Ken's rule as a question, and the Lisp a click away`);
    // "grumpy is like mean": the Lisp it becomes, each part explained; the because required
    const set = (field, value) => js(`(() => { const el = document.querySelector('#teach-form [data-tf="${field}"]'); el.value = ${JSON.stringify(value)}; el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); })()`);
    await js(`document.querySelector('[data-teach-kind="word"]').click()`);
    await sleep(150);
    await set("word", "grumpy");
    await sleep(150);
    await set("link", "mean");
    await sleep(150);
    const noReason = await js(`(async () => { document.querySelector("[data-teach-add]").click(); await new Promise((r) => setTimeout(r, 200)); return { said: document.getElementById("teach-form-check").innerText, kept: window.__check.TEACHING.notebooks.length }; })()`);
    await set("because", "a grumpy character is a mean one");
    await sleep(150);
    const preview = await js(`(() => { document.querySelector("#teach-form .teach-lisp").open = true; const pre = document.getElementById("teach-form-lisp"); return { text: pre.innerText, why: pre.querySelectorAll(".lisp-why").length, yours: pre.querySelectorAll(".lisp-yours").length, fresh: pre.querySelectorAll(".lisp-new").length, check: document.getElementById("teach-form-check").innerText }; })()`);
    check(/^Say why: Ani keeps your reason with each piece/.test(noReason.said) && noReason.kept === 0 && /\(define grumpy personality-character-descriptor\)/.test(preview.text) && /\(ask mean add grumpy to your list of neighbors\)/.test(preview.text) && /;;yours k1: a grumpy character is a mean one/.test(preview.text) && preview.why >= 8 && preview.yours >= 2 && preview.fresh >= 2 && /Ani can take this\./.test(preview.check),
      `a word like another: the because is required ("Say why"), and the form shows the Lisp it becomes, Ken's DSCRP form, each part explained (${preview.why} explaining lines), the reason on ";;yours" lines and the form's part marked`);
    await js(`document.getElementById("teach-form").scrollIntoView({ block: "start" })`);
    await shot("30-teach-form.png");
    await phone("30b-teach-form-phone.png", `document.getElementById("teach-form")`);
    // refusals, in plain words: a word Ani knows, a story's character, an element's name
    const refusal = async (word) => { await set("word", word); await sleep(200); return js(`document.getElementById("teach-form").innerText`); };
    const lazy = await refusal("lazy");
    const speed = await refusal("speed");
    const step = await refusal("step-mother");
    const criticizeOffered = await js(`!!document.querySelector("[data-teach-criticize]")`);
    check(/Ani already knows "lazy", the opposite of "hard-working": add to Ani's word instead of teaching it again, which would replace it\./.test(lazy) && /Add to Ani's word instead/.test(lazy) && /"step-mother" is a character of the story, not a word for characters\. To change how this film shows her, criticize it/.test(step) && /Criticize this film instead/.test(step) && /"speed" is the name of one of the things Ani chooses, or of a value/.test(speed),
      `refused, in plain words: a word Ani knows ("Ani already knows "lazy"…", with "Add to Ani's word instead"), one of the story's characters ("…a character of the story, not a word for characters…", with "Criticize this film instead"), an element's name`);
    await js(`document.querySelector("[data-teach-criticize]").click()`);
    await sleep(300);
    const criticized = await js(`({ panel: window.__check.state.panel, sel: window.__check.state.selected && window.__check.state.selected.char })`);
    check(criticizeOffered && criticized.panel === "why" && criticized.sel === "step-mother", `"Criticize this film instead" opens the stepmother's glass box, where the film is criticized`);
    await js(`window.__check.openTeach()`);
    await sleep(200);
    await set("word", "grumpy");
    await sleep(150);
    await set("link", "mean");
    await set("because", "a grumpy character is a mean one");
    await sleep(100);
    await js(`document.querySelector("[data-teach-add]").click()`);
    const checked = async () => { for (let k = 0; k < 120 && await js(`!!(window.__check.teachUi.checking)`); k++) await sleep(500); await sleep(200); return js(`document.getElementById("side").innerText`); };
    const afterAdd = await checked();
    console.log(`      (after "Add to Ani": ${afterAdd.split("\n").slice(0, 12).join(" | ").slice(0, 500)})`);
    const node = checkKnowledge(makeProjectFileSystem(), [{ format: "ani-knowledge", version: 1, title: "My knowledge", pieces: [{ id: "k1", kind: "word", word: "grumpy", type: "personality", like: "mean", because: "a grumpy character is a mean one" }] }], { extensions: [] });
    check(/Added to “My knowledge”: "grumpy" is a word for what a character is like inside, and means much the same as "mean"\./.test(afterAdd) && /Ani hears it/i.test(afterAdd) && /Ani read your knowledge with Ken's files and heard every piece \([\d.]+ s\)/.test(afterAdd) && node.ok && node.notebooks[0].pieces.k1.heard,
      `"Add to Ani" keeps the piece in a notebook, and "Check with Ani" runs the trial job in a worker: heard, as Node's checkKnowledge says (${(afterAdd.match(/heard every piece \(([\d.]+) s\)/) || [])[1]} s)`);
    await js(`document.querySelector('[data-teach-rehearse="k1"]').click()`);
    for (let k = 0; k < 120 && await js(`/Trying it/.test(document.getElementById("side").innerText)`); k++) await sleep(500);
    const rehearsed = await js(`(document.querySelector(".teach-rehearsal") || {}).innerText || ""`);
    check(/^On a little story of two characters, one scene \(\d+ s\): Ani heard it/.test(rehearsed) || /^On a little story of two characters, one scene/.test(rehearsed), `"Try it on a little story": ${rehearsed}`);
    // a notebook saved as a file and opened from one, and dropped on the page; renamed,
    // used (up to four) and deleted; kept after a reload
    const files = await js(`(async () => {
      const t = window.__check, wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const rec = t.TEACHING.notebooks[0];
      const text = t.notebookFileText(rec), name = t.notebookFileName(rec);
      const file = JSON.parse(text);
      await t.openKnowledgeText(text, name);
      await wait(300);
      const opened = document.getElementById("side").innerText;
      const dt = new DataTransfer();
      dt.items.add(new File([text], "shared.ani-knowledge.json", { type: "application/json" }));
      document.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
      await wait(1200);
      return { name, format: file.format, version: file.version, pieces: file.pieces.length, lisp: /;;yours k1: a grumpy character is a mean one/.test(file.lisp || ""), opened, count: t.TEACHING.notebooks.length, titles: t.TEACHING.notebooks.map((n) => n.title), same: t.TEACHING.notebooks.every((n) => JSON.stringify(n.pieces) === JSON.stringify(rec.pieces)) };
    })()`);
    check(files.name === "my-knowledge.ani-knowledge.json" && files.format === "ani-knowledge" && files.version === 1 && files.pieces === 1 && files.lisp && /Opened my-knowledge\.ani-knowledge\.json: “My knowledge \(2\)”, 1 piece\./.test(files.opened) && files.count === 3 && files.same,
      `"Save as a file" writes ${files.name} (the notebook, its Lisp beside it), and "Open a shared file" and a file dropped on the page open it as a notebook of its own: ${files.titles.join(", ")}`);
    const books = await js(`(async () => {
      const t = window.__check, wait = (ms) => new Promise((r) => setTimeout(r, ms));
      document.querySelector(".teach-books").open = true;
      const row = (k) => document.querySelectorAll(".teach-nb")[k];
      row(1).querySelector('[data-teach-nb="rename"]').click();
      await wait(150);
      const input = document.querySelector("[data-teach-title]");
      input.value = "A class dictionary";
      document.querySelector('[data-teach-nb="rename-yes"]').click();
      await wait(300);
      // five notebooks: the fifth can't be used with four
      for (let k = 0; k < 2; k++) { document.querySelector('[data-teach-nb="new"]').click(); await wait(250); }
      document.querySelector(".teach-books").open = true;
      for (const box of document.querySelectorAll("[data-teach-use]")) if (!box.checked && !box.disabled) { box.click(); await wait(250); }
      document.querySelector(".teach-books").open = true;
      const boxes = [...document.querySelectorAll("[data-teach-use]")].map((b) => (b.checked ? "used" : b.disabled ? "disabled" : "free"));
      return { titles: t.TEACHING.notebooks.map((n) => n.title), boxes };
    })()`);
    // delete the last two (asked on the page first)
    for (let k = 0; k < 2; k++) {
      await js(`(async () => { const rows = document.querySelectorAll(".teach-nb"); rows[rows.length - 1].querySelector('[data-teach-nb="delete"]').click(); await new Promise((r) => setTimeout(r, 200)); document.querySelector('[data-teach-nb="delete-yes"]').click(); await new Promise((r) => setTimeout(r, 300)); document.querySelector(".teach-books").open = true; })()`);
    }
    await toCheckPage();
    const kept = await js(`(async () => { const t = window.__check; for (let k = 0; k < 50 && !t.TEACHING.loaded; k++) await new Promise((r) => setTimeout(r, 100)); return t.TEACHING.notebooks.map((n) => n.title + (n.used ? "+" : "-")); })()`);
    check(books.titles.includes("A class dictionary") && books.boxes.filter((b) => b === "used").length === 4 && books.boxes.includes("disabled") && kept.join() === "My knowledge+,A class dictionary+,My knowledge (3)+",
      `notebooks renamed, used up to four (the fifth's tick disabled: ${books.boxes.join(", ")}), deleted after the page asks, and kept in this browser after a reload: ${kept.join(", ")}`);
    // the design's examples, made in the page's worker at 4 frames a second, each stopped
    // once its Introduction is filmed (the scene each changes), beside the film made without
    const introOf = async (label) => {
      const t0 = Date.now();
      let f = null;
      for (let k = 0; k < 600 && !f; k++) { await sleep(1000); f = await js(`(() => { const r = window.__check.RUNS[1]; return r && r.scenes[0] && r.scenes[0].film && r.scenes[0].film.frames.length ? r.scenes[0].film.frames.length : r && r.status && !r.status.running && r.status.error ? "error: " + r.status.error : null; })()`); }
      await js(`window.__check.stopRun()`);
      for (let k = 0; k < 30 && await js(`!!(window.__check.RUNS[1] && window.__check.RUNS[1].status.running)`); k++) await sleep(300);
      await sleep(1200);
      console.log(`      (${label}: ${Math.round((Date.now() - t0) / 1000)} s)`);
      return f;
    };
    const example = (id) => js(`(async () => { await window.__check.openTeach(); await new Promise((r) => setTimeout(r, 200)); document.querySelector('[data-teach-example="${id}"]').click(); await new Promise((r) => setTimeout(r, 600)); })()`);
    const press = (sel) => js(`(() => { const b = document.querySelector('${sel}'); if (!b || b.disabled) return false; b.click(); return true; })()`);
    const did = () => js(`(() => { document.querySelectorAll("#side .teach-changed details").forEach((d) => { d.open = true; }); return (document.querySelector("#side .teach-changed") || {}).innerText || ""; })()`);
    const GOLD = Object.fromEntries(["grumpy-unknown", "grumpy", "grumpy-slow", "helps-with", "jealous-unknown", "jealous"].map((id) => [id, JSON.parse(readFileSync(`reports/ext/teach/${id}/summary.json`, "utf8")).scenes.find((s) => s.id === "introduction").frames]));
    // grumpy: unknown, then "grumpy is like mean"
    await example("grumpy");
    await press('[data-teach-example-make="grumpy"]');
    const grumpyUnknown = await introOf("grumpy, a word Ani doesn't know");
    await js(`window.__grumpyBefore = window.__check.RUNS[1]`);
    const plainFilm = await js(`(() => { const r = window.__check.RUNS[1]; return { knowledge: !!r.knowledge, version: window.__check.filmData(r).v }; })()`);
    await example("grumpy");
    await press('[data-teach-example-with="grumpy"]');
    const grumpy = await introOf("grumpy is like mean");
    const grumpyDid = await did();
    console.log(`      (what your knowledge did: ${grumpyDid.split("\n").slice(0, 4).join(" | ").slice(0, 400)})`);
    // her glass box: the attraction to enemies mean decides, now (neighbor-of grumpy mean)
    const badge = await js(`(() => {
      const t = window.__check;
      t.setView(1); t.goScene(0, 2); t.select({ run: 1, char: "step-mother" });
      const box = t.using(t.RUNS[1], () => t.choicePointBox("step-mother", "attraction-towards-enemies"));
      const here = (document.querySelector("#side .teach-here") || {}).innerText || "";
      const el = document.getElementById("cp-box"); if (el) el.innerHTML = box;
      if (el) { el.closest("details").open = true; el.scrollIntoView({ block: "center" }); }
      const div = document.createElement("div"); div.innerHTML = box;
      return { box: div.innerText, tags: div.querySelectorAll(".yours-tag").length, here };
    })()`);
    await sleep(300);
    await shot("32-teach-badge.png");
    check(grumpyUnknown === GOLD["grumpy-unknown"] && grumpy === GOLD.grumpy && !plainFilm.knowledge && plainFilm.version === 2 && /^What your knowledge did\s+Your version was made from “[^”]+” \(on the (left|right)\) again, with your knowledge: “Grumpy is like mean”\./i.test(grumpyDid) && /The Introduction: 226 frames, now 225\./.test(grumpyDid) && /Pass 1: 1 of Ani's 102 choices changed\./.test(grumpyDid) && /Won\s+"grumpy" is a word for what a character is like inside, and means much the same as "mean"\./i.test(grumpyDid),
      `"grumpy is like mean", made in the page's worker as Node makes it: the Introduction ${grumpyUnknown} frames with grumpy unknown, ${grumpy} with the knowledge (goldens ${GOLD["grumpy-unknown"]} and ${GOLD.grumpy}); the film made without it is version 2, with no knowledge; "What your knowledge did" beside it says the word won`);
    check(/she is grumpy, which you taught Ani means much the same as mean/.test(badge.box) && badge.tags >= 1 && /your knowledge: “a grumpy character is a mean one”/.test(badge.box) && /^What your knowledge did here \(\d+\)/.test(badge.here),
      `the glass box's badges: her attraction to enemies "because she is grumpy, which you taught Ani means much the same as mean", marked "your knowledge" with the reason; and "What your knowledge did here"`);
    // "grumpy moves slowly", beside the film where grumpy is unknown
    await example("grumpy-slow");
    await js(`(() => { const t = window.__check; const rec = t.TEACHING.notebooks.find((n) => n.example === "grumpy-slow"); t.makeWithKnowledge(window.__grumpyBefore, { notebooks: [rec] }); })()`);
    const slow = await introOf("grumpy moves slowly");
    const slowDid = await did();
    check(slow === GOLD["grumpy-slow"] && /Combined\s+A grumpy character's speed is low, medium strongly\./i.test(slowDid) && /The stepmother's speed: medium: yours met high \(from she is (strong|grumpy[^)]*)\) in the middle/.test(slowDid),
      `"grumpy moves slowly": the Introduction ${slow} frames (golden ${GOLD["grumpy-slow"]}); her speed combined, yours met strong's high in the middle: ${(slowDid.match(/Pass 1: [^\n]*/) || [""])[0]}`);
    // "helping can look like going along with": Ken's film, Ani as in 1978 (with MEND)
    await example("helps-with");
    await press('[data-teach-example-with="helps-with"]');
    const helps = await introOf("helping can look like going along with");
    const helpsDid = await did();
    check(helps === GOLD["helps-with"] && /made from Ken's 1978 film \(on the left\) again/.test(helpsDid) && /Won\s+Helping can also look like this/i.test(helpsDid) && /The Introduction: 192 frames, now 229\./.test(helpsDid) && /Cinderella helps the Prince: couldn't be done; now Cinderella goes to the Prince and accompanies him/.test(helpsDid),
      `"helping can look like going along with", made from Ken's 1978 film: the Introduction ${helps} frames (golden ${GOLD["helps-with"]}), where 1978 has 192; the helping 1978 canceled is shown, said in "What your knowledge did"`);
    // "jealous": unknown, then "green is jealous"
    await example("jealous");
    await press('[data-teach-example-make="jealous"]');
    const jealousUnknown = await introOf("jealous, words Ani doesn't know");
    await example("jealous");
    await press('[data-teach-example-with="jealous"]');
    const jealous = await introOf("green is jealous");
    const jealousDid = await did();
    await js(`(() => { const t = window.__check; t.select(null); t.goScene(0, 20); })()`);
    await sleep(400);
    await did();
    await js(`document.querySelector("#side .teach-changed").scrollIntoView({ block: "start" })`);
    await shot("31-teach-did.png");
    check(jealousUnknown === GOLD["jealous-unknown"] && jealous === GOLD.jealous && /Won\s+A jealous character's hue is green, medium strongly\./i.test(jealousDid) && /Lost to pushing around\s+One who is jealous of another shows it by following it/i.test(jealousDid) && /Ani prefers a way of showing that two of the words suggest at once \(pushes\), and only yours suggested follows \(Ken's CHOMET, eliminate-not-related-suggestions, chomet\.123:588-596\)/.test(jealousDid) && /Pass 1: 2 of Ani's 156 choices changed\./.test(jealousDid) && /The Introduction: 222 frames, now 235\./.test(jealousDid),
      `"jealous": the Introduction ${jealousUnknown} frames with the words unknown, ${jealous} with "green is jealous" (goldens ${GOLD["jealous-unknown"]} and ${GOLD.jealous}); "What your knowledge did": her hue won, her following lost to pushing around, with CHOMET's reason, and 2 of 156 choices changed`);
    // a version-3 film file with the knowledge; "Your films"; the extensions panel; criticism's hand-off
    const after = await js(`(async () => {
      const t = window.__check;
      const text = await (await t.filmFile(t.RUNS[1])).text();
      const outer = JSON.parse(text), d = await t.readFilmFile(text);
      const div = document.createElement("div"); div.innerHTML = t.extensionsPanel();
      const g = [...div.querySelectorAll(".ext-group")].find((x) => /^Yours/.test(x.querySelector(".label").textContent));
      const kept = t.library.films.filter((f) => f.knowledge).map((f) => f.knowledge.join());
      const crit = document.createElement("div"); crit.innerHTML = t.critBox(t.RUNS[0]);
      return { version: outer.version, outer: outer.knowledge, inner: (d.knowledge || []).map((n) => n.title + ":" + n.pieces.length), from: !!d.teachFrom, group: g ? g.textContent.replace(/\\s+/g, " ") : "", ticked: g ? !!g.querySelector("input:checked:disabled") : false, kept, crit: !!crit.querySelector("[data-teach-open]") };
    })()`);
    check(after.version === 3 && JSON.stringify(after.outer) === JSON.stringify([{ title: "Green is jealous", pieces: 5 }]) && after.inner.join() === "Green is jealous:5" && after.from && after.kept.includes("Green is jealous"),
      `a film made with knowledge is saved as a version-3 film file, the notebook as it was inside (${after.inner.join()}) and its title outside, and is in "Your films" with it`);
    check(/Your knowledge \(TEACH\): Green is jealous\./.test(after.group) && after.ticked && after.crit,
      `"Which extensions" ticks TEACH, greyed, with the notebook used ("Your knowledge (TEACH): Green is jealous"); and criticism's "About" offers "Teach Ani instead"${after.ticked && after.crit ? "" : ` (ticked ${after.ticked}, offered ${after.crit})`}`);
    await js(`(() => { const t = window.__check; const div = document.createElement("div"); div.innerHTML = t.critBox(t.RUNS[0]); document.body.append(div); div.querySelector("[data-teach-open]").click(); div.remove(); })()`);
    await sleep(300);
    const handed = await js(`window.__check.state.panel`);
    // with notebooks used, the prompts are as pinned (a notebook never reaches a model)
    const prompts = await js(`(async () => {
      const t = window.__check, hex = async (s) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, "0")).join("");
      const STORY = ${JSON.stringify(STORY_FOR_PROMPTS)};
      return { used: t.TEACHING.notebooks.filter((n) => n.used).length, y1978: [await hex(t.storyPrompt(STORY, { extensions: [] })), await hex(t.storyPrompt(STORY, { extensions: [], format: "json" }))], revival: [await hex(t.storyPrompt(STORY, { extensions: ${JSON.stringify(REVIVAL)} })), await hex(t.storyPrompt(STORY, { extensions: ${JSON.stringify(REVIVAL)}, format: "json" })), await hex(JSON.stringify(t.storySchema(${JSON.stringify(REVIVAL)})))] };
    })()`);
    check(handed === "teach" && prompts.used >= 1 && JSON.stringify(prompts.y1978) === JSON.stringify(PROMPT_1978_SHA) && JSON.stringify(prompts.revival) === JSON.stringify(PROMPT_REVIVAL_SHA),
      `"Teach Ani instead" opens Teach Ani; and with ${prompts.used} notebooks used, the prompts and the schema are as pinned`);
    await js(`document.querySelector('#rate [data-rate="24"]').click()`);
    await sleep(200);
  }

  if (!ONLY_TEACH) {
  // what the page keeps in the browser, and "Forget all of it"
  await toCheckPage();
  const keptNote = await js(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const closed = !document.getElementById("kept-note").open;
    document.getElementById("kept-note").open = true;
    await wait(200);
    const text = document.getElementById("kept-body").innerText;
    const keys = (s) => { const out = []; for (let k = 0; k < s.length; k++) if (s.key(k).startsWith("ani-cinderella:")) out.push(s.key(k)); return out; };
    const before = { local: keys(localStorage), session: keys(sessionStorage), films: window.__check.library.films.length };
    document.getElementById("kept-forget").click();
    await wait(100);
    const asked = document.getElementById("kept-confirm").innerText;
    sessionStorage.setItem("ani-check-before", JSON.stringify(before));
    return { closed, text, before, asked };
  })()`);
  check(keptNote.closed && /^Everything here stays in this browser, for this page alone/.test(keptNote.text) && /In localStorage, until you clear it\n[^]*Which Ani makes your films: Ani as in 1978, or with the revival's extensions \(ani-cinderella:mode:v1, \d+ characters?\)/.test(keptNote.text) && /Which frames a second the 1978 film is shown at \(ani-cinderella:rate:v1/.test(keptNote.text)
    && new RegExp(`In IndexedDB \\(the database “ani-cinderella”\\), until you clear it\\s+Your films: ${keptNote.before.films} films?, `).test(keptNote.text) && /In sessionStorage, until this tab is closed\s+Where you are on the page: [^]*\(\d+ places? in this tab's history/.test(keptNote.text) && new RegExp(`This deletes your ${keptNote.before.films} films?(, your \\d+ notebooks? of knowledge)? and everything listed above`).test(keptNote.asked),
    `"What this page keeps in your browser" (closed at first) says what is kept where: ${keptNote.before.local.length} keys in localStorage, ${keptNote.before.films} films in IndexedDB, ${keptNote.before.session.length} in sessionStorage; "Forget all of it" asks first`);
  await js(`document.getElementById("kept-yes").click()`);
  await sleep(1500);
  for (let k = 0; k < 75 && !(await js(`!!window.__check && !!window.__check.library.ready && window.__check.library.state === "ready"`).catch(() => false)); k++) await sleep(200);
  await sleep(500);
  const forgot = await js(`(async () => {
    const t = window.__check, before = JSON.parse(sessionStorage.getItem("ani-check-before"));
    const hex = async (s) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, "0")).join("");
    const local = []; for (let k = 0; k < localStorage.length; k++) if (localStorage.key(k).startsWith("ani-cinderella:")) local.push(localStorage.key(k));
    const STORY = ${JSON.stringify(STORY_FOR_PROMPTS)};
    return { local, session: before.session.filter((k) => !/:last$/.test(k) && sessionStorage.getItem(k) !== null), films: t.library.films.length, runbar: document.getElementById("runbar").hidden, view: String(t.state.view), panel: t.state.panel, side: document.querySelector("#side h2").innerText, caption: document.getElementById("caption-0").innerText,
      picture: document.getElementById("mode-color").getAttribute("aria-pressed"), rate: (document.querySelector('#rate [aria-pressed="true"]') || {}).textContent || "", more: [...document.querySelectorAll(".more-pages a")].map((a) => a.getAttribute("href") + "=" + a.textContent).join(", "), note: !document.getElementById("kept-note").open,
      prompts1978: [await hex(t.storyPrompt(STORY, { extensions: [] })), await hex(t.storyPrompt(STORY, { extensions: [], format: "json" }))],
      promptsRevival: [await hex(t.storyPrompt(STORY, { extensions: ${JSON.stringify(REVIVAL)} })), await hex(t.storyPrompt(STORY, { extensions: ${JSON.stringify(REVIVAL)}, format: "json" })), await hex(JSON.stringify(t.storySchema(${JSON.stringify(REVIVAL)})))] };
  })()`);
  check(!forgot.local.length && !forgot.session.length && forgot.films === 0 && forgot.runbar,
    `"Forget all of it" clears everything the page kept (localStorage, sessionStorage and its IndexedDB films), and the page starts afresh${forgot.local.length || forgot.session.length ? `: left ${[...forgot.local, ...forgot.session].join(", ")}` : ""}`);
  check(forgot.view === "0" && forgot.panel === "story" && forgot.side === "What Ani was told" && /The stepmother pushes Cinderella around/.test(forgot.caption) && forgot.picture === "true" && forgot.rate === "24 a second" && forgot.note
    && forgot.more === "../site/pages/students.html=A guide for students, ../site/pages/teachers.html=A guide for teachers, ../site/pages/making-of.html=How this was made, ../site/pages/making-of.html=How this was made, ../site/pages/students.html=A guide for students, ../site/pages/teachers.html=A guide for teachers"
    && JSON.stringify(forgot.prompts1978) === JSON.stringify(PROMPT_1978_SHA) && JSON.stringify(forgot.promptsRevival) === JSON.stringify(PROMPT_REVIVAL_SHA),
    `the page afresh is the default page as before (Ken's film in color at 24 a second, "What Ani was told", no films), with the links to the pages about Ani (${forgot.more.split(", ").map((x) => x.split("=")[0]).join(", ")}), and its prompts as pinned (${forgot.prompts1978.concat(forgot.promptsRevival).map((h) => h.slice(0, 8)).join(", ")})`);
  // back to the switch's extensions, for what follows
  // (the 1978 film is at 24 frames a second again, as before this section)
  await js(`(() => { localStorage.setItem("ani-cinderella:mode:v1", "revival"); })()`);

  // the prompt in 1978 mode is as it was
  const prompts1978 = await js(`(async () => {
    const t = window.__check, hex = async (s) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, "0")).join("");
    return [await hex(t.storyPrompt(${JSON.stringify(STORY_FOR_PROMPTS)}, { extensions: [] })), await hex(t.storyPrompt(${JSON.stringify(STORY_FOR_PROMPTS)}, { extensions: [], format: "json" }))];
  })()`);
  check(JSON.stringify(prompts1978) === JSON.stringify(PROMPT_1978_SHA), `the prompt in 1978 mode, Lisp and JSON, is as it was (${prompts1978.map((h) => h.slice(0, 12)).join(", ")})`);

  check(await film1978() === shipped, "Ken's 1978 film is as it was shipped");
  await js(`document.querySelector('#runbar [data-view="both"]').click()`);
  const quiet = await js(`({ sdk: typeof window.Sentry, script: !!document.querySelector('script[src*="sentry"]'), note: document.querySelector(".reporting").hidden, send: !!document.querySelector(".send-story") })`);
  check(!sentryAsked.length && quiet.sdk === "undefined" && !quiet.script && quiet.note && !quiet.send, `with no DSN, nothing of Sentry's is loaded or asked for, the page doesn't say errors are reported, and offers no story to send${sentryAsked.length ? ` (asked for ${sentryAsked[0]})` : ""}`);

  // with a DSN, as on the site (here it points at this server): nothing is sent, or loaded,
  // without the visitor's say-so (Ken, 20 October): an uncaught error shows a small notice,
  // "Ani ran into an error. Send a report to Ken, without any story, key or personal data?",
  // with what would be sent a click away, and nothing of Sentry's is asked for until Send;
  // then the error arrives with no key, story text or user; "Don't ask again" is kept in this
  // browser, and after it nothing is asked or sent; a story goes only when the visitor confirms
  reporting = true;
  const SECRET = "sk-check-NOT-A-REAL-KEY-0123456789", TOLD = "Once upon a check, a tortoise raced a hare across the meadow and won.";
  await js(`(() => { localStorage.setItem("ani-cinderella:keys:v1", JSON.stringify({ anthropic: ${JSON.stringify(SECRET)} })); localStorage.setItem("ani-cinderella:story:v1", ${JSON.stringify(TOLD)}); localStorage.removeItem("ani-cinderella:error-reports:v1"); })()`);
  const sdkAskedBefore = sdkAsked.length;
  await send("Page.navigate", { url: `${base}/app/film.report-check.html` });
  for (let k = 0; k < 50; k++) { await sleep(200); if (await js(`!!document.getElementById("caption-0") && document.getElementById("caption-0").innerText.length > 0`).catch(() => false)) break; }
  const noted = await js(`document.querySelector(".reporting").hidden ? "" : document.querySelector(".reporting").innerText`);
  await js(`setTimeout(() => { throw new Error("a deliberate check error, with ${SECRET} and ${TOLD}"); }, 0)`);
  await sleep(1500);
  const asked = await js(`(() => { const box = document.getElementById("report-ask"); if (!box || box.hidden) return null; const d = box.querySelector("details"); d.open = true; return { text: box.innerText, shown: d.querySelector("pre").innerText, sdk: typeof window.Sentry }; })()`);
  check(/Nothing is sent unless you press Send/.test(noted) && asked && /^Ani ran into an error\. Send a report to Ken, without any story, key or personal data\?/.test(asked.text) && /Send\s+Don't send\s+Don't ask again/.test(asked.text)
    && /a deliberate check error, with \[removed\] and \[removed\]/.test(asked.shown) && !asked.shown.includes(SECRET) && !asked.shown.includes(TOLD) && envelopes.length === 0 && asked.sdk === "undefined" && sdkAsked.length === sdkAskedBefore,
    `an uncaught error sends nothing: the page asks (${asked ? asked.text.split("\n")[0] : "no notice"}), with what would be sent a click away, its key and story text removed, and nothing of Sentry's is loaded or asked for until Send`);
  await shot("15-error-notice.png");
  await phone("15b-error-notice-phone.png", `document.getElementById("report-ask")`);
  await js(`document.querySelector('#report-ask [data-report="send"]').click()`);
  let sdk = false;
  for (let k = 0; k < 75 && !sdk; k++) { await sleep(200); sdk = await js(`typeof window.Sentry === "object" && !!window.Sentry.getClient && !!window.Sentry.getClient()`).catch(() => false); }
  if (!sdk) console.log("skip  the reporting checks after Send: Sentry's SDK couldn't be loaded here");
  else {
    for (let k = 0; k < 50 && !envelopes.length; k++) await sleep(200);
    const error = envelopes.join("\n");
    errors.splice(0, errors.length, ...errors.filter((e) => !/a deliberate check error/.test(e)));
    check(/a deliberate check error, with \[removed\] and \[removed\]/.test(error) && /error-sent-by-visitor/.test(error) && !error.includes(SECRET) && !error.includes(TOLD) && !/"user"/.test(error) && !/ip_address/.test(error) && /"infer_ip":"never"/.test(error) && !/"breadcrumbs":\[\{/.test(error),
      `on Send, the error is reported, its key and story text removed, with no user, IP address or breadcrumbs (${envelopes.length} envelope${envelopes.length === 1 ? "" : "s"}, ${error.length} bytes)`);
    // "Don't ask again": kept, and after it nothing asked or sent
    const sent = envelopes.length;
    await js(`setTimeout(() => { throw new Error("a deliberate check error, the second"); }, 0)`);
    await sleep(800);
    const second = await js(`(() => { const box = document.getElementById("report-ask"); return !!box && !box.hidden && /Ani ran into an error/.test(box.innerText); })()`);
    await js(`document.querySelector('#report-ask [data-report="never"]').click()`);
    await js(`setTimeout(() => { throw new Error("a deliberate check error, the third"); }, 0)`);
    await sleep(1500);
    const never = await js(`({ kept: localStorage.getItem("ani-cinderella:error-reports:v1"), shown: !!document.getElementById("report-ask") && !document.getElementById("report-ask").hidden })`);
    check(second && never.kept === "never" && !never.shown && envelopes.length === sent, `"Don't ask again" is kept in this browser (${never.kept}), and after it an error is neither asked about nor sent`);
    const before = envelopes.length;
    const offer = await js(`(async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const dt = new DataTransfer();
      dt.items.add(new File([sessionStorage.getItem("ani-check-film")], "film.json", { type: "application/json" }));
      document.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
      // (the film opens a moment later, and showing it draws the Save panel again)
      await wait(1500);
      if (document.getElementById("save-panel").hidden) document.getElementById("save").click();
      const panel = document.getElementById("save-panel");
      panel.querySelector("[data-send-story]").click();
      await wait(100);
      const shown = panel.querySelector(".send-box").innerText;
      panel.querySelector("[data-send-no]").click();
      await wait(1500);
      return { shown };
    })()`);
    const declined = envelopes.length === before;
    await js(`(() => { const panel = document.getElementById("save-panel"); panel.querySelector("[data-send-story]").click(); })()`);
    await sleep(100);
    await js(`document.getElementById("save-panel").scrollIntoView({ block: "start" })`);
    await shot("14-send-this-story.png");
    await phone("14b-send-this-story-phone.png", `document.querySelector("#save-panel .send-box")`);
    await js(`document.querySelector("#save-panel [data-send-yes]").click()`);
    for (let k = 0; k < 50 && envelopes.length === before; k++) await sleep(200);
    const story = envelopes.slice(before).join("\n");
    let thanked = "";
    for (let k = 0; k < 50 && !/^Sent\./.test(thanked); k++) { await sleep(200); thanked = await js(`document.querySelector("#save-panel .send-box").innerText`); }
    check(/This is everything that will be sent to Ken/.test(offer.shown) && /"title": "Cinderella"/.test(offer.shown) && /"lisp": ";; -\*-lisp-\*-/.test(offer.shown) && /"extensions": \[/.test(offer.shown) && /"stopped": \[\]/.test(offer.shown) && /"provider": "\(none\)"/.test(offer.shown), "\"Send this story to Ken\" shows exactly what will be sent: the story, the Lisp, the model and provider, the extensions and where Ani stopped");
    check(declined && /A story sent to Ken: Cinderella/.test(story) && /\(define cinderella character/.test(story) && /story\.json/.test(story) && !story.includes(SECRET) && /^Sent\./.test(thanked), `nothing is sent until the visitor confirms; then the story arrives, with its Lisp, and no key (${story.length} bytes)`);
  }
  }
  // (the deliberate error the reporting check throws may be heard after it is set aside)
  const uncaught = errors.filter((e) => !/a deliberate check error/.test(e));
  check(uncaught.length === 0, `no uncaught errors${uncaught.length ? ": " + uncaught.slice(0, 3).join(" | ") : ""}`);
} catch (e) {
  check(false, e.message);
} finally {
  if (ws) ws.close();
  chrome.kill();
  server.close();
  await sleep(500);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
console.log(failures ? `${failures} check(s) failed` : "all checks passed");
process.exit(failures ? 1 : 0);
