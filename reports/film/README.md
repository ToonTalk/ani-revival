# The film

Director's run of Ani's five scene programs, photographed frame by frame the way Ken's camera took them, and set beside the flipbook in the thesis's page corners.

| What | Where | In git |
|---|---|---|
| Each scene's frames, as the TV showed them at 550 × 413 dots | `<scene>/NNN.png` | no |
| The five scenes in order, at 4 frames a second, with a caption bar | `cinderella.mp4` | no |
| Our frames over the flipbook's: flipbook ink black, ours red | `compare/<scene>.mp4` | no |
| Every sixth of those overlays | `compare/<scene>.png` | yes |
| Frame counts, and where each sequence starts | `compare/timing.txt` | yes |

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

```bash
python -I tools/compare-flipbook.py
```

The comparison needs the flipbook's frames, which `python -I tools/flipbook.py` extracts (see `sources/flipbook/README.md`).

## How the frames are taken

In 1978 `ANINIT` filmed in color: after each new frame the movie evaluated its `after-new-frame-made`, which set the TV to 550 by 413 dots, showed the frame, and called `(click)` to expose it on the camera. The January 1979 `MOVIE` that survives has no such variable, so `REVIVE;BRIDGE` has its frame handler evaluate it again. `CLICK` itself is lost; `run-scene.mjs --png` defines one that saves the TV picture. Frames are numbered as the movie numbers them. Frame 0 is the screen before the characters are placed, and the flipbook shows it at the start of every scene but the first.
