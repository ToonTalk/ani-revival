# Ani responds to criticism of its films (thesis Chapter X.D, "Critics and Criticism"), as the switchable REVIVE;CRITIC extension

*Written by a design agent on 16 October 2026, for Ken's question "how hard would it be to add the ability for Ani to respond to user criticism of films?", and his answer "yes start with the design". Ken then said "go ahead with the plan", so each stage below is written so that it can go to a builder: its files, the functions of Ken's it wraps (file.version:line), its tests and goldens, its page changes and the checks to run. Like the earlier designs, this one should be reviewed adversarially before it is built. Every number below that is called "probed" was measured on 16 October with scratch Lisp (not in the repo) wrapping Ken's functions in the real pipeline; see "What the probes found".*

## Summary

Ken's Section D (AI-TR-540 pp. 189–191) lists five kinds of criticism and an "obvious response" to each. Ani's own code already has the places for those responses:
- CHOMET chooses among alternatives;
- CHOOSE has an empty stub, `try-to-resolve-using-criticism` (choose.198:587-589, "nil ;;for now"), which Ken's conflict resolution already calls before strengths and previous choices (choose.198:327);
- `record-choice` carries the comment "at some point this should check for criticism before accepting choice" (choose.198:597);
- SCENE keeps a copy of each subscene "incase I have to be redone" (scene.9:160);
- tasks can `unchoose values` (scene.9:318-330);
- each activity records where it leaves its participants (`record-distance-estimates`, interf.149:778, written by every DISPLY method).

The design adds one switchable file, REVIVE;CRITIC, plus pipeline and page plumbing. The criticism lives in a record kept with the film, separate from the film description, as in Ken's footnote: "a record of user criticism". In each pass-1 and pass-2 job, CRITIC's wrappers consult that record at the moments Ken named. A film with no criticism never loads CRITIC, and with CRITIC loaded and an empty record every wrapper passes straight through (check-1978 byte-identical).

The kinds, from easiest to hardest:
1. **Too quick or too slow:** the part's display methods are stretched or shrunk within the time its task was given.
2. **Not this way, another way:** a veto of a way of showing (CHOMET drops it and chooses among what is left), at either level, how something is shown (display method) or what is shown (convey method).
3. **Keep these two apart in this scene:** Ken's post-condition, added as a prerequisite to every method of the scene; with "start far from", Ken's own remedy for No Longer Kept Apart.
4. **As if this distance (or time) were known:** the subscene's own record, set from outside.
5. **Self-criticism:** after filming, Ani compares its estimates with what Director measured and makes kind 4 criticisms of itself.

Beyond Section D, and labeled the revival's extension of Ken's idea, the user can also criticize a pass-1 choice ("the Prince moves too fast"). That criticism is a new suggestion source which COSUG combines like any other, and conflicts it is in are resolved by filling Ken's stub.

