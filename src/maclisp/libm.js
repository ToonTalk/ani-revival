// The elementary functions the interpreter and the TV turtle use (sin, cos, atan, atan2,
// exp, log), written out here in JavaScript, so that Ani makes the same film in every
// JavaScript engine. A browser's Math.sin and the rest may differ from Node's in the last
// bit (Chrome 155's differ from Node 24's in about one result in thirty), and since a
// flonum is a full double here, a last bit can, a few thousand ticks later, decide a
// collision or the end of a walk: the film page then made Ken's Cinderella with SLIPS a
// different Introduction from the one Node makes. These are fdlibm's algorithms (Sun
// Microsystems' freely distributable math library, as V8 itself had ported them: e_exp.c,
// e_log.c, s_sin.c, s_cos.c, k_sin.c, k_cos.c, e_rem_pio2.c, s_atan.c, e_atan2.c), each
// checked against Node's own Math on millions of arguments (test/libm.test.js), so that
// what Node made before is what it makes now. Arguments beyond what Ani asks for (a sine
// of more than 2^19 pi/2) go to Math. And pow, for EXPT, correctly rounded and worked
// out in BigInt (at the end, with why: Node's own pow is neither fdlibm's nor correctly
// rounded, so none written out could be Node's bit for bit).
//
// The fdlibm notice, as its files carry it:
// ====================================================
// Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
//
// Developed at SunSoft, a Sun Microsystems, Inc. business.
// Permission to use, copy, modify, and distribute this
// software is freely granted, provided that this notice
// is preserved.
// ====================================================

const buf = new ArrayBuffer(8);
const f64 = new Float64Array(buf);
const u32 = new Uint32Array(buf); // little-endian: [low word, high word]
const LITTLE = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
const HI = LITTLE ? 1 : 0, LO = LITTLE ? 0 : 1;
const high = (x) => { f64[0] = x; return u32[HI] | 0; };
const low = (x) => { f64[0] = x; return u32[LO] | 0; };
const withHigh = (x, h) => { f64[0] = x; u32[HI] = h >>> 0; return f64[0]; };
const fromWords = (h, l) => { u32[HI] = h >>> 0; u32[LO] = l >>> 0; return f64[0]; };

// ---- exp (e_exp.c)
const halF = [0.5, -0.5], huge = 1.0e+300, twom1000 = 9.33263618503218878990e-302;
const oThreshold = 7.09782712893383973096e+02, uThreshold = -7.45133219101941108420e+02;
const ln2HI = [6.93147180369123816490e-01, -6.93147180369123816490e-01];
const ln2LO = [1.90821492927058770002e-10, -1.90821492927058770002e-10];
const invln2 = 1.44269504088896338700e+00;
const P1 = 1.66666666666666019037e-01, P2 = -2.77777777770155933842e-03, P3 = 6.61375632143793436117e-05, P4 = -1.65339022054652515390e-06, P5 = 4.13813679705723846039e-08;
export function exp(x) {
  let hx = high(x);
  const xsb = (hx >>> 31) & 1;
  hx &= 0x7fffffff;
  let hi = 0, lo = 0, k = 0;
  if (hx >= 0x40862e42) {
    if (hx >= 0x7ff00000) return ((hx & 0xfffff) | low(x)) !== 0 ? x + x : xsb === 0 ? x : 0.0;
    if (x > oThreshold) return huge * huge;
    if (x < uThreshold) return twom1000 * twom1000;
  }
  if (hx > 0x3fd62e42) {
    // V8's own exception, which Node's Math.exp has: exp(1) is E (the steps below would
    // get its last bit wrong)
    if (x === 1.0) return 2.718281828459045;
    if (hx < 0x3ff0a2b2) { hi = x - ln2HI[xsb]; lo = ln2LO[xsb]; k = 1 - xsb - xsb; }
    else { k = Math.trunc(invln2 * x + halF[xsb]); const t = k; hi = x - t * ln2HI[0]; lo = t * ln2LO[0]; }
    x = hi - lo;
  } else if (hx < 0x3e300000) {
    if (huge + x > 1.0) return 1.0 + x;
  } else k = 0;
  const t = x * x;
  const c = x - t * (P1 + t * (P2 + t * (P3 + t * (P4 + t * P5))));
  if (k === 0) return 1.0 - ((x * c) / (c - 2.0) - x);
  const y = 1.0 - ((lo - (x * c) / (2.0 - c)) - hi);
  if (k >= -1021) return withHigh(y, high(y) + (k << 20));
  return withHigh(y, high(y) + ((k + 1000) << 20)) * twom1000;
}

