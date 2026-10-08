# The flipbook in the corners of AI-TR-540

Ken's thesis prints frames of Ani's Cinderella film in its page corners, so that flipping the pages animates them. This folder holds those frames, taken from the scan at full resolution and registered so they line up, with a contact sheet, a GIF and an MP4. `python -I tools/flipbook.py` regenerates all of it in about two minutes.

| File | What |
|---|---|
| `frames/pNNN-<corner>.png` | All 574 frames, 1-bit, at the scan's full resolution (600 dpi). The corner is `ul`, `ll`, `ur` or `lr` (upper left, lower left, upper right, lower right). Every image is 872 × 669 pixels, with the frame's rectangle at (24, 24), 824 × 621. |
| `frames.json` | Where each frame was found on its page (center, skew, scale), and how surely. |
| `contact-sheet.png` | Every frame, labeled by page and grouped by corner and scene. |
| `flipbook.gif`, `flipbook.mp4` | The whole film, all four corners in viewing order, at half size, 0.12 s per frame (8.3 fps). Each frame is labeled with its scene, corner and page. 70 seconds. |

## Where the frames are

The frames sit in the outer corners: the upper and lower left of even pages, and the upper and lower right of odd pages. Each corner holds its own sequence.

| Corner | Pages | Frames |
|---|---|---|
| Upper left | even, 4–298 | 148 |
| Lower left | even, 4–310 | 154 |
| Upper right | odd, 3–289 | 144 |
| Lower right | odd, 3–257 | 128 |

That makes 574 frames. Within its range, every page has its frame. Pages 1 and 2 have none, and the corners stop one by one near the end, so pages 291–309 (odd) and 311–323 have none either.

Each frame is a rectangle about 1.37 × 1.04 inches (824 × 621 pixels, nearly 4:3) holding outline shapes about a tenth of an inch across. Chapter II (page 62) gives the cast: "Cinderella is the star, the Prince is the triangle, the stepmother is the square, and the fairy godmother is the circle."

## Order and direction

In every corner, time runs forward as the page numbers rise, so flipping forward plays the film forward. The four sequences make one film in the order Ken gives on page 17: upper left, then lower left, upper right, and finally lower right. The joins match up:

- The upper left ends with the stepmother hitting Cinderella near the bottom, and the lower left of page 4 starts with the two in the same spot.
- The lower left ends with the three characters where the upper right picks them up.
- The upper right ends with the couple where the lower right begins.

Chapter II gives the pages for each part of the film, but it swaps left and right. For example, it puts the Introduction in "the upper right corner from page 3 to the end"; those frames are in the upper left of pages 4–298. Its page ranges are right, though. Each one holds exactly the frames of its part, on the pages of the other parity, and every sequence ends where Chapter II says. (Page 3's upper right corner and page 4's upper left are the same corner of the same leaf, seen from its two sides, which may be how the swap happened.)

## What they show

The flipbook follows Chapter II scene by scene. Each scene after the first starts with a blank frame, the cut that clears the screen: lower left 84, upper right 3, upper right 39, and lower right 97. In the table, page numbers are where the frames are printed. The ranges within scenes come from Chapter II, mapped as above, and I checked each one against the pictures.

