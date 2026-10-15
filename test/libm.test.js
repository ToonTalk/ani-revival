// src/maclisp/libm.js: sin, cos, atan, atan2, log and exp as fdlibm has them (and pow,
// below), which the
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

// pow (EXPT): the correctly rounded power, worked out in BigInt, the same in every
// engine. Node's Math.pow is not correctly rounded (about one random argument in two
// thousand is an ulp off), so it is checked against what is exactly known: the special
// values (as Math.pow's, ES 6.1.6.1.3), correctly rounded operations (sqrt, a square, a
// reciprocal), exact integer powers, and Ani's own arguments.
test("pow: Math.pow's special values, zeros, ones, infinities and NaN, and its signs", () => {
  const xs = [0, -0, 1, -1, 2, -2, 0.5, -0.5, 3, -3, Infinity, -Infinity, NaN, 1e-310, 5e-324, 1e308, 2 ** -1074, 2 ** 1023];
  const ys = [...xs, 0.05, -0.05, 20, -20, 3.5, 5, -5, 1074, -1075, 1e300, -1e300, 2 ** 53, -(2 ** 53), 1e15];
  for (const x of xs) for (const y of ys) assert.ok(same(libm.pow(x, y), Math.pow(x, y)), `pow(${x}, ${y}): ${libm.pow(x, y)}, Math ${Math.pow(x, y)}`);
});

test("pow: correctly rounded where the answer is known exactly", () => {
  let seed = 1979;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < 3000; i++) {
    const x = Math.exp((rnd() - 0.5) * 60);
    assert.ok(same(libm.pow(x, 0.5), Math.sqrt(x)), `pow(${x}, 0.5)`);
    assert.ok(same(libm.pow(x, 2), x * x), `pow(${x}, 2)`);
    assert.ok(same(libm.pow(x, -1), 1 / x), `pow(${x}, -1)`);
  }
  // integer powers, exactly: 20^23 is 8.388608e+29 (Node's Math.pow says 8.388608000000001e+29)
  assert.equal(libm.pow(20, 23), Number(20n ** 23n));
  for (let b = 2; b <= 40; b++) for (let n = 1; n <= 40; n++) assert.equal(libm.pow(b, n), Number(BigInt(b) ** BigInt(n)), `${b}^${n}`);
  // and an irrational one, 1.5^0.25 = 1.10668191970032159240..., whose nearest double is
  // 1.1066819197003215 (Node's Math.pow says ...217)
  assert.equal(libm.pow(1.5, 0.25), 1.1066819197003215);
});

test("pow: Node's own on the powers Ani asks for, a gradual change's growth rate at every speed and frame rate", () => {
  // DICHAR's growth rate, e^(1/ticks-to-grow-e) and (1/e)^(1/ticks-to-grow-e), :e being
  // 2.718 (dichar.103:100, 110-111): ticks-to-grow-e is 5 seconds an e-fold times or over
  // the speed's weight (.5, 1, 2; S9), times the frames a second (4 or 24) and ticks a frame
  for (const fps of [4, 24]) for (const w of [0.5, 1, 2]) for (const t of [5 * w * fps, (5 / w) * fps]) {
    for (const base of [2.718, 1 / 2.718]) assert.ok(same(libm.pow(base, 1 / t), Math.pow(base, 1 / t)), `pow(${base}, 1/${t})`);
  }
  // and others the repository's checks asked for (a hook on Math.pow while they ran):
  // CHSHOW's bridges, a factor to one over its ticks (chshow.lisp), and DISPLY's
  // alternately-turn, a stretch to .3333 (disply.311:889)
  for (const [x, y] of [[0.5, 1 / 77], [0.5, 1 / 47], [0.5, 1], [2, 1 / 80], [2, 1 / 77], [2, 1 / 69], [2, 1 / 64], [2, 1 / 47], [4, 1 / 77], [4, 1],
    [0.5714285714285715, 0.3333], [0.7142857142857143, 0.3333]]) assert.ok(same(libm.pow(x, y), Math.pow(x, y)), `pow(${x}, ${y})`);
});
