# The model's fifteen stories with KNOW, and a reviewer's

The fifteen stories GPT-6.1 Sol wrote on the film page on 11 October (`reports/llm-trials/2026-10-11 gpt-6.1-sol/`, the drafts as the page tidied them), each made twice with `tools/run-story.mjs` on 13 October, after the review's fixes: with MEND, APPEAR and CHANGE, and with KNOW as well, the set the page's switch turns on. Every scene ends both ways.

In sum: 61 scenes; every one ended without KNOW and every one with it. KNOW changed the plan of 8 scenes: Ani chose helps-along 7 times and follows-behind once, and the lion, by your decision 10, accompanies the mouse; 7 tasks she could not do without KNOW she now does (45 can't-dos to 38). No story has an unknown-word note either way: the page's prompt lists only the words Ani knew, so the model used only those, and the stories' wishes for other words (a curious, rude Goldilocks; a cruel stepmother and a wicked witch; a brave Gretel; a quick Jack; a slow tortoise; a proud, timid lion and mouse; an angry Tybalt; a lonely duckling) are in their story texts, not their drafts. Once the page lists KNOW's words and feelings when the extensions are on, a model can use them.

Where the plan changed: helping, shown as helps-along, is the commonest, from friendly's helps (dscrp.17:109-116: Hansel, Red Riding Hood, Romeo, the mother bear), is-helpful-towards (the dwarfs, the mouse) and, by sharing, is-generous-towards, your neighbor of is-helpful-towards (the lion); the ugly duckling, obedient to the other ducks, follows them. In the Lion and the Mouse's Introduction the lion dominates, is generous towards and is protective to the mouse, and with decision 10 each of the three words has a way of showing, more than the few CHOMET takes: MEND's M17 keeps the strongest two, helping and accompanying, and his pushing is left out (an `explored` note). The other scenes whose frames differ are planned as without KNOW; they start where the scene before them left the characters, which KNOW changed.

Found on the way:
- With decision 10, the Lion and the Mouse's Introduction stopped in pass 2: with more than a few ways left after every elimination, CHOMET calls explore-method-suggestions, which you never wrote (chomet.123:527). M17, `test/stories/stress/know-three-ways.lisp`.
- Before the review, the same story's Friends stopped once KNOW's display methods named your prerequisite can-move, which loaded PREREQ, whose `(define friends dummy-prerequisite)` (prereq.19:134) made the scene a prerequisite. KNOW's methods name no prerequisite now, and a scene or character named as something of Ani's is renamed before Ani reads the story (`storyWithoutClashes`): friends to friends-scene here.

Counts: stories 15; scenes 61; ended without KNOW 61, with 61; scenes whose plan changed 8; KNOW's methods chosen {"helps-along":7,"follows-behind":1}; can't-do tasks 45 -> 38; unknown-word notes 0 -> 0

| Story | Each scene's frames, without KNOW -> with it |
|---|---|
| beauty-and-the-beast | introduction 24 -> 24; kept-apart 160 -> 160; growing-love 46 -> 46; together 122 -> 122 |
| goldilocks-and-the-three-bears | introduction 2 -> 2; bears-return 19 -> 42; chased-away 80 -> 80 |
| hansel-and-gretel | introduction 88 -> 114; driven-away 61 -> 57; kept-apart 23 -> 24; breaking-free 81 -> 86; home-together 156 -> 153 |
| jack-and-the-beanstalk | introduction 200 -> 200; giant-chases-jack 90 -> 90; jack-escapes 84 -> 84; happy-together 104 -> 104 |
| red-riding-hood | wanting-to-visit 67 -> 111; kept-apart 167 -> 172; wolf-chased-off 75 -> 79; together-again 67 -> 113 |
| romeo-and-juliet | lovers 84 -> 127; kept-apart 184 -> 148; the-fight 156 -> 150; together-in-sadness 789 -> 811 |
| snow-white | introduction 131 -> 131; chased-away 63 -> 63; protection 153 -> 228; happy-together 157 -> 160 |
| the-boy-who-cried-wolf | introduction 2 -> 2; first-trick 99 -> 99; another-trick 114 -> 114; the-wolf-comes 97 -> 97; the-sheep-are-chased 97 -> 97 |
| the-fox-and-the-crow | introduction 2 -> 2; flattery 29 -> 29; tricked 134 -> 134 |
| the-gingerbread-man | introduction 2 -> 2; running-away 23 -> 23; false-friendship 87 -> 87; caught 111 -> 111 |
| the-lion-and-the-mouse | introduction 95 -> 76; caught 23 -> 23; released 2 -> 2; trapped 20 -> 20; friends-scene 88 -> 150 |
| the-three-little-pigs | introduction 36 -> 36; friends-together 28 -> 28; wolf-chases 13 -> 13; wolf-kept-out 29 -> 29; happy-together 38 -> 38 |
| the-tortoise-and-the-hare | introduction 341 -> 341; pushed-around 116 -> 116; the-tortoise-triumphs 120 -> 120 |
| the-tortoise-and-the-hare-again | introduction 105 -> 105; the-race 6 -> 6; the-hare-rests 50 -> 50; the-tortoise-wins 29 -> 29 |
| the-ugly-duckling | introduction 87 -> 87; pushed-around 67 -> 109; lonely-winter 23 -> 23; spring-welcome 138 -> 138 |

## What changed

- **goldilocks-and-the-three-bears, bears-return** (19 -> 42 frames); notes: defined-display-method, same-place x2 -> defined-display-method, same-place
  - (helps mother-bear baby-bear): cant-do -> ((helps-along mother-bear baby-bear (good-distance-from (vicinity-of baby-bear))))
- **hansel-and-gretel, introduction** (88 -> 114 frames)
  - (helps hansel gretel): cant-do -> ((helps-along hansel gretel (good-distance-from (vicinity-of gretel))))
- **red-riding-hood, wanting-to-visit** (67 -> 111 frames)
  - (helps red-riding-hood grandmother): cant-do -> ((helps-along red-riding-hood grandmother (good-distance-from (vicinity-of grandmother))))
- **red-riding-hood, together-again** (67 -> 113 frames); notes: defined-display-method -> defined-display-method, overdue-move
- **romeo-and-juliet, lovers** (84 -> 127 frames)
  - (helps romeo juliet): cant-do -> ((helps-along romeo juliet (good-distance-from (vicinity-of juliet))))
- **snow-white, protection** (153 -> 228 frames); notes: defined-display-method, narrowed x3, overdue-move x2 -> defined-display-method, narrowed x3, overdue-move
  - (helps dwarfs snow-white): (new task) -> ((helps-along dwarfs snow-white (good-distance-from (vicinity-of snow-white))))
  - (relationship (relationship-of dwarfs snow-white)): cant-do -> being-handled-by-convey-tasks
- **the-lion-and-the-mouse, introduction** (95 -> 76 frames); notes: none -> explored
  - (helps lion mouse): (new task) -> ((helps-along lion mouse (good-distance-from (vicinity-of mouse))))
  - (accompanys lion mouse): (new task) -> ((goes-to-and-accompanys lion mouse (good-distance-from (vicinity-of lion))))
  - (pushes lion mouse): ((pushes-around lion mouse)) -> (no task)
- **the-lion-and-the-mouse, caught** (23 -> 23 frames); notes: none -> overdue-move
- **the-lion-and-the-mouse, friends-scene** (88 -> 150 frames)
  - (helps mouse lion): (new task) -> ((helps-along mouse lion (good-distance-from (vicinity-of lion))))
  - (relationship (relationship-of mouse lion)): cant-do -> being-handled-by-convey-tasks
- **the-ugly-duckling, pushed-around** (67 -> 109 frames); notes: none -> overdue-move x3
  - (follows ugly-duckling other-ducks): (new task) -> ((follows-behind ugly-duckling other-ducks))
  - (relationship (relationship-of ugly-duckling other-ducks)): cant-do -> being-handled-by-convey-tasks

## A reviewer's stories

Twenty-five stories a reviewer of KNOW wrote to try it, small ones on the stress stories' skeleton (eleven pairs and twins meeting, an avoid-then-chase, a scene named fear) and longer ones (a lonely ghost three ways, a cowardly lion, a gentle giant, a fox and a crow, a tortoise and a hare, an ugly duckling, Hansel and Gretel), each made with the page's set on 13 October after the review's fixes. Every scene ends: scenes 44, ended 44.

Before the fixes, avoid-then-chase and the gentle giant's Introduction stopped on `(break small-way-from-cant-do-yet)` after KNOW's short walks (now to places fixed as they start: `know-avoid-then-chase`, `know-help-then-chase`), and Hansel and Gretel's Gingerbread House stopped on it after your move-small-part-towards (MEND's M16, its `measured-small-way-from` note: `small-way-third`). The scene named fear films as fear-scene, and the lonely ghost's scene named alone as alone-scene.

