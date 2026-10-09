# Stress stories for MEND

Eight small film descriptions, each written to meet one failure that Ani as in 1978 runs into with a new story. They are the test bed for MEND, the revival's repairs (`reports/chapter-x/PLAN.md`, "Item 4, part 1: MEND", repairs M1 to M7). Each one is in the form of your CINDY (`original/7005017/cindy.46`), uses only words Ani knows apart from the one it is testing, and has a single scene.

Run one with:

```
node tools/run-story.mjs test/stories/stress/<name>.lisp                    # Ani as in 1978
node tools/run-story.mjs test/stories/stress/<name>.lisp --extensions mend  # with the repairs
```

`tools/run-story.mjs` makes the film as the page's "Make the film" does (`src/pipeline.js` makeFilm, keepGoing, at most 600 frames a scene at 4 frames a second). For pass 1 and each scene it prints ok, FAILED or CAPPED (the scene hit the 600-frame cap, so it never ended), the frames filmed, what Ani planned for each task, the error, the last thing Lisp typed (which names the missing actor for NO-SUCH-ACTOR), and the start of Lisp's backtrace. A failed step is run a second time with the backtrace on, because makeFilm runs without one, as the page does. Pass 1's choices that pass 2 can't use, (not X) and none, are listed. Repair notes in a glass box's `repairs` are printed. `--out file.json` writes all of this as JSON. The tool exits with 1 if anything failed or never ended.

The observations below were made on 9 October 2026, with no extensions. MEND's files were still placeholders then, and `--extensions mend` gave the same results. Most of the stories are built on one skeleton: a goat (beautiful; good, kind) and a troll (ugly, physically strong; mean, strong) who dominates and hates her. In the scene On the Bridge the troll shows he is mean, by chasing and hitting her, and she is sad. As it stands, that skeleton films in 11 frames. Each story changes one thing. Its control is the same story with that one thing taken out, run the same way. The controls are not committed; each section says what its control changed.

| Story | Fails in | Error | Ken's code | Repair |
|---|---|---|---|---|
| not-high | pass 2 | `shouldnt happen (WEIGHTIFY ((NOT HIGH) ...))` | cosug.215:395-402, interf.149:899-904 | M1, M2 |
| none-value | pass 2 | `shouldnt happen (WEIGHTIFY (NONE ...))` | choose.198:61-73, interf.149:899-904 | M2 |
| unknown-word | pass 2 | `break NO-SUCH-ACTOR` (GRUMPY) | sugest.123:54-66 | M3 |
| missing-relationships | pass 2 | `break NO-SUCH-ACTOR` ((RELATIONSHIP-OF GOAT TROLL)) | sugest.123:357-370, prereq.19:57-60, 110-120 | M4 |
| meets-alone | pass 2 | `break NO-SUCH-ACTOR` (MOVE-TO) | convey.64:73-80, chomet.123:436-439 | M5 |
| offstage-victim | filming | no error; the chase and the hits happen off the picture | sugest.123:373-395, place.45:137-141 | M6 |
| no-descriptors | pass 1 | `shouldnt happen (SUMMARIZE-COMPARISON ((COMPARISON-OF GOAT KID) DOES NOT EXIST))` | compar.69:16-26, 106-119, sumcom.53:8-10 | none of M1-M7 |
| joy-plus-feeling | pass 2 | `shouldnt happen (CHANGE:-PACKAGE (BAD CHANGE: PACKAGE IN EITHER ...))` | sugest.123:213-234, cosug.215:449-477 | M7 |

Two of the eight don't behave as the plan expected. offstage-victim never hits the frame cap, and no-descriptors fails in pass 1 for a reason none of M1 to M7 repairs. Both are explained in their sections below. Five more failures turned up while building these; they are listed at the end.

## not-high

**What it does.** This is PLAN.md's defiant Cinderella, cut down to the Introduction. Cinderella is determined, stubborn and strong; she hates the stepmother and is impolite to and intolerant of her. The stepmother is as you wrote her, and so is the Prince, who is in no scene. The Introduction establishes the stepmother's personality and Cinderella's sadness.

**Observed.** Pass 1 makes 59 choices, one of them `(choice-point-of step-mother repetiveness) = (not high)`. Pass 2 of the Introduction stops: `shouldnt happen (WEIGHTIFY ((NOT HIGH) IS NOT LOW SHORT MEDIUM LONG OR HIGH))`. It stops while estimating the time of the stepmother's hurts and chases methods: `(ask special-dynamics yield your repetiveness value)`.

