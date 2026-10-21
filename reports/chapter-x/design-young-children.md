# Ani for young children: an age setting (ages 6–8, 9–11, 12+) on the film page, with speech

*Written by a design agent on 20 October 2026, for Ken's request: "a toggle to make Ani's interface and explanation more appropriate for young children (along with a speech interface)". Ken's answers: "Let's try both settings along with the 12+ setting" (three settings: ages 6–8, ages 9–11, and 12+, which is today's page); speech recognition that sends audio to a cloud service is acceptable if it is opt-in and labeled ("yes"); and "let's keep the editor as it is for now". This design follows the form of the earlier designs in this folder and, like them, should be reviewed adversarially before it is built. It changes nothing in Ani: no Lisp, no extension, no pipeline code. It is a design for the page only (app/film.template.html and app/film/\*.js), its checks (tools/check-film-app.mjs) and the guides (site/pages/students.html and teachers.html). Every glass-box fact quoted below was read on 20 October from the saved glass boxes of Ken's Cinderella (reports/ext/appear/\*.glass.json) and from the 13 October Tortoise and Hare trial (reports/llm-trials/2026-10-13 gpt-6.1-sol json/the-tortoise-and-the-hare.\*). Nothing in the repo's code was changed.*

**Since 21 October 2026: two settings, 6–11 and 12+.** Ken: *"My grandchildren (5 and 7) would have no problems with the 9-11 wording - let's skip the 6-8 and rename the 9-11 to 6-11."* So 6–8 below was not built beyond its first version and is gone; 9–11 is now 6–11, in everyday words throughout (not only the explanations), with 6–8's cheap extras as options ("Bigger" buttons and words, the spoken-command microphone beside Play once Talk to Ani is on, and "Wait for the voice" in the speech settings). Old links (#ages-6-8, #ages-9-11) open 6–11. What changed, word by word, and the labels that no longer say "my": reports/chapter-x/ages-6-11-words.md. The rest of this design is kept as it was written, for the record.

## Summary

**The principle.** The setting changes how the page presents Ani. It never changes what Ani does or why. Simple sentences are generated from the same glass-box records as the full ones, by templates (not by a language model rewriting the full sentences), so a simple sentence can only say what the record says. Each simple sentence has the fuller one a click away, and that one has Ani's own records a click further on. This is Ken's glass-box rule (a simple default view, details on click, no unexplained parts, short intros, plain language) taken one step further for younger readers.

**The three settings.**
- **12+** is today's page, unchanged, byte for byte. It is the default.
- **Ages 9–11** keeps every panel but shortens the default view. Characters keep their names (with their shape icon). Ani's own words ("dominates", "is tolerant of") stay, with a glossary popover on each. Seconds are rounded to one decimal place and frame numbers are hidden. Ken's code citations, the Lisp and the revival's repair notes move under "More". It is about the reading level of the students' guide's "Start here" cards.
- **Ages 6–8** is a different default view, made for a child with an adult nearby. Play, the scene buttons and the cast are large. Characters are named by what the child sees, "the red square" and "the green star", with their names in the legend and the panel heading. Sentences are short and use a fixed word list. Ani's harder words are replaced by a plain gloss ("is the boss of"), and Ani's own word is one tap away. Read aloud is on. The explanation is a three-step ladder ("The story says…", "Ani knows…", "So Ani…"), and "More" gives the 9–11 sentence, then today's.

**One worked example** (Ken's Introduction, the stepmother pushing Cinderella around):
- 12+ (today): **The stepmother pushes Cinderella around**, to show that the stepmother dominates and hates Cinderella.
- 9–11: The stepmother pushes Cinderella around, to show that she *dominates* Cinderella and hates her.
- 6–8: The red square pushes the green star around, because the square is the boss of the star and hates the star.

Ken's suggested sentence, "The square pushes the star because it is mean", is **not** what the glass box says. In Ken's Introduction, the push was suggested by the stepmother's relationship words, *dominates* and *hates* (establish-task-5's related suggestions, source `dominates` and source `hates`). Her personality words *mean* and *evil* suggested a different step: chasing and hitting (establish-task-3, source `mean` and source `evil`). So the templates produce "The red square chases the green star, because the square is mean and evil" for the chase, and never "pushes … because it is mean". This is the principle at work: a template fills its "because" only with the words that Ani's record names as the source.

**Speech.** *Read aloud* uses the browser's own speechSynthesis. It works offline with the computer's local voices. It reads each caption as the film plays (at 6–8 the film waits for the voice) and reads any "why" on request. *Talk to Ani* uses the browser's speech recognition. In Chrome that sends the audio to Google (in Edge to Microsoft, in Safari to Apple), so it stays off until a grown-up turns it on, with that fact on the switch's label. It fills the text boxes (a new story, "Tell Ani what's wrong", reasons in Teach Ani) and, at 6–8, a few spoken commands ("play", "stop", "why"). It never sends anything by itself. Where recognition is missing (Firefox, the claude.ai copy, offline), the microphone buttons are not shown, and the page points to the computer's own dictation.

**Where it is kept.** The setting is remembered per browser. A teacher sets it for a class with a link: `index.html#ages-6-8` (or `#ages-9-11`, `#ages-12`), a bare token in the page's dot-separated hash form, which also combines with a moment (`#kept-apart.48.ages-6-8`). A link can set the age, but it cannot turn on Talk to Ani.

**Effort.** About 19 working days in eight stages (below). The first stage is a refactor, byte-identical at 12+, that separates the page's explanation code into *facts* (read from the glass box) and *renderers* (one per setting). Everything else builds on that. The checks run each setting's sentences against the glass box with no model calls.

## The design

### 1. What Ken asked, and the rules that follow

