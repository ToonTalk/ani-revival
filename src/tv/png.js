// PNG files of the TV screen, for Node (uses only node:zlib and node:fs).
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  Buffer.from(data.buffer, data.byteOffset, data.length).copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

// image: { width, height, data } with RGBA bytes (FrameBuffer.toRGBA()).
// Writes an 8-bit RGB PNG and returns it as a Buffer.
export function encodePNG({ width, height, data }) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      raw[o++] = data[i];
      raw[o++] = data[i + 1];
      raw[o++] = data[i + 2];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Write a FrameBuffer (or part of it) to a PNG file. options: { crop, scale }.
export function writePNG(path, display, options = {}) {
  mkdirSync(dirname(path), { recursive: true });
  const png = encodePNG(display.toRGBA(options));
  writeFileSync(path, png);
  return png;
}

// Lay several RGBA images side by side in rows, on a background, with gaps.
export function contactSheet(images, { columns = 4, gap = 8, background = [96, 96, 96] } = {}) {
  const rows = [];
  for (let i = 0; i < images.length; i += columns) rows.push(images.slice(i, i + columns));
  const rowHeights = rows.map((r) => Math.max(...r.map((im) => im.height)));
  const width = Math.max(...rows.map((r) => r.reduce((s, im) => s + im.width, 0) + gap * (r.length + 1)));
  const height = rowHeights.reduce((s, h) => s + h, 0) + gap * (rows.length + 1);
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = background[0];
    data[i * 4 + 1] = background[1];
    data[i * 4 + 2] = background[2];
    data[i * 4 + 3] = 255;
  }
  let y = gap;
  rows.forEach((r, ri) => {
    let x = gap;
    for (const im of r) {
      for (let yy = 0; yy < im.height; yy++) {
        const src = yy * im.width * 4;
        const dst = ((y + yy) * width + x) * 4;
        data.set(im.data.subarray(src, src + im.width * 4), dst);
      }
      x += im.width + gap;
    }
    y += rowHeights[ri] + gap;
  });
  return { width, height, data };
}
