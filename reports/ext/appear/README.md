# Cinderella with APPEAR: the looks Ani chose, and what changed from 1978

These are the files Ken's Cinderella makes when Ani chooses her characters' sizes and shapes (APPEAR, stage 2 of [Phase 9](../../chapter-x/PLAN.md), "Items 1 and 2: appearances"), chained scene to scene as the film page makes them: at 4 frames a second here, and at 24, the page's default, in `24fps/`. With MEND as well, as the page makes it with the revival's extensions, both are the same, frame for frame, with no repair notes. `npm run test:ext` (`tools/check-ext.mjs`) checks that a run still makes those at 4 frames a second, and `npm run test:ext24` (`--fps 24`, about 15 minutes) those at 24; `--save` makes them again. `npm run test:appear` (`tools/check-appear.mjs`) checks the knowledge behind the looks against Ken's legitimacy rule and his decision 4 (below).

| File | What it is |
|---|---|
| `ken-cp.30` | Pass 1's answers, KEN;CP 30 |
| `appearances.json` | How Ani chose each look (`src/glassbox-pass1.js` `collectAppearances`): each choice, the sources of the suggestion that won it, and the value the look has as drawn |
| `pass1.json`, `pass1-choices.txt`, `pass1-reasons.txt` | Pass 1's glass box, as `tools/run-pass1.mjs --extensions appear --glass-box --save --save-all` writes it |
| `ken-<fn1>.<fn2>`, `ken1-<fn1>.mini`, `ken1-<fn1>.print` | Each scene's program, summary and printout (pass 2) |
| `<scene>.glass.json` | Each scene's glass box, with its `looks` |
| `<scene>.film.json` | Each scene's film, with `looks` |
| `ken1-<movie>.posit` | Where each scene's filming left the characters |
| `24fps/` | The same for each scene, chained at 24 frames a second |
| `cast.png`, `frames.png` | Ken's cast beside Ani's, and one frame of each scene in 1978 beside the same frame with APPEAR |

## The looks

![Ken's 1978 cast above, Ani's below](cast.png)

Each reason below is a source whose own suggestion was the value chosen, or, where Ani compromised, the two she met between.

