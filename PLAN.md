# Reviving Ani: plan

*8 October 2026. Ani is the animation system from your thesis (AI-TR-540, 1979). This plan brings it back from the files recovered from the MIT AI Lab tapes in `Documents\MIT-AI-Lab`.*

## Decisions (8 October)

- **Approach:** run your original code first (approach A below). Depending on how that goes, we may later write a modern Ani (approach C) to take the thesis's ideas further. Phase 8 covers that.
- **Lost files:** you're fairly sure the tapes held nothing more, so we rebuild the missing `KEN1;` runtime from the evidence. The Director Guide is our main specification: AIM-482, June 1978, [on DSpace](https://dspace.mit.edu/entities/publication/c9fbfdd3-d7b8-4e09-adea-2e837c51fdff). It's the version closest in time to the Ani code (most of it from mid-1978).
- **The film:** ["Cinderella 1978" on YouTube](https://www.youtube.com/watch?v=ji7lL9wRTT4). It's poor quality, but it's what the revival should look like.
- **Extras:** the glass-box view, editing a film description and running Ani again, and new stories via an LLM. The diagram maker is out.
- **The emulated PDP-10:** not planned.

## Status

- **Phase 0, done (8 October).** See `INVENTORY.md`, `reports/XREF.md` and `reports/BINARY-FORMATS.md`. The biggest find: `TS D2500`, a Director saved in January 1980, holds compiled code for most of the lost `KEN1;` runtime.
- **Phase 1, done (8 October).** The MacLisp interpreter is in `src/maclisp/`:
  - the reader, with Director's read macros;
  - the evaluator, with MacLisp's special forms and about 200 built-in functions;
  - an ITS file system in `src/its/`.

  How it checks out:
  - `npm test` passes 18 tests.
  - Your `LISP`, `LOAD`, `DECLAR` and `DECLA2` load (`node tools/boot.mjs`).
  - All 1,493 forms of Ani and Director read, with quote expansion.
  - It runs in a browser (`test/browser.html`).
- **Phase 2, done (8 October).** Director runs from your 1979 files on a rebuilt `KEN1;` runtime.
  - `src/director/ken1/` holds the rebuilt files: `MACROS`, `UTIL`, `CMATCH`, `PROP`, the compiler and tracing files as stand-ins, and the graphics files `DL`, `TUTIL`, `FWUSE` and `INTER`. Each definition cites its evidence. Much of it was checked against `TS D2500`, now decompiled file by file in `reports/pdump/ken1/`.
  - LLOGO's TV turtle is ported from its public source (`src/tv/`). Director's own demos run unchanged: `test-director` from `KEN;DUMP`, `OBJECT` and `POLY`, `SCREEN` and `MOVIE` filming the guide's example, and `ANINIT`'s color cast. See `reports/TV-TURTLE.md` and the frames in `reports/tv/`. The 1977 `ANIMA` scenes haven't been tried.
- **The tape caught Director in the middle of a rewrite.** You rewrote Director around 21 November 1978 (the second guide: "much of Director has been rewritten", and demons "have been eliminated"). Ani's code is older; `CP 29` was written in September 1978 by the old Director. The surviving Director (`DRECT`, `SOME 666`, `OBJECT 401`, all January 1979) is the new one. Your own `ODIREC 2` (22 November 1978) bridges part of the gap. `src/director/revive/bridge.lisp` (loaded as `REVIVE;BRIDGE`) restores the rest, each change argued from the 1978 guide, the compiled 1978 Ani files and `CP 29`:
  - `:self` is the name the message was sent to, as in 1978, not the actor itself;
  - variable demons are kept in variables, as the 1978 guide says, so that a save keeps them; `ODIREC` says how a set uses their answer;
  - database demons (virtual items, and actions on memorizing) are rebuilt from the 1978 guide;
  - "recall an item matching" quotes the request it remembers, as `SOME 666` already does for "recall each item matching";
  - `INTERSECT` keeps its second set's order, which decides the order Ani makes her choices in (the 1980 one keeps the first's);
  - pass 2 and filming needed more, listed under Phase 4.
- **Phase 3, done (8 October).** Pass 1 reproduces `CP 29` exactly: run on `CINDY`, it makes the same 102 choices, with the same names, and saves them in the same order (`node tools/run-pass1.mjs --no-backtrace`; about 20 seconds).
  - The glass box is `app/pass1.html` (open it directly, or at `http://localhost:8379/app/pass1.html`). It shows every choice point and its value, and for any one of them each attempt Ani made, why it postponed, the suggestion it kept, the conflicts it settled, and the suggestions it rejected. A timeline draws all 836 attempts. The stepmother's speed is shown beside the thesis's own account of it (pages 20–23), and they agree.
  - `node tools/run-pass1.mjs --glass-box` regenerates the data and the page.
- **Phase 4, done in outline (8 October).** All five scenes are planned by Ani and filmed by Director, each scene planned from where the last one left the characters:
  - `node tools/run-pass2.mjs <scene>` plans a scene with `RUN` and saves its program, summary and printout (`KEN;KEPT APART`, `KEN1;KEPT MINI`, `KEN1;KEPT PRINT`), copied to `reports/pass2/`.
  - `node tools/run-scene.mjs <scene>` films the program with `ANINIT` and saves where the characters ended up (`KEN1;INTRO POSIT`, `KEN1;KA POSIT`).
  - Frame counts are at 4 frames a second on a 550 by 413 picture, as `ANINIT` filmed (Phase 5).
  - **The introduction:** five subscenes, estimated at 42.2 seconds (the thesis: 43.3 estimated, 42 real); 192 frames.
  - **Kept apart:** the three subscenes of thesis pp. 66–67. Subscene 1 has the values Appendix VI prints: the cut and its reason, the locations, the plan, 1.53 seconds. Subscene 2 stands guard six times, "originally planned ... only four", stretched by 1.97; subscene 3 is the emotional changes, a parasite on subscene 2. 116 frames: as in the flipbook, the film stops when subscene 3 ends, with the guarding still going.
  - **No longer kept apart:** one subscene, the method the thesis names (p. 68): the fairy godmother goes to Cinderella and takes her to the Prince while the stepmother does nothing; 3.98 seconds, 17 frames.
  - **The meeting:** the seven subscenes of pp. 69–70, in order: the others exit; Cinderella and the Prince turn in turn; she accompanies him; she moves to him after a cut; the same two with the roles swapped, again with a cut; the joy changes, a parasite on the sixth. 179 frames.
  - **Justice:** one subscene, as on p. 71: the stepmother moves near the lovers and turns to each, they come into contact and part four times, and she slows down. 84 frames.
  - Appendix III: pass 2 "begins with 418 actors and creates 154 new ones (not including temporary ones)". With Ani's eighteen files, `CINDY` and `CP` loaded we begin with 343, and planning the five scenes in one job, as `RUN` allows, leaves 147 more at the end.
  - What the bridge needed for this, each with its evidence in `bridge.lisp`:
    - "make copy" makes an independent twin that differs only in name, as the 1978 guide says. This needed `COPY` as `TS D2500` has it: it copies an actor's methods and so its variables. Subscenes save a copy before planning and are restored from it when they must stretch.
    - "forget your" takes patterns such as `(actions-of ?)` (1978 guide).
    - Saves list variables oldest first, without the `(SET YOUR NIL TO NIL)` that `SOME 666` adds, as Appendix VI does.
    - Two places where compiled 1978 code read `NIL` as 0, checking no types: `INTERF`'s quadrants and `ACTION`'s elapsed time.
  - Open:
    - Appendix VI gives Cinderella high speed in subscene 1; ours is low (times 2.0). The 1.53 s estimates agree, which points to low at estimate time, so in 1978 it became high later. The only code that sets it high is the guarding's `prisoner-special-dynamics`, for subscene 2. So in 1978 her subscene 2 dynamics may have been her subscene 1 dynamics. The flipbook's subscene 1 moves as ours does, though.
    - Appendix VI numbers her dynamics `-26`; ours are `-7`. The counter runs across a whole Ani job, and `RUN` cleans up "from before" so that scenes can follow each other in one job. Planned after our introduction in one job, they are `-28`: 1978's introduction used two numbers fewer.
    - Within subscene 1 the locations come in another order than Appendix VI's.
    - The introduction has a fifth, empty subscene; the thesis describes four.
