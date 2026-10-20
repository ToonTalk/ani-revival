# Ani heeds your criticism of its films: CRITIC

*16 October 2026, stages C0 to C3 of `reports/chapter-x/design-criticism.md`.* CRITIC (`src/director/revive/critic.lisp`, `critpc.lisp` and `critsc.lisp`, with `hold.lisp`; the "critic" extension in `src/pipeline.js`) is your Section D, "Critics and Criticism" (AI-TR-540 pp. 189-191): "Ani should be extended to accept criticism of the films and their justification. For many types of criticism there is an obvious response." Built so far are your first three kinds and your two Cinderella examples:

1. **Not this way: another way** (your (1)): a way of showing vetoed in a task, at either of CHOMET's levels, how it is shown (a display method) or what is shown (a convey method). Ani sets it aside and chooses among what is left, "removing those alternatives that were vetoed by the user" (your footnote).
2. **Too quick, too slow** (your (2)): the part's time stretched or shrunk, and its display methods "asked to replan the activities involved shrunk or stretched respectively".
3. **Keep these two apart in this scene** (your (3)): "this post-condition could be added to all the methods in that scene and it could be remade". With it, **start far from**, your remedy for No Longer Kept Apart (p. 69).

And, since 20 October, the first half of C6, the revival's extension of your idea:

4. **A pass-1 choice criticized** ("the Prince moves too fast"): a direction, never a value, heard as a suggestion your COSUG combines like any other, through your stub `try-to-resolve-using-criticism`, with everyone else held ("A pass-1 choice criticized (C6)", below).

Not built yet: the language-model box (C4), "as if this distance or time were known" and Ani's self-criticism (C5), and C6's second half, holding the uncriticized parts of a scene in pass 2.

`node tools/check-critic.mjs` (`npm run test:critic`, 35 minutes on a quiet machine, 47 on a busy one with the review's cases; `--fps 24` for your two examples and `ka-apart-alone` at 24 frames a second, 40 minutes, an hour on a busy machine) remakes your Cinderella with each example below, at 4 frames a second, from the film as it was (as in 1978, or with KNOW and SLIPS), and holds it to what your lines say should happen and to the goldens in this folder: for each example `summary.json` (the record, what was remade, and what changed, `criticismChanges`), and for each scene planned again its glass box, and for each scene filmed again its film and program. `test/critic.test.js` and `test/critic-contacts.test.js` (in `npm test`) check the record, the loading, the wrappers, HOLD and the contact table. No criticism, nothing changes: a film without criticism never loads CRITIC, and with CRITIC loaded and an empty record your Cinderella comes out byte for byte (`node tools/check-1978.mjs --extensions critic`), as do the films of the extensions that change it (`node tools/check-ext.mjs --extensions know,critic`, and so with slips, seen, detail and appear).

## How it works

- **The record is kept with the film**, not in its description, as your footnote has it, "a record of user criticism": a criticism is of how Ani made the film, not of what it is to convey. The pipeline writes it, before each job, as `KEN1;FILM CRITIC`, one `(criticism: id c1 kind ... by you)` form an item, which REVIVE;CRITIC reads into `:critic-record`. Every wrapper does nothing while that is empty.
- **Loaded on demand**, into every job of a film that has criticism, with MEND, whatever the film's own extensions (none, for "Ani as in 1978"): "start far" places with PLACE's `large-distance-and-offstage`, which you never defined and REVIVE;MEND19 does. MEND is byte for byte on your Cinderella.
- **The remake.** A film is made again from the first scene criticized. The scenes before it are kept as they were. Each scene from it on is planned again, and a scene whose program comes out byte for byte as before keeps its film, since Director's film is a function of the program alone. That is the revival's stand-in, at the film's scale, for your "unless necessary no other parts of the film" (until C6 holds a scene's other parts): Kept Apart begins with a cut, so criticizing the Introduction leaves Kept Apart to Justice as they were. Pass 1 is not run again unless a pass-1 choice is criticized (C6, below): the film's `KEN;CP` is mounted with its other files.
- **All or nothing, scene by scene.** If Ani stops planning or filming a scene with the criticism (a veto can leave it only a way your code hasn't finished: see `ka-veto-guard`), that scene's files are put back as they were, and it and every scene after it are kept as the film remade from had them, so the film is whole; the criticism "couldn't be made", and the page says why in plain words.
- **What it leaves.** Where a criticism was heeded the actor it acted on memorizes `(heeded-criticism: id C what W was X now Y because R)`, where it couldn't be `(unmet-criticism: id C what W was X because R)`. They are not `revival-repair:` notes, since a heeded criticism is not a repair. The glass box collects them as `glass.criticism`.
- **Nothing becomes knowledge.** A criticism is per film. No suggestion of DISPLY's or CONVEY's is changed: a set-aside suggestion is rejected by your own `reject-suggestion`, with a reason that names the criticism. That would otherwise be the cheating of your p. 189 footnote, fixing things "so that the option no longer existed or looked undesirable".

The responses, each where your code chooses:

| Kind | Wraps | What Ani does |
|---|---|---|
| another way, how it is shown | CHOMET's `get-display-method-suggestions` (`chomet.123:205-207`) | the vetoed method set aside by `reject-suggestion` (`chomet.123:305-310`) with the reason `(vetoed-by-you c1)`; CHOMET chooses among the rest, and when nothing is left your own path takes over: `resurect-bad-time-fits` (`chomet.123:187`), then `cant-do` |
| another way, what is shown | CHOMET's `get-convey-method-suggestions` (`chomet.123:213-214`) | the same for an establish task's related convey suggestions, before `choose-a-few-convey-methods` (`chomet.123:474`) |
| too quick, too slow | CHOMET's `ideal-time-for-task` (`chomet.123:95-116`), `adjust-task-lengths` (`chomet.123:140-185`) and `approve-or-remake-tasks-choices` (`chomet.123:9-36`) | the time the task ends up with, times 1.5 for each "too quick", 1/1.5 for each "too slow", compounding, within its allocated time (its share of the scene's length in your film description) and SCENE's stretch of 8 and 1/8 (`scene.9:166-169`: the time no more than 8 times your ideal for the part's ways, no less than an eighth); SCENE's own stretch then slows or speeds its walks. Where your code fits the whole scene to its length (`adjust-task-lengths`), it works from your own times, and the pace is applied to the time it gave the task (`nlka-veto-quick`) |
| keep apart | the same two lists as a veto, under CRITSC | a way that would bring the two together set aside with the reason your `score-suggestions` gives a prerequisite not met (`chomet.123:253-255`): `(prerequisites-not-met ((kept-apart-by-you cinderella prince c1)))` |
| start far | PLACE's `place-small-`, `place-medium-` and `place-large-distance-apart` (`place.45:9-53`) | where the two are placed and the one to start far is still where an earlier scene left her (or nowhere), with no part yet in the scene, that place is forgotten (after your own test for a cut, which your placers make first) and your `place-large-distance-apart` places her, far off and off the stage; heeded again in a part SCENE redoes (`nlka-joy-far`). Where she is on the stage already it isn't heeded, and the note says so, `(already-in-the-scene)` (`meeting-far`); where your own placing puts her far anyway, `(already-far place-large-distance-apart)` |