| Story | Each scene's frames | KNOW's methods | Notes |
|---|---|---|---|
| avoid-then-chase | on-the-bridge 71 | moves-away-from |  |
| cowardly-lion | introduction 186; the-witch 87; brave-at-last 36 | moves-away-from, follows-behind, helps-along | brought-on-stage, in-scene-first |
| fox-and-crow | the-cheese 9; the-flattery 17; the-trick 82 |  | defined-action, already-alone |
| gentle-giant | introduction 220; the-ogre-comes 83; together 38 | helps-along, moves-away-from | brought-on-stage |
| hansel-and-gretel | into-the-forest 65; the-gingerbread-house 103; the-cage 163; the-oven 127; home-again 56 |  | measured-small-way-from, overdue-move x2, defined-action x2 |
| lonely-ghost | alone-scene 32; the-kitten 33; friends-at-last 180 | moves-away-from, helps-along | defined-action, defined-display-method, same-place; renamed alone to alone-scene |
| lonely-ghost2 | all-alone 32; the-kitten 33; friends-at-last 180 | moves-away-from, helps-along | defined-action, defined-display-method, same-place |
| lonely-ghost3 | the-kitten 44 | moves-away-from | defined-display-method, brought-on-stage |
| pair1 | meeting 36 | moves-away-from | no-running-time, missing-relationship |
| pair10 | meeting 69 | moves-away-from | missing-relationship x2 |
| pair11 | meeting 36 | moves-away-from | no-running-time, missing-relationship x2 |
| pair2 | meeting 36 | moves-away-from | no-running-time, missing-relationship x2, narrowed |
| pair3 | meeting 36 | moves-away-from | no-running-time, missing-relationship |
| pair4 | meeting 36 | moves-away-from | no-running-time, missing-relationship |
| pair5 | meeting 36 | moves-away-from | no-running-time, missing-relationship |
| pair6 | meeting 36 | moves-away-from | no-running-time, missing-relationship |
| pair7 | meeting 81 | moves-away-from | missing-relationship x2 |
| pair8 | meeting 36 | moves-away-from | no-running-time, missing-relationship x2 |
| pair9 | meeting 69 | moves-away-from | missing-relationship |
| scene-named-fear | fear-scene 123 |  | defined-action; renamed fear to fear-scene |
| tortoise-hare | the-boast 82; the-race 102; the-finish 29 | moves-away-from, follows-behind | defined-action x2 |
| twins | meeting 81 | moves-away-from | missing-relationship x2 |
| ugly-duckling | the-hatching 54; teased 61; alone-in-winter 35; the-swans 157 |  | defined-action |
| unknown-relation | on-the-bridge 86 |  |  |
| unknown-word-control | on-the-bridge 12 |  |  |
