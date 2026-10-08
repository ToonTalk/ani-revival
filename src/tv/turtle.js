// LLOGO's TV turtle (AI:LLOGO;TVRTLE, and LLOGO;COLORT, its color build), as
// built-in Lisp functions over a FrameBuffer.
//
// This is a port of TVRTLE 542 (PDP-10/its, src/llogo/tvrtle.542), function by
// function. Names in the comments are TVRTLE's. As in TVRTLE, the turtle's
// state lives in Lisp special variables (:XCOR, :YCOR, :HEADING, :PENSTATE,
// TV-PICTURE-LEFT, :TVSTEP, ...), so Lisp code that reads them, as Director's
// OBJECT does, sees what it saw in 1979. Each turtle's private variables are
// swapped in and out of those symbols by USETURTLE, from an array on the
// turtle's TURTLE property, exactly as TVRTLE does.
//
// What differs from the PDP-10:
//  - flonums are JavaScript doubles, not 27-bit PDP-10 floats;
//  - TV memory is a FrameBuffer (see framebuffer.js) rather than the PDP-11's;
//  - color windows keep one run per array element (TVRTLE packed two a word);
//  - MARK (text in the TV's own character set) prints on the terminal;
//  - SHADE uses a plain scan-line fill (TVRTLE's own algorithm is long);
//  - XGP, SAVEDISPLAY, BRUSH, EXPAND, READSKETCH and SAVEWINDOWS are absent.
// See reports/TV-TURTLE.md for the full account.

import { Sym, Cons, Flonum, LArray, LispError, UNBOUND } from "../maclisp/types.js";

// TVRTLE's per-turtle variables (INITIAL-TURTLE-PROPERTIES), in its order,
// with their values for a newly hatched turtle (INITIAL-HATCH-PROPERTIES).
const TURTLE_PROPERTIES = [
  "TV-PICTURE-CENTER-X", "TV-PICTURE-CENTER-Y", ":XCOR", ":YCOR", ":HEADING",
  "SINE-HEADING", "COSINE-HEADING", ":PENSTATE", ":ERASERSTATE", ":XORSTATE",
  ":DRAWSTATE", ":WRAP", ":CLIP", ":SEETURTLE", ":DRAWTURTLE", ":ERASETURTLE",
  ":PENCOLOR", ":PENNUMBER", ":BRUSH", "BRUSH-INFO", "BRUSH-PICTURE",
  "HORIZONTAL", "VERTICAL", ":OFFSCREEN",
];
const SEETURTLE_INDEX = 13; // :SEETURTLE-INDEX
const HORIZONTAL_LINE_INDEX = 21;
const VERTICAL_LINE_INDEX = 22;

// Fixed-point arithmetic for vectors (FIX-BITS and friends).
const FIX_BITS = 22;
const UNIT_BIT = 2 ** FIX_BITS;
const HALF_UNIT = UNIT_BIT / 2;
const FLOAT_UNIT = UNIT_BIT;

// The pen, eraser and XOR markers (PEN-WINDOW, ERASER-WINDOW, XOR-WINDOW):
// seven rows of seven dots, from the 36-bit words in TVRTLE.
const MARKER_WORDS = {
  pen: [-536870912, -536870912, -536870912, -536870912, -536870912, -536870912, -536870912],
  eraser: [-536870912, -33822867456, -33822867456, -33822867456, -33822867456, -33822867456, -536870912],
  xor: [-16642998272, 27380416512, 16106127360, 6442450944, 16106127360, 27380416512, -16642998272],
};

// The bit at position k (0 = leftmost) of a 36-bit word given as a signed or
// unsigned number.
export function wordBit(word, k) {
  const u = word < 0 ? word + 2 ** 36 : word;
  return Math.floor(u / 2 ** (35 - k)) % 2;
}

// Random pattern words: 32 random dots in the top of a 36-bit word, the low 4
// bits clear (TVRTLE's (BITWISE-AND -16. (RANDOM))).
const randomBits = (L) => ((L.random() << 1) ^ L.random()) | 0;
const toWord = (bits32) => bits32 * 16;

const ROUND = (x) => Math.floor(x + 0.5); // LLOGO's ROUND: (FIX (+$ X 0.5))
const FIX = Math.floor; // MacLisp's FIX and IFIX of a flonum
const TRUNCATE_FIX = (f) => Math.floor(f / UNIT_BIT);
const FIXIFY = (x) => ROUND(x * FLOAT_UNIT);
const MOD$ = (a, m) => a - m * FIX(a / m); // TVRTLE's \$

export { randomBits, toWord };

export class TvTurtle {
  // L: the Lisp; display: a FrameBuffer; color: run as LLOGO;COLORT.
  constructor(L, display, { color = display.color } = {}) {
    this.L = L;
    this.display = display;
    this.color = color;
    this.windowsCache = new WeakMap();
    this.defineVariables();
    this.QMARK = L.intern("?");
  }

  // ---------------------------------------------------------------- variables

  defineVariables() {
    const L = this.L;
    const { NIL, T } = L;
    const num = (v) => (typeof v === "number" ? v : v instanceof Flonum ? v.value : NaN);
    const truthy = (v) => v !== NIL && v !== UNBOUND && v !== undefined;
    this.sym = {};
    const def = (prop, name, type) => {
      const s = L.intern(name);
      this.sym[prop] = s;
      let get;
      let set;
      if (type === "flo") {
        get = () => num(s.value);
        set = (x) => {
          s.value = new Flonum(x);
        };
      } else if (type === "fix") {
        get = () => num(s.value);
        set = (x) => {
          s.value = x;
        };
      } else if (type === "bool") {
        get = () => truthy(s.value);
        set = (b) => {
          s.value = b ? T : NIL;
        };
      } else {
        get = () => s.value;
        set = (x) => {
          s.value = x;
        };
      }
      Object.defineProperty(this, prop, { get, set, configurable: true });
    };
    // per-turtle
    def("centerX", "TV-PICTURE-CENTER-X", "fix");
    def("centerY", "TV-PICTURE-CENTER-Y", "fix");
    def("xcor", ":XCOR", "flo");
    def("ycor", ":YCOR", "flo");
    def("heading", ":HEADING", "flo");
    def("sineHeading", "SINE-HEADING", "flo");
    def("cosineHeading", "COSINE-HEADING", "flo");
    def("penstate", ":PENSTATE", "bool");
    def("eraserstate", ":ERASERSTATE", "bool");
    def("xorstate", ":XORSTATE", "bool");
    def("drawstate", ":DRAWSTATE", "obj");
    def("wrapMode", ":WRAP", "bool");
    def("clipMode", ":CLIP", "bool");
    def("seeturtle", ":SEETURTLE", "bool");
    def("drawturtleForm", ":DRAWTURTLE", "obj");
    def("eraseturtleForm", ":ERASETURTLE", "obj");
    def("pencolorName", ":PENCOLOR", "obj");
    def("pennumber", ":PENNUMBER", "fix");
    def("offscreenMode", ":OFFSCREEN", "obj");
    // global
    def("turtleName", ":TURTLE", "obj");
    def("turtles", ":TURTLES", "obj");
    def("windowsList", ":WINDOWS", "obj");
    def("tvstep", ":TVSTEP", "flo");
    def("twiceTvstep", "TWICE-TVSTEP", "flo");
    def("pictureTop", "TV-PICTURE-TOP", "fix");
    def("pictureBottom", "TV-PICTURE-BOTTOM", "fix");
    def("pictureLeft", "TV-PICTURE-LEFT", "fix");
    def("pictureRight", "TV-PICTURE-RIGHT", "fix");
    def("pictureHalfX", "TV-PICTURE-HALF-X", "fix");
    def("pictureHalfY", "TV-PICTURE-HALF-Y", "fix");
    def("pictureSizeX", "TV-PICTURE-SIZE-X", "fix");
    def("pictureSizeY", "TV-PICTURE-SIZE-Y", "fix");
    def("pictureMin", "TV-PICTURE-MIN", "fix");
    def("shiftX", "TV-SHIFT-X", "fix");
    def("shiftY", "TV-SHIFT-Y", "fix");
    def("floatShiftX", "FLOAT-TV-SHIFT-X", "flo");
    def("floatShiftY", "FLOAT-TV-SHIFT-Y", "flo");
    def("floatPictureLeft", "FLOAT-TV-PICTURE-LEFT", "flo");
    def("floatPictureBottom", "FLOAT-TV-PICTURE-BOTTOM", "flo");
    def("floatPictureSizeX", "FLOAT-TV-PICTURE-SIZE-X", "flo");
    def("floatPictureSizeY", "FLOAT-TV-PICTURE-SIZE-Y", "flo");
    def("pictureLeftFix", "TV-PICTURE-LEFT-FIX", "fix");
    def("pictureBottomFix", "TV-PICTURE-BOTTOM-FIX", "fix");
    def("tvFactorX", "TV-FACTOR-X", "flo");
    def("tvFactorY", "TV-FACTOR-Y", "flo");
    def("turtlePictureMin", "TURTLE-PICTURE-MIN", "flo");
    def("turtleFrontRadius", "TURTLE-FRONT-RADIUS", "flo");
    def("turtleSideRadius", "TURTLE-SIDE-RADIUS", "flo");
    def("turtlePictureSizeX", "TURTLE-PICTURE-SIZE-X", "flo");
    def("turtlePictureSizeY", "TURTLE-PICTURE-SIZE-Y", "flo");
    def("turtlePictureTop", "TURTLE-PICTURE-TOP", "flo");
    def("turtlePictureBottom", "TURTLE-PICTURE-BOTTOM", "flo");
    def("turtlePictureLeft", "TURTLE-PICTURE-LEFT", "flo");
    def("turtlePictureRight", "TURTLE-PICTURE-RIGHT", "flo");
    def("turtleWindowSize", "TURTLE-WINDOW-SIZE", "flo");
    def("tvechoLines", ":TVECHOLINES", "fix");
    def("echolines", ":ECHOLINES", "obj");
    def("outlineFlag", ":OUTLINE", "bool");
    def("windowOutline", ":WINDOWOUTLINE", "bool");
    def("carefulTurtle", ":CAREFULTURTLE", "bool");
    def("drawmodeVar", ":DRAWMODE", "fix");
    def("colors", ":COLORS", "obj");
    def("ncolors", ":NCOLORS", "fix");
    def("erasercolorName", ":ERASERCOLOR", "obj");
    def("erasernumber", ":ERASERNUMBER", "fix");
    def("pi", ":PI", "flo");
    def("piOver180", "PI-OVER-180", "flo");
    def("polygon", ":POLYGON", "flo");
    this.turtlePropertySyms = TURTLE_PROPERTIES.map((n) => L.intern(n));
  }

  get noValue() {
    const v = this.L.intern("NO-VALUE").value;
    return v === UNBOUND ? this.QMARK : v;
  }

  // Bind special variables around fn, as TVRTLE's LET does.
  withBindings(pairs, fn) {
    const L = this.L;
    const mark = L.specpdl.length;
    try {
      for (const [s, v] of pairs) L.bind(s, v);
      return fn();
    } finally {
      L.unbindTo(mark);
    }
  }

  // The usual (:SEETURTLE NIL) (:TURTLES NIL) and sometimes (:DRAWSTATE NIL).
  quietly(fn, { drawstate = false } = {}) {
    const { NIL } = this.L;
    const pairs = [
      [this.sym.seeturtle, NIL],
      [this.sym.turtles, NIL],
    ];
    if (drawstate) pairs.push([this.sym.drawstate, NIL]);
    return this.withBindings(pairs, fn);
  }