- **Phase 5, under way.** The film is drawn and set beside the thesis's flipbook (`reports/film/`, with its README):
  - `node tools/run-scene.mjs <scene> --png` photographs each frame as `ANINIT` did, on a 550 by 413 picture: after each new frame the movie evaluates its `after-new-frame-made`, which calls `(click)`, the camera. `MOVIE 153` has no such variable, so the bridge has its frame handler evaluate it again; our `CLICK` saves the TV picture.
  - `python -I tools/make-film.py` joins the frames into `reports/film/cinderella.mp4`: 588 frames, 2 minutes 27 seconds at 4 frames a second. The flipbook has 574.
  - `python -I tools/compare-flipbook.py` lays our frames over the flipbook's, scene by scene.
  - **Kept apart** matches closely from start to finish, and its subscenes begin on the same frames (4 and 61).
  - **The introduction's** first 61 frames match exactly, and the stepmother's pushing then drifts by about a shape's width. At the end our couple leaves to the upper right, as in the YouTube film, where the flipbook's goes to the upper left.
  - **The meeting** matches closely, and its fourth to sixth subscenes begin on the same frames (127, 145, 163). After each of its two cuts ours shows the new places one frame later.
  - **No longer kept apart** and **justice** have the same action, shifted a little.
  - The flipbook's timing settled two things. The picture is 550 by 413: at the TV's full size the introduction ran 15 frames longer. And the universe empties its list of actors while they tick, so a check made during a tick can stop the film early. That is what happened in 1978: Kept Apart ends 113 frames in, just after its third subscene, with the stepmother still standing guard. Keeping the list complete during the tick, as the 1978 guide describes it, ran Kept Apart to 188 frames.
  - **Color**, as the film was shot: `run-scene.mjs <scene> --color` and `make-film.py --color` make `reports/film/cinderella-color.mp4`. Cinderella is a green star, the stepmother red, the Prince yellow and the fairy godmother orange, each drawn as nested outlines, as in the YouTube film. That needed `POLY`'s 1978 `MANY-POLYS`, kept in a comment in `POLY 29`, and `SCREEN`'s "silent running" and "normal running" from `ODIREC 2`; the bridge supplies them. The YouTube film is a different run, but where its scenes run as long as ours the staging is much the same (Kept Apart at 12 seconds, for example).
  - The drift: in the introduction the stepmother's fourth push starts a frame or two later than in 1978 (overlay frames 56–67). Nothing in the movement code is random. Rounding every flonum to the PDP-10's 27-bit fraction (`run-scene.mjs --pdp10`) changes no frame, so it isn't float precision in the Lisp code. The likeliest place is `OBJECT 401`, the January 1979 object code; the 1978 one Ani's film used is lost.
