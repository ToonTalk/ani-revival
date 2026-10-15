# Cinderella with DETAIL: a few of the "myriad details"

DETAIL (stage 7 of [Phase 9](../../chapter-x/PLAN.md), "Item 4, part 2: KNOW, SLIPS and DETAIL") attends to three of the low-level details your thesis names as left undone: "Even a charitable view of Ani reveals many low-level deficiencies ... Here is a sample of real (but relatively minor) deficiencies of Ani" (p. 185, L4813-4817), and "Any one of these problems can fairly easily be rectified. The difficulty is that there are very many such minor problems each one of which takes a fair amount of programming" (p. 187, L4879-4881). Each is the revival's reading of your sentence, labeled so where it is defined, with its reasons. The files are `src/director/revive/detail.lisp` (REVIVE;DETAIL: what the three share, and where the thesis names them) and its three parts, DTWALK, DTTEND and DTRHYM. DETAIL requires MEND (the first design's rule for SLIPS, KNOW and DETAIL alike), and like SLIPS it is opt-in: the site opens in 1978 mode and the switch turns on MEND, KNOW, APPEAR and CHANGE (your decision 3).

These are the files your Cinderella makes with DETAIL (with MEND), chained scene to scene as the film page makes them, at 4 frames a second here and at 24 in `24fps/`. `node tools/check-ext.mjs --extensions detail` checks that a run still makes them (and `--fps 24`, about twenty minutes); `--save` makes them again. `node tools/check-detail.mjs` makes the film with each detail alone, then all three, then with the tendencies given to the convey methods too (a decision for you, below), each beside your 1978 film, and checks the result against `each.json` (about twenty minutes; `--save` writes it). `npm test` runs `test/detail.test.js`, which checks each detail on its own and that each can be turned off, and `npm run test:stress` makes `test/stories/stress/detail-rhythm.lisp` and `detail-tendency.lisp`, and every other stress story, with all six extensions.

| File | What it is |
|---|---|
| `ken-<fn1>.<fn2>`, `ken1-<fn1>.mini`, `ken1-<fn1>.print` | Each scene's program, summary and printout (pass 2), chained |
| `<scene>.glass.json` | Each scene's glass box |
| `<scene>.film.json` | Each scene's film |
| `ken1-<movie>.posit` | Where each scene's filming left the characters |
| `from-1978/` | Each scene's pass 2, planned from where your 1978 film left the characters, to set beside `reports/pass2` |
| `24fps/` | The chained film at 24 frames a second |
| `each.json` | Each detail alone, all three, and the convey methods' tendencies, beside 1978 (`tools/check-detail.mjs`) |

## The details

### (f) Deliberateness shapes a character's path (REVIVE;DTWALK)

"The degree of deliberateness of the movements of each of the characters is determined by Ani. This should influence how often a character changes direction, how quickly it does it, and how large the change in direction is" (p. 186, L4853-4856); "Ani carefully determines how "deliberate" a character's movements should be and then never takes that into account in later decisions" (p. 83, L2346-2348). Your Director's walk turns a character each tick by its path (go-in-arc, `dichar.103:214-256`): "the path-curvature is the most it will deviate from direct on target / the path-length determines how much the curvature should change each time / the path-jaggedness is an alternating heading offset" (`dichar.103:218-220`).

The revival's reading, in Director's own terms: a character d times as deliberate as one of medium deliberateness (d is the weight Director gives any three-valued element, `weightify`, .5, 1 or 2, times any factor a change has grown it by, as `special-dynamics` yields every element, `interf.149:845-847`) goes in arcs d times as long, so that its curve turns round d times less often and swings d times more slowly ("how often" and "how quickly"), and jags 1/d as far each tick ("how large"). Medium changes nothing. The arc's curvature, how far a character strays from going straight at its goal, is left as Ani chose it: that is path-curvature's, which she chooses beside deliberateness (wanting to meet the Prince, Cinderella "moves directly and deliberately", p. 66, L1886-1887: low curvature and high deliberateness both, `convey.64:199-204`). How far and how fast a character goes are left alone too: Director's correction of the distance for an arc reads only the curvature (`dichar.103:206-210`).

In your Cinderella, CP 29 makes the stepmother high and the fairy godmother low, and Cinderella and the Prince medium; and two of your ways of showing set deliberateness high for their walks: wanting's first part (`convey.64:199-204`: Cinderella's walk towards the Prince in Kept Apart, the walks to each other in the Meeting) and being aware (`convey.64:252-254`: the stepmother in Justice). Every scene's filming notes where the walk read it, `deliberate-walk`, on Director's subscene of the walker:

