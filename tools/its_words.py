"""Decode (and re-encode) PDP-10 36-bit words stored in the "ITS evacuate" byte format.

Every file under original/ was written in this format, the one Alan Bawden's
EVACUATE server used to move ITS files to Unix, which itstar (John Wilson, 1993)
also reads and writes. Its specification is Bawden's 1992 note quoted in
itstar's unpack.c (github.com/PDP-10/itstar); the same algorithm is in Lars
Brinkhoff's libword/its-word.c ("its" word format) and in
src/bawden/evacua.53 in the PDP-10/its repository.

Decoding a byte stream into 36-bit words:

* A byte from 0360 to 0377 (octal) starts a "quoted binary word": its low 4
  bits are word bits 0-3 (the top of the word), and the next four bytes are
  bits 4-35, big-endian. The encoder writes every word whose bit 35 (the
  low-order bit) is 1 this way, so 7-bit text never needs it. Such a byte may
  appear only at a word boundary.
* Every other byte stands for one or two 7-bit characters, packed five to a
  word in the usual PDP-10 order (bits 0-6, 7-13, 14-20, 21-27, 28-34), with
  bit 35 = 0:

      byte        characters
      000-011     000-011
      012 (LF)    015 012   (ITS CR LF, so text reads as a Unix file)
      013-014     013-014
      015 (CR)    012       (a bare ITS line feed)
      016-176     016-176
      177         177 007
      200-206     177 000-006
      207         177 177
      210-211     177 010-011
      212         177 015
      213-214     177 013-014
      215         177 012
      216-355     177 016-155
      356         015       (a bare carriage return)
      357         177       (a bare rubout)

  The 177 pairs preserve Lisp Machine character-set files. A two-character
  byte can straddle a word boundary.
* If the stream ends inside a word, the word is padded with ^C (003), the
  standard ITS end-of-text filler: the encoder strips trailing ^C bytes from
  the final word.

So the format is lossless; nothing is "collapsed". CR LF pairs become one
LF byte, and a lone LF inside binary data is written as a CR byte (0x0D),
which the decoder turns back into 012. Byte counts are not multiples of 5
because of those one-byte pairs, rubout pairs, and the trimmed final word.

The one loss: when a file's final word is entirely ^C, the encoder trims all
five bytes and the word disappears. The UFD on tape 3100153 shows seven files
that are one word longer on ITS than here (newtp.71, 20fg.window, ...).

The encoder here follows itstar's pack.c exactly. Re-encoding the decoded words
reproduces 500 of the 502 files in original/ byte for byte; the other two
(3100153/newtp.71, 7006885/anima.7) are reproduced once their dropped final
^C word is put back (see `--roundtrip`).

Usage (run with python -I):
    python -I tools/its_words.py --roundtrip [FILE...]   verify decode/encode round trip
                                                         (no FILE: every file in the manifest)
    python -I tools/its_words.py --stats FILE...         escape-byte statistics
    python -I tools/its_words.py --text FILE...          exact text (rubouts and bit-35 words restored)
    python -I tools/its_words.py --dump FILE [--start N] [--count N]
                                                         octal, SIXBIT, 7-bit ASCII view
"""

import sys

WORDMASK = (1 << 36) - 1
LEFT = 0o777777000000
RIGHT = 0o777777
CTRL_C_WORD = 0o014060301406   # five ^C characters

# ---------------------------------------------------------------------------
# Decoding table: byte -> (first char, second char or None), for bytes 0-0357.

_DECODE = []
for _b in range(0o360):
    if _b == 0o12:
        _DECODE.append((0o15, 0o12))
    elif _b == 0o15:
        _DECODE.append((0o12, None))
    elif _b < 0o177:
        _DECODE.append((_b, None))
    elif _b == 0o177:
        _DECODE.append((0o177, 0o7))
    elif _b == 0o207:
        _DECODE.append((0o177, 0o177))
    elif _b == 0o212:
        _DECODE.append((0o177, 0o15))
    elif _b == 0o215:
        _DECODE.append((0o177, 0o12))
    elif _b == 0o356:
        _DECODE.append((0o15, None))
    elif _b == 0o357:
        _DECODE.append((0o177, None))
    else:  # 0200-0355 except the three above
        _DECODE.append((0o177, _b - 0o200))
