// The display hardware the TV turtle drew on, as a frame buffer.
//
// Two kinds, as at the MIT AI Lab in 1978:
//
//  - The Knight TV: black and white, 576 dots by 455 lines, one bit per dot.
//    The PDP-11 that drove it combined each word the PDP-10 stored with the
//    word already in memory, by one of sixteen boolean functions chosen in its
//    "ALU register" (LLOGO;TVRTLE calls this the DRAWMODE). The turtle uses IOR
//    to draw, ANDC to erase and XOR to flip; SET replaces whole words, which
//    is how the screen is cleared. Memory is 18 words of 32 dots per line.
//  - The color frame buffer: the same raster, four bits per dot, each dot a
//    slot in a 16-entry color map whose red, green and blue intensities run
//    from 0 to 511. Writes put the selected slot into every dot written; the
//    hardware had no XOR in color mode.
//
// Coordinates are TV coordinates: x from 0 at the left, y from 0 at the top.
// Writes outside the raster are ignored.

export const TV_WIDTH = 576;
export const TV_HEIGHT = 455;
export const WORD_BITS = 32; // dots per TV memory word
export const WORDS_PER_LINE = 18;

// The boolean functions, applied bit by bit to memory m and data d. Only
// IOR, ANDC, XOR and SET are used by the turtle; the rest follow their names.
const ALU = {
  IOR: (m, d) => m | d,
  ANDC: (m, d) => m & ~d & 1,
  XOR: (m, d) => m ^ d,
  SET: (m, d) => d,
  SETZ: () => 0,
  SETO: () => 1,
  SAME: (m) => m,
  AND: (m, d) => m & d,
  EQV: (m, d) => (m ^ d ^ 1) & 1,
  COMP: (m) => m ^ 1,
};
export const ALU_FUNCTIONS = Object.keys(ALU);

export class FrameBuffer {
  // color: false for the Knight TV, true for the color frame buffer.
  constructor({ color = false, width = TV_WIDTH, height = TV_HEIGHT } = {}) {
    this.color = color;
    this.width = width;
    this.height = height;
    this.pixels = new Uint8Array(width * height);
    this.alu = "IOR"; // Knight TV: the current drawing function
    this.selected = 0; // color: the selected color-map slot
    this.colorMap = Array.from({ length: 16 }, () => [0, 0, 0]); // 0..511 each
    this.complemented = false; // Knight TV: dark-on-light instead of light-on-dark
    this.version = 0; // bumped on every change, for renderers
    this.listeners = new Set();
  }

  get kind() {
    return this.color ? "color" : "knight";
  }

  changed() {
    this.version++;
    for (const f of this.listeners) f(this);
  }

  onChange(f) {
    this.listeners.add(f);
    return () => this.listeners.delete(f);
  }

  // ---- the drawing state the hardware kept

  setAlu(name) {
    if (!ALU[name]) throw new Error(`unknown drawing function ${name}`);
    this.alu = name;
  }

  selectColor(slot) {
    this.selected = slot & 15;
  }

  writeColorMap(slot, red, green, blue) {
    this.colorMap[slot & 15] = [red, green, blue];
    this.changed();
  }

  // ---- reading

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  read(x, y) {
    return this.inBounds(x, y) ? this.pixels[y * this.width + x] : 0;
  }

  // ---- writing

  // Write one dot as the hardware would for a word whose only data bit is it.
  plot(x, y) {
    if (!this.inBounds(x, y)) return;
    this.writeWordBits(y, Math.floor(x / WORD_BITS), 1 << (31 - (x % WORD_BITS)));
    this.changed();
  }

  // Store a 32-bit data word (bit 31 = leftmost dot) into TV memory word
  // (y, word), through the ALU. In color, the selected slot goes into each dot
  // whose data bit is 1 and the others are left alone (TVRTLE writes the
  // complement of the data into the mask register).
  writeWordBits(y, word, data) {
    if (y < 0 || y >= this.height) return;
    const base = y * this.width + word * WORD_BITS;
    if (this.color) {
      for (let b = 0; b < WORD_BITS; b++) {
        const x = word * WORD_BITS + b;
        if (x >= this.width) break;
        if ((data >>> (31 - b)) & 1) this.pixels[base + b] = this.selected;
      }
      return;
    }
    const f = ALU[this.alu];
    const wholeWord = !(this.alu === "IOR" || this.alu === "ANDC" || this.alu === "XOR");
    for (let b = 0; b < WORD_BITS; b++) {
      const x = word * WORD_BITS + b;
      if (x >= this.width) break;
      const d = (data >>> (31 - b)) & 1;
      if (!d && !wholeWord) continue;
      this.pixels[base + b] = f(this.pixels[base + b], d);
    }
  }