A remake replans every scene from the criticized one on, since scenes chain. Earlier scenes are kept as they were. A later scene whose replanned program is byte-identical to the old one keeps its old film (Director's film is a function of the program alone), which is how Ken's "most of the changes could be made locally" shows up at the film's scale. The probes found this happens in Ken's Cinderella: Kept Apart starts with a cut, so criticizing the Introduction leaves Kept Apart through Justice exactly as they were.

On the page:
- buttons in the character panel, the timeline and each choice point;
- a "Your criticism" list;
- "Remake with my criticism", after which the old and new films are shown side by side;
- a plain-English box where a language model turns words into criticism under a strict schema whose enums are this film's own scenes, tasks, ways and choice points, refusing (with p. 191) what Ani has no conception of.

The stages come to about 21 working days.

## The design

### 1. What Ken wrote

**Section D, pp. 189–191** (AI-TR-540, sources/text/AITR-540.txt L4945-5016).
- The method Ken used to improve Ani, finding faulty reasoning and changing the program, "is a good one for constructing Ani but is not a reasonable method for a user trying to control Ani's decisions. Instead Ani should be extended to accept criticism of the films and their justification. For many types of criticism there is an obvious response."
- (1) "If one says that a particular activity in a subscene was poorly chosen then Ani could redo that subscene selecting any reasonable alternatives to that activity." Footnote: "This could easily be implemented by having Ani check a record of user criticism whenever faced with several alternatives and removing those alternatives that were vetoed by the user." Second footnote: "Notice that most of the changes could be made locally since Ani knows what other parts depend upon the part being changed and could decide if the change should propagate to other parts."
- (2) "If one says that a section of the film happened too slowly or quickly then the display methods involved could be asked to replan the activities involved shrunk or stretched respectively."
- (3) "If one says that during a particular scene two characters should not get very close to each other (as one might be tempted to say about Cinderella and the Prince in the first scene) then this post-condition could be added to all the methods in that scene and it could be remade."
- (4) "If one looks at Ani's reasoning for a subscene and sees that Ani failed to make a cut because an estimate of the distance between two characters was not accurate enough, then one could ask Ani to remake the subscene as if the distance were known to be some particular value."
- (5) Self-criticism: a prediction of distance "way off" when the film is run, or a subscene's estimated length "way off": "the section could be remade with an accurate estimate. This ability would have improved somewhat the fourth subscene, where too many things happen too quickly and part of the problem was that Ani's estimates for the running time were too large." Also internal: a choice "that leads to various problems (such as failure to meet the prerequisites of any the suggestions available ...)" could be remade, which "would depend upon an ability to remake only those sections involved (rather than remaking the film from scratch) which in turn depends upon Ani keeping good records of why decisions were made the way they were and what else they depended upon."
- The limits, p. 191: "Ani currently has practically no conception of rhythm, for example, and so could not respond to criticisms of the film's rhythm. The same holds for notions such as climax, tension, mood, or humor. Any aspect of Ani that is built-in (as opposed to explicitly taken into account) or lacking entirely cannot be criticized with any effect."
- Just before Section D, p. 189, the footnote on cheating: "Other changes would constitute cheating in that I would be arranging for Ani to do what I want without improving the reasoning. For example, if Ani chose poorly between three choices I could have (but did not) fix things so that the option no longer existed or looked undesirable." The legitimate changes are "to add obvious information that was lacking or was too inaccurate" and "to take factors into consideration that obviously should have been but weren't".

**The places that point to Section D.**
- **No Longer Kept Apart, p. 69** (L1956-1962): "This scene is a bit confusing to watch --- things happen too quickly and the fairy godmother just appears and is quickly gone. User criticism could easily be applied to allocate more time for this scene or to have the fairy godmother start far from Cinderella." (The request placed this on p. 192. It is on p. 69 of AI-TR-540, the Cinderella chapter.)
- **The meeting footnote, p. 64** (L1839-1844), on the Introduction's subscene (d), where "To establish Cinderella's personality as friendly she goes over to the Prince and accompanies him across the screen." It reads: "If Ani were extended as described in Section D ... then this would be an ideal test case. ... we could criticize Ani's choices for this subscene. [We] could say that Cinderella is not to meet the Prince until the third scene and Ani would redo this subscene (and unless necessary no other parts of the film) picking something else to establish Cinderella's personality." (This is the Introduction's footnote about Cinderella meeting the Prince, not one in the Meeting scene.)
- **Conflict resolution, p. 109** (L2974): "If this fails, Ani calls some never finished procedures. If they had been completed they would have tried to resolve the conflict by using criticism (either from the user or self generated)." These are `try-to-resolve-using-criticism` and `try-to-resolve-using-previous-choices` (choose.198:587-593).
- **How Ani Evolves, pp. 188–189**: activities were extended "so that activities could record the relative positions of its participants after they run ... It was easy then to add to the previous activity, 'accompanies each other', the fact that it left its participants very close to each other." That is `record-distance-estimates` (interf.149:778) and its `(screen-fraction .05)` in goes-to-and-accompanys (disply.311:231).
- **Lack of Perception, p. 228** (L5943-5962): critics evaluating Ani's symbolic structures, so that "when finally running the film Ani easily could be modified to detect that a character unexpectedly moved too close to the side of the screen or that a section of the film took too much or too little time"; "The simplest solution to Ani's lack of feedback is to rely on a human observer to give perceptual criticisms."
- **Everyone Sees Differently, p. 235** (L6140-6150): global descriptors "combined with the ability to respond to criticism would provide a mechanism for making films tailored to the particular user".
- **Making Ani Smarter, p. 197**: "If Ani could take criticism into account, maybe even self-generate some, the films would be better."

### 2. What the revival already records and can rerun (read from the code)

- **Each scene's glass box** (src/pipeline.js `glassBox`, :414-490) holds every task's variables:
  - `scores` (CHOMET's six, percentiles, chomet.123:257-303);
  - `rejected-suggestions`, each with its reason (`prerequisites-not-met`, `too-much-time:`, `need-more-time:`);
  - `current-choice`, `allocated-time`, `running-time`, `share`.
  
  Each subscene's glass box holds `stretched-by`, `(location-of c)` with its `why` and `status`, `(distance-between ...)`, `(time-estimates-for m)` and `movements`. Each plan's holds `begin-time`.
- **`whyTheyAct`** (src/pipeline.js:1023-1198) gives the page, per activity, the method, the task, Ani's estimate `{ideal, least, most}`, the stops and Director's measured seconds; per part, the running time, stretch and extensions; and the still stretches.
- **The page** builds on these (inventory by a survey agent, line numbers in app/film.template.html):
  - "Why this way" is `wayWhy` (T:4792), "Why so long" `longWords`/`plannedWords` (T:4842-4869), and "How Ani timed it" `timingSteps` (T:4812). The activity box is `actWhyBox` (T:4918), "How Ani chose this" `methodsBox` (T:4606), and the chain of tasks `chainOfTask` (T:4633).
  - The timeline is `timelineBox` (T:4942-4990), with each row a button `data-tl`.
  - Pass 1's choice points open in `choicePointBox` (T:4574-4595), whose sources are worded by `sourceText` (T:4550-4571) and whose set-aside suggestions by `rejectText` (T:1144-1154).
  - "Your films" (app/film/library.js) and any two side by side are `setPair` (T:4040), `comparePanel` (T:6496) and `pairPanel` (T:6583).
  - The JSON drafting path is `storySchema` (app/film/json.js:56), `schemaFor` per provider (json.js:94-108), `CALLS` (app/film/llm.js:331-444) and `showDraft` with "Ask X to fix these" (llm.js:611-653).
  - Nothing on the page criticizes or partly remakes a film today. The only remake is "Make it again with the revival's repairs" (`remakeWithRepairs`, T:2346), which makes the whole film again.
- **makeFilmSteps** (src/pipeline.js:1684-1757) runs pass 1, then each scene's pass 2 and filming. Each scene's pass 2 loads the POSIT file the last scene's filming wrote (run.65:52-53), and NLKA loads KEPT MINI (run.65:45-46). `scenes` limits which scenes are made, but every scene before them is made too. The page passes no `scenes` and keeps no intermediate files: the worker builds a fresh file system from the bundle on every run.
- **Director's film is a function of the scene's program**: `film()` boots a fresh Lisp, loads ANINIT and runs `(start scene)` on KEN;<program> (src/pipeline.js:895-931), and nothing else of pass 2's is read. Two byte-identical programs film identically (probed: Kept Apart, see §10).
- **CHANGE's fresh look** (REVIVE;CHANGE `hold-everyone-but`, `held-value-of` and `record-choice-holding-the-others`, change.lisp:417-471) replays pass 1 in Ken's order and holds every choice point it isn't freeing at the value KEN;CP has, by wrapping `record-choice` (choose.198:596). With nothing freed it gives CP 29 exactly. A full recompute is kept beside it for the glass box.
- **REVIVE;WRAP** (wrap.lisp): `revival-wrap` wraps a defun once per job, with wrappers of one function going round each other in registry order. `revival-once` handles what isn't a defun. `revival-note` leaves `(revival-repair: ...)` items, which check-1978 forbids in a 1978 run. CRITIC uses its own item, `(heeded-criticism: ...)`, so that a heeded criticism is never mistaken for a repair.

### 3. The criticism record

**Recommendation: a new extension, REVIVE;CRITIC, loaded on demand.** It is loaded only into the jobs of a film that carries criticism, beside whatever extensions that film was made with (none, for a criticized "Ani as in 1978" film). It is not one of the switch's set, since without criticism it does nothing. The "Which extensions" panel lists it, ticked and greyed, on a film that has criticism: "Your criticism (CRITIC)". Its registry entry:

```js
{ id: "critic", label: "Your criticism", group: "criticism", files: ["wrap", "hold", "critic", "critpc", "critsc", "critpl", "critsf"],
  requires: ["mend"], changes1978: false, onDemand: true,
  note: "Ani heeds a record of your criticism of a film (thesis pp. 189-191) ..." }
```

- **Why it requires MEND.** "Start far from" needs MEND19's `large-distance-and-offstage` (PLACE asks for it and Ken never defined it). The probe stopped with NO-SUCH-ACTOR without MEND. MEND is byte-identical on Ken's Cinderella.
- **Why HOLD is a new shared file.** Holding pass-1 choices is CHANGE's code (change.lisp:417-471). Rather than have CRITIC require CHANGE, the three functions move unchanged into REVIVE;HOLD, which CHANGE and CRITIC both list. HOLD gains one function, `hold-all-but-choice-points`, beside `hold-everyone-but`. check-change's goldens must not move.
- **group "criticism"** is a third group in `EXT_GROUPS` (T:1384). `onDemand` is new to the registry: such an extension is added by the pipeline when a run has criticism, never by the switch.

**Its form: a record kept with the film, not in the film description.** Ken separates the two. The film description is what the film is to convey (Chapter III), and the criticism is about how Ani made it ("criticism of the films and their justification"). His footnote calls it "a record of user criticism". Writing "keep Cinderella and the Prince apart" into CINDY would turn a judgment of Ani's choices into a task Ani would try to convey.

The record is a list of JSON items kept on the run (`run.criticism`), which the pipeline writes, before each job, as the Lisp file KEN1;FILM CRITIC, one form per item:

```lisp
(criticism: id c1 kind another-way scene no-longer-kept-apart
            task (undoes fairy-godmother (from-scene kept-apart (convey (prevents step-mother (meets cinderella prince)))))
            level display vetoes goes-to-and-accompanys
            by you said "Not this way: another way")
(criticism: id c2 kind pace scene no-longer-kept-apart
            tasks ((undoes fairy-godmother ...)) direction quicker factor 1.5 by you said "Too quick")
(criticism: id c3 kind keep-apart scenes (introduction kept-apart) between (cinderella prince)
            by you said "Cinderella is not to meet the Prince until the third scene")
(criticism: id c4 kind start-far scene no-longer-kept-apart who fairy-godmother from cinderella by you said "...")
(criticism: id c5 kind as-if-distance scene meeting tasks (...) between (cinderella prince) distance large by you said "...")
(criticism: id c6 kind as-if-time scene no-longer-kept-apart tasks (...) method goes-to-and-accompanys seconds 6.25 by ani said nil)
(criticism: id c7 kind choice choice-point (choice-point-of prince speed) value (less-than high) by you said "The Prince moves too fast")
```

- **What identifies what.** A task is named by its description, the `description` of its `(task: ...)` variable, which is stable across remakes. Its actor name (convey-task-3) is a counter, and a subscene's number moves when a task before it changes. A part is named by its tasks. A choice point is named by its own name. A method is named by its first word, because Ken's footnote vetoes "alternatives", not argument lists (Q2).
- **The record accumulates.** A remake of a remake carries every earlier criticism. A criticism can be withdrawn on the page, which makes the film again without it.
- **Ani's own criticism** (kind 5) is in the same record with `by ani`, so the glass box can say "Ani criticized itself".
- **Kept with the film.** `filmData` gains `criticism` and `remadeFrom` (the `print` of the film criticized), and `files`, the text of each intermediate file the remake reads: KEN;CP, each scene's program, MINI, PRINT and POSIT, and BECOME with CHANGE. That is 20–60 KB, which also makes a stored film remakeable from any scene. A film with criticism is film-file version 3 (save.js `runVersion`). Older pages refuse it with their own "made by a newer page" message (save.js:263) rather than silently dropping the criticism. Versions 1 and 2 are written exactly as now.

**Where each job reads it.** `boot()` gets a `criticism` option. When there are items, it writes KEN1;FILM CRITIC to the file system and evaluates `(load-criticism '((ken1) film critic))` after the extensions load. REVIVE;CRITIC defines `load-criticism`, which sets `:critic-record`. Each wrapper reads `:critic-record` and does nothing when it is nil.

### 4. The responses, in order of difficulty

For each: what Ken wrote, what the revival does, the exact Lisp it wraps, and which choices are the revival's.

#### 4.1 Too quick, too slow (kind 2), REVIVE;CRITPC

- **Ken:** "the display methods involved could be asked to replan the activities involved shrunk or stretched respectively."
- **Ken's machinery.**
  - A task's running time is `ideal-time-for-task` (chomet.123:95-116): the task's methods' largest ideal estimate, then `pick-time-within` the task's allocated time (chomet.123:131-139).
  - SCENE then stretches the subscene by allocated over ideal, `stretched-by` (scene.9:159-183, `(//$ allocated-time ideal-time)`), and every display method's run receiver is passed `stretched by ,factor` and slows its characters by it (e.g. goes-to-and-accompanys' `divide-speed-by-factor`, disply.311:186-190).
- **The revival.** Wrap `ideal-time-for-task` (chomet.123:95). For a task of a criticized part not run in parallel, the time is `(pick-time-within allocated (*$ ideal factor))`: 1.5 for "too quick", 1/1.5 for "too slow". The wrapper memorizes `(heeded-criticism: id c2 was 3.98 now 5.97 because (pace quicker))` on the task. SCENE's own stretch then does the rest. Criticizing a part again compounds the factor, which the record keeps as the product.
- **The revival's choices:**
  - the factor of 1.5 (Q3);
  - that the bound is the task's allocated time, its share of the scene's length from the film description, so that a criticism never overrides the description;
  - that a part's time can't be stretched past SCENE's own warning at 8 or shrunk past 1/8 (scene.9:166-169).
- **Probed (No Longer Kept Apart, "too quick", 4 frames a second):** task time 3.98 → 5.97, `stretched-by` 1.5, the scene 17 → 30 frames. The Meeting and Justice then come out at 183 and 90 frames (1978's 179 and 84), since neither starts with a cut.
- **Found:** the scene is too quick largely because of time allocation. Its length is short, so its bounds are 10–25 s (`length-bounds` (10.0 25.0)). goes-to-and-accompanys' estimate (most 6.95 s) did not fit, so Ken's approve-or-remake used `resurect-bad-time-fits` (chomet.123:187) to move the task's allocated time down by 6.08 s to (3.92 18.92). The task then took its ideal, 3.98 s, well under the scene's own minimum. This is the CHOMET redistribution whose signs PLAN.md's stage-7 question 2 left for Ken. A "too quick" criticism addresses it from the user's side. Correcting the signs might address it from Ken's.
- **When it can't be met:** at the allocated bound, Ani says "This part already takes all the time your story gives the scene (short: 10 to 25 seconds)." It offers "Make the scene longer in the story" (`length` short → medium), a change to the description, the user's to make, through the editor.

#### 4.2 Not this way: another way (kind 1), REVIVE;CRITIC

- **Ken:** "redo that subscene selecting any reasonable alternatives", by "removing those alternatives that were vetoed by the user".
- **Two levels, both CHOMET's.**
  - **How it is shown (display level).** `choose-methods-for-task` (chomet.123:200-203) takes the task's display suggestions from `get-display-method-suggestions` (chomet.123:205). The revival wraps that function. A suggestion whose method's first word is vetoed for this task is rejected through Ken's own `reject-suggestion` (chomet.123:305-310) with the reason `(vetoed-by-you c1)`, so it lands in `rejected-suggestions` beside Ken's reasons. CHOMET then scores what is left as ever.
  - **What is shown (convey level).** An establish task chooses "a few" convey methods from `get-convey-method-suggestions` (chomet.123:213), in `choose-a-few-convey-methods` (chomet.123:474). Ken's footnote example is here: friendly is established by `(accompanys cinderella prince)` and `(helps cinderella prince)`. The revival wraps `get-convey-method-suggestions` the same way. A related suggestion that is vetoed is added to the task's `rejected-suggestions` (which `reject-suggestion` can't do, since a related suggestion isn't memorized as a suggestion). CHOMET eliminates among the rest as ever.
- **When nothing is left.** Ken's own path takes over:
  - `choose-a-display-method` returns `(no-feasible-suggestions-among ...)`;
  - `approve-or-remake-tasks-choices` (chomet.123:9-36) resurrects the rejected suggestion whose time fits best (`resurect-bad-time-fits`, chomet.123:187);
  - it redistributes time and `unchoose`s and `choose`s again (chomet.123:51-56);
  - failing that, the task is `cant-do` with Ken's warning.
  
  The wrappers run again on every re-choice, since `unchoose values` (scene.9:318) memorizes the rejects back, so a veto stays vetoed.
- **Probed (No Longer Kept Apart, veto goes-to-and-accompanys):**
  - chases-to, the one Ken's run had set aside as `too-much-time:`, comes back through `resurect-bad-time-fits`;
  - the allocated time moves to (1.12 16.12) and the godmother chases the stepmother off;
  - 23 frames (17 in 1978), with stands-guard still set aside, `prerequisites-not-met ((faster fairy-godmother step-mother))`;
  - `rejected-suggestions` carries `(rejected-suggestion: reason (vetoed-by-you ...) ...)`;
  - the Meeting and Justice then come out at 178 and 100 frames.
- **When nothing at all is left** (the task becomes `cant-do`), the glass box says so: "Ani has no other way to show this with what it knows" (see §7).
- **The revival's choices:**
  - a veto names the method's first word, not the exact form;
  - a veto is scoped to the task it was given in, not the scene or the film (Q2);
  - Ken's footnote says "any reasonable alternative", and CHOMET's scoring is the judge of reasonable, so nothing further is added.

#### 4.3 Keep these two apart (kind 3), and start far from (Ken's No Longer Kept Apart remedy), REVIVE;CRITSC

**Keep apart.**
- **Ken:** "this post-condition could be added to all the methods in that scene and it could be remade."
- **What "brings them together" means, read from Ken's code, not invented.** A display method brings A and B together when its run receiver walks one to `(contact-with B by A)` or walks them together (`move-characters ... A ... B`). In DISPLY these are:
  - move-to-and-hits (disply.311:121, 138);
  - goes-to-and-accompanys (206, 214);
  - pushes-around (279, 289, 345);
  - move-to-each-other (661, 671);
  - repeatedly-come-in-contact (795, 804).
  
  Not chases-to, stands-guard, move-small-part-towards, alternately-turn, move-near-and-turn, chases-off or exit-by. The revival's own ways (MEND's move-to, KNOW's helps-along, follows-behind and moves-away-from, CHSHOW's goes-to-and-transforms) are read the same way. A new tool, `tools/critic-contacts.mjs`, reads every display method's run receiver in DISPLY and REVIVE and writes the table into REVIVE;CRITSC with each line cited. The unit test fails if the table and the files disagree, so a new method can't silently escape the post-condition.
- **A convey method brings them together** when every display method its verb is shown by (CONVEY's suggestions for it) does. For accompanys, helps, hurts, pushes, meets and gets-it-on, every way of showing in 1978 does. The tool derives this too.
- **How it is checked: as a prerequisite, Ken's own way of ruling a method out.**
  - The display-level wrapper of §4.2 adds to each suggestion's `prerequisites` the form `(kept-apart A B by c3)`. Its status, `met` or `not-met`, is memorized on the actor `kept-apart` from the table before scoring, so `prerequisite-score` (chomet.123:363-375) rejects the method with Ken's own reason, `prerequisites-not-met ((kept-apart cinderella prince by c3))`.
  - At the convey level the related suggestion is dropped. (CHOMET's `pass-prerequisite-test` reads `'prerequisite`, SLIPS' S6, so adding a prerequisite there wouldn't be seen without SLIPS.)
- **After the scene is planned, the plan is checked.** For every subscene of the scene, CRITSC reads each character's `(actions-of c)` for a walk to contact with the other, or a walk with the other. A violation means the table missed a way, and is a test failure, not a silent pass.
- **After filming, Director's frames are checked** (stage C5): the least distance between the two while both are on the picture, against Ken's small distance (`small-distance?`, under .33 of the screen, place.45:103-105). The glass box reports the closest they came.
- **Probed (Ken's meeting footnote: keep Cinderella and the Prince apart in the Introduction and Kept Apart):**
  - With Ken's knowledge alone, establish-task-1 (Cinderella's personality) has only the two convey suggestions friendly makes, accompanying and helping the Prince. Both go, the task is `cant-do`, the Introduction's last two subscenes disappear, and the scene is 111 frames (192). The Prince is never placed in it.
  - Kept Apart, No Longer Kept Apart, the Meeting and Justice then plan to byte-identical programs and film to identical frames and POSIT files. Kept Apart begins with a cut that places everyone afresh, its first subscene's `transition-type` `cut`, its locations `placed by` the subscene. So "unless necessary no other parts of the film" holds exactly, and the remake need film only the Introduction.
  - With KNOW and SLIPS, Ani does pick "something else to establish Cinderella's personality": she **helps her stepmother** (`helps-along cinderella step-mother`, SLIPS' S1 letting good's helping find anyone, with KNOW's way of showing it) and follows her (KNOW's follows-behind), and the Prince is never on stage.
  
  This is the end-to-end test of Ken's footnote, in both forms.

**Start far from.**
- **Ken:** "to have the fairy godmother start far from Cinderella".
- **The cause.** In 1978 the fairy godmother was never on stage in Kept Apart. Her location in No Longer Kept Apart is the one KA POSIT gives her, (0, 0) "ended up here in kept-apart", status cool, and Cinderella is at (0.018, -0.024), next to it. So `initial-locations-for-two-characters` (place.45:116-150) finds both located and leaves them, and she appears beside Cinderella.
- **The response.** Wrap `place-medium-distance-apart` (place.45:9). It is used by goes-to-and-accompanys, move-to-and-hits, repeatedly-come-in-contact and others to place their two characters. In the scene's first part where the criticized pair is placed, the wrapper:
  - forgets `who`'s inherited `(location-of who)` in that subscene;
  - calls Ken's `place-large-distance-apart` (place.45:25), whose `(large-distance-and-offstage ...)` for the unlocated one MEND19 defines;
  - memorizes the heeded-criticism item.
- **Probed:** she is placed `(good-distance-from-and-offstage (vicinity-of cinderella))` "so that (goes-to-and-accompanies ...)", walks on for 2 s (0 in 1978), and the scene is 25 frames.
- **With "too quick" too**, Ken's two remedies together, it is 38 frames (9.5 s), still under the scene's 10 s minimum: Ken's own suggestion, applied literally, still leaves it a little quick.
- **Found:** Ani's estimate didn't move (3.98 s). goes-to-and-accompanys estimates only the walk to the destination (disply.311:171-184), not the friend's walk on, so Director ran the part 6.25 s against a plan of 3.98. That is exactly the self-criticism case (§4.5).

#### 4.4 As if a distance were known (kind 4), REVIVE;CRITPL

- **Ken:** "remake the subscene as if the distance were known to be some particular value."
- **Ken's machinery.** Every distance PLACE uses goes through `distance-between` (interf.149:713-751), which first asks the subscene for its own record `(distance-between p1 p2)` (interf.149:722-723). The cut decision `cut-if-distance-known-to-be` (place.45:82-94) reads it through `screen-fraction-between` (interf.149:704). Ken's small and large distances are under .33 and over .67 of the screen (place.45:103-113).
- **The revival.** Wrap `distance-between`. In the criticized scene's tasks' subscenes, for the criticized pair in either order, it returns `(screen-fraction v)` with v 0.15, 0.5 or 0.85 for small, medium or large (inside Ken's three bands), and memorizes the heeded item. That reaches the time estimates (`time-to-walk-1`, place.45:546-559) and the cut, so a "they are far apart here" criticism can produce the cut Ken describes.
- **As if a time were known** (used by self-criticism). Wrap `get-estimated-time-of` (chomet.123:448), which CHOMET's scoring uses, and `ideal-time-for-task` (chomet.123:95), already wrapped for pace, so that the criticized method in the criticized task is estimated at the measured seconds: ideal = measured, least and most scaled as Ken's `estimate-time-to-move-character-1` scales them (×0.4, ×2.5, place.45:536-538).
- **The revival's choices:** the three representative values (Q5); offering this on the page only from a part whose glass box shows a distance record or a cut decision (the "Ani's own records" section), since a user rarely knows a distance; its main use is self-criticism.

#### 4.5 Self-criticism (kind 5), REVIVE;CRITPL plus `src/pipeline.js` `selfCriticism(glass, film)`

- **Ken:** a prediction or estimate found "way off" when the film is run, then "the section could be remade with an accurate estimate".
- **The revival.** After a scene is filmed, `selfCriticism` compares:
  - **times:** each activity's planned ideal (whyTheyAct's `estimate.ideal`) and each part's `runningTime` against Director's measured seconds (whyTheyAct's `film.seconds` and the part's film span);
  - **distances:** each `(distance-between (vicinity-of a) (vicinity-of b))` a subscene recorded for the next (`record-distance-estimates`) against the distance between the two in the frame where the next part begins, from `frames[].chars`, classed by Ken's small/medium/large.
- **The threshold for "way off":** a factor of 2 in time, or a different class of distance. It is the revival's (Q6).
- Each finding becomes an `as-if-time` or `as-if-distance` item `by ani`, and the film is remade from the first scene with a finding.
- **At most two rounds.** A round that brings no measured estimate closer stops, with "Ani tried and could not get closer" in the glass box. This can oscillate, since remaking changes what is measured, and the cap is the guard.
- **On the page it is opt-in:** "Let Ani criticize itself", in the part's "How Ani timed it". Unbidden remakes would surprise. With SLIPS off, Director runs a change at high speed four times longer than planned (S9, confirmed), so self-criticism would mostly chase that slip. The page says so and recommends SLIPS on (Q7).
- **Ken's fourth subscene.** The thesis doesn't say which scene's fourth subscene is meant. The Meeting's (d), a short part with a cut where Cinderella moves to the Prince, is the likeliest. The test asks self-criticism to find it rather than assuming it.
- **Internal self-criticism** (a choice whose consequences fail, such as a task left `cant-do` when an earlier choice could have been different) is left out of this design. It needs pass 2 to backtrack across tasks, which Ken describes as depending on records "of why decisions were made ... and what else they depended upon". The records exist (location `why`, `tasks-used-in`, `previous-choices`), but the search is a project of its own (Q9).

#### 4.6 The revival's extension: criticizing a pass-1 choice ("the Prince moves too fast"), REVIVE;CRITIC

This is not in Section D. Section D criticizes "the films and their justification", and pass 1's choices are part of the justification the glass box shows. It is labeled everywhere as **the revival's extension of Ken's idea**.

- **Ken's machinery used.**
  - FILM sets each absolute choice point's suggestion sources and their priorities (film.17:47-56).
  - CHOOSE gathers each kind in `gather-suggestions-of-type` (choose.198:135-163).
  - COSUG combines what is gathered, and conflicts are resolved in `resolve-conflict` (choose.198:313-355), whose second test is Ken's stub `try-to-resolve-using-criticism` (choose.198:587-589).
  - `record-choice` (choose.198:596-603) is where Ken's comment says criticism should be checked.
- **The revival.**
  1. **A criticism as a suggestion.** Wrap `gather-suggestions-of-type`. When the type is `absolute-suggestions` and the choice point is criticized, it adds `(suggestion: element E value V strength high source (criticism-by-you c7))` to what Ken's code gathered. V is a direction in Ken's own value language: `(less-than high)` for "too fast" when the choice is high, `(greater-than low)` for "too slow", `(not V)` for "not this value". It is gathered with the absolute suggestions, so COSUG combines it like any other source. The revival's choice is to gather it in Ken's first group rather than as a new group with a priority of its own (Q4).
  2. **Ken's stub, filled.** Wrap `try-to-resolve-using-criticism`. A conflict one of whose offenders is a criticism suggestion is resolved for it, `(conflict-resolved ... 'criticized-by-you)`, Ken's own `conflict-resolved` (choose.198:542-569). Ken placed this test before resolving on previous choices and strengths, so a criticism winning its conflicts is his order, not the revival's.
  3. **Ken's self-conflicting rule still refuses the impossible.** "Cinderella moves too slowly" when she is already low is `(less-than low)`, which COSUG names an `impossible-relative-value`, rejected as `self-conflicting-suggestion` (choose.198:319-322). Her speed stays low and the page says Ani couldn't.
  4. **Everyone else held** (Ken's decision 1 for changes, applied here; Q1). Pass 1 is replayed with HOLD's `hold-all-but-choice-points`, so only the criticized choice point is chosen afresh. A full recompute runs beside it for the glass box, as CHANGE's does.
- **Probed** (no holding yet):
  - "The Prince moves too fast", `(less-than high)`: his speed is medium (CP 29: high), resolved by COSUG's compromises with the criticism among the suggestions. The fairy godmother's speed then goes medium → high through the relative suggestions, the knock-on that holding prevents and the comparison shows.
  - "Cinderella moves too slowly", impossible: `impossible-relative-value`, `self-conflicting-suggestion`, three conflicts `criticized-by-you`, and her speed stays low.
  - With an empty record, CP 29 exactly (102 choices).
  
  Pass 1 took about 20 s in Node.
- **What it changes.** A pass-1 criticism changes KEN;CP, so every scene is replanned. The byte-identical program test of §5 still spares a scene the Prince's speed doesn't reach.

### 5. Remaking: the honest first version, and true local remaking

**First version (stages C1–C4): remake from the first criticized scene on.**
- Pass 1 runs again only if there is a pass-1 criticism. Otherwise the film's stored KEN;CP is mounted.
- The scenes before the first criticized one keep their glass boxes and films, and their stored files (programs, MINI, POSIT, BECOME) are mounted.
- From that scene on, each scene is planned again. If its new program is byte-identical to the stored one, the old film is kept (and its stored POSIT), the new glass box is used (it may say why, e.g. a cut), and the scene is marked "planned again, unchanged". Otherwise it is filmed.

This is `remakeFilmSteps(fs, { previous, criticism, ... })` in src/pipeline.js, beside makeFilmSteps, with the same callbacks plus `onKept(scene)`. Films stored before this feature have no `files`. Their remake runs pass 1 again and replans and refilms from the first scene: deterministic, so the earlier scenes come out as they were, only slower. The page says "This film was saved before Ani kept its working files, so it is made again from the start."

**Why scenes, not subscenes, are the unit on film.**
- Director runs a scene's whole program in one film (`(start scene)`, `(m frames)`), each part starting where the characters actually are, so a part can't be refilmed alone.
- Within pass 2, Ken's records would let one subscene be redone: SCENE keeps `(copy-of subscene)` "incase I have to be redone" (scene.9:160) and restores it in `extend-last-actions-of` (scene.9:229). But the parts after it read its predicted end positions (`put-character` into the next subscene, place.45:166-174) and distances (`record-distance-estimates`, interf.149:778-783), and CHOMET's time allocation is scene-wide (chomet.123:9-36).
- Pass 2 is cheap (3–25 s a scene in Node) and filming is the cost (minutes a scene at 24 frames a second on the page). So replanning the whole scene and refilming only what changed captures nearly all of the benefit.

**True local remaking (stage C6): holding the parts not criticized.**
- Ken's "Ani would redo this subscene (and unless necessary no other parts of the film)" needs the other tasks of a remade scene to keep their choices, not merely to come out the same.
- Ken kept the record for it: the scene's MINI, `(choices-made-in scene)`, which `make a place for tasks and current choices` writes for every task (scene.9:57-69, saved by RUN's save, run.65:89-93).
- CRITIC holds every uncriticized task at its MINI choice by wrapping `choose-methods-for-task` (chomet.123:200): if the held method is still among the task's suggestions and passes the prerequisite and time-fit scores, it is chosen as it was, with the scores recorded. Otherwise it is released ("necessary": it no longer fits), and the glass box says why.
- That is the pass-2 counterpart of HOLD. A held part's plan can still differ when the part before it now ends elsewhere. That is Ken's propagation, "could decide if the change should propagate to other parts", and the glass box names the dependency from the location's `why`, "(ended up here in ...)" or "(placed by ...)".
- Without holding, CHOMET's variety and originality scores (chomet.123:423-446) read `tasks-used-in` counts that a veto changes, so an uncriticized task can choose differently. In the probes none did.

### 6. How criticism is given on the page

Every control adds an item to the film's pending criticism, shown in a new **"Your criticism"** section at the top of the side panel. Each item is in plain words, with an × to take it out. Below the list is a button, **"Remake with my criticism"**, which says what will be remade: "Ani will plan No Longer Kept Apart, the Meeting and Justice again, and film those that change." Nothing is remade until the user asks. Several criticisms can be gathered and heeded in one remake.

**Buttons where the reasons are.**
- **In the activity's "Why this way"** (`actWhyBox`, T:4918, and `methodsBox`, T:4606):
  - **"Not this way: another way"** vetoes the display method in this task. It is shown only if the task had other suggestions (scored lower or set aside); otherwise it reads "Ani had no other way to show this", with no button.
  - **"Show something else"** applies when the task came from a convey choice (`chainOfTask`, T:4633, shows an establish task above it). It vetoes the convey method in the establishing task: Ken's footnote case, "picking something else to establish Cinderella's personality".
- **In "Why so long" and on each part row of the timeline** (`timelineBox`, T:4942): **"Too quick"** and **"Too slow"** for that part's tasks. A part already at its bound shows the button disabled, with the reason and "Make the scene longer in the story".
- **Per scene, in the panel's scene header:**
  - **"Keep two apart in this scene…"** picks two of the characters on stage in the scene (and optionally "and the scenes before it").
  - **"Have one start far from another…"** picks the one who appears and the one to start far from; it is offered when someone's first location in the scene is "ended up here in <previous scene>" while that character had no part in that scene.
- **In a part's "Ani's own records"**, where a distance record or a cut decision is shown: **"As if they were near / a medium way / far apart"**.
- **In each pass-1 choice point** (`choicePointBox`, T:4574), for the three-valued elements, in words by element: speed "Moves too fast / too slowly"; path-curvature "Too curvy / too straight"; path-length "Paths too long / too short"; path-jaggedness "Too jagged / too smooth"; acceleration, deliberateness and the levels "Too much / too little". Also "Not <value>". This group is labeled "The revival's: criticism of pass 1's choices".
  - A direction that is impossible at this value is still offered and explained after the remake ("Ani couldn't: low is its slowest"). The user then sees Ani's own refusal rather than a hidden button.
  - Elements Director doesn't use (`ELEMENT_USE` "none": acceleration, deliberateness, the attractions without DETAIL) say so before the remake: "Ani chooses this, but in 1978 nothing reads it, so the film won't change."

**A plain-English box: "Tell Ani what's wrong".** It sits at the bottom of "Your criticism", for any provider the teller already has (`PROVIDERS`, llm.js:15-38).

- **The prompt** gives the model the film as the glass box tells it: for each scene, its parts in order with who does what, for how long, Ani's way and the other ways it considered (from whyTheyAct), the pass-1 values for each character, and the kinds of criticism Ani can heed, each with its example. It quotes p. 191's limits.
- **The schema** is `critiqueSchema(run)` in a new app/film/critique.js, strict like `storySchema` (`obj`, `one`, `list`), with enums that are this film's own parts:
  - `scene`: the run's scene ids.
  - `task`: ids `t1…tn`, one per task of every scene, each described in the prompt by scene, part number and the task's description in words. A schema can't tie a task to a scene, so the id carries both.
  - `method`: the display and convey methods that appear anywhere in the film's tasks (chosen, scored, rejected).
  - `character`: the cast.
  - `choicePoint`: `character|element` for every choice point of the run.
  - `kind` items (anyOf):
    - `another-way {task, level: display|convey, method}`
    - `pace {task, direction: quicker|slower}`
    - `keep-apart {scenes: [scene], between: [character, character]}`
    - `start-far {scene, who, from}`
    - `as-if-distance {task, between, distance: near|medium|far}`
    - `choice {choicePoint, direction: more|less|not}`
    - `story {explain}`, for what is really a change to the film description ("the stepmother should be kind"), sent to the editor
    - `cannot {about: rhythm|climax|tension|mood|humor|built-in|lacking, explain}`
  - Each item also has `said`, the words of the user's it came from.
- `schemaFor(provider, schema)` (json.js:94) adapts it per provider as it does the story's.
- **The reply** is checked against the film:
  - a method not among the task's suggestions is reported, not applied;
  - each item becomes a pending criticism shown with its `said` words, so nothing is applied that the user hasn't seen;
  - `cannot` items are shown with Ken's sentence: "Ani currently has practically no conception of rhythm, for example, and so could not respond to criticisms of the film's rhythm. The same holds for notions such as climax, tension, mood, or humor. Any aspect of Ani that is built-in ... or lacking entirely cannot be criticized with any effect." (thesis p. 191), with the model's one-line `explain` of which applies.
  - `story` items offer "Change the story" with the suggested change.
- **What counts as "built-in"**, given to the model with examples:
  - where characters start when nothing places them;
  - Director's walking and turning;
  - the 4 and 24 frames a second;
  - looks without APPEAR;
  - the order of the scenes (the description's).
- **Refusals and errors** reuse llm.js's handling (`postJSON`, the refused sentence, "Ask X to fix these").

### 7. How the glass box shows a criticism's effect

- **"You" as a source.**
  - In `choicePointBox`, `sourceText` (T:4550) words `(criticism-by-you c7)` as "you said he moves too fast".
  - A conflict resolved `criticized-by-you` reads "Ani took your criticism over this suggestion (Ken's place for it: try-to-resolve-using-criticism, choose.198:587)".
  - A held choice reads as CHANGE's do: "held as it was; on its own Ani would have chosen high".
- **"Vetoed by you."** `rejectText` (T:1144) words `(vetoed-by-you c1)` as "vetoed by you". `prerequisites-not-met ((kept-apart a b by c3))` is worded "it would bring Cinderella and the Prince together, which you said they must not do in this scene". `methodsBox` shows vetoed ways struck through, with the criticism's words.
- **What your criticism did here.** glassBox collects every `(heeded-criticism: id C what W was X now Y because R)` item into `glass.criticism`, only when there are any, so an uncriticized glass box is unchanged. whyPanel gets a section, "What your criticism did here", one sentence per item with a code link to the wrapped function. Examples:
  - "This part was given 5.97 seconds instead of 3.98, because you said it was too quick; the walks were slowed to fit (stretched by 1.5)."
  - "The fairy godmother was placed far from Cinderella, off the stage, because you asked; PLACE chose where."
  - "No other way to show that Cinderella is friendly was left: the two Ani knew both bring her to the Prince." This one names the task `cant-do` and the criticism that emptied it.
- **Ani's own criticism** reads "Ani criticized itself: it planned 3.98 seconds and Director took 6.25", and the remade part shows both rounds.
- **Before and after side by side.** After a remake the page sets `state.pair` to the criticized film and the remade one (`setPair`, T:4040). `pairPanel` (T:6583) gains a first section, "What your criticism changed": for each criticism, met, partly met or not met, with the sentence above, and per scene the methods and lengths before and after (`shownIn`, T:6443). Scenes kept unchanged are listed as such: "Kept Apart: planned again, the same program, the same film". The remade film goes into "Your films" with "remade from …", so any two (the original, the first remake, a second) can be compared later.

### 8. When a criticism can't be met, and the cheating question

**Can't be met.** Each case is said where it happened, in Ken's terms:
- **No alternative left:** the task is `cant-do`. The sentence names what was vetoed or ruled out and what Ani knows of other ways, with a hint when an extension would add one: "With the revival's KNOW and SLIPS, Ani would have Cinderella help her stepmother instead". The probe shows that is true of Ken's footnote case.
- **Time at its bound:** §4.1.
- **A pass-1 direction impossible at its value:** Ken's `impossible-relative-value` (§4.6). One that loses to stronger evidence can't happen, since Ken's stub resolves conflicts for the criticism.
- **A constraint that empties a scene:** "keep Cinderella and the Prince apart in the Meeting", whose every task is them together. The remake runs, most tasks are `cant-do`, and the page leads with "Most of the Meeting couldn't be made without bringing them together; that is what the Meeting is for. Perhaps this is a change to the story." It doesn't refuse the criticism beforehand, since Ani's own reasoning is what should say so.
- **Self-criticism that doesn't converge:** §4.5.
- **What Ani has no conception of:** the `cannot` kind, with p. 191.

**The cheating question.** Ken's footnote is about the programmer arranging "for Ani to do what I want without improving the reasoning", for example by fixing things "so that the option no longer existed or looked undesirable".
- **A user's veto is not that cheating.** It is the remedy Ken himself proposes: a record the user keeps, heeded where Ani chooses, with the reason in the glass box ("vetoed by you"). The reasoning is unchanged and its record is honest about who decided.
- **What would be cheating, and is ruled out:**
  1. Carrying a criticism into Ani's knowledge: a veto of goes-to-and-accompanys in No Longer Kept Apart must never become a change to DISPLY's or CONVEY's suggestions or strengths. The record stays per film, and the revival's tests check that a criticized run leaves no file of Ani's changed.
  2. Pass-1 criticism that dictates a value. A criticism is a direction combined with the other evidence, and Ken's own rules can still refuse it (`impossible-relative-value`). "The Prince's speed is medium" is not offered; "too fast" is.
  3. Tuning the revival's thresholds (the 1.5, the factor of 2, the three distances) until Ken's two examples look right. Each is fixed here before the goldens are made, is labeled the revival's, and the goldens record what it gives.
- **Where it is closest to cheating:** the pass-1 criticism. It lets a user reach past the descriptions into a choice whose justification is the descriptions. Ken's p. 235 ("films tailored to the particular user") and his stub's place in conflict resolution argue for it, and the label "the revival's extension of Ken's idea" says it isn't his (Q4).
- **A user's criticism that would be better as knowledge** ("Ani should know hitting is not friendly") is not taken. It belongs to Ken's legitimacy rule and KNOW, and the page says "That's knowledge Ani lacks, not a criticism of this film."

### 9. The 1978 contract

- A film with no criticism never loads CRITIC: no job, file, glass box or film changes (check-1978 untouched).
- With CRITIC loaded and an empty record, every wrapper passes through: `check-1978 --extensions critic` must be byte-identical, including glass.json, with no repair notes and the same loaded files besides CRITIC's own.
- `check-ext` for each existing golden set with `,critic` added and an empty record must equal its golden (KNOW, SLIPS, DETAIL, SEEN, APPEAR at 4 frames a second).
- HOLD's move out of CHANGE must leave `check-change` (4 and 24) and `check-no-change` unchanged.
- The page's switch set (MEND, KNOW, APPEAR, CHANGE, SEEN) is unchanged. CRITIC is never in `SWITCHED`.
- The shipped 1978 data, `frames[].chars` and the story prompt with extensions off stay byte-identical.

### 10. What the probes found

The probes are scratch files in the session's scratchpad (`critic/critic.lisp`, `critx.lisp`, `critp1.lisp`, `probe.mjs`, `chain.mjs`, `cmpchain.mjs`, `p1.mjs`). Each wraps Ken's functions with REVIVE;WRAP inside pipeline.js's pass1/pass2/film, on Ken's files with reports/pass2's 1978 outputs mounted. Frames are at 4 frames a second.

| Criticism | Scene | 1978 | With it | Then |
|---|---|---|---|---|
| none (baseline through the probe harness) | all | 192, 116, 17, 179, 84 | the same | — |
| veto goes-to-and-accompanys | No Longer Kept Apart | 17 | 23: chases-to, resurrected by Ken's resurect-bad-time-fits, allocated (3.92 18.92) → (1.12 16.12) | Meeting 178, Justice 100 |
| too quick ×1.5 | No Longer Kept Apart | 17 | 30: 3.98 → 5.97 s, stretched-by 1.5 | Meeting 183, Justice 90 |
| fairy godmother starts far from Cinderella (needs MEND19) | No Longer Kept Apart | 17 | 25: placed good-distance-from-and-offstage, walks on 2 s; Ani's estimate unmoved at 3.98 | — |
| both of Ken's remedies | No Longer Kept Apart | 17 | 38 (9.5 s, under the scene's 10 s minimum) | — |
| keep Cinderella and the Prince apart, Introduction and Kept Apart | Introduction | 192 | 111: establish-task-1 cant-do, no other way with Ken's knowledge | Kept Apart onward byte-identical: programs, frames, POSIT (Kept Apart starts with a cut) |
| the same, with KNOW and SLIPS | Introduction | — | Cinderella helps her stepmother (helps-along) and follows her (follows-behind); the Prince not on stage | — |
| the Prince moves too fast (less-than high), pass 1 | pass 1 | high | medium; knock-on: fairy godmother medium → high (unheld) | — |
| Cinderella moves too slowly (less-than low) | pass 1 | low | low: impossible-relative-value, self-conflicting-suggestion; three conflicts criticized-by-you | — |
| empty record | pass 1 | CP 29 | CP 29 | — |

Further findings:
- No Longer Kept Apart's 3.98 s, under its own 10–25 s, comes from CHOMET moving the task's allocated time down to fit the method (§4.1; PLAN.md stage-7 question 2).
- Director films from the program alone, so a byte-identical program is a sound test for keeping a film.
- `large-distance-and-offstage` is undefined in 1978 (MEND19 defines it).
- goes-to-and-accompanys' estimate leaves out the friend's walk on, so self-criticism has a real case in Ken's own scene.

## Alternatives considered

- **Criticism written into the film description**, e.g. a `(criticism ...)` form in CINDY. Rejected: it mixes what the film conveys with how Ani made it (Ken keeps "a record of user criticism"), a criticism would be read by pass 1's DATEST as a task, and the story's diff would fill with judgments.
- **A JavaScript layer that edits Ani's outputs** (rewriting the program's times or methods). Rejected, as every earlier design rejected it: the glass box would then explain our code, not Ani's, and Ani would not have chosen the replacement.
- **Vetoing by making the method's score bad** (a large negative strength). Rejected: that is Ken's example of cheating, making an option "look undesirable". Rejecting it with a reason in `rejected-suggestions` is honest and visible.
- **Keep-apart as a post-run check and redo**, rather than a prerequisite: plan, see the walks bring them together, restore the subscene from its copy (scene.9:229), `unchoose`, rechoose. This is the most literal "post-condition", and it is kept as a check (§4.3). It is rejected as the mechanism because CHOMET's choice and time allocation are scene-wide, and redoing after `run your methods` would mean reallocating a scene already placed.
- **Making only the criticized subscene in pass 2**, from Ken's copy. Rejected for the first version (§5): Director films scenes whole, and pass 2 is cheap.
- **Pass-1 criticism as Ken's stub alone** (only in conflicts). Rejected: a criticism that conflicts with nothing (one source said high and nothing else spoke) would never be heard.
- **Pass-1 criticism at `record-choice`** (Ken's comment there), as a veto of the value about to be recorded. Kept as the mechanism for "not <value>" if Q4 is answered that way. Rejected as the main one: rejecting at record-choice leaves Ani nothing to choose from unless the choice point is reopened, and reopening is what the source mechanism already does in Ani's order.
- **Self-criticism always on.** Rejected (§4.5): it would remake unbidden, and with SLIPS off it chases a known slip.

## Changes, file by file

- **src/director/revive/hold.lisp (new):**
  - `hold-everyone-but`, `held-value-of`, `as-the-other-name-reads` and `record-choice-holding-the-others`, moved unchanged from change.lisp:417-471;
  - `hold-all-but-choice-points` (new);
  - one `revival-wrap` of `record-choice` under the id `hold`. CHANGE's own code calls these.
- **src/director/revive/change.lisp:** the moved functions removed; HOLD listed before CHANGE in its registry files.
- **src/director/revive/critic.lisp (new):**
  - `load-criticism`, `:critic-record`, `critic-for`, the heeded-criticism helper;
  - the display and convey veto wrappers (chomet.123:205, 213);
  - the pass-1 source and stub wrappers (choose.198:135, 587);
  - the pass-2 task holding (chomet.123:200; stage C6);
  - the `tags` entries for its new actor `kept-apart`.
- **src/director/revive/critpc.lisp (new):** the pace wrapper (chomet.123:95).
- **src/director/revive/critsc.lisp (new):** keep-apart (the contact table and its prerequisite, wrapping the same two CHOMET functions under its own id; the plan check after `run your methods`, wrapping scene.9:159's receiver with `revival-once` and `define-extension-receiver`); start-far (place.45:9).
- **src/director/revive/critpl.lisp (new):** as-if distance (interf.149:713); as-if time (chomet.123:448 and, through CRITPC's wrapper, 95).
- **src/pipeline.js:**
  - the `critic` entry and the `onDemand` and group fields;
  - `boot({criticism})` writing KEN1;FILM CRITIC;
  - `criticismToLisp`;
  - `glassBox` collecting `glass.criticism` (only when present);
  - `remakeFilmSteps`;
  - `selfCriticism(glass, film)`;
  - `filesOf(fs)` to keep the intermediate files with a run;
  - `makeFilmSteps` returning `files`.
- **tools/critic-contacts.mjs (new):** reads DISPLY's and REVIVE's run receivers, writes CRITSC's table with lines, and fails if it is stale.
- **tools/check-critic.mjs (new; `npm run test:critic`, `test:critic24`):** the end-to-end tests below, against goldens in reports/ext/critic/.
- **app/film/critique.js (new):** `critiqueSchema(run)`, `critiquePrompt(run)`, `criticismFromReply(run, reply)`, the wording of each kind.
- **app/film.template.html:**
  - "Your criticism" and its controls;
  - the buttons in `actWhyBox`, `methodsBox`, `timelineBox`, the scene header and `choicePointBox`;
  - `sourceText`, `rejectText` and `repairSentence`'s siblings for criticism;
  - "What your criticism did here";
  - `pairPanel`'s first section;
  - the remake flow (`startRemake`, the worker message `remake` with `{previous files, criticism}`);
  - `runVersion` 3;
  - `EXT_GROUPS` "criticism".
- **app/film/save.js and library.js:** version 3 (criticism, remadeFrom, files); `filmMeta.remadeFrom`; "remade from …" in "Your films".
- **app/film/llm.js:** a `critique` mode of `CALLS` using critique.js's prompt and schema.
- **reports/ext/critic/README.md:** what each criticism did to Ken's Cinderella, with the goldens.
- **PLAN.md:** a Phase-9 section, "Criticism (CRITIC)", with the stages' status and Ken's decisions.

## Lisp sketch

```lisp
;;; REVIVE;CRITIC (sketch). Everything inside +after-load of the Ken file it wraps.

(or (boundp ':critic-record) (setq :critic-record nil))

(defun load-criticism (file)          ;;the pipeline's KEN1;FILM CRITIC
  (setq :critic-record (read-all-forms file)))

;; the criticisms of a kind that apply to a task, newest last
(defun critic-for-task (kind task)
  (let ((scene (ask ,task recall your scene))
        (description (get (ask ,task recall your task) 'description)))
       (mapcan (function (lambda (c)
                 (and (eq (get c 'kind) kind)
                      (eq (get c 'scene) scene)
                      (or (equal (get c 'task) description)
                          (member description (get c 'tasks)))
                      (list c))))
               :critic-record)))

(defun heeded (actor criticism what was now because)
  (ask ,actor memorize (heeded-criticism: id ,(get criticism 'id) what ,what
                         was ,was now ,now because ,because)))

;; kind 1, display level: CHOMET's display suggestions, the vetoed ones rejected with
;; Ken's reject-suggestion (chomet.123:305), the reason naming the criticism
(defun get-display-method-suggestions-heeding-criticism (task)
  (let ((vetoes (critic-for-task 'another-way task)))
       (do ((s (funcall (revival-wrapped 'get-display-method-suggestions 'critic) task) (rest s))
            (kept nil))
           ((null s) (nreverse kept))
           (let ((c (vetoing vetoes 'display (first (get (get (first s) 'value) 'value)))))
                (cond (c (reject-suggestion task (first s) '(vetoed-by-you ,(get c 'id))))
                      (t (push (first s) kept)))))))

(+after-load '|ken;chomet >|
  '(revival-wrap 'get-display-method-suggestions 'critic
                 'get-display-method-suggestions-heeding-criticism))

;; the revival's pass-1 criticism, gathered with the absolute suggestions
(defun gather-suggestions-of-type-heeding-criticism (type choice-point)
  (let ((found (funcall (revival-wrapped 'gather-suggestions-of-type 'critic) type choice-point))
        (c (and (eq type 'absolute-suggestions) (critic-of-choice-point choice-point))))
       (cond ((or (null c) (eq (first found) 'postponed:)) found)
             (t (cons '(suggestion: element ,(ask ,choice-point recall your element)
                                    value ,(get c 'value) strength high
                                    source (criticism-by-you ,(get c 'id)))
                      found)))))

;; Ken's stub (choose.198:587-589), filled: a conflict with a criticism in it goes the
;; criticism's way, by Ken's own conflict-resolved
(defun try-to-resolve-using-criticism-heeding-criticism (choice-point suggestions conflict)
  (let (((one two) (get conflict 'offenders)))
       (cond ((criticism-suggestion? one)
              (conflict-resolved choice-point suggestions conflict one two 'criticized-by-you))
             ((criticism-suggestion? two)
              (conflict-resolved choice-point suggestions conflict two one 'criticized-by-you)))))

(+after-load '|ken;choose >|
  '(progn (revival-wrap 'gather-suggestions-of-type 'critic
                        'gather-suggestions-of-type-heeding-criticism)
          (revival-wrap 'try-to-resolve-using-criticism 'critic
                        'try-to-resolve-using-criticism-heeding-criticism)))

;;; REVIVE;CRITPC: kind 2
(defun ideal-time-for-task-heeding-criticism (task in-parallel?)
  (let ((time (funcall (revival-wrapped 'ideal-time-for-task 'critpc) task in-parallel?))
        (c (first (critic-for-task 'pace task))))
       (cond ((or (null c) in-parallel? (ask ,task recall your running-time)) time)
             (t (let ((new (pick-time-within (ask ,task recall your allocated-time)
                                             (*$ time (get c 'factor)))))
                     (heeded task c 'pace time new (list (get c 'direction)))
                     new)))))

;;; REVIVE;CRITSC: start far (place.45:9)
(defun place-medium-distance-apart-heeding-criticism (action place-1 place-2 cut-distances subscene)
  (let ((c (start-far-here subscene (character-involved-in place-1) (character-involved-in place-2))))
       (cond (c (ask ,subscene forget your (location-of ,(get c 'who)))
                (heeded subscene c 'start-far 'where-it-ended-up 'large-distance-and-offstage
                        '(your criticism))
                (place-large-distance-apart action place-1 place-2 cut-distances subscene))
             (t (funcall (revival-wrapped 'place-medium-distance-apart 'critsc)
                         action place-1 place-2 cut-distances subscene)))))
```

## Tests

**Unit, test/critic.test.js:**
- each wrapper installed once per job, and installed in the right file's +after-load (force-load each parent, as test/ext.test.js does);
- with an empty record every wrapper returns what Ken's function returns (one call each, on a fixture);
- `criticismToLisp` round-trips every kind;
- the contact table equals what tools/critic-contacts.mjs reads from DISPLY and REVIVE today;
- HOLD: `hold-all-but-choice-points` with nothing freed gives CP 29's values.

**Unit, test/critique.test.js:**
- `critiqueSchema(run)` for Ken's film has exactly its 5 scenes, its tasks (t1…), its methods and its choice points, and is valid strict JSON Schema for each `schemaFor` provider;
- a canned reply of each kind becomes the expected record item;
- a method not among its task's suggestions is reported and not applied;
- `cannot` yields p. 191's sentence;
- `story` routes to the editor.

**End to end, tools/check-critic.mjs** (goldens in reports/ext/critic/, 4 frames a second; `--fps 24` for the first two only):
1. **Ken's No Longer Kept Apart**, three runs: "too quick" (30 frames), "fairy godmother starts far" (25), and both (38). Each checks:
   - the earlier scenes are not refilmed (onKept);
   - the Meeting and Justice are replanned and refilmed;
   - in the start-far runs, the godmother's first-frame position is off the picture and her first walk ends at Cinderella;
   - the heeded items are present.
2. **Ken's footnote**: keep Cinderella and the Prince apart in the Introduction and Kept Apart.
   - With Ken's knowledge: the Introduction is 111 frames, establish-task-1 is `cant-do` and names the criticism, and Kept Apart through Justice are kept, byte-identical programs, not refilmed.
   - With KNOW and SLIPS: Cinderella helps and follows her stepmother.
   - In both, Director's frames never put the two within Ken's small distance while both are on the picture.
3. **A veto**: No Longer Kept Apart's goes-to-and-accompanys → chases-to (23 frames), `vetoed-by-you` in rejected-suggestions, and stands-guard still `prerequisites-not-met`.
4. **A convey veto**: in the Introduction, veto `accompanys` in establish-task-1. helps is then the only one left and is `cant-do` with Ken's knowledge (as in 1978, "helps" had no way), so the subscene goes; with KNOW, helps-along shows it.
5. **"Too slow"**: Kept Apart's stand-guard part ×1/1.5, within its allocated time. Then "too slow" again until the bound, where the page's "can't" case is checked.
6. **Keep apart where it empties a scene**: the Meeting, Cinderella and the Prince. Most tasks `cant-do`, the film is made, and the sentence is given.
7. **Choice points**:
   - "the Prince moves too fast": held, only his speed differs from CP 29 (medium); the full recompute's knock-ons (fairy godmother high) are recorded; all five scenes are replanned and those whose programs are unchanged are kept;
   - "Cinderella moves too slowly": `impossible-relative-value`, CP 29 unchanged, the sentence given;
   - "Not high" on the stepmother's speed.
8. **Self-criticism**: start-far No Longer Kept Apart, then "Let Ani criticize itself": finds the 3.98 vs 6.25 s part, makes an as-if-time item, and remakes. At most two rounds. The golden records the result whatever it is.
9. **As if a distance were known**: the Meeting's part (d), "as if far apart". The cut Ken describes is made (the transition-type is cut).
10. **Pass-2 holding** (stage C6): with a veto in No Longer Kept Apart and in the Introduction, every other task's choice equals its MINI's, or is released with the reason recorded.

**The 1978 contract (§9):**
- `check-1978` (none);
- `check-1978 --extensions critic`;
- `check-ext` with `,critic` for each golden set;
- `check-change` and `check-change24`;
- `check-no-change`;
- `npm test`.

**The page, tools/check-film-app.mjs:**
- Ken's film: in No Longer Kept Apart, "Not this way", "Too quick", "Remake with my criticism", then the two side by side with "What your criticism changed";
- a choice-point criticism;
- the language-model box with a canned provider reply (the existing test-provider path);
- a version-3 film saved and reopened, and remade again from its files.

## Risks

- **CHOMET's redistribution** moves allocated time in ways a veto can surprise (No Longer Kept Apart's (3.92 18.92) → (1.12 16.12)). The glass box must say "Ani moved this task's time to fit the way left", from `rejected-suggestions`' time reasons, or the remake looks arbitrary.
- **The contact table** is a static reading of the code. The plan check after `run your methods` and Director's measured distance are the guards.
- **Task identity by description** fails when a description occurs twice in one scene. The record then also carries the task's position among its scene's tasks with that description.
- **Stored files** make version-3 films larger (20–60 KB). The library cap (40) and IndexedDB quota are unchanged. Measure.
- **A pass-1 criticism replans all five scenes**: about 2 minutes at 4 frames a second in Node, much longer at 24 on the page. The byte-identical test spares unchanged scenes, but the Prince is in four of the five.
- **Language models will propose criticisms of the wrong kind** (e.g. "make her sadder" as a pace). The check against the film and the user's confirmation of each pending item are the guards. Nothing a model says is applied unseen.
- **SLIPS off** makes self-criticism chase Director's speed inversion (§4.5).

## Stages

Each stage is buildable and testable on its own, in this order.

| Stage | Work | Files and wraps | Tests and goldens | Page | Checks | Effort |
|---|---|---|---|---|---|---|
| C0 | Record, registry, on-demand loading, remake plumbing, HOLD factored out | pipeline.js (`critic` entry, `onDemand`, `boot({criticism})`, `criticismToLisp`, `filesOf`, `remakeFilmSteps`, `glass.criticism`); revive/hold.lisp (from change.lisp:417-471, wrapping choose.198:596); revive/critic.lisp skeleton (`load-criticism`, `heeded`) | test/critic.test.js (loading, pass-through, round trip); a remake with an empty record equals the film (all scenes kept: programs byte-identical) | none yet | check-1978; check-1978 --extensions critic; check-change, check-change24, check-no-change; npm test | 2.5 d |
| C1 | Kind 1, the veto, display and convey | critic.lisp wrapping chomet.123:205 and 213 (reject-suggestion, chomet.123:305) | check-critic tests 3 and 4; goldens reports/ext/critic/veto-nlka, veto-intro-convey | "Not this way" and "Show something else" in actWhyBox/methodsBox; "Your criticism"; "Remake with my criticism"; rejectText "vetoed by you"; pairPanel's first section; version 3 and "remade from" | as C0, plus test:critic; check-film-app (veto path) | 4 d |
| C2 | Kind 2, pace | critpc.lisp wrapping chomet.123:95 (pick-time-within, chomet.123:131) | tests 1 (too quick) and 5; goldens pace-nlka, pace-kept-apart | "Too quick" and "Too slow" in "Why so long" and the timeline; the bound's sentence and "Make the scene longer in the story" | as C1 | 1.5 d |
| C3 | Kind 3, keep apart and start far | critsc.lisp (the contact table; the prerequisite on chomet.123:205 and the drop on 213; the plan check on scene.9:159; place.45:9 → place.45:25, MEND19); tools/critic-contacts.mjs | tests 1 (start far, both), 2 (Ken's footnote, with and without KNOW+SLIPS), 6; goldens | the scene header's two pickers; "it would bring them together" wording; the closest-they-came line | as C1, plus check-ext with know,slips,critic | 3.5 d |
| C4 | The language-model box | app/film/critique.js; llm.js `critique` mode | test/critique.test.js | "Tell Ani what's wrong", pending items with their words, `cannot` with p. 191, `story` to the editor | npm test; check-film-app with a canned reply | 3 d |
| C5 | Kinds 4 and 5, as-if and self-criticism | critpl.lisp wrapping interf.149:713 and chomet.123:448; pipeline.js `selfCriticism` | tests 8 and 9; goldens | "As if near / a medium way / far apart" in "Ani's own records"; "Let Ani criticize itself" in "How Ani timed it"; "Ani criticized itself" | as C1 | 3 d |
| C6 | The revival's pass-1 criticism, and pass-2 holding (true local remaking) | critic.lisp wrapping choose.198:135 and 587 (conflict-resolved, choose.198:542); HOLD's `hold-all-but-choice-points`; critic.lisp wrapping chomet.123:200 to hold tasks at their MINI choice (scene.9:57-69) | tests 7 and 10; goldens choice-prince, choice-impossible, hold-* | choicePointBox's buttons, labeled the revival's; sourceText "you said"; "held as it was" in methodsBox | as C1, plus check-1978 with pass 1 run through the holding path and nothing freed (CP 29) | 3.5 d |

That comes to about 21 working days. C0–C3 deliver Ken's Section D kinds 1–3 and his two Cinderella examples, about 11.5 days. The site should not show the controls until C1 lands with C0's remake path.

## Questions for Ken

1. **A pass-1 criticism: hold everyone else, or let the knock-ons happen?** Recommended: hold, as your decision 1 for changes, and show the full recompute's knock-ons (the fairy godmother's speed going high when the Prince is slowed) as a comparison.
2. **What does a veto name: the method in this task, in the scene, or in the film?** And the method, or its exact form? Recommended: the method's name, in the task it was given in. Your footnote speaks of "alternatives", and a veto that spread to other tasks would be the user arranging the film rather than criticizing a choice.
3. **How much quicker or slower is one "too quick"?** Recommended: 1.5, compounding with repeats, bounded by the time your story gives the scene, never past SCENE's own 8 and 1/8. Or should it be the next length level's share?
4. **Should criticism of pass 1's choices be offered at all, and as a suggestion in your first group with the stub resolving its conflicts for it?** Recommended: yes, labeled the revival's extension of your idea, as directions only (too fast, not high), never values, so that your rules can still refuse it.
5. **Which distances stand for near, a medium way and far?** Recommended: 0.15, 0.5 and 0.85 of the screen, inside your small, medium and large bands (place.45:103-113).
6. **What is "way off" for self-criticism?** Recommended: a factor of 2 in time, or a different band of distance; at most two rounds; offered, not automatic.
7. **Self-criticism with SLIPS off** mostly finds the speed inversion. Offer it only with SLIPS on, or say what it found either way? Recommended: either way, saying so when SLIPS is off.
8. **Should a criticism ever outlive its film** (a user's "keep these two apart" remembered for their next story, your p. 235)? Recommended: not now. Per film only, so it never becomes knowledge (your cheating footnote). Revisit once the user model of p. 235 is wanted.
9. **Internal self-criticism**, a choice remade when a later task can't be done, is left out. Recommended: leave it out until the pass-2 holding of stage C6 has shown how often your records are enough to decide what depends on what.
10. **No Longer Kept Apart's own quickness** comes partly from CHOMET's redistribution, stage 7's question 2. Recommended: answer that question first if you would rather the scene keep its 10 to 25 seconds without criticism; the "too quick" test's golden would then change and be remade.
11. **CRITIC loaded on demand, for any film including "Ani as in 1978"**, with MEND loaded with it (byte-identical on your Cinderella, needed for "start far")? Recommended: yes.

## Thesis references

- Section D, Critics and Criticism: AI-TR-540 pp. 189–191, L4945-5016.
- The cheating footnote and the legitimate changes: p. 189, L4929-4955.
- How Ani Evolves, activities recording their participants' relative positions: pp. 188–189, L4900-4935.
- No Longer Kept Apart, "User criticism could easily be applied ...": p. 69, L1956-1962.
- The Introduction's subscene (d) and its footnote, "an ideal test case": p. 64, L1830-1844.
- The never-finished procedures for resolving conflicts by criticism: p. 109, L2973-2974.
- Lack of Perception: p. 228, L5935-5962.
- Everyone Sees Differently: p. 235, L6140-6150.
- Making Ani Smarter: p. 197, L5141-5142.
- Ken's code: choose.198:313-355, 542-569, 587-603; chomet.123:9-139, 187-310, 363-375, 448-460, 474-560; scene.9:57-69, 159-240, 315-330; place.45:9-113, 116-150, 248-266, 524-559; interf.149:139-140, 704-783; run.65:31-56; film.17:47-56; disply.311:113-240 (with the contact lines in §4.3).
