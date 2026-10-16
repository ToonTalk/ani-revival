# Sources

Reference material for the revival. The large or regenerable parts (`pdf/`, `pages/`, `film/frames/`) are not in git; the commands below rebuild them.

| What | Where | Notes |
|---|---|---|
| Director Guide, AIM-482 (June 1978) | `pdf/AIM-482.pdf`, OCR text in `text/AIM-482.txt` | The version closest to the Ani code (February 1979). Scanned, 76 pages. |
| Director Guide, AIM-482B (December 1979) | `pdf/AIM-482b.pdf`, OCR text in `text/AIM-482b.txt` | Later revision, 104 pages; for seeing what changed. |
| Thesis, AI-TR-540 (August 1979) | `C:\Users\toont\Documents\MIT-AI-Lab\AITR-540 (1).pdf`, OCR text in `text/AITR-540.txt` | 323 pages. PDF page *n* is thesis page *n*. The OCR here, done with Windows' built-in engine, is much cleaner than the text layer in the PDF. |
| Ken's paper "Three Interactions between AI and Education", *Machine Intelligence 8* (1977), pp. 422–428 | `pdf/kahn-1977-three-interactions-MI8.pdf` (Ken's copy: https://drive.google.com/file/d/1_C_ZzwWCpTOa3Zp8UHAKFuVUA2JxeSSX/view), OCR text in `text/kahn-1977-three-interactions-MI8.txt` | 8 pages, scanned. PDF page 7 (p. 428), "An Intelligent Animation System", is the 1977 proposal that led to Ani: a child tells a "Peanuts" story, the system makes a cartoon, the child asks for changes and can modify the system's knowledge. |
| The film, "Cinderella 1978" | `G:\My Drive\Old films, videos, and animations\Cinderella 1978.mp4` | 2:36, 1080×1080, 30 fps. One frame per second in `film/frames/` (`tNNN.jpg` is second NNN−1). `film/contact-sheet.jpg` shows all of them. |
| The thesis's flipbook | `flipbook/` (see its README) | All 574 frames printed in AI-TR-540's page corners, registered: one complete run of the film, not the same run as the surviving film. `contact-sheet.png`, `flipbook.gif` and `frames.json` are in git; `frames/` and `flipbook.mp4` are rebuilt by `python -I tools/flipbook.py`. |

OCR text files mark each page with a line `===== pNNN`.

## Rebuilding

```bash
python -I tools/render_pages.py sources/pdf/AIM-482.pdf sources/pages/AIM-482 200
powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/winocr.ps1 <pages-folder> <out.txt>
"/c/Program Files/CEWE Creator/CEWE Creator/ffmpeg.exe" -i "<film.mp4>" -vf "fps=1,scale=360:360" -q:v 3 sources/film/frames/t%03d.jpg
```

`winocr.ps1` uses the OCR engine built into Windows and must run under Windows PowerShell 5.1 (`powershell.exe`), with Windows-style paths.