  // ERRBREAK: print the complaint and break, as TVRTLE does. The break
  // handler decides (it may throw); if it returns, so does ERRBREAK, with its
  // value, and TVRTLE carries on.
  errbreak(fn, message) {
    const L = this.L;
    const msg = typeof message === "string" ? L.intern(message) : message;
    L.out(`;${fn} ${L.print(msg, false)}\n`);
    return L.breakHandler(L.list(L.intern(fn), msg));
  }

  // An ERRBREAK after which TVRTLE could not sensibly go on.
  fatal(fn, message) {
    this.errbreak(fn, message);
    throw new LispError(`${fn}: ${typeof message === "string" ? message : this.L.print(message, false)}`, this.L.intern(fn));
  }

  notImplementedInColor(form) {
    this.L.out(`;${this.L.print(form)} NOT IMPLEMENTED IN COLOR TURTLE\n`);
    return this.noValue;
  }

  // ---------------------------------------------------------------- drawing modes

  // The drawmode constants: the PDP-11 ALU function codes (black and white),
  // or the color system's write modes (DRAWMODE does nothing in color).
  setDrawmodeConstants() {
    const L = this.L;
    const set = (n, v) => {
      L.intern(n).value = v;
    };
    if (this.color) {
      set("IOR", 0o100);
      set("XOR", 0o200);
      set("SET", 0o300);
    } else {
      set("ANDC", 536870912);
      set("SETZ", 805306368);
      set("COMP", 1342177280);
      set("XOR", 1610612736);
      set("EQV", 2415919104);
      set("SAME", 2684354560);
      set("AND", 2952790016);
      set("SETO", 3221225472);
      set("IOR", 3758096384);
      set("SET", 4026531840);
    }
    this.aluByCode = new Map([
      [536870912, "ANDC"], [805306368, "SETZ"], [1342177280, "COMP"], [1610612736, "XOR"],
      [2415919104, "EQV"], [2684354560, "SAME"], [2952790016, "AND"], [3221225472, "SETO"],
      [3758096384, "IOR"], [4026531840, "SET"],
    ]);
    this.IOR = 3758096384;
    this.ANDC = 536870912;
    this.XOR = 1610612736;
    this.SET = 4026531840;
  }

  // SELECT-DRAWMODE: load the ALU register unless :DRAWMODE already names
  // the mode (TVRTLE compares with the variable, not the register).
  selectDrawmode(mode) {
    if (this.color) return;
    if (this.drawmodeVar === mode) return;
    const name = this.aluByCode.get(mode);
    if (name) this.display.setAlu(name);
  }

  // DRAWMODE: returns the previous mode, for easy LAMBDA-binding.
  drawmode(mode) {
    if (this.color) return 0;
    const old = this.drawmodeVar;
    this.selectDrawmode(mode);
    this.drawmodeVar = mode;
    return old;
  }

  withDrawmode(mode, fn) {
    if (this.color) return fn();
    const old = this.drawmode(mode);
    try {
      return fn();
    } finally {
      this.drawmode(old);
    }
  }

  selectColor(n) {
    if (this.color) this.display.selectColor(n);
  }

  // RESELECT-COLOR
  reselectColor() {
    if (this.color) this.selectColor(this.eraserstate ? this.erasernumber : this.pennumber);
  }

  // The mode for the current pen state (after USETURTLE, user turtles, ...).
  restorePenMode() {
    if (this.color) this.reselectColor();
    else this.drawmode(this.eraserstate ? this.ANDC : this.xorstate ? this.XOR : this.IOR);
  }

  // FLIPCOLORS: change the complement bit in the TV's last word through the ALU.
  flipcolors(mode) {
    const old = this.drawmode(mode);
    const fb = this.display;
    const name = this.aluByCode.get(mode);
    const bit = fb.complemented ? 1 : 0;
    const f = { IOR: bit | 1, ANDC: 0, XOR: bit ^ 1, SET: 1, SETZ: 0, SETO: 1, SAME: bit }[name];
    if (f !== undefined) fb.complemented = !!f;
    fb.changed();
    this.drawmode(old);
  }

  // ---------------------------------------------------------------- the palette

  palette(i) {
    return this.paletteArray[i] || this.L.NIL;
  }

  // INITIALIZE-PALETTE
  initializePalette() {
    const L = this.L;
    const { NIL } = L;
    this.intensityMax = 511.0;
    this.colors = NIL;
    this.ncolors = 0;
    this.pencolorName = L.intern("WHITE");
    this.pennumber = 0;
    this.erasercolorName = L.intern("BLACK");
    this.erasernumber = 15;
    L.intern(":COLORTICK").value = new Flonum(0.1);
    this.paletteArray = new Array(16).fill(NIL);
    this.paletteLArray = new LArray("T", [16]);
    this.paletteLArray.data = this.paletteArray;
    L.putprop(L.intern("PALETTE"), this.paletteLArray, L.S.ARRAY);
    L.putprop(NIL, 0, L.intern("RED"));
    L.putprop(NIL, 0, L.intern("BLUE"));
    L.putprop(NIL, 0, L.intern("GREEN"));
    this.erasercolor(this.makecolor(L.intern("BLACK"), 0, 0, 0));
    this.makepalette(this.pennumber, this.makecolor(L.intern("WHITE"), 1, 1, 1));
    for (const [n, r, g, b] of [
      ["LIGHTGRAY", 0.75, 0.75, 0.75], ["GOLD", 1.0, 0.75, 0.0], ["BROWN", 0.3, 0.2, 0.0],
      ["PINK", 1.0, 0.5, 0.5], ["DARKGRAY", 0.25, 0.25, 0.25], ["GRAY", 0.5, 0.5, 0.5],
      ["ORANGE", 1.0, 0.5, 0.0], ["PURPLE", 0.5, 0.0, 1.0], ["CYAN", 0.0, 1.0, 1.0],
      ["MAGENTA", 1.0, 0.0, 1.0], ["YELLOW", 1.0, 1.0, 0.0], ["BLUE", 0.0, 0.0, 1.0],
      ["GREEN", 0.0, 1.0, 0.0], ["RED", 1.0, 0.0, 0.0],
    ]) {
      this.makecolor(L.intern(n), r, g, b);
    }
  }

  // MAKECOLOR: intensities as fractions from 0.0 to 1.0.
  makecolor(name, red, green, blue) {
    const L = this.L;
    const check = (x) => {
      if (x < 0 || x > 1) this.fatal("MAKECOLOR", L.list(new Flonum(x), L.intern("SHOULD BE BETWEEN 0.0 AND 1.0")));
      return x;
    };
    L.putprop(name, ROUND(check(red) * this.intensityMax), L.intern("RED"));
    L.putprop(name, ROUND(check(green) * this.intensityMax), L.intern("GREEN"));
    L.putprop(name, ROUND(check(blue) * this.intensityMax), L.intern("BLUE"));
    if (!L.toArray(this.colors).includes(name)) {
      this.colors = new Cons(name, this.colors);
      this.ncolors = this.ncolors + 1;
    }
    return name;
  }

  colorPart(color, part) {
    const v = this.L.get(color, this.L.intern(part));
    if (v === this.L.NIL) return this.fatal(`${part}PART`, this.L.list(color, this.L.intern("IS NOT A COLOR")));
    return new Flonum(this.L.num.val(v) / this.intensityMax);
  }

  // MAKEPALETTE
  makepalette(index, name) {
    const L = this.L;
    if (index === this.pennumber) this.pencolorName = name;
    else if (index === this.erasernumber) this.erasercolorName = name;
    if (this.color) {
      const g = (c) => {
        const v = L.get(name, L.intern(c));
        return typeof v === "number" ? v : v instanceof Flonum ? Math.round(v.value) : 0;
      };
      this.display.writeColorMap(index, g("RED"), g("GREEN"), g("BLUE"));
    }
    this.paletteArray[index] = name;
    return name;
  }

  // INTERN-COLOR: the slot holding a color, putting it in a free one if
  // need be; -1 when the color map is full.
  internColor(name) {
    if (name === this.erasercolorName) {
      this.makepalette(this.erasernumber, this.erasercolorName);
      return this.erasernumber;
    }
    if (name === this.pencolorName) {
      this.makepalette(this.pennumber, this.pencolorName);
      return this.pennumber;
    }
    for (let i = 0; i !== this.erasernumber; i++) {
      if (this.paletteArray[i] === name || this.paletteArray[i] === this.L.NIL) {
        this.makepalette(i, name);
        return i;
      }
    }
    return -1;
  }

  // PENCOLOR
  pencolor(name) {
    const L = this.L;
    if (this.color) this.eraseTurtle();
    if (typeof name === "number") {
      const p = this.palette(name);
      if (p === L.NIL) this.fatal("PENCOLOR", L.list(name, L.intern("IS NOT A COLOR NUMBER")));
      this.pennumber = name;
      this.pencolorName = p;
    } else if (L.get(name, L.intern("RED")) !== L.NIL) {
      const i = this.internColor(name);
      if (i < 0) this.fatal("PENCOLOR", "TOO MANY COLORS");
      this.pencolorName = name;
      this.pennumber = i;
    } else if (this.pencolorName === L.NIL) {
      this.pencolor(this.erasernumber);
    } else {
      this.fatal("PENCOLOR", L.list(name, L.intern("IS NOT A COLOR")));
    }
    if (this.color) {
      this.reselectColor();
      this.drawTurtle();
    }
    return name;
  }

  // ERASERCOLOR: the background color, for CLEARSCREEN and the eraser.
  erasercolor(name) {
    this.makepalette(this.erasernumber, name);
    return name;
  }

  deletecolor(name) {
    const L = this.L;
    const i = this.internColor(name);
    if (name === this.pencolorName) return this.fatal("DELETECOLOR", "CAN'T ERASE CURRENT PEN COLOR");
    if (name === this.erasercolorName) return this.fatal("DELETECOLOR", "CAN'T ERASE CURRENT ERASER COLOR");
    if (i < 0) return this.fatal("ERASECOLOR", L.list(name, L.intern("IS NOT A COLOR ON THE PALETTE")));
    this.paletteArray[i] = L.NIL;
    if (this.color) {
      const g = (c) => this.L.num.val(L.get(this.erasercolorName, L.intern(c)));
      this.display.writeColorMap(this.erasernumber, g("RED"), g("GREEN"), g("BLUE"));
    }
    return L.NIL;
  }

  replacecolor(oldColor, newColor) {
    for (let i = 0; i <= this.erasernumber; i++) if (this.paletteArray[i] === oldColor) this.makepalette(i, newColor);
    return newColor;
  }

  // CLEAR-PALETTE: after the screen is cleared, only the pen and eraser
  // colors remain in the color map.
  clearPalette() {
    this.pennumber = 0;
    this.makepalette(0, this.pencolorName);
    for (let i = 1; i !== this.erasernumber; i++) this.paletteArray[i] = this.L.NIL;
    if (this.color) this.selectColor(0);
    this.erasercolor(this.erasercolorName);
  }

  // ---------------------------------------------------------------- initialization

