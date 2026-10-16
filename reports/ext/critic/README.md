# Ani heeds your criticism of its films: CRITIC

*16 October 2026, stages C0 to C3 of `reports/chapter-x/design-criticism.md`.* CRITIC (`src/director/revive/critic.lisp`, `critpc.lisp` and `critsc.lisp`, with `hold.lisp`; the "critic" extension in `src/pipeline.js`) is your Section D, "Critics and Criticism" (AI-TR-540 pp. 189-191): "Ani should be extended to accept criticism of the films and their justification. For many types of criticism there is an obvious response." Built so far are your first three kinds and your two Cinderella examples:

1. **Not this way: another way** (your (1)): a way of showing vetoed in a task, at either of CHOMET's levels, how it is shown (a display method) or what is shown (a convey method). Ani sets it aside and chooses among what is left, "removing those alternatives that were vetoed by the user" (your footnote).
2. **Too quick, too slow** (your (2)): the part's time stretched or shrunk, and its display methods "asked to replan the activities involved shrunk or stretched respectively".
3. **Keep these two apart in this scene** (your (3)): "this post-condition could be added to all the methods in that scene and it could be remade". With it, **start far from**, your remedy for No Longer Kept Apart (p. 69).

Not built yet: the language-model box (C4), "as if this distance or time were known" and Ani's self-criticism (C5), criticism of pass 1's choices and holding the uncriticized parts of a scene (C6).

`node tools/check-critic.mjs` (`npm run test:critic`, 35 minutes on a quiet machine, 54 on a busy one; `--fps 24` for your two examples at 24 frames a second, 40 minutes) remakes your Cinderella with each example below, at 4 frames a second, from the film as it was (as in 1978, or with KNOW and SLIPS), and holds it to what your lines say should happen and to the goldens in this folder: for each example `summary.json` (the record, what was remade, and what changed, `criticismChanges`), and for each scene planned again its glass box, and for each scene filmed again its film and program. `test/critic.test.js` and `test/critic-contacts.test.js` (in `npm test`) check the record, the loading, the wrappers, HOLD and the contact table. No criticism, nothing changes: a film without criticism never loads CRITIC, and with CRITIC loaded and an empty record your Cinderella comes out byte for byte (`node tools/check-1978.mjs --extensions critic`), as do the films of the extensions that change it (`node tools/check-ext.mjs --extensions know,critic`, and so with slips, seen, detail and appear).

## How it works

- **The record is kept with the film**, not in its description, as your footnote has it, "a record of user criticism": a criticism is of how Ani made the film, not of what it is to convey. The pipeline writes it, before each job, as `KEN1;FILM CRITIC`, one `(criticism: id c1 kind ... by you)` form an item, which REVIVE;CRITIC reads into `:critic-record`. Every wrapper does nothing while that is empty.
- **Loaded on demand**, into every job of a film that has criticism, with MEND, whatever the film's own extensions (none, for "Ani as in 1978"): "start far" places with PLACE's `large-distance-and-offstage`, which you never defined and REVIVE;MEND19 does. MEND is byte for byte on your Cinderella.
- **The remake.** A film is made again from the first scene criticized. The scenes before it are kept as they were. Each scene from it on is planned again, and a scene whose program comes out byte for byte as before keeps its film, since Director's film is a function of the program alone. That is how your "unless necessary no other parts of the film" shows at the film's scale: Kept Apart begins with a cut, so criticizing the Introduction leaves Kept Apart to Justice as they were. Pass 1 is not run again (nothing criticized reaches it before C6): the film's `KEN;CP` is mounted with its other files.
- **What it leaves.** Where a criticism was heeded the actor it acted on memorizes `(heeded-criticism: id C what W was X now Y because R)`, where it couldn't be `(unmet-criticism: id C what W was X because R)`. They are not `revival-repair:` notes, since a heeded criticism is not a repair. The glass box collects them as `glass.criticism`.
- **Nothing becomes knowledge.** A criticism is per film. No suggestion of DISPLY's or CONVEY's is changed: a set-aside suggestion is rejected by your own `reject-suggestion`, with a reason that names the criticism. That would otherwise be the cheating of your p. 189 footnote, fixing things "so that the option no longer existed or looked undesirable".