What "brings them together" means is read from your code, not invented: `tools/critic-contacts.mjs` reads every way of showing's run receiver, yours in DISPLY and the revival's, for a walk of one to `(contact-with B by A)` or of the two together (`move-characters`), in its body or a function it calls with them, and every verb whose ways of showing all do; it writes the table into REVIVE;CRITSC, each line citing where it was read, and `test/critic-contacts.test.js` fails if the table and the files disagree. DISPLY's five: move-to-and-hits, goes-to-and-accompanys, pushes-around, move-to-each-other and repeatedly-come-in-contact; not chases-to, stands-guard, move-small-part-towards, alternately-turn, move-near-and-turn or exit-by. The revival's: MEND's move-to, KNOW's helps-along and follows-behind, CHSHOW's goes-to-and-transforms. The verbs: accompanys, meets, pushes, hurts, helps (KNOW's way, and in 1978 none) and follows. A verb counts only in a film whose jobs have one of its ways of showing (the table names them, `(helps (1 2) by helps-along)`): in a film made as in 1978 Ani has no way of showing helping at all, so helping brings no one together there.

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
| `intro-apart`, with your knowledge | 151 | 116, planned again, kept | 17, kept | 179, kept | 84, kept |
| KNOW and SLIPS (and so FIT), as `check-ext` makes it | 250 | 122 | 34 | 185 | 73 |
| `intro-apart-slips`, with KNOW and SLIPS | 222 | 98 | 20 | 192 | 74 |
| `intro-apart-slips-far`, and the Prince starts far from Cinderella in Kept Apart | 222 | 114 | 33 | 183 | 85 |

(Before FIT, 17 October: SLIPS' film 230, 107, 17, 175 and 84; `intro-apart-slips` 209, 116, 10, 180 and 96; `-far` 209, 121, 18, 173 and 96. "CRITIC with FIT", below, says what changed.)

- **With your knowledge**, establishing Cinderella's personality (friendly) had the two convey suggestions friendly makes: accompanying and helping the Prince. Accompanying brings her to him (goes-to-and-accompanys), so it is set aside, `prerequisites-not-met ((kept-apart-by-you cinderella prince c1))`. Helping, which 1978 has no way of showing, brings no one together in a film made with your knowledge alone (only KNOW's helps-along would), so Ani picks it, "something else to establish Cinderella's personality", as your footnote says, and can't show it, as in 1978: the helping task is `cant-do`, your warning "can't do", and takes no time, as it did. The accompanying part goes, and the Introduction is 151 frames (192), as with "show something else" on accompanying (`intro-convey-veto`). Kept Apart to Justice are planned again and come out byte for byte as before, programs, films and POSIT files: Kept Apart begins with a cut that places everyone afresh. So "unless necessary no other parts of the film" holds exactly: only the Introduction is filmed again. In the films they are never on the picture together in the Introduction, and in Kept Apart never closer than 0.345 of the screen (your small distance is under .33, `place.45:103-105`). Met. At 24 frames a second the same: the Introduction 667 frames (917), the rest kept; but Kept Apart, your 1978 film at 24 itself, has Cinderella, the guard's prisoner, escape to within 0.308 of the Prince at frame 436 (below), so the outcome there is "partly". (Until the review of 17 October the contact table counted KNOW's way of helping in every film, so helping was set aside too, the establishing itself was `cant-do`, and the Introduction was 111 frames.)
- **With KNOW and SLIPS**, Ani picks "something else to establish Cinderella's personality": she **helps her stepmother** (`helps-along cinderella step-mother`, SLIPS' S1 letting good's helping find anyone, with KNOW's way of showing it), and **follows her** (KNOW's follows-behind, from Cinderella's relationship with her, as in KNOW's film). The Prince is never on the stage in the Introduction.
- **But the film of Kept Apart brings them close.** The plan of every scene holds them apart: no walk to contact, and no walk of the two together. In Kept Apart's film, though, they come within 0.092 of the screen at frame 14 (0.055 at frame 15 before FIT). Why:
  - the Prince, never on the stage in the Introduction now, starts Kept Apart where the Introduction's POSIT file put him, the center (your `save-positions`, as with the fairy godmother above); 0.42 from Cinderella, so Kept Apart doesn't cut, where in 1978 (and with SLIPS) they started a small distance apart and it cut;
  - then the stepmother stands guard, and your guarding has its prisoner escape towards what she is kept from (`plan-stands-guard-cycle`, `disply.311:465-473`: `(away-from (vicinity-of cinderella) (away-from (vicinity-of cinderella) (vicinity-of prince)))`, which Director goes to as the Prince's vicinity) until the guard stops her. That walk is to his vicinity, not to contact, so the contact table doesn't count it, and it is what Kept Apart is for: the stepmother prevents her meeting him. (With FIT her first escape ends at frame 13, and the Prince, walking across as the guard's "more interesting" walk, passes her at 14.)
  
  So the outcome is "partly met": the check reads the film (`criticismChanges` `closest`), as the design asked. Not counting that walk is the revival's choice (8, below), not something built into Ani; the page says so.
- **And with the Prince starting far too** (`intro-apart-slips-far`, a second criticism a user would add on seeing that): PLACE places him off the stage, far from Cinderella, and they come less close, 0.245 of the screen at frame 60 (0.249 at frame 81 before FIT), again as she escapes the guard towards him. Start far met, keep apart partly.

## The other examples

| Example | Record | Result |
|---|---|---|
| `nlka-veto` | "not this way" on the godmother's goes-to-and-accompanys | another way: she chases the stepmother off (`chases-to`, which your run had set aside as `too-much-time:`, brought back by your `resurect-bad-time-fits`; the task's allocated time moves to 1.12 to 16.12 to fit it, and it runs 3.03 seconds); `rejected-suggestions` has `(vetoed-by-you c1)` beside your `prerequisites-not-met ((faster fairy-godmother step-mother))` for stands-guard. 23 frames (17), the Meeting 178, Justice 100 |
| `intro-convey-veto` | "show something else": accompanys vetoed in establishing Cinderella's personality | helping the Prince alone is left, which your knowledge has no way to show (`cant-do`, as in 1978), so nothing accompanies anyone: the Introduction 151 frames (192). The other parts' shares of the scene go from a fifth to a quarter, so the hitting part's allocated time starts at 7.5 seconds, not 6, and it runs 7.5 (7.32). Kept Apart on: kept |
| `intro-convey-veto-know` | the same, with KNOW | helping is shown, by KNOW's helps-along: 154 frames (KNOW's 225); kept from Kept Apart on |
| `ka-too-slow` | Kept Apart's guarding "too slow" | 14.36 seconds become 10.0, the least of its allocated 10 to 25, not 9.57: partly met, held to the time your story gives it; 110 frames (116). Said three times, from that film, no shorter: not met, judged against the film it was remade from. And the Meeting's Prince accompanying Cinderella, already at the least of his allocated 4.29 to 10.71, "too slow": not met (`unmet-criticism:`), and the Meeting is planned again and kept |
| `meeting-apart` | keep Cinderella and the Prince apart in the Meeting | 4 of its 6 parts can't be made without bringing them together: their accompanying (both) is set aside at the convey level, and their moves to each other at the display level, `cant-do`; what is left is their being alone (the others exit) and alternately turning, with the two joys. 125 frames (179), Justice 112 (84). Partly met: they start the Meeting together (0.004 of the screen), where No Longer Kept Apart left them, and nothing in Ani moves two apart. The page leads with the design's sentence: "Most of the Meeting couldn't be made without bringing Cinderella and the Prince together; that is what the Meeting is for. Perhaps this is a change to the story." |