**Ken's code.** When two of an element's three values are left, COSUG's absolute-three-value answers `(not X)` (cosug.215:395-402). Pass 1 records it as it stands, and (not X) is a value your representation means to allow (elemnt.1:24-26, 145-146). Special dynamics read the value through weightify (interf.149:845-847), which knows only low, short, medium, long and high (interf.149:899-904). The Prince is needed: without him, pass 1 makes no (not X).

**Repair.** M1 narrows each (not X) to one of the two values left, in pass 2, using GLOSUG's pick-value-with-variety. M2's weightify guard maps any (not X) still left to medium.

**With MEND.** Pass 1 and its CP still say (not high). Pass 2 narrows the value to low or medium, notes `(revival-repair: what narrowed was (not high) now ...)` on the choice point, and films the Introduction. With a scratch stand-in that reads (not X) as medium, it films in 120 frames.

**Control.** Without the Prince, pass 1 makes 32 choices with no (not X), and the Introduction films in 128 frames.

## none-value

**What it does.** The hare and the tortoise from `test/stories/tortoise-and-hare.lisp`, described as they are there, in The Boast: the hare's personality and the tortoise's sadness.

**Observed.** Pass 1 makes 33 choices, one of them `(choice-point-of hare activity-level) = none`. Pass 2 of The Boast stops: `shouldnt happen (WEIGHTIFY (NONE IS NOT LOW SHORT MEDIUM LONG OR HIGH))`, while estimating the time of the hare's methods: `(ask special-dynamics yield your activity-level value)`.

**Ken's code.** When no suggestion is left, decide-since-no-more-suggestions records none with source given-up (choose.198:61-73). You meant it: there is no last-ditch default for an element like typical speed (choose.198:290-294). Weightify then refuses none (interf.149:899-904).

**Repair.** M2. A none value reads as medium in pass 2, as INTERF already reads an element that was never set (interf.149:846).

**With MEND.** The CP keeps none. Pass 2 reads the value as medium and notes `(revival-repair: what gave-up was none now medium ...)`. The Boast films. With a scratch stand-in for M2, it films in 187 frames.

**Control.** Taking out "lazy" doesn't give a working control. Without it, the hare and the tortoise have nothing left to compare, and pass 1 stops in COMPAR (see no-descriptors). So the control is the stand-in run above.

## unknown-word

**What it does.** The skeleton, with the troll grumpy as well as mean and strong. Grumpy is a word Ani doesn't know.

**Observed.** Pass 1 makes the same 33 choices, in the same order, as without grumpy. Pass 2 stops: `break NO-SUCH-ACTOR`. Lisp typed `GRUMPY is not an actor`, while collecting the troll's personality suggestions: `(ask grumpy collect items memorized matching (suggestion: element (establish troll grumpy) ...))`.

**Ken's code.** establish-personality-suggestions asks every descriptor of the character for its suggestions (sugest.123:54-66). For a feeling it doesn't know, Ani asks with ask-if-exists and passes over it (sugest.123:38). For a personality word, it doesn't check.

**Repair.** M3. A word Ani doesn't know is skipped and named in a note on the task.

**With MEND.** The troll's personality is shown by mean alone, as in the control, and the task carries an unknown-word note naming grumpy. A scratch stand-in that skips unknown words films it in 11 frames.

**Control.** Without grumpy, the scene films in 11 frames: the troll chases and hits the goat.

## missing-relationships

**What it does.** The goat is good and friendly. She and her kid love each other, and the kid and the troll are polite to each other. There is no relationship between the goat and the troll, in either direction. The scene establishes the goat's personality.

**Observed.** Pass 1 makes 63 choices. Pass 2 stops: `break NO-SUCH-ACTOR`. Lisp typed `(RELATIONSHIP-OF GOAT TROLL) is not an actor`. Looking for the goat's friend, Ani asks the likes prerequisite about the troll, and likes asks the missing relationship for its description.

**Ken's code.** For friendly's helps and accompanys, friend-of goes through the character's siblings in turn, asking `(status-of (likes a b))` of each (sugest.123:357-370). Siblings come most recently defined first, so the troll is asked before the kid. The likes demon asks meet-description-of about `(relationship-of a b)` (prereq.19:110-120), and meet-description-of asks that actor without checking that it exists (prereq.19:57-60). enemy-of and stranger-of do check (sugest.123:352-353, 385-394).

**Repair.** M4. An exists? guard goes in meet-description-of, so a missing relationship answers dont-know. Its note is written only once, because likes asks up to four times.

**With MEND.** The troll is passed over with a missing-relationship note. The scan goes on to the kid, whom the goat loves, and the goat accompanies her kid, as in the control.

