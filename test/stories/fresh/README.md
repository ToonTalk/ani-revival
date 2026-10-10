# Fresh stories

Three fables written the way a language model writes for the film page, with the vocabulary and task forms the page gives it (`app/film/llm.js`), by the reviewers of MEND on 9 October 2026. They are not made to meet any one failure, as the stress stories are; they show what a new story meets. Run one with:

```
node tools/run-story.mjs test/stories/fresh/<name>.lisp --extensions mend
```

With MEND (10 October 2026, after its second round), every scene of each films and ends, at 4 frames a second:

| Story | Scenes and frames | Without MEND |
|---|---|---|
| fox-and-crow | The Cheese 9, The Flattery 89, The Trick 80 | stops in its first scene, on `wander-around`, and The Trick on `(exit-by nil)` |
| hansel-and-gretel | Into the Forest 64, The Gingerbread House 107, The Cage 84, The Escape 116, Home Again 132 (108 and 178 before M12's revision the same day) | The Escape never ends (601 frames): the witch, pushed, is blocked by Hansel |
| ugly-duckling | The Hatching 36, Teased 113, Alone in Winter 53, The Swans 45 | stops at Alone in Winter, on `wander-around`, and The Swans with it |

Ken's pushes-around still takes characters off the picture for long stretches in Teased (a DETAIL candidate, `reports/chapter-x/PLAN.md`).

`npm run test:stress` (`tools/check-stress.mjs`) makes each of the three without MEND, with it, and with MEND and APPEAR (Ani choosing her characters' looks), and checks what each did against `../stress/expected.json`. With MEND and APPEAR every scene films and ends too (10 October 2026): the Fox and the Crow in 9, 89 and 80 frames, Hansel and Gretel in 65, 103, 80, 122 and 152, the Ugly Duckling in 36, 113, 53 and 43. Until then the Fox and the Crow stopped in pass 2 of every scene with both on: REVIVE;MEND1 read APPEAR's appearance-choice-point, a kind of choice point, as one of the choices pass 1 made (`src/director/revive/mend1.lisp`, choice-points-pass-1-made).