_DECODE = tuple(_DECODE)

# Encoding tables, as in itstar's pack.c.
_SPEC = -1
_BASE = [c for c in range(128)]
_BASE[0o12] = 0o15        # bare LF -> CR byte
_BASE[0o15] = _SPEC       # CR: wait to see whether LF follows
_BASE[0o177] = _SPEC      # rubout: wait to see what follows
_PFX177 = [0] * 128       # rubout + c -> one byte, 0 if impossible
for _c in range(0o156):
    _PFX177[_c] = 0o200 + _c
_PFX177[0o7] = 0o177
_PFX177[0o12] = 0o215
_PFX177[0o15] = 0o212
_PFX177[0o177] = 0o207


class FormatError(ValueError):
    pass


class Decoded(list):
    """A list of 36-bit words, plus facts about how they were stored.

    padded_chars: how many ^C characters were added to complete the last word
    (0 if the file ended on a word boundary).
    stats: counts of the byte kinds met while decoding.
    """
    padded_chars = 0
    stats = None


def decode(data, pad=0o3, strict=True):
    """Decode ITS-evacuate bytes into a Decoded list of 36-bit integers.

    With strict=False, a quoted-binary byte found mid-word ends the partial
    word (padded) instead of raising FormatError; the count is in
    stats['misplaced_binary'].
    """
    words = Decoded()
    stats = {"bytes": len(data), "binary_words": 0, "crlf": 0, "bare_lf": 0,
             "bare_cr": 0, "bare_rubout": 0, "rubout_pairs": 0,
             "misplaced_binary": 0}
    chars = []
    append = words.append
    i, n = 0, len(data)
    while i < n:
        b = data[i]
        if b >= 0o360:
            if chars:
                if strict:
                    raise FormatError(f"quoted binary byte {b:o} at offset {i} inside a word")
                stats["misplaced_binary"] += 1
                chars += [pad] * (5 - len(chars))
                append(_pack(chars))
                chars = []
            if i + 5 > n:
                raise FormatError(f"file ends inside a quoted binary word at offset {i}")
            append(((b & 0o17) << 32) | int.from_bytes(data[i + 1:i + 5], "big"))
            stats["binary_words"] += 1
            i += 5
            continue
        c1, c2 = _DECODE[b]
        if b == 0o12:
            stats["crlf"] += 1
        elif b == 0o15:
            stats["bare_lf"] += 1
        elif b == 0o356:
            stats["bare_cr"] += 1
        elif b == 0o357:
            stats["bare_rubout"] += 1
        elif c1 == 0o177:
            stats["rubout_pairs"] += 1
        chars.append(c1)
        if len(chars) == 5:
            append(_pack(chars))
            chars = []
        if c2 is not None:
            chars.append(c2)
            if len(chars) == 5:
                append(_pack(chars))
                chars = []
        i += 1
    if chars:
        words.padded_chars = 5 - len(chars)
        chars += [pad] * (5 - len(chars))
        append(_pack(chars))
    words.stats = stats
    return words


def _pack(chars):
    return (chars[0] << 29) | (chars[1] << 22) | (chars[2] << 15) | (chars[3] << 8) | (chars[4] << 1)


def decode_file(path, **kw):
    with open(path, "rb") as f:
        return decode(f.read(), **kw)


def encode(words):
    """Encode 36-bit words as ITS-evacuate bytes, exactly as itstar's pack.c does."""
    out = bytearray()
    prev = 0
    word_start = 0

    def flushprev():
        nonlocal prev
        if prev == 0o15:
            out.append(0o356)
        elif prev == 0o177:
            out.append(0o357)
        prev = 0

    for w in words:
        word_start = len(out)
        if w & 1:
            flushprev()
            out += bytes(((0o360 | ((w >> 32) & 0o17)), (w >> 24) & 0xFF,
                          (w >> 16) & 0xFF, (w >> 8) & 0xFF, w & 0xFF))
            continue
        for c in chars7(w):
            if prev:
                if prev == 0o15:
                    if c == 0o12:
                        out.append(0o12)
                        prev = 0
                        continue
                elif _PFX177[c]:
                    out.append(_PFX177[c])
                    prev = 0
                    continue
                flushprev()
            d = _BASE[c]
            if d == _SPEC:
                prev = c
                continue
            out.append(d)
    flushprev()
    while len(out) > word_start and out[-1] == 0o3:
        out.pop()
    return bytes(out)


