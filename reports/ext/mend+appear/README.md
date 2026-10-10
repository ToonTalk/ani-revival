# Cinderella with MEND and APPEAR, at 24 frames a second

These are the files Ken's Cinderella makes with the revival's repairs (MEND) and Ani choosing her characters' looks (APPEAR), as the film page makes it with the revival's extensions, at its default 24 frames a second, chained scene to scene: pass 1's answers (`ken-cp.30`) and appearances (`appearances.json`), and in `24fps/` each scene's program, summary, printout, glass box, film and positions. `npm run test:ext24` (`node tools/check-ext.mjs --extensions mend,appear --fps 24`, about 20 minutes) checks that a run still makes them, and `--save` makes them again.

Ani's looks, and why she chose them, are in [`../appear/README.md`](../appear/README.md): pass 1 is the same with MEND, byte for byte, and so is the film at 4 frames a second, frame for frame, with no repair notes.

| Scene | 1978, at 24 frames a second | With MEND and APPEAR |
|---|---|---|
| Introduction | 917 | 888 |
| Kept Apart | 701 | 701 |
| No Longer Kept Apart | 113 | 101 |
| Meeting | 1051 | 1061 |
| Justice | 458 | 509 |

MEND acts once. In the Meeting's third subscene Cinderella, going to meet the Prince, waits where she stands, turning this way and that, for someone in her way to move, and never sets off; with APPEAR alone the scene never ends. M12 (`src/director/revive/mend12.lisp`) stops the walk after 1.1 seconds of waiting, as if she had got there, and the film's `repairs` say so: `(revival-repair: what overdue-move was (cinderella going-to (contact-with prince by cinderella)) now stopped-as-if-there because (waiting-for-more-than 1.1124687 seconds))`.