// ---- log (e_log.c)
const ln2_hi = 6.93147180369123816490e-01, ln2_lo = 1.90821492927058770002e-10, two54 = 1.80143985094819840000e+16;
const Lg1 = 6.666666666666735130e-01, Lg2 = 3.999999999940941908e-01, Lg3 = 2.857142874366239149e-01, Lg4 = 2.222219843214978396e-01, Lg5 = 1.818357216161805012e-01, Lg6 = 1.531383769920937332e-01, Lg7 = 1.479819860511658591e-01;
export function log(x) {
  let hx = high(x);
  const lx = low(x);
  let k = 0;
  if (hx < 0x00100000) {
    if (((hx & 0x7fffffff) | lx) === 0) return -Infinity;
    if (hx < 0) return NaN;
    k -= 54;
    x *= two54;
    hx = high(x);
  }
  if (hx >= 0x7ff00000) return x + x;
  k += (hx >> 20) - 1023;
  hx &= 0x000fffff;
  let i = (hx + 0x95f64) & 0x100000;
  x = withHigh(x, hx | (i ^ 0x3ff00000));
  k += i >> 20;
  const f = x - 1.0;
  if ((0x000fffff & (2 + hx)) < 3) {
    if (f === 0) { if (k === 0) return 0; const dk = k; return dk * ln2_hi + dk * ln2_lo; }
    const R = f * f * (0.5 - 0.33333333333333333 * f);
    if (k === 0) return f - R;
    const dk = k;
    return dk * ln2_hi - ((R - dk * ln2_lo) - f);
  }
  const s = f / (2.0 + f);
  const dk = k;
  const z = s * s;
  i = hx - 0x6147a;
  const w = z * z;
  const j = 0x6b851 - hx;
  const t1 = w * (Lg2 + w * (Lg4 + w * Lg6));
  const t2 = z * (Lg1 + w * (Lg3 + w * (Lg5 + w * Lg7)));
  i |= j;
  const R = t2 + t1;
  if (i > 0) {
    const hfsq = 0.5 * f * f;
    if (k === 0) return f - (hfsq - s * (hfsq + R));
    return dk * ln2_hi - ((hfsq - (s * (hfsq + R) + dk * ln2_lo)) - f);
  }
  if (k === 0) return f - s * (f - R);
  return dk * ln2_hi - ((s * (f - R) - dk * ln2_lo) - f);
}

// ---- the kernels of sin and cos (k_sin.c, k_cos.c), on [-pi/4, pi/4]
const S1 = -1.66666666666666324348e-01, S2 = 8.33333333332248946124e-03, S3 = -1.98412698298579493134e-04, S4 = 2.75573137070700676789e-06, S5 = -2.50507602534068634195e-08, S6 = 1.58969099521155010221e-10;
function kernelSin(x, y, iy) {
  const ix = high(x) & 0x7fffffff;
  if (ix < 0x3e400000 && Math.trunc(x) === 0) return x;
  const z = x * x, v = z * x;
  const r = S2 + z * (S3 + z * (S4 + z * (S5 + z * S6)));
  if (iy === 0) return x + v * (S1 + z * r);
  return x - ((z * (0.5 * y - v * r) - y) - v * S1);
}
const C1 = 4.16666666666666019037e-02, C2 = -1.38888888888741095749e-03, C3 = 2.48015872894767294178e-05, C4 = -2.75573143513906633035e-07, C5 = 2.08757232129817482790e-09, C6 = -1.13596475577881948265e-11;
function kernelCos(x, y) {
  const ix = high(x) & 0x7fffffff;
  if (ix < 0x3e400000 && Math.trunc(x) === 0) return 1.0;
  const z = x * x;
  const r = z * (C1 + z * (C2 + z * (C3 + z * (C4 + z * (C5 + z * C6)))));
  if (ix < 0x3fd33333) return 1.0 - (0.5 * z - (z * r - x * y));
  const qx = ix > 0x3fe90000 ? 0.28125 : fromWords(ix - 0x00200000, 0);
  const hz = 0.5 * z - qx, a = 1.0 - qx;
  return a - (hz - (z * r - x * y));
}