| Scene | Frames | What happens |
|---|---|---|
| Introduction | upper left 4–298, lower left 4–82 | The square starts at the middle left with the star nearby, as Chapter II says. The stepmother pushes Cinderella around five times (up to page 212): she runs into her, they move off together, and Cinderella coasts on and gets away. A brief chase follows (216–218), then the stepmother hits her repeatedly (222–298). Lower left 4–82: the Prince rises from the bottom edge to Cinderella, still beside the stepmother. Their outlines merge into one star-like shape, and from about page 36 the two move off toward the upper left, leaving the stepmother behind. |
| Kept Apart | lower left 84–310 | After the cut, Cinderella is at the upper right and the Prince at the lower left, and she moves a little way toward him (86–90). The stepmother comes in from the right (about page 100) and stands guard between them, over and over, while the Prince wanders slowly along the bottom. By the end the three stand in a diagonal line. |
| No Longer Kept Apart | upper right 3–37 | The fairy godmother, a dotted circle around Cinderella, carries her down to the Prince while the stepmother (drawn very faintly here) stands by. |
| Meeting | upper right 39–289, lower right 3–95 | The stepmother leaves the screen (41–61). The couple, merged into one shape at the lower right, turn back and forth (65–217), then travel left across the screen (221–289). Lower right 5–37: after a cut they start in opposite corners and come together. Lower right 41–73: they travel up and to the left together. Lower right 77–95: after another cut, the Prince comes in from the right to Cinderella at the lower left. |
| Justice | lower right 97–257 | The couple meet and part at the lower left. The stepmother rises from the bottom edge, comes to stand right beside them, and slowly turns from one to the other. |

**Compared with the film** (`sources/film/frames`, one frame per second): the film has the same five scenes and similar staging, but it isn't the same run of Ani. Roughly:

- Introduction: t004–t027
- Kept Apart: t028–t056
- No Longer Kept Apart: t057–t063 (the fairy godmother is the red circle around the star)
- Meeting: t064–t100
- Justice: t101–t121

The film's Introduction is about half as long as the flipbook's; the flipbook's matches the thesis's 42 seconds. At the end of the film's Introduction the couple leave toward the upper right, not the upper left. The film's square is drawn with its diagonals, while the flipbook's square, like Figure 1.1, is a plain outline.

## Timing

The thesis (page 65) says the Introduction really took 42 seconds. It fills 188 frames, so consecutive frames are about 0.22 s of film apart, or about 4.5 per second. On page 17 Ken suggests flipping "about 4 pages per second". At that rate the whole flipbook lasts about 2 minutes 8 seconds, close to the film's two minutes of animation.

The GIF and MP4 use 0.12 s per frame (8.3 fps, the slow end of 8–12 fps), so they run about 1.8 times as fast as the film. To remake them at the film's own pace, run `python -I tools/flipbook.py --no-extract --delay 22`.

## Image quality

- **Lines are broken.** The scan is 1-bit at about 600 dpi, of a photocopy, so every line comes out as dots and dashes. Horizontal strokes suffered most: the rectangles' top and bottom edges have almost entirely vanished, and an upright square shows only its two vertical sides, like a pair of brackets (a tilted one shows all four). Even so, every character can be recognized in every frame. There are scattered specks.
- **Registration.** Each frame is located by its dotted vertical borders, which text can't imitate. It is deskewed (the scans tilt between −0.7° and +0.6°), scaled to a common size (widths vary from 821 to 832 pixels, mostly by corner), and resampled to the nearest pixel, so the PNGs stay 1-bit. Averaged over all frames, the side borders line up within about ±2 pixels and the top and bottom within about ±3.
  - In 43 frames the vertical borders stop short of a corner. Twenty-one of these are placed by the faint horizontal border. The other 22 are centered on what is there, and their vertical position is less certain; `frames.json` gives the uncertainty for each. It is ±19 pixels for upper left 272 and at most ±7 for the rest.
- **What the GIF and MP4 change.** These changes apply to the animations only, not the PNGs:
  - The margin outside the rectangle is blanked.
  - The scanned dotted border is replaced by a drawn one, since otherwise it flickers.
  - The ink is grown by one pixel so the lines read at half size.

  Nothing inside the rectangle is removed. I tried despeckling and dropped it, because the faint square's dots look just like specks.
- **Ken's PostScript copy** (`Downloads\AITR-540.ps`) is an Acrobat print of the same PDF. Its 323 page images are byte-for-byte the same CCITT G4 streams, so it adds nothing.

## Other things noticed

- No frame numbers or captions are printed in or beside the frames.
- Outside the frames there are two kinds of marks, and neither reaches inside a frame:
  - a copier smudge (two short dashes) at the same spot on every page, just right of the upper-left frames;
  - hole-punch shadows in the left margin.