**Control.** With the goat and the troll polite to each other, the goat accompanies her kid (her helps is canceled, as Cinderella's was), and the scene films in 41 frames.

## meets-alone

**What it does.** The skeleton's scene becomes `(convey (meets goat troll))`, with the goat cheerful (joy, positive low).

**Observed.** Pass 1 makes 33 choices. Pass 2 stops: `break NO-SUCH-ACTOR`. Lisp typed `MOVE-TO is not an actor`, while the scene's convey tasks choose their values: `(ask move-to recall your tasks-used-in)`.

**Ken's code.** CONVEY shows `(meets a b)` with the display method `(move-to a (vicinity-of b))` (convey.64:73-80), and DISPLY never defines move-to. variety-score asks the method for the tasks it was used in (chomet.123:436-439). get-estimated-time-of does check exists? first (chomet.123:450), but variety-score doesn't.

**Repair.** M5. A suggested display method that doesn't exist is rejected with the reason no-such-display-method, and MEND defines move-to from DISPLY's own parts.

**With MEND.** The goat walks to the troll and stops there. The scene films and ends.

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

**Repair.** M6. (a) Ani looks first among the characters named in the scene's tasks. Here the troll hates no one in the scene, so the 1978 pick stands. (b) A victim of move-to-and-hits, chases-to or pushes-around who starts the subscene off the stage is first brought on, with getting-on-stage, and that walk is counted in the time estimate.

**With MEND.** The goat walks onto the stage near the troll before the chase, and the subscene notes brought-on-stage. The chase and the hits take place on the picture, and the scene still ends.

**Control.** With the troll walking the goat over the bridge instead of the kid, both are on the stage throughout, and the scene films in 38 frames.

## no-descriptors

**What it does.** The skeleton plus the kid, defined as `(define kid character)`, with no descriptors at all. Every pair of characters is related, as the page's prompt asks. The goat is protective of the kid, the kid is grateful to her, and the kid and the troll are polite to each other.

**Observed.** Pass 1 stops: `shouldnt happen (SUMMARIZE-COMPARISON ((COMPARISON-OF GOAT KID) DOES NOT EXIST))`. This happens while choosing values, when Ani compares the goat with her siblings (`(ask goat compare yourself with kid)`).

**Ken's code.** compare-two-characters records each finding (the same descriptor, opposites, neighbors) on `(comparison-of a b)`, and record-comparison makes that actor only when there is something to record (compar.69:16-26, 106-119). summarize-comparison then calls shouldnt-happen if the actor doesn't exist (sumcom.53:8-10). It is reached from find-relative-choice-points (choose.198:184-198). Relationships count only when the two directions share a word, or have opposite or neighboring words (compar.69:29-38). So the kid and the troll, polite to each other both ways, compare. The kid and the goat, with protective-of on one side and grateful-to on the other, don't.

**What the plan expected, and why it doesn't happen.** The design expected Ani to give up (none) on a character with no descriptors, which M2 would read as medium. She doesn't give up. With mirrored relationships (the control), pass 1 gives the kid a value for every element, from variety, with every relative choice different-from, and the scene films.

**Repair.** None of M1 to M7 reaches this, because it is in pass 1. A further repair is needed: when two characters have nothing to compare, summarize-comparison should go on with an empty comparison (make `(comparison-of a b)` with no findings) instead of stopping. Cinderella never reaches it, since every pair in CINDY shares a word.

**With MEND (as planned now).** It still stops in pass 1, as above.

**Control.** With the kid protective of the goat too, so that the relationships mirror, pass 1 makes 63 choices and the scene films in 128 frames.

## joy-plus-feeling

**What it does.** The skeleton, with the goat feeling `(and (joy (positive low)) (joy (positive medium)))`. In 1978 Ani knows one feeling, joy (emote.9), so the second feeling is joy again. Your Kept Apart gives the stepmother `(and (joy (positive medium)) (pride (positive medium)))` (cindy.46:71-72), and Ani passes over pride because she doesn't know it. Once KNOW teaches her pride, Kept Apart takes this same path.

**Observed.** Pass 1 makes 33 choices. Pass 2 stops: `shouldnt happen (CHANGE:-PACKAGE (BAD CHANGE: PACKAGE IN EITHER (SUGGESTION: ELEMENT (ESTABLISH (EMOTIONAL-STATE GOAT (JOY (POSITIVE LOW)))) ...) OR ...))`, while collecting the feeling task's suggestions: `(ask (goat activity-level) ask your value-description to combine suggestions ...)`.

**Ken's code.** combine-emotional-state-suggestions groups a task's change suggestions by `(change: (who element))` and combines each group of two or more (sugest.123:213-234). COSUG's combine for change: packages reads `(get (get s 'value) 'display)` (cosug.215:455-477). That is the older format of your comment at cosug.215:449-453. Under `(method: type display-value-change value (change: ...))` it gets nil, and calls shouldnt-happen. The change-to: combine (cosug.215:499-520) has the same slip, but here only one of the joys suggests change-to:, so it isn't reached.

