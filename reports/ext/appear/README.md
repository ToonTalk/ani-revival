# Cinderella with APPEAR: the looks Ani chose, and what changed from 1978

These are the files Ken's Cinderella makes when Ani chooses her characters' sizes and shapes (APPEAR, stage 2 of [Phase 9](../../chapter-x/PLAN.md), "Items 1 and 2: appearances"), filmed at 4 frames a second and chained scene to scene, as the film page makes them. `npm run test:ext` (`tools/check-ext.mjs`) checks that a run still makes them, and `node tools/check-ext.mjs --save` makes them again. `npm run test:appear` (`tools/check-appear.mjs`) checks the knowledge behind the looks against Ken's legitimacy rule.

| File | What it is |
|---|---|
| `ken-cp.30` | Pass 1's answers, KEN;CP 30 |
| `appearances.json` | How Ani chose each look (`src/glassbox-pass1.js` `collectAppearances`) |
| `pass1.json`, `pass1-choices.txt`, `pass1-reasons.txt` | Pass 1's glass box, as `tools/run-pass1.mjs --extensions appear --glass-box --save --save-all` writes it |
| `ken-<fn1>.<fn2>`, `ken1-<fn1>.mini`, `ken1-<fn1>.print` | Each scene's program, summary and printout (pass 2) |
| `<scene>.glass.json` | Each scene's glass box, with its `looks` |
| `<scene>.film.json` | Each scene's film, with `looks` |
| `ken1-<movie>.posit` | Where each scene's filming left the characters |
| `cast.png`, `frames.png` | Ken's cast beside Ani's, and one frame of each scene in 1978 beside the same frame with APPEAR |

## The looks

![Ken's 1978 cast above, Ani's below](cast.png)

