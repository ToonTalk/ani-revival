// The recorder (src/pipeline.js recorder): ANINIT films with the turtle cutting lines at
// the picture's edge, and the recorder keeps a character partly off the picture whole, so
// that the film page can draw color's nested copies whole and cut them at the edge
// (tools/check-whole-segments.mjs checks the goldens against those recorded before).
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { boot, recorder } from "../src/pipeline.js";
import { UNIT_BIT } from "../src/tv/turtle.js";
import { pictureArea } from "../src/tv/canvas.js";

test("a character partly off the picture is recorded whole; one wholly off it, not at all", () => {
  const L = boot(makeProjectFileSystem());
  const run = (src) => L.print(L.evalString(src));
  run("(cs)");
  run("(load '|ken;aninit >|)");
  run("(tvsize 550 413)");
  assert.equal(L.tv.clipMode, true); // ANINIT's asd: (clip)
  // what the turtle draws, in the recorder's picture dots
  const area = pictureArea(L.tv, 0);
  const drawn = [];
  const vector = L.tv.boundedVectorFix.bind(L.tv);
  L.tv.boundedVectorFix = (a, b, c, d) => { drawn.push([a / UNIT_BIT - area.x, b / UNIT_BIT - area.y, c / UNIT_BIT - area.x, d / UNIT_BIT - area.y]); return vector(a, b, c, d); };
  const film = recorder(L, { cast: ["cinderella", "fairy-godmother", "prince"] });
  for (const who of ["cinderella", "fairy-godmother", "prince"]) run(`(ask ${who} show)`);
  run("(click)");
  // as the frame handler draws a frame: the characters placed (in turtle units), the
  // screen wiped, and each displayed; what the turtle drew for each
  const place = (who, x, y) => run(`(ask ${who} set your position to (${x} ${y}))`);
  const display = (who) => {
    drawn.length = 0;
    run(`(ask ${who} display)`);
    return drawn.map((s) => s.map((v) => Math.round(v * 10) / 10));
  };
  place("fairy-godmother", 0.0, 0.0);
  run("(wipe)");
  const sides = display("fairy-godmother").length; // her circle, uncut
  run("(click)");
  place("prince", 900.0, 0.0); // beyond the right edge (the picture's x reaches 667), wholly
  place("fairy-godmother", 0.0, -500.0); // on the bottom edge: half off
  place("cinderella", 0.0, 0.0); // in the middle
  run("(wipe)");
  const prince = display("prince");
  const godmother = display("fairy-godmother");
  const cinderella = display("cinderella");
  run("(click)");
  const fr = film.frames[2];
  assert.equal(prince.length, 0);
  assert.deepEqual(Object.keys(fr.segs), ["fairy-godmother", "cinderella"]); // no prince: none of him reached the picture
  // Cinderella's star, wholly inside, is as the turtle drew it
  assert.deepEqual(fr.segs.cinderella, cinderella.flat());
  // the godmother's circle is whole, half of it below the picture, where the turtle drew
  // only the parts inside
  const whole = Array.from({ length: fr.segs["fairy-godmother"].length / 4 }, (_, k) => fr.segs["fairy-godmother"].slice(4 * k, 4 * k + 4));
  assert.equal(whole.length, sides);
  assert.ok(godmother.length < whole.length, `the turtle drew ${godmother.length} of its ${whole.length} sides`);
  assert.ok(whole.some(([, y0, , y1]) => y0 > 413 && y1 > 413), "some sides wholly below the picture");
  for (let k = 0; k < whole.length; k++) {
    const s = whole[k], t = whole[(k + 1) % whole.length];
    assert.deepEqual([s[2], s[3]], [t[0], t[1]], "each side starts where the last ended");
  }
  // the sides inside the picture are those the turtle drew
  const inside = whole.filter(([x0, y0, x1, y1]) => Math.max(y0, y1) < 412);
  for (const s of inside) assert.ok(godmother.some((t) => t.join() === s.join()), `${s} drawn as it is`);
  // the next frame starts afresh
  run("(click)");
  assert.deepEqual(film.frames[3].segs, {});
});
