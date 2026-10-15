# Cinderella with SLIPS: corrections of slips in your files

SLIPS (stage 7 of [Phase 9](../../chapter-x/PLAN.md), "Item 4, part 2: KNOW, SLIPS and DETAIL") corrects slips in your files: places where your code does something other than what the code beside it, your comments or your thesis say it is to do. Unlike MEND's repairs, which leave your Cinderella byte for byte as it was, these change it, so SLIPS is a switch of its own, off by default (your decision 2: "Each correction quotes the line it corrects and comes with a written Cinderella diff; the DICHAR/DISPLY speed inversion goes in only if a run confirms it"). The site opens in 1978 mode, and the page's switch turns on MEND, KNOW, APPEAR and CHANGE; SLIPS is opt-in (decision 3). The files are `src/director/revive/slips.lisp` (REVIVE;SLIPS: what SLIPS is, the corrections, and what it leaves alone) and SLIPS1, 2, 3, 6, 7, 8 and 9, one for each correction or group. SLIPS requires KNOW (and MEND, which KNOW requires): S1 has good's helping find someone to help, and without KNOW's way of showing helping (helps-along) the helping is chosen and dropped, "no idea how to convey" it (`sugcon.26:69-74`). So every diff below is against your Cinderella with KNOW (`reports/ext/know/`); KNOW's README says how that differs from 1978.

These are the files your Cinderella makes with SLIPS (with MEND and KNOW), chained scene to scene as the film page makes them, at 4 frames a second here and at 24 in `24fps/`. `node tools/check-ext.mjs --extensions slips` checks that a run still makes them (and `--fps 24`, about twenty-five minutes); `--save` makes them again. `node tools/check-slips.mjs` runs the speed inversion's check and makes the film with each correction alone (the others turned off with `:slips-off`), then with all of them, each beside KNOW's, and checks the results against `speed.json` and `each.json` (about fifty minutes; `--save` writes them). `npm test` runs `test/slips.test.js`, which checks each correction on its own against your line and that each can be turned off, and `npm run test:stress` makes `test/stories/stress/slips-good-helps.lisp` and `slips-variety.lisp`, and every other stress story, with all six extensions.

| File | What it is |
|---|---|
| `ken-<fn1>.<fn2>`, `ken1-<fn1>.mini`, `ken1-<fn1>.print` | Each scene's program, summary and printout (pass 2), chained |
| `<scene>.glass.json` | Each scene's glass box |
| `<scene>.film.json` | Each scene's film |
| `ken1-<movie>.posit` | Where each scene's filming left the characters |
| `pass1-tendencies.json` | Pass 1's three choice points that S3 changes, with their reasons |
| `from-1978/` | The Introduction's pass 2, planned from where your 1978 film left the characters, to set beside KNOW's `from-1978/` (the other four are KNOW's, or 1978's, there) |
| `24fps/` | The chained film at 24 frames a second |
| `speed.json` | The run that confirms the speed inversion (`tools/check-slips.mjs --speed`) |
| `each.json` | Each correction alone, and all of them, beside KNOW's (`tools/check-slips.mjs --each`) |

## The corrections

Each correction leaves a note where it acted (below, "The glass box"), and each can be turned off on its own, `(setq :slips-off '(s9 s10))` before your files load, for the diff of one at a time. The frames are at 4 frames a second, with the one correction alone beside KNOW's 225, 116, 17, 179 and 84 (`each.json`).

### S1 and S2: is-not looks in the task's scene; is-described-as is a preference (REVIVE;SLIPS1)

Your line. is-not, "any sibling who meets the extra-conditions" (`sugest.123:319`), takes the first sibling who is part of the scene:

```lisp
  (cond ((and (ask ,sibling recall if any items match
		   (scene-participation: scene ,scene
					 task ?)) ;;is part of the scene      (sugest.123:333-335)
```

SCENE memorizes a character's part with the scene itself (`scene.9:463-465`), but the scene is-not is given is the task: an establish task asks for its suggestions with itself as the scene, `(establish-suggestions (ask :self recall your task) :self)` (`scene.9:380`), and SUGEST hands it on to the generator (`sugest.123:15-25, 91-92, 261-283`). So the test never matched, and is-not always answered `(no such character exists)`: good's helping, friendly's giving and selfish's requesting found no one, in your Cinderella or any story. The correction gives is-not the task's scene.