  // Done when the file is loaded: TVRTLE's top-level SETQs.
  initializeGlobals() {
    const L = this.L;
    const { NIL } = L;
    this.screenCenterX = 288;
    this.screenBottom = 455;
    this.screenRight = 575;
    this.screenCenterY = Math.trunc(455 / 2);
    this.tolerance = 1.0e-3;
    this.twiceTolerance = 2.0 * this.tolerance;
    this.pi = 3.1415926;
    this.piOver180 = this.pi / 180.0;
    this.polygon = 30.0;
    this.echolines = NIL;
    this.sine120 = Math.sin(120.0 * this.piOver180);
    this.cosine120 = Math.cos(120.0 * this.piOver180);
    this.sine240 = Math.sin(240.0 * this.piOver180);
    this.cosine240 = Math.cos(240.0 * this.piOver180);
    this.tvTurtleFrontRadius = 15.0;
    this.tvTurtleSideRadius = 10.0;
    this.windowsList = NIL;
    this.tvSizeXMax = 573;
    this.tvSizeYMax = this.color ? 448 : 415;
    this.pennumber = 15;
    this.erasernumber = 15;
    this.windowframeBounds = null;
    this.setDrawmodeConstants();
    this.drawmodeVar = this.color ? 0o300 : this.IOR;
    this.display.setAlu("IOR");
    const sym = (n) => L.intern(n);
    this.hatchProperties = [
      288, 152, new Flonum(0), new Flonum(0), new Flonum(0), new Flonum(0), new Flonum(1),
      L.T, NIL, NIL, L.T, NIL, NIL, NIL, NIL, NIL, sym("WHITE"), 0, NIL, NIL, NIL,
      sym("HORIZONTAL-LINE"), sym("VERTICAL-LINE"), NIL,
    ];
    L.intern(":PATTERNS").value = L.list(...["SOLID", "GRID", "CHECKER", "HORIZLINES", "VERTLINES", "DARKTEXTURE", "LIGHTTEXTURE", "TEXTURE"].map(sym));
  }

  // INITIALIZE-TVRTLE-VARIABLES
  initializeTvrtleVariables() {
    const L = this.L;
    const { NIL, T } = L;
    this.pictureTop = this.color ? 2 : 1;
    this.pictureBottom = 301;
    this.pictureBottomFix = this.pictureBottom * UNIT_BIT;
    this.floatPictureBottom = this.pictureBottom;
    this.pictureLeft = 138;
    this.pictureLeftFix = this.pictureLeft * UNIT_BIT;
    this.floatPictureLeft = this.pictureLeft;
    this.pictureRight = 438;
    this.centerX = 288;
    this.centerY = 151;
    this.shiftX = this.centerX - this.pictureLeft;
    this.floatShiftX = this.shiftX + 0.5;
    this.shiftY = this.pictureBottom - this.centerY;
    this.floatShiftY = this.shiftY + 0.5;
    this.pictureHalfX = 150;
    this.pictureHalfY = 150;
    this.pictureSizeX = 301;
    this.floatPictureSizeX = 300.0;
    this.pictureSizeY = 301;
    this.floatPictureSizeY = 300.0;
    this.pictureMin = 301;
    this.tvFactorX = 1.0;
    this.tvFactorY = 1.0;
    this.turtlePictureMin = 1000.0;
    this.tvstep = this.turtlePictureMin / (this.pictureMin - this.twiceTolerance);
    this.twiceTvstep = 2.0 * this.tvstep;
    this.turtleFrontRadius = this.tvTurtleFrontRadius * this.tvstep;
    this.turtleSideRadius = this.tvTurtleSideRadius * this.tvstep;
    this.turtlePictureSizeX = 1000.0;
    this.turtlePictureSizeY = 1000.0;
    this.turtlePictureTop = 500.0;
    this.turtlePictureBottom = -500.0;
    this.turtlePictureLeft = -500.0;
    this.turtlePictureRight = 500.0;
    this.xcor = 0.0;
    this.ycor = 0.0;
    this.heading = 0.0;
    this.sineHeading = 0.0;
    this.cosineHeading = 1.0;
    this.penstate = true;
    this.eraserstate = false;
    this.xorstate = false;
    this.drawstate = L.intern("PEN");
    this.wrapMode = false;
    this.clipMode = false;
    this.offscreenMode = NIL;
    this.seeturtle = false;
    this.drawturtleForm = NIL;
    this.eraseturtleForm = NIL;
    this.turtles = L.list(L.intern("LOGOTURTLE"));
    this.turtleName = L.intern("LOGOTURTLE");
    this.tvechoLines = 10;
    for (const n of [":BRUSH", "BRUSH-INFO", "BRUSH-PICTURE"]) L.intern(n).value = NIL;
    L.intern("HORIZONTAL").value = L.intern("HORIZONTAL-LINE");
    L.intern("VERTICAL").value = L.intern("VERTICAL-LINE");
    this.windowOutline = !this.color;
    this.outlineFlag = !this.color;
    this.carefulTurtle = false;
    this.turtleWindowSize = 50.0;
    this.hatchProperties[HORIZONTAL_LINE_INDEX] = L.intern("HORIZONTAL-LINE");
    this.hatchProperties[VERTICAL_LINE_INDEX] = L.intern("VERTICAL-LINE");
    L.putprop(L.intern("LOGOTURTLE"), this.newTurtleArray(this.turtlePropertySyms.map(() => NIL)), L.intern("TURTLE"));
    void T;
  }

  newTurtleArray(values) {
    const a = new LArray("T", [TURTLE_PROPERTIES.length]);
    a.data = values.slice();
    return a;
  }

  // ---------------------------------------------------------------- scaling

  turtleSizeX(newSize) {
    const f = newSize / this.turtlePictureSizeX;
    this.turtlePictureSizeX = newSize;
    this.turtleWindowSize = this.turtleWindowSize * f;
    this.turtlePictureLeft = this.turtlePictureLeft * f;
    this.turtlePictureRight = this.turtlePictureRight * f;
  }

  turtleSizeY(newSize) {
    const f = newSize / this.turtlePictureSizeY;
    this.turtlePictureSizeY = newSize;
    this.turtlePictureTop = this.turtlePictureTop * f;
    this.turtlePictureBottom = this.turtlePictureBottom * f;
  }

  // TURTLESIZE [size]: the number of turtle steps across the smaller
  // dimension of the picture. Returns (size-x size-y).
  turtlesize(args) {
    if (args.length === 1) {
      this.eraseTurtle();
      this.turtlePictureMin = this.L.num.val(args[0]);
      this.tvstep = this.turtlePictureMin / (this.pictureMin - this.twiceTolerance);
      this.twiceTvstep = 2.0 * this.tvstep;
      this.turtleFrontRadius = this.tvTurtleFrontRadius * this.tvstep;
      this.turtleSideRadius = this.tvTurtleSideRadius * this.tvstep;
      this.turtleSizeX(this.turtlePictureMin * this.tvFactorX);
      this.turtleSizeY(this.turtlePictureMin * this.tvFactorY);
      this.drawTurtle();
    }
    return this.L.list(new Flonum(this.turtlePictureSizeX), new Flonum(this.turtlePictureSizeY));
  }

  // TV-SETHOME
  tvSethome(newX, newY) {
    const shiftX = (newX - this.centerX) * this.tvstep;
    const shiftY = (this.centerY - newY) * this.tvstep;
    this.centerX = newX;
    this.centerY = newY;
    this.shiftX = this.centerX - this.pictureLeft;
    this.floatShiftX = this.shiftX + 0.5;
    this.shiftY = this.pictureBottom - this.centerY;
    this.floatShiftY = this.shiftY + 0.5;
    this.turtlePictureRight = this.turtlePictureRight - shiftX;
    this.turtlePictureLeft = this.turtlePictureLeft - shiftX;
    this.turtlePictureTop = this.turtlePictureTop - shiftY;
    this.turtlePictureBottom = this.turtlePictureBottom - shiftY;
  }

  // SETHOME [x y] or [(x y)]: make a point the turtle's origin.
  sethome(args) {
    const val = this.L.num.val;
    this.eraseTurtle();
    // With one argument, a point, TVRTLE 542 takes its CAR for y as well as x.
    const hx = args.length === 0 ? this.xcor : args.length === 1 ? val(args[0].car) : val(args[0]);
    const hy = args.length === 0 ? this.ycor : args.length === 1 ? val(args[0].car) : val(args[1]);
    this.quietly(
      () => {
        if (this.offscreenMode !== this.L.NIL || !this.outOfBoundsCheck(hx, hy)) {
          this.tvSethome(this.tvX(hx), this.tvY(hy));
          this.setxy$(0.0, 0.0);
        }
      },
      { drawstate: true },
    );
    this.drawTurtle();
    return this.noValue;
  }

  // INTERNAL-TV-SIZE
  internalTvSize(newX, newY) {
    const L = this.L;
    if (newX > newY) {
      this.pictureMin = newY + 1;
      this.tvFactorY = 1.0;
      this.tvFactorX = newX / newY;
    } else {
      this.pictureMin = newX + 1;
      this.tvFactorX = 1.0;
      this.tvFactorY = newY / newX;
    }
    const convX = newX / this.floatPictureSizeX;
    const convY = newY / this.floatPictureSizeY;
    this.pictureHalfX = newX >> 1;
    this.shiftX = ROUND(this.shiftX * convX);
    this.floatShiftX = this.shiftX + 0.5;
    this.pictureSizeX = newX + 1;
    this.floatPictureSizeX = newX;
    this.pictureLeft = this.screenCenterX - this.pictureHalfX;
    this.floatPictureLeft = this.pictureLeft;
    this.pictureLeftFix = this.pictureLeft * UNIT_BIT;
    this.pictureRight = this.screenCenterX + this.pictureHalfX;
    this.centerX = this.pictureLeft + this.shiftX;
    this.pictureHalfY = newY >> 1;
    this.shiftY = ROUND(this.shiftY * convY);
    this.floatShiftY = this.shiftY + 0.5;
    this.pictureSizeY = newY + 1;
    this.floatPictureSizeY = newY;
    this.pictureBottom = this.pictureTop + (this.pictureHalfY << 1);
    this.pictureBottomFix = this.pictureBottom * UNIT_BIT;
    this.floatPictureBottom = this.pictureBottom;
    this.centerY = this.pictureBottom - this.shiftY;
    this.tvechoLines = Math.trunc((this.screenBottom - this.pictureBottom - 24) / 12);
    // update the homes of the other turtles
    for (const t of L.toArray(this.turtles)) {
      if (t === this.turtleName) continue;
      const arr = L.get(t, L.intern("TURTLE"));
      if (!(arr instanceof LArray)) continue;
      arr.data[0] = this.screenCenterX + ROUND(convX * (arr.data[0] - this.screenCenterX));
      arr.data[1] = this.pictureTop + ROUND(convY * (arr.data[1] - this.pictureTop));
    }
    this.hatchProperties[1] = this.pictureTop + this.pictureHalfY;
    this.createEchoArea(this.tvechoLines);
  }

  // CREATE-ECHO-AREA: the split screen, Lisp's text below the picture. The
  // text itself isn't drawn here; the area below the part TV-CLEARSCREEN
  // clears is blanked, as starting the split screen gave a clean text area.
  createEchoArea(lines) {
    if (this.color) return 0;
    this.echolines = lines;
    const fb = this.display;
    const first = Math.max(0, this.screenBottom - lines * 12 - 12);
    if (first < fb.height) {
      fb.pixels.fill(0, first * fb.width);
      fb.changed();
    }
    return lines;
  }

  // TVSIZE [x [y]]: the size of the picture area in TV dots. Returns (x y).
  tvsize(args) {
    const L = this.L;
    if (args.length > 0) {
      let sx = args[0] === L.NIL ? this.pictureSizeX - 1 : args[0];
      let sy = args.length === 2 ? (args[1] === L.NIL ? this.pictureSizeY - 1 : args[1]) : args[0];
      const check = (v, which) => {
        if (typeof v !== "number") this.fatal("TVSIZE", `WRONG TYPE INPUT FOR ${which} SIZE`);
        if (v < 30) this.fatal("TVSIZE", `${which === "X" ? "HORIZONTAL" : "VERTICAL"} SIZE TOO SMALL`);
        if (v > (which === "X" ? this.tvSizeXMax : this.tvSizeYMax)) this.fatal("TVSIZE", `${which === "X" ? "HORIZONTAL" : "VERTICAL"} SIZE TOO BIG`);
        return v % 2 === 1 ? v - 1 : v;
      };
      sx = check(sx, "X");
      sy = check(sy, "Y");
      this.internalTvSize(sx, sy);
      this.withBindings([[this.sym.seeturtle, L.NIL]], () => this.turtlesize([new Flonum(this.turtlePictureMin)]));
      this.clearscreen();
    }
    return L.list(this.pictureSizeX - 1, this.pictureSizeY - 1);
  }

