"""Set our film beside the thesis's flipbook, frame by frame.

tools/run-scene.mjs --png photographs each frame Director films, as Ken's camera did, into
reports/film/<scene>/NNN.png. The flipbook in the corners of AI-TR-540 (sources/flipbook/,
from tools/flipbook.py) is the 1978 run the thesis describes. This lays each of our frames
over the flipbook frame at the same point in the scene: the flipbook's ink in black, ours in
red, so where they agree the red sits on the black.

The two are lined up at their first frame with anything drawn: each flipbook scene after
the first opens with a blank frame (the cut), and our movies number from 0, a frame before
the characters are placed.

Outputs, in reports/film/compare/:
    <scene>.mp4        every frame overlaid, at 4 frames a second, labeled
    <scene>.png        a contact sheet of every 6th overlay
    timing.txt         per scene: frames in each, and the frames where the two first and
                       last show something

Usage (run with python -I):
    python -I tools/compare-flipbook.py                 all five scenes
    python -I tools/compare-flipbook.py kept-apart      one of them
    python -I tools/compare-flipbook.py --suffix -pdp10 introduction
                                                        frames from reports/film/introduction-pdp10/
"""

import os
import subprocess
import sys

import numpy as np
import pymupdf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import flipbook as fb  # noqa: E402  (reuses its frame reading, labels and video settings)

ROOT = fb.ROOT
FILM = os.path.join(ROOT, "reports", "film")
OUT = os.path.join(FILM, "compare")

# Our scene names and the flipbook's (tools/flipbook.py SCENES).
SCENES = [
    ("introduction", "Introduction"),
    ("kept-apart", "Kept Apart"),
    ("no-longer-kept-apart", "No Longer Kept Apart"),
    ("meeting", "Meeting"),
    ("justice", "Justice"),
]
SCALE = 2            # overlay frames at half the flipbook's size
FPS = 4              # the film's rate: ANINIT filmed the scenes at 4 frames a second
SHEET_EVERY = 6


def flipbook_frames(title):
    """The flipbook's frames of a scene, in order, as (corner, page, ink)."""
    out = []
    for name, corner, first, last in fb.SCENES:
        if name != title:
            continue
        for page in range(first, last + 1):
            path = fb.frame_path(page, corner)
            if os.path.exists(path):
                out.append((corner, page, fb.read_png_1bit(path)))
    return out


SUFFIX = ""


def our_frames(scene):
    """Our frames of a scene, in order: the TV picture, True where something is drawn."""
    folder = os.path.join(FILM, scene + SUFFIX)
    names = sorted(n for n in os.listdir(folder) if n.endswith(".png"))
    frames = []
    for n in names:
        pm = pymupdf.Pixmap(os.path.join(folder, n))
        a = np.frombuffer(pm.samples, np.uint8).reshape(pm.height, pm.stride)[:, :pm.width * pm.n:pm.n]
        frames.append(a >= 128)
    return frames


