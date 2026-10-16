# Teach Ani: a learner adds to Ani's knowledge (Ken's "Three Interactions between AI and Education", 1977, and AI-TR-540 pp. 149–150), as the learner's own knowledge, loaded by the switchable REVIVE;TEACH

*Written by a design agent on 16 October 2026, for Ken's note: "page 7 of [Three Interactions between AI and Education, Machine Intelligence 8, pp. 422–428] is how I was thinking of AI and animation in 1977 ... note the idea that a student might add to the system's knowledge. Perhaps we need an interface where that can be done with Ani." It follows the form of the earlier designs in this folder, and like them it should be reviewed adversarially before it is built. Every number called "probed" was measured on 16 October with scratch Lisp files (not in the repo) loaded as an extension into the real pipeline; see "What the probes found". Nothing in the repo's code was changed.*

## Summary

Ken's 1977 paper planned a system whose knowledge "about animation techniques, the real world, common sense facts about people and things, and the 'Peanuts' characters will be as modular and simply represented as possible", so that "the child, with the help of the system, will be able to define new characters for the stories, change the system's vocabulary, add a reasonable default course of action and so on", and so "actually see the knowledge of something actually accomplish something complex", becoming "more explicit about their own thoughts and knowledge". AI-TR-540 says the same of Ani (p. 149): "a student of animation could learn much by observing the effects of altering Ani's knowledge and rules", and could even "replace Ani's knowledge base with his or her own knowledge and see how a very crude simulation of themselves as animators performs" (p. 150).

The revival already adds knowledge in Ken's idiom: REVIVE;KNOW's five files write words as DSCRP writes them, relationships as RELATE, ways of showing as CONVEY and DISPLY, feelings as EMOTE, and APPEAR's looks as a table taught through Ken's own `process suggestions`. A learner can do the same through forms, with no Lisp to type.

**Teach Ani** is a panel on the film page, opened from a "Teach Ani" button beside "Change the story" and from a "+ teach Ani a word" entry at the end of each of the editor's word lists. What a learner teaches is kept as **your knowledge**, a small set of pieces, each with the learner's reason in their own words. The page turns the pieces into a Lisp file in Ken's notation, the same forms Ken and KNOW use. That file is loaded into Ani only when the learner chooses "Make it with my knowledge", as one more switchable extension. In order of ease, a learner can teach:

1. **A new word that means much the same as one Ani knows, or the opposite** ("grumpy is like mean"). Ken's DSCRP does this with its links (`(ask hard-working add industrious to your list of neighbors)`, dscrp.17:277), and pass 1 already takes a neighbor's suggestions for such a word (cosug.215:22-88). This is the simplest and safest kind.
2. **What a word suggests**: for how a character moves (choice point, value, strength, and why), for how it looks (with APPEAR), and for how a character shows it (a way of showing in pass 2, as mean chases an enemy).
3. **A new relationship word and how it is shown**, by one of the ways Ani already has (accompanying, avoiding, following, chasing, helping, hurting, pushing, meeting); and, a step further, **another way of showing one of Ani's verbs** ("helping can look like going along with someone").
4. **A feeling and how it changes movement**, written as KNOW's feelings are written after Ken's joy.
5. **"A reasonable default course of action"** (Ken's phrase): a new verb made of verbs Ani has, or a new way of showing made of walks. This is hard. The design takes the first part some way and recommends stopping short of a general walk-builder.

**What the learner sees.** Each form uses plain words and menus drawn from Ani's real vocabulary. Ken's own entries sit beside it as examples, and a preview shows the Lisp the piece becomes. Ani checks every piece by loading it in a trial job. The page refuses what would stop Ani. Ken's legitimacy rule ("add obvious information that was lacking") is put to the learner as a question to answer, not used as a gate.

**Where it is kept and how it is shown.** Knowledge is kept per browser, beside "Your films". It can be saved and shared as a file, and it is never sent anywhere. In the glass box every suggestion that came from it carries a **"yours"** badge with the learner's reason. After a remake, the films before and after are shown side by side under "What your knowledge did": what each piece changed, what it lost to, and what it never reached.

**Criticism and knowledge.** CRITIC's criticism changes one film. Knowledge changes Ani, for every film made with it. The two hand off to each other.

**The probes.** Teaching "grumpy is like mean" gives Ken's film back frame for frame with the word swapped in, whereas an unknown "grumpy" changes the stepmother. Adding "a grumpy character moves slowly, medium" moves her speed from high to medium, where it meets strong's high, and lengthens the Introduction by 9 frames. A learner's "helping can look like going along with" lets the 1978 Ani (with MEND alone) show the helping it canceled in 1978. With APPEAR, "jealous" with Ken's "green is jealous" makes the stepmother green. Her "is jealous of" relationship, shown by following, loses to pushing, because Ken's CHOMET prefers a way that two of her words suggest at once; the glass box has to say so. A verb defined as a sequence of two verbs is not handled by Ken's CONVEY, which is why kind 5 is hard.

The stages come to about 19 working days through kind 4, the guides and the plain-English path. Kind 5 adds 3 to 8 days, depending on how far it goes.

## The design

### 1. What Ken wrote

**"Three Interactions between AI and Education"** (Kahn 1977a, Machine Intelligence 8, Elcock and Michie eds., pp. 422–428; AI-TR-540's bibliography, L8185-8188; on p. 7 of the paper, as Ken quoted it):
- "Another more important way in which a child could interact with this planned system is by understanding and modifying the knowledge of the system."
- "The system's knowledge about animation techniques, the real world, common sense facts about people and things, and the 'Peanuts' characters will be as modular and simply represented as possible."
- "The child, with the help of the system, will be able to define new characters for the stories, change the system's vocabulary, add a reasonable default course of action and so on."
- The hope that children "will actually see the knowledge of something actually accomplish something complex", which would make them "more explicit about their own thoughts and knowledge".
- The paper is not in `sources/`. Its text above is Ken's quotation. Before the guides quote it, a copy should be added to `sources/` (Q11).

**AI-TR-540, Section B, "Ani and Education"** (pp. 149–150, L3953-3973):
- "The educational uses of an AI-oriented computer animation system were important in the design of an early predecessor of Ani [Kahn 1976a]. The idea was that a properly designed system could be an ideal environment for a student to learn about both AI and animation. This design criterion was dropped for practical reasons in the making of Ani."
- "Since Ani is a manipulable glass box, a student of animation could learn much by observing the effects of altering Ani's knowledge and rules. Ani's knowledge is in an explicit form that can be studied in ways that the knowledge of a human animator cannot. A student could also replace Ani's knowledge base with his or her own knowledge and see how a very crude simulation of themselves as animators performs."
- The Conclusion (p. 242, L6331-6332): "From an educational point of view, Ani is a repository, in an explicit and precise form, of some of the knowledge and techniques needed to produce animation."

**Modularity, which makes this possible** (p. 45, L1339-1342): actors "eased the task of keeping the different components and bodies of knowledge of Ani as independent and modular as possible".

**What could be added** (p. 19, L655-662): "There is no reason to think that similar words not currently known to Ani, such as "clever", "fears", "textured", or "helps" could not be added."

**The links** (p. 83, L2342-2344): "The descriptors are linked to each other by "opposite" and "similar" links and these are used for both comparisons and indirect sources of suggestions."

**Ken's legitimacy rule** (p. 189, L4939-4944): "The only legitimate changes that can be made so that Ani makes choices more to my liking are to add obvious information that was lacking or was too inaccurate ... The only other change that is legitimate to make to Ani is to take factors into consideration that obviously should have been but weren't." Its footnote, on cheating (L4952-4954): "Other changes would constitute cheating in that I would be arranging for Ani to do what I want without improving the reasoning. For example, if Ani chose poorly between three choices I could have (but did not) fix things so that the option no longer existed or looked undesirable."

**A social convention Ani never had a word for** (p. 161, L4228): "'bad guys wear black', 'smooth is friendly', 'green is jealous'". APPEAR took the first two, and no word of Ani's is jealous (apsug.lisp). A learner can supply it.

### 2. How Ani's knowledge is represented (read from the code)

Each body of knowledge is a file of actors, and each piece is a short form. These forms are what a learner's knowledge becomes.

**Words for characters, KEN;DSCRP** (dscrp.17):
- A word is an actor of one of three kinds: `personality-character-descriptor`, `physical-character-descriptor` or `movement-character-descriptor` (dscrp.17:49-56).
- Its suggestions for how a character moves are `(process suggestions (for ELEMENT VALUE strength STRENGTH))`. For example, shy has `(for speed low strength low)` and `(for attraction-towards-strangers (negative high) strength high)` (dscrp.17:62-67).
- Its ways of showing itself in pass 2 are `(for (establish ?character WORD) '(method: type convey value (bind ((other (character-that-satisfies (enemy-of ,character nil)))) (chases ,character `other))) strength 'medium)`. That one is mean's chasing (dscrp.17:252-259).
- A word may be defined with nothing: `(define bad personality-character-descriptor);;should get most from its neighbor` (dscrp.17:183).
- Links come last (dscrp.17:273-295): `(ask shy add brazen to your list of opposites)`, `(ask hard-working add industrious to your list of neighbors)`. DESCRIPTOR spreads each link to the neighbors' neighbors and the opposites' opposites (char.2:111-131).

