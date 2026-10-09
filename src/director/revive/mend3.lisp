;;; -*-lisp-*-
;;; REVIVE;MEND3: M3, unknown words are skipped and named.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. A word Ani doesn't know (no actor of that name) is skipped, and named
;;; in a note on the task, as ask-if-exists already passes over an unknown emotion
;;; (sugest.123:38). "If parts are missing Ani manages to go on rather than stop"
;;; (AI-TR-540 L2733-2737).
;;;
;;; The code goes here. Wrap Ken's functions with REVIVE;WRAP's revival-wrap, inside
;;; the +after-load of the Ken file that defines them, and leave a note with
;;; revival-note where the repair acts. Nothing here yet: the file loads and does
;;; nothing.
