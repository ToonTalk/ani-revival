# Cinderella with FIT: a scene keeps its time (S15), and a stretch is taken once (S16, S8)

*16 October 2026.* You asked to "settle the CHOMET question so the godmother scene keeps its time", and then decided: "let's not change the revival film when 'Ani as in 1978' is selected – otherwise go ahead". So the correction of your CHOMET's slips in dividing a scene's time among its tasks (stage 7's question 2, `reports/chapter-x/PLAN.md`) is **FIT** (`src/director/revive/fit.lisp`, REVIVE;FIT; the "fit" extension in `src/pipeline.js`): a repair, group repairs, requiring MEND, not opt-in, so the page's switch is to turn it on with MEND, KNOW, APPEAR, CHANGE and SEEN. It is the correction SLIPS numbers S15 (`reports/ext/slips/README.md`), and SLIPS requires it. Ani as in 1978 and MEND alone are byte for byte as before (`tools/check-1978.mjs`, plain and `--extensions mend`), and so are KNOW's, APPEAR's, CHANGE's and SEEN's goldens, which are made without FIT.

These are the files your Cinderella makes with FIT (with MEND), chained scene to scene as the film page makes them, at 4 frames a second here and at 24 in `24fps/`; `from-1978/` has the pass 2 of the four scenes whose plans FIT changes, planned from where your 1978 film left the characters (below). `node tools/check-ext.mjs --extensions fit` checks that a run still makes them (and `--fps 24`); `--save` makes them again. `npm test` runs `test/fit.test.js`, which plans your No Longer Kept Apart as in 1978, 3.98 seconds, and with FIT, 10.

## The slips

No Longer Kept Apart is short, `(length-bounds (10.0 25.0))`, with one task, allocated `(10.0 25.0)`. Its only way of showing Ani can show, `goes-to-and-accompanys` (ideal 3.98 seconds, least 2.79, most 6.95), is rejected by your time-fit-score-1:

```lisp
       ((< upper-estimated lower-allocated)
	'(too-much-time: ideal-difference ,(-$ ideal lower-allocated)
			 will-accept ,(-$ upper-estimated lower-allocated)))	(chomet.123:409-411)
```

as `(too-much-time: ideal-difference -6.02 will-accept -3.05)`. Your approve-or-remake-tasks-choices brings it back with resurect-bad-time-fits and asks for -6.08, the difference "increase[d] a percent to avoid round-off screws" (`chomet.123:23-33`), and redistribute-time-for-tasks moves the task's allocation by it, to `(3.92 18.92)`, has it choose again, and judges the scene:

```lisp
 (let ((total-time-change (apply '+$ (mapcar 'car time-changes)))
       ((scene-minimum scene-maximum) (ask ,scene recall your length-bounds)))
      (let ((new-length (+$ (*$ (+$ scene-minimum scene-maximum) .5) total-time-change)))
       ...
	   (cond ((and (> new-length scene-minimum) (< new-length scene-maximum))
		  (give-every-task-its-ideal-time scene))			(chomet.123:40-42, 59-60)
```

The bounds' midpoint plus the change, 17.5 - 6.08 = 11.42, is within the bounds; but it is not the length the tasks are then given. give-every-task-its-ideal-time gives the task its ideal within its new allocation, 3.98 seconds, and the scene's running time, as your code sums it (`chomet.123:72-74`), is 3.98 against its own least of 10. SCENE stretches nothing (stretched-by 1.0), and the film is 17 frames at 4 a second: "things happen too quickly and the fairy godmother just appears and is quickly gone" (p. 69, L1956-1958). Run so (`test/fit.test.js` reproduces it).

Three slips beside it, on the way there:

- resurect-bad-time-fits looks for a reason your scoring never writes, `(eq (first reason) 'more-time-needed:)` (`chomet.123:193`), where time-fit-score-1 writes `'(need-more-time: ...)` (`chomet.123:413`): a task whose only way of showing needs more time than it is allotted is never given it, and is "can't do".
- redistribute-time-for-tasks adjusts a scene the change makes too short by `(-$ new-length scene-minimum)`, less than nothing, and one too long by `(-$ new-length scene-maximum)`, more than nothing (`chomet.123:61-64`), while adjust-task-lengths adds the adjustment to each task's time, `(+$ ideal-time task-adjustment)` (`chomet.123:160`).
- adjust-task-lengths gives a task whose new time falls below its least its most, ";;must be too large", and one above its most its least, ";;must be too small" (`chomet.123:167-180`); and the least it compares with is always none, since time-bounds-for-task starts it at `(min-least-time 0.0)` and takes a method's least only if it is less (`chomet.123:121, 129`).

Read together, the signs and the bounds might have been one convention; your thesis says which: "Ani tries to constrain the film to be a (user) desired length ... Each activity responds to questions about how long it would ideally like to run for and also what is the minimum and maximum time that is acceptable. If a reallocation is necessary the activities themselves are asked to stretch or shrink" (p. 126, L3394-3401).

## The correction

REVIVE;FIT wraps five of CHOMET's functions with `revival-wrap` once KEN;CHOMET loads (`+after-load`), in four pieces, each switchable as SLIPS' corrections are, `(setq :slips-off '(s15-reason))` before your files load; `(s15)` turns off all four:

| Piece | What | Your lines |
|---|---|---|
| `s15` | After approve-or-remake-tasks-choices has given the tasks their times, the scene's planned length, as your code computes it (the sum of its parts' running times, each part's the longest of its tasks', so tasks run in parallel count once), is held to its length-bounds: below its least (or above its most), your adjust-task-lengths is asked to move the tasks by the difference, with the sign that takes the scene to the bound, each task kept within its least and most (`s15-least-most`). What that leaves (adjust-task-lengths divides the difference evenly among all the scene's tasks, those in parallel and those passed over too, and a task can be at its most), each part's longest task takes in proportion to its time, past its most if need be, and SCENE's own stretch fills the part (`scene.9:159-183`). | `chomet.123:9-37, 59-60, 68-74`; `scene.9:137-140` |
| `s15-reason` | resurect-bad-time-fits hears `need-more-time:` as well as `more-time-needed:` | `chomet.123:193, 413` |
| `s15-signs` | redistribute-time-for-tasks adjusts by `(-$ scene-minimum new-length)` and `(-$ scene-maximum new-length)` | `chomet.123:61-64` |
| `s15-least-most` | adjust-task-lengths gives a task below its least its least and one above its most its most (what it couldn't take left over as `(-$ new-time <bound>)`), and time-bounds-for-task's least is the least of its methods' leasts; it does REVIVE;MEND11's part after it, as MEND11's wrapper did | `chomet.123:118-184` |

A scene has length-bounds only once one of its tasks has been given its share of them (the task's allocated-time demon, `scene.9:303-306, 333-344`); a scene each of whose tasks either runs in parallel with others, given its ideal (`chomet.123:106-107`), or can't be done, given none (`98-99`), never asks, so it has none, its time never fitted to its length, and FIT leaves it as it is (GPT-6.1 Sol's Jack and the Beanstalk's Escape, Jack undoing the chase, which Ani can't show, and then the two feelings, stopped pass 2 until FIT knew this).

Why past its most. The task's way of showing was brought back by your code because nothing fitted ("couldn't make a choice but have to so", `chomet.123:26`), and the scene's length is the user's; your SCENE stretches a part's methods by any factor to fill its time (warning past 8, `scene.9:163-169`). Within its most, No Longer Kept Apart would be 6.95 seconds, still under its least. Your line 15, which hands redistribute-time-for-tasks the number resurect-bad-time-fits returns where a list of `(change task)` is wanted (`chomet.123:14-21`), is reached only if the first redistribution fails; no run here reaches it, and it is left as it is.

## Your decision 13: the stretch once (S16), and S8

*17 October.* "Yes, correct the stretch and S8 too except when in the mode of keeping it to the 1978 version." So FIT also loads `REVIVE;FITSTR` and `REVIVE;SLIPS8` (the registry's `files`: wrap, fit, fitstr, slips8), on with the revival's extensions and never in "Ani as in 1978"; SLIPS, which requires FIT, has them as before (each file loads once). Why in FIT, and not an extension of their own: FIT is what makes a scene's stretches large (your godmother's accompanying, stretched by 2.51 to fill its 10 seconds), and a stretch taken twice, or compounded cycle by cycle, undoes what FIT keeps; the three go together, or the scene keeps its time with an eighth of the motion in it.

| Piece | What | Your lines |
|---|---|---|
| `s16` | A walk SCENE stretches takes its stretch once. PLACE's multiply-dynamics-by-factor writes the parent's speed factor into the new dynamics' own, `(*$ factor (or (ask ,special-dynamics recall your (speed factor)) 1.0))`, as pass 2 reads a factor of one's own, and Director's demon multiplies the parent's in again the first time the dynamics are set. Pass 2 now also keeps the parent's factor written in, `(speed from-parent)` (in the program, `(SET YOUR (SPEED FROM-PARENT) TO 0.398)`), and Director divides it out before the demon multiplies the parent's in. Note `stretch-once`. | `place.45:455-461`; `dichar.103:27-31`; `interf.149:830-847` |
| `s8` | A character's dynamics take their parent's factors once, however often they are set, and a change once (REVIVE;SLIPS8, as SLIPS has had it; `reports/ext/slips/README.md`, S8). Without SLIPS your own gradual change runs, so REVIVE;FITSTR writes it as yours, its second repeat by a receiver that keeps the growth S8 must count once (with SLIPS, SLIPS9's gradual change does it). Note `factors-once`. | `dichar.103:27-31, 102-121` |
| `s8`, with SEEN | SEEN leaves a character carried by a repeat of the part a feeling extends alone, so that the repeat, stretched over the extended time, shows the feeling (your Kept Apart). With S8 the repeat keeps its pace and can end before the feelings: Kept Apart's guard, with the page's set and FIT, ended at frame 108 and the feelings at 119, no one moving (`check-change` caught it in the beautified film). So, with S8, SEEN plans her wander and has it wait for the repeat's part to end, as for anything else that moves her. Notes `nothing-to-do` and `film-waited-for-wander`, SEEN's. | `scene.9:159-183, 223-240`; REVIVE;SEEN |

Each is switchable as the others are, `(setq :slips-off '(s16))`, `'(s8)`. `test/fit.test.js` has a walk made by multiply-dynamics-by-factor, 0.8 of dynamics with a factor of 0.5: pass 2 writes 0.4 and keeps the 0.5; set in Director, 0.4 (your demon, 0.2).

## Your Cinderella with FIT

| Scene | 1978 | With FIT | At 24 frames a second: 1978 | With FIT |
|---|---|---|---|---|
| Introduction | 192 | 192 | 917 | 1000 |
| Kept Apart | 116 | 121 | 701 | 728 |
| No Longer Kept Apart | 17 | 35 | 113 | 201 |
| Meeting | 179 | 206 | 1051 | 1076 |
| Justice | 84 | 66 | 458 | 461 |

(With FIT as first made, 16 October, before decision 13: 192, 156, 56, 186 and 84; 917, 704, 335, 1114 and 444.)

- **The Introduction** is planned as in 1978 (42.24 seconds of its 30 to 75). At 4 frames a second it is frame for frame 1978's; at 24 it differs from frame 181, its first part, the stepmother pushing Cinderella around, no longer speeding up push by push (S8): 585 frames, not 502; 1000 in all.
- **Kept Apart**, planned 29.75 seconds against its least of 30, is held to 30 (its parts 1.60, 14.45 and 13.95 seconds, from 1.53, 14.36 and 13.86; `scene-time-kept`). The guard's walks take their stretch once (S16, five `stretch-once` notes) and no longer slow down cycle by cycle (S8, four `factors-once` notes): its six cycles end at frame 106, and the feelings' part, from 65, at 119; 121 frames. (As first made, the guard slowed cycle by cycle and ran on to 154.) At 24 frames a second the guard ends at 648, the feelings at 726; 728 frames.
- **No Longer Kept Apart**, planned 3.98 seconds against its least of 10, is held to 10 (`scene-time-kept`; `task-time-bound`, its most 6.95), the accompanying stretched by 2.51, and **the fairy godmother brings Cinderella to the Prince**. Her walk takes the stretch once (a `stretch-once` note: 0.3184 of its own as pass 2 wrote it, the parent's 0.398 in it, 0.8 now, which the demon makes 0.3184 of her speed, not 0.13). She goes to Cinderella (frames 2 to 6) and accompanies her towards the Prince; Cinderella passes within a dot of him at frame 30, and the accompanying ends when the godmother is at his place, frame 33, Cinderella beside her, 87 dots from him: 35 frames, under the 10 seconds Ani planned, as she gets there sooner than its estimate. (As first made: 56 frames, ending 346 dots short.) At 24 frames a second, 201 frames, Cinderella 12 dots from the Prince at frame 190, 37 at the end.
- **The Meeting and Justice** are planned as in 1978 and start where the scene before left everyone; their stretched walks take their stretch once (S16). In the Meeting a walk of Cinderella's sped up by 2 (part 4) went at 1.87 of her speed and goes at 0.93, so the Meeting is longer, 206 frames (179); in Justice Cinderella's and the Prince's walks, slowed by a half, went at 0.175 and go at 0.35, and the stepmother's second walk takes her sadness once (S8), so Justice is shorter, 66 frames (84). At 24 frames a second 1076 and 461.

`from-1978/` has Kept Apart's, No Longer Kept Apart's, the Meeting's and Justice's pass 2 from your 1978 positions: the first two held to their least, the last two with S16's `(speed from-parent)` in their programs; the Introduction's is 1978's.

## With the page's set

Your Cinderella as the page makes it with its switch on (MEND, KNOW, APPEAR, CHANGE and SEEN), and with FIT beside them, chained, frames per scene:

| Scene | The page's set | With FIT | At 24: the page's set | With FIT |
|---|---|---|---|---|
| Introduction | 222 | 275 | 1273 | 1464 |
| Kept Apart | 116 | 121 | 701 | 728 |
| No Longer Kept Apart | 19 | 36 | 112 | 206 |
| Meeting | 200 | 213 | 1038 | 1086 |
| Justice | 128 | 102 | 967 | 795 |

(With FIT as first made: 222, 156, 58, 211 and 132; 1273, 704, 344, 1118 and 970.)

- **The Introduction** (KNOW's, 55.62 seconds, within its bounds) is longer: the stepmother's pushing and Cinderella's following, shrunk to fit their time (stretched by 0.51 and 0.55, so sped up), took the speed-up twice; taken once (five `stretch-once` notes), and the pushing no longer speeding up push by push (S8, three `factors-once`), they take longer. 275 frames (1464 at 24).
- **Kept Apart** is held to 30 seconds, as with FIT alone; the guard keeps its pace and ends at frame 108, and the feelings' part runs on to 119, Cinderella and the stepmother wandering while their feelings run (SEEN, with S8: two `nothing-to-do` notes and a `film-waited-for-wander`), so that no one stands still. 121 frames (728 at 24: the guard to 666, the feelings to 726).
- **No Longer Kept Apart** is held to 10 seconds, and the godmother brings Cinderella to the Prince: within 7 dots of him at frame 31, the accompanying ending at 34 with the godmother at his place and Cinderella beside her, 79 dots from him; 36 frames (at 24, within 6 dots at frame 194; 206 frames). With the page's set before FIT: 19 frames, 19 dots at the closest.
- **The Meeting and Justice** start elsewhere, their stretched walks taking the stretch once: 213 and 102 frames (1086 and 795 at 24).
- No one stands still for more than a second in any scene but where your Director's repeats unwind (the Introduction's hits, frames 147 to 157; the Meeting's turns, 76 to 83; none at 24): `src/pipeline.js` `stillStretches`.

**Your cinderella-beautified** (the page's preset, `reports/ext/change/beautified-film/`, made by `tools/check-change.mjs` with the page's set and FIT): six scenes, each allotted less of the film's length than in your five-scene film. 171, 116, 137, 18, 190 and 155 frames at 4 frames a second (the page's set) become 266, 120, 138, 34, 186 and 107; at 24 frames a second 950, 701, 820, 76, 1052 and 942 become 1536, 724, 824, 158, 1051 and 799.

- **The Introduction** (24 to 60 seconds): with KNOW, Cinderella's helping the Prince is shown by helps-along (KNOW's), whose ideal, 21.76 seconds, is more than the task's 10; time-fit-score-1 rejects it as `(need-more-time: ideal-difference 11.76 will-accept 0.324)`, and your resurect-bad-time-fits, looking for `more-time-needed:`, never brought it back, so the task was "can't do". Now it is heard (`need-more-time-heard`), and **Cinderella helps the Prince** (part 5); the scene, 62.38 seconds, is held to its most, 60 (`scene-time-kept`).
- **Kept Apart** (29.75 seconds of its 24 to 60 there) is planned as before; the guard keeps its pace (S8, S16): 120 frames (116).
- **Cinderella Beautified** is held to 24 seconds (23.74): 138 frames (137).
- **No Longer Kept Apart** (8 to 20 there) is held to 8, stretched by 2.01: 34 frames (18).
- **The Meeting and Justice** start elsewhere: 186 and 107 (190 and 155).

## In stories

GPT-6.1 Sol's fifteen JSON trial stories (`reports/llm-trials/2026-10-13 gpt-6.1-sol json/`), made as the page makes them with its set, and with FIT beside it, at 4 frames a second (each scene from where the last left everyone). Snow White stops in pass 1 either way (APPEAR's, "too many values left"); the other fourteen film every scene either way. Of their 58 scenes, 41 are held to a bound (all to their least but Beauty and the Beast's Introduction, held to its most), 47 film differently and 11 as before. Most held scenes are longer, the plans having been far short of their least (the Gingerbread Man's Running Away 2.66 seconds of 24, 23 frames to 51; the Three Little Pigs' Friends Together 5.63 of 30, 28 to 194). Some are shorter, their activities keeping their pace (S8, S16), or the film stopped as a feeling's part that extends an activity ends first (stage 6's finding 7, which SLIPS' S14 corrects and the page's set doesn't have): Jack's Pursuit, whose chase's ideal, 1.21 seconds, is held to 24, stretched by 19.8 (past the 8 your SCENE warns at, decision 1), is cut at frame 39 when Jack's pride part ends, where it was 219.

| Story | Scene | Planned (s) | Held to (s) | The page's set | With FIT |
|---|---|---|---|---|---|
| beauty-and-the-beast | introduction | 33.31 | 30 | 71 | 69 |
| beauty-and-the-beast | kept-apart | 23.46 | 24 | 80 | 94 |
| beauty-and-the-beast | love-and-kindness | 10.97 | 24 | 5 | 18 |
| beauty-and-the-beast | the-beasts-love | 18.46 | 24 | 81 | 88 |
| beauty-and-the-beast | happy-together | 21.47 | 36 | 177 | 165 |
| goldilocks-and-the-three-bears | introduction | 16 | 48 | 2 | 2 |
| goldilocks-and-the-three-bears | bears-find-goldilocks | 12.13 | 48 | 41 | 153 |
| goldilocks-and-the-three-bears | chased-away | 15.95 | 24 | 25 | 16 |
| hansel-and-gretel | sent-away |  | within | 39 | 48 |
| hansel-and-gretel | kept-apart |  | within | 90 | 91 |
| hansel-and-gretel | gretel-fights-back | 16.02 | 17.14 | 100 | 102 |
| hansel-and-gretel | home-together | 16.64 | 34.29 | 90 | 159 |
| jack-and-the-beanstalk | pursuit | 13.21 | 24 | 219 | 39 |
| jack-and-the-beanstalk | happy-together | 5.71 | 48 | 45 | 114 |
| red-riding-hood | introduction |  | within | 135 | 152 |
| red-riding-hood | kept-apart | 31.96 | 40 | 187 | 110 |
| red-riding-hood | rescue | 12.56 | 20 | 44 | 69 |
| red-riding-hood | together-again | 36.46 | 40 | 355 | 225 |
| romeo-and-juliet | in-love | 24 | 30 | 98 | 156 |
| romeo-and-juliet | kept-apart | 28.22 | 30 | 164 | 97 |
| romeo-and-juliet | the-fight |  | within | 71 | 69 |
| romeo-and-juliet | together-in-sorrow | 32.47 | 45 | 428 | 320 |
| the-boy-who-cried-wolf | bored-shepherd | 23.96 | 24 | 68 | 74 |
| the-boy-who-cried-wolf | first-trick | 5.63 | 24 | 42 | 87 |
| the-boy-who-cried-wolf | tricked-again | 17.76 | 24 | 30 | 42 |
| the-boy-who-cried-wolf | real-wolf | 21.47 | 24 | 81 | 151 |
| the-boy-who-cried-wolf | wolf-chases-sheep | 15.41 | 24 | 23 | 10 |
| the-fox-and-the-crow | proud-crow | 24 | 48 | 2 | 2 |
| the-fox-and-the-crow | flattery | 21.61 | 48 | 30 | 36 |
| the-fox-and-the-crow | tricked |  | within | 123 | 150 |
| the-gingerbread-man | cheeky-gingerbread-man | 8 | 24 | 17 | 17 |
| the-gingerbread-man | running-away | 2.66 | 24 | 23 | 51 |
| the-gingerbread-man | false-friend | 36 | 48 | 133 | 189 |
| the-gingerbread-man | fox-catches-him |  | within | 139 | 128 |
| the-lion-and-the-mouse | the-capture | 14.76 | 15 | 45 | 53 |
| the-lion-and-the-mouse | the-lion-trapped | 20 | 30 | 57 | 77 |
| the-lion-and-the-mouse | the-rescue | 18.93 | 30 | 65 | 230 |
| the-three-little-pigs | friends-together | 5.63 | 30 | 28 | 194 |
| the-three-little-pigs | the-chase | 13.13 | 15 | 96 | 43 |
| the-three-little-pigs | keeping-the-wolf-out | 15.82 | 30 | 37 | 47 |
| the-three-little-pigs | safe-together | 15.63 | 30 | 86 | 91 |
| the-tortoise-and-the-hare | boasting | 24.67 | 30 | 287 | 185 |
| the-tortoise-and-the-hare | pushed-around | 24.67 | 30 | 102 | 107 |
| the-tortoise-and-the-hare-again | race | 2.72 | 20 | 6 | 28 |
| the-tortoise-and-the-hare-again | steady-progress | 16.06 | 40 | 39 | 109 |
| the-tortoise-and-the-hare-again | victory | 3.38 | 40 | 36 | 81 |
| the-ugly-duckling | lonely-winter | 25.71 | 51.43 | 17 | 17 |


The stress stories (`test/stories/stress/README.md`, "FIT in the page's set"): with the page's set and FIT, and with all seven, 108 of their 114 entries differ from before FIT, each with FIT's notes, most scenes held to their least from far short of it; every story films every scene in both modes, none at the cap. pushed-around's Introduction, past the cap with FIT as first made, is 206 frames; detail-tendency, at the cap with the page's set before FIT, is 255.

## The glass box

| Kind | Piece | On | was | now | because |
|---|---|---|---|---|---|
| `scene-time-kept` | s15 | the scene | `(planned 3.98)` | `10.0`, the scene's time now | `((length-bounds 10.0 25.0) (convey-task-3 was 3.98 now 10.0 least 2.792 most 6.95))`, the bounds and each task whose time changed, with its least and most |
| `task-time-bound` | s15-least-most | the task | `2.792`, the bound your code would have given it | `6.95`, the bound it is given | `(new-time 10.0 most 6.95)` |
| `need-more-time-heard` | s15-reason | the scene | `nil`, what your resurect-bad-time-fits found | `11.76`, the change asked for | `(ideal-difference (need-more-time: ideal-difference 11.76 will-accept 0.324))` |
| `scene-time-sign` | s15-signs | the scene | your adjustment | the corrected one | `(new-length L bound B)` (not reached in your Cinderella, nor in the beautified preset) |
| `stretch-once` | s16 | Director's subscene of the dynamics | `0.3184`, the walk's own factor as pass 2 wrote it | `0.8`, as a factor of its parent's | `(the-parents-factor-in-it 0.398 <the dynamics>)` |
| `factors-once` | s8 | Director's subscene | as in SLIPS (`reports/ext/slips/README.md`) | `once` | `(set-again <the dynamics>)` |

## For the page

- **The switch.** Add `"fit"` to the page's `SWITCHED` list (`app/`), beside mend, know, appear, change and seen; the registry's entry is group repairs, not opt-in, requiring MEND, and SLIPS requires it, so ticking SLIPS ticks FIT. "Ani as in 1978" loads none of it.
- **The bundle** needs FIT's files, `revive;fit`, `revive;fitstr` and `revive;slips8` (`node tools/build-ani-bundle.mjs` with the extensions the page offers); REVIVE;SLIPS and the registry's note for FIT changed.
- **The frames, for `check-film-app`.** Your Cinderella with the page's set and FIT: 275, 121, 36, 213 and 102 frames at 4 frames a second (the page's set before: 222, 116, 19, 200 and 128), and 1464, 728, 206, 1086 and 795 at 24 (1273, 701, 112, 1038 and 967). With SLIPS (and so FIT): 250, 122, 34, 185 and 73 (1506, 729, 202, 967 and 493 at 24). The beautified preset: 266, 120, 138, 34, 186 and 107 (1536, 724, 824, 158, 1051 and 799 at 24); its Introduction now has Cinderella helping the Prince (part 5), which the captions and the glass box can say.
- **The notes**, each a sentence with your lines:
  - `scene-time-kept`: "No Longer Kept Apart is a short scene, 10 to 25 seconds, but Ken's CHOMET, having moved its one task's time to fit its only way of showing, judged the scene by a length the task would not have, and gave the task 3.98 seconds (chomet.123:39-74). The revival holds a scene to its length's bounds once its tasks have their times (Ken's decision of 16 October): the fairy godmother's accompanying is stretched to fill 10 seconds." For Kept Apart: "planned 29.75 seconds against its least of 30, held to 30".
  - `task-time-bound`: "Ken's adjust-task-lengths gave a task above its most its least (chomet.123:174-180); it is given its most, 6.95 seconds, and the scene's part takes the rest."
  - `need-more-time-heard`: "Cinderella's helping the Prince needs 11.76 seconds more than its share. Ken's scoring calls that need-more-time:, and his code that brings back a way of showing that needs more time looked for more-time-needed: (chomet.123:193, 413), so the helping was given up; it is heard now, and Cinderella helps the Prince."
  - `scene-time-sign`: "Ken's code moved a scene too short or too long further from its bounds (chomet.123:61-64); it moves it towards them."
  - `stretch-once` (new, decision 13): "To fill the scene's 10 seconds, the fairy godmother's walk is slowed by 2.51. Ken's PLACE wrote the slowing into the walk's own speed (place.45:455-461) and his Director multiplied it in again (dichar.103:27-31), so she went at an eighth of her speed and stopped short of the Prince; the revival takes it once (Ken's decision of 17 October), and she brings Cinderella to him." Group them by part, as the film's other notes are.
  - `factors-once` (S8) is now on with the page's set too: its sentence is SLIPS' ("Each time the stepmother's walk is set again, Ken's Director multiplied in her parent's factor again, so each cycle was slower (dichar.103:27-31); the revival takes it once"), credited to Ken's decision of 17 October.
  - SEEN's `nothing-to-do` and `film-waited-for-wander` now appear in Kept Apart with the page's set (Cinderella and the stepmother wandering once the guard has ended, frames 108 to 119): SEEN's sentences fit, with "once the standing guard has ended" for the wait.
- **The criticism panel**, if it offers "too quick" for No Longer Kept Apart (`reports/chapter-x/design-criticism.md`): with FIT the scene is 10 seconds before any criticism; the ×1.5 then makes 15.

## On the page (17 October)

`app/film.html` and its claude.ai copy (`app/film.template.html`, `app/film/criticism.js`, `tools/build-film-app.mjs`), with the bundle built again with every extension (`app/data/ani-bundle-files.json`: REVIVE;FIT and FITSTR are new; from the bundle alone your Cinderella with all eight films as from the project's files, frame for frame and look for look).

- **The switch** turns on six: "Ani with the revival's extensions" is MEND, KNOW, APPEAR, CHANGE, SEEN and FIT (`SWITCHED`); "Ani as in 1978" loads none of it. "Which extensions" lists FIT under repairs, "A scene keeps its time (FIT)", with its sentence (the scene's time, the need for more time heard, the stretch once, S8, what it does in your Cinderella, never in Ani as in 1978) and what each of its files does (FIT, FITSTR, SLIPS8); the panel's count says six. Ticking SLIPS ticks FIT (and KNOW and MEND); unticking FIT unticks SLIPS. The prompt and the JSON schema are as before: FIT adds no word.
- **The notes**, each a sentence with your lines linked, in a glass box section of their own, "What keeping the scene's time did here", beside the repairs': `scene-time-kept` ("No Longer Kept Apart is to run 10 to 25 seconds, the time its length gives it, but Ani planned it at 3.98 s, short of its least: Ken's CHOMET gives each task its own time within its share of the scene and, where a way of showing didn't fit, judged the scene by a length its tasks would not have (chomet.123:39-74) ... The revival holds a scene to its length's bounds once its tasks have their times (Ken's decision of 16 October), 10 s: “the fairy godmother goes to Cinderella and accompanies her”, 10 s where it was 3.98 s; SCENE stretches each part's ways of showing to fill its time"), `task-time-bound` (its most, 6.95 s, where your adjust-task-lengths gave its least), `need-more-time-heard` (in the beautified preset's Introduction: Cinderella's helping the Prince needs 11.8 s more than its share of the scene, your scoring's need-more-time: that your resurect-bad-time-fits never heard, and the revival hears it), `scene-time-sign`, `stretch-once` (grouped by part: "In part 1, as the fairy godmother goes to Cinderella and accompanies her, SCENE slows the part's walks (×0.4) to fill its time. Ken's PLACE writes that into each new walk's own speed (place.45:455-461), and his Director multiplied it in again the first time the walk was set (dichar.103:27-31), so the fairy godmother's walk took the slowing twice (×0.4 and ×0.4 again, ×0.16). The revival takes it once (Ken's decision of 17 October; S16, with FIT).") and `factors-once` (SLIPS' sentence, now "the revival takes it once ... by Ken's decision of 17 October (S8, with FIT)"). SEEN's `nothing-to-do` and `film-waited-for-wander` in Kept Apart are said as SEEN's are.
- **"How Ani timed it"** has a step for a task FIT moved: "The scene's tasks came to 3.98 s, short of its least, 10 s; the revival holds a scene to the time its length gives it (FIT, Ken's decision of 16 October), 10 s, and this task's time went from 3.98 s to 10 s; that is past its most, 6.95 s, so its way of showing is given that, and SCENE's stretch of the part takes the rest (chomet.123:140-185)."
- **The captions** say a walk taking its stretch, or its parent's factor, once, as its part plays ("The fairy godmother's walk takes its stretch once, as SCENE planned it (the revival's correction, FIT)."; "The stepmother's walk takes its parent's factor once, so each cycle is no slower than the last (the revival's correction, FIT)."). A scene held to its time is said in the glass box and in "How Ani timed it", not on every frame.
- **SLIPS' "What SLIPS changed"** no longer lists S8: its notes are FIT's, said in the glass box and the captions with FIT's. SLIPS needs KNOW and FIT, and says so.
- **The frames, as the page makes them** (`tools/check-film-app.mjs`, headless Chrome): your Cinderella with the revival's extensions, 275, 121, 36, 213 and 102 at 4 frames a second; the beautified preset 266, 120, 138, 34, 186 and 107 (the fairy godmother reaching Cinderella at frame 10 of Cinderella Beautified, not 4, her walk taking its stretch once; Cinderella wandering from frame 95 to 109); with SLIPS 250, 122, 34, 185 and 73; and, made with the switch's six, the tortoise and the hare 169, 156 and 29 (187, 111 and 29 before FIT), the stepmother who repents 169, 62 and 121 (165, 62 and 29: Kind Again, planned 3.98 seconds of its 24 to 72, is held to 24), Gemini Nano's six-scene Tortoise and the Hare 224, 212, 66, 17, 17 and 113 (139, 49, 49, 17, 17 and 117), and `know-protective` 324 (35). At 24 frames a second, as Node makes them (the page films at 4 unless asked): 1464, 728, 206, 1086 and 795; the beautified preset 1536, 724, 824, 158, 1051 and 799; SLIPS 1506, 729, 202, 967 and 493.
- **Criticism.** A film made with the page's set is remade with it, FIT among it (a remake uses the film's own extensions); "too quick" on No Longer Kept Apart there makes the godmother's part 15 seconds from FIT's 10, and "too slow" is held to the scene's least, as FIT holds it (`reports/ext/critic/README.md`, "CRITIC with FIT"). Your 1978 film's examples on the page are as they were.
- **The claude.ai copy** is 897,120 bytes, under claude.ai's 950,000.

## Decisions for you

1. **Past its most.** A scene whose tasks can't fill its least within their most is filled anyway, the part's longest task taking the rest and SCENE stretching it (No Longer Kept Apart: 6.95 seconds within its most, 10 past it; in a story it can be far past it: GPT-6.1 Sol's Jack's Pursuit, a chase of 1.21 seconds held to 24, stretched by 19.8, where your SCENE warns past 8). Recommended: as now, the scene's length being the user's; say if a task should stop at its most, the scene short.
2. **The stretch taken twice: settled** by your decision 13, corrected with FIT as S16: the godmother brings Cinderella to the Prince.
3. **Kept Apart's guard.** As first made, it ran on, slowing, to frame 154 at 4 frames a second; with S8 it keeps its pace and ends before the feelings (frame 106; 108 with the page's set), and with SEEN the two wander until their feelings end.
4. **The stress story past the cap: settled** by decision 13 (S8 on with FIT): pushed-around's Introduction with the page's set is 206 frames.

