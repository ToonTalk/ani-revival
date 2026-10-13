// A story's scenes and characters named as something Ani's files define are renamed
// before Ani reads the story (src/pipeline.js storyWithoutClashes, which makeFilmSteps
// and tools/run-story.mjs use, and the film page's tidy step): when the file loads, its
// definition would replace the story's (a scene called friends, PREREQ's; with KNOW, a
// scene called fear, EMOTE's).
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { aniNames, storyRenames, renameStoryNames, storyWithoutClashes, storyOutline } from "../src/pipeline.js";

const fs = makeProjectFileSystem();

test("the names taken: Ken's tags, the actors there at boot, the words DSCRP and RELATE make, and the extensions' own; not CINDY's", () => {
  const ken = aniNames(fs, { extensions: [] });
  const know = aniNames(fs, { extensions: ["know"] });
  for (const w of ["alone", "friends", "screen", "kind", "brazen", "unfriendly", "something"]) assert.ok(ken.has(w) && know.has(w), w);
  for (const w of ["fear", "pride", "gentle", "timid", "helps-along", "follows", "dislikes", "is-protective-of"]) assert.ok(!ken.has(w) && know.has(w), w);
  for (const w of ["cinderella", "step-mother", "prince", "introduction", "kept-apart", "goat", "troll"]) assert.ok(!know.has(w), w);
});

test("a clashing scene and character are renamed where the story names them, and nowhere else", () => {
  const text = `;; cast: alone = the alone one (she); goat = the goat (she)
;; scenes: fear = Fear; screen = The Screen
(define alone character (process initial description (personality (and kind alone))))
(define goat character (process initial description (personality shy)))
(define (relationship-of alone goat) relationship (process initial description loves))
(define fear scene (process initial description (and (establish (emotional-state alone (fear high))) (convey (alone alone goat)) (convey (change (personality alone (and alone kind)) (personality alone shy))))) (set your rhythm to alone))
(define screen scene (process initial description (convey (undoes goat (from-scene fear (convey (chases alone goat)))))))
(define the-films-focus focus (set your order-of-character+element-type+element to (characters element-types elements)) (set your parts-of-the-focus to (alone fear screen (relationship-of alone goat))))
`;
  const renames = storyRenames(storyOutline(text), aniNames(fs, { extensions: ["mend", "know"] }));
  assert.deepEqual(renames, [
    { kind: "scene", from: "fear", to: "fear-scene" },
    { kind: "scene", from: "screen", to: "screen-scene" },
    { kind: "character", from: "alone", to: "alone-character" },
  ]);
  assert.equal(renameStoryNames(text, renames), `;; cast: alone-character = the alone one (she); goat = the goat (she)
;; scenes: fear-scene = Fear; screen-scene = The Screen
(define alone-character character (process initial description (personality (and kind alone))))
(define goat character (process initial description (personality shy)))
(define (relationship-of alone-character goat) relationship (process initial description loves))
(define fear-scene scene (process initial description (and (establish (emotional-state alone-character (fear high))) (convey (alone alone-character goat)) (convey (change (personality alone-character (and alone kind)) (personality alone-character shy))))) (set your rhythm to alone))
(define screen-scene scene (process initial description (convey (undoes goat (from-scene fear-scene (convey (chases alone-character goat)))))))
(define the-films-focus focus (set your order-of-character+element-type+element to (characters element-types elements)) (set your parts-of-the-focus to (alone-character fear-scene screen-scene (relationship-of alone-character goat))))
`);
  // the renamed story outlines as the renames say
  const outline = storyOutline(renameStoryNames(text, renames));
  assert.deepEqual(outline.scenes, ["fear-scene", "screen-scene"]);
  assert.deepEqual(outline.characters, ["alone-character", "goat"]);
});

test("a story with no clash, or as in 1978 a scene called fear, is left as it is", () => {
  const text = `;; scenes: fear = Fear
(define goat character (process initial description (personality shy)))
(define fear scene (process initial description (establish (emotional-state goat (joy (negative high))))))
`;
  assert.deepEqual(storyWithoutClashes(fs, text, { extensions: [] }), { text, renames: [] });
  const withKnow = storyWithoutClashes(fs, text, { extensions: ["mend", "appear", "change", "know"] });
  assert.deepEqual(withKnow.renames, [{ kind: "scene", from: "fear", to: "fear-scene" }]);
  assert.match(withKnow.text, /^;; scenes: fear-scene = Fear\n/);
});
