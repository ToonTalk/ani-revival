;;; -*-lisp-*-
;;; REVIVE;MEND2: M2, none means medium.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. When Ani gives up on an element, pass 1 records none (choose.198:
;;; 61-73). In pass 2 a none value reads as medium, as INTERF already reads an element
;;; that was never set (interf.149:846). A guard on Director's weightify
;;; (interf.149:899-904) maps none, and any (not X) still left, to medium.
;;;
;;; The code goes here. Wrap Ken's functions with REVIVE;WRAP's revival-wrap, inside
;;; the +after-load of the Ken file that defines them, and leave a note with
;;; revival-note where the repair acts. Nothing here yet: the file loads and does
;;; nothing.
