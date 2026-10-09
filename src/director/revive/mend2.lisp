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
;;; Why it is needed. With no suggestion for an element, pass 1 records the value
;;; none, strength none, source given-up (choose.198:69-73), and Ken meant it: the
;;; global suggestions have no last-ditch default for "typical speed" (choose.198:
;;; 290-294). Pass 2 hands the value on to the special dynamics (char.2:63-68,
;;; scene.9:265-275), and the first time estimate stops in weightify, which knows only
;;; low, short, medium, long and high (interf.149:899-904). Director would stop there
;;; too. INTERF itself reads an element no one set as medium, (or (ask :self recall
;;; your ,variable) 'medium) (interf.149:846): giving up is moving as usual.
;;;
;;; Two parts:
;;;  - After RUN loads the choices of pass 1 (run.65:44-45), each normal movement
;;;    element's none becomes medium on its choice point, which notes
;;;      (revival-repair: what gave-up was none now medium
;;;			   because (interf reads an unset element as medium))
;;;    The CP file keeps Ani's none; only pass 2's copy of the choice changes, before
;;;    the scene asks for it. The choice point changes, not only what weightify
;;;    reads, because pass 2 also reads choices themselves, as faster's prerequisite
;;;    compares two speeds (prereq.19:31-38), and the special dynamics it saves in
;;;    the program Director runs carry them (run.65:113-117).
;;;  - weightify, wherever INTERF loads (pass 2 and Director), reads none, and a
;;;    (not X) that REVIVE;MEND1 didn't narrow, as medium, where Ken's would stop
;;;    (shouldnt-happen, interf.149:903-904). It notes what it read on :self, the
;;;    actor whose method asked (a special dynamics, a subscene), if there is one:
;;;      (revival-repair: what read-as-medium was none now medium
;;;			   because (weightify knows only low short medium long and high))
;;;    Every value weightify could read before it reads as before. After MEND1 and
;;;    the part above, no none or (not X) of pass 1's choices reaches it; the guard
;;;    is the last resort. (For (not medium), medium is not one of the two values left, but
;;;    its weight, 1.0, is the geometric mean of theirs, low's .5 and high's 2.0;
;;;    weights multiply, interf.149:846-847.)
;;; Cinderella's CP 29 has no none, and every value her run weighs is one weightify
;;; knows, so in her run this does nothing but read each choice.

;; In pass 2, a normal movement element given up on reads as medium.
(defun read-given-up-values-as-medium ()
  (and (actor-of 'absolute-choice-point dont-autoload)
       (mapc (function
	      (lambda (choice-point)
		      (cond ((and (eq (ask ,choice-point recall your current-choice) 'none)
				  (let ((element-name (ask ,choice-point recall your element-name)))
				       (ask ,element-name are you a normal-movement-element)))
			     (ask ,choice-point set your current-choice to medium)
			     (revival-note choice-point 'gave-up 'none 'medium
					   '(interf reads an unset element as medium))))))
	     ;;newest first, so reversed into the CP's order
	     (reverse (ask absolute-choice-point recall your offspring)))))

(+after-load '|ken;cp >| '(read-given-up-values-as-medium))

;; weightify reading none, or a (not X) left, as medium.
(defun weightify-reading-none-as-medium (value)
  (funcall (revival-wrapped 'weightify 'mend2)
	   (cond ((or (eq value 'none)
		      (and (not (atom value)) (eq (first value) 'not)))
		  (and (boundp ':self)
		       (actor-of :self dont-autoload)
		       (revival-note :self 'read-as-medium value 'medium
				     '(weightify knows only low short medium long and high)))
		  'medium)
		 (t value))))

(+after-load '|ken;interf >|
  '(revival-wrap 'weightify 'mend2 'weightify-reading-none-as-medium))
