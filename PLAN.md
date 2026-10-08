# Reviving Ani: plan

*8 October 2026. Ani is the animation system from your thesis (AI-TR-540, 1979). This plan brings it back from the files recovered from the MIT AI Lab tapes in `Documents\MIT-AI-Lab`.*

## Decisions (8 October)

- **Approach:** run your original code first (approach A below). Depending on how that goes, we may later write a modern Ani (approach C) to take the thesis's ideas further. Phase 8 covers that.
- **Lost files:** you're fairly sure the tapes held nothing more, so we rebuild the missing `KEN1;` runtime from the evidence. The Director Guide is our main specification: AIM-482, June 1978, [on DSpace](https://dspace.mit.edu/entities/publication/c9fbfdd3-d7b8-4e09-adea-2e837c51fdff). It's the version closest in time to the Ani code (February 1979).
- **The film:** ["Cinderella 1978" on YouTube](https://www.youtube.com/watch?v=ji7lL9wRTT4). It's poor quality, but it's what the revival should look like.
- **Extras:** the glass-box view, editing a film description and running Ani again, and new stories via an LLM. The diagram maker is out.
- **The emulated PDP-10:** not planned.

## In brief

- **Ani's own code survived.** All 31 files that the 1979 tags table lists for Ani are on tape 7005017, backed up around 5 February 1979, three weeks after you submitted the dissertation. That's about 10,000 lines (383 KB), which matches the thesis's "66 blocks for Ani herself." The Cinderella film description (`CINDY 46`) is there too.
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
  - Each definition cites its evidence: the Director Guide, an expanded `.lisp` file, the FASL, an older version, or its call sites.
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

## Tests we can trust

1. `cp.29`: exact.
2. `run24.2`: suggestions and their sources.
3. Thesis Appendix VI: a verbatim piece of pass-2 output.
4. Thesis Appendix III: counts of decisions, actors, and files written.
5. Thesis Chapter II and section I.C: what happens in each scene, and how the stepmother's speed was chosen.
6. "Cinderella 1978" on YouTube: timing, positions, and what the characters do.

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
- **Display details.** We don't know exactly how TVRTLE drew, for example XOR mode and filled stars. The YouTube film helps, though its quality limits fine comparison.

## Still to settle

- Permission to download the Director Guide PDFs from DSpace (AIM-482, 3.4 MB; AIM-482B), and to download the YouTube video to extract frames for comparison.
- Where the finished app should live: toontalk.github.io/AI/apps, a claude.ai artifact, or both.
