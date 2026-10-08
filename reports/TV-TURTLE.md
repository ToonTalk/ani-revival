# The TV turtle and Director's graphics

*8 October 2026. Director drew with LLOGO's TV turtle (`AI:LLOGO;TVRTLE`, and its color build `LLOGO;COLORT`). That file isn't on our tapes, but its source is public: `src/llogo/tvrtle.542` in the PDP-10/its repository. This report covers the JavaScript turtle built from it (`src/tv/`), the lost `KEN1;` graphics files rebuilt in MacLisp (`src/director/ken1/tutil.lisp`, `dl.lisp`, `fwuse.lisp`, `inter.lisp`), and Director's graphical demos running on them.*

## In brief

- **The turtle is a port of TVRTLE 542,** function by function, with its state in the same Lisp special variables (`:XCOR`, `:TVSTEP`, `TV-PICTURE-LEFT`, ...). 149 names are defined, counting abbreviations (`FD` for `FORWARD`, and so on).
- **It loads the way it did in 1979.** Ken's `KEN;LISP` autoloads it on `CS`. `KEN1;DRECT`'s autoload handler loads `|ai:llogo;tvrtle newio|` (our stub), then calls `director-startdisplay` and `fancify` from the rebuilt `KEN1;DL`.
- **Director's own demos run, unchanged:**
  - Ken's `test-director` from `KEN;DUMP 44`, "a quick and simple test to make sure that turt part of director is working";
  - OBJECT, POLY's rocket, polygons and flower, SCREEN, MOVIE (film and project), and TEXT captions in a 1976 font;
  - `KEN;ANINIT`, Ani's film driver, loads; its `asd`, `nodisplay`, characters and `test-pattern` work.
- **Pictures:** 43 PNG frames and 6 contact sheets in [`reports/tv/`](tv/), made by `node tools/tv-demo.mjs`.
- **Tests:** `test/tv.test.js` has 28 tests: the turtle directly (both builds), PNG and DUMPARRAYS, and Director's graphics. `test/tv.html` runs both builds in a browser through the Canvas renderer.

## The display model

`src/tv/framebuffer.js` holds a `FrameBuffer` with one byte per dot, of either kind:

| | Knight TV (`TVRTLE`) | Color frame buffer (`COLORT`) |
|---|---|---|
| Raster | 576 dots by 455 lines. Memory is 18 words of 32 dots per line, as TVRTLE addresses it. | The same raster |
| A dot holds | 0 or 1 | a color-map slot, 0 to 15 |
| A write does | Combines the stored word with the word in memory through the PDP-11's ALU function (TVRTLE's `DRAWMODE`): `IOR` draws, `ANDC` erases, `XOR` flips, and `SET` replaces whole words (how the screen is cleared). The other six functions follow their names. | Puts the selected slot into each dot whose data bit is 1. There is no XOR, as on the real hardware. |
| What shows | Lit dots are white on black. The complement bit in the TV's last word (`COLORPOSITIVE`, `COLORSWITCH`) shows dark on light. | Each slot's red, green and blue intensities, 0 to 511, scaled to 0 to 255 |

- **Words and runs.** Horizontal and vertical runs are written word by word, with TVRTLE's own masks.
- **Bookkeeping.** `version` counts changes, and `onChange` notifies renderers.
- **Output:**
  - `toRGBA({ crop, scale })` gives RGBA bytes.
  - `src/tv/png.js` writes PNG files in Node, using only `node:zlib` and its own CRC.
  - `src/tv/canvas.js` paints a canvas (`attachCanvas(display, canvas, { scale, crop })`), at most once per animation frame. `pictureArea(turtle)` gives the crop for the turtle's picture area.
- **The text area.** On the Knight TV, the bottom of the screen was Lisp's echo area (`CREATE-ECHO-AREA`). No text is drawn there, and the area is blanked when it's created.

