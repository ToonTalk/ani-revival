;;; -*-lisp-*-
;;; REVIVE;MEND1: M1, (not X) is narrowed in pass 2, not pass 1.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. (not X) is a value of Ken's own (elemnt.1:24-26, 145-146; AI-TR-540
;;; L2658-2659), so pass 1 and the CP file it writes stay as his code makes them. In
;;; pass 2, an +after-load on KEN;CP narrows each movement element's (not X) to one of
;;; the two values left, with GLOSUG's pick-value-with-variety (glosug.41:61-74) and
;;; counts rebuilt from the CP, and notes it on the choice point. With medium variety
;;; this relies on middle-element, a KEN1 reconstruction (src/director/ken1/
;;; util.lisp), and the note says so.
;;;
;;; The code goes here. Wrap Ken's functions with REVIVE;WRAP's revival-wrap, inside
;;; the +after-load of the Ken file that defines them, and leave a note with
;;; revival-note where the repair acts. Nothing here yet: the file loads and does
;;; nothing.