The responses, each where your code chooses:

| Kind | Wraps | What Ani does |
|---|---|---|
| another way, how it is shown | CHOMET's `get-display-method-suggestions` (`chomet.123:205-207`) | the vetoed method set aside by `reject-suggestion` (`chomet.123:305-310`) with the reason `(vetoed-by-you c1)`; CHOMET chooses among the rest, and when nothing is left your own path takes over: `resurect-bad-time-fits` (`chomet.123:187`), then `cant-do` |
| another way, what is shown | CHOMET's `get-convey-method-suggestions` (`chomet.123:213-214`) | the same for an establish task's related convey suggestions, before `choose-a-few-convey-methods` (`chomet.123:474`) |
| too quick, too slow | CHOMET's `ideal-time-for-task` (`chomet.123:95-116`) | the task's time times 1.5 for each "too quick", 1/1.5 for each "too slow", compounding, within its allocated time (its share of the scene's length in your film description) and SCENE's stretch of 8 and 1/8 (`scene.9:166-169`); SCENE's own stretch then slows or speeds its walks |
| keep apart | the same two lists as a veto, under CRITSC | a way that would bring the two together set aside with the reason your `score-suggestions` gives a prerequisite not met (`chomet.123:253-255`): `(prerequisites-not-met ((kept-apart-by-you cinderella prince c1)))` |
| start far | PLACE's `place-small-`, `place-medium-` and `place-large-distance-apart` (`place.45:9-53`) | in the scene's first part where the two are placed, and only while the one to start far is where an earlier scene left her, that place is forgotten and your `place-large-distance-apart` places her, far off and off the stage |

What "brings them together" means is read from your code, not invented: `tools/critic-contacts.mjs` reads every way of showing's run receiver, yours in DISPLY and the revival's, for a walk of one to `(contact-with B by A)` or of the two together (`move-characters`), in its body or a function it calls with them, and every verb whose ways of showing all do; it writes the table into REVIVE;CRITSC, each line citing where it was read, and `test/critic-contacts.test.js` fails if the table and the files disagree. DISPLY's five: move-to-and-hits, goes-to-and-accompanys, pushes-around, move-to-each-other and repeatedly-come-in-contact; not chases-to, stands-guard, move-small-part-towards, alternately-turn, move-near-and-turn or exit-by. The revival's: MEND's move-to, KNOW's helps-along and follows-behind, CHSHOW's goes-to-and-transforms. The verbs: accompanys, meets, pushes, hurts, helps (KNOW's way, and in 1978 none) and follows.

A keep-apart is not added as a prerequisite on the suggestion itself, as the design first had it, because your suggestions are quoted forms of DISPLY's and CONVEY's: changing one would change your knowledge for every later task. The reason it is rejected with is the one your prerequisite test would give.

## Your two examples

### No Longer Kept Apart (p. 69)

"This scene is a bit confusing to watch --- things happen too quickly and the fairy godmother just appears and is quickly gone. User criticism could easily be applied to allocate more time for this scene or to have the fairy godmother start far from Cinderella."

| Film | No Longer Kept Apart | the Meeting | Justice |
|---|---|---|---|
| 1978 | 17 frames | 179 | 84 |
| `nlka-too-quick`: "too quick" | 30 | 183 | 90 |
| `nlka-start-far`: the fairy godmother starts far from Cinderella | 25 | 177 | 85 |
| `nlka-both`: both | 38 | 184 | 82 |

The Introduction and Kept Apart are kept in each, before the scene criticized.