`installTvTurtle(L, { color, display })` (`src/tv/tvrtle.js`) defines the primitives, sets the features `TVRTLE` (and `COLOR`) and sets `NO-VALUE` to `?`, as TVRTLE does outside LLOGO. It leaves `L.tv` (the `TvTurtle`) and `L.tvDisplay` (the `FrameBuffer`, reused if it's of the right kind) for an application to render.

`src/its/stubs.js` makes `LLOGO;TVRTLE` and `LLOGO;COLORT`, under any second name, load by calling `installTvTurtle`.

## How the port follows TVRTLE

`src/tv/turtle.js` is TVRTLE 542 in JavaScript. Its comments use TVRTLE's names.

- **State lives in Lisp variables.** The turtle's 24 private variables, TVRTLE's `INITIAL-TURTLE-PROPERTIES` (`TV-PICTURE-CENTER-X` ... `:OFFSCREEN`), and its globals (`:TVSTEP`, `TV-PICTURE-LEFT`, `TURTLE-PICTURE-RIGHT`, `:ECHOLINES`, `:COLORS`, ...) are Lisp special variables. Ken's code reads several of them: `:xcor`, `:ycor`, `:heading`, `:tvstep`, `:penstate`, `:erasercolor`, and `turtle-picture-right` and `turtle-picture-top` (declared in `DECLA2`).
- **Several turtles.** `USETURTLE` swaps those variables with the array on each turtle's `TURTLE` property, including TVRTLE's quirk when a turtle is used again while current.
- **Binding.** TVRTLE's `LET`s of `:SEETURTLE`, `:TURTLES` and `:DRAWSTATE` are real dynamic bindings, so Lisp code run inside them (`MAKETURTLE` forms) sees them.
- **Lines** are drawn by TVRTLE's own fixed-point routines, with 22 fractional bits: `BOUNDED-VECTOR-FIX`, `NEARLY-HORIZONTAL-VECTOR`, `NEARLY-VERTICAL-VECTOR`, `WRAP-SCREEN-VECTOR` and `CLIP-VECTOR-VISIBILITY` (Cohen–Sutherland). So the dots come out where TVRTLE put them, quirks included:
  - **Half-dot offsets.** `BOUNDED-VECTOR` adds half a dot twice, once in `FLOAT-TV-SHIFT-X` and once in `BOUNDED-VECTOR-FIX-ROUND`. So outside wrap mode, lines fall up to one dot right of, and above, where `TV-X` and `TV-Y` place points and windows. A 100-step square is 30 dots wide and 31 high.
  - **TVRTLE's `:PI` is 3.1415926.** So `(setheading 90) (forward 100)` rises 0.0000027 steps, enough to split the line over two TV lines; and `(bearing 100.0 100.0)` is 45.000001.
  - **Wrap mode scales by a slightly different factor.** It uses the picture's sizes, not `:TVSTEP`.
- **Errors** go through `ERRBREAK`, which prints and calls the Lisp break handler. "TURTLE MOVED OFF THE RIGHT SIDE OF THE SCREEN" leaves the turtle in place, as TVRTLE did after the break.
- **Color build behavior,** which comes from the source's `[COLOR ...]` conditionals:
  - `XORDOWN`, `XORUP` and `XORWINDOW` print "NOT IMPLEMENTED IN COLOR TURTLE".
  - `DRAWMODE` returns 0.
  - The turtle is erased by redrawing it in the eraser color.
  - `CLEARSCREEN` fills the screen with the eraser color.
  - `STARTDISPLAY` gives `INTERNAL-TV-SIZE` the maxima 573 and 448, so `(tvsize)` is `(573 448)`.
  - Windows are runs of colors.
- **TVRTLE's own `TYPE`.** Outside LLOGO, TVRTLE defines `TYPE` as an interpreted EXPR. That shadowed Ken's compiled `TYPE`, which is why DRECT does `(remprop 'type 'expr)` after loading the turtle ("the turtle has a different type than I do"). The stub puts its EXPR in front of any existing one, so DRECT's `remprop` removes TVRTLE's and Ken's `TYPE` remains. Without this, the remprop would delete the reconstructed `TYPE`, which is an EXPR here.

## The primitives

Line numbers are in `tvrtle.542`. "BW" and "color" mark definitions in the source's `[BW ...]` and `[COLOR ...]` sections. Every primitive Ken's code uses is here: the 30 in `reports/xref.json` (class `turtle`), plus `cs`, `sd`/`startdisplay`, the readers, and what Director's paths reach.

| Primitive (abbreviations) | TVRTLE 542 | Notes |
|---|---|---|
| `STARTDISPLAY` (`SD`) | 1794; `INITIALIZE-TVRTLE-VARIABLES` 1374; `INITIALIZE-PALETTE` 961 | BW: a 301 by 301 picture at x 138 to 438, outlined, with 10 echo lines. Color: `COLOR-TVINIT`, then the whole screen. Hatches `LOGOTURTLE`. |
| `NODISPLAY` (`ND`) | 1817 | Sets `:ECHOLINES` to 0. Drawing still works. |
| `CLEARSCREEN` (`CS`), `WIPECLEAN`, `WIPE` | 1782, 1767, 1826; `TV-CLEARSCREEN` 1734 (BW), 1745 (color) | BW clears above the echo area, in SET mode. `WIPE` with a window hides it. |
| `TVSIZE` | 1605; `INTERNAL-TV-SIZE` 1550 | Even sizes; at most 573, and 415 (BW) or 448 (color) |
| `TURTLESIZE`, `SCALE` | 1492, 1648 | Returns flonums, `(2750.0 1000.0)` for a 550 by 200 picture |
| `SETHOME` (`TURTLEHOME`, `TH`) | 1529; `TV-SETHOME` 1513 | With one argument TVRTLE takes its CAR for y as well as x; that is kept. |
| `FORWARD` (`FD`), `BACK` (`BK`) | 2918, 2920; `FORWARD$` 2914; `SETXY$` 2892 | Draws if `:DRAWSTATE`. Wrap, clip or bounded vectors. |
| `RIGHT` (`RT`), `LEFT` (`LT`), `SETHEAD` (`SH`, `SETHEADING`) | 2939, 2941, 2932; `SETHEAD$` 2924 | `:HEADING` is not reduced modulo 360; `HEADING` is. |
| `SETXY`, `SETX`, `SETY`, `DELX`, `DELY`, `DELXY` | 2910, 3038–3059 | |
| `HOME` (`H`), `SETTURTLE` (`SETT`) | 3015, 3027 | |
| `XCOR`, `YCOR`, `HEADING`, `HERE` | 3044–3053 | Rounded fixnums. `XCOR` is bounded by `BOUND-XCOR`, so x at the right edge reads as the left. |
| `PENUP` (`PU`), `PENDOWN` (`PD`), `PENP` | 2943, 2948, 2960 | |
| `ERASERUP` (`ERU`), `ERASERDOWN` (`ERD`) | 2962, 2968 | BW: `ANDC`. Color: the eraser color. |
| `XORDOWN` (`XD`), `XORUP` (`XU`) | 2982, 2991 | BW only |
| `DRAWSTATE`, `DRAWMODE` | 3002; 387 (BW), 862 (color) | `SELECT-DRAWMODE` compares with `:DRAWMODE`, not the register, as TVRTLE does. |
| `SHOWTURTLE` (`ST`), `HIDETURTLE` (`HT`), `TRIANGLETURTLE` | 2741, 2745, 2573; `STANDARD-TRIANGLE` 2670; `TURTLE-WINDOW` 2608 | The triangle is drawn in XOR, with the 7 by 7 pen, eraser or XOR marker from `PEN-WINDOW` and the others. |
| `MAKETURTLE` | 2777 | An FEXPR: draw and erase forms, evaluated with the turtle's variables bound. Also accepts the three-argument call in `KEN;ANINIT` (see Open questions). |
| `HATCH`, `USETURTLE` (`UT`), `ERASETURTLE` | 2830, 2798, 2840 | |
| `WRAP`, `NOWRAP`, `CLIP`, `NOCLIP`, `OFFSCREEN` | 2439, 2445, 2517, 2523, 2525 | |
| `POINT`, `POINTSTATE` (`PS`), `POINTCOLOR` | 3209–3241 (BW), 3263–3295 (color) | |
| `ARC`, `CIRCLE` | 3349, 3351; `ARC$` 3322 | A polygon of `:POLYGON` (30) sides around the turtle, which stays put. It draws whatever the pen state, as in TVRTLE. |
| `BEARING`, `TOWARDS`, `RANGE` | 3366, 3393, 3414 | Fixnum arguments give fixnum answers |
| `SINE`, `COSINE`, `ARCTAN`, `\$` | 1673–1677, 1669 | Degrees, with TVRTLE's `:PI` |
| `PENCOLOR` (`PC`), `MAKECOLOR` (`MC`), `ERASERCOLOR` (`ERC`, `ERASECOLOR`) | 1057, 1003, 1130; `INTERN-COLOR` 1099; `MAKEPALETTE` 1088 | The 16 colors of `INITIALIZE-PALETTE` exist in both builds. In color, slots are taken as colors are first used, and `CLEARSCREEN` frees them (`CLEAR-PALETTE`). |
| `REDPART`, `GREENPART`, `BLUEPART`, `DELETECOLOR` (`DC`), `REPLACECOLOR` (`RC`), `MAKEPALETTE`, `RANDOMCOLOR`, `FILLPALETTE`, `TWIDDLEREPEAT` | 1034–1197 | `TWIDDLECOLOR` (an endless loop) is left out |
| `COLORNEGATIVE` (`CLN`), `COLORPOSITIVE` (`CLP`), `COLORSWITCH` (`CLSW`), `COLORSTATE` (`CLST`) | 424–430; `FLIPCOLORS` 419 | The complement bit |
| `OUTLINE` | 1917 (BW), 2039 (color); `TV-BOX` | Color draws two lines at top and bottom ("because of interlace") |
| `MAKEWINDOW` (`MW`) | 3823; `RECTANGLE-SPEC` 3459; `MAKEWINDOW-VISIBLE` 3770; `MAKEWINDOW-ARRAY` 3707 | Only the part with something visible is kept. BW pictures are 36-bit words, as in TVRTLE's arrays; color windows are runs. |
| `SHOWWINDOW` (`SW`), `HIDEWINDOW` (`HW`), `XORWINDOW` (`XW`), `DISPLAYWINDOW` (`DW`), `DISPLAY` | 4285–4312, 4389; `DISPLAYWINDOW-STORE` | Clipped to the picture. In color, run windows must fit in the picture, as there. |
| `WINDOWFRAME` (`WF`, `BOX`), `FILLWINDOW` (`FW`), `WINDOWHOME` (`WH`), `ERASEWINDOW` (`EW`), `ERASEWINDOWS` (`EWS`), `SNAP` | 4249, 4330, 3852, 4321, 4374, 4391 | |
| `GETWINDOWS` (`GW`) | 4410 | Reads a DUMPARRAYS file (`src/tv/dumparrays.js`) from the ITS file system. Used for fonts. |
| `RECTANGLE-SPEC`, `RUNAWAY-FORWARD`, `RUNAWAY-BACKWARD` | 3459; 4528/4550 (BW), 4607/4630 (color) | Called by Ken's `KEN;TV2R` |
| `SHADE`; `SOLID`, `CHECKER`, `GRID`, `HORIZLINES`, `VERTLINES`, `TEXTURE`, `DARKTEXTURE`, `LIGHTTEXTURE` | 4806; 5230–5244 | Approximate (see below). Patterns can also be windows or functions. |
| `MARK` | 3065 | Prints on the terminal (see below). Color: not implemented, as in TVRTLE. |
| `ECHOLINES`, `FAST`, `SLOW` | 317, 112, 114 | Do nothing |
| `ERRBREAK`, `TYPE` | the non-LLOGO block at the top | |

**Not provided:** `SAVEDISPLAY`, `SAVEWINDOWS`, `EXPAND`, `BRUSH`/`NOBRUSH`, `XGP`, `READSKETCH`, `ADDTURTLE`, `TWIDDLECOLOR`. No surviving file uses them.

## Director's graphics helpers, rebuilt

Each definition cites its evidence in a comment. The sources:

- **1980.** The compiled code in TS D2500, in `reports/pdump/701431_ts.d2500.code.txt`. Its flonum and fixnum constants were read from the image. Small fixnums are addresses from 105774 (0); 106304 is 200, 106126 is 90, and 106773 is 511.
- **1976.** The files on tape 3100153: `DL 140`, `TURT 427`, `FWNEW 53` and `INTER 171`.
- **Aug79.** `PERFOR 685` (tape 9004336).
- **Size.** Where each definition began in the 1979 tags table, which shows how long it was.

| File | Rebuilt | Main evidence | Guessed |
|---|---|---|---|
| `tutil.lisp` (KEN1;TUTIL) | 19 of 27: `color-differences`, `mix-colors`, `pencolor-rgb`, `fix-heading`, `distance-to-nearest-wall`, `thingup`, `thingdown`, `xor-point`, `draw-arc`, `right-tri`, `rect`, `eq-tri`, `draw-poly`, `draw-many-polys`, `draw-color-poly`, `petals`, `petal`, `draw-flower`, `draw-rocket` | 1980, nearly line for line; 1976; `draw-poly` from the guide's own example | `draw-many-polys`: concentric polygons stepping down by `offset`, explained below |
| `dl.lisp` (KEN1;DL) | All 31, plus `fancy-fd` and the other aliases | 1976 for the structure (its sizes match the tags table); 1980 for `how-to-get-to-center-and-scale`'s two-element value, `make-it-less-than-180`, `fancify`'s once-only, and `director-startdisplay` | |
| `fwuse.lisp` (KEN1;FWUSE) | All 18 | 1976 FWNEW's printing half; OBJECT's text actor; LOAD 33's `font-autoload-file` | `fonttyo` showing rather than XORing in color; `fwuse-slashified?`'s character list |
| `inter.lisp` (KEN1;INTER) | All 23 | 1976 INTER 171, with 1979 names, using `display-package`'s property list | `display-interpolation` |

**Not rebuilt.**

- **TUTIL:** `draw-color-polygon` (no evidence), and the diagram maker's seven helpers, from `draw-arrow-to` to `is-other-end-between-others?`. The diagram maker is out of scope, and 1980 has their code if they're ever wanted.
- **COLIDE and FWMAKE:** nothing surviving calls them, and TS D2500 doesn't have them.

**Some details that matter:**

- **`director-startdisplay`.**
  - It does `(startdisplay)`, `(setq :outline nil)`, `(wrap)` and `(hideturtle)`, then `(tvsize 550 200)` unless running color.
  - The guide confirms that size (page 45): the screen's "height ... default value is 200, width ... 550".
  - 1980 also calls `fancify` and wipes the stage. In 1979, DRECT's handler calls `fancify` itself, and the tags table's 223 characters only have room for the first part.
- **`fancify`.**
  - It moves the property lists of `fd forward bk back right rt lt left penup pu pendown pd` to `logo-fd` and so on, and puts the `fancy-` versions in their place.
  - As in 1980, it then empties the list, so doing it twice can't make `logo-forward` the fancy one.
- **`thingup`.**
  - It lifts whatever is down: the pen (via `logo-penup`, as in 1980), the eraser or the XOR pen.
  - It remembers which, as the guide prescribes for drawing procedures.
- **`position-list` and `display-package`** run the drawing from home with the pen up, recording `((x . y) . distance)` for each line's ends, as in 1976.
  - 1976 did this on a scratchpad turtle; 1980 does it on the current turtle.
  - Here it's done on the current turtle, which is then put back as it was, pen included. `draw-centered` (and INTER's `sl`, `slt`, `slm`) depend on that.