### The review's cases (17 October)

An adversarial review of C0 to C3 found cases where Ani or the verdict went wrong; each is now an example, with goldens, so that it stays right:

| Example | Record | Result |
|---|---|---|
| `ka-veto-guard` | "not this way" on the stepmother's guarding in Kept Apart | the only way left is a chase (`chases-to step-mother prince ...`, brought back as in `nlka-veto`), and after Kept Apart's cut the stepmother has no place while where they run to has one: your chases-to's unfinished branch, `(break cant-handle-yet-in-chases-to-intial-locs)` (`disply.311:95-111`). Ani stops; Kept Apart's files are put back, and it and every scene after it are kept as 1978's (`stopped`, `after-stop`), so the film is your 1978 film; "couldn't be made". The page still offers the veto, with a caution that Ani will most likely stop (the revival's choice 11, below) |
| `nlka-veto-quick` | the veto of `nlka-veto` and "too quick" | with the veto alone the chase runs 3.03 seconds, which your `adjust-task-lengths` gives it when it fits the scene to its 10 seconds (its signs as stage 7's question 2 has them: below the scene's least, it sets the task's longest); "too quick" paced before that adjustment had come out at 0.44 seconds, quicker. Now the adjustment works from your own times and the pace from what it gave: 4.54 seconds, 29 frames (23 with the veto alone; the Meeting 181, Justice 95). Both met |
| `ka-apart-alone` | keep Cinderella and the Prince apart in Kept Apart alone | nothing there brings them together, so nothing is set aside and no note is left; Kept Apart is planned again and kept. Judged from the film: 0.345 of the screen at their closest, met at 4 frames a second; at 24 frames a second partly, 0.308 at frame 436, the guard's prisoner escaping towards him as in `intro-apart` |
| `nlka-far-from-other` | the fairy godmother to start far from the stepmother | PLACE places her with Cinderella in No Longer Kept Apart, never with the stepmother, so there is nothing to heed and the scene is kept; she is on the picture at once: not met (the page offers as "from" only those PLACE places her with) |
| `nlka-veto-none` | both of the godmother's ways vetoed, goes-to-and-accompanys and chases-to | no other way: her part is `cant-do`, and No Longer Kept Apart is 2 frames (the Meeting 191, Justice 90); both not met ("no other way") |
| `nlka-joy-far` | your story with Cinderella's joy after the undoing (`(sequence: (convey (undoes fairy-godmother ...)) (establish (emotional-state cinderella (joy (positive high)))))`), made to No Longer Kept Apart; then the godmother to start far from Cinderella | the joy's part is only a feeling, so your SCENE extends the part before to show it, putting that part back as it was and running its ways again (`extend-last-actions-of`, `scene.9:224-240`); start far is heeded again in the part redone: she starts off the stage and walks on (49 frames, as long as without the criticism). Met |
| `meeting-far` | Cinderella to start far from the Prince in the Meeting | she has had her part on the stage before they are placed together, so she isn't moved far off mid-scene: `(unmet-criticism: ... because (already-in-the-scene))`, the Meeting kept; not met |

"Too quick" on No Longer Kept Apart's part was also tried (before FIT) on films made with KNOW, with SLIPS, with SEEN, and on your cinderella-beautified scene with MEND, KNOW and CHANGE. With KNOW, SLIPS and SEEN the godmother's part is 5.97 seconds, not 3.98, and runs 7 seconds in the film, not 3.75: met, the scene 30 frames each time (the Meeting and Justice 183 and 90 with KNOW, 175 and 80 with SLIPS, 208 and 116 with SEEN). In cinderella-beautified the godmother's transforming of Cinderella, 20.27 seconds, is held to 30, the most the story gives it (12 to 30): partly met, 124 frames, and the scenes after it filmed again.

## For the page

Everything is in `src/pipeline.js`; the worker runs it as it runs `makeFilmSteps`. The page's side is built (16 October): `app/film/criticism.js`, with the record's helpers and `criticismChanges` copied into the page from `src/pipeline.js` by `tools/build-film-app.mjs` (which checks them against the goldens here), and Ken's 1978 film's files (`tools/critic-base.mjs`) carried in the page, at 4 and 24 frames a second, to remake it from. On the page his examples come out as here: "too quick" 30, 183 and 90 frames; "start far" 25, 177 and 85; his footnote 151, the rest kept (667 at 24 frames a second, "partly", 0.308 at frame 436); "not this way" 23, 178 and 100 (`tools/check-film-app.mjs`).

**Making a film it can later remake.** Every film the page makes keeps its files, so a film file of version 1 or 2 (a film without criticism) now carries `files` too, and a film remade without criticism `remadeFrom` and `remade`; older pages ignore those keys. (The design had versions 1 and 2 written as before.) Pass `keepFiles: true` to `makeFilmSteps`: the result's `files` is `{ "DIR;FN1 FN2": text }`, every file a later job reads (`KEN;CP 30`, each scene's program, `KEN1;<fn1> MINI`, `KEN1;<movie> POSIT`, with CHANGE the BECOME files, and a new story's `KEN;CINDY n`), about 116,000 characters for your Cinderella (`filesOf`; the printouts, 160,000 more, are left out, since no job reads them). Keep it with the saved film (version 3).

**The record**, `run.criticism`, a list of items (`checkCriticism` says what is wrong with one):

| kind | fields | Lisp |
|---|---|---|
| `another-way` | `scene`, `task` (the task's description, `taskDescription(glassTask)`, e.g. `"(personality cinderella)"`), `level` (`"display"`: how it is shown; `"convey"`: what an establish task shows), `vetoes` (the method's first word: `"goes-to-and-accompanys"`, `"accompanys"`); and `source`, only where the scene has two tasks of that description (`sourceNeeded(glassTask, glass)`): the description of the task it came from, or `"initial-description"` | `(criticism: id c1 kind another-way scene ... task (...) [source (...)] level display vetoes ... by you)` |
| `pace` | `scene`, `tasks` (the part's tasks' descriptions), `direction` (`"too-quick"` or `"too-slow"`), `times` (1 or more); `sources`, one for each task, null where not needed, only where one is. A record has one pace item for a task (`checkRecord` refuses another) | `... tasks ((...)) [sources (...)] direction too-quick factor 1.5 ...` |
| `keep-apart` | `scenes` (one or more), `between` (two characters) | `... scenes (introduction kept-apart) between (cinderella prince) ...` |
| `start-far` | `scene`, `who`, `from` | `... scene ... who fairy-godmother from cinderella ...` |

Every item also has `id` (`"c1"`, ...), `by` (`"you"`; `"ani"` is for C5's self-criticism) and `said` (the user's words, or `null`: "you said ..."; the Lisp never sees them).

- `addCriticism(record, item)` returns `{ record, item }`, a new record: an item without an id gets the next; the same criticism twice is kept once; a part's "too quick" again compounds (`times + 1`), "too slow" after "too quick" cancels one, and none left takes the item out (`item` null). So the page keeps one pace item a part.
- `removeCriticism(record, id)`; `criticismWords(item)`, plain words to start from; `criticismScenes(item)`; `paceFactor(item)`; `PACE_FACTOR` (1.5); `CRITICISM_KINDS`.

**Remaking.** `remakeFilmSteps(fs, { previous, criticism, fps, frames, progress, onPass1, onScene, onKept, onChange, onFrame, keepGoing })` (or `remakeFilm`, run to the end), with `previous` the run as `makeFilmSteps` returned it (its `scenes`, `files`, `extensions`, `criticism`, `changes`, `choicePoints`), and `criticism` the whole record now (what was criticized before and still is, and anything new; `[]` to make it again without). It remakes from the first scene the record criticizes, or the old record did (so taking a criticism out remakes from its scene too); `from` overrides. `extensions` defaults to `previous.extensions`: the film's own, which the page shows; a record that isn't empty adds CRITIC and MEND to every job, so the "Which extensions" panel can list "Your criticism (CRITIC)" ticked and greyed. `fps` and `frames` default to the film's (its films' rate, and 250 seconds at that rate, as the page films); a scene made at another rate, or that ran into the cap, is filmed again, and with other extensions than the film's every scene is planned and filmed again. A criticism of a scene the film doesn't have is refused. Callbacks as `makeFilmSteps`'s, and `onKept(scene, how, error)`, `how` `"before"` (not planned again), `"unchanged"` (planned again, the same program, its film kept), `"stopped"` (Ani stopped there: `error`) or `"after-stop"`. Progress steps `"pass2"` ("Pass 2: planning ... again") and `"film"`. The result is `makeFilmSteps`'s shape, with `criticism` (the record, if not empty), `files`, and `remade: { from, stopped?, scenes: [{ id, how }] }`, `how` `"kept"`, `"unchanged"`, `"refilmed"`, `"stopped"` or `"after-stop"` (`"failed"` only in a film made again from scratch), `stopped` `{ scene, error }`. Nothing is thrown where Ani stops: the scene's files are put back, and the film remade from is kept from there on. A film saved with no `files` is made again from the start (`remade.fromScratch`; pass its `description` if it was a new story's), with the progress step `"remake"`: "This film was saved before Ani kept its working files, so it is made again from the start". Times in Node, at 4 frames a second: from No Longer Kept Apart, 1.5 to 2.5 minutes; from the Introduction, 1 minute when the later scenes are kept, 7 when they are all filmed again (with KNOW and SLIPS).

