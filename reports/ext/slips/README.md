# Cinderella with SLIPS: corrections of slips in your files

SLIPS (stage 7 of [Phase 9](../../chapter-x/PLAN.md), "Item 4, part 2: KNOW, SLIPS and DETAIL") corrects slips in your files: places where your code does something other than what the code beside it, your comments or your thesis say it is to do. Unlike MEND's repairs, which leave your Cinderella byte for byte as it was, these change it, so SLIPS is a switch of its own, off by default (your decision 2: "Each correction quotes the line it corrects and comes with a written Cinderella diff; the DICHAR/DISPLY speed inversion goes in only if a run confirms it"). The site opens in 1978 mode, and the page's switch turns on MEND, KNOW, APPEAR and CHANGE; SLIPS is opt-in (decision 3). The files are `src/director/revive/slips.lisp` (REVIVE;SLIPS: what SLIPS is, the corrections, and what it leaves alone) and SLIPS1, 2, 3, 6, 7, 8 and 9, and since the review of stage 7 SLIP13 and SLIP14, one for each correction or group. S15, a scene keeps its time (your request of 16 October), is REVIVE;FIT, an extension of its own that your decision of the same day has on with the revival's extensions and never in "Ani as in 1978" (`reports/ext/fit/README.md`); SLIPS requires it. SLIPS requires KNOW (and MEND, which KNOW requires): S1 has good's helping find someone to help, and without KNOW's way of showing helping (helps-along) the helping is chosen and dropped, "no idea how to convey" it (`sugcon.26:69-74`). So every diff below is against your Cinderella with KNOW (`reports/ext/know/`); KNOW's README says how that differs from 1978.

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

And S2. good asks for `(is-not ,character (is-described-as (weak good)))` (`dscrp.17:140-145`), and is-not applies the condition's first word to the sibling; but is-described-as is the name of a generator actor (`sugest.123:402`), not a function, so S1 alone would stop pass 2. Your thesis says what the condition is: "That other character should ideally be described as weak and good", and "it will be satisfied with a character that is neither weak nor good, if need be" (p. 100, L2757-2759 and its footnote, L2768-2770). So is-not prefers someone in the scene described by all of the words, then by any, then anyone. A word is matched as itself, of any type, or physically as physically-<word>: your DSCRP has physically-strong and its opposite physically-weak (`dscrp.17:232, 292`), and your own prerequisite for stronger reads weak and strong as physical descriptions (`prereq.19:45-55`), so a character described `(physical physically-weak)` is described as weak (since the review of stage 7: the literal word alone never matched one).

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

*Since your decision 13 (17 October), S8 is FIT's too, on with the revival's extensions and never in "Ani as in 1978" (`reports/ext/fit/README.md`); without SLIPS, FIT's REVIVE;FITSTR writes your gradual change so that S8 still counts a change once.*

Your line, DIRECTOR-CHARACTER's demon on its special dynamics:

```lisp
 (add (progn
       (ask ,:new-value multiply each of your variables matching (? factor) by those in
	    ,(ask ,:new-value recall your parent))
       :new-value)
      to your list of (special-dynamics actions-if-changing)))		(dichar.103:27-31)
```

A walk's dynamics are written as a factor of their parent's, and the demon makes them so; but it multiplies into the dynamics' own factor, and the same dynamics are set again each time an activity repeats, so the parent's factor is multiplied in again each time. A probe of the demon in your 1978 Kept Apart: Cinderella's speed factor in the guard's first walk goes 0.34, 0.24, 0.17, 0.12 in four cycles, the stepmother's 0.71, 0.51, 0.36, 0.26 (the parent's 0.71 each time); in Justice the stepmother's second walk takes her joy's factors twice. Your thesis tells the guard's cycle as one cycle repeated (p. 66, L1890-1894), and asks how an animator would change it, "Should the movements speed up?" (p. 182, L4755-4757). PLAN.md found it first in a stretched push-around that slows by a quarter each cycle. The correction: the first time dynamics are set, as yours; set again, each factor is divided by the parent's used before and multiplied by the parent's now, so that a change the parent has grown since is carried forth, as your comment means (`dichar.103:112-115`), and what the dynamics' own factor has grown by is kept.

**A change once** (since the review of stage 7, its M1). Your gradual change grows the scene's dynamics with its first repeat and the dynamics she walks with now with its second (`dichar.103:110-121`). When her walk's parent has the factor from the scene's dynamics, the one change grows the walk's own factor and its parent's alike, and set again the walk took it twice, in its own factor and in the parent's now, as your demon takes it: in Justice the stepmother's sadness, grown into her first walk and into her scene's dynamics to 0.67, made her second walk 0.45, 0.67 squared, as in 1978 (0.69 and 0.47 there). Now the growth the second repeat gives dynamics whose parent the first repeat grows by the same rate is kept, and divided out when they are set again: the change once, through the parent. Her second walk in Justice is as slow as her first, 0.67 (a `factors-once` note on Justice's part, with `(a-change-taken-twice (((speed factor) 0.67)))`); `test/slips.test.js` sets a walk again after a change by 0.5 grown into it and into its parent (0.4966 once; your demon 0.2466). CHANGE's bridge (REVIVE;CHSHOW) has the same two repeats, and its second is counted so too.

**In your Cinderella.** The Introduction's pushing (KNOW's, stretched by 0.51, so its walks have a parent's factor of 1.40) no longer speeds up push by push: 238 frames (KNOW's 225), from frame 68; Kept Apart's guard no longer slows down cycle by cycle, the films differing from frame 35, with 65 events against 51, the guard getting round more often in the same time; and the other scenes start elsewhere (19, 175, 82 frames). Notes, `factors-once`, on the Introduction's second subscene (three of the stepmother's walks), Kept Apart's second (four) and, since the review of stage 7, Justice's (the stepmother's walk, her sadness taken once).

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

