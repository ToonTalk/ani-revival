"""Lay the cleaned 1978 narration onto Ani's revived film (the 24-frames-a-second run, in color).

Ken spoke a line as each shot of the 1978 film began, so the narration is cut into pieces at
the pauses between shots and each piece is placed where the same shot begins in our film,
keeping its distance from that shot's start. Nothing is stretched: Ken's voice keeps its own
speed, and where our shots run longer the pauses between pieces grow.

Where the shots begin, in "Cinderella 1978.mp4" (found from the blank frame Director films
before placing the characters, and from the frames where the characters jump) and in our run
(the frame counts of reports/film/24fps/*.film.json, with LEAD frames of black first, as the
1978 film has about three seconds of black under its first line):
    shot                          1978 film      ours (frames into the scene)
    the Introduction                3.13 s       frame 0
    the Prince comes in            19.4 s        frame 669 (27.88 s)
    Kept Apart                     27.13 s       frame 0
    No Longer Kept Apart           56.40 s       frame 0
    the Meeting                    61.10 s       frame 0
    the Meeting, second shot       85.57 s       frame 582 (24.25 s)
    Justice                        98.63 s       frame 0
    the titles                    119.93 s       the end of Justice
Kept Apart and No Longer Kept Apart last 29.2 and 4.7 seconds in both, and the Meeting's shots
change at 24.5 and 34.7 seconds into it in 1978, at 24.25 and 33.8 in ours. Our Introduction
runs 38.2 seconds against 24.1, so its two halves are placed separately. The last piece,
111.5-119.7 s, is a splice from a much quieter recording that ends just before the titles;
it is placed to end as long before the end of our film. Two clicks near 103 and 105 s are left out.

Usage: python -I tools/narrate-film.py [narration.wav [film.webm [frames.json [out.mp4]]]]
  narration.wav  a cleaned narration, mono 16-bit (default reports/film/narration/narration-clean.wav,
                 from bash tools/clean-narration.sh)
  film.webm      our film: LEAD black frames, the five scenes, then any held frames (default
                 reports/film/narration/ani-24fps-color.webm, from node tools/render-film-video.mjs)
  frames.json    {"lead": 75, "frames": [917, 701, 113, 1051, 458], "fps": 24, "total": 3339}
                 (default: the one render-film-video.mjs writes beside the film)
  out.mp4        default reports/film/narration/cinderella-ani-narrated.mp4
Writes out.mp4 (H.264 and AAC) and, beside it, the narration track as a .wav.
FFMPEG=<path> picks the ffmpeg (it needs libopenh264, a VP8 decoder and AAC).
"""
import json
import os
import subprocess
import sys
import wave
import numpy as np

# (start, end) of each piece in the 1978 soundtrack, the shot it belongs to, and where
# that shot begins in 1978. The cuts fall in the pauses between phrases.
PIECES = [
    (0.00, 3.00, "lead", 0.00),            # before the picture
    (3.00, 18.80, "introduction", 3.13),
    (18.80, 27.50, "prince", 19.40),
    (27.50, 56.72, "kept-apart", 27.13),   # its last phrase runs 0.06 s past the cut
    (56.72, 60.35, "no-longer-kept-apart", 56.40),
    (60.35, 84.69, "meeting", 61.10),
    (84.69, 96.72, "meeting-2", 85.57),
    (96.72, 102.00, "justice", 98.63),
    (111.50, 119.70, "ending", 119.93),    # placed by its end
]


def our_shots(lead, frames, fps):
    starts = np.cumsum([lead] + frames[:-1]) / fps
    return {
        "lead": 0.0,
        "introduction": starts[0],
        "prince": starts[0] + 669 / fps,
        "kept-apart": starts[1],
        "no-longer-kept-apart": starts[2],
        "meeting": starts[3],
        "meeting-2": starts[3] + 582 / fps,
        "justice": starts[4],
        "ending": starts[4] + frames[4] / fps,
    }


def main():
    here = "reports/film/narration/"
    args = sys.argv[1:] + [None] * 4
    src = args[0] or here + "narration-clean.wav"
    film = args[1] or here + "ani-24fps-color.webm"
    frames_json = args[2] or os.path.join(os.path.dirname(film), "frames.json")
    out = args[3] or here + "cinderella-ani-narrated.mp4"
    ffmpeg = os.environ.get("FFMPEG", "C:/Program Files/CEWE Creator/CEWE Creator/ffmpeg.exe")
    spec = json.load(open(frames_json))
    fps, lead, frames = spec.get("fps", 24), spec["lead"], spec["frames"]
    total = spec.get("total", lead + sum(frames)) / fps
    with wave.open(src) as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
    shots = our_shots(lead, frames, fps)
    track = np.zeros(int(total * sr) + sr)
    fade = int(0.03 * sr)
    ramp = np.linspace(0, 1, fade)
    print(f"{'piece':22s} {'1978':>15s}   {'ours':>15s}")
    for a, b, shot, at in PIECES:
        piece = x[int(a * sr):int(b * sr)].copy()
        piece[:fade] *= ramp
        piece[-fade:] *= ramp[::-1]
        start = shots[shot] + (a - at) if shot != "ending" else shots[shot] - (at - b) - (b - a)
        i = int(round(start * sr))
        track[i:i + len(piece)] += piece
        print(f"{shot:22s} {a:6.2f}-{b:6.2f} s   {start:6.2f}-{start + b - a:6.2f} s")
    track = track[:int(total * sr)]
    wav = out.rsplit(".", 1)[0] + ".wav"
    with wave.open(wav, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(np.clip(np.round(track * 32767), -32768, 32767).astype(np.int16).tobytes())
    subprocess.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", film, "-i", wav,
                    "-map", "0:v:0", "-map", "1:a:0", "-c:v", "libopenh264", "-b:v", "5M",
                    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-shortest",
                    "-movflags", "+faststart", out], check=True)
    print("wrote", out, "and", wav)


if __name__ == "__main__":
    main()
