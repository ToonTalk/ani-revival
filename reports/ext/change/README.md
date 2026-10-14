# CHANGE: characters who change (Phase 9, stage 3)

*11 October 2026. `REVIVE;CHANGE` (`src/director/revive/change.lisp`), the "change" extension in `src/pipeline.js`. The plan is item 3 of [`reports/chapter-x/PLAN.md`](../../chapter-x/PLAN.md); the design and its review are [`design-changing-descriptions.md`](../../chapter-x/design-changing-descriptions.md).*

A change is a scene task written the way you wrote one in your commented-out cinderella-beautified scene (`cindy.46:94-105`): `(change (TYPE WHO OLD) (TYPE WHO NEW))`, on its own or inside `(causes CAUSER ...)`. Stage 3 does three things with it:

1. **Who takes part.** Your `process-task-description` makes a task's second word the one it is for, and asks that one to note its part in the scene (`scene.9:458-465`, where you asked "what about other participents?"). A change on its own would have the actor `(personality cinderella shy)` note it, and every job that loads the film description stopped with NO-SUCH-ACTOR. Now a change on its own is for the changed character, and every character a change changes notes its part. A relationship change changes both of its characters; a relationship the story never gave is made first, as CINDY's define makes one.

   **What counts as a change.** A change is made only by a convey or establish task (the scene's tasks, `scene.9:11-13`) whose own description is the change, or which has it inside `(causes x ...)`. It must change a lasting description: physical, personality, movement, role-in-story or relationship, the descriptions "assumed to be permanent" (L4394-4396), not an emotional state. A change anywhere else is wanted, prevented or undone, not made: inside `(wants x ...)`, `(prevents x ...)` or `(undoes x (from-scene ...))`, or in a display task. Ani leaves it alone, and the task notes why: `(revival-repair: what change-not-made was (change ...) now left-alone because (inside wants))`. `storyOutline` takes the same changes, so no fresh look is announced for one that isn't made, and the film page's story check says so for such a task. A change that names no character of the story stops with that said ("CINDRELLA IS NOT A CHARACTER OF THE STORY"), where your code would stop on the missing actor with nothing said about the change.
2. **A fresh look** ("rederive the dynamics ... as if the character were brand new", p. 168, L4396-4402). This is an extra pass-1 job for each scene that changes someone. It runs DATEST's `init` with the change made after CINDY loads and before `study-descriptor-use`. The old words are forgotten, and the character is described with the new ones through your own `process initial description`, as her initial description (your decision 8 of 11 October). Then Ani makes her choices again, in her own order, with every choice that isn't the changed character's held as it was. Her new values go to `KEN1;<fn1> BECOME`, written the way `save-answers` writes `KEN;CP`. A second job, a full recompute with everyone chosen afresh, is kept only for comparison (your decision 1).
3. **Who they have become.** In every later scene, RUN's `to-do-before-running` (`run.65:48`) loads the earlier scenes' BECOME files and makes them so: the descriptions change, and the choice points take her new values. The scene's establish tasks then read the new words, and its special dynamics carry the new values. If MEND is loaded, it narrows any `(not X)` and reads any `none` as medium, as it does for the CP's values.

The change itself isn't shown yet. Ani has no `change` or `causes` verb, so the change task is "cant-do", and in that scene the character moves as before. Stage 6 adds bridging the gap, the cause going to the one it changes, and the link to APPEAR.

**Checks.** `npm run test:change` (`node tools/check-change.mjs`, about 20 minutes; `--quick` takes about 7) checks the files here, and `--save` rewrites them. `test/change.test.js` (in `npm test`) checks the pieces quickly, including the ordering guard. `node tools/check-1978.mjs --extensions change` finds your Cinderella byte for byte as in 1978, with the same loaded files. That is because CINDY 46 has no change task.

## How the fresh look holds everyone else

Your decision 1 says Ani should rederive only the changed character and hold everyone else as they were. The plan's first idea for doing this was to load the story's CP, mark the other characters' nodes completed, reset only her choice points, and run `(z)`. I tried that on your Cinderella with **no change at all**, and it moved every character's own values:

| Chosen again | What moved, with nothing changed |
|---|---|
| Cinderella | path-jaggedness, path-length, repetiveness, activity-level, attraction-towards-friends |
| the stepmother | path-jaggedness, path-curvature, path-length, repetiveness |
| the Prince | deliberateness, acceleration, speed, attraction-towards-enemies |
| the fairy godmother | path-curvature, attraction-towards-enemies |

Your pass 1 makes each choice at a particular moment, after some choices and before others. Cinderella is the focus, so hers come first (`chocho.19:40-43, 68-79`). The comparisons she gets suggestions from read the others' choices as they were at that moment. Asked again once every other choice has been made, they answer differently. Shabby to elegant, which changes nothing about how she moves, would then make her move differently.

So the fresh look **replays your pass 1 in its own order and holds the others**. `record-choice` (`choose.198:596-603`) is where every choice gets recorded. While a fresh look runs, a choice of someone else's that would come out differently is recorded as it was. Its winning suggestion says so: `(held-as-it-was would-have-chosen high from ...)`. Her choices are made again in your order. With no change, each comes at the point where it was first made, with the others as they were then. With a change, a choice of hers may come a little sooner or later than before, because what Ani is happy with, and so what she postpones, can change. With no change, each of your four characters is chosen again **exactly as CP 29 has them**, 102 of 102 (`check-change`'s "held, nothing changed"). After a real change, `check-change` checks that every other character's choices are still the story's CP's, all of them: the absolute and relative choices that don't involve the one who changed.

