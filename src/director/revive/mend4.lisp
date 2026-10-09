;;; -*-lisp-*-
;;; REVIVE;MEND4: M4, a missing relationship.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. An exists? guard in PREREQ's meet-description-of, which asks
;;; (relationship-of a b) without checking that it exists (prereq.19:57-60, 110-120),
;;; so the answer is "don't know", as enemy-of and stranger-of already guard
;;; (sugest.123:352-353, 385-394). Its notes go on the task whose suggestion is being
;;; bound, once each: likes asks four times (prereq.19:115-118).
;;;
;;; The code goes here. Wrap Ken's functions with REVIVE;WRAP's revival-wrap, inside
;;; the +after-load of the Ken file that defines them, and leave a note with
;;; revival-note where the repair acts. Nothing here yet: the file loads and does
;;; nothing.
