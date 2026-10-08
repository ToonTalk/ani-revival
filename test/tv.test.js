// The TV turtle (src/tv/), and Director's graphics on it.
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { join } from "node:path";
import { createLisp } from "../src/maclisp/index.js";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { encodePNG } from "../src/tv/png.js";
import { FrameBuffer } from "../src/tv/framebuffer.js";
import { decodeItsWords, parseDumpArrays } from "../src/tv/dumparrays.js";

function freshLisp() {
  const fs = makeProjectFileSystem();
  for (const [fn1, fn2] of [["25FG", "WINDOW"], ["25FG", "WINFON"]]) {
    const p = join(process.cwd(), "original", "3100153", `${fn1.toLowerCase()}.${fn2.toLowerCase()}`);
    fs.addFile("KEN", fn1, fn2, { getBytes: () => readFileSync(p) });
  }
  const L = createLisp({ fs });
  L.breakHandler = (tag) => {
    throw new Error(`break ${L.print(tag)}`);
  };
  return L;
}

// The lit dots of a black-and-white screen: { n, minX, maxX, minY, maxY }.
function lit(display, value = null) {
  let n = 0;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let y = 0; y < display.height; y++) {
    for (let x = 0; x < display.width; x++) {
      const v = display.pixels[y * display.width + x];
      if (value === null ? v !== 0 : v === value) {
        n++;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return { n, minX, maxX, minY, maxY };
}

describe("the black-and-white TV turtle (LLOGO;TVRTLE)", () => {
  let L;
  let fb;
  const run = (src) => L.print(L.evalString(src));
  before(() => {
    L = freshLisp();
    run("(load '|ai:llogo;tvrtle newio|)"); // the name KEN1;DRECT uses
    run("(startdisplay)");
    fb = L.tvDisplay;
  });
  const clean = () => {
    run("(setq :outline nil)");
    run("(nowrap)");
    run("(pendown)");
    run("(hideturtle)");
    run("(cs)");
  };

  test("loading LLOGO;TVRTLE defines the turtle, as STARTDISPLAY leaves it", () => {
    assert.ok(L.features.has("TVRTLE"));
    assert.equal(fb.kind, "knight");
    assert.equal(fb.width, 576);
    assert.equal(fb.height, 455);
    assert.equal(run("(tvsize)"), "(300 300)");
    assert.equal(run("(turtlesize)"), "(1000.0 1000.0)");
    assert.equal(run("(list tv-picture-left tv-picture-right tv-picture-top tv-picture-bottom)"), "(138 438 1 301)");
    // 1000 turtle steps across 301 dots, less TVRTLE's tolerance
    assert.equal(run(":tvstep"), "3.3222812");
    assert.equal(run("(here)"), "(0 0 0)");
    assert.equal(run(":turtle"), "LOGOTURTLE");
    assert.equal(run(":seeturtle"), "T"); // HATCH shows the new turtle
  });

  test("forward draws a line with TVRTLE's own arithmetic", () => {
    clean();
    assert.equal(lit(fb).n, 0);
    run("(forward 100)");
    // 100 steps is 30.1 dots; vectors are drawn from fixed-point TV
    // coordinates carrying half a dot from FLOAT-TV-SHIFT-X and another from
    // BOUNDED-VECTOR-FIX-ROUND, so the line is at x 289 (TV-X says 288).
    assert.deepEqual(lit(fb), { n: 32, minX: 289, maxX: 289, minY: 120, maxY: 151 });
    assert.equal(run("(list :xcor :ycor)"), "(0.0 100.0)");
    assert.equal(run("(list (xcor) (ycor) (heading))"), "(0 100 0)");
  });

  test("a square closes, and turning keeps the raw heading", () => {
    clean();
    run("(do ((i 0 (1+ i))) ((= i 4)) (forward 100) (right 90))");
    const box = lit(fb);
    // the same half-dot offsets make it 30 dots wide and 31 high
    assert.equal(box.maxX - box.minX, 30);
    assert.equal(box.maxY - box.minY, 31);
    assert.equal(run("(list (xcor) (ycor))"), "(0 0)");
    assert.equal(run(":heading"), "360.0");
    assert.equal(run("(heading)"), "0");
    run("(left 450)");
    assert.equal(run("(heading)"), "270");
  });

  test("pen up, eraser and XOR", () => {
    clean();
    run("(penup)");
    run("(forward 100)");
    assert.equal(lit(fb).n, 0);
    run("(pendown)");
    run("(back 100)");
    assert.equal(lit(fb).n, 32);
    run("(eraserdown)");
    run("(forward 100)");
    assert.equal(lit(fb).n, 0, "the eraser rubs out the same dots");
    run("(xordown)");
    run("(back 100)");
    assert.equal(lit(fb).n, 32);
    run("(forward 100)");
    assert.equal(lit(fb).n, 0, "XOR twice leaves nothing");
    run("(xorup)");
    assert.equal(run("(list :penstate :eraserstate :xorstate :drawstate)"), "(NIL NIL NIL NIL)");
  });

  test("wrap, clip, and running off the edge", () => {
    clean();
    run("(wrap)");
    run("(setheading 90)");
    run("(forward 700)"); // off the right edge at 500, on again at the left
    let box = lit(fb);
    assert.equal(box.minX, 138);
    assert.equal(box.maxX, 438);
    assert.equal(run(":xcor"), "700.0");
    assert.equal(run("(xcor)"), "-300");
    clean();
    run("(clip)");
    run("(setheading 90)");
    run("(forward 700)");
    box = lit(fb);
    assert.ok(box.minX >= 288 && box.maxX <= 439, "clipped at the right edge");
    clean();
    run("(setheading 90)");
    assert.throws(() => run("(forward 700)"), /TURTLE MOVED OFF THE RIGHT SIDE OF THE SCREEN/);
    assert.equal(run("(xcor)"), "0", "the turtle stays put");
  });

  test("tvsize, turtlesize and scale", () => {
    run("(tvsize 550 200)");
    assert.equal(run("(tvsize)"), "(550 200)");
    assert.equal(run("(turtlesize)"), "(2750.0 1000.0)");
    assert.equal(run("(list tv-picture-left tv-picture-right tv-picture-top tv-picture-bottom)"), "(13 563 1 201)");
    run("(scale 2)");
    assert.equal(run("(turtlesize)"), "(1375.0 500.0)");
    run("(scale .5)");
    assert.equal(run("(turtlesize)"), "(2750.0 1000.0)");
    run("(tvsize 300 300)");
    assert.equal(run("(tvsize)"), "(300 300)");
    assert.throws(() => run("(tvsize 600 200)"), /HORIZONTAL SIZE TOO BIG/);
  });

  test("circle: thirty sides around the turtle, which stays put", () => {
    clean();
    run("(circle 100)");
    assert.equal(run("(here)"), "(0 0 0)");
    const cx = 288;
    const cy = 151;
    let far = 0;
    let near = Infinity;
    for (let y = 0; y < fb.height; y++)
      for (let x = 0; x < fb.width; x++)
        if (fb.pixels[y * fb.width + x]) {
          const d = Math.hypot(x - cx, y - cy);
          far = Math.max(far, d);
          near = Math.min(near, d);
        }
    assert.ok(near > 28 && far < 33, `radius about 30 dots, got ${near.toFixed(1)}..${far.toFixed(1)}`);
  });

  test("bearing, towards and range", () => {
    clean();
    assert.equal(run("(bearing 100 100)"), "45");
    assert.equal(run("(bearing 0 -50)"), "180");
    assert.equal(run("(range 300 400)"), "500");
    assert.equal(run("(range 30.0 40.0)"), "50.0");
    run("(setheading 90)");
    assert.equal(run("(towards 0 100)"), "270");
    // TVRTLE's :PI is 3.1415926, so flonum bearings are a little off
    assert.equal(run("(bearing 100.0 100.0)"), "45.000001");
  });

  test("several turtles keep their own state (HATCH, USETURTLE)", () => {
    clean();
    run("(hatch 'sam)");
    assert.equal(run(":turtle"), "SAM");
    run("(hideturtle)");
    run("(penup)");
    run("(setxy 100 100)");
    run("(useturtle 'logoturtle)");
    assert.equal(run("(here)"), "(0 0 0)");
    assert.equal(run(":penstate"), "T");
    run("(useturtle 'sam)");
    assert.equal(run("(here)"), "(100 100 0)");
    assert.equal(run(":penstate"), "NIL");
    assert.equal(run("(memq 'sam :turtles)"), "(SAM LOGOTURTLE)");
    run("(useturtle 'logoturtle)");
    run("(eraseturtle 'sam)");
    assert.equal(run(":turtles"), "(LOGOTURTLE)");
  });

  test("MAKETURTLE: a turtle drawn by Lisp forms", () => {
    clean();
    run("(setq drawn 0 erased 0)");
    run("(showturtle)");
    run("(maketurtle (setq drawn (1+ drawn)) (setq erased (1+ erased)))");
    assert.equal(run("(list drawn erased)"), "(1 0)");
    run("(penup)");
    run("(forward 10)");
    assert.equal(run("(list drawn erased)"), "(3 2)");
    run("(maketurtle nil nil)");
    run("(hideturtle)");
  });

  test("windows: MAKEWINDOW, SHOWWINDOW, XORWINDOW, FILLWINDOW", () => {
    clean();
    run("(do ((i 0 (1+ i))) ((= i 4)) (forward 100) (right 90))");
    const before = lit(fb);
    run("(setq :windowoutline nil)");
    run("(makewindow 'box)");
    assert.equal(run("(memq 'box :windows)"), "(BOX)");
    run("(cs)");
    assert.equal(lit(fb).n, 0);
    run("(showwindow 'box)"); // back where it came from
    assert.deepEqual(lit(fb), before);
    run("(xorwindow 'box)");
    assert.equal(lit(fb).n, 0, "XOR again takes it away");
    run("(showwindow 'box -200 0)"); // 200 steps left is 60 dots
    const moved = lit(fb);
    assert.equal(moved.n, before.n);
    assert.equal(before.minX - moved.minX, 60);
    run("(cs)");
    run("(fillwindow 30)"); // 30 steps around the turtle: 9 dots each way
    assert.deepEqual(lit(fb), { n: 19 * 19, minX: 279, maxX: 297, minY: 142, maxY: 160 });
  });

  test("GETWINDOWS loads a 1976 font (KEN;25FG WINDOW)", () => {
    clean();
    run("(getwindows 25fg window)");
    assert.ok(L.toArray(L.intern(":WINDOWS").value).some((w) => w.name === "25FG101"));
    run("(showwindow '25fg101 0 0)"); // A
    const a = lit(fb);
    assert.ok(a.n > 20 && a.maxX - a.minX < 16 && a.maxY - a.minY < 25, "an A, 16 dots wide at most");
  });

  test("colors are kept on the palette even in black and white", () => {
    assert.equal(run("(pencolor 'red)"), "RED");
    assert.equal(run("(list (get 'red 'red) (get 'red 'green) (get 'red 'blue))"), "(511 0 0)");
    assert.equal(run("(redpart 'orange)"), "1.0");
    assert.equal(run("(greenpart 'orange)"), "0.50097847");
    run("(pencolor 'white)");
  });

  test("points, runs, rectangles, DRAWMODE and the complement bit", () => {
    clean();
    run("(point 100 100)");
    assert.deepEqual(lit(fb), { n: 1, minX: 318, maxX: 318, minY: 121, maxY: 121 });
    assert.equal(run("(pointstate 100 100)"), "T");
    run("(point 100 100 nil)");
    assert.equal(run("(pointstate 100 100)"), "NIL");
    // (setheading 90) (forward 100) would rise 0.0000027 steps (TVRTLE's :PI
    // is 3.1415926), enough to split the line over lines 150 and 151
    run("(setxy 100 0)"); // dots 289 to 319 of line 151
    assert.equal(run("(runaway-forward 289 151 -1)"), "31");
    assert.equal(run("(runaway-forward 0 151 0)"), "289");
    assert.equal(run("(runaway-backward 319 151 -1)"), "31");
    run("(home)");
    assert.equal(run("(rectangle-spec 'test '(30))"), "(142 160 279 297 288 151)");
    assert.equal(run("(rectangle-spec 'test nil)"), "(1 301 138 438 288 151)");
    // DRAWMODE returns the old mode, for LAMBDA-binding
    assert.equal(run("(= (drawmode xor) ior)"), "T");
    assert.equal(run("(= (drawmode ior) xor)"), "T");
    // the bit that turns the Knight TV's picture dark-on-light
    assert.equal(run("(colorstate)"), "NIL");
    run("(colorpositive)");
    assert.equal(run("(colorstate)"), "T");
    assert.equal(fb.complemented, true);
    run("(colorswitch)");
    assert.equal(run("(colorstate)"), "NIL");
    const w = L.evalString("(snap)");
    assert.ok(L.toArray(L.intern(":WINDOWS").value).includes(w));
  });
});

describe("the color TV turtle (LLOGO;COLORT)", () => {
  let L;
  let fb;
  const run = (src) => L.print(L.evalString(src));
  before(() => {
    L = freshLisp();
    run("(load '|ai:llogo;colort newio|)");
    run("(startdisplay)");
    run("(hideturtle)");
    fb = L.tvDisplay;
  });

  test("the color buffer: the whole screen, filled with the eraser color", () => {
    assert.ok(L.features.has("COLOR"));
    assert.equal(fb.kind, "color");
    // STARTDISPLAY gives INTERNAL-TV-SIZE TV-SIZE-X-MAX (573, odd) and 448
    assert.equal(run("(tvsize)"), "(573 448)");
    assert.equal(run("(list tv-picture-left tv-picture-right tv-picture-top tv-picture-bottom)"), "(2 574 2 450)");
    assert.equal(run("(list :erasercolor :erasernumber :pencolor :pennumber)"), "(BLACK 15 WHITE 0)");
    assert.deepEqual(fb.colorMap[15], [0, 0, 0]);
    assert.deepEqual(fb.colorMap[0], [511, 511, 511]);
    assert.equal(lit(fb, 15).n, fb.width * fb.height);
  });

  test("PENCOLOR puts a color in the color map; the pen writes its slot", () => {
    run("(pencolor 'red)");
    assert.equal(run(":pennumber"), "1");
    assert.deepEqual(fb.colorMap[1], [511, 0, 0]);
    run("(forward 100)");
    assert.ok(lit(fb, 1).n > 30);
    run("(eraserdown)");
    run("(back 100)");
    assert.equal(lit(fb, 1).n, 0, "erasing writes the eraser color");
    run("(pendown)");
    assert.match(run("(xordown)"), /\?|done/i); // "XORDOWN NOT IMPLEMENTED IN COLOR TURTLE"
    assert.match(L.ttyText.join(""), /NOT IMPLEMENTED IN COLOR TURTLE/);
  });

  test("the RGB of the screen comes from the color map", () => {
    run("(cs)");
    run("(pencolor 'yellow)");
    run("(forward 100)");
    const img = fb.toRGBA();
    const at = fb.pixels.findIndex((v) => v === L.tv.pennumber);
    assert.ok(at >= 0);
    assert.deepEqual([...img.data.subarray(at * 4, at * 4 + 3)], [255, 255, 0]);
    assert.deepEqual([...img.data.subarray(0, 3)], [0, 0, 0], "the background is the eraser color, black");
  });
});

describe("PNG and windows files", () => {
  test("encodePNG writes a PNG that inflates to the picture", () => {
    const fb = new FrameBuffer();
    fb.hline(10, 5, 20);
    const png = encodePNG(fb.toRGBA({ crop: { x: 0, y: 0, width: 32, height: 8 } }));
    assert.deepEqual([...png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    assert.equal(png.readUInt32BE(16), 32);
    assert.equal(png.readUInt32BE(20), 8);
    const idatAt = png.indexOf("IDAT");
    const raw = inflateSync(png.subarray(idatAt + 4, idatAt + 4 + png.readUInt32BE(idatAt - 4)));
    assert.equal(raw.length, (32 * 3 + 1) * 8);
    assert.equal(raw[5 * 97 + 1 + 15 * 3], 255); // a lit dot on line 5
  });

  test("DUMPARRAYS: the 1976 demo windows parse", () => {
    const words = decodeItsWords(readFileSync(join(process.cwd(), "original", "3100153", "25fg.window")));
    const arrays = parseDumpArrays(words);
    assert.equal(arrays.length, 254);
    assert.equal(arrays[0].name, "25FG177-WINDOW-INFO");
    assert.equal(arrays[1].name, "25FG177-WINDOW-PICTURE");
  });
});

describe("Director's graphics", () => {
  let L;
  const run = (src) => L.print(L.evalString(src));
  before(() => {
    L = freshLisp();
    run("(load '|ken;lisp >|)");
    run("(load '|ken;load >|)");
    run("(setq :print-load-messages nil)");
    run("(director '(ani direct))");
    run("(ask something set your universe to default-universe)");
    run("(cs)"); // as in KEN;LISP: CS autoloads the turtle
  });

  test("(cs) loads the turtle through DRECT's autoload handler", () => {
    assert.ok(L.features.has("TVRTLE"));
    // KEN1;DL's director-startdisplay: the guide's screen, 550 by 200
    assert.equal(run("(tvsize)"), "(550 200)");
    assert.equal(run(":outline"), "NIL");
    assert.equal(run(":wrap"), "T");
    assert.equal(run(":seeturtle"), "NIL");
    // fancify: forward is Director's, the turtle's is logo-forward
    assert.equal(run("(car (getl 'forward '(expr subr lsubr)))"), "EXPR");
    assert.equal(run("(car (getl 'logo-forward '(expr subr lsubr)))"), "LSUBR");
    assert.equal(run("(car (getl 'fd '(expr subr lsubr)))"), "EXPR");
  });

  test("make-it-less-than-180", () => {
    assert.equal(run("(make-it-less-than-180 270.0)"), "-90.0");
    assert.equal(run("(make-it-less-than-180 -350.0)"), "10.0");
    assert.equal(run("(make-it-less-than-180 45.0)"), "45.0");
  });

  test("thingup and thingdown lift and restore whatever is down", () => {
    run("(pendown)");
    run("(thingup)");
    assert.equal(run("(list :penstate :last-thing-upped)"), "(NIL (PENDOWN))");
    run("(thingdown)");
    assert.equal(run(":penstate"), "T");
    run("(eraserdown)");
    run("(thingup)");
    assert.equal(run("(list :eraserstate :last-thing-upped)"), "(NIL (ERASERDOWN))");
    run("(thingdown)");
    assert.equal(run(":eraserstate"), "T");
    run("(pendown)");
  });

  test("how-to-get-to-center-and-scale measures a drawing without drawing it", () => {
    const before = lit(L.tvDisplay).n;
    const v = L.evalString("(how-to-get-to-center-and-scale '(draw-poly 100 90) 1.0)");
    assert.equal(lit(L.tvDisplay).n, before, "nothing drawn");
    const [move, scale] = L.toArray(v);
    assert.match(L.print(move), /^\(PROGN \(RIGHT 90\) \(BACK (49|50)\) \(LEFT 90\) \(BACK (49|50)\)\)$/);
    assert.ok(Math.abs(scale.value - 1 / Math.hypot(50, 50)) < 0.0005, `scale ${scale.value}`);
  });

  test("an OBJECT shows centered on its position and hides without a trace", () => {
    run("(cs)");
    run("(ask poly make pat)");
    run("(ask pat set your angle to 90)");
    run("(ask pat setxy 500 0)");
    run("(ask pat show)");
    const box = lit(L.tvDisplay);
    const cx = (box.minX + box.maxX) / 2;
    const cy = (box.minY + box.maxY) / 2;
    assert.ok(Math.abs(cx - L.tv.tvX(500)) <= 1.5, `centered at x ${cx}, wanted ${L.tv.tvX(500)}`);
    assert.ok(Math.abs(cy - L.tv.tvY(0)) <= 1.5, `centered at y ${cy}`);
    // size 100: the square's corners are 100 steps (about 20 dots) from its center
    assert.ok(Math.abs((box.maxX - box.minX) / 2 - 100 / Math.SQRT2 / L.tv.tvstep) <= 1.5);
    run("(ask pat hide)");
    assert.equal(lit(L.tvDisplay).n, 0);
  });

  test("the colors of TUTIL: differences, mixing, new colors", () => {
    assert.equal(run("(color-differences '(red) '(orange))"), "((0.0 256.0 0.0))");
    assert.equal(run("(mix-colors '(red) '((0.0 256.0 0.0)) 0.5)"), "(R511-G128-B0)");
    assert.equal(run("(list (get 'r511-g128-b0 'red) (get 'r511-g128-b0 'green))"), "(511 128)");
    assert.equal(run("(car :colors)"), "R511-G128-B0");
  });

  test("a TEXT actor prints in a font (FWUSE)", () => {
    run("(cs)");
    run("(defprop 25fg |ken;25fg winfon| font-autoload-file)");
    run("(ask text make label)");
    run("(ask label set your font to 25fg)");
    run("(ask label set your text to |HI|)");
    assert.equal(run("(ask label recall your length)"), "32.0");
    run("(ask label show)");
    const box = lit(L.tvDisplay);
    assert.ok(box.n > 30 && box.maxX - box.minX < 32);
    run("(ask label hide)");
    assert.equal(lit(L.tvDisplay).n, 0, "XORed off again");
  });

  test("Ken's own check, test-director (KEN;DUMP 44), runs as written", () => {
    run("(director-load 'dump)");
    run("(test-director)");
    // a pentagon grown by 200 and turned 60, a star shrunk by 200 and turned
    // back 60, in a 36-gon, filmed for 4 ticks at 2 frames a second
    assert.equal(run("(list (ask pent recall your size) (ask star recall your size))"), "(300.0 200.0)");
    assert.equal(run("(third (ask pent recall your state))"), "60.0");
    assert.equal(run("(third (ask star recall your state))"), "-60.0");
    assert.equal(run("(ask test-movie recall your frame-count)"), "4");
    assert.ok(lit(L.tvDisplay).n > 500);
  });

  test("a movie films ticks and projects them", () => {
    run("(cs)");
    run("(ask rocket make rex)");
    run("(ask rex set your speed to 100)");
    run("(ask rex show)");
    run("(ask rex plan next gradually forward 300)");
    run("(ask movie make reel)");
    assert.equal(run("(ask reel film the next 3 ticks)"), "4");
    assert.equal(run("(ask rex recall your state)"), "(0.0 300.0 0.0)");
    run("(ask reel project)");
    assert.ok(lit(L.tvDisplay).n > 0);
  });
});