  // SCALE: change the turtle size without moving the turtle on the screen.
  scale(factor) {
    const f = this.L.num.val(factor);
    this.quietly(
      () => {
        this.turtlesize([new Flonum(this.turtlePictureMin / f)]);
        this.setxy$(this.xcor / f, this.ycor / f);
      },
      { drawstate: true },
    );
  }

  // ---------------------------------------------------------------- coordinates

  turtleX(tvx) {
    return (tvx - this.centerX) * this.tvstep;
  }

  turtleY(tvy) {
    return this.tvstep * (this.centerY - tvy);
  }

  // TV-X: turtle x to TV x.
  tvX(x) {
    let raw = ROUND(x / this.tvstep) + this.shiftX;
    if (this.wrapMode) {
      raw %= this.pictureSizeX;
      if (raw < 0) raw += this.pictureSizeX;
    }
    return raw + this.pictureLeft;
  }

  tvY(y) {
    let raw = ROUND(y / this.tvstep) + this.shiftY;
    if (this.wrapMode) {
      raw %= this.pictureSizeY;
      if (raw < 0) raw += this.pictureSizeY;
    }
    return this.pictureBottom - raw;
  }

  // ---------------------------------------------------------------- clearing

  // TV-CLEARSCREEN
  tvClearscreen() {
    const fb = this.display;
    if (this.color) {
      fb.pixels.fill(this.erasernumber);
      fb.changed();
      this.reselectColor();
      return;
    }
    // zeros stored in SET mode into TV words 0 through 18 * (455 - 12 * echo
    // lines - 12): every line above that one, and its first word
    const echo = typeof this.echolines === "number" ? this.echolines : 0;
    const lines = Math.max(0, Math.min(fb.height, this.screenBottom - echo * 12 - 12));
    fb.pixels.fill(0, 0, lines * fb.width);
    if (lines < fb.height) fb.pixels.fill(0, lines * fb.width, lines * fb.width + 32);
    fb.changed();
  }

  // WIPECLEAN: clear the screen without moving the turtle.
  wipeclean() {
    const L = this.L;
    if (!this.color && this.echolines === L.NIL) return this.noValue; // NODISPLAY mode
    if (!this.color && this.echolines === 0) this.createEchoArea(this.tvechoLines);
    this.tvClearscreen();
    this.outline();
    this.clearPalette();
    this.drawTurtles();
    return this.noValue;
  }

  // CLEARSCREEN (CS)
  clearscreen() {
    const L = this.L;
    if (this.echolines !== L.NIL) {
      this.quietly(() => this.home(), { drawstate: true });
      this.reselectColor();
      this.wipeclean();
      return this.noValue;
    }
    return this.startdisplay();
  }

  // STARTDISPLAY (SD)
  startdisplay() {
    const L = this.L;
    if (this.color) this.colorTvinit();
    this.initializeTvrtleVariables();
    this.initializePalette();
    if (this.color) {
      this.echolines = 0;
      this.internalTvSize(this.tvSizeXMax, this.tvSizeYMax);
      this.turtlesize([new Flonum(this.turtlePictureMin)]);
    } else {
      this.createEchoArea(this.tvechoLines);
    }
    this.tvClearscreen();
    this.outline();
    this.hatch(L.intern("LOGOTURTLE"));
    return this.noValue;
  }

  // COLOR-TVINIT and COLOR-RESET: set write mode and the palette.
  colorTvinit() {
    this.drawmodeVar = 0o300;
    this.initializePalette();
    this.reselectColor();
  }

  // NODISPLAY (ND): in black and white, give the whole screen back to text.
  nodisplay() {
    if (!this.color) this.echolines = 0;
    return this.noValue;
  }

  // WIPE [window]: no argument, WIPECLEAN; a window, hide it where the turtle is.
  wipe(args) {
    if (args.length === 0) this.wipeclean();
    else this.hidewindow([args[0], new Flonum(this.xcor), new Flonum(this.ycor)]);
    return this.noValue;
  }

  // ---------------------------------------------------------------- lines

  horizontalLine(fromX, fromY, toX) {
    this.display.hline(fromX, fromY, toX);
  }

  verticalLine(fromX, fromY, toY) {
    this.display.vline(fromX, fromY, toY);
  }

  // OUTLINE: the border around the picture area, if :OUTLINE.
  outline() {
    if (!this.outlineFlag) return this.noValue;
    if (this.color) this.tvBox(this.pictureLeft, this.pictureRight, this.pictureBottom, this.pictureTop);
    else this.withDrawmode(this.IOR, () => this.tvBox(this.pictureLeft, this.pictureRight, this.pictureBottom, this.pictureTop));
    return this.noValue;
  }

  tvBox(left, right, bottom, top) {
    left -= 1;
    right += 1;
    this.horizontalLine(left, top - 1, right);
    if (this.color) {
      // two lines look better than one because of interlace
      this.horizontalLine(left, top - 2, right);
      this.horizontalLine(left, bottom + 2, right);
    }
    this.horizontalLine(left, bottom + 1, right);
    this.verticalLine(left, top, bottom);
    this.verticalLine(right, top, bottom);
  }

  // ---------------------------------------------------------------- vectors

  tvFixX(x) {
    return FIXIFY(x / this.tvstep + this.floatShiftX + this.floatPictureLeft);
  }

  tvFixY(y) {
    return FIXIFY(this.floatPictureBottom - (y / this.tvstep + this.floatShiftY));
  }

  // BOUNDED-VECTOR: a vector in turtle coordinates, within the picture.
  boundedVector(fromX, fromY, toX, toY) {
    this.boundedVectorFixRound(this.tvFixX(fromX), this.tvFixY(fromY), this.tvFixX(toX), this.tvFixY(toY));
  }

  // TVECTOR: a vector in TV coordinates.
  tvector(fromX, fromY, toX, toY) {
    this.boundedVectorFix(fromX * UNIT_BIT, fromY * UNIT_BIT, toX * UNIT_BIT, toY * UNIT_BIT);
  }

  boundedVectorFixRound(a, b, c, d) {
    this.boundedVectorFix(a + HALF_UNIT, b + HALF_UNIT, c + HALF_UNIT, d + HALF_UNIT);
  }

  // BOUNDED-VECTOR-FIX: shifted fixed-point TV coordinates. Steps along the
  // axis of greater change, drawing a horizontal (or vertical) run per step.
  boundedVectorFix(fromXFix, fromYFix, toXFix, toYFix) {
    let changeX = toXFix - fromXFix;
    let changeY = toYFix - fromYFix;
    const absX = Math.abs(changeX);
    const absY = Math.abs(changeY);
    const intPart = (f) => f - (((f % UNIT_BIT) + UNIT_BIT) % UNIT_BIT);
    if (absX > absY) {
      if (fromXFix > toXFix) {
        [fromXFix, toXFix] = [toXFix, fromXFix];
        [fromYFix, toYFix] = [toYFix, fromYFix];
        changeX = -changeX;
        changeY = -changeY;
      }
      if (intPart(fromYFix) === intPart(toYFix)) {
        this.horizontalLine(TRUNCATE_FIX(fromXFix), TRUNCATE_FIX(fromYFix), TRUNCATE_FIX(toXFix));
      } else {
        this.nearlyHorizontalVector(fromXFix, fromYFix, toXFix, toYFix, absX / absY, changeY < 0 ? -1 : 1);
      }
    } else {
      if (fromYFix > toYFix) {
        [fromYFix, toYFix] = [toYFix, fromYFix];
        [fromXFix, toXFix] = [toXFix, fromXFix];
        changeX = -changeX;
        changeY = -changeY;
      }
      if (intPart(fromXFix) === intPart(toXFix)) {
        this.verticalLine(TRUNCATE_FIX(fromXFix), TRUNCATE_FIX(fromYFix), TRUNCATE_FIX(toYFix));
      } else {
        this.nearlyVerticalVector(fromXFix, fromYFix, toXFix, toYFix, absY / absX, changeX < 0 ? -1 : 1);
      }
    }
  }

  nearlyHorizontalVector(fromXFix, fromYFix, toXFix, toYFix, slope, signY) {
    let fromX = TRUNCATE_FIX(fromXFix);
    const fromY = TRUNCATE_FIX(fromYFix);
    const toX = TRUNCATE_FIX(toXFix);
    const toY = TRUNCATE_FIX(toYFix);
    const fromYFrac = ((fromYFix % UNIT_BIT) + UNIT_BIT) % UNIT_BIT;
    const partialStep = FIXIFY(slope * ((signY < 0 ? fromYFrac : UNIT_BIT - fromYFrac) / FLOAT_UNIT));
    fromXFix += partialStep;
    let newFromX = TRUNCATE_FIX(fromXFix);
    if (newFromX > toX) newFromX = toX;
    this.horizontalLine(fromX, fromY, newFromX);
    fromX = newFromX;
    const slopeFix = FIXIFY(slope);
    let travelY = fromY + signY;
    for (; travelY !== toY; travelY += signY) {
      fromXFix += slopeFix;
      newFromX = TRUNCATE_FIX(fromXFix);
      if (newFromX > toX) newFromX = toX;
      this.horizontalLine(fromX, travelY, newFromX);
      fromX = newFromX;
    }
    this.horizontalLine(fromX, travelY, toX);
  }

  nearlyVerticalVector(fromXFix, fromYFix, toXFix, toYFix, slope, signX) {
    const fromX = TRUNCATE_FIX(fromXFix);
    let fromY = TRUNCATE_FIX(fromYFix);
    const toX = TRUNCATE_FIX(toXFix);
    const toY = TRUNCATE_FIX(toYFix);
    const fromXFrac = ((fromXFix % UNIT_BIT) + UNIT_BIT) % UNIT_BIT;
    const partialStep = FIXIFY(slope * ((signX < 0 ? fromXFrac : UNIT_BIT - fromXFrac) / FLOAT_UNIT));
    fromYFix += partialStep;
    let newFromY = TRUNCATE_FIX(fromYFix);
    if (newFromY > toY) newFromY = toY;
    this.verticalLine(fromX, fromY, newFromY);
    fromY = newFromY;
    const slopeFix = FIXIFY(slope);
    let travelX = fromX + signX;
    for (; travelX !== toX; travelX += signX) {
      fromYFix += slopeFix;
      newFromY = TRUNCATE_FIX(fromYFix);
      if (newFromY > toY) newFromY = toY;
      this.verticalLine(travelX, fromY, newFromY);
      fromY = newFromY;
    }
    this.verticalLine(travelX, fromY, toY);
  }

  // OUT-OF-BOUNDS-CHECK: T (after complaining) if the point is off the picture.
  outOfBoundsCheck(x, y) {
    const tol = this.tolerance;
    let msg = null;
    if (x - this.turtlePictureRight > tol) msg = "TURTLE MOVED OFF THE RIGHT SIDE OF THE SCREEN";
    else if (this.turtlePictureLeft - x > tol) msg = "TURTLE MOVED OFF THE LEFT SIDE OF THE SCREEN";
    else if (y - this.turtlePictureTop > tol) msg = "TURTLE MOVED OFF THE TOP OF THE SCREEN";
    else if (this.turtlePictureBottom - y > tol) msg = "TURTLE MOVED OFF THE BOTTOM OF THE SCREEN";
    if (!msg) return false;
    this.errbreak("SETXY$", msg);
    return true;
  }