- **Too quick.** The godmother's part, her goes-to-and-accompanys, is given 5.97 seconds instead of 3.98, half as long again, within the 3.92 to 18.92 its task was allocated; SCENE stretches its walks by 1.5 (`stretched-by` 1.5), so she and Cinderella walk two thirds as fast. Met.
- **Start far.** In 1978 the godmother was never on the stage in Kept Apart, and where she is in No Longer Kept Apart is where Kept Apart's POSIT file left her: your `save-positions` (`aninit.65:158-173`) writes every character's place, and hers, never shown, is the center, (0, 0), "ended up here in kept-apart", beside Cinderella at (0.018, -0.024). So PLACE left both where they were, and she appeared beside Cinderella. With the criticism, PLACE places her `(good-distance-from-and-offstage (vicinity-of cinderella))` "so that (goes-to-and-accompanies ...)": she is first seen off the picture (frame 1) and walks on to Cinderella. Met.
- **Both**, your two remedies together: 38 frames, 9.5 seconds (236 frames at 24 a second, 9.8 seconds). That is still under the scene's own 10 to 25 seconds (its length is short): applied literally, your suggestion still leaves the scene a little quick.
- **Why the scene is so quick.** Its bounds are 10 to 25 seconds, but goes-to-and-accompanys' estimate (at most 6.95 seconds) did not fit the task's share, so your `approve-or-remake-tasks-choices` moved the task's allocated time down by 6.08 seconds, to 3.92 to 18.92 (`resurect-bad-time-fits`, `chomet.123:187`), and the task took its ideal, 3.98. That is the redistribution whose signs stage 7's question 2 left for you; the revival's choice is to leave that question unsettled here (below).
- **Ani's estimate didn't move with "start far"**: goes-to-and-accompanys estimates only the walk to the destination (`disply.311:171-184`), not the friend's walk on, so Director ran the part longer than Ani planned. That is your self-criticism case (5), for stage C5.
- The Meeting and Justice change only because No Longer Kept Apart now leaves everyone elsewhere: each begins from the scene before's POSIT file. Neither begins with a cut.

### The Introduction's subscene (d) (p. 64)

"If Ani were extended as described in Section D ... then this would be an ideal test case. ... we could criticize Ani's choices for this subscene. [We] could say that Cinderella is not to meet the Prince until the third scene and Ani would redo this subscene (and unless necessary no other parts of the film) picking something else to establish Cinderella's personality."

The criticism: keep Cinderella and the Prince apart in the Introduction and Kept Apart.

| Film | Introduction | Kept Apart | No Longer Kept Apart | the Meeting | Justice |
|---|---|---|---|---|---|
| 1978 | 192 frames | 116 | 17 | 179 | 84 |
| `intro-apart`, with your knowledge | 111 | 116, planned again, kept | 17, kept | 179, kept | 84, kept |
| KNOW and SLIPS, as `check-ext` makes it | 230 | 107 | 17 | 175 | 84 |
| `intro-apart-slips`, with KNOW and SLIPS | 209 | 116 | 10 | 180 | 96 |
| `intro-apart-slips-far`, and the Prince starts far from Cinderella in Kept Apart | 209 | 121 | 18 | 173 | 96 |