  // A horizontal run of dots from x0 to x1 inclusive (x0 <= x1), as TVRTLE's
  // HORIZONTAL-LINE stores it: a partial first word, whole words, a partial
  // last word.
  hline(x0, y, x1) {
    if (y < 0 || y >= this.height) return;
    if (x0 > x1) [x0, x1] = [x1, x0];
    x0 = Math.max(0, x0);
    x1 = Math.min(this.width - 1, x1);
    if (x0 > x1) return;
    const w0 = Math.floor(x0 / WORD_BITS);
    const w1 = Math.floor(x1 / WORD_BITS);
    const from = (b) => (b === 0 ? 0xffffffff : (0xffffffff >>> b)) >>> 0; // bits b..31 from the left
    const to = (b) => (0xffffffff << (31 - b)) >>> 0; // bits 0..b from the left
    if (w0 === w1) this.writeWordBits(y, w0, (from(x0 % WORD_BITS) & to(x1 % WORD_BITS)) >>> 0);
    else {
      this.writeWordBits(y, w0, from(x0 % WORD_BITS));
      for (let w = w0 + 1; w < w1; w++) this.writeWordBits(y, w, 0xffffffff);
      this.writeWordBits(y, w1, to(x1 % WORD_BITS));
    }
    this.changed();
  }

  // A vertical run of dots from y0 to y1 inclusive (TVRTLE's VERTICAL-LINE).
  vline(x, y0, y1) {
    if (x < 0 || x >= this.width) return;
    if (y0 > y1) [y0, y1] = [y1, y0];
    y0 = Math.max(0, y0);
    y1 = Math.min(this.height - 1, y1);
    const word = Math.floor(x / WORD_BITS);
    const bit = (1 << (31 - (x % WORD_BITS))) >>> 0;
    for (let y = y0; y <= y1; y++) this.writeWordBits(y, word, bit);
    this.changed();
  }

  // Fill the whole raster with a value: 0 (dark) on the Knight TV, a color-map
  // slot on the color buffer.
  fill(value = 0) {
    this.pixels.fill(value);
    this.changed();
  }

  // ---- what the viewer sees

  // The RGB triple (0..255) of a stored dot value.
  rgbOf(value) {
    if (this.color) {
      const [r, g, b] = this.colorMap[value & 15];
      return [Math.round((r * 255) / 511), Math.round((g * 255) / 511), Math.round((b * 255) / 511)];
    }
    const lit = value ? !this.complemented : this.complemented;
    return lit ? [255, 255, 255] : [0, 0, 0];
  }

  // RGBA bytes of the screen, or of a rectangle of it ({ x, y, width, height }).
  // scale: an integer magnification.
  toRGBA({ crop = null, scale = 1 } = {}) {
    const x0 = crop ? crop.x : 0;
    const y0 = crop ? crop.y : 0;
    const w = crop ? crop.width : this.width;
    const h = crop ? crop.height : this.height;
    const W = w * scale;
    const H = h * scale;
    const data = new Uint8ClampedArray(W * H * 4);
    const cache = new Map();
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const v = this.read(x0 + x, y0 + y);
        let rgb = cache.get(v);
        if (!rgb) cache.set(v, (rgb = this.rgbOf(v)));
        for (let sy = 0; sy < scale; sy++) {
          let o = ((y * scale + sy) * W + x * scale) * 4;
          for (let sx = 0; sx < scale; sx++, o += 4) {
            data[o] = rgb[0];
            data[o + 1] = rgb[1];
            data[o + 2] = rgb[2];
            data[o + 3] = 255;
          }
        }
      }
    }
    return { width: W, height: H, data };
  }

  // A compact copy of the raster and color state, for snapshots.
  snapshot() {
    return {
      color: this.color,
      width: this.width,
      height: this.height,
      pixels: this.pixels.slice(),
      colorMap: this.colorMap.map((c) => c.slice()),
      complemented: this.complemented,
    };
  }

  // Count the dots holding a value (or, with no value, the dots that are not
  // background: nonzero on the Knight TV, not equal to background in color).
  count(value = null, background = 0) {
    let n = 0;
    for (const p of this.pixels) if (value === null ? p !== background : p === value) n++;
    return n;
  }
}