| Scene | Who, how deliberate, where | How much each turned as it walked, 1978 and with the walk alone (degrees a frame, `turning` in each.json) |
|---|---|---|
| Introduction | Cinderella high (subscene 1); the stepmother high (1, 2, 3) | stepmother 10.82 to 10.44; Cinderella 28.18 to 27.49; the Prince 15.75 to 14.06 |
| Kept Apart | Cinderella high, wanting to meet the Prince (1); the stepmother high, standing guard (2, 3) | stepmother 17.96 to 14.62; Cinderella 42.23 to 40.77 |
| No Longer Kept Apart | the fairy godmother low (1) | fairy godmother 21.33 to 25.6 |
| Meeting | the fairy godmother low and the stepmother high, sent off (1); Cinderella and the Prince high, going to each other (4, 6) | fairy godmother 28.27 to 39.37 |
| Justice | the stepmother high, aware of them (1) | stepmother 6.28 to 4.76 |

The walk alone films the five scenes in 189, 116, 19, 175 and 89 frames (1978: 192, 116, 17, 179 and 84). A different path takes a different time: a walk ends when its goal is reached, and a scene when its parts do.

With CHANGE, Director now reads deliberateness, so a change of how a character moves bridges it as it bridges speed and the path (`REVIVE;CHSHOW`'s `:change-director-elements`, which DETAIL extends), and `src/pipeline.js`'s `elementUse` says so for the glass box.

### (c) The tendencies feed the best-when scores (REVIVE;DTTEND)

"(c) The movement tendencies such as the tendency to avoid strangers, should be used in the prerequisite and "best when" clauses of methods" (p. 185, L4827-4829). Pass 1 chooses, for each character, how it is drawn to its friends, its enemies and strangers ("tendencies (e.g. to avoid strangers, to be attracted to strangers)", p. 106, L2868-2869; shy "strongly suggests strong tendency to avoid strangers", p. 264, L6967-6968), and nothing after pass 1 reads them.

Here they are used as your best-when clauses are: a status, met, not met or don't know, which CHOMET's score of a way of showing counts (one more for each met, one less for each not met, `chomet.123:376-387`), weighed by the film's coherence, among the ways of showing of one task. A new prerequisite, `drawn-to`, written as PREREQ's are (faster reads two speed choices, `prereq.19:27-39`): (drawn-to a b) is met if a's tendency towards what b is to a is positive, not met if it is negative, don't know otherwise; what b is to a is read with your generators' own tests (an enemy if either hates the other, `sugest.123:373-395`; a friend if a likes or loves b, as PREREQ's likes reads it, `prereq.19:110-120`; a stranger if neither has a relationship with the other, `sugest.123:341-354`). The revival's reading of which ways of showing take one character to another: move-to-and-hits, chases-to, pushes-around, goes-to-and-accompanys, and KNOW's helps-along and follows-behind and CHANGE's goes-to-and-transforms are best when (drawn-to a b); move-to-each-other and repeatedly-come-in-contact when each is drawn to the other; KNOW's moves-away-from when (not (drawn-to a b)), through PREREQ's own not. Each is given as you give a method a clause, `(ask method add best-when for pattern clause)` (`convey.64:29-33`), so SUGCON adds it to the method's suggestions (`sugcon.26:30-55`).

In your Cinderella it decides nothing: with the tendencies alone the five films are 1978's, frame for frame and event for event. Most of your tasks have one way of showing, so a score has nothing to beat. Two have more: Justice's getting-it-on, where repeatedly coming in contact (Cinderella and the Prince each drawn to the other, (positive high) towards friends) now scores 75 for best-when against alternately turning's 25 (50 each in 1978), and was chosen already; and Kept Apart's preventing, where chasing the Prince off the stage, one way of undoing his being on it (`prereq.19:68-78`), is not at its best, since the stepmother avoids strangers ((negative medium)), and standing guard wins as in 1978. Each scene's glass box has a `tendency` note on each task where a tendency gave a best-when clause its status (16 in all), and the clause in the scores.

### A scene's rhythm suggests changes of speed (REVIVE;DTRHYM)