- **With your knowledge**, establishing Cinderella's personality (friendly) had only the two convey suggestions friendly makes: accompanying and helping the Prince. Both bring her to him (accompanys by goes-to-and-accompanys; helps, which 1978 had no way of showing, by KNOW's helps-along, the only way the revival knows), so both are set aside, `prerequisites-not-met ((kept-apart-by-you cinderella prince c1))`, and the task is `cant-do`: your warning, "can't do". The Introduction's last two parts go (the accompanying, and the helping, which took no time in 1978), and it is 111 frames. Kept Apart to Justice are planned again and come out byte for byte as before, programs, films and POSIT files: Kept Apart begins with a cut that places everyone afresh. So "unless necessary no other parts of the film" holds exactly: only the Introduction is filmed again. In the films they are never on the picture together in the Introduction, and in Kept Apart never closer than 0.345 of the screen (your small distance is under .33, `place.45:103-105`). Met. At 24 frames a second the same: the Introduction 722 frames (917), the rest kept; but Kept Apart, your 1978 film at 24 itself, has Cinderella, the guard's prisoner, escape to within 0.308 of the Prince at frame 436 (below), so the outcome there is "partly".
- **With KNOW and SLIPS**, Ani picks "something else to establish Cinderella's personality": she **helps her stepmother** (`helps-along cinderella step-mother`, SLIPS' S1 letting good's helping find anyone, with KNOW's way of showing it), and **follows her** (KNOW's follows-behind, from Cinderella's relationship with her, as in KNOW's film). The Prince is never on the stage in the Introduction.
- **But the film of Kept Apart brings them close.** The plan of every scene holds them apart: no walk to contact, and no walk of the two together. In Kept Apart's film, though, they come within 0.055 of the screen at frame 15. Why:
  - the Prince, never on the stage in the Introduction now, starts Kept Apart where the Introduction's POSIT file put him, the center (your `save-positions`, as with the fairy godmother above); 0.42 from Cinderella, so Kept Apart doesn't cut, where in 1978 (and with SLIPS) they started a small distance apart and it cut;
  - then the stepmother stands guard, and your guarding has its prisoner escape towards what she is kept from (`plan-stands-guard-cycle`, `disply.311:465-473`: `(away-from (vicinity-of cinderella) (away-from (vicinity-of cinderella) (vicinity-of prince)))`, which Director goes to as the Prince's vicinity) until the guard stops her. That walk is to his vicinity, not to contact, so the contact table doesn't count it, and it is what Kept Apart is for: the stepmother prevents her meeting him.
  
  So the outcome is "partly met": the check reads the film (`criticismChanges` `closest`), as the design asked.
- **And with the Prince starting far too** (`intro-apart-slips-far`, a second criticism a user would add on seeing that): PLACE places him off the stage, far from Cinderella, and they come less close, 0.249 of the screen at frame 81, again as she escapes the guard towards him. Start far met, keep apart partly.

## The other examples

| Example | Record | Result |
|---|---|---|
| `nlka-veto` | "not this way" on the godmother's goes-to-and-accompanys | another way: she chases the stepmother off (`chases-to`, which your run had set aside as `too-much-time:`, brought back by your `resurect-bad-time-fits`; the task's allocated time moves to 1.12 to 16.12 to fit it, and it runs 3.03 seconds); `rejected-suggestions` has `(vetoed-by-you c1)` beside your `prerequisites-not-met ((faster fairy-godmother step-mother))` for stands-guard. 23 frames (17), the Meeting 178, Justice 100 |
| `intro-convey-veto` | "show something else": accompanys vetoed in establishing Cinderella's personality | helping the Prince alone is left, which your knowledge has no way to show (`cant-do`, as in 1978), so nothing accompanies anyone: the Introduction 151 frames (192). The other parts' shares of the scene go from a fifth to a quarter, so the hitting part's allocated time starts at 7.5 seconds, not 6, and it runs 7.5 (7.32). Kept Apart on: kept |
| `intro-convey-veto-know` | the same, with KNOW | helping is shown, by KNOW's helps-along: 154 frames (KNOW's 225); kept from Kept Apart on |
| `ka-too-slow` | Kept Apart's guarding "too slow" | 14.36 seconds become 10.0, the least of its allocated 10 to 25, not 9.57: partly met, held to the time your story gives it; 110 frames (116). Said three times, no shorter. And the Meeting's Prince accompanying Cinderella, already at the least of his allocated 4.29 to 10.71, "too slow": not met (`unmet-criticism:`), and the Meeting is planned again and kept |
| `meeting-apart` | keep Cinderella and the Prince apart in the Meeting | 4 of its 6 parts can't be made without bringing them together: their accompanying (both) is set aside at the convey level, and their moves to each other at the display level, `cant-do`; what is left is their being alone (the others exit) and alternately turning, with the two joys. 125 frames (179), Justice 112 (84). Partly met: they start the Meeting together (0.004 of the screen), where No Longer Kept Apart left them, and nothing in Ani moves two apart. The design's sentence for the page: "Most of the Meeting couldn't be made without bringing them together; that is what the Meeting is for. Perhaps this is a change to the story." |

## For the page

