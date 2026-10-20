# Teach Ani: a learner adds to Ani's knowledge (TEACH)

*17 October 2026, the Lisp, pipeline and tools side of `reports/chapter-x/design-teaching.md` (stages T0 to T4 and T7a, kinds 1 to 4 and a verb as a kind of another), at Ken's "yes queue it", with the design's recommended answers to its questions (the revival's choices, pending Ken: `reports/chapter-x/PLAN.md`, "Teaching Ani (TEACH)"). The page's side (the panel, the forms, "Make it with my knowledge", the badges) was built on 20 October from "For the page" below: `app/film/teach.js`, checked by `tools/check-film-app.mjs` (`--only teach`).*

Your 1977 paper planned a system whose knowledge would be "as modular and simply represented as possible", so that "the child, with the help of the system, will be able to define new characters for the stories, change the system's vocabulary, add a reasonable default course of action and so on", and "actually see the knowledge of something actually accomplish something complex" ("Three Interactions between AI and Education", Machine Intelligence 8, p. 428; `sources/text/kahn-1977-three-interactions-MI8.txt`). AI-TR-540 says the same of Ani: "a student of animation could learn much by observing the effects of altering Ani's knowledge and rules" (pp. 149-150).

What one learner teaches is a **notebook** ("your knowledge"): a title and a list of pieces, each with the learner's reason (`because`), which is required. The notebook, JSON, is the source of truth. `src/teach.js` `notebookToLisp` writes it as a Lisp file in your own notation, `YOURS;N1 KNOW` (N2 and so on for a film's other notebooks, up to four): words as your DSCRP writes them, relationships as RELATE, verbs as CONVEY, feelings as EMOTE, each piece under a `;;yours k1:` line with the learner's reason, and every other line explained in a `;;;` comment. **REVIVE;TEACH** (`src/director/revive/teach.lisp`), an on-demand extension like CRITIC (group "yours", requires MEND only), is loaded with each notebook's file into every job of a film made with it, and never otherwise: no notebook, nothing changes.

## What a learner can teach

