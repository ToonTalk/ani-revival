# Cinderella with SEEN: a part of only changes made seen

*15 October 2026, after Ken tested the live film page.* SEEN (`src/director/revive/seen.lisp`, REVIVE;SEEN; the "seen" extension in `src/pipeline.js`) is a repair of the revival's that you approved: when a feeling's part leaves its characters with nothing to do, they wander, so that the change is seen. It requires MEND (its walks and placing are MEND9's), and it is not opt-in: the page's switch is to turn it on beside MEND, KNOW, APPEAR and CHANGE (the page's `SWITCHED` list needs "seen" added). It is not in MEND because your own Cinderella reaches what it repairs (below), and MEND must leave your Cinderella byte for byte as it was; Ani as in 1978, MEND alone and CHANGE alone still do (`tools/check-1978.mjs`, plain, `--extensions mend` at 4 and 24 frames a second, and `--extensions change`).

These are the files your Cinderella makes with SEEN (with MEND), chained scene to scene as the film page makes them, at 4 frames a second here and at 24 in `24fps/`; `from-1978/` has the Meeting's pass 2 planned from where your 1978 film left the characters, the one scene whose plan SEEN changes. `node tools/check-ext.mjs --extensions seen` checks that a run still makes them (and `--fps 24`), and that no part of only changes leaves everyone still for more than a second; `--save` makes them again. `npm test` runs `test/seen.test.js`; `node tools/check-still.mjs` lists every stretch of a golden film in which no one moves, and why.

## What you saw

In your cinderella-beautified scene, put back as the page's "Cinderella beautified", the joys of Cinderella and the fairy godmother are a part of their own, `(and (establish (emotional-state cinderella (joy (positive high)))) (establish (emotional-state fairy-godmother (joy (positive medium)))))`, frames 81 to 135 at 4 frames a second (486 to 818 at 24). From frame 91 (527) to the end no one moved: about eleven seconds at 4 frames a second, twelve at 24.

Why. A feeling, in Ani, changes how a character moves: joy makes her faster and bouncier (`emote.9:11-60`). "The problem with these suggestions is that they cannot stand alone. If nothing else is happening during the subscene in which these changes are to be displayed, then Ani tries to extend the length of the previous activity ... If Ani cannot extend the previous subscene then the character in question will "wander around" so that the changes are apparent" (thesis pp. 125-126, L3377-3393). So your SCENE, planning a part in which a character has only changes, extends the part before it by this one's time (`extend-last-actions-of`, `scene.9:216-240`), and the joys' part runs beside the transformation's, from 20.27 seconds after it began, its parasite. But:

- the transformation's part was planned to cover the extra 3.47 seconds, and in Director it ends sooner: the fairy godmother reached Cinderella in one second, not the 3.5 Ani estimated, and Cinderella's wander of the transformation ended at frame 89;
- the fairy godmother had nothing to do once she reached her (frame 4): the cause stands by (CHSHOW, the revival's choice);
- and Director takes four times as long over a change at high speed as Ani's estimate of it (DICHAR's gradually change, `dichar.103:102-121`, multiplies by the speed's weight where DISPLY's estimate divides, `disply.311:1098-1111`; SLIPS' S9 corrects it, opt-in): the fairy godmother's path-curvature and path-length by 4 at high speed, planned for 3.47 seconds, take 13.86.

So the changes ran on for eleven seconds with nothing to show them: a character standing still shows no change of speed or path.

## Where no one moves in your Cinderella

`tools/check-still.mjs` (with `src/pipeline.js` `whyTheyAct`'s `stills`) finds every stretch of more than a second, inside a part, in which no character on the stage moves:

| Film | Part | Frames | Why |
|---|---|---|---|
| 1978, 4 frames a second | Introduction, part 3 (the stepmother's ten hits) | 139 to 149 (2.5 s) | the repeat unwinding: your Director runs `(repeat 10 ...)` as a `sequence:` of a run and the repeat of one fewer (`action.152:94-123`), and each run's `sequence:` runs its empty rest the next tick, so after the tenth hit the part takes ten ticks more to end, with nothing left to do (a probe of the subscene's things to do next shows them unwinding, one a tick) |
| 1978, 4 frames a second | Meeting, part 2 (the eight turns) | 79 to 86 (1.75 s) | the same, after the eighth turn |
| 1978, 24 frames a second | Meeting, part 7 (the two joys) | 900 to 1,049 (6.2 s) | a part of only changes: the joys of Cinderella and the Prince extend their walk to each other (part 6), which ends at frame 899; Director takes 6.93 seconds over the Prince's path-curvature by 2 at high speed, Ani planned 1.73 |
| the four extensions, 4 | Introduction, part 4 (the hits); Meeting, part 2 | 137 to 147; 79 to 86 | the repeats unwinding, as in 1978 |
| the four extensions, 24 | Meeting, part 7 | 887 to 1,036 (6.2 s) | the two joys, as in 1978 |

At 4 frames a second the Meeting's joys don't show as still: your Director stops the film two frames after their walk to each other ends (frame 177; 175 with the four extensions), the joys cut short (stage 6's finding 6, `reports/ext/change/README.md`: a part a joy extends tells the joy's part it has ended too, and asks Director to stop the film if nothing is running, `action.152:62-91`). At 24 frames a second the same request comes when something is planned, and the joys run to their end, with no one moving.

Over every golden film (`node tools/check-still.mjs`, 18 folders), the stretches left are your Director's repeats unwinding (14), parts of only changes in films made without SEEN (5: your Meeting's joys at 24 frames a second in 1978, with APPEAR alone and with KNOW alone; with DETAIL at 4; and Change of Heart's joy in `reports/ext/change/change-of-heart/`, a story `check-change` makes with MEND, APPEAR and CHANGE), and two where a part's activity ends before its feeling does (question 3, below); none in a film made with SEEN.

So your Cinderella reaches a feeling's part with nothing to do: the Meeting's last part. The repeats' unwinding (a tick for each run, so 2.5 seconds at 4 frames a second and under half a second at 24) is your Director's, in parts that are no feeling's; SEEN leaves it alone (a question for you, below).

## The repair

In every part in which a character has only changes, as your SCENE finds them (`plan your actions`, `scene.9:199-221`), she also wanders, SCENE's own reason for wander-around, "so that the changes are apparent", applied beyond the start of a scene where SCENE asks for it:

- **Only once nothing else moves her.** Director's plans of her part and of the part it extends that move her (her walks, turns and hits, another's walk with her, MEND9's wander-around) must each have ended. Director reads which plans those are as it runs them, from the plans your program gives each part (`(ask p cause (cinderella) to ...)`, `action.152:278-322`), since SCENE plans the part it extends again, with new names, when it extends it (`scene.9:229-239`). So she is never moved two ways at once.
- **Not beside a repeated activity.** A `(repeat n ...)` of the part SCENE extends is stretched over the extended time with the rest of its methods, so that "what went on there goes on" while she changes, and moves her until its part ends. In your Kept Apart the stepmother's and Cinderella's joys extend the standing guard, and they stand guard to the end, as in 1978: SEEN plans nothing there.
- **Only while her changes in the part are still running**, as ACTION's own record of what is still running has them (`set-up-running-actions`, `action.152:148-157`): `(ask cinderella gradually change by 1.5 factor for speed at high speed)` is taken off the list when it ends. So she stops when her feeling is done, and the part ends when it did.
- **Each walk as MEND9's wander-around walks**: across the stage and back, to the place your good-distance-from finds, the farthest of the middle and the corners (`interf.149:595-616`), careful of collisions, stopping when she is there or her changes have ended, then the same again; each walk with dynamics of its own, a child of hers in the part with a speed factor of 1.0, as your walks have (`multiply-dynamics-by-factor`, `place.45:452-461`), so that the changes, which grow the part's dynamics and hers, show in how she walks.
- **Only if she is on the stage** as the part begins: one who has left isn't brought back.
- **The film waits while she wanders.** Your Director stops the film when the part a part of only changes extends ends (finding 6, above), which cut the Meeting's joys short at 4 frames a second, and would cut her wander short; as CHSHOW keeps filming while a change is shown, the film is not stopped while a wander of SEEN's waits or walks with her changes still running. When a wander the film waited for ends, it asks Director again, as a part does when it ends.
- **Nothing else of the film moves.** The part of only changes ends when its changes do, as without SEEN: SEEN's plans are run from the part's initial actions, not among its movements, which Director waits for before the part ends (`plan everything`, `action.152:23-43`). This matters because your Director's stopping of the film hangs on the tick a part ends: where a feeling's part ends before the activity it extends, it stops the film there or not by the order its universe ticks its actors in (stage 6's findings 6 and 7, `reports/ext/change/README.md`). As first built, SEEN's plans were among the part's movements, the part ended a tick or two later, and in two stress stories with the page's set, a chase and then the goat sad (detail-rhythm, slips-variety), the chase was cut after nine frames where it had run 51 and 136; now those films are frame for frame as without SEEN.

Two plans of the part do it, as your methods' plans are: `(activity-of waiting-to-wander n)`, which begins as the part does (`(after (beginning-of ...) 0.0)`, once the part's changes are about to run) and ends once nothing else moves her (or her changes have ended), and `(activity-of wandering-while-changes-run n)`, which begins when it ends (`(after (end-of ...) 0.0)`, as your goes-to-and-accompanys begins its accompanying, `disply.311:224`) and walks while her changes run; both are run from the part's initial actions, after its own (her dynamics in the part). In the program:

```lisp
(DEFINE (SUBSCENE-OF MEETING 7) DIRECTOR-SUBSCENE ...
  (SET YOUR INITIAL-ACTIONS TO ((ASK PRINCE TO SET YOUR SPECIAL-DYNAMICS TO (SPECIAL-DYNAMICS-OF PRINCE IN (SUBSCENE-OF MEETING 7)))
                                (ASK CINDERELLA TO SET YOUR SPECIAL-DYNAMICS TO (SPECIAL-DYNAMICS-OF CINDERELLA IN (SUBSCENE-OF MEETING 7)))
                                (RUN (ACTIVITY-OF WAITING-TO-WANDER 1) THEN SEE IF EVERYBODY IS DONE)
                                (RUN (ACTIVITY-OF WANDERING-WHILE-CHANGES-RUN 1) THEN SEE IF EVERYBODY IS DONE)
                                (RUN (ACTIVITY-OF WAITING-TO-WANDER 2) THEN SEE IF EVERYBODY IS DONE)
                                (RUN (ACTIVITY-OF WANDERING-WHILE-CHANGES-RUN 2) THEN SEE IF EVERYBODY IS DONE)))
  ... (SET YOUR MOVEMENTS TO ((AND))) ...)
(DEFINE (ACTIVITY-OF WAITING-TO-WANDER 2) PLAN (SET YOUR BEGIN-TIME TO (AFTER (BEGINNING-OF (SUBSCENE-OF MEETING 7)) 0.0))
  (SET YOUR SUBSCENE TO (SUBSCENE-OF MEETING 7))
  (SET YOUR PLANS TO ((ASK (ACTIVITY-OF WAITING-TO-WANDER 2) WAIT UNTIL CINDERELLA IS MOVED BY NOTHING IN
                        ((SUBSCENE-OF MEETING 7) (SUBSCENE-OF MEETING 6)) OR (SUBSCENE-OF MEETING 7) CHANGES END))))
(DEFINE (ACTIVITY-OF WANDERING-WHILE-CHANGES-RUN 2) PLAN (SET YOUR BEGIN-TIME TO (AFTER (END-OF (ACTIVITY-OF WAITING-TO-WANDER 2)) 0.0))
  (SET YOUR SUBSCENE TO (SUBSCENE-OF MEETING 7))
  (SET YOUR PLANS TO ((ASK (ACTIVITY-OF WANDERING-WHILE-CHANGES-RUN 2) WANDER CINDERELLA WHILE CHANGES RUN IN (SUBSCENE-OF MEETING 7)))))
```

## Your Cinderella with SEEN

Pass 1 is as in 1978 (KEN;CP 30 byte for byte `reports/pass1-choices.txt`, its choice points and reasons as before, no notes). Planned from where your 1978 film left the characters, every scene's program, summary, printout and glass box is 1978's but the Meeting's (`from-1978/`): its part 7 has the four plans above, two for each of Cinderella and the Prince, its summary is as it was, and its printout and glass box list the plans and the notes.

Chained, at 4 frames a second:

| Scene | 1978 | With SEEN | Why |
|---|---|---|---|
| Introduction | 192 | 192 | as in 1978, frame for frame (no part of only changes) |
| Kept Apart | 116 | 116 | as in 1978, frame for frame: the joys extend the standing guard, a repeat, which carries the stepmother and Cinderella |
| No Longer Kept Apart | 17 | 17 | as in 1978, frame for frame |
| Meeting | 179 | 204 | Cinderella and the Prince meet at frame 177, as in 1978; then, where your Director stopped the film at 179 with their joys cut short, each waits until their walk to each other has ended (frame 177) and wanders from frame 178 while their joys run, to frame 202; the film waits for them (`film-waited-for-wander`) |
| Justice | 84 | 148 | it starts where the Meeting now leaves them: Cinderella near the middle, (0.04, 0.03), 0.4 of a screen from the Prince, where in 1978 she ended touching him, (-0.32, -0.32). Ani plans the scene as in 1978 (its program from 1978's places is 1978's); their comings in contact and movings apart (repeatedly-come-in-contact) take longer from there, the last walk to contact frames 90 to 145 where it was 56 to 81 |

At 24 frames a second (`24fps/`):

| Scene | 1978 | With SEEN | Why |
|---|---|---|---|
| Introduction | 917 | 917 | as in 1978, frame for frame |
| Kept Apart | 701 | 701 | as in 1978, frame for frame |
| No Longer Kept Apart | 113 | 113 | as in 1978, frame for frame |
| Meeting | 1,051 | 1,051 | as long as in 1978: their walk to each other ends at frame 899, as in 1978, and where in 1978 no one moved from 900 to 1,049 while their joys ran, each now wanders from 899 until their joys end, at 1,049 (the film's `film-waited-for-wander` at frame 900) |
| Justice | 458 | 970 | it starts where the Meeting now leaves them: Cinderella near the middle, (0.04, 0.03), the Prince at (-0.27, -0.27), where in 1978 they ended touching. Ani plans the scene as in 1978 (its program from 1978's places is 1978's: 30.48 seconds, the comings together repeated four times); Director, starting them from those places, takes about twice as long over each of their comings together and movings apart (in the first moving apart, frames 91 to 151, where 1978's took 62 to 89, the Prince stands for 37 of the 60 frames, his walk careful of collisions, with the stepmother's move near the group passing close by them in the middle) |

## With the page's set

With the four extensions the page's switch turns on and SEEN, your Cinderella films in 222, 116, 19, 200 and 128 frames at 4 frames a second (222, 116, 19, 175 and 92 with the four): the Introduction, Kept Apart and No Longer Kept Apart frame for frame as with the four; the Meeting's joys, as above (from frame 174, their walk to each other having ended at 173, to frame 198; 200 frames where your Director stopped the four's at 175); Justice from where the Meeting now leaves them, as above. At 24 frames a second, 1,273, 701, 112, 1,038 and 967 frames (1,273, 701, 112, 1,038 and 418 with the four): the first four scenes as long as with the four, and the first three frame for frame; in the Meeting Cinderella and the Prince wander from frame 886, when their walk to each other ends, to 1,036, where with the four no one moved from 887 to 1,036 while their joys ran; Justice from where the Meeting now leaves them. In none of these films does anyone stand still for more than a second in a part of only changes (`tools/check-still.mjs`), and every walk of the revival's ends with its characters on the picture.

Your cinderella-beautified, with the page's set and SEEN (`reports/ext/change/beautified-film/`, `tools/check-change.mjs`): see `reports/ext/change/README.md`, "Ken's testing (15 October)".

## The glass box

- Each part where SEEN planned a wander notes it, once for each character: `(revival-repair: what nothing-to-do was (stands-still cinderella) now (wander-while-changes-run cinderella) because (so that the changes are apparent thesis 126))`; the film notes the plan it waited for: `(revival-repair: what film-waited-for-wander was stopped now kept-filming because (a wander at frame 178))`. Both are in the glass box's and the film's `repairs`.
- Each wandering plan memorizes `(wanders: character cinderella while (changes-for cinderella) in (subscene-of meeting 7) after (activity-of waiting-to-wander 2) once-nothing-moves-her-in ((subscene-of meeting 7) (subscene-of meeting 6)) because (so that the changes are apparent thesis 126))`, and the glass box has `wanders`, `[{ character, plan, waiting, subscene, watched, because }]`, only when SEEN planned any (so a 1978 glass box is as it was).
- `whyTheyAct` (`reports/ext/change/README.md`, "For the page: why they act as they do") gives the two plans' activities with `by: "REVIVE;SEEN"`, the method `(wander-while-changes-run cinderella)`, no task (SCENE plans them for a part of only changes), their stops (`when-nothing-else-moves-her`, `when-changes-ended`), and how each ended (`"free"` or `"changes-ended"`); the waiting plan's `watched` parts and `waitsFor`, the plans of theirs that move her (the Meeting's `(activity-of moving-towards-each-other 8)` for Cinderella).

## For the page

- Add "seen" to the switch (`SWITCHED` in `app/film.template.html`), rebuild the bundle (`node tools/build-ani-bundle.mjs --extensions mend,know,appear,change,seen`): with the switch on, your Cinderella then films in 222, 116, 19, 200 and 128 frames at 4 a second and 1,273, 701, 112, 1,038 and 967 at 24 (`tools/check-film-app.mjs` expects 222, 116, 19, 175 and 92), and the beautified preset in 171, 116, 137, 18, 190 and 155 (at 24, 950, 701, 820, 76, 1,052 and 942).
- The activities: `waiting-to-wander` ("Cinderella waits until nothing else moves her", or nothing: no one is seen to do anything), and `wandering-while-changes-run` ("Cinderella wanders about while her joy changes how she moves, so that the change is seen (the revival's repair)"). Their characters are in their Lisp, `(ask <plan> wander cinderella while ...)`, not in a `cause (...)`; `glass.wanders` and `whyTheyAct` have them.
- The extensions panel's text is the registry's `note`.

## Questions for you

1. **SEEN is turned on with the four.** Your decision 3 has the switch turn on MEND, KNOW, APPEAR and CHANGE; SEEN is a fifth, a repair, not opt-in. Say if it should be opt-in instead.
2. **They wander apart after they meet.** At the end of the Meeting, Cinderella and the Prince each wander to the farthest of the middle and the corners from where they are, so the couple who have just met move apart while their joy shows, and Justice starts with them apart (148 frames, not 84). They could wander together instead (one leads, the other goes with her, as your goes-to-and-accompanys accompanies), or only one of them could wander. Recommended: say which you would like; as built, each wanders on its own, as SCENE's wander-around does.
3. **A feeling beside an activity.** SEEN applies only where a character has nothing but changes in a part, as SCENE's wander-around does. Where a part has an activity and a feeling, and the feeling outlasts the activity (Director's four times at high speed), the character stands while it runs: Kind Again's first part in the change-of-heart story, Cinderella still from frame 22 to 27 (1.25 seconds), her joy running on after the stepmother's accompanying her ends. Should she wander then too?
4. **The repeats' unwinding.** After a part's last repetition your Director takes a tick a repetition to unwind (2.5 seconds at 4 frames a second after the stepmother's ten hits, 1.75 after the eight turns). It is your Director's, and the film page could say so; or a SLIPS correction could end the part when the last repetition does. Recommended: say it on the page, and leave it.
5. **Or SLIPS' S9.** With SLIPS on, Director runs each change at the speed Ani planned, and most of these stretches shrink to nothing; SEEN is for the page's set, where SLIPS is off.