And S2. good asks for `(is-not ,character (is-described-as (weak good)))` (`dscrp.17:140-145`), and is-not applies the condition's first word to the sibling; but is-described-as is the name of a generator actor (`sugest.123:402`), not a function, so S1 alone would stop pass 2. Your thesis says what the condition is: "That other character should ideally be described as weak and good", and "it will be satisfied with a character that is neither weak nor good, if need be" (p. 100, L2757-2759 and its footnote, L2768-2770). So is-not prefers someone in the scene described by all of the words, then by any, then anyone.

What S1 newly reaches, and the correction handles: friendly's giving binds a present inside the binding of the other (`dscrp.17:117-126`), which your instantiation, one bind deep (`sugest.123:244-255`), can't do ("PRESENT unbound variable"): a bind inside a bind is now bound in turn. And the present is asked of is-desired-by, which no file defines (NO-SUCH-ACTOR): a generator that doesn't exist comes up with no value, as one that knows nothing does, and "the suggestion is ignored" (p. 100, L2760-2761), with a note, `no-such-generator`. selfish's requesting then finds the other and asks is-described-as for something valuable, which knows nothing: given up with your warning, as hard-working's (is-described-as (difficult)) was in 1978.

**In your Cinderella.** The Introduction establishes Cinderella's personality with the stepmother taking part. good's helping prefers someone weak and good, and failing that either, and failing that anyone: the stepmother, who is neither (`described-as-preferred`, `(step-mother anyone)`). Your find-related-suggestions relates two convey suggestions by their verb and their first character (`convey-relationship`, `sugest.123:162-177`), so good's helping the stepmother and friendly's helping the Prince are "identical", and only the first, good's, is a convey task (`sugest.123:98-139, 204-210`): **Cinderella helps her stepmother, not the Prince** (helps-along, in the fifth subscene, 12.5 seconds, stretched by 0.57). Her accompanying the Prince is as before, and brings him on in the sixth. friendly's giving finds the stepmother and then no present; selfish's requesting finds Cinderella and then nothing valuable. Alone, S1 makes the Introduction 243 frames (KNOW's 225), the films differing from frame 146, where the helping begins; the other four scenes are KNOW's. Pass 1 is untouched.

### S12: a high variety picks the least used value (REVIVE;SLIPS2)

Your line: "if variety level is high it picks the least chosen value or the first one if a tie", and then `(second (first (sortcar count-value-pairs '>)))`, which puts the most chosen first (`glosug.41:61-70`); and low the other way. The thesis: "if the variety level is high pick the least used value for that element, if it is low pick the most used value" (p. 85, L2384-2387). The correction sorts the other way for high and low; medium is yours. **In your Cinderella nothing differs**: its level of variety is medium (`cindy.46:157`), and no stress story had another until `slips-variety.lisp`, whose high variety now picks as the thesis says (notes `variety-pick`).

### S3: friendly's tendencies named as the elements are (REVIVE;SLIPS3)

Your lines: `(for attraction-to-friends (positive high) strength high)`, `(for attraction-to-strangers (positive medium) strength medium)`, `(for attraction-to-enemies (positive low) strength low)` (`dscrp.17:106-108`). ELEMNT's elements are attraction-towards-friends, -strangers and -enemies (`elemnt.1:101-105`), and shy, kind and mean name them so (`dscrp.17:65-67, 210-211, 249-251`); no element is named attraction-to-friends, so pass 1 never asked friendly, and a friendly character's tendencies were chosen as if she weren't. The correction gives friendly the same three under the elements' names.

**In your Cinderella**, who is friendly (`cindy.46:10`), her three tendencies are chosen as in 1978, and KEN;CP 30 is CP 29 byte for byte; what changes is what the three choice points hear (`pass1-tendencies.json`). Towards friends, friendly's (positive high) joins kind's (borrowed through good) and wins as before, over the variety level's (negative high) and shy's (positive low); towards strangers, friendly's (positive medium) joins kind's and loses to shy's (negative high), now as not compatible with the others; towards enemies, where shy's (negative medium) stood alone, friendly's (positive low) loses to it, much less strongly suggested. Each of the three has a `friendly-attraction` note. Nothing after pass 1 reads a tendency (with DETAIL the best-when scores do), so pass 2 and the films are KNOW's.

