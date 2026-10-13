# The model's fifteen stories with KNOW

The fifteen stories GPT-6.1 Sol wrote on the film page on 11 October (`reports/llm-trials/2026-10-11 gpt-6.1-sol/`, the drafts as the page tidied them), each made twice with `tools/run-story.mjs` on 13 October: with MEND, APPEAR and CHANGE, and with KNOW as well, the set the page's switch turns on. Every scene ends both ways.

In sum: 61 scenes; every one ended without KNOW and every one with it. KNOW changed the plan of 8 scenes: Ani chose helps-along 7 times and follows-behind once, and 7 tasks she could not do without KNOW she now does (45 can't-dos to 38). No story has an unknown-word note either way: the page's prompt lists only the words Ani knew, so the model used only those, and the stories' wishes for other words (a curious, rude Goldilocks; a cruel stepmother and a wicked witch; a brave Gretel; a quick Jack; a slow tortoise; a proud, timid lion and mouse; an angry Tybalt; a lonely duckling) are in their story texts, not their drafts. Once the page lists KNOW's words and feelings when the extensions are on, a model can use them.

Where the plan changed: helping, shown as helps-along, is the commonest, from friendly's helps (dscrp.17:109-116, Hansel, Red Riding Hood, Romeo, the mother bear), is-helpful-towards (the dwarfs, the mouse) and, by sharing, is-generous-towards, your neighbor of is-helpful-towards (the lion); the ugly duckling, obedient to the other ducks, follows them. The other scenes whose frames differ are planned as without KNOW; they start where the scene before them left the characters, which KNOW changed.

Found on the way: the first time, with KNOW's display methods naming your prerequisite can-move, as move-small-part-towards does, the Lion and the Mouse's Friends stopped in pass 2 ("no length bounds for the scene of the convey-task-5 task"). Scoring helps-along asked can-move for its status, which loaded PREREQ, and PREREQ's `(define friends dummy-prerequisite)` (prereq.19:134) made the story's scene called friends a prerequisite. can-move has no status any method can read, and your goes-to-and-accompanys, chases-to and move-to-and-hits name no prerequisite, so KNOW's methods name none now. A story's scene or character named like one of your actors (friends, enemies, strangers, difficult, owned-by, kind-of, in-danger, and others) is still at risk wherever PREREQ loads, as it is in 1978 (move-to-each-other names can-move too): an open item for MEND or the page's story check.

Counts: stories 15; scenes 61; ended without KNOW 61, with 61; scenes whose plan changed 8; KNOW's methods chosen {"helps-along":7,"follows-behind":1}; can't-do tasks 45 -> 38; unknown-word notes 0 -> 0

| Story | Each scene's frames, without KNOW -> with it |
|---|---|
| beauty-and-the-beast | introduction 24 -> 24; kept-apart 160 -> 160; growing-love 46 -> 46; together 122 -> 122 |
| goldilocks-and-the-three-bears | introduction 2 -> 2; bears-return 19 -> 43; chased-away 80 -> 80 |
| hansel-and-gretel | introduction 88 -> 112; driven-away 61 -> 58; kept-apart 23 -> 22; breaking-free 81 -> 82; home-together 156 -> 106 |
| jack-and-the-beanstalk | introduction 200 -> 200; giant-chases-jack 90 -> 90; jack-escapes 84 -> 84; happy-together 104 -> 104 |
| red-riding-hood | wanting-to-visit 67 -> 115; kept-apart 167 -> 173; wolf-chased-off 75 -> 79; together-again 67 -> 113 |
| romeo-and-juliet | lovers 84 -> 123; kept-apart 184 -> 155; the-fight 156 -> 155; together-in-sadness 789 -> 851 |
| snow-white | introduction 131 -> 131; chased-away 63 -> 63; protection 153 -> 198; happy-together 157 -> 166 |
| the-boy-who-cried-wolf | introduction 2 -> 2; first-trick 99 -> 99; another-trick 114 -> 114; the-wolf-comes 97 -> 97; the-sheep-are-chased 97 -> 97 |
| the-fox-and-the-crow | introduction 2 -> 2; flattery 29 -> 29; tricked 134 -> 134 |
| the-gingerbread-man | introduction 2 -> 2; running-away 23 -> 23; false-friendship 87 -> 87; caught 111 -> 111 |
| the-lion-and-the-mouse | introduction 95 -> 116; caught 23 -> 8; released 2 -> 2; trapped 20 -> 20; friends 88 -> 107 |
| the-three-little-pigs | introduction 36 -> 36; friends-together 28 -> 28; wolf-chases 13 -> 13; wolf-kept-out 29 -> 29; happy-together 38 -> 38 |
| the-tortoise-and-the-hare | introduction 341 -> 341; pushed-around 116 -> 116; the-tortoise-triumphs 120 -> 120 |
| the-tortoise-and-the-hare-again | introduction 105 -> 105; the-race 6 -> 6; the-hare-rests 50 -> 50; the-tortoise-wins 29 -> 29 |
| the-ugly-duckling | introduction 87 -> 87; pushed-around 67 -> 82; lonely-winter 23 -> 23; spring-welcome 138 -> 138 |

## What changed

- **goldilocks-and-the-three-bears, bears-return** (19 -> 43 frames); notes: defined-display-method, same-place x2 -> defined-display-method, same-place
  - (helps mother-bear baby-bear): cant-do -> ((helps-along mother-bear baby-bear (good-distance-from (vicinity-of baby-bear))))
- **hansel-and-gretel, introduction** (88 -> 112 frames)
  - (helps hansel gretel): cant-do -> ((helps-along hansel gretel (good-distance-from (vicinity-of gretel))))
- **red-riding-hood, wanting-to-visit** (67 -> 115 frames)
  - (helps red-riding-hood grandmother): cant-do -> ((helps-along red-riding-hood grandmother (good-distance-from (vicinity-of grandmother))))
- **red-riding-hood, together-again** (67 -> 113 frames); notes: defined-display-method -> defined-display-method, overdue-move
- **romeo-and-juliet, lovers** (84 -> 123 frames)
  - (helps romeo juliet): cant-do -> ((helps-along romeo juliet (good-distance-from (vicinity-of juliet))))
- **snow-white, protection** (153 -> 198 frames); notes: defined-display-method, narrowed x3, overdue-move x2 -> defined-display-method, narrowed x3, overdue-move
  - (helps dwarfs snow-white): (new task) -> ((helps-along dwarfs snow-white (good-distance-from (vicinity-of snow-white))))
  - (relationship (relationship-of dwarfs snow-white)): cant-do -> being-handled-by-convey-tasks
- **the-lion-and-the-mouse, introduction** (95 -> 116 frames)
  - (helps lion mouse): (new task) -> ((helps-along lion mouse (good-distance-from (vicinity-of mouse))))
- **the-lion-and-the-mouse, friends** (88 -> 107 frames)
  - (helps mouse lion): (new task) -> ((helps-along mouse lion (good-distance-from (vicinity-of lion))))
  - (relationship (relationship-of mouse lion)): cant-do -> being-handled-by-convey-tasks
- **the-ugly-duckling, pushed-around** (67 -> 82 frames)
  - (follows ugly-duckling other-ducks): (new task) -> ((follows-behind ugly-duckling other-ducks))
  - (relationship (relationship-of ugly-duckling other-ducks)): cant-do -> being-handled-by-convey-tasks
