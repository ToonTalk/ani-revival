# Chapter X in Ani: implementation plan

*9 October 2026. This plan combines four designs and their adversarial reviews. Wherever a review showed a design was wrong, the corrected version is the one given here.*

The four designs it combines, each with its review:

- [Ani chooses how her characters look, and when their looks change (thesis Chapter X.A.1–A.2), as the switchable REVIVE;APPEAR and REVIVE;LOOKS extensions](design-appearance.md)
- [Characters who change: Ani takes a fresh look, bridges the gap, and remembers who they have become (thesis X.A.3)](design-changing-descriptions.md)
- [Item (4), a bigger and better knowledge base: REVIVE;MEND, REVIVE;SLIPS and REVIVE;KNOW, written in Ani's own Lisp and switchable](design-knowledge-and-repairs.md)
- [Mini-Ani: Ani's society of experts as an Agent Kit example, filmed in Logo](design-mini-ani.md)

## How the work is organized

All new behavior is Lisp inside Ani, written in your idioms, in switchable files under `src/director/revive/`. Ani's own choice points, methods and records do the reasoning, so the existing glass box can explain the results. All four designs rejected a JavaScript layer wrapped around Ani, because the glass box would then explain our code instead of Ani's. The Agent Kit's mini-Ani is a separate teaching miniature and shares no code with the revival.

These are the new REVIVE files. Each name is six characters or fewer, so ITS truncation keeps them distinct:

| File | What it holds | Changes Cinderella? |
|---|---|---|
| WRAP | One shared helper that wraps a Ken function once per job (it saves the original expr and sets a done flag) | No |
| MEND | Repairs for failures that new stories hit | No (byte-identical) |
| KNOW (+ KNOWDS, KNOWRL, KNOWCV, KNOWDI, KNOWEM) | Knowledge you could have added | Pass 2 only |
| APPEAR (Ani's side), LOOKS (Director's side) | Items 1 and 2 | The film |
| CHANGE | Item 3 | No (CINDY has no change task) |
| SLIPS | Corrections of slips in your files | Yes |
| DETAIL | A few of the "myriad details" | Yes |
| SEEN | A part of only changes made seen (added after your testing, 15 October) | Yes (the Meeting's last part) |

The reviewers found two load-time rules by probing:
- **One wrap per job.** `+after-load` hooks fire on every load of their file, and fire at once if the file is already loaded. A second load would wrap the wrapper and recurse, so every wrapper goes through WRAP.
- **Nothing at top level.** A top-level definition under `action`, `display-method` or `director-character` autoloads Ken files that the 1978 job never loads. So every definition sits inside `(+after-load '|ken;<owner> >| ...)`. Every new top-level actor also gets a tags entry (as `load.33` fills them), so `exists?` finds it before its parent file has loaded.

## Stage 0: the shared foundation (1.5 days)

- **`src/pipeline.js`:**
  - Add an `EXTENSIONS` registry. Each entry has `files`, `requires`, `changes1978`, `afterPass1` and `recorder`.
  - `boot(fs, {extensions})` loads the chosen files after the bridge, in registry order.
  - pass 1, pass 2 and filming all receive the same list. With `[]`, boot behaves exactly as it does today.
- **Tools:**
  - `tools/run-pass1.mjs`, `run-pass2.mjs` and `run-scene.mjs` move onto `pipeline.boot` and `pipeline.recorder`, so the copies can't drift apart.
  - `run-pass1` exits non-zero on a CP 29 mismatch.
  - New `tools/check-1978.mjs` (`npm run test:golden`). It is described under "What stays exactly as in 1978" below.
- **The page:**
  - One control beside the frame-rate switch: "Ani as in 1978 / Ani with the revival's extensions".
  - Under it, a closed "Which extensions" panel with two groups: knowledge (KNOW, APPEAR, CHANGE, DETAIL) and repairs (MEND, SLIPS).
  - The setting is kept in localStorage, with every access in try/catch.
  - The stored run object and saved films record `extensions`.
- **`app/film/save.js`:** a film that carries extensions or looks is written as version 2. The reader accepts versions 1 and 2, and version 1 means 1978. The format string `"ani-film"` and `packFilm` stay unchanged.
- **Code links:** `build-source-app` and `codeIndex` list every revive file.

**What you see:** the switch, with nothing behind it yet, and check-1978 passing.

## Item 4, part 1: MEND (repairs that change nothing Cinderella reaches)

MEND comes first because new stories, which are the test bed for every other extension, fail without it.

- **M1, (not X) is narrowed in pass 2, not pass 1.** The review showed that (not X) is a deliberate value in your representation (`elemnt.1:24-26`, `145-146`; thesis L2658-2659), and narrowing it in pass 1 would change later pass-1 reasoning. So pass 1 and the CP file stay as your code makes them.
  - A `+after-load` on KEN;CP narrows each movement element's (not X) to one of the two remaining values with GLOSUG's `pick-value-with-variety` (counts rebuilt from the CP), and leaves a note.
  - With medium variety this relies on `middle-element`, which is a KEN1 reconstruction. The note says so.
- **M2, none means medium.** A none value reads as medium in pass 2, as INTERF already reads an element that was never set (`interf.149:846`). A weightify guard in Director maps none, and any (not X) still left, to medium.
- **M3, unknown words.** A word Ani doesn't know is skipped and named, as `ask-if-exists` already does for an unknown emotion (`sugest.123:38`).
- **M4, missing relationships.** An `exists?` guard goes in `meet-description-of`. Its notes are de-duplicated, because `likes` asks four times.
- **M5, missing display methods.**
  - A suggested display method that doesn't exist is rejected with the reason `no-such-display-method`.
  - CONVEY suggests `move-to` for `meets`, but DISPLY never defines it. MEND defines `move-to` from DISPLY's own parts. Its time estimate includes any walk onto the stage.
- **M6, characters in the scene first.**
  - The friend-of, enemy-of and stranger-of generators first look among everyone named in any of the scene's task descriptions. Scene-participation alone is not enough, because SCENE records it only for each task's subject. If no one in the scene fits, the 1978 pick stands.
  - An off-stage victim of move-to-and-hits, chases-to or pushes-around is brought on with your getting-on-stage step from goes-to-and-accompanys. That walk is counted in the estimate.
- **M7, the combine for change suggestions (new, verified by running it).**
  - The problem: COSUG's combine for two `change:` suggestions on the same element reads the old `'display` key (`cosug.215:449-477`) and calls `shouldnt-happen`. The `change-to:` combine merges into a nil value.
  - The repair reads `(get (get s 'value) 'value)` when that key is absent.
  - Cinderella never reaches this code, but every new feeling or look change that shares an element with joy does.

**Glass box.**
- Each repair memorizes a `(revival-repair: what W was X now Y because R)` item on the choice point, task or subscene where it acted.
- glassBox adds a `repairs` key only when there are notes, so Cinderella's `glass.json` stays identical.
- The page turns each note into a plain sentence with a code link.
- When a run in 1978 mode fails in a known way, the page explains the failure and offers "Make it again with the revival's repairs".

**Tests.**
- `check-1978 --extensions mend` must be byte-identical, including `glass.json`.
- `test/ext.test.js` force-loads each parent file and checks that the revival's wrapper is installed. This is needed because the golden test can't notice a missing repair: Cinderella needs none of them.
- Stress stories cover (not high), an unknown word, meets alone, an off-stage victim, missing relationships, a character with no descriptors, and joy plus a second feeling. With MEND, each finishes in under 600 frames with the expected notes. Without MEND, each fails in its documented way.

## Items 1 and 2: appearances (APPEAR, LOOKS)

The approach follows thesis p. 163: appearance is handled "in much the same way that the typical dynamics of characters is handled".

**Elements and order.**
- The new elements are size, shape-jaggedness, shape-complexity, color-intensity and color-saturation (all three-valued, like speed), plus color-hue. Size, the two shape elements and intensity also get relative elements.
- `(choose-appearances)` runs after pass 1's 102 dynamics choices and uses your `make-choices-until-completed`, so it can't move CP 29.
- Interleaving appearance with dynamics is the style experiment the thesis names as untried (p. 240). It ships as a separate entry, `appear-order`, off by default.

**Where suggestions come from.**
- A `teach-appearance` table of (descriptor, element, value, strength, evidence), sent through your `process suggestions`.
- `dominates` suggests a greater relative size (`relate.22:63`).
- Physical uniqueness suggests `different-from` on the relative appearance elements (p. 94).
- A new dynamics source: shape-jaggedness follows path-jaggedness, and shape-complexity goes opposite to speed. It is labeled as the revival's, with p. 175 as its motivation.
- The flashiness, complexity and obviousness globals are extended to appearance (`glosug.41:39-40`).

**Knowledge corrections from the review.**
- p. 238 is cited only for "strong suggests large", as the thesis's deliberately atypical example.
- "Strong suggests pointed" is dropped. Unfriendly already gets pointed through friendly's opposite.
- "Evil suggests red" is dropped, because it reproduces your red stepmother.
- `tools/check-appear.mjs` flags any entry whose result matches your 1978 look (your legitimacy rule, p. 189).

**Hue.**
- `hue-net` is a child of `normal-value-description`, with its own relative-value-description and its own opposite, relationship and compromise receivers.
- The wheel is an alist on hue-net. It is not stored on the color atoms, which already carry the TV's properties.
- There are six hues on a painter's wheel. Complements are red/green, orange/blue and yellow/purple, and each hue maps to an HSV angle for drawing.
- Hues two steps apart compromise to the hue between them. One step apart, the stronger wins.
- *As built (14 October, stage 5):* `REVIVE;COLORS`. Two hues a step apart are a conflict of type `adjacent-hues`, which CHOOSE resolves as any other, so the stronger wins with its record in the glass box; opposite hues are a `complementary` conflict. Two steps apart is near-enough, and the compromise is COSUG's own rule with "the hue between" for its medium: equally strong, they meet between; otherwise the film's originality decides (low, Cinderella's, takes the stronger). Each hue is drawn at the hue angle of the TV's color of that name. The list of hues is read round Itten's wheel from yellow, not from red: where nothing suggests a hue, the film's variety picks by the list's order, and read from red it gave back Ken's green, red and yellow (decision 4; see `reports/ext/appear/README.md`).
- *Since Ken's decision 11 (14 October):* color-hue has a relative element, `relative-color-hue`, and Ken's uniqueness rule (p. 94) keeps characters apart in hue: his own CSUMRY summaries suggest different-from on every relative element, and the revival adds physical uniqueness for hue, as for the other looks, labeled Ken's rule applied by the revival. `hue-net` reads `(different-from purple)` as "any hue but purple", `(not purple)`, as COSUG's relative-three-values-and-not reads a relative value; a choice left as `(not ...)` is drawn as one of the hues left, picked by the film's variety. The list's order, the revival's, breaks the ties the rule leaves; in Ken's Cinderella it gives the fairy godmother his own 1978 orange, which is reported to him, not tuned away (`reports/ext/appear/README.md`, `reports/ext/appear/hue-options.md`).

**Values.**
- Appearance values never reach weightify. APPEAR has its own tables, with size at .036, .05 and .07 taken from ANINIT.
- (not X) and none take the middle value, with a note. None adds no shape constraint.
- Color brightness has a floor of 0.45 on the black screen, so a "dark" character reads as darker, never invisible.
- *As built (14 October, stage 5):* intensity .45, .65 and .85 (high short of the TV's full 1.0, so that joy can brighten a bright character), saturation .35, .65 and 1.0. Evil's dark colors are Ken's (p. 161, "bad guys wear black"), and so is "color is many and bright is flashier" (`glosug.41:40`); beautiful's, pretty's and shabby's saturations and magical's purple are the revival's.

**Shape experts (p. 164).**
- Polygon, star and blob experts cover the nine cells of jaggedness by complexity. Director draws them all with `draw-poly`.
- Telling characters apart is done by Ani's own machinery: relative `different-from` suggestions on relative-shape-* between characters who would otherwise look alike. So the choice point and the drawn shape always agree.
- When no shape fits, the least-justified constraint is relaxed, and an `overridden-by:` item goes on that choice point. The glass-box sentence is generated from the drawn shape.

**Starting looks.**
- A wrapper on RUN's `save-all` writes `(ask c take look ...)` into each scene program.
- Casts larger than SHAPES' six get a neutral default from `initialize-characters`, which `take look` then overrides.

**Look changes (item 2).**
- They are display methods, `look-change:` and `look-change-to:`, children of change-method. Pass 2 plans them as it plans your dynamics changes.
- Corrections from the review:
  - The program carries a speed, never a number of ticks. Director converts the speed with `:frames-per-second`, as `dichar.103:105-117` does, so 4 fps and 24 fps agree.
  - A change method's estimate does feed the task's running time (`chomet.123:95-129`), so a look change's estimate must equal that of the dynamics change paired with it.
  - Every look change is either paired with a dynamics change in the same task (joy's are) or runs inside the cause's activity (item 3).
- *As built (14 October, stage 5):* `REVIVE;ALTER`. A task's look changes come after its other methods (a wrapper on CHOMET's `reject-bad-value-changes`), so the program is written as Ken's code writes it, with the look change added. They set no value of the next subscene's, since nothing reads a look's current value there. Joy's look change is made by the joy's amount at its speed, for every level of joy, and a sad character dims (the thesis gives it for a very happy one).
- Thesis p. 166 gives three sources, and each is used:
  - Emotion: joy raises color-intensity.
  - Contact: shape pulses are planned inside DISPLY's repeatedly-come-in-contact and move-to-each-other, on the contact their stop condition already detects. They are not Director demons.
  - The script, through item 3.

**Director (LOOKS).**
- It is a DICHAR hook. It also fires in pass 2's job, so it must be harmless there.
- Growth goes through OBJECT's `set your size` each tick, because setting `ani-size` alone redraws nothing (`object.401:141-189`). `how-to-draw` is reset after every morph step.
- Shape morphs use KEN1;INTER on calls that include the orientation, for example `(progn (right 18) (draw-poly 100.0 144))`. The number of moves is capped, with an instant change as the fallback.
  - *As built (14 October, stage 5):* INTER cannot pair a call that begins with a turn with one that begins with a move ("the moves can not be paired"), so the morph is of the plain draw-poly calls and the center-offset turn is in-betweened beside it, through OBJECT's own center-offset; it ends exactly on Ken's. The cap is 400 moves. A change takes the ticks of Ken's change by the same factor at the same speed (shapes and hues one e-fold), and is carried from tick to tick by the character's special dynamics, as Ken's own change is: carried by the character, a look change first among its changes made it tick before its special dynamics and move elsewhere (the tortoise and the hare's Introduction ran 497 frames, not 586).
- Colors are kept as an HSV look-color and never sent to `pencolor`.
- Director's own color filming (`run-scene --color`) is declared unsupported while APPEAR is on.

**Recording.** `recorder(L, {looks: true})` stores `film.looks` as changes only. `frames[].chars` is untouched, and color mode paints from the looks.

**Glass box.**
- A "How she looks" section, collapsed by default, opens with one plain sentence: "Ani made her a small circle: small because she is shy and the stepmother dominates her; ..."
- Each aspect opens the existing choicePointBox, with the evidence quote, followed by the experts' record.
- The section always ends with "In 1978 Ken drew her himself as a green star". It cites `initialize-characters` for the shape and size and `running-color` (`aninit.65:83`) for the green.
- Captions treat look changes as changes and note that color shows only in color mode.
- glassBox exposes the take-look forms so prepScene can read them.
- `pass1.html` gains a Looks group.

**Tests.**
- `test/appear.test.js` (npm test runs only `*.test.js`) checks:
  - each hook fires once;
  - the knowledge table;
  - hue-net's combine, opposite and conflict;
  - the experts: jaggedness high with complexity low gives a triangle, and (not high) still allows the ten-pointed star;
  - telling apart through `different-from`;
  - growth widens the recorded span tick by tick;
  - a square-to-star morph starts with the square drawn twice.
- Pass 1 with APPEAR on keeps the 102 original choices, checked by name.
- Pass 2 runs scene by scene with the 1978 POSIT files mounted. After the look forms are stripped, its programs and MINI files must equal 1978's. Chained runs differ, because Director's collisions use size, so they are compared with goldens in `reports/ext/appear/`.
- Duration guard, at both 4 and 24 fps: Kept Apart's joy subscene ends on the same frame with and without look changes.
- `check-film-app` runs the page end to end.

## Item 3: characters who change (CHANGE)

A change is a scene task in the form of your `cindy.46:94-105`: `(change (TYPE WHO OLD) (TYPE WHO NEW))`, optionally inside `(causes A ...)`.

1. **A fresh look (L4396-4402).**
   - An extra pass-1 job runs for each scene that changes someone. The change is made after DATEST loads CINDY and before `study-descriptor-use`. Making it after `init` was verified to give wrong values.
   - Correction from the review: try your literal "as if the character were brand new" first. Load the story's CP, mark every other character's nodes completed, reset only the changed character's absolute and relative choice points, and run `(z)`.
   - The full recompute is kept only as a comparison in the glass box. Its knock-on changes were verified: when the stepmother repents, the Prince becomes more deliberate; when Cinderella goes from shy to brazen, three speeds and two attractions change.
   - *As built (11 October, stage 3):* loading the CP and resetting her choice points moved every character's own values even with no change at all, because your pass 1 made each choice before some of the others existed. So the fresh look replays your pass 1 in its own order and holds every other choice as it was, at `record-choice`. With no change, it gives CP 29 exactly. See `reports/ext/change/README.md`.
   - A relationship change records both characters.
   - Results go to `KEN1;<scene> BECOME`. The element lists are built with `append`, not `mapcan`: mapcan would splice the attractions into normal-movement-element's offspring list.
2. **Who they have become.** RUN loads the BECOME files of earlier scenes and sets the descriptions and choice points from them. MEND handles any value that pass 2 can't use.
3. **Portraying the change (L4411-4423).**
   - `bridge-to:` is a display method, not a change method, so its time counts toward the subscene and it is stretched with it.
   - It runs as a new Director message that takes a duration in seconds, so the bridge ends when Ani planned.
   - It bridges only the elements Director reads: speed, path-curvature, path-length and path-jaggedness. Acceleration, deliberateness and the attractions are recorded and shown as "chosen again; Director does not use it, as in 1978" (thesis (f), L4853-4856).
   - A task gets one display method (`chomet.123:225-231`), so the cause and the bridge must be a single method:
     - With a cause, it is `goes-to-and-transforms`, modeled on move-to-and-hits. Its estimate is the walk to contact plus the bridge, and `bridge-to:` estimates zero beside it.
     - A change with no cause uses `changes-while-wandering`, which ends with your `(stop-if-either-wants-to (stop-after-so-many-seconds T) ...)`.
   - `wander-around`, which SCENE calls (`scene.9:218`) but no 1978 file defines, gets a plan receiver.
   - The new personality is established from the next scene on. Sequence-aware descriptions are deferred.
   - The rate is gradual by default (p. 169: an abrupt change "could easily be misinterpreted"). A magical cause makes the change instantaneous. That rule is ours and is labeled as such.
   - There is no on-stage fallback. `on-stage` has no demon, and adding one would change 1978's scoring of `meets`.
   - With APPEAR on, `bridge-to:` asks each element's type for its Director form. Shabby to elegant then finally shows something; today it changes none of the 102 choices, as your footnote predicts.
   - *As built (14 October, stage 6):* `REVIVE;CHSHOW`, with additions to `REVIVE;CHANGE`, `ALTER` and `LOOKS` (`reports/ext/change/README.md`, "Showing the change"):
     - `change` and `causes` are actions of CONVEY's. A `causes` of something not a change has no suggestions, as in 1978, so EVIL's and DOMINATES' causes stay as they were; so has a change whose fresh look wasn't made.
     - `bridge-to:` is suggested as a value change (`display-value-change`), so that CHOMET takes every one beside the task's one display method, and is a child of display-method, so that SCENE counts and stretches it. Beside goes-to-and-transforms or changes-while-wandering it estimates no time and runs nothing; they run it, once the change begins. With neither, it runs from the part's start, as your run-change-to runs a change.
     - The change follows the cause's walk in a `sequence:`, as move-to-and-hits' hitting follows its walk. A plan begun `(after (end-of walk) 0.0)` stopped Director when the walk ended at once (the Prince already touching the stepmother): it is told the walk ended before it is run.
     - She wanders while the change is shown, as MEND9's wander-around does, but with walks counted on half a walk across the stage, so that the wander fills its time: one that ended early ended the part, and the beautified scene's joy, which extends it, never ran. With nothing to bridge, or an instantaneous change, the change is shown for one walk of hers across the stage (MEND9's estimate). No plan receiver was added: MEND9's is the one SCENE asks for, and a change task has a way of showing of its own. CHANGE now requires MEND (MEND9's wander, MEND6's bring-on, MEND5's walk to meet).
     - Director's bridge, `(gradually change by F factor for E in N seconds)`, reaches F after the ticks N seconds make at the film's frame rate. Its second repeat skips dynamics that have the factor from the scene's: your two repeats grow such dynamics a step ahead at once, and grow the scene's own twice a tick when she stands (a finding for SLIPS, `test/change.test.js`).
     - With APPEAR, the fresh look runs `(choose-appearances)` after (z) as pass 1 does, everyone else held; the BECOME file has `old-look` and `new-look`; the bridges include each look drawn differently (ALTER answers for appearance-element; LOOKS takes a look change in seconds); later scenes draw her as she has become.
     - Gradual is your slowest speed, ten seconds an e-fold; instantaneous, for a magical cause, the revival's rule, is a tick.
   - *Since the review of stage 6 (14 October):* a change of how she looks alone is timed without stopping (each element of a look goes to appearance-element, which loads ELEMNT); one task of a scene shows a character's changes (`showing-task-of`, the first whose cause goes to her, else the first of hers), with all her bridges once; the cause walks to her regardless of collisions, as your goes-to-to-hit does; Director doesn't stop the film while a part that shows a change is still running (a repair, noted `film-waited-for-change`: a part that extends the change's and ends first stopped it in the middle, finding 7); a shape Director has no in-between for changes at once and takes no time; the wander's walks are counted at her faster speed, with one more walk that stops when the bridges end; she doesn't wander while another way of the part moves her (a chase, a push, one she does); the gradual speed and every element over the largest's time are memorized and said as the revival's rules. `reports/ext/change/README.md`, "The review of stage 6".
4. **The participation wrapper comes first.** The wrapper on `process-task-description` ships in CHANGE's first stage. Without it, a change task that stands alone crashes when CINDY loads (`scene.9:461-465`).

**Glass box.**
- A "How she has changed" section appears in the changing scene and every later one. It has a before-and-after table, and each row's why button opens the fresh-look choice point.
- choicePointBox gains a source argument, so these read "Ani's fresh look after Change of Heart".
- dynamicsTable gets provenance before any BECOME values ship.
- Captions describe the transformation. An empty bridge is explained with your footnote.
- *As built (14 October, stage 6), what the page has to work with:* the changing scene's glass box has `changesShown` (the way of showing it and its task, the rate and why, the cause's walk, the bridges with each element from what to what and Director's form, her wander, the elements chosen again that Director doesn't read, the looks before and after, seconds, ideal and stretch); the film's events give each plan's beginning and end; `film.looks` the color's steps and the shape's morph; the run's record `characters[].looks` and each later glass box's `becomes[].looks`.
- *Since the review of stage 6 (14 October), the page:* a change shown alone says so (it threw); a walk stopped before they touched, a film kept going while a change was shown, a change shown by another task of the scene, and a way of showing with nothing bridged ("the goat goes to the troll", nothing changing on screen) are each said as they happened; "They touch" at the frame the walk ends, the change until Director draws it; the revival's choices said in the glass box.
- *As built (14 October, stage 6, the page):* the captions say how the change is shown and what its showing is doing at the frame (the cause's walk, the touch, her changing as she wanders, at once for a magical cause, her wander after; an empty bridge says why, and, for a change of looks Ani doesn't choose, your footnote); "How she has changed" appears in the changing scene too, with the bridge (what changed, over how long, from which frame, what was chosen again and not bridged, by who reads it) and how she is drawn, and its table includes her look, each row's "why?" opening the fresh look's choice point; "Change the story" offers your cinderella-beautified, made with the extensions (`reports/ext/change/README.md`, "On the page (stage 6)").

**Tests.**
- `test/change.test.js`.
- check-1978 with CHANGE on must be byte-identical, with the same loaded files.
- Fresh-look goldens: evil and mean to good and kind (path-curvature goes from low to high, among others; from low to medium since decision 8); shy to brazen (speed goes from low to medium); shabby to elegant (nothing changes).
- An ordering guard that fails if the change moves after `study-descriptor-use`.
- Bridge timing on path-curvature (factor 4), measured from the contact frame at 4 and 24 fps.
- End to end: `change-of-heart.lisp`, `socializing.lisp`, and your beautified scene uncommented at run time.
- *As built (14 October, stage 6):* `tools/check-change.mjs` (`npm run test:change`, and `test:change24` at 24 frames a second) makes the three end to end, the beautified scene in your whole Cinderella with the page's four extensions, against goldens at 4 and 24 frames a second; the bridge's timing is Change of Heart planned again with the stepmother's path-curvature to become high (her fresh look has medium), so that it changes by 4. `test/change.test.js` has the verbs, the rate, Director's bridge at 4 and 24, your two repeats' double step, and APPEAR's look bridges and looks made so; `test/stories/stress/` has change-alone, change-magical, change-won-over and change-last-scene. *Since the review of stage 6:* eight more (change-looks-alone, change-self-cause, change-to-unknown-word, change-twice-in-a-scene, change-two-effects, change-past-bystander, change-then-joy, change-while-chased); `test/change.test.js` times a change of her look with ELEMNT not loaded and shows one task per character; `check-change` checks that the cause's walk reached her, one bridges' plan per character, and the wander as long as the bridges; `check-film-app` reads three of the eight on the page.
- The page refuses change tasks while the switch is off.

## Item 4, part 2: KNOW, SLIPS and DETAIL

**KNOW** adds knowledge, each piece in the idiom of the file it extends:
- **Words.** Some borrow a neighbor's suggestions: timid, wicked, cruel. Others carry their own: gentle and rough, nervous and calm, cheerful and gloomy, clever, brave and cowardly, curious, playful, old and young.
- **Relationships.** dislikes and fears; establish suggestions for likes; is-obedient-to establishes `follows`; is-helpful-towards establishes `helps`.
- **Ways of showing.** helps-along, moves-away-from and follows-behind, with time estimates and MEND's bring-on step.
- **Feelings.** Pride, anticipation, loneliness, fear and anger. They depend on MEND's M7.
- **Neighbor sharing.** A word with no establish suggestions of its own borrows its neighbor's, at the same strength (your comment at `dscrp.17:183`).
- **Left out.** `kills` stays out because Ani has no notion of a character leaving for good, not to steer the story.

The contract, corrected:
- Cinderella's pass 1 stays CP 29. A rule check enforces this over the live neighbor and opposite links, because `char.2` spreads each link to further words.
- Pass 2 changes, and the plan names the predicted differences:
  - Introduction: Cinderella helps the Prince, which was canceled in 1978 (L1858). She follows the stepmother, where Ani had "no idea how" (L1856). The Prince is brought on.
  - Kept Apart: pride slows the stepmother.
- These go to `reports/ext/know/` with a README that explains each difference.
- In the glass box, a suggestion that comes from the revival's knowledge gets a badge with its file and line and its `;;why:` comment.

**SLIPS** requires KNOW. S1 without KNOW's helps receiver would make Cinderella lose her accompanying of the Prince, with nothing in its place.
- S1: is-not compares the scene, not the task.
- S2: is-described-as becomes a preference: all of the descriptors, then any of them, then anyone.
- S3: friendly's `attraction-to-*` are renamed `attraction-towards-*`.
- S4: is-protective-of becomes a neighbor of is-protective-to.
- S6: `'prerequisite` vs `'prerequisites` (`chomet.123:559`).
- S7: MIDDLE's `(not low)` vs `(not bottom)` (`elemnt.1:171`).
- The speed inversion between DICHAR and DISPLY, if a run confirms it. It would change Introduction, Kept Apart, Meeting and Justice.

Each correction comes with a written Cinderella diff. The parenthesis slips in good, selfish, alone and aware, and CINDY's physical `strong`, are documented but not changed. (`relate.22:79`, listed in the design, is not a slip.)

**DETAIL**, the last stage:
- Deliberateness shapes paths in Director's walk.
- The attractions feed best-when scores.
- Scene rhythm suggests speed changes.

Director's walk has no actor of its own, so the subscene memorizes what DETAIL did, for the glass box.

*As built (15 October, stage 7), SLIPS:* `REVIVE;SLIPS` and SLIPS1, 2, 3, 6, 7, 8 and 9 (`reports/ext/slips/README.md`, with each correction's line and written diff). Opt-in (`optIn`, group repairs), requiring KNOW. Each correction can be turned off on its own (`:slips-off`), so each has a diff of its own, beside KNOW's Cinderella (`tools/check-slips.mjs --each`, `each.json`).
- S1 and S2 as designed, with what S1 newly reaches: friendly's bind inside a bind is bound in turn, and is-desired-by, which no file defines, comes up with no value (`no-such-generator`). In the Introduction Cinderella helps her stepmother, who is neither weak nor good ("anyone"): your find-related-suggestions takes good's helping the stepmother and friendly's helping the Prince as identical, and the first is the convey task.
- S3: Cinderella's three tendency choices are CP 29's; their choice points hear friendly now, and lose to shy as before. CP 30 is CP 29 byte for byte with SLIPS.
- S4 is KNOW's (decision 10); S5 documented. S6 and S7 change nothing in Cinderella.
- New: S8, Director multiplies a character's dynamics by their parent's factors once, not again each time the same dynamics are set (`dichar.103:27-31`: in 1978 Kept Apart's guard slows cycle by cycle, Cinderella's walk 0.34, 0.24, 0.17, 0.12); S9, **the speed inversion, which the run confirmed** (`tools/check-slips.mjs --speed`: all 20 changes at high speed take 3.95 to 4.04 times DISPLY's estimate, all 11 at low 0.21 to 0.25, the 4 at medium 0.9); S10, stage 6's finding 1, a change grows a factor once a tick; S11, a change takes as many steps as it counts (SOME's repeat does one fewer, `some.666:444-450`, so in 1978 the Introduction's joys did nothing); S12, a high level of variety picks the least used value and a low the most used, as the thesis says (`glosug.41:61-70`, L2384-2387).
- Left alone, for Ken: CHOMET's redistribution of a scene's time (`more-time-needed:` against `need-more-time:`, `chomet.123:193, 413`, and its signs, `61-64, 167-180`), and the special dynamics a change carries forth, found once and kept (`dichar.103:22-26`).
- Cinderella with SLIPS, chained: 230, 115, 19, 180 and 85 frames (KNOW's 225, 116, 17, 179, 84), and at 24 frames a second 1379, 712, 109, 878 and 442. Goldens in `reports/ext/slips/` (`tools/check-ext.mjs --extensions slips`).
- *Since the review of stage 7 (15 October):* S8 counts a change once (a walk grown by a change its parent carries too took it twice when set again: Justice's stepmother 0.67, then 0.45); **S13**, a change carried forth into the walks of its part and of the part it extends (`REVIVE;SLIP13`; your comment, `dichar.103:112-115`, and the thesis's Kept Apart, p. 66): Kept Apart's feelings now show on the guard's walks; **S14**, the film not stopped while the activity a part of changes extends still runs (`REVIVE;SLIP14`; `action.152:67-91`), in SLIPS rather than SEEN. Cinderella with SLIPS: 230, 107, 17, 175 and 84 frames, and at 24 frames a second 1379, 702, 106, 887 and 433. MEND20 repairs a character shown off the stage past a corner (`dichar.103:41-49`, ymax without its comma). `reports/ext/slips/README.md`.

*As built (15 October, stage 7), DETAIL:* `REVIVE;DETAIL`, DTWALK, DTTEND and DTRHYM (`reports/ext/detail/README.md`). Opt-in (group knowledge), requiring MEND, each detail turnable off (`:detail-off`), each the revival's reading of the thesis's sentence (X.B.3 (f) and (c), pp. 185-186; B.2 (a), p. 184).
- Deliberateness: a character d times as deliberate goes in arcs d times as long and jags 1/d as far in Director's walk (go-in-arc); medium changes nothing. With CHANGE, a change bridges deliberateness too.
- The tendencies: a prerequisite `drawn-to`, read from the tendency towards what the other is (friend, enemy or stranger, by the generators' own tests), is the best-when clause of the ways of showing that take one character to another (or away). In Cinderella it decides nothing; the tendencies on the convey methods too, an option off by default, would have the stepmother avoid Cinderella instead of pushing her around (mean's strong avoidance of enemies): a decision for Ken.
- Rhythm: fast and slow are a change: of a quarter at medium speed in each subscene, (changes A B) A's in the first and B's in the last, picking-up (changes normal fast), for each character who acts or changes there.
- Found: DETAIL's rhythm alone compounds through Ken's slip S8 in the Meeting's turning (with SLIPS too, it doesn't).
- Cinderella with DETAIL, chained: 189, 116, 16, 169 and 87 frames (1978's 192, 116, 17, 179, 84), and at 24 frames a second 910, 705, 88, 647 and 486. Goldens in `reports/ext/detail/` (`tools/check-ext.mjs --extensions detail`, `tools/check-detail.mjs`).

*The glass box (stage 7):* every correction and detail notes where it acted through REVIVE;WRAP's `revival-note` (kinds in each README's "The glass box"); Director's corrections and the walk on Director's subscene, so the film's `repairs` has them. *Tests:* `test/slips.test.js`, `test/detail.test.js`; `tools/check-stress.mjs` has a mode with all six extensions (`with-all`) and four new stories (`slips-good-helps`, `slips-variety`, `detail-rhythm`, `detail-tendency`). The page is the next agent's: each README's "For the page (stage 7)".

*On the page (stage 7, 15 October):* the switch as it was; under it "Which extensions" with the registry's two groups, knowledge (KNOW, APPEAR, CHANGE, DETAIL) and repairs (MEND, SLIPS), each with a tick, SLIPS and DETAIL opt-in and unticked; ticking one ticks what it requires, so ticked in 1978 mode SLIPS and DETAIL each make Ken's Cinderella as its README has it (230, 115, 19, 180, 85; 189, 116, 16, 169, 87), every correction and detail said where it acted (compare panel, captions, glass box), with Ken's lines linked. Found: Chrome's Math differs from Node's in last bits, which changed SLIPS' Introduction in the page; `src/maclisp/libm.js` (fdlibm, bit for bit Node's) makes the film the same in every browser. Each README's "On the page (stage 7)"; PLAN.md.

## Item 5: a mini-Ani in the Agent Kit

The mini-Ani is an example under "＋ New society", not a tenth microworld. It is a society of program agents:
- Cast;
- Personality and Looks, two instances of one ani-expert type;
- Relationships and Taste;
- Choice Points;
- Method Chooser, Director and Renderer.

The knowledge is transcribed into editable slots.

**The kit feature (1.13.0): films.**
- `WAIT n` keeps a frame. n is in 60ths of a second, so `WAIT 15` gives 4 frames a second.
- The turtle returns `film`, capped at 240 frames and 100,000 ops. A closing frame is kept if drawing follows the last WAIT.
- A film player on the stage plays it.
- At slow and normal speed, the engine waits for whichever is longer, the delay or the film, before the next delivery. At fast speed, films queue.
- The exported trace page shows a film's first, middle and last frames.

**Corrections from the review.**
- **Two passes, as in Ani.**
  - Round 1 chooses everyone's 12 values once, over the whole cast.
  - Later scenes reuse those values and recompute only a character whose words changed, with variety counts frozen.
  - Otherwise looks drift with whoever happens to be on stage.
- **Variety** follows `glosug.41:61-72`: medium variety picks the middle-most value, not the least used.
- **`settle()`:**
  - A comparison that rules out every value keeps its own direction and reports a self-conflict.
  - Meeting in the middle happens only when the middle isn't ruled out.
  - "brings" weighs as much as the character's own word.
- **Shapes.** The shape table has two empty cells. Cinderella (smooth, medium) lands in one, so she becomes the relaxation scenario.
- **Robustness.** A Renderer → Cast rule "when data pass = false" lets a failed Logo program report itself instead of stopping the story.
- **Choice Points.**
  - They wait for up to 20 messages, so a new expert can't split a scene.
  - The full reasons go in nested data.
  - An "explain {name}" slot is separate from the film's focus, which lives in Taste. So asking why about a character no longer changes the film.
- **The 1978 variant** is inferred from the data (`looksFrom`). When no Looks expert spoke, the Director uses your shapes and colors from 1978.
- **Knowledge and words.**
  - The knowledge fits the 60-character slots (selfish=mean, pretty=beautiful).
  - Only words no expert knew are reported.
  - Logo procedures are prefixed (`TO C_CINDERELLA`), so a character's name can't clash with a Logo primitive.
- **Citations corrected.** kind's tendencies already counted in 1978. dominates also suggests livelier. "Best when bigger" belongs to chases-off. bold, looms over, likes and dislikes are labeled new.
- **Fidelity fixture.** The CP 29 fidelity data is copied into the kit as `tests/fixtures/cp29-cinderella.json`. The test asserts only a recorded floor.
- **AI agents.** The AI Animator, You, Reader and Narrator move to a second example, "Mini-Ani with AI voices", in 1.15.0. The default example therefore needs no model, and the change that asks for a model only when one can be reached becomes optional. In that example, the Reader's rule is on by default.

**Glass box.** The Choice Points say why each value won, the Method Chooser says what it crossed out and why, and each film's Logo can be edited in the trace.

**Tests.**
- library.test, with 31 types.
- miniani.test:
  - the default story runs to "The end." with no model;
  - runs are deterministic apart from the seed and timing fields;
  - "Cinderella is small and slow because she is shy" is in the default trace;
  - the trace size is measured and no data key is dropped.
- The Swedish copy and the artifact limits (950 KB per page, 800 KB per script).
- The revival is checked untouched with a SHA-256 manifest of `ani-revival`, taken before and after (it isn't a git repository), plus `run-pass1` for CP 29.

## Stages

| Stage | Work | What you see | Effort |
|---|---|---|---|
| 0 | Registry, switch, check-1978, WRAP, provenance | The switch; golden passes | 1.5 d |
| 1 | MEND, M1–M7, stress stories | PLAN's failing stories finish, with repair notes | 3 d |
| 2 | APPEAR: size, then shapes, experts, take look, recorder | Ani's own shapes and sizes in Cinderella; "How she looks" | 6.5 d |
| 3 | CHANGE: participation, fresh look (clamped), BECOME | A repentant stepmother moves differently from the next scene on | 3 d |
| 4 | KNOW: words, relationships, ways of showing, feelings | The Introduction with helping and following; pride in Kept Apart | 5 d |
| 5 | APPEAR: color, hue-net, look changes, morphs | Color mode with Ani's colors; joy brightens; shapes in-between | 5.5 d |
| 6 | CHANGE: bridges, goes-to-and-transforms, the APPEAR link | Your cinderella-beautified scene plays | 4 d |
| 7 | SLIPS, DETAIL | A written Cinderella diff for each | 3.5 d |
| K1–K3 | Kit 1.13.0 films; 1.14.0 mini-Ani; 1.15.0 AI voices | A playable film; the example; the AI version | 1 + 3–4 + 1–2 sessions, alongside any stage |

That comes to about 32 working days for the revival. A new PLAN.md entry, Phase 9 ("Chapter X as switchable extensions"), records the findings and the status of each stage.

## What stays exactly as in 1978, and how it is checked

- Nothing under `original/` or `Documents/MIT-AI-Lab` is touched. Every extension is in its own file.
- "Ani as in 1978" loads only the bridge, as today.
- `tools/check-1978.mjs` asserts:
  - CP 29, 102/102, every choice in place;
  - the five KEN programs byte-equal to `reports/pass2`;
  - every scene's frames and events equal to `reports/film` at 4 fps (192, 116, 17, 179 and 84 frames), and optionally at 24 fps;
  - the same set of loaded files.
- It runs in every stage:
  - with no extensions;
  - with MEND alone (including `glass.json`);
  - with CHANGE alone, on CINDY 46, byte-identical.
- With KNOW or APPEAR on, pass 1 must still be CP 29.
- Extensions that do change Cinderella (KNOW's pass 2, APPEAR's film, SLIPS) are compared with goldens in `reports/ext/<set>/`. Each difference is explained in `reports/ext/README.md`.
- `build-ani-bundle` also runs with all extensions on. It rewrites `app/data`, which is expected.
- The shipped 1978 data, `frames[].chars`, and the LLM prompt with extensions off stay byte-identical.

## Decisions (Ken, 9 October)

1. **After a change, Ani rederives only the changed character**, with everyone else held as they were ("as if the character were brand new"). The full recompute is shown in the glass box as a comparison, with its knock-on changes.
2. **SLIPS is offered as its own switch, off by default.** Each correction quotes the line it corrects and comes with a written Cinderella diff; the DICHAR/DISPLY speed inversion goes in only if a run confirms it.
3. **The site opens in 1978 mode.** The switch turns on MEND, KNOW, APPEAR and CHANGE; SLIPS and DETAIL are opt-in.
4. **The revival may add knowledge the thesis doesn't state**, labeled "the revival's" with its reason and checked against Ken's legitimacy rule; any entry that reproduces his 1978 looks is dropped.
5. **The mini-Ani is built now, as a test of how expressive the Agent Kit is and which tasks fit it.** Ken has no plans to use it with children; a workshop (perhaps at Chipping Norton Library) may come later, and grandchildren first. So films, the programs-only example and the AI voices can all go ahead, with a short write-up of what the kit expressed easily, what needed new features, and what it can't do.

## Decisions (Ken, 11 October)

6. **"Strong suggests large" is Ken's knowledge, from thesis p. 238.** There an improved Ani might give a very pleasant friendly character a large pointed shape, "chosen because the character is supposed to be a strong friendly ally". REVIVE;APSUG keeps the entry as Ken's (thesis 238), with that passage as its evidence, noting that the thesis gives it for a strong friendly ally. Decision 4 drops only the revival's own entries that give back his 1978 looks; his own knowledge may agree with them, as this does for the stepmother's large size. (The review of 10 October had relabeled it the revival's generalization and so dropped it.)
7. **In color mode, a film with Ani's own looks keeps each character's 1978 color** (`running-color`, `aninit.65:83-87`), and a new character gets the color of the shape it would have had as in 1978, until stage 5 has Ani choose colors. The film page already does this.
8. **In the fresh look after a change, the new words are the character's initial description**, "as if the character were brand new" (p. 168). So Ken's SUMCOM counts them when it compares her with the others; it counts only initial descriptions. The repentant stepmother's path-curvature then comes out medium, not high as the plan's first golden had it. Where each new word came from is kept with the change, not in the description.

- **A scene is filmed for up to 250 seconds**, the 1,000 frames of Ken's own runs at 4 frames a second, rather than 150, so a slow scene that ends on its own (his tortoise's Pushed Around, 799 frames) is filmed to its end. Found on the way, for SLIPS: Director multiplies a character's special-dynamics factors again each time the same dynamics are set (dichar.103:27-31), so a stretched push-around slows by a quarter each cycle.

## Decisions (Ken, 13 October)

9. **Pride doesn't change speed.** As first written, KNOW's pride slowed a character, and in Kept Apart the stepmother's pride (cindy.46:72) met her joy's speeding up: the two changes have different signs, and Ken's CHOMET makes neither, rejecting conflicting changes as a stopgap ("hopefully all conflicting ones are so noted for now rather than resolving them I'll reject", chomet.123:464), where pass 1's heuristics would have picked the stronger (AI-TR-540 pp. 108-109). So pride only cancelled her joy. Now pride makes a character's paths smoother and its movements more deliberate, and leaves its speed alone.
10. **Ways of showing for three more of Ken's relationships, and is-protective-of as a neighbor.** is-protective-to and is-grateful-to are shown by accompanying, weakly; is-intolerant-of by avoiding, as dislikes is, best when the one avoiding doesn't dominate. is-polite-to, is-impolite-to and is-tolerant-of get none: Ani could show them only by gestures she doesn't have, and nothing else would be the "obvious information that was lacking" of p. 189. CINDY's is-protective-of, which RELATE doesn't know, becomes a neighbor of is-protective-to (SLIPS' S4 idea, as KNOW knowledge), so that it borrows its way of showing. Cinderella's pass 1 stays CP 29, and is-tolerant-of, her word for her stepmother, is unchanged.

## Decisions (Ken, 14 October)

11. **"Go with the uniqueness rule for hues."** After the review of stage 5 found that three of Cinderella's four hues were decided by the order of the revival's list of hues, with nothing in Ani's knowledge behind them, Ken chose, of the sources of hues put to him, his own uniqueness summary: "the finding that a character is unique suggests that that character move (or appear) differently from the others" (AI-TR-540 p. 94). So color-hue has a relative element, as size, the shape elements and brightness have, and a character is drawn in a hue none of the others it is to differ from has. The rule is his; applying it to a hue is the revival's, and is labeled so. Where the rule leaves a choice, the film's variety still takes the hues in the revival's order (Itten's wheel read from yellow), which is labeled the revival's with its reason. Decision 4 still holds: a hue of his 1978 that comes back is said, not tuned away (in his Cinderella, the fairy godmother's orange). The two alternatives he passed over: the relationships (enemies in complementary hues), and leaving a hue no word suggests grey, with a sentence saying so.

## Questions for Ken (stage 7, 15 October)

1. **SLIPS' list.** S1 (with S2), S3, S6 to S12 corrected; S4 and S5 left. The speed inversion is in, the run confirming it (`reports/ext/slips/speed.json`).
2. **CHOMET's redistribution of a scene's time**: correct the reason's name (`chomet.123:193`) and the two signs (`61-64, 167-180`), or leave them? Recommended: leave them, as now, until a story needs it.
3. **Cinderella helps her stepmother** with SLIPS: good's helping, finding anyone, displaces friendly's helping the Prince, the two being identical to your relating. Recommended: as your code, corrected, makes it.
4. **Decision 12 again**: with feelings at their planned speed, a feeling's part that extends an activity and ends first stopped more stories in the middle (a chase and then sadness: 13 frames with SLIPS, 49 without; Jack's pursuit 11, 109 with KNOW). *Since the review of stage 7:* SLIPS' S14 keeps the film going while the activity a part of changes extends still runs, as CHSHOW's wait does for a change. Recommended: in SLIPS, as now; say if it should be in SEEN, and so with the page's four (your Kept Apart with KNOW would then run the guard to its end).
5. **The tendencies on the convey methods too?** Run so, your stepmother avoids Cinderella instead of pushing her around. Recommended: off, as now.
6. **Should DETAIL require SLIPS?** Alone its rhythm compounds through your slip S8. Recommended: no.
7. **The rhythm's amount and scenes**, a quarter at medium speed, are the revival's; should the film's level of rhythm scale it?
8. **S13, the change carried forth** (since the review of stage 7): your change grows the dynamics of its own part, which the walks of the activity a feeling's part extends don't descend from, and your demon reaches only a walk's parent; S13 grows the dynamics the walks take each factor from, and Kept Apart shows the thesis's feelings on the guard. Recommended: as now; say if you would rather the feelings show only where your code had them reach.
9. **The rhythm beside a feeling** (DETAIL): the rhythm's slowing and the stepmother's joy, both changes of her speed in Kept Apart's last part, run together and cancel; your CHOMET's rule against conflicting changes is among one task's suggestions and never sees the rhythm's. Compose them (now), have the rhythm give way to a feeling (recommended), or drop both?
10. **A stretched walk takes its stretch twice** (found): your multiply-dynamics-by-factor puts the parent's speed factor into a walk's own (`place.45:455-460`), and the demon multiplies it in again the first time it is set; the guard's walks move at 0.71 squared of their planned speed. Correct it in SLIPS (it would change every stretched or repeated activity of yours), or leave it?
11. **EXPT, the same in every engine** : Node's `Math.pow` is neither fdlibm's nor correctly rounded, so EXPT now uses `libm.js`'s correctly rounded pow (BigInt), the same in every engine, which agrees with Node's on every pow the checks ask for. Recommended: as now.

## Ken's testing (15 October)

Ken tested the live film page with the four extensions on his Cinderella and his cinderella-beautified scene put back (the page's preset), and found two things; a third is for the page's next round.

- **Cinderella off the picture: not a bug.** Her last walk of the transformation ends at Director's (-339.37, 195.05), which is not in the picture's dots: the recorder's segments (the picture's own dots, `recorder`) draw her there near the picture's top left, her center between 135.6 and 281.2 across and 125.2 and 260.2 down of 551 by 413 throughout the scene (at 24 frames a second, 146.6 to 288.8 and 137.6 to 272.7); every character of the scene stays on the picture. Ken's screenshot had scrolled off the top of the picture. No walk changed. A check that no walk the revival plans ends with a character off the picture, by those segments (`src/pipeline.js` `walksOffThePicture`), runs in `tools/check-still.mjs` over every golden, in `tools/check-change.mjs` over its three stories and in `tools/check-ext.mjs` over each chained film.
- **Still stretches, and SEEN.** In the beautified scene's last part, the two joys (frames 81 to 135 at 4 frames a second, 486 to 818 at 24), no one moved from frame 91 (527) to the end: a part of only changes extends the transformation, as your SCENE extends an activity for a feeling (scene.9:216-240), Cinderella's wander of the transformation ends at frame 89, the fairy godmother has stood by since frame 4, and Director takes four times Ani's estimate over a change at high speed. Ken approved the repair: where a feeling's part leaves its characters with nothing to do, they wander, "so that the changes are apparent" (pp. 125-126, the reason SCENE gives for wander-around), applied beyond the start of a scene. Since Ken's own Cinderella reaches such a stretch (the Meeting's last part, the two joys, at 24 frames a second, frames 900 to 1,049 as in 1978), it is not in MEND: it is **SEEN** (`REVIVE;SEEN`, `reports/ext/seen/README.md`), a new extension, a repair (group repairs), requiring MEND, not opt-in, to be turned on by the page's switch beside the four. MEND alone and Ani as in 1978 are byte for byte as before (check-1978), and so is CHANGE alone.
- **Why they act as they do.** `src/pipeline.js` `whyTheyAct(glass, film)` gathers, for each activity, what the page needs to say why it lasts as long as it does, and for each still stretch why no one moves; `reports/ext/change/README.md`, "For the page: why they act as they do".
- *As built:* SEEN's two plans for each such character, waiting-to-wander and wandering-while-changes-run, are run from the part's initial actions, not among its movements, so that the part ends when its changes do and your Director's stopping of a film as a feeling's part ends (stage 6's finding 7) comes at the tick it did; Director reads what moves her from the plans it runs; she walks as MEND9's wander walks, each walk with dynamics of its own; the film waits for a wander while her changes run. Your Cinderella with SEEN alone: the Introduction, Kept Apart and No Longer Kept Apart frame for frame as in 1978, the Meeting with the two wandering after they meet (204 frames at 4 a second, 179 in 1978; 1,051 at 24, as in 1978), Justice from where the Meeting now leaves them (148, 84; 970, 458). With the page's set and SEEN: 222, 116, 19, 200 and 128 frames at 4 a second (the four's 222, 116, 19, 175 and 92).
- *On the page* (15 October, the "Ken's testing on the page" commits): the switch turns on SEEN with the four (MEND, KNOW, APPEAR, CHANGE and SEEN); the film opens in color, a visitor's choice of TV kept; the character panel says why she does this, this way and for this long (Ken's scene's length, the task's share, Ani's estimate, the part's stretch, the step's stops and frames), what keeps a part going while she stands by, and where no one moves, why (your Director's repeats unwinding said as yours, as recommended); each scene's parts and steps are listed, each opening its explanation; "Cinderella beautified" is a toggle; the status line says the frame each filming has reached, that Chrome paused the tab (the time not counted), and, after minutes with nothing from Ani, offers Stop; any other set of ticks is "some of the revival's extensions (MEND, KNOW and SLIPS)"; the claude.ai copy needs no eval. Measured in headless Chrome with the page's set: your Cinderella in 2:24 at 4 frames a second and the beautified preset in 4:45; at 24, 13:44 and 26:33, on a machine busy with other work. The earlier Chrome test's 16 to 20 minutes (a shy Prince with the beautified scene, at 4 frames a second) were on a machine as busy: Node took 25 minutes over the same story then.
- *Questions for Ken* (`reports/ext/seen/README.md`): SEEN switched on with the four, or opt-in; Cinderella and the Prince wandering apart after they meet (they could wander together); a feeling that outlasts an activity of the same part (Kind Again, 1.25 seconds still); your Director's repeats unwinding a tick a run (2.5 seconds still after the ten hits at 4 frames a second), to be said on the page or corrected in SLIPS.

## The questions as they were put


1. **After a change, should Ani's fresh look rederive only the changed character, with everyone else held as they were, or recompute the whole cast?** Recommended: hold the others fixed, as your "as if the character were brand new" suggests, and show the full recompute's knock-on changes in the glass box as a comparison.
2. **Should SLIPS be offered at all, given that it changes your Cinderella?** Recommended: yes, as a separate switch that is off by default. Each correction quotes the line it corrects and comes with a written diff. The DICHAR/DISPLY speed inversion is included only if a run confirms it.
3. **Which extensions should the switch turn on, and which mode should the site open in?** Recommended: the site opens in 1978 mode. The switch turns on MEND, KNOW, APPEAR and CHANGE; SLIPS and DETAIL are opt-in.
4. **May the revival add knowledge that the thesis doesn't state, such as "shy suggests small" or "magical suggests purple"?** Recommended: yes, labeled "the revival's" with its reason, and reviewed against your legitimacy rule. Any entry that reproduces your 1978 looks is dropped.
5. **When should the mini-Ani ship, given HANDOFF's plan to pilot with children first?** Recommended: ship films (1.13.0) and the programs-only example (1.14.0) now, since examples leave the microworlds the pilot uses untouched. Hold the AI-voices example until after the pilot. Keep Ani's words "mean" and "evil", and offer "grumpy" as a same-meaning word.