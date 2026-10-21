# Ages 6–11: the words the page uses, and the labels without "my"

21 October 2026. For Ken to veto, line by line. Three decisions of Ken's, from chat:

1. *"My grandchildren (5 and 7) would have no problems with the 9-11 wording - let's skip the 6-8 and rename the 9-11 to 6-11."* The age setting is now **6–11** and **12+**.
2. Children's vocabulary in everything the 6–11 setting shows, not only the explanations.
3. Teaching easy to save, load and forget on a shared computer, and no "my" for anything kept on the computer (*"in many contexts 'my' is confusing - it may have been the previous student who used it"*).

Nothing here was written by a language model at run time: every replacement is a fixed sentence or a fixed phrase in the page's code (`app/film/ages.js` `at611`, `at611More` and the phrase table `EVERYDAY`). The 12+ page is unchanged except for the "my"/"your" labels of part 3 (check-ages test A: 4,094 explanations of Ken's film, of which 10, the story panel at each scene, differ only by the label "Your criticism" → "Criticism of this film"). Ani's own words of the record (dominates, is tolerant of, accompanys, anticipatory, ...) are as the record has them, with their glossary popovers. The Lisp, the code citations and the 12+ texts stay under **More**.

How the words were found: `harvest.mjs` (the session's scratchpad) opened the page in headless Chrome at 6–11 and read every visible text, title, label and placeholder of each state: the start, the speech and film settings, Save, "What this page keeps", every caption of Ken's film, each character's panel at the start of each part, the story panel at each scene, Teach Ani with each of its six kinds, Tell Ani a new story (with More settings open, a reply stood in for, the editor), a new story made in 1978 mode (stopped) and again with the extensions (made), side by side, and the films kept here. 1,089 distinct lines before; the words beyond a plain children's vocabulary were picked out by hand from the 1,373 distinct words, and are below. check-ages test E now reads the same panels and fails on any of the hard words outside More, Lisp and the boxes typed in.

## 1. The setting

| Was | Now | Where |
|---|---|---|
| Ages 6–8 · 9–11 · 12+ | Ages 6–11 · 12+ | the header's control |
| `#ages-6-8`, `#ages-9-11` | `#ages-6-11` (the old two still open 6–11, and so does a kept "6-8" or "9-11") | links, the hash |
| 9–11's sentences | 6–11's, the same templates (A2) | captions, panels, the story |
| 6–8: larger type and controls, always | **Bigger**, a button beside the film's controls at 6–11, kept in this browser | the controls |
| 6–8: Read aloud on, the film waiting for the voice | Read aloud off until pressed; **Wait for the voice** / **Keep going** in Speech settings (Keep going by default) | speech |
| 6–8: a microphone beside Play for spoken commands | the same at 6–11, once a grown-up has turned on Talk to Ani | speech |
| 6–8: For grown-ups drawer, characters named by shape and color ("the red square"), the film forced to color, "Ken's film" / "My film", W and R keys, one-line footer | gone (the footer at 6–11 is one line and "About this page", as 6–8's was; "What this page keeps" stays in view) | |
| `app/film/ages-6-8.txt`, `AGE_68_WORDING` | deleted | |
| header: A guide for students; at 12+ also A guide for teachers | **A guide for students** and **A guide for teachers and parents** at both settings (to `teachers.html#young` at 6–11); the old 6–8 link "For grown-ups: using Ani with young children" folded into it | the header; the footer's link renamed too; teachers.html is now titled "A guide for teachers and parents" |

## 2. Sentences written for 6–11 (12+ keeps its own)

| Where | 12+ (as before) | 6–11 |
|---|---|---|
| header intro | Ani, the program in Ken Kahn's 1979 thesis at MIT, turned a short description of Cinderella into this film. … | Ani is a computer program that Ken Kahn wrote at MIT in 1978. It turned a short story of Cinderella into this film. Play it, then click a character to see what Ani decided it should do, and why. |
| What Ani was told | The film description, Appendix I of the thesis, in plain English. Ani planned every scene from it. | The story Ken gave Ani in 1978, in plain words. Ani planned every scene from it. |
| … a changed story | Your changes to the film description (new words are outlined). Ani planned every scene of your version from it. (12+ now: "Changes to the film description … of the new version", part 3) | Ken's story, with changes (new words are outlined). Ani planned every scene of the new version from it. |
| … Ken's story made again | Ken's film description, unchanged. … | Ken's story, unchanged. … |
| The scenes (label) | The scenes | The scenes, and what Ani was asked to show in each |
| each task of a scene | Establish that Cinderella is a little happy · Convey that Cinderella wants to meet the Prince · Establish what Cinderella is like (good, …) | that Cinderella is a little happy · that Cinderella wants to meet the Prince · what Cinderella is like (good, …) |
| a scene's settings | mood changing from hopeful to depressing · rhythm changing from fast to slow · long length | mood: hopeful, then depressing · pace: fast, then slow · a long scene |
| … (two that 12+ read wrongly until 21 October, see part 5) | mood joyous and anticipatory · mood very joyous (were: mood and joyous to anticipatory · mood very to joyous) | mood: joyous and anticipatory · mood: very joyous |
| a scene, part by part | Each part's frames (the film's, counted from its first scene; click one to see it) and what it is for, and each step in it; click a step for why … | Each part of the scene, how long it lasts and what it is for, and each step in it. Click a step to see why it is done that way and lasts that long. |
| … each part | Part 1 frames 0–502, 20.9 s: … | Part 1 (20.9 seconds): … |
| … each step | 12–431 The stepmother: running into the other, 5 times | The stepmother: running into the other, 5 times (the step's button still opens it) |
| Tell Ani what's wrong | Say what is wrong … A language model reads it into criticism Ani can heed, a change to the story, or something to teach Ani … Your words, with the film as the glass box tells it, go only to the model you choose. | Say what is wrong with the film in your own words. An AI reads them and turns them into fixes Ani can use, a change to the story, or something to teach Ani, and you choose what to do with each. Your words, and what Ani noted about the film, go only to the AI you choose. |
| keep two apart | Ken's third kind of criticism (pp. 189–191): “this post-condition could be added to all the methods in that scene and it could be remade”. Every way of showing that would bring the two together is set aside, as a prerequisite not met. | This was Ken's own idea for fixing a film. Ani then leaves out every way of showing that would bring the two together. |
| start far | Ken's remedy for No Longer Kept Apart (p. 69): “…”. PLACE places her far off and off the stage, and she walks on. | This was Ken's own idea for No Longer Kept Apart: “have the fairy godmother start far from Cinderella”. Ani then puts her far away, off the stage, and she walks on. |
| the remake's plan | (remakePlan: pass 1 again, held choices, …) | Ani will make the film again, from the first scene with a fix, and show it beside this one. / Nothing new to fix yet: this film was made with these fixes. / This film wasn't finished, so it can't be made again with fixes: make it again first. |
| a film that stopped (story panel) | Where Ani as in 1978 stopped, and each scene's reason | the heading, then: Ken's 1978 Ani couldn't finish some scenes: it met something in this story that Ken never gave it. The repairs added to Ani in 2026 can help it go on. (Ani's reasons under **More: why Ani stopped**) |
| … the caption of a stopped scene | Ani stopped while making this scene. In pass 1 Ani gave up on the hare's activity level (nothing suggested a value), and pass 2 can't weigh a value of none. | Ani stopped while making this scene. (and the button to make it again) |
| captions | the notes of the revival's corrections and details (… takes its parent's factor once … (the revival's correction, FIT); With SLIPS, …; With DETAIL, …) | left out of the 6–11 caption (they stay at 12+) |
| Tell Ani a new story | Tell a short story in plain English. A language model turns it into a film description in Ken's notation, using only the words Ani knows; … (no talking, no objects, nothing but movement) … | Tell a short story. An AI turns your story into words Ani can read, using only the words Ani knows; you can look them over and change them; then Ani plans the film and makes it, as it did Cinderella. Ani knows very little (no talking, no things, only moving about), so simple stories work best: a few characters who love, hate, chase, guard and rescue each other. |
| … its button | Write the film description | Turn it into words Ani can read |
| … its folded settings | More settings | More settings, for grown-ups |
| Change the story | Change what Ani is told … here in your browser. That takes two or three minutes on a recent computer, … (after it Ani takes a fresh look at Cinderella), … | Change what Ani is told about the characters, then have Ani plan and make all five scenes again, here on this computer. That takes two or three minutes (about five with Ken's beautified scene), and longer if this tab is in the background. Each scene plays as soon as it is made, beside the 1978 one. |
| … its words | Shaded words have suggestions of their own in Ani's code; … words outlined in purple are the revival's knowledge … | Ani knows what shaded words mean for how a character moves; slanted ones it knows only as the opposite of another word, or close to one. Words outlined in purple were added to Ani in 2026. Hover over a word for more. |
| … quickly and smoothly | Quickly is at 4 frames a second, as Ken's TV previews ran: … | Quickly is jerky, and takes two or three minutes (five with Ken's beautified scene). Smoothly takes about a quarter of an hour (half an hour with the beautified scene). Each scene plays as soon as it is made. |
| … which extensions | the mode's note and the list of extensions and their files | under **More: the new parts added to Ani in 2026** |
| Teach Ani's kinds | what a character is like inside (personality) · liking and disliking (affection) · who is in charge (domination) | the same without the words in brackets |
| … Ken's examples | Ken: “industrious” means … (dscrp.17:276-277) · The revival: … *the revival's* (REVIVE;KNOWDS) | Ken's own example: … · Added in 2026: … (no file citations) |
| … Ken's CONVEY | Ken: CONVEY shows chasing, … of helping it says “for now don't have an suggestions as to how to convey this”. | Ken's own example: Ani shows chasing, hurting, pushing around and going along with each in a way of its own; for helping, Ken wrote that he had no way yet. |
| … words with no way of showing | … Ken decided Ani “could show them only by gestures [it doesn't] have” (his decision 10). … | Ani has no way to show some of Ken's words, such as is polite to and is tolerant of: Ken decided it could show them only with movements it doesn't have. If you disagree, give one a way here, and see. |
| … needs the extensions | With this film's extensions (Ani as in 1978), following, helping and keeping away, and the revival's words, need the revival's knowledge (KNOW) and how a word looks needs Ani choosing how its characters look (APPEAR): make a film with them first to teach those. | To teach following, helping, keeping away, the words added to Ani in 2026 or how a word looks, first make a film with the new parts added to Ani in 2026. |
| … Ken's rule (9–11 already had its own) | Is this something everyone knows, that Ani was missing? (Ken's rule: only add obvious information that was lacking.) | Is this something everyone knows, that Ani didn't know yet? (Ken's rule: only teach Ani what is plainly missing.) |
| … making a film with it | Ani will make … again, …, at 4 frames a second, with your knowledge: … (REVIVE;TEACH, with the revival's repairs, MEND, …). Then the two are shown side by side, with what your knowledge did. | Ani will make Ken's 1978 film (or the new version) again, using this teaching: “…”. Then the two films are shown side by side, with what the teaching changed. |
| … Ani's check | Ani read your knowledge with Ken's files and heard every piece (1.2 s). Where Ken's spreading of links took a word further, its piece says so. | Ani read this teaching along with everything it already knew, and heard every piece. Where a word reached further, through the words it is like, its piece says so. |
| … a piece | … (Ken's rule, char.2:111-131) | … (Ken's rule) |
| … the notebooks | Each notebook is kept in this browser, beside the films made here, … (a teacher can hand out a class notebook so), and open one someone saved, or drop it on the page. | Each notebook is kept on this computer, beside the films made here, and sent nowhere. A film is made with those ticked “use”, up to 4; two may not teach the same word. Save one to a file to keep it or share it, and open one someone saved. |
| … the four examples' "What to look for" | (each in full, with attraction to enemies, the film's variety, KNOW's helping along, …) | the same story in everyday words (teach.js `EXAMPLE_WORDS` kidBefore, kidLook) |
| … See it as Ani reads it; About teaching Ani; About criticizing Ani's films | (open) | under **More: see it as Ani reads it**, **More about teaching Ani**, **More about fixing Ani's films** |
| Films made here | Every film you make here … (those you renamed last of all), and says which. … (12+ now without "you", part 3) | Every film made here, or opened from a film file, is kept on this computer, the newest first, up to 40; after that the oldest are let go to make room. Save a film to a file to keep it for good. |
| What this page keeps | In localStorage, until you clear it · In IndexedDB (the database “ani-cinderella”), until you clear it · In sessionStorage, until this tab is closed · (key names and sizes) · Gemini Nano, if you have used it here, … | Settings and stories, until they are forgotten · Films and teaching, until they are forgotten · Where you are on the page, until this tab is closed · (no key names) · Gemini Nano, an AI that runs in Chrome, is kept by Chrome itself, not by this page. And each kept setting in plain words (Which Ani makes the films made here: Ani as in 1978, or with the new parts added in 2026; How smooth the films made here are; The last story told to Ani, and the AI that turned it into words Ani can read; Which AI was chosen, and how it writes; Keys for the AI, …). |

## 3. The phrase table: the page's own words, everywhere they are shown at 6–11

In this order (`EVERYDAY` in `app/film/ages.js`), in the text, titles, labels and placeholders of whatever the page shows at 6–11, as it is drawn; never inside More, Lisp, code or a box typed in; put back exactly at 12+.

| Was | Now |
|---|---|
| (dscrp.17, line 136) · (dscrp.17:276-277) · (thesis pp. 189–191) · (the thesis, p. 65) · (p. 69) · (AI-TR-540, pp. …) · (REVIVE;TEACH) · (MEND) · (KNOW) · (FIT) … | left out |
| (the revival's) | (added in 2026) |
| What Lisp said | More: what Ani's program said |
| Ani with the revival's extensions | Ani with the new parts added in 2026 |
| (some of) the revival's extensions | (some of) the new parts added in 2026 |
| the revival's repairs | the repairs added in 2026 |
| the revival's knowledge | the knowledge added in 2026 |
| the revival's correction / repair / rule / choice / reading | a correction / repair / rule / choice / reading added in 2026 |
| the revival's (own) | the 2026 |
| this revival · the revival | this 2026 version of Ani · the 2026 version of Ani |
| Which extensions · extensions · extension | Which new parts · new parts · new part |
| a language model · A language model · language model(s) | an AI · An AI · AI |
| write Ken's notation itself | write Ken's Lisp itself |
| put it into Ken's notation · in/into Ken's notation · Ken's notation | turned it into words Ani can read · in/into words Ani can read · words Ani can read |
| in Ken's own notation | in Ken's own Lisp |
| the/a film description · film descriptions | the/a story · story |
| Anthropic / OpenAI / Gemini API key | Key for Claude / ChatGPT / Gemini (from a grown-up) |
| API key(s) | key(s) |
| the model · The model · THE MODEL · Which model · a model · No model | the AI · The AI · THE AI · Which AI · an AI · No AI |
| Model (the model's own box) | Which one |
| Calls go straight from this page to Anthropic, with your key; it is kept only in this tab unless you tick “Remember”. | Your story goes straight from this page to Anthropic, with the key. The key is kept only in this tab unless “Remember” is ticked. |
| the glass box tells it / says / shows · the glass box · glass box(es) | Ani's notes tell it / say / show · Ani's notes |
| Pass 1 · pass 2 · pass-1 | Step 1 · step 2 · step-1 |
| frames a second · frames · frame (and Frames, Frame) | pictures a second · pictures · picture |
| Remake with this criticism | Make it again with these fixes |
| remade with criticism | made again with fixes |
| this criticism · the criticism · your criticism · criticism · Criticism | these fixes · the fixes · your fixes · fixes · Fixes |
| Criticism of this film | Fixing this film |
| criticizing · Criticize (a scene as a whole) · criticized · criticize | fixing · Fix something in · fixed · fix |
| not yet heeded · heeded · heeding · heed | not used yet · used · using · use |
| Establish that/what/how · Convey that/what/how · to establish … · to convey … · conveying | Show that/what/how · to show … · showing |
| Director stopped filming here | The filming stopped here |
| 20.9 s | 20.9 seconds (1 second) |
| Which element | Which part of how it moves |
| normal / fast / slow / changing rhythm | normal / fast / slow / changing pace |
| Videos are WebM, at | Videos are made at |
| …, so that coming back from the code pages, or a reload, puts you back there | …, so that coming back to the page puts you back there |
| As Ken's TV previews ran, and as the thesis's flipbook shows (a title) | As Ken's quick TV previews ran |
| …, whatever Ani's own estimate (a title) | …, whatever Ani first planned |
| “strong” is a word for personality | “strong” is a word for what someone is like inside |
| which he wrote and left commented out (a title) | which he wrote and then left out |

## 4. No "my", and "your" only for the person at the keyboard (every age)

The computer may be shared, so a label for something kept on it doesn't say whose it is. "You" and "your" stay where they mean the person at the keyboard now ("Tell Ani what's wrong", "Say what is wrong with the film in your own words", "Because: say why, in your own words", "Your story" on the box being typed in, "Where you are on the page").

| Was | Now | Where |
|---|---|---|
| Make it with my knowledge (and ", quickly", ", smoothly") | Make it with this teaching | Teach Ani, the editor, the examples |
| Make it without your knowledge | Make it without this teaching | Teach Ani's examples |
| Remake with my criticism | Remake with this criticism | criticism (6–11: Make it again with these fixes) |
| My knowledge, My knowledge (2) (a new notebook's title) | Teaching, Teaching (2) | Teach Ani; the file is now teaching.ani-knowledge.json |
| Your films, Your films (3) | Films made here, Films made here (3) | the bar over the film, the story panel, the panel's heading, What this page keeps |
| Your knowledge (2 notebooks, 1 used) | Teaching kept here (2 notebooks, 1 used) | Teach Ani |
| Your words (a menu's group) | Words taught to Ani | Teach Ani's word menus |
| Your criticism / Your criticism of this film | Criticism of this film | the story panel (the one change at 12+ in test A's explanations) |
| Add to your criticism | Add to the criticism | Tell Ani what's wrong |
| Added to your criticism; remake the film when you are ready. | Added to the criticism; … | notice |
| What your criticism changed · What your criticism did here | What the criticism changed · What the criticism did here | side by side, the glass box |
| What your knowledge did · What your knowledge did here · the badge “your knowledge” | What the teaching did · What the teaching did here · “teaching” | side by side, the glass box |
| Your version (the bar over the film, the screen's caption, a film's title "Your version, with the revival's extensions") | The new version (The new version, with the revival's extensions) | the bar, the screen, new films' titles (films kept before keep their titles) |
| your version now (a tag) | the new version now | Films made here |
| Your story / Your changes to Ken's story (headings) · Your story, as Ani was told it. · Your version was made from exactly this, … | The new story / Changes to Ken's story · The new story, as Ani was told it. · The new version was made from exactly this, … | side by side, the story panel, the editor |
| …, with your knowledge (…) · …, heeding your criticism · which your criticism loads | …, with the teaching (…) · …, heeding the criticism · which the criticism loads | how a film was made |
| …, with your criticism: … · with your criticism (…) · with your knowledge (…) | …, with criticism: … · with criticism (…) · with teaching (…) | a remade film's title; Films made here |
| Your word, from “…”. Ani knows it only in a film you make with your knowledge | A word taught to Ani, from “…”. Ani knows it only in a film made with that teaching | the editor's word chips |
| Teach Ani something it doesn't know. Ani will use it in every film you make with your knowledge. | … in every film made with this teaching. | Teach Ani |
| …, used in your films | …, used in the films made with teaching | Teach Ani |
| Opening your knowledge… | Opening the teaching kept here… | Teach Ani |
| What this page keeps in your browser | What this page keeps in this browser | the footer |
| Your API keys, only if you ticked … · Your last film … · Your notebooks of knowledge … · Your age setting (6–8, 9–11 or 12+). Nothing about you is kept · That you said “Don't ask again” … · The story you told … · The model you chose … · The extensions you ticked … · The frames a second your films … · Which Ani makes your films … | API keys, only if … was ticked · The last film made here … · The notebooks of teaching … · The age setting (6–11 or 12+). Nothing about anyone is kept · That “Don't ask again” was chosen … · The last story told … · The model chosen … · The extensions ticked … · The frames a second the films … · Which Ani makes the films made here … | What this page keeps |
| This deletes your 3 films, your 2 notebooks of knowledge and … | This deletes the 3 films made here, the 2 notebooks of teaching and … | Forget all of it |
| Every film you make here, or open … (those you renamed last of all) | Every film made here, or opened … (those renamed last of all) | Films made here |
| (side by side) The new version was made from … again, with your knowledge: “…” | … again, with this teaching: “…” | What the teaching did |
| In pass 1 Ani made 33 choices about how your characters move | … about how the characters move | side by side |

Proposed, not made (say if you want them): the short tag **Yours** (in "Yours · Scene 1", "in yours", "hexagon in yours") could become **New**; and the many sentences inside the 12+ explanations that say "your criticism" or "your knowledge" (for example "Ani heeded your criticism where its own code chooses", "Ani is reading your knowledge with Ken's files") could say "the criticism" and "the teaching". They were left as they are, since they are 12+ sentences about what the person did a moment ago.

New in Teach Ani, at every age, near its top: **Save this teaching to a file** (the notebook open), **Open saved teaching…**, and, when something is kept, **Forget all teaching saved on this computer**, which first lists every notebook it will delete with its number of pieces and says that films made with them keep their own copy, with **Forget all of it** and **Keep it** (in the page: a `confirm()` shows nothing in the claude.ai copy). The same button and list are in **What this page keeps in this browser**. The notebooks box's "Open a shared file…" is now "Open saved teaching…".

## 5. Left as they are, and found on the way

- **Ani's own words** stay as the record has them, glossed where the glossary has them: dominates, is obedient to, is tolerant of, accompanys, prevents, undoes, becomes aware, getting it on, shabby, brazen, magical, …, the moods (hopeful, depressing, joyous, anticipatory), and the names of the elements of how a character moves in Teach Ani's menus (how deliberate it is, how rhythmic it is, how repetitive it is, how drawn it is to strangers). Ken's quotations stay word for word.
- **Ken's preset names** ("Cinderella beautified") and the activity readings ("coasting on after the push", "heading the other off") stay.
- **More** keeps the 12+ text, citations and Lisp, as the panels already did: More about Ani's choices, More: the words Ani was told, More: why Ani stopped, More: the new parts added to Ani in 2026, More about teaching Ani, More about fixing Ani's films, More: see it as Ani reads it, More settings, for grown-ups (which still says JSON and Ken's Lisp), and "About this page" in the footer.
- **12+ read two of Ken's settings wrongly**: `(and joyous anticipatory)` showed as "mood and joyous to anticipatory" and `(very joyous)` as "mood very to joyous" in What Ani was told's scene list (the storyPanel's `setting` regex, which took the last word of any setting for a change's end). Fixed with Ken's agreement (21 October): `settingWords` reads a setting by its form, as the 6–11 `kidSettings` does, (changes a b) "changing from a to b", (and a b) "a and b", (very a) "very a", for every story, in the story panel and in a new story's summary; they now read "mood joyous and anticipatory" and "mood very joyous". reports/ext/ages/12plus.json was written again: of its 4,094 explanations only the story panel at each scene (10) changed, by those two readings.
- **Two stray backspace characters** (0x08, where `\b` was meant), fixed 21 October: in app/film.template.html's look-change reading (`/\b(shape|color|hue)/`, which never matched; every change of look Ani's code makes has `look` in it, so nothing shown changed) and in app/film/ages.js's 6–11 caption (`/\b(SLIPS|DETAIL|FIT)\b/`, which never matched, so a note naming SLIPS, DETAIL or FIT that doesn't say "the revival's correction" or "rule" could reach a 6–11 caption of a film made with those extensions). No other source file in app/, src/ or tools/ has a control character where an escape was meant (tools/maclisp_atoms_1981.txt's are MacLisp's own atom names).