# ---------------------------------------------------------------------------
# Word helpers.

SIXBIT_CHARS = "".join(chr(0o40 + i) for i in range(64))


def chars7(w):
    """The five 7-bit characters of a word, as integers."""
    return ((w >> 29) & 0o177, (w >> 22) & 0o177, (w >> 15) & 0o177,
            (w >> 8) & 0o177, (w >> 1) & 0o177)


def ascii7(w, printable=True):
    """The word's five 7-bit characters as a string (control chars shown as ^X if printable)."""
    s = []
    for c in chars7(w):
        if not printable:
            s.append(chr(c))
        elif c < 0o40:
            s.append("^" + chr(c + 0o100))
        elif c == 0o177:
            s.append("^?")
        else:
            s.append(chr(c))
    return "".join(s)


def words_to_text(words):
    """Concatenate the 7-bit characters of words (bit 35 ignored), CR LF -> LF,
    trailing ^C/^@ padding removed."""
    s = "".join(chr(c) for w in words for c in chars7(w))
    s = s.rstrip("\x03\x00")
    return s.replace("\r\n", "\n")


def sixbit(w):
    """The word as six SIXBIT characters (trailing spaces kept)."""
    return "".join(SIXBIT_CHARS[(w >> s) & 0o77] for s in (30, 24, 18, 12, 6, 0))


def to_sixbit(s):
    s = s.upper()[:6].ljust(6)
    w = 0
    for ch in s:
        w = (w << 6) | ((ord(ch) - 0o40) & 0o77)
    return w


SQUOZE_CHARS = " 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.$%"


def squoze(w):
    """Decode the low 32 bits of a word as a six-character SQUOZE symbol."""
    v = w & 0o37777777777
    s = []
    for _ in range(6):
        v, r = divmod(v, 0o50)
        s.append(SQUOZE_CHARS[r])
    return "".join(reversed(s)).strip()


def lh(w):
    return (w >> 18) & RIGHT


def rh(w):
    return w & RIGHT


def octal(w):
    """'LLLLLL,,RRRRRR' octal halfword notation."""
    return f"{lh(w):06o},,{rh(w):06o}"


def signed(w):
    return w - (1 << 36) if w & (1 << 35) else w


def its_date(w, with_time=True):
    """Decode an ITS disk-format date word: LH = year-1900 (7 bits at 4.7-4.1),
    month (3.9-3.6), day (3.5-3.1); RH = half-seconds since midnight.
    Returns a string, or None for an empty or invalid date."""
    if w == 0 or w == WORDMASK:
        return None
    year = (w >> 27) & 0o177
    month = (w >> 23) & 0o17
    day = (w >> 18) & 0o37
    if not (1 <= month <= 12 and 1 <= day <= 31):
        return None
    s = f"{1900 + year:04d}-{month:02d}-{day:02d}"
    if with_time:
        t = rh(w)
        if t == RIGHT:
            return s
        secs = t // 2
        s += f" {secs // 3600:02d}:{(secs // 60) % 60:02d}:{secs % 60:02d}"
    return s


# ---------------------------------------------------------------------------
# File names.
#
# The on-disk names in original/ follow itstar's "weenix" convention
# (pdp10-its-disassembler/weenix.c): FN1 and FN2 are lowercased and joined with
# ".", and within a name "." -> "_", "/" -> "{", "_" -> "}", " " -> "~". The
# Windows copy additionally carries the Services-for-Macintosh private-use
# substitutes for characters NTFS forbids; only "*" -> U+F021 occurs here.

_WEENIX = {".": "_", "/": "{", "_": "}", " ": "~"}
_UNWEENIX = {v: k for k, v in _WEENIX.items()}
_SFM = {'"': "", "*": "", ":": "", "<": "", ">": "",
        "?": "", "\\": "", "|": ""}
_UNSFM = {v: k for k, v in _SFM.items()}


