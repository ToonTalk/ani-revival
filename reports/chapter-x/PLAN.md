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

**Values.**
- Appearance values never reach weightify. APPEAR has its own tables, with size at .036, .05 and .07 taken from ANINIT.
- (not X) and none take the middle value, with a note. None adds no shape constraint.
- Color brightness has a floor of 0.45 on the black screen, so a "dark" character reads as darker, never invisible.

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
- Thesis p. 166 gives three sources, and each is used:
  - Emotion: joy raises color-intensity.
  - Contact: shape pulses are planned inside DISPLY's repeatedly-come-in-contact and move-to-each-other, on the contact their stop condition already detects. They are not Director demons.
  - The script, through item 3.

**Director (LOOKS).**
- It is a DICHAR hook. It also fires in pass 2's job, so it must be harmless there.
- Growth goes through OBJECT's `set your size` each tick, because setting `ani-size` alone redraws nothing (`object.401:141-189`). `how-to-draw` is reset after every morph step.
- Shape morphs use KEN1;INTER on calls that include the orientation, for example `(progn (right 18) (draw-poly 100.0 144))`. The number of moves is capped, with an instant change as the fallback.
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
4. **The participation wrapper comes first.** The wrapper on `process-task-description` ships in CHANGE's first stage. Without it, a change task that stands alone crashes when CINDY loads (`scene.9:461-465`).

**Glass box.**
- A "How she has changed" section appears in the changing scene and every later one. It has a before-and-after table, and each row's why button opens the fresh-look choice point.
- choicePointBox gains a source argument, so these read "Ani's fresh look after Change of Heart".
- dynamicsTable gets provenance before any BECOME values ship.
- Captions describe the transformation. An empty bridge is explained with your footnote.

**Tests.**
- `test/change.test.js`.
- check-1978 with CHANGE on must be byte-identical, with the same loaded files.
- Fresh-look goldens: evil and mean to good and kind (path-curvature goes from low to high, among others; from low to medium since decision 8); shy to brazen (speed goes from low to medium); shabby to elegant (nothing changes).
- An ordering guard that fails if the change moves after `study-descriptor-use`.
- Bridge timing on path-curvature (factor 4), measured from the contact frame at 4 and 24 fps.
- End to end: `change-of-heart.lisp`, `socializing.lisp`, and your beautified scene uncommented at run time.
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

## The questions as they were put


1. **After a change, should Ani's fresh look rederive only the changed character, with everyone else held as they were, or recompute the whole cast?** Recommended: hold the others fixed, as your "as if the character were brand new" suggests, and show the full recompute's knock-on changes in the glass box as a comparison.
2. **Should SLIPS be offered at all, given that it changes your Cinderella?** Recommended: yes, as a separate switch that is off by default. Each correction quotes the line it corrects and comes with a written diff. The DICHAR/DISPLY speed inversion is included only if a run confirms it.
3. **Which extensions should the switch turn on, and which mode should the site open in?** Recommended: the site opens in 1978 mode. The switch turns on MEND, KNOW, APPEAR and CHANGE; SLIPS and DETAIL are opt-in.
4. **May the revival add knowledge that the thesis doesn't state, such as "shy suggests small" or "magical suggests purple"?** Recommended: yes, labeled "the revival's" with its reason, and reviewed against your legitimacy rule. Any entry that reproduces your 1978 looks is dropped.
5. **When should the mini-Ani ship, given HANDOFF's plan to pilot with children first?** Recommended: ship films (1.13.0) and the programs-only example (1.14.0) now, since examples leave the microworlds the pilot uses untouched. Hold the AI-voices example until after the pilot. Keep Ani's words "mean" and "evil", and offer "grumpy" as a same-meaning word.