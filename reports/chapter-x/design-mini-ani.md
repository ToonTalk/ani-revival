# Mini-Ani: Ani's society of experts as an Agent Kit example, filmed in Logo

*One of four designs behind [PLAN.md](PLAN.md), written by a design agent on 9 October 2026 and then reviewed adversarially. Where the review below finds an error, the plan's corrected version is the one to follow.*

## Summary

Build the mini-Ani as an Agent Kit example under "＋ New society", not as a tenth microworld. It is a society of ordinary agents:
- a Cast;
- four suggesting experts (Personality, Looks, Relationships, Taste), whose knowledge is copied from dscrp.17, relate.22, emote.9 and glosug.41 into editable slots;
- Choice Points that settle the experts' disagreements and say why;
- a Method Chooser and a Director.

AI agents can be switched in as extra voices that the Choice Points weigh like any other: an AI Animator, You, a Reader and a Narrator.

The one new kit feature is films: Logo's WAIT keeps a frame, so each scene's Logo program plays at Ani's 4 frames a second. Everything lives in the agent-construction-kit repo, so the 1978 film can't be affected.

The powerful idea comes from Ken's Ch. VIII.B and Ch. X: taste can be built. Many small experts argue in the open, the film improves when you add knowledge, and every choice can say why.

## The design

## 1. The powerful idea, and the card

**The idea: taste can be built.** Small experts each suggest how a character should move and look. Choice Points settle their arguments in the open. So a film improves by adding knowledge, not by making any agent clever, and every choice can say why.

This is Ken's own framing:
- "a large database rather than a very smart system" (L4302–4303);
- Ani is "even better than a glass box because one can perform experiments" (L5431–5432);
- a student "could also replace Ani's knowledge base with his or her own" (L3966–3968).

