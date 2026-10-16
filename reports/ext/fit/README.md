# Cinderella with FIT: a scene keeps its time (S15)

*16 October 2026.* You asked to "settle the CHOMET question so the godmother scene keeps its time", and then decided: "let's not change the revival film when 'Ani as in 1978' is selected – otherwise go ahead". So the correction of your CHOMET's slips in dividing a scene's time among its tasks (stage 7's question 2, `reports/chapter-x/PLAN.md`) is **FIT** (`src/director/revive/fit.lisp`, REVIVE;FIT; the "fit" extension in `src/pipeline.js`): a repair, group repairs, requiring MEND, not opt-in, so the page's switch is to turn it on with MEND, KNOW, APPEAR, CHANGE and SEEN. It is the correction SLIPS numbers S15 (`reports/ext/slips/README.md`), and SLIPS requires it. Ani as in 1978 and MEND alone are byte for byte as before (`tools/check-1978.mjs`, plain and `--extensions mend`), and so are KNOW's, APPEAR's, CHANGE's and SEEN's goldens, which are made without FIT.

These are the files your Cinderella makes with FIT (with MEND), chained scene to scene as the film page makes them, at 4 frames a second here and at 24 in `24fps/`; `from-1978/` has Kept Apart's and No Longer Kept Apart's pass 2 planned from where your 1978 film left the characters, the two scenes whose plans FIT changes. `node tools/check-ext.mjs --extensions fit` checks that a run still makes them (and `--fps 24`); `--save` makes them again. `npm test` runs `test/fit.test.js`, which plans your No Longer Kept Apart as in 1978, 3.98 seconds, and with FIT, 10.

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

## Your Cinderella with FIT

| Scene | 1978 | With FIT | At 24 frames a second: 1978 | With FIT |
|---|---|---|---|---|
| Introduction | 192 | 192 | 917 | 917 |
| Kept Apart | 116 | 156 | 701 | 704 |
| No Longer Kept Apart | 17 | 56 | 113 | 335 |
| Meeting | 179 | 186 | 1051 | 1114 |
| Justice | 84 | 84 | 458 | 444 |

- **The Introduction**, planned 42.24 seconds of its 30 to 75, is as in 1978, frame for frame.
- **Kept Apart**, planned 29.75 seconds against its least of 30 (its three parts 1.53, 14.36 and 13.86; the third, the feelings, extends the second, the guard), is held to 30: adjust-task-lengths gives each of its four tasks 0.0625 seconds, within its bounds, and what that leaves (the feelings' two tasks run in parallel, so the scene grew by three quarters of it) the parts take in proportion (1.60, 14.45 and 13.95 seconds; the guard stretched by 1.98, not 1.97). The film differs from frame 1. At 4 frames a second the feelings' part begins at frame 61 (60) and ends at 115 (114); in 1978 it ended first and your Director stopped the film two frames later, with the stepmother still standing guard (stage 6's finding 7); now the stop comes when something is still planned (finding 6: which depends on the order the actors tick in), and the guard runs to its own end, at frame 154: 156 frames. At 24 frames a second the stop comes as before, the guard cut, 704 frames (701). Kept Apart's glass box has a `scene-time-kept` note.
- **No Longer Kept Apart**, planned 3.98 seconds against its least of 10, is held to 10: adjust-task-lengths takes the task to its most, 6.95 (a `task-time-bound` note: your code would have given it its least), and the part takes the rest, 10 seconds, its methods stretched by 2.51 (a `scene-time-kept` note). The fairy godmother is placed beside Cinderella as in 1978 (she was never on the stage in Kept Apart, so she appears where Kept Apart's positions put her, `reports/chapter-x/design-criticism.md`), goes to her (frames 2 to 6), turns towards the Prince over two and a half seconds (frames 9 to 18; her turning slowed with her walk), and accompanies Cinderella towards him, for the 9 seconds the stretched plan gives it (`stop-after-so-many-seconds 9.0`, 2.98 in 1978), to frame 54: 56 frames, 14 seconds (335 at 24 frames a second). **But she does not get Cinderella to the Prince**: at the end the two are 346 dots from him (263 at 24 frames a second), where in 1978 they reached him (5 dots). Her walk is stretched by 2.51, which your PLACE writes into the walk's own speed factor, 0.8 × 0.398 = 0.3184, and your Director's demon multiplies the parent's 0.398 in again the first time the walk is set (`place.45:455-460`, `dichar.103:27-31`): she walks at 0.13 of her speed, not 0.32, the stretch taken twice. That is the slip SLIPS' README leaves for you ("A stretched walk takes its stretch twice", decision 6 there; PLAN.md's stage 7 question 10). A probe, the walk's own factor written as 0.8 so that the demon takes the stretch once: 44 frames, 11 seconds, and Cinderella reaches the Prince (22 dots).
- **The Meeting and Justice** are planned as in 1978 and start where the scene before left everyone (Cinderella and the godmother partway to the Prince, the Prince, and the stepmother where the guard's end left her): the Meeting's first part, everyone else sent off, is 17 frames (8), 186 frames in all (179); Justice 84 (84). At 24 frames a second 1114 and 444.

## With the page's set

Your Cinderella as the page makes it with its switch on (MEND, KNOW, APPEAR, CHANGE and SEEN), and with FIT beside them, chained, frames per scene:

| Scene | The page's set | With FIT | At 24: the page's set | With FIT |
|---|---|---|---|---|
| Introduction | 222 | 222 | 1273 | 1273 |
| Kept Apart | 116 | 156 | 701 | 704 |
| No Longer Kept Apart | 19 | 58 | 112 | 344 |
| Meeting | 200 | 211 | 1038 | 1118 |
| Justice | 128 | 132 | 967 | 970 |

The same two scenes are held to their least, with the same notes (Kept Apart 29.75 to 30, No Longer Kept Apart 3.98 to 10, stretched by 2.51); the Introduction (55.62 seconds with KNOW) is within its bounds; the Meeting and Justice start elsewhere.

**Your cinderella-beautified** (the page's preset, `reports/ext/change/beautified-film/`, made by `tools/check-change.mjs` with the page's set and FIT): six scenes, each allotted less of the film's length than in your five-scene film. 171, 116, 137, 18, 190 and 155 frames at 4 frames a second become 263, 116, 138, 45, 188 and 142; at 24 frames a second 950, 701, 820, 76, 1052 and 942 become 1433, 701, 824, 275, 1063 and 951. Three scenes are planned differently:

- **The Introduction** (24 to 60 seconds): with KNOW, Cinderella's helping the Prince is shown by helps-along (KNOW's), whose ideal, 21.76 seconds, is more than the task's 10; time-fit-score-1 rejects it as `(need-more-time: ideal-difference 11.76 will-accept 0.324)`, and your resurect-bad-time-fits, looking for `more-time-needed:`, never brought it back, so the task was "can't do" and its part took no time. Now it is heard (a `need-more-time-heard` note), the task is given 11.88 seconds more, and **Cinderella helps the Prince** (part 5, frames 126 to 226). The scene is then 62.38 seconds, above its most, 60, and is held to it, every part a little shorter (a `scene-time-kept` note). 263 frames, not 171.
- **Cinderella Beautified** (24 to 60): planned 23.74 seconds, held to 24; 138 frames (137).
- **No Longer Kept Apart** (8 to 20): 3.98 seconds held to 8, stretched by 2.01; 45 frames (18).

Kept Apart, 29.75 seconds of its 24 to 60 there, is planned and filmed as before; the Meeting and Justice start elsewhere.

## The glass box

| Kind | Piece | On | was | now | because |
|---|---|---|---|---|---|
| `scene-time-kept` | s15 | the scene | `(planned 3.98)` | `10.0`, the scene's time now | `((length-bounds 10.0 25.0) (convey-task-3 was 3.98 now 10.0 least 2.792 most 6.95))`, the bounds and each task whose time changed, with its least and most |
| `task-time-bound` | s15-least-most | the task | `2.792`, the bound your code would have given it | `6.95`, the bound it is given | `(new-time 10.0 most 6.95)` |
| `need-more-time-heard` | s15-reason | the scene | `nil`, what your resurect-bad-time-fits found | `11.76`, the change asked for | `(ideal-difference (need-more-time: ideal-difference 11.76 will-accept 0.324))` |
| `scene-time-sign` | s15-signs | the scene | your adjustment | the corrected one | `(new-length L bound B)` (not reached in your Cinderella, nor in the beautified preset) |

## For the page

- **The switch.** Add `"fit"` to the page's `SWITCHED` list (`app/`), beside mend, know, appear, change and seen; the registry's entry is group repairs, not opt-in, requiring MEND, and SLIPS requires it, so ticking SLIPS ticks FIT. "Ani as in 1978" loads none of it.
- **The bundle** needs `revive;fit` (`node tools/build-ani-bundle.mjs` with the extensions the page offers), and REVIVE;SLIPS changed (its header names S15).
- **The frames.** Your Cinderella with the page's set: 222, 156, 58, 211 and 132 frames at 4 frames a second (it was 222, 116, 19, 200 and 128), and 1273, 704, 344, 1118 and 970 at 24 (1273, 701, 112, 1038 and 967); `check-film-app`'s counts for the switch want these. With SLIPS (and so FIT): 230, 109, 54, 182 and 88 (1379, 705, 336, 934 and 482 at 24). The beautified preset: 263, 116, 138, 45, 188 and 142 (1433, 701, 824, 275, 1063 and 951 at 24); its Introduction now has Cinderella helping the Prince (part 5), which the page's captions and glass box can say.
- **The notes**, each a sentence with your lines:
  - `scene-time-kept`: "No Longer Kept Apart is a short scene, 10 to 25 seconds, but Ken's CHOMET, having moved its one task's time to fit its only way of showing, judged the scene by a length the task would not have, and gave the task 3.98 seconds (chomet.123:39-74). The revival holds a scene to its length's bounds once its tasks have their times (Ken's decision of 16 October): the fairy godmother's accompanying is stretched to fill 10 seconds." For Kept Apart: "planned 29.75 seconds against its least of 30, held to 30".
  - `task-time-bound`: "Ken's adjust-task-lengths gave a task above its most its least (chomet.123:174-180); it is given its most, 6.95 seconds, and the scene's part takes the rest."
  - `need-more-time-heard`: "Cinderella's helping the Prince needs 11.76 seconds more than its share. Ken's scoring calls that need-more-time:, and his code that brings back a way of showing that needs more time looked for more-time-needed: (chomet.123:193, 413), so the helping was given up; it is heard now, and Cinderella helps the Prince."
  - `scene-time-sign`: "Ken's code moved a scene too short or too long further from its bounds (chomet.123:61-64); it moves it towards them."
- **The criticism panel**, if it offers "too quick" for No Longer Kept Apart (`reports/chapter-x/design-criticism.md`): with FIT the scene is 10 seconds before any criticism; the ×1.5 then makes 15.

## Decisions for you

1. **Past its most.** A scene whose tasks can't fill its least within their most is filled anyway, the part's longest task taking the rest and SCENE stretching it (No Longer Kept Apart: 6.95 seconds within its most, 10 past it). Recommended: as now, the scene's length being the user's; say if a task should stop at its most, the scene short.
2. **The stretch taken twice** (SLIPS' decision 6, PLAN.md stage 7 question 10) now shows in your godmother's scene: the accompanying stretched by 2.51 walks at 0.13 of her speed, not 0.32, and stops 346 dots short of the Prince. Taken once (a probe), she brings Cinderella to him in 11 seconds. Recommended: correct it with FIT, on with the revival's extensions, since FIT is what makes the stretch large here (it would change every stretched or repeated activity of yours: the Introduction's pushing, Kept Apart's guard, the Meeting's turning).
3. **Kept Apart's guard runs to its end** at 4 frames a second with FIT (156 frames, not 116), because the feelings' part, a tick later, no longer has the film stopped while the guard runs (stage 6's findings 6 and 7, which SLIPS' S14 corrects); at 24 it is cut as before. Recommended: leave it; it is your Director's order of ticking.
