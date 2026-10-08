// 36-bit words from ITS-evacuate files, and MacLisp DUMPARRAYS files, for
// LLOGO's GETWINDOWS (windows and fonts saved by SAVEWINDOWS).
//
// The byte encoding is described in src/its/text.js and tools/its_words.py:
// characters are 7 bits, five to a word with bit 35 clear; a byte from 0360
// up starts a quoted word (its low 4 bits are the word's top 4 bits, the next
// four bytes the other 32). Words are returned as non-negative JavaScript
// numbers below 2^36.
//
// DUMPARRAYS (src/lspsrc/dumpar.8 in PDP-10/its): for each array, a word
// -n,,n, n words of the array's name in 7-bit characters, a word -count,,type,
// then count data words. A word of five ^C's may end the file.

const W36 = 2 ** 36;
const H18 = 2 ** 18;
const CTRL_C_WORD = 0o014060301406;

function decodeByte(b) {
  if (b === 0o12) return [0o15, 0o12];
  if (b === 0o15) return [0o12];
  if (b < 0o177) return [b];
  if (b === 0o177) return [0o177, 0o7];
  if (b === 0o207) return [0o177, 0o177];
  if (b === 0o212) return [0o177, 0o15];
  if (b === 0o215) return [0o177, 0o12];
  if (b === 0o356) return [0o15];
  if (b === 0o357) return [0o177];
  return [0o177, b - 0o200];
}

const pack = (c) => c[0] * 2 ** 29 + c[1] * 2 ** 22 + c[2] * 2 ** 15 + c[3] * 2 ** 8 + c[4] * 2;

export function decodeItsWords(bytes) {
  const words = [];
  let chars = [];
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b >= 0o360) {
      if (chars.length) {
        while (chars.length < 5) chars.push(3);
        words.push(pack(chars));
        chars = [];
      }
      if (i + 4 >= bytes.length) break;
      words.push((b & 0o17) * 2 ** 32 + (((bytes[i + 1] << 24) | (bytes[i + 2] << 16) | (bytes[i + 3] << 8) | bytes[i + 4]) >>> 0));
      i += 4;
      continue;
    }
    for (const c of decodeByte(b)) {
      chars.push(c);
      if (chars.length === 5) {
        words.push(pack(chars));
        chars = [];
      }
    }
  }
  if (chars.length) {
    while (chars.length < 5) chars.push(3);
    words.push(pack(chars));
  }
  return words;
}

export const leftHalf = (w) => Math.floor(w / H18);
export const rightHalf = (w) => w % H18;
export const signed36 = (w) => (w >= 2 ** 35 ? w - W36 : w);

function wordsToText(words) {
  let s = "";
  for (const w of words) {
    for (const shift of [29, 22, 15, 8, 1]) s += String.fromCharCode(Math.floor(w / 2 ** shift) % 128);
  }
  return s.replace(/\0+$/, "");
}

// [{ name, type, data }] from the words of a DUMPARRAYS file.
export function parseDumpArrays(words) {
  const arrays = [];
  let i = 0;
  while (i < words.length) {
    const m = words[i];
    if (m === CTRL_C_WORD) break;
    const n = rightHalf(m);
    if (n === 0 || (H18 - leftHalf(m)) % H18 !== n) throw new Error(`word ${i} is not a DUMPARRAYS header`);
    const name = wordsToText(words.slice(i + 1, i + 1 + n));
    const key = words[i + 1 + n];
    const type = rightHalf(key);
    const count = (H18 - leftHalf(key)) % H18;
    const data = words.slice(i + 2 + n, i + 2 + n + count);
    if (data.length !== count) throw new Error(`array ${name} is cut short`);
    arrays.push({ name, type, data });
    i += 2 + n + count;
  }
  return arrays;
}
