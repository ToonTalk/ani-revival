# Cinderella with KNOW: the knowledge you could have added, and what it changes

KNOW (stage 4 of [Phase 9](../../chapter-x/PLAN.md), "Item 4, part 2: KNOW") adds knowledge your Ani didn't have: words for characters, ways of showing relationships, three display methods, and feelings. Each piece is in the idiom of the file of yours it extends, read in after that file loads, and each has its evidence or the revival's reason (your decision 4 of 9 October: the revival may add knowledge the thesis doesn't state, labeled as the revival's, with its reason). The files are `src/director/revive/know.lisp` (REVIVE;KNOW: what they share, and the rule for judging each piece) and its five parts, KNOWDS, KNOWRL, KNOWCV, KNOWDI and KNOWEM. KNOW needs MEND: its display methods bring on a character who is off the stage with MEND6's step, and its feelings are combined with joy by MEND7's repair of COSUG's combine.

These are the files your Cinderella makes with KNOW, chained scene to scene as the film page makes them: at 4 frames a second here, and at 24 in `24fps/`. `npm run test:know` (`tools/check-ext.mjs --extensions know`) checks that a run still makes them at 4, and `npm run test:know24` at 24 (about 15 minutes); `--save` makes them again. `npm test` runs `test/know.test.js`, which checks the pieces one by one and the rule that keeps pass 1 at CP 29. `npm run test:stress` makes three stories that use every piece (`test/stories/stress/know-*.lisp`), and every other stress story, with the extensions the page's switch turns on.

| File | What it is |
|---|---|
| `ken-<fn1>.<fn2>`, `ken1-<fn1>.mini`, `ken1-<fn1>.print` | Each scene's program, summary and printout (pass 2), chained |
| `<scene>.glass.json` | Each scene's glass box |
| `<scene>.film.json` | Each scene's film |
| `ken1-<movie>.posit` | Where each scene's filming left the characters |
| `from-1978/` | The Introduction's and Kept Apart's pass 2, each planned from where your 1978 film left the characters, to set beside `reports/pass2` |
| `24fps/` | The chained film at 24 frames a second |
| `frames.svg` | The Introduction's new activities, each drawn at several frames |

## The knowledge