**How pass 1 hears a word.** FILM gives every absolute choice point three descriptor sources, with these priorities (film.17:46-55): the words themselves 3, their neighbors 2, their opposites 1.
- `collect-suggestions` gathers a neighbor's suggestions with the source `(neighbor-of word neighbor)`, and an opposite's reversed, with `(opposite-of word opposite)` (cosug.215:22-88).
- An unknown word is made on the spot as a bare `character-descriptor` (`(ask character-descriptor if new make ,atomic-descriptor)`, cosug.215:28). It suggests nothing, and pass 1 goes on.
- So a learner's "grumpy is like mean" works in pass 1 with no new code. It is Ken's mechanism, given a new link.

**Relationships, KEN;RELATE** (relate.22):
- Two kinds, `affection-relationship-descriptor` and `domination-relationship-descriptor` (relate.22:14-18).
- Relative suggestions: loves suggests `same-as` on the relative elements, weakly, and dominates suggests `greater-than` (relate.22:21-27, 58-63).
- Ways of establishing, each with an optional `best-when`. For example, hates avoids "best when it doesn't dominate", and hurts "best when it dominates" (relate.22:39-54).
- Several of Ken's words have no suggestions at all (relate.22:88-102). KNOWRL gives some of them ways of showing, by `(uncompiled-ask is-obedient-to process suggestions ...)`.

**Verbs, KEN;CONVEY** (convey.64):
- A verb is an actor (`(define chases moves)`, convey.64:100).
- It has one receiver that yields its display suggestions: `(define-receiver (yield suggestions for {and ?task (convey (chases ?chaser ?chasee))}) chases '((suggestion: element ,task value (method: type display value (chases-to ...)) strength high source chases)))` (convey.64:102-111).
- helps had none: "for now don't have an suggestions as to how to convey this" (convey.64:127). KNOWCV gives it helps-along.
- Every verb is asked through one function, `gather-convey-suggestions` (sugcon.26:57-58), which is where a learner's extra way of showing can join the others (§4.3).

**Ways of showing, KEN;DISPLY** (disply.311): display methods such as chases-to, move-to-and-hits, goes-to-and-accompanys and pushes-around. Each has an `estimate time for` receiver and a `run` receiver made of PLACE's placing and `move-character` walks. The revival's MEND5 move-to and KNOWDI's helps-along, moves-away-from and follows-behind are built from the same parts (knowdi.lisp:1-48).

**Feelings, KEN;EMOTE** (emote.9): joy alone. Each suggestion is a `display-value-change`, `(change: element (,character speed) amount ,joy-level speed ,(second joy-level))` (emote.9:11-72). KNOWEM's pride, anticipation, loneliness, fear and anger are written the same way, with a plain or positive level (knowem.lisp:1-62).

**Looks, REVIVE;APSUG**: a table of `(descriptor element value strength evidence)`. `teach-appearance` sends each entry through Ken's `process suggestions` and keeps its evidence for the glass box (apsug.lisp:51-125). The evidence is `(thesis 161 |...|)`, `(code |...| |...|)` or `(why |...|)`, and a learner's would be `(yours |...|)`.

**How the revival adds knowledge** (know.lisp:1-35, and the KNOW README):
- Each file defines its pieces inside `(+after-load '|ken;dscrp >| '(revival-once 'know-words 'teach-the-revivals-words))`, so that nothing autoloads a Ken file that the 1978 job never loads (PLAN.md, "Nothing at top level").
- Each new top-level actor gets a tags entry, `(putprop word '|KEN;DSCRP| 'actor-load)`, so that `exists?` finds it before DSCRP has loaded.
- Each piece has a `;;why:` line above it, which `tools/know-index.mjs` reads into the page's `DATA.know` (file, line, why). The glass box's `knowBadge` turns that into "the revival's: <why>" with a code link (film.template.html:2131).
- KNOW's sharing has a word with no way of showing itself borrow its neighbors' in pass 2 (know.lisp:46-167, after Ken's comment at dscrp.17:183). So a learner's "grumpy like mean" shows itself in pass 2 too, when KNOW is on.

**The page.**
- The editor's words are `vocabularyFor(extensions)` (film.template.html:526): Ken's `DATA.words`, or with KNOW `DATA.know.vocabulary`, where a revival word has `revival: true`. Chips are shaded for words with suggestions of their own, slanted for words known only through a link, and outlined in purple for the revival's (film.template.html:5897).
- The language-model path builds a strict JSON schema whose enums are this vocabulary (`storySchema`, app/film/json.js:56).
- Films are kept in IndexedDB, in the database `ani-cinderella` with its stores "films" and "data" (app/film/library.js:1-56).

### 3. The shape of the feature

**Your knowledge.** What one learner teaches is a **notebook**: a title ("Sam's knowledge"), and a list of pieces in order. Each piece is a small JSON object, with an `id`, a `kind`, its fields and `because`, the learner's reason in their own words, which is required. The JSON is the source of truth. The Lisp is generated from it, the same way every time, and is kept beside it for reading.

```json
{ "format": "ani-knowledge", "version": 1, "title": "Sam's knowledge", "made": "2026-10-16T10:00:00Z",
  "pieces": [
    { "id": "k1", "kind": "word", "word": "grumpy", "type": "personality", "like": "mean",
      "because": "a grumpy character is a mean one" },
    { "id": "k2", "kind": "suggests", "word": "grumpy", "element": "speed", "value": "low", "strength": "medium",
      "because": "a grumpy character drags its feet: it can't be bothered to hurry" } ] }
```

**The Lisp file.** For each job of a film made with a notebook, the pipeline writes it to the job's file system as `YOURS;N1 KNOW` (N2 and so on for more notebooks; six characters or fewer, as ITS names must be). It then evaluates `(load-your-knowledge '((yours) n1 know))` after the extensions load, as CRITIC's record is written to `KEN1;FILM CRITIC` and loaded (pipeline.js `boot`, :206-227). The file's pieces are wrapped exactly as KNOW's are (§2), so they are read in after the Ken file they extend has loaded, and once only.

**REVIVE;TEACH, the extension.** It has the helpers the generated files call:
- `load-your-knowledge`;
- `also-show`, the wrapper on `gather-convey-suggestions` for §4.3's extra ways of showing;
- `check-your-knowledge`, the trial job's checks (§5);
- the `tags` entries the generator can't know about.

Its registry entry, modeled on CRITIC's:

```js
{ id: "teach", label: "Your knowledge", group: "yours", onDemand: true,
  files: ["wrap", "teach"], requires: ["mend"], changes1978: false,
  note: "Knowledge you taught Ani on this page (Teach Ani), in Ken's notation, each piece with your reason: words, what they suggest, relationships and how they are shown, feelings. Loaded only into a film you make with your knowledge; Ani as in 1978, and Ken's film, never change." }
```

- **It requires MEND**, because a learner's knowledge is soon used in new stories, which need MEND's repairs, and a learner's feeling meets joy through MEND7's repaired combine (cosug.215:449-477). MEND is byte-identical on Ken's Cinderella.
- **It does not require KNOW (Q2).** Pieces that need KNOW say so: the ways of showing helps, avoids and follows; KNOW's pass-2 borrowing for a linked word; and KNOW's words as menu choices. The page offers them only when KNOW is on. The page's switch set (MEND, KNOW, APPEAR, CHANGE, SEEN) has KNOW, so most learners will have it.
- **It is `onDemand`**, like CRITIC: never in the switch's set. It is added only when the learner makes a film with a notebook ticked. The "Which extensions" panel lists it, ticked and greyed, as "Your knowledge (TEACH): Sam's knowledge".

**The panel.** The default view is short: a sentence ("Teach Ani something it doesn't know. Ani will use it in every film you make with your knowledge."), then the notebook's pieces in plain words, one line each, then **"+ Teach Ani…"** with five choices in order of ease. Everything else opens on a click: Ken's example, the Lisp, Ani's checks.

**The 1978 contract** (§10) holds because nothing is loaded unless the learner asks for it, and Ken's film and data are never rebuilt from a learner's knowledge.

### 4. What a learner can add, in order of ease

For each kind: the form, the Lisp it becomes, Ani's checks particular to it (the shared checks are in §5), what it changes, and which choices are the revival's.

#### 4.1 A word like another (or the opposite of another)

**The form.**

> Teach Ani a new word: **[grumpy]**
> It tells what a character is **[like inside (personality) ▾ / looks like (physical) / how it moves (movement)]**
> It means much the same as **[mean ▾]** *or* the opposite of **[ ▾ ]**
> Because: **[a grumpy character is a mean one]**

- **The menu** lists Ani's words of that kind, as the editor's chips show them: shaded, slanted, purple for the revival's, and with a new "yours" outline for the learner's own. Beside it is Ken's example, with its line: "Ken: industrious means much the same as hard-working (dscrp.17:277)". With KNOW on, a second example is "the revival: timid means much the same as shy".
- **The plain-words preview:** "Ani will know *grumpy*. A grumpy character gets mean's suggestions for how it moves, at mean's strengths (though when suggestions disagree, Ani gives a neighbor's less say than a word's own: Ken's priorities, film.17:50-52)". With KNOW on, it adds "and shows it as mean does: by chasing or hurting an enemy".
- **What spreading adds.** The trial job (§5) asks Ani which links the new one spread to, and the page says so: "Because Ken's Ani spreads links, grumpy is now also close to cruel (the revival's word)." This is Ken's own rule at work (char.2:111-131), and learners rarely expect it.

**The Lisp** (a personality word that is a neighbor; "the opposite of" gives `list of opposites`):

```lisp
(defun teach-yours-n1-words ()
  (let ((:insert-methods-at-end nil))

;;yours k1: a grumpy character is a mean one
(define grumpy personality-character-descriptor)

(progn
 (ask mean add grumpy to your list of neighbors))))