| Kind (design section) | Piece | Becomes |
|---|---|---|
| A word like another, or its opposite (4.1) | `word`: word, type (personality, physical, movement), `like` or `opposite` | `(define grumpy personality-character-descriptor)` and `(ask mean add grumpy to your list of neighbors)`, in DSCRP's hook, as KNOW's timid |
| What a word suggests for moving (4.2) | `suggests`: word (the learner's or Ani's), element, value, strength | a `(for speed low strength medium)` clause in the new word's define, or, for a word Ani knows, `(uncompiled-ask shy process suggestions (for ...))`, as KNOWRL adds to yours; a define of a word Ani knows is never written |
| How a word looks, with APPEAR (4.2) | `looks`: word, element (size, shape, color), value, strength | `(teach-appearance '((jealous color-hue green medium (yours n1 k3 \|reason\|))))`, APPEAR's own table, the reason as its evidence; a comment when APPEAR is off |
| How a word shows itself in pass 2 (4.2) | `shows`: word, verb, who (enemy, friend, stranger), strength | your mean's form, `(for (establish ?character grumpy) '(method: type convey value (bind ((other (character-that-satisfies (enemy-of ,character nil)))) (pushes ,character \`other))) strength 'low)` |
| A relationship word (4.3) | `relationship`: word, type (affection, domination), `like` or `opposite` | as RELATE defines yours, in RELATE's hook |
| How a relationship is shown (4.3) | `relationship-shows`: word (the learner's or yours, such as is-polite-to), verb, strength, `bestWhen` (always, in charge, not in charge, doesn't like the other) | RELATE's `(for (establish (is-jealous-of ?character ?other-character)) '(method: type convey value (follows ...) [best-when ...]) strength 'medium)` |
| How the first moves compared with the other (4.3) | `relationship-suggests`: word, element, comparison (greater-than, less-than, same-as, different-from), strength | loves' and dominates' form, `(for (relative-speed ? ?) 'greater-than strength 'low)` |
| Another way of showing a verb (4.3) | `way`: verb, way (a display method that takes two characters), `first` (which of the verb's characters does the way's first part), strength | `(also-show helps (helper helped) (goes-to-and-accompanys helper helped (good-distance-from (vicinity-of helper))) medium)`: REVIVE;TEACH's one wrapper on SUGCON's `gather-convey-suggestions` (`sugcon.26:57`) adds it after whatever your receivers (and KNOW's) give, never in place of them, with the source `(yours helps)`; with no ways it passes straight through |
| A feeling (4.4) | `feeling`: word, changes (speed, acceleration, how active, how rhythmic up or down; the path more or less jagged or curved; the path long or short, curved or straight) | KNOWEM's form after your joy, `(define grumpiness emotion (process suggestions (for (establish (emotional-state ?character (grumpiness {a-felt-level? ?level}))) '(method: type display-value-change value (change: ...)) strength 'medium) ...))`, KNOWEM's helpers or TEACH's copies of them when KNOW is off |
| A verb that is a kind of one of Ani's (4.5a) | `verb`: word, `kindOf`, `showAs` ("parent", shown as that verb is; or "ways", only by the learner's ways) | `(define teases chases)` and a receiver that conveys it as the parent, `(method: type convey value (chases ,one ,other))`, as your prevents is shown by conveying undoes (`convey.64:167-179`) |

Not built, by the revival's choices (pending you): "A then B" verbs and a way of showing built from walks (design 4.5, T7b), the plain-English path (section 11, T6), and editing a notebook as Lisp (T8).

## Ani's checks

**The trial job**, `checkKnowledge(fs, notebooks, { extensions, characters })` in `src/pipeline.js` (about 2 seconds in Node): a Lisp booted with the film's extensions and TEACH, without the notebooks, gives Ani's vocabulary and names; one booted with them reads DSCRP, RELATE, CONVEY, EMOTE, SUGCON and PREREQ and is asked, by REVIVE;TEACH's `check-your-knowledge`, what it now knows of every word the notebooks teach, add to or link to (whether it exists, its parent and type, its links as spread, its suggestions, its ways of showing, its relative suggestions; what CONVEY suggests for a verb; a feeling's changes). Every piece must be heard. Ani's own words must keep every suggestion they had (only adding). What your spreading of links added is said: "Because Ken's Ani spreads links (char.2:111-131), "grumpy" is now also close to cruel." Besides, `src/teach.js` `checkNotebook` (the page can run it with `DATA.words` or `DATA.know.vocabulary` and needs no Lisp) refuses what would stop Ani or isn't knowledge, and `makeFilmSteps` refuses a film with a notebook it refuses.

Refusals (`code`: the page's sentence, `says`):

| code | when |
|---|---|
| `format` | not a notebook (`format` "ani-knowledge", `version` 1, `pieces`), a piece without an id of its own or of an unknown kind |
| `too-many-notebooks` | a fifth notebook |
| `no-because` | no reason: "Say why: Ani keeps your reason with each piece, and shows it wherever the piece is used." |
| `bad-name` | not lower-case letters and hyphens, or longer than 30 |
| `lisp-name` | nil, t, or a name Lisp or Ani defines a function by (the trial job asks the Lisp) |
| `element-name` | an element's or a value's name (speed, low) |
| `known-word` | a new word Ani already knows: "Ani already knows "lazy", the opposite of "industrious": add to Ani's word instead of teaching it again, which would replace it." The form should switch to adding to it |
| `name-taken` | the name of anything Ani defines (`aniNames`: fear is KNOW's feeling, friends PREREQ's, alone a verb of CONVEY's) |
| `unknown-word` | a piece about, or a link to, a word Ani doesn't know and no notebook teaches |
| `link-kind` | a link to a word of another kind (a personality word close to a physical one, or a word for characters close to a relationship) |
| `contradiction` | links that, once spread, leave a word both close to and the opposite of another, with the chain of links that did it (a new word links to one word, so on your net, which is consistent, this can't happen; the check is for nets that aren't) |
| `names-character` | a piece about a story's character (one of your four, or the story's cast; or a piece with a `character`): "That's about this film's step mother, not about any character. To change this film, criticize it (Your criticism)." |
| `two-notebooks` | a word taught twice, in one notebook or two ("untick one of the notebooks") |
| `needs-extension` | a look without APPEAR; following, helping or avoiding (KNOW's ways) without KNOW, unless a learner's own way gives the verb one; KNOW's display methods without KNOW: "Following needs the revival's knowledge (KNOW): turn it on, or choose another." |
| `no-way` | a verb with no way of showing in the loaded set |
| `repeat-element` | the learner's own word suggesting two values for one element (a learner may disagree with your words: a second suggestion for one of yours is allowed, and COSUG weighs the two) |
| `bad-element`, `bad-value` | an element or value the forms don't offer |
| `lisp-break` | Ani stopped while loading the notebook (the trial job), with what Lisp said |
| `not-heard` | Ani read a piece but doesn't hear it |
| `lost-suggestions` | one of Ani's words lost a suggestion of its own |

Warnings: `cancels-joy` (your decision 9, "If a character feels this and joy at once, your speed going down and joy's going up cancel: Ken's CHOMET rejects conflicting changes rather than choose between them ("hopefully all conflicting ones are so noted for now rather than resolving them I'll reject", chomet.123:464)."), `not-read` (acceleration, deliberateness and the attractions are chosen and not read by anything that draws the film, unless DETAIL is on), `says-nothing` (a new word with no link and nothing it suggests), `no-way-yet` (a verb to be shown only by ways it doesn't have yet).

Your legitimacy rule is a question, not a gate (`legitimacyQuestion(word)`): "Would this be true of any grumpy character, in any story? Ken's rule for himself was to add only knowledge that was missing, never to arrange for Ani to make the film he wanted."

**The rehearsal**, `rehearse(fs, piece, notebooks, { extensions })`: `rehearsalStory(piece)`, a two-character, one-scene story that uses the piece ("first-one" and "second-one"; an enemy hates the first, a friend is loved by it), through pass 1 and the scene's pass 2, not filmed, and what the piece did there. In `tools/check-teach.mjs` one piece of each kind is rehearsed with MEND, KNOW and APPEAR, each heard, each in under 60 seconds.

## What your knowledge did

`yourKnowledgeDid(run)` reads a film made with notebooks (its choice points and glass boxes) and says, for every piece, one of the design's four states, with each place it reached:

- **won**: used, and Ani's choice is what it said (the others set aside, with your reason: "much less strongly suggested");
- **combined**: met another suggestion in the middle (the probe's speed: grumpy's low and your strong's high made medium);
- **lost**: set aside, naming the winner and why: in pass 1 your reason (`not-compatible-with-others`, `much-less-strongly-suggested`); in pass 2 your CHOMET keeping only a way two of a character's words suggest at once (`not-related`: "set aside: Ani prefers a way of showing that two of the words suggest at once (pushes), and only yours suggested follows (Ken's CHOMET, eliminate-not-related-suggestions, chomet.123:588-596)"), another way chosen (with CHOMET's scores), a way set aside before scoring by your `reject-suggestion` (`set-aside`: "it would take more time than the part has to fill", as the learner's going along with does in the rehearsal, where KNOW's helping along is chosen), a task Ani couldn't do, or a feeling's change rejected for conflicting with another's (`conflict`, chomet.123:464);
- **never reached**, with why: "no character in this story is grumpy", "no scene shows what a grumpy character is like", "no scene asks Ani to show helping", "Ani isn't choosing looks (APPEAR is off)", "no choice of acceleration heard it".

`knowledgeChanges(before, after)` is the pair panel's "What your knowledge did", a sibling of `criticismChanges`: pass 1's changed choices (each with the kept suggestion's source and the pieces that reached it, "1 of Ani's 102 choices changed"), each scene's frames and the tasks whose way or time changed, and the pieces as above.

## The examples

`node tools/check-teach.mjs` (about 14 minutes on a busy machine; examples by name, `--save` to write the goldens, `--no-rehearsals`) makes each with its notebook (`notebooks/`) at 4 frames a second and holds it to the design's probes and to `<example>/summary.json`. The stories are in `test/teach/`.

| Example | Story, extensions, notebook | Frames | What happens |
|---|---|---|---|
| `grumpy-unknown` | your Cinderella with the stepmother grumpy for mean (`grumpy-cindy.lisp`); MEND, KNOW; none | Introduction 226 | grumpy is a word Ani doesn't know: her attraction towards enemies, which your mean set to (negative high), falls to the film's variety, (positive high), and she chases before she hits |
| `grumpy` | the same; `grumpy` ("grumpy is like mean") | 225, 116, 17, 179, 84 | your film with "mean" frame for frame (KNOW's goldens, `reports/ext/know`), the contract golden: CP 29's 102 choices, the two attractions mean decides now `(neighbor-of grumpy mean)`, and KNOW's sharing borrows mean's hurting and chasing for grumpy |
| `grumpy-slow` | the same; `grumpy-slow` (and "a grumpy character's speed is low, medium") | Introduction 234 | her speed medium, grumpy's low met strong's high in the middle, the only one of 102 choices to change; her walk to hit Cinderella 7.32 to 12.5 seconds, her chase 1.54 to 2.26 |
| `helps-with` | your story, Ani as in 1978 with MEND; `helps-with` ("helping can look like going along with") | Introduction 229 (192 in 1978) | Cinderella's helping the Prince, which Ani canceled in 1978 (p. 65), shown by goes-to-and-accompanys; no other task changed |
| `jealous-unknown` | your Cinderella, the stepmother also jealous and is-jealous-of Cinderella (`jealous-cindy.lisp`); MEND, KNOW, APPEAR; none | Introduction 222 | unknown words |
| `jealous` | the same; `jealous` ("green is jealous", following) | Introduction 235 | green, from jealous; her paths jagged (jealous and evil against strong's low, set aside as much less strongly suggested); 2 of 156 choices changed; her following set aside: your CHOMET keeps pushing, which dominates and hates both suggest |
| `jealous-only` | is-jealous-of her only word for Cinderella (`jealous-only-cindy.lisp`); `jealous` | Introduction 220 | she follows her (follows-behind); her mean has no enemy to chase now (enemy-of looks for one who hates) |
| `grumpiness` | the troll feels grumpiness (`grumpiness.lisp`); MEND, KNOW; `grumpiness` | On the Bridge 228 | his speed goes down and his paths grow jagged |
| `grumpiness-and-joy` | and joy at once (`grumpiness-and-joy.lisp`) | On the Bridge 126 | Ani's check warns; grumpiness's speed going down and joy's going up are rejected, as KNOW's first pride (your decision 9); the jaggedness is made |
| `teases` | the troll teases the goat (`teases.lisp`); MEND, KNOW; `teases` (a kind of chasing) | On the Bridge 11 | the troll chases the goat (chases-to) |

## The 1978 contract

- No notebook, nothing changes: TEACH is never in the switch's set and is loaded only with a notebook.
- `node tools/check-1978.mjs --extensions teach --knowledge reports/ext/teach/empty.ani-knowledge.json`: Ani with MEND, TEACH and an empty notebook is your 1978 film byte for byte, glass boxes, loads (besides TEACH's and the notebook's own) and run-pass1's goldens included.
- `node tools/check-ext.mjs --extensions know --knowledge reports/ext/teach/empty.ani-knowledge.json` (and so with the other sets): each set's goldens unchanged.
- `npm test` (`test/teach.test.js`): the generator against `test/teach/all-kinds.lisp` and `all-kinds-mend.lisp` byte for byte; every generated file loads with and without KNOW and APPEAR and every piece is heard; your words keep every suggestion; the wrapper passes straight through with no ways and appends one; feelings with and without KNOW; each refusal with its sentence; the index; the trial job; a film refused with a refused notebook; `yourKnowledgeDid`'s four states.
- The shipped data (`DATA.words`, `DATA.know`, the scenes) never sees a notebook, and Ken's film is never rebuilt from one.

## For the page

Everything is in `src/teach.js` (no Lisp: the page and the worker can import it) and `src/pipeline.js` (the worker).

**The notebook format** (`ani-knowledge`, version 1):

```json
{ "format": "ani-knowledge", "version": 1, "title": "Sam's knowledge", "made": "2026-10-16T10:00:00Z",
  "pieces": [
    { "id": "k1", "kind": "word", "word": "grumpy", "type": "personality", "like": "mean",
      "because": "a grumpy character is a mean one" },
    { "id": "k2", "kind": "suggests", "word": "grumpy", "element": "speed", "value": "low", "strength": "medium",
      "because": "a grumpy character drags its feet: it can't be bothered to hurry" } ] }
```

The kinds and their fields are in the table above and in `src/teach.js`'s header. Values are strings: `"low"`, `"(not low)"` (three-valued elements), `"short"`/`"medium"`/`"long"` (path-length), `"(positive low)"` to `"(negative high)"` (the attractions), a hue among `HUES`. The menus come from `MOVEMENT_ELEMENTS` and `LOOK_ELEMENTS` (each with its plain `words` and `values`), `VERBS` (each verb's plain words and the extension its ways need), `WAYS` (each way's plain words, its argument template, the extension that defines it), `WHO`, `BEST_WHEN`, `RELATIVE_ELEMENTS`, `COMPARISONS`, `FEELING_CHANGES`, `WORD_TYPES`, `RELATIONSHIP_TYPES`, `STRENGTHS`. A file to save is the notebook with its Lisp beside it (`notebookToLisp(notebook, { n: 1, extensions })`), for reading without the page; `<title>.ani-knowledge.json`.

**In the page, no Lisp:**
- `checkNotebook(notebook, { extensions, vocabulary, taken, others, characters })` → `{ ok, refused: [{ piece, code, says }], warnings }`: with `vocabulary` (`DATA.know.vocabulary` with KNOW, else `DATA.words`, each `{ kind, neighbors?, opposites?, revival? }`) the vocabulary checks; `taken`, a Set of Ani's names, is the worker's (`aniNames`); `others`, the notebooks ticked before this one; `characters`, the story's cast.
- `pieceWords(piece)`: the piece in plain words, one line ("A grumpy character's speed is low, medium strongly."). `legitimacyQuestion(word)`.
- `notebookToLisp(notebook, { n, extensions })`: "See it as Ani reads it". `wellFormed(piece)`: whether the generator would write it (a piece that isn't is left out, with a comment).
- `yoursIndex(notebooks)`: "your knowledge" in the shape of `DATA.know` (`words`, `knowledge`, `verbs`, `feelings`, `links`, `vocabulary`, `notebooks`), each entry with `{ notebook, title, piece, because }` in place of `{ file, line, why }`, for `knowBadge`, `knowOfSource`, `knowOfTask` and `knowItems` and the "yours" chips. A suggestion from a learner's word has the word as its source, or `(neighbor-of grumpy mean)`; one added to your word has your word's source and is told apart, as KNOW's are, by element, value and strength; a learner's way has the source `(yours helps)`; a look's evidence is `(yours n1 k3 |reason|)`.

**In the worker** (`src/pipeline.js`):
- `checkKnowledge(fs, notebooks, { extensions, characters })` → `{ ok, seconds, notebooks: [{ title, ok, refused, warnings, pieces: { [id]: { heard, spread?, says? } } }], words, stopped? }`: "Check with Ani", about 2 seconds; `says` on a word or relationship piece is the spreading sentence.
- `makeFilmSteps(fs, { ..., knowledge: notebooks })`: a film made with the notebooks (TEACH added to every job; `extensions` stays the film's own); the result has `knowledge` (the notebooks as they were, for the film file: the design's version-3 `knowledge` field). It throws before pass 1 for a notebook Ani refuses ("Ani refuses the notebook ...") or more than four. `remakeFilmSteps` (criticism) keeps a film's knowledge. `aniNames(fs, { extensions, knowledge })` and `storyWithoutClashes(fs, text, { extensions, knowledge })`: a learner's words are Ani's names (a scene called grumpy is renamed).
- `rehearse(fs, piece, notebooks, { extensions })` → `{ piece, story, outcome, seconds }` ("Try it on a little story"; give it a file system of its own). Each took 14 to 17 seconds in Node on a busy machine.
- `yourKnowledgeDid(run)` → `{ notebooks, pieces: [{ notebook, title, piece, kind, words, because, state, places, why?, note?, unread? }] }`, for "What your knowledge did here" (a place is a choice point, `{ choicePoint, character, state, value, against?, reason?, reasonWords? }`, or a task, `{ scene, task, description, character, state, chosen?, verb?, way?, element? (a feeling's change), reason?, reasonWords?, scores? }`).
- `knowledgeChanges(before, after)` → `{ pass1: { total, changed: [{ choicePoint, before, after, source, pieces }] }, scenes: [{ id, frames, runningTime, tasks }], pieces }`, for the pair panel. The design's speed-up (reusing a film's KEN;CP when no pass-1 choice changes) is not built: "Make it with my knowledge" is `makeFilmSteps` from the start (pass 1 about 20 to 60 seconds in Node).
- `withTeach(extensions)`, and the registry entry `teach` (`group: "yours"`, `onDemand: true`): the "Which extensions" panel should list it ticked and greyed, "Your knowledge (TEACH): Sam's knowledge". Its `group` is new, so `tools/check-film-app.mjs`'s expectation of the panel's groups ("... Criticism: ") will need "Yours" once the page is built again with this registry.

**Frame counts for the examples** (4 frames a second): the table above. The page's activities (design section 12) are the examples: "Teach Ani grumpy" (226, then 225 frame for frame your film with "mean"), "A slow grumpy stepmother" (234; 7.3 to 12.5 seconds), "Give helps a way of showing" (192 to 229, Ani as in 1978), "Green is jealous" (222 to 235; following set aside; with is-jealous-of alone, 220 and she follows), "A feeling that cancels" (228 alone, 126 with joy, the speed change rejected).