Everything is in `src/pipeline.js`; the worker runs it as it runs `makeFilmSteps`. The page agent's work: the controls, "Your criticism", "Remake with my criticism", the glass box's words, the side by side, the saved film's version 3. Nothing here touches `app/`.

**Making a film it can later remake.** Pass `keepFiles: true` to `makeFilmSteps`: the result's `files` is `{ "DIR;FN1 FN2": text }`, every file a later job reads (`KEN;CP 30`, each scene's program, `KEN1;<fn1> MINI`, `KEN1;<movie> POSIT`, with CHANGE the BECOME files, and a new story's `KEN;CINDY n`), about 116,000 characters for your Cinderella (`filesOf`; the printouts, 160,000 more, are left out, since no job reads them). Keep it with the saved film (version 3).

**The record**, `run.criticism`, a list of items (`checkCriticism` says what is wrong with one):

| kind | fields | Lisp |
|---|---|---|
| `another-way` | `scene`, `task` (the task's description, `taskDescription(glassTask)`, e.g. `"(personality cinderella)"`), `level` (`"display"`: how it is shown; `"convey"`: what an establish task shows), `vetoes` (the method's first word: `"goes-to-and-accompanys"`, `"accompanys"`) | `(criticism: id c1 kind another-way scene ... task (...) level display vetoes ... by you)` |
| `pace` | `scene`, `tasks` (the part's tasks' descriptions), `direction` (`"too-quick"` or `"too-slow"`), `times` (1 or more) | `... tasks ((...)) direction too-quick factor 1.5 ...` |
| `keep-apart` | `scenes` (one or more), `between` (two characters) | `... scenes (introduction kept-apart) between (cinderella prince) ...` |
| `start-far` | `scene`, `who`, `from` | `... scene ... who fairy-godmother from cinderella ...` |

Every item also has `id` (`"c1"`, ...), `by` (`"you"`; `"ani"` is for C5's self-criticism) and `said` (the user's words, or `null`: "you said ..."; the Lisp never sees them).

- `addCriticism(record, item)` returns `{ record, item }`, a new record: an item without an id gets the next; the same criticism twice is kept once; a part's "too quick" again compounds (`times + 1`), "too slow" after "too quick" cancels one, and none left takes the item out (`item` null). So the page keeps one pace item a part.
- `removeCriticism(record, id)`; `criticismWords(item)`, plain words to start from; `criticismScenes(item)`; `paceFactor(item)`; `PACE_FACTOR` (1.5); `CRITICISM_KINDS`.

**Remaking.** `remakeFilmSteps(fs, { previous, criticism, fps, frames, progress, onPass1, onScene, onKept, onChange, onFrame, keepGoing })` (or `remakeFilm`, run to the end), with `previous` the run as `makeFilmSteps` returned it (its `scenes`, `files`, `extensions`, `criticism`, `changes`, `choicePoints`), and `criticism` the whole record now (what was criticized before and still is, and anything new; `[]` to make it again without). It remakes from the first scene the record criticizes, or the old record did (so taking a criticism out remakes from its scene too); `from` overrides. `extensions` defaults to `previous.extensions`: the film's own, which the page shows; a record that isn't empty adds CRITIC and MEND to every job, so the "Which extensions" panel can list "Your criticism (CRITIC)" ticked and greyed. `fps` must be the film's (a scene made at another rate is filmed again). Callbacks as `makeFilmSteps`'s, and `onKept(scene, how)`, `how` `"before"` (not planned again) or `"unchanged"` (planned again, the same program, its film kept). Progress steps `"pass2"` ("Pass 2: planning ... again") and `"film"`. The result is `makeFilmSteps`'s shape, with `criticism` (the record, if not empty), `files`, and `remade: { from, scenes: [{ id, how }] }`, `how` `"kept"`, `"unchanged"`, `"refilmed"` or `"failed"`. A film saved with no `files` is made again from the start (`remade.fromScratch`; pass its `description` if it was a new story's), with the progress step `"remake"`: "This film was saved before Ani kept its working files, so it is made again from the start". Times in Node, at 4 frames a second: from No Longer Kept Apart, 1.5 to 2.5 minutes; from the Introduction, 1 minute when the later scenes are kept, 7 when they are all filmed again (with KNOW and SLIPS).