## The fresh looks (`fresh-look/`)

Each case runs the story's pass 1 (CP 29's 102 choices, by name and value; the stories use your cast and descriptions), then the fresh look, then the full recompute. `<case>.json` is the run's record of the change (the data shapes are below). `<case>.become` is the BECOME file.

### Repents: the stepmother from evil and mean to good and kind (`test/stories/change-of-heart.lisp`)

The Prince causes the change: `(causes prince (change (personality step-mother (and evil mean)) (personality step-mother (and good kind))))`.

| Element | 1978 | Fresh look | Why | Who reads it |
|---|---|---|---|---|
| path-curvature | low | **medium** | In 1978, `evil` gave low, with her three relative choices. Now `good` and `kind`, evil's opposites, suggest high. Her relative choices say "different from" each of the others (Cinderella high, the fairy godmother low, the Prince medium), and together these give medium at low strength: `(opposite-of good evil) (opposite-of kind evil)` with the three relative choice points | Director (×2) |
| path-length | medium | **long** | In 1978, `evil` and `strong` with the relative choices gave medium at low strength. Now the opposites of evil and `strong` give long at medium strength | Director (×2) |
| path-jaggedness | medium | **low** | The same: low at medium strength, from the opposites of evil, `strong` and the film's levels | Director (×½) |
| acceleration | high | **medium** | In 1978, `evil` and `strong` gave high. Now `strong` alone, with the film's levels and the relative choice against the Prince, gives medium | no one: characters "accelerate instantaneously despite the fact that much effort was expended determining the acceleration" (thesis X.B.3 (d), p. 185, L4830-4836) |
| attraction-towards-friends | (negative high) | **(positive high)** | `kind`, and `good` as kind's neighbor | pass 1 only |
| attraction-towards-enemies | (negative high) | **(positive high)** | In 1978 `mean` gave it. Now no word speaks, and the film's variety picks | pass 1 only |
| attraction-towards-strangers | (negative medium) | **(positive medium)** | `kind`, `good` as its neighbor, and variety | pass 1 only |
| deliberateness | high | high | `strong` (high) and the relative choices against the others as they were still outweigh the opposites of evil (low, medium). This was a conflict, resolved as "much less strongly suggested" | no one (thesis X.B.3 (f), p. 186, L4853-4856) |

**Held:** the Prince's deliberateness, at medium. With the stepmother changed, Ani would have chosen high.

**The full recompute** would also make the Prince more deliberate (medium to high), and it gives the stepmother medium deliberateness instead of high. Her other values, path-curvature medium among them, are the same as in the fresh look. Because the Prince is held, her deliberateness stays as the relative choice with him needs it.