- **`how-to-get-to-center-and-scale`** returns `((progn (right 90) (back x) (left 90) (back y)) scale)`.
  - The listing builds the scale with `%PDLNC`, an NCONS, so the value is a two-element list, not a dotted pair.
  - Two things need it that way: PERFOR 685 takes the `second` of it, and OBJECT 401 destructures it as `(how-to-get-to-center scale)`.
- **`draw-many-polys` is guessed.** It is in the 1979 tags table but not in 1980. The evidence:
  - `KEN;ANINIT` makes Ani's characters descendants of `many-polys` in color, with `(set your offset to 20.0) ;;since a star is denser`.
  - POLY 29's commented-out "old way" built many-polys from polys whose size steps down by an offset.
  - In the film, the stepmother is "a red square drawn with its diagonals". That is how nested squares look when their corners line up (compare `reports/tv/color-02.png` with `sources/film/frames/t040.jpg`).
  - From a vertex, the center of a polygon with side s and turn a is s/2 ahead and s/(2 tan(a/2)) to the right. So each smaller polygon starts offset/2 ahead and offset/(2 tan(a/2)) to the right of the last.
  - The `many-polys` actor itself is defined nowhere that survives, so the color demo defines it.

## The demos

`node tools/tv-demo.mjs [names]` boots Director as Ken's `KEN;LISP` and `KEN;LOAD` did, and starts the display with `(cs)`. It adds the 1976 fonts (`20FG`, `25FG` `WINDOW` and `WINFON`, tape 3100153) to `KEN;`, since the 1979 fonts on `PLASMA;` are lost. It saves the picture area after each step, and `reports/tv/index.json` lists the steps and their Lisp.