| | Ken, 1978 | Ani, with APPEAR | Why |
|---|---|---|---|
| Cinderella | green star, size .05 | small hexagon, .036 | **Small:** she is shy (the revival's: a shy character keeps small and takes up little room), and the film is not to be flashy (Ken's comment in `(flashiness level)`, `glosug.41:39`: "size is also bigger is flashier"). **Smooth:** she is friendly (p. 161, "smooth is friendly") and graceful (from beautiful, `char.2:13-20`; the revival's: graceful movement is smooth movement, so a smooth outline). Shabby's ragged outline (the revival's, motivated by p. 166) was much less strongly suggested and set aside. **Moderately complex:** shy suggests a plain shape (the revival's) and her slow movement a complex one (the revival's dynamics source, motivated by p. 175), each weakly, and Ani compromised between them (`choose.198:499-505`). The polygon expert's one shape for smooth and moderately complex is the hexagon. |
| The stepmother | red square, .07 | large triangle, .07 | **Large:** she is strong (Ken's knowledge, p. 238: a large shape for a character "supposed to be a strong friendly ally"), and she dominates Cinderella (`relate.22:63`, "even more typical would be size"; p. 157, "be larger than the other"); the film's flashiness asked for small and was much less strongly suggested. **Jagged:** she is mean (the revival's: sharp, spiky outlines read as hostile), and she is to look different from Cinderella and the Prince, who are smooth (CSUMRY's uniqueness summaries; p. 94, a unique character should "move (or appear) differently"). **Simple:** she is to look different from the fairy godmother (complex) and Cinderella (moderately complex) (p. 94). The polygon expert's one shape for jagged and simple is the triangle. |
| The fairy godmother | orange circle, .05 | eight-pointed star, .05 | **Medium:** she is to look different from Cinderella (small) and the Prince (large) (p. 94); strong (p. 238) argued for large, and Ani combined it into the middle. **Not smooth** ("not low"): she is to look different from Cinderella and the Prince, who are both smooth (p. 94); drawn jagged, one of the two values that leaves. **Complex:** she is magical (the revival's: magic sparkles, a shape with many points), and she is to look different from Cinderella (moderately complex) (p. 94). For "not smooth and complex" the star expert offered the eight-pointed and the ten-pointed star; the first, the more stereotyped, was taken, since the film's originality is low. |
| The Prince | yellow triangle, .05 | large circle, .07 | **Large:** he is strong (in his physical description; p. 238), and he is to look different from Cinderella, who is small (p. 94). **Smooth:** he is graceful (from beautiful; the revival's) and his paths are smooth (the revival's dynamics source). **Simple:** he moves fast (the revival's: detail is lost in quick movement, motivated by p. 175), the film's variety suggested simple too (`glosug.41:43-55`), and he is to look different from the fairy godmother (complex) (p. 94). |

No two characters were drawn alike, so no choice was made again to tell two apart (`appearances.json`, `findings` is empty), and no expert overrode a choice (each element's `drawn` is its `value`, but for the fairy godmother's "not smooth", drawn jagged). Two of Ani's looks are Ken's. The stepmother is large, as he drew her, from his own knowledge: strong (p. 238), dominates (`relate.22:63`) and her uniqueness (p. 94). The fairy godmother is medium-sized, his .05, which three of his four have, so it sets no one apart. No piece of the revival's knowledge reproduces one of Ken's looks (below).

Before the review of 10 October Ani drew Cinderella as a small circle and the Prince as a large hexagon. The film's complexity no longer suggests a shape's complexity (below), so Cinderella's complexity is now a compromise, moderate, and the Prince's simple. The sizes are as before, so every frame's positions and events are as before too; only the shapes drawn differ. (For a day, between the review and Ken's decision of 11 October, strong's large size was dropped as the revival's, and the stepmother was a small eight-pointed star.)

## Ken's looks and the revival's knowledge

Ken's decision of 9 October (`reports/chapter-x/PLAN.md`, "Decisions" 4): the revival may add knowledge the thesis doesn't state, labeled the revival's with its reason, and any entry that reproduces his 1978 looks is dropped; that is, any of the revival's own entries, since his own knowledge may agree with his 1978 looks (his decision of 11 October, "Decisions" 6). His legitimacy rule is p. 189's: to change Ani only by adding obvious information that was lacking, never "arranging for Ani to do what I want without improving the reasoning". `tools/check-appear.mjs` applies it:

1. Ken's .05 is his medium: "I choose the following shapes and sizes for them" (p. 17).
2. Each piece of knowledge is followed to each character and element it reaches, and each is judged on its own: is the value it suggests Ken's, and did that value set the character apart in his drawing? A piece that gives back Ken's value wherever it reaches, setting someone apart, would draw his cast (as "evil suggests red" would have), and fails. A piece of the revival's that gives one character a value of Ken's that set it apart is flagged.
3. Two pieces of the revival's that together give a character Ken's shape (one its jaggedness, the other its complexity) are flagged.
4. Pass 1 is run again, with only the revival's knowledge (Ken's own left out), and without each piece of the revival's that reaches one of Ken's characters, and each run's looks are set beside Ken's (a look of Ken's here is one that set the character apart: any of his four shapes, or the stepmother's large size). A piece without which a look of Ken's in Ani's result goes away brings that look about: decision 4 drops it. A look of Ken's that only the revival's knowledge gives is flagged.

Every flag needs a decision, kept with its reason in the tool's `REVIEWED`; one without a decision fails the check, and so does a decision for a flag no longer raised. The decisions:

- **Strong suggests large is Ken's** (his decision of 11 October, `reports/chapter-x/PLAN.md`, "Decisions" 6), from p. 238: an improved Ani might give a very pleasant friendly character a large pointed shape, "chosen because the character is supposed to be a strong friendly ally". The thesis gives it for a strong friendly ally; the entry gives it to any strong character. It is what makes Ani draw the stepmother large, as Ken drew her (without it, her dominating Cinderella loses to her looking different from the Prince, and she is small); decision 4 drops only the revival's own entries that give back his looks, and his own knowledge may agree with them. The review of 10 October had relabeled it the revival's generalization, and so dropped it, for a day. "Physically strong suggests large", the revival's, reaches none of Ken's characters.
- **The two dynamics rules: kept.** A character's outline follows its paths (shape-jaggedness after path-jaggedness), and a fast character is drawn simply (shape-complexity opposite to speed), both the revival's, motivated by p. 175. The stepmother's paths are of medium jaggedness and she is fast, so together they give her Ken's square, where nothing else speaks: with only the revival's knowledge, Ani draws her as a square. They are kept because they reach all four and agree with Ken only for her (and the speed rule for the Prince, whose triangle is simple too): Cinderella's medium paths, the fairy godmother's jagged ones and the Prince's smooth ones disagree with his star, circle and triangle. In Ani's film, which has Ken's own knowledge in it, she is not a square, and no look of Ken's in it needs either rule.
- **Shabby suggests jagged** is now the revival's, motivated by p. 166, where the script changes Cinderella "from being shabby and ragged": that says what shabby is, not how Ani is to draw it. It gives Cinderella the jaggedness of Ken's star, which the Prince's triangle shares, so it set her apart in nothing, and in her film it loses to friendly and graceful.
- **The film's complexity no longer suggests a shape's complexity.** It was cited to p. 164, but p. 164 has the experts' offers "selected between on the basis of the desired levels of variety, simplicity, originality", which the shape experts' `select-shape` does; a suggestion for shape-complexity as well counted the film's complexity twice.
- **Obviousness** is the revival's: p. 165 says how many aspects a film should use ("if subtle, then only a few"), and reading that as a film that is not obvious leaving a look at medium, which says nothing, is ours. Ken's Cinderella is obvious, so it suggests nothing here.
- **Mean suggests jagged** has its reason on its own, as a convention of the kind p. 161 says appearances rest on, no longer as "the other side of smooth is friendly" (friendly's opposite in Ken's net is unfriendly, which gets jagged from it).

What the runs drew, where any of Ken's looks came back:

| Knowledge | Cinderella | The stepmother | The fairy godmother | The Prince |
|---|---|---|---|---|
| All of it (Ani's film) | small hexagon | **large** triangle | medium eight-pointed star | large circle |
| Only the revival's | small pentagon | medium **square** | medium eight-pointed star | large circle |

Without each of the revival's pieces in turn, the stepmother stays large, by Ken's knowledge, and no one is drawn as one of Ken's shapes: no piece of the revival's brings one of his looks about.

## Two characters Ani still chooses alike

Two characters drawn alike have the least justified of their shape choices made again, with a different-from suggestion between them (p. 94, "choosing divergent values for one or two elements to help the viewer distinguish the two characters"; p. 164, "the least justified value of the elements ... can be redetermined"), so the choice points and the drawing agree. Two that Ani still chooses alike, as she does twins whose descriptions are the same (her comparisons then tell her strongly that they look the same), are kept apart by the shape experts as a last resort. Since the review:

- The experts relax the second twin's shape choices, the least justified first, until it is drawn as a shape that differs from the first's on **both** elements, relaxing again if need be ("the 'constraint relaxation' ... methods can be applied iteratively", p. 164). Before, they relaxed one and took the first shape not taken: a hexagon beside a pentagon of the same size, which differ by one step on one element and are told apart hardly better than two pentagons.
- What they overrode is in the data: each element in `appearances.json` has `drawn`, the value the look has as drawn, and, if the experts overrode the choice, `overriddenBy`, the choice point's `(overridden-by: shape-experts drawn star because (drawn-alike-with dum))`; `tools/run-story.mjs` prints both on its looks line ("shape-jaggedness medium from ..., drawn high (overridden-by: ...)").
- Twins are kept apart even if they never share a scene: a viewer knows a character from scene to scene by how it looks, and two drawn the same in different scenes would be taken for one.

In the reviewer's story of Tweedledum and Tweedledee, ugly, stubborn and selfish, who hate each other, Ani chooses both a large square, and each of their four shape choices, chosen again to tell them apart, comes back the same. The experts draw Tweedledee as a star, jagged and moderately complex, overriding both of his shape choices; Tweedledum stays a square, as Ani chose him. Before, Tweedledum was drawn a pentagon and Tweedledee a hexagon. In the reviewer's story of seven, every one is now drawn as a shape of its own: of the two twins, kind and friendly, one is a square, as Ani chose them both, and the other a star.

## What changed from 1978, and why

### Pass 1

- `ken-cp.30` has CP 29's 102 choices, with the same values, in the same order. Ani makes them all before she chooses any look (`(choose-appearances)` runs after `(z)`), so no look can move them.
- It has 30 more choices: 12 absolute ones (size, shape-jaggedness and shape-complexity for each of the four, their parent `appearance-choice-point`) and 18 relative ones (relative-size, relative-shape-jaggedness and relative-shape-complexity between pairs). `save-answers` lists relative choice points newest first, so these 18 come at the top of the file, and the 12 absolute ones after Ken's 48.
- It ends with each character's look, `(define (appearance-of cinderella) appearance (set your shape to hexagon) ...)`, which pass 2 reads.
- Take these 34 forms out and the file is `reports/pass1-choices.txt`, byte for byte.

### Pass 2

- **Starting from where the 1978 film left the characters** (`reports/pass2`'s POSIT files), each scene's program is 1978's once the four `(ask ... take look (look: ...))` forms at its end are taken off, and what is taken off is exactly those forms, as the Lisp that wrote the program prints them. Its summary, printout and glass box (without its `looks`) are also byte for byte 1978's. `tools/check-ext.mjs` checks all of this. The looks don't reach Ani's planning: pass 2 reads a size only as the `ani-size` of a character's vicinity, which Ani's own characters don't have (`interf.149:131-135`, "for now they don't change").
- **Chained, as here:**
  - The Introduction's and Kept Apart's programs are 1978's, apart from the looks.
  - No Longer Kept Apart's, the Meeting's and Justice's programs differ only in where the characters start. These are the locations in their first subscene (and the Meeting's second), which RUN reads from the POSIT file that the previous scene's filming wrote (`run.65:52-53`).
  - Every summary (MINI) file is 1978's.
  - The printouts and glass boxes differ by those same positions, and by the distances between characters that are measured from them. In Kept Apart that is a single one, from Cinderella to the Prince, and it doesn't reach the program.

### Filming

![One frame of each scene, 1978 on the left, with APPEAR on the right](frames.png)

| Scene | 1978 frames | With APPEAR | At 24 frames a second: 1978 | With APPEAR |
|---|---|---|---|---|
| Introduction | 192 | 193 | 917 | 918 |
| Kept Apart | 116 | 116 | 701 | 701 |
| No Longer Kept Apart | 17 | 19 | 113 | 112 |
| Meeting | 179 | 175 | 1051 | 1038 |
| Justice | 84 | 92 | 458 | 418 |

Director's collisions use each character's size:
- Two characters are in contact when they are closer than the sum of their sizes (`are-they-colliding`, `dichar.103:348-352`).
- A walker stops for, or goes round, someone at its destination by the same sum (`dichar.103:285-323`, `355-358`).
- A hit goes in to 0.8 of the two sizes (`dichar.103:509-527`).
- Whether a character is off the stage depends on its size (`dichar.103:41-49`).

Ani's sizes are .036 for Cinderella (.05 in 1978), .07 for the stepmother (.07), .07 for the Prince (.05) and .05 for the fairy godmother (.05). So, at 4 frames a second:

- **Introduction (one frame longer).** The stepmother pushes the smaller Cinderella. The push's moving together ends at frame 69 (70 in 1978), and her moving away at 104 (102). The first subscene ends at 108 (106), and everything after it is two frames later. The Prince gets on stage and walks to accompany Cinderella. His walk ends at 158 (157), and the scene at 191 (190).
- **Kept Apart (no change in length).** Each round of the guard's chase ends when she comes in contact, so the rounds shift by one to three frames. The scene ends where 1978's ends. Its length is set by the subscenes' running times, which Ani planned as in 1978.
- **No Longer Kept Apart (two frames longer).** Cinderella starts where Kept Apart left her, which is not where 1978 left her. The fairy godmother gets on stage and walks to her, reaching her a frame later. They accompany each other to frame 17 (15).
- **Meeting (four frames shorter).** The Prince walks to Cinderella until they touch. With his larger size and her smaller one they touch at .106 of the screen apart, not .10, so they meet at frame 89 (93). Every later event is four frames earlier.
- **Justice (eight frames longer).** The Prince and Cinderella start where the Meeting left them, facing other ways, and repeatedly come in contact. The last of those walks to contact ends at frame 89 (81).

At 24 frames a second the same sizes make the same kinds of difference. With MEND as well the films are the same at both rates, frame for frame, and MEND leaves no note. (For the day that strong's large size was dropped, the stepmother was small, and at 24 frames a second the Meeting never ended with APPEAR alone: Cinderella, going to meet the Prince, waited for someone in her way to move and never set off, a walk MEND's M12 stops.)

Two things in the pictures follow from Ken's Director, not from APPEAR:
- Characters walking together overlap. In 1978 the Prince's triangle and Cinderella's star crossed; now Cinderella's small hexagon sits inside the Prince's large circle while they "get it on".
- Every shape turns with its character's heading, so the stepmother's triangle points the way she goes, at Cinderella when she pushes and chases her.

Director's own color filming (`tools/run-scene.mjs --color`, ANINIT's `running-color`) isn't supported with APPEAR. Its many-polys parts are copies made before the program loads, so they would keep Ken's shapes. Ani's colors are a later stage (5); until then, in color, the film page draws each character of a film with Ani's looks in its 1978 color, and a new character in the color of the shape it would have had (Ken's decision of 11 October, "Decisions" 7).