  // ---------------------------------------------------------------- wrap mode

  screenX(x) {
    return FIX((x - this.turtlePictureLeft) / this.turtlePictureSizeX);
  }

  screenY(y) {
    return FIX((y - this.turtlePictureBottom) / this.turtlePictureSizeY);
  }

  screenFractionX(screen, x) {
    return (x - this.turtlePictureLeft - screen * this.turtlePictureSizeX) / this.turtlePictureSizeX;
  }

  screenFractionY(screen, y) {
    return (y - this.turtlePictureBottom - screen * this.turtlePictureSizeY) / this.turtlePictureSizeY;
  }

  fixifyScreenFractionX(f) {
    return this.pictureLeftFix + FIXIFY(f * this.floatPictureSizeX);
  }

  fixifyScreenFractionY(f) {
    return this.pictureBottomFix - FIXIFY(f * this.floatPictureSizeY);
  }

  // WRAP-VECTOR: a vector that wraps around the edges of the picture.
  wrapVector(fromX, fromY, toX, toY) {
    const fsx = this.screenX(fromX);
    const fsy = this.screenY(fromY);
    const tsx = this.screenX(toX);
    const tsy = this.screenY(toY);
    this.wrapScreenVector(
      fsx, this.screenFractionX(fsx, fromX), fsy, this.screenFractionY(fsy, fromY),
      tsx, this.screenFractionX(tsx, toX), tsy, this.screenFractionY(tsy, toY),
    );
  }

  wrapScreenVector(fsx, ffx, fsy, ffy, tsx, tfx, tsy, tfy, depth = 0) {
    if (depth > 10000) throw new LispError("WRAP-SCREEN-VECTOR: too many screens", this.L.NIL);
    if (fsx !== tsx) {
      const changeX = tsx - fsx + (tfx - ffx);
      const changeY = tsy - fsy + (tfy - ffy);
      let toEdgeX = -ffx;
      let fromEdge = 0.0;
      let toEdge = 1.0;
      let signX = -1;
      if (changeX > 0) {
        signX = 1;
        toEdgeX = 1.0 - ffx;
        fromEdge = 1.0;
        toEdge = 0.0;
      }
      let edgeFracY = ffy + toEdgeX * (changeY / changeX);
      let edgeScreenY = fsy;
      const fixEdge = FIX(edgeFracY);
      edgeScreenY += fixEdge;
      edgeFracY -= fixEdge;
      this.wrapScreenVector(fsx, ffx, fsy, ffy, fsx, fromEdge, edgeScreenY, edgeFracY, depth + 1);
      this.wrapScreenVector(fsx + signX, toEdge, edgeScreenY, edgeFracY, tsx, tfx, tsy, tfy, depth + 1);
    } else if (fsy !== tsy) {
      const changeX = tsx - fsx + (tfx - ffx);
      const changeY = tsy - fsy + (tfy - ffy);
      let toEdgeY = -ffy;
      let fromEdge = 0.0;
      let toEdge = 1.0;
      let signY = -1;
      if (changeY > 0) {
        signY = 1;
        toEdgeY = 1.0 - ffy;
        fromEdge = 1.0;
        toEdge = 0.0;
      }
      let edgeFracX = ffx + toEdgeY * (changeX / changeY);
      let edgeScreenX = fsx;
      const fixEdge = FIX(edgeFracX);
      edgeScreenX += fixEdge;
      edgeFracX -= fixEdge;
      this.wrapScreenVector(fsx, ffx, fsy, ffy, edgeScreenX, edgeFracX, fsy, fromEdge, depth + 1);
      this.wrapScreenVector(edgeScreenX, edgeFracX, fsy + signY, toEdge, tsx, tfx, tsy, tfy, depth + 1);
    } else {
      this.boundedVectorFixRound(
        this.fixifyScreenFractionX(ffx), this.fixifyScreenFractionY(ffy),
        this.fixifyScreenFractionX(tfx), this.fixifyScreenFractionY(tfy),
      );
    }
  }

  boundXcor(x) {
    return MOD$(x - this.turtlePictureLeft, this.turtlePictureSizeX) + this.turtlePictureLeft;
  }

  boundYcor(y) {
    return MOD$(y - this.turtlePictureBottom, this.turtlePictureSizeY) + this.turtlePictureBottom;
  }

  // BOUND-HERE: bring the turtle back within the picture, leaving wrap or clip.
  boundHere() {
    this.eraseTurtle();
    this.xcor = this.boundXcor(this.xcor);
    this.ycor = this.boundYcor(this.ycor);
    this.drawTurtle();
  }

  wrap() {
    this.eraseTurtle();
    this.wrapMode = true;
    this.clipMode = false;
    this.offscreenMode = this.L.intern("WRAP");
    this.drawTurtle();
    return this.noValue;
  }

  nowrap() {
    this.boundHere();
    this.wrapMode = false;
    this.clipMode = false;
    this.offscreenMode = this.L.NIL;
    return this.noValue;
  }

  // ---------------------------------------------------------------- clip mode

  clipVisibility(x, y) {
    let v = 0;
    if (x < this.turtlePictureLeft) v += 1;
    else if (x > this.turtlePictureRight) v += 2;
    if (y < this.turtlePictureBottom) return v + 4;
    if (y > this.turtlePictureTop) return v + 8;
    return v;
  }

  clipVector(fromX, fromY, toX, toY) {
    this.clipVectorVisibility(fromX, fromY, toX, toY, this.clipVisibility(fromX, fromY), this.clipVisibility(toX, toY));
  }

  // CLIP-VECTOR-VISIBILITY: Cohen and Sutherland's clipping, as TVRTLE does it.
  clipVectorVisibility(fromX, fromY, toX, toY, fromV, toV) {
    for (let guard = 0; guard < 100; guard++) {
      if (fromV === 0 && toV === 0) {
        this.boundedVector(fromX, fromY, toX, toY);
        return;
      }
      if ((fromV & toV) !== 0) return;
      if (fromV === 0) {
        [fromX, toX] = [toX, fromX];
        [fromY, toY] = [toY, fromY];
        [fromV, toV] = [toV, fromV];
      }
      if (fromV & 1) {
        fromY = fromY + ((toY - fromY) / (toX - fromX)) * (this.turtlePictureLeft - fromX);
        fromX = this.turtlePictureLeft;
      }
      if (fromV & 2) {
        fromY = fromY + ((toY - fromY) / (toX - fromX)) * (this.turtlePictureRight - fromX);
        fromX = this.turtlePictureRight;
      }
      if (fromV & 4) {
        fromX = fromX + ((toX - fromX) / (toY - fromY)) * (this.turtlePictureBottom - fromY);
        fromY = this.turtlePictureBottom;
      }
      if (fromV & 8) {
        fromX = fromX + ((toX - fromX) / (toY - fromY)) * (this.turtlePictureTop - fromY);
        fromY = this.turtlePictureTop;
      }
      fromV = this.clipVisibility(fromX, fromY);
    }
  }

  clip() {
    this.eraseTurtle();
    this.clipMode = true;
    this.wrapMode = false;
    this.offscreenMode = this.L.intern("CLIP");
    this.drawTurtle();
    return this.noValue;
  }

  offscreen(mode) {
    const L = this.L;
    if (mode === L.NIL) {
      this.boundHere();
      this.offscreenMode = L.NIL;
      this.wrapMode = false;
      this.clipMode = false;
    } else if (mode === L.intern("WRAP")) this.wrap();
    else if (mode === L.intern("CLIP")) this.clip();
    else this.fatal("OFFSCREEN", "WRONG TYPE INPUT TO OFFSCREEN");
    return this.noValue;
  }

  // ---------------------------------------------------------------- the turtle cursor

  clippedOut() {
    return this.clipMode && this.clipVisibility(this.xcor, this.ycor) > 0;
  }

  // TURTLE-WINDOW: XOR (or write) a 7 by 7 marker at the turtle.
  turtleWindow(which) {
    const tx = this.tvX(this.xcor);
    const ty = this.tvY(this.ycor);
    const rows = MARKER_WORDS[which].map((w) => Array.from({ length: 7 }, (_, k) => wordBit(w, k)));
    this.displayBitmap(rows, ty - 3, ty + 3, tx - 3, tx + 3);
  }

  standardPen() {
    if (this.penstate) this.turtleWindow("pen");
    else if (this.eraserstate) this.turtleWindow("eraser");
    else if (this.xorstate) this.turtleWindow("xor");
  }

  drawPen() {
    if (!this.seeturtle || this.clippedOut()) return;
    if (this.drawturtleForm !== this.L.NIL) return this.invokeUserTurtle(this.drawturtleForm);
    if (this.color) {
      this.selectColor(this.pennumber);
      this.standardPen();
      this.reselectColor();
    } else this.withDrawmode(this.XOR, () => this.standardPen());
  }

  erasePen() {
    if (!this.seeturtle || this.clippedOut()) return;
    if (this.eraseturtleForm !== this.L.NIL) return this.invokeUserTurtle(this.eraseturtleForm);
    if (this.color) {
      this.selectColor(this.erasernumber);
      this.standardPen();
      this.reselectColor();
    } else this.withDrawmode(this.XOR, () => this.standardPen());
  }

  // INVOKE-USER-DRAW-TURTLE and INVOKE-USER-ERASE-TURTLE
  invokeUserTurtle(form) {
    const L = this.L;
    const s = this.sym;
    const keep = [s.xcor, s.ycor, s.heading, s.sineHeading, s.cosineHeading, s.penstate, s.eraserstate, s.xorstate, s.drawstate];
    this.withBindings(
      [...keep.map((x) => [x, x.value]), [s.seeturtle, L.NIL], [s.turtles, L.NIL]],
      () => L.eval(form),
    );
    this.restorePenMode();
  }

  standardTriangle() {
    const R = this.turtleFrontRadius;
    const S = this.turtleSideRadius;
    const sh = this.sineHeading;
    const ch = this.cosineHeading;
    const frx = R * sh;
    const fry = R * ch;
    const rrx = S * (sh * this.cosine120 + this.sine120 * ch);
    const rry = S * (ch * this.cosine120 - sh * this.sine120);
    const lrx = S * (sh * this.cosine240 + this.sine240 * ch);
    const lry = S * (ch * this.cosine240 - sh * this.sine240);
    const x = this.xcor;
    const y = this.ycor;
    const fx = x + frx;
    const fy = y + fry;
    const lx = x + lrx;
    const ly = y + lry;
    const rx = x + rrx;
    const ry = y + rry;
    const wasWrap = this.wrapMode;
    this.withBindings([[this.sym.wrapMode, this.L.T]], () => {
      this.wrapVector(x, y, fx, fy);
      this.wrapVector(fx, fy, lx, ly);
      this.wrapVector(lx, ly, rx, ry);
      this.wrapVector(rx, ry, fx, fy);
    });
    void wasWrap;
  }

  triangleTurtle() {
    if (this.color) {
      this.standardTriangle();
      this.standardPen();
    } else
      this.withDrawmode(this.XOR, () => {
        this.standardTriangle();
        this.standardPen();
      });
  }

  drawTriangle() {
    if (!this.seeturtle || this.clippedOut()) return;
    if (this.drawturtleForm !== this.L.NIL) return this.invokeUserTurtle(this.drawturtleForm);
    if (this.color) {
      this.selectColor(this.pennumber);
      this.standardTriangle();
      this.reselectColor();
    } else this.withDrawmode(this.XOR, () => this.standardTriangle());
  }