| Demo | Frames | What it shows |
|---|---|---|
| `test-director` | [sheet](tv/test-director.png), 4 projected frames | Ken's own `test-director` (`KEN;DUMP 44`), as written: a pentagon growing and turning, a star shrinking and turning, a 36-gon "to frame it with a large circle", filmed for 4 ticks at 2 frames a second and projected |
| `fred` | [sheet](tv/fred.png), 10 frames | The 1976 FRED demo (`reports/images/3100153_demos.window__demos.1-8.png`) replayed in 1979 Director: captions by a TEXT actor in 25FG; show, forward 50, left 120 (FRED points to the lower left, as in the 1976 frame), gradually forward 75, a tick, grow 10, back 50, and a missile shot and flying for two ticks |
| `shapes` | [sheet](tv/shapes.png), 8 frames | POLY at angles 60, 90, 120 and 144; ROCKET; FLOWER; then grow, turn, shrink and hide |
| `movie` | [sheet](tv/movie.png), 13 frames | The guide's movie: `(ask movie make fantasia)`, `(ask fantasia film the next 12 ticks)`, `(ask fantasia project)`. A rocket flies and wraps over the top edge; a star turns 15 degrees a frame. Frames are taken as MOVIE's `run-frame` sleeps after drawing each one. |
| `interpolation` | [sheet](tv/interpolation.png), 2 frames | KEN1;INTER: `(mi 'sq-tri '(draw-poly 100 90) '(draw-poly 100 120))` and a star becoming a pentagon, laid out by the 1976 `slt` |
| `color` | [sheet](tv/color.png), 6 frames | COLORT as ANINIT runs the film: `(run-color)`, `(tvsize 550 413)`, and the characters' angles, colors, offsets and center offsets, as many-polys. Then moving, turning, and `mix-colors` halfway from red to orange. |