**Repair.** M7. When the old display key is absent, the combine reads `(get (get s 'value) 'value)`.

**With MEND.** The two joys' changes should combine. Their speeds, low and medium, are near enough by three-value-relationship (cosug.215:183-188), and so are their amounts. The scene should then film like the control.

**Control.** With one joy, (positive medium), the scene films in 12 frames.

## The controls: tortoise-and-hare and red-riding-hood

`node tools/run-story.mjs test/stories/tortoise-and-hare.lisp`
- Pass 1: 33 choices; `(choice-point-of hare activity-level) = none`.
- The Boast and The Race: FAILED in pass 2, WEIGHTIFY of none (as none-value).
- The Finish: FAILED, because no FILM2 POSIT was written. This is a knock-on of The Race; the tool says so.
- With a scratch stand-in for M2, The Boast films in 187 frames and The Race in 108. The Finish then stops on a different failure, `WANDER-AROUND is not an actor` (see "Feelings alone" below). So M1 to M7 will not take this story to the end.

`node tools/run-story.mjs test/stories/red-riding-hood.lisp`
- Pass 1: 102 choices.
- Into the Woods: CAPPED, 601 frames; the scene never ends.
  - In the first subscene, the wolf pushes Red Riding Hood around (disply.311:243-328).
  - From frame 157, in the pushee-moves-away activity of the last push (disply.311:316-326), she wanders away from her stationary target and never reaches it. Her y position climbs past 1,000, a whole screen's height above the center.
  - So the four later subscenes never start, and the grandmother, whom she goes to accompany in the fifth, never comes on.
  - Her feeling makes the difference. `(joy (positive medium))` suggests change-to: path-curvature high and path-length long, and bigger changes than (positive low) does (emote.9:11-60). With `(joy (positive low))` the scene ends in 213 frames; without the feeling, in 120.
- The Wolf Waits: 86 frames. The Woodcutter Comes: 61. Together Again: 93.

## Other failures found while building these

None of these is among M1 to M7. Each was seen with Ani as in 1978.

1. **Two characters with nothing to compare** (pass 1, `SUMMARIZE-COMPARISON ... DOES NOT EXIST`, sumcom.53:8-10). It happens whenever two characters share no descriptor, opposite or neighbor, and their relationships to each other, if they have any, share none either. no-descriptors is one case. Another is the skeleton with the goat "shabby" instead of "beautiful": pass 1 stops on (comparison-of goat troll). The tortoise and hare without "lazy" are a third.
2. **Feelings alone at the start of a scene** (pass 2, `WANDER-AROUND is not an actor`). When a character's only part in a scene's first subscene is a change of feeling, SCENE plans `(wander-around c)` (scene.9:199-218), and no 1978 file defines wander-around. Examples: a scene whose only task is `(establish (emotional-state troll (joy (positive low))))`; tortoise-and-hare's The Finish. PLAN.md gives wander-around a plan receiver under CHANGE; new stories need it sooner.
3. **A task Ani can't do, in a scene whose length must be adjusted** (pass 2, the JavaScript error `not a number: NIL`). The recipe is the skeleton with On the Bridge's tasks `(establish (personality troll))`, `(establish (personality goat))` and `(establish (relationship (relationship-of troll goat)))`. Good's helps and prevents find no one, so the goat's personality task is cant-do. A task asked for a different time than it was allotted, and the scene's new length fell outside its bounds (60 to 120 seconds for this film's medium scene), so Ani adjusts every task's length (chomet.123:9-22, 39-65). adjust-task-lengths skips a cant-do task and never sets its running time (chomet.123:141-157). Then the subscene's running-time demon takes `(apply 'max ...)` of its tasks' times, and one of them is NIL (scene.9:137-139). When no adjustment is needed, give-every-task-its-ideal-time gives a cant-do task 0.0 (chomet.123:95-99). That is why Cinderella's cant-do tasks never mattered.
4. **A pushee who circles her target** (filming, the frame cap): red-riding-hood's Into the Woods, above.
5. **A stack overflow in pass 2** (`Maximum call stack size exceeded` in INTERF's move-from-xy-position-1, interf.149:109-118). The recipe uses the skeleton plus the kid. The first scene is `(convey (alone troll kid))`, which sends off the goat although she has never been on the stage. The second is `(establish (personality troll))`, with the goat as the troll's victim. The recursion halves its step until the new place is on the stage (interf.149:113-117), and here it never ends. If the goat has been on the stage first (she accompanies the kid, then is sent off), the second scene films in 95 frames.
