// Decoding the recovered ITS files.
//
// The tape conversion stored each 36-bit PDP-10 word in 5 bytes:
//  - a word whose last bit (bit 35) is 0 is written as five 7-bit groups,
//    most significant first, so ASCII text reads as plain bytes;
//  - a word whose bit 35 is 1 is written as 0xF0 | (top 4 bits) followed by
//    the remaining 32 bits, big-endian.
// Text files also had CR LF turned into LF, which breaks 5-byte alignment,
// but a byte >= 0xF0 can only start a binary-encoded word, so those words can
// still be found and turned back into their five characters.

// The five 7-bit characters held in a 36-bit word given as hi (top 4 bits) and lo (low 32).
function charsOfWord(hi, lo) {
  // bits 0..35 as a string, most significant first
  const bits = hi.toString(2).padStart(4, "0") + (lo >>> 0).toString(2).padStart(32, "0");
  let s = "";
  for (let i = 0; i < 35; i += 7) s += String.fromCharCode(parseInt(bits.slice(i, i + 7), 2));
  return s;
}

// Decode a text file's bytes to a JS string. Returns { text, flaggedWords, anomalies }.
export function decodeItsText(bytes) {
  let out = "";
  let flaggedWords = 0;
  const anomalies = [];
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b >= 0xf0 && i + 4 < bytes.length) {
      const lo = ((bytes[i + 1] << 24) | (bytes[i + 2] << 16) | (bytes[i + 3] << 8) | bytes[i + 4]) >>> 0;
      const chars = charsOfWord(b & 0x0f, lo);
      if (!/^[\x09\x0a\x0c\x0d\x1b\x20-\x7e]*$/.test(chars)) anomalies.push({ offset: i, chars });
      out += chars;
      flaggedWords++;
      i += 4;
    } else if (b >= 0x80) {
      anomalies.push({ offset: i, byte: b });
      out += String.fromCharCode(b);
    } else {
      out += String.fromCharCode(b);
    }
  }
  // ITS pads the last word of a text file with ^C (and sometimes ^@).
  out = out.replace(/[\x03\x00]+$/, "");
  // Inside the file, CR LF was already turned into LF; drop any stray CRs before LF too.
  out = out.replace(/\r\n/g, "\n");
  return { text: out, flaggedWords, anomalies };
}