def ondisk_name(fn1, fn2, sfm=True):
    """ITS FN1, FN2 (strings) -> the name used under original/ (weenix + SFM).
    With sfm=False, characters NTFS forbids become "_" instead (as on tape
    3100153, where KEN;TURT* FASL is turt_.fasl)."""
    def one(s):
        s = s.rstrip(" ")
        if sfm:
            return "".join(_SFM.get(c, _WEENIX.get(c, c.lower())) for c in s)
        return "".join("_" if c in _SFM else _WEENIX.get(c, c.lower()) for c in s)
    return one(fn1) + "." + one(fn2)


def ondisk_candidates(fn1, fn2):
    a = ondisk_name(fn1, fn2)
    b = ondisk_name(fn1, fn2, sfm=False)
    return [a] if a == b else [a, b]


def its_name(ondisk):
    """On-disk name -> (FN1, FN2) as ITS would print them."""
    fn1, _, fn2 = ondisk.partition(".")

    def one(s):
        return "".join(_UNSFM.get(c, _UNWEENIX.get(c, c.upper())) for c in s)
    return one(fn1), one(fn2)


def report_name(ondisk):
    """A Windows-safe ASCII version of an on-disk name, for derived report files:
    SFM substitutes are written =XX (hex of the ITS character), e.g. anima=2A.fasl."""
    out = []
    for c in ondisk:
        if c in _UNSFM:
            out.append("=%02X" % ord(_UNSFM[c]))
        elif ord(c) > 126 or c in '<>:"/\\|?*':
            out.append("=%02X" % (ord(c) & 0xFF))
        else:
            out.append(c)
    return "".join(out)


# ---------------------------------------------------------------------------
# Command line.

def _main(argv):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    mode = argv[0]
    if mode == "--roundtrip":
        bad = dropped = 0
        if len(argv) == 1:      # no paths: every file in original/MANIFEST.json
            import json
            import os
            root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            man = json.load(open(os.path.join(root, "original", "MANIFEST.json"), encoding="utf-8"))
            argv = [mode] + [os.path.join(root, f["path"]) for f in man["files"]]
        for p in argv[1:]:
            data = open(p, "rb").read()
            try:
                words = decode(data)
            except FormatError as e:
                print(f"DECODE-ERROR {p}: {e}")
                bad += 1
                continue
            again = encode(words)
            if again != data:
                if encode(list(words) + [CTRL_C_WORD]) == data:
                    print(f"EXACT-WITH-DROPPED-^C-WORD {p}")
                    dropped += 1
                    continue
                k = next((j for j in range(min(len(again), len(data))) if again[j] != data[j]),
                         min(len(again), len(data)))
                print(f"MISMATCH {p}: {len(data)} bytes, re-encoded {len(again)}, first difference at {k}")
                bad += 1
        n = len(argv) - 1
        print(f"{n - bad - dropped} of {n} files round-trip exactly; {dropped} more do once a dropped "
              f"final ^C word is restored; {bad} mismatches")
        return 1 if bad else 0
    if mode == "--text":
        # Exact text of a file: rubout pairs and bit-35 words restored, CR LF -> LF,
        # trailing ^C/^@ padding removed. Bit 35 is ignored (it is set in a few words
        # of otherwise ordinary text files).
        for p in argv[1:]:
            sys.stdout.write(words_to_text(decode_file(p)))
        return 0
    if mode == "--stats":
        for p in argv[1:]:
            w = decode_file(p)
            st = w.stats
            print(f"{p}: {len(w)} words, last word padded with {w.padded_chars} ^C; " +
                  ", ".join(f"{k}={v}" for k, v in st.items()))
        return 0
    if mode == "--dump":
        p = argv[1]
        start, count = 0, None
        rest = argv[2:]
        while rest:
            if rest[0] == "--start":
                start = int(rest[1], 0)
            elif rest[0] == "--count":
                count = int(rest[1], 0)
            rest = rest[2:]
        w = decode_file(p)
        end = len(w) if count is None else min(len(w), start + count)
        for i in range(start, end):
            x = w[i]
            print(f"{i:6o}: {octal(x)}  {sixbit(x)!r:9} {ascii7(x)!r}")
        return 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(_main(sys.argv[1:]))
