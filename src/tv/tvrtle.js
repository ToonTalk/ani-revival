// installTvTurtle(L, options): load LLOGO's TV turtle into a Lisp, as
// (load '|ai:llogo;tvrtle newio|) did, but with the primitives built in.
//
// options:
//   color    true for LLOGO;COLORT (the color build), false for LLOGO;TVRTLE
//   display  a FrameBuffer to draw on; by default L.tvDisplay if it is of the
//            right kind, else a new one (saved as L.tvDisplay)
// Returns the TvTurtle, also kept as L.tv.
//
// Each primitive and its abbreviations follow TVRTLE 542's DEFINE forms.

import { Sym, Cons, Flonum, LispError, UNBOUND } from "../maclisp/types.js";
import { FrameBuffer } from "./framebuffer.js";
import { TvTurtle, randomBits, toWord } from "./turtle.js";
import { decodeItsWords, parseDumpArrays } from "./dumparrays.js";

export function installTvTurtle(L, { color = false, display = null } = {}) {
  if (!display) {
    display = L.tvDisplay && L.tvDisplay.color === color ? L.tvDisplay : new FrameBuffer({ color });
  }
  L.tvDisplay = display;
  const tv = new TvTurtle(L, display, { color });
  L.tv = tv;
  tv.initializeGlobals();
  defineTvrtlePrimitives(L, tv);
  // TVRTLE outside LLOGO: "Hey, these are the features" and its own NO-VALUE
  // (DRECT binds NO-VALUE around the load, so its own value comes back).
  L.features.add("TVRTLE");
  if (color) L.features.add("COLOR");
  L.intern("NO-VALUE").value = L.intern("?");
  return tv;
}

