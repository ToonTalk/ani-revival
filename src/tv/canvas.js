// Showing a FrameBuffer on an HTML canvas, in the browser.
//
//   import { attachCanvas } from "../src/tv/canvas.js";
//   const detach = attachCanvas(display, document.querySelector("canvas"), { scale: 2 });
//
// The canvas is redrawn at most once per animation frame after the display
// changes. options: { scale (integer), crop ({ x, y, width, height } or a
// function returning one, e.g. the turtle's picture area) }.

export function attachCanvas(display, canvas, { scale = 1, crop = null } = {}) {
  const ctx = canvas.getContext("2d");
  let pending = false;
  let lastVersion = -1;
  const area = () => (typeof crop === "function" ? crop() : crop);
  function paint() {
    pending = false;
    if (display.version === lastVersion) return;
    lastVersion = display.version;
    const img = display.toRGBA({ crop: area(), scale });
    if (canvas.width !== img.width || canvas.height !== img.height) {
      canvas.width = img.width;
      canvas.height = img.height;
    }
    ctx.putImageData(new ImageData(img.data, img.width, img.height), 0, 0);
  }
  const schedule = () => {
    if (pending) return;
    pending = true;
    (globalThis.requestAnimationFrame || ((f) => setTimeout(f, 16)))(paint);
  };
  const off = display.onChange(schedule);
  lastVersion = -1;
  schedule();
  return () => off();
}

// The rectangle of the screen holding the turtle's picture area, with its
// outline: a crop for attachCanvas or FrameBuffer.toRGBA.
export function pictureArea(turtle, margin = 3) {
  return {
    x: Math.max(0, turtle.pictureLeft - margin),
    y: Math.max(0, turtle.pictureTop - margin),
    width: Math.min(turtle.display.width, turtle.pictureRight + margin + 1) - Math.max(0, turtle.pictureLeft - margin),
    height: Math.min(turtle.display.height, turtle.pictureBottom + margin + 1) - Math.max(0, turtle.pictureTop - margin),
  };
}