"Ani was built out of many actors that have very suggestive names such as "level of subtlety", "deliberate", "rhythmic", "graceful", and so on. ... The truth is that the meaning these words have to Ani is a pale reflection of what they mean to people. There are three ways in which this can be improved somewhat. (a) Add to each one the ability to suggest values and activities (some do already)" (pp. 183-184, L4778-4792). This one is not among the sample of myriad details (X.B.3), but the first of the three improvements "A Better Knowledge Base" (X.B.2) names just before them, for Ani's suggestive names; the first design put it with DETAIL, and so does the plan. Your CINDY gives four scenes a rhythm, "relative to the film's rhythm" (`cindy.46:61`): the Introduction normal, Kept Apart (changes fast slow), No Longer Kept Apart and the Meeting fast (`cindy.46:61, 74, 114, 140`); nothing reads it (only the length beside it, `scene.9:346-364`).

Here the rhythm suggests how fast the scene's characters move, as an emotional state does: with DISPLY's change:, which joy's changes are made with (`emote.9:19-24`, `disply.311:1047-1057`), so Director changes each speed gradually, as it changes joy's. The revival's reading, each choice its own: normal is the film's rhythm and changes nothing; fast and slow are a quarter faster or slower, a change: of (positive medium) or (negative medium) at medium speed ("medium 25%", `disply.311:1050`); fast or slow holds for the whole scene, so each subscene has its change (a subscene's dynamics start from the choices again); (changes fast slow) is fast's change in the first subscene and slow's in the last; picking-up is (changes normal fast). A subscene's change is for each character who does something in it, an action or a change Ani planned there (a character with only changes and nothing to do would be made to wander, `scene.9:216-221`), run as the subscene runs a change of its own, after its methods, adding no time.

In your Cinderella (rhythm alone):

- **Kept Apart**, (changes fast slow): Cinderella speeds up a quarter as she sets off to meet the Prince (subscene 1), and she and the stepmother slow a quarter as their feelings play (subscene 3), beside their joy's changes; 116 frames, as in 1978, the film differing from frame 2.
- **No Longer Kept Apart**, fast: Cinderella and the fairy godmother speed up a quarter; 15 frames (17).
- **The Meeting**, fast: in every subscene, whoever moves, the stepmother and the fairy godmother as they are sent off (1), Cinderella and the Prince after (2 to 5, 7); 171 frames (179).
- The Introduction is normal, and Justice has no rhythm; Justice differs (86 frames) only because the Meeting left everyone elsewhere.

The pass 2 glass boxes have a `rhythm-speed` note on each subscene for each character (17 in all), and the programs the changes, `(GRADUALLY CHANGE BY 1.25 FACTOR FOR SPEED AT MEDIUM SPEED)`.

**Your slip S8 compounds it.** With DETAIL alone, the Meeting's second part, Cinderella and the Prince alternately turning towards each other eight times, sets the same turning dynamics again for each turn, and your Director multiplies their speed factor by their parent's again each time (`dichar.103:27-31`, SLIPS' S8): the rhythm's quarter grows the parent's, so the turns speed up turn by turn, Cinderella's factor 1.30, 1.51, 1.75, 2.04, the Prince's 1.51, 2.04, 2.75, 3.71 (a probe of the demon, filmed from this folder's Meeting). With SLIPS on too, the factor is taken once. In 1978 the parent's factor there is 1, and your slip never shows.

## All three: the chained film

| Scene | 1978 | With DETAIL | At 24 frames a second: 1978 | With DETAIL |
|---|---|---|---|---|
| Introduction | 192 | 189 | 917 | 910 |
| Kept Apart | 116 | 116 | 701 | 705 |
| No Longer Kept Apart | 17 | 16 | 113 | 88 |
| Meeting | 179 | 169 | 1051 | 647 |
| Justice | 84 | 87 | 458 | 486 |

Every scene differs from its first frames, as the walk and the rhythm say above. In the Meeting the joy's part (subscene 7, a parasite on subscene 6, `scene.9:223-240`) now runs to its end at 4 frames a second (frame 167; in 1978 the film stopped with subscene 6, at 177, the joy cut short) and is cut short at 24 (frame 645; in 1978 it ran to 1049): stage 6's finding 6 (`reports/ext/change/README.md`), whether a part a joy extends stops the film before the joy's changes end depends on the order Director's universe ticks its actors in. At 24 frames a second the Meeting is so much shorter because the turning in subscene 2 compounds, as above (98 frames, 286 in 1978).

Pass 1 is 1978's: KEN;CP 30 is CP 29, byte for byte, and the choice points and their reasons are `app/data/pass1.json`'s; DETAIL leaves no note in pass 1. Planned from your 1978 positions (`from-1978/`), every scene's glass box has its tendency notes and the scores' clauses, and Kept Apart's, No Longer Kept Apart's and the Meeting's programs have the rhythm's changes; the Introduction's and Justice's programs and every summary are 1978's.

## The glass box

Each detail notes where it acted, through REVIVE;WRAP's `revival-note`, in the glass box's `repairs` (pass 2's) and the film's `repairs` (the filming's), as MEND's repairs do:

| Kind | On | was | now | because |
|---|---|---|---|---|
| `deliberate-walk` | Director's subscene of the walker's dynamics (the film's) | `(step-mother deliberateness high)` | `(arcs-times 2.0 jags-divided-by 2.0)` | `(dichar go-in-arc)` |
| `tendency` | the task whose ways of showing were scored, for each clause a tendency gave a status (pass 2's) | `(drawn-to step-mother cinderella)` | `met` or `not-met` | `((choice-point-of step-mother attraction-towards-enemies) (negative high))` |
| `rhythm-speed` | the subscene (pass 2's) | `(cinderella speed)` | `(change: amount (positive medium) speed medium)` | `(rhythm (changes fast slow) beginning)`, beginning, end or throughout |

A deliberateness grown by a change (KNOW's pride raises it) is noted at each value it walks with, rounded to two places.

## For the page (stage 7)

- **The switch.** `src/pipeline.js`'s registry has DETAIL with `group: "knowledge"` and `optIn: true` (every entry now has a `group`, and SLIPS and DETAIL `optIn`); "Which extensions" lists it under knowledge, unticked when the switch is turned on. It requires MEND.
- **The notes** above, each a plain sentence with a code link: `deliberate-walk` ("The stepmother's movements are deliberate (high), so Director walked her in arcs twice as long, with jags half as large: how often, how quickly and how far she changes direction (thesis p. 186, (f)); the revival's reading"), `tendency` ("Hurting is at its best only if the stepmother is drawn to Cinderella; she strongly avoids her enemies (pass 1's choice, from mean), so it isn't: the revival's reading of (c)"), `rhythm-speed` ("Kept Apart's rhythm starts fast: Cinderella speeds up a quarter as she sets off, as a feeling would speed her (B.2 (a)); the revival's reading"). A score's best-when clause `(drawn-to a b)` in a task's scores is DETAIL's, and the page should say so where it shows the clauses.
- **What Director reads.** `elementUse(element, extensions)` replaces `ELEMENT_USE` for the fresh look's values: with DETAIL, deliberateness is "director" and the tendencies "best-when". The dynamics table and "How she has changed" should say "Director's walk reads it (DETAIL)" and "the best-when scores read it (DETAIL)", and stop saying "chosen again; Director does not use it, as in 1978" for those with DETAIL on.
- **The bundle** needs DETAIL's files (`node tools/build-ani-bundle.mjs` with the extensions the page offers), and the page's frame counts for Cinderella with DETAIL are this README's (and with all six, `tools/check-stress.mjs`'s with-all mode has the stories').
- **The decisions below**, once made, may change what the page says.

## Decisions for you

1. **The tendencies in the convey methods too?** The thesis's "methods" include the convey methods, where a best-when clause not met drops a method when more than a few are left (`eliminate-not-best-whens`, `chomet.123:474-490, 565-577`). DTTEND has that behind a switch, `:detail-tendencies-of-convey-methods`, off: the same clauses on the convey verbs, which SUGCON adds to a convey task's convey suggestions, and on the convey methods an establish task chooses among (SUGEST adds none, `sugest.123:237-258`). Run so (`each.json`, `tendConvey`), your Introduction has the stepmother avoid Cinderella instead of pushing her around: mean has her strongly avoid her enemies (`dscrp.17:249`; CP 29, (negative high)), so hurting and pushing are not at their best and `eliminate-not-best-whens` leaves avoiding; without KNOW avoiding has no way of showing, and the Introduction is 94 frames. Your mean has a mean character avoid its enemies while its own ways of showing chase and hurt them (`dscrp.17:249-267`); with the convey methods' clauses that becomes visible. Recommended: leave it off, as now, unless you read mean's tendency otherwise.
2. **Should DETAIL require SLIPS?** Alone, its rhythm compounds through your slip S8 (above), and its scenes are shorter for it at 24 frames a second. Recommended: no; SLIPS is a correction of your files and DETAIL knowledge, and the page can tick both; but say if DETAIL should bring SLIPS with it.
3. **The amount and the scenes of the rhythm.** A quarter, at medium speed, in each subscene for fast and slow, the first and last for a change, are the revival's. Say if the film's level of rhythm (high in your Cinderella, `cindy.46:161`) should scale it.