  eraseTriangle() {
    if (!this.seeturtle || this.clippedOut()) return;
    if (this.eraseturtleForm !== this.L.NIL) return this.invokeUserTurtle(this.eraseturtleForm);
    if (this.color) {
      this.selectColor(this.erasernumber);
      this.standardTriangle();
      this.reselectColor();
    } else this.withDrawmode(this.XOR, () => this.standardTriangle());
  }

  drawTurtle() {
    if (!this.seeturtle || this.clippedOut()) return;
    if (this.drawturtleForm !== this.L.NIL) return this.invokeUserTurtle(this.drawturtleForm);
    if (this.color) {
      this.selectColor(this.pennumber);
      this.triangleTurtle();
      this.reselectColor();
    } else this.triangleTurtle();
  }

  eraseTurtle() {
    if (!this.seeturtle || this.clippedOut()) return;
    if (this.eraseturtleForm !== this.L.NIL) return this.invokeUserTurtle(this.eraseturtleForm);
    if (this.color) {
      this.selectColor(this.erasernumber);
      this.triangleTurtle();
      this.reselectColor();
    } else this.triangleTurtle();
  }

  showturtle() {
    if (!this.seeturtle) {
      this.seeturtle = true;
      this.drawTurtle();
    }
    return this.noValue;
  }

  hideturtle() {
    if (this.seeturtle) this.eraseTurtle();
    this.seeturtle = false;
    return this.noValue;
  }

  // DRAW-TURTLES and ERASE-TURTLES: every visible turtle.
  forEachVisibleTurtle(fn) {
    const L = this.L;
    fn();
    const old = this.turtleName;
    for (const t of L.toArray(this.turtles)) {
      if (t === old) continue;
      const arr = L.get(t, L.intern("TURTLE"));
      if (arr instanceof LArray && arr.data[SEETURTLE_INDEX] !== L.NIL && arr.data[SEETURTLE_INDEX] !== undefined) {
        this.useturtle(t);
        fn();
      }
    }
    if (this.turtleName !== old) this.useturtle(old);
  }

  drawTurtles() {
    this.forEachVisibleTurtle(() => this.drawTurtle());
  }

  eraseTurtles() {
    this.forEachVisibleTurtle(() => this.eraseTurtle());
  }

  // MAKETURTLE draw-form erase-form: the turtle drawn by Lisp forms. In
  // TVRTLE 542 it takes the two forms. Ken's KEN;ANINIT gives three
  // arguments, the turtle's name first; that call is honored too.
  maketurtle(argForms) {
    const L = this.L;
    const forms = L.toArray(argForms);
    const set = () => {
      this.eraseTurtle();
      this.drawturtleForm = forms.length > 0 ? forms[forms.length === 3 ? 1 : 0] : L.NIL;
      this.eraseturtleForm = forms.length > 1 ? forms[forms.length === 3 ? 2 : 1] : L.NIL;
      this.drawTurtle();
    };
    if (forms.length === 3) {
      const name = L.eval(forms[0]);
      const old = this.turtleName;
      if (name !== old) this.useturtle(name);
      set();
      if (name !== old) this.useturtle(old);
    } else set();
    return this.noValue;
  }

  // ---------------------------------------------------------------- multiple turtles

  // USETURTLE (UT): make another turtle the current one.
  useturtle(name) {
    const L = this.L;
    const T_ = L.intern("TURTLE");
    if (!(L.get(name, T_) instanceof LArray)) this.fatal("USETURTLE", L.list(name, L.intern("IS NOT A TURTLE")));
    const newT = L.get(name, T_);
    const oldT = L.get(this.turtleName, T_);
    const oldHomeX = this.centerX;
    const oldHomeY = this.centerY;
    for (let i = 0; i < this.turtlePropertySyms.length; i++) {
      const s = this.turtlePropertySyms[i];
      const oldValue = s.value;
      s.value = newT.data[i] === undefined ? L.NIL : newT.data[i];
      if (oldT instanceof LArray) oldT.data[i] = oldValue;
    }
    this.restorePenMode();
    this.centerX = oldHomeX;
    this.centerY = oldHomeY;
    this.tvSethome(newT.data[0], newT.data[1]);
    this.turtleName = name;
    return name;
  }

  // HATCH: a new turtle, as at STARTDISPLAY.
  hatch(name) {
    const L = this.L;
    if (name === this.turtleName) this.eraseTurtle();
    L.putprop(name, this.newTurtleArray(this.hatchProperties), L.intern("TURTLE"));
    if (!L.toArray(this.turtles).includes(name)) this.turtles = new Cons(name, this.turtles);
    this.useturtle(name);
    this.showturtle();
    return name;
  }

  eraseturtle(name) {
    const L = this.L;
    if (!(L.get(name, L.intern("TURTLE")) instanceof LArray)) this.fatal("ERASETURTLE", L.list(name, L.intern("IS NOT A TURTLE")));
    if (name === this.turtleName) this.fatal("ERASETURTLE", "DON'T ERASE THE CURRENT TURTLE!");
    this.turtles = L.fromArray(L.toArray(this.turtles).filter((t) => t !== name));
    const old = this.turtleName;
    this.useturtle(name);
    this.eraseTurtle();
    this.useturtle(old);
    L.remprop(name, L.intern("TURTLE"));
    return name;
  }

  // ---------------------------------------------------------------- basic commands

  // SETXY$: move, drawing if the pen state says so.
  setxy$(newX, newY) {
    if (this.offscreenMode === this.L.NIL && this.outOfBoundsCheck(newX, newY)) return;
    if (this.drawstate !== this.L.NIL) {
      this.eraseTurtles();
      if (this.wrapMode) this.wrapVector(this.xcor, this.ycor, newX, newY);
      else if (this.clipMode) this.clipVector(this.xcor, this.ycor, newX, newY);
      else this.boundedVector(this.xcor, this.ycor, newX, newY);
      this.xcor = newX;
      this.ycor = newY;
      this.drawTurtles();
    } else {
      this.eraseTurtle();
      this.xcor = newX;
      this.ycor = newY;
      this.drawTurtle();
    }
  }

  forward$(steps) {
    this.setxy$(this.xcor + steps * this.sineHeading, this.ycor + steps * this.cosineHeading);
  }

  sethead$(h) {
    this.eraseTriangle();
    const r = h * this.piOver180;
    this.heading = h;
    this.sineHeading = Math.sin(r);
    this.cosineHeading = Math.cos(r);
    this.drawTriangle();
  }

  right$(turns) {
    this.sethead$(this.heading + turns);
  }

  penup() {
    if (this.penstate) this.erasePen();
    this.penstate = false;
    this.drawstate = this.L.NIL;
    if (this.drawturtleForm !== this.L.NIL) this.drawTurtle();
    return this.noValue;
  }

  pendown() {
    this.erasePen();
    if (this.color) this.selectColor(this.pennumber);
    else this.drawmode(this.IOR);
    this.penstate = true;
    this.eraserstate = false;
    this.xorstate = false;
    this.drawstate = this.L.intern("PEN");
    this.drawPen();
    return this.noValue;
  }

  eraserup() {
    if (this.eraserstate) this.erasePen();
    this.eraserstate = false;
    this.drawstate = this.L.NIL;
    if (this.drawturtleForm !== this.L.NIL) this.drawTurtle();
    if (!this.color) this.drawmode(this.IOR);
    return this.noValue;
  }

  eraserdown() {
    this.erasePen();
    if (this.color) this.selectColor(this.erasernumber);
    else this.drawmode(this.ANDC);
    this.eraserstate = true;
    this.penstate = false;
    this.xorstate = false;
    this.drawstate = this.L.intern("ERASER");
    this.drawPen();
    return this.noValue;
  }

  xordown() {
    if (this.color) return this.notImplementedInColor(this.L.list(this.L.intern("XORDOWN")));
    this.erasePen();
    this.drawmode(this.XOR);
    this.xorstate = true;
    this.penstate = false;
    this.eraserstate = false;
    this.drawstate = this.L.intern("XOR");
    this.drawPen();
    return this.noValue;
  }

  xorup() {
    if (this.color) return this.notImplementedInColor(this.L.list(this.L.intern("XORUP")));
    if (this.xorstate) this.erasePen();
    this.xorstate = false;
    this.drawstate = this.L.NIL;
    if (this.drawturtleForm !== this.L.NIL) this.drawTurtle();
    this.drawmode(this.IOR);
    return this.noValue;
  }

  drawstateCommand(state) {
    const L = this.L;
    if (state === L.NIL) {
      this.erasePen();
      this.drawstate = L.NIL;
      this.penstate = false;
      this.eraserstate = false;
      this.xorstate = false;
      if (!this.color) this.drawmode(this.IOR);
      if (this.drawturtleForm !== L.NIL) this.drawTurtle();
      this.drawPen();
    } else if (state === L.intern("PEN")) this.pendown();
    else if (state === L.intern("ERASER")) this.eraserdown();
    else if (state === L.intern("XOR")) this.xordown();
    else this.fatal("DRAWSTATE", "WRONG TYPE INPUT TO DRAWSTATE");
    return this.noValue;
  }

  home() {
    if (this.drawstate !== this.L.NIL) this.eraseTurtles();
    else this.eraseTurtle();
    this.quietly(() => {
      this.setxy$(0.0, 0.0);
      this.sethead$(0.0);
    });
    if (this.drawstate !== this.L.NIL) this.drawTurtles();
    else this.drawTurtle();
    return this.noValue;
  }

  // SETTURTLE (x y [heading])
  setturtle(p) {
    const val = this.L.num.val;
    if (this.drawstate !== this.L.NIL) this.eraseTurtles();
    else this.eraseTurtle();
    this.quietly(() => {
      this.setxy$(val(p.car), val(p.cdr.car));
      if (p.cdr.cdr instanceof Cons) this.sethead$(val(p.cdr.cdr.car));
    });
    if (this.drawstate !== this.L.NIL) this.drawTurtles();
    else this.drawTurtle();
    return this.noValue;
  }

  xcorValue() {
    return ROUND(this.boundXcor(this.xcor));
  }

  ycorValue() {
    return ROUND(this.boundYcor(this.ycor));
  }

  headingValue() {
    const h = ROUND(this.heading) % 360;
    return h < 0 ? 360 + h : h;
  }

  // ---------------------------------------------------------------- points and arcs

  writeTvPoint(x, y) {
    this.display.plot(x, y);
  }

  readTvPoint(x, y) {
    return this.display.read(x, y);
  }

  pointArgs(args) {
    const val = this.L.num.val;
    let x = this.xcor;
    let y = this.ycor;
    if (args.length === 1) {
      x = val(args[0].car);
      y = val(args[0].cdr.car);
    } else if (args.length === 2) {
      x = val(args[0]);
      y = val(args[1]);
    }
    return [x, y];
  }

  // POINT: [] [on?] [x y] [x y on?]
  point(args) {
    const L = this.L;
    const val = L.num.val;
    let x = this.xcor;
    let y = this.ycor;
    let on = true;
    if (args.length === 1) on = args[0] !== L.NIL;
    else if (args.length === 2) [x, y] = [val(args[0]), val(args[1])];
    else if (args.length === 3) [x, y, on] = [val(args[0]), val(args[1]), args[2] !== L.NIL];
    if (this.offscreenMode !== L.NIL || !this.outOfBoundsCheck(x, y)) {
      this.eraseTurtles();
      if (this.color) {
        this.selectColor(on ? this.pennumber : this.erasernumber);
        this.writeTvPoint(this.tvX(x), this.tvY(y));
        this.reselectColor();
      } else {
        const mode = args.length === 1 || args.length === 3 ? (on ? this.IOR : this.ANDC) : this.drawmodeVar;
        this.withDrawmode(mode, () => this.writeTvPoint(this.tvX(x), this.tvY(y)));
      }
      this.drawTurtles();
    }
    return this.noValue;
  }

