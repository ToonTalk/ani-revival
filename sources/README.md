# Sources

Reference material for the revival. The large or regenerable parts (`pdf/`, `pages/`, `film/frames/`) are not in git; the commands below rebuild them.

| What | Where | Notes |
|---|---|---|
| Director Guide, AIM-482 (June 1978) | `pdf/AIM-482.pdf`, OCR text in `text/AIM-482.txt` | The version closest to the Ani code (February 1979). Scanned, 76 pages. |
| Director Guide, AIM-482B (December 1979) | `pdf/AIM-482b.pdf`, OCR text in `text/AIM-482b.txt` | Later revision, 104 pages; for seeing what changed. |
| Thesis, AI-TR-540 (August 1979) | `C:\Users\toont\Documents\MIT-AI-Lab\AITR-540 (1).pdf`, OCR text in `text/AITR-540.txt` | 323 pages. PDF page *n* is thesis page *n*. The OCR here, done with Windows' built-in engine, is much cleaner than the text layer in the PDF. |
| The film, "Cinderella 1978" | `G:\My Drive\Old films, videos, and animations\Cinderella 1978.mp4` | 2:36, 1080×1080, 30 fps. One frame per second in `film/frames/` (`tNNN.jpg` is second NNN−1). `film/contact-sheet.jpg` shows all of them. |

OCR text files mark each page with a line `===== pNNN`.

## Rebuilding

```bash
python -I tools/render_pages.py sources/pdf/AIM-482.pdf sources/pages/AIM-482 200
powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/winocr.ps1 <pages-folder> <out.txt>
"/c/Program Files/CEWE Creator/CEWE Creator/ffmpeg.exe" -i "<film.mp4>" -vf "fps=1,scale=360:360" -q:v 3 sources/film/frames/t%03d.jpg
```

`winocr.ps1` uses the OCR engine built into Windows and must run under Windows PowerShell 5.1 (`powershell.exe`), with Windows-style paths.
