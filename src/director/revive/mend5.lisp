;;; -*-lisp-*-
;;; REVIVE;MEND5: M5, missing display methods, and move-to.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. A suggested display method that doesn't exist is rejected with the
;;; reason no-such-display-method, as an unconveyable convey method is (sugcon.26:
;;; 69-74); variety-score asked the missing actor regardless (chomet.123:436-439).
;;; And CONVEY suggests move-to for (meets a b) (convey.64:73-80), which DISPLY never
;;; defines: it is defined here from DISPLY's own parts, with a time estimate that
;;; includes any walk onto the stage (AI-TR-540 L2392-2396).
;;;
;;; The code goes here. Wrap Ken's functions with REVIVE;WRAP's revival-wrap, inside
;;; the +after-load of the Ken file that defines them, and leave a note with
;;; revival-note where the repair acts. Nothing here yet: the file loads and does
;;; nothing.
