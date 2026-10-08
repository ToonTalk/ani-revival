"""Join the frames Director filmed into one film: reports/film/cinderella.mp4.

tools/run-scene.mjs --png photographs each frame of a scene into reports/film/<scene>/NNN.png,
as Ken's camera did (ANINIT clicked it after each new frame). This plays the five scenes in
order at 4 frames a second, the rate ANINIT filmed them at, each frame doubled in size, with
a caption bar giving the scene and frame. A scene's frame 0 is the blank screen before its
characters are placed, which the thesis's flipbook also shows at each cut between scenes.

Usage (run with python -I):
    python -I tools/make-film.py              the black-and-white film (reports/film/<scene>/)
    python -I tools/make-film.py --fps 8      faster
"""

import argparse
import os
import subprocess
import sys

import numpy as np
import pymupdf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import flipbook as fb  # noqa: E402  (ffmpeg, codec choice, labels)

ROOT = fb.ROOT
FILM = os.path.join(ROOT, "reports", "film")
SCENES = [
    ("introduction", "The Introduction"),
    ("kept-apart", "Kept Apart"),
    ("no-longer-kept-apart", "No Longer Kept Apart"),
    ("meeting", "The Meeting"),
    ("justice", "Justice"),
]
BAR = 34


def read_rgb(path):
    pm = pymupdf.Pixmap(path)
    if pm.alpha:
        pm = pymupdf.Pixmap(pm, 0)
    if pm.n != 3:
        pm = pymupdf.Pixmap(pymupdf.csRGB, pm)
    return np.frombuffer(pm.samples, np.uint8).reshape(pm.height, pm.stride)[:, :pm.width * 3].reshape(pm.height, pm.width, 3)


def captioned(img, text):
    """The picture doubled (nearest dot), on an even-sized canvas with a dark caption bar."""
    big = img.repeat(2, axis=0).repeat(2, axis=1)
    h, w = big.shape[:2]
    canvas = np.zeros((h + BAR + (h + BAR) % 2, w + w % 2, 3), np.uint8)
    canvas[:h, :w] = big
    canvas[h:] = (24, 24, 32)
    lab = 255 - fb.label(text, 22)                       # white on black
    y, x = h + (BAR - lab.shape[0]) // 2, 12
    region = canvas[y:y + lab.shape[0], x:x + lab.shape[1]]
    region[:] = np.maximum(region, (lab[:, :, None] * np.array([0.85, 0.85, 0.9])).astype(np.uint8))
    return canvas


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fps", type=float, default=4.0)
    ap.add_argument("--out", default=os.path.join(FILM, "cinderella.mp4"))
    args = ap.parse_args()
    frames = []
    for scene, title in SCENES:
        folder = os.path.join(FILM, scene)
        names = sorted(n for n in os.listdir(folder) if n.endswith(".png"))
        for n in names:
            frames.append(captioned(read_rgb(os.path.join(folder, n)), f"{title}   frame {int(n[:3])}"))
        print(f"{scene}: {len(names)} frames")
    h, w = frames[0].shape[:2]
    cmd = [fb.FFMPEG, "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}",
           "-framerate", str(args.fps), "-i", "-"] + fb._video_codec() + ["-pix_fmt", "yuv420p", "-r", "24",
                                                                         "-movflags", "+faststart", args.out]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for img in frames:
        proc.stdin.write(np.ascontiguousarray(img).tobytes())
    proc.stdin.close()
    if proc.wait():
        raise RuntimeError("ffmpeg failed")
    secs = len(frames) / args.fps
    print(f"wrote {os.path.relpath(args.out, ROOT)}: {len(frames)} frames, {secs:.0f} s at {args.fps:g} fps, "
          f"{os.path.getsize(args.out) // 1024} KB")


if __name__ == "__main__":
    main()
