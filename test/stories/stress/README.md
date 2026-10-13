# Stress stories for MEND

Eighteen small film descriptions, each written to meet one failure that Ani as in 1978 runs into with a new story; one, push-two, that she films to the end and MEND must film the same; and pushed-around, Ken's own tortoise and hare as a model wrote it on the film page, whose second scene ran past the page's old cap of two and a half minutes. They are the test bed for MEND, the revival's repairs (`reports/chapter-x/PLAN.md`, "Item 4, part 1: MEND", repairs M1 to M7, M8, added for no-descriptors, and M9 to M12, added for the failures found while building these and by the reviewers). Each one is in the form of your CINDY (`original/7005017/cindy.46`), uses only words Ani knows apart from the one it is testing, and has a single scene (meets-offstage, pushee-blocked, push-mutual and push-two have two).

Run one with:

```
node tools/run-story.mjs test/stories/stress/<name>.lisp                    # Ani as in 1978
node tools/run-story.mjs test/stories/stress/<name>.lisp --extensions mend  # with the repairs
```

`tools/run-story.mjs` makes the film as the page's "Make the film" does (`src/pipeline.js` makeFilm, keepGoing, at most 1,000 frames a scene at 4 frames a second: the page's 250 seconds, `CAP_SECONDS`, and where Ken's own runs stopped, (m 1000)). For pass 1 and each scene it prints ok, FAILED or CAPPED (the scene hit the 1,000-frame cap, so it never ended), the frames filmed, what Ani planned for each task, the error, the last thing Lisp typed (which names the missing actor for NO-SUCH-ACTOR), and the start of Lisp's backtrace. A failed step is run a second time with the backtrace on, because makeFilm runs without one, as the page does. Pass 1's choices that pass 2 can't use, (not X) and none, are listed; a none on an attraction is listed apart, as not read in pass 2, since nothing after pass 1 reads the attractions (char.2:58-68). Repair notes, in pass 1's `repairs`, each glass box's and each film's (those left while filming), are printed. `--out file.json` writes all of this as JSON. The tool exits with 1 if anything failed or never ended.

