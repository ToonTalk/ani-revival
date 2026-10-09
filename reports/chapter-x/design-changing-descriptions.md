# Characters who change: Ani takes a fresh look, bridges the gap, and remembers who they have become (thesis X.A.3)

*One of four designs behind [PLAN.md](PLAN.md), written by a design agent on 9 October 2026 and then reviewed adversarially. Where the review below finds an error, the plan's corrected version is the one to follow.*

## Summary

A change is a scene task written the way Ken wrote it in cindy.46: (change (TYPE WHO OLD) (TYPE WHO NEW)), optionally wrapped in (causes X ...). For each scene that changes someone, Ani runs pass 1 again, treating the changed character "as if brand new" (thesis option 1). In the scene of the change she compares before with after and slowly bridges the gap, after showing who caused the change (option 2). She then carries who the characters have become into every later scene in a BECOME file, the way she already carries where they ended up (POSIT) and what she decided (MINI). Everything lives in a new switchable REVIVE;CHANGE file plus pipeline and page plumbing. Cinderella as Ken wrote it does not trigger any of the new code, so the 1978 film stays exact even with the extension on.

## The design

THE IDEA. A change is a scene task, `(change (TYPE WHO OLD) (TYPE WHO NEW))`, exactly as in Ken's commented-out cinderella-beautified scene (cindy.46:94-105). It may be wrapped as `(causes CAUSER (change ...))`.
- TYPE is physical, personality, movement, role-in-story or relationship.
- WHO is a character, or `(relationship-of a b)`.
- OLD and NEW are a word or `(and ...)`, as in initial descriptions.

Examples:
- "the evil repent": `(convey (causes prince (change (personality step-mother (and evil mean)) (personality step-mother (and good kind)))))`
- "the shy learn to socialize": `(convey (change (personality cinderella shy) (personality cinderella brazen)))`. brazen is shy's own opposite in DSCRP.
- Ken's beautification, unchanged.

Ani handles a change in three ways:
1. **She takes a fresh look.** Pass 1 runs again with the changed description: Ken's "rederive ... as if the character were brand new" (L4396-4402).
2. **She portrays the change.** In the scene where it happens, she compares before with after, "slowly bridge[s] the gap" over a time she decides, and shows the cause and the new self (L4411-4423).
3. **She remembers who they have become.** Every later scene starts from the new description and values.

**WHAT I VERIFIED (9 October, in memory only, scratch scripts change-p1c.mjs and change-scenes-p1.mjs).**
- **Where the change must go.** It must be made after DATEST loads CINDY and before `study-descriptor-use` (compar.69:127-136, called by datest.56:8), which works out who is unique and how characters compare. Changing the description after `init` gives different and wrong values. For example, for evil+mean → good+kind it made the stepmother slow and gave 10 knock-on changes in other characters, instead of 1.
- **Evil → good:** five of the stepmother's movement choices change: acceleration high→medium, deliberateness high→medium, path-length medium→long, path-curvature low→medium, path-jaggedness medium→low. Two attractions flip. Knock-on: the Prince's deliberateness medium→high.
- **Evil+mean → good+kind:** the same, but path-curvature goes low→high, and attraction-towards-enemies flips too.
- **Shy → brazen:** Cinderella's speed low→medium and two attractions flip. Knock-on: the stepmother's speed high→medium, the godmother's medium→high, and the Prince's high→medium.
- **Shabby → elegant:** none of the 102 choices change. This confirms Ken's footnote that the scene is "meaningless until Ani is extended to handle appearances" (L4354-4355).
- **Scenes in pass 1.** Pass 1 already turns scenes into tasks (CINDY defines them). `(ask scene recall your offspring)` lists them newest first.
- **What Ken left undefined.** `causes`, `change` and `wander-around` are not defined anywhere. `wander-around` is called by scene.9:218 and defined nowhere in the 1978 files. The thesis says a character with only changes "will wander around so that the changes are apparent" (L3389-3392).
- **Participation.** The changed character in Ken's scene gets no scene-participation from the causes task (scene.9:463, Ken's own comment: "what about other participents?").
- **What pass 2 reads.** Pass 2 reads only the absolute choice points `(choice-point-of c E)` (scene.9:272, prereq.19:33-35), never the relative ones.