## What is approximate

- **Floating point.** Flonums are JavaScript doubles, not the PDP-10's 27-bit fractions, so values can differ in the last digits. Line positions near a rounding boundary may move by a dot.
- **The hardware.**
  - The PDP-11 boolean functions other than IOR, ANDC, XOR and SET are guessed from their names.
  - The polarity is assumed: lit dots are white on black.
  - The color system's interlace, timing and video-switch registers are not modeled.
- **SHADE.** TVRTLE's own fill (`INTERNAL-SHADE`, `SHADE-VERTICALLY`, about 250 lines) is replaced by a scan-line fill. It fills the four-connected dots matching the one under the turtle, within the picture, writing the pattern's bits.
- **MARK.** It printed text in the TV's own character set at the cursor nearest the turtle. That character set isn't in the project, so the text goes to the Lisp terminal. Director prints text with fonts (FWUSE), which are drawn.
- **Color windows** keep one run per array element; TVRTLE packed two to a word. They are also not merged across lines. They display the same.
- **Timing.** Nothing runs in real time. `SLEEP` and `RUNTIME` are the interpreter's, and the demos take frames when MOVIE sleeps.
- **The echo area** is blank, rather than holding Lisp's text.

## Changes outside `src/tv/` and the new `KEN1;` files

- **`src/maclisp/interp.js`: `PROGV`.** It no longer turns its value list into an array. Director passes `:circular-list-of-nils` (in `ask-old`'s skip path), which hung the interpreter with "Invalid array length".
- **`src/its/fs.js`: `probe`.** It answers for stubbed files under any second name. `KEN1;DRECT`'s `director-load` probes the file (`full-file-name`) before loading it.
- **`src/its/stubs.js`:** the `LLOGO;TVRTLE` and `LLOGO;COLORT` stubs.

## Found along the way, for the Director work

1. **The universe isn't set.** SOME 666 does `(ask something set your universe to default-universe)` after a `(declare (read))`, but after loading, `(ask something recall your universe)` is NIL. So `plan next` never reaches a universe, and movies film 0 frames. The demos and tests do it themselves.
2. **MACROS's `comma`** quotes its argument without evaluating the commas inside it. OBJECT's `prepare to mix colors` writes `,(comma (mix-colors old-colors (color-differences old-colors (quote ,colors)) new-value))` and needs the inner `,colors` evaluated when the outer message is sent. As it is, `color-differences` receives `(DIRECTOR-SYMBOL-FOR-EVAL COLORS)`. A likely fix in `macros.lisp`: `(define-macro comma (form) '(list 'director-symbol-for-eval ,(quote-allowing-eval-and-unpack form)))`.
3. **OBJECT 401's `when drawing use`** sets `drawing-args` to the shape arguments only, so non-shape arguments like `(colors)` never reach the drawing procedure. COLOR-POLY's `draw-color-poly` and the interpolation actor's drawer are called with too few arguments. This is in the 1979 source; PERFOR 685 (August 1979) fixes it by keeping all the arguments. Ani's color characters aren't affected if `many-polys` draws with `size angle offset`.
4. **The TEXT actor** re-shows a changed text before updating its `length`. A longer caption is then centered with the old length and may run off the screen, which makes FWUSE's `fontterpri` ask `FILLWINDOW` for a band one dot too wide ("AREA TOO LARGE"). Both behaviors are in the 1979 code. The demos hide the caption before changing it.
5. **The turtle must be loaded before objects are shown.** In 1979 Director was dumped with it loaded (`KEN;DUMP 44` draws and clears the screen before `SUSPEND`), and Ken's `KEN;LISP` autoloads it on `CS`. So a session should start with `(cs)` or `(dsd)`, as ANINIT's `asd` does. Otherwise `thingup` finds `:penstate` unbound.
6. **Link names in the TS D2500 listing** (for whoever improves `tools/pdump.py`). Some call links are labeled with the wrong atom, also in `reports/pdump/ken1/`. For these, the atom each link cell points to, as the image's own symbol table names it (`Image.names`), disagrees with the label:

   | Link cell | Listed as | Points to |
   |---|---|---|
   | 121034 | `'ERD` | THINGUP. It pairs with THINGDOWN everywhere, and PERFOR 685's source has `thingup` there. |
   | 611146 | `'XORUP` | ERASERUP: THINGUP's eraser branch, and the `eraserup` after SHOW-TEXT-HORIZONTALLY's `eraserdown` and `fillwindow` |
   | 611122 | `'FD` | FORWARD |
   | 121421 | `'FORWARD` | LOGO-FORWARD, in the fancy FORWARD |

   The other `'XORUP` links (611434 in THINGUP's XOR branch, 611467 in XOR-POINT) really are XORUP. SIDES-IN-POLY's link 611512, now listed as `'#75407` (earlier `'LDB`), points to an atom with no name in the image. It is called with two arguments, and 360 divided by its value is the number of sides, so it is GCD.

   Also, `%PDLNC` is a number-safe NCONS (not a CONS), which matters when reading `how-to-get-to-center-and-scale`.
7. **Special names changed by 1980.** TS D2500 spells Director's own specials with a star: `*LAST-THING-UPPED`, `*TVRTLE-FILE-NAME`, `*COLOR-TVRTLE-FILE-NAME`, as `DECLA2 249` (tape 9004336, August 1979) declares them. The January 1979 sources (`DECLA2 186`, and `KEN1;DRECT` as `}^RSV 6`, tape 7005017) use colons, `:last-thing-upped` and `:tvrtle-file-name`. The rebuilt files use the colon names, to match the 1979 Director that runs here. Anything else taken from the 1980 listing needs the same translation.

## Open questions

- **Polarity.** Did Ken's Knight TV show white lines on black? Lit dots are white here, and `COLORPOSITIVE` gives dark on light.
- **`MAKETURTLE` in ANINIT.** `KEN;ANINIT`'s `see-all` calls `(maketurtle 'real-border (wf ...) (wf ...))` with the turtle's name first. TVRTLE 542's `MAKETURTLE` takes only the draw and erase forms, which would make the border appear only on erasing. The three-argument form is read here as (turtle, draw form, erase form). The 1978 TVRTLE may have differed.
- **Which TVRTLE.** TVRTLE 542 is the version in PDP-10/its, of unknown date; Ken used whatever was on `AI:LLOGO;` in 1978. Details such as `PENCOLOR` in the black-and-white build and the one-argument `SETHOME` may have been different.
- **The film's background.** It is dark blue, but `INITIALIZE-PALETTE` makes the eraser color black. Was the color map changed, or is it the film transfer?
- **Line widths.** The film shows heavier lines than one dot. Is that the camera, or did the color system's interlace double the lines (as TVRTLE's two-line `OUTLINE` suggests)?
- **The 1979 `DL`.** Did it measure drawings on a scratchpad turtle (1976) or on the current one (1980)? The two differ only in what happens to the turtle, and here it is put back.
- **`many-polys`.** The actor and `draw-many-polys` are guessed. Ani's film depends on them, so they deserve a closer look against the film frames in Phase 5.
- **The 1979 fonts** (`PLASMA;TVFONT`, `TR18`, `TR12B`, `25VMIC`, `37VXMS`) are lost. The TEXT actor's default font, `tvfont`, therefore has no file, and the demos use the 1976 `25FG`.

## Running it

- **The tests:** `npm test` runs `test/tv.test.js` with the rest.
- **The demos:** `node tools/tv-demo.mjs`, or name the ones you want, e.g. `node tools/tv-demo.mjs fred movie`.
- **In Director:** `node tools/boot-director.mjs "(cs)" "(ask poly show)"`.
- **In a browser:** serve the project over HTTP, e.g. with `python -m http.server`, and open `test/tv.html`. It draws both builds through the Canvas renderer and reports PASS or FAIL.