function defineTvrtlePrimitives(L, tv) {
  const { NIL, T } = L;
  const val = (x) => L.num.val(x);
  const flo = (x) => new Flonum(x);
  // (define NAME (abb A B ...) ...): one function under several names.
  const def = (names, fn, kind = "lsubr") => {
    for (const n of names.split(/\s+/)) L.defsubr(n, fn, kind);
  };
  const nv = () => tv.noValue;

  // ---- display and screen
  def("STARTDISPLAY SD", () => tv.startdisplay());
  def("NODISPLAY ND", () => tv.nodisplay());
  def("CLEARSCREEN CS", () => tv.clearscreen());
  def("WIPECLEAN", () => tv.wipeclean());
  def("WIPE", (...args) => tv.wipe(args));
  def("TVSIZE", (...args) => tv.tvsize(args));
  def("TURTLESIZE", (...args) => tv.turtlesize(args));
  def("SCALE", (f) => {
    tv.scale(f);
    return nv();
  });
  def("SETHOME TURTLEHOME TH", (...args) => tv.sethome(args));
  def("OUTLINE", () => tv.outline());
  def("ECHOLINES", () => nv());
  def("FAST", () => NIL);
  def("SLOW", () => T);

  // ---- moving and turning
  def("FORWARD FD", (n) => {
    tv.forward$(val(n));
    return nv();
  });
  def("BACK BK", (n) => {
    tv.forward$(-val(n));
    return nv();
  });
  def("RIGHT RT", (n) => {
    tv.right$(val(n));
    return nv();
  });
  def("LEFT LT", (n) => {
    tv.right$(-val(n));
    return nv();
  });
  def("SETHEAD SH SETHEADING", (h) => {
    tv.sethead$(val(h));
    return nv();
  });
  def("SETXY", (x, y) => {
    tv.setxy$(val(x), val(y));
    return nv();
  });
  def("SETX", (x) => {
    tv.setxy$(val(x), tv.ycor);
    return nv();
  });
  def("SETY", (y) => {
    tv.setxy$(tv.xcor, val(y));
    return nv();
  });
  def("DELX", (x) => {
    tv.setxy$(val(x) + tv.xcor, tv.ycor);
    return nv();
  });
  def("DELY", (y) => {
    tv.setxy$(tv.xcor, tv.ycor + val(y));
    return nv();
  });
  def("DELXY", (x, y) => {
    tv.setxy$(tv.xcor + val(x), tv.ycor + val(y));
    return nv();
  });
  def("HOME H", () => tv.home());
  def("SETTURTLE SETT", (p) => tv.setturtle(p));
  def("XCOR", () => tv.xcorValue());
  def("YCOR", () => tv.ycorValue());
  def("HEADING", () => tv.headingValue());
  def("HERE", () => L.list(tv.xcorValue(), tv.ycorValue(), tv.headingValue()));

  // ---- the pen
  def("PENUP PU", () => tv.penup());
  def("PENDOWN PD", () => tv.pendown());
  def("PENP", () => L.intern(":PENSTATE").value);
  def("ERASERUP ERU", () => tv.eraserup());
  def("ERASERDOWN ERD", () => tv.eraserdown());
  def("XORDOWN XD", () => tv.xordown());
  def("XORUP XU", () => tv.xorup());
  def("DRAWSTATE", (s) => tv.drawstateCommand(s));
  def("DRAWMODE", (m) => tv.drawmode(val(m)));

  // ---- the turtle itself, and more turtles
  def("SHOWTURTLE ST", () => tv.showturtle());
  def("HIDETURTLE HT", () => tv.hideturtle());
  def("TRIANGLETURTLE", () => {
    tv.triangleTurtle();
    return nv();
  });
  def("MAKETURTLE", (args) => tv.maketurtle(args), "fsubr");
  def("HATCH", (name) => tv.hatch(name));
  def("USETURTLE UT", (name) => tv.useturtle(name));
  def("ERASETURTLE", (name) => tv.eraseturtle(name));

  // ---- edges of the picture
  def("WRAP", () => tv.wrap());
  def("NOWRAP NOCLIP", () => tv.nowrap());
  def("CLIP", () => tv.clip());
  def("OFFSCREEN", (m) => tv.offscreen(m));

  // ---- points and circles
  def("POINT", (...args) => tv.point(args));
  def("POINTSTATE PS", (...args) => tv.pointstate(args));
  def("POINTCOLOR", (...args) => tv.pointcolor(args));
  def("ARC", (r, d) => {
    tv.arc$(val(r), val(d));
    return nv();
  });
  def("CIRCLE", (r) => {
    tv.arc$(val(r), 360.0);
    return nv();
  });

  // ---- navigation and arithmetic
  def("BEARING", (...args) => tv.bearing(args));
  def("TOWARDS", (...args) => tv.towards(args));
  def("RANGE", (...args) => tv.range(args));
  def("SINE", (d) => flo(Math.sin(val(d) * tv.piOver180)));
  def("COSINE", (d) => flo(Math.cos(val(d) * tv.piOver180)));
  def("ARCTAN", (opp, adj) => {
    let a = Math.atan2(val(opp), val(adj));
    if (a < 0) a += 2 * Math.PI;
    return flo(a / tv.piOver180);
  });
  def("\\$", (a, m) => {
    const x = val(a);
    const y = val(m);
    return flo(x - y * Math.floor(x / y));
  });

  // ---- colors
  def("PENCOLOR PC", (c) => tv.pencolor(c));
  def("MAKECOLOR MC", (name, r, g, b) => tv.makecolor(name, val(r), val(g), val(b)));
  def("ERASERCOLOR ERC ERASECOLOR", (c) => tv.erasercolor(c));
  def("REDPART", (c) => tv.colorPart(c, "RED"));
  def("GREENPART", (c) => tv.colorPart(c, "GREEN"));
  def("BLUEPART", (c) => tv.colorPart(c, "BLUE"));
  def("DELETECOLOR DC", (c) => tv.deletecolor(c));
  def("REPLACECOLOR RC", (a, b) => tv.replacecolor(a, b));
  def("MAKEPALETTE", (i, c) => tv.makepalette(val(i), c));
  def("RANDOMCOLOR", () => L.toArray(tv.colors)[L.random() % tv.ncolors] || NIL);
  def("FILLPALETTE", () => {
    let colors = L.toArray(tv.colors);
    for (let i = 0; i !== tv.erasernumber; i++) {
      if (colors[0] === tv.erasercolorName) colors = colors.slice(1);
      tv.makepalette(i, colors[0] || NIL);
      colors = colors.slice(1);
    }
    return tv.pencolor(0);
  });
  def("TWIDDLEREPEAT", (times) => {
    const slots = tv.paletteArray.filter((p) => p !== NIL).length - 1;
    const colors = L.toArray(tv.colors);
    for (let i = 0; i < val(times); i++) tv.makepalette(L.random() % slots, colors[L.random() % tv.ncolors]);
    return NIL;
  });
  def("COLORNEGATIVE CLN", () => {
    if (!tv.color) tv.flipcolors(tv.ANDC);
    return nv();
  });
  def("COLORPOSITIVE CLP", () => {
    if (!tv.color) tv.flipcolors(tv.IOR);
    return nv();
  });
  def("COLORSWITCH CLSW", () => {
    if (!tv.color) tv.flipcolors(tv.XOR);
    return nv();
  });
  def("COLORSTATE CLST", () => L.truth(!tv.color && tv.display.complemented));

  // ---- windows
  def("MAKEWINDOW MW", (...args) => tv.makewindow(args));
  def("SHOWWINDOW SW", (...args) => tv.showwindow(args));
  def("HIDEWINDOW HW", (...args) => tv.hidewindow(args));
  def("XORWINDOW XW", (...args) => tv.xorwindow(args));
  def("DISPLAYWINDOW DW", (...args) => tv.displaywindow(args));
  def("WINDOWFRAME WF BOX", (...args) => tv.windowframe(args));
  def("ERASEWINDOW EW", (name) => tv.erasewindow(name));
  def("ERASEWINDOWS EWS", () => tv.erasewindows());
  def("FILLWINDOW FW", (...args) => tv.fillwindow(args));
  def("WINDOWHOME WH", (...args) => tv.windowhome(args));
  def("DISPLAY", (w) => tv.showwindow([w, flo(tv.xcor), flo(tv.ycor)]));
  def("SNAP", () => tv.makewindow([L.apply(L.intern("GENSYM"), [])]));
  def("RECTANGLE-SPEC", (checker, specs) => L.list(...tv.rectangleSpec(checker, L.toArray(specs))));
  def("RUNAWAY-FORWARD", (x, y, type) => tv.runawayForward(val(x), val(y), val(type)));
  def("RUNAWAY-BACKWARD", (x, y, type) => tv.runawayBackward(val(x), val(y), val(type)));
  // GETWINDOWS (GW) name [second name]: windows saved by SAVEWINDOWS, from a
  // DUMPARRAYS file in the ITS file system (second name WINDOW by default).
  def(
    "GETWINDOWS GW",
    (args) => {
      const items = L.toArray(args);
      const spec = items.length > 1 ? args : L.list(items[0], L.intern("WINDOW"));
      if (!L.fs) throw new LispError("GETWINDOWS: no file system", spec);
      const name = L.fs.merge(L.fs.parse(spec), { dir: L.fs.defaultDir });
      const entry = L.fs.find(name);
      if (!entry) throw new LispError(`GETWINDOWS: file not found ${L.print(spec)}`, spec);
      const bytes = entry.bytes || (entry.getBytes && entry.getBytes());
      if (!bytes) throw new LispError(`GETWINDOWS: not a binary file ${L.print(spec)}`, spec);
      tv.installWindowArrays(parseDumpArrays(decodeItsWords(bytes)));
      return tv.windowsList;
    },
    "fsubr",
  );

  // ---- shading and its patterns
  def("SHADE", (...args) => tv.shade(args));
  const word = (w) => w;
  def("SOLID", () => word(-16));
  def("CHECKER", (x, y) => word(val(y) % 2 === 1 ? -22906492256 : 22906492240));
  def("GRID", (x, y) => word(val(y) % 2 === 1 ? -16 : -22906492256));
  def("HORIZLINES", (x, y) => word(val(y) % 2 === 1 ? -16 : 0));
  def("VERTLINES", () => word(-22906492256));
  def("TEXTURE", () => toWord(randomBits(L)));
  def("DARKTEXTURE", () => toWord(randomBits(L) | randomBits(L)));
  def("LIGHTTEXTURE", () => toWord(randomBits(L) & randomBits(L)));

  // ---- text: MARK used the TV's own characters; here it goes to the terminal
  def("MARK", (text) => {
    if (tv.color) return tv.notImplementedInColor(L.list(L.intern("MARK"), text));
    L.out(L.print(text, false));
    return text;
  });

  // ---- what TVRTLE defined when loaded outside LLOGO
  def("ERRBREAK", (...args) => {
    L.out(L.print(args[0], false));
    return L.breakHandler(args[1]);
  });
  // TVRTLE's own TYPE, an interpreted EXPR put in front of any existing one,
  // as its DEFUN did over Ken's compiled TYPE. KEN1;DRECT removes it again
  // after loading the turtle: "the turtle has a different type than I do".
  const typeSym = L.intern("TYPE");
  const typeDef = L.readFromString("(LAMBDA ARGS (DO ((I 1 (1+ I))) ((> I ARGS) (ARG (1- I))) (PRINC (ARG I))))");
  L.setPlistOf(typeSym, new Cons(L.S.EXPR, new Cons(typeDef, L.plistOf(typeSym))));

  void Sym;
  void UNBOUND;
}
