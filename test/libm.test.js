// src/maclisp/libm.js: sin, cos, atan, atan2, log and exp as fdlibm has them, which the
// interpreter and the TV turtle use instead of Math's, so that Ani makes the same film in
// every JavaScript engine (Chrome 155's Math differs from Node 24's in the last bit of
// about one result in thirty, and the film page made Ken's Cinderella with SLIPS another
// Introduction). They must be Node's own, bit for bit, so that every film Node made
// before is what it makes now: if this fails, Node's Math has changed (or the port has).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as libm from "../src/maclisp/libm.js";

const same = (a, b) => Object.is(a, b) || (Number.isNaN(a) && Number.isNaN(b));

test("each function is Node's own Math, bit for bit, on 300,000 arguments of every size Ani uses", () => {
  let seed = 1979;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const ranges = [[-1e-9, 1e-9], [-0.8, 0.8], [-4, 4], [-50, 50], [-800, 800], [-1e5, 1e5], [-8e5, 8e5]];
  const differ = [];
  for (let i = 0; i < 300000 && differ.length < 5; i++) {
    const [a, b] = ranges[i % ranges.length];
    const x = a + (b - a) * rnd(), y = a + (b - a) * rnd();
    const e = (rnd() - 0.5) * 1420, l = Math.exp((rnd() - 0.5) * 80);
    for (const [fn, args] of [["sin", [x]], ["cos", [x]], ["atan", [x]], ["atan2", [y, x]], ["exp", [e]], ["exp", [x / 1000]], ["log", [l]], ["log", [0.9 + 0.2 * rnd()]]]) {
      if (!same(libm[fn](...args), Math[fn](...args))) differ.push(`${fn}(${args.join(", ")}): ${libm[fn](...args)}, Node ${Math[fn](...args)}`);
    }
  }
  assert.deepEqual(differ, []);
});

test("and at the edges: zeros, ones, infinities, NaN, tiny and huge numbers, the quadrants' ends", () => {
  const xs = [0, -0, 1, -1, 2, 0.5, Infinity, -Infinity, NaN, Math.PI, -Math.PI, Math.PI / 2, Math.PI / 4, 3 * Math.PI / 4, 1e-310, 5e-324, 1e308, 709.7, -745.1, 710, -746, 1e-300, 1e300];
  for (const x of xs) {
    for (const fn of ["sin", "cos", "atan", "exp", "log"]) assert.ok(same(libm[fn](x), Math[fn](x)), `${fn}(${x})`);
    for (const y of xs) assert.ok(same(libm.atan2(y, x), Math.atan2(y, x)), `atan2(${y}, ${x})`);
  }
});
