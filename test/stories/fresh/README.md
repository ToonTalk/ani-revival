# Fresh stories

Three fables written the way a language model writes for the film page, with the vocabulary and task forms the page gives it (`app/film/llm.js`), by the reviewers of MEND on 9 October 2026. They are not made to meet any one failure, as the stress stories are; they show what a new story meets. Run one with:

```
node tools/run-story.mjs test/stories/fresh/<name>.lisp --extensions mend
```

With MEND (10 October 2026, after its second round), every scene of each films and ends, at 4 frames a second:

| Story | Scenes and frames | Without MEND |
|---|---|---|
| fox-and-crow | The Cheese 9, The Flattery 89, The Trick 80 | stops in its first scene, on `wander-around`, and The Trick on `(exit-by nil)` |
| hansel-and-gretel | Into the Forest 64, The Gingerbread House 107, The Cage 84, The Escape 108, Home Again 178 | The Escape never ends (601 frames): the witch, pushed, is blocked by Hansel |
| ugly-duckling | The Hatching 36, Teased 113, Alone in Winter 53, The Swans 45 | stops at Alone in Winter, on `wander-around`, and The Swans with it |

Ken's pushes-around still takes characters off the picture for long stretches in Teased (a DETAIL candidate, `reports/chapter-x/PLAN.md`).