// ---- x reduced by multiples of pi/2 (e_rem_pio2.c), for |x| up to 2^19 pi/2: the
// quadrant n and the remainder y0 + y1; null beyond (Math takes those)
const invpio2 = 6.36619772367581382433e-01, pio2_1 = 1.57079632673412561417e+00, pio2_1t = 6.07710050650619224932e-11, pio2_2 = 6.07710050630396597660e-11, pio2_2t = 2.02226624879595063154e-21, pio2_3 = 2.02226624871116645580e-21, pio2_3t = 8.47842766036889956997e-32;
const npio2_hw = [0x3ff921fb, 0x400921fb, 0x4012d97c, 0x401921fb, 0x401f6a7a, 0x4022d97c, 0x4025fdbb, 0x402921fb, 0x402c463a, 0x402f6a7a, 0x4031475c, 0x4032d97c, 0x40346b9c, 0x4035fdbb, 0x40378fdb, 0x403921fb, 0x403ab41b, 0x403c463a, 0x403dd85a, 0x403f6a7a, 0x40407e4c, 0x4041475c, 0x4042106c, 0x4042d97c, 0x4043a28c, 0x40446b9c, 0x404534ac, 0x4045fdbb, 0x4046c6cb, 0x40478fdb, 0x404858eb, 0x404921fb];
const rem = [0, 0];
function remPio2(x) {
  const hx = high(x), ix = hx & 0x7fffffff;
  if (ix <= 0x3fe921fb) { rem[0] = x; rem[1] = 0; return 0; }
  if (ix < 0x4002d97c) {
    if (hx > 0) {
      let z = x - pio2_1;
      if (ix !== 0x3ff921fb) { rem[0] = z - pio2_1t; rem[1] = (z - rem[0]) - pio2_1t; }
      else { z -= pio2_2; rem[0] = z - pio2_2t; rem[1] = (z - rem[0]) - pio2_2t; }
      return 1;
    }
    let z = x + pio2_1;
    if (ix !== 0x3ff921fb) { rem[0] = z + pio2_1t; rem[1] = (z - rem[0]) + pio2_1t; }
    else { z += pio2_2; rem[0] = z + pio2_2t; rem[1] = (z - rem[0]) + pio2_2t; }
    return -1;
  }
  if (ix > 0x413921fb) return null;
  let t = Math.abs(x);
  const n = Math.trunc(t * invpio2 + 0.5);
  const fn = n;
  let r = t - fn * pio2_1;
  let w = fn * pio2_1t;
  if (n < 32 && ix !== npio2_hw[n - 1]) rem[0] = r - w;
  else {
    const j = ix >> 20;
    rem[0] = r - w;
    let i = j - ((high(rem[0]) >> 20) & 0x7ff);
    if (i > 16) {
      t = r; w = fn * pio2_2; r = t - w; w = fn * pio2_2t - ((t - r) - w); rem[0] = r - w;
      i = j - ((high(rem[0]) >> 20) & 0x7ff);
      if (i > 49) { t = r; w = fn * pio2_3; r = t - w; w = fn * pio2_3t - ((t - r) - w); rem[0] = r - w; }
    }
  }
  rem[1] = (r - rem[0]) - w;
  if (hx < 0) { rem[0] = -rem[0]; rem[1] = -rem[1]; return -n; }
  return n;
}