### S4 and S5, left alone

- **S4.** Your CINDY's is-protective-of (`cindy.46:38`), which RELATE doesn't know, is a neighbor of RELATE's is-protective-to (`relate.22:100`): your decision 10 made this KNOW's knowledge, so it is there whenever SLIPS is, and SLIPS adds nothing to it.
- **S5, parenthesis slips that change nothing until the knowledge they need is added**, documented with their corrected forms in REVIVE;SLIPS: good's prevents (`dscrp.17:146-150`) and selfish's takes (`dscrp.17:189-194`) are second bindings with an empty body (their generators, is-considered-bad-by and not-owned-by, know nothing, `sugest.123:400-406`, so the corrected forms would find nothing either); alone's and aware's strength and source sit inside method: (`convey.64:236-243, 247-256`), so the suggestion has neither (each is its task's only suggestion, and CHOMET reads a missing strength as medium, `chomet.123:276`); your Prince's strong is given as a physical word (`cindy.46:42`; DSCRP has physically-strong, `dscrp.17:232`). `relate.22:79`, named in the first design, is not a slip.

### S6: a method's prerequisites read where they are kept (REVIVE;SLIPS6)

Your line: `(do ((p (get (get suggestion 'value) 'prerequisite) (rest p)))` (`chomet.123:559`), in pass-prerequisite-test, which drops a convey method whose prerequisites are not met. SUGCON keeps them under `'prerequisites` (`sugcon.26:30-52`), and score-suggestions and get-prerequisites-of read them there (`chomet.123:277, 442-443`); under `'prerequisite` there is nothing, and the test passed every method. The correction reads `'prerequisites`, as its neighbor reads `'best-when` (`chomet.123:573-577`). **In your Cinderella nothing differs**: her methods' prerequisites are the verbs' (`convey.64:62-67`), and none is not met when CHOMET asks. A note, `prerequisite-not-met`, on the task, for each method dropped.

### S7: MIDDLE compares itself with (not bottom) (REVIVE;SLIPS7)

Your lines: MIDDLE's greater-than reads `'((not top) (not middle))`, and its less-than `'((not low) (not middle))` (`elemnt.1:165-171`). What reaches it is a rank, `(not bottom)` for (not low) (`elemnt.1:135-148`), so medium was never less than (not low) or (not short). The correction reads `(not bottom)`. **In your Cinderella nothing differs**: no medium value is ever asked whether it is less than anything (the corrected receiver is never reached in her pass 1 or 2), and CP 29 has no (not X). A note, `middle-less-than`, on MIDDLE.

### S8: a character's dynamics take their parent's factors once (REVIVE;SLIPS8)

Your line, DIRECTOR-CHARACTER's demon on its special dynamics:

```lisp
 (add (progn
       (ask ,:new-value multiply each of your variables matching (? factor) by those in
	    ,(ask ,:new-value recall your parent))
       :new-value)
      to your list of (special-dynamics actions-if-changing)))		(dichar.103:27-31)
```

A walk's dynamics are written as a factor of their parent's, and the demon makes them so; but it multiplies into the dynamics' own factor, and the same dynamics are set again each time an activity repeats, so the parent's factor is multiplied in again each time. A probe of the demon in your 1978 Kept Apart: Cinderella's speed factor in the guard's first walk goes 0.34, 0.24, 0.17, 0.12 in four cycles, the stepmother's 0.71, 0.51, 0.36, 0.26 (the parent's 0.71 each time); in Justice the stepmother's second walk takes her joy's factors twice. Your thesis tells the guard's cycle as one cycle repeated (p. 66, L1890-1894), and asks how an animator would change it, "Should the movements speed up?" (p. 182, L4755-4757). PLAN.md found it first in a stretched push-around that slows by a quarter each cycle. The correction: the first time dynamics are set, as yours; set again, each factor is divided by the parent's used before and multiplied by the parent's now, so that a change the parent has grown since is carried forth, as your comment means (`dichar.103:112-115`), and what the dynamics' own factor has grown by is kept.

