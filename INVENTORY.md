# Inventory

*Phase 0, 8 October 2026: what was recovered, what it is, what's missing, and where everything lives in this project.*

## Project layout

| Path | What |
|---|---|
| `original/` | Byte-for-byte copies of the recovered files, by tape. `MANIFEST.json` lists each file with its tape, ITS name, size and SHA-256. 502 files are here; 34 personal files were left out (email, letters, résumés, a travel plan, lists of talks), and the manifest lists them. The archive in `Documents\MIT-AI-Lab` is untouched. |
| `src/its/text.js` | Decodes the tape files (see "Text files" below). |
| `src/maclisp/reader.js` | The MacLisp reader, with Director's read macros. This is the start of Phase 1. |
| `src/sources.js` | Which files are Ani, her drivers, Director, and the 1979 run outputs. |
| `tools/` | `copy_originals.py`, `xref.mjs` (cross-reference), `readall.mjs` (reads every file), `oracle-compare.mjs`, `render_pages.py`, `winocr.ps1`, plus the binary-format tools. |
| `reports/` | `XREF.md` and `xref.json` (the cross-reference), `tvrtle-names.txt`, `BINARY-FORMATS.md`, FASL dumps, directory listings. |
| `sources/` | The Director Guides, the thesis OCR text, and frames from the film. See `sources/README.md`. |
| `test/` | Reader tests (`npm test`). |

## The tapes

| Tape folder | Latest date | What matters on it |
|---|---|---|
| 7005044 | Dec 1975 | LLOGO-era animation (`ANIMA`), faces, early turtle code, an archive of Logo papers |
| 3100153 | late 1976 | Early Director (`DIRECT 133/134`, `DL 140`, `INTER 171`, `TURT 427`, `FWNEW 53`, `ACTORS 6`), papers, the thesis proposal and story archives |
| **7005017** | **5 Feb 1979** | **All of Ani's source, Director's `KEN;` files, `KEN1;DRECT` (as `}^RSV 6`), the 1979 tags table, `CP 29`** |
| 7008432 | Jun 1979 | Source of the IJCAI paper "Making Aesthetic Choices" |
| 9004336 | Aug 1979 | Later Director (`SOME 1005`, `PERFOR 685`, `MOVIE 214`, `POLY 53`), Lisp Machine versions, `CINDY 49`, `RUN24 2` |
| 701431, 701501 | 1980 | "How to Program a Society" (`DIANI 103`), the tags table from when Director lived in `DIRECT;` |
| 7008321 | Nov 1980 | Your listing of which `KEN;` files were on which backup tapes (`ONTAPE 1`); it lists no `KEN1;` files |
| 7006808, 7006812, 7006813, 7006885 | undated | Miscellaneous |

The dates come from email headers and notes on each tape. The ITS directory listings give exact file dates (see "Binary files").

## Text files

The conversion stored each 36-bit PDP-10 word in 5 bytes:

- If the word's last bit (bit 35) is 0, it's written as five 7-bit groups, so ASCII text reads as plain bytes.
- If bit 35 is 1, it's written as `0xF0 | (top 4 bits)` followed by the remaining 32 bits.

Text files also had CR LF turned into LF.

`src/its/text.js` undoes this. The text is intact. The few "garbled" spots are words with bit 35 set, written in binary form, and they decode cleanly:

| File | Decodes to |
|---|---|
| `SUGCON 26` | `add-prerequisites-…` |
| `INTERF 149` (2 words) | `keep-on-stage?` |
| `PLACE 45` | `forget` |

The reader reads every Ani file, the three driver files, all the surviving Director files, and the macro-expanded files. Only two files fail:

- `DIAGRM 92` has an unfinished edit at line 514 (`(a`), so its parentheses don't balance. The diagram maker isn't needed.
- `LISPM 35` is Lisp Machine code, which uses a different syntax.

## Ani

All 31 files from `READ-ANI-TAGS` (tape 7005017). The code sometimes calls itself "Dani" or "Dot Ani."