Every piece below is the revival's unless it says it is yours. Its file and line, and the reason, are in `tools/know-index.mjs`'s index (the page's `DATA.know`), which the glass box will use to mark each suggestion that comes from it.

**Words** (KNOWDS, written as DSCRP). One word of each pair has the suggestions, and its opposite takes them, reversed, through your opposite links, as brazen takes shy's.

| Word | Kind | Suggests | Shows itself by | Why |
|---|---|---|---|---|
| gentle; rough | personality | slow, low acceleration, smooth paths | | Michotte: "slow motion conveyed gentleness", rapid movement violence (thesis p. 159, L4189-4190) |
| nervous; calm | personality | jagged paths, high acceleration, not deliberate | | Michotte: "sudden and repeated variations of direction, or even merely of speed" give "nervousness" (p. 103, L2823-2825) |
| cheerful; gloomy | personality | high activity, rhythmic, curved paths | | your joy, as a lasting disposition (emote.9:11-48) |
| clever | personality | deliberate, direct paths | | named as a word that could be added (p. 19, L660-662) |
| brave; cowardly | personality | drawn towards enemies, deliberate | brave chases its enemy; cowardly avoids it | as mean chases (dscrp.17:252-259); Michotte: "as though B was afraid when A approached, and ran off" (p. 158, L4157) |
| curious | personality | strongly drawn to strangers | meets a stranger (MEND5's move-to) | the other way from shy's avoidance (dscrp.17:66-74) |
| playful | personality | rhythmic, curved paths, active | | lively, bouncy and roundabout |
| old; young | physical | slow, low acceleration, less active | | you let a physical word decide movement: beautiful makes graceful (char.2:13-20) |
| slow; quick | movement | slow, strongly | | the film page's tortoise and hare: hard-working and determined both say "not slow" (dscrp.17:78, 241), so Ani made the tortoise fast |
| timid, wicked, cruel | personality | nothing of their own: each is a neighbor of shy, evil or mean | what their neighbor shows itself by (below) | your similar links, "indirect sources of suggestions" (p. 83, L2342-2344) |

**Relationships** (KNOWRL, written as RELATE). None suggests anything for the relative dynamics, so none can move a pass-1 choice.

| Word | Shows itself by | Why |
|---|---|---|
| is-obedient-to (yours) | following, medium | "Ani has no idea how to establish that Cinderella is obedient towards ... her stepmother" (p. 65, L1855-1857) |
| is-helpful-towards (yours) | helping, medium | "helps" could be added (p. 19) |
| likes (PREREQ's prerequisite) | accompanying, low | likes counts loves (prereq.19:115-116), which shows itself by accompanying (relate.22:28-32); liking is less |
| dislikes | avoiding, medium; a neighbor of hates | PREREQ already reads dislikes as the other side of likes (prereq.19:117-118) |
| fears | avoiding, high | named as a word that could be added (p. 19); Michotte (p. 158) |

**Ways of showing** (KNOWCV, written as CONVEY; KNOWDI, written as DISPLY). Each display method is made only of DISPLY's and PLACE's parts, places the two characters as yours do, brings on the other one if it starts off the stage (MEND6), and counts that walk in its time estimate.

| Verb | Display method | What it looks like | Why |
|---|---|---|---|
| helps (yours, with no way of showing: "for now don't have an suggestions as to how to convey this", convey.64:127) | helps-along | the one helped sets off slowly on its own (trying-alone); the helper goes round behind it (goes-behind-to-help, to your a-small-distance-away-from, interf.149:395-402), comes up against it (comes-in-contact-to-help), and with no pause they go on together, the helper behind, at its pace (helping-along) | Michotte's launching, which your pushing is made of: with no pause "observers perceived the first square as causing the other to move" (pp. 158-159, L4168-4178); the pushee moved with the pusher's dynamics (disply.311:289-315) |
| avoids (yours, a kind of prevents, whose receiver asks for prevents by name, convey.64:167-181) | moves-away-from | the other comes a small part of the way towards it (other-approaches); half a second later it runs off the other way (moves-away), a quarter of the screen, as your chasee runs from its chaser (convey.64:102-111), regardless of anyone in its way, as your exit-by does | "as though B was afraid when A approached, and ran off" (p. 158, L4157) |
| follows (new, a kind of moves, as chases is) | follows-behind | the leader goes a good way off (leading); half a second later the follower sets off after it at nine tenths of its pace, keeping behind, and closes up to it when it stops (following) | as a chaser sets off after its chasee (disply.311:48-85); the walk to contact as goes-to-to-accompany's (disply.311:204-213) |

kills is left out: Ani has no notion of a character leaving the story for good (nor of the resurrection your footnote has the fairy godmother perform, p. 99). gives, does, moves, takes, requests and refuses need things to give and take, which Ani doesn't have.

**Feelings** (KNOWEM, written as EMOTE). Each suggests changes as joy does, as large as the feeling and at its speed. A level is written as joy's, (positive medium), or, as you wrote your pre-meeting scene, just high; a negative pride is shame, not pride reversed, and suggests nothing.

| Feeling | Changes | Why |
|---|---|---|
| pride | speed down, medium; path-jaggedness down, medium; deliberateness up, low | a proud character moves slowly, smoothly and deliberately; your Kept Apart makes the stepmother proud (cindy.46:72) |
| anticipation | activity-level up, high; rhythmic-level up, medium; path-jaggedness up, low | your pre-meeting scene (cindy.46:121) |
| loneliness | speed down, medium; activity-level down, medium; path-length to long, low | your pre-meeting scene (cindy.46:124); your sad joy lengthens paths (emote.9:61-66) |
| fear | speed up, high; acceleration up, high; path-jaggedness up, medium | Michotte: nervousness, agitation (p. 103), running off (p. 158) |
| anger | speed up, high; acceleration up, high; path-curvature down, medium | Michotte: "Rapid movement gives the impression of "violence"" (p. 103) |

**Sharing with neighbors** (REVIVE;KNOW). "bad ... should get most from its neighbor" (dscrp.17:183). A word with no way of showing itself borrows each neighbor's, at the same strength, with the source `(neighbor-of word neighbor)`, as pass 1 borrows a neighbor's suggestions for how a character moves (cosug.215:84-88). A word with a way of its own borrows nothing. So a timid character avoids a stranger as a shy one does, and a cruel one chases or hurts its enemy as a mean one does.

## Your legitimacy rule

"The only legitimate changes that can be made so that Ani makes choices more to my liking are to add obvious information that was lacking or was too inaccurate"; anything else "would constitute cheating" (p. 189). Nothing in KNOW removes or penalizes an option of yours, and nothing in it is there to make Cinderella come out one way: each piece is general knowledge about a word, a relationship, a way of showing or a feeling, and its reason says so. kills is left out for a reason about what Ani can represent, not to keep the stepmother from killing Cinderella.

## What changed from 1978, and why

### Pass 1: nothing

KEN;CP 30 is byte for byte what Ani as in 1978 writes (`reports/pass1-choices.txt`): CP 29's 102 choices, each in its place. The choice points and their reasons are those of `app/data/pass1.json`, and pass 1 leaves no repair note. That rests on a rule `test/know.test.js` checks in a running Lisp: none of KNOW's words with suggestions of its own for how a character moves is a neighbor or opposite of a word CINDY uses, and KNOW gives CINDY's words no such suggestions. Your DESCRIPTOR spreads each link to the neighbors' neighbors and the opposites' opposites (char.2:111-131), so the check is made on the links as they are after spreading: wicked, a neighbor of evil, is then an opposite of good and kind too, and timid an opposite of brazen and forward. The words linked to CINDY's are timid, wicked, cruel and dislikes, and none of them has suggestions of its own.

### Pass 2, from your 1978 positions

Each scene planned from where your 1978 film left the characters (`reports/pass2`'s POSIT files): No Longer Kept Apart's, the Meeting's and Justice's programs, summaries, printouts and glass boxes are byte for byte 1978's. KNOW changes two scenes.

**The Introduction** (`from-1978/`, the same as the chained run, since it is the first scene):

- **Cinderella follows her stepmother.** Your Introduction establishes her relationship to her stepmother, (and is-obedient-to is-tolerant-of). In 1978 neither word had a way of showing it, and Ani warned that she had "no idea how" (p. 65, L1855-1857; establish-task-6 is `cant-do` in `reports/pass2/introduction.glass.json`). Now is-obedient-to suggests following, so the task becomes a convey task, (follows cinderella step-mother), shown by follows-behind. Following comes first: the stepmother walks to a far corner and Cinderella, coming on from the side, follows a little behind her (frames 0 to 16). is-tolerant-of still has nothing to show it.
- **Cinderella helps the Prince.** Her friendly suggests helping a friend (dscrp.17:109-116), and friend-of finds the Prince, whom she loves. In 1978 Ani chose it and then had no way of showing helping, so she "canceled it" (p. 65, L1857-1859): convey-task-11 has no suggestion and is `cant-do`, with a subscene of no time. Now helping is shown by helps-along, in the fifth subscene (frames 109 to 150): the Prince comes on, sets off slowly on his own, Cinderella goes round behind him and, as she reaches him, they go on together to the far corner, the Prince in front.
- **The Prince is brought on in her helping**, by MEND6's step, and the glass box has its note, `brought-on-stage`. In 1978 her accompanying him, which comes after, brought him on (goes-to-and-accompanys' getting-on-stage, disply.311:192-203); now he is on the stage already, and that step goes nowhere.
- **The scene's time is shared six ways, and the pushing is half as long.** Your SCENE gives each task in the sequence an equal share of the scene's 30 to 75 seconds (scene.9:333-344, 415-424): six tasks now, each 5 to 12.5 seconds, where five had 6 to 15. Your give-every-task-its-ideal-time-1 hands the first task of a sequence the parallel flag of the `(and ...)` it is in, and a task in parallel takes its whole ideal time, not a time within its share (chomet.123:76-116). In 1978 the first was the pushing, which so ran its ideal 24.4 seconds, five pushes. Now the first is the following, 4.2 seconds, and the pushing is held to its share, 12.5 seconds: its subscene is stretched by 0.51 (scene.9:159-197), and the stepmother pushes Cinderella four times, more quickly. The chasing, the hitting (ten hits, as in 1978) and the accompanying are as in 1978; the helping runs its whole share, 12.5 seconds.
- **The scene** is planned at 47.0 seconds (42.2 in 1978) and films in 190 frames (192).

The stepmother's convey methods are as in 1978. Her hates suggests avoiding, best when she doesn't dominate Cinderella (relate.22:42-45), and avoiding now has a way of being shown, but she dominates her, so Ani chooses pushing, as in 1978.

**Kept Apart** (`from-1978/`). Your scene makes the stepmother (and (joy (positive medium)) (pride (positive medium))) (cindy.46:70-72). In 1978 Ani knew only joy and passed over pride without a word (ask-if-exists, sugest.123:38). Now pride suggests slowing her, smoothing her paths and making her more deliberate. Her joy raises her speed, so the two changes to her speed have different signs: your COSUG, as MEND7 repairs it, finds them in conflict, and CHOMET makes neither, since it takes only suggestions (chomet.123:463-472). So:

- where her program in 1978 raised her speed by a quarter, gradually, `(gradually change by 1.25 factor for speed at medium speed)`, now her speed stays as it was;
- her paths become a fifth less jagged, `(gradually change by 0.8 factor for path-jaggedness at medium speed)`;
- and her movements a quarter more deliberate, which Director doesn't read, as in 1978 (thesis L4853-4856).

Her joy's other changes, Cinderella's sadness, and the scene's times (29.75 seconds) are as in 1978. MEND7 leaves its note on her feelings' task, `combined-changes`, with the conflict. Filmed from your 1978 positions, the scene is frame for frame 1978's until frame 62, two frames after the feelings' subscene starts, while she is still standing guard; from there she moves a little differently, by up to 47 dots, about a thirtieth of the picture's width, and Cinderella's second attempt to get past her ends a frame later. It is still 116 frames.

So pride slows the stepmother in Kept Apart in the sense that she no longer speeds up, as joy alone made her in 1978; it is your conflict rule, not KNOW, that cancels joy's speeding up, as the plan's finding on MEND7 predicted.

### The film, chained

| Scene | 1978 frames | With KNOW | At 24 frames a second: 1978 | With KNOW |
|---|---|---|---|---|
| Introduction | 192 | 190 | 917 | 1037 |
| Kept Apart | 116 | 116 | 701 | 701 |
| No Longer Kept Apart | 17 | 19 | 113 | 111 |
| Meeting | 179 | 175 | 1051 | 1041 |
| Justice | 84 | 84 | 458 | 485 |

The Introduction and Kept Apart are as above. At 24 frames a second the Introduction is five seconds longer than 1978's: there your pushing ran 20.9 seconds (at 4, 26.5), and now it runs 12.6, the following 3.9 and the helping 9.8. No scene leaves a repair note while it is filmed, at 4 or at 24. No Longer Kept Apart, the Meeting and Justice are planned as in 1978; only where the characters start differs, since each starts where the last scene's filming left them (`run.65:52-53`), and so do the walks that depend on it: in No Longer Kept Apart the fairy godmother gets onto the stage a frame later and she and Cinderella accompany each other two frames longer, and in the Meeting the Prince and Cinderella come together four frames sooner.

![The Introduction with KNOW: following, the Prince coming on, Cinderella going round behind him and helping him along; and the pushing, in 1978 and now](frames.svg)

## For the page

`tools/know-index.mjs` (`knowIndex(root)`, in the page's data as `DATA.know` once the page is built again) has every piece above with its `file`, `line` and `why`: `words` (KNOW's own, with their spread links and what they borrow), `knowledge` (each suggestion KNOW gives a word, its own or yours: `source`, `element`, `value`, `strength`; for a way of showing, `element: "establish"` and its `verb`), `verbs`, `methods` (with the names of the walks each plans), `feelings`, `sharing`, `links` (your words whose links KNOW changes) and `vocabulary` (every word Ani knows with KNOW on, in the shape of the page's `DATA.words`, its links as spread). A suggestion in a glass box comes from the revival's knowledge when its source is one of KNOW's words or feelings, a verb KNOW gives a way of showing (`source helps`), one of your words with an entry in `knowledge` for the same element and verb (`source is-obedient-to`, `(follows ...)`), or `(neighbor-of word neighbor)` on an establish suggestion (the sharing).