**In your Cinderella.** The Introduction's pushing (KNOW's, stretched by 0.51, so its walks have a parent's factor of 1.40) no longer speeds up push by push: 238 frames (KNOW's 225), from frame 68; Kept Apart's guard no longer slows down cycle by cycle, the films differing from frame 35, with 65 events against 51, the guard getting round more often in the same time; and the other scenes start elsewhere (19, 175, 82 frames). Notes, `factors-once`, on the Introduction's second subscene (three of the stepmother's walks) and Kept Apart's second (four).

### S9: a gradual change runs at the speed Ani planned (REVIVE;SLIPS9)

Your lines: your gradual change, which runs every change Ani plans for how a character moves, joy's among them, takes

```lisp
 (let ((ticks-to-grow-e
	 (*$ (ask dynamic-constants recall your time-to-grow-e-times)
	     (weightify speed)
	     (float :frames-per-second)
	     (float :ticks-per-frame))))					(dichar.103:105-109)
```

where DISPLY's estimate of the same change, which is the task's time and its subscene's (`chomet.123:95-129`), divides by the weight:

```lisp
       (t (let ((time-to-grow-e
		 (//$ (ask dynamic-constants recall your time-to-grow-e-times)
		      (weightify speed))))					(disply.311:1104-1106)
```

so that a change at high speed is quick. Director's runs four times as long as Ani planned at high speed and a quarter as long at low. **The run** (`tools/check-slips.mjs --speed`, `speed.json`): your 1978 Cinderella, filmed, with every gradual change Director runs set beside DISPLY's estimate for it. All 20 at high speed take 3.95 to 4.04 times their estimate (Kept Apart's stepmother's path-curvature by 4, 55 ticks, 13.75 seconds, against 3.47; the Meeting's joys and Justice's sadness 16 ticks against 4.1); all 11 at low take 0.21 to 0.25 (the Introduction's joys a tick against 4.7, Cinderella's path-curvature in Kept Apart 14 ticks against 55.5); the 4 at medium 0.9 (rounding to whole ticks). The run confirms the inversion, so S9 is in: the ticks are DISPLY's estimate's. A joy at a high level changes at high speed (`emote.9:13-36`), so a very happy or very sad character now changes quickly, a slightly happy one slowly. With SLIPS every one of the 37 changes grows its factor for the ticks of its estimate (checked, where the film runs that long).

**In your Cinderella.** Every scene with a feeling: the Introduction's joys now take 5 ticks (none, in effect, before: S11), 231 frames, from frame 2; Kept Apart's from frame 62, when the feelings begin, the stepmother's change of path-curvature over 3.5 seconds instead of 13.75, Cinderella's over 13.9 instead of 3.5; the Meeting's and Justice's joys at their planned quarter of the time (178 and 90 frames, the scenes after the Introduction starting elsewhere). Notes, `change-at-its-speed`, with your ticks and the corrected ones, on each subscene where a change ran (31).

With APPEAR, a look change Ani pairs with a change of how a character moves takes as many ticks as it (`REVIVE;LOOKS` look-change-ticks, which counts as your DICHAR does), and with S9 it counts the corrected ticks, so the two still end together.

### S10: a gradual change grows a factor once a tick (REVIVE;SLIPS9)

Your lines: the change's two repeats, of the special dynamics of the character's scene "so that if changing special-dynamics in the scene this change is carried forth" (`dichar.103:112-117`), and of the character's own (`dichar.103:118-121`). Stage 6's finding 1 (`reports/ext/change/README.md`): own dynamics with no factor of their own take it from the scene's, which the first repeat has grown, and the second grows it again, a step ahead; and when she stands with the scene's own dynamics both repeats grow the one factor, every tick, and the change goes twice as far, 2.718^(27/10) for a change by 4 at medium speed where 2.718^(27/20) was meant (`test/change.test.js`). In your 1978 Kept Apart the stepmother's changes by 1.25 end at 1.35, Cinderella's by 0.667 at 0.62, her path-length's by 2 at 2.72 (`speed.json`). The correction: the second repeat grows her own dynamics only if they don't take the factor from the scene's, as CHSHOW's bridge does. **In your Cinderella**, alone: Kept Apart from frame 62, the Meeting and Justice (175 and 84 frames); the Introduction's joys, a tick each, had nothing to grow twice (with S9 and S11 they have five). Notes, `grown-once`, on each subscene for each character and element (35 with all of them).

### S11: a gradual change takes as many steps as it counts (REVIVE;SLIPS9)

Your line, SOME's repeat:

```lisp
(define-method (repeat ?message ?number times %followup) something
 (help-comments:
  |do the MESSAGE and plan for the next tick to repeat one less time the MESSAGE|)
  (cond ((> number 1)
	 (ask :self !,message)
	 (ask :self plan next repeat ,message ,(1- number) times !,followup))
	(t (cond ((eq (first followup) 'then) (ask :self !,(rest followup)))))))	(some.666:444-450)
```

asked to repeat once it does only the followup, against its help comment and against its neighbor, repeat ... every so many ticks, which does the message and then counts (`some.666:435-442`). So your gradual change stops a step short of its factor, and a change of a tick does nothing: the Introduction's joys at low speed in 1978. Your Director uses this repeat only there; the correction asks it to repeat once more than the steps the change counts. **In your Cinderella**, alone: the Introduction's joys take their step, from frame 2 (the films 225 frames, as KNOW's); and Kept Apart's joy's part ends a tick later, at frame 115, so that, by stage 6's finding 7, the film no longer stops when it ends, and the guard runs on to its own end, at 162 (164 frames). With S9 and S10 too that doesn't happen (below). Notes, `change-steps`, on each subscene (37).

### Left alone: CHOMET's redistribution of a scene's time, and one in Director

Found while correcting the others (two of them by the stage before this one, PLAN.md's "Still open with MEND"), each changing nothing in your Cinderella:

- resurect-bad-time-fits looks for the reason `more-time-needed:` (`chomet.123:193`), and time-fit-score-1 writes `need-more-time:` (`chomet.123:413`), so a task whose only way of showing needs more time is never given it (your Meeting's getting-it-on has alternately-turn beside it). And redistribute-time-for-tasks, for a scene the redistribution makes too short, adjusts by `(-$ new-length scene-minimum)`, less than nothing, and for one too long by more than nothing (`chomet.123:61-64`), while adjust-task-lengths gives a task whose time falls below its least its most, ";;must be too large", and one above its most its least (`chomet.123:167-180`). Read together the signs may be one convention or two slips, and correcting the reason's name alone would send more scenes into them. Not corrected; for you.
- change-to:-package merges a change without its method (`cosug.215:509`): REVIVE;MEND7 puts the method back.
- The special dynamics a character's changes carry forth are found once and kept (`dichar.103:22-26`, "or :old-value"), so a change in a later subscene grows the dynamics of the subscene where her first change was; it reaches her through the second repeat. Your Cinderella has each character's changes in one subscene of a scene; with DETAIL's rhythm she changes in several.
- The `pick-value-with-variety` slip, found by the same stage, is S12.

## All of them: the chained film

| Scene | 1978 | KNOW | With SLIPS | At 24 frames a second: 1978 | KNOW | With SLIPS |
|---|---|---|---|---|---|---|
| Introduction | 192 | 225 | 230 | 917 | 1241 | 1379 |
| Kept Apart | 116 | 116 | 115 | 701 | 701 | 712 |
| No Longer Kept Apart | 17 | 17 | 19 | 113 | 113 | 109 |
| Meeting | 179 | 179 | 180 | 1051 | 1051 | 878 |
| Justice | 84 | 84 | 85 | 458 | 458 | 442 |

- **The Introduction**, 230 frames: the joys take their five ticks from the start (S9, S11), and grow once (S10); the following as KNOW's (frames 0 to 50); the stepmother's pushing (50 to 113, KNOW's 52 to 103) no longer speeds up push by push (S8); the chasing (113 to 115) and the hitting (115 to 155) as KNOW's; **Cinderella helps her stepmother** (155 to 189; S1 and S2); she accompanies the Prince, who comes on (189 to 228). At 24 frames a second, 1379: the accompanying (1056 to 1377) has two of MEND12's `overdue-move` notes, Cinderella and the Prince each kept waiting more than two seconds as she goes to him and he comes on, and stopped as if there.
- **Kept Apart**, 115 frames: the guard (frames 3 to 113) no longer slows down cycle by cycle (S8), getting round more often (64 events against 51); the feelings, from frame 60, at the speeds Ani planned, grown once (S9, S10, S11). The guard's part now ends first (frame 113), and tells the feelings' part, which extends it, that it has ended too (stage 6's finding 6); the film stops at 115, as Cinderella's change of path-curvature at low speed, planned for 13.9 seconds from frame 60, takes its last steps (KNOW's guard was cut short instead, the feelings' part ending first, at 114). At 24 frames a second the feelings' part ends at 700 and the guard's runs on to 710 (712 frames).
- **No Longer Kept Apart**, 19 frames, **the Meeting**, 180, and **Justice**, 85: each starts where the scene before left everyone, and the Meeting's and Justice's feelings are at their planned speed. At 24 frames a second the Meeting's joy's part, which ran to its end in KNOW's film (frame 1049), is cut short when the part it extends ends (876): stage 6's finding 6, which part ends first deciding.

Pass 1 is CP 29 byte for byte, with the three choice points of S3 hearing friendly (`pass1-tendencies.json`), and three notes. Planned from your 1978 positions (`from-1978/`), only the Introduction's pass 2 differs from KNOW's, as S1 says: the other corrections act in Director, and Kept Apart's pass 2 is KNOW's, the other three 1978's.

## The glass box

Each correction notes where it acted, through REVIVE;WRAP's `revival-note`, as MEND's repairs do: pass 1's `repairs` (S3's, on the choice points), each glass box's `repairs` (S1's, S2's, S6's, on the task), and each film's `repairs` (S8's to S11's, on Director's subscene; S7's and S12's, on MIDDLE and on the element, wherever they act).

| Kind | Correction | On | was | now | because |
|---|---|---|---|---|---|
| `is-not-in-the-scene` | S1 | the task | `(no such character exists)` | `step-mother` | `(part-of introduction)` |
| `described-as-preferred` | S2 | the task | `(weak good)` | `(step-mother anyone)`, all, any or anyone | `(in introduction)` |
| `no-such-generator` | S1 | the task | `(is-desired-by step-mother)` | `nil` | `(not-defined)` |
| `variety-pick` | S12 | the element | `(high (positive high))`, the level and your pick | the pick | `(counts ((count value) ...))` |
| `friendly-attraction` | S3 | the choice point | `attraction-to-strangers` | `attraction-towards-strangers` | `(friendly (positive medium) medium)` |
| `prerequisite-not-met` | S6 | the task | the method | `dropped` | `((on-stage kid))`, the prerequisite |
| `middle-less-than` | S7 | MIDDLE | `nil` | `top` | `((not bottom))` |
| `factors-once` | S8 | Director's subscene | `(((speed factor) 0.71327145))`, the factors your demon would have applied again | `once` | `(set-again <the dynamics>)` |
| `change-at-its-speed` | S9 | Director's subscene | `(step-mother path-curvature by 4.0 at high speed in 55 ticks)` | `(in 14 ticks)` | `(disply estimates 3.4657359 seconds)` |
| `grown-once` | S10 | Director's subscene | `(cinderella speed twice a tick)` | `(once a tick)` | `(has-it-from <the scene's dynamics>)` |
| `change-steps` | S11 | Director's subscene | `(4 steps of 5)` | `(5 steps)` | `(cinderella speed)` |

## For the page (stage 7)

- **The switch.** `src/pipeline.js`'s registry has SLIPS with `group: "repairs"` and `optIn: true` (every entry now has a `group`; SLIPS and DETAIL are `optIn`), requiring KNOW: "Which extensions" lists it under repairs, unticked when the switch is turned on, and ticking it ticks KNOW and MEND.
- **The notes** above, each a plain sentence with Ken's line and a code link. For instance: `described-as-preferred` ("Good helps someone ideally weak and good, and failing that anyone (thesis p. 100). No one in the scene is either, so Cinderella helps her stepmother. In 1978 is-not was given the task, not the scene, and never found anyone: a slip SLIPS corrects (sugest.123:333, scene.9:380)"); `change-at-its-speed` ("Ani planned this change for 3.5 seconds; your Director ran a change at high speed four times as long, multiplying by the speed's weight where DISPLY's estimate divides (dichar.103:105-109, disply.311:1104-1106): SLIPS runs it as planned"); `factors-once` ("Each time the stepmother's walk is set again, your Director multiplied in her parent's factor again, so each cycle was slower (dichar.103:27-31); SLIPS takes it once"). The film's notes are many (Director's, one for each change); the page might group them by kind and subscene.
- **Pass 1's notes.** S3's three `friendly-attraction` notes are pass 1's `repairs` (the run's `repairs`, and each choice point's memory in pass 1's glass box): the pass-1 view should show them on Cinderella's three tendency choice points, beside friendly's suggestion there, which is new with SLIPS.
- **The film's notes and the frame.** S8's to S11's notes are the film's `repairs`, on Director's subscene; the film's events give each subscene's beginning and end, so the page can say them as the part they belong to plays.
- **The two helps.** The Introduction's task chain should say why helping the stepmother displaced helping the Prince: the two are "identical" to your find-related-suggestions, and the first is the main one (S1, above).
- **The speed check** (`speed.json`) is the evidence for S9 and S10: the page could show it as a small table where the inversion is said.
- **The bundle** needs SLIPS' files (`node tools/build-ani-bundle.mjs` with the extensions the page offers), and the page's frame counts for Cinderella with SLIPS are this README's.

## On the page (stage 7, 15 October)

`app/film.html` and its claude.ai copy (`app/film.template.html`, `app/film/llm.js`, `tools/build-film-app.mjs`), with the bundle built again with SLIPS' and DETAIL's files (`app/data/ani-bundle-files.json`). From the bundle alone, with your CINDY as the page's worker gives it, your Cinderella with SLIPS films every scene, and plans every glass box, byte for byte as in this folder, from the claude.ai copy's bundle (the revival's Lisp without comments) too; with the page's four extensions it is as before, 222, 116, 19, 175 and 92 frames.

- **The switch** is as it was: "Ani as in 1978", and "Ani with the revival's extensions", which ticks MEND, KNOW, APPEAR and CHANGE. Under it, "Which extensions" has the registry's two groups, knowledge (KNOW, APPEAR, CHANGE, DETAIL) and repairs (MEND, SLIPS), each extension with a tick, its sentence and its files; SLIPS is marked opt-in and is unticked. Ticking it ticks KNOW and MEND (in 1978 mode, exactly this folder's set), and unticking KNOW or MEND unticks it. The ticks are kept in the visitor's browser beside the switch, and only when they differ from the switch's two settings, so a visitor who never ticks sees the page as before. With SLIPS ticked, your story as it is can be made ("This is Ken's story as it is. With the revival's extensions (MEND, KNOW, SLIPS) Ani knows words, relationships, ways of showing and feelings Ken could have added, and corrects slips in Ken's files, so you can make it as it is, or change a word first."), and the page makes it in this folder's 230, 115, 19, 180 and 85 frames.
- **"What SLIPS changed, and why"**, in the compare panel: each scene's frames beside 1978's, then a sentence for each correction where it acted, your lines cited and linked to your code. "In The Introduction, Cinderella helps the stepmother (part 5, frames 155 to 189), not the Prince: Cinderella's part asks for someone in the scene, ideally weak and good, and failing that anyone (thesis p. 100), and is-not found the stepmother, who is neither; in 1978 Ken's is-not, given the task and not the scene, never found anyone (sugest.123:333-335, scene.9:380). Good's helping the stepmother and friendly's helping the Prince are the same to Ken's find-related-suggestions, which relates two conveys by their verb and who does it (sugest.123:162-177), and only the first is made a task (sugest.123:204-210)." Then S3 ("each is chosen as in 1978"), S8 ("In The Introduction, as the stepmother pushes Cinderella around, the stepmother's walk no longer speeds up cycle by cycle; and in Kept Apart, as the stepmother stands guard, ..., the stepmother's and Cinderella's walks no longer slow down cycle by cycle"), S9 with the run that confirmed it as a small table (`speed.json`: at high speed 20 changes, 3.95 to 4.04 times their estimate; at medium 4, 0.9; at low 11, 0.21 to 0.25), S10 (35 changes) and S11 (37). KNOW's own differences, which SLIPS needs, are marked in the glass box as the revival's knowledge, as before.
- **Pass 1's three notes** are in "How Ani's choices changed", each a sentence ("Friendly suggests that Cinderella is drawn to strangers (medium strength), but Ken wrote it for attraction to strangers (dscrp.17:106-108), and pass 1's element is attraction towards strangers (elemnt.1:101-105), as shy, kind and mean name it; so in 1978 pass 1 never heard it. SLIPS names it as the element is. Heard now, it is set aside, not compatible with the others: Cinderella strongly avoids strangers, as in 1978.") whose "why?" opens the choice point, where friendly's suggestion is marked "friendly's, heard with SLIPS". `app/pass1.html`, showing a run made with SLIPS, has the note on the choice point.
- **The captions** say each correction as its part plays: "With SLIPS, Cinderella helps the stepmother: Cinderella's part asks for someone ideally weak and good, and failing that anyone, and is-not now looks in the scene; Ken's relating takes this and friendly's helping the Prince as the same, and good's comes first."; "With SLIPS, Cinderella and the stepmother's changes here run as Ani planned them: over 5 ticks, not 1, growing once a tick and taking every step."; "With SLIPS, the stepmother's walk takes its parent's factor once, so each cycle is no slower than the last."
- **The glass box** has "What the corrections of slips did here" beside the repairs: a sentence for each kind of note on a task or a part (Director's grouped by part), the ones on the part shown and on its task's chain first, each opening to Ani's own record. The helping task's chain says why the stepmother's helping displaced the Prince's: "With SLIPS, good's helping the stepmother and friendly's helping the Prince are the same to Ken's find-related-suggestions ...: so Cinderella helps the stepmother, not the Prince."
- **The prompt and the JSON schema** are unchanged by SLIPS, which adds no word: with SLIPS ticked they are KNOW's and MEND's, and with the four extensions and SLIPS the four's, as before this stage; in 1978 mode byte for byte as they were.
- **The claude.ai copy** stays well under claude.ai's 950,000 bytes: its page script now goes gzipped and written as text, as its data does, run by a small loader (`artifact/README.md`); about 737 KB.
- **The same film in every browser.** Made in the page in Chrome 155, your Cinderella with SLIPS first came out with an Introduction of 241 frames, not this folder's 230, the films parting at the stepmother's pushing (frame 84); the other four scenes, and the films with DETAIL and with the page's four extensions, were Node's. Chrome's `Math.sin`, `cos`, `atan2`, `log` and `exp` differ from Node 24's in the last bit of about one result in thirty (`pow` and `sqrt` agree), and a flonum here is a full double, so a last bit can decide a walk. The interpreter's SIN, COS, ATAN, LOG and EXP and the TV turtle now use fdlibm's algorithms written out in JavaScript (`src/maclisp/libm.js`), bit for bit Node's own on 6,000,000 arguments (`test/libm.test.js` checks 300,000 and the edges), so every film Node made is as it was, and the page makes this folder's film in Chrome, every frame and event.

## Decisions for you

1. **Is SLIPS' list right?** S1 (with S2), S3, S6, S7, S8, S9, S10, S11 and S12 corrected; S4 and S5 left as they are. The speed inversion is in, the run confirming it.
2. **CHOMET's redistribution** (above): correct the reason's name and the two signs, or leave them? Together they would let a task with no way of showing that fits get more time, as your approve-or-remake-tasks-choices means; the cost is a new path through code no story has run.
3. **Cinderella helps her stepmother.** With S1 and S2 her goodness finds the only other one in the scene, who is neither weak nor good, and displaces friendly's helping the Prince, since your relating takes the two helps as identical. That is your code corrected; say if the helping of the Prince should come first (it would, if the order of her words put friendly before good).
4. **Your stage 6 decision 12, again.** With the feelings at their planned speed, a feeling's part that extends an activity and ends first now stops more stories in the middle of the activity (finding 7): `test/stories/stress/detail-rhythm.lisp`'s first scene, a chase and then the goat sad, films 13 frames with SLIPS, 49 without, the chase cut short. CHSHOW's wait covers only parts that show a change; should it cover your own parts too?