def to_flipbook_rectangle(ours):
    """Our picture resampled (nearest dot) onto the flipbook's rectangle, in a flipbook-sized image."""
    h, w = ours.shape
    m = fb.MARGIN
    ys = (np.arange(fb.FRAME_H) * h // fb.FRAME_H).clip(0, h - 1)
    xs = (np.arange(fb.FRAME_W) * w // fb.FRAME_W).clip(0, w - 1)
    big = np.zeros((fb.FRAME_H + 2 * m, fb.FRAME_W + 2 * m), bool)
    big[m:m + fb.FRAME_H, m:m + fb.FRAME_W] = ours[ys][:, xs]
    return fb._dilate3(big)          # our lines are one dot wide; at 1.5 times they'd break up


def first_drawn(frames, ink_of):
    for i, f in enumerate(frames):
        if ink_of(f).sum() > 50:
            return i
    return 0


def overlay(flip_ink, our_ink, caption1, caption2):
    """White ground, the flipbook's ink black, ours red (dark red where both)."""
    m = fb.MARGIN
    keep = np.zeros((fb.FRAME_H + 2 * m, fb.FRAME_W + 2 * m), bool)  # inside the rectangle, less the scanned border
    keep[m + fb.BAND:m + fb.FRAME_H - fb.BAND, m + fb.BAND:m + fb.FRAME_W - fb.BAND] = True
    f = fb._dilate3(flip_ink[:keep.shape[0], :keep.shape[1]] & keep) if flip_ink is not None else np.zeros_like(keep)
    o = our_ink if our_ink is not None else np.zeros_like(keep)
    s = SCALE
    h, w = f.shape[0] // s * s, f.shape[1] // s * s
    fs = f[:h, :w].reshape(h // s, s, w // s, s).any(axis=(1, 3))
    os_ = o[:h, :w].reshape(h // s, s, w // s, s).any(axis=(1, 3))
    img = np.full((h // s, w // s, 3), 255, np.uint8)
    img[fs] = (0, 0, 0)
    img[os_ & ~fs] = (225, 30, 30)
    img[os_ & fs] = (120, 0, 0)
    t, l, b, r = m // s, m // s, (m + fb.FRAME_H) // s, (m + fb.FRAME_W) // s
    img[t, l:r] = img[b, l:r] = (150, 150, 150)
    img[t:b, l] = img[t:b, r] = (150, 150, 150)
    canvas = np.full((img.shape[0] + 44, img.shape[1] + img.shape[1] % 2, 3), 255, np.uint8)
    canvas[:img.shape[0], :img.shape[1]] = img
    for text, height, y, bold in ((caption1, 18, img.shape[0] + 2, True), (caption2, 16, img.shape[0] + 23, False)):
        lab = fb.label(text, height, bold=bold)
        x = (canvas.shape[1] - lab.shape[1]) // 2
        region = canvas[y:y + lab.shape[0], x:x + lab.shape[1]]
        region[:] = np.minimum(region, lab[:, :, None])
    return canvas


def write_png_rgb(path, rgb):
    pm = pymupdf.Pixmap(pymupdf.csRGB, rgb.shape[1], rgb.shape[0], np.ascontiguousarray(rgb).tobytes(), False)
    pm.save(path)


def compare(scene, title, report):
    flip = flipbook_frames(title)
    ours = our_frames(scene)
    f0 = first_drawn(flip, lambda x: x[2][fb.MARGIN + fb.BAND:-fb.MARGIN - fb.BAND, fb.MARGIN + fb.BAND:-fb.MARGIN - fb.BAND])
    o0 = first_drawn(ours, lambda x: x)
    ranges = []
    for corner, page, _ in flip:
        if ranges and ranges[-1][0] == corner:
            ranges[-1][2] = page
        else:
            ranges.append([corner, page, page])
    pages = ", ".join(f"{c} {a}-{b}" for c, a, b in ranges)
    report.append(f"{title}: flipbook {len(flip)} frames ({pages}), first drawn at {f0}; "
                  f"ours {len(ours)} frames, first drawn at {o0}")
    n = max(len(flip) - f0, len(ours) - o0)
    frames = []
    for k in range(n):
        fi, oi = f0 + k, o0 + k
        fl = flip[fi] if fi < len(flip) else None
        ou = ours[oi] if oi < len(ours) else None
        cap1 = f"{title}: ours frame {oi if ou is not None else '-'}"
        cap2 = (f"flipbook {fb.corner_name(fl[0])} corner, page {fl[1]}" if fl else "flipbook: ended") + \
               ("" if ou is not None else "   ours: ended")
        frames.append(overlay(fl[2] if fl else None, to_flipbook_rectangle(ou) if ou is not None else None, cap1, cap2))
    os.makedirs(OUT, exist_ok=True)
    # contact sheet
    pick = frames[::SHEET_EVERY]
    cols = 6
    th, tw = pick[0].shape[0] // 2, pick[0].shape[1] // 2
    rows = (len(pick) + cols - 1) // cols
    sheet = np.full((rows * (th + 6) + 6, cols * (tw + 6) + 6, 3), 235, np.uint8)
    for i, img in enumerate(pick):
        small = img[:th * 2:2, :tw * 2:2]
        y, x = 6 + (i // cols) * (th + 6), 6 + (i % cols) * (tw + 6)
        sheet[y:y + th, x:x + tw] = small
    write_png_rgb(os.path.join(OUT, f"{scene}{SUFFIX}.png"), sheet)
    # video
    h, w = frames[0].shape[:2]
    mp4 = os.path.join(OUT, f"{scene}{SUFFIX}.mp4")
    cmd = [fb.FFMPEG, "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}",
           "-framerate", str(FPS), "-i", "-"] + fb._video_codec() + ["-pix_fmt", "yuv420p", "-r", "25",
                                                                    "-movflags", "+faststart", mp4]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for img in frames + [frames[-1]] * FPS:
        proc.stdin.write(np.ascontiguousarray(img).tobytes())
    proc.stdin.close()
    if proc.wait():
        raise RuntimeError("ffmpeg failed")
    print(f"{scene}{SUFFIX}: {len(frames)} overlays -> {os.path.relpath(mp4, ROOT)}")


def main():
    global SUFFIX
    argv = sys.argv[1:]
    if "--suffix" in argv:
        i = argv.index("--suffix")
        SUFFIX = argv[i + 1]
        del argv[i:i + 2]
    wanted = argv or [s for s, _ in SCENES]
    report = []
    for scene, title in SCENES:
        if scene in wanted:
            compare(scene, title, report)
    with open(os.path.join(OUT, f"timing{SUFFIX}.txt"), "w", encoding="utf8") as f:
        f.write("\n".join(report) + "\n")
    print("\n".join(report))


if __name__ == "__main__":
    main()