so that a change at high speed is quick. Director's runs four times as long as Ani planned at high speed and a quarter as long at low. **The run** (`tools/check-slips.mjs --speed`, `speed.json`): your 1978 Cinderella, filmed, with every gradual change Director runs set beside DISPLY's estimate for it, and what Director did, the ticks each change's factor grew for. By your formula all 20 at high speed take 3.95 to 4.04 times their estimate (Kept Apart's stepmother's path-curvature by 4, 55 ticks, 13.75 seconds, against 3.47; the Meeting's joys and Justice's sadness 16 ticks against 4.1); all 11 at low 0.21 to 0.25 (the Introduction's joys a tick against 4.7, Cinderella's path-curvature in Kept Apart 14 ticks against 55.5); the 4 at medium 0.9 (rounding to whole ticks). As Director ran them (since the review of stage 7 the check asserts what Director measured, not the formula): each of the 25 changes the film runs past grew its factor for the ticks of the formula less one (S11's missing step); the 10 measured at high speed grew for 3.70 to 3.90 times their estimate (Kept Apart's stepmother's path-curvature 54 ticks; the Meeting's ten end with the film, unmeasured), the 3 measured at low for 0.22 to 0.23 (Cinderella's path-curvature in Kept Apart 13 ticks; the Introduction's eight changes of a tick take no step at all), and the 4 at medium for 0.67 (3 ticks against 4.46: rounding to whole ticks, and the missing step). The run confirms the inversion, so S9 is in: the ticks are DISPLY's estimate's. A joy at a high level changes at high speed (`emote.9:13-36`), so a very happy or very sad character now changes quickly, a slightly happy one slowly. With SLIPS every one of the 37 changes grows its factor for the ticks of its estimate (checked, where the film runs that long).

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

asked to repeat once it does only the followup, against its help comment and against its neighbor, repeat ... every so many ticks, which does the message and then counts (`some.666:435-442`). You corrected it yourself: your SOME of August 1979 (tape 9004336) repeats while the number is above none, `(cond ((> number 0) (ask ,myself sequentially ,message (plan next repeat ,message ,(1- number) times) !,followup)))` (`original/9004336/some.1005:751-759`), so a message asked to be repeated once is done once. So your gradual change of January 1979 stops a step short of its factor, and a change of a tick does nothing: the Introduction's joys at low speed in 1978. Your Director uses this repeat only there; the correction asks it to repeat once more than the steps the change counts. **In your Cinderella**, alone: the Introduction's joys take their step, from frame 2 (the films 225 frames, as KNOW's); and Kept Apart's joy's part ends a tick later, at frame 115, so that, by stage 6's finding 7, the film no longer stops when it ends, and the guard runs on to its own end, at 162 (164 frames). With S9 and S10 too that doesn't happen (below). Notes, `change-steps`, on each subscene (37).

### S13: a change is carried forth into the walks of its part (REVIVE;SLIP13)

Added after the review of stage 7 (its M2). Your line, the first repeat of your gradual change, and why it is there:

```lisp
	    (ask ,(ask :self recall your special-dynamics-for-current-scene)
		 ;;so that if changing special-dynamics in the scene this change is
		 ;;carried forth with the help of the demon on special-dynamics
		 ;;in director-character
		 repeat (multiply your (,element factor) by ,growth-rate) ...)	(dichar.103:112-117)
```

and the second repeat grows the dynamics she walks with now (`dichar.103:118-121`): the change shows on the walk she walks while it runs, and is carried forth into the dynamics she is set to later. Your thesis tells what Kept Apart's feelings are to show, while the stepmother stands guard: "To establish that Cinderella becomes very unhappy she gradually slows down and moves in long straight lines ... Concurrently, her stepmother speeds up and moves in long highly-arcing curves" (p. 66, L1897-1901); in the flipbook the guard, (b), is pages 91 to 311, and the feelings, (c), 205 to 311 (L1886-1898). A part with only changes "cannot stand alone" (pp. 125-126): your SCENE extends the activity of the part before it by the changes' time, and the part of changes runs beside it, a parasite on it (`extend-last-actions-of`, `scene.9:223-240`), so that the changes are seen on that activity.

Two things keep the change from the walks the characters walk with. The scene's dynamics your change grows are found once, as the nearest `(special-dynamics-of c in ?)` of the dynamics she has when her first change begins (`dichar.103:22-26`), and run-change-to has her set to her part's own dynamics just before (`disply.311:1087-1089`): for a part of only changes those are its own, and the walks of the activity it extends are the other part's, which don't descend from them (Kept Apart's feelings grow `(special-dynamics-of cinderella in (subscene-of kept-apart 3))`, and the guard's walks are subscene 2's). And the demon multiplies a walk's factor by its parent's only, while the walks of a repeated or stretched activity are children of dynamics with a speed factor of their own (`multiply-dynamics-by-factor`, `place.45:452-461`; the guard's, `disply.311:421-427`), which no growth of the scene's dynamics would reach. So only the walk she happens to walk while a change runs takes it, for the ticks it runs. With S8 to S11 alone, Cinderella's sadness ran four ticks and changed one of her two guard walks for two of them (0.51 to 0.42; the other stayed 0.68), and the stepmother's joy ran while she stood with her part's dynamics and never reached her walks (1.42 and 1.63 to the end). In 1978 Cinderella slowed, by accident: your S8 slip slowed the whole guard cycle by cycle, and her sadness ran four times as long (S9's), reaching more of her walks; the stepmother slowed too, her joy never showing.

The correction, your mechanism carried through. The change's first repeat also grows the dynamics her walks of the part take the factor from: the part the change runs in (the subscene of her dynamics as it begins, run-change-to's) and the part it extends, if it is a parasite. For each walk there (each of `(special-dynamics-of c in part)`'s dynamics with no offspring), if it has the factor of its own the demon carries its parent's, so its carrier is the nearest of its parent and their ancestors with the factor of its own; otherwise the nearest of its ancestors with it; failing both, the part's dynamics, which then take it. Carriers that take the factor from the scene's dynamics are left to them. The carriers grow as the scene's do, once a tick, and every walk takes the change once: one that takes the factor from them at once (the second repeat leaves it alone, as S10 leaves one that takes it from the scene's), one with a factor of its own when it is next set, the demon multiplying in its parent's (S8 counting the second repeat's growth of it once). The next part is not carried into: run-change-to sets the next part's value to the new one (`disply.311:1083-1086`), as you planned. Notes, `carried-forth`, on the part of the scene's dynamics, for each character and element: the scene's dynamics your change grows, the carriers, and the parts whose walks they carry it to.

**In your Cinderella**, alone (beside KNOW's, `each.json`): Kept Apart's feelings reach the guard's walks, the film differing from frame 65, 116 frames as KNOW's, with 56 events (KNOW's guard, slowing cycle by cycle by your S8, gets round fewer times); in the Meeting the joys reach the walk to each other in their last frames, and the scenes after Kept Apart start elsewhere (17, 180 and 90 frames). Notes, `carried-forth`, 14 in Kept Apart and 10 in the Meeting. With all the corrections, Kept Apart's feelings show as below ("All of them").

### S14: the film is not stopped while the activity a part of changes extends still runs (REVIVE;SLIP14)

Added after the review of stage 7 (its M4). Your lines: when a part ends, every part told of it tells its own parasites they have ended too, and asks Director, the tick after, to stop the film if nothing is running:

```lisp
	      (mapc
	       (function (lambda (parasite)
				 (ask ,parasite note that (end-of ,parasite) happened)))
	       (ask :self recall your parasites))
	      ;;wait a tick so something can start now
	      (ask :self plan next stop film if nothing running)))))	(action.152:73-78)

(define-receiver (stop film if nothing running) director-subscene
 (cond ((and (null (ask :self ask your scene to recall your running-subscenes))
	     (null (ask default-universe recall your actors-to-run-next)))
	(ask movie ask your current-movie to stop filming))))		(action.152:88-91)
```

Your SCENE plans a part of changes to end with the activity it extends: it extends the activity by the changes' time and has the part of changes begin when the activity was to end (`scene.9:223-240`). But neither of Director's lists says what is running. A part's beginning is told to it and to the parts after it (`action.152:39-40`); told of its own beginning a part places the characters, and only a later part that is not a parasite puts it on running-subscenes (`action.152:54-66`), so the part a part of changes extends, the scene's last, is never on it. And the universe's list of actors to run next is empty while the actors tick (REVIVE;BRIDGE, as your SOME of August 1979 has it), so whether anything is planned when a part asks depends on the order they tick in (stage 6's finding 6, `reports/ext/change/README.md`). So when a part of changes ends first, the film stops with the activity it extends still running (stage 6's finding 7): in 1978 Kept Apart's guard is cut at frame 116, as the flipbook's Kept Apart ends with the stepmother still standing guard. SLIPS' S9 and S11 move the tick a feeling's part ends on, and in the review of stage 7 cut more stories' activities short: GPT-6.1 Sol's Jack and the Beanstalk, where Jack's pride ends a tick later than with KNOW (S11) and the film stopped at frame 11 with the giant still chasing him (with KNOW the chase ran to its end at 107), and others below. The correction, as REVIVE;CHSHOW keeps the film going while a part that shows a change runs (`film-waited-for-change`): the film is not stopped at the request of a part of changes that has ended while the part it extends has begun and not ended, as the movie keeps their events; that part, ending, asks again, as every part does. Only a part of changes' request waits, and only for the part it extends, so your other stops are as they were, and a part of changes cut short when the activity it extends ends first (finding 6) is cut as it was. (A part told a part has ended tells its own parasites they have ended, whichever part it was, `action.152:73-76`, so a part of changes is told so as the parts before it end, before it has begun; its request then is not its own end, and is left to your code.) A note, `film-waited-for-activity`, on the part waited for: `(revival-repair: what film-waited-for-activity was stopped now kept-filming because (((subscene-of pursuit 2) ended at frame 9)))`.

Why in SLIPS, not SEEN: it corrects your Director's stop, which the code beside it says is for when nothing is running ("wait a tick so something can start now") and your SCENE plans to come when the activity and the feelings end together; it is reached far more often with S9 and S11, which move the tick a feeling ends on; and SEEN is switched on with the page's four, where it would change what the page shows by default (with KNOW, Kept Apart's feelings' part ends first, at frame 114, and the guard would run on to its end). A decision for you (below).

**In your Cinderella**, with all the corrections, nothing differs: every part of changes ends after the activity it extends (Kept Apart's guard at frame 105, the feelings' part still running; the Meeting's walk to each other at 173). Alone, beside KNOW's, where Kept Apart's feelings' part ends first, at frame 114: the guard runs on to its own end, and Kept Apart is 164 frames, not 116 (a `film-waited-for-activity` note), the scenes after it starting elsewhere (18, 185 and 82 frames).

**In stories** (the review of stage 7's M4). GPT-6.1 Sol's fifteen JSON trial stories (`reports/llm-trials/2026-10-13 gpt-6.1-sol json/`), with SLIPS before these corrections and after them, and with KNOW, which SLIPS requires, beside them, at 4 frames a second: two stop in pass 1 either way (Beauty and the Beast, The Lion and the Mouse: the model's slips, which the page's tidy step mends and `run-story` doesn't). 22 of the other 55 scenes differ; S14 kept the film going in 19 of the scenes after (`film-waited-for-activity`), and S13 changes how fast and how far characters walk where a feeling's part extends an activity, and so the scenes after. Jack's pursuit is 109 frames again, the chase run to its end, as with KNOW. The other three short scenes the review listed are not activities cut short: the Fox and the Crow's Flattery (10 frames, KNOW's 30) and the Gingerbread Man's first scene (6, 17) have no activity beside their feelings, which now take the time Ani planned (S9: the crow's joy and pride at high speed, 1.7 seconds, which your Director took four times as long over); and Snow White's Chased Away (6, 30) starts where a shorter Introduction left the queen and Snow White, the queen catches her at frame 4, and the joy's part, due to begin later, never does (stage 6's finding 6, the part it extends ending first, which S14 leaves as it was). The scenes that differ, and the three:

| Story | Scene | KNOW | SLIPS before | SLIPS after | S14 waited |
|---|---|---|---|---|---|
| jack-and-the-beanstalk | introduction | 180 | 162 | 180 | yes |
| jack-and-the-beanstalk | pursuit | 109 | 11 | 109 | yes |
| jack-and-the-beanstalk | happy-together | 45 | 123 | 162 |  |
| red-riding-hood | kept-apart | 190 | 102 | 133 | yes |
| red-riding-hood | together-again | 339 | 230 | 164 |  |
| romeo-and-juliet | the-fight | 32 | 106 | 129 | yes |
| romeo-and-juliet | together-in-sorrow | 453 | 256 | 326 | yes |
| snow-white | chased-away | 30 | 6 | 6 |  |
| snow-white | protection | 116 | 118 | 147 | yes |
| snow-white | prince-arrives | 65 | 193 | 235 |  |
| snow-white | happy-together | 179 | 172 | 158 | yes |
| the-boy-who-cried-wolf | bored-shepherd | 68 | 98 | 127 | yes |
| the-boy-who-cried-wolf | first-trick | 42 | 22 | 38 | yes |
| the-boy-who-cried-wolf | tricked-again | 30 | 27 | 51 |  |
| the-boy-who-cried-wolf | real-wolf | 72 | 267 | 323 | yes |
| the-fox-and-the-crow | flattery | 30 | 10 | 10 |  |
| the-gingerbread-man | cheeky-gingerbread-man | 17 | 6 | 6 |  |
| the-gingerbread-man | fox-catches-him | 119 | 119 | 117 |  |
| the-three-little-pigs | the-chase | F | 53 | 73 | yes |
| the-three-little-pigs | safe-together | F | 100 | 87 | yes |
| the-tortoise-and-the-hare | boasting | 287 | 65 | 173 | yes |
| the-tortoise-and-the-hare | pushed-around | 102 | 108 | 116 |  |
| the-tortoise-and-the-hare | pride-and-shame | 149 | 129 | 238 | yes |
| the-ugly-duckling | pushed-around | 103 | 134 | 149 | yes |
| the-ugly-duckling | spring-welcome | 113 | 176 | 205 | yes |

(F: with KNOW the film stopped on The Chase, "not a number: YMAX", and the two scenes after it could not start; MEND20 repairs it, `test/stories/stress/README.md`, offstage-corner.)

### S15: a scene keeps its time (REVIVE;FIT)

Added at your request of 16 October ("settle the CHOMET question so the godmother scene keeps its time"), and by your decision of the same day on with the revival's extensions, never in "Ani as in 1978": so it is FIT, an extension of its own (`reports/ext/fit/README.md` has it in full, and your Cinderella with it), which SLIPS requires. Its four pieces are turned off with `:slips-off` as the others are, `(s15)` all four.

Your lines. Your No Longer Kept Apart is short, `(length-bounds (10.0 25.0))`, one task allocated `(10.0 25.0)`, and its only way of showing, `goes-to-and-accompanys` (ideal 3.98 seconds, most 6.95), is rejected by time-fit-score-1 (`chomet.123:404-415`) as `(too-much-time: ideal-difference -6.02 will-accept -3.05)`. approve-or-remake-tasks-choices (`chomet.123:9-37`) brings it back with resurect-bad-time-fits (`187-198`), asking for -6.08 (×1.01), and redistribute-time-for-tasks (`39-65`) moves the allocation to `(3.92 18.92)`, chooses again, and judges the scene by

```lisp
      (let ((new-length (+$ (*$ (+$ scene-minimum scene-maximum) .5) total-time-change)))
	   ...
	   (cond ((and (> new-length scene-minimum) (< new-length scene-maximum))
		  (give-every-task-its-ideal-time scene))			(chomet.123:42, 59-60)
```

17.5 - 6.08 = 11.42, within the bounds; give-every-task-its-ideal-time then gives the task its ideal, 3.98 seconds, and the scene runs 3.98 against its own least of 10: 17 frames at 4 a second (run so: `test/fit.test.js`). And beside it, the three slips this section listed as left alone: resurect-bad-time-fits looks for `more-time-needed:` (`chomet.123:193`) where time-fit-score-1 writes `need-more-time:` (`413`); redistribute-time-for-tasks adjusts a scene too short by `(-$ new-length scene-minimum)`, less than nothing, and one too long by more than nothing (`61-64`), which adjust-task-lengths adds to each task (`160`); and adjust-task-lengths gives a task below its least its most, ";;must be too large", and one above its most its least (`167-180`), its least always none, `(min-least-time 0.0)` (`121, 129`).

The correction (REVIVE;FIT, wraps of CHOMET's functions after KEN;CHOMET loads): once approve-or-remake-tasks-choices has given the tasks their times, the scene's planned length as your code sums it (`chomet.123:72-74`; each part the longest of its tasks', so tasks in parallel count once) is compared with its length-bounds, and a scene below its least (or above its most) has your adjust-task-lengths move its tasks by the difference, towards the bound, each within its own least and most; what that leaves each part's longest task takes in proportion, past its most if need be, and SCENE's own stretch fills the part (`s15`, note `scene-time-kept`). And the three slips: `need-more-time:` heard (`s15-reason`, note `need-more-time-heard`), the signs (`s15-signs`, note `scene-time-sign`), the least and most (`s15-least-most`, note `task-time-bound`).

**In your Cinderella with SLIPS** (all of them, chained; before S15 in parentheses): the Introduction 230 (230), as before, its 55.62 seconds within its bounds; **Kept Apart 109 (107)**, planned 29.75 seconds against its least of 30 and held to 30 (its parts 1.60, 14.45 and 13.95 seconds, from 1.53, 14.36 and 13.86), the film differing from frame 1, the guard's part ending at 107 (105) and the feelings' part beginning at 61 (60); **No Longer Kept Apart 54 (17)**, held to 10 seconds, the fairy godmother's accompanying stretched by 2.51 (a `task-time-bound` note: within its most it would be 6.95), and she goes to Cinderella (frames 2 to 6), turns towards the Prince over two and a half seconds and walks her towards him for nine (frames 8 to 52); **the Meeting 182 (175) and Justice 88 (84)**, planned as before, from where the scenes before now leave everyone. At 24 frames a second 1379, 705, 336, 934 and 482 (1379, 702, 106, 887 and 433). The godmother no longer gets Cinderella to the Prince: they end 237 dots from him (30 before; 223 at 24, 23 before), since her stretched walk takes its stretch twice (decision 6 below, now reached by S15: FIT's README has a probe with it taken once, in which she gets her there in 11 seconds). Pass 1 is as before; from your 1978 positions, Kept Apart's and No Longer Kept Apart's pass 2 now differ from KNOW's too (`from-1978/`). Notes: `scene-time-kept` on Kept Apart and No Longer Kept Apart, `task-time-bound` on No Longer Kept Apart's task. In `speed.json` the run with SLIPS has Kept Apart's changes begin a frame later (61) in a film of 109 frames; the 1978 run, which confirms the inversion, is as it was. Alone, beside KNOW's (`each.json`): 225, 156, 56, 186 and 84 frames (KNOW's 225, 116, 17, 179 and 84), Kept Apart and No Longer Kept Apart held to their least, and at 4 frames a second Kept Apart's guard running to its end (frame 154), its feelings' part, a tick later, no longer having the film stopped before it (stage 6's findings 6 and 7; with all the corrections S14 sees to that).

**In stories** (16 October, S15 as first made, before S16; `reports/ext/fit/README.md`, "In stories", has the stories with the page's set and FIT as it is now). GPT-6.1 Sol's fifteen JSON trial stories (`reports/llm-trials/2026-10-13 gpt-6.1-sol json/`), with SLIPS before S15 (`(s15)` off) and with it, at 4 frames a second (`run-story`'s way, each scene from where the last left everyone). Two stop in pass 1 either way, as before (Beauty and the Beast, The Lion and the Mouse). Of the other 53 scenes, 32 are held to their least (one, the Ugly Duckling's first, to its most, after `need-more-time:` was heard for a way of showing that needed 13.19 seconds more), and 7 more start elsewhere; 14 are as before. The plans were short of their least by much: Gingerbread Man's Running Away 2.66 seconds of 24, the Tortoise and the Hare Again's Race 2.72 of 20 and Victory 3.38 of 40. Five held scenes film no longer than before (2 to 7 frames: Goldilocks' Introduction, the Fox and the Crow's Proud Crow, the Gingerbread Man's Cheeky Gingerbread Man, the Ugly Duckling's Lonely Winter, and Goldilocks' second, 188 either way): their films end for reasons of their own, as before. One scene stopped pass 2 as S15 was first written, Jack's Escape, which has no length-bounds (none of its tasks was ever given a share: Jack's undoing of the chase can't be shown, and the feelings run in parallel); FIT leaves such a scene as it is, and it is 2 frames, as before.

| Story | Scene | Bounds (s) | Planned (s) | Held to (s) | SLIPS before S15 | With S15 |
|---|---|---|---|---|---|---|
| goldilocks-and-the-three-bears | introduction | 48 to 120 | 16 | 48 | 7 | 7 |
| goldilocks-and-the-three-bears | bears-find-goldilocks | 48 to 120 | 47.91 | 48 | 188 | 188 |
| goldilocks-and-the-three-bears | chased-away | 24 to 60 | 15.95 | 24 | 10 | 77 |
| hansel-and-gretel | gretel-fights-back | 17.14 to 42.86 | 16.02 | 17.14 | 65 | 67 |
| hansel-and-gretel | home-together | 34.29 to 85.71 | 16.64 | 34.29 | 74 | 135 |
| jack-and-the-beanstalk | pursuit | 24 to 60 | 13.21 | 24 | 109 | 197 |
| jack-and-the-beanstalk | happy-together | 48 to 120 | 21.71 | 48 | 162 | 290 |
| red-riding-hood | kept-apart | 40 to 100 | 31.96 | 40 | 133 | 148 |
| red-riding-hood | rescue | 20 to 50 | 19.62 | 20 | 71 | 72 |
| red-riding-hood | together-again | 40 to 100 | 36.46 | 40 | 164 | 152 |
| romeo-and-juliet | kept-apart | 30 to 75 | 28.22 | 30 | 113 | 117 |
| romeo-and-juliet | together-in-sorrow | 45 to 112.5 | 32.47 | 45 | 326 | 548 |
| snow-white | chased-away | 13.33 to 33.33 | 9.19 | 13.33 | 6 | 8 |
| snow-white | protection | 26.67 to 66.67 |  | within | 147 | 148 |
| snow-white | prince-arrives | 26.67 to 66.67 |  | within | 235 | 249 |
| snow-white | happy-together | 26.67 to 66.67 |  | within | 158 | 162 |
| the-boy-who-cried-wolf | first-trick | 24 to 60 | 5.63 | 24 | 38 | 77 |
| the-boy-who-cried-wolf | tricked-again | 24 to 60 | 17.76 | 24 | 51 | 82 |
| the-boy-who-cried-wolf | real-wolf | 24 to 60 | 21.47 | 24 | 323 | 176 |
| the-boy-who-cried-wolf | wolf-chases-sheep | 24 to 60 | 15.41 | 24 | 63 | 56 |
| the-fox-and-the-crow | proud-crow | 48 to 120 | 24 | 48 | 2 | 2 |
| the-fox-and-the-crow | flattery | 48 to 120 | 21.61 | 48 | 10 | 16 |
| the-gingerbread-man | cheeky-gingerbread-man | 24 to 60 | 8 | 24 | 6 | 6 |
| the-gingerbread-man | running-away | 24 to 60 | 2.66 | 24 | 4 | 40 |
| the-gingerbread-man | false-friend | 48 to 120 | 36 | 48 | 61 | 112 |
| the-gingerbread-man | fox-catches-him | 24 to 60 |  | within | 117 | 118 |
| the-three-little-pigs | the-chase | 15 to 37.5 | 13.13 | 15 | 73 | 88 |
| the-three-little-pigs | keeping-the-wolf-out | 30 to 75 | 15.82 | 30 | 32 | 75 |
| the-three-little-pigs | safe-together | 30 to 75 | 15.63 | 30 | 87 | 183 |
| the-tortoise-and-the-hare | boasting | 30 to 75 | 24.67 | 30 | 173 | 252 |
| the-tortoise-and-the-hare | pushed-around | 30 to 75 | 24.67 | 30 | 116 | 128 |
| the-tortoise-and-the-hare | pride-and-shame | 60 to 150 |  | within | 238 | 234 |
| the-tortoise-and-the-hare-again | race | 20 to 50 | 2.72 | 20 | 6 | 20 |
| the-tortoise-and-the-hare-again | steady-progress | 40 to 100 | 16.06 | 40 | 13 | 79 |
| the-tortoise-and-the-hare-again | victory | 40 to 100 | 3.38 | 40 | 2 | 54 |
| the-ugly-duckling | unwelcome-duckling | 17.14 to 42.86 | 45.47 (need-more-time: heard) | 42.86 | 115 | 123 |
| the-ugly-duckling | pushed-around | 17.14 to 42.86 |  | within | 149 | 203 |
| the-ugly-duckling | lonely-winter | 51.43 to 128.57 | 25.71 | 51.43 | 2 | 2 |
| the-ugly-duckling | spring-welcome | 34.29 to 85.71 |  | within | 205 | 214 |


### S16: a stretched walk takes its stretch once (REVIVE;FITSTR), and S8 with FIT

Added by your decision 13 (17 October): "yes, correct the stretch and S8 too except when in the mode of keeping it to the 1978 version". Your PLACE's multiply-dynamics-by-factor writes the parent's speed factor into a walk's own, `(*$ factor (or (ask ,special-dynamics recall your (speed factor)) 1.0))` (`place.45:455-461`), and your Director's demon multiplies it in again the first time the walk is set (`dichar.103:27-31`), so a stretched walk took its stretch twice (left alone here before, decision 6 below). Pass 2 now keeps the parent's factor written in, `(speed from-parent)`, and Director divides it out before the demon multiplies the parent's in (`s16`; note `stretch-once`). S16 and S8 are FIT's (REVIVE;FITSTR and REVIVE;SLIPS8), on with the revival's extensions, and SLIPS, which requires FIT, has them as before; `reports/ext/fit/README.md` has why, and what they change with the page's set. **In your Cinderella with SLIPS** (before S16 in parentheses): the Introduction 250 (230), the stepmother's pushing (stretched by 0.51) and Cinderella's helping her (0.57) no longer taking their speed-up twice; Kept Apart 122 (109), the guard's walks taking their stretch once (0.71, not 0.71 squared), its six cycles ending at frame 104, the feelings at 120; No Longer Kept Apart 34 (54), the godmother's walk at 0.32 of her speed, not 0.13, Cinderella coming within 60 dots of the Prince at frame 30 and the accompanying ending when the godmother is at his place (88 dots from her; 30 before S15, 237 with S15 alone); the Meeting 185 (182) and Justice 73 (88), their stretched walks taking the stretch once. At 24 frames a second 1506, 729, 202, 967 and 493 (1379, 705, 336, 934 and 482). Notes, `stretch-once`: 5 in the Introduction and Kept Apart, 1 in No Longer Kept Apart, 3 in the Meeting, 2 in Justice. S16 alone, beside KNOW's, is in `each.json`.

### Left alone: two in Director, and one MEND repairs

Found while correcting the others, each changing nothing in your Cinderella (CHOMET's redistribution of a scene's time, left alone here until your request of 16 October, is S15, above):

- change-to:-package merges a change without its method (`cosug.215:509`): REVIVE;MEND7 puts the method back.
- The special dynamics a character's changes carry forth are found once and kept (`dichar.103:22-26`, "or :old-value"), so a change in a later subscene grows the dynamics of the subscene where her first change was, which no longer move her. Left as it is: S13 carries each change into the walks of its own part, so the walks it was to reach take it (with DETAIL's rhythm she changes in several parts of a scene).
- *Corrected since your decision 13, as S16 (above):* a walk made by your multiply-dynamics-by-factor has its parent's speed factor in its own already, `(*$ factor (or (ask ,special-dynamics recall your (speed factor)) 1.0))` (`place.45:455-460`), and the demon multiplies it in again the first time the walk is set (`dichar.103:27-31`): Kept Apart's guard, stretched by 1.97, gives its walks a parent of speed factor 0.71 (one over the square root of the stretch, `disply.311:421-427`) and walks of 0.67 and 1.4 times that, 0.48 and 1.0, and Director moves them at 0.34 and 0.71, the stretch taken twice (in 1978 and with SLIPS, which keeps the first multiplication as yours). Found while correcting S8 after the review of stage 7; not corrected, since it is in every stretched or repeated activity of yours and would change them all: for you.
- The `pick-value-with-variety` slip, found by the same stage, is S12.

## All of them: the chained film

| Scene | 1978 | KNOW | With SLIPS | At 24 frames a second: 1978 | KNOW | With SLIPS |
|---|---|---|---|---|---|---|
| Introduction | 192 | 225 | 250 | 917 | 1241 | 1506 |
| Kept Apart | 116 | 116 | 122 | 701 | 701 | 729 |
| No Longer Kept Apart | 17 | 17 | 34 | 113 | 113 | 202 |
| Meeting | 179 | 179 | 185 | 1051 | 1051 | 967 |
| Justice | 84 | 84 | 73 | 458 | 458 | 493 |

(Before S16, 17 October, with S15: 230, 109, 54, 182 and 88, and at 24 frames a second 1379, 705, 336, 934 and 482. Before S15, 16 October: 230, 107, 17, 175 and 84, and at 24 frames a second 1379, 702, 106, 887 and 433. Before the review of stage 7, without S13 and S14 and with S8 taking a change twice: 230, 115, 19, 180 and 85, and at 24 frames a second 1379, 712, 109, 878 and 442.)

The account below is of the film as it was before S15 and S16, frame numbers and all; with them (S15 and S16, above) the Introduction's helping and pushing take their stretch once (250 frames: the helping, part 5, frames 157 to 206), Kept Apart is held to 30 seconds and its guard takes its stretch once (122 frames: the guard to 104, the feelings to 120), No Longer Kept Apart is held to its 10 seconds and the godmother brings Cinderella towards the Prince (34 frames), and the Meeting (185) and Justice (73) start where those leave everyone, their stretched walks taking the stretch once.

- **The Introduction**, 230 frames: the joys take their five ticks from the start (S9, S11), and grow once (S10); the following as KNOW's (frames 0 to 50); the stepmother's pushing (50 to 113, KNOW's 52 to 103) no longer speeds up push by push (S8); the chasing (113 to 115) and the hitting (115 to 155) as KNOW's; **Cinderella helps her stepmother** (155 to 189; S1 and S2); she accompanies the Prince, who comes on (189 to 228). At 24 frames a second, 1379: the accompanying (1056 to 1377) has two of MEND12's `overdue-move` notes, Cinderella and the Prince each kept waiting more than two seconds as she goes to him and he comes on, and stopped as if there. As before the review: S13 and S14 change nothing here.
- **Kept Apart**, 107 frames: the guard (frames 3 to 105) no longer slows down cycle by cycle (S8), getting round more often (64 events against 51). The feelings' part begins at frame 60, at the speeds Ani planned, grown once (S9, S10, S11), and **the feelings now show on the guard's walks** (S13; the film differs from before from frame 63, when Cinderella's next walk is set): Cinderella's two guard walks go from 0.68 and 0.51 to 0.46 and 0.34 (her sadness, by two-thirds at high speed), her path's curvature falls from 1.0 towards a quarter of it over her change at low speed, and its length doubles by frame 88; the stepmother's go from 1.42 and 1.63 to 1.74 and 1.99 (her joy, by 1.25 at medium speed, four steps: 1.22), her path's curvature rises from 0.25 to 1.01 by frame 74 and its length doubles: Cinderella "gradually slows down and moves in long straight lines", and "Concurrently, her stepmother speeds up and moves in long highly-arcing curves" (p. 66). Before the review Cinderella's sadness touched one of her two walks for two ticks, and the stepmother's joy none (S13 says why). The guard's part ends first (frame 105), and tells the feelings' part it has ended too (stage 6's finding 6); the film stops at 107, with Cinderella's change of path-curvature, planned for 13.9 seconds from frame 60, nine of its 55 steps short. At 24 frames a second, 702 frames (from frame 383): the guard's part ends at 677 and the feelings' part runs on to its own end at 700.
- **No Longer Kept Apart**, 17 frames, **the Meeting**, 175, and **Justice**, 84: each starts where the scene before left everyone, and the Meeting's and Justice's feelings are at their planned speed. In the Meeting the joys' part (subscene 7, frames 171 to 175) is carried into the walk to each other it extends (S13), which ends at 173, the film at 175, the joys cut short as in 1978 (finding 6). In Justice **the stepmother's second walk is as slow as her first** (her sadness taken once, S8: her walk 0.34 throughout, where before the review her second walk, from frame 53, was 0.22), with a `factors-once` note. At 24 frames a second the Meeting's joy's part, which ran to its end in KNOW's film (frame 1049), is cut short when the part it extends ends (885): stage 6's finding 6, which part ends first deciding.

Pass 1 is CP 29 byte for byte, with the three choice points of S3 hearing friendly (`pass1-tendencies.json`), and three notes. Planned from your 1978 positions (`from-1978/`), the Introduction's pass 2 differs from KNOW's, as S1 says, and since S15 Kept Apart's and No Longer Kept Apart's, each held to its least; the other corrections act in Director, and the Meeting's and Justice's pass 2 are 1978's.

## The glass box

Each correction notes where it acted, through REVIVE;WRAP's `revival-note`, as MEND's repairs do: pass 1's `repairs` (S3's, on the choice points), each glass box's `repairs` (S1's, S2's, S6's, on the task), and each film's `repairs` (S8's to S11's and S13's, on Director's subscene; S14's, on the part the film waited for; S7's and S12's, on MIDDLE and on the element, wherever they act).

| Kind | Correction | On | was | now | because |
|---|---|---|---|---|---|
| `is-not-in-the-scene` | S1 | the task | `(no such character exists)` | `step-mother` | `(part-of introduction)` |
| `described-as-preferred` | S2 | the task | `(weak good)` | `(step-mother anyone)`, all, any or anyone | `(in introduction)` |
| `no-such-generator` | S1 | the task | `(is-desired-by step-mother)` | `nil` | `(not-defined)` |
| `variety-pick` | S12 | the element | `(high (positive high))`, the level and your pick | the pick | `(counts ((count value) ...))` |
| `friendly-attraction` | S3 | the choice point | `attraction-to-strangers` | `attraction-towards-strangers` | `(friendly (positive medium) medium)` |
| `prerequisite-not-met` | S6 | the task | the method | `dropped` | `((on-stage kid))`, the prerequisite |
| `middle-less-than` | S7 | MIDDLE | `nil` | `top` | `((not bottom))` |
| `stretch-once` | S16 (FIT) | Director's subscene of the dynamics | `0.3184`, the walk's own factor as pass 2 wrote it | `0.8`, as a factor of its parent's | `(the-parents-factor-in-it 0.398 <the dynamics>)` |
| `factors-once` | S8 | Director's subscene | `(((speed factor) 0.71327145))`, the factors your demon would have applied again | `once` | `(set-again <the dynamics>)`, and if a change would have been taken twice `(set-again <the dynamics> (a-change-taken-twice (((speed factor) 0.67034785))))` |
| `change-at-its-speed` | S9 | Director's subscene | `(step-mother path-curvature by 4.0 at high speed in 55 ticks)` | `(in 14 ticks)` | `(disply estimates 3.4657359 seconds)` |
| `grown-once` | S10 | Director's subscene | `(cinderella speed twice a tick)` | `(once a tick)` | `(has-it-from <the scene's dynamics>)` |
| `change-steps` | S11 | Director's subscene | `(4 steps of 5)` | `(5 steps)` | `(cinderella speed)` |
| `carried-forth` | S13 | Director's subscene of the scene's dynamics | `(cinderella speed (special-dynamics-of cinderella in (subscene-of kept-apart 3)))`, the character, the element and the scene's dynamics your change grows | the dynamics that carry it to her walks, `(\|(special-dynamics-of cinderella in (subscene-of kept-apart 2))-12\| ...)` | `(walks-of (subscene-of kept-apart 3) (subscene-of kept-apart 2))` |
| `film-waited-for-activity` | S14 | the part waited for, Director's subscene | `stopped` | `kept-filming` | `(((subscene-of pursuit 2) ended at frame 9))` |
| `scene-time-kept` | S15 (FIT) | the scene | `(planned 3.98)` | `10.0`, the scene's time now | `((length-bounds 10.0 25.0) (convey-task-3 was 3.98 now 10.0 least 2.792 most 6.95))` |
| `task-time-bound` | S15 (FIT) | the task | `2.792`, the bound your adjust-task-lengths would have given it | `6.95` | `(new-time 10.0 most 6.95)` |
| `need-more-time-heard` | S15 (FIT) | the scene | `nil`, what your resurect-bad-time-fits found | `11.76` | `(ideal-difference (need-more-time: ideal-difference 11.76 will-accept 0.324))` |
| `scene-time-sign` | S15 (FIT) | the scene | your adjustment | the corrected one | `(new-length L bound B)` |

## For the page (stage 7)

- **The switch.** `src/pipeline.js`'s registry has SLIPS with `group: "repairs"` and `optIn: true` (every entry now has a `group`; SLIPS and DETAIL are `optIn`), requiring KNOW: "Which extensions" lists it under repairs, unticked when the switch is turned on, and ticking it ticks KNOW and MEND.
- **The notes** above, each a plain sentence with Ken's line and a code link. For instance: `described-as-preferred` ("Good helps someone ideally weak and good, and failing that anyone (thesis p. 100). No one in the scene is either, so Cinderella helps her stepmother. In 1978 is-not was given the task, not the scene, and never found anyone: a slip SLIPS corrects (sugest.123:333, scene.9:380)"); `change-at-its-speed` ("Ani planned this change for 3.5 seconds; your Director ran a change at high speed four times as long, multiplying by the speed's weight where DISPLY's estimate divides (dichar.103:105-109, disply.311:1104-1106): SLIPS runs it as planned"); `factors-once` ("Each time the stepmother's walk is set again, your Director multiplied in her parent's factor again, so each cycle was slower (dichar.103:27-31); SLIPS takes it once"). The film's notes are many (Director's, one for each change); the page might group them by kind and subscene.
- **Pass 1's notes.** S3's three `friendly-attraction` notes are pass 1's `repairs` (the run's `repairs`, and each choice point's memory in pass 1's glass box): the pass-1 view should show them on Cinderella's three tendency choice points, beside friendly's suggestion there, which is new with SLIPS.
- **The film's notes and the frame.** S8's to S11's notes are the film's `repairs`, on Director's subscene; the film's events give each subscene's beginning and end, so the page can say them as the part they belong to plays.
- **The two helps.** The Introduction's task chain should say why helping the stepmother displaced helping the Prince: the two are "identical" to your find-related-suggestions, and the first is the main one (S1, above).
- **The speed check** (`speed.json`) is the evidence for S9 and S10: the page could show it as a small table where the inversion is said.
- **The bundle** needs SLIPS' files (`node tools/build-ani-bundle.mjs` with the extensions the page offers), and the page's frame counts for Cinderella with SLIPS are this README's.

## For the page (the review of stage 7)

What the page must change for the corrections made after the review of stage 7 (`app/`, `tools/build-film-app.mjs` and `tools/check-film-app.mjs` are the page's):

- **The bundle and the code links.** SLIPS has two new files, `slip13` and `slip14` (the registry's `files`), and MEND one, `mend20`; REVIVE;WRAP, SLIPS, SLIPS1, SLIPS8, SLIPS9, CHSHOW, DTWALK, DTTEND and DTRHYM changed (two helpers moved into WRAP, `dynamics-have-it-from?` and `subscene-of-dynamics`, where CHSHOW's `has-it-from?` and DTWALK's `dtwalk-subscene-of` were). The bundle wants building again (`node tools/build-ani-bundle.mjs` with the extensions the page offers), and the code links to the revival's files their new lines.
- **The registry's notes** for SLIPS and MEND changed (`src/pipeline.js`): SLIPS' now says a change is counted once and carried forth into the walks of its part, that the film waits for the activity a feeling extends, and what Kept Apart shows; MEND's names its new repair. The panel's sentences for them should follow.
- **The frames.** Your Cinderella with SLIPS (with MEND and KNOW), chained, is now 230, 107, 17, 175 and 84 frames at 4 frames a second (1379, 702, 106, 887 and 433 at 24), where it was 230, 115, 19, 180 and 85 (1379, 712, 109, 878 and 442): Kept Apart from frame 63, as the feelings reach Cinderella's guard walks, and the scenes after it from where it now leaves everyone. With DETAIL, with SEEN, with the page's four, and as in 1978, every film is as it was (`check-1978`, `check-ext`). `check-film-app`'s counts for SLIPS want these.
- **New note kinds**, each a sentence with your lines:
  - `carried-forth` (S13, on the part of the scene's dynamics, one for each character and element): was `(cinderella speed (special-dynamics-of cinderella in (subscene-of kept-apart 3)))`, now the dynamics that carry it, because `(walks-of (subscene-of kept-apart 3) (subscene-of kept-apart 2))`. For instance: "In Kept Apart the feelings' part, part 3, extends the stepmother's standing guard, part 2. Ken's Director grew the dynamics of the feelings' part (dichar.103:112-117), which the guard's walks don't descend from, so a feeling reached only the walk a character happened to walk while it changed; SLIPS carries each change into the guard's walks as well, through the dynamics they take each factor from, as Ken's comment says a change is to be carried forth: Cinderella slows down and her paths straighten and lengthen, the stepmother speeds up and her paths curve more and lengthen, as the thesis tells it (p. 66)." Group them by character, as the S9 to S11 notes are; elements Director doesn't read (activity-level, rhythmic-level, acceleration, and deliberateness without DETAIL) can be left out of the sentence.
  - `film-waited-for-activity` (S14, on the part waited for, once): was `stopped`, now `kept-filming`, because `(((subscene-of pursuit 2) ended at frame 9))`. "The feelings' part ended at frame 9, with the giant still chasing Jack. Ken's Director stops the film when a part ends and nothing seems to be running (action.152:67-91), but the part a feeling's part extends is never on its list of running parts, so in 1978 the chase was cut there. SLIPS keeps filming until the chase's part ends." It is not reached in your Cinderella with SLIPS, so only a story shows it.
  - `factors-once` (S8) may now have a third element in its `because`, `(a-change-taken-twice (((speed factor) 0.67034785)))`: the walk had grown by a change its parent's factor carries too, and your demon would have taken it twice. In Justice: "As the stepmother is aware of them, her walk is set again, and Ken's Director would have taken her sadness twice, once in the walk's own factor, which the change grew as she walked, and once in its parent's, which the change grew too (dichar.103:27-31, 110-121): her second walk was slower than her first. SLIPS takes it once, and her second walk is as slow as her first." The caption "each cycle is no slower than the last" fits it too.
  - `offstage-corner` (MEND20, on the part where a character was shown): was `(if still offstage 725.24578 ymax)`, now `(left-at (xy-position -0.56109452 0.58830916))` or `(if still offstage 725.24578 557.77005)`, because `(first-pig at (-749.03395 588.30916))`. "The first pig was left off the stage past its top left corner when the scene before ended, and Director, showing him there, plans to place him again each tick until he is on the stage, but with ymax unevaluated, a comma left out (dichar.103:41-49): Ani as in 1978 stopped there, \"not a number: YMAX\". The revival leaves him where he is, a place that can't move, for a walk to bring him on." (with `if still offstage`: "... places him again each tick, with the number, until the place he is to follow is on the stage.")
- **The speed check** (`speed.json`) now carries what Director measured: each change's `measuredTicks` (the ticks its factor grew for, null if the film ended first, 0 for your change of a tick, which takes no step) and `measuredRatio` (those over DISPLY's estimate), and a `summary` for each speed: the changes, those measured, the least and most measured ratio, and those not measured. In 1978 at high speed 10 of the 20 are measured, 3.70 to 3.90 times their estimate (the Meeting's ten end with the film), at medium the 4, 0.67, and at low 3 of the 11, 0.22 to 0.23 (the Introduction's eight take no step); `check-slips` asserts that each measured change grew for the ticks of DICHAR's formula less one (S11), 25 of them (the 8 of a tick, which change nothing, among them). The page's table ("the run that confirmed it") should show the measured ratios, not the formula's.
- **pow.** EXPT now calls `src/maclisp/libm.js`'s pow (BigInt arithmetic; decision 7 below), so the page's runtime, which bundles `src/maclisp`, wants building again; nothing it films changes.
- **The sentences that say the feelings play at the pace Ani planned** (the registry note, the panel, the captions) are now true of what the viewer sees in Kept Apart; the caption for Kept Apart's part 3 can say the feelings are carried into the guard's walks. (`Cinderella's and the stepmother's`, not `Cinderella and the stepmother's`, the review's minor 11.)

## For the page (S15, 16 October)

- **FIT is an extension of its own**, on with the revival's extensions (`reports/ext/fit/README.md`, "For the page", says what the page must change: `"fit"` in `SWITCHED`, the bundle, the frames); SLIPS requires it, so ticking SLIPS ticks FIT, and unticking FIT unticks SLIPS.
- **The frames with SLIPS** are now 250, 122, 34, 185 and 73 at 4 frames a second, and 1506, 729, 202, 967 and 493 at 24 (`check-film-app`'s counts for SLIPS want these); since decision 13 FIT has S16 and S8 too (its files `fit`, `fitstr` and `slips8`), and a new note kind, `stretch-once`, whose sentence is in FIT's README.
- **The new note kinds**, a sentence each, are in FIT's README: `scene-time-kept` (for instance: "No Longer Kept Apart is a short scene, 10 to 25 seconds, but Ken's CHOMET, having moved its one task's time to fit its only way of showing, judged the scene by a length the task would not have, and gave the task 3.98 seconds (chomet.123:39-74). The revival holds a scene to its length's bounds once its tasks have their times (Ken's decision of 16 October): the fairy godmother's accompanying is stretched to fill 10 seconds."), `task-time-bound`, `need-more-time-heard` and `scene-time-sign`.

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

1. **Is SLIPS' list right?** S1 (with S2), S3, S6, S7, S8, S9, S10, S11, S12, and since the review of stage 7 S13 and S14, corrected; S4 and S5 left as they are. The speed inversion is in, the run confirming it (now from what Director measured).
2. **CHOMET's redistribution: settled** by your request and decision of 16 October: corrected, as S15, in FIT, on with the revival's extensions (`reports/ext/fit/README.md`, with its own decisions: a scene filled past its tasks' most, and the stretch taken twice, now reached in your godmother's scene).
3. **Cinderella helps her stepmother.** With S1 and S2 her goodness finds the only other one in the scene, who is neither weak nor good, and displaces friendly's helping the Prince, since your relating takes the two helps as identical. That is your code corrected; say if the helping of the Prince should come first (it would, if the order of her words put friendly before good). In other stories too: a good heroine with no one weak or good beside her helps whoever is there, often the villain, in place of helping her friend (Red Riding Hood's helps the wolf, not her grandmother; the review of stage 7).
4. **Your stage 6 decision 12, again: answered in SLIPS, S14.** With the feelings at their planned speed, a feeling's part that extends an activity and ends first stopped more stories in the middle of the activity (finding 7): `test/stories/stress/detail-rhythm.lisp`'s first scene, a chase and then the goat sad, 13 frames with SLIPS, 49 without; Jack's pursuit 11, 109 with KNOW. S14 keeps the film going while the activity a part of changes extends still runs, as CHSHOW's wait does for a change. Recommended: in SLIPS, as now; say if it should be in SEEN, and so with the page's four (your Kept Apart with KNOW, where the feelings' part ends first, would then run the guard to its end).
5. **S13, the change carried forth.** Your change grows the dynamics of its own part, which the walks of the activity a feeling's part extends don't descend from, and your demon reaches a walk's parent only; S13 grows, beside them, the dynamics the walks take each factor from, so Kept Apart's feelings show on the guard as the thesis tells them. Recommended: as now; say if you would rather the feelings show only where your code had them reach (Cinderella's sadness on one walk for two ticks, the stepmother's joy nowhere).
6. **A stretched walk takes its stretch twice: settled** by your decision 13 (17 October): corrected, as S16, with FIT, on with the revival's extensions and in SLIPS (above).
7. **The same film in every engine: EXPT.** Node's `Math.pow` (V8 13.6) is neither fdlibm's (`e_pow.c` written out as `libm.js`'s other functions are differs from it in the last bit on about one random argument in thirteen) nor correctly rounded (about one in two thousand is an ulp off: 1.5^0.25 is 1.1066819197003217 in Node, 1.1066819197003215 correctly rounded, and 20^23 is 8.388608000000001e+29), so no pow written out can be Node's own bit for bit, and another engine's pow need not be V8's. EXPT (and `^` and `^$`) now use `libm.js`'s pow, the correctly rounded power worked out exactly in BigInt, the same in every engine. On every pow this repository's checks ask for it is Node's: a hook on `Math.pow` compared the two on every call while every check of this branch ran (check-1978 in every mode, check-ext, check-slips, check-change, check-appear, check-detail and all of check-stress), and none differed, so every film is as it was (`test/libm.test.js` keeps those arguments). A new story whose change asks for a power where Node's is an ulp off (a bridge by 1.5 over four ticks, say) films with the correctly rounded one, in every engine. Recommended: as now.