// ---- sin and cos (s_sin.c, s_cos.c)
export function sin(x) {
  const ix = high(x) & 0x7fffffff;
  if (ix <= 0x3fe921fb) return kernelSin(x, 0, 0);
  if (ix >= 0x7ff00000) return x - x;
  const n = remPio2(x);
  if (n === null) return Math.sin(x);
  switch (n & 3) {
    case 0: return kernelSin(rem[0], rem[1], 1);
    case 1: return kernelCos(rem[0], rem[1]);
    case 2: return -kernelSin(rem[0], rem[1], 1);
    default: return -kernelCos(rem[0], rem[1]);
  }
}
export function cos(x) {
  const ix = high(x) & 0x7fffffff;
  if (ix <= 0x3fe921fb) return kernelCos(x, 0);
  if (ix >= 0x7ff00000) return x - x;
  const n = remPio2(x);
  if (n === null) return Math.cos(x);
  switch (n & 3) {
    case 0: return kernelCos(rem[0], rem[1]);
    case 1: return -kernelSin(rem[0], rem[1], 1);
    case 2: return -kernelCos(rem[0], rem[1]);
    default: return kernelSin(rem[0], rem[1], 1);
  }
}

// ---- atan (s_atan.c) and atan2 (e_atan2.c)
const atanhi = [4.63647609000806093515e-01, 7.85398163397448278999e-01, 9.82793723247329054082e-01, 1.57079632679489655800e+00];
const atanlo = [2.26987774529616870924e-17, 3.06161699786838301793e-17, 1.39033110312309984516e-17, 6.12323399573676603587e-17];
const aT = [3.33333333333329318027e-01, -1.99999999998764832476e-01, 1.42857142725034663711e-01, -1.11111104054623557880e-01, 9.09088713343650656196e-02, -7.69187620504482999495e-02, 6.66107313738753120669e-02, -5.83357013379057348645e-02, 4.97687799461593236017e-02, -3.65315727442169155270e-02, 1.62858201153657823623e-02];
export function atan(x) {
  const hx = high(x), ix = hx & 0x7fffffff;
  let id;
  if (ix >= 0x44100000) {
    if (ix > 0x7ff00000 || (ix === 0x7ff00000 && low(x) !== 0)) return x + x;
    return hx > 0 ? atanhi[3] + atanlo[3] : -atanhi[3] - atanlo[3];
  }
  if (ix < 0x3fdc0000) {
    if (ix < 0x3e200000 && huge + x > 1.0) return x;
    id = -1;
  } else {
    x = Math.abs(x);
    if (ix < 0x3ff30000) {
      if (ix < 0x3fe60000) { id = 0; x = (2.0 * x - 1.0) / (2.0 + x); }
      else { id = 1; x = (x - 1.0) / (x + 1.0); }
    } else if (ix < 0x40038000) { id = 2; x = (x - 1.5) / (1.0 + 1.5 * x); }
    else { id = 3; x = -1.0 / x; }
  }
  const z = x * x, w = z * z;
  const s1 = z * (aT[0] + w * (aT[2] + w * (aT[4] + w * (aT[6] + w * (aT[8] + w * aT[10])))));
  const s2 = w * (aT[1] + w * (aT[3] + w * (aT[5] + w * (aT[7] + w * aT[9]))));
  if (id < 0) return x - x * (s1 + s2);
  const r = atanhi[id] - ((x * (s1 + s2) - atanlo[id]) - x);
  return hx < 0 ? -r : r;
}
const tiny = 1.0e-300, pi_o_4 = 7.8539816339744827900e-01, pi_o_2 = 1.5707963267948965580e+00, pi = 3.1415926535897931160e+00, pi_lo = 1.2246467991473531772e-16;
export function atan2(y, x) {
  const hx = high(x), lx = low(x), ix = hx & 0x7fffffff;
  const hy = high(y), ly = low(y), iy = hy & 0x7fffffff;
  if (Number.isNaN(x) || Number.isNaN(y)) return x + y;
  if (((hx - 0x3ff00000) | lx) === 0) return atan(y);
  let m = ((hy >>> 31) & 1) | ((hx >>> 30) & 2);
  if ((iy | ly) === 0) {
    switch (m) { case 0: case 1: return y; case 2: return pi + tiny; default: return -pi - tiny; }
  }
  if ((ix | lx) === 0) return hy < 0 ? -pi_o_2 - tiny : pi_o_2 + tiny;
  if (ix === 0x7ff00000) {
    if (iy === 0x7ff00000) {
      switch (m) { case 0: return pi_o_4 + tiny; case 1: return -pi_o_4 - tiny; case 2: return 3.0 * pi_o_4 + tiny; default: return -3.0 * pi_o_4 - tiny; }
    }
    switch (m) { case 0: return 0.0; case 1: return -0.0; case 2: return pi + tiny; default: return -pi - tiny; }
  }
  if (iy === 0x7ff00000) return hy < 0 ? -pi_o_2 - tiny : pi_o_2 + tiny;
  const k = (iy - ix) >> 20;
  let z;
  if (k > 60) { z = pi_o_2 + 0.5 * pi_lo; m &= 1; }
  else if (hx < 0 && k < -60) z = 0.0;
  else z = atan(Math.abs(y / x));
  switch (m) {
    case 0: return z;
    case 1: return -z;
    case 2: return pi - (z - pi_lo);
    default: return (z - pi_lo) - pi;
  }
}

