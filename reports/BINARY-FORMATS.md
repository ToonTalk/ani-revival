# Binary formats of the recovered KEN; files

*8 October 2026. How the files in `original/` encode PDP-10 words, what every binary file is, and what was extracted from them. Tools are in `tools/`; run them with `python -I`.*

| Tool | What it does | Regenerate with |
|---|---|---|
| `its_words.py` | Decode/encode evacuate bytes; word helpers (SIXBIT, SQUOZE, dates); exact text | `--roundtrip`, `--text FILE`, `--dump FILE` |
| `fasl.py` | Parse MacLisp FASL files | `--all` writes `reports/fasl/` |
| `itsdir.py` | Decode UFD directory listings | `--all` writes `reports/itsdir/` |
| `itsarc.py` | List and extract ITS archives | `--all` writes `reports/archives/` |
| `itspic.py` | Render TV-turtle windows and KST fonts as PNG | `--all` writes `reports/images/` |
| `pdump.py` | Rebuild symbols and listings from PDUMP core images | `--all` writes `reports/pdump/` |

## 1. The byte encoding: "ITS evacuate" format

Every file in `original/`, text or binary, uses one encoding: the format Alan Bawden's EVACUATE server used to move ITS files to Unix. John Wilson's `itstar` writes the same format when it extracts files from ITS dump tapes. The specification is Bawden's 1992 description quoted in itstar's `unpack.c` ([PDP-10/itstar](https://github.com/PDP-10/itstar)). The same rules are in Lars Brinkhoff's `libword/its-word.c` (the "its" word format) and in `src/bawden/evacua.53` in [PDP-10/its](https://github.com/PDP-10/its).

**Decoding rules:**

- **Bytes 0360-0377 (0xF0-0xFF):** a quoted binary word. Its low 4 bits are word bits 0-3, and the next 4 bytes are bits 4-35, big-endian. The encoder uses this for every word whose bit 35 is 1. It can only start at a word boundary.
- **Every other byte:** one or two 7-bit characters, packed five to a word (bits 0-6, 7-13, 14-20, 21-27, 28-34). Bit 35 is 0.

  | Byte (octal) | Characters (octal) |
  |---|---|
  | 000-011, 013-014, 016-176 | the same character |
  | 012 (LF) | 015 012 (ITS CR LF) |
  | 015 (CR) | 012 (a bare line feed) |
  | 177 | 177 007 |
  | 200-355 | 177 followed by byte-200, except: |
  | 207 | 177 177 |
  | 212 | 177 015 |
  | 215 | 177 012 |
  | 356 | 015 (a bare carriage return) |
  | 357 | 177 (a bare rubout) |

  The 177 pairs exist to preserve Lisp Machine character-set files. A two-character byte can straddle a word boundary.
- **End of file inside a word:** pad the word with ^C (003). The encoder trims trailing ^C bytes from the last word.

**Evidence:**

- **Round trip.** `tools/its_words.py --roundtrip` decodes every file and re-encodes it with itstar's `pack.c` algorithm. 500 of the 502 files come back byte for byte. The other two (`3100153/newtp.71`, `7006885/anima.7`) come back exactly once one dropped final ^C word is restored (see below).
- **`*FASL+` header.** The bytes `f2 a6 87 3b 0b` decode to 124641635413, which is SIXBIT `*FASL+`.
- **FASL files.** All 90 parse cleanly to their end marker (section 3).
- **Directories.** Every UFD's decoded length matches its header exactly. Every listed file's word count matches its file on tape, except seven that are one word longer on ITS (section 4).
- **Archives.** Every data block's trailer agrees with its header in all 15 archives (section 5).

**Answers to the earlier questions:**

- **Bit 35 and the high bits.** Bit 35 is never stored in a 7-bit group. A word with bit 35 set becomes a quoted binary word, which is where the 0xF0-0xFF lead bytes and the arbitrary high bytes after them come from. High bytes 0x80-0xED are rubout pairs; 0xEE and 0xEF are a lone CR and a lone rubout.
- **Sizes that aren't multiples of 5.** Three things cause this: one-byte encodings of two characters (LF for CR LF, 0x80-0xED for rubout pairs), the trimmed final word, and the one-character CR, 0356 and 0357 bytes.
- **CR LF was not collapsed.** Nothing is lost. A 0x0D byte stands for a lone 012 character. All 90 FASL files contain such bytes (3,740 in total), along with 13 0x0A bytes (CR LF pairs), 1,535 0356 bytes, 1,857 0357 bytes and 11,419 rubout pairs. The decoder restores each one exactly, so no realignment is needed.
- **The one real loss.** When a file's final word is entirely ^C, the encoder trims all five bytes and the word disappears. This is harmless padding. The 3100153 UFD shows seven such files: `NEWTP 71`, `20FG WINDOW`, `25FG WINDOW`, `40VSHD WINDOW`, `40VSHD WINFON`, `2500 1` and `POLYS 1`.

**Text files that need the decoder.** Most text files read correctly as plain bytes. These don't, and should be read with `python -I tools/its_words.py --text FILE`:

- **`KEN TAGS` (7005017, 701431, 9004336):** each rubout separator is merged with the digit after it into one byte. For example, DEL plus "6" becomes 0xB6, which `cat -v` shows as `M-6`. Character positions parsed from the raw bytes lose their first digit.
- **Ani's `INTERF 149`, `PLACE 45` and `SUGCON 26`:** a few words of ordinary text have bit 35 set, so the raw file holds 5 non-ASCII bytes instead of 5 characters:
  - interf.149 line 70: `,keep-on-stage?` (2 words)
  - place.45 line 315: `forget`
  - sugcon.26 line 24: `add-prerequisites...`

  The characters themselves are intact.
- **`WORDAB QWABL` (7005017):** 20 bit-35 words. A few other files have a single bare CR or LF.

**File names.** On-disk names follow itstar's "weenix" rules: lowercase, `.` becomes `_`, `_` becomes `}`, and FN1 and FN2 are joined with `.`. `*`, which Windows forbids, is stored two ways:

- as U+F021 (the Services-for-Macintosh substitute) on tape 7005044, e.g. `anima.fasl` = `ANIMA* FASL`;
- as `_` on tape 3100153, e.g. `turt_.fasl` = `TURT* FASL`.

The manifest's guessed names are wrong for the 3100153 files: `ANIMA_ DECL`, `TURT_ DECL` and `TURT_ FASL` are really `ANIMA* DECL`, `TURT* DECL` and `TURT* FASL`. The UFD resolves these names, and the reports use them. Derived report files write a forbidden character as `=XX`, e.g. `anima=2A`.

## 2. What each binary file is

| Kind | Files | Tool | Output |
|---|---|---|---|
| MacLisp FASL (compiled Lisp) | 90 `*.fasl` (85 `*FASL+`, 5 old `*FASL*`) | `fasl.py` | `reports/fasl/` |
| ITS directory (UFD) | 7 `_file_.(dir)` | `itsdir.py` | `reports/itsdir/` |
| ITS archive (ARC: device) | 15: see section 5 | `itsarc.py` | `reports/archives/` |
| PDUMP core image (saved Lisp job) | `701431/ts.d2500` (Director, Jan 1980), `7006808/ts.unifor` (Uniform, after Nov 1980) | `pdump.py` | `reports/pdump/` |
| TV-turtle windows (MacLisp DUMPARRAYS) | `20fg.window`, `25fg.window`, `40vshd.window` (3100153); `13fg.window`, `13on.window`, `ken.window`, `oldeng.window` (7005044); 9 more inside archives | `itspic.py` | `reports/images/` |
| KST raster fonts | `13on.kst`, `bturt.kst`, `ken.kst` (7005044); 9 more inside archives | `itspic.py` | `reports/images/` |
| Lisp Machine QFASL | `9004336/let.qfasl` (SIXBIT `QFASL` header) | none | not decoded |
| XGP print files (text with rubout-escaped XGP commands) | `3100153/areax.doc`, `newtp.doc`, `areax.tit` | none | readable with `its_words.py --text` |
| All zero bytes (contents lost) | `7006808/direct.files`, `ken.direct`, `ken.ocompl` | none | none |
| Empty (0 bytes) | `7005044/}^rsv.1`, `9004336/}^rsv.2` | none | none |

The remaining 369 files are text. A few of them, such as `.WINFON`, the PUB files and the TECO/EMACS init files, contain control characters but no binary words. The `CARE*` files on 7008321 (November 1980) are text FTP scripts. They copy Director and actor files from MIT-AI, e.g. `AI:DIRECT;GUIDE >` and `ACTOR;REAMAC FASL`, to a `<MACLISP>` directory on another machine.

## 3. FASL files

**Format.** The format is documented in MacLisp's loader, `src/l/fasloa.263`, and its dumper, `src/comlap/faslap.392`:

- **Header:** two words, SIXBIT `*FASL+` or `*FASL*`, then the compiling Lisp's version.
- **Blocks:** each block is a word of nine 4-bit relocation types followed by nine items.
- **Item types:**
  - 0-4, 10: one loaded word (absolute; relocatable; special-variable reference; CALL UUO; quoted atom; array reference)
  - 5: quoted list (list-building words, an end word, and an SXHASH key)
  - 6: GLOBALSYM patch
  - 7: DDT symbol patch
  - 12: atom-table entry (symbol, fixnum, flonum or bignum)
  - 13: entry point (name, property, ARGS, address)
  - 14: LOC
  - 15: PUTDDTSYM
  - 16: top-level form evaluated at load time
  - 17: end
- **Old format.** The 1975 `*FASL*` files have the same structure, including the hash keys.
- **Several segments.** A file may hold several segments: after the end item, another `*FASL*` word starts the next one. None of these files does.

**Results.** All 90 parse cleanly, consuming every word (`reports/fasl/SUMMARY.md`). Each file has two outputs:

- a dump: functions defined (with property and ARGS), top-level forms as S-expressions, per-function references (calls, special variables, quoted atoms and lists), symbol usage, and the atom table;
- a LAP-like listing of the loaded code in `reports/fasl/code/`, with MacLisp UUO, accumulator and GLOBALSYM names. GLOBALSYM index -1 is `R70`, so `SUB P,R70+1` appears as it does in LAP.

`reports/fasl/DEFINITIONS.md` indexes every compiled function across all FASLs.

**Files of special interest:**

- **`7005017/ani.fasl`:** no code. It holds 654 top-level forms: `(DEFPROP fn |KEN;FILE| AUTOLOAD)` for each Ani function and `(DEFPROP actor |KEN;FILE| ACTOR-LOAD)` for each actor. This maps every Ani function and actor to its source file.
- **`smadir.fasl` and `direct.fasl` (7005017 and 9004336):** the same kind of autoload table for Director. They name functions in the lost `KEN1;` files: CMATCH, COMP, PROP, INCOMP, MEMORY, TRACE, DL, TUTIL, INTER, INSTAN, FWUSE and CMOVIE, plus `KEN1;DLIST` and `KEN1;TURMAC` in August 1979. They also cover `KEN;DIAGRM`, `KEN;XGP`, `KEN;SOME`, `KEN;OBJECT`, `KEN;MOVIE` and others.
- **Ani's own FASLs (`choose.fasl`, `scene.fasl`, ...):** each begins with `(REMPROP 'fn 'AUTOLOAD)` for its functions. The compiled code shows exactly which runtime functions and special variables the lost macros expanded into.

**Lisp version word (an inference).** The second header word holds SIXBIT digits with flag bits in its low 8 bits. In tape-date order the digits read:

- `*FASL*`: 810, 997, 020
- `*FASL+`: 104, 106, 109 (Dec 1975); 132, 193, 231, 239 (1976); 293, 578, 633, 750 (1978-Feb 1979); 840 (Aug 1979); 914 (1980)

These look like MacLisp version numbers without their leading digit. This is not documented.

## 4. Directories (UFDs)

**Layout.** A UFD is one 1024-word block (`src/system/fsdefs.43`):

- word 2 is the directory name;
- descriptors are 6-bit bytes starting at word 11;
- 5-word name blocks run from UDNAMP to the end, holding FN1, FN2, flags/pack/descriptor/last-block word count, creation date and time, and reference date/author/byte size.

The tape copies leave out the unused gap between the descriptors and the name area. Every file here decodes to exactly 11 + ceil(UDESCP/6) + (1024 - UDNAMP) words, and `itsdir.py` puts the gap back.

| Tape | Entries | On this tape | Creation dates | Latest date in the UFD |
|---|---|---|---|---|
| 3100153 | 124 | 115 | 1975-08-31 to 1976-12-08 | 1976-12-08 |
| 7005017 | 134 | 128 | 1978-03-20 to 1979-01-08 | 1979-01-08 |
| 7008432 | 126 | 5 | 1978-03-20 to 1979-05-31 | 1979-05-31 |
| 9004336 | 73 | 69 | 1978-03-20 to 1979-08-06 | 1979-08-06 |
| 701431 | 35 | 30 | 1978-04-11 to 1980-05-30 | 1980-06-14 (reference) |
| 701501 | 33 | 26 | 1978-04-11 to 1980-09-01 | 1980-09-01 |
| 7008321 | 45 | 23 | 1978-04-11 to 1980-11-03 | 1980-12-28 (reference) |

The latest date is a lower bound on when each tape was written. It is later than the manifest's tape date for 701431 (April vs. June 1980), 701501 (August vs. September 1980) and 7008321 (November vs. December 1980).

Every file on these tapes is listed, apart from the directory itself. The incremental tapes (for example 7008432) list files that were not dumped on them, which gives names, sizes and dates for files that do not survive.

**Links of note:**

- `TS ANI -> KEN1;ANI >` and `TS D -> KEN1;DIRECT >`: KEN1 held dumped Ani and Director executables in 1978-79.
- From December 1979, `TS D -> DIRECT;DIRECT >`, and from January 1980, `KEN COMPLR -> DIRECT;DIRECT COMPLR`: Director moved to its own `DIRECT;` directory.
- `AR2 1`-`AR8 1` and `ARC 1` point to the archive files (ODDS ENDS, THESIS PROPOS, SOME STORYS, LOGO DRAW, FANNIE SCRAB, WALKIN MOVIE, TS PAPER), the names the ARC: device used.
- In 1980, many entries are links to `BACKUP;TAPE GFRn`: the Grim File Reaper moved those files to tape.

Author fields are MFD indices: 322 (probably Ken), 265, 353 and 126. They can't be turned into names without the MFD. Dates and the "not yet dumped" flag are decoded as specified.

## 5. Archives

**Formats.** Both are documented in the ITS repository: `doc/sysdoc/oarcdv.format` (old, word 0 = -1) and `arcdev.format` (`ARC1!!`). The files differ from those documents in three ways:

- In the old format, word 2 (not word 1) points to the name area. Lars Brinkhoff's `itsarc.c` agrees.
- For members archived in 1974, the trailer word's 4.8 bit differs from the header's. The length and back-pointer still verify.
- Two members have an empty descriptor (zero length, superseded by a later version).

Members are written in the same evacuate format as `original/`, so text reads as text and FASL members can be fed to `fasl.py`. 219 members in all: 210 extracted, 9 withheld as personal.

| Archive (tape, date) | Contents | Relevance |
|---|---|---|
| THESIS PROPOS (3100153, Mar 1976) | The thesis proposal's PUB sources: `$PANIM 1` (Introduction), `$PNUT 2` (The Problem), `$BIB`, `$DEMOS` (demo setup code), `$TITLE`, `$TT` | Thesis proposal |
| LOGO PAPERS (7005044, Oct-Dec 1975) | `$ACTOR 1`, `$ANIMA 2`, `$PANIM 1` (Actors), `$LOGO PROPOS` ("An Investigation of the Use of my Actor-like Animation System"), `$ROD 1` (sessions using the system), `$LDB 1`, `$TALK 1` (Logo natural-language system), `ASI 1`, `CB ANIMA`, `NANIMA 1`, `$OUT LINE` | Original versions of the actor and animation papers |
| ODDS ENDS (3100153 and 7005044, 1974-76) | `#ANIMA 1` ("the actor like animation system that sorta ran on the 11"), `*ACTOR 1` (from an earlier thesis appendix), `#MATCH`, `%MATCH OLD`, Logo/Lisp drawing code, KST fonts, misc. programs | Early animation system and matcher; 4 personal members withheld |
| ANIMA DEMOS (7005044, Nov 1975) | Two demos: `FDEMO` (FASL, Lisp, windows) and `RDEMO` (Lisp, windows) | 1975 animation demos; frames rendered |
| DEMOS WINDOW (3100153, Nov 1976) | Three window files of demo frames | Director demo frames, e.g. "ASK FRED (APPEAR FORWARD 50)" and "ASK ATTACK (SHOW)"; rendered |
| WALKIN MOVIE (3100153, Jun-Jul 1976) | Walking stick-figure movie: code, FASL, script, windows | Early movie; frames rendered |
| LOGO DRAW (3100153, 1976) | Logo and Lisp drawing programs (faces, alphabet, bus, bird, "turtles in Plasma") | Drawing code |
| FANNIE SCRAB (3100153, Oct 1976) | A Scrabble program (Logo, Lisp, FASL, board windows, fonts) | Not Ani |
| SOME STORYS (3100153 and 7005044, 1975) | Short stories (PUB sources), including `&CART OON5`, a cartoon scene description | Early prose scene description; one story marked private by its author, withheld |
| TS PAPER (3100153, Oct 1976) | "Mechanizing Temporal Knowledge" (Kahn and Gorry, revised 19 Oct 1976) with its PUB setup | Time Specialist paper |
| AGN STUFF (7006885, 1974) | Time Specialist knowledge about acute glomerulonephritis (AGN) | Earlier research |
| AR1 DIAGRM (7005017, Dec 1978-Jan 1979, `ARC1!!`) | `CHMETH 1`, `D 1`-`D 10`: text with ^Q/ESC control sequences, probably DIAGRM output for the XGP | Ani's diagram maker (out of scope per the plan) |
| AR9 1 (3100153, Dec 1976) | One ITS mail message | Withheld |

**Withheld as personal** (listed in `_LISTING.txt`, not extracted): `@LET 1` and `LET 1` (letters), `RESUME 1` and `RESUME SHORT`, `BOOKS TOREAD` (a mail message), `&GUS 1` (its author asks readers not to read it).

## 6. Core images (PDUMP)

**Format.** Word 0 = 0, then a 256-word page map, then the pages that are in the file. A dumped MacLisp leaves out the Lisp's own pure pages, so system atoms (SUBR, LAMBDA, ...) appear only as addresses. `pdump.py` rebuilds the user symbol table from the image:

- SY2 blocks `777xxx,,value-cell / args,,pname-list`, with pnames as lists of 5-character fixnums;
- symbol headers `SY2,,plist`.

It names the property indicators from ARGS and value kinds (SUBR 075071, LSUBR 075073, MACRO 075076, AUTOLOAD 075077 in TS D2500). It then disassembles every compiled entry, resolving symbols, value cells, quoted lists and fixnums, plus two pure-Lisp addresses learned by aligning FASL code with the image (PDLNMK, R70). A compiled macro FOO has MACRO property `|FOO MACRO|`, a symbol whose SUBR is the code.

**`701431/ts.d2500` (`KEN;TS D2500`, written 1980-01-05 by author 322)** is a saved Director job. It has 2,855 symbol headers. Compared with the 596 definitions that the 1979 tags table assigns to `KEN1;` Lisp files, the image has:

| KEN1 definitions | Count |
|---|---|
| compiled code | 229 |
| macro definitions | 70 |
| autoload stubs only (to `DIRECT;` files) | 67 |
| other properties | 17 |
| absent | 213 |

| File | Definitions in tags | Present as code or macro |
|---|---|---|
| MACROS | 99 | 12 compiled, 65 macros |
| UTIL | 67 | 59 compiled, 1 macro |
| DRECT | 71 | 44 compiled, 1 macro |
| CMATCH | 48 | 31 compiled, 1 macro |
| DL | 32 | 25 |
| TUTIL | 28 | 24 |
| PROP | 21 | 20 |
| REAMAC | 24 | 13 compiled, 1 macro |
| INSTAN | 36 | 0 (10 other properties) |
| COMP, INCOMP, TRACE, INTER, CMOVIE | | autoload stubs only |
| MEMORY, COLIDE, FWMAKE, RDTAGS | | absent |

This is compiled code for most of the lost runtime, as of January 1980, eleven months after the Ani run. `reports/pdump/701431_ts.d2500.txt` has the symbol table and coverage. `701431_ts.d2500.code.txt` has 62,000 lines of listings.

**`7006808/ts.unifor`** is a different Lisp system: a unifier with paths, costs, delayed unifiers and a Baker GC daemon. It is almost certainly Ken's Uniform language. It is not in the November 1980 ONTAPE listing, so it is later than that.

## 7. Pictures

**Window files.** These are MacLisp DUMPARRAYS files (`src/lspsrc/dumpar.8`): each array is a word `-n,,n`, a pname, a word `-count,,type`, then data. LLOGO's TV turtle (`src/llogo/tvrtle.542`) saves each window as `NAME-WINDOW-INFO` (8 numbers: words per row, rows, home, and edges) and `NAME-WINDOW-PICTURE` (rows of 36 pixels per word, high bit first).

**KST fonts.** Word 1 holds the height. Each character is a marker word 1, `kern,,code`, `raster-width,,char-width`, then rows as a stream of 8-bit bytes, four per word, each byte's low bit leftmost (checked visually).

`itspic.py` renders each file as a contact sheet, black on white (`reports/images/`, 28 PNGs with text indexes):

- `20FG`, `25FG`, `13FG`, `13ON`, `40VSHD` and `OLDENG WINDOW` are fonts stored as one window per character (`20FG176` is character 176). Their metrics are in `*.WINFON` and `13FG FASL`.
- `DEMOS 1-8`, `DEMO 10` and `DEMOS 8-9` are Director demo frames with their ASK commands as captions.
- `FDEMO WINDOW` and `RDEMO NWIND` are 1975 flower and rocket animation frames.
- `STICK MEN` is the walking cycle.

**Possibly personal:**

- `FANNIE WINDOW` includes a handwritten signature with a person's name.
- `KEN KST`, `KENPIC KST` and `KEN WINDOW` are thresholded digitized photographs of a face, probably Ken.

## 8. Open questions

- **Version word.** Is it really the MacLisp version without its first digit?
- **Bit 35 in text.** Why do four words in Ani's sources have bit 35 set? The text is unaffected.
- **Author indices.** 322, 265, 353 and 126 can't be named without an MFD from those years.
- **Unnamed indicators in TS D2500.** 075074, 076774 and 075166 are unidentified. 075166's values are fixnums (perhaps EXPR-HASH).
- **Pure-Lisp routines.** Most routines in TS D2500's listings remain octal addresses. More could be named by aligning more FASL code with the image.
- **TS D2500 versus the 1979 run.** How far does the January 1980 runtime (from `DIRECT;` files) differ from the February 1979 one that Ani ran on?
- **Not decoded:** `LET QFASL` (Lisp Machine), the XGP print files, and the DIAGRM control-code streams.