**What changed**, `criticismChanges(previous, remade)`, for "What your criticism changed" side by side:
- `scenes`: `[{ id, how, frames: { before, after }, runningTime: { before, after }, tasks }]`, `tasks` those whose choice, status or running time differ, by description, each `{ description, before, after }`, a side `{ choice, status, runningTime }` or `null` (gone);
- `stopped`: `{ scene, error }`, where Ani stopped, if it did.
- `criticism`: `[{ id, item, words, outcome, notes, cantDo, contacts?, closest?, pace?, start?, stopped? }]`, judged by what the film shows as well as by the notes. `outcome`:
  - `"stopped"` ("couldn't be made"): Ani stopped in one of its scenes, or before them;
  - `"not-reached"`: nothing it names was planned (the task isn't in the scene, the way vetoed wasn't weighed, she never comes on);
  - another way: `"met"` when the way was set aside and the task done another way, `"not-met"` when no other way was left (the task `cant-do` now), `"partly"` with a note that it couldn't be heeded somewhere;
  - pace: by the part's times before and after, `pace: { before, after }`, each `{ planned, film }` (the longest of its tasks' running times, and the seconds its subscene ran in the film): `"not-met"` if it moved the wrong way or not at all (by the film when both have it), `"partly"` if a bound held it, else `"met"`;
  - keep apart: `"partly"` if a walk of the plan or the film still brings them within your small distance, else `"met"`, with notes or without (`closest`: `[{ scene, distance, frame }]`, how close the two came on the picture, `distance` null if never on it together, `closestApproach`, against `SMALL_DISTANCE`, .33);
  - start far: by the film, `start: { walkedOn, frame }`: `"met"` if she was placed far (a heeded note, or your own placing already far) and walked on, `"partly"` if placed far but on the picture at once, `"not-met"` otherwise.

  `cantDo`: the tasks Ani could do before and can't now.