| | Ken, 1978 | Ani, with APPEAR | Why, from the winning suggestion of each choice |
|---|---|---|---|
| Cinderella | green star, size .05 | small circle, .036 | **Small:** she is shy (the revival's knowledge: a shy character keeps small and takes up little room), and the film's flashiness is low (Ken's comment in `(flashiness level)`, `glosug.41:39`: "size is also bigger is flashier"). **Smooth:** she is friendly (thesis p. 161, "smooth is friendly") and graceful (from beautiful, `char.2:13-20`; the revival's), and her paths are of medium jaggedness (the revival's dynamics source). **Simple:** she is shy (the revival's), and the film's complexity is low (p. 164). The film's variety suggested each of the three as well. |
| The stepmother | red square, .07 | large triangle, .07 | **Large:** she is strong (p. 238), she dominates Cinderella (`relate.22:63`, "even more typical would be size"; p. 157, "be larger than the other"), and she is to look different from the fairy godmother, since each of them is unique and they are unlike each other (CSUMRY's uniqueness and comparison summaries; p. 94, a unique character should "move (or appear) differently"). **Jagged:** she is mean (the revival's), and she is to look different from the other three, for the same reasons. **Simple:** the film's complexity is low, she moves fast (the revival's dynamics source), and she is to look different from the Prince. |
| The fairy godmother | orange circle, .05 | eight-pointed star, .05 | **Medium:** strong suggests large, but she is to look different from both Cinderella (small) and the Prince (large). **Not smooth** ("not low"): she is to look different from Cinderella and the Prince, who are both smooth, since each of the three is unique (p. 94). **Complex:** she is magical (the revival's: magic sparkles), and she is to look different from Cinderella and the Prince. For "not smooth and complex" the star expert offered the eight-pointed and the ten-pointed star; the first, the more stereotyped, was taken, since the film's originality is low. |
| The Prince | yellow triangle, .05 | large hexagon, .07 | **Large:** he is strong (in his physical description; p. 238), and he is to look different from Cinderella. **Smooth:** he is graceful (from beautiful) and his paths are smooth. **Medium complexity:** the film's complexity (low) and variety, compromised with looking different from Cinderella (simple). |

No two characters were drawn alike, so no choice was made again to tell two apart (`appearances.json`, `findings` is empty). `tools/check-appear.mjs` finds no piece of the revival's knowledge that gives back one of Ken's looks. One of Ani's looks is Ken's: the stepmother is large, as he drew her. That comes from Ken's own knowledge (strong, p. 238; dominates, `relate.22:63` and p. 157; physical uniqueness, p. 94), so the check lists it rather than failing.

![One frame of each scene, 1978 on the left, with APPEAR on the right](frames.png)

## What changed from 1978, and why

### Pass 1

- `ken-cp.30` has CP 29's 102 choices, with the same values, in the same order. Ani makes them all before she chooses any look (`(choose-appearances)` runs after `(z)`), so no look can move them.
- It has 30 more choices: 12 absolute ones (size, shape-jaggedness and shape-complexity for each of the four, their parent `appearance-choice-point`) and 18 relative ones (relative-size, relative-shape-jaggedness and relative-shape-complexity between pairs). `save-answers` lists relative choice points newest first, so these 18 come at the top of the file, and the 12 absolute ones after Ken's 48.
- It ends with each character's look, `(define (appearance-of cinderella) appearance (set your shape to circle) ...)`, which pass 2 reads.
- Take these 34 forms out and the file is `reports/pass1-choices.txt`, byte for byte.

### Pass 2

- **Starting from where the 1978 film left the characters** (`reports/pass2`'s POSIT files), each scene's program is 1978's once the four `(ask ... take look (look: ...))` forms at its end are taken off. Its summary, printout and glass box (without its `looks`) are also byte for byte 1978's. `tools/check-ext.mjs` checks all of this. The looks don't reach Ani's planning: pass 2 reads a size only as the `ani-size` of a character's vicinity, which Ani's own characters don't have (`interf.149:131-135`, "for now they don't change").
- **Chained, as here:**
  - The Introduction's and Kept Apart's programs are 1978's, apart from the looks.
  - No Longer Kept Apart's, the Meeting's and Justice's programs differ only in where the characters start. These are the locations in their first subscene (and the Meeting's second), which RUN reads from the POSIT file that the previous scene's filming wrote (`run.65:52-53`).
  - Every summary (MINI) file is 1978's.
  - The printouts and glass boxes differ by those same positions, and by the distances between characters that are measured from them. In Kept Apart that is a single one, from Cinderella to the Prince, and it doesn't reach the program.

### Filming

| Scene | 1978 frames | With APPEAR |
|---|---|---|
| Introduction | 192 | 193 |
| Kept Apart | 116 | 116 |
| No Longer Kept Apart | 17 | 19 |
| Meeting | 179 | 175 |
| Justice | 84 | 92 |

Director's collisions use each character's size:
- Two characters are in contact when they are closer than the sum of their sizes (`are-they-colliding`, `dichar.103:348-352`).
- A walker stops for, or goes round, someone at its destination by the same sum (`dichar.103:285-323`, `355-358`).
- A hit goes in to 0.8 of the two sizes (`dichar.103:509-527`).
- Whether a character is off the stage depends on its size (`dichar.103:41-49`).

Ani's sizes are .036 for Cinderella (.05 in 1978), .07 for the stepmother (.07), .07 for the Prince (.05) and .05 for the fairy godmother (.05). So in each scene:

- **Introduction (one frame longer).** The stepmother pushes the smaller Cinderella. The push's moving together ends at frame 69 (70 in 1978), and her moving away at 104 (102). The first subscene ends at 108 (106), and everything after it is two frames later. The Prince gets on stage and walks to accompany Cinderella. His walk ends at 158 (157), and the scene at 191 (190).
- **Kept Apart (no change in length).** Each round of the guard's chase ends when she comes in contact, so the rounds shift by one to three frames. The scene ends where 1978's ends. Its length is set by the subscenes' running times, which Ani planned as in 1978.
- **No Longer Kept Apart (two frames longer).** Cinderella starts where Kept Apart left her, which is not where 1978 left her. The fairy godmother gets on stage and walks to her, reaching her a frame later. They accompany each other to frame 17 (15).
- **Meeting (four frames shorter).** The Prince walks to Cinderella until they touch. With his larger size and her smaller one they touch at .106 of the screen apart, not .10, so they meet at frame 89 (93). Every later event is four frames earlier.
- **Justice (eight frames longer).** The Prince and Cinderella start where the Meeting left them, facing other ways, and repeatedly come in contact. The last of those walks to contact ends at frame 89 (81).

Two things in the pictures follow from Ken's Director, not from APPEAR:
- Characters walking together overlap. In 1978 the Prince's triangle and Cinderella's star crossed; now Cinderella's small circle sits inside the Prince's large hexagon while they "get it on".
- Every shape turns with its character's heading, so the stepmother's triangle points the way she goes, at Cinderella when she pushes and chases her.

Director's own color filming (`tools/run-scene.mjs --color`, ANINIT's `running-color`) isn't supported with APPEAR. Its many-polys parts are copies made before the program loads, so they would keep Ken's shapes. Ani's colors are a later stage (5).
