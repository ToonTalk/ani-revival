# The film

Director's run of Ani's five scene programs, photographed frame by frame the way Ken's camera took them, and set beside the flipbook in the thesis's page corners.

| What | Where | In git |
|---|---|---|
| Each scene's frames, as the TV showed them at 550 × 413 dots | `<scene>/NNN.png` | no |
| The same in color, as the film was shot | `<scene>-color/NNN.png` | no |
| The five scenes in order, at 4 frames a second, with a caption bar | `cinderella.mp4`, `cinderella-color.mp4` | no |
| Kept Apart in color | `kept-apart-color.gif` | yes |
| Our frames over the flipbook's: flipbook ink black, ours red | `compare/<scene>.mp4` | no |
| Every sixth of those overlays | `compare/<scene>.png` | yes |
| Frame counts, and where each sequence starts | `compare/timing.txt` | yes |
| Ken's 1978 narration, cleaned, and our 24-frames-a-second film in color with it laid on | `narration/` | no |

## Remaking it

Each scene is planned from where Director left the characters at the end of the one before, so the five go in order. First the introduction, then for each later scene its pass 2 and its filming:

```bash
node tools/run-scene.mjs introduction --png
```

```bash
for s in kept-apart no-longer-kept-apart meeting justice; do node tools/run-pass2.mjs $s; node tools/run-scene.mjs $s --png; done
```

```bash
python -I tools/make-film.py
```

For color, film each scene again with `--color` (it reuses the programs and leaves the position files alone), then join them:

```bash
for s in introduction kept-apart no-longer-kept-apart meeting justice; do node tools/run-scene.mjs $s --color; done
```

```bash
python -I tools/make-film.py --color
```

```bash
python -I tools/compare-flipbook.py
```

The comparison needs the flipbook's frames, which `python -I tools/flipbook.py` extracts (see `sources/flipbook/README.md`).

## How the frames are taken

In 1978 `ANINIT` filmed in color: after each new frame the movie evaluated its `after-new-frame-made`, which set the TV to 550 by 413 dots, showed the frame, and called `(click)` to expose it on the camera. The January 1979 `MOVIE` that survives has no such variable, so `REVIVE;BRIDGE` has its frame handler evaluate it again. `CLICK` itself is lost; `run-scene.mjs --png` defines one that saves the TV picture. Frames are numbered as the movie numbers them. Frame 0 is the screen before the characters are placed, and the flipbook shows it at the start of every scene but the first.

In color, `ANINIT`'s `running-color` makes the characters `MANY-POLYS`: each shape is drawn again inside itself every 10 dots (20 for the star), so on the color screen it looks filled, as in the YouTube film. `POLY 29` keeps that definition only in a comment, and two `SCREEN` methods it sends ("silent running", "normal running") are in Ken's `ODIREC 2`, which nothing loads; the bridge supplies all three. The flipbook's shapes are plain outlines, so it was filmed in black and white, and our black-and-white run is the one the later scenes are planned from.

## The narration

The 1978 film ("Cinderella 1978.mp4", the transfer of Ken's 16mm print) has Ken's spoken narration. Its soundtrack carries mains hum (60.25 Hz and its harmonics), a whistle near 1,636 Hz that wanders with the film's speed, a band of noise near 800 Hz, and a clatter at 23.94 pulses a second, the film's frame rate. The narration ends near 101 seconds, and the titles from 120 s carry only noise.

```bash
bash tools/clean-narration.sh
```

notches out the hum and the whistle, then runs `tools/denoise_narration.py`, a Wiener filter whose noise estimate follows the quietest level in each band over two seconds. Speech then stands 9 to 15 dB above the pauses, against 4.6 dB before. It writes gentle, clean and strong versions to compare by ear, and the 1978 film with the clean sound.

Ken spoke a line as each shot began, so the narration can go on our film shot by shot:

```bash
node tools/render-film-video.mjs
```

```bash
python -I tools/narrate-film.py
```

The first draws our 24-frames-a-second run in color with the film page's own code (three seconds of black first, as in 1978); the second cuts the narration at the pauses between shots and places each piece where the same shot begins in ours, at Ken's own speed, and writes `narration/cinderella-ani-narrated.mp4`. Kept Apart and No Longer Kept Apart run 29.2 and 4.7 seconds in both films, and the Meeting's shots change within a second of each other; our Introduction runs 38.2 seconds against 24.1, so its lines about the Prince wait for him to come in. `narrate-film.py` lists where each shot begins in both.