// ---- pow, for EXPT (and ^ and ^$): every gradual change's growth rate is a power
// (dichar.103:110-111), and so are CHSHOW's bridges' and DISPLY's turn-cycle factor
// (disply.311:889). Node's Math.pow is neither fdlibm's (e_pow.c, written out as the
// others are, differs from it in the last bit on about one argument in thirteen) nor
// correctly rounded (on about one in two thousand, 1.5^0.25 among them, it is an ulp
// off), and a browser's need not be Node's. So this pow is the correctly rounded one,
// worked out exactly in BigInt arithmetic, which is the same in every engine: x^y as
// exp(y log x) to 320 bits, and an integer power of x as the exact integer it is, each
// rounded to the nearest double (ties to even). It is Node's own on every pow Ani asks
// for in this repository's checks (test/libm.test.js has the arguments it meets), and
// slow (some tens of microseconds), which a pow a change asks for once can afford.
// Math.pow's special values (ES 6.1.6.1.3) are kept.
const PF = 320n, PONE = 1n << PF;
const fmul = (a, b) => (a * b) >> PF;
const fdiv = (a, b) => (a << PF) / b;
function atanhSum(z) {
  let sum = 0n, term = z;
  const z2 = fmul(z, z);
  for (let k = 1n; term !== 0n; k += 2n) { sum += term / k; term = fmul(term, z2); }
  return sum;
}
let LN2F = 0n;
const ln2f = () => (LN2F || (LN2F = 2n * atanhSum(fdiv(PONE, 3n * PONE))));
const bitLength = (n) => n.toString(2).length;
// a positive finite double as [m, e], m an odd BigInt, x = m 2^e
function parts(x) {
  f64[0] = x;
  const h = u32[HI] >>> 0, l = u32[LO] >>> 0, be = (h >>> 20) & 0x7ff;
  let m = (BigInt(h & 0xfffff) << 32n) | BigInt(l), e = be === 0 ? -1074 : be - 1075;
  if (be !== 0) m |= 1n << 52n;
  while ((m & 1n) === 0n) { m >>= 1n; e++; }
  return [m, e];
}
// m 2^k exactly, for a BigInt m below 2^54 and a value a double can hold
const ldexp = (m, k) => (k < -1000 ? Number(m) * 2 ** (k + 600) * 2 ** -600 : k > 1000 ? Number(m) * 2 ** (k - 600) * 2 ** 600 : Number(m) * 2 ** k);
// m 2^k (m a positive BigInt, sticky if a part below m's last bit is not zero) rounded to
// the nearest double, ties to even
function roundToDouble(m, k, sticky = false) {
  const E = bitLength(m) - 1 + k; // m 2^k is in [2^E, 2^(E+1))
  if (E > 1023) return Infinity;
  if (E < -1075) return 0; // below half the least subnormal
  const ulp = Math.max(E - 52, -1074);
  const shift = ulp - k;
  if (shift <= 0) return ldexp(m << BigInt(-shift), ulp); // exact (sticky is nothing below)
  let q = m >> BigInt(shift);
  const rest = m - (q << BigInt(shift)), half = 1n << BigInt(shift - 1);
  if (rest > half || (rest === half && (sticky || (q & 1n) === 1n))) q += 1n;
  if (q === 0n) return 0;
  const r = ldexp(q, ulp);
  return r >= 2 ** 1023 * 2 ? Infinity : r;
}
// x^y for a positive finite x and a finite y not zero
function powPositive(x, y) {
  if (x === 1) return 1;
  const [m, e] = parts(x);
  // an integer power, exactly: of a power of two whatever the integer, of any other x up
  // to 4096 (past that m^n has some ten thousand digits, and a result in range is rare)
  if (Number.isInteger(y) && (m === 1n || Math.abs(y) <= 4096)) {
    const n = Math.abs(y), mn = m ** BigInt(n);
    if (y > 0) return roundToDouble(mn, e * n);
    // 2^(-e n) / m^n: a quotient with 128 bits more than it needs, and its remainder
    const s = BigInt(bitLength(mn) + 128);
    const q = (1n << s) / mn, rem = (1n << s) - q * mn;
    return roundToDouble(q, -e * n - Number(s), rem !== 0n);
  }
  const [ym, ye] = parts(Math.abs(y));
  let t = lnfixed(x) * ym;
  t = ye >= 0 ? t << BigInt(ye) : t >> BigInt(-ye);
  if (y < 0) t = -t;
  // t = K ln 2 + r, 0 <= r < ln 2; e^r by its series
  const L = ln2f();
  let K = t / L;
  let r = t - K * L;
  if (r < 0n) { r += L; K -= 1n; }
  if (K > 1100n) return Infinity;
  if (K < -1100n) return 0;
  let sum = PONE, term = PONE;
  for (let i = 1n; term !== 0n; i++) { term = fmul(term, r) / i; sum += term; }
  return roundToDouble(sum, Number(K) - Number(PF), true);
}
function lnfixed(x) {
  const [m, e0] = parts(x);
  const b = bitLength(m);
  const mf = m << (PF - BigInt(b - 1)); // in [1, 2)
  return 2n * atanhSum(fdiv(mf - PONE, mf + PONE)) + BigInt(e0 + b - 1) * ln2f();
}
const oddInteger = (y) => Number.isInteger(y) && Math.abs(y) < 2 ** 53 && Math.abs(y % 2) === 1;
export function pow(x, y) {
  if (Number.isNaN(y)) return NaN;
  if (y === 0) return 1;
  if (Number.isNaN(x)) return NaN;
  const ax = Math.abs(x);
  if (y === Infinity) return ax > 1 ? Infinity : ax === 1 ? NaN : 0;
  if (y === -Infinity) return ax > 1 ? 0 : ax === 1 ? NaN : Infinity;
  if (x === Infinity) return y > 0 ? Infinity : 0;
  if (x === -Infinity) return y > 0 ? (oddInteger(y) ? -Infinity : Infinity) : oddInteger(y) ? -0 : 0;
  if (x === 0) {
    const neg = Object.is(x, -0) && oddInteger(y);
    return y > 0 ? (neg ? -0 : 0) : neg ? -Infinity : Infinity;
  }
  if (x < 0) {
    if (!Number.isInteger(y)) return NaN;
    const r = powPositive(-x, y);
    return oddInteger(y) ? -r : r;
  }
  return powPositive(x, y);
}
