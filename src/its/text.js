// Decoding the recovered ITS files.
//
// Every file in original/ is in "ITS evacuate" format: the encoding Alan
// Bawden's EVACUATE used to move ITS files to Unix, which John Wilson's itstar
// also writes. (Specification: Bawden's 1992 note, quoted in itstar's unpack.c;
// see reports/BINARY-FORMATS.md.) Each 36-bit word holds five 7-bit characters
// in bits 0-34; bit 35 is usually 0.
//
//   byte 0xF0-0xFF   a quoted word: low 4 bits are word bits 0-3, the next four
//                    bytes bits 4-35. Used for every word whose bit 35 is 1.
//   byte 0x0A (LF)   the two characters CR LF (ITS's line ending)
//   byte 0x0D (CR)   a lone LF
//   byte 0x7F        rubout, ^G
//   bytes 0x80-0xED  rubout followed by (byte - 0x80), except 0x87 rubout rubout,
//                    0x8A rubout CR, 0x8D rubout LF
//   byte 0xEE        a lone CR
//   byte 0xEF        a lone rubout
//   anything else    that character
// A file's last word is padded with ^C.

const RUBOUT = "\x7f";

// The five 7-bit characters of a word given as hi (bits 0-3) and lo (bits 4-35).
function charsOfWord(hi, lo) {
  const bits = hi.toString(2).padStart(4, "0") + (lo >>> 0).toString(2).padStart(32, "0");
  let s = "";
  for (let i = 0; i < 35; i += 7) s += String.fromCharCode(parseInt(bits.slice(i, i + 7), 2));
  return s;
}

// Decode a file's bytes to its ITS characters (CR LF line endings).
export function decodeItsChars(bytes) {
  const out = [];
  let quotedWords = 0;
  const anomalies = [];
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b >= 0xf0) {
      if (i + 4 >= bytes.length) {
        anomalies.push({ offset: i, reason: "quoted word cut short" });
        break;
      }
      const lo = ((bytes[i + 1] << 24) | (bytes[i + 2] << 16) | (bytes[i + 3] << 8) | bytes[i + 4]) >>> 0;
      const chars = charsOfWord(b & 0x0f, lo);
      if (!/^[\x09\x0a\x0c\x0d\x1b\x20-\x7e]*$/.test(chars)) anomalies.push({ offset: i, chars });
      out.push(chars);
      quotedWords++;
      i += 4;
    } else if (b === 0x0a) out.push("\r\n");
    else if (b === 0x0d) out.push("\n");
    else if (b === 0x7f) out.push(RUBOUT + "\x07");
    else if (b === 0xee) out.push("\r");
    else if (b === 0xef) out.push(RUBOUT);
    else if (b >= 0x80) {
      const c = b === 0x87 ? 0x7f : b === 0x8a ? 0x0d : b === 0x8d ? 0x0a : b - 0x80;
      out.push(RUBOUT + String.fromCharCode(c));
    } else out.push(String.fromCharCode(b));
  }
  return { chars: out.join(""), quotedWords, anomalies };
}

// Decode a text file for reading: ITS characters with CR LF turned into LF and
// the final ^C padding removed. Returns { text, flaggedWords, anomalies }, where
// flaggedWords counts words that had bit 35 set.
export function decodeItsText(bytes) {
  const { chars, quotedWords, anomalies } = decodeItsChars(bytes);
  const text = chars.replace(/[\x03\x00]+$/, "").replace(/\r\n/g, "\n");
  return { text, flaggedWords: quotedWords, anomalies };
}