**The glass box.** `glass.criticism` (only when there are notes): `[{ actor, id, heeded, what, was, now?, because, note }]`, printed as Lisp:

| what | heeded | was, now | because | say |
|---|---|---|---|---|
| `another-way` | on the task | the method, `set-aside` | `(vetoed-by-you display)` or `convey` | "vetoed by you" |
| `keep-apart` | on the task | the method, `set-aside` | `(brings-together cinderella prince display)` | "it would bring Cinderella and the Prince together, which you said they must not do in this scene" |
| `pace` | on the task | the seconds before (the time your code gave it) and after (the time it runs) | `(too-quick 1.5)`; with `held-to (allocated-time 10.0 25.0)` (offer "Make the scene longer in the story") or `held-to (stretch 8.0)` (SCENE's limit) for the bound that held it; with `after (scene-adjusted -1.3779)` when it was paced on the time your adjustment of the scene gave it | "you said it was too quick: Ani gave it 5.97 s instead of 3.98 s, the walks slowed to fit (stretched by 1.5, where they were 1)" |
| `pace`, unmet | on the task | the seconds | `(too-slow 0.66666667 held-to (allocated-time 4.2857143 10.714286))` | "this part already takes the least time your story gives it" |
| `start-far` | on the subscene | where she was, where PLACE put her | `(far-from cinderella not place-medium-distance-apart)` | "the fairy godmother was placed far from Cinderella, off the stage, because you asked; PLACE chose where" |
| `start-far`, unmet | on the subscene | where she was | `(already-in-the-scene)` or `(already-far place-large-distance-apart)` | "she already had a part earlier in this scene, on the stage ..."; "PLACE already places her far ... so your criticism changed nothing here" |

In `rejected-suggestions`, beside your reasons: `(vetoed-by-you c1)`, "vetoed by you" (strike the way through in "How Ani chose this", with the words said); and `(prerequisites-not-met ((kept-apart-by-you cinderella prince c1)))`. The page words every reason there, yours too (`prerequisites-not-met` one prerequisite at a time, `need-more-time:`, REVIVE;MEND14's `no-run-receiver`), and none is shown as Lisp. A task left `cant-do` by a criticism is in `cantDo`: "No other way to show that Cinderella is friendly was left: the two Ani knew both bring her to the Prince", and, as the design has it, "With the revival's KNOW and SLIPS, Ani would have Cinderella help her stepmother instead" (`intro-apart-slips`).

**Other helpers.** `taskDescription(glassTask)`, a task's name in the record; `contactsIn(glass)`, the walks of a plan that bring two together; `closestApproach(film, a, b)`; `withCritic(ids)`.

**The registry.** The "critic" entry has `group: "criticism"` and `onDemand: true`, new fields: never in the switch's `SWITCHED`, never ticked by the user. The "Which extensions" panel lists it in its own group, never ticked (the design had it ticked and greyed on a film with criticism; the panel sets what the next film is made with, which never includes CRITIC, and a film made with criticism says so where it says what it was made with: "by Ani as in 1978 with the revival's repairs (MEND), which your criticism loads, heeding your criticism"). `tools/build-film-app.mjs` copies the registry into `DATA.extensions` without `onDemand` and the page's `EXT_GROUPS` has no "criticism" group, so the panel needs both. `tools/build-ani-bundle.mjs` takes the files from the registry: REVIVE;HOLD, CRITIC, CRITPC and CRITSC are new. CHANGE now lists HOLD too.

**The examples' frames, at 4 frames a second** (Introduction, Kept Apart, No Longer Kept Apart, the Meeting, Justice; `-` kept before the scene criticized):

| example | frames |
|---|---|
| 1978 | 192, 116, 17, 179, 84 |
| `nlka-too-quick` | -, -, 30, 183, 90 |
| `nlka-start-far` | -, -, 25, 177, 85 |
| `nlka-both` | -, -, 38, 184, 82 |
| `nlka-veto` | -, -, 23, 178, 100 |
| `intro-apart` | 151, 116, 17, 179, 84 (all four kept) |
| `intro-convey-veto` | 151, 116, 17, 179, 84 (all four kept) |
| `intro-convey-veto-know` | 154, 116, 17, 179, 84 (kept; KNOW's 225, ...) |
| `intro-apart-slips` | 222, 98, 20, 192, 74 (SLIPS' 250, 122, 34, 185, 73, with FIT) |
| `intro-apart-slips-far` | 222, 114, 33, 183, 85 |
| `ka-too-slow` | -, 110, 19, 175, 82 |
| `meeting-apart` | -, -, -, 125, 112 |
| `ka-veto-guard` | -, 116, 17, 179, 84 (Ani stops in Kept Apart: it and the rest kept) |
| `nlka-veto-quick` | -, -, 29, 181, 95 |
| `ka-apart-alone` | -, 116, 17, 179, 84 (all kept) |
| `nlka-far-from-other` | -, -, 17, 179, 84 (all kept) |
| `nlka-veto-none` | -, -, 2, 191, 90 |
| `nlka-joy-far` (your story with the joy, made to No Longer Kept Apart) | -, -, 49 (49 without the criticism, the godmother beside Cinderella) |
| `meeting-far` | -, -, -, 179, 84 (kept) |
| `nlka-too-quick-fit` (from FIT's film: 192, 121, 35, 206, 66) | -, -, 50, 206, 66 |
| `nlka-too-slow-fit` | -, -, 35, 206, 66 (all three planned again and kept) |

At 24 frames a second, as the film was shot (`node tools/check-critic.mjs --fps 24`, goldens in `24fps/`, your two examples): the film at 24 made with its files kept (`24fps/base-files.json`, `--make-base`, its frames and events checked against `reports/film/24fps`), then each remade at 24:

| example | frames |
|---|---|
| 1978 at 24 | 917, 701, 113, 1051, 458 |
| `nlka-too-quick` | -, -, 188, 1075, 478 |
| `nlka-start-far` | -, -, 152, 1060, 489 |
| `nlka-both` | -, -, 236, 1082, 488 |
| `intro-apart` | 667, 701, 113, 1051, 458 (all four kept) |
| `ka-apart-alone` | -, 701, 113, 1051, 458 (all kept) |

## CRITIC with FIT (17 October)

By your decisions of 16 and 17 October FIT (`reports/ext/fit/README.md`: a scene keeps the time its length gives it, a stretched walk takes its stretch once, a character's dynamics their parent's factors once) is on with the revival's extensions, the page's switch among them, and never in "Ani as in 1978".

**A remake uses the film's own extensions, so a film made with FIT is remade with FIT.** `remakeFilmSteps` takes `previous.extensions` (with what they require: SLIPS brings FIT) and adds only CRITIC and MEND; a film made with the page's set is remade with the page's set, FIT among it, and a film made as in 1978 is remade as in 1978, with MEND, never FIT. That is as it should be: what is criticized is how Ani made that film, and a remake with other extensions would change scenes the criticism never touched (the remake would plan and film every scene again, `sameDirector`), and would remake a film made as in 1978 with corrections you decided are never to be in it. Every example from your 1978 film is as it was.

**What changed.** `intro-apart-slips` and `intro-apart-slips-far` remake the film with KNOW and SLIPS, `reports/ext/slips`, which since your decision of 16 October is made with FIT (SLIPS requires it: `tools/critic-base.mjs filmWith("slips")` now lists it), so their goldens were saved again:
- *The film remade from* is SLIPS' with FIT: 250, 122, 34, 185 and 73 frames (230, 107, 17, 175 and 84).
- *`intro-apart-slips`*: 222, 98, 20, 192 and 74 (209, 116, 10, 180 and 96). The Introduction is planned as before (Cinderella helps and follows her stepmother, the Prince never on the stage); it is longer, its stretched walks taking their stretch once and the pushing no longer speeding up push by push (S16, S8). Kept Apart, planned 29.75 seconds, is held to 30 (`scene-time-kept`), the guard keeping her pace (S8) and ending sooner: 98 frames. No Longer Kept Apart, which starts where Kept Apart now leaves everyone, is held to its least, 10 seconds, and films in 20 frames (10), the accompanying ending sooner than planned. The Meeting and Justice start elsewhere. Kept apart: still partly met, at 0.092 of the screen at frame 14 (0.055 at frame 15): Cinderella's first escape towards the Prince ends at frame 13 and the Prince, walking across as the guard's "more interesting" walk, passes her at 14. `check-critic`'s test of that closest approach now takes her escape as running then or just ended (within half a second).
- *`intro-apart-slips-far`*: 222, 114, 33, 183 and 85 (209, 121, 18, 173 and 96). The Prince placed far off and off the stage, walking on (start far met); they come within 0.245 of the screen at frame 60 (0.249 at 81), as she escapes towards him: keep apart partly.

**"Too quick" in a FIT film** (`nlka-too-quick-fit`, from your Cinderella made with FIT, `reports/ext/fit`: 192, 121, 35, 206 and 66 frames). FIT holds No Longer Kept Apart to its least, 10 seconds; the pace then makes the godmother's part half as long again, **15 seconds**, within the task's allocated 3.92 to 18.92 and the scene's 10 to 25, the part stretched by 3.77 (2.51 with FIT alone): met, 50 frames (35), the Meeting and Justice 206 and 66. How the two wraps meet: CRITIC's are loaded after FIT's, so they are outside them. Your approve-or-remake-tasks-choices gives the task its ideal through ideal-time-for-task, which CRITIC paces, 3.98 to 5.97; FIT then holds the scene to its least, moving the task by your adjust-task-lengths, inside which CRITIC holds the pace off (so the adjustment works from your own times, 4.03 seconds, its most 6.95, and the part's stretch filling the rest, to 10); and CRITIC then paces the time the task ended up with, 10 to 15, as it paces after your own adjustment of a scene. The heeded note says so, `(too-quick 1.5 after (scene-adjusted 4.03))`, beside FIT's own `scene-time-kept` (planned 5.97, held to 10); the page says the revival had first held the scene to the time its length gives it (FIT), which gave the part 10 seconds.

**Where they fought, and the fix.** "Too slow" on the same part paced FIT's 10 seconds down to 6.67, under the scene's least: CRITIC undid FIT's hold, and FIT's note still said 10. The pace is bounded by the story (the task's allocated time) so that a criticism never overrides the film description, and with FIT the scene's length-bounds are the story's too. So REVIVE;CRITPC now keeps the scene within its length-bounds when FIT keeps the scene's time (its piece s15 on): a pace moves the scene's time no further than its least ("too slow") or its most ("too quick"), and where that bound held it the note names it, `held-to (length-bounds 10.0 25.0)`. `nlka-too-slow-fit`: the part is already at the scene's least, so the criticism is not met, `(unmet-criticism: ... because (too-slow 0.66666667 held-to (length-bounds 10.0 25.0) after (scene-adjusted 6.0802)))`, and No Longer Kept Apart, the Meeting and Justice are planned again and kept; the page says "it already takes the least time your story gives it (10 to 25 s, the time your story gives this scene, which the revival holds it to)". Without FIT nothing changes (every other example's golden is as it was).

## A pass-1 choice criticized (C6, first half, 20 October)

Not in your Section D, which criticizes "the films and their justification"; but pass 1's choices are part of the justification the glass box shows, and your conflict resolution already calls a stub for criticism (`choose.198:327`, `587-589`, "nil ;;for now"; p. 109, "never finished procedures ... to resolve the conflict by using criticism (either from the user or self generated)"). It is labeled everywhere as **the revival's extension of your idea** (design section 4.6).

**What Ani does** (REVIVE;CRITIC, section 5):
- **A direction, never a value** (the revival's choice 13, below): the user says a character "moves too fast", "too slowly", or "not high", and the record keeps it as a direction from the value the film had, in your own value language (`cosug.215:302-307`, `382-400`): lower, `(less-than high)`; higher, `(greater-than low)`; not, `(not high)`.
- **Heard as a suggestion.** CHOOSE's `gather-suggestions-of-type` (`choose.198:135-163`) is wrapped: with the choice point's absolute suggestions, the first of FILM's groups (`film.17:47-56`), comes `(suggestion: element speed value (less-than high) strength high source (criticism-by-you c1))`, so your COSUG combines it like any other.
- **Your stub, filled.** `try-to-resolve-using-criticism` is wrapped: a conflict one of whose two offenders is the criticism is resolved its way by your own `conflict-resolved` (`choose.198:542-569`), the reason `criticized-by-you`. You placed this test before previous choices and strengths, so a criticism winning its conflicts is your order.
- **Your rules can still refuse it.** "Cinderella moves too fast", her speed low already, is `(less-than low)`, a value your COSUG can't make (`impossible-relative-value`, `cosug.215:318-327`), and `resolve-conflict` rejects it as `self-conflicting-suggestion` (`choose.198:319-322`) before the stub is asked. (The design's probe called this one "moves too slowly"; too slowly asks for higher, which she can have.)
- **Where the choice is recorded** (`record-choice`, `choose.198:596-603`, where your comment says "at some point this should check for criticism before accepting choice"), the choice point memorizes `(heeded-criticism: id c1 what choice was high now medium because (less-than high))`, or `(unmet-criticism: id c1 what choice was low because (self-conflicting-suggestion))`; `(not-chosen)` when it was combined away without moving the value.
- **Everyone else held** (the revival's choice 5, your decision 1 for changes): pass 1 is made again with REVIVE;HOLD's `hold-all-but-choice-points`, every choice but the criticized one held as the film's `KEN;CP` had it. A full recompute runs beside it, every choice afresh with the criticism, not saved: its knock-ons are kept for the glass box as a comparison only.
- **The remake** is from pass 1: every scene planned again, and a scene whose program comes out byte for byte as before keeps its film.
- **Per scene it is not a pass-1 criticism.** A pass-1 choice is a character's for the whole film: you choose how she moves once, and pass 2 reads it in every scene (`scene.9:265-275`). "The hare should be slower in the last scene" is a feeling of that scene's, which Ani shows by changing how he moves there (EMOTE's joy changes speed, `emote.9:12-35`): a change to the story, the editor's. The record refuses a choice item with a scene and says so (`CHOICE_PER_SCENE`).

**The examples** (`tools/check-critic.mjs`, goldens here, at 4 frames a second):

| example | record | result | frames (1978 or the film's) |
|---|---|---|---|
| `choice-prince` | "The Prince moves too fast" | met: high to medium, his winning suggestion's sources including `(criticism-by-you c1)` beside yours (COSUG's compromises, no conflict needed the stub). Held: the fairy godmother's speed at medium, where on its own Ani would have chosen high (the design's probe found the same knock-on); the full recompute's knock-ons: that one. Every scene planned again and filmed again (his speed is in each program; the Introduction's 192 frames are the same length). The Meeting's Prince wanting her and accompanying her take longer (1.33 to 4.29 s, 4.29 to 5.63 s), the scene 32.9 to 37.2 s | 192, 116, 16, 201, 111 (192, 116, 17, 179, 84) |
| `choice-impossible` | "Cinderella moves too fast" (low) | not met: `self-conflicting-suggestion`, three of your conflicts resolved `criticized-by-you` along the way, her speed low; every choice as the film's, so every scene planned again with the same program and its film kept | all kept |
| `choice-not-high` | "The stepmother's speed: not high" | met: high to medium, the rest held | 256, 116, 43, 200, 96 |
| `hare-too-fast` | "The hare moves too fast", in `test/stories/tortoise-and-hare.lisp` made with the page's set (MEND, KNOW, APPEAR, CHANGE, SEEN, FIT) | met: medium to low (in this film the tortoise is the fast one, high); the other 49 choices held; the three scenes planned and filmed again | 279, 187, 29 (169, 156, 29) |
| `hare-slower-last-scene` | "The hare should be slower in the last scene" | refused, with `CHOICE_PER_SCENE`: a story change, for the editor | no remake |

Times in Node: the Prince 4 minutes (two pass 1s of 20 seconds, then five scenes), the impossible 1.7, not high 6, the hare 2.3 (and 1.4 to make its film).

### For the page (C6)

**The record.** A new kind, `choice` (`CRITICISM_KINDS`):

| kind | fields | Lisp |
|---|---|---|
| `choice` | `character`, `element` (`"speed"`, `"path-curvature"`, ...: a choice point `(choice-point-of character element)` the film has, `choicePointOf(item)`), `direction` (`"lower"`, `"higher"` or `"not"`, `CHOICE_DIRECTIONS`), `was` (the film's value there, `choicePoints[].currentChoice`, which the direction is from); no `scene` | `(criticism: id c1 kind choice choice-point (choice-point-of prince speed) direction lower was high value (less-than high) by you)` |

- Offer it in `choicePointBox` for an absolute choice point whose value is a name (not the attractions' `(positive high)`), labeled "The revival's: criticism of pass 1's choices". Its words: `choiceWords(item)` (`criticismWords` uses it): speed "moves too fast" / "moves too slowly"; path-curvature "moves in paths too curvy" / "too straight"; path-length "takes paths too long" / "too short"; path-jaggedness "moves in paths too jagged" / "too smooth"; others "has too much ..." / "has too little ..."; not, "prince's speed: not high". Offer a direction that is impossible at the value too (lower at low, higher at high): Ani's refusal is then its own, explained after the remake. Where `elementUse(element, extensions)` is `"none"`, say before the remake that nothing in the film reads it.
- `addCriticism`: one item a choice point; criticizing it again (from the remade film, `was` its new value) puts the new item in the old one's place, keeping its id; the same twice is kept once. `checkRecord` refuses two items of one choice point, a value as a direction, and a scene on a choice item: its error is `CHOICE_PER_SCENE`, which the page shows where a user asks for one scene ("say how the character feels in that scene, in the editor"); the plain-English box (C4) routes such a request to the editor as a `story` item.

**Remaking.** `remakeFilmSteps` with a choice item in the record (or in `previous.criticism`, so that taking it out chooses that point again without it) makes pass 1 again from `previous.files`' `KEN;CP`: progress `"pass1"` ("Pass 1 again: prince's speed chosen afresh with your criticism, everyone else held as they were") and `"recompute"` ("Pass 1 again, to compare: every choice made afresh with your criticism"); `onPass1` gets the new choice points; with CHANGE, the fresh looks are made again (`"fresh-look"`, `"recompute"`); then every scene is planned again from the first (`from` is ignored), `onKept(scene, "unchanged")` for those whose program is the same. The result's `choices`, `choicePoints`, `appearances` and `repairs` are the new pass 1's, and `remade.pass1` is `{ held: [{ choicePoint, heldAt, wouldHaveChosen }], differences: [{ choicePoint, before, after, criticized }], knockOns }` (knockOns: the differences not criticized, the full recompute's, a comparison only). A choice point the film doesn't have is refused. A film kept without files is made from the start with the criticism and nothing held.

**What changed**, `criticismChanges`: the item's `outcome` `"met"` (its choice point noted it heeded: the value moved as asked), `"not-met"`, or `"not-reached"` (no such choice point); `notes` from the choice point (`scene` null, `actor` `"(choice-point-of prince speed)"`, `what` `"choice"`, `was`, `now`, `because`); and `choice`: `{ choicePoint, before, after, recomputed, knockOns, held, resolvedForIt, rejected }`, `recomputed` the full recompute's value for it, `resolvedForIt` how many of your conflicts were resolved `criticized-by-you`, `rejected` the reason its suggestion was set aside (`"self-conflicting-suggestion"`), or null.

**The glass box, pass 1's choice point** (its `memory`, `conflictsResolved` and `rejectedSuggestions`, as `collectChoicePoints` has them):

| what | where | say |
|---|---|---|
| `(criticism-by-you c1)` in a suggestion's source (alone, or in an `(and ...)` of combined sources) | `sourceText` | "you said he moves too fast" (the item's `said`, or `choiceWords`) |
| `how-resolved criticized-by-you` in `conflictsResolved` | the conflicts | "Ani took your criticism over this suggestion (Ken's place for it: try-to-resolve-using-criticism, choose.198:587)" |
| `(heeded-criticism: id c1 what choice was high now medium because (less-than high))` | the choice | "high before; medium now, because you said he moves too fast" |
| `(unmet-criticism: ... because (self-conflicting-suggestion))` | the choice | "Ani couldn't: low is its slowest, and Ken's rules refuse a value lower than low (impossible-relative-value)" |
| `(unmet-criticism: ... because (not-chosen))` | the choice | "Ani weighed your criticism with the other suggestions, and the value came out as before" |
| `remade.pass1.held` | the other choice points | as CHANGE's: "held as it was; on its own Ani would have chosen high" |
| `remade.pass1.knockOns` | "What your criticism changed" | "Had Ani chosen everything afresh, the fairy godmother's speed would have gone from medium to high too; the remake held it" |

The pass-2 glass boxes are unchanged in form: a choice criticism leaves no note there.

## The revival's choices, pending you

Each is recorded in `reports/chapter-x/PLAN.md` for you to overrule:

1. **A veto names the method's first word, in the task where it was given** (the design's question 2), not the exact form, the scene or the film.
2. **One "too quick" is a factor of 1.5, compounding**, bounded by the task's allocated time and SCENE's 8 and 1/8 (question 3).
3. **A criticism is per film**: never carried into Ani's knowledge (question 8).
4. **CRITIC is loaded on demand, with MEND, for any film including "Ani as in 1978"** (question 11). For your Cinderella MEND is byte for byte; for a new story made as in 1978, the scenes remade are planned with MEND's repairs.
5. **Pass-1 criticism holds everyone else** (question 1; built in C6, 20 October): HOLD's `hold-all-but-choice-points` frees only the criticized choice point; with nothing freed it gives CP 29. The full recompute's knock-ons are shown as a comparison only (`choice-prince`: the fairy godmother's speed would have gone from medium to high).
6. **CHOMET's redistribution (stage 7, question 2): settled by your decisions of 16 and 17 October**, as FIT, on with the revival's extensions and never in "Ani as in 1978". The examples made from your 1978 film are as they were (CRITIC loads MEND, never FIT); a film made with FIT is remade with it, and "too quick" paces from the time FIT keeps (below, "CRITIC with FIT").
7. **Internal self-criticism left out** (question 9).
8. **Keep-apart is a contact table read from your code**: walks to contact and walks together. A walk to someone's vicinity that isn't to contact (your guard's prisoner escaping towards the Prince) isn't counted, and the film's frames are checked instead (the outcome "partly"). Counting it would set aside stands-guard, and with it Kept Apart's own convey task ("the stepmother prevents Cinderella meeting the Prince"), when one asks for them to be kept apart there.
9. **Start far acts in all three of PLACE's placings** (the design named place-medium-distance-apart), so that it reaches a pair placed a large or a small distance apart too (move-small-part-towards, follows-behind); and only where the one to start far is first placed in the scene, with no part in it yet.
10. **A part of tasks run in parallel is paced as a whole**, each of its tasks given its new time (the design had only a task on its own, section 4.1).
11. **A veto whose only way left would stop Ani is offered all the same, with a caution**, and a remake in which Ani stops keeps the film as it was from there (`ka-veto-guard`). Not offering it was the other choice; the page can't know for certain beforehand whether your chases-to will stop, which depends on where PLACE has the characters when it runs, and Ani's own reasoning is what should say what it can't do (the design, section 8).
12. **A task named twice in a scene is told apart by the task it came from** (`source`), not by its position among those of its description, as the design had it: the scene's list of tasks grows at the front as Ani chooses, so a position can shift.
13. **A pass-1 criticism is a direction, never a value, gathered with your absolute suggestions at strength high** (question 4): lower, higher or not, from the value the film had; in your first group of sources rather than a group with a priority of its own, its conflicts resolved for it by your stub. Your rules can still refuse it (`choice-impossible`). It is not offered as a value ("the Prince's speed is medium"), which would be dictating, the cheating of your p. 189 footnote.
14. **A pass-1 criticism is for the whole film; per scene it is a story change** (C6): "slower in the last scene" is refused as a criticism and sent to the editor, where the user says how the character feels there (your EMOTE shows joy, and its lack, by speed). The other choice would be a value for one scene, which Ani has no place for: pass 2 reads one value a character.
15. **One choice item a choice point**: criticized again from the remade film, the new item (from the new value) replaces the old.

## Found on the way

- **Your `resurect-bad-time-fits` brings back only suggestions set aside for taking too much time** (`chomet.123:187-198`): it looks for `more-time-needed:`, where your `time-fit-score` writes `need-more-time:` (`chomet.123:413`). So when a veto leaves nothing, "your own path takes over" brings back only a way that took too much time; one that needed more is never brought back. CRITIC leaves this as it is.

- **Your `save-positions` puts a character who was never shown at the center**, "ended up here", which the next scene takes as where she is (`aninit.65:158-173`). That is why the fairy godmother "just appears" in No Longer Kept Apart, and why, once the Introduction no longer shows the Prince, he starts Kept Apart at the center.
- **The plan can hold two apart while the film brings them close**: where they start the scene together (the Meeting) or a walk towards the other's vicinity (the guard's prisoner). A user's "keep apart" is then partly met. Your own Kept Apart does it at 24 frames a second, 1978's film: Cinderella escapes to within 0.308 of the Prince at frame 436 (0.345 at 4 frames a second). The design's C5 (self-criticism, comparing the film with the plan) is where Ani could notice and remake.
- **The kept files are 116,000 characters for your Cinderella**, not the design's 20 to 60 thousand: the programs alone are 92,000.