**What changed**, `criticismChanges(previous, remade)`, for "What your criticism changed" side by side:
- `scenes`: `[{ id, how, frames: { before, after }, runningTime: { before, after }, tasks }]`, `tasks` those whose choice, status or running time differ, by description, each `{ description, before, after }`, a side `{ choice, status, runningTime }` or `null` (gone);
- `criticism`: `[{ id, item, words, outcome, notes, cantDo, contacts?, closest? }]`. `outcome` is `"met"`, `"partly"` (something unmet, a pace held at its bound, or for keep-apart a walk or the film still bringing them within your small distance), `"not-met"` (only unmet) or `"not-reached"` (no note: nothing it names was planned, as a start-far of a character who never comes on). `cantDo`: the tasks Ani could do before and can't now. `closest` (keep-apart): `[{ scene, distance, frame }]`, how close the two came on the picture, `distance` null if never on it together (`closestApproach`, against `SMALL_DISTANCE`, .33).

**The glass box.** `glass.criticism` (only when there are notes): `[{ actor, id, heeded, what, was, now?, because, note }]`, printed as Lisp:

| what | heeded | was, now | because | say |
|---|---|---|---|---|
| `another-way` | on the task | the method, `set-aside` | `(vetoed-by-you display)` or `convey` | "vetoed by you" |
| `keep-apart` | on the task | the method, `set-aside` | `(brings-together cinderella prince display)` | "it would bring Cinderella and the Prince together, which you said they must not do in this scene" |
| `pace` | on the task | the seconds before and after | `(too-quick 1.5)`; with `held-to (allocated-time 10.0 25.0)` or `held-to (stretch 8.0)` when the bound held it short: "This part already takes all the time your story gives the scene" (offer "Make the scene longer in the story") | "you said it was too quick: given 5.97 seconds instead of 3.98, the walks slowed to fit (stretched by 1.5)" |
| `pace`, unmet | on the task | the seconds | `(too-slow 0.66666667 held-to (allocated-time 4.2857143 10.714286))` | "this part already takes the least time your story gives it" |
| `start-far` | on the subscene | where she was, where PLACE put her | `(far-from cinderella not place-medium-distance-apart)` | "the fairy godmother was placed far from Cinderella, off the stage, because you asked; PLACE chose where" |

In `rejected-suggestions`, beside your reasons: `(vetoed-by-you c1)`, "vetoed by you" (strike the way through in "How Ani chose this", with the words said); and `(prerequisites-not-met ((kept-apart-by-you cinderella prince c1)))`. A task left `cant-do` by a criticism is in `cantDo`: "No other way to show that Cinderella is friendly was left: the two Ani knew both bring her to the Prince", and, as the design has it, "With the revival's KNOW and SLIPS, Ani would have Cinderella help her stepmother instead" (`intro-apart-slips`).

**Other helpers.** `taskDescription(glassTask)`, a task's name in the record; `contactsIn(glass)`, the walks of a plan that bring two together; `closestApproach(film, a, b)`; `withCritic(ids)`.

**The registry.** The "critic" entry has `group: "criticism"` and `onDemand: true`, new fields: never in the switch's `SWITCHED`, never ticked by the user. `tools/build-film-app.mjs` copies the registry into `DATA.extensions` without `onDemand` and the page's `EXT_GROUPS` has no "criticism" group, so the panel needs both. `tools/build-ani-bundle.mjs` takes the files from the registry: REVIVE;HOLD, CRITIC, CRITPC and CRITSC are new. CHANGE now lists HOLD too.

**The examples' frames, at 4 frames a second** (Introduction, Kept Apart, No Longer Kept Apart, the Meeting, Justice; `-` kept before the scene criticized):