`npm run test:stress` (`tools/check-stress.mjs`) makes every story here, the two controls (below) and the three fresh fables (`../fresh/`) four ways, several at once: as Ani as in 1978, with MEND, with MEND and APPEAR together (APPEAR, Ani choosing her characters' looks, adds a kind of choice point MEND's repairs must step over, and its sizes change Director's collisions, so a story films differently; `--modes with-appear` runs only that), and with the extensions the page's switch turns on, MEND, APPEAR, CHANGE and KNOW (`with-know`; KNOW's three stories are below). It checks each against `expected.json`: the exit status, how pass 1 went, each scene's frames (or "under the cap", "capped", or where it failed and with what error), the scenes finished, and the repair notes by kind. Red Riding Hood and Hansel and Gretel take longest, several minutes each, as Into the Woods and The Escape film to the cap without MEND; the others are done in a few minutes alongside it. A new story needs an entry there: `node tools/check-stress.mjs <name> --record` makes it and writes what it did as its entry, to read over before it is committed.

The observations of each story below were first made on 9 October 2026, with no extensions, while MEND's files were still placeholders. MEND has since been written and merged (M1 to M7 as planned, and M8, a repair the no-descriptors story called for), and each story's "With MEND" now gives what it did, run as above; the table under "With and without MEND" sums them up. Most of the stories are built on one skeleton: a goat (beautiful; good, kind) and a troll (ugly, physically strong; mean, strong) who dominates and hates her. In the scene On the Bridge the troll shows he is mean, by chasing and hitting her, and she is sad. As it stands, that skeleton films in 11 frames. Each story changes one thing. Its control is the same story with that one thing taken out, run the same way. The controls are not committed; each section says what its control changed.

| Story | Fails in | Error | Ken's code | Repair |
|---|---|---|---|---|
| not-high | pass 2 | `shouldnt happen (WEIGHTIFY ((NOT HIGH) ...))` | cosug.215:395-402, interf.149:899-904 | M1, M2 |
| none-value | pass 2 | `shouldnt happen (WEIGHTIFY (NONE ...))` | choose.198:61-73, interf.149:899-904 | M2 |
| unknown-word | pass 2 | `break NO-SUCH-ACTOR` (GRUMPY) | sugest.123:54-66 | M3 |
| missing-relationships | pass 2 | `break NO-SUCH-ACTOR` ((RELATIONSHIP-OF GOAT TROLL)) | sugest.123:357-370, prereq.19:57-60, 110-120 | M4 |
| meets-alone | pass 2 | `break NO-SUCH-ACTOR` (MOVE-TO) | convey.64:73-80, chomet.123:436-439 | M5 |
| offstage-victim | filming | no error; the chase and the hits happen off the picture | sugest.123:373-395, place.45:137-141 | M6 |
| no-descriptors | pass 1 | `shouldnt happen (SUMMARIZE-COMPARISON ((COMPARISON-OF GOAT KID) DOES NOT EXIST))` | compar.69:16-26, 106-119, sumcom.53:8-10 | M8 (not in the plan's M1-M7) |
| joy-plus-feeling | pass 2 | `shouldnt happen (CHANGE:-PACKAGE (BAD CHANGE: PACKAGE IN EITHER ...))` | sugest.123:213-234, cosug.215:449-477 | M7 |
| feeling-only-first | pass 2 | `break NO-SUCH-ACTOR` (WANDER-AROUND) | scene.9:216-221 | M9 |
| alone-two | pass 2 | `shouldnt happen (GET-ESTIMATED-TIME-OF (couldn't get a time bound out of ... (EXIT-BY NIL) ...))` | convey.64:236-243, chomet.123:448-460 | M10 |
| cant-do-adjusted | pass 2 | `not a number: NIL` | chomet.123:141-160, scene.9:137-139 | M11 |
| pushee-blocked | filming | no error; the second scene never ends (a bystander stands between the pushee and her target) | disply.311:243-328 | M12 |
| push-mutual | filming | no error; the second scene never ends (two of the goat's moves, and later two of her facings, cancel out) | disply.311:243-328, action.152:296-322 | M12 |
| push-two | nowhere | none: a control, filmed to the end (182 frames); MEND must film it frame for frame the same | disply.311:243-328 | (M12 must not act) |
| pushed-around | pass 2 | `shouldnt happen (WEIGHTIFY (NONE ...))`; with MEND, Pushed Around ran past the page's old cap of 600 frames (it ends at frame 799) | choose.198:61-73; scene.9:223-240, dichar.103:27-31 | M2; then none (it ends on its own) |
| same-place | pass 1 (`SUMMARIZE-COMPARISON ...`, as no-descriptors); with MEND but not M13, filming hangs before the first frame | none: Director's turtle never finishes a line to a place that is not a number | interf.149:89-106, 291-305; aninit.65:158-175 | M8, M13 |
| sent-off-unseen | pass 2 | `Maximum call stack size exceeded` | interf.149:89-118; aninit.65:158-175 | M13 |
| fence | pass 2 | `break BAD-MESSAGE`: `(RUN MAKES-FENCE KID ...) is not understood` | prereq.19:82-107, disply.311:18-25 | M14 |
| guard-self | filming | `break BAD-MESSAGE`: `(RUN NIL ...) is not understood`; past that, `Maximum call stack size exceeded` | disply.311:419-457, 519-531; interf.149:259-271, 383-385 | M14, M15 |
| meets-offstage | pass 2 | `break NO-SUCH-ACTOR` (MOVE-TO); with M5 alone, the meeting filmed in 5 frames, the goat crossing the stage in one | convey.64:73-80, scene.9:161-169 | M5, M6 |

Two of the eight don't behave as the plan expected. offstage-victim never hits the frame cap, and no-descriptors fails in pass 1 for a reason none of M1 to M7 repairs, so MEND gained M8 for it. Both are explained in their sections below. Five more failures turned up while building these; they are listed at the end.

## With and without MEND

Each story was run with `node tools/run-story.mjs <story>` and again with `--extensions mend`, on 9 October 2026, after the repair branches were merged. Frames are at 4 a second, and the cap is 1,000 a scene (600 until 12 October: the page's cap then; the tables below were re-recorded at 1,000). A note is given as its kind, on the actor it was memorized on; the full notes are in each section below.

| Story | Without MEND: where it stops | With MEND: scenes finished | Frames a scene | Cap hit? | Repair notes |
|---|---|---|---|---|---|
| not-high | pass 2 of the Introduction: `WEIGHTIFY ((NOT HIGH) ...)` | 1 of 1 | 145 | no | narrowed, (not high) to low, on (choice-point-of step-mother repetiveness) |
| none-value | pass 2 of The Boast: `WEIGHTIFY (NONE ...)` | 1 of 1 | 136 | no | gave-up, none to medium, on (choice-point-of hare activity-level) |
| unknown-word | pass 2: `NO-SUCH-ACTOR`, GRUMPY | 1 of 1 | 11, frame for frame as the control | no | unknown-word, grumpy skipped, on establish-task-1 |
| missing-relationships | pass 2: `NO-SUCH-ACTOR`, (RELATIONSHIP-OF GOAT TROLL) | 1 of 1 | 41, frame for frame as the control | no | missing-relationship, (relationship-of goat troll) answers dont-know, on establish-task-1 |
| meets-alone | pass 2: `NO-SUCH-ACTOR`, MOVE-TO | 1 of 1 | 53 | no | defined-display-method, (move-to goat (vicinity-of troll)), on (subscene-of on-the-bridge 1) |
| offstage-victim | nowhere: 47 frames, but the chase and the hits are off the picture | 1 of 1 | 50, all on the picture | no | brought-on-stage, the goat by getting-on-stage, on (subscene-of on-the-bridge 2) |
| no-descriptors | pass 1: `SUMMARIZE-COMPARISON ((COMPARISON-OF GOAT KID) DOES NOT EXIST)` | 1 of 1 | 128, frame for frame as the control | no | nothing-to-compare, an empty comparison, on (comparison-of goat kid) (pass 1) |
| joy-plus-feeling | pass 2: `CHANGE:-PACKAGE (BAD CHANGE: PACKAGE ...)` | 1 of 1 | 11 | no | combined-changes, four of them (acceleration, rhythmic-level, speed, activity-level), on establish-task-2 |
| feeling-only-first | pass 2: `NO-SUCH-ACTOR`, WANDER-AROUND | 1 of 1 | 7 | no | defined-action, twice: the troll and the goat each wander, on the subscene |
| alone-two | pass 2: `GET-ESTIMATED-TIME-OF`, no time bound for `(exit-by nil)` | 1 of 1 | 8 | no | already-alone, the exit-by set aside, on the task |
| cant-do-adjusted | pass 2: `not a number: NIL` | 1 of 1 | 6 | no | no-running-time, 0.0 for the kid's cant-do task; in-scene-first |
| pushee-blocked | the second scene never ends (1,001 frames) | 2 of 2 | 14, 139 | no | overdue-move, four of them, on the subscene: three waiting, one no nearer |
| push-mutual | the second scene never ends (1,001 frames) | 2 of 2 | 14, 342 | no | overdue-move, four of them, and overdue-turn, on the subscene |
| push-two | nowhere: 14, 182 | 2 of 2 | 14, 182, frame for frame as without MEND | no | none |
| pushed-around | pass 2 of the Introduction: `WEIGHTIFY (NONE ...)` | 3 of 3 | 543, 799, 89 | no (Pushed Around ended past the old cap of 600) | gave-up, in each scene; overdue-move, three of them, in the Introduction |
| same-place | pass 1: `SUMMARIZE-COMPARISON ((COMPARISON-OF OWL FOX) ...)` | 2 of 2 | 10, 21 | no | same-place, on the movie, while filming (and M3, M8, M9 and M1's) |
| sent-off-unseen | pass 2 of On the Bridge: `Maximum call stack size exceeded` | 2 of 2 | 2, 4 | no | same-place, three of them: one in pass 2, two while filming |
| fence | pass 2 of On the Bridge: `BAD-MESSAGE`, makes-fence | 2 of 2 | 40, 2 | no | never-runs, on the task (the prevention left undone: nothing else can show it) |
| guard-self | filming On the Bridge: `BAD-MESSAGE`, (RUN NIL ...) | 2 of 2 | 40, 146 | no | nothing-to-run, on the subscene; goal-loop, twice, and same-place, while filming |
| meets-offstage | Reunion stops in pass 2: `NO-SUCH-ACTOR`, MOVE-TO | 2 of 2 | 46, 67 | no | brought-on-stage, defined-display-method |
| tortoise-and-hare | pass 2 of The Boast and The Race: `WEIGHTIFY (NONE ...)`; The Finish has no FILM2 POSIT (a knock-on) | 3 of 3 | 187, 108, 29 | no | gave-up, none to medium, on (choice-point-of hare activity-level), in each; defined-action, the tortoise's wander, in The Finish |
| red-riding-hood | Into the Woods never ends (1,001 frames); the other three film | 4 of 4 | 344, 100, 56, 156 | no | overdue-move, one in Into the Woods (no nearer) and one in Together Again (waiting) |

So every stress story, and both controls, finish with MEND, each scene in under 1,000 frames, with its notes, and each fails or misbehaves without it as described. (At the old cap of 600, pushed-around's Pushed Around, which ends on its own at frame 799 as Director as in 1978 films it too, was recorded as capped; see its section.) (The five stories from feeling-only-first on, and the controls' new results, are from 10 October, after MEND's second round: M9 to M12 and the fixes to M5 and M6. pushee-blocked's and Red Riding Hood's frames, and push-mutual and push-two, are from M12's revision the same day: see "M12, revised" below.) Red Riding Hood's later scenes film differently with MEND because Into the Woods now ends, so everyone starts them from somewhere else. With MEND on, your Cinderella comes out byte for byte as without it (`node tools/check-1978.mjs --extensions mend`, and with `--fps 24`), and `npm run test:no-change` (`tools/check-no-change.mjs`) checks that MEND films frame for frame as Ani as in 1978 does what she films to the end: push-two, Hansel and Gretel's first three scenes at 4 frames a second and its first two at 24, and Into the Woods up to its move that never ends.

"Frame for frame as the control" was checked with `makeFilm` (src/pipeline.js): the story with MEND against its control as described in its section, in 1978 mode. Frames, events and picture are identical, and pass 1 makes the same choices in the same places.

## not-high

**What it does.** This is PLAN.md's defiant Cinderella, cut down to the Introduction. Cinderella is determined, stubborn and strong; she hates the stepmother and is impolite to and intolerant of her. The stepmother is as you wrote her, and so is the Prince, who is in no scene. The Introduction establishes the stepmother's personality and Cinderella's sadness.

**Observed.** Pass 1 makes 59 choices, one of them `(choice-point-of step-mother repetiveness) = (not high)`. Pass 2 of the Introduction stops: `shouldnt happen (WEIGHTIFY ((NOT HIGH) IS NOT LOW SHORT MEDIUM LONG OR HIGH))`. It stops while estimating the time of the stepmother's hurts and chases methods: `(ask special-dynamics yield your repetiveness value)`.

**Ken's code.** When two of an element's three values are left, COSUG's absolute-three-value answers `(not X)` (cosug.215:395-402). Pass 1 records it as it stands, and (not X) is a value your representation means to allow (elemnt.1:24-26, 145-146). Special dynamics read the value through weightify (interf.149:845-847), which knows only low, short, medium, long and high (interf.149:899-904). The Prince is needed: without him, pass 1 makes no (not X).

**Repair.** M1 narrows each (not X) to one of the two values left, in pass 2, using GLOSUG's pick-value-with-variety. M2's weightify guard maps any (not X) still left to medium.

**With MEND.** Pass 1 and its CP still say (not high). Pass 2 narrows the value to low, with GLOSUG's pick at the film's medium variety, and notes on the choice point `(revival-repair: what narrowed was (not high) now low because ((variety level) medium (counts (0 medium) (0 low)) (middle-element ken1 reconstruction)))`. The Introduction films in 145 frames. (A scratch stand-in that read (not X) as medium filmed it in 120 frames, before M1 was written; M1 picks low, not medium.)

**Control.** Without the Prince, pass 1 makes 32 choices with no (not X), and the Introduction films in 128 frames.

## none-value

**What it does.** The hare and the tortoise from `test/stories/tortoise-and-hare.lisp`, described as they are there, in The Boast: the hare's personality and the tortoise's sadness.

**Observed.** Pass 1 makes 33 choices, one of them `(choice-point-of hare activity-level) = none`. Pass 2 of The Boast stops: `shouldnt happen (WEIGHTIFY (NONE IS NOT LOW SHORT MEDIUM LONG OR HIGH))`, while estimating the time of the hare's methods: `(ask special-dynamics yield your activity-level value)`.

**Ken's code.** When no suggestion is left, decide-since-no-more-suggestions records none with source given-up (choose.198:61-73). You meant it: there is no last-ditch default for an element like typical speed (choose.198:290-294). Weightify then refuses none (interf.149:899-904).

**Repair.** M2. A none value reads as medium in pass 2, as INTERF already reads an element that was never set (interf.149:846).

**With MEND.** The CP keeps none. Pass 2 reads the value as medium and notes on the choice point `(revival-repair: what gave-up was none now medium because (interf reads an unset element as medium))`. The Boast films in 136 frames. (187 frames, given here before, is tortoise-and-hare's The Boast, which MEND films in 187.)

**Control.** Taking out "lazy" doesn't give a working control. Without it, the hare and the tortoise have nothing left to compare, and pass 1 stops in COMPAR (see no-descriptors). So there is no control run.

## unknown-word

**What it does.** The skeleton, with the troll grumpy as well as mean and strong. Grumpy is a word Ani doesn't know.

**Observed.** Pass 1 makes the same 33 choices, in the same order, as without grumpy. Pass 2 stops: `break NO-SUCH-ACTOR`. Lisp typed `GRUMPY is not an actor`, while collecting the troll's personality suggestions: `(ask grumpy collect items memorized matching (suggestion: element (establish troll grumpy) ...))`.

**Ken's code.** establish-personality-suggestions asks every descriptor of the character for its suggestions (sugest.123:54-66). For a feeling it doesn't know, Ani asks with ask-if-exists and passes over it (sugest.123:38). For a personality word, it doesn't check. Pass 1 doesn't stop either: it makes grumpy a new descriptor with nothing to suggest (cosug.215:28).

**Repair.** M3. A word Ani doesn't know is skipped and named in a note on the task.

**With MEND.** The troll's personality is shown by mean alone, and establish-task-1 notes `(revival-repair: what unknown-word was grumpy now skipped because no-such-word)`. The scene films in 11 frames, frame for frame as the control.

**Control.** Without grumpy, the scene films in 11 frames: the troll chases and hits the goat.

## missing-relationships

**What it does.** The goat is good and friendly. She and her kid love each other, and the kid and the troll are polite to each other. There is no relationship between the goat and the troll, in either direction. The scene establishes the goat's personality.

**Observed.** Pass 1 makes 63 choices. Pass 2 stops: `break NO-SUCH-ACTOR`. Lisp typed `(RELATIONSHIP-OF GOAT TROLL) is not an actor`. Looking for the goat's friend, Ani asks the likes prerequisite about the troll, and likes asks the missing relationship for its description.

**Ken's code.** For friendly's helps and accompanys, friend-of goes through the character's siblings in turn, asking `(status-of (likes a b))` of each (sugest.123:357-370). Siblings come most recently defined first, so the troll is asked before the kid. The likes demon asks meet-description-of about `(relationship-of a b)` (prereq.19:110-120), and meet-description-of asks that actor without checking that it exists (prereq.19:57-60). enemy-of and stranger-of do check (sugest.123:352-353, 385-394).

**Repair.** M4. An exists? guard goes in meet-description-of, so a missing relationship answers dont-know. Its note is written only once, because likes asks up to four times.

**With MEND.** The troll is passed over, and establish-task-1 notes, once, `(revival-repair: what missing-relationship was (relationship-of goat troll) now dont-know because no-such-relationship)`. The scan goes on to the kid, whom the goat loves, and the goat accompanies her kid. The scene films in 41 frames, frame for frame as the control.

**Control.** With the goat and the troll polite to each other, the goat accompanies her kid (her helps is canceled, as Cinderella's was), and the scene films in 41 frames.

## meets-alone

**What it does.** The skeleton's scene becomes `(convey (meets goat troll))`, with the goat cheerful (joy, positive low).

**Observed.** Pass 1 makes 33 choices. Pass 2 stops: `break NO-SUCH-ACTOR`. Lisp typed `MOVE-TO is not an actor`, while the scene's convey tasks choose their values: `(ask move-to recall your tasks-used-in)`.

**Ken's code.** CONVEY shows `(meets a b)` with the display method `(move-to a (vicinity-of b))` (convey.64:73-80), and DISPLY never defines move-to. variety-score asks the method for the tasks it was used in (chomet.123:436-439). get-estimated-time-of does check exists? first (chomet.123:450), but variety-score doesn't.

**Repair.** M5. A suggested display method that doesn't exist is rejected with the reason no-such-display-method, and MEND defines move-to from DISPLY's own parts.

**With MEND.** convey-task-1 chooses `(move-to goat (vicinity-of troll))`. The goat walks from (-500, 0) to the troll and stops in contact with him, and the scene ends: 53 frames. The subscene notes `(revival-repair: what defined-display-method was not-defined now (move-to goat (vicinity-of troll)) because (named-in convey))`.

**Control.** With `(convey (accompanys goat troll))` instead, the scene films in 89 frames.

## offstage-victim

**What it does.** The skeleton plus the kid, who is polite to both of the others. In the scene, the troll first walks the kid over the bridge and then shows that he is mean. The goat isn't named in the scene.

**Observed.** No error, and the frame cap isn't reached: the scene films in 47 frames. Ani picks the goat as the troll's victim anyway. She isn't on the stage when the chase begins, so PLACE puts her off it, at (66, -600) in Director's units (60% of the screen's height below the center). She never appears on the picture. The troll runs after her down to the bottom edge of the picture (frames 33 to 45). The hitting begins just past the edge, at frame 45, and the film ends at frame 46.

**Ken's code.** enemy-of gives the first sibling the character hates or is hated by, wherever that sibling is (sugest.123:373-395). When the troll already has a place and the goat has none, initial-locations-for-two-characters gives her the "if no cut" place, `(medium-distance-and-offstage ...)` (place.45:137-141, by way of place-medium-distance-apart, place.45:9-23).

**The never-ending scene could not be made this way.** PLAN.md says an off-stage victim "never comes on stage, and the scene never ends". Every version I tried ended:
- The victim in no task, in a first scene: the cut puts both characters on the stage, and the scene films in 11 frames.
- The victim in no task of the scene before, so that it starts hidden at the center: 4 frames.
- The victim sent off the stage by `alone` in the scene before: 95 frames. If she had never been on the stage, pass 2 overflowed the stack instead (see "Other failures" below).
- This story: 47 frames.

A friendly character's friend who isn't in the scene is brought on by goes-to-and-accompanys' own getting-on-stage step (disply.311:186-209), and that works in this story's first subscene.

The never-ending scene PLAN.md describes is `test/stories/red-riding-hood.lisp`'s Into the Woods. That scene does hit the cap, but for a different reason (see the controls below): Red Riding Hood, the wolf's victim, is in that scene.

**Repair.** M6. (a) Ani looks first among the characters named in the scene's tasks. Here the troll hates no one in the scene, so the 1978 pick stands. (b) A victim of move-to-and-hits, chases-to or pushes-around who starts the subscene off the stage is first brought on, with getting-on-stage, by herself, to the place on the stage nearest the point half way between them. The walk is counted when the subscene stretches its methods to the time it is allotted, once places are known; Ani makes her estimates while choosing methods, before anyone has a place (run.65:47-53), so there they are Ken's.

**With MEND.** The troll still picks the goat (no one in the scene fits), and she is brought on before the chase: she walks from (66, -600) to (67, -342) in frames 34 to 44. The chase follows, and the hitting starts at frame 49, all on the picture. The film then stops as the hits begin, as it does without MEND: 50 frames. Subscene 2's movements are `(sequence: (activity-of getting-on-stage 2) (and <the chase>))`, and it notes `(revival-repair: what brought-on-stage was (goat at (medium-distance-from-and-offstage (vicinity-of troll))) now (activity-of getting-on-stage 2) because (off-the-stage for chases-to))`.

**Control.** With the troll walking the goat over the bridge instead of the kid, both are on the stage throughout, and the scene films in 38 frames.

## no-descriptors

**What it does.** The skeleton plus the kid, defined as `(define kid character)`, with no descriptors at all. Every pair of characters is related, as the page's prompt asks. The goat is protective of the kid, the kid is grateful to her, and the kid and the troll are polite to each other.

**Observed.** Pass 1 stops: `shouldnt happen (SUMMARIZE-COMPARISON ((COMPARISON-OF GOAT KID) DOES NOT EXIST))`. This happens while choosing values, when Ani compares the goat with her siblings (`(ask goat compare yourself with kid)`).

**Ken's code.** compare-two-characters records each finding (the same descriptor, opposites, neighbors) on `(comparison-of a b)`, and record-comparison makes that actor only when there is something to record (compar.69:16-26, 106-119). summarize-comparison then calls shouldnt-happen if the actor doesn't exist (sumcom.53:8-10). It is reached from find-relative-choice-points (choose.198:184-198). Relationships count only when the two directions share a word, or have opposite or neighboring words (compar.69:29-38). So the kid and the troll, polite to each other both ways, compare. The kid and the goat, with protective-of on one side and grateful-to on the other, don't.

**What the plan expected, and why it doesn't happen.** The design expected Ani to give up (none) on a character with no descriptors, which M2 would read as medium. She doesn't give up. With mirrored relationships (the control), pass 1 gives the kid a value for every element, from variety, with every relative choice different-from, and the scene films.

**Repair.** None of M1 to M7 reaches this, because it is in pass 1, so MEND gained M8 (`src/director/revive/mend8.lisp`). When two characters have nothing to compare, summarize-comparison goes on with an empty `(comparison-of a b)`, made as record-comparison makes one, instead of stopping. An empty comparison summarizes as one whose findings are too slight to rate (no summary, sumcom.53:33-41, 85), and yields its relative choice points as any comparison does. Cinderella never reaches it, since every pair in CINDY shares a word.

**With MEND.** Pass 1 makes 63 choices, the same as the control's in the same places, and notes on the comparison `(revival-repair: what nothing-to-compare was stopped now empty because (no same opposite or neighboring descriptors))` (pass 1's notes are in its `repairs`, which run-story prints). The scene films in 128 frames, frame for frame as the control.

**Control.** With the kid protective of the goat too, so that the relationships mirror, pass 1 makes 63 choices and the scene films in 128 frames.

## joy-plus-feeling

**What it does.** The skeleton, with the goat feeling `(and (joy (positive low)) (joy (positive medium)))`. In 1978 Ani knows one feeling, joy (emote.9), so the second feeling is joy again. Your Kept Apart gives the stepmother `(and (joy (positive medium)) (pride (positive medium)))` (cindy.46:71-72), and Ani passes over pride because she doesn't know it. Once KNOW teaches her pride, Kept Apart takes this same path.

**Observed.** Pass 1 makes 33 choices. Pass 2 stops: `shouldnt happen (CHANGE:-PACKAGE (BAD CHANGE: PACKAGE IN EITHER (SUGGESTION: ELEMENT (ESTABLISH (EMOTIONAL-STATE GOAT (JOY (POSITIVE LOW)))) ...) OR ...))`, while collecting the feeling task's suggestions: `(ask (goat activity-level) ask your value-description to combine suggestions ...)`.

**Ken's code.** combine-emotional-state-suggestions groups a task's change suggestions by `(change: (who element))` and combines each group of two or more (sugest.123:213-234). COSUG's combine for change: packages reads `(get (get s 'value) 'display)` (cosug.215:455-477). That is the older format of your comment at cosug.215:449-453. Under `(method: type display-value-change value (change: ...))` it gets nil, and calls shouldnt-happen. The change-to: combine (cosug.215:499-520) has the same slip, but here only one of the joys suggests change-to:, so it isn't reached.

**Repair.** M7. When the old display key is absent, the combine reads `(get (get s 'value) 'value)`: COSUG is handed the suggestions with the change where it reads it, all of its combine runs as written, and what it makes is recorded with the change back under value. It also puts back in a method the change that change-to:-package merges on its own (cosug.215:508-509).

**With MEND.** The two joys' changes combine. Their speeds, low and medium, are near enough by three-value-relationship (cosug.215:183-188), and so are their amounts; at equal strengths, with the film's obviousness high, Ken's compromise picks the value that isn't medium (pick-non-medium, cosug.215:836-839). So each of the goat's four changes is `amount (positive low) speed low`, and establish-task-2 notes each, for example `(revival-repair: what combined-changes was stopped now ((change: element (goat speed) amount (positive low) speed low)) because (change under value not display))`. The scene films in 11 frames, one fewer than the control, whose one joy is (positive medium).

**Control.** With one joy, (positive medium), the scene films in 12 frames.

## The controls: tortoise-and-hare and red-riding-hood

`node tools/run-story.mjs test/stories/tortoise-and-hare.lisp`
- Pass 1: 33 choices; `(choice-point-of hare activity-level) = none`.
- The Boast and The Race: FAILED in pass 2, WEIGHTIFY of none (as none-value).
- The Finish: FAILED, because no FILM2 POSIT was written. This is a knock-on of The Race; the tool says so.
- With MEND, The Boast films in 187 frames and The Race in 108, each with the gave-up note on `(choice-point-of hare activity-level)`. In The Finish, Ani doesn't know pride, so the hare's task can't be done, and the tortoise's joy is all the first subscene has for her, so SCENE plans `(wander-around tortoise)`, which M9 now defines: she wanders, and the scene films in 29 frames.

`node tools/run-story.mjs test/stories/red-riding-hood.lisp`
- Pass 1: 102 choices.
- Into the Woods: CAPPED, 1,001 frames; the scene never ends.
  - In the first subscene, the wolf pushes Red Riding Hood around (disply.311:243-328).
  - From frame 157, in the pushee-moves-away activity of the last push (disply.311:316-326), she wanders away from her stationary target and never reaches it. Her y position climbs past 1,000, a whole screen's height above the center.
  - So the four later subscenes never start, and the grandmother, whom she goes to accompany in the fifth, never comes on.
  - Her feeling makes the difference. `(joy (positive medium))` suggests change-to: path-curvature high and path-length long, and bigger changes than (positive low) does (emote.9:11-60). With `(joy (positive low))` the scene ends in 213 frames; without the feeling, in 120.
- The Wolf Waits: 90 frames. The Woodcutter Comes: 64. Together Again: 105. (At the old cap of 600 they were 86, 61 and 93: Into the Woods, cut off at frame 600 rather than 1,000, left everyone somewhere else.)
- With MEND, the film is frame for frame as in 1978 up to frame 239. The third push's moving away, frames 82 to 143, loops round her place for fifteen seconds and ends, and is left alone. In the fourth her nearest is at frame 172; M12 stops it once she has gone no nearer for longer than Ani allows for the walk along its arc (16.6 seconds), with an overdue-move note, and Into the Woods ends in 344 frames. The other three then film in 100, 56 and 156 frames, since everyone starts them from somewhere else; in Together Again she and the grandmother wait for the wolf to move, and M12 stops that too (an overdue-move note, waiting).

## Other failures found while building these

None of these is among M1 to M7. Each was seen with Ani as in 1978. MEND's second round repairs the first four (M8, M9, M11, M12), and M13 the fifth (sent-off-unseen).

1. **Two characters with nothing to compare** (pass 1, `SUMMARIZE-COMPARISON ... DOES NOT EXIST`, sumcom.53:8-10). It happens whenever two characters share no descriptor, opposite or neighbor, and their relationships to each other, if they have any, share none either. no-descriptors is one case. Another is the skeleton with the goat "shabby" instead of "beautiful": pass 1 stops on (comparison-of goat troll). The tortoise and hare without "lazy" are a third. Repaired by M8 (see no-descriptors).
2. **Feelings alone at the start of a scene** (pass 2, `WANDER-AROUND is not an actor`). When a character's only part in a scene's first subscene is a change of feeling, SCENE plans `(wander-around c)` (scene.9:216-221), and no 1978 file defines wander-around. Examples: a scene whose only task is `(establish (emotional-state troll (joy (positive low))))`; tortoise-and-hare's The Finish. PLAN.md gave wander-around a plan receiver under CHANGE; new stories needed it sooner, so it is MEND's M9 (feeling-only-first).
3. **A task Ani can't do, in a scene whose length must be adjusted** (pass 2, the JavaScript error `not a number: NIL`). The recipe is the skeleton with On the Bridge's tasks `(establish (personality troll))`, `(establish (personality goat))` and `(establish (relationship (relationship-of troll goat)))`. Good's helps and prevents find no one, so the goat's personality task is cant-do. A task asked for a different time than it was allotted, and the scene's new length fell outside its bounds (60 to 120 seconds for this film's medium scene), so Ani adjusts every task's length (chomet.123:9-22, 39-65). adjust-task-lengths skips a cant-do task and never sets its running time (chomet.123:141-157). Then the subscene's running-time demon takes `(apply 'max ...)` of its tasks' times, and one of them is NIL (scene.9:137-139). When no adjustment is needed, give-every-task-its-ideal-time gives a cant-do task 0.0 (chomet.123:95-99). That is why Cinderella's cant-do tasks never mattered. Repaired by M11 (cant-do-adjusted), which gives such a task 0.0 as Ken's own path does.
4. **A pushee who circles her target** (filming, the frame cap): red-riding-hood's Into the Woods, above. Repaired by M12, with pushee-blocked, where a bystander stands in the way, and push-mutual, where two moves of one character cancel out.
5. **A stack overflow in pass 2** (`Maximum call stack size exceeded` in INTERF's move-from-xy-position-1, interf.149:109-118). The recipe uses the skeleton plus the kid. The first scene is `(convey (alone troll kid))`, which sends off the goat although she has never been on the stage. The second is `(establish (personality troll))`, with the goat as the troll's victim. The recursion halves its step until the new place is on the stage (interf.149:113-117), and here it never ends. If the goat has been on the stage first (she accompanies the kid, then is sent off), the second scene films in 95 frames. Its cause is two characters at one place: see same-place and sent-off-unseen, below.

## M12, revised

The reviewers found that M12 as first written stopped moves that do end. It stopped a move once it had gone on for longer than Ani's most for the walk (two and a half times her estimate, place.45:524-559), counting the whole time for a move to a stationary place. Ani's estimate takes the straight distance, and Director walks along an arc that can be many times as long, so long but finite walks ran over:

- Red Riding Hood's third push (frames 82 to 143) was cut at frame 96, though in 1978 it ends; only the fourth never does.
- Hansel and Gretel's The Gingerbread House at 24 frames a second: Gretel's walk onto the stage winds for seven and a half seconds and arrives at frame 180; M12 stopped it at 173, and the scene filmed in 654 frames instead of 675.
- push-two: in 1978 every move ends and the scene films in 182 frames; M12 stopped the troll's push at frame 17, and the moves that followed never ended (the cap).

M12 now counts two things instead, each in seconds a tick at a time: the ticks in which Ken's careful step backs up to wait for someone to move (dichar.103:317-318), and the time since the mover was last nearer its destination than ever before in the move. The most is Ani's, for the distance go in arc reckons along the arc when it first asks the stop condition. The move's goal is the one go in arc gives the condition, not the character's current goal, which belongs to whichever of its moves started last. And a facing at the start of a move (action.152:296-322) that turns no nearer to its heading for three seconds, Ani's most for half a turn at medium speed, is done as if turned: push-mutual needs it, since once its endless moves are stopped two of the goat's facings cancel out the same way. Without MEND, push-mutual never ends; with it, 342 frames, with four overdue-move notes and an overdue-turn note.

Checked, with MEND: push-two frame for frame as in 1978; Into the Woods as in 1978 through frame 239 (`npm run test:no-change` checks through 172, her nearest); and Cinderella byte for byte at 4 and at 24. The three fables in `test/stories/fresh/`, each scene made as in 1978 and with MEND from the same start, at 4 frames a second and at 24: every scene ends with MEND, and every scene that Ani as in 1978 films to the end is frame for frame the same with MEND (Hansel and Gretel's Into the Forest, The Gingerbread House, The Cage and Home Again; the Ugly Duckling's The Hatching, Teased and The Swans). The others stop in 1978 (the Fox and the Crow's three scenes and the Ugly Duckling's Alone in Winter, in pass 2) or never end (Hansel and Gretel's The Escape, where M12 stops the witch's wait: 116 frames at 4 a second, 699 at 24).

## pushed-around

**What it is.** Ken's own story, the tortoise and the hare, as a model wrote it on the film page on 11 October 2026, kept as it came. The Introduction establishes both personalities, their relationships and the hare's joy; Pushed Around is `(sequence: (convey (pushes hare tortoise)) (convey (pushes hare tortoise)) (establish (emotional-state tortoise (joy (negative high)))))`, depressing, fast and medium; The Tortoise Triumphs ends it.

**Without MEND.** Pass 1 makes 33 choices, one of them `(choice-point-of hare activity-level) = none` (the lazy hare), and every scene stops in pass 2 on WEIGHTIFY of none, as none-value does. M2 reads it as medium.

**With MEND, the page said Pushed Around never ended.** It does end, on its own, at frame 799 (200 seconds), past what was then the page's cap of two and a half minutes (600 frames at 4 a second). Ken's runs stopped at 1,000, and so do the page (`CAP_SECONDS`, 250 seconds) and these tools since 12 October, so it now films to its end. Nothing in it goes on for ever:
- Ani plans it at 40.8 seconds, for a medium scene of 34 to 86. The third subscene is only the tortoise's sadness, so SCENE extends the second, the second push, by its time (extend-last-actions-of, scene.9:223-240): 26.1 seconds for a push Ani estimated at 14.7, a stretch of 1.78.
- pushes-around runs a stretched push more slowly and more times (disply.311:247-265): its special dynamics are the characters' divided by the square root of the stretch, 1.33 (a speed factor of 0.75), and seven cycles instead of five.
- Each cycle's steps set the characters' special dynamics again, and each time Director multiplies their factors by their parent's (dichar.103:27-31). With a parent's factor of 1, as in the first push, that changes nothing. With 0.75 each cycle is a quarter slower than the one before: the hare's push goes at speed factors 0.51, 0.38, 0.28, 0.21, 0.16, 0.12 and 0.09, and the cycles take 34, 53, 67, 77, 126 frames and more. The tortoise's coast, which uses the hare's dynamics (disply.311:312-313), goes the same way, and the tortoise's sadness slows it further while it lasts.
- Every move gets there, so M12 leaves them all alone: Director as in 1978, filming the same program, films it frame for frame as MEND does, 799 frames (`node tools/check-no-change.mjs pushed-around`, which plans it with MEND, since Ani as in 1978 can't, and films it both ways). With APPEAR it ends at 788. At 24 frames a second it ends at frame 5,713 (238 seconds), within the page's 250 seconds (6,000 frames at that rate).

So there is nothing for MEND to repair here: the scene ends, as Ken's code makes it, and MEND doesn't change a scene that ends on its own. What cut it short was the page's cap, since raised to Ken's 1,000 frames. The same compounding is in Ken's Cinderella, whose Introduction pushes five times (see M12).

**The Introduction** takes 136 seconds (543 frames) for a plan of 27: five pushes in 58 seconds, a chase of 65 and the hits. The hare's joy compounds the same way, raising his path curvature each cycle, and two of his pushes and a coming in contact never get there: in the third push, as in 1978, he walks off to the left of the picture from frame 52 and never comes back (Director as in 1978 films the Introduction to its 1,000 frames). M12 stops each once he has gone no nearer for longer than Ani's most for the walk along its arc, 6.1, 5.9 and 18.9 seconds, so 31 of the 136 seconds are M12's patience. The chase, subscene 2, planned at 1.2 seconds, is the hare winding round the tortoise for 65 seconds; it ends on its own, and M12 leaves it. The Introduction is long for a medium scene, but every part of it is either Ken's, ending on its own, or the least M12 can wait without stopping walks that end (Red Riding Hood's third push went fourteen seconds between its nearest approaches; see M12, revised).

**Expected.** With MEND, Pushed Around films in 799 frames, and with MEND and APPEAR in 788 (The Tortoise Triumphs, starting from where it ends, in 63). At the old cap of 600 check-stress recorded it as capped, the one scene here that ended only after that cap.

## same-place and sent-off-unseen

**Where two characters stand at one place.** ANINIT's save-positions writes every character's place into the POSIT file the next scene starts from (aninit.65:158-175), and a character who was never shown in the scene is at the picture's center, 0.0 0.0. Ken's Cinderella has one such: the fairy godmother, at the center after the Introduction and Kept Apart. A new story can have two or more, and the next scene then starts them at the same place.

**What stops.** INTERF reckons a place a distance from one place towards (or away from) another "based on equivalent triangles": the fraction of the way to go is the distance over the distance between them (move-from-xy-position, interf.149:89-106). Contact with someone (interf.149:291-305), and every place a distance towards or away from someone, comes to it. Between two characters at one place, that is a division by zero, and here it is not a number (the revival's flonums are JavaScript's, and print as 0.0):
- **same-place.** A shy owl's story as a model wrote it on the film page, cut to its first two scenes. The fox and the rabbit are in no task of Alone in the Tree, so both start The Games at the center, and the fox goes to the rabbit to accompany her (goes-to-and-accompanys, disply.311:186-233). Director faces the fox towards a place that is not a number, and its turtle, drawing the fox, steps along a line whose end it never reaches (src/tv/turtle.js's nearly-vertical vector, counting to a row that is not a number). The film hangs before its first frame, so neither M12 nor the frame cap can stop it, and the page's worker freezes. Director as in 1978 hangs the same way on the same program. Ani as in 1978 doesn't get there with this story: pass 1 stops first, as the owl and the fox have nothing to compare (M8).
- **sent-off-unseen.** The skeleton's troll and kid are alone, which sends off the goat although she has never been on the stage, and no one is shown; then the troll shows he is mean, with the goat as his victim. Placing her a distance away from him at the same place, Ani keeps the place on the stage by halving a step until it is (move-from-xy-position-1, interf.149:109-118), and a step that is not a number never is: pass 2 overflows the stack. This is the fifth of the other failures above.

On the PDP-10 there is no such number, and what MacLisp did with a flonum divided by zero can't be run now; whatever it was, Ani could not have gone on for ever on it.

**The repair, M13.** Ken wrote the way he wanted it first, with the turtle, and kept it as a comment because he couldn't load the turtle into Ani (interf.149:79-87): put the turtle at the first place, set its heading to the bearing of the second, and go forward the distance. The turtle's bearing of the place it stands on is 0 (TVRTLE's BEARING), straight up. So from a place towards the same place M13 goes the distance straight up, away from it straight down, and for contact, whose distance is no more than the distance between them, takes the place itself; Ken's move-from-xy-position-1 keeps it on the stage as it keeps any other. It notes `(revival-repair: what same-place was (from (vicinity-of rabbit) towards (vicinity-of fox)) now (xy-position 0.0 0.0) because (both at (xy-position 0.0 0.0)))`, on the subscene Ani was reckoning for or, in Director, which reckons with no subscene, on the movie.

Two stories a model wrote on 11 October (reports/llm-trials/2026-10-11 gpt-6.1-sol/), the Fox and the Crow and Goldilocks, hung the same way: their Introductions show no one (every task there can't be done), so the next scene starts everyone at the center, and a meeting (MEND5's move-to) is contact with someone at the same place. With M13 every scene of both films.

**With MEND.** same-place films The Games in 21 frames: the fox is in contact with the rabbit at once, where they both stand, turns to set off with her, and has gone a few steps when the scene ends. sent-off-unseen films On the Bridge in 4. Nowhere else does M13 act: every other stress story, control and fable, and Ken's Cinderella at 4 and 24 frames a second, come out as before.

**A step that is not a number.** Open item 5 above, and a model's The Gingerbread Man (running-away, where the gingerbread man and his pursuer both start at the center), overflowed the stack halving a step that is not a number. Both come from two characters at one place, and both film with M13. M13 also keeps the halving from going on for ever however such a step comes: a step that is not a number (or is infinite) can't be halved onto the stage, and the place stays where it was, as Ken's own last case keeps a place it can't move ("otherwise dont move at all", interf.149:118), with a note `(revival-repair: what no-step was (not-a-number) now <the place> because (halving never brings it on the stage))`. No story here reaches it now that two characters at one place are reckoned as Ken's turtle would.

**What it doesn't change.** A character never shown still starts the next scene at the picture's center, as Ken's POSIT files have the fairy godmother; one named only in an earlier `(alone X Y)` stands there visibly if a method shows her where she is. M13 only lets Ani reckon from there when someone else stands there too. Changing where such a character starts would change Ken's Cinderella (her POSIT files), so it isn't MEND's.

## fence and guard-self

**What makes-fence is.** To show that someone prevents two others meeting, CONVEY asks what would undo one's being able to move to the other, and can-move suggests three ways (prereq.19:82-107): make a fence between them, stand guard, or kill. DISPLY defines makes-fence as a display method, with the prerequisites (can-move ...) and (pen-down-for ...), the second "dummy too" (prereq.19:64), and an estimate that "should really be lots smarter but ok for now" (disply.311:18-25); it never gives it a run receiver. The thesis says what it would be: the one who makes it "moves leaving behind her a trail that Cinderella is unable to cross", and in your Kept Apart "the 'stands guard' method was chosen over the 'makes fence' method because of a better time fit ... Besides having a better time fit the 'stands guard' method was more successful in determining that its prerequisites were met."

**fence.** The skeleton, with the kid keeping the troll from meeting the goat. The kid isn't faster than the troll, so stands-guard's prerequisite (faster kid troll) fails, and makes-fence scores best. When the subscene runs its methods, Director has no way to run it: pass 2 stops with `BAD-MESSAGE`, "(RUN MAKES-FENCE KID (BETWEEN (VICINITY-OF TROLL) (VICINITY-OF GOAT)) IN (SUBSCENE-OF ON-THE-BRIDGE 1) STRETCHED BY 1.5) is not understood". Five of the fifteen stories a model wrote on 11 October stop there (Red Riding Hood, Hansel and Gretel, the Three Little Pigs, the Boy Who Cried Wolf, Romeo and Juliet).

**M14 sets it aside rather than making it.** Nothing of DISPLY's or Director's leaves a trail: each frame is wiped and every character drawn afresh, and no walk is stopped by a line. Making a fence would be the revival's invention, not Ken's parts put together as M5's move-to and M9's wander-around are. What Ken's code and the thesis do give is the choice among the three ways, the one his film makes. So once Ken's scores are made, if the one Ani would choose (weighed as choose-a-display-method weighs them, chomet.123:216-255) is makes-fence, M14 rejects it with Ken's reject-suggestion, the reason (no-run-receiver makes-fence), notes it, and scores the rest again as if it had never been suggested. In Cinderella makes-fence is suggested in Kept Apart but not the best, so nothing changes. In fence there is nothing else that can show it (stands-guard's prerequisite failed, and Ani has no idea how to kill), so the prevention is left undone and On the Bridge films in 2 frames; in the five model stories Ani chooses stands guard.

**guard-self.** The troll keeps the goat from meeting him, `(prevents troll (meets goat troll))`, and stands guard, the place guarded being away from himself. Two more of Ken's gaps follow:
- stands-guard has a third character walk across while the guard works, if there is one with nothing to do (move-place-being-guarded-if-can, disply.311:519-531; the Prince in Kept Apart), and adds that walk to the subscene's movements whether there is one or not (disply.311:434-439). Here there is none, and Director, asked to run nil, stops: `BAD-MESSAGE`, "(RUN NIL THEN REMOVE NIL FROM YOUR LIST OF ACTIONS-STILL-RUNNING-...) is not understood". M14 takes the nil out of the movements once stands-guard has run, with a note (nothing-to-run).
- The goat's escape goes away from the guarded place's goal, and the troll's return to near the goat's goal (plan-stands-guard-cycle, disply.311:459-516). With the place away from the troll himself, the goat's goal is the troll's (interf.149:383-385) and the troll's is reckoned from the goat's, and Director, finding either, finds the other for ever: the stack overflows while filming. Ken saw a goal that leads to its own character and stopped it ("so I dont loop", interf.149:262-264); M15 stops one that leads back by way of another the same way, taking the character's own place the second time round, with a note (goal-loop).

With MEND, guard-self films On the Bridge in 146 frames. The Boy Who Cried Wolf meets all three once its fence is set aside, and films every scene.

## KNOW's stories: know-words, know-feelings and know-ways

Three stories use every piece of KNOW, the knowledge you could have added (`reports/ext/know/README.md`), on the skeleton's lines. In 1978 none of them films, and with MEND alone each films what is left once KNOW's words, feelings and ways of showing are taken out. With the page's set (`with-know`), each films every scene.

- **know-words.** Every character is described only with KNOW's words: an old, gentle, timid hen; a rough, cruel, brave fox who hates her; a young, curious, playful, clever chick. In 1978 pass 1 stops: the hen and the chick have no word in common to compare them by (M8). With MEND alone the scene shows nothing: every word is unknown (eight unknown-word notes). With KNOW, timid borrows shy's avoiding a stranger (the hen moves away from the chick, moves-away-from), cruel borrows mean's chasing and hurting (with brave's chasing, the fox chases and hits the hen, who is brought on), and curious meets a stranger (the chick goes to the fox, MEND5's move-to): 72 frames.
- **know-feelings.** On the Bridge: the troll is proud, with no joy, so nothing but pride loads EMOTE (its tags entry); the goat is sad and afraid, and joy's speed and acceleration changes conflict with fear's, so neither is made (MEND7's notes). After: the troll is angry, the goat lonely and, as you wrote your pre-meeting scene, anticipating, with plain levels; loneliness's lower activity conflicts with anticipation's higher. In 1978 pass 2 stops on wander-around, which a scene of feelings alone asks for (M9). With MEND alone, joy is shown and the rest passed over: 53 and 2 frames. With KNOW: 58 and 17.
- **know-ways.** By the Pond: the duckling is obedient to his mother and likes her, and she is helpful towards him; she helps him along, he follows her and he accompanies her (likes' weaker way). The Cat Comes: the duckling fears the cat and the cat dislikes him, and each moves away from the other. In 1978 pass 1 stops on comparing the duckling and the cat (M8). With MEND alone neither scene has anything to show (2 frames each). With KNOW: 198 and 59 frames. The duckling, running off, first turns at his own slow rotational speed, which is why his moving away takes most of the scene. (Running off goes regardless of anyone in the way, as your exit-by does: an earlier version, careful of collisions, had the duckling wait for his mother, who stood where he was going, until M12 stopped him.)

With the page's set, every other story here, both controls and the three fresh fables also film every scene, each under the cap.