### Socializes: Cinderella from shy to brazen (`test/stories/socializing.lisp`)

The change has no cause: `(change (personality cinderella shy) (personality cinderella brazen))`. Brazen is shy's own opposite in DSCRP.

| Element | 1978 | Fresh look | Why | Who reads it |
|---|---|---|---|---|
| speed | low | **medium** | In 1978, `shy` and `graceful` gave low. Now `hard-working` and `graceful` with the film's levels give medium (at low strength) | Director (×2) |
| attraction-towards-enemies | (negative medium) | **(positive medium)** | In 1978 it came from `shy` and variety. Now it is the opposite of brazen, shy, at high strength | pass 1 only |
| attraction-towards-strangers | (negative high) | **(positive high)** | The opposite of brazen, shy, and `good` as kind's neighbor | pass 1 only |

**Held:** four choices of the others that would have come out differently. The Prince's speed would be medium, not high. The fairy godmother's would be low, not medium. Both of their attractions towards enemies would be (negative high).

**The full recompute** would also change five of the others' choices, purely by comparison with her. Three are speeds: the stepmother's (high to medium), the fairy godmother's (medium to high) and the Prince's (high to medium). Two are attractions: the Prince's towards enemies ((positive low) to (negative high)) and the fairy godmother's ((positive medium) to (positive low)). The others' descriptions didn't change, so the fresh look keeps them as they were.

### Beautified: Cinderella from shabby to elegant (your cinderella-beautified, `cindy.46:94-105`)

`check-change` uncomments the scene in memory as it reads CINDY 46. Nothing under `original/` changes.

**Nothing changes**: not her values, not anyone's held choice, and not the full recompute. This is what your footnote predicts: the scene was "meaningless until Ani is extended to handle appearances" (L4354-4355). Shabby and elegant suggest nothing about movement.

### Two more, on your CINDY with a scene added (`made-beautiful`, `makes-up`)

**The fairy godmother makes the stepmother beautiful**: `(causes fairy-godmother (change (physical step-mother ugly) (physical step-mother beautiful)))`. Your CHAR demon gives a beautiful character graceful movement (`char.2:13-20`), and graceful speaks:

| Element | 1978 | Fresh look | Why |
|---|---|---|---|
| speed | high | **medium** | In 1978, `strong`, the film's levels and her relative choices against Cinderella and the fairy godmother gave high. Now `graceful`, with `strong`, the levels and her relative choice against the Prince, gives medium (at low strength) |
| path-length | medium | **long** | In 1978, `strong` and `evil` with the levels gave medium. Now `graceful` and `strong` give long |
| path-curvature | low | **medium** | In 1978, `evil` and her relative choices gave low. Now `graceful` joins them, and they give medium (at low strength) |
| rhythmic-level | medium | **high** | In 1978, the levels and two relative choices gave medium. Now `graceful` and all three relative choices give high |

Nothing of the others' is held, and the full recompute changes no one else.

**The stepmother comes to love Cinderella**: `(change (relationship (relationship-of step-mother cinderella) hates) (relationship (relationship-of step-mother cinderella) loves))`. Both are chosen again, and nothing changes in how either moves: in your pass 1, how one character feels about another doesn't reach the dynamics choices. It does reach pass 2, whose relationship tasks read the new words from the next scene on.

In all five cases, every choice of everyone else after the fresh look is as the story's CP has it (`check-change`).

## Two things this records