| File | Lines | FASL | What it does |
|---|---|---|---|
| `sugrel.54` | 145 | yes | Collects suggestions from relationships and comparisons |
| `sugest.123` | 413 | yes | Collects and combines suggestions for establishing personality, emotional states and relationships |
| `emote.9` | 74 | yes | The emotions, with their suggestions |
| `dscrp.17` | 298 | yes | Character descriptors (physical, personality), with their suggestions |
| `relate.22` | 116 | yes | Relationship descriptors, with their suggestions |
| `csumry.12` | 103 | yes | Comparisons as a source of suggestions |
| `film.17` | 73 | yes | Default values for any film |
| `scene.9` | 558 | yes | Scenes, subscenes and their tasks |
| `elemnt.1` | 198 | yes | Elements (speed, path curvature, …), values and comparisons |
| `char.2` | 174 | yes | Characters and their descriptors |
| `cindy.46` | 183 | | The Cinderella film description (thesis Appendix I) |
| `cosug.215` | 960 | yes | Collects suggestions from a character's descriptors and combines them, noting conflicts |
| `compar.69` | 164 | yes | Compares characters, looking for strong differences or similarities |
| `sumcom.53` | 129 | yes | Summarizes the comparisons |
| `glosug.41` | 155 | yes | Global suggestions ("bigger is flashier") |
| `choose.198` | 605 | yes | Chooses values from suggestions and conflicts |
| `cpoint.87` | 118 | yes | Choice points, absolute and relative |
| `chocho.19` | 82 | yes | Chooses which choice to make next |
| `nodes.38` | 133 | | The node structure that orders the choices |
| `postpo.28` | 105 | yes | Decides whether to go on with a choice or postpone it |
| `chomet.123` | 622 | yes | Chooses among methods for establishing, conveying and displaying |
| `convey.64` | 255 | yes | Suggestions for conveying things |
| `sugcon.26` | 116 | yes | Collects convey suggestions and makes sense of them |
| `disply.311` | 1132 | yes | Display methods ("change:", "makes-fence", …) |
| `prereq.19` | 137 | yes | Prerequisites and "best-when" |
| `action.152` | 398 | yes | Runs in Director: runs her plans and subscenes |
| `animov.21` | 90 | | Projects Ani's movies |
| `interf.149` | 944 | yes | The interface to Director: symbolic positions, qualitative numbers |
| `dichar.103` | 526 | yes | Director characters and their stand-in appearances |
| `disact.7` | 93 | yes | Display actions such as walking and hitting; initial dynamics |
| `place.45` | 561 | yes | Placing characters; estimating how long methods take |

Notes:

- `METHOD`, which `LOAD 33` also lists, is on no tape and not in the 1979 tags table. It was probably folded into `CHOMET`.
- Six functions are called but defined nowhere:
  - `do-as-if-you-were` (21 calls) is a Director form, probably a macro from the lost `MACROS`.
  - `maintain-value-assoc-list` is called by `SOME`.
  - `complain` is an old Director utility; versions exist in the 1975–76 files.
  - `non-trivial-pattern?`, `amount-relationship` and `explore-method-suggestions` sit on rare paths in `CHAR`, `COSUG` and `CHOMET`. They may be dead code.

  Phase 3 will show whether any of them are actually reached.
- Ani's driver files:
  - `DATEST 56` runs pass 1: `init`, `z`, `save-answers`.
  - `RUN 65` runs pass 2 for one scene: it loads `CP`, collects subtasks, chooses subscenes and values, loads the previous scene's end positions, plans, and saves.
  - `ANINIT 65` runs Ani's scene programs in Director and films them, with the color settings.

## Director

**Survived (`KEN;`):** `SOME 666` (the root actor), `OBJECT 401`, `SCREEN 86`, `MOVIE 153`, `POLY 29`, `ACTCOM 17`, `LISP 7`, `LOAD 33`, `DECLAR 67`, `DECLA2 186`, `DUMP 44`, `TV2R 8`. Also `KEN1;DRECT`, Director's Lisp primitives, recovered as `}^RSV 6`.

**Lost (`KEN1;`):** the tags table lists 507 definitions in 20 files that didn't survive. The surviving code calls 110 of them directly. Those 110 are the core of the rebuild; the rest are used inside the lost files or not at all by Ani.

| Lost file | Names called | Call sites | Notes |
|---|---|---|---|
| `MACROS` | 43 | 2598 | `ask` alone has 1281 call sites. Also `first`/`rest`/`second`/`third` (macros), `ask-if-exists`, `ask-old`, `ask-each`, `name-of`, `actor-of`, `parent-of` |
| `UTIL` | 33 | 221 | `shouldnt-happen` (95), `warning`, `union`, `replaceprop`, `ask-if`, `set-minus`, `shut-up`, … |
| `DL`, `CMATCH`, `INCOMP`, `PROP`, `TUTIL` | 4–5 each | 5–8 each | display startup, pattern matching, property lists, `thingup`/`thingdown` |
| `TRACE`, `COMP`, `FWUSE`, `REAMAC`, `HMAC`, `EXPMAC`, `INTER`, `CMOVIE`, `RDTAGS` | 1–3 each | 1–3 each | |

`reports/XREF.md` has every name, with its first call site and the evidence available. The evidence for rebuilding comes from several places:

- **The Director Guide** (AIM-482, June 1978): what each construct means.
- **The macro-expanded files** (`SOME LISP`, `OBJECT LISP`, …):
  - the compiled method names (`SOMETHING-RECALL-1`), their `METHOD-PATTERN` properties, and the value cells for variables;
  - how actors are recorded (`PLACE-ACTOR-ON-NAME` … `DIRECTOR-SYMBOL-FOR-ACTOR`);
  - what `ask` became (`COMPILED-ASK`, `RUN-METHOD`, `INSERT-RECEIVE`, …).
- **The FASLs.** They were compiled with the lost macros, so they hold what those macros generated.
- **Older and later versions** on other tapes.
- **`DECLA2 186`**, which declares the special variables and the argument conventions of many runtime functions.

**Director's read macros**, all confirmed by the expanded files:

| Written | Means |
|---|---|
| `,x` | evaluate `x` |
| `` `x `` | the value of variable `x` |
| `!x` | splice `x` in |
| `{and …}` | compound pattern (and) |
| `{or …}` | compound pattern (or) |
| `#x` | evaluate `x` at read time |

Ken's compiler and Lisp init files set the input radix to decimal (`KEN COMPLR`: "thats the way I like it").

**TV turtle:** Director and Ani use 30 TV turtle primitives (`hatch`, `useturtle`, `maketurtle`, `tvsize`, `pencolor`, `wf`, `circle`, `scale`, `clearscreen`, …). All are defined in LLOGO's `TVRTLE 542`, which is public in the PDP-10/its repository. `reports/tvrtle-names.txt` lists the 336 names it defines.

## The 1979 runs (test oracles)

**`CP 29`** (tape 7005017) is pass 1's output, on the same tape as the code. It has 102 choice points: 54 relative and 48 absolute, matching Appendix III. It agrees with the thesis's worked example in section I.C.1: a high speed for the stepmother.

**`RUN24 2`** (tape 9004336) is a later run. It has the same kinds of choice points, plus each choice's suggestions and their sources, plus 91 `VERSION-OF … IN (CP TEST)` entries from an intermediate run.

`node tools/oracle-compare.mjs` compares the two:

- **They agree on 78 of the 102 choices.**
- **13 absolute choices differ:**
  - the stepmother's activity and rhythm;
  - the fairy godmother's speed, activity, rhythm, acceleration and curvature;
  - the prince's speed, activity, rhythm, acceleration, deliberateness and curvature.
- **11 relative choice points involve different pairs of characters.**
- **Conclusion:** `CP 29` is the target for the February 1979 code. `RUN24 2` reflects later changes, perhaps `CINDY 49` or edits to the code after February. Its suggestions are still valuable for the glass-box view and for checking the reasoning.

**Thesis pages.** The PDF page number equals the thesis page number:

| Pages | What |
|---|---|
| 11–61 | Chapter I |
| 20–43 | How Ani makes films, with the stepmother's speed worked through |
| 62–71 | Chapter II: the five scenes of the film |
| 244–249 | Appendix I: the film description (matches `CINDY 46`) |
| 250–258 | Appendix II: running the film; the interface between Ani and Director |
| 259–263 | Appendix III: time and memory statistics |
| 264–268 | Appendix IV: descriptors |
| 269–271 | Appendix V: representation of suggestions |
| 272–276 | Appendix VI: code written by Ani |

## The film

**"Cinderella 1978"** (`G:\My Drive\Old films, videos, and animations\Cinderella 1978.mp4`): 2 minutes 36 seconds, 1080×1080, 30 fps. The animation runs for about the first two minutes. The titles come at the end:

- "Cinderella," Ken Kahn, Friday, October 13, 1978
- "Shapes, Colors and Sound": Kenneth Kahn
- "Animation by Ani"
- "Ani by Kenneth Kahn"
- "Thank you MIT AI Lab and IBM"

**The characters as they look in the transfer:**

| Character | Looks like | `ANINIT` says |
|---|---|---|
| Cinderella | a pale blue-white star | green |
| The stepmother | a red square drawn with its diagonals | red |
| The prince | a cream-white triangle | yellow |

The background is dark blue, and the 4:3 picture sits inside the square frame. The orange fairy godmother isn't obvious in the sampled frames.

**The film is dated 13 October 1978**, four months before the code was backed up. So it's a guide to the look and the behavior, not a frame-by-frame target.

## Binary files

See `reports/BINARY-FORMATS.md` (in progress).

## Open questions for later phases

- Which code produced `CP 29`? The file dates in the directory listings should settle whether it postdates the last edits to Ani's files.
- What exactly `do-as-if-you-were` does, and whether the five other undefined functions are ever reached.
- How Director orders methods (`:insert-methods-at-end`, inheritance), since the order affects Ani's choices.