- "A toggle to make Ani's interface and explanation more appropriate for young children (along with a speech interface)."
- Three settings: ages 6–8, ages 9–11, and 12+ (today's page).
- Cloud speech recognition is acceptable if it is opt-in and labeled.
- "Let's keep the editor as it is for now." "Change the story" is the same at every setting (§4).
- Ken's glass-box rules for children's pages (his review of 2026, kept in the project's notes): a simple default view with details on click; no unexplained parts; short intros; plain language; challenges that stay hard.

From these, four rules for the build:

1. **Presentation only.** The setting is never sent to the worker, never stored in a film, a film file, "Your films", a criticism record or a notebook. A film made at 6–8 is the same film, byte for byte, as one made at 12+ (§14; checked, §Tests G).
2. **Templates, not paraphrase.** Every sentence at every level is a template filled from a *fact*, and a fact is read from the glass box by the code that today writes the 12+ sentence. No sentence is made by shortening another sentence, and no language model writes or rewrites an explanation.
3. **Nothing hidden that isn't reachable.** Each simple box ends with "More", which opens the next level's text for the same fact. The 12+ text, the Lisp and the citations are always there, one or two clicks further on.
4. **An honest gap beats a guess.** Where a fact has no simple template, the simple view says so ("Ani did something here that this page can't say simply yet. Tap More.") and shows the next level's sentence. The checks count these gaps, and Ken's film has none (§7.12).

### 2. What the page says today (read from the code)

The explanations are built in app/film.template.html by functions that read the glass box and return HTML. These are the ones the setting has to cover:

| What | Function today | Where it shows |
|---|---|---|
| Caption at a frame | `captionAt` (with `methodText`, `taskText`, `about`, `purpose`) | under the screen, and in video subtitles |
| "Why" chain | `chainOfTask` | a character's panel, "Why" |
| Why this way | `wayWhy` (with `rejectText`, `wayQ`) inside `actWhyBox` | the character's panel |
| Why so long | `longWords`, `plannedWords`, `stopWords`, `endedWords`; step by step in `timingSteps` | the character's panel; "How Ani timed it" |
| A part of only changes | `onlyChangesWhy` | the character's panel |
| No one moves | `stillWhy` in `stillBox` | the side panel at a still moment |
| Where Ani stopped | `whyStopped` | the caption, and "Where Ani stopped" |
| A character's looks | `lookSentence`, `reasonClause`, `colorName` | "How she looks" |
| What Ani was told | the story panel (`traitsOf`, `relationshipText`, `VERB`, `FEEL`) | the side panel's default |
| Criticism | app/film/criticism.js (`critButton`, `critWords`, the "couldn't" texts), app/film/critique.js ("Tell Ani what's wrong") | "Why this way", "Why so long", "Your criticism" |
| Teach Ani | app/film/teach.js (`pieceWords`, `legitimacyQuestion`, the "yours" badge) | the Teach Ani panel and badges |

Each function both *reads* the record and *says* it. For example, `wayWhy` reads `scores` and `rejected-suggestions` from the task actor, picks the chosen and the best other, compares six kinds of score, and writes a sentence with Ken's line citation. The setting needs the reading done once and the saying done three ways. So stage A0 (§Stages) splits each function into:

- a **fact reader**, `wayFacts(t, method)`, which returns `{ weighed: 2, chosen, other, betterOn: [{kind: "strength", mine: 50, theirs: 40}], setAside: [{way, reason: {kind: "too-much-time", seconds: -8.79, accepts: -6.975}}] }`; and
- **renderers**, `say12(facts)` (today's text, unchanged), `say911(facts)` and `say68(facts)`. Each returns `{ html, say, uses }`: the HTML; a plain `say` string for speech (no markup, no abbreviations, no frame numbers); and `uses`, the list of fact slots the sentence mentions, for the checks.

The existing plain-English mechanism stays. `para(text, original)` marks a reading as the revival's, with Ani's own words in its tooltip (the footer's "dotted underline"). The simple renderers use it the same way, and the glossary (§6.3) is built on it.

### 3. The setting: where it is, how it is kept, how a teacher sets it

**The control.** A three-way segmented control in the header, beside the guides' links: **Ages: 6–8 · 9–11 · 12+**, with `aria-pressed` like the page's other segments (`.seg`). At 6–8 the header's long intro is replaced by one line ("Ani is a computer program from 1978. It made this film from a story. Press Play, then tap a shape to ask why."), and the control moves into a small **For grown-ups** drawer (a `<details>` at the top right) with the speech settings, so that a child doesn't switch it by accident.

**The default.** 12+, with no prompt on first visit, so today's visitors and every existing link see exactly what they see now.

**Where it is kept.** In the browser, through the page's existing `store` wrapper (every read and write in try/catch), under `ani-cinderella:age:v1`, beside the page's other keys (`ani-cinderella:story-settings:v1` and so on). Speech settings go under `ani-cinderella:speech:v1` (§8, §9). Both are added to "What this page keeps in your browser" in plain words: "Your age setting (6–8, 9–11 or 12+), and your reading-aloud and talking settings. Nothing about you is kept: no voice, no recordings."

**A link for a class.** The page's hash today is a set of bare tokens joined by dots: a scene id, then a frame, a character and `color` or `tv` (`fromHash`), or the single token `#view` (app/film/view.js). The age follows the same form, with no `=`:
- `index.html#ages-6-8`, `#ages-9-11`, `#ages-12`;
- combined with a moment: `#kept-apart.48.cinderella.ages-6-8`.

`fromHash` reads any part that matches `ages-…` before it looks for a scene. It applies the setting, remembers it (a class computer should stay set; this is harmless), and shows a one-time note: "This link set the page for ages 6–8. A grown-up can change it at the top." It leaves the hash as it was, so a bookmark keeps working. view.js's restore (`#view`, reload, back and forward) reads the remembered setting before it draws, so that a restored panel opens at the right level.

**What a link cannot do.** It cannot turn on Talk to Ani or Read aloud's voice choice. Consent to send audio to a company is given on each computer, by a person (§9). That is open question 7.

### 4. What each setting shows and hides

| Part of the page | 12+ (today) | 9–11 | 6–8 |
|---|---|---|---|
| Header intro | as today | as today, one sentence shorter | one line; guides link to the right guide (§12) |
| Run bar (1978 film, Your version, Side by side) | as today | as today | "Ken's film" and "My film" only; Side by side under More |
| Play, ◂ ▸ | as today | as today | Play 56 px tall; ◂ ▸ 48 px; labels "Back" and "Next" under the arrows |
| Frame label, frames a second, TV or Color, Save, bands key | shown | frames a second and TV under a "Film settings" disclosure; frame label shows seconds | hidden (Color on; 24 a second where the film has it, else 4; Save in For grown-ups) |
| Scene buttons | titles | titles | titles, 48 px tall, with "Scene 1" etc. read aloud on focus |
| Caption | full | one sentence plus "meanwhile" lines | one or two short sentences (§7.2); the "part 1 of 4" tag hidden |
| Legend | names | names with shapes | big tappable chips, "green star · Cinderella"; tapping a chip opens that character (a keyboard and screen-reader route to the panel, which the canvas lacks) |
| Story panel ("What Ani was told") | full, "Show it as Ani read it" | short lines with glossary; the Lisp under More | three or four sentences per character (§7.1); the Lisp under More, then More again |
| A character's panel | what, Why (open), the repairs (open when 4 or fewer), knowledge, How Ani chose this, the plan, looks, moves, where she started, records | what; Why this way and Why so long; Who decided (closed); everything else under "More about Ani's choices" (closed) | one big sentence; buttons **Why?** and **How long?**; then **More** (the 9–11 view of the same panel) |
| Repairs and knowledge sections | open when 4 or fewer | closed, one summary line ("The revival fixed 2 things here.") | hidden behind More |
| Code citations (`chomet.123:216-255`), Lisp, "What Lisp said" | inline | in the closed details only | in the 12+ view only |
| Change the story (the editor) | as today | **as today** (Ken: keep the editor as it is) | **as today**: the same button opens the same editor; a note above it at 6–8: "This part is for grown-ups or older children." |
| Tell Ani a new story | as today | as today, settings folded (§10) | a shorter flow (§10) |
| Criticism buttons | all kinds | all kinds, plain labels | "Make it last longer", "Make it shorter", "Try another way" (§11) |
| Tell Ani what's wrong (language model) | as today | as today, with a microphone | not shown (open question 4) |
| Teach Ani | header button, all kinds | kinds 1 and 2 first, the rest under "More kinds" | "Teach Ani a new word" (kind 1) under More (§11) |
| Which extensions, "Which Ani" | shown | under Film settings | hidden (with the revival's extensions, the page's default for new stories) |
| Footer | as today | as today | the first paragraph only; the rest under "About this page" |

**Type and target sizes.** 12+ is unchanged. At 9–11 the side panel's text goes from about 0.9rem to 1rem, and the `.note` text and `.linkish` buttons to at least 0.95rem. At 6–8 the base size is 1.15rem, the caption 1.35rem and the panel's lead sentence 1.4rem, with line height 1.5. Every control is at least 44 by 44 px (WCAG 2.5.5); the main ones are 48 to 56 px. The settings are CSS classes on `<html>` (`age-6-8`, `age-9-11`), so most of the hiding and sizing is in the stylesheet. Hidden parts use `hidden` or `display: none`, not just visual hiding, so that a screen reader doesn't read them.

### 5. Naming the characters

**At 12+ and 9–11**, characters keep their names as today (`who`, `meet`, the cast line's names), with the shape icon beside the panel heading.

**At 6–8**, a character is named by what the child sees on the screen: **"the" + color + shape**.
- Ken's 1978 film: Cinderella is *the green star*, the stepmother *the red square*, the Prince *the yellow triangle*, the fairy godmother *the orange circle* (`CHARS` film colors #5be06f, #ff4b3e, #ffd84a, #ff9a2e).
- A new story without Ani's looks: the shape `shapesOf` gives it and that shape's 1978 color (pentagon blue, hexagon purple, and so on).
- A film made with Ani's looks (APPEAR, COLORS): the shape Ani drew (`run.shapes`, `lookOf`) and the hue of its color *as at the character's first appearance in the scene* (`colorShort` without its adjectives: "red", not "a dull red"), in American spelling ("gray", where the page's hue list says "grey").
- Shape words for 6–8: circle, square, triangle, star, "five-sided shape" (pentagon), "six-sided shape" (hexagon), "eight-sided shape" (octagon), "star with eight points", "star with ten points".
- **TV (black and white).** At 6–8 the page shows the film in color. If a grown-up switches to TV, names drop the color ("the square").
- **Two the same.** If two characters would get the same name, the first of size, then the name, tells them apart ("the big circle", "the small circle"; failing that, "the circle (the tortoise)").
- **A change of look.** A color that dims or brightens doesn't rename anyone. A change of shape (ALTER's "turns into a circle") is said once ("the square turns into a circle"), and from then on in that scene the character is "the circle (it was the square)".
- **Pronouns.** A shape is "it". When a sentence has two characters, the template repeats the noun ("the square is the boss of the star and hates the star") rather than risk an unclear "it". Ani is "it" too.
- **Names are one tap away.** The legend chips and the panel heading show both ("The red square · the stepmother"), and so do the glossary popovers on a name.

Why shapes at 6–8: the film itself is only shapes, and a young child following "the red square" doesn't have to hold a mapping in mind. It is also what Ani's 1978 audience saw. Open question 2 asks Ken whether he would rather use names.

### 6. Vocabulary

#### 6.1 The word list for 6–8

A 6–8 sentence uses only:
1. **The Dolch sight words** (the 220 "service words" and 95 nouns, public domain), the usual first reading list in American schools.
2. **The page's own words**, listed here and kept in app/film/ages.js as `WORDS_6_8`. Each was chosen because the film can't be talked about without it, and each is a word a child of six meets in picture books:
   - *the page and the film:* Ani, film, story, scene, part, screen, shape, star, square, triangle, circle, sided, points, seconds, times, minute, again, way, ways, idea, ideas, knows, decided, chose, shows, show, tap, play, stop, more
   - *colors and looks:* red, orange, yellow, green, blue, purple, gray, pink, white, black, color, bright, dark, big, small, smooth, spiky, simple, curvy, straight, zigzag, bouncy
   - *moving:* move, moves, fast, slow, slower, faster, quick, still, wander, chase, push, pushes, hit, hits, help, helps, follow, meet, guard, go, goes, along, together, apart, away, towards, near, far, behind, ahead, across, leave, turn, bump, busy
   - *people and feelings:* boss, friend, enemy, happy, unhappy, sad, proud, ashamed, scared, angry, lonely, eager, kind, mean, good, bad, evil, nice, friendly, shy, strong, weak, pretty, ugly, lazy, rude, polite, thankful, loves, hates, likes, wants
3. **Inflections** of listed words (-s, -es, -ed, -ing, -er, -est, -ly), checked by a small stemmer.
4. **Names, numbers and scene titles**, which are allowed as tokens.
5. **Ani's own words where the record uses them, always glossed** (§6.2). A glossed word is allowed because it carries its gloss.

The list is short on purpose. The check (§Tests C) fails a 6–8 sentence that uses any other word. The word list and the glossary should be read by a primary teacher before the stage ships (open question 12).

#### 6.2 Ani's own words at 6–8 and 9–11

Ani's words are the facts. A simple sentence never swaps one for a different fact. At 6–8 a hard word is shown as a plain **gloss** that means the same, marked as the revival's reading, with Ani's word one tap away. At 9–11 Ani's word is kept and glossed in a popover. The table covers Ken's Cinderella and the words Ani knows today (DSCRP, RELATE, KNOW's and APPEAR's additions). Words not in it fall back to Ani's word with a popover at both levels, and the check lists them for the table to be filled in.

| Ani's word | 6–8 shows | 9–11 popover says |
|---|---|---|
| dominates | is the boss of | dominates: is in charge of someone, and makes them do things. Ken's word in the story. |
| is-obedient-to | does what … says | is obedient to: does what someone tells them to do. |
| is-tolerant-of | puts up with | is tolerant of: puts up with someone, even when they are unkind. |
| is-polite-to | is polite to | is polite to: is careful to be nice to someone. |
| is-impolite-to | is rude to | is impolite to: is rude to someone. |
| is-grateful-to | is thankful to | is grateful to: is thankful for what someone did. |
| is-protective-of | keeps … safe | is protective of: looks after someone and keeps them safe. |
| is-generous-towards | gives a lot to | is generous towards: gives a lot to someone, and is glad to. |
| is-helpful-towards | helps | is helpful towards: helps someone. |
| hard-working | works hard | hard-working: does a lot of work, and does it well. |
| shabby | wears old clothes ("shabby") | shabby: worn out and old, like clothes that have been worn a lot. |
| selfish | thinks only of itself | selfish: thinks only about what it wants. |
| stubborn | won't change its mind | stubborn: won't change its mind. |
| determined | keeps trying | determined: keeps trying until it gets what it wants. |
| brazen | bold, not shy at all | brazen: bold, and not at all shy (Ani's opposite of "shy"). |
| magical | magic | magical: can do magic. |
| graceful | moves smoothly | graceful: moves smoothly and beautifully. Ani took it from "beautiful". |
| getting-it-on | get together | “getting it on”: Ken's 1978 phrase for two people falling for each other and being happy together. |
| accompanys | go along together | accompanies: goes along with someone. |
| prevents (meets …) | stops … from meeting … | prevents: stops something from happening. |
| undoes (…) | makes it so … after all | undoes: makes what happened before not count any more. |
| aware | finds out | becomes aware: finds out. |
| *the elements of moving:* speed, activity, rhythm, curvature, jaggedness, path length, acceleration, deliberateness, repetitiveness, turning speed | how fast, how busy, how bouncy, how curvy, how zigzag, how long its swoops are, how fast it speeds up, how careful, how much it does the same thing again, how fast it spins | each as in the 12+ `ELEMENTS` names, with one sentence: "speed: how fast a character moves". |
| *the looks:* size, shape jaggedness, shape complexity, color intensity, color saturation, hue | how big, how spiky, how simple, how bright, how strong its color is, its color | as `ELEMENTS`, one sentence each. |
| pass 1, pass 2, choice point, Director, extension, repair | (not used at 6–8) | the students' guide's "Words to know" entries, shortened to one sentence. |

Feelings use the page's `FEEL` words, which are already plain: happy, unhappy, proud, ashamed, eager, reluctant ("doesn't want to", at 6–8), lonely, afraid ("scared", at 6–8), angry. The degrees are "a little", (nothing) and "very", as `DEGREE` has them.

#### 6.3 The glossary popover

A glossed word is a small button with a dotted underline (the footer's existing sign for "our reading"). Clicking it, tapping it or pressing Enter on it opens a popover anchored to it (a disclosure: `aria-expanded`, with the popover's text tied to the button by `aria-describedby`), because a `title` tooltip does nothing on a tablet or for a keyboard. Escape or tapping elsewhere closes it. The popover has three short lines:
- **the meaning**, in the 6–8 or 9–11 words above;
- **Ani's word**, quoted: "Ani's word: “dominates”";
- **where it came from**, if the record says: "Ken's word in the story" (a word from the initial description), "a word Ani took from “beautiful”" (source `beautiful`, as for graceful), or "your word" (a Teach Ani piece, with the yours badge).

With Read aloud on, the popover has a speaker button. Its text is static, written by us and reviewed by Ken, and it is checked against the word list like any 6–8 sentence. It says what a word means, never what Ani does with it: that comes only from the record.

### 7. The sentence templates

Notation: `{A}`, `{B}`, `{C}` are characters as §5 names them at that level. `{way}` is a way of showing, from the lexicon in §7.2. `{src}` is the list of source words that Ani's record gives for the chosen method. `{n}` is a number rounded for the level (§7.5). Every template is filled only from a fact. The 12+ column is today's text.

#### 7.1 What Ani was told (the story panel)

| | 9–11 | 6–8 |
|---|---|---|
| A character | "{A} is {personality words, glossed}. {Pronoun} is {physical words}." | "{A} is {first three personality words, glossed}." then "It is {physical words}." "More" shows the rest. |
| A relationship | "{A} {how, glossed} {B}." | "{A} {gloss of how} {B}." |
| A scene | "Scene {n}, {title}: Ani must show {each task, in about()'s words}." | "Scene {n}, {title}: Ani must show {first two tasks, simple}." |

Cinderella, 6–8:
- The green star is good, friendly, works hard and is shy. It is beautiful, and it wears old clothes ("shabby").
- The red square is evil, strong, selfish and mean. It is ugly.
- The red square is the boss of the green star, and hates the star. The green star does what the square says, and puts up with the square.
- Scene 1, The Introduction: Ani must show what the star and the square are like, and how they feel about each other.

The Tortoise and the Hare (from the 13 October trial: the tortoise is hard-working and determined; the hare is mean, brazen and lazy; the hare dominates and is impolite to the tortoise; the tortoise is tolerant of the hare), 6–8. In that trial, with Ani's looks, the tortoise was a circle and the hare an eight-pointed star. Their colors depend on the run, so they are left out here:
- The circle works hard and keeps trying.
- The star with eight points is mean, bold and lazy.
- The star with eight points is the boss of the circle, and is rude to the circle. The circle puts up with the star.

9–11, the same story: "The hare is mean, *brazen* and lazy. The hare *dominates* the tortoise and is *impolite to* the tortoise. The tortoise *is tolerant of* the hare." (Italics are glossed words.)

#### 7.2 Captions

**What a caption is made of** (`captionAt`): the part; for each task in the part with a chosen way, the way (`methodText`) and what it is for (the top of its chain, `purpose`, through `taskText`); the "meanwhile" changes of feeling; look changes; wanderers.

**The way lexicon** (the simple forms of `methodText`'s cases; each keeps the meaning of Ken's or the revival's way):

| Way | 9–11 | 6–8 |
|---|---|---|
| pushes-around | {A} pushes {B} around | {A} pushes {B} around |
| chases-to (offstage) | {A} chases {B} (off the stage) | {A} chases {B} (off the screen) |
| goes-to-and-hits | {A} goes to {B} and hits {B} | {A} goes to {B} and hits {B} |
| goes-to-and-accompanys | {A} goes to {B}, and they go along together | the same |
| move-small-part-towards | {A} moves a little way towards {B} | {A} moves a little way towards {B} |
| stands-guard | {A} stands guard, keeping {B} away from {C} | {A} stands in the way, and keeps {B} away from {C} |
| exit-by | {A} leaves the stage | {A} goes off the screen |
| alternately-turn | {A} and {B} turn towards each other and away, in turn | {A} and {B} turn to each other, then away, again and again |
| move-to-each-other, move-to | {A} goes to {B} | {A} goes to {B} |
| repeatedly-come-in-contact | {A} and {B} come together and part, again and again | {A} and {B} bump together and apart, again and again |
| move-near-and-turn | {A} moves near {B} and {C} and turns to look at each | {A} comes near {B} and {C}, and looks at each |
| wander-around, changes-while-wandering | {A} wanders about | {A} wanders around |
| helps-along (KNOW) | {A} helps {B} along | {A} helps {B} along from behind |
| moves-away-from (KNOW) | {A} runs off when {B} comes near | the same |
| follows-behind (KNOW) | {A} follows {B} | {A} follows {B} |
| goes-to-and-transforms (CHANGE) | {A} goes to {B} and transforms {B} | {A} goes to {B} and changes {B} |
| kills | {A} kills {B} | {A} kills {B} (open question 6) |
| any other | today's text, in the More view | "Ani did something here that this page can't say simply yet." |

**The purpose, and the "because".** Today's caption ends "…, to show that {about(top task)}". The simple captions turn that into a *because* only when the record names the source:

1. **Personality task** (`establish (personality X)`), shown by a convey method: the `related-suggestions` items on the establish task name the words whose suggestion it was (`source mean`, `source evil`). The caption is "{way}, because {A} is {src}". If no item names the chosen method, it is "{way}, to show what {A} is like".
2. **Relationship task**: the items name the relationship words (`source dominates`, `source hates`). The caption is "{way}, because {A} {src glossed} {B}".
3. **Emotional state**: "…, because {A} is {feeling}".
4. **A convey task straight from the description** (wants, prevents, undoes, meets, alone, getting-it-on, aware): no "because". The caption is "{way}. That shows {about, simple}."

At 9–11 the form stays "to show that…", which is Ani's own purpose, and "because" is used only for rule 1 ("…, to show what she is like: mean and evil").

**Meanwhile lines.** 9–11: "Meanwhile Ani changes how {A} moves, to show that {A} is {feeling}." 6–8: "{A} moves differently now, to show it is {feeling}." This shows only when there is no main step, or as a second line when there is room (a caption is at most two sentences at 6–8). Look changes: "{A}'s colors get brighter/darker", "{A} gets bigger/smaller". Wanderers (SEEN, MEND9): "{A} wanders around, so you can see it change."

**Worked examples, Ken's Cinderella:**

| Moment (record) | 12+ (today) | 9–11 | 6–8 |
|---|---|---|---|
| Introduction, convey-task-8, pushes-around, from establish-task-5 (dominates, hates) | **The stepmother pushes Cinderella around**, to show that the stepmother dominates and hates Cinderella. | The stepmother pushes Cinderella around, to show that she *dominates* Cinderella and hates her. | The red square pushes the green star around, because the square is the boss of the star and hates the star. |
| Introduction, convey-task-9, chases-to, from establish-task-3 (sources mean, evil) | **The stepmother chases Cinderella**, to show what the stepmother is like (evil, strong, selfish, mean). | The stepmother chases Cinderella, to show what she is like: mean and evil. | The red square chases the green star, because the square is mean and evil. |
| Introduction, convey-task-11, helps, from establish-task-1 (source friendly) | (today's) | Cinderella helps the Prince, to show what she is like: friendly. | The green star helps the yellow triangle, because the star is friendly. |
| Kept Apart, convey-task-2, stands-guard, from the description (prevents) | **The stepmother stands guard, keeping Cinderella away from the Prince**, to convey that the stepmother prevents Cinderella from meeting the Prince. | The stepmother stands guard, keeping Cinderella away from the Prince, to show that she *prevents* Cinderella from meeting him. | The red square stands in the way, and keeps the green star away from the yellow triangle. That shows the square stops the star from meeting the triangle. |
| Kept Apart, establish-task-7 (Cinderella's joy, negative high) | Meanwhile Ani changes how they move, to show that Cinderella is very unhappy. | Meanwhile Ani changes how Cinderella moves, to show that she is very unhappy. | The green star moves differently now, to show it is very unhappy. |
| The Meeting, convey-task-5, alternately-turn, from the description (getting-it-on) | **Cinderella and the Prince turn towards each other and away, in turn**, to convey that Cinderella and the Prince are “getting it on”. | Cinderella and the Prince turn towards each other and away, in turn, to show that they are *“getting it on”*. | The green star and the yellow triangle turn to each other, then away, again and again. That shows they *get together*. |

The table also shows the correction to Ken's suggested sentence. "The square pushes the star because it is mean" would be false here, and the rule that a "because" comes only from the record's sources makes it impossible.

**Worked examples, the Tortoise and the Hare** (the 13 October trial; shapes from that run's looks):

| Moment (record) | 9–11 | 6–8 |
|---|---|---|
| The Boastful Hare, convey-task-2, pushes-around, from the relationship (dominates, is-impolite-to) | The hare pushes the tortoise around, to show that the hare *dominates* the tortoise and is *impolite to* it. | The star with eight points pushes the circle around, because the star is the boss of the circle and is rude to it. |
| The Boastful Hare, establish-task-4 (the hare's pride, positive high) | Meanwhile Ani changes how the hare moves, to show that the hare is very proud. | The star with eight points moves differently now, to show it is very proud. |
| The Boastful Hare, establish-task-1, status cant-do | Ani found no way to show what the tortoise is like (hard-working, *determined*). | Ani didn't know a way to show that the circle works hard and keeps trying. |
| Pride and Shame, the hare's wander-around (MEND9 repair) | The hare wanders about, so that its change of feeling is seen (the revival's repair). | The star with eight points wanders around, so you can see it change. |

The *cant-do* row matters for children: Ani says plainly what it couldn't do, and Teach Ani is the way to add it.

#### 7.3 Who decided ("Why")

Today, "Why" is a chain from the step up to the description: "To convey that the stepmother chases Cinderella, → To establish what the stepmother is like (evil, strong, selfish, mean) — as the film description asks." At the simple levels the same chain is said as a three-step ladder:

- **The story says** {the top task's fact}. This comes from the initial description.
- **Ani knows** {the suggestion that linked the two}. This comes from the related-suggestion item: its element, value and source.
- **So Ani** {the way}.

The 6–8 version of the chase:
- The story says the red square is mean and evil.
- Ani knows that being mean can be shown by chasing.
- So Ani made the square chase the star.

And the push:
- The story says the red square is the boss of the green star, and hates the star.
- Ani knows that pushing someone around can show being the boss.
- So Ani made the square push the star around.

The "Ani knows" line is built from the suggestion itself, `element (establish step-mother mean) value (… chases …) source mean`. When two sources suggest the same way (`relationship identical`), it names the first, with "and" for the other ("being mean, and being evil, can be shown by chasing"). When the item has a `best-when`, 9–11 adds it ("best when the one doing it doesn't like the other"), and 6–8 leaves it to More. When a link in the chain is the revival's knowledge, the line says so: "Ani knows (from the revival's added knowledge)…" at 9–11, and "Ani was taught…" at 6–8, with the yours badge where it is a learner's.

#### 7.4 Why this way

The facts come from `wayWhy`: the number weighed, the chosen way, the best other way, the kinds of score where the chosen one was higher, and the ways set aside with their reasons.

| Fact | 9–11 | 6–8 |
|---|---|---|
| one way only | Ani knew only one way to show this. | Ani knew just one way to show this. |
| weighed n, chosen higher on kinds | Ani thought of {n} ways, and this one scored best, on {kinds}. The other was: {way}. | Ani had {n} ideas. This one fit best. The other idea was: {way}. |
| kind: strength | it was suggested more strongly | (in More) the story's words pointed to it more strongly |
| kind: prerequisite | what it needs was ready | everything it needs was ready |
| kind: best-when | it suits these two best | it suits these two best |
| kind: time-fit | it fit the time better | it fit the time better |
| kind: originality | it hadn't been used yet | Ani hadn't used it yet |
| kind: variety | it made the film more varied | it was different from what came before |
| set aside: too-much-time | Ani set aside {way}: it would end {n} seconds too soon (or too late). | Ani didn't pick {way}: it would be over too fast (or take too long). |
| set aside: no-idea-how-to-convey-method | Ani set aside {way}: it had no way to show it. | (in More only, open question 6) |
| set aside: vetoed by you (CRITIC) | You said no to {way}. | You said no to {way}. |
| set aside: a prerequisite not met (`rejectWords`) | Ani set aside {way}: {reason, simple}. | Ani didn't pick {way}: something it needs wasn't ready. |

Kept Apart, the stepmother standing guard (convey-task-2: one way scored; two set aside: chasing the Prince off the stage, `too-much-time ideal-difference -8.79`, and killing Cinderella, `no-idea-how-to-convey-method`):
- **9–11:** Ani had three ideas. It set aside chasing the Prince off the stage, because that would end almost 9 seconds too soon, and having the stepmother kill Cinderella, because it had no way to show that. Standing guard was left.
- **6–8:** Ani had three ideas. Chasing the yellow triangle away would be over too fast. So the red square stands in the way. *(More: "One more idea Ani set aside.")*

#### 7.5 Why so long

The facts come from `longWords`, `stopWords`, `endedWords` and `plannedWords`: the run's length, what stops it, how it ended, the repeat count, the scene's length setting and its bounds, the time planned and any stretch.

**Numbers.** At 6–8, whole seconds with "about" (or "less than a second"), counts in words up to ten, and no frames, decimals or bounds. At 9–11, seconds to one decimal place, counts in figures, and frames only in the More view. 12+ as today (`sec`, `frameAt`).

| Fact | 9–11 | 6–8 |
|---|---|---|
| lasts | This step lasts {n} seconds. | {way-ing} takes about {n} seconds. |
| repeats | Ken's plan does it {n} times. | It happens {n} times. |
| stops when there / after a hit / after turning | It stops when {pronoun} gets there (after the hit; once {pronoun} has turned). | It stops when {A} gets there (after the hit; when {A} has turned). |
| stops after seconds | It stops after {n} seconds. | It stops after about {n} seconds. |
| stops when another step ends | It stops when "{activity}" ends. | It stops when {activity, simple} is over. |
| scene length | Ken's story asks for a {long/short/medium} scene. | This scene is meant to be {long/short}. |
| stretched | Ani stretched it to fill its part. | Ani made it last longer, to fill the time. |
| held by FIT | The revival keeps each scene within the time the story gives it. | (in More) |

The Introduction's push (convey-task-8; in the APPEAR run's glass box it ran 24.4 s; the goldens will hold each film's own numbers):
- **9–11:** This step lasts 24.4 seconds. Ken's plan does the push 5 times, and Ken's story asks for a long scene.
- **6–8:** Pushing takes about 24 seconds. It happens five times, because this scene is meant to be long.

The "because" here is honest only because both facts are in the record: the plan's `(repeat …)` and the scene's `(set your length to long)`. Where the stretch is what made it long, the template says that instead.

#### 7.6 No one moves

The facts come from `stillWhy`: the kind (repeat-unwinding, only-changes, changes-running, plans-running, none), the seconds, the part, and what ended before.

| Kind | 9–11 | 6–8 |
|---|---|---|
| (the head) | No one moves for {n} seconds. | Nobody moves for about {n} seconds. |
| only-changes | Part {n} is only about feelings ({about}). Ani shows a feeling by changing how a character moves, but here no one has anywhere to go, so the change can't be seen. | Ani is changing how {A} feels. But {A} is standing still, so you can't see it. |
| changes-running | The steps have ended, but the changes of feeling are still running, with nothing to show them. | The moving is over, but Ani is still changing how {A} feels. |
| repeat-unwinding | Ken's 1978 Director takes a moment to finish each repeat, so the part ends a little later. | Ken's old program takes a moment to finish. |
| plans-running | {activity} is still running, but it moves no one. | Something is still going on, but it doesn't move anyone. |
| none | Nothing is left to do until the part ends. | Nothing is left to do until this part ends. |
| (with SEEN available) | With the revival's extensions, the characters wander about so the change is seen. | (in More) |

The Meeting, the end (the students' guide's card 4, kind only-changes: Cinderella and the Prince are very happy):
- **9–11:** No one moves for several seconds. The last part is only about feelings: Cinderella and the Prince are very happy. Ani shows a feeling by changing how a character moves, but here no one has anywhere to go, so the change can't be seen.
- **6–8:** Nobody moves for a while. Ani is changing how the green star and the yellow triangle feel: very happy. But they are standing still, so you can't see it.

#### 7.7 Where Ani stopped

The facts come from `whyStopped`, which already sorts each stop into a case. Each case gets a simple template. Cases without one fall back to "Ani got stuck here", with the 9–11 sentence under More.

| Case | 6–8 |
|---|---|
| WEIGHTIFY (NONE) (gave up on an element) | Ani got stuck. Nothing in the story told Ani {element, simple} for {A}, so it couldn't go on. |
| unknown word | Ani doesn't know the word "{word}", so it got stuck. You can try a word Ani knows, or teach it this one. |
| missing relationship | The story doesn't say how {A} feels about {B}. Ani asked, and got stuck. |
| move-to, wander-around, a KNOW verb (Ani as in 1978) | The 1978 Ani has no way to {verb, simple}. Try it with the revival's fixes. |
| stack overflow (MEND13/15) | Ani went round and round, working out where to put someone, and gave up. |
| a scene before wasn't filmed | This scene starts where the one before ended, and that one wasn't made. |
| a change of someone not in the story | The story changes "{name}", who isn't in the story. |
| other | Ani got stuck here. |

The Tortoise and the Hare's stop in the students' guide (card 9: the hare's activity given up in pass 1), at 6–8: "Ani got stuck. Nothing in the story told Ani how busy the star with eight points should be, so it couldn't go on." The button "Make it again with the revival's extensions" becomes "Try again with the revival's fixes".

#### 7.8 A character's looks

The facts come from `lookSentence` and `reasonClause`: for each aspect, its value and the sources known to have argued for it (words, the character's movement, film levels, comparisons with another character).

- **9–11:** one short sentence per aspect, "Ani made the tortoise big, because it is *physically strong*, and because the film is to be varied."
- **6–8:** one sentence per aspect, **first source only**, choosing in this order: a story word, then the character's movement, then a comparison. Film levels go only in More. "Ani made the circle big, because it is strong." Then "More reasons".

| Source kind | 6–8 clause |
|---|---|
| a word, or an opposite or neighbor of one | because it is {word} (because it is not {opposite}; because it is a bit like {neighbor}) |
| the character's own movement (`dynamics-of`) | because of how {it moves: fast, slowly, smoothly, zigzag} |
| a comparison with another character | because it is {more/less} {aspect} than {B} |
| a film level (variety, flashiness) | (in More) because the film is meant to be {varied, not flashy} |
| combined, no single source | Ani mixed several ideas together. (More) |

Tortoise and Hare (13 October trial):
- *Tortoise:* size high from variety and physically-strong; smoothness from its path's jaggedness; simplicity from its speed. 6–8: "Ani made the circle big, because it is strong. It is smooth, because of how smoothly it moves. It is simple, because of how fast it moves." The third clause names the source, not its value, because the trial's log gives the source `(dynamics-of tortoise speed)` without the speed; the golden will have it.
- *Hare:* jaggedness high from *mean* and from the comparison with the tortoise. 6–8: "Ani made the star with eight points spiky, because it is mean."

Colors at 6–8 use the hue word only ("Ani made it red"). Brightness and color strength are said as "bright" or "dark", with their reasons in More.

#### 7.9 Criticism texts

app/film/criticism.js's texts, at the simple levels (the kinds and their behavior are unchanged):

| Today | 9–11 | 6–8 |
|---|---|---|
| Too quick (the part given half as long again) | Too quick | **Make it last longer** |
| Too slow (a third less time) | Too slow | **Make it shorter** |
| Not this way: another way | Not this way: another way | **Try another way** |
| Show something else | Show something else | (in More) |
| Keep two apart; Start far from | as today, plain labels | (in More) |
| Remake with my criticism | Remake with my criticism | **Make it again** |
| A record line: "{way} too quick, not yet heeded" | You said {way-ing} was too quick. Ani hasn't made it again yet. | You said: make {way-ing} last longer. Press Make it again. |
| Heeded | Ani made it again with that. | Ani did it. |
| Can't (bounded by the story's time) | Ani can't: the story gives this scene at most {n} seconds. | Ani can't: the story says this scene is short. |
| Can't (p. 191: no notion of it) | Ani has no idea of {rhythm, mood…}, so it can't change that. Ken wrote: {P191, in More}. | Ani doesn't know about {rhythm}, so it can't change that. |
| Take it back | Take it back | Undo |

#### 7.10 Teach Ani texts

| Today | 9–11 | 6–8 (kind 1 only, §11) |
|---|---|---|
| The piece, "grumpy is like mean" (`pieceWords`) | You taught Ani: "grumpy" is like "mean". | You taught Ani: grumpy is like mean. |
| The yours badge | yours: {your reason} | You taught Ani this. |
| Ken's legitimacy question (`legitimacyQuestion`) | Is this something everyone knows, that Ani was missing? (Ken's rule: only add obvious information that was lacking.) | Is this something everyone knows? |
| What your knowledge did | Your piece changed the stepmother's speed from high to medium. | The square is slower now, because you said grumpy is like … |
| Refused (Ani's check) | Ani can't use this: {reason, simple}. | Ani can't use this word. Try another. |

The 6–8 line "The square is slower now…" is filled from `knowledgeChanges`' record of the changed choice point, never from the learner's words alone.

#### 7.11 Speech strings

Each renderer also returns `say`: the same sentence without markup or quotation marks, with numbers spoken ("about twenty-four seconds" is left to the voice; "24.4 s" becomes "24.4 seconds"), no frame numbers, and glossed words read as their gloss. Ani's own word is read only from the popover. Names that synthesizers misread can be respelled through one table (`SAY_AS`; "Ani" is open question 8).

#### 7.12 When there is no simple template

When a fact kind has no template at a level (a new way of showing added by a later extension, a new stop case, a source kind not yet in §7.8), the simple renderer returns `{ gap: true }`. The page then shows "Ani did something here that this page can't say simply yet", with the next level's sentence under More. Gaps are counted by the check, listed in its report, and must be zero for Ken's film at both rates and for the beautified scene.

### 8. Speech output (Read aloud)

**What it uses.** The browser's `speechSynthesis`, which is in every current browser (Chrome, Edge, Safari, Firefox) and in the claude.ai copy. No service of ours, no key, nothing sent by the page. Voices marked `localService: true` work offline. Chrome's "Google …" voices are network voices: they need the internet, and they cut off long utterances. So the page speaks one sentence per utterance, and when `navigator.onLine` is false it picks a local voice.

**The switch.** A speaker toggle, **Read aloud**, beside Play (48 px at 6–8), with `aria-pressed`. On by default at 6–8 (open question 3), off at 9–11 and 12+. Browsers allow speech only after a user gesture, so at 6–8 the first Play press also starts it.

**Reading captions as the film plays.**
- The page speaks when a caption's *main sentence changes* (a new part, a new step), not every frame. It speaks the main sentence and, at 6–8, the "because" or "That shows" sentence. A scene starts with its title: "Scene two: Kept Apart."
- **At 6–8, "Wait for the voice"** (the default there): when the next caption arrives while the last is still being spoken, the film pauses until the voice finishes (the utterance's `end` event, with a 15-second safety timeout), then plays on. The picture never runs ahead of what is said. This is the read-aloud picture-book rhythm.
- **At 9–11 and 12+, "Keep going"** (the default there): a new caption cancels an unfinished one and the newest is spoken. The film never waits.
- Either mode can be chosen in the speech settings.
- **Pause** cancels speech (`speechSynthesis.cancel()`; its pause and resume are unreliable in Chrome). **Play** speaks the current caption again at 6–8 and goes on silently at 9–11.
- **Scrubbing** cancels speech, and the caption at the place where scrubbing stops is spoken after 400 ms of stillness. **◂ ▸** speak only when the caption changes.
- **Side by side**: only the screen the child last tapped is read, with its tag ("Ken's film:").
- **While Ani is making a film**, nothing is read automatically except "Your film is ready" when it is.

**Reading the "why" on request.** Each simple box (Why?, How long?, No one moves, Where Ani stopped, looks, the story panel's lines, a glossary popover) has a small speaker button, "Read this". At 6–8 with Read aloud on, tapping a character reads its lead sentence at once. Lisp and the 12+ citations are never read.

**Voice and rate.** In the speech settings (For grown-ups at 6–8):
- a voice menu from `getVoices()` (waiting for `voiceschanged`), filtered to the page's language (en-US first, then other English), with "works offline" beside local voices, and a **Try** button;
- rate 0.6 to 1.4, defaulting to 0.85 at 6–8 and 1.0 otherwise; pitch left at 1.

These are kept in `ani-cinderella:speech:v1`. A remembered voice that disappears (another computer) falls back quietly to the first local English voice.

**Following along.** Where the voice gives word boundaries (`boundary` events, with most local voices), the caption underlines the word being spoken. This helps early readers, and where boundaries aren't given nothing is underlined. Under `prefers-reduced-motion`, the underline jumps without animation.

**Screen readers.** The captions are `aria-live="polite"` today. With Read aloud on, they become `aria-live="off"`, so that a screen-reader user doesn't hear each caption twice. The speech settings say: "If you use a screen reader, you may prefer Read aloud off." The caption's DOM is updated only when its text changes (today it is rewritten every frame), which keeps live-region announcements down at 24 a second.

### 9. Speech input (Talk to Ani)

**What it uses.** The Web Speech API's recognition (`SpeechRecognition` or `webkitSpeechRecognition`). In Chrome this sends the audio to Google's servers, in Edge to Microsoft's, and in Safari to Apple's. Firefox doesn't have it. Where the browser offers on-device recognition (Chrome's `processLocally` option, with `SpeechRecognition.available()` and `install()`), the page prefers it and says "stays on this computer". That has to be confirmed in the Chrome versions classrooms use when stage A5 is built.

**Opt-in, with a plain label.** Off until turned on in the speech settings (in For grown-ups at 6–8):

> **Talk to Ani with your voice.** When you press the microphone, your browser sends what you say to the company that makes it (Google for Chrome, Microsoft for Edge, Apple for Safari) to turn it into words. The page keeps only the words, in the box, and no recording. Nothing is sent until the microphone is pressed.

- The switch is remembered per browser (`ani-cinderella:speech:v1`, with the date it was turned on) and can be turned off at any time.
- A link can't turn it on (§3). The browser's own microphone permission is asked the first time, as usual.
- When recognition runs on the device, the label says so instead: "Talk to Ani with your voice. This browser turns it into words on this computer; nothing is sent."

**How a microphone button works.**
- A microphone button sits beside a text box. Press it once to start ("Listening…", with a static, not pulsing, red dot), and once to stop. Recognition also stops by itself after a pause (`continuous = false`).
- Words in progress (`interimResults`) appear in gray at the cursor, and the final words are put into the box. **Nothing is ever sent or made by speech alone.** The child or the grown-up presses the box's own button.
- Errors in plain words: "The microphone is blocked. A grown-up can allow it in the browser's settings." (`not-allowed`); "Talking needs the internet in this browser." (`network`); "Ani didn't hear anything. Try again, a bit closer." (`no-speech`).

**Where it is used.**
1. **Telling a story** (Tell Ani a new story's box), at all settings.
2. **"Tell Ani what's wrong"** (critique.js's box), at 9–11 and 12+.
3. **Answering**: the reason box in Teach Ani ("Why do you think so?") and its legitimacy question, and the simple panels' prompts at 6–8 and 9–11 ("What do you think the square will do next?"). The answer is kept on the page only. Like a typed answer, it goes nowhere else.
4. **Spoken commands at 6–8** (a microphone on the controls): "play", "stop" or "pause", "why", "next scene", "go back", "read it again". These are matched on the final words by a fixed list on the page, not by a language model, and anything else is ignored with "Ani heard: '…'. Try 'play' or 'why'." The audio still goes through the recognizer, so the opt-in applies.

**When it isn't there.** Feature detection decides, not the browser's name. Recognition is treated as missing in Firefox; in the claude.ai copy, whose sandboxed frame has no microphone (and which teachers.html already keeps for adults); and offline when recognition needs a server. Then:
- no microphone buttons are shown;
- the speech settings say: "This browser can't turn speech into words. You can type, or use the computer's own dictation: on Windows press Windows+H; on a Mac press the Fn key twice; on an iPad, use the microphone on the keyboard."

The computer's own dictation types into any box on the page, so speaking a story still works on most computers and tablets.

### 10. Tell Ani a new story, by setting

**12+.** As today.

**9–11.** As today, except that "The model writes" (JSON or Ken's Lisp) and "Which Ani" are folded under **More settings** (JSON and the revival's extensions stay the defaults). The story box has a microphone. The examples stay.

**6–8: a shorter flow, made for a grown-up and child together.**
1. **"Tell Ani your story"**: a big box with a microphone, and three short starters as buttons (in kid words: "A boastful hare laughs at a slow tortoise…", "A mean wolf blocks the way…", "Belle is kind…"), from `EXAMPLE_STORIES`.
2. **For grown-ups: which language model**: the provider panel, closed. It opens on the provider last used in this browser. If none has been used, it opens on **Gemini Nano** when it is ready, which is free and keeps everything on the computer (the teachers' guide already recommends it for children's workshops).
3. **"Make my film"**: one button. It writes the description (as JSON, with the revival's extensions) and, if the page's check finds no problems, goes straight on to making the film. The description is then shown under "What Ani was told", as for any film. If the check finds problems, it says so simply ("Ani doesn't know the word 'grumpy'. Try a word Ani knows: mean, evil, selfish…", with the words as buttons from Ani's vocabulary), and offers "Ask {model} to fix it" as today.
4. **What is sent** is said once, to the grown-up, whenever the provider is not Nano: "Your story will be sent to {Anthropic / OpenAI / Google}."

**Classrooms.** The teachers' guide's advice stays: Nano for children's workshops, or a teacher's key on the teacher's computer on the projector. The claude.ai copy is not for children (claude.ai accounts are for adults), and at 6–8 the claude.ai copy hides "Tell Ani a new story" unless Nano is ready (open question 5).

### 11. Criticism and Teach Ani, by setting

**Criticism.**
- *12+:* as today.
- *9–11:* the same kinds and buttons, with the texts in §7.9. "Your criticism" is shown as a short list. Ken's p. 191 quotation moves under "Why Ani can't".
- *6–8:* in the Why? and How long? boxes, three buttons only: **Make it last longer**, **Make it shorter**, **Try another way**. They map to today's too-quick, too-slow and veto records, with nothing new. "Your criticism" is a short list with **Undo**, and **Make it again** remakes. "Show something else", "Keep two apart" and "Start far from" are in the More view. "Tell Ani what's wrong" (a language model reading a child's words) is not offered at 6–8 (open question 4).

**Teach Ani.**
- *12+:* as today.
- *9–11:* the panel opens on kinds 1 and 2 (a word like another; what a word suggests), with kinds 3 to 5 under "More kinds". It uses the §7.10 texts and has a microphone on the reason box.
- *6–8:* the header button is hidden. In the More view of a character, and at a *cant-do* or an unknown-word stop, the offer **Teach Ani a new word** opens kind 1 only, as one sentence with two menus: "[new word] is like / is the opposite of [one of Ani's words]". The reason box is optional and has a microphone. The legitimacy question is asked in its 6–8 form. Making a film with the knowledge is the same "Make it with my knowledge".

**The editor ("Change the story")** is unchanged at every setting, as Ken asked. At 6–8 its button is still shown, with the one-line note in §4.

### 12. The guides

- **The setting links to the right guide.** At 6–8 the header's guide links become one link, "For grown-ups: using Ani with young children", to a new section of teachers.html, `#young`. At 9–11 they become "A guide for students", pointing at students.html's "Start here" cards. At 12+ they stay as today.
- **teachers.html.** The ages table gets a row for **6 to 8** ("With an adult, at ages 6–8. Watch, tap a shape, ask why, with Read aloud. Make it last longer or shorter. A new story told aloud, with Gemini Nano.") and its 10-to-12 row changes to point at the 9–11 setting. The new section `#young` covers the setting, its link (`index.html#ages-6-8`), Read aloud and Talk to Ani with the consent text, and five short activities: Meet the shapes; Why does the square push the star?; Nobody moves!; Make it shorter; Tell Ani your story. Each has a "say it together" question. The setup checklist gains "Set the age with the link" and "Turn on Talk to Ani on each computer, if you want it". The language-model table already has Nano first for children.
- **students.html.** A line at the top: "If you are 9 to 11, set the page to ages 9–11 (at the top of the film page)." Cards 1 to 6 get the 9–11 wording of what the panel will say, where it differs.
- **Card 3's answer** in both guides changes from "to establish that the stepmother dominates and hates Cinderella" to name *dominates* and *hates* as the words the push came from. That is already true, and the 9–11 view now shows it in its Who decided ladder.

### 13. Accessibility

- **Contrast.** All text at 6–8 and 9–11 uses `--ink`, or `--muted` only where `--muted` reaches 4.5:1 on its sheet in both themes. The check computes this from the CSS tokens. Small `.label` capitals are not used at 6–8.
- **Size and spacing.** As §4. Line length at most about 60 characters in the 6–8 side panel. The 6–8 view is tested at 200% zoom and at phone width (375 px), with no horizontal scroll.
- **Targets.** At least 44 by 44 px for every control at 6–8, and at least 32 by 32 px at 9–11. The check measures the controls' boxes.
- **Reduced motion.** Under `prefers-reduced-motion: reduce`: no smooth scrolling of the side panel into view; the listening dot and the read-along underline don't animate; Play never starts by itself (it doesn't today either). The film is the content and still plays when pressed.
- **Screen readers.** The legend chips are real buttons that open a character, which gives the canvas a keyboard route. A visually hidden line, "On the screen now: the red square, the green star", is updated when the cast on the stage changes. Glossary popovers are disclosures (§6.3). Captions follow §8's live-region rules. The age control is a labeled group of pressed buttons.
- **Keyboard.** Space plays and pauses, and the arrows step, as today. At 6–8, "W" opens Why? for the selected character and "R" reads it. Keys are ignored in text boxes, as today.
- **Dyslexia and early readers.** No justified text, no italics for long runs (glossed words are marked by the dotted underline, not italics, at 6–8), and Read aloud on every box.

### 14. The 1978 contract

The setting never reaches Ani. It is not part of a film's description, its extensions, its worker messages, its saved file, its library entry, its criticism record or a Teach Ani notebook. The 1978 film and every made film are identical at every setting. Ken's words are never changed in the record or in the 12+ view. The 6–8 glosses are marked as the revival's readings, with Ani's word one tap away. No language model is involved in any explanation at any setting.

## Alternatives considered

- **A language model rewriting the 12+ sentences for children.** Rejected: it could say something false, it would need a network and a key, and it would break Ken's glass-box rule that the explanation *is* Ani's record. Templates cover every fact kind the page already explains, and gaps are honest.
- **One "simple mode" instead of two simpler levels.** Ken asked for both. 6–8 and 9–11 differ in reading ability, in whether names or shapes help, and in whether a language model should read a child's words. A single level would be too hard for six-year-olds or too thin for ten-year-olds.
- **Separate pages for children.** Rejected: two pages drift apart. One page with renderers keeps one set of facts and one set of checks.
- **In-story "because" everywhere, or Ani's "to show" everywhere.** The design uses the in-story "because" at 6–8 only where the record names the source words, and keeps "to show" at 9–11 and above, because "to show" is Ani's real purpose and the lesson of the glass box. Who decided gives 6–8 that lesson too. See open question 1.
- **Cloud text-to-speech with nicer voices.** Rejected: it needs a service and a key, and sends text away. The browser's voices are good enough, free, and offline.
- **Changing the editor for children.** Ken said to keep it as it is for now.

## Changes, file by file

| File | Change |
|---|---|
| app/film.template.html | Stage A0's split of the explanation functions (§2) into fact readers and the 12+ renderer (today's text, unchanged); the age classes on `<html>`; the header control and For grown-ups drawer; the legend chips as buttons; `fromHash` reading `ages-…`; the caption written only when its text changes; the CSS for both levels (sizes, hiding, targets); "What this page keeps" lines. |
| app/film/ages.js (new) | The setting's state, storage and hash token; `WORDS_6_8` and the stemmer; the glossary table and popover; the 9–11 and 6–8 renderers for each fact kind (§7); `SAY_AS`; the gap marker. |
| app/film/speech.js (new) | Read aloud (§8): the queue, wait-for-voice, voices, rate, boundaries, live-region switching. Talk to Ani (§9): opt-in, feature detection, on-device preference, the microphone button component, commands at 6–8, errors and the fallback text. |
| app/film/view.js | Restore at the remembered level, and keep the level out of the saved view's film state. |
| app/film/llm.js | The 6–8 Tell Ani flow (§10); the microphone on the story box; More settings at 9–11. |
| app/film/criticism.js, app/film/critique.js | Texts through the renderers (§7.9); the 6–8 buttons; the microphone on "Tell Ani what's wrong"; hidden at 6–8. |
| app/film/teach.js | Texts through the renderers (§7.10); kind 1 alone at 6–8; the microphone on the reason box. |
| tools/build-film-app.mjs | Include ages.js and speech.js among the film parts (`/*FILM-PARTS*/`), in the site build and the claude.ai copy. |
| tools/check-film-app.mjs | The "ages" checks (§Tests). |
| reports/ext/ages/ (new) | The goldens: every sentence of Ken's film at each level, as a readable Markdown table for Ken, and as JSON for the check. |
| site/pages/teachers.html, students.html | §12. |
| src/, revive/, original/ | **No change.** |

## Tests

All in tools/check-film-app.mjs (headless Chrome, as now), with no model calls. A canned provider reply stands in wherever a flow would call one.

- **A. 12+ unchanged.** Before stage A0, record every explanation the page makes for Ken's film: every scene at 4 and 24 a second, every character at the start of every part and at every still, every panel's sections opened, the stops of the fixture films. After A0, at 12+, the HTML must be byte-identical. This is the refactor's safety net, and it runs on every later stage.
- **B. True to the glass box.**
  1. *Same facts.* For every fact, the three renderers' `uses` must be subsets of the facts object's slots, and the 6–8 and 9–11 `uses` must be subsets of the 12+ `uses` for the same fact. A simple sentence never mentions a slot that the full one doesn't.
  2. *Independent "because".* The check reads the glass box's `related-suggestions` items itself (its own small reader, not the page's) and confirms that every 6–8 and 9–11 "because" lists exactly the source words of the chosen convey method. For Ken's Introduction: the chase gives {mean, evil}, the push {dominates, hates}, helps {friendly}.
  3. *Known-true and known-false.* The check holds a list of known-true sentences (this design's worked examples, as the goldens fill in their numbers) that must appear, and known-false ones that must never appear anywhere at any level, starting with "The red square pushes the green star around, because the square is mean."
  4. *Numbers.* Every number in a simple sentence rounds from the same number in the 12+ sentence.
- **C. Vocabulary.** Every word of every 6–8 sentence, popover and button label is in `WORDS_6_8` (with inflections), a name, a number, a scene title, or inside a gloss. Every 9–11 sentence is free of Lisp names, `file.version:line` citations, actor names (`establish-task-5`) and the words subscene, method and element. Unknown Ani words are listed for the glossary.
- **D. Length.** At 6–8, at most 14 words a sentence and 3 sentences a box. At 9–11, at most 22 words a sentence and 4 a box. A Flesch–Kincaid grade above 3 (6–8) or 6 (9–11) is reported as a warning only, because it is noisy on short texts.
- **E. Coverage.** Run over Ken's five scenes at both rates; the beautified scene; the fixture stories in test/stories/; the Tortoise and the Hare and other saved trial runs in reports/llm-trials; and the stop fixtures. Count the gaps (§7.12): zero for Ken's film, and listed for the rest.
- **F. Speech.** Stub `speechSynthesis` in the page to record utterances and fire `end` on command. Play the Introduction at 6–8 with Read aloud: the utterances must be the captions' `say` texts in order; the film must wait while an utterance is unfinished (wait for the voice); pause must cancel; scrub must speak once after stillness; side by side must read one screen. Stub `SpeechRecognition`: no recognizer is constructed before opt-in (a spy on the constructor); a final result fills the box and nothing is submitted; a command result ("play") plays; an unknown phrase does nothing but say so; with the API absent, no microphone buttons are shown and the fallback text is.
- **G. Presentation only.** At each level, make a canned story's film: the worker's messages, the film's JSON, the saved film file and the library entry contain no age, and are byte-identical across the three levels. The hash token sets and remembers the level. A link can't turn on Talk to Ani.
- **H. Accessibility.** Control boxes at 6–8 are at least 44 px; text tokens meet 4.5:1 in both themes; there is no horizontal scroll at 375 px at 6–8; every glossary button opens with Enter and closes with Escape; with Read aloud on, the captions' live region is off.
- **I. Goldens for Ken to read.** reports/ext/ages/cinderella.md: each moment's three sentences side by side, regenerated by the check, and diffed in review.

## Risks

- **The A0 refactor touches the page's longest code** while other agents are editing it. Mitigation: do it last among concurrent work, function by function, with check A after each. It is the one large risk to today's page, and check A is designed to catch it.
- **A template that is true but misleading.** For example, "because the square is mean" is true of the source but may read as the square's own motive. Mitigation: Who decided, a click away, says who decided (Ani). Open question 1.
- **Speech engines differ.** Voices, boundary events, and Chrome's cutoff of long network utterances all vary. Mitigation: one sentence per utterance, a local voice offline, and a timeout in wait-for-voice.
- **Cloud recognition in schools.** Some schools forbid sending children's voices to Google. Mitigation: off by default, a grown-up's opt-in with the vendor named, no link that turns it on, the on-device route where available, and the OS dictation fallback.
- **Hard content for six-year-olds.** "hates", "kills", "evil" and the set-aside idea of killing Cinderella are all in Ken's records. Mitigation: keep the record's words (they are the story's), put set-aside ways in More, and ask Ken (question 6).
- **The word list is ours.** Mitigation: a primary teacher reviews it (question 12), and the check keeps it honest.
- **The claude.ai copy** has a different frame (no microphone, probably no fetch). Mitigation: feature detection. Before stage A5 writes microphone or speech code, the builder consults the `artifact-sandbox` skill, as the project's standing note asks.

## Stages

Each stage is buildable and checkable on its own, in this order.

| Stage | Work | Files | Checks | Effort |
|---|---|---|---|---|
| A0 | Facts and renderers: split the explanation functions (§2) into fact readers and a 12+ renderer, unchanged in output | film.template.html; criticism.js, teach.js, critique.js texts | Test A (the before snapshot is taken first) | 4 d |
| A1 | The setting: control, For grown-ups drawer, storage, hash token, view.js restore, CSS classes, sizes and hiding, legend chips | film.template.html, ages.js, view.js | Tests G (hash and storage), H (sizes) | 1.5 d |
| A2 | 9–11 renderers, the glossary and popover, the More ladder | ages.js | Tests B, C (9–11), D, E | 3 d |
| A3 | 6–8 renderers, `WORDS_6_8`, shape and color naming, Who decided, the goldens | ages.js; reports/ext/ages/ | Tests B, C, D, E, I | 3.5 d |
| A4 | Read aloud | speech.js | Test F (output) | 2 d |
| A5 | Talk to Ani: opt-in, microphone buttons, commands, fallback (consult `artifact-sandbox` for the claude.ai copy first) | speech.js, llm.js, critique.js, teach.js | Test F (input), G (no link opt-in) | 2 d |
| A6 | Tell Ani a new story, criticism and Teach Ani by setting (§10, §11) | llm.js, criticism.js, teach.js | Test G (films identical across levels), canned-reply flows | 2 d |
| A7 | Guides and the accessibility pass (§12, §13) | teachers.html, students.html, film.template.html CSS | Test H; the site build | 1.5 d |

That comes to about 19.5 working days. A0–A3 give the two new reading levels without speech, about 12 days, and could ship alone. A4 (Read aloud) is the most valuable of the rest for 6–8 and could follow at once. Before A3 ships, Ken and a primary teacher should read the goldens of A3 (question 12).

## Questions for Ken

1. **At 6–8, "because" or "to show"?** Your example, "The square pushes the star because it is mean", uses an in-story "because". Ani's record says the push was *to show* that the stepmother dominates and hates Cinderella, and that the chase and the hit came from *mean* and *evil*. Recommended: at 6–8, captions use "because" filled only from the record's source words ("The red square pushes the green star around, because the square is the boss of the star and hates the star"). Who decided, one tap away, says "The story says… Ani knows… So Ani…". At 9–11 and 12+, keep "to show".
2. **Shapes or names at 6–8?** Recommended: shapes and colors in the sentences ("the red square"), names in the legend and the panel heading, because the film shows only shapes. Names would be easy to switch on instead.
3. **Read aloud on by default at 6–8, with the film waiting for the voice?** Recommended: yes to both. At 9–11 and 12+, off by default, and when on, the film doesn't wait.
4. **"Tell Ani what's wrong" (a language model reading a child's words) at 6–8?** Recommended: not offered. The three buttons and the spoken commands cover what a six-year-old will say, without a model reading their words. Offer it from 9–11, with the microphone.
5. **Tell Ani a new story at 6–8: one "Make my film" button that goes straight on when the check is clean, with Gemini Nano as the default where it is ready?** Recommended: yes, and hide the flow in the claude.ai copy at 6–8 unless Nano is ready, since claude.ai is for adults.
6. **Hard words in the record: "hates", "evil", "kills", and the set-aside "having the stepmother kill Cinderella"** in Kept Apart's Why this way. Recommended: keep the record's words wherever they are the story's or the shown way (they are fairy-tale words, and changing them would make the sentence false). Put set-aside ways that aren't shown in More at 6–8, and say "get together" for “getting it on”, with your phrase in the popover.
7. **Can a class link turn on Talk to Ani?** Recommended: no. A link sets the age only. Consent to send a child's voice to Google, Microsoft or Apple is given on each computer by a grown-up.
8. **How should the voice say "Ani"?** Synthesizers will say it differently (like "Annie", or "Ah-nee"). Recommended: tell us your pronunciation, and the page will respell it for the voice (`SAY_AS`).
9. **Teach Ani at 6–8: only "a new word like another", reached from More and from Ani's "I didn't know a way" moments?** Recommended: yes. Kinds 2 to 5 from 9–11.
10. **The first visit: 12+ with no prompt?** Recommended: yes, so that every existing link and visitor sees today's page. Teachers use the link.
11. **The guides: a new section `#young` in teachers.html, rather than a new guide for children?** Recommended: yes. Children of 6–8 use the page with a grown-up, and the grown-up reads the guide. A printable "picture card" set can come later.
12. **Who reads the word list, the glossary and the 6–8 goldens before they ship?** Recommended: you and one primary-school teacher, from reports/ext/ages/cinderella.md.

## References

- The page's explanation code: app/film.template.html, `captionAt` (≈L4640), `methodText` (≈L1112), `about`, `taskText`, `purpose` (≈L970–1030), `chainOfTask` (≈L4959), `wayWhy` (≈L5133), `longWords`, `stopWords`, `endedWords` (≈L5096–5240), `stillWhy`, `stillBox` (≈L5260–5298), `whyStopped` (≈L2477), `lookSentence` (≈L2860), `fromHash` (≈L7345); app/film/view.js (`#view`, restore); app/film/llm.js (`PROVIDERS`, `EXAMPLE_STORIES`, the teller panel); app/film/criticism.js; app/film/critique.js; app/film/teach.js.
- The glass-box facts quoted: reports/ext/appear/introduction.glass.json (establish-task-1, -3 and -5 and their related-suggestions; convey-task-8, -9 and -11), kept-apart.glass.json (convey-task-2's scores and rejected-suggestions; establish-task-7), meeting.glass.json (convey-task-5).
- The Tortoise and the Hare: reports/llm-trials/2026-10-13 gpt-6.1-sol json/the-tortoise-and-the-hare.lisp and .run.txt; the students' guide's card 9 for its stop.
- The guides: site/pages/students.html (cards 1–6, "Words to know"); site/pages/teachers.html ("Ages and what they need", "Language models: your options", the claude.ai copy).
- Ken's legitimacy rule, for Teach Ani's question: AI-TR-540 p. 189. Ken's "no conception of rhythm…": p. 191.