(+after-load '|ken;dscrp >| '(revival-once 'yours-n1-words 'teach-yours-n1-words))

(putprop 'grumpy '|KEN;DSCRP| 'actor-load)
```

The first and last lines are explained on a click, in one sentence each: "These lines wait until Ani has read Ken's words (DSCRP), then teach yours, once." and "This line tells Ani which file your word belongs with, so Ani knows it exists." That keeps Ken's rule of no unexplained parts.

**What it changes (probed).**
- Ken's Cinderella with "mean" replaced by "grumpy" in the stepmother's description:
  - **Not taught**, grumpy is an unknown word. Pass 1 still makes 102 choices, but the stepmother's attraction towards enemies, which Ken's mean set to (negative high), is chosen by the film's variety alone: (positive high). She is now drawn towards Cinderella. In the Introduction she chases before she hits, and the scene is 226 frames.
  - **Taught "grumpy is like mean"**, all 102 choices are as in Ken's film. The two attractions mean decides now say `(neighbor-of grumpy mean)`, at mean's strengths. With KNOW, the Introduction's establish task borrows mean's hurting and chasing (`borrowed` in the glass box). The film is frame for frame the one Ken's story makes with "mean" (the same frames' hash, 225 frames, MEND and KNOW on).
- So the simplest kind of knowledge is also the safest: it gives Ani back exactly what the learner said the word means.

**Ani's checks for this kind:**
- The new word must not already exist. If it does, the form becomes §4.2's "what a word suggests" for that word, and says why: "Ani already knows *lazy*: Ken's opposite of hard-working".
- The linked word must exist and be of the same kind.
- After spreading, no word may end up both a neighbor and an opposite of the new one (refused, with the chain of links that did it).

#### 4.2 What a word suggests: how a character moves, how it looks, how it shows it

**How it moves.** The form has one row per suggestion. "+ another" adds a row.

> A **[grumpy]** character's **[speed ▾]** is **[low ▾]**, **[medium ▾]** strongly.
> Because: **[it can't be bothered to hurry]**

- **The elements**, in the editor's plain names: speed; curvature, length and jaggedness of the path; how active; how rhythmic; how repetitive; acceleration; how deliberate; drawn to friends, to enemies, to strangers.
- **Each element says who reads it** (`ELEMENT_USE`, pipeline.js:267). For acceleration, deliberateness and the attractions, it says: "Ani chooses this, but in 1978 nothing that draws the film reads it, so the film won't show it". With DETAIL, deliberateness and the attractions are read (`elementUse`, pipeline.js:278).
- **Values** are offered only in the forms the element takes:
  - low, medium, high, and "not low" or "not high", for the three-valued elements (Ken's own `(not low)`, dscrp.17:78);
  - short, medium, long for path length (evil's `short`, graceful's `long`);
  - for the attractions, "drawn to / kept away from × a little, somewhat, strongly", which become `(positive low)` … `(negative high)`.
- **Ken's example** sits under the row: "Ken: a shy character's speed is low, weakly (dscrp.17:64)". It is picked to match the chosen element where Ken has one.

The Lisp adds to the word's `define` (a new word) or, for a word Ani already knows, uses KNOWRL's form for Ken's words. A `define` of an existing word would replace it and lose Ken's suggestions, so the generator never writes one:

```lisp
;;yours k2: a grumpy character drags its feet: it can't be bothered to hurry
(define grumpy personality-character-descriptor
 (process suggestions
	  (for speed low strength medium)))

;;yours k5: a shy character keeps its eyes down, so it doesn't go straight anywhere
(uncompiled-ask shy process suggestions
		(for path-curvature high strength low))
```

**How it looks** (only with APPEAR on). The rows are the same, with APPEAR's elements: size; how jagged and how complex the shape is; how bright, how vivid and which hue. The values are APPEAR's (six hues on the painter's wheel), and the examples are Ken's (evil: dark, "bad guys wear black", p. 161) and the revival's (shy: small). The Lisp is APPEAR's own table, sent through its own function:

```lisp
;;yours k3: "green is jealous", a convention the thesis names (AI-TR-540 p. 161)
(teach-appearance '((jealous color-hue green medium (yours |green is jealous|))))
```

The generator puts this call inside the DSCRP hook after the word's `define`. It works because APSUG's own hook was registered first (registry order), so `teach-appearance` is defined by then. (Probed. The probe's first version guarded the call with `fboundp`, which this MacLisp doesn't have. A generated file uses only what Ken's files use.)

**How it shows it** (pass 2). The row is:

> A **[grumpy]** character shows it by **[chasing ▾]** **[an enemy ▾ / a friend / a stranger]**, **[medium]** strongly.

- **The verbs** are those with a way of showing in the loaded set:
  - Ken's: accompanies, chases, hurts, pushes;
  - meets, with MEND5;
  - avoids, helps and follows, with KNOW.
- **The "who"** uses Ken's generators friend-of, enemy-of and stranger-of (prereq.19). Ken's "anyone will do", `is-not`, is offered only with SLIPS: in 1978 it finds no one (SLIPS' S1).
- **The Lisp is mean's own form** (dscrp.17:252-259), with `(bind ((other (character-that-satisfies (enemy-of ,character nil)))) (chases ,character `other))`.

**What it changes (probed).** "A grumpy character's speed is low, medium", added to grumpy-like-mean:
- The stepmother's speed goes from high to **medium**. Her own words' suggestions now disagree: strong says high, medium (dscrp.17:220), and grumpy says low, medium. COSUG combines them in the middle, and the kept suggestion's source is `(and grumpy ... strong)`. Of the 102 choices, only this one changes. Her relative speeds are as before (she is still faster than Cinderella).
- In the Introduction her walk to hit Cinderella takes the task's whole share, 12.5 seconds (7.32 with Ken's knowledge), and her chase takes 2.26 s (1.54). The scene films in 234 frames (225).
- The glass box can say all of this in one sentence: "Your *grumpy* said low and Ken's *strong* said high; Ani met them in the middle (medium)."

**Ani's checks for this kind:**
- A row may not repeat an element the same word already suggests (Ken's words have one suggestion an element each). For Ken's own words, a second suggestion for the same element is allowed: a learner may disagree with Ken. The trial job reports how COSUG combined the two.
- A look row needs APPEAR on.
- A "shows it by" row needs a verb with a way of showing in the loaded set.

#### 4.3 A relationship word, and another way of showing a verb

**A relationship word.**

> Teach Ani a way one character can feel about another: **[is-jealous-of]**
> It is about **[liking and disliking (affection) ▾ / who is in charge (domination)]**
> It means much the same as **[ ▾ ]** *or* the opposite of **[ ▾ ]** (optional)
> Ani can show it by having the first one **[follow ▾]** the other, **[medium ▾]** strongly,
> best **[always ▾ / when the first is in charge / when the first is not in charge / when the first doesn't like the other]**.
> (optional) The first moves **[faster than ▾ / slower than / the same as / differently from]** the other in **[speed ▾]**, **[weakly ▾]**.
> Because: **[one who is jealous of another follows it about, to keep an eye on it]**

- **The verbs** are the same menu as in §4.2.
- **The `best-when` choices** are the ones RELATE uses: `(dominates ,character ,other-character)`, its `not`, and `(not (likes ...))` (relate.22:45-68).
- **The relative row** is RELATE's own form, loves' `same-as` and dominates' `greater-than` (relate.22:22-27, 59-63).
- **The examples** are Ken's hates (avoiding, best when it doesn't dominate; relate.22:42-45) and, with KNOW, the revival's fears (avoiding, strongly).
- **The Lisp** is KNOWRL's fears form (knowrl.lisp), inside `(+after-load '|ken;relate >| ...)`, with `(putprop 'is-jealous-of '|KEN;RELATE| 'actor-load)`.
- **What it changes (probed).** With the stepmother `(and dominates hates is-jealous-of)` towards Cinderella, the learner's following reached her establish task as a related suggestion, and was flushed. Ken's CHOMET keeps only ways that another of the relationship's words suggests too (`eliminate-not-related-suggestions`, chomet.123:588-596), and pushing is suggested by both dominates and hates. The page's "set aside" line must give that reason. The rehearsal (§5) uses the new word alone, so it shows the way the learner meant.
- **For one of Ken's relationship words that has no way of showing** (is-tolerant-of, is-polite-to), the form is the same, written as `(uncompiled-ask is-polite-to process suggestions ...)`. The panel quotes Ken's decision 10: Ani "could show them only by gestures [it doesn't] have". A learner who disagrees can try, and see.

**Another way of showing a verb** (a step up: "give helps a new way of showing").

> Ani can also show **[helping ▾]** by **[going along with ▾]**: the **[helper ▾]** goes to the **[one helped ▾]** and they go on together.
> **[medium ▾]** strongly. Because: **[you can help someone by staying with them, so they are not alone]**

- **The menu of ways** is the display methods that take two characters, each with one plain sentence from the page's existing activity texts: going along with (goes-to-and-accompanys), chasing (chases-to), hitting (move-to-and-hits), pushing around (pushes-around), going to meet (MEND5's move-to), and with KNOW, helping along, moving away and following behind.
- **The roles** (who is first, who second) are filled from the verb's own roles. Each way's argument template comes from a fixed table, the one CONVEY's receivers use, so the learner never writes an argument list.
- **The Lisp** calls REVIVE;TEACH's `also-show`:

```lisp
;;yours k6: you can help someone by staying with them, so they are not alone
(also-show helps (helper helped)
	   (goes-to-and-accompanys helper helped (good-distance-from (vicinity-of helper)))
	   medium)
```

- **How `also-show` works.** It records the way, and TEACH's one wrapper on SUGCON's `gather-convey-suggestions` (sugcon.26:57) appends a `(suggestion: element (convey (helps a b)) value (method: type display value ...) strength medium source (yours helps))` after whatever Ken's and KNOW's receivers yield.
- **Why a wrapper and not a receiver.** A second `define-receiver` for the same message would stand in front of Ken's (with `:insert-methods-at-end nil`) and hide his. The wrapper only adds, which Ken's legitimacy rule asks of it. CHOMET then chooses among all the ways with its own scores, so a learner's way can lose.
- **Probed (Ani as in 1978 with MEND alone, Ken's own story):** in the Introduction, "Cinderella helps the Prince", which in 1978 had no suggestion and was canceled (AI-TR-540 p. 65; hard challenge D in the students' guide), is now shown by goes-to-and-accompanys. The scene films in 229 frames (192 in 1978, and with MEND alone). No other task changed its way.

#### 4.4 A feeling, and how it changes movement

> Teach Ani a feeling: **[grumpiness]**
> A character who feels it: **[speed ▾]** goes **[down ▾]**; **[how rhythmic ▾]** goes **[down]**; … (one row each, "+ another")
> each by as much as the feeling, **[medium ▾]** strongly.
> Because: **[a grumpy mood takes the bounce out of you]**

- **The elements** are those a change can be made to: speed, acceleration, how active, how rhythmic, and the path's length, curvature and jaggedness. Each takes up or down, or for the path "becomes long, short, curved or straight" (Ken's `change-to:`, emote.9:37-48).
- **The examples** are Ken's joy (emote.9:11-36) and, with KNOW, the revival's pride and anger.
- **The Lisp** is KNOWEM's form: `(define grumpiness emotion (process suggestions (for (establish (emotional-state ?character (grumpiness {a-felt-level? ?level}))) '(method: type display-value-change value (change: element (,character speed) amount (negative ,(felt-level level)) speed ,(felt-level level))) strength 'medium) ...))`. The two helpers `a-felt-level?` and `felt-level` are KNOWEM's. Without KNOW, TEACH has its own copies under the same names, defined only if they are not already defined.
- **How it is used in a story.** The editor's feelings list and the story schema (`feelingWords`, app/film/json.js) gain the learner's feelings. A feeling is written `(grumpiness (positive medium))` as KNOW's are, and a negative level is "not shown", with KNOWEM's note.
- **Ani's own warning, from Ken's decision 9.** If a row changes an element that joy also changes, in the opposite direction, the check says: "If a character feels this and joy at once, your speed going down and joy's speed going up cancel: Ken's CHOMET rejects conflicting changes rather than choose between them ('hopefully all conflicting ones are so noted for now rather than resolving them I'll reject', chomet.123:464)." This is exactly what happened to KNOW's first pride. It is a warning, not a refusal, because the learner may want to see it happen (an activity in §9).

#### 4.5 "A reasonable default course of action": hard, and how far to go

Ken's phrase covers two things in Ani's terms. The design takes the first in stage T7a and recommends against most of the second (Q5).

**(a) A new verb made of verbs Ani has** ("to tease someone, you run at it, then run off").
- CONVEY already defines verbs from verbs. A verb can be a kind of another, inheriting its prerequisites: `(define follows moves)` in KNOWCV, `(define pushes meets)` in Ken's CONVEY, where pushes is ";;gota meet in order to push". And `prevents` is shown by conveying `undoes` (convey.64:167-179).
- `recollect-convey-suggestions` follows a convey method to the next level's suggestions (sugcon.26:60-75).
- **Probed:**
  - teases, a kind of chases, shown by conveying `(sequence: (chases a b) (avoids a b))`: the task got no way of showing, and the one-scene story filmed 2 frames. A sequence is something SCENE makes of a scene's tasks, not something CONVEY can follow.
  - teases shown by conveying `(chases a b)` alone: the troll chases the goat (chases-to), 11 frames. A verb conveyed as one other verb works with no new code.
- **So the first version offers a verb that is "a kind of" one of Ani's verbs, shown as that verb is shown or by one of the ways in §4.3.** "A then B" needs new code in TEACH. The likeliest route is a convey method whose value names both verbs and is expanded into two convey tasks, in a `sequence:`, by a wrapper where CHOMET makes convey tasks from an establish task's choices. That is the revival's mechanism, not Ken's, and is Q5.

**(b) A new way of showing, made of walks.** KNOWDI's three methods show what one is: an estimate receiver and a run receiver, placing the two characters, two or three `move-character` walks each with a target, a start time relative to another walk, a speed and a carefulness, a bring-on step, and a distance record (knowdi.lisp:145-191).
- A form could build one from rows: "**[the other]** walks **[a small way towards ▾]** **[the first]**, **[at the start ▾]**; then **[the first]** walks **[a quarter of the screen away from ▾]** **[the other]**, **[half a second after ▾]** the other sets off, **[regardless of anyone in its way ▾]**."
- TEACH would generate both receivers in KNOWDI's form, using its fixed-place rule (every walk that ends before the method does goes to a place fixed as it sets off, or INTERF stops; knowdi.lisp:21-33), MEND6's bring-on, and the estimate as the sum and maximum of the walks' estimates.
- **Before it is accepted it must pass a rehearsal**: a two-character, one-scene story filmed with it. The rehearsal must end; no walk may leave the picture (`walksOffThePicture`, pipeline.js:1275); and Director's measured time must be within a factor of 2 of Ani's estimate (CRITIC's self-criticism threshold).
- **How far to go.** At most three walks, from menus, with no repeats, conditions or loops. Ken's pushes-around and repeatedly-come-in-contact, with their cycles, stay out of reach.
- **Recommendation:** build (b) only if a pilot shows learners asking for it. It is the most code, the most likely to make films Director stops on, and the furthest from "simply represented". Ken's DISPLY is where his knowledge is least modular. Stage T7b, 5 days.

### 5. Ani's own checks, what is refused, and Ken's legitimacy rule

**The trial job** ("Check with Ani", run on every change, in the page's worker, about as long as a pass 2):
1. Boot a Lisp with the film's extensions, TEACH and the notebook, and have it load DSCRP, RELATE, CONVEY, EMOTE and SUGCON (by asking an actor of each, as `aniNames` does). A Lisp break while loading the notebook is a refusal. The page says it plainly, with "What Lisp said" under it, as for a stopped film.
2. Evaluate `(check-your-knowledge)`, REVIVE;TEACH's checker. For each piece it asks Ani:
   - Does the word now exist (`exists?`), with the type asked (`recall your type`)? Its neighbors and opposites as spread are returned, for the page to say what spreading added.
   - Is each suggestion's element one of the choice points' elements (the offspring of `normal-movement-element`, or with APPEAR of `appearance-element`), and does its value read as Ken's value descriptions read values? This is a guard for a notebook edited as Lisp (Q8). The forms only offer values that pass.
   - Does a verb now yield a suggestion for a dummy task `(convey (verb a b))`, and is a display method an offspring of `display-method`?
3. **A rehearsal**, for the kinds pass 2 uses (§4.2's "shows it by", §4.3 and §4.4): a generated two-character, one-scene story that uses the piece. It runs through pass 1 and pass 2 (not filmed). "Ani heard it" means the piece's suggestion is among a choice point's or task's suggestions. "Ani didn't use it" names why, from the glass box (a prerequisite not met, a time that didn't fit, a better-scoring way).
   - The story scene probe took 39 seconds in Node with three other probes running.
   - The rehearsal runs only when asked ("Try it on a little story"), never on each keystroke.

**Refused, because it would stop Ani or isn't knowledge:**
- **A name Ani can't take as a word:**
  - not lower-case letters and hyphens, or longer than 30 characters;
  - `nil`, `t`, or a Lisp function;
  - an element or value name (speed, low);
  - the name of anything Ani defines (`aniNames(fs, {extensions})`, pipeline.js:1575: every actor and tag name). For example, `fear` is KNOW's feeling, `friends` is PREREQ's (prereq.19:134), and `alone` is CONVEY's verb.
  - A word of Ani's of the same kind is not refused: the form switches to "add to Ani's word".
- **A `define` of an existing actor.** The generator never writes one, and the trial job checks that every word Ken defines still has its suggestions after loading.
- **A link to a word of another kind**, such as a personality word close to a relationship word.
- **Links that, once spread, make a word both close to and opposite to another.**
- **A piece that names a character** ("the stepmother is slow"). The forms can't express one: every piece is about "a grumpy character", `?character`. For the plain-English path (§11) this is a check: "That's about this film's stepmother, not about any grumpy character. To change this film, criticize it (Your criticism)."
- **Two loaded notebooks that define the same word, verb or feeling.** Both are named, and the learner unticks one.
- **A verb or way that needs an extension that is off.** For example, following needs KNOW: "Turn on the revival's knowledge (KNOW), or choose another way".

**Ken's legitimacy rule, as a question, not a gate (Q4).** Ken's rule is about how he improved Ani: add "obvious information that was lacking", and don't arrange "for Ani to do what I want without improving the reasoning". For a learner, the page asks it at "Add to Ani", in plain words: "Would this be true of any grumpy character, in any story? Ken's rule for himself was to add only knowledge that was missing, never to arrange for Ani to make the film he wanted." The learner's `because` is required, and is what the glass box shows.

The page doesn't try to judge generality. Two things help the learner judge it:
- "Try it in another story" offers Red Riding Hood and the tortoise and the hare (test/stories/), with the learner's word put in.
- "What your knowledge did" shows each piece's effects on every film it has been used in.

A notebook is knowledge only one learner believes. It is labeled as theirs everywhere, and never becomes the revival's.

### 6. Where it is kept

- **Per browser, beside "Your films".** The library's IndexedDB database `ani-cinderella` goes to version 2, with a new store, "knowledge": each notebook's id, title, pieces (JSON), the generated Lisp, made and changed times. `openLibrary`'s `onupgradeneeded` adds the store. Films kept at version 1 stay as they are.
  - Where IndexedDB is refused (a sandbox), notebooks fall back to localStorage under `ani-cinderella:knowledge`, every access in try/catch, as RUN_KEY is.
  - "Forget everything" (library.js:387-452) forgets notebooks too, and says so.
- **Shared as a file.** "Save my knowledge" writes `<title>.ani-knowledge.json`: the JSON above with the generated Lisp text included, so it can be read without the page. "Open knowledge" reads one, from a file picker or by dropping it on the panel, runs the trial job's checks, and adds it as a notebook. A teacher can hand out a class notebook this way, or merge pieces from several (a "Copy into my notebook" button on each piece). In the claude.ai copy of the page, saving and opening files follow the patterns that page already uses for film files (the `artifact-sandbox` notes).
- **Never sent anywhere.** The page sends nothing about a notebook to any server. The one exception is the optional plain-English path (§11), which sends what the learner types to the provider the teacher set up, and the button says so.
- **Films carry the knowledge they were made with.** A film made with a notebook stores a copy of its pieces and Lisp (`filmData.knowledge`), so that it can be explained, compared and remade after the notebook has changed or been deleted. The glass box then says "made with Sam's knowledge as it was on 16 October".
  - This needs the film-file version the CRITIC design introduces (version 3, save.js `runVersion`), with `knowledge` as one more optional field. Older pages refuse such a film with their own "made by a newer page" message rather than show it without the knowledge that made it.
  - `filmMeta` gains the notebook titles, which "Your films" shows ("with Sam's knowledge").

### 7. How the glass box shows it

The page already marks the revival's knowledge (`knowBadge`, `knowOfSource`, `knowOfTask`, `knowItems`, `borrowedText`; film.template.html:2120-2215). A learner's knowledge is marked the same way, through an index of the same shape as `DATA.know`, built in the page from the notebooks the film was made with. So the same functions find it.
- **`YOURS`**, built by `yoursIndex(notebooks)` in a new app/film/teach.js, holds `words`, `knowledge` (source, element, value, strength, and for a way of showing `element: "establish"` and its `verb`), `verbs`, `feelings` and `links`, each entry with `{ notebook, piece, because }` in place of `{ file, line, why }`.
- **The "yours" badge.** `yoursBadge(entry)` reads `your knowledge: “<because>”` in a new `.yours-tag`, in its own color token (`--yours`, with light and dark values beside `--ours`). Its link opens the piece in Teach Ani, not code, with "See it as Ani reads it" there.
- **Pass 1.** In `choicePointBox`, a suggestion whose source is the learner's word, or `(neighbor-of grumpy mean)` with grumpy theirs, is worded by `sourceText` as "she is grumpy, which you taught Ani means much the same as mean", with the badge.
  - A set-aside suggestion of theirs says so.
  - A combined one (the probe's speed) reads "your *grumpy* said low and Ken's *strong* said high; Ani met them in the middle".
  - A suggestion of theirs added to one of Ken's words carries the same source as his (the word). It is told apart, as KNOW's additions to Ken's words are, by matching element, value and strength against `YOURS.knowledge` (`knowOfSource`'s rule).
- **Pass 2.**
  - `knowOfTask` finds a task shown by the learner's way (`source (yours helps)`), a word's or relationship's way of showing, or their feeling.
  - `borrowed` (pipeline.js `collectBorrowed`) already records a learner's word borrowing its neighbor's way (probed: `{"word":"grumpy","neighbor":"mean",...,"chosen":true}`).
  - The methods box marks such a way "(your way of showing it)".
- **"What your knowledge did here"**, a section in the character panel beside "What the revival's knowledge did here" (film.template.html:5042). It holds one sentence per piece that acted in this scene, for this character, with the badge.
- **The editor and "What Ani was told".** A learner's words are chips with the "yours" outline. Hovering one says "your word: means much the same as mean". The description's plain-English reading names the notebook.
- **Badges never mix.** A suggestion from Ken's knowledge has no badge, one from the revival's says "the revival's", and one from the learner's says "your knowledge". A suggestion that is the revival's neighbor-borrowing of a learner's word gets both, each for its part (the sharing is the revival's, the link is theirs), as `borrowedText` already words Ken's links with the revival's sharing.

### 8. How the learner sees its effect

- **"Make it with my knowledge"** sits in Teach Ani and under the editor's "Make the film". It makes the current story again with the same extensions and frames a second, plus TEACH and the ticked notebooks. When it is done, the page shows the two films side by side with `setPair` and `pairPanel` (film.template.html:4040, 6583), as CRITIC's remake does.
- **"What your knowledge did"** is the pair panel's first section, built by `knowledgeChanges(before, after, YOURS)`, a sibling of CRITIC's `criticismChanges` (pipeline.js:2177). It has three parts:
  - **Pass 1:** the choices that changed, each with what decided it ("the stepmother's speed: high → medium, because your grumpy met Ken's strong in the middle"), and the count ("1 of Ani's 102 choices changed").
  - **Each scene:** frames before and after; tasks whose way of showing changed; parts whose time changed ("her walk to hit Cinderella: 7.3 → 12.5 seconds").
  - **Each piece**, in one of four states:
    - *used and won*;
    - *used, combined* (met another suggestion in the middle);
    - *used and lost*, naming the winner from the choice point's record or the task's scores ("set aside: CHOMET scored going along with higher");
    - *never reached*, with why: "no character in this story is grumpy", "no scene shows what the stepmother is like", "the attractions aren't read by anything that draws the film".
- **Predict first.** Before the remake runs, the panel asks "What do you think will change?" and keeps what the learner types beside the result. This is the students' guide's habit (card 5, challenge A). It is optional, and not stored beyond the browser.
- **Speed.** A notebook that changes no pass-1 choice can reuse the film's KEN;CP when the film kept its files (CRITIC's `filesOf`, pipeline.js:2006), and a scene whose program comes out byte-identical keeps its film (CRITIC's rule). The probe of grumpy-like-mean would then refilm nothing: every program would be identical.

### 9. Knowledge and criticism

| | Criticism (REVIVE;CRITIC) | Knowledge (REVIVE;TEACH) |
|---|---|---|
| What it is about | How Ani made **this film**: this way of showing, this part's pace, these two in this scene | What words, relationships, verbs and feelings **are**: for any character, any story |
| Where it is kept | With the film, a record (`run.criticism`, KEN1;FILM CRITIC) | In the learner's notebook, and a copy with each film made with it (YOURS;N1 KNOW) |
| Where Ani heeds it | Where Ani chooses: vetoes at CHOMET, Ken's stub for criticism in CHOOSE | Where Ani's knowledge comes from: DSCRP, RELATE, CONVEY, EMOTE, APSUG, as more suggestions |
| What it can do | Remove an alternative, change a time, add a post-condition | Add words, suggestions, links and ways; never remove or weaken Ken's |
| Ken's text | Section D, pp. 189–191 | "Three Interactions" (1977), p. 7; AI-TR-540 pp. 149–150 |

- **The cheating footnote** draws the line between them. Arranging "for Ani to do what I want without improving the reasoning" is what a criticism does, deliberately and openly, for one film. That is why CRITIC keeps it in the film's record and never lets it become knowledge (design-criticism.md §8). Knowledge a learner deliberately adds is the other side of the line: it is meant to improve the reasoning, by the learner's lights, for every film. The footnote is about criticism, or a programmer's quiet tuning, leaking into knowledge. It doesn't apply to knowledge a learner deliberately adds, which is labeled as theirs. Ken's positive rule ("add obvious information that was lacking") is what the learner is asked to hold themselves to (§5).
- **Hand-offs.**
  - CRITIC's design already refuses a criticism that is really knowledge ("Ani should know hitting is not friendly": "That's knowledge Ani lacks, not a criticism of this film"). That sentence gets a button, "Teach Ani instead", which opens the matching form with the learner's words as its `because`.
  - Teach Ani's refusal of a piece that names a character ("the stepmother is slow") offers "Criticize this film instead", which opens CRITIC's pass-1 criticism of that choice point.
- **Together.** A film may be made with a notebook and criticized. The criticism record is heeded in jobs that have the notebook loaded, and the remake keeps both. A criticism never edits a notebook, and a notebook never edits a criticism.

### 10. The 1978 contract

- **Nothing changes unless the learner's knowledge is loaded.** TEACH is `onDemand`, never in the switch's set, and loaded only into the jobs of a film made with a ticked notebook. Ani as in 1978, the revival's set, and Ken's film are exactly as before.
- `check-1978 --extensions teach` with an empty notebook is byte-identical, glass.json included, with the same loaded files besides TEACH's own. (An empty notebook writes a file with no pieces. The wrapper on `gather-convey-suggestions` passes straight through when nothing was `also-show`n.)
- `check-ext` with `,teach` and an empty notebook equals each golden set (KNOW, SLIPS, DETAIL, SEEN, APPEAR at 4 frames a second).
- **A golden that is a contract, from the probe:** Ken's Cinderella with "mean" replaced by "grumpy", and a notebook that says only "grumpy means much the same as mean", makes Ken's film. Pass 1 makes the same 102 choices and the Introduction has the same frames as with "mean", MEND and KNOW on. (A full-film version belongs in tools/check-teach.mjs.)
- The shipped data (`DATA.words`, `DATA.know`, the scenes) is never rebuilt from a learner's knowledge. `tools/build-film-app.mjs` never sees a notebook.
- The page's prompt for "Tell Ani a new story" with no notebook ticked stays byte-identical.

### 11. A plain-English path (optional, labeled)

**"Tell Ani in your own words."** It sits at the bottom of Teach Ani, for any provider the teacher has already set up (`PROVIDERS`, llm.js:15-38; Gemini Nano works offline).

- **The learner types**, for example, "Grumpy people are like mean people, but they walk slowly because they can't be bothered."
- **The model returns pieces** under a strict schema, `teachSchema(extensions, notebooks)` in app/film/teach.js. Its enums are Ani's live vocabulary, elements, values, verbs and ways. Each piece has `said`, the exact words of the learner's it came from.
- **Each piece arrives as a filled-in form**, waiting. Its `because` is the learner's own `said` words, never the model's, and nothing is added until the learner presses "Add to Ani" on it.
- **Checks on the reply:**
  - a piece whose `said` isn't found in what the learner typed is dropped and named ("the model added this; you didn't say it");
  - a piece about a named character goes to criticism (§5);
  - anything Ani can't represent is answered with p. 191's sentence on what is built in or lacking, as CRITIC's `cannot` kind is.
- **The prompt** shows the model Ken's own entries as examples (shy, mean, hates, joy) and tells it to translate, not to add knowledge.

**Does it fit Ken's goal?** Only partly, and the design says so on the page. The hope in the 1977 paper is that children become "more explicit about their own thoughts and knowledge". A model that writes knowledge for them works against that: the explicitness would be the model's. A model that only translates what the child already said into Ken's form keeps the child's knowledge, and adds a step that is itself explicit-making: checking whether the form says what they meant. Children are good at noticing "that's not what I said". So:
- the model only translates, and never proposes knowledge the learner didn't state;
- the forms come first on the page, with the model's path under them, labeled "a language model's reading of your words";
- the teachers' guide recommends the forms for children and the model's path for older students who want to write a lot at once (Q6).

### 12. Activities for the guides

The guides' cards follow their form: Try, Think, What to look for, with levels "Start here", "Going further" and "Hard challenges". The answers below are what the probes found. They would be checked again on the built page.

**Start here**

- **Teach Ani "grumpy" (15 minutes, with about 3 minutes of waiting).**
  - *Try:* In Change the story, replace the stepmother's "mean" with "grumpy" and make the film. Then Teach Ani that grumpy means much the same as mean, and make it again with your knowledge.
  - *Think:* What changed the first time, when Ani didn't know the word? What changed the second time?
  - *What to look for:* The first time, one of Ani's choices about the stepmother changed. With nothing to go on, Ani picked her attraction to enemies from the film's variety, so she is now drawn towards Cinderella, and she chases her before hitting her. The second time, the film is exactly Ken's: you gave Ani back what "mean" meant. Click the stepmother: "she is grumpy, which you taught Ani means much the same as mean".
- **A slow grumpy stepmother (15 minutes).**
  - *Try:* Add to grumpy: speed low, medium strongly. Before making the film, write down how fast you think she will move.
  - *Think:* Why isn't she slow?
  - *What to look for:* She moves at medium speed. Her other word, strong, says fast (Ken's knowledge), so Ani met the two in the middle. Her walk to hit Cinderella now takes 12.5 seconds instead of 7.3.
- **A word of your own, in a story of your own (20 minutes).** Teach Ani a word for a character in your own story, and look for your "yours" badges in the side panel.

**Going further**

- **Give "helps" a way of showing (20 minutes).**
  - *Try:* With Ani as in 1978, find the part of the Introduction that takes no time (challenge D). Then Teach Ani that helping can look like going along with, and make the film again.
  - *What to look for:* Cinderella now helps the Prince by going along with him. Compare it with the revival's own way (KNOW's helping along): which shows helping better? Why did Ken's Ani cancel the helping in 1978?
- **"Green is jealous" (20 minutes, needs the revival's extensions).** Ken's thesis names "green is jealous" as a convention (p. 161), but Ani never had the word. Teach Ani "jealous", a hue of green, and "is jealous of", shown by following. Make the stepmother jealous, and jealous of Cinderella. Is she green? Does she follow Cinderella?
  - *What to look for (probed):* She is green, and her paths are more jagged, but she still pushes Cinderella instead of following her. Open "How Ani chose this": Ani prefers a way of showing that two of her words suggest at once (dominates and hates both suggest pushing), and only your word suggested following. How could you get the following shown? (Try making "is jealous of" her only word for Cinderella.)
- **Prove Ken wrong (30 minutes).** Ken decided Ani can't show "is polite to", because it has no gestures (his decision 10). Give it a way of showing from Ani's ways, and argue whether the film shows politeness. Ask a classmate who hasn't seen your knowledge what the film shows.
- **A feeling that cancels (25 minutes).** Teach Ani "grumpiness": speed goes down. Put it in a scene where the same character is also happy. Why does the speed not change at all? (Ken's CHOMET rejects changes that conflict; his decision 9 found this with pride.)

**Hard challenges** (hard for a chatbot too: the answers depend on Ani's conflict resolution, which you can only find out by running it)

- **Predict the 102 (30 minutes).** Before making it, predict which of the 102 choices your knowledge will change, and which way. Score a point for each one right, including those that stay. Ask a chatbot for the same predictions, with your knowledge and Ken's description, and compare scores.
- **Ken's rule (45 minutes).** Teach Ani something that makes the stepmother stop touching Cinderella in the Introduction, but that is true of any character with her words, in any story. Then try your knowledge on Red Riding Hood. Did it still make sense there? If not, was it knowledge, or a criticism of one film?
- **Two notebooks (30 minutes).** Swap notebooks with a partner and make the same story with each. Explain every difference using only the side panel.

**For the teachers' guide**
- **Ages.**
  - 10 to 12: kinds 1 and 2 only, with an adult reading the first lines.
  - 13 to 16: relationships and feelings.
  - University: the Lisp view, kind 5, and Ken's 1977 paper beside AI-TR-540's Section B.
- **Assessment.** The `because` lines are the explicit knowledge the 1977 paper hoped for. Collect the notebooks and read them.
- **Privacy.** Notebooks stay in the browser unless a learner saves a file. Nothing is sent anywhere unless the plain-English path is used.
- **A class dictionary.** Each pair teaches one word with a reason. The teacher merges the pieces into one notebook and hands it out, and the class makes Ken's story with it and discusses each badge.

### 13. What the probes found

The probes are scratch files in the session's scratchpad (`teach/`):
- `probe.mjs` adds a learner file as an extra registry entry and makes the story with `makeFilm`;
- the learner files are `grumpa.lisp`, `grumpb.lisp`, `helpac.lisp`, `jealous.lisp`, `teases.lisp` and `tease1.lisp`;
- the stories are `grumpy-cindy.lisp`, `jealous-cindy.lisp` and `teases-story.lisp`.

Each film was made from pass 1 through the Introduction (or the one scene), at 4 frames a second. Pass 1 of Ken's story took 130–175 seconds in Node with four or five probes running at once.

| Learner's knowledge | Story and extensions | Without it | With it |
|---|---|---|---|
| none, "grumpy" unknown | Ken's, stepmother (and grumpy selfish strong evil); MEND, KNOW | — | stepmother's attraction towards enemies (positive high), by variety alone (Ken's mean: (negative high)); Introduction 226 frames, the chase before the hit |
| grumpy means much the same as mean | the same | Ken's with "mean": 102 choices, Introduction 225 frames | all 102 choices the same, sources `(neighbor-of grumpy mean)`; KNOW borrows mean's hurting and chasing; Introduction 225 frames, **the same frames** (hash) as Ken's with "mean" |
| and: grumpy's speed is low, medium | the same | stepmother's speed high | speed **medium** (grumpy's low met strong's high), the only one of 102 to change; her walk to hit 7.32 → 12.5 s, her chase 1.54 → 2.26 s; Introduction 234 frames |
| helping can look like going along with (`also-show`) | Ken's own story; MEND only (Ani as in 1978 with its repairs) | the helping canceled (no way of showing), 192 frames | helping shown by goes-to-and-accompanys; Introduction 229 frames; no other task's way changed |
| jealous (path-jaggedness high, weakly; hue green, "green is jealous"); is-jealous-of, shown by following | Ken's, stepmother also jealous and is-jealous-of Cinderella; MEND, KNOW, APPEAR | stepmother's path-jaggedness medium; hue any but orange, purple and red; Introduction 222 frames | path-jaggedness **high** (jealous and evil against strong's low, set aside as "much less strongly suggested"); hue **green**, from jealous; 2 of 156 choices differ; Introduction 235 frames. She still pushes Cinderella: Ken's CHOMET flushed the following, a way only one word suggests, keeping pushing, which dominates and hates both suggest (`eliminate-not-related-suggestions`, chomet.123:588-596) |
| teases, a kind of chases, shown by conveying (sequence: (chases a b) (avoids a b)) | a one-scene story, (convey (teases troll goat)); MEND, KNOW | — | `cant-do`: `rejected-suggestion: reason no-idea-how-to-convey-method`; 2 frames |
| teases, a kind of chases, shown by conveying (chases a b) | the same | — | the troll chases the goat (chases-to); 11 frames |

Further findings:
- **A word only linked to a known one is as safe as the design hoped.** With grumpy-like-mean, the stepmother's 12 choice points and their values are CP 29's. Only the sources name grumpy (`(neighbor-of grumpy mean)`), and Ken's priority for neighbors (2 against a word's own 3, film.17:50-52) changed nothing, since no other source disagreed on those elements.
- **An unknown word is not neutral.** Ken's pass 1 makes it a bare descriptor (cosug.215:28). The choice it no longer informs falls to the film's levels: the stepmother's attraction towards enemies went from (negative high) to (positive high). This is the first lesson the "grumpy" card teaches.
- **A learner's suggestion meets Ken's by COSUG's rules, in the open.** grumpy's speed low and strong's high made medium, with both words in the kept suggestion's source. The relative choice points kept their values, so she is still faster than Cinderella.
- **Adding a way of showing as a wrapper works with Ani as in 1978** (MEND alone), so TEACH needn't require KNOW.
- **A verb defined as a sequence of verbs is not followed by CONVEY** (`no-idea-how-to-convey-method`), while a verb conveyed as one other verb is. That is the hard part of kind 5.
- **A learner's relationship way can lose to Ken's rule for showing several words at once.** CHOMET keeps only ways that another of the relationship's words suggests too (chomet.123:588-596), so is-jealous-of's following, suggested by it alone, was flushed beside pushing, which dominates and hates both suggest. The glass box must say so plainly ("set aside: Ani prefers a way that shows two of her words at once"), or the learner will think the knowledge was ignored. With is-jealous-of as her only word for Cinderella, nothing would compete with it. This is a good "Going further" card.
- **APPEAR's table takes a learner's look as it takes the revival's**, through `teach-appearance`, with the evidence `(yours ...)`. The jealous stepmother is green, with jealous as the kept suggestion's source.
- **MacLisp here has no `fboundp`.** The generator writes only forms that Ken's and the revival's files use, and the trial job's load is the check.

## Alternatives considered

- **Let learners type Lisp in a file editor, as "Ani's version" of the story.** Rejected as the main way: the 1977 paper asks for knowledge "as modular and simply represented as possible", and for children Ken's rule is a simple default view. Kept as stage T8 for older students ("Edit as Lisp"), parsed back into pieces with the page's Lisp reader and refused if a form isn't one the generator writes (Q8).
- **A JavaScript layer that changes Ani's choices from a table of the learner's rules.** Rejected, as every earlier design rejected it: the glass box would explain the page's code, not Ani's reasoning, and the learner wouldn't "see the knowledge ... accomplish something complex".
- **Writing the learner's knowledge into the film description** (new forms in CINDY). Rejected: the description is what a film should convey, and knowledge is what Ani knows. CINDY's DATEST would also read new forms as tasks.
- **A new `define-receiver` for an extra way of showing.** Rejected (§4.3): it hides Ken's receiver instead of adding to it.
- **Letting learners lower or remove Ken's suggestions** (a "not this" for a word). Rejected: Ken's footnote names removing an option, or making it look undesirable, as cheating, and a learner who disagrees with Ken can add an opposite suggestion and see COSUG weigh the two.
- **Sharing notebooks through a server or a gallery.** Rejected for now: files are enough for a class, nothing leaves the browser, and a server needs accounts and moderation for children (Q7).
- **Making "the revival's" knowledge editable in the same panel.** Rejected: KNOW's pieces are reviewed against Ken's decisions and tested in goldens. A learner can copy one into their notebook ("Copy into my notebook") and change the copy.

## Changes, file by file

- **src/director/revive/teach.lisp (new):**
  - `load-your-knowledge`;
  - `also-show` and its table, with the wrapper `gather-convey-suggestions-with-yours` (sugcon.26:57) under the id `teach`;
  - copies of `a-felt-level?` and `felt-level` when KNOWEM's are absent;
  - `check-your-knowledge`, returning, for each word, its type, its links as spread, and whether each piece is heard.
- **src/pipeline.js:**
  - the `teach` registry entry (group `yours`, `onDemand`);
  - `boot({ knowledge })`, which writes each notebook's Lisp as YOURS;Nk KNOW and loads it after the extensions;
  - `makeFilmSteps`, `remakeFilmSteps` and the tools passing `knowledge` to every job;
  - `knowledgeChanges(before, after, index)`;
  - `aniNames` taking `knowledge` (a learner's words become Ani's names, so a story's scene called grumpy is renamed by `storyWithoutClashes`).
- **src/teach.js (new, shared by the page, the worker and the tools):**
  - `checkNotebook(notebook, vocabulary)`, the page-side checks;
  - `notebookToLisp(notebook)`, the generator, one function per kind, each writing Ken's form;
  - `yoursIndex(notebooks)`;
  - `rehearsalStory(piece)`.
- **app/film/teach.js (new):** the panel, the forms and their menus, the preview, `teachSchema` and the prompt for §11.
- **app/film.template.html:**
  - "Teach Ani" beside "Change the story";
  - "+ teach Ani a word" in each word list;
  - `vocabularyFor(extensions, notebooks)` with `yours: true` words and their outline;
  - `yoursBadge`, `sourceText`, `knowOfSource`, `knowOfTask` and `knowItems` reading `YOURS`;
  - "What your knowledge did here";
  - the pair panel's "What your knowledge did";
  - "Make it with my knowledge";
  - the "Which extensions" panel's greyed TEACH line;
  - `--yours` color tokens.
- **app/film/json.js:** `schemaWords` and `feelingWords` taking the notebooks' words and feelings.
- **app/film/library.js:** database version 2 with the "knowledge" store, notebook load, save, export and import, and "Forget everything".
- **app/film/save.js:** `knowledge` in version-3 films (with CRITIC's version 3).
- **app/film/llm.js:** a `teach` mode of `CALLS`.
- **tools/run-story.mjs and tools/check-teach.mjs (new):** `--knowledge notebook.json`, and the goldens below.
- **site/pages/students.html and teachers.html:** the activities of §12. That is another agent's file at the moment, so the cards go in after it is free.
- **reports/ext/teach/README.md:** what each golden notebook does to Ken's Cinderella.
- **PLAN.md:** a Phase-9 section, "Teaching Ani (TEACH)".

## Lisp sketch

```lisp
;;; REVIVE;TEACH (sketch). The helpers a learner's knowledge (YOURS;Nk KNOW) uses.

(or (boundp ':your-ways) (setq :your-ways nil))

;; the page's YOURS;Nk KNOW files, loaded after the extensions (src/pipeline.js boot)
(defun load-your-knowledge (file)
  (load file))

;; (also-show helps (helper helped) (goes-to-and-accompanys helper helped ...) medium):
;; one more way of showing a verb, beside Ken's and the revival's, never in place of them
(defun also-show fexpr (args)
  (let (((verb roles form strength) args))
       (setq :your-ways (cons (list verb roles form strength) :your-ways))))

(defun your-ways-for (task)
  (mapcan (function
	   (lambda (way)
		   (let (((verb roles form strength) way))
			(and (eq verb (first task))
			     (= (length roles) (length (rest task)))
			     (list (list 'suggestion: 'element (list 'convey task)
					 'value (list 'method: 'type 'display
						      'value (sublis (mapcar (function cons) roles (rest task))
								     form))
					 'strength strength
					 'source (list 'yours verb)))))))
	  :your-ways))

;; SUGCON's one place every verb is asked for its ways (sugcon.26:57)
(defun gather-convey-suggestions-with-yours (task)
  (let ((theirs (funcall (revival-wrapped 'gather-convey-suggestions 'teach) task)))
       (cond (:your-ways (append theirs (your-ways-for task)))
	     (t theirs))))

(+after-load '|ken;sugcon >|
  '(revival-wrap 'gather-convey-suggestions 'teach 'gather-convey-suggestions-with-yours))
```

`also-show` is sketched as an fexpr. If this MacLisp's `defun` doesn't take `fexpr` as written, the generator writes `(also-show '(helps (helper helped) ... medium))` with a plain function. The builder checks this in the first test.

A generated file, for the two pieces of §3 and the jealous pieces of §4.2 and §4.3:

```lisp
;;; -*-lisp-*-
;;; YOURS;N1 KNOW: "Sam's knowledge", taught to Ani on the film page (Teach Ani).
;;; Written by the page from Sam's pieces; each ;;yours line is Sam's own reason.

(defun teach-yours-n1-words ()
  (let ((:insert-methods-at-end nil))

;;yours k1: a grumpy character is a mean one
;;yours k2: a grumpy character drags its feet: it can't be bothered to hurry
(define grumpy personality-character-descriptor
 (process suggestions
	  (for speed low strength medium)))

;;yours k3: a jealous character keeps a close watch, darting about
(define jealous personality-character-descriptor
 (process suggestions
	  (for path-jaggedness high strength low)))

;;yours k4: "green is jealous", a convention the thesis names (AI-TR-540 p. 161)
(teach-appearance '((jealous color-hue green medium (yours |green is jealous|))))

(progn
 (ask mean add grumpy to your list of neighbors))))

(+after-load '|ken;dscrp >| '(revival-once 'yours-n1-words 'teach-yours-n1-words))

(defun teach-yours-n1-relationships ()
  (let ((:insert-methods-at-end nil))

;;yours k5: one who is jealous of another follows it about, to keep an eye on it
(define is-jealous-of affection-relationship-descriptor
 (process suggestions
	  (for (establish (is-jealous-of ?character ?other-character))
	       '(method: type convey
			 value (follows ,character ,other-character))
	       strength 'medium)))))

(+after-load '|ken;relate >| '(revival-once 'yours-n1-relationships 'teach-yours-n1-relationships))

(mapc (function (lambda (word) (putprop word '|KEN;DSCRP| 'actor-load))) '(grumpy jealous))
(putprop 'is-jealous-of '|KEN;RELATE| 'actor-load)
```

(The `teach-appearance` line is written only when APPEAR is among the film's extensions. With APPEAR off, a look piece is "not reached: Ani isn't choosing looks", §8.)

## Tests

**Unit, test/teach.test.js:**
- `notebookToLisp` for each kind matches a fixture file byte for byte.
- Every generated file loads in a booted Lisp with no break, with and without KNOW and APPEAR.
- A word Ken defines keeps all its suggestions after a notebook that adds to it loads (the never-`define` rule).
- `checkNotebook` refuses each case of §5 with its sentence.
- `also-show` passes straight through with no ways, and appends with one.
- `yoursIndex` finds each piece from the sources the probes recorded.

**End to end, tools/check-teach.mjs** (goldens in reports/ext/teach/, at 4 frames a second):
1. grumpy-like-mean on Ken's Cinderella with "grumpy" for "mean", MEND and KNOW: the same choices as CP 29, and every scene's frames equal to KNOW's goldens (the contract golden, §10).
2. grumpy-like-mean plus "speed low, medium": the stepmother's speed is medium and nothing else changes in pass 1; the Introduction is 234 frames.
3. "helping can look like going along with", Ani as in 1978 with MEND: the Introduction is 229 frames, the helping is shown by goes-to-and-accompanys, and Kept Apart onward are 1978's if their programs come out the same.
4. jealous and is-jealous-of, with MEND, KNOW and APPEAR: the stepmother green, her path-jaggedness high, 2 of 156 choices changed, the following flushed by `eliminate-not-related-suggestions` and the glass box saying so; and with is-jealous-of her only word for Cinderella, the following shown.
5. A feeling that cancels joy: the warning, and CHOMET's rejection in the glass box.
6. teases, a kind of chases, conveyed as chasing (kind 5a): 11 frames, chases-to; conveyed as a sequence, `no-idea-how-to-convey-method` until T7a's mechanism exists.
7. The rehearsal story of each kind finishes in under 60 seconds in Node.

**The 1978 contract (§10):**
- `check-1978` with no extensions;
- `check-1978 --extensions teach` with an empty notebook;
- `check-ext` with `,teach` for each golden set;
- `npm test`.

**The page, tools/check-film-app.mjs:**
- teach grumpy through the forms;
- make with knowledge;
- the pair panel's "What your knowledge did";
- a "yours" badge in a choice point;
- save and open a notebook file;
- a version-3 film made with a notebook reopened after the notebook is deleted.

## Risks

- **A learner's knowledge stops Ani in a story.** The trial job and the rehearsal catch most of this. A film that stops anyway is explained as any stopped film is, with "made with your knowledge" and an offer to make it without.
- **Pieces added to Ken's own words** share his source name, so the glass box tells them apart only by matching values (§7). Two pieces with the same element, value and strength as Ken's are indistinguishable, and the badge then says "yours, and Ken's too".
- **Pass 1 is the slow part** (about 2 minutes for Cinderella in Node; longer in a browser). Every notebook that changes a pass-1 choice remakes all five scenes. The byte-identical rule spares unchanged scenes.
- **Children may teach knowledge that is unkind about people.** Nothing here is shared unless they choose to save a file, but the teachers' guide should say that the `because` lines are read by the teacher.
- **Kind 5b** could make films Director stops on, despite the rehearsal. It is held back (Q5).
- **The claude.ai copy** limits files and storage. The artifact-sandbox patterns the page already uses apply, and notebooks fall back to localStorage there.

## Stages

Each stage can be built and tested on its own, in this order.

| Stage | Work | Files and wraps | Tests and goldens | Page | Effort |
|---|---|---|---|---|---|
| T0 | Registry, on-demand loading, the YOURS files, the generator for kind 1, the trial job | pipeline.js (`teach`, `boot({knowledge})`, `aniNames`); revive/teach.lisp (`load-your-knowledge`, `check-your-knowledge`); src/teach.js (`notebookToLisp` kind 1, `checkNotebook`) | teach.test.js (kind 1); check-teach 1; check-1978 --extensions teach | none yet; tools/run-story.mjs --knowledge | 2.5 d |
| T1 | Kind 1 on the page | app/film/teach.js; library v2; save.js v3 field | check-film-app (teach grumpy, make, pair panel) | Teach Ani, the form, the preview, "yours" chips and badges, "Make it with my knowledge", "What your knowledge did" | 4 d |
| T2 | Kind 2: movement, looks, ways a word shows itself | generator kinds 2a–2c | check-teach 2, 4 (looks) | the rows, the elements' "who reads it", Ken's examples | 3 d |
| T3 | Kind 3: relationship words; another way of showing a verb | teach.lisp `also-show` (sugcon.26:57) | check-teach 3, 4 | the forms; the rehearsal button | 3 d |
| T4 | Kind 4: feelings | generator kind 4; KNOWEM's helpers | check-teach 5 | the form; the conflict warning | 2 d |
| T5 | Files, guides, criticism hand-offs | library export/import | check-film-app (save and open) | Save and open knowledge; "Teach Ani instead" in CRITIC; the guides' cards | 2 d |
| T6 | The plain-English path | app/film/teach.js `teachSchema`, llm.js `teach` mode | canned replies in teach.test.js | "Tell Ani in your own words" | 2.5 d |
| T7a | Kind 5a: a verb as a kind of another | generator kind 5a; for "A then B", a wrapper where CHOMET makes convey tasks (Q5) | check-teach 6 | the form | 1–3 d |
| T7b | Kind 5b: a way of showing from walks (only if Q5 says so) | teach.lisp `define-way-of-showing` in KNOWDI's form | rehearsal goldens | the walk rows | 5 d |
| T8 | Edit as Lisp (only if Q8 says so) | the page's Lisp reader to pieces | round-trip tests | "See and edit as Ani reads it" | 2 d |

T0–T6 come to about 19 working days, which covers kinds 1 to 4, the files, the guides and the plain-English path. T7a adds 1 to 3, T7b 5, T8 2.

## Questions for Ken

1. **The name: "Teach Ani", and "your knowledge"?** Recommended: yes. "Teach" is what a child does; "knowledge" is Ani's word, and the thesis's.
2. **Should TEACH require KNOW?** Recommended: no. It requires MEND only. KNOW's verbs, its pass-2 borrowing and its words are offered when KNOW is on, and a piece that needs them says so. The probe shows a learner's way of showing works with Ani as in 1978 plus MEND, which makes "your knowledge against Ken's alone" a clean experiment.
3. **May learners add to your own words** (a new suggestion for shy, a way of showing for is-polite-to)? Recommended: yes, marked "yours, added to Ken's shy", only ever adding, never removing or weakening (your cheating footnote), with your entry shown read-only beside theirs.
4. **Your legitimacy rule: a gate or a question?** Recommended: a question, with a `because` required, and only a piece naming a character refused. A learner's knowledge is theirs to be wrong about, and seeing it misfire in another story is the lesson.
5. **How far toward "a reasonable default course of action"?** Recommended: a verb that is a kind of one of Ani's (T7a), and "A then B" only if you are content with the revival's mechanism for sequences. A way of showing built from walks (T7b) only after a pilot asks for it.
6. **The plain-English path: translation only, and second to the forms?** Recommended: yes. The model never proposes knowledge the learner didn't state, the `because` is always the learner's own words, and the guide recommends the forms for children.
7. **Sharing by file only?** Recommended: yes, with no server or gallery. Teachers merge and hand out notebooks.
8. **Should older students be able to edit a notebook as Lisp?** Recommended: later (T8), and only for forms the generator writes, so that the glass box can always map a suggestion back to a piece.
9. **Several notebooks in one film** (a class's)? Recommended: yes, up to four, refused if two define the same word.
10. **The mini-Ani in the Agent Kit**: should it get the same idea, editable slots already being its knowledge? Recommended: not now; note it in the kit's write-up of what it can express.
11. **Your 1977 paper:** may a copy, or its p. 7, go into `sources/` so that the guides can quote it and link it? Recommended: yes, if you have a scan, with its citation as in AI-TR-540's bibliography.

## Thesis references

- Section B, Ani and Education: AI-TR-540 pp. 149–150, L3953-3973.
- The Conclusion, "a repository, in an explicit and precise form": p. 242, L6331-6332.
- Modularity: p. 45, L1339-1342.
- Words that could be added: p. 19, L655-662.
- Opposite and similar links: p. 83, L2342-2344.
- The legitimacy rule and its cheating footnote: p. 189, L4939-4954.
- Social conventions, "green is jealous": p. 161, L4228.
- Kahn 1977a, "Three Interactions between AI and Education", Machine Intelligence 8, pp. 422–428: AI-TR-540 bibliography, L8185-8188.
- Ken's code: dscrp.17:49-295; relate.22:11-114; convey.64:60-190; sugcon.26:57-75; emote.9:11-72; cosug.215:15-88; film.17:46-55; char.2:111-131; chomet.123:464.
- The revival's: know.lisp, knowds.lisp, knowrl.lisp, knowcv.lisp, knowdi.lisp, knowem.lisp, apsug.lisp:51-125, wrap.lisp; src/pipeline.js EXTENSIONS, boot, aniNames, storyWithoutClashes, collectBorrowed, ELEMENT_USE; app/film.template.html vocabularyFor (:526), knowBadge (:2131), sourceText (:4550), choicePointBox; app/film/json.js storySchema (:56); app/film/library.js.