  pointstate(args) {
    const L = this.L;
    const [x, y] = this.pointArgs(args);
    if (this.offscreenMode !== L.NIL || !this.outOfBoundsCheck(x, y)) {
      this.eraseTurtles();
      const v = this.readTvPoint(this.tvX(x), this.tvY(y));
      this.drawTurtles();
      return L.truth(this.color ? v !== this.erasernumber : v !== 0);
    }
    return L.NIL;
  }

  pointcolor(args) {
    const L = this.L;
    const [x, y] = this.pointArgs(args);
    if (this.offscreenMode !== L.NIL || !this.outOfBoundsCheck(x, y)) {
      this.eraseTurtles();
      const v = this.readTvPoint(this.tvX(x), this.tvY(y));
      this.drawTurtles();
      if (this.color) return this.palette(v);
      return v ? this.pencolorName : this.erasercolorName;
    }
    return L.NIL;
  }

  // ARC$: a polygon of :POLYGON sides around the turtle, which stays put.
  // As in TVRTLE, it draws whatever the pen state.
  arc$(radius, degrees) {
    const L = this.L;
    this.eraseTurtles();
    const unitCircleSide = 2.0 * Math.sin(this.pi / this.polygon);
    const halfTurn = 360.0 / this.polygon / 2.0;
    const side = radius * unitCircleSide;
    const oldX = this.xcor;
    const oldY = this.ycor;
    const oldHeading = this.heading;
    const s = this.sym;
    this.withBindings(
      [[s.sineHeading, s.sineHeading.value], [s.cosineHeading, s.cosineHeading.value], [s.drawstate, L.NIL], [s.seeturtle, L.NIL], [s.turtles, L.NIL]],
      () => {
        this.forward$(radius);
        this.right$(90.0);
        this.withBindings([[s.drawstate, L.intern("PEN")]], () => {
          let sides = degrees / halfTurn / 2.0;
          for (; !(sides < 1.0); sides -= 1.0) {
            this.right$(halfTurn);
            this.forward$(side);
            this.right$(halfTurn);
          }
          this.right$(halfTurn);
          this.forward$(sides * side);
        });
        this.setxy$(oldX, oldY);
        this.sethead$(oldHeading);
      },
    );
    this.drawTurtles();
  }

  // ---------------------------------------------------------------- global navigation

  navArgs(fn, args) {
    const L = this.L;
    const val = L.num.val;
    if (args.length === 1) {
      const p = args[0];
      return { x: val(p.car), y: val(p.cdr.car), fixnum: typeof p.car === "number" && typeof p.cdr.car === "number" };
    }
    if (args.length === 2) return { x: val(args[0]), y: val(args[1]), fixnum: typeof args[0] === "number" && typeof args[1] === "number" };
    return this.fatal(fn, "WRONG NUMBER OF INPUTS");
  }

  bearing$(x, y) {
    const dx = x - this.xcor;
    const dy = y - this.ycor;
    let b = 0.0;
    if (!(Math.abs(dx) < this.tolerance && Math.abs(dy) < this.tolerance)) {
      let a = Math.atan2(dx, dy); // MacLisp's (ATAN dx dy), from 0 to 2 pi
      if (a < 0) a += 2 * Math.PI;
      b = a / this.piOver180;
      if (b < 0) b = 360.0 - b;
    }
    return b;
  }

  // BEARING: the heading from the turtle to a point.
  bearing(args) {
    const { x, y, fixnum } = this.navArgs("BEARING", args);
    const b = this.bearing$(x, y);
    return fixnum ? ROUND(b) % 360 : new Flonum(MOD$(b, 360.0));
  }

  // TOWARDS: the direction of a point relative to the turtle's heading.
  towards(args) {
    const { x, y, fixnum } = this.navArgs("TOWARDS", args);
    let t = MOD$(this.bearing$(x, y), 360.0) - this.heading;
    if (t < 0) t = 360.0 + t;
    return fixnum ? ROUND(t) % 360 : new Flonum(MOD$(t, 360.0));
  }

  // RANGE: the distance from the turtle to a point.
  range(args) {
    const { x, y, fixnum } = this.navArgs("RANGE", args);
    const dx = x - this.xcor;
    const dy = y - this.ycor;
    const r = Math.sqrt(dx * dx + dy * dy);
    return fixnum ? ROUND(r) : new Flonum(r);
  }

  // ---------------------------------------------------------------- windows

  // RECTANGLE-SPEC: a rectangle of the screen from LLOGO's conventions:
  // () the picture; (r) or (rx ry) around the turtle; (x y r [ry]) around
  // a point. Returns (top bottom left right center-x center-y) in TV dots.
  rectangleSpec(checker, specs) {
    const L = this.L;
    const val = L.num.val;
    let left = this.pictureLeft;
    let right = this.pictureRight;
    let top = this.pictureTop;
    let bottom = this.pictureBottom;
    let cx = this.tvX(this.xcor);
    let cy = this.tvY(this.ycor);
    let rx = this.pictureHalfX;
    let ry = this.pictureHalfY;
    if (specs.length === 0) {
      cx = this.pictureLeft + this.pictureHalfX;
      cy = this.pictureTop + this.pictureHalfY;
    } else {
      let rest = specs;
      if (rest.length > 2) {
        cx = this.tvX(val(rest[0]));
        cy = this.tvY(val(rest[1]));
        rest = rest.slice(2);
      }
      rx = ROUND(val(rest[0]) / this.tvstep);
      ry = rest.length > 1 ? ROUND(val(rest[1]) / this.tvstep) : rx;
      left = cx - rx;
      right = cx + rx;
      top = cy - ry;
      bottom = cy + ry;
      if (rx > this.pictureHalfX || ry > this.pictureHalfY) this.fatal(typeof checker === "string" ? checker : L.print(checker), "AREA TOO LARGE");
    }
    return [top, bottom, left, right, cx, cy];
  }

  // A bitmap ({ rows of 0/1 }) displayed with its top left at (left, top),
  // clipped to the picture area; the current ALU (black and white) or the
  // selected color decides what a 1 does.
  displayBitmap(rows, top, bottom, left, right) {
    const fb = this.display;
    if (bottom < this.pictureTop || top > this.pictureBottom || right < this.pictureLeft || left > this.pictureRight) return;
    for (let y = Math.max(top, this.pictureTop); y <= Math.min(bottom, this.pictureBottom); y++) {
      const row = rows[y - top];
      if (!row) continue;
      for (let x = Math.max(left, this.pictureLeft); x <= Math.min(right, this.pictureRight); x++) {
        if (row[x - left]) fb.writeWordBits(y, Math.floor(x / 32), (1 << (31 - (x % 32))) >>> 0);
      }
    }
    fb.changed();
  }

  // MAKEWINDOW name [rectangle spec]: save the dots in a rectangle, keeping
  // only the part where something is visible.
  makewindow(args) {
    const L = this.L;
    if (!(args[0] instanceof Sym)) this.fatal("MAKEWINDOW", L.list(args[0], L.intern("IS NOT A VALID NAME")));
    return this.internalWindow(args[0], this.rectangleSpec("MAKEWINDOW", args.slice(1)));
  }

  internalWindow(name, rect) {
    const L = this.L;
    if (this.windowOutline) {
      if (this.color) this.selectColor(this.pennumber);
      this.internalWindowframe(rect);
      this.reselectColor();
    }
    this.makewindowVisible(name, ...rect);
    if (!L.toArray(this.windowsList).includes(name)) this.windowsList = new Cons(name, this.windowsList);
    if (this.windowOutline) {
      if (this.color) this.selectColor(this.erasernumber);
      this.internalWindowframe(rect);
      this.reselectColor();
    }
    return name;
  }

  makewindowVisible(name, top, bottom, left, right, cx, cy) {
    const background = this.color ? this.erasernumber : 0;
    let vTop = -1;
    let vBottom = -1;
    let vRight = left;
    let vLeft = right;
    for (let y = top; y <= bottom; y++) {
      const first = left + this.runawayForward(left, y, this.color ? background : 0);
      if (first > right) continue;
      vBottom = y;
      if (vTop < 0) vTop = y;
      if (first < vLeft) vLeft = first;
      const last = right - this.runawayBackward(right, y, this.color ? background : 0);
      if (last > vRight) vRight = last;
    }
    this.makewindowArray(name, cx, cy, vTop, vBottom, vLeft, vRight);
  }