**STAGE 1: THE FRESH LOOK AND WHO THEY HAVE BECOME (Ken's option 1).** Everything is in `src/director/revive/change.lisp` (REVIVE;CHANGE), loaded after the bridge in all three jobs, and only when "Ani with the revival's extensions" is chosen.

*Pass 1 again.*
- After the ordinary pass 1, the pipeline runs one extra pass-1 job for each scene that contains a change, in film order.
- `(init-as-of scene)` is DATEST's `init`, with every change in the scenes up to and including this one made before `study-descriptor-use`:
  - forget the old `(description: type T descriptor OLD source ?)` items, and anything a removed word told (graceful told by beautiful);
  - memorize `(description: type T descriptor NEW source (change-in scene))`;
  - copy CHAR's beautiful → graceful demon for a NEW beautiful.
- Then `(z)`, and `(record-changes-of scene file)`.
- `record-changes-of` writes `KEN1;<fn1> BECOME` the way DATEST's `save-answers` writes CP: one `(define (change-of step-mother in change-of-heart) description-change ...)` per changed character, holding:
  - the change;
  - its cause (found in a `(causes ...)` task);
  - the character's new value for every element of `(ask element-types recall your types)`, so item (1)'s appearance elements come along automatically.
- Only the changed character's values are recorded. The JS step also returns the rerun's choice points (`collectChoicePoints`), so the page can show why each new value was chosen.

*Later scenes.*
- RUN's `to-do-before-running` slot (run.65:48) is where `pipeline.js` already loads the MINI summaries. It also loads the BECOME files of earlier scenes, in order, and sends each `(ask (change-of c in s) make it so)`. That message:
  - changes the descriptions as above;
  - sets each `(choice-point-of c E)` current-choice and memorizes `(changed-in: s from OLD)`.
- Consequences, all through Ani's own code:
  - `(establish (personality c))` uses the new words (sugest.123:54-66);
  - the `faster` and `stronger` prerequisites read the new values;
  - the scene program's special dynamics carry them;
  - Director needs nothing new.
- A fresh-look value pass 2 cannot use, `(not X)` or `none`, is not applied to a movement element. The old value stays, and the change-of actor notes why (`not-applied:`). BETTER fixes these failures in general.
- The changing scene's own pass 2 loads its own BECOME file to define the change-of actor without applying it.

*In Stage 1 itself,* a `change` task yields only the value bridges described in Stage 2. Ken's option 1 is then complete: the character moves differently from that scene on.

**STAGE 2: PORTRAYING THE CHANGE (Ken's option 2).**

*The `change` verb.* `(define change action)`, with a `yield suggestions for (convey (change ?before ?after))` receiver. It returns three kinds of suggestion:
1. **The bridge.** For each movement element whose new value differs from the current one, a suggestion `(method: type display-value-change value (bridge-to: element (c E) new-value V speed S for (change-of c in scene)))`, strength high, source change. CHOMET accepts these wholesale, as it does joy's changes (chomet.123:463-472).
2. **The new self.** The new descriptors' own `(establish c D)` suggestions, and new `(become c D)` and `(cease c OLD)` suggestions (Stage 3). Ken: "method suggestions for conveying a personality change that would work essentially the same as ... establishing the personalities" (L4417-4420). They are instantiated by Ken's own `instaniate-convey-suggestions`, with the task bound in `:convey-task`. A wrapper on sugcon's `convey-suggestions` binds it and changes nothing else.
3. **A fallback.** `(wander-around c)`, strength low, so a lone change still shows.

*`bridge-to:`.*
- It is a child of display-method, not change-method. Its time therefore counts toward the subscene, and the subscene's stretch factor applies to it. This handles Ken's detail (g), "running-time estimates ignore ... gradual dynamics changes" (L4857-4860).
- All of a change's elements change together, over the time the largest factor needs: ideal = 5 s ÷ weightify(speed) × |ln F_max|, multiplied by the stretch.
- It runs as a new Director message, `(gradually change by F factor for E in N seconds)`, a copy of dichar.103:102-121 that takes a duration instead of a speed. The bridge therefore ends with its part, and the DICHAR/DISPLY speed inversion found by reading does not apply to it.
- Like `run-change-to`, it sets the element in the next subscene, so later parts of the scene start from the new value.

*The speed of the change* is Ken's "how fast the changes themselves should be" (L3372-3374):
- **low (gradual)** by default, because an abrupt change "could easily be misinterpreted" (L4415);
- **high** when the cause is described as magical, Ken's "occasionally ... instantaneous" (L4350-4351). This also gives MAGICAL its first use.

The choice and its reason are memorized on the change-of actor as `(rate: high because (magical fairy-godmother))`.

*`wander-around`.*
- Ken's name, defined both as a display method and as the action SCENE's `plan-something-if-only-changes` asks for when a first subscene holds only changes.
- It is modeled on Ken's own wandering for the Prince, make-guarding-more-interesting (disply.311:533-556), but without fitting the speed, because speed is one of the things changing.
- The character walks to `(good-distance-from (vicinity-of c))`, stopping when the part ends.
- A character with no place yet is placed where the last scene's POSIT left her, or in the middle (move-character insists on a previous position, place.45:151-180).

*`causes`.* `(define causes action)`, which EVIL (dscrp.17:167) and DOMINATES (relate.22:78) already name.
- `(causes A X)` in general yields X itself as a convey suggestion, so the effect is what is shown.
- When X is a change of another character C, it yields the display `(goes-to-and-transforms A C)`, strength high, plus C's bridges. This display is modeled on move-to-and-hits:
  - A and C are placed a medium distance apart;
  - A goes to contact with C;
  - then C's bridges and C's wandering start together. Ken: "after two characters come in contact they might change" (L4343-4345).
- If goes-to-and-transforms is among a subscene's methods, `bridge-to:`'s run does nothing and lets the transform run it after the touch, so the order Director runs methods in does not matter.
- If its prerequisite fails (C off stage), the bridges run alone. Ken's own rules then apply: wander, or extend the previous part.

*Participation.* A wrapper on `process-task-description` (scene.9:440) acts only when a description contains a change, so every 1978 task is handled as before:
- a stand-alone `(change ...)` task gets the character as its for-who (1978 would ask an actor named `(physical cinderella shabby)`);
- the changed character memorizes `scene-participation:`.

*Ken's cinderella-beautified,* uncommented, now plays:
- The godmother goes to Cinderella. Once they touch, Cinderella walks about. She has nothing to bridge, and the glass box says why.
- The two joy tasks extend that part, as Kept Apart's joy extends the standing guard.
- With item (1)'s APPEAR on, shabby and elegant gain appearance suggestions, the fresh look differs, and the bridges include appearance elements (Stage 4).

**STAGE 3: KNOWLEDGE AND DETAILS.**
- **A small `(become c D)` / `(cease c D)` knowledge base**, held as suggestions on the descriptors in Ken's `process suggestions` form and marked as ours:
  - ceasing to be shy: `(move-near-and-turn c <the others in the scene>)`, going up to each in turn, the opposite of avoids;
  - ceasing to be evil or mean, or becoming good or kind: `(accompanys c <enemy-of c>)`, going to the one she wronged and staying with her;
  - becoming strong: the bridge raises speed. Ken's "pushing a large object" waits for objects, which Ani lacks.
- **Relationship changes.** `(change (relationship (relationship-of a b) hates) (relationship (relationship-of a b) is-polite-to))`. A relationship description's type is the descriptor's own (char.2:165). It changes a, the relationship's first character.
- **Sequence-aware descriptions.** An establish task that follows a change in a `sequence:` reads the new words. Otherwise a scene's tasks all read the description as it was at the start, because RUN collects every suggestion before planning.
- **The page.** The pass-1 page gets a "fresh look after <scene>" column. The LLM prompt and checkTasks learn the two task forms.

**STAGE 4: WITH ITEMS (1) AND (2).**
- `bridge-to:`'s run asks the element's type for the Director form of a gradual change: `(ask normal-movement-element yield gradual change of E for c by F in N seconds)`. APPEAR answers the same message for appearance-element with item (2)'s look change: size and colors interpolated, a new shape all at once.
- REVIVE;CHANGE needs no edits for this. BECOME already records whatever elements pass 1 has.

**WHAT FOLLOWS FOR LATER SCENES.**
- **Descriptions:** new words.
- **Dynamics:** the changed character's values from the fresh look. The others keep theirs.
- **Choices that depend on the change:** prerequisites and best-whens (faster, stronger) and the generators that read relationships see the new state.
- **Positions:** as before, from POSIT.
- **Earlier decisions:** `from-scene` references see the change task's choices in MINI.
- Scene interaction stays one-way: an earlier scene does not foreshadow a later change. Ken calls this "one of Ani's bigger weaknesses" (L3444-3451). It is noted, not attempted.

**PIPELINE.** In `src/pipeline.js`:
- `EXTENSIONS.change = { file: "change" }`.
- `storyOutline` also returns `changes[scene]`, every `(change ...)` form.
- `storyPlan` names `KEN1;<fn1> BECOME` for each changing scene.
- New `pass1Again(fs, scene, {extensions, file})`: boot, DATEST, `(init-as-of 'scene)`, `(z)`, `(record-changes-of ...)`. It returns the choice points.
- `pass2` adds `(learn-who-they-have-become '(earlier fn1s) 'own-fn1)` to its `before` form, for Ken's scene list too.
- `glassBox` adds a `becomes` key only when the extension is on.
- `makeFilmSteps` adds the progress step "Pass 1 again: Ani takes a fresh look at the stepmother after Change of Heart". It costs about 20 s per changing scene, and its result goes to `run.becomes[scene]`.

**GLASS BOX.** In the `whyPanel` of a changed character, in the changing scene and every scene after it, a section headed "How she has changed":
- "In Change of Heart the Prince changed the stepmother from evil and mean to good and kind. Ani took a fresh look at her as if she were brand new (thesis p. 168) and chose again how she moves." This is followed by a table of elements, before → after, each with a why button opening `choicePointBox` on the fresh-look run's choice point (its suggestions, sources and conflicts).
- "A full recompute would also have changed the Prince: more deliberate. Ani keeps him as he was, because his description did not change."
- Lines for anything not applied, e.g. "pass 1 chose (not high); she keeps medium".

During the change itself:
- `caption` and `methodText`: "the Prince goes to the stepmother; once they touch, she begins to change", and "the stepmother slowly changes how she moves (acceleration high → medium, path curvature low → high, ...) over 6.4 seconds".
- The rate is explained: "gradually, because an abrupt change could be misread (p. 168)" or "quickly, because the fairy godmother is magical (p. 166)".
- An empty bridge says: "Ani finds nothing to change in how Cinderella moves: shabby and elegant suggest nothing about movement. The thesis says this scene is meaningless until Ani handles appearances (p. 166, note)."

In later scenes:
- `dynamicsTable` gives the source as "as Ani chose in her fresh look after Change of Heart (was high) [why?]".
- The plain-English description reads "the Prince changes the stepmother from evil and mean to good and kind".
- `prepScene` learns `(ask x gradually change by`, so a character who is only changing is not shown as having "no part in Ani's plan".
- `ACTIVITY`/`FAMILY` learn goes-to-to-transform and wandering.

**KEEPING 1978 EXACT.**
- "Ani as in 1978" never loads REVIVE;CHANGE.
- With CHANGE on, a description with no `(change ...)`, Ken's CINDY included, runs no pass-1 rerun, writes no BECOME files and loads none. The wrappers only act on change forms, and `glassBox` adds no keys.
- The new actors are reached only through change tasks. `causes` exists, but EVIL's and DOMINATES' causes suggestions are dropped before it is consulted, because their generators come back empty, as in 1978.
- So Cinderella with CHANGE on must be byte-identical to 1978: CP 102/102, the five programs, frames and events. It is checked by test, not assumed.
- Every addition passes Ken's legitimacy test (L4939-4954): it adds missing knowledge or attends to an obvious factor, and never removes or penalizes an option.

## Alternatives considered

- - **name:** A. In Lisp inside Ani: REVIVE;CHANGE, a pass-1 rerun per changing scene, BECOME files, and new methods (change, causes, bridge-to:, goes-to-and-transforms, wander-around). RECOMMENDED
- **why_not_or_why:** Every decision is made by Ani's own machinery, so the glass box can explain it with Ani's own records: suggestions, sources, choice points and methods. The rerun is literally Ken's "rederive ... as if the character were brand new". The in-scene methods follow his own patterns: the joy changes for display-value-change, move-to-and-hits for a two-part display method, and make-guarding-more-interesting for wandering. Passing results through files between jobs matches what RUN already does with POSIT and MINI. It fills holes Ken named but never wrote: causes, used by EVIL and DOMINATES; wander-around, used by SCENE's plan-something-if-only-changes; and change, from his cinderella-beautified scene. That is "obvious information that was lacking" (L4939-4944).
- - **name:** B. A JS layer around Ani: split the film at the change and run pass 1 twice from two text-edited CINDYs, filming later scenes from the second CP; optionally have JS write change-to: tasks into the scene
- **why_not_or_why:** This is only Ken's option 1, which he says "would not portray the personality change itself" (L4402-4406). JavaScript would be doing Ani's reasoning, so the glass box could not trace the change back to Ani's code. Editing CINDY text by substitution is fragile. It would also put the change after study-descriptor-use, which gives the wrong answers (see below). A's Stage 1 delivers the same "recompute" result, but Ani does the work.
- - **name:** C. A versioned character inside one pass 1 (an extra stand-in actor such as cinderella-elegant)
- **why_not_or_why:** A character offspring joins the cast through nodes.38:49, the siblings (char.2:41-46) and scene.9:214. Ani would then compare Cinderella with her own future self. The extra choice points shift the postponement order for everyone, so Cinderella's 102 choices would no longer match CP 29 with the extension on. Director would record the stand-in's segments under a new name, and the page draws only run.cast.
- - **name:** D. Recompute inside the pass-2 job, mid-scene
- **why_not_or_why:** It needs pass 1's machinery (CHOOSE, COSUG, POSTPO, NODES) loaded inside RUN's job, and it clashes with the (choice-point-of c E) actors already loaded from CP. Postponement would run again over all 102 choice points inside each scene. A separate job does the same computation in the 1978 way: one job per pass, passing files.
- - **name:** E. Apply the fresh look to everyone (all of Ani's recomputed choices)
- **why_not_or_why:** Verified: when the stepmother repents, the fresh pass 1 also makes the Prince more deliberate. When Cinderella stops being shy, the stepmother's, fairy godmother's and Prince's speeds all change, purely by comparison with her. Their descriptions did not change, the thesis treats them as permanent (L4395-4396), and unexplained changes in bystanders would be misread. So these knock-on changes are shown in the glass box as what a full recompute would also change, and are not applied. A switch to apply them could come later.
- - **name:** F. Portray the change with Ken's existing change-to: instead of a new bridge-to:
- **why_not_or_why:** Change methods are not counted in a subscene's time and are not stretched (scene.9:179-197), so a bridge may not finish before the scene ends. Also, from reading the code, DICHAR's gradual change takes 5 s × weightify(speed) per e-fold (dichar.103:110-113), while DISPLY's estimate assumes 5 s ÷ weightify(speed) (disply.311:1098-1103). A "high" change therefore runs four times longer than Ani planned. Fixing change-to: itself would alter Kept Apart and the Meeting, so that fix belongs in BETTER behind its own switch. The new bridge-to: is ours, so it can be right from the start.
- - **name:** G. Rewrite (causes A (change ...)) into (sequence: (convey (meets A C)) (convey (change ...))) when the scene is read
- **why_not_or_why:** (meets a b) on its own suggests move-to, which DISPLY never defines (a known pass-2 crash). A rewrite would also put tasks into the scene that neither Ken nor Ani wrote. Ken's own way to sequence inside one task is a composite display method (move-to-and-hits: go to, then hit), so goes-to-and-transforms follows that pattern.

## Changes, file by file

- - **file:** src/director/revive/change.lisp (new, REVIVE;CHANGE)
- **what:** The extension, with a header in the bridge's style ("This file is ours, not Ken's", thesis pp. 165-169) and evidence cited per change.
- Pass-1 side: the change accessors, find-changes, make-description-change, init-as-of and record-changes-of.
- Pass-2 side: the description-change actor and its (make it so); learn-who-they-have-become; the change and causes convey verbs; the display methods bridge-to:, goes-to-and-transforms and wander-around, with their time estimates, run receivers and wander-around's plan receiver.
- Director side: (gradually change by ?f factor for ?e in ?n seconds).
- Wrappers on process-task-description (scene.9) and convey-suggestions (sugcon.26), via +after-load and a saved expr; each acts only when a change form is present.
- Stage 3 adds the become/cease suggestions on shy, evil, mean, good and kind.
- - **file:** src/pipeline.js
- **what:** - Add an EXTENSIONS registry with a change entry, and boot(fs, {extensions}); this is the shared mechanism from the revival report.
- storyOutline also returns changes per scene; storyPlan gives each changing scene a becomeFile, KEN1;<fn1> BECOME.
- New pass1Again(fs, scene, opts).
- pass2's before form loads earlier BECOME files and makes them so; for Ken's own scene list too, which today skips the before form.
- glassBox adds a becomes key only when the extension is on.
- film() loads the extension so scene programs can use the seconds receiver.
- makeFilmSteps runs the 'pass1-again' step and returns becomes.
- - **file:** tools/run-pass1.mjs, tools/run-pass2.mjs, tools/run-scene.mjs
- **what:** Move them onto pipeline.boot and pipeline.recorder (as the revival report advises), then add an --extensions flag and an --again <scene> flag to run-pass1.
- - **file:** tools/check-1978.mjs (new, shared with the other items) and tools/check-change.mjs (new)
- **what:** check-1978: the golden check, with extensions off and again with change on, against CP 29, reports/pass2 and reports/film.
check-change: runs the fresh look and the stories below, and compares against reports/ext/change/ goldens.
- - **file:** test/change.test.mjs (new, in the fast npm test)
- **what:** Boot with extensions ['change'] and check:
- the file loads after the bridge;
- the actors exist;
- the change verb on a hand-made task and change-of actor gives bridge-to: only for differing, usable elements, with the rate rule;
- the seconds receiver multiplies a factor by F over the right number of ticks.
- - **file:** test/stories/change-of-heart.lisp (new), test/stories/socializing.lisp (new)
- **what:** Ken's cast and scenes plus the new scenes: one where the Prince causes the stepmother's change from evil+mean to good+kind, and one where Cinderella changes from shy to brazen; followed by a later scene that establishes the changed personality. The beautified test builds its CINDY at run time by uncommenting cindy.46:94-105, as the scratch script did; nothing under original/ is copied or modified.
- - **file:** reports/ext/change/ (new)
- **what:** Committed goldens: each story's BECOME files, the fresh-look choice points, the scene programs and the frame/event JSON.
- - **file:** app/film.template.html
- **what:** - whyPanel: a 'How she has changed' section.
- dynamicsTable: the source column says when a value comes from the fresh look.
- caption and methodText: cases for bridge-to:, goes-to-and-transforms, wander-around, change and causes.
- ACTIVITY and FAMILY: the new activities.
- prepScene: a regex for (ask x gradually change by.
- checkTasks: accept the change and causes forms when the switch is on, checking TYPE, WHO, that OLD is in WHO's description, and NEW's vocabulary.
- The description in plain English.
- Compare panel: list the fresh-look differences.
- saveRun: record extensions and becomes.
- - **file:** app/film/llm.js
- **what:** With the switch on, add the two task forms and one rule to the task list: "a character who changes for good: Ani bridges the gap in how X moves, and X moves the new way in later scenes".
- - **file:** app/film/save.js
- **what:** Film files carry extensions and becomes; a missing field means 1978.
- - **file:** tools/build-film-app.mjs, tools/build-source-app.mjs, tools/build-ani-bundle.mjs
- **what:** - codeIndex and the source viewer include src/director/revive/*.lisp.
- vocabulary() flags the words the change knowledge uses.
- build-ani-bundle also checks that a change story run from the bundle matches the same run from the project files.
- - **file:** app/pass1.template.html (Stage 3)
- **what:** A 'fresh look after <scene>' column beside each changed character's choices.
- - **file:** PLAN.md
- **what:** A Chapter X entry: what Ken proposed, the verified fresh-look results (shabby→elegant changes nothing; the knock-on changes; why the change must come before study-descriptor-use), the findings (wander-around undefined, the speed inversion between DICHAR and DISPLY, change-task participation), and the stages.

## Lisp sketch

```lisp
;;; -*-lisp-*-
;;; REVIVE;CHANGE: characters who change during a film (AI-TR-540 X.A.2-3, pp. 165-169).
;;; This file is ours, not Ken's. A change is a scene task, as in Ken's commented-out
;;; cinderella-beautified (CINDY 46): (change (physical cinderella shabby) (physical cinderella elegant)),
;;; alone or inside (causes fairy-godmother ...). A film description with no change runs exactly as in 1978.

(define-function find-changes (form)  ;;every (change ...) in a task description
 (cond ((atom form) nil)
       ((and (eq (first form) 'change) (= (length form) 3) (not (atom (second form)))) (list form))
       (t (mapcan 'find-changes form))))
(define-function change-type (change) (first (second change)))
(define-function change-who (change) (second (second change)))      ;;a character or (relationship-of a b)
(define-function changed-character (change) (let ((who (change-who change))) (cond ((atom who) who) (t (second who)))))
(define-function words-of (d) (cond ((and (not (atom d)) (eq (first d) 'and)) (rest d)) (t (list d))))
(define-function description-changes-in (scene)
 (mapcan (function (lambda (task) (find-changes (get (ask ,task recall your task) 'description))))
	 (ask ,scene recall your tasks)))

(define-function make-description-change (change scene)
 (let ((who (change-who change)) (type (change-type change)))
  (mapc (function (lambda (d)
	  (ask ,who forget items matching (description: type ? descriptor ,d source ?))
	  (ask ,who forget items matching (description: type ? descriptor ? source ,d)))) ;;eg graceful, told by beautiful
	(words-of (third (second change))))
  (mapc (function (lambda (d)
	  (ask ,who memorize (description: type ,(cond ((eq type 'relationship) (ask ,d recall your type)) (t type))
					    descriptor ,d source (change-in ,scene)))
	  (and (eq d 'beautiful) ;;as CHAR's demon does for an initial beautiful (char.2:13-20)
	       (ask ,who memorize (description: type movement descriptor graceful source beautiful)))))
	(words-of (third (third change))))))

;;; ---- pass 1 again: "recompute ... as if the character were brand new" (p. 168)
;; DATEST's init, with the changes made BEFORE study-descriptor-use (COMPAR 69) decides who is unique.
(defun init-as-of (scene)
 (setq :load-priorities '(tryout))
 (director-load 'cindy '(to define the film))
 (mapc (function (lambda (s) (mapc (function (lambda (c) (make-description-change c s)))
				   (description-changes-in s))))
       (scenes-up-to scene))   ;;SCENE's offspring are newest first
 (study-descriptor-use))

(define description-change something)

(define-function record-changes-of (scene file-name) ;;after (z), written the way save-answers writes CP
 (let ((file (open file-name 'out)))
  (mapc (function (lambda (change)
	  (let ((c (changed-character change)))
	   (dicks-print
	    '(define (change-of ,c in ,scene) description-change
		     (set your change to ,change)
		     (set your cause to ,(cause-of change scene))
		     (set your new-values to
			  ,(mapcar (function (lambda (e) (list e (ask (choice-point-of ,c ,e) recall your current-choice))))
				   (mapcan (function (lambda (type) (ask ,type recall your offspring)))
					   (ask element-types recall your types)))))
	    file))))
	(description-changes-in scene))
  (close file)))

;;; ---- later scenes: who they have become
(define-receiver (make it so) description-change
 (make-description-change (ask :self recall your change) (fourth :self))
 (mapc (function (lambda (e+v)
	 (let ((cp '(choice-point-of ,(second :self) ,(first e+v))) (new (second e+v)))
	  (cond ((and (ask ,(first e+v) are you a normal-movement-element) (not (weightifiable? new)))
		 (ask :self memorize (not-applied: ,(first e+v) ,new))) ;;eg (not high): WEIGHTIFY refuses it
		(t (ask ,cp memorize (changed-in: ,(fourth :self) from ,(ask ,cp recall your current-choice)))
		   (ask ,cp set your current-choice to ,new))))))
       (ask :self recall your new-values)))

;;; ---- the change itself: "compare ... before and after and then slowly bridge the gap" (p. 168)
(define change action)

(define-receiver (yield suggestions for {and ?task (convey (change ?before ?after))}) change
 (let ((change '(change ,before ,after)))
  (let ((c (changed-character change)) (change-of (change-of-in change)))
   '(!,(bridge-suggestions task change-of 'change)
     !,(new-self-suggestions c change)    ;;establish/become/cease suggestions, instantiated with :convey-task
     (suggestion: element ,task value (method: type display value (wander-around ,c))
		  strength low source change)))))   ;;"wander around so that the changes are apparent" (p. 126)

(define-function bridge-suggestions (task change-of source)
 (let ((c (second change-of)) (speed (rate-of-change change-of)))
  (mapcan (function (lambda (e+v)
	   (let ((e (first e+v)) (new (second e+v)))
	    (let ((now (ask (choice-point-of ,c ,e) recall your current-choice)))
	     (cond ((or (equal now new) (not (bridgeable? e))) nil) ;;APPEAR adds appearance-element
		   ((not (and (weightifiable? now) (weightifiable? new)))
		    (ask ,change-of memorize (not-bridged: ,e from ,now to ,new)) nil)
		   (t '((suggestion: element ,task
				     value (method: type display-value-change
						    value (bridge-to: element (,c ,e) new-value ,new
								      speed ,speed for ,change-of))
				     strength high source ,source))))))))
	  (ask ,change-of recall your new-values))))

(define-function rate-of-change (change-of) ;;"how fast the changes themselves should be" (p. 125)
 (let ((cause (ask ,change-of recall your cause)))
  (cond ((and cause (ask ,cause recall if any items match (description: type physical descriptor magical %)))
	 (ask ,change-of memorize (rate: high because (magical ,cause))) 'high)   ;;"occasionally ... instantaneous"
	(t (ask ,change-of memorize (rate: low because gradual)) 'low))))      ;;abrupt "could easily be misinterpreted"

(define bridge-to: display-method) ;;not a change-method: its time counts and it stretches (X.B.3 (g))

(define-receiver (estimate time for bridge-to: element ? new-value ? speed ?speed for ?change in ?subscene) bridge-to:
 (estimate-time-for-change-by (largest-factor-of change subscene) speed)) ;;all elements change together

(define-receiver (run bridge-to: element ?e new-value ?new speed ?speed for ?change in ?subscene stretched by ?factor) bridge-to:
 (cond ((transformer-of (first e) subscene))  ;;GOES-TO-AND-TRANSFORMS runs it once they touch
       (t (run-bridge-to e new (*$ factor (get (estimate-time-for-change-by (largest-factor-of change subscene) speed) 'ideal))
			 subscene))))

(define-function run-bridge-to (element new-value seconds subscene) ;;as DISPLY's run-change-to
 (let ((c (first element))
       (factor (//$ (weightify new-value)
		    (weightify (do-as-if-you-were subscene ,subscene yield most current value of ,element)))))
  (ask-if-exists (ask ,subscene recall your next-subscene) set your ,element to ,new-value)
  (ask ,subscene add (ask ,c to set your special-dynamics to ,(ask ,c yield your special-dynamics in ,subscene))
       to your list of initial-actions)
  (ask ,subscene add (gradually change by ,factor factor for ,(second element) in ,seconds seconds)
       to your list of (changes-for ,c))))

;; Director side: DICHAR's gradually change, over seconds Ani chose (dichar.103:102-121 takes
;; 5 s x weightify(speed) an e-fold, where DISPLY's estimate assumes 5 s / weightify(speed))
(define-receiver (gradually change by ?factor factor for ?element in ?seconds seconds %followup) director-character
 (let ((ticks (max 1 (round (*$ seconds (float :frames-per-second) (float :ticks-per-frame))))))
  (let ((rate (expt factor (//$ 1.0 (float ticks)))))
   (ask ,(ask :self recall your special-dynamics-for-current-scene)
	repeat (multiply your (,element factor) by ,rate) ,ticks times !,followup)
   (ask :self repeat (ask your special-dynamics to multiply your (,element factor) by ,rate) ,ticks times))))

;;; ---- causes (named by EVIL and DOMINATES, never defined)
(define causes action)

(define-receiver (yield suggestions for {and ?task (convey (causes ?who ?what))}) causes
 (cond ((and (eq (first what) 'change) (not (eq who (changed-character what))))
	;;"after two characters come in contact they might change" (p. 166)
	'((suggestion: element ,task value (method: type display value (goes-to-and-transforms ,who ,(changed-character what)))
		       strength high source causes)
	  !,(bridge-suggestions task (change-of-in what) 'causes)))
       (t '((suggestion: element ,task value (method: type convey value ,what) strength high source causes)))))

(define goes-to-and-transforms display-method   ;;as move-to-and-hits: go to, then do it
 (add prerequisite for (goes-to-and-transforms ? ?changed) (on-stage ,changed)))

(define-receiver (run goes-to-and-transforms ?causer ?changed in ?subscene stretched by ?factor) goes-to-and-transforms
 (initial-locations-for-goes-to-and-hits causer changed subscene)
 (ask ,subscene add
      (sequence: ,(move-character 'goes-to-to-transform causer '(contact-with ,changed by ,causer) 'moving-target
				  '(stop-when-there (quote ,subscene)) 0.0
				  (divide-speed-by-factor causer (sqrt factor) subscene) 'careful subscene)
		 (and ,(wander-plan changed subscene) !,(bridges-of changed subscene factor)))
      to your list of movements))

;;; ---- wander-around: SCENE's plan-something-if-only-changes asks for it (scene.9:218)
(define wander-around display-method)
(define-receiver (run wander-around ?c in ?subscene stretched by ?factor) wander-around
 (ask ,subscene add ,(wander-plan c subscene) to your list of movements))
(define-function wander-plan (c subscene) ;;as make-guarding-more-interesting (disply.311:533), without fitting the speed
 (place-if-not-located c subscene)
 (move-character 'wandering c '(good-distance-from (vicinity-of ,c)) 'stationary-target
		 '(stop-when-there (quote ,subscene)) 0.0 (special-dynamics-of c subscene) 'careful subscene))

;;; ---- only for change tasks: who it is for, and who takes part (scene.9:463 "what about other participents?")
(+after-load '|ken;scene >|
 '(progn (putprop 'process-task-description (get 'process-task-description 'expr) 'scene-9-expr)
	 (defun process-task-description (description scene source)
	  (cond ((find-changes description) (process-change-task-description description scene source))
		(t (funcall (get 'process-task-description 'scene-9-expr) description scene source))))))
(+after-load '|ken;sugcon >|   ;;the convey task, for the generators the new self's suggestions use
 '(progn (putprop 'convey-suggestions (get 'convey-suggestions 'expr) 'sugcon-26-expr)
	 (defun convey-suggestions (task-package task-name)
	  (let ((:convey-task task-name)) (funcall (get 'convey-suggestions 'sugcon-26-expr) task-package task-name)))))

// ---- src/pipeline.js (JS)
export function pass1Again(fs, scene, { extensions, file }) {
  const L = boot(fs, { extensions });
  L.evalString("(load '|ken;datest >|)");
  L.evalString("(setq :print-load-messages nil)");
  L.evalString(`(init-as-of '${scene})`);
  L.evalString("(z)");
  L.evalString(`(record-changes-of '${scene} '((ken1) ${file[0]} become))`);
  return { scene, choicePoints: collectChoicePoints(L) };
}
// in makeFilmSteps, after pass 1, when extensions include "change":
//   for (const s of plan.scenes) if (outline.changes[s.id]?.length) {
//     progress("pass1-again", `Pass 1 again: Ani takes a fresh look after ${title(s.id)}`, s.id); yield;
//     out.becomes[s.id] = pass1Again(fs, s.id, { extensions, file: s.file }); }
// in pass2's before form: (learn-who-they-have-become '(<earlier changing scenes' fn1>) '<own fn1 or nil>)
```

## Tests

- Golden 1978 (tools/check-1978.mjs, about 3 min). With extensions [], check that pass 1 equals CP 29 (102/102, same places), that the five programs are byte-equal to reports/pass2, and that every scene's frames and events equal reports/film/*.film.json. Make run-pass1.mjs exit non-zero on a mismatch.
- Conservative extension. Run the same golden with extensions ['change'] on Ken's CINDY 46 and require it to be byte-identical. Ken's CINDY has no change task, so no rerun, BECOME file, wrapper action or glass-box key may appear.
- Ken's scene in pass 1. With CINDY 46's cinderella-beautified uncommented at run time and the extension on, the first pass 1 still makes Ken's 102 choices, all unchanged (the scene's tasks exist in pass 1 but don't feed choices).
- Fresh-look golden (tools/check-change.mjs). Run (init-as-of scene) and (z) for each case and assert the changed character's absolute choices:
- evil+mean → good+kind: the stepmother's acceleration high→medium, deliberateness high→medium, path-length medium→long, path-curvature low→high, path-jaggedness medium→low, with the three attractions flipped;
- shy → brazen: Cinderella's speed low→medium;
- shabby → elegant: no change at all.
Also assert that the knock-on changes listed for the glass box are the Prince's deliberateness for the repentance, and the three speeds for Cinderella's change.
- Ordering guard. Assert that init-as-of makes the change before study-descriptor-use. Making it after init must give the different values recorded in PLAN.md (the stepmother slow, 10 knock-on changes), so a refactor that moves the change is caught.
- Fast Lisp tests (test/change.test.mjs, in npm test):
- REVIVE;CHANGE loads after the bridge, and its +after-load hooks fire.
- For a hand-made change-of actor, the change verb gives bridge-to: suggestions only for elements whose value differs and can be weightified.
- Rate is low by default and high with a magical cause.
- (make it so) sets the choice points, memorizes changed-in:, and refuses (not high).
- The seconds receiver multiplies (speed factor) by exactly F after round(N × fps × ticks) ticks.
- Bridge timing. In the change-of-heart story, the frame where the stepmother's speed factor reaches F must match Ani's estimate × stretch to within one frame, at 4 and at 24 frames a second. This shows the duration is honored, unlike change-to:'s inverted speed.
- End to end, change-of-heart.lisp:
- pass 2 of the changing scene chooses goes-to-and-transforms prince step-mother plus five bridge-to: methods;
- the film is non-empty, and the bridges start on the frame the Prince reaches contact;
- the later scene's program gives the stepmother the BECOME values in its special-dynamics;
- its (establish (personality step-mother)) collects good's and kind's suggestions, not evil's.
- Ken's cinderella-beautified, uncommented at run time:
- the scene now films more than 2 frames (the godmother goes to Cinderella, and Cinderella walks about);
- there are no bridges, and the change-of actor and glass box say why, citing the p. 166 note;
- the joy subscene extends the transformation as a parasite.
- Stand-alone change with only bridges in a first subscene (socializing.lisp): wander-around is planned through SCENE's plan-something-if-only-changes without NO-SUCH-ACTOR, and Cinderella is placed and moves.
- Participation. A stand-alone (convey (change ...)) task gets the character as its for-who, and the changed character memorizes scene-participation: for the scene. Neither happens for any 1978 task.
- Page (tools/check-film-app.mjs). With the switch on, run change-of-heart in the page and check:
- frame counts match Node;
- the stepmother's why panel shows 'How she has changed', with before/after rows whose why buttons open the fresh-look choice point;
- later scenes' dynamics table says 'as Ani chose in her fresh look';
- checkTasks accepts the new forms only when the switch is on;
- a saved film file and a reload keep extensions and becomes.
- Bundle completeness. build-ani-bundle also runs change-of-heart from the bundle and from the project files and compares the two.

## Risks

- Order sensitivity, verified. The change must be made before study-descriptor-use (compar.69:127). Made after DATEST's init, it gives different and wrong values. A test guards this.
- Knock-on changes to other characters. A fresh look would also change their values purely by comparison: the repentance makes the Prince more deliberate, and Cinderella losing her shyness changes three other speeds. The design keeps the others fixed and shows what a full recompute would have changed. Ken may prefer otherwise, and that can become a switch later.
- Pass 1 again costs about 20 s per changing scene, in Node and in the browser. In the claude.ai chat artifact, which runs on the page, that is another unresponsive step.
- A fresh look meets the known new-story failures more often: (not X), none, friend-of asking undefined relationships, and generators that ignore scene participation. CHANGE avoids applying values pass 2 can't use, but the real fixes belong in BETTER, and the new-self suggestions (friendly's helps, gives and accompanys) will exercise friend-of and is-not.
- The speed inversion between dichar.103:110-113 and disply.311:1098-1103 was found by reading the code, not by a run. bridge-to: avoids it with its own seconds receiver. Ken's change-to: is left as in 1978, and fixing it would change Kept Apart and the Meeting, so it belongs in BETTER behind its own switch.
- When a later subscene holds only changes, Ken's extend-last-actions-of reruns the previous subscene's methods with more time. That reruns goes-to-and-transforms and stretches its go-to and bridge (for example, when the joy tasks extend the transformation). This needs checking on the beautified scene.
- wander-around needs a starting place. move-character refuses a character with no previous position (place.45:151-180). A character never on stage before needs explicit placement, which is new code in PLACE's idiom.
- Physical changes are invisible until items (1) and (2) exist. Verified: shabby→elegant changes none of the 102 choices. The beautified scene therefore shows only the godmother's visit and Cinderella walking until APPEAR supplies appearance elements and the look-change hook.
- Within the changing scene, every task reads the description as it was at the scene's start, because RUN collects all suggestions before planning. Sequence-aware descriptions are Stage 3. Until then, establishing the new personality belongs in the next scene.
- Page assumptions: checkTasks, vocabulary(), the llm.js task list, caption/methodText, prepScene's regexes, ACTIVITY/FAMILY and codeIndex must all learn the new names, and only when the switch is on.
- Saved runs and film files without extensions and becomes fields must be treated as 1978, or restored runs will be mislabeled.
- Name truncation: change.lisp becomes REVIVE;CHANGE, and BECOME is a six-character second name; both are fine. Any new REVIVE file must stay unique within six characters.

## Effort

About 7 working days, in stages. Each stage ends with something to look at and leaves the 1978 golden green.
- Stage 0 (shared with items 1, 2 and 4), 0.5 day: the extensions switch in pipeline, worker and page; tools/check-1978.mjs.
- Stage 1, the fresh look and who they have become (Ken's option 1), 2 days: init-as-of, record-changes-of, BECOME files, (make it so) in later scenes, pass1Again in the pipeline, the 'How she has changed' glass box and dynamicsTable provenance, the fresh-look goldens. At the end, a repentant stepmother moves differently from the scene after her change on.
- Stage 2, portraying the change (option 2), 2 days: the change and causes verbs, bridge-to: with the seconds receiver, the rate rule, goes-to-and-transforms, wander-around, the participation wrapper, captions, change-of-heart and the beautified scene end to end, the bridge timing test.
- Stage 3, knowledge and details, 1.5 days: become/cease suggestions, relationship changes, sequence-aware descriptions, the pass-1 page column, the LLM prompt and checkTasks.
- Stage 4, with APPEAR (after items 1 and 2), about 1 day: the element-type dispatch for appearance bridges, which makes Ken's beautification meaningful.

## Thesis references

- AI-TR-540 X.A.3 'Changing Descriptions', pp. 168-169 (L4380-4423): shy characters socialize, evil characters repent (L4389-4391); 'assumed to be permanent' (L4395-4396); 'minor change ... recompute ... as if the character were brand new' (L4396-4402); 'compare ... before and after ... slowly bridge the gap' (L4411-4413); 'could easily be misinterpreted' (L4415); 'decide how long it should take' (L4416-4417); method suggestions for conveying a personality change (L4417-4423)
- X.A.2 'Changing Appearances', pp. 165-167 (L4322-4377): contact then change (L4343-4345); fairy godmother, shabby to elegant (L4346-4348); instantaneous vs gradual (L4350-4353); footnote: the scene was deleted as 'meaningless until Ani is extended to handle appearances' (L4354-4355)
- VI, dynamics-change methods, pp. 125-126 (L3370-3393): 'how fast the changes themselves should be'; changes 'cannot stand alone'; extend the previous activity; otherwise 'wander around'
- X.B.3 (g), p. 184 (L4857-4860): running-time estimates ignore gradual dynamics changes
- IV comparison and uniqueness summaries (L2565-2619), invalidated by a change (the knock-on changes)
- VI.D (L3444-3451): scene interaction is one-way, 'one of Ani's bigger weaknesses'
- X.C legitimacy rule (L4939-4954): add obvious missing information; never remove or penalize an option to force an outcome
- cindy.46:94-105 (Ken's commented-out cinderella-beautified scene, with its cause and change forms)
- dscrp.17:161-167 (EVIL suggests causes); relate.22:72-78 (DOMINATES suggests causes); dscrp.17:214, 289 (shabby and elegant: bare, opposites only)
- scene.9:216-221 (plan-something-if-only-changes calls the undefined wander-around); scene.9:440-467 (process-task-description, for-who, participation); scene.9:159-197 (change methods not timed or stretched)
- compar.69:127-136 (study-descriptor-use) and datest.56:4-8 (init): where the change must go
- disply.311:1042-1130 (change:, change-to:, run-change-to, estimate) and dichar.103:102-121 (gradually change): the speed inversion
- disply.311:113-167 (move-to-and-hits, the model for goes-to-and-transforms); disply.311:533-556 (make-guarding-more-interesting, the model for wander-around)
- chomet.123:200-211, 463-472 (display-value-change suggestions accepted wholesale); sugcon.26:15-79 (convey chaining); sugest.123:54-66 (establish personality reads description items)
- run.65:31-56 (RUN loads CINDY, CP and MINI, then to-do-before-running); scene.9:265-275 (yield most current value of)

## The review

**Verdict:** sound with fixes  
**Fidelity:** 4  
**Feasibility:** 3  
**Value:** 4

### Errors found

- The on-stage fallback can never happen. on-stage is a dummy prerequisite with no status-of demon (prereq.19:66). prerequisite-score treats a missing status as a pass (chomet.123:363-372), and initial-locations-for-goes-to-and-hits puts both characters on stage anyway (disply.311:162-167). So 'If its prerequisite fails (C off stage), the bridges run alone' never occurs. Giving on-stage a demon would also change 1978, because meets carries (on-stage b) (convey.64:66).
- wander-around does not 'stop when the part ends'. stop-when-there makes a plain arc-stop-condition that stops when she arrives (dichar.103:465-468). Ken's make-guarding-more-interesting fills the part only because it fits the speed to the subscene's running-time (disply.311:536-546). Without that fit, the wander ends whenever she gets there, possibly long before the bridge does.
- record-changes-of in the sketch does (mapcan ... (ask ,type recall your offspring)). recall returns the stored list itself: probed, (eq (ask normal-movement-element recall your offspring) (ask normal-movement-element recall your offspring)) => T. So mapcan's nconc adds the three attraction elements to normal-movement-element's offspring. char.2:58-68 then builds special dynamics that include attractions, and weightify fails on (positive high) (interf.149:899-904).
- The shy->brazen knock-on list is incomplete. Rerunning the scratch script change-p1c.mjs also gives the fairy godmother's attraction-towards-enemies (positive medium)->(positive low) and the Prince's (positive low)->(negative high), besides the three speeds. Alternative E, the glass-box text and the fresh-look test ('the three speeds for Cinderella's change') all under-report.
- The bridge-timing test measures 'the stepmother's speed factor', but her speed does not change in change-of-heart: it is HIGH in CP 29 and in the evil+mean->good+kind fresh look. The elements that change are acceleration, deliberateness, path-length, path-curvature and path-jaggedness. Also, the recorder's CLICK stores only the special-dynamics name, not its factors (pipeline.js:139-149).
- Acceleration and deliberateness are never read by Director or by pass 2. Director reads speed, path-curvature, path-length and path-jaggedness (dichar.103:165-169). Pass 2 reads rhythmic-level, activity-level and repetiveness only for cycle counts (place.45:416-420). Thesis X (f), L4853-4856, says deliberateness should affect movement but doesn't. The attractions are read nowhere outside pass 1 (their only other mention is nodes.38:102). So 2 of the 5 repentance bridges are invisible, the 3 attraction flips change nothing on screen, and an invisible element can set the bridge's length (|ln F_max|).
- 'Fixing change-to: itself would alter Kept Apart and the Meeting' is incomplete. The 1978 programs also have non-medium gradual changes in Introduction (1.125 at LOW, ken-introd.uction) and Justice (HIGH and LOW, ken-just.ice). change: shares run-change-to and estimate-time-for-change-by (disply.311:1057, 1123-1130). Line references are also off: DICHAR's 5 s x weightify(speed) per e-fold is dichar.103:105-109, not 110-113, and DISPLY's 5 s / weightify(speed) is disply.311:1104-1106.
- The REVIVE;CHANGE file does affect 1978 jobs when it loads. Probed: in a film job, after (load ken;aninit), top-level definitions under action, display-method and director-character autoloaded KEN1;PROP, KEN;CONVEY and KEN;DISPLY, files the 1978 film job never loads. The same happens in pass 1's DATEST job. So 'Cinderella as Ken wrote it does not trigger any of the new code' and 'reached only through change tasks' are false at load time. bridge.lisp avoids this with +after-load on each owning file (bridge.lisp:137-140, 221, 246, 262, 294, 320).
- Thesis attributions. (g) at L4857-4860 is on p. 186, not p. 184 (p186 starts at L4842). (g) says display-method estimates ignore concurrent gradual dynamics changes, i.e. a walk's estimate ignores that its speed is changing meanwhile. Counting bridge-to:'s own time does not address that: the wander and goes-to estimates still ignore the bridge. 'Could easily be misinterpreted' (L4415) is on p. 169, not p. 168 as the glass-box caption says. L4350-4353 never links instantaneous change to magic, so the magical rule is ours. Rate 'high' is 2.5 s per e-fold (disply.311:1104-1107), which is not Ken's 'in one frame'. L4343-4345 is about two characters changing shape to show they are communicating, not about one character transforming another.
- Stage 3: move-near-and-turn walks to near the center of the others and then turns to face each in turn (disply.311:965-990). It does not go up to each in turn.
- 'test/change.test.mjs (new, in the fast npm test)': npm test runs node --test "test/*.test.js" (package.json:7), so a .mjs file is never run.
- 'The order Director runs methods in does not matter': methods are run by Ani's pass-2 subscene 'run your methods' (scene.9:159-183), not by Director.

### Gaps

- Stage 1 cannot ship without Stage 2 parts. A stand-alone (convey (change ...)) crashes at CINDY load in every job, because scene.9:461-465 asks the actor (personality cinderella shy) to memorize scene-participation. The process-task-description wrapper must come first. Stage 1's change task is also said to 'yield only the value bridges', which need bridge-to: and the Director seconds receiver from Stage 2.
- A task gets one display method. choose-a-display-method sets current-choice to a single display method (chomet.123:225-231), and only display-value-change suggestions are added on top (chomet.123:463-472). goes-to-and-transforms, wander-around and any new-self display method (kind or good -> accompanys -> goes-to-and-accompanys) compete for that one slot. So 'the Prince goes to her, then she wanders' and 'the new self is shown' cannot all happen in one task, and the end-to-end test that expects goes-to-and-transforms to be chosen is not guaranteed.
- The timing model for a sequential method is wrong. goes-to-and-transforms runs walk then bridge, but maximum-ideal-time-of takes the max over methods (scene.9:185-197), and bridge-to: also counts its own ideal. The stretch factor is therefore computed for max(walk, bridge), not walk + bridge. Director waits for every change action before ending the part (action.152:41-43), so the part overruns. The bridge-timing test must also measure from the contact frame.
- The wander-around path through plan-something-if-only-changes is unworkable as sketched. plan your actions does (ask wander-around make interned offspring) and then (plan wander-around c in s) (scene.9:207-210), so it needs a plan receiver that returns a plan, as walk and hit have (disact.7:14-37). director-subscene only defaults movements to all plans when no movements were set (action.152:45-48), so the wander plan never runs if anyone else in the part has an activity. The change verb's own low-strength wander-around display suggestion would normally be chosen first, so socializing.lisp would not reach SCENE's path at all.
- The sketch is missing estimate receivers for wander-around and goes-to-and-transforms. get-estimated-time-of calls shouldnt-happen without them (chomet.123:448-460), and ideal-time-for-task needs them too (chomet.123:95-115). Also undefined: scenes-up-to, bridgeable?, weightifiable?, largest-factor-of, transformer-of, bridges-of (which must also do run-bridge-to's next-subscene set and initial-actions), change-of-in, cause-of, place-if-not-located, new-self-suggestions and process-change-task-description. A causes check of (first what) breaks when what is an atom.
- The fresh look is inconsistent with the cast on screen. The changed character's values come from a full recompute in which everyone else moved too (shy->brazen: the stepmother went to medium and the godmother to high while Cinderella got medium), but those others are then put back. Her relative-derived choices were made against a cast that never appears. Ken's 'as if the character were brand new' (L4400-4402) is more literally: rederive only her choices with the others fixed. Nodes and choice points have a 'completed' status that make-choices respects (chocho.19:36, 64).
- A relationship change drives relative suggestions for both characters. Recording only a, the first character of (relationship-of a b), drops b's direct consequences, which are not comparison knock-ons.
- Sequence-aware descriptions (Stage 3) ignore collection order. A scene collects establish tasks' suggestions before convey tasks' (scene.9:23-26), so an establish task that follows a change is collected before the change task is processed. It needs a temporary description swap at collection time, not sequence order.
- Glass box. For runs other than 1978, choicePointBox says 'Made in your version's pass 1.' (film.template.html:1312-1330), which mislabels fresh-look choice points. dynamicsTable currently says 'changed for this scene (pass 1 chose X)' (film.template.html:1302-1303) and would misexplain BECOME values. Attractions never appear in dynamicsTable (special dynamics hold only normal-movement elements, char.2:68). The 'How she has changed' table needs to say which changes Director cannot show.
- Bridges interact with walks that install their own special dynamics (divide-speed-by-factor and multiply-speed-by-factor make offspring dynamics). DICHAR multiplies whatever dynamics are current each tick and relies on a demon (dichar.103:112-121). Whether the bridge's progress survives a walk's set-your-special-dynamics needs a probe.
- +after-load hooks fire on every load of the file and immediately if it is already loaded (io.js:168-175, interp.js:494-501). Loading REVIVE;CHANGE twice, which three jobs plus tests make likely, would save the wrapper as 'scene-9-expr' and recurse forever.
- The ordering-guard test checks against values 'recorded in PLAN.md', which are not in PLAN.md yet. The test also pins a wrong approach rather than the right one.

### Fixes

- Split change.lisp into +after-load blocks keyed on each owning file, as bridge.lisp does: the pass-1 parts after ken;datest, the verbs after ken;convey, the display methods after ken;disply, the seconds receiver after ken;dichar, and the wrappers after ken;scene and ken;sugcon. Guard each wrapper with a 'done' property. Add to check-1978 an assertion that L.loadedFiles is identical with the extension on and off for CINDY 46.
- In record-changes-of and anywhere else that lists elements, replace mapcan over offspring with (apply 'append (mapcar ...)), or copy each list first.
- Bridge only elements Director reads: speed, path-curvature, path-length and path-jaggedness. Compute the bridge length from those. Record acceleration, deliberateness and the attractions in BECOME but present them in the glass box as 'chosen again; Director does not use it, as in 1978' (cite thesis (f), L4853-4856).
- Fix the facts in the tests. Shy->brazen has five knock-ons (three speeds and two attractions). The bridge-timing test should use path-curvature (factor 4 for evil+mean->good+kind), measured from the contact frame, with factors recorded either by a Lisp probe or by adding (ask sd yield your E value) to the recorder.
- Re-stage the work. Stage 1 must include the process-task-description wrapper, plus either a no-op change verb or the bridge-to: and seconds receiver. The page must refuse change forms while the switch is off (checkTasks and llm.js).
- Time model: give goes-to-and-transforms an estimate of time-to-walk to contact plus the bridge ideal, summed the way move-to-and-hits sums overhead and cycles (disply.311:116-126). Make bridge-to: estimate 0 when a transformer is among the subscene's methods, so the stretch factor covers the whole sequence.
- Resolve the one-display-method limit explicitly. Either fold the cause and the wander into one display method (goes-to-and-transforms, or for a stand-alone change a 'changes-while-wandering' method) and move new-self suggestions into the next scene or a separate task, or score them and document which wins. Make the end-to-end test assert the scored choice, not an assumed one.
- wander-around: end the wander with Ken's (stop-if-either-wants-to (stop-after-so-many-seconds T) (stop-when-there ...)) pattern from goes-to-and-accompanys (disply.311:206-212), or fit the distance instead of the speed. If plan-something-if-only-changes is kept, define a display-action receiver (plan wander-around ?c in ?s) that returns a plan and also adds it to the subscene's movements. Otherwise drop the change verb's own wander suggestion so SCENE's path is actually exercised.
- Drop the on-stage fallback text; do not add an on-stage demon, because it would change 1978's meets scoring.
- Try the literal 'brand new' fresh look before adopting the filter. After init-as-of, load the story's CP, mark the other characters' nodes and choice points completed, reset only the changed character's absolute choice points and her relative ones, then run (z). If the clamped run works, alternative E's knock-on bookkeeping goes away and her values fit the cast on screen. Keep the full recompute only as a glass-box comparison.
- For relationship changes, record and apply both characters of (relationship-of a b), and label the second as 'changed by the relationship', not as a knock-on.
- Correct the citations: p.169 for 'misinterpreted', p.186 for (g). Present the magical->fast rule as ours. Either make a magical change truly instantaneous (set the element in the next subscene with no gradual change) or caption it 'quickly'. Quote L4343-4345 accurately.
- Rename the fast test to test/change.test.js. In alternative F, change 'Kept Apart and the Meeting' to 'Introduction, Kept Apart, the Meeting and Justice' and correct the dichar and disply line references.
- Implement sequence-aware descriptions as a temporary description swap: memorize the new words, collect the establish task's suggestions, then restore. Otherwise defer it, and say the new personality is established from the next scene on.
- Glass box: give choicePointBox a source argument and caption fresh-look choices 'Ani's fresh look after <scene>'. Add provenance to dynamicsTable before Stage 1 ships, so BECOME values are not explained as 'changed for this scene'.