**The new words are her initial description** (your decision 8, `reports/chapter-x/PLAN.md`). A changed character is described with her new words through your own `process initial description` (`char.2:21-26, 80-88`; a relationship's, `char.2:157-171`), as if she were brand new: `(description: type personality descriptor good source initial-description)`. Everything of yours that reads an initial description then reads the new words as it reads the story's. Your CHAR demon tells graceful for a new beautiful. Your SUMCOM counts the new words when it compares her with the others; it counts only initial descriptions ("i think i want to skip non initial description sources", `sumcom.53:26`). Where a word came from is kept by the change: the change-of actor, the BECOME file and the run's record. Before your decision, the new words had the change as their source, `(change-in change-of-heart)`. SUMCOM left them out, and the stepmother's path-curvature came out high (the plan's first golden). Everything else was the same in all three cases.

**When the change is made.** The ordering guard in `test/change.test.js` checks that `study-descriptor-use` sees the new words. After the change, the usage of good is (4 out-of 4) and of evil (0 out-of 4); in the scene before, (3 out-of 4) and (1 out-of 4). If the change is made after DATEST's `init` instead, the usage and uniqueness summaries are those of the old words. The fresh look then gives the repentant stepmother path-curvature **high**, not medium, with everything else as above.

## The two stories, end to end (`change-of-heart/`, `socializing/`)

Each story is made as the film page makes it, at 4 frames a second, with MEND, APPEAR and CHANGE. Every scene films and ends. The folders have each scene's program (`ken-story<n>.scene`), summary, glass box, film and POSIT file, plus the BECOME file and `changes.json` (the run's record of the change, `run.changes`). The fresh look inside the film chooses as it does with CHANGE alone.

| Story | Scenes and frames |
|---|---|
| change-of-heart | At Home 108, Change of Heart 72, Kind Again 29 |
| socializing | The Wallflower 69, Learning to Socialize 2, The Dance 61 |

**With APPEAR's colors and look changes (stage 5, 14 October).** The stories' goldens were made again when APPEAR came to choose colors and change looks (`reports/ext/appear/README.md`). Every frame and event of all six scenes is as it was. What changed: each program's take-look forms carry the character's `look-color`; each joy task (Change of Heart's and Kind Again's, the stepmother's and Cinderella's; each of Socializing's three, Cinderella's) has one more method, a `look-change:` of its character's color intensity, by the joy's amount at its speed, and its subscene one more change, `(gradually change look by ...)`; the summaries list those methods, and the glass boxes them and their `lookChanges`; each film's `looks` has each character's color, and its changes; and `moves-differently.json`'s task plans list the look change among the joy's methods. The fresh looks and the BECOME files are as they were: the fresh look rederives how she moves, not how she looks (stage 6). And again on 14 October, for Ken's decision 11 (his uniqueness rule for hues, `reports/ext/appear/README.md`): Cinderella's cast is drawn as in his Cinderella with APPEAR, the stepmother blue and the fairy godmother orange where they were orange and purple, so the take-look forms, the glass boxes' looks and the films' `looks` have those hues; every frame and event is as it was.

**What changes from the next scene on.** For `moves-differently.json`, `check-change` plans and films the scene after the change a second time, from the same positions, without learning who she has become. It then compares the two programs and the two films:

- **Kind Again**, the stepmother. Her special dynamics carry path-curvature medium, not low (×2 in weightify, `interf.149:899-904`), path-length long, not medium (×2), path-jaggedness low, not medium (×½), and acceleration medium, not high (Director doesn't read acceleration). She turns 296 degrees over 716 dots, against 327 over 720: the halved jaggedness takes out more turning than the doubled curvature puts in. She is also described as good and kind now, so she no longer hurts or chases Cinderella: without the change, her personality is shown by `move-to-and-hits` and `chases-to`. With it, Ani has no way yet to show a good and kind stepmother (KNOW, stage 4, adds some), and only her `goes-to-and-accompanys` Cinderella remains. The scene is 29 frames, against 32.
- **The Dance**, Cinderella. Her special dynamics carry speed medium, not low (×2), in each of the three subscenes she moves in. Ani plans the same tasks with the same methods either way. As shy as in 1978, though, Cinderella is slow and keeps the Prince waiting: REVIVE;MEND12 stops his walk to her after 33 seconds, and two more walks later, and the scene takes 258 frames. Brazen, her walks end on their own, and the scene takes 61 frames. She covers 2,767 dots against 2,579 and turns less (1,451 degrees against 2,333).

**The changing scenes themselves.** In Change of Heart, the Prince goes to the stepmother and walks with her, and her joy makes her livelier. The `causes` task is "cant-do". Learning to Socialize is 2 frames: its change task is "cant-do", and Cinderella's joy is a change of dynamics with nothing to extend. Showing the change is stage 6.

## For the page: what the run and the glass box carry

`makeFilmSteps` (and `makeFilm`) takes `onChange(scene, record)`. Before the pass 2 of each scene that changes someone, it reports two progress steps: `"fresh-look"` ("Pass 1 again: a fresh look at step mother, who changes in change of heart") and `"recompute"` ("Pass 1 again, to compare: everyone chosen afresh as of change of heart"). These take about 20 to 25 seconds each in Node. The run's result has `changes`, keyed by scene, each entry the `record` (`changeRecord`) below, or `{ scene, error }` if the fresh look failed. In that case later scenes are planned without it. Each later scene's glass box has `becomes`, which is present only when pass 2 made something so. With CHANGE off, or on a story with no change, neither key is present.

`run.changes["change-of-heart"]` (abridged from `fresh-look/repents.json`):

```json
{
 "scene": "change-of-heart",
 "changes": [{ "type": "personality", "who": "step-mother", "from": ["evil", "mean"], "to": ["good", "kind"],
               "cause": "prince", "characters": ["step-mother"] }],
 "file": "KEN1;STORY2 BECOME",
 "characters": [{
   "character": "step-mother",
   "actor": "(change-of step-mother in change-of-heart)",
   "changes": ["(change (personality step-mother (and evil mean)) (personality step-mother (and good kind)))"],
   "causes": ["prince"],
   "values": [
     { "element": "path-curvature", "before": "low", "after": "medium", "changed": true, "use": "director" },
     { "element": "deliberateness", "before": "high", "after": "high", "changed": false, "use": "none" },
     { "element": "attraction-towards-friends", "before": ["negative", "high"], "after": ["positive", "high"], "changed": true, "use": "none" }
   ],
   "relativeValues": [{ "choicePoint": ["relative-choice-point-of", ["cinderella", "step-mother"], "relative-path-curvature"], "value": "different-from" }],
   "choicePoints": [{ "name": ["choice-point-of", "step-mother", "path-curvature"], "currentChoice": "medium",
                      "memory": [["suggestion:", "element", "path-curvature", "value", "medium", "strength", "low",
                                  "source", ["and", ["relative-choice-point-of", ["step-mother", "cinderella"], "relative-path-curvature"],
                                             ["opposite-of", "good", "evil"], ["opposite-of", "kind", "evil"]]]] }]
 }],
 "held": [{ "choicePoint": ["choice-point-of", "prince", "deliberateness"], "heldAt": "medium", "wouldHaveChosen": "high" }],
 "recompute": {
   "differences": [
     { "choicePoint": ["choice-point-of", "prince", "deliberateness"], "characters": ["prince"], "before": "medium", "after": "high", "ofChanged": false },
     { "choicePoint": ["choice-point-of", "step-mother", "deliberateness"], "characters": ["step-mother"], "before": "high", "after": "medium", "ofChanged": true }
   ],
   "knockOns": [{ "choicePoint": ["choice-point-of", "prince", "deliberateness"], "characters": ["prince"], "before": "medium", "after": "high", "ofChanged": false }]
 }
}
```

- `characters[].values` has every element (all twelve), before (as it was: the story's pass 1, or an earlier scene's BECOME) and after (the fresh look). Values are lists or words, as `toJSON` gives them. `use` (`ELEMENT_USE` in `src/pipeline.js`) says who reads the element: `"director"` (speed and the path's curvature, length and jaggedness, `dichar.103:164-169`), `"cycles"` (rhythmic level, activity level and repetiveness: how often pass 2 repeats an activity, `place.45:411-420`), or `"none"` (acceleration and deliberateness, which Director doesn't use, as in 1978 (thesis X.B.3 (d), p. 185, L4830-4836, and (f), p. 186, L4853-4856), and the attractions, which only pass 1 reads). The plan's glass box shows `"none"` as "chosen again; Director does not use it, as in 1978".
- `characters[].choicePoints` are the fresh look's choice points of that character, absolute and relative, in the same shape as pass 1's glass box (`run.choicePoints`, `collectChoicePoints`). The "after" source of each value is there. The "before" source is in the story's pass 1, `run.choicePoints`, under the same name (for a change after an earlier change, the earlier scene's record has it). The choice points have a source of their own: they are "Ani's fresh look after Change of Heart", not pass 1's.
- `held` lists the others' choices that the fresh look held as they were, where Ani would have chosen otherwise. `recompute.differences` lists every choice the full recompute made differently from the choices as they were. `ofChanged` is true when the choice is of a changed character, including a relative choice between her and someone else. `knockOns` are the others' alone.
- A relationship change has two entries in `characters`, one for each character of `(relationship-of a b)`. The first is the one whose relationship it is.
- `characters[].notDescribed` lists the old words of her changes that her description didn't have, so the change took nothing away for them; it is usually empty. For a relationship change, it is on the first character.
- `characters[].looks` is `"kept until stage 6"` when Ani chooses the looks (APPEAR on). The fresh look rederives how she moves, not how she looks, so her looks stay as pass 1 chose them (`LOOKS_KEPT` in `src/pipeline.js`). Without APPEAR there is no `looks` key.

The glass box of each later scene, `glass.becomes` (from `change-of-heart/kind-again.glass.json`), has values printed as Lisp, as everywhere in the glass box:

```json
[{
 "actor": "(change-of step-mother in change-of-heart)",
 "character": "step-mother",
 "scene": "change-of-heart",
 "changes": ["(change (personality step-mother (and evil mean)) (personality step-mother (and good kind)))"],
 "causes": ["prince"],
 "described": [{ "type": "personality", "was": "(and evil mean)", "now": "(and good kind)" }],
 "madeSo": [{ "element": "path-curvature", "was": "low", "now": "medium" }, { "element": "attraction-towards-friends", "was": "(negative high)", "now": "(positive high)" }],
 "notDescribed": [],
 "looks": "kept until stage 6"
}]
```

`described` lists the descriptions the change changed, as `{ type, was, now }` printed as Lisp, for example `{ "type": "personality", "was": "(and evil mean)", "now": "(and good kind)" }`. They are on the character the change describes (for a relationship, the first), and pass 2's establish tasks read them. `madeSo` lists only the values the fresh look chose differently from the choices as they were. A value it left as it was, such as a `(not X)` that MEND narrows, stays as pass 2 has it. `notDescribed` and `looks` are as in the record above. Each choice point made so also memorizes `(changed-in: change-of-heart was low by (change-of step-mother in change-of-heart))`. That way the dynamics table can say a value comes from the fresh look and not from "changed for this scene". If MEND narrowed one of these values, its `(revival-repair: what narrowed ...)` note is in `glass.repairs`, as for the CP's values. A cause is `nil` when there was none.

## Who takes part in a relationship change (fixed 13 October)

A scene that establishes a relationship by conveying it and also changes a relationship stopped in pass 2: NO-SUCH-ACTOR, "RELATIONSHIP-OF is not an actor" (a model's tortoise and hare, whose last scene establishes how the hare is to the tortoise while the tortoise changes it from hates to loves). The establish task's convey tasks take its place, and SCENE orders the scene's tasks again (reorder-task-ordering, scene.9:469-470), finding who takes part in each by asking every word of its description if it is a character (participants-of-task, scene.9:513-532). The change names `(relationship-of hare tortoise)`, and your tags say CINDY defines relationship-of (an actor of two names), so the ask loads for it and stops. REVIVE;CHANGE counts the two characters of a `(relationship-of a b)` as who takes part instead; your tasks name characters only, and are found as before. `test/stories/stress/change-and-relationship.lisp` has the troll chase the goat, then establish his relationship to her while it changes from hates to loves (72 frames; his pushing shows the old one, since the change shows from the next scene on), then establish it again in Together, as loves (14 frames: he accompanies her and moves to meet her).

## Still open

- Portraying the change (stage 6). This means `bridge-to:`, `goes-to-and-transforms`, `changes-while-wandering`, and `change` and `causes` verbs. Until then, the change task is "cant-do".
- The fresh look rederives how she moves, not how she looks. "rederive the dynamics (and appearance)": the link to APPEAR is stage 6.
- Sequence-aware descriptions are deferred. Within the changing scene, every task reads the description as it was when the scene began, so the new personality is established from the next scene on.
