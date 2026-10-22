# How long the film is, and TIMELY: Director keeps to Ani's times

*22 October 2026.* You made your Cinderella with every scene short and the film `(interval (minutes 1) (minutes 1))`, with the page's six extensions, and saved it (`ani-cinderella-one-minute.json`). Ani's plan kept each scene at about 12 seconds, 61 in all, but Director filmed 377, 519, 247, 505 and 329 frames at 24 a second, 82 seconds (the video, with its title cards, about 1:27). You chose option 3: report it honestly with every film, and add an opt-in extension that holds each scene to its planned time. Both are here.

## The diagnosis

Ani plans a scene's time, and Director films the plan as it is written, not by the clock. The thesis says what Ani does about the film's length: "Ani tries to constrain the film to be a (user) desired length. Ani must often arbitrate between the different activities by stretching or shortening them" (AI-TR-540 p. 126). It does this in its plan. Each scene's length gives it a least and a most time, its share of the film's length (record-length-bounds-for-scenes, `scene.9:346-357`), CHOMET gives each task a time within them (`chomet.123:68-74`, and FIT holds the scene to them), and SCENE gives each part (subscene) its running time and stretches its ways of showing to fill it (`scene.9:159-183`, `stretched-by`). Director then runs each movement until its own end:

- a walk goes until it gets there, or has gone its original distance (go in arc, `dichar.103:156-200`; stop-when-there and move-only-original-distance, `dichar.103:401-499`). The stretch changes its speed, but not how far it goes, the curve of its path (correction-for-longer-path, `dichar.103:203-207`), a target that moves away, or a collision waited out;
- a change of how a character moves takes the time its speed gives it, time-to-grow-e-times by the speed's weight by the logarithm of its factor (gradually change, `dichar.103:102-121`), whatever time its part has. At high speed that is four times DISPLY's estimate, since Director multiplies by the weight where the estimate divides by it (`dichar.103:105-109`, `disply.311:1104-1106`: the inversion SLIPS' S9 corrects, opt-in); and SEEN keeps the film going while a feeling still runs, the character wandering;
- the pauses written into a way of showing, a pursuer starting half a second after the one pursued, a guard's 0.5 and 1.25 seconds (`disply.311:47-82, 455-556`), are seconds SCENE's stretch doesn't reach;
- and each part's end, and the next one's start, takes a tick or two.

Your Director measured the difference itself. At the end of each part ACTION keeps how far the part ran from its estimate, `(time-estimate-error-for <part>)` (subtract-elapsed-from-estimated-time, `action.152:59-61, 69-76`), and nothing in 1978 read it. In a film of two to five minutes the differences mostly cancel (your 1978 film at 24 frames a second: 139.4 seconds planned, 135 filmed); with every scene short and the film one minute, the parts are squeezed to a fifth of their ideal (stretched by 0.07 to 0.2) and they don't. Scene by scene, from your file (`src/pipeline.js` lengthReport, which the page runs):

| Scene | Asked | Planned | Filmed | What ran past its part's planned end |
|---|---|---|---|---|
| Introduction | short, 12 s | 13.03 s | 15.71 s (+2.7) | FIT held the scene from 52.0 s to 13.0 (some tasks at their least). Five of its six parts ran a little over: Cinderella getting away from the push, until she got there (+0.4); the chase, planned for 0.26 s, whose pursuer starts half a second after the one pursued (+0.37); the hits (+0.3); the Prince helping Cinderella along, until they got there (+1.25); the last part (+0.25). |
| Kept Apart | short, 12 s | 12.0 s | 21.63 s (+9.6) | Part 3, the feelings, runs beside part 2 from 4.84 s into it, planned for 4.84 s; it ran 13.83 s. The stepmother's change of path-curvature by 4 at high speed takes Director 13.86 s, where Ani estimated 3.47, and the film waits while she wanders (SEEN): +9.0. Parts 1 and 2 ran +0.56 and +1.02: walks that go their whole original distance, and the guard's pauses of 0.5 and 1.25 s, three times over. |
| No Longer Kept Apart | short, 12 s | 12.0 s | 10.29 s (−1.7) | Shorter: the fairy godmother's accompanying, stretched by 3.0, reached the Prince sooner. |
| Meeting | short, 12 s | 12.06 s | 21.04 s (+9.0) | Part 7, the joys of Cinderella and the Prince, beside part 6, planned for 0.43 s, ran 6.88 s: their changes by 2 at high speed take Director 6.93 s each (Ani's 1.73), and they wander meanwhile (SEEN): +6.45. Parts 2 to 6 ran +0.63 (their turns towards each other and back, four times), +0.78 (walking together, after a 0.5 s pause), +0.32, +0.28 and +1.18 (moving towards each other until they meet). |
| Justice | short, 12 s | 12.0 s | 13.71 s (+1.7) | One part: the stepmother's walk near the couple, then, after a 0.5 s pause, her turning to look at each of them at her rotational speed (move-near-and-turn, `disply.311:982-985`), ended 1.63 s past it. |
| The film | 1 minute | 61.09 s | 82.38 s | |

Of the 21.3 seconds over, about 15.5 are the two scenes' feelings, changes at high speed past their parts; the rest are walks, turns and pauses, a little in almost every part.

## The report, with every film

`src/pipeline.js` `lengthReport(scenes, { cindy, extensions })` gives what was asked for (the film's `film-length` and each scene's length and bounds), what Ani planned (each scene's and each part's running time) and what Director took (each scene's frames over its rate), and, for each scene that differs from its plan by more than a little (a second, and a tenth of the plan), each part that ran more than a quarter second past its planned end, with what in it ran past: the plans whose last run ended later (their stop conditions, how often they ran, the pause they began after) and the changes Director takes longer over than the part has. It is whyTheyAct's reading of the glass box and the film; the page runs the same code (`tools/build-film-app.mjs` checks the page's copy says what the pipeline says).

On the page (`app/film.template.html`, "how long the film is"):

- **Under the strip**, with every film: "Asked for 1 minute; planned 61 s; filmed 82 s — why" (for your 1978 film, "Asked for 2 to 5 minutes; planned 139 s; filmed 135 s — how"); press it for the report: the table, the sentence on why a film can differ from its plan, with Ken's lines, and each scene that differs, its parts and what ran past. Side by side, a line for each.
- **In the story**, under the scene cards, "How long the film is", closed, the same.
- **In "How Ani timed it"**, a step: the part's plan against its film, and what TIMELY did there for her.
- At ages 6–11, in everyday words: "You asked for 1 minute. Ani planned 61 seconds. The film is 82 seconds long. Why?", and, for Kept Apart, "The stepmother's feeling changes slowly: Ani planned 3 seconds for it, but it takes 14, and the film waits for it while she walks about."
- Where a film runs long without TIMELY, the report says it can be ticked.

## TIMELY

`src/director/revive/timely.lisp` (REVIVE;TIMELY), the "timely" extension: a repair, opt-in as SLIPS and DETAIL are (never among the switch's six, never in "Ani as in 1978"), requiring FIT (which keeps the plan within the scene's length) and CHANGE (whose change over seconds it uses). The name: it makes Director timely, on time for each part's end; KEEP was the other candidate, but FIT is already "A scene keeps its time", and TIMELY says what this adds, that the film keeps to the plan's times as well as the plan to the scene's. It acts only while Director films: pass 1 and pass 2 are as without it, and so is everything with it off, since it is never loaded (`tools/check-1978.mjs`, plain and `--extensions mend`, and the goldens).

As each part begins (its own note of its beginning, `action.152:33-41`), Director knows when it is to end: its running time after its beginning (a part of only changes begins its own time after the part it extends, `scene.9:223-240`). Then:

- **timely-change.** A change of how a character moves, or of how she looks, that would run past the part's planned end is made over the seconds left instead, as REVIVE;CHSHOW makes a change over seconds: the same factor, reached sooner. A change that ends in time is Ken's (or SLIPS') as it was.
- **timely-walk.** Each tick of a walk, if what is left of it (to its goal, along the arc, or what is left of its original distance, or its seconds, whichever stops it first) would take more ticks at its speed than are left in the part, its speed that tick is raised by the ratio, at most four times, the range of your own speeds, low to high (weightify, `interf.149:899-904`). A walk stopped by another (will-be-stopped-by-other) is left to the other.
- **timely-turn.** A facing, the turn at the start of each walk and a turn towards a place (ACTION's gradually face, `action.152:309-322`, which OBJECT's do-set-turtle-gradually runs a tick at a time), the same: its rotational speed raised by the ratio of the degrees left to the ticks left, at most four times. DICHAR's gradual turns by so many degrees (alternately-turn's, `dichar.103:85-89`) go through OBJECT's own gradual right, which TIMELY doesn't reach; they are left as they were.
- **timely-cut**, the last resort. A walk still going when its part's time is up ends there, as if it had got there, with what was to follow it (the "then" of stop-when-there-then). A walk that begins after the time is up takes one step, at four times its speed, and ends, so that walks that follow each other (a wander's) go a tick at a time and never follow each other without end within a tick (the first version did, in the Meeting, and the stack overflowed).
- **timely-pause.** A step that is to begin after a pause that would end past the part's planned end begins at the end instead.

Each piece can be turned off on its own, `(setq :timely-off '(timely-walk))`. Each leaves a note on the part, which the glass box says in "What keeping to Ani's times did here": `change-kept-to-time`, `walk-quickened` and `turn-quickened` (once for each character in the part, with the most it was quickened by), `walk-cut-short` and `pause-shortened`. A hit and its retreat, and a part with no planned time, are as they were.

## Your one-minute Cinderella with TIMELY

Made again with the switch's six and TIMELY, at 24 frames a second (`makeFilm`, as the page's worker makes it; each scene planned from where the one before left the characters, so the later scenes' plans differ a little from your file's):

| Scene | Planned | Filmed | Frames | What TIMELY did |
|---|---|---|---|---|
| Introduction | 13.03 s | 13.67 s | 328 | 4 characters' walks quickened, 3 walks cut short; the hits, after a hit, still +0.34 in part 4 |
| Kept Apart | 12.0 s | 12.17 s | 292 | the stepmother's two changes at high speed made over the 4.84 s left in their part; 3 walks quickened, 2 cut short, 1 pause shortened |
| No Longer Kept Apart | 12.0 s | 12.04 s | 289 | 2 walks quickened |
| Meeting | 12.06 s | 12.96 s | 311 | the 12 changes of the two joys made over the time left; 9 walks quickened, 3 cut short; the turns towards each other and back (part 2, alternately-turn's gradual turns) still +0.63 |
| Justice | 12.0 s | 12.67 s | 304 | nothing: the part ran +0.58, Cinderella and the Prince turning towards each other and back (alternately-turn's gradual turns, which TIMELY doesn't reach) |
| The film | 61.09 s | **63.51 s** | | against 82.38 without it |

So the one-minute film comes to 63.5 seconds, 2.4 over Ani's plan and 3.5 over the minute asked for (FIT already planned the Introduction at 13 seconds, some of its tasks being at their least). At 4 frames a second, where each tick is a quarter second and each part's end takes a tick or two, it comes to 78 seconds, 64, 50, 49, 69 and 80 frames (the switch's six: 96, against a plan of 61); Justice, 20 seconds against 12, is alternately-turn's turns, many of them in turn, each taking a tick or two at 4 a second, which TIMELY doesn't reach.

## Your Cinderella with TIMELY

Your Cinderella as you wrote it (two to five minutes), with the switch's six and TIMELY, at 24 frames a second: 1302, 718, 214, 852 and 734 frames, planned 159.03 seconds and filmed 159.17.

| Scene | Planned | Filmed | What TIMELY did |
|---|---|---|---|
| Introduction | 55.62 s | 54.25 s | 5 walks quickened, 4 cut short, a pause shortened |
| Kept Apart | 30.0 s | 29.92 s | 4 walks quickened |
| No Longer Kept Apart | 10.0 s | 8.92 s | nothing: shorter than planned, which TIMELY leaves |
| Meeting | 32.93 s | 35.5 s | the two joys' 12 changes made over the time left in their part; 9 walks quickened, 4 cut short; the turns towards each other and back still +1.2 |
| Justice | 30.48 s | 30.58 s | a walk quickened |

It films sensibly: every scene ends, each within 2.6 seconds of its plan, and the feelings still show, over a shorter time. Ani as in 1978, MEND alone and every golden are as before, since nothing loads TIMELY unless it is ticked.

## Tests

`test/timely.test.js`: the registry (opt-in, a repair, requiring FIT and CHANGE, in none of the six); lengthReport of your 1978 film; and your one-minute Cinderella's Introduction and Kept Apart at 4 frames a second with TIMELY, Kept Apart within a little of its plan, the stepmother's change made over the seconds left in its part. `tools/check-film-app.mjs` (`--only length`): the line under the strip for your 1978 film and the one-minute film, as Node's lengthReport says; the report and the story's box; TIMELY in "Which extensions", unticked; the one-minute film made with it in the page's worker in the frames Node makes, less than half as far from its plan as without, with the glass box's section.

## Decisions for you

1. **The cap of four times.** A walk is quickened at most four times its speed, the range of your speeds from low to high; past that, it is cut at its part's end. Raise it (fewer cuts, faster walks), or lower it?
2. **Pauses.** Only a pause that would end past its part's planned end is shortened. Should a squeezed part shorten its pauses in proportion, as SCENE's stretch shortens the walks?
3. **Shorter than planned.** TIMELY doesn't slow anything down: No Longer Kept Apart still ends sooner than planned. Should it hold a part to its planned time from below too (a walk slowed, or a pause at the end)?