  makewindowArray(name, homeX, homeY, top, bottom, left, right) {
    const L = this.L;
    const infoSym = L.intern(`${name.name}-WINDOW-INFO`);
    const picSym = L.intern(`${name.name}-WINDOW-PICTURE`);
    infoSym.interned = false;
    const info = new LArray("FIXNUM", [8]);
    let pic;
    let paletteSym = null;
    if (top < 0) {
      info.data = [0];
      pic = new LArray("FIXNUM", [1]);
      pic.data = [0];
    } else {
      const wordsPerRow = 1 + Math.floor((right - left) / 36);
      const rows = 1 + bottom - top;
      info.data = [wordsPerRow, rows, homeX, homeY, top - homeY, bottom - homeY, left - homeX, right - homeX];
      if (this.color) {
        const runs = [];
        for (let y = top; y <= bottom; y++) {
          for (let x = left; x <= right; ) {
            const c = this.readTvPoint(x, y);
            let n = this.runawayForward(x, y, c);
            if (x + n > right + 1) n = right + 1 - x;
            runs.push(n * 16 + c);
            x += n;
          }
        }
        pic = new LArray("FIXNUM", [runs.length]);
        pic.data = runs;
        paletteSym = L.intern(`${name.name}-WINDOW-PALETTE`);
        const pal = new LArray("T", [16]);
        pal.data = this.paletteArray.slice();
        L.putprop(paletteSym, pal, L.S.ARRAY);
      } else {
        const words = new Array(wordsPerRow * rows).fill(0);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c <= right - left; c++) {
            if (this.readTvPoint(left + c, top + r)) words[r * wordsPerRow + Math.floor(c / 36)] += 2 ** (35 - (c % 36));
          }
        }
        pic = new LArray("FIXNUM", [words.length]);
        pic.data = words;
      }
    }
    L.putprop(infoSym, info, L.S.ARRAY);
    L.putprop(picSym, pic, L.S.ARRAY);
    L.putprop(name, paletteSym ? L.list(infoSym, picSym, paletteSym) : L.list(infoSym, picSym), L.intern("WINDOW"));
  }

  // The arrays of a window: { info, picture, palette }.
  windowArrays(name, fn) {
    const L = this.L;
    const prop = L.get(name, L.intern("WINDOW"));
    if (!(prop instanceof Cons)) return this.fatal(fn, L.list(name, L.intern("IS NOT A WINDOW")));
    const [infoSym, picSym, palSym] = L.toArray(prop);
    return {
      info: L.get(infoSym, L.S.ARRAY),
      picture: L.get(picSym, L.S.ARRAY),
      palette: palSym ? L.get(palSym, L.S.ARRAY) : null,
    };
  }

  // The rows of dots of a black-and-white window picture.
  windowRows(info, picture) {
    let rows = this.windowsCache.get(picture);
    if (rows) return rows;
    const [wpr, n, , , , , l, r] = info.data;
    const width = r - l + 1;
    rows = [];
    for (let i = 0; i < n; i++) {
      const row = new Uint8Array(width);
      for (let c = 0; c < width; c++) row[c] = wordBit(picture.data[i * wpr + Math.floor(c / 36)] || 0, c % 36);
      rows.push(row);
    }
    this.windowsCache.set(picture, rows);
    return rows;
  }

  // DISPLAYWINDOW-ARGS: window [x y]; with no point, the window's own home.
  displaywindowArgs(fn, args, show) {
    const L = this.L;
    const val = L.num.val;
    const { info, picture, palette } = this.windowArrays(args[0], fn);
    if (info.data[0] === 0) return; // an empty window
    let homeX;
    let homeY;
    if (args.length === 1) {
      homeX = info.data[2];
      homeY = info.data[3];
    } else if (args.length === 3) {
      homeX = this.tvX(val(args[1]));
      homeY = this.tvY(val(args[2]));
    } else return this.fatal(fn, "WRONG NUMBER OF ARGS TO WINDOW FUNCTION");
    this.eraseTurtles();
    const top = homeY + info.data[4];
    const bottom = homeY + info.data[5];
    const left = homeX + info.data[6];
    const right = homeX + info.data[7];
    if (palette && this.color) this.displaywindowStoreColor(show, picture, palette, top, bottom, left, right);
    else this.displayBitmap(this.windowRows(info, picture), top, bottom, left, right);
    this.drawTurtles();
  }

  // DISPLAYWINDOW-STORE-COLOR: runs of color, not shown in the eraser color.
  displaywindowStoreColor(show, picture, palette, top, bottom, left, right) {
    const L = this.L;
    if (top < this.pictureTop || bottom > this.pictureBottom || left < this.pictureLeft || right > this.pictureRight) {
      this.fatal("DISPLAYWINDOW-STORE-COLOR", "WINDOW OUT OF BOUNDS");
    }
    const oldPen = this.pencolorName;
    this.withBindings([[this.sym.seeturtle, L.NIL]], () => {
      if (!show) this.selectColor(this.erasernumber);
      let x = left;
      let y = top;
      for (const run of picture.data) {
        const c = run % 16;
        let n = Math.floor(run / 16);
        while (n > 0 && y <= bottom) {
          const len = Math.min(n, right - x + 1);
          if (c !== this.erasernumber) {
            if (show) this.pencolor(palette.data[c]);
            this.horizontalLine(x, y, x + len - 1);
          }
          n -= len;
          x += len;
          if (x > right) {
            x = left;
            y++;
          }
        }
      }
    });
    if (show) this.pencolor(oldPen);
    else this.reselectColor();
  }

  showwindow(args) {
    if (this.color) this.displaywindowArgs("SHOWWINDOW", args, true);
    else this.withDrawmode(this.IOR, () => this.displaywindowArgs("SHOWWINDOW", args, true));
    return this.noValue;
  }

  hidewindow(args) {
    if (this.color) this.displaywindowArgs("HIDEWINDOW", args, false);
    else this.withDrawmode(this.ANDC, () => this.displaywindowArgs("HIDEWINDOW", args, false));
    return this.noValue;
  }

  xorwindow(args) {
    if (this.color) return this.notImplementedInColor(new Cons(this.L.intern("XORWINDOW"), this.L.fromArray(args)));
    this.withDrawmode(this.XOR, () => this.displaywindowArgs("XORWINDOW", args, true));
    return this.noValue;
  }

  displaywindow(args) {
    this.displaywindowArgs("DISPLAYWINDOW", args, !this.eraserstate);
    return this.noValue;
  }

  // WINDOWFRAME (WF, BOX): a box just outside a rectangle (XOR in black and white).
  windowframe(args) {
    if (!(args.length === 0 && this.windowframeBounds)) this.windowframeBounds = this.rectangleSpec("WINDOWFRAME", args);
    this.internalWindowframe(this.windowframeBounds);
    return this.noValue;
  }

  internalWindowframe([top, bottom, left, right]) {
    const draw = () => {
      if (left < this.pictureLeft || right > this.pictureRight || top < this.pictureTop || bottom > this.pictureBottom) {
        this.fatal("WINDOWFRAME", "WINDOW FRAME OUT OF BOUNDS");
      }
      if (top !== this.pictureTop) this.horizontalLine(left - 1, top - 1, right + 1);
      if (bottom !== this.pictureBottom) this.horizontalLine(left - 1, bottom + 1, right + 1);
      if (left !== this.pictureLeft) this.verticalLine(left - 1, top, bottom);
      if (right !== this.pictureRight) this.verticalLine(right + 1, top, bottom);
    };
    if (this.color) draw();
    else this.withDrawmode(this.XOR, draw);
  }

  // FILLWINDOW (FW): fill a rectangle as the pen state would.
  fillwindow(args) {
    this.eraseTurtles();
    const [top, bottom, left, right] = this.rectangleSpec("FILLWINDOW", args);
    for (let y = top; y <= bottom; y++) this.horizontalLine(left, y, right);
    this.drawTurtles();
    return this.noValue;
  }

  erasewindow(name) {
    const L = this.L;
    if (!L.toArray(this.windowsList).includes(name)) this.fatal("ERASEWINDOW", L.list(name, L.intern("IS NOT A WINDOW")));
    L.remprop(name, L.intern("WINDOW"));
    this.windowsList = L.fromArray(L.toArray(this.windowsList).filter((w) => w !== name));
    return L.list(L.intern(";"), name, L.intern("ERASED"));
  }

  erasewindows() {
    const L = this.L;
    for (const w of L.toArray(this.windowsList)) L.remprop(w, L.intern("WINDOW"));
    this.windowsList = L.NIL;
    return L.intern(";ALL WINDOWS ERASED");
  }

  windowhome(args) {
    const L = this.L;
    const val = L.num.val;
    if (!L.toArray(this.windowsList).includes(args[0])) this.fatal("WINDOWHOME", L.list(args[0], L.intern("IS NOT A WINDOW")));
    const { info } = this.windowArrays(args[0], "WINDOWHOME");
    let x = this.xcor;
    let y = this.ycor;
    if (args.length === 2) [x, y] = [val(args[1].car), val(args[1].cdr.car)];
    else if (args.length === 3) [x, y] = [val(args[1]), val(args[2])];
    if (this.offscreenMode !== L.NIL || !this.outOfBoundsCheck(x, y)) {
      info.data[2] = this.tvX(x);
      info.data[3] = this.tvY(y);
    }
    return this.noValue;
  }

  // Install windows read from a DUMPARRAYS file (GETWINDOWS): arrays is a
  // list of { name, data } in file order, NAME-WINDOW-INFO before
  // NAME-WINDOW-PICTURE (and NAME-WINDOW-PALETTE in color files).
  installWindowArrays(arrays) {
    const L = this.L;
    const names = [];
    for (let i = 0; i < arrays.length; ) {
      const info = arrays[i];
      if (!/-WINDOW-INFO$/.test(info.name)) {
        this.fatal("GETWINDOWS", "OLD FORMAT WINDOW -- PLEASE RECREATE WINDOW FILE");
      }
      const pic = arrays[i + 1];
      const base = info.name.replace(/-WINDOW-INFO$/, "");
      const infoSym = L.intern(info.name);
      const picSym = L.intern(pic.name);
      const ia = new LArray("FIXNUM", [info.data.length]);
      ia.data = info.data.map((w) => (w >= 2 ** 35 ? w - 2 ** 36 : w));
      const pa = new LArray("FIXNUM", [pic.data.length]);
      pa.data = pic.data.slice();
      L.putprop(infoSym, ia, L.S.ARRAY);
      L.putprop(picSym, pa, L.S.ARRAY);
      const win = L.intern(base);
      L.putprop(win, L.list(infoSym, picSym), L.intern("WINDOW"));
      if (!L.toArray(this.windowsList).includes(win)) this.windowsList = new Cons(win, this.windowsList);
      names.push(win);
      i += 2;
    }
    return names;
  }

  // ---------------------------------------------------------------- runs

  // RUNAWAY-FORWARD: how many dots from (x, y) rightward to the end of the
  // line match the run type (black and white: 0 off, -1 on; color: a slot).
  runawayForward(x, y, runType) {
    const fb = this.display;
    const want = this.color ? runType : runType === 0 ? 0 : 1;
    let n = 0;
    for (let i = x; i < fb.width; i++, n++) if (fb.read(i, y) !== want) break;
    return n;
  }

  runawayBackward(x, y, runType) {
    const fb = this.display;
    const want = this.color ? runType : runType === 0 ? 0 : 1;
    let n = 0;
    for (let i = x; i >= 0; i--, n++) if (fb.read(i, y) !== want) break;
    return n;
  }

  // ---------------------------------------------------------------- shading

  // SHADE [pattern]: fill the region around the turtle. TVRTLE's algorithm
  // is replaced by a scan-line fill of the dots matching the one under the
  // turtle, within the picture, writing the pattern's 1 bits.
  shade(args) {
    const L = this.L;
    const pattern = args.length ? args[0] : L.intern("SOLID");
    const x0 = this.tvX(this.xcor);
    const y0 = this.tvY(this.ycor);
    const fb = this.display;
    if (!fb.inBounds(x0, y0)) return this.noValue;
    this.eraseTurtles();
    const target = fb.read(x0, y0);
    const inside = (x, y) => x >= this.pictureLeft && x <= this.pictureRight && y >= this.pictureTop && y <= this.pictureBottom;
    const seen = new Uint8Array(fb.width * fb.height);
    const region = [];
    const stack = [[x0, y0]];
    while (stack.length) {
      const [x, y] = stack.pop();
      if (!inside(x, y) || seen[y * fb.width + x] || fb.read(x, y) !== target) continue;
      let l = x;
      while (inside(l - 1, y) && !seen[y * fb.width + l - 1] && fb.read(l - 1, y) === target) l--;
      let r = x;
      while (inside(r + 1, y) && !seen[y * fb.width + r + 1] && fb.read(r + 1, y) === target) r++;
      for (let i = l; i <= r; i++) seen[y * fb.width + i] = 1;
      region.push([l, y, r]);
      for (let i = l; i <= r; i++) {
        stack.push([i, y - 1]);
        stack.push([i, y + 1]);
      }
    }
    const bit = this.patternBits(pattern);
    for (const [l, y, r] of region) for (let x = l; x <= r; x++) if (bit(x, y)) fb.writeWordBits(y, Math.floor(x / 32), (1 << (31 - (x % 32))) >>> 0);
    fb.changed();
    this.drawTurtles();
    return this.noValue;
  }

  // The predefined patterns (SOLID, CHECKER, GRID, ...), a window, or a Lisp
  // function of the word and line returning a 36-bit pattern word.
  patternBits(pattern) {
    const L = this.L;
    const named = {
      SOLID: () => -16,
      CHECKER: (wx, y) => (y % 2 === 1 ? -22906492256 : 22906492240),
      GRID: (wx, y) => (y % 2 === 1 ? -16 : -22906492256),
      HORIZLINES: (wx, y) => (y % 2 === 1 ? -16 : 0),
      VERTLINES: () => -22906492256,
      TEXTURE: () => toWord(randomBits(L)),
      DARKTEXTURE: () => toWord(randomBits(L) | randomBits(L)),
      LIGHTTEXTURE: () => toWord(randomBits(L) & randomBits(L)),
    };
    if (pattern instanceof Sym && named[pattern.name]) {
      const f = named[pattern.name];
      return (x, y) => wordBit(f(Math.floor(x / 32), y), x % 32);
    }
    if (pattern instanceof Sym && L.get(pattern, L.intern("WINDOW")) instanceof Cons) {
      const { info, picture } = this.windowArrays(pattern, "SHADE");
      const rows = this.windowRows(info, picture);
      return (x, y) => {
        const row = rows[y % rows.length];
        return row ? row[x % row.length] : 0;
      };
    }
    return (x, y) => wordBit(L.num.val(L.apply(pattern, [Math.floor(x / 32), y])), x % 32);
  }
}