**The card** (EXAMPLES entry and seed):
- **Title:** Mini-Ani
- **Question:** "Why is Cinderella small and slow?"
- **Intro:** "In 1978 Ken Kahn's program Ani made cartoons from story descriptions. Here small experts each suggest how a character should move and look, the Choice Points settle their arguments and say why, and a Method Chooser and a Director turn the choices into a film you can play. It needs no AI model; AI agents can join in."
- **Openers:** "Which agent decides how big Cinderella is?", "What happens when two experts disagree?", "What would the film be like with no Looks expert?"
- **about** (the example's one-line description): "Runs without a model. Switch on the AI Animator, You or the Narrator to add voices; any model that writes short lines will do." It links to toontalk.github.io/ani for the real 1978 film.

## 2. Where it lives, and versions

All files are in C:/Users/toont/Documents/GitHub/agent-construction-kit. The seed is `makeMiniAni()` in SEEDS, with no `seedVersion` (examples don't have one). It is added to `EXAMPLES` (index.html:4383) and `AK.Seeds` (4419), and exported as examples/mini-ani.json.

Three releases, each with its own Swedish patch, artifact rebuild, SPEC §14 entry and HANDOFF update:
- **1.13.0:** films.
- **1.14.0:** Mini-Ani, programs only.
- **1.15.0:** the AI agents.

## 3. The one new kit feature: films (WAIT keeps a frame)

Today WAIT only counts a step (index.html, Logo `def("WAIT", 1, () => guard.tick())`), and CLEARSCREEN empties the ops, so only the final state is ever seen.

**The new behavior.** `WAIT n` keeps a copy of the picture so far as one frame. Its input is in 60ths of a second, as in Berkeley Logo, so `WAIT 15` is a quarter second. That gives 4 frames a second, the rate at which Ani's films were previewed.

The idiom is ordinary Logo animation: `FOR [T 1 12] [CS … draw everyone … WAIT 15]`.

**Model layer:**
- The turtle (makeTurtle, ~1031) gains `frame(n)` and returns `film: [{ops, ms}]`. It is capped at 240 frames and 100,000 ops in all; past the cap a note says so.
- Name the list `film`: the interpreter already uses `frames` for variable scopes (~1291).
- Programs with no WAIT are unchanged.

**Engine** (`activateRenderer`, 5113–5126):
- `run.renders[id].film` is kept in memory.
- `entry.render.frames = n` is added, and `data.frames = n`, so a rule or program can test it.
- The Renderer's words add "It is a film of 32 frames (8 seconds)."

**Interface (PICTURES, STAGE, TRACE):**
- `filmOf(render, run)` reruns the Logo when the film isn't in memory, cached like `imgCache`, since traces store Logo and never PNGs.
- A stage film player has ▶ / ⏸, a frame slider and "frame 7 of 32", in the style of the Replay control. Its state is `app.ui.film`, keyed by renderId, so repaints during a run don't restart it.
- A new film starts playing when it arrives during a run at slow or normal speed.
- Round cards and Renderer trace entries get a 🎞 mark.
- The exported trace page (which must stay script-free, translation.test.mjs:63–66) shows a film's first, middle and last frames as three images.
- Vision models still get the last frame.

**Docs.** The learner guide's Logo reference and the Helper facts gain one line. LOGO_HELP, the prompt text given to model Artists, is left alone, so no existing microworld changes behavior.

**Two small refinements** (generic, separately tested, and Ken may veto them):
1. **A model is needed only for reachable AI agents.** `beginRun` (6146) asks for a model when any model agent exists. Make it ask only when an AI agent can be reached from the chosen start through switched-on rules. This is a refinement of 1.5.0 A2. Without it, a society with switched-off AI agents can't run on a page with no model set up.
2. **The start box grows.** The start textarea is `rows="2"` (6497); let it grow with the start's lines, up to 12, so a story is readable.

## 4. The society (default: 9 agents on; 4 AI or person agents behind switches)

| Agent | Kind | Role | 1978 counterpart |
|---|---|---|---|
| 🎭 **Cast** | program `ani-cast`, round agent | Reads the story, keeps who-is-what in memory, sends one scene per round | char.2, scene.9, cindy.46 |
| 💭 **Personality** | program `ani-expert` | Suggests from personality and movement words | dscrp.17 |
| 🪞 **Looks** | program `ani-expert` (second instance) | Suggests from physical words and social conventions | Ch. X A.1, new |
| 🤝 **Relationships** | program `ani-relations` | Turns "A dominates B" into comparisons | relate.22 |
| 🎚️ **Taste** | program `ani-taste` | The film's global descriptors | glosug.41, cindy.46's cinderella-film |
| ⚖️ **Choice Points** | program `ani-choice-points`, collects | Weighs and settles the suggestions | choose.198, cosug.215, postpo.28, chocho.19, film.17 |
| 🧭 **Method Chooser** | program `ani-methods` | Picks a display method per task | convey.64, chomet.123, prereq.19 |
| 🎬 **Director** | program `ani-director` | Plans the scene's timing and writes the Logo film | scene.9 planning, disply.311, aninit.65, poly.29 |
| 🖼️ **Renderer** | built-in | Draws and plays the film | the TV turtle |

Behind switches:
- ✏️ **AI Animator** (model, stateless, plain-text lines);
- 🙋 **You** (`human`);
- 🎙️ **Narrator** (model; collects, wait 6);
- 📖 **Reader** (model; the 4th start goes to it).

**Rules** (send data unless noted):
- Cast → Personality, Looks, Relationships, Taste, Choice Points.
- Each expert → Choice Points.
- Choice Points → Method Chooser → Director → Renderer.
- Renderer → Cast (words), which is the loop: the next scene is the next round.
- Off by default:
  - Cast → AI Animator (words) and AI Animator → Choice Points (words);
  - Cast → You and You → Choice Points;
  - Method Chooser → Narrator (words);
  - Reader → Cast (words; it only fires from the 4th start).
- When the story is over, the Cast answers "The end." with `pass: false`. Its "always" rules are held, as with the Tic-Tac-Toe Referee, and the run finishes. The Narrator's collected scenes are then flushed, because the engine flushes a waiting collector when the queue empties (5192–5196).
- `roundLimit` 6.

**Variants** (5 of the 6 allowed):
1. "Like Ani in 1978: no Looks expert, so the Director uses Ken's shapes": star, square, circle, triangle, from aninit.65:36–47.
2. "The AI Animator suggests too."
3. "Only the AI Animator suggests": Personality, Looks and Relationships are off.
4. "You suggest too: the run waits for your lines each scene."
5. "A Narrator tells the whole film in words at the end."

**Starts** (each goes to its own agent; shown as tabs by startHTML):
1. **"Cinderella, as Ani told it"** → Cast:
   ```
   Cinderella is shy, good, friendly, hardworking, beautiful and shabby.
   The Stepmother is mean, selfish, strong and evil.
   The Godmother is good, kind, strong, pretty and magical.
   The Prince is good, stubborn, determined, beautiful and strong.
   The Stepmother dominates Cinderella. Cinderella obeys the Stepmother. The Godmother helps Cinderella.
   Scene 1: Cinderella is shy. The Stepmother dominates Cinderella.
   Scene 2: The Stepmother keeps Cinderella from the Prince. Cinderella becomes sad.
   Scene 3: The Godmother changes Cinderella from shabby to elegant. Cinderella becomes happy.
   Scene 4: Cinderella changes from shy to bold. Cinderella meets the Prince.
   ```
   These are cindy.46's words, with "ugly", "hates" and "loves" left out for children. Scene 3 is Ken's commented-out cinderella-beautified (cindy.46:94–105), made real.
2. **"The shy one joins in"** (A.3, L4389).
3. **"The mean one becomes kind"** ("evil characters repent", with "grumpy" listed as meaning the same as "evil").
4. **"Your own story, in your own words"** → Reader (1.15.0).

## 5. Ani's words (shared vocabulary)

**Twelve elements per character**, mirroring Ani's 12 per character in CP 29:
- **Motion (5):** speed slow/fast; liveliness calm/lively (activity-level); curves straight/curvy (path-curvature); steadiness steady/jerky (path-jaggedness); purpose aimless/purposeful (deliberateness).
- **Tendencies (2):** wary of / drawn to friends; wary of / drawn to strangers (the attraction-towards elements).
- **Looks (5)**, from Ch. X A.1's aspects and elements (L4271–4274): size small/big; shape smooth/pointed; detail simple/fancy; brightness dim/bright (intensity); warmth cool/warm (hue).

**Comparisons and values:**
- Comparatives: slower/faster, smaller/bigger, … and "same speed as".
- A relative-only **height**, below/above, so "dominates → appears above" (L4130–4132) finally reaches the picture. In 1978, relative-vertical-position had no absolute element to reach.
- Values: low, medium, high. "medium" is the middle word.

**Strength words.** "a bit" = 1, plain = 2, "very" = 3, matching numberify in cosug.215. "not" rules a value out.

**Source weights** are film.17:51–56's priorities, as numeric slots:
- own word 3, a word meaning the same 2, the opposite of a word 1;
- comparison 4, the film's taste 1;
- an AI agent 2, You 3.

**Language lives in slots.** Every word a program matches is in a slot or param:
- the vocabulary is in the Choice Points;
- the story format words ("is", "Scene", "changes", "from", "to", "becomes", "the") are in the Cast;
- the verbs are in the Method Chooser.

So a Swedish copy changes slot values and pseudocode text, and almost no JavaScript.

## 6. How each agent works

### Cast (`ani-cast`)

**Story format:**
- "X is a, b and c" describes someone. Inside a scene it means "show that X is a".
- "A verb B" before the scenes is a relationship; inside a scene it is an event.
- "A changes B from X to Y", "A changes from X to Y" and "A becomes Y" are changes. Emotion words ({happy, sad}) are emotional states; any other word is a description change.

**Each round** it sends one scene:
- only the characters named in it (scene participation, which fixes 1978's "scenes never end");
- their current words;
- the relations, and which on-stage pairs are friends ({likes, helps, loves}) or strangers (no words between them);
- the events.

**Before and after a change** (Ch. X A.3). When a scene changes someone, it also sends a stand-in, "Cinderella after", with the new words. The same experts and Choice Points then choose her after-values: the code report's "second set of choice points for a stand-in". After the scene, memory replaces "shabby" with "elegant", so later scenes recompute (A.3 option 1, L4396–4402).

**What it says.** A sentence it can't read is named, never silently dropped. Its say is the scene in words, which is also what the AI Animator and You read.

### Experts (`ani-expert`; Personality and Looks are two instances)

Pseudocode lines like `{shy} suggests {a bit slow, very wary of strangers, a bit drawn to friends}`:
- 11 lines, two of them blank (`{-} suggests {-}`) for children to fill;
- one line `{beautiful} brings {graceful}` (char.2:13–20's demon);
- "means the same" slots ({industrious=hardworking, stubborn=determined, good=kind}, dscrp.17:273–295);
- "means the opposite" slots ({brazen=shy, bold=shy, lazy=hardworking}, {weak=strong, clumsy=graceful, unfriendly=friendly}).

Each suggestion goes out as `{who, says, because, kind: own|same|opposite}`. Opposites are flipped by the Choice Points, which know the vocabulary, just as Ani flipped them in cosug.215:68–83. An unknown word suggests nothing and is named: "missing knowledge just drops a suggestion" (L2733–2737).

**Personality's slots are a transcription of dscrp.17:**
- shy: speed low/low, strangers −high/high, friends +low/low;
- hard-working: (not low)/medium, activity high/high, deliberateness high/medium;
- graceful, friendly, kind, evil, strong, determined and mean, likewise.

The friendly and kind tendencies now count. In 1978, dscrp.17:106–108 spelled them attraction-to-*, so Ani ignored them.

**Looks' slots are new knowledge, each line citing the thesis:**
- "smooth is friendly" and "bad guys wear black" (L4225–4229);
- bright and harmonious colors are pleasant (L5855);
- a strong ally drawn large (L6229–6242).

Examples: beautiful {smooth, a bit bright, a bit fancy}; shabby {very dim, simple, a bit small}; magical {very fancy, very bright}; evil {very dim, very pointed}; shy {a bit small, a bit dim}; kind {warm, a bit smooth}. "elegant" is known, as in 1978, only as shabby's opposite (dscrp.17:289), so it arrives flipped: very bright, fancy.

### Relationships (`ani-relations`)

- `{dominates} suggests A is {faster, bigger, above} than B`. This is relate.22:58–63 plus Ken's own comment there, "even more typical would be size".
- `{likes} suggests {a bit same speed, a bit same liveliness}` (loves' same-as, low).
- Opposites {obeys=dominates, dislikes=likes} and same-meaning words {rules=dominates, loves=likes}.

### Taste (`ani-taste`)

- Levels {low, medium, high}. Ken's cinderella-film settings (cindy.46): energy {high}, flashiness {low}, variety {medium}, obviousness {high}, complexity {low}.
- Energy suggests fast and lively for everyone (glosug.41:10–24).
- Flashiness suggests slow, calm, small and dim when low. This implements Ken's comment at glosug.41:39–40.
- The whole taste goes on in data, for the Choice Points and the Director.

### Choice Points (`ani-choice-points`, collects)

**Waiting.** It waits for "the scene and the experts' suggestions: up to {7} messages, or until nobody else has anything to say". That is true to the engine's flush-on-empty, so switched-off experts just mean fewer messages. It reads programs' data, and plain lines ("Name: a bit slow, big (because …)") from AI agents and You.

**For every character × element**, the focus {Cinderella} first and then cast order:
1. Each value's tally is the sum of strength × source weight; "not X" subtracts.
2. A comparison waits until its other's value is chosen. "faster than X" then becomes "not X-or-slower" (cosug's relative-three-values-and-not).
3. If two choices wait for each other (Ken's "deadly embrace", postpo.28:38–51), the first goes without its comparison, and the say reports it.
4. The film's variety adds a weak suggestion for the value used least so far (record-choice counts, choose.198:596–603), kept in memory across scenes.
5. If one value is more than {2} times as strong it wins (choose.198:429, "for now good enuf").
6. Otherwise low against high meets in the middle (Ani's top-bottom compromise); neighbors go to the stronger; a tie goes to the one said first ("no-reason-at-all").
7. Nothing at all → medium. A choice is always one of three values, so 1978's "(not X)" and "none" failures can't happen.
8. A subtle film keeps only each character's {3} strongest differences (Ken's "which aspects", L4313–4316).

**What it says.** Each character's choices, with the value and its sources ("slow (graceful, shy; beat hardworking's 'not slow')"). Then every argument and how it was settled, the waits, and any words it couldn't read. The focus character is explained in full, within the 2,000-character say.

It also passes on `choices`, `strengths` (for the Director's relaxation), `changes` since the last scene, the scene and the taste.

### Method Chooser (`ani-methods`)

**Ways per task** (slots):
- someone is {shy}: {keeps away, stays at the edge};
- {friendly}: {goes along};
- {mean}/{evil}: {chases off};
- A {dominates} B: {looms over, chases off};
- A {keeps} B {from} C: {stands guard};
- {helps}: {goes along};
- {meets}: {come together};
- A {changes} B from X to Y: {goes to, then changes};
- A changes from X to Y: {comes closer bit by bit};
- {becomes} {happy}: {a bit faster, livelier, brighter}; {sad}: {slower, calmer, dimmer} (emote.9 joy; A.2 "intensity of the colors … increased", L4341).

**Crossing out and preferring:**
- A way is crossed out when its prerequisite fails: chases off and stands guard need A faster than B (disply.311:375, 619, read from the choices like prereq.19:27–39).
- It is also crossed out when it needs someone who isn't on stage.
- It prefers a way that is "best when" A is bigger (disply.311:621). That makes prereq.19:62's "for now just a dummy" `bigger` real.
- It prefers a way not used yet in the film (variety-score), remembered across scenes.

**Changes and failures:**
- "A change takes {8} frames (0: at once)" covers both A.2's instant-or-gradual (L4350) and A.3's recompute-or-portray.
- With no way left, it says so, and the character "moves about in its own way" (Ani's wander, L3391).

**What it says.** The plan, in order, with every crossing-out explained. That plain account, Ani's internal description, is what the Narrator turns into English (L4678–4690).

### Director (`ani-director`)

**Shapes.** Shape × detail picks a shape from Ken's classes (L4290–4293):
- circle = smooth simple, flower = smooth fancy, square = medium simple, pentagon = medium medium;
- triangle = pointed simple, star = pointed medium (Cinderella's 1978 shape), 9-point star = pointed fancy.
- One cell is empty: if no shape fits, it gives up the one of shape or detail with the weaker reasons and tries again. That is Ken's constraint relaxation and redetermination of "the least justified value" (L4296–4301), and the say reports it.

**Size and color:**
- Size {14, 22, 34} steps across, as a numeric list slot.
- Brightness × warmth index a 3×3 RGB table.

**Motion:**
- Speed {5, 10, 16} steps a frame.
- Curves wave the path, steadiness jags it, liveliness bobs.
- Purpose sets how often an idle character turns, using deliberateness as Ken asked (B.3 f, L4853).
- Tendencies drift characters toward or away from on-stage friends and strangers (B.3 c).
- Ease in and out over {2} frames (B.3 d).

**Timing:**
- Methods run in sequence when complexity is low, as Ken advised (L3411–3417); otherwise value changes run alongside (Ani's parasite subscenes).
- At most {32} frames, 4 a second.

**Ken's standing-guard questions as slots:** the guard waits {0} frames before blocking, and the prisoner almost gets away on try {2} (L4754–4760).

**Changes during a scene** (A.2, L4362–4367):
- In-betweening blends size and color.
- A shape change happens at the smallest point of a squash-and-grow, an interpolation path the say names.
- On contact, "come together" pulses both shapes (A.2 source 2, L4343).

**Output:**
- `program`: one Logo program per scene, kept under 3,900 characters because safeData cuts strings at 4,000 (index.html:479). If it would be longer, the Director uses fewer frames and says so.
- The program has a `TO` procedure per character (its looks) and a `FOR` loop per subscene (its motion), each with a comment.
- Its say gives frame ranges: "frames 13–20: Cinderella changes from shabby to elegant".
- Names under the characters: {yes}.

## 7. Chapter X items (1)–(4) inside the Mini-Ani

1. **Appearances** are chosen by exactly the machinery that chooses motion: the same elements, three values, sources and weights, as Ken argued in L2818–2846 and L4275–4277. The "1978" switch removes them.
2. **Changing appearances** comes from all three of Ken's sources (L4341–4348): emotions, inside a method, and the script. The "when" belongs to the Method Chooser and the "how" (path and dynamics) to the Director.
3. **Changing descriptions** (L4396–4423):
   - Recompute: the Cast's memory changes, and the Choice Points' `changes` show the difference next scene.
   - Portray: a before-and-after stand-in, bridged over {8} frames, plus the new method "comes closer bit by bit" for conveying a personality change.
4. **Doing better:**
   - A bigger knowledge base: the blank lines, and the AI Animator.
   - A better one: the animator's questions as slots.
   - Myriad details as visible slots: easing, deliberateness, sequence vs parallel, subtle vs obvious.
   - Ken's legitimacy rule holds (L4939–4954): the knowledge is transcribed or cited, never tuned to force an outcome.

## 8. Where AI agents belong (1.15.0)

Language goes to models; weighing and scoring go to programs.
- **AI Animator:** a stateless model told to answer in plain lines using only Ani's words, at most 4 suggestions per character. Its advice is weighed at {2} like any other voice, and any word it uses that the Choice Points don't know is named.
- **You:** a `human` agent, so a child joins the society as one more expert and can try to outvote "shy".
- **Reader:** turns a child's own story into the Cast's format. This is the kit's version of the revival's Phase 7.
- **Narrator:** collects the Method Chooser's plans and tells the film once at the end.
- Pretend personas `animator` and `reader` are added for tests only.

## 9. The glass box (the kit's version of "click a character to see why")

Pictures aren't clickable, so the why is in the words:
- **The Choice Points' focus slot.** This is Ani's own focus (film.17; cindy.46:171–176): the focus character is chosen first and explained in full. Type a name, press Run (instant, no model), and the trace says why each of her 12 values won and how every argument was settled.
- **The Method Chooser** says what it crossed out and why.
- **The Director** says which frames show which method, and the frame slider goes there.
- **The film** is a Logo program in the trace that can be edited and redrawn, as any picture can today.
- **Contracts** (Gets / Says / Remembers) head every program.

## 10. Questions (up to 10; each answerable in the default setup)

1. Why is Cinderella small and slow? Find who suggested it.
2. Which arguments did the Choice Points settle? Change {2} to 1, then to 100. Do the characters look more alike?
3. Fill an empty line ("brave suggests …") and use the word in the story. What changes?
4. Make shy suggest "very fast". Can the Stepmother still stand guard? Who says why not?
5. Switch on "Like Ani in 1978". What does the Looks expert add?
6. Set a change to take 0 frames. Which looks more like magic?
7. Switch on the AI Animator. When it disagrees with the programmed experts, who wins?
8. Switch on "You suggest too". Can you outvote shy?
9. Make the film subtle. How many things still show who is shy?
10. Who made this film: the experts, the Choice Points, the Director, or the people who wrote the knowledge?

## 11. Fit to the kit's constraints

**Sizes:**
- About +90–110 KB. The page goes from 673 KB to about 780 KB, under the 950 KB artifact cap.
- The model script goes from 389 KB to about 480 KB, under the 800 KB script cap.
- Each new JS program stays under 18,000 characters, so the translator's 20,000 cap still allows a learner's edit.
- Pseudocode stays at or under 3,000 characters, params at or under 30.
- Shipped slot values stay at or under 60 characters, because parseSlotText truncates edits there.

**Running:**
- Every program is deterministic (no `h.pick`), stays well under 100,000 steps, and runs in the artifact's in-page Fallback A.
- A programs-only run needs no model anywhere.

**Storage.** A 4-scene trace is about 40 KB before gzip, because traces store Logo, not frames.

**Safety.** Model calls carry the existing PREAMBLE. The default story avoids violence and romance; keeping "evil" (Ani's word) is Ken's call.

**Swedish:**
- sv/index.html is patched with the same script plus a Swedish phrase table, keeping its line count.
- The story becomes "Askungen är blyg, god, vänlig, flitig, vacker och sjaskig. …".
- sv/GLOSSARY.md gains an "Ani's words" table shared by the Cast, the experts, the Choice Points and the Method Chooser.

**Checks after each release:**
- `python tools/build_artifact.py`.
- `AK_HTML=sv/index.html node tests/run.mjs "any language"` and `"mini-Ani"`.
- `node tests/leftovers.mjs sv/index.html`.

## 12. The 1978 film stays exactly reproducible

**No shared code.** Nothing in the Mini-Ani reads or writes:
- C:/Users/toont/ani-revival/original;
- the revival's src/ or app/;
- C:/Users/toont/Documents/MIT-AI-Lab.

The kit and its build never load revival code, so CP 29 (102/102) and the 4 fps film can't be affected.

**A sanity check, not a dependency.** After 1.14.0, run `node tools/build-ani-bundle.mjs` in ani-revival once to confirm it still reports both.

**Honest labels.** The "Like Ani in 1978" switch is labeled as 1978's division of labor (no Looks expert, Ken's shapes), not as the 1978 film. The card links to the real film.

**The only revival-side change:** a note in ani-revival/PLAN.md under Phase 8 pointing to the kit's Mini-Ani.

## Alternatives considered

- - **name:** A tenth microworld (top-row button with a seedVersion)
- **why_not_or_why:** Rejected. HANDOFF.md's agreed next step is to stop adding microworlds and pilot the kit with children. Every recent addition (Evolution, Two Answers, Tic-Tac-Toe, Trail Mix Barter, Artist and Critic) went in as an example (SPEC §14, 1.4.0–1.7.0). As an example, the nine-world tests (worlds3.test.mjs:113, freeplay.test.mjs:190) and the teacher guide's model table stay as they are.
- - **name:** An example society under ＋ New society (EXAMPLES, index.html:4383) — CHOSEN
- **why_not_or_why:** Chosen. It is an ordinary saved society, so Look inside shows only agents and rules (SPEC §2.2). It is added with makeMiniAni(), an EXAMPLES entry and examples/mini-ani.json, and tests/translation.test.mjs already checks every example in every language.
- - **name:** Films as a Director↔Renderer loop: one frame per message, plus a flipbook over a round's pictures
- **why_not_or_why:** Rejected.
- Every frame becomes a trace entry, so a scene buries the glass box under dozens of Renderer turns.
- The film is capped by maxDeliveries (roundLimit×25+50, about 75 frames at 4 rounds).
- At 'fast' it plays at roughly 60 ms per delivery, and the saved trace grows with every frame.
- No single program shows how the scene was put together.
- - **name:** No new feature: a storyboard, or a stroboscopic still per scene
- **why_not_or_why:** Not the main path. It would work with today's Renderer and stay deterministic, but it isn't animation ("The essence of animation is change", L4324). Kept only as a fallback: the script-free exported trace page shows a film as its first, middle and last frames.
- - **name:** Embed the real Ani (the revival's MacLisp interpreter + Director bundle) as a built-in agent kind
- **why_not_or_why:** Rejected.
- app/film.html is 740 KB, so the kit (673 KB) would pass the 950 KB artifact cap in tools/build_artifact.py.
- Lisp isn't the kit's language, and children couldn't read or edit the knowledge in slots.
- It would be per-microworld code (against SPEC §2.2).
- Shared code would put the exactly reproducible 1978 film at risk.
- - **name:** An all-LLM society: every expert a model agent whose knowledge is English instructions
- **why_not_or_why:** Rejected as the default.
- It is stochastic, needs a model for every run, and costs about 5 calls a scene.
- The knowledge stops being explicit, which is the point of Ch. VIII.B (L3959–3968).
- It breaks the kit rule that judging and scoring go to programs.

Kept as a switch ('Only the AI Animator suggests'), so children can compare a big vague knowledge base with a small precise one.
- - **name:** One big Mini-Ani program with all its knowledge in slots
- **why_not_or_why:** Rejected.
- It hides the society, which is the lesson.
- It would break the 3,000-character pseudocode cap and the 30-param cap (sanitizeParams, index.html:4602).
- Experts couldn't be switched on and off with rules.
- - **name:** A separate library type per expert, versus one shared 'ani-expert' type used twice (Personality and Looks)
- **why_not_or_why:** Shared type chosen.
- Both the words and their suggestions sit in slots ("{shy} suggests {a bit slow, …}"), so the two instances differ only in slots.
- sanitizeAgent's slotOnlyEdit (index.html:4689) therefore restores both from the library on import, with their knowledge kept.
- Children grow the knowledge base by filling in blank lines without any translation, and one JavaScript program serves both experts.
- - **name:** AI suggestions as structured output fields, versus text lines ("Cinderella: a bit slow, big") read by the Choice Points
- **why_not_or_why:** Text lines chosen for AI agents and You; programs still send structured data.
- Lines are robust for small models (Gemini Nano) and read naturally in the trace.
- The same path lets a child be an expert (Papert's "compare Ani to a ten-year old", L5724).

## Changes, file by file

- - **file:** C:/Users/toont/Documents/GitHub/agent-construction-kit/index.html — LOGO (Logo `WAIT` def ~1321; makeTurtle ~1031)
- **what:** WAIT keeps a frame. It calls T.api.frame(n), where n is in 60ths of a second (WAIT 15 = a quarter second). The turtle returns `film: [{ops, ms}]`, capped at 240 frames and 100,000 ops, with `filmCut` set past the cap. Name the list `film`, not `frames`, which already means variable scopes in the interpreter. Programs with no WAIT are unchanged.
- - **file:** index.html — ENGINE activateRenderer (5113–5126)
- **what:** Keep run.renders[id].film. Add entry.render.frames and seconds, data.frames = N, and 'It is a film of N frames (S seconds).' to the Renderer's words.
- - **file:** index.html — PICTURES (5790–5856), STAGE (6377–6545), TRACE (6596–6830), traceDocument (7463)
- **what:** - `filmOf()` reruns the Logo when the film isn't in memory, cached like imgCache.
- A stage film player (▶ / ⏸, frame slider, 'frame i of n') keeps its state in app.ui.film, keyed by renderId, so repaints don't restart it. A new film auto-plays at slow or normal speed.
- A 🎞 badge on round cards (rcardHTML) and Renderer trace entries.
- The script-free exported page shows a film's first, middle and last frames.
- - **file:** index.html — RUNS beginRun (6146), startHTML (6497)
- **what:** Refinement: ask for a model only when an AI agent can be reached from the chosen start through switched-on rules (generalizes 1.5.0 A2). The start textarea grows with its lines, up to 12.
- - **file:** index.html — LIBRARY (2733–3774)
- **what:** Seven new libAgent entries, each with:
- hand-written JS (static-check clean: no regex, no try, braces on every loop, h.tick() in loops);
- a line map covering every pseudocode line;
- slots and at least 4 scenarios, including one named 'no: …', using '=param' and '{=param}'.

The entries:
- ani-cast (round agent; memory; pass:false at the end);
- ani-expert (word lines and blank lines in slots; same and opposite slots);
- ani-relations;
- ani-taste;
- ani-choice-points (collect; vocabulary, weights, ratio, focus and subtle-count slots);
- ani-methods (verbs → ways; prerequisites, best-when, variety; change frames);
- ani-director (shape table with relaxation, sizes, speeds, frames, easing, guard slots; Logo output ≤ 3,900 characters).
- - **file:** index.html — PRETEND (1887–2420)
- **what:** Test-only personas `animator` (deterministic lines from the Cast's words) and `reader` (turns a fixed free-text story into the Cast's format). The Narrator uses `generic`.
- - **file:** index.html — SEEDS (3848–4420)
- **what:** makeMiniAni(): the card, 4 starts, 13 agents (4 behind switches), the rules, 5 variants, roundLimit 6. Add an EXAMPLES entry {id: 'miniani', emoji: '🎬', about} and export it in AK.Seeds. No seedVersion.
- - **file:** index.html — WORDS (5489), HELPER facts (5413, 5417), GUIDES (7360, 7389), SAY phrases, AK.VERSION (435)
- **what:** - FIELD_WORDS frames → 'film frames'.
- Helper facts: films, and the Mini-Ani example.
- Learner guide: a Logo WAIT line and an example paragraph. Teacher guide: the example and its powerful idea.
- Read aloud: 'made a film of N frames'.
- Versions 1.13.0, 1.14.0, 1.15.0.
- - **file:** C:/Users/toont/Documents/GitHub/agent-construction-kit/examples/mini-ani.json
- **what:** The society exported from the kit (agent-kit-export wrapper), so the example can be imported as a file.
- - **file:** tests/logo.test.mjs, tests/engine.test.mjs, tests/ui.test.mjs, tests/translation.test.mjs, tests/artifact.test.mjs, tests/library.test.mjs, NEW tests/miniani.test.mjs
- **what:** - Film tests across the Logo, engine, interface and export tests.
- library.test.mjs:7: typeId list 24 → 31 (and its test name).
- miniani.test.mjs: the example's behavior (see the tests list).
- artifact.test.mjs: size checks for the new build.
- - **file:** C:/Users/toont/Documents/GitHub/agent-construction-kit/sv/index.html, sv/GLOSSARY.md, TRANSLATING.md
- **what:** - Patch sv/index.html with the same script and a Swedish phrase table, keeping its line count.
- Translate the Mini-Ani's slot values, pseudocode, starts and card, keeping the JS nearly identical.
- GLOSSARY: add an 'Ani's words' table (story format words, descriptor words, element and comparative words, strength words, verbs and ways).
- TRANSLATING.md: note which shared words must match across agents.
- - **file:** artifact/agent-kit-claude-artifact.html, artifact/agent-kit-claude-artifact-sv.html
- **what:** Rebuild with python tools/build_artifact.py after each release. It asserts the page is under 950,000 bytes and each script under 800,000.
- - **file:** README.md, SPEC.md §14, HANDOFF.md
- **what:** README describes the example and films. SPEC §14 gets append-only entries for 1.13.0 (films and refinements), 1.14.0 (Mini-Ani, programs only) and 1.15.0 (AI Animator, You, Reader, Narrator). HANDOFF gets the state, PASS count and fingerprint.
- - **file:** C:/Users/toont/ani-revival/PLAN.md
- **what:** One note under Phase 8: the Agent Kit's Mini-Ani is a teaching miniature that shares no code with the revival. Nothing else in ani-revival changes, and original/ and MIT-AI-Lab stay untouched.

## Lisp sketch

```lisp
;; ===== 1978 actor → Mini-Ani agent (what each kit program stands in for) =====
;; dscrp.17 descriptors (process suggestions …)  → ani-expert  (Personality, Looks)
;; char.2 neighbors/opposites, beautiful→graceful → ani-expert "same / opposite / brings" slots
;; relate.22 dominates/loves                      → ani-relations
;; glosug.41 (energy level) (flashiness level)    → ani-taste
;; choose.198 + cosug.215 + postpo.28 + film.17   → ani-choice-points
;; convey.64 + chomet.123 + prereq.19 (faster)    → ani-methods
;; scene.9 subscenes + disply.311 + aninit.65     → ani-director  (Logo film)

----- Choice Points: shipped pseudocode ({…} are slots) -----
Gets: the scene from the Cast, and suggestions. Says: what each character is like, and why. Remembers: what was chosen before.
wait for the scene and the experts' suggestions: up to {7} messages, or until nobody else has anything to say
a suggestion is a word, with {a bit} (weaker), {very} (stronger) or {not} (rules it out) before it
speed: {slow/fast, slower/faster} · liveliness: {calm/lively, calmer/livelier} · curves: {straight/curvy, straighter/curvier}
steadiness: {steady/jerky, steadier/jerkier} · purpose: {aimless/purposeful, more aimless/more purposeful}
friends: {wary of friends/drawn to friends} · strangers: {wary of strangers/drawn to strangers}
size: {small/big, smaller/bigger} · shape: {smooth/pointed, smoother/pointier} · detail: {simple/fancy, simpler/fancier}
brightness: {dim/bright, dimmer/brighter} · warmth: {cool/warm, cooler/warmer} · height: {below/above}
{medium} is the middle of each; "same speed as X" means X's value
a suggestion counts its strength (a bit 1, plain 2, very 3) times where it came from:
  the character's own word {3}, a word meaning the same {2}, the opposite of a word {1}, a comparison {4}, the film's taste {1}, an AI agent {2}, You {3}
the focus {Cinderella} is chosen first and explained in full; then everyone else, in order
for each thing about each character, add up the suggestions for each value
  a comparison like "bigger than X" waits for X's value, then rules out X's value and below
  if two choices wait for each other, the first goes without its comparison
  the film's variety gives a weak extra suggestion to the value used least so far
  if one value is more than {2} times as strong, it wins; otherwise low and high meet in the middle, and neighbors go to the stronger
  if nobody suggested anything, it is medium
a subtle film keeps only each character's {3} strongest differences
say each character's choices and why, every argument and how it was settled, and any word I couldn't read

----- Personality (ani-expert): slots transcribed from dscrp.17 -----
{shy} suggests {a bit slow, very wary of strangers, a bit drawn to friends}
{hardworking} suggests {not slow, very lively, purposeful}
{graceful} suggests {slow, curvy, steady}
{friendly} suggests {a bit lively, very drawn to friends, drawn to strangers}
{evil} suggests {very jerky, a bit straight, purposeful, a bit lively}
{strong} suggests {fast, very purposeful, a bit steady}
{-} suggests {-}
{beautiful} brings {graceful}
a word that means the same gets its suggestions: {industrious=hardworking, stubborn=determined, good=kind}
a word that means the opposite gets them turned around: {brazen=shy, bold=shy, lazy=hardworking}

// ----- Choice Points: the core of run(), kit-safe JS (no regex, no try, braces on loops) -----
function settle(tally, firstSaid, ratio) {                // choose.198:313-355, simplified
  const vals = [1, 2, 3].filter(v => tally[v] > 0)
    .sort((a, b) => (tally[b] - tally[a]) || (firstSaid[a] - firstSaid[b]));
  if (vals.length === 0) {                                // nobody, or only "not …"
    return { v: tally[2] >= 0 ? 2 : (tally[1] >= tally[3] ? 1 : 3), how: "nobody suggested otherwise" };
  }
  const top = vals[0], next = vals[1];
  if (next === undefined) { return { v: top, how: "nobody disagreed" }; }
  if (tally[top] > ratio * tally[next]) { return { v: top, how: "more than " + ratio + " times as strong" }; }
  if (Math.abs(top - next) === 2) { return { v: 2, how: "met in the middle" }; }   // top-bottom compromise
  return { v: top, how: tally[top] > tally[next] ? "stronger" : "said first" };
}
// the choosing loop: comparisons wait; a deadly embrace (postpo.28:38-51) lets the first go without
let left = order.slice(), guard = 0;                      // order: the focus first, then cast order
while (left.length > 0 && guard < 2000) {
  h.tick(); guard++;
  let k = left.findIndex(p => waitsOn(p).every(o => chosen[o + "/" + p.el] !== undefined));
  const embrace = k < 0;
  if (embrace) { k = 0; }
  const p = left.splice(k, 1)[0];
  const tally = { 1: 0, 2: 0, 3: 0 }, firstSaid = { 1: 99, 2: 99, 3: 99 };
  for (const s of sugs.filter(x => x.who === p.who && x.el === p.el)) {
    h.tick();
    let v = s.v;
    if (s.step !== undefined) {                           // "bigger than X": rule out X's value and below
      const x = chosen[s.of + "/" + p.el];
      if (x === undefined) { continue; }                  // only when it went without (embrace)
      for (let w = 1; w <= 3; w++) { if (s.step > 0 ? w <= x : w >= x) { tally[w] -= s.weight; } }
      continue;
    }
    if (s.not) { tally[v] -= s.weight; continue; }
    tally[v] += s.weight;
    firstSaid[v] = Math.min(firstSaid[v], s.n);
  }
  addVariety(tally, memory.counts[p.el], taste.variety, params.taste);   // glosug.41 pick-value-with-variety
  const r = settle(tally, firstSaid, Number(params.ratio) || 2);
  chosen[p.who + "/" + p.el] = r.v;
  why.push({ who: p.who, el: p.el, v: r.v, how: r.how, embrace: embrace });
}

; ===== The kit feature, in the model layer =====
// LOGO: WAIT keeps the picture so far as one frame of a film (60ths of a second, as in Berkeley Logo:
// WAIT 15 is a quarter second, 4 frames a second, the rate Ani's films were previewed at).
def("WAIT", 1, (a, t) => T.api.frame(num(a[0], t)));
// TURTLE (makeTurtle): `film`, not `frames`, which already names the interpreter's variable scopes
frame(n) {
  guard.tick();
  const ms = Math.max(20, Math.min(5000, Math.round(num(n, 15) * 1000 / 60)));
  if (film.length < 240 && filmOps + ops.length <= 100000) { film.push({ ops: ops.slice(), ms }); filmOps += ops.length; }
  else { filmCut = true; }
},
result() { return { ops, dots, labels, segments, film: film.length ? film : null, filmCut }; }

; ===== What the Director sends the Renderer for Scene 3 (abridged; under 3,900 characters) =====
; Scene 3 of 4: the Godmother changes Cinderella from shabby to elegant. Cinderella becomes happy.
; 30 frames, 4 a second. Cinderella: small, dim to bright, simple to fancy (a circle, then a flower).
TO FLOWER :X :Y :S
  REPEAT 6 [PU SETXY :X + :S * SIN (60 * REPCOUNT) :Y + :S * COS (60 * REPCOUNT) PD CIRCLE :S / 2]
END
TO CINDERELLA :X :Y :K   ; K: 0 shabby ... 100 elegant (in-betweened; the shape swaps when smallest)
  SETPC (LIST 110 + 1.4 * :K 60 + 1.1 * :K 30) SETPENSIZE 2
  IFELSE :K < 50 [PU SETXY :X :Y PD CIRCLE 10 - :K / 10] [FLOWER :X :Y 6 + (:K - 50) / 6]
END
TO GODMOTHER :X :Y
  SETPC [255 200 70] SETPENSIZE 3 FLOWER :X :Y 14
END
; frames 1-12: the Godmother goes to Cinderella (fast, straight, purposeful)
FOR [T 1 12] [CS GODMOTHER 170 - 18 * :T 40 CINDERELLA -60 0 0 WAIT 15]
; frames 13-20: Cinderella changes from shabby to elegant, over 8 frames
FOR [T 1 8] [CS GODMOTHER -46 40 CINDERELLA -60 0 12.5 * :T WAIT 15]
; frames 21-30: Cinderella becomes happy (a bit faster, livelier, brighter); she moves about so it shows
FOR [T 1 10] [CS GODMOTHER -46 40 CINDERELLA -60 + 9 * :T 8 * SIN (72 * :T) 100 WAIT 15]
```

## Tests

- logo.test: WAIT keeps the picture so far as a frame. CLEARSCREEN followed by drawing makes the next frame. The final picture (ops) is exactly what it was before films existed.
- logo.test: a program with no WAIT has no film. Every existing drawing, and every shipped scenario that runs Logo, is unchanged.
- logo.test: films stop at 240 frames or 100,000 ops with filmCut set. A runaway WAIT loop is still stopped by the 100,000-step limit.
- engine.test: the Renderer's data has frames: N, its words say it's a film of N frames (S seconds), and run.renders keeps the film. A vision model still gets the last frame.
- ui.test: a film shows ▶ / ⏸, a frame slider and 'frame i of n' on the stage; a still shows none. Repaints during a live run don't restart the film. Round cards and Renderer trace entries show 🎞.
- translation.test (any language): the exported trace page still has no <script>, and shows a film as its first, middle and last frames.
- runs.test (new or in engine.test): a society whose only AI agents can't be reached through switched-on rules runs with connection 'none'; switching one on asks for a model.
- library.test: 31 typeIds. Each new program passes the static check, all its scenarios (at least 4, including a 'no: …' one), full line-map coverage, and the slots-in-pseudocode check.
- ani-choice-points scenarios:
- shy, graceful and the film's flashiness make Cinderella slow, beating hardworking's 'not slow' by more than {=ratio} times;
- 'no: a word nobody knows suggests nothing, and is named';
- the Stepmother's size waits for Cinderella's;
- a deadly embrace lets the focus go first;
- low against high meets in the middle;
- an AI agent's line counts {=ai};
- a subtle film keeps {=subtle} differences.
- ani-methods scenarios: stands guard is crossed out when the guard isn't faster, with the reason. 'Best when bigger' prefers looms over. A way already used is passed over for variety. No way left → 'moves about in its own way'.
- ani-director scenarios:
- the Logo is under 3,900 characters for 6 characters and 6 events, and has 'fewer frames' in its say when it had to shrink;
- an empty shape cell is relaxed on the weaker-supported value;
- a change of 0 frames is instant;
- 'the prisoner almost gets away on try {=almost}'.
- miniani.test: the example is sound. An export/import round trip restores every program from the library by typeId, and a slot-only knowledge edit (a filled blank line) survives import.
- miniani.test: the default story runs to 'The end.' with no model (connection 'none'). Two runs with different seeds give identical traces, since no program uses randomness.
- miniani.test: 4 scenes give 4 Renderer activations. Each is a film of at least 16 frames, its Logo runs without error, and each scene is one round.
- miniani.test, headline answer: in scene 1 the Choice Points' say has Cinderella 'small' and 'slow' with 'shy' among the reasons, so the question has a real answer in the default setup.
- miniani.test: with shy's slot set to 'very fast', the Method Chooser crosses out stands guard and says why, and the film is still made.
- miniani.test: the 'Like Ani in 1978' switch sends no Looks messages, and the Director draws Ken's shapes in cast order. Cinderella is REPEAT 5 [… RT 144] (aninit.65:36-47).
- miniani.test, changing descriptions: in scene 3 the Cast sends 'Cinderella after' and the Director in-betweens over {8} frames. In scene 4 Cinderella's words include elegant and not shabby, and the Choice Points report what changed.
- miniani.test, any language: no word in the default story is unknown to the experts. This checks that the shared words still match after translation.
- miniani.test (1.15.0), using the pretend 'animator' and 'reader' personas:
- the AI Animator's lines are weighed at {=ai} and appear in the Choice Points' reasons, and an unknown word it uses is named;
- 'You suggest too' makes the run wait once per scene, and your lines count {=you};
- the Narrator collects the plans and speaks once, at the end.
- miniani.test, fidelity report against CP 29 (reports/pass1-choices.txt): prints where the Mini-Ani's speed, liveliness, curves, steadiness, purpose and tendencies agree with Ani's 1978 choices for the four characters. It asserts only a recorded floor and is never used to tune the knowledge (Ken's 'cheating' rule, L4952-4954).
- translation.test 'any language' covers the new example automatically. Run AK_HTML=sv/index.html node tests/run.mjs "any language" and "mini-Ani", and node tests/leftovers.mjs sv/index.html.
- artifact.test: both builds are under 950,000 bytes, with every inline script under 800,000; the Mini-Ani runs there in Fallback A with no model.
- ani-revival sanity check (no files change there): node tools/build-ani-bundle.mjs still reports CP 29 102/102 and the 4 fps film frame for frame.

## Risks

- Size: about +90–110 KB leaves roughly 170 KB of headroom under the 950 KB artifact cap. Later features will have less room.
- safeData cuts strings at 4,000 characters (index.html:479) without warning, so an over-long film would arrive as broken Logo. The Director must budget below 3,900 characters, and a stress scenario guards this.
- parseSlotText truncates an edited slot to 60 characters. Knowledge lines are kept terse, but a child typing more loses the end. One option is raising the string limit to 120, which is a separate small change.
- The Choice Points rely on flush-when-the-queue-empties to collect 'up to {7}'. Adding an eighth source without raising the slot would split a scene. The pseudocode says so, and a scenario covers it.
- This is a miniature, not Ani:
- it has 12 elements and three values;
- rhythm, repetitiveness, path-length, acceleration and subscene stretching are missing;
- a word is looked up by every expert, not typed as physical or personality.
The labels must not suggest it reproduces 1978. The Godmother's speed is fast here but medium in CP 29.
- Shared words across the Cast, the experts, the Choice Points, the Method Chooser and some Director literals must match in each translation. The tests guard the chain, but sv/ must be patched in step.
- The library grows from 24 to 31 entries, so '+ Add an agent' gets longer. Consider grouping them as 'Mini-Ani's agents'. HANDOFF's warning about menu size for one child applies.
- Child safety: Ani's own words 'evil' and 'mean' are kept, and the Prince is in the story; 'ugly', 'hates' and 'loves' are dropped. Ken decides; 'grumpy' can replace 'evil' through the same-meaning slot.
- The A2 refinement (a model is needed only for reachable AI agents) and the growing start box are generic changes beyond the one new feature. Ken may prefer to hold them.
- AI Animator, Reader and Narrator are untested with live models (keyless Claude in the artifact, Gemini Nano). Small models may wander off Ani's words; the Choice Points name those words but can't use them.
- The 13-agent strip is busy for a first look. If the pilot shows it's too much, the four switched-off agents could move to 1.15.0 only, or be added from the library.
- Timing: HANDOFF says pilot with children before adding more. This is an example, but it adds a kit feature, so Ken should decide when it ships.

## Effort

About 6–8 working sessions in four stages. Each stage ships with its tests, Swedish patch, artifact rebuild and SPEC/HANDOFF entries.
- **Stage 0, Agent Kit 1.13.0: films** (WAIT frames, player, export frames, plus the two refinements). About 1 session; small engine and model changes plus UI.
- **Stage 1, 1.14.0: Mini-Ani, programs only.** About 3–4 sessions.
  - Write the 7 library programs with scenarios and line maps, in this order: ani-choice-points and ani-expert first (the heart); then ani-cast and ani-taste; then ani-methods; ani-director last (the largest, roughly 250 lines of JS).
  - Then makeMiniAni(), miniani.test, the guides, sv and the artifact.
- **Stage 2, 1.15.0: AI agents.** About 1–2 sessions: the AI Animator, You, Narrator and Reader; pretend personas for tests; one live run with keyless Claude and one with Gemini Nano.
- **Stage 3: pilot-driven tuning.** Open-ended. Questions, defaults and how many agents are shown at first.

## Thesis references

- Ch. VIII.B Ani and Education, L3952–3968: 'Since Ani is a manipulable glass box…'; a student 'could also replace Ani's knowledge base with his or her own'
- Ch. IX glass box and experiments, L5429–5434: Ani is 'even better than a glass box because one can perform experiments'
- Ch. X A.1 Adding appearances, L4262–4321: aspects and elements (L4271–4277), shape-expert hierarchy (L4290–4296), constraint relaxation / redetermination of 'the least justified value' (L4296–4301), 'a large database rather than a very smart system' (L4302–4303), which aspects to use, obvious vs subtle (L4313–4321)
- Ch. X A.2 Changing appearances, L4322–4377: three sources of change (L4341–4348), instant vs gradual (L4350–4353), interpolation path and dynamics (L4361–4367)
- Ch. X A.3 Changing descriptions, L4380–4423: recompute (L4396–4410) vs portray by bridging the gap and new method suggestions (L4411–4423)
- Ch. X B.1–B.3 Bigger KB, better KB, myriad details, L4697–4889: standing-guard questions (L4754–4760), ease in/out (d, L4830–4838), deliberateness (f, L4853–4856), movement tendencies (c, L4827–4829)
- Ch. X C legitimacy, L4939–4954: legitimate changes add lacking information; forcing outcomes 'would constitute cheating'
- Ch. X narration, L4678–4690; same framework in other domains, L4651–4655; camera and sound as fields in method suggestions, L4442–4447, L4672–4676
- Ch. IV Suggestions, L2547–2619 (sources ordered by focus; comparisons and uniqueness); Ch. V Choosing values, L2818–2846 (the same mechanism for size, shape, color), L2948–2972 (conflict resolution order), L2985–3022 (postponement)
- Ch. VI Methods, L3143–3297 (establish/convey/display; prerequisites, best-when, elimination, scoring); L3370–3408 (dynamics changes cannot stand alone; wander so the change shows, L3391); L3411–3417 (parallel is bad when the film should be simple)
- Ethology and social conventions: dominating characters appear above or larger, L4130–4132; 'bad guys wear black', 'smooth is friendly', L4225–4229; perceptual color preferences, L5855–5856; a strong friendly ally drawn large, L6229–6242
- Papert: 'Why not compare Ani to a ten-year old faced with the same task?', L5724 (the 'You suggest too' switch)
- Code: dscrp.17:63–295 (descriptor suggestions; opposites and neighbors); relate.22:20–114 (dominates' 'even more typical would be size', line 63); emote.9:11–72 (joy changes); glosug.41:10–152 (energy, flashiness with Ken's size/color comment at 39–40, variety)
- Code: film.17:48–56 (source priorities 3/2/1/4/1); choose.198:379–452 (total strength; much-greater 'for now good enuf'); cosug.215:68–83, 765–776 (opposites flipped; numberify); postpo.28:38–51 (deadly embrace)
- Code: convey.64:73–256 (meets, accompanys, helps without suggestions); disply.311:374–377, 617–621 (stands-guard and chases-off prerequisites and best-when 'bigger'); prereq.19:27–39 (faster), 62 ('bigger … for now just a dummy')
- Code: aninit.65:36–47 (Ken's star/square/circle/triangle and sizes); poly.29 (shapes as turn and size); char.2:13–20 (beautiful brings graceful); cindy.46:7–105, 150–176 (the cast, the commented-out cinderella-beautified scene, the cinderella-film levels, the focus)

## The review

**Verdict:** sound with fixes  
**Fidelity:** 4  
**Feasibility:** 3  
**Value:** 4

### Errors found

- The design says kind's tendencies now count but didn't in 1978. Only friendly misspells them (attraction-to-*, dscrp.17:106-108). kind uses attraction-towards-* (dscrp.17:210-211), and CP 29 used it: Cinderella's friends (positive high) has source (NEIGHBOR-OF GOOD KIND) (reports/pass1-reasons.txt:47), and the Godmother's comes from NEIGHBORS-ABSOLUTE-SUGGESTIONS (line 23).
- The design says variety adds a weak suggestion for the value used least so far. That is only what high variety does. cinderella-film sets variety to medium (cindy.46:157), and medium picks the middle-most chosen value (glosug.41:61-72, line 71-72).
- The design says the shape table has one empty cell. Seven shapes fill a 3x3 shape-by-detail grid, so two cells are empty: smooth-medium and medium-fancy. Cinderella's own Looks knowledge (beautiful: a bit fancy; shabby: simple, which meet at medium) with smooth lands in the empty smooth-medium cell in scene 1.
- A scenario named 'no: ...' won't count as the required no-answer scenario. library.test.mjs:16 tests /^no /i (no followed by a space) or a fixed set of expect fields, and 'no:' has a colon.
- The design says build-ani-bundle is a sanity check with no files changing. It writes app/data/ani-bundle-files.json and app/data/ani-bundle.json every run (tools/build-ani-bundle.mjs:29,32). It compares the bundle's film with the project's own run, not with CP 29 directly.
- The Reader -> Cast rule is listed under 'Off by default', yet start 4 goes only to the Reader. As specified, the 4th start produces nothing until a child finds and enables the rule.
- relate.22:58-63 has dominates suggest greater relative speed, acceleration, activity level (livelier) and vertical position. The design's {faster, bigger, above} drops livelier while presenting itself as relate.22 plus Ken's size comment (line 63).
- 'Best when bigger' is chases-off's clause (disply.311:621). stands-guard's best-when is dominates (disply.311:377). The test 'Best when bigger prefers looms over' attaches it to an invented method.
- 'missing knowledge just drops a suggestion' is quoted as if from the thesis at L2733-2737, but that text appears nowhere. The footnote says Ani's 'use of knowledge is robust' and 'manages to go on'.
- There is no kit rule that judging and scoring go to programs. Evolution's Critic and Artist and Critic's Critic are AI agents that score (SPEC.md 1.4.0, 1.7.0). The real principles are 'Stable over stochastic' and 'Pseudocode only for what can be computed' (SPEC.md §2).
- 'Pictures aren't clickable' is wrong. Every picture is an img with data-act="zoom-img" (index.html:5833). What doesn't exist is clicking a character within a picture.
- The design says the card's about 'links to toontalk.github.io/ani'. Example about text and the intro are escaped plain text (esc(x.about) index.html:7798; esc(s.intro) 6268), so no link can be made there.
- B.3(c) (L4827-4829) says tendencies belong in methods' prerequisite and best-when clauses, not in Director drift. B.3(d) (L4833-4834) ties easing to each character's acceleration, which the design drops for a fixed {2} frames.
- Question 7 needs a model, which contradicts 'each answerable in the default setup'. A test claiming two runs with different seeds give 'identical traces' can't pass as written: traces carry seed, t and ms (index.html:5067,5072).
- The design says 'These are cindy.46's words', but 'changes from shy to bold', 'obeys', 'helps' and 'keeps ... from' are paraphrases or new. bold also appears in the Personality slots described as a transcription of dscrp.17, which has only brazen and forward (dscrp.17:274-275).

### Gaps

- Recomputing every scene with only the characters on stage makes looks drift for no story reason. Cinderella's size has a 'smaller than the Stepmother' comparison in scene 1, but not in scene 3 where only the Godmother is with her. Variety counts kept across scenes also shift values. Ani split this into pass 1 (the whole cast once, as CP 29) and pass 2 (per scene). The CP's 'changes' would report differences that have no cause in the story, which the glass box can't honestly explain.
- If the Director's Logo ever fails, the story stops. The Renderer returns pass:false on an error (index.html:5124), and fireRules holds every 'always' rule when pass is false (5148), including Renderer -> Cast.
- Films and run pacing don't fit. At normal speed (350 ms a delivery, index.html:6084), the roughly 14 deliveries per scene bring the next film in about 5 s, while a 32-frame film lasts 8 s. Auto-playing the new film cuts the old one off, so children never see a whole scene during a run.
- The focus slot changes the result, not just the explanation. The focus is chosen first and goes first in a deadly embrace, so asking 'why' about another character can change the film being explained.
- Variant 1 can't tell the Director to use Ken's shapes. Variants only enable or disable rules and set history (sanitizeSociety, index.html:4729). Relationships and Taste still suggest size and brightness, so no signal is defined. 1978's colors (green star, red stepmother, yellow Prince, orange Godmother; PLAN Phase 5) aren't specified either.
- The default story uses words the knowledge doesn't contain. 'selfish' (Stepmother) and 'pretty' (Godmother) aren't in Personality's nine full lines or in the Looks list. The same-meaning slot is already 52 of the 60 characters allowed (adding 'selfish=mean' makes 66), so the test 'no word in the default story is unknown' fails as specified.
- Two instances share ani-expert. programAgent clones the library's scenarios (index.html:3856), and runScenario runs them with the agent's own params (4932-4941). Personality-specific expectations would fail for Looks in translation.test's 'any language' check unless they are written with {=param} or replaced for that instance.
- There are bugs in settle(). A comparison that rules out every value ('bigger than big') leaves all tallies negative, and the fallback picks low, the opposite of the comparison. Meeting in the middle ignores a 'not medium' that ruled the middle out; 1978 compromised only when exactly one value was left (choose.198:527-528). The weight of 'brings' (beautiful -> graceful) isn't defined, and with plausible weights it decides whether Cinderella is slow or medium.
- With wait {7} and five messages, every scene runs on the flush-on-empty path. The trace shows 'is waiting: 5 of 7' each scene, and the Helper text says 'If an answer never comes, it runs on what it has'. An eighth sender would split a scene and start two rounds.
- Ken's rule for children: every part of a default example must earn its place, and the rest goes where it can be added. Four dormant agents conflict with that, and they are why the A2 'refinement' isn't optional. The site defaults to connection 'none' (index.html:5620), and beginRun refuses any society with a non-human model agent (6146).
- The fidelity test would read ani-revival/reports/pass1-choices.txt from the public kit repository. It fails on any other clone and contradicts 'shares no code'.
- The trace size estimate is low, and some data could be dropped silently. Each activation stores message.data and program.input (both cloned), so 4 scenes are likely 200-300 KB before gzip, not 40 KB. safeData keeps at most 200 keys per object (index.html:486), so a flat strengths map keyed who/element/value with 6 or more characters would lose keys without warning.
- The CP's say is cut at 2,000 characters (cleanText, index.html:5106). Full reasons for the focus character, plus arguments and waits, with 4-5 characters (including 'Cinderella after'), may not fit. The design doesn't say what is dropped.
- Every expert looks up every word, so Personality will name 'shabby' as unknown and Looks will name 'stubborn'. The trace fills with false 'unknown word' reports.
- Only two blank lines are offered. Any other edit to an 18 KB program needs the translator to reproduce it, which the 20,000-character JS cap barely allows. It isn't realistic on Gemini Nano or the keyless quick tier.
- WAIT keeps a frame only when called, so drawing after the last WAIT never reaches the film. A character named like a Logo primitive (Dot, Label, Circle) breaks 'TO NAME'. Ken never had to face that with his four names.
- 'The frame slider goes there' from the Director's say has no mechanism, since say is plain text.

### Fixes

- Split the Choice Points' work as Ani's two passes did. In round 1 the Cast sends the whole cast and all relationships, and the CP chooses everyone's 12 values once, with comparisons over all pairs, as in CP 29. It stores them in memory. Later scenes reuse them and recompute only a character whose words changed (the A.3 recompute), with variety counts frozen for that recompute. The Cast sends 'onStage' separately from 'cast', so participation affects methods and staging only.
- Add a second rule, Renderer -> Cast, 'when data pass = false' (the 1.7.0 Artist and Critic pattern). The Cast then names the failure and goes on to the next scene. Add a miniani.test check that every scene's Logo runs and stays under 3,900 characters for 6 characters and 6 events.
- Pace films in the engine. When a Renderer activation returns a film at slow or normal speed, play() waits max(delayMs, film duration) before the next delivery, through a deps hook such as delayAfter(entry). At fast or instant the player queues films instead of cutting them off.
- Put the full reasons for every character in CP data (why[character][element] = {value, how, sources}, nested per character to stay under safeData's 200-key cap). The say becomes a summary. Separate an 'explain {name}' slot, which changes only the say, from the film's focus, which sets the choosing order and lives in Taste (cindy.46's the-films-focus).
- In settle(): if a comparison leaves no value standing, keep the comparison's own direction (bigger than big -> big) and report a self-conflicting suggestion (choose.198:320-323). Only meet in the middle when the middle hasn't been ruled out. Give 'brings' the weight of the character's own word (3): CP 29 lists GRACEFUL as an ordinary absolute source.
- For variety, use glosug.41's three rules (high: least chosen; low: most chosen; medium: middle-most), and cite it as glosug.41:61-72.
- Fix the shape table. Fill the two empty cells or say there are two, and choose a test character whose looks really hit an empty cell. Cinderella (smooth, medium) does, so make her the relaxation scenario.
- Name the no-answer scenarios 'no ...' with a space, or give them expect.say === '' or pass: false, so library.test.mjs:16 accepts them.
- Make the 1978 switch inferable from data. The CP sends looksFrom (the experts that suggested any looks element). When no Looks expert spoke, the Director uses aninit.65's shapes in cast order and the 1978 colors (green, red, yellow, orange), and says so.
- Fit the knowledge into the slots. Give same-meaning and opposite pairs one slot each, within the 30-param budget (Personality uses 26 now). Add selfish=mean (or drop 'selfish' from the story) and pretty=beautiful to Looks. Have the CP report only words that no expert knew.
- Give the Looks instance its own scenarios in makeMiniAni, or write ani-expert's library scenarios entirely with '{=w1}' and '{=s1}' substitution, so they pass for any knowledge.
- Set the CP's wait to 20 (the maximum), so only 'nobody else has anything to say' triggers it and no extra sender can split a scene. Word the pseudocode and the Helper fact so 'waiting 5 of 20' reads as normal.
- Ship 1.14.0 with the nine program agents only. In 1.15.0, make the AI voices a second example ('Mini-Ani with AI voices'), or have them added from the library. Then the A2 reachability change is a real option rather than a hidden requirement. If it is built anyway, reachability must follow rules from 'you', from '*' and 'when the run ends'.
- Turn the Reader rule on by default; it fires only from start 4. Move Question 7 behind 'needs a model' wording, or swap it for a programs-only question.
- Copy the 1978 values the fidelity report needs into the kit as tests/fixtures/cp29-cinderella.json, with provenance and the mapping (steadiness = inverse of path-jaggedness, signed attractions collapsed to three values). Assert only the recorded floor.
- For the revival check, take a SHA-256 manifest of C:/Users/toont/ani-revival (excluding PLAN.md) before and after; it isn't a git repository. Run 'node tools/run-pass1.mjs --no-backtrace' (CP 29, 102/102). Run build-ani-bundle only with the understanding that it rewrites app/data.
- Put the toontalk.github.io/ani link in the learner and teacher guides (HTML), not in about or intro, which are escaped.
- Correct the citations: kind's tendencies already counted in 1978 (only friendly's were misspelled). dominates also suggests livelier. best-when bigger belongs to chases-off. Drop the invented quotation at L2733-2737. Drop 'judging and scoring go to programs' as a kit rule. Label bold, looms over, likes and dislikes as new.
- Budget the trace honestly (measure a 4-scene run in miniani.test, and assert the gzipped size and that no data key was dropped). Keep the Director's data to what the Renderer needs, not a copy of the CP's data.
- In WAIT films, capture a closing frame when ops changed after the last WAIT. Have the Director give procedures prefixed names (TO C_CINDERELLA) so no character name collides with a Logo primitive.
- Make the Director's say carry structured frame ranges in data (scenes: [{from, to, what}]) so the stage player can render clickable chapter marks, instead of parsing say text.
