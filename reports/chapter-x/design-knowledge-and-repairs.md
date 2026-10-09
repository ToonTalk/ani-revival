# Item (4), a bigger and better knowledge base: REVIVE;MEND, REVIVE;SLIPS and REVIVE;KNOW, written in Ani's own Lisp and switchable

*One of four designs behind [PLAN.md](PLAN.md), written by a design agent on 9 October 2026 and then reviewed adversarially. Where the review below finds an error, the plan's corrected version is the one to follow.*

## Summary

I recommend putting every change inside Ani, written the way Ken wrote his own files, in three switchable REVIVE files. MEND repairs the failures new stories hit ((not X), none, unknown words, missing relationships, the missing move-to, characters who aren't in the scene) and leaves Cinderella's run identical, byte for byte. SLIPS corrects slips in Ken's files, which does change Cinderella. KNOW adds knowledge Ken could have added (new words, helps, avoids, follows, pride and other feelings) without changing any of Cinderella's 102 pass-1 choices. A golden test pins the 1978 run with extensions off and with MEND on, every change cites its evidence, and the glass box marks every revival suggestion and every repair that changed what Ken's code would have done.

## The design

PRINCIPLE AND CLASSIFICATION

Every change for item (4) lives in its own REVIVE file. Each file names its kind and declares whether it changes Ken's Cinderella. Ken's own legitimacy test is the acceptance test for each change: "add obvious information that was lacking or was too inaccurate", or "take factors into consideration that obviously should have been" (L4939-4944). Nothing may remove or penalize an option to force an outcome, which Ken calls "cheating" (L4952-4954).

Repairs to 1978 limits:

- REVIVE;MEND (src/director/revive/mend.lisp): repairs for paths Cinderella never reaches.
  - Contract: with MEND loaded, Cinderella's CP, programs, frames, events and glass.json are byte-identical to 1978.
  - A repair leaves a note only where it changed what Ken's code would have done (or crashed on).
- REVIVE;SLIPS (slips.lisp): corrections of evident slips in Ken's files. These do change Cinderella; each one quotes the line it corrects.

Knowledge Ken could have added:

- REVIVE;KNOW (know.lisp), a loader of five files, each read after the Ken file it extends and written in that file's idiom:
  - KNOWDS after DSCRP;
  - KNOWRL after RELATE;
  - KNOWCV after CONVEY;
  - KNOWDI after DISPLY;
  - KNOWEM after EMOTE.

  Contract: Cinderella's pass 1 stays CP 29, 102 of 102 in place. All of KNOW's effects on Cinderella are in pass 2, where Ani now pulls off things she decided in 1978 but couldn't do.
- REVIVE;DETAIL (detail.lisp, last stage): a few of the "myriad details" of B.3.

All names are 6 characters or fewer and stay unique after ITS truncates them. Load order is fixed by the registry, whatever order the list is given in: MEND, SLIPS, KNOW, DETAIL. SLIPS, KNOW and DETAIL require MEND.

STAGE 0: THE SWITCH (shared with the APPEAR and CHANGE designs)

src/pipeline.js:

- `export const EXTENSIONS = { mend: {file:"mend", group:"repair", changes1978:false, about:...}, slips: {...changes1978:true, requires:["mend"]}, know: {group:"knowledge", changes1978:true, requires:["mend"]}, detail: {...} }`.
- `boot(fs, { backtrace, extensions = [] })` loads `(load '|revive;<file> >|)` for each extension, in registry order, after the bridge.
- pass1, pass2, film and makeFilmSteps take `extensions` and pass the same list to all three steps. Director needs MEND's weightify guard, and DETAIL works in Director.
- With `[]`, boot is exactly today's.
- glassBox adds a `repairs` key (the actors listed in the Lisp global `:revival-noted`) only when extensions are non-empty, so the 1978 glass.json keys are unchanged.

tools:

- tools/run-scene.mjs, run-pass1.mjs and run-pass2.mjs move onto pipeline.boot and pipeline.recorder first, so the two boots can't drift.
- run-pass1 exits non-zero on a CP 29 mismatch.
- build-source-app lists every revive/*.lisp file.

The page:

- A segmented control next to the frame-rate switch: "Ani as in 1978 / Ani with the revival's extensions".
- Under it, a closed "Which extensions" details element with grouped checkboxes:
  - Knowledge Ken could have added: words, ways of showing, feelings (KNOW); details (DETAIL).
  - Repairs to 1978 limits: repairs for new stories, which leave Cinderella unchanged (MEND); corrections of slips in Ken's files, which change Cinderella (SLIPS).
- Stored under its own localStorage key, with every access in try/catch.
- "Make the film" is enabled when only the switch changed.
- RUN_KEY, saveRun and film files record `extensions`; a missing field means 1978. The run label says which extensions were on, and so does the compare panel ("Two runs of one story: 1978 and with repairs and knowledge").
- When a run in 1978 mode stops with a known failure, the page explains it in plain English from PLAN's findings. Examples: WEIGHTIFY on (not high); NO-SUCH-ACTOR in variety-score or for a word. It offers "Make it again with the revival's repairs".

STAGE 1: REVIVE;MEND, repairs that change nothing Cinderella reaches

M1. A choice is one value (pass 1).
- The problem: COSUG's absolute-three-value returns (not X) when two values remain (cosug.215:395-402), and record-choice stores it (choose.198:596-603). WEIGHTIFY accepts only low, short, medium, long and high (interf.149:899-904).
- The repair wraps record-choice. If the value is (not X) and the element has possible-values, the film's variety level picks between the two values left, with GLOSUG's own pick-value-with-variety (glosug.41:61-74), exactly as it picks among three. The choice is recorded with source (and <old sources> (variety level)), and the note (revival-repair: what narrowed was (not high) now medium because (variety level)) goes on the choice point.
- Evidence: "Ani must choose a value and only one" (L2787); an element "has only one value which is selected from a small set" (L2849).
- CP 29 contains no (not X) (checked: 51 different-from, 14 medium, 11 high, 9 low, ...), so Cinderella can't be affected.

M2. Giving up means moving as usual (pass 2 and Director).
- Pass 1 records none, with source given-up (choose.198:61-73), and Ken meant it: no last-ditch default for "typical speed" (choose.198:292-293).
- INTERF already reads a never-set element as medium: (or (ask :self recall your v) 'medium) (interf.149:846).
- The repair: a +after-load on KEN;CP (pass 2) sets each normal-movement choice point whose value is none to medium and notes it. A weightify wrapper maps none to medium as a guard in Director.
- The same hook re-narrows any (not X) left in a CP made without MEND (an old saved run), using the variety counts rebuilt from the loaded choices, which is what record-choice counted.
- The CP file itself keeps Ani's honest none.

M3. A word Ani doesn't know suggests nothing (pass 2).
- establish-personality-suggestions asks each descriptor (sugest.123:54-66). An unknown word, such as "grumpy", stops pass 2 with NO-SUCH-ACTOR.
- The repair wraps it to skip descriptors that don't exist and to note the word on the task. Ani already passes over an unknown emotion this way (ask-if-exists, sugest.123:38).
- Thesis: "If parts are missing Ani manages to go on rather than stop" (L2733-2737).
- The stress story test/stories/stress-unknown-word.lisp finds any other place that stops.

M4. Asking about a relationship that doesn't exist.
- friend-of runs first-sibling-that-satisfies-relationship with likes, then the likes demon, then meet-description-of, which asks (relationship-of a b) without checking that it exists (prereq.19:57-60, 110-120).
- The repair guards meet-description-of with exists?, so the answer is 'dont-know, and notes it on the task whose suggestion is being bound.
- Ken's own enemy-of and stranger-of already guard this way (sugest.123:352-353, 385-394).

M5. Methods Ani names but Ken never wrote.
- CONVEY shows (meets a b) by (move-to a (vicinity-of b)) (convey.64:73-80). DISPLY has no move-to, and variety-score asks the missing actor for its tasks-used-in (chomet.123:436-439). Note that get-estimated-time-of does check exists? (chomet.123:450).
- The repair has two parts:
  - (a) Wrap score-suggestions so that a suggested display method that doesn't exist is rejected through Ken's reject-suggestion, with reason (no-such-display-method X), as an unconveyable convey method is (sugcon.26:69-74).
  - (b) Write move-to from DISPLY's own parts. It works like move-small-part-towards but goes all the way: place-medium-distance-apart, then move-character to (vicinity-of b) as a moving target, stopping there.
- Thesis: "Among the prerequisites for X going to meet Y is that Y be on stage. X need not be on stage since it can come on and then meet Y" (L2392-2396). So an off-stage Y is brought on with M6b.
- This is a repair because it completes a reference Ken made. KNOW doesn't need to touch meets.

M6. Characters in the scene first, and bringing on those who aren't.
- (a) Look in the scene first.
  - The problem: stranger-of, friend-of and enemy-of take the first sibling that fits, anywhere (sugest.123:349-395). Ken: "of course first is a stupid way of doing it" (329). His is-not means to look among those "part of the scene" (333).
  - The repair wraps character-that-satisfies to bind :generator-scene to the real scene (SCENE's tasks pass themselves as the scene, scene.9:373-381) and :generator-task to the task.
  - The three loops are re-run with Ken's own 6-line bodies over the in-scene siblings first. If no one in the scene fits, the 1978 answer stands.
  - The note is written only when the answer differs from 1978's.
  - Cinderella, checked: friend-of(cinderella) finds no one she likes in the Introduction (the stepmother's relationship is is-obedient-to and is-tolerant-of), so the Prince is picked as in 1978. enemy-of(step-mother) gives Cinderella, who is in the scene. stranger-of finds no one.
- (b) Bring them on.
  - The problem: in a new story an off-stage victim never comes on, and the scene never ends (PLAN.md).
  - The repair wraps the run receivers of move-to-and-hits, chases-to and pushes-around (define-extension-method plus ask-old). After Ken's placement, if the other character starts the subscene off the stage, Ken's own getting-on-stage step is added as goes-to-and-accompanys does it (disply.311:192-209): move-character to (on-stage-near other (vicinity-of mover)), stationary, careful, starting at 0.
  - "Off the stage" means the start place is one of PLACE's ...-and-offstage places, or the xy is outside |x|, |y| > .5 (INTERF's keep-on-stage test, interf.149:111).
  - In Cinderella every hit, chase and push victim starts on stage, so nothing is added. The MEND golden test proves it.

MEND also relaxes two rules in the LLM prompt, and only when it is on: 'define EVERY pair' becomes a recommendation, and 'let only characters who pick on someone hate' goes. (convey (meets X Y)) is added to the task forms, checkTasks and llm.js.

STAGE 2: REVIVE;KNOW, words and relationships (KNOWDS, KNOWRL)

The rule that keeps CP 29: new words linked (as neighbor or opposite) to any word CINDY uses carry no dynamics suggestions of their own; words with their own suggestions link only to words outside CINDY. A test enforces it. Physical words for appearance (beautiful, pretty, shabby, magical, ugly, elegant) belong to APPEAR, not KNOW.

KNOWDS, written as DSCRP, with a ';;why:' comment citing evidence above each form:

- Borrowing words, linked to Ken's words with no suggestions of their own: timid and bashful (neighbors of shy), wicked (evil), cruel and nasty (mean), greedy (selfish). Ken's neighbor source (cosug.215:41-65) already gives them their neighbor's value suggestions in pass 1.
- Words with their own suggestions:
  - gentle and rough (opposites): slow, low acceleration and smooth paths, against fast, high acceleration and jagged. Michotte: "slow motion conveyed gentleness", "rapid movement gives an impression of violence" (L4189-4190, L2821).
  - nervous and calm: path-jaggedness high and deliberateness low, against the reverse. Michotte: "sudden and repeated changes in direction ... nervousness or agitation" (L4191).
  - cheerful and gloomy: activity-level and rhythmic-level high and path-curvature high, against low activity and speed. These are emote.9's own joy changes as a lasting personality.
  - clever: deliberateness high. The thesis names clever as easy to add (L662).
  - brave and cowardly: attraction-towards-enemies (positive low) and deliberateness high, against (negative high).
  - curious: attraction-towards-strangers (positive high).
  - playful: rhythmic-level high and path-curvature high.
  - old and young (physical): slow, against active. Ken's precedent is the beautiful-to-graceful demon (char.2:13-20).
- Establish methods, only where a convey verb exists:
  - cowardly: (avoids ,c enemy), high, through enemy-of;
  - brave: (chases ,c enemy), medium;
  - curious: (meets ,c stranger), medium, through stranger-of and MEND's move-to.

KNOWRL, written as RELATE:

- likes: already an actor, Ken's prerequisite (prereq.19:110). It can't be redefined as a descriptor, so KNOW gives it establish suggestions with DESCRIPTOR's own put-suggestion-in-source: (accompanys a b), low. A story's 'likes' already satisfies friend-of (prereq.19:115).
- dislikes: new; PREREQ names it (prereq.19:118). Neighbor of hates. Establish: (avoids a b), medium.
- fears: named as easy to add (L662). Establish: (avoids a b), high.
- is-obedient-to: establish (follows a b), medium. This fills the hole the thesis reports: "Ani has no idea how to establish that Cinderella is obedient towards ... her stepmother" (L1856-1857). No relative suggestions, to keep CP 29.
- is-helpful-towards: establish (helps a b), medium.

Sharing establish suggestions with neighbors:

- Ken: bad "should get most from its neighbor" (dscrp.17:183).
- KNOW wraps distill-suggestions, whose only callers are the two establish functions (sugest.123:55, 70). It appends the establish suggestions of each neighbor of the task's descriptors, one strength step lower, with source (neighbor-of D N) as pass 1 writes it.
- For CINDY's words the neighbors have no establish suggestions (kind, industrious, stingy, bad, rules, dispises), so Cinderella is unchanged.

STAGE 3: KNOW, ways of showing (KNOWCV, KNOWDI)

KNOWCV, written as CONVEY:

- helps: a receiver on the existing helps actor gives (helps-along helper helped (good-distance-from (vicinity-of helped))), high. "Ani had decided to have Cinderella help the Prince ... but didn't know enough to pull it off and canceled it" (L1858-1859).
- avoids: its own receiver gives (moves-away-from who other), high. avoids inherits prevents' receiver, whose pattern names prevents literally (convey.64:167-181), so it never answered.
- follows: a new motion, giving (follows-behind follower leader).

kills is deliberately not completed. Ken's footnote shows it would let the stepmother kill Cinderella in Kept Apart (L2727-2738), and leaving knowledge out isn't cheating. gives, does, moves, takes, requests and refuses need props, which Ani lacks (char.2:11 is a stub), so they are deferred. causes and change belong to item (3), which can use move-to.

KNOWDI: three display methods built only from DISPLY's and PLACE's parts (place-*-distance-apart, move-character, move-characters, estimate-time-to-move-character, add-to-estimates). Each has a prerequisite, an 'estimate time for' receiver and a 'run ... stretched by' receiver, and each uses MEND's bring-on-if-off-stage.

- helps-along: the helper goes to contact with the helped one, then they move together to a place, with the helped one leading. It is goes-to-and-accompanys' structure with Heider's helping shapes (L4210).
  Activities: getting-on-stage, goes-to-help, helping-along.
- moves-away-from: the other moves a small part of the way towards the avoider, who moves to (away-from (vicinity-of who) (vicinity-of other)), Ken's own away-from position (prereq.19:96).
  Activities: other-approaches, moves-away.
- follows-behind: the follower walks to the leader's vicinity as a moving target, a small distance behind, until the share of time runs out.
  Activities: getting-on-stage, following.

STAGE 4: KNOW, feelings (KNOWEM, written as emote.9)

Each feeling is display-value-change suggestions with change: (and change-to: where Ken used it), so SUGEST's combine-emotional-state-suggestions and DISPLY's change methods run them unchanged.

- pride, (positive L):
  - speed down by L, medium;
  - path-jaggedness down by L, medium;
  - deliberateness up by L, low.

  CINDY gives the stepmother pride in Kept Apart (cindy.46:72), and it was passed over silently.
- anticipation, L or (positive L), since Ken's pre-meeting scene writes (anticipation high) (cindy.46:121):
  - activity-level up, high;
  - rhythmic-level up, medium;
  - path-jaggedness up, low.
- loneliness (cindy.46:124):
  - speed down, medium;
  - activity-level down, medium;
  - path-length changes to long, low.
- fear (Michotte's agitation):
  - speed up and acceleration up, high;
  - path-jaggedness up, medium.
- anger (Michotte's violence):
  - speed up and acceleration up, high;
  - path-curvature down, medium.

Ken's joy is left as he wrote it.

New top-level actors that nothing would otherwise load (an emotion used without joy) are registered in Director's tags (what READ-ANI-TAGS fills, load.33:60-65) under their parent's Ken file, so exists? loads that file and its after-load hook defines them. A fast test checks this.

STAGE 5: REVIVE;SLIPS (changes Cinderella; separately switchable)

- S1. is-not compares the task with the scene. Ken's check, (scene-participation: scene <scene> ...) (sugest.123:328-338), is given the task (scene.9:378-381), so it never matches. Checked: called with 'introduction it gives STEP-MOTHER; called with 'establish-task-1 it gives (NO SUCH CHARACTER EXISTS). The correction wraps first-sibling-that-satisfies to resolve a task to its scene.
- S2. is-described-as becomes a preference. It was only a generator name (sugest.123:402), so S1 alone would make good's (is-described-as (weak good)) call an undefined function. S2 defines it as a function and makes is-not prefer it: Ani "will be satisfied with a character that is neither weak nor good, if need be" (L2768-2770). S1 and S2 ship together.
- S3. friendly's attraction-to-* (dscrp.17:106-108) are re-issued under the element names attraction-towards-* (elemnt.1:96-105, as shy, kind and mean use). This changes only pass-1 attraction choices, which nothing reads until DETAIL.
- S4. CINDY's is-protective-of (cindy.46:38) becomes a neighbor of RELATE's is-protective-to (relate.22:100).
- S5. Latent parenthesis slips are documented with their corrected forms and corrected only when their generators gain knowledge: good's prevents and selfish's takes sit inside their binding lists (dscrp.17:147-150, 191-194); dominates' strength sits inside method: (relate.22:79); so do alone's and aware's strength and source (convey.64:236-256).

Predicted effect, to be confirmed by the goldens: in the Introduction, good's helps now finds the stepmother. The two strong helps tasks may displace accompanys, since CHOMET keeps at most (1 + complexity + obviousness + length) / 3 = 2 convey methods.

STAGE 6: REVIVE;DETAIL (later)

- (f) Deliberateness: it is chosen "then never" used (L2343-2354, L4853-4856). It now scales the jag and the rate of curvature change in Director's walk (dichar.103:160-240).
- (c) Movement tendencies: the 12 attraction choices, never read after pass 1 (char.2:68), now feed best-when scores (L4827-4829).
- B.2(a) "level of" words: scene rhythm suggests speed changes, as an emotional state does (L4791-4799). Only length is read today (scene.9:346-364).

HOW THE GLASS BOX EXPLAINS IT

Repair notes:

- A note is a (revival-repair: what W was X now Y because R file F) item memorized on the actor where the repair acted: a choice point, a task or a subscene. The actor is listed in :revival-noted, so glassBox's `repairs` key and the existing actor views find it.
- The page's REPAIR table turns each kind into plain English with a code link:
  - narrowed: "Ani had narrowed this to 'not high'. A choice must be one value, so the revival's repair let the film's variety level pick: medium."
  - gave-up: "No suggestion came, so Ani gave up, as Ken meant for typical speed. Director reads a value never set as medium, and so does the repair."
  - unknown-word, missing-relationship, no-such-display-method.
  - brought-on-stage: "The wolf isn't in this scene, so, as Ken's 'goes to and accompanies' does for a friend, he first comes onto the stage."
  - in-scene-first.
  - The SLIPS notes, each quoting the corrected line.
- dynamicsTable explains a none value from pass-1 data when MEND was on.

Knowledge badges:

- build-film-app reads KNOWDS and KNOWRL with vocabulary() and KNOWCV and KNOWDI with codeIndex. Their forms are DSCRP's and CONVEY's, so the same regexes work.
- It emits an index: the word-and-element pairs added to existing words, new words, verbs, methods and feelings, each with file:line and its ';;why:' line.
- choicePointBox, methodsBox and the task chain then mark "the revival's knowledge" next to any suggestion whose source (or neighbor-of source) is in the index, linking to REVIVE;KNOWxx.

Page texts and lists:

- methodText cases for move-to, helps-along, moves-away-from and follows-behind; the new activities in ACTIVITY and FAMILY; REJECT text for no-such-display-method.
- checkTasks, emotionOk, the editor's word list and the llm.js prompt are built from the extension-aware vocabulary. With extensions off, the prompt is byte-identical to today's.

HOW 1978 STAYS EXACTLY REPRODUCIBLE

1. Nothing loads unless asked; boot with [] is today's boot.
2. tools/check-1978.mjs (npm run test:golden) asserts, with extensions [], CP 29 102 of 102 in place, the 5 programs byte-equal to reports/pass2/ken-*, and the 5 films' frames and events equal to reports/film/*.film.json. A --fps 24 option checks the 24 fps run.
3. The same script with --extensions mend asserts the same outputs plus identical glass.json. This is MEND's contract.
4. With KNOW on, Cinderella's pass 1 must still be CP 29.
5. The page's shipped 1978 data, the recorder and the frames[].chars fields are untouched.
6. Extension goldens in reports/ext/<set>/ (Cinderella, red-riding-hood, the stress stories) make every later change visible. A generated reports/ext/README.md, also summarized in PLAN.md, says what each extension changed in Cinderella and why.

## Alternatives considered

- - **name:** A. RECOMMENDED: Lisp inside Ani, in Ken's idiom, as switchable REVIVE files (MEND for repairs, SLIPS for slip corrections, KNOW for knowledge, later DETAIL)
- **why_not_or_why:** Ani reasons with the new knowledge exactly as with Ken's. A new word's suggestions go through the same combining, conflicts, postponement, method scoring and elimination, so the existing glass box already explains them; it needs only a badge and a repair note. It follows thesis B.1, where knowledge lives in descriptor actors, and VIII.B, where Ani is a manipulable glass box whose knowledge a student can change (L3959-3968). KNOW's files mirror DSCRP, RELATE, CONVEY, DISPLY and EMOTE form for form, so the page's vocabulary() and codeIndex can read them as they read Ken's, and Ken will recognize every form. Repairs use the bridge's proven idioms (+after-load, saving the original expr and delegating to it, define-extension-method with ask-old), so no Ken file is copied or edited.
- - **name:** B. A JavaScript 'story doctor' around Ani in pipeline.js: rewrite descriptions before pass 1 (map unknown words to neighbors, fill missing relationships, turn (meets a b) into accompanys) and rewrite the CP file after pass 1 (none and (not X) to medium)
- **why_not_or_why:** Rejected. It is quick and can't disturb Lisp state, but Ani would learn nothing. The film's reasons would be the page's, so the glass box could only report 'the page changed your story'. It can't add display methods, which must be Lisp running in Director. It hides the 1978 limits instead of explaining them, and it is what Ken calls cheating: arranging for Ani to do what we want 'without improving the reasoning' (L4952-4954).
- - **name:** C. One declarative dictionary (an S-expression or JSON table of words, links and suggestions) compiled into process-suggestions calls at load, shared by Lisp, the page and the Agent Kit
- **why_not_or_why:** Not now. It would be a second way of writing knowledge that Ken's files don't use. Ken's own (process suggestions (for E V strength S)) already is a table, and vocabulary() already reads it with regexes. Methods, display plans and feelings can't be put in a table anyway. It is a good shape for the item-(5) mini-Ani, which can import KNOW's words.
- - **name:** D. The 'better knowledge base' of thesis B.1 in full: decompose descriptors into primitives (Schank-style conceptual dependency, L4716-4724) and derive each word's suggestions from them
- **why_not_or_why:** Deferred. It would change nearly every choice and take weeks. KNOW takes the step Ken's own representation allows: his 'opposite' and 'similar' links (L2342-2344) plus sharing establish suggestions with neighbors, which Ken asked for in his comment on bad: 'should get most from its neighbor' (dscrp.17:183).
- - **name:** E. Repair (not X) and none in pass 1 only, through Ken's last-ditch-default (medium for every element)
- **why_not_or_why:** Rejected. Ken wrote that 'the only ones with last-ditch-defaults should be those that need a value ... eg size but not typical speed' (choose.198:292-293). It would also hide 'Ani gave up' from the glass box. MEND instead narrows (not X) in pass 1, since a choice must be one value (L2787, L2849), and reads none as medium in pass 2, as INTERF already reads an unset element (interf.149:846).
- - **name:** F. Strict scene participation: friend-of, enemy-of and stranger-of pick only characters in the scene
- **why_not_or_why:** Rejected for MEND. In 1978 the Prince enters the Introduction because friendly's friend-of picked him, though he isn't in the scene. MEND looks in the scene first and otherwise falls back to the 1978 pick, bringing an off-stage pick on stage with Ken's own getting-on-stage step from goes-to-and-accompanys (disply.311:192-209).
- - **name:** G. Patch copies of Ken's files through DATEST's :load-priorities '(tryout)
- **why_not_or_why:** Rejected. It copies thousands of Ken's lines and turns the 1978 switch into a file swap. The changes would also be invisible among 10,000 lines.

## Changes, file by file

- - **file:** src/director/revive/mend.lisp
- **what:** New (REVIVE;MEND): M1, narrowing (not X) at record-choice with GLOSUG's variety pick; M2, a +after-load on KEN;CP that reads none as medium plus a weightify guard; M3, skipping unknown words in the establish suggestions; M4, an exists? guard in meet-description-of; M5, a score-suggestions filter for display methods that don't exist, plus Ken's named move-to display method; M6, scene-first generators that fall back to the 1978 pick, and bring-on-if-off-stage wrappers on move-to-and-hits, chases-to and pushes-around. Also the revival-note helper and the :revival-noted list. Each change starts with a comment citing its evidence.
- - **file:** src/director/revive/slips.lisp
- **what:** New (REVIVE;SLIPS): S1, is-not resolves the task to its scene; S2, is-described-as as a preference function; S3, friendly's attraction-towards-* re-issued; S4, is-protective-of as a neighbor of is-protective-to; S5, the latent parenthesis slips, documented with corrected forms.
- - **file:** src/director/revive/know.lisp
- **what:** New (REVIVE;KNOW): header with Ken's legitimacy test, the +after-load hooks that load each part after its Ken file (with :insert-methods-at-end bound to nil), tags registration for new top-level actors, and the distill-suggestions wrapper that shares establish suggestions with neighbors.
- - **file:** src/director/revive/knowds.lisp, knowrl.lisp, knowcv.lisp, knowdi.lisp, knowem.lisp
- **what:** New. KNOW's words (as DSCRP), relationships (as RELATE), convey receivers for helps, avoids and follows (as CONVEY), the display methods helps-along, moves-away-from and follows-behind (as DISPLY), and the feelings pride, anticipation, loneliness, fear and anger (as EMOTE). A ';;why:' comment above each form.
- - **file:** src/director/revive/detail.lisp
- **what:** New, final stage (REVIVE;DETAIL): deliberateness steadies paths in Director's walk, movement tendencies feed best-when scores, and scene rhythm suggests speed changes.
- - **file:** src/pipeline.js
- **what:** EXTENSIONS registry (group, changes1978, requires, about), loaded in registry order. boot, pass1, pass2, film and makeFilmSteps take an `extensions` option and pass it through all steps. glassBox adds a `repairs` key only when extensions are non-empty. storyOutline and checkStory use the extension-aware vocabulary.
- - **file:** tools/check-1978.mjs (new) and package.json
- **what:** Golden check, extensions [] and also --extensions mend: CP 29 102 of 102 in place, programs byte-equal, frames and events equal (and glass.json for MEND); --fps 24 optional. npm scripts test:golden and test:ext.
- - **file:** tools/check-extensions.mjs (new), reports/ext/
- **what:** Run Cinderella, red-riding-hood and the stress stories for each extension set. Compare exactly against the committed goldens; --update regenerates them and writes reports/ext/README.md, which says what changed in Cinderella and which notes and badges explain it.
- - **file:** tools/run-pass1.mjs, tools/run-pass2.mjs, tools/run-scene.mjs
- **what:** Use pipeline.boot and pipeline.recorder instead of copies; run-pass1 exits non-zero on a CP mismatch; accept --extensions.
- - **file:** tools/build-ani-bundle.mjs
- **what:** Also run the bundle check with all extensions on, so every REVIVE file the browser needs is in the manifest.
- - **file:** tools/build-film-app.mjs
- **what:** vocabulary() also reads knowds.lisp and knowrl.lisp, flagging words as revival, and records the word-and-element pairs added to Ken's words. codeIndex also indexes knowcv, knowdi and mend. Emits the extension index (file:line plus the why line) and the emotions list from emote.9 and knowem.lisp.
- - **file:** tools/build-source-app.mjs
- **what:** List every src/director/revive/*.lisp file so code links reach the extensions.
- - **file:** app/film.template.html
- **what:** The 1978 / extensions switch with grouped checkboxes (localStorage in try/catch). RUN_KEY includes extensions; Make is enabled when only the switch changed; saveRun and run labels record extensions. REPAIR note texts. Revival badges in choicePointBox, methodsBox and the task chain. The none explanation in dynamicsTable. methodText, ACTIVITY, FAMILY and REJECT entries for the new methods and reasons. checkTasks and emotionOk become extension-aware. A 1978-mode failure explainer with 'Make it again with the revival's repairs'.
- - **file:** app/film/llm.js
- **what:** Prompt built from the extension-aware vocabulary, task forms and feelings. The MEND rule relaxations apply only when MEND is on, and with extensions off the prompt is byte-identical.
- - **file:** app/film/save.js
- **what:** Film files record `extensions` (FILM_FORMAT stays 1; a missing field means 1978).
- - **file:** app/pass1.template.html
- **what:** Show (revival-repair:) notes on choice points, such as the narrowed (not X).
- - **file:** test/ext.test.js (new), test/stories/stress-*.lisp (new)
- **what:** Fast node:test unit checks of each repair and of KNOW's loading. Stress stories: defiant Cinderella (not high), an unknown word, meets alone, an off-stage victim, missing relationships, a character with no descriptors.
- - **file:** PLAN.md
- **what:** A Phase 8 entry: the knowledge-or-repair classification table, the contracts (MEND leaves Cinderella identical; KNOW keeps CP 29), and Cinderella's diffs under SLIPS and KNOW with their explanations.

## Lisp sketch

```lisp
;;; -*-lisp-*-
;;; REVIVE;MEND: repairs for what new stories meet and Cinderella never did.
;;; This file is ours, not Ken's. Nothing here changes what CINDY makes: with it
;;; loaded, pass 1 still writes CP 29 and every scene's program and frames are as
;;; without it (tools/check-1978.mjs --extensions mend). Where a repair changes what
;;; Ken's code would have done (or stopped on), it leaves a note for the glass box.

(declare (special :revival-noted :generator-scene :generator-task))
(setq :revival-noted nil :generator-scene nil :generator-task nil)

(defun revival-note (actor what was now because)
  (cond (actor
	 (ask ,actor memorize (revival-repair: what ,what was ,was now ,now
					       because ,because file mend))
	 (or (member actor :revival-noted) (push actor :revival-noted)))))

;;; 1. A choice is one value. "Ani must choose a value and only one" (AITR-540
;;; L2787). COSUG's absolute-three-value answers (not X) when two values are left
;;; (cosug.215:395-402) and record-choice keeps it (choose.198:596-603), but INTERF's
;;; weightify knows only low, short, medium, long and high (interf.149:899-904). So
;;; the film's variety level picks between the two left, as GLOSUG's
;;; pick-value-with-variety picks among three (glosug.41:61-74).
(defun narrow-not-value (choice-point suggestion)
 (let ((value (get suggestion 'value))
       (element-name (ask ,choice-point recall your element-name)))
      (let ((possible (and (not (atom value)) (eq (first value) 'not)
			   (ask ,element-name recall your possible-values))))
	   (cond ((null possible) suggestion)
		 (t (let ((picked (pick-value-with-variety
				   (ask film ask your current-film to recall your (variety level))
				   (set-minus possible (list (second value)))
				   element-name)))
			 (revival-note choice-point 'narrowed value picked '(variety level))
			 '(suggestion: element ,(get suggestion 'element)
				       value ,picked
				       strength ,(get suggestion 'strength)
				       source (and ,(get suggestion 'source) (variety level)))))))))

(+after-load '|ken;choose >|
 '(progn
   (putprop 'record-choice (get 'record-choice 'expr) 'choose-198-expr)
   (defun record-choice (choice-point suggestion)
     (funcall (get 'record-choice 'choose-198-expr)
	      choice-point (narrow-not-value choice-point suggestion)))))

;;; 2. Giving up means moving as usual. Pass 1 records none, source given-up
;;; (choose.198:61-73), and Ken meant it: no last-ditch default for "typical speed"
;;; (choose.198:292-293). INTERF reads an element never set as medium,
;;; (or ... 'medium) (interf.149:846); so pass 2 reads none the same way.
(defun read-given-up-as-normal ()
 (mapc (function
	(lambda (cp)
		(cond ((and (eq (ask ,cp recall your current-choice) 'none)
			    (ask ,(third cp) are you a normal-movement-element))
		       (ask ,cp set your current-choice to medium)
		       (revival-note cp 'gave-up 'none 'medium 'unset-is-medium)))))
       (ask choice-point recall your childless-descendants)))

(+after-load '|ken;cp >| '(read-given-up-as-normal))

(+after-load '|ken;interf >|   ;;Director's copy too
 '(progn
   (putprop 'weightify (get 'weightify 'expr) 'interf-149-expr)
   (defun weightify (value)
     (funcall (get 'weightify 'interf-149-expr) (cond ((eq value 'none) 'medium) (t value))))))

;;; 3. A word Ani doesn't know suggests nothing, as an emotion she doesn't know
;;; suggests nothing (ask-if-exists, sugest.123:38). "If parts are missing Ani
;;; manages to go on rather than stop" (L2733-2737).
(defun known-descriptions (descriptions task)
 (mapcan (function (lambda (d)
		   (cond ((exists? (get d 'descriptor)) (list d))
			 (t (revival-note task 'unknown-word (get d 'descriptor) nil 'no-such-word)
			    nil))))
	 descriptions))

;;; 4. A relationship that doesn't exist is "don't know", as enemy-of and
;;; stranger-of already treat it (sugest.123:352-353, 385-394); friend-of's likes
;;; asked it anyway (prereq.19:57-60, 110-120).
(+after-load '|ken;prereq >|
 '(progn
   (putprop 'meet-description-of (get 'meet-description-of 'expr) 'prereq-19-expr)
   (defun meet-description-of (character descriptor type)
     (cond ((exists? character)
	    (funcall (get 'meet-description-of 'prereq-19-expr) character descriptor type))
	   (t (revival-note :generator-task 'missing-relationship character nil 'not-described)
	      nil)))))

;;; 5. A display method Ani names that Ken never wrote is set aside, as an
;;; unconveyable convey method is (sugcon.26:69-74); variety-score asked it
;;; regardless (chomet.123:436-439; get-estimated-time-of checks, 450).
(+after-load '|ken;chomet >|
 '(progn
   (putprop 'score-suggestions (get 'score-suggestions 'expr) 'chomet-123-expr)
   (defun score-suggestions (suggestions task)
     (funcall (get 'score-suggestions 'chomet-123-expr)
	      (mapcan (function
		       (lambda (s)
			       (let ((verb (first (get (get s 'value) 'value))))
				    (cond ((exists? verb) (list s))
					  (t (reject-suggestion task s '(no-such-display-method ,verb))
					     nil)))))
		      suggestions)
	      task))))

;;; ...and move-to, which CONVEY suggests for (meets a b) (convey.64:73-80): as
;;; move-small-part-towards, but all the way. "X need not be on stage since it can
;;; come on and then meet Y" (L2392-2396).
(defun define-move-to ()
 (let ((:insert-methods-at-end nil))
  (define move-to display-method
   (add prerequisite for (move-to ?who ?where) (can-move ,who ,where)))
  (define-receiver (estimate time for move-to ?character ?place in ?subscene) move-to
   (add-to-estimates 1.0
		     (estimate-time-to-move-character character place '(stop-when-there)
						      (special-dynamics-of character subscene)
						      subscene .33)))
  (define-receiver (run move-to ?character ?place in ?subscene stretched by ?factor) move-to
   (place-medium-distance-apart 'move-to '(vicinity-of ,character) place nil subscene)
   (bring-on-if-off-stage (character-involved-in place) character subscene)
   (move-character 'goes-to-meet character place 'moving-target
		   '(stop-when-there (quote ,subscene)) 0.0
		   (divide-speed-by-factor character factor subscene) 'careful subscene))))

;;; 6. In the scene first. "of course first is a stupid way of doing it"
;;; (sugest.123:329); is-not means to look "part of the scene" (333). If no one in
;;; the scene fits, the 1978 answer stands (that is how the Prince joins the
;;; Introduction). SCENE's tasks pass themselves as the scene (scene.9:373-381).
(defun scene-of (x)
 (cond ((and (exists? x) (ask ,x are you a task)) (ask ,x recall your scene)) (t x)))

(defun those-in-scene (characters scene)
 (mapcan (function (lambda (c)
		   (and (ask ,c recall if any items match (scene-participation: scene ,scene task ?))
			(list c))))
	 characters))

(defun relationship-sibling-among (character relationship siblings) ;;Ken's loop, sugest.123:365-370
 (do ((i siblings (rest i)))
     ((null i) '(no such character exists))
     (and (ask ,relationship recall if any items match
	       (status-of (,relationship ,character ,(first i)) met))
	  (return (first i)))))

(defun first-sibling-that-satisfies-relationship (character relationship)
 (let ((siblings (ask ,character recall your siblings)))
      (let ((as-in-1978 (relationship-sibling-among character relationship siblings))
	    (in-scene (and :generator-scene
			   (relationship-sibling-among character relationship
						       (those-in-scene siblings :generator-scene)))))
	   (cond ((and in-scene (not (equal in-scene '(no such character exists))))
		  (or (eq in-scene as-in-1978)
		      (revival-note :generator-task 'in-scene-first as-in-1978 in-scene 'in-the-scene))
		  in-scene)
		 (t as-in-1978)))))
;; (first-sibling-that-is-or-does and first-sibling-that-is-not-related likewise)

;;; ...and bring on those who aren't, as goes-to-and-accompanys does for an
;;; off-stage friend (disply.311:192-209).
(defun bring-on-if-off-stage (other character subscene)
 (cond ((off-stage-at-start? other subscene) ;;an ...-and-offstage place, or |x| or |y| > .5
	(let ((plan (move-character 'getting-on-stage other
				    '(on-stage-near ,other (vicinity-of ,character))
				    'stationary-target '(stop-when-there (quote ,subscene))
				    0.0 (special-dynamics-of other subscene) 'careful subscene)))
	     (ask ,subscene add ,plan to your list of movements)
	     (revival-note subscene 'brought-on-stage other plan 'off-the-stage)))))

(+after-load '|ken;disply >|
 '(let ((:insert-methods-at-end nil))
   (define-move-to)
   (define-extension-method
    (run move-to-and-hits ?character ?victum in ?subscene stretched by ?factor) move-to-and-hits
    (ask-old :self run move-to-and-hits ,character ,victum in ,subscene stretched by ,factor)
    (bring-on-if-off-stage victum character subscene))))
;; (chases-to and pushes-around likewise)

;;; ---------------------------------------------------------------- REVIVE;SLIPS (excerpt)
;;; is-not's "part of the scene" test (sugest.123:328-338) is given the task
;;; (scene.9:378-381), so it never matches; and what it asks for is a preference:
;;; Ani "will be satisfied with a character that is neither weak nor good, if need
;;; be" (L2768-2770). is-described-as was only a generator's name (sugest.123:402).
(+after-load '|ken;sugest >|
 '(progn
   (putprop 'first-sibling-that-satisfies (get 'first-sibling-that-satisfies 'expr) 'sugest-123-expr)
   (defun first-sibling-that-satisfies (condition character scene)
     (let ((ken (get 'first-sibling-that-satisfies 'sugest-123-expr)) (scene (scene-of scene)))
	  (let ((preferred (funcall ken condition character scene)))
	       (cond ((and condition (equal preferred '(no such character exists)))
		      (funcall ken nil character scene))
		     (t preferred)))))
   (defun is-described-as (character descriptors)
     (do ((d (cond ((atom descriptors) (list descriptors)) (t descriptors)) (rest d)))
	 ((null d) nil)
	 (and (ask ,character recall if any items match
		   (description: type ? descriptor ,(first d) %))
	      (return t))))))

;;; ---------------------------------------------------------------- REVIVE;KNOW (excerpts)
;;; This file is ours, not Ken's. "There is no reason to think that similar words
;;; not currently known to Ani, such as 'clever', 'fears', 'textured', or 'helps'
;;; could not be added" (L662). The test for each addition is Ken's own: "add
;;; obvious information that was lacking or was too inaccurate" (L4939-4944).
(+after-load '|ken;dscrp >|  '(let ((:insert-methods-at-end nil)) (load '|revive;knowds >|)))
(+after-load '|ken;convey >| '(let ((:insert-methods-at-end nil)) (load '|revive;knowcv >|)))
(+after-load '|ken;emote >|  '(let ((:insert-methods-at-end nil)) (load '|revive;knowem >|)))

;;; REVIVE;KNOWDS, written as DSCRP
;;why: "slow motion conveyed gentleness" (Michotte, L4189-4190)
(define gentle personality-character-descriptor
 (process suggestions
	  (for speed low strength medium)
	  (for acceleration low strength medium)
	  (for path-jaggedness low strength medium)))

(define rough personality-character-descriptor
 (process suggestions
	  (for speed high strength medium)
	  (for acceleration high strength medium)
	  (for path-jaggedness high strength medium)))

;;why: similar words are "indirect sources of suggestions" (L2342-2344); these
;;borrow, and have none of their own, so CINDY's choices stay CP 29
(progn
 (ask gentle add rough to your list of opposites)
 (ask shy add timid to your list of neighbors)
 (ask evil add wicked to your list of neighbors)
 (ask mean add cruel to your list of neighbors))

;;; REVIVE;KNOWCV, written as CONVEY
;;why: "Ani had decided to have Cinderella help the Prince ... but didn't know
;;enough to pull it off and canceled it" (L1858-1859)
(define-receiver (yield suggestions for {and ?task (convey (helps ?helper ?helped))}) helps
 '((suggestion: element ,task
		value (method: type display
			       value (helps-along ,helper ,helped
						  (good-distance-from (vicinity-of ,helped))))
		strength high
		source helps)))

;;why: avoids inherits prevents' receiver, whose pattern names prevents itself
;;(convey.64:167-181), so it never had a way to be shown
(define-receiver (yield suggestions for {and ?task (convey (avoids ?who ?other))}) avoids
 '((suggestion: element ,task
		value (method: type display value (moves-away-from ,who ,other))
		strength high
		source avoids)))

;;; REVIVE;KNOWEM, written as EMOTE
;;why: CINDY gives the stepmother pride in Kept Apart (cindy.46:72); Ani had no
;;pride, so it was passed over (sugest.123:38-45)
(define pride emotion
 (process suggestions
	  (for (establish (emotional-state ?character (pride (positive ?level))))
	       '(method: type display-value-change
			 value (change: element (,character speed)
					amount (negative ,level) speed ,level))
	       strength 'medium)
	  (for (establish (emotional-state ?character (pride (positive ?level))))
	       '(method: type display-value-change
			 value (change: element (,character path-jaggedness)
					amount (negative ,level) speed ,level))
	       strength 'medium)))
```

## Tests

- tools/check-1978.mjs (npm run test:golden, about 3 minutes) with extensions []: CP 29 102 of 102 in the same place; the 5 scene programs byte-equal to reports/pass2/ken-*; each scene's frames and events equal to reports/film/*.film.json at 4 fps (192, 116, 17, 179 and 84 frames). Optional --fps 24 against reports/film/24fps (about 13 minutes).
- The same script with --extensions mend: identical CP, programs, frames, events and pass-2 glass.json, with no revival-repair notes anywhere. This is MEND's contract and checks that MEND's scene-first generators reproduce the 1978 picks (the Prince for friend-of(cinderella), Cinderella for enemy-of(step-mother)).
- With --extensions mend,know: Cinderella's pass 1 is still CP 29, 102 of 102. A rule check fails the build if a KNOW word with its own dynamics suggestions is linked to any word CINDY uses.
- tools/check-extensions.mjs: exact comparison against committed goldens in reports/ext/<set>/ for Cinderella, test/stories/red-riding-hood.lisp and the stress stories, for the sets mend, mend+know, mend+slips and all. --update regenerates the goldens and reports/ext/README.md (what changed in Cinderella and which notes or badges explain it).
- Stress stories in test/stories/: stress-not-high (PLAN's defiant Cinderella), stress-unknown-word (grumpy), stress-meets (convey (meets a b)), stress-off-stage (a victim who isn't in the scene), stress-no-relationship (a friendly character with unrelated siblings), stress-gave-up (a character with no descriptors). With MEND, every scene ends in under 600 frames with no Lisp error and the expected revival-repair notes are present. Without MEND, each fails in the documented way, so the 1978 limits stay reproducible and explained.
- test/ext.test.js (node:test, about 10 s), booting with extensions: weightify of none gives 1.0; record-choice given (not high) with a medium variety level records the GLOSUG pick and a narrowed note; meet-description-of on a missing (relationship-of a b) gives nil, not NO-SUCH-ACTOR; score-suggestions rejects a (move-to ...) of an undefined method with (no-such-display-method ...) when move-to is undefined, and keeps it once MEND defines move-to; scene-of resolves establish-task-1 to introduction; SLIPS' is-not finds STEP-MOTHER from establish-task-1; is-described-as of the prince for (weak good) is true; KNOW's pride exists in a pass 2 whose story uses pride without joy (tags autoload); timid is a neighbor of shy and an opposite of brazen.
- Vocabulary and prompt: vocabulary() with know lists timid (revival, neighbor of shy) and gentle (revival, has suggestions); the llm.js prompt with extensions off is byte-identical to today's.
- tools/build-ani-bundle.mjs also runs with all extensions on, and the project-files run and the bundle run make the same frames.
- tools/check-film-app.mjs in headless Chrome: switch on, run stress-off-stage, frame counts equal Node's; the glass box shows a 'brought onto the stage' note and a 'the revival's knowledge' badge; the switch state survives a reload and a saved film file; the 1978 view and its data are unchanged.
- Manual legitimacy review before each KNOW stage lands: every addition has a ';;why:' citing the thesis or Ken's code, and no change removes or penalizes an option to steer an outcome (L4952-4954).

## Risks

- Unverified prediction: MEND's scene-first generators and the bring-on-stage wrappers are meant to leave Cinderella identical. In No Longer Kept Apart, for example, the stepmother isn't a scene participant, which is why the condition is 'starts off the stage' and not 'not a participant'. The --extensions mend golden is the guard; if it fails, the condition is tightened, not the golden.
- Wrappers compose through saved expr properties (MEND then SLIPS then KNOW on the same SUGEST functions). Hook order must follow registry order, and each wrapper must save the expr it finds, not Ken's. A missed +after-load (NODES-style load-time work, or a function called before its file's hook runs) silently skips a repair. ext.test.js checks each hook fired.
- Method order and INTERSECT order decide Ani's choices, so new actors (KNOW's descriptors) could shift order-dependent iterations even without suggestions. The CP-29-under-KNOW test catches this.
- `likes` is already Ken's prerequisite actor (prereq.19:110), so it can't become a relationship descriptor. KNOW attaches suggestions to it with put-suggestion-in-source, and vocabulary() must special-case it.
- SLIPS S1 without S2 would make good's (is-described-as (weak good)) call an undefined function, so they ship together. SLIPS visibly changes the Introduction: helping the stepmother may displace accompanying the Prince under CHOMET's two-method limit. That is right by Ken's code, but surprising, so it gets its own switch and a written explanation.
- New display methods (helps-along, moves-away-from, follows-behind, move-to) are the costly part: time estimates, placement and cuts can produce long or never-ending scenes. Each needs its own stress story, and the page's 600-frame stop stays as a last guard.
- Extension runs of Cinderella need a fresh pass 1 when KNOW is toggled (KNOW adds actors), at about 18 s in the browser plus about 3 minutes of filming. Results are cached per extension set. Shipping a precomputed 4 fps extended Cinderella is optional, subject to the 950 KB budget for the claude.ai copy.
- Revival knowledge could be mistaken for Ken's. This is mitigated by separate files, ';;why:' citations, the badges, and the switch's labels.
- Overlap with the other designs: physical words get appearance suggestions in APPEAR, not KNOW; causes and change belong to CHANGE, which should reuse MEND's move-to. All extensions share one EXTENSIONS registry and one switch.
- Knowledge deliberately left out (kills, props-based verbs, completing joy's table) may disappoint the LLM drafter. The prompt lists only what the enabled extensions can show.

## Effort

About 10 to 12 working days, staged so that each stage lands with its goldens:
(0) The switch, the registry, boot deduplication, check-1978 and provenance in RUN_KEY, film files and labels: about 1 day, shared with the APPEAR and CHANGE designs.
(1) MEND, M1 to M6, with the stress stories, notes and prompt relaxations: about 2 days. Gate: the MEND golden equals 1978.
(2) KNOW words and relationships (KNOWDS, KNOWRL), neighbor sharing, vocabulary and prompt: about 1.5 days. Gate: CP 29 under KNOW.
(3) KNOW ways of showing (KNOWCV, KNOWDI: helps-along, moves-away-from, follows-behind) with page texts: 2 to 3 days.
(4) KNOW feelings (KNOWEM) and the tags autoload: about 1 day.
(5) SLIPS, with a written Cinderella diff: about 1 day.
(6) DETAIL (deliberateness, tendencies in best-when, scene rhythm): about 2 days.
MEND is independently useful after stage 1, because new stories stop failing.

## Thesis references

- AITR-540.txt L662: 'similar words not currently known to Ani, such as "clever", "fears", "textured", or "helps" could not be added'.
- L1856-1860: the Introduction's holes: no way to establish 'obedient towards and tolerant of'; Cinderella's helping the Prince 'canceled'; shy's avoid-a-stranger dropped.
- L2338-2344: descriptors as actors, linked by 'opposite' and 'similar' links used as 'indirect sources of suggestions'.
- L2343-2354 and L4853-4856: deliberateness is chosen 'then never' used (DETAIL f).
- L2392-2396: 'meets' is a special case of 'moves'; Y must be on stage; 'X need not be on stage since it can come on and then meet Y' (MEND's move-to).
- L2727-2738: 'kills' is incomplete, and if completed it might be chosen (why KNOW leaves it out).
- L2733-2737: Ani's use of knowledge is robust: 'If parts are missing Ani manages to go on rather than stop' (MEND M3, M4).
- L2757-2770: good helps a character 'ideally ... weak and good' but 'will be satisfied with a character that is neither ... if need be' (SLIPS S2).
- L2764-2783: inventing a new character when none fits, like Disney's mice (deferred).
- L2787 and L2849: 'Ani must choose a value and only one'; an element 'has only one value' (MEND M1).
- L2821-2825 and L4186-4192: Michotte: rapid movement is violence, slow motion is gentleness, sudden and repeated changes are nervousness or agitation (KNOW's words and feelings).
- L4130-4132: ethological suggestions for dominance (appearance goes to APPEAR).
- L4210-4211: Heider's hand-made animation (the helping display).
- L4225-4233: social conventions and common sense as sources of suggestions.
- L4697-4741 (X.B.1): 'Too often Ani knows of only one or two ways to do something'; more methods, more descriptor suggestions, a semi-canonical scheme, descriptors sharing primitives.
- L4742-4799 (X.B.2): animators' knowledge in display methods; suggestive names should be able to suggest values and activities (DETAIL's rhythm).
- L4800-4889 (X.B.3): myriad details (a) to (i), especially (c) movement tendencies and (f) deliberateness.
- L4939-4944 and L4952-4954: the only legitimate changes, and the definition of cheating (the acceptance test for every addition).
- L3959-3968: Ani as a manipulable glass box whose knowledge a student can change or replace (why the knowledge lives in Ani's own actors).
- Code evidence cited in the design: choose.198:61-73, 290-294, 596-603; cosug.215:41-65, 395-402; glosug.41:61-74; interf.149:845-847, 899-904; sugest.123:38, 54-91, 319-395; scene.9:373-381, 463-465; prereq.19:57-60, 96, 110-120; chomet.123:216-302, 436-450; convey.64:73-80, 127, 163-181, 236-256; disply.311:113-233; dscrp.17:106-108, 147-150, 183, 191-194; relate.22:79, 100; cindy.46:38, 72, 121-124; emote.9:11-72; char.2:13-20, 58-68.

## The review

**Verdict:** sound with fixes  
**Fidelity:** 4  
**Feasibility:** 3  
**Value:** 4

### Errors found

- VERIFIED BY RUNNING IT: the claim that KNOWEM feelings 'run unchanged' through SUGEST's combine-emotional-state-suggestions and DISPLY's change methods is wrong. combine-emotional-state-suggestions (sugest.123:213-234) groups suggestions by (change: (who element)) and hands any group of two or more to COSUG's change:-package combine (cosug.215:455-477). That combine reads (get (get s 'value) 'display), which belongs to the older format in Ken's own comment (cosug.215:449-453). Under today's (method: type display-value-change value (change: ...)) it gets nil and calls shouldnt-happen. I defined the sketch's pride after KEN;EMOTE and ran pass 2 for kept-apart. It stops with 'shouldnt happen (CHANGE:-PACKAGE (BAD CHANGE: PACKAGE IN EITHER ...joy... speed ... OR ...pride... speed))'. Ken's own Kept Apart gives the stepmother (and (joy (positive medium)) (pride (positive medium))) (cindy.46:71-72), so KNOW as designed stops Cinderella's Kept Apart. change-to:-package (cosug.215:499-520) has the same format bug: two change-to: suggestions for one element (joy (positive high) with loneliness's path-length) compare nil with nil as equal and merge into a nil value instead of failing.
- M6 sketch: first-sibling-that-satisfies-relationship (and the 'likewise' first-sibling-that-is-or-does and first-sibling-that-is-not-related) is redefined by a top-level defun when MEND loads at boot. These are AUTOLOAD functions of KEN;SUGEST (src/director/tags/ani.lisp: DEFPROP ... |KEN;SUGEST| AUTOLOAD), and define-function expands to defun (src/director/ken1/macros.lisp:35-36). So when SUGEST autoloads, Ken's definitions replace MEND's and the repair silently does nothing. The MEND golden still passes, because Cinderella needs no change from M6.
- M1's evidence is misread. 'Ani must choose a value and only one' (AITR-540 L2787) contrasts values with methods, which are not combined. It does not rule out (not X). (not X) is a deliberate value in Ken's representation: movement elements use value-description three-values-and-not (elemnt.1:24-26), three-value ranks (not X) explicitly (elemnt.1:145-146), and the thesis says the most complex value expert 'accepts these three values optionally modified by less-than, greater-than and different-from' (L2658-2659). Narrowing it inside pass 1's record-choice also changes Ken's later reasoning: count-for variety counts (choose.198:600) and relative comparisons against that choice point. That contradicts M2, which keeps Ani's 'honest none' in the CP.
- Contradiction in the MEND contract: Stage 0 adds a `repairs` key to glassBox whenever extensions are non-empty, but check-1978 --extensions mend asserts that pass-2 glass.json is identical to 1978's. With MEND on, every glass.json would gain `repairs: []`.
- S5: 'dominates' strength sits inside method: (relate.22:79)' is false. Counting parentheses, line 79's strength 'high is at the same depth as line 70's strength 'low, inside the (or ...) and outside method:. Only the indentation is odd. The other slips are real: good's prevents (dscrp.17:147-150) and selfish's takes (dscrp.17:191-194) are second bindings with an empty bind body, and alone's and aware's strength and source sit inside method: (convey.64:242-243, 255-256).
- 'All of KNOW's effects on Cinderella are in pass 2, where Ani now pulls off things she decided in 1978 but couldn't do' is inaccurate. KNOWRL's is-obedient-to -> (follows a b) gives the Introduction's establish-task-6 (cinderella to step-mother), which was 'cant-do' in reports/pass2/introduction.glass.json, a brand-new convey task (Cinderella follows the stepmother). Ani never decided that in 1978; the thesis says she had 'no idea how' (L1856-1857). KNOWEM pride changes Kept Apart, and as written stops it (error 1).
- 'For CINDY's words the neighbors have no establish suggestions (kind, industrious, stingy, bad, rules, dispises), so Cinderella is unchanged' leaves out KNOWRL's own dislikes. The design makes dislikes a neighbor of hates (CINDY: step-mother hates cinderella, Introduction establish-task-5) and gives it (avoids a b). The distill-suggestions wrapper therefore adds a suggestion to the stepmother's relationship task in Ken's Introduction.
- 'one strength step lower, with source (neighbor-of D N) as pass 1 writes it': pass 1's neighbor source only replaces the source and keeps the strength (cosug.215:84-89). Lowering it a step is the revival's own invention, not 'as pass 1 writes it'.
- M6(a)'s 'in the scene' test relies on scene-participation items. SCENE memorizes them only for each task's subject, (second (second description)), and Ken notes ';;what about other participents?' (scene.9:463-465). A character who is only the object of a task in the scene (a victim in (convey (chases wolf red))) does not count as in the scene, so the off-scene first-1978 pick can still win.
- Lazy loading: MEND defines move-to, and KNOW defines its words, relationships, verbs and display methods, inside +after-load hooks on DSCRP, RELATE, CONVEY, DISPLY and EMOTE. Those Ken files are loaded only on first use through tags (load.33:60-65). exists? is (or (actor-of x dont-autoload) (get x 'actor-load)) (KEN1;DRECT, }^rsv.6:63-65). So until the parent file happens to load, exists? answers nil. M5(a)'s filter would then reject MEND's own move-to with no-such-display-method in a scene whose only display suggestion is move-to, and M3 would skip a KNOW word such as gentle as unknown when a character uses only KNOW words. The design registers tags only for KNOWEM emotions. Also, exists? does not load a file (the design says 'so exists? loads that file'); the later ask does.
- The S1 note 'S1 and S2 ship together ... may displace accompanys' leaves out that with SLIPS but without KNOW, helps still has no convey receiver (convey.64:127, 163). The two helps tasks would be chosen and then dropped as no-idea-how-to-convey-method (sugcon.26:69-74). find-related-suggestions also ranks the two helps as 'identical' (convey-relationship compares only the verb and the subject, sugest.123:162-177), and eliminate-not-related-suggestions keeps identicals (chomet.123:588-596). The likely result is that Cinderella loses accompanying the Prince and nothing replaces it, so the Prince never enters the Introduction.
- S3 'changes only pass-1 attraction choices' is not established. Adding friendly's (positive medium) to attraction-towards-strangers conflicts with shy's (negative high) at high strength (dscrp.17:66, 107). Conflicts go through resolution and postponement, which can reorder pass 1's choices, and order matters (bridge.lisp section 4). Nothing in pass 2 reads attraction choices (no reader outside dscrp, elemnt and cp), but pass 1's other choices could still shift.
- Wrong locations in the changes list: checkStory and emotionOk are in app/film.template.html:1497 and 1542, not src/pipeline.js. FILM_FORMAT is the string "ani-film" with a separate version: 1 (app/film/save.js:157-165). RUN_KEY is a constant localStorage key, "ani-cinderella:run:v1" (app/film.template.html:1626), not something that 'includes extensions'.
- away-from is defined as an INTERF position at interf.149:374. prereq.19:96 is only a use of it in can-move's stands-guard suggestion.
- M1 says it picks 'exactly as it picks among three'. With two values and variety medium, pick-value-with-variety takes middle-element of a two-item list. middle-element is a KEN1 reconstruction, (nth (// (length l) 2) l) (src/director/ken1/util.lisp:175-176), so it returns the less-chosen of the two. That edge case rests on a rebuilt function, not on Ken's code.

### Gaps

- KNOW's Cinderella golden would fail at Kept Apart before any diff can be explained (error 1). Every new feeling that shares an element with joy hits the same broken combine: fear and anger (speed, acceleration), anticipation (activity-level, rhythmic-level) and loneliness (change-to: path-length). Any LLM story that writes (and (joy ...) (fear ...)) stops pass 2.
- The MEND golden cannot detect a repair that was never installed, because Cinderella needs none of them. A clobbered M6, or an +after-load key that never fires, passes check-1978 --extensions mend. ext.test.js must assert, after the parent file has loaded, that each wrapped function is the revival's (for example, that its saved Ken expr property is non-nil and that the function cell is not Ken's).
- M2's re-narrowing of '(not X) left in a CP made without MEND' cannot happen: makeFilmSteps always reruns pass 1 with the same extensions (src/pipeline.js:355-387), and saved film files are replayed, not re-planned. It adds a second narrowing rule, from counts rebuilt in a different order, that could disagree with M1.
- Pass 1 already touches every KNOW word. study-descriptor-use iterates (ask character-descriptor recall your childless-descendants) (compar.69:127-136), so each new word, including the neighbors DSCRP's links create, is studied and recorded. This is the concrete order-dependence risk for the CP-29-under-KNOW contract and should be named and tested.
- The CP-29 'rule check' must work on the live link closure. DESCRIPTOR's add-to-neighbors and add-to-opposites spread each link to the neighbors' neighbors and the opposites' opposites (char.2:111-131). For example, evil+wicked makes wicked an opposite of good and kind, and shy+timid makes timid an opposite of brazen and forward. vocabulary() records only direct pairs (tools/build-film-app.mjs:79-82), so badges and the rule check would miss these links.
- distill-suggestions(suggestions scene) receives neither the descriptors nor the character, and its 'scene' is the task. The neighbor-sharing wrapper has to re-derive the descriptors from (ask task recall your task), and the neighbor's suggestions come back with element (establish C N), not (establish C D). The design doesn't say how either is handled.
- Latent slips the design leaves out of SLIPS and MEND, each relevant to its own goals. (a) pass-prerequisite-test reads (get (get s 'value) 'prerequisite) (singular, chomet.123:559), while chain-methods and score-suggestions use 'prerequisites (sugcon.26:51, chomet.123:277), so eliminate-by-prerequisites never removes anything. (b) MIDDLE's less-than tests '((not low) (not middle)) (elemnt.1:171), but values reach it as (not bottom), so comparisons against (not low) or (not short) fail. This matters as soon as (not X) is kept in pass 1. (c) CINDY gives the Prince the personality word strong as a physical description (cindy.46:42; PLAN.md:82).
- S1 newly reaches generators Ken never exercised: friendly's gives with is-desired-by, selfish's requests/refuses with (is-described-as valuable), and hard-working's (is-described-as (difficult)). None has if-asked-about knowledge, and what they return on failure (nothing-found or nil) is untested. The glass box needs REJECT texts for whatever they produce.
- M6(b) adds the getting-on-stage walk outside Ken's time estimate. move-to-and-hits' estimate (disply.311:116-126) doesn't include it, so time-fit scores and subscene stretching are off for exactly the stories it is meant to fix.
- Glass box: DETAIL's effects inside Director's walk (dichar.103:158-245) have no actor or note to show. The page needs to explain how deliberateness bends paths, or DETAIL breaks the rule that the glass box explains anything new. M4 would also write the same missing-relationship note up to four times per sibling (the four meet-description-of calls in likes, prereq.19:115-118); notes need de-duplication.
- S2 tests 'weak OR good' (returns t on the first match), but Ken asks for a character 'ideally ... weak and good' (L2758) and settles for neither only if need be (L2768-2770). Both, then either, then anyone is the faithful order of preference.
- The reason given for leaving kills out ('it would let the stepmother kill Cinderella') is about steering the outcome, which is close to Ken's definition of cheating (L4952-4954). The reason that holds up is representational: Ani has no notion of death or of a character leaving for good, and of resurrection (L2738-2740).

### Fixes

- Add a repair, in MEND or SLIPS, to COSUG's change:-package and change-to:-package combine (cosug.215:455-520): read (get (get s 'value) 'value) when the old 'display key is absent, citing Ken's format comment (cosug.215:449-453). Then check combine-change-package-suggestions and combine-change-to-package-suggestions with two real suggestions. KNOWEM needs this repair. Rerun the pride experiment as a fast test: define pride after EMOTE, run pass 2 for kept-apart, and expect no error and a combined speed change for the stepmother.
- Move every MEND, SLIPS and KNOW redefinition of a Ken function into (+after-load '|ken;<file> >| ...) with the saved-expr idiom. That includes all three M6 generator functions and M3's wrapper of establish-personality-suggestions. In ext.test.js, force-load each parent file and assert that the revival's version is installed.
- At boot, for every new top-level actor or function a REVIVE file defines lazily, put a tags entry (defprop <name> |ken;<parent>| actor-load or autoload): move-to, helps-along, moves-away-from, follows-behind, follows, gentle, rough, timid ..., dislikes, fears, pride, anticipation and the other feelings. Alternatively, have the filters (M3, M5(a)) do (actor-of '<parent-root>) before testing exists?. Add a stress story whose only task is (convey (meets a b)) and one whose characters use only KNOW words.
- Move M1 to pass 2, like M2. Keep pass 1, and the CP it writes, exactly as Ken's code makes it, (not X) included. In the +after-load on KEN;CP, narrow (not X) with pick-value-with-variety over the remaining values, using counts rebuilt from the CP's choices for that element, and note it on the choice point. Weightify's guard maps any (not X) that is left. Cite L2658-2659 honestly: (not X) is Ken's value, and Director's weightify (interf.149:899-904) needs one of three. Drop the 'old saved run' re-narrowing.
- Have glassBox omit `repairs` when :revival-noted is empty, or have check-1978 compare glass.json with that key removed, so that the MEND contract can hold.
- Make neighbor sharing follow Ken: share a neighbor's establish suggestions only when the task's descriptor has no establish suggestions of its own (dscrp.17:183, 'bad should get most from its neighbor'), and at the same strength, as COSUG's neighbor source keeps it. This also keeps dislikes from adding to hates in Ken's Introduction.
- Base the CP-29 rule check and the badges on the live closure after loading: for each KNOW word, read (ask w recall your neighbors) and (ask w recall your opposites) in a booted Lisp. Fail if any word with suggestions of its own reaches a CINDY word. Have vocabulary() reproduce char.2's propagation.
- In M6(a), count as in the scene every character named in any of the scene's task descriptions, not only scene-participation subjects (for example, collect the characters from each task's (task: description ...)). Keep Ken's scene-participation test as the first preference.
- Rewrite the KNOW contract and reports/ext expectations to name the predicted Cinderella diffs: Introduction, helps-along with the Prince brought on, follows-behind for is-obedient-to, and dislikes' avoids among the related suggestions; Kept Apart, pride's slowing of the stepmother once the combine repair is in. Rewrite the SLIPS-alone prediction: the helps tasks are chosen and then dropped, accompanys may be lost and the Prince may not appear. Either make SLIPS require KNOW or ship that diff with its explanation.
- Add to SLIPS: S6, pass-prerequisite-test's 'prerequisite vs 'prerequisites (chomet.123:559); S7, MIDDLE's '((not low) ...) vs (not bottom) (elemnt.1:171). Document CINDY's physical strong. Correct S5 by removing relate.22:79.
- Fix the sketch details: estimate move-to's and bring-on's getting-on-stage time (add-to-estimates, as goes-to-and-accompanys does at disply.311:177-184); de-duplicate repair notes per actor and kind; have S2's is-described-as prefer all descriptors, then any, then anyone.
- Correct the changes list: checkStory and emotionOk live in app/film.template.html; record `extensions` in the stored run object and in the film file's inner JSON (format "ani-film", version 1); cite interf.149:374 for away-from.