- **Phase 6, done (9 October).** `app/film.html` is the app: one 525 KB page, built by `node tools/build-film-app.mjs`, that works opened directly, served, or published (everything is inlined, gzipped).
  - **Default view:** the film on its TV screen, the film description beside it in plain English, and play, step, scrub, scene and TV/color controls.
  - **Glass box:** click a character at any frame to see its activity, the chain of tasks behind it back to the description's own words, the methods Ani scored and rejected, the plan in Ani's words, where it started the part and why, and its dynamics, each value traced to the method or to pass 1's choice, with that choice's suggestions, rejections and conflicts. Links go into `app/pass1.html` and the code.
  - **Source viewer:** `app/source.html` (`node tools/build-source-app.mjs`), Ani's and Director's files with every name linked to its definition.
  - **Edit and rerun:** "Change the story" edits the characters' words and the relationships with the vocabulary of `DSCRP` and `RELATE` (each word says whether Ani has suggestions for it, or knows it only as the opposite or neighbor of another), or the Lisp itself. "Make the film" runs the real thing in a worker in the browser: the interpreter, Director, the bridge and Ani's files, with the changed description as `KEN;CINDY 47`. Pass 1 takes about 18 seconds, the whole film about three minutes, the same as in Node. Each scene plays as soon as it is filmed, side by side with 1978's, and a panel sets out what changed: the words, pass 1's choices (each with its reasons), and each scene's length, parts and methods. The last version made is kept in the browser.
    - `src/pipeline.js` is the pipeline as Ken ran it (pass 1, then each scene's pass 2 and filming, each a fresh Lisp passing files), used by the page's worker. `tools/build-ani-bundle.mjs` lists the files it reads (`app/data/ani-bundle-files.json`) and checks that they alone make the same film, frame for frame. `tools/bundle-js.mjs` turns the modules into one classic script for the worker.
    - `node tools/check-film-app.mjs` checks the page end to end in headless Chrome (about four minutes): the kind stepmother's film made in the page matches Node's, frame count for frame count, and the glass box and the reload work.
  - **What changed stories show** (each run through all five scenes):
    - A kind, pretty stepmother who loves Cinderella and is helpful towards her changes 21 of the 102 choices. In the introduction (20 s in 4 parts instead of 48 s in 5) she goes to Cinderella and accompanies her instead of hitting, chasing and pushing her. `loves` has only the suggestions Ken wrote for the lovers: accompany, or "wants to get it on".
    - A shy Prince lengthens every scene (the introduction to 247 frames); a lazy Cinderella shortens the introduction to 142. For the lazy Cinderella, a clumsy Prince and a wicked fairy godmother (evil, mean; hates and dominates Cinderella), Ani plans the same actions in every scene and only the way the characters move changes (9 to 15 of the 102 choices). The plot is in the scene descriptions: the wicked godmother still rescues Cinderella, because "No Longer Kept Apart" says she undoes the stepmother's keeping them apart.
    - A word Ani doesn't know (say "grumpy") changes none of pass 1's choices, but stops pass 2 with `NO-SUCH-ACTOR`. The editor offers only Ani's words and flags others.
    - A defiant Cinderella (determined, stubborn, strong; hates the stepmother, is impolite to and intolerant of her) stops pass 2. Pass 1 chose "not high" for the stepmother's rhythm and repetitiveness: `COSUG`'s `absolute-three-value` gives `(not X)` when two of three values remain. `INTERF`'s `WEIGHTIFY` accepts only low, medium and high. `CINDY` never led to such a choice, so 1978 never met it.
    - `CINDY` itself gives "strong", a personality word, as the Prince's looks, and uses `is-protective-of`, which `RELATE` doesn't define (it has `is-protective-to`).
- **Phase 7, done (9 October).** "Tell Ani a new story" in `app/film.html`:
  - **The models:** Claude, ChatGPT or Gemini with your own key (kept in the tab, or in the browser if you tick "Remember keys"), each with suggested models as buttons beside an editable name; Gemini Nano where desktop Chrome has it; and inside claude.ai, Claude on the viewer's own account with no key (the `sample` capability in a published artifact, the chat's proxy in a chat artifact). The request shapes are Agent Kit's.
  - **The prompt** (`app/film/llm.js`) lists Ani's words from `DSCRP` and `RELATE`, the task forms Ani can actually show, the scene settings, and the rules below, with your CINDY as the example. The reply is checked: words Ani doesn't know, task forms it can't show, undefined characters, scenes or relationships, missing relationships, a missing film. Problems are listed, "Ask the model to fix these" sends them back, and the description opens in the editor before Ani makes the film.
  - **Any story runs** (`src/pipeline.js`, `storyOutline` and `storyPlan`). New scenes get numbered names (`KEN;STORY<n> SCENE`, `KEN1;STORY<n> MINI`, movie `FILM<n>` and its `POSIT` file), and each loads the summaries of the earlier scenes it refers to (`from-scene`), as `RUN` does for no-longer-kept-apart. A new cast is defined the way `ANINIT`'s `initialize-characters` defines yours: your four shapes, then a pentagon and a hexagon. `test/stories/red-riding-hood.lisp` runs through all four of its scenes, with a Kept Apart of its own (the wolf guards) and a rescue (the woodcutter guards the wolf).
  - **What new stories taught, from Ani's own code:**
    - Ani asks how a friendly character feels about each of the others in turn (`SUGEST`'s `first-sibling-that-satisfies-relationship`) without checking that the relationship exists. CINDY relates Cinderella to everyone, so it never mattered. New casts relate every pair; the editor offers to fill in missing ones as "is polite to".
    - `(convey (meets a b))` on its own suggests the display method `move-to`, which `DISPLY` never defines.
    - A mean or evil character's victim, and a friendly character's friend, are picked without checking that they are in the scene. One who isn't never comes on stage, and the scene never ends; in the page Director stops filming at 1,000 frames, 250 seconds (600 until 12 October).
  - **Saving films:** a Save button makes a video of the scene or the whole film (WebM at four frames a second, a title card before each scene, side by side when both films are shown; WebCodecs with a small WebM writer of our own, or real-time recording where WebCodecs is missing), or a film file (`.json`) that opens again in the page, with all of Ani's reasons, from Save or by dropping it on the page.
  - **The claude.ai copy:** `node tools/build-film-app.mjs --claude-artifact artifact/ani-cinderella-claude-artifact.html [--site URL]`. Its models are Claude through claude.ai and Gemini Nano. A chat artifact refuses workers, so Ani runs on the page itself, a step at a time (the page is unresponsive during each step). The code pages are linked at `--site`, or left out. To use it, upload the file to a claude.ai chat and ask Claude to copy it, exactly as it is, into an HTML artifact.
  - **The favicon:** Cinderella's turtle-drawn star on a dark TV screen. The build puts it in each page's head (`tools/page-shell.mjs`); browsers ignore an icon link in the body, which is why it didn't show at first. Inside claude.ai the tab is claude.ai's, and shows the icon chosen at publish.
  - **Small models:** Gemini Nano gets the conversation as opening prompts (as Agent Kit does), streams its answer, and is checked against its input quota. Every reply has Ken's fixed lines (`include`, `defcomment`, `declare`, `compile-actors`) written as he wrote them, and each top-level form's parentheses balanced. A draft that still can't be read says where, and opens "Ani's version" to fix it.
- **24 frames a second (9 October).** Ken's TV previews ran at 4 frames a second (`ANINIT`: `(setq :default-frames-per-second 4)`), and so does the run the thesis's flipbook shows; the film was shot at 24 (`running-color`: `(setq :default-frames-per-second 24)`, "is saved on film instead"). The YouTube transfer confirms it: its picture changes on about 21 of every 30 video frames. Director divides each movement by the frames a second, so at 24 the characters take smaller steps. `node tools/run-film.mjs --fps 24` makes the whole film that way (`reports/film/24fps/`, about 13 minutes):
  - The Introduction 917 frames (38.2 s), Kept Apart 701 (29.2 s), No Longer Kept Apart 113 (4.7 s), the Meeting 1,051 (43.8 s), Justice 458 (19.1 s). At 4 frames a second they last 48.0, 29.0, 4.3, 44.8 and 21.0 s. The thesis gives the Introduction 42 seconds.
  - Ani makes the same choices in every scene. Where the characters start each scene differs from No Longer Kept Apart on, because the two filmings leave them in different places. So the 24 and the 4 are different runs of the same plans, which may be why the film and the flipbook never match frame for frame.
  - The film page shows the 1978 film at 24 frames a second by default, with a switch to 4; playing goes by the clock, so films of either rate play side by side. Re-runs offer both (24 takes about six times as long to make). Videos are saved at the finest rate shown.
  - The page carries both runs packed (segments as changes from the frame before, in tenths of a dot; a character's dynamics only when they change): 226 KB for all ten scenes, against 600 KB for the 4-frame run alone unpacked.
- **The narration (9 October).** The 1978 film's soundtrack is your spoken narration. `bash tools/clean-narration.sh` takes out the hum, the 1,636 Hz whistle, a band near 800 Hz and the projector's 24-a-second clatter (speech now stands 9 to 15 dB above the pauses, against 4.6). `node tools/render-film-video.mjs` then `python -I tools/narrate-film.py` lay it onto our 24-frames-a-second film in color, shot by shot: you spoke a line as each shot began, and Kept Apart and No Longer Kept Apart last 29.2 and 4.7 seconds in both films. See `reports/film/README.md`.
- **Phase 9, under way (9-10 October): Chapter X as switchable extensions.** The plan, from four designs and their adversarial reviews, is `reports/chapter-x/PLAN.md`, with your decisions. Each extension is Lisp in its own `REVIVE;` file, written in your idioms so the glass box explains it; "Ani as in 1978" stays byte-identical. Stages: 0, the switch and the 1978 check; 1, MEND (repairs for the failures new stories hit); 2 and 5, APPEAR (Ani chooses shapes, sizes and colors, and changes them); 3 and 6, CHANGE (characters who change); 4, KNOW (more words, relationships, ways of showing, feelings); 7, SLIPS and DETAIL. The mini-Ani is an Agent Kit example (1.14.0 and 1.15.0, with `WHAT-THE-KIT-CAN-EXPRESS.md`).
  - **Stage 0, done.** `src/pipeline.js` has the EXTENSIONS registry, and every job boots with the chosen extensions after the bridge. `REVIVE;WRAP` wraps one of your functions once a job and notes each repair where it acted; the glass box collects the notes. `tools/check-1978.mjs` (`npm run test:golden`) checks CP 29, every program, MINI and PRINT file, CP 30, every glass box, frame, event and POSIT file, and each job's loads in order, with or without extensions, at 4 frames a second or (`--fps 24`) at 24. The page has the switch ("Ani as in 1978", the default, or with the revival's repairs), and saved films record it.
  - **Stage 1, done: MEND, fifteen repairs.** M1 to M7 as planned; M8 (two characters with nothing to compare), M9 (`wander-around`, which SCENE asks for and you never wrote), M10 (alone with no one else to send off), M11 (a can't-do task's running time), M12 (walks and turns that never end: someone keeps them waiting, or they go round without getting nearer; `tools/check-no-change.mjs` checks that walks which end on their own are left alone), M13 (two characters at one place: after a scene that shows no one, everyone starts the next at the picture's center, and a place reckoned from one towards the other divides by zero, which froze the page's worker before the first frame or overflowed the stack in pass 2; it is reckoned as your own commented-out turtle version would, straight up from the spot: stress stories `same-place` and `sent-off-unseen`), M14 (makes-fence, which DISPLY names and estimates but never gives a run receiver, set aside so Ani chooses another way, as she chose stands guard for Cinderella; and stands guard's walk across by no one, a nil Director can't run, taken out: `fence`, `guard-self`) and M15 (two characters whose goals lead to each other, a guard keeping someone away from himself, found where they stand the second time round, as your "so I dont loop" does for a goal that leads to itself: `guard-self`) were found by stress stories, reviewers and stories a model wrote. With MEND on, your Cinderella comes out byte for byte as without it, at 4 and at 24 frames a second. `test/stories/stress/` has a story for each failure, and `npm run test:stress` checks each with and without MEND against `expected.json`; every one finishes with MEND, as do the tortoise and the hare (all three scenes), Red Riding Hood (all four), and three fables written the way a model would (`test/stories/fresh/`: the Fox and the Crow, Hansel and Gretel, the Ugly Duckling, every scene). So do all fifteen stories GPT-6.1 Sol wrote on the page on 11 October (`reports/llm-trials/2026-10-11 gpt-6.1-sol/`), with MEND and APPEAR, every scene: five had stopped on makes-fence, three had hung or overflowed the stack with two characters at one place, and one of those five, once its fence was set aside, stopped on stands guard's nil and then on two goals that lead to each other. A scene can still run long: your tortoise and hare's Pushed Around ends on its own at frame 799, within the page's 250 seconds, as Director as in 1978 films it too. When Ani as in 1978 stops on a new story, the page says why and offers to make it again with the repairs; the glass box says what each did, in a sentence, with a link to its code.
  - **Still open with MEND:** a character never shown in a scene (one named only in an earlier scene's `(alone X Y)`, say) starts the next scene at the picture's center, since ANINIT's save-positions writes every character's place and one never shown is at 0.0 0.0 (aninit.65:158-175); M13 only makes it safe when two stand there. It isn't MEND's to move them: your Cinderella's own POSIT files have the fairy godmother at the center after the Introduction and Kept Apart, so changing where such a character starts would change her film; your pushes-around taking characters off the picture for long stretches (a DETAIL candidate). For SLIPS, found on the way: `pick-value-with-variety` picks the most used value at high variety, against its comment and the thesis (glosug.41:61-74); `redistribute-time-for-tasks` adjusts with the wrong sign (chomet.123:61-64); `change-to:-package` merges a change without its method (cosug.215:509).
  - **Stage 2, Lisp and pipeline done (10 October): APPEAR, Ani chooses sizes and shapes.** `REVIVE;APPEAR` (the elements size, shape-jaggedness and shape-complexity, three-valued like speed, with relative ones; appearance choice points made after the 102 by your `make-choices-until-completed`; telling characters apart; sizes .036, .05 and .07, never `weightify`'s), `APSUG` (where the suggestions come from: a table of eight words, each with its evidence, through your `process suggestions`; `dominates` suggests a greater size, as `relate.22:63` says; physical uniqueness suggests looking different, p. 94; the revival's own dynamics source, motivated by p. 175; flashiness, `glosug.41:39`, and the revival's reading of obviousness, motivated by p. 165), `SHAPES` (polygon, star and blob experts covering the nine pairs of values, p. 164, with relaxation) and `LOOKS` (Director's `take look`, through OBJECT's own `set your size`). Pass 1 keeps CP 29's 102 choices, by name, value and order, and adds 30; pass 2 writes `(ask c take look ...)` at the end of each program, which is otherwise yours byte for byte from 1978's positions.
    - Your Cinderella with APPEAR: Cinderella a small hexagon (shy and not flashy; friendly and graceful; between shy's plain and her slow movement's complex), the stepmother a large triangle (strong, p. 238, and dominating Cinderella, `relate.22:63`; mean, and unlike the smooth Cinderella and Prince; unlike the complex fairy godmother), the fairy godmother an eight-pointed star (unlike Cinderella and the Prince; magical), the Prince a large circle (strong; graceful, with smooth paths; fast). No two needed telling apart. The films are 193, 116, 19, 175 and 92 frames (yours: 192, 116, 17, 179, 84), and at 24 frames a second 918, 701, 112, 1038 and 418 (yours: 917, 701, 113, 1051, 458), the same with MEND as well, because Director's collisions use the sizes. `reports/ext/appear/README.md` explains each difference, with pictures; `npm run test:ext` and `npm run test:ext24` check those files, and `npm run test:appear` checks the knowledge against your decisions 4 and 6. The stepmother is large, as you drew her, by your own knowledge (p. 238, `relate.22:63`, p. 94).
    - Two characters drawn alike have their least justified shape choice made again, with a different-from suggestion (p. 94, p. 164); two Ani still chooses alike (twins) are kept apart by the experts, who relax her choices until the second is drawn as a shape that differs from the first's on both elements, and say so on each choice point they override. `test/appear.test.js` and `test/stories/appear-alike.lisp` show both.
    - **Review fixes (10 October).** With MEND and APPEAR both on, pass 2 stopped on any story with a (not X) on a movement element, the Fox and the Crow's every scene among them: MEND1 (and MEND2's same loop) took APPEAR's `appearance-choice-point`, a child of `absolute-choice-point`, for one of the choices pass 1 made, and asked it for its element. Both now take only the choices pass 1 made (`choice-points-pass-1-made`), which in 1978 mode is all of them, as before. `npm run test:stress` now makes each stress story, both controls and the three fresh fables a third way, with MEND and APPEAR, and all finish. A size chosen as (not X) is narrowed as MEND1 narrows a movement element's (your `pick-value-with-variety`, counts rebuilt), not read as the midpoint. The evidence labels were corrected: shabby's ragged outline and the obviousness reading are the revival's (motivated by pp. 166 and 165), the film's complexity no longer suggests a shape's complexity (p. 164 gives it to choosing among the experts' shapes, which they already do), and strong suggests large, which the review relabeled as the revival's generalization of p. 238 and dropped under your decision 4, is yours again by your decision of 11 October (`reports/chapter-x/PLAN.md`, "Decisions" 6): decision 4 drops only the revival's own entries, and yours may agree with your 1978 looks. `tools/check-appear.mjs` now judges each character and element on its own, counts your .05 as your medium, flags two of the revival's pieces that together give back one of your shapes, and runs pass 1 again without each of the revival's pieces and with only them; each flag has a recorded decision (the two dynamics rules, which together would give the stepmother your square where nothing else speaks, are kept, with why). The experts' overrides show in `appearances.json` (`drawn`, `overriddenBy`) and in `tools/run-story.mjs`'s looks; `tools/check-ext.mjs` checks that what follows your program is exactly the take-look forms.
    - **The page follows (11 October):** "How she looks" says where the look as drawn differs from Ani's choice (a (not X), or a choice the shape experts overrode) and how the experts kept twins apart, and a (not X) size's note reads as narrowed; `tools/check-film-app.mjs` expects the final looks. In color, a film with Ani's looks keeps each character's 1978 color until stage 5 (your decision 7).
  - **Stage 3, Lisp and pipeline done (11 October): CHANGE, characters who change.** `REVIVE;CHANGE` reads a change as you wrote one in cinderella-beautified, `(change (TYPE WHO OLD) (TYPE WHO NEW))`, on its own or inside `(causes X ...)`. A change on its own no longer stops every job: your `process-task-description` asked `(personality cinderella shy)` to note its part. Now the task is for the changed character, and each character a change changes notes its part (both of a relationship's). For each scene that changes someone, Ani takes a fresh look (p. 168) in an extra pass-1 job. That job is DATEST's `init` with the change made before `study-descriptor-use`, then your pass 1 again with every choice of everyone else held as it was (your decision 1). The results go to `KEN1;<fn1> BECOME`, and RUN loads that from the next scene on, so she is described and moves as she has become. A full recompute, everyone afresh, is kept for comparison only.
    - The plan's first way of holding the others was to load the CP, reset only her choice points and run `(z)`. With no change at all, that moved every character's own values (Cinderella's five). Your pass 1 makes each choice when the choices before it are made and the others aren't. So the fresh look replays your pass 1 in its own order, and `record-choice` records each of the others' choices as it was. With no change, each of the four is chosen again exactly as CP 29 has them.
    - The results: the repentant stepmother (evil and mean to good and kind) gets path-curvature low to medium, path-length medium to long, path-jaggedness medium to low, acceleration high to medium, and her three attractions turned round. Her deliberateness stays high, because the Prince is held, though the full recompute would make him more deliberate. Cinderella from shy to brazen gets speed low to medium and two attractions; the full recompute would also change three of the others' speeds and two attractions. Your shabby to elegant changes nothing, as your footnote says. In the stories (`test/stories/change-of-heart.lisp`, `socializing.lisp`), with MEND, APPEAR and CHANGE, every scene films. The stepmother of Kind Again walks with more curved, longer and less jagged paths, and no longer hurts or chases Cinderella. The brazen Cinderella of The Dance moves at medium speed, and the scene takes 61 frames instead of 258. `reports/ext/change/README.md` explains each difference and has the data the page will show. The checks: `npm run test:change`, and `node tools/check-1978.mjs --extensions change`, byte for byte with the same loaded files.
    - Your decision 8 (11 October): the new words are her initial description, "as if the character were brand new", given through your own `process initial description`, so your SUMCOM counts them when it compares her with the others. That made the stepmother's path-curvature medium; with the change as the words' source it had been high. Still to come for CHANGE: in stage 6, showing the change itself and the link to APPEAR.
    - **Review fixes (11 October).**
      - A change is made only by a task whose own description is the change, or which has it inside `(causes x ...)`, and only of a lasting description: physical, personality, movement, role-in-story or relationship.
      - A change wanted, prevented or undone (inside `wants`, `prevents` or `undoes`), in a display task, or of an emotional state is left alone, with a note on the task. Before, `(wants owl (change ...))` would have changed the owl. The outline and the page's story check say the same.
      - A relationship the story never gave is made, then changed. A change that names no character stops with that said.
      - The record and the glass box now carry: the old words she never had; the descriptions each change changed; that her looks are kept until stage 6, when Ani chooses them. Pass 2 makes so only what the fresh look changed.
      - Acceleration's thesis item is (d), p. 185.
      - `check-change` now checks two more fresh looks: made beautiful (speed medium, longer and more curved paths), and coming to love (nothing changes in how they move). In every case, after a real change, everyone else's choices are still the story's CP's.
    - **The page follows (11 October):** CHANGE is on the page's switch, with a sentence in "Which extensions". In 1978 mode a story with a change isn't made: the editor says why in a plain sentence and offers "Make it with the revival's extensions". (Made as in 1978, Change of Heart never ends and Kind Again's stepmother is as mean as before.) With the extensions, the prompt teaches the change task in the form of your cinderella-beautified, and says it shows from the next scene on; the progress shows the fresh look and the full recompute (about half a minute each in the browser); the changing scene's caption says the change itself isn't animated yet. In that scene and every later one, the changed character's glass box has "How she has changed", closed. It opens with a sentence made from the fresh look ("In Change of Heart the Prince made the stepmother good and kind, no longer evil and mean; from Kind Again on her path curves more, her curves are longer and her path is smoother"). Then comes a table of her twelve elements before and after, grouped: Director's, pass 2's, and those Director doesn't use, as in 1978 (p. 186). Each "why?" opens the fresh look's choice point, labeled "Ani's fresh look after Change of Heart". One click away are what was held and the full recompute's knock-ons (your decision 1). "How she moves" says which values the fresh look made so, and a scene's personality task lists her words as she has become. Saved films and the browser's copy carry the fresh looks. `tools/check-film-app.mjs` makes change-of-heart in the page (107, 71 and 28 as the last frames, as in Node) and checks all of this.
  - **Stage 4, Lisp and pipeline done (13 October): KNOW, the knowledge you could have added.** `REVIVE;KNOW` and five parts, each in the idiom of the file of yours it extends and read in once that file loads, each piece with its evidence or a `;;why:` line with the revival's reason (your decision 4): KNOWDS, words, as DSCRP (gentle and rough, nervous and calm, cheerful and gloomy, clever, brave and cowardly, curious, playful, old and young, slow and quick, each pair one word with suggestions and its opposite taking them reversed; timid, wicked and cruel, neighbors of shy, evil and mean with none of their own); KNOWRL, relationships, as RELATE (dislikes and fears; ways of showing is-obedient-to by following, is-helpful-towards by helping, and your PREREQ's likes by accompanying); KNOWCV and KNOWDI, ways of showing, as CONVEY and DISPLY (helps by helps-along, avoids by moves-away-from, and a new follows by follows-behind, each made of DISPLY's and PLACE's parts, bringing on with MEND6's step and counting it in its estimate); KNOWEM, feelings, as EMOTE (pride, anticipation, loneliness, fear and anger, at a joy-like level or a plain one, as your pre-meeting scene writes them). A word with no way of showing itself borrows its neighbors', at the same strength (dscrp.17:183). kills is left out: Ani has no notion of a character leaving for good. KNOW requires MEND. `tools/know-index.mjs` indexes every piece with its file, line and reason, and the words with their links as DESCRIPTOR spreads them, for the page (`DATA.know`). See `reports/ext/know/README.md`.
    - Your Cinderella with KNOW: pass 1 is byte for byte 1978's, reasons too; `test/know.test.js` checks the rule that keeps it so on the live, spread links (timid, wicked, cruel and dislikes are linked to CINDY's words, and none has suggestions of its own). In pass 2, the Introduction: Cinderella follows her stepmother (her is-obedient-to, where Ani had "no idea how", p. 65) and helps the Prince (friendly's helping, which Ani "canceled" in 1978), and the Prince is brought on in her helping. Six tasks share the scene's 30 to 75 seconds where five did, and the pushing, no longer first in its sequence (your give-every-task-its-ideal-time-1 gives the first the whole of its ideal time), is held to its share: four quicker pushes in 12.5 seconds, where there were five in 24.4. Kept Apart: the stepmother's pride (cindy.46:72), passed over in 1978, conflicts with her joy's speeding her up (your COSUG, as MEND7 repairs it), so she keeps her speed, and her paths are a fifth less jagged. The other three scenes are planned as in 1978. The films: 190, 116, 19, 175 and 84 frames (yours 192, 116, 17, 179, 84); at 24 frames a second 1037, 701, 111, 1041 and 485. `npm run test:know` and `test:know24` check them against `reports/ext/know/`.
    - Every stress story, both controls and the fresh fables film every scene with the page's set, MEND, APPEAR, CHANGE and KNOW, now a fourth way in `npm run test:stress`; three new stories (`know-words`, `know-feelings`, `know-ways`) use every piece. The model's fifteen stories: every scene ends with KNOW, and it changes the plan of 8 of 61 scenes, 7 of them to show helping (`reports/ext/know/trials.md`).
    - Found on the way: a story's scene or character named like one of your PREREQ actors (friends, enemies, strangers, difficult, ...) stops pass 2 once PREREQ loads and redefines it, as a model's Lion and the Mouse did in its scene Friends when KNOW's methods named can-move; KNOW's methods now name no prerequisite, as goes-to-and-accompanys names none, but the clash can still happen with your own move-to-each-other or stands-guard, in 1978 too. An open item for MEND or the page's story check.
    - **The page follows:** the knowledge's marks in the glass box, KNOW's words and feelings in the prompt and the editor when the extensions are on, and the activities' plain sentences.
  - **Stages 0 and 1 done (9 October).** Stage 0: the `EXTENSIONS` registry and `extensions` option in `src/pipeline.js`, `REVIVE;WRAP` (wrap one of your functions once per job, and note a repair), `--extensions` on the tools, and `tools/check-1978.mjs` (`npm run test:golden`); the page's switch is still to come. Stage 1: MEND, `REVIVE;MEND1` to `MEND8`, each repair leaving a `(revival-repair: ...)` note where it acted. M8, an empty comparison for two characters with nothing to compare, is new: the no-descriptors story showed pass 1 stops there. With MEND, all eight stress stories in `test/stories/stress/` film, each under 600 frames (its README has each story with and without MEND), and `check-1978 --extensions mend` finds your Cinderella byte for byte as in 1978. Still open, outside MEND: `wander-around` (left to CHANGE), Red Riding Hood's circling pushee, a can't-do task's NIL running time, and a stack overflow in INTERF's `move-from-xy-position-1` (listed in that README; all four since repaired, by M9, M12, M11 and M13).
- **The site (9 October):** https://toontalk.github.io/ani/, the ToonTalk/ani repository (in `Documents\GitHub\ani`), served by GitHub Pages from `main`. `node tools/build-site.mjs <folder>` builds it: the film page as `index.html`, the code and choice-point pages, and the claude.ai copy with its code links pointing at the site.
  - **Publishing:** a private claude.ai artifact, https://claude.ai/artifact/Mzd3BBMGbn9Qs2AcyojhmM: the film page, with the code and choice-point pages beside it. It declares `sample`, so a new story is drafted by Claude on the viewer's own account with no key, and `downloads`, for saving films; the page runs Ani in a worker there. The bundled pages carry only code and the film description; every comment and string in the bundled files was read before the first publish. It is shared from the page's Share menu. The claude.ai chat copy is `artifact/ani-cinderella-claude-artifact.html`, and is also on the site.

## In brief

- **Ani's own code survived.** All 31 files that the 1979 tags table lists for Ani are on tape 7005017, whose directory listing is dated 8 January 1979, four days before you submitted the dissertation. That's about 10,000 lines (383 KB), which matches the thesis's "66 blocks for Ani herself." The Cinderella film description (`CINDY 46`) is there too.
- **So did her answers.** `CP 29` is the file pass 1 wrote for pass 2: 102 choice points, 54 relative and 48 absolute, the exact counts in Appendix III. `RUN24 2` (tape 9004336, August 1979) records the same 102 choices with the suggestions and sources behind each. Together they give us an exact test: given `CINDY`, revived Ani should make the same 102 choices.
- **Part of Director is missing.** Ani is written in Director. The Director files in your `KEN;` directory survived. So did `KEN1;DRECT`, the Lisp primitives Director is built on, hidden in an Emacs save file (`}^RSV 6`). The rest of `KEN1;` is lost: about 20 files, including `MACROS`, `UTIL`, `CMATCH`, `PROP`, and the actor compiler. The tags table names every function in them, but their code is gone.
- **The approach:** run your original code. Build a small MacLisp in JavaScript and load the surviving Director and Ani files into it unchanged. Rebuild only the missing `KEN1;` pieces, in MacLisp. The Director Guide, the macro-expanded Director files, and the compiled FASLs tell us what those pieces must do. Matching `CP 29` tells us when we've got them right.

## What survived

| What | Where | Notes |
|---|---|---|
| Ani: 31 source files | tape 7005017 | Every file in `READ-ANI-TAGS` (in `LOAD 33`) except `METHOD`, which the 1979 tags table doesn't list either (probably obsolete). 28 also have compiled FASLs. |
| Film description | `cindy.46` (7005017), `cindy.49` (9004336) | Appendix I |
| Pass-1 output | `cp.29` | 102 choice points: 54 relative + 48 absolute |
| Pass-1 output with justifications | `run24.2` (9004336) | Each choice with its suggestions, strengths, and sources, plus 91 `VERSION-OF` entries |
| Ani's driver files | `datest.56` (pass 1), `run.65` (pass 2), `aninit.65` (running Ani's output in Director) | Show exactly how the passes were run and the files they exchanged |
| Director (`KEN;` files) | `some.666`, `object.401`, `screen.86`, `movie.153`, `poly.29`, `actcom.17`, `lisp.7`, `load.33`, `declar.67`, `decla2.186`, `dump.44` | |
| Director's Lisp primitives | `}^rsv.6` = `KEN1;DRECT` | Recovered from an Emacs save file |
| Macro-expanded Director | `some.lisp`, `object.lisp`, `movie.lisp`, `poly.lisp`, `screen.lisp` | Director compiled to plain MacLisp; shows exactly what the lost macros generated |
| Older and later Director | 3100153 (late 1976): `direct.133`, `dl.140`, `inter.171`, `turt.426`, `fwnew.53`. 9004336 (Aug 1979), including the Lisp Machine versions. | Evidence for rebuilding lost pieces |
| Tags tables | `ken.tags` on several tapes | Every definition in every file, including the lost ones |
| Director Guide | AIM-482 (June 1978) on DSpace | What Director's constructs mean, from the programmer's side |
| TV turtle (LLOGO) | public: PDP-10/its `src/llogo/tvrtle.542` | The graphics layer Director drew with |
| Thesis | `AITR-540 (1).pdf` | OCR text is noisy but usable; the page images are clean |
| The film | "Cinderella 1978" on YouTube | The visual reference |

## What is missing

- **The `KEN1;` Director runtime**, about 490 definitions in all:

  | File | Definitions |
  |---|---|
  | `MACROS` | 85 |
  | `UTIL` | 66 |
  | `CMATCH` | 45 |
  | `INSTAN` | 35 |
  | `DL` | 31 |
  | `TUTIL` | 27 |
  | `COMP` | 25 |
  | `REAMAC` | 23 |
  | `INTER` | 23 |
  | `INCOMP` | 20 |
  | `PROP` | 20 |
  | `FWUSE` | 18 |
  | `RDTAGS` | 16 |
  | `HMAC` | 12 |
  | `MEMORY` | 12 |
  | `TRACE` | 10 |
  | `FWMAKE` | 8 |
  | `EXPMAC` | 7 |
  | `COLIDE` | 7 |
  | `CMOVIE` | 4 |

  About 60 of these have a same-named earlier or later version on another tape. `RDTAGS` is public in the ITS repository (`libdoc;rdtags byron2`).
- **Not all of it matters in a browser.** `COMP`, `INCOMP`, `CMATCH`, `EXPMAC`, `HMAC` and `CMOVIE` mostly compile actors and movies into Lisp for speed. The thesis calls this "efficient compilation." An interpreter can skip them, provided message sending behaves the same way.
- **The intermediate files from the 1979 run:**
  - the five scene programs Ani wrote for Director (`(KEN) KEPT APART`, …)
  - the scene summaries (`KEN1; KEPT MINI`)
  - the end-of-scene positions (`INTRO POSIT`, …)
  - the compiled movies (`INTRO FASL`, …)
- **The color turtle,** `LLOGO;COLORT`.

## Approach

**A. Emulate the language (chosen).** Write a MacLisp interpreter in JavaScript, plus a Canvas emulation of the Knight TV and the color frame buffer. Your original Director and Ani files load on top, unchanged.
- *For:* it really is Ani, it runs in any browser, and every choice can be inspected.
- *Against:* the lost `KEN1;` runtime has to be rebuilt, and proven against `cp.29`.

**B. Emulate the machine (not planned).** Run ITS on the KA10 emulator with MacLisp and the Knight TV emulator. All of these exist today in the PDP-10/its project.
- *Blocker:* Ani's compiled code needs the same lost runtime.

**C. Rewrite (possible later, as Phase 8).** A modern Ani, written to explore the thesis's ideas further rather than to preserve the 1979 code.

**Keeping A and C open:**
- Reconstruct the missing `KEN1;` files in MacLisp, not JavaScript. The JavaScript layer is then just "MacLisp plus the TV hardware," a well-defined target. Everything above it is Lisp.
- As each part of Ani starts working, write up how it works in `HOW-ANI-WORKS.md`, with pointers into the code. Topics include:
  - suggestions and their sources
  - combining suggestions and resolving conflicts
  - choice points, postponement and the focus
  - methods for establishing, conveying and displaying
  - planning activities and qualitative numbers

  That document, together with the glass-box traces, becomes the specification for a modern Ani if we go to Phase 8.

```
app: film player, glass-box inspector, source browser, description editor   HTML/JS
Ani: 31 original files, unmodified (any patches go in a separate file)       MacLisp
Director: surviving KEN; files + reconstructed KEN1; files                   MacLisp
MacLisp interpreter + ITS file system shim + TV turtle on Canvas             JS
```

## Phases

Each phase ends with something you can look at.

### Phase 0: Set up and take inventory
- Put this project under git. Copy the relevant archive files into `original/` with their provenance (tape, ITS name, version), and never modify them.
- Get the sources:
  - the Director Guide (AIM-482, June 1978), plus AIM-482B (December 1979) to see what changed afterwards;
  - the 1976 working paper on Director (WP-120) and "Making Aesthetic Choices";
  - page images of the thesis appendices;
  - frames from the YouTube film.
- Cross-reference every function called in Ani and the surviving Director against where it's defined. The result is the exact list of what's missing, with call sites. That list is the specification for the rebuild.
- Work out how the binary files (FASLs, ITS directories) were packed on disk. Ani's FASLs were compiled with the lost macros, so they preserve what those macros produced for Ani's own code.
- *Deliverable:* `INVENTORY.md` and the cross-reference report.

### Phase 1: MacLisp in the browser
- **Reader:**
  - ITS syntax: `/` as the escape character, `|…|` symbols, `ibase` (your `LISP 7` sets decimal), and trailing-dot decimal numbers.
  - The `REAMAC` read macros that Ani uses everywhere: `'` acts like backquote, with `,` and `!,` inside it. The macro-expanded `.lisp` files show what these produce.
- **Evaluator:**
  - MacLisp's dynamic binding, fexprs and lexprs (`(defun run n … (arg 1))`), and `macro` definitions.
  - Property lists, `status`/`sstatus`, `catch`/`throw`, `do`/`prog`, flonum arithmetic (`*$`, `-$`), and `explode`/`implode`.
  - An ITS file system shim for `load`, `include`, `probef` and `open`, covering the files the passes write.
- **Where it runs:** in Node for fast headless tests, and in the browser.
- *Done when:* `DECLAR`, `DECLA2`, `LISP` and `LOAD` load cleanly.

### Phase 2: Director
- Load `DRECT`, `SOME`, `OBJECT`, `SCREEN`, `MOVIE`, `POLY` and `ACTCOM`.
- Rebuild `KEN1;` in MacLisp, one file at a time, in the tags table's order.
  - **The primary source is the compiled code in `TS D2500`**, a Director saved on 5 January 1980. It covers most of `MACROS`, `UTIL`, `CMATCH`, `DL`, `TUTIL` and `PROP`. Each function is decompiled from its PDP-10 listing back into Lisp.
  - Some calls in the listings still show as bare link-table addresses. The first step is to resolve those to function names.
  - The image is eleven months newer than the Ani code. Where it might differ, the 1979 evidence decides: call sites, the expanded `.lisp` files, the FASLs, and the June 1978 Director Guide.
  - `MEMORY`, `COLIDE`, `FWMAKE` and the compiler files aren't in the image. Those are rebuilt from the other evidence.
  - Each definition cites its evidence.
  - Compilation forms (`compile-actors`, compiled `ask`) become plain interpretation.
- **TV turtle:**
  - Port the primitives Director uses (`hatch`, `useturtle`, `maketurtle`, `tvsize`, `pencolor`, `scale`, `clearscreen`, …) to Canvas, checking each against the TVRTLE source.
  - Emulate the Knight TV (about 576×454, 1 bit per pixel) and the 4-bit color frame buffer.
- *Done when:* Director's own demos run from your original code. For example, the `ANIMA` scenes that `director-demos.html` translated by hand in February.

### Phase 3: Ani makes her choices (pass 1)
- Load Ani's files in `READ-ANI-TAGS` order, then `CINDY`. Run pass 1 the way `DATEST` did (`init`, `z`, `save-answers`).
- Compare the output against `cp.29`, and the suggestions against `run24.2`.
  - Each mismatch points to a Director behavior we got wrong, such as method order, inheritance, or `:insert-methods-at-end`.
  - Ani makes no random choices, so the match should be exact.
- *Done when:* all 102 choices match. The first glass-box view comes with this phase: a browsable list of choice points, each with its suggestions, sources, conflicts and postponements.

### Phase 4: Ani plans the scenes (pass 2)
- Run `RUN` for each scene: subtasks, subscenes, values, plans, then "send yourself to Director."
- Pass 2 alternates with Director. Each scene is planned from where the characters ended up when Director ran the previous scene (the `POSIT` files). So the pipeline runs: plan scene 1, run it, save positions, plan scene 2, and so on.
- *Done when:*
  - `(subscene-of kept-apart 1)` matches Appendix VI;
  - the actor counts are close to Appendix III (418 at the start of pass 2, and 154 new ones);
  - the plans read like Chapter II.

### Phase 5: The film
- Run Ani's scene programs in Director, extended with `INTERF`, `ACTION`, `DICHAR`, `DISACT`, `PLACE` and `ANIMOV`. That extension provides:
  - the tick-based simulation, collisions, and stop conditions;
  - conversion of qualitative numbers ("a little bit," "upper far right") into screen coordinates.
- Use color mode as it was filmed: 550×413, with Cinderella a green star, the stepmother red, the prince yellow, and the fairy godmother orange.
- Play at 24 fps, as on film, or at 4 fps, the speed of the 1979 previews. Export to video.
- *Done when:* all five scenes play and look like the YouTube film. For example, in the stepmother's "standing guard," Cinderella heads for the prince six times and is blocked each time.

### Phase 6: A web app that shows Ani thinking
- **Default view:** the film, with the film description beside it and minimal controls.
- **Glass box:**
  - Click a character at any moment to see its activity, the `why` behind it, and the choices behind its dynamics.
  - Click a choice to see its suggestions, sources, conflicts and postponements. This is the same information Ani wrote into her `print memory` justification files.
- **Edit and rerun:** change the film description (for example, make the stepmother kind), run Ani again, and compare the two films side by side.
- **Source viewer:** the original code, with cross-links.
- **Publishing:** a single page for toontalk.github.io/AI/apps, and a claude.ai artifact if it fits. Only code and the film description are bundled; nothing from your email or letters.

### Phase 7: New stories
- An LLM drafts a film description from a plain-English story, using only the vocabulary Ani knows:
  - characters' physical traits and personalities (`DSCRP`)
  - emotional states (`EMOTE`)
  - relationships (`RELATE`)
  - what can be conveyed or displayed (`CONVEY`, `DISPLY`)
  - scene settings such as mood, rhythm and length
- Words Ani doesn't know get flagged, not silently dropped. Ani then makes the film, and the glass box shows how she read the description.
- This is a modern take on thesis section X.E, "Self-Generated Film Descriptions." It also shows quickly where Ani's knowledge runs out.

### Phase 8 (possible): A modern Ani for exploring the thesis's ideas
- Write it once the original is running, using `HOW-ANI-WORKS.md` and the glass-box traces as its specification.
- Check it against the original on Cinderella, then extend it in directions from Chapter X:
  - critics and criticism
  - changing appearances
  - controlling the camera
  - a bigger and better knowledge base
  - sound or dialog
  - non-narrative animation
- We decide on this after Phase 6.


### Phase 9: Chapter X as switchable extensions
- The plan: `reports/chapter-x/PLAN.md`, with the four designs and their reviews beside it.
- Items from Chapter X: Ani chooses appearances (A.1); appearances change during a film (A.2); characters change (A.3); a bigger and better knowledge base, and attention to details (item 4). Critics and criticism, and how Ani evolves, wait; a general theory of aesthetics is out of reach.
- A mini-Ani for the Agent Kit, as an example society of program agents with films in Logo.
- *Done when:* each stage's extension can be switched on in the page, the glass box explains what it did, and with every extension off `tools/check-1978.mjs` still finds the 1978 film exactly.
## Tests we can trust

1. `cp.29`: exact.
2. `run24.2`: suggestions and their sources.
3. Thesis Appendix VI: a verbatim piece of pass-2 output.
4. Thesis Appendix III: counts of decisions, actors, and files written.
5. Thesis Chapter II and section I.C: what happens in each scene, and how the stepmother's speed was chosen.
6. "Cinderella 1978" on YouTube: timing, positions, and what the characters do.
7. The flipbook in the thesis's page corners (`sources/flipbook/`): another complete run of the film, 574 frames, whose Introduction lasts the thesis's 42 seconds.

## Risks

- **The rebuild might not be exact.** The lost `MACROS`, `CMATCH` and `UTIL` decide how a message finds a method. If that's subtly wrong, Ani makes different choices.
  - Mitigation: four independent kinds of evidence: the Director Guide, the expanded `.lisp` files, the FASLs, and the surviving call sites. The `cp.29` comparison catches errors early.
- **MacLisp traps.** Each gets its own test:
  - `/` as the escape character, and octal as the default base
  - `eq` on numbers
  - destructive `sort`, `nconc` and `delete`
  - property-list order
  - how floats print
- **Order sensitivity.** The order in which methods are tried affects Ani's choices, so the rebuild has to reproduce it exactly.
- **Pass 2 depends on the simulation.** Small numeric differences in where characters stop could change later scenes' plans. We aim to match Appendix VI exactly and the YouTube film in spirit.
- **Display details.** TVRTLE's own source settles how lines are drawn. A few things remain guesses (its fill routine, and the PDP-11 drawing modes Director didn't use); `reports/TV-TURTLE.md` lists them. The film and the flipbook help, though their quality limits fine comparison.

## Still to settle

- Whether the 24-frames-a-second run matches the YouTube film (a different run from the flipbook's) scene by scene; its animation runs about two minutes, then 35 seconds of titles ("Ken Kahn, Friday October 13, 1978").
