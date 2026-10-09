;;; -*-lisp-*-
;;; REVIVE;MEND7: M7, COSUG's combine for change suggestions.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. COSUG's combine for two change: suggestions on one element reads the
;;; old 'display key (cosug.215:449-477) and calls shouldnt-happen; the change-to:
;;; combine merges into a nil value (cosug.215:499-520). Under today's
;;; (method: type display-value-change value (change: ...)) the repair reads
;;; (get (get s 'value) 'value) when that key is absent. Cinderella never reaches this
;;; code; every new feeling that shares an element with joy does.
;;;
;;; The code goes here. Wrap Ken's functions with REVIVE;WRAP's revival-wrap, inside
;;; the +after-load of the Ken file that defines them, and leave a note with
;;; revival-note where the repair acts. Nothing here yet: the file loads and does
;;; nothing.