| example | frames |
|---|---|
| 1978 | 192, 116, 17, 179, 84 |
| `nlka-too-quick` | -, -, 30, 183, 90 |
| `nlka-start-far` | -, -, 25, 177, 85 |
| `nlka-both` | -, -, 38, 184, 82 |
| `nlka-veto` | -, -, 23, 178, 100 |
| `intro-apart` | 111, 116, 17, 179, 84 (all four kept) |
| `intro-convey-veto` | 151, 116, 17, 179, 84 (all four kept) |
| `intro-convey-veto-know` | 154, 116, 17, 179, 84 (kept; KNOW's 225, ...) |
| `intro-apart-slips` | 209, 116, 10, 180, 96 (SLIPS' 230, 107, 17, 175, 84) |
| `intro-apart-slips-far` | 209, 121, 18, 173, 96 |
| `ka-too-slow` | -, 110, 19, 175, 82 |
| `meeting-apart` | -, -, -, 125, 112 |

At 24 frames a second, as the film was shot (`node tools/check-critic.mjs --fps 24`, goldens in `24fps/`, your two examples): the film at 24 made with its files kept (`24fps/base-files.json`, `--make-base`, its frames and events checked against `reports/film/24fps`), then each remade at 24:

| example | frames |
|---|---|
| 1978 at 24 | 917, 701, 113, 1051, 458 |
| `nlka-too-quick` | -, -, 188, 1075, 478 |
| `nlka-start-far` | -, -, 152, 1060, 489 |
| `nlka-both` | -, -, 236, 1082, 488 |
| `intro-apart` | 722, 701, 113, 1051, 458 (all four kept) |

## The revival's choices, pending you

Each is recorded in `reports/chapter-x/PLAN.md` for you to overrule:

1. **A veto names the method's first word, in the task where it was given** (the design's question 2), not the exact form, the scene or the film.
2. **One "too quick" is a factor of 1.5, compounding**, bounded by the task's allocated time and SCENE's 8 and 1/8 (question 3).
3. **A criticism is per film**: never carried into Ani's knowledge (question 8).
4. **CRITIC is loaded on demand, with MEND, for any film including "Ani as in 1978"** (question 11). For your Cinderella MEND is byte for byte; for a new story made as in 1978, the scenes remade are planned with MEND's repairs.
5. **Pass-1 criticism, when it comes (C6), holds everyone else** (question 1); HOLD's `hold-all-but-choice-points` is there, and with nothing freed gives CP 29.
6. **CHOMET's redistribution (stage 7, question 2) left unsettled**: No Longer Kept Apart's "too quick" golden would change if you answered it.
7. **Internal self-criticism left out** (question 9).
8. **Keep-apart is a contact table read from your code**: walks to contact and walks together. A walk to someone's vicinity that isn't to contact (your guard's prisoner escaping towards the Prince) isn't counted, and the film's frames are checked instead (the outcome "partly"). Counting it would set aside stands-guard, and with it Kept Apart's own convey task ("the stepmother prevents Cinderella meeting the Prince"), when one asks for them to be kept apart there.
9. **Start far acts in all three of PLACE's placings** (the design named place-medium-distance-apart), so that it reaches a pair placed a large or a small distance apart too (move-small-part-towards, follows-behind).

## Found on the way

- **Your `save-positions` puts a character who was never shown at the center**, "ended up here", which the next scene takes as where she is (`aninit.65:158-173`). That is why the fairy godmother "just appears" in No Longer Kept Apart, and why, once the Introduction no longer shows the Prince, he starts Kept Apart at the center.
- **The plan can hold two apart while the film brings them close**: where they start the scene together (the Meeting) or a walk towards the other's vicinity (the guard's prisoner). A user's "keep apart" is then partly met. Your own Kept Apart does it at 24 frames a second, 1978's film: Cinderella escapes to within 0.308 of the Prince at frame 436 (0.345 at 4 frames a second). The design's C5 (self-criticism, comparing the film with the plan) is where Ani could notice and remake.
- **The kept files are 116,000 characters for your Cinderella**, not the design's 20 to 60 thousand: the programs alone are 92,000.
